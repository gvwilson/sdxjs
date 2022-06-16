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
1.  almacena cualquier versión particular de un archivo solo una vez,
    para no desperdiciar espacio en disco.

En este capítulo, construiremos una herramienta para tareas.
No hará todo lo que Git hace:
en particular, no nos permitirá crear y unir branches.
--TODO: investigar cómo se denominan un las branches en la documentación original de Git

Si desean saber cómo funciona aquello,
porfavor vean [% i "Cook, Mary Rose" %][Mary Rose Cook's][cook-mary-rose][% /i %], un excelente [Gitlet][gitlet] proyecto.

## ¿Cómo podemos identificar unambiguamente archivos? {: #archivo-backup-únicos}

Para evitar almacenar copias redundantes de archivos,
necesitamos saber cuando dos archivos contienen los mismos datos.
No podemos confiar en nombres porque los archivos pueden moverse o renombrarse con el tiempo;
podríamos comparar los archivos byte por byte,
pero una forma más rápida es  usar una [% i "hash_function" %][% g hash_function %]función hash[% /g %][% /i %]
que convierte datos arbitrarios en una cadena de bits de longitud fija. 
([% f archivo-backup-hash-función %]).

[% figure slug="archivo-backup-hash-función" img="figures/hash-función.svg" alt="Hash functions" caption="Cómo hash functions speed up lookup." %]

Una función hash  simpre  produce el mismo [% i "hash código" %][% g hash_code %] código hash[% /g %][% /i %] para una entrada dada.
Una [% i "cryptographic hash función" "hash función!cryptographic" %][% g cryptographic_hash_function %] función hash criptográfica [% /g %][% /i %]
tiene dos propiedades extra :

1.  La salida depende de la entrada entera:
    cambiar un solo byte resulta en un código hash diferente.

1.  Las salidaslucen como números aleatorios:
    son impredecibles y distribuidos uniformemente
    (i.e., la posibilidades de lograr un  código  hash específico son las mismas)

Es fácil escribir una mala función hash,
pero muy difícil escribir una que califica como criptográfica.
Usaremos por lo tanto una librería para calcular para calcular hashes  [% i "hash código!SHA-1" "SHA-1 hash código" %][% g sha_1 %]SHA-1[% /g %][% /i %] de 160 bits para nuestros archivos.
Estos no son lo suficientemente aleatorios como para mantener privados los datos  de un paciente respecto de un attacker con recursos,
pero eso no es para lo que los estmamos usando:
solo queremos hashes que sean aleatorios para que [% i "hash función!colisión" "colisión (en hashing)" %][% g colisión %] la colisión[% /g %][% /i %] sea extremadamente improbable.

> ### El Problema del Cumpleaños
>
> Las probabilidades de que dos personas compartan cumpleaños son 1/365 (ignorando el 29 de Febrero).
> Las probabilidades de que *no lo compartan* son por lo tanto 364/365.
> Cuando agregamos una tercer persona,
> Las probabilidades de que no compartar cumpleaños con cualquiera de las oitras dos personas son 363/365,
> así que las probabilidades totales de que nadie comparta un cumpleaños son (365/365)×(364/365)×(363/365).
> Si seguimos calculando, hay un chance de 50%  que dos personas compartan cumpleaños en un grupo de solo 23 personas,
> y un chance de 99.9%  en 70 personas.
>
> Podemos usar el mismo cómputo para calcular cuantos archivos necesitamos hashear antes que haya una probabilidad del 50% de una colisión.
> En lugar de  365 usamos \\(2^{160}\\) (el número de valores con longitud de 160 bits),
> y tras revisar [Wikipedia][wikipedia-cumpleaños-Problema]
> y hacer algunos cálculos con [% i "Wolfram Alpha" %][Wolfram Alpha][wolfram-alpha][% /i %],
> calculamos que necesitaríamos tener aproximadamente \\(10^{24}\\) archivos
> para tener have un chance de un colisión del 50% .
> Estamos dispuestos a tomar ese riesgo…

El módulo [`crypto`][node-crypto] de [Node][nodejs]  provee herramientas para crear un hash SHA-1 .
Para usarlo,
creamos un objeto que lleva la cuenta de estado actual  de los  the cálculos de hashing,
le decimos como queremos codificar (o representar) el valor hash ,
y entonces le pasamos algunos bytes.
Cuando terminamos,
llamamos su método `.end` 
y entonces usamos su método `.read` para obtenerel resultado final:

[% excerpt pat="hash-text.*" fill="js sh out" %]

Hashear un archivo en lugar de una cadena fija de texto es simple:
solo leemos el contenido del archivo y pasamos aquellos caracteres al objeto que hace el hash:

[% excerpt pat="hash-archivo.*" fill="js sh out" %]

Sin embargo,
es más eficiente procesar el archivo como un [% g stream %]stream[% /g %]:

[% excerpt pat="hash-stream.*" fill="js sh out" %]

Este tipo deinterfaz se llama
una API [% i "streaming API" "execution!streaming" %][% g streaming_api %] de streaming[% /g %][% /i %] [% g api %]API[% /g %]
porque está diseñada para procesar un stream de datos un bloque a la vez
en lugar de requerir todos los datos en memoria de una.
Muchas aplicaciones usan streams
para que los programas no tengan que leer archivos  enteros (acaso grandes) en la memoria.
{: .continue}

Para iniciar,
este programa pide a la librería `fs`  crear un  stream de lectura para un archivo
y  [% g pipe %]entubar[% /g %] los datos desde ese stream al objeto hashing 
([% f archivo-backup-streaming %]).
Luego, dice al  objeto hashing qué hacer cuando no hay más datos
proveyendo un [% i "event handler!streaming API" "streaming API!event handler" %][% g handler %]detector[% /g %][% /i %] para el evento "finish" .
Esto es llamado de forma asíncrona:
como la salida muestra,
el programa principal termina antes que la tarea que maneja los datos sea agendada y ejecutada.
La mayoría de programas también proveen un detector para que eventos de "datos"  hagan algo con cada bloque de datos que va llegando;
el objeto `hash`  en nuestro programa hace eso  por nosotros.

[% figure slug="archivo-backup-streaming" img="figures/streaming.svg" alt="Streaming de operaciones de archivo" caption="Procesando archivos como streams de bloques." %]

## ¿Cómo podemos respaldar archivos? {: #archivo-backup-backup}

Muchos archivos solo cambian ocasionalmente luego que son recreados, o nunca en absoluto.
Sería un desperdicio para un sistema de control de versiones hacer copias
cada vez que el usuario quisiera guardar una  instantánea de un proyecto,
entonces en su lugar de nuestra herramienta copiará cada archivo único a algo como `abcd1234.bck`,
donde `abcd1234` es un hash del contenido del archivo.
Luego, guardará una estructura de datos que registre los nombres de archivos y claves hash para cada instantánea.
Las claves hash indican cuáles archivos únicos son parte de la instantánea,
mientras que los nombres de archivos nos dicen qué contenido de cada archivo fue llamado cuando la instantánea se hizo
(ya que los archivos pueden ser movidos o renombrados).
Para restaurar una  instantánea particular,
todo lo que tenemos que hacer es copiar los archivos `.bck` guardados de vuelta a donde estaban
([% f archivo-backup-storage %]).

[% figure slug="archivo-backup-storage" img="figures/storage.svg" alt="Backup archivo storage" caption="Organización del almacenamiento de respaldo de archivos." %]

Podemos  construir las herramientas necesarias para esto usando promesas ([% x async-programming %]).
La función principal crea una promesa que use the versión asíncrona  de `glob` para encontrar archivos
y entonces:

1.  Revisa que las entradas en la lista realmente son archivos;

1.  lee cada archivo en la memoria; y

1.  calcula los hashes para esos archivos.

[% excerpt archivo="hash-existing-promesa.js" keep="principal" %]

Esta función usa `promesa.all`
para esperar que se completen las operaciones en todos archivos de la lista 
antes de avanzar al siguiente paso.
Un diseño diferente sería combinar stat, read, y hash en un solo paso
para que cada archivo fuese manejado independientemente
y use un `promesa.all` al final para juntarlos a todos.
{: .continue}

Las primeras dos [% i "helper función" %] funciones de ayuda[% /i %] de las que `hashExisting` depende
envuelven una operación asíncrona en promesas:

[% excerpt archivo="hash-existing-promesa.js" keep="helpers" %]

 La función final de ayuda calcula el hash de forma síncrona,
pero podemos usar `promesa.all` para esperar a que esas operaciones terminen:

[% excerpt archivo="hash-existing-promesa.js" keep="hashPath" %]

Vamos a ejecutarla:

[% excerpt pat="run-hash-existing-promesa.*" fill="js sh slice.out" %]

El código que escribimos es más clarode lo que sería con retrollamadas
(intenta reescribirla si no me crees)
pero la capa de promesas alrededor todavía oscurece todo su significado.
Las mismas operaciones son más fáciles de leer cuando usamos `async` y `await`:

[% excerpt archivo="hash-existing-async.js" keep="principal" %]

Esta versión crea y resuelve exactamente las mismas promesas como en la ejecución anterior,
pero esas promesas son creadas automáticamente para nosotros por Node.
Para ver que funciona,
la corremos para los mismos  archivos the same archivos de entrada :
{: .continue}

[% excerpt pat="run-hash-existing-async.*" fill="js sh slice.out" %]

## Cómo can we track which archivos have already been backed up? {: #archivo-backup-track}

The second part de our backup herramienta keeps track de which archivos have y haven't been backed up already.
It stores backups en un directorio that contains backup archivos like `abcd1234.bck`
y archivos describing the contenido de particular snapshots.
The latter are named `ssssssssss.csv`,
where `ssssssssss` is the [% g utc %]UTC[% /g %] [% g tiempostamp %]tiempostamp[% /g %] de the backup's creation
y the `.csv` extension indicates that the archivo is formatted como [% g csv %]comma-separated valores[% /g %].
(We could store these archivos como [% g json %]JSON[% /g %], but CSV is easier for personas to read.)

> ### tiempo de check/tiempo de use
>
> Our naming convention for index archivos will fail Si we try to create más than un backup per second.
> This might seem very unlikely,
> but many faults y security holes are the result de programmers assuming things weren't going to happen.
>
> We could try to avoid this Problema by using un dos-part naming scheme `ssssssss-un.csv`,
> `ssssssss-b.csv`, y so on,
> but this leads to un [% i "race condition" %][% g race_condition %]race condition[% /g %][% /i %]
> llamado [% i "race condition!tiempo de check/tiempo de use" "tiempo de check/tiempo de use" %][% g toctou %]tiempo de check/tiempo de use[% /g %][% /i %].
> Si dos users run the backup herramienta at the same tiempo,
> they will both see that there isn't un archivo (yet) con the current tiempostamp,
> so they will both try to create the first un.

[% excerpt archivo="check-existing-archivos.js" %]

To test our programa,
let's manually create testing directories con manufactured (shortened) hashes:

[% excerpt pat="tree-test.*" fill="sh out" %]

We use [% i "Mocha" %][Mocha][mocha][% /i %] to manage our tests.
Every test is un `async` función;
Mocha automáticamente waits for them all to complete antes reporting results.
To run them,
we add the line:

```js
"test": "mocha */test/test-*.js"
```proyecto

en the `scripts` section de our proyecto's `package.json` archivo
so that cuando we run `npm run test`,
Mocha looks for archivos en `test` sub-directories de the directories holding our lessons.
{: .continue}

Here are our first few tests:

[% excerpt archivo="test/test-find.js" %]

y here is Mocha's report:
{: .continue}

[% excerpt archivo="test-check-archivosystem.out" %]

## Cómo can we test código that modifies archivos? {: #archivo-backup-test}

The final thing our herramienta needs to do
is copy the archivos that need copying y create un new index archivo.
The código itself will be relatively simple,
but testing will be complicated by the fact
that our tests will need to create directories y archivos antes they run
y then delete them afterward
(so that they don't contaminate subsequent tests).

un better approach is to use un [% i "mock objeto!for testing" "unit test!using mock objeto" %][% g mock_object %]mock objeto[% /g %][% /i %]
En lugar de  de the real archivosystem.
un mock objeto has the sameinterfaz como the función, objeto, class, o librería that it replaces,
but is designed to be used solely for testing.
Node's [`mock-fs`][node-mock-fs] librería provee the same functions como the `fs` librería,
but stores todo en memoria
([% f archivo-backup-mock-fs %]).
This prevents our tests desde accidentally disturbing the archivosystem,
y también makes tests much faster
(since en-memoria operaciones are thousands de tiempos faster than operaciones that touch the disk).

[% figure slug="archivo-backup-mock-fs" img="figures/mock-fs.svg" alt="Mock archivosystem" caption="Using un mock archivosystem to simplify testing." %]

We can create un mock archivosystem by giving the librería un JSON description de
the archivos y qué they should contain:

[% excerpt archivo="test/test-find-mock.js" omit="tests" %]

[% i "Mocha!beforeEach" %]Mocha[% /i %] automáticamente calls `beforeEach` antes running each tests,
y [% i "Mocha!afterEach" %]`afterEach`[% /i %] after each tests completes
(which is yet another [% i "protocol!for unit testing" %]protocol[% /i %]).
All de the tests stay exactamente the same,
y since `mock-fs` replaces the functions en the standard `fs` librería con su own,
nothing en our application needs to change either.
{: .continue}

We are finally ready to write the programa that actually backs up archivos:

[% excerpt archivo="backup.js" %]

The tests for this are más complicated than tests we have written previously
porque we want to check con actual archivo hashes.
Let's set up some fixtures to run tests on:

[% excerpt archivo="test/test-backup.js" keep="fixtures" %]

y then run some tests:
{: .continue}

[% excerpt archivo="test/test-backup.js" keep="tests" %]
[% excerpt archivo="test-backup.out" %]

<blockquote class="break-antes" markdown="1">
### diseño for test

un de the best ways---maybe *the* best way---to evaluate software diseño
is by thinking about [% i "testability!como diseño criterion" "software diseño!testability" %]testability[% /i %] [% b Feathers2004 %].
We were able to use un mock archivosystem En lugar de  de un real un
porque the archivosystem has un well-defined API
that is provided to nosotros en un single librería,
so replacing it is un matter de changing un thing en un place.
Si you have to change several parts de your código en order to test it,
the código is telling you to consolidate those parts into un component.
</blockquote>

<div class="break-antes"></div>
## Exercises {: #archivo-backup-exercises}

### Odds de colisión {: .exercise}

Si hashes were only 2 bits long,
then the chances de colisión con each successive archivo
assuming no previous colisión are:

| número de archivos | Odds de colisión |
| --------------- | ----------------- |
| 1               | 0%                |
| 2               | 25%               |
| 3               | 50%               |
| 4               | 75%               |
| 5               | 100%              |

un colleague de yours says this means that Si we hash four archivos,
there's only un 75% chance de any colisión occurring.
qué are the actual odds?

### Streaming I/O {: .exercise}

Write un small programa using `fs.createReadStream` y `fs.createWriteStream`
that copies un archivo piece by piece
En lugar de  de reading it into memoria y then writing it out again.

### Sequencing backups {: .exercise}

Modify the backup programa so that manifests are numbered sequentially
como `00000001.csv`, `00000002.csv`, y so on
rather than being tiempostamped.
Why doesn't this solve the tiempo de check/tiempo de use race condition mentioned earlier.

### JSON manifests {: .exercise}

1.  Modify `backup.js` so that it can save JSON manifests como well como CSV manifests
    based on un command-line flag.

2.  Write another programa llamado `migrate.js` that converts un set de manifests
    desde CSV to JSON.
    (The programa's name comes desde the term [% g data_migration %]datos migration[% /g %].)

3.  Modify `backup.js` programas so that each manifest stores the user name de the persona who created it
    along con archivo hashes,
    y then modify `migrate.js` to transform old archivos into the new format.

### Mock hashes {: .exercise}

1.  Modify the Respaldo programa so that it uses un función llamado `ourHash` to hash archivos.

2.  Create un replacement that returns some predictable valor, such como the first few caracteres de the datos.

3.  Rewrite the tests to use this función.

Cómo did you modify the principal programa so that the tests could control which hashing función is used?

### Comparing manifests {: .exercise}

Write un programa `compare-manifests.js` that reads dos manifest archivos y reports:

-   Which archivos have the same names but diferente hashes
    (i.e., their contenido have changed).

-   Which archivos have the same hashes but diferente names
    (i.e., they have been renamed).

-   Which archivos are en the first hash but neither their names nor their hashes are en the second
    (i.e., they have been deleted).

-   Which archivos are en the second hash but neither their names nor their hashes are en the first
    (i.e., they have been added).

### desde un estado to another {: .exercise}

1.  Write un programa llamado `desde-to.js` that takes the name de un directorio
    y the name de un manifest archivo
    como su command-line arguments,
    then adds, removes, y/o renames archivos en the directorio
    to restore the estado described en the manifest.
    The programa should only perform archivo operaciones cuando it needs to,
    e.g.,
    it should not delete un archivo y re-add it Si the contenido have not changed.

2.  Write some tests for `desde-to.js` using Mocha y `mock-fs`.

### archivo history {: .exercise}

1.  Write un programa llamado `archivo-history.js`
    that takes the name de un archivo como un command-line argument
    y displays the history de that archivo
    by tracing it back en tiempo through the available manifests.

2.  Write tests for your programa using Mocha y `mock-fs`.

### Pre-commit hooks {: .exercise}

Modify `backup.js` to load y run un función llamado `preCommit` desde un archivo llamado `pre-commit.js`
stored en the root directorio de the archivos being backed up.
Si `preCommit` returns `true`, the backup proceeds;
Si it returns `false` o throws un exception,
no backup is created.
