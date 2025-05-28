"use client";

import React, { useState, useEffect } from "react";
import supabase from "@/lib/supabase";
import Image from "next/image";
import { FiHelpCircle, FiMessageSquare, FiBook, FiAlertCircle, FiPhone, FiEdit, FiTrash2, FiPlus } from "react-icons/fi";

// Interface untuk tiket bantuan
interface SupportTicket {
  id: number;
  user_id: string;
  user_name: string;
  user_email: string;
  subject: string;
  message: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  created_at: string;
  updated_at: string;
  user_avatar?: string;
}

// Interface untuk FAQ
interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
  is_published: boolean;
  order: number;
}

// Interface untuk panduan pengguna
interface UserGuide {
  id: number;
  title: string;
  content: string;
  category: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

// Interface untuk pengumuman sistem
interface SystemAnnouncement {
  id: number;
  title: string;
  content: string;
  type: "info" | "warning" | "maintenance" | "update";
  start_date: string;
  end_date: string;
  is_active: boolean;
}

// Interface untuk kontak support
interface SupportContact {
  id: number;
  name: string;
  email: string;
  phone: string;
  department: string;
  is_active: boolean;
}

// Interface untuk StatCard
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  bgColor: string;
}

// Komponen untuk card statistik
const StatCard = ({ title, value, icon, bgColor }: StatCardProps) => (
  <div className={`${bgColor} rounded-xl p-6 flex items-center justify-between`}>
    <div>
      <p className="text-white/60 text-sm">{title}</p>
      <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
    </div>
    <div className="bg-white/10 p-3 rounded-lg">
      {icon}
    </div>
  </div>
);

// Komponen untuk item tiket bantuan
const TicketItem = ({ ticket, onViewDetails }: { ticket: SupportTicket, onViewDetails: (ticket: SupportTicket) => void }) => (
  <div className="bg-white/5 rounded-lg p-4 mb-4">
    <div className="flex justify-between items-start mb-2">
      <div className="flex items-center gap-3">
        <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
          <Image
            src={ticket.user_avatar || "/images/profile.png"}
            alt={ticket.user_name}
            fill
            className="object-cover"
          />
        </div>
        <div>
          <h4 className="font-semibold text-white">{ticket.subject}</h4>
          <p className="text-white/60 text-sm">{ticket.user_name} • {ticket.created_at}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(ticket.status)}`}>
          {getStatusText(ticket.status)}
        </span>
        <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(ticket.priority)}`}>
          {getPriorityText(ticket.priority)}
        </span>
      </div>
    </div>
    <p className="text-white/80 text-sm mb-3 line-clamp-2">{ticket.message}</p>
    <div className="flex justify-end">
      <button 
        onClick={() => onViewDetails(ticket)}
        className="text-blue-400 text-sm hover:text-blue-300 transition"
      >
        Lihat Detail
      </button>
    </div>
  </div>
);

// Komponen untuk item FAQ
const FAQItem = ({ faq, onEdit, onDelete }: { faq: FAQ, onEdit: (faq: FAQ) => void, onDelete: (faq: FAQ) => void }) => (
  <div className="bg-white/5 rounded-lg p-4 mb-4">
    <div className="flex justify-between items-start mb-2">
      <div>
        <h4 className="font-semibold text-white">{faq.question}</h4>
        <p className="text-white/60 text-sm">Kategori: {faq.category}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className={`px-2 py-1 rounded text-xs ${faq.is_published ? "bg-green-500/20 text-green-300" : "bg-yellow-500/20 text-yellow-300"}`}>
          {faq.is_published ? "Dipublikasikan" : "Draft"}
        </span>
        <button 
          onClick={() => onEdit(faq)}
          className="text-blue-400 hover:text-blue-300 transition"
        >
          <FiEdit className="w-5 h-5" />
        </button>
        <button 
          onClick={() => onDelete(faq)}
          className="text-red-400 hover:text-red-300 transition"
        >
          <FiTrash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
    <p className="text-white/80 text-sm mb-3">{faq.answer}</p>
  </div>
);

// Komponen untuk item panduan pengguna
const GuideItem = ({ guide, onEdit, onDelete }: { guide: UserGuide, onEdit: (guide: UserGuide) => void, onDelete: (guide: UserGuide) => void }) => (
  <div className="bg-white/5 rounded-lg p-4 mb-4">
    <div className="flex justify-between items-start mb-2">
      <div>
        <h4 className="font-semibold text-white">{guide.title}</h4>
        <p className="text-white/60 text-sm">Kategori: {guide.category} • {guide.updated_at}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className={`px-2 py-1 rounded text-xs ${guide.is_published ? "bg-green-500/20 text-green-300" : "bg-yellow-500/20 text-yellow-300"}`}>
          {guide.is_published ? "Dipublikasikan" : "Draft"}
        </span>
        <button 
          onClick={() => onEdit(guide)}
          className="text-blue-400 hover:text-blue-300 transition"
        >
          <FiEdit className="w-5 h-5" />
        </button>
        <button 
          onClick={() => onDelete(guide)}
          className="text-red-400 hover:text-red-300 transition"
        >
          <FiTrash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
    <p className="text-white/80 text-sm mb-3 line-clamp-3">{guide.content}</p>
  </div>
);

