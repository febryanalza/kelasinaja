export default function Beranda() {
    return(
        <div>
            <p>Beranda</p>
        </div>
    );
}
// "use client";

// import React, { useState, useEffect } from "react";
// import { supabase } from "@/lib/supabase";
// import Image from "next/image";



// interface Alert {
//     id: number;
//     title: string;
//     message: string;
//     type: 'info' | 'warning' | 'error';
//     time: string;
//   }
  
//   interface Activity {
//     id: number;
//     user: string;
//     action: string;
//     time: string;
//     avatar?: string;
//   }
  
//   // Tambahkan interface untuk StatCard
//   interface StatCardProps {
//     title: string;
//     value: string | number;
//     icon: React.ReactNode;
//     bgColor: string;
//   }
  
//   // Tambahkan interface untuk ActivityItem
//   interface ActivityItemProps {
//     user: string;
//     action: string;
//     time: string;
//     avatar?: string;
//   }
  

//   // Tambahkan interface untuk AlertItem
//   interface AlertItemProps {
//     title: string;
//     message: string;
//     type: 'info' | 'warning' | 'error';
//     time: string;
//   }
  

// // Komponen untuk card statistik
// const StatCard = ({ title, value, icon, bgColor }: StatCardProps) => (
//   <div className={`${bgColor} rounded-xl p-6 flex items-center justify-between`}>
//     <div>
//       <p className="text-white/60 text-sm">{title}</p>
//       <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
//     </div>
//     <div className="bg-white/10 p-3 rounded-lg">
//       {icon}
//     </div>
//   </div>
// );

// // Komponen untuk item aktivitas
// const ActivityItem = ({ user, action, time, avatar }: ActivityItemProps) => (
//   <div className="flex items-center gap-4 border-b border-white/10 py-4 last:border-b-0">
//     <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
//       <Image
//         src={avatar || "/images/profile.png"}
//         alt={user}
//         fill
//         className="object-cover"
//       />
//     </div>
//     <div className="flex-grow">
//       <p className="text-white">
//         <span className="font-semibold">{user}</span> {action}
//       </p>
//       <p className="text-white/60 text-sm">{time}</p>
//     </div>
//   </div>
// );

// // Komponen untuk notifikasi
// const AlertItem = ({ title, message, type, time }: AlertItemProps) => (
//   <div className={`border-l-4 ${type === "error" ? "border-red-500 bg-red-500/10" : type === "warning" ? "border-yellow-500 bg-yellow-500/10" : "border-blue-500 bg-blue-500/10"} p-4 rounded-r-lg mb-3 last:mb-0`}>
//     <div className="flex justify-between items-start">
//       <h4 className={`font-semibold ${type === "error" ? "text-red-400" : type === "warning" ? "text-yellow-400" : "text-blue-400"}`}>{title}</h4>
//       <span className="text-white/60 text-xs">{time}</span>
//     </div>
//     <p className="text-white/80 mt-1 text-sm">{message}</p>
//   </div>
// );

// export default function Beranda() {
//   // State untuk data statistik
//   const [stats, setStats] = useState({
//     activeUsers: 0,
//     activeTeachers: 0,
//     totalVideos: 0,
//     totalTransactions: 0,
//     dailyRevenue: 0,
//     monthlyRevenue: 0
//   });
  
//   // State untuk data grafik
//   const [chartData, setChartData] = useState({
//     labels: [],
//     students: [],
//     teachers: []
//   });
  
//   // State untuk aktivitas terbaru
//   const [activities, setActivities] = useState<Activity[]>([]);
  
//   // State untuk notifikasi
//   const [alerts, setAlerts] = useState<Alert[]>();
  
//   // State untuk loading
//   const [loading, setLoading] = useState(true);
  
//   // Fungsi untuk mengambil data statistik dari Supabase
//   useEffect(() => {
//     const fetchStats = async () => {
//       try {
//         setLoading(true);
        
//         // Mengambil jumlah pengguna aktif (siswa)
//         const { count: activeStudents } = await supabase
//           .from('users')
//           .select('*', { count: 'exact' })
//           .eq('role', 'student')
//           .eq('status', 'active');
        
//         // Mengambil jumlah guru aktif
//         const { count: activeTeachers } = await supabase
//           .from('users')
//           .select('*', { count: 'exact' })
//           .eq('role', 'teacher')
//           .eq('status', 'active');
        
//         // Mengambil jumlah total video
//         const { count: totalVideos } = await supabase
//           .from('videos')
//           .select('*', { count: 'exact' });
        
//         // Mengambil jumlah total transaksi
//         const { count: totalTransactions } = await supabase
//           .from('token_transactions')
//           .select('*', { count: 'exact' });
        
//         // Mengambil pendapatan harian
//         const today = new Date();
//         today.setHours(0, 0, 0, 0);
//         const { data: dailyTransactions } = await supabase
//           .from('token_transactions')
//           .select('amount')
//           .gte('created_at', today.toISOString());
        
//         const dailyRevenue = dailyTransactions?.reduce((sum, transaction) => sum + transaction.amount, 0) || 0;
        
