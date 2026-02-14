import { useDroppable } from '@dnd-kit/core';
import { useAppStore } from '../../store/appStore';
import { DAYS, DEPARTMENT_MAP, SERIES_COLORS } from '../../utils/constants';
import { getVisibleDaysForTablet } from '../../utils/responsiveDays';
import { formatTimeRange } from '../../utils/time';
import { DndScheduleWrapper } from './DndScheduleWrapper';
import { DraggableActivityCard } from './DraggableActivityCard';
import type { Activity } from '../../types/activity';
import type { MasterScheduleEvent, DayOfWeek } from '../../types/schedule';
import type { Person } from '../../types/activity';

interface ExecutiveViewProps {
  activities: Activity[];
  masterEvents: MasterScheduleEvent[];
  people: Person[];
  onEditActivity: (activity: Activity) => void;
  onMoveActivity: (activityId: string, newDay: DayOfWeek) => void;
}

export function ExecutiveView({
  activities,
  masterEvents,
  people,
  onEditActivity,
  onMoveActivity,
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

  const tabletDays = getVisibleDaysForTablet(activeDay);

  return (
    <DndScheduleWrapper onMoveActivity={onMoveActivity}>
      <div className="h-full overflow-auto">
        {/* Desktop (lg+): all 5 days as columns */}
        <div className="hidden lg:grid lg:grid-cols-5 gap-px bg-gray-200 min-h-full">
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

        {/* Tablet (md-lg): 3 days centered on active day */}
        <div className="hidden md:grid lg:hidden md:grid-cols-3 gap-px bg-gray-200 min-h-full">
          {tabletDays.map((day) => (
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

        {/* Mobile: single day (no drag between days) */}
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
    </DndScheduleWrapper>
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
  const { isOver, setNodeRef } = useDroppable({ id: day.id });

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
    <div
      ref={setNodeRef}
      className={`flex flex-col transition-all duration-150 ${
        isOver
          ? 'bg-indigo-100 ring-4 ring-inset ring-indigo-500'
          : 'bg-white'
      }`}
    >
      {/* Day header */}
      <div
        className={`sticky top-0 z-10 px-3 py-2.5 text-center text-white transition-colors duration-150 ${
          isOver ? 'bg-indigo-600' : 'bg-slate-800'
        }`}
      >
        <div className="font-semibold font-heading text-sm">
          {isOver ? `↓ Drop on ${day.label}` : day.label}
        </div>
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

          return (
            <DraggableActivityCard
              key={item.activity.id}
              activity={item.activity}
              personMap={personMap}
              onEdit={onEditActivity}
            />
          );
        })}

        {items.length === 0 && (
          <div className="text-center text-sm text-gray-300 py-8">No activities</div>
        )}
      </div>
    </div>
  );
}
