"use client";
import React, { useEffect } from "react";
import Header from "../components/layouts/Navbar";
import supabase from "@/lib/supabase";
import RenderVideo from "../components/layouts/RenderVideo";

export default function LandingPage() {
  useEffect(() => {
    const fetchUserProfile = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        await supabase
          .from("users")
          .select("avatar_url")
          .eq("id", session.user.id)
          .single();
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
      <section className="relative min-h-[80vh] flex flex-col md:flex-row items-center bg-white">
        <div className="absolute inset-0 w-full h-full pointer-events-none select-none">
          {/* Background shape sesuai desain */}
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 1440 600"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute left-0 top-0 w-full h-full"
          >
            <defs>
              <linearGradient id="kelasinGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#B9A7E6" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#F9CD15" stopOpacity="0.35" />
              </linearGradient>
            </defs>
            <path
              d="M1200 600C1100 400 1300 300 1440 200V0H0V600H1200Z"
              fill="url(#kelasinGradient)"
            />
          </svg>
        </div>
        <div className="relative w-full px-6 md:px-12 lg:px-24 py-20 md:py-0 z-10 flex flex-col gap-8 md:gap-0 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl text-left">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-kelasin-purple drop-shadow-lg">
              Selamat Datang di{" "}
              <span className="text-kelasin-yellow">KelasinAja</span>
            </h1>
            <p className="text-lg md:text-xl text-black mb-10 max-w-xl">
              Platform belajar online terbaik untuk siswa SMA. Pelajari materi
              dari guru terbaik dengan cara yang menyenangkan!
            </p>
            <button className="btn-kelasin shadow-lg mt-2">
              Mulai Belajar!
            </button>
          </div>
          <div className="hidden md:block flex-1">
            {/* Placeholder for illustration or mascot if needed */}
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
