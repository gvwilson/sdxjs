---
---

An HTTP server similar to [Express][express]
modeled on [this one in Python][500lines-server].

## How can we send messages via sockets?

-   A simple socket client

<%- include('/inc/code.html', {file: 'simple-socket-client.js'}) %>

-   A very simple socket server

<%- include('/inc/code.html', {file: 'simple-socket-server.js'}) %>

-   Displaying what happens when they run is tricky, since events are interleaved
-   When developing, run in separate windows
-   For this tutorial:
    -   Run the server
    -   Wait one second to make sure it's listening
        -   Which isn't "sure"
    -   Run the client
    -   Kill the server

<%- include('/inc/multi.html', {pat: 'run-simple-socket.*', fill: 'sh txt'}) %>

-   Most of this stays the same from example to example
    -   So allow user to specify the name of a data handler from the command line
-   What stays the same:

<%- include('/inc/code.html', {file: 'socket-server.js'}) %>

## How can we decompose the server?

-   The handler needs to know the socket, but the callback only takes the data
    -   So the handler takes a socket as an argument and returns a function that takes data
    -   Call it `handlerFactory` to make clear that it creates a function

<%- include('/inc/code.html', {file: 'always-send-success.js'}) %>

-   Try running

<%- include('/inc/multi.html', {pat: 'always-send-success.*', fill: 'sh txt'}) %>

## How do HTTP requests and responses work?

-   Now try constructing an HTTP response
    -   Ignore the incoming path

<%- include('/inc/code.html', {file: 'http-response-success.js'}) %>

-   Go to `http://localhost:8080` with a browser
    -   Browser sends two requests: one for `/` and one for `/favicon.ico`
    -   Includes `User-Agent`, `Accept`, `Accept-Language`, and other headers

<%- include('/inc/code.html', {file: 'http-response-browser.txt'}) %>

-   Now construct an HTTP request
    -   Line separators in header must be `\r\n`, not just `\n`
    -   Header must end with double blank line (to separate it from posted info)
    -   Must convert result data from byte butter to string
    -   Allow user to specify 

<%- include('/inc/code.html', {file: 'http-request-client.js'}) %>

-   Run the server and the client
    -   Server only sees what we send

<%- include('/inc/code.html', {file: 'http-response-success.txt'}) %>

## How can we test this?

-   Unit testing this doesn't have to be hard
    -   We have a function that takes something with a `.write` method and produces a function
    -   That takes some data and writes some text
    -   We can provide a <g key="mock_object">mock object</g> to free our tests from concurrency
-   Replacement for the socket

<%- include('/inc/code.html', {file: 'test/socket.js'}) %>

-   Unit test

<%- include('/inc/code.html', {file: 'test/test-http-response-success.js'}) %>

-   Parse the HTTP request and return text files

<%- include('/inc/multi.html', {pat: 'http-response-parse.*', fill: 'js txt'}) %>

-   But there are three problems
    1.  Synchronous operation
    2.  Not everything is text
    3.  Security: if we use the path provided, we can potentially return any file on the system

<%- include('/inc/multi.html', {pat: 'breaking-sandbox.*', fill: 'sh txt'}) %>

## How can we make servers easier to create?

-   Define a base class to wrap up the socket handling and request parsing
    -   Sequence is:
        -   Parse request to create request object
        -   Initialize response object using values from request
        -   Call a user-defined method to do something useful
        -   Finalize the response object
        -   Send the header and body
    -   A <g key="protocol">protocol</g> for handling requests
    -   A simple example of the <g key="template_method_pattern">Template Method</g> pattern
-   Use the [url][node-url] package to parse the request target

<%- include('/inc/code.html', {file: 'base-http-server.js'}) %>
<%- include('/inc/multi.html', {pat: 'test-base-http-server.*', fill: 'js sh txt'}) %>

-   Serve files

<%- include('/inc/code.html', {file: 'http-file-server.js'}) %>
<%- include('/inc/multi.html', {pat: 'test-http-file-server.*', fill: 'sh txt'}) %>

## How can we parameterize requests?

-   The classic approach uses a <g key="query_string">query string</g>
    -   `http://some.domain/some/path/?firstKey=firstValue&secondKey=secondValue`
    -   Keys can be repeated
    -   Lands in the `.searchParams` object of the parsed URL
-   Server extracts parameters and uses them
    -   Should do more checking than this…

<%- include('/inc/code.html', {file: 'http-params-server.js'}) %>

-   Client builds a query string
    -   Should use a library (there are many)

<%- include('/inc/code.html', {file: 'http-params-client.js'}) %>

-   Testing

<%- include('/inc/multi.html', {pat: 'test-http-params-server.*', fill: 'sh txt'}) %>

-   More modern approach is to send <g key="json">JSON</g>
    -   Unlimited [sic] size
    -   Structured data
-   Use [got][got] to construct request including URL and JSON

<%- include('/inc/code.html', {file: 'got-json-client.js'}) %>

-   Finally need to get the <g key="http_header">HTTP headers</g> to check <g key="mime_type">MIME type</g>
    -   Convert body of request from text to JSON if the type is `application/json`

<%- include('/inc/code.html', {file: 'http-json-server.js'}) %>

-   After all that, echoing a value back seems like small potatoes
    -   We will do more sophisticated things in chapters to come

<%- include('/inc/multi.html', {pat: 'test-http-json-server.*', fill: 'sh txt'}) %>
