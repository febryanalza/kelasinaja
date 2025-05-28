"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import supabase from "@/lib/supabase";
import RegisterModal from "@/app/pages/auth/register/page";
import LoginModal from "@/app/pages/auth/login/page";
import Link from "next/link";

interface Subject {
  id: string | number;
  title: string;
}

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSubjectOpen, setIsSubjectOpen] = useState(false);
  const [userAvatar, setUserAvatar] = useState<string>("/images/profile.png");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [userName, setUserName] = useState<string>("");
  const [userGrade, setUserGrade] = useState<string>("");
  const [subjects, setSubjects] = useState<Subject[]>([]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setIsLoggedIn(true);
        const { data: profile } = await supabase
          .from("users")
          .select("avatar_url, full_name, grade")
          .eq("id", session.user.id)
          .single();

        if (profile) {
          if (profile.avatar_url) {
            setUserAvatar(profile.avatar_url);
          }
          if (profile.full_name) {
            setUserName(profile.full_name);
          }
          if (profile.grade) {
            setUserGrade(`Kelas ${profile.grade}`);
          }
        }
      } else {
        setIsLoggedIn(false);
        setUserName("");
        setUserGrade("");
      }
    };

    fetchUserProfile();

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" || event === "USER_UPDATED") {
        setIsLoggedIn(true);
        if (session?.user) {
          const { data: profile } = await supabase
            .from("users")
            .select("avatar_url, full_name, grade")
            .eq("id", session.user.id)
            .single();

          if (profile) {
            if (profile.avatar_url) {
              setUserAvatar(profile.avatar_url);
            }
            if (profile.full_name) {
              setUserName(profile.full_name);
            }
            if (profile.grade) {
              setUserGrade(`Kelas ${profile.grade}`);
            }
          }
        }
      } else if (event === "SIGNED_OUT") {
        setIsLoggedIn(false);
        setUserAvatar("/images/profile.png");
        setUserName("");
        setUserGrade("");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    setIsProfileMenuOpen(false);
  };

  const toggleSubject = async () => {
    // Jika dropdown akan dibuka dan subjects masih kosong, fetch data
    if (!isSubjectOpen && subjects.length === 0) {
      const { data, error } = await supabase
        .from("subject")
        .select("id, title");

      if (error) {
        console.error("Error fetching subjects:", error.message);
      }

      if (data) {
        console.log("Subject data fetched:", data);
        setSubjects(data as Subject[]);
      }
    }

    setIsSubjectOpen(!isSubjectOpen);
    setIsMenuOpen(false);
    setIsProfileMenuOpen(false);
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
    setIsMenuOpen(false);
    setIsSubjectOpen(false);
  };

  // Fungsi untuk membuka modal register
  const openRegisterModal = () => {
    setIsRegisterModalOpen(true);
    setIsLoginModalOpen(false);
    setIsProfileMenuOpen(false);
  };

  // Fungsi untuk menutup modal register
  const closeRegisterModal = () => {
    setIsRegisterModalOpen(false);
  };

  // Fungsi untuk membuka modal login
  const openLoginModal = () => {
    setIsLoginModalOpen(true);
    setIsRegisterModalOpen(false);
    setIsProfileMenuOpen(false);
  };

  // Fungsi untuk menutup modal login
  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  // Fungsi untuk beralih dari login ke register
  const switchToRegister = () => {
    setIsLoginModalOpen(false);
    setIsRegisterModalOpen(true);
  };

  // Fungsi untuk beralih dari register ke login
  const switchToLogin = () => {
    setIsRegisterModalOpen(false);
    setIsLoginModalOpen(true);
  };

  // Fungsi untuk logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsProfileMenuOpen(false);
  };

  return (
    <header className="relative border-b border-gray-200">
      <div className="h-16 flex justify-between items-center py-2 px-4 md:px-8 lg:px-16">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src={"/images/logo.png"}
              alt="Logo"
              width={40}
              height={40}
              className="rounded cursor-pointer hover:scale-105 transition-transform duration-200 shadow-lg object-cover"
            />
            <span className="text-kelasin-purple font-bold hidden md:inline-block text-xl font-kufam">
              KelasinAja
            </span>
          </Link>
          <button
            className="bg-kelasin-purple text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-opacity-90 transition-colors"
            onClick={toggleSubject}
          >
            Jelajahi Kelas
          </button>

          {/* Subject Navigation Widget */}
          {isSubjectOpen && (
            <div className="fixed left-0 top-[60px] w-64 h-[calc(100vh-60px)] bg-white shadow-lg z-50 overflow-y-auto">
              <div className="flex flex-col py-2">
                <div className="px-4 py-2 text-kelasin-purple font-semibold">
                  Mata Pelajaran SMA
                </div>
                {subjects.map((subject) => (
                  <a
                    key={subject.id}
                    href="#"
                    className="text-gray-700 hover:bg-gray-100 px-4 py-2 text-sm"
                  >
                    {subject.title}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Search Bar - Visible on all screens */}
        <div className="flex-1 max-w-md mx-auto px-2">
          <div className="relative">
            <input
              type="search"
              placeholder="Cari..."
              className="w-full bg-white border border-gray-200 text-gray-700 rounded-full pl-10 pr-4 py-2 outline-none focus:ring-2 focus:ring-kelasin-yellow"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-kelasin-yellow"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex space-x-2">
            <Link
              href={`/pages/leaderboard`}
              className="bg-kelasin-purple text-white px-3 py-2 text-sm rounded-md hover:bg-opacity-90 transition-colors"
            >
              Leaderboard
            </Link>
            <Link
              href=""
              className="bg-kelasin-purple text-white px-3 py-2 text-sm rounded-md hover:bg-opacity-90 transition-colors"
            >
              Koleksi
            </Link>
            <Link
              href=""
              className="bg-kelasin-purple text-white px-3 py-2 text-sm rounded-md hover:bg-opacity-90 transition-colors"
            >
              About
            </Link>
            <Link
              href={`/pages/dashboard/student/${1}`}
              className="bg-kelasin-purple text-white px-3 py-2 text-sm rounded-md hover:bg-opacity-90 transition-colors"
            >
              Dashboard
            </Link>
          </div>

          <button
            className="block md:hidden text-kelasin-purple border border-kelasin-purple rounded-md px-3 py-1 text-sm"
            onClick={toggleMenu}
          >
            Menu
          </button>

          {/* Avatar Profile Button */}
          <button
            className="relative w-10 h-10 bg-kelasin-yellow rounded-full overflow-hidden"
            onClick={toggleProfileMenu}
          >
            <Image
              src={userAvatar}
              alt="Profile"
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
          </button>
        </div>

        {/* Profile Menu Widget */}
        {isProfileMenuOpen && (
          <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg z-50 border border-gray-200">
            <div className="flex flex-col py-2">
              {isLoggedIn ? (
                <>
                  <div className="px-4 py-3 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden">
                        <Image
                          src={userAvatar}
                          alt="Profile"
                          width={48}
                          height={48}
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <div className="text-gray-800 font-medium">
                          {userName}
                        </div>
                        <div className="text-gray-500 text-sm">{userGrade}</div>
                      </div>
                    </div>
                  </div>
                  <a
                    href="/profile"
                    className="text-gray-700 hover:bg-gray-100 px-4 py-2 text-sm flex items-center gap-2"
                  >
                    <svg
                      className="w-4 h-4 text-kelasin-purple"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    Profil Saya
                  </a>
                  <a
                    href="/settings"
                    className="text-gray-700 hover:bg-gray-100 px-4 py-2 text-sm flex items-center gap-2"
                  >
                    <svg
                      className="w-4 h-4 text-kelasin-purple"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Pengaturan
                  </a>
                  <button
                    onClick={handleLogout}
                    className="text-gray-700 hover:bg-gray-100 px-4 py-2 text-sm text-left flex items-center gap-2"
                  >
                    <svg
                      className="w-4 h-4 text-red-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Keluar
                  </button>
                </>
              ) : (
                <>
                  <div className="px-4 py-3 border-b border-gray-200">
                    <div className="text-gray-800 font-medium">
                      Selamat Datang
                    </div>
                    <div className="text-gray-500 text-sm">
                      Silakan masuk atau daftar
                    </div>
                  </div>
                  <button
                    onClick={openLoginModal}
                    className="text-gray-700 hover:bg-gray-100 px-4 py-2 text-sm text-left flex items-center gap-2"
                  >
                    <svg
                      className="w-4 h-4 text-kelasin-purple"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                      />
                    </svg>
                    Masuk
                  </button>
                  <button
                    onClick={openRegisterModal}
                    className="text-gray-700 hover:bg-gray-100 px-4 py-2 text-sm text-left flex items-center gap-2"
                  >
                    <svg
                      className="w-4 h-4 text-kelasin-purple"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                      />
                    </svg>
                    Daftar
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Mobile Navigation Widget */}
        {isMenuOpen && (
          <div className="absolute right-0 top-full mt-2 w-max md:hidden bg-white rounded-lg shadow-lg z-50 border border-gray-200">
            <div className="flex flex-col py-2">
              <Link
                href="/pages/leaderboard"
                className="text-gray-700 hover:bg-gray-100 px-4 py-2 text-sm whitespace-nowrap"
              >
                Leaderboard
              </Link>
              <Link
                href=""
                className="text-gray-700 hover:bg-gray-100 px-4 py-2 text-sm whitespace-nowrap"
              >
                Koleksi
              </Link>
              <Link
                href=""
                className="text-gray-700 hover:bg-gray-100 px-4 py-2 text-sm whitespace-nowrap"
              >
                About
              </Link>
              <Link
                href={`/pages/dashboard/student/${1}`}
                className="text-gray-700 hover:bg-gray-100 px-4 py-2 text-sm whitespace-nowrap"
              >
                Dashboard
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Register Modal dengan fungsi switch */}
      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={closeRegisterModal}
        switchToLogin={switchToLogin}
      />

      {/* Login Modal dengan fungsi switch */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={closeLoginModal}
        switchToRegister={switchToRegister}
      />
    </header>
  );
};

export default Header;
