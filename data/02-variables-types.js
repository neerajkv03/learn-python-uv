window.TOPICS = window.TOPICS || [];
window.TOPICS.push({
  "id": "02-variables-types",
  "order": 2,
  "title": "Variables & Types",
  "version": "Python 3.15.2 + uv 0.13.7",
  "summary": "Learn how to store values under names (variables) and the basic kinds of values Python has: whole numbers, decimals, text, True/False and None. You will also learn how to convert between types and how to leave comments for other people.",
  "prerequisites": ["01-setup-with-uv"],
  "subtopics": [
    {
      "id": "variables-and-assignment",
      "title": "Variables and assignment",
      "explanation": "A variable is a name that refers to a value. You create one with the assignment operator `=` (an operator is a symbol that does something, like `=` or `+`). In `city = \"Pune\"`, the name `city` now refers to the text \"Pune\". Note that `=` means \"assign\" (give this name that value), not \"is equal to\" as in maths.\n\nA name can be reassigned at any time, even to a different kind of value. After `count = 3`, writing `count = count + 1` first works out the right side (3 + 1 = 4), then points `count` at the result. You can also assign several names at once: `x, y = 10, 20` gives `x` the value 10 and `y` the value 20.\n\nNames may contain letters, digits and underscores `_`, but cannot start with a digit and cannot contain spaces or dashes. Names are case-sensitive, so `Count` and `count` are different. By convention (agreed style, not enforced by Python) we write names in `snake_case`: lowercase words joined by underscores. Values that should never change are written in ALL_CAPS, like `MAX_RETRIES`.",
      "analogy": "A variable is a sticky-note label stuck on a box. The box holds the value. You can peel the label off and stick it on a different box whenever you like.",
      "code": [
        {
          "language": "python",
          "filename": "variables.py",
          "source": "city = \"Pune\"\ncount = 3\nprint(city, count)\n\ncount = count + 1\nprint(count)\n\nx, y = 10, 20\nprint(x, y)",
          "output": "Pune 3\n4\n10 20",
          "explanation": "`print` shows values separated by a space. The line `count = count + 1` reads the old value (3), adds 1, and re-labels `count` with the new value 4. The last two lines assign two names in one statement."
        }
      ],
      "productionNote": "Clear, descriptive names such as `order_total` or `MAX_RETRIES` are the first thing code reviewers look at. Code is read far more often than it is written, so a good name saves everyone time.",
      "commonMistakes": [
        "Using a variable before assigning it, which raises a `NameError` (Python does not know that name yet).",
        "Choosing names like `l` or `x1` that say nothing about what the value means.",
        "Mixing up `=` (assign) and `==` (compare for equality)."
      ],
      "sources": [
        { "title": "Python tutorial: Using Python as a calculator", "url": "https://docs.python.org/3/tutorial/introduction.html#using-python-as-a-calculator" },
        { "title": "PEP 8: Naming conventions", "url": "https://peps.python.org/pep-0008/#naming-conventions" }
      ]
    },
    {
      "id": "numbers-int-float",
      "title": "Numbers (int, float)",
      "explanation": "Python has two everyday number types. An `int` (integer) is a whole number with no decimal point, and it can be as large as you need. A `float` (floating-point number) has a decimal point, like `19.99`. You can check which type a value has with the built-in function `type()`; it reports the value's class, which just means its kind (type).\n\nFor long numbers you may put underscores between digits to make them readable: `1_400_000_000` is the same as `1400000000`. Python ignores the underscores.\n\nFloats are stored approximately, because computers keep them in binary (base-2 digits, only 0 and 1) and many decimals (like 0.1) cannot be written exactly in binary. So `0.1 + 0.2` gives `0.30000000000000004`, not exactly `0.3`. This is normal behaviour in every language, not a Python bug. Integers, in contrast, are always exact.",
      "analogy": "An `int` is counting whole apples: you always get an exact answer. A `float` is measuring water with a ruler that has limited markings: the answer is very close, but not always perfectly exact.",
      "code": [
        {
          "language": "python",
          "filename": "numbers.py",
          "source": "population = 1_400_000_000\nprint(population)\n\nprice = 19.99\nprint(type(price))\n\nprint(0.1 + 0.2)\nprint(2 ** 100)",
          "output": "1400000000\n<class 'float'>\n0.30000000000000004\n1267650600228229401496703205376",
          "explanation": "The underscores vanish when printed. `type(price)` reports the float class. `2 ** 100` means 2 to the power 100; ints never overflow (run out of room), so the full exact result is shown."
        }
      ],
      "productionNote": "Never use `float` for money. Use `decimal.Decimal` (a standard-library type for exact decimal numbers) or store whole cents as an `int`, so rounding errors cannot creep into totals.",
      "commonMistakes": [
        "Expecting `0.1 + 0.2 == 0.3` to be True. It is False because of tiny float errors.",
        "Using floats to store money amounts."
      ],
      "sources": [
        { "title": "Python docs: Numeric types", "url": "https://docs.python.org/3/library/stdtypes.html#numeric-types-int-float-complex" },
        { "title": "Python tutorial: Floating-point arithmetic", "url": "https://docs.python.org/3/tutorial/floatingpoint.html" }
      ]
    },
    {
      "id": "strings-basics",
      "title": "Strings basics",
      "explanation": "A string (`str`) is text. You write it inside single quotes `'like this'` or double quotes `\"like this\"`; both mean the same, but the opening and closing quote must match.\n\nThe `+` operator joins (concatenates) two strings, and `*` repeats a string a number of times. The built-in `len()` returns how many characters a string has, including spaces.\n\nStrings and numbers are different types, so Python will not mix them with `+`. To put a number into text you must first turn it into a string (see Type conversion below).",
      "analogy": "A string is beads on a thread: each bead is one character, and the order matters. Joining two strings is tying two threads together.",
      "code": [
        {
          "language": "python",
          "filename": "strings_basics.py",
          "source": "first = \"Ada\"\nlast = 'Lovelace'\nfull = first + \" \" + last\nprint(full)\nprint(len(full))\nprint(\"ha\" * 3)",
          "output": "Ada Lovelace\n12\nhahaha",
          "explanation": "`full` is \"Ada\" + a space + \"Lovelace\". Its length is 3 + 1 + 8 = 12 characters. `\"ha\" * 3` repeats the text three times."
        }
      ],
      "productionNote": "Text is everywhere in real programs: user names, log messages, file contents and API data are all strings.",
      "commonMistakes": [
        "Writing `\"Age: \" + 30`, which raises a `TypeError` (an error meaning the value is the wrong type for that operation) because a string and an int cannot be added.",
        "Mismatched quotes, such as `\"hello'`, which cause a `SyntaxError` (Python's error for code written in an invalid form)."
      ],
      "sources": [
        { "title": "Python tutorial: Text", "url": "https://docs.python.org/3/tutorial/introduction.html#text" }
      ]
    },
    {
      "id": "booleans-and-none",
      "title": "Booleans and None",
      "explanation": "A `bool` (boolean) has only two values: `True` and `False`, always written with a capital first letter. They usually come from comparisons: `5 > 3` produces `True`.\n\n`None` is a special value meaning \"no value\" or \"nothing here yet\". It is the only value of its own type, called `NoneType`. It is different from `0`, `False` or an empty string.\n\nTo test whether something is `None`, write `value is None`. The word `is` checks that the value is the single special value `None`, which is the preferred, safe way.",
      "analogy": "A `bool` is a light switch: only on or off. `None` is an empty parking spot with a \"reserved\" sign: the spot exists, but no car is in it.",
      "code": [
        {
          "language": "python",
          "filename": "bool_none.py",
          "source": "is_admin = False\nprint(is_admin)\nprint(5 > 3)\n\nmiddle_name = None\nprint(middle_name is None)\nprint(type(None))",
          "output": "False\nTrue\nTrue\n<class 'NoneType'>",
          "explanation": "`5 > 3` is true, so it prints `True`. `middle_name is None` is also `True` because we assigned `None` to it."
        }
      ],
      "productionNote": "`None` marks optional or missing data in real code, such as an empty database field or a search that found nothing.",
      "commonMistakes": [
        "Writing `true`, `false` or `none` in lowercase. Python raises a `NameError` because these are not known names.",
        "Using `== None` instead of `is None`."
      ],
      "sources": [
        { "title": "Python docs: Boolean type", "url": "https://docs.python.org/3/library/stdtypes.html#boolean-type-bool" },
        { "title": "Python docs: Constants (None)", "url": "https://docs.python.org/3/library/constants.html#None" }
      ]
    },
    {
      "id": "type-conversion",
      "title": "Type conversion",
      "explanation": "Type conversion (also called casting) turns a value of one type into another. Use `int()`, `float()`, `str()` and `bool()`: for example `int(\"42\")` gives the number 42, `float(\"3.5\")` gives 3.5, and `str(7)` gives the text \"7\".\n\nConverting a float with `int()` cuts off the decimal part toward zero; it does not round. So `int(9.99)` is `9`. Converting to `bool` gives `False` for zero and empty text, and `True` for almost everything else: `bool(0)` is `False`, `bool(\"hi\")` is `True`.\n\nIf text cannot be understood as a number, Python raises a `ValueError` (an error meaning the value has the right type but is unsuitable). For example `int(\"hello\")` fails, and so does `int(\"3.5\")`; for that one, convert with `float` first.",
      "analogy": "Currency exchange: you can swap rupees for dollars, but you cannot exchange a bus ticket for money. Some conversions make sense, others do not.",
      "code": [
        {
          "language": "python",
          "filename": "convert.py",
          "source": "age_text = \"42\"\nage = int(age_text)\nprint(age + 1)\n\nprint(float(\"3.5\") * 2)\nprint(int(9.99))\nprint(str(100) + \"%\")\nprint(bool(0), bool(\"hi\"))",
          "output": "43\n7.0\n9\n100%\nFalse True",
          "explanation": "`age` is the int 42, so adding 1 gives 43. A float times an int is a float (`7.0`). `int(9.99)` truncates to 9. `str(100)` makes joining with \"%\" possible."
        }
      ],
      "productionNote": "Anything typed by a user or read from a file or web form arrives as text, so real programs convert it (and handle `ValueError`) before using it as a number.",
      "commonMistakes": [
        "Calling `int(\"3.5\")`, which raises `ValueError`. Use `int(float(\"3.5\"))` instead.",
        "Expecting `int()` to round. It truncates: `int(9.99)` is 9, not 10."
      ],
      "sources": [
        { "title": "Python docs: int()", "url": "https://docs.python.org/3/library/functions.html#int" },
        { "title": "Python docs: float()", "url": "https://docs.python.org/3/library/functions.html#float" }
      ]
    },
    {
      "id": "comments",
      "title": "Comments",
      "explanation": "A comment is a note for humans. Python ignores everything from a `#` to the end of that line. A comment can sit on its own line or after code on the same line.\n\nGood comments explain why something is done (a business rule, a surprising choice), not what the code does, because the code already shows that. Longer documentation text called docstrings comes later, in the functions topic.",
      "analogy": "Pencil notes in the margin of a recipe: the cook ignores them while cooking, but the next reader is grateful for them.",
      "code": [
        {
          "language": "python",
          "filename": "comments.py",
          "source": "# Tax rate set by finance team (2026)\nTAX_RATE = 0.18\n\nprint(100 * TAX_RATE)  # 18% of 100",
          "output": "18.0",
          "explanation": "Both comments are skipped when the program runs. The first explains where the number comes from; the result is a float, so it prints `18.0`."
        }
      ],
      "productionNote": "Use comments for business rules and non-obvious decisions. Reviewers will ask you to delete comments that merely repeat the code.",
      "commonMistakes": [
        "Commenting every single line, which adds noise.",
        "Leaving old commented-out code in the file instead of deleting it (version control remembers it)."
      ],
      "sources": [
        { "title": "Python reference: Comments", "url": "https://docs.python.org/3/reference/lexical_analysis.html#comments" }
      ]
    }
  ],
  "quiz": [
    {
      "question": "What does `print(int(7.9))` output?",
      "options": ["7", "8", "7.9", "It raises an error"],
      "answerIndex": 0,
      "explanation": "`int()` truncates toward zero instead of rounding, so 7.9 becomes 7."
    },
    {
      "question": "Which of these is a valid variable name?",
      "options": ["2nd_place", "second-place", "second_place", "second place"],
      "answerIndex": 2,
      "explanation": "Names may use letters, digits and underscores but cannot start with a digit, and dashes or spaces are not allowed. Only `second_place` is valid."
    },
    {
      "question": "What does `\"5\" + 5` do?",
      "options": ["It raises a TypeError (an error meaning the value is the wrong type for that operation)", "It gives 10, after Python converts the string to a number", "It gives \"55\", after Python joins the two values as text", "It gives 5, because the string is simply ignored"],
      "answerIndex": 0,
      "explanation": "Python will not add a string and an int. You must convert one of them first, e.g. `int(\"5\") + 5`."
    },
    {
      "question": "What is the correct way to check whether a variable `x` holds no value?",
      "options": ["if x == none", "if x = None", "if x is none", "if x is None"],
      "answerIndex": 3,
      "explanation": "`None` is capitalised and the recommended check is `is None`. `=` assigns, and lowercase `none` is not defined."
    },
    {
      "question": "What type does `type(19.99)` report?",
      "options": ["<class 'int'>", "<class 'float'>", "<class 'str'>", "<class 'bool'>"],
      "answerIndex": 1,
      "explanation": "19.99 has a decimal point, so it is a float."
    },
    {
      "question": "Which symbol starts a comment in Python?",
      "options": ["//", "--", "#", "/*"],
      "answerIndex": 2,
      "explanation": "Python ignores everything from # to the end of the line. `//`, `--` and `/*` are not comments in Python."
    }
  ]
});
