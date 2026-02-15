import { cookies } from "next/headers";

const ADMIN_COOKIE = "diabetic_admin";
const SESSION_DURATION = 60 * 60 * 24; // 24 hours

export async function verifyAdmin(password: string): Promise<boolean> {
  const adminPassword = process.env.ADMIN_PASSWORD || "diabetic2025";
  return password === adminPassword;
}

export async function createAdminSession() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, "authenticated", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION,
    path: "/",
  });
}

export async function destroyAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_COOKIE);
  return session?.value === "authenticated";
}
