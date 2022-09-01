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
-   ejecutar las pruebas;
-   capturar los resultados; y
-   reportar cada resultado y un resumen de esos resultados.

Nuestro diseño está inspirado en herramientas como [% i "Mocha" %][Mocha][mocha][% /i %] y [% i "Jest" %][Jest][jest][% /i %],
los que a su vez están inspirados por herramientas hechas para otros lenguajes 
desde los 1980s [% b Meszaros2007 Tudose2020 %].

## ¿Cómo debemos estructurar las pruebas unitarias? {: #unit-test-structure}

Como en los otros frameworks de Pruebas Unitarias,
cada prueba será una función de cero argumentos
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

> ### Independencia
>
> Ya que estamos agregando pruebas a un arreglo,
> serán ejecutados en el orden que son registrados,
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
    A colocar aserciones dentro del código para revisar que se comporta correctamente
    se le llama [% g defensive_programming %]programación defensiva[% /g %];
    es una buena práctica,
    pero debemos asegurarnos que esas aserciones  fallen cuando deban hacerlo,
    igual que revisamos nuestros detectores de incendio de vez en cuando.

## ¿Cómo debemos estructurar el registro de pruebas? {: #unit-test-registration}

La siguiente versión de nuestra herramienta de pruebas resuelve los primeros dos problemas en el original
colocando la maquinaria de pruebas en una clase.
Usa el [% g design_pattern %]patrón de diseño[% /g %] [% i "Singleton patrón" "design patrón!Singleton" %][% g singleton_pattern %]Singleton[% /g %][% /i %] 
para asegurar que solo un objeto de esa clase sea creado a la vez[% b Osmani2017 %].
Los Singletons son una forma de gestionar variables globales que están relacionadas
como las que usamos para registrar las pruebas y sus resultados.
Como beneficio extra,
si decidimos luego que necesitamos varias copias de esas variables,
solo necesitamos crear más instancias de esa clase.

El archivo `hope.js` define la clase y exporta una instancia de ella:

[% excerpt file="hope.js" keep="report" %]

Esta estrategia asume dos cosas:

1.  [Node][nodejs] ejecuta el código en un módulo JavaScript en cuanto lo carga,
    lo que implica que corre `new Hope()` y exporta el objeto recién creado.

1.  Los módulos se guardan en el [% i "cache!modules" "require!caching modules" %][% g caching %]cache[% /g %][% /i %] en Node
    para que un módulo dado solo cargue una vez
    sin importar cuántas veces se importa.
    Esto asegura que `new Hope()` en verdad se llama una sola vez.

Una vez que un programa ha importado `hope`,
puede llamar a `Hope.test` para registrar una prueba para una ejecución posterior
y `Hope.run` para ejecutar todas las pruebas registradas hasta ese punto 
[% figure slug="unit-test-hope-structure" img="figures/hope-structure.svg" alt="Recording y running tests" caption="Creando un singleton, grabando pruebas, y corriéndolas." %]

Finalmente,
nuestra clase `Hope` puede reportar resultados como un resumen terso de  una-linea  y como un listado detallado.
Puede además proveer los títulos y resultados de pruebas individuales
por si alguien quiere formatearlas en una manera diferente (e.g., como HTML) puedan hacerlo:

[% excerpt file="hope.js" keep="report" %]

> ### ¿Quién está llamando?
>
> `Hope.test` usa el módulo [% i "caller module" %][`caller`][caller][% /i %] 
>  para recibir el nombre de la función que está registrando una prueba.
> Reportar el nombre de la prueba ayuda al usuario a entender por donde iniciar depurando;
> recibirlo vía introspección
> en lugar de pedir al usuario pasar el nombre de la función como texto
> reduciendo la escritura
> y garantizando que el reporte sea exacto.
> Los programadores a menudo copiarán, pegarán y modificarán pruebas;
> antes o después (quizá antes), olvidarán modificar
> el nombre de la función copiada y pegada que se pasa a `Hope.test`
> y perderán tiempo intentando entender por qué `test_this` está fallando
> cuando la falla de hecho está en `test_that`.

## ¿Cómo podemos crear una interfaz de línea de comandos para pruebas? {: #unit-test-cli}

La mayoría de los programadores no gozan escribiendo pruebas,
así que si queremos que lo hagan,
tiene que ser lo menos doloroso posible.
Un par de sentencias `import` para tener  `assert` y `hope`
y luego una llamada a función por prueba
es lo más simple que podemos hacer las pruebas mismas:

[% excerpt file="test-add.js" %]

Pero eso solo define las pruebas ---¿Cómo las encontraremos para ejecutarlas?
Una opción es pedirle a la gente que use `import` en cada uno de los archivos con pruebas
dentro de otro archivo:

```js
// all-the-tests.js

import './test-add.js'
import './test-sub.js'
import './test-mul.js'
import './test-div.js'

Hope.run()
...
```

Aquí,
`all-the-tests.js` importa otros archivos para que registren las pruebas
como un [% i "side effect!for module registration" %][% g side_effect %]efecto colateral[% /g %][% /i %] vía las llamadas a `hope.test`
y luego llame a `Hope.run` para ejecutarlas.
Funciona,
pero antes o después (quizá antes) alguien olvidará importar uno de los archivos de pruebas.
{: .continue}

