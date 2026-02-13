import { useState } from 'react';
import { User, Search } from 'lucide-react';
import { useNotificationStore } from '../../store/notificationStore';
import { DEPARTMENTS, DEPARTMENT_MAP } from '../../utils/constants';
import type { Person } from '../../types/activity';

interface PersonSelectorProps {
  open: boolean;
  people: Person[];
  onClose: () => void;
}

export function PersonSelector({ open, people, onClose }: PersonSelectorProps) {
  const setActivePersonId = useNotificationStore((s) => s.setActivePersonId);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState<string | null>(null);

  if (!open) return null;

  const filtered = people.filter((p) => {
    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.role ?? '').toLowerCase().includes(search.toLowerCase());
    const matchesDept = !selectedDept || p.departmentId === selectedDept;
    return matchesSearch && matchesDept;
  });

  const handleSelect = (personId: string) => {
    setActivePersonId(personId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <User size={20} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Who are you?
              </h2>
              <p className="text-sm text-gray-500">
                Select your profile to receive notifications
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="px-6 pt-4 pb-2">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or role..."
              className="w-full pl-9 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Department filter */}
        <div className="px-6 py-2 flex gap-1.5 flex-wrap">
          <button
            onClick={() => setSelectedDept(null)}
            className={`px-2.5 py-1 text-xs rounded-full transition-colors ${
              !selectedDept
                ? 'bg-indigo-100 text-indigo-700 font-medium'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {DEPARTMENTS.map((dept) => (
            <button
              key={dept.id}
              onClick={() =>
                setSelectedDept(selectedDept === dept.id ? null : dept.id)
              }
              className={`px-2.5 py-1 text-xs rounded-full transition-colors ${
                selectedDept === dept.id
                  ? 'font-medium'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={
                selectedDept === dept.id
                  ? { backgroundColor: dept.bgColor, color: dept.color }
                  : undefined
              }
            >
              {dept.shortName}
            </button>
          ))}
        </div>

        {/* Person list */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-500">
              No people found
            </div>
          ) : (
            <div className="space-y-1">
              {filtered.map((person) => {
                const dept = DEPARTMENT_MAP[person.departmentId];
                return (
                  <button
                    key={person.id}
                    onClick={() => handleSelect(person.id)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{ backgroundColor: dept?.color ?? '#6B7280' }}
                    >
                      {person.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {person.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {dept?.name ?? person.departmentId}
                        {person.role ? ` \u00b7 ${person.role}` : ''}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Skip option */}
        <div className="px-6 py-3 border-t border-gray-100">
          <button
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
