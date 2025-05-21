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
  emptyMessage?: string;
  showFilters?: boolean;
}

export default function RenderVideo({
  videos = [],
  title = "Video Pembelajaran",
  emptyMessage = "Belum ada video",
  showFilters = false,
}: RenderVideoProps) {
  const [filteredVideos, setFilteredVideos] = useState<VideoClass[]>(videos);
  const [subjectFilter, setSubjectFilter] = useState<string>("");
  const [gradeFilter, setGradeFilter] = useState<string>("");
  
  // Mendapatkan daftar unik mata pelajaran dan kelas dari video
  const subjects = [...new Set(videos.map((video) => video.subject))];
  const grades = [...new Set(videos.map((video) => video.grade))];
  
  useEffect(() => {
    // Filter video berdasarkan mata pelajaran dan kelas
    let result = [...videos];
    
    if (subjectFilter) {
      result = result.filter((video) => video.subject === subjectFilter);
    }
    
    if (gradeFilter) {
      result = result.filter((video) => video.grade === gradeFilter);
    }
    
    setFilteredVideos(result);
  }, [videos, subjectFilter, gradeFilter]);
  
  const handleResetFilters = () => {
    setSubjectFilter("");
    setGradeFilter("");
  };

  return (
    <div className="w-full">
      {title && (
        <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>
      )}
      
      {showFilters && videos.length > 0 && (
        <div className="mb-6 bg-white/5 p-4 rounded-lg">
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label htmlFor="subject-filter" className="block text-sm text-white/70 mb-1">
                Mata Pelajaran
              </label>
              <select
                id="subject-filter"
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="bg-white/10 text-white border border-white/20 rounded-md px-3 py-2 text-sm"
              >
                <option value="">Semua</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="grade-filter" className="block text-sm text-white/70 mb-1">
                Kelas
              </label>
              <select
                id="grade-filter"
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className="bg-white/10 text-white border border-white/20 rounded-md px-3 py-2 text-sm"
              >
                <option value="">Semua</option>
                {grades.map((grade) => (
                  <option key={grade} value={grade}>
                    {grade}
                  </option>
                ))}
              </select>
            </div>
            
            {(subjectFilter || gradeFilter) && (
              <button
                onClick={handleResetFilters}
                className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-md text-sm mt-5"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>
      )}
      
      {filteredVideos.length === 0 ? (
        <div className="flex justify-center items-center py-12 bg-white/5 rounded-lg">
          <p className="text-white/60 text-lg">{emptyMessage}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => (
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
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-white/20 text-white/90 text-xs px-2 py-1 rounded">
                    {video.subject}
                  </span>
                  <span className="bg-white/20 text-white/90 text-xs px-2 py-1 rounded">
                    {video.grade}
                  </span>
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">
                  {video.title}
                </h3>
                <div className="flex justify-between items-center text-white/60 text-sm">
                  <span>{video.views} views</span>
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
      )}
    </div>
  );
}

// Tipe data untuk token dan langganan


