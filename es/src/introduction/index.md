---
title: "Introducción"
---

La mejor manera de aprender diseño es estudiar ejemplos [%b Schon1984 Petre2016 %],
y algunos de los mejores ejemplos del diseño de software vienen de las 
herramientas que los programadores usan en su propio trabajo.
En estas lecciones construimos pequeñas versiones de cosas como sistemas de
respaldo de archivos, frameworks de prueba, buscadores de expresiones regulares,
y motores de diseño de navegador tanto para desmitificarlos
y dar algunas algunas ideas de cómo piensan algunos programadores experimentados.
Tomamos inspiración de [%b Brown2011 Brown2012 Brown2016 %],
[Mary Rose Cook's][cook_mary_rose] [Gitlet][gitlet],
y de los libros que introdujeron la filosofía Unix a una  generación entera de programadores
[%b Kernighan1979 Kernighan1981 Kernighan1983 Kernighan1988 %].

Todo el material escrito en este proyecto puede re-usarse libremente
bajo los términos de la [Atribución de licencia no comercial Creative Commons][cc_by_nc],
en tanto que todo el software está disponible bajo los términos de
la [Licencia Hipocrática][hippocratic_license].
Todas las ganancias de este proyecto irán en apoyo de [Red Door Family Shelter][red_door].

## ¿Quién es nuestra audiencia? {: #Introduction-audience}

Cada lección  debe  ser escrita con una audiencia específica en mente.
Estas tres [personas][t3_personas] describen a la nuestra:

-   Aïsha empezó escribiendo  macros de VB para Excel en un curso de contabilidad y jamás miró atrás.
    Tras pasar tres años trabajando en front-end con JavaScript,
    ahora quiere aprender cómo hacer aplicaciones back-end.
    Este material llenará algunos vacíos en su  conocimiento de programación
    y le enseñará algunos    patrones de diseño comunes.

-   Rupinder está estudiando ciencias computacionales en la universidad.
    Ha aprendido mucho sobre la teoría de algoritmos,
    y aunque usa Git y de pruebas unitarias  en sus tareas,
    el no siente que comprende cómo funcionan.
    Este material   dará una mejor comprensión de aquellas herramientas
    y de cómo diseñar nuevas.

-   Yim vive de hacer apps móviles pero 
    además enseña dos cursos universitarios:
    une sobre desarrollo web full-stack  con JavaScript y Node
    y otro llamado "Diseño de Software".
    Están contentos con el primero,
    pero frustrado que tantos libros sobre el segundo tema lo aborden en 
    abstracción y usen ejemplos que sus estudiantes no pueden relacionar.
    Este material llenará esos huecos
    y les dará puntos de inicio para una amplia variedad de tareas en el curso.

Igual que estas tres personas, los lectores debieran poder:

-   Escribir  programas de JavaScript usando ciclos, arreglos, funciones, y clases.

-   Crear páginas web estáticas con HTML y CSS.

-   Instalar Node en su computadora
    y llamar programas desde la línea de comandos .

-   Usar [Git][git] para guardar y compartir archivos.
    (Está bien si no conocen [los comandos más oscuros de git][git_man_page_generator].)

-   Explicar qué es un árbol y cómo procesar uno recursivamente.
    (Esta es la estructura de datos y algoritmo más complicados que *no* explicamos.)

Este libro puede leerse solo o usarse como recurso  en el salón de clases.
Si buscan un proyecto para hacer en un curso de diseño de software,
agregar una herramienta de las que se cubren aquí sería tanto divertido como educativo.
Por favor vean [%x conclusion %] para más detalles.

## ¿Qué herramientas e ideas cubrimos? {: #Introduction-contents}

Los programadores han inventado [un montón de herramientas][programming_tools] para facilitarse la vida.
Este volumen se concentra en unas cuantas que los desarrolladores usan mientras escriben software;
esperamos que  volúmenes futuros exploren aquellas usadas en aplicaciones que los programadores construyen.

[%x glossary %] defines los términos que presentamos en estas lecciones,
las cuales a su vez  definen su ámbito:

-   cómo procesar un programa como cualquier otra pieza de texto.

-   cómo convertir un programa en una  estructura de datos que pueda analizarse y modificarse.

-   qué son los patrones  de diseño y cuales se usan más seguido.

-   cómo se ejecutan los programas  y cómo podemos controlar e inspeccionar su ejecución.

-   cómo podemos analizar el desempeño de los programas para poder  hacer compensaciones sensibles al diseño.

-   cómo encontrar y ejecutar módulos de código sobre la marcha.

<div class="pagebreak"></div>

## ¿Cómo se distribuyen estas lecciones? {: #Introduction-layout}

Mostramos código fuente en JavaScript de este modo:

[% inc file="example.js" %]

Los comandos en una consola de Unix se muestran así:
{: .continue}

[% inc file="example.sh" %]

y datos y resultados así:
{: .continue}

[% inc file="example.out" %]

Ocasionalmente envolvemos lineas en código fuente de forma no convencional para que
los listados se ajusten a la página impresa,
y a veces usamos `...` para  mostrar donde se han omitido líneas.
Donde necesitamos interrumpir líneas de resultados por la misma razón,
terminamos todas menos la última línea con una sola diagonal inversa `\`.
Todos los listados están disponibles en [nuestro repositorio Git][book_repo]
y [en nuestro sitio web][stjs].

Finalmente,escribimos funciones como `functionName` en lugar de `functionName()`;
la última forma es más común,
pero la gente no usa `objectName{}` para objetos o `arrayName[]` para arreglos,
y los paréntesis abiertos complica convencer
si estamos hablando de "la función misma", o "una llamada a la función sin parámetros".

## ¿Cómo llegamos aquí? {: #Introduction-history}

A principios de los años 2000,
la [%i "University of Toronto" %]Universidad de Toronto[%/i%] le pidió a [%i "Wilson, Greg" %][Greg Wilson][wilson_greg][%/i%]
que enseñara un  curso de pre-grado sobre arquitectura de software.
Tras enseñar el curso tres veces, Greg dijo a la universidad que deberían cancelarlo:
entre ellos, la docena de libros de texto que había comprado con la frase "arquitectura software" en sus títulos
dedicaba menos de 30 páginas a describir los diseños de sistemas reales.

<div class="pagebreak"></div>

Frustrado por aquello,
él y [%i "Oram, Andy" %][Andy Oram][oram_andy][%/i%] persuadieron algunos programadores connotados a 
que contribuyeran con un capítulo a una colección llamada *Beautiful Code* [%b Oram2007 %],
la cual logro ser premiada con el Jolt Award en 2007.
Los capítulos en ese libro describían todo, desde determinar si tres puntos están sobre una linea,
hasta componentes clave de Linux
y el software para el Mars Rover,
pero esta amplitud que los hacía amenos de leer
también implicaba  que no eran particularmente útiles para enseñar.

Para corregir eso,Greg Wilson, [%i "Brown, Amy" %][Amy Brown][brown_amy][%/i%],
[%i "Armstrong, Tavish" %][Tavish Armstrong][armstrong_tavish][%/i%],
y [%i "DiBernardo, Mike" %][Mike DiBernardo][dibernardo_mike][%/i%]
editaron una serie de cuatro libros entre 2011 y 2016 llamada *[The architecture of open source applications][aosa]*.
y en los primeros dos volúmenes,
los creadores de cincuenta proyectos de  código abierto  describieron los diseños de sus sistemas;
el tercer libro exploró el rendimiento de aquellos sistemas,
mientras en el cuarto volumen  los contribuyentes construyeron modelos a escala de herramientas comunes 
como una manera de demostrar cómo aquellas herramientas funcionaban.
Estos libros se acercaban a lo que un instructor necesitaría para una clase de pre-grado sobre diseño de software,
pero aún le faltaba algo:
la  audiencia objetivo quizá no estaría familiarizada con muchos de los dominios de problema,
y ya que cada autor usó su lenguaje de programación preferido,
mucho del código sería difícil de entender.

*Herramientas de software  en JavaScript* pretende resolver estas limitaciones:
Todo el código está escrito en un lenguaje,
y los ejemplos son todas herramientas que los programadores usan a diario.
La mayoría de los programas tienen menos de 60 lineas, y más largo tiene menos de 200;
pensamos que cada capítulo puede cubrirse en una clase de 1-2 horas,
mientras los ejercicios varían en dificultad  desde unos minutos hasta un par de días.

## ¿Cómo puede la gente usar y contribuir a este material? {: #Introduction-use}

Todo el  material descrito en este sitio está disponible bajo licencia Creative
Commons - Attribution - NonCommercial 4.0 International (CC-BY-NC-4.0),
mientras que el software está disponible bajo la licencia Hipocrática. El primero
les permite usar y mezclar este material para usos no comerciales, como-está, o
en forma adaptada, en tanto ustedes citen su fuente original; el segundo les permite
usar y mezclar el software de este sitio mientras que no violen
los acuerdos internacionales que gobiernan los derechos humanos. Favor de ver [%x license %]
para más detalles.

Si quisieran mejorar lo que tenemos o agregar nuevo material, por favor ver el
Código de Conducta en [%x conduct %] y las guías de contribución en
[%x contributing %].  Si tienen preguntas o quisiera usar este material en
un curso, favor de llenar un issue en [nuestro repositorio GitHub][book_repo] o envíennos un email.

## ¿Quienes nos ayudaron? {: #Introduction-help}

Estoy agradecido con los creadores de [diagrams.net][diagrams_net],
[Emacs][emacs],
[ESLint][eslint],
[Glosario][glosario],
[GNU Make][gnu_make],
[LaTeX][latex],
[Node][nodejs],
[NPM][npm],
[Standard JS][standard_js],
[SVG Screenshot][svg_screenshot],
[WAVE][webaim_wave],
y todas las otras herramientas  de código abierto usadas en crear estas lecciones:
si todos damos un poquito,
todos recibimos mucho.
También quisiera agradecer a Darren McElligott, Evan Schultz, y Juanan Pereira
por su retro-alimentación;
cualquier otro error, omisión, o malentendido que quedase, son mi entera responsabilidad.
