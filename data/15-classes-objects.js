window.TOPICS = window.TOPICS || [];
window.TOPICS.push({
  "id": "15-classes-objects",
  "order": 15,
  "title": "Classes & Objects",
  "version": "Python 3.15.2 + uv 0.13.7",
  "summary": "Learn how to bundle data and behaviour together using classes. You will create objects, give them attributes and methods, protect values with properties, reuse code through inheritance, and make your objects work with built-in tools like print, len and ==.",
  "prerequisites": ["14-files-paths-data"],
  "subtopics": [
    {
      "id": "classes-and-instances",
      "title": "Classes and instances",
      "explanation": "A class is a blueprint that describes what a kind of thing looks like and can do. An instance (also called an object) is one actual thing built from that blueprint. You define a class with the `class` keyword, and you create an instance by calling the class like a function: `rex = Dog()`. In fact, every value in Python is an object: numbers, strings and lists are all instances of built-in classes.\n\nBy convention, class names use CapWords (each word starts with a capital letter, no underscores), like `Dog` or `InvoiceItem`. This makes classes easy to tell apart from functions and variables, which use lowercase_with_underscores.\n\nA variable written directly inside the class body, like `species` below, is a class attribute: it belongs to the class and every instance can read it. Two instances made from the same class are separate objects, even if they look identical.\n\nYou can check what an object is with `isinstance(obj, Class)`, and check whether two names point at the very same object with `is`.",
      "analogy": "A cookie cutter is the class and the cookies are the instances. They all have the same shape, but each cookie is its own separate cookie.",
      "code": [
        {
          "language": "python",
          "filename": "dog.py",
          "source": "class Dog:\n    species = \"Canis familiaris\"\n\n\nrex = Dog()\nfido = Dog()\n\nprint(rex.species)\nprint(isinstance(rex, Dog))\nprint(rex is fido)\n",
          "output": "Canis familiaris\nTrue\nFalse",
          "explanation": "`Dog()` builds a new object each time it is called. Both dogs can read the shared `species` attribute, `isinstance` confirms `rex` was built from `Dog`, and `rex is fido` is False because they are two different objects."
        }
      ],
      "productionNote": "Real programs use classes to model domain objects such as User, Order and Invoice, and to wrap clients and services (a client that talks to an outside service). Choose a class when data and the behaviour that works on it belong together.",
      "commonMistakes": [
        "Forgetting the parentheses when creating an instance: `rex = Dog` gives you the class itself, not a new object; you need `Dog()`.",
        "Creating a class for something that should just be a plain function. If there is no state to keep, a function is simpler."
      ],
      "sources": [
        { "title": "Python tutorial: A first look at classes", "url": "https://docs.python.org/3/tutorial/classes.html#a-first-look-at-classes" }
      ]
    },
    {
      "id": "init-and-attributes",
      "title": "__init__ and attributes",
      "explanation": "Most objects need their own data. The `__init__` method, a special method (its name starts and ends with double underscores; see the end of this topic), runs automatically right after a new instance is created, and it is where you set that data up. Its first parameter is always `self`, which is the instance being built. Writing `self.owner = owner` stores the value on that instance as an attribute (a named piece of data attached to the object).\n\nPython passes `self` for you. When you write `Account(\"Ada\", 50)`, Python creates the object and calls `__init__` with the new object as `self`, followed by your arguments. You can give parameters default values, like `balance: float = 0.0`, so callers may leave them out.\n\nRemember the difference between the two kinds of attributes. Class attributes (written in the class body) are shared by every instance. Instance attributes (set on `self`) belong to one object only. Put anything that differs between objects in `__init__`.",
      "analogy": "Filling in a new-employee form on their first day. Every employee gets their own form with their own details, but the form layout is the same for everyone.",
      "code": [
        {
          "language": "python",
          "filename": "account.py",
          "source": "class Account:\n    def __init__(self, owner: str, balance: float = 0.0) -> None:\n        self.owner = owner\n        self.balance = balance\n\n\na = Account(\"Ada\", 50)\nb = Account(\"Bo\")\n\nprint(a.owner, a.balance)\nprint(b.owner, b.balance)\n",
          "output": "Ada 50\nBo 0.0",
          "explanation": "Each account stores its own owner and balance. `a` was given 50 (an int, so it prints `50`), while `b` used the default `0.0`."
        }
      ],
      "productionNote": "Objects carry their own state, such as connection settings or user data, so the same class can serve many different users or servers at once. Keep `__init__` quick and simple: store values, and avoid slow work like network calls.",
      "commonMistakes": [
        "Forgetting `self` as the first parameter of `__init__` or of any method, which causes a confusing TypeError about arguments.",
        "Writing `owner = owner` instead of `self.owner = owner`; this only sets a local variable that disappears when `__init__` ends.",
        "Putting a mutable value like `items = []` at class level; every instance then shares the same list. Create it in `__init__` with `self.items = []`."
      ],
      "sources": [
        { "title": "Python tutorial: Class objects", "url": "https://docs.python.org/3/tutorial/classes.html#class-objects" },
        { "title": "Python tutorial: Class and instance variables", "url": "https://docs.python.org/3/tutorial/classes.html#class-and-instance-variables" }
      ]
    },
    {
      "id": "methods",
      "title": "Methods",
      "explanation": "A method is a function defined inside a class. You call it on an object, like `acc.deposit(25)`, and Python automatically passes the object as the first argument `self`. Inside the method you use `self.balance` to read or change that object's data. Remember the parentheses: `acc.deposit` without `()` is just a reference to the method, it does not run it.\n\nA class method is marked with `@classmethod` (a decorator, which is a line starting with `@` that modifies the function below it). It receives the class itself, conventionally named `cls`, instead of an instance. Its most common use is an alternative constructor: a different way to build an object, such as parsing text. Calling `cls(owner, float(amount))` creates an instance of the class.\n\nThe quotes in `-> \"Account\"` write the class name as text, because the class is not finished yet while its body is being read. On Python 3.14 and later (including 3.15) hints are only looked up when something asks for them, so the quotes are optional there, but you will see them in a lot of existing code.\n\nA static method is marked with `@staticmethod` and receives neither `self` nor `cls`. It is an ordinary function that you keep inside the class because it is closely related, like a validation helper. You can call it on the class or on an instance.",
      "analogy": "Buttons on a microwave. Each button acts on that specific microwave. A class method is like the factory that builds a new microwave from a spec sheet, and a static method is like the printed safety label that belongs with it but does not act on it.",
      "code": [
        {
          "language": "python",
          "filename": "methods.py",
          "source": "class Account:\n    def __init__(self, owner: str, balance: float = 0.0) -> None:\n        self.owner = owner\n        self.balance = balance\n\n    def deposit(self, amount: float) -> None:\n        self.balance += amount\n\n    @classmethod\n    def from_text(cls, text: str) -> \"Account\":\n        owner, amount = text.split(\":\")\n        return cls(owner, float(amount))\n\n    @staticmethod\n    def is_valid_amount(amount: float) -> bool:\n        return amount > 0\n\n\nacc = Account.from_text(\"Ada:100\")\nacc.deposit(25)\nprint(acc.owner, acc.balance)\nprint(Account.is_valid_amount(-5))\n",
          "output": "Ada 125.0\nFalse",
          "explanation": "`from_text` splits `\"Ada:100\"` into the owner and the amount, converts the amount to a float, and builds an Account. `deposit` then adds 25 to 100.0, giving 125.0. `is_valid_amount(-5)` is False because -5 is not greater than 0."
        }
      ],
      "productionNote": "Alternative constructors such as `from_json`, `from_row` or `from_env` are very common, because they keep parsing logic next to the class and keep `__init__` simple.",
      "commonMistakes": [
        "Calling a method without parentheses (`acc.deposit` instead of `acc.deposit(25)`), which does nothing.",
        "Forgetting `self.` when using attributes inside a method: `balance += amount` fails, `self.balance += amount` works."
      ],
      "sources": [
        { "title": "Python tutorial: Method objects", "url": "https://docs.python.org/3/tutorial/classes.html#method-objects" },
        { "title": "Python docs: classmethod", "url": "https://docs.python.org/3/library/functions.html#classmethod" }
      ]
    },
    {
      "id": "properties",
      "title": "Properties",
      "explanation": "A property lets a method look like a plain attribute. You write `@property` above a method, and then callers use `t.fahrenheit` with no parentheses. This is perfect for computed values that are derived from other data, so they can never get out of date.\n\nProperties can also validate. Add a setter with `@celsius.setter` (the name before `.setter` must match the property name), and Python runs your code whenever someone assigns `t.celsius = 100`. Inside the setter you can reject bad values by raising an error, and then store the good value.\n\nBy convention, a name that starts with an underscore, like `_celsius`, means internal: please do not touch it from outside. The real value lives in `_celsius`, while the public name `celsius` is the property. Note that `__init__` assigns `self.celsius = celsius`, so even the first value goes through the validation in the setter.",
      "analogy": "A car's fuel gauge. You just read a number on the dashboard, but behind it a sensor is doing real work to produce that number.",
      "code": [
        {
          "language": "python",
          "filename": "temperature.py",
          "source": "class Temperature:\n    def __init__(self, celsius: float) -> None:\n        self.celsius = celsius  # goes through the setter\n\n    @property\n    def celsius(self) -> float:\n        return self._celsius\n\n    @celsius.setter\n    def celsius(self, value: float) -> None:\n        if value < -273.15:\n            raise ValueError(\"below absolute zero\")\n        self._celsius = value\n\n    @property\n    def fahrenheit(self) -> float:\n        return self._celsius * 9 / 5 + 32\n\n\nt = Temperature(25)\nprint(t.fahrenheit)\nt.celsius = 100\nprint(t.fahrenheit)\n",
          "output": "77.0\n212.0",
          "explanation": "25 * 9 / 5 + 32 is 77.0, and after setting celsius to 100 the same calculation gives 212.0. `fahrenheit` has no setter, so it is read-only and always matches the current celsius value."
        }
      ],
      "productionNote": "Properties let you validate input and keep a stable public interface while the internals change: you can start with a plain attribute and later turn it into a property without changing any calling code.",
      "commonMistakes": [
        "Doing heavy or slow work (network calls, big calculations) inside a property. People expect attribute access to be cheap.",
        "Causing infinite recursion (the setter keeps calling itself forever) by assigning `self.celsius = value` inside the celsius setter itself. Store the value in `self._celsius` instead."
      ],
      "sources": [
        { "title": "Python docs: property", "url": "https://docs.python.org/3/library/functions.html#property" }
      ]
    },
    {
      "id": "inheritance-and-super",
      "title": "Inheritance and super()",
      "explanation": "Inheritance lets a new class reuse and extend an existing one. Writing `class Admin(User):` makes Admin a child (subclass) of User, the parent (base class). Admin automatically gets everything User has, and you only write what is different.\n\nA child can override a method by defining one with the same name. To still use the parent's version, call `super()`, which gives you access to the parent class. In the example, `super().permissions()` returns the parent's list, and Admin adds more items to it. If you override `__init__`, remember to call `super().__init__(...)` so the parent's setup also runs.\n\nBecause an Admin is a kind of User, `isinstance(admin, User)` is True. Keep hierarchies shallow. When you just need to use another object's features, composition, meaning storing that object as an attribute, is often simpler than inheriting from it.",
      "analogy": "A new phone model keeps everything from the last model and adds a better camera. You do not redesign the whole phone, only the part that changes.",
      "code": [
        {
          "language": "python",
          "filename": "inheritance.py",
          "source": "class User:\n    def __init__(self, name: str) -> None:\n        self.name = name\n\n    def permissions(self) -> list[str]:\n        return [\"read\"]\n\n\nclass Admin(User):\n    def permissions(self) -> list[str]:\n        return super().permissions() + [\"write\", \"delete\"]\n\n\nprint(User(\"Bo\").permissions())\nprint(Admin(\"Ada\").permissions())\nprint(isinstance(Admin(\"Ada\"), User))\n",
          "output": "['read']\n['read', 'write', 'delete']\nTrue",
          "explanation": "Admin does not define `__init__`, so it inherits User's. Its `permissions` calls the parent version to get `['read']` and then adds two more items. An Admin counts as a User, so `isinstance` is True."
        }
      ],
      "productionNote": "Frameworks rely on this pattern: you extend base classes for custom exceptions, web views, or test cases. Prefer shallow hierarchies and favour composition when the \"is-a\" test fails (an Admin is a kind of User, but a Car is not a kind of Engine).",
      "commonMistakes": [
        "Building deep inheritance chains that are hard to follow. Two or three levels is usually plenty.",
        "Overriding `__init__` in a child class and forgetting to call `super().__init__()`, so the parent's attributes are never set."
      ],
      "sources": [
        { "title": "Python tutorial: Inheritance", "url": "https://docs.python.org/3/tutorial/classes.html#inheritance" },
        { "title": "Python docs: super", "url": "https://docs.python.org/3/library/functions.html#super" }
      ]
    },
    {
      "id": "special-methods",
      "title": "Special methods (__repr__, __eq__, __len__)",
      "explanation": "Special methods, often called dunder methods (short for double underscore, like `__len__`), let your objects work with Python's built-in tools. You never call them directly; Python calls them for you. `len(obj)` runs `obj.__len__()`, `a == b` runs `a.__eq__(b)`, and `print(obj)` or the interactive display uses `__repr__` or `__str__`. There is also `__lt__` (used by `<` and by sorting).\n\n`__repr__` should return developer-friendly text, ideally showing how to recreate the object, such as `Cart(['pen'])`. `__str__` is the user-friendly version; if you only define `__repr__`, `print` uses it too. In an f-string, `!r` means \"use repr\", which adds quotes around strings.\n\nIn `__eq__`, take the other object as `object` and first check its type with `isinstance`, so comparing a Cart to a number returns False instead of crashing. Without your own `__eq__`, two separate objects are never equal.",
      "analogy": "Standard plugs. If your appliance has the standard plug, it fits every socket in the house. If your class has the standard special methods, it fits every built-in Python tool.",
      "code": [
        {
          "language": "python",
          "filename": "cart.py",
          "source": "class Cart:\n    def __init__(self) -> None:\n        self.items: list[str] = []\n\n    def add(self, item: str) -> None:\n        self.items.append(item)\n\n    def __len__(self) -> int:\n        return len(self.items)\n\n    def __repr__(self) -> str:\n        return f\"Cart({self.items!r})\"\n\n    def __eq__(self, other: object) -> bool:\n        return isinstance(other, Cart) and self.items == other.items\n\n\na = Cart()\na.add(\"pen\")\nb = Cart()\nb.add(\"pen\")\n\nprint(len(a))\nprint(a)\nprint(a == b)\n",
          "output": "1\nCart(['pen'])\nTrue",
          "explanation": "`len(a)` calls `__len__` and returns 1. `print(a)` falls back to `__repr__`, which shows the list with quotes. `a == b` is True because both carts hold the same items, even though they are different objects."
        }
      ],
      "productionNote": "A good `__repr__` makes logs and debugging output readable: seeing `Cart(['pen'])` is far more useful than a default like `<Cart object at 0x...>`.",
      "commonMistakes": [
        "Writing an `__eq__` that crashes on other types (for example accessing `other.items` without checking `isinstance` first).",
        "Confusing `__str__` and `__repr__`: `__repr__` is for developers and debugging, `__str__` is for end users."
      ],
      "sources": [
        { "title": "Python data model: Special method names", "url": "https://docs.python.org/3/reference/datamodel.html#special-method-names" }
      ]
    }
  ],
  "quiz": [
    {
      "question": "Inside a method, what is `self`?",
      "options": [
        "The class that the method is defined in",
        "A reserved built-in function that Python provides",
        "The instance the method is being called on",
        "The parent class that this class inherits from"
      ],
      "answerIndex": 2,
      "explanation": "Python automatically passes the instance as the first argument, so `self` lets the method read and change that particular object's data."
    },
    {
      "question": "When does `__init__` run?",
      "options": [
        "Right after a new instance is created",
        "When the class definition is first read by Python",
        "When the whole program finishes running",
        "Only when you call it by hand in your code"
      ],
      "answerIndex": 0,
      "explanation": "Calling `Account(\"Ada\")` creates the object and then Python automatically runs `__init__` to set it up."
    },
    {
      "question": "What does `@property` let you do?",
      "options": [
        "Make a method run much faster than normal",
        "Make a class attribute that is shared by all of its instances",
        "Prevent a class from being used as a parent by other classes",
        "Access a method like an attribute, without parentheses"
      ],
      "answerIndex": 3,
      "explanation": "`@property` exposes a method as an attribute, so you can compute or validate values while callers write `obj.value`."
    },
    {
      "question": "Which special method controls what `len(obj)` returns?",
      "options": [
        "__repr__",
        "__len__",
        "__eq__",
        "__size__"
      ],
      "answerIndex": 1,
      "explanation": "`len(obj)` calls `obj.__len__()`. `__repr__` is for text display and `__eq__` is for `==`; there is no `__size__` hook."
    },
    {
      "question": "In a child class, what does `super().method()` call?",
      "options": [
        "The same method on the child class, calling itself again",
        "A static method defined on the object",
        "The version of `method` from the parent class",
        "Only the `__init__` method of the parent class"
      ],
      "answerIndex": 2,
      "explanation": "`super()` gives access to the parent class, so `super().method()` runs the parent's version, which lets a child extend rather than fully replace it."
    },
    {
      "question": "What does `rex = Dog()` create?",
      "options": [
        "A new instance of Dog",
        "The Dog class itself",
        "A new file named Dog",
        "A copy of the Dog method"
      ],
      "answerIndex": 0,
      "explanation": "Calling a class like a function builds a new instance (object) of it. Without the parentheses, `rex = Dog` would only give another name to the class."
    },
    {
      "question": "Which decorator makes a method receive the class as `cls` instead of an instance?",
      "options": [
        "@staticmethod",
        "@property",
        "@cls",
        "@classmethod"
      ],
      "answerIndex": 3,
      "explanation": "`@classmethod` passes the class itself as the first argument, which is why it suits alternative constructors. `@staticmethod` receives neither `self` nor `cls`."
    },
    {
      "question": "If Admin(User) does not define permissions(), what does Admin(\"Ada\").permissions() use?",
      "options": [
        "Nothing; it raises an error because the method is missing",
        "The permissions method inherited from User",
        "A copy of the whole Admin class made on the fly",
        "Only the __init__ method that Admin inherits"
      ],
      "answerIndex": 1,
      "explanation": "A child class automatically gets every method of its parent, so Python finds `permissions` on User and runs it."
    },
    {
      "question": "What does `print(obj)` use when a class defines only __repr__?",
      "options": [
        "__str__ is required, so it errors",
        "Nothing is printed",
        "__repr__ is used as the text",
        "__eq__ is used"
      ],
      "answerIndex": 2,
      "explanation": "`print` prefers `__str__`, but when it is missing Python falls back to `__repr__`, so the object prints using that text."
    }
  ]
}
);
