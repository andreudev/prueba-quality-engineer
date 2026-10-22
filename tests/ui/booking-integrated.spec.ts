import { randomUUID } from "node:crypto";

import { test, expect } from "../fixtures/api.fixture";
import { ReservationPage } from "../../src/pages/ReservationPage";
import { BookingConfirmationPage } from "../../src/pages/BookingConfirmationPage";
import type { CreateBookingRequest } from "../../src/types/booking";

let attempted: { data: CreateBookingRequest; id?: number } | undefined;

test.afterEach(async ({ bookingClient }, testInfo) => {
  const owned = attempted;
  attempted = undefined;
  if (!owned) return;

  // Recover by the unique marker if submitting or reading the response failed.
  if (owned.id === undefined) {
    const response = await bookingClient.listByRoom(owned.data.roomid);
    expect(response.status()).toBe(200);
    const list = await response.json();
    expect(list).toMatchObject({ bookings: expect.any(Array) });
    const matches = list.bookings.filter(
      (booking: { firstname?: string; lastname?: string }) =>
        booking.firstname === owned.data.firstname && booking.lastname === owned.data.lastname,
    );
    await testInfo.attach("recuperacion-limpieza", {
      body: JSON.stringify(matches, null, 2), contentType: "application/json",
    });
    expect(matches.length, "No eliminar si el marcador no identifica un único registro").toBeLessThanOrEqual(1);
    if (matches.length === 0) {
      testInfo.annotations.push({ type: "limpieza", description: "No se encontró una reserva con el marcador propio." });
      return;
    }
    owned.id = matches[0].bookingid;
  }

  expect(Number.isInteger(owned.id)).toBe(true);
  expect(owned.id).toBeGreaterThan(0);
  const id = owned.id!;
  const currentResponse = await bookingClient.getById(id);
  if (currentResponse.status() === 404) {
    testInfo.annotations.push({ type: "limpieza", description: `La reserva propia ${id} ya no existe.` });
    return;
  }
  expect(currentResponse.status()).toBe(200);
  const current = await currentResponse.json();
  // Stop before DELETE if another user/reset has replaced this ID.
  expect(current).toMatchObject({
    bookingid: id, roomid: owned.data.roomid,
    firstname: owned.data.firstname, lastname: owned.data.lastname,
    bookingdates: owned.data.bookingdates,
  });
  const deleted = await bookingClient.deleteById(id);
  expect(deleted.status()).toBe(202);
  const absent = await bookingClient.getById(id);
  expect(absent.status()).toBe(404);
  await testInfo.attach("limpieza-verificada", {
    body: JSON.stringify({ bookingid: id, firstname: current.firstname, lastname: current.lastname,
      roomid: current.roomid, bookingdates: current.bookingdates,
      deleteStatus: deleted.status(), getAfterDeleteStatus: absent.status() }, null, 2),
    contentType: "application/json",
  });
});

test("crear una reserva por UI y consultar exactamente la misma por API", async ({ page, bookingClient }, testInfo) => {
  const checkin = process.env.BOOKING_CHECKIN;
  const checkout = process.env.BOOKING_CHECKOUT;
  if (!checkin || !checkout) throw new Error("Define BOOKING_CHECKIN y BOOKING_CHECKOUT.");
  for (const date of [checkin, checkout]) {
    expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10)).toBe(date);
  }
  expect(checkin > new Date().toISOString().slice(0, 10)).toBe(true);
  expect(checkout > checkin).toBe(true);
  const marker = randomUUID().replaceAll("-", "").slice(0, 14);
  const data: CreateBookingRequest = {
    roomid: 3, firstname: `Ui${marker}`, lastname: "ReservaUi",
    depositpaid: false, email: `qa.${marker}@example.com`, phone: "07123456789",
    bookingdates: { checkin, checkout },
  };
  await testInfo.attach("datos-del-caso", {
    body: JSON.stringify(data, null, 2), contentType: "application/json",
  });

  const listResponse = await bookingClient.listByRoom(data.roomid);
  expect(listResponse.status()).toBe(200);
  const list = await listResponse.json();
  expect(list).toMatchObject({ bookings: expect.any(Array) });
  await testInfo.attach("disponibilidad-fechas-configuradas", {
    body: JSON.stringify({ roomid: data.roomid, bookingdates: data.bookingdates,
      occupied: list.bookings.map((booking: { bookingdates: unknown }) => booking.bookingdates) }, null, 2),
    contentType: "application/json",
  });
  for (const booking of list.bookings) {
    expect(booking).toMatchObject({ bookingdates: {
      checkin: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
      checkout: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
    } });
    expect(checkin < booking.bookingdates.checkout && checkout > booking.bookingdates.checkin,
      "Las fechas configuradas deben estar disponibles en la habitación 3").toBe(false);
  }

  const reservation = new ReservationPage(page);
  await reservation.open(data);
  await reservation.fillGuest(data);
  attempted = { data };
  const response = await reservation.submit(data);
  const created = await response.json();
  // Register ownership before any assertions or UI confirmation checks.
  if (Number.isInteger(created?.bookingid) && created.bookingid > 0) attempted.id = created.bookingid;
  await testInfo.attach("respuesta-creacion-ui", {
    body: JSON.stringify({ status: response.status(), body: created }, null, 2), contentType: "application/json",
  });
  expect(response.status()).toBe(201);
  expect(response.request().postDataJSON()).toMatchObject({ ...data });
  if (attempted.id === undefined) {
    const lookup = await bookingClient.listByRoom(data.roomid);
    expect(lookup.status()).toBe(200);
    const body = await lookup.json();
    expect(body).toMatchObject({ bookings: expect.any(Array) });
    const matches = body.bookings.filter(
      (booking: { firstname?: string; lastname?: string }) =>
        booking.firstname === data.firstname && booking.lastname === data.lastname,
    );
    expect(matches, "El marcador único debe identificar exactamente una reserva").toHaveLength(1);
    attempted.id = matches[0].bookingid;
  }
  const bookingId = attempted.id!;
  expect(Number.isInteger(bookingId)).toBe(true);
  expect(bookingId).toBeGreaterThan(0);

  const confirmation = new BookingConfirmationPage(page);
  await confirmation.expectConfirmed(data.bookingdates);
  await testInfo.attach("confirmacion-visible", { body: await page.screenshot({ fullPage: true }), contentType: "image/png" });

  const expected = { bookingid: bookingId, roomid: data.roomid,
    firstname: data.firstname, lastname: data.lastname, depositpaid: data.depositpaid,
    bookingdates: data.bookingdates };
  // The creation ID may be absent; the authenticated GET must expose it.
  expect(created).toMatchObject({ roomid: data.roomid, firstname: data.firstname,
    lastname: data.lastname, depositpaid: data.depositpaid, bookingdates: data.bookingdates });
  const getResponse = await bookingClient.getById(bookingId);
  expect(getResponse.status()).toBe(200);
  const persisted = await getResponse.json();
  await testInfo.attach("consulta-api-mismo-id", {
    body: JSON.stringify(persisted, null, 2), contentType: "application/json",
  });
  expect(persisted).toMatchObject(expected);
});
