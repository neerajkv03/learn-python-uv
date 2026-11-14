window.TOPICS = window.TOPICS || [];
window.TOPICS.push({
  "id": "33-fastapi-auth",
  "order": 33,
  "title": "Authentication Basics",
  "version": "Python 3.15.2 + uv 0.13.7 + FastAPI 0.162.5 + pwdlib 0.3.1 + PyJWT 2.15.1",
  "summary": "Learn the difference between proving who you are (authentication) and what you may do (authorization), and why the HTTP status codes 401 and 403 differ. Then build a real login flow in FastAPI: hash passwords with pwdlib, issue signed JWT (JSON Web Token, a signed login token) access tokens with PyJWT, and protect endpoints with a current-user dependency.",
  "prerequisites": ["19-stdlib-essentials", "30-fastapi-dependencies", "32-fastapi-structure"],
  "subtopics": [
    {
      "id": "authn-vs-authz",
      "title": "Authentication vs authorization",
      "explanation": "Authentication (often shortened to authn) means proving who you are, for example by giving a username and password. Authorization (authz) means deciding what an already-identified person is allowed to do, for example whether they may delete other people's data. They are two separate questions, and an API must answer both: first \"who is this?\", then \"may they do this?\".\n\nHTTP has a status code for each failure. 401 Unauthorized means the request is not authenticated: credentials are missing, wrong or expired. Despite its name, it is about identity, not permission. 403 Forbidden means the server knows who you are, but you are not allowed to do this.\n\nTwo rules apply to every real system. Never store plain-text passwords (the next sub-topics show how to store them safely). And always use HTTPS in production, which is HTTP encrypted in transit, so passwords and tokens cannot be read by someone watching the network.\n\nThe example below fakes the checks with a plain dictionary (a `dict`, from the collections topic) of users and roles, so you can see the two questions and the two status codes without any web framework. A role is a label such as \"admin\" or \"viewer\" that decides what a user may do. Save it as `authz.py` and run it with `uv run authz.py`.",
      "analogy": "A hotel. Showing your ID at reception is authentication: the hotel learns who you are. Your key card opening only your own room is authorization: being a known guest does not let you into every room. A stranger with no ID gets turned away at the desk (401); a guest who tries someone else's door gets a red light (403).",
      "code": [
        {
          "language": "python",
          "filename": "authz.py",
          "source": "users = {\"ada\": {\"role\": \"admin\"}, \"bob\": {\"role\": \"viewer\"}}\n\n\ndef can_delete(username: str | None) -> str:\n    if username not in users:\n        return \"401 Unauthorized (who are you?)\"\n    if users[username][\"role\"] != \"admin\":\n        return \"403 Forbidden (not allowed)\"\n    return \"200 OK\"\n\n\nfor name in (\"ada\", \"bob\", None):\n    print(can_delete(name))\n",
          "output": "200 OK\n403 Forbidden (not allowed)\n401 Unauthorized (who are you?)",
          "explanation": "The first check is authentication: if the name is not a known user (or is None, meaning no one logged in), the answer is 401. The second check is authorization: bob is known but his role is not \"admin\", so the answer is 403. Only ada passes both checks and gets 200."
        }
      ],
      "productionNote": "Every multi-user system needs both: login to identify people, and roles or permissions to limit them. Check authorization on every endpoint that changes or exposes data, not only at login.",
      "commonMistakes": [
        "Returning 403 for \"not logged in\". A missing or invalid identity is 401; 403 is for a known user who lacks permission.",
        "Checking only authentication and forgetting authorization, so any logged-in user can delete anything.",
        "Storing passwords as plain text, or sending them over plain HTTP instead of HTTPS."
      ],
      "sources": [
        { "title": "MDN: HTTP authentication", "url": "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Authentication" },
        { "title": "MDN: 401 Unauthorized", "url": "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/401" }
      ]
    },
    {
      "id": "oauth2-bearer",
      "title": "OAuth2PasswordBearer and the Authorization header",
      "explanation": "Asking for a username and password on every request would be unsafe and clumsy. Instead, the client logs in once and receives a token: a string that stands in for the password. On each later request, the client sends the token in the `Authorization` header (a named line of extra information sent with an HTTP request) in this exact format: `Authorization: Bearer <token>`. \"Bearer\" means \"whoever bears (carries) this token is let in\", so the token must be kept secret.\n\nFastAPI ships a helper for reading this header. `OAuth2PasswordBearer(tokenUrl=\"token\")` creates a dependency (from the dependencies topic) that pulls the token string out of the `Authorization` header. OAuth2 is just the name of a widely used standard for login and token flows; you only need its name here. The `tokenUrl` argument says which URL clients use to log in and get a token. FastAPI uses it to add an \"Authorize\" button to the `/docs` page.\n\nIf the header is missing or does not start with `Bearer `, the dependency stops the request with status 401 and the body `{\"detail\":\"Not authenticated\"}`, plus a `WWW-Authenticate: Bearer` response header telling the client which scheme to use.\n\nTo try it, put the code in `main.py` in a project that has `fastapi[standard]` installed (see the FastAPI first-app topic), then start it with `uv run fastapi dev`. Open `http://127.0.0.1:8000/docs`, or use a tool like `curl` to send the requests shown in the output.",
      "analogy": "A festival wristband. At the entrance you show your ticket and ID once and get a wristband. At every gate afterwards you just show the wristband instead of repeating the ticket and ID check. Anyone wearing it is let in, so you guard it like the ticket itself.",
      "code": [
        {
          "language": "python",
          "filename": "main.py",
          "source": "from typing import Annotated\n\nfrom fastapi import Depends, FastAPI\nfrom fastapi.security import OAuth2PasswordBearer\n\napp = FastAPI()\n\noauth2_scheme = OAuth2PasswordBearer(tokenUrl=\"token\")\n\n\n@app.get(\"/items/\")\ndef read_items(token: Annotated[str, Depends(oauth2_scheme)]) -> dict[str, str]:\n    return {\"token\": token}\n",
          "output": "GET /items/  with header  Authorization: Bearer abc123  ->  200  {\"token\":\"abc123\"}\n\nGET /items/  with no Authorization header  ->  401  {\"detail\":\"Not authenticated\"}",
          "explanation": "`oauth2_scheme` is the dependency. Declaring `token: Annotated[str, Depends(oauth2_scheme)]` makes FastAPI run it first, and hand the extracted string (without the `Bearer ` prefix) to the function. This endpoint only echoes the token back; it does not check it yet. Real checking comes in the last sub-topic."
        }
      ],
      "productionNote": "Bearer tokens are the standard for single-page apps, mobile apps and service-to-service APIs. Always send them over HTTPS, because anyone who copies a token can use it.",
      "commonMistakes": [
        "Sending the token without the `Bearer ` prefix, so the header is not recognised and the answer is 401.",
        "Putting tokens in URLs (query strings), where they end up in logs and browser history. Use the header."
      ],
      "sources": [
        { "title": "FastAPI: Security - First Steps", "url": "https://fastapi.tiangolo.com/tutorial/security/first-steps/" }
      ]
    },
    {
      "id": "password-hashing",
      "title": "Password hashing (pwdlib)",
      "explanation": "A hash is a one-way scramble of some text. You can turn a password into a hash, but you cannot turn the hash back into the password. To check a login attempt, you hash what the user typed and compare it with the stored hash. This way, even if your database leaks, the real passwords are not in it. You store only the hash, never the password.\n\nA salt is a random extra value mixed into each hash. Because of it, hashing the same password twice gives two different results, which stops attackers from using ready-made tables of common-password hashes. The salt is stored inside the hash string, so checking still works.\n\nArgon2 is a modern password-hashing algorithm that is deliberately slow and memory-hungry, which makes mass guessing expensive. The `pwdlib` library wraps it. Install it with `uv add \"pwdlib[argon2]\"` (the part in square brackets is an extra, an optional bundle of dependencies, as you saw with `fastapi[standard]`).\n\n`PasswordHash.recommended()` builds a hasher using the library's recommended settings. Its `.hash(password)` method returns the hash string, and `.verify(password, hashed)` returns `True` or `False`. Save the example as `hashing.py` and run it with `uv run hashing.py`.",
      "analogy": "A meat grinder. It is easy to turn steak into mince and impossible to turn mince back into steak. To check that someone really has the same steak, you grind theirs the same way and compare the mince. The salt is like a pinch of random spice added each time: the same steak never gives identical mince twice, yet the grinder still knows how to compare.",
      "code": [
        {
          "language": "python",
          "filename": "hashing.py",
          "source": "from pwdlib import PasswordHash\n\npassword_hash = PasswordHash.recommended()\n\nhashed = password_hash.hash(\"s3cret\")\n\nprint(hashed.startswith(\"$argon2id$\"))\nprint(password_hash.verify(\"s3cret\", hashed))\nprint(password_hash.verify(\"wrong\", hashed))\nprint(hashed == password_hash.hash(\"s3cret\"))\n",
          "output": "True\nTrue\nFalse\nFalse",
          "explanation": "Output line 1: the hash string begins with `$argon2id$`, naming the algorithm used. Output line 2: the correct password verifies. Output line 3: a wrong password does not. Output line 4: hashing \"s3cret\" a second time gives a different string because a fresh random salt is used, so comparing hashes with `==` is False. This is why you must call `verify` instead of comparing hashes yourself."
        }
      ],
      "productionNote": "Hash on signup and store only the hash; call `verify` on login. The slowness is intentional, so do not use fast hashes such as MD5 or SHA-256 for passwords. Follow the OWASP (Open Worldwide Application Security Project, which publishes security guides) password storage guidance when choosing settings.",
      "commonMistakes": [
        "Storing plain-text passwords, or passwords hashed with older general-purpose hashes such as MD5 or SHA-256, which are not designed for passwords and attackers can guess billions of times per second.",
        "Comparing two hashes with `==` instead of calling `verify`. Because of the random salt, equal passwords have different hashes."
      ],
      "sources": [
        { "title": "FastAPI: OAuth2 with Password (and hashing), Bearer with JWT tokens", "url": "https://fastapi.tiangolo.com/tutorial/security/oauth2-jwt/#hash-and-verify-the-passwords" },
        { "title": "pwdlib documentation", "url": "https://frankie567.github.io/pwdlib/" },
        { "title": "OWASP Password Storage Cheat Sheet", "url": "https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html" }
      ]
    },
    {
      "id": "jwt-tokens",
      "title": "JWT access tokens (PyJWT)",
      "explanation": "A JWT (JSON Web Token) is a common format for the token the server hands out after login. It is a string of three parts separated by two dots: `header.payload.signature`. The payload is a small JSON object of claims (facts about the token). Two standard claims matter here: `sub` (subject: who the token is for, such as a username; it must be a string) and `exp` (expiry: the time after which the token is invalid).\n\nThe signature is computed from the header and payload using a secret key that only your server knows. Anyone can read the payload, because it is only encoded, not encrypted, so never put passwords or other secrets in it. But nobody can change the payload and keep a valid signature without the secret key. The server also needs no database lookup to trust the token, which is why it is called stateless (the server keeps no record of issued tokens, so it never looks one up to trust it).\n\nInstall PyJWT with `uv add pyjwt` and import it as `jwt`. `jwt.encode(payload, SECRET_KEY, algorithm=\"HS256\")` creates a token (HS256 is a signing method using one shared secret). `jwt.decode(token, SECRET_KEY, algorithms=[\"HS256\"])` checks the signature and expiry and returns the payload as a dict.\n\nWhen decoding fails, PyJWT raises an exception (an error object, from the error-handling topic). `jwt.InvalidSignatureError` means the signature does not match; `jwt.ExpiredSignatureError` means `exp` is in the past. Both are subclasses (more specific kinds) of `jwt.InvalidTokenError`, so catching `InvalidTokenError` handles every bad-token case.\n\nIn a real app the secret key comes from an environment variable or settings file (as in the structure topic), never from the code. Generate a strong one with `uv run python -c \"import secrets; print(secrets.token_hex(32))\"`. The example hard-codes a throwaway key only so it runs as-is; use at least 32 characters for HS256. Save it as `tokens.py`.",
      "analogy": "A concert wristband with a tamper-proof hologram and a printed end date. Anyone can read what is printed on it, but only the organiser owns the machine that makes a valid hologram, so forged or altered bands are spotted at the gate. After the printed date, the band stops working even if it is genuine.",
      "code": [
        {
          "language": "python",
          "filename": "tokens.py",
          "source": "from datetime import datetime, timedelta, timezone\n\nimport jwt\n\n# Load this from the environment in real apps. Use at least 32 characters.\nSECRET_KEY = \"dev-only-secret-key-change-me-0123456789\"\n\npayload = {\"sub\": \"ada\", \"exp\": datetime.now(timezone.utc) + timedelta(minutes=30)}\ntoken = jwt.encode(payload, SECRET_KEY, algorithm=\"HS256\")\n\nprint(token.count(\".\"))\nprint(jwt.decode(token, SECRET_KEY, algorithms=[\"HS256\"])[\"sub\"])\n\ntry:\n    jwt.decode(token, \"another-secret-key-of-enough-length-000\", algorithms=[\"HS256\"])\nexcept jwt.InvalidTokenError as e:\n    print(type(e).__name__)\n\nold = jwt.encode(\n    {\"sub\": \"ada\", \"exp\": datetime.now(timezone.utc) - timedelta(minutes=1)},\n    SECRET_KEY,\n    algorithm=\"HS256\",\n)\ntry:\n    jwt.decode(old, SECRET_KEY, algorithms=[\"HS256\"])\nexcept jwt.InvalidTokenError as e:\n    print(type(e).__name__)\n",
          "output": "2\nada\nInvalidSignatureError\nExpiredSignatureError",
          "explanation": "The token has two dots, so three parts. Decoding with the right key returns the payload, and we print its `sub`. Decoding with a different key fails the signature check. A second token whose `exp` was one minute ago is genuine but expired, so decoding raises ExpiredSignatureError. Both errors are caught by `except jwt.InvalidTokenError`, and `type(e).__name__` shows which one occurred."
        }
      ],
      "productionNote": "Keep access tokens short-lived (for example 15 to 30 minutes), so a stolen token stops working soon. Load the secret key from settings, keep it out of version control, and rotate it if it leaks (all existing tokens then become invalid).",
      "commonMistakes": [
        "Putting passwords or other secrets in the payload. It is readable by anyone who has the token.",
        "Omitting `algorithms=[...]` in `jwt.decode`. You must say which algorithms are accepted, and PyJWT requires the argument.",
        "Hard-coding the secret key in code that is committed to git, or using a short, guessable one."
      ],
      "sources": [
        { "title": "PyJWT: Usage Examples", "url": "https://pyjwt.readthedocs.io/en/stable/usage.html" },
        { "title": "PyJWT: API Reference (exceptions)", "url": "https://pyjwt.readthedocs.io/en/stable/api.html#exceptions" },
        { "title": "FastAPI: OAuth2 with Password (and hashing), Bearer with JWT tokens", "url": "https://fastapi.tiangolo.com/tutorial/security/oauth2-jwt/" }
      ]
    },
    {
      "id": "current-user-dependency",
      "title": "Current-user dependency",
      "explanation": "Now we combine the pieces into a full login flow. The client sends `POST /token` with form fields `username` and `password`. Form data is the encoding browsers use for HTML (the markup language of web pages) forms (`username=ada&password=s3cret`), not JSON. FastAPI reads it with `OAuth2PasswordRequestForm`, which needs the `python-multipart` package; it is already included in `fastapi[standard]`.\n\nIn `Depends()` with empty brackets, FastAPI uses the parameter's type (`OAuth2PasswordRequestForm`) as the dependency.\n\nThe `/token` endpoint looks up the user, checks the password with `verify`, and returns `{\"access_token\": <token>, \"token_type\": \"bearer\"}`. If the user is unknown or the password is wrong, it raises `HTTPException` with status 401. The `WWW-Authenticate: Bearer` header is added to the 401 response, as the standard requires. Notice that both failures use the same message, \"Incorrect username or password\", so the response text does not reveal which usernames exist. (Response time can still differ, because the slow hash check is skipped for an unknown user; production code also checks a dummy hash in that case.)\n\nNext, `get_current_user` is a dependency that depends on `oauth2_scheme`. It receives the token string, decodes it with `jwt.decode`, reads `sub`, and finds that user. If anything is wrong (bad signature, expired, malformed, or user gone), it raises 401 with `\"Could not validate credentials\"`. Any endpoint that declares this dependency is automatically protected, and receives the user.\n\nThe example keeps users in a dict called `users_db` instead of a real database to stay short. It is stored with a hashed password, never a plain one. A small helper function `unauthorized(detail)` builds the repeated 401 error. Save it as `main.py` and start it with `uv run fastapi dev`.",
      "analogy": "Reception checks your ID once and gives you a wristband (the `/token` endpoint). Every gate then scans the wristband to know who you are (the current-user dependency), without bothering reception again. A gate with a faulty or expired wristband sends you back to reception.",
      "code": [
        {
          "language": "python",
          "filename": "main.py",
          "source": "from datetime import datetime, timedelta, timezone\nfrom typing import Annotated\n\nimport jwt\nfrom fastapi import Depends, FastAPI, HTTPException, status\nfrom fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm\nfrom pwdlib import PasswordHash\n\n# Load this from the environment in real apps. Use at least 32 characters.\nSECRET_KEY = \"dev-only-secret-key-change-me-0123456789\"\nALGORITHM = \"HS256\"\n\napp = FastAPI()\npassword_hash = PasswordHash.recommended()\noauth2_scheme = OAuth2PasswordBearer(tokenUrl=\"token\")\n\nusers_db = {\n    \"ada\": {\"username\": \"ada\", \"hashed_password\": password_hash.hash(\"s3cret\")},\n}\n\n\ndef unauthorized(detail: str) -> HTTPException:\n    return HTTPException(\n        status_code=status.HTTP_401_UNAUTHORIZED,\n        detail=detail,\n        headers={\"WWW-Authenticate\": \"Bearer\"},\n    )\n\n\n@app.post(\"/token\")\ndef login(form: Annotated[OAuth2PasswordRequestForm, Depends()]) -> dict[str, str]:\n    user = users_db.get(form.username)\n    if user is None or not password_hash.verify(form.password, user[\"hashed_password\"]):\n        raise unauthorized(\"Incorrect username or password\")\n    expires = datetime.now(timezone.utc) + timedelta(minutes=30)\n    token = jwt.encode(\n        {\"sub\": user[\"username\"], \"exp\": expires}, SECRET_KEY, algorithm=ALGORITHM\n    )\n    return {\"access_token\": token, \"token_type\": \"bearer\"}\n\n\ndef get_current_user(token: Annotated[str, Depends(oauth2_scheme)]) -> dict[str, str]:\n    try:\n        username = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])[\"sub\"]\n    except jwt.InvalidTokenError:\n        raise unauthorized(\"Could not validate credentials\")\n    user = users_db.get(username)\n    if user is None:\n        raise unauthorized(\"Could not validate credentials\")\n    return user\n\n\nCurrentUser = Annotated[dict[str, str], Depends(get_current_user)]\n\n\n@app.get(\"/users/me\")\ndef me(user: CurrentUser) -> dict[str, str]:\n    return {\"username\": user[\"username\"]}\n",
          "output": "POST /token  form: username=ada&password=s3cret  ->  200  {\"access_token\":\"<token>\",\"token_type\":\"bearer\"}\n\nPOST /token  form: username=ada&password=wrong  ->  401  {\"detail\":\"Incorrect username or password\"}\n\nGET /users/me  with header  Authorization: Bearer <token>  ->  200  {\"username\":\"ada\"}\n\nGET /users/me  with header  Authorization: Bearer garbage  ->  401  {\"detail\":\"Could not validate credentials\"}",
          "explanation": "`login` verifies the password against the stored hash and signs a token whose `sub` is the username and whose `exp` is 30 minutes away. `get_current_user` reverses this: it decodes the token, takes `sub`, and returns the matching user, or raises 401. `CurrentUser` is an `Annotated` alias (from the dependencies topic), so `me` only has to write `user: CurrentUser`. The response contains only the username, never the hashed password. The `<token>` placeholder stands for a long string that is different on every login."
        },
        {
          "language": "bash",
          "filename": "try-login.sh",
          "source": "curl -s -X POST http://127.0.0.1:8000/token -d \"username=ada&password=s3cret\"\ncurl -s http://127.0.0.1:8000/users/me -H \"Authorization: Bearer <token>\"\n",
          "output": "{\"access_token\":\"<token>\",\"token_type\":\"bearer\"}\n{\"username\":\"ada\"}",
          "explanation": "Run these in Git Bash or a macOS/Linux terminal (see topic 31). With the server running, open a second terminal and run these commands. `-d` sends the form fields, and `-H` adds a header. Replace `<token>` in the second command with the `access_token` value from the first. You can also click \"Authorize\" in `/docs`, log in as ada with password s3cret, and then try `/users/me` from the page."
        }
      ],
      "productionNote": "Login endpoints for web and mobile APIs follow this shape. Role checks build on top: write a second dependency that takes the current user and raises 403 if the role is wrong. Replace `users_db` with a database table (topic on SQLModel) and the secret with a setting loaded from the environment.",
      "commonMistakes": [
        "Using different error messages for \"no such user\" and \"wrong password\". That helps attackers discover which usernames exist.",
        "Returning the user record (with `hashed_password`) from `/users/me`. Return only the fields the client needs.",
        "Sending JSON to `/token`. It expects form data, so a JSON body gives a 422 validation error."
      ],
      "sources": [
        { "title": "FastAPI: Simple OAuth2 with Password and Bearer", "url": "https://fastapi.tiangolo.com/tutorial/security/simple-oauth2/" },
        { "title": "FastAPI: OAuth2 with Password (and hashing), Bearer with JWT tokens", "url": "https://fastapi.tiangolo.com/tutorial/security/oauth2-jwt/" },
        { "title": "FastAPI: Get Current User", "url": "https://fastapi.tiangolo.com/tutorial/security/get-current-user/" }
      ]
    }
  ],
  "quiz": [
    {
      "question": "A user is logged in with a valid token but tries to delete another user's data, which their role does not permit. Which status code is correct?",
      "options": [
        "401 Unauthorized",
        "404 Not Found",
        "200 OK",
        "403 Forbidden"
      ],
      "answerIndex": 3,
      "explanation": "The server knows who the user is (authentication succeeded) but they are not allowed to do this (authorization failed), which is 403. 401 is for missing or invalid credentials."
    },
    {
      "question": "Why does hashing the same password twice with pwdlib give two different strings?",
      "options": [
        "The hash function is broken and returns random text instead of a repeatable result",
        "The first hash is encrypted and the second is not, so the two strings look different",
        "A random salt is mixed into every hash, and verify reads it back from the stored hash",
        "Python adds the current time to every string it hashes before the hash is stored"
      ],
      "answerIndex": 2,
      "explanation": "Each hash includes a fresh random salt, so equal passwords produce different hashes. The salt is stored inside the hash string, which lets verify still check a password correctly."
    },
    {
      "question": "Can anyone who holds a JWT read its payload, and what stops them from changing it?",
      "options": [
        "Yes, the payload is readable; changing it breaks the signature, which only the secret key can produce",
        "No, the payload is encrypted with the secret key, so only the server can read it",
        "Yes, and nothing stops them, because JWTs cannot be protected against any changes",
        "No, only the server can open a JWT, because the token is locked with a key that clients never receive"
      ],
      "answerIndex": 0,
      "explanation": "A JWT payload is only encoded, so anyone can read it and it must hold no secrets. It is signed, so any change makes the signature invalid when the server decodes it with the secret key."
    },
    {
      "question": "Which header carries the access token on a request, and in what format?",
      "options": [
        "Token: <token>",
        "Authorization: Bearer <token>",
        "Content-Type: <token>",
        "Authorization: <token> Bearer"
      ],
      "answerIndex": 1,
      "explanation": "The token goes in the Authorization header, preceded by the word Bearer and a space. OAuth2PasswordBearer expects exactly this format."
    },
    {
      "question": "A client sends a genuine token whose exp time is already in the past. What happens in the login example?",
      "options": [
        "The request succeeds, because the signature is still valid",
        "jwt.decode raises ExpiredSignatureError, which is an InvalidTokenError, so the endpoint answers 401 Could not validate credentials",
        "The server answers 403 Forbidden, because the user is known but lacks permission to use this endpoint at all",
        "The server automatically issues a new token and continues"
      ],
      "answerIndex": 1,
      "explanation": "decode checks the expiry as well as the signature. An expired token raises ExpiredSignatureError, a subclass of InvalidTokenError, which get_current_user catches and turns into a 401. The client must log in again."
    },
    {
      "question": "A client sends the JSON body {\"username\": \"ada\", \"password\": \"s3cret\"} to POST /token. What happens?",
      "options": [
        "422 validation error, because /token expects form data",
        "200 with an access token, because the credentials are correct",
        "401 Incorrect username or password, because the login failed",
        "404 Not Found, because the /token route does not accept JSON"
      ],
      "answerIndex": 0,
      "explanation": "/token reads OAuth2PasswordRequestForm, which expects form-encoded fields, not JSON. FastAPI cannot find the fields, so it answers 422 (validation error) before the login code runs."
    }
  ]
});
