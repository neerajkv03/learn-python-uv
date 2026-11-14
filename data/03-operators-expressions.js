window.TOPICS = window.TOPICS || [];
window.TOPICS.push({
 "id": "03-operators-expressions",
 "order": 3,
 "title": "Operators & Expressions",
 "version": "Python 3.15.2 + uv 0.13.7",
 "summary": "Operators are the symbols that let Python calculate, compare, and decide. You will learn arithmetic, comparisons, logical operators, shortcuts like `+=`, and the order in which Python evaluates a mixed expression.",
 "prerequisites": [
  "02-variables-types"
 ],
 "subtopics": [
  {
   "id": "arithmetic-operators",
   "title": "Arithmetic operators",
   "explanation": "An expression is a piece of code that produces a value, like `7 + 2`. An operator is a symbol that does something with values (`+`, `-`), and an operand is a value the operator works on. In `7 + 2`, the `+` is the operator and 7 and 2 are the operands.\n\nPython has `+` (add), `-` (subtract), `*` (multiply), and `/` (divide). Division with `/` always gives a float (a number with a decimal point), even when the answer is whole: `10 / 2` is `5.0`.\n\nThree more operators are very useful. `//` is floor division: it divides and rounds down to a whole number. `%` is the remainder left over after dividing. `**` raises a number to a power, so `2 ** 10` is 1024.\n\nBe careful with negatives: `//` always rounds toward minus infinity (down), so `-7 // 2` is `-4`, not `-3`.",
   "analogy": "You share 7 sweets among 2 kids. `7 / 2` is 3.5 sweets each if you split exactly, `7 // 2` is the 3 whole sweets each kid gets, and `7 % 2` is the 1 sweet left over.",
   "code": [
    {
     "language": "python",
     "filename": "arithmetic.py",
     "source": "print(7 / 2)\nprint(7 // 2)\nprint(7 % 2)\nprint(2 ** 10)\nprint(-7 // 2)\nprint(10 / 2)",
     "output": "3.5\n3\n1\n1024\n-4\n5.0",
     "explanation": "`/` gives a float, `//` rounds down to a whole number, `%` gives the remainder, and `**` is the power. `-7 // 2` is -3.5 rounded down to -4. `10 / 2` is `5.0`, a float, not `5`."
    }
   ],
   "productionNote": "`% 2 == 0` tests for even numbers. For splitting results into pages, `//` and `%` work like this: with 95 items and 10 per page, `95 // 10` is 9 full pages and `95 % 10` is 5 items left for the last page.",
   "commonMistakes": [
    "Expecting `/` to return an int. It always returns a float.",
    "Thinking `-7 // 2` is -3. Floor division rounds down, so it is -4."
   ],
   "sources": [
    {
     "title": "Python docs: Binary arithmetic operations",
     "url": "https://docs.python.org/3/reference/expressions.html#binary-arithmetic-operations"
    }
   ]
  },
  {
   "id": "comparison-operators",
   "title": "Comparison operators",
   "explanation": "Comparison operators compare two values and give back a bool (a value that is either `True` or `False`). They are `==` (equal), `!=` (not equal), `<`, `>`, `<=`, and `>=`. Strings compare in alphabetical order, so `\"apple\" < \"banana\"` is `True`.\n\nPython lets you chain comparisons: `18 <= age < 65` means \"age is at least 18 and also below 65\". This reads like maths and is cleaner than writing two separate tests.\n\nThe `is` operator is different: it checks whether two names point to the very same thing in memory, not whether they hold equal values. Use `is` only with `None`, `True`, and `False` (for example `value is None`). For numbers and strings, always use `==`.\n\nRemember: a single `=` stores a value in a variable. Two `==` ask a question.",
   "analogy": "A scale at the market tells you if one item is heavier, lighter, or equal to another. Comparison operators give you that same answer for any two values.",
   "code": [
    {
     "language": "python",
     "filename": "compare.py",
     "source": "age = 20\nprint(age >= 18)\nprint(age == 21)\nprint(18 <= age < 65)\nprint(\"apple\" < \"banana\")",
     "output": "True\nFalse\nTrue\nTrue",
     "explanation": "Each line gives a bool. The chained comparison `18 <= age < 65` is true because 20 is at least 18 and less than 65."
    }
   ],
   "productionNote": "Validation rules use comparisons everywhere, for example `0 < quantity <= stock` to check an order amount is positive and no more than what is available.",
   "commonMistakes": [
    "Writing `=` when you mean `==`. In a condition, `=` is a syntax error.",
    "Using `is` to compare numbers or strings. Use `==`; reserve `is` for `None`, `True`, and `False`."
   ],
   "sources": [
    {
     "title": "Python docs: Comparisons",
     "url": "https://docs.python.org/3/reference/expressions.html#comparisons"
    }
   ]
  },
  {
   "id": "logical-operators",
   "title": "Logical operators",
   "explanation": "Logical operators combine bools. `and` is true only if both sides are true. `or` is true if at least one side is true. `not` flips a value: `not True` is `False`.\n\nPython uses the English words, not `&&`, `||`, or `!` as in some other languages.\n\nThey are also short-circuit: Python stops as soon as the answer is known. In `a and b`, if `a` is false the result is already false, so `b` is never evaluated. In `a or b`, if `a` is true, `b` is skipped. This lets you write safe guards such as `count != 0 and 10 / count > 2`: when `count` is 0 the first test is false, so the division (which would raise a `ZeroDivisionError`, an error for dividing by zero) never runs.\n\nA classic trap: `x == 1 or 2` does not mean \"x is 1 or 2\". It means `(x == 1) or 2`, and since `2` is always truthy (counts as true), the whole thing is always truthy. Write `x == 1 or x == 2` instead.",
   "analogy": "To enter a club you need an ID and a ticket (both required: `and`). You can pay with cash or card (either works: `or`). A sign on the door saying NOT MEMBERS ONLY flips the answer: `not` turns a true answer into a false one.",
   "code": [
    {
     "language": "python",
     "filename": "logic.py",
     "source": "has_ticket = True\nhas_id = False\nprint(has_ticket and has_id)\nprint(has_ticket or has_id)\nprint(not has_id)\n\ncount = 0\nprint(count != 0 and 10 / count > 2)",
     "output": "False\nTrue\nTrue\nFalse",
     "explanation": "`and` needs both to be true, so it gives `False`. `or` needs one, so `True`. `not` flips `False` to `True`. In the last line, `count != 0` is false, so `10 / count` is never evaluated and no error occurs."
    }
   ],
   "productionNote": "Permission checks look like `user.is_active and user.is_admin`. Short-circuit guards such as `if count != 0 and total / count > 5` prevent crashes on empty data.",
   "commonMistakes": [
    "Writing `&&` or `||` from other languages. Python uses `and` and `or`.",
    "Writing `x == 1 or 2` instead of `x == 1 or x == 2`. The first is always truthy."
   ],
   "sources": [
    {
     "title": "Python docs: Boolean operations",
     "url": "https://docs.python.org/3/reference/expressions.html#boolean-operations"
    }
   ]
  },
  {
   "id": "augmented-assignment",
   "title": "Augmented assignment",
   "explanation": "Augmented assignment is a shortcut that updates a variable using its own value. `x += 1` means `x = x + 1`. The same pattern works for `-=`, `*=`, `/=`, `//=`, and `%=`.\n\nThe variable must already exist, because Python needs its current value to do the calculation. Using `+=` on a name you never assigned raises a `NameError`.\n\nPython has no `++` or `--` operators. Write `count += 1` instead.",
   "analogy": "A tally counter: you click it to add one instead of erasing and rewriting the whole total each time.",
   "code": [
    {
     "language": "python",
     "filename": "augmented.py",
     "source": "score = 10\nscore += 5\nscore *= 2\nscore -= 1\nprint(score)",
     "output": "29",
     "explanation": "The score goes 10, then 15 after `+= 5`, then 30 after `*= 2`, then 29 after `-= 1`."
    }
   ],
   "productionNote": "Counters and running totals inside loops (`total += price`) are everyday uses of augmented assignment.",
   "commonMistakes": [
    "Writing `score++`. It is a syntax error in Python; use `score += 1`.",
    "Using `+=` on a variable that was never assigned, which raises `NameError`."
   ],
   "sources": [
    {
     "title": "Python docs: Augmented assignment statements",
     "url": "https://docs.python.org/3/reference/simple_stmts.html#augmented-assignment-statements"
    }
   ]
  },
  {
   "id": "operator-precedence",
   "title": "Operator precedence",
   "explanation": "Precedence is the order in which Python evaluates the parts of an expression. From first to last: `**`, then `*` `/` `//` `%`, then `+` `-`, then comparisons, then `not`, then `and`, then `or`.\n\nOperators on the same level are evaluated left to right (except `**`, which goes right to left). Parentheses always override precedence, and they also make code easier to read.\n\nA surprise: `-2 ** 2` is `-4`, because `**` is done first, before the minus sign, so it is read as `-(2 ** 2)`. Likewise `True or False and False` is `True`, because `and` is evaluated before `or`.",
   "analogy": "PEMDAS/BODMAS (the order rules from school maths): brackets first, then powers, then multiply and divide, then add and subtract. Logic words come last, like totalling the sum before deciding what it means: `not` is done first, then `and`, then `or`.",
   "code": [
    {
     "language": "python",
     "filename": "precedence.py",
     "source": "print(2 + 3 * 4)\nprint((2 + 3) * 4)\nprint(-2 ** 2)\nprint(True or False and False)",
     "output": "14\n20\n-4\nTrue",
     "explanation": "Multiplication happens before addition (2 + 12 = 14). Parentheses force the addition first (5 * 4 = 20). `-2 ** 2` is `-(2 ** 2)`. `False and False` is evaluated first, giving `False`, then `True or False` gives `True`."
    }
   ],
   "productionNote": "Teams add parentheses to complex conditions so reviewers do not need to remember the precedence table, for example `(a and b) or c`.",
   "commonMistakes": [
    "Assuming everything is evaluated left to right.",
    "Mixing `and` and `or` without parentheses, which hides the real intent."
   ],
   "sources": [
    {
     "title": "Python docs: Operator precedence",
     "url": "https://docs.python.org/3/reference/expressions.html#operator-precedence"
    }
   ]
  }
 ],
 "quiz": [
  {
   "question": "What does `print(17 % 5)` output?",
   "options": [
    "2",
    "3",
    "3.4",
    "12"
   ],
   "answerIndex": 0,
   "explanation": "`%` gives the remainder. 17 divided by 5 is 3 with 2 left over."
  },
  {
   "question": "What is the type of the result of `10 / 2`?",
   "options": [
    "int (whole number)",
    "str",
    "float",
    "bool (True or False)"
   ],
   "answerIndex": 2,
   "explanation": "True division with `/` always returns a float, so the result is `5.0`."
  },
  {
   "question": "What is the value of `2 + 3 * 2 ** 2`?",
   "options": [
    "14",
    "20",
    "64",
    "10"
   ],
   "answerIndex": 0,
   "explanation": "`**` goes first (2 ** 2 = 4), then `*` (3 * 4 = 12), then `+` (2 + 12 = 14)."
  },
  {
   "question": "Why is `x == 1 or 2` a bug when you want to test whether x is 1 or 2?",
   "options": [
    "`or` cannot be used with numbers",
    "`==` cannot be chained",
    "It is a syntax error",
    "It means `(x == 1) or 2`, and `2` is always truthy"
   ],
   "answerIndex": 3,
   "explanation": "Python reads it as `(x == 1) or 2`. The non-zero number 2 counts as true, so the whole expression is always truthy. Write `x == 1 or x == 2`."
  },
  {
   "question": "After `score = 10` and then `score += 5`, what is `score`?",
   "options": [
    "5",
    "15",
    "50",
    "10"
   ],
   "answerIndex": 1,
   "explanation": "`score += 5` means `score = score + 5`, so 10 + 5 = 15."
  },
  {
   "question": "With `age = 20`, which expression is True?",
   "options": [
    "age == 21",
    "age != 20",
    "age > 30",
    "18 <= age < 65"
   ],
   "answerIndex": 3,
   "explanation": "20 is at least 18 and below 65, so the chained comparison is True; the other three are False."
  }
 ]
});
