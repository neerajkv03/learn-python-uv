window.TOPICS = window.TOPICS || [];
window.TOPICS.push({
  "id": "29-fastapi-requests-responses",
  "order": 29,
  "title": "Request Bodies & Responses",
  "version": "Python 3.15.2 + uv 0.13.7 + FastAPI 0.162.5 + Pydantic 2.14.3",
  "summary": "Topic 28 built endpoints that only read values from the URL. This topic teaches your API to accept a JSON body checked by a Pydantic model, to control what it sends back, to choose status codes, to report errors such as 404, and to read FastAPI's automatic 422 validation errors. It ends with validation rules on path and query parameters.",
  "prerequisites": ["27-pydantic-models", "28-fastapi-first-app"],
  "subtopics": [
    {
      "id": "request-bodies",
      "title": "Request bodies with Pydantic models",
      "explanation": "A request body is the data a client sends inside the request, after the headers. For create and update operations it is usually JSON (topic 26). In FastAPI you declare the body by typing a function parameter with a Pydantic model class (topic 27). FastAPI reads the JSON, validates it against the model, converts it, and hands your function a ready model object.\n\nFastAPI decides where each parameter comes from using three rules. If the name appears in the path, for example `{item_id}`, it is a path parameter. If it has a simple type such as `int`, `str` or `bool` and is not in the path, it is a query parameter. If its type is a Pydantic model, it is read from the JSON body.\n\nYou can combine all three in one function. A body only makes sense on methods that carry one: POST, PUT and PATCH. Sending a body with GET is unreliable and many clients and servers ignore it.\n\nTo follow along, use the project from topic 28 (a folder with `pyproject.toml` and FastAPI installed). Put the code below in `main.py`, replacing what was there. In one terminal, run `uv run fastapi dev` and leave it running.\n\nOpen a second terminal in the same folder and run the `curl` commands. `curl` is a command-line tool that sends HTTP requests; it comes with macOS, Linux and Windows 10 and later. In Windows PowerShell type `curl.exe` instead of `curl`, because plain `curl` is a different built-in command there.\n\nIn the `curl` commands, `-s` hides the progress meter, `-X` sets the HTTP method, `-H` adds a header, `-d` gives the body, and `-w \"\\n%{http_code}\\n\"` prints the status code on its own line after the response body. If quoting JSON in your shell is awkward, open `http://127.0.0.1:8000/docs` and use the \"Try it out\" button instead.\n\nThe model has `tags: list[str] = []`. Normally a mutable default in a function is a trap (topic 9), but Pydantic copies the default for every new instance, so each item gets its own empty list.",
      "analogy": "A mail-order form. The address on the envelope is the path, which says which shop and which product. The checkboxes you tick on the outside, such as \"gift wrap\", are the query options. The filled-in order form inside the envelope is the body. FastAPI is the clerk who opens the envelope and checks that the order form is filled in correctly before anything is shipped.",
      "code": [
        {
          "language": "python",
          "filename": "main.py",
          "source": "from fastapi import FastAPI\nfrom pydantic import BaseModel\n\n\nclass ItemCreate(BaseModel):\n    name: str\n    price: float\n    tags: list[str] = []\n\n\napp = FastAPI()\n\n\n@app.post(\"/items/\")\ndef create_item(item: ItemCreate) -> ItemCreate:\n    return item\n",
          "output": "$ curl -s -w \"\\n%{http_code}\\n\" -X POST http://127.0.0.1:8000/items/ -H \"Content-Type: application/json\" -d '{\"name\": \"Pen\", \"price\": 1.5}'\n{\"name\":\"Pen\",\"price\":1.5,\"tags\":[]}\n200",
          "explanation": "`item: ItemCreate` is a model, so FastAPI reads it from the JSON body. The client sent no `tags`, so the default empty list is used. The function returns the model and FastAPI turns it back into JSON."
        },
        {
          "language": "python",
          "filename": "main.py",
          "source": "from fastapi import FastAPI\nfrom pydantic import BaseModel\n\n\nclass ItemCreate(BaseModel):\n    name: str\n    price: float\n    tags: list[str] = []\n\n\napp = FastAPI()\n\n\n@app.put(\"/items/{item_id}\")\ndef update_item(item_id: int, item: ItemCreate, notify: bool = False) -> dict[str, object]:\n    return {\"item_id\": item_id, \"notify\": notify, \"item\": item.model_dump()}\n",
          "output": "$ curl -s -w \"\\n%{http_code}\\n\" -X PUT \"http://127.0.0.1:8000/items/7?notify=true\" -H \"Content-Type: application/json\" -d '{\"name\": \"Pen\", \"price\": 1.5}'\n{\"item_id\":7,\"notify\":true,\"item\":{\"name\":\"Pen\",\"price\":1.5,\"tags\":[]}}\n200",
          "explanation": "All three sources in one function: `item_id` comes from the path, `notify` is a query parameter (`?notify=true`), and `item` comes from the body. `item.model_dump()` (topic 27) turns the model into a plain dict."
        }
      ],
      "productionNote": "Every create and update endpoint in a real API takes its body this way, and so do forms submitted by a web frontend (the browser code of your site) that sends JSON. Because the model is the contract, the same class also produces the documentation in `/docs`.",
      "commonMistakes": [
        "Sending a body with GET. Use POST, PUT or PATCH when the client must send data.",
        "Typing the body parameter as a plain `dict`. It still works, but nothing is validated and `/docs` cannot show the fields. Use a model.",
        "Forgetting the `Content-Type: application/json` header when testing with `curl`. Without it the server may not read the body as JSON."
      ],
      "sources": [
        { "title": "FastAPI: Request Body", "url": "https://fastapi.tiangolo.com/tutorial/body/" }
      ]
    },
    {
      "id": "response-model",
      "title": "response_model and return types",
      "explanation": "The return type annotation of your function does two jobs. It validates what you return, and it filters it: only the fields declared in that model are sent to the client. Anything extra is dropped.\n\nThis matters for secrets. A common pattern uses inheritance (topic 15): `BaseUser` holds the public fields, and `UserIn` inherits from it and adds `password`. The endpoint accepts `UserIn` but declares `-> BaseUser`. Even though the function returns the object with the password, FastAPI sends only `username`.\n\nSometimes the function returns something that is not the model you want to document, such as a plain dict. Then put the model in the decorator with `response_model=`. When you set `response_model=`, it takes priority over the return annotation, and the annotation can be anything your type checker needs.\n\nWith no return type and no `response_model`, everything you return is sent as it is, so a password would leak.",
      "analogy": "A mail-room filter. You can put anything you like into the outgoing tray, but the mail room has an approved list of items. Only items on that list are posted, and the rest stay behind in the building.",
      "code": [
        {
          "language": "python",
          "filename": "main.py",
          "source": "from fastapi import FastAPI\nfrom pydantic import BaseModel\n\n\nclass BaseUser(BaseModel):\n    username: str\n\n\nclass UserIn(BaseUser):\n    password: str\n\n\napp = FastAPI()\n\n\n@app.post(\"/users/\")\ndef create_user(user: UserIn) -> BaseUser:\n    return user\n",
          "output": "$ curl -s -w \"\\n%{http_code}\\n\" -X POST http://127.0.0.1:8000/users/ -H \"Content-Type: application/json\" -d '{\"username\": \"ada\", \"password\": \"s3cret\"}'\n{\"username\":\"ada\"}\n200",
          "explanation": "The function returns `user`, which includes the password. The declared return type `BaseUser` has only `username`, so FastAPI removes `password` before sending."
        },
        {
          "language": "python",
          "filename": "main.py",
          "source": "from fastapi import FastAPI\nfrom pydantic import BaseModel\n\n\nclass BaseUser(BaseModel):\n    username: str\n\n\napp = FastAPI()\n\n\n@app.get(\"/demo\", response_model=BaseUser)\ndef demo() -> dict[str, str]:\n    return {\"username\": \"bob\", \"password\": \"hunter2\"}\n",
          "output": "$ curl -s -w \"\\n%{http_code}\\n\" http://127.0.0.1:8000/demo\n{\"username\":\"bob\"}\n200",
          "explanation": "The function returns a dict, not a `BaseUser`, so the filter is set with `response_model=BaseUser` in the decorator. The extra `password` key is dropped."
        }
      ],
      "productionNote": "Always give public endpoints a response model. It stops password hashes, internal ids and other secrets from leaking when someone later adds a column or field to the data you return.",
      "commonMistakes": [
        "Declaring the input model (with the password) as the return type. Then the password is sent back.",
        "Leaving off the return type and `response_model`. Whatever you return is sent in full."
      ],
      "sources": [
        { "title": "FastAPI: Response Model - Return Type", "url": "https://fastapi.tiangolo.com/tutorial/response-model/" },
        { "title": "FastAPI: Return Type and Data Filtering", "url": "https://fastapi.tiangolo.com/tutorial/response-model/#return-type-and-data-filtering" }
      ]
    },
    {
      "id": "status-codes",
      "title": "Status codes",
      "explanation": "A status code is the three-digit number in a response that tells the client what happened (topic 26). FastAPI sends 200 by default. You change it with `status_code=` in the decorator.\n\nUse 201 (Created) when a POST makes a new thing. Use 204 (No Content) when the operation succeeded and there is nothing to send back, which is typical for DELETE. A 204 response must have an empty body.\n\nYou can write the number, but `from fastapi import status` gives readable names such as `status.HTTP_201_CREATED` and `status.HTTP_204_NO_CONTENT`. A function that returns nothing is annotated `-> None`.",
      "analogy": "The stamp on a receipt. A stamp reading \"created\" says the new item now exists. A stamp reading \"done, nothing to hand back\" says the job is finished and there is nothing to give you.",
      "code": [
        {
          "language": "python",
          "filename": "main.py",
          "source": "from fastapi import FastAPI, status\nfrom pydantic import BaseModel\n\n\nclass ItemCreate(BaseModel):\n    name: str\n    price: float\n    tags: list[str] = []\n\n\napp = FastAPI()\n\n\n@app.post(\"/items/\", status_code=status.HTTP_201_CREATED)\ndef create_item(item: ItemCreate) -> ItemCreate:\n    return item\n\n\n@app.delete(\"/items/{item_id}\", status_code=status.HTTP_204_NO_CONTENT)\ndef delete_item(item_id: int) -> None:\n    return None\n",
          "output": "$ curl -s -w \"\\n%{http_code}\\n\" -X POST http://127.0.0.1:8000/items/ -H \"Content-Type: application/json\" -d '{\"name\": \"Pen\", \"price\": 1.5}'\n{\"name\":\"Pen\",\"price\":1.5,\"tags\":[]}\n201\n\n$ curl -s -w \"\\n%{http_code}\\n\" -X DELETE http://127.0.0.1:8000/items/3\n\n204",
          "explanation": "The POST now answers 201 with the created item. The DELETE answers 204 and the body is empty, so `curl` prints only an empty line and then the code."
        }
      ],
      "productionNote": "Correct status codes let clients, browsers and API gateways (servers that sit in front of your API) handle responses properly, for example by treating 201 as a successful creation and retrying or caching based on the code.",
      "commonMistakes": [
        "Returning a body with a 204 response. 204 means no content.",
        "Leaving every create endpoint at the default 200 instead of 201."
      ],
      "sources": [
        { "title": "FastAPI: Response Status Code", "url": "https://fastapi.tiangolo.com/tutorial/response-status-code/" }
      ]
    },
    {
      "id": "http-exception",
      "title": "HTTPException",
      "explanation": "When something goes wrong, for example the requested item does not exist, you stop the function and tell the client with `HTTPException`. This is a class (topic 15) that FastAPI provides; it is an exception (topic 11). You raise it with a status code and a `detail` message.\n\nFastAPI catches it, sends the status code you gave, and makes the body `{\"detail\": ...}`. The rest of your function does not run. The `detail` can be any value that converts to JSON, such as a string, a list or a dict.\n\nYou must `raise` it, not `return` it. Returning it just hands an ordinary object back and does not produce a 404.\n\nKeep `detail` short and safe for clients to read. Do not put internal error text, file paths or SQL in it.",
      "analogy": "The waiter coming back to your table to say \"sorry, we are out of that\". Your order stops there. The kitchen does not keep cooking it, and you get the news straight away.",
      "code": [
        {
          "language": "python",
          "filename": "main.py",
          "source": "from fastapi import FastAPI, HTTPException\n\napp = FastAPI()\n\nitems = {1: \"Pen\", 2: \"Ink\"}\n\n\n@app.get(\"/items/{item_id}\")\ndef read_item(item_id: int) -> dict[str, str]:\n    if item_id not in items:\n        raise HTTPException(status_code=404, detail=\"Item not found\")\n    return {\"name\": items[item_id]}\n",
          "output": "$ curl -s -w \"\\n%{http_code}\\n\" http://127.0.0.1:8000/items/1\n{\"name\":\"Pen\"}\n200\n\n$ curl -s -w \"\\n%{http_code}\\n\" http://127.0.0.1:8000/items/9\n{\"detail\":\"Item not found\"}\n404",
          "explanation": "Item 1 exists, so the normal response is sent. Item 9 is missing, so the `raise` stops the function and the client receives 404 with the detail text."
        }
      ],
      "productionNote": "Every API uses this for 404 (not found), 409 (conflict, such as a duplicate username) and 403 (forbidden). Clients rely on the status code, and show or log the `detail`.",
      "commonMistakes": [
        "Writing `return HTTPException(...)` instead of `raise`. The error is not signalled and the client does not get the status you meant.",
        "Putting internal error messages in `detail`, which leaks implementation details to anyone calling the API."
      ],
      "sources": [
        { "title": "FastAPI: Handling Errors - Use HTTPException", "url": "https://fastapi.tiangolo.com/tutorial/handling-errors/#use-httpexception" }
      ]
    },
    {
      "id": "validation-errors",
      "title": "Validation errors (422)",
      "explanation": "When the incoming data does not match your declarations, FastAPI answers `422` by itself. Your function is never called. The body is `{\"detail\": [...]}`, a list with one entry per problem.\n\nEach entry has these keys. `type` is a short error code, the same codes Pydantic uses (topic 27). `loc` is the location: a list whose first item says where the value came from (`\"body\"`, `\"query\"`, `\"path\"` or `\"header\"`) followed by the field name. `msg` is a human-readable message and `input` is the value that was rejected. Some errors add `ctx` with extra details. The exact wording of `msg` can change between versions, so program against `type` and `loc`.\n\nThe 422 means the request was well formed but the data is not acceptable. This is different from 400, which is a general \"bad request\" code. You never need to write these checks yourself.\n\nThis example reuses the endpoint from the first sub-topic.",
      "analogy": "A bouncer at the concert door. Anyone with a bad ticket is turned away at the entrance with a note saying what is wrong with it. They never reach the concert hall, which is your function.",
      "code": [
        {
          "language": "python",
          "filename": "main.py",
          "source": "from fastapi import FastAPI\nfrom pydantic import BaseModel\n\n\nclass ItemCreate(BaseModel):\n    name: str\n    price: float\n    tags: list[str] = []\n\n\napp = FastAPI()\n\n\n@app.post(\"/items/\")\ndef create_item(item: ItemCreate) -> ItemCreate:\n    print(\"create_item called\")\n    return item\n",
          "output": "$ curl -s -w \"\\n%{http_code}\\n\" -X POST http://127.0.0.1:8000/items/ -H \"Content-Type: application/json\" -d '{\"name\": \"Pen\", \"price\": \"cheap\"}'\n{\"detail\":[{\"type\":\"float_parsing\",\"loc\":[\"body\",\"price\"],\"msg\":\"Input should be a valid number, unable to parse string as a number\",\"input\":\"cheap\"}]}\n422\n\n$ curl -s -w \"\\n%{http_code}\\n\" -X POST http://127.0.0.1:8000/items/ -H \"Content-Type: application/json\" -d '{\"price\": 1}'\n{\"detail\":[{\"type\":\"missing\",\"loc\":[\"body\",\"name\"],\"msg\":\"Field required\",\"input\":{\"price\":1}}]}\n422",
          "explanation": "The first request has a price that is not a number: `type` is `float_parsing` and `loc` is `[\"body\", \"price\"]`. The second request has no `name`: `type` is `missing` and `loc` is `[\"body\", \"name\"]`. The `print` line never runs in either case, because the function is not called when validation fails. (The `msg` text may read slightly differently on other versions.)"
        }
      ],
      "productionNote": "Frontends use `loc` to show the message next to the right form field, and developers use `type` to see what went wrong. Because the format is the same on every endpoint, one piece of client code can handle all of them.",
      "commonMistakes": [
        "Writing manual `if` checks for things the type hints and `Field` rules already check.",
        "Confusing 422 (the data is invalid) with 400 (a general bad request). FastAPI uses 422 for validation failures."
      ],
      "sources": [
        { "title": "FastAPI: Handling Errors - RequestValidationError", "url": "https://fastapi.tiangolo.com/tutorial/handling-errors/#requestvalidationerror" }
      ]
    },
    {
      "id": "annotated-query-path",
      "title": "Annotated with Query and Path validation",
      "explanation": "Path and query parameters can have rules too, using the same `Annotated` pattern as `Annotated[T, Field()]` in topic 27. `Annotated[int, Path(ge=1)]` means \"an int that comes from the path and must be at least 1\". `Annotated[str | None, Query(max_length=20)]` means \"an optional query string of at most 20 characters\".\n\n`Path` and `Query` accept the same rule names as Pydantic's `Field`: `ge` (greater than or equal), `le` (less than or equal), `gt`, `lt`, `min_length`, `max_length` and `pattern` (text the value must match, written as a regular expression). They also take `description`, which shows up in `/docs`. To limit a page size you would write `limit: Annotated[int, Query(le=100)] = 10`.\n\nA query parameter is optional only if it has a default, so write `= None` (or another default) after it. The `Annotated` style is the one FastAPI recommends. The older form `q: str = Query(None)` still works, but you will see it only in old code.\n\nTo accept a list from the query string, use `Annotated[list[str] | None, Query()] = None`. The client repeats the name: `?tag=a&tag=b`. Here the empty `Query()` is needed, because without it FastAPI would look for a body.",
      "analogy": "The same form boxes as before, now with printed rules on the address and the tick-boxes too: \"house number must be 1 or more\" and \"note: at most 20 letters\". The clerk checks those rules before looking at anything else.",
      "code": [
        {
          "language": "python",
          "filename": "main.py",
          "source": "from typing import Annotated\n\nfrom fastapi import FastAPI, Path, Query\n\napp = FastAPI()\n\n\n@app.get(\"/items/{item_id}\")\ndef read_item(\n    item_id: Annotated[int, Path(ge=1)],\n    q: Annotated[str | None, Query(max_length=20)] = None,\n) -> dict[str, int | str | None]:\n    return {\"item_id\": item_id, \"q\": q}\n",
          "output": "$ curl -s -w \"\\n%{http_code}\\n\" \"http://127.0.0.1:8000/items/3?q=pen\"\n{\"item_id\":3,\"q\":\"pen\"}\n200\n\n$ curl -s -w \"\\n%{http_code}\\n\" http://127.0.0.1:8000/items/0\n{\"detail\":[{\"type\":\"greater_than_equal\",\"loc\":[\"path\",\"item_id\"],\"msg\":\"Input should be greater than or equal to 1\",\"input\":\"0\",\"ctx\":{\"ge\":1}}]}\n422",
          "explanation": "`item_id` 3 passes the `ge=1` rule. `item_id` 0 breaks it, so FastAPI answers 422 with `loc` starting with `\"path\"`. The `input` is the string `\"0\"` because it is the raw text from the URL."
        },
        {
          "language": "python",
          "filename": "main.py",
          "source": "from typing import Annotated\n\nfrom fastapi import FastAPI, Query\n\napp = FastAPI()\n\n\n@app.get(\"/search\")\ndef search(tag: Annotated[list[str] | None, Query()] = None) -> dict[str, list[str]]:\n    return {\"tags\": tag or []}\n",
          "output": "$ curl -s -w \"\\n%{http_code}\\n\" \"http://127.0.0.1:8000/search?tag=a&tag=b\"\n{\"tags\":[\"a\",\"b\"]}\n200",
          "explanation": "Repeating `tag` in the query string builds a list. The URL is in quotes because the shell would otherwise treat `&` as a special character. `tag or []` returns an empty list when no tags were sent."
        }
      ],
      "productionNote": "Use these limits for page sizes (`le=100`), id ranges, and the length of search text, so clients cannot ask for huge amounts of data or send absurd input.",
      "commonMistakes": [
        "Using the old style `q: str = Query(None)`. It works, but `Annotated` is the recommended style.",
        "Forgetting `= None` on an optional query parameter. Without a default, the parameter is required.",
        "Leaving out `Query()` on a list parameter. FastAPI then expects the list in the body, not in the query string."
      ],
      "sources": [
        { "title": "FastAPI: Query Parameters and String Validations", "url": "https://fastapi.tiangolo.com/tutorial/query-params-str-validations/" },
        { "title": "FastAPI: Path Parameters and Numeric Validations", "url": "https://fastapi.tiangolo.com/tutorial/path-params-numeric-validations/" }
      ]
    }
  ],
  "quiz": [
    {
      "question": "A function has the parameters `item_id: int` (which is also in the path as `{item_id}`), `limit: int = 10`, and `item: ItemCreate` (a Pydantic model). Where does FastAPI read each one from?",
      "options": [
        "item_id from the path, limit from the query string, item from the JSON body",
        "All three from the JSON body",
        "item_id from the query string, limit from the path, item from the headers",
        "All three from the query string, because that is where FastAPI looks by default"
      ],
      "answerIndex": 0,
      "explanation": "A name in the path is a path parameter, a simple type outside the path is a query parameter, and a Pydantic model is read from the JSON body."
    },
    {
      "question": "An endpoint accepts a `UserIn` model that has a `password` field. How do you make sure the password is not in the response?",
      "options": [
        "Return the password as an empty string, so the field is still there but blank",
        "Use status code 204, which tells FastAPI to drop sensitive fields from the reply",
        "Declare a return type (or `response_model`) without `password`, such as `BaseUser`",
        "Nothing is needed, because FastAPI hides fields named password automatically"
      ],
      "answerIndex": 2,
      "explanation": "The declared return type filters the output, so only the fields of that model are sent. FastAPI does not treat any field name as secret on its own."
    },
    {
      "question": "What does `raise HTTPException(status_code=404, detail=\"Item not found\")` send to the client?",
      "options": [
        "Status 200 with the plain-text body `Item not found`",
        "Status 422 with a list of validation errors in the body",
        "Status 500 with an empty body, because exceptions crash the server",
        "Status 404 with the body `{\"detail\":\"Item not found\"}`"
      ],
      "answerIndex": 3,
      "explanation": "FastAPI turns the exception into a response with the given status code and a JSON body that has the `detail` key."
    },
    {
      "question": "In which situation is your endpoint function not called at all?",
      "options": [
        "When the client sends a valid request with all fields",
        "When the request data fails validation (FastAPI answers 422 first)",
        "When the function returns a value to the client",
        "When the endpoint uses a status code other than 200"
      ],
      "answerIndex": 1,
      "explanation": "FastAPI validates path, query and body data first. If anything is invalid it replies 422 and the function body never runs."
    },
    {
      "question": "How do you make the query parameter `limit` accept at most 100?",
      "options": [
        "`limit: Annotated[int, Query(ge=100)] = 100`",
        "`limit: Annotated[int, Path(le=100)] = 10`",
        "`limit: int = Query(100)`",
        "`limit: Annotated[int, Query(le=100)] = 10`"
      ],
      "answerIndex": 3,
      "explanation": "`Query(le=100)` inside `Annotated` adds the rule \"less than or equal to 100\" to a query parameter. `ge=100` sets a minimum instead, `Path` is for path parameters, and `Query(100)` only sets a default of 100."
    },
    {
      "question": "Which field of a 422 error entry tells you whether the bad value came from the body, query, path or header?",
      "options": [
        "`loc`",
        "`type`",
        "`msg`",
        "`input`"
      ],
      "answerIndex": 0,
      "explanation": "`loc` is the location of the error, a list that starts with `\"body\"`, `\"query\"`, `\"path\"` or `\"header\"` followed by the field name. `type` and `msg` describe the problem, and `input` is the bad value."
    },
    {
      "question": "A DELETE endpoint returns no body. Which status code fits best?",
      "options": [
        "`200`",
        "`201`",
        "`204`",
        "`404`"
      ],
      "answerIndex": 2,
      "explanation": "204 means \"No Content\": the request worked and there is nothing to send back. 200 usually comes with a body, 201 means something was created, and 404 means not found."
    },
    {
      "question": "With `tag: Annotated[list[str] | None, Query()] = None`, what does `/search?tag=a&tag=b` give for `tag`?",
      "options": [
        "`\"a\"`",
        "`[\"a\", \"b\"]`",
        "`\"b\"`",
        "A 422 error"
      ],
      "answerIndex": 1,
      "explanation": "Repeating a query key builds a list when the parameter is a `list[str]` with `Query()`, so `tag` is `[\"a\", \"b\"]`."
    }
  ]
});
