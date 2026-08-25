"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Eye, MoreVertical, Shield, Trash2, User } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { UserDetailsModal } from "@/components/admin/UserDetailsModal";
import {
  AdminDataTable,
  AdminEntityCell,
  AdminStatusPill,
  AdminTablePagination,
  AdminTableToolbar,
  type AdminDataTableColumn,
} from "@/components/admin/table";
import {
  adminUserService,
  UserFilters,
  UserWithStats,
} from "@/services/admin/adminUserService";

const ROLE_OPTIONS = [
  { value: "all", label: "All Roles" },
  { value: "user", label: "Users" },
  { value: "admin", label: "Admins" },
] as const;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<UserFilters>({});
  const [selectedUser, setSelectedUser] = useState<UserWithStats | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const pageLimit = 10;

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminUserService.getAllUsers(
        filters,
        currentPage,
        pageLimit,
      );
      setUsers(data.users);
      setTotalUsers(data.total);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage]);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users;
    const q = searchTerm.toLowerCase();
    return users.filter(
      (user) =>
        user.username?.toLowerCase().includes(q) ||
        user.email?.toLowerCase().includes(q) ||
        user.profile_id.toLowerCase().includes(q),
    );
  }, [users, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(totalUsers / pageLimit));

  const handleRoleChange = async (
    userId: string,
    role: "admin" | "user",
  ) => {
    try {
      setUpdatingId(userId);
      await adminUserService.updateUserRole(userId, role);
      toast.success(`User role updated to ${role}`);
      await fetchUsers();
    } catch (error) {
      console.error("Error updating user role:", error);
      toast.error("Failed to update user role");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      setUpdatingId(userId);
      await adminUserService.deleteUser(userId);
      toast.success("User deleted");
      await fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete user",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const openDetails = (user: UserWithStats) => {
    setSelectedUser(user);
    setShowDetails(true);
  };

  const columns: AdminDataTableColumn<UserWithStats>[] = useMemo(
    () => [
      {
        key: "user",
        header: "User",
        render: (user) => {
          const name = user.username || user.email || "User";
          const initials = name
            .split(" ")
            .map((part) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

          return (
            <AdminEntityCell
              initials={initials}
              title={name}
              subtitle={user.email || undefined}
              avatarClassName={
                user.role === "admin"
                  ? "bg-violet-100 text-violet-800"
                  : undefined
              }
            />
          );
        },
      },
      {
        key: "joined",
        header: "Joined",
        cellClassName: "text-slate-600",
        render: (user) =>
          user.created_at
            ? format(new Date(user.created_at), "MMM dd, yyyy")
            : "—",
      },
      {
        key: "orders",
        header: "Orders",
        cellClassName: "text-slate-600",
        render: (user) => user.total_orders ?? 0,
      },
      {
        key: "spent",
        header: "Total Spent",
        cellClassName: "font-semibold text-slate-900",
        render: (user) =>
          user.total_spent != null
            ? `Rs ${Math.round(user.total_spent).toLocaleString()}`
            : "—",
      },
      {
        key: "role",
        header: "Role",
        render: (user) => (
          <AdminStatusPill
            label={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            tone={user.role}
          />
        ),
      },
      {
        key: "status",
        header: "Status",
        render: (user) => (
          <AdminStatusPill
            label={user.is_active ? "Active" : "Inactive"}
            tone={user.is_active ? "active" : "inactive"}
          />
        ),
      },
      {
        key: "actions",
        header: "Actions",
        headerClassName: "w-12 text-right",
        cellClassName: "text-right",
        render: (user) => (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  disabled={updatingId === user.profile_id}
                  className="text-muted-foreground hover:bg-muted inline-flex size-9 cursor-pointer items-center justify-center rounded-full transition-colors disabled:pointer-events-none disabled:opacity-50"
                  aria-label={`Actions for ${user.username || "user"}`}
                >
                  <MoreVertical className="size-4" />
                </button>
              }
            />
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => openDetails(user)}>
                  <Eye className="size-4" />
                  View details
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel>Change role</DropdownMenuLabel>
                {user.role !== "admin" ? (
                  <DropdownMenuItem
                    onClick={() =>
                      handleRoleChange(user.profile_id, "admin")
                    }
                  >
                    <Shield className="size-4" />
                    Make admin
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={() => handleRoleChange(user.profile_id, "user")}
                  >
                    <User className="size-4" />
                    Make user
                  </DropdownMenuItem>
                )}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => handleDeleteUser(user.profile_id)}
                >
                  <Trash2 className="size-4" />
                  Delete user
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [updatingId],
  );

  if (loading && users.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6 py-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage user accounts, roles, and permissions.
        </p>
      </div>

      <AdminTableToolbar
        searchPlaceholder="Search by username or email…"
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        filters={
          <>
            <Select
              value={filters.role || "all"}
              onValueChange={(value) => {
                const next = value ?? "all";
                setFilters((prev) => ({
                  ...prev,
                  role:
                    next === "all" ? undefined : (next as "admin" | "user"),
                }));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-10! w-full rounded-lg data-[size=default]:h-10! sm:w-40">
                <SelectValue placeholder="All Roles">
                  {ROLE_OPTIONS.find(
                    (option) => option.value === (filters.role || "all"),
                  )?.label ?? "All Roles"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="date"
              value={filters.dateFrom || ""}
              onChange={(e) => {
                setFilters((prev) => ({
                  ...prev,
                  dateFrom: e.target.value || undefined,
                }));
                setCurrentPage(1);
              }}
              className="h-10 w-full rounded-lg sm:w-40"
              aria-label="From date"
            />
          </>
        }
      />

      <AdminDataTable
        columns={columns}
        data={filteredUsers}
        getRowKey={(user) => user.profile_id}
        emptyIcon={<User className="size-10 opacity-40" />}
        emptyTitle="No users found"
        isLoading={loading}
      />

      <AdminTablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalUsers}
        visibleCount={filteredUsers.length}
        onPageChange={setCurrentPage}
        isLoading={loading}
      />

      {selectedUser ? (
        <UserDetailsModal
          isOpen={showDetails}
          onClose={() => {
            setShowDetails(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
        />
      ) : null}
    </div>
  );
}
