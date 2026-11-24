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
      <header className="sticky top-0 z-10 border-b border-(--line) bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <Link href="/" aria-label="Home" className="flex items-center gap-2 font-[family-name:var(--font-display)] text-lg font-bold text-[var(--brand)]"><img src="/apc.png" alt="" className="h-9 w-9" />Organization Database</Link>
          <nav className="flex items-center gap-5 text-sm">
            <a href="#how" className="hidden text-(--muted) hover:text-(--ink) sm:block">How it works</a>
            <Link href="/login" className="rounded-lg bg-(--brand) px-4 py-2 font-semibold text-white hover:bg-(--brand-dark)">Login</Link>
          </nav>
        </div>
      </header>

      <section className="home-hero text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-12 sm:py-16 md:grid-cols-2 md:gap-14 md:py-20">
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-amber-200">APC Kano State · 2027</p>
            <h1 className="max-w-2xl text-4xl font-extrabold leading-[1.08] sm:text-5xl">Every support group in Kano, registered and verified in one place.</h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-green-100 sm:text-lg">A trusted register for the APC Kano State 2027 campaign. Sign in to manage your group or verify its registration.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/login" className="rounded-xl bg-(--gold) px-6 py-3 text-center font-bold text-(--ink) shadow-lg shadow-black/10 hover:brightness-95">Login to your group</Link>
              <Link href="/apply" className="rounded-xl border border-white/40 px-6 py-3 text-center font-semibold hover:bg-white/10">Register your group</Link>
            </div>
          </div>

          <form id="verify" action="/verify" className="rounded-2xl bg-white p-5 text-(--ink) shadow-2xl shadow-black/20 ring-1 ring-white/70 sm:p-7">
            <p className="text-sm font-bold uppercase tracking-wide text-(--brand)">Public register</p>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Is this group registered?</h2>
            <label htmlFor="regNo" className="mt-5 block text-sm font-medium">Registration number</label>
            <input id="regNo" name="regNo" placeholder="PGCC/KN/2027/00001" className="mt-1 w-full" required />
            <button className="mt-4 w-full rounded-xl bg-(--brand) py-3 font-semibold text-white shadow-sm hover:bg-(--brand-dark)">Check registration</button>
            <p className="mt-3 text-xs text-(--muted)">You will see the group name, level and status only.</p>
          </form>
        </div>
      </section>

      <section id="how" className="mx-auto max-w-6xl px-5 py-14 sm:py-16">
        <h2 className="text-3xl font-bold sm:text-4xl">How registration works</h2>
        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          {steps.map(([t, d], i) => (
            <li key={t} className="rounded-2xl border border-(--line) bg-white p-5 shadow-sm sm:p-6">
              <span className="text-sm font-semibold text-(--brand)">Step {i + 1}</span>
              <h3 className="mt-1 text-xl font-bold">{t}</h3>
              <p className="mt-2 text-(--muted)">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-(--paper)">
        <div className="mx-auto grid max-w-6xl gap-x-12 gap-y-6 px-5 py-14 sm:py-16 md:grid-cols-2">
          <h2 className="text-3xl font-bold sm:text-4xl md:sticky md:top-24 md:self-start">Built to keep the register clean and safe</h2>
          <dl className="divide-y divide-(--line)">
            {points.map(([t, d]) => (
              <div key={t} className="py-5 first:pt-0"><dt className="font-bold">{t}</dt><dd className="mt-1 text-(--muted)">{d}</dd></div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 text-center">
        <h2 className="text-3xl font-bold">Already registered?</h2>
        <p className="mt-2 text-(--muted)">Log in with the phone number and password the Directorate gave you.</p>
        <Link href="/login" className="mt-6 inline-block rounded-lg bg-(--brand) px-8 py-3 font-semibold text-white hover:bg-(--brand-dark)">Login</Link>
      </section>

      <footer className="border-t border-(--line) px-5 py-6 text-center text-sm text-(--muted)">
        PGCC Directorate, Kano · All Progressives Congress · 2027 Campaign
      </footer>
    </main>
  );
}
