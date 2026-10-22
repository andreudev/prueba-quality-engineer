---
name: booker-ui-api-tests
description: Implementa pruebas de reservas UI y API con TypeScript y Playwright en Restful Booker Platform y prepara sus evidencias de entrega sin acumular archivos intermedios en Git.
---

# Pruebas de reservas UI y API

## Propósito

Implementar escenarios que creen una reserva mediante la interfaz,
comprueben su confirmación y consulten por API exactamente el mismo registro.
El agente también ejecuta la selección, organización y validación de evidencias
al terminar el trabajo; no delega esa gestión al usuario ni se limita a recomendarla.

## Entradas

- Escenario solicitado y criterios de aceptación.
- BASE_URL, BOOKING_CHECKIN y BOOKING_CHECKOUT del entorno.
- Datos sintéticos del huésped.
- Configuración, tipos, clientes y fixtures existentes.
- Conexión al servidor MCP `playwright`, descrita en la
  [configuración del proyecto](../../../docs/playwright-mcp.md).
- Documentación de API:
  https://www.postman.com/automation-in-testing/restful-booker-collections/documentation/ci13ds3/restful-booker-platform

## Preparación

1. Comprueba que esta skill está guardada en un commit anterior
   a la implementación del escenario.
2. Lee la configuración y las implementaciones existentes.
3. Define las expectativas a partir de la documentación.
   Distingue contrato documentado, comportamiento observado y supuestos.
4. Inspecciona la interfaz actual antes de elegir locators.
5. Consulta la disponibilidad de la habitación para las fechas configuradas.
6. Revisa la evidencia existente y `.gitignore`. Identifica la ejecución seleccionada,
   los fallos pendientes y el directorio local de trabajo antes de generar archivos.

## Coordinación de skills del proyecto

- Ejecuta [revisar-contrato-api](../revisar-contrato-api/SKILL.md) antes de fijar las
  expectativas API y [priorizar-cobertura-reservas](../priorizar-cobertura-reservas/SKILL.md)
  para relacionar requisitos, riesgos, prioridades y datasets con la cobertura real.
- Invoca [diagnosticar-fallos-reservas](../diagnosticar-fallos-reservas/SKILL.md) ante
  fallos. Si la ampliación exige demostrar su uso y todo pasa, analiza el fallo
  histórico de `.env` y etiquétalo como histórico; no provoques un fallo artificial.
- Usa las conexiones de [.codex/config.toml](../../../.codex/config.toml) al abrir
  este repositorio. La presencia de un MCP global o plugin conectado no demuestra
  que la conexión del proyecto esté autenticada. Conserva los registros globales.
- Registra las invocaciones reales y sus salidas en el documento único de uso de IA.
  Guarda estas skills en un commit anterior a usarlas para implementar la ampliación.
- Si se solicitan los tres casos adicionales, parametriza cada uno con dos datasets
  explícitos, registra prioridad y riesgo, y mantén la fixture de propiedad por test.

## Exploración con Playwright MCP

- Usa el servidor MCP `playwright` para explorar la interfaz antes de escribir
  o cambiar el Page Object. Comprueba que sus herramientas estén disponibles.
- Navega a la URL del entorno y obtén un snapshot de accesibilidad actual.
- Identifica roles, nombres accesibles, etiquetas y atributos realmente
  observados. Vuelve a obtener el estado después de navegar o cambiar la página.
- Utiliza las referencias temporales del snapshot para explorar. En el código
  de las pruebas escribe locators estables basados en los elementos observados.
- Conserva en `evidence/exploration` solo los snapshots necesarios para justificar
  el formulario y los locators. Reutiliza nombres por etapa; guarda las observaciones
  intermedias en `work/`. Distingue observación, expectativa e hipótesis.
- Verifica cada locator y la confirmación de reserva ejecutando Playwright Test
  contra el backend real, sin sustituir sus respuestas por mocks.
- Si Playwright MCP no está conectado o un elemento no se puede inspeccionar,
  registra la limitación y resuelve esa conexión u observación antes de
  implementar la interacción. No inventes selectores, respuestas ni resultados.

## Convenciones

- Usa TypeScript y Playwright Test contra el backend real.
- Mantén las interacciones UI en Page Objects dentro de src/pages.
- Mantén las peticiones HTTP en clientes dentro de src/api.
- Reutiliza las fixtures existentes para autenticación y contexto.
- Usa locators por rol, etiqueta o identificador estable.
- Usa aserciones con espera automática para la interfaz.
- Evita esperas fijas y dependencias entre pruebas.
- Usa un marcador sintético único por ejecución.
- Mantén las fechas configurables; no añadas un buscador automático de fechas.

## Implementación

1. Crea o adapta el Page Object necesario.
2. Completa la reserva mediante la UI y comprueba la confirmación.
3. Obtén el ID de la respuesta real de creación.
   Si no está disponible, busca por el marcador único y exige
   exactamente una coincidencia.
4. Consulta ese ID mediante BookingClient.
5. Comprueba identidad, habitación, fechas, nombre y apellido,
   y los demás datos de negocio que exponga el contrato.
6. Registra el identificador para limpiar el registro propio
   incluso si falla una aserción.
7. Antes de eliminar, comprueba que el registro conserva el marcador propio.
8. Comprueba la eliminación y conserva cualquier fallo de limpieza.

## Verificación

- Ejecuta los comandos desde la raíz del repositorio.
- Si faltan las dependencias, instálalas con `npm ci`.
- Ejecuta `npm run typecheck`.
- Ejecuta el escenario UI con
  `npx playwright test tests/ui --project=chromium --workers=2`.
