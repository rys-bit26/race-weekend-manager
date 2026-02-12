import { useAppStore } from '../../store/appStore';
import { DAYS, DEPARTMENT_MAP, SERIES_COLORS } from '../../utils/constants';
import { formatTimeRange } from '../../utils/time';
import { Badge } from '../common/Badge';
import { StatusIndicator } from '../common/StatusIndicator';
import type { Activity } from '../../types/activity';
import type { MasterScheduleEvent, DayOfWeek } from '../../types/schedule';
import type { Person } from '../../types/activity';

interface ExecutiveViewProps {
  activities: Activity[];
  masterEvents: MasterScheduleEvent[];
  people: Person[];
  onEditActivity: (activity: Activity) => void;
}

export function ExecutiveView({
  activities,
  masterEvents,
  people,
  onEditActivity,
}: ExecutiveViewProps) {
  const { activeDay } = useAppStore();
  const personMap = new Map(people.map((p) => [p.id, p]));

  const getActivitiesForDay = (day: DayOfWeek) =>
    activities
      .filter((a) => a.day === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const getMasterEventsForDay = (day: DayOfWeek) =>
    masterEvents
      .filter((e) => e.day === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="h-full overflow-auto">
      {/* Desktop: all 5 days as columns */}
      <div className="hidden md:grid md:grid-cols-5 gap-px bg-gray-200 min-h-full">
        {DAYS.map((day) => (
          <DayColumn
            key={day.id}
            day={day}
            activities={getActivitiesForDay(day.id)}
            masterEvents={getMasterEventsForDay(day.id)}
            personMap={personMap}
            onEditActivity={onEditActivity}
          />
        ))}
      </div>

      {/* Mobile: single day */}
      <div className="md:hidden">
        {DAYS.filter((d) => d.id === activeDay).map((day) => (
          <DayColumn
            key={day.id}
            day={day}
            activities={getActivitiesForDay(day.id)}
            masterEvents={getMasterEventsForDay(day.id)}
            personMap={personMap}
            onEditActivity={onEditActivity}
          />
        ))}
      </div>
    </div>
  );
}

interface DayColumnProps {
  day: { id: DayOfWeek; label: string };
  activities: Activity[];
  masterEvents: MasterScheduleEvent[];
  personMap: Map<string, Person>;
  onEditActivity: (activity: Activity) => void;
}

type ScheduleItem =
  | { type: 'master'; event: MasterScheduleEvent }
  | { type: 'activity'; activity: Activity };

function DayColumn({
  day,
  activities,
  masterEvents,
  personMap,
  onEditActivity,
}: DayColumnProps) {
  // Merge master events and team activities into a single chronological list
  const items: ScheduleItem[] = [
    ...masterEvents.map((event): ScheduleItem => ({ type: 'master', event })),
    ...activities.map((activity): ScheduleItem => ({ type: 'activity', activity })),
  ].sort((a, b) => {
    const aTime = a.type === 'master' ? a.event.startTime : a.activity.startTime;
    const bTime = b.type === 'master' ? b.event.startTime : b.activity.startTime;
    return aTime.localeCompare(bTime);
  });

  return (
    <div className="bg-white flex flex-col">
      {/* Day header */}
      <div className="sticky top-0 z-10 bg-slate-800 text-white px-3 py-2.5 text-center">
        <div className="font-semibold text-sm">{day.label}</div>
      </div>

      <div className="flex-1 p-2 space-y-2">
        {items.map((item) => {
          if (item.type === 'master') {
            const event = item.event;
            return (
              <div
                key={event.id}
                className="rounded-lg px-3 py-2 border"
                style={{
                  backgroundColor: `${SERIES_COLORS[event.series] || SERIES_COLORS.GENERAL}15`,
                  borderColor: `${SERIES_COLORS[event.series] || SERIES_COLORS.GENERAL}40`,
                }}
              >
                <div className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">
                  {formatTimeRange(event.startTime, event.endTime)}
                </div>
                <div className="text-xs font-medium text-gray-700 mt-0.5 leading-tight">
                  {event.title}
                </div>
              </div>
            );
          }

          const activity = item.activity;
          const primaryDept = DEPARTMENT_MAP[activity.departmentIds[0]];
          return (
            <button
              key={activity.id}
              onClick={() => onEditActivity(activity)}
              className={`w-full text-left rounded-lg px-3 py-2.5 transition-all hover:shadow-md cursor-pointer ${
                activity.status === 'pending'
                  ? 'border-2 border-dashed'
                  : 'border-2 border-solid'
              }`}
              style={{
                borderColor: primaryDept?.color || '#6B7280',
                borderLeftWidth: '4px',
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-medium text-gray-500">
                  {formatTimeRange(activity.startTime, activity.endTime)}
                </span>
                <StatusIndicator status={activity.status} />
              </div>
              <div className="text-sm font-medium text-gray-900 leading-tight mb-1.5">
                {activity.name}
              </div>
              <div className="flex flex-wrap gap-1 mb-1">
                {activity.departmentIds.map((dId) => {
                  const dept = DEPARTMENT_MAP[dId];
                  return dept ? (
                    <Badge
                      key={dId}
                      label={dept.shortName}
                      color={dept.color}
                      bgColor={dept.bgColor}
                      small
                    />
                  ) : null;
                })}
              </div>
              {activity.location && (
                <div className="text-[10px] text-gray-400">{activity.location}</div>
              )}
              {activity.personIds.length > 0 && (
                <div className="text-[10px] text-gray-400 mt-0.5 truncate">
                  {activity.personIds
                    .slice(0, 3)
                    .map((id) => personMap.get(id)?.name || '')
                    .filter(Boolean)
                    .join(', ')}
                  {activity.personIds.length > 3 &&
                    ` +${activity.personIds.length - 3}`}
                </div>
              )}
            </button>
          );
        })}

        {items.length === 0 && (
          <div className="text-center text-sm text-gray-300 py-8">No activities</div>
        )}
      </div>
    </div>
  );
}
