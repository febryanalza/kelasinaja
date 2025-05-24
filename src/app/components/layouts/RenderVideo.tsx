"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

interface VideoClass {
  id: string | number;
  title: string;
  subject: string;
  grade: string;
  thumbnail: string;
  views: string | number;
  rating: number;
  isBought?: boolean;
  isWishlisted?: boolean;
  isLiked?: boolean;
}

interface RenderVideoProps {
  videos: VideoClass[];
  title?: string;
  showFilters?: boolean;
  showPagination?: boolean;
  emptyStateMessage?: string;
}

export default function RenderVideo({
  videos,
  title,
  showFilters = true,
  showPagination = true,
  emptyStateMessage = "Tidak ada video yang ditemukan",
}: RenderVideoProps) {
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedGrade, setSelectedGrade] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [videosPerPage] = useState(9);
  const [filteredVideos, setFilteredVideos] = useState<VideoClass[]>(videos);

  // Filter videos based on selected subject and grade
  useEffect(() => {
    const filtered = videos.filter((video) => {
      const subjectMatch =
        selectedSubject === "all" || video.subject === selectedSubject;
      const gradeMatch =
        selectedGrade === "all" || video.grade === selectedGrade;
      return subjectMatch && gradeMatch;
    });

    setFilteredVideos(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [selectedSubject, selectedGrade, videos]);

  // Get subjects for filter
  const subjects = Array.from(new Set(videos.map((video) => video.subject)));

  // Get grades for filter
  const grades = Array.from(new Set(videos.map((video) => video.grade)));

  // Get current videos
  const indexOfLastVideo = currentPage * videosPerPage;
  const indexOfFirstVideo = indexOfLastVideo - videosPerPage;
  const currentVideos = filteredVideos.slice(
    indexOfFirstVideo,
    indexOfLastVideo
  );

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h2 className="text-2xl font-bold text-kelasin-purple mb-4 md:mb-0">
          {title}
        </h2>

        {showFilters && (
          <div className="flex flex-wrap gap-4">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-kelasin-yellow"
              aria-label="Filter by subject"
              title="Filter by subject"
            >
              <option value="all">Semua Mata Pelajaran</option>
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>

            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-kelasin-yellow"
              aria-label="Filter by grade"
              title="Filter by grade"
            >
              <option value="all">Semua Kelas</option>
              {grades.map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {currentVideos.length === 0 ? (
        <div className="py-10 text-center text-gray-500">
          {emptyStateMessage}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentVideos.map((video) => (
            <Link
              href={`/pages/kelas/${video.id}`}
              key={video.id}
              className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 hover:border-gray-200 transform hover:-translate-y-1"
            >
              <div className="relative aspect-video">
                <Image
                  src={video.thumbnail}
                  alt={video.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-kelasin-purple bg-opacity-10 text-kelasin-purple text-xs px-2 py-1 rounded-md">
                    {video.subject}
                  </span>
                  <span className="bg-kelasin-yellow bg-opacity-10 text-gray-700 text-xs px-2 py-1 rounded-md">
                    {video.grade}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                  {video.title}
                </h3>
                <div className="flex justify-between items-center text-gray-500 text-sm">
                  <span>{video.views} views</span>
                  <div className="flex items-center">
                    <svg
                      className="w-4 h-4 text-kelasin-yellow mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span>{video.rating}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showPagination && filteredVideos.length > videosPerPage && (
        <div className="flex justify-center mt-8">
          <nav className="inline-flex rounded-md shadow">
            {Array.from(
              { length: Math.ceil(filteredVideos.length / videosPerPage) },
              (_, i) => i + 1
            ).map((number) => (
              <button
                key={number}
                onClick={() => paginate(number)}
                className={`px-4 py-2 text-sm font-medium ${
                  currentPage === number
                    ? "bg-kelasin-purple text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                } border border-gray-300 ${
                  number === 1 ? "rounded-l-md" : ""
                } ${
                  number === Math.ceil(filteredVideos.length / videosPerPage)
                    ? "rounded-r-md"
                    : ""
                }`}
              >
                {number}
              </button>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}

// Tipe data untuk token dan langganan
