"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import supabase from "@/lib/supabase";

// Tipe data untuk pengguna
interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  role: "student" | "teacher" | "admin";
  status: "active" | "suspended" | "pending";
  created_at: string;
  last_login: string;
}

// Tipe data untuk log aktivitas
interface ActivityLog {
  id: string;
  user_id: string;
  activity_type: string;
  description: string;
  created_at: string;
}

export default function User() {
  // State untuk data pengguna
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State untuk filter
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // State untuk modal
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] =
    useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<string>("");

  // Fungsi untuk mengambil data pengguna dari Supabase
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        if (data) {
          setUsers(data);
          setFilteredUsers(data);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("Gagal mengambil data pengguna");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Fungsi untuk mengambil log aktivitas pengguna
  const fetchUserActivityLogs = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("activity_logs")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) {
        throw error;
      }

      if (data) {
        setActivityLogs(data);
      }
    } catch (error) {
      console.error("Error fetching activity logs:", error);
      setError("Gagal mengambil log aktivitas");
    }
  };

  // Fungsi untuk menerapkan filter
  useEffect(() => {
    let result = [...users];

    // Filter berdasarkan role
    if (roleFilter !== "all") {
      result = result.filter((user) => user.role === roleFilter);
    }

    // Filter berdasarkan status
    if (statusFilter !== "all") {
      result = result.filter((user) => user.status === statusFilter);
    }

    // Filter berdasarkan tanggal registrasi
    if (dateFilter !== "all") {
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);
      const ninetyDaysAgo = new Date(today);
      ninetyDaysAgo.setDate(today.getDate() - 90);

      if (dateFilter === "last30days") {
        result = result.filter(
          (user) => new Date(user.created_at) >= thirtyDaysAgo
        );
      } else if (dateFilter === "last90days") {
        result = result.filter(
          (user) => new Date(user.created_at) >= ninetyDaysAgo
        );
      }
    }

    // Filter berdasarkan pencarian
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (user) =>
          user.full_name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query)
      );
    }

    setFilteredUsers(result);
  }, [users, roleFilter, statusFilter, dateFilter, searchQuery]);

  // Fungsi untuk menampilkan detail pengguna
  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    fetchUserActivityLogs(user.id);
    setIsDetailModalOpen(true);
  };

  // Fungsi untuk verifikasi guru
  const handleVerifyTeacher = (user: User) => {
    setSelectedUser(user);
    setIsVerifyModalOpen(true);
  };

  // Fungsi untuk reset password
  const handleResetPassword = (user: User) => {
    setSelectedUser(user);
    setIsResetPasswordModalOpen(true);
  };

  // Fungsi untuk suspend/aktivasi akun
  const handleToggleStatus = (user: User) => {
    setSelectedUser(user);
    setConfirmAction(user.status === "active" ? "suspend" : "activate");
    setIsConfirmModalOpen(true);
  };

  // Fungsi untuk melakukan verifikasi guru
  const confirmVerifyTeacher = async () => {
    if (!selectedUser) return;

    try {
      const { error } = await supabase
        .from("users")
        .update({ role: "teacher", status: "active" })
        .eq("id", selectedUser.id);

      if (error) {
        throw error;
      }

      // Update state
      setUsers(
        users.map((user) =>
          user.id === selectedUser.id
            ? { ...user, role: "teacher", status: "active" }
            : user
        )
      );

      // Log aktivitas
      await supabase.from("activity_logs").insert({
        user_id: selectedUser.id,
        activity_type: "verification",
        description: "Akun diverifikasi sebagai guru",
      });

      setIsVerifyModalOpen(false);
    } catch (error) {
      console.error("Error verifying teacher:", error);
      setError("Gagal memverifikasi guru");
    }
  };

  // Fungsi untuk melakukan reset password
  const confirmResetPassword = async () => {
    if (!selectedUser) return;

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        selectedUser.email,
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

      if (error) {
        throw error;
      }

      // Log aktivitas
      await supabase.from("activity_logs").insert({
        user_id: selectedUser.id,
        activity_type: "password_reset",
        description: "Reset password diminta",
      });

      setIsResetPasswordModalOpen(false);
    } catch (error) {
      console.error("Error resetting password:", error);
      setError("Gagal mereset password");
    }
  };

  // Fungsi untuk melakukan suspend/aktivasi akun
  const confirmToggleStatus = async () => {
    if (!selectedUser) return;

    try {
      const newStatus =
        selectedUser.status === "active" ? "suspended" : "active";

      const { error } = await supabase
        .from("users")
        .update({ status: newStatus })
        .eq("id", selectedUser.id);

      if (error) {
        throw error;
      }

      // Update state
      setUsers(
        users.map((user) =>
          user.id === selectedUser.id ? { ...user, status: newStatus } : user
        )
      );

      // Log aktivitas
      await supabase.from("activity_logs").insert({
        user_id: selectedUser.id,
        activity_type: "status_change",
        description: `Akun ${
          newStatus === "active" ? "diaktifkan" : "disuspend"
        }`,
      });

      setIsConfirmModalOpen(false);
    } catch (error) {
      console.error("Error toggling status:", error);
      setError("Gagal mengubah status akun");
    }
  };

  // Format tanggal
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

  return (
    <div className="bg-white/5 rounded-xl p-6">
      <h2 className="text-xl font-bold text-white mb-6">Manajemen Pengguna</h2>

      {/* Filter dan Pencarian */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-white/60 text-sm mb-1">Role</label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
          >
            <option value="all">Semua Role</option>
            <option value="student">Siswa</option>
            <option value="teacher">Guru</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div>
          <label className="block text-white/60 text-sm mb-1">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
          >
            <option value="all">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="suspended">Suspended</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        <div>
          <label className="block text-white/60 text-sm mb-1">
            Tanggal Registrasi
          </label>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
          >
            <option value="all">Semua Waktu</option>
            <option value="last30days">30 Hari Terakhir</option>
            <option value="last90days">90 Hari Terakhir</option>
          </select>
        </div>

        <div>
          <label className="block text-white/60 text-sm mb-1">Cari</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama atau email..."
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
          />
        </div>
      </div>

      {/* Tabel Pengguna */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <p className="text-white/60 text-lg">Memuat data pengguna...</p>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-4 mb-6">
          {error}
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="flex justify-center items-center py-12">
          <p className="text-white/60 text-lg">
            Tidak ada pengguna yang ditemukan
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-white/10 text-white/80">
                <th className="px-4 py-3 text-left">Pengguna</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-center">Role</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Tanggal Registrasi</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-white/5 hover:bg-white/5"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden">
                        <Image
                          src={user.avatar_url || "/images/profile.png"}
                          alt={user.full_name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <span className="text-white">{user.full_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white/60">{user.email}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs ${
                        user.role === "admin"
                          ? "bg-purple-500/20 text-purple-400"
                          : user.role === "teacher"
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-green-500/20 text-green-400"
                      }`}
                    >
                      {user.role === "admin"
                        ? "Admin"
                        : user.role === "teacher"
                        ? "Guru"
                        : "Siswa"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs ${
                        user.status === "active"
                          ? "bg-green-500/20 text-green-400"
                          : user.status === "suspended"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {user.status === "active"
                        ? "Aktif"
                        : user.status === "suspended"
                        ? "Suspended"
                        : "Pending"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-white/60">
                    {formatDate(user.created_at)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleViewDetails(user)}
                        className="bg-white/10 hover:bg-white/20 text-white p-1 rounded"
                        title="Lihat Detail"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </button>

                      {user.role === "student" && user.status === "pending" && (
                        <button
                          onClick={() => handleVerifyTeacher(user)}
                          className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 p-1 rounded"
                          title="Verifikasi sebagai Guru"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </button>
                      )}

                      <button
                        onClick={() => handleResetPassword(user)}
                        className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 p-1 rounded"
                        title="Reset Password"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                          />
                        </svg>
                      </button>

                      <button
                        onClick={() => handleToggleStatus(user)}
                        className={`${
                          user.status === "active"
                            ? "bg-red-500/20 hover:bg-red-500/30 text-red-400"
                            : "bg-green-500/20 hover:bg-green-500/30 text-green-400"
                        } p-1 rounded`}
                        title={
                          user.status === "active"
                            ? "Suspend Akun"
                            : "Aktifkan Akun"
                        }
                      >
                        {user.status === "active" ? (
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Detail Pengguna */}
      {isDetailModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-3xl w-full bg-[#000044] rounded-xl p-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsDetailModalOpen(false)}
              className="absolute top-4 right-4 text-white/80 hover:text-white"
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
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

            <div className="flex flex-col md:flex-row gap-6 mb-6">
              <div className="md:w-1/3 flex flex-col items-center">
                <div className="relative w-32 h-32 rounded-full overflow-hidden mb-4">
                  <Image
                    src={selectedUser.avatar_url || "/images/profile.png"}
                    alt={selectedUser.full_name}
                    fill
                    className="object-cover"
                  />
                </div>
                <h4 className="text-xl font-semibold text-white">
                  {selectedUser.full_name}
                </h4>
                <p className="text-white/60">{selectedUser.email}</p>

                <div className="flex gap-2 mt-4">
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs ${
                      selectedUser.role === "admin"
                        ? "bg-purple-500/20 text-purple-400"
                        : selectedUser.role === "teacher"
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-green-500/20 text-green-400"
                    }`}
                  >
                    {selectedUser.role === "admin"
                      ? "Admin"
                      : selectedUser.role === "teacher"
                      ? "Guru"
                      : "Siswa"}
                  </span>

                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs ${
                      selectedUser.status === "active"
                        ? "bg-green-500/20 text-green-400"
                        : selectedUser.status === "suspended"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}
                  >
                    {selectedUser.status === "active"
                      ? "Aktif"
                      : selectedUser.status === "suspended"
                      ? "Suspended"
                      : "Pending"}
                  </span>
                </div>
              </div>

              <div className="md:w-2/3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-white/60 text-sm">Tanggal Registrasi</p>
                    <p className="text-white">
                      {formatDate(selectedUser.created_at)}
                    </p>
                  </div>

                  <div>
                    <p className="text-white/60 text-sm">Login Terakhir</p>
                    <p className="text-white">
                      {selectedUser.last_login
                        ? formatDate(selectedUser.last_login)
                        : "Belum pernah login"}
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <h5 className="text-lg font-semibold text-white mb-2">
                    Log Aktivitas
                  </h5>

                  {activityLogs.length === 0 ? (
                    <p className="text-white/60">Belum ada aktivitas</p>
                  ) : (
                    <div className="bg-white/5 rounded-lg overflow-hidden">
                      {activityLogs.map((log) => (
                        <div
                          key={log.id}
                          className="border-b border-white/10 p-3 last:border-b-0"
                        >
                          <div className="flex justify-between">
                            <p className="text-white">{log.description}</p>
                            <p className="text-white/60 text-sm">
                              {formatDate(log.created_at)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {selectedUser.role === "student" &&
                    selectedUser.status === "pending" && (
                      <button
                        onClick={() => {
                          setIsDetailModalOpen(false);
                          handleVerifyTeacher(selectedUser);
                        }}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
                      >
                        Verifikasi sebagai Guru
                      </button>
                    )}

                  <button
                    onClick={() => {
                      setIsDetailModalOpen(false);
                      handleResetPassword(selectedUser);
                    }}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    Reset Password
                  </button>

                  <button
                    onClick={() => {
                      setIsDetailModalOpen(false);
                      handleToggleStatus(selectedUser);
                    }}
                    className={`${
                      selectedUser.status === "active"
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-green-500 hover:bg-green-600"
                    } text-white px-4 py-2 rounded-lg text-sm`}
                  >
                    {selectedUser.status === "active"
                      ? "Suspend Akun"
                      : "Aktifkan Akun"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Verifikasi Guru */}
      {isVerifyModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-md w-full bg-[#000044] rounded-xl p-8">
            <button
              onClick={() => setIsVerifyModalOpen(false)}
              className="absolute top-4 right-4 text-white/80 hover:text-white"
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
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

            <h3 className="text-xl font-bold text-white mb-4">
              Verifikasi Guru
            </h3>

            <p className="text-white/80 mb-6">
              Apakah Anda yakin ingin memverifikasi{" "}
              <span className="font-semibold">{selectedUser.full_name}</span>{" "}
              sebagai guru? Akun akan diaktifkan dan mendapatkan akses ke fitur
              guru.
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => setIsVerifyModalOpen(false)}
                className="w-full bg-white/10 text-white rounded-lg px-4 py-2 font-medium hover:bg-white/20 transition-opacity"
              >
                Batal
              </button>
              <button
                onClick={confirmVerifyTeacher}
                className="w-full bg-blue-500 text-white rounded-lg px-4 py-2 font-medium hover:bg-blue-600 transition-opacity"
              >
                Verifikasi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Reset Password */}
      {isResetPasswordModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-md w-full bg-[#000044] rounded-xl p-8">
            <button
              onClick={() => setIsResetPasswordModalOpen(false)}
              className="absolute top-4 right-4 text-white/80 hover:text-white"
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
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

            <h3 className="text-xl font-bold text-white mb-4">
              Reset Password
            </h3>

            <p className="text-white/80 mb-6">
              Apakah Anda yakin ingin mengirim email reset password ke{" "}
              <span className="font-semibold">{selectedUser.email}</span>?
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => setIsResetPasswordModalOpen(false)}
                className="w-full bg-white/10 text-white rounded-lg px-4 py-2 font-medium hover:bg-white/20 transition-opacity"
              >
                Batal
              </button>
              <button
                onClick={confirmResetPassword}
                className="w-full bg-yellow-500 text-white rounded-lg px-4 py-2 font-medium hover:bg-yellow-600 transition-opacity"
              >
                Kirim Email Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Suspend/Aktivasi */}
      {isConfirmModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-md w-full bg-[#000044] rounded-xl p-8">
            <button
              onClick={() => setIsConfirmModalOpen(false)}
              className="absolute top-4 right-4 text-white/80 hover:text-white"
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
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

            <h3 className="text-xl font-bold text-white mb-4">
              {confirmAction === "suspend" ? "Suspend Akun" : "Aktivasi Akun"}
            </h3>

            <p className="text-white/80 mb-6">
              {confirmAction === "suspend"
                ? `Apakah Anda yakin ingin menangguhkan akun ${selectedUser.full_name}? Pengguna tidak akan dapat mengakses akun mereka sampai diaktifkan kembali.`
                : `Apakah Anda yakin ingin mengaktifkan kembali akun ${selectedUser.full_name}?`}
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="w-full bg-white/10 text-white rounded-lg px-4 py-2 font-medium hover:bg-white/20 transition-opacity"
              >
                Batal
              </button>
              <button
                onClick={confirmToggleStatus}
                className={`w-full ${
                  confirmAction === "suspend"
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-green-500 hover:bg-green-600"
                } text-white rounded-lg px-4 py-2 font-medium transition-opacity`}
              >
                {confirmAction === "suspend" ? "Suspend" : "Aktifkan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
