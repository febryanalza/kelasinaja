"use client";

import { useState, useRef, FormEvent } from "react";
import supabase from "@/lib/supabase";
import { useRouter } from "next/navigation";

// Definisi interface untuk Chapter
interface Chapter {
  id: string;
  title: string;
  duration: string;
}

export default function UploadVideo() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState("");
  const [price, setPrice] = useState(0);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  // Field baru sesuai dengan data yang diberikan
  const [instructor, setInstructor] = useState("");
  const [duration, setDuration] = useState("");
  const [rating, setRating] = useState(0);
  const [views, setViews] = useState(0);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [chapterTitle, setChapterTitle] = useState("");
  const [chapterDuration, setChapterDuration] = useState("");

  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVideoFile(e.target.files[0]);
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setThumbnailFile(e.target.files[0]);
    }
  };

  const addChapter = () => {
    if (chapterTitle && chapterDuration) {
      const newChapter: Chapter = {
        id: `${Date.now()}`,
        title: chapterTitle,
        duration: chapterDuration,
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
    setVideoFile(null);
    setThumbnailFile(null);
    setInstructor("");
    setDuration("");
    setRating(0);
    setViews(0);
    setChapters([]);
    if (videoInputRef.current) videoInputRef.current.value = "";
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = "";
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    // Validasi form
    if (
      !title ||
      !subject ||
      !grade ||
      !videoFile ||
      !instructor ||
      !duration
    ) {
      setErrorMessage(
        "Judul, mata pelajaran, kelas, file video, instruktur, dan durasi harus diisi"
      );
      return;
    }

    try {
      setIsUploading(true);

      // Dapatkan user saat ini
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Anda harus login terlebih dahulu");

      // Periksa apakah user adalah guru
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      if (userError || !userData || userData.role !== "teacher") {
        throw new Error("Hanya guru yang dapat mengunggah video");
      }

      // Upload video ke storage
      const videoFileName = `${user.id}/${Date.now()}-${videoFile.name}`;
      const { error: videoUploadError } = await supabase.storage
        .from("videos")
        .upload(videoFileName, videoFile, {
          cacheControl: "3600",
          upsert: false,
          onUploadProgress: (progress) => {
            setUploadProgress(
              Math.round((progress.loaded / progress.total) * 100)
            );
          },
        });

      if (videoUploadError) throw videoUploadError;

      // Dapatkan URL publik untuk video
      const { data: videoUrl } = supabase.storage
        .from("videos")
        .getPublicUrl(videoFileName);

      let thumbnailUrl = null;

      // Upload thumbnail jika ada
      if (thumbnailFile) {
        const thumbnailFileName = `${user.id}/${Date.now()}-${
          thumbnailFile.name
        }`;
        const { error: thumbnailUploadError } = await supabase.storage
          .from("thumbnails")
          .upload(thumbnailFileName, thumbnailFile, {
            cacheControl: "3600",
            upsert: false,
          });

        if (thumbnailUploadError) throw thumbnailUploadError;

        // Dapatkan URL publik untuk thumbnail
        const { data: thumbUrl } = supabase.storage
          .from("thumbnails")
          .getPublicUrl(thumbnailFileName);

        thumbnailUrl = thumbUrl.publicUrl;
      }

      // Simpan metadata video ke database
      const { error: insertError } = await supabase.from("videos").insert({
        title,
        description,
        subject,
        grade,
        thumbnail: thumbnailUrl,
        video_url: videoUrl.publicUrl,
        price: price,
        teacher_id: user.id,
        instructor: instructor,
        duration: duration,
        rating: rating,
        views: views.toString(),
        chapters: chapters,
      });

      if (insertError) throw insertError;

      setSuccessMessage("Video berhasil diunggah!");
      resetForm();
      setTimeout(() => {
        router.refresh();
      }, 2000);
    } catch (error: any) {
      console.error("Error uploading video:", error);
      setErrorMessage(
        error.message || "Terjadi kesalahan saat mengunggah video"
      );
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

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
              <input
                type="text"
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Contoh: Matematika, Fisika, Biologi"
                required
              />
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
                htmlFor="video"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                File Video <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="video-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                    >
                      <span>Upload video</span>
                      <input
                        id="video-upload"
                        name="video-upload"
                        type="file"
                        className="sr-only"
                        accept="video/*"
                        onChange={handleVideoChange}
                        ref={videoInputRef}
                        required
                      />
                    </label>
                    <p className="pl-1">atau drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    MP4, WebM, atau Ogg hingga 2GB
                  </p>
                  {videoFile && (
                    <p className="text-sm text-green-600 mt-2">
                      File dipilih: {videoFile.name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="thumbnail"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Thumbnail Video
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="thumbnail-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                    >
                      <span>Upload thumbnail</span>
                      <input
                        id="thumbnail-upload"
                        name="thumbnail-upload"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleThumbnailChange}
                        ref={thumbnailInputRef}
                      />
                    </label>
                    <p className="pl-1">atau drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF hingga 5MB
                  </p>
                  {thumbnailFile && (
                    <p className="text-sm text-green-600 mt-2">
                      File dipilih: {thumbnailFile.name}
                    </p>
                  )}
                </div>
              </div>
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

        {isUploading && (
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            ></div>
            <p className="text-sm text-gray-600 mt-1 text-center">
              Mengunggah... {uploadProgress}%
            </p>
          </div>
        )}

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
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isUploading}
          >
            {isUploading ? "Mengunggah..." : "Unggah Video"}
          </button>
        </div>
      </form>
    </div>
  );
}
