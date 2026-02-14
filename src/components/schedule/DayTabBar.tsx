import { useAppStore } from '../../store/appStore';
import { DAYS } from '../../utils/constants';

export function DayTabBar() {
  const { activeDay, setActiveDay, activeView, showFullWeek, setShowFullWeek } =
    useAppStore();

  const showFullWeekOption = activeView === 'andretti' || activeView === 'daily';

  return (
    <div className="flex border-b border-gray-200 bg-white overflow-x-auto">
      {DAYS.map((day) => (
        <button
          key={day.id}
          onClick={() => {
            setActiveDay(day.id);
            // setActiveDay already sets showFullWeek to false
          }}
          className={`px-2 md:px-3 lg:px-4 py-2 md:py-2.5 text-xs md:text-sm font-medium font-heading whitespace-nowrap transition-colors relative ${
            !showFullWeek && activeDay === day.id
              ? 'text-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <span className="hidden sm:inline">{day.label}</span>
          <span className="sm:hidden">{day.shortLabel}</span>
          {!showFullWeek && activeDay === day.id && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
          )}
        </button>
      ))}

      {showFullWeekOption && (
        <button
          onClick={() => setShowFullWeek(true)}
          className={`px-2 md:px-3 lg:px-4 py-2 md:py-2.5 text-xs md:text-sm font-bold font-heading whitespace-nowrap transition-colors relative ${
            showFullWeek
              ? 'text-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <span className="hidden sm:inline">Full Week</span>
          <span className="sm:hidden">All</span>
          {showFullWeek && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
          )}
        </button>
      )}
    </div>
  );
}
