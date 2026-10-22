export interface AuthResponse {
  token: string;
}

export function isAuthResponse(value: unknown): value is AuthResponse {
  if (typeof value !== "object" || value === null || !("token" in value)) {
    return false;
  }

  return typeof value.token === "string" && value.token.trim().length > 0;
}
