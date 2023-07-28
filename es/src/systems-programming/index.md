---
title: "Programación de Sistemas"
---

La mayor diferencia entre JavaScript y la mayoría de los otros lenguajes de programación
es que muchas operaciones en JavaScript son [%i "asynchronous execution" "execution!asynchronous" %][%g asynchronous "asíncronas" %][%/i%].
Sus diseñadores no querían que los navegadores se congelaran esperando que llegaran
los datos, o que los usuarios dieran clic a las cosas,
así que las operaciones que pueden ser lentas son implementadas
mediante la descripción inmediata de qué hacer luego.
Y ya que lo que toque el disco duro es lento desde la perspectiva de un procesador,
[Node][nodejs] implementa operaciones del [%i "filesystem operations" %][%g filesystem "sistema de archivos" %][%/i%] de la misma forma.

<div class="callout" markdown="1">

### ¿Qué tan lento es lento?

[%b Gregg2020 %] usó la analogía en [%t systems-programming-times %]
para mostrar cuanto tardaría una computadora en hacer diferentes cosas
si nos imaginamos que un ciclo de CPU es equivalente  a un segundo.

</div>

<div class="table" id="systems-programming-times" caption="Tiempos de operación de la computadora a escala humana." markdown="1">
| Operación | Tiempo actual | Sería… |
| --------- | ----------- | --------- |
| 1 ciclo de CPU  | 0.3 nseg | 1 seg |
| acceso a memoria  | 120 nseg | 6 min |
| E/S disco estado sólido   | 50-150 μseg | 2-6 días |
| E/S disco rotacional  | 1-10 mseg | 1-12 meses |
| Internet: San Francisco a New York | 40 mseg | 4 años |
| Internet: San Francisco a Australia | 183 mseg | 19 años |
| Reinicio Físico del sistema | 5 min | 32,000 años |
</div>

Los primeros  programas en JavaScript usaban [%i "callback function" %][%g callback "funciones de retrollamada" %][%/i%] para describir operaciones asíncronas,
pero como vamos a ver,
las retro-llamadas pueden ser difíciles de entender, aún en programas pequeños.
En 2015,
los desarrolladores del lenguaje estandarizaron una herramienta de alto nivel llamada promesas
para facilitar el manejo de retrilladas,
y más recientemente han agregado nuevas palabras clave como `async` y `await` para hacerlo aún más fácil.
Necesitamos comprender las tres capas para poder depurar las cosas cuando fallen,
así que este capítulo explora  las retro-llamadas,
mientras que [%x async-programming %] muestra cómo funcionan las promesas y `async`/`await`.
Este capítulo también muestra  cómo leer y escribir archivos y directorios con las librerías estándar de Node,
porque vamos a estarlo haciendo mucho.

<div class="pagebreak"></div>

## ¿Cómo podemos listar un directorio? {: #systems-programming-ls}

Para empezar,
intentemos listar el contenido de un directorio como lo haríamos en [%i "Python" %][Python][python][%/i%]
o [%i "Java" %][Java][java][%/i%]:

[% inc file="list-dir-wrong.js" %]

Usamos [%i "import module" %]<code>import <em>módule</em> desde 'source'</code>[%/i%] para cargar el <code><em>source</em></code> de la librería
y asignar su contenido  <code><em>module</em></code>.
Luego,
podemos referirnos a  cosas en la librería usando <code><em>modulo.component</em></code>
del modo que nos referimos a cosas en cualquier otro objeto.
Podemos usar el nombre que queramos para el módulo,
lo que nos permite dar aliases cortos a librerías con nombres largos;
aprovecharemos esto en capítulos posteriores.
{: .continue}

<div class="callout" markdown="1">

### `require` versus `import`

En 2015, una nueva versión de JavaScript llamada ES6 introdujo
la palabra reservada [%i "import vs. require" "require vs. import" %]`import`[%/i%] para importar módulos.
Esto mejora respecto del antiguo `require` de varias maneras,
pero Node aún usa `require` por defecto.
Para indicarle que use `import`,
hemos añadido `"type": "módulo"` al inicio de nuestro archivo Node llamado `package.json` .

</div>

