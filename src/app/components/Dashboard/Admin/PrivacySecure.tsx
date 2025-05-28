"use client";

import React, { useState, useEffect } from "react";
import supabase from "@/lib/supabase";
import Image from "next/image";
import { FiShield, FiUsers, FiDatabase, FiActivity, FiMonitor } from "react-icons/fi";

// Interface untuk log aktivitas
interface ActivityLog {
  id: number;
  user_id: string;
  user_name: string;
  action: string;
  ip_address: string;
  timestamp: string;
  user_avatar?: string;
}

// Interface untuk role & permission
interface Role {
  id: number;
  name: string;
  description: string;
  permissions: string[];
  user_count: number;
}

// Interface untuk backup database
interface Backup {
  id: number;
  filename: string;
  size: string;
  created_at: string;
  status: "completed" | "in_progress" | "failed";
}

// Interface untuk monitoring sistem
interface SystemStatus {
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  active_users: number;
  last_updated: string;
}

// Interface untuk StatCard
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  bgColor: string;
}

// Interface untuk ActivityLogItem
interface ActivityLogItemProps {
  user_name: string;
  action: string;
  timestamp: string;
  ip_address: string;
  user_avatar?: string;
}

// Interface untuk RoleItem
interface RoleItemProps {
  name: string;
  description: string;
  permissions: string[];
  user_count: number;
  onEdit: () => void;
}

