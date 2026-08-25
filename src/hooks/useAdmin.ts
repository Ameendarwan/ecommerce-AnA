"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase/client";

interface AdminData {
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook to check if the current user has admin privileges
 * Uses the admin_users view which filters profiles where role='admin'
 */
export function useAdmin(): AdminData {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const checkedUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const userId = user?.id ?? null;

    const checkAdminStatus = async () => {
      // Wait for auth to finish before treating "no user" as non-admin.
      // Otherwise a refresh redirects away from /admin/* while session loads.
      if (authLoading) {
        setLoading(true);
        return;
      }

      if (!userId) {
        checkedUserIdRef.current = null;
        setIsAdmin(false);
        setLoading(false);
        setError(null);
        return;
      }

      // Same user — skip re-check (avoids focus/token-refresh remounts)
      if (checkedUserIdRef.current === userId) {
        setLoading(false);
        return;
      }

      // Only show loading on first check for this user
      if (checkedUserIdRef.current !== userId) {
        setLoading(true);
      }
      setError(null);

      try {
        const { data, error: queryError } = await supabase
          .from("admin_users")
          .select("profile_id")
          .eq("profile_id", userId)
          .single();

        if (cancelled) return;

        if (queryError) {
          if (queryError.code === "PGRST116") {
            setIsAdmin(false);
          } else {
            console.error("Error checking admin status:", queryError);
            setError("Failed to verify admin status");
            setIsAdmin(false);
          }
        } else {
          setIsAdmin(!!data);
        }
        checkedUserIdRef.current = userId;
      } catch (err) {
        if (cancelled) return;
        console.error("Unexpected error checking admin status:", err);
        setError("Unexpected error occurred");
        setIsAdmin(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void checkAdminStatus();

    return () => {
      cancelled = true;
    };
  }, [user?.id, authLoading]);

  return { isAdmin, loading: authLoading || loading, error };
}

/**
 * Utility function to check admin status without hooks
 * Useful for server-side or one-time checks
 */
export async function checkIsAdmin(userId: string): Promise<boolean> {
  if (!userId) return false;

  try {
    const { data, error } = await supabase
      .from("admin_users")
      .select("profile_id")
      .eq("profile_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return false;
      }
      console.error("Error checking admin status:", error);
      return false;
    }

    return !!data;
  } catch (err) {
    console.error("Unexpected error checking admin status:", err);
    return false;
  }
}
