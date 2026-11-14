window.TOPICS = window.TOPICS || [];
window.TOPICS.push({
  "id": "01-setup-with-uv",
  "order": 1,
  "title": "Setup with uv",
  "version": "Python 3.15.2 + uv 0.13.7",
  "summary": "Learn what a program, Python, and uv are, then install uv and use it to install Python 3.15. You will run your first script with `uv run`, try the interactive REPL (a Python prompt that runs one line at a time), and use `print()` to show text on screen.",
  "prerequisites": [],
  "subtopics": [
    {
      "id": "what-python-and-uv-are",
      "title": "What Python and uv are",
      "explanation": "A program is a list of instructions that tells a computer what to do. Python is a programming language: a set of words and rules you use to write those instructions. You save them in a text file that ends in `.py`.\n\nA computer cannot understand Python text directly. A tool called the interpreter reads your `.py` file and carries out the instructions, line by line, from top to bottom. When people say \"install Python\", they mostly mean installing the interpreter.\n\nReal projects also use packages: bundles of ready-made code written by other people (for example, code to read spreadsheets). uv, made by a company called Astral, is one tool that installs Python itself, runs your scripts, and manages the packages a project needs. uv is not a language; it is a helper for Python.\n\nYou will type commands in a terminal (also called the command line): a window where you type a text command and press Enter to run it. On Windows, open PowerShell (click Start, type PowerShell, press Enter); on macOS, open Terminal; on Linux, open your terminal app.",
      "analogy": "Python is the recipe language, the interpreter is the cook who follows the recipe step by step, and uv is the kitchen manager who buys the right stove (the Python version) and the right ingredients (packages).",
      "code": [
        {
          "language": "bash",
          "filename": "terminal",
          "source": "uv --version",
          "output": "uv 0.13.7",
          "explanation": "Asks uv to print its own version number. The exact number you see depends on the version you installed; this command only works after uv is installed (next sub-topic)."
        }
      ],
      "productionNote": "Teams standardise on one tool (uv) so every developer laptop, test machine, and server uses the same Python and the same package versions. This avoids the classic \"it works on my machine\" problem.",
      "commonMistakes": [
        "Thinking uv is a different programming language. It is a tool for working with Python.",
        "Typing Python code straight into the terminal. Python code belongs in a `.py` file or in the Python REPL (covered later in this topic)."
      ],
      "sources": [
        { "title": "Python docs: Tutorial", "url": "https://docs.python.org/3/tutorial/index.html" },
        { "title": "uv docs", "url": "https://docs.astral.sh/uv/" }
      ]
    },
    {
      "id": "installing-uv",
      "title": "Installing uv",
      "explanation": "You install uv once per machine using the official standalone installer (a small script you download and run, with no other tool needed). On macOS and Linux you run one command; on Windows you run a PowerShell command.\n\nAfter the installer finishes, close the terminal and open a new one. The installer changes the list of places your terminal looks for programs (the PATH), and an already-open terminal does not see that change. Then check the install with `uv --version`.\n\nLater, you can update uv with `uv self update`. This only works for uv installed with the standalone installer. If you installed uv with another package manager, update it with that same manager instead. A package manager is a tool that installs software for you; Homebrew (macOS) and WinGet (Windows) are examples.",
      "analogy": "Installing uv is like installing an app store once. After that, every other tool you need comes through it.",
      "code": [
        {
          "language": "bash",
          "filename": "terminal",
          "source": "# macOS / Linux\ncurl -LsSf https://astral.sh/uv/install.sh | sh\n\n# Windows (PowerShell)\npowershell -ExecutionPolicy ByPass -c \"irm https://astral.sh/uv/install.ps1 | iex\"\n\n# After restarting the terminal, on any system:\nuv --version",
          "output": "",
          "explanation": "Run only the installer line for your own operating system, then restart the terminal and run `uv --version`. The installer prints its own progress text, which varies by OS and version, so no fixed output is shown."
        }
      ],
      "productionNote": "CI machines (automatic build servers) and Docker images install uv the same way, usually pinning an exact uv version so builds are repeatable.",
      "commonMistakes": [
        "Not restarting the terminal after installing, then seeing \"uv: command not found\" or \"not recognized\".",
        "Running `uv self update` on a uv that was installed by another package manager. Update it with that manager instead."
      ],
      "sources": [
        { "title": "uv docs: Installation", "url": "https://docs.astral.sh/uv/getting-started/installation/" }
      ]
    },
    {
      "id": "installing-python-with-uv",
      "title": "Installing Python with uv",
      "explanation": "With uv you do not need to download Python from a website. The command `uv python install 3.15` downloads a managed copy of Python 3.15 and stores it for uv to use. You do not need administrator rights, and you do not need any Python already on your computer.\n\nThe command `uv python list` shows the Python versions uv knows about: which are installed and which are available to download. uv will also download a missing Python automatically when a command needs one, so installing first is optional but makes the setup explicit.\n\nBe careful: a plain `python` typed in your terminal may be a different Python (or none at all). To be sure you use the Python that uv manages, start it through uv, for example `uv run python`.",
      "analogy": "It is like ordering a specific model of tool from a catalogue instead of using whatever happens to be lying around in the garage.",
      "code": [
        {
          "language": "bash",
          "filename": "terminal",
          "source": "uv python install 3.15\nuv python list",
          "output": "",
          "explanation": "The first line downloads Python 3.15. The second lists Python versions. The text printed varies by version, operating system, and what you already have installed, so no fixed output is shown."
        }
      ],
      "productionNote": "Pin an exact Python minor version (such as 3.15) for a project so that laptops, CI, and servers all run the same interpreter.",
      "commonMistakes": [
        "Assuming the `python` command in your terminal is the uv-managed Python. Use `uv run python` to be sure.",
        "Installing many Python versions without knowing which one a project actually uses."
      ],
      "sources": [
        { "title": "uv docs: Installing Python", "url": "https://docs.astral.sh/uv/guides/install-python/" },
        { "title": "uv docs: Python versions", "url": "https://docs.astral.sh/uv/concepts/python-versions/" }
      ]
    },
    {
      "id": "running-a-script-with-uv-run",
      "title": "Running a script with uv run",
      "explanation": "A script is a plain text file of Python instructions whose name ends in `.py`. Follow these steps:\n\n1. Open a text or code editor (Notepad, VS Code, or any editor).\n2. Type the one line `print(\"Hello, world!\")` and save the file as `hello.py` in a folder you choose.\n3. Open a terminal in that folder. If it opens somewhere else, use `cd folder-name` (cd means \"change directory\") to move into the folder.\n\n`uv run hello.py` runs the file with a suitable Python. If you want a particular version, add `--python 3.15` (an option, also called a flag, that changes how the command runs): `uv run --python 3.15 hello.py`.\n\nThe terminal looks for `hello.py` in the folder you are currently in. If you are in a different folder, uv cannot find the file. Use `cd folder-name` to move into the right folder first.",
      "analogy": "Running a script is like handing a written recipe to the cook instead of shouting instructions one at a time.",
      "code": [
        {
          "language": "python",
          "filename": "hello.py",
          "source": "print(\"Hello, world!\")",
          "output": "Hello, world!",
          "explanation": "One instruction: show the text Hello, world! on screen."
        },
        {
          "language": "bash",
          "filename": "terminal",
          "source": "uv run hello.py\nuv run --python 3.15 hello.py",
          "output": "Hello, world!\nHello, world!",
          "explanation": "Both commands run the same file, so each prints the line once. The second asks for Python 3.15 explicitly."
        }
      ],
      "productionNote": "`uv run` is how scripts, web servers, and tests are started in uv-managed projects, so everyone launches code the same way.",
      "commonMistakes": [
        "Saving the file as `hello.py.txt` because the editor or Windows hides the real extension. The name must end in `.py`.",
        "Running the command from a different folder than the one that holds the file."
      ],
      "sources": [
        { "title": "uv docs: Running scripts", "url": "https://docs.astral.sh/uv/guides/scripts/" }
      ]
    },
    {
      "id": "the-interactive-repl",
      "title": "The interactive REPL",
      "explanation": "REPL stands for Read-Eval-Print Loop. Python reads one line you type, evaluates (runs) it, prints the result right away, and loops back to wait for the next line. It is perfect for small experiments.\n\nStart it with `uv run python`. You will see a prompt, `>>>`, which means \"Python is waiting for you\". Type an expression (a piece of code that produces a value), such as `2 + 3`, press Enter, and the answer appears on the next line.\n\nTo leave, type `exit()` and press Enter, or press Ctrl+D (macOS/Linux) or Ctrl+Z then Enter (Windows). Nothing you type in the REPL is saved, so use a `.py` file for anything you want to keep.",
      "analogy": "The REPL is a calculator: you type, press equals, and see the answer immediately, but nothing is written down for later.",
      "code": [
        {
          "language": "python",
          "filename": "repl-session",
          "source": ">>> 2 + 3\n5\n>>> \"py\" * 3\n'pypypy'\n>>> exit()",
          "output": "",
          "explanation": "This is a transcript of a REPL session, not a file to run. You type only the part after `>>>`; Python prints the other lines. Multiplying text by 3 repeats it three times, and the REPL shows text results inside quotes."
        }
      ],
      "productionNote": "Developers use the REPL to quickly test an idea or poke at a library before writing real code.",
      "commonMistakes": [
        "Writing a whole program in the REPL and losing it when you exit. Save programs in `.py` files.",
        "Typing the `>>>` characters yourself. Python shows them; you only type what comes after."
      ],
      "sources": [
        { "title": "Python docs: Using the interpreter", "url": "https://docs.python.org/3/tutorial/interpreter.html" }
      ]
    },
    {
      "id": "your-first-program-with-print",
      "title": "Your first program with print",
      "explanation": "`print()` is a built-in function: a ready-made command that Python already knows. You use a function by writing its name followed by parentheses, and the values you put inside the parentheses are its arguments (the inputs you give it). A string is text written inside quotes, like `\"Hello\"`.\n\nWhen you give `print()` several values separated by commas, it shows them in one line with a single space between them. The `sep=` argument changes that separator. After printing, `print()` normally moves to a new line; the `end=` argument changes what is printed at the end, and `end=\"\"` stays on the same line.\n\nIn the example below, the third line prints `Loading` and does not start a new line, so the next print continues right after it.",
      "analogy": "`print()` is a label printer: you give it items, it prints them in a row with the gap you choose, then feeds the paper to the next line.",
      "code": [
        {
          "language": "python",
          "filename": "first.py",
          "source": "print(\"Hello\", \"Ada\")\nprint(\"a\", \"b\", \"c\", sep=\"-\")\nprint(\"Loading\", end=\"\")\nprint(\"...done\")",
          "output": "Hello Ada\na-b-c\nLoading...done",
          "explanation": "Line 1 uses the default space. Line 2 joins with a dash. Line 3 prints Loading and no new line, so line 4 continues on the same line. Run it with `uv run first.py`."
        }
      ],
      "productionNote": "`print` is fine for scripts and quick debugging. Real services use logging (covered later in the course) because it records levels, times, and can be switched on and off.",
      "commonMistakes": [
        "Forgetting the quotes around text, so Python treats the words as names it does not know.",
        "Using smart (curly) quotes copied from a word processor instead of plain straight quotes.",
        "Writing `Print` with a capital P. Python is case sensitive, so the name must be `print`."
      ],
      "sources": [
        { "title": "Python docs: print()", "url": "https://docs.python.org/3/library/functions.html#print" }
      ]
    }
  ],
  "quiz": [
    {
      "question": "Which command runs the file `app.py` with uv?",
      "options": ["uv run app.py", "uv start app.py", "python install app.py", "uv app.py --go"],
      "answerIndex": 0,
      "explanation": "`uv run app.py` runs the script with a suitable Python. The other commands are not valid ways to run a script."
    },
    {
      "question": "What does REPL stand for, and what is it for?",
      "options": [
        "Run-Execute-Package-Load; installing packages",
        "Read-Eval-Print Loop; trying one line at a time and seeing the result at once",
        "Remote Execution Program Launcher; running code on servers",
        "Read-Edit-Publish Line; saving programs to files"
      ],
      "answerIndex": 1,
      "explanation": "REPL means Read-Eval-Print Loop. Python reads a line, runs it, prints the result, and repeats. It is good for experiments, not for saving work."
    },
    {
      "question": "What does `print(\"a\", \"b\", sep=\"-\")` output?",
      "options": ["a b", "ab-", "a-b", "a, b"],
      "answerIndex": 2,
      "explanation": "`sep=\"-\"` replaces the default space between values with a dash, so the output is `a-b`."
    },
    {
      "question": "Which command installs Python 3.15 with uv?",
      "options": ["uv install python-3.15", "uv self update 3.15", "uv run python --install-version", "uv python install 3.15"],
      "answerIndex": 3,
      "explanation": "`uv python install 3.15` downloads a managed Python 3.15. `uv self update` updates uv itself, not Python."
    },
    {
      "question": "Which command shows the uv version installed on your computer?",
      "options": ["uv --version", "uv self update", "uv python list", "uv run --version"],
      "answerIndex": 0,
      "explanation": "`uv --version` prints the installed uv version. `uv self update` upgrades uv; the other two do not show it."
    },
    {
      "question": "What is uv?",
      "options": [
        "A programming language you write programs in",
        "A kind of variable that stores numbers in Python",
        "A tool that installs Python and manages a project's scripts and packages",
        "A text editor for writing code files"
      ],
      "answerIndex": 2,
      "explanation": "uv is a helper tool for Python, not a language, variable or editor."
    }
  ]
});
