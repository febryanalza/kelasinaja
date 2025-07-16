"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/context/auth-context";
import { FiUsers, FiVideo, FiDollarSign, FiTrendingUp, FiActivity, FiBell, FiAlertCircle, FiInfo } from "react-icons/fi";

// Interface untuk statistik platform
interface PlatformStats {
  totalStudents: number;
  totalTeachers: number;
  totalVideos: number;
  totalTransactions: number;
  dailyRevenue: number;
  monthlyRevenue: number;
}

// Interface untuk data pertumbuhan pengguna
interface GrowthData {
  date: string;
  students: number;
  teachers: number;
}

// Interface untuk aktivitas
interface Activity {
  id: string;
  user_name: string;
  user_avatar?: string;
  action: string;
  timestamp: string;
  type: string;
}

// Interface untuk alert/notifikasi
interface Alert {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error';
  time: string;
}

// Interface untuk StatCard
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  bgColor: string;
}

// Komponen untuk card statistik
const StatCard = ({ title, value, icon, bgColor }: StatCardProps) => (
  <div className={`${bgColor} rounded-xl p-6 flex items-center justify-between`}>
    <div>
      <p className="text-white/60 text-sm">{title}</p>
      <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
    </div>
    <div className="bg-white/10 p-3 rounded-lg">
      {icon}
    </div>
  </div>
);

// Komponen untuk item aktivitas
const ActivityItem = ({ user_name, user_avatar, action, timestamp }: Activity) => (
  <div className="flex items-center gap-4 border-b border-white/10 py-4 last:border-b-0">
    <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
      <Image
        src={user_avatar || "/images/profile.png"}
        alt={user_name}
        fill
        className="object-cover"
      />
    </div>
    <div className="flex-grow">
      <p className="text-white">
        <span className="font-semibold">{user_name}</span> {action}
      </p>
      <p className="text-white/60 text-xs">{timestamp}</p>
    </div>
  </div>
);

