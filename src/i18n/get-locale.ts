import { cookies } from "next/headers";
import { defaultLocale, cookieName } from "./config";

export async function getServerLocale(): Promise<string> {
  const cookieStore = await cookies();
  return cookieStore.get(cookieName)?.value ?? defaultLocale;
}
