import type { ReactNode } from "react";
import Link from "next/link";
import { Package, LifeBuoy, LogOut } from "lucide-react";

type AccountShellProps = {
  name: string;
  email: string | null;
  active: "orders" | "tickets";
  children: ReactNode;
};

const NAV = [
  { key: "orders", href: "/account", label: "Orders", icon: Package },
  { key: "tickets", href: "/account/tickets", label: "Warranty Tickets", icon: LifeBuoy },
] as const;

export default function AccountShell({ name, email, active, children }: AccountShellProps) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  return (
    <main className="mx-auto max-w-[900px] px-4 pb-24 pt-32 sm:px-6 sm:pt-40">
      <p className="mb-6 text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-gold/80">
        My Account
      </p>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr] lg:items-start lg:gap-10">
        <aside className="glass rounded-3xl p-6 lg:sticky lg:top-28">
          <div className="flex items-center gap-4">
            <div className="gold-glow flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gold font-display text-xl font-bold text-black">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-lg font-bold text-offwhite">{name}</p>
              {email && <p className="truncate text-sm text-offwhite/50">{email}</p>}
            </div>
            <a
              href="/account/logout"
              aria-label="Log out"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 text-offwhite/60 transition-colors hover:border-red-400/40 hover:text-red-300 lg:hidden"
            >
              <LogOut size={16} />
            </a>
          </div>

          <nav className="mt-6 flex gap-2 overflow-x-auto pb-1 lg:mt-8 lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0">
            {NAV.map((item) => {
              const Icon = item.icon;
              const isActive = item.key === active;
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`flex shrink-0 items-center gap-3 whitespace-nowrap rounded-2xl border px-4 py-3 text-sm font-semibold transition-colors ${
                    isActive
                      ? "border-gold/30 bg-gold/10 text-gold"
                      : "border-transparent text-offwhite/60 hover:bg-white/5 hover:text-offwhite"
                  }`}
                >
                  <Icon size={17} className="shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <a
            href="/account/logout"
            className="btn-outline mt-8 hidden w-full items-center justify-center gap-2 lg:flex"
          >
            <LogOut size={15} />
            Log out
          </a>
        </aside>

        <div className="min-w-0">{children}</div>
      </div>
    </main>
  );
}
