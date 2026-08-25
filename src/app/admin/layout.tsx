"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "@/hooks/useAdmin";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { isAdmin, loading, error } = useAdmin();
  const router = useRouter();
  const hasResolvedRef = useRef(false);

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push("/dashboard");
    }
    if (!loading) {
      hasResolvedRef.current = true;
    }
  }, [isAdmin, loading, router]);

  // Avoid unmounting admin pages on background auth re-checks
  if (loading && !hasResolvedRef.current) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex h-64 items-center justify-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!loading && (error || !isAdmin)) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              You don&apos;t have admin privileges to access this page.
            </p>
            <Link href="/dashboard">
              <Button>Go to User Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
