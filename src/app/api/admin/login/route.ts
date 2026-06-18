import { cookies } from "next/headers";
import { ADMIN_COOKIE, ADMIN_SESSION_VALUE, checkPassword } from "@/lib/auth";

export async function POST(request: Request) {
  let password = "";
  try {
    const body = await request.json();
    password = typeof body?.password === "string" ? body.password : "";
  } catch {
    password = "";
  }

  if (!checkPassword(password)) {
    return Response.json({ error: "Invalid password" }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, ADMIN_SESSION_VALUE, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
  });

  return Response.json({ ok: true });
}
