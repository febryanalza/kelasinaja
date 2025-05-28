"use client";

import React, { useEffect, useState } from "react";
// import { useParams } from "next/navigation";
import Image from "next/image";
import Header from "@/app/components/layouts/Navbar";
import supabase  from "@/lib/supabase";
import Beranda from "@/app/components/Dashboard/Admin/Beranda";
import ContentWeb from "@/app/components/Dashboard/Admin/ContentWeb";
import Marketing from "@/app/components/Dashboard/Admin/Marketing";
import PrivacySecure from "@/app/components/Dashboard/Admin/PrivacySecure";
import ReportAnalitics from "@/app/components/Dashboard/Admin/ReportAnalitic";
import SupportHelp from "@/app/components/Dashboard/Admin/SupportHelp";
import TokenReward from "@/app/components/Dashboard/Admin/TokenReward";
import UserTransaction from "@/app/components/Dashboard/Admin/UserTransaction";
import User from "@/app/components/Dashboard/Admin/User";
import DecorativeBadge from "@/app/components/elements/DecorativeBadge";
import DecorativeBackground from "@/app/components/elements/DecorativeBackround";
import type { UserMenuDashboard } from "@/app/types/interface";

export default function AdminDashboard() {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("beranda");
  const adminMenus: UserMenuDashboard[] = [
    { id: "beranda", title: "Beranda", component: Beranda },
    { id: "users", title: "Users", component: User },
    { id: "content", title: "Content", component: ContentWeb },
    { id: "transaction", title: "Transaction", component: UserTransaction },
    { id: "tokenReward", title: "Token & Reward", component: TokenReward },
    { id: "privacySecure", title: "Privacy & Secure", component: PrivacySecure },
    { id: "reportAnalitics", title: "Report & Analitics", component: ReportAnalitics },
    { id: "supportHelp", title: "Support & Help", component: SupportHelp },
    { id: "marketing", title: "Marketing", component: Marketing },
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
    const activeTabObj = adminMenus.find(tab => tab.id === activeTab);
    return activeTabObj ? <activeTabObj.component /> : <div>Tab tidak ditemukan</div>;
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="flex justify-center items-center h-[80vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-kelasin-purple border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-kelasin-purple text-xl font-medium">Memuat...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <Header />
      
      {/* Dashboard Header - Hero Style */}
      <section className="relative py-12 lg:py-20 overflow-hidden bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center">
            {/* Profile and Title */}
            <div className="lg:w-1/2 mb-12 lg:mb-0 z-10">
              <div className="flex items-center gap-6 mb-6">
                <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-4 border-kelasin-yellow shadow-lg">
                  <Image
                    src={userProfile?.avatar_url || "/images/profile.png"}
                    alt="Profile Avatar"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold text-kelasin-purple mb-2 animate-fade-in">
                    Dashboard{" "}
                    <span className="text-kelasin-yellow font-kufam inline-block animate-float">
                      Admin
                    </span>
                  </h1>
                  <p className="text-lg text-gray-700 animate-fade-in-delayed">
                    {userProfile?.grade ? `Kelas ${userProfile.grade}` : "Kelola platform KelasinAja dengan mudah"}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Decorative Elements */}
            <DecorativeBadge />
            
          </div>
        </div>

        {/* Background decorative elements */}
        <DecorativeBackground />
        
      </section>

      {/* Dashboard Tabs - Styled like landing page sections */}
      <section className="py-8 px-4 lg:px-8 bg-gray-50">
        <div className="container mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl lg:text-3xl font-bold text-kelasin-purple mb-6 text-center animate-fade-in">
              Menu Dashboard
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              {adminMenus.map((tab) => (
                <button
                  onClick={() => setActiveTab(tab.id)}
                  key={tab.id}
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 transform hover:scale-105 ${
                    activeTab === tab.id
                      ? "bg-kelasin-purple text-white shadow-lg"
                      : "bg-white text-kelasin-purple border-2 border-kelasin-purple hover:bg-kelasin-purple hover:text-white shadow-md hover:shadow-lg"
                  }`}
                >
                  {tab.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Content */}
      <section className="py-8 px-4 lg:px-8">
        <div className="container mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-6 min-h-[600px]">
            {renderTabContent()}
          </div>
        </div>
      </section>

      {/* Footer spacing */}
      <div className="h-16"></div>
    </main>
  );
}
