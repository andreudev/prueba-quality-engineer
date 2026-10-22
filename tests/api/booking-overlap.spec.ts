import { test, expect, annotateCase } from "../fixtures/owned-booking.fixture";
import { overlapCases } from "../data/booking-cases";

for (const scenario of overlapCases) {
  test(`${scenario.id} rechazar reserva con ${scenario.name}`, async ({ ownedBookings }, testInfo) => {
    annotateCase(testInfo, scenario);
    // Comprobar toda la ventana antes de introducir nuestro solapamiento deliberado.
    await ownedBookings.expectAvailable(scenario.roomid, {
      checkin: scenario.original.checkin < scenario.candidate.checkin ? scenario.original.checkin : scenario.candidate.checkin,
      checkout: scenario.original.checkout > scenario.candidate.checkout ? scenario.original.checkout : scenario.candidate.checkout,
    });
    const original = await ownedBookings.createValid(scenario.roomid, scenario.original);
    const candidate = ownedBookings.data(scenario.roomid, scenario.candidate);
    const result = await ownedBookings.create(candidate);
    expect(result.response.status()).toBe(scenario.expectedStatus);
    await ownedBookings.expectUnchanged(original);
    await ownedBookings.expectAbsent(candidate);
  });
}
