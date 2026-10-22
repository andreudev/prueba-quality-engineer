import { test, expect, annotateCase } from "../fixtures/owned-booking.fixture";
import { invalidDateCases } from "../data/booking-cases";

for (const scenario of invalidDateCases) {
  test(`${scenario.id} rechazar ${scenario.name}`, async ({ ownedBookings }, testInfo) => {
    annotateCase(testInfo, scenario);
    const data = ownedBookings.data(scenario.roomid, scenario.bookingdates);
    // Las fechas inválidas se envían realmente, sin corregirlas en una validación local.
    const result = await ownedBookings.create(data);
    expect(result.response.status()).toBe(scenario.expectedStatus);
    await ownedBookings.expectAbsent(data);
  });
}
