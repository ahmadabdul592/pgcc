import Link from "next/link";

const steps = [
  ["Register", "The PGCC Directorate registers your group and issues a reg number."],
  ["Add your members", "Log in, then upload your list with names, phones, wards and polling units."],
  ["Get verified", "Your documents are reviewed. Verified groups can be confirmed by anyone with the reg number."],
];
const points = [
  ["One record per group", "Every group gets a unique reg number and an online profile that stays up to date."],
  ["Members checked for duplicates", "Phone numbers are matched across all groups so nobody is counted twice."],
  ["Changes need approval", "Group details only change after the Directorate approves them."],
  ["Public check, private data", "Anyone can confirm a group is registered. Member lists are never public."],
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <header className="sticky top-0 z-10 border-b border-[var(--line)] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <span className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--brand)]">Organization Database</span>
          <nav className="flex items-center gap-5 text-sm">
            <a href="#how" className="hidden text-[var(--muted)] hover:text-[var(--ink)] sm:block">How it works</a>
            <Link href="/login" className="rounded-lg bg-[var(--brand)] px-4 py-2 font-semibold text-white hover:bg-[var(--brand-dark)]">Login</Link>
          </nav>
        </div>
      </header>

      <section className="bg-[var(--brand-dark)] text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-14 md:grid-cols-2 md:py-20">
          <div>
            <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">Every support group in Kano, registered and verified in one place.</h1>
            <p className="mt-5 max-w-md text-lg text-green-100">APC Kano State Chapter register for the 2027 campaign. Log in to manage your group, or check that a group is registered.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/login" className="rounded-lg bg-[var(--gold)] px-6 py-3 font-bold text-[var(--ink)] hover:brightness-95">Login to your group</Link>
              <a href="#verify" className="rounded-lg border border-white/40 px-6 py-3 font-semibold hover:bg-white/10">Verify a group</a>
            </div>
          </div>

          <form id="verify" action="/verify" className="rounded-2xl bg-white p-6 text-[var(--ink)] shadow-2xl ring-4 ring-[var(--gold)]/60">
            <p className="text-sm font-semibold text-[var(--brand)]">Certificate check</p>
            <h2 className="mt-1 text-2xl font-bold">Is this group registered?</h2>
            <label htmlFor="regNo" className="mt-5 block text-sm font-medium">Registration number</label>
            <input id="regNo" name="regNo" placeholder="PGCC/KN/2027/00001" className="mt-1 w-full" required />
            <button className="mt-4 w-full rounded-lg bg-[var(--brand)] py-3 font-semibold text-white hover:bg-[var(--brand-dark)]">Check registration</button>
            <p className="mt-3 text-xs text-[var(--muted)]">You will see the group name, level and status only.</p>
          </form>
        </div>
      </section>

      <section id="how" className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="text-3xl font-bold">How registration works</h2>
        <ol className="mt-8 grid gap-8 md:grid-cols-3">
          {steps.map(([t, d], i) => (
            <li key={t} className="border-l-4 border-[var(--gold)] pl-5">
              <span className="text-sm font-semibold text-[var(--brand)]">Step {i + 1}</span>
              <h3 className="mt-1 text-xl font-bold">{t}</h3>
              <p className="mt-2 text-[var(--muted)]">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-[var(--paper)]">
        <div className="mx-auto grid max-w-6xl gap-x-12 px-5 py-16 md:grid-cols-2">
          <h2 className="text-3xl font-bold md:sticky md:top-24 md:self-start">Built to keep the register clean and safe</h2>
          <dl className="divide-y divide-[var(--line)]">
            {points.map(([t, d]) => (
              <div key={t} className="py-5 first:pt-0"><dt className="font-bold">{t}</dt><dd className="mt-1 text-[var(--muted)]">{d}</dd></div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 text-center">
        <h2 className="text-3xl font-bold">Already registered?</h2>
        <p className="mt-2 text-[var(--muted)]">Log in with the phone number and password the Directorate gave you.</p>
        <Link href="/login" className="mt-6 inline-block rounded-lg bg-[var(--brand)] px-8 py-3 font-semibold text-white hover:bg-[var(--brand-dark)]">Login</Link>
      </section>

      <footer className="border-t border-[var(--line)] px-5 py-6 text-center text-sm text-[var(--muted)]">
        PGCC Directorate, Kano · All Progressives Congress · 2027 Campaign
      </footer>
    </main>
  );
}
