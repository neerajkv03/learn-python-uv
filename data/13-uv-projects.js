window.TOPICS = window.TOPICS || [];
window.TOPICS.push({
  "id": "13-uv-projects",
  "order": 13,
  "title": "uv Projects & Dependencies",
  "version": "Python 3.15.2 + uv 0.13.7",
  "summary": "Learn to start a Python project with uv, understand the files it creates, and manage third-party packages safely. You will use pyproject.toml, uv.lock, dependency groups and a pinned Python version so every machine builds the same environment.",
  "prerequisites": ["12-modules-imports"],
  "subtopics": [
    {
      "id": "uv-init",
      "title": "uv init",
      "explanation": "A project is a folder that uv manages as one unit: your code, a list of what it needs, and a private set of installed tools. uv is a fast tool that installs Python and packages and runs your code. The command `uv init hello-app` creates a new folder called `hello-app` with a starter layout.\n\nThe starter files are: `pyproject.toml` (the project's settings and dependency list), `.python-version` (which Python version to use), `README.md` (a description for humans), `main.py` (a first script) and `.gitignore` (files git should skip). It also starts a git repository, which is a history of your changes, if the folder is not already inside one.\n\nThe first time you run `uv run main.py`, uv also creates `.venv/` and `uv.lock`. A virtual environment (`.venv`) is a private folder holding this project's own Python and installed packages, so projects never interfere with each other. `uv.lock` is a generated file recording exact package versions.\n\nFor code meant to be installed or shared, `uv init --package` creates an installable package with code under `src/`, and `uv init --lib` creates a library. A plain `uv init` is right for scripts and applications.",
      "analogy": "Opening a new shop with a ready-made starter kit: the sign, the cash register and the stock list are already in place, so you can start serving customers.",
      "code": [
        {
          "language": "bash",
          "filename": "terminal",
          "source": "uv init hello-app\ncd hello-app\nuv run main.py",
          "output": "Hello from hello-app!",
          "explanation": "Creates the project, enters its folder, and runs the generated script. On the first run uv also creates .venv/ and uv.lock. Messages printed by uv itself (such as 'Initialized project') vary by version and are omitted here."
        },
        {
          "language": "python",
          "filename": "main.py",
          "source": "def main():\n    print(\"Hello from hello-app!\")\n\n\nif __name__ == \"__main__\":\n    main()",
          "output": "Hello from hello-app!",
          "explanation": "This is the file uv generates. The guard 'if __name__ == \"__main__\":' runs main() only when you run the file directly, not when another file imports it."
        }
      ],
      "productionNote": "Every new service or tool starts from uv init, giving the whole team a standard layout they recognise at a glance.",
      "commonMistakes": [
        "Running uv init in a subfolder of an existing project, which creates a nested project (creating a second project inside an existing one); run it in a new, empty folder.",
        "Deleting .python-version or pyproject.toml because they look like clutter; uv needs both."
      ],
      "sources": [
        { "title": "uv docs: Working on projects", "url": "https://docs.astral.sh/uv/guides/projects/" },
        { "title": "uv docs: Creating projects", "url": "https://docs.astral.sh/uv/concepts/projects/init/" }
      ]
    },
    {
      "id": "pyproject-toml",
      "title": "pyproject.toml",
      "explanation": "`pyproject.toml` is the standard settings file for a Python project. It is written in TOML, a simple format made of `key = value` lines grouped under `[section]` headings. Text values need double quotes; lists use square brackets.\n\nThe `[project]` section describes your project: `name`, `version`, `description`, `readme` (the file shown as its description), `requires-python` (which Python versions it supports, such as `>=3.15` meaning 3.15 or newer) and `dependencies` (the packages it needs, empty at first).\n\nOther tools keep their settings in the same file under `[tool.*]` sections, for example `[tool.ruff]` for the ruff code checker or `[tool.pytest.ini_options]` for pytest, the test runner. One file describes the whole repository.",
      "analogy": "The shop's licence and inventory sheet: its name, opening date, the rules it operates under, and the suppliers it relies on.",
      "code": [
        {
          "language": "toml",
          "filename": "pyproject.toml",
          "source": "[project]\nname = \"hello-app\"\nversion = \"0.1.0\"\ndescription = \"Add your description here\"\nreadme = \"README.md\"\nrequires-python = \">=3.15\"\ndependencies = []",
          "output": "",
          "explanation": "What uv init generates. The requires-python value follows the Python uv found on your machine, so yours may differ. Edit name and description freely; keep dependencies a list of quoted strings."
        }
      ],
      "productionNote": "One file declares metadata, dependencies and tool configuration for the whole repository, so reviewers and CI read a single place.",
      "commonMistakes": [
        "Editing dependencies by hand and forgetting to update the lock file; prefer uv add, which does both.",
        "Writing invalid TOML, such as a missing quote around a string or a missing comma between list items."
      ],
      "sources": [
        { "title": "uv docs: Project layout", "url": "https://docs.astral.sh/uv/concepts/projects/layout/" },
        { "title": "Python Packaging: Writing pyproject.toml", "url": "https://packaging.python.org/en/latest/guides/writing-pyproject-toml/" }
      ]
    },
    {
      "id": "uv-add-remove",
      "title": "uv add and uv remove",
      "explanation": "A package (also called a dependency) is code someone else wrote and published, usually to PyPI, the Python Package Index. `uv add httpx` adds httpx, a library that sends web requests (HTTP is the set of rules browsers and servers use to talk), to your project in one step: it edits `dependencies` in `pyproject.toml`, updates `uv.lock`, and installs the package into `.venv`.\n\nYou can limit versions with a constraint, for example `uv add \"httpx>=0.27\"` (quotes stop your terminal, called the shell, treating `>` as a redirect, which means sending output into a file). A constraint is any such version limit. When you give none, uv writes a lower bound (the oldest version allowed: `>=0.28.1` means 0.28.1 or newer) based on the version it picked, so the entry looks like `httpx>=0.28.1`; the exact number varies with time.\n\n`uv remove httpx` undoes all of that. `uv tree` prints the dependency tree: your packages and the packages they themselves need.",
      "analogy": "Adding a supplier to the shop's contract list: the order form, the warehouse shelf and the paperwork all update together.",
      "code": [
        {
          "language": "bash",
          "filename": "terminal",
          "source": "uv add httpx\nuv remove httpx",
          "output": "",
          "explanation": "Adds then removes a package. uv prints progress lines such as the packages it resolved or installed; their wording and version numbers vary by uv version, so they are not shown."
        },
        {
          "language": "toml",
          "filename": "pyproject.toml",
          "source": "dependencies = [\"httpx>=0.28.1\"]",
          "output": "",
          "explanation": "How the entry looks after uv add httpx. The version number is whatever was newest when you ran it."
        }
      ],
      "productionNote": "All dependency changes go through uv add and uv remove so pyproject.toml, the lock file and .venv never drift apart.",
      "commonMistakes": [
        "Using pip (the older installer that comes with Python) install inside a uv project; the package is not recorded in pyproject.toml or uv.lock, so teammates will not get it.",
        "Committing .venv/ to git; it is machine-specific and can be rebuilt from the lock file."
      ],
      "sources": [
        { "title": "uv docs: Managing dependencies", "url": "https://docs.astral.sh/uv/concepts/projects/dependencies/" },
        { "title": "uv docs: Projects guide, managing dependencies", "url": "https://docs.astral.sh/uv/guides/projects/#managing-dependencies" }
      ]
    },
    {
      "id": "uv-lock-and-sync",
      "title": "uv.lock and uv sync",
      "explanation": "`uv.lock` records the exact version, and file hashes (fingerprints that detect tampering), of every package, including the packages your packages depend on. It covers all platforms at once. You do not write it; uv generates it, and you should commit it to git.\n\n`uv sync` makes `.venv` match the lock file exactly: missing packages are installed and extra ones removed. `uv run` performs this sync automatically before running your command, so a fresh clone usually needs only `uv run main.py`.\n\nWhen you want a newer version of one package, use `uv lock --upgrade-package httpx`. That upgrades just httpx in the lock file and leaves everything else alone, so you can test one change at a time.",
      "analogy": "A photo of the exact shelf arrangement, so any branch of the shop can rebuild it identically.",
      "code": [
        {
          "language": "bash",
          "filename": "terminal",
          "source": "git clone https://example.com/team/hello-app.git\ncd hello-app\nuv sync\nuv run main.py",
          "output": "",
          "explanation": "git clone downloads a full copy of a repository (a project folder stored with git, the version-history tool) from the given address into a new folder. The URL is a placeholder for your own repository. uv sync builds .venv from uv.lock; the output (a list of installed packages) varies, and main.py then prints whatever your script prints."
        },
        {
          "language": "bash",
          "filename": "terminal",
          "source": "uv lock --upgrade-package httpx",
          "output": "",
          "explanation": "Upgrades only httpx in uv.lock. uv prints which versions changed; that text varies. Run uv sync or uv run afterwards to apply it to .venv."
        }
      ],
      "productionNote": "The lock file gives reproducible builds: laptops, teammates and servers all install identical versions of every package.",
      "commonMistakes": [
        "Not committing uv.lock, so each machine may install different versions.",
        "Editing uv.lock by hand; it is generated and will be overwritten.",
        "Upgrading every package at once without testing; upgrade deliberately, one package at a time."
      ],
      "sources": [
        { "title": "uv docs: Locking and syncing", "url": "https://docs.astral.sh/uv/concepts/projects/sync/" },
        { "title": "uv docs: The lockfile", "url": "https://docs.astral.sh/uv/concepts/projects/layout/#the-lockfile" }
      ]
    },
    {
      "id": "dependency-groups",
      "title": "Dependency groups (dev dependencies)",
      "explanation": "Some tools are only needed while you build the project: a test runner like pytest, or a linter that checks style. These belong in a dependency group, a named list kept separate from the packages your app needs at run time. Groups are defined by a Python standard called PEP 735 and live under `[dependency-groups]` in `pyproject.toml`.\n\n`uv add --dev pytest` puts pytest in the special group named `dev`. You can create other groups with `uv add --group lint ruff`. The `dev` group is installed by default whenever you run `uv sync`.\n\nFor production, run `uv sync --no-dev` so the development tools are skipped. The result is a smaller, safer environment containing only what the app needs.",
      "analogy": "Workshop tools stay in the workshop; only the finished furniture is delivered to the customer.",
      "code": [
        {
          "language": "bash",
          "filename": "terminal",
          "source": "uv add --dev pytest",
          "output": "",
          "explanation": "Adds pytest to the dev group, updates uv.lock and installs it. uv's progress lines vary by version."
        },
        {
          "language": "toml",
          "filename": "pyproject.toml",
          "source": "[dependency-groups]\ndev = [\"pytest>=8.4\"]",
          "output": "",
          "explanation": "The resulting entry. The lower bound is representative; yours matches the pytest version that was newest when you ran the command."
        },
        {
          "language": "bash",
          "filename": "terminal",
          "source": "uv sync --no-dev",
          "output": "",
          "explanation": "Installs only runtime dependencies, as you would in a production build. Output varies."
        }
      ],
      "productionNote": "Production images install only runtime dependencies, which keeps them smaller and leaves fewer packages that could contain security holes.",
      "commonMistakes": [
        "Putting pytest in runtime dependencies, so it ships to production for no reason.",
        "Forgetting --no-dev in production builds, which installs all the development tools."
      ],
      "sources": [
        { "title": "uv docs: Development dependencies", "url": "https://docs.astral.sh/uv/concepts/projects/dependencies/#development-dependencies" },
        { "title": "PEP 735: Dependency Groups", "url": "https://peps.python.org/pep-0735/" }
      ]
    },
    {
      "id": "pinning-python",
      "title": "Pinning Python with .python-version",
      "explanation": "To pin means to fix a choice so it does not change unexpectedly. `uv python pin 3.15` writes `3.15` into a file called `.python-version`, and uv then uses that Python version for the project, downloading it if needed.\n\nIn 3.15.2, 3.15 is the minor version and the final 2 is the patch number, which is a bug-fix release.\n\nThe pin is related to `requires-python` in `pyproject.toml`, but they differ: `requires-python` states which versions your project supports, while `.python-version` says which one you actually use day to day. They should agree, so a pin of 3.15 fits `requires-python = \">=3.15\"`.\n\nPrefer pinning only the minor version (3.15) rather than a full patch version like 3.15.2; that way you automatically receive bug-fix releases.",
      "analogy": "A sign on the workshop door: all work here uses tool model 3.15.",
      "code": [
        {
          "language": "bash",
          "filename": "terminal",
          "source": "uv python pin 3.15\nuv run python --version",
          "output": "Python 3.15.2",
          "explanation": "The pin command writes .python-version and prints a short confirmation line (not shown; its wording varies by uv version). The second command prints the Python used by the project; the patch number (here 2) depends on what is installed on your machine."
        },
        {
          "language": "python",
          "filename": "check_version.py",
          "source": "import sys\n\nprint(sys.version_info[:2] >= (3, 15))",
          "output": "True",
          "explanation": "Create a file named check_version.py in the project folder (next to pyproject.toml), paste in this code and save it. sys.version_info holds the running Python's version numbers; [:2] keeps (major, minor), and tuples compare element by element. Run with uv run check_version.py inside the pinned project."
        }
      ],
      "productionNote": "The whole team and every automated build use the same Python minor version, which removes 'works on my machine' surprises.",
      "commonMistakes": [
        "Letting the pin and requires-python disagree, for example pinning 3.14 while requires-python says >=3.15.",
        "Pinning a full patch version unnecessarily, which blocks automatic bug-fix updates."
      ],
      "sources": [
        { "title": "uv docs: Python versions for projects", "url": "https://docs.astral.sh/uv/concepts/python-versions/#project-python-versions" },
        { "title": "uv CLI reference: uv python pin", "url": "https://docs.astral.sh/uv/reference/cli/#uv-python-pin" }
      ]
    }
  ],
  "quiz": [
    {"question": "Which file records the exact versions of all packages, including dependencies of dependencies?", "options": ["uv.lock", "pyproject.toml", ".python-version", "README.md"], "answerIndex": 0, "explanation": "uv.lock is generated by uv and stores exact versions and hashes of every package. pyproject.toml only states what you asked for."},
    {"question": "What does uv sync do?", "options": ["Uploads your project to PyPI", "Upgrades every package to the newest version", "Makes .venv match uv.lock exactly", "Deletes uv.lock and creates a new one"], "answerIndex": 2, "explanation": "uv sync installs missing packages and removes extra ones so the environment matches the lock file. It does not upgrade anything by itself."},
    {"question": "Where does `uv add --dev pytest` put pytest?", "options": ["In the runtime dependencies list of pyproject.toml", "In the .python-version file", "Only in the .gitignore file", "In the dev group under [dependency-groups]"], "answerIndex": 3, "explanation": "The --dev flag adds the package to the dev dependency group, so it is installed for development but skipped by uv sync --no-dev."},
    {"question": "Should .venv/ be committed to git?", "options": ["Yes, so teammates get every package instantly without installing", "No, it is machine-specific and can be rebuilt from uv.lock", "Yes, but only if it is listed in .gitignore", "Only if the project has no dependencies at all, such as a tiny script"], "answerIndex": 1, "explanation": "The virtual environment is generated and tied to one machine. Commit pyproject.toml and uv.lock instead, and let uv sync rebuild .venv."},
    {"question": "Which command creates a new uv project?", "options": ["uv new-project", "uv sync hello-app", "uv python pin hello-app", "uv init hello-app"], "answerIndex": 3, "explanation": "uv init creates the project folder with pyproject.toml, .python-version, README.md, main.py and .gitignore."},
    {"question": "Which file holds the project name, Python requirement and dependency list?", "options": ["pyproject.toml", "uv.lock (the lock file)", ".venv (the virtual environment folder)", ".gitignore (the list of files git skips)"], "answerIndex": 0, "explanation": "pyproject.toml is the project's settings file, with the name, requires-python and dependencies. uv.lock only records exact versions."},
    {"question": "Which file does `uv python pin 3.15` write?", "options": ["pyproject.toml (the settings file)", ".python-version", "uv.lock (the lock file)", "README.md (the description)"], "answerIndex": 1, "explanation": "The pin command writes the chosen version into .python-version, which uv reads to pick the project's Python."},
    {"question": "What does `uv remove httpx` do?", "options": ["Deletes httpx from every project on your computer", "Only edits the README.md file and nothing else", "Removes httpx from pyproject.toml, uv.lock and .venv", "Upgrades httpx to the newest version available"], "answerIndex": 2, "explanation": "uv remove undoes uv add: it drops the entry from pyproject.toml, updates uv.lock and uninstalls the package from .venv."}
  ]
}
);
