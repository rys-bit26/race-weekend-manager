import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus, MapPin, Calendar } from 'lucide-react';
import type { RaceWeekend } from '../../types/schedule';

interface EventSelectorProps {
  weekends: RaceWeekend[];
  activeWeekend: RaceWeekend | undefined;
  onSelect: (id: string) => void;
  onAddNew: () => void;
}

function formatDateRange(start: string, end: string): string {
  const s = new Date(start + 'T00:00:00');
  const e = new Date(end + 'T00:00:00');
  const sMonth = s.toLocaleDateString('en-US', { month: 'short' });
  const eMonth = e.toLocaleDateString('en-US', { month: 'short' });
  const sDay = s.getDate();
  const eDay = e.getDate();
  if (sMonth === eMonth) {
    return `${sMonth} ${sDay}-${eDay}`;
  }
  return `${sMonth} ${sDay} - ${eMonth} ${eDay}`;
}

export function EventSelector({ weekends, activeWeekend, onSelect, onAddNew }: EventSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const sorted = [...weekends].sort(
    (a, b) => a.startDate.localeCompare(b.startDate)
  );

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 hover:bg-slate-800 rounded-lg px-2 py-1.5 transition-colors text-left"
      >
        <div className="min-w-0">
          <h1 className="text-sm font-bold font-heading tracking-tight truncate">
            {activeWeekend?.name ?? 'Select Event'}
          </h1>
          {activeWeekend && (
            <p className="text-[11px] text-slate-400 truncate">
              {formatDateRange(activeWeekend.startDate, activeWeekend.endDate)} &middot; {activeWeekend.location}
            </p>
          )}
        </div>
        <ChevronDown
          size={16}
          className={`text-slate-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
          <div className="px-3 py-2 border-b border-gray-100">
            <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">
              Race Weekends
            </p>
          </div>

          <div className="max-h-72 overflow-y-auto">
            {sorted.map((w) => (
              <button
                key={w.id}
                onClick={() => {
                  onSelect(w.id);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${
                  w.id === activeWeekend?.id ? 'bg-indigo-50' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className={`text-sm font-medium truncate ${
                      w.id === activeWeekend?.id ? 'text-indigo-700' : 'text-gray-800'
                    }`}>
                      {w.name}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="flex items-center gap-1 text-[11px] text-gray-500">
                        <Calendar size={10} />
                        {formatDateRange(w.startDate, w.endDate)}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-gray-500">
                        <MapPin size={10} />
                        {w.location}
                      </span>
                    </div>
                  </div>
                  {w.id === activeWeekend?.id && (
                    <span className="flex-shrink-0 w-2 h-2 mt-1.5 rounded-full bg-indigo-500" />
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="border-t border-gray-200">
            <button
              onClick={() => {
                setOpen(false);
                onAddNew();
              }}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-indigo-600 hover:bg-indigo-50 transition-colors font-medium"
            >
              <Plus size={16} />
              Add New Event
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
