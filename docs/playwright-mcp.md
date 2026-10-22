# Playwright MCP para explorar la interfaz

La skill `booker-ui-api-tests` utiliza Playwright MCP para inspeccionar la
interfaz real antes de implementar el Page Object. La suite se ejecuta con
Playwright Test y consulta el backend real.

## Configuración en Windows

Se configuró Playwright MCP 0.0.83 con Node.js 24.18.0 mediante:

```powershell
codex mcp add playwright -- npx.cmd -y @playwright/mcp@0.0.83 --headless --isolated
codex mcp get playwright --json
```

El servidor usa transporte STDIO. `--headless` ejecuta el navegador en segundo
plano y `--isolated` mantiene su perfil en memoria durante la sesión.

Codex guarda la conexión en su configuración local; este archivo explica cómo
reproducirla en otro equipo. La dependencia se declara en
`.agents/skills/booker-ui-api-tests/agents/openai.yaml`.

## Activación en el chat

Si las herramientas no aparecen en el chat actual, abre la configuración de
Codex, entra en MCP servers y reinicia la conexión de `playwright`. Comprueba
los servidores conectados con `/mcp`.

Una entrada habilitada en la configuración no demuestra que la conexión del
chat ya esté activa. Para verificarla, usa las herramientas del servidor para
navegar a `https://automationintesting.online/` y obtener su snapshot.

## Uso durante la implementación

1. Inspeccionar la página con el MCP y registrar los elementos observados.
2. Volver a inspeccionar después de los cambios de página o de estado.
3. Convertir las observaciones en locators estables dentro del Page Object.
4. Ejecutar el escenario con Playwright Test y conservar el reporte.

Las referencias temporales de un snapshot no deben convertirse en selectores
persistentes de la prueba. La exploración del navegador no cuenta como una
prueba automatizada aprobada.

## Diagnóstico del rechazo de aprobación

Si una herramienta devuelve `MCP tool call requires approval, but approval policy
is never`, la llamada encontró una exigencia de aprobación que la política
activa de Codex no permite solicitar. Ese resultado no contiene un error HTTP
de la aplicación ni demuestra que el servidor Playwright esté desconectado.

La política general de aprobación y las reglas por herramienta MCP son ajustes
distintos. Consulta el perfil efectivo de la sesión y las reglas de la herramienta
concreta; una autorización para `browser_click` no establece la de
`browser_fill_form`. El archivo de configuración puede diferir del perfil activo
de una sesión. La [referencia oficial de configuración](https://learn.chatgpt.com/docs/config-file/config-reference)
describe `approval_policy` y `mcp_servers.<id>.tools.<tool>.approval_mode`.

El 2026-10-22 se repitieron las llamadas antes rechazadas y funcionaron
`browser_evaluate` y `browser_fill_form`. También se completó por MCP una reserva
con confirmación visible y se verificó y limpió el mismo ID mediante
`BookingClient`. El perfil de permisos suministrado a esa sesión era diferente
del de la ejecución anterior. El agente no modificó la configuración global,
no reinstaló MCP y no cambió locators para resolver el rechazo.

Esto demuestra que el rechazo ya no se reproduce en esa sesión; no identifica
qué ajuste interno del cliente cambió la decisión de autorización. No es necesario
dar por fallida una prueba de la aplicación por un rechazo previo a ejecutar la
herramienta. Conserva ambos resultados por separado y verifica el flujo real.

La [confirmación MCP](../evidence/exploration/confirmation.yml) y su
[consulta y limpieza API](../evidence/exploration/mcp-api-cleanup.json) conservan
el resultado de esa repetición. La invocación y los resultados se documentan en
[ai-usage.md](../evidence/ai-usage.md). Solo se versiona la selección necesaria
para la entrega; los auxiliares y reportes repetidos se conservan fuera de Git.

## Referencias

- [Configuración de Playwright MCP para Codex](https://playwright.dev/mcp/clients/other-clients)
- [Configuración de MCP en Codex](https://learn.chatgpt.com/docs/extend/mcp)
- [Snapshots de Playwright MCP](https://playwright.dev/mcp/snapshots)
