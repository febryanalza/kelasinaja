"use client";

import React, { useState, useEffect } from "react";
import supabase from "@/lib/supabase";
import Image from "next/image";
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
  id: number;
  user_name: string;
  user_avatar?: string;
  action: string;
  timestamp: string;
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
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch total pengguna aktif (siswa)
        const { data: students, error: studentsError } = await supabase
          .from('users')
          .select('count', { count: 'exact' })
          .eq('role', 'student');
          
        if (studentsError) throw studentsError;
        
        // Fetch total pengguna aktif (guru)
        const { data: teachers, error: teachersError } = await supabase
          .from('users')
          .select('count', { count: 'exact' })
          .eq('role', 'teacher');
          
        if (teachersError) throw teachersError;
        
        // Fetch total video pembelajaran
        const { data: videos, error: videosError } = await supabase
          .from('videos')
          .select('count', { count: 'exact' });
          
        if (videosError) throw videosError;
        
        // Fetch total transaksi
        const { data: transactions, error: transactionsError } = await supabase
          .from('token_transactions')
          .select('count', { count: 'exact' });
          
        if (transactionsError) throw transactionsError;
        
        // Fetch pendapatan harian
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
        const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();
        
        const { data: dailyRevenue, error: dailyRevenueError } = await supabase
          .from('token_transactions')
          .select('amount')
          .eq('transaction_type', 'purchase')
          .eq('payment_status', 'completed')
          .gte('created_at', startOfDay)
          .lte('created_at', endOfDay);
          
        if (dailyRevenueError) throw dailyRevenueError;
        
        // Fetch pendapatan bulanan
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999).toISOString();
        
        const { data: monthlyRevenue, error: monthlyRevenueError } = await supabase
          .from('token_transactions')
          .select('amount')
          .eq('transaction_type', 'purchase')
          .eq('payment_status', 'completed')
          .gte('created_at', startOfMonth)
          .lte('created_at', endOfMonth);
          
        if (monthlyRevenueError) throw monthlyRevenueError;
        
        // Hitung total pendapatan harian dan bulanan
        const dailyTotal = dailyRevenue?.reduce((sum, item) => sum + item.amount, 0) || 0;
        const monthlyTotal = monthlyRevenue?.reduce((sum, item) => sum + item.amount, 0) || 0;
        
        // Update state statistik
        setStats({
          totalStudents: students?.[0]?.count || 0,
          totalTeachers: teachers?.[0]?.count || 0,
          totalVideos: videos?.[0]?.count || 0,
          totalTransactions: transactions?.[0]?.count || 0,
          dailyRevenue: dailyTotal,
          monthlyRevenue: monthlyTotal
        });
        
        // Fetch data pertumbuhan pengguna (6 bulan terakhir)
        // Dalam implementasi nyata, ini akan mengambil data dari tabel atau view khusus
        // Untuk demo, kita gunakan data dummy
        const dummyGrowthData = [
          { date: 'Jan', students: 120, teachers: 20 },
          { date: 'Feb', students: 150, teachers: 22 },
          { date: 'Mar', students: 200, teachers: 25 },
          { date: 'Apr', students: 320, teachers: 30 },
          { date: 'Mei', students: 400, teachers: 35 },
          { date: 'Jun', students: 450, teachers: 40 }
        ];
        
        setGrowthData(dummyGrowthData);
        
        // Fetch aktivitas terbaru
        const { data: recentActivities, error: activitiesError } = await supabase
          .from('activity_logs')
          .select('id, user_id, activity_type, description, created_at')
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (activitiesError) throw activitiesError;
        
        // Fetch user details for activities
        if (recentActivities && recentActivities.length > 0) {
          const userIds = recentActivities.map(activity => activity.user_id);
          
          const { data: users, error: usersError } = await supabase
            .from('users')
            .select('id, full_name, avatar_url')
            .in('id', userIds);
            
          if (usersError) throw usersError;
          
          // Map activities with user details
          const activitiesWithUserDetails = recentActivities.map(activity => {
            const user = users?.find(u => u.id === activity.user_id);
            return {
              id: activity.id,
              user_name: user?.full_name || 'Unknown User',
              user_avatar: user?.avatar_url,
              action: activity.description,
              timestamp: new Date(activity.created_at).toLocaleString('id-ID', {
                day: 'numeric',
                month: 'long',
                hour: '2-digit',
                minute: '2-digit'
              })
            };
          });
          
          setActivities(activitiesWithUserDetails);
        } else {
          // Jika tidak ada aktivitas, gunakan data dummy
          setActivities([
            {
              id: 1,
              user_name: 'Ahmad Rizki',
              action: 'menambahkan video pembelajaran baru',
              timestamp: '5 menit yang lalu'
            },
            {
              id: 2,
              user_name: 'Siti Nurhaliza',
              action: 'membeli token sebanyak 100',
              timestamp: '15 menit yang lalu'
            },
            {
              id: 3,
              user_name: 'Budi Santoso',
              action: 'mendaftar sebagai pengguna baru',
              timestamp: '1 jam yang lalu'
            }
          ]);
        }
        
        // Set alerts & notifikasi (data dummy untuk demo)
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
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

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
          <div className="bg-white/5 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Pertumbuhan Pengguna (6 Bulan Terakhir)</h3>
            <div className="h-80 w-full">
              {/* Implementasi grafik dengan SVG sederhana */}
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
                
                {/* Grafik batang untuk siswa */}
                <div className="absolute bottom-0 left-0 w-full flex justify-between items-end h-full">
                  {growthData.map((data, index) => {
                    const maxValue = Math.max(...growthData.map(d => Math.max(d.students, d.teachers)));
                    const studentHeight = (data.students / maxValue) * 100;
                    const teacherHeight = (data.teachers / maxValue) * 100;
                    const barWidth = 100 / (growthData.length * 3); // Lebar bar
                    
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