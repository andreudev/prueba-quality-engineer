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

## Referencias

- [Configuración de Playwright MCP para Codex](https://playwright.dev/mcp/clients/other-clients)
- [Configuración de MCP en Codex](https://learn.chatgpt.com/docs/extend/mcp)
- [Snapshots de Playwright MCP](https://playwright.dev/mcp/snapshots)