// Komponen untuk item pengumuman sistem
const AnnouncementItem = ({ announcement, onEdit, onDelete }: { announcement: SystemAnnouncement, onEdit: (announcement: SystemAnnouncement) => void, onDelete: (announcement: SystemAnnouncement) => void }) => (
  <div className="bg-white/5 rounded-lg p-4 mb-4">
    <div className="flex justify-between items-start mb-2">
      <div>
        <h4 className="font-semibold text-white">{announcement.title}</h4>
        <p className="text-white/60 text-sm">{announcement.start_date} - {announcement.end_date}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className={`px-2 py-1 rounded text-xs ${getAnnouncementTypeColor(announcement.type)}`}>
          {getAnnouncementTypeText(announcement.type)}
        </span>
        <span className={`px-2 py-1 rounded text-xs ${announcement.is_active ? "bg-green-500/20 text-green-300" : "bg-gray-500/20 text-gray-300"}`}>
          {announcement.is_active ? "Aktif" : "Tidak Aktif"}
        </span>
        <button 
          onClick={() => onEdit(announcement)}
          className="text-blue-400 hover:text-blue-300 transition"
        >
          <FiEdit className="w-5 h-5" />
        </button>
        <button 
          onClick={() => onDelete(announcement)}
          className="text-red-400 hover:text-red-300 transition"
        >
          <FiTrash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
    <p className="text-white/80 text-sm mb-3">{announcement.content}</p>
  </div>
);

// Komponen untuk item kontak support
const ContactItem = ({ contact, onEdit, onDelete }: { contact: SupportContact, onEdit: (contact: SupportContact) => void, onDelete: (contact: SupportContact) => void }) => (
  <div className="bg-white/5 rounded-lg p-4 mb-4">
    <div className="flex justify-between items-start mb-2">
      <div>
        <h4 className="font-semibold text-white">{contact.name}</h4>
        <p className="text-white/60 text-sm">Departemen: {contact.department}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className={`px-2 py-1 rounded text-xs ${contact.is_active ? "bg-green-500/20 text-green-300" : "bg-gray-500/20 text-gray-300"}`}>
          {contact.is_active ? "Aktif" : "Tidak Aktif"}
        </span>
        <button 
          onClick={() => onEdit(contact)}
          className="text-blue-400 hover:text-blue-300 transition"
        >
          <FiEdit className="w-5 h-5" />
        </button>
        <button 
          onClick={() => onDelete(contact)}
          className="text-red-400 hover:text-red-300 transition"
        >
          <FiTrash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-white/80 text-sm">
      <p>Email: {contact.email}</p>
      <p>Telepon: {contact.phone}</p>
    </div>
  </div>
);

// Fungsi helper untuk warna status tiket
const getStatusColor = (status: SupportTicket["status"]) => {
  switch (status) {
    case "open":
      return "bg-blue-500/20 text-blue-300";
    case "in_progress":
      return "bg-yellow-500/20 text-yellow-300";
    case "resolved":
      return "bg-green-500/20 text-green-300";
    case "closed":
      return "bg-gray-500/20 text-gray-300";
    default:
      return "bg-gray-500/20 text-gray-300";
  }
};

// Fungsi helper untuk teks status tiket
const getStatusText = (status: SupportTicket["status"]) => {
  switch (status) {
    case "open":
      return "Baru";
    case "in_progress":
      return "Diproses";
    case "resolved":
      return "Selesai";
    case "closed":
      return "Ditutup";
    default:
      return "";
  }
};

// Fungsi helper untuk warna prioritas tiket
const getPriorityColor = (priority: SupportTicket["priority"]) => {
  switch (priority) {
    case "low":
      return "bg-green-500/20 text-green-300";
    case "medium":
      return "bg-blue-500/20 text-blue-300";
    case "high":
      return "bg-yellow-500/20 text-yellow-300";
    case "urgent":
      return "bg-red-500/20 text-red-300";
    default:
      return "bg-gray-500/20 text-gray-300";
  }
};

// Fungsi helper untuk teks prioritas tiket
const getPriorityText = (priority: SupportTicket["priority"]) => {
  switch (priority) {
    case "low":
      return "Rendah";
    case "medium":
      return "Sedang";
    case "high":
      return "Tinggi";
    case "urgent":
      return "Urgent";
    default:
      return "";
  }
};

// Fungsi helper untuk warna tipe pengumuman
const getAnnouncementTypeColor = (type: SystemAnnouncement["type"]) => {
  switch (type) {
    case "info":
      return "bg-blue-500/20 text-blue-300";
    case "warning":
      return "bg-yellow-500/20 text-yellow-300";
    case "maintenance":
      return "bg-orange-500/20 text-orange-300";
    case "update":
      return "bg-green-500/20 text-green-300";
    default:
      return "bg-gray-500/20 text-gray-300";
  }
};

// Fungsi helper untuk teks tipe pengumuman
const getAnnouncementTypeText = (type: SystemAnnouncement["type"]) => {
  switch (type) {
    case "info":
      return "Informasi";
    case "warning":
      return "Peringatan";
    case "maintenance":
      return "Pemeliharaan";
    case "update":
      return "Pembaruan";
    default:
      return "";
  }
};

