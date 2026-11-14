window.TOPICS = window.TOPICS || [];
window.TOPICS.push({
  "id": "06-loops",
  "order": 6,
  "title": "Loops",
  "version": "Python 3.15.2 + uv 0.13.7",
  "summary": "Loops let your program repeat work without copy-pasting code. You will learn `for` loops with `range`, `while` loops with a correct stop condition, how to exit or skip with `break` and `continue`, and how `enumerate` and `zip` replace manual counting.",
  "prerequisites": [
    "05-control-flow"
  ],
  "subtopics": [
    {
      "id": "for-loops-and-range",
      "title": "for loops and range",
      "explanation": "A `for` loop repeats an indented block of code once for each item in a collection. One pass through the block is called an iteration. In `for ch in \"abc\":`, the variable `ch` takes the value \"a\" on the first iteration, \"b\" on the second, and \"c\" on the third. A string is a collection of characters, so you can loop over it directly.\n\nWhen you just need to repeat something a number of times, or count through numbers, use `range()`. `range(stop)` counts from 0 up to, but not including, `stop`. `range(start, stop, step)` lets you choose where to begin and how big each jump is. So `range(1, 10, 3)` gives 1, 4, 7. The next value would be 10, which is not less than the stop of 10, so it is excluded.\n\nThe stop value is always excluded. That is why `range(5)` gives 0, 1, 2, 3, 4 (five numbers, but no 5). This feels odd at first, but it means `range(n)` always produces exactly `n` values.\n\nDo not add or remove items from a list while you loop over it. The loop keeps its own position, so changing the list underneath it causes skipped items and confusing bugs. Loop over a copy, or build a new list instead.",
      "analogy": "A teacher calling each name on the attendance register, one by one. The register is the collection, each name called is one iteration, and the teacher stops when the list ends. With `range`, the teacher just counts seats: `range(5)` gives seats 0 to 4, one per iteration.",
      "code": [
        {
          "language": "python",
          "filename": "for_range.py",
          "source": "for ch in \"abc\":\n    print(ch)\n\nfor i in range(1, 10, 3):\n    print(i)\n",
          "output": "a\nb\nc\n1\n4\n7",
          "explanation": "The first loop visits each character of \"abc\". The second counts 1, 4, 7 and stops before 10 because the stop value is excluded."
        }
      ],
      "productionNote": "Real programs use `for` to process each record in a file or each order in a batch. Prefer looping directly over the items (`for order in orders:`) instead of looping over index numbers.",
      "commonMistakes": [
        "Expecting `range(5)` to include 5. It gives 0 to 4.",
        "Modifying a list (adding or removing items) while looping over it, which skips items or behaves unpredictably."
      ],
      "sources": [
        {
          "title": "Python docs: for statements",
          "url": "https://docs.python.org/3/tutorial/controlflow.html#for-statements"
        },
        {
          "title": "Python docs: The range() function",
          "url": "https://docs.python.org/3/tutorial/controlflow.html#the-range-function"
        }
      ]
    },
    {
      "id": "while-loops",
      "title": "while loops",
      "explanation": "A `while` loop repeats its block as long as a condition stays true. Python checks the condition before every iteration (one run through the block). When the condition becomes false, the loop ends and the program continues with the code after it.\n\nBecause the loop only stops when the condition turns false, something inside the block must eventually change the values the condition depends on. In the countdown below, `n -= 1` (subtract 1 from `n`) moves `n` toward 0. If you forget that line, `n > 0` stays true forever and the program never ends. That is called an infinite loop.\n\nIf you ever run a script that seems stuck in an infinite loop, press Ctrl+C in the terminal to stop it.\n\nUse `for` when you have a collection or a known number of repeats. Use `while` when you do not know in advance how many iterations you need, for example, repeating until something succeeds.",
      "analogy": "Keep stirring the soup while it is not boiling. You do not know how many stirs it takes; you just check, stir, check again, and stop once the condition (boiling) is met.",
      "code": [
        {
          "language": "python",
          "filename": "countdown.py",
          "source": "n = 3\nwhile n > 0:\n    print(n)\n    n -= 1\nprint(\"Liftoff!\")\n",
          "output": "3\n2\n1\nLiftoff!",
          "explanation": "n starts at 3 and drops by 1 each iteration. When n reaches 0, `n > 0` is false, the loop ends, and \"Liftoff!\" prints once."
        }
      ],
      "productionNote": "Typical uses are retry loops with a maximum attempt count (so they cannot run forever) and polling, which means checking repeatedly until a job finishes. Always give a `while` loop a guaranteed way to end.",
      "commonMistakes": [
        "Forgetting to update the variable used in the condition, which creates an infinite loop.",
        "Using `while` with a manual counter where a `for` loop over a collection would be shorter and clearer."
      ],
      "sources": [
        {
          "title": "Python reference: The while statement",
          "url": "https://docs.python.org/3/reference/compound_stmts.html#the-while-statement"
        }
      ]
    },
    {
      "id": "break-and-continue",
      "title": "break and continue",
      "explanation": "Sometimes you want to change a loop's normal flow. `break` ends the loop immediately, and the program continues after the loop. `continue` skips the rest of the current iteration and jumps straight to the next one.\n\nIn the example below, even numbers are skipped with `continue`, so the `print` never runs for them. Once `n` is greater than 6, `break` stops the whole loop. That is why 7 is not printed, and 8 and 9 are never reached.\n\nIf loops are nested (one loop inside another), `break` and `continue` affect only the innermost loop they sit in. The outer loop keeps going.\n\nUse these tools sparingly. One or two clear `break` or `continue` lines are fine, but a loop full of them is hard to read.",
      "analogy": "Searching drawers for your keys. `break` is stopping the search the moment you find them. `continue` is skipping a drawer that is locked and moving on to the next one.",
      "code": [
        {
          "language": "python",
          "filename": "break_continue.py",
          "source": "for n in range(1, 10):\n    if n % 2 == 0:\n        continue\n    if n > 6:\n        break\n    print(n)\n",
          "output": "1\n3\n5",
          "explanation": "Even numbers hit `continue` and are skipped. At n = 7 the check `n > 6` is true, so `break` ends the loop. Only 1, 3, 5 are printed."
        }
      ],
      "productionNote": "Use `break` to stop scanning as soon as a match is found, which saves time on large data. Use `continue` to skip invalid rows, for example blank lines in a file, so the rest of the loop body can assume clean data.",
      "commonMistakes": [
        "Thinking `break` exits all nested loops. It only exits the innermost one.",
        "Overusing `continue` so the loop's logic becomes hard to follow."
      ],
      "sources": [
        {
          "title": "Python reference: The break statement",
          "url": "https://docs.python.org/3/reference/simple_stmts.html#the-break-statement"
        },
        {
          "title": "Python reference: The continue statement",
          "url": "https://docs.python.org/3/reference/simple_stmts.html#the-continue-statement"
        }
      ]
    },
    {
      "id": "enumerate-and-zip",
      "title": "enumerate and zip",
      "explanation": "Often you need both the position and the value of each item. `enumerate(items)` hands you pairs of (number, item). By default it counts from 0; `start=1` makes it count from 1, which is friendlier for humans.\n\nIn `for i, name in enumerate(names, start=1):`, the `i, name` part is tuple unpacking. A tuple is a fixed group of values in parentheses, like (1, 'a'), and unpacking means giving each value its own name, so each pair is split into two variables in one step.\n\nWhen you have two related sequences, such as names and scores, `zip(a, b)` walks them side by side and gives you pairs: the first of each, then the second of each, and so on. It stops when the shortest sequence runs out, so extra items in the longer one are silently ignored.\n\nThat silent dropping can hide bugs. If the two sequences should always be the same length, write `zip(a, b, strict=True)`. Then Python raises a `ValueError` when the lengths differ, instead of quietly losing data.\n\nTo see the pairs, wrap zip in `list(...)`, which turns them into a list you can print.\n\nBoth tools replace the older style `for i in range(len(items)):` with `items[i]`, which is longer and easier to get wrong.",
      "analogy": "`enumerate` is handing out numbered race bibs to runners as they line up. `zip` is pairing left and right shoes from two piles, one from each pile at a time.",
      "code": [
        {
          "language": "python",
          "filename": "enum_zip.py",
          "source": "names = [\"Ada\", \"Linus\", \"Grace\"]\nscores = [90, 85, 95]\n\nfor i, name in enumerate(names, start=1):\n    print(i, name)\n\nfor name, score in zip(names, scores):\n    print(f\"{name}: {score}\")\n",
          "output": "1 Ada\n2 Linus\n3 Grace\nAda: 90\nLinus: 85\nGrace: 95",
          "explanation": "The first loop numbers the names starting at 1. The second pairs each name with the score at the same position."
        }
      ],
      "productionNote": "`enumerate` is common for line numbers in error reports (\"bad value on line 12\"). `zip` combines parallel columns of data. Use `strict=True` whenever mismatched lengths would mean a bug.",
      "commonMistakes": [
        "Writing `for i in range(len(items))` instead of using `enumerate`.",
        "Letting `zip` silently drop extra items when lengths differ; use `strict=True` to catch it."
      ],
      "sources": [
        {
          "title": "Python docs: enumerate()",
          "url": "https://docs.python.org/3/library/functions.html#enumerate"
        },
        {
          "title": "Python docs: zip()",
          "url": "https://docs.python.org/3/library/functions.html#zip"
        }
      ]
    }
  ],
  "quiz": [
    {
      "question": "How many times does the body of `for i in range(2, 8, 2)` run?",
      "options": [
        "2",
        "4",
        "3",
        "6"
      ],
      "answerIndex": 2,
      "explanation": "range(2, 8, 2) produces 2, 4, 6. The next value, 8, equals the stop and is excluded, so the loop runs 3 times."
    },
    {
      "question": "What does `continue` do inside a loop?",
      "options": [
        "Skips the rest of the current iteration and moves to the next one",
        "Ends the loop completely and moves on to the code after it",
        "Restarts the loop from the very first item all over again",
        "Does nothing at all; it is just a placeholder for empty code"
      ],
      "answerIndex": 0,
      "explanation": "`continue` jumps to the next iteration. Ending the loop is the job of `break`."
    },
    {
      "question": "What happens if a `while` loop's condition never becomes False?",
      "options": [
        "It runs forever (an infinite loop) until you stop it, for example with Ctrl+C",
        "Python stops it automatically after about 1000 iterations to be safe",
        "It runs exactly once and then the loop ends by itself",
        "Python refuses to start the program and raises a SyntaxError"
      ],
      "answerIndex": 0,
      "explanation": "Python does not limit loop iterations. A condition that never turns false makes an infinite loop that you must interrupt."
    },
    {
      "question": "What is the result of `list(zip([1, 2, 3], \"ab\"))`?",
      "options": [
        "[(1, 'a'), (2, 'b'), (3, None)]",
        "[(1, 'a'), (2, 'b')]",
        "A TypeError is raised",
        "[(1, 'a'), (2, 'b'), (3, 'b')]"
      ],
      "answerIndex": 1,
      "explanation": "zip stops at the shortest input. \"ab\" has 2 characters, so only 2 pairs are produced. An error would only be raised with strict=True."
    },
    {
      "question": "What does `list(enumerate([\"a\", \"b\"]))` return?",
      "options": [
        "[(1, 'a'), (2, 'b')]",
        "['a', 'b']",
        "[('a', 0), ('b', 1)]",
        "[(0, 'a'), (1, 'b')]"
      ],
      "answerIndex": 3,
      "explanation": "enumerate counts from 0 by default and gives (number, item) pairs."
    },
    {
      "question": "Which statement ends a loop immediately?",
      "options": [
        "continue",
        "stop",
        "exit",
        "break"
      ],
      "answerIndex": 3,
      "explanation": "break ends the loop; continue only skips to the next iteration."
    }
  ]
});
