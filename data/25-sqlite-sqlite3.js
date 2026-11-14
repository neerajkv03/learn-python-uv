window.TOPICS = window.TOPICS || [];
window.TOPICS.push({
  "id": "25-sqlite-sqlite3",
  "order": 25,
  "title": "SQLite with sqlite3",
  "version": "Python 3.15.2 + uv 0.13.7 + SQLite 3.54.1",
  "summary": "A database is an organised, permanent store of data, and SQL is the language you use to talk to it. In this topic you use SQLite, a complete database that lives in one file and is built into Python as the sqlite3 module. You create tables, insert and query rows, pass values safely to avoid SQL injection (an attack where typed text rewrites your query), group changes into transactions (all-or-nothing sets of changes), and read rows by column name.",
  "prerequisites": ["11-error-handling", "14-files-paths-data", "18-decorators-context-managers"],
  "subtopics": [
    {
      "id": "what-a-database-and-sql-are",
      "title": "What a database and SQL are",
      "explanation": "A database is an organised, permanent store of data. A variable disappears when your program ends; data in a database stays until you delete it. Most databases you will meet are relational: the data lives in tables, which look like spreadsheets. A table has columns (named, typed fields such as title or year) and rows (one record each, such as one book).\n\nSQL (Structured Query Language) is the language you use to ask a database to create, read, change or delete data. By convention SQL keywords are written in UPPERCASE, for example SELECT. SQL is a separate language from Python: you write it inside Python strings and hand those strings to the database.\n\nSQLite is a whole database stored in a single file. It needs no server and no installation, because Python includes it as the standard-library module sqlite3 (a module is a file of ready-made code that you load with import). You do not need uv add for it. Python uses a SQLite library that is bundled with it (Windows and macOS installers) or installed alongside it (most Linux systems), so its version can differ from the SQLite 3.54.1 this course targets; you can check yours with sqlite3.sqlite_version.\n\nIn the example, sqlite3.connect(\":memory:\") opens a temporary database kept in RAM (the computer's working memory); it vanishes when the program ends, which is ideal for experiments. connect returns a connection object (an object is a value with its own data and abilities) that you use to talk to the database. con.execute(...) sends one SQL statement and returns a cursor, a pointer over the results. Calling .fetchone() on it returns the next result row, and each row comes back as a Python tuple.\n\nTo run it: create a file named sql_intro.py in your project folder, paste the code, open a terminal in that folder and run uv run sql_intro.py.",
      "analogy": "A database is a filing cabinet. Each table is a drawer of identical index cards (the rows), and every card has the same printed boxes (the columns). SQL is the request slip you hand the clerk, such as 'bring me the cards for books after 1900'.",
      "code": [
        {
          "language": "python",
          "filename": "sql_intro.py",
          "source": "import sqlite3\n\ncon = sqlite3.connect(\":memory:\")\nprint(con.execute(\"SELECT 1 + 2\").fetchone())\nprint(con.execute(\"SELECT upper('hi')\").fetchone())\ncon.close()\n",
          "output": "(3,)\n('HI',)",
          "explanation": "SELECT 1 + 2 asks the database to calculate a value; no table is needed. Each answer is a row, returned as a tuple. A one-column row is a tuple with one item, which is why it prints as (3,). upper is a function built into SQLite. con.close() releases the connection when we are done."
        }
      ],
      "productionNote": "SQLite is widely used for local app data, desktop and mobile apps, prototypes, small and medium web apps, caches and tests. Because it needs no server, it is also the easiest database to start learning with.",
      "commonMistakes": [
        "Thinking SQLite needs a separate server or an install. It is just a library inside Python and a file on disk.",
        "Confusing a table with a row. A table is the structure (the drawer and its card template); a row is one record inside it (one card)."
      ],
      "sources": [
        { "title": "Python docs: sqlite3 tutorial", "url": "https://docs.python.org/3/library/sqlite3.html#tutorial" },
        { "title": "SQLite: About SQLite", "url": "https://www.sqlite.org/about.html" },
        { "title": "SQLite: SELECT", "url": "https://www.sqlite.org/lang_select.html" }
      ]
    },
    {
      "id": "connecting-and-creating-tables",
      "title": "Connecting and creating tables",
      "explanation": "sqlite3.connect(\"library.db\") opens the database file named library.db, and creates it if it does not exist yet. It returns a Connection, the object that represents your link to the database. Use \":memory:\" instead of a file name when you want a throwaway database.\n\nYou create a table with a CREATE TABLE statement. In the example, books has three columns: id INTEGER PRIMARY KEY, title TEXT NOT NULL and year INTEGER. Each column is a name followed by a type.\n\nSQLite's main types are INTEGER (whole numbers), REAL (decimals), TEXT (strings), BLOB (raw bytes) and NULL (no value, which Python shows as None). PRIMARY KEY marks the column that uniquely identifies each row; an INTEGER PRIMARY KEY is filled in automatically if you do not supply it. NOT NULL means a value is required for that column.\n\nIF NOT EXISTS makes the statement do nothing when the table is already there, so your program can run repeatedly. SQLite keeps a built-in table called sqlite_master that lists everything in the database; the example reads the table names from it. The list comprehension [row[0] for row in ...] takes the first item of each row tuple.\n\nTo keep the data in a file, replace \":memory:\" with \"library.db\". The file appears in the folder you ran the command from.",
      "analogy": "Connecting is unlocking the cabinet, and a new cabinet is built for you if none exists. CREATE TABLE is printing the blank card template for a new drawer: which boxes each card has and what may go in them.",
      "code": [
        {
          "language": "python",
          "filename": "create_table.py",
          "source": "import sqlite3\n\ncon = sqlite3.connect(\":memory:\")\ncon.execute(\n    \"CREATE TABLE IF NOT EXISTS books \"\n    \"(id INTEGER PRIMARY KEY, title TEXT NOT NULL, year INTEGER)\"\n)\nnames = [row[0] for row in con.execute(\"SELECT name FROM sqlite_master WHERE type = 'table'\")]\nprint(names)\ncon.close()\n",
          "output": "['books']",
          "explanation": "The two adjacent string literals are joined into one SQL statement. After the table is created, sqlite_master lists it. WHERE type = 'table' keeps only tables (it also stores indexes and other objects)."
        }
      ],
      "productionNote": "Real programs create their tables at startup with CREATE TABLE IF NOT EXISTS, or run a migration script (a script that changes the structure of an existing database step by step) when the schema, the layout of tables and columns, changes.",
      "commonMistakes": [
        "Running CREATE TABLE a second time without IF NOT EXISTS raises sqlite3.OperationalError: table books already exists. (OperationalError is the error sqlite3 raises when the database cannot carry out a statement.)",
        "Misspelling the file name in connect. SQLite silently creates a new, empty database with the wrong name instead of reporting an error, so your data seems to be missing."
      ],
      "sources": [
        { "title": "Python docs: sqlite3.connect", "url": "https://docs.python.org/3/library/sqlite3.html#sqlite3.connect" },
        { "title": "SQLite: CREATE TABLE", "url": "https://www.sqlite.org/lang_createtable.html" },
        { "title": "SQLite: Datatypes", "url": "https://www.sqlite.org/datatype3.html" }
      ]
    },
    {
      "id": "inserting-and-querying-rows",
      "title": "Inserting and querying rows",
      "explanation": "INSERT INTO books (title, year) VALUES (?, ?) adds one row. Each ? is a placeholder: a marker that Python fills from the tuple you pass as the second argument to execute. We leave out the id column because it fills itself in. The next sub-topic explains why placeholders matter for safety; for now always use them. After an insert, cur.lastrowid holds the id of the row that was just created.\n\nTo insert many rows at once, use executemany(sql, list_of_tuples). It runs the statement once per tuple.\n\nTo read data, use SELECT columns FROM table WHERE condition ORDER BY column. WHERE keeps only matching rows, and ORDER BY sorts them. A cursor is the pointer over the results that execute returns.\n\nLoop over the cursor with for, call fetchone() for the next row (None when no rows are left), or call fetchall() for a list of all remaining rows.\n\nSELECT COUNT(*) FROM books counts rows. It returns one row with one column, so we take [0] (indexing, getting the first item) of the fetched tuple.\n\nIn the example, the three books have ids 1, 2 and 3. Only Dune (1965) and Ulysses (1922) are after 1900, and sorting by year puts Ulysses first.",
      "analogy": "INSERT is filing new cards in the drawer. SELECT ... WHERE ... ORDER BY is asking the clerk: 'bring me the cards for books after 1900, sorted by year'.",
      "code": [
        {
          "language": "python",
          "filename": "books.py",
          "source": "import sqlite3\n\ncon = sqlite3.connect(\":memory:\")\ncon.execute(\n    \"CREATE TABLE IF NOT EXISTS books \"\n    \"(id INTEGER PRIMARY KEY, title TEXT NOT NULL, year INTEGER)\"\n)\n\ncur = con.execute(\"INSERT INTO books (title, year) VALUES (?, ?)\", (\"Dune\", 1965))\nprint(cur.lastrowid)\n\ncon.executemany(\n    \"INSERT INTO books (title, year) VALUES (?, ?)\",\n    [(\"Emma\", 1815), (\"Ulysses\", 1922)],\n)\n\nfor row in con.execute(\"SELECT id, title FROM books WHERE year > 1900 ORDER BY year\"):\n    print(row)\n\nprint(con.execute(\"SELECT COUNT(*) FROM books\").fetchone()[0])\ncon.close()\n",
          "output": "1\n(3, 'Ulysses')\n(1, 'Dune')\n3",
          "explanation": "The first insert gets id 1, so lastrowid prints 1. executemany adds Emma (id 2) and Ulysses (id 3). The query keeps Ulysses and Dune and sorts by year, so Ulysses comes first. COUNT(*) is 3 because all three rows exist."
        }
      ],
      "productionNote": "These statements cover every CRUD feature of an app: Create (INSERT), Read (SELECT), Update and Delete. Always add ORDER BY when order matters; the database may return rows in any order otherwise.",
      "commonMistakes": [
        "Expecting rows to come back in the order you inserted them. Without ORDER BY the order is not guaranteed.",
        "Writing fetchone()[0] when no row matched. fetchone() returns None, and indexing None raises TypeError (an operation applied to a value of the wrong type). Check for None first."
      ],
      "sources": [
        { "title": "Python docs: Cursor.fetchone", "url": "https://docs.python.org/3/library/sqlite3.html#sqlite3.Cursor.fetchone" },
        { "title": "Python docs: Connection.executemany", "url": "https://docs.python.org/3/library/sqlite3.html#sqlite3.Connection.executemany" },
        { "title": "SQLite: INSERT", "url": "https://www.sqlite.org/lang_insert.html" }
      ]
    },
    {
      "id": "parameterized-queries-and-sql-injection",
      "title": "Parameterized queries and SQL injection",
      "explanation": "Never build SQL text from user input with an f-string or +. SQL injection is an attack where someone types text that changes the meaning of your query. If you paste that text into the SQL string, the database cannot tell your SQL from the attacker's.\n\nIn the example, the user types nobody' OR '1'='1. Pasted into the f-string, the query becomes WHERE name = 'nobody' OR '1'='1'. The part '1'='1' is always true, so every user is returned instead of none. In a real login or search box this leaks or damages data.\n\nThe safe way is placeholders, which pass values separately from the SQL. There are two styles. The qmark style uses ? and a tuple: (name,). The named style uses :name and a dict: {\"flag\": 1}. With a placeholder the whole input is treated as one plain value, never as SQL, so it simply matches no user.\n\nA single value still needs a tuple, and the trailing comma is what makes it one: (name,). Placeholders work for values only; you cannot use them for table or column names.",
      "analogy": "A placeholder is a sealed box on a form. Whatever is written inside stays a value and is never read as an instruction. Pasting text into the SQL string is like letting a stranger rewrite the form itself.",
      "code": [
        {
          "language": "python",
          "filename": "injection.py",
          "source": "import sqlite3\n\ncon = sqlite3.connect(\":memory:\")\ncon.execute(\"CREATE TABLE users (name TEXT, is_admin INTEGER)\")\ncon.executemany(\"INSERT INTO users VALUES (?, ?)\", [(\"ada\", 1), (\"bob\", 0)])\n\nname = \"nobody' OR '1'='1\"\n\n# NEVER do this\nprint(con.execute(f\"SELECT name FROM users WHERE name = '{name}' ORDER BY name\").fetchall())\n\n# Safe: the value is passed separately\nprint(con.execute(\"SELECT name FROM users WHERE name = ? ORDER BY name\", (name,)).fetchall())\n\n# Named placeholder with a dict\nprint(con.execute(\"SELECT name FROM users WHERE is_admin = :flag\", {\"flag\": 1}).fetchall())\ncon.close()\n",
          "output": "[('ada',), ('bob',)]\n[]\n[('ada',)]",
          "explanation": "The unsafe query returns both users because the injected OR '1'='1' is always true. The safe query looks for a user literally named nobody' OR '1'='1, finds none and returns an empty list. The named version matches only ada, whose is_admin is 1."
        }
      ],
      "productionNote": "Use placeholders for every query with a value from outside your code: login forms, search boxes, API parameters. This is the standard defence against SQL injection, and libraries built on top of databases do it for you.",
      "commonMistakes": [
        "Writing (name) instead of (name,). Without the comma it is just a string in parentheses, and sqlite3 treats each character as a separate value, raising an error about the wrong number of values (sqlite3 calls these bindings).",
        "Using an f-string for SQL 'just for a quick script'. Quick scripts become real code; make placeholders a habit."
      ],
      "sources": [
        { "title": "Python docs: sqlite3 placeholders", "url": "https://docs.python.org/3/library/sqlite3.html#sqlite3-placeholders" },
        { "title": "OWASP: SQL Injection", "url": "https://owasp.org/www-community/attacks/SQL_Injection" }
      ]
    },
    {
      "id": "transactions-commit-rollback",
      "title": "Transactions (commit / rollback)",
      "explanation": "A transaction is a group of changes that either all succeed or all fail. This all-or-nothing property is called atomicity. With sqlite3's default settings, Python automatically starts a transaction before an INSERT, UPDATE or DELETE. The changes are not permanent until you call con.commit(). Calling con.rollback() instead undoes everything since the last commit. If you close the connection without committing, the changes are lost.\n\nTyping commit and rollback by hand is error-prone, so use the connection as a context manager (a with block, as you saw in the context managers topic). with con: commits when the block finishes normally and rolls back if an exception (an error) is raised inside it. Be careful: with con: does not close the connection. Python 3.12+ also has an autocommit option (a setting that saves each statement as soon as it runs); this course uses the default.\n\nThe example creates a CHECK (balance >= 0) rule on the table. A CHECK is a rule the database enforces itself; breaking it raises sqlite3.IntegrityError, the error for violating a database rule.\n\nThe transfer function adds money to the destination account, then subtracts it from the source. The first transfer (ada gives bob 30) works. The second asks bob to give ada 500: ada's +500 succeeds, but bob's balance would be 80 - 500, which breaks the CHECK. The error propagates out of with con:, so ada's +500 is undone too. Both balances are unchanged.",
      "analogy": "A bank transfer: the money leaves one account and arrives in the other, or neither happens. It must never end up half done, with money vanished from one account and not yet in the other.",
      "code": [
        {
          "language": "python",
          "filename": "transfer.py",
          "source": "import sqlite3\n\ncon = sqlite3.connect(\":memory:\")\ncon.execute(\"CREATE TABLE accounts (name TEXT PRIMARY KEY, balance INTEGER CHECK (balance >= 0))\")\n\nwith con:\n    con.executemany(\"INSERT INTO accounts VALUES (?, ?)\", [(\"ada\", 100), (\"bob\", 50)])\n\n\ndef transfer(src: str, dst: str, amount: int) -> None:\n    with con:\n        con.execute(\"UPDATE accounts SET balance = balance + ? WHERE name = ?\", (amount, dst))\n        con.execute(\"UPDATE accounts SET balance = balance - ? WHERE name = ?\", (amount, src))\n\n\ntransfer(\"ada\", \"bob\", 30)\nprint(con.execute(\"SELECT name, balance FROM accounts ORDER BY name\").fetchall())\n\ntry:\n    transfer(\"bob\", \"ada\", 500)\nexcept sqlite3.IntegrityError as e:\n    print(\"rolled back:\", type(e).__name__)\n\nprint(con.execute(\"SELECT name, balance FROM accounts ORDER BY name\").fetchall())\ncon.close()\n",
          "output": "[('ada', 70), ('bob', 80)]\nrolled back: IntegrityError\n[('ada', 70), ('bob', 80)]",
          "explanation": "After the first transfer, ada has 70 and bob 80. In the failing transfer, ada's balance briefly becomes 570, then bob's update breaks the CHECK and raises IntegrityError. with con: rolls back, so the final line shows the same balances as before."
        }
      ],
      "productionNote": "Wrap any multi-step change in one transaction: an order plus its stock update, a payment, a transfer. Partial changes are how data ends up inconsistent.",
      "commonMistakes": [
        "Forgetting to commit. The changes seem to work in your program but vanish when the connection closes. Use with con: so commit happens for you.",
        "Assuming with con: closes the connection. It only commits or rolls back; you still need con.close()."
      ],
      "sources": [
        { "title": "Python docs: using the connection as a context manager", "url": "https://docs.python.org/3/library/sqlite3.html#sqlite3-connection-context-manager" },
        { "title": "Python docs: transaction control", "url": "https://docs.python.org/3/library/sqlite3.html#transaction-control" },
        { "title": "SQLite: Transactions", "url": "https://www.sqlite.org/lang_transaction.html" }
      ]
    },
    {
      "id": "row-factories-and-closing-connections",
      "title": "Row factories and closing connections",
      "explanation": "By default each row is a plain tuple, so you must remember that position 0 is id and position 1 is title. Setting con.row_factory = sqlite3.Row changes that. A row factory is the function a connection uses to build each row. sqlite3.Row rows can be read by column name, row[\"title\"], and still by position, row[0]. To get a real dictionary, call dict(row). Set row_factory before you run the query; rows from queries already run are not changed.\n\nYou should close a connection when you are finished with it, with con.close(). Open connections can hold file locks (a lock stops other programs from changing the file at the same time), which leads to errors like 'database is locked' in other programs or in other parts of your program running at the same time. Commit first, then close; closing does not save pending changes.\n\nThe standard library helper contextlib.closing (from the same contextlib module as the contextmanager you met earlier) turns any object with a close method into a context manager. with closing(sqlite3.connect(...)) as con: closes the connection automatically when the block ends, even if an error happens.",
      "analogy": "Plain tuple rows are cards with unlabeled boxes, so you must remember which position holds what. sqlite3.Row gives the boxes printed labels. Closing the connection is locking the cabinet when you leave.",
      "code": [
        {
          "language": "python",
          "filename": "rows.py",
          "source": "import sqlite3\nfrom contextlib import closing\n\nwith closing(sqlite3.connect(\":memory:\")) as con:\n    con.row_factory = sqlite3.Row\n    con.execute(\"CREATE TABLE books (id INTEGER PRIMARY KEY, title TEXT)\")\n    con.execute(\"INSERT INTO books (title) VALUES (?)\", (\"Dune\",))\n    row = con.execute(\"SELECT id, title FROM books\").fetchone()\n    print(row[\"title\"], row[0])\n    print(dict(row))\n",
          "output": "Dune 1\n{'id': 1, 'title': 'Dune'}",
          "explanation": "row[\"title\"] reads by name and row[0] by position, both from the same row. dict(row) builds a dictionary keyed by column name. When the with block ends, closing calls con.close() for us."
        }
      ],
      "productionNote": "Turning rows into dicts or objects is how database results become API responses. In long-running servers, always release connections properly so they do not pile up or leave the database locked.",
      "commonMistakes": [
        "Leaving connections open. This can keep file locks and cause 'database is locked' errors.",
        "Setting row_factory after a query has already run. Rows from that earlier query stay plain tuples."
      ],
      "sources": [
        { "title": "Python docs: sqlite3.Row", "url": "https://docs.python.org/3/library/sqlite3.html#sqlite3.Row" },
        { "title": "Python docs: how to create and use row factories", "url": "https://docs.python.org/3/library/sqlite3.html#how-to-create-and-use-row-factories" },
        { "title": "Python docs: contextlib.closing", "url": "https://docs.python.org/3/library/contextlib.html#contextlib.closing" }
      ]
    }
  ],
  "quiz": [
    {
      "question": "Why is building a SQL query with an f-string that contains user input dangerous?",
      "options": [
        "Typed text can change the meaning of the query (SQL injection), because the database cannot tell your SQL from the user's text",
        "f-strings cannot contain quotation marks, so the query would fail to run",
        "f-strings make the query run slower than placeholders",
        "SQLite refuses to execute any statement that was built from a string"
      ],
      "answerIndex": 0,
      "explanation": "Pasting input into the SQL text lets an attacker add their own SQL, such as OR '1'='1'. Placeholders pass the value separately so it is never treated as SQL."
    },
    {
      "question": "What does `with con:` do when the block succeeds, when it raises an exception, and does it close the connection?",
      "options": [
        "It commits on success, rolls back on an exception, and closes the connection in both cases",
        "It does nothing on success, rolls back on an exception, and closes the connection",
        "It commits on success, rolls back on an exception, and does not close the connection",
        "It always commits, even after an exception, and does not close the connection"
      ],
      "answerIndex": 2,
      "explanation": "with con: manages the transaction only. You still need con.close() (or contextlib.closing) to close the connection."
    },
    {
      "question": "A variable name holds a string. How do you pass it to a single ? placeholder correctly?",
      "options": [
        "execute(sql, name)",
        "execute(sql, (name))",
        "execute(sql, name + ',')",
        "execute(sql, (name,))"
      ],
      "answerIndex": 3,
      "explanation": "The parameters must be a sequence such as a tuple. (name) is only the string in parentheses; the trailing comma in (name,) makes a one-item tuple."
    },
    {
      "question": "What does declaring a column as `INTEGER PRIMARY KEY` give you?",
      "options": [
        "A text column that must be unique and is typed in by hand each time",
        "A unique whole-number id that is filled in automatically when you insert a row, readable afterwards through cur.lastrowid",
        "A hidden column that can never be read by any SELECT query",
        "A column whose stored values are automatically encrypted"
      ],
      "answerIndex": 1,
      "explanation": "An INTEGER PRIMARY KEY uniquely identifies each row and is assigned automatically if you leave it out of the INSERT. cur.lastrowid gives you the id of the row you just inserted."
    },
    {
      "question": "How do you read a column named title from a fetched row by its name?",
      "options": [
        "Call row.title() on a default tuple row, which has methods named after columns",
        "Set con.row_factory = sqlite3.Row, then use row[\"title\"]",
        "Use row.get(\"title\") on a default tuple row, just like a dictionary",
        "Add ORDER BY title to the query so rows come back labeled"
      ],
      "answerIndex": 1,
      "explanation": "Default rows are tuples and only support positions. sqlite3.Row adds access by column name, and dict(row) converts it to a dictionary."
    },
    {
      "question": "Which call makes a throwaway database that lives only in memory?",
      "options": [
        "sqlite3.connect(\"temp.db\")",
        "sqlite3.connect()",
        "sqlite3.connect(\":memory:\")",
        "sqlite3.memory()"
      ],
      "answerIndex": 2,
      "explanation": "The special name \":memory:\" tells SQLite to keep the database in RAM, so it vanishes when the connection closes. \"temp.db\" would create a file on disk."
    },
    {
      "question": "Which statement counts the rows in the books table?",
      "options": [
        "COUNT books",
        "SELECT books.length",
        "SELECT ALL ROWS FROM books",
        "SELECT COUNT(*) FROM books"
      ],
      "answerIndex": 3,
      "explanation": "COUNT(*) is an SQL function that counts rows, and FROM books names the table to count. The other forms are not valid SQL."
    },
    {
      "question": "What does a database table store?",
      "options": [
        "Rows of data arranged in named columns",
        "Python functions that run when you query it",
        "Only one single value per database file",
        "A history of the SQL commands you have run"
      ],
      "answerIndex": 0,
      "explanation": "A table is like a spreadsheet sheet: each row is one record and each column has a name and a type. It holds data, not code or command history."
    }
  ]
});
