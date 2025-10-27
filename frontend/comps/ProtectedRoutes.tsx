"use client";
import { useAuth } from "@/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProtectedRoutesProps {
  children: React.ReactNode;
}

const publicRoutes = ["/login", "/register", "/", "/about"];

export default function ProtectedRoutes({ children }: ProtectedRoutesProps) {
  const { isAuth } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublic = publicRoutes.includes(pathname);

  useEffect(() => {
    if (!isAuth && !isPublic) {
      router.push("/login");
    }
  }, [isAuth, isPublic, router]);

  if (!isAuth && !isPublic) {
    return (
      <div className="flex items-center justify-center h-screen text-white">
        Redirecting to login...
      </div>
    );
  }

  return <>{children}</>;
}