Una mejor estrategia es cargar los archivos de prueba [% i "dynamic loading" %][% g dynamic_loading %]dinámicamente[% /g %][% /i %].
Mientras que  `import` se escribe usualmente como una  declaración,
también puede usarse como una función `async` 
que tome una ruta como parámetro y cargue el archivo correspondiente.
Igual que antes,
cargar archivos ejecuta el código que contienen
lo que registra las pruebas como efecto secundario:

[% excerpt file="pray.js" omit="options" %]

Por defecto,
este programa encuentra todos los archivos anidados en el directorio actual
cuyos nombres coinciden con el patrón `test-*.js`
y usa una salida tersa.
Ya que podemos querer revisar los archivos en otra ubicación,
o pedir un resultado detallado,
el programa necesita manejar argumentos desde la línea de comandos.

El módulo [`minimist`][minimist] hace esto
de una manera que es consistente con las convenciones en Unix.
Dados los argumentos desde la línea de comandos  *después*  del nombre del programa 
(i.e., desde `process.argv[2]` en adelante),
parece que patrones como `-x something`
y crea un objeto con opciones como claves y valores asociados a ellas.

> ### Nombres  de archivos en `minimist`
>
> Si usamos una línea de comandos como `pray.js -v something.js`,
> entonces `something.js` se convierte en el valor de`-v`.
> Para indicar que queremos agregar `something.js` a la lista de nombres de archivo restantes
> asociados con la clave especial `_` (un solo guión bajo),
> tenemos que escribir `pray.js -v -- something.js`.
> el doble guión es una convención común en Unix  para señalar el fin de los parámetros.

Nuestro [% i "test runner" "unit test!test runner" %][% g test_runner %] ejecutor de pruebas[% /g %][% /i %] ahora está completo,
así que podemos probarlo con algunos archivos con pruebas que pasen, fallen, y contengan errores:

[% excerpt pat="pray.*" fill="sh out" %]

> ### El Infinito está permitido
>
> `test-div.js` contiene la linea:
>
> ```js
> hope.test('Quotient of 1 y 0', () => assert((1 / 0) === 0))
> ```
>
> Esta prueba cuenta como una falla en lugar de un error
> porque cree que el resultado de dividir entre cero es el valor especial  `Infinity`
> en lugar de un error aritmético.

Cargar módulos dinámicamente para que puedan registrar algo por nosotros para llamar más tarde 
es un patrón común en muchos lenguajes de programación.
El flujo de control va y viene entre el framework y el módulo siendo cargado
conforme esto ocurre
así que necesitamos especificar el [% i "lifecycle!of unit test" "unit test!lifecycle" %][% g lifecycle %]ciclo vital[% /g %][% /i %] de los módulos cargados con mucho cuidado.
[% f unit-test-lifecycle %] ilustra lo que pasa
cuando un par de archivos `test-add.js` y `test-sub.js` son cargados por nuestro framework:

1.  `pray` carga `hope.js`.
2.  cargando `hope.js` crea una sola instancia de la clase `Hope`.
3.  `pray` usa `glob` para encontrar archivos con pruebas.
4.  `pray` carga `test-add.js` usando `import` como función.
5.  Cuando `test-add.js` corre, carga  `hope.js`.
    Ya que `hope.js` se ha cargado, esto no crea una nueva instancia de `Hope`.
6.  `test-add.js` usa `hope.test` para registrar una prueba (la cual aún no se ejecuta).
7.  `pray` entonces carga `test-sub.js`…
8.   … el cual  carga `Hope`…
9.   … y luego  registra una prueba.
10.  `pray` puede pedir a la instancia única de  `Hope` que ejecute todas las pruebas,
     luego recibe un reporte desde el singleton de `Hope`  y lo muestra.

[% figure slug="unit-test-lifecycle" img="figures/lifecycle.svg" alt="Pruebas Unitarias lifecycle" caption="Ciclo vital de pruebas unitarias descubiertas dinámicamente." %]

<div class="break-antes"></div>
## Ejercicios {: #unit-test-exercises}

### Englobado Asíncrono  {: .exercise}

Modificar `pray.js` para usar la versión asíncrona de `glob` en lugar de `glob.sync`.

### Cronometrando las pruebas {: .exercise}

Instalar el paquete  [`microtime`][microtime] y luego modificar el ejemplo `dry-run.js` 
para que registre y reporte el tiempo de ejecución de las pruebas.

### Aproximadamente igual {: .exercise}

1.  Escribir una función `assertApproxEqual` que no haga algo si dos valores están dentro de cierta tolerancia entre sí
    pero arroja una excepción en caso contrario:


        // throws exception
        assertApproxEqual(1.0, 2.0, 0.01, 'Values are too far apart')

        // does not throw
        assertApproxEqual(1.0, 2.0, 10.0, 'Large margin of error')

2.  Modificar la función para usar una tolerancia por defecto si ninguna se especifica:

        // throws excepción
        assertApproxEqual(1.0, 2.0, 'Values are too far apart')

        // does not throw
        assertApproxEqual(1.0, 2.0, 'Large margin of error', 10.0)

