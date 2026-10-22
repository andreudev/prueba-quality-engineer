---
name: priorizar-cobertura-reservas
description: Relaciona los requisitos, riesgos y datasets de reservas con la cobertura Playwright existente y prioriza ampliaciones solicitadas sin añadir casos por iniciativa propia.
---

# Priorizar cobertura de reservas

## Propósito y entradas

Recibe los requisitos de la prueba técnica, la ampliación autorizada, tests actuales,
datasets editables y contrato revisado. La primera versión solo exigía proponer tres
casos adicionales; su automatización y estas skills son una ampliación del usuario.

## Procedimiento

1. Lista los tests existentes y sus conjuntos de datos. Distingue escenarios de
   negocio de variantes ejecutables para no inflar la cobertura reportada.
2. Construye una matriz requisito → riesgo → escenario → dataset → prioridad → test.
   Para este alcance: P1 doble reserva, P1 eliminación no autorizada y P2 fechas
   inválidas; cada escenario nuevo tiene dos variantes explícitas e independientes.
3. Comprueba que las ventanas válidas de datos propios no compiten entre tests
   concurrentes. No busques fechas automáticamente ni corrijas las fechas inválidas
   que un test negativo debe enviar deliberadamente al backend.
4. Propón solo correcciones de cobertura necesarias para el alcance autorizado.
   Mantén los Page Objects en src/pages, clientes en src/api y datos/preparación
   reutilizables en fixtures. Un caso no ejecutado no cuenta como aprobado.
5. Verifica la matriz con el listado de Playwright y los resultados; dos workers
   configurados no demuestran dos workers efectivamente usados.

## Salidas y éxito

Actualiza la matriz del README y la sección de uso de esta skill en
evidence/ai-usage.md. Trabaja en work/ para listas temporales, sin generar un
reporte por variante. La salida identifica cubierto, fallido o pendiente con una
fuente verificable, sin duplicados ni afirmaciones de aprobación sin ejecución.

## Errores y límites

Si faltan riesgos o criterios, registra el supuesto y su impacto antes de ampliar.
Si una fecha explícita no está disponible, conserva el fallo y el dataset; no lo
sustituyas por otro al azar. No alteres prioridades para ocultar una prueba fallida.
La priorización es una decisión guiada; enumerar tests y contar archivos corresponde
a scripts, y autenticar y limpiar datos corresponde a fixtures.
