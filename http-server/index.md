---
---

An HTTP server similar to [Express][express]
modeled on [this one in Python][500lines-server].

## How can we send messages via sockets? {#sockets}

-   A simple socket client

{% include file.md file="simple-socket-client.js" %}

-   A very simple socket server

{% include file.md file="simple-socket-server.js" %}

-   Displaying what happens when they run is tricky, since events are interleaved
-   When developing, run in separate windows
-   For this tutorial:
    -   Run the server
    -   Wait one second to make sure it's listening
        -   Which isn't "sure"
    -   Run the client
    -   Kill the server

{% include wildcard.md pattern="run-simple-socket.*" values="sh,text" %}

-   Most of this stays the same from example to example
    -   So allow user to specify the name of a data handler from the command line
-   What stays the same:

{% include file.md file="socket-server.js" %}

## How can we decompose the server? {#server-design}

-   The handler needs to know the socket, but the callback only takes the data
    -   So the handler takes a socket as an argument and returns a function that takes data
    -   Call it `handlerFactory` to make clear that it creates a function

{% include file.md file="always-send-success.js" %}

-   Try running

{% include wildcard.md pattern="always-send-success.*" values="sh,text" %}

## How do HTTP requests and responses work? {#request-response}

-   Now try constructing an HTTP response
    -   Ignore the incoming path

{% include file.md file="http-response-success.js" %}

-   Go to `http://localhost:8080` with a browser
    -   Browser sends two requests: one for `/` and one for `/favicon.ico`
    -   Includes `User-Agent`, `Accept`, `Accept-Language`, and other headers

{% include file.md file="http-response-browser.text" %}

-   Now construct an HTTP request
    -   Line separators in header must be `\r\n`, not just `\n`
    -   Header must end with double blank line (to separate it from posted info)
    -   Must convert result data from byte butter to string
    -   Allow user to specify 

{% include file.md file="http-request-client.js" %}

-   Run the server and the client
    -   Server only sees what we send

{% include wildcard.md pattern="http-response-success.*" values="text" %}

## How can we test this? {#testing}

-   Unit testing this doesn't have to be hard
    -   We have a function that takes something with a `.write` method and produces a function
    -   That takes some data and writes some text
    -   We can provide a [mock object][mock-object] to free our tests from concurrency
-   Replacement for the socket

{% include file.md file="test/socket.js" %}

-   Unit test

{% include file.md file="test/test-http-response-success.js" %}

-   Parse the HTTP request and return text files

{% include wildcard.md pattern="http-response-parse.*" values="js,text" %}

-   But there are three problems
    1.  Synchronous operation
    2.  Not everything is text
    3.  Security: if we use the path provided, we can potentially return any file on the system

{% include wildcard.md pattern="breaking-sandbox.*" values="sh,text" %}

## How can we make servers easier to create? {#server-creation}

-   Define a base class to wrap up the socket handling and request parsing
    -   Sequence is:
        -   Parse request to create request object
        -   Initialize response object using values from request
        -   Call a user-defined method to do something useful
        -   Finalize the response object
        -   Send the header and body
    -   A [protocol][protocol] for handling requests
    -   A simple example of the [Template Method][template-method-pattern] pattern
-   Use the [url][node-url] package to parse the request target

{% include file.md file="base-http-server.js" %}
{% include wildcard.md pattern="test-base-http-server.*" values="js,sh,text" %}

-   Serve files

{% include file.md file="http-file-server.js" %}
{% include wildcard.md pattern="test-http-file-server.*" values="sh,text" %}

## How can we parameterize requests? {#parameterizing}

-   The classic approach uses a [query string][query-string]
    -   `http://some.domain/some/path/?firstKey=firstValue&secondKey=secondValue`
    -   Keys can be repeated
    -   Lands in the `.searchParams` object of the parsed URL
-   Server extracts parameters and uses them
    -   Should do more checking than this…

{% include file.md file="http-params-server.js" %}

-   Client builds a query string
    -   Should use a library (there are many)

{% include file.md file="http-params-client.js" %}

-   Testing

{% include wildcard.md pattern="test-http-params-server.*" values="sh,text" %}

-   More modern approach is to send [JSON][json]
    -   Unlimited [sic] size
    -   Structured data
-   Use [got][got] to construct request including URL and JSON

{% include file.md file="got-json-client.js" %}

-   Finally need to get the [HTTP headers][http-header] to check [MIME type][mime-type]
    -   Convert body of request from text to JSON if the type is `application/json`

{% include file.md file="http-json-server.js" %}

-   After all that, echoing a value back seems like small potatoes
    -   We will do more sophisticated things in chapters to come

{% include wildcard.md pattern="test-http-json-server.*" values="sh,text" %}

{% include links.md %}
