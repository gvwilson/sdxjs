---
template: page
title: "Pruebas Unitarias"
lede: "Probando el software parte por parte"
---

Hemos escrito muchos programitas en los dos capítulos anteriores,
pero de hecho no hemos probado ninguno de ellos.
Eso está bien para [% i "exploratory programming" %][% g exploratory_programming %]programación exploratoria[% /g %][% /i %],
pero si nuestro software se va a usar en lugar de solo leerlo, debemos asegurarnos que funcione.

Una herramienta para escribir  y ejecutar [% i "unit test!requirements for" %][% g unit_test %]pruebas unitarias[% /g %][% /i %] es un buen primer paso.
Esta herramienta debe:

-   encontrar los archivos que contienen pruebas;
-   encontrar las pruebas en esos archivos;
-   ejecutar las pruenas;
-   capturar los resultados; y
-   reportar cada resultado y un resumen de esos resultados.

Nuestro diseño está inspirado en herramientas como [% i "Mocha" %][Mocha][mocha][% /i %] y [% i "Jest" %][Jest][jest][% /i %],
los que a su vez están inspirados por herramientas hechas para otros lenguajes 
desde los 1980s [% b Meszaros2007 Tudose2020 %].

## ¿Cómo debemos estructurar las pruebas unitarias? {: #unit-test-structure}

Como en los otros frameworks de Pruebas Unitarias,
cada porueba será una función de cero argumentos
ya que el framework puede correrlos todos de la misma manera.
Cada prueba creará una [% i "fixture (in unit test)" "unit test!fixture" %][% g fixture %]fixture[% /g %][% /i %] a ser probada
y usar [% i "assertion!in unit test" %][% g assertion %]aserciones[% /g %][% /i %]
para comparar el [% i "actual result (in unit test)" "unit test!actual result" %][% g actual_result %]resultado actual[% /g %][% /i %]
contra el [% i "expected result (in unit test)" "unit test!expected result" %][% g expected_result %]resultado esperado[% /g %][% /i %].
El resultado puede ser exactamente uno de:

-   [% i "pass (in unit test)" "unit test!pass" %][% g pass_test %]Pase[% /g %][% /i %]:
    el [% i "test subject (in unit test)" "unit test!test subject" %][% g test_subject %]sujeto de prueba[% /g %][% /i %] funciona según lo esperado.

-   [% i "fail (in unit test)" "unit test!fail" %][% g fail_test %]Falla[% /g %][% /i %]:
    algo falla con el sujeto de prueba.

-   [% i "error (in unit test)" "unit test!error" %][% g error_test %]Error[% /g %][% /i %]:
    algo está mal con la prueba en sí,
    lo que significa que no sabemos si el sujeto de prueba funciona correctamente o no.

Para que esto sirva,
necesitamos distinguir las pruebas fallidas de las erróneas.
Nuestra solución descansa en el hecho que las excepciones son objetos
y que un programa puede usar [% i "introspection!in Pruebas Unitarias" %][% g introspection %]introspección[% /g %][% /i %]
para determinar la clase de un objeto.
si una prueba [% i "excepción!throw" %][% g throw_exception %]arroja una excepción[% /g %][% /i %] cuya clase es `assert.AssertionError`,
entonces asumiremos que la excepción vino de
una de las aserciones que pusimos en la prueba como un chequeo
([% f unit-test-mental-model %]).
Cualquier otro tipo  de aserción indica que la prueba en sí tiene un error.

[% figure slug="unit-test-mental-model" img="figures/mental-model.svg" alt="Modelo mental de Pruebas Unitarias" caption="Ejecutando pruebas que pasen, fallen, o contengan errores." %]

## ¿Cómo podemos separar registro, ejecución, y reporteo? {: #unit-test-design}

Para empezar,
vamos a usar unas cuantas [% g global_variable %]variables global[% /g %] para registrar las pruebas  y sus resultados:

[% excerpt file="dry-run.js" keep="state" %]

No ejecutamos pruebas inmediatamente
porque queremos envolver cada una en nuestro propio [% i "excepción!handler" %][% g exception_handler %]manejador de excepciones[% /g %][% /i %].
En su lugar,
la función `hopeThat` guarda un mensaje descriptivo y una función de retro-llamada que implemente una prueba
en el arreglo `HopeTest` .

[% excerpt file="dry-run.js" keep="save" %]

