import type { APIRequestContext, APIResponse } from "@playwright/test";

import type { CreateBookingRequest } from "../types/booking";

export class BookingClient {
  constructor(private request: APIRequestContext) {}

  create(data: CreateBookingRequest): Promise<APIResponse> {
    return this.request.post("/api/booking", {
      data,
    });
  }

  getById(bookingId: number): Promise<APIResponse> {
    return this.request.get(`/api/booking/${bookingId}`);
  }

  listByRoom(roomId: number): Promise<APIResponse> {
    return this.request.get("/api/booking", { params: { roomid: roomId } });
  }

  deleteById(bookingId: number): Promise<APIResponse> {
    return this.request.delete(`/api/booking/${bookingId}`);
  }
}
