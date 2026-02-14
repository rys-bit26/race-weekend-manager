import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { useFilterStore } from '../../store/filterStore';
import { useAppStore } from '../../store/appStore';

interface QuickSearchProps {
  matchCount?: number;
}

export function QuickSearch({ matchCount }: QuickSearchProps) {
  const [expanded, setExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchQuery = useFilterStore((s) => s.searchQuery);
  const setSearchQuery = useFilterStore((s) => s.setSearchQuery);
  const setShowFullWeek = useAppStore((s) => s.setShowFullWeek);

  const open = useCallback(() => {
    setExpanded(true);
    // Focus after React renders the input
    setTimeout(() => inputRef.current?.focus(), 0);
  }, []);

  const close = useCallback(() => {
    setExpanded(false);
    setSearchQuery('');
  }, [setSearchQuery]);

  // Cmd/Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (expanded) {
          close();
        } else {
          open();
        }
      }
      if (e.key === 'Escape' && expanded) {
        e.preventDefault();
        close();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [expanded, open, close]);

  // Auto-enable full week when searching so results span all days
  useEffect(() => {
    if (searchQuery.length > 0) {
      setShowFullWeek(true);
    }
  }, [searchQuery, setShowFullWeek]);

  if (!expanded) {
    return (
      <button
        onClick={open}
        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        title="Search (⌘K)"
      >
        <Search size={18} />
      </button>
    );
  }

  return (
    <div className="flex items-center bg-slate-800 rounded-lg px-3 py-1.5 gap-2">
      <Search size={16} className="text-slate-400 flex-shrink-0" />
      <input
        ref={inputRef}
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search activities..."
        className="bg-transparent text-white text-sm placeholder-slate-500 outline-none w-32 sm:w-48"
      />
      {searchQuery && matchCount !== undefined && (
        <span className="text-xs text-slate-400 whitespace-nowrap flex-shrink-0">
          {matchCount} {matchCount === 1 ? 'match' : 'matches'}
        </span>
      )}
      <button
        onClick={close}
        className="text-slate-400 hover:text-white flex-shrink-0"
      >
        <X size={14} />
      </button>
    </div>
  );
}
