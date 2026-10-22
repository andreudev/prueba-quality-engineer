---
name: revisar-contrato-api
description: Contrasta el contrato de reservas en Postman con los clientes, datasets y aserciones de este proyecto antes de implementar o revisar pruebas API.
---

# Revisar contrato de reservas

## Propósito y entradas

Evitar expectativas inventadas. Recibe escenarios y riesgos solicitados, clientes
de src/api, tipos, tests, datasets y la conexión Postman de
[la configuración del proyecto](../../../.codex/config.toml).
Colección pública: 92957-55c5fdaf-6595-4ecd-a3f8-baf4d814e872.

## Procedimiento

1. Comprueba la conexión y herramientas reales de `postman`. Usa getEnabledTools
   y getAuthenticatedUser cuando estén expuestos. Un plugin global operativo no
   acredita por sí solo la conexión configurada en el proyecto.
2. Consulta getCollection y los detalles de las solicitudes relevantes mediante
   getCollectionRequest. Usa búsqueda solo si hace falta localizar el recurso.
   Las herramientas deben proceder de la conexión que se está verificando.
3. Contrasta rutas, métodos, cookies, payload y respuestas documentadas con los
   clientes y aserciones. Conserva el UID y la fecha de consulta de la fuente.
4. Separa en la salida contrato documentado, referencia de implementación,
   comportamiento ejecutado y supuestos. Si no hay ejemplos de respuesta, no
   atribuyas sus códigos a Postman. El repositorio oficial puede complementar
   expectativas, sin demostrar qué versión está desplegada.
5. Antes de ejecutar, fija una expectativa justificada por caso; no la adaptes
   después para aprobar un comportamiento incompatible. Las pruebas siguen en
   Playwright Test y usan el backend real; no se ejecutan colecciones como sustituto.

## Salidas y verificación

Actualiza la sección de contrato de evidence/ai-usage.md con escenario, fuente,
expectativa, diferencia y decisión. Usa work/ para la lectura intermedia; conserva
un único extracto útil en evidence/postman-contract.json. No dupliques colecciones.
Cada expectativa debe ser trazable y cada resultado ejecutado debe citar su run.
Mantén los clientes separados de los tests y reutiliza las fixtures de autenticación.

## Errores y límites

Si falta OAuth, distingue configuración de conexión probada y solicita el inicio
de sesión del propietario sin pedir secretos por chat. No presentes el extracto
local como una nueva consulta en vivo. Registra HTTP 401, falta de permisos o
documentación insuficiente sin inventar resultados. No modifiques colecciones,
workspaces, entornos ni ejemplos de terceros.