- Ejecuta la suite completa con
  `npx playwright test tests/api tests/ui --project=chromium --workers=2`.
- Comprueba en la salida que la suite completa realmente usa dos workers;
  configurar el límite no demuestra por sí solo la concurrencia.
- Conserva el reporte de Playwright y las evidencias pertinentes.
- Registra los comandos y sus códigos de salida.
- Antes de que otro comando sobrescriba las salidas habituales, conserva los adjuntos
  de cualquier fallo relevante. Al acabar la verificación, ejecuta el cierre de abajo.

## Cierre obligatorio de evidencias por el agente

Ejecuta estos pasos como parte de cada implementación o adaptación realizada con
esta skill. No dejes la organización como una tarea posterior para el usuario.
La revisión funcional humana se registra por separado y puede seguir pendiente.

1. Reúne los resultados reales, comandos y códigos de salida. Identifica qué versión
   del código se ejecutó mediante commit y, si hay cambios sin commit, huellas de los
   archivos relevantes. Un reporte anterior no acredita cambios posteriores.
2. Prepara una selección en `work/`: un reporte HTML completo con todos sus recursos,
   un resumen y la evidencia mínima que permita revisar el caso. Reutiliza nombres
   de trabajo; no crees una carpeta versionada por cada intento. El resumen registra
   fecha, código ejecutado, casos, workers reales, comandos, códigos y revisión humana.
   Consolida en un JSON los datos de creación UI, consulta del mismo ID y limpieza
   si el reporte por sí solo dificulta esa revisión. No dupliques sus adjuntos.
3. Selecciona los snapshots que justifican el formulario y los locators para
   `evidence/exploration`. Conserva los fallos relevantes en `evidence/failures`, con
   diagnóstico, corrección y adjuntos necesarios. Un fallo pendiente no desaparece
   por seleccionar otro resultado aprobado. Si la última ejecución falla, registra
   ese resultado; no presentes una ejecución anterior como éxito del cambio actual.
4. Comprueba que la selección se puede revisar antes de sustituir la entrega actual.
   Archiva localmente la selección anterior y los intermedios fuera del repositorio
   y verifica su integridad. Antes de mover directorios, resuelve y valida las rutas
   absolutas de origen y destino. No borres originales como paso de limpieza.
   Publica la nueva selección en `evidence/final`; las ejecuciones habituales no
   escriben directamente allí ni reemplazan la entrega mientras están corriendo.
5. Actualiza `evidence/ai-usage.md` y los enlaces del README con la invocación, cambios,
   ejecuciones, fallos y correcciones realmente realizados. Distingue las correcciones
   del agente de las humanas y señala los requisitos del documento aún pendientes.
6. Verifica todos los enlaces locales de entrega, los recursos del reporte y la
   coincidencia del ID de la reserva entre creación, consulta y limpieza. Comprueba
   que los archivos del código ejecutado no cambiaron después de la ejecución.
7. Revisa `.gitignore` y `git status --short`: la selección debe poder versionarse;
   `playwright-report/`, `test-results/`, `work/`, secretos y auxiliares deben quedar
   fuera. Limita la entrega a lo exigido por la prueba técnica y elimina de la
   selección las copias redundantes, conservando su archivo local. No uses
   `git add .` sin revisar qué archivos se incorporarían.
   Revisa también los adjuntos: un trace puede contener tokens aunque `.env` esté
   ignorado. Anonimiza esos valores en la copia de entrega, conserva el original
   localmente y documenta la modificación sin ocultar el fallo que demuestra.
8. Informa del resultado, ubicación del reporte, número y tamaño de los archivos
   seleccionados y pendientes. Si la organización o su validación falla, registra
   la limitación y conserva los originales; no declares completado el cierre.

## Salidas

- Page Objects en `src/pages` y prueba integrada en `tests/ui`.
- Cambios necesarios en clientes, tipos o fixtures existentes.
- Reporte de Playwright y evidencia del uso de IA en `evidence/ai-usage.md`.
- Selección de entrega organizada y validada por el agente en `evidence/final`,
  `evidence/exploration` y `evidence/failures`, con intermedios archivados fuera de Git.
- Resumen de resultados, diferencias de contrato y pendientes.

## Evidencia del uso de IA

Documenta en evidence/ai-usage.md:

- Invocación exacta y commit previo de la skill.
- Archivos creados o modificados por el agente.
- Comandos, resultados y fallos observados.
- Revisión humana y correcciones realmente realizadas, con su motivo.
- Limitaciones y pendientes.

No inventes correcciones humanas ni declares aprobadas pruebas no ejecutadas.

## Errores e información insuficiente

- Inspecciona primero configuración, documentación y respuestas reales.
- Si falta una entrada indispensable, identifica cuál es.
- Si hay diferencias entre contrato y comportamiento, conserva evidencia
  y descríbelas antes de modificar expectativas.
- Si no hay disponibilidad o la demo falla, registra la causa.
- No elimines aserciones, aceptes varios códigos alternativos ni añadas
  reintentos para convertir un fallo en aprobado.

## Criterios de éxito

- La reserva se crea mediante UI y tiene confirmación visible.
- La consulta API corresponde al mismo registro y sus datos coinciden.
- TypeScript y las pruebas requeridas finalizan con código 0.
- La suite demuestra ejecución real con dos workers.
- Los datos propios se limpian o se documenta el fallo.
- La evidencia permite revisar la implementación y sus limitaciones.
- El agente completó el cierre de evidencias: reporte íntegro, enlaces válidos,
  código ejecutado identificado, fallos conservados y entrega sin copias redundantes.
