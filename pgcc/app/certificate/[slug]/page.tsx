import QRCode from "qrcode";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugToRegNo } from "@/lib/orgs";
import PrintButton from "../PrintButton";

export default async function Certificate({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const u = (await auth())?.user as any;
  if (!u) redirect("/login");
  const o = await prisma.organization.findFirst({ where: { regNo: slugToRegNo(slug), deletedAt: null }, include: { officers: true } });
  if (!o || (u.role === "ORG_LEADER" && u.organizationId !== o.id) || (u.role === "LGA_COORDINATOR" && o.lga !== u.lgaId)) notFound();
  const host = (await headers()).get("host") ?? "localhost:3000";
  const url = `${host.startsWith("localhost") ? "http" : "https"}://${host}/verify/${slug}`;
  const qr = await QRCode.toString(url, { type: "svg", margin: 1, width: 130 });
  const chair = o.officers.find((x) => x.title === "CHAIRMAN")?.name;
  const ok = o.status === "VERIFIED";
  return (
    <main className="min-h-screen bg-[var(--paper)] p-5 print:bg-white print:p-0">
      <div className="mx-auto mb-4 flex max-w-3xl justify-between print:hidden"><a href={u.role === "ORG_LEADER" ? "/portal" : `/admin/organizations/${slug}`} className="underline">Back</a><PrintButton /></div>
      <article className="mx-auto max-w-3xl border-8 border-double border-[var(--brand)] bg-white p-8 text-center md:p-12">
        <img src="/apc.png" alt="" className="mx-auto h-20 w-20" />
        <p className="mt-3 text-sm font-semibold tracking-wide text-[var(--brand)]">ALL PROGRESSIVES CONGRESS · KANO STATE CHAPTER</p>
        <h1 className="mt-6 text-4xl font-extrabold">Certificate of Registration</h1>
        <p className="mt-6 text-[var(--muted)]">This certifies that</p>
        <p className="mt-2 text-3xl font-bold text-[var(--brand)]">{o.name}</p>
        <p className="mt-4">is registered as a <b>{o.level.toLowerCase()}</b>-level support group for the 2027 campaign, based in {o.lga}, {o.state}.</p>
        <p className="mt-6 text-lg">Registration No: <b>{o.regNo}</b></p>
        {chair && <p className="text-sm text-[var(--muted)]">Chairman: {chair}</p>}
        <p className={`mt-4 inline-block rounded-full px-4 py-1 text-sm font-bold ${ok ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>{ok ? "VERIFIED" : `${o.status} · NOT YET VERIFIED`}</p>
        <div className="mt-8 flex flex-col items-center gap-1"><div dangerouslySetInnerHTML={{ __html: qr }} /><p className="text-xs text-[var(--muted)]">Scan to verify this registration</p></div>
        <p className="mt-6 text-xs text-[var(--muted)]">Issued by the PGCC Directorate, Kano · Printed {new Date().toLocaleDateString("en-GB")}</p>
      </article>
    </main>);
}
