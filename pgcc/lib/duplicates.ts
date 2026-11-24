import { prisma } from "./prisma";


/** Normalise Nigerian numbers: 0803..., 803..., +234803..., 234803... -> +234803XXXXXXX */
export function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/[^\d]/g, "");
  let local: string;
  if (digits.startsWith("234") && digits.length === 13) local = digits.slice(3);
  else if (digits.startsWith("0") && digits.length === 11) local = digits.slice(1);
  else if (digits.length === 10) local = digits;
  else return null;
  return /^[789]\d{9}$/.test(local) ? `+234${local}` : null;
}

export type MemberInput = {
  name: string;
  phone: string;
  ward: string;
  pollingUnit: string;
  position?: string;
  consentGiven?: boolean;
};

export type AddResult =
  | { ok: false; error: "INVALID_PHONE" | "SAME_GROUP_DUPLICATE"; message: string }
  | { ok: true; memberId: string; flagged: { orgName: string; regNo: string; reason: string }[] };

/**
 * Rules:
 * 1. Same phone already in THIS group  -> blocked.
 * 2. Same phone, or same name + polling unit, in ANOTHER group
 *    -> member is saved but flagged for admin review (OPEN flag).
 */
export async function addMember(orgId: string, input: MemberInput): Promise<AddResult> {
  const phone = normalizePhone(input.phone);
  if (!phone) return { ok: false, error: "INVALID_PHONE", message: `Invalid phone: ${input.phone}` };

  const sameGroup = await prisma.member.findFirst({
    where: { organizationId: orgId, phone, deletedAt: null },
  });
  if (sameGroup)
    return { ok: false, error: "SAME_GROUP_DUPLICATE", message: "This phone is already in your group." };

  // Look for matches in other groups
  const matches = await prisma.member.findMany({
    where: {
      organizationId: { not: orgId },
      deletedAt: null,
      organization: { deletedAt: null },
      OR: [
        { phone },
        {
          name: { equals: input.name.trim(), mode: "insensitive" },
          pollingUnit: { equals: input.pollingUnit.trim(), mode: "insensitive" },
        },
      ],
    },
    include: { organization: { select: { name: true, regNo: true } } },
  });

  const member = await prisma.member.create({
    data: {
      organizationId: orgId,
      name: input.name.trim(),
      phone,
      ward: input.ward.trim(),
      pollingUnit: input.pollingUnit.trim(),
      position: input.position ?? "Member",
      consentGiven: input.consentGiven ?? false,
    },
  });

  const flagged = matches.map((m) => ({
    orgName: m.organization.name,
    regNo: m.organization.regNo,
    reason: m.phone === phone ? "SAME_PHONE" : "SAME_NAME_PU",
  }));

  if (matches.length) {
    await prisma.duplicateFlag.createMany({
      data: matches.map((m) => ({
        memberId: member.id,
        otherMemberId: m.id,
        reason: m.phone === phone ? "SAME_PHONE" : "SAME_NAME_PU",
      })),
    });
  }

  return { ok: true, memberId: member.id, flagged };
}

/** Bulk CSV/Excel import: returns a per-row report the UI can show before/after saving. */
export async function importMembers(orgId: string, rows: MemberInput[]) {
  const report = { added: 0, rejected: [] as { row: number; message: string }[], flagged: 0 };
  for (let i = 0; i < rows.length; i++) {
    const res = await addMember(orgId, rows[i]);
    if (!res.ok) report.rejected.push({ row: i + 2, message: res.message }); // +2 = header + 1-index
    else {
      report.added++;
      if (res.flagged.length) report.flagged++;
    }
  }
  return report;
}

/** Admin view: all open duplicate flags with both sides. */
export async function listOpenFlags() {
  const flags = await prisma.duplicateFlag.findMany({
    where: { status: "OPEN" },
    include: { member: { include: { organization: { select: { name: true, regNo: true } } } } },
    orderBy: { createdAt: "desc" },
  });
  const others = await prisma.member.findMany({
    where: { id: { in: flags.map((f) => f.otherMemberId) } },
    include: { organization: { select: { name: true, regNo: true } } },
  });
  const byId = new Map(others.map((o) => [o.id, o]));
  return flags.map((f) => ({ flag: f, other: byId.get(f.otherMemberId) }));
}
