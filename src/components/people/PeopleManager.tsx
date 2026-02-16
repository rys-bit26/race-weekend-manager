import { useState, useMemo } from 'react';
import { Search, Plus, Mail, Phone, MessageSquare, Pencil } from 'lucide-react';
import { Modal } from '../common/Modal';
import { PersonEditModal } from './PersonEditModal';
import { DEPARTMENTS, DEPARTMENT_MAP } from '../../utils/constants';
import type { Person, DepartmentId } from '../../types/activity';

interface PeopleManagerProps {
  open: boolean;
  onClose: () => void;
  people: Person[];
  onAddPerson: (data: Omit<Person, 'id'>) => Promise<unknown>;
  onUpdatePerson: (id: string, data: Partial<Person>) => Promise<void>;
  onDeletePerson: (id: string) => Promise<void>;
}

export function PeopleManager({
  open,
  onClose,
  people,
  onAddPerson,
  onUpdatePerson,
  onDeletePerson,
}: PeopleManagerProps) {
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState<DepartmentId | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);

  const filteredPeople = useMemo(() => {
    return people.filter((p) => {
      const matchesSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.role ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (p.email ?? '').toLowerCase().includes(search.toLowerCase());
      const matchesDept = !selectedDept || p.departmentId === selectedDept;
      return matchesSearch && matchesDept;
    });
  }, [people, search, selectedDept]);

  // Group by department
  const grouped = useMemo(() => {
    const map = new Map<DepartmentId, Person[]>();
    for (const p of filteredPeople) {
      const list = map.get(p.departmentId) ?? [];
      list.push(p);
      map.set(p.departmentId, list);
    }
    return map;
  }, [filteredPeople]);

  const handleEdit = (person: Person) => {
    setEditingPerson(person);
    setEditModalOpen(true);
  };

  const handleNew = () => {
    setEditingPerson(null);
    setEditModalOpen(true);
  };

  const contactStats = useMemo(() => {
    const withEmail = people.filter((p) => p.email).length;
    const withPhone = people.filter((p) => p.phoneNumber).length;
    const withSms = people.filter((p) => p.smsOptIn).length;
    return { withEmail, withPhone, withSms, total: people.length };
  }, [people]);

  return (
    <>
      <Modal open={open} onClose={onClose} title="Team Directory" wide>
        <div className="space-y-4">
          {/* Stats Bar */}
          <div className="flex items-center gap-4 bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <span className="font-semibold text-gray-800">{contactStats.total}</span> people
            </div>
            <div className="h-4 w-px bg-gray-300" />
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Mail size={12} className="text-blue-500" />
              {contactStats.withEmail} with email
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Phone size={12} className="text-green-500" />
              {contactStats.withPhone} with phone
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <MessageSquare size={12} className="text-purple-500" />
              {contactStats.withSms} SMS opted-in
            </div>
          </div>

          {/* Search + Add */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, role, or email..."
                className="w-full pl-9 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              onClick={handleNew}
              className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors flex-shrink-0"
            >
              <Plus size={16} />
              Add Person
            </button>
          </div>

          {/* Department filter */}
          <div className="flex gap-1.5 flex-wrap">
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

          {/* People List */}
          <div className="max-h-[50vh] overflow-y-auto space-y-4">
            {filteredPeople.length === 0 ? (
              <div className="text-center py-8 text-sm text-gray-500">
                No people found
              </div>
            ) : (
              DEPARTMENTS.filter((d) => grouped.has(d.id)).map((dept) => (
                <div key={dept.id}>
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: dept.color }}
                    />
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {dept.name}
                    </h4>
                    <span className="text-xs text-gray-400">
                      ({grouped.get(dept.id)!.length})
                    </span>
                  </div>
                  <div className="space-y-1">
                    {grouped.get(dept.id)!.map((person) => (
                      <div
                        key={person.id}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors group"
                      >
                        {/* Avatar */}
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                          style={{ backgroundColor: dept.color }}
                        >
                          {person.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {person.name}
                            </p>
                            {person.role && (
                              <span className="text-xs text-gray-400 truncate hidden sm:inline">
                                {person.role}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-0.5">
                            {person.email ? (
                              <span className="text-xs text-gray-500 flex items-center gap-1 truncate">
                                <Mail size={10} className="text-blue-400 flex-shrink-0" />
                                {person.email}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <Mail size={10} className="text-gray-300" />
                                No email
                              </span>
                            )}
                            {person.phoneNumber ? (
                              <span className="text-xs text-gray-500 flex items-center gap-1 hidden sm:flex">
                                <Phone size={10} className="text-green-400 flex-shrink-0" />
                                {person.phoneNumber}
                                {person.smsOptIn && (
                                  <MessageSquare size={10} className="text-purple-400" />
                                )}
                              </span>
                            ) : null}
                          </div>
                        </div>

                        {/* Edit button */}
                        <button
                          onClick={() => handleEdit(person)}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Pencil size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Modal>

      {/* Edit/Add Person Sub-Modal */}
      <PersonEditModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditingPerson(null);
        }}
        onSave={async (data) => {
          if (editingPerson) {
            await onUpdatePerson(editingPerson.id, data);
          } else {
            await onAddPerson(data);
          }
        }}
        onDelete={
          editingPerson
            ? () => {
                onDeletePerson(editingPerson.id);
              }
            : undefined
        }
        person={editingPerson}
      />
    </>
  );
}
