import { randomUUID } from "node:crypto";
import type { APIResponse, TestInfo } from "@playwright/test";

import { test as base, expect } from "./api.fixture";
import { BookingClient } from "../../src/api/BookingClient";
import type { CreateBookingRequest } from "../../src/types/booking";
import type { BookingCase, BookingDates } from "../data/booking-cases";

type OwnedAttempt = { data: CreateBookingRequest; id?: number };
type OwnedBooking = { data: CreateBookingRequest; id: number };

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function annotateCase(testInfo: TestInfo, scenario: BookingCase): void {
  testInfo.annotations.push(
    { type: "dataset", description: scenario.id },
    { type: "prioridad", description: scenario.priority },
    { type: "riesgo", description: scenario.risk },
  );
}

class OwnedBookings {
  private readonly attempts: OwnedAttempt[] = [];

  constructor(private readonly client: BookingClient, private readonly info: TestInfo) {}

  data(roomid: number, bookingdates: BookingDates): CreateBookingRequest {
    for (const date of Object.values(bookingdates)) {
      expect(date, "El dataset debe usar fechas ISO reales").toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10)).toBe(date);
      expect(date > new Date().toISOString().slice(0, 10), "Actualizar las fechas explícitas vencidas").toBe(true);
    }
    // No validar aquí el orden: los negativos deben enviarlo al backend.
    const marker = randomUUID().replaceAll("-", "").slice(0, 14);
    return { roomid, firstname: `Ex${marker}`, lastname: "ReservaExtra", depositpaid: false,
      email: `qa.${marker}@example.com`, phone: "07123456789", bookingdates: { ...bookingdates } };
  }

  private async attach(name: string, body: unknown): Promise<void> {
    await this.info.attach(name, { body: JSON.stringify(body, null, 2), contentType: "application/json" });
  }

  private async list(roomid: number): Promise<Record<string, unknown>[]> {
    const response = await this.client.listByRoom(roomid);
    expect(response.status()).toBe(200);
    const body: unknown = await response.json();
    if (!record(body) || !Array.isArray(body.bookings) || !body.bookings.every(record)) {
      throw new Error("El listado no contiene un array válido de reservas");
    }
    return body.bookings;
  }

  async expectAvailable(roomid: number, dates: BookingDates): Promise<void> {
    expect(dates.checkout > dates.checkin).toBe(true);
    const bookings = await this.list(roomid);
    await this.attach("disponibilidad-dataset", { roomid, dates,
      occupied: bookings.map(booking => booking.bookingdates) });
    for (const booking of bookings) {
      const occupied = booking.bookingdates;
      if (!record(occupied) || typeof occupied.checkin !== "string" || typeof occupied.checkout !== "string") {
        throw new Error("Reserva existente con fechas no interpretables");
      }
      expect(dates.checkin < occupied.checkout && dates.checkout > occupied.checkin,
        "La ventana explícita del dataset debe estar disponible; no se cambiará automáticamente").toBe(false);
    }
  }

  async create(data: CreateBookingRequest): Promise<{ response: APIResponse; body: unknown }> {
    const attempt: OwnedAttempt = { data: structuredClone(data) };
    this.attempts.push(attempt); // Antes de enviar, incluso ante un error de red/lectura.
    const response = await this.client.create(data);
    const text = await response.text();
    let body: unknown = text;
    if (text) { try { body = JSON.parse(text); } catch { /* Conservar texto si no es JSON. */ } }
    if (record(body) && typeof body.bookingid === "number" && Number.isInteger(body.bookingid) && body.bookingid > 0) {
      attempt.id = body.bookingid;
    }
    await this.attach("intento-reserva", { data, status: response.status(), body });
    return { response, body };
  }

  async createValid(roomid: number, dates: BookingDates): Promise<OwnedBooking> {
    await this.expectAvailable(roomid, dates);
    const data = this.data(roomid, dates);
    const { response, body } = await this.create(data);
    expect(response.status()).toBe(201);
    if (!record(body) || typeof body.bookingid !== "number" || !Number.isInteger(body.bookingid) || body.bookingid <= 0) {
      throw new Error("La reserva válida no devolvió un identificador válido");
    }
    expect(body).toMatchObject({ roomid, firstname: data.firstname, lastname: data.lastname,
      depositpaid: data.depositpaid, bookingdates: dates });
    return { data, id: body.bookingid };
  }

  async expectAbsent(data: CreateBookingRequest): Promise<void> {
    const matches = (await this.list(data.roomid)).filter(booking =>
      booking.firstname === data.firstname && booking.lastname === data.lastname);
    await this.attach("ausencia-persistencia", { marker: data.firstname, matches });
    expect(matches, "La petición rechazada no debe persistir una reserva").toHaveLength(0);
  }

  async expectUnchanged(booking: OwnedBooking): Promise<void> {
    const response = await this.client.getById(booking.id);
    const text = await response.text();
    await this.attach("reserva-original-tras-intento", { id: booking.id, status: response.status(), body: text });
    expect(response.status()).toBe(200);
    expect(JSON.parse(text)).toMatchObject({ bookingid: booking.id, roomid: booking.data.roomid,
      firstname: booking.data.firstname, lastname: booking.data.lastname,
      depositpaid: booking.data.depositpaid, bookingdates: booking.data.bookingdates });
  }

  async cleanup(): Promise<void> {
    const failures: unknown[] = [];
    for (const attempt of [...this.attempts].reverse()) {
      try {
        let id = attempt.id;
        if (id === undefined) {
          const matches = (await this.list(attempt.data.roomid)).filter(booking =>
            booking.firstname === attempt.data.firstname && booking.lastname === attempt.data.lastname);
          expect(matches.length, "Un marcador ambiguo impide borrar").toBeLessThanOrEqual(1);
          if (matches.length === 0) continue;
          const found = matches[0]!.bookingid;
          if (typeof found !== "number") throw new Error("ID de limpieza no numérico");
          id = found;
        }
        expect(Number.isInteger(id) && id > 0).toBe(true);
        const current = await this.client.getById(id);
        if (current.status() === 404) {
          this.info.annotations.push({ type: "limpieza", description: `La reserva propia ${id} ya no existe; causa no determinada.` });
          continue;
        }
        expect(current.status()).toBe(200);
        expect(await current.json()).toMatchObject({ bookingid: id, roomid: attempt.data.roomid,
          firstname: attempt.data.firstname, lastname: attempt.data.lastname, bookingdates: attempt.data.bookingdates });
        const deleted = await this.client.deleteById(id);
        expect(deleted.status()).toBe(202);
        const absent = await this.client.getById(id);
        expect(absent.status()).toBe(404);
        await this.attach("limpieza-registro-propio", { bookingid: id, marker: attempt.data.firstname,
          deleteStatus: deleted.status(), getAfterDeleteStatus: absent.status() });
      } catch (error) {
        failures.push(error);
        await this.attach("fallo-limpieza", { marker: attempt.data.firstname, message: String(error) });
      }
    }
    if (failures.length) throw new AggregateError(failures, "Falló la limpieza segura de reservas propias");
  }
}

export const test = base.extend<{ ownedBookings: OwnedBookings }>({
  ownedBookings: async ({ bookingClient }, use, testInfo) => {
    const owned = new OwnedBookings(bookingClient, testInfo);
    try { await use(owned); } finally { await owned.cleanup(); }
  },
});

export { expect };
