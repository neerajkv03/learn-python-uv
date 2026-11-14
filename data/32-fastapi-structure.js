window.TOPICS = window.TOPICS || [];
window.TOPICS.push({
  "id": "32-fastapi-structure",
  "order": 32,
  "title": "Structuring FastAPI Apps",
  "version": "Python 3.15.2 + uv 0.13.7 + FastAPI 0.162.5 + Pydantic 2.14.3 + Uvicorn 0.54.0 + SQLModel 0.0.49 + HTTPX 0.28.1 + SQLite 3.54.1 + pydantic-settings 2.16.2 + pwdlib 0.3.1 + PyJWT 2.15.1",
  "summary": "A real FastAPI app outgrows a single file. This topic shows how to split routes into several files with APIRouter, run code once at startup and shutdown with a lifespan function, read settings from environment variables and a .env file with pydantic-settings, let a browser frontend on another address call your API with CORS (Cross-Origin Resource Sharing, the browser rule that stops one site reading another site's API replies unless the API allows it), and run small jobs after the response with BackgroundTasks.",
  "prerequisites": ["12-modules-imports", "22-concurrency-asyncio", "24-production-workflow", "31-fastapi-sqlmodel"],
  "subtopics": [
    {
      "id": "apirouter-multi-file-layout",
      "title": "APIRouter and multi-file layout",
      "explanation": "So far every route lived in one file. That works for five endpoints (an endpoint is one URL plus one HTTP method that your API answers). With fifty it becomes unreadable. FastAPI solves this with an APIRouter: a small \"mini-app\" that holds a group of related routes. You write the routes on the router in their own file, and then plug the router into the main app.\n\nA router takes two useful options. prefix is text put in front of every route path in that router, so prefix=\"/items\" and a route path of \"/\" together answer at /items/. tags is a list of labels; the interactive docs page at /docs groups endpoints under their tag name, so all item routes appear in one \"items\" section.\n\nThe plug-in step is app.include_router(router), called on the main FastAPI() object. Routes from the router then behave exactly as if you had written them on the app.\n\nTo split code over files you use a package, which is a folder containing a file named __init__.py (it can be empty), as taught in the modules topic. Create this layout inside your project folder (the one with pyproject.toml, where fastapi[standard] is already installed from the first FastAPI topic; if not, run uv add \"fastapi[standard]\" there). Make the folders app and app/routers, and put an empty __init__.py in each. You can do that in your editor, or in Git Bash (see topic 31) with: mkdir -p app/routers, then touch app/__init__.py app/routers/__init__.py (mkdir creates folders, touch creates empty files).\n\nThen create app/routers/items.py and app/main.py with the contents shown below. Start the server from the project folder (not from inside app) with uv run fastapi dev app/main.py. The command finds the app object in that file, and the import from app.routers works because you started it from the project root.",
      "analogy": "Think of a department store. Each department (a router) runs its own counters: clothing sells clothes, kitchenware sells pans. The store directory at the entrance (main.py) just lists which departments exist and where to find them. The prefix is the department's floor number printed in front of every aisle, and the tag is the sign above the department that groups its aisles.",
      "code": [
        {
          "language": "text",
          "filename": "layout.txt",
          "source": "my-project/\n  pyproject.toml\n  app/\n    __init__.py\n    main.py\n    routers/\n      __init__.py\n      items.py",
          "output": "",
          "explanation": "The folder layout. The two __init__.py files are empty; they mark app and app/routers as packages so that from app.routers import items works."
        },
        {
          "language": "python",
          "filename": "app/routers/items.py",
          "source": "from fastapi import APIRouter\n\nrouter = APIRouter(prefix=\"/items\", tags=[\"items\"])\n\n\n@router.get(\"/\")\ndef list_items() -> list[str]:\n    return [\"pen\", \"ink\"]\n",
          "output": "",
          "explanation": "The router lives in its own file. The route path is just \"/\" because the prefix \"/items\" is added automatically. Nothing is printed: this file only defines the router."
        },
        {
          "language": "python",
          "filename": "app/main.py",
          "source": "from fastapi import FastAPI\n\nfrom app.routers import items\n\napp = FastAPI()\napp.include_router(items.router)\n",
          "output": "GET /items/  ->  200  [\"pen\",\"ink\"]",
          "explanation": "main.py imports the items module and plugs its router into the app. After uv run fastapi dev app/main.py, a GET request to http://127.0.0.1:8000/items/ returns status 200 and the JSON body [\"pen\",\"ink\"]. The /docs page shows the endpoint under the \"items\" tag."
        }
      ],
      "productionNote": "Every app beyond a few endpoints is split this way: one router file per area, such as users, orders and auth, each with its own prefix and tag. Keep shared things (for example the database engine and session helper from the SQLModel topic) in their own module such as app/db.py, which both the routers and main.py import.",
      "commonMistakes": [
        "Repeating the prefix in the route path. With prefix=\"/items\", writing @router.get(\"/items/\") makes the URL /items/items/. Put only the part after the prefix in the route.",
        "Circular imports (module A imports B while B imports A, so Python fails because one of them is not finished loading). It happens when a router imports something from main.py while main.py imports the router. Move shared things such as the database engine into a separate module like app/db.py and import from there.",
        "Running fastapi dev from inside the app folder. Start it from the project root, so that imports such as from app.routers import items and relative paths such as .env behave as this topic expects."
      ],
      "sources": [
        { "title": "FastAPI: Bigger Applications - Multiple Files", "url": "https://fastapi.tiangolo.com/tutorial/bigger-applications/" }
      ]
    },
    {
      "id": "lifespan-events",
      "title": "Lifespan events (startup / shutdown)",
      "explanation": "Save this as main.py in the project root (next to pyproject.toml, not inside app/); the root main.py is used for the rest of this topic.\n\nSome work must happen exactly once when the server starts, and some when it stops: create database tables, open a connection pool (a reusable set of open database connections), load a machine-learning model, or close an HTTP client cleanly. FastAPI calls this the lifespan of the app.\n\nYou write the lifespan as a function decorated with @asynccontextmanager from contextlib. That is the async version of the @contextmanager decorator from the decorators topic: a function with a single yield, where code before the yield is setup and code after it is cleanup. \"Async\" means it is declared with async def, as in the concurrency topic.\n\nFor a lifespan, the code before yield runs once at startup, before the first request is served. The code after yield runs once at shutdown. You hand the function to the app with FastAPI(lifespan=lifespan). The function receives the app as a parameter. It must be async def even if its body does nothing asynchronous.\n\nOlder tutorials use @app.on_event(\"startup\") and @app.on_event(\"shutdown\"). Those are deprecated (still present but discouraged). If you pass a lifespan, any on_event handlers are ignored, so do not mix them.\n\nIn the SQLModel topic you called SQLModel.metadata.create_all(engine) at the top of main.py. The better place is the lifespan: put that line before the yield, so the tables are created when the server starts and not as a side effect (a hidden action) of merely importing the module.",
      "analogy": "Opening and closing a shop. Before the first customer you unlock the door and switch on the lights (code before yield). The shop then serves customers all day (the server handles requests while paused at yield). After the last customer you switch off the lights and lock up (code after yield).",
      "code": [
        {
          "language": "python",
          "filename": "main.py",
          "source": "from contextlib import asynccontextmanager\n\nfrom fastapi import FastAPI\n\nresources: dict[str, str] = {}\n\n\n@asynccontextmanager\nasync def lifespan(app: FastAPI):\n    resources[\"greeting\"] = \"loaded at startup\"\n    print(\"startup\")\n    yield\n    print(\"shutdown\")\n    resources.clear()\n\n\napp = FastAPI(lifespan=lifespan)\n\n\n@app.get(\"/\")\ndef root() -> dict[str, str]:\n    return {\"greeting\": resources[\"greeting\"]}\n",
          "output": "(terminal, when the server starts)\nstartup\n\nGET /  ->  200  {\"greeting\":\"loaded at startup\"}\n\n(terminal, after you press Ctrl+C)\nshutdown",
          "explanation": "Run it with uv run fastapi dev main.py. The word startup appears in the terminal once, as the server starts. The dictionary is filled before any request, so GET / returns the greeting. Pressing Ctrl+C stops the server and prints shutdown. The server also prints its own log lines between these; only your print lines are shown here."
        }
      ],
      "productionNote": "Typical lifespan work is creating tables in development, warming a cache, opening a shared HTTP client or database pool at startup, and closing it after the yield so connections are released cleanly. In production, schema changes are normally done with migrations (versioned scripts that change a database structure) instead of create_all, but the lifespan is still where you open and close shared resources.",
      "commonMistakes": [
        "Doing heavy work at module level (top of the file), which runs on every import, including imports by tools and tests. Put it in the lifespan instead.",
        "Mixing the deprecated @app.on_event(\"startup\") with lifespan. When a lifespan is given, the on_event handlers are ignored and your startup code silently never runs.",
        "Writing the lifespan as a plain def or forgetting @asynccontextmanager. It must be an async def function with the decorator and a single yield."
      ],
      "sources": [
        { "title": "FastAPI: Lifespan Events", "url": "https://fastapi.tiangolo.com/advanced/events/" }
      ]
    },
    {
      "id": "settings-environment-variables",
      "title": "Configuration from environment variables",
      "explanation": "An environment variable is a named value that lives outside your code, in the operating system's environment of the running program, as taught in the production workflow topic. Values like a database URL or a secret key differ between your laptop, a test server and production, and secrets must never be hard-coded in source files that are committed to git.\n\nThe package pydantic-settings reads such values into a typed class. Install it with uv add pydantic-settings. You write a class that inherits from BaseSettings (a Pydantic model that fills its fields from the environment). Each field is matched to an environment variable with the same name, ignoring upper or lower case, and the value is validated and converted to the field's type. The text \"true\" in an environment variable becomes the Python bool True when the field is annotated bool.\n\nTo also read a .env file (a plain text file of NAME=value lines kept next to your project, for local development), add model_config = SettingsConfigDict(env_file=\".env\"). The file is looked up relative to the folder where you start the server. Real environment variables take priority over the .env file. Always add .env to .gitignore so secrets are not committed. (.gitignore is a plain text file in the project root that lists files Git must not save; create it with that exact name if the project does not have one.)\n\nCreating Settings() reads the environment and the file every time. To do that once, wrap the creation in a function decorated with @lru_cache (the caching decorator from the standard library topic: it remembers the first return value and returns it again). Then give the function to endpoints with Depends(get_settings), exactly like the dependencies from the dependencies topic. In tests you can later swap it for different settings.\n\nCreate three files in the same folder: config.py and main.py as shown, and a file named .env (the name only, starting with a dot and nothing before it) containing the single line DEBUG=true. In your editor choose New File and type .env as the name. Run with uv run fastapi dev main.py.",
      "analogy": "A thermostat reads the dial on the wall, which is the environment, instead of having one temperature welded inside the device. To change the temperature for another room or season you turn the dial and leave the device untouched. Likewise you change DEBUG or the database URL outside the code, and the same program behaves correctly in dev, staging and production.",
      "code": [
        {
          "language": "python",
          "filename": "config.py",
          "source": "from functools import lru_cache\n\nfrom pydantic_settings import BaseSettings, SettingsConfigDict\n\n\nclass Settings(BaseSettings):\n    app_name: str = \"Shop API\"\n    debug: bool = False\n    database_url: str = \"sqlite:///database.db\"\n\n    model_config = SettingsConfigDict(env_file=\".env\")\n\n\n@lru_cache\ndef get_settings() -> Settings:\n    return Settings()\n",
          "output": "",
          "explanation": "Each field has a default that is used when no environment variable or .env line provides a value. get_settings builds the Settings object once and returns the same object afterwards. Nothing is printed."
        },
        {
          "language": "text",
          "filename": ".env",
          "source": "DEBUG=true",
          "output": "",
          "explanation": "The .env file. The name DEBUG matches the field debug because names are compared ignoring case."
        },
        {
          "language": "python",
          "filename": "main.py",
          "source": "from typing import Annotated\n\nfrom fastapi import Depends, FastAPI\n\nfrom config import Settings, get_settings\n\napp = FastAPI()\n\n\n@app.get(\"/info\")\ndef info(\n    settings: Annotated[Settings, Depends(get_settings)],\n) -> dict[str, str | bool]:\n    return {\"app_name\": settings.app_name, \"debug\": settings.debug}\n",
          "output": "GET /info  ->  200  {\"app_name\":\"Shop API\",\"debug\":true}",
          "explanation": "FastAPI calls get_settings and passes the result in as settings. app_name keeps its default because no variable sets it, while debug is True because .env contains DEBUG=true. If you delete the .env file and restart, debug becomes false."
        }
      ],
      "productionNote": "Database URLs, secret keys and feature flags come from the environment in every real deployment, with different values per environment (development, staging, production). In production you usually set real environment variables (in the host, container or CI settings) and do not ship a .env file at all.",
      "commonMistakes": [
        "Committing .env with secrets to git. Add .env to .gitignore and share an example file with fake values instead.",
        "Creating Settings() inside every request. That re-reads the environment and the file each time. Use one cached get_settings() with @lru_cache and inject it with Depends.",
        "Expecting the .env file to be found from any folder. The path \".env\" is relative to where you start the server, so run the command from the project root."
      ],
      "sources": [
        { "title": "FastAPI: Settings and Environment Variables", "url": "https://fastapi.tiangolo.com/advanced/settings/" },
        { "title": "Pydantic: Settings Management", "url": "https://docs.pydantic.dev/latest/concepts/pydantic_settings/" }
      ]
    },
    {
      "id": "cors-middleware",
      "title": "CORS middleware",
      "explanation": "Middleware is code that runs around every request and response that passes through the app, before your route function and after it. FastAPI lets you add middleware with app.add_middleware(...). A common one is CORS.\n\nAn origin is the combination of scheme, host and port of a web address. A page served from http://localhost:5173 (a typical frontend development server) and an API at http://127.0.0.1:8000 are different origins, because the host and port differ. By default a browser refuses to let JavaScript (the programming language that runs inside web pages) on a page read responses from a different origin than the page's own. CORS, Cross-Origin Resource Sharing, is the standard way for the API to say \"this other origin is allowed\", by sending a header (a name and value line sent with a response) called access-control-allow-origin.\n\nFastAPI ships a ready middleware for this: CORSMiddleware. You give it allow_origins, a list of the exact origins you trust. allow_credentials=True lets the browser send cookies (small pieces of data a site stores in the browser, often used to stay logged in) and login information. allow_methods and allow_headers list which HTTP methods and request headers are permitted; [\"*\"] (a wildcard, meaning every value) means all of them. For requests that could change data, the browser first sends a preflight (a small automatic request using the HTTP method OPTIONS (\"am I allowed?\"), asking \"am I allowed?\"), and the middleware answers it for you.\n\nCORS is enforced only by browsers. A Python script, curl or a mobile app ignores it completely, so it is not a security barrier for your API. To see the header yourself, use curl -i (it prints the response headers) and add the header with -H. Run these in Git Bash or a macOS/Linux terminal, as in topic 31.",
      "analogy": "A guest list at the door. The browser is the bouncer standing in front of the guest, which is the web page. The API answers with a list of origins it welcomes. If the page's origin is on the list, the bouncer lets the page read the reply; if not, the reply is held back. Someone who walks in without a bouncer (curl, a script) is not stopped by the list at all.",
      "code": [
        {
          "language": "python",
          "filename": "main.py",
          "source": "from fastapi import FastAPI\nfrom fastapi.middleware.cors import CORSMiddleware\n\napp = FastAPI()\n\napp.add_middleware(\n    CORSMiddleware,\n    allow_origins=[\"http://localhost:5173\"],\n    allow_credentials=True,\n    allow_methods=[\"*\"],\n    allow_headers=[\"*\"],\n)\n\n\n@app.get(\"/ping\")\ndef ping() -> dict[str, bool]:\n    return {\"ok\": True}\n",
          "output": "",
          "explanation": "Replace main.py with this version. Only the page origin http://localhost:5173 is on the guest list. Run it with uv run fastapi dev main.py. The file itself prints nothing; the next example shows requests against it."
        },
        {
          "language": "bash",
          "filename": "check-cors.sh",
          "source": "curl -i -H \"Origin: http://localhost:5173\" http://127.0.0.1:8000/ping\ncurl -i -H \"Origin: http://evil.example\" http://127.0.0.1:8000/ping",
          "output": "HTTP/1.1 200 OK\naccess-control-allow-credentials: true\naccess-control-allow-origin: http://localhost:5173\ncontent-type: application/json\n(other headers omitted)\n\n{\"ok\":true}\n\nHTTP/1.1 200 OK\naccess-control-allow-credentials: true\ncontent-type: application/json\n(other headers omitted)\n\n{\"ok\":true}",
          "explanation": "Both requests succeed with 200 and the body {\"ok\":true}, because the server answers anyone. The difference is one header: for the listed origin the response contains access-control-allow-origin: http://localhost:5173, while for http://evil.example it does not, so a browser would stop that page from reading the reply. The access-control-allow-credentials header appears in both replies; the browser decides by access-control-allow-origin."
        }
      ],
      "productionNote": "You need CORS whenever a single-page app (a website that loads one page and updates it with JavaScript) or web frontend is served from a different domain or port than the API, for example frontend on app.example.com and API on api.example.com. List the exact production origins, and read them from settings (the previous sub-topic) so dev and production can differ.",
      "commonMistakes": [
        "Using allow_origins=[\"*\"] together with allow_credentials=True. Browsers do not accept a wildcard when credentials are involved, so list exact origins instead.",
        "Thinking CORS protects the API from non-browser clients. curl and scripts ignore it; protect data with authentication (the next topics), not with CORS.",
        "Writing an origin with a trailing slash or the wrong port, such as \"http://localhost:5173/\". An origin has no path, and scheme, host and port must match exactly."
      ],
      "sources": [
        { "title": "FastAPI: CORS (Cross-Origin Resource Sharing)", "url": "https://fastapi.tiangolo.com/tutorial/cors/" },
        { "title": "MDN: Cross-Origin Resource Sharing (CORS)", "url": "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS" }
      ]
    },
    {
      "id": "background-tasks",
      "title": "Background tasks",
      "explanation": "Sometimes a request triggers extra work the client does not need to wait for: sending a welcome email, writing an audit log line, refreshing a cache. FastAPI lets you schedule such work to run after the response has been sent.\n\nDeclare a parameter of type BackgroundTasks in your route function; FastAPI creates it for you. Then call background_tasks.add_task(function, arg1, arg2, ...). You pass the function itself and its arguments separately, and do not call it. FastAPI sends the response first and then runs the function.\n\nThe client therefore gets its answer immediately, even if the task is slow. The function can be a normal def (FastAPI runs it in a worker thread) or an async def.\n\nBackground tasks live inside the server process. They are for small jobs. If the server restarts before the task runs, the task is lost. Large or must-not-lose work belongs in a dedicated job queue (a separate system that stores jobs durably and runs them in worker processes); that is beyond this course.\n\nThe example keeps its log in a list in memory so you can see the effect. Send the POST request, then the GET request.",
      "analogy": "A cashier hands you the receipt right away so you can leave, and files the paperwork after you have gone. You do not wait for the filing, but it still gets done. If the shop burns down before the cashier files it, the paperwork is lost, which is why it should not hold anything vital.",
      "code": [
        {
          "language": "python",
          "filename": "main.py",
          "source": "from fastapi import BackgroundTasks, FastAPI\n\napp = FastAPI()\n\nlog: list[str] = []\n\n\ndef write_log(message: str) -> None:\n    log.append(message)\n\n\n@app.post(\"/notify/{name}\")\ndef notify(name: str, background_tasks: BackgroundTasks) -> dict[str, str]:\n    background_tasks.add_task(write_log, f\"notified {name}\")\n    return {\"queued\": name}\n\n\n@app.get(\"/log\")\ndef read_log() -> list[str]:\n    return log\n",
          "output": "POST /notify/ada  ->  200  {\"queued\":\"ada\"}\n\nGET /log  ->  200  [\"notified ada\"]",
          "explanation": "Replace main.py with this version. The POST returns {\"queued\":\"ada\"} immediately. After the response is sent, write_log runs with the message \"notified ada\" and appends it to the list. The later GET /log shows that entry. Note that add_task receives write_log without parentheses, followed by its argument."
        }
      ],
      "productionNote": "Common uses are welcome emails after sign-up, audit log lines, and refreshing a cache after a write. When a job must survive restarts, can take minutes, or needs retries, move it to a real job queue instead.",
      "commonMistakes": [
        "Calling the function yourself, as in add_task(write_log(\"x\")). That runs it immediately during the request and passes its return value (None) to add_task. Pass the function and its arguments separately: add_task(write_log, \"x\").",
        "Using background tasks for long-running or must-not-lose work. Tasks vanish if the server restarts, and they compete with request handling for the same process.",
        "Expecting the task's result in the response. The response is sent before the task runs, so the task cannot change what the client receives."
      ],
      "sources": [
        { "title": "FastAPI: Background Tasks", "url": "https://fastapi.tiangolo.com/tutorial/background-tasks/" }
      ]
    }
  ],
  "quiz": [
    {
      "question": "A router is created with APIRouter(prefix=\"/items\") and has a route @router.get(\"/\"). Which URL path answers that route once the router is included in the app?",
      "options": [
        "/items/",
        "/",
        "/items/items/",
        "/router/items/"
      ],
      "answerIndex": 0,
      "explanation": "The prefix is put in front of every route path in the router, so \"/items\" plus \"/\" gives /items/. Without a prefix the route would answer at /. /items/items/ happens only if you repeat the prefix inside the route path."
    },
    {
      "question": "Where should code that creates database tables at startup go in a current FastAPI app?",
      "options": [
        "In a function decorated with @app.on_event(\"startup\"), which is the recommended way",
        "In a lifespan function passed to FastAPI(lifespan=...), before the yield; on_event is deprecated and is ignored when a lifespan is given",
        "Inside every route function, so the tables are created on each request",
        "After the yield in the lifespan function, so it runs when the server shuts down"
      ],
      "answerIndex": 1,
      "explanation": "Code before the yield in a lifespan async context manager runs once at startup. on_event is deprecated, and if a lifespan is set its on_event handlers are ignored. Code after the yield runs at shutdown, which is too late for creating tables."
    },
    {
      "question": "A Settings class (BaseSettings) has a field debug: bool = False, and the .env file contains DEBUG=true. What value does settings.debug have?",
      "options": [
        "False, because the default written in the class always wins over any .env file",
        "The string \"true\", because .env files only contain plain text and nothing converts it",
        "True: the name matches ignoring case, and the text is validated and converted to bool",
        "It raises an error because the names DEBUG and debug differ"
      ],
      "answerIndex": 2,
      "explanation": "pydantic-settings matches field names to environment variable names case-insensitively, reads the .env file named in env_file, and converts the text to the field's type. A default is used only when no value is found."
    },
    {
      "question": "Your API has CORSMiddleware that allows only http://localhost:5173. Can a Python script running on another machine still call your API?",
      "options": [
        "No, CORS rejects every client of any kind whose origin is not on the allowed list",
        "No, the API automatically rejects every request that does not come from a browser",
        "No, a script must first be given allow_credentials=True before it can call the API",
        "Yes, CORS is enforced only by browsers, so scripts and curl are not blocked by it"
      ],
      "answerIndex": 3,
      "explanation": "CORS is a rule that browsers apply to web pages. The server still answers every client; the headers merely tell a browser whether the page may read the reply. It is not an access control mechanism, so use authentication to protect data."
    },
    {
      "question": "In a FastAPI route you write background_tasks.add_task(write_log, \"hello\"). When does write_log run?",
      "options": [
        "After the response has been sent to the client",
        "Before the route function starts running",
        "Immediately on that line, and the response waits for it to finish",
        "Never, unless the client sends a second request to trigger it"
      ],
      "answerIndex": 0,
      "explanation": "add_task only schedules the call. FastAPI sends the response first and then runs write_log, so the client does not wait. Because it lives in the server process, it is lost if the server restarts before it runs."
    }
  ]
});