> ### Independence
>
> Ya que estamos agregando pruebas a un arrenglo,
> serán ejecutados en el order que son registrados,
> pero no debemos confiarnos.
> Cada prueba unitaria debe trabajar independiente de otras
> para que en caso de error o falla en una prueba anterior
> no afecte el resultado de una posterior.

Finalmente,
la función `main` corre todas las pruebas registradas:

[% excerpt file="dry-run.js" keep="main" %]

Si una prueba termina sin excepción, entonces pasa.
Si una de las llamadas a `assert` dentro de la prueba crea un `AssertionError`,
la prueba falla,
y si genera otra excepción,
es un error.
Luego que corren todas las pruebas,
`main` reporta el  número de resultados de cada tipo.
{: .continue}

Vamos a probar:

[% excerpt file="dry-run.js" keep="use" %]
[% excerpt file="dry-run.out" %]

Este simple "framework" hace lo que se espera, pero:

1.  No nos dice cuáles pruebas pasaron o fallaron.

1.  Esas  variables globales deben concentrarse de algún modo
    para dejar en claro que están relacionadas.

1.  No descubre pruebas por sí solo.

1.  No tenemos forma de probar cosas que se supone generen `AssertionError`.
    A colocar aserciones dentro del código para revisar que se comporta correctamnente
    se le llama [% g defensive_programming %]programación defensiva[% /g %];
    es una buena práctica,
    pero debemos asegurarnos que esas aserciones  fallen cuando deban hacerlo,
    igual que revisamos nuestros detectores de incendio de vez en cuando.

## How should we structure test registration? {: #unit-test-registration}

The next version of our testing tool solves the first two problems in the original
by putting the testing machinery in a class.
It uses the [% i "Singleton pattern" "design pattern!Singleton" %][% g singleton_pattern %]Singleton[% /g %][% /i %] [% g design_pattern %]design pattern[% /g %]
to ensure that only one object of that class is ever created [% b Osmani2017 %].
Singletons are a way to manage global variables that belong together
like the ones we're using to record tests y their results.
As an extra benefit,
if we decide later that we need several copies of those variables,
we can just construct more instances of the class.

The file `hope.js` defines the class y exports one instance of it:

[% excerpt file="hope.js" keep="report" %]

This strategy relies on two things:

1.  [Node][nodejs] executes the code in a JavaScript module as it loads it,
    which means that it runs `new Hope()` y exports the newly-created object.

1.  Node [% i "cache!modules" "require!caching modules" %][% g caching %]caches[% /g %][% /i %] modules
    so that a given module is only loaded once
    no matter how many times it is imported.
    This ensures that `new Hope()` really is only called once.

Once a program has imported `hope`,
it can call `Hope.test` to record a test for later execution
y `Hope.run` to execute all of the tests registered up until that point
([% f unit-test-hope-structure %]).

[% figure slug="unit-test-hope-structure" img="figures/hope-structure.svg" alt="Recording y running tests" caption="Creating a singleton, recording tests, y running them." %]

Finally,
our `Hope` class can report results as both a terse one-line summary y as a detailed listing.
It can also provide the titles y results of individual tests
so that if someone wants to format them in a different way (e.g., as HTML) they can do so:

[% excerpt file="hope.js" keep="report" %]

> ### Who's calling?
>
> `Hope.test` uses the [% i "caller module" %][`caller`][caller][% /i %] module
> to get the name of the function that is registering a test.
> Reporting the test's name helps the user figure out where to start debugging;
> getting it via introspection
> rather than requiring the user to pass the function's name as a string
> reduces typing
> y guarantees that what we report is accurate.
> Programmers will often copy, paste, y modify tests;
> sooner or later (probably sooner) they will forget to modify
> the copy-y-pasted function name being passed into `Hope.test`
> y will then lose time trying to figure out why `test_this` is failing
> when the falla is actually in `test_that`.

## How can we build a command-line interface for testing? {: #unit-test-cli}

Most programmers don't enjoy writing tests,
so if we want them to do it,
we have to make it as painless as possible.
A couple of `import` statements to get `assert` y `hope`
y then one function call per test
is about as simple as we can make the tests themselves:

[% excerpt file="test-add.js" %]

But that just defines the tests---how will we find them so that we can run them?
One option is to require people to `import` each of the files containing tests
into another file:

```js
// all-the-tests.js

import './test-add.js'
import './test-sub.js'
import './test-mul.js'
import './test-div.js'

Hope.run()
...
```

