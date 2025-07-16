"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/context/auth-context";
import { FiShield, FiUsers, FiDatabase, FiActivity, FiMonitor } from "react-icons/fi";

// Interfaces
interface ActivityLog {
  id: string;
  user_id: string;
  user_name: string;
  action: string;
  ip_address: string;
  timestamp: string;
  user_avatar?: string;
}

interface Role {
  id: number;
  name: string;
  description: string;
  permissions: string[];
  user_count: number;
}

interface Backup {
  id: number;
  filename: string;
  size: string;
  created_at: string;
  status: "completed" | "in_progress" | "failed";
}

interface SystemStatus {
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  active_users: number;
  total_users: number;
  total_videos: number;
  total_transactions: number;
  last_updated: string;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  bgColor: string;
}

interface ActivityLogItemProps {
  user_name: string;
  action: string;
  timestamp: string;
  ip_address: string;
  user_avatar?: string;
}

interface RoleItemProps {
  name: string;
  description: string;
  permissions: string[];
  user_count: number;
  onEdit: () => void;
}

interface BackupItemProps {
  filename: string;
  size: string;
  created_at: string;
  status: "completed" | "in_progress" | "failed";
  onDownload: () => void;
  onDelete: () => void;
}

// Components
const StatCard = ({ title, value, icon, bgColor }: StatCardProps) => (
  <div className={`${bgColor} rounded-xl p-6 flex items-center justify-between shadow-lg border border-gray-200`}>
    <div>
      <p className="text-gray-600 text-sm font-medium">{title}</p>
      <h3 className="text-3xl font-bold text-gray-800 mt-1">{value}</h3>
    </div>
    <div className="bg-white/80 p-3 rounded-lg shadow-md">
      <div className="text-gray-700">
        {icon}
      </div>
    </div>
  </div>
);

const ActivityLogItem = ({ user_name, action, timestamp, ip_address, user_avatar }: ActivityLogItemProps) => (
  <div className="flex items-center gap-4 border-b border-gray-200 py-4 last:border-b-0 hover:bg-gray-50 transition-colors">
    <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-gray-200">
      <Image
        src={user_avatar || "/images/profile.png"}
        alt={user_name}
        fill
        className="object-cover"
      />
    </div>
    <div className="flex-grow">
      <p className="text-gray-800">
        <span className="font-semibold text-gray-900">{user_name}</span> 
        <span className="text-gray-700"> {action}</span>
      </p>
      <div className="flex justify-between mt-1">
        <p className="text-gray-500 text-sm">{timestamp}</p>
        <p className="text-gray-500 text-sm">IP: {ip_address}</p>
      </div>
    </div>
  </div>
);

const RoleItem = ({ name, description, permissions, user_count, onEdit }: RoleItemProps) => (
  <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-3">
      <h4 className="font-semibold text-gray-900 text-lg">{name}</h4>
      <button 
        onClick={onEdit}
        className="text-blue-600 text-sm hover:text-blue-800 font-medium transition-colors px-3 py-1 rounded hover:bg-blue-50"
      >
        Edit
      </button>
    </div>
    <p className="text-gray-600 text-sm mb-4 leading-relaxed">{description}</p>
    <div className="flex flex-wrap gap-2 mb-4">
      {permissions.map((permission, index) => (
        <span key={index} className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-medium">
          {permission}
        </span>
      ))}
    </div>
    <p className="text-gray-500 text-sm font-medium">{user_count} pengguna</p>
  </div>
);

