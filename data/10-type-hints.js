window.TOPICS = window.TOPICS || [];
window.TOPICS.push({
  "id": "10-type-hints",
  "order": 10,
  "title": "Type Hints",
  "version": "Python 3.15.2 + uv 0.13.7",
  "summary": "Type hints are small labels in your code that say what kind of value a variable, parameter, or return value should hold. Python does not enforce them while the program runs, but editors and type checkers use them to catch bugs early. You will learn to annotate code, hint collections and optional values, name types with the type statement (a line that gives a type a short name), and run mypy (a type checker: a tool that reads hints and reports mismatches) through uvx (a uv command that runs a tool without installing it).",
  "prerequisites": ["09-functions"],
  "subtopics": [
    {
      "id": "annotating-variables-and-functions",
      "title": "Annotating variables and functions",
      "explanation": "A type hint (also called a type annotation) is a label that says what type of value something should hold. A type is the kind of value: int for whole numbers, str for text, float for decimal numbers, bool for True/False. For a variable you write the type after a colon: name: str = \"Ada\". For a function you hint each parameter the same way, and you hint the return value (the value the function gives back) with an arrow: def area(w: float, h: float) -> float:.\n\nThe most important fact: Python does not check hints when the program runs. If you pass the wrong type, Python still tries to run the code and only fails if the code itself breaks. Hints are read by humans, editors, and separate tools called type checkers (you will meet one at the end of this topic).\n\nA function that returns nothing is hinted with -> None. Default values still work as usual: times: int = 1 means the parameter is an int and is 1 if the caller does not give it.\n\nAdd hints to function signatures (the def line that names the parameters and return type) first. They give the most value for the least typing, because the types of local variables inside can usually be worked out automatically.",
      "analogy": "Think of labels on storage jars in a kitchen. A jar labelled \"Sugar\" will not stop you pouring salt into it, but anyone reading the label, or a careful checker walking past, will notice the mistake.",
      "code": [
        {
          "language": "python",
          "filename": "hints.py",
          "source": "max_users: int = 100\n\n\ndef greet(name: str, times: int = 1) -> str:\n    return \", \".join([\"Hi \" + name] * times)\n\n\nprint(greet(\"Ada\", 2))\nprint(greet(\"Bo\"))\nprint(max_users)",
          "output": "Hi Ada, Hi Ada\nHi Bo\n100",
          "explanation": "max_users is hinted as an int. greet takes a str and an int (default 1) and returns a str. The list [\"Hi Ada\"] is repeated 2 times with * and joined with \", \". With the default times=1 there is just one item, so no separator appears."
        }
      ],
      "productionNote": "Most production Python code is type-hinted. Editors use the hints for autocomplete and inline warnings, and teammates read function signatures (the def line that names the parameters and return type) to understand a function without opening its body.",
      "commonMistakes": [
        "Believing hints are checked at run time. greet(5) is not stopped by Python just because name is hinted as str.",
        "Annotating a function that returns nothing as returning something. If it has no return value, write -> None."
      ],
      "sources": [
        { "title": "Python docs: typing", "url": "https://docs.python.org/3/library/typing.html" },
        { "title": "PEP 484: Type Hints", "url": "https://peps.python.org/pep-0484/" }
      ]
    },
    {
      "id": "collection-types",
      "title": "Collection types",
      "explanation": "A collection holds several values, such as a list, dict, set, or tuple. To hint what is inside, put the item types in square brackets: list[int] is a list of ints, dict[str, float] is a dict with str keys and float values, set[str] is a set of strings. These built-in names work directly as hints, so you do not need to import anything from the typing module for them (imports are covered in topic 12).\n\nTuples are special. A tuple has a fixed size, so tuple[int, int] means exactly two ints, like a point (3, 4). For a tuple of any length with the same type, use tuple[str, ...]. Careful: tuple[int] means exactly one int.\n\nFor function inputs that you only read, prefer broad types from the collections.abc module (a module is a ready-made code file; imports are covered in topic 12), such as Iterable[int] (anything you can loop over) or Mapping[str, int] (any read-only dict-like object). Then callers can pass a list, a tuple, a set, or a generator. For return values, be specific, for example list[int].",
      "analogy": "A labelled egg carton. It is not just \"a box\"; it says \"a box of eggs\". list[int] likewise says \"a list of ints\", not just \"a list\".",
      "code": [
        {
          "language": "python",
          "filename": "collection_hints.py",
          "source": "from collections.abc import Iterable\n\n\ndef average(values: Iterable[float]) -> float:\n    items = list(values)\n    return sum(items) / len(items)\n\n\nscores: dict[str, list[int]] = {\"ada\": [90, 80], \"bo\": [70]}\nprint(average(scores[\"ada\"]))\n\npoint: tuple[int, int] = (3, 4)\nprint(point)",
          "output": "85.0\n(3, 4)",
          "explanation": "average accepts any iterable of numbers and turns it into a list so it can use len. The first line, from collections.abc import Iterable, loads a ready-made name from Python's standard library; imports are covered fully in topic 12. (90 + 80) / 2 is 85.0 because / always gives a float. scores is a dict whose values are lists of ints, and point is a tuple of exactly two ints."
        }
      ],
      "productionNote": "Function signatures in APIs (the functions that other code calls) and services document the shape of your data. Accepting Iterable or Mapping for inputs keeps functions flexible, while precise return types tell callers exactly what they get.",
      "commonMistakes": [
        "Using the old typing.List and typing.Dict style. They are deprecated (old, still working, but no longer recommended) aliases; write list[int] and dict[str, int] instead.",
        "Thinking tuple[int] means a tuple of any number of ints. It means exactly one int; use tuple[int, ...] for any length."
      ],
      "sources": [
        { "title": "Python docs: Generic alias types", "url": "https://docs.python.org/3/library/stdtypes.html#types-genericalias" },
        { "title": "Python docs: collections.abc", "url": "https://docs.python.org/3/library/collections.abc.html" }
      ]
    },
    {
      "id": "unions-and-optional-values",
      "title": "Unions and optional values",
      "explanation": "Sometimes a value can be one of several types. A union type lists the allowed types with a vertical bar: int | str means \"an int or a str\". The most common union is a value that may be missing: str | None means \"a string, or None\". None is Python's special value for \"nothing here\".\n\nWrite X | None. Older code uses Optional[X] from typing, which means the same thing, but the | form is the modern, preferred style. Note that Optional does not mean \"this parameter has a default\"; it only says None is an allowed value.\n\nWhen a value might be None, you must check before using it. This check is called narrowing: after if name is None: the type checker knows that in the else branch, name is a plain str, so calling name.upper() is safe. Without the check, a type checker will warn you, because calling a method on None crashes the program with an error.",
      "analogy": "A parking spot labelled \"car or motorbike\" allows two kinds of vehicle. Adding \"or empty\" is like | None: you must look before you assume there is a vehicle to drive away.",
      "code": [
        {
          "language": "python",
          "filename": "optional.py",
          "source": "def find_user(user_id: int) -> str | None:\n    users = {1: \"Ada\", 2: \"Linus\"}\n    return users.get(user_id)\n\n\nname = find_user(3)\nif name is None:\n    print(\"not found\")\nelse:\n    print(name.upper())\n\nprint(find_user(1))",
          "output": "not found\nAda",
          "explanation": "dict.get returns None when the key is missing, so the return type is str | None. User 3 does not exist, so the first branch prints \"not found\". The else branch is where name is known to be a str. find_user(1) returns \"Ada\"."
        }
      ],
      "productionNote": "Database lookups, dictionary lookups, and optional configuration values naturally return X | None. Type checkers force callers to handle the missing case, which prevents a very common class of crashes.",
      "commonMistakes": [
        "Calling a method on a possibly-None value without checking, for example find_user(3).upper().",
        "Using Optional to mean \"parameter with a default\". Optional only means None is allowed; a default value is a separate thing."
      ],
      "sources": [
        { "title": "PEP 604: Union operator", "url": "https://peps.python.org/pep-0604/" },
        { "title": "Python docs: typing.Optional", "url": "https://docs.python.org/3/library/typing.html#typing.Optional" }
      ]
    },
    {
      "id": "type-aliases-with-type",
      "title": "Type aliases with type",
      "explanation": "A type alias is a new name for an existing type. Since Python 3.12 you create one with the type statement: type UserId = int or type Matrix = list[list[float]]. Long or repeated types become short, meaningful names, and signatures read like plain English.\n\nAn alias is only a name. UserId and int are the same type to a checker, so it will not stop you from passing any int where a UserId is expected. If you need a separate, checked type, look at typing.NewType. In new code, avoid the older TypeAlias style; use the type statement.\n\nThe same modern syntax lets you write generic functions: functions that work for many types while keeping them linked. def first[T](items: list[T]) -> T: declares a type variable T in square brackets; T is a placeholder for whichever type is passed in. If you pass a list of str, the result is a str; with a list of int, an int. Here is just a brief introduction; you can keep using plain hints for most code.",
      "analogy": "Calling a \"two-bedroom flat with balcony\" simply a \"Type B unit\". The building is the same; the short name just makes conversation easier.",
      "code": [
        {
          "language": "python",
          "filename": "aliases.py",
          "source": "type Point = tuple[float, float]\n\n\ndef distance(a: Point, b: Point) -> float:\n    return ((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2) ** 0.5\n\n\nprint(distance((0, 0), (3, 4)))\n\n\ndef first[T](items: list[T]) -> T:\n    return items[0]\n\n\nprint(first([\"x\", \"y\"]))",
          "output": "5.0\nx",
          "explanation": "Point is a name for a pair of floats. distance computes the straight-line distance: 3 squared plus 4 squared is 25, and 25 ** 0.5 is 5.0. first uses a type variable T, so for a list of str it is known to return a str; items[0] is \"x\"."
        }
      ],
      "productionNote": "Domain names for types, such as UserId or Money, make signatures readable and give one place to change a complex type later.",
      "commonMistakes": [
        "Thinking an alias creates a new, separately checked type. It does not; use NewType when you need that.",
        "Using the old TypeAlias form in new code. Prefer the type statement."
      ],
      "sources": [
        { "title": "Python reference: The type statement", "url": "https://docs.python.org/3/reference/simple_stmts.html#the-type-statement" },
        { "title": "PEP 695: Type parameter syntax", "url": "https://peps.python.org/pep-0695/" }
      ]
    },
    {
      "id": "checking-types-with-uvx",
      "title": "Checking types with a type checker via uvx",
      "explanation": "A type checker is a tool that reads your code without running it and reports places where the types do not match your hints. mypy is a popular one. Since Python itself ignores hints, the checker is what gives them teeth.\n\nYou do not have to install mypy to try it. uvx mypy app.py downloads mypy into a temporary, isolated environment (its own private set of installed packages) and runs it on app.py.\n\nuvx is a shortcut for uv tool run. The first run takes a moment to download; later runs reuse the cache. In a real project you will add mypy as a development dependency (a package the project needs only while developing) instead (covered in later topics).\n\nThe example below shows both halves. Running buggy.py with uv run buggy.py works and prints 44 because \"4\" * 2 is the string \"44\": hints are not enforced. Running mypy on the same file reports the mistake without executing anything. The exact wording and line number can vary with the mypy version.",
      "analogy": "A spell checker for types. It underlines mistakes before you send the letter, but it does not stop you sending it.",
      "code": [
        {
          "language": "python",
          "filename": "buggy.py",
          "source": "def double(n: int) -> int:\n    return n * 2\n\n\nprint(double(\"4\"))",
          "output": "44",
          "explanation": "Run with uv run buggy.py, this prints 44: multiplying the string \"4\" by 2 repeats it. Python did not complain even though n is hinted as int."
        },
        {
          "language": "bash",
          "filename": "terminal",
          "source": "uvx mypy buggy.py",
          "output": "buggy.py:5: error: Argument 1 to \"double\" has incompatible type \"str\"; expected \"int\"  [arg-type]\nFound 1 error in 1 file (checked 1 source file)",
          "explanation": "mypy finds the bad call on line 5 without running the program. This is representative output; the message text and extra download lines can differ by mypy version."
        }
      ],
      "productionNote": "CI (continuous integration, the automatic checks run on every pull request) usually runs a type checker, so type errors are caught before code is merged.",
      "commonMistakes": [
        "Silencing checker errors with # type: ignore (a comment that tells the checker to skip that line) everywhere. Fix the cause, and ignore only a specific line with a good reason.",
        "Expecting the checker to run your code. It only reads it, so it cannot catch problems that appear only at run time."
      ],
      "sources": [
        { "title": "mypy docs: Getting started", "url": "https://mypy.readthedocs.io/en/stable/getting_started.html" },
        { "title": "uv docs: Using tools", "url": "https://docs.astral.sh/uv/guides/tools/" }
      ]
    }
  ],
  "quiz": [
    {
      "question": "A function is declared def greet(name: str) -> str. You call greet(5). Does Python itself stop the call because 5 is not a str?",
      "options": [
        "Yes, Python raises a TypeError (an error for using the wrong kind of value) immediately for every wrong hint",
        "Yes, Python checks hints before the function body runs",
        "Yes, but only when the function has a default value",
        "No, hints are not enforced at run time; only tools like mypy report the mismatch"
      ],
      "answerIndex": 3,
      "explanation": "Type hints are information for humans, editors, and type checkers. Python does not check them while running."
    },
    {
      "question": "Which hint means \"a string, or nothing (None)\"?",
      "options": ["str or None", "str & None", "str | None", "str[None]"],
      "answerIndex": 2,
      "explanation": "The union operator | combines types, so str | None means either a str or None. It is the modern replacement for Optional[str]."
    },
    {
      "question": "What does uvx mypy app.py do?",
      "options": [
        "Runs app.py and prints its output",
        "Runs mypy in a temporary environment to type-check app.py without running it",
        "Installs mypy permanently into your Python installation",
        "Formats app.py with mypy"
      ],
      "answerIndex": 1,
      "explanation": "uvx is short for uv tool run. It fetches mypy into an isolated temporary environment and runs it; mypy reads the code and reports type errors without executing it."
    },
    {
      "question": "Which is the modern way to hint a list of ints?",
      "options": ["list[int]", "list(int)", "list<int>", "[int]"],
      "answerIndex": 0,
      "explanation": "Built-in collections are generic directly, so list[int] works without imports. typing.List is a deprecated alias."
    },
    {
      "question": "Which line creates a type alias in Python 3.12 or newer?",
      "options": ["UserId = type(int)", "alias UserId = int", "type UserId = int", "typedef int UserId"],
      "answerIndex": 2,
      "explanation": "The type statement gives a type a short name, so type UserId = int makes UserId a name for int."
    }
  ]
}
);
