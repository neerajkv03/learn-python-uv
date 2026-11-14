window.TOPICS = window.TOPICS || [];
window.TOPICS.push({
  "id": "08-comprehensions-unpacking",
  "order": 8,
  "title": "Comprehensions & Unpacking",
  "version": "Python 3.15.2 + uv 0.13.7",
  "summary": "Learn Python's compact ways to build collections with comprehensions (one-line loop recipes: list, dict and set), process values one at a time with generator expressions (recipes that produce values only when asked), split and merge collections with unpacking, and order data with sorted and a custom sort rule. These tools turn many-line loops into short, readable lines.",
  "prerequisites": ["07-collections"],
  "subtopics": [
    {
      "id": "list-comprehensions",
      "title": "List comprehensions",
      "explanation": "A list comprehension is a one-line recipe for building a new list from an existing collection. The shape is [expression for item in iterable if condition]. An iterable is anything you can loop over, such as a list or a range. Python walks through the iterable, keeps each item that passes the optional if check, computes the expression for it, and collects the results into a new list.\n\nIt does the same job as a for loop that creates an empty list and calls append in each round, but the intent (\"make a list of these\") is visible at a glance. The original list is never changed; you always get a brand new list.\n\nThe if part is optional. Without it, every item is transformed. With it, items that fail the check are skipped. In real code you use comprehensions to pull fields out of records or to filter results, for example [u.email for u in users] to collect every user's email address.",
      "analogy": "A factory conveyor belt: each item rolls past a quality check (the if), and the ones that pass get stamped by a machine (the expression) before landing in the output box (the new list).",
      "code": [
        {
          "language": "python",
          "filename": "list_comp.py",
          "source": "nums = [1, 2, 3, 4, 5, 6]\nsquares = [n * n for n in nums]\nevens = [n for n in nums if n % 2 == 0]\nprint(squares)\nprint(evens)",
          "output": "[1, 4, 9, 16, 25, 36]\n[2, 4, 6]",
          "explanation": "squares transforms every number by multiplying it with itself. evens has no transformation (the expression is just n) but keeps only numbers whose remainder when divided by 2 is 0. nums itself stays unchanged."
        }
      ],
      "productionNote": "Comprehensions are the everyday way to reshape data: extracting one field from many records, cleaning up input, or filtering results from a query. If the logic needs more than one condition or a nested loop, switch to a normal for loop for readability.",
      "commonMistakes": [
        "Cramming complex logic or deep nesting into one comprehension so nobody can read it. If it does not fit comfortably on one line, use a regular loop.",
        "Using a comprehension only for side effects (an action such as printing, instead of building a value), like [print(n) for n in nums]. This builds a useless list; use a plain for loop instead."
      ],
      "sources": [
        { "title": "Python tutorial: List comprehensions", "url": "https://docs.python.org/3/tutorial/datastructures.html#list-comprehensions" }
      ]
    },
    {
      "id": "dict-and-set-comprehensions",
      "title": "Dict and set comprehensions",
      "explanation": "The same idea works for dictionaries and sets, just with curly braces. A dict comprehension looks like {key: value for item in iterable}. A set comprehension looks like {x for item in iterable}. A dictionary stores key-value pairs; a set stores unique values with no duplicates (both were covered in the collections topic).\n\nThe only difference between the two is the colon: if the braces contain key: value, you get a dictionary; if they contain a single expression, you get a set. An empty {} is always a dictionary, not a set.\n\nBecause keys in a dictionary and items in a set must be unique, repeated ones are collapsed. In a dict comprehension, a later duplicate key silently overwrites the earlier one. Sets have no reliable order, so when you print one, sort it first to get predictable output.",
      "analogy": "Building an index card box from a pile of notes in one pass: each note becomes a card filed under its label (dict), or you just jot down each distinct label once (set).",
      "code": [
        {
          "language": "python",
          "filename": "dict_set_comp.py",
          "source": "words = [\"apple\", \"kiwi\", \"banana\", \"kiwi\"]\nlengths = {w: len(w) for w in words}\nprint(lengths)\nfirst_letters = {w[0] for w in words}\nprint(sorted(first_letters))",
          "output": "{'apple': 5, 'kiwi': 4, 'banana': 6}\n['a', 'b', 'k']",
          "explanation": "lengths maps each word to its length; the second \"kiwi\" overwrites the first with the same value, so there is only one entry. first_letters collects the first character of each word (w[0]) into a set, and sorted turns it into a predictable list."
        }
      ],
      "productionNote": "A dict comprehension is the standard way to build a lookup table, for example {u.id: u for u in users}, so you can find a record by its ID instantly instead of searching a list each time.",
      "commonMistakes": [
        "Forgetting that duplicate keys silently overwrite earlier ones, so data can vanish without any error.",
        "Confusing {x for ...} (a set) with a dictionary, or writing {} and expecting an empty set. Use set() for an empty set."
      ],
      "sources": [
        { "title": "Python tutorial: Dictionaries", "url": "https://docs.python.org/3/tutorial/datastructures.html#dictionaries" },
        { "title": "Python tutorial: Sets", "url": "https://docs.python.org/3/tutorial/datastructures.html#sets" }
      ]
    },
    {
      "id": "generator-expressions",
      "title": "Generator expressions",
      "explanation": "A generator expression looks like a list comprehension but uses round brackets: (expr for x in items). Instead of building the whole list in memory, it produces values one at a time, only when something asks for the next one. This is called lazy evaluation: work is done on demand.\n\nFunctions that consume a sequence of values, such as sum, any, all, max and min, work directly with a generator expression. When it is the only argument, you can drop the extra brackets: sum(p for p in prices). any stops as soon as it finds a True value, and all stops as soon as it finds a False one, so they can even finish early.\n\nThe trade-off is that a generator can be read only once. After it has been consumed, it is empty. If you need to loop over the results several times, or need the length or indexing, build a list instead.",
      "analogy": "A tap versus a bucket: a generator gives you water as you need it, while a list fills the whole bucket first, even if you only wanted a sip.",
      "code": [
        {
          "language": "python",
          "filename": "genexpr.py",
          "source": "prices = [120, 45, 300, 80]\nprint(sum(p for p in prices if p > 50))\nprint(any(p > 250 for p in prices))\nprint(all(p > 0 for p in prices))\nprint(max(len(str(p)) for p in prices))",
          "output": "500\nTrue\nTrue\n3",
          "explanation": "sum adds only prices above 50: 120 + 300 + 80 = 500. any is True because 300 is above 250. all is True because every price is positive. The last line converts each price to text, measures its length (3, 2, 3, 2), and max picks 3."
        }
      ],
      "productionNote": "Generator expressions let you aggregate over huge files or database cursors (objects that hand back query results row by row) without loading everything into memory at once. Memory use stays small no matter how much data there is.",
      "commonMistakes": [
        "Trying to reuse a generator: after one full pass it is empty, so a second loop or sum gives nothing (or 0).",
        "Writing sum([p for p in prices]) with square brackets, which builds an unneeded temporary list. Drop the brackets."
      ],
      "sources": [
        { "title": "Python reference: Generator expressions", "url": "https://docs.python.org/3/reference/expressions.html#generator-expressions" },
        { "title": "Python docs: any()", "url": "https://docs.python.org/3/library/functions.html#any" }
      ]
    },
    {
      "id": "unpacking-and-star-unpacking",
      "title": "Unpacking and star-unpacking",
      "explanation": "Unpacking means assigning the items of a collection to several names in one statement. a, b = 1, 2 gives a the value 1 and b the value 2. The same trick swaps two values without a temporary variable: a, b = b, a. The number of names on the left must equal the number of items on the right.\n\nPut a star in front of one name to let it soak up all the leftover items as a list: first, *rest = [10, 20, 30] gives first = 10 and rest = [20, 30]. The star also works the other way, spreading a list into a new one: [*rest, 40] is [20, 30, 40].\n\nFor dictionaries, ** spreads key-value pairs into another dictionary: {**defaults, \"port\": 9000} copies defaults and then sets port. When the same key appears more than once, the later one wins. Python also offers the | operator to merge two dictionaries (defaults | overrides), with the same later-wins rule.",
      "analogy": "Unpacking a suitcase: the shirts go in one drawer by themselves, and everything else goes into one pile. Merging dictionaries is like laying a sheet of overrides on top of a sheet of defaults: wherever the top sheet has writing, it hides what is below.",
      "code": [
        {
          "language": "python",
          "filename": "unpack.py",
          "source": "a, b = 1, 2\na, b = b, a\nprint(a, b)\nfirst, *rest = [10, 20, 30]\nprint(first, rest)\ncombined = [*rest, 40]\nprint(combined)\ndefaults = {\"debug\": False, \"port\": 8000}\nconfig = {**defaults, \"port\": 9000}\nprint(config)",
          "output": "2 1\n10 [20, 30]\n[20, 30, 40]\n{'debug': False, 'port': 9000}",
          "explanation": "After the swap a is 2 and b is 1. first takes 10 and rest collects [20, 30]. combined spreads rest and adds 40. In config, **defaults copies both entries first, then \"port\": 9000 replaces the old port, so the later value wins."
        }
      ],
      "productionNote": "Dictionary merging is the standard way to layer configuration: built-in defaults, then a config file, then command-line overrides. Star-unpacking is handy for splitting a header row from data rows: header, *rows = lines.",
      "commonMistakes": [
        "Getting ValueError (Python's error for a value of the right type but the wrong content or amount; see topic 11): too many values to unpack (or not enough values) because the number of names does not match the number of items and no star name was used.",
        "Getting the merge order wrong: in {**a, **b}, values from b override a, not the other way around."
      ],
      "sources": [
        { "title": "Python tutorial: Tuples and sequences", "url": "https://docs.python.org/3/tutorial/datastructures.html#tuples-and-sequences" },
        { "title": "PEP 3132: Extended iterable unpacking", "url": "https://peps.python.org/pep-3132/" },
        { "title": "PEP 448: Additional unpacking generalizations", "url": "https://peps.python.org/pep-0448/" }
      ]
    },
    {
      "id": "sorting-with-key-functions",
      "title": "Sorting with key functions",
      "explanation": "The built-in sorted(items) returns a new sorted list and leaves the original untouched. By default, text is ordered by character code, so all uppercase letters come before lowercase ones: \"Alice\" and \"Carol\" sort before \"bob\".\n\nThe key argument lets you choose what to sort by. It is a function that Python calls once on each item, and the results decide the order. Examples are len (sort by length) or str.lower (ignore letter case). Pass the function itself, without parentheses. Adding reverse=True flips the order to descending.\n\nSorting is stable: items that compare equal keep their original relative order. For quick one-off keys you can write a lambda, a tiny unnamed function: lambda p: p[1] means \"given p, return its item at position 1\". Lambdas are covered fully in the next topic.",
      "analogy": "Sorting students by height instead of by name: the line-up is the same people, but you choose what to measure.",
      "code": [
        {
          "language": "python",
          "filename": "sorting.py",
          "source": "names = [\"bob\", \"Alice\", \"Carol\"]\nprint(sorted(names))\nprint(sorted(names, key=str.lower))\npeople = [(\"Ada\", 36), (\"Linus\", 28), (\"Grace\", 45)]\nprint(sorted(people, key=lambda p: p[1], reverse=True))",
          "output": "['Alice', 'Carol', 'bob']\n['Alice', 'bob', 'Carol']\n[('Grace', 45), ('Ada', 36), ('Linus', 28)]",
          "explanation": "The plain sort puts uppercase first. With key=str.lower, each name is compared in lowercase, giving a human-friendly alphabetical order. The last line sorts the (name, age) pairs by age, oldest first."
        }
      ],
      "productionNote": "Use sorted with a key to order results by date, price or name before displaying them. Because sorted returns a new list, the original data stays available for other uses.",
      "commonMistakes": [
        "Calling the key function by writing key=len() instead of key=len. The key must be the function itself, not its result.",
        "Expecting sorted(items) to change items in place. It returns a new list, so you must use the return value."
      ],
      "sources": [
        { "title": "Python HOWTO: Sorting", "url": "https://docs.python.org/3/howto/sorting.html" },
        { "title": "Python docs: sorted()", "url": "https://docs.python.org/3/library/functions.html#sorted" }
      ]
    }
  ],
  "quiz": [
    {
      "question": "What does [x * 2 for x in range(3)] produce?",
      "options": ["[0, 1, 2]", "[2, 4, 6]", "[0, 2, 4]", "[0, 2, 4, 6]"],
      "answerIndex": 2,
      "explanation": "range(3) yields 0, 1, 2. Doubling each gives 0, 2, 4, so the result is [0, 2, 4]."
    },
    {
      "question": "Why is sum(p for p in prices) usually better than sum([p for p in prices]) on big data?",
      "options": [
        "It avoids building a temporary list, so it uses less memory",
        "It runs the loop in parallel on several processors at once",
        "It sorts all the prices first, before adding them",
        "It lets you reuse the values afterwards as often as you like"
      ],
      "answerIndex": 0,
      "explanation": "A generator expression produces values one at a time, so sum never needs the whole list in memory."
    },
    {
      "question": "After first, *rest = [1, 2, 3], what is rest?",
      "options": ["2", "(2, 3)", "[1, 2, 3]", "[2, 3]"],
      "answerIndex": 3,
      "explanation": "first takes 1, and the starred name collects everything left over as a list: [2, 3]."
    },
    {
      "question": "What does {**{\"a\": 1}, **{\"a\": 2}} give?",
      "options": ["{'a': 1}", "{'a': 2}", "{'a': 3}", "{'a': [1, 2]}"],
      "answerIndex": 1,
      "explanation": "When keys repeat in a ** merge, the later value wins, so 'a' ends up as 2."
    },
    {
      "question": "How many items does {w[0] for w in ['ant', 'bee', 'ape']} contain?",
      "options": ["1", "2", "3", "It raises an error"],
      "answerIndex": 1,
      "explanation": "The first letters are a, b, a. A set keeps one copy of each, so it holds 2."
    },
    {
      "question": "What does sorted(['bob', 'Alice', 'Carol'], key=str.lower) return?",
      "options": ["['Alice', 'bob', 'Carol']", "['Alice', 'Carol', 'bob']", "['bob', 'Alice', 'Carol']", "['Carol', 'bob', 'Alice']"],
      "answerIndex": 0,
      "explanation": "key=str.lower compares names ignoring case: alice, bob, carol."
    }
  ]
}
);
