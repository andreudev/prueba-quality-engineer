# Prueba técnica de reservas con Playwright

Pruebas en TypeScript contra el backend real de
[Restful Booker Platform](https://automationintesting.online/): creación y consulta
por API, rechazo de un dato obligatorio inválido sin persistencia y reserva por UI
con confirmación y consulta del mismo registro por API.

## Instalación y entorno

Requiere Node.js y npm. La ejecución conservada utilizó Node.js 24.18.0.
Desde la raíz del repositorio, en PowerShell:

~~~powershell
npm ci
npx playwright install chromium
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
~~~

Si ya existe `.env`, consérvalo. Configura BASE_URL, API_USERNAME, API_PASSWORD,
BOOKING_CHECKIN y BOOKING_CHECKOUT según `.env.example`. Las fechas deben ser
futuras, válidas y estar disponibles en las habitaciones 1, 2 y 3. La demo es
compartida y puede reiniciarse; las pruebas no buscan fechas automáticamente.
No subas `.env`, tokens ni credenciales personales a Git.

## Ejecución para personas y agentes

~~~powershell
npm run typecheck
npx playwright test tests/api --project=chromium --workers=2
npx playwright test tests/ui --project=chromium --workers=2
npx playwright test tests/api tests/ui --project=chromium --workers=2
npx playwright show-report
~~~

El caso API exitoso utiliza dos conjuntos de datos, con y sin depósito.
El caso UI aislado solo tiene un test y usa un worker, aunque el límite sea dos.
Una ejecución futura debe comprobar sus propios resultados; no hereda ese éxito.

Las interacciones están en `src/pages`, los clientes HTTP en `src/api` y la fixture
de autenticación en `tests/fixtures`. Las pruebas usan marcadores únicos y solo
eliminan registros cuya identidad coincide con sus propios datos.

## Skill y uso del agente

Abre el agente desde la raíz del proyecto y utiliza
[$booker-ui-api-tests](.agents/skills/booker-ui-api-tests/SKILL.md) para implementar
o adaptar el escenario integrado. La conexión necesaria y su comprobación se
describen en [Playwright MCP](docs/playwright-mcp.md).

La misma invocación encarga al agente preparar la evidencia: seleccionar el reporte,
conservar fallos relevantes, archivar intermedios fuera del repositorio, actualizar
los enlaces y verificar la entrega. No hace falta pedir una limpieza posterior.
Este cierre no sustituye la revisión funcional humana.

El commit de la skill anterior a la implementación es
`6aecc9591eb81e0aab136eaded89bcf55bd4c843`. Las invocaciones exactas, los cambios,
fallos, correcciones del agente y el estado de revisión humana están en
[uso de IA](evidence/ai-usage.md). La revisión funcional humana sigue pendiente.

La [documentación de Postman](https://www.postman.com/automation-in-testing/restful-booker-collections/documentation/ci13ds3/restful-booker-platform)
es material de consulta; las pruebas se implementan con Playwright. Las diferencias
entre contrato y comportamiento observado se documentan en la evidencia de IA.

## Reporte y evidencias de la entrega

- [Reporte completo de Playwright](evidence/final/report/index.html).
- [Resumen de casos, workers, comandos, códigos y huellas del código ejecutado](evidence/final/summary.json).
- [Correlación de creación UI, consulta API y limpieza del mismo registro](evidence/final/reservation.json).
- [Invocaciones, revisión, limitaciones y fallos relevantes](evidence/ai-usage.md).

Para abrir el reporte seleccionado y el trace del fallo de configuración conservado:

~~~powershell
npx playwright show-report evidence/final/report
npx playwright show-trace evidence/failures/env-format/trace.zip
~~~

Las ejecuciones habituales reutilizan `playwright-report/` y `test-results/`,
ignorados por Git. Los auxiliares van en `work/`, también ignorado. La entrega
conserva un único reporte completo seleccionado en `evidence/final`, los snapshots
necesarios en `evidence/exploration` y fallos relevantes en `evidence/failures`.
No se genera una nueva carpeta de evidencia por cada intento. El resumen identifica
la fecha y los resultados de la ejecución seleccionada; solo cuenta como aprobada
una prueba que realmente se ejecutó con éxito.

Al preparar otra entrega, conserva localmente la selección anterior antes de
sustituirla, actualiza resumen y enlaces, y mantén la evidencia de problemas
pendientes. Las ejecuciones normales no sobrescriben la evidencia seleccionada.
Los logs históricos conservan sus rutas originales; la ubicación actual de sus
adjuntos está indicada en el documento de uso de IA.

## Gates propuestos

Smoke: comprobación de TypeScript y escenarios exitosos de API e integración UI/API
con Chromium. Regresión: suite completa API + UI, incluido el caso negativo y ambos
conjuntos de datos:

~~~powershell
# Smoke
npm run typecheck
npx playwright test tests/api/booking-success tests/ui --project=chromium --workers=2

# Regresión
npm run typecheck
npx playwright test tests/api tests/ui --project=chromium --workers=2
~~~

El ejecutor del gate debe detenerse si cualquier comando devuelve un código distinto
de 0, publicar el reporte y conservar los adjuntos pertinentes ante fallos. Un fallo
de limpieza también bloquea el gate. La indisponibilidad de la demo se registra como
impedimento de ejecución, sin declararlo automáticamente bug de producto ni aprobar
el caso. Es una propuesta de integración; no se configuró un pipeline ni se requiere
Azure o despliegue para esta entrega.

## Resumen de cobertura y riesgos

| Escenario implementado | Comprobación principal | Riesgo cubierto |
| --- | --- | --- |
| API exitosa, sin depósito: habitación 1 | POST 201, GET 200 y coincidencia de ID, habitación, fechas y huésped | Crear o devolver una reserva con datos distintos |
| API exitosa, con depósito: habitación 2 | Mismo escenario parametrizado, con depositpaid=true | Perder o alterar el estado del depósito |
| API negativa | Nombre vacío: 400, errores esperados y ausencia del marcador en el listado | Aceptar o persistir una solicitud inválida |
| UI + API: habitación 3 | Envío por formulario, confirmación visible, consulta del mismo ID y limpieza 202/404 | Mostrar confirmación sin persistir la reserva correcta |

Todos los casos usan datos sintéticos y el backend real. La consulta de disponibilidad
es previa y no impide que otro usuario reserve después: existe una carrera en esta
demo compartida. Los reinicios también pueden eliminar o reutilizar IDs. Por eso se
comprueba la identidad antes de borrar y una ausencia previa se anota sin atribuir
su causa. No se ha confirmado un bug de producto; los fallos encontrados durante
la implementación fueron del código o configuración de las pruebas y de las
herramientas del agente, y se documentan en la evidencia de IA.

## Tres casos adicionales priorizados

Son propuestas, no casos automatizados ni ejecutados. Sus resultados de negocio
son criterios a confirmar con el responsable del producto; los códigos de rechazo
deben concretarse con el contrato. No se inventan códigos que Postman no documenta.

| Prioridad y caso | Precondiciones | Pasos propuestos | Esperado y riesgo |
| --- | --- | --- | --- |
| P1: reservas solapadas para la misma habitación | Fechas disponibles y dos huéspedes sintéticos con marcadores distintos | Crear una reserva propia; intentar otra en la misma habitación con fechas solapadas; consultar ambos marcadores; limpiar solo los registros propios tras verificar su identidad | Rechazar el segundo intento, conservar intacta la primera y no persistir la segunda. Evita doble asignación de una habitación. |
| P1: eliminación sin autenticación | Una reserva propia creada y verificable; un contexto HTTP nuevo sin cookie ni token | Intentar borrar ese ID desde el contexto sin autenticar; consultar con el cliente autenticado; limpiar al finalizar desde el contexto autorizado | Denegar la eliminación y conservar la reserva y sus datos. Evita modificaciones no autorizadas. No reutilizar accidentalmente la cookie de la fixture autenticada. |
| P2: salida igual o anterior a la entrada | Habitación válida, entrada futura y marcador único por variante | Enviar variantes con checkout=checkin y checkout anterior; comprobar rechazo y buscar sus marcadores; limpiar de forma segura cualquier persistencia inesperada sin ocultar el fallo | Rechazar ambos intervalos y no persistir reservas. Evita estancias de duración cero o negativa y disponibilidad incoherente. |

Se priorizan el solapamiento y la autorización por su impacto en la integridad de
reservas y el acceso a datos. La validación temporal amplía las validaciones de
entrada después del caso obligatorio ya automatizado.

## Tres skills adicionales propuestas y adopción

Estas skills se proponen para el equipo; no se implementaron como parte del alcance
mínimo. Se diferencian de la skill UI/API ya utilizada en la entrega.

| Skill y prioridad | Propósito y usuario | Entradas | Salidas | Verificación | Métrica de utilidad |
| --- | --- | --- | --- | --- | --- |
| diagnosticar-fallos-reservas — P1, primera a construir | Ayudar a QA y desarrolladores a distinguir un fallo del producto, del test, de datos compartidos o del entorno | Reporte y trace, logs, configuración sin secretos, revisión del código y contrato | Diagnóstico sustentado o hipótesis explícita, artefactos relevantes y siguiente comprobación | Cada conclusión referencia evidencia; contrastar el diagnóstico con una revisión humana y una reproducción cuando sea posible; no debilitar aserciones | Mediana del tiempo hasta un diagnóstico verificable y proporción de diagnósticos que una persona debe corregir |
| revisar-contrato-api — P1 | Ayudar a quienes mantienen clientes y tests a evitar expectativas sin respaldo | Documentación de Postman, aserciones y respuestas reales identificadas por ejecución | Tabla de diferencias, expectativas sin fuente y decisiones pendientes del contrato | Trazabilidad de cada hallazgo a documentación y observación; separar ausencia de documentación de incumplimiento | Diferencias detectadas antes de integrar cambios y proporción de falsos positivos |
| priorizar-cobertura-reservas — P2 | Ayudar al equipo QA a elegir la siguiente cobertura según riesgo | Requisitos, casos existentes, límites de la demo y riesgos conocidos | Casos adicionales priorizados y matriz de cobertura sin duplicados | Cada caso cubre un riesgo y un requisito; revisión del equipo de prioridades y alcance | Tiempo de planificación y proporción de propuestas aceptadas para el siguiente ciclo |

Construiría primero el diagnóstico porque la demo compartida y sus reinicios hacen
costoso distinguir errores del producto de problemas de datos o entorno. Para una
adopción inicial, QA registraría una línea base con los próximos cinco diagnósticos,
usaría la skill en los cinco siguientes y compararía mediana de tiempo y correcciones
humanas. Son un diseño de piloto y métricas propuestas, no resultados ya medidos.
Después se pilotaría la revisión de contrato en los próximos cambios de tests y la
priorización en una sesión de planificación, usando las métricas de la tabla. Se
mantendrían las skills solo si reducen trabajo sin aumentar conclusiones incorrectas.

La extracción de estadísticas del reporte, el conteo de archivos y la comprobación
de enlaces pertenecen a scripts deterministas. La autenticación y la preparación y
limpieza de datos reutilizables pertenecen a fixtures. Las skills guían la selección
de evidencias, interpretación, diagnóstico y priorización; no reemplazan las
aserciones ejecutables ni convierten una hipótesis en un resultado probado.

## Sustentación

En los 30 minutos previstos: explicar la separación POM/clientes/fixtures, mostrar
la parametrización, el aislamiento, las diferencias de contrato y el uso de la
skill; ejecutar con el agente una prueba existente y revisar el reporte. Para la
variación pequeña, cambiar un dato sintético del huésped manteniendo longitudes
válidas y las aserciones de identidad, volver a ejecutar y demostrar que creación,
consulta y limpieza siguen correspondiendo al mismo registro. Usar fechas explícitas
disponibles; no desactivar aserciones ante una interferencia de la demo. La variación
se describe para la sustentación y no se atribuye como ejecución ya realizada.

## Pendientes de la entrega completa

- Revisión humana funcional: pendiente de que el autor revise POM, aserciones,
  correlación del mismo registro y protección de datos ajenos. Las observaciones
  humanas sobre alcance y evidencias sí están registradas; no equivalen a esa revisión.
- Tiempo total invertido: pendiente de indicar por el autor. No se deduce de las
  horas de los commits ni se sustituye por las 4–5 horas esperadas en el enunciado.

La entrega incluye código, lockfile, configuración, skill previa, documentación y
evidencia de ejecución. El cierre técnico y la publicación se registran en el
documento de uso de IA. Repositorio:
[andreudev/prueba-quality-engineer](https://github.com/andreudev/prueba-quality-engineer).
