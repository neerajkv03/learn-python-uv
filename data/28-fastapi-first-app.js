window.TOPICS = window.TOPICS || [];
window.TOPICS.push({
  "id": "28-fastapi-first-app",
  "order": 28,
  "title": "FastAPI First App",
  "version": "Python 3.15.2 + uv 0.13.7 + FastAPI 0.162.5 + Uvicorn 0.54.0",
  "summary": "FastAPI is a Python web framework (a toolkit that handles the repetitive parts of building a web service) for building APIs from ordinary functions and type hints. In this topic you create a uv project, write your first endpoints (URLs your API answers), run them with the fastapi command, try them in the automatic /docs page, and read values from the URL as path and query parameters.",
  "prerequisites": ["13-uv-projects", "18-decorators-context-managers", "26-http-api-basics", "27-pydantic-models"],
  "subtopics": [
    {
      "id": "adding-fastapi-standard",
      "title": "Adding fastapi[standard] with uv add",
      "explanation": "FastAPI is a Python web framework for building web APIs (programs that other programs talk to over HTTP, as you saw in the HTTP basics topic). You describe each endpoint (one URL your API answers) as a normal function with type hints, and FastAPI uses Pydantic (from the previous topic) to check and convert the data that arrives.\n\nA framework alone cannot receive network traffic, so you also need a server: a program that listens on a network port (a numbered entry point on your computer that network requests arrive at) and passes each HTTP request to your code. FastAPI works with Uvicorn, an ASGI server. ASGI is the standard interface that lets Python web apps that handle work asynchronously (able to serve many requests at once without waiting on each one) talk to servers. You do not need to know its details now; just know that Uvicorn is the part that accepts connections.\n\nYou install everything at once with the extra called `standard`. An extra is a named group of optional add-ons that a package offers; you ask for it with square brackets after the package name. `fastapi[standard]` installs FastAPI plus the `fastapi` command-line tool, Uvicorn, HTTPX (an HTTP client library that the testing topic will use) and a few other helpers.\n\nOpen a terminal, move to the folder where you keep projects, and run the commands below. `uv init shop-api` creates a new project folder (see the uv projects topic), `cd shop-api` moves into it, and `uv add` installs the package and records it in `pyproject.toml` and `uv.lock`. Put quotes around `\"fastapi[standard]\"`: some shells (the programs that read your terminal commands), such as zsh on macOS, treat square brackets as a filename pattern and would fail.",
      "analogy": "Think of a restaurant. FastAPI is the recipe book and the kitchen rules: it says what each dish (endpoint) is and how orders are checked. Uvicorn is the front door and the waiters: it lets customers (requests) in and carries the finished dishes (responses) back out. You need both to run a restaurant.",
      "code": [
        {
          "language": "bash",
          "filename": "terminal",
          "source": "uv init shop-api\ncd shop-api\nuv add \"fastapi[standard]\"",
          "output": "",
          "explanation": "Creates the project, enters its folder and installs FastAPI with the standard extras. The quotes protect the brackets from the shell. uv prints progress lines while it installs; the commands have no output you need to check."
        },
        {
          "language": "toml",
          "filename": "pyproject.toml",
          "source": "dependencies = [\n    \"fastapi[standard]>=0.162.5\",\n]",
          "output": "",
          "explanation": "This is the dependencies line that uv add wrote inside the [project] table of pyproject.toml. The >= part is a version constraint: any release from 0.162.5 upward is allowed, and uv.lock pins the exact version used."
        }
      ],
      "productionNote": "This is the standard way to start a FastAPI service. Commit both pyproject.toml and uv.lock so teammates and your deployment build get the same versions.",
      "commonMistakes": [
        "Writing fastapi[standard] without quotes. Shells such as zsh treat the square brackets as a pattern and report an error; always write \"fastapi[standard]\".",
        "Using pip install instead of uv add. pip does not record the package in pyproject.toml or uv.lock, so the project breaks on another machine."
      ],
      "sources": [
        { "title": "FastAPI: Installation", "url": "https://fastapi.tiangolo.com/#installation" },
        { "title": "FastAPI CLI", "url": "https://fastapi.tiangolo.com/fastapi-cli/" },
        { "title": "uv: Using uv with FastAPI", "url": "https://docs.astral.sh/uv/guides/integration/fastapi/" }
      ]
    },
    {
      "id": "path-operations",
      "title": "Path operations (@app.get)",
      "explanation": "`app = FastAPI()` creates the application object: the single thing that holds all your endpoints. A path operation is one combination of an HTTP method (GET, POST...) and a path (such as `/`), handled by one function. You register it with a decorator (the `@` syntax from the decorators topic): `@app.get(\"/\")` means \"when a GET request arrives for `/`, call the function below\".\n\nThere is one decorator per HTTP method: `@app.get`, `@app.post`, `@app.put`, `@app.patch` and `@app.delete`. They match the methods you met in the HTTP basics topic. This topic uses GET, because you can test it by simply opening a URL in the browser.\n\nWhatever the function returns, FastAPI converts to JSON for the response: a dict, a list, a string, a number or a Pydantic model. The return type hint (`-> dict[str, str]`) documents what you return and FastAPI also uses it to check and filter the response. A URL that has no path operation gets an automatic `404` response with the body `{\"detail\":\"Not Found\"}`. FastAPI writes JSON without spaces.\n\nTo try it: inside the `shop-api` folder, `uv init` already created a file called `main.py`. Open it, delete everything in it, and paste the code below. Then start the app with `uv run fastapi dev main.py` (the next sub-topic explains this command) and open `http://127.0.0.1:8000/` in your browser. Opening a URL in the browser always sends a GET request.",
      "analogy": "A path operation is a line in a reception desk directory: \"questions about /, go to desk read_root\". A visitor (request) says what they want, the receptionist looks it up in the directory, and sends them to the right desk (function). If the directory has no such line, the receptionist says \"Not Found\".",
      "code": [
        {
          "language": "python",
          "filename": "main.py",
          "source": "from fastapi import FastAPI\n\napp = FastAPI()\n\n\n@app.get(\"/\")\ndef read_root() -> dict[str, str]:\n    return {\"message\": \"Hello World\"}",
          "output": "GET /          ->  200  {\"message\":\"Hello World\"}\nGET /missing   ->  404  {\"detail\":\"Not Found\"}",
          "explanation": "FastAPI() creates the app. The decorator registers read_root for GET requests to /. The returned dict becomes JSON. The output lines are what the browser or /docs shows for each request (status code, then body), not text printed by Python. /missing has no path operation, so FastAPI answers 404 itself."
        }
      ],
      "productionNote": "Every endpoint of a FastAPI service is a path operation like this one. Use the method that matches the action (GET to read, POST to create) so clients and caches behave correctly.",
      "commonMistakes": [
        "Forgetting the decorator. A plain function with no @app.get is never registered, so its URL returns 404.",
        "Declaring two functions with the same method and path. Only the first one declared is used; the second is silently unreachable."
      ],
      "sources": [
        { "title": "FastAPI tutorial: First Steps", "url": "https://fastapi.tiangolo.com/tutorial/first-steps/" }
      ]
    },
    {
      "id": "fastapi-dev-and-run",
      "title": "Running with fastapi dev and fastapi run",
      "explanation": "The `fastapi` command starts Uvicorn for you. In your project folder run `uv run fastapi dev main.py`. The `uv run` prefix makes sure the command uses the project's own environment. `main.py` tells FastAPI which file holds your `app`.\n\nDevelopment mode (`fastapi dev`) watches your files and reloads the app automatically each time you save. It listens on `http://127.0.0.1:8000`, an address that only your own machine can reach. Port 8000 is the default; choose another with `--port 8080`. Leave the command running in the terminal, use a browser to send requests, and stop it with Ctrl+C.\n\nProduction mode (`fastapi run`) does not watch files and does not reload. It listens on `0.0.0.0:8000`, which means \"every network address this machine has\", so other machines can connect. This is what you run on a real server or inside a container (a sealed package that holds your app and everything it needs; topic 24 covers Docker).\n\nThe terminal prints a startup banner. The wording changes between versions, so the output below is only similar to what you will see; look for the line that shows the address.",
      "analogy": "`fastapi dev` is a rehearsal: the director shouts \"again!\" every time you change a line, and only the cast is in the room. `fastapi run` is the live show: the doors are open to the public and nobody stops the performance to restart it.",
      "code": [
        {
          "language": "bash",
          "filename": "terminal",
          "source": "uv run fastapi dev main.py",
          "output": "(similar to)\nFastAPI   Starting development server\n  Serving at: http://127.0.0.1:8000\n  API docs: http://127.0.0.1:8000/docs",
          "explanation": "Starts the app in development mode with auto-reload. The banner is representative only; exact lines vary by version. Press Ctrl+C to stop."
        },
        {
          "language": "bash",
          "filename": "terminal",
          "source": "uv run fastapi run main.py",
          "output": "",
          "explanation": "Starts the app in production mode: no reload, reachable from other machines. It prints a similar startup banner and then log lines for each request. Add --port 8080 to either command to use a different port."
        }
      ],
      "productionNote": "Use fastapi dev for local work and fastapi run for deployment, typically inside a Docker container. Never ship the dev command.",
      "commonMistakes": [
        "Using fastapi dev in production. It watches files for changes, which wastes resources, and it only listens on localhost so outside users cannot reach it.",
        "Starting a second copy while port 8000 is already in use. The start fails with an address-in-use error; stop the old one with Ctrl+C or pick another port with --port."
      ],
      "sources": [
        { "title": "FastAPI CLI", "url": "https://fastapi.tiangolo.com/fastapi-cli/" },
        { "title": "FastAPI: Run a Server Manually", "url": "https://fastapi.tiangolo.com/deployment/manually/" }
      ]
    },
    {
      "id": "interactive-docs",
      "title": "Interactive docs (/docs)",
      "explanation": "FastAPI builds a description of your API automatically from your code. This description follows a standard called OpenAPI: a machine-readable (JSON) document that lists every path, its parameters and its responses. You can see it at `/openapi.json`. A schema is just such a structured description of data or an API.\n\nFrom that schema FastAPI serves two web pages. `/docs` is Swagger UI, a page where you can click an endpoint, press \"Try it out\", fill in values and press \"Execute\" to send a real request and see the status code and response. `/redoc` is a read-only reference page for the same API.\n\nYou control the header of the docs with `FastAPI(title=..., version=...)`. A function's docstring (the text in triple quotes right under `def`, from the functions topic) shows up as the endpoint's description. Because the docs come from the code, they are always up to date.\n\nStart the app with `uv run fastapi dev main.py` and open `http://127.0.0.1:8000/docs`. Using `/docs`, you can test every endpoint in this topic without writing any client code.",
      "analogy": "The docs page is an automatic menu that is always up to date, with a \"taste sample\" button next to every dish. When the kitchen adds a dish, the menu changes by itself and nobody has to reprint it.",
      "code": [
        {
          "language": "python",
          "filename": "main.py",
          "source": "from fastapi import FastAPI\n\napp = FastAPI(title=\"Shop API\", version=\"1.0.0\")\n\n\n@app.get(\"/ping\")\ndef ping() -> dict[str, bool]:\n    \"\"\"Check the API is alive.\"\"\"\n    return {\"ok\": True}",
          "output": "GET /ping           ->  200  {\"ok\":true}\nGET /openapi.json   ->  200  JSON whose \"info\" part is {\"title\":\"Shop API\",\"version\":\"1.0.0\"}",
          "explanation": "title and version appear at the top of /docs. The docstring becomes the description of GET /ping. Python's True becomes JSON's true. The /openapi.json response is long, so only its \"info\" part is shown."
        }
      ],
      "productionNote": "The generated docs are how frontend and mobile teams learn your API contract, and tools can generate client code from /openapi.json. If an API is private, you can turn all three off with FastAPI(docs_url=None, redoc_url=None, openapi_url=None). Passing only docs_url=None removes the Swagger page but leaves /redoc and /openapi.json public.",
      "commonMistakes": [
        "Thinking the documentation must be written by hand. FastAPI generates it from your type hints and function signatures.",
        "Leaving the docs public on an API that should stay private. Pass docs_url=None to FastAPI() to disable the Swagger page, and also redoc_url=None and openapi_url=None, otherwise /redoc and /openapi.json still show the whole API."
      ],
      "sources": [
        { "title": "FastAPI tutorial: Interactive API docs", "url": "https://fastapi.tiangolo.com/tutorial/first-steps/#interactive-api-docs" },
        { "title": "FastAPI tutorial: Metadata and Docs URLs", "url": "https://fastapi.tiangolo.com/tutorial/metadata/" }
      ]
    },
    {
      "id": "path-parameters",
      "title": "Path parameters",
      "explanation": "A path parameter is a changing part of the URL. You write it in curly braces inside the path, such as `/items/{item_id}`, and declare a function parameter with exactly the same name. FastAPI passes the value from the URL into that parameter.\n\nThe type hint matters. With `item_id: int`, FastAPI converts the text `42` from the URL to the integer `42`. If the text cannot be converted, such as `/items/foo`, FastAPI does not call your function. It answers with status `422` (\"Unprocessable Content\": the request was well formed but its data is invalid) and a JSON body with a `detail` list that says which value failed. For this case the entry contains `\"type\":\"int_parsing\"` and `\"loc\":[\"path\",\"item_id\"]`; `loc` (location) tells you the error was in the path, in the parameter `item_id`.\n\nOrder matters. FastAPI checks path operations in the order you declare them and uses the first match. So a fixed path such as `/users/me` must be declared before `/users/{user_id}`. Otherwise the text `me` would be matched by `{user_id}`, fail the `int` conversion and give a 422.",
      "analogy": "A path parameter is the house number in an address. The street name is fixed, the number changes from visit to visit, and it has to be a real number: \"Main Street, banana\" is rejected. The special house \"Town Hall\" has its own sign and must be checked before the general number rule.",
      "code": [
        {
          "language": "python",
          "filename": "main.py",
          "source": "from fastapi import FastAPI\n\napp = FastAPI()\n\n\n@app.get(\"/items/{item_id}\")\ndef read_item(item_id: int) -> dict[str, int]:\n    return {\"item_id\": item_id}",
          "output": "GET /items/42    ->  200  {\"item_id\":42}\nGET /items/foo   ->  422  body contains \"type\":\"int_parsing\" and \"loc\":[\"path\",\"item_id\"]",
          "explanation": "The 42 in the URL is converted to an int before read_item runs. The text foo cannot become an int, so FastAPI rejects the request itself. For the 422 only the key fields are shown; the full message text can vary between versions."
        },
        {
          "language": "python",
          "filename": "main.py",
          "source": "from fastapi import FastAPI\n\napp = FastAPI()\n\n\n@app.get(\"/users/me\")\ndef read_current_user() -> dict[str, str]:\n    return {\"user\": \"current\"}\n\n\n@app.get(\"/users/{user_id}\")\ndef read_user(user_id: int) -> dict[str, int]:\n    return {\"user_id\": user_id}",
          "output": "GET /users/me   ->  200  {\"user\":\"current\"}\nGET /users/7    ->  200  {\"user_id\":7}",
          "explanation": "The fixed path /users/me is declared first, so it wins for that exact URL. All other /users/<number> URLs fall through to the parameter path. If you swapped the two functions, /users/me would return 422."
        }
      ],
      "productionNote": "Path parameters identify one resource: /orders/{order_id}, /users/{username}. Type hints give you free validation, so your function never sees a bad id.",
      "commonMistakes": [
        "A name mismatch between the braces and the function parameter, for example {item_id} in the path but id in the function. FastAPI then treats the parameter as something else and the endpoint does not work as intended.",
        "Declaring /users/{user_id} before /users/me. The text me matches first, fails int conversion and returns 422."
      ],
      "sources": [
        { "title": "FastAPI tutorial: Path Parameters", "url": "https://fastapi.tiangolo.com/tutorial/path-params/" },
        { "title": "FastAPI tutorial: Order matters", "url": "https://fastapi.tiangolo.com/tutorial/path-params/#order-matters" }
      ]
    },
    {
      "id": "query-parameters",
      "title": "Query parameters",
      "explanation": "A query string is the part of a URL after the `?`, such as `?skip=5&q=pen`: a list of `name=value` pairs joined by `&` (you saw this in the HTTP basics topic). In FastAPI, any function parameter that is not part of the path is read as a query parameter.\n\nThe default value decides whether it is required. `limit: int = 10` is optional and uses 10 when the client leaves it out. A parameter with no default is required, and the request gets a 422 if it is missing. `q: str | None = None` is optional and becomes `None` when absent (the `X | None` hint comes from the type hints topic).\n\nValues arrive as text but FastAPI converts them using your hint, so `\"5\"` becomes the integer `5`, and for a `bool` parameter `\"true\"` becomes `True`. A value that cannot be converted gives a 422, just like with path parameters.\n\nThe example uses the path `/items/` with a trailing slash. This is a different path from `/items/{item_id}`, so the two never clash.",
      "analogy": "Query parameters are the optional notes on an order: \"extra sauce, no onions\". The order still works without them, because the kitchen has sensible defaults, but a note that makes no sense (\"extra sauce: purple\") is sent back.",
      "code": [
        {
          "language": "python",
          "filename": "main.py",
          "source": "from fastapi import FastAPI\n\napp = FastAPI()\n\n\n@app.get(\"/items/\")\ndef list_items(\n    skip: int = 0, limit: int = 10, q: str | None = None\n) -> dict[str, int | str | None]:\n    return {\"skip\": skip, \"limit\": limit, \"q\": q}",
          "output": "GET /items/?skip=5&q=pen   ->  200  {\"skip\":5,\"limit\":10,\"q\":\"pen\"}\nGET /items/                ->  200  {\"skip\":0,\"limit\":10,\"q\":null}",
          "explanation": "None of the three parameters appear in the path, so all are query parameters, and all have defaults, so all are optional. In the first request skip is converted from \"5\" to 5, limit keeps its default and q is the text pen. In the second request every default is used, and None becomes JSON null."
        }
      ],
      "productionNote": "Query parameters are used for pagination (skip and limit), search, filtering and sorting. Always give list endpoints a limit so a client cannot request millions of rows at once.",
      "commonMistakes": [
        "Forgetting the default value and making a parameter required by accident. Clients that leave it out receive a 422.",
        "Returning a huge list without a limit parameter. Large responses are slow and can overload the server."
      ],
      "sources": [
        { "title": "FastAPI tutorial: Query Parameters", "url": "https://fastapi.tiangolo.com/tutorial/query-params/" }
      ]
    }
  ],
  "quiz": [
    {
      "question": "Which command reloads automatically when you save a file, and which one is meant for production?",
      "options": [
        "uv run fastapi run main.py reloads; uv run fastapi dev main.py is for production",
        "Both reload; the difference is only the port number",
        "uv run fastapi dev main.py reloads; uv run fastapi run main.py is for production",
        "uv add fastapi reloads; uv sync is for production"
      ],
      "answerIndex": 2,
      "explanation": "fastapi dev watches files, reloads on save and listens on localhost only. fastapi run does not reload and listens on all interfaces, which suits deployment."
    },
    {
      "question": "A route is declared as /items/{item_id} with item_id: int. What does FastAPI answer for GET /items/abc?",
      "options": [
        "422 with a detail list describing the invalid path value",
        "200 with {\"item_id\":\"abc\"} because the text is passed along",
        "404 with {\"detail\":\"Not Found\"} because the route is missing",
        "Your function runs, hits a conversion crash and answers with a 500 error"
      ],
      "answerIndex": 0,
      "explanation": "The text abc cannot be converted to int, so FastAPI rejects the request with 422 before your function is called. The route does exist, so it is not a 404."
    },
    {
      "question": "In def list_items(skip: int = 0, limit: int = 10), the path is /items/. What kind of parameter is limit?",
      "options": [
        "A required path parameter that must appear in the URL",
        "A required query parameter that the caller must always send",
        "An optional path parameter that can be left out of the URL",
        "An optional query parameter that defaults to 10"
      ],
      "answerIndex": 3,
      "explanation": "limit is not in the path, so it is a query parameter, and because it has a default value it is optional."
    },
    {
      "question": "Where can you try your endpoints in the browser without writing any client code?",
      "options": [
        "At /openapi.json, which has a Try it out button",
        "At /docs, the Swagger UI page generated from your code",
        "At /redoc, which sends requests when you click an endpoint",
        "Only after writing a separate HTML page by hand"
      ],
      "answerIndex": 1,
      "explanation": "/docs is Swagger UI with a Try it out button. /openapi.json is only the raw description, and /redoc is read-only."
    },
    {
      "question": "Why must /users/me be declared before /users/{user_id}?",
      "options": [
        "Because FastAPI requires every path to be declared in alphabetical order",
        "Because FastAPI only allows one path operation per file, so order is fixed",
        "Because functions without parameters must always come before all others",
        "Because the first matching path wins, so otherwise me would match {user_id} and fail int conversion with a 422"
      ],
      "answerIndex": 3,
      "explanation": "FastAPI tries path operations in declaration order. The parameter path would swallow the text me, so the fixed path has to come first."
    },
    {
      "question": "Why put quotes around the package name in `uv add \"fastapi[standard]\"`?",
      "options": [
        "So the shell does not treat the square brackets as a file pattern",
        "So the install runs faster than it would without any quotes",
        "So uv picks a newer Python version for the whole project",
        "So uv skips writing pyproject.toml when it adds the package"
      ],
      "answerIndex": 0,
      "explanation": "Some shells, such as zsh, read square brackets as a filename pattern and fail. Quotes pass the text to uv unchanged."
    },
    {
      "question": "A client requests a URL that no path operation handles. What does FastAPI return?",
      "options": [
        "200 with an empty body",
        "500 with a traceback",
        "404 with {\"detail\":\"Not Found\"}",
        "422 with a detail list"
      ],
      "answerIndex": 2,
      "explanation": "With no matching path operation, FastAPI answers 404 with {\"detail\":\"Not Found\"}. A 422 is for a matching route whose input is invalid."
    }
  ]
});