// Interface untuk BackupItem
interface BackupItemProps {
  filename: string;
  size: string;
  created_at: string;
  status: "completed" | "in_progress" | "failed";
  onDownload: () => void;
  onDelete: () => void;
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

// Komponen untuk item log aktivitas
const ActivityLogItem = ({ user_name, action, timestamp, ip_address, user_avatar }: ActivityLogItemProps) => (
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
      <div className="flex justify-between">
        <p className="text-white/60 text-sm">{timestamp}</p>
        <p className="text-white/60 text-sm">IP: {ip_address}</p>
      </div>
    </div>
  </div>
);

// Komponen untuk item role
const RoleItem = ({ name, description, permissions, user_count, onEdit }: RoleItemProps) => (
  <div className="bg-white/5 rounded-lg p-4 mb-4">
    <div className="flex justify-between items-start mb-2">
      <h4 className="font-semibold text-white">{name}</h4>
      <button 
        onClick={onEdit}
        className="text-blue-400 text-sm hover:text-blue-300 transition"
      >
        Edit
      </button>
    </div>
    <p className="text-white/80 text-sm mb-3">{description}</p>
    <div className="flex flex-wrap gap-2 mb-3">
      {permissions.map((permission, index) => (
        <span key={index} className="bg-blue-500/20 text-blue-300 text-xs px-2 py-1 rounded">
          {permission}
        </span>
      ))}
    </div>
    <p className="text-white/60 text-sm">{user_count} pengguna</p>
  </div>
);

// Komponen untuk item backup
const BackupItem = ({ filename, size, created_at, status, onDownload, onDelete }: BackupItemProps) => (
  <div className="flex items-center justify-between border-b border-white/10 py-4 last:border-b-0">
    <div>
      <p className="text-white font-medium">{filename}</p>
      <div className="flex gap-4">
        <p className="text-white/60 text-sm">{size}</p>
        <p className="text-white/60 text-sm">{created_at}</p>
      </div>
    </div>
    <div className="flex items-center gap-3">
      <span className={`px-2 py-1 rounded text-xs ${
        status === "completed" ? "bg-green-500/20 text-green-300" : 
        status === "in_progress" ? "bg-yellow-500/20 text-yellow-300" : 
        "bg-red-500/20 text-red-300"
      }`}>
        {status === "completed" ? "Selesai" : 
         status === "in_progress" ? "Sedang Proses" : 
         "Gagal"}
      </span>
      {status === "completed" && (
        <button 
          onClick={onDownload}
          className="text-blue-400 hover:text-blue-300 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </button>
      )}
      <button 
        onClick={onDelete}
        className="text-red-400 hover:text-red-300 transition"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  </div>
);

// Komponen untuk gauge meter (monitoring sistem)
const GaugeMeter = ({ value, label, color }: { value: number, label: string, color: string }) => (
  <div className="flex flex-col items-center">
    <div className="relative w-24 h-12 overflow-hidden mb-2">
      <div className="absolute inset-0 bg-white/10 rounded-t-full"></div>
      <div 
        className={`absolute bottom-0 left-0 right-0 ${color} rounded-t-full transition-all duration-500`}
        style={{ height: `${value}%` }}
      ></div>
      <div className="absolute inset-0 flex items-center justify-center text-white font-bold">
        {value}%
      </div>
    </div>
    <p className="text-white/60 text-sm">{label}</p>
  </div>
);

export default function PrivacySecure() {
  // State untuk log aktivitas
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  
  // State untuk role & permission
  const [roles, setRoles] = useState<Role[]>([]);
  
  // State untuk backup database
  const [backups, setBackups] = useState<Backup[]>([]);
  
  // State untuk monitoring sistem
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    cpu_usage: 0,
    memory_usage: 0,
    disk_usage: 0,
    active_users: 0,
    last_updated: ""
  });
  
  // State untuk tab aktif
  const [activeTab, setActiveTab] = useState<string>("activity_logs");
  
  // State untuk loading
  const [loading, setLoading] = useState<boolean>(true);
  
  // State untuk modal edit role
  const [showRoleModal, setShowRoleModal] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  
  // State untuk modal backup
  const [showBackupModal, setShowBackupModal] = useState<boolean>(false);
  
  useEffect(() => {
    // Fungsi untuk mengambil log aktivitas
    const fetchActivityLogs = async () => {
      try {
        // Dalam implementasi nyata, ini akan mengambil data dari tabel activity_logs
        // Contoh data dummy untuk demonstrasi
        setActivityLogs([
          {
            id: 1,
            user_id: "1",
            user_name: "Admin Utama",
            action: "mengubah pengaturan keamanan",
            ip_address: "192.168.1.1",
            timestamp: "10 menit yang lalu",
            user_avatar: "/images/profile.png"
          },
          {
            id: 2,
            user_id: "2",
            user_name: "Moderator",
            action: "menambahkan role baru",
            ip_address: "192.168.1.2",
            timestamp: "1 jam yang lalu",
            user_avatar: "/images/profile.png"
          },
          {
            id: 3,
            user_id: "1",
            user_name: "Admin Utama",
            action: "melakukan backup database",
            ip_address: "192.168.1.1",
            timestamp: "3 jam yang lalu",
            user_avatar: "/images/profile.png"
          },
          {
            id: 4,
            user_id: "3",
            user_name: "Admin Konten",
            action: "mengubah permission role Editor",
            ip_address: "192.168.1.3",
            timestamp: "1 hari yang lalu",
            user_avatar: "/images/profile.png"
          },
          {
            id: 5,
            user_id: "1",
            user_name: "Admin Utama",
            action: "mereset pengaturan keamanan ke default",
            ip_address: "192.168.1.1",
            timestamp: "2 hari yang lalu",
            user_avatar: "/images/profile.png"
          }
        ]);
      } catch (error) {
        console.error("Error fetching activity logs:", error);
      }
    };
    
    // Fungsi untuk mengambil data role & permission
    const fetchRoles = async () => {
      try {
        // Dalam implementasi nyata, ini akan mengambil data dari tabel roles
        // Contoh data dummy untuk demonstrasi
        setRoles([
          {
            id: 1,
            name: "Super Admin",
            description: "Akses penuh ke semua fitur dan pengaturan sistem",
            permissions: ["manage_users", "manage_content", "manage_settings", "manage_roles", "view_logs", "manage_backups"],
            user_count: 2
          },
          {
            id: 2,
            name: "Admin Konten",
            description: "Mengelola konten pembelajaran dan video",
            permissions: ["manage_content", "view_logs"],
            user_count: 5
          },
          {
            id: 3,
            name: "Moderator",
            description: "Memoderasi komentar dan forum diskusi",
            permissions: ["moderate_comments", "view_logs"],
            user_count: 8
          },
          {
            id: 4,
            name: "Support",
            description: "Menangani tiket bantuan dan pertanyaan pengguna",
            permissions: ["manage_tickets", "view_user_data"],
            user_count: 4
          }
        ]);
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    };
    
    // Fungsi untuk mengambil data backup database
    const fetchBackups = async () => {
      try {
        // Dalam implementasi nyata, ini akan mengambil data dari tabel backups
        // Contoh data dummy untuk demonstrasi
        setBackups([
          {
            id: 1,
            filename: "kelasinaja_backup_20230615.sql",
            size: "256 MB",
            created_at: "15 Juni 2023, 02:30",
            status: "completed"
          },
          {
            id: 2,
            filename: "kelasinaja_backup_20230601.sql",
            size: "245 MB",
            created_at: "1 Juni 2023, 02:30",
            status: "completed"
          },
          {
            id: 3,
            filename: "kelasinaja_backup_20230515.sql",
            size: "240 MB",
            created_at: "15 Mei 2023, 02:30",
            status: "completed"
          },
          {
            id: 4,
            filename: "kelasinaja_backup_20230501.sql",
            size: "238 MB",
            created_at: "1 Mei 2023, 02:30",
            status: "completed"
          }
        ]);
      } catch (error) {
        console.error("Error fetching backups:", error);
      }
    };
    
    // Fungsi untuk mengambil data monitoring sistem
    const fetchSystemStatus = async () => {
      try {
        // Dalam implementasi nyata, ini akan mengambil data dari sistem monitoring
        // Contoh data dummy untuk demonstrasi
        setSystemStatus({
          cpu_usage: 35,
          memory_usage: 42,
          disk_usage: 68,
          active_users: 127,
          last_updated: new Date().toLocaleTimeString()
        });
      } catch (error) {
        console.error("Error fetching system status:", error);
      } finally {
        setLoading(false);
      }
    };
    
    // Memanggil semua fungsi fetch data
    fetchActivityLogs();
    fetchRoles();
    fetchBackups();
    fetchSystemStatus();
    
    // Polling data setiap 1 menit untuk monitoring sistem
    const interval = setInterval(() => {
      fetchSystemStatus();
    }, 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Fungsi untuk menangani edit role
  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setShowRoleModal(true);
  };
  
  // Fungsi untuk menangani download backup
  const handleDownloadBackup = (backup: Backup) => {
    // Implementasi download backup
    console.log(`Downloading backup: ${backup.filename}`);
    // Dalam implementasi nyata, ini akan menginisiasi download file
  };
  
  // Fungsi untuk menangani hapus backup
  const handleDeleteBackup = (backup: Backup) => {
    // Implementasi hapus backup
    console.log(`Deleting backup: ${backup.filename}`);
    // Dalam implementasi nyata, ini akan menghapus backup dari database
    setBackups(backups.filter(b => b.id !== backup.id));
  };
  
  // Fungsi untuk menangani backup manual
  const handleManualBackup = () => {
    setShowBackupModal(true);
    // Dalam implementasi nyata, ini akan menampilkan modal konfirmasi backup
  };
  
  // Render tab konten berdasarkan tab aktif
  const renderTabContent = () => {
    switch (activeTab) {
      case "activity_logs":
        return (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Log Aktivitas Admin</h3>
              <div className="flex gap-2">
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition">
                  Filter
                </button>
                <button className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition">
                  Export
                </button>
              </div>
            </div>
            
            {activityLogs.length === 0 ? (
              <p className="text-white/60">Tidak ada log aktivitas</p>
            ) : (
              <div className="bg-white/5 rounded-xl p-4">
                {activityLogs.map((log) => (
                  <ActivityLogItem 
                    key={log.id}
                    user_name={log.user_name}
                    action={log.action}
                    timestamp={log.timestamp}
                    ip_address={log.ip_address}
                    user_avatar={log.user_avatar}
                  />
                ))}
              </div>
            )}
          </div>
        );
        
      case "roles_permissions":
        return (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Pengaturan Role & Permission</h3>
              <button 
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition"
                onClick={() => {
                  setSelectedRole(null);
                  setShowRoleModal(true);
                }}
              >
                Tambah Role
              </button>
            </div>
            
            {roles.length === 0 ? (
              <p className="text-white/60">Tidak ada role yang tersedia</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roles.map((role) => (
                  <RoleItem 
                    key={role.id}
                    name={role.name}
                    description={role.description}
                    permissions={role.permissions}
                    user_count={role.user_count}
                    onEdit={() => handleEditRole(role)}
                  />
                ))}
              </div>
            )}
          </div>
        );
        
      case "database_backup":
        return (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Backup Database</h3>
              <button 
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition"
                onClick={handleManualBackup}
              >
                Backup Manual
              </button>
            </div>
            
            <div className="bg-white/5 rounded-xl p-6 mb-6">
              <h4 className="text-white font-medium mb-3">Pengaturan Backup Otomatis</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/60 text-sm mb-1">Frekuensi Backup</label>
                  <select className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white">
                    <option value="daily">Harian</option>
                    <option value="weekly">Mingguan</option>
                    <option value="biweekly">Dua Mingguan</option>
                    <option value="monthly">Bulanan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white/60 text-sm mb-1">Waktu Backup</label>
                  <input 
                    type="time" 
                    defaultValue="02:30"
                    className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-white/60 text-sm mb-1">Retensi Backup</label>
                  <select className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white">
                    <option value="30">30 hari</option>
                    <option value="60">60 hari</option>
                    <option value="90">90 hari</option>
                    <option value="180">180 hari</option>
                    <option value="365">365 hari</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white/60 text-sm mb-1">Lokasi Penyimpanan</label>
                  <select className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white">
                    <option value="local">Server Lokal</option>
                    <option value="s3">Amazon S3</option>
                    <option value="gcs">Google Cloud Storage</option>
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm transition">
                  Simpan Pengaturan
                </button>
              </div>
            </div>
            
            <h4 className="text-white font-medium mb-3">Riwayat Backup</h4>
            {backups.length === 0 ? (
              <p className="text-white/60">Tidak ada riwayat backup</p>
            ) : (
              <div className="bg-white/5 rounded-xl p-4">
                {backups.map((backup) => (
                  <BackupItem 
                    key={backup.id}
                    filename={backup.filename}
                    size={backup.size}
                    created_at={backup.created_at}
                    status={backup.status}
                    onDownload={() => handleDownloadBackup(backup)}
                    onDelete={() => handleDeleteBackup(backup)}
                  />
                ))}
              </div>
            )}
          </div>
        );
        
      case "security_settings":
        return (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Pengaturan Keamanan</h3>
            
            <div className="bg-white/5 rounded-xl p-6 mb-6">
              <h4 className="text-white font-medium mb-4">Pengaturan Autentikasi</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white">Autentikasi Dua Faktor (2FA)</p>
                    <p className="text-white/60 text-sm">Wajibkan 2FA untuk semua admin</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-white/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white">Batas Percobaan Login</p>
                    <p className="text-white/60 text-sm">Blokir akun setelah beberapa kali gagal login</p>
                  </div>
                  <select className="bg-white/10 border border-white/20 rounded px-3 py-2 text-white">
                    <option value="3">3 kali</option>
                    <option value="5">5 kali</option>
                    <option value="10">10 kali</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white">Masa Berlaku Sesi</p>
                    <p className="text-white/60 text-sm">Logout otomatis setelah tidak aktif</p>
                  </div>
                  <select className="bg-white/10 border border-white/20 rounded px-3 py-2 text-white">
                    <option value="15">15 menit</option>
                    <option value="30">30 menit</option>
                    <option value="60">1 jam</option>
                    <option value="120">2 jam</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="bg-white/5 rounded-xl p-6 mb-6">
              <h4 className="text-white font-medium mb-4">Kebijakan Password</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white">Panjang Minimum Password</p>
                  </div>
                  <select className="bg-white/10 border border-white/20 rounded px-3 py-2 text-white">
                    <option value="8">8 karakter</option>
                    <option value="10">10 karakter</option>
                    <option value="12">12 karakter</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white">Wajib Karakter Kompleks</p>
                    <p className="text-white/60 text-sm">Huruf besar, huruf kecil, angka, dan simbol</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-white/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white">Masa Berlaku Password</p>
                    <p className="text-white">Masa Berlaku Password</p>
                    <p className="text-white/60 text-sm">Wajibkan pengguna mengubah password secara berkala</p>
                  </div>
                  <div>
                    <select className="bg-white/10 border border-white/20 rounded px-3 py-1 text-white text-sm">
                      <option value="never">Tidak Pernah</option>
                      <option value="30">30 hari</option>
                      <option value="60">60 hari</option>
                      <option value="90">90 hari</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white">Kompleksitas Password</p>
                    <p className="text-white/60 text-sm">Atur persyaratan minimum untuk password</p>
                  </div>
                  <div>
                    <select className="bg-white/10 border border-white/20 rounded px-3 py-1 text-white text-sm">
                      <option value="low">Rendah (min. 6 karakter)</option>
                      <option value="medium">Sedang (min. 8 karakter, huruf & angka)</option>
                      <option value="high">Tinggi (min. 10 karakter, huruf, angka & simbol)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white/5 rounded-xl p-6 mb-6">
              <h4 className="text-white font-medium mb-4">Pengaturan Keamanan Lanjutan</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white">Pembatasan IP</p>
                    <p className="text-white/60 text-sm">Batasi akses admin berdasarkan alamat IP</p>
                  </div>
                  <div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                    </label>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white">Deteksi Aktivitas Mencurigakan</p>
                    <p className="text-white/60 text-sm">Deteksi dan blokir aktivitas mencurigakan</p>
                  </div>
                  <div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked />
                      <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                    </label>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white">Enkripsi Data Sensitif</p>
                    <p className="text-white/60 text-sm">Enkripsi tambahan untuk data sensitif</p>
                  </div>
                  <div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked />
                      <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                    </label>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white">Audit Keamanan Otomatis</p>
                    <p className="text-white/60 text-sm">Jalankan audit keamanan secara berkala</p>
                  </div>
                  <div>
                    <select className="bg-white/10 border border-white/20 rounded px-3 py-1 text-white text-sm">
                      <option value="never">Tidak Pernah</option>
                      <option value="weekly">Mingguan</option>
                      <option value="monthly">Bulanan</option>
                      <option value="quarterly">Tiga Bulanan</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm transition">
                  Simpan Pengaturan Keamanan
                </button>
              </div>
            </div>
          </div>
        );
        
      case "system_monitoring":
        return (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Monitoring Sistem</h3>
              <p className="text-white/60 text-sm">Terakhir diperbarui: {systemStatus.last_updated}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <StatCard 
                title="Penggunaan CPU" 
                value={`${systemStatus.cpu_usage}%`}
                bgColor="bg-gradient-to-r from-blue-600 to-blue-500"
                icon={<FiActivity className="w-6 h-6 text-white" />}
              />
              
              <StatCard 
                title="Penggunaan Memori" 
                value={`${systemStatus.memory_usage}%`}
                bgColor="bg-gradient-to-r from-green-600 to-green-500"
                icon={<FiActivity className="w-6 h-6 text-white" />}
              />
              
              <StatCard 
                title="Penggunaan Disk" 
                value={`${systemStatus.disk_usage}%`}
                bgColor="bg-gradient-to-r from-yellow-600 to-yellow-500"
                icon={<FiDatabase className="w-6 h-6 text-white" />}
              />
              
              <StatCard 
                title="Pengguna Aktif" 
                value={systemStatus.active_users}
                bgColor="bg-gradient-to-r from-purple-600 to-purple-500"
                icon={<FiUsers className="w-6 h-6 text-white" />}
              />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white/5 rounded-xl p-6">
                <h4 className="text-white font-medium mb-4">Performa Sistem</h4>
                <div className="flex justify-around items-center py-6">
                  <GaugeMeter value={systemStatus.cpu_usage} label="CPU" color="bg-blue-500" />
                  <GaugeMeter value={systemStatus.memory_usage} label="Memori" color="bg-green-500" />
                  <GaugeMeter value={systemStatus.disk_usage} label="Disk" color="bg-yellow-500" />
                </div>
                
                <div className="mt-4">
                  <h5 className="text-white font-medium mb-2">Status Layanan</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center bg-white/5 p-3 rounded">
                      <span className="text-white">Database</span>
                      <span className="px-2 py-1 rounded text-xs bg-green-500/20 text-green-300">Aktif</span>
                    </div>
                    <div className="flex justify-between items-center bg-white/5 p-3 rounded">
                      <span className="text-white">Web Server</span>
                      <span className="px-2 py-1 rounded text-xs bg-green-500/20 text-green-300">Aktif</span>
                    </div>
                    <div className="flex justify-between items-center bg-white/5 p-3 rounded">
                      <span className="text-white">Cache Server</span>
                      <span className="px-2 py-1 rounded text-xs bg-green-500/20 text-green-300">Aktif</span>
                    </div>
                    <div className="flex justify-between items-center bg-white/5 p-3 rounded">
                      <span className="text-white">Background Jobs</span>
                      <span className="px-2 py-1 rounded text-xs bg-green-500/20 text-green-300">Aktif</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-xl p-6">
                <h4 className="text-white font-medium mb-4">Pengaturan Monitoring</h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-white/60 text-sm mb-1">Interval Refresh Data</label>
                    <select className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white">
                      <option value="30">30 detik</option>
                      <option value="60">1 menit</option>
                      <option value="300">5 menit</option>
                      <option value="600">10 menit</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-white/60 text-sm mb-1">Notifikasi Peringatan</label>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input type="checkbox" id="cpu_alert" className="mr-2" checked />
                        <label htmlFor="cpu_alert" className="text-white">CPU > 80%</label>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" id="memory_alert" className="mr-2" checked />
                        <label htmlFor="memory_alert" className="text-white">Memori > 80%</label>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" id="disk_alert" className="mr-2" checked />
                        <label htmlFor="disk_alert" className="text-white">Disk > 90%</label>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" id="service_alert" className="mr-2" checked />
                        <label htmlFor="service_alert" className="text-white">Layanan tidak aktif</label>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-white/60 text-sm mb-1">Metode Notifikasi</label>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input type="checkbox" id="email_notif" className="mr-2" checked />
                        <label htmlFor="email_notif" className="text-white">Email</label>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" id="dashboard_notif" className="mr-2" checked />
                        <label htmlFor="dashboard_notif" className="text-white">Dashboard</label>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" id="sms_notif" className="mr-2" />
                        <label htmlFor="sms_notif" className="text-white">SMS</label>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm transition">
                    Simpan Pengaturan
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="bg-white/5 rounded-xl p-6">
      <h2 className="text-xl font-bold text-white mb-6">Keamanan & Privasi</h2>
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <p className="text-white/60 text-lg">Memuat data...</p>
        </div>
      ) : (
        <>
          {/* Tab Navigation */}
          <div className="flex overflow-x-auto mb-6 pb-2">
            <button 
              className={`px-4 py-2 rounded-lg mr-2 ${activeTab === "activity_logs" ? "bg-blue-500 text-white" : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80"}`}
              onClick={() => setActiveTab("activity_logs")}
            >
              <div className="flex items-center">
                <FiActivity className="mr-2" />
                Log Aktivitas
              </div>
            </button>
            
            <button 
              className={`px-4 py-2 rounded-lg mr-2 ${activeTab === "roles_permissions" ? "bg-blue-500 text-white" : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80"}`}
              onClick={() => setActiveTab("roles_permissions")}
            >
              <div className="flex items-center">
                <FiUsers className="mr-2" />
                Role & Permission
              </div>
            </button>
            
            <button 
              className={`px-4 py-2 rounded-lg mr-2 ${activeTab === "database_backup" ? "bg-blue-500 text-white" : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80"}`}
              onClick={() => setActiveTab("database_backup")}
            >
              <div className="flex items-center">
                <FiDatabase className="mr-2" />
                Backup Database
              </div>
            </button>
            
            <button 
              className={`px-4 py-2 rounded-lg mr-2 ${activeTab === "security_settings" ? "bg-blue-500 text-white" : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80"}`}
              onClick={() => setActiveTab("security_settings")}
            >
              <div className="flex items-center">
                <FiShield className="mr-2" />
                Pengaturan Keamanan
              </div>
            </button>
            
            <button 
              className={`px-4 py-2 rounded-lg ${activeTab === "system_monitoring" ? "bg-blue-500 text-white" : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80"}`}
              onClick={() => setActiveTab("system_monitoring")}
            >
              <div className="flex items-center">
                <FiMonitor className="mr-2" />
                Monitoring Sistem
              </div>
            </button>
          </div>
          
          {/* Tab Content */}
          {renderTabContent()}
          
          {/* Modal Edit Role */}
          {showRoleModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold text-white mb-4">
                  {selectedRole ? `Edit Role: ${selectedRole.name}` : "Tambah Role Baru"}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-white/60 text-sm mb-1">Nama Role</label>
                    <input 
                      type="text" 
                      className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
                      defaultValue={selectedRole?.name || ""}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white/60 text-sm mb-1">Deskripsi</label>
                    <textarea 
                      className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
                      rows={3}
                      defaultValue={selectedRole?.description || ""}
                    ></textarea>
                  </div>
                  
                  <div>
                    <label className="block text-white/60 text-sm mb-1">Permission</label>
                    <div className="bg-white/10 border border-white/20 rounded p-3 max-h-40 overflow-y-auto">
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <input 
                            type="checkbox" 
                            id="perm_manage_users" 
                            className="mr-2"
                            defaultChecked={selectedRole?.permissions.includes("manage_users")}
                          />
                          <label htmlFor="perm_manage_users" className="text-white">Kelola Pengguna</label>
                        </div>
                        <div className="flex items-center">
                          <input 
                            type="checkbox" 
                            id="perm_manage_content" 
                            className="mr-2"
                            defaultChecked={selectedRole?.permissions.includes("manage_content")}
                          />
                          <label htmlFor="perm_manage_content" className="text-white">Kelola Konten</label>
                        </div>
                        <div className="flex items-center">
                          <input 
                            type="checkbox" 
                            id="perm_manage_settings" 
                            className="mr-2"
                            defaultChecked={selectedRole?.permissions.includes("manage_settings")}
                          />
                          <label htmlFor="perm_manage_settings" className="text-white">Kelola Pengaturan</label>
                        </div>
                        <div className="flex items-center">
                          <input 
                            type="checkbox" 
                            id="perm_manage_roles" 
                            className="mr-2"
                            defaultChecked={selectedRole?.permissions.includes("manage_roles")}
                          />
                          <label htmlFor="perm_manage_roles" className="text-white">Kelola Role</label>
                        </div>
                        <div className="flex items-center">
                          <input 
                            type="checkbox" 
                            id="perm_view_logs" 
                            className="mr-2"
                            defaultChecked={selectedRole?.permissions.includes("view_logs")}
                          />
                          <label htmlFor="perm_view_logs" className="text-white">Lihat Log</label>
                        </div>
                        <div className="flex items-center">
                          <input 
                            type="checkbox" 
                            id="perm_manage_backups" 
                            className="mr-2"
                            defaultChecked={selectedRole?.permissions.includes("manage_backups")}
                          />
                          <label htmlFor="perm_manage_backups" className="text-white">Kelola Backup</label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 mt-6">
                  <button 
                    className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded text-sm transition"
                    onClick={() => setShowRoleModal(false)}
                  >
                    Batal
                  </button>
                  <button 
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm transition"
                    onClick={() => {
                      // Implementasi simpan role
                      setShowRoleModal(false);
                    }}
                  >
                    Simpan
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Modal Backup */}
          {showBackupModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold text-white mb-4">Backup Database Manual</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-white/60 text-sm mb-1">Nama Backup</label>
                    <input 
                      type="text" 
                      className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
                      defaultValue={`kelasinaja_backup_${new Date().toISOString().split('T')[0].replace(/-/g, '')}.sql`}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white/60 text-sm mb-1">Deskripsi (Opsional)</label>
                    <textarea 
                      className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
                      rows={3}
                      placeholder="Deskripsi backup..."
                    ></textarea>
                  </div>
                  
                  <div>
                    <label className="block text-white/60 text-sm mb-1">Lokasi Penyimpanan</label>
                    <select className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white">
                      <option value="local">Server Lokal</option>
                      <option value="s3">Amazon S3</option>
                      <option value="gcs">Google Cloud Storage</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 mt-6">
                  <button 
                    className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded text-sm transition"
                    onClick={() => setShowBackupModal(false)}
                  >
                    Batal
                  </button>
                  <button 
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm transition"
                    onClick={() => {
                      // Implementasi backup manual
                      setShowBackupModal(false);
                      // Tambahkan backup baru ke daftar
                      const newBackup: Backup = {
                        id: backups.length + 1,
                        filename: `kelasinaja_backup_${new Date().toISOString().split('T')[0].replace(/-/g, '')}.sql`,
                        size: "250 MB",
                        created_at: new Date().toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
                        status: "completed"
                      };
                      setBackups([newBackup, ...backups]);
                    }}
                  >
                    Mulai Backup
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}