---
name: diagnosticar-fallos-reservas
description: Diagnostica fallos de reservas a partir de reportes Playwright, traces, respuestas y contrato; distingue producto, test, datos compartidos y entorno sin debilitar aserciones.
---

# Diagnosticar fallos de reservas

## Propósito y entradas

Recibe el caso y dataset fallidos, código ejecutado, comando y código de salida,
reporte, trace o log y contrato de referencia. Puede analizar un fallo histórico,
pero debe identificarlo como tal y no atribuirlo al código actual.

## Procedimiento

1. Lee el primer fallo y sus hooks de limpieza. Determina si hubo petición HTTP,
   creación o borrado antes del error. Distingue error del agente/MCP de respuesta
   de la aplicación. No ejecutes de nuevo una mutación hasta entender su propiedad.
2. Contrasta esperado y observado con el contrato revisado, el código y los datos.
   Clasifica como producto, test/configuración, datos compartidos, entorno/herramienta
   o causa aún no demostrada; toda clasificación necesita evidencia.
3. Ante posible reset o ID reutilizado, comprueba marcador e identidad antes de
   cualquier limpieza. Nunca elimines registros ajenos o supuestos restos generales.
4. Propón la comprobación mínima que discrimine causas. Usa Playwright MCP para
   investigar un control UI realmente afectado y Postman para lagunas de contrato,
   si sus conexiones están disponibles. No inventes snapshots ni respuestas.
5. Si hay una corrección autorizada del test, ejecútala y conserva antes/después.
   Si hay bug de producto, documenta pasos, datos sintéticos, esperado, observado,
   impacto y evidencia; no cambies la expectativa para que la demo pase.

## Salidas y verificación

Registra el diagnóstico en evidence/ai-usage.md; conserva adjuntos pertinentes en
evidence/failures y temporales en work/. Anonimiza tokens en la copia de entrega,
preservando el original localmente. La salida contiene hechos, hipótesis y siguiente
comprobación separados. El cierre de evidencias de la skill principal evita reportes
duplicados. La revisión del agente nunca se presenta como revisión humana.

## Errores y éxito

Si no hay evidencia suficiente, declara indeterminada la causa y especifica qué falta.
No agregues retries, esperas fijas, mocks ni códigos alternativos para aprobar.
Un diagnóstico correcto puede concluir con una prueba fallida por bug real.
Verifica esta skill con un fallo real; si la suite actual pasa, utiliza el fallo
histórico de evidence/failures/env-format.log y explica su alcance histórico.
