window.TOPICS = window.TOPICS || [];
window.TOPICS.push({
  "id": "11-error-handling",
  "order": 11,
  "title": "Error Handling",
  "version": "Python 3.15.2 + uv 0.13.7",
  "summary": "Learn what exceptions are, how to read a traceback, and how to handle errors with try, except, else and finally. You will also raise your own exceptions, define custom exception classes, and chain exceptions so the original cause is never lost.",
  "prerequisites": ["10-type-hints"],
  "subtopics": [
    {
      "id": "what-exceptions-are",
      "title": "What exceptions are",
      "explanation": "An exception is Python's way of saying \"something went wrong while the program was running\". For example, asking Python to turn the text \"abc\" into a number cannot work, so Python stops what it is doing and raises (signals) an exception. If nothing handles it, the whole program stops and Python prints a traceback.\n\nA traceback is a report of the chain of function calls that led to the error. Read it from the bottom up: the last line holds the exception type (such as ValueError) and a message explaining the problem. The lines above it show the file, line number and code where it happened, ending with the exact line that failed. Tracebacks are printed to stderr (the error output stream), not stdout (the normal output stream), so they do not appear in a program's regular printed output.\n\nCommon exceptions you will meet:\nValueError: right type, wrong value, like int(\"abc\")\nTypeError: wrong type, like 1 + \"a\"\nKeyError: a dictionary key that does not exist\nIndexError: a list position that does not exist\nZeroDivisionError: dividing by zero\nFileNotFoundError: opening a file that is not there\n\nDo not confuse these with a SyntaxError, which is a typo in the code itself that Python finds before running anything.",
      "analogy": "A smoke alarm: it interrupts everything and tells you which room has the problem.",
      "code": [
        {
          "language": "python",
          "filename": "traceback_demo.py",
          "source": "def to_number(text: str) -> int:\n    return int(text)\n\n\nprint(to_number(\"abc\"))\n",
          "output": "",
          "explanation": "Running this stops with a traceback on stderr, so nothing appears on stdout. The traceback lists the call print(...), then to_number(\"abc\"), then the failing line return int(text). Its last line is: ValueError: invalid literal for int() with base 10: 'abc'. That bottom line names the error type and the bad value. The exact file paths and line numbers shown above it depend on your machine."
        }
      ],
      "productionNote": "Reading tracebacks from logs (the saved record a program writes of its messages and errors) is the first step in debugging production incidents. Always start at the bottom line, then walk upward to find the last line of your own code in the chain.",
      "commonMistakes": [
        "Reading only the top of the traceback; the actual error type and message are at the bottom.",
        "Confusing syntax errors (found before the program runs) with exceptions (raised while it runs)."
      ],
      "sources": [
        { "title": "Python tutorial: Errors and Exceptions", "url": "https://docs.python.org/3/tutorial/errors.html" },
        { "title": "Python docs: Built-in Exceptions", "url": "https://docs.python.org/3/library/exceptions.html" }
      ]
    },
    {
      "id": "try-except-else-finally",
      "title": "try / except / else / finally",
      "explanation": "The try statement lets you run risky code and decide what happens if it fails. Code inside try runs first. If an exception occurs, Python jumps to the matching except block, where \"except SomeError as e\" gives the caught exception the name e. If no exception occurs, the optional else block runs. The optional finally block runs no matter what, which makes it the right place for cleanup such as closing a file.\n\nAlways catch the most specific exception you can. Catching ValueError tells readers exactly what you expect to go wrong, while catching everything can hide genuine bugs. You can list several types in one clause with a tuple, like except (ValueError, TypeError):, or write several except blocks to handle each type differently. Python checks them from top to bottom and uses the first one that matches.\n\nKeep the try block small: only the line or two that can actually fail. Put the code that depends on success in else, so an error there is not accidentally treated as an error from the risky step.",
      "analogy": "A trapeze artist with a safety net (except), a crew that tidies the ring afterwards (finally), and a judge who scores only a routine that finished cleanly (else).",
      "code": [
        {
          "language": "python",
          "filename": "safe_divide.py",
          "source": "def parse_and_divide(a: str, b: str) -> None:\n    try:\n        result = int(a) / int(b)\n    except ValueError:\n        print(\"not a number\")\n    except ZeroDivisionError:\n        print(\"cannot divide by zero\")\n    else:\n        print(f\"result={result}\")\n    finally:\n        print(\"done\")\n\n\nparse_and_divide(\"10\", \"2\")\nparse_and_divide(\"10\", \"0\")\nparse_and_divide(\"x\", \"1\")\n",
          "output": "result=5.0\ndone\ncannot divide by zero\ndone\nnot a number\ndone",
          "explanation": "Call 1: 10 / 2 works, so else prints result=5.0 (the / operator always gives a float), then finally prints done. Call 2: dividing by zero raises ZeroDivisionError, so that handler runs, then finally. Call 3: int(\"x\") raises ValueError before the division, so \"not a number\" is printed, then finally. Notice finally printed done every time."
        }
      ],
      "productionNote": "This pattern handles bad user input, missing files and failed network calls without crashing a whole service. Catch what you can actually recover from, and let everything else travel up to the caller (propagate) so it shows up in logs (the saved record a program writes of its messages and errors).",
      "commonMistakes": [
        "Using a bare except: (an except with no error type) or except Exception: pass, which silently hides real bugs.",
        "Putting too much code inside try, so you cannot tell which line actually failed."
      ],
      "sources": [
        { "title": "Python tutorial: Handling Exceptions", "url": "https://docs.python.org/3/tutorial/errors.html#handling-exceptions" },
        { "title": "Python reference: The try statement", "url": "https://docs.python.org/3/reference/compound_stmts.html#the-try-statement" }
      ]
    },
    {
      "id": "raising-exceptions",
      "title": "Raising exceptions",
      "explanation": "You can signal a problem yourself with the raise statement, for example raise ValueError(\"amount must be positive\"). This immediately stops the current function and hands the exception to whoever called it. The text in parentheses is the message, and it is what the reader sees at the end of a traceback.\n\nValidate inputs at the start of a function and raise right away if they are wrong. This habit is called \"fail fast\": a clear error at the entrance is far easier to debug than a strange result several steps later. Write messages that say what is wrong, and include the bad value when it helps.\n\nInside an except block, a bare raise (with nothing after it) re-raises the exception that is currently being handled. This is useful when you want to log or clean up and then let the error continue upward.",
      "analogy": "A referee blowing the whistle: play stops, and the reason is announced.",
      "code": [
        {
          "language": "python",
          "filename": "withdraw.py",
          "source": "def withdraw(balance: float, amount: float) -> float:\n    if amount <= 0:\n        raise ValueError(\"amount must be positive\")\n    if amount > balance:\n        raise ValueError(\"insufficient funds\")\n    return balance - amount\n\n\nprint(withdraw(100, 30))\ntry:\n    withdraw(100, 500)\nexcept ValueError as e:\n    print(f\"Error: {e}\")\n",
          "output": "70\nError: insufficient funds",
          "explanation": "withdraw(100, 30) passes both checks and returns 100 - 30, which is 70 because both inputs are whole numbers. withdraw(100, 500) fails the second check and raises ValueError(\"insufficient funds\"). The except block catches it, and str(e) is the message, so it prints Error: insufficient funds."
        }
      ],
      "productionNote": "Validate at function and API boundaries so bad data is rejected where it enters, with a message the caller can act on.",
      "commonMistakes": [
        "Returning error codes or strings (like \"error\") instead of raising; callers can silently ignore them.",
        "Writing vague messages such as \"error\" or \"invalid\" that do not say what went wrong."
      ],
      "sources": [
        { "title": "Python tutorial: Raising Exceptions", "url": "https://docs.python.org/3/tutorial/errors.html#raising-exceptions" }
      ]
    },
    {
      "id": "custom-exception-classes",
      "title": "Custom exception classes",
      "explanation": "Built-in exceptions are general. For your own program you can create named errors such as PaymentError or NotFoundError. You do this by writing a class (a blueprint for objects, covered fully in a later topic) that inherits from Exception (takes on everything Exception already does). The one-line pattern is: class PaymentError(Exception): pass, where pass simply means \"nothing more to add\". A docstring (a string on the first line of the class) can serve as the body instead.\n\nExceptions can form families. Define one base error for your app, then write subclasses (new classes that inherit from it) for specific cases. Callers can then catch the specific one (NotFoundError) or the whole family (AppError) with a single except clause.\n\nAlways inherit from Exception, never from BaseException. BaseException also covers things like Ctrl+C (KeyboardInterrupt), and you do not want your code to interfere with those.",
      "analogy": "Hospital colour codes: a specific code tells staff exactly what kind of emergency it is.",
      "code": [
        {
          "language": "python",
          "filename": "custom_errors.py",
          "source": "class AppError(Exception):\n    \"\"\"Base error for this app.\"\"\"\n\n\nclass NotFoundError(AppError):\n    pass\n\n\ndef get_order(order_id: int) -> str:\n    raise NotFoundError(f\"order {order_id} not found\")\n\n\ntry:\n    get_order(42)\nexcept AppError as e:\n    print(type(e).__name__, \"-\", e)\n",
          "output": "NotFoundError - order 42 not found",
          "explanation": "NotFoundError is a kind of AppError, so except AppError catches it. type(e).__name__ gives the class name as text, and print puts a space between each argument, producing NotFoundError - order 42 not found."
        }
      ],
      "productionNote": "Libraries expose one base exception so users can catch everything from that library with a single except clause, while still being able to catch specific cases.",
      "commonMistakes": [
        "Inheriting from BaseException, which makes your error mix with Ctrl+C and exit signals.",
        "Creating dozens of exception types that nobody ever catches separately."
      ],
      "sources": [
        { "title": "Python tutorial: User-defined Exceptions", "url": "https://docs.python.org/3/tutorial/errors.html#user-defined-exceptions" }
      ]
    },
    {
      "id": "exception-chaining",
      "title": "Exception chaining",
      "explanation": "Sometimes a low-level error should be turned into a higher-level one that makes sense for your program. For example, a failed int() conversion becomes a ConfigError. Writing raise NewError(\"...\") from err attaches the original exception to the new one as its __cause__ attribute (a value stored on the exception object).\n\nWhen the traceback is printed, Python shows both: first the original error, then the line \"The above exception was the direct cause of the following exception\", then your new error. Nothing is lost, and the reader sees the full story.\n\nIf you raise a new exception inside an except block without using from, Python still links them, but the traceback says \"During handling of the above exception, another exception occurred\", which looks like a second, unrelated failure. Using from makes your intent clear.",
      "analogy": "A doctor's referral letter: the new diagnosis plus the original test result attached.",
      "code": [
        {
          "language": "python",
          "filename": "chaining.py",
          "source": "class ConfigError(Exception):\n    pass\n\n\ndef load_port(text: str) -> int:\n    try:\n        return int(text)\n    except ValueError as err:\n        raise ConfigError(f\"bad port: {text!r}\") from err\n\n\ntry:\n    load_port(\"eighty\")\nexcept ConfigError as e:\n    print(e)\n    print(type(e.__cause__).__name__)\n",
          "output": "bad port: 'eighty'\nValueError",
          "explanation": "int(\"eighty\") raises ValueError, which is caught as err. We raise ConfigError from it. The !r in the f-string shows the text with quotes ('eighty'). Printing e shows the new message, and e.__cause__ is the original ValueError, whose class name is ValueError."
        }
      ],
      "productionNote": "Code that talks to a database turns its low-level errors into one error type the rest of the app understands, without losing the root cause, so callers get a stable error type while logs still show what really failed.",
      "commonMistakes": [
        "Raising a new error without from, which produces the confusing \"During handling of the above exception...\" message.",
        "Swallowing the original error and raising a new one with the link cut (for example with `from None`), losing the root cause."
      ],
      "sources": [
        { "title": "Python tutorial: Exception Chaining", "url": "https://docs.python.org/3/tutorial/errors.html#exception-chaining" }
      ]
    }
  ],
  "quiz": [
    {
      "question": "When does the else block after a try statement run?",
      "options": [
        "Every time, whether or not an error happened",
        "Only when an exception was raised and handled",
        "Only when try raised no exception",
        "Only when finally is missing"
      ],
      "answerIndex": 2,
      "explanation": "else runs only if the try block completed with no exception. finally is the block that always runs."
    },
    {
      "question": "Why should you avoid writing `except Exception: pass`?",
      "options": [
        "It silently hides real bugs",
        "It is a syntax error",
        "It makes the program run slower",
        "It only works for ValueError"
      ],
      "answerIndex": 0,
      "explanation": "Catching everything and doing nothing swallows errors, including genuine bugs, leaving no trace of what went wrong."
    },
    {
      "question": "What does `raise NewError(\"...\") from err` preserve?",
      "options": [
        "The value of every local variable",
        "Nothing; it only changes the message",
        "The original exception, but only if it is a ValueError",
        "The original error as __cause__"
      ],
      "answerIndex": 3,
      "explanation": "The from clause links the original exception as the new one's __cause__, so the traceback shows both the root cause and the new error."
    },
    {
      "question": "Which exception does `{\"a\": 1}[\"b\"]` raise?",
      "options": [
        "ValueError",
        "KeyError",
        "TypeError",
        "IndexError"
      ],
      "answerIndex": 1,
      "explanation": "Looking up a dictionary key that does not exist raises KeyError. IndexError is for list positions that are out of range."
    },
    {
      "question": "What does raise ValueError(\"bad\") do inside a function?",
      "options": [
        "Stops the function and hands the exception to the caller",
        "Prints bad on the screen and then keeps running the next line",
        "Returns the text bad to the caller as an ordinary string value",
        "Renames the function to ValueError for the rest of the program"
      ],
      "answerIndex": 0,
      "explanation": "raise stops the current function and passes the exception up to whoever called it."
    },
    {
      "question": "Which base class should your own exception class inherit from?",
      "options": [
        "print",
        "KeyboardInterrupt",
        "Exception",
        "str"
      ],
      "answerIndex": 2,
      "explanation": "Inherit from Exception. print is a function and str is the text type, and KeyboardInterrupt is reserved for Ctrl+C."
    }
  ]
}
);
