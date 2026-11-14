window.TOPICS = window.TOPICS || [];
window.TOPICS.push({
  "id": "35-fastapi-async-deploy",
  "order": 35,
  "title": "Async & Deployment",
  "version": "Python 3.15.2 + uv 0.13.7 + FastAPI 0.162.5 + Pydantic 2.14.3 + Uvicorn 0.54.0 + SQLModel 0.0.49 + HTTPX 0.28.1 + SQLite 3.54.1 + pydantic-settings 2.16.2 + pwdlib 0.3.1 + PyJWT 2.15.1",
  "summary": "Learn when a FastAPI endpoint should be async def and when plain def is safer, then run the app in production with fastapi run and several worker processes. Package it in a Docker image built with uv, run SQLite safely (WAL (Write-Ahead Logging) mode, one writer, a volume, backups), and add a health-check endpoint with a Docker HEALTHCHECK.",
  "prerequisites": ["22-concurrency-asyncio", "24-production-workflow", "25-sqlite-sqlite3", "34-fastapi-testing"],
  "subtopics": [
    {
      "id": "async-def-vs-def",
      "title": "async def vs def endpoints",
      "explanation": "In topic 22 you learned that an async def function (a coroutine) runs on the event loop, a single loop that switches between tasks whenever one of them hits an await. FastAPI lets you write each endpoint either way, and the choice matters.\n\nAn async def endpoint runs directly on the event loop. It may only await non-blocking calls. A blocking call is one that makes the whole thread wait and do nothing, such as time.sleep, a synchronous database query or a call made with the requests library. While it waits, the loop cannot serve any other request, so one slow call freezes every client.\n\nA plain def endpoint is different. FastAPI runs it in a thread pool (a set of worker threads kept ready for jobs), so blocking inside it only stalls that one thread while other requests continue. This makes def the safe choice for blocking code.\n\nThe rule of thumb: if the library you call offers an async API that you await (for example an async HTTP client), use async def. Otherwise use def. The SQLModel Session from topic 31 is synchronous (it waits for each database answer before the code continues), so endpoints that use it should be plain def. For most apps both styles are fast enough, so correctness matters more than micro-speed.\n\nThe bad version is writing time.sleep(0.1) inside an async def endpoint: it would block the loop for 0.1 seconds on every call, and all other requests would queue behind it.",
      "analogy": "The event loop is one super-fast waiter who must never stand waiting at a single table, because every other table would go unserved: he only takes orders and hands them over. A def endpoint is a team of waiters (the thread pool) where each one may stand and wait at a table without stopping the others. Blocking work belongs with the team, non-blocking work with the fast waiter.",
      "code": [
        {
          "language": "python",
          "filename": "main.py",
          "source": "import asyncio\nimport time\n\nfrom fastapi import FastAPI\n\napp = FastAPI()\n\n\n@app.get(\"/sync\")\ndef sync_endpoint() -> dict[str, str]:\n    # Blocking is OK in a plain def: FastAPI runs it in a thread pool.\n    time.sleep(0.1)\n    return {\"kind\": \"def\"}\n\n\n@app.get(\"/async\")\nasync def async_endpoint() -> dict[str, str]:\n    # Only non-blocking waits (await) are allowed in async def.\n    await asyncio.sleep(0.1)\n    return {\"kind\": \"async\"}\n",
          "output": "GET /sync   ->  200  {\"kind\":\"def\"}\nGET /async  ->  200  {\"kind\":\"async\"}",
          "explanation": "Save this as main.py in a project that has fastapi[standard] installed (topic 28). Both endpoints pause for 0.1 seconds and return JSON. The def one blocks its own thread with time.sleep, which is fine. The async def one uses await asyncio.sleep, which hands control back to the event loop while it waits. The output lines show the request and the response status and body that a client receives."
        }
      ],
      "productionNote": "Use async def for endpoints that mostly wait on other services through async clients (for example calling several external APIs at once). Use plain def for ordinary CRUD (create, read, update, delete) endpoints that use a synchronous database session. If you must call blocking code from async def, move it into a def function instead.",
      "commonMistakes": [
        "Using async def and then calling blocking code inside it (time.sleep, a synchronous database session, the requests library). The event loop freezes and every request waits.",
        "Forgetting await in front of a coroutine call. You then get a coroutine object (an unstarted job) instead of the result, and the work never runs."
      ],
      "sources": [
        { "title": "FastAPI: Concurrency and async / await (in a hurry)", "url": "https://fastapi.tiangolo.com/async/#in-a-hurry" },
        { "title": "FastAPI: Path operation functions", "url": "https://fastapi.tiangolo.com/async/#path-operation-functions" }
      ]
    },
    {
      "id": "fastapi-run-and-workers",
      "title": "fastapi run and workers",
      "explanation": "In topic 28 you met fastapi dev, which is for development: it reloads on every file change. For real traffic you use fastapi run instead. It starts Uvicorn (the server that speaks to clients) with production settings: it listens on host 0.0.0.0 (all network interfaces, so other machines can connect), port 8000 by default, and does not reload.\n\nThe command is uv run fastapi run main.py. Use --port to change the port, for example --port 80.\n\nOne server process uses one CPU core at a time for Python code. To use more cores, add --workers 4. This starts 4 separate processes (topic 22), each running its own copy of your app and sharing the incoming requests.\n\nBecause they are separate processes, each worker has its own memory. A module-level dict or counter is not shared: worker 1 may hold different data than worker 2. Anything that must be shared belongs in a database.\n\nInside containers or Kubernetes (a system that runs and scales many containers), people usually run 1 worker per container and add more containers instead. If a reverse proxy sits in front of your app (a server that receives the traffic first and handles HTTPS), look up the --proxy-headers option so the app sees the real client address. We only mention it here.",
      "analogy": "Workers are extra checkout counters in a shop. More counters serve more customers at once, but each counter has its own cash drawer: money put in one drawer is not visible in another. Shared records have to be kept in the back-office ledger (the database).",
      "code": [
        {
          "language": "bash",
          "filename": "run-production.sh",
          "source": "uv run fastapi run main.py --port 8000 --workers 4",
          "output": "",
          "explanation": "Starts the app from main.py on port 8000 with 4 worker processes. The server keeps running and logs requests until you stop it with Ctrl+C. It prints startup log lines, which are left out here."
        }
      ],
      "productionNote": "Use fastapi run on virtual machines and in containers that serve real traffic. Choose the worker count from the CPU cores you have, or keep 1 worker and scale containers when an orchestrator manages them.",
      "commonMistakes": [
        "Keeping state in memory (a module-level dict or counter) while running several workers. Each worker sees different data, so use the database for shared state.",
        "Running fastapi dev in production. It is meant for development: it reloads on file changes and is not tuned for real traffic."
      ],
      "sources": [
        { "title": "FastAPI: Server workers", "url": "https://fastapi.tiangolo.com/deployment/server-workers/" },
        { "title": "FastAPI: Run a server manually", "url": "https://fastapi.tiangolo.com/deployment/manually/" }
      ]
    },
    {
      "id": "docker-image-with-uv",
      "title": "Docker image with uv",
      "explanation": "Topic 24 introduced Docker: a Dockerfile is a recipe that builds an image (a packaged filesystem with your app and everything it needs), and a container is a running copy of that image. Here we apply the uv pattern from that topic to a FastAPI app.\n\nThe Dockerfile below starts from a slim Python image (a small Docker base image that contains only the essentials), copies the uv program in from the official uv image (pinned, meaning fixed to this exact version, 0.13.7), and sets two environment variables from topic 24 (compile bytecode, meaning store Python's precompiled form so startup is faster; copy files instead of linking, meaning copy the packages in rather than sharing them).\n\nThen it installs only the dependencies first, using uv sync --locked --no-install-project --no-dev. The --mount options let this step read uv.lock and pyproject.toml and reuse uv's download cache without copying them into the image layer (one cached build step in the image). Because this layer only changes when the dependencies change, Docker caches it and rebuilds are fast.\n\nNext it copies your code and runs uv sync --locked --no-dev again to install the project itself. --locked fails if uv.lock is out of date and --no-dev leaves out development tools like pytest. The ENV PATH line puts the virtual environment's bin folder first, so the command fastapi is found.\n\nFinally CMD sets the command run when the container starts. Write it in exec form, a JSON list of strings, so the server is started directly and receives stop signals (like the one docker stop sends) and shuts down quickly. Run one worker per container. This file expects your app at app/main.py (the multi-file layout from topic 32; if your app is a single main.py in the project root, change that path in CMD to main.py), and it needs a file named .dockerignore (that exact name, no other part) in the project folder, containing one line: .venv, so your local virtual environment is not copied in.",
      "analogy": "The image is a shipping container with the shop already fully set up inside: shelves stocked, till installed. You can unload it on any machine that has Docker, open the doors, and the shop is ready for business without any setup.",
      "code": [
        {
          "language": "docker",
          "filename": "Dockerfile",
          "source": "FROM python:3.15-slim\nCOPY --from=ghcr.io/astral-sh/uv:0.13.7 /uv /uvx /bin/\nWORKDIR /app\nENV UV_COMPILE_BYTECODE=1 UV_LINK_MODE=copy\n\n# Layer 1: dependencies only (cached until uv.lock or pyproject.toml change)\nRUN --mount=type=cache,target=/root/.cache/uv \\\n    --mount=type=bind,source=uv.lock,target=uv.lock \\\n    --mount=type=bind,source=pyproject.toml,target=pyproject.toml \\\n    uv sync --locked --no-install-project --no-dev\n\n# Layer 2: your code and the project itself\nCOPY . /app\nRUN --mount=type=cache,target=/root/.cache/uv \\\n    uv sync --locked --no-dev\n\nENV PATH=\"/app/.venv/bin:$PATH\"\n\n# Exec form (JSON list) so stop signals reach the server\nCMD [\"fastapi\", \"run\", \"app/main.py\", \"--port\", \"80\"]\n",
          "output": "",
          "explanation": "Saving this file as Dockerfile (no extension) in the project folder prints nothing by itself. Docker reads it when you run docker build. The server inside listens on port 80 of the container."
        },
        {
          "language": "bash",
          "filename": "build-and-run.sh",
          "source": "docker build -t shop-api .\ndocker run -p 8000:80 shop-api",
          "output": "",
          "explanation": "The first command builds an image named shop-api (-t gives it a name) from the Dockerfile in the current folder (the dot). The second starts a container and maps port 8000 on your computer to port 80 inside it (-p host:container). While it runs, opening http://127.0.0.1:8000/docs in a browser shows the API documentation page. Build logs and server logs are left out here."
        }
      ],
      "productionNote": "A container image is the standard deployment unit on cloud platforms: build it once in CI (topic 24), then run the same image in every environment. Pin the uv version, as above, so builds stay reproducible.",
      "commonMistakes": [
        "Writing CMD in shell form (CMD fastapi run ...). The shell receives the stop signal instead of the server, so docker stop waits and then kills the container slowly. Use the JSON list form.",
        "Copying your local .venv folder into the image. It was built for your own operating system. Add .venv to .dockerignore and let uv create the environment inside the image."
      ],
      "sources": [
        { "title": "FastAPI: FastAPI in Containers - Docker", "url": "https://fastapi.tiangolo.com/deployment/docker/" },
        { "title": "uv: Using uv in Docker", "url": "https://docs.astral.sh/uv/guides/integration/docker/" },
        { "title": "uv: Using uv with FastAPI (deployment)", "url": "https://docs.astral.sh/uv/guides/integration/fastapi/#deployment" }
      ]
    },
    {
      "id": "sqlite-in-production",
      "title": "SQLite in production (WAL, single writer, backups)",
      "explanation": "SQLite (topic 25) is a good fit for one server, but you must know its limits. It allows many readers at the same time, but only one writer at a time. If a second writer arrives while the first is writing, it fails with the error sqlite3.OperationalError: database is locked.\n\nTwo settings help. First, WAL (Write-Ahead Logging) mode: writes go to a separate log file first and are merged into the main file later, so readers keep reading while a write happens. You switch it on with the PRAGMA journal_mode=WAL statement (a PRAGMA is a SQLite setting command). The setting is stored in the database file, so you do it once. It returns the new mode as text. WAL does not work for ':memory:' databases, so the example uses a real file in a temporary folder.\n\nSecond, a timeout: sqlite3.connect(path, timeout=30) sets how long a writer waits for the lock before the \"database is locked\" error is raised. Python's default is 5 seconds; a longer wait such as 30 suits apps that write often.\n\nIn Docker, files written inside a container disappear when the container is replaced. Keep the database on a volume (storage that Docker manages outside the container), for example docker run -v shop-data:/app/data ... mounts the volume shop-data at /app/data.\n\nFor backups, use Connection.backup(target), which copies the database safely even while it is in use. Copying the .db file by hand during a write can give you a broken copy.\n\nSQLite suits one server. If many app servers must write to the same data, or you have heavy concurrent writes, move to a server database such as PostgreSQL.\n\nIn the example, we close both connections before the with block ends, because Windows cannot delete a folder that still contains open files.",
      "analogy": "The database is a notebook that many people can read at once but only one person can write in. WAL is like letting the writer draft on a side sheet, so readers can keep reading the notebook, and the draft is copied into the notebook afterwards. The volume is a locked cabinet bolted to the building, so the notebook survives when the shop is rebuilt; a backup is a photocopy kept somewhere else.",
      "code": [
        {
          "language": "python",
          "filename": "sqlite_prod.py",
          "source": "import sqlite3\nimport tempfile\nfrom pathlib import Path\n\nwith tempfile.TemporaryDirectory() as folder:\n    con = sqlite3.connect(Path(folder) / \"app.db\", timeout=30)\n    print(con.execute(\"PRAGMA journal_mode=WAL\").fetchone()[0])\n    con.execute(\"CREATE TABLE notes (body TEXT)\")\n    with con:\n        con.execute(\"INSERT INTO notes VALUES (?)\", (\"hi\",))\n\n    backup = sqlite3.connect(Path(folder) / \"backup.db\")\n    con.backup(backup)\n    print(backup.execute(\"SELECT body FROM notes\").fetchall())\n\n    # Close before the temp folder is deleted (Windows can't delete open files).\n    backup.close()\n    con.close()\n",
          "output": "wal\n[('hi',)]",
          "explanation": "The script creates a database file in a temporary folder, switches it to WAL mode (the PRAGMA returns the new mode, wal), stores one row, and then uses con.backup(backup) to copy the whole database into a second file. Reading the backup shows the row was copied. The temporary folder is deleted at the end of the with block."
        }
      ],
      "productionNote": "SQLite in WAL mode with a volume and regular backups works well for small and medium single-server apps, internal tools and edge apps. Schedule the backup call (for example a nightly job) and store the copy somewhere other than the same disk.",
      "commonMistakes": [
        "Running SQLite in Docker without a volume. The data is lost the next time the container is replaced or redeployed.",
        "Running several replicas (copies of the app on different machines) that write to one SQLite file on a network share (a folder shared between computers). File locking is unreliable there and the file can be corrupted. Use a server database such as PostgreSQL instead."
      ],
      "sources": [
        { "title": "SQLite: Write-Ahead Logging", "url": "https://www.sqlite.org/wal.html" },
        { "title": "SQLite: Appropriate Uses For SQLite", "url": "https://www.sqlite.org/whentouse.html" },
        { "title": "Python docs: sqlite3 Connection.backup", "url": "https://docs.python.org/3/library/sqlite3.html#sqlite3.Connection.backup" }
      ]
    },
    {
      "id": "health-check-endpoint",
      "title": "Health-check endpoint",
      "explanation": "A health check is a tiny endpoint, usually GET /health, that returns {\"status\": \"ok\"} when the app is alive. Load balancers (servers that spread traffic across copies of your app), orchestrators (systems like Kubernetes that start and stop containers) and uptime monitors call it regularly. If it stops answering, they stop sending traffic to that copy or restart it.\n\nKeep it cheap and fast, and do not put authentication on it, otherwise the probes would be rejected.\n\nDocker can run the check itself with the HEALTHCHECK instruction in the Dockerfile. It runs a command every --interval, and if the command exits with a non-zero code (failure), the container is marked unhealthy. Slim Python images do not contain curl, so use Python itself: urllib.request.urlopen (from the standard library) fetches a URL and raises an exception on connection errors and on HTTP error statuses. An uncaught exception makes python -c exit with a non-zero code, which Docker reads as unhealthy. Inside the container the app listens on port 80, matching the CMD from the previous sub-topic.",
      "analogy": "A nurse who checks your pulse every few minutes. The check is quick and doesn't need a full examination. If the pulse is missing, the nurse calls for help (the orchestrator restarts the container).",
      "code": [
        {
          "language": "python",
          "filename": "main.py",
          "source": "from fastapi import FastAPI\n\napp = FastAPI()\n\n\n@app.get(\"/health\")\ndef health() -> dict[str, str]:\n    return {\"status\": \"ok\"}\n",
          "output": "GET /health  ->  200  {\"status\":\"ok\"}",
          "explanation": "A cheap endpoint with no database access and no authentication. Any answer with status 200 means the app is up."
        },
        {
          "language": "docker",
          "filename": "Dockerfile",
          "source": "HEALTHCHECK --interval=30s --timeout=3s CMD [\"python\", \"-c\", \"import urllib.request; urllib.request.urlopen('http://127.0.0.1:80/health')\"]\n",
          "output": "",
          "explanation": "Add this line to the Dockerfile from the previous sub-topic, before CMD. Every 30 seconds Docker runs the Python one-liner (python -c runs the code in the string). If the request fails or takes more than 3 seconds, the check fails and the container is reported as unhealthy. You can see the state with docker ps."
        }
      ],
      "productionNote": "Health endpoints are used by Docker, Kubernetes probes, cloud load balancers and uptime monitors. Keep them fast and open; if you need a deeper check (for example that the database answers), make it a separate endpoint.",
      "commonMistakes": [
        "Making the health check slow by querying every dependency. A slow check can time out and cause healthy containers to be restarted.",
        "Protecting /health with authentication. The probes (the automatic checks that call /health) send no credentials, so they fail and the app is reported as down."
      ],
      "sources": [
        { "title": "Dockerfile reference: HEALTHCHECK", "url": "https://docs.docker.com/reference/dockerfile/#healthcheck" },
        { "title": "Python docs: urllib.request.urlopen", "url": "https://docs.python.org/3/library/urllib.request.html#urllib.request.urlopen" }
      ]
    }
  ],
  "quiz": [
    {
      "question": "Your endpoint uses a synchronous SQLModel Session to query the database. How should you declare it?",
      "options": [
        "async def, because all FastAPI endpoints must be async and the framework refuses to run any other kind of function",
        "async def with time.sleep added so the loop has time to catch up",
        "Plain def, so FastAPI runs it in a thread pool and the blocking query does not freeze the event loop",
        "Either way, because a blocking call never affects other requests"
      ],
      "answerIndex": 2,
      "explanation": "A synchronous session blocks while it waits for the database. In a plain def endpoint that only stalls one thread of the pool. In async def it would freeze the event loop and every other request."
    },
    {
      "question": "An in-memory counter (a module-level variable) shows different values when you run with --workers 4. Why?",
      "options": [
        "Uvicorn randomly resets variables in every worker a few times a minute to free up memory",
        "Python integers cannot be shared between requests at all",
        "FastAPI copies the counter once per request",
        "Each worker is a separate process with its own memory, so each has its own counter"
      ],
      "answerIndex": 3,
      "explanation": "Workers are separate processes and do not share memory. Shared state must live in something all workers can reach, such as the database."
    },
    {
      "question": "Why should a Dockerfile use the exec form CMD [\"fastapi\", \"run\", ...] instead of the shell form?",
      "options": [
        "So the server process receives stop signals directly and shuts down quickly",
        "Because the shell form cannot run Python programs, only commands that are already built into the system",
        "Because the exec form makes the server use more workers",
        "Because the exec form installs the dependencies"
      ],
      "answerIndex": 0,
      "explanation": "In shell form a shell is started first and receives the signal that docker stop sends, so the server may not shut down gracefully. The exec form starts the server directly."
    },
    {
      "question": "What does WAL mode improve in SQLite, and what limit remains?",
      "options": [
        "It lets many writers write at once; readers are now limited to one",
        "Readers can continue while a write happens; there is still only one writer at a time",
        "It removes the need for backups; the database can grow without limit",
        "It lets several servers safely share one file over a network; writes stay slow but never fail"
      ],
      "answerIndex": 1,
      "explanation": "WAL writes changes to a separate log so readers are not blocked. SQLite still allows only one writer at a time, which is why heavy concurrent writes call for a server database."
    },
    {
      "question": "Why does a Docker HEALTHCHECK in a slim Python image (a small base image with only the essentials) use Python's urllib.request instead of curl?",
      "options": [
        "curl cannot make HTTP requests",
        "urllib.request is the only way to read a /health endpoint from inside a Docker container",
        "Slim images do not include curl, but Python is already there",
        "curl always reports a container as healthy"
      ],
      "answerIndex": 2,
      "explanation": "Slim images contain very little beyond Python. Using urllib.request avoids installing an extra tool, and urlopen raises an error on failure, which gives the non-zero exit code Docker needs."
    },
    {
      "question": "Why must /health not require a login?",
      "options": [
        "Probes send no credentials, so a login requirement would mark a healthy app as down",
        "Login is slower than the check's timeout, so the check would always time out and fail",
        "/health must be an async endpoint, and async endpoints cannot check a login",
        "HEALTHCHECK requires a login, so the endpoint would be asked for one twice"
      ],
      "answerIndex": 0,
      "explanation": "Docker, load balancers and monitors call /health automatically and have no username or token to send. If the endpoint demanded one, they would get an error and wrongly report the app as down."
    },
    {
      "question": "Why does the Dockerfile install from uv.lock and pyproject.toml before copying the rest of the code?",
      "options": [
        "Because Docker cannot read other files until the dependencies are in place",
        "So the dependency layer stays cached until the dependencies change",
        "So the app runs without installing packages at all",
        "To make the container start faster on each run of the app"
      ],
      "answerIndex": 1,
      "explanation": "Docker reuses a cached layer while its inputs are unchanged. Your code changes often but uv.lock and pyproject.toml rarely do, so rebuilds skip the slow install step."
    },
    {
      "question": "Which command is meant for real traffic?",
      "options": [
        "uv run fastapi dev main.py",
        "uv run pytest",
        "uv add fastapi",
        "uv run fastapi run main.py"
      ],
      "answerIndex": 3,
      "explanation": "fastapi run uses production settings and does not reload on file changes. fastapi dev is for development only, pytest runs tests and uv add installs a package."
    }
  ]
});
