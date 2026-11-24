"use server";
import Papa from "papaparse";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { addMember, importMembers, type MemberInput } from "@/lib/duplicates";

export async function addMemberAction(_: unknown, fd: FormData) {
  const u = await requireRole(["ORG_LEADER"]);
  const r = await addMember(u.organizationId!, {
    name: String(fd.get("name")), phone: String(fd.get("phone")), ward: String(fd.get("ward")),
    pollingUnit: String(fd.get("pollingUnit")), position: String(fd.get("position") || "Member"),
    consentGiven: fd.get("consent") === "on",
  });
  revalidatePath("/portal");
  return r;
}

/** CSV columns: name, phone, ward, polling unit, position (optional) */
export async function importCsvAction(_: unknown, fd: FormData) {
  const u = await requireRole(["ORG_LEADER"]);
  const file = fd.get("file") as File | null;
  if (!file || !file.size) return { error: "Choose a CSV file." };
  if (file.size > 2_000_000) return { error: "File too large (max 2MB)." };
  if (fd.get("consent") !== "on") return { error: "Please confirm member consent." };
  const parsed = Papa.parse<Record<string, string>>(await file.text(), {
    header: true, skipEmptyLines: true, transformHeader: (h) => h.toLowerCase().replace(/[^a-z]/g, ""),
  });
  const rows: MemberInput[] = parsed.data.slice(0, 2000).map((r) => ({
    name: r.name ?? "", phone: r.phone ?? "", ward: r.ward ?? "",
    pollingUnit: r.pollingunit ?? "", position: r.position || "Member", consentGiven: true,
  }));
  const report = await importMembers(u.organizationId!, rows);
  revalidatePath("/portal");
  return { report };
}
