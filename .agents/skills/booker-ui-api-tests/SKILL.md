---
name: booker-ui-api-tests
description: Implementa pruebas de reservas UI y API con TypeScript y Playwright en Restful Booker Platform, siguiendo las convenciones y fixtures de este proyecto.
---

# Pruebas de reservas UI y API

## Propósito

Implementar escenarios que creen una reserva mediante la interfaz,
comprueben su confirmación y consulten por API exactamente el mismo registro.

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

## Exploración con Playwright MCP

- Usa el servidor MCP `playwright` para explorar la interfaz antes de escribir
  o cambiar el Page Object. Comprueba que sus herramientas estén disponibles.
- Navega a la URL del entorno y obtén un snapshot de accesibilidad actual.
- Identifica roles, nombres accesibles, etiquetas y atributos realmente
  observados. Vuelve a obtener el estado después de navegar o cambiar la página.
- Utiliza las referencias temporales del snapshot para explorar. En el código
  de las pruebas escribe locators estables basados en los elementos observados.
- Guarda la URL y la evidencia de exploración en `evidence`. Distingue una
  observación real de una expectativa o una hipótesis.
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

## Salidas

- Page Objects en `src/pages` y prueba integrada en `tests/ui`.
- Cambios necesarios en clientes, tipos o fixtures existentes.
- Reporte de Playwright y evidencia del uso de IA en `evidence/ai-usage.md`.
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
