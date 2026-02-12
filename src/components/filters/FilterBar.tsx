import { useState, useRef, useEffect } from 'react';
import { Search, X, Filter } from 'lucide-react';
import { useFilterStore } from '../../store/filterStore';
import { DEPARTMENTS } from '../../utils/constants';
import type { Person } from '../../types/activity';

interface FilterBarProps {
  people: Person[];
}

export function FilterBar({ people }: FilterBarProps) {
  const filters = useFilterStore();
  const [showFilters, setShowFilters] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const hasFilters = filters.hasActiveFilters();

  return (
    <div className="space-y-2">
      {/* Search */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          ref={searchRef}
          type="text"
          value={filters.searchQuery}
          onChange={(e) => filters.setSearchQuery(e.target.value)}
          placeholder="Search activities..."
          className="w-full pl-9 pr-9 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
        />
        {filters.searchQuery && (
          <button
            onClick={() => filters.setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Filter toggle */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
          hasFilters
            ? 'bg-indigo-50 text-indigo-700'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        <Filter size={12} />
        Filters
        {hasFilters && (
          <span className="ml-1 px-1.5 py-0.5 bg-indigo-600 text-white rounded-full text-[10px]">
            {filters.departments.length +
              filters.personIds.length +
              filters.statuses.length +
              (filters.location ? 1 : 0)}
          </span>
        )}
      </button>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-lg p-3 space-y-3">
          {/* Departments */}
          <div>
            <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
              Departments
            </label>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {DEPARTMENTS.map((dept) => (
                <button
                  key={dept.id}
                  onClick={() => filters.toggleDepartment(dept.id)}
                  className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
                    filters.departments.includes(dept.id)
                      ? 'ring-1 ring-offset-1'
                      : 'opacity-60 hover:opacity-80'
                  }`}
                  style={{
                    backgroundColor: dept.bgColor,
                    color: dept.color,
                  }}
                >
                  {dept.shortName}
                </button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
              Status
            </label>
            <div className="flex gap-2 mt-1">
              {(['pending', 'confirmed'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    const current = filters.statuses;
                    if (current.includes(status)) {
                      filters.setStatusFilter(current.filter((s) => s !== status));
                    } else {
                      filters.setStatusFilter([...current, status]);
                    }
                  }}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                    filters.statuses.includes(status)
                      ? status === 'confirmed'
                        ? 'bg-green-100 text-green-700 ring-1 ring-green-400'
                        : 'bg-amber-100 text-amber-700 ring-1 ring-amber-400'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {status === 'confirmed' ? 'Confirmed' : 'Pending'}
                </button>
              ))}
            </div>
          </div>

          {/* People (compact) */}
          <div>
            <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
              People
            </label>
            <div className="mt-1 max-h-32 overflow-y-auto space-y-0.5">
              {people.map((person) => (
                <label
                  key={person.id}
                  className="flex items-center gap-1.5 px-1 py-0.5 rounded hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={filters.personIds.includes(person.id)}
                    onChange={() => {
                      const current = filters.personIds;
                      if (current.includes(person.id)) {
                        filters.setPersonFilter(current.filter((id) => id !== person.id));
                      } else {
                        filters.setPersonFilter([...current, person.id]);
                      }
                    }}
                    className="rounded border-gray-300 text-indigo-600 w-3 h-3"
                  />
                  <span className="text-[11px] text-gray-600">{person.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Clear all */}
          {hasFilters && (
            <button
              onClick={filters.clearAll}
              className="text-[11px] text-red-500 hover:text-red-700 font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
