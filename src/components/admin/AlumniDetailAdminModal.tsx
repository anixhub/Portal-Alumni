import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Briefcase, 
  Phone, 
  Mail, 
  GraduationCap, 
  KeyRound, 
  RotateCcw, 
  Edit3, 
  Check, 
  Save, 
  ArrowLeft,
  Shield, 
  Building, 
  Home, 
  Calendar, 
  Share2, 
  ExternalLink,
  Camera,
  BookOpen
} from 'lucide-react';
import { AlumniRecord } from '../../types';
import { WilayahAddressFilter } from '../common/WilayahAddressFilter';

interface AlumniDetailAdminModalProps {
  isOpen: boolean;
  alumni: AlumniRecord | null;
  onClose: () => void;
  onResetPassword: (id: string) => void;
  onSave?: (id: string, updated: Partial<AlumniRecord>) => void;
  onEdit?: (alumni: AlumniRecord) => void;
}

export const AlumniDetailAdminModal: React.FC<AlumniDetailAdminModalProps> = ({
  isOpen,
  alumni,
  onClose,
  onResetPassword,
  onSave,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  // Form State for Editing
  const [formData, setFormData] = useState({
    name: alumni?.name || '',
    nik: alumni?.nik || '',
    nis: alumni?.nis || '',
    gender: alumni?.gender || 'L',
    gradYear: alumni?.gradYear || '',
    entryYear: alumni?.entryYear || '',
    jenjang: alumni?.jenjang || '',
    asramaDulu: alumni?.asramaDulu || '',
    province: alumni?.province || '',
    city: alumni?.city || '',
    kecamatan: alumni?.kecamatan || '',
    desa: alumni?.desa || '',
    alamatLengkap: alumni?.alamatLengkap || '',
    coordinates: alumni?.coordinates || null as { lat: number; lng: number } | null,
    occupation: alumni?.occupation || '',
    institution: alumni?.institution || '',
    phone: alumni?.phone || '',
    email: alumni?.email || '',
    bio: alumni?.bio || '',
    photoUrl: alumni?.photoUrl || '',
  });

  // Sync state if alumni prop changes
  useEffect(() => {
    if (alumni) {
      setFormData({
        name: alumni.name,
        nik: alumni.nik,
        nis: alumni.nis,
        gender: alumni.gender,
        gradYear: alumni.gradYear,
        entryYear: alumni.entryYear || '',
        jenjang: alumni.jenjang,
        asramaDulu: alumni.asramaDulu || '',
        province: alumni.province || '',
        city: alumni.city || '',
        kecamatan: alumni.kecamatan || '',
        desa: alumni.desa || '',
        alamatLengkap: alumni.alamatLengkap || '',
        coordinates: alumni.coordinates || null,
        occupation: alumni.occupation || '',
        institution: alumni.institution || '',
        phone: alumni.phone || '',
        email: alumni.email || '',
        bio: alumni.bio || '',
        photoUrl: alumni.photoUrl || '',
      });
      setIsEditing(false);
    }
  }, [alumni]);

  if (!isOpen || !alumni) return null;

  // Clean WhatsApp link
  const cleanPhone = alumni.phone.replace(/[^0-9]/g, '');
  const waNumber = cleanPhone.startsWith('0') 
    ? '62' + cleanPhone.slice(1) 
    : cleanPhone.startsWith('62') 
    ? cleanPhone 
    : cleanPhone ? '62' + cleanPhone : '';

  // Formatted address: Karas, Sedan, Rembang, Jawa Tengah
  const addressParts = [
    alumni.desa,
    alumni.kecamatan,
    alumni.city,
    alumni.province
  ].filter(Boolean);
  const fullAddress = addressParts.length > 0 ? addressParts.join(', ') : 'Belum dilengkapi';

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSave) {
      onSave(alumni.id, formData);
    }
    setIsEditing(false);
  };

  const handleShareProfile = () => {
    if (navigator.share) {
      navigator.share({
        title: `Biodata Alumni - ${alumni.name}`,
        text: `Profil Alumni At-taroqqy: ${alumni.name} (Angkatan ${alumni.gradYear})`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${alumni.name} - Angkatan ${alumni.gradYear} (${alumni.phone})`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col w-full h-full overflow-hidden animate-in fade-in">
      <div 
        className="w-full h-full flex flex-col overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* TOP BAR / NAVIGATION */}
        <div className="bg-white px-4 sm:px-6 py-3.5 border-b border-slate-200/80 shrink-0 z-20 shadow-2xs">
          <div className="max-w-4xl mx-auto w-full flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                title="Kembali"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h2 className="font-display font-bold text-sm sm:text-base text-slate-900 leading-tight">
                  {isEditing ? 'Edit Biodata Alumni' : 'Detail Biodata Alumni'}
                </h2>
                <p className="text-[11px] text-slate-500">
                  Pondok Pesantren At-taroqqy
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={handleShareProfile}
                    className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                    title="Bagikan Ringkasan"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-xs shadow-sky-600/20 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Data</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold text-xs transition-colors cursor-pointer"
                >
                  Batal
                </button>
              )}
            </div>
          </div>
        </div>

        {/* SCROLLABLE PROFILE CONTAINER */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto w-full">
          {!isEditing ? (
            /* ================= VIEW MODE (MEDSOS PROFILE LAYOUT) ================= */
            <div className="pb-10">
              {/* COVER BANNER */}
              <div className="h-32 sm:h-40 bg-gradient-to-r from-emerald-800 via-teal-700 to-sky-800 relative overflow-hidden">
                <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
                <div className="absolute top-3 right-3 px-3 py-1 bg-black/30 backdrop-blur-xs text-white/90 rounded-full text-[11px] font-semibold flex items-center gap-1.5 border border-white/10">
                  <Shield className="w-3 h-3 text-emerald-300" />
                  <span>Terverifikasi Alumni</span>
                </div>
              </div>

              {/* PROFILE HEADER CARD (OVERLAPPING BANNER) */}
              <div className="px-4 sm:px-6 relative -mt-14 sm:-mt-16">
                <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm relative">
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    {/* AVATAR */}
                    <div className="relative">
                      {alumni.photoUrl ? (
                        <img 
                          src={alumni.photoUrl} 
                          alt={alumni.name} 
                          className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-4 border-white shadow-md ring-2 ring-slate-100"
                        />
                      ) : (
                        <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-3xl flex items-center justify-center font-display font-extrabold text-3xl sm:text-4xl text-white shadow-md border-4 border-white ring-2 ring-slate-100 ${
                          alumni.gender === 'P'
                            ? 'bg-gradient-to-br from-pink-500 to-rose-600'
                            : 'bg-gradient-to-br from-sky-600 to-indigo-700'
                        }`}>
                          {alumni.name.charAt(0)}
                        </div>
                      )}
                      <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" title="Status Aktif" />
                    </div>

                    {/* QUICK ACTION BUTTONS */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {waNumber && (
                        <a
                          href={`https://wa.me/${waNumber}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs shadow-emerald-600/20 transition-all cursor-pointer"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => onResetPassword(alumni.id)}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors border border-slate-200/80 cursor-pointer"
                        title="Reset Kata Sandi ke 1234"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset Sandi</span>
                      </button>
                    </div>
                  </div>

                  {/* IDENTITAS NAMA & BADGES */}
                  <div className="mt-4">
                    <h1 className="font-display font-black text-xl sm:text-2xl text-slate-900 leading-tight">
                      {alumni.name}
                    </h1>

                    <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1 flex items-center gap-1.5 flex-wrap">
                      <Briefcase className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                      <span>{alumni.occupation || 'Alumni Pesantren'}</span>
                      {alumni.institution && (
                        <>
                          <span className="text-slate-300">·</span>
                          <span className="text-slate-500">{alumni.institution}</span>
                        </>
                      )}
                    </p>

                    {/* PILL TAGS */}
                    <div className="flex items-center gap-2 mt-3 flex-wrap text-xs">
                      <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-700 font-bold border border-sky-100/80">
                        Angkatan {alumni.gradYear}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 font-medium border border-emerald-100/80">
                        {alumni.jenjang}
                      </span>
                      {alumni.city && (
                        <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-medium flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          <span className="capitalize">{alumni.city}</span>
                        </span>
                      )}
                    </div>

                    {/* BIO / KUTIPAN */}
                    {alumni.bio && (
                      <div className="mt-3.5 pt-3 border-t border-slate-100">
                        <p className="text-xs text-slate-600 italic leading-relaxed">
                          "{alumni.bio}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* DETAIL SECTIONS (MEDSOS CARDS) */}
              <div className="px-4 sm:px-6 mt-4 space-y-3.5 text-xs">
                {/* 1. KARTU DOMISILI & ALAMAT */}
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-3">
                  <div className="flex items-center gap-2 text-slate-800 font-bold border-b border-slate-100 pb-2">
                    <MapPin className="w-4 h-4 text-sky-600" />
                    <span className="text-xs uppercase tracking-wider text-slate-700">Alamat & Domisili</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 block uppercase">Desa / Kelurahan</span>
                      <p className="font-semibold text-slate-800 text-xs mt-0.5 capitalize">{alumni.desa || '-'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 block uppercase">Kecamatan</span>
                      <p className="font-semibold text-slate-800 text-xs mt-0.5 capitalize">{alumni.kecamatan || '-'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 block uppercase">Kabupaten / Kota</span>
                      <p className="font-semibold text-slate-800 text-xs mt-0.5 capitalize">{alumni.city || '-'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 block uppercase">Provinsi</span>
                      <p className="font-semibold text-slate-800 text-xs mt-0.5 capitalize">{alumni.province || '-'}</p>
                    </div>
                    <div className="sm:col-span-2 pt-2 border-t border-slate-50">
                      <span className="text-[10px] font-semibold text-slate-400 block uppercase">Alamat Lengkap</span>
                      <p className="font-medium text-slate-700 text-xs mt-0.5 capitalize leading-relaxed">{fullAddress}</p>
                    </div>
                  </div>
                </div>

                {/* 2. KARTU RIWAYAT SANTRI & PONDOK */}
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-3">
                  <div className="flex items-center gap-2 text-slate-800 font-bold border-b border-slate-100 pb-2">
                    <GraduationCap className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs uppercase tracking-wider text-slate-700">Riwayat Santri & Pendidikan</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5 pt-1">
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 block uppercase">NIK (Kependudukan)</span>
                      <p className="font-mono font-bold text-slate-900 text-xs mt-0.5">{alumni.nik}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 block uppercase">Nomor Induk Santri (NIS)</span>
                      <p className="font-mono font-bold text-slate-900 text-xs mt-0.5">{alumni.nis}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 block uppercase">Tahun Masuk</span>
                      <p className="font-semibold text-slate-800 text-xs mt-0.5">{alumni.entryYear || '-'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 block uppercase">Tahun Lulus</span>
                      <p className="font-semibold text-slate-800 text-xs mt-0.5">Angkatan {alumni.gradYear}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[10px] font-semibold text-slate-400 block uppercase">Jenjang / Marhalah</span>
                      <p className="font-semibold text-slate-800 text-xs mt-0.5">{alumni.jenjang}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[10px] font-semibold text-slate-400 block uppercase">Kamar / Komplek Dulu</span>
                      <p className="font-semibold text-slate-800 text-xs mt-0.5">{alumni.asramaDulu || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* 3. KARTU KONTAK & KREDENSIAL AKUN */}
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-3">
                  <div className="flex items-center gap-2 text-slate-800 font-bold border-b border-slate-100 pb-2">
                    <KeyRound className="w-4 h-4 text-amber-500" />
                    <span className="text-xs uppercase tracking-wider text-slate-700">Kontak & Keamanan Akun</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 block uppercase">No. WhatsApp / HP</span>
                      <p className="font-mono font-semibold text-slate-800 text-xs mt-0.5">{alumni.phone}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 block uppercase">Email</span>
                      <p className="font-medium text-slate-800 text-xs mt-0.5 truncate">{alumni.email || '-'}</p>
                    </div>
                    <div className="sm:col-span-2 p-3 bg-slate-50 rounded-xl border border-slate-200/70 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 block">Status Kata Sandi</span>
                        <span className="text-xs font-bold text-slate-800">
                          {alumni.isPasswordChanged ? 'Sudah Diubah Mandiri' : 'Masih Bawaan Standar (1234)'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onResetPassword(alumni.id)}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg text-[11px] border border-rose-200 transition-colors cursor-pointer"
                      >
                        Reset ke 1234
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ================= EDIT MODE (ADMIN FORM) ================= */
            <form onSubmit={handleSaveForm} className="p-4 sm:p-6 space-y-4 text-xs pb-12">
              <div className="bg-sky-50 border border-sky-100 rounded-2xl p-3 flex items-center gap-2.5 text-sky-800 text-xs">
                <Edit3 className="w-4 h-4 text-sky-600 shrink-0" />
                <span>Anda sedang mengedit data <b>{alumni.name}</b> sebagai Administrator.</span>
              </div>

              {/* FOTO PROFIL URL */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 space-y-2">
                <label className="block font-bold text-slate-800">
                  URL Foto Profil (Opsional)
                </label>
                <div className="flex items-center gap-3">
                  {formData.photoUrl ? (
                    <img 
                      src={formData.photoUrl} 
                      alt="Preview" 
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                      <Camera className="w-5 h-5" />
                    </div>
                  )}
                  <input
                    type="url"
                    placeholder="https://example.com/foto.jpg"
                    value={formData.photoUrl}
                    onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* DATA DIRI & IDENTITAS */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 space-y-3">
                <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2">
                  Identitas Alumni
                </h4>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap & Gelar</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">NIK (16 Digit)</label>
                    <input
                      type="text"
                      required
                      value={formData.nik}
                      onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">NIS Santri</label>
                    <input
                      type="text"
                      required
                      value={formData.nis}
                      onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Jenis Kelamin</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'L' | 'P' })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      <option value="L">Laki-laki (Santri)</option>
                      <option value="P">Perempuan (Santriwati)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Tahun Lulus (Angkatan)</label>
                    <input
                      type="text"
                      required
                      value={formData.gradYear}
                      onChange={(e) => setFormData({ ...formData, gradYear: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Tahun Masuk</label>
                    <input
                      type="text"
                      placeholder="Contoh: 2014"
                      value={formData.entryYear}
                      onChange={(e) => setFormData({ ...formData, entryYear: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Jenjang / Marhalah</label>
                    <input
                      type="text"
                      value={formData.jenjang}
                      onChange={(e) => setFormData({ ...formData, jenjang: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kamar / Komplek Dulu</label>
                  <input
                    type="text"
                    value={formData.asramaDulu}
                    onChange={(e) => setFormData({ ...formData, asramaDulu: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* DATA WILAYAH & ALAMAT */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 space-y-3">
                <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2">
                  Alamat & Domisili
                </h4>
                <WilayahAddressFilter
                  province={formData.province}
                  city={formData.city}
                  kecamatan={formData.kecamatan}
                  desa={formData.desa}
                  alamatLengkap={formData.alamatLengkap}
                  coordinates={formData.coordinates}
                  onChange={({ province, city, kecamatan, desa, alamatLengkap, coordinates }) => {
                    setFormData({
                      ...formData,
                      province,
                      city,
                      kecamatan,
                      desa,
                      alamatLengkap: alamatLengkap || '',
                      coordinates: coordinates || null,
                    });
                  }}
                />
              </div>

              {/* PROFESI & KONTAK */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 space-y-3">
                <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2">
                  Karier, Kontak & Bio
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Profesi / Pekerjaan</label>
                    <input
                      type="text"
                      value={formData.occupation}
                      onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Instansi / Lembaga</label>
                    <input
                      type="text"
                      value={formData.institution}
                      onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">No. WhatsApp / HP</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Bio / Catatan Khusus</label>
                  <textarea
                    rows={2}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* ACTION BUTTONS (BOTTOM) */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-sky-600/20 transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-3 border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </form>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};