const BackupItem = ({ filename, size, created_at, status, onDownload, onDelete }: BackupItemProps) => (
  <div className="flex items-center justify-between border-b border-gray-200 py-4 last:border-b-0 hover:bg-gray-50 transition-colors">
    <div>
      <p className="text-gray-900 font-medium">{filename}</p>
      <div className="flex gap-4 mt-1">
        <p className="text-gray-500 text-sm">{size}</p>
        <p className="text-gray-500 text-sm">{created_at}</p>
      </div>
    </div>
    <div className="flex items-center gap-3">
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
        status === "completed" ? "bg-green-100 text-green-800" : 
        status === "in_progress" ? "bg-yellow-100 text-yellow-800" : 
        "bg-red-100 text-red-800"
      }`}>
        {status === "completed" ? "Selesai" : 
         status === "in_progress" ? "Sedang Proses" : 
         "Gagal"}
      </span>
      {status === "completed" && (
        <button 
          onClick={onDownload}
          className="text-blue-600 hover:text-blue-800 transition-colors p-1 rounded hover:bg-blue-50"
          title="Download"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </button>
      )}
      <button 
        onClick={onDelete}
        className="text-red-600 hover:text-red-800 transition-colors p-1 rounded hover:bg-red-50"
        title="Hapus"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  </div>
);

const GaugeMeter = ({ value, label, color }: { value: number, label: string, color: string }) => (
  <div className="flex flex-col items-center">
    <div className="relative w-24 h-12 overflow-hidden mb-2">
      <div className="absolute inset-0 bg-gray-200 rounded-t-full"></div>
      <div 
        className={`absolute bottom-0 left-0 right-0 ${color} rounded-t-full transition-all duration-500`}
        style={{ height: `${value}%` }}
      ></div>
      <div className="absolute inset-0 flex items-center justify-center text-gray-800 font-bold text-sm">
        {value}%
      </div>
    </div>
    <p className="text-gray-600 text-sm font-medium">{label}</p>
  </div>
);

export default function PrivacySecure() {
  const { user, token } = useAuth();
  
  // States
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [backups, setBackups] = useState<Backup[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    cpu_usage: 0,
    memory_usage: 0,
    disk_usage: 0,
    active_users: 0,
    total_users: 0,
    total_videos: 0,
    total_transactions: 0,
    last_updated: ""
  });
  
  const [activeTab, setActiveTab] = useState<string>("activity_logs");
  const [loading, setLoading] = useState<boolean>(true);
  const [showRoleModal, setShowRoleModal] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showBackupModal, setShowBackupModal] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // API Calls
  const fetchActivityLogs = async () => {
    try {
      const response = await fetch('/api/admin/security/activities', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Gagal mengambil data log aktivitas');
      }

      const data = await response.json();
      if (data.success) {
        setActivityLogs(data.activities);
      }
    } catch (error: any) {
      console.error('Error fetching activity logs:', error);
      setError(error.message);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/admin/security/roles', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Gagal mengambil data role');
      }

      const data = await response.json();
      if (data.success) {
        setRoles(data.roles);
      }
    } catch (error: any) {
      console.error('Error fetching roles:', error);
      setError(error.message);
    }
  };

  const fetchBackups = async () => {
    try {
      const response = await fetch('/api/admin/security/backups', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Gagal mengambil data backup');
      }

      const data = await response.json();
      if (data.success) {
        setBackups(data.backups);
      }
    } catch (error: any) {
      console.error('Error fetching backups:', error);
      setError(error.message);
    }
  };

  const fetchSystemStatus = async () => {
    try {
      const response = await fetch('/api/admin/security/system', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Gagal mengambil data sistem');
      }

      const data = await response.json();
      if (data.success) {
        setSystemStatus(data.system_status);
      }
    } catch (error: any) {
      console.error('Error fetching system status:', error);
      setError(error.message);
    }
  };

  const createBackup = async (filename: string, description?: string) => {
    try {
      const response = await fetch('/api/admin/security/backups', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filename, description })
      });

      const data = await response.json();
      if (data.success) {
        setBackups(prev => [data.backup, ...prev]);
        return true;
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error('Error creating backup:', error);
      setError(error.message);
      return false;
    }
  };

  const deleteBackup = async (filename: string) => {
    try {
      const response = await fetch(`/api/admin/security/backups?filename=${filename}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        setBackups(prev => prev.filter(backup => backup.filename !== filename));
        return true;
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error('Error deleting backup:', error);
      setError(error.message);
      return false;
    }
  };

  useEffect(() => {
    if (!user || !token) return;

    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      
      await Promise.all([
        fetchActivityLogs(),
        fetchRoles(),
        fetchBackups(),
        fetchSystemStatus()
      ]);
      
      setLoading(false);
    };

    fetchAllData();

    // Polling untuk system status setiap 1 menit
    const interval = setInterval(fetchSystemStatus, 60 * 1000);
    return () => clearInterval(interval);
  }, [user, token]);

  // Event Handlers
  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setShowRoleModal(true);
  };

  const handleDownloadBackup = (backup: Backup) => {
    console.log(`Downloading backup: ${backup.filename}`);
  };

  const handleDeleteBackup = async (backup: Backup) => {
    if (confirm(`Apakah Anda yakin ingin menghapus backup ${backup.filename}?`)) {
      await deleteBackup(backup.filename);
    }
  };

  const handleManualBackup = () => {
    setShowBackupModal(true);
  };

  // Render Tab Content
  const renderTabContent = () => {
    switch (activeTab) {
      case "activity_logs":
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Log Aktivitas Admin</h3>
              <div className="flex gap-2">
                <button 
                  onClick={fetchActivityLogs}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                  Refresh
                </button>
              </div>
            </div>
            
            {activityLogs.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <p className="text-gray-500">Tidak ada log aktivitas</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
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
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Pengaturan Role & Permission</h3>
              <button 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                onClick={() => {
                  setSelectedRole(null);
                  setShowRoleModal(true);
                }}
              >
                Tambah Role
              </button>
            </div>
            
            {roles.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <p className="text-gray-500">Tidak ada role yang tersedia</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Backup Database</h3>
              <button 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                onClick={handleManualBackup}
              >
                Backup Manual
              </button>
            </div>
            
            <h4 className="text-gray-800 font-medium mb-4 text-lg">Riwayat Backup</h4>
            {backups.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <p className="text-gray-500">Tidak ada riwayat backup</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
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
        
      case "system_monitoring":
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Monitoring Sistem</h3>
              <p className="text-gray-500 text-sm">Terakhir diperbarui: {systemStatus.last_updated}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <StatCard 
                title="Penggunaan CPU" 
                value={`${systemStatus.cpu_usage}%`}
                bgColor="bg-gradient-to-r from-blue-50 to-blue-100"
                icon={<FiActivity className="w-6 h-6" />}
              />
              
              <StatCard 
                title="Penggunaan Memori" 
                value={`${systemStatus.memory_usage}%`}
                bgColor="bg-gradient-to-r from-green-50 to-green-100"
                icon={<FiActivity className="w-6 h-6" />}
              />
              
              <StatCard 
                title="Penggunaan Disk" 
                value={`${systemStatus.disk_usage}%`}
                bgColor="bg-gradient-to-r from-yellow-50 to-yellow-100"
                icon={<FiDatabase className="w-6 h-6" />}
              />
              
              <StatCard 
                title="Pengguna Aktif" 
                value={systemStatus.active_users}
                bgColor="bg-gradient-to-r from-purple-50 to-purple-100"
                icon={<FiUsers className="w-6 h-6" />}
              />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h4 className="text-gray-900 font-semibold mb-6 text-lg">Performa Sistem</h4>
                <div className="flex justify-around items-center py-6">
                  <GaugeMeter value={systemStatus.cpu_usage} label="CPU" color="bg-blue-500" />
                  <GaugeMeter value={systemStatus.memory_usage} label="Memori" color="bg-green-500" />
                  <GaugeMeter value={systemStatus.disk_usage} label="Disk" color="bg-yellow-500" />
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h4 className="text-gray-900 font-semibold mb-6 text-lg">Statistik Platform</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Total Pengguna</span>
                    <span className="text-gray-900 font-semibold">{systemStatus.total_users}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Total Video</span>
                    <span className="text-gray-900 font-semibold">{systemStatus.total_videos}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 font-medium">Total Transaksi</span>
                    <span className="text-gray-900 font-semibold">{systemStatus.total_transactions}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex justify-center items-center py-12">
          <div className="w-8 h-8 border-4 border-kelasin-purple border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen -m-6 p-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Keamanan & Privasi</h2>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}
        
        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 mb-6">
          <div className="flex overflow-x-auto">
            <button 
              className={`px-6 py-3 rounded-lg mr-2 transition-all duration-200 font-medium text-sm ${
                activeTab === "activity_logs" 
                  ? "bg-blue-600 text-white shadow-md" 
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
              }`}
              onClick={() => setActiveTab("activity_logs")}
            >
              <div className="flex items-center whitespace-nowrap">
                <FiActivity className="mr-2 w-4 h-4" />
                Log Aktivitas
              </div>
            </button>
            
            <button 
              className={`px-6 py-3 rounded-lg mr-2 transition-all duration-200 font-medium text-sm ${
                activeTab === "roles_permissions" 
                  ? "bg-blue-600 text-white shadow-md" 
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
              }`}
              onClick={() => setActiveTab("roles_permissions")}
            >
              <div className="flex items-center whitespace-nowrap">
                <FiUsers className="mr-2 w-4 h-4" />
                Role & Permission
              </div>
            </button>
            
            <button 
              className={`px-6 py-3 rounded-lg mr-2 transition-all duration-200 font-medium text-sm ${
                activeTab === "database_backup" 
                  ? "bg-blue-600 text-white shadow-md" 
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
              }`}
              onClick={() => setActiveTab("database_backup")}
            >
              <div className="flex items-center whitespace-nowrap">
                <FiDatabase className="mr-2 w-4 h-4" />
                Backup Database
              </div>
            </button>
            
            <button 
              className={`px-6 py-3 rounded-lg transition-all duration-200 font-medium text-sm ${
                activeTab === "system_monitoring" 
                  ? "bg-blue-600 text-white shadow-md" 
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
              }`}
              onClick={() => setActiveTab("system_monitoring")}
            >
              <div className="flex items-center whitespace-nowrap">
                <FiMonitor className="mr-2 w-4 h-4" />
                Monitoring Sistem
              </div>
            </button>
          </div>
        </div>
        
        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {renderTabContent()}
        </div>
        
        {/* Modal Backup */}
        {showBackupModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Backup Database Manual</h3>
              
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const filename = formData.get('filename') as string;
                const description = formData.get('description') as string;
                
                const success = await createBackup(filename, description);
                if (success) {
                  setShowBackupModal(false);
                }
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Nama Backup</label>
                    <input 
                      name="filename"
                      type="text" 
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      defaultValue={`kelasinaja_backup_${new Date().toISOString().split('T')[0].replace(/-/g, '')}.sql`}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Deskripsi (Opsional)</label>
                    <textarea 
                      name="description"
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="Deskripsi backup..."
                    ></textarea>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 mt-6">
                  <button 
                    type="button"
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    onClick={() => setShowBackupModal(false)}
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                  >
                    Mulai Backup
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}