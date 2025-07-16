"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Header from "@/app/components/layouts/Navbar";
import ClassManagement from "@/app/components/Dashboard/Teacher/ClassManagement";
import Monetisasi from "@/app/components/Dashboard/Teacher/Monetisasi";
import Statistic from "@/app/components/Dashboard/Teacher/Statistic";
import UploadVideo from "@/app/components/Dashboard/Teacher/UploadVideo";
import Videos from "@/app/components/Dashboard/Teacher/Videos";
import { useAuth } from "@/context/auth-context";
import DecorativeBadge from "@/app/components/elements/DecorativeBadge";
import DecorativeBackground from "@/app/components/elements/DecorativeBackround";
import type { UserMenuDashboard } from "@/app/types/interface";

interface TeacherProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  grade?: string;
  role: string;
  created_at: string;
  updated_at: string;
  token_balance: number;
  token_last_updated?: string;
  stats: {
    total_videos: number;
    total_views: number;
    total_revenue: number;
    total_students: number;
    total_likes: number;
    total_ratings: number;
  };
}

interface DashboardStats {
  overview: {
    total_videos: number;
    published_videos: number;
    draft_videos: number;
    total_views: number;
    recent_views: number;
    total_revenue: number;
    recent_revenue: number;
    total_students: number;
  };
  top_videos: Array<{
    id: string;
    title: string;
    views: number;
    rating: number;
    price: number;
    thumbnail?: string;
    total_purchases: number;
    total_likes: number;
    total_views: number;
    created_at: string;
  }>;
  recent_purchases: Array<{
    id: string;
    student: {
      id: string;
      name: string;
      avatar?: string;
    };
    video: {
      id: string;
      title: string;
      thumbnail?: string;
    };
    price_paid: number;
    purchase_date: string;
    payment_method?: string;
    payment_status: string;
  }>;
  monthly_stats: Array<{
    month: string;
    purchases: number;
    revenue: number;
  }>;
}