export default function SupportHelp() {
  // State untuk tiket bantuan
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  
  // State untuk FAQ
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  
  // State untuk panduan pengguna
  const [guides, setGuides] = useState<UserGuide[]>([]);
  
  // State untuk pengumuman sistem
  const [announcements, setAnnouncements] = useState<SystemAnnouncement[]>([]);
  
  // State untuk kontak support
  const [contacts, setContacts] = useState<SupportContact[]>([]);
  
  // State untuk tab aktif
  const [activeTab, setActiveTab] = useState<string>("support_tickets");
  
  // State untuk loading
  const [loading, setLoading] = useState<boolean>(true);
  
  // State untuk modal tiket
  const [showTicketModal, setShowTicketModal] = useState<boolean>(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  
  // State untuk modal FAQ
  const [showFAQModal, setShowFAQModal] = useState<boolean>(false);
  const [selectedFAQ, setSelectedFAQ] = useState<FAQ | null>(null);
  
  // State untuk modal panduan
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);
  const [selectedGuide, setSelectedGuide] = useState<UserGuide | null>(null);
  
  // State untuk modal pengumuman
  const [showAnnouncementModal, setShowAnnouncementModal] = useState<boolean>(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<SystemAnnouncement | null>(null);
  
  // State untuk modal kontak
  const [showContactModal, setShowContactModal] = useState<boolean>(false);
  const [selectedContact, setSelectedContact] = useState<SupportContact | null>(null);
  
  useEffect(() => {
    // Fungsi untuk mengambil data tiket bantuan
    const fetchTickets = async () => {
      try {
        // Dalam implementasi nyata, ini akan mengambil data dari tabel support_tickets
        // Contoh data dummy untuk demonstrasi
        setTickets([
          {
            id: 1,
            user_id: "1",
            user_name: "Ahmad Rizki",
            user_email: "ahmad@example.com",
            subject: "Tidak bisa mengakses video pembelajaran",
            message: "Saya tidak bisa mengakses video pembelajaran di kelas Matematika Dasar. Setiap kali saya klik play, video tidak berjalan.",
            status: "open",
            priority: "high",
            created_at: "2 jam yang lalu",
            updated_at: "2 jam yang lalu",
            user_avatar: "/images/profile.png"
          },
          {
            id: 2,
            user_id: "2",
            user_name: "Siti Nurhaliza",
            user_email: "siti@example.com",
            subject: "Masalah dengan pembayaran token",
            message: "Saya sudah melakukan pembayaran untuk token, tapi saldo token saya belum bertambah. Mohon bantuan.",
            status: "in_progress",
            priority: "urgent",
            created_at: "5 jam yang lalu",
            updated_at: "1 jam yang lalu",
            user_avatar: "/images/profile.png"
          },
          {
            id: 3,
            user_id: "3",
            user_name: "Budi Santoso",
            user_email: "budi@example.com",
            subject: "Pertanyaan tentang langganan premium",
            message: "Saya ingin tahu apa saja keuntungan dari langganan premium dibandingkan dengan akun biasa?",
            status: "resolved",
            priority: "medium",
            created_at: "1 hari yang lalu",
            updated_at: "3 jam yang lalu",
            user_avatar: "/images/profile.png"
          },
          {
            id: 4,
            user_id: "4",
            user_name: "Dewi Lestari",
            user_email: "dewi@example.com",
            subject: "Sertifikat kelas tidak muncul",
            message: "Saya sudah menyelesaikan kelas Fisika Dasar, tapi sertifikat belum muncul di profil saya.",
            status: "open",
            priority: "medium",
            created_at: "2 hari yang lalu",
            updated_at: "2 hari yang lalu",
            user_avatar: "/images/profile.png"
          }
        ]);
      } catch (error) {
        console.error("Error fetching tickets:", error);
      }
    };
    
    // Fungsi untuk mengambil data FAQ
    const fetchFAQs = async () => {
      try {
        // Dalam implementasi nyata, ini akan mengambil data dari tabel faqs
        // Contoh data dummy untuk demonstrasi
        setFaqs([
          {
            id: 1,
            question: "Bagaimana cara membeli token?",
            answer: "Anda dapat membeli token melalui halaman Token & Langganan di dashboard pengguna. Kami menerima pembayaran melalui transfer bank, e-wallet, dan kartu kredit.",
            category: "Pembayaran",
            is_published: true,
            order: 1
          },
          {
            id: 2,
            question: "Berapa lama token berlaku?",
            answer: "Token berlaku selama 1 tahun sejak tanggal pembelian. Anda dapat melihat masa berlaku token di halaman Token & Langganan.",
            category: "Pembayaran",
            is_published: true,
            order: 2
          },
          {
            id: 3,
            question: "Bagaimana cara mengunduh sertifikat?",
            answer: "Setelah menyelesaikan kelas, sertifikat akan otomatis tersedia di profil Anda. Klik tab 'Sertifikat' dan pilih sertifikat yang ingin diunduh.",
            category: "Kelas",
            is_published: true,
            order: 3
          },
          {
            id: 4,
            question: "Apakah saya bisa mengakses kelas setelah masa langganan berakhir?",
            answer: "Tidak, Anda perlu memperbarui langganan atau membeli token untuk mengakses kelas setelah masa langganan berakhir.",
            category: "Langganan",
            is_published: false,
            order: 4
          }
        ]);
      } catch (error) {
        console.error("Error fetching FAQs:", error);
      }
    };
    
    // Fungsi untuk mengambil data panduan pengguna
    const fetchGuides = async () => {
      try {
        // Dalam implementasi nyata, ini akan mengambil data dari tabel user_guides
        // Contoh data dummy untuk demonstrasi
        setGuides([
          {
            id: 1,
            title: "Cara Memulai Belajar di KelasinAja",
            content: "Panduan lengkap untuk memulai perjalanan belajar Anda di platform KelasinAja. Artikel ini akan membantu Anda memahami cara navigasi, memilih kelas, dan memaksimalkan pengalaman belajar.",
            category: "Pemula",
            is_published: true,
            created_at: "10 Juni 2023",
            updated_at: "15 Juni 2023"
          },
          {
            id: 2,
            title: "Panduan Menggunakan Fitur Diskusi",
            content: "Pelajari cara berinteraksi dengan pengajar dan sesama pelajar melalui fitur diskusi. Artikel ini mencakup cara membuat pertanyaan, menjawab, dan mengikuti diskusi yang sedang berlangsung.",
            category: "Fitur",
            is_published: true,
            created_at: "5 Mei 2023",
            updated_at: "20 Mei 2023"
          },
          {
            id: 3,
            title: "Tips Mengoptimalkan Pembelajaran Online",
            content: "Kumpulan tips dan trik untuk memaksimalkan pembelajaran online Anda. Artikel ini berisi strategi belajar efektif, manajemen waktu, dan cara menjaga motivasi selama belajar online.",
            category: "Tips & Trik",
            is_published: true,
            created_at: "1 April 2023",
            updated_at: "10 April 2023"
          },
          {
            id: 4,
            title: "Panduan Penggunaan Token",
            content: "Pelajari cara kerja sistem token di KelasinAja. Artikel ini menjelaskan cara membeli, menggunakan, dan mengelola token Anda untuk akses kelas premium.",
            category: "Pembayaran",
            is_published: false,
            created_at: "15 Maret 2023",
            updated_at: "20 Maret 2023"
          }
        ]);
      } catch (error) {
        console.error("Error fetching guides:", error);
      }
    };
    
    // Fungsi untuk mengambil data pengumuman sistem
    const fetchAnnouncements = async () => {
      try {
        // Dalam implementasi nyata, ini akan mengambil data dari tabel system_announcements
        // Contoh data dummy untuk demonstrasi
        setAnnouncements([
          {
            id: 1,
            title: "Pemeliharaan Server Terjadwal",
            content: "Kami akan melakukan pemeliharaan server pada tanggal 20 Juni 2023 pukul 01:00 - 03:00 WIB. Selama periode ini, platform mungkin tidak dapat diakses. Mohon maaf atas ketidaknyamanannya.",
            type: "maintenance",
            start_date: "20 Juni 2023, 01:00",
            end_date: "20 Juni 2023, 03:00",
            is_active: true
          },
          {
            id: 2,
            title: "Pembaruan Fitur Diskusi",
            content: "Kami telah memperbarui fitur diskusi dengan kemampuan mengunggah gambar dan file. Sekarang Anda dapat berbagi materi pembelajaran dengan lebih mudah.",
            type: "update",
            start_date: "15 Juni 2023",
            end_date: "22 Juni 2023",
            is_active: true
          },
          {
            id: 3,
            title: "Promo Spesial Hari Pendidikan",
            content: "Dapatkan diskon 30% untuk semua pembelian token selama periode 1-7 Mei 2023. Gunakan kode promo PENDIDIKAN30 saat checkout.",
            type: "info",
            start_date: "1 Mei 2023",
            end_date: "7 Mei 2023",
            is_active: false
          },
          {
            id: 4,
            title: "Peringatan Keamanan Akun",
            content: "Kami mendeteksi adanya upaya phishing yang mengatasnamakan KelasinAja. Pastikan Anda hanya mengakses platform melalui situs resmi dan tidak memberikan informasi login kepada pihak lain.",
            type: "warning",
            start_date: "10 April 2023",
            end_date: "17 April 2023",
            is_active: false
          }
        ]);
      } catch (error) {
        console.error("Error fetching announcements:", error);
      }
    };
    
    // Fungsi untuk mengambil data kontak support
    const fetchContacts = async () => {
      try {
        // Dalam implementasi nyata, ini akan mengambil data dari tabel support_contacts
        // Contoh data dummy untuk demonstrasi
        setContacts([
          {
            id: 1,
            name: "Tim Bantuan Teknis",
            email: "technical@kelasinaja.com",
            phone: "021-5551234",
            department: "Teknis",
            is_active: true
          },
          {
            id: 2,
            name: "Tim Layanan Pelanggan",
            email: "cs@kelasinaja.com",
            phone: "021-5555678",
            department: "Customer Service",
            is_active: true
          },
          {
            id: 3,
            name: "Tim Pembayaran",
            email: "payment@kelasinaja.com",
            phone: "021-5559876",
            department: "Keuangan",
            is_active: true
          },
          {
            id: 4,
            name: "Tim Konten Pembelajaran",
            email: "content@kelasinaja.com",
            phone: "021-5554321",
            department: "Konten",
            is_active: false
          }
        ]);
      } catch (error) {
        console.error("Error fetching contacts:", error);
      } finally {
        setLoading(false);
      }
    };
    
        // Memanggil semua fungsi fetch data
        fetchTickets();
        fetchFAQs();
        fetchGuides();
        fetchAnnouncements();
        fetchContacts();
      }, []);
      
      // Fungsi untuk menangani view detail tiket
      const handleViewTicket = (ticket: SupportTicket) => {
        setSelectedTicket(ticket);
        setShowTicketModal(true);
      };
      
      // Fungsi untuk menangani edit FAQ
      const handleEditFAQ = (faq: FAQ) => {
        setSelectedFAQ(faq);
        setShowFAQModal(true);
      };
      
      // Fungsi untuk menangani hapus FAQ
      const handleDeleteFAQ = (faq: FAQ) => {
        // Implementasi hapus FAQ
        console.log(`Deleting FAQ: ${faq.id}`);
        // Dalam implementasi nyata, ini akan menghapus FAQ dari database
        setFaqs(faqs.filter(f => f.id !== faq.id));
      };
      
      // Fungsi untuk menangani edit panduan
      const handleEditGuide = (guide: UserGuide) => {
        setSelectedGuide(guide);
        setShowGuideModal(true);
      };
      
      // Fungsi untuk menangani hapus panduan
      const handleDeleteGuide = (guide: UserGuide) => {
        // Implementasi hapus panduan
        console.log(`Deleting guide: ${guide.id}`);
        // Dalam implementasi nyata, ini akan menghapus panduan dari database
        setGuides(guides.filter(g => g.id !== guide.id));
      };
      
      // Fungsi untuk menangani edit pengumuman
      const handleEditAnnouncement = (announcement: SystemAnnouncement) => {
        setSelectedAnnouncement(announcement);
        setShowAnnouncementModal(true);
      };
      
      // Fungsi untuk menangani hapus pengumuman
      const handleDeleteAnnouncement = (announcement: SystemAnnouncement) => {
        // Implementasi hapus pengumuman
        console.log(`Deleting announcement: ${announcement.id}`);
        // Dalam implementasi nyata, ini akan menghapus pengumuman dari database
        setAnnouncements(announcements.filter(a => a.id !== announcement.id));
      };
      
      // Fungsi untuk menangani edit kontak
      const handleEditContact = (contact: SupportContact) => {
        setSelectedContact(contact);
        setShowContactModal(true);
      };
      
      // Fungsi untuk menangani hapus kontak
      const handleDeleteContact = (contact: SupportContact) => {
        // Implementasi hapus kontak
        console.log(`Deleting contact: ${contact.id}`);
        // Dalam implementasi nyata, ini akan menghapus kontak dari database
        setContacts(contacts.filter(c => c.id !== contact.id));
      };
      
      // Render tab konten berdasarkan tab aktif
      const renderTabContent = () => {
        switch (activeTab) {
          case "support_tickets":
            return (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white">Tiket Bantuan</h3>
                  <div className="flex gap-2">
                    <select className="bg-white/10 border border-white/20 rounded px-3 py-1 text-white text-sm">
                      <option value="all">Semua Status</option>
                      <option value="open">Baru</option>
                      <option value="in_progress">Diproses</option>
                      <option value="resolved">Selesai</option>
                      <option value="closed">Ditutup</option>
                    </select>
                    <select className="bg-white/10 border border-white/20 rounded px-3 py-1 text-white text-sm">
                      <option value="all">Semua Prioritas</option>
                      <option value="low">Rendah</option>
                      <option value="medium">Sedang</option>
                      <option value="high">Tinggi</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>
                
                {tickets.length === 0 ? (
                  <p className="text-white/60">Tidak ada tiket bantuan</p>
                ) : (
                  <div className="space-y-4">
                    {tickets.map((ticket) => (
                      <TicketItem 
                        key={ticket.id}
                        ticket={ticket}
                        onViewDetails={handleViewTicket}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
            
          case "faq_management":
            return (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white">Manajemen FAQ</h3>
                  <button 
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition flex items-center gap-1"
                    onClick={() => {
                      setSelectedFAQ(null);
                      setShowFAQModal(true);
                    }}
                  >
                    <FiPlus className="w-4 h-4" />
                    Tambah FAQ
                  </button>
                </div>
                
                <div className="mb-4">
                  <div className="flex gap-2 mb-2">
                    <select className="bg-white/10 border border-white/20 rounded px-3 py-1 text-white text-sm">
                      <option value="all">Semua Kategori</option>
                      <option value="Pembayaran">Pembayaran</option>
                      <option value="Kelas">Kelas</option>
                      <option value="Langganan">Langganan</option>
                      <option value="Akun">Akun</option>
                    </select>
                    <select className="bg-white/10 border border-white/20 rounded px-3 py-1 text-white text-sm">
                      <option value="all">Semua Status</option>
                      <option value="published">Dipublikasikan</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Cari FAQ..."
                    className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
                  />
                </div>
                
                {faqs.length === 0 ? (
                  <p className="text-white/60">Tidak ada FAQ</p>
                ) : (
                  <div className="space-y-4">
                    {faqs.map((faq) => (
                      <FAQItem 
                        key={faq.id}
                        faq={faq}
                        onEdit={handleEditFAQ}
                        onDelete={handleDeleteFAQ}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
            
          case "user_guides":
            return (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white">Panduan Pengguna</h3>
                  <button 
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition flex items-center gap-1"
                    onClick={() => {
                      setSelectedGuide(null);
                      setShowGuideModal(true);
                    }}
                  >
                    <FiPlus className="w-4 h-4" />
                    Tambah Panduan
                  </button>
                </div>
                
                <div className="mb-4">
                  <div className="flex gap-2 mb-2">
                    <select className="bg-white/10 border border-white/20 rounded px-3 py-1 text-white text-sm">
                      <option value="all">Semua Kategori</option>
                      <option value="Pemula">Pemula</option>
                      <option value="Fitur">Fitur</option>
                      <option value="Teknis">Teknis</option>
                      <option value="Pembayaran">Pembayaran</option>
                    </select>
                    <select className="bg-white/10 border border-white/20 rounded px-3 py-1 text-white text-sm">
                      <option value="all">Semua Status</option>
                      <option value="published">Dipublikasikan</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Cari panduan..."
                    className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
                  />
                </div>
                
                {guides.length === 0 ? (
                  <p className="text-white/60">Tidak ada panduan pengguna</p>
                ) : (
                  <div className="space-y-4">
                    {guides.map((guide) => (
                      <GuideItem 
                        key={guide.id}
                        guide={guide}
                        onEdit={handleEditGuide}
                        onDelete={handleDeleteGuide}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
            
          case "system_announcements":
            return (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white">Pengumuman Sistem</h3>
                  <button 
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition flex items-center gap-1"
                    onClick={() => {
                      setSelectedAnnouncement(null);
                      setShowAnnouncementModal(true);
                    }}
                  >
                    <FiPlus className="w-4 h-4" />
                    Tambah Pengumuman
                  </button>
                </div>
                
                <div className="mb-4">
                  <div className="flex gap-2 mb-2">
                    <select className="bg-white/10 border border-white/20 rounded px-3 py-1 text-white text-sm">
                      <option value="all">Semua Tipe</option>
                      <option value="info">Informasi</option>
                      <option value="warning">Peringatan</option>
                      <option value="maintenance">Pemeliharaan</option>
                      <option value="update">Pembaruan</option>
                    </select>
                    <select className="bg-white/10 border border-white/20 rounded px-3 py-1 text-white text-sm">
                      <option value="all">Semua Status</option>
                      <option value="active">Aktif</option>
                      <option value="inactive">Tidak Aktif</option>
                    </select>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Cari pengumuman..."
                    className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
                  />
                </div>
                
                {announcements.length === 0 ? (
                  <p className="text-white/60">Tidak ada pengumuman sistem</p>
                ) : (
                  <div className="space-y-4">
                    {announcements.map((announcement) => (
                      <AnnouncementItem 
                        key={announcement.id}
                        announcement={announcement}
                        onEdit={handleEditAnnouncement}
                        onDelete={handleDeleteAnnouncement}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
            
          case "support_contacts":
            return (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white">Kontak Support</h3>
                  <button 
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition flex items-center gap-1"
                    onClick={() => {
                      setSelectedContact(null);
                      setShowContactModal(true);
                    }}
                  >
                    <FiPlus className="w-4 h-4" />
                    Tambah Kontak
                  </button>
                </div>
                
                <div className="mb-4">
                  <div className="flex gap-2 mb-2">
                    <select className="bg-white/10 border border-white/20 rounded px-3 py-1 text-white text-sm">
                      <option value="all">Semua Departemen</option>
                      <option value="Teknis">Teknis</option>
                      <option value="Pembayaran">Pembayaran</option>
                      <option value="Konten">Konten</option>
                      <option value="Umum">Umum</option>
                    </select>
                    <select className="bg-white/10 border border-white/20 rounded px-3 py-1 text-white text-sm">
                      <option value="all">Semua Status</option>
                      <option value="active">Aktif</option>
                      <option value="inactive">Tidak Aktif</option>
                    </select>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Cari kontak..."
                    className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
                  />
                </div>
                
                {contacts.length === 0 ? (
                  <p className="text-white/60">Tidak ada kontak support</p>
                ) : (
                  <div className="space-y-4">
                    {contacts.map((contact) => (
                      <ContactItem 
                        key={contact.id}
                        contact={contact}
                        onEdit={handleEditContact}
                        onDelete={handleDeleteContact}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
            
          default:
            return null;
        }
      };
      
      return (
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <StatCard
              title="Total Tiket"
              value={tickets.length}
              icon={<FiMessageSquare className="w-6 h-6 text-white" />}
              bgColor="bg-blue-500"
            />
            <StatCard
              title="Tiket Baru"
              value={tickets.filter(t => t.status === "open").length}
              icon={<FiMessageSquare className="w-6 h-6 text-white" />}
              bgColor="bg-green-500"
            />
            <StatCard
              title="Total FAQ"
              value={faqs.length}
              icon={<FiHelpCircle className="w-6 h-6 text-white" />}
              bgColor="bg-yellow-500"
            />
            <StatCard
              title="Total Panduan"
              value={guides.length}
              icon={<FiBook className="w-6 h-6 text-white" />}
              bgColor="bg-purple-500"
            />
            <StatCard
              title="Pengumuman Aktif"
              value={announcements.filter(a => a.is_active).length}
              icon={<FiAlertCircle className="w-6 h-6 text-white" />}
              bgColor="bg-red-500"
            />
          </div>
          
          <div className="bg-white/5 rounded-xl p-6">
            {/* Tab Navigation */}
            <div className="flex overflow-x-auto mb-6 pb-2">
              <button 
                className={`px-4 py-2 rounded-lg mr-2 ${activeTab === "support_tickets" ? "bg-blue-500 text-white" : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80"}`}
                onClick={() => setActiveTab("support_tickets")}
              >
                <div className="flex items-center">
                  <FiMessageSquare className="mr-2" />
                  Tiket Bantuan
                </div>
              </button>
              
              <button 
                className={`px-4 py-2 rounded-lg mr-2 ${activeTab === "faq_management" ? "bg-blue-500 text-white" : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80"}`}
                onClick={() => setActiveTab("faq_management")}
              >
                <div className="flex items-center">
                  <FiHelpCircle className="mr-2" />
                  Manajemen FAQ
                </div>
              </button>
              
              <button 
                className={`px-4 py-2 rounded-lg mr-2 ${activeTab === "user_guides" ? "bg-blue-500 text-white" : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80"}`}
                onClick={() => setActiveTab("user_guides")}
              >
                <div className="flex items-center">
                  <FiBook className="mr-2" />
                  Panduan Pengguna
                </div>
              </button>
              
              <button 
                className={`px-4 py-2 rounded-lg mr-2 ${activeTab === "system_announcements" ? "bg-blue-500 text-white" : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80"}`}
                onClick={() => setActiveTab("system_announcements")}
              >
                <div className="flex items-center">
                  <FiAlertCircle className="mr-2" />
                  Pengumuman Sistem
                </div>
              </button>
              
              <button 
                className={`px-4 py-2 rounded-lg ${activeTab === "support_contacts" ? "bg-blue-500 text-white" : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80"}`}
                onClick={() => setActiveTab("support_contacts")}
              >
                <div className="flex items-center">
                  <FiPhone className="mr-2" />
                  Kontak Support
                </div>
              </button>
            </div>
            
            {/* Tab Content */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <p className="text-white/60 text-lg">Memuat data...</p>
              </div>
            ) : (
              renderTabContent()
            )}
          </div>
          
          {/* Modal Detail Tiket */}
          {showTicketModal && selectedTicket && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-white">{selectedTicket.subject}</h3>
                  <button 
                    onClick={() => setShowTicketModal(false)}
                    className="text-white/60 hover:text-white transition"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src={selectedTicket.user_avatar || "/images/profile.png"}
                      alt={selectedTicket.user_name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-white font-medium">{selectedTicket.user_name}</p>
                    <p className="text-white/60 text-sm">{selectedTicket.user_email}</p>
                  </div>
                </div>
                
                <div className="flex gap-2 mb-4">
                  <div className="bg-white/5 rounded px-3 py-2 text-sm">
                    <p className="text-white/60">Status</p>
                    <select className="bg-transparent text-white">
                      <option value="open" selected={selectedTicket.status === "open"}>Baru</option>
                      <option value="in_progress" selected={selectedTicket.status === "in_progress"}>Diproses</option>
                      <option value="resolved" selected={selectedTicket.status === "resolved"}>Selesai</option>
                      <option value="closed" selected={selectedTicket.status === "closed"}>Ditutup</option>
                    </select>
                  </div>
                  <div className="bg-white/5 rounded px-3 py-2 text-sm">
                    <p className="text-white/60">Prioritas</p>
                    <select className="bg-transparent text-white">
                      <option value="low" selected={selectedTicket.priority === "low"}>Rendah</option>
                      <option value="medium" selected={selectedTicket.priority === "medium"}>Sedang</option>
                      <option value="high" selected={selectedTicket.priority === "high"}>Tinggi</option>
                      <option value="urgent" selected={selectedTicket.priority === "urgent"}>Urgent</option>
                    </select>
                  </div>
                  <div className="bg-white/5 rounded px-3 py-2 text-sm">
                    <p className="text-white/60">Dibuat</p>
                    <p className="text-white">{selectedTicket.created_at}</p>
                  </div>
                  <div className="bg-white/5 rounded px-3 py-2 text-sm">
                    <p className="text-white/60">Diperbarui</p>
                    <p className="text-white">{selectedTicket.updated_at}</p>
                  </div>
                </div>
                
                <div className="bg-white/5 rounded-lg p-4 mb-4">
                  <p className="text-white">{selectedTicket.message}</p>
                </div>
                
                <div className="mb-4">
                  <h4 className="text-white font-medium mb-2">Balasan</h4>
                  <textarea 
                    className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
                    rows={4}
                    placeholder="Tulis balasan..."
                  ></textarea>
                </div>
                
                <div className="flex justify-end gap-2">
                  <button 
                    className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded text-sm transition"
                    onClick={() => setShowTicketModal(false)}
                  >
                    Tutup
                  </button>
                  <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm transition">
                    Kirim Balasan
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Modal FAQ */}
          {showFAQModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    {selectedFAQ ? "Edit FAQ" : "Tambah FAQ Baru"}
                  </h3>
                  <button 
                    onClick={() => setShowFAQModal(false)}
                    className="text-white/60 hover:text-white transition"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-white/60 text-sm mb-1">Pertanyaan</label>
                    <input 
                      type="text" 
                      className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
                      defaultValue={selectedFAQ?.question || ""}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white/60 text-sm mb-1">Jawaban</label>
                    <textarea 
                      className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
                      rows={5}
                      defaultValue={selectedFAQ?.answer || ""}
                    ></textarea>
                  </div>
                  
                  <div>
                    <label className="block text-white/60 text-sm mb-1">Kategori</label>
                    <select className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white">
                      <option value="Pembayaran" selected={selectedFAQ?.category === "Pembayaran"}>Pembayaran</option>
                      <option value="Kelas" selected={selectedFAQ?.category === "Kelas"}>Kelas</option>
                      <option value="Langganan" selected={selectedFAQ?.category === "Langganan"}>Langganan</option>
                      <option value="Akun" selected={selectedFAQ?.category === "Akun"}>Akun</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-white/60 text-sm mb-1">Urutan</label>
                    <input 
                      type="number" 
                      className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
                      defaultValue={selectedFAQ?.order || 1}
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="is_published" 
                      className="mr-2"
                      defaultChecked={selectedFAQ?.is_published}
                    />
                    <label htmlFor="is_published" className="text-white">Publikasikan</label>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 mt-6">
                  <button 
                    className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded text-sm transition"
                    onClick={() => setShowFAQModal(false)}
                  >
                    Batal
                  </button>
                  <button 
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm transition"
                    onClick={() => {
                      // Implementasi simpan FAQ
                      setShowFAQModal(false);
                    }}
                  >
                    Simpan
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Modal Panduan */}
          {showGuideModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    {selectedGuide ? "Edit Panduan" : "Tambah Panduan Baru"}
                  </h3>
                  <button 
                    onClick={() => setShowGuideModal(false)}
                    className="text-white/60 hover:text-white transition"
                  >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-white/60 text-sm mb-1">Judul</label>
                    <input 
                      type="text" 
                      className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
                      defaultValue={selectedGuide?.title || ""}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white/60 text-sm mb-1">Kategori</label>
                    <select className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white">
                      <option value="Pemula" selected={selectedGuide?.category === "Pemula"}>Pemula</option>
                      <option value="Fitur" selected={selectedGuide?.category === "Fitur"}>Fitur</option>
                      <option value="Teknis" selected={selectedGuide?.category === "Teknis"}>Teknis</option>
                      <option value="Pembayaran" selected={selectedGuide?.category === "Pembayaran"}>Pembayaran</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-white/60 text-sm mb-1">Konten</label>
                    <textarea 
                      className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
                      rows={10}
                      defaultValue={selectedGuide?.content || ""}
                    ></textarea>
                  </div>
                  
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="guide_is_published" 
                      className="mr-2"
                      defaultChecked={selectedGuide?.is_published}
                    />
                    <label htmlFor="guide_is_published" className="text-white">Publikasikan</label>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 mt-6">
                  <button 
                    className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded text-sm transition"
                    onClick={() => setShowGuideModal(false)}
                  >
                    Batal
                  </button>
                  <button 
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm transition"
                    onClick={() => {
                      // Implementasi simpan panduan
                      setShowGuideModal(false);
                    }}
                  >
                    Simpan
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Modal Pengumuman */}
          {showAnnouncementModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    {selectedAnnouncement ? "Edit Pengumuman" : "Tambah Pengumuman Baru"}
                  </h3>
                  <button 
                    onClick={() => setShowAnnouncementModal(false)}
                    className="text-white/60 hover:text-white transition"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-white/60 text-sm mb-1">Judul</label>
                    <input 
                      type="text" 
                      className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
                      defaultValue={selectedAnnouncement?.title || ""}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white/60 text-sm mb-1">Tipe</label>
                    <select className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white">
                      <option value="info" selected={selectedAnnouncement?.type === "info"}>Informasi</option>
                      <option value="warning" selected={selectedAnnouncement?.type === "warning"}>Peringatan</option>
                      <option value="maintenance" selected={selectedAnnouncement?.type === "maintenance"}>Pemeliharaan</option>
                      <option value="update" selected={selectedAnnouncement?.type === "update"}>Pembaruan</option>
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/60 text-sm mb-1">Tanggal Mulai</label>
                      <input 
                        type="date" 
                        className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
                        defaultValue={selectedAnnouncement?.start_date || ""}
                      />
                    </div>
                    <div>
                      <label className="block text-white/60 text-sm mb-1">Tanggal Selesai</label>
                      <input 
                        type="date" 
                        className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
                        defaultValue={selectedAnnouncement?.end_date || ""}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-white/60 text-sm mb-1">Konten</label>
                    <textarea 
                      className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
                      rows={5}
                      defaultValue={selectedAnnouncement?.content || ""}
                    ></textarea>
                  </div>
                  
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="announcement_is_active" 
                      className="mr-2"
                      defaultChecked={selectedAnnouncement?.is_active}
                    />
                    <label htmlFor="announcement_is_active" className="text-white">Aktif</label>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 mt-6">
                  <button 
                    className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded text-sm transition"
                    onClick={() => setShowAnnouncementModal(false)}
                  >
                    Batal
                  </button>
                  <button 
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm transition"
                    onClick={() => {
                      // Implementasi simpan pengumuman
                      setShowAnnouncementModal(false);
                    }}
                  >
                    Simpan
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Modal Kontak */}
          {showContactModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    {selectedContact ? "Edit Kontak" : "Tambah Kontak Baru"}
                  </h3>
                  <button 
                    onClick={() => setShowContactModal(false)}
                    className="text-white/60 hover:text-white transition"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-white/60 text-sm mb-1">Nama</label>
                    <input 
                      type="text" 
                      className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
                      defaultValue={selectedContact?.name || ""}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white/60 text-sm mb-1">Email</label>
                    <input 
                      type="email" 
                      className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
                      defaultValue={selectedContact?.email || ""}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white/60 text-sm mb-1">Telepon</label>
                    <input 
                      type="tel" 
                      className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
                      defaultValue={selectedContact?.phone || ""}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white/60 text-sm mb-1">Departemen</label>
                    <select className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white">
                      <option value="Teknis" selected={selectedContact?.department === "Teknis"}>Teknis</option>
                      <option value="Pembayaran" selected={selectedContact?.department === "Pembayaran"}>Pembayaran</option>
                      <option value="Konten" selected={selectedContact?.department === "Konten"}>Konten</option>
                      <option value="Umum" selected={selectedContact?.department === "Umum"}>Umum</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="contact_is_active" 
                      className="mr-2"
                      defaultChecked={selectedContact?.is_active}
                    />
                    <label htmlFor="contact_is_active" className="text-white">Aktif</label>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 mt-6">
                  <button 
                    className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded text-sm transition"
                    onClick={() => setShowContactModal(false)}
                  >
                    Batal
                  </button>
                  <button 
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm transition"
                    onClick={() => {
                      // Implementasi simpan kontak
                      setShowContactModal(false);
                    }}
                  >
                    Simpan
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
}