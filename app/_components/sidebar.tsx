"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export default function EmployeeSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);

  // =====================================================
  // NAVIGATION ITEMS
  // =====================================================

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: "⌂",
    },
    {
      name: "Customers",
      href: "/customers",
      icon: "👥",
    },
    {
      name: "Orders",
      href: "/orders",
      icon: "📦",
    },
  ];

  // =====================================================
  // LOGOUT
  // =====================================================

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    router.push("/");
  }

  return (
    <>
      {/* =====================================================
          MOBILE HEADER
      ===================================================== */}

      <div className="fixed left-0 top-0 z-40 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white px-4 lg:hidden">

        <div>
          <h1 className="text-lg font-bold text-gray-900">
            Laundry Logo
          </h1>

          <p className="text-xs text-gray-500">
            Employee Portal
          </p>
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className="rounded-lg p-2 text-gray-700 hover:bg-gray-100"
          aria-label="Open menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.8}
            stroke="currentColor"
            className="h-6 w-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        </button>

      </div>


      {/* =====================================================
          MOBILE OVERLAY
      ===================================================== */}

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}


      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-72 flex-col border-r border-gray-200 bg-white transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >

        {/* =====================================================
            LOGO
        ===================================================== */}

        <div className="flex h-20 items-center justify-between border-b border-gray-100 px-6">

          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Laundry
            </h1>

            <p className="mt-0.5 text-xs text-gray-500">
              Employee Portal
            </p>
          </div>

          {/* Mobile close button */}
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
            aria-label="Close menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>

        </div>


        {/* =====================================================
            NAVIGATION
        ===================================================== */}

        <nav className="flex-1 px-4 py-6">

          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Menu
          </p>

          <div className="space-y-1">

            {navigation.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >

                  <span className="flex h-8 w-8 items-center justify-center text-lg">
                    {item.icon}
                  </span>

                  <span>
                    {item.name}
                  </span>

                </Link>
              );
            })}

          </div>

        </nav>


        {/* =====================================================
            EMPLOYEE PROFILE
        ===================================================== */}

        <div className="border-t border-gray-100 p-4">

          <div className="mb-3 flex items-center gap-3 rounded-xl bg-gray-50 p-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-600">
              E
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900">
                Employee
              </p>

              <p className="truncate text-xs text-gray-500">
                Employee account
              </p>
            </div>

          </div>


          {/* Logout */}

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
          >

            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="currentColor"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6A2.25 2.25 0 0 0 5.25 5.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15"
              />

              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18 15l3-3m0 0-3-3m3 3H9"
              />
            </svg>

            <span>Logout</span>

          </button>

        </div>

      </aside>
    </>
  );
}