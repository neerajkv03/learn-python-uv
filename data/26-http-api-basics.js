window.TOPICS = window.TOPICS || [];
window.TOPICS.push({
  "id": "26-http-api-basics",
  "order": 26,
  "title": "HTTP & Web API Basics",
  "version": "Python 3.15.2 + uv 0.13.7",
  "summary": "Learn how programs talk to each other over the network: clients send requests, servers send back responses. You will read HTTP methods, status codes, URLs, headers and JSON bodies, and design clean REST-style paths (URLs that name things with plural nouns, while the method names the action). Every example runs offline, so you can focus on the ideas that the next FastAPI topics build on.",
  "prerequisites": ["14-files-paths-data", "16-dataclasses-enums"],
  "subtopics": [
    {
      "id": "clients-servers-requests-responses",
      "title": "Clients, servers, requests and responses",
      "explanation": "An API (Application Programming Interface) is a way for one program to ask another program to do something. A web API is an API that other programs reach over a network, such as the internet. For example, a weather app on your phone asks a weather service for today's forecast.\n\nThe program that asks is the client. A client can be a browser, a phone app, or a Python script. The program that answers is the server. It waits for messages, runs some code, and sends a reply.\n\nHTTP (HyperText Transfer Protocol) is the set of rules both sides follow for this conversation. A protocol is just an agreed format for messages, like agreeing that letters have an address at the top.\n\nThe client sends a request. A request has a method (what to do, covered in the next sub-topic), a URL (where to do it), headers (labelled extra information), and an optional body (the data being sent).\n\nThe server sends back a response. A response has a status code (a number saying how it went), headers, and an optional body.\n\nThe example below fakes a server with a plain function, so no network is needed. It takes a method and a path, and returns a status code plus a dictionary. Real servers do the same job, just with real network messages. Note that FastAPI, the framework used later in this course, answers an unknown path with `{\"detail\":\"Not Found\"}`, the same message this fake server gives (FastAPI just leaves out the space).",
      "analogy": "A restaurant. The customer (client) gives an order to the waiter (the request). The kitchen (server) prepares it, and the waiter brings back either the dish or \"sorry, that is not on the menu\" (the response). The customer never enters the kitchen; they only use the agreed way of ordering.",
      "code": [
        {
          "language": "python",
          "filename": "fake_server.py",
          "source": "def server(method: str, path: str) -> tuple[int, dict[str, str]]:\n    \"\"\"Pretend server: take a request, return (status code, body).\"\"\"\n    if method == \"GET\" and path == \"/hello\":\n        return 200, {\"message\": \"hi\"}\n    return 404, {\"detail\": \"Not Found\"}\n\n\nprint(server(\"GET\", \"/hello\"))\nprint(server(\"GET\", \"/nope\"))\n",
          "output": "(200, {'message': 'hi'})\n(404, {'detail': 'Not Found'})",
          "explanation": "The function plays the server. The arguments are the request (method and path), and the returned tuple is the response (status code and body). The first call matches the known route and gets 200. The second call matches nothing, so it gets 404 and a body saying Not Found. Run it with `uv run fake_server.py`."
        }
      ],
      "productionNote": "Every web and mobile app talks to a backend (the server side of an app) this way, and services inside a company talk to each other the same way. Learning to think in request and response terms makes logs, docs and bug reports much easier to read.",
      "commonMistakes": [
        "Thinking the browser is the only kind of client. Scripts, phone apps and other servers are clients too.",
        "Mixing up the request (what you send) and the response (what you get back). The status code belongs to the response, the method belongs to the request."
      ],
      "sources": [
        { "title": "MDN: An overview of HTTP", "url": "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview" },
        { "title": "MDN: HTTP messages", "url": "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Messages" }
      ]
    },
    {
      "id": "http-methods",
      "title": "HTTP methods",
      "explanation": "The method is a verb in the request that says what the client wants to do. The five you will use most are:\n\nGET reads data. It sends no body and changes nothing.\n\nPOST creates something new.\n\nPUT replaces a whole thing with the data you send.\n\nPATCH changes only some fields of a thing.\n\nDELETE removes it.\n\nTwo useful properties describe methods. A method is safe if it does not change data on the server. GET is safe. A method is idempotent (say: eye-dem-POH-tent) if doing it many times leaves the same result as doing it once. GET, PUT and DELETE are idempotent: replacing a book with the same data twice, or deleting it twice, ends in the same state. POST is not idempotent: sending it twice usually creates two new things.\n\nThese properties matter because browsers, search crawlers (programs that visit web pages automatically to index them) and retry logic rely on them. They assume it is fine to repeat a GET at any time.",
      "analogy": "A library desk. GET is looking at a book without touching the shelf. POST is donating a new book. PUT is swapping a book for a whole new edition. PATCH is fixing a typo on one page. DELETE is taking the book off the shelf. Looking twice changes nothing, but donating twice puts two copies on the shelf.",
      "code": [
        {
          "language": "python",
          "filename": "methods.py",
          "source": "actions = {\n    \"GET\": \"read\",\n    \"POST\": \"create\",\n    \"PUT\": \"replace\",\n    \"PATCH\": \"update part\",\n    \"DELETE\": \"remove\",\n}\n\nfor method, action in actions.items():\n    print(f\"{method} -> {action}\")\n",
          "output": "GET -> read\nPOST -> create\nPUT -> replace\nPATCH -> update part\nDELETE -> remove",
          "explanation": "A dictionary maps each method name to what it does. The loop uses `.items()` to get key and value together and prints them with an f-string. Dictionaries keep insertion order, so the lines print in the order they were written."
        }
      ],
      "productionNote": "Every API route is a pair of a method and a path, for example GET /books. Choosing the right method lets caches, browsers and retry tools behave correctly without any extra work.",
      "commonMistakes": [
        "Changing data with GET. Crawlers (automatic visitors such as search engines) and browser prefetching (the browser loading pages in advance) may call GET URLs on their own, which could trigger deletes or other changes.",
        "Using POST for everything. It hides the intent of the request and loses the safe and idempotent guarantees of the other methods."
      ],
      "sources": [
        { "title": "MDN: HTTP request methods", "url": "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods" },
        { "title": "RFC 9110: HTTP Semantics, Methods", "url": "https://www.rfc-editor.org/rfc/rfc9110#name-methods" }
      ]
    },
    {
      "id": "status-codes",
      "title": "Status codes",
      "explanation": "A status code is a three-digit number in the response that summarises the result. The first digit gives the class:\n\n2xx means success. 200 OK is the normal success, 201 Created means a new thing was made, and 204 No Content means success with nothing to send back.\n\n4xx means the client made a mistake. 400 Bad Request means the request was malformed, 401 means the client is not logged in, 403 Forbidden means logged in but not allowed, and 404 Not Found means there is nothing at that path. FastAPI also uses 422 when the data sent fails validation (checking that data has the right shape).\n\n5xx means the server failed. 500 Internal Server Error means the server's own code hit a problem.\n\nPython's standard library has `http.HTTPStatus`, an enum (a fixed set of named values, from topic 16). You can look a code up with `HTTPStatus(404)` and read its `.phrase` (the standard text), its `.value` (the number), and properties like `.is_client_error`.",
      "analogy": "Parcel tracking stamps. \"Delivered\" is a 2xx. \"Wrong address, that is your mistake\" is a 4xx. \"Our depot is on fire\" is a 5xx. The stamp tells you at a glance whose problem it is, before you read any detail.",
      "code": [
        {
          "language": "python",
          "filename": "status_codes.py",
          "source": "from http import HTTPStatus\n\nfor code in (200, 201, 204, 400, 401, 403, 404, 500):\n    print(code, HTTPStatus(code).phrase)\n\nprint(HTTPStatus.NOT_FOUND.value)\nprint(HTTPStatus(404).is_client_error)\n",
          "output": "200 OK\n201 Created\n204 No Content\n400 Bad Request\n401 Unauthorized\n403 Forbidden\n404 Not Found\n500 Internal Server Error\n404\nTrue",
          "explanation": "`HTTPStatus(code)` finds the enum member for a number, the same way `Status(1)` did in topic 16. `.phrase` is its standard text. `HTTPStatus.NOT_FOUND.value` goes the other way, from the name to the number 404. `.is_client_error` is True for any 4xx code."
        }
      ],
      "productionNote": "Clients decide what to do by branching on the status code (retry on 503, show a login page on 401). Monitoring tools alert when the share of 5xx responses rises, so returning the right class matters operationally.",
      "commonMistakes": [
        "Returning 200 with an error message in the body. Clients and monitoring only look at the status code and will think the request worked.",
        "Using 500 for bad user input. Wrong input is the client's fault, so it should be a 4xx code."
      ],
      "sources": [
        { "title": "Python docs: http.HTTPStatus", "url": "https://docs.python.org/3/library/http.html#http.HTTPStatus" },
        { "title": "MDN: HTTP response status codes", "url": "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status" }
      ]
    },
    {
      "id": "urls-paths-query-strings",
      "title": "URLs, paths and query strings",
      "explanation": "A URL (Uniform Resource Locator) is the address of something on the web. Take `https://api.example.com/books/7?format=json&tag=py&tag=web`. It has these parts:\n\nThe scheme is `https`, the protocol to use.\n\nThe host is `api.example.com`, which machine to talk to.\n\nThe path is `/books/7`, which identifies the thing you want.\n\nThe query string is everything after the `?`. It is a list of `key=value` pairs joined by `&`, used for options such as filters or page numbers. The same key can appear more than once.\n\nThe standard module `urllib.parse` (a module is a file of ready-made code you import) can take URLs apart and build them. `urlsplit` splits a URL into a result object with named parts such as `.scheme`, `.netloc` (the host) and `.path`. `parse_qs` turns a query string into a dictionary where each value is a list, because keys may repeat. `urlencode` goes the other way: it turns a dictionary into a query string and safely encodes special characters, so a space becomes `+`.",
      "analogy": "A postal address. The city is the host, the street and house number are the path (which exact thing), and a delivery note such as \"leave at the back door\" is the query string (options for how to handle it).",
      "code": [
        {
          "language": "python",
          "filename": "urls.py",
          "source": "from urllib.parse import urlsplit, parse_qs, urlencode\n\nparts = urlsplit(\"https://api.example.com/books/7?format=json&tag=py&tag=web\")\nprint(parts.scheme, parts.netloc, parts.path)\nprint(parse_qs(parts.query))\nprint(urlencode({\"q\": \"fast api\", \"page\": 2}))\n",
          "output": "https api.example.com /books/7\n{'format': ['json'], 'tag': ['py', 'web']}\nq=fast+api&page=2",
          "explanation": "`urlsplit` separates the URL; `parts.query` holds the text after the `?`. `parse_qs` groups it into a dictionary, and `tag` has two values because it appeared twice. `urlencode` builds `q=fast+api&page=2` from a dictionary, converting the space to `+` and the number 2 to text."
        }
      ],
      "productionNote": "Servers route requests by path (path to handler function), and use query strings for search, filters and pagination (asking for results a page at a time). Let a library build query strings so special characters are encoded correctly.",
      "commonMistakes": [
        "Putting secrets such as passwords or tokens in a query string. URLs end up in browser history and server logs.",
        "Building query strings by hand with string joining. Characters like spaces, `&` and `=` in the values will break the result unless they are encoded; use `urlencode`."
      ],
      "sources": [
        { "title": "Python docs: urllib.parse", "url": "https://docs.python.org/3/library/urllib.parse.html#urllib.parse.urlsplit" },
        { "title": "MDN: What is a URL?", "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Web_mechanics/What_is_a_URL" }
      ]
    },
    {
      "id": "json-bodies-headers",
      "title": "JSON bodies and headers",
      "explanation": "The body is the data payload of a request or response. Most web APIs use JSON for it, the text format you met in topic 14 with `json.dumps` and `json.loads`.\n\nHeaders are labelled pieces of metadata (information about the message) sent alongside the body. Three are worth knowing now. `Content-Type: application/json` says what kind of data the body holds. `Accept` says what kind of data the client wants back. `Authorization` carries credentials (login details such as a token); topic 33 covers it. Header names are case-insensitive, so `content-type` and `Content-Type` mean the same thing.\n\nOn the network, a body travels as bytes (raw numbers that stand for characters). A string is converted with `.encode(\"utf-8\")`, and the byte count is what a `Content-Length` header would report.\n\nThe example builds a body and checks it. The number 31 is the length in bytes. Since this text is plain English characters, each takes one byte.",
      "analogy": "A parcel. The box contents are the body. The shipping label (sender, \"fragile\", \"contents: books\") is the headers. The courier reads the label to know how to handle the box without opening it.",
      "code": [
        {
          "language": "python",
          "filename": "json_body.py",
          "source": "import json\n\nheaders = {\"Content-Type\": \"application/json\", \"Accept\": \"application/json\"}\nbody = json.dumps({\"title\": \"Dune\", \"year\": 1965})\n\nprint(headers[\"Content-Type\"])\nprint(body)\nprint(len(body.encode(\"utf-8\")))\nprint(json.loads(body)[\"year\"] + 1)\n",
          "output": "application/json\n{\"title\": \"Dune\", \"year\": 1965}\n31\n1966",
          "explanation": "`headers` is a plain dictionary of labels. `json.dumps` turns the dictionary into JSON text. Encoding that text to bytes and taking `len` gives 31, the value a `Content-Length` header would carry. `json.loads` turns the text back into a dictionary, so adding 1 to the year gives 1966."
        }
      ],
      "productionNote": "Every JSON API request and response follows this shape: a Content-Type header plus a JSON body. Frameworks like FastAPI set and read these headers for you, but you will still see them in debugging tools and logs.",
      "commonMistakes": [
        "Sending a JSON body without `Content-Type: application/json`. The server may not know how to read the body and may reject it.",
        "Confusing Python and JSON spellings. Python `True` and `None` become `true` and `null` in JSON."
      ],
      "sources": [
        { "title": "MDN: HTTP headers", "url": "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers" },
        { "title": "MDN: Content-Type header", "url": "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Type" }
      ]
    },
    {
      "id": "rest-resource-design",
      "title": "REST resource design",
      "explanation": "REST is a common style for designing web APIs. A resource is a kind of thing your API manages, such as books. In REST, URLs name things using plural nouns, and the HTTP method says the action.\n\nA collection path like `/books` stands for all books. An item path like `/books/{id}` stands for one book, where `{id}` is a placeholder for that book's number, for example `/books/7`.\n\nTogether they give the standard CRUD set (Create, Read, Update, Delete):\n\nGET /books lists books.\n\nPOST /books creates a book.\n\nGET /books/{id} reads one book.\n\nPATCH /books/{id} updates part of one book.\n\nDELETE /books/{id} deletes one book.\n\nKeep paths free of verbs: `/getBooks` repeats what the method GET already says. Nest at most one level, such as `/authors/{id}/books` for the books of one author.",
      "analogy": "A street of filing drawers. The label on a drawer (books) names the collection, and a card number inside (7) picks one item. What you do, whether looking, adding or removing a card, is your action at the drawer. It is never written on the label.",
      "code": [
        {
          "language": "python",
          "filename": "routes.py",
          "source": "routes = [\n    (\"GET\", \"/books\", \"list books\"),\n    (\"POST\", \"/books\", \"create a book\"),\n    (\"GET\", \"/books/{id}\", \"read one book\"),\n    (\"PATCH\", \"/books/{id}\", \"update a book\"),\n    (\"DELETE\", \"/books/{id}\", \"delete a book\"),\n]\n\nfor method, path, action in routes:\n    print(f\"{method:<7}{path:<12}{action}\")\n",
          "output": "GET    /books      list books\nPOST   /books      create a book\nGET    /books/{id} read one book\nPATCH  /books/{id} update a book\nDELETE /books/{id} delete a book",
          "explanation": "Each tuple holds a method, a path and a description, and the loop unpacks them. `:<7` pads the method to 7 characters, left-aligned, and `:<12` pads the path to 12, as in topic 04. This lines the columns up like a small route table. The `{id}` in these strings is plain text: they are ordinary strings, not f-strings, so Python prints the braces exactly as written."
        }
      ],
      "productionNote": "Public and internal APIs follow this pattern so that documentation and client code are predictable. Anyone who sees GET /books can guess that POST /books creates one.",
      "commonMistakes": [
        "Putting verbs in URLs, such as `/getBooks` or `/deleteBook`. The method already carries the action.",
        "Mixing singular and plural, such as `/book/1` next to `/books`. Pick plural and keep it everywhere."
      ],
      "sources": [
        { "title": "MDN Glossary: REST", "url": "https://developer.mozilla.org/en-US/docs/Glossary/REST" },
        { "title": "RFC 9110: HTTP Semantics, Method definitions", "url": "https://www.rfc-editor.org/rfc/rfc9110#name-method-definitions" }
      ]
    }
  ],
  "quiz": [
    {
      "question": "You want to change only the year of an existing book and leave its other fields alone. Which method fits best?",
      "options": ["GET", "POST", "DELETE", "PATCH"],
      "answerIndex": 3,
      "explanation": "PATCH changes some fields of an existing thing. PUT would replace the whole book. GET only reads, POST creates a new item, and DELETE removes it."
    },
    {
      "question": "What does status code 404 mean, and whose fault is a 4xx response?",
      "options": [
        "Success; nobody's fault",
        "The server crashed; the server's fault",
        "Nothing was found at that path; the client's fault",
        "The data was created; the client's fault"
      ],
      "answerIndex": 2,
      "explanation": "404 Not Found means there is nothing at the requested path. All 4xx codes mean the client made the mistake, while 5xx codes mean the server failed."
    },
    {
      "question": "In the URL path and query `/books/7?format=json`, which part is the path and which is the query string?",
      "options": [
        "Path is `format=json`, query string is `/books/7`",
        "Path is `/books/7`, query string is `format=json`",
        "Path is `/books`, query string is `7?format=json`",
        "Both are the path; there is no query string"
      ],
      "answerIndex": 1,
      "explanation": "The path identifies the thing and ends at the `?`. The query string is everything after the `?`, here `format=json`."
    },
    {
      "question": "Which header tells the receiver that the body is JSON?",
      "options": ["Content-Type: application/json", "Authorization", "Content-Length", "Accept-Language"],
      "answerIndex": 0,
      "explanation": "Content-Type describes what the body contains, so `application/json` says it is JSON. Authorization carries credentials, Content-Length is the size in bytes, and Accept-Language asks for a human language."
    },
    {
      "question": "Why is `GET /deleteBook?id=3` a bad design?",
      "options": [
        "GET requests cannot have a query string",
        "Query strings can only hold text, so ids cannot appear in them",
        "It puts a verb in the URL and uses GET, which should be safe, to change data",
        "DELETE requests are not allowed to have an id"
      ],
      "answerIndex": 2,
      "explanation": "GET is meant to be safe (no data changes), and crawlers or prefetching may call it automatically. The REST way is `DELETE /books/3`: a noun in the path and the action in the method."
    },
    {
      "question": "In a request/response exchange, which side sends the status code?",
      "options": ["The server, in its response", "The client, in its request headers", "The HTTP method", "The URL"],
      "answerIndex": 0,
      "explanation": "The status code is the number in the response that tells the client how the request went. The client sends the method and URL; the server answers with the status."
    },
    {
      "question": "Which of these methods is NOT idempotent (repeating it can change the result again)?",
      "options": ["GET", "PUT", "POST", "DELETE"],
      "answerIndex": 2,
      "explanation": "Sending the same POST twice usually creates two new items. GET, PUT and DELETE leave the server in the same state however many times you repeat them."
    },
    {
      "question": "What does the status code 201 signal?",
      "options": [
        "The request succeeded but there is no content to send back",
        "The item was not found on the server",
        "The server crashed while handling it",
        "The request succeeded and a new item was created"
      ],
      "answerIndex": 3,
      "explanation": "201 Created means the request worked and a new item now exists. A success with no content is 204, not found is 404, and a crash is a 5xx code."
    },
    {
      "question": "Which path is the item URL for book 7 in a REST design?",
      "options": ["/book/7", "/books/7", "/getBook/7", "/books?id=7"],
      "answerIndex": 1,
      "explanation": "REST uses a plural noun for the collection and the id to pick one item: `/books/7`. The action comes from the method, so there is no verb like `getBook` in the path."
    }
  ]
});
