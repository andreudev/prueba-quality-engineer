# Incidencias de la demo pública — 24 de octubre de 2026

La revisión previa a la entrega ejecutó diez pruebas en Chromium, con dos workers
concurrentes y sin reintentos: **3 aprobadas, 7 fallidas, código de salida 1**.
La suite comenzó a las **06:14:10 UTC / 01:14:10 en Colombia** y duró 29,4 s.
El código corresponde a `3b35be0`, con el formato local previo del archivo de datos
identificado por su huella. No se modificaron aserciones, fechas ni rutas.

## DEMO-01 — Error 500 en consultas por ID y formulario inaccesible

- **Prioridad:** P1. Bloquea el recorrido principal y la limpieza verificable.
- **Entorno:** https://automationintesting.online; backend real.
- **Precondición:** autenticación de demostración; no requiere crear una reserva
  para reproducir las consultas a los registros iniciales.
- **Pasos:** autenticar con POST `/api/auth/login`; consultar GET
  `/api/booking/1` y GET `/api/room/3`; abrir
  `/reservation/3?checkin=2027-03-10&checkout=2027-03-12`.
- **Esperado:** consultas 200 para registros existentes y formulario con
  encabezado «Book This Room». La consulta forma parte del contrato y ya se
  había ejecutado satisfactoriamente; no se atribuyen ejemplos inexistentes a Postman.
- **Observado:** login 200; consultas por ID 500, cuerpo «Internal Server Error»;
  el encabezado del formulario no aparece. Los listados autenticados por habitación
  sí devolvieron 200. También devolvieron 500 los intentos de DELETE sin token y
  con token inválido, frente al 403 esperado por los casos.
- **Impacto:** impide comprobar la reserva recién creada y la permanencia tras
  el intento no autorizado. La comprobación previa al borrado también falla;
  la protección detiene el DELETE.
- **Verificación independiente:** las consultas a la reserva inicial 1 y a la
  habitación 3 volvieron a devolver 500 a las 06:22:08 UTC.
- **Causa interna:** no determinada. No se atribuye a un despliegue, un reset,
  una versión concreta ni un componente interno sin evidencia.

## DEMO-02 — Una creación responde 409 pero deja el registro persistido

- **Prioridad:** P1. Inconsistencia entre respuesta y efecto de la creación.
- **Precondición:** ventanas comprobadas como disponibles para preparar las
  reservas originales de SOL-01 y SOL-02.
- **Pasos:** enviar POST `/api/booking` con los datos originales válidos;
  observar respuesta; consultar GET `/api/booking?roomid=1` o `roomid=2` y
  buscar el marcador exacto del intento.
- **Datos:** SOL-01, habitación 1, 2027-03-16 → 2027-03-20;
  SOL-02, habitación 2, 2027-03-23 → 2027-03-27.
- **Esperado:** creación válida 201. Un rechazo no debería dejar una reserva creada.
- **Observado:** ambas creaciones originales devolvieron 409 con
  `{"error":"Failed to create booking"}`; el listado posterior contenía:

| Caso | ID observado | Marcador | Efecto |
| --- | --- | --- | --- |
| SOL-01 | 4 | Exbce848bdcede4b | Original persistida pese a respuesta 409 |
| SOL-02 | 5 | Ex06702881a89f4f | Original persistida pese a respuesta 409 |

No se alcanzó el segundo POST del solapamiento deliberado. El fallo no corresponde
al 409 esperado para el candidato: ocurrió al preparar la original.

## Limpieza y comprobación posterior

Durante la suite falló la limpieza segura: GET por ID devolvía 500 y el código
no continuó con DELETE sin verificar identidad.
En la comprobación autenticada posterior ya no aparecieron los ocho marcadores
consultados: los dos negativos de fechas y los seis registros/intentos propios de
SOL, éxitos API y autorización. **No se ejecutó DELETE en esa comprobación.**
La ausencia posterior no se atribuye a un reset ni prueba que el teardown funcionó.
El intento UI falló antes de enviar una reserva y no requirió borrado.

La aprobación de los negativos de fechas refleja sus aserciones de estado y
ausencia. Dado el mensaje genérico y las incidencias concurrentes, no demuestra
por sí sola que el entorno esté sano ni toda la semántica de validación temporal.

## Evidencia y siguientes comprobaciones

- [Diagnóstico estructurado y comprobación de marcadores](diagnosis.json).
- [Reporte HTML completo actual](../../final/report/index.html): errores, adjuntos,
  captura, vídeo y traces de cada prueba fallida.
- [Log y código de salida](../../final/suite.log).
- [Resumen, versión y huellas](../../final/summary.json).
- [Intento UI actual](../../final/reservation.json).
- [Reporte aprobado histórico](https://github.com/andreudev/prueba-quality-engineer/blob/3b35be02197e378cdc42d7d50a33770ddd1e840f/evidence/final/report/index.html).

Las copias entregables de traces se anonimizaron, conservando sus nombres y
relaciones de recursos. Los originales íntegros de esta ejecución y la selección
anterior verificada permanecen fuera de Git. No se publica el token de la sesión.

**Pendiente externo:** recuperar consultas por ID y formulario; después ejecutar
nuevamente la suite con datos explícitos y comprobar la limpieza. No se añadieron
retries, sleeps, búsqueda automática de fechas ni expectativas alternativas.
