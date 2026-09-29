import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  LogOut, 
  Calendar, 
  Search, 
  Sparkles, 
  ChevronRight, 
  Share2, 
  Download, 
  QrCode, 
  CheckCircle2, 
  Lock, 
  UserCheck, 
  MapPin, 
  Briefcase, 
  Phone, 
  ShieldAlert, 
  RotateCw, 
  Edit3, 
  Save, 
  IdCard, 
  X, 
  MessageCircle, 
  Clock, 
  Image as ImageIcon, 
  ZoomIn,
  Camera,
  Trash2,
  Maximize2,
  User,
  Mail,
  CreditCard,
  FileText
} from 'lucide-react';
import { AlumniRecord, EventAgenda } from '../types';
import { WilayahAddressFilter } from './common/WilayahAddressFilter';
import { LocationCoordinates } from './common/FullscreenLocationMapModal';
import posterReuniImg from '../assets/images/poster_reuni_akbar_1790648045947.jpg';
import logoPonpesImg from '../assets/images/logo_ponpes_attaroqqy_1790648746461.jpg';

interface AlumniViewProps {
  alumni: AlumniRecord;
  allAlumni: AlumniRecord[];
  events: EventAgenda[];
  onLogout: () => void;
  onUpdateProfile: (updated: Partial<AlumniRecord>) => void;
  onRsvpEvent: (eventId: string, rsvp: 'hadir' | 'belum_pasti' | 'tidak_hadir') => void;
}

type TabType = 'kta' | 'events' | 'directory' | 'profile';

