import { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { DEPARTMENTS } from '../../utils/constants';
import type { Person, DepartmentId } from '../../types/activity';

interface PersonEditModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<Person, 'id'>) => void;
  onDelete?: () => void;
  person?: Person | null;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\+?[\d\s\-().]{7,20}$/;

const emptyForm = {
  name: '',
  departmentId: 'social-content' as DepartmentId,
  role: '',
  email: '',
  phoneNumber: '',
  smsOptIn: false,
};

export function PersonEditModal({
  open,
  onClose,
  onSave,
  onDelete,
  person,
}: PersonEditModalProps) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (person) {
      setForm({
        name: person.name,
        departmentId: person.departmentId,
        role: person.role ?? '',
        email: person.email ?? '',
        phoneNumber: person.phoneNumber ?? '',
        smsOptIn: person.smsOptIn ?? false,
      });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
  }, [person, open]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (form.email && !emailRegex.test(form.email)) errs.email = 'Invalid email format';
    if (form.phoneNumber && !phoneRegex.test(form.phoneNumber)) errs.phoneNumber = 'Invalid phone format';
    if (form.smsOptIn && !form.phoneNumber) errs.phoneNumber = 'Phone number required for SMS';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSave({
      name: form.name.trim(),
      departmentId: form.departmentId,
      role: form.role.trim() || undefined,
      email: form.email.trim() || undefined,
      phoneNumber: form.phoneNumber.trim() || undefined,
      smsOptIn: form.smsOptIn,
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={person ? 'Edit Person' : 'Add Person'}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name *
          </label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            placeholder="Full name"
          />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
        </div>

        {/* Department */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Department *
          </label>
          <div className="flex flex-wrap gap-2">
            {DEPARTMENTS.map((dept) => (
              <button
                key={dept.id}
                type="button"
                onClick={() => setForm((f) => ({ ...f, departmentId: dept.id }))}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  form.departmentId === dept.id
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

        {/* Role */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role
          </label>
          <input
            type="text"
            value={form.role}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            placeholder="e.g., Content Director"
          />
        </div>

        {/* Contact Info Section */}
        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Contact Information</h3>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm ${
                errors.email ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="name@andretti.com"
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          {/* Phone Number */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={form.phoneNumber}
              onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm ${
                errors.phoneNumber ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="+1 (555) 123-4567"
            />
            {errors.phoneNumber && <p className="text-xs text-red-500 mt-1">{errors.phoneNumber}</p>}
          </div>

          {/* SMS Opt-In */}
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={form.smsOptIn}
              onChange={(e) => setForm((f) => ({ ...f, smsOptIn: e.target.checked }))}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <div>
              <span className="text-sm text-gray-700 font-medium">
                SMS Notifications
              </span>
              <p className="text-xs text-gray-500">
                Receive schedule change alerts via text message
              </p>
            </div>
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div>
            {onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Remove this person?')) {
                    onDelete();
                    onClose();
                  }
                }}
                className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                Remove
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
              disabled={!form.name.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {person ? 'Save Changes' : 'Add Person'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
