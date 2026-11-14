window.TOPICS = window.TOPICS || [];
window.TOPICS.push({
  "id": "34-fastapi-testing",
  "order": 34,
  "title": "Testing FastAPI Apps",
  "version": "Python 3.15.2 + uv 0.13.7 + FastAPI 0.162.5 + Pydantic 2.14.3 + Uvicorn 0.54.0 + SQLModel 0.0.49 + HTTPX 0.28.1 + SQLite 3.54.1 + pydantic-settings 2.16.2 + pwdlib 0.3.1 + PyJWT 2.15.1",
  "summary": "Learn to test a FastAPI app without starting a server, using TestClient (a tool that sends fake requests straight into your app). You will check status codes and JSON bodies, swap real dependencies for fakes, and give every test its own throwaway in-memory SQLite database through pytest fixtures (reusable setup functions).",
  "prerequisites": ["20-testing-pytest", "31-fastapi-sqlmodel", "33-fastapi-auth"],
  "subtopics": [
    {
      "id": "testclient-basics",
      "title": "TestClient basics",
      "explanation": "A test is a small function that runs your code and checks the result with `assert`. To test a web API you must send it requests. You could start the server with `fastapi dev` and call it over the network, but that is slow and fragile. FastAPI gives you `TestClient` instead. It lives in `fastapi.testclient`, and it is built on HTTPX, an HTTP client library (a library that sends requests and reads responses). HTTPX is installed automatically with `fastapi[standard]`, the install you made in the FastAPI first-app topic.\n\n`TestClient(app)` calls your app directly in memory: no server process, no port, no network. You use it like a small browser: `client.get(url)`, `client.post(url, json=...)`, `client.patch(...)` and `client.delete(...)`. Each call returns a response object with `.status_code` (the number such as 200 or 404), `.json()` (the body decoded into Python dicts and lists) and `.headers` (the response headers).\n\nThe optional arguments are: `json=` sends a JSON body, `data=` sends form fields, `params=` adds query string values (the `?a=1` part of a URL) and `headers=` sends extra request headers. Your test functions are plain `def`, even when the endpoint is `async def`; TestClient handles that for you.\n\nSetup by hand. Inside your project folder (the one `uv init` created, with `pyproject.toml` in it), run `uv add \"fastapi[standard]\"` and `uv add --dev pytest` if you have not already. Create `main.py` in the project root and a folder `tests` with a file `test_main.py` inside it. Pytest only collects files named `test_*.py`.\n\nOne extra setting is needed. Your test file does `from main import app`, but Python only looks for `main` in folders on its import path, and the project root is not on it when the test file sits in `tests/`. Open `pyproject.toml` and add the table below. `pythonpath = [\".\"]` tells pytest to add the project root to the import path. Run the tests with `uv run pytest -q` (`-q` means quiet output).\n\nOne more detail: your app may have a lifespan (setup and cleanup code that runs when the app starts and stops, from the app-structure topic). Plain `TestClient(app)` does NOT run it. Only `with TestClient(app) as client:` runs the startup code on entering the block and the shutdown code on leaving it.",
      "analogy": "A flight simulator: you use real controls and read real instruments, and the plane responds as it would in the air, but it never leaves the ground. TestClient is the simulator for your API (no server, no network). Using `with TestClient(app)` is like pressing the full start-up sequence button, which is the only time the engines (lifespan) really start.",
      "code": [
        {
          "language": "toml",
          "filename": "pyproject.toml",
          "source": "[tool.pytest.ini_options]\npythonpath = [\".\"]",
          "output": "",
          "explanation": "Add this table to the existing pyproject.toml. It puts the project root on pytest's import path so tests can write `from main import app`."
        },
        {
          "language": "python",
          "filename": "main.py",
          "source": "from fastapi import FastAPI\n\napp = FastAPI()\n\n\n@app.get(\"/\")\ndef read_root() -> dict[str, str]:\n    return {\"message\": \"Hello World\"}",
          "output": "",
          "explanation": "The smallest possible app. It prints nothing because it only defines the app."
        },
        {
          "language": "python",
          "filename": "tests/test_main.py",
          "source": "from fastapi.testclient import TestClient\n\nfrom main import app\n\nclient = TestClient(app)\n\n\ndef test_root() -> None:\n    response = client.get(\"/\")\n    assert response.status_code == 200\n    assert response.json() == {\"message\": \"Hello World\"}",
          "output": "",
          "explanation": "`client.get(\"/\")` runs the endpoint in memory. The two asserts check the status code and the decoded JSON body."
        },
        {
          "language": "bash",
          "filename": "terminal",
          "source": "uv run pytest -q",
          "output": ".                                                                        [100%]\n1 passed in 0.31s",
          "explanation": "Run from the project root. Each dot is one passing test; the timing in the last line varies."
        },
        {
          "language": "python",
          "filename": "main.py",
          "source": "from collections.abc import AsyncIterator\nfrom contextlib import asynccontextmanager\n\nfrom fastapi import FastAPI\n\nstate = {\"ready\": False}\n\n\n@asynccontextmanager\nasync def lifespan(app: FastAPI) -> AsyncIterator[None]:\n    state[\"ready\"] = True\n    yield\n    state[\"ready\"] = False\n\n\napp = FastAPI(lifespan=lifespan)\n\n\n@app.get(\"/ready\")\ndef ready() -> dict[str, bool]:\n    return state",
          "output": "",
          "explanation": "A second version of main.py (replace the first). Replace tests/test_main.py with the next version as well. The lifespan sets `state[\"ready\"]` to True at startup and back to False at shutdown."
        },
        {
          "language": "python",
          "filename": "tests/test_main.py",
          "source": "from fastapi.testclient import TestClient\n\nfrom main import app, state\n\n\ndef test_without_with() -> None:\n    client = TestClient(app)\n    assert client.get(\"/ready\").json() == {\"ready\": False}\n\n\ndef test_with_with() -> None:\n    with TestClient(app) as client:\n        assert client.get(\"/ready\").json() == {\"ready\": True}\n    assert state[\"ready\"] is False",
          "output": "..                                                                       [100%]\n2 passed in 0.29s",
          "explanation": "Without `with`, startup never ran so ready is False. Inside the `with` block it is True, and after the block the shutdown code has set it back to False."
        }
      ],
      "productionNote": "Run these tests in CI (continuous integration: a service that runs your checks automatically on every push, covered in the production-workflow topic). Because no server or network is needed, they are fast and reliable on any machine.",
      "commonMistakes": [
        "Starting a real server (`fastapi dev`) just to run tests. TestClient needs no server.",
        "Expecting lifespan startup code to run with plain `TestClient(app)`. You need `with TestClient(app) as client:`.",
        "Forgetting `pythonpath = [\".\"]` and getting `ModuleNotFoundError: No module named 'main'` (the error Python raises when an import cannot find the module).",
        "Writing the test function as `async def`. Plain `def` works for both sync and async endpoints."
      ],
      "sources": [
        { "title": "FastAPI: Testing", "url": "https://fastapi.tiangolo.com/tutorial/testing/" },
        { "title": "FastAPI: Testing Events (lifespan)", "url": "https://fastapi.tiangolo.com/advanced/testing-events/" }
      ]
    },
    {
      "id": "status-codes-and-json",
      "title": "Testing status codes and JSON",
      "explanation": "A good API test checks more than the happy path (the case where everything goes right). For every endpoint, test the success case, the \"not found\" case and the \"bad input\" case. Together these pin down the endpoint's contract, which is what clients can rely on.\n\nFor a create endpoint, assert the status code (201 Created) and the body. For a missing item, assert 404 and the `detail` message. For invalid input, FastAPI answers 422 with a `detail` list; each entry has a `loc` (where the problem is, such as `[\"body\", \"price\"]`), a `msg` (human-readable text) and a `type` (a stable error code such as `float_parsing`).\n\nAssert on `loc` and `type`, not on the exact `msg` text. Message wording can change between library versions and would break your tests for no good reason.\n\nSend data with the keyword arguments from the previous sub-topic: `json={...}` for a JSON body, `data={...}` for form fields and `headers={...}` for request headers, for example `client.get(\"/me\", headers={\"Authorization\": \"Bearer abc\"})`.\n\nKeep every test independent. The example app below stores items in a module-level dict, so tests could affect each other. That is why `test_create_and_read` uses the id returned by the create call instead of assuming it is 1. Later in this topic you will see how to give each test a fresh database.",
      "analogy": "A checklist inspector testing doors: tries the right key (happy path), a wrong key (error cases) and no key at all (invalid input), and writes down exactly what each door did.",
      "code": [
        {
          "language": "python",
          "filename": "main.py",
          "source": "from fastapi import FastAPI, HTTPException\nfrom pydantic import BaseModel\n\napp = FastAPI()\n\n\nclass ItemCreate(BaseModel):\n    name: str\n    price: float\n\n\nitems: dict[int, ItemCreate] = {}\n\n\n@app.post(\"/items/\", status_code=201)\ndef create_item(item: ItemCreate) -> dict[str, int]:\n    item_id = len(items) + 1\n    items[item_id] = item\n    return {\"id\": item_id}\n\n\n@app.get(\"/items/{item_id}\")\ndef read_item(item_id: int) -> ItemCreate:\n    if item_id not in items:\n        raise HTTPException(status_code=404, detail=\"Item not found\")\n    return items[item_id]",
          "output": "",
          "explanation": "Replace main.py with this items app and delete tests/test_main.py, otherwise uv run pytest reports a failure. An in-memory items API: POST creates an item and returns its id with status 201, GET returns it or answers 404."
        },
        {
          "language": "python",
          "filename": "tests/test_items.py",
          "source": "from fastapi.testclient import TestClient\n\nfrom main import app\n\nclient = TestClient(app)\n\n\ndef test_create_and_read() -> None:\n    r = client.post(\"/items/\", json={\"name\": \"Pen\", \"price\": 1.5})\n    assert r.status_code == 201\n    item_id = r.json()[\"id\"]\n    assert client.get(f\"/items/{item_id}\").json() == {\"name\": \"Pen\", \"price\": 1.5}\n\n\ndef test_missing_item() -> None:\n    r = client.get(\"/items/999\")\n    assert r.status_code == 404\n    assert r.json() == {\"detail\": \"Item not found\"}\n\n\ndef test_invalid_price() -> None:\n    r = client.post(\"/items/\", json={\"name\": \"Pen\", \"price\": \"cheap\"})\n    assert r.status_code == 422\n    assert r.json()[\"detail\"][0][\"loc\"] == [\"body\", \"price\"]",
          "output": "...                                                                      [100%]\n3 passed in 0.35s",
          "explanation": "One test per outcome: created (201), not found (404 with detail) and invalid (422 with the error location). The third test sends the text \"cheap\" where a number is required, so validation fails before the endpoint runs."
        }
      ],
      "productionNote": "Write at least one failure test per endpoint. These regression tests (tests that catch old behaviour breaking again) protect the contract your clients depend on when you refactor.",
      "commonMistakes": [
        "Only testing the happy path, so error handling is never checked.",
        "Asserting the exact `msg` text of a validation error. It is fragile; assert `type` or `loc` instead.",
        "Tests that depend on each other's shared state (for example assuming the first item always gets id 1), so they pass or fail depending on run order."
      ],
      "sources": [
        { "title": "FastAPI: Testing (extended testing file)", "url": "https://fastapi.tiangolo.com/tutorial/testing/#extended-testing-file" }
      ]
    },
    {
      "id": "overriding-dependencies",
      "title": "Overriding dependencies",
      "explanation": "Recall from the dependencies topic that an endpoint can declare a dependency with `Depends(function)`, and FastAPI calls that function for each request. In tests you often do not want the real one: it may need a real login token, a real database or a paid external service.\n\n`app.dependency_overrides` is a dictionary on your app that fixes this. The key is the original dependency function object, and the value is the replacement function. While an entry exists, FastAPI calls the replacement instead, and the endpoint code does not change at all.\n\nUse the function itself, not a call of it: `app.dependency_overrides[get_current_user] = fake_user`. Writing `fake_user()` would store the result of the call, and FastAPI needs something it can call.\n\nOverrides are global to the app, so they stay in place after your test finishes and can leak into later tests. Call `app.dependency_overrides.clear()` to remove them all. In the example, the override is cleared right after the request is made and before the asserts, so even a failing assert cannot leave it behind. The next sub-topics show a cleaner way with fixtures.\n\nThe `get_current_user` in the example is a stand-in for the real one you built in the auth topic: here it always answers 401 (not authenticated).",
      "analogy": "A stunt double: same scene, same script, same camera, but a different person performs the risky part. The endpoint is the scene; the override swaps who performs the dependency, and clearing the override sends the double home so the next scene uses the real actor.",
      "code": [
        {
          "language": "python",
          "filename": "main.py",
          "source": "from typing import Annotated\n\nfrom fastapi import Depends, FastAPI, HTTPException\n\napp = FastAPI()\n\n\ndef get_current_user() -> dict[str, str]:\n    raise HTTPException(status_code=401, detail=\"Not authenticated\")\n\n\n@app.get(\"/users/me\")\ndef me(user: Annotated[dict[str, str], Depends(get_current_user)]) -> dict[str, str]:\n    return user",
          "output": "",
          "explanation": "Delete tests/test_items.py first. The real dependency always rejects the request, standing in for a token check. The endpoint just returns whatever user the dependency gives it."
        },
        {
          "language": "python",
          "filename": "tests/test_me.py",
          "source": "from fastapi.testclient import TestClient\n\nfrom main import app, get_current_user\n\nclient = TestClient(app)\n\n\ndef fake_user() -> dict[str, str]:\n    return {\"username\": \"test-user\"}\n\n\ndef test_me_with_override() -> None:\n    app.dependency_overrides[get_current_user] = fake_user\n    response = client.get(\"/users/me\")\n    app.dependency_overrides.clear()\n    assert response.json() == {\"username\": \"test-user\"}\n\n\ndef test_me_without_login() -> None:\n    assert client.get(\"/users/me\").status_code == 401",
          "output": "..                                                                       [100%]\n2 passed in 0.27s",
          "explanation": "The first test replaces get_current_user with fake_user, so the endpoint succeeds. The second runs after the override was cleared, so the real dependency answers 401."
        }
      ],
      "productionNote": "Overrides let you test protected endpoints without creating real tokens, and swap external services (email, payments) for fakes so tests stay fast and free.",
      "commonMistakes": [
        "Overriding with the function called (`fake_user()`) instead of the function itself (`fake_user`).",
        "Forgetting to clear the overrides, so a fake user leaks into other tests and hides real bugs.",
        "Using a different function object as the key. The key must be the very same function the endpoint passes to `Depends`."
      ],
      "sources": [
        { "title": "FastAPI: Testing Dependencies with Overrides", "url": "https://fastapi.tiangolo.com/advanced/testing-dependencies/" }
      ]
    },
    {
      "id": "in-memory-sqlite",
      "title": "In-memory SQLite test database",
      "explanation": "Tests must never touch your real database file (`database.db`), because they would add junk rows or delete real data. Instead, tests use SQLite in memory: the whole database lives in RAM (the computer's working memory) and disappears when the connection closes. The URL `sqlite://` (no file name) creates one.\n\nThe example below uses a heroes app like the one from the SQLModel topic. Create `main.py` with the code shown. Its lifespan creates the tables in the real `database.db`, but plain `TestClient(app)` never runs the lifespan, so tests leave the real file alone.\n\nThere is one catch. By default SQLAlchemy (the library under SQLModel) keeps a connection pool, which is a set of reusable database connections, and an in-memory database exists per connection. A second connection would see a different, empty database and fail with `no such table`. `poolclass=StaticPool` makes the engine reuse a single connection for everyone, so all sessions share the same in-memory database.\n\nAlso pass `connect_args={\"check_same_thread\": False}`. SQLite normally refuses to be used from a thread other than the one that created the connection, and TestClient runs your app in a different thread.\n\nThe steps in the test file are: create the test engine, create the tables with `SQLModel.metadata.create_all(engine)`, write a replacement for `get_session` that uses the test engine, and register it in `app.dependency_overrides`.\n\nThis version puts the override at module level, which means it stays active for the whole pytest run. That works for one file but is hard to manage, so the next sub-topic moves it into fixtures.",
      "analogy": "A sandbox copy of the shop: you build a miniature replica, break anything you like, and the whole thing is thrown away afterwards. StaticPool is the rule that every customer walks into the same one sandbox instead of each getting a separate empty one.",
      "code": [
        {
          "language": "python",
          "filename": "main.py",
          "source": "from collections.abc import AsyncIterator, Iterator\nfrom contextlib import asynccontextmanager\nfrom typing import Annotated\n\nfrom fastapi import Depends, FastAPI, HTTPException\nfrom sqlmodel import Field, Session, SQLModel, create_engine, select\n\n\nclass HeroCreate(SQLModel):\n    name: str\n    secret_name: str\n\n\nclass Hero(HeroCreate, table=True):\n    id: int | None = Field(default=None, primary_key=True)\n\n\nclass HeroPublic(SQLModel):\n    id: int\n    name: str\n\n\nengine = create_engine(\n    \"sqlite:///database.db\", connect_args={\"check_same_thread\": False}\n)\n\n\ndef get_session() -> Iterator[Session]:\n    with Session(engine) as session:\n        yield session\n\n\nSessionDep = Annotated[Session, Depends(get_session)]\n\n\n@asynccontextmanager\nasync def lifespan(app: FastAPI) -> AsyncIterator[None]:\n    SQLModel.metadata.create_all(engine)\n    yield\n\n\napp = FastAPI(lifespan=lifespan)\n\n\n@app.post(\"/heroes/\", response_model=HeroPublic)\ndef create_hero(hero: HeroCreate, session: SessionDep) -> Hero:\n    db_hero = Hero.model_validate(hero)\n    session.add(db_hero)\n    session.commit()\n    session.refresh(db_hero)\n    return db_hero\n\n\n@app.get(\"/heroes/\", response_model=list[HeroPublic])\ndef read_heroes(session: SessionDep) -> list[Hero]:\n    return list(session.exec(select(Hero)).all())\n\n\n@app.get(\"/heroes/{hero_id}\", response_model=HeroPublic)\ndef read_hero(hero_id: int, session: SessionDep) -> Hero:\n    hero = session.get(Hero, hero_id)\n    if hero is None:\n        raise HTTPException(status_code=404, detail=\"Hero not found\")\n    return hero",
          "output": "",
          "explanation": "The app under test. The public model hides `secret_name`. Importing this file creates the engine object but does not open or create database.db yet."
        },
        {
          "language": "python",
          "filename": "tests/test_db.py",
          "source": "from collections.abc import Iterator\n\nfrom fastapi.testclient import TestClient\nfrom sqlmodel import Session, SQLModel, create_engine\nfrom sqlmodel.pool import StaticPool\n\nfrom main import app, get_session\n\nengine = create_engine(\n    \"sqlite://\",\n    connect_args={\"check_same_thread\": False},\n    poolclass=StaticPool,\n)\nSQLModel.metadata.create_all(engine)\n\n\ndef get_session_override() -> Iterator[Session]:\n    with Session(engine) as session:\n        yield session\n\n\napp.dependency_overrides[get_session] = get_session_override\nclient = TestClient(app)\n\n\ndef test_create_hero() -> None:\n    r = client.post(\"/heroes/\", json={\"name\": \"Ada\", \"secret_name\": \"Countess\"})\n    assert r.status_code == 200\n    data = r.json()\n    assert data[\"name\"] == \"Ada\"\n    assert data[\"id\"] == 1\n    assert \"secret_name\" not in data",
          "output": "1 passed in 0.42s",
          "explanation": "The test engine is in memory and shared through StaticPool. The override sends every request to it. The first hero gets id 1 because this database starts empty, and the response never contains secret_name. Each sub-topic replaces main.py, so delete the test files from the earlier sub-topics (tests/test_main.py, tests/test_items.py, tests/test_me.py) before running pytest, or run only this file with `uv run pytest -q tests/test_db.py`."
        }
      ],
      "productionNote": "In-memory SQLite gives fast, isolated database tests with no database server to install or clean up. Be aware that it is SQLite, so behaviour specific to another database (such as PostgreSQL) still needs its own checks.",
      "commonMistakes": [
        "Leaving out `StaticPool`, which gives `no such table` because each connection gets its own empty in-memory database.",
        "Leaving out `check_same_thread: False`, which raises an error because TestClient runs the app in another thread.",
        "Testing against the dev database file `database.db`, which pollutes real data.",
        "Forgetting `SQLModel.metadata.create_all(engine)` on the test engine, so no tables exist."
      ],
      "sources": [
        { "title": "SQLModel: Test Applications with FastAPI and SQLModel (in-memory database)", "url": "https://sqlmodel.tiangolo.com/tutorial/fastapi/tests/#configure-the-in-memory-database" },
        { "title": "SQLAlchemy: StaticPool", "url": "https://docs.sqlalchemy.org/en/20/core/pooling.html#sqlalchemy.pool.StaticPool" }
      ]
    },
    {
      "id": "fixtures-client-session",
      "title": "Fixtures for client and session",
      "explanation": "A pytest fixture is a function that prepares something for tests; a test asks for it by naming it as a parameter. A fixture that uses `yield` runs its code before the `yield` as setup, hands over the yielded value, and runs the code after the `yield` as cleanup once the test is done.\n\nThis is the standard setup for FastAPI with SQLModel, using the same `main.py` as the previous sub-topic. Delete tests/test_main.py, tests/test_items.py, tests/test_me.py and tests/test_db.py first, so the output shows only the two new tests. The module-level override in test_db.py would otherwise stay active during the whole run and conflict with the fixtures.\n\nThe `session` fixture creates a brand-new in-memory engine, creates the tables, and yields a `Session`. Because it runs for every test, each test gets an empty database of its own.\n\nThe `client` fixture asks for `session`, so pytest builds the session first. It overrides `get_session` with a function that returns that very session, yields a `TestClient`, and afterwards clears the overrides. That means the test and the API see the same database, so a test can insert rows through `session` and then call the API.\n\n`@pytest.fixture(name=\"session\")` lets the function be called `session_fixture` while tests still ask for `session`. This avoids giving the fixture function the same name as the test parameter `session`, which linters (style checkers) flag.\n\nPut fixtures in `tests/conftest.py`. Pytest loads that file automatically and shares its fixtures with every test file in the folder, with no import needed.\n\nIn the example, `test_read_heroes` inserts two heroes. `test_read_missing` runs with a fresh, empty database, so hero 1 does not exist and the API answers 404. It does not matter which test runs first.",
      "analogy": "A stage crew that builds a fresh set before every scene and strikes it afterwards. The `session` fixture is the set (a new empty database), the `client` fixture is the crew member who connects the set to the play (the override) and removes the connection after the scene, so the next scene always starts clean.",
      "code": [
        {
          "language": "python",
          "filename": "tests/conftest.py",
          "source": "from collections.abc import Iterator\n\nimport pytest\nfrom fastapi.testclient import TestClient\nfrom sqlmodel import Session, SQLModel, create_engine\nfrom sqlmodel.pool import StaticPool\n\nfrom main import app, get_session\n\n\n@pytest.fixture(name=\"session\")\ndef session_fixture() -> Iterator[Session]:\n    engine = create_engine(\n        \"sqlite://\",\n        connect_args={\"check_same_thread\": False},\n        poolclass=StaticPool,\n    )\n    SQLModel.metadata.create_all(engine)\n    with Session(engine) as session:\n        yield session\n\n\n@pytest.fixture(name=\"client\")\ndef client_fixture(session: Session) -> Iterator[TestClient]:\n    def get_session_override() -> Session:\n        return session\n\n    app.dependency_overrides[get_session] = get_session_override\n    client = TestClient(app)\n    yield client\n    app.dependency_overrides.clear()",
          "output": "",
          "explanation": "Shared fixtures. Code after each `yield` is the cleanup: the session closes when its `with` block ends, and the overrides are cleared after the test."
        },
        {
          "language": "python",
          "filename": "tests/test_heroes.py",
          "source": "from fastapi.testclient import TestClient\nfrom sqlmodel import Session\n\nfrom main import Hero\n\n\ndef test_read_heroes(session: Session, client: TestClient) -> None:\n    session.add(Hero(name=\"Ada\", secret_name=\"Countess\"))\n    session.add(Hero(name=\"Bob\", secret_name=\"Builder\"))\n    session.commit()\n\n    data = client.get(\"/heroes/\").json()\n    assert [h[\"name\"] for h in data] == [\"Ada\", \"Bob\"]\n\n\ndef test_read_missing(client: TestClient) -> None:\n    assert client.get(\"/heroes/1\").status_code == 404",
          "output": "..                                                                       [100%]\n2 passed in 0.38s",
          "explanation": "The first test fills the database through `session` and reads it back through the API. The second gets a fresh empty database, so hero 1 is missing."
        },
        {
          "language": "bash",
          "filename": "terminal",
          "source": "uv run pytest -q",
          "output": "..                                                                       [100%]\n2 passed in 0.38s",
          "explanation": "Run from the project root as before."
        }
      ],
      "productionNote": "This session plus client fixture pair is the standard FastAPI and SQLModel test setup. Every test is isolated, so you can run them in any order, or one at a time with `uv run pytest -k test_read_missing`.",
      "commonMistakes": [
        "Sharing one database across all tests, which causes order-dependent failures (a test passes alone but fails after another).",
        "Not clearing `app.dependency_overrides` after each test, so the override leaks into later tests.",
        "Leaving the module-level override from the previous sub-topic in place, which conflicts with the fixtures.",
        "Forgetting that the `client` fixture needs `session`, and creating a second, separate engine so the test and the API see different databases."
      ],
      "sources": [
        { "title": "SQLModel: Test Applications (pytest fixtures)", "url": "https://sqlmodel.tiangolo.com/tutorial/fastapi/tests/#pytest-fixtures" },
        { "title": "pytest: yield fixtures", "url": "https://docs.pytest.org/en/stable/how-to/fixtures.html#yield-fixtures-recommended" }
      ]
    }
  ],
  "quiz": [
    {
      "question": "Does `TestClient` need a running server to test your FastAPI app?",
      "options": [
        "No, it sends requests to the app directly in memory",
        "Yes, you must first start `fastapi dev` in another terminal",
        "Yes, but only for endpoints declared with `async def`",
        "Yes, it needs an internet connection to reach the app"
      ],
      "answerIndex": 0,
      "explanation": "TestClient calls the app in memory (it is built on HTTPX), so there is no server process, port or network. Plain `def` tests work for both sync and async endpoints."
    },
    {
      "question": "How do you make a protected endpoint see a fake user during a test?",
      "options": [
        "Edit the endpoint code so it skips the check whenever tests are running",
        "Set `app.dependency_overrides[get_current_user] = fake_user`, using the function itself",
        "Call `fake_user()` yourself and pass the returned value into `client.get`",
        "Delete the `get_current_user` function from main.py before each test"
      ],
      "answerIndex": 1,
      "explanation": "The overrides dictionary maps the original dependency function to a replacement function. FastAPI then calls the replacement, and the endpoint code stays unchanged."
    },
    {
      "question": "Why does an in-memory SQLite test database use `poolclass=StaticPool`?",
      "options": [
        "It makes the database file persist on disk between separate test runs, so that data from an earlier run is still there",
        "It speeds up every query by caching the results of earlier queries on disk, so repeated reads skip the database",
        "It makes all sessions reuse one connection, so they share the same in-memory database instead of each seeing an empty one",
        "It encrypts the stored data so that tests can never leak any secrets, even if the connection is shared"
      ],
      "answerIndex": 2,
      "explanation": "An in-memory SQLite database belongs to one connection. Without StaticPool, a second connection gets a new empty database and you see `no such table`."
    },
    {
      "question": "Why should you call `app.dependency_overrides.clear()` after each test?",
      "options": [
        "Because FastAPI refuses to start up at all while any overrides are still registered on the app object",
        "Because it frees up the disk space used by the test database file once all the tests have finished running",
        "Because it is required before `assert` statements are able to work properly inside the later test functions",
        "Because overrides are global to the app and would leak into later tests, breaking test isolation"
      ],
      "answerIndex": 3,
      "explanation": "The overrides dictionary lives on the app object for the whole run. If you do not clear it, a fake from one test silently affects the next."
    },
    {
      "question": "When does the app's lifespan startup code run when testing with `TestClient`?",
      "options": [
        "Every time you call `client.get`",
        "Only when pytest is run with the `-q` option",
        "Never, because lifespan code cannot run at all inside tests",
        "Only when you use `with TestClient(app) as client:`"
      ],
      "answerIndex": 3,
      "explanation": "Plain `TestClient(app)` skips the lifespan. Entering the `with` block runs the startup code, and leaving the block runs the shutdown code."
    },
    {
      "question": "Which assertion is the most stable way to check a 422 validation error?",
      "options": [
        "Assert status 422 and the loc or type of the first detail entry",
        "Assert the exact msg text that FastAPI and Pydantic currently return",
        "Assert status 200 because the request was still handled",
        "Assert the response body is empty"
      ],
      "answerIndex": 0,
      "explanation": "The status code and the loc (which field failed) or type (the error kind) are structured and rarely change. The msg wording can change between library versions, so asserting it makes tests brittle."
    },
    {
      "question": "Why does the client fixture ask for the session fixture?",
      "options": [
        "Because fixtures cannot run without a session",
        "So the test and the API share the same database session",
        "To delete the database file from disk after every single test",
        "To start a second server"
      ],
      "answerIndex": 1,
      "explanation": "The client fixture overrides the app's session dependency with the test session. That way, rows the test creates are visible to the API and the other way round."
    }
  ]
});
