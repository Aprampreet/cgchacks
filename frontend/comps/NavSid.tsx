"use client";
import Link from "next/link";
import { useState, useEffect, ReactNode } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface NavSidProps {
  children: ReactNode;
}

export default function NavSid({ children }: NavSidProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const { isAuth, user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const updateView = () => setIsMobile(window.innerWidth < 640);
    updateView();
    window.addEventListener("resize", updateView);
    return () => window.removeEventListener("resize", updateView);
  }, []);

  const handleLogout = async () => {
    await logout();             
    setShowDropdown(false);    
    router.push("/login");     
  };

  const sidebarLinks = isAuth
    ? [
        { name: "Dashboard", href: "/" },
        { name: "My History", href: "/history" },
        { name: "Deepfake Detection", href: "/upload" },
        { name: "Team", href: "/team" },
        { name: "Settings", href: "/settings" },
        { name: "Help", href: "/help" },
      ]
    : [{ name: "Help", href: "/help" },
      { name: "About", href: "/about" },
      { name: "Contact", href: "/contact" },
      
    ];

  const navbarLinks = isAuth
    ? [
        { name: "Docs", href: "/docs" },
        { name: "Contact", href: "/contact" },
      ]
    : [{ name: "Docs", href: "/docs" }];

  const dropdownLinks = isAuth
    ? [
        { name: "Profile", href: "/profile" },
        { name: "Settings", href: "/settings" },
        { name: "Logout", onClick: handleLogout, href: "#" },
      ]
    : [
        { name: "Login", href: "/login" },
        { name: "Register", href: "/register" },
      ];

  return (
    <div className="flex min-h-screen bg-neutral-950 text-white">
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 sm:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 p-5 transition-transform duration-300 backdrop-blur-lg bg-white/5 border-r border-white/10 z-40
          ${isOpen ? "translate-x-0" : "-translate-x-full"} sm:translate-x-0`}
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Dashboard
          </h2>
          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden hover:bg-white/10"
            onClick={() => setIsOpen(false)}
          >
            <X size={22} />
          </Button>
        </div>

        <nav className="flex flex-col gap-2">
          {sidebarLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="p-3 hover:rounded-lg text-gray-300 hover:bg-white/10 hover:text-white transition-all border-b border-neutral-800"
              onClick={() => isMobile && setIsOpen(false)}
            >
              {link.name}
              
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col sm:ml-64">
        <header className="flex items-center justify-between px-6 py-4 backdrop-blur-md bg-white/5 border-b border-white/10 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="sm:hidden hover:bg-white/10"
              onClick={() => setIsOpen(!isOpen)}
            >
              <Menu size={22} />
            </Button>
            <h1 className="text-lg font-semibold">Welcome</h1>
          </div>

          <div className="relative flex items-center gap-4">
            {/* Navbar links */}
            {navbarLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="hidden sm:block rounded-lg text-gray-300 hover:text-white hover:bg-white/10 p-2 transition-all"
              >
                {link.name}
              </Link>
            ))}

            <div className="relative p-2 bg-neutral-100 border border-cyan-700 rounded-lg cursor-pointer hover:bg-neutral-200 transition-all">
              <div
                className="text-white hover:text-black flex items-center gap-2"
                onClick={() => setShowDropdown((prev) => !prev)}
              >
                {isAuth && user ? (
                  <>
                    <img
                      src={user.avatar_url || "/default-avatar.png"}
                      alt="avatar"
                      className="w-7 h-7 rounded-full object-cover border border-cyan-400 "
                    />
                    <span className="capitalize text-gray-800">{user.username}</span>
                    <ChevronDown size={16}  />
                  </>
                ) : (
                  <>
                    <span className="capitalize text-gray-800  ">Login</span>
                    <ChevronDown size={16} color="black"/>
                  </>
                )}
              </div>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-40 bg-neutral-900 border border-neutral-700 rounded-lg shadow-lg z-40">
                  {dropdownLinks.map((item) =>
                    item.name === "Logout" ? (
                      <button
                        key={item.name}
                        onClick={item.onClick}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-neutral-800 hover:text-white rounded-lg"
                      >
                        {item.name}
                      </button>
                    ) : (
                      <Link
                        key={item.name}
                        href={item.href!}
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-neutral-800 hover:text-white rounded-lg"
                        onClick={() => setShowDropdown(false)}
                      >
                        {item.name}
                      </Link>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="p-6 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
