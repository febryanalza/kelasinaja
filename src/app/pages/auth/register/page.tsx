"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  switchToLogin: () => void;
}

interface FormData {
  email: string;
  password: string;
  full_name: string;
  grade: string;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
  user?: {
    id: string;
    email: string;
    full_name: string;
    grade: string;
    role: string;
  };
}

export default function RegisterModal({
  isOpen,
  onClose,
  switchToLogin,
}: RegisterModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    full_name: "",
    grade: "",
  });

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      // Parse response
      const data: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registrasi gagal');
      }

      // Success
      setSuccess(data.message || 'Registrasi berhasil!');
      
      // Reset form
      setFormData({
        email: "",
        password: "",
        full_name: "",
        grade: "",
      });

      // Redirect to login after 2 seconds
      setTimeout(() => {
        setSuccess("");
        onClose();
        switchToLogin();
      }, 2000);

    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat mendaftar');
    } finally {
      setLoading(false);
    }
  };

  // Don't render if modal is closed
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="relative max-w-md w-full bg-white/10 backdrop-blur-md rounded-xl p-8 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
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

        {/* Header */}
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

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-4 mb-6">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-500/10 border border-green-500 text-green-500 rounded-lg p-4 mb-6">
            {success}
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-white mb-2"
            >
              Email <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              name="email"
              id="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="contoh@email.com"
              className="w-full rounded-lg bg-white/5 border border-white/10 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-kelasin-yellow focus:border-transparent placeholder-white/50"
            />
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-white mb-2"
            >
              Password <span className="text-red-400">*</span>
            </label>
            <input
              type="password"
              name="password"
              id="password"
              required
              minLength={6}
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimal 6 karakter"
              className="w-full rounded-lg bg-white/5 border border-white/10 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-kelasin-yellow focus:border-transparent placeholder-white/50"
            />
          </div>

          {/* Full Name Field */}
          <div>
            <label
              htmlFor="full_name"
              className="block text-sm font-medium text-white mb-2"
            >
              Nama Lengkap <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="full_name"
              id="full_name"
              required
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Nama lengkap Anda"
              className="w-full rounded-lg bg-white/5 border border-white/10 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-kelasin-yellow focus:border-transparent placeholder-white/50"
            />
          </div>

          {/* Grade Field */}
          <div>
            <label
              htmlFor="grade"
              className="block text-sm font-medium text-white mb-2"
            >
              Kelas <span className="text-red-400">*</span>
            </label>
            <select
              name="grade"
              id="grade"
              required
              value={formData.grade}
              onChange={handleChange}
              className="w-full rounded-lg bg-white/5 border border-white/10 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-kelasin-yellow focus:border-transparent"
            >
              <option value="" className="bg-gray-800">Pilih Kelas</option>
              <option value="10" className="bg-gray-800">Kelas 10</option>
              <option value="11" className="bg-gray-800">Kelas 11</option>
              <option value="12" className="bg-gray-800">Kelas 12</option>
            </select>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="w-full bg-white/10 text-white rounded-lg px-4 py-3 font-medium hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Kembali
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-kelasin-purple text-white rounded-lg px-4 py-3 font-medium hover:bg-kelasin-purple/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Mendaftar...
                </>
              ) : (
                'Daftar'
              )}
            </button>
          </div>
        </form>

        {/* Login Link */}
        <div className="text-center mt-6 pt-4 border-t border-white/20">
          <p className="text-white/60">
            Sudah punya akun?{' '}
            <button
              onClick={switchToLogin}
              className="text-kelasin-yellow hover:text-kelasin-yellow/80 font-medium transition-colors"
            >
              Login di sini
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
