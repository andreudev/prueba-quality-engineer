import { randomUUID } from "node:crypto";

import { test, expect } from "../fixtures/api.fixture";
import type { CreateBookingRequest } from "../../src/types/booking";

let attemptedBooking:
  | {
      roomid: number;
      lastname: string;
    }
  | undefined;

test.afterEach(async ({ bookingClient }, testInfo) => {
  const attempted = attemptedBooking;
  attemptedBooking = undefined;

  if (!attempted) {
    return;
  }

  const listResponse = await bookingClient.listByRoom(attempted.roomid);
  expect(listResponse.status()).toBe(200);

  const list = await listResponse.json();
  expect(list).toMatchObject({ bookings: expect.any(Array) });

  const unexpectedBookings = list.bookings.filter(
    (booking: { lastname?: string }) => booking.lastname === attempted.lastname,
  );

  await testInfo.attach("reservas-con-marcador-negativo", {
    body: JSON.stringify(unexpectedBookings, null, 2),
    contentType: "application/json",
  });

  // Registra el fallo y permite limpiar si el servicio creó una reserva.
  expect
    .soft(unexpectedBookings, "La petición rechazada no debe guardar una reserva.")
    .toHaveLength(0);

  for (const booking of unexpectedBookings) {
    expect(Number.isInteger(booking.bookingid)).toBe(true);
    expect(booking.bookingid).toBeGreaterThan(0);

    const currentResponse = await bookingClient.getById(booking.bookingid);
    expect(currentResponse.status()).toBe(200);

    const current = await currentResponse.json();

    // Verificar propiedad antes de eliminar.
    expect(current).toMatchObject({
      roomid: attempted.roomid,
      lastname: attempted.lastname,
    });

    const deleteResponse = await bookingClient.deleteById(booking.bookingid);
    expect(deleteResponse.status()).toBe(202);

    const deletedResponse = await bookingClient.getById(booking.bookingid);
    expect(deletedResponse.status()).toBe(404);
  }
});

test("rechazar un nombre vacío sin guardar la reserva", async ({ bookingClient }, testInfo) => {
  const checkin = process.env.BOOKING_CHECKIN;
  const checkout = process.env.BOOKING_CHECKOUT;

  if (!checkin || !checkout) {
    throw new Error("Define BOOKING_CHECKIN y BOOKING_CHECKOUT.");
  }

  expect(checkin).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  expect(checkout).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  expect(checkin > new Date().toISOString().slice(0, 10)).toBe(true);
  expect(checkout > checkin).toBe(true);

  const data: CreateBookingRequest = {
    roomid: 1,
    firstname: "",
    lastname: `NegativoQa${randomUUID().replaceAll("-", "").slice(0, 12)}`,
    depositpaid: false,
    email: "qa.negativo@example.com",
    phone: "07123456789",
    bookingdates: { checkin, checkout },
  };

  attemptedBooking = {
    roomid: data.roomid,
    lastname: data.lastname,
  };

  const response = await bookingClient.create(data);

  await testInfo.attach("respuesta-negativa", {
    body: await response.body(),
    contentType: response.headers()["content-type"] ?? "text/plain",
  });

  expect(response.status()).toBe(400);

  const body = await response.json();

  expect(body).toMatchObject({ errors: expect.any(Array) });
  expect(body.errors).toHaveLength(2);
  expect(body.errors).toEqual(
    expect.arrayContaining(["Firstname should not be blank", "size must be between 3 and 18"]),
  );
});
