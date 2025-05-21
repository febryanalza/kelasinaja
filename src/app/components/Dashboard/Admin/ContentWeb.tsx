import React, { useState, useEffect } from "react";
import supabase from "@/lib/supabase";

interface Subject {
  id: string;
  title: string;
}

export default function ContentWeb() {
  const [addSubject, setAddSubject] = useState({
    subject: "",
  });
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch existing subjects
  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("subject")
        .select("*");

      if (error) {
        throw error;
      }

      if (data) {
        setSubjects(data);
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
      setError("Gagal mengambil data subject");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddSubject(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubjectSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!addSubject.subject.trim()) {
      setError("Nama subject tidak boleh kosong");
      return;
    }
    
    try {
      setLoading(true);
      setError("");
      setSuccess("");
      
      const { error } = await supabase
        .from("subject")
        .insert({title: addSubject.subject});

      if (error) {
        throw error;
      }
      
      // Reset form and show success message
      setAddSubject({ subject: "" });
      setSuccess("Subject berhasil ditambahkan");
      
      // Refresh subject list
      fetchSubjects();
      
    } catch (error) {
      console.error("Error adding subject:", error);
      setError("Gagal menambahkan subject");
    } finally {
      setLoading(false);
    }
  };

  // Format tanggal
  

  return (
    <div className="bg-white/5 rounded-xl p-6">
      <h2 className="text-xl font-bold text-white mb-6">Manajemen Konten Web</h2>

      {/* Form tambah subject */}
      <div className="bg-white/10 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Tambah Subject Baru</h3>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-3 mb-4">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-500/10 border border-green-500 text-green-500 rounded-lg p-3 mb-4">
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubjectSubmit}>
          <div className="mb-4">
            <label htmlFor="subject" className="block text-white/60 text-sm mb-1">
              Nama Subject
            </label>
            <input
              type="text"
              name="subject"
              id="subject"
              placeholder="Contoh: Matematika, Fisika, dll"
              value={addSubject.subject}
              onChange={handleChange}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : "Tambah Subject"}
          </button>
        </form>
      </div>

      {/* Daftar Subject */}
      <div className="bg-white/10 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Daftar Subject</h3>
        
        {loading && subjects.length === 0 ? (
          <div className="flex justify-center items-center py-8">
            <p className="text-white/60">Memuat data subject...</p>
          </div>
        ) : subjects.length === 0 ? (
          <div className="flex justify-center items-center py-8">
            <p className="text-white/60">Belum ada subject yang ditambahkan</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-white/10 text-white/80">
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">Nama Subject</th>
                  <th className="px-4 py-3 text-center">Tanggal Dibuat</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((subject) => (
                  <tr key={subject.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-4 py-3 text-white/60">{subject.id}</td>
                    <td className="px-4 py-3 text-white">{subject.title}</td>
                    <td className="px-4 py-3 text-center text-white/60">
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}