Nuestro programa usa la librería [`fs`][node_fs] 
la cual contiene funciones para crear directorios, leer o borrar archivos, etc.
(su nombre es la abreviación de "filesystem".)
Le decimos al programa qué listar usando [%i "command-line argument" %][%g command_line_argument "argumentos en la línea de comandos" %][%/i%],
la cual Node  guarda automáticamente en un arreglo llamado [%i "process.argv" %]`process.argv`[%/i%].
El nombre del programa usado para ejecutar nuestro código se guarda en `process.argv[0]` (que en este caso es `node`),
en tanto que `process.argv[1]` es el nombre de nuestro programa (en este caso `list-dir-wrong.js`).
El resto de `process.argv` contiene los argumentos  que le dimos en la línea de comandos cuando ejecutamos el programa,
así que `process.argv[2]` es el primer argumento tras el nombre de nuestro programa ([%f systems-programming-process-argv %]).

[% figure
   slug="systems-programming-process-argv"
   img="process-argv.svg"
   alt="argumentos de línea de comandos en `process.argv`"
   caption="La forma en que Node almacena argumentos de la línea de comandos en <code>process.argv</code>."
%]

<div class="pagebreak"></div>

Si ejecutamos este programa con el nombre de un directorio como su argumento,
`fs.readdir` retorna los nombres del contenido del directorio como un   arreglo de cadenas.
El programa usa `for (const name of results)` para iterar por el contenido del arreglo.
Podríamos usar  `let` en lugar de `const`,
pero es una buena práctica declarar las cosas como [%i "const declaration!advantages of" %]`const`[%/i%] en los posible para que quien lea el programa, sepa que
la variable no va a variar --- y con esto
se reduce  [%i "cognitive load" %][%g cognitive_load "carga cognitiva" %][%/i%] en quienes lean el programa.
Finalmente,
[%i "console.log" %]`console.log`[%/i%] es el equivalente  
en JavaScript del comando ' `print` en otros lenguajes;
su extraño nombre viene del hecho que
su propósito original era crear [%g log_message "mensajes 
de log" %] en la  [%g console "consola" %] del navegador.

Desafortunadamente,
nuestro programa no funciona:

[% inc pat="list-dir-wrong.*" fill="sh out" %]

El mensaje de error viene de algo que no escribimos
cuyo origen tendríamos dificultad en leer.
Si buscamos el nombre de nuestro file (`list-dir-wrong.js`)
veremos que el error ocurrió en la línea 4;
todo lo que está arriba dentro de `fs.readdir`,
en tanto que todo lo que está debajo es Node cargando y  ejecutando nuestro programa.
{: .continue}

El problema es que `fs.readdir` no retorna algo.
En su lugar, 
la documentación dice que  necesita una función de retro-llamada
que  le diga qué hacer cuando haya datos disponibles,
así que necesitamos explorar aquellos para que nuestro programa funcione.

<div class="callout" markdown="1">

### Un teorema

1.  Cada programa contiene al menos un error.
2.  Cada programa puede acortarse al menos en una línea.
3.  Por lo tanto, cada programa puede reducirse a una sola sentencia, la cual está equivocada.

— varios atributos
{: .continue}

</div>

## ¿Qué es una función de retro-llamada? {: #systems-programming-callback}

JavaScript usa un modelo de programación [%i "single-threaded execution" "execution!single-threaded" %][%g single_threaded "de un solo hilo" %][%/i%]:
como se dijo en la introducción a esta lección,
se dividen las operaciones como E/S  de archivo en "por favor haz esto" y "haz esto cuando los datos estén disponibles".
`fs.readdir` es la primera parte,
pero necesitamos escribir una función que especifica la segunda parte.

<div class="pagebreak"></div>

JavaScript  guarda una referencia a  esta función
y llama con un conjunto específico parámetros cuando nuestros datos estén listo
([%f systems-programming-callback %]).
Aquellos parámetros definieron un [%i "protocol!API as" "API" %][%g protocol "protocolo" %][%/i%] estándar
para conectar con librerías,
del modo que el estándar USB nos permite conectar dispositivos de hardware juntos.

[% figure
   slug="systems-programming-callbacks"
   img="callbacks.svg"
   alt="Ejecutando retrollamadas"
   caption="Cómo JavaScript ejecuta funciones de retro-llamada."
%]

Este programa corregido da una retro-llamada a `fs.readdir` llamada `listContents`:

[% inc file="list-dir-function-defined.js" %]

Las [%i "callback function!conventions for" %]retrollamadas de Node[%/i%]
siempre reciben un error (si hay alguno) como su primer argumento
y el resultado de una llamada exitosa como su segundo argumento.
La función puede distinguir la diferencia revisando si el argumento de error es `null`.
Si lo es, la función lista el contenido del directorio con `console.log`,
de otro modo, usa `console.error` para mostrar  mensaje de error.
Ejecutemos el programa con el [%g current_working_directory "directorio de trabajo actual" %]
(escrito como as '.')
como argumento:
{: .continue}

[% inc pat="list-dir-function-defined.*" fill="sh slice.out" %]

Nada de lo que sigue tendrá sentido si  no comprendemos
el orden en el que Node ejecuta las sentencias de este programa
([%f systems-programming-execution-order %]):

1.  Ejecutar la primera línea para cargar la librería `fs`.

1.  Definir una función de dos parámetros y asignarla a `listContents`.
    (Recodemos que una función es solo otro tipo de datos.)

1.  Obtener el nombre del directorio desde los argumentos de la linea de comandos.

1.  Llamar `fs.readdir` para iniciar una operación en el sistema de archivos,
    indicándole qué directorio queremos leer y qué función llamar cuando los datos estén disponibles.

1.  Imprimir un mensaje a mostrar que estamos al final del archivo.

1.  Esperar hasta que la operación en el sistema de archivos termine (este paso es invisible).

1.  Llamar la función de retro-llamada, que imprima el listado del directorio.

[% figure
   slug="systems-programming-execution-order"
   img="execution-order.svg"
   alt="orden de ejecución de retro-llamada"
   caption="cuando JavaScript ejecuta funciones de retro-llamada."
%]

## ¿Qué son las funciones anónimas? {: #systems-programming-anonymous}

La mayoría del programadores en JavaScript  no definirían la función `listContents`
y y luego la pasarían como una retro-llamada.
En su lugar,
ya que la retro-llamada se usa solo en un lugar,
es más [%g idiomatic "idiomático" %]
definirla donde se necesita
como una [%i "función anónima" "function!anonymous" %][%g anonymous_function "función anónima" %][%/i%].
Esto facilita ver qué va a pasar cuando la operación complete,
aunque signifique que el orden de ejecución sea muy diferente desde el orden de lectura
([%f systems-programming-anonymous-functions %]).
Usar una función anónima nos da la  versión final de nuestro programa:

[% inc file="list-dir-function-anonymous.js" %]

[% figure
   slug="systems-programming-anonymous-functions"
   img="anonymous-functions.svg"
   alt="Funciones Anónimas como retrollamadas"
   caption="Cómo y cuando JavaScript crea y ejecuta funciones anónimas de retro-llamada."
%]

<div class="callout" markdown="1">

### Las funciones son datos

Como lo notamos antes,
una función es solo [%i "code!as data" %]otro tipo de datos[%/i%].
en lugar de componerse de números, caracteres, o píxeles, está hecha de instrucciones,
pero estas se almacenan en memoria como todo lo demás.
Definir una función al vuelo no es diferente a definir un arreglo en-sitio usando `[1, 3, 5]`,
y pasar una función como un argumento a otra función  no es diferente a pasar un arreglo.
Vamos a depender de esta idea una y otra vez en las siguientes lecciones.

</div>

## ¿Cómo podemos seleccionar un conjunto de archivos? {: #systems-programming-fileset}

Supongamos que queremos copiar algunos archivos en lugar de listar el contenido de un directorio.
Dependiendo de la situación
podemos querer copiar solo algunos archivos desde la línea de comandos
o todos excepto algunos excluidos explícitamente.
Lo que *no* queremos es listar los archivos uno a uno;
en su lugar,
queremos poder escribir patrones como `*.js`.

Para encontrar archivos que coincidan con patrones como ese,
podemos usar el módulo [`glob`][node_glob].
(Hacer [%i "globbing" %][%g globbing "glob" %][%/i%] (abreviado para "global") es un viejo término Unix  para coincidir 
un conjunto de archivos por nombre.)
El módulo `glob` provee una función que toma un patrón y una retro-llamada
y hace algo con cada nombre de archivo que coincide con el patrón:

[% inc pat="glob-all-archivos.*" fill="js slice.out" %]

El `**` precedente significa "recurrir en los sub-directorios",
mientras que `*.*` significa "cualesquiera caracteres seguidos del '.' seguido por cero o más caracteres"
([%f systems-programming-globbing %]).
Los nombres que no coincidan `*.*` no serán incluidos,
y por defecto,
ningún nombre que inicie con a '.' carácter.
Esta es otra vieja convención en Unix:
los archivos y directorios cuyos nombres comienzan con un  '.'
normalmente contienen información de configuración para varios programas,
así que la mayoría de los comandos no los tocarán a menos que se indique lo contrario.

[% figure
   slug="systems-programming-globbing"
   img="globbing.svg"
   alt="Empatando nombres de archivo con `glob`"
   caption="Usando patrones `glob` para coincidir con nombres de archivos."
%]

Este programa funciona,
pero quizá no queramos copiar archivos de respaldo de editor con nombres terminando  en `.bck`.
Podemos deshacernos de ellos  [%i "globbing!filtering results" %][%g filter "filtrando" %][%/i%] la lista que `glob` devuelve:

<div class="pagebreak"></div>

[% inc pat="glob-get-then-filter-pedantic.*" fill="js slice.out" %]

[%i "arreglo.filter" %]`arreglo.filter`[%/i%] crea un nuevo arreglo
con todos los ítems del arreglo original que pasen una prueba
([%f systems-programming-arreglo-filter %]).
La prueba se especifica como una función de retro-llamada 
que `arreglo.filter` llama una vez por cada ítem.
Esta función debe regresar un [%g boolean "Boolean" %]
que indique a `arreglo.filter` si mantiene o no a ítem en el nuevo arreglo.
`arreglo.filter` no modifica el arreglo original,
para poder filtrar nuestra lista original de nombres varias veces si así lo queremos.

[% figure
   slug="systems-programming-array-filter"
   img="array-filter.svg"
   alt="Usando `arreglo.filter`"
   caption="Seleccionar los  elementos del arreglo usando `arreglo.filter`."
%]

Podemos hacer más idiomático  nuestro programa de globbing 
removiendo los paréntesis alrededor del parámetro único
y solo escribiendo la expresión que deseamos retorne la función:

[% inc file="glob-get-then-filter-idiomatic.js" %]

Sin embargo,
resulta que `glob` filtrará por nosotros.
De acuerdo a su documentación,
la función toma un objeto `options` lleno de parámetros llave-valor 
que controlan su comportamiento.
Este es otro patrón común en librerías de Node:
en lugar de aceptar un gran número de parámetros rara vez usados,
una función puede tomar como  entrara un solo objeto lleno de parámetros.

Si usamos este,
nuestro programa se convierte en:

[% inc file="glob-filter-con-options.js" %]

Observemos que no ponemos comillas a la clave en el objeto `options`.
Las llaves en objetos casi siempre son cadenas,
y si una de ellas es tan simple que no confunda al analizador sintáctico,
no necesitamos escribirla entre comillas.
Aquí,
"tan simple" quiere decir "parece que podría ser un nombre de variable",
o similarmente, "contiene solo letras, dígitos, y guión bajo".
{: .continue}

<div class="callout" markdown="1">

### Nadie sabe todo

Combinamos `glob.glob` y `arreglo.filter` en nuestras funciones por más de un año
antes que alguien mencionara la opción `ignore` para `glob.glob`.
Esto demuestra que:

1.  La vida es corta,
    así que la mayoría de nosotros encuentra la forma de resolver el problema enfrente nuestro
    y re-usar en lugar de buscar algo mejor.

2.  Las revisiones de código no solo son para encontrar errores:
    también son la forma más efectiva de transferir conocimiento entre programadores.
    Aún si alguien tiene mucha más experiencia que tú,
    existe una buena oportunidad de que hayas encontrado una mejor forma de hacer algo
    que la que estaban usando (ver el punto #1 arriba).

</div>

Para terminar nuestro programa de globbing,
vamos a especificar un directorio origen en la línea de comandos e incluir eso en el patrón:

[% inc file="glob-with-source-directory.js" %]

Este programa usa [%i "string interpolation" %][%g string_interpolation "interpolación de cadena" %][%/i%]
para insertar el valor de `srcDir` en una cadena.
La cadena plantilla se escribe en apóstrofes invertidos,
y JavaScript convierte cada expresión escrita como `${expresión}` en texto.
Podríamos crear el patrón concatenando las cadenas usando
`srcDir + '/**/*.*'`,
pero la mayoría de programadores leen la interpolación con más facilidad.
{: .continue}

## ¿Cómo podemos copiar un conjunto de archivos? {: #systems-programming-copy}

Si queremos copiar un conjunto de archivos en lugar de solo listarlos
necesitamos una manera de crear las [%g path "rutas" %] de los archivos que vamos a crear.
Si nuestro programa toma un segundo argumento que especifica el directorio de salida deseado,
podemos construir la ruta completa de salida reemplazando el nombre del directorio origen con esa ruta:

[% inc file="glob-con-dest-directorio.js" %]

Este programa usa [%i "destructuring assignment" "assignment!destructuring" %][%g destructuring_assignment "asignación desestructurada" %][%/i%]
para crear dos variables al mismo tiempo
desempacando los elementos de un arreglo
([%f systems-programming-destructuring-assignment %]).
Solo funciona si el arreglo contiene suficientes elementos,
i.e.,
si tanto el origen y el destino son dados en la línea de comandos;
añadiremos una revisión para eso en los ejercicios.
{: .continue}

[% figure
   slug="systems-programming-destructuring-assignment"
   img="destructuring-assignment.svg"
   alt="Empatando valores con asignación desestructurada "
   caption="Asignando muchos valores al mismo tiempo mediante desestructuración."
%]

Un problema más serio es que
este programa solo sirve si el directorio destino ya existe:
`fs` y librerías similares en otros lenguajes normalmente no crearán directorios por nosotros automáticamente.
La necesidad de hacer esto ocurre tan seguido que hay una función llamada `ensureDir` para hacerlo:

[% inc file="glob-ensure-output-directorio.js" %]

Nótese que importamos desde `fs-extra` en lugar de desde `fs`;
el módulo [`fs-extra`][node_fs_extra] provee algunas utilidades útiles además de `fs`.
También usamos [`path`][node_path] para manipular nombres de rutas
en lugar de concatenar o interpolar cadenas
porque hay muchos  [%g edge_case "casos limítrofes" %] complicados en los nombres de ruta que los autores de ese módulo han resuelto por nosotros.

<div class="callout" markdown="1">

### Usando nombres diferentes

Ahora vamos a llamar  nuestros argumentos de línea de comandos  `srcRoot` y `dstRoot`
en lugar de `srcDir` y `dstDir`.
Usamos  originalmente `dstDir` tanto como
el nombre del  directorio destino de primer (desde la línea de comandos),
y el nombre del directorio de salida particular a crear.
Esto fue legal,
ya que cada función crea
un nuevo [%i "scope!of variable definitions" "variable definition!scope" %][%g scope "ámbito" %][%/i%],
pero es difícil de entender para la gente.
</div>

Nuestro programa de copiado de archivos actualmente crea directorios 
destino vacíos pero no copia archivo alguno.

Usemos `fs.copy` para hacer eso:

[% inc file="copy-file-unfiltered.js" %]

El programa ahora tiene tres niveles de retro-llamada
([%f systems-programming-triple-callback %]):

1.  cuando `glob` tiene datos, hace algo y luego llama `ensureDir`.

1.  cuando `ensureDir` termina, copia  un archivo.

1.  cuando `copy` termina, revisa  el estado de error.

[% figure
   slug="systems-programming-triple-callback"
   img="triple-callback.svg"
   alt="tres niveles de retro-llamada"
   caption="tres niveles de retro-llamada en el ejemplo corriente."
%]

Nuestro programa parece que debiera funcionar,
pero si intentamos  copiar todo en el directorio con estas lecciones
recibimos un mensaje de error:

[% inc pat="copy-file-unfiltered.*" fill="sh out" %]

El problema es que `node_modules/fs.stat` y `node_modules/fs.walk` coinciden con nuestro expresión de globbing ,
pero son directorios en lugar de archivos.
Para prevenir que nuestro programa intente usar `fs.copy` en directorios,
debemos usar `fs.stat` para obtener las propiedades de las cosas que `glob` 
nos da y entonces revisar si son archivos.
El nombre "stat" es abreviado de "estatus",
y ya que el estatus de algo en el sistema de archivos puede ser muy complejo,
[%i "fs.stat" %]`fs.stat`[%/i%] retorna [an object with methods that can answer commmon questions][node_fs_stats].

Esta es la  versión final de nuestro programa de copiado de archivos:

[% inc file="copy-file-filtered.js" %]

Funciona, pero cuantos niveles de retrollamadas asíncronas es 
difícil de entender para humanos.

[%x async-programming %] presentará  un par de herramientas
que hacen código como este más fácil de leer.
{: .continue}

## Ejercicios {: #systems-programming-exercises}

### ¿Dónde está Node? {: .exercise}

Escribir un programa llamado `wherenode.js` que imprima la ruta entera
de la versión de Node que se está ejecutando.

### Rastreando retrollamadas {: .exercise}

¿En qué orden imprime mensajes el programa siguiente?

[% inc file="x-trace-callback/trace.js" %]

### Rastreando retrollamadas anonymous {: .exercise}

¿En qué orden imprime mensajes el programa siguiente?

[% inc file="x-trace-anonymous/trace.js" %]

### Revisando argumentos {: .exercise}

Modificar el programa de copia de archivos para revisar que se le dieron     los argumentos correctos  de línea de comandos 
e imprima  un mensaje sensible de error (inclusive el enunciado de uso) si no lo tiene.

### Patrones glob  {: .exercise}

¿Qué nombres de archivo coinciden en cada uno de los siguientes patrones glob?

-   `results-[0123456789].csv`
-   `results.(tsv|csv)`
-   `results.dat?`
-   `./results.data`

### Filtrando arreglos {: .exercise}

Llenar el  espacio en el código siguiente para que la salida coincida con la que se muestra.
Nota: puedes comparar cadenas en JavaScript usando `<`, `>=`, y otros operadores,
así que (por ejemplo) `person.personal > 'P'` es`true`
si el nombre personal de alguien inicia con una letra que siga a 'P' en el alfabeto.

[% inc pat="x-arreglo-filter/filter.*" fill="js txt" %]

### Interpolation de cadena {: .exercise}

Completar el código siguiente para que imprima el mensaje mostrado.

[% inc pat="x-string-interpolation/interpolate.*" fill="js txt" %]

### Asignación de desestructuración  {: .exercise}

¿qué se asigna a cada variable nombrada en cada sentencia abajo?

1.  `const primer = [10, 20, 30]`
1.  `const [primer, segundo] = [10, 20, 30]`
1.  `const [primer, segundo, third] = [10, 20, 30]`
1.  `const [primer, segundo, third, fourth] = [10, 20, 30]`
1.  `const {left, right} = {left: 10, right: 30}`
1.  `const {left, middle, right} = {left: 10, middle: 20, right: 30}`

### Contando lineas {: .exercise}

Escribir un programa llamado `lc` que cuente y reporte el número de líneas en
uno o más archivos y el  número total de lineas,
para que `lc a.txt b.txt` muestre algo como:

```txt
a.txt 475
b.txt 31
total 506
```

### Renombrando archivos {: .exercise}

Escribir un programa llamado `rename` que tome tres o más argumentos
de línea de comandos:

1.  Una [%g filename_extension "extensión de archivo " %] a coincidir.
2.  Una extensión para reemplazar la primera.
3.  Los nombres de uno o más archivos existentes.

cuando se ejecute,
`rename` renombra cualquier archivo con la primera extensión para crear archivos con la segunda extensión,
pero *no* sobre-escribirá un archivo existente.
Por ejemplo,
supongamos que un directorio contiene `a.txt`, `b.txt`, y `b.bck`.
El comando:

```sh
rename .txt .bck a.txt b.txt
```

renombrará `a.txt` por `a.bck`,
pero *no* renombra `b.txt` porque `b.bck` ya existe.
{: .continue}