//         // Mengambil pendapatan bulanan
//         const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
//         const { data: monthlyTransactions } = await supabase
//           .from('token_transactions')
//           .select('amount')
//           .gte('created_at', firstDayOfMonth.toISOString());
        
//         const monthlyRevenue = monthlyTransactions?.reduce((sum, transaction) => sum + transaction.amount, 0) || 0;
        
//         setStats({
//           activeUsers: activeStudents || 0,
//           activeTeachers: activeTeachers || 0,
//           totalVideos: totalVideos || 0,
//           totalTransactions: totalTransactions || 0,
//           dailyRevenue,
//           monthlyRevenue
//         });
//       } catch (error) {
//         console.error('Error fetching stats:', error);
//       }
//     };
    
//     const fetchChartData = async () => {
//       try {
//         // Mengambil data untuk 6 bulan terakhir
//         const labels = [];
//         const students = [];
//         const teachers = [];
        
//         const today = new Date();
        
//         for (let i = 5; i >= 0; i--) {
//           const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
//           const monthName = month.toLocaleDateString('id-ID', { month: 'short' });
//           labels.push(monthName);
          
//           const nextMonth = new Date(today.getFullYear(), today.getMonth() - i + 1, 0);
          
//           // Mengambil jumlah siswa baru pada bulan tersebut
//           const { count: newStudents } = await supabase
//             .from('users')
//             .select('*', { count: 'exact' })
//             .eq('role', 'student')
//             .gte('created_at', month.toISOString())
//             .lte('created_at', nextMonth.toISOString());
          
//           students.push(newStudents || 0);
          
//           // Mengambil jumlah guru baru pada bulan tersebut
//           const { count: newTeachers } = await supabase
//             .from('users')
//             .select('*', { count: 'exact' })
//             .eq('role', 'teacher')
//             .gte('created_at', month.toISOString())
//             .lte('created_at', nextMonth.toISOString());
          
//           teachers.push(newTeachers || 0);
//         }
        
//         setChartData({ labels, students, teachers });
//       } catch (error) {
//         console.error('Error fetching chart data:', error);
//       }
//     };
    
//     const fetchActivities = async () => {
//       try {
//         const { data } = await supabase
//           .from('activity_logs')
//           .select('*, users(full_name, avatar_url)')
//           .order('created_at', { ascending: false })
//           .limit(5);
        
//         if (data) {
//           setActivities(data.map(activity => ({
//             id: activity.id,
//             user: activity.users.full_name,
//             avatar: activity.users.avatar_url,
//             action: activity.description,
//             time: formatDate(activity.created_at)
//           })));
//         }
//       } catch (error) {
//         console.error('Error fetching activities:', error);
//       }
//     };
    
//     const fetchAlerts = async () => {
//       try {
//         // Contoh data notifikasi (dalam implementasi nyata, ini bisa diambil dari tabel notifikasi)
//         setAlerts([
//           {
//             id: 1,
//             title: 'Permintaan Verifikasi Guru',
//             message: 'Ada 3 permintaan verifikasi guru baru yang perlu ditinjau',
//             type: 'info',
//             time: '1 jam yang lalu'
//           },
//           {
//             id: 2,
//             title: 'Laporan Konten',
//             message: 'Video "Matematika Dasar" dilaporkan mengandung konten yang tidak sesuai',
//             type: 'warning',
//             time: '3 jam yang lalu'
//           },
//           {
//             id: 3,
//             title: 'Kegagalan Pembayaran',
//             message: 'Terjadi 5 kegagalan pembayaran dalam 24 jam terakhir',
//             type: 'error',
//             time: '1 hari yang lalu'
//           }
//         ]);
//       } catch (error) {
//         console.error('Error fetching alerts:', error);
//       } finally {
//         setLoading(false);
//       }
//     };
    
//     // Memanggil semua fungsi fetch data
//     fetchStats();
//     fetchChartData();
//     fetchActivities();
//     fetchAlerts();
    
//     // Polling data setiap 5 menit
//     const interval = setInterval(() => {
//       fetchStats();
//       fetchActivities();
//       fetchAlerts();
//     }, 5 * 60 * 1000);
    
//     return () => clearInterval(interval);
//   }, []);
  
//   // Format angka dengan pemisah ribuan
//   const formatNumber = (num) => {
//     return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
//   };
  
//   // Format tanggal
//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     const now = new Date();
//     const diffTime = Math.abs(now - date);
//     const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
//     if (diffDays === 0) {
//       const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
//       if (diffHours === 0) {
//         const diffMinutes = Math.floor(diffTime / (1000 * 60));
//         return `${diffMinutes} menit yang lalu`;
//       }
//       return `${diffHours} jam yang lalu`;
//     } else if (diffDays === 1) {
//       return 'Kemarin';
//     } else {
//       return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
//     }
//   };
  
//   // Render grafik pertumbuhan pengguna menggunakan div (dalam implementasi nyata, bisa menggunakan library chart seperti Chart.js)
//   const renderChart = () => {
//     const maxValue = Math.max(...chartData.students, ...chartData.teachers) || 10;
    