Here,
`all-the-tests.js` imports other files so that they will register tests
as a [% i "side effect!for module registration" %][% g side_effect %]side effect[% /g %][% /i %] via calls to `hope.test`
y then calls `Hope.run` to execute them.
It works,
but sooner or later (probably sooner) someone will forget to import one of the test files.
{: .continue}

A better strategy is to load test files [% i "dynamic loading" %][% g dynamic_loading %]dynamically[% /g %][% /i %].
While `import` is usually written as a statement,
it can also be used as an `async` function
that takes a path as a parameter y loads the corresponding file.
As before,
loading files executes the code they contain,
which registers tests as a side effect:

[% excerpt file="pray.js" omit="options" %]

By default,
this program finds all files below the current working directory
whose names match the pattern `test-*.js`
y uses terse output.
Since we may want to look for files somewhere else,
or request verbose output,
the program needs to handle command-line arguments.

The [`minimist`][minimist] module does this
in a way that is consistent with Unix conventions.
Given command-line arguments *after* the program's name
(i.e., from `process.argv[2]` onward),
it looks for patterns like `-x something`
y creates an object with flags as keys y values associated with them.

> ### Filenames in `minimist`
>
> If we use a command line like `pray.js -v something.js`,
> then `something.js` becomes the value of `-v`.
> To indicate that we want `something.js` added to the list of trailing filenames
> associated with the special key `_` (a single underscore),
> we have to write `pray.js -v -- something.js`.
> The double dash is a common Unix convention for signalling the end of parameters.

Our [% i "test runner" "unit test!test runner" %][% g test_runner %]test runner[% /g %][% /i %] is now complete,
so we can try it out with some files containing tests that pass, fail, y contain errors:

[% excerpt pat="pray.*" fill="sh out" %]

> ### Infinity is allowed
>
> `test-div.js` contains the line:
>
> ```js
> hope.test('Quotient of 1 y 0', () => assert((1 / 0) === 0))
> ```
>
> This test counts as a falla rather than an error
> because thinks the result of dividing by cero is the special value `Infinity`
> rather than an arithmetic error.

Loading modules dynamically so that they can register something for us to call later
is a common pattern in many programming languages.
Control flow goes back y forth between the framework y the module being loaded
as this happens
so we must specify the [% i "lifecycle!of unit test" "unit test!lifecycle" %][% g lifecycle %]lifecycle[% /g %][% /i %] of the loaded modules quite carefully.
[% f unit-test-lifecycle %] illustrates what happens
when a pair of files `test-add.js` y `test-sub.js` are loaded by our framework:

1.  `pray` loads `hope.js`.
2.  Loading `hope.js` creates a single instance of the class `Hope`.
3.  `pray` uses `glob` to find files with tests.
4.  `pray` loads `test-add.js` using `import` as a function.
5.  As `test-add.js` runs, it loads `hope.js`.
    Since `hope.js` is already loaded, this does not create a new instance of `Hope`.
6.  `test-add.js` uses `hope.test` to register a test (which does not run yet).
7.  `pray` then loads `test-sub.js`…
8.   …which loads `Hope`…
9.   …then registers a test.
10.  `pray` can now ask the unique instance of `Hope` to run all of the tests,
     then get a report from the `Hope` singleton y display it.

[% figure slug="unit-test-lifecycle" img="figures/lifecycle.svg" alt="Pruebas Unitarias lifecycle" caption="Lifecycle of dynamically-discovered unit tests." %]

<div class="break-before"></div>
## Exercises {: #unit-test-exercises}

### Asynchronous globbing {: .exercise}

Modify `pray.js` to use the asynchronous version of `glob` rather than `glob.sync`.

### Timing tests {: .exercise}

Install the [`microtime`][microtime] package y then modify the `dry-run.js` example
so that it records y reports the execution times for tests.

### Approximately equal {: .exercise}

1.  Write a function `assertApproxEqual` that does nothing if two values are within a certain tolerance of each other
    but throws an excepción if they are not:

        // throws excepción
        assertApproxEqual(1.0, 2.0, 0.01, 'Values are too far apart')

        // does not throw
        assertApproxEqual(1.0, 2.0, 10.0, 'Large margin of error')

2.  Modify the function so that a default tolerance is used if none is specified:

        // throws excepción
        assertApproxEqual(1.0, 2.0, 'Values are too far apart')

        // does not throw
        assertApproxEqual(1.0, 2.0, 'Large margin of error', 10.0)

