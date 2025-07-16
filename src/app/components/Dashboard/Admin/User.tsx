"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/context/auth-context";
import {
  FiSearch,
  FiFilter,
  FiUser,
  FiMail,
  FiCalendar,
  FiMoreVertical,
  FiEye,
  FiUserCheck,
  FiKey,
  FiUserX,
  FiTrash2,
} from "react-icons/fi";

// Interfaces
interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: "student" | "teacher" | "admin";
  grade?: string;
  status: "active" | "suspended" | "pending";
  created_at: string;
  updated_at: string;
  last_login: string;
  stats: {
    total_videos: number;
    total_purchases: number;
    total_likes: number;
    has_tokens: boolean;
  };
}

interface UserDetail extends User {
  token_balance: number;
  token_last_updated?: string;
  stats: {
    total_videos: number;
    total_purchases: number;
    total_likes: number;
    total_wishlists: number;
    total_ratings: number;
  };
  recent_videos: Array<{
    id: string;
    title: string;
    views: number;
    rating: number;
    created_at: string;
  }>;
  recent_purchases: Array<{
    id: string;
    video_title: string;
    price_paid: number;
    payment_status: string;
    purchase_date: string;
  }>;
  recent_likes: Array<{
    video_title: string;
    created_at: string;
  }>;
  activity_logs: Array<{
    id: string;
    activity_type: string;
    description: string;
    created_at: string;
  }>;
}

