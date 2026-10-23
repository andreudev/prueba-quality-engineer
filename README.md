# Prueba técnica de reservas con Playwright

Automatización en TypeScript de reservas en [Restful Booker Platform](https://automationintesting.online/), con Playwright Test, Page Object Model (POM), clientes API y skills para guiar a un agente de IA. Todas las pruebas utilizan el backend real y datos sintéticos.

**Repositorio:** [andreudev/prueba-quality-engineer](https://github.com/andreudev/prueba-quality-engineer).

**Verificación conservada:** 22 de octubre de 2026 en Colombia (23 de octubre en UTC); **dos ejecuciones consecutivas de 10 pruebas aprobadas en Chromium con 2 workers reales**, sin omitidas ni reintentos, tras actualizar las fechas explícitas a marzo y abril de 2027. Consulta el [último reporte](evidence/final/report/index.html), el [resumen de ambas ejecuciones](evidence/final/summary.json) y el [diagnóstico de los fallos anteriores de disponibilidad](evidence/failures/availability/diagnosis.json). Cada ejecución futura debe comprobar sus propios resultados.

## Índice

1. [Cumplimiento de la prueba técnica](#1-cumplimiento-de-la-prueba-técnica)
2. [Instalación desde cero](#2-instalación-desde-cero)
3. [Ejecución de pruebas y reportes](#3-ejecución-de-pruebas-y-reportes)
4. [MCP del proyecto](#4-mcp-del-proyecto)
5. [Skills y trabajo con el agente](#5-skills-y-trabajo-con-el-agente)
6. [Diseño, cobertura y riesgos](#6-diseño-cobertura-y-riesgos)
7. [Resultados, evidencias y uso de IA](#7-resultados-evidencias-y-uso-de-ia)

## 1. Cumplimiento de la prueba técnica

El alcance original exige tres escenarios de negocio y al menos uno con dos conjuntos de datos. La entrega mínima contiene **4 pruebas ejecutables**: API exitosa con y sin depósito, API negativa e integración UI/API. La automatización de los tres casos adicionales y la implementación de las tres skills complementarias corresponden a una **ampliación posterior solicitada por el autor**; el enunciado solo pedía proponerlas.

| Pauta del enunciado | Implementación o explicación | Evidencia para evaluación |
| --- | --- | --- |
| Crear y consultar una reserva por API | Estado HTTP, identidad, habitación, fechas y huésped; dos datasets | [Escenario compartido](tests/scenarios/booking-success.scenario.ts), [reporte](evidence/final/report/index.html) |
| Rechazar un dato obligatorio inválido y comprobar ausencia de persistencia | Nombre vacío y búsqueda del marcador sintético | [API negativa](tests/api/booking-negative.spec.ts) |
| Crear por UI, confirmar y consultar el mismo registro por API | POM, confirmación visible y correlación por el ID del POST real | [Test integrado](tests/ui/booking-integrated.spec.ts), [correlación](evidence/final/reservation.json) |
| TypeScript, POM, clientes separados y aislamiento | Page Objects, clientes HTTP, fixtures y limpieza de registros propios | [Diseño](#6-diseño-cobertura-y-riesgos) |
| Backend real y al menos dos workers efectivos | Suite Chromium ejecutada con dos workers, sin mocks | [Resumen con comandos, códigos y workers](evidence/final/summary.json) |
| Skill guardada antes de utilizarla; invocación y revisión del resultado | Skill principal, commits previos y registro de cambios y correcciones | [Trazabilidad de IA](evidence/ai-usage.md) |
| Tres casos adicionales con prioridad y riesgo | Solapamiento, eliminación no autorizada y fechas inválidas; ahora automatizados | [Cobertura y datasets](#6-diseño-cobertura-y-riesgos) |
| Tres skills propuestas, adopción, métricas y distinción frente a scripts/fixtures | Propuestas conservadas e implementadas en la ampliación | [Skills y adopción](#5-skills-y-trabajo-con-el-agente) |
| Instalación y ejecución para personas y agentes; gates | Instrucciones reproducibles y gates propuestos de smoke/regresión | [Instalación](#2-instalación-desde-cero), [ejecución](#3-ejecución-de-pruebas-y-reportes), [MCP](#4-mcp-del-proyecto) |
| Reporte, riesgos y fallos | Selección de evidencias, resultados y limitaciones técnicas | [Evidencias](#7-resultados-evidencias-y-uso-de-ia) |

## 2. Instalación desde cero

### Requisitos

Las instrucciones están preparadas para **Windows y PowerShell**. Las versiones indicadas son las utilizadas en el entorno verificado, no una matriz de compatibilidad ni versiones mínimas certificadas.

| Componente | Para qué se necesita | Instalación o versión utilizada |
| --- | --- | --- |
| Git | Clonar el repositorio | [Instalador oficial](https://git-scm.com/downloads/win); 2.55.0.windows.3 |
| Node.js y npm | Instalar dependencias y ejecutar Playwright | [Descarga oficial](https://nodejs.org/en/download); Node.js 24.18.0 y npm 11.16.0 |
| Chromium de Playwright | Ejecutar la suite documentada | Se instala en el paso siguiente |
| Codex con acceso a un agente | Utilizar las skills y los MCP; opcional para ejecutar solo los tests | [Instalación oficial de Codex CLI](https://learn.chatgpt.com/docs/codex/cli) o el cliente de escritorio existente |
| Google Chrome | Navegador predeterminado del Playwright MCP configurado | [Descarga oficial](https://www.google.com/chrome/); necesario para reproducir este flujo del agente |
| Cuenta de Postman | Autorizar la consulta de la colección mediante MCP | [Postman](https://www.postman.com/); OAuth, sin instalar su aplicación de escritorio |

Comprueba las herramientas base en una terminal nueva después de instalarlas:

~~~powershell
git --version
node --version
npm.cmd --version
~~~

### Clonar e instalar dependencias

Desde la carpeta donde guardarás el proyecto:

~~~powershell
git clone https://github.com/andreudev/prueba-quality-engineer.git
Set-Location prueba-quality-engineer
npm.cmd ci
npx.cmd playwright install chromium
if (-not (Test-Path -LiteralPath .env)) { Copy-Item -LiteralPath .env.example -Destination .env }
~~~

`npm ci` instala las versiones del lockfile: Playwright Test, TypeScript, tipos de Node, dotenv y el servidor Playwright MCP local. Este último está fijado en `@playwright/mcp@0.0.83`. No requiere instalar el MCP globalmente. En PowerShell se utiliza `npm.cmd`/`npx.cmd` para ejecutar los lanzadores de Windows.

### Configurar el entorno y los datos

Edita `.env` siguiendo [.env.example](.env.example). [playwright.config.ts](playwright.config.ts) carga ese archivo mediante dotenv antes de iniciar los workers; las variables ya definidas en el proceso tienen precedencia. Conserva un `.env` existente y no lo subas a Git.

| Variable | Uso | Valor de referencia |
| --- | --- | --- |
| `BASE_URL` | Entorno de la aplicación y API | `https://automationintesting.online` |
| `API_USERNAME` | Usuario de autenticación API | `admin`, credencial pública de la demo |
| `API_PASSWORD` | Contraseña de autenticación API | `password`, credencial pública de la demo |
| `BOOKING_CHECKIN` | Entrada de las reservas de los casos originales | `2027-03-10`, fecha explícita que debe revisarse antes de ejecutar |
| `BOOKING_CHECKOUT` | Salida de esas reservas | `2027-03-12`, posterior a la entrada |

Las fechas base deben ser futuras, válidas y estar disponibles en las habitaciones **1, 2 y 3**. Los seis datasets adicionales tienen fechas independientes en [tests/data/booking-cases.ts](tests/data/booking-cases.ts): modifica allí sus ventanas cuando expiren o no estén disponibles, manteniendo la intención de cada caso y la separación respecto a las fechas base.

Las fechas inválidas de FEC-01/FEC-02 son deliberadas: conserva salida igual o anterior a entrada. Las pruebas no buscan fechas automáticamente. La disponibilidad de una ejecución pasada no garantiza disponibilidad actual en esta demo compartida.

Las ventanas de marzo y abril de 2027 se eligieron explícitamente, con autorización del autor, después de reproducir conflictos recurrentes en noviembre y diciembre de 2026. Se conservaron las habitaciones 1, 2 y 3. Esta actualización de datos evita aquellas colisiones observadas, pero no convierte la demo compartida en un entorno aislado. Al actualizar el repositorio, un `.env` ya existente debe conservarse y revisar sus dos fechas: cambiar `.env.example` no lo modifica automáticamente.

## 3. Ejecución de pruebas y reportes

Ejecuta los comandos desde la raíz del repositorio. La suite funciona sin Codex, sin MCP activos y sin sesión de Postman.

| Comprobación | Comando | Cantidad esperada en Chromium |
| --- | --- | --- |
| TypeScript | `npm.cmd run typecheck` | Sin errores de tipos |
| Listado sin ejecutar reservas | `npx.cmd playwright test --list --project=chromium` | 10 pruebas |
| API exitosa parametrizada | `npm.cmd run test:api:success -- --workers=2` | 2 pruebas |
| Toda la API | `npx.cmd playwright test tests/api --project=chromium --workers=2` | 9 pruebas |
| Integración UI/API | `npx.cmd playwright test tests/ui --project=chromium --workers=2` | 1 prueba |
| Solo la ampliación | `npx.cmd playwright test tests/api/booking-overlap.spec.ts tests/api/booking-unauthorized.spec.ts tests/api/booking-invalid-dates.spec.ts --project=chromium --workers=2` | 6 pruebas |
| Suite completa | `npx.cmd playwright test tests/api tests/ui --project=chromium --workers=2` | 10 pruebas |

El escenario UI aislado tiene una sola prueba y utiliza un worker, aunque el límite configurado sea dos. La evidencia de concurrencia corresponde a la suite completa. Firefox y WebKit están definidos en la configuración, pero la ejecución entregada y los comandos anteriores corresponden a Chromium.

### Generación y ubicación de los reportes

El reporter se habilita en [playwright.config.ts](playwright.config.ts). Fragmento de la configuración vigente:

~~~typescript
reporter: [["list"], ["html", { open: "never" }]],
~~~

`list` muestra los resultados en la terminal y `html` genera el reporte. `open: "never"` evita abrirlo automáticamente; no desactiva su generación. Como no se configura `outputFolder`, el HTML usa la carpeta predeterminada `playwright-report/`, salvo que se indique otra mediante una variable de entorno. Véase el [reporter HTML oficial](https://playwright.dev/docs/test-reporters#html-reporter).

| Salida | Ubicación desde la raíz del repositorio | Cómo se genera |
| --- | --- | --- |
| Reporte HTML habitual | `playwright-report/index.html` y sus recursos | Reporter HTML de la configuración, al ejecutar las pruebas con los comandos anteriores |
| Adjuntos de ejecución | `test-results/` | Directorio predeterminado de artefactos; los tests adjuntan datos y la configuración conserva trace, captura y vídeo pertinentes ante fallos |
| Reporte seleccionado para entregar | `evidence/final/report/index.html` y sus recursos | Copia completa preparada por el agente durante el cierre de la skill |

`test-results/` es el valor predeterminado de [outputDir](https://playwright.dev/docs/api/class-testconfig#test-config-output-dir). Las salidas habituales se reutilizan en posteriores ejecuciones y están ignoradas por Git. El reporte seleccionado permanece separado para que una ejecución local no lo sustituya.

**`evidence/final/report/` no es un destino configurado en Playwright.** No existe un script npm ni un hook que lo actualice al ejecutar los tests. El agente aplica el cierre de la skill: conserva el reporte completo elegido, incluidos sus recursos, y prepara el resumen, los logs y la correlación del mismo registro.

### Consultar reportes

Para abrir el reporte de tu última ejecución local:

~~~powershell
npx.cmd playwright show-report playwright-report
~~~

Para abrir el reporte seleccionado de la entrega, con sus recursos incluidos:

~~~powershell
npx.cmd playwright show-report evidence/final/report
~~~

GitHub permite consultar los archivos; para utilizar el visor interactivo del reporte HTML, clona el proyecto y ábrelo con el comando anterior.

### Rutas de la ejecución conservada

Para conservar por separado la ejecución UI y la suite completa, el agente utilizó temporalmente `--reporter=list,html,json`, `PLAYWRIGHT_HTML_OUTPUT_DIR` para el HTML, `PLAYWRIGHT_JSON_OUTPUT_FILE` para el JSON y `--output` para los artefactos. **`--output` no cambia la carpeta del reporte HTML.** Los comandos y variables exactos figuran en [summary.json](evidence/final/summary.json).

| Ejecución conservada | HTML generado antes de seleccionar la entrega | Artefactos (`--output`) | JSON de resultados |
| --- | --- | --- | --- |
| UI aislada | `work/fechas-explicitas/ui-report/` | `work/fechas-explicitas/ui-artifacts/` | `work/fechas-explicitas/ui-results.json` |
| Suite completa, primera ejecución | `work/fechas-explicitas/first-report/` | `work/fechas-explicitas/first-artifacts/` | `work/fechas-explicitas/first-results.json` |
| Suite completa, segunda ejecución | `work/fechas-explicitas/full-report/` | `work/fechas-explicitas/full-artifacts/` | `work/fechas-explicitas/full-results.json` |

El reporte completo de la última fila se seleccionó para `evidence/final/report/`. El resumen y los logs conservan también el resultado de la primera ejecución. Las rutas de `work/` son intermedios locales ignorados y no forman parte de la descarga del repositorio. Estas variables no están definidas por la configuración versionada: los comandos habituales generan el reporte local predeterminado si la sesión no conserva un override. Si se utiliza una ruta personalizada, debe registrarse y abrirse con `show-report` apuntando a esa carpeta.

El código de salida **0** indica que el comando terminó correctamente; cualquier código distinto de 0 bloquea el gate y debe investigarse. En PowerShell, consulta `$LASTEXITCODE` inmediatamente después del comando. Un listado correcto no equivale a pruebas ejecutadas. La configuración conserva traces, capturas y vídeo pertinentes ante fallos, y mantiene los reintentos desactivados.

### Gates propuestos

Smoke comprueba tipos y los escenarios exitosos API/UI. Regresión ejecuta toda la suite, incluidos los negativos y las variantes adicionales. Estos bloques detienen la secuencia ante un código distinto de 0:

~~~powershell
# Smoke
npm.cmd run typecheck
if ($LASTEXITCODE -ne 0) { throw "Falló TypeScript: gate bloqueado." }
npx.cmd playwright test tests/api/booking-success tests/ui --project=chromium --workers=2
if ($LASTEXITCODE -ne 0) { throw "Falló smoke: gate bloqueado." }
~~~

~~~powershell
# Regresión
npm.cmd run typecheck
if ($LASTEXITCODE -ne 0) { throw "Falló TypeScript: gate bloqueado." }
npx.cmd playwright test tests/api tests/ui --project=chromium --workers=2
if ($LASTEXITCODE -ne 0) { throw "Falló regresión: gate bloqueado." }
~~~

El ejecutor debe publicar el reporte y conservar los adjuntos pertinentes. Un fallo de limpieza también bloquea el gate. La indisponibilidad de la demo se registra como impedimento de ejecución, sin aprobar el caso ni atribuir automáticamente un bug al producto. Los gates son una propuesta de integración: no se implementó un pipeline ni se requiere Azure o despliegue para la entrega.

## 4. MCP del proyecto

Los MCP proporcionan herramientas al agente: Playwright permite observar la UI real y Postman consultar el contrato. Las pruebas se implementan y ejecutan con Playwright Test; la colección de Postman es material de consulta.

### Preparar Codex

Si ya utilizas Codex de escritorio, abre **la raíz de este repositorio** como proyecto confiable. Para seguir los comandos de terminal, comprueba `codex --version`. Si el comando no está disponible, puedes instalar el cliente CLI mediante npm:

~~~powershell
npm.cmd install -g @openai/codex
codex --version
codex
~~~

Completa el inicio de sesión del cliente cuando se solicite. La instalación global anterior corresponde únicamente al **cliente Codex**. Las conexiones MCP y las skills de esta solución están versionadas dentro del proyecto. La [guía oficial del CLI](https://learn.chatgpt.com/docs/codex/cli) describe la instalación y el acceso.

### Conexiones incluidas

La configuración está en [.codex/config.toml](.codex/config.toml). Codex admite esta configuración por proyecto cuando se confía en el repositorio; consulta la [documentación oficial de MCP](https://learn.chatgpt.com/docs/extend/mcp).

| Servidor | Configuración incluida | Preparación |
| --- | --- | --- |
| `playwright` | STDIO; `npm.cmd run --silent mcp:playwright`; paquete local 0.0.83 con `--headless --isolated` | Completar `npm ci` e instalar Chrome. El cliente inicia el servidor desde la raíz del proyecto. |
| `postman` | Streamable HTTP; `https://mcp.postman.com/mcp`; OAuth; siete herramientas de lectura permitidas por la configuración del cliente | Autorizar la cuenta desde el cliente. No necesita una API key para este flujo. |

Chromium instalado para los tests y Chrome utilizado por el MCP son requisitos distintos. `--headless` ejecuta el navegador en segundo plano y `--isolated` usa un perfil aislado. El comando npm del MCP es el lanzador utilizado por Codex; no hace falta abrir otra terminal para mantenerlo ejecutándose.

La configuración global existente se conserva. No añadas de nuevo los servidores globalmente para seguir esta guía. Postman expone en este proyecto `getEnabledTools`, `getAuthenticatedUser`, `searchPostmanElements`, `getCollection`, `getCollectionFolder`, `getCollectionRequest` y `getCollectionResponse`. El flujo consulta recursos, sin crear ni modificar colecciones remotas.

### Autenticar y verificar

Desde la raíz confiable del proyecto:

~~~powershell
codex mcp get playwright --json
codex mcp get postman --json
codex mcp login postman
~~~

Completa la autorización en el navegador. El servidor estadounidense de Postman admite OAuth; consulta su [documentación oficial](https://learning.postman.com/docs/reference/postman-api/postman-mcp-server/postman-mcp-remote-server/). Cada desarrollador autentica su propio cliente; las credenciales quedan fuera del repositorio.

Comprueba tres niveles:

1. **Configuración:** Playwright muestra `command=npm.cmd` y `args=["run","--silent","mcp:playwright"]`; Postman muestra la URL anterior y las siete herramientas permitidas.
2. **Conexión y autenticación:** abre una sesión del proyecto y consulta `/mcp`. Si conserva herramientas anteriores, reinicia las conexiones o la sesión; Postman debe terminar su autorización.
3. **Uso real:** solicita al agente que observe la página mediante Playwright y consulte la identidad y la colección pública mediante Postman. Un servidor listado, o un plugin global autenticado, no demuestra por sí solo que la conexión del proyecto funciona.

Prompt de comprobación, sin crear reservas:

~~~text
Verifica los MCP de este proyecto. Con playwright abre
https://automationintesting.online/ y obtén un snapshot de la interfaz.
Con postman consulta la identidad autenticada y la colección
92957-55c5fdaf-6595-4ecd-a3f8-baf4d814e872.
Indica qué conexión utilizaste y cualquier impedimento real.
No crees reservas ni modifiques recursos remotos de Postman.
~~~

La [guía de diagnóstico MCP](docs/playwright-mcp.md) amplía la activación, la observación de formularios y los errores históricos de herramientas. Sus snapshots temporales orientan los locators; no se copian como selectores persistentes de los tests.

## 5. Skills y trabajo con el agente

Las cuatro skills ya vienen con el repositorio en `.agents/skills`. Codex las descubre desde el proyecto; puedes seleccionarlas o invocarlas por su nombre con `$`. No requieren instalarlas en una carpeta personal ni ejecutarlas mediante npm. Si no aparecen, reinicia la sesión y comprueba que abriste el repositorio correcto. Véase la [documentación oficial de skills](https://learn.chatgpt.com/docs/build-skills).

### Capacidades implementadas

| Skill | Propósito y usuario | Entradas | Salidas y verificación | Herramientas |
| --- | --- | --- | --- | --- |
| [$booker-ui-api-tests](.agents/skills/booker-ui-api-tests/SKILL.md) | Guiar a QA/desarrolladores en implementación y revisión de reservas UI/API | Escenario, entorno, datos sintéticos, código y criterios de aceptación | Implementación con POM/clientes/fixtures, ejecución real y cierre de evidencias; correlación del mismo registro | Playwright MCP, Postman MCP y terminal |
| [$revisar-contrato-api](.agents/skills/revisar-contrato-api/SKILL.md) | Evitar expectativas sin respaldo para quienes mantienen clientes y tests | Colección, clientes, aserciones, datasets y respuestas identificadas | Diferencias trazables y expectativas justificadas; separa contrato, referencia de código y observado | Postman MCP y lectura del proyecto |
| [$priorizar-cobertura-reservas](.agents/skills/priorizar-cobertura-reservas/SKILL.md) | Ayudar a QA a priorizar cobertura por riesgo | Requisitos, casos, datasets, contrato y límites de la demo | Matriz requisito/riesgo/escenario/dataset/prioridad sin duplicados; contraste con listado y resultados | Lectura del proyecto y terminal |
| [$diagnosticar-fallos-reservas](.agents/skills/diagnosticar-fallos-reservas/SKILL.md) | Ayudar a QA/desarrolladores a distinguir producto, test, datos y entorno | Fallo, comando, código de salida, reporte, trace, configuración sin secretos y contrato | Diagnóstico sustentado o hipótesis explícita, referencias y siguiente comprobación; revisión humana/reproducción cuando sea posible | Artefactos y terminal; MCP cuando ayuden al diagnóstico |

La skill principal coordina la revisión de contrato antes de fijar expectativas, la priorización de cobertura y el diagnóstico ante fallos. También selecciona el reporte, actualiza resumen y correlación, conserva fallos pertinentes, archiva intermedios fuera de Git y comprueba enlaces y archivos de entrega. Ese cierre forma parte del trabajo del agente y distingue las revisiones y correcciones efectivamente realizadas.

### Invocaciones copiables

Para trabajar el escenario integrado existente con el agente, después de preparar entorno y conexiones:

~~~text
Usa $booker-ui-api-tests para revisar y ejecutar el escenario integrado
de este proyecto. Lee las implementaciones existentes, consulta el contrato
con Postman MCP y observa la UI con Playwright MCP antes de adaptar locators.
Mantén los datos explícitos del entorno y limpia solo registros propios.
Ejecuta TypeScript, el caso UI y la suite Chromium con dos workers.
Registra comandos, códigos y resultados reales, y aplica el cierre de evidencias.
No amplíes la cobertura ni debilites aserciones. Informa cualquier impedimento.
~~~

Las skills complementarias también pueden invocarse individualmente:

~~~text
Usa $revisar-contrato-api para contrastar los clientes, datasets y aserciones
actuales con la colección Postman del proyecto. Separa lo documentado,
la referencia de implementación y lo observado en la ejecución conservada.
Registra las diferencias sin modificar recursos remotos de Postman.
~~~

~~~text
Usa $priorizar-cobertura-reservas para relacionar los requisitos de este README
con los tests y datasets actuales. Verifica el listado de Chromium y la evidencia
existente, identifica duplicados o pendientes y conserva las prioridades
P1/P2 justificadas. No añadas escenarios por iniciativa propia.
~~~

~~~text
Usa $diagnosticar-fallos-reservas para analizar evidence/failures/env-format.log
y sus adjuntos. Es un fallo histórico: contrástalo con la configuración actual,
distingue hechos e hipótesis y registra la siguiente comprobación sustentada.
No lo presentes como fallo actual ni provoques uno artificial para demostrar uso.
~~~

Son instrucciones para futuras sesiones del agente. Las invocaciones realmente utilizadas, sus cambios y resultados están en [evidence/ai-usage.md](evidence/ai-usage.md).

### Prioridad, adopción y métricas propuestas

Las tres skills complementarias se propusieron para cumplir el enunciado y después se implementaron por solicitud del autor. Su implementación no demuestra por sí sola mejoras de productividad.

| Prioridad de construcción/adopción propuesta | Necesidad y justificación | Cómo medir utilidad |
| --- | --- | --- |
| **P1, primera: diagnosticar-fallos-reservas** | La demo compartida hace costoso distinguir problemas del producto, datos o entorno | Mediana del tiempo hasta un diagnóstico verificable y proporción de diagnósticos corregidos por una persona |
| **P1: revisar-contrato-api** | Detectar expectativas sin respaldo antes de integrar cambios de clientes o tests | Diferencias detectadas antes de integrar y proporción de falsos positivos |
| **P2: priorizar-cobertura-reservas** | Elegir la siguiente cobertura según riesgo, evitando duplicados | Tiempo de planificación y proporción de propuestas aceptadas para el siguiente ciclo |

Para un piloto de diagnóstico, QA registraría una línea base con cinco diagnósticos y utilizaría la skill en los cinco siguientes, comparando tiempo y correcciones humanas. Después pilotaría contrato en cambios de tests y cobertura en una sesión de planificación. Son métricas y un diseño de adopción propuestos, sin resultados medidos todavía; se conservarían las skills si reducen trabajo sin aumentar conclusiones incorrectas.

La extracción de estadísticas, el conteo de archivos y la comprobación de enlaces corresponden a **scripts deterministas**. Autenticación, preparación y limpieza reutilizable corresponden a **fixtures**. Las **skills** aportan selección de evidencia, interpretación, diagnóstico y priorización; no sustituyen las aserciones ejecutables.

## 6. Diseño, cobertura y riesgos

### Organización de la solución

| Ubicación | Responsabilidad |
| --- | --- |
| [src/pages](src/pages) | POM de reserva y confirmación; locators estables y aserciones con espera automática |
| [src/api](src/api) y [src/types](src/types) | Clientes de autenticación/reservas y tipos de solicitudes/respuestas |
| [tests/fixtures](tests/fixtures) | Autenticación por test y propiedad/preparación/limpieza de los casos adicionales |
| [tests/scenarios](tests/scenarios) | Escenario API exitoso reutilizado con y sin depósito |
| [tests/api](tests/api), [tests/ui](tests/ui) y [tests/data](tests/data) | Casos ejecutables y datasets explícitos |
| [.agents/skills](.agents/skills) y [.codex/config.toml](.codex/config.toml) | Instrucciones del agente y conexiones MCP por proyecto |

Los tests no dependen del resultado de otro test ni utilizan esperas fijas. La autenticación añade la cookie de token al contexto HTTP de cada prueba; las variantes no autorizadas utilizan contextos nuevos y descartables sin heredar esa cookie. El navegador realiza la reserva desde el formulario público.

La limpieza guarda el ID antes de las aserciones de negocio y comprueba la identidad antes de eliminar. La fixture adicional registra los intentos antes del POST, contempla persistencias inesperadas e intenta limpiar los demás registros propios si una limpieza falla. La recuperación por marcador exige coincidencia única; no se hacen borrados generales ni se alteran registros ajenos. El fallo original y cualquier fallo de limpieza se mantienen visibles.

### Alcance original: cuatro pruebas

| Escenario y variantes | Comprobaciones | Riesgo cubierto |
| --- | --- | --- |
| API exitosa, habitación 1 sin depósito y habitación 2 con depósito | POST 201, GET 200 y coincidencia de ID, habitación, fechas, huésped y depósito | Crear o consultar una reserva con datos distintos; perder el estado del depósito |
| API negativa: nombre vacío | HTTP 400, errores esperados y ausencia del marcador en el listado | Aceptar o persistir una solicitud inválida |
| UI/API, habitación 3 | Envío por formulario, confirmación y fechas visibles, consulta del mismo ID y limpieza DELETE 202/GET 404 | Mostrar confirmación sin persistir la reserva correcta |

La confirmación UI no expone ID ni huésped: el test correlaciona con el ID de la respuesta real de creación. GET no expone email/phone; se verifica su envío en el POST, sin atribuir a GET una validación de persistencia que no permite.

### Tres casos adicionales priorizados: seis variantes

Estos casos inicialmente fueron propuestas, como exigía el alcance mínimo. La ampliación los implementó con dos datasets por escenario.

| Prioridad y caso | Precondiciones | Pasos y resultado esperado | Riesgo |
| --- | --- | --- | --- |
| **P1: solapamiento** | Fechas disponibles, una reserva propia y dos huéspedes con marcadores distintos | Crear la original; intentar otra en la misma habitación con intervalo idéntico o parcial; comprobar 409, original intacta y candidata no persistida; limpiar registros propios | Doble asignación de una habitación |
| **P1: eliminación no autorizada** | Reserva propia verificable y contexto nuevo sin cookie válida | Intentar DELETE sin token o con token inválido; comprobar 403 y reserva intacta; limpiar desde el contexto autorizado | Borrado sin autorización |
| **P2: fechas inválidas** | Habitación válida, entrada futura y marcador único | Enviar al backend salida igual o anterior a entrada; comprobar 409 y ausencia de persistencia; limpiar cualquier persistencia inesperada manteniendo el fallo | Estancias de duración cero o negativa |

Solapamiento y autorización se priorizan por integridad de reservas y control de acceso. La validación temporal amplía la validación de entrada ya cubierta por el negativo obligatorio.

Los datos se editan en [booking-cases.ts](tests/data/booking-cases.ts). Valores de la ejecución conservada:

| Dataset | Habitación | Reserva original o payload | Segundo intento | HTTP esperado |
| --- | --- | --- | --- | --- |
| SOL-01 | 1 | 2027-03-16 → 2027-03-20 | Mismo intervalo | 409 |
| SOL-02 | 2 | 2027-03-23 → 2027-03-27 | 2027-03-25 → 2027-03-29 | 409 |
| AUT-01 | 1 | 2027-04-01 → 2027-04-03 | DELETE sin token | 403 |
| AUT-02 | 2 | 2027-04-05 → 2027-04-07 | DELETE con token inválido | 403 |
| FEC-01 | 1 | 2027-04-10 → 2027-04-10 | No aplica | 409 |
| FEC-02 | 2 | 2027-04-15 → 2027-04-14 | No aplica | 409 |

Dataset, prioridad y riesgo de las variantes adicionales aparecen como anotaciones en el reporte. Las fechas válidas de preparación no compiten entre sí; si cambias las fechas base, comprueba su separación de estas ventanas.

### Contrato, limitaciones y bugs

La [documentación de Postman](https://www.postman.com/automation-in-testing/restful-booker-collections/documentation/ci13ds3/restful-booker-platform) es la fuente de consulta principal; el [extracto conservado](evidence/postman-contract.json) identifica la colección. Las solicitudes Booking no incluyen ejemplos de respuesta. Los códigos adicionales 409/403 se justificaron antes de ejecutar con BookingService y DateCheckValidator del [repositorio oficial](https://github.com/mwinteringham/restful-booker-platform); esa referencia no demuestra por sí sola qué versión está desplegada. La evidencia distingue documentación, referencia de implementación y comportamiento observado.

La demo es compartida y puede reiniciarse, eliminar registros o reutilizar IDs. Consultar disponibilidad antes de crear no impide que otro usuario reserve después. La comprobación de identidad protege la limpieza; si un registro ya no existe, se anota sin inventar la causa. Las ramas de recuperación sin ID y fallo forzado de limpieza no se han ejercitado deliberadamente. No se atribuye cobertura de otros navegadores a la ejecución Chromium.

**No se ha confirmado un bug de producto.** Los fallos de implementación, configuración, herramientas y disponibilidad de datos encontrados se conservan en la evidencia de IA. Si una ejecución futura revela una discrepancia, debe registrar pasos, dataset, esperado, observado y evidencia; no relajar aserciones ni cambiar fechas automáticamente para declararla aprobada.

## 7. Resultados, evidencias y uso de IA

### Ejecución seleccionada

Resultados conservados después del cambio de fechas autorizado el **22 de octubre de 2026 en Colombia**. Las suites completas comenzaron el **23 de octubre a las 02:13:07 y 02:13:40 UTC (22 de octubre, 21:13 en Colombia)**. Ambas utilizaron el backend real, las mismas fechas de marzo/abril de 2027 y las aserciones originales.

| Comprobación conservada | Resultado | Código de salida | Evidencia |
| --- | --- | --- | --- |
| TypeScript | Sin errores | 0 | [typecheck.log](evidence/final/typecheck.log) |
| Listado Chromium | 10 pruebas en 6 archivos de origen reportados | 0 | [summary.json](evidence/final/summary.json) |
| UI Chromium | 1 aprobada, 1 worker, 13.2 s | 0 | [ui.log](evidence/final/ui.log) |
| API + UI Chromium, primera ejecución | 10 aprobadas, 2 workers efectivos, 18.4 s | 0 | [first-suite.log](evidence/final/first-suite.log) |
| API + UI Chromium, segunda ejecución | 10 aprobadas, 2 workers efectivos, 18.3 s; sin omitidas, flaky ni errores | 0 | [suite.log](evidence/final/suite.log), [reporte completo](evidence/final/report/index.html) |

El [resumen](evidence/final/summary.json) contiene los comandos exactos, variables de salida del reporte, códigos, workers, datasets y huellas del código ejecutado. [reservation.json](evidence/final/reservation.json) conserva creación UI, consulta API y limpieza 202/404 del mismo registro. La observación con MCP y la ejecución de Playwright Test están identificadas por separado.

### Diagnóstico del reporte local anterior

El reporte local anterior al cambio de fechas tenía siete aprobadas y tres fallos por disponibilidad en la habitación 1. Los traces confirman que los tres se detuvieron antes de enviar POST `/api/booking`; no fueron rechazos de creación ni fallos de autenticación.

| Caso | Fechas solicitadas | Reserva existente que impedía la preparación |
| --- | --- | --- |
| API exitosa sin depósito | 2026-11-10 → 2026-11-12 | 2026-11-09 → 2026-11-13 |
| SOL-01 | 2026-11-16 → 2026-11-20 | 2026-11-14 → 2026-11-17; 2026-11-17 → 2026-11-19; 2026-11-19 → 2026-11-22 |
| AUT-01 | 2026-12-01 → 2026-12-03 | 2026-12-01 → 2026-12-02; 2026-12-02 → 2026-12-06 |

La comprobación de disponibilidad detectó correctamente esas colisiones. Una reejecución previa había pasado momentáneamente, pero el problema reapareció al ocuparse otra vez las ventanas fijas. Por decisión explícita del autor se actualizaron los datos a marzo y abril de 2027, sin crear habitaciones, alterar aserciones, añadir reintentos ni borrar registros ajenos. Después pasaron dos ejecuciones completas consecutivas. Esto verifica la repetición con los datos elegidos; no garantiza disponibilidad indefinida en la demo compartida.

El [diagnóstico](evidence/failures/availability/diagnosis.json) conserva esperado, observado, mensajes y los intervalos obtenidos de los traces. Se mantiene una [copia del trace de SOL-01](evidence/failures/availability/sol-01-trace.zip) con tokens anonimizados; los tres traces y el reporte original permanecen íntegros en el archivo local fuera de Git. Para inspeccionar la copia entregable:

~~~powershell
npx.cmd playwright show-trace evidence/failures/availability/sol-01-trace.zip
~~~

El aviso de Node sobre `NO_COLOR` y `FORCE_COLOR` afecta al formato de la terminal y no hizo fallar ninguna prueba. Los estados y códigos de salida, no ese aviso, determinan el resultado.

### Trazabilidad del agente y revisión

- Skill principal guardada antes de la implementación original: commit [6aecc959](https://github.com/andreudev/prueba-quality-engineer/commit/6aecc9591eb81e0aab136eaded89bcf55bd4c843).
- Configuración MCP y las cuatro skills guardadas antes de la ampliación: commit [29c1876e](https://github.com/andreudev/prueba-quality-engineer/commit/29c1876e6f8e8cfa918b4edf736e26548976394d).
- Código y evidencia seleccionada de la ampliación: commit [f928ae26](https://github.com/andreudev/prueba-quality-engineer/commit/f928ae269a0cabb2710578bb0ecebcf7bda9d634).
- Invocaciones exactas, cambios, revisión técnica del agente, diferencias de contrato y observaciones humanas reales: [evidence/ai-usage.md](evidence/ai-usage.md). Las observaciones sobre alcance y evidencias no se presentan como aprobación funcional humana.

Las huellas de las skills en el resumen identifican las versiones utilizadas en aquella ejecución. Los ajustes posteriores de sus instrucciones no reescriben esa evidencia ni representan una nueva ejecución de pruebas.

Las conexiones del proyecto se comprobaron mediante observación real del formulario con Playwright y lectura de identidad/colección/solicitudes con Postman OAuth. Se conservan el [snapshot del proyecto](evidence/exploration/project-form.yml) y el resumen de conexiones; no se versionan credenciales personales ni tokens.

### Fallos históricos y conservación

Los errores históricos incluyen TypeScript, el formato de `.env` y herramientas MCP. Sus causas y correcciones están en el [registro de IA](evidence/ai-usage.md), junto con los adjuntos vigentes. Para abrir el trace del fallo histórico de configuración:

~~~powershell
npx.cmd playwright show-trace evidence/failures/env-format/trace.zip
~~~

| Ubicación | Qué conservar |
| --- | --- |
| `playwright-report/` y `test-results/` | Salidas habituales de ejecución; ignoradas por Git |
| `work/` | Auxiliares y resultados intermedios; ignorados por Git |
| `evidence/final/` | Un único reporte completo seleccionado, sus recursos, resumen, logs y correlación |
| `evidence/exploration/` y `evidence/failures/` | Snapshots necesarios y fallos pertinentes, sin acumular cada intento |
| `evidence/ai-usage.md` y `evidence/postman-contract.json` | Trazabilidad del trabajo y extracto útil del contrato |

Las ejecuciones normales no sustituyen la selección final. Al preparar otra entrega, la skill archiva localmente la selección anterior fuera de Git, actualiza reporte/resumen/enlaces, conserva fallos pertinentes y anonimiza tokens en la copia entregable. Los logs históricos mantienen sus rutas originales; el registro de IA indica dónde están ahora sus adjuntos. La [.gitignore](.gitignore) separa las salidas locales de la evidencia seleccionada.
