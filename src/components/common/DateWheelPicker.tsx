import React, { useRef, useEffect, useLayoutEffect, useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface DateWheelPickerProps {
  value: string; // Format: 'YYYY-MM-DD'
  onChange: (value: string) => void;
  minYear?: number;
  maxYear?: number;
}

const NAMA_BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const DateWheelPicker: React.FC<DateWheelPickerProps> = ({
  value,
  onChange,
  minYear = 1980,
  maxYear = 2035,
}) => {
  // Parse date value
  let initialDate = new Date();
  if (value) {
    const parts = value.split('-');
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
        initialDate = new Date(y, m, d);
      }
    }
  }

  const selectedYear = isNaN(initialDate.getFullYear()) ? 2014 : initialDate.getFullYear();
  const selectedMonth = isNaN(initialDate.getMonth()) ? 6 : initialDate.getMonth(); // 0-indexed
  const selectedDay = isNaN(initialDate.getDate()) ? 15 : initialDate.getDate();

  // Calculate days in current month and year
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const validDay = Math.min(selectedDay, daysInMonth);

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i);

  const dayRef = useRef<HTMLDivElement>(null);
  const monthRef = useRef<HTMLDivElement>(null);
  const yearRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);
  const [isSmoothEnabled, setIsSmoothEnabled] = useState(false);

  const ITEM_HEIGHT = 40; // in px
  const PADDING_OFFSET = 80; // 5 rows total, center row is at 80px (80px top padding + 40px item + 80px bottom padding = 200px container)

  // Update date
  const updateDate = (newYear: number, newMonth: number, newDay: number) => {
    setIsSmoothEnabled(true);
    const maxDays = new Date(newYear, newMonth + 1, 0).getDate();
    const clampedDay = Math.min(newDay, maxDays);
    const mm = String(newMonth + 1).padStart(2, '0');
    const dd = String(clampedDay).padStart(2, '0');
    onChange(`${newYear}-${mm}-${dd}`);
  };

  // Scroll immediately on initial mount without any animation or spinning
  useLayoutEffect(() => {
    if (dayRef.current) {
      dayRef.current.scrollTop = (validDay - 1) * ITEM_HEIGHT;
    }
    if (monthRef.current) {
      monthRef.current.scrollTop = selectedMonth * ITEM_HEIGHT;
    }
    if (yearRef.current) {
      const yearIndex = years.indexOf(selectedYear);
      if (yearIndex >= 0) {
        yearRef.current.scrollTop = yearIndex * ITEM_HEIGHT;
      }
    }
  }, []);

  // Subsequent value changes
  useEffect(() => {
    if (!isInitialMount.current) {
      if (dayRef.current) {
        dayRef.current.scrollTop = (validDay - 1) * ITEM_HEIGHT;
      }
      if (monthRef.current) {
        monthRef.current.scrollTop = selectedMonth * ITEM_HEIGHT;
      }
      if (yearRef.current) {
        const yearIndex = years.indexOf(selectedYear);
        if (yearIndex >= 0) {
          yearRef.current.scrollTop = yearIndex * ITEM_HEIGHT;
        }
      }
    } else {
      isInitialMount.current = false;
    }
  }, [selectedYear, selectedMonth, validDay, years]);

  return (
    <div className="w-full bg-slate-50 rounded-2xl p-3 border border-slate-200 select-none">
      {/* Header Kolom Tgl, Bulan, Tahun dengan Kontrol Tombol Atas */}
      <div className="grid grid-cols-12 gap-1 mb-1 text-center">
        <div className="col-span-3 flex items-center justify-between px-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Tgl</span>
          <button
            type="button"
            onClick={() => updateDate(selectedYear, selectedMonth, Math.max(1, validDay - 1))}
            className="p-1 rounded-md text-slate-400 hover:text-sky-600 hover:bg-slate-200/60 cursor-pointer"
            title="Kurangi tanggal"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="col-span-5 flex items-center justify-between px-1 border-x border-slate-200/70">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Bulan</span>
          <button
            type="button"
            onClick={() => updateDate(selectedYear, Math.max(0, selectedMonth - 1), validDay)}
            className="p-1 rounded-md text-slate-400 hover:text-sky-600 hover:bg-slate-200/60 cursor-pointer"
            title="Bulan sebelumnya"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="col-span-4 flex items-center justify-between px-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Tahun</span>
          <button
            type="button"
            onClick={() => updateDate(Math.max(minYear, selectedYear - 1), selectedMonth, validDay)}
            className="p-1 rounded-md text-slate-400 hover:text-sky-600 hover:bg-slate-200/60 cursor-pointer"
            title="Tahun sebelumnya"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Wheel Columns Container (Tinggi tepat 200px: 5 baris @ 40px) */}
      <div className="relative h-[200px] flex items-stretch justify-between gap-1 overflow-hidden bg-white rounded-xl border border-slate-200 shadow-inner px-1">
        {/* Kotak Penyorot Tengah (Highlight Bar Lens) - Tepat di posisi y: 80px, tinggi 40px */}
        <div
          className="absolute inset-x-2 top-[80px] h-[40px] bg-sky-100/70 border-y-2 border-sky-500/40 rounded-lg pointer-events-none z-10"
        />

        {/* Top/Bottom Gradient Shadows */}
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white via-white/80 to-transparent pointer-events-none z-20" />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none z-20" />

        {/* 1. COLUMN: TANGGAL (1-31) */}
        <div className="col-span-3 flex-1 h-full relative z-10">
          <div
            ref={dayRef}
            className={`w-full h-full overflow-y-auto no-scrollbar snap-y snap-mandatory ${
              isSmoothEnabled ? 'scroll-smooth' : ''
            }`}
            style={{
              paddingTop: `${PADDING_OFFSET}px`,
              paddingBottom: `${PADDING_OFFSET}px`,
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {days.map((d) => (
              <div
                key={d}
                onClick={() => updateDate(selectedYear, selectedMonth, d)}
                className={`h-[40px] flex items-center justify-center snap-center cursor-pointer transition-colors ${
                  d === validDay
                    ? 'text-sky-900 font-extrabold text-base scale-105'
                    : 'text-slate-400 text-xs hover:text-slate-700 font-medium'
                }`}
              >
                {d}
              </div>
            ))}
          </div>
        </div>

        {/* 2. COLUMN: BULAN (Jan - Des) */}
        <div className="col-span-5 flex-[1.6] h-full relative z-10 border-x border-slate-100">
          <div
            ref={monthRef}
            className={`w-full h-full overflow-y-auto no-scrollbar snap-y snap-mandatory px-1 ${
              isSmoothEnabled ? 'scroll-smooth' : ''
            }`}
            style={{
              paddingTop: `${PADDING_OFFSET}px`,
              paddingBottom: `${PADDING_OFFSET}px`,
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {NAMA_BULAN.map((m, idx) => (
              <div
                key={m}
                onClick={() => updateDate(selectedYear, idx, validDay)}
                className={`h-[40px] flex items-center justify-center snap-center cursor-pointer transition-colors ${
                  idx === selectedMonth
                    ? 'text-sky-900 font-extrabold text-xs scale-105'
                    : 'text-slate-400 text-[11px] hover:text-slate-700 font-medium'
                }`}
              >
                <span className="truncate">{m}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. COLUMN: TAHUN */}
        <div className="col-span-4 flex-[1.2] h-full relative z-10">
          <div
            ref={yearRef}
            className={`w-full h-full overflow-y-auto no-scrollbar snap-y snap-mandatory font-mono ${
              isSmoothEnabled ? 'scroll-smooth' : ''
            }`}
            style={{
              paddingTop: `${PADDING_OFFSET}px`,
              paddingBottom: `${PADDING_OFFSET}px`,
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {years.map((y) => (
              <div
                key={y}
                onClick={() => updateDate(y, selectedMonth, validDay)}
                className={`h-[40px] flex items-center justify-center snap-center cursor-pointer transition-colors ${
                  y === selectedYear
                    ? 'text-sky-900 font-extrabold text-sm scale-105'
                    : 'text-slate-400 text-xs hover:text-slate-700 font-medium'
                }`}
              >
                {y}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Kontrol Tombol Bawah */}
      <div className="grid grid-cols-12 gap-1 mt-1 text-center">
        <div className="col-span-3 flex justify-end px-1">
          <button
            type="button"
            onClick={() => updateDate(selectedYear, selectedMonth, Math.min(daysInMonth, validDay + 1))}
            className="p-1 rounded-md text-slate-400 hover:text-sky-600 hover:bg-slate-200/60 cursor-pointer"
            title="Tambah tanggal"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="col-span-5 flex justify-end px-1 border-x border-slate-200/70">
          <button
            type="button"
            onClick={() => updateDate(selectedYear, Math.min(11, selectedMonth + 1), validDay)}
            className="p-1 rounded-md text-slate-400 hover:text-sky-600 hover:bg-slate-200/60 cursor-pointer"
            title="Bulan berikutnya"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="col-span-4 flex justify-end px-1">
          <button
            type="button"
            onClick={() => updateDate(Math.min(maxYear, selectedYear + 1), selectedMonth, validDay)}
            className="p-1 rounded-md text-slate-400 hover:text-sky-600 hover:bg-slate-200/60 cursor-pointer"
            title="Tahun berikutnya"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