export default function TeacherDashboard() {
  const params = useParams();
  const router = useRouter();
  const { user, token, isLoading } = useAuth();
  
  const [teacherProfile, setTeacherProfile] = useState<TeacherProfile | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("uploadVideo");

  const teacherId = params?.id as string;

  const tabs: UserMenuDashboard[] = [
    { id: "uploadVideo", title: "Upload Video", component: UploadVideo },
    { id: "videos", title: "Videos", component: Videos },
    { id: "monet", title: "Monetisasi", component: Monetisasi },
    { id: "statisticAnalitic", title: "Statistik & Analitik", component: Statistic },
    { id: "classManagement", title: "Manajemen Kelas", component: ClassManagement },
  ];

  useEffect(() => {
    if (isLoading) return;

    if (!user || !token) {
      console.log('No user or token found, redirecting to home');
      router.push('/');
      return;
    }

    if (!teacherId) {
      console.log('No teacher ID found in URL');
      router.push('/');
      return;
    }

    // Check if user can access this teacher dashboard
    if (user.role !== 'admin' && user.id !== teacherId) {
      console.log('User cannot access this teacher dashboard');
      router.push('/');
      return;
    }

    // Check if target user is a teacher (for admin accessing teacher dashboard)
    if (user.role === 'admin' || (user.role === 'teacher' && user.id === teacherId)) {
      fetchTeacherData();
    } else {
      router.push('/');
    }
  }, [user, token, isLoading, teacherId, router]);

  const fetchTeacherData = async () => {
    if (!user || !token || !teacherId) {
      setError('Data tidak lengkap untuk mengakses dashboard');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('Fetching teacher data for ID:', teacherId);

      // Fetch teacher profile and dashboard stats in parallel
      const [profileResponse, statsResponse] = await Promise.all([
        fetch(`/api/teacher/${teacherId}/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
        fetch(`/api/teacher/${teacherId}/dashboard`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
      ]);

      console.log('Profile response status:', profileResponse.status);
      console.log('Stats response status:', statsResponse.status);

      if (!profileResponse.ok) {
        const errorData = await profileResponse.json().catch(() => ({ error: 'Invalid response format' }));
        throw new Error(errorData.error || `HTTP ${profileResponse.status}: ${profileResponse.statusText}`);
      }

      if (!statsResponse.ok) {
        console.warn('Failed to fetch stats, continuing with profile data only');
      }

      const profileData = await profileResponse.json();
      console.log('Profile data received:', profileData);

      if (profileData.success) {
        setTeacherProfile(profileData.teacher);
      } else {
        throw new Error(profileData.error || 'Gagal memuat profile teacher');
      }

      // Handle stats response (optional)
      if (statsResponse.ok) {
        try {
          const statsData = await statsResponse.json();
          if (statsData.success) {
            setDashboardStats(statsData.stats);
          }
        } catch (statsError) {
          console.warn('Failed to parse stats data:', statsError);
        }
      }

    } catch (error: any) {
      console.error('Error fetching teacher data:', error);
      setError(error.message || 'Terjadi kesalahan saat mengambil data teacher');

      if (error.message?.includes('Token') || error.message?.includes('authorization')) {
        console.log('Auth error detected, redirecting to home');
        router.push('/');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderTabContent = () => {
    const activeTabObj = tabs.find(tab => tab.id === activeTab);
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

  // Don't render anything if user cannot access (will redirect)
  if (!user || !teacherId || (user.role !== 'admin' && user.id !== teacherId)) {
    return null;
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="flex justify-center items-center h-[80vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-kelasin-purple border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-kelasin-purple text-xl font-medium">Memuat dashboard teacher...</p>
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
                  <p>Teacher ID: {teacherId}</p>
                  <p>Token exists: {token ? 'Yes' : 'No'}</p>
                </div>
              )}
            </div>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => {
                  setError(null);
                  fetchTeacherData();
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
                    src={teacherProfile?.avatar_url || user?.avatar_url || "/images/profile.png"}
                    alt="Profile Avatar"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold text-kelasin-purple mb-2 animate-fade-in">
                    Dashboard{" "}
                    <span className="text-kelasin-yellow font-kufam inline-block animate-float">
                      Pengajar
                    </span>
                  </h1>
                  <p className="text-lg text-gray-700 animate-fade-in-delayed">
                    {teacherProfile?.full_name || user?.full_name || "Pengajar"} - Kelola konten pembelajaran Anda
                  </p>
                  
                  {/* Quick Stats */}
                  {teacherProfile?.stats && (
                    <div className="flex flex-wrap gap-4 mt-4">
                      <div className="bg-blue-100 px-3 py-1 rounded-full">
                        <span className="text-blue-600 text-sm font-medium">
                          {teacherProfile.stats.total_videos} Video
                        </span>
                      </div>
                      <div className="bg-green-100 px-3 py-1 rounded-full">
                        <span className="text-green-600 text-sm font-medium">
                          {teacherProfile.stats.total_students} Siswa
                        </span>
                      </div>
                      <div className="bg-yellow-100 px-3 py-1 rounded-full">
                        <span className="text-yellow-600 text-sm font-medium">
                          {teacherProfile.token_balance} Token
                        </span>
                      </div>
                    </div>
                  )}
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

      {/* Dashboard Quick Stats */}
      {dashboardStats && (
        <section className="py-8 px-4 lg:px-8 bg-gray-50">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Video</p>
                    <h3 className="text-2xl font-bold text-kelasin-purple">{dashboardStats.overview.total_videos}</h3>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Views</p>
                    <h3 className="text-2xl font-bold text-kelasin-purple">{dashboardStats.overview.total_views.toLocaleString()}</h3>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Siswa</p>
                    <h3 className="text-2xl font-bold text-kelasin-purple">{dashboardStats.overview.total_students}</h3>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Revenue</p>
                    <h3 className="text-2xl font-bold text-kelasin-purple">
                      Rp {dashboardStats.overview.total_revenue.toLocaleString()}
                    </h3>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-full">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Dashboard Tabs */}
      <section className="py-8 px-4 lg:px-8 bg-gray-50">
        <div className="container mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl lg:text-3xl font-bold text-kelasin-purple mb-6 text-center animate-fade-in">
              Menu Dashboard
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              {tabs.map((tab) => (
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
