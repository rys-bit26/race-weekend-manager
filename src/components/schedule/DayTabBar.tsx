import { useAppStore } from '../../store/appStore';
import { DAYS } from '../../utils/constants';

export function DayTabBar() {
  const { activeDay, setActiveDay } = useAppStore();

  return (
    <div className="flex border-b border-gray-200 bg-white overflow-x-auto">
      {DAYS.map((day) => (
        <button
          key={day.id}
          onClick={() => setActiveDay(day.id)}
          className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors relative ${
            activeDay === day.id
              ? 'text-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <span className="hidden sm:inline">{day.label}</span>
          <span className="sm:hidden">{day.shortLabel}</span>
          {activeDay === day.id && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
          )}
        </button>
      ))}
    </div>
  );
}
