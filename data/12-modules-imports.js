window.TOPICS = window.TOPICS || [];
window.TOPICS.push({
 "id": "12-modules-imports",
 "order": 12,
 "title": "Modules & Imports",
 "version": "Python 3.15.2 + uv 0.13.7",
 "summary": "Learn how to reuse code with modules: import from the standard library, split your own code into files, and group files into packages. You will also learn the `if __name__ == \"__main__\":` guard and get a tour of the batteries Python ships with.",
 "prerequisites": [
  "11-error-handling"
 ],
 "subtopics": [
  {
   "id": "import-and-from-import",
   "title": "import and from-import",
   "explanation": "A **module** is simply a `.py` file that holds reusable code (functions, constants and so on). Python comes with hundreds of ready-made modules, and you can bring one into your program with the `import` statement. After `import math`, you reach things inside it with a dot: `math.sqrt(16)`.\n\nIf you only need one or two names, use `from math import sqrt`. Now you can write `sqrt(16)` without the `math.` prefix. You can also give a module a shorter nickname (an **alias**) with `as`, for example `import json as js`. Aliases are handy for long names, but only use them when they are a well-known convention or genuinely save typing.\n\nPut all imports at the top of the file, one per line. This way anyone reading the file sees at a glance what it depends on. Avoid `from x import *`: it dumps every public name from `x` into your file, so you can no longer tell where a name came from and it may silently overwrite your own names.",
   "analogy": "Borrowing a specific book from the library (from-import) versus borrowing the whole shelf and saying \"shelf, page 3\" (import). The shelf is clear about where the book came from; the single book is shorter to refer to.",
   "code": [
    {
     "language": "python",
     "filename": "imports.py",
     "source": "import math\nfrom statistics import mean\nimport json as js\n\nprint(math.sqrt(16))\nprint(mean([2, 4, 6]))\nprint(js.dumps({\"ok\": True}))\n",
     "output": "4.0\n4\n{\"ok\": true}",
     "explanation": "`math.sqrt` always returns a float, so you get `4.0`. `mean` of whole numbers that divide evenly gives the int `4`. `json.dumps` turns a Python dict into JSON text (a common plain-text data format), where Python's `True` becomes `true`."
    }
   ],
   "productionNote": "Clear, explicit imports at the top of a file let tools (linters, which check code for mistakes; IDEs, which are code editors; and dependency checkers) detect unused code and missing dependencies. Keep them tidy and avoid wildcard imports.",
   "commonMistakes": [
    "Naming your own file `math.py` or `json.py`. Python finds your file first and it shadows (hides) the standard module, causing confusing errors.",
    "Using `from module import *`, which pollutes your file with unknown names and hides where things come from.",
    "Putting imports in the middle of a file so readers cannot see the dependencies up front."
   ],
   "sources": [
    {
     "title": "Python tutorial: Modules",
     "url": "https://docs.python.org/3/tutorial/modules.html"
    },
    {
     "title": "Python reference: The import statement",
     "url": "https://docs.python.org/3/reference/simple_stmts.html#the-import-statement"
    }
   ]
  },
  {
   "id": "writing-your-own-module",
   "title": "Writing your own module",
   "explanation": "Any `.py` file can be imported by other files in the same folder. You use its file name without the `.py`. So `pricing.py` becomes `import pricing` or `from pricing import with_tax`. This lets you split a growing program into small files, each with one job.\n\nThe code in a module runs once, the first time it is imported. Python then remembers the result, so importing the same module again in another file does not run it again.\n\nPython looks for your module in the folder of the script you run, so keep both files in one folder, open a terminal in that folder (use `cd` to move into it, as in topic 1), and run the main script with `uv run shop.py`. If the files are apart, or the module is not on Python's search path, the import fails with `ModuleNotFoundError` (Python's error for a module it cannot find).",
   "analogy": "Writing your own recipe card and filing it so other recipes can say \"see card: sauce\". The sauce is written once and reused everywhere.",
   "code": [
    {
     "language": "python",
     "filename": "pricing.py",
     "source": "TAX = 0.18\n\n\ndef with_tax(amount: float) -> float:\n    return round(amount * (1 + TAX), 2)\n",
     "output": "",
     "explanation": "This module only defines a constant and a function. Nothing is printed, so running it by itself shows nothing."
    },
    {
     "language": "python",
     "filename": "shop.py",
     "source": "from pricing import with_tax\n\nprint(with_tax(100))\n",
     "output": "118.0",
     "explanation": "Both files sit in the same folder. Run it with `uv run shop.py`. 100 plus 18 percent tax is 118.0 (a float, because `round` on a float returns a float)."
    }
   ],
   "productionNote": "Real codebases are split into modules by responsibility, such as db, api and models. Small focused modules are easier to test and understand.",
   "commonMistakes": [
    "Circular imports: module a imports b while b imports a. Fix by moving shared code to a third module.",
    "Running the script from a setup where the module cannot be found, so the import fails.",
    "Doing slow or risky work at the top level of a module, since it runs the moment anyone imports it."
   ],
   "sources": [
    {
     "title": "Python tutorial: More on modules",
     "url": "https://docs.python.org/3/tutorial/modules.html#more-on-modules"
    }
   ]
  },
  {
   "id": "if-name-main",
   "title": "if __name__ == \"__main__\"",
   "explanation": "Every module has a built-in variable called `__name__`. When you run a file directly, Python sets `__name__` to the string `\"__main__\"`. When the same file is imported by another file, `__name__` is set to the module's name instead (for example `\"tool\"`).\n\nThis lets one file be both a reusable module and a runnable script. Wrap the script-only part in `if __name__ == \"__main__\":` and it runs only when you launch the file directly, never on import. The common pattern is to put the work in a function called `main()` and call it under the guard.\n\nThe guard matters most for code with side effects (actions beyond returning a value, such as saving files or starting servers): you do not want those to fire just because someone imported your file to reuse one function.",
   "analogy": "A demo button on a kitchen gadget: pressed when you test the gadget alone, but ignored once it is built into a bigger appliance.",
   "code": [
    {
     "language": "python",
     "filename": "tool.py",
     "source": "def main() -> None:\n    print(\"running as script\")\n\n\nprint(f\"module name: {__name__}\")\n\nif __name__ == \"__main__\":\n    main()\n",
     "output": "module name: __main__\nrunning as script",
     "explanation": "Run directly with `uv run tool.py`, `__name__` is `\"__main__\"` so both lines print. If another file did `import tool`, only `module name: tool` would print and `main()` would not run."
    }
   ],
   "productionNote": "Every CLI (command-line program, one you run by typing commands) or script entry file uses a `main()` function plus this guard. It also makes the code easy to test, because tests can import `main` without launching it.",
   "commonMistakes": [
    "Leaving top-level code with side effects (such as connecting to a database) so it runs on import.",
    "Misspelling `\"__main__\"` (it needs double underscores on both sides), so the guard never matches.",
    "Forgetting the guard in a file that other files import."
   ],
   "sources": [
    {
     "title": "Python docs: __main__",
     "url": "https://docs.python.org/3/library/__main__.html"
    }
   ]
  },
  {
   "id": "packages-and-init",
   "title": "Packages and __init__.py",
   "explanation": "When you have many modules, group them in a folder. A folder that contains an `__init__.py` file is a **package**. The `__init__.py` file can be empty; its presence tells Python the folder is a package. You import with dots: `from shop.pricing import with_tax` means \"package shop, module pricing, name with_tax\".\n\nInside a package, modules can refer to their neighbours with a **relative import**: `from .pricing import with_tax`. The single dot means \"the current package\". Relative imports keep working even if you rename the package. (A `src/` folder is a common layout for real projects; it is covered later, in the packaging topic.)\n\n`__init__.py` can also define the package's public API, for instance by importing the key names so users can write `from shop import with_tax`. Keep it light: code in `__init__.py` runs as soon as anything first imports the package.",
   "analogy": "A filing cabinet (the package) with labelled drawers (the modules). You ask for \"cabinet shop, drawer pricing\".",
   "code": [
    {
     "language": "text",
     "filename": "layout",
     "source": "main.py\nshop/\n    __init__.py\n    pricing.py",
     "output": "",
     "explanation": "`shop` is the package. `pricing.py` is the same code as before. `__init__.py` is empty. `main.py` sits next to the `shop` folder."
    },
    {
     "language": "python",
     "filename": "main.py",
     "source": "from shop.pricing import with_tax\n\nprint(with_tax(50))\n",
     "output": "59.0",
     "explanation": "Run with `uv run main.py` from the folder that contains `shop`. 50 plus 18 percent tax is 59.0."
    }
   ],
   "productionNote": "Every non-trivial project is a package, and `__init__.py` is where you decide what the public API looks like. Run modules inside a package with `uv run python -m shop.pricing` (-m tells Python to run the module by its package path) rather than `uv run shop/pricing.py`.",
   "commonMistakes": [
    "Running a module inside a package directly (`python shop/pricing.py`), which breaks relative imports. Use `python -m shop.pricing` instead.",
    "Putting heavy code in `__init__.py`, which slows down importing the package.",
    "Forgetting to run from the folder that contains the package, so the import cannot be found."
   ],
   "sources": [
    {
     "title": "Python tutorial: Packages",
     "url": "https://docs.python.org/3/tutorial/modules.html#packages"
    }
   ]
  },
  {
   "id": "standard-library-tour",
   "title": "Standard library tour",
   "explanation": "Python's standard library is a large set of modules that ship with Python itself, often called \"batteries included\". You can import them with no installation. Useful ones include `math`, `random`, `datetime`, `pathlib` (file paths), `json`, `csv` (comma-separated tables), `collections`, `itertools`, `functools`, `logging`, `argparse` (command-line options), `re` (text patterns), `os`, `sys`, `subprocess` and `unittest`.\n\nThe habit to build: before adding a third-party package, check whether the standard library already does the job. Searching the library index in the Python docs is quick.\n\nThe example below uses three small modules: `sys` to check the Python version, `re` to find all runs of digits in a string, and `textwrap` to shorten a long sentence.",
   "analogy": "A furnished flat: check the cupboards before buying new plates.",
   "code": [
    {
     "language": "python",
     "filename": "stdlib_tour.py",
     "source": "import re\nimport sys\nimport textwrap\n\nprint(sys.version_info >= (3, 15))\nprint(re.findall(r\"\\d+\", \"order 12, item 7\"))\nprint(textwrap.shorten(\"Python makes everyday tasks simple\", width=20))\n",
     "output": "True\n['12', '7']\nPython makes [...]",
     "explanation": "`sys.version_info` compares with a tuple, so this prints `True` on Python 3.15 or newer. `\\d+` matches one or more digits, giving a list of strings. `shorten` cuts the text to fit 20 characters and adds `[...]`."
    }
   ],
   "productionNote": "Fewer third-party dependencies means fewer places a security bug can come from and less upgrade work. Standard-library code is also maintained alongside Python itself.",
   "commonMistakes": [
    "Installing a package for something the standard library already does.",
    "Re-implementing JSON or CSV parsing by hand instead of using `json` and `csv`.",
    "Naming your own file after a standard module (for example `random.py`), which shadows it."
   ],
   "sources": [
    {
     "title": "Python docs: The Python Standard Library",
     "url": "https://docs.python.org/3/library/index.html"
    },
    {
     "title": "Python tutorial: Brief tour of the standard library",
     "url": "https://docs.python.org/3/tutorial/stdlib.html"
    }
   ]
  }
 ],
 "quiz": [
   {
     "question": "What is the value of `__name__` when a file is run directly?",
     "options": [
       "\"__main__\"",
       "\"script\"",
       "The file name without .py",
       "None"
     ],
     "answerIndex": 0,
     "explanation": "Python sets `__name__` to the string \"__main__\" for the file being run directly. When imported, it is the module name instead."
   },
   {
     "question": "Why is a file named `json.py` in your project a problem?",
     "options": [
       "Python forbids file names with dots",
       "It makes the file run twice",
       "It shadows the standard json module",
       "It can only be run with uv"
     ],
     "answerIndex": 2,
     "explanation": "Python finds your local `json.py` before the standard library one, so `import json` loads your file and things break."
   },
   {
     "question": "What makes a folder a package you can import from?",
     "options": [
       "Its folder name ending in _pkg",
       "Containing at least ten module files",
       "Having a README file inside",
       "Having an __init__.py file inside"
     ],
     "answerIndex": 3,
     "explanation": "A folder containing an `__init__.py` file (it may be empty) is a package you can import from with dots."
   },
   {
     "question": "What is the difference between `import math` and `from math import sqrt`?",
     "options": [
       "The first one runs noticeably faster",
       "The first needs `math.sqrt`, the second lets you write `sqrt` directly",
       "The second imports every name in the math module",
       "There is no difference between the two"
     ],
     "answerIndex": 1,
     "explanation": "`import math` binds the module name so you write `math.sqrt`. `from math import sqrt` binds just `sqrt` into your file."
   },
   {
     "question": "Two files import pricing. Why does pricing.py's code run only once?",
     "options": [
       "Python remembers the module after the first import",
       "Python deletes the module from memory after each import finishes",
       "pricing.py must be run on its own with uv run before anything else",
       "Every import runs the code again from the top"
     ],
     "answerIndex": 0,
     "explanation": "The first import runs the module; later imports reuse the remembered result."
   },
   {
     "question": "Which standard library module reads and writes JSON?",
     "options": [
       "math",
       "json",
       "random",
       "os"
     ],
     "answerIndex": 1,
     "explanation": "json is in the standard library, so it needs no installation."
   }
 ]
});
