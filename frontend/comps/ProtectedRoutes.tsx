"use client";
import { useAuth } from "@/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProtectedRoutesProps {
  children: React.ReactNode;
}

const publicRoutes = ["/login", "/register", "/", "/about"];

export default function ProtectedRoutes({ children }: ProtectedRoutesProps) {
  const { isAuth, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublic = publicRoutes.includes(pathname);

  useEffect(() => {
    if (!loading && !isAuth && !isPublic) {
      router.push("/login");
    }
  }, [isAuth, isPublic, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#09090b] text-gray-400 text-sm">
        Checking authentication...
      </div>
    );
  }

  if (!isAuth && !isPublic) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#09090b] text-gray-400 text-sm">
        Redirecting to login...
      </div>
    );
  }

  return <>{children}</>;
}
