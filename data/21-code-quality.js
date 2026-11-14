window.TOPICS = window.TOPICS || [];
window.TOPICS.push({
  "id": "21-code-quality",
  "order": 21,
  "title": "Code Quality Tooling",
  "version": "Python 3.15.2 + uv 0.13.7",
  "summary": "Learn to keep a project clean with automatic tools: Ruff to lint (check for likely mistakes) and format (fix the layout), and mypy to check types. You will also learn where each tool should be installed with uv and how to configure everything in one pyproject.toml file.",
  "prerequisites": [
    "20-testing-pytest"
  ],
  "subtopics": [
    {
      "id": "linting-with-ruff",
      "title": "Linting with Ruff",
      "explanation": "A linter is a program that reads your code without running it and points out likely bugs and style problems, such as an import you never use or a name that does not exist. Because it never runs the code, it is quick and safe to use on any file.\n\nRuff is a linter made by Astral, the same team that makes uv, and it is very fast. First add it to your project as a development tool with `uv add --dev ruff`. Then you run it with `uv run ruff check .` (the dot means \"this folder and everything inside it\"). Each finding shows the file, line, column, a rule code like F401, and a message.\n\nSome problems are safe for Ruff to repair itself. A finding marked `[*]` is fixable, and `uv run ruff check --fix .` applies those fixes for you. Review the changes afterwards, as you would any edit.\n\nIn a team, linting runs in CI (an automated server that checks every change) and often in pre-commit (an automatic check that runs before each commit, where a commit is one saved snapshot of your changes in git, the version-history tool). A pull request (a request to merge your changes into the shared code) must pass it before it can be merged.",
      "analogy": "A proof-reader marking errors in red before the book goes to print.",
      "code": [
        {
          "language": "python",
          "filename": "messy.py",
          "source": "import os\nimport sys\n\n\ndef total(items: list[int]) -> int:\n    return sum(items)\n\n\nsys.stdout.write(str(total([1, 2])) + \"\\n\")\n",
          "output": "3",
          "explanation": "The program works fine, but `os` is imported and never used. Python does not complain, yet a linter will."
        },
        {
          "language": "bash",
          "filename": "terminal",
          "source": "uv run ruff check --output-format concise messy.py",
          "output": "messy.py:1:8: F401 [*] `os` imported but unused\nFound 1 error.\n[*] 1 fixable with `--fix`.",
          "explanation": "Ruff reports rule F401 at line 1, column 8, and says it can fix it. `--output-format concise` prints one line per finding; without it, Ruff prints a longer view that shows the source line with the problem underlined. The exact wording varies between Ruff versions. Add `--fix` to remove the unused import automatically."
        }
      ],
      "productionNote": "Run `ruff check` in CI and in pre-commit so every pull request must pass. Start with a small set of rules and grow it over time.",
      "commonMistakes": [
        "Silencing a warning with `# noqa` (a comment telling Ruff to ignore that line) instead of fixing the real problem.",
        "Enabling every rule at once on an old codebase, which creates thousands of findings nobody will fix."
      ],
      "sources": [
        {
          "title": "Ruff docs: The Ruff Linter",
          "url": "https://docs.astral.sh/ruff/linter/"
        },
        {
          "title": "Ruff docs: Rules",
          "url": "https://docs.astral.sh/ruff/rules/"
        }
      ]
    },
    {
      "id": "formatting-with-ruff",
      "title": "Formatting with Ruff",
      "explanation": "A formatter rewrites the layout of your code (spacing, quote style, line breaks) into one consistent style. It never changes what the code does, only how it looks. That means code reviews can focus on logic instead of spaces.\n\nRuff includes a formatter. `uv run ruff format .` rewrites every Python file in place. In CI you do not want to change files, only to check them, so you run `uv run ruff format --check .`, which exits with an error if any file would be changed.\n\nLinting and formatting are different jobs. A linter finds likely mistakes; a formatter only makes the layout uniform.",
      "analogy": "A uniform: everyone looks the same, so you notice what actually matters.",
      "code": [
        {
          "language": "python",
          "filename": "before.py",
          "source": "x=[1,2 ,3]\ndef f( a: int ):return a*2\nprint(f(x[0]))\n",
          "output": "2",
          "explanation": "Valid Python, but the spacing is inconsistent and the function body is squeezed onto one line."
        },
        {
          "language": "python",
          "filename": "after.py",
          "source": "x = [1, 2, 3]\n\n\ndef f(a: int):\n    return a * 2\n\n\nprint(f(x[0]))\n",
          "output": "2",
          "explanation": "The same code after `ruff format`: spaces around `=` and after commas, the body on its own indented line, and two blank lines around the function. The behavior is identical."
        },
        {
          "language": "bash",
          "filename": "terminal",
          "source": "uv run ruff format .",
          "output": "",
          "explanation": "Rewrites files in place. Ruff prints a short summary such as how many files were reformatted; the wording varies by version. Use `uv run ruff format --check .` in CI."
        }
      ],
      "productionNote": "Formatting is automatic and non-negotiable on most teams: run it before committing and check it in CI.",
      "commonMistakes": [
        "Using two formatters (for example Black, another code formatter, and Ruff) with different settings, so they keep undoing each other.",
        "Arguing about style by hand in reviews instead of letting the formatter decide."
      ],
      "sources": [
        {
          "title": "Ruff docs: The Ruff Formatter",
          "url": "https://docs.astral.sh/ruff/formatter/"
        }
      ]
    },
    {
      "id": "type-checking-in-a-project",
      "title": "Type checking in a project",
      "explanation": "A type checker reads your type hints (like `a: int`) and warns when code passes the wrong kind of value, again without running the program. mypy is a widely used type checker.\n\nIn a project, add the checker as a dev dependency (a package needed only while developing, not by users of your program): `uv add --dev mypy`. Then run it with `uv run mypy .` or `uv run mypy src/`. Because the version is recorded in `uv.lock`, everyone on the team and CI use the same one.\n\nYou do not have to be strict on day one. You can start with the defaults and tighten gradually, eventually turning on `strict = true` in the config (config is covered in the last section of this topic).",
      "analogy": "Every inspector on the team uses the same edition of the rulebook.",
      "code": [
        {
          "language": "bash",
          "filename": "terminal",
          "source": "uv add --dev mypy ruff\nuv run mypy .",
          "output": "Success: no issues found in 3 source files",
          "explanation": "The first command adds both tools to the dev dependencies. The second checks the project. The file count in the message depends on your project, and uv also prints its own install messages."
        }
      ],
      "productionNote": "A typical CI job runs, in order: `uv run ruff check`, `uv run ruff format --check`, `uv run mypy`, `uv run pytest`.",
      "commonMistakes": [
        "Running a globally installed checker whose version differs from the one in CI.",
        "Turning on strict mode on day one for a large legacy codebase and drowning in errors."
      ],
      "sources": [
        {
          "title": "mypy docs: Getting started",
          "url": "https://mypy.readthedocs.io/en/stable/getting_started.html"
        },
        {
          "title": "mypy docs: Using mypy with an existing codebase",
          "url": "https://mypy.readthedocs.io/en/stable/existing_code.html"
        }
      ]
    },
    {
      "id": "uvx-vs-uv-tool-install",
      "title": "uvx vs uv tool install",
      "explanation": "uv gives you three ways to get a command-line tool such as Ruff. `uvx ruff check` (short for `uv tool run`) runs the tool in a temporary, cached environment. Nothing stays installed on your PATH (the list of folders your terminal searches for commands), so it is ideal for a one-off try.\n\n`uv tool install ruff` installs the tool permanently so you can type `ruff` anywhere. It lives in its own isolated environment, separate from your projects. Use `uv tool list` to see installed tools and `uv tool upgrade ruff` to update one.\n\nThe third way is a project dev dependency, which pins (locks to one exact version) the version in `uv.lock` for the whole team. The rule of thumb: project checks use a dev dependency, personal utilities use `uv tool install`, and try-once use `uvx`.\n\nNote that tools run by `uvx` or installed with `uv tool install` do not see your project's installed packages. Tools that need them, like mypy and pytest, should run with `uv run`.",
      "analogy": "Renting a tool for a day (uvx), buying one for your own garage (tool install), or the company-issued kit everyone shares (dev dependency).",
      "code": [
        {
          "language": "bash",
          "filename": "terminal",
          "source": "uvx ruff --version\nuv tool install ruff\nuv tool list\nuv tool upgrade ruff",
          "output": "",
          "explanation": "Run one at a time. Each prints something (a version, a list of tools, install messages) that varies by version and machine."
        }
      ],
      "productionNote": "CI should use project dev dependencies, pinned in `uv.lock`, so results are reproducible.",
      "commonMistakes": [
        "Expecting a `uvx` tool to see the project's installed packages; use `uv run` for that.",
        "Using different Ruff versions locally and in CI, which gives different results."
      ],
      "sources": [
        {
          "title": "uv docs: Using tools",
          "url": "https://docs.astral.sh/uv/guides/tools/"
        },
        {
          "title": "uv docs: Tools concepts",
          "url": "https://docs.astral.sh/uv/concepts/tools/"
        }
      ]
    },
    {
      "id": "configuring-tools-in-pyproject",
      "title": "Configuring tools in pyproject.toml",
      "explanation": "Each tool has settings, and `pyproject.toml` (the project's main config file) can hold all of them. Each tool gets its own section named `[tool.<name>]`.\n\nFor Ruff, `[tool.ruff]` holds general options like `line-length` and `target-version`, and `[tool.ruff.lint]` holds `select`, the list of rule groups to enable (E and F are core style and error rules, I is import sorting, B is likely-bug checks, UP suggests modern syntax). For mypy use `[tool.mypy]`, and for pytest use `[tool.pytest.ini_options]`.\n\nKeeping everything in one file means one source of truth that is reviewed and versioned like code.",
      "analogy": "One house rulebook pinned on the fridge instead of notes scattered across rooms.",
      "code": [
        {
          "language": "toml",
          "filename": "pyproject.toml",
          "source": "[tool.ruff]\nline-length = 100\n\n[tool.ruff.lint]\nselect = [\"E\", \"F\", \"I\", \"B\", \"UP\"]\n\n[tool.mypy]\nstrict = true\n\n[tool.pytest.ini_options]\ntestpaths = [\"tests\"]\n",
          "output": "",
          "explanation": "Ruff allows lines up to 100 characters and checks five rule groups. mypy runs in strict mode, and pytest looks for tests only in the `tests` folder. This is a config file, so it prints nothing."
        }
      ],
      "productionNote": "Treat shared tool config as code: review changes to it in pull requests.",
      "commonMistakes": [
        "Keeping config in several files (`setup.cfg`, `.flake8`, `pyproject.toml`) that conflict.",
        "Setting a Ruff `target-version` (the Python version Ruff assumes your code runs on) that does not match the project's `requires-python`."
      ],
      "sources": [
        {
          "title": "Ruff docs: Configuring Ruff",
          "url": "https://docs.astral.sh/ruff/configuration/"
        },
        {
          "title": "mypy docs: The mypy configuration file",
          "url": "https://mypy.readthedocs.io/en/stable/config_file.html"
        }
      ]
    }
  ],
  "quiz": [
    {
      "question": "What is the difference between a linter and a formatter?",
      "options": [
        "A linter finds likely bugs and style problems; a formatter rewrites layout into one consistent style",
        "A linter rewrites layout; a formatter finds bugs",
        "They are the same tool with two names",
        "A linter runs your code; a formatter only reads it"
      ],
      "answerIndex": 0,
      "explanation": "Linting flags problems such as unused imports, while formatting only changes spacing, quotes and line breaks without changing behavior."
    },
    {
      "question": "What does `ruff format --check` do in CI?",
      "options": [
        "Rewrites every file in place so the layout matches the configured style rules",
        "Runs the type checker",
        "Fixes lint errors automatically",
        "Fails if any file would be changed by formatting, without changing files"
      ],
      "answerIndex": 3,
      "explanation": "`--check` only reports whether files need formatting and exits with an error if they do, so CI blocks unformatted code."
    },
    {
      "question": "When is `uvx` the right choice?",
      "options": [
        "For the checks every teammate and CI must run with a pinned version",
        "For a one-off run of a tool in a temporary cached environment",
        "For a tool that must see the project's installed packages",
        "For installing a tool permanently on your PATH"
      ],
      "answerIndex": 1,
      "explanation": "`uvx` runs a tool without installing it permanently, which is ideal for trying something once. Project checks belong in dev dependencies."
    },
    {
      "question": "Where do you configure Ruff in a uv project?",
      "options": [
        "In a `.flake8` file",
        "In `uv.lock`",
        "In the `[tool.ruff]` and `[tool.ruff.lint]` sections of `pyproject.toml`",
        "In `.python-version`"
      ],
      "answerIndex": 2,
      "explanation": "`pyproject.toml` is the single source of truth for tool settings, with one `[tool.<name>]` section per tool."
    },
    {
      "question": "What does `uv run mypy .` check?",
      "options": [
        "That the code is formatted neatly",
        "That all of the tests in the project run and pass when you run them",
        "That every import is installed",
        "That values match the type hints, without running the code"
      ],
      "answerIndex": 3,
      "explanation": "mypy reads your code and compares values against the type hints, without running the program. Formatting, tests and installs are checked by other tools."
    },
    {
      "question": "What does `uv run ruff check --fix .` do?",
      "options": [
        "Repairs the problems Ruff marks as safely fixable",
        "Only lists problems",
        "Reformats the layout of every file to match one consistent style",
        "Deletes files with errors"
      ],
      "answerIndex": 0,
      "explanation": "`--fix` applies the automatic repairs for findings marked fixable and still reports the rest. Layout rewriting is the job of `ruff format`."
    }
  ]
});
