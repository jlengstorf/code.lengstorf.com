+++

date = "2016-10-23"
type = "blog"

draft = true

seo_title = "TKTK"
description = "Learn how to use Ramda to build a real-world app using test-driven, functional JavaScript in this in-depth tutorial."

title = "Tutorial: How to Use TDD"
subtitle = "Learn how to use Ramda to build a real-world app using test-driven, functional JavaScript in this in-depth tutorial."

slug = "learn-tdd"

images = [
    "/images/code-lengstorf.jpg"
]

category = "front-end"
tag = [
    "tdd",
    "javascript",
]
_videoid = "ICYLOZuFMz8"
repo_url = "https://github.com/jlengstorf/learn-tdd"

+++

## Create a new directory

``` sh
# Create a new directory for the project
mkdir learn-tdd

# Move into the new project folder
cd learn-tdd/
```

### Initialize the project for use with `npm`.

``` sh
# Initialize the project with npm.
npm init

# Answer the prompts. npm will generate a `package.json` for us.
```

## Set it up for testing

```sh
# Install Jasmine and a reporter as development dependencies.
npm i -D jasmine jasmine-terminal-reporter
```

{{% aside %}}
  **NOTE:** `npm i -D` is a shortcut for `npm install --save-dev`. Laziness wins!
{{% /aside %}}

### Create a test runner for Jasmine.

In your app directory, create a new folder.

``` sh
# Create a directory for tests.
mkdir spec

# Move into the directory.
cd spec/

# Create a file to run the tests.
touch index.js
```

Edit `spec/index.js` and add the following:

``` js
'use strict';

// Load Jasmine and a reporter.
const Jasmine = require('jasmine');
const Reporter = require('jasmine-terminal-reporter');

// Create new instances of Jasmine and the reporter.
const jasmine = new Jasmine();
const reporter = new Reporter({ isVerbose: true });

// Configure Jasmine so it can find our test files.
jasmine.loadConfig({
  spec_dir: 'spec',
  spec_files: [
    'index.js',
    '**/*[sS]pec.js',
  ],
});

// Add the custom reporter so the output is easier to read.
jasmine.addReporter(reporter);

// Run the tests.
jasmine.execute();
```

### Test the output.

``` sh
# Move back to the project root.
cd ..

# Make sure we’re in the right place.
pwd
# => /Users/jlengstorf/dev/code.lengstorf.com/projects/learn-tdd

# Run the tests using our new script.
./node_modules/.bin/jasmine spec
```

``` text
$ ./node_modules/.bin/jasmine spec
Started
Running 0 specs.


No specs found
Finished in 0.002 seconds


0 specs, 0 failures
Finished in 0 seconds
```

### Create a test spec to make sure things work as expected.

``` sh
# Create a new file for the test spec.
touch spec/test.spec.js
```

Edit `spec/test.spec.js` and add the following:

``` js
// Tests are grouped using a `describe` block.
describe('TDD with Jasmine', () => {

  // Each test uses plain English to describe what’s being tested.
  it('uses a plain-English approach', () => {
    expect(true).toBe(true);
  });

});
```

### Make sure the test is working as expected.

``` sh
# Run the tests again.
./node_modules/.bin/jasmine spec
```

``` text
$ ./node_modules/.bin/jasmine spec
Started
Running 1 spec.
TDD with Jasmine
.    uses a plain-English approach: passed



1 spec, 0 failures
Finished in 0.005 seconds


1 spec, 0 failures
Finished in 0 seconds
```

## Add coverage testing with Istanbul.

``` sh
# Install Istanbul as a development dependency.
npm i -D istanbul
```

And that's actually all we have to do.

### Run the test.

``` sh
# Use Istanbul to generate a test coverage report AND run the tests.
./node_modules/.bin/istanbul cover spec
```

``` text
$ ./node_modules/.bin/istanbul cover spec
Started
Running 1 spec.
TDD with Jasmine
.    uses a plain-English approach: passed



1 spec, 0 failures
Finished in 0.005 seconds


1 spec, 0 failures
Finished in 0 seconds
=============================================================================
Writing coverage object [/Users/jlengstorf/dev/code.lengstorf.com/projects/learn-tdd/coverage/coverage.json]
Writing coverage reports at [/Users/jlengstorf/dev/code.lengstorf.com/projects/learn-tdd/coverage]
=============================================================================

=============================== Coverage summary ===============================
Statements   : 100% ( 10/10 )
Branches     : 100% ( 0/0 )
Functions    : 100% ( 0/0 )
Lines        : 100% ( 10/10 )
================================================================================
```

We're off to a good start: 100% coverage! Nevermind that we haven't written any application code yet — let's just take the win.

### Create an `npm` script to make testing faster.

