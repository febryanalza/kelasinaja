"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Header from "@/app/components/layouts/Navbar";
import { useAuth } from "@/context/auth-context";
import Beranda from "@/app/components/Dashboard/Admin/Beranda";
import ContentWeb from "@/app/components/Dashboard/Admin/ContentWeb";
import Marketing from "@/app/components/Dashboard/Admin/Marketing";
import PrivacySecure from "@/app/components/Dashboard/Admin/PrivacySecure";
import ReportAnalitics from "@/app/components/Dashboard/Admin/ReportAnalitic";
import SupportHelp from "@/app/components/Dashboard/Admin/SupportHelp";
import TokenReward from "@/app/components/Dashboard/Admin/TokenReward";
import UserTransaction from "@/app/components/Dashboard/Admin/UserTransaction";
import User from "@/app/components/Dashboard/Admin/User";
import DecorativeBadge from "@/app/components/elements/DecorativeBadge";
import DecorativeBackground from "@/app/components/elements/DecorativeBackround";
import type { UserMenuDashboard } from "@/app/types/interface";

interface AdminProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: string;
  created_at: string;
  updated_at: string;
  token_balance?: number;
}

export default function AdminDashboard() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("beranda");

  const adminMenus: UserMenuDashboard[] = [
    { id: "beranda", title: "Beranda", component: Beranda },
    { id: "users", title: "Users", component: User },
    { id: "content", title: "Content", component: ContentWeb },
    { id: "transaction", title: "Transaction", component: UserTransaction },
    { id: "tokenReward", title: "Token & Reward", component: TokenReward },
    { id: "privacySecure", title: "Privacy & Secure", component: PrivacySecure },
    { id: "reportAnalitics", title: "Report & Analitics", component: ReportAnalitics },
    { id: "supportHelp", title: "Support & Help", component: SupportHelp },
    { id: "marketing", title: "Marketing", component: Marketing },
  ];

  useEffect(() => {
    // Wait for auth context to load
    if (isLoading) return;

    // Check if user is logged in
    if (!user || !token) {
      console.log('No user or token found, redirecting to home');
      router.push('/');
      return;
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      console.log('User is not admin, role:', user.role);
      router.push('/');
      return;
    }

    console.log('User is admin, fetching profile for user:', user.id);
    fetchAdminProfile();
  }, [user, token, isLoading, router]);

  const fetchAdminProfile = async () => {
    if (!user || !token) {
      setError('Tidak dapat mengakses halaman ini');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching profile for user ID:', user.id);
      console.log('Using token:', token ? 'Token exists' : 'No token');
      
      const response = await fetch(`/api/user/${user.id}/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Profile fetch response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Invalid response format' }));
        console.error('Profile fetch error:', errorData);
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Profile fetch success:', data);
      
      if (data.success) {
        setUserProfile(data.user);
      } else {
        throw new Error(data.error || 'Gagal memuat profile');
      }
      
    } catch (error: any) {
      console.error('Error fetching admin profile:', error);
      setError(error.message || 'Terjadi kesalahan saat mengambil data profile');
      
      // If it's an auth error, redirect to login
      if (error.message?.includes('Token') || error.message?.includes('authorization')) {
        console.log('Auth error detected, redirecting to home');
        router.push('/');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderTabContent = () => {
    const activeTabObj = adminMenus.find(tab => tab.id === activeTab);
    return activeTabObj ? <activeTabObj.component /> : <div>Tab tidak ditemukan</div>;
  };

  // Show loading while auth context is loading
  if (isLoading) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="flex justify-center items-center h-[80vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-kelasin-purple border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-kelasin-purple text-xl font-medium">Memuat autentikasi...</p>
          </div>
        </div>
      </main>
    );
  }

  // Don't render anything if user is not admin (will redirect)
  if (!user || user.role !== 'admin') {
    return null;
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="flex justify-center items-center h-[80vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-kelasin-purple border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-kelasin-purple text-xl font-medium">Memuat dashboard...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="flex justify-center items-center h-[80vh]">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="text-red-500 text-xl font-medium mb-4">{error}</div>
            <div className="text-gray-600 text-sm mb-6">
              {process.env.NODE_ENV === 'development' && (
                <div className="bg-gray-100 p-4 rounded text-left">
                  <p><strong>Debug Info:</strong></p>
                  <p>User ID: {user?.id}</p>
                  <p>User Role: {user?.role}</p>
                  <p>Token exists: {token ? 'Yes' : 'No'}</p>
                </div>
              )}
            </div>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => {
                  setError(null);
                  fetchAdminProfile();
                }}
                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Coba Lagi
              </button>
              <button 
                onClick={() => router.push('/')}
                className="bg-kelasin-purple text-white px-6 py-3 rounded-lg hover:bg-kelasin-purple/90 transition-colors"
              >
                Kembali ke Beranda
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <Header />
      
      {/* Dashboard Header - Hero Style */}
      <section className="relative py-12 lg:py-20 overflow-hidden bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center">
            {/* Profile and Title */}
            <div className="lg:w-1/2 mb-12 lg:mb-0 z-10">
              <div className="flex items-center gap-6 mb-6">
                <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-4 border-kelasin-yellow shadow-lg">
                  <Image
                    src={userProfile?.avatar_url || user?.avatar_url || "/images/profile.png"}
                    alt="Profile Avatar"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold text-kelasin-purple mb-2 animate-fade-in">
                    Dashboard{" "}
                    <span className="text-kelasin-yellow font-kufam inline-block animate-float">
                      Admin
                    </span>
                  </h1>
                  <p className="text-lg text-gray-700 animate-fade-in-delayed">
                    {userProfile?.full_name || user?.full_name 
                      ? `Selamat datang, ${userProfile?.full_name || user?.full_name}` 
                      : "Kelola platform KelasinAja dengan mudah"}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Decorative Elements */}
            <DecorativeBadge />
          </div>
        </div>

        {/* Background decorative elements */}
        <DecorativeBackground />
      </section>

      {/* Dashboard Tabs - Styled like landing page sections */}
      <section className="py-8 px-4 lg:px-8 bg-gray-50">
        <div className="container mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl lg:text-3xl font-bold text-kelasin-purple mb-6 text-center animate-fade-in">
              Menu Dashboard
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              {adminMenus.map((tab) => (
                <button
                  onClick={() => setActiveTab(tab.id)}
                  key={tab.id}
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 transform hover:scale-105 ${
                    activeTab === tab.id
                      ? "bg-kelasin-purple text-white shadow-lg"
                      : "bg-white text-kelasin-purple border-2 border-kelasin-purple hover:bg-kelasin-purple hover:text-white shadow-md hover:shadow-lg"
                  }`}
                >
                  {tab.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Content */}
      <section className="py-8 px-4 lg:px-8">
        <div className="container mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-6 min-h-[600px]">
            {renderTabContent()}
          </div>
        </div>
      </section>

      {/* Footer spacing */}
      <div className="h-16"></div>
    </main>
  );
}
