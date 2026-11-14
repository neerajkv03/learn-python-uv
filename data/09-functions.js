window.TOPICS = window.TOPICS || [];
window.TOPICS.push({
 "id": "09-functions",
 "order": 9,
 "title": "Functions",
 "version": "Python 3.15.2 + uv 0.13.7",
 "summary": "A function is a named, reusable block of code. You will learn to define functions, give them flexible parameters (the names listed in the def line), understand where names live (scope), and write tiny lambdas (one-line unnamed functions). Almost every real Python program is built from small functions like these.",
 "prerequisites": [
  "08-comprehensions-unpacking"
 ],
 "subtopics": [
  {
   "id": "defining-and-returning",
   "title": "Defining and returning",
   "explanation": "A function is a named block of code you can run again and again. You create one with the `def` keyword, a name, parentheses holding the parameters, and a colon. The body is indented underneath. Parameters are the names listed in the `def` line; arguments are the actual values you pass when you call the function.\n\nThe `return` statement hands a value back to the caller. When Python reaches `return`, the function ends immediately, so any code after it in that path never runs. If a function has no `return` (or a bare `return`), it gives back `None`, Python's built-in value meaning \"nothing\".\n\nThe first string inside the body is the docstring (documentation string). It describes what the function does, and tools and `help()` can show it. Write one short sentence for each function.\n\nPrinting is not returning. `print` only shows text on screen; `return` gives the caller a value it can store and use. Prefer returning values so your functions are easy to reuse and test.",
   "analogy": "A vending machine: you put in inputs (coins and a choice), you get an output (a snack), and the inner workings stay hidden.",
   "code": [
    {
     "language": "python",
     "filename": "area.py",
     "source": "def rectangle_area(width, height):\n    \"\"\"Return the area of a rectangle.\"\"\"\n    return width * height\n\n\ndef greet(name):\n    print(f\"Hi {name}\")\n\n\nprint(rectangle_area(3, 4))\nresult = greet(\"Ada\")\nprint(result)\n",
     "output": "12\nHi Ada\nNone",
     "explanation": "`rectangle_area` returns 12, which `print` then shows. `greet` only prints and has no `return`, so `result` holds `None`."
    }
   ],
   "productionNote": "Real codebases are organised into many small functions that each do one job. Small functions are easy to read, reuse and test.",
   "commonMistakes": [
    "Printing a value instead of returning it, so the caller gets None.",
    "Writing `rectangle_area` without parentheses: that refers to the function itself and does not call it.",
    "Putting code after `return`; it never runs."
   ],
   "sources": [
    {
     "title": "Python tutorial: Defining functions",
     "url": "https://docs.python.org/3/tutorial/controlflow.html#defining-functions"
    }
   ]
  },
  {
   "id": "parameters-and-defaults",
   "title": "Parameters and defaults",
   "explanation": "A default value lets a parameter be optional: `def connect(host, port=5432)`. If the caller leaves `port` out, Python uses 5432. Parameters with defaults must come after those without.\n\nWhen calling, you can pass arguments by keyword: `connect(\"db\", timeout=30)`. Keyword arguments make calls self-explanatory and let you skip over other defaults. Once you use a keyword argument in a call, a plain positional argument cannot follow it, or Python raises a SyntaxError (an error for code that breaks Python's writing rules).\n\nDefault values are created once, when the `def` line runs, not on every call. That is harmless for numbers and strings, but dangerous for mutable (changeable) objects like lists. A default `[]` would be shared by every call and keep growing. The safe pattern is `tags=None`, then create a fresh list inside the function when it is `None`.",
   "analogy": "A coffee order: the size defaults to \"medium\" unless you say otherwise.",
   "code": [
    {
     "language": "python",
     "filename": "defaults.py",
     "source": "def connect(host, port=5432, timeout=10):\n    return f\"{host}:{port} (timeout={timeout})\"\n\n\nprint(connect(\"db\"))\nprint(connect(\"db\", timeout=30))\n\n\ndef add_tag(tag, tags=None):\n    if tags is None:\n        tags = []\n    tags.append(tag)\n    return tags\n\n\nprint(add_tag(\"a\"))\nprint(add_tag(\"b\"))\n",
     "output": "db:5432 (timeout=10)\ndb:5432 (timeout=30)\n['a']\n['b']",
     "explanation": "Defaults fill in `port` and `timeout`. The `None` pattern gives each call its own new list, so the second call does not see `'a'`."
    }
   ],
   "productionNote": "Library APIs offer sensible defaults and let callers tweak behaviour with keyword options.",
   "commonMistakes": [
    "Using `def f(items=[])`: one list is shared across all calls.",
    "Putting a positional argument after a keyword argument in a call (SyntaxError).",
    "Placing a parameter without a default after one with a default in `def`."
   ],
   "sources": [
    {
     "title": "Python tutorial: Default argument values",
     "url": "https://docs.python.org/3/tutorial/controlflow.html#default-argument-values"
    },
    {
     "title": "Python tutorial: Keyword arguments",
     "url": "https://docs.python.org/3/tutorial/controlflow.html#keyword-arguments"
    }
   ]
  },
  {
   "id": "args-and-kwargs",
   "title": "*args and **kwargs",
   "explanation": "Sometimes you do not know how many arguments a caller will pass. A parameter written `*numbers` collects all extra positional arguments into a tuple (an unchangeable sequence). A parameter written `**info` collects extra keyword arguments into a dict (key-value pairs). The names `args` and `kwargs` are only convention.\n\nThe same symbols work at the call site in reverse: `total(*values)` unpacks a list into separate positional arguments, and `f(**options)` unpacks a dict into keyword arguments. Forgetting the `*` would pass the whole list as one argument.\n\nThese are great for wrappers (small functions that pass arguments on to another function). But do not overuse `**kwargs`: if every function accepts anything, callers cannot tell what is valid. Prefer named parameters when you know them.",
   "analogy": "A \"bring anything\" potluck table: any number of dishes (args), each optionally labelled (kwargs).",
   "code": [
    {
     "language": "python",
     "filename": "varargs.py",
     "source": "def total(*numbers):\n    return sum(numbers)\n\n\nprint(total(1, 2, 3))\n\n\ndef describe(**info):\n    return \", \".join(f\"{k}={v}\" for k, v in info.items())\n\n\nprint(describe(name=\"Ada\", role=\"admin\"))\n\nvalues = [4, 5]\nprint(total(*values))\n",
     "output": "6\nname=Ada, role=admin\n9",
     "explanation": "`numbers` is the tuple `(1, 2, 3)`. `info` is a dict of the keyword arguments. `*values` spreads the list into two arguments."
    }
   ],
   "productionNote": "Wrappers (small functions that pass arguments along) forward arguments with `*args, **kwargs`; logging and formatting helpers use them for flexibility.",
   "commonMistakes": [
    "Overusing **kwargs so callers cannot tell what the function accepts.",
    "Forgetting `*` when passing a list, so the list arrives as one argument."
   ],
   "sources": [
    {
     "title": "Python tutorial: Arbitrary argument lists",
     "url": "https://docs.python.org/3/tutorial/controlflow.html#arbitrary-argument-lists"
    },
    {
     "title": "Python tutorial: Unpacking argument lists",
     "url": "https://docs.python.org/3/tutorial/controlflow.html#unpacking-argument-lists"
    }
   ]
  },
  {
   "id": "keyword-only-and-positional-only",
   "title": "Keyword-only and positional-only parameters",
   "explanation": "A bare `*` in the parameter list means every parameter after it must be passed by keyword. A `/` means every parameter before it must be passed by position only. Parameters between them (or with neither marker) can be passed either way.\n\nKeyword-only parameters prevent confusing calls such as `send(msg, True, False)`, where nobody can tell what `True` means. With `*`, the caller must write `send(msg, urgent=True)`.\n\nPositional-only parameters are useful when the name is not meaningful to callers or you may want to rename it later without breaking anyone. Many built-in functions work this way.",
   "analogy": "A form where some boxes must be labelled (\"Signature:\") so nobody puts a value in the wrong box, while other boxes are simply filled in order and must not carry a label.",
   "code": [
    {
     "language": "python",
     "filename": "special_params.py",
     "source": "def send(message, *, urgent=False, retries=1):\n    return f\"{message} urgent={urgent} retries={retries}\"\n\n\nprint(send(\"hi\", urgent=True))\n\n\ndef scale(value, /, factor=2):\n    return value * factor\n\n\nprint(scale(5))\nprint(scale(5, factor=3))\n",
     "output": "hi urgent=True retries=1\n10\n15",
     "explanation": "`urgent` and `retries` can only be given by name. `value` can only be given by position, while `factor` may be either."
    }
   ],
   "productionNote": "In well-designed APIs, boolean flags and options are keyword-only so call sites read clearly.",
   "commonMistakes": [
    "Calling `send(\"hi\", True)`, which raises TypeError (Python's error for calling something with the wrong kind of arguments) because `urgent` is keyword-only.",
    "Misplacing `/` and `*` (`/` must come before `*`)."
   ],
   "sources": [
    {
     "title": "Python tutorial: Special parameters",
     "url": "https://docs.python.org/3/tutorial/controlflow.html#special-parameters"
    }
   ]
  },
  {
   "id": "scope",
   "title": "Scope",
   "explanation": "Scope is the region of code where a name is visible. Names created inside a function are local: they exist only while the function runs and vanish when it returns. Names created at the top of a file are global.\n\nA function can read global names, but assigning to a name inside a function creates a new local name, even if a global has the same name. The global stays untouched. (The `global` keyword can change this, but avoid it: pass values in and return results instead.)\n\nPython looks names up in this order, called LEGB: Local, Enclosing (an outer function), Global, then Built-in. If you assign to a name anywhere in a function and also try to read it earlier, you get `UnboundLocalError` (an error for using a local name before it has been given a value), because Python treats the name as local for the whole function.",
   "analogy": "What happens in a hotel room stays in the room; the lobby (global) is visible to everyone.",
   "code": [
    {
     "language": "python",
     "filename": "scope.py",
     "source": "rate = 0.1\n\n\ndef tax(amount):\n    result = amount * rate\n    return result\n\n\nprint(tax(200))\n\ncounter = 0\n\n\ndef reset():\n    counter = 5\n    return counter\n\n\nprint(reset(), counter)\n",
     "output": "20.0\n5 0",
     "explanation": "`tax` reads the global `rate`. `reset` creates a separate local `counter`, so the global `counter` is still 0."
    }
   ],
   "productionNote": "Avoiding global mutable state makes code easier to test and safer when a program does several things at once.",
   "commonMistakes": [
    "Assigning to a global name inside a function and expecting the global to change; or reading it first and getting UnboundLocalError (an error for using a local name before it has been given a value).",
    "Relying on global variables instead of parameters and return values."
   ],
   "sources": [
    {
     "title": "Python tutorial: Scopes and namespaces",
     "url": "https://docs.python.org/3/tutorial/classes.html#python-scopes-and-namespaces"
    },
    {
     "title": "Python FAQ: Local and global variables",
     "url": "https://docs.python.org/3/faq/programming.html#what-are-the-rules-for-local-and-global-variables-in-python"
    }
   ]
  },
  {
   "id": "lambda",
   "title": "Lambda",
   "explanation": "A lambda is a tiny unnamed function written in one line: `lambda args: expression`. The expression's value is returned automatically. It can hold only a single expression, no statements.\n\nTheir best use is as a short throwaway function passed to something else, especially the `key=` argument of `min`, `max` and `sorted`, which says how to compare items. Here `key=lambda p: p[1]` means \"compare by the second item\".\n\nIf the logic needs more than one simple expression, or you want to reuse it by name, write a regular `def` instead.",
   "analogy": "A sticky-note instruction versus a full manual.",
   "code": [
    {
     "language": "python",
     "filename": "lambda_demo.py",
     "source": "products = [(\"pen\", 10), (\"book\", 250), (\"bag\", 900)]\n\ncheapest = min(products, key=lambda p: p[1])\nprint(cheapest)\nprint(sorted(products, key=lambda p: -p[1])[0][0])\n",
     "output": "('pen', 10)\nbag",
     "explanation": "`min` compares the prices. Sorting by negative price puts the most expensive first, and `[0][0]` takes that item's name."
    }
   ],
   "productionNote": "Used for sort keys and small callbacks; anything longer becomes a named function.",
   "commonMistakes": [
    "Assigning a lambda to a name (`f = lambda x: x`); use `def` instead.",
    "Trying to put statements (like assignments or `return`) in a lambda."
   ],
   "sources": [
    {
     "title": "Python tutorial: Lambda expressions",
     "url": "https://docs.python.org/3/tutorial/controlflow.html#lambda-expressions"
    }
   ]
  }
 ],
 "quiz": [
  {
   "question": "What does a function without a `return` statement give back?",
   "options": [
    "None",
    "0",
    "An empty string",
    "It raises an error"
   ],
   "answerIndex": 0,
   "explanation": "Without `return`, the call evaluates to `None`."
  },
  {
   "question": "Why is `def f(x=[])` dangerous?",
   "options": [
    "Lists cannot be defaults",
    "It is a SyntaxError",
    "The same list is created once and shared across calls",
    "The list is deleted after the first call"
   ],
   "answerIndex": 2,
   "explanation": "Default values are evaluated once at definition time, so a mutable default keeps changes between calls."
  },
  {
   "question": "In `def f(a, *, b)`, how must `b` be passed?",
   "options": [
    "Positionally only",
    "Either way",
    "It cannot be passed",
    "By keyword only"
   ],
   "answerIndex": 3,
   "explanation": "Parameters after a bare `*` are keyword-only, e.g. `f(1, b=2)`."
  },
  {
   "question": "Inside `def f(*args)`, what type is `args`?",
   "options": [
    "list",
    "tuple",
    "dict",
    "set"
   ],
   "answerIndex": 1,
   "explanation": "`*args` collects extra positional arguments into a tuple."
  },
  {
   "question": "x = 0 at the top of a file. A function sets x = 5 inside its body, then is called. What is the top-level x afterwards?",
   "options": [
    "0",
    "5",
    "None",
    "An error"
   ],
   "answerIndex": 0,
   "explanation": "Assigning inside a function creates a local name, so the global x stays 0."
  },
  {
   "question": "What does min([('pen', 10), ('bag', 900)], key=lambda p: p[1]) return?",
   "options": [
    "('bag', 900)",
    "10",
    "('pen', 10)",
    "An error"
   ],
   "answerIndex": 2,
   "explanation": "min compares the second item of each pair, and 10 is smaller than 900."
  }
 ]
});
