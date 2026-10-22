import { randomUUID } from "node:crypto";

import { test, expect } from "../fixtures/api.fixture";
import type { CreateBookingRequest } from "../../src/types/booking";

interface BookingSuccessScenario {
  name: string;
  roomid: number;
  depositpaid: boolean;
}

export function defineBookingSuccessScenario(scenario: BookingSuccessScenario): void {
  test.describe(`Reservas por API - ${scenario.name}`, () => {
    let ownedBooking:
      | {
          id: number;
          firstname: string;
          lastname: string;
        }
      | undefined;

    test.afterEach(async ({ bookingClient }, testInfo) => {
      const booking = ownedBooking;
      ownedBooking = undefined;

      if (!booking) {
        return;
      }

      const currentResponse = await bookingClient.getById(booking.id);

      if (currentResponse.status() === 404) {
        testInfo.annotations.push({
          type: "limpieza",
          description: "La reserva ya no existía al iniciar la limpieza.",
        });
        return;
      }

      expect(currentResponse.status()).toBe(200);

      const current = await currentResponse.json();

      // Comprobar propiedad antes de eliminar un ID que pudo reutilizarse.
      expect(current).toMatchObject({
        firstname: booking.firstname,
        lastname: booking.lastname,
      });

      const deleteResponse = await bookingClient.deleteById(booking.id);
      expect(deleteResponse.status()).toBe(202);

      const deletedResponse = await bookingClient.getById(booking.id);
      expect(deletedResponse.status()).toBe(404);
    });

    test("crear y consultar una reserva", async ({ bookingClient }, testInfo) => {
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
        roomid: scenario.roomid,
        firstname: `Qa${randomUUID().replaceAll("-", "").slice(0, 10)}`,
        lastname: "ReservaApi",
        depositpaid: scenario.depositpaid,
        email: "qa.reserva@example.com",
        phone: "07123456789",
        bookingdates: { checkin, checkout },
      };

      await testInfo.attach("datos-del-caso", {
        body: JSON.stringify({ scenario, bookingdates: data.bookingdates }, null, 2),
        contentType: "application/json",
      });

      const listResponse = await bookingClient.listByRoom(data.roomid);
      expect(listResponse.status()).toBe(200);

      const list = await listResponse.json();
      expect(list).toMatchObject({ bookings: expect.any(Array) });

      for (const booking of list.bookings) {
        expect(booking).toMatchObject({
          bookingdates: {
            checkin: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
            checkout: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
          },
        });

        const overlaps =
          checkin < booking.bookingdates.checkout && checkout > booking.bookingdates.checkin;

        expect(
          overlaps,
          `Las fechas elegidas se solapan con una reserva de la habitación ${data.roomid}.`,
        ).toBe(false);
      }

      const createResponse = await bookingClient.create(data);
      const created = await createResponse.json();

      // Registrar el ID antes de comprobar los demás datos.
      if (Number.isInteger(created?.bookingid) && created.bookingid > 0) {
        ownedBooking = {
          id: created.bookingid,
          firstname: data.firstname,
          lastname: data.lastname,
        };
      }

      await testInfo.attach("respuesta-creacion", {
        body: JSON.stringify(created, null, 2),
        contentType: "application/json",
      });

      expect(createResponse.status()).toBe(201);
      expect(Number.isInteger(created.bookingid)).toBe(true);
      expect(created.bookingid).toBeGreaterThan(0);

      const expected = {
        bookingid: created.bookingid,
        roomid: data.roomid,
        firstname: data.firstname,
        lastname: data.lastname,
        depositpaid: data.depositpaid,
        bookingdates: data.bookingdates,
      };

      expect(created).toMatchObject(expected);

      const getResponse = await bookingClient.getById(created.bookingid);
      expect(getResponse.status()).toBe(200);

      const persisted = await getResponse.json();
      expect(persisted).toMatchObject(expected);
    });
  });
}