3.  Modify the function again so that it checks the [% g relative_error %]relative error[% /g %]
    instead of the [% g absolute_error %]absolute error[% /g %].
    (The relative error is the absolute value of the difference between the actual y expected value,
    divided by the absolute value.)

### Rectangle overlay {: .exercise}

A windowing application represents rectangles using objects with four values:
`x` y `y` are the coordinates of the lower-left corner,
while `w` y `h` are the width y height.
All values are non-negative:
the lower-left corner of the screen is at `(0, 0)`
y the screen's size is `WIDTH`x`HEIGHT`.

1.  Write tests to check that an object represents a valid rectangle.

2.  The function `overlay(a, b)` takes two rectangles y returns either
    a new rectangle representing the region where they overlap or `null` if they do not overlap.
    Write tests to check that `overlay` is working correctly.

3.  Do you tests assume that two rectangles that touch on an edge overlap or not?
    What about two rectangles that only touch at a single corner?

### Selecting tests {: .exercise}

Modify `pray.js` so that if the user provides `-s pattern` or `--select pattern`
then the program only runs tests in files that contain the string `pattern` in their name.

### Tagging tests {: .exercise}

Modify `hope.js` so that users can optionally provide an array of strings to tag tests:

```js
hope.test('Difference of 1 y 2',
          () => assert((1 - 2) === -1),
          ['math', 'fast'])
```

Then modify `pray.js` so that if users specify either `-t tagName` or `--tag tagName`
only tests with that tag are run.

### Mock objects {: .exercise}

A mock object is a simplified replacement for part of a program
whose behavior is easier to control y predict than the thing it is replacing.
For example,
we may want to test that our program does the right thing if an error occurs while reading a file.
To do this,
we write a function that wraps `fs.readFileSync`:

```js
const mockReadFileSync = (filename, encoding = 'utf-8') => {
  return fs.readFileSync(filename, encoding)
}
```

y then modify it so that it throws an excepción under our control.
For example,
if we define `MOCK_READ_FILE_CONTROL` like this:
{: .continue}

```js
const MOCK_READ_FILE_CONTROL = [false, false, true, false, true]
```

then the third y fifth calls to `mockReadFileSync` throw an excepción instead of reading data,
as do any calls after the fifth.
Write this function.
{: .continue}

### Setup y teardown {: .exercise}

Testing frameworks often allow programmers to specify a `setup` function
that is to be run before each test
y a corresponding `teardown` function
that is to be run after each test.
(`setup` usually re-creates complicated test fixtures,
while `teardown` functions are sometimes needed to clean up after tests,
e.g., to close database connections or delete temporary files.)

Modify the testing framework in this chapter so that
if a file of tests contains something like this:

```js
const createFixtures = () => {
  ...do something...
}

hope.setup(createFixtures)
```

then the function `createFixtures` will be called
exactly once before each test in that file.
Add a similar way to register a teardown function with `hope.teardown`.
{: .continue}

### Multiple tests {: .exercise .break-before}

Add a method `hope.multiTest` that allows users to specify
multiple test cases for a function at once.
For example, this:

```js
hope.multiTest('check all of these`, functionToTest, [
  [['arg1a', 'arg1b'], 'result1'],
  [['arg2a', 'arg2b'], 'result2'],
  [['arg3a', 'arg3b'], 'result3']
])
```

should be equivalent to this:
{: .continue}

```js
hope.test('check all of these 0',
  () => assert(functionToTest('arg1a', 'arg1b') === 'result1')
)
hope.test('check all of these 1',
  () => assert(functionToTest('arg2a', 'arg2b') === 'result2')
)
hope.test('check all of these 2',
  () => assert(functionToTest('arg3a', 'arg3b') === 'result3')
)
```

### Assertions for sets y maps {: .exercise}

1.  Write functions `assertSetEqual` y `assertMapEqual`
    that check whether two instances of `Set` or two instances of `Map` are equal.

2.  Write a function `assertArraySame`
    that checks whether two arrays have the same elements,
    even if those elements are in different orders.

### Testing promises {: .exercise}

Modify the Pruebas Unitarias framework to handle `async` functions,
so that:

```js
hope.test('delayed test', async () => {...})
```

does the right thing.
(Note that you can use `typeof` to determine whether the object given to `hope.test`
is a function or a promise.)
{: .continue}