export const AlumniView: React.FC<AlumniViewProps> = ({
  alumni,
  allAlumni,
  events,
  onLogout,
  onUpdateProfile,
  onRsvpEvent,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('kta');
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showPosterModal, setShowPosterModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Profile Edit State
  const [editNik, setEditNik] = useState(alumni.nik);
  const [editNoKk, setEditNoKk] = useState(alumni.noKk || '');
  const [editName, setEditName] = useState(alumni.name);
  const [editUsername, setEditUsername] = useState(alumni.username || '');
  const [editPhone, setEditPhone] = useState(alumni.phone);
  const [editEmail, setEditEmail] = useState(alumni.email);
  const [editCity, setEditCity] = useState(alumni.city);
  const [editProvince, setEditProvince] = useState(alumni.province);
  const [editKecamatan, setEditKecamatan] = useState(alumni.kecamatan || '');
  const [editDesa, setEditDesa] = useState(alumni.desa || '');
  const [editAlamatLengkap, setEditAlamatLengkap] = useState(alumni.alamatLengkap || '');
  const [editCoordinates, setEditCoordinates] = useState<LocationCoordinates | null>(alumni.coordinates || null);
  const [editOccupation, setEditOccupation] = useState(alumni.occupation);
  const [editInstitution, setEditInstitution] = useState(alumni.institution);
  const [editBio, setEditBio] = useState(alumni.bio || '');
  const [editPhotoUrl, setEditPhotoUrl] = useState<string | undefined>(alumni.photoUrl);
  const [editShareContact, setEditShareContact] = useState(alumni.shareContact);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [showFullscreenPhoto, setShowFullscreenPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditNik(alumni.nik);
    setEditNoKk(alumni.noKk || '');
    setEditName(alumni.name);
    setEditUsername(alumni.username || '');
    setEditPhone(alumni.phone);
    setEditEmail(alumni.email);
    setEditCity(alumni.city);
    setEditProvince(alumni.province);
    setEditKecamatan(alumni.kecamatan || '');
    setEditDesa(alumni.desa || '');
    setEditAlamatLengkap(alumni.alamatLengkap || '');
    setEditCoordinates(alumni.coordinates || null);
    setEditOccupation(alumni.occupation);
    setEditInstitution(alumni.institution);
    setEditBio(alumni.bio || '');
    setEditPhotoUrl(alumni.photoUrl);
    setEditShareContact(alumni.shareContact);
  }, [alumni]);

  // Handle uploading and scaling photo
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      triggerToast('Format file harus berupa gambar (JPG, PNG, atau WEBP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.88);
          setEditPhotoUrl(compressed);
          triggerToast('Foto profil dipilih. Klik "Simpan Perubahan" untuk menyimpan.');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Handle deleting photo
  const handleDeletePhoto = () => {
    setEditPhotoUrl(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    triggerToast('Foto profil dihapus. Klik "Simpan Perubahan" untuk menyimpan.');
  };

  // Directory Search State (Restricted Information)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGradYear, setSelectedGradYear] = useState<string>('all');
  const [selectedAlumniDetail, setSelectedAlumniDetail] = useState<AlumniRecord | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);

    if (!editNik.trim()) {
      triggerToast('NIK tidak boleh kosong!');
      setIsSavingProfile(false);
      return;
    }

    if (editNik.trim().length !== 16) {
      triggerToast('NIK harus terdiri dari 16 digit angka');
      setIsSavingProfile(false);
      return;
    }

    if (editNoKk.trim() && editNoKk.trim().length !== 16) {
      triggerToast('Nomor KK harus terdiri dari 16 digit angka');
      setIsSavingProfile(false);
      return;
    }

    const updates: Partial<AlumniRecord> = {
      nik: editNik.trim(),
      noKk: editNoKk.trim() || undefined,
      name: editName,
      username: editUsername.trim() || undefined,
      phone: editPhone,
      email: editEmail,
      city: editCity,
      province: editProvince,
      kecamatan: editKecamatan,
      desa: editDesa,
      alamatLengkap: editAlamatLengkap,
      coordinates: editCoordinates || undefined,
      occupation: editOccupation,
      institution: editInstitution,
      bio: editBio,
      photoUrl: editPhotoUrl || undefined,
      shareContact: editShareContact,
    };

    if (newPassword) {
      if (newPassword.length < 4) {
        triggerToast('Kata sandi baru minimal 4 karakter');
        setIsSavingProfile(false);
        return;
      }
      if (newPassword !== confirmPassword) {
        triggerToast('Konfirmasi kata sandi tidak cocok!');
        setIsSavingProfile(false);
        return;
      }
      updates.password = newPassword;
      updates.isPasswordChanged = true;
    }

    setTimeout(() => {
      onUpdateProfile(updates);
      setIsSavingProfile(false);
      setNewPassword('');
      setConfirmPassword('');
      triggerToast('Profil & Pengaturan berhasil disimpan!');
    }, 500);
  };

  // Filter directory
  const filteredAlumni = allAlumni.filter((item) => {
    const matchQuery =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.occupation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.institution.toLowerCase().includes(searchQuery.toLowerCase());

    const matchYear = selectedGradYear === 'all' || item.gradYear === selectedGradYear;
    return matchQuery && matchYear;
  });

  return (
    <div className="w-full h-full flex flex-col bg-slate-100 overflow-hidden relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 text-white text-xs px-4 py-2 rounded-full shadow-lg border border-slate-700 backdrop-blur-md animate-in fade-in duration-150 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP HEADER */}
      <div className="bg-gradient-to-r from-[#0369a1] via-[#0284c7] to-[#0ea5e9] text-white pt-6 pb-4 px-5 shadow-md shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-white text-sky-700 font-extrabold flex items-center justify-center text-sm shadow-sm overflow-hidden shrink-0">
              {alumni.photoUrl ? (
                <img src={alumni.photoUrl} alt={alumni.name} className="w-full h-full object-cover" />
              ) : (
                alumni.name.charAt(0)
              )}
            </div>
            <div>
              <p className="text-[10px] text-sky-200 font-semibold uppercase tracking-wider">
                Assalamu'alaikum,
              </p>
              <h2 className="font-display font-bold text-sm sm:text-base leading-tight truncate max-w-[190px]">
                {alumni.name}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/80 hover:bg-rose-600 text-white text-xs font-semibold transition-colors cursor-pointer"
              title="Keluar dari Portal"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </div>

      {/* BODY SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* ================= TAB 1: KTA DIGITAL & BERANDA ================= */}
        {activeTab === 'kta' && (
          <div className="space-y-4">
            {/* KARTU TANDA ALUMNI (KTA) DIGITAL INTERAKTIF */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <IdCard className="w-4 h-4 text-sky-700" />
                  <h3 className="font-display font-bold text-xs uppercase tracking-wider text-slate-800">
                    Kartu Tanda Alumni (KTA) Digital
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCardFlipped(!isCardFlipped)}
                  className="text-[11px] text-sky-600 hover:text-sky-800 font-medium flex items-center gap-1 cursor-pointer"
                >
                  <RotateCw className="w-3 h-3" />
                  <span>{isCardFlipped ? 'Lihat Depan' : 'Lihat Belakang'}</span>
                </button>
              </div>

              {/* Physical Card Container */}
              <div
                onClick={() => setIsCardFlipped(!isCardFlipped)}
                className="w-full aspect-[1.58/1] rounded-3xl p-5 text-white shadow-xl relative overflow-hidden cursor-pointer transition-all duration-300 transform select-none"
                style={{
                  background: isCardFlipped
                    ? 'linear-gradient(135deg, #091e3a 0%, #1e3a8a 50%, #0f172a 100%)'
                    : 'linear-gradient(135deg, #0f172a 0%, #0369a1 60%, #0284c7 100%)',
                }}
              >
                {/* Decorative water drop & metallic glow */}
                <div className="absolute inset-0 droplet-pattern opacity-15 pointer-events-none" />
                <div className="absolute -top-12 -right-12 w-44 h-44 bg-sky-400/20 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-amber-400/15 rounded-full blur-xl pointer-events-none" />

                {!isCardFlipped ? (
                  /* SISI DEPAN KTA */
                  <div className="relative z-10 h-full flex flex-col justify-between">
                    {/* Header KTA */}
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-full bg-white p-0.5 shadow-md border border-white/50 shrink-0 overflow-hidden flex items-center justify-center">
                          <img
                            src={logoPonpesImg}
                            alt="Logo Pondok Pesantren Attaroqqy"
                            className="w-full h-full object-cover rounded-full"
                          />
                        </div>
                        <div>
                          <p className="text-[9px] font-mono tracking-widest text-sky-200 uppercase font-bold">
                            KARTU TANDA ALUMNI
                          </p>
                          <h4 className="text-xs sm:text-sm font-extrabold font-display tracking-wide text-white">
                            Pondok Pesantren Attaroqqy
                          </h4>
                        </div>
                      </div>
                    </div>

                    {/* Middle: Data & Photo */}
                    <div className="flex items-center gap-3.5 my-auto">
                      <div className="w-14 h-16 sm:w-16 sm:h-20 bg-white/10 border-2 border-white/40 rounded-xl overflow-hidden shadow-inner flex flex-col items-center justify-center shrink-0">
                        {alumni.photoUrl ? (
                          <img src={alumni.photoUrl} alt={alumni.name} className="w-full h-full object-cover" />
                        ) : (
                          <>
                            <span className="text-2xl">👨‍🎓</span>
                            <span className="text-[8px] text-sky-200 mt-1 font-mono">FOTO KTA</span>
                          </>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-mono text-sky-200 tracking-wider">
                          NO. ALUMNI: {alumni.nis}
                        </p>
                        <h3 className="font-bold text-sm sm:text-base leading-tight truncate text-white">
                          {alumni.name}
                        </h3>
                        <p className="text-[10px] text-sky-100 truncate mt-0.5">
                          {alumni.jenjang}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-sky-200">
                          <span className="truncate font-medium">{alumni.city}</span>
                        </div>
                      </div>
                    </div>

                    {/* Footer KTA: QR Code snippet & Seal */}
                    <div className="flex justify-between items-end pt-2 border-t border-white/20">
                      <div>
                        <p className="text-[8px] text-sky-200 font-mono">NIK: {alumni.nik.slice(0, 6)}******{alumni.nik.slice(-4)}</p>
                        <p className="text-[8px] text-sky-300 font-mono">PORTAL RESMI IKAPAZ AT-TAROQQY</p>
                      </div>
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowQrModal(true);
                        }}
                        className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-md px-2 py-1 rounded-lg border border-white/30 transition-colors"
                      >
                        <QrCode className="w-3.5 h-3.5 text-amber-300" />
                        <span className="text-[9px] font-semibold text-white">QR Presensi</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* SISI BELAKANG KTA */
                  <div className="relative z-10 h-full flex flex-col justify-between text-[10px]">
                    <div className="border-b border-white/20 pb-1.5 flex justify-between items-center">
                      <span className="font-bold font-display text-sky-200">KETENTUAN KTA ALUMNI</span>
                      <span className="text-[9px] font-mono text-slate-300">TRQ-RULE-V2</span>
                    </div>

                    <div className="space-y-1.5 text-[9px] text-slate-200 leading-relaxed">
                      <p>1. Kartu ini adalah tanda keanggotaan resmi Ikatan Alumni Pondok Pesantren At-taroqqy (IKAPAZ).</p>
                      <p>2. Digunakan sebagai kartu identitas presensi reuni akbar, akses perpustakaan pondok, dan jaringan bisnis alumni.</p>
                      <p>3. Berlaku seumur hidup selama menjaga nama baik almamater pesantren.</p>
                    </div>

                    <div className="flex justify-between items-end pt-1.5 border-t border-white/20 text-[9px]">
                      <div>
                        <p className="text-slate-400">Pondok Pesantren At-taroqqy</p>
                        <p className="text-sky-300 font-mono">www.attaroqqy.ac.id</p>
                      </div>
                      <div className="text-right">
                        <p className="text-slate-300 font-signature italic text-xs">Masyayikh Ponpes</p>
                        <p className="font-bold text-[8px] text-white">Pengasuh Pesantren</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons for KTA */}
              <div className="grid grid-cols-2 gap-2 mt-2.5">
                <button
                  type="button"
                  onClick={() => triggerToast('KTA Digital berhasil disimpan ke galeri')}
                  className="py-2.5 px-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-sky-600" />
                  <span>Unduh KTA (PDF)</span>
                </button>
                <button
                  type="button"
                  onClick={() => triggerToast('Tautan KTA disalin ke papan klip')}
                  className="py-2.5 px-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5 text-sky-600" />
                  <span>Bagikan KTA</span>
                </button>
              </div>
            </div>

            {/* EVENT TERDEKAT CAROUSEL WIDGET */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  <h3 className="font-display font-bold text-xs uppercase tracking-wider text-slate-800">
                    Agenda & Event Terdekat
                  </h3>
                </div>
                <button
                  onClick={() => setActiveTab('events')}
                  className="text-[11px] font-semibold text-sky-600 hover:underline cursor-pointer"
                >
                  Semua ({events.length})
                </button>
              </div>

              {events.slice(0, 1).map((ev) => (
                <div key={ev.id} className="p-3 bg-sky-50/70 border border-sky-100 rounded-xl space-y-2.5">
                  {/* KOTAK UNTUK POSTER ACARA */}
                  <div 
                    onClick={() => setShowPosterModal(true)}
                    className="relative w-full aspect-[16/9] rounded-xl overflow-hidden border border-sky-200/80 bg-slate-900 group cursor-pointer shadow-xs select-none"
                  >
                    <img
                      src={posterReuniImg}
                      alt="Poster Resmi Acara"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/25 flex flex-col justify-between p-2.5">
                      <span className="self-start text-[10px] font-bold text-white bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/20 flex items-center gap-1 shadow-xs">
                        <ImageIcon className="w-3 h-3 text-amber-300" />
                        Poster Acara
                      </span>
                      <span className="self-end text-[10px] text-white bg-white/25 backdrop-blur-md px-2 py-0.5 rounded-md font-medium group-hover:bg-white/35 transition-colors flex items-center gap-1">
                        <ZoomIn className="w-3 h-3" />
                        Lihat Poster
                      </span>
                    </div>
                  </div>

                  <div className="pt-0.5">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 leading-snug">
                      {ev.title}
                    </h4>
                  </div>

                  <p className="text-[11px] text-slate-600 line-clamp-2">
                    {ev.description}
                  </p>

                  {/* Keterangan Waktu & Lokasi Acara */}
                  <div className="pt-2 border-t border-sky-100/80 space-y-1.5 text-xs text-slate-700">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                      <span className="font-semibold text-slate-800">{ev.date} · {ev.time}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                      <span className="text-[11px] text-slate-700 leading-tight">{ev.location}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 2: EVENT & REUNI LENGKAP ================= */}
        {activeTab === 'events' && (
          <div className="space-y-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="font-display font-bold text-sm text-slate-900">Agenda Alumni & Pondok</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Konfirmasikan kehadiran Anda untuk mempermudah panitia mendata akomodasi dan konsumsi.
              </p>
            </div>

            {events.map((ev) => (
              <div key={ev.id} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
                {/* Poster Box for main events */}
                {ev.category === 'reuni' && (
                  <div 
                    onClick={() => setShowPosterModal(true)}
                    className="relative w-full aspect-[16/9] rounded-xl overflow-hidden border border-sky-200/80 bg-slate-900 group cursor-pointer shadow-xs select-none"
                  >
                    <img
                      src={posterReuniImg}
                      alt="Poster Resmi Acara"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/25 flex flex-col justify-between p-2.5">
                      <span className="self-start text-[10px] font-bold text-white bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/20 flex items-center gap-1 shadow-xs">
                        <ImageIcon className="w-3 h-3 text-amber-300" />
                        Poster Acara
                      </span>
                      <span className="self-end text-[10px] text-white bg-white/25 backdrop-blur-md px-2 py-0.5 rounded-md font-medium group-hover:bg-white/35 transition-colors flex items-center gap-1">
                        <ZoomIn className="w-3 h-3" />
                        Lihat Penuh
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900">{ev.title}</h4>
                  <span className="text-[11px] font-semibold text-emerald-600 shrink-0 ml-2">
                    {ev.attendeesCount} Alumni Terdaftar
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{ev.description}</p>

                <div className="space-y-1.5 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                    <span>{ev.date} · {ev.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span className="truncate">{ev.location}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-slate-500 font-medium">Partisipasi Alumni</span>
                  <button
                    onClick={() => {
                      onRsvpEvent(ev.id, 'hadir');
                      triggerToast('Konfirmasi kehadiran berhasil dicatat!');
                    }}
                    className="px-4 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Konfirmasi Hadir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ================= TAB 3: CARI ALUMNI (INFORMASI TERBATAS SESUAI PERMINTAAN) ================= */}
        {activeTab === 'directory' && (
          <div className="space-y-3">
            {/* Header & Privacy Notice */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <h3 className="font-display font-bold text-sm text-slate-900">Direktori Alumni Terdaftar</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Temukan rekan santri sealmamater.
              </p>
              {/* Mandatory Privacy Badge */}
              <div className="p-2.5 bg-sky-50 border border-sky-100 rounded-xl flex items-start gap-2 text-[11px] text-sky-900">
                <Lock className="w-3.5 h-3.5 text-sky-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Informasi Terbatas:</strong> Demi privasi rekan alumni, data sensitif seperti NIK, nomor induk detail, alamat KTP, dan rekam jejak santri <strong>tidak ditampilkan</strong> kepada sesama alumni.
                </span>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari nama alumni, kota, atau profesi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0284c7] shadow-xs"
                />
              </div>

              {/* Year filter pills */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
                <button
                  onClick={() => setSelectedGradYear('all')}
                  className={`px-3 py-1 rounded-xl font-medium shrink-0 cursor-pointer ${
                    selectedGradYear === 'all'
                      ? 'bg-[#0284c7] text-white'
                      : 'bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  Semua Angkatan
                </button>
                {['2024', '2022', '2020', '2019', '2018', '2001'].map((yr) => (
                  <button
                    key={yr}
                    onClick={() => setSelectedGradYear(yr)}
                    className={`px-3 py-1 rounded-xl font-medium shrink-0 cursor-pointer ${
                      selectedGradYear === yr
                        ? 'bg-[#0284c7] text-white'
                        : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    Angkatan {yr}
                  </button>
                ))}
              </div>
            </div>

            {/* List of Alumni (Restricted Data Only!) */}
            <div className="space-y-2.5">
              {filteredAlumni.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedAlumniDetail(item)}
                  className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs hover:border-sky-300 transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-100 to-sky-200 text-sky-800 font-bold flex items-center justify-center text-sm shrink-0 border border-sky-200 overflow-hidden">
                      {item.photoUrl ? (
                        <img src={item.photoUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        item.name.charAt(0)
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                          {item.name}
                        </h4>
                        {item.id === alumni.id && (
                          <span className="text-[9px] bg-sky-100 text-sky-700 px-1.5 py-0.2 rounded font-semibold">
                            Anda
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                        <span className="font-semibold text-sky-700">Angkatan {item.gradYear}</span>
                        <span>·</span>
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{item.city}</span>
                      </p>
                      <p className="text-[11px] text-slate-600 truncate flex items-center gap-1">
                        <Briefcase className="w-3 h-3 text-slate-400" />
                        <span>{item.occupation || 'Alumni'}</span>
                      </p>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                </div>
              ))}

              {filteredAlumni.length === 0 && (
                <div className="text-center py-8 bg-white rounded-2xl border border-slate-200">
                  <p className="text-sm font-semibold text-slate-700">Tidak ada alumni yang cocok</p>
                  <p className="text-xs text-slate-400 mt-1">Coba gunakan kata kunci pencarian lain</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 4: EDIT PROFIL MANDIRI & GANTI SANDI ================= */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="space-y-4">
            {/* ================= 1. HERO TOP: LINGKARAN FOTO PROFIL & IDENTITAS ================= */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs text-center relative overflow-hidden">
              {/* Subtle gradient accent top */}
              <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-sky-50 to-transparent pointer-events-none" />

              {/* Lingkaran Foto Profil - Klik untuk Fullscreen Bersih */}
              <div className="relative inline-block mx-auto mb-3 mt-1">
                <button
                  type="button"
                  onClick={() => setShowFullscreenPhoto(true)}
                  className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full ring-4 ring-white shadow-xl shadow-slate-300/60 overflow-hidden cursor-pointer group transition-all duration-200 hover:ring-sky-300 active:scale-95 focus:outline-none flex items-center justify-center bg-slate-100"
                  title="Klik untuk melihat foto dalam layar penuh bersih"
                >
                  {editPhotoUrl ? (
                    <img
                      src={editPhotoUrl}
                      alt={editName}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-sky-600 via-sky-500 to-cyan-500 text-white flex flex-col items-center justify-center font-bold text-3xl shadow-inner">
                      <span>{editName.charAt(0)}</span>
                      <span className="text-[9px] font-normal tracking-wide text-sky-100 opacity-90 mt-0.5">Tambah Foto</span>
                    </div>
                  )}

                  {/* Hover Overlay: "Layar Penuh" */}
                  <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-medium gap-1">
                    <Maximize2 className="w-4 h-4 text-white" />
                    <span>Layar Penuh</span>
                  </div>
                </button>

                {/* Floating Camera Button (Ganti Foto Shortcut) */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-sky-600 hover:bg-sky-500 text-white flex items-center justify-center shadow-md ring-2 ring-white cursor-pointer active:scale-90 transition-all"
                  title="Ganti Foto Profil"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              {/* Nama & Data Identitas */}
              <h3 className="font-display font-bold text-base sm:text-lg text-slate-900 leading-tight">
                {editName || alumni.name}
              </h3>
              <p className="text-xs text-slate-500 mt-1 flex items-center justify-center gap-1.5 font-medium flex-wrap">
                <span>NIS: <span className="font-mono text-slate-700">{alumni.nis}</span></span>
                <span>·</span>
                <span>Angkatan {alumni.gradYear}</span>
                <span>·</span>
                <span className="text-sky-700 font-semibold">{alumni.jenjang}</span>
              </p>

              {/* Tombol Aksi: Lihat Penuh, Ganti Foto, Hapus Foto */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-4 pt-3.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowFullscreenPhoto(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Buka foto profil fullscreen bersih"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Lihat Foto</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-sky-200/60"
                  title="Unggah foto profil baru dari galeri/kamera"
                >
                  <Camera className="w-3.5 h-3.5 text-sky-600" />
                  <span>Ganti Foto</span>
                </button>

                {editPhotoUrl && (
                  <button
                    type="button"
                    onClick={handleDeletePhoto}
                    className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-rose-200/60"
                    title="Hapus foto profil saat ini"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>Hapus</span>
                  </button>
                )}

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
              </div>
            </div>

            {/* ================= 2. DATA POKOK SANTRI (DATABASE TERVERIFIKASI PONDOK) ================= */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Data Pokok Akademik Santri</span>
                </span>
                <span className="text-[9px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono font-semibold">
                  TERKUNCI
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs bg-white p-3 rounded-xl border border-slate-200/60">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Nomor Induk Santri (NIS):</span>
                  <span className="font-mono font-medium text-slate-800">{alumni.nis}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Tahun Kelulusan:</span>
                  <span className="font-semibold text-slate-800">Angkatan {alumni.gradYear}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Jenjang / Marhalah:</span>
                  <span className="font-semibold text-slate-800 truncate block">{alumni.jenjang}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Asrama Dulu:</span>
                  <span className="font-semibold text-slate-800 truncate block">{alumni.asramaDulu || 'Komplek Utama'}</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 italic">
                *Data akademik di atas bersumber dari pangkalan data pondok. Untuk perubahan silakan hubungi Admin Pondok.
              </p>
            </div>

            {/* ================= 3. DATA PRIBADI & IDENTITAS KEPENDUDUKAN ================= */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3.5 text-xs">
              <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100">
                <User className="w-4 h-4 text-sky-600" />
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-xs">
                  Informasi Pribadi & Identitas
                </h4>
              </div>

              {/* NIK & No. KK Editable Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5 text-sky-600" />
                      <span>Nomor Induk Kependudukan (NIK)</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">16 Digit</span>
                  </label>
                  <input
                    type="text"
                    maxLength={16}
                    value={editNik}
                    onChange={(e) => setEditNik(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono font-medium focus:outline-none focus:ring-2 focus:ring-[#0284c7] focus:bg-white transition-all"
                    placeholder="3507xxxxxxxxxxxx"
                    required
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    NIK digunakan untuk identitas dan alternatif login portal.
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-sky-600" />
                      <span>Nomor Kartu Keluarga (No. KK)</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">16 Digit</span>
                  </label>
                  <input
                    type="text"
                    maxLength={16}
                    value={editNoKk}
                    onChange={(e) => setEditNoKk(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono font-medium focus:outline-none focus:ring-2 focus:ring-[#0284c7] focus:bg-white transition-all"
                    placeholder="Nomor KK (16 digit)"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Opsional untuk kelengkapan administrasi data alumni.
                  </p>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap & Gelar</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0284c7] focus:bg-white transition-all"
                  placeholder="Nama lengkap Anda beserta gelar"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Username Akun (Alternatif Login)
                </label>
                <div className="relative">
                  <UserCheck className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Contoh: mulianingsih_20"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0284c7] focus:bg-white transition-all"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Username dapat digunakan untuk login sebagai pengganti NIK/NIS.
                </p>
              </div>

              {/* Nomor WhatsApp + Tombol Izin Tampilkan ke Alumni Lain Tepat di Bawahnya */}
              <div className="space-y-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>Nomor WhatsApp</span>
                  </label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0284c7] focus:bg-white transition-all"
                    placeholder="Contoh: 08123456789"
                  />
                </div>

                {/* ================= TOMBOL IZIN DITAMPILKAN KE ALUMNI LAIN (DI BAWAH INPUT NO WA) ================= */}
                <div className="p-3 rounded-2xl bg-sky-50/80 border border-sky-200/80 flex items-center justify-between gap-3 shadow-2xs">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                      <span>Izin Tampilkan Nomor WA ke Sesama Alumni</span>
                    </p>
                    <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                      Izinkan nomor WhatsApp ini dapat dilihat oleh alumni lain di halaman direktori untuk silaturahmi.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={editShareContact}
                      onChange={(e) => setEditShareContact(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600 shadow-inner"></div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-slate-400" />
                  <span>Alamat Email</span>
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0284c7] focus:bg-white transition-all"
                  placeholder="email@contoh.com"
                />
              </div>
            </div>

            {/* ================= 4. DOMISILI & TITIK LOKASI PETA ================= */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3.5 text-xs">
              <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100">
                <MapPin className="w-4 h-4 text-rose-500" />
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-xs">
                  Domisili & Titik Lokasi Terkini
                </h4>
              </div>

              <WilayahAddressFilter
                province={editProvince}
                city={editCity}
                kecamatan={editKecamatan}
                desa={editDesa}
                alamatLengkap={editAlamatLengkap}
                coordinates={editCoordinates}
                onChange={(vals) => {
                  setEditProvince(vals.province);
                  setEditCity(vals.city);
                  setEditKecamatan(vals.kecamatan);
                  setEditDesa(vals.desa);
                  if (vals.alamatLengkap !== undefined) setEditAlamatLengkap(vals.alamatLengkap);
                  if (vals.coordinates !== undefined) setEditCoordinates(vals.coordinates);
                }}
              />
            </div>

            {/* ================= 5. PROFESI & BIO ALUMNI ================= */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3.5 text-xs">
              <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100">
                <Briefcase className="w-4 h-4 text-sky-600" />
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-xs">
                  Profesi & Aktivitas Alumni
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Profesi / Pekerjaan</label>
                  <input
                    type="text"
                    value={editOccupation}
                    onChange={(e) => setEditOccupation(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0284c7] focus:bg-white transition-all"
                    placeholder="Contoh: Guru / Wiraswasta / Dokter"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Instansi / Perusahaan</label>
                  <input
                    type="text"
                    value={editInstitution}
                    onChange={(e) => setEditInstitution(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0284c7] focus:bg-white transition-all"
                    placeholder="Nama tempat kerja / usaha"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Bio / Pesan Alumni</label>
                <textarea
                  rows={2}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Ceritakan singkat aktivitas atau pesan silaturahmi Anda..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0284c7] focus:bg-white transition-all resize-none"
                />
              </div>
            </div>

            {/* ================= 6. KEAMANAN & KATA SANDI ================= */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3.5 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-xs flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-sky-600" />
                  <span>Ubah Kata Sandi (Dari Default 1234)</span>
                </h4>
                {alumni.isPasswordChanged ? (
                  <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                    Sandi Sudah Diperbarui
                  </span>
                ) : (
                  <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
                    Masih Sandi Default 1234
                  </span>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Kata Sandi Baru</label>
                  <input
                    type="password"
                    placeholder="Kosongkan jika tidak ingin mengubah sandi"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0284c7] focus:bg-white transition-all"
                  />
                </div>
                {newPassword && (
                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">Ulangi Kata Sandi Baru</label>
                    <input
                      type="password"
                      placeholder="Konfirmasi kata sandi baru"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0284c7] focus:bg-white transition-all"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* ================= 7. TOMBOL SIMPAN PERUBAHAN ================= */}
            <button
              type="submit"
              disabled={isSavingProfile}
              className="w-full py-3.5 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold rounded-2xl shadow-lg shadow-sky-600/25 text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 transition-all active:scale-[0.99]"
            >
              {isSavingProfile ? (
                <span>Menyimpan Perubahan...</span>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan Profil</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* ================= BOTTOM BAR TABS ================= */}
      <div className="bg-white border-t border-slate-200 px-3 py-2 flex items-center justify-around shrink-0 select-none z-30">
        <button
          onClick={() => setActiveTab('kta')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors cursor-pointer ${
            activeTab === 'kta' ? 'text-[#0284c7] font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <IdCard className="w-5 h-5" />
          <span className="text-[10px]">KTA Saya</span>
        </button>

        <button
          onClick={() => setActiveTab('events')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors cursor-pointer ${
            activeTab === 'events' ? 'text-[#0284c7] font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px]">Event</span>
        </button>

        <button
          onClick={() => setActiveTab('directory')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors cursor-pointer ${
            activeTab === 'directory' ? 'text-[#0284c7] font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px]">Cari Alumni</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors cursor-pointer ${
            activeTab === 'profile' ? 'text-[#0284c7] font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Edit3 className="w-5 h-5" />
          <span className="text-[10px]">Profil</span>
        </button>
      </div>

      {/* MODAL QR CODE PRESENSI REUNI */}
      {showQrModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
          onClick={() => setShowQrModal(false)}
        >
          <div 
            className="w-full max-w-xs bg-white rounded-3xl p-6 text-center space-y-4 shadow-2xl border border-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="font-bold text-xs uppercase tracking-wider text-slate-800">
                QR Presensi Reuni
              </span>
              <button onClick={() => setShowQrModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 inline-block shadow-inner">
              {/* Simulated QR Code matrix */}
              <div className="w-40 h-40 bg-white p-2 rounded-xl border border-slate-300 flex flex-col items-center justify-center relative">
                <QrCode className="w-32 h-32 text-slate-900" />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-7 h-7 bg-sky-600 rounded-md flex items-center justify-center text-white text-[9px] font-bold border-2 border-white shadow-sm">
                    TRQ
                  </div>
                </div>
              </div>
            </div>

            <div>
              <p className="font-bold text-sm text-slate-900">{alumni.name}</p>
              <p className="text-xs font-mono text-sky-700">NIS: {alumni.nis}</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Tunjukkan QR code ini ke petugas panitia saat tiba di gerbang Ponpes At-taroqqy.
              </p>
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* MODAL DETAIL ALUMNI TAMPILAN TERBATAS (RESTRICTED DETAIL MODAL) */}
      {selectedAlumniDetail && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
          onClick={() => setSelectedAlumniDetail(null)}
        >
          <div 
            className="w-full max-w-sm bg-white rounded-3xl p-5 space-y-4 shadow-2xl border border-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start pb-2 border-b border-slate-100">
              <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wider bg-sky-50 px-2 py-0.5 rounded">
                Profil Rekan Alumni
              </span>
              <button onClick={() => setSelectedAlumniDetail(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center space-y-1.5">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-sky-600 to-sky-400 text-white font-bold text-xl flex items-center justify-center mx-auto shadow-md overflow-hidden ring-2 ring-white">
                {selectedAlumniDetail.photoUrl ? (
                  <img src={selectedAlumniDetail.photoUrl} alt={selectedAlumniDetail.name} className="w-full h-full object-cover" />
                ) : (
                  selectedAlumniDetail.name.charAt(0)
                )}
              </div>
              <h4 className="font-bold text-base text-slate-900">{selectedAlumniDetail.name}</h4>
              <p className="text-xs text-sky-700 font-semibold">
                Alumni Angkatan {selectedAlumniDetail.gradYear}
              </p>
              {selectedAlumniDetail.bio && (
                <p className="text-xs text-slate-600 italic px-3 py-1 bg-slate-50 rounded-xl">
                  "{selectedAlumniDetail.bio}"
                </p>
              )}
            </div>

            <div className="space-y-2 text-xs text-slate-700 bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Domisili:</span>
                <span className="font-medium text-slate-900">{selectedAlumniDetail.city}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Pekerjaan:</span>
                <span className="font-medium text-slate-900">{selectedAlumniDetail.occupation}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Instansi:</span>
                <span className="font-medium text-slate-900">{selectedAlumniDetail.institution || '-'}</span>
              </div>
            </div>

            {/* Restricted notice banner */}
            <div className="p-2 bg-amber-50 border border-amber-100 rounded-xl text-[10px] text-amber-800 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Data privat (NIK, Alamat KTP, dan Catatan Induk) tidak dibuka ke publik.</span>
            </div>

            {/* Contact button if enabled */}
            <div className="pt-1">
              {selectedAlumniDetail.shareContact ? (
                <a
                  href={`https://wa.me/62${selectedAlumniDetail.phone.replace(/^0/, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Hubungi via WhatsApp</span>
                </a>
              ) : (
                <p className="text-center text-[11px] text-slate-400 italic">
                  Alumni ini memilih untuk tidak menampilkan nomor WhatsApp publik.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL LIHAT POSTER ACARA LENGKAP */}
      {showPosterModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-xs animate-in fade-in"
          onClick={() => setShowPosterModal(false)}
        >
          <div 
            className="w-full max-w-lg bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-700 flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-slate-950 px-5 py-3.5 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-amber-400" />
                <h4 className="font-display font-bold text-sm">Poster Resmi Acara</h4>
              </div>
              <button 
                onClick={() => setShowPosterModal(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex flex-col items-center">
              <div className="w-full rounded-2xl overflow-hidden shadow-lg border border-slate-700">
                <img
                  src={posterReuniImg}
                  alt="Poster Lengkap Reuni Akbar"
                  className="w-full h-auto object-cover"
                />
              </div>

              <div className="w-full mt-4 p-3 bg-slate-800/80 rounded-2xl text-slate-200 text-xs space-y-1.5">
                <p className="font-bold text-sm text-white">
                  Reuni Akbar Lintas Angkatan & Haul Masyayikh 2026
                </p>
                <p className="text-[11px] text-slate-300">
                  📅 12 Oktober 2026 · 08.00 - 15.30 WIB
                </p>
                <p className="text-[11px] text-slate-300">
                  📍 Aula Utama & Masjid Jami' Ponpes At-taroqqy, Malang
                </p>
              </div>

              <div className="w-full pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => triggerToast('Poster berhasil disimpan ke galeri')}
                  className="flex-1 py-2.5 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Poster</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPosterModal(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL FULLSCREEN BERSIH: FOTO PROFIL ================= */}
      {showFullscreenPhoto &&
        createPortal(
          <div
            className="fixed inset-0 z-[999999] bg-black/95 backdrop-blur-2xl flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200 select-none pointer-events-auto"
            onClick={() => setShowFullscreenPhoto(false)}
          >
            {/* Top Bar: Title & Close Button */}
            <div
              className="flex items-center justify-between text-white pb-3 border-b border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="min-w-0">
                <h3 className="font-display font-bold text-sm sm:text-base text-white truncate">
                  Foto Profil
                </h3>
                <p className="text-[11px] text-slate-400 truncate">
                  {editName || alumni.name} · NIS {alumni.nis}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowFullscreenPhoto(false)}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                title="Tutup Layar Penuh"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Center Display: Clean Fullscreen Photo or Clean Large Avatar */}
            <div
              className="flex-1 flex items-center justify-center my-4 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {editPhotoUrl ? (
                <div className="relative max-h-[72vh] max-w-[92vw] flex items-center justify-center animate-in zoom-in-95 duration-200">
                  <img
                    src={editPhotoUrl}
                    alt={editName || alumni.name}
                    className="max-h-[72vh] max-w-[92vw] object-contain rounded-2xl shadow-2xl ring-1 ring-white/10"
                  />
                </div>
              ) : (
                <div className="text-center space-y-4 animate-in zoom-in-95 duration-200">
                  <div className="w-44 h-44 sm:w-56 sm:h-56 rounded-full bg-gradient-to-tr from-sky-600 via-sky-500 to-cyan-400 text-white font-bold text-6xl sm:text-7xl flex items-center justify-center mx-auto shadow-2xl ring-4 ring-white/20">
                    {(editName || alumni.name).charAt(0)}
                  </div>
                  <p className="text-sm text-slate-300 font-medium">
                    Belum ada foto profil kustom yang dipasang
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Action Bar: Ganti Foto, Hapus Foto, Tutup */}
            <div
              className="flex flex-wrap items-center justify-center gap-2.5 pt-3 border-t border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => {
                  fileInputRef.current?.click();
                }}
                className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-sky-600/30 transition-all active:scale-95 cursor-pointer"
                title="Pilih foto baru dari perangkat"
              >
                <Camera className="w-4 h-4" />
                <span>Ganti Foto</span>
              </button>

              {editPhotoUrl && (
                <button
                  type="button"
                  onClick={() => {
                    handleDeletePhoto();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white font-semibold text-xs flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                  title="Hapus foto profil"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Hapus Foto</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowFullscreenPhoto(false)}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>Tutup</span>
              </button>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
