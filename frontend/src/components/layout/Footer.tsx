import Link from "next/link";

const footerLinkClass = "text-sm text-ink-600 hover:underline";

export default function Footer() {
  return (
    <footer className="border-t border-border-subtle bg-surface-muted">
      <div className="mx-auto max-w-[1280px] px-4 py-10 md:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div>
            <p className="mb-3 text-sm font-semibold text-ink-900">Explore</p>
            <nav className="flex flex-col gap-2.5">
              <Link href="/" className={footerLinkClass}>
                Home
              </Link>
              <Link href="/favorites" className={footerLinkClass}>
                Wishlist
              </Link>
              <Link href="/trips" className={footerLinkClass}>
                My trips
              </Link>
            </nav>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-ink-900">Hosting</p>
            <nav className="flex flex-col gap-2.5">
              <Link href="/host" className={footerLinkClass}>
                Host your place
              </Link>
            </nav>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-ink-900">Coming soon</p>
            <nav className="flex flex-col gap-2.5">
              <Link href="/messages" className={footerLinkClass}>
                Messages
              </Link>
              <Link href="/verify-identity" className={footerLinkClass}>
                Identity verification
              </Link>
            </nav>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-ink-900">About</p>
            <p className="text-sm text-ink-600">
              Nomly is a demo marketplace built for a coding assignment. Payments and messaging are mocked.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-border-subtle pt-6 text-xs text-ink-500 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Nomly, Inc.</p>
          <p>Built with Next.js + FastAPI</p>
        </div>
      </div>
    </footer>
  );
}
