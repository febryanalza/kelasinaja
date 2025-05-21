"use client"
import React, { useEffect, useState } from "react";
import Header from "../components/layouts/Navbar";
import Image from "next/image";
import supabase from '@/lib/supabase';
import RenderVideo from "../components/layouts/RenderVideo";

export default function LandingPage() {
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
  
  // Data dummy untuk video populer
  const popularVideos = [
    {
      id: 1,
      title: "Integral Dasar",
      subject: "Matematika",
      grade: "Kelas 12",
      thumbnail: "/images/integral.jpg",
      views: "1.2k",
      rating: 4.8,
    },
    {
      id: 2,
      title: "Hukum Newton",
      subject: "Fisika",
      grade: "Kelas 10",
      thumbnail: "/images/integral.jpg",
      views: "980",
      rating: 4.7,
    },
    {
      id: 3,
      title: "Stoikiometri",
      subject: "Kimia",
      grade: "Kelas 11",
      thumbnail: "/images/integral.jpg",
      views: "850",
      rating: 4.6,
    },
  ];

  return (
    <main className="min-h-screen ">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex flex-col md:flex-row items-center">
        <div className="absolute inset-0 w-full h-full">
          <Image
            src="/images/web_photo.webp"
            alt="Background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        
        <div className="relative w-full px-6 md:px-12 lg:px-24 py-20 md:py-0">
          <div className="max-w-6xl mx-auto text-left">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Selamat Datang di KelasinAja
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-12 max-w-2xl">
              Platform belajar online terbaik untuk siswa SMA. Pelajari materi
              dari guru-guru terbaik dengan cara yang menyenangkan.
            </p>
            <button className="bg-[var(--peachy-pink)] text-white px-8 py-3 rounded-xl text-lg font-semibold hover:opacity-90 transition-opacity">
              Mulai Belajar
            </button>
          </div>
        </div>
      </section>

      {/* Popular Videos Section */}
      <section className="py-16 px-6 md:px-12 lg:px-24">
        <div className="max-w-6xl mx-auto">
          <RenderVideo 
            videos={popularVideos} 
            title="Video Populer" 
            showFilters={false} 
          />
        </div>
      </section>
    </main>
  );
}
