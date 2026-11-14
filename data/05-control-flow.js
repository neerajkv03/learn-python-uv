window.TOPICS = window.TOPICS || [];
window.TOPICS.push({
  "id": "05-control-flow",
  "order": 5,
  "title": "Control Flow",
  "version": "Python 3.15.2 + uv 0.13.7",
  "summary": "Control flow decides which lines of your program run. You will learn to branch with if/elif/else, understand which values count as true or false, pick small values inline with conditional expressions, and take apart structured data with match.",
  "prerequisites": [
    "03-operators-expressions",
    "04-strings"
  ],
  "subtopics": [
    {
      "id": "if-elif-else",
      "title": "if / elif / else",
      "explanation": "Normally Python runs your lines top to bottom, one after another. An `if` statement lets the program choose: it checks a condition (an expression that is either True or False, like `score >= 90`) and runs an indented block of code only when the condition is true.\n\nA block is a group of lines that belong together. In Python a block starts after a line ending with a colon `:` and every line in it is indented by the same amount (the standard is 4 spaces). Indentation is not decoration here: it is how Python knows where the block ends.\n\nYou can chain choices with `elif` (short for \"else if\") and finish with `else`, which catches everything that did not match. Python checks the conditions from top to bottom and runs only the first branch whose condition is true. All the remaining branches are skipped, even if they would also be true. That makes the order of your conditions important: put the narrowest or most specific check first.",
      "analogy": "Think of a road with signposts. You take the first turning that matches your destination and ignore the rest. `else` is the main road you stay on when no signpost applies to you.",
      "code": [
        {
          "language": "python",
          "filename": "grade.py",
          "source": "score = 72\n\nif score >= 90:\n    grade = \"A\"\nelif score >= 70:\n    grade = \"B\"\nelif score >= 50:\n    grade = \"C\"\nelse:\n    grade = \"F\"\n\nprint(grade)",
          "output": "B",
          "explanation": "72 is not >= 90, so the first branch is skipped. 72 >= 70 is true, so grade becomes \"B\" and Python skips the remaining elif and else, even though 72 >= 50 is also true."
        }
      ],
      "productionNote": "if/elif/else is how business rules live in code: validating input, picking a shipping cost by weight band, or deciding which error message to show. Keep each branch short, order bands from the most specific to the most general, and always think about what the final `else` should do for unexpected values.",
      "commonMistakes": [
        "Mixing tabs and spaces or indenting lines unevenly, which raises IndentationError (Python's error for badly lined-up indentation; mixed tabs and spaces show up as TabError, a kind of IndentationError). Configure your editor to insert 4 spaces when you press Tab.",
        "Forgetting the colon at the end of the if, elif, or else line, which raises SyntaxError (Python's error for code that is not written in valid form).",
        "Ordering conditions so a broad one hides a narrow one. With `score >= 50` checked first, a score of 95 would get grade C because that branch matches first and the rest never run."
      ],
      "sources": [
        {
          "title": "Python tutorial: if statements",
          "url": "https://docs.python.org/3/tutorial/controlflow.html#if-statements"
        }
      ]
    },
    {
      "id": "truthiness",
      "title": "Truthiness",
      "explanation": "In a condition, Python does not need an actual True or False. Every value can be treated as true or false, which is called truthiness. You can see how Python judges a value by wrapping it in `bool(...)`, which converts a value into True or False.\n\nThe falsy values (those treated as false) are: `False`, `None` (Python's \"nothing here\" value), the number zero (`0` and `0.0`), the empty string `\"\"`, and empty containers (collections that hold several items) such as `[]`, `{}`, `set()`, and `()` (these are covered in topic 07). Everything else is truthy. Note that the string `\"0\"` and the list `[0]` are truthy, because they are not empty.\n\nThis gives the usual way Python programmers test for emptiness: `if items:` means \"if items is not empty\". It reads naturally and is the style Python programmers expect.",
      "analogy": "A box is \"true\" if it has anything in it and \"false\" if it is empty. It does not matter what is inside, even a box holding a single 0 counts as not empty.",
      "code": [
        {
          "language": "python",
          "filename": "truthy.py",
          "source": "print(bool(0), bool(1))\nprint(bool(\"\"), bool(\"hi\"))\nprint(bool([]), bool([0]))\nprint(bool(None))\n\ncart = []\nif cart:\n    print(\"Checkout\")\nelse:\n    print(\"Cart is empty\")",
          "output": "False True\nFalse True\nFalse True\nFalse\nCart is empty",
          "explanation": "Zero, the empty string, the empty list, and None are falsy. The list [0] is truthy because it contains one item. The empty cart is falsy, so the else branch runs."
        }
      ],
      "productionNote": "Use `if items:` for emptiness checks, but be careful when 0 or an empty string is a legitimate value, such as a quantity of 0 or a discount of 0. In those cases test explicitly with `if value is None:` so a real 0 is not mistaken for missing data.",
      "commonMistakes": [
        "Writing `if count:` when 0 is a valid count, so a real 0 is treated as missing. Use `if count is None:` to test for absence.",
        "Writing `if x == True:`. Just write `if x:`. Comparing to True is redundant and fails for truthy values that are not equal to True, such as the number 2."
      ],
      "sources": [
        {
          "title": "Python docs: Truth value testing",
          "url": "https://docs.python.org/3/library/stdtypes.html#truth-value-testing"
        }
      ]
    },
    {
      "id": "conditional-expressions",
      "title": "Conditional expressions",
      "explanation": "A conditional expression (sometimes called a ternary) is a one-line choice that produces a value. Its shape is `value_if_true if condition else value_if_false`. Python checks the condition in the middle first, then gives back one of the two values.\n\nIt is an expression, meaning it produces a value you can store in a variable, pass to a function, or put inside an f-string. That is the difference from an `if` statement, which only runs code and does not produce a value.\n\nUse it for small, simple choices such as picking a label or a default. If the choice needs several lines or several conditions, a normal if/elif/else is easier to read.",
      "analogy": "\"Tea if it's cold, else juice.\" One question, one answer, and you end up holding exactly one drink.",
      "code": [
        {
          "language": "python",
          "filename": "ternary.py",
          "source": "items = 1\nlabel = \"item\" if items == 1 else \"items\"\nprint(f\"{items} {label}\")\n\nstock = 0\nprint(\"in stock\" if stock else \"sold out\")",
          "output": "1 item\nsold out",
          "explanation": "items == 1 is true, so label is \"item\". stock is 0, which is falsy, so the else value \"sold out\" is chosen and printed."
        }
      ],
      "productionNote": "Conditional expressions are handy for labels, default values, and small inline choices like singular versus plural text. Keep them to one simple condition so the line stays readable in code review.",
      "commonMistakes": [
        "Nesting several conditional expressions in one line. It becomes unreadable; switch to if/elif/else.",
        "Forgetting the `else` part. Unlike an if statement, a conditional expression must always give a value for both cases, so `x if cond` alone is a SyntaxError."
      ],
      "sources": [
        {
          "title": "Python reference: Conditional expressions",
          "url": "https://docs.python.org/3/reference/expressions.html#conditional-expressions"
        }
      ]
    },
    {
      "id": "match-statement",
      "title": "match statement",
      "explanation": "The `match` statement (like a `switch` in some other languages: it picks one branch based on a value) compares one value against a list of patterns written as `case` blocks. The first case that fits wins and the rest are skipped.\n\nThe simplest patterns are a literal (like `200` or `\"quit\"`) and the wildcard `_`, which matches anything. End with `case _:` as a default so unexpected input is handled.\n\nYou can join alternatives with `|` (meaning \"or\"), or use a capture name that grabs the matched value into a variable. A case can also have a guard: an extra `if` condition after the pattern, such as `case code if code >= 500:`. The case matches only when both the pattern fits and the guard is true.\n\nPatterns can also take apart a list: `[\"move\", direction]` matches a two-item list whose first item is \"move\" and stores the second item in `direction`. You can add `as name` to keep the value that matched a sub-pattern.\n\nSo match is more than a switch on constants: it can check the shape of data and unpack it at the same time.",
      "analogy": "Mail sorting. Each letter goes into the first pigeonhole whose label fits its shape, and the last hole labeled \"anything else\" catches the rest.",
      "code": [
        {
          "language": "python",
          "filename": "status.py",
          "source": "status = 404\n\nmatch status:\n    case 200:\n        print(\"OK\")\n    case 404 | 410:\n        print(\"Not found\")\n    case code if code >= 500:\n        print(f\"Server error {code}\")\n    case _:\n        print(\"Other\")",
          "output": "Not found",
          "explanation": "404 does not equal 200, but it matches the OR pattern 404 | 410, so \"Not found\" is printed and the guarded case and the wildcard are never reached."
        },
        {
          "language": "python",
          "filename": "commands.py",
          "source": "command = \"move north\"\n\nmatch command.split():\n    case [\"quit\"]:\n        print(\"Bye\")\n    case [\"move\", (\"north\" | \"south\") as direction]:\n        print(f\"Moving {direction}\")\n    case [\"move\", _]:\n        print(\"Unknown direction\")\n    case _:\n        print(\"Unknown command\")",
          "output": "Moving north",
          "explanation": "command.split() turns the text into the list [\"move\", \"north\"]. The first case needs a one-item list, so it fails. The second case matches: the first item is \"move\" and the second is \"north\", which is saved as direction."
        }
      ],
      "productionNote": "match is a good fit for parsing commands, routing message or event types, and handling HTTP status codes (numbers a web server sends back, such as 404 for not found). Always include `case _:` so unexpected input is handled on purpose instead of silently doing nothing.",
      "commonMistakes": [
        "Using a bare name as a constant, like `case OK:`. A bare name is a capture pattern: it matches anything and assigns it to OK. To compare against a constant, use a literal (like `200`) or a dotted name such as `codes.OK` (a name read from inside another name, here the `OK` value stored in `codes`).",
        "Forgetting `case _:` as the default, so unmatched values fall through with no response.",
        "Putting a catch-all (`case _:` or a bare capture name such as `case other:`) before other cases. Python refuses to run the file and reports a SyntaxError, because the cases after it could never be reached. Always put the catch-all last."
      ],
      "sources": [
        {
          "title": "Python tutorial: match statements",
          "url": "https://docs.python.org/3/tutorial/controlflow.html#match-statements"
        },
        {
          "title": "PEP 636: Structural pattern matching tutorial",
          "url": "https://peps.python.org/pep-0636/"
        }
      ]
    }
  ],
  "quiz": [
    {
      "question": "Which of these values is falsy?",
      "options": [
        "\"0\"",
        "[0]",
        "0",
        "\"False\""
      ],
      "answerIndex": 2,
      "explanation": "The number 0 is falsy. The string \"0\" and the list [0] are non-empty, and \"False\" is a non-empty string, so all three are truthy."
    },
    {
      "question": "With score = 95 and the conditions ordered `score >= 50` first, then `score >= 70`, then `score >= 90`, which branch runs?",
      "options": [
        "The score >= 50 branch",
        "The score >= 90 branch",
        "The score >= 70 branch",
        "All three branches"
      ],
      "answerIndex": 0,
      "explanation": "Python checks from top to bottom and runs only the first true branch. 95 >= 50 is true, so that branch runs and the others are skipped."
    },
    {
      "question": "What does `\"even\" if 7 % 2 == 0 else \"odd\"` produce?",
      "options": [
        "\"even\"",
        "True",
        "None",
        "\"odd\""
      ],
      "answerIndex": 3,
      "explanation": "7 % 2 is 1, so the condition 1 == 0 is false and the else value \"odd\" is the result."
    },
    {
      "question": "What does `case _:` do in a match statement?",
      "options": [
        "It matches any value, so it works as the default case",
        "It raises an error whenever it is reached",
        "It matches only the value None and nothing else",
        "It matches only an empty list and nothing else"
      ],
      "answerIndex": 0,
      "explanation": "The underscore is the wildcard pattern. It matches anything without storing it, so placed last it acts as the default case."
    },
    {
      "question": "Which value does `case [\"move\", direction]:` match?",
      "options": [
        "Any value at all",
        "A list of exactly two items whose first item is \"move\"",
        "Only the text \"move\"",
        "An empty list"
      ],
      "answerIndex": 1,
      "explanation": "The pattern matches a two-item list whose first item is \"move\"; the second item is stored in direction."
    }
  ]
});
