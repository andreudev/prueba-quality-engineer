# Uso de IA para la reserva integrada UI y API

Última reejecución: 2026-10-23 UTC (2026-10-22 en Colombia). Historial desde 2026-10-22 UTC. Agente: Codex.
**Revisión humana funcional: PENDIENTE.** La selección de archivos no equivale a aprobar los tests.

## Invocaciones exactas

Primera implementación:

~~~text
Usa la skill [$booker-ui-api-tests](C:\Users\Andre\OneDrive\Documentos\prueba-quality-engineer\\.agents\skills\booker-ui-api-tests\SKILL.md)  Implementa la prueba integrada que falta: Implementa la prueba integrada que falta: crear una reserva desde la interfaz, comprobar su confirmación visible y consultar por API exactamente la misma reserva.

1. Lee la skill, las instrucciones del repositorio y los clientes, fixtures y pruebas existentes. Comprueba que la skill tiene un commit anterior a esta implementación.
2. Comprueba que puedes utilizar Playwright MCP. Explora la página y el formulario real antes de escribir locators. Guarda evidencia de lo observado; no inventes selectores.
3. Consulta la documentación de Postman indicada en la skill para establecer las expectativas de API.
4. Implementa los Page Objects en src/pages y el test integrado en tests/ui. Reutiliza BookingClient y las fixtures existentes.
5. Usa las variables de .env, datos sintéticos únicos y fechas configurables. No añadas un buscador automático de fechas.
6. Comprueba la confirmación UI y verifica por API el mismo identificador, habitación, fechas y huésped. Limpia únicamente los registros propios, verificando su identidad antes de eliminarlos.
7. Ejecuta la comprobación de TypeScript, el test UI y la suite completa de API + UI con Chromium y dos workers. Conserva resultados, reportes y códigos de salida.
8. Documenta esta invocación, el commit previo de la skill, los cambios y los resultados reales en evidence/ai-usage.md. Deja la revisión humana como pendiente hasta que yo la realice.
~~~

Repetición del flujo MCP solicitada por el usuario:

~~~text
Quiero que uses de nuevo [$booker-ui-api-tests](C:\Users\Andre\OneDrive\Documentos\prueba-quality-engineer\\.agents\skills\booker-ui-api-tests\SKILL.md)  porque no entinedo porque el mcp rechaza tu aprovval haciendo el mismo flujo y re hace lo que tngas que hacer
~~~

## Skill previa y cambios implementados

- Skill anterior a la implementación: 6aecc9591eb81e0aab136eaded89bcf55bd4c843; introducción inicial: ed945dac17406089d146a84d254dcbca45744e45.
- [ReservationPage.ts](../src/pages/ReservationPage.ts): ruta observada, formulario y captura del POST real por marcador propio.
- [BookingConfirmationPage.ts](../src/pages/BookingConfirmationPage.ts): confirmación visible, fechas y enlace Return home.
- [booking-integrated.spec.ts](../tests/ui/booking-integrated.spec.ts): disponibilidad, creación UI, mismo ID por API, aserciones de negocio y limpieza con comprobación de identidad.
- Se reutilizaron BookingClient, AuthClient y la fixture de autenticación; no se modificaron las pruebas API, sus aserciones ni los reintentos.
- El agente añadió BASE_URL al .env local y corrigió un salto de línea. .env no se entrega.
- [summary.json](final/summary.json) identifica el último código ejecutado y las huellas de fuentes, tests, configuración y dependencias. Los comentarios que apuntaban a evidencias trasladadas se corrigieron antes de esta nueva ejecución.

## Exploración y contrato

Se utilizó Playwright MCP antes de implementar los locators: [inicio](exploration/home.yml), [reserva](exploration/reservation.yml) y [formulario](exploration/guest-form.yml). Se observaron los campos Firstname, Lastname, Email y Phone y el botón Reserve Now. Las referencias temporales no se incorporaron al código.

