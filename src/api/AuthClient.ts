import type { APIRequestContext, APIResponse } from "@playwright/test";

export class AuthClient {
  constructor(private request: APIRequestContext) {}

  login(username: string, password: string): Promise<APIResponse> {
    return this.request.post("/api/auth/login", {
      data: { username, password },
    });
  }
}