3.  Modificar la función  de nuevo para que revise el [% g relative_error %]error relativo[% /g %]
    en lugar del [% g absolute_error %]error absoluto[% /g %].
    (el error relativo es el valor absoluto  de la diferencia entre el valor actual y el esperado,
    dividido entre el valor absoluto.)

### Cubierta rectangular {: .exercise}

Una aplicación de ventanas representa rectángulos usando objetos con cuatro valores:
`x` e `y` son las coordenadas de la esquina inferior izquierda,
mientras que `w` y `h` son el ancho y la  altura.
Todos los valores son positivos:
la esquina inferior izquierda de la pantalla está en  `(0, 0)`
y el tamaño de la misma es  `WIDTH`x`HEIGHT`.

1.  Escribir pruebas para verificar si un si un objeto representa un rectángulo válido.

2.  La función `overlay(a, b)` toma dos rectángulos y retorna o
    un nuevo rectángulo representando la región donde se superponen, o `null` si no se  superponen.
    Escribir pruebas para verificar que `overlay` funcione correctamente.

3.  ¿Tus  pruebas asumen que dos rectángulos se tocan en el límite de una superposición, o no?
    ¿ Qué ocurren si dos rectángulos solo coinciden un una sola esquina?

### Seleccionando pruebas {: .exercise}

Modificar `pray.js`  para que si el usuario provee `-s patrón` o `--select patrón`,
entonces el programa solo ejecuten pruebas en archivos con la cadena `patrón` en el nombre.

### Etiquetando pruebas {: .exercise}

Modificar `hope.js`  para que usuarios puedan proveer opcionalmente un arreglo de cadenas para etiquetar tests:

```js
hope.test('Difference of 1 and 2',
          () => assert((1 - 2) === -1),
          ['math', 'fast'])
```

Luego, modificar `pray.js` para que que si usuarios especifican  `-t tagName` o `--tag tagName`,
solo las pruebas con esa etiqueta se ejecuten.

### Maquetar objetos {: .exercise}

Un objeto maqueta es un reemplazo simplificado  de una parte de un programa
cuyo comportamiento es más fácil de controlar y predecir que aquello que está reemplazando.
Por ejemplo,
podemos querer probar que nuestro programa haga  lo correcto   si ocurre un error mientras lee un archivo.
Para esto,
escribimos una función alrededor de  `fs.readFileSync`:

```js
const mockReadFileSync = (filename, encoding = 'utf-8') => {Tagging
  return fs.readFileSync(filename, encoding)
}
```

y luego la modificamos para que arroje una excepción bajo nuestro control.
Por ejemplo,
si definimos `MOCK_READ_FILE_CONTROL` así:
{: .continue}

```js
const MOCK_READ_FILE_CONTROL = [false, false, true, false, true]
```

entonces la tercera y quinta llamada a `mockReadFileSync` arrojan una excepción en vez de leer datos,
igual que toda llamada luego de la quinta.
Escribir esta función.
{: .continue}

### Configuración y teardown {: .exercise}

Los frameworks de pruebas a menudo permiten a los programadores especificar una función `setup` 
que se ejecuta antes de cada prueba
y una función `teardown` 
que se ejecuta después de cada prueba.
(`setup` usualmente re-crea fixtures de prueba complicadas,
mientras que las funciones `teardown` a veces son necesarias para limpiar tras ejecutar pruebas,
e.g., para cerrar conexiones a la base de datos, o borrar archivos temporales.)

Modificar el framework de pruebas en este capítulo para que si un 
archivo de pruebas contiene algo como esto:

```js
const createFixtures = () => {
  ...do something...
}

hope.setup(createFixtures)
```

entonces la función `createFixtures` sea llamada
exactamente una vez antes de cada prueba en ese archivo.
Agregar una forma similar para registrar una función teardown con `hope.teardown`.
{: .continue}

### Pruebas Múltiples {: .exercise .break-antes}

Agregar un método `hope.multiTest` que permita a los usuarios especificar
múltiple casos de prueba para una función a la vez.
Por ejemplo, esto:

```js
hope.multiTest('check all of these`, functionToTest, [
  [['arg1a', 'arg1b'], 'result1'],
  [['arg2a', 'arg2b'], 'result2'],
  [['arg3a', 'arg3b'], 'result3']
])
```

debe ser equivalente a esto:
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

### Aserciones para sets y maps {: .exercise}

1.  Escribir funciones `assertSetEqual` y `assertMapEqual`
    que revisen si dos instancias de `Set` o dos instancias de `Map` son iguales.

2.  Escribir una función `assertArraySame`
    que verifique si dos arreglos tienen los mismos elementos,
    aún si esos están en diferente orden.

### Probando promesas {: .exercise}

Modificar el framework de pruebas unitarias  para manejar  funciones `async`,
para  que:

```js
hope.test('delayed test', async () => {...})
```

haga lo correcto.
(Nótese que pueden usar `typeof` para determinar si un objeto dado a `hope.test`
es una función o una promesa.)
{: .continue}