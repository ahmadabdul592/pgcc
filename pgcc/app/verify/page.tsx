import { redirect } from "next/navigation";
export default async function V({ searchParams }: { searchParams: Promise<{ regNo?: string }> }) {
  const { regNo } = await searchParams;
  redirect(regNo ? `/verify/${regNo.trim().replaceAll("/", "-")}` : "/");
}
