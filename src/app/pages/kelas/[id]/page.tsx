"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Header from "@/app/components/layouts/Navbar";
import supabase from "@/lib/supabase";

// Tipe data untuk kelas video
interface VideoClass {
  id: string;
  title: string;
  subject: string;
  grade: string;
  thumbnail: string;
  description: string;
  instructor: string;
  duration: string;
  rating: number;
  views: string;
  videoUrl: string;
  chapters: Chapter[];
}

interface Chapter {
  id: string;
  title: string;
  duration: string;
}

// Data dummy untuk testing
const dummyVideoClass: VideoClass = {
  id: "1",
  title: "Integral Dasar",
  subject: "Matematika",
  grade: "Kelas 12",
  thumbnail: "/images/integral.jpg",
  description: "Pelajari konsep dasar integral dan aplikasinya dalam kehidupan sehari-hari. Kelas ini mencakup integral tak tentu, integral tentu, dan teorema dasar kalkulus.",
  instructor: "Pak Budi",
  duration: "4 jam 30 menit",
  rating: 4.8,
  views: "1.2k",
  videoUrl: "#",
  chapters: [
    { id: "1-1", title: "Pengenalan Integral", duration: "45 menit" },
    { id: "1-2", title: "Integral Tak Tentu", duration: "60 menit" },
    { id: "1-3", title: "Integral Tentu", duration: "60 menit" },
    { id: "1-4", title: "Teorema Dasar Kalkulus", duration: "45 menit" },
    { id: "1-5", title: "Aplikasi Integral", duration: "60 menit" },
  ],
};

export default function VideoClassDetail() {
  const params = useParams();
  const [videoClass, setVideoClass] = useState<VideoClass | null>(null);
  const [loading, setLoading] = useState(true);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from('users')
          .select('avatar_url')
          .eq('id', session.user.id)
          .single();

        if (profile?.avatar_url) {
          setUserAvatar(profile.avatar_url);
        }
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {

    const videoId = params.id;
    console.log('Fetching video with the ID:', videoId);

    const fetchVideoClass = {
        ...dummyVideoClass,
        id: videoId as string
    };
    // Di sini nantinya akan fetch data dari API/database berdasarkan ID
    // Untuk sementara gunakan data dummy
    setVideoClass(fetchVideoClass);
    setLoading(false);
  }, [params.id]);

  if (loading) {
    return (
      <main className="min-h-screen">
        <Header />
        <div className="flex justify-center items-center h-[80vh]">
          <p className="text-white text-xl">Memuat...</p>
        </div>
      </main>
    );
  }

  if (!videoClass) {
    return (
      <main className="min-h-screen">
        <Header />
        <div className="flex justify-center items-center h-[80vh]">
          <p className="text-white text-xl">Kelas tidak ditemukan</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <Header />

      {/* Hero Section dengan Video Preview */}
      <section className="relative min-h-[50vh] bg-gradient-to-b from-[#000033] to-[#000066]">
        <div className="container mx-auto px-6 py-12 md:py-16">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Video Thumbnail */}
            <div className="md:w-1/2">
              <div className="relative aspect-video rounded-xl overflow-hidden">
                <Image
                  src={videoClass.thumbnail}
                  alt={videoClass.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <button className="bg-white/20 backdrop-blur-sm p-4 rounded-full hover:bg-white/30 transition-all">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Video Info */}
            <div className="md:w-1/2 text-white">
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-white/20 text-white/90 text-xs px-2 py-1 rounded">
                  {videoClass.subject}
                </span>
                <span className="bg-white/20 text-white/90 text-xs px-2 py-1 rounded">
                  {videoClass.grade}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{videoClass.title}</h1>
              <p className="text-white/80 mb-6">{videoClass.description}</p>
              
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-white/60" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                  </svg>
                  <span className="text-white/80">{videoClass.instructor}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-white/60" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12z" />
                    <path d="M10 4a1 1 0 011 1v4.586l2.707 2.707a1 1 0 01-1.414 1.414l-3-3A1 1 0 019 10V5a1 1 0 011-1z" />
                  </svg>
                  <span className="text-white/80">{videoClass.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-white/80">{videoClass.rating}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-white/60" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span className="text-white/80">{videoClass.views} views</span>
                </div>
              </div>
              
              <button className="bg-[var(--peachy-pink)] text-white px-6 py-3 rounded-xl text-lg font-semibold hover:opacity-90 transition-opacity">
                Mulai Belajar
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Daftar Chapter */}
      <section className="py-12 px-6">
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6">Daftar Materi</h2>
          <div className="space-y-4">
            {videoClass.chapters.map((chapter, index) => (
              <div 
                key={chapter.id} 
                className="bg-white/10 rounded-lg p-4 hover:bg-white/15 transition-colors cursor-pointer"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="bg-[var(--peachy-pink)] w-8 h-8 rounded-full flex items-center justify-center text-white font-medium">
                      {index + 1}
                    </div>
                    <h3 className="text-white font-medium">{chapter.title}</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-white/60 text-sm">{chapter.duration}</span>
                    <svg className="w-5 h-5 text-white/60" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rekomendasi Kelas Lainnya */}
      <section className="py-12 px-6">
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6">Kelas Lainnya</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Ini bisa diisi dengan komponen card yang sama seperti di halaman utama */}
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="bg-white/10 rounded-xl overflow-hidden hover:transform hover:scale-105 transition-transform duration-300"
              >
                <div className="relative aspect-video">
                  <Image
                    src="/images/integral.jpg"
                    alt="Kelas lainnya"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-white/20 text-white/90 text-xs px-2 py-1 rounded">
                      Matematika
                    </span>
                    <span className="bg-white/20 text-white/90 text-xs px-2 py-1 rounded">
                      Kelas 12
                    </span>
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2">
                    Turunan Fungsi
                  </h3>
                  <div className="flex justify-between items-center text-white/60 text-sm">
                    <span>850 views</span>
                    <div className="flex items-center bg-white/20 px-2 py-1 rounded">
                      <svg
                        className="w-4 h-4 text-yellow-400 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span>4.6</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}