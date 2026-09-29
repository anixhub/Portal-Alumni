import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Loader2, 
  Check,
  ChevronUp
} from 'lucide-react';
import { 
  WilayahItem, 
  fetchProvinces, 
  fetchRegencies, 
  fetchDistricts, 
  fetchVillages, 
  formatWilayahName 
} from '../../services/wilayahService';

interface WilayahAddressFilterProps {
  province: string;
  city: string;
  kecamatan: string;
  desa: string;
  onChange: (vals: {
    province: string;
    city: string;
    kecamatan: string;
    desa: string;
  }) => void;
}

type ActiveField = 'province' | 'city' | 'kecamatan' | 'desa' | null;

export const WilayahAddressFilter: React.FC<WilayahAddressFilterProps> = ({
  province,
  city,
  kecamatan,
  desa,
  onChange,
}) => {
  // Lists from endpoint
  const [provincesList, setProvincesList] = useState<WilayahItem[]>([]);
  const [regenciesList, setRegenciesList] = useState<WilayahItem[]>([]);
  const [districtsList, setDistrictsList] = useState<WilayahItem[]>([]);
  const [villagesList, setVillagesList] = useState<WilayahItem[]>([]);

  // Selected IDs
  const [selectedProvId, setSelectedProvId] = useState<string>('');
  const [selectedRegId, setSelectedRegId] = useState<string>('');
  const [selectedDistId, setSelectedDistId] = useState<string>('');

  // Loading states
  const [loadingProv, setLoadingProv] = useState(false);
  const [loadingReg, setLoadingReg] = useState(false);
  const [loadingDist, setLoadingDist] = useState(false);
  const [loadingVill, setLoadingVill] = useState(false);

  // Active dropdown
  const [activeDropdown, setActiveDropdown] = useState<ActiveField>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch initial provinces
  useEffect(() => {
    let isMounted = true;
    setLoadingProv(true);
    fetchProvinces()
      .then((items) => {
        if (!isMounted) return;
        setProvincesList(items);
        setLoadingProv(false);

        if (province) {
          const match = items.find(
            (p) => p.name.toLowerCase() === province.toLowerCase() ||
                   formatWilayahName(p.name).toLowerCase() === province.toLowerCase()
          );
          if (match) {
            setSelectedProvId(match.id);
          }
        }
      })
      .catch(() => {
        if (isMounted) setLoadingProv(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch regencies when selectedProvId changes
  useEffect(() => {
    if (!selectedProvId) {
      setRegenciesList([]);
      setSelectedRegId('');
      return;
    }

    let isMounted = true;
    setLoadingReg(true);
    fetchRegencies(selectedProvId)
      .then((items) => {
        if (!isMounted) return;
        setRegenciesList(items);
        setLoadingReg(false);

        if (city) {
          const match = items.find(
            (r) => r.name.toLowerCase().includes(city.toLowerCase()) ||
                   formatWilayahName(r.name).toLowerCase().includes(city.toLowerCase())
          );
          if (match) {
            setSelectedRegId(match.id);
          }
        }
      })
      .catch(() => {
        if (isMounted) setLoadingReg(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedProvId]);

  // Fetch districts when selectedRegId changes
  useEffect(() => {
    if (!selectedRegId) {
      setDistrictsList([]);
      setSelectedDistId('');
      return;
    }

    let isMounted = true;
    setLoadingDist(true);
    fetchDistricts(selectedRegId)
      .then((items) => {
        if (!isMounted) return;
        setDistrictsList(items);
        setLoadingDist(false);

        if (kecamatan) {
          const match = items.find(
            (d) => d.name.toLowerCase() === kecamatan.toLowerCase() ||
                   formatWilayahName(d.name).toLowerCase() === kecamatan.toLowerCase()
          );
          if (match) {
            setSelectedDistId(match.id);
          }
        }
      })
      .catch(() => {
        if (isMounted) setLoadingDist(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedRegId]);

  // Fetch villages when selectedDistId changes
  useEffect(() => {
    if (!selectedDistId) {
      setVillagesList([]);
      return;
    }

    let isMounted = true;
    setLoadingVill(true);
    fetchVillages(selectedDistId)
      .then((items) => {
        if (!isMounted) return;
        setVillagesList(items);
        setLoadingVill(false);
      })
      .catch(() => {
        if (isMounted) setLoadingVill(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedDistId]);

  // 1. PROVINSI HANDLERS
  const handleProvinceInputChange = (val: string) => {
    setActiveDropdown('province');
    const match = provincesList.find(
      (p) => p.name.toLowerCase() === val.trim().toLowerCase() ||
             formatWilayahName(p.name).toLowerCase() === val.trim().toLowerCase()
    );
    if (match) {
      setSelectedProvId(match.id);
      setSelectedRegId('');
      setSelectedDistId('');
      setLoadingReg(true);
      fetchRegencies(match.id).then((regs) => {
        setRegenciesList(regs);
        setLoadingReg(false);
      });
    } else {
      setSelectedProvId('');
      setSelectedRegId('');
      setSelectedDistId('');
      setRegenciesList([]);
    }
    onChange({
      province: val,
      city: '',
      kecamatan: '',
      desa: '',
    });
  };

  const handleSelectProvince = (item: WilayahItem) => {
    const formatted = formatWilayahName(item.name);
    setSelectedProvId(item.id);
    setSelectedRegId('');
    setSelectedDistId('');
    
    // Auto-fetch regencies and open city dropdown immediately
    setLoadingReg(true);
    fetchRegencies(item.id).then((regs) => {
      setRegenciesList(regs);
      setLoadingReg(false);
      setActiveDropdown('city');
    });

    onChange({
      province: formatted,
      city: '',
      kecamatan: '',
      desa: '',
    });
  };

  // 2. KABUPATEN / KOTA HANDLERS
  const handleCityInputChange = (val: string) => {
    setActiveDropdown('city');
    const match = regenciesList.find(
      (r) => r.name.toLowerCase().includes(val.trim().toLowerCase()) ||
             formatWilayahName(r.name).toLowerCase().includes(val.trim().toLowerCase())
    );
    if (match) {
      setSelectedRegId(match.id);
      setSelectedDistId('');
      setLoadingDist(true);
      fetchDistricts(match.id).then((dist) => {
        setDistrictsList(dist);
        setLoadingDist(false);
      });
    } else {
      setSelectedRegId('');
      setSelectedDistId('');
      setDistrictsList([]);
    }
    onChange({
      province,
      city: val,
      kecamatan: '',
      desa: '',
    });
  };

  const handleSelectCity = (item: WilayahItem) => {
    const formatted = formatWilayahName(item.name);
    setSelectedRegId(item.id);
    setSelectedDistId('');

    // Auto-fetch districts and open kecamatan dropdown
    setLoadingDist(true);
    fetchDistricts(item.id).then((dist) => {
      setDistrictsList(dist);
      setLoadingDist(false);
      setActiveDropdown('kecamatan');
    });

    onChange({
      province,
      city: formatted,
      kecamatan: '',
      desa: '',
    });
  };

  // 3. KECAMATAN HANDLERS
  const handleKecamatanInputChange = (val: string) => {
    setActiveDropdown('kecamatan');
    const match = districtsList.find(
      (d) => d.name.toLowerCase() === val.trim().toLowerCase() ||
             formatWilayahName(d.name).toLowerCase() === val.trim().toLowerCase()
    );
    if (match) {
      setSelectedDistId(match.id);
      setLoadingVill(true);
      fetchVillages(match.id).then((vills) => {
        setVillagesList(vills);
        setLoadingVill(false);
      });
    } else {
      setSelectedDistId('');
      setVillagesList([]);
    }
    onChange({
      province,
      city,
      kecamatan: val,
      desa: '',
    });
  };

  const handleSelectDistrict = (item: WilayahItem) => {
    const formatted = formatWilayahName(item.name);
    setSelectedDistId(item.id);

    // Auto-fetch villages and open desa dropdown
    setLoadingVill(true);
    fetchVillages(item.id).then((vills) => {
      setVillagesList(vills);
      setLoadingVill(false);
      setActiveDropdown('desa');
    });

    onChange({
      province,
      city,
      kecamatan: formatted,
      desa: '',
    });
  };

  // 4. DESA / KELURAHAN HANDLERS
  const handleDesaInputChange = (val: string) => {
    setActiveDropdown('desa');
    onChange({
      province,
      city,
      kecamatan,
      desa: val,
    });
  };

  const handleSelectVillage = (item: WilayahItem) => {
    const formatted = formatWilayahName(item.name);
    setActiveDropdown(null);
    onChange({
      province,
      city,
      kecamatan,
      desa: formatted,
    });
  };

  // Filter lists based on what's typed directly in the respective input
  const filteredProvinces = provincesList.filter((it) => {
    if (!province.trim()) return true;
    const q = province.toLowerCase();
    return it.name.toLowerCase().includes(q) || formatWilayahName(it.name).toLowerCase().includes(q);
  });

  const filteredRegencies = regenciesList.filter((it) => {
    if (!city.trim()) return true;
    const q = city.toLowerCase();
    return it.name.toLowerCase().includes(q) || formatWilayahName(it.name).toLowerCase().includes(q);
  });

  const filteredDistricts = districtsList.filter((it) => {
    if (!kecamatan.trim()) return true;
    const q = kecamatan.toLowerCase();
    return it.name.toLowerCase().includes(q) || formatWilayahName(it.name).toLowerCase().includes(q);
  });

  const filteredVillages = villagesList.filter((it) => {
    if (!desa.trim()) return true;
    const q = desa.toLowerCase();
    return it.name.toLowerCase().includes(q) || formatWilayahName(it.name).toLowerCase().includes(q);
  });

  return (
    <div ref={containerRef} className="space-y-2.5 text-xs relative z-40">
      {/* ROW 1: PROVINSI & KOTA/KABUPATEN */}
      <div className={`grid grid-cols-2 gap-2 relative transition-all ${activeDropdown === 'province' || activeDropdown === 'city' ? 'z-50' : 'z-20'}`}>
        {/* PROVINSI */}
        <div className={`relative ${activeDropdown === 'province' ? 'z-50' : 'z-10'}`}>
          <label className="block text-[10px] font-semibold text-slate-500 mb-1">
            Provinsi
          </label>
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Ketik provinsi..."
              value={province}
              onChange={(e) => handleProvinceInputChange(e.target.value)}
              onFocus={() => setActiveDropdown('province')}
              onClick={() => setActiveDropdown('province')}
              className={`w-full pl-3 pr-7 py-2 bg-slate-50 border rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none transition-colors ${
                activeDropdown === 'province'
                  ? 'border-sky-500 ring-2 ring-sky-100 bg-white'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            />
            <div className="absolute right-2 flex items-center gap-1">
              {loadingProv ? (
                <Loader2 className="w-3.5 h-3.5 text-sky-600 animate-spin" />
              ) : province ? (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedProvId('');
                    setSelectedRegId('');
                    setSelectedDistId('');
                    setRegenciesList([]);
                    setDistrictsList([]);
                    setVillagesList([]);
                    onChange({ province: '', city: '', kecamatan: '', desa: '' });
                  }}
                  className="p-0.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              ) : null}
            </div>
          </div>

          {/* DROPDOWN MENU KE ATAS (BOTTOM-FULL) */}
          {activeDropdown === 'province' && (
            <div className="absolute left-0 right-0 bottom-full mb-1.5 z-[100] bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in ring-1 ring-black/5">
              <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                <span>Pilih Provinsi</span>
                <ChevronUp className="w-3 h-3 text-slate-400" />
              </div>
              <div className="max-h-48 overflow-y-auto divide-y divide-slate-50">
                {loadingProv && (
                  <div className="px-3 py-4 text-center text-xs text-sky-600 flex items-center justify-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Memuat daftar provinsi...</span>
                  </div>
                )}
                {!loadingProv && filteredProvinces.map((item) => {
                  const nameFormatted = formatWilayahName(item.name);
                  const isSelected = province.toLowerCase() === nameFormatted.toLowerCase();
                  return (
                    <div
                      key={item.id}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSelectProvince(item);
                      }}
                      className={`px-3 py-2 text-xs cursor-pointer flex items-center justify-between transition-colors ${
                        isSelected ? 'bg-sky-50 text-sky-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="truncate">{nameFormatted}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-sky-600 shrink-0 ml-1" />}
                    </div>
                  );
                })}
                {!loadingProv && filteredProvinces.length === 0 && (
                  <div className="px-3 py-3 text-center text-xs text-slate-400">
                    Tidak ada provinsi yang cocok
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* KOTA / KABUPATEN */}
        <div className={`relative ${activeDropdown === 'city' ? 'z-50' : 'z-10'}`}>
          <label className="block text-[10px] font-semibold text-slate-500 mb-1">
            Kota / Kabupaten
          </label>
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder={!selectedProvId ? 'Pilih provinsi dulu' : 'Ketik kota/kabupaten...'}
              disabled={!selectedProvId}
              value={city}
              onChange={(e) => handleCityInputChange(e.target.value)}
              onFocus={() => {
                if (selectedProvId) setActiveDropdown('city');
              }}
              onClick={() => {
                if (selectedProvId) setActiveDropdown('city');
              }}
              className={`w-full pl-3 pr-7 py-2 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none transition-colors ${
                !selectedProvId
                  ? 'bg-slate-100 border border-slate-200/60 cursor-not-allowed opacity-60'
                  : activeDropdown === 'city'
                  ? 'border-sky-500 ring-2 ring-sky-100 bg-white'
                  : 'bg-slate-50 border border-slate-200 hover:border-slate-300'
              }`}
            />
            <div className="absolute right-2 flex items-center gap-1">
              {loadingReg ? (
                <Loader2 className="w-3.5 h-3.5 text-sky-600 animate-spin" />
              ) : city ? (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRegId('');
                    setSelectedDistId('');
                    setDistrictsList([]);
                    setVillagesList([]);
                    onChange({ province, city: '', kecamatan: '', desa: '' });
                  }}
                  className="p-0.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              ) : null}
            </div>
          </div>

          {/* DROPDOWN MENU KE ATAS (BOTTOM-FULL) */}
          {activeDropdown === 'city' && selectedProvId && (
            <div className="absolute left-0 right-0 bottom-full mb-1.5 z-[100] bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in ring-1 ring-black/5">
              <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                <span>Pilih Kota / Kabupaten</span>
                <ChevronUp className="w-3 h-3 text-slate-400" />
              </div>
              <div className="max-h-48 overflow-y-auto divide-y divide-slate-50">
                {loadingReg && (
                  <div className="px-3 py-4 text-center text-xs text-sky-600 flex items-center justify-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Memuat daftar kota/kabupaten...</span>
                  </div>
                )}
                {!loadingReg && filteredRegencies.map((item) => {
                  const nameFormatted = formatWilayahName(item.name);
                  const isSelected = city.toLowerCase() === nameFormatted.toLowerCase();
                  return (
                    <div
                      key={item.id}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSelectCity(item);
                      }}
                      className={`px-3 py-2 text-xs cursor-pointer flex items-center justify-between transition-colors ${
                        isSelected ? 'bg-sky-50 text-sky-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="truncate">{nameFormatted}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-sky-600 shrink-0 ml-1" />}
                    </div>
                  );
                })}
                {!loadingReg && filteredRegencies.length === 0 && (
                  <div className="px-3 py-3 text-center text-xs text-slate-400">
                    Tidak ada kota/kabupaten yang cocok
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ROW 2: KECAMATAN & DESA / KELURAHAN */}
      <div className={`grid grid-cols-2 gap-2 relative transition-all ${activeDropdown === 'kecamatan' || activeDropdown === 'desa' ? 'z-50' : 'z-10'}`}>
        {/* KECAMATAN */}
        <div className={`relative ${activeDropdown === 'kecamatan' ? 'z-50' : 'z-10'}`}>
          <label className="block text-[10px] font-semibold text-slate-500 mb-1">
            Kecamatan
          </label>
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder={!selectedRegId ? 'Pilih kota dulu' : 'Ketik kecamatan...'}
              disabled={!selectedRegId}
              value={kecamatan}
              onChange={(e) => handleKecamatanInputChange(e.target.value)}
              onFocus={() => {
                if (selectedRegId) setActiveDropdown('kecamatan');
              }}
              onClick={() => {
                if (selectedRegId) setActiveDropdown('kecamatan');
              }}
              className={`w-full pl-3 pr-7 py-2 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none transition-colors ${
                !selectedRegId
                  ? 'bg-slate-100 border border-slate-200/60 cursor-not-allowed opacity-60'
                  : activeDropdown === 'kecamatan'
                  ? 'border-sky-500 ring-2 ring-sky-100 bg-white'
                  : 'bg-slate-50 border border-slate-200 hover:border-slate-300'
              }`}
            />
            <div className="absolute right-2 flex items-center gap-1">
              {loadingDist ? (
                <Loader2 className="w-3.5 h-3.5 text-sky-600 animate-spin" />
              ) : kecamatan ? (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDistId('');
                    setVillagesList([]);
                    onChange({ province, city, kecamatan: '', desa: '' });
                  }}
                  className="p-0.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              ) : null}
            </div>
          </div>

          {/* DROPDOWN MENU KE ATAS (BOTTOM-FULL) */}
          {activeDropdown === 'kecamatan' && selectedRegId && (
            <div className="absolute left-0 right-0 bottom-full mb-1.5 z-[100] bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in ring-1 ring-black/5">
              <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                <span>Pilih Kecamatan</span>
                <ChevronUp className="w-3 h-3 text-slate-400" />
              </div>
              <div className="max-h-48 overflow-y-auto divide-y divide-slate-50">
                {loadingDist && (
                  <div className="px-3 py-4 text-center text-xs text-sky-600 flex items-center justify-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Memuat daftar kecamatan...</span>
                  </div>
                )}
                {!loadingDist && filteredDistricts.map((item) => {
                  const nameFormatted = formatWilayahName(item.name);
                  const isSelected = kecamatan.toLowerCase() === nameFormatted.toLowerCase();
                  return (
                    <div
                      key={item.id}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSelectDistrict(item);
                      }}
                      className={`px-3 py-2 text-xs cursor-pointer flex items-center justify-between transition-colors ${
                        isSelected ? 'bg-sky-50 text-sky-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="truncate">{nameFormatted}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-sky-600 shrink-0 ml-1" />}
                    </div>
                  );
                })}
                {!loadingDist && filteredDistricts.length === 0 && (
                  <div className="px-3 py-3 text-center text-xs text-slate-400">
                    Tidak ada kecamatan yang cocok
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* DESA / KELURAHAN */}
        <div className={`relative ${activeDropdown === 'desa' ? 'z-50' : 'z-10'}`}>
          <label className="block text-[10px] font-semibold text-slate-500 mb-1">
            Desa / Kelurahan
          </label>
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder={!selectedDistId ? 'Pilih kecamatan dulu' : 'Ketik kelurahan/desa...'}
              disabled={!selectedDistId}
              value={desa}
              onChange={(e) => handleDesaInputChange(e.target.value)}
              onFocus={() => {
                if (selectedDistId) setActiveDropdown('desa');
              }}
              onClick={() => {
                if (selectedDistId) setActiveDropdown('desa');
              }}
              className={`w-full pl-3 pr-7 py-2 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none transition-colors ${
                !selectedDistId
                  ? 'bg-slate-100 border border-slate-200/60 cursor-not-allowed opacity-60'
                  : activeDropdown === 'desa'
                  ? 'border-sky-500 ring-2 ring-sky-100 bg-white'
                  : 'bg-slate-50 border border-slate-200 hover:border-slate-300'
              }`}
            />
            <div className="absolute right-2 flex items-center gap-1">
              {loadingVill ? (
                <Loader2 className="w-3.5 h-3.5 text-sky-600 animate-spin" />
              ) : desa ? (
                <button
                  type="button"
                  onClick={() => {
                    onChange({ province, city, kecamatan, desa: '' });
                  }}
                  className="p-0.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              ) : null}
            </div>
          </div>

          {/* DROPDOWN MENU KE ATAS (BOTTOM-FULL) */}
          {activeDropdown === 'desa' && selectedDistId && (
            <div className="absolute left-0 right-0 bottom-full mb-1.5 z-[100] bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in ring-1 ring-black/5">
              <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                <span>Pilih Desa / Kelurahan</span>
                <ChevronUp className="w-3 h-3 text-slate-400" />
              </div>
              <div className="max-h-48 overflow-y-auto divide-y divide-slate-50">
                {loadingVill && (
                  <div className="px-3 py-4 text-center text-xs text-sky-600 flex items-center justify-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Memuat daftar desa/kelurahan...</span>
                  </div>
                )}
                {!loadingVill && filteredVillages.map((item) => {
                  const nameFormatted = formatWilayahName(item.name);
                  const isSelected = desa.toLowerCase() === nameFormatted.toLowerCase();
                  return (
                    <div
                      key={item.id}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSelectVillage(item);
                      }}
                      className={`px-3 py-2 text-xs cursor-pointer flex items-center justify-between transition-colors ${
                        isSelected ? 'bg-sky-50 text-sky-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="truncate">{nameFormatted}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-sky-600 shrink-0 ml-1" />}
                    </div>
                  );
                })}
                {!loadingVill && filteredVillages.length === 0 && (
                  <div className="px-3 py-3 text-center text-xs text-slate-400">
                    Tidak ada desa/kelurahan yang cocok
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
