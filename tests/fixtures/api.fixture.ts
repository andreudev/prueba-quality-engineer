import { test as base, expect } from "@playwright/test";

import { AuthClient } from "../../src/api/AuthClient";
import { BookingClient } from "../../src/api/BookingClient";
import { isAuthResponse } from "../../src/types/auth";

type ApiFixtures = {
  bookingClient: BookingClient;
};

export const test = base.extend<ApiFixtures>({
  bookingClient: async ({ request, baseURL }, use) => {
    if (!baseURL) {
      throw new Error("Configurar la variable de entorno BASE_URL");
    }

    const authClient = new AuthClient(request);
    const loginResponse = await authClient.login(
      process.env.API_USERNAME || "admin",
      process.env.API_PASSWORD || "password",
    );

    await expect(loginResponse.ok(), "La autenticación debe ser exitosa").toBeTruthy();

    const responseBody: unknown = await loginResponse.json();
    if (!isAuthResponse(responseBody)) {
      throw new Error("La respuesta de autenticación no contiene un token válido");
    }

    await request.addCookies([
      {
        name: "token",
        value: responseBody.token,
        url: baseURL,
      },
    ]);

    await use(new BookingClient(request));
  },
});

export { expect };
