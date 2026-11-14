window.TOPICS = window.TOPICS || [];
window.TOPICS.push({
  "id": "30-fastapi-dependencies",
  "order": 30,
  "title": "Dependency Injection",
  "version": "Python 3.15.2 + uv 0.13.7 + FastAPI 0.162.5",
  "summary": "Learn how FastAPI's Depends lets you write a small function once (pagination, meaning splitting a long list into pages, a database connection, a security check) and have the framework call it and hand you the result. You will write dependencies with yield for setup and cleanup, chain dependencies together, and attach checks to a whole route or app without needing their value.",
  "prerequisites": ["17-iterators-generators", "29-fastapi-requests-responses"],
  "subtopics": [
    {
      "id": "what-depends-does",
      "title": "What Depends does",
      "explanation": "A dependency is an ordinary function that FastAPI calls for you before it runs your endpoint function. Whatever the dependency returns is passed into the endpoint as an argument. Dependency injection is the name for this idea: you declare what you need, and the framework (the library that runs your app and calls your code at the right moments) provides it, instead of your endpoint fetching it itself.\n\nYou declare a dependency with `Depends` from the `fastapi` package, inside `Annotated` (which you met in topic 29). The first part of `Annotated` is the type of the value you receive; the second part is `Depends(function)`. You pass the function itself, with no parentheses, because FastAPI is the one who calls it.\n\nThe dependency's own parameters are read from the request exactly like an endpoint's parameters. In the example below, `skip` and `limit` are query parameters (the `?limit=2` part of a URL), with defaults of 0 and 10. So `/items/?limit=2` gives the endpoint `{\"skip\": 0, \"limit\": 2}`.\n\nWriting `Annotated[dict[str, int], Depends(pagination)]` on every endpoint is long. Give it a name once with a plain assignment, `Pagination = Annotated[...]`. A name that stands for another name like this is called an alias. Then use `page: Pagination` anywhere. Use plain assignment for these aliases, not the `type X = ...` statement from topic 10, because FastAPI's documentation uses plain assignment for dependencies.\n\nTo try it, save the code as `main.py` in the project folder from topic 28 (the one where you added `fastapi[standard]`). Open a terminal in that folder and start the server with `uv run fastapi dev main.py`. Then open the URL in a browser, use the `/docs` page, or use `curl` (a command-line tool that sends HTTP requests) in a second terminal.\n\nFastAPI also remembers (caches) a dependency's result during one request. If the same dependency is needed twice in the same request, it is called only once and both places receive the same value. The second example shows this: the function `counter` is listed twice, but it runs once, so both `a` and `b` are 1. A new request calls it again.",
      "analogy": "A surgeon asks for an instrument and the assistant hands over the right one. The surgeon does not walk to the cabinet and search. The endpoint is the surgeon, the dependency is the assistant, and FastAPI is the operating room that makes sure the assistant is there. If the surgeon asks for the same instrument twice during one operation, the assistant just points at the one already on the tray (the per-request cache).",
      "code": [
        {
          "language": "python",
          "filename": "main.py",
          "source": "from typing import Annotated\n\nfrom fastapi import Depends, FastAPI\n\napp = FastAPI()\n\n\ndef pagination(skip: int = 0, limit: int = 10) -> dict[str, int]:\n    return {\"skip\": skip, \"limit\": limit}\n\n\nPagination = Annotated[dict[str, int], Depends(pagination)]\n\n\n@app.get(\"/items/\")\ndef list_items(page: Pagination) -> dict[str, int]:\n    return page\n\n\n@app.get(\"/users/\")\ndef list_users(page: Pagination) -> dict[str, int]:\n    return page\n",
          "output": "GET /items/?limit=2  ->  200  {\"skip\":0,\"limit\":2}\nGET /users/?skip=4   ->  200  {\"skip\":4,\"limit\":10}",
          "explanation": "`pagination` is the dependency. Both endpoints ask for `page: Pagination` and receive the dictionary it returns. The query parameters `skip` and `limit` belong to the dependency but still come from the URL. One definition now serves two endpoints."
        },
        {
          "language": "python",
          "filename": "main.py",
          "source": "from typing import Annotated\n\nfrom fastapi import Depends, FastAPI\n\napp = FastAPI()\n\ncalls: list[str] = []\n\n\ndef counter() -> int:\n    calls.append(\"called\")\n    return len(calls)\n\n\n@app.get(\"/twice\")\ndef twice(\n    a: Annotated[int, Depends(counter)],\n    b: Annotated[int, Depends(counter)],\n) -> dict[str, int]:\n    return {\"a\": a, \"b\": b}\n",
          "output": "GET /twice  ->  200  {\"a\":1,\"b\":1}   (on a freshly started server)",
          "explanation": "`counter` appears twice but runs once for this request, so `calls` has one item and both values are 1. This is the per-request cache."
        },
        {
          "language": "bash",
          "filename": "terminal",
          "source": "uv run fastapi dev main.py",
          "output": "FastAPI   Starting development server\n...\nServer started at http://127.0.0.1:8000",
          "explanation": "Run this from the folder that contains `main.py`. Then request `http://127.0.0.1:8000/items/?limit=2` in a browser or with curl."
        }
      ],
      "productionNote": "Real apps use dependencies for the database session (topic 31), the current logged-in user (topic 33), application settings, pagination parameters and permission checks. Because endpoints only declare what they need, tests can later swap a dependency for a fake one (topic 34).",
      "commonMistakes": [
        "Writing `Depends(pagination())`. The parentheses call the function yourself, once, at import time, and pass its result. Write `Depends(pagination)` and let FastAPI call it for each request.",
        "Defining the alias with the `type Pagination = ...` statement. For dependency aliases, use a plain assignment: `Pagination = Annotated[...]`.",
        "Assuming the dependency is called again for every place it is used. Within one request, FastAPI calls it once and reuses the result."
      ],
      "sources": [
        { "title": "FastAPI: Dependencies", "url": "https://fastapi.tiangolo.com/tutorial/dependencies/" },
        { "title": "FastAPI: Share Annotated dependencies", "url": "https://fastapi.tiangolo.com/tutorial/dependencies/#share-annotated-dependencies" }
      ]
    },
    {
      "id": "dependencies-with-yield",
      "title": "Dependencies with yield",
      "explanation": "Some resources must be opened before the endpoint runs and closed after it finishes: a database connection, a file, or a lock (a tool that stops two parts of a program from using the same thing at once). A dependency can do this by being a generator function (topic 17), a function that uses `yield` instead of `return`.\n\nCode before the `yield` runs first, before the endpoint. The yielded value is what the endpoint receives. Code after the `yield` runs once the endpoint has finished, which makes it the place for cleanup.\n\nWrap the `yield` in `try` and `finally` (topic 11). The `finally` block runs even if the endpoint raises an error, so the cleanup is never skipped. Without `try/finally`, an error in the endpoint would be raised at the `yield`, and the lines after it would not run.\n\nUse exactly one `yield` in the dependency. In the example, the list `events` records what happened. After a request to `/use`, a request to `/events` shows `[\"open\", \"close\"]`: the resource was opened, handed to the endpoint, then closed.\n\nA caution about the timing: do not rely on the cleanup having run before the client sees the response. It runs after the response has been sent, which is why the next request already sees `close` in the list.",
      "analogy": "Borrowing a library book. The librarian hands you the book (the `yield`). You read it, which is your endpoint running. When you are done, the book is checked back in automatically, even if you tore a page and left in a hurry (the `finally`).",
      "code": [
        {
          "language": "python",
          "filename": "main.py",
          "source": "from collections.abc import Generator\nfrom typing import Annotated\n\nfrom fastapi import Depends, FastAPI\n\napp = FastAPI()\n\nevents: list[str] = []\n\n\ndef get_resource() -> Generator[str]:\n    events.append(\"open\")\n    try:\n        yield \"resource\"\n    finally:\n        events.append(\"close\")\n\n\n@app.get(\"/use\")\ndef use(res: Annotated[str, Depends(get_resource)]) -> dict[str, str]:\n    return {\"got\": res}\n\n\n@app.get(\"/events\")\ndef read_events() -> list[str]:\n    return events\n",
          "output": "GET /use     ->  200  {\"got\":\"resource\"}\nGET /events  ->  200  [\"open\",\"close\"]   (on a freshly started server, requested in this order)",
          "explanation": "`open` is recorded before the endpoint runs, the endpoint receives the string \"resource\", and `close` is recorded afterwards by the `finally` block. `Generator[str]` is the return type of a generator that yields strings (`collections.abc` was introduced in topic 10)."
        }
      ],
      "productionNote": "The classic use is a database session: open it, yield it to the endpoint, and close it afterwards so connections are not leaked (you will build this in topic 31). The same pattern fits acquiring and releasing a lock, or opening and closing a temporary file.",
      "commonMistakes": [
        "Writing the cleanup after `yield` without `try/finally`. If the endpoint raises an error, the cleanup is skipped and the resource leaks.",
        "Using more than one `yield` in a dependency. A dependency must yield exactly once.",
        "Using `return` instead of `yield` and expecting the code after it to run. Nothing after a `return` runs."
      ],
      "sources": [
        { "title": "FastAPI: Dependencies with yield", "url": "https://fastapi.tiangolo.com/tutorial/dependencies/dependencies-with-yield/" }
      ]
    },
    {
      "id": "sub-dependencies",
      "title": "Sub-dependencies",
      "explanation": "A dependency can itself depend on other dependencies by using `Depends` in its own parameters. FastAPI works out the whole chain: it calls the innermost function first and passes each result along to the next. These nested ones are called sub-dependencies.\n\nThis example also reads a header. A header is a named piece of extra information sent with an HTTP request (topic 26), such as `X-Token: secret`. `Header()` from `fastapi` tells FastAPI to read a parameter from the headers, in the same way `Query()` reads from the query string.\n\nHeader names use hyphens, but Python names cannot. FastAPI converts for you: the parameter `x_token` reads the header `X-Token` (underscores become hyphens, and header names are not case-sensitive). The header is not read as a literal `x_token`.\n\nThe type `str | None` with a default of `None` makes the header optional. A dependency can raise `HTTPException` (topic 29), which stops the request at once and sends that error. Here `get_token` raises a 401 if the token is wrong, so `get_user` and the endpoint never run.\n\nThe chain is: `me` needs `get_user`, which needs `get_token`, which needs the header. Keeping the check in one dependency means no endpoint repeats the authentication logic.",
      "analogy": "Entering a secure building. The guard at the door checks your badge (`get_token`). If it is valid, the badge office looks up who you are (`get_user`). Only then are you let in to the room you wanted (the endpoint). Each step relies on the one before it, and a failure at any step stops you there.",
      "code": [
        {
          "language": "python",
          "filename": "main.py",
          "source": "from typing import Annotated\n\nfrom fastapi import Depends, FastAPI, Header, HTTPException\n\napp = FastAPI()\n\n\ndef get_token(x_token: Annotated[str | None, Header()] = None) -> str:\n    if x_token != \"secret\":\n        raise HTTPException(status_code=401, detail=\"Invalid token\")\n    return x_token\n\n\ndef get_user(token: Annotated[str, Depends(get_token)]) -> dict[str, str]:\n    return {\"name\": \"ada\"}\n\n\n@app.get(\"/me\")\ndef me(user: Annotated[dict[str, str], Depends(get_user)]) -> dict[str, str]:\n    return user\n",
          "output": "GET /me  with header  X-Token: secret  ->  200  {\"name\":\"ada\"}\nGET /me  with no header                 ->  401  {\"detail\":\"Invalid token\"}",
          "explanation": "`get_token` reads the `X-Token` header and rejects anything but \"secret\". `get_user` receives the token and returns a user (a fixed one here, to keep the example small). `me` receives that user. With no header, `x_token` is `None`, which is not \"secret\", so the 401 is raised."
        },
        {
          "language": "bash",
          "filename": "terminal",
          "source": "curl.exe -H \"X-Token: secret\" http://127.0.0.1:8000/me",
          "output": "{\"name\":\"ada\"}",
          "explanation": "`-H` adds a header to the request. Leave it out and the response is the 401 error. In Windows PowerShell use curl.exe, as in topic 29."
        }
      ],
      "productionNote": "Real apps use the same chain shape: read the token from the request, look up the user it belongs to, then check that user's permissions. Each step is a separate dependency so it can be reused and tested alone. Topic 33 builds the real version with password checks and a signed login token.",
      "commonMistakes": [
        "Expecting `x_token` to match a header literally named `x_token`. FastAPI looks for `X-Token` (hyphens, any capitalisation).",
        "Repeating the authentication code inside every endpoint instead of writing it once as a dependency.",
        "Forgetting that a missing required header gives a 422 error, not a 401. Only an optional header (default `None`) lets your own code decide the response."
      ],
      "sources": [
        { "title": "FastAPI: Sub-dependencies", "url": "https://fastapi.tiangolo.com/tutorial/dependencies/sub-dependencies/" },
        { "title": "FastAPI: Header Parameters", "url": "https://fastapi.tiangolo.com/tutorial/header-params/" }
      ]
    },
    {
      "id": "router-and-app-level-dependencies",
      "title": "Router- and app-level dependencies",
      "explanation": "Sometimes you need a check to run but you do not need its value inside the endpoint, for example verifying an API key (a secret string a client sends in a header to prove who it is). Adding an unused parameter to every endpoint is noisy. Instead, pass a list of dependencies to the decorator: `@app.get(\"/ping\", dependencies=[Depends(verify_key)])`.\n\nTo apply a check to every route in the app, pass the list to `FastAPI(dependencies=[Depends(verify_key)])`. For one group of routes, `APIRouter(dependencies=[...])` does the same. An `APIRouter` is FastAPI's way of grouping related routes, and you will use it properly in topic 32.\n\nThe return value of a dependency listed this way is ignored. That is fine for checks, which either pass quietly or raise an `HTTPException`.\n\nIn the example, `verify_key` requires a header `X-Key` (the parameter `x_key`, converted as in the last sub-topic). With the right key the request goes through. With the wrong key the dependency raises 403. With no header at all, FastAPI itself rejects the request with a 422 before `verify_key` runs, and the error says where the field was expected: `\"loc\": [\"header\", \"x-key\"]`.\n\nNote that the dependency guards the endpoints. The `/docs` page itself is not protected by it, and when you call an endpoint from `/docs` you must supply the header yourself.",
      "analogy": "A ticket check at the entrance of a building instead of a guard at every room door. Everyone passes the check once on the way in, and the rooms inside do not need to ask again. The check does not give you anything to carry, it just lets you through or turns you away. A check on one route is a guard posted at one room door: only that room is guarded, and the rest of the building is untouched.",
      "code": [
        {
          "language": "python",
          "filename": "main.py",
          "source": "from typing import Annotated\n\nfrom fastapi import Depends, FastAPI, Header, HTTPException\n\n\ndef verify_key(x_key: Annotated[str, Header()]) -> None:\n    if x_key != \"k1\":\n        raise HTTPException(status_code=403, detail=\"Bad key\")\n\n\napp = FastAPI(dependencies=[Depends(verify_key)])\n\n\n@app.get(\"/ping\")\ndef ping() -> dict[str, bool]:\n    return {\"pong\": True}\n",
          "output": "GET /ping  with header  X-Key: k1    ->  200  {\"pong\":true}\nGET /ping  with header  X-Key: nope  ->  403  {\"detail\":\"Bad key\"}\nGET /ping  with no header            ->  422  {\"detail\":[{\"type\":\"missing\",\"loc\":[\"header\",\"x-key\"],\"msg\":\"Field required\",\"input\":null}]}",
          "explanation": "`ping` has no parameters, yet every request to it is checked by `verify_key` because the dependency is registered on the whole app. `verify_key` returns `None`, which is fine since the result is ignored."
        },
        {
          "language": "python",
          "filename": "main.py",
          "source": "from typing import Annotated\n\nfrom fastapi import Depends, FastAPI, Header, HTTPException\n\n\ndef verify_key(x_key: Annotated[str, Header()]) -> None:\n    if x_key != \"k1\":\n        raise HTTPException(status_code=403, detail=\"Bad key\")\n\n\napp = FastAPI()\n\n\n@app.get(\"/private\", dependencies=[Depends(verify_key)])\ndef private() -> dict[str, str]:\n    return {\"data\": \"hidden\"}\n\n\n@app.get(\"/public\")\ndef public() -> dict[str, str]:\n    return {\"data\": \"open\"}\n",
          "output": "GET /private  with header  X-Key: k1  ->  200  {\"data\":\"hidden\"}\nGET /private  with no header          ->  422  (missing header x-key)\nGET /public   with no header          ->  200  {\"data\":\"open\"}",
          "explanation": "The same check applied to a single route through the decorator. `/public` is untouched."
        }
      ],
      "productionNote": "App- or router-level dependencies are common for API-key checks, rate limiting (refusing clients that send too many requests) and audit logging (recording who did what) across many routes. Put the check on the router for a group such as all `/admin` routes, so a new route in that group is protected automatically.",
      "commonMistakes": [
        "Expecting a value from a dependency listed in `dependencies=[...]`. Its return value is ignored. If the endpoint needs the value, use a normal `Annotated[..., Depends(...)]` parameter.",
        "Thinking the check protects the `/docs` page. It protects the endpoints; `/docs` is a separate page that still loads without the header.",
        "Using `dependencies=[Depends(verify_key())]` with parentheses. As in the first sub-topic, pass the function itself."
      ],
      "sources": [
        { "title": "FastAPI: Dependencies in path operation decorators", "url": "https://fastapi.tiangolo.com/tutorial/dependencies/dependencies-in-path-operation-decorators/" },
        { "title": "FastAPI: Global Dependencies", "url": "https://fastapi.tiangolo.com/tutorial/dependencies/global-dependencies/" }
      ]
    }
  ],
  "quiz": [
      {
        "question": "Why do you write `Depends(get_user)` and not `Depends(get_user())`?",
        "options": [
          "FastAPI must call the function itself for each request; with parentheses you would call it once yourself and pass its result.",
          "Parentheses are only allowed on functions that take no arguments.",
          "Without parentheses the function runs faster.",
          "Parentheses would make the dependency run twice per request."
        ],
        "answerIndex": 0,
        "explanation": "`Depends` needs the function object so FastAPI can call it with the right request data every time. `get_user()` runs it immediately and passes whatever it returned."
      },
      {
        "question": "When does the code after `yield` in a dependency run?",
        "options": [
          "Before the endpoint function starts running, as the first setup step.",
          "Never, because `yield` ends the function for good and stops all later code.",
          "After the endpoint has finished, which makes it the place for cleanup.",
          "Only when the endpoint returns a 200 status code and nothing else."
        ],
        "answerIndex": 2,
        "explanation": "The part before `yield` is setup, the yielded value goes to the endpoint, and the part after (ideally in `finally`) runs once the endpoint is done, even if it raised an error."
      },
      {
        "question": "Which HTTP header does the parameter `x_token: Annotated[str, Header()]` read?",
        "options": [
          "A header literally named `x_token`, underscore included.",
          "`X-Token` (underscores become hyphens; names are not case-sensitive).",
          "`token`, because the `x_` prefix is removed by FastAPI.",
          "Any header at all, because `Header()` does not name one."
        ],
        "answerIndex": 1,
        "explanation": "FastAPI converts underscores in the parameter name to hyphens, so `x_token` matches `X-Token`, regardless of capitalisation."
      },
      {
        "question": "How can you run a check on every route of an app without adding a parameter to each endpoint?",
        "options": [
          "Put the check in the `status_code=` of every route.",
          "Set the check as the `response_model` of the app.",
          "Use `Depends(check)` as a default value for the endpoint's return type.",
          "Pass it to the app: `FastAPI(dependencies=[Depends(check)])`."
        ],
        "answerIndex": 3,
        "explanation": "Dependencies listed in `FastAPI(dependencies=[...])` run for every route. Their return values are ignored, so they suit checks that pass or raise an error."
      },
      {
        "question": "Within one request, two dependencies both depend on get_user. How many times does FastAPI call get_user?",
        "options": [
          "Once; the result is reused for that request",
          "Twice, once for each dependant that asks",
          "Never, because it only ever runs once on startup",
          "Once for the whole life of the server"
        ],
        "answerIndex": 0,
        "explanation": "FastAPI caches a dependency's result for the duration of one request, so every dependant shares it. A new request calls it again."
      },
      {
        "question": "Why should the cleanup after yield sit in a finally block?",
        "options": [
          "Because it makes the whole function run noticeably faster for every request",
          "So the yield can return twice",
          "So it still runs when the endpoint raises an error",
          "So FastAPI can skip the call whenever it decides to"
        ],
        "answerIndex": 2,
        "explanation": "If the endpoint raises, the error comes back into the dependency at the yield. A finally block guarantees the cleanup (closing a connection, for example) still happens."
      },
      {
        "question": "get_user depends on get_token, and get_token raises HTTPException 401. What runs next?",
        "options": [
          "The endpoint still runs first, and only afterwards the 401 is sent",
          "Nothing more: get_user and the endpoint never run",
          "get_user still runs, but with token set to None instead",
          "FastAPI retries get_token a second time before giving up"
        ],
        "answerIndex": 1,
        "explanation": "An exception in a dependency stops the chain at once. FastAPI sends the 401 response and skips every later step."
      },
      {
        "question": "Where do you put dependencies=[Depends(check)] to protect only one route?",
        "options": [
          "Inside the endpoint's parameter list, as an extra argument of the function",
          "In the response_model setting of that route, next to the return type",
          "In the status_code argument of the decorator, beside the HTTP code",
          "In that route's decorator, e.g. @app.get(\"/x\", dependencies=[Depends(check)])"
        ],
        "answerIndex": 3,
        "explanation": "The decorator's dependencies list runs the check for that route only, without adding a parameter to the function."
      }
    ]
});
