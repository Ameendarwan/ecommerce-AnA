"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/requireAdmin";
import { adminUserServerService } from "@/services/admin/adminUserServerService";

/**
 * Server action to update user role
 * Strictly accessible only by verified Supabase admin users
 */
export async function updateUserRoleAction(
  userId: string,
  role: "admin" | "user",
) {
  try {
    const authResult = await requireAdmin();
    if (!authResult.ok) {
      return {
        success: false,
        message: authResult.error,
      };
    }

    // Prevent an admin from demoting their own account
    if (authResult.userId === userId && role !== "admin") {
      return {
        success: false,
        message: "Cannot demote your own admin account",
      };
    }

    // Update user role
    const result = await adminUserServerService.updateUserRole(userId, role);

    if (!result) {
      return {
        success: false,
        message: "Failed to update user role",
      };
    }

    // Revalidate the admin users page to show updated data
    revalidatePath("/admin/users");

    return { success: true, message: `User role updated to ${role}` };
  } catch (error) {
    console.error("Error updating user role:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to update user role",
    };
  }
}

/**
 * Server action to delete user
 * Strictly accessible only by verified Supabase admin users
 */
export async function deleteUserAction(userId: string) {
  try {
    const authResult = await requireAdmin();
    if (!authResult.ok) {
      return {
        success: false,
        message: authResult.error,
      };
    }

    // Prevent admin from deleting themselves
    if (authResult.userId === userId) {
      return {
        success: false,
        message: "Cannot delete your own account",
      };
    }

    // Delete user
    const success = await adminUserServerService.deleteUser(userId);

    if (!success) {
      return {
        success: false,
        message: "Failed to delete user",
      };
    }

    // Revalidate the admin users page to show updated data
    revalidatePath("/admin/users");

    return { success: true, message: "User deleted successfully" };
  } catch (error) {
    console.error("Error deleting user:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete user",
    };
  }
}
