// Simple cookie-based admin auth (v1). The proxy guards routes by cookie
// presence; route handlers compare the password against process.env.
export const ADMIN_COOKIE = "admin_session";

// Opaque session value stored in the httpOnly cookie on successful login.
export const ADMIN_SESSION_VALUE = "leisure-admin-ok";

export function checkPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  return Boolean(expected) && password === expected;
}
