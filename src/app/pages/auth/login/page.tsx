"use client";

import { useState } from 'react';
import supabase from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  switchToRegister: () => void; // Fungsi untuk beralih ke modal register
}

export default function LoginModal({ isOpen, onClose, switchToRegister }: LoginModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error('Login error:', signInError);
        setError(signInError.message);
        return;
      }

      if (!data.user) {
        throw new Error('No user data returned after login');
      }

      // Tutup modal setelah berhasil login
      onClose();
      // Refresh halaman untuk memperbarui status login
      router.refresh();
    } catch (e) {
      console.error('Login error:', e);
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('Terjadi kesalahan saat login. Silakan coba lagi.');
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
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {/* Heading dengan tombol switch */}
        <div className="flex justify-center mb-8 border-b border-white/20 pb-4">
          <button 
            className="text-3xl font-bold text-white mx-2 px-4 py-2 border-b-2 border-[var(--peachy-pink)]"
          >
            Login
          </button>
          <button 
            onClick={switchToRegister}
            className="text-3xl font-bold text-white/60 mx-2 px-4 py-2 hover:text-white transition-colors"
          >
            Daftar
          </button>
        </div>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-4 mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-lg bg-white/5 border border-white/10 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--peachy-pink)]"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white">
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-lg bg-white/5 border border-white/10 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--peachy-pink)]"
            />
          </div>

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
              className="w-full bg-[var(--peachy-pink)] text-white rounded-lg px-4 py-2 font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Masuk...' : 'Masuk'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}