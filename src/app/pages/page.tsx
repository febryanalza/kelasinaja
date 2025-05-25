"use client";
import React, { useEffect } from "react";
import Header from "../components/layouts/Navbar";
import supabase from "@/lib/supabase";
import RenderVideo from "../components/layouts/RenderVideo";
import Image from "next/image";

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

  // Data dummy untuk mata pelajaran
  const subjects = [
    {
      id: 1,
      title: "Matematika",
      icon: "📊",
      count: 24,
    },
    {
      id: 2,
      title: "Fisika",
      icon: "⚛️",
      count: 18,
    },
    {
      id: 3,
      title: "Kimia",
      icon: "🧪",
      count: 16,
    },
    {
      id: 4,
      title: "Biologi",
      icon: "🔬",
      count: 20,
    },
    {
      id: 5,
      title: "Bahasa Inggris",
      icon: "🌐",
      count: 15,
    },
    {
      id: 6,
      title: "Sejarah",
      icon: "📜",
      count: 12,
    },
  ];

  return (
    <main className="min-h-screen bg-white">
      <Header /> {/* Hero Section - sesuai dengan gambar */}
      <section className="relative py-12 lg:py-20 overflow-hidden">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center">
            {/* Teks dan CTA */}
            <div className="lg:w-1/2 mb-12 lg:mb-0 z-10">
              <h1 className="text-4xl lg:text-6xl font-bold text-kelasin-purple mb-6 animate-fade-in">
                Selamat Datang di{" "}
                <span className="text-kelasin-yellow font-kufam inline-block animate-float">
                  KelasinAja
                </span>
              </h1>
              <p className="text-lg mb-8 text-gray-700 max-w-lg animate-fade-in-delayed">
                Platform belajar online terbaik untuk siswa SMA. Pelajari materi
                dari guru guru terbaik dengan cara yang menyenangkan!
              </p>
              <button className="bg-kelasin-yellow text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-opacity-90 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 animate-fade-in-delayed-more hover:scale-105 focus:outline-none focus:ring-2 focus:ring-kelasin-yellow focus:ring-opacity-50">
                Mulai Belajar!
              </button>
            </div>
            {/* Area dengan decorative logo graphic */}
            <div className="lg:w-1/2 relative h-80 lg:h-auto flex items-center justify-center">
              <div className="relative w-full h-full flex justify-center items-center">
                <div className="absolute w-80 h-80 rounded-full bg-kelasin-purple opacity-5 animate-pulse-slower"></div>
                <div className="absolute w-64 h-64 rounded-full bg-kelasin-yellow opacity-5 animate-pulse-slowest"></div>
                <Image
                  src="/images/kelasin_graphic.png"
                  alt="KelasinAja Graphic"
                  width={600}
                  height={600}
                  className="object-contain animate-float z-10 max-w-full h-auto"
                  priority
                />
              </div>
            </div>
          </div>
        </div>

        {/* Background decorative elements for larger screens */}
        <div className="hidden lg:block">
          <div className="absolute -bottom-10 -right-10 w-80 h-80 bg-kelasin-yellow opacity-10 rounded-full"></div>
          <div className="absolute top-20 -right-10 w-40 h-40 bg-kelasin-purple opacity-10 rounded-full"></div>
          <div className="absolute -top-10 right-40 w-24 h-24 bg-kelasin-purple opacity-10 rounded-full"></div>
          <div className="absolute bottom-10 right-20 w-16 h-16 bg-kelasin-yellow opacity-10 rounded-full"></div>
        </div>
      </section>{" "}
      {/* Popular Videos Section */}
      <section className="py-16 px-4 lg:px-8 bg-gray-50">
        <div className="container mx-auto">
          <RenderVideo
            videos={popularVideos}
            title="Video Populer"
            showFilters={false}
          />
        </div>
      </section>
      {/* Subject Categories Section */}
      <section className="py-16 px-4 lg:px-8">
        <div className="container mx-auto">
          <h2 className="text-2xl lg:text-3xl font-bold text-kelasin-purple mb-8 text-center animate-fade-in">
            Mata Pelajaran
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6">
            {subjects.map((subject) => (
              <div
                key={subject.id}
                className="bg-white rounded-lg shadow-md p-6 hover-shadow-grow transition-all duration-300 border border-gray-100 hover:border-kelasin-purple hover:border-opacity-50 text-center animate-fade-in-delayed"
              >
                <div className="text-3xl mb-3 transform transition-transform duration-300 hover:scale-110">
                  {subject.icon}
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">
                  {subject.title}
                </h3>
                <p className="text-sm text-gray-500">{subject.count} kelas</p>
              </div>
            ))}
          </div>
        </div>
      </section>{" "}
      {/* Why Choose Us Section */}
      <section className="py-16 px-4 lg:px-8 bg-kelasin-purple bg-opacity-5">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold text-kelasin-purple mb-3 animate-fade-in">
              Mengapa <span className="font-kufam">KelasinAja</span>?
            </h2>
            <p className="text-gray-700 max-w-2xl mx-auto animate-fade-in-delayed">
              Platform belajar online dengan pendekatan berbeda untuk membantu
              siswa mencapai prestasi akademik terbaik
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md hover-shadow-grow transition-all duration-300 animate-fade-in-delayed">
              <div className="bg-kelasin-yellow bg-opacity-20 w-14 h-14 rounded-full flex items-center justify-center mb-4 transform transition-transform duration-300 hover:scale-110">
                <svg
                  className="w-8 h-8 text-kelasin-yellow"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2L1 21h22L12 2zm0 4.92L19.5 19h-15L12 6.92z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2 text-gray-800">
                Pembelajaran Adaptif
              </h3>
              <p className="text-gray-600">
                Sistem pembelajaran yang menyesuaikan dengan kemampuan dan
                kecepatan belajar setiap siswa
              </p>
            </div>

            <div
              className="bg-white p-6 rounded-lg shadow-md hover-shadow-grow transition-all duration-300 animate-fade-in-delayed"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="bg-kelasin-purple bg-opacity-20 w-14 h-14 rounded-full flex items-center justify-center mb-4 transform transition-transform duration-300 hover:scale-110">
                <svg
                  className="w-8 h-8 text-kelasin-purple"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2 text-gray-800">
                Gamifikasi Menarik
              </h3>
              <p className="text-gray-600">
                Dapatkan token dan rewards saat menyelesaikan pembelajaran,
                tingkatkan motivasi belajar
              </p>
            </div>

            <div
              className="bg-white p-6 rounded-lg shadow-md hover-shadow-grow transition-all duration-300 animate-fade-in-delayed"
              style={{ animationDelay: "0.4s" }}
            >
              <div className="bg-kelasin-yellow bg-opacity-20 w-14 h-14 rounded-full flex items-center justify-center mb-4 transform transition-transform duration-300 hover:scale-110">
                <svg
                  className="w-8 h-8 text-kelasin-yellow"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2 text-gray-800">
                Materi Berkualitas
              </h3>
              <p className="text-gray-600">
                Konten pembelajaran dibuat oleh pengajar berpengalaman dan
                disesuaikan dengan kurikulum nasional
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Testimonials Section */}
      <section className="py-16 px-4 lg:px-8">
        <div className="container mx-auto">
          <h2 className="text-2xl lg:text-3xl font-bold text-kelasin-purple mb-8 text-center animate-fade-in">
            Apa Kata Mereka Tentang{" "}
            <span className="font-kufam">KelasinAja</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover-shadow-grow transition-all duration-300 animate-fade-in-delayed stagger-item">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-kelasin-purple text-white rounded-full flex items-center justify-center font-bold text-xl transform transition-transform duration-300 hover:scale-110">
                  A
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold">Aditya</h4>
                  <p className="text-sm text-gray-500">Siswa Kelas 12</p>
                </div>
              </div>
              <p className="text-gray-700">
                &ldquo;Saya berhasil meningkatkan nilai matematika saya dari 65
                menjadi 90 berkat penjelasan yang sangat mudah dipahami di
                KelasinAja.&rdquo;
              </p>
              <div className="mt-3 flex text-kelasin-yellow">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover-shadow-grow transition-all duration-300 animate-fade-in-delayed stagger-item">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-kelasin-yellow text-gray-800 rounded-full flex items-center justify-center font-bold text-xl transform transition-transform duration-300 hover:scale-110">
                  B
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold">Budi</h4>
                  <p className="text-sm text-gray-500">Siswa Kelas 11</p>
                </div>
              </div>
              <p className="text-gray-700">
                &ldquo;Saya sangat suka dengan sistem token KelasinAja. Selain
                belajar, saya juga merasa seperti bermain game dan bisa
                menukarkan token dengan hadiah.&rdquo;
              </p>
              <div className="mt-3 flex text-kelasin-yellow">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover-shadow-grow transition-all duration-300 animate-fade-in-delayed stagger-item">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-kelasin-purple text-white rounded-full flex items-center justify-center font-bold text-xl transform transition-transform duration-300 hover:scale-110">
                  C
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold">Clara</h4>
                  <p className="text-sm text-gray-500">Siswa Kelas 10</p>
                </div>
              </div>
              <p className="text-gray-700">
                &ldquo;Platform yang sangat membantu persiapan ujian. Saya bisa
                belajar kapan saja dan di mana saja dengan penjelasan yang mudah
                dipahami.&rdquo;
              </p>
              <div className="mt-3 flex text-kelasin-yellow">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Call to Action */}
      <section className="py-16 px-4 lg:px-8 bg-kelasin-purple text-white">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-8 md:mb-0 md:w-3/5 animate-fade-in">
              <h2 className="text-2xl lg:text-3xl font-bold mb-4">
                Mulai Perjalanan Belajarmu Bersama{" "}
                <span className="font-kufam">KelasinAja</span>
              </h2>
              <p className="text-white/80 mb-6 max-w-lg">
                Dapatkan akses ke ratusan video pembelajaran berkualitas tinggi
                dari pengajar terbaik dan tingkatkan prestasimu sekarang!
              </p>
              <button className="bg-kelasin-yellow text-black px-8 py-3 rounded-full font-bold text-lg hover:bg-opacity-90 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1">
                Daftar Sekarang — Gratis!
              </button>
            </div>

            <div className="md:w-2/5 flex justify-center md:justify-end animate-fade-in-delayed">
              <div className="relative w-64 h-64">
                <div className="absolute right-0 top-0 w-48 h-48 rounded-full bg-kelasin-yellow opacity-20 pulse-slow"></div>
                <div className="absolute right-20 top-12 w-40 h-40 rounded-full bg-white opacity-20 pulse-slower"></div>
                <div className="absolute right-4 top-24 w-28 h-28 rounded-full bg-kelasin-yellow opacity-30 pulse-slowest"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-gray-800 text-white pt-12 pb-6">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="animate-fade-in-delayed">
              <div className="flex items-center gap-2 mb-4">
                <Image
                  src={"/images/logo.png"}
                  alt="Logo"
                  width={40}
                  height={40}
                  className="rounded hover:scale-110 transition-transform duration-300"
                />
                <span className="font-bold text-xl font-kufam">KelasinAja</span>
              </div>
              <p className="text-gray-300 mb-4">
                Platform belajar online terbaik untuk siswa SMA dengan
                pendekatan berbasis token dan gamifikasi.
              </p>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="text-white hover:text-kelasin-yellow transition-colors duration-300 transform hover:scale-110"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path>
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-white hover:text-kelasin-yellow transition-colors duration-300 transform hover:scale-110"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"></path>
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-white hover:text-kelasin-yellow transition-colors duration-300 transform hover:scale-110"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"></path>
                  </svg>
                </a>
              </div>
            </div>

            <div className="animate-fade-in-delayed delay-100">
              <h4 className="font-bold text-lg mb-4">Kelas</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition-colors duration-200 hover:translate-x-1 inline-block"
                  >
                    Matematika
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition-colors duration-200 hover:translate-x-1 inline-block"
                  >
                    Fisika
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition-colors duration-200 hover:translate-x-1 inline-block"
                  >
                    Kimia
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition-colors duration-200 hover:translate-x-1 inline-block"
                  >
                    Biologi
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition-colors duration-200 hover:translate-x-1 inline-block"
                  >
                    Bahasa Inggris
                  </a>
                </li>
              </ul>
            </div>

            <div className="animate-fade-in-delayed delay-200">
              <h4 className="font-bold text-lg mb-4">Informasi</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition-colors duration-200 hover:translate-x-1 inline-block"
                  >
                    Tentang Kami
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition-colors duration-200 hover:translate-x-1 inline-block"
                  >
                    Cara Kerja
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition-colors duration-200 hover:translate-x-1 inline-block"
                  >
                    Karir
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition-colors duration-200 hover:translate-x-1 inline-block"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition-colors duration-200 hover:translate-x-1 inline-block"
                  >
                    Kontak
                  </a>
                </li>
              </ul>
            </div>

            <div className="animate-fade-in-delayed delay-300">
              <h4 className="font-bold text-lg mb-4">Bantuan</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition-colors duration-200 hover:translate-x-1 inline-block"
                  >
                    FAQ
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition-colors duration-200 hover:translate-x-1 inline-block"
                  >
                    Syarat & Ketentuan
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition-colors duration-200 hover:translate-x-1 inline-block"
                  >
                    Kebijakan Privasi
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition-colors duration-200 hover:translate-x-1 inline-block"
                  >
                    Dukungan
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-6 mt-6 text-center text-gray-400 text-sm animate-fade-in-delayed delay-400">
            <p>
              &copy; 2025 <span className="font-kufam">KelasinAja</span>. Semua
              hak dilindungi.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
