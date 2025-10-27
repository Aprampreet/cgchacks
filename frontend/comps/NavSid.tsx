"use client";
import Link from "next/link";
import { useState, useEffect, ReactNode, useRef } from "react";
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
  User,
  Settings,
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
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle responsive view
  useEffect(() => {
    const updateView = () => {
      const mobile = window.innerWidth < 640;
      setIsMobile(mobile);
      if (!mobile) setIsOpen(false);
    };
    updateView();
    window.addEventListener("resize", updateView);
    return () => window.removeEventListener("resize", updateView);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    if (isMobile) setIsOpen(false);
  }, [pathname, isMobile]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobile, isOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      setShowDropdown(false);
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
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
        { name: "Profile", href: "/profile", icon: User },
        { name: "Settings", href: "/settings", icon: Settings },
        { name: "Logout", onClick: handleLogout, href: "#", icon: LogOut },
      ]
    : [
        { name: "Login", href: "/login" },
        { name: "Register", href: "/register" },
      ];

  return (
    <div className="flex min-h-screen bg-[#070708] text-white font-inter">
      {/* Mobile overlay */}
      {isOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30 sm:hidden animate-in fade-in-0 duration-200"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 flex flex-col justify-between transition-transform duration-300 ease-in-out z-40
          bg-gradient-to-b from-[#101012] to-[#070708] border-r border-white/10 shadow-[0_0_30px_rgba(0,255,255,0.05)]
          ${isOpen ? "translate-x-0" : "-translate-x-full"} sm:translate-x-0`}
        aria-label="Main navigation"
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
            <Link 
              href="/"
              className="flex items-center gap-2 group"
              onClick={() => isMobile && setIsOpen(false)}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-500 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)] group-hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-shadow">
                <Scan size={18} className="text-white" />
              </div>
              <h2 className="text-xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                DeepVision
              </h2>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="sm:hidden hover:bg-white/10 h-8 w-8"
              onClick={() => setIsOpen(false)}
              aria-label="Close sidebar"
            >
              <X size={20} />
            </Button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto px-4 py-6" aria-label="Sidebar navigation">
            <ul className="flex flex-col gap-1">
              {sidebarLinks.map(({ name, href, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <li key={name}>
                    <Link
                      href={href}
                      onClick={() => isMobile && setIsOpen(false)}
                      className={`group flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 relative
                        ${
                          active
                            ? "bg-gradient-to-r from-cyan-600/90 to-blue-600/90 text-white shadow-[0_0_15px_rgba(6,182,212,0.25)]"
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                        }`}
                      aria-current={active ? "page" : undefined}
                    >
                      <Icon
                        size={20}
                        className={`transition-all duration-200 flex-shrink-0 ${
                          active
                            ? "text-white"
                            : "text-gray-400 group-hover:text-cyan-400 group-hover:scale-105"
                        }`}
                      />
                      <span className="truncate">{name}</span>
                      {active && (
                        <span className="absolute right-3 w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_8px_#06b6d4] animate-pulse" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="px-6 py-4 text-xs text-gray-500 border-t border-white/10">
            <p className="flex items-center gap-1">
              <span className="text-gray-600">©</span> 2025 DeepVision Labs
            </p>
            <p className="text-gray-600 mt-1">All rights reserved</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col sm:ml-64 transition-all">
        {/* Navbar */}
        <header className="flex items-center justify-between px-4 sm:px-6 py-3 sticky top-0 backdrop-blur-xl bg-[#0c0c0e]/90 border-b border-white/10 z-30 shadow-[0_0_20px_rgba(0,255,255,0.05)]">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="sm:hidden hover:bg-white/10 h-9 w-9"
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
            >
              <Menu size={20} />
            </Button>
            <h1 className="text-sm sm:text-base font-medium text-gray-300 truncate">
              {isAuth && user ? `Welcome, ${user.username}` : "Welcome to DeepVision"}
            </h1>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Docs Link */}
            {navbarLinks.map(({ name, href, icon: Icon }) => (
              <Link
                key={name}
                href={href}
                className="hidden sm:flex items-center gap-2 text-sm text-gray-400 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-all duration-200"
              >
                <Icon size={16} />
                <span>{name}</span>
              </Link>
            ))}

            {/* User Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown((prev) => !prev)}
                className="flex items-center gap-2 cursor-pointer select-none rounded-full bg-[#111113] border border-cyan-700/40 px-2 sm:px-3 py-1.5 hover:border-cyan-400/60 hover:shadow-[0_0_12px_rgba(6,182,212,0.3)] transition-all duration-200"
                aria-expanded={showDropdown}
                aria-haspopup="true"
                aria-label="User menu"
              >
                <img
                  src={user?.avatar_url || "/default-avatar.png"}
                  alt={user?.username || "User avatar"}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-cyan-500/50 shadow-[0_0_8px_rgba(6,182,212,0.3)]"
                />
                <span className="hidden sm:inline text-sm text-gray-200 capitalize max-w-[100px] truncate">
                  {user?.username || "Guest"}
                </span>
                <ChevronDown 
                  size={14} 
                  className={`hidden sm:inline text-gray-400 transition-transform duration-200 ${
                    showDropdown ? "rotate-180" : ""
                  }`} 
                />
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div 
                  className="absolute right-0 mt-2 w-48 bg-[#101012] border border-white/10 rounded-lg shadow-[0_0_25px_rgba(0,255,255,0.15)] z-40 overflow-hidden animate-in fade-in-0 slide-in-from-top-2 duration-200"
                  role="menu"
                >
                  {isAuth && user && (
                    <div className="px-4 py-3 border-b border-white/10">
                      <p className="text-sm font-medium text-white truncate">{user.username}</p>
                      <p className="text-xs text-gray-400 truncate mt-0.5">{user.email}</p>
                    </div>
                  )}
                  
                  <div className="py-1">
                    {dropdownLinks.map((item) => {
                      const Icon = item.icon;
                      
                      if (item.name === "Logout") {
                        return (
                          <button
                            key={item.name}
                            onClick={item.onClick}
                            className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
                            role="menuitem"
                          >
                            {Icon && <Icon size={16} />}
                            <span>{item.name}</span>
                          </button>
                        );
                      }
                      
                      return (
                        <Link
                          key={item.name}
                          href={item.href!}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-cyan-500/10 hover:text-cyan-300 transition-all duration-200"
                          onClick={() => setShowDropdown(false)}
                          role="menuitem"
                        >
                          {Icon && <Icon size={16} />}
                          <span>{item.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 bg-[#070708] overflow-y-auto" role="main">
          {children}
        </main>
      </div>
    </div>
  );
}