window.TOPICS = window.TOPICS || [];
window.TOPICS.push({
  "id": "27-pydantic-models",
  "order": 27,
  "title": "Pydantic Models",
  "version": "Python 3.15.2 + uv 0.13.7 + Pydantic 2.14.3",
  "summary": "Pydantic is a third-party library (code written by other people, installed with uv) that checks and converts data using your type hints. You will define models with typed fields, read validation errors, add rules with Field(), nest models inside each other, and turn models back into dicts and JSON text. FastAPI (a web framework you meet in topic 28) is built on exactly these ideas.",
  "prerequisites": ["10-type-hints", "11-error-handling", "15-classes-objects", "26-http-api-basics"],
  "subtopics": [
    {
      "id": "basemodel-typed-fields",
      "title": "BaseModel and typed fields",
      "explanation": "Data arriving from outside your program (a JSON body from an API client, a config file, a form) is untrusted: a number may arrive as text, or a required value may be missing. Pydantic is a third-party library that checks and converts such data using type hints (topic 10). Unlike plain type hints, which Python ignores at runtime, Pydantic enforces them.\n\nYou describe your data by writing a class (topic 15) that inherits from `BaseModel`, Pydantic's base class. Inheriting means your class gets all of BaseModel's abilities. Every annotated attribute in the class body is a field: a named, typed piece of data. A field with a default value (like `active: bool = True`) is optional; a field without a default is required.\n\nTo use Pydantic in a project, add it with `uv add pydantic` (topic 13). FastAPI installs Pydantic for you, so later topics need no extra step. To follow along: create a project folder, open a terminal in it, run `uv init`, then `uv add pydantic`, and save the example below as `user_model.py` in that folder.\n\nBy default Pydantic runs in lax mode: it converts sensible inputs to the declared type. The text `\"2\"` becomes the integer `2` for an `int` field. Input that cannot be converted sensibly, like `\"abc\"` for an `int`, is rejected (next sub-topic). A stricter mode that refuses any conversion exists, but you only need it in special cases.\n\nA model looks like a dataclass (topic 16), but a dataclass only stores values while a model also validates them. Fields are passed by keyword: `User(id=1, name=\"Ada\")`.",
      "analogy": "An airport check-in desk. The agent checks that every field on your documents is present and correct, quietly fixes small formatting differences (a lowercase surname is accepted), and refuses documents that are wrong in a way that cannot be fixed. Only data that passed the desk gets through to the plane (your program).",
      "code": [
        {
          "language": "python",
          "filename": "user_model.py",
          "source": "from pydantic import BaseModel\n\n\nclass User(BaseModel):\n    id: int\n    name: str\n    active: bool = True\n\n\nu = User(id=1, name=\"Ada\")\nprint(u)\nprint(u.name)\nprint(User(id=\"2\", name=\"Bob\").id + 1)\n",
          "output": "id=1 name='Ada' active=True\nAda\n3",
          "explanation": "`User` has two required fields (`id`, `name`) and one optional field (`active`, default `True`). Printing a model shows its fields in a readable form. Each field is read as an attribute, like `u.name`. The last line passes the text `\"2\"` for `id`; lax mode converts it to the integer `2`, so adding 1 gives `3` (text plus a number would otherwise fail)."
        },
        {
          "language": "bash",
          "filename": "terminal",
          "source": "uv add pydantic\nuv run user_model.py",
          "output": "",
          "explanation": "`uv add pydantic` records the dependency in `pyproject.toml` and installs it into the project's `.venv`. `uv run user_model.py` then runs the script inside that environment. (uv prints progress messages for the install; the script's own output is the three lines shown above.)"
        }
      ],
      "productionNote": "Models are used for API request and response schemas, configuration files, and parsing any external data (JSON from other services, rows from a file). Put the checking at the edge of your program so the rest of the code can trust its data.",
      "commonMistakes": [
        "Passing fields positionally, as in `User(1, \"Ada\")`. Model fields are keyword-only, so this raises `TypeError` (Python's error for a wrong kind of argument). Write `User(id=1, name=\"Ada\")`.",
        "Expecting no conversion at all. In the default lax mode `\"2\"` is accepted for an `int` field. If you truly need to reject such input, Pydantic has a strict mode, but use it only when required."
      ],
      "sources": [
        { "title": "Pydantic: Models - Basic model usage", "url": "https://docs.pydantic.dev/latest/concepts/models/#basic-model-usage" },
        { "title": "Pydantic: Conversion table", "url": "https://docs.pydantic.dev/latest/concepts/conversion_table/" }
      ]
    },
    {
      "id": "validation-error",
      "title": "Validation and ValidationError",
      "explanation": "When the data does not fit the model, Pydantic raises `pydantic.ValidationError`. It is an exception (topic 11), so you catch it with `try` and `except`. Importantly, it collects all problems at once instead of stopping at the first.\n\nThe exception has two methods you will use. `e.error_count()` returns how many problems were found. `e.errors()` returns a list of dicts, one per problem.\n\nEach error dict has these keys: `loc` (the location: a tuple of the field name, or a path for nested data), `msg` (a human-readable sentence), `type` (a short machine-readable code such as `int_parsing` when text cannot become an integer, or `missing` when a required field is absent), and `input` (the value that was received).\n\nWrite your code against `loc` and `type`, because those are stable. The `msg` wording is meant for people and can change between versions, so avoid comparing it in code.",
      "analogy": "A form checker who hands the whole form back with every wrong box circled in red, instead of pointing out only the first mistake. You fix everything in one round, and each circle tells you which box (`loc`) and what kind of problem (`type`).",
      "code": [
        {
          "language": "python",
          "filename": "validation.py",
          "source": "from pydantic import BaseModel, ValidationError\n\n\nclass User(BaseModel):\n    id: int\n    name: str\n\n\ntry:\n    User(id=\"abc\", name=\"Ada\")\nexcept ValidationError as e:\n    print(e.error_count())\n    err = e.errors()[0]\n    print(err[\"loc\"], err[\"type\"])\n\ntry:\n    User(id=1)\nexcept ValidationError as e:\n    err = e.errors()[0]\n    print(err[\"loc\"], err[\"type\"])\n",
          "output": "1\n('id',) int_parsing\n('name',) missing",
          "explanation": "The first call gives `id` the text `\"abc\"`, which cannot become an integer: one error, located at `('id',)`, with type `int_parsing`. The second call leaves out `name` entirely: the error is located at `('name',)` with type `missing`. The `loc` is a tuple, which is why it prints with parentheses and a trailing comma."
        }
      ],
      "productionNote": "In an API, bad input should produce a clear error response (status 422, from topic 26) listing what is wrong. FastAPI does this automatically from the ValidationError details; you will see it in topic 29.",
      "commonMistakes": [
        "Catching a bare `Exception` and hiding the details. Catch `ValidationError` and read `errors()` so you know which field failed and why.",
        "Relying on the exact `msg` text in code or tests. Compare `type` and `loc` instead, since message wording can change."
      ],
      "sources": [
        { "title": "Pydantic: Validation Errors", "url": "https://docs.pydantic.dev/latest/errors/validation_errors/" },
        { "title": "Pydantic: pydantic_core ValidationError", "url": "https://docs.pydantic.dev/latest/api/pydantic_core/#pydantic_core.ValidationError" }
      ]
    },
    {
      "id": "field-constraints",
      "title": "Field constraints with Field()",
      "explanation": "A type alone says little: `price: float` accepts -5 and `name: str` accepts an empty string. `Field()` lets you add rules and metadata to a field. Assign it as the default value: `price: float = Field(gt=0)`.\n\nFor strings and lists use `min_length` and `max_length`. For numbers use `gt` (greater than), `ge` (greater than or equal), `lt` (less than) and `le` (less than or equal). `Field()` also takes `default=` (the default value) and `description=` (human text that FastAPI later shows in its generated docs).\n\nThere is an equivalent second form using `Annotated` from the `typing` module. `Annotated[int, Field(ge=0)]` means \"an int, plus this extra information\". The first argument is the real type; the rest is extra info that tools like Pydantic read. With this form the default value goes after, as in `quantity: Annotated[int, Field(ge=0)] = 0`. FastAPI uses the `Annotated` form heavily, so get used to reading it.\n\nA violated rule becomes a normal validation error, with a `type` such as `string_too_short` or `greater_than`.",
      "analogy": "Form boxes with printed rules beside them: \"at most 50 letters\", \"must be above zero\". `Field(...)` is the printed rule, and it travels with the box wherever the form goes, whether written next to the field or bundled into its type with `Annotated`.",
      "code": [
        {
          "language": "python",
          "filename": "product.py",
          "source": "from typing import Annotated\n\nfrom pydantic import BaseModel, Field, ValidationError\n\n\nclass Product(BaseModel):\n    name: str = Field(min_length=1, max_length=50)\n    price: float = Field(gt=0)\n    quantity: Annotated[int, Field(ge=0)] = 0\n\n\nprint(Product(name=\"Pen\", price=1.5))\n\ntry:\n    Product(name=\"\", price=-1)\nexcept ValidationError as e:\n    print([err[\"type\"] for err in e.errors()])\n",
          "output": "name='Pen' price=1.5 quantity=0\n['string_too_short', 'greater_than']",
          "explanation": "`name` must be 1 to 50 characters, `price` must be strictly greater than 0, and `quantity` (written in the `Annotated` form) must be 0 or more, defaulting to 0. The valid call prints the model. The invalid call breaks two rules at once: the empty name is too short and -1 is not greater than 0. The list comprehension (topic 8) collects the `type` of each error, in field order."
        }
      ],
      "productionNote": "Field constraints enforce business rules right at the API boundary: positive prices, non-negative stock, username length limits. The code behind the boundary then never needs to re-check them.",
      "commonMistakes": [
        "Checking such rules by hand with `if` statements in many places. Declare the rule once on the field.",
        "Using a rule that does not fit the type, like `Field(gt=0)` on a `str` field. Use `min_length` for strings and `gt`/`ge` for numbers."
      ],
      "sources": [
        { "title": "Pydantic: Fields", "url": "https://docs.pydantic.dev/latest/concepts/fields/" },
        { "title": "Pydantic API: Field", "url": "https://docs.pydantic.dev/latest/api/fields/#pydantic.fields.Field" }
      ]
    },
    {
      "id": "nested-models",
      "title": "Nested models",
      "explanation": "A field's type can itself be a model, or a list of models such as `list[Address]`. Pydantic then validates the inner data with the inner model's rules. This is how you describe real data: an order with line items, a user with an address.\n\nTo validate data you already hold (for example a dict produced from JSON, topic 14), call the class method `Model.model_validate(data)`. It builds the model, or raises `ValidationError`. A nested dict is turned into a nested model object automatically, and you read it with normal attribute access: `c.address.city`.\n\nWhen something deep inside fails, the error's `loc` shows the full path as a tuple, such as `('address', 'zip_code')`. For items inside a list the path also contains the item's position number.\n\nA default like `tags: list[str] = []` is safe in a model. Pydantic gives each instance its own copy of the default, so it does not have the shared-mutable-default pitfall of plain functions (topic 9).",
      "analogy": "Russian nesting dolls checked one by one. The customer form contains an address form; the address form is checked by its own rules, and if its zip code is missing, the report says exactly which doll: customer, then address, then zip code.",
      "code": [
        {
          "language": "python",
          "filename": "nested.py",
          "source": "from pydantic import BaseModel, ValidationError\n\n\nclass Address(BaseModel):\n    city: str\n    zip_code: str\n\n\nclass Customer(BaseModel):\n    name: str\n    address: Address\n    tags: list[str] = []\n\n\nc = Customer.model_validate(\n    {\"name\": \"Ada\", \"address\": {\"city\": \"London\", \"zip_code\": \"N1\"}}\n)\nprint(c.address.city)\nprint(c.tags)\n\ntry:\n    Customer.model_validate({\"name\": \"Bob\", \"address\": {\"city\": \"Paris\"}})\nexcept ValidationError as e:\n    print(e.errors()[0][\"loc\"])\n",
          "output": "London\n[]\n('address', 'zip_code')",
          "explanation": "The inner dict becomes an `Address` object, so `c.address.city` is `London`. `tags` was not supplied, so it is the empty list. In the failing call the inner dict lacks `zip_code`; the error location is the full path `('address', 'zip_code')`."
        }
      ],
      "productionNote": "Nested models describe orders with line items, users with addresses, and JSON documents from other services. One `model_validate` call checks the entire structure.",
      "commonMistakes": [
        "Typing a field as plain `dict` and losing validation of what is inside. Use a model (or `dict[str, int]` style hints) so the contents are checked.",
        "Forgetting that nested errors have a path: `loc` is a tuple with several parts, not just one field name."
      ],
      "sources": [
        { "title": "Pydantic: Models - Nested models", "url": "https://docs.pydantic.dev/latest/concepts/models/#nested-models" },
        { "title": "Pydantic: Models - Validating data", "url": "https://docs.pydantic.dev/latest/concepts/models/#validating-data" }
      ]
    },
    {
      "id": "serializing-models",
      "title": "Serializing with model_dump and model_dump_json",
      "explanation": "To serialize means to turn an object into plain data that can be stored or sent. Models offer two ways. `model_dump()` returns a normal dict (nested models become nested dicts). `model_dump_json()` returns a compact JSON string, ready to send over HTTP or save to a file.\n\nSeveral options trim the result. `exclude_none=True` drops fields whose value is `None`. `exclude_unset=True` keeps only fields the caller explicitly provided when creating the model, even if some were set to `None`. This is how partial updates (the PATCH method from topic 26) are handled later. `model_dump(mode=\"json\")` returns a dict containing only JSON-safe values, for example turning dates into text.\n\nThe reverse direction is `Model.model_validate_json(text)`, which parses a JSON string and validates it in one step. Note in the example that the JSON number `2` becomes the float `2.0` because the field is a `float`.\n\nOlder Pydantic version 1 used `.dict()` and `.json()`. They still exist in version 2 but are deprecated (kept only for old code, and warned about), so use the `model_` names.",
      "analogy": "Packing a suitcase. `model_dump` lays the items out on the bed, still separate and easy to rearrange (a dict). `model_dump_json` zips the suitcase shut, ready to ship (a text string). `model_validate_json` is unpacking at the destination, with a check that everything is really there.",
      "code": [
        {
          "language": "python",
          "filename": "serialize.py",
          "source": "from pydantic import BaseModel\n\n\nclass Item(BaseModel):\n    name: str\n    price: float\n    note: str | None = None\n\n\nitem = Item(name=\"Pen\", price=1.5)\nprint(item.model_dump())\nprint(item.model_dump(exclude_none=True))\nprint(Item(name=\"Pen\", price=1.5, note=None).model_dump(exclude_unset=True))\nprint(item.model_dump_json())\nprint(Item.model_validate_json('{\"name\": \"Ink\", \"price\": 2}').price)\n",
          "output": "{'name': 'Pen', 'price': 1.5, 'note': None}\n{'name': 'Pen', 'price': 1.5}\n{'name': 'Pen', 'price': 1.5, 'note': None}\n{\"name\":\"Pen\",\"price\":1.5,\"note\":null}\n2.0",
          "explanation": "The first line shows every field, including the default `note=None`. `exclude_none=True` removes `note`. In the third line `note=None` was explicitly passed, so `exclude_unset=True` keeps it (had it been left out, it would be dropped). `model_dump_json()` produces JSON text where Python's `None` is written as `null`. The last line parses JSON text into a model and reads `price`, which is `2.0` because of the `float` type."
        }
      ],
      "productionNote": "Serialization is used to send API responses, fill caches, store JSON, and build partial updates with `exclude_unset=True`.",
      "commonMistakes": [
        "Using the Pydantic version 1 names `.dict()` and `.json()`. They are deprecated in version 2; use `model_dump()` and `model_dump_json()`.",
        "Calling `json.dumps(model)` from the standard library. It raises `TypeError` because a model is not a basic JSON type. Use `model_dump_json()` instead."
      ],
      "sources": [
        { "title": "Pydantic: Serialization", "url": "https://docs.pydantic.dev/latest/concepts/serialization/" },
        { "title": "Pydantic API: BaseModel.model_dump", "url": "https://docs.pydantic.dev/latest/api/base_model/#pydantic.BaseModel.model_dump" }
      ]
    }
  ],
  "quiz": [
    {
      "question": "Given `class User(BaseModel)` with `id: int` and `name: str`, what does `User(id=\"7\", name=\"Ada\").id` hold?",
      "options": ["The integer 7, because lax mode converts the text", "The text \"7\", because type hints are simply ignored", "Nothing: it always raises ValidationError for text", "None, because the type does not match the hint"],
      "answerIndex": 0,
      "explanation": "In the default lax mode Pydantic converts sensible input to the declared type, so the text \"7\" becomes the integer 7."
    },
    {
      "question": "Which part of an item from `e.errors()` tells you where the problem happened?",
      "options": ["input", "type", "loc", "msg"],
      "answerIndex": 2,
      "explanation": "`loc` is a tuple giving the location, like `('address', 'zip_code')`. `type` is the kind of problem, `msg` is readable text and `input` is the received value."
    },
    {
      "question": "How do you require that a float field `price` is strictly above zero?",
      "options": ["price: float = Field(min_length=0)", "price: float = Field(gt=0)", "price: float = Field(le=0)", "price: float = Field(description=\"positive\")"],
      "answerIndex": 1,
      "explanation": "`gt` means greater than. `min_length` is for strings and lists, `le=0` allows only zero or below, and `description` is only documentation, not a rule."
    },
    {
      "question": "What is the difference between `model_dump()` and `model_dump_json()`?",
      "options": ["Both return a dict; the second one is just faster", "The first returns a JSON string; the second returns a dict", "The first only works on models that contain nested models", "The first returns a dict; the second returns a JSON string"],
      "answerIndex": 3,
      "explanation": "`model_dump()` gives a Python dict you can keep working with; `model_dump_json()` gives a JSON text string ready to send or store."
    },
    {
      "question": "Which option of `model_dump` returns only the fields the caller explicitly provided?",
      "options": ["exclude_unset=True", "exclude_none=True", "mode=\"json\"", "include_all=True"],
      "answerIndex": 0,
      "explanation": "`exclude_unset=True` leaves out every field that was not given when the model was created. `exclude_none` drops fields whose value is None, and `mode=\"json\"` only makes values JSON-safe. `include_all` does not exist."
    },
    {
      "question": "Customer has a field address: Address, and Address has zip_code: str. What is the loc of a missing zip_code?",
      "options": ["('zip_code',)", "('address', 'zip_code')", "('customer', 'address')", "('address',)"],
      "answerIndex": 1,
      "explanation": "`loc` is the path from the outer model down to the failing field: first the field name `address`, then `zip_code`. The model class name `Customer` is not part of it."
    },
    {
      "question": "Which method returns how many problems a ValidationError found?",
      "options": ["errors()", "len(e)", "error_count()", "e.count()"],
      "answerIndex": 2,
      "explanation": "`e.error_count()` returns the number of problems as an integer. `e.errors()` returns the list of problem details, not a count."
    },
    {
      "question": "Which Field rule means 'zero or more'?",
      "options": ["gt=0", "min_length=0", "le=0", "ge=0"],
      "answerIndex": 3,
      "explanation": "`ge` means greater than or equal to, so `ge=0` allows 0 and everything above. `gt=0` excludes zero and `le=0` allows only zero or below."
    },
    {
      "question": "Which method parses a JSON string into a model?",
      "options": ["model_validate_json", "model_dump_json", "json.loads", "model_dump"],
      "answerIndex": 0,
      "explanation": "`model_validate_json` reads JSON text and validates it into a model in one step. `model_dump_json` goes the other way, and `json.loads` gives only a plain dict."
    }
  ]
});
