"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, ShoppingBag, SquareStack, Summary, UsersRound, X,   } from "lucide-react";
import { toast } from "react-toastify";
import { UserRound } from "lucide-react";

const navigation = [
  {
    name: "Overview",
    href: "/dashboard",
    icon: <Summary/>,
  },
  {
    name: "Customers",
    href: "/customer",
    icon: <UsersRound/>,
  },
  {
    name: "Categories",
    href: "/category",
    icon: <SquareStack/>,
  },
  {
    name: "Orders",
    href: "/orders",
    icon: <ShoppingBag/>,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close sidebar when route changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged out successfully!");
    window.location.href = "/";
  };

  if (!mounted) return null;

  return (
    <>
      {/* Mobile Header */}
      <div className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center border-b border-card-border bg-card-bg bg-brand-primary text-app-text md:hidden">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex items-center justify-center px-4 py-3"
          aria-label="Toggle menu"
        >
          {sidebarOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
        <h1 className="text-xl font-bold">
          Laundry<span className="text-brand-primary">App</span>
        </h1>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-card-border  bg-card-bg text-app-text transition-transform duration-300 md:z-50 md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Logo - Desktop Only */}
        <div className="hidden h-20 items-center border-b border-card-border px-6 md:flex">
          <h1 className="text-2xl font-bold">
            Laundry<span className="text-brand-primary">App</span>
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6">
          {/**<p className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Menu
          </p> */}

          <div className="space-y-2">
            {navigation.map((item) => {
              const isActive =
                pathname === item.href ||
                pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-4 rounded-lg px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-brand-primary text-white"
                      : "text-grey-surface hover:bg-grey-light hover:text-app-text dark:hover:bg-grey-dark"
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Bottom - Logout */}
        <div className="border-t border-card-border p-4">
          <button
            className="flex w-full items-center gap-4 rounded-lg px-4 py-3 text-sm text-grey-surface transition hover:bg-grey-light hover:text-app-text dark:hover:bg-grey-dark"
            onClick={handleLogout}
          >
            <span className="text-lg">↪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Spacer - Desktop Only */}
      <div className="hidden md:block md:w-64" />
    </>
  );
}