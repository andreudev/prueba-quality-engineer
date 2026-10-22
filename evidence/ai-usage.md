# Uso de IA para la reserva integrada UI y API

Fecha de las ejecuciones: 2026-10-22. Agente: Codex.
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

## Ejecuciones seleccionadas para el cierre técnico

Las dependencias ya estaban instaladas y npm ls --depth=0 confirmó las versiones de package.json. Se ejecutaron de nuevo TypeScript, UI y la suite completa tras corregir las referencias de comentarios. No se cambiaron fechas ni se añadieron reintentos o mocks.

| Comprobación | Resultado observado | Código | Evidencia |
| --- | --- | --- | --- |
| npm run typecheck | Sin errores | 0 | [log](final/typecheck.log) |
| UI con Chromium | 1 aprobada; 1 worker; 8.4 s | 0 | [log](final/ui.log) |
| API + UI con Chromium | 4 aprobadas; 2 workers reales; 7.0 s | 0 | [log](final/suite.log), [reporte completo](final/report/index.html) |

Los comandos exactos, variables de salida, códigos, versión y huellas del código están en [summary.json](final/summary.json). Las salidas temporales quedaron en work/verification, ignorado por Git. El reporte HTML se copió completo con sus recursos. La ejecución UI aislada tiene un único caso y utiliza un worker; la suite completa registra los workers 0 y 1 con tiempos solapados.

La [evidencia conjunta de la reserva](final/reservation.json) contiene datos, disponibilidad, creación UI 201, consulta del mismo ID **8** y limpieza 202/404. Fechas: 2026-11-10 a 2026-11-12. Huésped sintético: Ui5736903516604d ReservaUi. La captura del reporte se inspeccionó visualmente: confirmación y fechas legibles.

Como antecedente, la ejecución seleccionada anterior aprobó 4 casos con 2 workers en 7,2 s y verificó la reserva ID 9. Su reporte y documento anterior se archivaron localmente fuera del repositorio antes de sustituirlos; los enlaces de esta sección corresponden exclusivamente a la nueva ejecución.
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

## Revisión técnica del agente y cierre solicitado

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

GitHub respondió HTTP 200 sin autenticación para el repositorio andreudev/prueba-quality-engineer y lo identificó como público, rama principal main. No se cambió la visibilidad ni la identidad local del autor. El commit y su publicación se pueden contrastar con el historial de main; cualquier impedimento de publicación se registrará aquí antes de dar el cierre por terminado.

Pendientes exclusivos del autor: revisión funcional humana y tiempo total real invertido. La sustentación y su variación están preparadas como instrucciones, no se declaran ya realizadas.
## Limitaciones

- Demo compartida: los éxitos corresponden a las ejecuciones indicadas. Fechas y disponibilidad deben comprobarse de nuevo; no se buscan fechas automáticamente.
- No se ejercitaron el fallback de ID ausente ni un fallo de limpieza forzado. No se atribuye cobertura a esas ramas.
- No se evaluó la persistencia de email/phone ni el diseño visual de la demo.
- No se ha confirmado un bug de producto: los fallos conservados corresponden al desarrollo o configuración del harness y a herramientas del agente.
- Los requisitos de entrega aún pendientes se señalan en [README](../README.md).
