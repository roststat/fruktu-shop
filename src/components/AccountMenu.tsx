"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { MessengerUser } from "@/lib/messengerBridge";

interface AccountMenuProps {
  user: MessengerUser | null;
}

const MENU_ITEMS = [
  { href: "/addresses", icon: "📍", label: "Мои адреса" },
  { href: "/history", icon: "🧺", label: "Мои заказы" },
  { href: "/referral", icon: "🎁", label: "Мои рекомендации" },
];

export default function AccountMenu({ user }: AccountMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-[10px] bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary-dark"
      >
        {user?.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.photoUrl} alt="" className="h-5 w-5 rounded-full" />
        ) : (
          <span aria-hidden>👤</span>
        )}
        Личный кабинет
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-48 rounded-[10px] border border-black/5 bg-background py-1 shadow-lg">
          {MENU_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-primary-dark hover:bg-primary/10"
            >
              <span aria-hidden>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
