"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/app/components/layouts/Navbar";
 import  supabase from "@/lib/supabase";

// Tipe data untuk leaderboard
interface Student {
  id: string | number;
  name: string;
  avatar: string;
  grade: string;
  videosWatched: number;
  points: number;
  rank: number;
}

interface Teacher {
  id: string | number;
  name: string;
  avatar: string;
  subject: string;
  videosProduced: number;
  students: number;
  rank: number;
}

interface PopularVideo {
  id: string | number;
  title: string;
  subject: string;
  grade: string;
  thumbnail: string;
  views: string;
  rating: number;
  teacher: string;
  teacherAvatar: string;
}

interface PopularTopic {
  id: string | number;
  name: string;
  subject: string;
  grade: string;
  icon: string;
  totalVideos: number;
  totalViews: string;
}

export default function LeaderboardPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("students");
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [popularVideos, setPopularVideos] = useState<PopularVideo[]>([]);
  const [popularTopics, setPopularTopics] = useState<PopularTopic[]>([]);

  useEffect(() => {
    // Data dummy untuk testing
    // Dalam implementasi nyata, ini akan mengambil data dari API/database
    
    // Data siswa teraktif
    const dummyStudents: Student[] = [
      {
        id: 1,
        name: "Budi Santoso",
        avatar: "/images/profile.png",
        grade: "Kelas 12",
        videosWatched: 156,
        points: 2340,
        rank: 1
      },
      {
        id: 2,
        name: "Siti Nuraini",
        avatar: "/images/profile.png",
        grade: "Kelas 11",
        videosWatched: 142,
        points: 2180,
        rank: 2
      },
      {
        id: 3,
        name: "Ahmad Rizki",
        avatar: "/images/profile.png",
        grade: "Kelas 12",
        videosWatched: 128,
        points: 1950,
        rank: 3
      },
      {
        id: 4,
        name: "Dewi Lestari",
        avatar: "/images/profile.png",
        grade: "Kelas 10",
        videosWatched: 115,
        points: 1820,
        rank: 4
      },
      {
        id: 5,
        name: "Rudi Hermawan",
        avatar: "/images/profile.png",
        grade: "Kelas 11",
        videosWatched: 98,
        points: 1650,
        rank: 5
      },
    ];

    // Data guru teraktif
    const dummyTeachers: Teacher[] = [
      {
        id: 1,
        name: "Pak Hadi",
        avatar: "/images/profile.png",
        subject: "Matematika",
        videosProduced: 45,
        students: 1250,
        rank: 1
      },
      {
        id: 2,
        name: "Bu Sari",
        avatar: "/images/profile.png",
        subject: "Fisika",
        videosProduced: 38,
        students: 980,
        rank: 2
      },
      {
        id: 3,
        name: "Pak Deni",
        avatar: "/images/profile.png",
        subject: "Kimia",
        videosProduced: 32,
        students: 870,
        rank: 3
      },
      {
        id: 4,
        name: "Bu Ratna",
        avatar: "/images/profile.png",
        subject: "Biologi",
        videosProduced: 28,
        students: 760,
        rank: 4
      },
      {
        id: 5,
        name: "Pak Joko",
        avatar: "/images/profile.png",
        subject: "Bahasa Inggris",
        videosProduced: 25,
        students: 680,
        rank: 5
      },
    ];

    // Data video terpopuler
    const dummyPopularVideos: PopularVideo[] = [
      {
        id: 1,
        title: "Integral Dasar",
        subject: "Matematika",
        grade: "Kelas 12",
        thumbnail: "/images/integral.jpg",
        views: "15.2k",
        rating: 4.9,
        teacher: "Pak Hadi",
        teacherAvatar: "/images/profile.png"
      },
      {
        id: 2,
        title: "Hukum Newton",
        subject: "Fisika",
        grade: "Kelas 10",
        thumbnail: "/images/integral.jpg",
        views: "12.8k",
        rating: 4.8,
        teacher: "Bu Sari",
        teacherAvatar: "/images/profile.png"
      },
      {
        id: 3,
        title: "Stoikiometri",
        subject: "Kimia",
        grade: "Kelas 11",
        thumbnail: "/images/integral.jpg",
        views: "10.5k",
        rating: 4.7,
        teacher: "Pak Deni",
        teacherAvatar: "/images/profile.png"
      },
      {
        id: 4,
        title: "Biologi Sel",
        subject: "Biologi",
        grade: "Kelas 11",
        thumbnail: "/images/integral.jpg",
        views: "9.7k",
        rating: 4.6,
        teacher: "Bu Ratna",
        teacherAvatar: "/images/profile.png"
      },
      {
        id: 5,
        title: "Present Perfect Tense",
        subject: "Bahasa Inggris",
        grade: "Kelas 10",
        thumbnail: "/images/integral.jpg",
        views: "8.3k",
        rating: 4.5,
        teacher: "Pak Joko",
        teacherAvatar: "/images/profile.png"
      },
    ];

    // Data topik terpopuler
    const dummyPopularTopics: PopularTopic[] = [
      {
        id: 1,
        name: "Kalkulus",
        subject: "Matematika",
        grade: "Kelas 12",
        icon: "📊",
        totalVideos: 28,
        totalViews: "45.6k"
      },
      {
        id: 2,
        name: "Mekanika",
        subject: "Fisika",
        grade: "Kelas 10-11",
        icon: "🔄",
        totalVideos: 22,
        totalViews: "38.2k"
      },
      {
        id: 3,
        name: "Reaksi Kimia",
        subject: "Kimia",
        grade: "Kelas 11",
        icon: "⚗️",
        totalVideos: 18,
        totalViews: "32.7k"
      },
      {
        id: 4,
        name: "Genetika",
        subject: "Biologi",
        grade: "Kelas 12",
        icon: "🧬",
        totalVideos: 15,
        totalViews: "28.9k"
      },
      {
        id: 5,
        name: "Grammar",
        subject: "Bahasa Inggris",
        grade: "Kelas 10-12",
        icon: "📝",
        totalVideos: 20,
        totalViews: "25.4k"
      },
    ];

    setStudents(dummyStudents);
    setTeachers(dummyTeachers);
    setPopularVideos(dummyPopularVideos);
    setPopularTopics(dummyPopularTopics);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-[#000033] to-[#000066]">
        <Header />
        <div className="flex justify-center items-center h-[80vh]">
          <p className="text-gray-700 text-xl">Memuat...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <Header />

      {/* Leaderboard Header */}
      <section className="pt-8 pb-4 px-6 md:px-12 lg:px-24">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-kelasin-purple mb-2">
            Leaderboard
          </h1>
          <p className="text-gray-700">
            Lihat peringkat siswa, guru, video, dan topik terpopuler di platform kami
          </p>
        </div>
      </section>

      {/* Leaderboard Tabs */}
      <section className="px-6 md:px-12 lg:px-24 mb-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex overflow-x-auto gap-2 border-b border-white/10 pb-2">
            <button
              onClick={() => setActiveTab("students")}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg ${activeTab === "students" ? "bg-white/10 text-gray-700" : "text-gray-700 hover:text-gray-700 hover:bg-white/5"}`}
            >
              Siswa Teraktif
            </button>
            <button
              onClick={() => setActiveTab("teachers")}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg ${activeTab === "teachers" ? "bg-white/10 text-gray-700" : "text-gray-700 hover:text-gray-700 hover:bg-white/5"}`}
            >
              Guru Teraktif
            </button>
            <button
              onClick={() => setActiveTab("videos")}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg ${activeTab === "videos" ? "bg-white/10 text-gray-700" : "text-gray-700 hover:text-gray-700 hover:bg-white/5"}`}
            >
              Video Terpopuler
            </button>
            <button
              onClick={() => setActiveTab("topics")}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg ${activeTab === "topics" ? "bg-white/10 text-gray-700" : "text-gray-700 hover:text-gray-700 hover:bg-white/5"}`}
            >
              Topik Terpopuler
            </button>
          </div>
        </div>
      </section>

      {/* Leaderboard Content */}
      <section className="px-6 md:px-12 lg:px-24 pb-16">
        <div className="max-w-6xl mx-auto">
          {/* Siswa Teraktif */}
          {activeTab === "students" && (
            <div>
              <h2 className="text-xl font-bold text-gray-700 mb-6">Siswa Teraktif (Berdasarkan Jumlah Video Ditonton)</h2>
              
              <div className="bg-white/5 rounded-xl overflow-hidden">
                <div className="grid grid-cols-12 bg-white/10 p-4 text-gray-700/80 font-medium">
                  <div className="col-span-1 text-center">Rank</div>
                  <div className="col-span-5 md:col-span-4">Siswa</div>
                  <div className="col-span-3 text-center hidden md:block">Kelas</div>
                  <div className="col-span-3 text-center">Video Ditonton</div>
                  <div className="col-span-3 md:col-span-1 text-center">Poin</div>
                </div>
                
                {students.map((student) => (
                  <div key={student.id} className="grid grid-cols-12 p-4 border-b border-white/5 text-gray-700 hover:bg-white/5 transition-colors">
                    <div className="col-span-1 text-center flex justify-center items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${student.rank <= 3 ? "bg-[var(--peachy-pink)]" : "bg-white/10"}`}>
                        {student.rank}
                      </div>
                    </div>
                    <div className="col-span-5 md:col-span-4 flex items-center gap-3">
                      <div className="relative w-8 h-8 rounded-full overflow-hidden">
                        <Image
                          src={student.avatar}
                          alt={student.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <span>{student.name}</span>
                    </div>
                    <div className="col-span-3 text-center hidden md:flex items-center justify-center text-gray-700">
                      {student.grade}
                    </div>
                    <div className="col-span-3 text-center flex items-center justify-center">
                      {student.videosWatched}
                    </div>
                    <div className="col-span-3 md:col-span-1 text-center flex items-center justify-center text-yellow-400">
                      {student.points}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Guru Teraktif */}
          {activeTab === "teachers" && (
            <div>
              <h2 className="text-xl font-bold text-gray-700 mb-6">Guru Teraktif (Berdasarkan Jumlah Video Diproduksi)</h2>
              
              <div className="bg-white/5 rounded-xl overflow-hidden">
                <div className="grid grid-cols-12 bg-white/10 p-4 text-gray-700/80 font-medium">
                  <div className="col-span-1 text-center">Rank</div>
                  <div className="col-span-5 md:col-span-4">Guru</div>
                  <div className="col-span-3 text-center hidden md:block">Mata Pelajaran</div>
                  <div className="col-span-3 text-center">Video Dibuat</div>
                  <div className="col-span-3 md:col-span-1 text-center">Siswa</div>
                </div>
                
                {teachers.map((teacher) => (
                  <div key={teacher.id} className="grid grid-cols-12 p-4 border-b border-white/5 text-gray-700 hover:bg-white/5 transition-colors">
                    <div className="col-span-1 text-center flex justify-center items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${teacher.rank <= 3 ? "bg-[var(--peachy-pink)]" : "bg-white/10"}`}>
                        {teacher.rank}
                      </div>
                    </div>
                    <div className="col-span-5 md:col-span-4 flex items-center gap-3">
                      <div className="relative w-8 h-8 rounded-full overflow-hidden">
                        <Image
                          src={teacher.avatar}
                          alt={teacher.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <span>{teacher.name}</span>
                    </div>
                    <div className="col-span-3 text-center hidden md:flex items-center justify-center text-gray-700">
                      {teacher.subject}
                    </div>
                    <div className="col-span-3 text-center flex items-center justify-center">
                      {teacher.videosProduced}
                    </div>
                    <div className="col-span-3 md:col-span-1 text-center flex items-center justify-center text-blue-400">
                      {teacher.students}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Video Terpopuler */}
          {activeTab === "videos" && (
            <div>
              <h2 className="text-xl font-bold text-gray-700 mb-6">Video Terpopuler</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {popularVideos.map((video) => (
                  <Link 
                    href={`/pages/kelas/${video.id}`} 
                    key={video.id}
                    className="bg-white/10 rounded-xl overflow-hidden hover:transform hover:scale-105 transition-transform duration-300"
                  >
                    <div className="relative aspect-video">
                      <Image
                        src={video.thumbnail}
                        alt={video.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-white/20 backdrop-blur-sm text-gray-700 px-2 py-1 rounded text-sm">
                        {video.views} views
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-white/20 text-gray-700/90 text-xs px-2 py-1 rounded">
                          {video.subject}
                        </span>
                        <span className="bg-white/20 text-gray-700/90 text-xs px-2 py-1 rounded">
                          {video.grade}
                        </span>
                      </div>
                      <h3 className="text-gray-700 font-semibold text-lg mb-2">
                        {video.title}
                      </h3>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="relative w-6 h-6 rounded-full overflow-hidden">
                            <Image
                              src={video.teacherAvatar}
                              alt={video.teacher}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <span className="text-gray-700 text-sm">{video.teacher}</span>
                        </div>
                        <div className="flex items-center bg-white/20 px-2 py-1 rounded">
                          <svg
                            className="w-4 h-4 text-yellow-400 mr-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span>{video.rating}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Topik Terpopuler */}
          {activeTab === "topics" && (
            <div>
              <h2 className="text-xl font-bold text-gray-700 mb-6">Topik Terpopuler</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {popularTopics.map((topic) => (
                  <div key={topic.id} className="bg-white/10 rounded-xl p-4 hover:bg-white/15 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl">
                        {topic.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-gray-700 font-semibold text-lg">{topic.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-gray-700 text-sm">{topic.subject}</span>
                          <span className="w-1 h-1 bg-white/40 rounded-full"></span>
                          <span className="text-gray-700 text-sm">{topic.grade}</span>
                        </div>
                        <div className="flex justify-between mt-3">
                          <div>
                            <div className="text-gray-700 text-xs">Total Video</div>
                            <div className="text-gray-700 font-medium">{topic.totalVideos}</div>
                          </div>
                          <div>
                            <div className="text-gray-700 text-xs">Total Views</div>
                            <div className="text-gray-700 font-medium">{topic.totalViews}</div>
                          </div>
                          <div>
                            <Link 
                              href={`/pages/topic/${topic.id}`}
                              className="bg-[var(--peachy-pink)] text-gray-700 text-sm px-3 py-1 rounded-lg hover:opacity-90 transition-opacity"
                            >
                              Lihat
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}