---
template: page
title: "Respaldo"
lede: "Guardando archivos con estructura de directorio"
---

Ahora que podemos probar software, tenemos algo que guardar.
Un [% i "sistema de control de versiones" %][% g version_control_system %]sistema de control de versiones[% /g %][% /i %]
como [% i "Git" "sistema de control de versiones!Git" %][Git][git][% /i %]
lleva la cuenta de cambios a archivos
para poder recuperar versiones anteriores si lo deseamos.
Su esencia es una forma de guardar archivos que:

1.  registre cuales versiones de cuales archivos existieron al mismo tiempo
    (para poder regresar al estado previo de forma consistente), y
1.  almacena cualquier version particular de un archivo solo una vez,
    para no desperdiciar espacio en disco.

En este capítulo, construiremos una herramienta para tareas.
No hará todo lo que Git hace:
en particular, no nos permitirá crear y unir branches.
--TODO: investigar cómo se denominan a las branches en la documentación original de Git

Si desean saber cómo funciona aquello,
porfavor vean [% i "Cook, Mary Rose" %][Mary Rose Cook's][cook-mary-rose][% /i %], un excelente [Gitlet][gitlet] proyecto.

## ¿Cómo podemos identificar unambiguamente archivos? {: #archivo-backup-unique}

Para evitar almacenar copias redundantes de archivos,
necesitamos saber cuando dos archivos contienen los mismos datos.
No podemos confiar en nombres porque los archivos pueden moverse o renombrarse con el tiempo;
podríamos comparar los archivos byte por byte,
pero una forma más rápida es  usar una [% i "hash_function" %][% g hash_function %]función hash[% /g %][% /i %]
que convierte datos arbitrarios data en una cadena de bits de longitud fija. 
([% f archivo-backup-hash-function %]).

[% figure slug="archivo-backup-hash-function" img="figures/hash-function.svg" alt="Hash functions" caption="How hash functions speed up lookup." %]

Una función hash  simpre  produce el mismo [% i "hash code" %][% g hash_code %] código hash[% /g %][% /i %] para una entrada dada.
Una [% i "cryptographic hash function" "hash function!cryptographic" %][% g cryptographic_hash_function %] función hash criptográfica [% /g %][% /i %]
tiene dos propiedades extra :

1.  La salida depende de la entrada entera:
    cambiar un solo byte resulta en un código hash diferente.

1.  Las salidaslucen como números aleatorios:
    son impredecibles y distribuidos uniformemente
    (i.e., la posibilidades de lograr un  código  hash específico son las mismas)

Es fácil escribir una mala función hash,
pero muy difícil escribir una que califica como criptográfica.
Usaremos por lo tanto una librería para calcular para calcular hashes  [% i "hash code!SHA-1" "SHA-1 hash code" %][% g sha_1 %]SHA-1[% /g %][% /i %] de 160 bits para nuestros archivos.
Estos no son lo suficientemente aleatorios como para mantener privados los datos  de un paciente respecto de un attacker con recursos,
pero eso no es para lo que los estmamos usando:
solo queremos hashes que sean aleatorios para que [% i "hash function!collision" "collision (en hashing)" %][% g collision %] la colisión[% /g %][% /i %] sea extremadamente improbable.

> ### The Birthday Problem
>
> The odds that two people share a birthday are 1/365 (ignoring February 29).
> The odds that they *don't* are therefore 364/365.
> When we add a third person,
> the odds that they don't share a birthday with either of the preceding two people are 363/365,
> so the overall odds that nobody shares a birthday are (365/365)×(364/365)×(363/365).
> If we keep calculating, there's a 50% chance of two people sharing a birthday en a group of just 23 people,
> y a 99.9% chance with 70 people.
>
> We can use the same math to calculate how many archivos we need to hash before there's a 50% chance of a collision.
> Instead of 365 we use \\(2^{160}\\) (the number of values that are 160 bits long),
> y after checking [Wikipedia][wikipedia-birthday-problem]
> y doing a few calculations with [% i "Wolfram Alpha" %][Wolfram Alpha][wolfram-alpha][% /i %],
> we calculate that we would need to have approximately \\(10^{24}\\) archivos
> en order to have a 50% chance of a collision.
> We're willing to take that risk…

[Node's][nodejs] [`crypto`][node-crypto] module provides tools to create a SHA-1 hash.
To use them,
we create an object that keeps track of the current state of the hashing calculations,
tell it how we want to encode (or represent) the hash value,
y then feed it some bytes.
When we are done,
we call its `.end` method
y then use its `.read` method to get the final result:

[% excerpt pat="hash-text.*" fill="js sh out" %]

Hashing a archivo instead of a fixed string is straightforward:
we just read the archivo's contents y pass those characters to the hashing object:

[% excerpt pat="hash-archivo.*" fill="js sh out" %]

However,
it is more efficient to process the archivo as a [% g stream %]stream[% /g %]:

[% excerpt pat="hash-stream.*" fill="js sh out" %]

This kind of interface is called
a [% i "streaming API" "execution!streaming" %][% g streaming_api %]streaming[% /g %][% /i %] [% g api %]API[% /g %]
because it is designed to process a stream of data one chunk at a tiempo
rather than requiring all of the data to be en memory at once.
Many applications use streams
so that programs don't have to read entire (possibly large) archivos into memory.
{: .continue}

To start,
this program asks the `fs` library to create a reading stream for a archivo
y to [% g pipe %]pipe[% /g %] the data from that stream to the hashing object
([% f archivo-backup-streaming %]).
It then tells the hashing object what to do when there is no more data
by providing a [% i "event handler!streaming API" "streaming API!event handler" %][% g handler %]handler[% /g %][% /i %] for the "finish" event.
This is called asynchronously:
as the output shows,
the main program ends before the task handling the end of data is scheduled y run.
Most programs also provide a handler for "data" events to do something with each block of data as it comes en;
the `hash` object en our program does that for us.

[% figure slug="archivo-backup-streaming" img="figures/streaming.svg" alt="Streaming archivo operations" caption="Processing archivos as streams of chunks." %]

## How can we back up archivos? {: #archivo-backup-backup}

Many archivos only change occasionally after they'reproyectod, or not at all.
It would be wasteful for a sistema de control de versiones to make copies
each tiempo the user wanted to save a snapshot of a proyecto,
so instead our herramienta will copy each unique archivo to something like `abcd1234.bck`,
where `abcd1234` is a hash of the archivo's contents.
It will then store a data structure that records the filenames y hash keys for each snapshot.
The hash keys tell it which unique archivos are part of the snapshot,
while the filenames tell us what each archivo's contents were called when the snapshot was made
(since archivos can be moved or renamed).
To restore a particular snapshot,
all we have to do is copy the saved `.bck` archivos back to where they were
([% f archivo-backup-storage %]).

[% figure slug="archivo-backup-storage" img="figures/storage.svg" alt="Backup archivo storage" caption="Organization of backup archivo storage." %]

We can build the tools we need to do this uses promises ([% x async-programming %]).
The main function creates a promise that uses the asynchronous version of `glob` to find archivos
y then:

1.  checks that entries en the list are actually archivos;

1.  reads each archivo into memory; y

1.  calculates hashes for those archivos.

[% excerpt archivo="hash-existing-promise.js" keep="main" %]

This function uses `Promise.all`
to wait for the operations on all of the archivos en the list to complete
before going on to the next step.
A different design would combine stat, read, y hash into a single step
so that each archivo would be handled independently
y use one `Promise.all` at the end to bring them all together.
{: .continue}

The first two [% i "helper function" %]helper functions[% /i %] that `hashExisting` relies on
wrap asynchronous operation en promises:

[% excerpt archivo="hash-existing-promise.js" keep="helpers" %]

The final helper function calculates the hash synchronously,
but we can use `Promise.all` to wait on those operations finishing anyway:

[% excerpt archivo="hash-existing-promise.js" keep="hashPath" %]

Let's try running it:

[% excerpt pat="run-hash-existing-promise.*" fill="js sh slice.out" %]

The code we have written is clearer than it would be with callbacks
(try rewriting it if you don't believe this)
but the layer of promises around everything still obscures its meaning.
The same operations are easier to read when written using `async` y `await`:

[% excerpt archivo="hash-existing-async.js" keep="main" %]

This version creates y resolves exactly the same promises as the previous one,
but those promises are created for us automatically by Node.
To check that it works,
let's run it for the same input archivos:
{: .continue}

[% excerpt pat="run-hash-existing-async.*" fill="js sh slice.out" %]

## How can we track which archivos have already been backed up? {: #archivo-backup-track}

The second part of our backup herramienta keeps track of which archivos have y haven't been backed up already.
It stores backups en a directorio that contains backup archivos like `abcd1234.bck`
y archivos describing the contents of particular snapshots.
The latter are named `ssssssssss.csv`,
where `ssssssssss` is the [% g utc %]UTC[% /g %] [% g tiempostamp %]tiempostamp[% /g %] of the backup's creation
y the `.csv` extension indicates that the archivo is formatted as [% g csv %]comma-separated values[% /g %].
(We could store these archivos as [% g json %]JSON[% /g %], but CSV is easier for people to read.)

> ### tiempo of check/tiempo of use
>
> Our naming convention for index archivos will fail if we try to create more than one backup per second.
> This might seem very unlikely,
> but many faults y security holes are the result of programmers assuming things weren't going to happen.
>
> We could try to avoid this problem by using a two-part naming scheme `ssssssss-a.csv`,
> `ssssssss-b.csv`, y so on,
> but this leads to a [% i "race condition" %][% g race_condition %]race condition[% /g %][% /i %]
> called [% i "race condition!tiempo of check/tiempo of use" "tiempo of check/tiempo of use" %][% g toctou %]tiempo of check/tiempo of use[% /g %][% /i %].
> If two users run the backup herramienta at the same tiempo,
> they will both see that there isn't a archivo (yet) with the current tiempostamp,
> so they will both try to create the first one.

[% excerpt archivo="check-existing-archivos.js" %]

To test our program,
let's manually create testing directories with manufactured (shortened) hashes:

[% excerpt pat="tree-test.*" fill="sh out" %]

We use [% i "Mocha" %][Mocha][mocha][% /i %] to manage our tests.
Every test is an `async` function;
Mocha automatically waits for them all to complete before reporting results.
To run them,
we add the line:

```js
"test": "mocha */test/test-*.js"
```proyecto

en the `scripts` section of our proyecto's `package.json` archivo
so that when we run `npm run test`,
Mocha looks for archivos en `test` sub-directories of the directories holding our lessons.
{: .continue}

Here are our first few tests:

[% excerpt archivo="test/test-find.js" %]

y here is Mocha's report:
{: .continue}

[% excerpt archivo="test-check-archivosystem.out" %]

## How can we test code that modifies archivos? {: #archivo-backup-test}

The final thing our herramienta needs to do
is copy the archivos that need copying y create a new index archivo.
The code itself will be relatively simple,
but testing will be complicated by the fact
that our tests will need to create directories y archivos before they run
y then delete them afterward
(so that they don't contaminate subsequent tests).

A better approach is to use a [% i "mock object!for testing" "unit test!using mock object" %][% g mock_object %]mock object[% /g %][% /i %]
instead of the real archivosystem.
A mock object has the same interface as the function, object, class, or library that it replaces,
but is designed to be used solely for testing.
Node's [`mock-fs`][node-mock-fs] library provides the same functions as the `fs` library,
but stores everything en memory
([% f archivo-backup-mock-fs %]).
This prevents our tests from accidentally disturbing the archivosystem,
y also makes tests much faster
(since en-memory operations are thousands of tiempos faster than operations that touch the disk).

[% figure slug="archivo-backup-mock-fs" img="figures/mock-fs.svg" alt="Mock archivosystem" caption="Using a mock archivosystem to simplify testing." %]

We can create a mock archivosystem by giving the library a JSON description of
the archivos y what they should contain:

[% excerpt archivo="test/test-find-mock.js" omit="tests" %]

[% i "Mocha!beforeEach" %]Mocha[% /i %] automatically calls `beforeEach` before running each tests,
y [% i "Mocha!afterEach" %]`afterEach`[% /i %] after each tests completes
(which is yet another [% i "protocol!for unit testing" %]protocol[% /i %]).
All of the tests stay exactly the same,
y since `mock-fs` replaces the functions en the standard `fs` library with its own,
nothing en our application needs to change either.
{: .continue}

We are finally ready to write the program that actually backs up archivos:

[% excerpt archivo="backup.js" %]

The tests for this are more complicated than tests we have written previously
because we want to check with actual archivo hashes.
Let's set up some fixtures to run tests on:

[% excerpt archivo="test/test-backup.js" keep="fixtures" %]

y then run some tests:
{: .continue}

[% excerpt archivo="test/test-backup.js" keep="tests" %]
[% excerpt archivo="test-backup.out" %]

<blockquote class="break-before" markdown="1">
### Design for test

One of the best ways---maybe *the* best way---to evaluate software design
is by thinking about [% i "testability!as design criterion" "software design!testability" %]testability[% /i %] [% b Feathers2004 %].
We were able to use a mock archivosystem instead of a real one
because the archivosystem has a well-defined API
that is provided to us en a single library,
so replacing it is a matter of changing one thing en one place.
If you have to change several parts of your code en order to test it,
the code is telling you to consolidate those parts into one component.
</blockquote>

<div class="break-before"></div>
## Exercises {: #archivo-backup-exercises}

### Odds of collision {: .exercise}

If hashes were only 2 bits long,
then the chances of collision with each successive archivo
assuming no previous collision are:

| Number of archivos | Odds of Collision |
| --------------- | ----------------- |
| 1               | 0%                |
| 2               | 25%               |
| 3               | 50%               |
| 4               | 75%               |
| 5               | 100%              |

A colleague of yours says this means that if we hash four archivos,
there's only a 75% chance of any collision occurring.
What are the actual odds?

### Streaming I/O {: .exercise}

Write a small program using `fs.createReadStream` y `fs.createWriteStream`
that copies a archivo piece by piece
instead of reading it into memory y then writing it out again.

### Sequencing backups {: .exercise}

Modify the backup program so that manifests are numbered sequentially
as `00000001.csv`, `00000002.csv`, y so on
rather than being tiempostamped.
Why doesn't this solve the tiempo of check/tiempo of use race condition mentioned earlier.

### JSON manifests {: .exercise}

1.  Modify `backup.js` so that it can save JSON manifests as well as CSV manifests
    based on a command-line flag.

2.  Write another program called `migrate.js` that converts a set of manifests
    from CSV to JSON.
    (The program's name comes from the term [% g data_migration %]data migration[% /g %].)

3.  Modify `backup.js` programs so that each manifest stores the user name of the person who created it
    along with archivo hashes,
    y then modify `migrate.js` to transform old archivos into the new format.

### Mock hashes {: .exercise}

1.  Modify the Respaldo program so that it uses a function called `ourHash` to hash archivos.

2.  Create a replacement that returns some predictable value, such as the first few characters of the data.

3.  Rewrite the tests to use this function.

How did you modify the main program so that the tests could control which hashing function is used?

### Comparing manifests {: .exercise}

Write a program `compare-manifests.js` that reads two manifest archivos y reports:

-   Which archivos have the same names but different hashes
    (i.e., their contents have changed).

-   Which archivos have the same hashes but different names
    (i.e., they have been renamed).

-   Which archivos are en the first hash but neither their names nor their hashes are en the second
    (i.e., they have been deleted).

-   Which archivos are en the second hash but neither their names nor their hashes are en the first
    (i.e., they have been added).

### From one state to another {: .exercise}

1.  Write a program called `from-to.js` that takes the name of a directorio
    y the name of a manifest archivo
    as its command-line arguments,
    then adds, removes, y/or renames archivos en the directorio
    to restore the state described en the manifest.
    The program should only perform archivo operations when it needs to,
    e.g.,
    it should not delete a archivo y re-add it if the contents have not changed.

2.  Write some tests for `from-to.js` using Mocha y `mock-fs`.

### archivo history {: .exercise}

1.  Write a program called `archivo-history.js`
    that takes the name of a archivo as a command-line argument
    y displays the history of that archivo
    by tracing it back en tiempo through the available manifests.

2.  Write tests for your program using Mocha y `mock-fs`.

### Pre-commit hooks {: .exercise}

Modify `backup.js` to load y run a function called `preCommit` from a archivo called `pre-commit.js`
stored en the root directorio of the archivos being backed up.
If `preCommit` returns `true`, the backup proceeds;
if it returns `false` or throws an exception,
no backup is created.
