import Link from "next/link";
import Logo from "@/components/ui/Logo";

// Deliberately always-dark, independent of the site-wide light/dark toggle --
// a fixed color band (not the theme-relative ink-* scale) so it can't
// accidentally invert to a bright band when a visitor switches to dark mode.
const footerLinkClass = "text-sm text-[#b8afc9] transition-colors hover:text-white";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#1a1523] text-[#b8afc9]">
      <div className="brand-gradient-underline h-[3px] w-full" />
      <div className="brand-blob brand-blob-violet -right-24 -top-24 h-72 w-72" style={{ opacity: 0.18 }} />

      <div className="relative z-10 mx-auto max-w-[1280px] px-4 py-14 md:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.3fr_1fr_1fr]">
          <div>
            <Logo onDark />
            <p className="mt-3 max-w-xs text-sm text-[#948aa8]">
              Unique homes, boutique stays, and one-of-a-kind escapes -- booked simply, built for a coding
              assignment.
            </p>
          </div>

          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[#6b6080]">Explore</p>
            <nav className="flex flex-col gap-2.5">
              <Link href="/" className={footerLinkClass}>
                Home
              </Link>
              <Link href="/host" className={footerLinkClass}>
                Host your place
              </Link>
              <Link href="/trips" className={footerLinkClass}>
                My trips
              </Link>
              <Link href="/favorites" className={footerLinkClass}>
                Wishlist
              </Link>
            </nav>
          </div>

          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[#6b6080]">Coming soon</p>
            <nav className="flex flex-col gap-2.5">
              <Link href="/messages" className={footerLinkClass}>
                Messages
              </Link>
              <Link href="/verify-identity" className={footerLinkClass}>
                Identity verification
              </Link>
            </nav>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-[#362d47] pt-6 text-xs text-[#6b6080] md:flex-row md:items-center md:justify-between">
          <p>Nomly is a demo marketplace built for a coding assignment. Payments and messaging are mocked.</p>
          <p>Next.js + FastAPI</p>
        </div>
      </div>
    </footer>
  );
}
