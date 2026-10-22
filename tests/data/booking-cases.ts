import type { CreateBookingRequest } from "../../src/types/booking";

export type BookingDates = CreateBookingRequest["bookingdates"];

export interface BookingCase {
  id: string;
  name: string;
  priority: "P1" | "P2";
  risk: string;
  roomid: number;
  expectedStatus: number;
}

interface OverlapCase extends BookingCase {
  original: BookingDates;
  candidate: BookingDates;
}

interface UnauthorizedCase extends BookingCase {
  mode: "missing" | "invalid";
  bookingdates: BookingDates;
}

interface InvalidDatesCase extends BookingCase {
  bookingdates: BookingDates;
}

// Fechas explícitas: editar aquí cuando expiren o no estén disponibles.
// Las ventanas válidas no compiten entre sí ni con BOOKING_CHECKIN/CHECKOUT.
export const overlapCases: readonly OverlapCase[] = [
  {
    id: "SOL-01", name: "intervalo idéntico", priority: "P1",
    risk: "Doble asignación de una habitación en el mismo intervalo",
    roomid: 1, expectedStatus: 409,
    original: { checkin: "2026-11-16", checkout: "2026-11-20" },
    candidate: { checkin: "2026-11-16", checkout: "2026-11-20" },
  },
  {
    id: "SOL-02", name: "solapamiento parcial", priority: "P1",
    risk: "Doble asignación al cruzar parcialmente los intervalos",
    roomid: 2, expectedStatus: 409,
    original: { checkin: "2026-11-23", checkout: "2026-11-27" },
    candidate: { checkin: "2026-11-25", checkout: "2026-11-29" },
  },
];

export const unauthorizedCases: readonly UnauthorizedCase[] = [
  {
    id: "AUT-01", name: "sin token", priority: "P1",
    risk: "Eliminación de reservas sin autenticación", roomid: 1,
    expectedStatus: 403, mode: "missing",
    bookingdates: { checkin: "2026-12-01", checkout: "2026-12-03" },
  },
  {
    id: "AUT-02", name: "token inválido", priority: "P1",
    risk: "Eliminación de reservas con una identidad no válida", roomid: 2,
    expectedStatus: 403, mode: "invalid",
    bookingdates: { checkin: "2026-12-05", checkout: "2026-12-07" },
  },
];

export const invalidDateCases: readonly InvalidDatesCase[] = [
  {
    id: "FEC-01", name: "salida igual a entrada", priority: "P2",
    risk: "Persistencia de una estancia de duración cero", roomid: 1,
    expectedStatus: 409,
    bookingdates: { checkin: "2026-12-10", checkout: "2026-12-10" },
  },
  {
    id: "FEC-02", name: "salida anterior a entrada", priority: "P2",
    risk: "Persistencia de una estancia de duración negativa", roomid: 2,
    expectedStatus: 409,
    bookingdates: { checkin: "2026-12-15", checkout: "2026-12-14" },
  },
];
