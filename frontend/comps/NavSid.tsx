"use client";
import Link from "next/link";
import { useState, useEffect, ReactNode } from "react";
import {
  Menu,
  X,
  ChevronDown,
  LogOut,
  LayoutDashboard,
  History,
  Scan,
  Newspaper,
  Users,
  HelpCircle,
  Info,
  Phone,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";

interface NavSidProps {
  children: ReactNode;
}

export default function NavSid({ children }: NavSidProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { isAuth, user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

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
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "My History", href: "/history", icon: History },
        { name: "Deepfake Detection", href: "/upload", icon: Scan },
        { name: "News", href: "/news", icon: Newspaper },
        { name: "Team", href: "/team", icon: Users },
        { name: "Help", href: "/help", icon: HelpCircle },
      ]
    : [
        { name: "Help", href: "/help", icon: HelpCircle },
        { name: "About", href: "/about", icon: Info },
        { name: "Contact", href: "/contact", icon: Phone },
      ];

  const navbarLinks = [{ name: "Docs", href: "/docs", icon: FileText }];

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
    <div className="flex min-h-screen bg-[#070708] text-white font-inter">
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30 sm:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 flex flex-col justify-between transition-all duration-300 ease-in-out z-40
          bg-gradient-to-b from-[#101012] to-[#070708] border-r border-white/10 shadow-[0_0_30px_rgba(0,255,255,0.05)]
          ${isOpen ? "translate-x-0" : "-translate-x-full"} sm:translate-x-0`}
      >
        <div className="flex flex-col h-full p-6">
          {/* Logo */}
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent animate-pulse-slow">
              DeepVision
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

          {/* Links */}
          <nav className="flex flex-col gap-2">
            {sidebarLinks.map(({ name, href, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={name}
                  href={href}
                  onClick={() => isMobile && setIsOpen(false)}
                  className={`group flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all relative
                    ${
                      active
                        ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-[0_0_15px_rgba(0,255,255,0.2)]"
                        : "text-gray-400 hover:text-white hover:bg-white/10"
                    }`}
                >
                  <Icon
                    size={18}
                    className={`transition-transform duration-300 ${
                      active
                        ? "text-white scale-110"
                        : "text-gray-400 group-hover:text-cyan-400 group-hover:scale-110"
                    }`}
                  />
                  <span>{name}</span>
                  {active && (
                    <span className="absolute right-2 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4]" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto text-xs text-gray-500 border-t border-white/10 pt-4">
            <p>© 2025 DeepVision Labs</p>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col sm:ml-64 transition-all">
        {/* Navbar */}
        <header className="flex items-center justify-between px-6 py-3 sticky top-0 backdrop-blur-2xl bg-[#0c0c0e]/80 border-b border-white/10 z-30 shadow-[0_0_20px_rgba(0,255,255,0.05)]">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="sm:hidden hover:bg-white/10"
              onClick={() => setIsOpen(!isOpen)}
            >
              <Menu size={22} />
            </Button>
            <h1 className="text-base font-medium text-gray-300">
              {isAuth && user ? `Welcome, ${user.username}` : "Welcome"}
            </h1>
          </div>

          {/* Right */}
          <div className="flex items-center gap-4">
            {navbarLinks.map(({ name, href, icon: Icon }) => (
              <Link
                key={name}
                href={href}
                className="hidden sm:flex items-center gap-1 text-sm text-gray-400 hover:text-white px-3 py-2 rounded-md hover:bg-white/10 transition-all"
              >
                <Icon size={16} />
                {name}
              </Link>
            ))}

            {/* Dropdown */}
            <div className="relative">
              <div
                onClick={() => setShowDropdown((prev) => !prev)}
                className="flex items-center gap-2 cursor-pointer select-none rounded-full bg-[#111113] border border-cyan-700/50 px-3 py-1.5 hover:border-cyan-400/70 hover:shadow-[0_0_10px_rgba(6,182,212,0.4)] transition-all"
              >
                <img
                  src={user?.avatar_url || "/default-avatar.png"}
                  alt="avatar"
                  className="w-8 h-8 rounded-full object-cover border border-cyan-500 shadow-[0_0_10px_#06b6d4]"
                />
                <span className="text-sm text-gray-200 capitalize">
                  {user?.username || "Guest"}
                </span>
                <ChevronDown size={14} className="text-gray-400" />
              </div>

              {showDropdown && (
                <div className="absolute right-0 mt-3 w-44 bg-[#101012] border border-white/10 rounded-md shadow-[0_0_20px_rgba(0,255,255,0.1)] z-40 overflow-hidden animate-in fade-in-80 scale-in-95">
                  {dropdownLinks.map((item) =>
                    item.name === "Logout" ? (
                      <button
                        key={item.name}
                        onClick={item.onClick}
                        className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-cyan-500/10 hover:text-cyan-300 transition-all"
                      >
                        <LogOut size={14} />
                        {item.name}
                      </button>
                    ) : (
                      <Link
                        key={item.name}
                        href={item.href!}
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-cyan-500/10 hover:text-cyan-300 transition-all"
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

        {/* Main Content */}
        <main className="flex-1 p-6 bg-[#070708] overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
