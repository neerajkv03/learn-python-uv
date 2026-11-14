window.TOPICS = window.TOPICS || [];
window.TOPICS.push({
  "id": "16-dataclasses-enums",
  "order": 16,
  "title": "Dataclasses & Enums",
  "version": "Python 3.15.2 + uv 0.13.7",
  "summary": "Dataclasses let you define classes that mostly hold data without writing the repetitive setup code by hand. Enums let you name a fixed set of choices, such as order states, so you stop passing around easy-to-misspell strings. Together they make your data models short, readable and safe.",
  "prerequisites": ["15-classes-objects"],
  "subtopics": [
    {
      "id": "dataclass-basics",
      "title": "@dataclass basics",
      "explanation": "In the previous topic you wrote classes with an `__init__` method (the setup method that runs when you create an object) and maybe a `__repr__` (the method that decides how an object prints). For classes that mostly just hold data, that is a lot of repeated typing. The `@dataclass` decorator removes it. A decorator is a label written above a class or function that adds behaviour to it; you will learn how they work in topic 18, for now just use it.\n\nYou list the fields as type-annotated names inside the class body, like `x: float`. A field is one named piece of data stored on each object. Python then generates `__init__`, `__repr__` and `__eq__` (the method behind `==`) for you. The generated `__repr__` prints the class name and every field, such as `Point(x=1.5, y=2)`, and `==` compares two objects field by field instead of asking whether they are the exact same object.\n\nOnly names that have a type annotation become fields. The annotation is not enforced at run time, so `Point(1.5, 2)` is fine even though `y` is declared `float` and received an int `2`; tools such as type checkers use the hints, Python itself does not check them here.\n\nUse dataclasses for DTOs (data transfer objects: simple containers that carry data between parts of a program), configuration objects, and records you read from files or APIs.",
      "analogy": "A pre-printed form: you only list the field names (name, address, phone), and the printer produces the whole form for you, including the layout and the comparison rules, instead of you drawing it by hand each time.",
      "code": [
        {
          "language": "python",
          "filename": "point.py",
          "source": "from dataclasses import dataclass\n\n\n@dataclass\nclass Point:\n    x: float\n    y: float\n\n\np = Point(1.5, 2)\nprint(p)\nprint(p == Point(1.5, 2))\nprint(p.x + p.y)\n",
          "output": "Point(x=1.5, y=2)\nTrue\n3.5",
          "explanation": "No `__init__` was written, yet `Point(1.5, 2)` works. `print(p)` uses the generated `__repr__`, and `==` compares the fields, so two separate Point objects with equal values are equal. The annotation says `float` but the int `2` is kept as-is, which is why it prints as `2`, not `2.0`."
        }
      ],
      "productionNote": "Prefer a dataclass over a hand-written class (or a bare dict) whenever you pass around a bundle of related values, such as a config, a row from a file, or an API response. The generated repr makes logs and debugging output readable for free.",
      "commonMistakes": [
        "Forgetting the type annotation: writing `x = 0` instead of `x: int = 0` makes a plain class attribute, not a field, so it is left out of `__init__`, `__repr__` and `__eq__`.",
        "Putting a field without a default after a field with a default (for example `a: int = 1` then `b: int`). Python raises a TypeError because the generated `__init__` could not accept the arguments in that order.",
        "Assuming the annotations are checked at run time. `Point(\"a\", \"b\")` is accepted by Python; only a type checker would complain."
      ],
      "sources": [
        { "title": "Python docs: dataclasses", "url": "https://docs.python.org/3/library/dataclasses.html" }
      ]
    },
    {
      "id": "defaults-and-field",
      "title": "Defaults and field()",
      "explanation": "A field can have a simple default value, like `priority: int = 1`. If the caller does not pass it, the default is used. Fields with defaults must come after fields without defaults, because the generated `__init__` takes them in the order you declared them.\n\nMutable values such as lists, dicts and sets need special care. A mutable value is one that can be changed in place. If you wrote `items: list[str] = []`, every object would share that one list, so Python refuses and raises a ValueError when the class is created. Instead, use `field(default_factory=list)`. A default factory is a function that is called once per new object to build a fresh default.\n\n`field()` takes other options too. `field(repr=False)` leaves a field out of the printed repr, which is useful for secrets such as API keys or passwords, so they do not leak into logs. You can combine it with `default=...`, as in `field(default=\"\", repr=False)`.\n\nIn the example, `a.items.append(\"pen\")` changes only Ada's list. Bo's order still has its own empty list.",
      "analogy": "Each new customer gets a fresh, empty shopping basket at the door, not one shared basket that everyone keeps adding to.",
      "code": [
        {
          "language": "python",
          "filename": "order.py",
          "source": "from dataclasses import dataclass, field\n\n\n@dataclass\nclass Order:\n    customer: str\n    items: list[str] = field(default_factory=list)\n    priority: int = 1\n    api_key: str = field(default=\"\", repr=False)\n\n\na = Order(\"Ada\")\nb = Order(\"Bo\", priority=2)\na.items.append(\"pen\")\nprint(a)\nprint(b)\n",
          "output": "Order(customer='Ada', items=['pen'], priority=1)\nOrder(customer='Bo', items=[], priority=2)",
          "explanation": "Each Order gets its own list from `default_factory=list`, so adding \"pen\" to Ada's order does not touch Bo's. The `api_key` field exists and can be set, but `repr=False` keeps it out of the printed text."
        }
      ],
      "productionNote": "Use `repr=False` on tokens, passwords and other secrets so they never appear in logs or error messages. Use `default_factory` for every list, dict or set default to avoid data leaking between objects.",
      "commonMistakes": [
        "Writing `items: list[str] = []`. Python raises a ValueError (mutable default) when the class is defined; use `field(default_factory=list)`.",
        "Placing a required field after a defaulted one, which raises a TypeError.",
        "Assuming `repr=False` encrypts or protects the value. It only hides it from the repr; the value is still stored and readable on the object."
      ],
      "sources": [
        { "title": "Python docs: dataclasses.field", "url": "https://docs.python.org/3/library/dataclasses.html#dataclasses.field" },
        { "title": "Python docs: Mutable default values", "url": "https://docs.python.org/3/library/dataclasses.html#mutable-default-values" }
      ]
    },
    {
      "id": "frozen-dataclasses",
      "title": "Frozen dataclasses",
      "explanation": "Sometimes an object should never change after it is created, like an amount of money or a pair of coordinates. `@dataclass(frozen=True)` makes instances read-only: assigning to a field raises `FrozenInstanceError`. Frozen dataclasses also become hashable, which means Python can compute a fixed number for them, so they can be used as dict keys and stored in sets.\n\nTo get a changed version, use `dataclasses.replace(obj, field=new_value)`. It builds a new object copying all fields from the old one, except the ones you override. The original stays untouched.\n\nYou can add `slots=True` too. Normally each object keeps its attributes in a flexible internal dictionary. With slots, Python reserves fixed storage for just the declared fields, which uses less memory and also blocks typos: assigning to a name that is not a field raises an error instead of silently creating a new attribute.\n\nIn the example, `Money(500, \"INR\")` created twice gives two equal objects with equal hashes, so the set keeps only one of them.",
      "analogy": "A printed receipt: you cannot edit it once printed. To change something, you print a new receipt and keep the old one as it was.",
      "code": [
        {
          "language": "python",
          "filename": "money.py",
          "source": "from dataclasses import dataclass, replace, FrozenInstanceError\n\n\n@dataclass(frozen=True, slots=True)\nclass Money:\n    amount: int\n    currency: str\n\n\nprice = Money(500, \"INR\")\ndiscounted = replace(price, amount=450)\nprint(price, discounted)\n\ntry:\n    price.amount = 1\nexcept FrozenInstanceError:\n    print(\"cannot modify\")\n\nprint(len({price, Money(500, \"INR\")}))\n",
          "output": "Money(amount=500, currency='INR') Money(amount=450, currency='INR')\ncannot modify\n1",
          "explanation": "`replace` returns a new Money with the amount changed while `price` stays at 500. The assignment is blocked with FrozenInstanceError, which we catch with try/except. Because the class is frozen it is hashable, and two equal Money objects collapse into one set entry, so the length is 1."
        }
      ],
      "productionNote": "Use frozen dataclasses for value objects (money, coordinates, IDs) and for configuration that must not change after startup. Immutable objects are safe to share between parts of a program and safe to use as cache or dict keys.",
      "commonMistakes": [
        "Expecting `frozen=True` to make nested containers immutable. A frozen field holding a list can still have that list modified with `.append()`; only re-assigning the field is blocked.",
        "Trying to set attributes inside `__post_init__` (a method dataclasses call right after the generated `__init__`) of a frozen class with a normal assignment, which raises FrozenInstanceError. Set up derived values another way, or compute them before creating the object.",
        "Mutating a frozen object and expecting it to work like a normal one; use `replace()` to get a changed copy instead."
      ],
      "sources": [
        { "title": "Python docs: Frozen instances", "url": "https://docs.python.org/3/library/dataclasses.html#frozen-instances" },
        { "title": "Python docs: dataclasses.replace", "url": "https://docs.python.org/3/library/dataclasses.html#dataclasses.replace" }
      ]
    },
    {
      "id": "enum",
      "title": "Enum",
      "explanation": "An enum (short for enumeration) defines a fixed set of named constants. You subclass `Enum` and list the members (the named values inside the enum): `class Color(Enum): RED = 1`. Each member has a `.name` (`\"RED\"`) and a `.value` (`1`). You can look a member up by value with `Color(2)` or by name with `Color[\"GREEN\"]`, and you can loop over all members with `for c in Color`.\n\nA plain `Enum` member is not equal to its raw value, so `Color.RED == 1` is False. This is deliberate: it stops you mixing up unrelated numbers. When you want members that also behave as strings, use `StrEnum`. Its members are real strings, so `Status.PENDING == \"pending\"` is True, and printing a member shows just the value. That makes it a good fit for JSON and databases.\n\n`auto()` assigns values for you so you do not have to number them. In a `StrEnum`, `auto()` uses the lowercase member name, so `SHIPPED = auto()` gets the value `\"shipped\"`.\n\nEnums replace \"magic strings\": loose text values scattered through code that break silently when misspelt. With an enum, a typo like `Status.SHIPED` fails immediately with an AttributeError (Python's error for asking an object for a name it does not have).",
      "analogy": "A traffic light: only red, amber and green exist. Nothing else is allowed, and everyone agrees on the names.",
      "code": [
        {
          "language": "python",
          "filename": "status.py",
          "source": "from enum import Enum, StrEnum, auto\n\n\nclass Color(Enum):\n    RED = 1\n    GREEN = 2\n\n\nclass Status(StrEnum):\n    PENDING = auto()\n    SHIPPED = auto()\n\n\nprint(Color.RED, Color.RED.name, Color.RED.value)\nprint(Color(2))\nprint(Status.SHIPPED)\nprint(Status.PENDING == \"pending\")\nprint([s.value for s in Status])\n",
          "output": "Color.RED RED 1\nColor.GREEN\nshipped\nTrue\n['pending', 'shipped']",
          "explanation": "Printing a plain Enum member shows `Color.RED`; `.name` and `.value` give its parts, and `Color(2)` finds the member with value 2. The StrEnum members got the values \"pending\" and \"shipped\" from `auto()`, print as the plain string, and compare equal to ordinary strings. The list comprehension loops over every member in definition order."
        }
      ],
      "productionNote": "Use enums for order states, user roles and similar closed sets of choices. Prefer `StrEnum` when the value is stored or sent as text (JSON, database columns), and combine enums with dataclass fields, such as `status: Status = Status.PENDING`, for self-documenting records.",
      "commonMistakes": [
        "Comparing a plain Enum member to its raw value: `Color.RED == 1` is False. Compare to the member (`Color.RED`) or use `.value` explicitly.",
        "Using bare strings like \"shiped\" instead of enum members, so a typo goes unnoticed until something misbehaves.",
        "Writing the same value for two different names expecting two separate members; the second becomes an alias (a second name for the same member) of the first."
      ],
      "sources": [
        { "title": "Python docs: enum", "url": "https://docs.python.org/3/library/enum.html" },
        { "title": "Python docs: Enum HOWTO", "url": "https://docs.python.org/3/howto/enum.html" }
      ]
    }
  ],
  "quiz": [
    {
      "question": "Which methods does `@dataclass` generate by default?",
      "options": ["__init__, __repr__ and __eq__", "__str__, __len__ and __iter__", "__init__ and __hash__ only", "__add__, __sub__ and __eq__"],
      "answerIndex": 0,
      "explanation": "By default @dataclass generates __init__, __repr__ and __eq__ from the annotated fields."
    },
    {
      "question": "What is the correct way to give a dataclass field an empty-list default?",
      "options": ["items: list[str] = []", "items: list[str] = 'empty'","items: list[str] = field(default_factory=list)", "items: list[str] = field(default=[])"],
      "answerIndex": 2,
      "explanation": "default_factory calls list() for every new object, giving each its own list. A plain [] default raises a ValueError because it would be shared."
    },
    {
      "question": "What happens when you assign to a field of a `frozen=True` dataclass instance?",
      "options": ["The value changes silently", "A FrozenInstanceError is raised", "A new copy is created automatically", "The assignment is ignored with no error"],
      "answerIndex": 1,
      "explanation": "Frozen dataclasses block assignment and raise FrozenInstanceError. Use dataclasses.replace() to get a modified copy."
    },
    {
      "question": "For `class Status(StrEnum): SHIPPED = auto()`, what does `print(Status.SHIPPED)` output?",
      "options": ["Status.SHIPPED", "SHIPPED", "1", "shipped"],
      "answerIndex": 3,
      "explanation": "In a StrEnum, auto() uses the lowercase member name as the value, and printing a StrEnum member shows its string value, so it prints shipped."
    },
    {
      "question": "What is `Color.RED == 1` for `class Color(Enum): RED = 1`?",
      "options": ["False", "True", "1", "An error"],
      "answerIndex": 0,
      "explanation": "A plain Enum member is its own object, not the number it holds, so comparing it to 1 gives False. Use Color.RED.value to get the 1."
    },
    {
      "question": "Which function returns a changed copy of a frozen dataclass?",
      "options": ["field", "dataclasses.replace", "dataclasses.copy_frozen", "dataclass.update"],
      "answerIndex": 1,
      "explanation": "dataclasses.replace(obj, name=value) builds a new instance with the given fields changed. The other names do not exist for this purpose, and field only configures a single field."
    },
    {
      "question": "What does `field(repr=False)` do?",
      "options": ["Encrypts the value", "Makes the field read-only", "Deletes the field", "Hides the field from the printed repr"],
      "answerIndex": 3,
      "explanation": "repr=False leaves the field out of the generated __repr__ text, but the field still exists and can be read and changed."
    }
  ]
}
);
