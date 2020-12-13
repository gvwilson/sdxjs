---
---

-   Build an HTTP server like [Express][express] modeled on the one from <cite>Brown2016</cite>

## How can we send messages via sockets?

-   A simple socket client

<%- include('/inc/file.html', {file: 'simple-socket-client.js'}) %>

-   A very simple socket server

<%- include('/inc/file.html', {file: 'simple-socket-server.js'}) %>

-   Displaying what happens when they run is tricky, since events are interleaved
-   When developing, run in separate windows
-   For this tutorial:
    -   Run the server
    -   Wait one second to make sure it's listening
        -   Which isn't "sure"
    -   Run the client
    -   Kill the server

<%- include('/inc/multi.html', {pat: 'run-simple-socket.*', fill: 'sh out'}) %>

-   Most of this stays the same from example to example
    -   So allow user to specify the name of a data handler from the command line
-   What stays the same:

<%- include('/inc/file.html', {file: 'socket-server.js'}) %>

## How can we decompose the server?

-   The handler needs to know the socket, but the callback only takes the data
    -   So the handler takes a socket as an argument and returns a function that takes data
    -   Call it `handlerFactory` to make clear that it creates a function

<%- include('/inc/file.html', {file: 'always-send-success.js'}) %>

-   Try running

<%- include('/inc/multi.html', {pat: 'always-send-success.*', fill: 'sh out'}) %>

## How do HTTP requests and responses work?

-   Now try constructing an HTTP response
    -   Ignore the incoming path

<%- include('/inc/file.html', {file: 'http-response-success.js'}) %>

-   Go to `http://localhost:8080` with a browser
    -   Browser sends two requests: one for `/` and one for `/favicon.ico`
    -   Includes `User-Agent`, `Accept`, `Accept-Language`, and other headers

<%- include('/inc/file.html', {file: 'http-response-browser.txt'}) %>

-   Now construct an HTTP request
    -   Line separators in header are supposed to be `\r\n`, not just `\n`
-   Header must end with double blank line (to separate it from posted info)
    -   Single back quote on a line by itself is hard to see, so mark with a comment
-   Must convert result data from byte buffer to string
-   Allow user to specify path on the command line

<%- include('/inc/file.html', {file: 'http-request-client.js'}) %>

-   Run the server and the client
    -   Server only sees what we send

<%- include('/inc/file.html', {file: 'http-response-success.out'}) %>

## How can we test this?

-   Unit testing this doesn't have to be hard
    -   We have a function that takes something with a `.write` method and produces a function
    -   That takes some data and writes some text
    -   We can provide a <g key="mock_object">mock object</g> to free our tests from concurrency
-   Replacement for the socket

<%- include('/inc/file.html', {file: 'test/socket.js'}) %>

-   Unit test

<%- include('/inc/file.html', {file: 'test/test-http-response-success.js'}) %>
<%- include('/inc/file.html', {file: 'test-http-response-success.out'}) %>

-   Parse the HTTP request and return text files

<%- include('/inc/multi.html', {pat: 'http-response-parse.*', fill: 'js out'}) %>

-   But there are three problems
    1.  Synchronous operation
    2.  Not all files are text
    3.  Security: if we use the path provided, we can potentially return any file on the system
-   To test the last point, get `index.html` from the directory above this one

<%- include('/inc/multi.html', {pat: 'breaking-sandbox.*', fill: 'sh out'}) %>

## How can we make servers easier to create?

-   Define a base class to wrap up the socket handling and request parsing
    -   Parse request to create request object
    -   Initialize response object using values from request
    -   Call a user-defined method to do something useful
    -   Finalize the response object
    -   Send the header and body
    -   A <g key="protocol">protocol</g> for handling requests
    -   A simple example of the <g key="template_method_pattern">Template Method</g> pattern
-   Use the [url][node-url] package to parse the request target

<%- include('/inc/file.html', {file: 'base-http-server.js'}) %>
<%- include('/inc/multi.html', {pat: 'test-base-http-server.*', fill: 'js sh out'}) %>

-   Serve files

<%- include('/inc/file.html', {file: 'http-file-server.js'}) %>
<%- include('/inc/multi.html', {pat: 'test-http-file-server.*', fill: 'sh out'}) %>

## How can we parameterize requests?

-   The classic approach uses a <g key="query_string">query string</g>
    -   `http://some.domain/some/path/?firstKey=firstValue&secondKey=secondValue`
    -   Keys can be repeated
    -   Lands in the `.searchParams` object of the parsed URL
-   Server extracts parameters and uses them
    -   Should do more checking than this…

<%- include('/inc/file.html', {file: 'http-params-server.js'}) %>

-   Client builds a query string
    -   Should use a library (there are many)

<%- include('/inc/file.html', {file: 'http-params-client.js'}) %>

-   Testing

<%- include('/inc/multi.html', {pat: 'test-http-params-server.*', fill: 'sh out'}) %>

-   More modern approach is to send <g key="json">JSON</g>
    -   Unlimited [sic] size
    -   Structured data
-   Use [got][got] to construct request including URL and JSON
    -   `async` function because we have to `await` the response

<%- include('/inc/file.html', {file: 'got-json-client.js'}) %>

-   Finally need to get the <g key="http_header">HTTP headers</g> to check <g key="mime_type">MIME type</g>
    -   Convert body of request from text to JSON if the type is `application/json`
-   Parsing request relies on a few helper methods

<%- include('/inc/erase.html', {file: 'http-json-server.js', key: 'skip'}) %>

-   Getting head and body

<%- include('/inc/keep.html', {file: 'http-json-server.js', key: 'getHeadAndBody'}) %>

-   Parsing the head

<%- include('/inc/keep.html', {file: 'http-json-server.js', key: 'parseHead'}) %>

-   Miscellaneous helper methods

<%- include('/inc/keep.html', {file: 'http-json-server.js', key: 'misc'}) %>

-   After all that, echoing a value back seems like small potatoes

<%- include('/inc/multi.html', {pat: 'test-http-json-server.*', fill: 'sh out'}) %>
