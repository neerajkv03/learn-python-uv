window.TOPICS = window.TOPICS || [];
window.TOPICS.push({
 "id": "18-decorators-context-managers",
 "order": 18,
 "title": "Decorators & Context Managers",
 "version": "Python 3.15.2 + uv 0.13.7",
 "summary": "Functions in Python are ordinary values you can pass around, return, and store. Building on that, you will learn closures, decorators (wrappers that add behaviour to a function), functools.wraps, and context managers that guarantee setup and cleanup around a with block.",
 "prerequisites": [
  "17-iterators-generators"
 ],
 "subtopics": [
  {
   "id": "functions-as-objects",
   "title": "Functions as objects",
   "explanation": "In Python a function is a value, just like a number or a string. You can give it a second name, put it in a list or dictionary, hand it to another function as an argument, or return it from a function. A function that accepts or returns other functions is called a higher-order function.\n\nThe key detail is the difference between the function and a call to it. `shout` is the function itself; `shout(\"hi\")` runs it and gives you its result. When you want to pass the function along, write the name with no parentheses.\n\nThis idea powers many real patterns: a dictionary mapping names to functions (a dispatch table), a callback (a function you give to other code to call later), and strategy selection (choosing which behaviour to run at runtime).",
   "analogy": "A recipe card can be photocopied, handed to a friend, or filed in a box. The card itself is a thing you can move around, separate from actually cooking the dish.",
   "code": [
    {
     "language": "python",
     "filename": "first_class.py",
     "source": "def shout(text: str) -> str:\n    return text.upper()\n\n\ndef whisper(text: str) -> str:\n    return text.lower()\n\n\nactions = {\"loud\": shout, \"quiet\": whisper}\nprint(actions[\"loud\"](\"Hello\"))\n\n\ndef apply(func, value: str) -> str:\n    return func(value)\n\n\nprint(apply(whisper, \"HeLLo\"))\n",
     "output": "HELLO\nhello",
     "explanation": "`actions` stores the two functions without calling them. `actions[\"loud\"](\"Hello\")` looks up the function and then calls it. `apply` receives a function as a parameter and calls it on the value."
    }
   ],
   "productionNote": "Dispatch tables (a dict of name to function) replace long if/elif chains for command handlers, and callbacks are how libraries let you plug in your own behaviour.",
   "commonMistakes": [
    "Calling the function while passing it: `apply(shout(), \"x\")` runs `shout` right away (and fails); write `apply(shout, \"x\")`.",
    "Forgetting that a dict value like `actions[\"loud\"]` is only the function; you still need `(...)` to run it."
   ],
   "sources": [
    {
     "title": "Python glossary: function",
     "url": "https://docs.python.org/3/glossary.html#term-function"
    },
    {
     "title": "Python docs: Functional programming HOWTO",
     "url": "https://docs.python.org/3/howto/functional.html"
    }
   ]
  },
  {
   "id": "closures",
   "title": "Closures",
   "explanation": "A closure is an inner function (a function defined inside another function) that remembers variables from the outer function, even after the outer function has finished. In `make_multiplier`, the inner `multiply` keeps using `factor` long after `make_multiplier` returned.\n\nEach call to the outer function creates a fresh set of remembered variables, so `double` and `triple` do not interfere with each other.\n\nBy default the inner function can read outer variables but not reassign them. Assigning to a name inside a function normally creates a new local variable. The `nonlocal` keyword tells Python that the name belongs to the enclosing function, so `count += 1` updates the remembered value.",
   "analogy": "A backpack packed at home: the hiker carries those supplies wherever they go, even far from the house. nonlocal is like being allowed to rewrite a note kept in the backpack, not just read it.",
   "code": [
    {
     "language": "python",
     "filename": "closures.py",
     "source": "def make_multiplier(factor: int):\n    def multiply(x: int) -> int:\n        return x * factor\n\n    return multiply\n\n\ndouble = make_multiplier(2)\ntriple = make_multiplier(3)\nprint(double(5), triple(5))\n\n\ndef make_counter():\n    count = 0\n\n    def increment() -> int:\n        nonlocal count\n        count += 1\n        return count\n\n    return increment\n\n\nc = make_counter()\nc()\nc()\nprint(c())\n",
     "output": "10 15\n3",
     "explanation": "`double` remembers `factor = 2` and `triple` remembers `factor = 3`. In the counter, `nonlocal count` lets `increment` change the remembered `count`, so three calls give 1, 2, then 3 (only the last is printed)."
    }
   ],
   "productionNote": "Closures create configured callbacks and are the mechanism behind every decorator in the next sub-topic.",
   "commonMistakes": [
    "Forgetting `nonlocal` when reassigning an outer variable, which raises `UnboundLocalError` (Python's error for using a variable before it has a value).",
    "Creating closures in a loop and expecting each to capture a different loop value; they all see the variable's final value unless you capture the current value (for example by passing it as a default argument)."
   ],
   "sources": [
    {
     "title": "Python reference: Naming and binding",
     "url": "https://docs.python.org/3/reference/executionmodel.html#naming-and-binding"
    },
    {
     "title": "Python reference: nonlocal",
     "url": "https://docs.python.org/3/reference/simple_stmts.html#the-nonlocal-statement"
    }
   ]
  },
  {
   "id": "writing-decorators",
   "title": "Writing decorators",
   "explanation": "A decorator is a function that takes a function and returns a new function that adds behaviour around the original. Writing `@log_calls` on the line above `def add` is shorthand for `add = log_calls(add)` after the definition.\n\nInside, the decorator defines a `wrapper` function (a closure over `func`). Use `*args, **kwargs` so the wrapper accepts any arguments and forwards them to the original. Then return the result, and return `wrapper` itself from the decorator.\n\nTo give a decorator its own settings, such as `@repeat(2)`, add one more outer layer: `repeat(2)` returns the real decorator, which is then applied to the function. So you have three levels: a factory (a function that builds and returns the real decorator), the decorator, and the wrapper.",
   "analogy": "Gift wrapping: the gift inside is unchanged, but the wrapping adds something around it. Choosing a ribbon before wrapping, like @repeat(2), is the factory step: you pick the settings first, then wrap.",
   "code": [
    {
     "language": "python",
     "filename": "decorators.py",
     "source": "def log_calls(func):\n    def wrapper(*args, **kwargs):\n        print(f\"calling {func.__name__}{args}\")\n        result = func(*args, **kwargs)\n        print(f\"{func.__name__} returned {result}\")\n        return result\n\n    return wrapper\n\n\n@log_calls\ndef add(a: int, b: int) -> int:\n    return a + b\n\n\nadd(2, 3)\n\n\ndef repeat(times: int):\n    def decorator(func):\n        def wrapper(*args, **kwargs):\n            for _ in range(times):\n                func(*args, **kwargs)\n\n        return wrapper\n\n    return decorator\n\n\n@repeat(2)\ndef hello() -> None:\n    print(\"hello\")\n\n\nhello()\n",
     "output": "calling add(2, 3)\nadd returned 5\nhello\nhello",
     "explanation": "`log_calls` prints before and after the real call. `args` is a tuple, so `add(2, 3)` appears in the message. `repeat(2)` is called first and returns `decorator`, which then wraps `hello` so it runs twice."
    }
   ],
   "productionNote": "Decorators are used for logging, retries, caching, authentication checks, and web framework routes such as `@app.get(\"/\")` (you will meet these properly in topic 28).",
   "commonMistakes": [
    "Forgetting `return wrapper`, which turns the decorated name into `None`, or forgetting to return the original result inside the wrapper.",
    "Writing `@log_calls()` for a decorator that takes no arguments; that calls it with nothing and fails."
   ],
   "sources": [
    {
     "title": "Python glossary: decorator",
     "url": "https://docs.python.org/3/glossary.html#term-decorator"
    },
    {
     "title": "PEP 318: Decorators",
     "url": "https://peps.python.org/pep-0318/"
    }
   ]
  },
  {
   "id": "functools-wraps",
   "title": "functools.wraps",
   "explanation": "After decoration, the name `greet` points at `wrapper`, so `greet.__name__` says `wrapper` and the docstring (the text in triple quotes describing the function) is lost. This confuses debuggers, error messages, documentation tools, and frameworks that look at function names.\n\n`functools.wraps(func)` is a decorator you place on the inner wrapper. It copies the original's name, docstring, and other metadata onto the wrapper.\n\nMake it a habit: every decorator you write should apply `@wraps(func)` to its wrapper.",
   "analogy": "Keeping the original label visible on a wrapped gift so everyone still knows what is inside.",
   "code": [
    {
     "language": "python",
     "filename": "wraps_demo.py",
     "source": "from functools import wraps\n\n\ndef plain(func):\n    def wrapper(*args, **kwargs):\n        return func(*args, **kwargs)\n\n    return wrapper\n\n\ndef proper(func):\n    @wraps(func)\n    def wrapper(*args, **kwargs):\n        return func(*args, **kwargs)\n\n    return wrapper\n\n\ndef greet():\n    \"\"\"Say hi.\"\"\"\n\n\nplain_greet = plain(greet)\nproper_greet = proper(greet)\nprint(plain_greet.__name__, plain_greet.__doc__)\nprint(proper_greet.__name__, proper_greet.__doc__)\n",
     "output": "wrapper None\ngreet Say hi.",
     "explanation": "`plain_greet` is the unlabelled wrapper, so it reports `wrapper` and no docstring. `proper_greet` used `@wraps(func)`, so it keeps `greet` and `Say hi.`. Calling `plain(greet)` by hand is exactly what `@plain` does."
    }
   ],
   "productionNote": "Standard in every production decorator; tools such as web frameworks and test runners rely on correct function names.",
   "commonMistakes": [
    "Applying `@wraps` to the outer decorator function instead of the inner `wrapper`.",
    "Forgetting to pass the function: it must be `@wraps(func)`, not `@wraps`."
   ],
   "sources": [
    {
     "title": "Python docs: functools.wraps",
     "url": "https://docs.python.org/3/library/functools.html#functools.wraps"
    }
   ]
  },
  {
   "id": "context-managers-contextlib",
   "title": "Context managers with contextlib",
   "explanation": "A context manager is an object that sets something up before a `with` block and tears it down afterwards, even if an error happens inside the block. Files are the classic example: `with open(...)` closes the file for you.\n\nThe easy way to make your own is `@contextlib.contextmanager` on a generator function (from the previous topic). Code before `yield` is setup, the `with` body runs at the `yield`, and code after it is cleanup. Wrap the `yield` in `try/finally` so cleanup runs even when the body raises an error. The generator must yield exactly once.\n\n`contextlib.suppress(SomeError)` is a ready-made context manager that quietly ignores that specific error type inside its block, then carries on after it.",
   "analogy": "A hotel key card: activated at check-in and automatically deactivated at check-out, whatever happens during the stay.",
   "code": [
    {
     "language": "python",
     "filename": "ctx.py",
     "source": "from contextlib import contextmanager, suppress\n\n\n@contextmanager\ndef section(name: str):\n    print(f\"<{name}>\")\n    try:\n        yield\n    finally:\n        print(f\"</{name}>\")\n\n\nwith section(\"report\"):\n    print(\"body\")\n\nwith suppress(KeyError):\n    {}[\"missing\"]\n\nprint(\"still running\")\n",
     "output": "<report>\nbody\n</report>\nstill running",
     "explanation": "`section` prints an opening tag, yields to the body, and always prints the closing tag. The `KeyError` from `{}[\"missing\"]` is swallowed by `suppress`, so the final print still runs."
    }
   ],
   "productionNote": "Used for temporary settings, timing blocks, and opening and closing temporary resources.",
   "commonMistakes": [
    "Leaving out `try/finally`, so cleanup is skipped when the body raises an error.",
    "Yielding more than once in a `@contextmanager` generator, which raises an error."
   ],
   "sources": [
    {
     "title": "Python docs: contextlib",
     "url": "https://docs.python.org/3/library/contextlib.html"
    }
   ]
  }
 ],
 "quiz": [
  {
   "question": "`@log_calls` placed above `def f` is shorthand for what?",
   "options": [
    "f = log_calls",
    "log_calls = f(log_calls)",
    "f = log_calls(f)",
    "f = f(log_calls)"
   ],
   "answerIndex": 2,
   "explanation": "The decorator is called with the function and its return value replaces the name: f = log_calls(f)."
  },
  {
   "question": "What problem does functools.wraps solve?",
   "options": [
    "It makes the wrapper run noticeably faster than before",
    "It lets decorators accept their own extra arguments",
    "It stops the wrapped function from ever raising errors",
    "It copies the original function's name and docstring onto the wrapper"
   ],
   "answerIndex": 3,
   "explanation": "Without wraps, the decorated function reports the wrapper's name and loses its docstring."
  },
  {
   "question": "Which keyword lets an inner function reassign a variable of its enclosing function?",
   "options": [
    "nonlocal",
    "global",
    "static",
    "outer"
   ],
   "answerIndex": 0,
   "explanation": "nonlocal marks the name as belonging to the enclosing function so assignment updates it instead of creating a local."
  },
  {
   "question": "In a @contextmanager generator, where should cleanup code go?",
   "options": [
    "Before the yield, at the very top of the function",
    "After the yield, inside a finally block",
    "In a separate cleanup() method on the generator",
    "Inside the body of the with statement itself"
   ],
   "answerIndex": 1,
   "explanation": "Code after yield runs on exit; putting it in finally makes it run even if the body raises an error."
  },
  {
   "question": "What does `apply(shout, \"hi\")` pass to apply?",
   "options": [
    "The result of shout()",
    "The function shout itself",
    "The text \"shout\"",
    "A decorator"
   ],
   "answerIndex": 1,
   "explanation": "With no parentheses, `shout` is the function object, so apply receives the function and can call it later."
  },
  {
   "question": "What does a closure remember?",
   "options": [
    "Only the name of the function",
    "All global variables and nothing else",
    "Variables from the enclosing function",
    "Nothing once the outer function returns"
   ],
   "answerIndex": 2,
   "explanation": "A closure keeps the enclosing function's variables alive, such as `factor` in `make_multiplier`, even after the outer function has returned."
  },
  {
   "question": "What does `with suppress(KeyError):` do?",
   "options": [
    "Quietly ignores KeyError inside the block",
    "Stops the whole program when a KeyError happens",
    "Turns the KeyError into a warning in a list",
    "Deletes the dictionary used inside the block"
   ],
   "answerIndex": 0,
   "explanation": "`suppress` swallows the named error type raised in its block, and the program carries on after the block."
  },
  {
   "question": "What is `repeat(2)` in `@repeat(2)`?",
   "options": [
    "The decorator itself, applied directly to the function",
    "The wrapper that runs the function twice in a row",
    "A syntax error, because decorators cannot take arguments",
    "A factory call that returns the decorator"
   ],
   "answerIndex": 3,
   "explanation": "`repeat(2)` runs first and returns the real decorator, which is then applied to the function below it."
  }
 ]
});