// Komponen untuk item alert
const AlertItem = ({ title, message, type, time }: Alert) => {
  const getAlertIcon = () => {
    switch (type) {
      case 'info':
        return <FiInfo className="text-blue-400" />;
      case 'warning':
        return <FiBell className="text-yellow-400" />;
      case 'error':
        return <FiAlertCircle className="text-red-400" />;
      default:
        return <FiInfo className="text-blue-400" />;
    }
  };
  
  const getAlertBg = () => {
    switch (type) {
      case 'info':
        return 'bg-blue-500/10 border-blue-500/30';
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/30';
      case 'error':
        return 'bg-red-500/10 border-red-500/30';
      default:
        return 'bg-blue-500/10 border-blue-500/30';
    }
  };

  return (
    <div className={`p-3 rounded-lg border ${getAlertBg()} mb-3`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          {getAlertIcon()}
        </div>
        <div>
          <h4 className="text-white font-medium">{title}</h4>
          <p className="text-white/80 text-sm mt-1">{message}</p>
          <p className="text-white/60 text-xs mt-2">{time}</p>
        </div>
      </div>
    </div>
  );
};

export default function Beranda() {
  const { token } = useAuth();
  
  // State untuk statistik platform
  const [stats, setStats] = useState<PlatformStats>({
    totalStudents: 0,
    totalTeachers: 0,
    totalVideos: 0,
    totalTransactions: 0,
    dailyRevenue: 0,
    monthlyRevenue: 0
  });
  
  // State untuk data pertumbuhan pengguna
  const [growthData, setGrowthData] = useState<GrowthData[]>([]);
  
  // State untuk aktivitas terbaru
  const [activities, setActivities] = useState<Activity[]>([]);
  
  // State untuk alert & notifikasi
  const [alerts, setAlerts] = useState<Alert[]>([]);
  
  // State untuk loading
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) {
        setError('Token tidak tersedia');
        setLoading(false);
        return;
      }

      try {
        // Fetch dashboard statistics
        const [statsResponse, activitiesResponse] = await Promise.all([
          fetch('/api/admin/dashboard/stats', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }),
          fetch('/api/admin/activities?limit=5', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          })
        ]);

        if (!statsResponse.ok) {
          const errorData = await statsResponse.json();
          throw new Error(errorData.error || 'Gagal mengambil statistik dashboard');
        }

        if (!activitiesResponse.ok) {
          const errorData = await activitiesResponse.json();
          throw new Error(errorData.error || 'Gagal mengambil data aktivitas');
        }

        const statsData = await statsResponse.json();
        const activitiesData = await activitiesResponse.json();

        if (statsData.success) {
          setStats(statsData.stats);
          setGrowthData(statsData.growthData || []);
        }

        if (activitiesData.success) {
          setActivities(activitiesData.activities);
        }

        // Set dummy alerts for demo
        setAlerts([
          {
            id: 1,
            title: 'Peningkatan Traffic',
            message: 'Traffic website meningkat 25% dalam 24 jam terakhir. Pastikan server dapat menangani beban.',
            type: 'info',
            time: '1 jam yang lalu'
          },
          {
            id: 2,
            title: 'Pembayaran Gagal',
            message: 'Terdapat 5 pembayaran gagal dalam sistem. Periksa konfigurasi payment gateway.',
            type: 'warning',
            time: '3 jam yang lalu'
          },
          {
            id: 3,
            title: 'Server Error',
            message: 'Terjadi error pada server penyimpanan video. Beberapa video mungkin tidak dapat diakses.',
            type: 'error',
            time: '5 jam yang lalu'
          }
        ]);
        
      } catch (error: any) {
        console.error('Error fetching dashboard data:', error);
        setError(error.message || 'Terjadi kesalahan saat mengambil data dashboard');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [token]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-b from-gray-900 to-black min-h-screen">
      <h2 className="text-2xl font-bold text-white mb-6">Dashboard Beranda</h2>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      ) : (
        <>
          {/* Statistik Platform */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard 
              title="Total Siswa Aktif" 
              value={stats.totalStudents} 
              icon={<FiUsers className="text-white text-xl" />} 
              bgColor="bg-gradient-to-r from-blue-600 to-blue-800"
            />
            <StatCard 
              title="Total Guru Aktif" 
              value={stats.totalTeachers} 
              icon={<FiUsers className="text-white text-xl" />} 
              bgColor="bg-gradient-to-r from-purple-600 to-purple-800"
            />
            <StatCard 
              title="Total Video Pembelajaran" 
              value={stats.totalVideos} 
              icon={<FiVideo className="text-white text-xl" />} 
              bgColor="bg-gradient-to-r from-green-600 to-green-800"
            />
            <StatCard 
              title="Total Transaksi" 
              value={stats.totalTransactions} 
              icon={<FiDollarSign className="text-white text-xl" />} 
              bgColor="bg-gradient-to-r from-yellow-600 to-yellow-800"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <StatCard 
              title="Pendapatan Hari Ini" 
              value={formatCurrency(stats.dailyRevenue)} 
              icon={<FiDollarSign className="text-white text-xl" />} 
              bgColor="bg-gradient-to-r from-red-600 to-red-800"
            />
            <StatCard 
              title="Pendapatan Bulan Ini" 
              value={formatCurrency(stats.monthlyRevenue)} 
              icon={<FiTrendingUp className="text-white text-xl" />} 
              bgColor="bg-gradient-to-r from-indigo-600 to-indigo-800"
            />
          </div>
          
          {/* Grafik Pertumbuhan Pengguna */}
          {growthData.length > 0 && (
            <div className="bg-white/5 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">Pertumbuhan Pengguna</h3>
              <div className="h-80 w-full">
                <div className="relative h-64 w-full">
                  {/* Sumbu X dan Y */}
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-white/20"></div>
                  <div className="absolute bottom-0 left-0 w-0.5 h-full bg-white/20"></div>
                  
                  {/* Label sumbu X */}
                  <div className="absolute bottom-[-25px] left-0 w-full flex justify-between">
                    {growthData.map((data, index) => (
                      <span key={index} className="text-white/60 text-xs">{data.date}</span>
                    ))}
                  </div>
                  
                  {/* Grafik batang */}
                  <div className="absolute bottom-0 left-0 w-full flex justify-between items-end h-full">
                    {growthData.map((data, index) => {
                      const maxValue = Math.max(...growthData.map(d => Math.max(d.students, d.teachers)));
                      const studentHeight = maxValue > 0 ? (data.students / maxValue) * 100 : 0;
                      const teacherHeight = maxValue > 0 ? (data.teachers / maxValue) * 100 : 0;
                      const barWidth = 100 / (growthData.length * 3);
                      
                      return (
                        <div key={index} className="flex items-end" style={{ width: `${barWidth * 2}%` }}>
                          <div 
                            className="bg-blue-500 rounded-t-sm mx-0.5"
                            style={{ 
                              height: `${studentHeight}%`,
                              width: '45%'
                            }}
                            title={`Siswa: ${data.students}`}
                          ></div>
                          <div 
                            className="bg-purple-500 rounded-t-sm mx-0.5"
                            style={{ 
                              height: `${teacherHeight}%`,
                              width: '45%'
                            }}
                            title={`Guru: ${data.teachers}`}
                          ></div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Legend */}
                <div className="flex justify-center mt-4 gap-6">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-sm mr-2"></div>
                    <span className="text-white/80 text-sm">Siswa</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-purple-500 rounded-sm mr-2"></div>
                    <span className="text-white/80 text-sm">Guru</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Aktivitas Terbaru */}
            <div className="bg-white/5 rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">Aktivitas Terbaru</h3>
                <button className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded text-white transition">
                  Lihat Semua
                </button>
              </div>
              
              {activities.length === 0 ? (
                <p className="text-white/60">Tidak ada aktivitas terbaru</p>
              ) : (
                <div className="space-y-1">
                  {activities.map((activity) => (
                    <ActivityItem 
                      key={activity.id}
                      {...activity}
                    />
                  ))}
                </div>
              )}
            </div>
            
            {/* Alert & Notifikasi */}
            <div className="bg-white/5 rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">Alert & Notifikasi</h3>
                <button className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded text-white transition">
                  Tandai Semua Dibaca
                </button>
              </div>
              
              {alerts.length === 0 ? (
                <p className="text-white/60">Tidak ada notifikasi</p>
              ) : (
                <div>
                  {alerts.map((alert) => (
                    <AlertItem 
                      key={alert.id}
                      title={alert.title}
                      message={alert.message}
                      type={alert.type}
                      time={alert.time}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}