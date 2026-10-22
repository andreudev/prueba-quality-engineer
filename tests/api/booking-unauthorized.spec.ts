import { randomUUID } from "node:crypto";
import { BookingClient } from "../../src/api/BookingClient";
import { test, expect, annotateCase } from "../fixtures/owned-booking.fixture";
import { unauthorizedCases } from "../data/booking-cases";

for (const scenario of unauthorizedCases) {
  test(`${scenario.id} impedir eliminación ${scenario.name}`, async ({ ownedBookings, playwright, baseURL }, testInfo) => {
    annotateCase(testInfo, scenario);
    if (!baseURL) throw new Error("Configura BASE_URL");
    const original = await ownedBookings.createValid(scenario.roomid, scenario.bookingdates);
    const isolated = await playwright.request.newContext({ baseURL, storageState: { cookies: [], origins: [] } });
    try {
      expect((await isolated.storageState()).cookies).toHaveLength(0);
      if (scenario.mode === "invalid") {
        await isolated.addCookies([{ name: "token", value: `invalid-${randomUUID()}`, url: baseURL }]);
      }
      const response = await new BookingClient(isolated).deleteById(original.id);
      await testInfo.attach("eliminacion-no-autorizada", {
        body: JSON.stringify({ dataset: scenario.id, mode: scenario.mode,
          bookingid: original.id, status: response.status(), body: await response.text() }, null, 2),
        contentType: "application/json",
      });
      expect(response.status()).toBe(scenario.expectedStatus);
      await ownedBookings.expectUnchanged(original);
    } finally {
      await isolated.dispose();
    }
  });
}
