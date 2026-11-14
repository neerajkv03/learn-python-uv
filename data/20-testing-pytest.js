window.TOPICS = window.TOPICS || [];
window.TOPICS.push({
 "id": "20-testing-pytest",
 "order": 20,
 "title": "Testing with pytest",
 "version": "Python 3.15.2 + uv 0.13.7",
 "summary": "Automated tests are small programs that check your code for you. In this topic you add pytest with uv, write tests with plain assert, share setup with fixtures (reusable preparation code), cover many inputs with parametrize (one test run per row of data), check error paths with pytest.raises, and run everything with uv run pytest.",
 "prerequisites": [
  "19-stdlib-essentials"
 ],
 "subtopics": [
  {
   "id": "adding-pytest-uv-add-dev",
   "title": "Adding pytest with uv add --dev",
   "explanation": "A test is code that checks other code automatically. Instead of running your program by hand and eyeballing the result, you write a small function that calls your code and states what the answer must be. You can re-run it in seconds after every change, so you notice breakage immediately.\n\npytest is the most widely used Python test runner (a test runner is a tool that finds your tests, runs them, and reports which passed or failed). It is a third-party package, meaning it is not part of Python itself and must be installed.\n\nTests are only needed while developing, so you install pytest as a development dependency (a package needed to work on the project but not to run it): `uv add --dev pytest`. uv records it in the dev group of pyproject.toml, so users who install your app do not get pytest.\n\nA common layout keeps your code in the project root or in `src/`, and tests in a `tests/` folder. pytest only discovers files named `test_*.py` (or `*_test.py`), so naming matters.",
   "analogy": "A car's pre-delivery inspection checklist: every car runs through the same checks before leaving the factory, so problems are caught before the customer sees them.",
   "code": [
    {
     "language": "bash",
     "filename": "terminal",
     "source": "uv add --dev pytest",
     "output": "",
     "explanation": "Adds pytest to the dev dependency group in pyproject.toml and installs it into the project environment. uv prints resolution and install messages that vary by version."
    },
    {
     "language": "text",
     "filename": "layout",
     "source": "my-project/\n  pyproject.toml\n  calc.py\n  tests/\n    test_calc.py",
     "output": "",
     "explanation": "Code lives in calc.py; tests live in tests/test_calc.py. The test_ prefix on the file name is what lets pytest discover it."
    }
   ],
   "productionNote": "Tests run on every commit in CI (continuous integration, a server that automatically checks each change). Untested code rarely passes code review, and a good suite lets you refactor without fear.",
   "commonMistakes": [
    "Adding pytest as a runtime dependency with plain `uv add pytest`, which ships it to production users; use `--dev`.",
    "Naming test files something like `calc_tests.py` or `check_calc.py`, so pytest silently never finds them; use `test_*.py`."
   ],
   "sources": [
    {
     "title": "pytest docs: Getting started",
     "url": "https://docs.pytest.org/en/stable/getting-started.html"
    },
    {
     "title": "uv docs: Development dependencies",
     "url": "https://docs.astral.sh/uv/concepts/projects/dependencies/#development-dependencies"
    }
   ]
  },
  {
   "id": "writing-tests-with-assert",
   "title": "Writing tests with assert",
   "explanation": "A test is an ordinary function whose name starts with `test_`. Inside, you call your code and use `assert`, a Python statement that does nothing when its condition is true and raises an error when it is false. pytest treats a test as passed if the function finishes without error, and failed if an assertion (or any other error) happens.\n\nYou do not need special methods like assertEqual. pytest rewrites your plain assert statements so that on failure it shows the actual values on both sides, for example `assert 4 == 5`. That makes failures easy to read.\n\nKeep each test focused on one behaviour and name it after that behaviour, such as `test_is_even_false_for_odd`. When a small test fails, its name alone tells you what broke.",
   "analogy": "A tasting spoon: you check one thing at a time, so when something is off you know exactly which ingredient is wrong.",
   "code": [
    {
     "language": "python",
     "filename": "calc.py",
     "source": "def add(a: int, b: int) -> int:\n    return a + b\n\n\ndef is_even(n: int) -> bool:\n    return n % 2 == 0",
     "output": "",
     "explanation": "The code under test: two small pure functions (they only use their inputs and return a value). Nothing runs when the file is imported."
    },
    {
     "language": "python",
     "filename": "tests/test_calc.py",
     "source": "from calc import add, is_even\n\n\ndef test_add() -> None:\n    assert add(2, 3) == 5\n\n\ndef test_is_even_true_for_even() -> None:\n    assert is_even(4)\n\n\ndef test_is_even_false_for_odd() -> None:\n    assert not is_even(7)",
     "output": "",
     "explanation": "Each function starts with test_ and uses plain assert. Running the file directly prints nothing; pytest is what collects and runs these functions. For `from calc import ...` to work from the tests folder, the project root must be importable; adding this to `pyproject.toml` (the project's main config file) is one simple way:\n\n[tool.pytest.ini_options]\npythonpath = [\".\"]\n\nThe `[tool.pytest.ini_options]` heading is the section where pytest reads its settings, and `pythonpath` lists extra folders to make importable."
    }
   ],
   "productionNote": "Unit tests (tests of one small piece of logic) for business rules make up most of a real suite. They are fast, so developers run them constantly.",
   "commonMistakes": [
    "Writing tests that depend on each other's order, so one failing test causes a chain of confusing failures; each test must stand alone.",
    "Asserting on printed output instead of returned values, which makes tests fragile; return data from functions and assert on that."
   ],
   "sources": [
    {
     "title": "pytest docs: Assertions",
     "url": "https://docs.pytest.org/en/stable/how-to/assert.html"
    }
   ]
  },
  {
   "id": "fixtures",
   "title": "Fixtures",
   "explanation": "Many tests need the same preparation: a sample list, a database connection, a temporary file. A fixture is a function marked with `@pytest.fixture` that prepares such a thing. A test asks for it simply by naming it as a parameter, and pytest calls the fixture and passes in the result. This is called dependency injection (the framework hands the test what it needs).\n\nA fixture that uses `yield` instead of `return` can also clean up: code before `yield` is setup, the yielded value goes to the test, and code after `yield` runs once the test is done, even if it failed.\n\npytest also ships built-in fixtures. `tmp_path` gives each test a fresh, empty temporary folder (a `pathlib.Path`) so tests can create files without touching your real files.\n\nEach test gets its own fresh fixture value by default, so tests do not leak state into each other.",
   "analogy": "A stage crew sets up the set before each scene and clears it away afterwards, so every scene starts from a clean stage.",
   "code": [
    {
     "language": "python",
     "filename": "tests/test_fixtures.py",
     "source": "from pathlib import Path\n\nimport pytest\n\n\n@pytest.fixture\ndef cart() -> list[str]:\n    return [\"pen\"]\n\n\ndef test_cart_starts_with_pen(cart: list[str]) -> None:\n    assert cart == [\"pen\"]\n\n\ndef test_cart_is_fresh_each_time(cart: list[str]) -> None:\n    cart.append(\"book\")\n    assert cart == [\"pen\", \"book\"]\n\n\ndef test_write_file(tmp_path: Path) -> None:\n    p = tmp_path / \"out.txt\"\n    p.write_text(\"hi\", encoding=\"utf-8\")\n    assert p.read_text(encoding=\"utf-8\") == \"hi\"",
     "output": "",
     "explanation": "cart is built fresh for every test that names it, so appending \"book\" in one test does not affect the other. tmp_path is provided by pytest with no definition needed. Under pytest all three pass and the code itself prints nothing."
    }
   ],
   "productionNote": "Database sessions, API test clients and sample data are typically fixtures. Fixtures shared by many files go in a file named `conftest.py`, which pytest loads automatically.",
   "commonMistakes": [
    "Calling a fixture directly like a normal function (`cart()`); instead, add it as a test parameter and let pytest provide it.",
    "Sharing mutable state between tests through module-level globals, which makes results depend on test order; use a fixture that builds fresh data."
   ],
   "sources": [
    {
     "title": "pytest docs: Fixtures",
     "url": "https://docs.pytest.org/en/stable/how-to/fixtures.html"
    },
    {
     "title": "pytest docs: tmp_path",
     "url": "https://docs.pytest.org/en/stable/how-to/tmp_path.html"
    }
   ]
  },
  {
   "id": "parametrize",
   "title": "Parametrize",
   "explanation": "Often you want to run the same check with many inputs. Copy-pasting a test for each input is noisy. `@pytest.mark.parametrize` (a decorator, which wraps a function to change its behaviour) runs one test function once per row of data.\n\nYou give it a string of parameter names and a list of tuples, one tuple per case. pytest calls the test once per tuple, filling in the arguments, and reports each case as a separate result. If one case fails, the others still run and you see exactly which input failed.\n\nThe names in the string must match the test function's argument names exactly.",
   "analogy": "One exam question checked against many students' answers using the same marking scheme.",
   "code": [
    {
     "language": "python",
     "filename": "tests/test_param.py",
     "source": "import pytest\n\n\ndef slugify(text: str) -> str:\n    return \"-\".join(text.lower().split())\n\n\n@pytest.mark.parametrize(\n    \"text, expected\",\n    [\n        (\"Hello World\", \"hello-world\"),\n        (\"  Python  uv \", \"python-uv\"),\n        (\"One\", \"one\"),\n    ],\n)\ndef test_slugify(text: str, expected: str) -> None:\n    assert slugify(text) == expected",
     "output": "",
     "explanation": "slugify lowercases text and joins its words with dashes (split() with no argument ignores extra spaces). pytest runs test_slugify three times, once per tuple, and reports three results."
    }
   ],
   "productionNote": "Parametrize is the cheap way to cover edge cases: empty input, boundaries, unusual characters. Adding a case is one new line.",
   "commonMistakes": [
    "Parameter names in the string that do not match the function's argument names, which makes pytest raise an error at collection time.",
    "Forgetting that the second argument is a list of tuples; a single flat list of values only works with one parameter name."
   ],
   "sources": [
    {
     "title": "pytest docs: Parametrize",
     "url": "https://docs.pytest.org/en/stable/how-to/parametrize.html"
    }
   ]
  },
  {
   "id": "testing-exceptions",
   "title": "Testing exceptions",
   "explanation": "Good code rejects bad input by raising an exception (an error signal that stops normal flow). You need tests for that too. `pytest.raises` is a context manager (used with `with`) that expects the code inside to raise a given exception.\n\nThe test passes only if that exception type is raised. If nothing is raised, or a different exception type is raised, the test fails. Add `match=\"text\"` to also check the error message: it is a regular expression searched in the message.\n\nBe specific about the exception type. Catching a broad `Exception` would also pass on unrelated bugs.",
   "analogy": "A fire drill: the test only passes if the alarm actually goes off.",
   "code": [
    {
     "language": "python",
     "filename": "tests/test_errors.py",
     "source": "import pytest\n\n\ndef withdraw(balance: float, amount: float) -> float:\n    if amount <= 0:\n        raise ValueError(\"amount must be positive\")\n    return balance - amount\n\n\ndef test_rejects_negative() -> None:\n    with pytest.raises(ValueError, match=\"positive\"):\n        withdraw(100, -5)",
     "output": "",
     "explanation": "withdraw(100, -5) raises ValueError with a message containing \"positive\", so the test passes. If withdraw stopped validating, no error would be raised and the test would fail."
    }
   ],
   "productionNote": "Validation and error paths are where bugs hide, and they are rarely exercised by hand. Testing them guards security and data-integrity rules.",
   "commonMistakes": [
    "Putting extra lines inside the `with` block, so an earlier line might raise the error for the wrong reason; keep only the one call that should raise.",
    "Using `pytest.raises(Exception)` instead of the specific type, which hides real bugs."
   ],
   "sources": [
    {
     "title": "pytest docs: Assertions about expected exceptions",
     "url": "https://docs.pytest.org/en/stable/how-to/assert.html#assertions-about-expected-exceptions"
    },
    {
     "title": "pytest docs: pytest.raises reference",
     "url": "https://docs.pytest.org/en/stable/reference/reference.html#pytest-raises"
    }
   ]
  },
  {
   "id": "running-tests-uv-run-pytest",
   "title": "Running tests with uv run pytest",
   "explanation": "`uv run pytest` runs pytest inside your project's environment, so it sees the right Python and the right installed packages. With no arguments it finds every test it can discover and runs them.\n\nUseful options: `-q` for quiet output, `-k name` to run only tests whose name contains `name`, `-x` to stop at the first failure, and `path::test_name` (for example `tests/test_calc.py::test_add`) to run one specific test.\n\nThe process exit code (a number a program returns to the terminal when it finishes) is 0 when all tests pass and non-zero otherwise. CI systems rely on that to mark a build green or red.\n\nYou can store more settings in the `[tool.pytest.ini_options]` section of pyproject.toml, such as `testpaths` to tell pytest where tests live. Add the new line under the heading you already created earlier in this topic; a heading must not appear twice in a TOML file.",
   "analogy": "Pressing one button to run the whole inspection line.",
   "code": [
    {
     "language": "bash",
     "filename": "terminal",
     "source": "uv run pytest -q",
     "output": "..........                                                 [100%]\n10 passed in 0.05s",
     "explanation": "Each dot is one passing test; F would mean failure. The four test files written in this topic hold 10 tests in total. The count and timing vary with your project and machine."
    },
    {
     "language": "toml",
     "filename": "pyproject.toml",
     "source": "[tool.pytest.ini_options]\npythonpath = [\".\"]\ntestpaths = [\"tests\"]",
     "output": "",
     "explanation": "The section now holds both settings: the `pythonpath` line from earlier and the new `testpaths` line, which tells pytest to look for tests only under tests/, so it does not scan the whole project."
    }
   ],
   "productionNote": "Use the same command locally and in CI, so a result on your laptop predicts the result on the server.",
   "commonMistakes": [
    "Running a globally installed `pytest` (wrong environment, missing packages) instead of `uv run pytest`.",
    "Ignoring or deleting failing tests instead of fixing the code or the test."
   ],
   "sources": [
    {
     "title": "pytest docs: Usage",
     "url": "https://docs.pytest.org/en/stable/how-to/usage.html"
    },
    {
     "title": "pytest docs: pyproject.toml configuration",
     "url": "https://docs.pytest.org/en/stable/reference/customize.html#pyproject-toml"
    }
   ]
  }
 ],
 "quiz": [
  {
   "question": "How must test files and functions be named for pytest to find them by default?",
   "options": [
    "Files named test_*.py and functions starting with test_",
    "Files ending with .test and functions starting with check_",
    "Any file inside a tests folder and any function name",
    "Files named pytest_*.py and functions ending with _test"
   ],
   "answerIndex": 0,
   "explanation": "By default pytest discovers files matching test_*.py (or *_test.py) and functions whose names start with test_."
  },
  {
   "question": "How does a test receive a fixture?",
   "options": [
    "By calling the fixture function inside the test body",
    "By naming it as a parameter of the test function",
    "By importing it at the top of the test file",
    "By using the global keyword inside the test"
   ],
   "answerIndex": 1,
   "explanation": "pytest injects fixtures by matching test parameter names to fixture names; calling a fixture directly is an error."
  },
  {
   "question": "What does pytest.raises(ValueError) check?",
   "options": [
    "That the code returns a ValueError object instead of a value",
    "That the code prints a ValueError message to the screen",
    "That the block raises ValueError, otherwise the test fails",
    "That the block never fails, whatever happens inside it"
   ],
   "answerIndex": 2,
   "explanation": "The test passes only when the with block raises the given exception type; no exception or a different one fails the test."
  },
  {
   "question": "Which command runs tests in the uv project environment?",
   "options": [
    "python test --all",
    "pytest --use-uv-env",
    "uv test --all",
    "uv run pytest"
   ],
   "answerIndex": 3,
   "explanation": "uv run pytest runs pytest inside the project's environment so it uses the right Python and dependencies."
  },
  {
   "question": "What does `@pytest.mark.parametrize(\"n, expected\", [(1, 2), (2, 4)])` do to a test?",
   "options": [
    "Runs it twice, once per row of values",
    "Runs it once with both rows at the same time",
    "Skips it unless n equals expected",
    "Turns it into a fixture"
   ],
   "answerIndex": 0,
   "explanation": "parametrize runs the same test once for each row of values, so here the test runs twice: first with n=1 and expected=2, then with n=2 and expected=4."
  },
  {
   "question": "Which command adds pytest as a development-only dependency?",
   "options": [
    "uv add pytest --prod",
    "uv add --dev pytest",
    "uv run pytest --install",
    "uv tool pytest"
   ],
   "answerIndex": 1,
   "explanation": "The --dev flag records pytest in the development group, so it is installed for testing but is not part of what your app needs to run."
  },
  {
   "question": "When does `assert total == 5` make a test fail?",
   "options": [
    "When total equals 5",
    "Always, assert is only for errors",
    "When total is not 5",
    "Only when run without pytest"
   ],
   "answerIndex": 2,
   "explanation": "assert checks that the condition is true; if total is anything other than 5 the condition is false, so the assert raises an error and pytest reports the test as failed."
  }
 ]
});