//     return (
//       <div className="mt-4">
//         <div className="flex justify-between mb-2">
//           {chartData.labels.map((label, index) => (
//             <div key={index} className="text-center flex-1">
//               <span className="text-white/60 text-xs">{label}</span>
//             </div>
//           ))}
//         </div>
        
//         <div className="relative h-40 bg-white/5 rounded-lg p-4">
//           {/* Garis horizontal */}
//           <div className="absolute left-0 right-0 top-1/4 border-t border-white/10"></div>
//           <div className="absolute left-0 right-0 top-2/4 border-t border-white/10"></div>
//           <div className="absolute left-0 right-0 top-3/4 border-t border-white/10"></div>
          
//           {/* Bar chart siswa */}
//           <div className="flex h-full items-end justify-between">
//             {chartData.students.map((value, index) => (
//               <div key={`student-${index}`} className="flex-1 flex flex-col items-center">
//                 <div 
//                   className="w-6 bg-blue-500 rounded-t-sm" 
//                   style={{ height: `${(value / maxValue) * 100}%` }}
//                 ></div>
//               </div>
//             ))}
//           </div>
          
//           {/* Bar chart guru */}
//           <div className="flex h-full items-end justify-between absolute inset-x-0 bottom-4">
//             {chartData.teachers.map((value, index) => (
//               <div key={`teacher-${index}`} className="flex-1 flex flex-col items-center">
//                 <div 
//                   className="w-6 bg-purple-500 rounded-t-sm ml-8" 
//                   style={{ height: `${(value / maxValue) * 100}%` }}
//                 ></div>
//               </div>
//             ))}
//           </div>
//         </div>
        
//         <div className="flex justify-center mt-4 gap-6">
//           <div className="flex items-center">
//             <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
//             <span className="text-white/60 text-sm">Siswa</span>
//           </div>
//           <div className="flex items-center">
//             <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
//             <span className="text-white/60 text-sm">Guru</span>
//           </div>
//         </div>
//       </div>
//     );
//   };
  
//   return (
//     <div className="bg-white/5 rounded-xl p-6">
//       <h2 className="text-xl font-bold text-white mb-6">Beranda Admin</h2>
      
//       {loading ? (
//         <div className="flex justify-center items-center py-12">
//           <p className="text-white/60 text-lg">Memuat data...</p>
//         </div>
//       ) : (
//         <>
//           {/* Statistik Platform */}
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//             <StatCard 
//               title="Total Pengguna Aktif" 
//               value={formatNumber(stats.activeUsers + stats.activeTeachers)}
//               bgColor="bg-gradient-to-r from-blue-600 to-blue-500"
//               icon={
//                 <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
//                 </svg>
//               }
//             />
            
//             <StatCard 
//               title="Total Video Pembelajaran" 
//               value={formatNumber(stats.totalVideos)}
//               bgColor="bg-gradient-to-r from-green-600 to-green-500"
//               icon={
//                 <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
//                 </svg>
//               }
//             />
            
//             <StatCard 
//               title="Total Transaksi" 
//               value={formatNumber(stats.totalTransactions)}
//               bgColor="bg-gradient-to-r from-yellow-600 to-yellow-500"
//               icon={
//                 <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
//                 </svg>
//               }
//             />
            
//             <StatCard 
//               title="Pendapatan Bulan Ini" 
//               value={`Rp ${formatNumber(stats.monthlyRevenue)}`}
//               bgColor="bg-gradient-to-r from-purple-600 to-purple-500"
//               icon={
//                 <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                 </svg>
//               }
//             />
//           </div>
          
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//             {/* Grafik Pertumbuhan Pengguna */}
//             <div className="lg:col-span-2 bg-white/5 rounded-xl p-6">
//               <h3 className="text-lg font-semibold text-white mb-4">Pertumbuhan Pengguna</h3>
//               {renderChart()}
//             </div>
            
//             <div className="space-y-6">
//               {/* Alert & Notifikasi */}
//               <div className="bg-white/5 rounded-xl p-6">
//                 <h3 className="text-lg font-semibold text-white mb-4">Notifikasi Penting</h3>
//                 {alerts?.length === 0 ? (
//                   <p className="text-white/60">Tidak ada notifikasi penting</p>
//                 ) : (
//                   <div>
//                     {alerts?.map((alert) => (
//                       <AlertItem 
//                         key={alert.id}
//                         title={alert.title}
//                         message={alert.message}
//                         type={alert.type}
//                         time={alert.time}
//                       />
//                     ))}
//                   </div>
//                 )}
//               </div>
              
//               {/* Aktivitas Terbaru */}
//               <div className="bg-white/5 rounded-xl p-6">
//                 <h3 className="text-lg font-semibold text-white mb-4">Aktivitas Terbaru</h3>
//                 {activities.length === 0 ? (
//                   <p className="text-white/60">Belum ada aktivitas terbaru</p>
//                 ) : (
//                   <div>
//                     {activities.map((activity) => (
//                       <ActivityItem 
//                         key={activity.id}
//                         user={activity.user}
//                         action={activity.action}
//                         time={activity.time}
//                         avatar={activity.avatar}
//                       />
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }

