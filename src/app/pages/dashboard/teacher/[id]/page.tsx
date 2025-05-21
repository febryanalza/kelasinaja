"use client";

import React, { useEffect, useState } from "react";
// import { useParams } from "next/navigation";
import Image from "next/image";
import Header from "@/app/components/layouts/Navbar";
import ClassManagement from "@/app/components/Dashboard/Teacher/ClassManagement";
import Monetisasi from "@/app/components/Dashboard/Teacher/Monetisasi";
import Statistic from "@/app/components/Dashboard/Teacher/Statistic";
import UploadVideo from "@/app/components/Dashboard/Teacher/UploadVideo";
import Videos from "@/app/components/Dashboard/Teacher/Videos";
import supabase from "@/lib/supabase";
import type { UserMenuDashboard } from "@/app/types/interface";



export default function StudentDashboard() {
  //   const params = useParams();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("uploadVideo");
  

  const tabs: UserMenuDashboard[] = [
    { id: "uploadVideo", title: "Upload Video", component: UploadVideo },
    { id: "videos", title: "Videos", component: Videos  },
    { id: "monet", title: "Monetisasi", component: Monetisasi  },
    { id: "statisticAnalitic", title: "Statistik & Analitik", component: Statistic },
    { id: "classManagement", title: "Manajemen Kelas",  component: ClassManagement },
  ];

  useEffect(() => {
    const fetchUserProfile = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const { data: profile } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (profile) {
          setUserProfile(profile);
        }
      }
      setLoading(false);
    };

    fetchUserProfile();
  }, []);

  const renderTabContent = () => {
    const activeTabObj = tabs.find(tab => tab.id === activeTab);
    return activeTabObj ? <activeTabObj.component /> : <div>Tab tidak ditemukan</div>;
  };


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

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#000033] to-[#000066]">
      <Header />

      {/* Dashboard Header */}
      <section className="pt-8 pb-4 px-6 md:px-12 lg:px-24">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden">
                <Image
                  src={userProfile?.avatar_url || "/images/profile.png"}
                  alt="Profile Avatar"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  Dashboard {userProfile?.full_name || "Siswa"}
                </h1>
                <p className="text-white/60">
                  {userProfile?.grade ? `Kelas ${userProfile.grade}` : ""}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Tabs */}
      <section className="px-6 md:px-12 lg:px-24 mb-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex overflow-x-auto gap-2 border-b border-white/10 pb-2">
            {tabs.map((tab) => (
              <button
                onClick={() => setActiveTab(tab.id)}
                key={tab.id}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg ${
                  activeTab === tab.id
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                {tab.title}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Content */}
      <section className="px-6 md:px-12 lg:px-24 pb-16">
        <div className="max-w-6xl mx-auto">
          {renderTabContent()}
        </div>
      </section>
    </main>
  );
}
