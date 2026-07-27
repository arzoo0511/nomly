"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, LayoutGrid, LogOut, Menu, Moon, PlusCircle, Sun, User as UserIcon } from "lucide-react";
import Logo from "@/components/ui/Logo";
import Avatar from "@/components/ui/Avatar";
import { buttonClasses } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useDarkMode } from "@/hooks/useDarkMode";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const { isDark, toggle: toggleDarkMode } = useDarkMode();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useClickOutside<HTMLDivElement>(() => setMenuOpen(false), menuOpen);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border-subtle bg-surface/95 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-[1280px] items-center justify-between px-4 md:px-8">
        <Link href="/" className="shrink-0">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link
            href="/host"
            className="rounded-full px-4 py-2 text-sm font-semibold text-ink-700 transition-colors hover:bg-ink-100"
          >
            Host your place
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleDarkMode}
            className="rounded-full p-2 text-ink-700 hover:bg-ink-100 cursor-pointer"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <Sun size={19} /> : <Moon size={19} />}
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="rounded-full p-2 text-ink-700 hover:bg-ink-100 md:hidden cursor-pointer"
            aria-label="Toggle menu"
          >
            <Menu size={22} />
          </button>

          <div className="relative hidden md:block" ref={menuRef}>
            {!isLoading && !user ? (
              <div className="flex items-center gap-2">
                <Link href="/login" className={buttonClasses("ghost", "sm")}>
                  Log in
                </Link>
                <Link href="/signup" className={buttonClasses("primary", "sm")}>
                  Sign up
                </Link>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-ink-200 py-1 pl-3 pr-1 hover:shadow-md cursor-pointer"
              >
                <Menu size={16} className="text-ink-700" />
                {user ? (
                  <Avatar seed={user.avatar_seed} name={user.full_name} size={30} />
                ) : (
                  <span className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-ink-200">
                    <UserIcon size={16} className="text-ink-600" />
                  </span>
                )}
              </button>
            )}

            {menuOpen && user && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-border-subtle bg-surface py-2 shadow-xl">
                <p className="truncate px-4 py-2 text-sm font-semibold text-ink-900">{user.full_name}</p>
                <MenuLink href="/trips" icon={LayoutGrid} onClick={() => setMenuOpen(false)}>
                  My trips
                </MenuLink>
                <MenuLink href="/favorites" icon={Heart} onClick={() => setMenuOpen(false)}>
                  Wishlist
                </MenuLink>
                <MenuLink href="/host" icon={PlusCircle} onClick={() => setMenuOpen(false)}>
                  Host dashboard
                </MenuLink>
                <div className="my-1 border-t border-border-subtle" />
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-ink-700 hover:bg-ink-100 cursor-pointer"
                >
                  <LogOut size={16} /> Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-border-subtle px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            <Link href="/host" className={mobileLinkClass} onClick={() => setMobileOpen(false)}>
              Host your place
            </Link>
            {user ? (
              <>
                <Link href="/trips" className={mobileLinkClass} onClick={() => setMobileOpen(false)}>
                  My trips
                </Link>
                <Link href="/favorites" className={mobileLinkClass} onClick={() => setMobileOpen(false)}>
                  Wishlist
                </Link>
                <Link href="/host" className={mobileLinkClass} onClick={() => setMobileOpen(false)}>
                  Host dashboard
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    handleLogout();
                  }}
                  className={cn(mobileLinkClass, "text-left cursor-pointer")}
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className={mobileLinkClass} onClick={() => setMobileOpen(false)}>
                  Log in
                </Link>
                <Link href="/signup" className={mobileLinkClass} onClick={() => setMobileOpen(false)}>
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

const mobileLinkClass = "rounded-xl px-3 py-2.5 text-sm font-semibold text-ink-700 hover:bg-ink-100";

function MenuLink({
  href,
  icon: Icon,
  children,
  onClick,
}: {
  href: string;
  icon: typeof LayoutGrid;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-100"
    >
      <Icon size={16} />
      {children}
    </Link>
  );
}
