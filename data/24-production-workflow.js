window.TOPICS = window.TOPICS || [];
window.TOPICS.push({
 "id": "24-production-workflow",
 "order": 24,
 "title": "Production Workflow",
 "version": "Python 3.15.2 + uv 0.13.7",
 "summary": "Learn how to take a uv project from your laptop to production: reproducible installs with a lockfile (the exact-version list of packages), automatic checks in GitHub Actions (GitHub's built-in CI server), small cached Docker images (sealed, reusable app bundles), configuration through environment variables, and multi-package repos (workspaces). These habits make sure what you tested is exactly what you ship.",
 "prerequisites": [
  "23-scripts-packaging"
 ],
 "subtopics": [
  {
   "id": "reproducible-installs",
   "title": "Reproducible installs (uv sync --locked / --frozen)",
   "explanation": "A lockfile (uv.lock) records the exact version of every package your project uses. A reproducible install means every machine, today or next year, gets exactly those versions. That way the environment you tested is the environment you deploy.\n\nuv sync --locked installs from uv.lock but first checks that the lockfile still matches pyproject.toml (the file listing your dependencies). If you edited pyproject.toml and forgot to re-lock, the command fails instead of quietly guessing. This is the right choice in CI (continuous integration, covered next).\n\nuv sync --frozen installs straight from uv.lock and does not check it against pyproject.toml at all. It is useful in places like a Docker build step (Docker is covered below) where pyproject.toml may not be available yet. The downside is that it will not notice an out-of-date lockfile.\n\nAdd --no-dev to skip development-only dependency groups (test tools, linters) when installing for production. To only verify the lockfile without installing anything, run uv lock --check (or uv lock --locked).",
   "analogy": "A builder who refuses to start if the blueprint and the materials list disagree is --locked. A builder who trusts the materials list blindly, without comparing it to the blueprint, is --frozen.",
   "code": [
    {
     "language": "bash",
     "filename": "terminal",
     "source": "# CI: fail if uv.lock is out of date with pyproject.toml\nuv sync --locked\n\n# Production install: trust the lockfile, skip dev tools\nuv sync --frozen --no-dev\n\n# Just verify the lockfile, install nothing\nuv lock --check",
     "output": "",
     "explanation": "The first command is the strict CI check. The second installs only runtime dependencies exactly as locked. The third only verifies. Exact messages printed vary by uv version and project, so output is left empty here."
    }
   ],
   "productionNote": "Using the same lockfile in CI and in the deployed image guarantees the tested environment is the deployed environment. Commit uv.lock to git so everyone shares it.",
   "commonMistakes": [
    "Running plain uv sync in CI: it can silently update the lockfile, so CI tests something different from what you committed.",
    "Using --frozen everywhere, which hides the fact that uv.lock is out of date with pyproject.toml."
   ],
   "sources": [
    {
     "title": "uv docs: Locking and syncing",
     "url": "https://docs.astral.sh/uv/concepts/projects/sync/"
    },
    {
     "title": "uv docs: CLI reference (uv sync)",
     "url": "https://docs.astral.sh/uv/reference/cli/#uv-sync"
    }
   ]
  },
  {
   "id": "uv-in-ci",
   "title": "uv in CI",
   "explanation": "CI (continuous integration) means a server automatically runs your checks every time someone pushes code or opens a pull request (a request to merge changes). GitHub Actions is GitHub's built-in CI system; you describe it in a YAML file (a simple indented text format) under .github/workflows/.\n\nA typical uv workflow has these steps:\n1. Check out the code (download your repository onto the CI machine).\n2. Install uv with the astral-sh/setup-uv action (a ready-made, reusable step published for GitHub Actions; it can also cache, meaning save and reuse, downloads).\n3. Install Python.\n4. Run uv sync --locked.\n5. Run ruff check through uv run (lint).\n6. Run ruff format --check through uv run (formatting), then mypy (types).\n7. Run pytest through uv run (tests).\n\nPin the uv version (lock it to exactly 0.13.7) so a new uv release cannot change your CI behavior unexpectedly. Also make sure the Python version in CI matches your .python-version file.\n\nAction major versions (checkout@v5, setup-uv@v7) change over time, so check the linked docs for the current ones when you write your own workflow.",
   "analogy": "An automatic quality gate at the factory exit: every product is checked, every time, the same way, no matter who built it.",
   "code": [
    {
     "language": "yaml",
     "filename": ".github/workflows/ci.yml",
     "source": "name: CI\n\non: [push, pull_request]\n\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v5\n\n      - name: Install uv\n        uses: astral-sh/setup-uv@v7\n        with:\n          version: \"0.13.7\"\n          enable-cache: true\n\n      - name: Install Python\n        run: uv python install\n\n      - name: Install dependencies\n        run: uv sync --locked\n\n      - name: Lint\n        run: uv run ruff check\n\n      - name: Check formatting\n        run: uv run ruff format --check\n\n      - name: Type check\n        run: uv run mypy .\n\n      - name: Test\n        run: uv run pytest",
     "output": "",
     "explanation": "This file runs on every push and pull request. uv python install picks the Python version from your project (for example .python-version). Any failing step turns the check red. Nothing prints locally; results appear in the GitHub Actions tab."
    }
   ],
   "productionNote": "Turn on branch protection in GitHub (a branch is a separate line of work in git; branch protection is a GitHub setting that blocks merging until checks pass) so a pull request cannot be merged until this CI job passes.",
   "commonMistakes": [
    "Not using --locked, so CI may install different versions than you committed.",
    "Not enabling the cache, which makes every run slower.",
    "Using a different Python version in CI than the one in .python-version."
   ],
   "sources": [
    {
     "title": "uv docs: Using uv in GitHub Actions",
     "url": "https://docs.astral.sh/uv/guides/integration/github/"
    },
    {
     "title": "setup-uv on GitHub",
     "url": "https://github.com/astral-sh/setup-uv"
    }
   ]
  },
  {
   "id": "uv-in-docker",
   "title": "uv in Docker",
   "explanation": "Docker packages your app together with its environment into an image (a sealed bundle) that runs the same everywhere. An image is built in layers, one per instruction in the Dockerfile (the recipe file). Docker reuses a cached layer if nothing it depends on changed.\n\nThe trick is ordering: dependencies first, code last. Install dependencies first, in a layer that only depends on pyproject.toml and uv.lock, using uv sync --locked --no-install-project --no-dev. Only then copy your code and run uv sync --locked --no-dev again to install your own project. Since dependencies change rarely and code changes constantly, most rebuilds reuse the expensive dependency layer.\n\nSome supporting details:\n- The uv binary comes from the official image ghcr.io/astral-sh/uv, pinned to a version.\n- Cache mounts and bind mounts (RUN --mount=...) let uv reuse its download cache and read the two files without copying them into a layer.\n- UV_COMPILE_BYTECODE=1 precompiles your code into bytecode (Python's pre-translated form of your code), so the app starts faster.\n- UV_LINK_MODE=copy avoids a warning when the cache and the environment live on different file systems.\n- Putting .venv/bin on PATH makes python run inside the project environment.\n\nAdd .venv to .dockerignore (a list of files Docker must not copy) so your local virtual environment never ends up in the image.",
   "analogy": "Packing a moving truck: heavy furniture (dependencies) goes in first because it rarely changes; small boxes (your code) go in last, so they are easy to swap.",
   "code": [
    {
     "language": "docker",
     "filename": "Dockerfile",
     "source": "FROM python:3.15-slim\n\nCOPY --from=ghcr.io/astral-sh/uv:0.13.7 /uv /uvx /bin/\n\nWORKDIR /app\n\nENV UV_COMPILE_BYTECODE=1 UV_LINK_MODE=copy\n\n# Layer 1: dependencies only (cached until uv.lock or pyproject.toml change)\nRUN --mount=type=cache,target=/root/.cache/uv \\\n    --mount=type=bind,source=uv.lock,target=uv.lock \\\n    --mount=type=bind,source=pyproject.toml,target=pyproject.toml \\\n    uv sync --locked --no-install-project --no-dev\n\n# Layer 2: your code\nCOPY . /app\nRUN --mount=type=cache,target=/root/.cache/uv \\\n    uv sync --locked --no-dev\n\nENV PATH=\"/app/.venv/bin:$PATH\"\n\nCMD [\"python\", \"main.py\"]",
     "output": "",
     "explanation": "Building prints Docker's own progress output, which varies, so none is shown. Editing main.py only invalidates the layers from COPY onward; the dependency layer stays cached."
    },
    {
     "language": "text",
     "filename": ".dockerignore",
     "source": ".venv",
     "output": "",
     "explanation": "Keeps your local virtual environment (which may be built for another operating system) out of the image."
    }
   ],
   "productionNote": "This pattern fits container deployments on container platforms (services that run Docker images for you). Small, cached, dev-free images build and start faster.",
   "commonMistakes": [
    "Copying the local .venv into the image instead of listing it in .dockerignore.",
    "Installing dev dependencies in the production image; use --no-dev.",
    "Copying all code before installing dependencies, which busts the cache on every code change."
   ],
   "sources": [
    {
     "title": "uv docs: Using uv in Docker",
     "url": "https://docs.astral.sh/uv/guides/integration/docker/"
    }
   ]
  },
  {
   "id": "environment-variables-config",
   "title": "Environment variables and configuration",
   "explanation": "An environment variable is a named setting (a key=value pair) that the operating system hands to a running program. Settings that differ between machines (a database address, a debug switch) and secrets (API keys, passwords) should come from environment variables, not be hard-coded in your source code. Then the same code runs on your laptop, in CI, and in production.\n\nIn Python, os.environ behaves like a dictionary. os.environ.get(\"NAME\", default) returns a default when the variable is missing. os.environ[\"NAME\"] raises a KeyError when it is missing, which is what you want for required values: fail fast with a clear error instead of running half-configured.\n\nEnvironment variables are always strings, so convert types yourself: int(...) for numbers, and compare to \"true\" for booleans. Beware that the string \"false\" is truthy in Python (any non-empty string is), so if os.environ.get(\"DEBUG\", \"false\"): is always true.\n\nFor local development, uv run --env-file .env main.py loads a .env file (a plain text file named exactly .env that you create in the project folder, with lines like KEY=value) before running. Never commit a .env file that contains secrets; add it to .gitignore. Read all settings in one place, such as a Settings dataclass, instead of scattering os.environ calls everywhere.",
   "analogy": "A hotel room: the building (your code) is identical for every guest, while the preferences card (environment variables) changes with each stay.",
   "code": [
    {
     "language": "python",
     "filename": "settings.py",
     "source": "import os\nfrom dataclasses import dataclass\n\n\n@dataclass(frozen=True)\nclass Settings:\n    debug: bool\n    port: int\n    db_url: str\n\n\ndef load_settings() -> Settings:\n    return Settings(\n        debug=os.environ.get(\"APP_DEBUG\", \"false\").lower() == \"true\",\n        port=int(os.environ.get(\"APP_PORT\", \"8000\")),\n        db_url=os.environ.get(\"APP_DB_URL\", \"sqlite:///local.db\"),\n    )\n\n\n# Simulate the environment for this demo\nos.environ[\"APP_PORT\"] = \"9000\"\nprint(load_settings())",
     "output": "Settings(debug=False, port=9000, db_url='sqlite:///local.db')",
     "explanation": "APP_PORT is set to \"9000\" and converted to the int 9000. APP_DEBUG and APP_DB_URL are not set, so their defaults apply. This assumes those two variables are not set in your shell."
    },
    {
     "language": "bash",
     "filename": "terminal",
     "source": "uv run --env-file .env settings.py",
     "output": "",
     "explanation": "Loads variables from a local .env file for development. Output depends on your file; keep .env out of git."
    }
   ],
   "productionNote": "This is the widely used \"twelve-factor\" rule of keeping configuration in the environment, not in code. In production the hosting platform injects values and secrets (for example CI secrets) so they never live in the repository.",
   "commonMistakes": [
    "Committing secrets or a .env file with real credentials.",
    "Forgetting that environment values are strings, so \"false\" is truthy.",
    "Reading environment variables all over the code instead of in one settings module."
   ],
   "sources": [
    {
     "title": "Python docs: os.environ",
     "url": "https://docs.python.org/3/library/os.html#os.environ"
    },
    {
     "title": "uv docs: CLI reference (uv run)",
     "url": "https://docs.astral.sh/uv/reference/cli/#uv-run"
    },
    {
     "title": "The Twelve-Factor App: Config",
     "url": "https://12factor.net/config"
    }
   ]
  },
  {
   "id": "workspaces",
   "title": "Workspaces for multi-package repos",
   "explanation": "A workspace is a single repository that holds several related Python packages managed together. All members share one uv.lock, so they are guaranteed to use compatible dependency versions, and you install and test everything with one command.\n\nThe top-level pyproject.toml declares members with [tool.uv.workspace] members = [\"packages/*\"], which means every folder under packages/ is a member with its own pyproject.toml. To let one member depend on another, list it as a normal dependency and mark it in [tool.uv.sources] with { workspace = true }. Without that line, uv would look for a package with that name on PyPI (the public package index).\n\nuv run --package api pytest runs the command for only that member. Use a workspace when the packages are developed and released together, such as a shared core library plus services. Use separate repositories when packages are released independently or need conflicting dependency versions, because one lockfile forces everything to agree.",
   "analogy": "An apartment building: separate flats (packages) share one foundation and one utility meter (the lockfile).",
   "code": [
    {
     "language": "toml",
     "filename": "pyproject.toml",
     "source": "[project]\nname = \"platform\"\nversion = \"0.1.0\"\nrequires-python = \">=3.15\"\ndependencies = [\"api\", \"core\"]\n\n[tool.uv.sources]\napi = { workspace = true }\ncore = { workspace = true }\n\n[tool.uv.workspace]\nmembers = [\"packages/*\"]",
     "output": "",
     "explanation": "The root project depends on two members, api and core, both found inside packages/. workspace = true tells uv to use the local copies rather than PyPI."
    },
    {
     "language": "bash",
     "filename": "terminal",
     "source": "uv run --package api pytest",
     "output": "",
     "explanation": "Runs pytest for the api member only. Output depends on that package's tests."
    }
   ],
   "productionNote": "Workspaces suit monorepos (one repo, many packages) with a shared core library plus several services that must stay in sync.",
   "commonMistakes": [
    "Putting unrelated projects that need different dependency versions into one workspace; the single lockfile forces compatible versions.",
    "Forgetting workspace = true in [tool.uv.sources], so uv looks for the package on PyPI instead."
   ],
   "sources": [
    {
     "title": "uv docs: Workspaces",
     "url": "https://docs.astral.sh/uv/concepts/projects/workspaces/"
    }
   ]
  }
 ],
 "quiz": [
  {
   "question": "Which flag makes uv sync fail if the lockfile is out of date with pyproject.toml?",
   "options": [
    "--frozen",
    "--no-dev",
    "--locked",
    "--check-only"
   ],
   "answerIndex": 2,
   "explanation": "--locked verifies uv.lock against pyproject.toml and fails on a mismatch. --frozen skips that check, and --no-dev only skips dev dependencies."
  },
  {
   "question": "Why install dependencies before copying your code in a Dockerfile?",
   "options": [
    "Docker requires every dependency to be installed before it will copy any files",
    "It makes the image smaller by deleting your code afterwards",
    "It lets Python import modules faster at run time",
    "The dependency layer stays cached when only your code changes"
   ],
   "answerIndex": 3,
   "explanation": "Docker caches layers. Dependencies change rarely and code changes often, so putting dependencies first means most rebuilds reuse the expensive cached layer."
  },
  {
   "question": "What is wrong with: if os.environ.get(\"DEBUG\", \"false\"):",
   "options": [
    "The string \"false\" is non-empty, so it is truthy and the branch always runs",
    "os.environ cannot take a default",
    "It raises a KeyError (a missing-key error) whenever DEBUG is not set at all",
    "Nothing, it works correctly"
   ],
   "answerIndex": 0,
   "explanation": "Environment variables are strings, and any non-empty string is truthy in Python. Compare explicitly, for example .lower() == \"true\"."
  },
  {
   "question": "What do the members of a uv workspace share?",
   "options": [
    "Their version numbers",
    "One uv.lock file",
    "Separate uv.lock files for each member",
    "The same PyPI upload"
   ],
   "answerIndex": 1,
   "explanation": "All workspace members are locked together in one uv.lock, which keeps their dependency versions compatible."
  },
  {
   "question": "Should a .env file containing secrets be committed to git?",
   "options": [
    "No, keep it out of git and inject secrets through the platform",
    "Yes, so teammates have it",
    "Yes, but only in private repositories, since only team members can read them",
    "Only if the file is renamed"
   ],
   "answerIndex": 0,
   "explanation": "Secrets in git history are hard to remove and easy to leak. Keep .env in .gitignore and supply real secrets via the platform or CI secret storage."
  },
  {
   "question": "In CI, why run `uv sync --locked` instead of plain `uv sync`?",
   "options": [
    "It installs faster by skipping packages that your tests do not import",
    "It removes the virtual environment afterwards",
    "It upgrades every package to the newest version",
    "It fails if uv.lock is out of date instead of silently changing it"
   ],
   "answerIndex": 3,
   "explanation": "--locked makes uv stop with an error when uv.lock no longer matches pyproject.toml, so CI never tests versions you did not commit. Plain uv sync would quietly update the lockfile."
  }
 ]
});
