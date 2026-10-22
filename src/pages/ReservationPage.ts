import { expect, type Locator, type Page, type Response } from "@playwright/test";

import type { CreateBookingRequest } from "../types/booking";

export class ReservationPage {
  // Observed with Playwright MCP: evidence/exploration/guest-form.yml.
  readonly firstName: Locator;
  private readonly lastName: Locator;
  private readonly email: Locator;
  private readonly phone: Locator;
  private readonly reserve: Locator;

  constructor(private readonly page: Page) {
    this.firstName = page.getByRole("textbox", { name: "Firstname", exact: true });
    this.lastName = page.getByRole("textbox", { name: "Lastname", exact: true });
    this.email = page.getByRole("textbox", { name: "Email", exact: true });
    this.phone = page.getByRole("textbox", { name: "Phone", exact: true });
    this.reserve = page.getByRole("button", { name: "Reserve Now", exact: true });
  }

  async open(data: CreateBookingRequest): Promise<void> {
    // Route and query parameters observed in the actual room links.
    const dates = new URLSearchParams(data.bookingdates);
    await this.page.goto(`/reservation/${data.roomid}?${dates}`);
    await expect(this.page.getByRole("heading", { name: "Book This Room", exact: true })).toBeVisible();
    await this.reserve.click();
    await expect(this.firstName).toBeVisible();
  }

  async fillGuest(data: CreateBookingRequest): Promise<void> {
    await this.firstName.fill(data.firstname);
    await this.lastName.fill(data.lastname);
    await this.email.fill(data.email);
    await this.phone.fill(data.phone);
  }

  async submit(data: CreateBookingRequest): Promise<Response> {
    // Observe the real browser POST; never create the booking through the API client.
    const [response] = await Promise.all([
      this.page.waitForResponse((response) => {
        const request = response.request();
        if (request.method() !== "POST" || new URL(response.url()).pathname !== "/api/booking") {
          return false;
        }
        const payload = request.postDataJSON();
        return payload?.firstname === data.firstname && payload?.lastname === data.lastname;
      }),
      this.reserve.click(),
    ]);
    return response;
  }
}
