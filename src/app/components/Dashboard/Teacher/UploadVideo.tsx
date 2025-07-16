"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

// Definisi interface untuk Chapter
interface Chapter {
  id: string;
  title: string;
  duration: string;
}

interface Subject {
  id: string;
  title: string;
}

export default function UploadVideo() {
  const router = useRouter();
  const { user, token } = useAuth();
  
  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState("");
  const [price, setPrice] = useState(0);
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [instructor, setInstructor] = useState("");
  const [duration, setDuration] = useState("");
  const [rating, setRating] = useState(0);
  const [views, setViews] = useState(0);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [chapterTitle, setChapterTitle] = useState("");
  const [chapterDuration, setChapterDuration] = useState("");

  // UI states
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [showNewSubjectForm, setShowNewSubjectForm] = useState(false);
  const [newSubjectTitle, setNewSubjectTitle] = useState("");

  // Load subjects on component mount
  useEffect(() => {
    if (user && token) {
      fetchSubjects();
      // Set instructor name from user data
      if (user.full_name) {
        setInstructor(user.full_name);
      }
    }
  }, [user, token]);

  const fetchSubjects = async () => {
    if (!token) return;

    try {
      setLoadingSubjects(true);
      const response = await fetch('/api/teacher/subjects', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSubjects(data.subjects);
        }
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    } finally {
      setLoadingSubjects(false);
    }
  };

  const createNewSubject = async () => {
    if (!token || !newSubjectTitle.trim()) return;

    try {
      const response = await fetch('/api/teacher/subjects', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newSubjectTitle.trim() })
      });

      const data = await response.json();
      
      if (data.success) {
        setSubjects(prev => [...prev, data.subject]);
        setSubject(data.subject.id);
        setNewSubjectTitle("");
        setShowNewSubjectForm(false);
      } else {
        setErrorMessage(data.error || 'Gagal menambahkan mata pelajaran');
      }
    } catch (error) {
      console.error('Error creating subject:', error);
      setErrorMessage('Terjadi kesalahan saat menambahkan mata pelajaran');
    }
  };

  const addChapter = () => {
    if (chapterTitle.trim() && chapterDuration.trim()) {
      const newChapter: Chapter = {
        id: `${Date.now()}`,
        title: chapterTitle.trim(),
        duration: chapterDuration.trim(),
      };
      setChapters([...chapters, newChapter]);
      setChapterTitle("");
      setChapterDuration("");
    }
  };

  const removeChapter = (id: string) => {
    setChapters(chapters.filter((chapter) => chapter.id !== id));
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setSubject("");
    setGrade("");
    setPrice(0);
    setVideoUrl("");
    setThumbnailUrl("");
    setInstructor(user?.full_name || "");
    setDuration("");
    setRating(0);
    setViews(0);
    setChapters([]);
    setChapterTitle("");
    setChapterDuration("");
  };

  const validateForm = () => {
    if (!title.trim()) {
      setErrorMessage("Judul video harus diisi");
      return false;
    }

    if (!subject) {
      setErrorMessage("Mata pelajaran harus dipilih");
      return false;
    }

    if (!grade) {
      setErrorMessage("Kelas harus dipilih");
      return false;
    }

    if (!videoUrl.trim()) {
      setErrorMessage("URL video harus diisi");
      return false;
    }

    // Validate video URL
    try {
      new URL(videoUrl);
    } catch {
      setErrorMessage("URL video tidak valid");
      return false;
    }

    // Validate thumbnail URL if provided
    if (thumbnailUrl.trim()) {
      try {
        new URL(thumbnailUrl);
      } catch {
        setErrorMessage("URL thumbnail tidak valid");
        return false;
      }
    }

    if (!instructor.trim()) {
      setErrorMessage("Nama instruktur harus diisi");
      return false;
    }

    if (!duration.trim()) {
      setErrorMessage("Durasi harus diisi");
      return false;
    }

    if (price < 0) {
      setErrorMessage("Harga tidak boleh negatif");
      return false;
    }

    if (rating < 0 || rating > 5) {
      setErrorMessage("Rating harus antara 0-5");
      return false;
    }

    if (views < 0) {
      setErrorMessage("Jumlah views tidak boleh negatif");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!validateForm()) {
      return;
    }

    if (!user || !token) {
      setErrorMessage("Anda harus login terlebih dahulu");
      return;
    }

    try {
      setIsUploading(true);

      const videoData = {
        title: title.trim(),
        description: description.trim() || null,
        subject,
        grade,
        price,
        video_url: videoUrl.trim(),
        thumbnail_url: thumbnailUrl.trim() || null,
        instructor: instructor.trim(),
        duration: duration.trim(),
        rating,
        views,
        chapters: chapters.length > 0 ? chapters : []
      };

      const response = await fetch('/api/teacher/videos/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(videoData)
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage(data.message || "Video berhasil diunggah!");
        resetForm();
        
        // Refresh after 2 seconds
        setTimeout(() => {
          router.refresh();
        }, 2000);
      } else {
        throw new Error(data.error || 'Gagal mengunggah video');
      }

    } catch (error: any) {
      console.error("Error uploading video:", error);
      setErrorMessage(error.message || "Terjadi kesalahan saat mengunggah video");
    } finally {
      setIsUploading(false);
    }
  };

  // Auto-clear messages
  useEffect(() => {
    if (errorMessage || successMessage) {
      const timer = setTimeout(() => {
        setErrorMessage("");
        setSuccessMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage, successMessage]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Unggah Video Pembelajaran
      </h1>

      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Judul Video <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Masukkan judul video"
                required
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Deskripsi
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Masukkan deskripsi video"
              />
            </div>

            <div>
              <label
                htmlFor="subject"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Mata Pelajaran <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <select
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={loadingSubjects}
                >
                  <option value="">
                    {loadingSubjects ? "Memuat..." : "Pilih Mata Pelajaran"}
                  </option>
                  {subjects.map((subj) => (
                    <option key={subj.id} value={subj.id}>
                      {subj.title}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowNewSubjectForm(!showNewSubjectForm)}
                  className="px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  +
                </button>
              </div>
              
              {showNewSubjectForm && (
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={newSubjectTitle}
                    onChange={(e) => setNewSubjectTitle(e.target.value)}
                    placeholder="Nama mata pelajaran baru"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={createNewSubject}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Tambah
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewSubjectForm(false);
                      setNewSubjectTitle("");
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Batal
                  </button>
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="grade"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Kelas <span className="text-red-500">*</span>
              </label>
              <select
                id="grade"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Pilih Kelas</option>
                <option value="SD 1">SD Kelas 1</option>
                <option value="SD 2">SD Kelas 2</option>
                <option value="SD 3">SD Kelas 3</option>
                <option value="SD 4">SD Kelas 4</option>
                <option value="SD 5">SD Kelas 5</option>
                <option value="SD 6">SD Kelas 6</option>
                <option value="SMP 7">SMP Kelas 7</option>
                <option value="SMP 8">SMP Kelas 8</option>
                <option value="SMP 9">SMP Kelas 9</option>
                <option value="SMA 10">SMA Kelas 10</option>
                <option value="SMA 11">SMA Kelas 11</option>
                <option value="SMA 12">SMA Kelas 12</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="instructor"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Instruktur <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="instructor"
                value={instructor}
                onChange={(e) => setInstructor(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nama instruktur"
                required
              />
            </div>

            <div>
              <label
                htmlFor="duration"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Durasi Total <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Contoh: 4 jam 30 menit"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="rating"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Rating
                </label>
                <input
                  type="number"
                  id="rating"
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  min="0"
                  max="5"
                  step="0.1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0-5"
                />
              </div>

              <div>
                <label
                  htmlFor="views"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Jumlah Views
                </label>
                <input
                  type="number"
                  id="views"
                  value={views}
                  onChange={(e) => setViews(Number(e.target.value))}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Jumlah views"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="price"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Harga (Rp)
              </label>
              <input
                type="number"
                id="price"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                min="0"
                step="1000"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0 untuk video gratis"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label
                htmlFor="video-url"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                URL Video <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                id="video-url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/video.mp4"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Masukkan URL video yang dapat diakses publik (YouTube, Vimeo, atau link hosting video lainnya)
              </p>
            </div>

            <div>
              <label
                htmlFor="thumbnail-url"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                URL Thumbnail
              </label>
              <input
                type="url"
                id="thumbnail-url"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/thumbnail.jpg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Masukkan URL gambar thumbnail (opsional)
              </p>
              
              {thumbnailUrl && (
                <div className="mt-2">
                  <p className="text-sm text-green-600 mb-2">Preview thumbnail:</p>
                  <img
                    src={thumbnailUrl}
                    alt="Thumbnail preview"
                    className="w-32 h-20 object-cover rounded border"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chapters
              </label>
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={chapterTitle}
                    onChange={(e) => setChapterTitle(e.target.value)}
                    placeholder="Judul chapter"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={chapterDuration}
                    onChange={(e) => setChapterDuration(e.target.value)}
                    placeholder="Durasi (mis: 45 menit)"
                    className="w-1/3 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={addChapter}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Tambah
                  </button>
                </div>

                {chapters.length > 0 && (
                  <div className="mt-4 border rounded-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            No
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Judul
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Durasi
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {chapters.map((chapter, index) => (
                          <tr key={chapter.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {index + 1}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {chapter.title}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {chapter.duration}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                type="button"
                                onClick={() => removeChapter(chapter.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Hapus
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={resetForm}
            className="mr-4 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isUploading}
          >
            Reset
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isUploading}
          >
            {isUploading ? "Mengunggah..." : "Unggah Video"}
          </button>
        </div>
      </form>
    </div>
  );
}
