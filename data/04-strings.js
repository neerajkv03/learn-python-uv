window.TOPICS = window.TOPICS || [];
window.TOPICS.push({
  "id": "04-strings",
  "order": 4,
  "title": "Strings in Depth",
  "version": "Python 3.15.2 + uv 0.13.7",
  "summary": "A string (str) is a piece of text. You will learn to pick characters out of it with indexes and slices, clean and transform it with methods, and build messages with f-strings. You will also learn escapes, raw and multiline strings, and why strings never change after they are created.",
  "prerequisites": [
    "02-variables-types",
    "03-operators-expressions"
  ],
  "subtopics": [
    {
      "id": "indexing-and-slicing",
      "title": "Indexing and slicing",
      "explanation": "A string is an ordered row of characters (letters, digits, symbols, spaces). Python numbers each character starting from 0, not 1. In \"Python\", P is at position 0, y at 1, t at 2, and so on. This position number is called an index, and you read a character with square brackets: word[0].\n\nNegative indexes count from the end: -1 is the last character, -2 the one before it. This is handy because you do not need to know the length. If you ask for an index that does not exist, like word[6] on a 6-letter word (valid indexes are 0 to 5), Python raises an IndexError, which is an error message that stops the program.\n\nA slice takes a piece of the string: s[start:stop:step]. It starts at start and stops just before stop, so the stop position is excluded. Any part can be left out: word[2:] means from 2 to the end, word[:3] means from the start up to 3. The step says how many positions to move each time; a step of -1 walks backwards, so word[::-1] reverses the string. Unlike a single index, a slice never raises an error when the numbers are too big, it just gives you what exists (or an empty string).",
      "analogy": "Think of seats in a cinema row, numbered from 0. Index 2 is one seat. A slice is an instruction like \"seats 2 up to, but not including, seat 5\", which gives you seats 2, 3 and 4.",
      "code": [
        {
          "language": "python",
          "filename": "slicing.py",
          "source": "word = \"Python\"\nprint(word[0])\nprint(word[-1])\nprint(word[0:3])\nprint(word[2:])\nprint(word[::-1])\nprint(word[-3:])\nprint(word[10:20] == \"\")",
          "output": "P\nn\nPyt\nthon\nnohtyP\nhon\nTrue",
          "explanation": "word[0] is the first character and word[-1] the last. word[0:3] takes positions 0, 1, 2 (stop 3 is excluded) giving \"Pyt\". word[2:] runs from position 2 to the end. word[::-1] reverses the string. word[-3:] takes the last three characters. The last line shows a slice far outside the string gives an empty string \"\" instead of an error, so the comparison is True."
        }
      ],
      "productionNote": "Slices are used all the time to take the start or end of an ID (for example the first 3 characters as a country code) and to trim fixed-width data such as lines from old file formats. Remember that word[6] on a 6-letter word fails but word[6:] is safely empty.",
      "commonMistakes": [
        "Off-by-one error (landing one position too far or too short) with the stop position: word[0:3] gives 3 characters (positions 0, 1, 2), not 4, because stop is excluded.",
        "Using word[6] on a 6-letter word. The last valid index is 5 (or -1), so this raises IndexError.",
        "Thinking the first character is at index 1. Counting starts at 0."
      ],
      "sources": [
        {
          "title": "Python tutorial: Text (strings)",
          "url": "https://docs.python.org/3/tutorial/introduction.html#text"
        }
      ]
    },
    {
      "id": "common-string-methods",
      "title": "Common string methods",
      "explanation": "A method is a function that belongs to a value and is called with a dot: text.upper(). The value before the dot is the thing the method works on. Strings have dozens of methods; a handful cover most daily work.\n\nCleaning: strip() removes spaces and line breaks (whitespace) from both ends, lower() and upper() change letter case, and title() capitalises each word.\n\nSearching: startswith() and endswith() answer True or False, find() gives the index of the first match (or -1 if not found), and the in operator checks whether a smaller string appears inside a bigger one.\n\nSplitting and joining: split(\"@\") cuts a string at every \"@\" and returns a list (an ordered collection written in square brackets). split() with no argument cuts on any whitespace. The reverse is join: you call it on the separator, not on the list, like \"-\".join([\"2026\", \"11\", \"11\"]). replace(old, new) swaps every occurrence of old for new. None of these change the original string. Each returns a new value: a string, a list (split), a number (find), or True/False (startswith, endswith). Methods that return a string can be chained: raw.strip().lower().",
      "analogy": "A Swiss Army knife: one object with many small tools. The string is the knife, and each method is a blade you fold out with a dot.",
      "code": [
        {
          "language": "python",
          "filename": "methods.py",
          "source": "raw = \"  Alice@Example.COM  \"\nemail = raw.strip().lower()\nprint(email)\nprint(email.split(\"@\"))\nprint(\"-\".join([\"2026\", \"11\", \"11\"]))\nprint(email.replace(\"example\", \"corp\"))\nprint(\"@\" in email, email.endswith(\".com\"))",
          "output": "alice@example.com\n['alice', 'example.com']\n2026-11-11\nalice@corp.com\nTrue True",
          "explanation": "strip() removes the outer spaces and lower() makes everything lowercase, chained in one line. split(\"@\") returns a list of two pieces. join glues the three pieces with \"-\" between them. replace swaps \"example\" for \"corp\" in a new string. The last line prints two True/False answers separated by a space."
        }
      ],
      "productionNote": "Normalise user input (emails, usernames, codes) with strip() and lower() before saving or comparing it, so \"Alice@Example.com \" and \"alice@example.com\" are treated as the same value.",
      "commonMistakes": [
        "Calling s.strip() on its own line and expecting s to change. Strings are not modified; you must use the result: s = s.strip().",
        "Calling join on the list. It must be called on the separator: \"-\".join(items), not items.join(\"-\").",
        "Forgetting the parentheses: s.lower gives the method itself, s.lower() gives the lowercase text."
      ],
      "sources": [
        {
          "title": "Python docs: String methods",
          "url": "https://docs.python.org/3/library/stdtypes.html#string-methods"
        }
      ]
    },
    {
      "id": "f-strings-and-formatting",
      "title": "f-strings and formatting",
      "explanation": "An f-string is a string with an f in front of the opening quote. Anything inside curly braces {} is treated as Python code, evaluated, and inserted into the text: f\"Hello {name}\" with name = \"Ada\" becomes Hello Ada. You can put any expression in the braces, such as {price * 2}.\n\nAfter a colon you can add a format spec, a short code that controls how the value looks. Common ones:\n\n- {price:.2f} means a number with 2 digits after the decimal point.\n- {n:,} adds thousands separators.\n- {ratio:.1%} turns 0.256 into a percentage with one decimal.\n- {name:>6} right-aligns the text in a field 6 characters wide.\n\n- `<` left-aligns and `^` centres, in the same way as `>`.\n- Specs can be combined: {price:,.2f}.\n\nFor a quick way to check a value, {x=} prints both the name and the value, such as x=5.",
      "analogy": "A form letter with blanks. You write the letter once, and the printer fills in the name and amount for each person automatically.",
      "code": [
        {
          "language": "python",
          "filename": "fstrings.py",
          "source": "name = \"Ada\"\nprice = 1234.5\nratio = 0.256\nprint(f\"Hi {name}!\")\nprint(f\"Total: {price:,.2f}\")\nprint(f\"Done: {ratio:.1%}\")\nprint(f\"[{name:>6}]\")\nprint(f\"{price=}\")",
          "output": "Hi Ada!\nTotal: 1,234.50\nDone: 25.6%\n[   Ada]\nprice=1234.5",
          "explanation": "{name} is replaced by Ada. :,.2f adds the comma and rounds to two decimals, so 1234.5 becomes 1,234.50. :.1% multiplies by 100, keeps one decimal and adds the % sign. :>6 pads \"Ada\" with three spaces on the left to width 6. {price=} prints the expression text, an equals sign, and the value."
        }
      ],
      "productionNote": "f-strings are the standard way to build user-facing messages, file names and reports. Never use them to build SQL queries (SQL is the language databases use) with user data inside: that opens the door to SQL injection (an attacker's text becomes part of your command). Use the database library's parameters instead.",
      "commonMistakes": [
        "Forgetting the f prefix: \"Hi {name}\" prints the braces literally.",
        "Building SQL queries with f-strings. Use query parameters to avoid SQL injection.",
        "Writing {price:2f} instead of {price:.2f}. Without the dot, 2 means a minimum width, not the number of decimals."
      ],
      "sources": [
        {
          "title": "Python tutorial: Formatted string literals",
          "url": "https://docs.python.org/3/tutorial/inputoutput.html#formatted-string-literals"
        },
        {
          "title": "Python docs: Format specification mini-language",
          "url": "https://docs.python.org/3/library/string.html#format-specification-mini-language"
        }
      ]
    },
    {
      "id": "escapes-and-multiline-strings",
      "title": "Escapes and multiline strings",
      "explanation": "Some characters are hard to type inside quotes, like a line break. An escape sequence is a backslash followed by a character that stands for one special character: \\n is a new line, \\t is a tab, \\\\ is one backslash, and \\\" is a double quote inside a double-quoted string.\n\nThe backslash can cause trouble, for example in Windows paths: \"C:\\new\" contains \\n, which becomes a line break. A raw string, written with r before the quote (r\"C:\\new\\table\"), treats backslashes as plain characters. Raw strings are also the usual choice for regular expressions (patterns for matching text). One catch: a raw string cannot end with a single backslash.\n\nTriple quotes (\"\"\"...\"\"\") let a string span several lines; the line breaks you type become part of the string. They are used for long text, SQL, and docstrings (the description placed at the start of a function or file).",
      "analogy": "Special codes on a typewriter: one key does not print a letter at all, it means \"go to the next line\". An escape is that special key written as a code. A raw string switches the special keys off, so a backslash prints as itself.",
      "code": [
        {
          "language": "python",
          "filename": "escapes.py",
          "source": "print(\"Name:\\tAda\")\nprint(\"Line1\\nLine2\")\nprint(r\"C:\\new\\table\")\nmsg = \"\"\"Dear user,\nThanks!\"\"\"\nprint(msg)",
          "output": "Name:\tAda\nLine1\nLine2\nC:\\new\\table\nDear user,\nThanks!",
          "explanation": "\\t prints a real tab between Name: and Ada, and \\n splits Line1 and Line2 onto two lines. The raw string keeps its backslashes, so C:\\new\\table prints as typed. The triple-quoted msg contains a real line break, so print shows two lines. The tab in the first output line is a real tab character, shown here as a gap."
        }
      ],
      "productionNote": "Use raw strings for regex patterns and Windows paths in code, and triple quotes for docstrings and multi-line SQL text.",
      "commonMistakes": [
        "Writing \"C:\\new\\table\" in normal quotes: \\n and \\t become a new line and a tab. Use r\"C:\\new\\table\".",
        "Ending a raw string with one backslash, like r\"C:\\folder\\\". This is a syntax error.",
        "Forgetting that triple-quoted strings keep every line break and leading space you type."
      ],
      "sources": [
        {
          "title": "Python reference: String and bytes literals",
          "url": "https://docs.python.org/3/reference/lexical_analysis.html#string-and-bytes-literals"
        }
      ]
    },
    {
      "id": "immutability",
      "title": "Immutability",
      "explanation": "Immutable means cannot be changed after creation. A Python string is immutable: you cannot change a character without making a new string. Writing s[0] = \"J\" raises a TypeError (an error meaning the operation does not fit that type of value).\n\nInstead, you make a new string from pieces of the old one. To change \"python\" into \"Python\" you build \"P\" + name[1:] and store it in a variable. The original string is untouched, which is why every string method returns a new string rather than editing the old one.\n\nBecause new strings are created each time, building a large text with repeated += in a loop does a lot of copying. The standard fix is to collect the pieces in a list and call \"\".join(parts) once at the end, which builds the result in one go.",
      "analogy": "Words carved in stone. You cannot swap one letter in a carved stone; to change it, you carve a new stone and leave the old one as it was.",
      "code": [
        {
          "language": "python",
          "filename": "immutable.py",
          "source": "name = \"python\"\nfixed = \"P\" + name[1:]\nprint(name)\nprint(fixed)\nparts = [\"a\", \"b\", \"c\"]\nprint(\"\".join(parts))",
          "output": "python\nPython\nabc",
          "explanation": "fixed is a new string made from \"P\" plus everything of name from index 1. The original name still prints as python. Joining the list with an empty separator \"\" glues the pieces into abc."
        }
      ],
      "productionNote": "Because strings cannot change, they are safe to share between functions and threads (parts of a program that run at the same time) without anyone altering them by surprise. For building big outputs (reports, or CSV text, which is comma-separated rows of data), append pieces to a list and use join at the end.",
      "commonMistakes": [
        "Trying to assign to an index, like s[0] = \"J\". This raises TypeError; build a new string instead.",
        "Using += repeatedly in a big loop to build text. Collect pieces in a list and use \"\".join(parts).",
        "Expecting a method like s.upper() to change s. It returns a new string that you must store."
      ],
      "sources": [
        {
          "title": "Python docs: Text sequence type (str)",
          "url": "https://docs.python.org/3/library/stdtypes.html#text-sequence-type-str"
        }
      ]
    }
  ],
  "quiz": [
    {
      "question": "What is the value of \"Python\"[1:4]?",
      "options": [
        "\"Pyt\"",
        "\"thon\"",
        "\"yth\"",
        "\"ytho\""
      ],
      "answerIndex": 2,
      "explanation": "The slice starts at index 1 (y) and stops before index 4, so it takes positions 1, 2, 3: y, t, h."
    },
    {
      "question": "After running s = \" hi \" and then s.strip() on its own line, what is s?",
      "options": [
        "\" hi \" (unchanged)",
        "\"hi\" (spaces removed)",
        "\"HI\" (upper-cased)",
        "An error is raised"
      ],
      "answerIndex": 0,
      "explanation": "Strings are immutable and strip() returns a new string. Since the result was not stored, s still holds \" hi \"."
    },
    {
      "question": "What does f\"{3.14159:.2f}\" produce?",
      "options": [
        "3.14159",
        "3.1",
        "3.142",
        "3.14"
      ],
      "answerIndex": 3,
      "explanation": "The spec .2f means a fixed-point number with 2 digits after the decimal point, so 3.14159 is rounded to 3.14."
    },
    {
      "question": "Why would you write r\"C:\\new\" instead of \"C:\\new\"?",
      "options": [
        "It makes the string run faster than a normal one",
        "It stops \\n from being turned into a newline",
        "It converts the whole path to uppercase letters",
        "It lets the string span several lines of text"
      ],
      "answerIndex": 1,
      "explanation": "In a raw string, backslashes are kept as plain characters, so \\n stays as a backslash followed by n instead of becoming a line break."
    },
    {
      "question": "What is `\"Python\"[-1]`?",
      "options": [
        "\"P\"",
        "\"y\"",
        "\"n\"",
        "An IndexError is raised"
      ],
      "answerIndex": 2,
      "explanation": "-1 counts from the end, so it is the last character, which is n."
    },
    {
      "question": "What does `\"a-b-c\".split(\"-\")` give?",
      "options": [
        "['a', 'b', 'c']",
        "'a-b-c'",
        "'abc'",
        "['a-b-c']"
      ],
      "answerIndex": 0,
      "explanation": "split cuts the text at each dash and returns a list (an ordered group of values) of the pieces."
    }
  ]
});
