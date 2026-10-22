import { expect, type Page } from "@playwright/test";

import type { CreateBookingRequest } from "../types/booking";

export class BookingConfirmationPage {
  constructor(private readonly page: Page) {}

  async expectConfirmed(dates: CreateBookingRequest["bookingdates"]): Promise<void> {
    // Confirmed in the real UI: evidence/exploration/confirmation.yml.
    const heading = this.page.getByRole("heading", { name: "Booking Confirmed", exact: true });
    await expect(heading).toBeVisible();
    await heading.scrollIntoViewIfNeeded();
    await expect(this.page.getByText("Your booking has been confirmed for the following dates:", { exact: true })).toBeVisible();
    await expect(this.page.getByText(`${dates.checkin} - ${dates.checkout}`, { exact: true })).toBeVisible();
    await expect(this.page.getByRole("link", { name: "Return home", exact: true })).toBeVisible();
  }
}