In `package.json`, make the changes shown in green:

``` diff
  {
    "name": "learn-tdd",
    "version": "0.0.0",
    "description": "A small, real-world use case for Ramda, as part of a tutorial.",
    "main": "src/index.js",
    "scripts": {
-     "test": "echo \"Error: no test specified\" && exit 1"
+     "test": "npm run test:coverage --silent",
+     "test:coverage": "istanbul cover spec"
    },
    "repository": {
      "type": "git",
      "url": "git+ssh://git@github.com/jlengstorf/learn-tdd.git"
    },
    "keywords": [
      "ramda",
      "tutorial",
      "walkthrough",
      "Facebook"
    ],
    "author": "Jason Lengstorf <jason@lengstorf.com> (@jlengstorf)",
    "license": "ISC",
    "bugs": {
      "url": "https://github.com/jlengstorf/learn-tdd/issues"
    },
    "homepage": "https://github.com/jlengstorf/learn-tdd#readme",
    "devDependencies": {
      "istanbul": "^0.4.5",
      "jasmine": "^2.5.2",
      "jasmine-terminal-reporter": "^1.0.2"
    }
  }
```

{{% aside %}}
  **NOTE:** The `--silent` flag keeps npm from dumping dozens of lines of stack traces into the terminal, which often aren't very helpful. Since the tests have their own (more helpful) output, we don't need the extra noise in this case.
{{% /aside %}}

## Set up code style linting

``` sh
# Install JSCS as a development dependency.
npm i -D jscs
```

### Create a `.jscsrc`

``` json
{
    "preset": "airbnb",
    "fileExtensions": [".js", "jscs"]
}
```

### Run the test.

``` sh
# Run the JSCS style checker.
./node_modules/.bin/jscs spec/
```

But wait — we need this to run on our app, too. So let's add a `src/` directory to contain our app's code.

``` sh
# Add a directory for application code.
mkdir src

# Run JSCS on both the application code and the tests.
./node_modules/.bin/jscs src/ spec/
```

Right now, nothing happens. But if we violate our code standards — for example, if we remove the last semicolon in `spec/test.spec.js` — JSCS gives us a really easy-to-follow error message:

``` text
$ ./node_modules/.bin/jscs src/ spec/
requireSemicolons: Missing semicolon after statement at spec/test.spec.js :
     6 |  });
     7 |
     8 |})
---------^
     9 |


1 code style error found.
```

### Create a shortcut in npm.

We'll want to run all our tests at once, so make the following changes to `package.json`:

``` diff
  {
    "name": "learn-tdd",
    "version": "0.0.0",
    "description": "A small, real-world use case for Ramda, as part of a tutorial.",
    "main": "src/index.js",
    "scripts": {
-     "test": "npm run test:coverage --silent",
+     "test": "npm run test:style --silent && npm run test:coverage --silent",
+     "test:style": "jscs src/ spec/",
      "test:coverage": "istanbul cover spec"
    },
    "repository": {
      "type": "git",
      "url": "git+ssh://git@github.com/jlengstorf/learn-tdd.git"
    },
    "keywords": [
      "ramda",
      "tutorial",
      "walkthrough",
      "Facebook"
    ],
    "author": "Jason Lengstorf <jason@lengstorf.com> (@jlengstorf)",
    "license": "ISC",
    "bugs": {
      "url": "https://github.com/jlengstorf/learn-tdd/issues"
    },
    "homepage": "https://github.com/jlengstorf/learn-tdd#readme",
    "devDependencies": {
      "istanbul": "^0.4.5",
      "jasmine": "^2.5.2",
      "jasmine-terminal-reporter": "^1.0.2",
      "jscs": "^3.0.7"
    }
  }
```

Now it's a little more obvious why we created a `test:coverage` script instead of calling `istanbul` directly from the `test` script: by keeping them separate, we can call multiple scripts in `test` without making a mess of `package.json`.

### Test the script.

``` sh
# Run the tests using npm.
npm test
```

``` text
$ npm test

> learn-tdd@0.0.0 test /Users/jlengstorf/dev/code.lengstorf.com/projects/learn-tdd
> npm run test:style --silent && npm run test:coverage --silent

requireSemicolons: Missing semicolon after statement at spec/test.spec.js :
     6 |  });
     7 |
     8 |})
---------^
     9 |


1 code style error found.
npm ERR! Test failed.  See above for more details.
```

Ah, shit. We forgot to fix that semicolon in `spec/test.spec.js`. Once we fix that, the tests look much better:

