window.TOPICS = window.TOPICS || [];
window.TOPICS.push({
 "id": "22-concurrency-asyncio",
 "order": 22,
 "title": "Concurrency & asyncio",
 "version": "Python 3.15.2 + uv 0.13.7",
 "summary": "Learn how to make programs do more than one thing at a time. You will tell I/O-bound work (mostly waiting, such as network or disk) from CPU-bound work (mostly computing), then use threads, processes, and asyncio coroutines for the right job.",
 "prerequisites": [
  "21-code-quality"
 ],
 "subtopics": [
  {
   "id": "concurrency-vs-parallelism",
   "title": "Concurrency vs parallelism",
   "explanation": "Concurrency means making progress on several tasks by switching between them whenever one has to wait. Parallelism means literally running several things at the same instant, each on its own CPU core (a core is one independent processing unit inside your computer's chip).\n\nBefore picking a tool, ask what your task spends its time on. I/O-bound work (I/O means input/output) is mostly waiting: for a network reply, a disk read, or a database answer. CPU-bound work is mostly computing: resizing an image, crunching numbers, compressing data.\n\nStandard CPython (the usual Python you install) has a GIL, the Global Interpreter Lock. It lets only one thread run Python code at a time. A thread is a lightweight line of execution inside a program. Because of the GIL, threads help I/O-bound work (a waiting thread lets another one run) but do not speed up pure computation. For CPU-bound work you use processes, which are separate running copies of Python, each with its own GIL.\n\nPython also has an optional free-threaded build with no GIL. It is officially supported, but it is not the default, so check the Python docs before relying on it.",
   "analogy": "One chef juggling three pans while each simmers is concurrency. Three chefs each cooking one dish at the same time is parallelism. Waiting for an oven is I/O-bound: one chef can juggle other pans while it works. A huge batch of chopping is CPU-bound: only more chefs (processes) speed it up, because one chef's hands can only do one cut at a time (the GIL).",
   "code": [
    {
     "language": "python",
     "filename": "kinds.py",
     "source": "tasks = {\n    \"download file\": \"I/O-bound\",\n    \"resize image\": \"CPU-bound\",\n    \"query database\": \"I/O-bound\",\n}\n\nfor task, kind in tasks.items():\n    print(f\"{task}: {kind}\")",
     "output": "download file: I/O-bound\nresize image: CPU-bound\nquery database: I/O-bound",
     "explanation": "This is a thinking exercise in code form. Classify each job first: waiting jobs get threads or asyncio, computing jobs get processes."
    }
   ],
   "productionNote": "Choosing the right model is the first design decision for web servers, scrapers, and data jobs. Measure first: if plain sequential code is fast enough, keep it.",
   "commonMistakes": [
    "Using threads to speed up pure computation on a GIL build; the threads take turns and you gain nothing.",
    "Adding concurrency where simple sequential code is already fast enough, which only adds bugs and complexity."
   ],
   "sources": [
    {
     "title": "Python docs: Concurrent execution",
     "url": "https://docs.python.org/3/library/concurrency.html"
    },
    {
     "title": "Python glossary: GIL",
     "url": "https://docs.python.org/3/glossary.html#term-global-interpreter-lock"
    },
    {
     "title": "Python docs: Free-threading HOWTO",
     "url": "https://docs.python.org/3/howto/free-threading-python.html"
    }
   ]
  },
  {
   "id": "threads-concurrent-futures",
   "title": "Threads with concurrent.futures",
   "explanation": "The concurrent.futures module offers ThreadPoolExecutor, a pool of worker threads that take jobs from a shared queue. You create it with max_workers (how many threads), then submit work. The simplest way is executor.map(func, items), which calls func on every item and gives back results in the same order as the input, so the output is deterministic.\n\nAlways use the executor in a with block. When the block ends, the pool object (called an executor) waits for all jobs to finish and cleans up the threads for you.\n\nThreads share memory, meaning they can all see and change the same variables. If several threads change the same variable (for example a counter), they can overwrite each other's updates; this bug is called a race condition. Protect shared data with a threading.Lock, used as with lock: so only one thread at a time runs that block.",
   "analogy": "A call centre with four operators taking calls from one queue. Each operator handles one call at a time, and the queue hands out the next call to whoever is free. If two operators write on the same order pad at once they can smudge each other's entries; a Lock is the rule that only one writes at a time.",
   "code": [
    {
     "language": "python",
     "filename": "threads.py",
     "source": "import time\nfrom concurrent.futures import ThreadPoolExecutor\n\n\ndef fetch(page: int) -> str:\n    time.sleep(0.1)  # pretend we wait for the network\n    return f\"page {page} ok\"\n\n\nwith ThreadPoolExecutor(max_workers=3) as pool:\n    for result in pool.map(fetch, [1, 2, 3]):\n        print(result)",
     "output": "page 1 ok\npage 2 ok\npage 3 ok",
     "explanation": "All three sleeps overlap, so the total is about 0.1 s instead of 0.3 s. Timings vary by machine, so we do not print them. map returns results in input order."
    },
    {
     "language": "python",
     "filename": "locked_counter.py",
     "source": "import threading\nfrom concurrent.futures import ThreadPoolExecutor\n\ncount = 0\nlock = threading.Lock()\n\n\ndef add_many(n: int) -> None:\n    global count\n    for _ in range(n):\n        with lock:\n            count += 1\n\n\nwith ThreadPoolExecutor(max_workers=4) as pool:\n    for _ in range(4):\n        pool.submit(add_many, 1000)\n\nprint(count)",
     "output": "4000",
     "explanation": "submit schedules one call and returns immediately. The lock makes each increment safe, and leaving the with block waits for all jobs, so the final count is always 4000."
    }
   ],
   "productionNote": "Use thread pools for many concurrent HTTP calls or file reads in scripts and batch jobs. Prefer returning results over mutating shared state, so you need fewer locks.",
   "commonMistakes": [
    "Printing from many threads and expecting a fixed order; collect results with map instead.",
    "Unprotected shared counters or lists, which cause race conditions; guard them with a Lock."
   ],
   "sources": [
    {
     "title": "Python docs: ThreadPoolExecutor",
     "url": "https://docs.python.org/3/library/concurrent.futures.html#threadpoolexecutor"
    }
   ]
  },
  {
   "id": "processes-cpu-bound",
   "title": "Processes for CPU-bound work",
   "explanation": "ProcessPoolExecutor has the same interface as ThreadPoolExecutor, but it runs your function in separate worker processes. Each process has its own Python interpreter and its own GIL, so CPU-bound work can use several cores at once.\n\nProcesses do not share memory. Arguments and results are copied between them using pickling (turning an object into bytes and back), so they must be picklable. Plain numbers, strings, lists, and top-level functions (defined directly in the file, not inside another function) are fine; huge objects make the copying slow.\n\nYou must wrap your starting code in if __name__ == \"__main__\":. On Windows and macOS, and on Linux since Python 3.14, new worker processes start by importing your main file again. Without the guard, each worker would run the start-up code again, which crashes or spawns processes endlessly.",
   "analogy": "Hiring extra kitchens instead of extra hands in one kitchen. You get much more capacity, but ingredients must be shipped over to each kitchen.",
   "code": [
    {
     "language": "python",
     "filename": "processes.py",
     "source": "from concurrent.futures import ProcessPoolExecutor\n\n\ndef count_primes(limit: int) -> int:\n    return sum(\n        1\n        for n in range(2, limit)\n        if all(n % d for d in range(2, int(n ** 0.5) + 1))\n    )\n\n\ndef main() -> None:\n    with ProcessPoolExecutor() as pool:\n        print(list(pool.map(count_primes, [10, 100, 1000])))\n\n\nif __name__ == \"__main__\":\n    main()",
     "output": "[4, 25, 168]",
     "explanation": "There are 4 primes below 10, 25 below 100, and 168 below 1000. The function is defined at the top level so it can be pickled, and main() runs only in the original process thanks to the guard."
    }
   ],
   "productionNote": "Good for image processing, data crunching, and report generation. Send small inputs and results, and give each process a big enough chunk of work to outweigh the cost of starting it.",
   "commonMistakes": [
    "Forgetting the __main__ guard, which causes a crash or endless process spawning.",
    "Sending huge objects between processes; copying them can cost more than the computation saves."
   ],
   "sources": [
    {
     "title": "Python docs: ProcessPoolExecutor",
     "url": "https://docs.python.org/3/library/concurrent.futures.html#processpoolexecutor"
    },
    {
     "title": "Python docs: spawn and forkserver start methods",
     "url": "https://docs.python.org/3/library/multiprocessing.html#the-spawn-and-forkserver-start-methods"
    }
   ]
  },
  {
   "id": "async-await",
   "title": "async and await",
   "explanation": "asyncio is Python's built-in way to do many waiting tasks in a single thread. A function defined with async def is a coroutine: a function that can pause itself. Inside it, await pauses until another awaitable (something you can wait for) finishes. While it is paused, the event loop, the scheduler that runs coroutines, can run other coroutines.\n\nYou start the event loop with asyncio.run(main()), usually once at the bottom of your program. Calling an async function without await does not run it; it only creates a coroutine object, and Python warns that it was never awaited.\n\nPausing only works if the code actually yields control. Use await asyncio.sleep(...) in async code, never time.sleep, which blocks the whole loop and freezes every other task.",
   "analogy": "A waiter takes an order, and while the kitchen cooks, serves other tables instead of standing still at the kitchen door.",
   "code": [
    {
     "language": "python",
     "filename": "async_basics.py",
     "source": "import asyncio\n\n\nasync def brew(drink: str) -> str:\n    await asyncio.sleep(0.1)  # pause without blocking the loop\n    return f\"{drink} ready\"\n\n\nasync def main() -> None:\n    print(await brew(\"tea\"))\n\n\nasyncio.run(main())",
     "output": "tea ready",
     "explanation": "asyncio.run starts the loop and runs main() to completion. await brew(\"tea\") pauses main until brew returns its string."
    }
   ],
   "productionNote": "Async shines in web frameworks (such as FastAPI, which you meet in topic 28), high-concurrency network clients, and websockets (two-way live connections). Every library you call inside async code must itself be async-friendly, or the loop stalls.",
   "commonMistakes": [
    "Forgetting await, so the coroutine never runs and Python shows a 'never awaited' warning.",
    "Calling blocking code such as time.sleep or the requests library (a popular third-party package for HTTP calls) inside an async function, which freezes the event loop."
   ],
   "sources": [
    {
     "title": "Python docs: Coroutines",
     "url": "https://docs.python.org/3/library/asyncio-task.html#coroutines"
    },
    {
     "title": "Python docs: asyncio.run",
     "url": "https://docs.python.org/3/library/asyncio-runner.html#asyncio.run"
    }
   ]
  },
  {
   "id": "gather-and-taskgroup",
   "title": "asyncio.gather and TaskGroup",
   "explanation": "A task is a coroutine scheduled to run on the event loop. await asyncio.gather(a(), b(), c()) starts several coroutines concurrently and returns their results as a list in argument order, not in finishing order.\n\nasyncio.TaskGroup is the structured, safer option. Inside async with asyncio.TaskGroup() as tg: (async with is the async version of with, used the same way), call tg.create_task(...) for each job. The block waits until all tasks are done.\n\nIf one task fails, the others are cancelled (told to stop early) and the errors are raised together as an ExceptionGroup, which bundles several errors into one. You catch it with except*, which handles the bundled errors of a given type. (These are advanced extras: the second example below shows them, and you can skip it on a first read.)\n\nTo limit how long something may take, wrap it in async with asyncio.timeout(seconds):. If time runs out, it raises TimeoutError.",
   "analogy": "A team leader who sends everyone out together and waits until all report back (that is gather). TaskGroup adds one rule: if one member hits trouble, the leader also recalls the rest of the team. A timeout is a stopwatch on the whole job: if it runs past the limit, the leader calls the team back.",
   "code": [
    {
     "language": "python",
     "filename": "gather_taskgroup.py",
     "source": "import asyncio\n\n\nasync def fetch(name: str, delay: float) -> str:\n    await asyncio.sleep(delay)\n    return f\"{name} done\"\n\n\nasync def main() -> None:\n    results = await asyncio.gather(fetch(\"a\", 0.2), fetch(\"b\", 0.1))\n    print(results)\n\n    async with asyncio.TaskGroup() as tg:\n        t1 = tg.create_task(fetch(\"x\", 0.1))\n        t2 = tg.create_task(fetch(\"y\", 0.05))\n    print(t1.result(), t2.result())\n\n\nasyncio.run(main())",
     "output": "['a done', 'b done']\nx done y done",
     "explanation": "Even though b finishes first, gather keeps argument order. The TaskGroup block exits only when both tasks are finished, so reading .result() afterwards is safe."
    },
    {
     "language": "python",
     "filename": "taskgroup_error.py",
     "source": "import asyncio\n\n\nasync def slow() -> None:\n    await asyncio.sleep(1)\n\n\nasync def fail() -> None:\n    await asyncio.sleep(0.01)\n    raise ValueError(\"boom\")\n\n\nasync def main() -> None:\n    try:\n        async with asyncio.TaskGroup() as tg:\n            tg.create_task(slow())\n            tg.create_task(fail())\n    except* ValueError as group:\n        print(f\"caught {len(group.exceptions)} error: {group.exceptions[0]}\")\n\n\nasyncio.run(main())",
     "output": "caught 1 error: boom",
     "explanation": "fail raises after a short wait, so the group cancels slow right away instead of waiting a full second. The error arrives wrapped in an ExceptionGroup, and except* ValueError unpacks it."
    }
   ],
   "productionNote": "Use this to call several services in parallel per web request, or for jobs that send work to many tasks at once, then collect the results. Prefer TaskGroup for new code because it cancels siblings on failure and never leaves tasks behind.",
   "commonMistakes": [
    "Awaiting tasks one by one in a loop, which runs them sequentially instead of concurrently.",
    "Fire-and-forget tasks with no saved reference; Python can delete them before they finish, so keep each task in a variable or list until it is done."
   ],
   "sources": [
    {
     "title": "Python docs: Running tasks concurrently",
     "url": "https://docs.python.org/3/library/asyncio-task.html#running-tasks-concurrently"
    },
    {
     "title": "Python docs: Task groups",
     "url": "https://docs.python.org/3/library/asyncio-task.html#task-groups"
    }
   ]
  }
 ],
 "quiz": [
  {
   "question": "On standard CPython (with the GIL), what should you use to speed up CPU-heavy computation?",
   "options": [
    "Processes with ProcessPoolExecutor",
    "Threads with ThreadPoolExecutor and more workers",
    "More await statements in the code",
    "time.sleep between steps"
   ],
   "answerIndex": 0,
   "explanation": "The GIL lets only one thread run Python code at a time, so threads do not speed up computation. Processes each have their own interpreter and GIL and can use several cores."
  },
  {
   "question": "What happens if you call an async function without await?",
   "options": [
    "It runs immediately and returns its result",
    "It raises a SyntaxError",
    "It only creates a coroutine object",
    "It runs in a new thread"
   ],
   "answerIndex": 2,
   "explanation": "Calling an async function only creates a coroutine object. Nothing executes until it is awaited or scheduled, and Python warns that it was never awaited."
  },
  {
   "question": "In what order does asyncio.gather return its results?",
   "options": [
    "The order the coroutines finish",
    "Alphabetical order",
    "Random order",
    "The order of the arguments"
   ],
   "answerIndex": 3,
   "explanation": "gather returns a list matching the order of the awaitables you passed in, regardless of which finished first."
  },
  {
   "question": "Why is the if __name__ == \"__main__\": guard required with ProcessPoolExecutor?",
   "options": [
    "Workers re-import the main file, re-running start-up code",
    "It makes the whole program run noticeably faster",
    "It is needed so integers can be pickled between processes",
    "It disables the GIL for all of the worker processes"
   ],
   "answerIndex": 0,
   "explanation": "On Windows, macOS and (since Python 3.14) Linux, workers start by importing your main file again. Without the guard, that import would launch more pools and crash or spawn endlessly."
  },
  {
   "question": "Which should you use inside async code to wait?",
   "options": [
    "time.sleep",
    "asyncio.sleep",
    "input",
    "threading.Lock"
   ],
   "answerIndex": 1,
   "explanation": "asyncio.sleep pauses only the current coroutine and lets the loop run others. time.sleep blocks the entire event loop."
  },
  {
   "question": "Why wrap `counter += 1` in `with lock:` when several threads run it?",
   "options": [
    "It makes all of the threads run noticeably faster",
    "Locks are required before any thread can start",
    "It moves the work to a separate process",
    "So only one thread changes the shared value at a time"
   ],
   "answerIndex": 3,
   "explanation": "Without the lock, two threads can read the same old value and overwrite each other's update (a race condition). The lock lets one thread at a time run the block."
  },
  {
   "question": "In an `asyncio.TaskGroup`, what happens to the other tasks when one task raises an error?",
   "options": [
    "They keep running to the end, and the group waits for all of them",
    "They are cancelled and the errors arrive as an ExceptionGroup",
    "The error is silently ignored and nothing is raised",
    "The program restarts the failed task automatically"
   ],
   "answerIndex": 1,
   "explanation": "TaskGroup cancels the remaining tasks and raises the collected errors together as an ExceptionGroup, which you catch with except*."
  }
 ]
});
