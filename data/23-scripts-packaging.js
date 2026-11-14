window.TOPICS = window.TOPICS || [];
window.TOPICS.push({
 "id": "23-scripts-packaging",
 "order": 23,
 "title": "Scripts & Packaging",
 "version": "Python 3.15.2 + uv 0.13.7",
 "summary": "Learn how to share a single Python file with its own dependencies, turn a project into an installable package with a terminal command, build it, install CLI tools, and publish safely. You will use uv for every step.",
 "prerequisites": [
  "22-concurrency-asyncio"
 ],
 "subtopics": [
  {
   "id": "single-file-scripts-pep-723",
   "title": "Single-file scripts with inline metadata (PEP 723)",
   "explanation": "A script is a single Python file you run directly. Normally, if your script needs an outside library (a package someone else wrote, such as rich), you must create a project or a virtual environment (an isolated folder of installed packages) first. PEP 723 (a PEP is an official Python proposal document) removes that step: the script describes its own needs in a special comment block at the top.\n\nThe block starts with the line `# /// script` and ends with a line containing only `# ///`. Between them you write TOML (a simple key = value settings format) such as `requires-python = \">=3.15\"` and `dependencies = [\"rich\"]`. Python itself ignores it because it is just comments; tools like uv read it.\n\nWith `uv run report.py`, uv reads the block, builds a temporary environment holding exactly those packages, and runs the script. `uv init --script report.py` creates a starter file, and `uv add --script report.py rich` edits the block for you.\n\nOptionally (macOS and Linux only; on Windows skip this part), add the shebang line `#!/usr/bin/env -S uv run --script` as the first line (a shebang tells the operating system which program should run the file). Then run `chmod +x report.py` once to make it executable (a Unix command that marks a file as runnable), so you can run it as `./report.py`.",
   "analogy": "A recipe card with its shopping list stapled to the top: anyone can cook it without asking what to buy.",
   "code": [
    {
     "language": "python",
     "filename": "report.py",
     "source": "# /// script\n# requires-python = \">=3.15\"\n# dependencies = []\n# ///\nimport json\n\nprint(json.dumps({\"status\": \"ok\"}))",
     "output": "{\"status\": \"ok\"}",
     "explanation": "The comment block at the top is the metadata. This script only needs the standard library, so dependencies is an empty list. Run it with uv run report.py."
    },
    {
     "language": "bash",
     "filename": "terminal",
     "source": "uv add --script report.py rich\nuv run report.py",
     "output": "",
     "explanation": "The first command writes \"rich\" into the script's metadata block. The second runs the script in a temporary environment with rich installed. Terminal output varies (uv may print download or install messages the first time)."
    }
   ],
   "productionNote": "Ops scripts and one-off automation can be shared as a single file: a teammate only needs uv installed, not a project checkout or manual pip steps. Pin versions in the dependency list (for example \"rich>=13\") for scripts that must keep working over time.",
   "commonMistakes": [
    "Malformed block: forgetting the closing `# ///` line (or the opening `# /// script`) means the metadata is ignored or rejected.",
    "Running with plain `python report.py`: Python ignores the block, so the dependencies are not installed and imports fail. Use `uv run`."
   ],
   "sources": [
    {
     "title": "uv docs: Running scripts",
     "url": "https://docs.astral.sh/uv/guides/scripts/#declaring-script-dependencies"
    },
    {
     "title": "Python Packaging: Inline script metadata",
     "url": "https://packaging.python.org/en/latest/specifications/inline-script-metadata/"
    },
    {
     "title": "PEP 723",
     "url": "https://peps.python.org/pep-0723/"
    }
   ]
  },
  {
   "id": "entry-points-project-scripts",
   "title": "Entry points ([project.scripts])",
   "explanation": "Packaging means turning your code into an installable unit that others (or you, on another machine) can install and use. `uv init --package mycli` creates such a project: a `pyproject.toml` configuration file, a `src/mycli/` folder holding your code (src/ is a common layout that keeps package code under src/), and a build backend (the tool that turns the project into an installable archive).\n\nAn entry point is a named command that points to a Python function. In `pyproject.toml`, the `[project.scripts]` table maps a command name to `module:function`. The line `mycli = \"mycli:main\"` means: when someone types `mycli` in a terminal, import the `mycli` package and call its `main()` function.\n\nDuring development, `uv run mycli` runs the command inside the project's environment. The command only exists once the project is installed, which needs a `[build-system]` section; `uv init --package` adds one for you.",
   "analogy": "Putting a doorbell on the house: visitors press one button instead of knowing which room to walk to.",
   "code": [
    {
     "language": "toml",
     "filename": "pyproject.toml",
     "source": "[project]\nname = \"mycli\"\nversion = \"0.1.0\"\ndescription = \"A small example command\"\nreadme = \"README.md\"\nrequires-python = \">=3.15\"\ndependencies = []\n\n[project.scripts]\nmycli = \"mycli:main\"\n\n[build-system]\nrequires = [\"uv_build>=0.13.7,<0.14\"]\nbuild-backend = \"uv_build\"",
     "output": "",
     "explanation": "A representative file as generated by uv init --package (exact version bounds may differ). The key line is mycli = \"mycli:main\", which creates the mycli command."
    },
    {
     "language": "python",
     "filename": "src/mycli/__init__.py",
     "source": "def main() -> None:\n    print(\"Hello from mycli!\")",
     "output": "Hello from mycli!",
     "explanation": "This is the function the entry point calls. The output appears when you run uv run mycli in the project folder."
    }
   ],
   "productionNote": "Internal command-line tools and published tools such as ruff and httpie are exposed exactly this way. Keep main() small and let it call testable functions.",
   "commonMistakes": [
    "Wrong `module:function` path (for example `mycli.cli:main` when `main` lives in `mycli/__init__.py`): the command fails with an import error.",
    "Forgetting a build system, so the project is not installed and the command is not created."
   ],
   "sources": [
    {
     "title": "uv docs: Project configuration, entry points",
     "url": "https://docs.astral.sh/uv/concepts/projects/config/#entry-points"
    },
    {
     "title": "Python Packaging: Creating executable scripts",
     "url": "https://packaging.python.org/en/latest/guides/writing-pyproject-toml/#creating-executable-scripts"
    }
   ]
  },
  {
   "id": "building-with-uv-build",
   "title": "Building with uv build",
   "explanation": "Before others can install your package, you build it. `uv build` creates a `dist/` folder with two files: a wheel (`.whl`, a ready-to-install archive) and an sdist (source distribution, a `.tar.gz` archive of your source plus build instructions). Installers prefer the wheel because it needs no build step.\n\nThe version number comes from `version` in `[project]`. You can edit it by hand or run `uv version --bump patch` (for example 0.1.0 becomes 0.1.1; `minor` and `major` also work). Each release needs a new version, because package indexes do not accept the same version twice.\n\nThe file names encode the name, version, and compatibility, such as `mycli-0.1.1-py3-none-any.whl` (pure Python, works on any platform). Look inside the archives before publishing to confirm nothing unwanted is packed.",
   "analogy": "Boxing a product for shipping: a ready-to-use box (wheel) and a kit with assembly instructions (sdist).",
   "code": [
    {
     "language": "bash",
     "filename": "terminal",
     "source": "uv version --bump patch\nuv build\nls dist/",
     "output": "mycli-0.1.1-py3-none-any.whl\nmycli-0.1.1.tar.gz",
     "explanation": "Bump the version, build, then list the results. The output shown is for the final ls; uv itself prints extra progress lines, and exact text varies by uv version and OS."
    }
   ],
   "productionNote": "Internal packages are usually built in CI (a server that runs automatically on each change) and uploaded to a private index. Add `dist/` to .gitignore (a file that lists what git, the version-history tool, should not save).",
   "commonMistakes": [
    "Forgetting to bump the version: the upload is rejected because that version already exists.",
    "Committing the `dist/` folder to git (saving it in version history); build output should be regenerated, not stored."
   ],
   "sources": [
    {
     "title": "uv docs: Building and publishing a package",
     "url": "https://docs.astral.sh/uv/guides/package/"
    },
    {
     "title": "uv docs: Build backend and building",
     "url": "https://docs.astral.sh/uv/concepts/projects/build/"
    }
   ]
  },
  {
   "id": "installing-cli-tools-uv-tool",
   "title": "Installing CLI tools with uv tool",
   "explanation": "A CLI tool is a program you run from the terminal, such as ruff. `uv tool install <package>` installs it into its own isolated environment and puts its command on your PATH (the list of folders your terminal searches for commands). Because each tool has its own environment, tools never conflict with each other or with your projects.\n\nTo install the command from your own project, run `uv tool install .` from the project folder, or `uv tool install --editable .` while developing (the installed command uses your live source files, so edits apply without reinstalling). Manage tools with `uv tool list`, `uv tool upgrade --all`, and `uv tool uninstall <name>`.\n\nIf your terminal cannot find an installed command, the tool directory may not be on PATH yet. `uv tool update-shell` adds it; open a new terminal afterwards.",
   "analogy": "Each app in its own sealed container on your phone: updating one never breaks another.",
   "code": [
    {
     "language": "bash",
     "filename": "terminal",
     "source": "uv tool install .\nmycli\nuv tool list\nuv tool uninstall mycli",
     "output": "Hello from mycli!",
     "explanation": "The mycli line prints the greeting from the previous sub-topic. uv tool install, list, and uninstall also print status messages (for example the installed tool name and version) that vary by uv version."
    }
   ],
   "productionNote": "Developers install shared internal tools the same way, often straight from a private index or git URL, so everyone gets the same command without managing environments.",
   "commonMistakes": [
    "Installing CLIs into a project's virtual environment instead of using `uv tool`, which mixes tool and project dependencies.",
    "PATH not updated, so the command is not found; run `uv tool update-shell` and restart the terminal."
   ],
   "sources": [
    {
     "title": "uv docs: Using tools",
     "url": "https://docs.astral.sh/uv/guides/tools/#installing-tools"
    },
    {
     "title": "uv docs: Tools concepts",
     "url": "https://docs.astral.sh/uv/concepts/tools/"
    }
   ]
  },
  {
   "id": "publishing-with-uv-publish",
   "title": "Publishing with uv publish",
   "explanation": "`uv publish` uploads the files in `dist/` to a package index. PyPI is the public index everyone installs from; TestPyPI is a separate practice copy. Always rehearse on TestPyPI first: configure it in `pyproject.toml` as an index (a server that stores and serves packages) with a `publish-url`, then run `uv publish --index testpypi`.\n\nYou must prove who you are. The best way is Trusted Publishing: you tell PyPI that a specific CI workflow in your repository may publish, and it issues short-lived credentials (temporary login details) automatically, so there is no long-lived secret to leak. Otherwise use an API token (a password-like key) limited to your project, passed through the `UV_PUBLISH_TOKEN` environment variable (a named setting your terminal passes to programs).\n\nNever commit tokens to git or type them where they land in shell history. Published versions are permanent: you cannot overwrite or re-upload the same version, so check the build, test on TestPyPI, then release.",
   "analogy": "Sending a book to the national library: once catalogued under an edition number, that edition is permanent.",
   "code": [
    {
     "language": "toml",
     "filename": "pyproject.toml",
     "source": "[[tool.uv.index]]\nname = \"testpypi\"\nurl = \"https://test.pypi.org/simple/\"\npublish-url = \"https://test.pypi.org/legacy/\"\nexplicit = true",
     "output": "",
     "explanation": "Adds TestPyPI as a named index. explicit = true means uv only uses it when asked, so normal installs still come from PyPI."
    },
    {
     "language": "bash",
     "filename": "terminal",
     "source": "uv publish --index testpypi",
     "output": "",
     "explanation": "Uploads dist/ to TestPyPI. Provide credentials through Trusted Publishing in CI or UV_PUBLISH_TOKEN. Output varies and lists the uploaded files."
    }
   ],
   "productionNote": "Open-source releases and private registries are usually published from a CI release job using Trusted Publishing, triggered by a version tag (a label in git, like v1.2.0, marking a release), so no human holds publishing credentials.",
   "commonMistakes": [
    "Packing secrets or large unneeded files (.env files, data dumps) into the package.",
    "Re-uploading the same version: it is rejected, so bump the version instead.",
    "Leaving tokens in shell history (the saved list of commands your terminal remembers) or committing them to git."
   ],
   "sources": [
    {
     "title": "uv docs: Publishing your package",
     "url": "https://docs.astral.sh/uv/guides/package/#publishing-your-package"
    },
    {
     "title": "PyPI docs: Trusted publishers",
     "url": "https://docs.pypi.org/trusted-publishers/"
    }
   ]
  }
 ],
 "quiz": [
  {
   "question": "Where does a PEP 723 script declare its dependencies?",
   "options": [
    "In a separate requirements.txt file placed next to the script",
    "In the file name of the script, such as report-rich.py",
    "In a # /// script comment block at the top of the file",
    "In a separate uv.lock file created by uv and nothing else"
   ],
   "answerIndex": 2,
   "explanation": "PEP 723 puts TOML metadata in a comment block starting with # /// script and ending with # ///, which uv run reads."
  },
  {
   "question": "What does mycli = \"mycli:main\" in [project.scripts] do?",
   "options": [
    "Creates a terminal command mycli that calls main()",
    "Renames the package to main and removes the name mycli",
    "Runs main() automatically every time Python starts on any computer",
    "Publishes the package to PyPI under the name mycli"
   ],
   "answerIndex": 0,
   "explanation": "An entry point maps a command name to module:function, so typing mycli calls main() from the mycli package."
  },
  {
   "question": "What two files does uv build produce?",
   "options": [
    "A .exe and a .dll",
    "A requirements.txt file and a uv.lock file, both for installers",
    "A .zip and a .tar",
    "A wheel (.whl) and a source distribution (.tar.gz)"
   ],
   "answerIndex": 3,
   "explanation": "uv build writes a wheel and an sdist into dist/."
  },
  {
   "question": "Why test on TestPyPI first?",
   "options": [
    "It is faster than PyPI because it has fewer users",
    "PyPI versions cannot be overwritten, so mistakes are permanent",
    "It removes the need to bump the version number later",
    "It is required before you can create an API token"
   ],
   "answerIndex": 1,
   "explanation": "A version published to PyPI is permanent, so TestPyPI lets you rehearse the release without risking a bad permanent upload."
  },
  {
   "question": "What does `uv tool install mycli` do?",
   "options": [
    "Installs the mycli command so you can run it from any folder",
    "Adds mycli to the current project's dependency list and lock file",
    "Runs mycli once and then removes it",
    "Publishes mycli to PyPI"
   ],
   "answerIndex": 0,
   "explanation": "uv tool install puts the tool in its own isolated environment and adds its command to your PATH. It does not touch your project's dependencies."
  },
  {
   "question": "Why is Trusted Publishing safer than a long-lived PyPI token?",
   "options": [
    "It skips the build step and uploads the source directly",
    "It makes the package private so that only the account owner can install it",
    "It publishes without any account",
    "It uses short-lived credentials, so there is no stored secret to leak"
   ],
   "answerIndex": 3,
   "explanation": "PyPI issues temporary credentials to your approved CI workflow, so no permanent secret exists that could be stolen or committed by mistake."
  }
 ]
});
