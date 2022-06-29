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
por favor vean [% i "Cook, Mary Rose" %][Mary Rose Cook's][cook-mary-rose][% /i %], un excelente [Gitlet][gitlet] proyecto.

## ¿Cómo podemos identificar inequívocamente archivos? {: #archivo-respaldo-únicos}

Para evitar almacenar copias redundantes de archivos,
necesitamos saber cuando dos archivos contienen los mismos datos.
No podemos confiar en nombres porque los archivos pueden moverse o renombrarse con el tiempo;
podríamos comparar los archivos byte por byte,
pero una forma más rápida es  usar una [% i "hash_function" %][% g hash_function %]función hash[% /g %][% /i %]
que convierte datos arbitrarios en una cadena de bits de longitud fija. 
([% f archivo-respaldo-hash-función %]).

[% figure slug="archivo-respaldo-hash-función" img="figures/hash-función.svg" alt="Hash funciones" caption="Cómo hash funciones acelera   la búsqueda." %]

Una función hash  siempre  produce el mismo [% i "hash código" %][% g hash_code %] código hash[% /g %][% /i %] para una entrada dada.
Una [% i "cryptographic hash función" "hash función!cryptographic" %][% g cryptographic_hash_function %] función hash criptográfica [% /g %][% /i %]
tiene dos propiedades extra :

1.  La salida depende de la entrada entera:
    cambiar un solo byte resulta en un código hash diferente.

1.  Las salidas lucen como números aleatorios:
    son impredecibles y distribuidos uniformemente
    (i.e., la posibilidades de lograr un  código  hash específico son las mismas)

Es fácil escribir una mala función hash,
pero muy difícil escribir una que califica como criptográfica.
Usaremos por lo tanto una librería para calcular para calcular hashes  [% i "hash código!SHA-1" "SHA-1 hash código" %][% g sha_1 %]SHA-1[% /g %][% /i %] de 160 bits para nuestros archivos.
Estos no son lo suficientemente aleatorios como para mantener privados los datos  de un paciente respecto de un atacante con recursos,
pero eso no es para lo que los estamos usando:
solo queremos hashes que sean aleatorios para que [% i "hash función!colisión" "colisión (en hashing)" %][% g colisión %] la colisión[% /g %][% /i %] sea extremadamente improbable.

> ### El Problema del Cumpleaños
>
> Las probabilidades de que dos personas compartan cumpleaños son 1/365 (ignorando el 29 de Febrero).
> Las probabilidades de que *no lo compartan* son por lo tanto 364/365.
> Cuando agregamos una tercer persona,
> Las probabilidades de que no compartan cumpleaños con cualquiera de las otras dos personas son 363/365,
> así que las probabilidades totales de que nadie comparta un cumpleaños son (365/365)×(364/365)×(363/365).
> Si seguimos calculando, hay un chance de 50%  que dos personas compartan cumpleaños en un grupo de solo 23 personas,
> y un chance de 99.9%  en 70 personas.
>
> Podemos usar el mismo cómputo para calcular cuantos archivos necesitamos hashear antes que haya una probabilidad del 50% de una colisión.
> En lugar de  365 usamos \\(2^{160}\\) (el número de valores con longitud de 160 bits),
> y tras revisar [Wikipedia][wikipedia-cumpleaños-Problema]
> y hacer algunos cálculos con [% i "Wolfram Alpha" %][Wolfram Alpha][wolfram-alpha][% /i %],
> calculamos que necesitaríamos tener aproximadamente \\(10^{24}\\) archivos
> para tener   un chance de un colisión del 50% .
> Estamos dispuestos a tomar ese riesgo…

El módulo [`crypto`][node-crypto] de [Node][nodejs]  provee herramientas para crear un hash SHA-1 .
Para usarlo,
creamos un objeto que lleva la cuenta de estado actual  de los    cálculos de hashing,
le decimos como queremos codificar (o representar) el valor hash ,
y entonces le pasamos algunos bytes.
Cuando terminamos,
llamamos su método `.end` 
y entonces usamos su método `.read` para obtener el resultado final:

[% excerpt pat="hash-text.*" fill="js sh out" %]

Hashear un archivo en lugar de una cadena fija de texto es simple:
solo leemos el contenido del archivo y pasamos aquellos caracteres al objeto que hace el hash:

[% excerpt pat="hash-archivo.*" fill="js sh out" %]

Sin embargo,
es más eficiente procesar el archivo como un [% g stream %]stream[% /g %]:

[% excerpt pat="hash-stream.*" fill="js sh out" %]

Este tipo de interfaz se llama
una API [% i "Transmisión API" "execution!Transmisión" %][% g streaming_api %] de Transmisión[% /g %][% /i %] [% g api %]API[% /g %]
porque está diseñada para procesar un stream de datos un bloque a la vez
en lugar de requerir todos los datos en memoria de una.
Muchas aplicaciones usan streams
para que los programas no tengan que leer archivos  enteros (acaso grandes) en la memoria.
{: .continue}

Para iniciar,
este programa pide a la librería `fs`  crear un  stream de lectura para un archivo
y  [% g pipe %]entubar[% /g %] los datos desde ese stream al objeto hashing 
([% f archivo-respaldo-Transmisión %]).
Luego, dice al  objeto hashing qué hacer cuando no hay más datos
proveyendo un [% i "event handler!Transmisión API" "Transmisión API!event handler" %][% g handler %]detector[% /g %][% /i %] para el evento "finish" .
Esto es llamado de forma asíncrona:
como la salida muestra,
el programa principal termina antes que la tarea que maneja los datos sea agendada y ejecutada.
La mayoría de programas también proveen un detector para que eventos de "datos"  hagan algo con cada bloque de datos que va llegando;
el objeto `hash`  en nuestro programa hace eso  por nosotros.

[% figure slug="archivo-respaldo-Transmisión" img="figures/Transmisión.svg" alt="Transmisión de operaciones de archivo" caption="Procesando archivos como streams de bloques." %]

## ¿Cómo podemos respaldar archivos? {: #archivo-respaldo-respaldo}

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
([% f archivo-respaldo-storage %]).

[% figure slug="archivo-respaldo-storage" img="figures/storage.svg" alt="respaldo archivo storage" caption="Organización del almacenamiento de respaldo de archivos." %]

Podemos  construir las herramientas necesarias para esto usando promesas ([% x async-programming %]).
La función principal crea una promesa que use la versión asíncrona  de `glob` para encontrar archivos
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

El código que escribimos es más claro de lo que sería con retro-llamadas
(intenta reescribirla si no me crees)
pero la capa de promesas alrededor todavía oscurece todo su significado.
Las mismas operaciones son más fáciles de leer cuando usamos `async` y `await`:

[% excerpt archivo="hash-existing-async.js" keep="principal" %]

Esta versión crea y resuelve exactamente las mismas promesas como en la ejecución anterior,
pero esas promesas son creadas automáticamente para nosotros por Node.
Para ver que funciona,
la corremos para los mismos archivos de entrada :
{: .continue}

[% excerpt pat="run-hash-existing-async.*" fill="js sh slice.out" %]

## ¿Cómo podemos rastrear cuales archivos ya han sido respaldados? {: #archivo-respaldo-track}

La segunda parte de nuestro herramienta de respaldo lleva registro de cuales archivos han sido respaldados y cuales no.
Almacena los respaldos en un directorio que contiene archivos respaldo como `abcd1234.bck`
y archivos describiendo el contenido de instantáneas particulares.
Estas últimas se llaman `ssssssssss.csv`,
donde  `ssssssssss` es la [% g utc %]UTC[% /g %] [% g tiempostamp %]marca temporal[% /g %]  de creación del respaldo
y la  extensión `.csv` indica que el archivo está formateado como [% g csv %]valores separados por comas [% /g %].
(Podríamos guardar estos archivos como [% g json %]JSON[% /g %], pero CSV es más fácil de leer para las personas).

> ### hora de revisión/hora de uso
>
> nuestra convención  de nomenclatura  para indexar archivos fallará si intentamos crea más de un respaldo por segundo.
> Esto puede parece poco probable,
> pero muchas fallas y faltas de seguridad son resultado de programadores asumiendo que las cosas no pasarían.
>
> Podríamos tratar de evitar este problema usando un esquema de nomenclatura bi-partita `ssssssss-un.csv`,
> `ssssssss-b.csv`, y así,
> pero esto lleva a una [% i "condición de carrera" %][% g race_condition %]condición de carrera[% /g %][% /i %]
> llamada [% i "condición de carrera!tiempo de revisar/tiempo de use" "tiempo de revisar/tiempo de use" %][% g toctou %] hora de revisión/hora de uso[% /g %][% /i %].
> Si dos usuarios ejecutan la herramienta de respaldo al mismo tiempo,
> ambos verán que no hay un archivo (aún) con la marca temporal actual,
> entonces ambos lo crearán la primera vez.

[% excerpt archivo="check-existing-archivos.js" %]

Para probar nuestro programa
creamos manualmente directorios de prueba con hashes (cortos) manufacturados  :

[% excerpt pat="tree-test.*" fill="sh out" %]

Usamos [% i "Mocha" %][Mocha][mocha][% /i %] para gestionar nuestros pruebas.
Cada test es una  función `async`;
Mocha automáticamente espera que se completen todos antes de reportar resultados.
Para correrlos,
agregamos la línea:

```js
"test": "mocha */test/test-*.js"
```proyecto

en la sección `scripts`  del archivo `package.json`  en nuestro proyecto
así que cuando llamamos `npm run test`,
Mocha busca los archivos en los sub-directorios `test`  de los directorios que tienen nuestras lecciones.
{: .continue}

Aquí están algunas de nuestras pruebas:

[% excerpt archivo="test/test-find.js" %]

y este es el reporte de Mocha:
{: .continue}

[% excerpt archivo="test-check-sistema de archivos.out" %]

## ¿Cómo podemos probar código que modifica archivos? {: #archivo-respaldo-test}

Lo último que  nuestra herramienta necesita hacer
es copiar los archivos que necesita y crear un nuevo archivo de índice.
El código en sí será relativamente simple,
pero probarlo será complicado porque
nuestras pruebas necesitarán crear directorios y archivos antes de correr
y luego borrarlos
(para que no contaminen pruebas posteriores).

un mejor plan es usar un [% i "objeto simulado!for testing" "unit test!using objeto simulado" %][% g mock_object %]objeto simulado[% /g %][% /i %]
en lugar del sistema de archivos real .
Un objeto simulado tiene la misma  interfaz que la función, objeto, clase, o librería que reemplaza,
pero está diseñado solo para usarse durante pruebas.
La librería de Node [`mock-fs`][node-mock-fs]  provee las mismas funciones como la librería `fs`,
pero almacena todo en memoria
([% f archivo-respaldo-mock-fs %]).
Esto evita que nuestras pruebas accidentalmente alteren the sistema de archivos,
y también hace más rápidas las pruebas
(porque las operaciones en-memoria son miles de veces más rápidas que las  operaciones en disco).

[% figure slug="archivo-respaldo-mock-fs" img="figures/mock-fs.svg" alt="simulación del sistema de archivos" caption="Usando un simulado del sistema de archivos para simplificar las pruebas." %]

Podemos crear un simulaod del sistema de archivos al dar a la librería una descripción en JSON  de
los archivos y qué debieran contener:

[% excerpt archivo="test/test-find-mock.js" omit="pruebas" %]

[% i "Mocha!beforeEach" %]Mocha[% /i %] automáticamente llama a `beforeEach` antes de correr cada prueba,
y [% i "Mocha!afterEach" %]`afterEach`[% /i %] luego que cada prueba termina
(el cual is otro [% i "protocol!for unit testing" %]protocolo[% /i %]).
Todas las pruebas quedan exactamente igual,
y ya que `mock-fs` reemplaza las funciones en la  librería standard `fs` con sus propias,
nada en nuestra aplicación necesita cambiar.
{: .continue}

Finalmente, estamos listos para escribir el programa que efectivamente respalda archivos:

[% excerpt archivo="backup.js" %]

Las pruebas para esto son más complicadas que las pruebas que hemos escrito antes
porque queremoves revisar con los hashes reales del archivo.
Vamos a usar algunas fixtures para ejecutar las pruebas:

[% excerpt archivo="test/test-backup.js" keep="fixtures" %]

y luego correr unas pruebas:
{: .continue}

[% excerpt archivo="test/test-backup.js" keep="pruebas" %]
[% excerpt archivo="test-respaldo.out" %]

<blockquote class="break-antes" markdown="1">
### diseñar para probar

Una de las mejores formas---quizá *la* mejor forma--- de evaluar un diseño de software 
es pensar en la [% i "testabilidad!como criterio de diseño " "software diseño!testabilidad" %]testabilidad[% /i %] [% b Feathers2004 %].
Pudimos usar un simulado del sistema de archivos En lugar de  de uno real
porque el sistema de archivos tiene una API bien definida
que noes dada a nosotros en una sola librería,
y  así reemplazarla un cuestión de cambiar una sola cosa en un lugar.
Si tienes que cambiar varias partes de tu código para poder probar algo,
el código está diciendote que necesitas consolidar esas partes en un componente.
</blockquote>

<div class="break-antes"></div>
## Ejercicios {: #archivo-respaldo-exercises}

### Posibilidades de colisión {: .exercise}

Si los hashes fueran solo  de 2 bits,
entonces las chances de colisión con cadda archivo sucesivo
asumiendo que no ha habido colisión previa, son:

| número de archivos | chances de colisión |
| --------------- | ----------------- |
| 1               | 0%                |
| 2               | 25%               |
| 3               | 50%               |
| 4               | 75%               |
| 5               | 100%              |

Un colega tuyo dice que Si creamos el has hash de cuatro archivos,
hay solo un 75% chance de cualquier colisión .
¿Cuales son las posibilidades reales?

### Transmisión E/S {: .exercise}

Escribe un programita usando `fs.createReadStream` y `fs.createWriteStream`
que copie un archivo parte por parte
en lugar de  leerlo en memoria y luego escribirlo todo de nuevo.

### Respaldos secuenciales {: .exercise}

Modifica  programa de respaldo para que los manifiestos sean numerados secuencialmente
como `00000001.csv`, `00000002.csv`, y así
en lugar de marcarlos con hora y fecha.
¿Por qué esto no  resuelve la condición de carrera hora de revisión/hora de uso mencionada antes?

### Manifiestos JSON  {: .exercise}

1.  Modifica `backup.js` para que pueda guardarl los  manifiestos  JSON también como manifiestos en CSV 
    en base an una opción en la línea de comandos .

2.  Escribe otro programa llamado `migrate.js` que convierta un set de manifiestos
    desde CSV to JSON.
    (El nombre del programa viene del término [% g data_migration %]migración de datos [% /g %].)

3.  Modifica el programa `backup.js`  para que cada manifiesto guarde el nombre de usuario de quien lo creó
    junto con  los hashes del archivo ,
    y luego modifica `migrate.js` para transformar archivos viejos al nuevo formato.

### Simular hashes {: .exercise}

1.  Modifica el  programa de respaldo para que use una función llamada `ourHash` para crear el hash del archivo.

2.  Crea un reemplazo que retorne algún valor predecible , como los primeros caracteres de los datos.

3.  Re-escribe las pruebas para usar esta función.

¿Cómo modificaste el programa principal para que las pruebas controlaran qué función de hashing usar?

### Comparando manifiestos {: .exercise}

Escribe un programa `compare-manifiestos.js` que lea dos  archivos de manifiesto  y reporte:

-   cuales archivos tienen el mismo nombre pero diferentes hashes
    (i.e., su contenido ha cambiado).

-   cuales archivos tienen los mismos hashes pero diferentes nombres
    (i.e., han sido renombrados).

-   cuales archivos están en el primer hash pero ni sus nombres ni sus hashes están en el segundo
    (i.e., fueron borrados).

-   cuales archivos están en el segundo hash pero ni sus nombres ni sus  hashes están en el primero
    (i.e., fueron agregados).

### Desde un estado to another {: .exercise}

1.  Escribir un programa llamado `from-to.js` que tome el nombre de un directorio
    y el nombre  de un archivo de  manifiesto
    como argumentos en su línea de comandos ,
    y entonces agregue, remueva, y/o renombre archivos en el directorio
    para restaurar el estado descrito en el manifiesto.
    El programa solo debe realizar operaciones archivo cuando se necesite,
    e.g.,
    no debierar borrar un archivo y re-agregarlo si el contenido no cambió.

2.  Escribir algunas pruebas para `desde-to.js` con  Mocha y `mock-fs`.

### Historia de archivo {: .exercise}

1.  Escribir un programa llamado `archivo-history.js`
    que use el nombre de un archivo desde la línea de comandos 
    y muestre su historia
    rastreando en el tiempo mediante los  manifiestos disponibles.

2.  Escribir pruebas para tu programa usando Mocha y `mock-fs`.

### Hooks para Pre-commit  {: .exercise}

Modifica `backup.js` para cargar y ejecutar una función llamada `preCommit` desde un archivo llamado `pre-commit.js`
almacedano en el directorio root de los archivos a ser respaldados.
Si `preCommit` retorna `true`, el respaldo procede;
Si retorna `false` o lanza una excepción,
el respaldo no se crea.