interface UserStats {
  total_users: number;
  recent_users: number;
  active_users_this_week: number;
  users_by_role: {
    admin: number;
    teacher: number;
    student: number;
  };
  top_teachers: Array<{
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
    video_count: number;
    created_at: string;
  }>;
  top_students: Array<{
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
    purchase_count: number;
    created_at: string;
  }>;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function User() {
  const { user: currentUser, token } = useAuth();

  // State untuk data
  const [users, setUsers] = useState<User[]>([]);
  const [userDetail, setUserDetail] = useState<UserDetail | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // State untuk loading dan error
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  // State untuk filter
  const [filters, setFilters] = useState({
    role: "all",
    dateFilter: "all",
    search: "",
  });

  // State untuk modal
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [confirmAction, setConfirmAction] = useState<string>("");

  // State untuk form
  const [resetPasswordForm, setResetPasswordForm] = useState({
    newPassword: "",
    generateRandom: true,
  });

  // API Calls
  const fetchUsers = async (page: number = 1) => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.role !== "all" && { role: filters.role }),
        ...(filters.dateFilter !== "all" && { dateFilter: filters.dateFilter }),
      });

      const response = await fetch(`/api/admin/users?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Gagal mengambil data pengguna");
      }

      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
        setPagination(data.pagination);
      } else {
        throw new Error(data.error || "Gagal mengambil data pengguna");
      }
    } catch (error: any) {
      console.error("Error fetching users:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetail = async (userId: string) => {
    try {
      setLoadingDetail(true);

      const response = await fetch(`/api/admin/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Gagal mengambil detail pengguna");
      }

      const data = await response.json();
      if (data.success) {
        setUserDetail(data.user);
      } else {
        throw new Error(data.error || "Gagal mengambil detail pengguna");
      }
    } catch (error: any) {
      console.error("Error fetching user detail:", error);
      setError(error.message);
    } finally {
      setLoadingDetail(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await fetch("/api/admin/users/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Gagal mengambil statistik pengguna");
      }

      const data = await response.json();
      if (data.success) {
        setUserStats(data.stats);
      }
    } catch (error: any) {
      console.error("Error fetching user stats:", error);
      // Stats error tidak perlu ditampilkan ke user
    }
  };

  const updateUser = async (userId: string, action: string, data?: any) => {
    try {
      const response = await fetch("/api/admin/users", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, action, data }),
      });

      const result = await response.json();
      if (result.success) {
        setSuccess(result.message);
        fetchUsers(pagination.page); // Refresh current page
        return true;
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      setError(error.message);
      return false;
    }
  };

  const resetPassword = async (userId: string, newPassword?: string) => {
    try {
      const response = await fetch("/api/admin/users/reset-password", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, newPassword }),
      });

      const result = await response.json();
      if (result.success) {
        setSuccess(result.message);
        return true;
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      setError(error.message);
      return false;
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users?userId=${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();
      if (result.success) {
        setSuccess(result.message);
        fetchUsers(pagination.page);
        return true;
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      setError(error.message);
      return false;
    }
  };

  // Event Handlers
  const handleSearch = (searchTerm: string) => {
    setFilters((prev) => ({ ...prev, search: searchTerm }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters((prev) => ({ ...prev, [filterType]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
    fetchUsers(page);
  };

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setActiveModal("detail");
    fetchUserDetail(user.id);
  };

  const handleVerifyTeacher = async (user: User) => {
    const success = await updateUser(user.id, "verify_teacher");
    if (success) {
      setActiveModal(null);
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser) return;

    const newPassword = resetPasswordForm.generateRandom
      ? undefined
      : resetPasswordForm.newPassword;
    const success = await resetPassword(selectedUser.id, newPassword);

    if (success) {
      setActiveModal(null);
      setResetPasswordForm({ newPassword: "", generateRandom: true });
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    const success = await deleteUser(selectedUser.id);
    if (success) {
      setActiveModal(null);
    }
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedUser(null);
    setUserDetail(null);
    setResetPasswordForm({ newPassword: "", generateRandom: true });
  };

  // Effects
  useEffect(() => {
    if (!currentUser || !token) return;

    fetchUsers(1);
    fetchUserStats();
  }, [currentUser, token]);

  useEffect(() => {
    if (!currentUser || !token) return;

    const timeoutId = setTimeout(() => {
      fetchUsers(1);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [filters]);

  // Auto-clear messages
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Utility functions
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRoleBadge = (role: string) => {
    const badges = {
      admin: "bg-purple-500/20 text-purple-400",
      teacher: "bg-blue-500/20 text-blue-400",
      student: "bg-green-500/20 text-green-400",
    };

    const labels = {
      admin: "Admin",
      teacher: "Guru",
      student: "Siswa",
    };

    return {
      class: badges[role as keyof typeof badges],
      label: labels[role as keyof typeof labels],
    };
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      active: "bg-green-500/20 text-green-400",
      suspended: "bg-red-500/20 text-red-400",
      pending: "bg-yellow-500/20 text-yellow-400",
    };

    const labels = {
      active: "Aktif",
      suspended: "Suspended",
      pending: "Pending",
    };

    return {
      class: badges[status as keyof typeof badges],
      label: labels[status as keyof typeof labels],
    };
  };

  // Render pagination
  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null;

    const pages = [];
    const maxPagesToShow = 5;
    const startPage = Math.max(1, pagination.page - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(pagination.totalPages, startPage + maxPagesToShow - 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex justify-center items-center gap-2 mt-6">
        <button
          onClick={() => handlePageChange(pagination.page - 1)}
          disabled={pagination.page === 1}
          className="px-3 py-1 rounded bg-white/10 text-white/60 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ‹
        </button>

        {pages.map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`px-3 py-1 rounded ${
              pagination.page === page
                ? "bg-blue-600 text-white"
                : "bg-white/10 text-white/60 hover:bg-white/20"
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => handlePageChange(pagination.page + 1)}
          disabled={pagination.page === pagination.totalPages}
          className="px-3 py-1 rounded bg-white/10 text-white/60 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ›
        </button>
      </div>
    );
  };

  return (
    <div className="bg-white/5 rounded-xl p-6">
      <h2 className="text-xl font-bold text-white mb-6">Manajemen Pengguna</h2>

      {/* Messages */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/20 border border-green-500/50 text-green-300 px-4 py-3 rounded mb-6">
          {success}
        </div>
      )}

      {/* Statistics Cards */}
      {userStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Total Pengguna</p>
                <h3 className="text-2xl font-bold text-white">
                  {userStats.total_users}
                </h3>
              </div>
              <FiUser className="w-8 h-8 text-white/60" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Pengguna Baru (30 hari)</p>
                <h3 className="text-2xl font-bold text-white">
                  {userStats.recent_users}
                </h3>
              </div>
              <FiCalendar className="w-8 h-8 text-white/60" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-600 to-purple-500 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Aktif Minggu Ini</p>
                <h3 className="text-2xl font-bold text-white">
                  {userStats.active_users_this_week}
                </h3>
              </div>
              <FiUser className="w-8 h-8 text-white/60" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-600 to-orange-500 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Total Guru</p>
                <h3 className="text-2xl font-bold text-white">
                  {userStats.users_by_role.teacher}
                </h3>
              </div>
              <FiUserCheck className="w-8 h-8 text-white/60" />
            </div>
          </div>
        </div>
      )}

      {/* Filter dan Pencarian */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-white/60 text-sm mb-1">Role</label>
          <select
            value={filters.role}
            onChange={(e) => handleFilterChange("role", e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
          >
            <option value="all">Semua Role</option>
            <option value="student">Siswa</option>
            <option value="teacher">Guru</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div>
          <label className="block text-white/60 text-sm mb-1">
            Tanggal Registrasi
          </label>
          <select
            value={filters.dateFilter}
            onChange={(e) => handleFilterChange("dateFilter", e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
          >
            <option value="all">Semua Waktu</option>
            <option value="last30days">30 Hari Terakhir</option>
            <option value="last90days">90 Hari Terakhir</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-white/60 text-sm mb-1">Cari</label>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Cari nama atau email..."
              className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-white/40"
            />
          </div>
        </div>
      </div>

      {/* Tabel Pengguna */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="w-8 h-8 border-4 border-kelasin-purple border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : users.length === 0 ? (
        <div className="flex justify-center items-center py-12">
          <p className="text-white/60 text-lg">
            {filters.search || filters.role !== "all" || filters.dateFilter !== "all"
              ? "Tidak ada pengguna yang sesuai dengan filter"
              : "Belum ada pengguna yang terdaftar"}
          </p>
        </div>
      ) : (
        <div className="bg-white/5 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-white/10 text-white/80">
                  <th className="px-6 py-4 text-left">Pengguna</th>
                  <th className="px-6 py-4 text-left">Email</th>
                  <th className="px-6 py-4 text-center">Role</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Aktivitas</th>
                  <th className="px-6 py-4 text-center">Tanggal Bergabung</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const roleBadge = getRoleBadge(user.role);
                  const statusBadge = getStatusBadge(user.status);

                  return (
                    <tr
                      key={user.id}
                      className="border-b border-white/5 hover:bg-white/5 transition"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                            <Image
                              src={user.avatar_url || "/images/profile.png"}
                              alt={user.full_name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <div className="text-white font-medium">
                              {user.full_name}
                            </div>
                            {user.grade && (
                              <div className="text-white/60 text-sm">
                                Kelas {user.grade}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-white/80">{user.email}</div>
                        <div className="text-white/60 text-sm">
                          ID: {user.id.slice(0, 8)}...
                        </div>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs ${roleBadge.class}`}
                        >
                          {roleBadge.label}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs ${statusBadge.class}`}
                        >
                          {statusBadge.label}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <div className="text-white/80 text-sm">
                          <div>{user.stats.total_videos} video</div>
                          <div>{user.stats.total_purchases} pembelian</div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-center text-white/60 text-sm">
                        {formatDate(user.created_at)}
                      </td>

                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-1">
                          <button
                            onClick={() => handleViewDetails(user)}
                            className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 p-2 rounded transition"
                            title="Lihat Detail"
                          >
                            <FiEye size={16} />
                          </button>

                          {user.role === "student" && user.status === "pending" && (
                            <button
                              onClick={() => handleVerifyTeacher(user)}
                              className="bg-green-500/20 hover:bg-green-500/30 text-green-400 p-2 rounded transition"
                              title="Verifikasi sebagai Guru"
                            >
                              <FiUserCheck size={16} />
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setActiveModal("reset-password");
                            }}
                            className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 p-2 rounded transition"
                            title="Reset Password"
                          >
                            <FiKey size={16} />
                          </button>

                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setConfirmAction("delete");
                              setActiveModal("confirm");
                            }}
                            className="bg-red-500/20 hover:bg-red-500/30 text-red-400 p-2 rounded transition"
                            title="Hapus Pengguna"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {renderPagination()}

      {/* Modal Detail Pengguna */}
      {activeModal === "detail" && selectedUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl w-full bg-[#000044] rounded-xl p-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition"
              aria-label="Close"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <h3 className="text-2xl font-bold text-white mb-6">
              Detail Pengguna
            </h3>

            {loadingDetail ? (
              <div className="flex justify-center items-center py-12">
                <div className="w-8 h-8 border-4 border-kelasin-purple border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : userDetail ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Section */}
                <div className="lg:col-span-1">
                  <div className="bg-white/5 rounded-xl p-6 text-center">
                    <div className="relative w-24 h-24 rounded-full overflow-hidden mx-auto mb-4">
                      <Image
                        src={userDetail.avatar_url || "/images/profile.png"}
                        alt={userDetail.full_name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <h4 className="text-xl font-semibold text-white mb-2">
                      {userDetail.full_name}
                    </h4>
                    <p className="text-white/60 mb-4">{userDetail.email}</p>

                    <div className="flex justify-center gap-2 mb-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${getRoleBadge(
                          userDetail.role
                        ).class}`}
                      >
                        {getRoleBadge(userDetail.role).label}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(
                          userDetail.status
                        ).class}`}
                      >
                        {getStatusBadge(userDetail.status).label}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/60">Bergabung:</span>
                        <span className="text-white">
                          {formatDate(userDetail.created_at)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Login Terakhir:</span>
                        <span className="text-white">
                          {formatDate(userDetail.last_login)}
                        </span>
                      </div>
                      {userDetail.grade && (
                        <div className="flex justify-between">
                          <span className="text-white/60">Kelas:</span>
                          <span className="text-white">{userDetail.grade}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-white/60">Saldo Token:</span>
                        <span className="text-white">{userDetail.token_balance}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Statistics & Activity */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Statistics */}
                  <div className="bg-white/5 rounded-xl p-6">
                    <h5 className="text-lg font-semibold text-white mb-4">
                      Statistik
                    </h5>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400">
                          {userDetail.stats.total_videos}
                        </div>
                        <div className="text-white/60 text-sm">Video</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-400">
                          {userDetail.stats.total_purchases}
                        </div>
                        <div className="text-white/60 text-sm">Pembelian</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-400">
                          {userDetail.stats.total_likes}
                        </div>
                        <div className="text-white/60 text-sm">Like</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-400">
                          {userDetail.stats.total_wishlists}
                        </div>
                        <div className="text-white/60 text-sm">Wishlist</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-400">
                          {userDetail.stats.total_ratings}
                        </div>
                        <div className="text-white/60 text-sm">Rating</div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Videos (for teachers) */}
                  {userDetail.role === "teacher" &&
                    userDetail.recent_videos.length > 0 && (
                      <div className="bg-white/5 rounded-xl p-6">
                        <h5 className="text-lg font-semibold text-white mb-4">
                          Video Terbaru
                        </h5>
                        <div className="space-y-3">
                          {userDetail.recent_videos.map((video) => (
                            <div
                              key={video.id}
                              className="flex justify-between items-center py-2 border-b border-white/10 last:border-b-0"
                            >
                              <div>
                                <div className="text-white font-medium">
                                  {video.title}
                                </div>
                                <div className="text-white/60 text-sm">
                                  {formatDate(video.created_at)}
                                </div>
                              </div>
                              <div className="text-right text-sm">
                                <div className="text-white">{video.views} views</div>
                                <div className="text-yellow-400">
                                  ★ {video.rating.toFixed(1)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Recent Purchases (for students) */}
                  {userDetail.role === "student" &&
                    userDetail.recent_purchases.length > 0 && (
                      <div className="bg-white/5 rounded-xl p-6">
                        <h5 className="text-lg font-semibold text-white mb-4">
                          Pembelian Terbaru
                        </h5>
                        <div className="space-y-3">
                          {userDetail.recent_purchases.map((purchase) => (
                            <div
                              key={purchase.id}
                              className="flex justify-between items-center py-2 border-b border-white/10 last:border-b-0"
                            >
                              <div>
                                <div className="text-white font-medium">
                                  {purchase.video_title}
                                </div>
                                <div className="text-white/60 text-sm">
                                  {formatDate(purchase.purchase_date)}
                                </div>
                              </div>
                              <div className="text-right text-sm">
                                <div className="text-white">
                                  Rp{" "}
                                  {purchase.price_paid.toLocaleString()}
                                </div>
                                <div
                                  className={`${
                                    purchase.payment_status === "completed"
                                      ? "text-green-400"
                                      : "text-yellow-400"
                                  }`}
                                >
                                  {purchase.payment_status}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Activity Logs */}
                  <div className="bg-white/5 rounded-xl p-6">
                    <h5 className="text-lg font-semibold text-white mb-4">
                      Log Aktivitas
                    </h5>
                    {userDetail.activity_logs.length === 0 ? (
                      <p className="text-white/60">Belum ada aktivitas</p>
                    ) : (
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {userDetail.activity_logs.map((log) => (
                          <div
                            key={log.id}
                            className="flex justify-between items-center py-2 border-b border-white/10 last:border-b-0"
                          >
                            <div>
                              <div className="text-white">{log.description}</div>
                              <div className="text-white/60 text-sm capitalize">
                                {log.activity_type}
                              </div>
                            </div>
                            <div className="text-white/60 text-sm">
                              {formatDate(log.created_at)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    {userDetail.role === "student" &&
                      userDetail.status === "pending" && (
                        <button
                          onClick={() => handleVerifyTeacher(userDetail)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition"
                        >
                          <FiUserCheck className="inline mr-2" />
                          Verifikasi sebagai Guru
                        </button>
                      )}

                    <button
                      onClick={() => {
                        setActiveModal("reset-password");
                      }}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm transition"
                    >
                      <FiKey className="inline mr-2" />
                      Reset Password
                    </button>

                    <button
                      onClick={() => {
                        setConfirmAction("delete");
                        setActiveModal("confirm");
                      }}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition"
                    >
                      <FiTrash2 className="inline mr-2" />
                      Hapus Pengguna
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-white/60">Gagal memuat detail pengguna</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Reset Password */}
      {activeModal === "reset-password" && selectedUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-md w-full bg-[#000044] rounded-xl p-8">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition"
              aria-label="Close"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-xl font-bold text-white mb-4">Reset Password</h3>
            <p className="text-white/80 mb-6">
              Reset password untuk{" "}
              <span className="font-semibold">{selectedUser.full_name}</span>
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  id="generate"
                  name="resetType"
                  checked={resetPasswordForm.generateRandom}
                  onChange={() =>
                    setResetPasswordForm((prev) => ({
                      ...prev,
                      generateRandom: true,
                    }))
                  }
                  className="text-blue-500"
                />
                <label htmlFor="generate" className="text-white">
                  Generate password acak
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  id="custom"
                  name="resetType"
                  checked={!resetPasswordForm.generateRandom}
                  onChange={() =>
                    setResetPasswordForm((prev) => ({
                      ...prev,
                      generateRandom: false,
                    }))
                  }
                  className="text-blue-500"
                />
                <label htmlFor="custom" className="text-white">
                  Set password khusus
                </label>
              </div>

              {!resetPasswordForm.generateRandom && (
                <input
                  type="password"
                  value={resetPasswordForm.newPassword}
                  onChange={(e) =>
                    setResetPasswordForm((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                  placeholder="Password baru (minimal 6 karakter)"
                  className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white placeholder-white/40"
                  minLength={6}
                  required
                />
              )}
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={closeModal}
                className="w-full bg-white/10 text-white rounded-lg px-4 py-2 font-medium hover:bg-white/20 transition"
              >
                Batal
              </button>
              <button
                onClick={handleResetPassword}
                className="w-full bg-yellow-500 text-white rounded-lg px-4 py-2 font-medium hover:bg-yellow-600 transition"
                disabled={
                  !resetPasswordForm.generateRandom &&
                  resetPasswordForm.newPassword.length < 6
                }
              >
                Reset Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi */}
      {activeModal === "confirm" && selectedUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-md w-full bg-[#000044] rounded-xl p-8">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition"
              aria-label="Close"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-xl font-bold text-white mb-4">
              Konfirmasi Hapus Pengguna
            </h3>

            <p className="text-white/80 mb-6">
              Apakah Anda yakin ingin menghapus pengguna{" "}
              <span className="font-semibold">{selectedUser.full_name}</span>?<br /><br />
              <span className="text-red-400">Tindakan ini tidak dapat dibatalkan.</span>
            </p>

            <div className="flex gap-4">
              <button
                onClick={closeModal}
                className="w-full bg-white/10 text-white rounded-lg px-4 py-2 font-medium hover:bg-white/20 transition"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteUser}
                className="w-full bg-red-500 text-white rounded-lg px-4 py-2 font-medium hover:bg-red-600 transition"
              >
                Hapus Pengguna
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
