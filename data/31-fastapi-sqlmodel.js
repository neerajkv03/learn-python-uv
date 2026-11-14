window.TOPICS = window.TOPICS || [];
window.TOPICS.push({
  "id": "31-fastapi-sqlmodel",
  "order": 31,
  "title": "Databases with SQLModel",
  "version": "Python 3.15.2 + uv 0.13.7 + FastAPI 0.162.5 + SQLModel 0.0.49 + SQLite 3.54.1",
  "summary": "Connect a FastAPI app to a SQLite database using SQLModel, a library that lets you describe tables as Python classes and work with rows as objects. You will create tables, give every request its own database session, and write create, read, update and delete endpoints. Finally you will split one model into separate Base, table, Create, Public and Update models so secrets stay hidden and clients cannot set ids.",
  "prerequisites": ["25-sqlite-sqlite3", "30-fastapi-dependencies"],
  "subtopics": [
    {
      "id": "sqlmodel-table-models",
      "title": "SQLModel table models",
      "explanation": "In topic 25 you wrote SQL by hand with the `sqlite3` module. In a web app that gets repetitive, so most projects use an ORM. ORM stands for Object-Relational Mapper: a library that maps Python classes to database tables and Python objects to rows, so you rarely write SQL yourself.\n\nSQLModel is an ORM made by the author of FastAPI. It combines two libraries: Pydantic (validation, from topic 27) and SQLAlchemy, the most widely used Python database toolkit. You write one class and get both a validated data model and a database table description.\n\nInstall it into your uv project (the one you made in topic 28) with `uv add sqlmodel`. If you do not have FastAPI in the project yet, run `uv add \"fastapi[standard]\" sqlmodel` instead.\n\nA class becomes a table when you add `table=True` to its class line: `class Hero(SQLModel, table=True)`. (A class is a blueprint for objects, from topic 15.) Each annotated attribute becomes a column. The table is named after the class in lowercase, so this one is `hero`. You can read the name from the special attribute `__tablename__` (a name with two underscores on each side is a Python built-in hook; here SQLModel fills it in for you).\n\n`Field(primary_key=True)` marks the column that uniquely identifies each row. `Field(index=True)` asks the database to build an index for that column. An index is a lookup speed-up, like the index at the back of a book: the database can jump straight to matching rows instead of reading every row.\n\nThe id is declared as `id: int | None = Field(default=None, primary_key=True)`. Before a hero is saved, the database has not chosen an id yet, so the Python object holds `None`. After saving, the database fills in 1, 2, 3 and so on.",
      "analogy": "SQLModel is a translator between Python and a filing cabinet. You hand it a Python object and it fills in a card (a row) in the right drawer (a table). The class is the printed card template, and the primary key is the unique card number the cabinet stamps on when the card is filed.",
      "code": [
        {
          "language": "python",
          "filename": "models.py",
          "source": "from sqlmodel import Field, SQLModel\n\n\nclass Hero(SQLModel, table=True):\n    id: int | None = Field(default=None, primary_key=True)\n    name: str = Field(index=True)\n    age: int | None = Field(default=None, index=True)\n\n\nhero = Hero(name=\"Ada\", age=36)\nprint(hero.name, hero.id)\nprint(Hero.__tablename__)\n",
          "output": "Ada None\nhero",
          "explanation": "Save this as models.py in your project folder and run it with `uv run models.py`. No database exists yet: the class only describes the table. The object has no id yet (`None`), and the default table name is the lowercase class name, `hero`."
        }
      ],
      "productionNote": "This is the data layer of most FastAPI apps: one class per table, kept in one place so the rest of the code imports it.",
      "commonMistakes": [
        "Forgetting `table=True`. Without it the class is only a data model (like a plain Pydantic model, a class that validates data) and no table is created for it.",
        "Writing `id: int` with no default. You then cannot create a Hero object before it is saved, because you would have to invent an id yourself. Use `int | None = Field(default=None, primary_key=True)`."
      ],
      "sources": [
        { "title": "SQLModel: Create a table with SQL", "url": "https://sqlmodel.tiangolo.com/tutorial/create-db-and-table/" },
        { "title": "SQLModel: SQL databases in FastAPI", "url": "https://sqlmodel.tiangolo.com/#sql-databases-in-fastapi" }
      ]
    },
    {
      "id": "engine-and-sqlite-url",
      "title": "Engine and SQLite URL",
      "explanation": "A table class is only a description. To use a real database you need an engine: the object that manages connections to one database. You create it once per app, with `create_engine(url)`.\n\nThe URL tells SQLModel which database to use. For SQLite, `sqlite:///database.db` means a file called `database.db` in the current folder (three slashes, then a relative path). `sqlite://` with nothing after it means a temporary database that lives only in memory and disappears when the program ends. That is handy for demos and tests.\n\n`SQLModel.metadata.create_all(engine)` looks at every class declared with `table=True` and creates any table that does not exist yet. It never changes a table that already exists.\n\nTo talk to the database you open a `Session(engine)`: one unit of work. Inside it, `session.add(obj)` stages a new row and `session.commit()` saves everything staged so far.\n\nTo read rows, `session.exec(select(Hero))` runs a query (`select` builds the SELECT statement for you) and `.all()` collects the results into a list. `with Session(engine) as session:` closes the session automatically at the end of the block.\n\nIn a real FastAPI app with a SQLite file you also pass `connect_args={\"check_same_thread\": False}`. By default Python's SQLite driver refuses to let a connection be used from a thread other than the one that made it (a thread is one line of execution inside a program, see topic 22). \n\nWhy this matters: FastAPI runs ordinary `def` endpoints in a pool of threads, so different requests may touch the engine from different threads. The setting turns that check off. It is safe here because each request gets its own session (next sub-topic).\n\nFor debugging, `create_engine(url, echo=True)` prints every SQL statement the library sends.",
      "analogy": "The engine is the phone line to the cabinet's clerk: you set it up once. A session is one phone call: you make several requests, then say \"commit\" to confirm that all of them should really be written down. If you hang up without saying commit, nothing is saved.",
      "code": [
        {
          "language": "python",
          "filename": "engine_demo.py",
          "source": "from sqlmodel import Field, Session, SQLModel, create_engine, select\n\n\nclass Hero(SQLModel, table=True):\n    id: int | None = Field(default=None, primary_key=True)\n    name: str = Field(index=True)\n    age: int | None = Field(default=None, index=True)\n\n\nengine = create_engine(\"sqlite://\")\nSQLModel.metadata.create_all(engine)\n\nwith Session(engine) as session:\n    session.add(Hero(name=\"Ada\", age=36))\n    session.commit()\n    heroes = session.exec(select(Hero)).all()\n    print(len(heroes), heroes[0].name, heroes[0].id)\n",
          "output": "1 Ada 1",
          "explanation": "The in-memory URL `sqlite://` keeps the demo self-contained. After the commit the database has assigned id 1. A real app would use `create_engine(\"sqlite:///database.db\", connect_args={\"check_same_thread\": False})` so data survives restarts."
        }
      ],
      "productionNote": "Create one engine per process, at import or startup, and reuse it for every request. The engine manages connections for you.",
      "commonMistakes": [
        "Creating a new engine for every request. It is slow and wasteful; create it once at module level.",
        "Forgetting `SQLModel.metadata.create_all(engine)`. The first query then fails with `sqlite3.OperationalError: no such table: hero` (OperationalError is the error SQLite raises when a statement cannot run; SQLAlchemy wraps it in its own error of the same name)."
      ],
      "sources": [
        { "title": "SQLModel: Simple Hero API with FastAPI", "url": "https://sqlmodel.tiangolo.com/tutorial/fastapi/simple-hero-api/" },
        { "title": "SQLModel: Read data with SELECT", "url": "https://sqlmodel.tiangolo.com/tutorial/select/" }
      ]
    },
    {
      "id": "session-dependency-with-yield",
      "title": "Session dependency with yield",
      "explanation": "In a web app many requests arrive at once, and each one needs a database session. The clean way is a dependency (topic 30) that opens a session, hands it to the endpoint with `yield`, and closes it when the request is done.\n\n`def get_session():` contains `with Session(engine) as session:` followed by `yield session`. Everything before the `yield` is setup, and the code after it (here, closing the session at the end of the `with` block) is cleanup that runs after the response is sent.\n\nThen define an alias once: `SessionDep = Annotated[Session, Depends(get_session)]`. `Annotated` attaches extra information to a type, and `Depends` tells FastAPI to call `get_session` for you. Any endpoint can now just write `session: SessionDep`.\n\nThe tables are created at module level with `SQLModel.metadata.create_all(engine)`, so they exist when the app starts. Topic 32 moves this into a cleaner startup hook.\n\nSave the code below as main.py, then start it with `uv run fastapi dev main.py` (topic 28). A file `database.db` appears next to main.py. Open http://127.0.0.1:8000/docs and use \"Try it out\" on `GET /heroes/`, or use curl, a command-line tool that sends HTTP requests (Git Bash is a Linux-style terminal that comes with Git for Windows; macOS and Linux terminals work too).",
      "analogy": "Each customer gets their own phone call to the clerk, and the call hangs up automatically when the customer leaves. Nobody shares a line, so one customer's half-finished request can never get mixed into another's.",
      "code": [
        {
          "language": "python",
          "filename": "main.py",
          "source": "from typing import Annotated\n\nfrom fastapi import Depends, FastAPI\nfrom sqlmodel import Field, Session, SQLModel, create_engine, select\n\n\nclass Hero(SQLModel, table=True):\n    id: int | None = Field(default=None, primary_key=True)\n    name: str = Field(index=True)\n    age: int | None = Field(default=None, index=True)\n\n\nengine = create_engine(\n    \"sqlite:///database.db\", connect_args={\"check_same_thread\": False}\n)\nSQLModel.metadata.create_all(engine)\n\n\ndef get_session():\n    with Session(engine) as session:\n        yield session\n\n\nSessionDep = Annotated[Session, Depends(get_session)]\n\napp = FastAPI()\n\n\n@app.get(\"/heroes/\")\ndef read_heroes(session: SessionDep) -> list[Hero]:\n    return list(session.exec(select(Hero)).all())\n",
          "output": "GET /heroes/  ->  200  []",
          "explanation": "With a fresh empty database the list endpoint returns an empty JSON list. The line above is the response to a request, not text printed by the file."
        },
        {
          "language": "bash",
          "filename": "terminal",
          "source": "uv run fastapi dev main.py\n# in a second terminal:\ncurl -s -w \"\\n%{http_code}\\n\" http://127.0.0.1:8000/heroes/",
          "output": "[]\n200",
          "explanation": "`-s` hides curl's progress bar and `-w` prints the HTTP status code after the body."
        }
      ],
      "productionNote": "A yield dependency that opens one session per request is the standard FastAPI database pattern. Test code can later swap it out (topic 34).",
      "commonMistakes": [
        "Creating one global `Session` and sharing it between all requests. Data and half-finished changes leak between requests, and sessions are not safe to use from several threads at once.",
        "Leaving out `connect_args={\"check_same_thread\": False}` with a SQLite file. Requests then fail with a `ProgrammingError` (an error from the database driver) complaining about using a connection in another thread."
      ],
      "sources": [
        { "title": "FastAPI: SQL databases, create a session dependency", "url": "https://fastapi.tiangolo.com/tutorial/sql-databases/#create-a-session-dependency" }
      ]
    },
    {
      "id": "create-and-read-endpoints",
      "title": "Create and read endpoints",
      "explanation": "To create a hero, the endpoint receives a `Hero` as the request body, then runs three session calls in order: `session.add(hero)` stages the row, `session.commit()` writes it to the database, and `session.refresh(hero)` reloads the object from the database so fields the database filled in, such as `id`, are present. Then it returns the hero.\n\nTo read many heroes, `select(Hero).offset(offset).limit(limit)` skips `offset` rows and returns at most `limit` rows. This is pagination: fetching a big table one page at a time. `Query(le=100)` (topic 29) caps `limit` at 100 so a client cannot ask for a million rows.\n\nTo read one hero, `session.get(Hero, hero_id)` looks the row up by primary key and returns the object, or `None` if no such row exists. When it is `None`, raise `HTTPException(status_code=404, detail=\"Hero not found\")`.\n\nReplace main.py with the version below. The requests assume a fresh empty database (delete `database.db` first if you tried the previous step with data). You can send them from the `/docs` page or with curl as in the previous sub-topic.",
      "analogy": "Creating is filing a new card and getting back the card with its number stamped on it (add, commit, refresh). Reading one is asking the clerk for the card with a given number; if there is no such card, the clerk says \"not found\".",
      "code": [
        {
          "language": "python",
          "filename": "main.py",
          "source": "from typing import Annotated\n\nfrom fastapi import Depends, FastAPI, HTTPException, Query\nfrom sqlmodel import Field, Session, SQLModel, create_engine, select\n\n\nclass Hero(SQLModel, table=True):\n    id: int | None = Field(default=None, primary_key=True)\n    name: str = Field(index=True)\n    age: int | None = Field(default=None, index=True)\n\n\nengine = create_engine(\n    \"sqlite:///database.db\", connect_args={\"check_same_thread\": False}\n)\nSQLModel.metadata.create_all(engine)\n\n\ndef get_session():\n    with Session(engine) as session:\n        yield session\n\n\nSessionDep = Annotated[Session, Depends(get_session)]\n\napp = FastAPI()\n\n\n@app.post(\"/heroes/\")\ndef create_hero(hero: Hero, session: SessionDep) -> Hero:\n    session.add(hero)\n    session.commit()\n    session.refresh(hero)\n    return hero\n\n\n@app.get(\"/heroes/\")\ndef read_heroes(\n    session: SessionDep,\n    offset: int = 0,\n    limit: Annotated[int, Query(le=100)] = 100,\n) -> list[Hero]:\n    statement = select(Hero).offset(offset).limit(limit)\n    return list(session.exec(statement).all())\n\n\n@app.get(\"/heroes/{hero_id}\")\ndef read_hero(hero_id: int, session: SessionDep) -> Hero:\n    hero = session.get(Hero, hero_id)\n    if not hero:\n        raise HTTPException(status_code=404, detail=\"Hero not found\")\n    return hero\n",
          "output": "POST /heroes/ body {\"name\": \"Ada\", \"age\": 36}  ->  200  {\"name\":\"Ada\",\"age\":36,\"id\":1}\nGET /heroes/1  ->  200  {\"name\":\"Ada\",\"age\":36,\"id\":1}\nGET /heroes/9  ->  404  {\"detail\":\"Hero not found\"}",
          "explanation": "The output lines are the responses to three requests sent in order, not text printed by the file. The new hero gets id 1 from the database. The id appears in the response only because of `session.refresh`. Note that with this single `Hero` model a client could also send an `id` in the body; the last sub-topic fixes that."
        }
      ],
      "productionNote": "Every CRUD API (Create, Read, Update, Delete) has these endpoints. Always cap `limit` so one request cannot pull the whole table.",
      "commonMistakes": [
        "Forgetting `session.commit()`. The row is staged but never saved, and it is lost when the session closes.",
        "Forgetting `session.refresh(hero)`. After a commit the object has to be reloaded to show database-assigned values, so the response can lack the `id`.",
        "Letting clients send their own `id` because the request body is the table model itself. Sub-topic 6 fixes this with separate models."
      ],
      "sources": [
        { "title": "FastAPI: SQL databases, create a hero", "url": "https://fastapi.tiangolo.com/tutorial/sql-databases/#create-a-hero" },
        { "title": "SQLModel: Read one row", "url": "https://sqlmodel.tiangolo.com/tutorial/one/" }
      ]
    },
    {
      "id": "update-and-delete-endpoints",
      "title": "Update and delete endpoints",
      "explanation": "For a partial update use PATCH (topic 26) with a model whose fields are all optional: `HeroUpdate(SQLModel)` with `name: str | None = None` and `age: int | None = None`. Without `table=True` it is just a data model, not a table.\n\nInside the endpoint, first load the hero with `session.get`, and return 404 if it is missing. Then call `hero.model_dump(exclude_unset=True)` (topic 27). That returns a dict containing only the fields the client actually sent. If the body is `{\"age\": 37}`, you get `{\"age\": 37}` and `name` is left alone.\n\nPass that dict to `hero_db.sqlmodel_update(data)`, a SQLModel method that copies the values onto the database object. Then add, commit and refresh as before.\n\nTo delete, load the hero (404 if missing), call `session.delete(hero)`, then `session.commit()`, and return `{\"ok\": True}`. The return type `dict[str, bool]` says the response is a JSON object of text keys and true/false values.\n\nThe code below is the whole main.py so far. The requests assume you first created Ada as in the previous sub-topic, so she has id 1.",
      "analogy": "A PATCH is correcting one box on a card with correction tape instead of rewriting the whole card. `exclude_unset` is the rule \"only touch the boxes the customer pointed at\". A delete is taking the card out of the drawer and shredding it.",
      "code": [
        {
          "language": "python",
          "filename": "main.py",
          "source": "from typing import Annotated\n\nfrom fastapi import Depends, FastAPI, HTTPException, Query\nfrom sqlmodel import Field, Session, SQLModel, create_engine, select\n\n\nclass Hero(SQLModel, table=True):\n    id: int | None = Field(default=None, primary_key=True)\n    name: str = Field(index=True)\n    age: int | None = Field(default=None, index=True)\n\n\nclass HeroUpdate(SQLModel):\n    name: str | None = None\n    age: int | None = None\n\n\nengine = create_engine(\n    \"sqlite:///database.db\", connect_args={\"check_same_thread\": False}\n)\nSQLModel.metadata.create_all(engine)\n\n\ndef get_session():\n    with Session(engine) as session:\n        yield session\n\n\nSessionDep = Annotated[Session, Depends(get_session)]\n\napp = FastAPI()\n\n\n@app.post(\"/heroes/\")\ndef create_hero(hero: Hero, session: SessionDep) -> Hero:\n    session.add(hero)\n    session.commit()\n    session.refresh(hero)\n    return hero\n\n\n@app.get(\"/heroes/\")\ndef read_heroes(\n    session: SessionDep,\n    offset: int = 0,\n    limit: Annotated[int, Query(le=100)] = 100,\n) -> list[Hero]:\n    statement = select(Hero).offset(offset).limit(limit)\n    return list(session.exec(statement).all())\n\n\n@app.get(\"/heroes/{hero_id}\")\ndef read_hero(hero_id: int, session: SessionDep) -> Hero:\n    hero = session.get(Hero, hero_id)\n    if not hero:\n        raise HTTPException(status_code=404, detail=\"Hero not found\")\n    return hero\n\n\n@app.patch(\"/heroes/{hero_id}\")\ndef update_hero(hero_id: int, hero: HeroUpdate, session: SessionDep) -> Hero:\n    hero_db = session.get(Hero, hero_id)\n    if not hero_db:\n        raise HTTPException(status_code=404, detail=\"Hero not found\")\n    hero_data = hero.model_dump(exclude_unset=True)\n    hero_db.sqlmodel_update(hero_data)\n    session.add(hero_db)\n    session.commit()\n    session.refresh(hero_db)\n    return hero_db\n\n\n@app.delete(\"/heroes/{hero_id}\")\ndef delete_hero(hero_id: int, session: SessionDep) -> dict[str, bool]:\n    hero = session.get(Hero, hero_id)\n    if not hero:\n        raise HTTPException(status_code=404, detail=\"Hero not found\")\n    session.delete(hero)\n    session.commit()\n    return {\"ok\": True}\n",
          "output": "PATCH /heroes/1 body {\"age\": 37}  ->  200  {\"name\":\"Ada\",\"age\":37,\"id\":1}\nDELETE /heroes/1  ->  200  {\"ok\":true}\nGET /heroes/1  ->  404  {\"detail\":\"Hero not found\"}",
          "explanation": "The output lines are responses to requests sent in order. The PATCH changes only the age; the name stays \"Ada\". After the delete, the same id gives 404 because the row is gone."
        }
      ],
      "productionNote": "Edit forms and admin panels depend on partial updates. Always check that the row exists before changing or deleting it, so the client gets a clear 404.",
      "commonMistakes": [
        "Calling `model_dump()` without `exclude_unset=True`. Every field the client did not send comes out as `None` and overwrites the stored value, so a PATCH of only `age` would erase `name`.",
        "Deleting without checking that the row exists. `session.delete(None)` fails with an error and the client sees a 500 instead of a clean 404."
      ],
      "sources": [
        { "title": "SQLModel: Update data with FastAPI", "url": "https://sqlmodel.tiangolo.com/tutorial/fastapi/update/" },
        { "title": "SQLModel: Delete data with FastAPI", "url": "https://sqlmodel.tiangolo.com/tutorial/fastapi/delete/" }
      ]
    },
    {
      "id": "separate-create-public-update-models",
      "title": "Separate Create / Public / Update models",
      "explanation": "So far one `Hero` class is the table, the request body and the response. That causes problems: clients can set the `id`, and any private column would be sent back to them. The fix is several small models, each with one job.\n\n`HeroBase` holds the fields shared by all of them (`name`, `age`). `Hero(HeroBase, table=True)` is the real table: it adds `id` and a private `secret_name`. `HeroCreate(HeroBase)` is what a client sends to create a hero: it adds `secret_name` but has no `id`. `HeroPublic(HeroBase)` is what you send back: it adds a required `id: int` and has no `secret_name`. `HeroUpdate` has every field optional, as in the last sub-topic, now including `secret_name`.\n\nTo turn a `HeroCreate` into a table object use `Hero.model_validate(hero)`, which builds a `Hero` from the matching fields. The endpoint's return type, `-> HeroPublic`, makes FastAPI filter the response so `secret_name` never leaves the server (topic 29). Fields not declared in `HeroCreate`, such as a client-sent `id`, are simply ignored.\n\nIn the JSON, the fields of the base class come first and the new ones after, so `HeroPublic` responses are ordered `name`, `age`, `id`.\n\nBecause the `hero` table now has a new column, an old `database.db` created by the previous steps no longer matches. `create_all` only creates missing tables and never alters existing ones, so stop the server and delete `database.db` before running this version. In a real project you would use a migration tool such as Alembic, which applies table changes step by step without losing data (only mentioned here).",
      "analogy": "One person, several documents. The application form (Create) asks for what the person fills in, with no ID number yet. The public ID card (Public) shows the number but not the private details. The change-of-address form (Update) lists only what can change, all optional. The full file in the archive (the table model) holds everything.",
      "code": [
        {
          "language": "python",
          "filename": "main.py",
          "source": "from typing import Annotated\n\nfrom fastapi import Depends, FastAPI, HTTPException, Query\nfrom sqlmodel import Field, Session, SQLModel, create_engine, select\n\n\nclass HeroBase(SQLModel):\n    name: str = Field(index=True)\n    age: int | None = Field(default=None, index=True)\n\n\nclass Hero(HeroBase, table=True):\n    id: int | None = Field(default=None, primary_key=True)\n    secret_name: str\n\n\nclass HeroPublic(HeroBase):\n    id: int\n\n\nclass HeroCreate(HeroBase):\n    secret_name: str\n\n\nclass HeroUpdate(SQLModel):\n    name: str | None = None\n    age: int | None = None\n    secret_name: str | None = None\n\n\nengine = create_engine(\n    \"sqlite:///database.db\", connect_args={\"check_same_thread\": False}\n)\nSQLModel.metadata.create_all(engine)\n\n\ndef get_session():\n    with Session(engine) as session:\n        yield session\n\n\nSessionDep = Annotated[Session, Depends(get_session)]\n\napp = FastAPI()\n\n\n@app.post(\"/heroes/\")\ndef create_hero(hero: HeroCreate, session: SessionDep) -> HeroPublic:\n    db_hero = Hero.model_validate(hero)\n    session.add(db_hero)\n    session.commit()\n    session.refresh(db_hero)\n    return db_hero\n\n\n@app.get(\"/heroes/\")\ndef read_heroes(\n    session: SessionDep,\n    offset: int = 0,\n    limit: Annotated[int, Query(le=100)] = 100,\n) -> list[HeroPublic]:\n    statement = select(Hero).offset(offset).limit(limit)\n    return list(session.exec(statement).all())\n\n\n@app.get(\"/heroes/{hero_id}\")\ndef read_hero(hero_id: int, session: SessionDep) -> HeroPublic:\n    hero = session.get(Hero, hero_id)\n    if not hero:\n        raise HTTPException(status_code=404, detail=\"Hero not found\")\n    return hero\n\n\n@app.patch(\"/heroes/{hero_id}\")\ndef update_hero(hero_id: int, hero: HeroUpdate, session: SessionDep) -> HeroPublic:\n    hero_db = session.get(Hero, hero_id)\n    if not hero_db:\n        raise HTTPException(status_code=404, detail=\"Hero not found\")\n    hero_data = hero.model_dump(exclude_unset=True)\n    hero_db.sqlmodel_update(hero_data)\n    session.add(hero_db)\n    session.commit()\n    session.refresh(hero_db)\n    return hero_db\n\n\n@app.delete(\"/heroes/{hero_id}\")\ndef delete_hero(hero_id: int, session: SessionDep) -> dict[str, bool]:\n    hero = session.get(Hero, hero_id)\n    if not hero:\n        raise HTTPException(status_code=404, detail=\"Hero not found\")\n    session.delete(hero)\n    session.commit()\n    return {\"ok\": True}\n",
          "output": "POST /heroes/ body {\"name\": \"Ada\", \"age\": 36, \"secret_name\": \"Countess\"}  ->  200  {\"name\":\"Ada\",\"age\":36,\"id\":1}\nGET /heroes/1  ->  200  {\"name\":\"Ada\",\"age\":36,\"id\":1}",
          "explanation": "The output lines are responses to requests sent to a fresh database. The stored row has a `secret_name` (\"Countess\"), but neither response contains it, because the return type is `HeroPublic`. Fields come out as `name`, `age`, `id`: base fields first, then `id`."
        }
      ],
      "productionNote": "Separate input, storage and output models hide secrets, stop clients from setting ids, and give the generated /docs page a precise description of each endpoint.",
      "commonMistakes": [
        "Using one model for everything. It leaks private columns such as `secret_name` in responses and lets clients choose the `id`.",
        "Adding or changing a column on the table model and expecting an existing `database.db` to follow. `create_all` does not alter existing tables, so you get errors such as `no such column`. Delete the development database file, or use a migration tool such as Alembic (only mentioned here)."
      ],
      "sources": [
        { "title": "FastAPI: SQL databases, heroes with multiple models", "url": "https://fastapi.tiangolo.com/tutorial/sql-databases/#heroes-with-multiple-models" },
        { "title": "SQLModel: Multiple models with FastAPI", "url": "https://sqlmodel.tiangolo.com/tutorial/fastapi/multiple-models/" }
      ]
    }
  ],
  "quiz": [
    {
      "question": "Why is the primary key declared as `id: int | None = Field(default=None, primary_key=True)`?",
      "options": [
        "Because SQLite only accepts ids that are None when a table is first created in a new file",
        "Because `None` makes the column an index, which is a lookup structure that speeds up searches",
        "Because the database assigns the id when the row is saved, so a new object has no id yet",
        "Because Python requires every attribute of every class to default to None, whatever its type"
      ],
      "answerIndex": 2,
      "explanation": "A hero you have just created in Python has not been saved, so no id exists yet. The attribute is `None` until the database assigns a number on commit."
    },
    {
      "question": "What does `session.refresh(hero)` do after `session.commit()`?",
      "options": [
        "It reloads the object from the database so values the database filled in, such as `id`, are present",
        "It deletes the row from the table and then inserts the same row again from scratch",
        "It closes the session so that no further queries can be made through it",
        "It creates the table if it does not exist yet, using the model class as a blueprint"
      ],
      "answerIndex": 0,
      "explanation": "After a commit the object's data is considered stale. Refresh reads the row again so the object, and the response built from it, includes the new id."
    },
    {
      "question": "A client sends PATCH with body `{\"age\": 37}`. Why do we call `model_dump(exclude_unset=True)`?",
      "options": [
        "To make the age a string before it is stored in the database",
        "To remove the id column from the model so it cannot be changed",
        "To validate that the age is a positive number before saving it, rejecting the request if not",
        "To get only the fields the client sent, so name is not overwritten with None"
      ],
      "answerIndex": 3,
      "explanation": "Without `exclude_unset=True`, unsent fields appear in the dict as `None` and would overwrite the stored values. With it, only `age` is applied."
    },
    {
      "question": "What is the main reason to have a separate `HeroPublic` model for responses?",
      "options": [
        "It makes the database faster by storing fewer columns for each hero row on disk",
        "It controls exactly which fields leave the server, so `secret_name` is hidden and `id` is always included",
        "It creates a second table in the database that holds a public copy of every hero, which clients then read instead of the main table",
        "It lets clients choose their own id when they create a hero, instead of the database"
      ],
      "answerIndex": 1,
      "explanation": "The return type filters the response to the fields of `HeroPublic`, so private columns of the table model are never sent."
    },
    {
      "question": "Why do we pass `connect_args={\"check_same_thread\": False}` to `create_engine` for a SQLite file in a FastAPI app?",
      "options": [
        "It makes SQLite store all of its data in memory instead of in a file on disk",
        "It creates the tables automatically the first time the engine is used by a request",
        "It lets several requests share one session safely, so only one session is ever needed",
        "FastAPI may use the engine from different threads, and SQLite's Python driver would otherwise refuse that"
      ],
      "answerIndex": 3,
      "explanation": "Plain `def` endpoints run in a thread pool, so a connection can be used from a thread other than the one that opened it. The setting turns off the driver's check. Each request still gets its own session."
    },
    {
      "question": "What does the `yield` in `get_session` do?",
      "options": [
        "Hands the session to the endpoint, then runs the cleanup after the response",
        "Returns a session and closes it at once, before the endpoint can use it",
        "Creates the database tables when the first request arrives",
        "Stops the server after the first request has been answered"
      ],
      "answerIndex": 0,
      "explanation": "Code before `yield` sets up the session and the value after it is given to the endpoint. When the response is done, the code after `yield` runs, which closes the session."
    },
    {
      "question": "What does the URL `sqlite:///database.db` mean?",
      "options": [
        "A database held only in memory, which disappears when the program ends",
        "A file named database.db in the current folder",
        "A remote server called database.db that the app connects to over the network",
        "An error, because SQLite needs a port number in the URL"
      ],
      "answerIndex": 1,
      "explanation": "Three slashes followed by a relative path point SQLite at a file in the current folder. The in-memory database uses `sqlite://` with nothing after it."
    },
    {
      "question": "What must a delete endpoint check before calling session.delete(hero)?",
      "options": [
        "That model_dump was called without exclude_unset, so every field is present",
        "That create_all has run again, so that the table still exists",
        "That the id is None, because only unsaved heroes can be deleted",
        "That the hero exists, returning 404 if not"
      ],
      "answerIndex": 3,
      "explanation": "`session.get` returns `None` when no row has that id, and deleting `None` would fail. So the endpoint raises a 404 error first when the hero is missing."
    }
  ]
});
