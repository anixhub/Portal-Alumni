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
  FileText,
  Pencil,
  ScanFace,
  Coins,
  Glasses,
  Languages,
  Smartphone,
  KeyRound,
  Check,
  GraduationCap,
  Users,
  Heart,
  AtSign,
  FileCheck,
  Filter,
  Loader2
} from 'lucide-react';
import { AlumniRecord, EventAgenda } from '../types';
import { WilayahAddressFilter } from './common/WilayahAddressFilter';
import { DateWheelPicker } from './common/DateWheelPicker';
import { LocationCoordinates } from './common/FullscreenLocationMapModal';
import { AlumniDetailAdminModal } from './admin/AlumniDetailAdminModal';
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

/**
 * Komponen Viewer Foto Profil Layar Penuh Bersih
 * Hanya menampilkan foto fullscreen tanpa UI mengganggu, hanya ada tombol X dan tombol Hapus.
 * Dilengkapi fitur pinch-to-zoom (cubit), double-tap zoom, mouse-wheel zoom, dan geser (pan).
 */
const FullscreenPhotoViewerModal: React.FC<{
  photoUrl?: string;
  name: string;
  onClose: () => void;
  onDelete?: () => void;
}> = ({ photoUrl, name, onClose, onDelete }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const touchStartRef = useRef<{ dist: number; scale: number; x: number; y: number; posX: number; posY: number }>({ dist: 0, scale: 1, x: 0, y: 0, posX: 0, posY: 0 });
  const isDraggingRef = useRef(false);
  const lastTapRef = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartRef.current = {
        dist,
        scale,
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
        posX: position.x,
        posY: position.y
      };
    } else if (e.touches.length === 1) {
      const now = Date.now();
      if (now - lastTapRef.current < 300) {
        if (scale > 1) {
          setScale(1);
          setPosition({ x: 0, y: 0 });
        } else {
          setScale(2.5);
        }
        lastTapRef.current = 0;
      } else {
        lastTapRef.current = now;
      }
      isDraggingRef.current = true;
      touchStartRef.current.x = e.touches[0].clientX;
      touchStartRef.current.y = e.touches[0].clientY;
      touchStartRef.current.posX = position.x;
      touchStartRef.current.posY = position.y;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      if (touchStartRef.current.dist > 0) {
        const factor = dist / touchStartRef.current.dist;
        const newScale = Math.min(Math.max(touchStartRef.current.scale * factor, 1), 6);
        setScale(newScale);
        if (newScale === 1) {
          setPosition({ x: 0, y: 0 });
        }
      }
    } else if (e.touches.length === 1 && scale > 1 && isDraggingRef.current) {
      const dx = e.touches[0].clientX - touchStartRef.current.x;
      const dy = e.touches[0].clientY - touchStartRef.current.y;
      setPosition({
        x: touchStartRef.current.posX + dx,
        y: touchStartRef.current.posY + dy
      });
    }
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
    if (scale <= 1) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = -e.deltaY * 0.002;
    const newScale = Math.min(Math.max(scale + delta, 1), 6);
    setScale(newScale);
    if (newScale === 1) {
      setPosition({ x: 0, y: 0 });
    }
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[999999] bg-black flex items-center justify-center overflow-hidden touch-none select-none animate-in fade-in duration-200"
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Tombol kontrol sudut kanan atas: Hanya Ikon Hapus dan X Tutup */}
      <div className="absolute top-5 right-5 sm:top-6 sm:right-6 z-50 flex items-center gap-3">
        {onDelete && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="w-11 h-11 rounded-full bg-black/60 hover:bg-rose-600/90 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-90"
            title="Hapus foto profil"
          >
            <Trash2 className="w-5 h-5 text-white" />
          </button>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="w-11 h-11 rounded-full bg-black/60 hover:bg-white/25 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-90"
          title="Tutup"
        >
          <X className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Gambar layar penuh bersih dengan dukungan pinch & pan */}
      <div
        className="w-full h-full flex items-center justify-center p-0 cursor-grab active:cursor-grabbing transition-transform duration-75"
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0px) scale(${scale})`,
          transformOrigin: 'center center'
        }}
      >
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={name}
            className="w-full h-full object-contain pointer-events-none"
            draggable={false}
          />
        ) : (
          <div className="w-56 h-56 rounded-full bg-gradient-to-tr from-sky-600 to-indigo-600 text-white font-bold text-7xl flex items-center justify-center shadow-2xl">
            {name.charAt(0)}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

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
  const [editNoKk, setEditNoKk] = useState(alumni.noKk || '3507123456780000');
  const [editName, setEditName] = useState(alumni.name);
  const [editTempatLahir, setEditTempatLahir] = useState(alumni.tempatLahir || 'Rembang');
  const [editTanggalLahir, setEditTanggalLahir] = useState(alumni.tanggalLahir || '1998-05-14');
  const [editGender, setEditGender] = useState<'L' | 'P'>(alumni.gender || 'L');
  const [editUrutanAnak, setEditUrutanAnak] = useState<number>(alumni.urutanAnak || 2);
  const [editJumlahSaudara, setEditJumlahSaudara] = useState<number>(alumni.jumlahSaudara || 5);
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
  const [editShareFullAddress, setEditShareFullAddress] = useState(alumni.shareFullAddress !== false);

  // Username Check State
  const [newUsernameInput, setNewUsernameInput] = useState('');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'available' | 'taken'>('idle');
  const checkDebounceRef = useRef<NodeJS.Timeout | null>(null);

  const handleUsernameInputChange = (val: string) => {
    const cleaned = val.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setNewUsernameInput(cleaned);
    if (checkDebounceRef.current) clearTimeout(checkDebounceRef.current);

    if (!cleaned.trim()) {
      setIsCheckingUsername(false);
      setUsernameStatus('idle');
      return;
    }

    setIsCheckingUsername(true);
    checkDebounceRef.current = setTimeout(() => {
      setIsCheckingUsername(false);
      const isTaken = allAlumni.some(
        (a) => a.id !== alumni.id && a.username && a.username.toLowerCase() === cleaned
      );
      setUsernameStatus(isTaken ? 'taken' : 'available');
    }, 450);
  };

  // Riwayat Pendidikan State
  const [editNism, setEditNism] = useState(alumni.nism || '131233170001');
  const [editNisn, setEditNisn] = useState(alumni.nisn || '0012345678');
  const [editEntryYear, setEditEntryYear] = useState(alumni.entryYear || '2014');
  const [editGradYear, setEditGradYear] = useState(alumni.gradYear || '2020');
  const [editEntryDate, setEditEntryDate] = useState(alumni.entryDate || `${alumni.entryYear || '2014'}-07-15`);
  const [editGradDate, setEditGradDate] = useState(alumni.gradDate || `${alumni.gradYear || '2020'}-06-20`);
  const [tempEntryDate, setTempEntryDate] = useState(alumni.entryDate || `${alumni.entryYear || '2014'}-07-15`);
  const [tempGradDate, setTempGradDate] = useState(alumni.gradDate || `${alumni.gradYear || '2020'}-06-20`);
  const [activeDateTab, setActiveDateTab] = useState<'masuk' | 'keluar'>('masuk');

  // Informasi Orang Tua State
  const [editNamaAyah, setEditNamaAyah] = useState(alumni.namaAyah || 'H. Abdul Rasyid');
  const [editNikAyah, setEditNikAyah] = useState(alumni.nikAyah || '3507123456780010');
  const [editPekerjaanAyah, setEditPekerjaanAyah] = useState(alumni.pekerjaanAyah || 'Wiraswasta / Petani');
  const [editPendidikanAyah, setEditPendidikanAyah] = useState(alumni.pendidikanAyah || 'S1 Tarbiyah');

  const [editNamaIbu, setEditNamaIbu] = useState(alumni.namaIbu || 'Hj. Siti Maryam');
  const [editNikIbu, setEditNikIbu] = useState(alumni.nikIbu || '3507123456780020');
  const [editPekerjaanIbu, setEditPekerjaanIbu] = useState(alumni.pekerjaanIbu || 'Ibu Rumah Tangga');
  const [editPendidikanIbu, setEditPendidikanIbu] = useState(alumni.pendidikanIbu || 'Madrasah Aliyah');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [showFullscreenPhoto, setShowFullscreenPhoto] = useState(false);
  const [activeEditModal, setActiveEditModal] = useState<
    'nama' | 'ttl' | 'saudara' | 'nik_kk' | 'alamat' | 'kontak' | 'pekerjaan' | 'bio' | 'tanggal_masuk' | 'tanggal_keluar' | 'ayah' | 'ibu' | 'username' | 'password' | null
  >(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatTanggalIndonesia = (dateStr?: string) => {
    if (!dateStr) return '14 Mei 1998';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const formatTanggalSingkat = (dateStr?: string, fallbackYear?: string) => {
    if (!dateStr && fallbackYear) return fallbackYear;
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return fallbackYear || dateStr;
      return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return fallbackYear || dateStr;
    }
  };

  useEffect(() => {
    setEditNik(alumni.nik);
    setEditNoKk(alumni.noKk || '3507123456780000');
    setEditName(alumni.name);
    setEditTempatLahir(alumni.tempatLahir || 'Rembang');
    setEditTanggalLahir(alumni.tanggalLahir || '1998-05-14');
    setEditGender(alumni.gender || 'L');
    setEditUrutanAnak(alumni.urutanAnak || 2);
    setEditJumlahSaudara(alumni.jumlahSaudara || 5);
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
    setEditShareFullAddress(alumni.shareFullAddress !== false);
    setEditNism(alumni.nism || '131233170001');
    setEditNisn(alumni.nisn || '0012345678');
    setEditEntryYear(alumni.entryYear || '2014');
    setEditGradYear(alumni.gradYear || '2020');
    setEditEntryDate(alumni.entryDate || `${alumni.entryYear || '2014'}-07-15`);
    setEditGradDate(alumni.gradDate || `${alumni.gradYear || '2020'}-06-20`);
    setEditNamaAyah(alumni.namaAyah || 'H. Abdul Rasyid');
    setEditNikAyah(alumni.nikAyah || '3507123456780010');
    setEditPekerjaanAyah(alumni.pekerjaanAyah || 'Wiraswasta / Petani');
    setEditPendidikanAyah(alumni.pendidikanAyah || 'S1 Tarbiyah');
    setEditNamaIbu(alumni.namaIbu || 'Hj. Siti Maryam');
    setEditNikIbu(alumni.nikIbu || '3507123456780020');
    setEditPekerjaanIbu(alumni.pekerjaanIbu || 'Ibu Rumah Tangga');
    setEditPendidikanIbu(alumni.pendidikanIbu || 'Madrasah Aliyah');
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

  // Directory Search State (Persis Kelola Data Alumni di Akun Admin)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAlumniDetail, setSelectedAlumniDetail] = useState<AlumniRecord | null>(null);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [filterEntryFrom, setFilterEntryFrom] = useState('');
  const [filterEntryTo, setFilterEntryTo] = useState('');
  const [filterGradFrom, setFilterGradFrom] = useState('');
  const [filterGradTo, setFilterGradTo] = useState('');
  const [filterProvince, setFilterProvince] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterKecamatan, setFilterKecamatan] = useState('');
  const [filterDesa, setFilterDesa] = useState('');

  const hasActiveFilters = Boolean(
    filterEntryFrom ||
    filterEntryTo ||
    filterGradFrom ||
    filterGradTo ||
    filterProvince ||
    filterCity ||
    filterKecamatan ||
    filterDesa
  );

  const handleResetFilters = () => {
    setFilterEntryFrom('');
    setFilterEntryTo('');
    setFilterGradFrom('');
    setFilterGradTo('');
    setFilterProvince('');
    setFilterCity('');
    setFilterKecamatan('');
    setFilterDesa('');
  };

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
      shareFullAddress: editShareFullAddress,
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

  // Filter list data alumni persis seperti halaman kelola data alumni admin
  const filteredAlumni = allAlumni.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      item.name.toLowerCase().includes(q) ||
      item.nik.includes(q) ||
      item.nis.toLowerCase().includes(q) ||
      (item.username && item.username.toLowerCase().includes(q)) ||
      item.city.toLowerCase().includes(q) ||
      (Boolean(item.kecamatan) && item.kecamatan!.toLowerCase().includes(q)) ||
      (item.shareFullAddress !== false && Boolean(item.desa) && item.desa!.toLowerCase().includes(q)) ||
      item.province.toLowerCase().includes(q) ||
      item.occupation.toLowerCase().includes(q);

    const entryNum = parseInt(item.entryYear, 10);
    const gradNum = parseInt(item.gradYear, 10);

    const matchEntryFrom = !filterEntryFrom || (!isNaN(entryNum) && entryNum >= parseInt(filterEntryFrom, 10));
    const matchEntryTo = !filterEntryTo || (!isNaN(entryNum) && entryNum <= parseInt(filterEntryTo, 10));

    const matchGradFrom = !filterGradFrom || (!isNaN(gradNum) && gradNum >= parseInt(filterGradFrom, 10));
    const matchGradTo = !filterGradTo || (!isNaN(gradNum) && gradNum <= parseInt(filterGradTo, 10));

    const normalizePlace = (val: string) => val.toLowerCase().replace(/^(kota|kabupaten|kab\.)\s+/i, '').trim();

    const matchProvince = !filterProvince || 
      item.province.toLowerCase().includes(filterProvince.toLowerCase()) ||
      filterProvince.toLowerCase().includes(item.province.toLowerCase());

    const matchCity = !filterCity || 
      item.city.toLowerCase().includes(normalizePlace(filterCity)) ||
      normalizePlace(filterCity).includes(item.city.toLowerCase()) ||
      item.city.toLowerCase().includes(filterCity.toLowerCase());

    const matchKecamatan = !filterKecamatan || 
      (Boolean(item.kecamatan) && (
        item.kecamatan!.toLowerCase().includes(filterKecamatan.toLowerCase()) ||
        filterKecamatan.toLowerCase().includes(item.kecamatan!.toLowerCase())
      ));

    const matchDesa = !filterDesa 
      ? true 
      : item.shareFullAddress === false 
        ? false 
        : (Boolean(item.desa) && (
            item.desa!.toLowerCase().includes(filterDesa.toLowerCase()) ||
            filterDesa.toLowerCase().includes(item.desa!.toLowerCase())
          ));

    return (
      matchSearch &&
      matchEntryFrom &&
      matchEntryTo &&
      matchGradFrom &&
      matchGradTo &&
      matchProvince &&
      matchCity &&
      matchKecamatan &&
      matchDesa
    );
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

      {/* BODY SCROLLABLE CONTENT (HEADER BIRU TELAH DIHAPUS DI SEMUA HALAMAN) */}
      <div className={`flex-1 overflow-y-auto ${activeTab === 'profile' || activeTab === 'directory' ? 'p-0 bg-slate-50' : 'px-4 py-4 space-y-4'}`}>
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

        {/* ================= TAB 3: CARI ALUMNI (SAMA PERSIS KELOLA DATA ALUMNI ADMIN) ================= */}
        {activeTab === 'directory' && (
          <div className="p-4 space-y-3 flex-1 overflow-y-auto">
            {/* Search & Filter Button - NOT inside a container */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari NIK, NIS, nama, atau domisili..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-sky-600 focus:outline-none shadow-2xs"
                />
              </div>

              {/* Tombol filter sejajar di samping kanan */}
              <button
                type="button"
                onClick={() => setIsFilterSheetOpen(true)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center shrink-0 ${
                  hasActiveFilters
                    ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
                title="Buka Filter Data"
              >
                <Filter className="w-4 h-4" />
              </button>
            </div>

            {/* Filter Active Indicator & Quick Reset */}
            {hasActiveFilters && (
              <div className="flex items-center justify-between text-[11px] text-sky-800 bg-sky-50 px-3 py-1.5 rounded-xl border border-sky-100">
                <span>Filter aktif diterapkan ({filteredAlumni.length} alumni)</span>
                <button
                  onClick={handleResetFilters}
                  className="font-bold underline text-sky-700 hover:text-sky-900 cursor-pointer"
                >
                  Reset Filter
                </button>
              </div>
            )}

            {/* Daftar Kartu Alumni (Card View) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {filteredAlumni.map((item) => {
                const addressText = item.shareFullAddress === false
                  ? [item.kecamatan, item.city].filter(Boolean).join(', ') || item.city || item.province || 'Alamat disembunyikan'
                  : [item.desa, item.kecamatan, item.city].filter(Boolean).join(', ') || item.province || 'Alamat belum diisi';

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedAlumniDetail(item)}
                    className="bg-white rounded-2xl p-3.5 border border-slate-200/80 hover:border-sky-400 hover:shadow-md transition-all cursor-pointer flex items-center gap-3.5 group relative"
                  >
                    {/* Foto / Avatar */}
                    <div className="relative shrink-0">
                      {item.photoUrl ? (
                        <img
                          src={item.photoUrl}
                          alt={item.name}
                          className="w-12 h-12 rounded-full object-cover border border-slate-100 ring-2 ring-slate-100 group-hover:ring-sky-200 transition-all"
                        />
                      ) : (
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center font-display font-bold text-base shadow-2xs border border-white ring-2 ring-slate-100 group-hover:ring-sky-200 transition-all ${
                            item.gender === 'P'
                              ? 'bg-gradient-to-br from-rose-100 to-pink-200 text-rose-700'
                              : 'bg-gradient-to-br from-sky-100 to-blue-200 text-sky-800'
                          }`}
                        >
                          {item.name.charAt(0)}
                        </div>
                      )}
                    </div>

                    {/* Informasi: Nama & Alamat (Desa, Kecamatan, Kabupaten) */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-display font-bold text-sm text-slate-900 group-hover:text-sky-700 transition-colors truncate">
                          {item.name}
                        </h4>
                        {item.id === alumni.id && (
                          <span className="text-[9px] bg-sky-100 text-sky-700 px-1.5 py-0.2 rounded font-semibold shrink-0">
                            Anda
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 capitalize truncate mt-0.5">
                        {addressText}
                      </p>
                    </div>

                    {/* Chevron Panah Detail */}
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-sky-500 group-hover:translate-x-0.5 transition-all shrink-0 ml-auto" />
                  </div>
                );
              })}
            </div>

            {filteredAlumni.length === 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
                Tidak ditemukan data alumni dengan pencarian yang dipilih.
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 4: PROFILKU (LAYOUT PERSIS SCREENSHOT & BAHASA INDONESIA) ================= */}
        {activeTab === 'profile' && (
          <div className="bg-[#f0f2fb] min-h-full flex flex-col animate-in fade-in duration-150">
            {/* HEADER ATAS: "Profilku" & FOTO PROFIL LINGKARAN DENGAN BADGE PENSIL */}
            <div className="pt-6 pb-4 px-6 text-center flex flex-col items-center">
              <h2 className="font-display font-bold text-lg text-slate-900 tracking-tight">
                Profilku
              </h2>

              <div className="relative inline-block mt-4 mb-2">
                {/* Lingkaran Avatar */}
                <button
                  type="button"
                  onClick={() => setShowFullscreenPhoto(true)}
                  className="w-22 h-22 sm:w-24 sm:h-24 rounded-full ring-4 ring-white shadow-md overflow-hidden bg-slate-200 flex items-center justify-center cursor-pointer group transition-transform active:scale-95"
                  title="Lihat foto profil penuh"
                >
                  {editPhotoUrl ? (
                    <img
                      src={editPhotoUrl}
                      alt={editName || alumni.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-sky-600 to-indigo-600 text-white font-bold text-3xl flex items-center justify-center">
                      {(editName || alumni.name).charAt(0)}
                    </div>
                  )}
                </button>

                {/* Badge Pensil Edit di Sudut Kanan Bawah */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white shadow-md border border-slate-200/80 text-slate-700 hover:text-sky-600 flex items-center justify-center cursor-pointer active:scale-90 transition-all ring-2 ring-white"
                  title="Ganti Foto Profil"
                >
                  <Pencil className="w-4 h-4" />
                </button>

                {/* Input file gambar tersembunyi */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
              </div>
            </div>

            {/* WADAH KARTU PUTIH MELENGKUNG PERSIS SCREENSHOT */}
            <div className="bg-white rounded-t-[36px] shadow-sm px-6 pt-5 pb-24 space-y-6 flex-1 border-t border-slate-200/40">
              {/* SEGMEN 1: INFORMASI PRIBADI */}
              <div>
                <p className="text-xs font-semibold text-slate-400 text-center tracking-wide mb-3">
                  Informasi Pribadi
                </p>

                <div className="divide-y divide-slate-100">
                  {/* 1. Nama Lengkap */}
                  <div
                    onClick={() => setActiveEditModal('nama')}
                    className="flex items-center justify-between py-3.5 cursor-pointer hover:bg-slate-50/70 -mx-3 px-3 rounded-2xl transition-colors group"
                  >
                    <div className="flex items-center gap-4 min-w-0 pr-2">
                      <div className="w-6 flex items-center justify-center shrink-0">
                        <User className="w-5 h-5 text-slate-700" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] text-slate-400 font-medium leading-tight">Nama Lengkap</p>
                        <p className="text-sm font-semibold text-slate-800 truncate mt-0.5">
                          {editName || alumni.name}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  </div>

                  {/* 2. Tempat, Tanggal Lahir (TTL) */}
                  <div
                    onClick={() => setActiveEditModal('ttl')}
                    className="flex items-center justify-between py-3.5 cursor-pointer hover:bg-slate-50/70 -mx-3 px-3 rounded-2xl transition-colors group"
                  >
                    <div className="flex items-center gap-4 min-w-0 pr-2">
                      <div className="w-6 flex items-center justify-center shrink-0">
                        <Calendar className="w-5 h-5 text-slate-700" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] text-slate-400 font-medium leading-tight">Tempat, Tanggal Lahir (TTL)</p>
                        <p className="text-sm font-semibold text-slate-800 truncate mt-0.5">
                          {editTempatLahir || 'Rembang'}, {formatTanggalIndonesia(editTanggalLahir)}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  </div>

                  {/* 3. Gender & Saudara */}
                  <div
                    onClick={() => setActiveEditModal('saudara')}
                    className="flex items-center justify-between py-3.5 cursor-pointer hover:bg-slate-50/70 -mx-3 px-3 rounded-2xl transition-colors group"
                  >
                    <div className="flex items-center gap-4 min-w-0 pr-2">
                      <div className="w-6 flex items-center justify-center shrink-0">
                        <Users className="w-5 h-5 text-slate-700" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] text-slate-400 font-medium leading-tight">Gender & Saudara</p>
                        <p className="text-sm font-semibold text-slate-800 truncate mt-0.5">
                          {editGender === 'L' ? 'Laki-laki' : 'Perempuan'}, anak ke-{editUrutanAnak || 2} dari {editJumlahSaudara || 5} saudara
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  </div>

                  {/* 4. NIK & Nomor KK */}
                  <div
                    onClick={() => setActiveEditModal('nik_kk')}
                    className="flex items-center justify-between py-3.5 cursor-pointer hover:bg-slate-50/70 -mx-3 px-3 rounded-2xl transition-colors group"
                  >
                    <div className="flex items-center gap-4 min-w-0 pr-2">
                      <div className="w-6 flex items-center justify-center shrink-0">
                        <CreditCard className="w-5 h-5 text-slate-700" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] text-slate-400 font-medium leading-tight">NIK & No. KK</p>
                        <p className="text-sm font-semibold text-slate-800 truncate mt-0.5">
                          {editNik || alumni.nik} · {editNoKk || '3507123456780000'}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  </div>

                  {/* 5. Alamat */}
                  <div
                    onClick={() => setActiveEditModal('alamat')}
                    className="flex items-center justify-between py-3.5 cursor-pointer hover:bg-slate-50/70 -mx-3 px-3 rounded-2xl transition-colors group"
                  >
                    <div className="flex items-center gap-4 min-w-0 pr-2">
                      <div className="w-6 flex items-center justify-center shrink-0">
                        <MapPin className="w-5 h-5 text-slate-700" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] text-slate-400 font-medium leading-tight">Alamat & Titik Domisili</p>
                        <p className="text-sm font-semibold text-slate-800 truncate mt-0.5">
                          {!editShareFullAddress
                            ? [editKecamatan || alumni.kecamatan, editCity || alumni.city].filter(Boolean).join(', ') || 'Kecamatan & Kota/Kabupaten'
                            : [editAlamatLengkap || alumni.alamatLengkap, editDesa || alumni.desa, editKecamatan || alumni.kecamatan, editCity || alumni.city, editProvince || alumni.province].filter(Boolean).join(', ') || 'Atur alamat & titik domisili'}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  </div>

                  {/* 6. Kontak */}
                  <div
                    onClick={() => setActiveEditModal('kontak')}
                    className="flex items-center justify-between py-3.5 cursor-pointer hover:bg-slate-50/70 -mx-3 px-3 rounded-2xl transition-colors group"
                  >
                    <div className="flex items-center gap-4 min-w-0 pr-2">
                      <div className="w-6 flex items-center justify-center shrink-0">
                        <Phone className="w-5 h-5 text-slate-700" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] text-slate-400 font-medium leading-tight">Kontak WhatsApp & Email</p>
                        <p className="text-sm font-semibold text-slate-800 truncate mt-0.5">
                          {editPhone || alumni.phone} · {editEmail || alumni.email}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  </div>

                  {/* 7. Pekerjaan */}
                  <div
                    onClick={() => setActiveEditModal('pekerjaan')}
                    className="flex items-center justify-between py-3.5 cursor-pointer hover:bg-slate-50/70 -mx-3 px-3 rounded-2xl transition-colors group"
                  >
                    <div className="flex items-center gap-4 min-w-0 pr-2">
                      <div className="w-6 flex items-center justify-center shrink-0">
                        <Briefcase className="w-5 h-5 text-slate-700" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] text-slate-400 font-medium leading-tight">Pekerjaan & Instansi</p>
                        <p className="text-sm font-semibold text-slate-800 truncate mt-0.5">
                          {editOccupation || alumni.occupation || 'Alumni Pesantren'}
                          {editInstitution || alumni.institution ? ` · ${editInstitution || alumni.institution}` : ''}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  </div>

                  {/* 8. Bio */}
                  <div
                    onClick={() => setActiveEditModal('bio')}
                    className="flex items-center justify-between py-3.5 cursor-pointer hover:bg-slate-50/70 -mx-3 px-3 rounded-2xl transition-colors group"
                  >
                    <div className="flex items-center gap-4 min-w-0 pr-2">
                      <div className="w-6 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-slate-700" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] text-slate-400 font-medium leading-tight">Bio</p>
                        <p className="text-sm font-semibold text-slate-800 truncate mt-0.5">
                          {editBio || alumni.bio || 'Tulis bio atau catatan singkat...'}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>

              {/* SEGMEN 2: RIWAYAT PENDIDIKAN */}
              <div>
                <p className="text-xs font-semibold text-slate-400 text-center tracking-wide mb-3">
                  Riwayat Pendidikan
                </p>

                <div className="divide-y divide-slate-100">
                  {/* 1. NIS (Terkunci / Warna Mati / Tidak Bereaksi Saat Diklik) */}
                  <div className="flex items-center justify-between py-3.5 -mx-3 px-3 rounded-2xl cursor-default select-none opacity-45">
                    <div className="flex items-center gap-4 min-w-0 pr-2">
                      <div className="w-6 flex items-center justify-center shrink-0">
                        <GraduationCap className="w-5 h-5 text-slate-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] text-slate-400 font-medium leading-tight">NIS (Nomor Induk Santri)</p>
                        <p className="text-sm font-semibold font-mono text-slate-500 truncate mt-0.5">
                          {alumni.nis}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 2. NISM (Terkunci / Warna Mati / Tidak Bereaksi Saat Diklik) */}
                  <div className="flex items-center justify-between py-3.5 -mx-3 px-3 rounded-2xl cursor-default select-none opacity-45">
                    <div className="flex items-center gap-4 min-w-0 pr-2">
                      <div className="w-6 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-slate-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] text-slate-400 font-medium leading-tight">NISM (Nomor Induk Santri Madrasah)</p>
                        <p className="text-sm font-semibold font-mono text-slate-500 truncate mt-0.5">
                          {editNism || alumni.nism || '131233170001'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 3. NISN (Terkunci / Warna Mati / Tidak Bereaksi Saat Diklik) */}
                  <div className="flex items-center justify-between py-3.5 -mx-3 px-3 rounded-2xl cursor-default select-none opacity-45">
                    <div className="flex items-center gap-4 min-w-0 pr-2">
                      <div className="w-6 flex items-center justify-center shrink-0">
                        <FileCheck className="w-5 h-5 text-slate-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] text-slate-400 font-medium leading-tight">NISN (Nomor Induk Siswa Nasional)</p>
                        <p className="text-sm font-semibold font-mono text-slate-500 truncate mt-0.5">
                          {editNisn || alumni.nisn || '0012345678'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 4. Tanggal Masuk */}
                  <div
                    onClick={() => {
                      setTempEntryDate(editEntryDate || `${editEntryYear || '2014'}-07-15`);
                      setActiveEditModal('tanggal_masuk');
                    }}
                    className="flex items-center justify-between py-3.5 cursor-pointer hover:bg-slate-50/70 -mx-3 px-3 rounded-2xl transition-colors group"
                  >
                    <div className="flex items-center gap-4 min-w-0 pr-2">
                      <div className="w-6 flex items-center justify-center shrink-0">
                        <Clock className="w-5 h-5 text-sky-700" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] text-slate-400 font-medium leading-tight">Tanggal Masuk</p>
                        <p className="text-sm font-semibold text-slate-800 truncate mt-0.5">
                          {formatTanggalSingkat(editEntryDate, editEntryYear) || 'Atur tanggal masuk'}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  </div>

                  {/* 5. Tanggal Keluar */}
                  <div
                    onClick={() => {
                      setTempGradDate(editGradDate || `${editGradYear || '2020'}-06-20`);
                      setActiveEditModal('tanggal_keluar');
                    }}
                    className="flex items-center justify-between py-3.5 cursor-pointer hover:bg-slate-50/70 -mx-3 px-3 rounded-2xl transition-colors group"
                  >
                    <div className="flex items-center gap-4 min-w-0 pr-2">
                      <div className="w-6 flex items-center justify-center shrink-0">
                        <Clock className="w-5 h-5 text-sky-700" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] text-slate-400 font-medium leading-tight">Tanggal Keluar</p>
                        <p className="text-sm font-semibold text-slate-800 truncate mt-0.5">
                          {formatTanggalSingkat(editGradDate, editGradYear) || 'Atur tanggal keluar'}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>

              {/* SEGMEN 3: INFORMASI ORANG TUA */}
              <div>
                <p className="text-xs font-semibold text-slate-400 text-center tracking-wide mb-3">
                  Informasi Orang Tua
                </p>

                <div className="divide-y divide-slate-100">
                  {/* 1. Data Ayah */}
                  <div
                    onClick={() => setActiveEditModal('ayah')}
                    className="flex items-center justify-between py-3.5 cursor-pointer hover:bg-slate-50/70 -mx-3 px-3 rounded-2xl transition-colors group"
                  >
                    <div className="flex items-center gap-4 min-w-0 pr-2">
                      <div className="w-6 flex items-center justify-center shrink-0">
                        <User className="w-5 h-5 text-slate-700" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] text-slate-400 font-medium leading-tight">Data Ayah Kandung</p>
                        <p className="text-sm font-semibold text-slate-800 truncate mt-0.5">
                          {editNamaAyah || alumni.namaAyah || 'H. Abdul Rasyid'} · {editPekerjaanAyah || alumni.pekerjaanAyah || 'Wiraswasta'}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  </div>

                  {/* 2. Data Ibu (Icon User sama seperti Ayah) */}
                  <div
                    onClick={() => setActiveEditModal('ibu')}
                    className="flex items-center justify-between py-3.5 cursor-pointer hover:bg-slate-50/70 -mx-3 px-3 rounded-2xl transition-colors group"
                  >
                    <div className="flex items-center gap-4 min-w-0 pr-2">
                      <div className="w-6 flex items-center justify-center shrink-0">
                        <User className="w-5 h-5 text-slate-700" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] text-slate-400 font-medium leading-tight">Data Ibu Kandung</p>
                        <p className="text-sm font-semibold text-slate-800 truncate mt-0.5">
                          {editNamaIbu || alumni.namaIbu || 'Hj. Siti Maryam'} · {editPekerjaanIbu || alumni.pekerjaanIbu || 'Ibu Rumah Tangga'}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>

              {/* SEGMEN 4: PENGATURAN AKUN */}
              <div>
                <p className="text-xs font-semibold text-slate-400 text-center tracking-wide mb-3">
                  Pengaturan Akun
                </p>

                <div className="divide-y divide-slate-100">
                  {/* 1. Ganti Username */}
                  <div
                    onClick={() => {
                      setNewUsernameInput('');
                      setUsernameStatus('idle');
                      setActiveEditModal('username');
                    }}
                    className="flex items-center justify-between py-3.5 cursor-pointer hover:bg-slate-50/70 -mx-3 px-3 rounded-2xl transition-colors group"
                  >
                    <div className="flex items-center gap-4 min-w-0 pr-2">
                      <div className="w-6 flex items-center justify-center shrink-0">
                        <AtSign className="w-5 h-5 text-slate-700" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 leading-tight">Ganti Username</p>
                        <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                          {editUsername || alumni.username ? `@${editUsername || alumni.username}` : 'Belum diatur'}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  </div>

                  {/* 2. Ganti Kata Sandi */}
                  <div
                    onClick={() => setActiveEditModal('password')}
                    className="flex items-center justify-between py-3.5 cursor-pointer hover:bg-slate-50/70 -mx-3 px-3 rounded-2xl transition-colors group"
                  >
                    <div className="flex items-center gap-4 min-w-0 pr-2">
                      <div className="w-6 flex items-center justify-center shrink-0">
                        <KeyRound className="w-5 h-5 text-slate-700" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 leading-tight">Ganti Kata Sandi</p>
                        <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                          {alumni.isPasswordChanged ? 'Sudah pernah diubah' : 'Atur atau perbarui kata sandi akun'}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  </div>

                  {/* 3. Toggle Izinkan Alamat Lengkap Ditampilkan (BERSIH TANPA KETERANGAN APAPUN) */}
                  <div className="flex items-center justify-between py-3.5 -mx-3 px-3 rounded-2xl">
                    <div className="flex items-center gap-4 min-w-0 pr-3">
                      <div className="w-6 flex items-center justify-center shrink-0">
                        <MapPin className="w-5 h-5 text-sky-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 leading-tight">Izinkan Alamat Lengkap Ditampilkan</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const nextVal = !editShareFullAddress;
                        setEditShareFullAddress(nextVal);
                        onUpdateProfile({ shareFullAddress: nextVal });
                      }}
                      className={`w-12 h-7 rounded-full p-0.5 transition-colors relative cursor-pointer shrink-0 ${
                        editShareFullAddress ? 'bg-[#2563eb]' : 'bg-slate-300'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                          editShareFullAddress ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* 4. Toggle Izinkan Nomor WA Ditampilkan */}
                  <div className="flex items-center justify-between py-3.5 -mx-3 px-3 rounded-2xl">
                    <div className="flex items-center gap-4 min-w-0 pr-3">
                      <div className="w-6 flex items-center justify-center shrink-0">
                        <MessageCircle className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 leading-tight">Izinkan Nomor WA Ditampilkan</p>
                        <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                          Tampilkan nomor WhatsApp pada pencarian sesama alumni
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const nextVal = !editShareContact;
                        setEditShareContact(nextVal);
                        onUpdateProfile({ shareContact: nextVal });
                        triggerToast(nextVal ? 'Izin nomor WhatsApp aktif' : 'Izin nomor WhatsApp dinonaktifkan');
                      }}
                      className={`w-12 h-7 rounded-full p-0.5 transition-colors relative cursor-pointer shrink-0 ${
                        editShareContact ? 'bg-[#2563eb]' : 'bg-slate-300'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                          editShareContact ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* 5. Keluar dari Akun (Logout) */}
                  <div
                    onClick={onLogout}
                    className="flex items-center justify-between py-3.5 cursor-pointer hover:bg-rose-50/70 -mx-3 px-3 rounded-2xl transition-colors group"
                  >
                    <div className="flex items-center gap-4 min-w-0 pr-2">
                      <div className="w-6 flex items-center justify-center shrink-0">
                        <LogOut className="w-5 h-5 text-rose-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-rose-600 leading-tight">Keluar dari Akun</p>
                        <p className="text-[11px] text-slate-400 leading-tight mt-0.5">Akhiri sesi login di perangkat ini</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            </div>

            {/* ================= EDIT MODAL: NAMA LENGKAP ================= */}
            {activeEditModal === 'nama' && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in" onClick={() => setActiveEditModal(null)}>
                <div className="bg-white rounded-3xl p-5 w-full max-w-sm space-y-4 shadow-2xl border border-slate-100" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
                    <h3 className="font-bold text-sm text-slate-900">Ubah Nama Lengkap</h3>
                    <button type="button" onClick={() => setActiveEditModal(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X className="w-4 h-4" /></button>
                  </div>
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap</label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
                        placeholder="Nama lengkap..."
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button type="button" onClick={() => setActiveEditModal(null)} className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs cursor-pointer">Batal</button>
                    <button type="button" onClick={() => { onUpdateProfile({ name: editName }); setActiveEditModal(null); triggerToast('Nama berhasil diperbarui'); }} className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer">Simpan</button>
                  </div>
                </div>
              </div>
            )}

            {/* ================= EDIT MODAL: TEMPAT TANGGAL LAHIR ================= */}
            {activeEditModal === 'ttl' && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in" onClick={() => setActiveEditModal(null)}>
                <div className="bg-white rounded-3xl p-5 w-full max-w-sm space-y-4 shadow-2xl border border-slate-100" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
                    <h3 className="font-bold text-sm text-slate-900">Ubah Tempat & Tanggal Lahir</h3>
                    <button type="button" onClick={() => setActiveEditModal(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X className="w-4 h-4" /></button>
                  </div>
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Tempat Lahir (Kota/Kabupaten)</label>
                      <input type="text" value={editTempatLahir} onChange={(e) => setEditTempatLahir(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs" placeholder="Contoh: Rembang" />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Tanggal Lahir</label>
                      <input type="date" value={editTanggalLahir} onChange={(e) => setEditTanggalLahir(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs" />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button type="button" onClick={() => setActiveEditModal(null)} className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs cursor-pointer">Batal</button>
                    <button type="button" onClick={() => { onUpdateProfile({ tempatLahir: editTempatLahir, tanggalLahir: editTanggalLahir }); setActiveEditModal(null); triggerToast('TTL berhasil diperbarui'); }} className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer">Simpan</button>
                  </div>
                </div>
              </div>
            )}

            {/* ================= EDIT MODAL: GENDER & SAUDARA ================= */}
            {activeEditModal === 'saudara' && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in" onClick={() => setActiveEditModal(null)}>
                <div className="bg-white rounded-3xl p-5 w-full max-w-sm space-y-4 shadow-2xl border border-slate-100" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
                    <h3 className="font-bold text-sm text-slate-900">Ubah Gender & Saudara</h3>
                    <button type="button" onClick={() => setActiveEditModal(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X className="w-4 h-4" /></button>
                  </div>
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Jenis Kelamin</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setEditGender('L')}
                          className={`py-2 rounded-xl font-semibold border text-xs cursor-pointer transition-all ${
                            editGender === 'L' ? 'bg-sky-50 border-sky-600 text-sky-700 ring-2 ring-sky-500/20' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          Laki-laki
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditGender('P')}
                          className={`py-2 rounded-xl font-semibold border text-xs cursor-pointer transition-all ${
                            editGender === 'P' ? 'bg-rose-50 border-rose-600 text-rose-700 ring-2 ring-rose-500/20' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          Perempuan
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Anak Ke-</label>
                        <input
                          type="number"
                          min={1}
                          max={25}
                          value={editUrutanAnak}
                          onChange={(e) => setEditUrutanAnak(parseInt(e.target.value) || 1)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Jumlah Saudara</label>
                        <input
                          type="number"
                          min={1}
                          max={25}
                          value={editJumlahSaudara}
                          onChange={(e) => setEditJumlahSaudara(parseInt(e.target.value) || 1)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button type="button" onClick={() => setActiveEditModal(null)} className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs cursor-pointer">Batal</button>
                    <button type="button" onClick={() => { onUpdateProfile({ gender: editGender, urutanAnak: editUrutanAnak, jumlahSaudara: editJumlahSaudara }); setActiveEditModal(null); triggerToast('Status keluarga berhasil diperbarui'); }} className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer">Simpan</button>
                  </div>
                </div>
              </div>
            )}

            {/* ================= EDIT MODAL: NIK & NOMOR KK ================= */}
            {activeEditModal === 'nik_kk' && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in" onClick={() => setActiveEditModal(null)}>
                <div className="bg-white rounded-3xl p-5 w-full max-w-sm space-y-4 shadow-2xl border border-slate-100" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
                    <h3 className="font-bold text-sm text-slate-900">Ubah NIK & Nomor Kartu Keluarga</h3>
                    <button type="button" onClick={() => setActiveEditModal(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X className="w-4 h-4" /></button>
                  </div>
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Nomor Induk Kependudukan (NIK)</label>
                      <input
                        type="text"
                        maxLength={16}
                        value={editNik}
                        onChange={(e) => setEditNik(e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                        placeholder="16 digit NIK KTP"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Nomor Kartu Keluarga (No. KK)</label>
                      <input
                        type="text"
                        maxLength={16}
                        value={editNoKk}
                        onChange={(e) => setEditNoKk(e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                        placeholder="16 digit Nomor KK"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button type="button" onClick={() => setActiveEditModal(null)} className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs cursor-pointer">Batal</button>
                    <button type="button" onClick={() => { onUpdateProfile({ nik: editNik, noKk: editNoKk }); setActiveEditModal(null); triggerToast('NIK & No. KK berhasil disimpan'); }} className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer">Simpan</button>
                  </div>
                </div>
              </div>
            )}

            {/* ================= EDIT MODAL: KONTAK ================= */}
            {activeEditModal === 'kontak' && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in" onClick={() => setActiveEditModal(null)}>
                <div className="bg-white rounded-3xl p-5 w-full max-w-sm space-y-4 shadow-2xl border border-slate-100" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
                    <h3 className="font-bold text-sm text-slate-900">Ubah Kontak WhatsApp & Email</h3>
                    <button type="button" onClick={() => setActiveEditModal(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X className="w-4 h-4" /></button>
                  </div>
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Nomor WhatsApp / HP</label>
                      <input
                        type="tel"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                        placeholder="08xxxxxxxxxx"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Alamat Email</label>
                      <input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
                        placeholder="nama@email.com"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button type="button" onClick={() => setActiveEditModal(null)} className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs cursor-pointer">Batal</button>
                    <button type="button" onClick={() => { onUpdateProfile({ phone: editPhone, email: editEmail }); setActiveEditModal(null); triggerToast('Kontak berhasil diperbarui'); }} className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer">Simpan</button>
                  </div>
                </div>
              </div>
            )}

            {/* ================= EDIT MODAL: PEKERJAAN ================= */}
            {activeEditModal === 'pekerjaan' && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in" onClick={() => setActiveEditModal(null)}>
                <div className="bg-white rounded-3xl p-5 w-full max-w-sm space-y-4 shadow-2xl border border-slate-100" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
                    <h3 className="font-bold text-sm text-slate-900">Ubah Pekerjaan & Instansi</h3>
                    <button type="button" onClick={() => setActiveEditModal(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X className="w-4 h-4" /></button>
                  </div>
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Profesi / Pekerjaan</label>
                      <input
                        type="text"
                        value={editOccupation}
                        onChange={(e) => setEditOccupation(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
                        placeholder="Guru / Wiraswasta / Pegawai"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Instansi / Lembaga / Usaha</label>
                      <input
                        type="text"
                        value={editInstitution}
                        onChange={(e) => setEditInstitution(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
                        placeholder="Nama tempat bekerja atau usaha"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button type="button" onClick={() => setActiveEditModal(null)} className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs cursor-pointer">Batal</button>
                    <button type="button" onClick={() => { onUpdateProfile({ occupation: editOccupation, institution: editInstitution }); setActiveEditModal(null); triggerToast('Pekerjaan berhasil diperbarui'); }} className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer">Simpan</button>
                  </div>
                </div>
              </div>
            )}

            {/* ================= EDIT MODAL: BIO ================= */}
            {activeEditModal === 'bio' && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in" onClick={() => setActiveEditModal(null)}>
                <div className="bg-white rounded-3xl p-5 w-full max-w-sm space-y-4 shadow-2xl border border-slate-100" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
                    <h3 className="font-bold text-sm text-slate-900">Ubah Bio</h3>
                    <button type="button" onClick={() => setActiveEditModal(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X className="w-4 h-4" /></button>
                  </div>
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Bio / Catatan Singkat</label>
                      <textarea
                        rows={3}
                        value={editBio}
                        onChange={(e) => setEditBio(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
                        placeholder="Tulis pesan atau bio singkat Anda..."
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button type="button" onClick={() => setActiveEditModal(null)} className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs cursor-pointer hover:bg-slate-50">Batal</button>
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateProfile({ bio: editBio });
                        setActiveEditModal(null);
                        triggerToast('Bio berhasil diperbarui');
                      }}
                      className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer"
                    >
                      Simpan
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ================= EDIT MODAL: TANGGAL MASUK (DATE WHEEL PICKER BERSIH) ================= */}
            {activeEditModal === 'tanggal_masuk' && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in" onClick={() => setActiveEditModal(null)}>
                <div className="bg-white rounded-3xl p-5 w-full max-w-sm space-y-4 shadow-2xl border border-slate-100" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
                    <h3 className="font-bold text-sm text-slate-900">Tanggal Masuk</h3>
                    <button type="button" onClick={() => setActiveEditModal(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X className="w-4 h-4" /></button>
                  </div>
                  
                  {/* Date Wheel Picker tanpa keterangan apapun */}
                  <DateWheelPicker
                    value={tempEntryDate}
                    onChange={(newVal) => setTempEntryDate(newVal)}
                  />

                  <div className="flex gap-2 pt-2">
                    <button type="button" onClick={() => setActiveEditModal(null)} className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs cursor-pointer hover:bg-slate-50">Batal</button>
                    <button
                      type="button"
                      disabled={tempEntryDate === editEntryDate}
                      onClick={() => {
                        if (tempEntryDate === editEntryDate) return;
                        setEditEntryDate(tempEntryDate);
                        const yr = tempEntryDate.split('-')[0] || editEntryYear;
                        setEditEntryYear(yr);
                        onUpdateProfile({ entryDate: tempEntryDate, entryYear: yr });
                        setActiveEditModal(null);
                        triggerToast('Tanggal masuk berhasil diperbarui');
                      }}
                      className={`flex-1 py-2 rounded-xl text-white font-bold text-xs transition-colors ${
                        tempEntryDate === editEntryDate
                          ? 'bg-blue-300 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                      }`}
                    >
                      Simpan
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ================= EDIT MODAL: TANGGAL KELUAR (DATE WHEEL PICKER BERSIH) ================= */}
            {activeEditModal === 'tanggal_keluar' && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in" onClick={() => setActiveEditModal(null)}>
                <div className="bg-white rounded-3xl p-5 w-full max-w-sm space-y-4 shadow-2xl border border-slate-100" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
                    <h3 className="font-bold text-sm text-slate-900">Tanggal Keluar</h3>
                    <button type="button" onClick={() => setActiveEditModal(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X className="w-4 h-4" /></button>
                  </div>
                  
                  {/* Date Wheel Picker tanpa keterangan apapun */}
                  <DateWheelPicker
                    value={tempGradDate}
                    onChange={(newVal) => setTempGradDate(newVal)}
                  />

                  <div className="flex gap-2 pt-2">
                    <button type="button" onClick={() => setActiveEditModal(null)} className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs cursor-pointer hover:bg-slate-50">Batal</button>
                    <button
                      type="button"
                      disabled={tempGradDate === editGradDate}
                      onClick={() => {
                        if (tempGradDate === editGradDate) return;
                        setEditGradDate(tempGradDate);
                        const yr = tempGradDate.split('-')[0] || editGradYear;
                        setEditGradYear(yr);
                        onUpdateProfile({ gradDate: tempGradDate, gradYear: yr });
                        setActiveEditModal(null);
                        triggerToast('Tanggal keluar berhasil diperbarui');
                      }}
                      className={`flex-1 py-2 rounded-xl text-white font-bold text-xs transition-colors ${
                        tempGradDate === editGradDate
                          ? 'bg-blue-300 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                      }`}
                    >
                      Simpan
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ================= MODAL INFO: NIS, NISM, NISN (TERKUNCI) ================= */}
            {activeEditModal === 'pendidikan_info' && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in" onClick={() => setActiveEditModal(null)}>
                <div className="bg-white rounded-3xl p-5 w-full max-w-sm space-y-4 shadow-2xl border border-slate-100" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
                    <h3 className="font-bold text-sm text-slate-900">Data Induk Registrasi Santri</h3>
                    <button type="button" onClick={() => setActiveEditModal(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X className="w-4 h-4" /></button>
                  </div>
                  <div className="space-y-2.5 text-xs">
                    <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-medium">NIS Pesantren:</span>
                        <span className="font-mono font-bold text-slate-800">{alumni.nis}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-medium">NISM Madrasah:</span>
                        <span className="font-mono font-bold text-slate-800">{editNism || alumni.nism || '131233170001'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-medium">NISN Nasional:</span>
                        <span className="font-mono font-bold text-slate-800">{editNisn || alumni.nisn || '0012345678'}</span>
                      </div>
                    </div>
                    <div className="p-2.5 bg-amber-50 border border-amber-200/80 rounded-2xl text-[11px] text-amber-800 flex items-start gap-2">
                      <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>Nomor registrasi santri diterbitkan resmi oleh Sekretariat Pondok Pesantren At-taroqqy dan Kemenag RI sehingga tidak dapat diubah sembarangan oleh akun mandiri.</span>
                    </div>
                  </div>
                  <button type="button" onClick={() => setActiveEditModal(null)} className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer">Tutup</button>
                </div>
              </div>
            )}

            {/* ================= EDIT MODAL: INFORMASI AYAH ================= */}
            {activeEditModal === 'ayah' && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in" onClick={() => setActiveEditModal(null)}>
                <div className="bg-white rounded-3xl p-5 w-full max-w-sm space-y-4 shadow-2xl border border-slate-100" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
                    <h3 className="font-bold text-sm text-slate-900">Ubah Informasi Ayah Kandung</h3>
                    <button type="button" onClick={() => setActiveEditModal(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X className="w-4 h-4" /></button>
                  </div>
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap Ayah</label>
                      <input
                        type="text"
                        value={editNamaAyah}
                        onChange={(e) => setEditNamaAyah(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
                        placeholder="Nama lengkap ayah"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">NIK Ayah (16 digit)</label>
                      <input
                        type="text"
                        maxLength={16}
                        value={editNikAyah}
                        onChange={(e) => setEditNikAyah(e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                        placeholder="NIK KTP Ayah"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Pekerjaan Ayah</label>
                      <input
                        type="text"
                        value={editPekerjaanAyah}
                        onChange={(e) => setEditPekerjaanAyah(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
                        placeholder="Petani / Guru / Wiraswasta"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Pendidikan Terakhir Ayah</label>
                      <input
                        type="text"
                        value={editPendidikanAyah}
                        onChange={(e) => setEditPendidikanAyah(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
                        placeholder="SMA / S1 / Pesantren"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button type="button" onClick={() => setActiveEditModal(null)} className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs cursor-pointer">Batal</button>
                    <button type="button" onClick={() => { onUpdateProfile({ namaAyah: editNamaAyah, nikAyah: editNikAyah, pekerjaanAyah: editPekerjaanAyah, pendidikanAyah: editPendidikanAyah }); setActiveEditModal(null); triggerToast('Data ayah berhasil disimpan'); }} className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer">Simpan</button>
                  </div>
                </div>
              </div>
            )}

            {/* ================= EDIT MODAL: INFORMASI IBU ================= */}
            {activeEditModal === 'ibu' && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in" onClick={() => setActiveEditModal(null)}>
                <div className="bg-white rounded-3xl p-5 w-full max-w-sm space-y-4 shadow-2xl border border-slate-100" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
                    <h3 className="font-bold text-sm text-slate-900">Ubah Informasi Ibu Kandung</h3>
                    <button type="button" onClick={() => setActiveEditModal(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X className="w-4 h-4" /></button>
                  </div>
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap Ibu</label>
                      <input
                        type="text"
                        value={editNamaIbu}
                        onChange={(e) => setEditNamaIbu(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
                        placeholder="Nama lengkap ibu"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">NIK Ibu (16 digit)</label>
                      <input
                        type="text"
                        maxLength={16}
                        value={editNikIbu}
                        onChange={(e) => setEditNikIbu(e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                        placeholder="NIK KTP Ibu"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Pekerjaan Ibu</label>
                      <input
                        type="text"
                        value={editPekerjaanIbu}
                        onChange={(e) => setEditPekerjaanIbu(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
                        placeholder="Ibu Rumah Tangga / Guru / Wiraswasta"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Pendidikan Terakhir Ibu</label>
                      <input
                        type="text"
                        value={editPendidikanIbu}
                        onChange={(e) => setEditPendidikanIbu(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
                        placeholder="SMA / S1 / Pesantren"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button type="button" onClick={() => setActiveEditModal(null)} className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs cursor-pointer">Batal</button>
                    <button type="button" onClick={() => { onUpdateProfile({ namaIbu: editNamaIbu, nikIbu: editNikIbu, pekerjaanIbu: editPekerjaanIbu, pendidikanIbu: editPendidikanIbu }); setActiveEditModal(null); triggerToast('Data ibu berhasil disimpan'); }} className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer">Simpan</button>
                  </div>
                </div>
              </div>
            )}

            {/* ================= EDIT MODAL: USERNAME ================= */}
            {activeEditModal === 'username' && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in" onClick={() => setActiveEditModal(null)}>
                <div className="bg-white rounded-3xl p-5 w-full max-w-sm space-y-4 shadow-2xl border border-slate-100" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
                    <h3 className="font-bold text-sm text-slate-900">Ganti Username</h3>
                    <button
                      type="button"
                      onClick={() => {
                        setNewUsernameInput('');
                        setUsernameStatus('idle');
                        setActiveEditModal(null);
                      }}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-3.5 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Username Saat Ini</label>
                      <div className="px-3.5 py-2.5 bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 select-all border border-slate-200/60">
                        {editUsername || alumni.username ? `@${editUsername || alumni.username}` : 'Belum diatur'}
                      </div>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Username Baru</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-slate-400 font-bold">@</span>
                        <input
                          type="text"
                          value={newUsernameInput}
                          onChange={(e) => handleUsernameInputChange(e.target.value)}
                          className="w-full pl-7 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
                          placeholder="username_baru"
                        />
                        <div className="absolute right-3 top-2.5 flex items-center justify-center">
                          {isCheckingUsername && (
                            <Loader2 className="w-4 h-4 text-sky-600 animate-spin" />
                          )}
                          {!isCheckingUsername && usernameStatus === 'available' && (
                            <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}
                          {!isCheckingUsername && usernameStatus === 'taken' && (
                            <div className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center">
                              <X className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}
                        </div>
                      </div>
                      {usernameStatus === 'taken' && (
                        <p className="text-[11px] text-rose-600 mt-1 font-medium">Username sudah digunakan</p>
                      )}
                      {usernameStatus === 'available' && (
                        <p className="text-[11px] text-emerald-600 mt-1 font-medium">Username tersedia</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setNewUsernameInput('');
                        setUsernameStatus('idle');
                        setActiveEditModal(null);
                      }}
                      className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs cursor-pointer hover:bg-slate-50"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      disabled={isCheckingUsername || usernameStatus === 'taken' || !newUsernameInput.trim()}
                      onClick={() => {
                        if (!newUsernameInput.trim()) return;
                        if (usernameStatus === 'taken') {
                          triggerToast('Username sudah dipakai');
                          return;
                        }
                        setEditUsername(newUsernameInput.trim());
                        onUpdateProfile({ username: newUsernameInput.trim() });
                        setActiveEditModal(null);
                        setNewUsernameInput('');
                        setUsernameStatus('idle');
                        triggerToast('Username berhasil diperbarui');
                      }}
                      className={`flex-1 py-2 rounded-xl text-white font-bold text-xs transition-colors ${
                        isCheckingUsername || usernameStatus === 'taken' || !newUsernameInput.trim()
                          ? 'bg-blue-300 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                      }`}
                    >
                      Simpan
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ================= EDIT MODAL: ALAMAT & DOMISILI ================= */}
            {activeEditModal === 'alamat' && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in" onClick={() => setActiveEditModal(null)}>
                <div className="bg-white rounded-3xl p-5 w-full max-w-lg max-h-[88vh] overflow-y-auto space-y-4 shadow-2xl border border-slate-100" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
                    <h3 className="font-bold text-sm text-slate-900">Alamat & Titik Domisili</h3>
                    <button type="button" onClick={() => setActiveEditModal(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X className="w-4 h-4" /></button>
                  </div>
                  <div className="text-xs">
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
                  <div className="flex gap-2 pt-2 border-t border-slate-100">
                    <button type="button" onClick={() => setActiveEditModal(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs cursor-pointer">Batal</button>
                    <button type="button" onClick={() => { onUpdateProfile({ province: editProvince, city: editCity, kecamatan: editKecamatan, desa: editDesa, alamatLengkap: editAlamatLengkap, coordinates: editCoordinates || undefined }); setActiveEditModal(null); triggerToast('Alamat & titik domisili berhasil disimpan'); }} className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer">Simpan Alamat</button>
                  </div>
                </div>
              </div>
            )}

            {/* ================= EDIT MODAL: GANTI KATA SANDI ================= */}
            {activeEditModal === 'password' && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in" onClick={() => setActiveEditModal(null)}>
                <div className="bg-white rounded-3xl p-5 w-full max-w-sm space-y-4 shadow-2xl border border-slate-100" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
                    <h3 className="font-bold text-sm text-slate-900">Ubah Kata Sandi Akun</h3>
                    <button type="button" onClick={() => setActiveEditModal(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X className="w-4 h-4" /></button>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Kata Sandi Baru</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
                        placeholder="Minimal 4 karakter"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Ulangi Kata Sandi Baru</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
                        placeholder="Ketik ulang kata sandi baru"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setNewPassword('');
                        setConfirmPassword('');
                        setActiveEditModal(null);
                      }}
                      className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!newPassword || newPassword.length < 4) {
                          triggerToast('Kata sandi minimal 4 karakter');
                          return;
                        }
                        if (newPassword !== confirmPassword) {
                          triggerToast('Konfirmasi kata sandi tidak cocok!');
                          return;
                        }
                        onUpdateProfile({ password: newPassword, isPasswordChanged: true });
                        setNewPassword('');
                        setConfirmPassword('');
                        setActiveEditModal(null);
                        triggerToast('Kata sandi akun berhasil diubah');
                      }}
                      className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer"
                    >
                      Simpan Sandi
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
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
          <User className="w-5 h-5" />
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

      {/* MODAL DETAIL ALUMNI (SAMA PERSIS SEPERTI DI AKUN ADMIN) */}
      {selectedAlumniDetail && (
        <AlumniDetailAdminModal
          isOpen={Boolean(selectedAlumniDetail)}
          alumni={selectedAlumniDetail}
          onClose={() => setSelectedAlumniDetail(null)}
          onResetPassword={(id) => triggerToast(`Reset password untuk ID ${id} diproses`)}
          onSave={(id, updated) => {
            if (id === alumni.id) {
              onUpdateProfile(updated);
            }
            setSelectedAlumniDetail((prev) => (prev ? { ...prev, ...updated } : null));
            triggerToast('Data alumni berhasil diperbarui');
          }}
        />
      )}

      {/* BOTTOM SHEET FILTER (SAMA PERSIS DENGAN KELOLA DATA ALUMNI ADMIN) */}
      {isFilterSheetOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex flex-col justify-end animate-in fade-in"
          onClick={() => setIsFilterSheetOpen(false)}
        >
          <div 
            className="w-full max-w-lg mx-auto bg-white rounded-t-3xl shadow-2xl border-t border-slate-200 flex flex-col max-h-[85vh] animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle Drag Bar */}
            <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mt-3 mb-1" />

            {/* Sheet Header */}
            <div className="px-5 py-3 flex items-center justify-between border-b border-slate-100 relative z-10 bg-white">
              <h3 className="font-display font-bold text-sm text-slate-900">
                Filter Data Alumni
              </h3>
              <button
                onClick={() => setIsFilterSheetOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Fields */}
            <div className="p-5 space-y-4 text-xs relative z-30 overflow-visible">
              {/* Rentang Tanggal Masuk */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Rentang Tanggal Masuk (Tahun)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Dari (contoh: 2012)"
                    value={filterEntryFrom}
                    onChange={(e) => setFilterEntryFrom(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-600 focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Sampai (contoh: 2020)"
                    value={filterEntryTo}
                    onChange={(e) => setFilterEntryTo(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Rentang Tanggal Keluar */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Rentang Tanggal Keluar (Tahun)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Dari (contoh: 2016)"
                    value={filterGradFrom}
                    onChange={(e) => setFilterGradFrom(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-600 focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Sampai (contoh: 2024)"
                    value={filterGradTo}
                    onChange={(e) => setFilterGradTo(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Alamat Berdasarkan Wilayah */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700">
                  Alamat Santri & Alumni
                </label>
                <WilayahAddressFilter
                  province={filterProvince}
                  city={filterCity}
                  kecamatan={filterKecamatan}
                  desa={filterDesa}
                  showLocationTag={false}
                  showAlamatLengkap={false}
                  onChange={({ province, city, kecamatan, desa }) => {
                    setFilterProvince(province);
                    setFilterCity(city);
                    setFilterKecamatan(kecamatan);
                    setFilterDesa(desa);
                  }}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between gap-3 bg-slate-50">
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setIsFilterSheetOpen(false)}
                className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer text-center shadow-xs"
              >
                Terapkan Filter
              </button>
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

      {/* ================= MODAL FULLSCREEN BERSIH: FOTO PROFIL (PINCH TO ZOOM & PAN) ================= */}
      {showFullscreenPhoto && (
        <FullscreenPhotoViewerModal
          photoUrl={editPhotoUrl}
          name={editName || alumni.name}
          onClose={() => setShowFullscreenPhoto(false)}
          onDelete={
            editPhotoUrl
              ? () => {
                  handleDeletePhoto();
                  setShowFullscreenPhoto(false);
                }
              : undefined
          }
        />
      )}
    </div>
  );
};
