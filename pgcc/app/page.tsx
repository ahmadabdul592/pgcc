import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <header className="flex items-center justify-between px-6 py-4 border-b">
        <span className="font-bold text-green-800">APC Kano · PGCC Support Groups</span>
        <Link href="/login" className="rounded bg-green-700 px-4 py-2 text-white">Login</Link>
      </header>
      <section className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h1 className="text-4xl font-bold">Support Group Registration &amp; Re-validation</h1>
        <p className="mt-4 text-lg text-gray-600">2027 Presidential and Gubernatorial Campaign · Kano State Chapter</p>
        <p className="mt-8 text-gray-700">Registered groups log in to manage their profile and members. To register a new group, contact the PGCC Directorate, Kano.</p>
        <form action="/verify" className="mx-auto mt-10 flex max-w-md gap-2">
          <input name="regNo" placeholder="Verify a group: PGCC/KN/2027/00001" className="flex-1 rounded border px-3 py-2" />
          <button className="rounded border border-green-700 px-4 text-green-800">Verify</button>
        </form>
      </section>
      <section className="mx-auto grid max-w-4xl gap-6 px-6 pb-20 sm:grid-cols-3">
        {[["1. Register", "The Directorate registers your group and issues a reg number."],
          ["2. Add members", "Log in and upload your member list (name, phone, ward, polling unit)."],
          ["3. Get verified", "Your documents are reviewed and your group is marked Verified."]].map(([t, d]) => (
          <div key={t} className="rounded-lg border p-5"><h3 className="font-semibold text-green-800">{t}</h3><p className="mt-2 text-sm text-gray-600">{d}</p></div>
        ))}
      </section>
    </main>
  );
}
