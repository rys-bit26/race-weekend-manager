import { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { DEPARTMENTS, DAYS, LOCATIONS } from '../../utils/constants';
import type { Activity, DepartmentId, ActivityStatus } from '../../types/activity';
import type { Person } from '../../types/activity';
import type { DayOfWeek } from '../../types/schedule';

interface ActivityModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDelete?: () => void;
  activity?: Activity | null;
  people: Person[];
  weekendId: string;
}

const emptyForm = {
  name: '',
  departmentIds: [] as DepartmentId[],
  personIds: [] as string[],
  day: 'friday' as DayOfWeek,
  startTime: '09:00',
  endTime: '10:00',
  location: '',
  status: 'pending' as ActivityStatus,
  notes: '',
};

export function ActivityModal({
  open,
  onClose,
  onSave,
  onDelete,
  activity,
  people,
  weekendId,
}: ActivityModalProps) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (activity) {
      setForm({
        name: activity.name,
        departmentIds: [...activity.departmentIds],
        personIds: [...activity.personIds],
        day: activity.day,
        startTime: activity.startTime,
        endTime: activity.endTime,
        location: activity.location,
        status: activity.status,
        notes: activity.notes,
      });
    } else {
      setForm(emptyForm);
    }
  }, [activity, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...form, weekendId });
    onClose();
  };

  const toggleDept = (id: DepartmentId) => {
    setForm((f) => ({
      ...f,
      departmentIds: f.departmentIds.includes(id)
        ? f.departmentIds.filter((d) => d !== id)
        : [...f.departmentIds, id],
    }));
  };

  const togglePerson = (id: string) => {
    setForm((f) => ({
      ...f,
      personIds: f.personIds.includes(id)
        ? f.personIds.filter((p) => p !== id)
        : [...f.personIds, id],
    }));
  };

  const filteredPeople = people.filter(
    (p) => form.departmentIds.length === 0 || form.departmentIds.includes(p.departmentId)
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={activity ? 'Edit Activity' : 'New Activity'}
      wide
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Activity Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Activity Name *
          </label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            placeholder="e.g., Driver Content Shoot"
          />
        </div>

        {/* Day and Time */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
            <select
              value={form.day}
              onChange={(e) => setForm((f) => ({ ...f, day: e.target.value as DayOfWeek }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            >
              {DAYS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
            <input
              type="time"
              value={form.startTime}
              onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
            <input
              type="time"
              value={form.endTime}
              onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, status: 'pending' }))}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                form.status === 'pending'
                  ? 'bg-amber-100 text-amber-700 ring-2 ring-amber-400'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Pending
            </button>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, status: 'confirmed' }))}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                form.status === 'confirmed'
                  ? 'bg-green-100 text-green-700 ring-2 ring-green-400'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Confirmed
            </button>
          </div>
        </div>

        {/* Departments */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Departments *
          </label>
          <div className="flex flex-wrap gap-2">
            {DEPARTMENTS.map((dept) => (
              <button
                key={dept.id}
                type="button"
                onClick={() => toggleDept(dept.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  form.departmentIds.includes(dept.id)
                    ? 'ring-2 ring-offset-1'
                    : 'opacity-50 hover:opacity-75'
                }`}
                style={{
                  backgroundColor: dept.bgColor,
                  color: dept.color,
                }}
              >
                {dept.name}
              </button>
            ))}
          </div>
        </div>

        {/* People */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            People Assigned
          </label>
          <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2 space-y-1">
            {filteredPeople.length === 0 ? (
              <p className="text-sm text-gray-400 px-2 py-1">
                Select a department first
              </p>
            ) : (
              filteredPeople.map((person) => (
                <label
                  key={person.id}
                  className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={form.personIds.includes(person.id)}
                    onChange={() => togglePerson(person.id)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">{person.name}</span>
                  {person.role && (
                    <span className="text-xs text-gray-400">({person.role})</span>
                  )}
                </label>
              ))
            )}
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <select
            value={form.location}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          >
            <option value="">Select location...</option>
            {LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm resize-none"
            placeholder="Additional details..."
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div>
            {onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Delete this activity?')) {
                    onDelete();
                    onClose();
                  }
                }}
                className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                Delete
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!form.name || form.departmentIds.length === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {activity ? 'Save Changes' : 'Add Activity'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
