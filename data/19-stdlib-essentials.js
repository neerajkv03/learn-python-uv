window.TOPICS = window.TOPICS || [];
window.TOPICS.push({
 "id": "19-stdlib-essentials",
 "order": 19,
 "title": "Standard Library Essentials",
 "version": "Python 3.15.2 + uv 0.13.7",
 "summary": "Python ships with a large toolbox called the standard library, so you can solve many everyday jobs without installing anything. This topic covers the five pieces you will use most: collections, datetime with zoneinfo, logging, argparse, and functools caching.",
 "prerequisites": [
  "18-decorators-context-managers"
 ],
 "subtopics": [
  {
   "id": "collections",
   "title": "collections (Counter, defaultdict, deque)",
   "explanation": "The `collections` module (a module is a file of ready-made Python code you load with `import`) offers specialised containers that are better than plain lists and dictionaries for certain jobs.\n\n`Counter` counts how many times each item appears in a list or other iterable. `most_common(n)` returns the n most frequent items as (item, count) pairs, highest first. `defaultdict` is a dictionary that creates a default value the first time you ask for a missing key, so `defaultdict(list)` lets you append to a key without checking whether it exists.\n\n`deque` (say \"deck\") is a double-ended queue: adding or removing at either end is fast. With `maxlen=3` it keeps only the newest three items and silently drops the oldest when a fourth arrives.",
   "analogy": "Counter is a tally sheet where you add a stroke per vote. defaultdict is a filing cabinet that makes a new folder the first time you file under a new name. deque is a queue at a ticket counter where people can join or leave at either end.",
   "code": [
    {
     "language": "python",
     "filename": "collections_demo.py",
     "source": "from collections import Counter, defaultdict, deque\n\nvotes = [\"py\", \"go\", \"py\", \"rs\", \"py\", \"go\"]\nprint(Counter(votes).most_common(2))\n\nby_letter: defaultdict[str, list[str]] = defaultdict(list)\nfor w in [\"apple\", \"avocado\", \"banana\"]:\n    by_letter[w[0]].append(w)\nprint(dict(by_letter))\n\nrecent: deque[int] = deque(maxlen=3)\nfor n in range(5):\n    recent.append(n)\nprint(list(recent))",
     "output": "[('py', 3), ('go', 2)]\n{'a': ['apple', 'avocado'], 'b': ['banana']}\n[2, 3, 4]",
     "explanation": "Counter tallies the votes; py appears 3 times and go 2 times. defaultdict(list) creates an empty list for 'a' and 'b' on first use. The deque has room for 3 items, so after appending 0 to 4 only 2, 3, 4 remain."
    }
   ],
   "productionNote": "Use Counter for metrics such as counting error types or page hits, defaultdict to group records by a key, and a deque with maxlen to keep the last N events (for example the last 100 log lines) with no manual trimming.",
   "commonMistakes": [
    "Writing `defaultdict(list())` instead of `defaultdict(list)`. Pass the type itself, not a created list.",
    "Using a list as a queue with `pop(0)`. That shifts every remaining item and gets slow; use `deque.popleft()` instead."
   ],
   "sources": [
    {
     "title": "Python docs: collections",
     "url": "https://docs.python.org/3/library/collections.html"
    }
   ]
  },
  {
   "id": "datetime-zoneinfo",
   "title": "datetime and zoneinfo",
   "explanation": "`datetime` represents a date plus a time of day, and `timedelta` represents a duration such as 7 days. A datetime is \"naive\" if it has no timezone and \"aware\" if it carries one. Naive values are ambiguous, so production code should use aware ones.\n\n`zoneinfo.ZoneInfo(\"Asia/Kolkata\")` gives you a named timezone from the IANA timezone database (the shared list of the world's time rules).\n\nUse `datetime.UTC` for UTC. The standard rule: store and compare times in UTC, and convert to a local zone only when showing them to a person with `astimezone`.\n\nUse `isoformat()` to turn a datetime into a text like `2026-11-11T09:30:00+00:00`, `fromisoformat()` to read it back, and `strftime` with codes like `%Y-%m-%d %H:%M` for custom display. Subtracting two datetimes gives a timedelta. The examples use fixed dates, never the current time, so the output is predictable.",
   "analogy": "A meeting time is useless without the city: \"3 pm\" in Mumbai is not \"3 pm\" in London. UTC is like agreeing to schedule everything on one shared world clock. Working out the gap between two appointments is subtracting one date from another, and the result is a duration.",
   "code": [
    {
     "language": "python",
     "filename": "dates.py",
     "source": "from datetime import UTC, datetime, timedelta\nfrom zoneinfo import ZoneInfo\n\nmeeting = datetime(2026, 11, 11, 9, 30, tzinfo=UTC)\nprint(meeting.isoformat())\nprint(meeting.astimezone(ZoneInfo(\"Asia/Kolkata\")).strftime(\"%Y-%m-%d %H:%M\"))\nprint((meeting + timedelta(days=7)).date())\n\nparsed = datetime.fromisoformat(\"2026-12-25T10:00:00+00:00\")\nprint((parsed - meeting).days)",
     "output": "2026-11-11T09:30:00+00:00\n2026-11-11 15:00\n2026-11-18\n44",
     "explanation": "On Windows, run this with `uv run --with tzdata dates.py` (`--with` adds a package for this one run; inside a project use `uv add tzdata` instead). Windows has no built-in time zone data, and without the tzdata package ZoneInfo fails with ZoneInfoNotFoundError. India is 5 hours 30 minutes ahead of UTC, so 09:30 UTC displays as 15:00. Adding 7 days gives November 18. From Nov 11 09:30 to Dec 25 10:00 is 44 days and 30 minutes, and `.days` keeps only the whole days."
    }
   ],
   "productionNote": "Store timestamps in databases (saved tables of data, covered in topic 25) as UTC, compare and schedule in UTC, and convert to the user's zone only at the display edge. Expiry times for login tokens (temporary keys that prove who a user is) and sessions (the server's record of a logged-in user) should also be aware UTC datetimes.",
   "commonMistakes": [
    "Mixing naive and aware datetimes: subtracting them or comparing them with < or > raises a TypeError, and == quietly gives False.",
    "On Windows, forgetting that zoneinfo may have no timezone data; install it with `uv add tzdata`.",
    "Storing local times in a database, which breaks when daylight saving changes or users travel."
   ],
   "sources": [
    {
     "title": "Python docs: datetime",
     "url": "https://docs.python.org/3/library/datetime.html"
    },
    {
     "title": "Python docs: zoneinfo",
     "url": "https://docs.python.org/3/library/zoneinfo.html"
    }
   ]
  },
  {
   "id": "logging",
   "title": "logging",
   "explanation": "`logging` records what a program is doing. Each message has a level showing its importance, from lowest to highest: DEBUG, INFO, WARNING, ERROR, CRITICAL. You set a threshold, and anything below it is hidden. That lets you keep detailed DEBUG messages in the code and turn them on only when investigating a problem.\n\nCreate a logger per module with `logger = logging.getLogger(__name__)`. Configure logging once, at program start, with `logging.basicConfig(level=..., format=...)`. Pass values as extra arguments with `%s`/`%d` placeholders, as in `logger.info(\"user %s\", uid)`, instead of building the string yourself.\n\nInside an `except` block, `logger.exception(\"message\")` logs at ERROR level and includes the full traceback (the list of calls leading to the error).",
   "analogy": "A ship's logbook: entries are marked routine, warning, or emergency, and the captain decides how serious an entry must be before it is read aloud.",
   "code": [
    {
     "language": "python",
     "filename": "log_demo.py",
     "source": "import logging\nimport sys\n\nlogging.basicConfig(\n    level=logging.INFO,\n    format=\"%(levelname)s %(name)s: %(message)s\",\n    stream=sys.stdout,\n)\nlogger = logging.getLogger(\"orders\")\n\nlogger.debug(\"hidden\")\nlogger.info(\"order %s created\", 42)\nlogger.warning(\"stock low: %d left\", 3)",
     "output": "INFO orders: order 42 created\nWARNING orders: stock low: 3 left",
     "explanation": "The level is INFO, so the debug message is dropped. `stream=sys.stdout` (stdout is the normal output channel, the one `print` uses) is used here only so the output shows below; by default logging writes to stderr (the separate error channel). The format has no timestamp so the output stays stable; real services usually add `%(asctime)s`."
    }
   ],
   "productionNote": "Services log to stdout (the normal output channel) or files, which monitoring tools collect and search. Levels filter noise: INFO in production, DEBUG while investigating. Only the application's entry point calls basicConfig.",
   "commonMistakes": [
    "Using `print` in services; it has no levels, names, or easy routing.",
    "Using f-strings in log calls, which format the text even when the message is filtered out. Use `%s` placeholders.",
    "Calling `basicConfig` inside library code; configuration belongs to the application, not to reusable modules."
   ],
   "sources": [
    {
     "title": "Python docs: Logging HOWTO",
     "url": "https://docs.python.org/3/howto/logging.html"
    },
    {
     "title": "Python docs: logging",
     "url": "https://docs.python.org/3/library/logging.html"
    }
   ]
  },
  {
   "id": "argparse",
   "title": "argparse command-line tools",
   "explanation": "A CLI (command-line interface) program takes its inputs from the terminal when run, for example `uv run greet.py Ada --times 2`. `argparse.ArgumentParser` lets you declare what the program accepts and then does the parsing (reading the typed words and turning them into values) and error messages for you.\n\nA positional argument (like `name`) is required and identified by its place. An option (like `--times`) is optional and can have a `type` and a `default`. A flag such as `--shout` with `action=\"store_true\"` is `False` unless present. `--help` is generated automatically from what you declared.\n\n`parser.parse_args()` reads the terminal arguments, but you can pass it a list instead, which makes the function easy to test. Putting the logic in `main(argv)` and guarding with `if __name__ == \"__main__\":` is the standard shape.",
   "analogy": "An order form at a counter: required fields, optional boxes, and instructions printed on the back (`--help`).",
   "code": [
    {
     "language": "python",
     "filename": "greet.py",
     "source": "import argparse\n\n\ndef main(argv: list[str] | None = None) -> None:\n    parser = argparse.ArgumentParser(description=\"Greet someone.\")\n    parser.add_argument(\"name\", help=\"who to greet\")\n    parser.add_argument(\"--times\", type=int, default=1, help=\"repeat count\")\n    parser.add_argument(\"--shout\", action=\"store_true\", help=\"use capitals\")\n    args = parser.parse_args(argv)\n\n    message = f\"Hello, {args.name}!\"\n    if args.shout:\n        message = message.upper()\n    for _ in range(args.times):\n        print(message)\n\n\nif __name__ == \"__main__\":\n    main([\"Ada\", \"--times\", \"2\", \"--shout\"])",
     "output": "HELLO, ADA!\nHELLO, ADA!",
     "explanation": "We pass a fixed list so the example is repeatable, which means that as written the file ignores what you type in the terminal. Real code calls `main()` with no list so argparse reads what you typed: change the last line to `main()` and run `uv run greet.py Ada --times 2 --shout` to get the same two lines. `type=int` converts \"2\" into the number 2 so `range` works."
    }
   ],
   "productionNote": "argparse powers admin scripts, data migration tools, and internal utilities. Because it is in the standard library, such scripts need no dependencies and work with `uv run`.",
   "commonMistakes": [
    "Forgetting `type=int`; the value stays a string and `range(args.times)` fails.",
    "Parsing `sys.argv` (the list of words typed after the program name) by hand, which loses validation, help text, and clear error messages."
   ],
   "sources": [
    {
     "title": "Python docs: argparse",
     "url": "https://docs.python.org/3/library/argparse.html"
    },
    {
     "title": "Python docs: Argparse Tutorial",
     "url": "https://docs.python.org/3/howto/argparse.html"
    }
   ]
  },
  {
   "id": "functools-caching",
   "title": "functools caching",
   "explanation": "Caching means remembering a result so you do not compute it again. `@functools.cache` is a decorator (from the previous topic) that stores the result for each set of arguments it has seen; calling again with the same arguments returns the saved answer instantly. This is called memoisation.\n\n`@lru_cache(maxsize=128)` does the same but keeps only the most recently used N results (LRU means least recently used is dropped first), which bounds memory. Arguments must be hashable (usable as dictionary keys), so numbers, strings, and tuples work but lists do not.\n\n`fib.cache_info()` reports hits, misses, and `currsize`, the number of stored results. Caching suits pure functions: ones whose result depends only on their arguments.",
   "analogy": "Writing the answer on a sticky note so you do not redo the sum next time someone asks.",
   "code": [
    {
     "language": "python",
     "filename": "cache_demo.py",
     "source": "from functools import cache\n\n\n@cache\ndef fib(n: int) -> int:\n    return n if n < 2 else fib(n - 1) + fib(n - 2)\n\n\nprint(fib(80))\nprint(fib.cache_info().currsize)",
     "output": "23416728348467685\n81",
     "explanation": "Without the cache, fib(80) would take an impractically long time because it repeats the same work exponentially. With it, each value from fib(0) to fib(80) is computed once, so 81 results are stored."
    }
   ],
   "productionNote": "Use caching for config lookups and pure, expensive computations. Prefer `lru_cache(maxsize=...)` when inputs are unbounded, and never cache data that changes over time unless you add expiry.",
   "commonMistakes": [
    "Caching functions whose results change over time, such as one that reads the current price, which returns stale data.",
    "Using unbounded `@cache` on unlimited distinct inputs, which grows memory without limit.",
    "Passing a list as an argument; it raises `TypeError: unhashable type`. Use a tuple instead."
   ],
   "sources": [
    {
     "title": "Python docs: functools.cache",
     "url": "https://docs.python.org/3/library/functools.html#functools.cache"
    },
    {
     "title": "Python docs: functools.lru_cache",
     "url": "https://docs.python.org/3/library/functools.html#functools.lru_cache"
    }
   ]
  }
 ],
 "quiz": [
    {
      "question": "Which tool counts how many times each item appears in a list?",
      "options": [
        "deque",
        "defaultdict",
        "ZoneInfo",
        "Counter"
      ],
      "answerIndex": 3,
      "explanation": "collections.Counter tallies occurrences and offers most_common(n)."
    },
    {
      "question": "Why should timestamps be stored in UTC?",
      "options": [
        "UTC datetimes use much less disk space than other timezones",
        "Python cannot store datetimes in any other timezone",
        "It gives one unambiguous reference you convert to local time only for display",
        "Python converts naive datetimes to UTC automatically when saving"
      ],
      "answerIndex": 2,
      "explanation": "A single shared reference avoids ambiguity and daylight-saving bugs; convert with astimezone when showing times to people."
    },
    {
      "question": "With the logging level set to INFO, which message is hidden?",
      "options": [
        "DEBUG",
        "WARNING",
        "ERROR",
        "INFO"
      ],
      "answerIndex": 0,
      "explanation": "DEBUG is below INFO, so it is filtered out; INFO and everything above are shown."
    },
    {
      "question": "In argparse, how do you make an option be read as an integer?",
      "options": [
        "Name the option with an int_ prefix",
        "Pass type=int to add_argument",
        "Use action=\"store_true\"",
        "Set default=\"int\" on add_argument"
      ],
      "answerIndex": 1,
      "explanation": "type=int tells argparse to convert the text to an int; otherwise the value stays a string."
    },
    {
      "question": "What does @cache do when a function is called again with the same argument?",
      "options": [
        "Recomputes the function and compares the two results",
        "Raises an error because the call is a repeat",
        "Deletes the old result and starts over",
        "Returns the remembered result without running the function body"
      ],
      "answerIndex": 3,
      "explanation": "@cache memoises: results are stored per argument set and reused on repeat calls."
    },
    {
      "question": "What does `datetime(2026, 12, 25) - datetime(2026, 12, 20)` give?",
      "options": [
        "A timedelta of 5 days",
        "The plain number 5, with no unit attached",
        "A new datetime in December 2026",
        "A TypeError because dates cannot be subtracted"
      ],
      "answerIndex": 0,
      "explanation": "Subtracting two datetimes gives a timedelta, a duration; here 5 days."
    },
    {
      "question": "What does `@lru_cache(maxsize=2)` do when a third different argument is used?",
      "options": [
        "Raises an error once the cache is full",
        "Stops caching entirely after two results",
        "Drops the least recently used result to make room",
        "Doubles the cache size to hold the new result"
      ],
      "answerIndex": 2,
      "explanation": "lru means least recently used; the oldest unused entry is discarded."
    }
  ]
});
