import { cookies } from "next/headers";
import { getLanguages } from "@/lib/data";

export async function getPageLanguage(requested?: string) {
  const languages = await getLanguages();
  const cookieStore = await cookies();
  const cookieLanguage = cookieStore.get("govguide-language")?.value;
  const languageCode = [requested, cookieLanguage, "en", languages[0]?.code].find((code) => code && languages.some((language) => language.code === code)) ?? "en";
  return { languages, languageCode };
}
