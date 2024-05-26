---
title: "Programación Asíncrona"
---

Las retro-llamadas funcionan,
pero son difíciles de leer y depurar,
lo que significa que solo "funcionan" en un sentido limitado.
Los desarrolladores de JavaScript añadieron [%i "promise!as alternative to callback" %][%g promise "promesas" %][%/i%] al lenguaje en 2015
para que las retro-llamadas sean más fáciles de escribir y entender,
y más recientemente añadieron las palabras clave  `async` y `await` también
para facilitar aún más la programación asíncrona.
Para mostrar como funcionan estas palabras,
crearemos una [%g class "clase" %] nuestra llamada `Pledge`
que  provea las mismas características principales que las promesas.
Nuestra explicación se inspiró en [%i "Huffine, Trey" %][Trey Huffine's][huffine_trey][%/i%] [tutorial][huffine_promises],
y les animamos a que lo lean también.

## ¿Cómo podemos manejar la  ejecución asíncrona? {: #async-programming-manage}

JavaScript se construye alrededor de un [%i "event loop" "execution!event loop" %][%g event_loop "ciclo de eventos" %][%/i%].
Cada tarea se representa por una entrada en una cola;
el ciclo de eventos toma repetidamente  una tarea del frente de la cola,
la ejecuta,
y agrega tareas nuevas que cree al final de la cola para ejecutar después.
Solo una tarea se ejecuta a la vez;
cada una tiene su propia [%g call_stack "pila de llamadas" %],
pero los objetos pueden compartirse entre tareas
([%f async-programming-event-loop %]).

[% figure
   slug="async-programming-event-loop"
   img="event-loop.svg"
   alt="El ciclo de eventos"
   caption="Usando un ciclo de eventos para manejar tareas concurrentes."
%]

La mayoría de tareas ejecutan todo el código disponible en el orden que está escrito.
Por ejemplo,
Este programa de una línea usa [%i "Array.forEach" %]`Array.forEach`[%/i%]
para imprimir cada elemento de un arreglo:

[% inc pat="not-callbacks-alone.*" fill="js out" %]

Sin embargo,
algunas funciones especiales incluidas hacen que [Node][nodejs] cambie tareas
o añada nuevas tareas a la cola de ejecución.
Por ejemplo,
[%i "setTimeout" %]`setTimeout`[%/i%] indica a  Node ejecutar una función de retro-llamada luego que cierto número de milisegundos han pasado.
Su primer argumento es una función retro-llamada  sin argumentos,
y su segundo argumento es la demora.
Cuando `setTimeout` es llamada,
Node pone a una lado la retro-llamada por el tiempo solicitado,
y luego la agrega a la cola de ejecución.
(Esto significa que la  tarea se ejecuta *al menos* el número indicado de milisegundos después.)

<div class="callout" markdown="1">

### ¿Por qué cero argumentos?

El requisito de `setTimeout` que las funciones de retro-llamada  no lleven argumentos
es otro ejemplo de un [%i "protocol!API como" "API" %][%g protocol "protocolo" %][%/i%].
Una forma de pensar en eso es que los protocolos permiten que código antiguo use código nuevo:
Quien escribió `setTimeout` no podría saber las  tareas específica que queremos retrasar,
así que especificó una forma de envolver cualquier tarea.

</div>

Como lo muestra el listado siguiente,
la  tarea original puede generar muchas nuevas tareas antes que termine,
y aquellas tareas pueden correr en un orden diferente al  orden en el que fueron creadas
([%f async-programming-set-timeout %]).

[% inc pat="callbacks-with-timeouts.*" fill="js out" %]

[% figure
   slug="async-programming-set-timeout"
   img="set-timeout.svg"
   alt="Fijando un tiempo de espera"
   caption="Usando `setTimeout` para retrasar operaciones."
%]

Si damos a `setTimeout` una demora de cero milisegundos,
la nueva tarea puede ejecutarse de inmediato,
pero cualquier otra tarea esperando tiene una oportunidad de ejecutarse también:

[% inc pat="callbacks-with-zero-timeouts.*" fill="js out" %]

Podemos usar este truco para armar una 
[%i "execution!non-blocking" "non-blocking execution" %][%g non_blocking_execution "función no bloqueante " %][%/i%] genérica
que tome una retro-llamada definiendo una tarea
y cambie tareas si algunas otras están disponibles:
{: .continue}

[% inc pat="non-blocking.*" fill="js out" %]

La función incluida de Node -en la función [%i "setImmediate" %]`setImmediate`[%/i%]
hace exactamente lo que nuestra función `nonBlocking` hace:
Node también tiene `process.nextTick`,
la cual no hace exactamente lo mismo --- exploraremos las diferencias en los ejercicios.

[% inc pat="set-immediate.*" fill="js out" %]

## ¿Cómo funcionan las promesas? {: #async-programming-promises}

Antes de empezar a construir nuestras propias [%i "promise!behavior" %]promesas[%/i%],
vamos cómo queremos que funcionen:

[% inc pat="use-pledge-motivation.*" fill="js out" %]

Este programita crea un nuevo `Pledge`
con una retro llamada que tomar otras dos retro-llamadas como argumentos:
[%i "promise!resolve" "resolve promise" %]`resolve`[%/i%] (la cual correrá cuando todo funcione)
y [%i "promise!reject" "reject promise" %]`reject`[%/i%] (la cual correrá cuando  vaya mal).
La retro-llamada de primer nivel hace la primera parte de lo que queremos que haga,
i.e.,
lo que sea que deseemos ejecutar antes de esperar un retraso;
para fines de demostración, usaremos `setTimeout` con cero retraso para cambiar tareas.
Luego que esta tarea continue,
llamamos la retro-llamada `resolve` para activar lo que sean que ocurra tras el retraso.

Ahora miremos a la linea con `then`.
Este es un [%g método "método" %] del objeto `Pledge` que acabamos de crear,
y su trabajo es hacer lo que deseemos tras el retraso.
El argumento para `then` es otra función de retro-llamada;
recibirá el valor pasado a `resolve`,
el cual es la forma en que la primera parte de la acción se comunica con la segunda
([%f async-programming-resolve %]).

[% figure
   slug="async-programming-resolve"
   img="resolve.svg"
   alt="Cómo resuelven las promesas"
   caption="Orden de operaciones cuando una promesa resuelve."
%]

Para que esto funcione,
el [%g constructor "constructor" %] de `Pledge` de tomar una sola función llamada `action`.
Esta función de tomar dos retro-llamadas como argumentos:
qué hacer si la acción completa exitosamente
y qué hacer en caso contrario (i.e., cómo manejar errores).
`Pledge` proveerá estas retro-llamadas a la acción en el momento adecuado.

<div class="pagebreak"></div>

`Pledge` también necesita dos métodos:
[%i "promise!then" %]`then`[%/i%] para habilitar más acciones
y [%i "promise!catch" %]`catch`[%/i%] para manejar errores.
Para simplificar las cosas un poco,
permitiremos a los usuarios [%i "method chaining" %][%g method_chaining "encadenar" %][%/i%] métodos en tantos `then`s como se necesiten,
pero solo permitiremos un `catch`.

## ¿Cómo podemos encadenar operaciones juntas? {: #async-programming-fluent}

Una [%i "fluent interface" "programming style!fluent interface" %][%g fluent_interface "interfaz fluida" %][%/i%]
es un estilo de programación orientada a objetos
en la que los métodos de un objeto retornan `this`
para que las llamadas a métodos puedan encadenarse juntas.
Por ejemplo,
si nuestra clase es:

```js
class Fluent {
  constructor () {...}

  primer (top) {
    ...do algo con top...
    return this
  }

  segundo (left, right) {
    ...do algo con left y right...
  }
}
```

entonces podemos escribir:
{: .continue}

```js
  const f = new Fluent()
  f.primer('hello').segundo('y', 'goodbye')
```

o incluso
{: .continue}

```js
  (new Fluent()).primer('hello').segundo('y', 'goodbye')
```

La interfaz fluida de `Array` nos deja escribir expresiones como
`Array.filter(...).map(...)`
que normalmente son más legibles que asignar resultados intermedios a variables temporales.

Si la acción original dada a nuestro `Pledge` completa exitosamente,
`Pledge` nos da un valor llamando retro-llamada `resolve`.
Pasamos este valor al primer `then`,
pasamos el resultado de ese `then` al segundo,
y así sucesivamente.
Si alguno de ellos falla y lanza una [%i "exception!en promise" %][%g exception "excepción" %][%/i%],
la pasamos al gestor de errores.
Juntándolo todo,
la clase entera se ve así:

[% inc file="pledge.js" %]

<div class="callout" markdown="1">

### Vinculando `this`

El constructor de `Pledge` hace dos llamadas a una función especial llamada [%i "vincular método a objeto" %]`bind`[%/i%].
Cuando creamos un objeto `obj` y llamamos un método `meth`,
JavaScript fija la variable especial `this` a `obj` dentro de `meth`.
Si usamos un método como una retro-llamada,
sin embargo,
`this` no se iguala automáticamente al objeto correcto.
Para convertir el método a una función regular con el `this` correcto,
tenemos que usar `bind`.
[La documentación][bind_docs] tiene más detalles y ejemplos.

</div>

Vamos a crear un `Pledge` y devolver un valor:

[% inc pat="use-pledge-return.*" fill="js out" %]

¿Por qué no funcionó esto?
{: .continue}

1.  Ni podemos usar `return` con compromisos
    porque la pila de llamadas de la tarea que crea el compromiso ya no existe
    al momento que el  compromiso se ejecuta.
    En su lugar, debemos llamar `resolve` o `reject`.

2.  No hemos hecho algo que demore la ejecución,
    i.e.,
    no hay una llamada a `setTimeout`, `setImmediate`,
    o algo más que cambiase tareas.
    Nuestro ejemplo original acertó en esto.

Este ejemplo demuestra cómo podemos encadenar acciones entre sí:

[% inc pat="use-pledge-chained.*" fill="js out" %]

Nótese que dentro de cada  `then` *nosotros* usamos `return`
porque todas estas cláusulas corren en una sola tarea.
Como veremos en la siguiente sección,
la implementación completa de `Promise` nos permite ejecutar código normal 
y tareas retrasadas dentro de los manejadores `then`.
{: .continue}

Finalmente,
en este ejemplo señalamos explícitamente un problema al llamar `reject`
para asegurar que nuestro manejo de error haga lo que se supone:

[% inc pat="use-pledge-reject.*" fill="js out" %]

## ¿Cómo son diferentes las promesas reales? {: #async-programming-real}

Vamos a reescribir nuestro compromiso encadenado con promesas incorporadas:

[% inc pat="use-promise-chained.*" fill="js out" %]

Se ve casi igual,
pero si leemos la salida con cuidado,
podemos ver que las  retro-llamadas ejecutan *luego que* el programa principal finaliza.
Esta es una señal de que Node está retrasando la ejecución del código en el manejador  `then`.

Un patrón muy común  es  retornar otra promesa desde `then`
para que el siguiente  `then` sea llamado en la promesa retornada,
y no en la promesa original
([%f async-programming-chained %]).
Esta es otra manera de implementar una interfaz fluida:
Si un método de un objeto retorna un segundo objeto,
podemos llamar un método del segundo objeto inmediatamente.

[% inc pat="promise-ejemplo.*" fill="js out" %]

[% figure
   slug="async-programming-chained"
   img="chained.svg"
   alt="promesas encadena"
   caption="Encadenando promesas para hacer operaciones asíncronas depende unas en las otras."
%]

Por lo tanto, tenemos tres reglas para encadenar promesas:

1.  Si nuestro código puede ejecutar síncronamente, solo colocarlo en `then`.

1.  Si queremos usar nuestra propia función asíncrona,
    debe crear y devolver una promesa.

1.  Finalmente,
    si queremos usar una función  de librería de dependa de retro-llamadas,
    tenemos que convertirla para que use promesas.
    Hacer esto se le llama [%g promisification "promesificación" %]
    (ya que los programadores rara vez desaprovechan una oportunidad de agregar más jerga al mundo),
    y la mayoría de funciones en Node ya han sido promesificadas.

## ¿Cómo podemos construir herramientas con promesas? {: #async-programming-tools}

Las promesas pueden parecer más complejas que las retro-llamadas en este momento,
pero eso es porque estamos viendo cómo funcionan en vez de cómo usarlas.
Para explorar esto último,
vamos a usar  las promesas para escribir un programa que cuente el número de lineas en un conjunto de archivos.
Un momento de búsqueda en [NPM][npm] devuelve una versión promesificada de `fs-extra`
llamada `fs-extra-promise`,
así que dependeremos de ella para operaciones de archivo.

Nuestro primer paso es contar las lineas en un solo archivo:

[% inc pat="count-lines-single-file.*" fill="js sh out" %]

<div class="callout" markdown="1">

### Codificación de caracteres

Una [%i "character encoding" %][%g character_encoding "codificación de caracteres" %][%/i%]
especifica cómo se almacenan los caracteres como bytes.
La más ampliamente usada es [%i "UTF-8" "character encoding!UTF-8" %][%g utf_8 "UTF-8" %][%/i%],
la cual almacena caracteres comunes en lenguajes Europeos Occidentales en un solo byte
y usa secuencias multi-byte para otros símbolos.
Si no especificamos una codificación,
`fs.readFileAsync` nos da un arreglo de bytes en lugar de  una cadena de caracteres.
Podemos ver que cometimos este error cuando intentamos llamar un método de `String`
y Node nos dice que no podemos.

</div>

El siguiente paso es contar las líneas en varios archivos.
Podemos usar `glob-promise` para retrasar el manejo de la salida de `glob`,
pero necesitamos alguna forma de crear una tarea  separada para  contar las líneas en cada archivo
y esperar hasta que aquellos conteos estén disponibles antes de terminar nuestro programa.

La herramienta que queremos usar es [%i "Promise.all" %]`Promise.all`[%/i%],
la cual espera hasta que todas las promesas en un arreglo se hayan completado.
Para hacer nuestro programa un poco más legible,
colocaremos la creación de la promesa para cada archivo en una función separada:

[% inc pat="count-lineas-globbed-files.*" fill="js sh slice.out" %]

Sin embargo,
queremos desplegar los nombres de los archivos cuyas líneas estamos contando a lado de las   cuentas.
Para esto nuestro `then` debe devolver dos valores.
Podríamos ponerlos en un arreglo,
pero es una mejor práctica construir un  objeto temporal con campos nominales
([%f async-programming-temporal-named-fields %]).
Este enfoque nos permite añadir o re-acomodar campos sin romper código
y también sirve como un poco de documentación.
Con este cambio
nuestro programa  de conteo de líneas se convierte en:

[% inc file="count-lines-print-filenames.js" %]

[% figure
   slug="async-programming-temporal-named-fields"
   img="temporal-named-fields.svg"
   alt="Objetos temporales con campos nominales"
   caption="Creando objetos temporales con campos nominales para trasladar valores."
%]

Como en [%x systems-programming %],
esto funciona hasta que encontremos un directorio cuyo nombre empate `*.*`,
lo cual hacemos cuando contamos las líneas en el contenido de `node_modules`.
La solución de nuevo es usar `stat` para revisar si algo es un archivo o no
antes de intentar leerlo.
Y ya que `stat` retorna un objeto que no incluye el nombre del archivo,
creamos otro objeto temporal para pasar información a la cadena de `then`s.

[% inc pat="count-líneas-con-stat.*" fill="js sh slice.out" %]

Este código es complejo, pero mucho más simple que si estuviésemos usando retro-llamadas.
{: .continue}

<div class="callout" markdown="1">

### Alineando las cosas

Este código usa la expresión `{filename, stats}`
para crear un objeto cuyas llaves son `filename` y `stats`,
y cuyos valores son los de las variables correspondientes.
Hacer esto ayuda al código a ser más legible,
tanto porque es más corto
pero además porque señala que el valor asociado con la llave `filename`
es exactamente el valor de la variable con el mismo nombre.

</div>

## ¿Cómo podemos hacer esto más legible? {: #async-programming-readable}

Las promesas eliminan el anidamiento profundo asociado con las retro-llamadas a retro-llamadas,
pero aún así son difíciles de entender.
Las últimas versiones de JavaScript proveen dos nuevas palabras clave [%i "async keyword" %]`async`[%/i%] y [%i "await keyword" %]`await`[%/i%]
para aplanar el código aún más.
`async` significa "esta función implícitamente retorna una promesa",
mientras que `await` significa "espera que se resuelva una promesa ".
Este programita usa ambas palabras clave para imprimir los primeros 10 caracteres de un archivo:

[% inc pat="await-fs.*" fill="js out" %]

<blockquote markdown="1">
### Traduciendo código

Cuando Node ve `await` y `async`,
en silencio [%i "promise!automatic creation of" %]convierte[%/i%] el código para usar promesas con `then`, `resolve`, y `reject`;
veremos cómo funciona esto en [%x code-generator %].
Para poder proveer un contexto para esta transformación
debemos poner  `await` dentro de  una función que sea declarada como `async`:
no podemos simplemente escribir `await fs.statAsync(...)` al máximo nivel de nuestro programa
fuera de una función.
Este requisito es a veces molesto,
pero ya que debemos poner nuestro código en funciones de todas formas,
no podemos quejarnos.
</blockquote>

Para ver cuán limpio queda nuestro código  con `await` y `async`,
vamos a reescribir nuestro programa de conteo de lineas para usarlos.
Primero,
modificamos las dos funciones auxiliares para que parezcan esperar los resultados y devolverlos.
De hecho, envuelven sus resultados en promesas y las devuelven,
pero Node ahora se ocupa de aquello por nosotros:

[% inc file="count-líneas-con-stat-async.js" keep="recycle" %]

Luego,
modificamos `main` para esperar a que las cosas se completen.
Todavía debemos usar `Promise.all` para manejar las promesas
que cuentan líneas en archivos individuales,
pero el resultado está menos desordenado que en nuestro versión previa.

[% inc file="count-lines-with-stat-async.js" keep="main" %]

## ¿Cómo podemos manejar errores con código asíncrono? {: #async-programming-errors}

Creamos varias variables intermedias en el programa de conteo de lineas para aclarar los pasos.
Hacer esto también ayuda al manejo de errores;
para ver cómo,
vamos a armar un ejemplo por etapas.

Primero,
si devolvemos una promesa que falle sin usar  `await`,
entonces nuestra función main terminará corriendo antes que ocurra el error,
y nuestro `try`/`catch` no nos servirá
([%f async-programming-handling-errors %]):

[% inc pat="return-inmediatamente.*" fill="js out" %]

[% figure
   slug="async-programming-handling-errors"
   img="handling-errors.svg"
   alt="Gestionando errores asíncronos"
   caption="Formas correctas e incorrectas de manejar errores en código asíncrono."
%]

Una solución a este problema es ser consistente y siempre retornar algo.
Debido a que la función es declarada `async`,
el `Error` en el siguiente código es automáticamente envuelto en una promesa
para poder usar  `.then` y `.catch` para manejarlo como antes:

[% inc pat="assign-inmediately.*" fill="js out" %]

Si en lugar  escribimos [%i "exception!with await" %]`return await`[%/i%],
la función espera hasta que la promesa corra antes de retornar.
La promesa es devuelta en una excepción porque falló,
y ya que estamos dentro del ámbito nuestro bloque `try`/`catch` ,
todo funciona como deseamos:

[% inc pat="return-await.*" fill="js out" %]

Preferimos el segundo enfoque,
pero cualquiera que elijan,
por favor sean consistentes.
{: .continue}

## Ejercicios {: #async-programming-ejercicios}

### Inmediato versus siguiente tick {: .exercise}

¿Cuál es la diferencia entre `setImmediate` y `process.nextTick`?
¿Cuándo usarían cada uno?

### Rastreando la ejecución de promise {: .exercise}

1.  ¿ Qué imprime este código  y por qué?

    ```js
    Promise.resolve('hello')
    ```

2.  ¿ Qué imprime este código  y por qué?

    ```js
    Promise.resolve('hello').then(result => console.log(result))
    ```

3. ¿ Qué imprime este código  y por qué?

    ```js
    const p = new Promise((resolve, reject) => resolve('hello'))
      .then(result => console.log(result))
    ```

Pista: prueba cada fragmento de código interactivamente en  intérprete Node y como un script de línea de comandos.

### Múltiple catches {: .exercise}

Supongamos que creamos una promesa que falla deliberadamente y luego añade dos gestores de error:

[% inc file="x-multiple-catch/example.js" %]

Cuando el código se ejecuta, produce:
{: .continue}

[% inc file="x-multiple-catch/example.txt" %]

1.  Traza el orden de operaciones: ¿qué se creó y cuando se ejecutó?
2.  ¿Qué pasa si corremos las mismas líneas interactivamente?
    ¿Por qué vemos algo diferente que lo que vemos cuando ejecutamos este archivo desde la línea de comandos?

### Then luego de catch {: .exercise}

Supongamos que creamos una promesa que falla deliberadamente 
y le agregamos tanto `then` como `catch`:

[% inc file="x-catch-then/example.js" %]

Cuando el código se ejecuta, produce:
{: .continue}

[% inc file="x-catch-then/example.txt" %]

1.  Traza el orden de ejecución.
2.  ¿Por qué `undefined` se imprime al final?

### Head y tail {: .exercise}

El comando Unix `head` muestra las primeras  líneas de uno o más archivos,
mientras que el comando  `tail` muestra las últimas.
Escribir los programas `head.js` y `tail.js` que hagan lo mismo usando promesas y `async`/`await`,
para que:

```sh
node head.js 5 first.txt second.txt third.txt
```

imprima las primeras cinco líneas de cada uno de los tres archivos y:
{: .continue}

```sh
node tail.js 5 first.txt second.txt third.txt
```

imprima las últimas cinco líneas de cada archivo.
{: .continue}

### Histograma de conteo de líneas {: .exercise}

Extender `count-lines-with-stat-async.js` para crear un programa `lh.js`
que imprima dos columnas de salida:
el número de líneas en uno o más archivos,
y el número de archivos que tienen muchas líneas.
Por ejemplo,
so corremos:

```sh
node lh.js promises/*.*
```

la salida puede ser:
{: .continue}

| Longitud | Número de archivos |
| ------ | --------------- |
|      1 |               7 |
|      3 |               3 |
|      4 |               3 |
|      6 |               7 |
|      8 |               2 |
|     12 |               2 |
|     13 |               1 |
|     15 |               1 |
|     17 |               2 |
|     20 |               1 |
|     24 |               1 |
|     35 |               2 |
|     37 |               3 |
|     38 |               1 |
|    171 |               1 |

### Seleccionar líneas coincidentes {: .exercise}

Usando `async` y `await`,
escribir un programa llamado `match.js` que encuentre e imprima líneas conteniendo una cadena de texto dada.
Por ejemplo:

```sh
node match.js Toronto first.txt second.txt third.txt
```

imprimiría todas las líneas de los tres archivos conteniendo la palabra "Toronto".
{: .continue}

### Encontrar líneas en todos los archivos {: .exercise}

Usando `async` y `await`,
escribir un programa llamado `in-all.js` que encuentre e imprima líneas coincidentes en todos los archivos de entrada.
Por ejemplo:

```sh
node in-all.js first.txt second.txt third.txt
```

imprimirá esas líneas que ocurren en todos los tres archivos.
{: .continue}

### Encontrar diferencias entre dos archivos {: .exercise}

Usando `async` y `await`,
escribir un programa llamado `file-diff.js`
que compare las líneas en dos archivos
y muestre cuales están solo en el primer archivo,
cuáles solo en el segundo,
y cuáles están en ambos.
Por ejemplo,
si `left.txt` contiene:

```txt
some
people
```

y `right.txt` contiene:
{: .continue}

```txt
write
some
code
```

entonces:
{: .continue}

```sh
node file-diff.js left.txt right.txt
```

imprimiría:
{: .continue}

```txt
2 code
1 people
* some
2 write
```

donde `1`, `2`, y `*` muestran si las líneas está en solo el primero o el segundo archivo,
o están en ambos.
Nótese que el orden de las líneas en el archivo no importa.
{: .continue}

Pista: puede que quieras usar la clase `Set` para almacenar líneas.

### Trazar la carga de archivos {: .exercise}

Suponiendo que cargamos un archivo de  configuración YAML
usando la  versión promesificada de la librería  `fs`,
¿En qué orden se imprimen las sentencias en  programa de prueba y por qué?

[% inc file="x-trace-load/ejemplo.js" %]

### Alguno y todos {: .exercise}

1.  Añadir un método `Pledge.any` que tome un arreglo de promesas
    y tan pronto como una de estas en el arreglo se resuelva,
    retorne una sola promesa que resuelva con el valor de esa promesa.

2.  Añadir otro método `Pledge.all` que tome un arreglo de promesas
    y retorne una sola promesa que resuelva a un arreglo
    con los  valores finales de todas esas promesas.

[Este artículo][promise_all_any] puede ser útil.