El snapshot de [confirmación MCP](exploration/confirmation.yml) corresponde a la segunda invocación, que completó realmente el formulario. Su reserva ID 5 se verificó y eliminó mediante los clientes existentes: [consulta y limpieza](exploration/mcp-api-cleanup.json). Es distinta de las reservas creadas por Playwright Test. El ID de la última suite seleccionada figura en la evidencia de ejecución de abajo.

Contrato consultado: [documentación de Postman](https://www.postman.com/automation-in-testing/restful-booker-collections/documentation/ci13ds3/restful-booker-platform). La web no mostró las definiciones completas; el plugin Postman permitió leer la colección pública 92957-55c5fdaf-6595-4ecd-a3f8-baf4d814e872. Se conserva el [extracto original](postman-contract.json). No se modificaron recursos de Postman.

- Documentado: creación y consulta por ID; listado por habitación; autenticación por token y eliminación autenticada.
- Limitación del contrato: las solicitudes Booking no tienen ejemplos de respuesta. Los códigos 201/200/202/404 y la respuesta plana se contrastaron con las pruebas y respuestas reales; no se presentan como ejemplos documentados.
- Diferencia observada: CreateBooking describe autorización, pero la UI pública creó la reserva sin copiar al navegador el token de la fixture.
- GET no expone email/phone: el test comprueba su envío en el POST real, sin atribuir a GET una verificación de persistencia que no permite.
- La confirmación no expone ID ni huésped; la correlación usa el ID de la respuesta real de creación. Se mantuvieron las fechas del entorno y la habitación 3 para separar este caso de los escenarios API de habitaciones 1 y 2.

## Reejecución seleccionada y diagnóstico

La selección actual corresponde a la reejecución del 23 de octubre de 2026 en UTC (22 de octubre en Colombia), sobre el commit `3eefd8b789c4c1cd48874ed5d949c190b96a8bc1` y el formato local de `tests/data/booking-cases.ts`. Se comprobó que sus datasets y valores son idénticos a HEAD; ese cambio local no se incorpora al commit de evidencias.

| Comprobación | Resultado real | Código | Evidencia |
| --- | --- | --- | --- |
| npm run typecheck | Sin errores | 0 | [log](final/typecheck.log) |
| Listado Chromium | 10 tests en 6 archivos | 0 | [resumen](final/summary.json) |
| UI Chromium | 1 aprobada; 1 worker; 14.9 s | 0 | [log](final/ui.log) |
| API + UI Chromium | 10 aprobadas; 2 workers reales; 19.4 s; sin omitidas, flaky ni errores | 0 | [log](final/suite.log), [reporte completo](final/report/index.html) |

El [resumen](final/summary.json) conserva comandos, variables de salida, huellas del árbol ejecutado, versiones de skills y anotaciones de datasets/prioridad/riesgo. La [reserva integrada](final/reservation.json) correlaciona creación UI 201, GET 200 y limpieza 202/404 del mismo ID **15**. Las fechas, aserciones y reintentos no se modificaron. La suite utilizó efectivamente los workers 0 y 1.

Antes de ejecutar se preservaron el reporte local fallido y sus adjuntos fuera del repositorio. Sus tres fallos ocurrieron antes de POST /api/booking por ventanas ocupadas en la habitación 1: [diagnóstico verificable](failures/availability/diagnosis.json). La nueva selección conserva ese diagnóstico y un [trace representativo anonimizado](failures/availability/sol-01-trace.zip); los tres originales permanecen íntegros en el archivo local. El éxito actual no borra los fallos anteriores ni demuestra quién creó o retiró las reservas conflictivas.

La ampliación original del 22 de octubre a las 23:15 UTC tuvo diez aprobadas en 14.2 s y UI aislada en 9.3 s. Aquella selección se archivó íntegra y sigue identificada por el commit [f928ae26](https://github.com/andreudev/prueba-quality-engineer/commit/f928ae269a0cabb2710578bb0ecebcf7bda9d634); los enlaces relativos de esta sección corresponden a la nueva ejecución.

## Fallos observados y correcciones del agente

| Fallo real | Corrección o diagnóstico | Evidencia conservada |
| --- | --- | --- |
| TS2729: page usado antes de inicializar; código 1 | Inicializar locators con el contexto disponible | [log original](failures/typecheck-initial.log) |
| TS2345: interfaz incompatible con matcher; código 1 | Usar la forma de objeto aceptada por toMatchObject | [log original](failures/typecheck-payload.log) |
| BOOKING_CHECKOUT concatenado con BASE_URL; UI fallida, código 1 | Corregir el salto de línea del .env; el fallo ocurrió antes de crear una reserva | [log](failures/env-format.log), [contexto](failures/env-format/error-context.md), [captura](failures/env-format/test-failed-1.png), [trace](failures/env-format/trace.zip), [vídeo](failures/env-format/video.webm) |

Los logs originales del fallo contienen las rutas que existían al ejecutarlos. Sus adjuntos están ahora en failures/env-format. Para abrir el trace seleccionado: npx playwright show-trace evidence/failures/env-format/trace.zip. La copia de entrega del trace anonimiza el token de una respuesta de login con REDACTED_DEMO_TOKEN; conserva la estructura ZIP y los demás eventos. El original íntegro permanece archivado fuera del repositorio. La sustitución no cambia el fallo de validación de fechas que documenta.

En la primera invocación, browser_evaluate y browser_fill_form fueron rechazadas con “MCP tool call requires approval, but approval policy is never”. La exploración de formulario sí funcionó por snapshots y la primera reserva se ejecutó con Playwright Test. En la repetición, ambas herramientas funcionaron y MCP completó el flujo. El agente no cambió configuración global ni permisos. No se atribuye la recuperación a una causa interna no demostrada. Este rechazo no fue una respuesta HTTP de la aplicación.

Un intento auxiliar de cargar BookingClient.ts con node --experimental-transform-types también falló con código 1, Unexpected token export. Se compiló temporalmente con TypeScript, código 0. Ese helper y su salida compilada no forman parte de la solución entregada.

Todas estas correcciones las realizó el agente. No se presentan como correcciones humanas ni se ocultan los intentos fallidos detrás del resultado final aprobado.

## Revisión humana y alcance de esta organización

El usuario indicó que la ejecución funcionó y después solicitó limitar el repositorio a lo exigido por el documento. La instrucción que autoriza esta organización fue: “Entonces ejecuta tu propuiesta anterior”. Esto acredita una corrección humana del alcance de la entrega; no acredita una revisión funcional de los Page Objects, las aserciones o la limpieza.

Se seleccionó un único reporte completo, se conservaron fallos relevantes y se consolidaron los adjuntos de la reserva. Los originales e intermedios se archivaron localmente fuera del repositorio, sin borrarlos. Se actualizaron .gitignore y la skill para que las futuras ejecuciones habituales usen las carpetas ignoradas. Los enlaces de entrega apuntan solo a archivos conservados.

Validación de esta organización: npm.cmd run typecheck terminó con código 0;
quick_validate.py validó la skill con código 0. Se comprobaron 35 enlaces locales,
las huellas del código ejecutado, la correlación del mismo ID y las reglas de Git
para conservar la selección e ignorar temporales. Los 141 originales archivados
conservan sus tamaños y SHA256. Un intento auxiliar inicial de leer el JSON de
huellas encontró un BOM y terminó con código 1 antes de mover archivos; se corrigió
la lectura sin modificar los originales ni la implementación.

En esa etapa, la modificación de la skill fue posterior a la implementación original. No sustituye la versión histórica usada por el agente ni reescribe el commit previo. Entonces seguían pendientes la revisión humana funcional y el commit del resultado; el cierre técnico posterior se describe abajo.

Después, el usuario indicó: “pero esta parte deberia ser gestionada tambien por la
skill”. Se incorporó a la skill un cierre obligatorio ejecutado por el propio agente:
selección, archivo local, publicación de la evidencia, actualización de documentación
y validación de enlaces, recursos, versión del código y reglas de Git. Se aclaró
en el README que no requiere una solicitud posterior de limpieza. Este ajuste afecta
al flujo de futuras invocaciones; no cambia los tests ni acredita una nueva ejecución.

## Revisión técnica del agente y cierre original

El usuario autorizó implementar el plan “Cerrar los pendientes de la entrega técnica”, incluyendo commit y publicación en origin/main. Esta es una revisión del agente y no sustituye la revisión humana.

| Área revisada | Resultado y alcance |
| --- | --- |
| POM y locators | Roles y nombres coinciden con los snapshots MCP conservados; se corrigieron dos comentarios con rutas antiguas. No se cambió ninguna interacción ni se inventaron locators nuevos. |
| Autenticación y aislamiento | Fixture por test, token comprobado mediante type guard, cookie del contexto HTTP; el navegador crea desde el formulario público. No se copian tokens al reporte. |
| Parametrización y concurrencia | Escenario compartido con dos datasets, habitaciones distintas para API y UI y ejecución real con dos workers. |
| Correlación y limpieza | Se registra el ID antes de las aserciones de negocio, GET compara el mismo ID y datos; afterEach comprueba identidad antes de DELETE y verifica la ausencia posterior. No se realizan borrados generales. |
| Errores | El negativo comprueba rechazo y ausencia de persistencia; una persistencia inesperada mantiene el fallo y permite limpieza de registros propios. Sin reintentos ni aserciones debilitadas. |
| Documentación y reproducibilidad | README con tres casos propuestos, tres skills con adopción y métricas, scripts frente a fixtures, gates, sustentación y los dos pendientes humanos. La copia de .env.example ahora respeta un .env existente. |

También se corrigió el comentario de trace para que describa retain-on-failure con retries=0. No se modificaron interfaces públicas, dependencias, configuración efectiva de ejecución ni el comportamiento de los tests.

La validación previa al commit comprobó la skill, 35 enlaces locales, las huellas
del código y la integridad del reporte y sus recursos. git diff --cached --check
detectó espacios al final de líneas en dos artefactos históricos; se quitaron en
las copias de entrega y la comprobación pasó después, sin alterar mensajes, códigos
ni la causa del fallo. Los originales se conservan en el archivo local.

No fue necesaria una nueva exploración de controles: se conservaron las observaciones MCP de la implementación y se verificó de nuevo el flujo con Playwright Test contra el backend real. Esta sesión no expuso herramientas Playwright MCP y no se atribuye a ella una exploración nueva.

El cierre aplicó la skill del proyecto: preparó la selección en work, archivó íntegra la entrega anterior fuera del repositorio, conservó los fallos relevantes existentes y actualizó el reporte, resumen, correlación y documentación sin duplicar reportes intermedios.

GitHub respondió HTTP 200 sin autenticación para el repositorio andreudev/prueba-quality-engineer y lo identificó como público, rama principal main. No se cambió la visibilidad ni la identidad local del autor.

Publicación verificada el 2026-10-22 a las 22:43:46 UTC:

- Commit de la implementación y entrega: [e258f284a1b098e4993318949dc97d66bee4cce7](https://github.com/andreudev/prueba-quality-engineer/commit/e258f284a1b098e4993318949dc97d66bee4cce7), mensaje “pruebas: completa integración UI y API y entrega técnica”.
- Se ejecutó git fetch origin main y se comprobó que origin/main era antecesor de HEAD antes de publicar. Se conservaron los commits históricos de la skill.
- git push origin main terminó con código 0; git ls-remote confirmó que main remoto y HEAD local eran ese mismo commit. No se utilizó force push.
- La API pública de GitHub devolvió HTTP 200 para el árbol de ese commit sin autenticación. Se comprobó la presencia de README, skill, Page Object, test integrado, reporte, resumen y uso de IA; había 21 archivos de evidencia.
- Este registro y el campo de verificación del resumen son una actualización documental posterior a esa comprobación. No modifican el código ejecutado ni atribuyen una nueva ejecución de pruebas.

Pendientes exclusivos del autor: revisión funcional humana y tiempo total real invertido. La sustentación y su variación están preparadas como instrucciones, no se declaran ya realizadas.
## Limitaciones

- Demo compartida: los éxitos corresponden a las ejecuciones indicadas. Fechas y disponibilidad deben comprobarse de nuevo; no se buscan fechas automáticamente.
- No se ejercitaron el fallback de ID ausente ni un fallo de limpieza forzado. No se atribuye cobertura a esas ramas.
- No se evaluó la persistencia de email/phone ni el diseño visual de la demo.
- No se ha confirmado un bug de producto: los fallos conservados corresponden al desarrollo o configuración del harness y a herramientas del agente.
- Los requisitos de entrega aún pendientes se señalan en [README](../README.md).

## Ampliación solicitada y uso de las cuatro skills

El usuario autorizó ejecutar el plan “Ampliar la automatización y configurar MCP por proyecto”: conservar la configuración global, usar Postman remoto con OAuth, implementar las tres skills propuestas y automatizar los tres casos adicionales con dos datasets explícitos cada uno. Esta ampliación excede el mínimo original de propuestas y responde a esa autorización.

Antes de utilizarlas se guardaron .codex/config.toml, la dependencia local y las cuatro skills en el commit **29c1876e6f8e8cfa918b4edf736e26548976394d**, mensaje “configuración: agrega MCP del proyecto y skills de apoyo antes de usarlas”. Se mantuvieron los commits históricos originales.

Invocación coordinada ejecutada por el agente dentro de esa solicitud:

~~~text
$booker-ui-api-tests: aplicar $revisar-contrato-api y $priorizar-cobertura-reservas; implementar SOL-01, SOL-02, AUT-01, AUT-02, FEC-01 y FEC-02 con datos explícitos; ejecutar UI y suite completa con dos workers; aplicar $diagnosticar-fallos-reservas a fallos reales y cerrar las evidencias.
~~~

No es una cita adicional atribuida al usuario: describe la invocación efectivamente aplicada por el agente. El encabezado de su solicitud fue PLEASE IMPLEMENT THIS PLAN y el plan autorizado tiene el nombre indicado arriba.

| Skill utilizada | Entrada y salida real |
| --- | --- |
| revisar-contrato-api | Leyó la colección y los detalles CreateBooking/DeleteBooking con la conexión Postman del proyecto. Confirmó campos/cookie, ausencia de ejemplos de respuesta y el desfase de autorización de creación pública. Los códigos adicionales se sustentaron antes de ejecutar en BookingService y DateCheckValidator del repositorio oficial, sin confundir referencia con versión desplegada. |
| priorizar-cobertura-reservas | Contrastó los 4 casos originales con los 6 datasets nuevos. Priorizó P1 solapamiento y autorización, P2 intervalos inválidos, comprobó ventanas separadas y verificó la matriz del README con el listado y reporte de 10 tests. |
| diagnosticar-fallos-reservas | Analizó el error histórico de .env como configuración, anterior a un POST de reserva; no lo atribuyó al código actual. Analizó además los problemas reales de observación MCP descritos abajo. No cambió expectativas de negocio ni añadió reintentos. |
| booker-ui-api-tests | Coordinó revisión, implementación, verificación y selección de evidencia. Reutilizó clientes/POM/fixture de autenticación y dejó revisión humana y tiempo real pendientes. |

Cambios de implementación: tests/data/booking-cases.ts con seis datasets tipados; owned-booking.fixture.ts con propiedad por test, captura del intento antes del POST y limpieza de todos los registros propios aun si falla uno; tres specs parametrizados para solapamiento, autorización y fechas. Los clientes públicos y el flujo UI existente no cambiaron. Los contextos HTTP no autorizados empezaron con cookies vacías, sin copiar el token de la fixture autenticada.

### MCP del proyecto comprobados

codex mcp get leyó command=npm.cmd y args=run,--silent,mcp:playwright desde el proyecto. @playwright/mcp 0.0.83 se instaló localmente con npm install --save-dev --save-exact, código 0; la instalación informó cero vulnerabilidades. El usuario completó OAuth y codex mcp login postman terminó con código 0. Los tokens quedaron fuera de Git.

La comprobación posterior utilizó el cliente nativo de Codex app-server en un contexto efímero situado en la raíz del proyecto, sin ejecutar un modelo ni crear un chat de trabajo persistente. El inventario mostró Playwright con 25 herramientas y Postman con OAuth y las siete herramientas de lectura configuradas. Se llamó realmente a getAuthenticatedUser, getCollection y getCollectionRequest para CreateBooking/DeleteBooking desde ese servidor Postman, no como sustitución mediante el plugin global.

El Playwright local navegó a la habitación 3 con las fechas de .env y abrió el formulario sin enviar otra reserva. Se conservaron los campos reales en [snapshot del proyecto](exploration/project-form.yml). El [resumen](final/summary.json) registra conexiones, configuración y comprobaciones. La configuración global conservó exactamente su SHA256 original; sus conexiones permanecen intactas. No se crearon ni modificaron recursos remotos de Postman.

### Diagnóstico de la observación MCP

La herramienta global de la sesión rechazó guardar un snapshot en la ruta de otro workspace. Era una restricción de la raíz de esa conexión, no un error HTTP de la demo. Se verificó después el servidor del proyecto desde su propia raíz, sin ampliar permisos ni modificar la configuración global.

El primer comprobador local usó browser_wait_for con texto visible Firstname. Falló porque ese nombre identificaba el textbox en accesibilidad y no un texto visible independiente: [error conservado](failures/mcp-form-observation.log). Se corrigió únicamente el comprobador temporal para observar el textbox con browser_find y guardar un snapshot; terminó con código 0. El fallo fue del comprobador de herramientas y no de las diez pruebas de negocio, que pasaron sin correcciones ni reintentos.

### Entrega seleccionada

Se archivó íntegra la selección anterior fuera del repositorio y se verificaron sus SHA256 antes de publicar este único reporte. Se conservaron los fallos relevantes y su anonimización previa, se sustituyó el extracto de contrato por la lectura OAuth actual y se añadieron solo el snapshot de la conexión del proyecto y el pequeño log diagnóstico. Los temporales, inventarios completos y salidas compiladas quedaron en work/ ignorado.

El primer intento de archivar mediante rename del directorio evidence recibió EPERM en Windows antes de modificar sus archivos. Se usó una copia íntegra verificada por SHA256 y se trasladaron individualmente los archivos finales anteriores, sin borrar originales ni cambiar permisos.

Las métricas de adopción de skills continúan siendo una propuesta de medición: no se inventaron mejoras de productividad. La autenticación OAuth completada por el usuario acredita esa acción, no una revisión funcional humana de los tests.

Validación final de la ampliación: las cuatro skills pasaron quick_validate.py;
se comprobaron 50 enlaces locales, las huellas del código ejecutado y de las skills,
las seis variantes anotadas, sus códigos 409/403 y la selección de Git. El reporte
HTML y su recurso PNG coinciden por SHA256 con la ejecución original. La captura
de confirmación fue inspeccionada por el agente: mensaje y fechas legibles. La
selección conserva 23 archivos, aproximadamente 1,31 MiB. El original de la entrega
anterior quedó fuera del repositorio, verificado antes de sustituirlo.

### Publicación de la ampliación

El commit [f928ae269a0cabb2710578bb0ecebcf7bda9d634](https://github.com/andreudev/prueba-quality-engineer/commit/f928ae269a0cabb2710578bb0ecebcf7bda9d634)
publicó la implementación y evidencia, conservando el commit previo 29c1876 de las
skills. git push origin main terminó con código 0 y git ls-remote confirmó el mismo
commit local y remoto. El 2026-10-22 a las 23:26:01 UTC, el árbol público de GitHub
respondió HTTP 200 sin autenticación: se comprobaron doce rutas requeridas,
incluyendo configuración MCP, cuatro skills, datasets, fixture, tres specs y reporte;
había 23 archivos de evidencia. Este registro documental posterior no modifica
el código de las diez pruebas ejecutadas. No se usó force push ni se cambió la
visibilidad del repositorio o la configuración global de MCP.

## Reejecución solicitada por errores locales

Solicitud del usuario aplicada en esta revisión:

~~~text
Puedes re ejecutar todo y ver que esta pasando, veo unso errores
~~~

El agente aplicó `booker-ui-api-tests` y sus capacidades de revisión de contrato, cobertura y diagnóstico. Las instrucciones de la skill principal ya estaban guardadas en `3eefd8b` antes de esta reejecución. Se utilizaron también las guías Postman api-engineer y api-testing; la suite siguió en Playwright Test contra el backend real, sin sustituirla por mocks o ejecución de colecciones.

- **Contrato:** la conexión Postman del proyecto volvió a consultar identidad, colección y detalles CreateBooking/DeleteBooking mediante OAuth. Se actualizó el [extracto](postman-contract.json); no se modificaron recursos remotos ni expectativas HTTP.
- **Cobertura:** se listaron los diez tests, se mantuvieron los seis datasets y sus prioridades/riesgos, y se verificaron dos workers efectivos. Los códigos adicionales observados siguen siendo 409 para solapamientos/fechas y 403 para eliminación no autorizada.
- **Diagnóstico:** el reporte local anterior tenía fallos en SOL-01, API exitosa sin depósito y AUT-01. Los traces muestran conflictos con 2026-11-16 → 2026-11-20, 2026-11-09 → 2026-11-12 y 2026-11-30 → 2026-12-03 respectivamente. Los tres casos se detuvieron en la comprobación de disponibilidad antes de enviar una creación. Es un incumplimiento de precondiciones por datos compartidos; no se confirmó un bug de producto.
- **MCP/UI:** el servidor Playwright local abrió el formulario real sin enviar otra reserva. Postman expuso las siete herramientas configuradas y Playwright las 25 del servidor local. Se actualizó el [snapshot](exploration/project-form.yml). La configuración global conservó su SHA256 conocido.
- **Resultado:** TypeScript, listado, UI y suite completa terminaron con código 0. La UI aislada utilizó un worker; la suite completa pasó diez pruebas con dos workers. Se verificó la limpieza de los registros propios.
- **Límites:** las ventanas conflictivas estaban disponibles al reejecutar. No se cambiaron fechas ni se borraron registros ajenos; no hay evidencia para atribuir su desaparición a un reset o a un actor concreto. El aviso NO_COLOR/FORCE_COLOR solo afecta al formato de la salida y no provocó fallos.
- **Cierre:** se verificó por SHA256 la copia íntegra de los 23 archivos de la selección anterior antes de sustituir los archivos finales. La nueva selección mantiene un único reporte completo y añade solo el diagnóstico de disponibilidad y un trace representativo. En la copia entregable del trace se sustituyeron tokens por REDACTED_DEMO_TOKEN; el original quedó intacto fuera de Git. Los recursos del nuevo reporte coinciden con la ejecución y el código no cambió durante ella.

Después de verificar el archivo de las salidas locales anteriores, se actualizaron también `playwright-report/` y `test-results/` con las salidas de la nueva suite. El listado había generado un HTML intermedio con diez omitidas; también se archivó, sin contarlo como ejecución aprobada. Así, `show-report playwright-report` abre el resultado de diez aprobadas y `.last-run.json` registra `passed`. Ambas carpetas siguen ignoradas por Git; sus originales se conservaron fuera del repositorio antes de sustituir los archivos. Los logs seleccionados añaden el código de salida observado; las salidas brutas se conservan con los intermedios.

Los cambios de esta revisión son la selección de evidencia y su documentación. No se corrigió lógica de pruebas, no se relajaron aserciones y no se añadieron reintentos ni nuevos escenarios. El cambio local previo de formato de los datasets permanece fuera del commit. La revisión del agente no se presenta como una nueva aprobación funcional humana.
