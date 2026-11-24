"use client";
import { useState, useTransition } from "react";
import { updateMemberPhoto } from "@/app/actions/photo";

function resize(file: File): Promise<string> {
  return new Promise((ok, fail) => {
    const img = new Image();
    img.onload = () => {
      const w = 200, h = 250, c = document.createElement("canvas");
      c.width = w; c.height = h;
      const r = Math.max(w / img.width, h / img.height);
      c.getContext("2d")!.drawImage(img, (w - img.width * r) / 2, (h - img.height * r) / 2, img.width * r, img.height * r);
      URL.revokeObjectURL(img.src);
      ok(c.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = fail;
    img.src = URL.createObjectURL(file);
  });
}

export default function MemberPhoto({ id, src }: { id: string; src?: string | null }) {
  const [cur, setCur] = useState(src);
  const [err, setErr] = useState("");
  const [pending, start] = useTransition();
  return (
    <label className="cursor-pointer" title="Add or change passport photo (optional)">
      {cur ? <img src={cur} alt="" className="h-12 w-10 rounded object-cover" />
        : <span className="grid h-12 w-10 place-items-center rounded border border-dashed text-[10px] text-[var(--muted)]">{pending ? "..." : "+ Photo"}</span>}
      <input type="file" accept="image/*" hidden onChange={(e) => {
        const f = e.target.files?.[0]; if (!f) return; setErr("");
        start(async () => { try { const d = await resize(f); const r = await updateMemberPhoto(id, d); if (r.error) setErr(r.error); else setCur(d); } catch { setErr("Could not read that image."); } });
      }} />
      {err && <span role="alert" className="block text-xs text-red-700">{err}</span>}
    </label>);
}
