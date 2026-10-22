# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ui\booking-integrated.spec.ts >> crear una reserva por UI y consultar exactamente la misma por API
- Location: tests\ui\booking-integrated.spec.ts:64:5

# Error details

```
Error: expect(received).toMatch(expected)

Expected pattern: /^\d{4}-\d{2}-\d{2}$/
Received string:  "\"2026-11-12\"BASE_URL=https://automationintesting.online"
```

# Test source

```ts
  1   | import { randomUUID } from "node:crypto";
  2   |
  3   | import { test, expect } from "../fixtures/api.fixture";
  4   | import { ReservationPage } from "../../src/pages/ReservationPage";
  5   | import { BookingConfirmationPage } from "../../src/pages/BookingConfirmationPage";
  6   | import type { CreateBookingRequest } from "../../src/types/booking";
  7   |
  8   | let attempted: { data: CreateBookingRequest; id?: number } | undefined;
  9   |
  10  | test.afterEach(async ({ bookingClient }, testInfo) => {
  11  |   const owned = attempted;
  12  |   attempted = undefined;
  13  |   if (!owned) return;
  14  |
  15  |   // Recover by the unique marker if submitting or reading the response failed.
  16  |   if (owned.id === undefined) {
  17  |     const response = await bookingClient.listByRoom(owned.data.roomid);
  18  |     expect(response.status()).toBe(200);
  19  |     const list = await response.json();
  20  |     expect(list).toMatchObject({ bookings: expect.any(Array) });
  21  |     const matches = list.bookings.filter(
  22  |       (booking: { firstname?: string; lastname?: string }) =>
  23  |         booking.firstname === owned.data.firstname && booking.lastname === owned.data.lastname,
  24  |     );
  25  |     await testInfo.attach("recuperacion-limpieza", {
  26  |       body: JSON.stringify(matches, null, 2), contentType: "application/json",
  27  |     });
  28  |     expect(matches.length, "No eliminar si el marcador no identifica un único registro").toBeLessThanOrEqual(1);
  29  |     if (matches.length === 0) {
  30  |       testInfo.annotations.push({ type: "limpieza", description: "No se encontró una reserva con el marcador propio." });
  31  |       return;
  32  |     }
  33  |     owned.id = matches[0].bookingid;
  34  |   }
  35  |
  36  |   expect(Number.isInteger(owned.id)).toBe(true);
  37  |   expect(owned.id).toBeGreaterThan(0);
  38  |   const id = owned.id!;
  39  |   const currentResponse = await bookingClient.getById(id);
  40  |   if (currentResponse.status() === 404) {
  41  |     testInfo.annotations.push({ type: "limpieza", description: `La reserva propia ${id} ya no existe.` });
  42  |     return;
  43  |   }
  44  |   expect(currentResponse.status()).toBe(200);
  45  |   const current = await currentResponse.json();
  46  |   // Stop before DELETE if another user/reset has replaced this ID.
  47  |   expect(current).toMatchObject({
  48  |     bookingid: id, roomid: owned.data.roomid,
  49  |     firstname: owned.data.firstname, lastname: owned.data.lastname,
  50  |     bookingdates: owned.data.bookingdates,
  51  |   });
  52  |   const deleted = await bookingClient.deleteById(id);
  53  |   expect(deleted.status()).toBe(202);
  54  |   const absent = await bookingClient.getById(id);
  55  |   expect(absent.status()).toBe(404);
  56  |   await testInfo.attach("limpieza-verificada", {
  57  |     body: JSON.stringify({ bookingid: id, firstname: current.firstname, lastname: current.lastname,
  58  |       roomid: current.roomid, bookingdates: current.bookingdates,
  59  |       deleteStatus: deleted.status(), getAfterDeleteStatus: absent.status() }, null, 2),
  60  |     contentType: "application/json",
  61  |   });
  62  | });
  63  |
  64  | test("crear una reserva por UI y consultar exactamente la misma por API", async ({ page, bookingClient }, testInfo) => {
  65  |   const checkin = process.env.BOOKING_CHECKIN;
  66  |   const checkout = process.env.BOOKING_CHECKOUT;
  67  |   if (!checkin || !checkout) throw new Error("Define BOOKING_CHECKIN y BOOKING_CHECKOUT.");
  68  |   for (const date of [checkin, checkout]) {
> 69  |     expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      |                  ^ Error: expect(received).toMatch(expected)
  70  |     expect(new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10)).toBe(date);
  71  |   }
  72  |   expect(checkin > new Date().toISOString().slice(0, 10)).toBe(true);
  73  |   expect(checkout > checkin).toBe(true);
  74  |   const marker = randomUUID().replaceAll("-", "").slice(0, 14);
  75  |   const data: CreateBookingRequest = {
  76  |     roomid: 3, firstname: `Ui${marker}`, lastname: "ReservaUi",
  77  |     depositpaid: false, email: `qa.${marker}@example.com`, phone: "07123456789",
  78  |     bookingdates: { checkin, checkout },
  79  |   };
  80  |   await testInfo.attach("datos-del-caso", {
  81  |     body: JSON.stringify(data, null, 2), contentType: "application/json",
  82  |   });
  83  |
  84  |   const listResponse = await bookingClient.listByRoom(data.roomid);
  85  |   expect(listResponse.status()).toBe(200);
  86  |   const list = await listResponse.json();
  87  |   expect(list).toMatchObject({ bookings: expect.any(Array) });
  88  |   await testInfo.attach("disponibilidad-fechas-configuradas", {
  89  |     body: JSON.stringify({ roomid: data.roomid, bookingdates: data.bookingdates,
  90  |       occupied: list.bookings.map((booking: { bookingdates: unknown }) => booking.bookingdates) }, null, 2),
  91  |     contentType: "application/json",
  92  |   });
  93  |   for (const booking of list.bookings) {
  94  |     expect(booking).toMatchObject({ bookingdates: {
  95  |       checkin: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
  96  |       checkout: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
  97  |     } });
  98  |     expect(checkin < booking.bookingdates.checkout && checkout > booking.bookingdates.checkin,
  99  |       "Las fechas configuradas deben estar disponibles en la habitación 3").toBe(false);
  100 |   }
  101 |
  102 |   const reservation = new ReservationPage(page);
  103 |   await reservation.open(data);
  104 |   await reservation.fillGuest(data);
  105 |   attempted = { data };
  106 |   const response = await reservation.submit(data);
  107 |   const created = await response.json();
  108 |   // Register ownership before any assertions or UI confirmation checks.
  109 |   if (Number.isInteger(created?.bookingid) && created.bookingid > 0) attempted.id = created.bookingid;
  110 |   await testInfo.attach("respuesta-creacion-ui", {
  111 |     body: JSON.stringify({ status: response.status(), body: created }, null, 2), contentType: "application/json",
  112 |   });
  113 |   expect(response.status()).toBe(201);
  114 |   expect(response.request().postDataJSON()).toMatchObject({ ...data });
  115 |   if (attempted.id === undefined) {
  116 |     const lookup = await bookingClient.listByRoom(data.roomid);
  117 |     expect(lookup.status()).toBe(200);
  118 |     const body = await lookup.json();
  119 |     expect(body).toMatchObject({ bookings: expect.any(Array) });
  120 |     const matches = body.bookings.filter(
  121 |       (booking: { firstname?: string; lastname?: string }) =>
  122 |         booking.firstname === data.firstname && booking.lastname === data.lastname,
  123 |     );
  124 |     expect(matches, "El marcador único debe identificar exactamente una reserva").toHaveLength(1);
  125 |     attempted.id = matches[0].bookingid;
  126 |   }
  127 |   const bookingId = attempted.id!;
  128 |   expect(Number.isInteger(bookingId)).toBe(true);
  129 |   expect(bookingId).toBeGreaterThan(0);
  130 |
  131 |   const confirmation = new BookingConfirmationPage(page);
  132 |   await confirmation.expectConfirmed(data.bookingdates);
  133 |   await testInfo.attach("confirmacion-visible", { body: await page.screenshot({ fullPage: true }), contentType: "image/png" });
  134 |
  135 |   const expected = { bookingid: bookingId, roomid: data.roomid,
  136 |     firstname: data.firstname, lastname: data.lastname, depositpaid: data.depositpaid,
  137 |     bookingdates: data.bookingdates };
  138 |   // The creation ID may be absent; the authenticated GET must expose it.
  139 |   expect(created).toMatchObject({ roomid: data.roomid, firstname: data.firstname,
  140 |     lastname: data.lastname, depositpaid: data.depositpaid, bookingdates: data.bookingdates });
  141 |   const getResponse = await bookingClient.getById(bookingId);
  142 |   expect(getResponse.status()).toBe(200);
  143 |   const persisted = await getResponse.json();
  144 |   await testInfo.attach("consulta-api-mismo-id", {
  145 |     body: JSON.stringify(persisted, null, 2), contentType: "application/json",
  146 |   });
  147 |   expect(persisted).toMatchObject(expected);
  148 | });
  149 |
```