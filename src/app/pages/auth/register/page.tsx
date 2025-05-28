"use client";

import { useState, useRef } from "react";
import supabase from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  switchToLogin: () => void; // Fungsi untuk beralih ke modal login
}

export default function RegisterModal({
  isOpen,
  onClose,
  switchToLogin,
}: RegisterModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    full_name: "",
    grade: "",
    avatar_url: "https://vovgbtfzhhahzxrbrtzy.supabase.co/storage/v1/object/public/avatars//10015419.png",
  });


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!supabase) {
        throw new Error("Supabase client not initialized");
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: (e.target as HTMLFormElement).password.value,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) {
        console.error("Signup error:", signUpError);
        setError(signUpError.message);
        return;
      }

      if (!data.user) {
        throw new Error("No user data returned after signup");
        
      }

      // Upload avatar jika ada
      

      const { error: profileError } = await supabase
      .from('users')
      .insert([
        {
          id: data.user.id,
          email: data.user.email,
          full_name: formData.full_name,
          grade: parseInt(formData.grade),
          avatar_url: formData.avatar_url,
          role: "student",
        },
      ])
      .select();

      if (profileError) {
        console.error("Profile creation error:", profileError);
        setError(profileError.message);
        return;
      }

      // Tutup modal setelah berhasil mendaftar
      onClose();
      // Refresh halaman untuk memperbarui status login
      router.refresh();
    } catch (e) {
      console.error("Registration error:", e);
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Terjadi kesalahan saat mendaftar. Silakan coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="relative max-w-md w-full bg-white/10 backdrop-blur-md rounded-xl p-8 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
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
        </button>{" "}
        {/* Heading dengan tombol switch */}
        <div className="flex flex-col items-center mb-8 border-b border-white/20 pb-4">
          <h2 className="text-2xl font-bold text-kelasin-purple font-kufam mb-4">
            KelasinAja
          </h2>
          <div className="flex">
            <button
              onClick={switchToLogin}
              className="text-xl font-bold text-white/60 mx-2 px-4 py-2 hover:text-white transition-colors"
            >
              Login
            </button>
            <button className="text-xl font-bold text-white mx-2 px-4 py-2 border-b-2 border-kelasin-yellow">
              Daftar
            </button>
          </div>
        </div>
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-4 mb-6">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar upload section */}
          

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-white"
            >
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg bg-white/5 border border-white/10 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-kelasin-yellow"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-white"
            >
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              required
              className="mt-1 block w-full rounded-lg bg-white/5 border border-white/10 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-kelasin-yellow"
            />
          </div>

          <div>
            <label
              htmlFor="full_name"
              className="block text-sm font-medium text-white"
            >
              Nama Lengkap
            </label>
            <input
              type="text"
              name="full_name"
              id="full_name"
              required
              value={formData.full_name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg bg-white/5 border border-white/10 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-kelasin-yellow"
            />
          </div>

          <div>
            <label
              htmlFor="grade"
              className="block text-sm font-medium text-white"
            >
              Kelas
            </label>
            <input
              type="number"
              name="grade"
              id="grade"
              min="10"
              max="12"
              required
              value={formData.grade}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg bg-white/5 border border-white/10 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-kelasin-yellow"
            />
          </div>

          {/* Menghapus input URL avatar karena sudah diganti dengan upload file */}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="w-full bg-white/10 text-white rounded-lg px-4 py-2 font-medium hover:bg-white/20 transition-opacity"
            >
              Kembali
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-kelasin-purple text-white rounded-lg px-4 py-2 font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? "Mendaftar..." : "Daftar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