``` text
$ npm test

> learn-tdd@0.0.0 test /Users/jlengstorf/dev/code.lengstorf.com/projects/learn-tdd
> npm run test:style --silent && npm run test:coverage --silent

Started
Running 1 spec.
TDD with Jasmine
.    uses a plain-English approach: passed



1 spec, 0 failures
Finished in 0.005 seconds


1 spec, 0 failures
Finished in 0 seconds
=============================================================================
Writing coverage object [/Users/jlengstorf/dev/code.lengstorf.com/projects/learn-tdd/coverage/coverage.json]
Writing coverage reports at [/Users/jlengstorf/dev/code.lengstorf.com/projects/learn-tdd/coverage]
=============================================================================

=============================== Coverage summary ===============================
Statements   : 100% ( 10/10 )
Branches     : 100% ( 0/0 )
Functions    : 100% ( 0/0 )
Lines        : 100% ( 10/10 )
================================================================================
```

## Start with the tests: write a simple server test (that fails).

``` sh
# Create a file for the test.
touch spec/server.spec.js
```

Inside, we're going to write a test for a server that we haven't built yet. It sounds crazy, but it's really powerful to think about code this way.

If we just start coding, we may miss important behaviors — and it _sucks_ to find ourselves 40% of the way through an app, just to realize that something critical was missed.

By describing behavior first using tests, then coding, we can help kill two birds with one stone: [better project planning](https://lengstorf.com/effective-project-planning/) and writing tested code.

Add the test in `spec/server.spec.js`:

``` js
var http = require('http');
var port = process.env.PORT || 8000;

describe('App Server', () => {

  // Start the server before each test.
  beforeEach(() => {
    server.listen(port);
  });

  // Stop the server after each test.
  afterEach(() => {
    server.close();
  });

  // If we load the app, it should give us a 200 (OK) status code.
  it('returns 200 for the root domain', done => {
    http.get(`http://localhost:${port}/`, res => {
      expect(res.statusCode).toEqual(200);
      done();
    }).on('error', error => {

      // Force failure if we get an error.
      fail('Error loading the app.');
      done();
    });
  });

});
```

{{% aside %}}
  **NOTE:** The `server` variable is undefined right now. _This is by design._ Once we get a test that fails, we'll create server code until the test passes.
{{% /aside %}}

And if we run the tests, we can see that it fails right now:

``` text
$ npm test

> learn-tdd@0.0.0 test /Users/jlengstorf/dev/code.lengstorf.com/projects/learn-tdd
> npm run test:style --silent && npm run test:coverage --silent

Started
Running 2 specs.
App Server
=============================================================================
Writing coverage object [/Users/jlengstorf/dev/code.lengstorf.com/projects/learn-tdd/coverage/coverage.json]
Writing coverage reports at [/Users/jlengstorf/dev/code.lengstorf.com/projects/learn-tdd/coverage]
=============================================================================

=============================== Coverage summary ===============================
Statements   : 80.95% ( 17/21 )
Branches     : 100% ( 2/2 )
Functions    : 100% ( 0/0 )
Lines        : 80.95% ( 17/21 )
================================================================================
events.js:160
      throw er; // Unhandled 'error' event
      ^

Error: connect ECONNREFUSED 127.0.0.1:8000
    at Object.exports._errnoException (util.js:1026:11)
    at exports._exceptionWithHostPort (util.js:1049:20)
    at TCPConnectWrap.afterConnect [as oncomplete] (net.js:1081:14)
npm ERR! Test failed.  See above for more details.
```

### Make the test pass.

``` sh
# Create a file for the server code.
touch src/server.js
```

Edit `src/server.js` and add the following code:

``` js
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-type': 'text/plain' });
  res.end('It works!');
});

// Export the `listen()` method so we can start the server elsewhere.
const listen = (...args) => {
  server.listen.apply(server, args);
};

// Export the `close()` method so we can stop the server elsewhere.
const close = callback => {
  server.close(callback);
};

module.exports = { listen, close };
```

``` text
$ npm test

> learn-tdd@0.0.0 test /Users/jlengstorf/dev/code.lengstorf.com/projects/learn-tdd
> npm run test:style --silent && npm run test:coverage --silent

Started
Running 2 specs.
App Server
.    returns 200 for the root domain: passed
TDD with Jasmine
.    uses a plain-English approach: passed



2 specs, 0 failures
Finished in 0.026 seconds


2 specs, 0 failures
Finished in 0 seconds
=============================================================================
Writing coverage object [/Users/jlengstorf/dev/code.lengstorf.com/projects/learn-tdd/coverage/coverage.json]
Writing coverage reports at [/Users/jlengstorf/dev/code.lengstorf.com/projects/learn-tdd/coverage]
=============================================================================

=============================== Coverage summary ===============================
Statements   : 100% ( 31/31 )
Branches     : 100% ( 2/2 )
Functions    : 100% ( 0/0 )
Lines        : 100% ( 31/31 )
================================================================================
```
