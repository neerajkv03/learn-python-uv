window.TOPICS = window.TOPICS || [];
window.TOPICS.push({
  "id": "07-collections",
  "order": 7,
  "title": "Collections",
  "version": "Python 3.15.2 + uv 0.13.7",
  "summary": "Collections are containers that hold many values under one name. You will learn lists, tuples, dictionaries, and sets, and how to pick the right one for each job.",
  "prerequisites": ["06-loops"],
  "subtopics": [
    {
      "id": "lists",
      "title": "Lists",
      "explanation": "A list is an ordered group of values written inside square brackets, like [\"write\", \"test\"]. Each value is called an item, and each item has a position number called an index. Indexes start at 0, so the first item is tasks[0]. Just like with strings, you can use negative indexes (tasks[-1] is the last item) and slices (tasks[1:3]) to grab parts of a list.\n\nLists are mutable, which means you can change them after creating them. Useful tools:\n\nappend(x) adds an item to the end.\n\ninsert(i, x) adds an item at position i.\n\nextend(other) adds all items from another list.\n\npop(i) removes and returns the item at position i (the last item if you give no position).\n\nremove(x) deletes the first item equal to x.\n\nlen(tasks) tells you how many items there are, and \"test\" in tasks checks whether a value is present.\n\nTo put a list in order you have two choices. nums.sort() rearranges the list itself and returns nothing (None). sorted(nums) leaves the original alone and gives you a new sorted list. Pick sort() when you no longer need the old order, and sorted() when you do.",
      "analogy": "A shopping list on a whiteboard: the items are in order, and you can add a new line, cross one out, or reorder the lines whenever you like.",
      "code": [
        {
          "language": "python",
          "filename": "lists.py",
          "source": "tasks = [\"write\", \"test\"]\ntasks.append(\"deploy\")\ntasks.insert(0, \"plan\")\nprint(tasks)\ndone = tasks.pop(0)\nprint(done, tasks)\nprint(len(tasks), \"test\" in tasks)\nnums = [3, 1, 2]\nnums.sort()\nprint(nums)",
          "output": "['plan', 'write', 'test', 'deploy']\nplan ['write', 'test', 'deploy']\n3 True\n[1, 2, 3]",
          "explanation": "append puts \"deploy\" at the end, and insert(0, ...) puts \"plan\" at the front. pop(0) removes the first item and hands it back, so done is \"plan\" and the list is now three items long. Finally sort() reorders nums in place, so printing nums shows the sorted list."
        }
      ],
      "productionNote": "Lists are everywhere in real programs: batches of records to process, queues of work waiting to be done, and the rows returned from a database query. Remember that inserting or removing at the front of a very long list is slow, because every other item has to shift.",
      "commonMistakes": [
        "Writing x = nums.sort(). sort() changes the list in place and returns None, so x becomes None. Use nums.sort() on its own line, or x = sorted(nums).",
        "Thinking b = a makes a copy. Both names point at the same list, so a change through one shows up in the other. Use b = a.copy() to get an independent list."
      ],
      "sources": [
        { "title": "Python tutorial: More on lists", "url": "https://docs.python.org/3/tutorial/datastructures.html#more-on-lists" }
      ]
    },
    {
      "id": "tuples",
      "title": "Tuples",
      "explanation": "A tuple is an ordered group of values written in parentheses, like (3, 4). It works like a list for reading: you can index it, slice it, loop over it, and ask for its len. The big difference is that a tuple is immutable, which means it cannot be changed after it is created. Trying point[0] = 1 raises a TypeError (Python's error for using a value of the wrong kind; errors are covered in topic 11).\n\nTuples are a good fit for a small fixed record, such as a coordinate (x, y) or a colour (red, green, blue). You can unpack a tuple, which means copying its items into separate names in one step: x, y = point. Unpacking is also how you receive several values from a function that returns more than one result.\n\nA tuple with one item needs a trailing comma: (5,). Without the comma, (5) is just the number 5 wrapped in harmless parentheses. The comma is what makes a tuple, not the parentheses.",
      "analogy": "A sealed envelope with a fixed set of documents inside: you can read every page, but you cannot swap one out.",
      "code": [
        {
          "language": "python",
          "filename": "tuples.py",
          "source": "point = (3, 4)\nx, y = point\nprint(x, y)\nprint(point[0])\nrgb = (255, 128, 0)\nprint(len(rgb))\nsingle = (5,)\nprint(type(single).__name__)",
          "output": "3 4\n3\n3\ntuple",
          "explanation": "x, y = point unpacks the two items into x and y. point[0] reads the first item, and len(rgb) counts three colour values. Because of the trailing comma, single is a tuple, and type(single).__name__ gives its type's name as text: type() gives a value's kind, and .__name__ gives that kind's name as text."
        }
      ],
      "productionNote": "Functions often return several values as a tuple, and the caller unpacks them. Because tuples cannot change, a tuple of several parts (like (\"user\", 42)) can be used as a dictionary key (dictionaries are covered in the next section), which a list cannot.",
      "commonMistakes": [
        "Writing (5) and expecting a tuple. It is just the int 5. Write (5,) with the comma.",
        "Trying to change an item with point[0] = 1. This raises a TypeError because tuples are immutable. Build a new tuple instead."
      ],
      "sources": [
        { "title": "Python tutorial: Tuples and sequences", "url": "https://docs.python.org/3/tutorial/datastructures.html#tuples-and-sequences" }
      ]
    },
    {
      "id": "dictionaries",
      "title": "Dictionaries",
      "explanation": "A dictionary (dict) stores key-value pairs inside curly braces: {\"name\": \"Ada\"}. You look up a value by its key instead of by a position number. Keys must be unique and unchangeable all the way through, so strings, numbers, and tuples of those work, but lists (and tuples that contain a list) do not. Dictionaries remember the order in which you added keys.\n\nuser[\"name\"] reads a value, but raises a KeyError (Python's error for a missing key) if the key does not exist. user.get(\"phone\", \"n/a\") is the safe version: it returns the default you give (or None if you give none) when the key is missing. You add or update an entry by assignment: user[\"email\"] = \"...\" or user[\"age\"] += 1. Use del user[\"email\"] to remove one.\n\nThe operator in checks keys, not values. The methods .keys(), .values(), and .items() give you the keys, the values, or the (key, value) pairs. Looping with for key, value in user.items() is the usual way to walk through every entry.",
      "analogy": "A phone book: you look up a name (the key) to find a number (the value). You never search by flipping to page 47.",
      "code": [
        {
          "language": "python",
          "filename": "dicts.py",
          "source": "user = {\"name\": \"Ada\", \"age\": 36}\nuser[\"email\"] = \"ada@example.com\"\nuser[\"age\"] += 1\nprint(user[\"name\"], user[\"age\"])\nprint(user.get(\"phone\", \"n/a\"))\nfor key, value in user.items():\n    print(f\"{key}={value}\")",
          "output": "Ada 37\nn/a\nname=Ada\nage=37\nemail=ada@example.com",
          "explanation": "Assigning to a new key adds it, and += 1 updates the existing age from 36 to 37. get(\"phone\", \"n/a\") finds no phone, so it returns the default instead of crashing. The loop prints each pair in insertion order: name, age, then email."
        }
      ],
      "productionNote": "Dictionaries are the shape of JSON data, configuration settings, caches, counters (word counts, event counts), and lookup tables. Prefer .get() when a key may be absent, and d[key] when a missing key would be a real bug you want to hear about.",
      "commonMistakes": [
        "Using d[\"missing\"] and getting a KeyError. Use d.get(\"missing\") or check with \"missing\" in d first.",
        "Using a list as a key. Lists are mutable, so Python refuses (TypeError). Use a tuple instead.",
        "Expecting \"Ada\" in user to search the values. in only checks keys. Use \"Ada\" in user.values() for values."
      ],
      "sources": [
        { "title": "Python tutorial: Dictionaries", "url": "https://docs.python.org/3/tutorial/datastructures.html#dictionaries" },
        { "title": "Python docs: Mapping types (dict)", "url": "https://docs.python.org/3/library/stdtypes.html#mapping-types-dict" }
      ]
    },
    {
      "id": "sets",
      "title": "Sets",
      "explanation": "A set is a collection of unique items with no particular order, written {1, 2}. If you add a value that is already there, nothing changes. This makes sets perfect for removing duplicates: set([\"a\", \"a\", \"b\"]) gives you just a and b. An empty set must be written set(), because {} creates an empty dictionary.\n\nChecking whether something is in a set (x in my_set) is very fast, even with millions of items, because Python does not scan every item. Sets also support maths-style operations: a | b is the union (everything in either), a & b is the intersection (only what both share), and a - b is the difference (in a but not in b).\n\nSets have no reliable order, so printing one directly may show items in a surprising order. When you need stable, readable output, print sorted(my_set), which gives a sorted list.",
      "analogy": "A guest list at a party: each name appears once no matter how many times you write it, and the order of the names does not matter.",
      "code": [
        {
          "language": "python",
          "filename": "sets.py",
          "source": "tags = [\"python\", \"uv\", \"python\", \"web\"]\nunique = set(tags)\nprint(len(unique))\nprint(sorted(unique))\nbackend = {\"python\", \"go\"}\nprint(sorted(unique & backend))\nprint(\"uv\" in unique)",
          "output": "3\n['python', 'uv', 'web']\n['python']\nTrue",
          "explanation": "set(tags) drops the duplicate \"python\", leaving 3 items. sorted() turns the set into a sorted list so the output is predictable. The & operator keeps only what both sets share, which is \"python\". The in check answers True."
        }
      ],
      "productionNote": "Use sets to de-duplicate IDs, to ask quickly \"have we seen this before?\" while processing data, and to compare permission sets (for example, which roles a user has that an action requires).",
      "commonMistakes": [
        "Writing {} to make an empty set. It makes an empty dict. Use set().",
        "Relying on the print order of a set. The order is not guaranteed, so sort it first when order matters."
      ],
      "sources": [
        { "title": "Python tutorial: Sets", "url": "https://docs.python.org/3/tutorial/datastructures.html#sets" }
      ]
    },
    {
      "id": "choosing-the-right-collection",
      "title": "Choosing the right collection",
      "explanation": "Each collection has a job. Use a list when you have an ordered, changeable group where duplicates are fine. Use a tuple for a fixed record whose parts should not change. Use a dict when you need to find a value by a key. Use a set when you only care about uniqueness or whether something is present.\n\nThe choice affects speed. Asking \"is this in the list?\" makes Python check items one by one, so it gets slower as the list grows. Asking the same of a set or a dict is near-instant, no matter how big it is. For a handful of items you will never notice, but with thousands or millions of items it matters a lot.\n\nA common beginner pattern is a list of pairs, like [(\"apple\", 30), (\"banana\", 10)], which you then loop through to find a price. A dict does the same job with one lookup: prices[\"banana\"].",
      "analogy": "A toolbox: you do not use a hammer for screws. Look at the job first, then pick the tool made for it.",
      "code": [
        {
          "language": "python",
          "filename": "choose.py",
          "source": "allowed = {\"admin\", \"editor\"}\nrole = \"editor\"\nprint(role in allowed)\nprices = {\"apple\": 30, \"banana\": 10}\nprint(prices[\"banana\"])\nhistory = [\"login\", \"view\", \"view\"]\nprint(history.count(\"view\"))",
          "output": "True\n10\n2",
          "explanation": "A set of allowed roles answers membership questions fast. A dict maps each fruit to its price for one-step lookup. A list keeps the history in order with duplicates, and count(\"view\") tells how many times \"view\" appears."
        }
      ],
      "productionNote": "Choosing correctly avoids slow code at scale. Turning a big list into a set before many membership checks, or storing records in a dict by ID, can turn a program that crawls into one that is instant.",
      "commonMistakes": [
        "Keeping a list of pairs and looping to find one entry, when a dict would look it up directly.",
        "Using x in big_list repeatedly on huge data. Convert the list to a set once and check against that."
      ],
      "sources": [
        { "title": "Python tutorial: Data structures", "url": "https://docs.python.org/3/tutorial/datastructures.html" },
        { "title": "Python wiki: Time complexity", "url": "https://wiki.python.org/moin/TimeComplexity" }
      ]
    }
  ],
  "quiz": [
    {
      "question": "Which collection removes duplicate values automatically?",
      "options": ["list", "tuple", "set", "dict values"],
      "answerIndex": 2,
      "explanation": "A set only keeps one copy of each value, so duplicates disappear when you build one. Lists and tuples keep every item."
    },
    {
      "question": "What does {} create in Python?",
      "options": ["An empty dictionary", "An empty set", "An empty list", "An empty tuple"],
      "answerIndex": 0,
      "explanation": "Empty curly braces make an empty dict. To make an empty set you must write set()."
    },
    {
      "question": "What does d.get(\"x\", 0) return when the key \"x\" is missing from d?",
      "options": ["It raises a KeyError", "None", "\"x\"", "0"],
      "answerIndex": 3,
      "explanation": "get() returns the default you supply (here 0) instead of raising an error when the key is not found."
    },
    {
      "question": "Why can't a list be used as a dictionary key?",
      "options": ["Lists are too long", "Lists are mutable, so they cannot be used as keys", "Lists can only hold numbers", "Lists are not ordered"],
      "answerIndex": 1,
      "explanation": "Python finds a key using a fixed code computed from the key; a list can change, which would break that code, so lists can't be keys. A tuple is fine."
    },
    {
      "question": "What does this print? nums = [3, 1]; print(nums.sort())",
      "options": ["[1, 3]", "[3, 1]", "None", "An error"],
      "answerIndex": 2,
      "explanation": "sort() sorts the list in place and returns None, so print shows None. Use sorted(nums) if you want a new sorted list back."
    },
    {
      "question": "Which line creates a tuple holding one item?",
      "options": ["(5,)", "(5)", "[5]", "set(5)"],
      "answerIndex": 0,
      "explanation": "The trailing comma is what makes a tuple. (5) is just the number 5 in parentheses."
    },
    {
      "question": "Which collection answers 'is this value present?' fastest when it holds a million items?",
      "options": ["list", "tuple", "a list of pairs", "set"],
      "answerIndex": 3,
      "explanation": "Set (and dict) membership checks are near-instant, while a list checks item by item."
    }
  ]
}
);
