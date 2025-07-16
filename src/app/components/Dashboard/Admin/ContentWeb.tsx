"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { FiPlus, FiSearch, FiEdit, FiTrash2, FiVideo, FiUsers, FiBook, FiTrendingUp } from "react-icons/fi";

interface Subject {
  id: string;
  title: string;
  video_count: number;
  created_at: string;
}

interface Video {
  id: string;
  title: string;
  description?: string;
  grade: string;
  thumbnail?: string;
  price: number;
  views: number;
  rating: number;
  teacher: {
    id: string;
    name: string;
    avatar?: string;
  };
  subject: {
    id: string;
    title: string;
  };
  stats: {
    total_views: number;
    total_likes: number;
    total_purchases: number;
  };
  created_at: string;
}

interface ContentStats {
  total_subjects: number;
  total_videos: number;
  total_teachers: number;
  total_students: number;
  recent_videos: number;
  popular_subjects: Array<{
    id: string;
    title: string;
    video_count: number;
    total_views: number;
  }>;
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  bgColor: string;
  textColor?: string;
}

const StatCard = ({ title, value, icon, bgColor, textColor = "text-white" }: StatCardProps) => (
  <div className={`${bgColor} rounded-xl p-6 flex items-center justify-between`}>
    <div>
      <p className={`${textColor}/60 text-sm`}>{title}</p>
      <h3 className={`text-2xl font-bold ${textColor} mt-1`}>{value}</h3>
    </div>
    <div className="bg-white/10 p-3 rounded-lg">
      {icon}
    </div>
  </div>
);

