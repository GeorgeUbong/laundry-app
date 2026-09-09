"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, ShoppingBag, SquareStack, Summary, UsersRound, X,   } from "lucide-react";
import { toast } from "react-toastify";

const navigation = [
  {
    name: "Overview",
    href: "/admin/dashboard",
    icon: <Summary/>,
  },
  {
    name: "Items",
    href: "/admin/item",
    icon: <UsersRound/>,
  },
  {
    name: "Categories",
    href: "/admin/category",
    icon: <SquareStack/>,
  },
  {
    name: "Orders",
    href: "/admin/orders",
    icon: <ShoppingBag/>,
  },
  {
    name: "Customers",
    href: "/admin/customer",
    icon: <UsersRound/>,
  },
];

export default function SidebarAdmin() {
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
    toast.success("Logged out successfully!");
    window.location.href = "/admin";
  };

  if (!mounted) return null;

  return (
    <>
      {/* Mobile Header */}
      <div className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center border-b border-gray-800 bg-gray-950 text-white md:hidden">
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
          Laundry<span className="text-green-500">App</span>
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
        className={`fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-gray-800 bg-gray-950 text-white transition-transform duration-300 md:z-50 md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Logo - Desktop Only */}
        <div className="hidden h-20 items-center border-b border-gray-800 px-6 md:flex">
          <h1 className="text-2xl font-bold">
            Laundry<span className="text-green-500">App</span>
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
                      ? "bg-green-600 text-white"
                      : "text-gray-400 hover:bg-gray-900 hover:text-white"
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
        <div className="border-t border-gray-800 p-4">
          <button
            className="flex w-full items-center gap-4 rounded-lg px-4 py-3 text-sm text-gray-400 transition hover:bg-gray-900 hover:text-white"
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