export default function ContentWeb() {
  const { user, token } = useAuth();
  
  // States
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [stats, setStats] = useState<ContentStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form states
  const [showSubjectModal, setShowSubjectModal] = useState<boolean>(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [subjectForm, setSubjectForm] = useState<string>("");
  
  // Search and pagination
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // API calls
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/content/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Gagal mengambil statistik konten');
      }

      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error: any) {
      console.error('Error fetching stats:', error);
      setError(error.message);
    }
  };

  const fetchSubjects = async (page = 1, search = '') => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search })
      });

      const response = await fetch(`/api/admin/content/subjects?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Gagal mengambil data subject');
      }

      const data = await response.json();
      if (data.success) {
        setSubjects(data.subjects);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error: any) {
      console.error('Error fetching subjects:', error);
      setError(error.message);
    }
  };

  const fetchVideos = async (page = 1, search = '') => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search })
      });

      const response = await fetch(`/api/admin/content/videos?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Gagal mengambil data video');
      }

      const data = await response.json();
      if (data.success) {
        setVideos(data.videos);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error: any) {
      console.error('Error fetching videos:', error);
      setError(error.message);
    }
  };

  const createSubject = async (title: string) => {
    try {
      const response = await fetch('/api/admin/content/subjects', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title })
      });

      const data = await response.json();
      if (data.success) {
        setSuccess('Subject berhasil ditambahkan');
        fetchSubjects(currentPage, searchTerm);
        fetchStats(); // Refresh stats
        return true;
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      setError(error.message);
      return false;
    }
  };

  const updateSubject = async (id: string, title: string) => {
    try {
      const response = await fetch('/api/admin/content/subjects', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, title })
      });

      const data = await response.json();
      if (data.success) {
        setSuccess('Subject berhasil diperbarui');
        fetchSubjects(currentPage, searchTerm);
        return true;
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      setError(error.message);
      return false;
    }
  };

  const deleteSubject = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/content/subjects?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        setSuccess('Subject berhasil dihapus');
        fetchSubjects(currentPage, searchTerm);
        fetchStats(); // Refresh stats
        return true;
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      setError(error.message);
      return false;
    }
  };

  const deleteVideo = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/content/videos?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        setSuccess('Video berhasil dihapus');
        fetchVideos(currentPage, searchTerm);
        fetchStats(); // Refresh stats
        return true;
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      setError(error.message);
      return false;
    }
  };

  // Event handlers
  const handleSubjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subjectForm.trim()) {
      setError('Nama subject tidak boleh kosong');
      return;
    }
    
    setError(null);
    setSuccess(null);
    
    let success = false;
    if (editingSubject) {
      success = await updateSubject(editingSubject.id, subjectForm);
    } else {
      success = await createSubject(subjectForm);
    }
    
    if (success) {
      setShowSubjectModal(false);
      setEditingSubject(null);
      setSubjectForm("");
    }
  };

  const handleEditSubject = (subject: Subject) => {
    setEditingSubject(subject);
    setSubjectForm(subject.title);
    setShowSubjectModal(true);
  };

  const handleDeleteSubject = async (subject: Subject) => {
    if (confirm(`Apakah Anda yakin ingin menghapus subject "${subject.title}"?`)) {
      await deleteSubject(subject.id);
    }
  };

  const handleDeleteVideo = async (video: Video) => {
    if (confirm(`Apakah Anda yakin ingin menghapus video "${video.title}"?`)) {
      await deleteVideo(video.id);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
    
    if (activeTab === "subjects") {
      fetchSubjects(1, term);
    } else if (activeTab === "videos") {
      fetchVideos(1, term);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    
    if (activeTab === "subjects") {
      fetchSubjects(page, searchTerm);
    } else if (activeTab === "videos") {
      fetchVideos(page, searchTerm);
    }
  };

  // Effects
  useEffect(() => {
    if (!user || !token) return;

    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      
      await fetchStats();
      
      if (activeTab === "subjects") {
        await fetchSubjects(currentPage, searchTerm);
      } else if (activeTab === "videos") {
        await fetchVideos(currentPage, searchTerm);
      }
      
      setLoading(false);
    };

    fetchAllData();
  }, [user, token, activeTab]);

  // Auto-clear messages
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-6">
            {/* Statistics Cards */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard 
                  title="Total Subject" 
                  value={stats.total_subjects}
                  bgColor="bg-gradient-to-r from-blue-600 to-blue-500"
                  icon={<FiBook className="w-6 h-6 text-white" />}
                />
                
                <StatCard 
                  title="Total Video" 
                  value={stats.total_videos}
                  bgColor="bg-gradient-to-r from-green-600 to-green-500"
                  icon={<FiVideo className="w-6 h-6 text-white" />}
                />
                
                <StatCard 
                  title="Total Guru" 
                  value={stats.total_teachers}
                  bgColor="bg-gradient-to-r from-purple-600 to-purple-500"
                  icon={<FiUsers className="w-6 h-6 text-white" />}
                />
                
                <StatCard 
                  title="Video Baru (7 hari)" 
                  value={stats.recent_videos}
                  bgColor="bg-gradient-to-r from-orange-600 to-orange-500"
                  icon={<FiTrendingUp className="w-6 h-6 text-white" />}
                />
              </div>
            )}
            
            {/* Popular Subjects */}
            {stats?.popular_subjects && (
              <div className="bg-white/5 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Subject Populer</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-white/10 text-white/80">
                        <th className="px-4 py-3 text-left">Subject</th>
                        <th className="px-4 py-3 text-center">Jumlah Video</th>
                        <th className="px-4 py-3 text-center">Total Views</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.popular_subjects.map((subject, index) => (
                        <tr key={subject.id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="px-4 py-3 text-white">
                            <div className="flex items-center">
                              <span className="bg-blue-500/20 text-blue-300 text-xs px-2 py-1 rounded mr-3">
                                #{index + 1}
                              </span>
                              {subject.title}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center text-white/60">{subject.video_count}</td>
                          <td className="px-4 py-3 text-center text-white/60">{subject.total_views.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );
        
      case "subjects":
        return (
          <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="text-lg font-semibold text-white">Manajemen Subject</h3>
              <div className="flex gap-3">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    placeholder="Cari subject..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-white/40"
                  />
                </div>
                <button
                  onClick={() => {
                    setEditingSubject(null);
                    setSubjectForm("");
                    setShowSubjectModal(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
                >
                  <FiPlus size={16} />
                  Tambah Subject
                </button>
              </div>
            </div>
            
            {/* Subjects Table */}
            <div className="bg-white/5 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-white/10 text-white/80">
                      <th className="px-6 py-4 text-left">Subject</th>
                      <th className="px-6 py-4 text-center">Jumlah Video</th>
                      <th className="px-6 py-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map((subject) => (
                      <tr key={subject.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="px-6 py-4 text-white">
                          <div>
                            <div className="font-medium">{subject.title}</div>
                            <div className="text-sm text-white/60">ID: {subject.id}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center text-white/60">
                          {subject.video_count}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleEditSubject(subject)}
                              className="text-blue-400 hover:text-blue-300 p-1 transition"
                              title="Edit"
                            >
                              <FiEdit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteSubject(subject)}
                              className="text-red-400 hover:text-red-300 p-1 transition"
                              title="Hapus"
                              disabled={subject.video_count > 0}
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {subjects.length === 0 && !loading && (
                <div className="text-center py-8 text-white/60">
                  {searchTerm ? 'Tidak ada subject yang sesuai dengan pencarian' : 'Belum ada subject yang ditambahkan'}
                </div>
              )}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 rounded ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-white/10 text-white/60 hover:bg-white/20'
                    } transition`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
        
      case "videos":
        return (
          <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="text-lg font-semibold text-white">Manajemen Video</h3>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="Cari video..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-white/40"
                />
              </div>
            </div>
            
            {/* Videos Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {videos.map((video) => (
                <div key={video.id} className="bg-white/5 rounded-xl p-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <img
                        src={video.thumbnail || '/images/integral.jpg'}
                        alt={video.title}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-grow">
                      <h4 className="text-white font-medium mb-2">{video.title}</h4>
                      <div className="space-y-1 text-sm text-white/60">
                        <p>Subject: {video.subject.title}</p>
                        <p>Kelas: {video.grade}</p>
                        <p>Guru: {video.teacher.name}</p>
                        <p>Harga: Rp {video.price.toLocaleString()}</p>
                      </div>
                      <div className="flex justify-between items-center mt-3">
                        <div className="flex gap-4 text-xs text-white/60">
                          <span>{video.stats.total_views} views</span>
                          <span>{video.stats.total_likes} likes</span>
                          <span>{video.stats.total_purchases} pembelian</span>
                        </div>
                        <button
                          onClick={() => handleDeleteVideo(video)}
                          className="text-red-400 hover:text-red-300 p-1 transition"
                          title="Hapus Video"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {videos.length === 0 && !loading && (
              <div className="text-center py-8 text-white/60">
                {searchTerm ? 'Tidak ada video yang sesuai dengan pencarian' : 'Belum ada video yang tersedia'}
              </div>
            )}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 rounded ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-white/10 text-white/60 hover:bg-white/20'
                    } transition`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
        
      default:
        return null;
    }
  };

  if (loading && !stats && subjects.length === 0 && videos.length === 0) {
    return (
      <div className="bg-white/5 rounded-xl p-6">
        <div className="flex justify-center items-center py-12">
          <div className="w-8 h-8 border-4 border-kelasin-purple border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 rounded-xl p-6">
      <h2 className="text-xl font-bold text-white mb-6">Manajemen Konten Web</h2>
      
      {/* Messages */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-500/20 border border-green-500/50 text-green-300 px-4 py-3 rounded mb-6">
          {success}
        </div>
      )}
      
      {/* Tab Navigation */}
      <div className="flex overflow-x-auto mb-6 pb-2">
        <button 
          className={`px-4 py-2 rounded-lg mr-2 ${activeTab === "overview" ? "bg-blue-500 text-white" : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80"}`}
          onClick={() => setActiveTab("overview")}
        >
          <div className="flex items-center">
            <FiTrendingUp className="mr-2" />
            Overview
          </div>
        </button>
        
        <button 
          className={`px-4 py-2 rounded-lg mr-2 ${activeTab === "subjects" ? "bg-blue-500 text-white" : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80"}`}
          onClick={() => setActiveTab("subjects")}
        >
          <div className="flex items-center">
            <FiBook className="mr-2" />
            Subject
          </div>
        </button>
        
        <button 
          className={`px-4 py-2 rounded-lg ${activeTab === "videos" ? "bg-blue-500 text-white" : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80"}`}
          onClick={() => setActiveTab("videos")}
        >
          <div className="flex items-center">
            <FiVideo className="mr-2" />
            Video
          </div>
        </button>
      </div>
      
      {/* Tab Content */}
      {renderTabContent()}
      
      {/* Subject Modal */}
      {showSubjectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">
              {editingSubject ? 'Edit Subject' : 'Tambah Subject Baru'}
            </h3>
            
            <form onSubmit={handleSubjectSubmit}>
              <div className="mb-4">
                <label className="block text-white/60 text-sm mb-1">Nama Subject</label>
                <input 
                  type="text" 
                  value={subjectForm}
                  onChange={(e) => setSubjectForm(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
                  placeholder="Contoh: Matematika, Fisika, dll"
                  required
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <button 
                  type="button"
                  className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded text-sm transition"
                  onClick={() => {
                    setShowSubjectModal(false);
                    setEditingSubject(null);
                    setSubjectForm("");
                  }}
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm transition"
                  disabled={loading}
                >
                  {loading ? 'Menyimpan...' : (editingSubject ? 'Update' : 'Simpan')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}