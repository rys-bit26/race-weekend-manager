import { useDroppable } from '@dnd-kit/core';
import { useAppStore } from '../../store/appStore';
import { DAYS, DEPARTMENT_MAP, SERIES_COLORS } from '../../utils/constants';
import { getVisibleDaysForTablet } from '../../utils/responsiveDays';
import { formatTimeRange } from '../../utils/time';
import { DndScheduleWrapper, useDragActivity, DropInsertionLine } from './DndScheduleWrapper';
import { DraggableActivityCard } from './DraggableActivityCard';
import { Badge } from '../common/Badge';
import { StatusIndicator } from '../common/StatusIndicator';
import type { Activity, Person } from '../../types/activity';
import type { MasterScheduleEvent, DayOfWeek } from '../../types/schedule';

type ScheduleItem =
  | { type: 'master'; event: MasterScheduleEvent }
  | { type: 'activity'; activity: Activity };

interface DailyViewProps {
  activities: Activity[];
  masterEvents: MasterScheduleEvent[];
  people: Person[];
  onEditActivity: (activity: Activity) => void;
  onMoveActivity: (activityId: string, newDay: DayOfWeek) => void;
  dayLabel: string;
  fullWeek: boolean;
}

function buildItems(
  activities: Activity[],
  masterEvents: MasterScheduleEvent[]
): ScheduleItem[] {
  return [
    ...masterEvents.map((event): ScheduleItem => ({ type: 'master', event })),
    ...activities.map((activity): ScheduleItem => ({ type: 'activity', activity })),
  ].sort((a, b) => {
    const aTime = a.type === 'master' ? a.event.startTime : a.activity.startTime;
    const bTime = b.type === 'master' ? b.event.startTime : b.activity.startTime;
    if (aTime !== bTime) return aTime.localeCompare(bTime);
    if (a.type === 'master' && b.type !== 'master') return -1;
    if (a.type !== 'master' && b.type === 'master') return 1;
    return 0;
  });
}

export function DailyView({
  activities,
  masterEvents,
  people,
  onEditActivity,
  onMoveActivity,
  dayLabel,
  fullWeek,
}: DailyViewProps) {
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

  if (fullWeek) {
    return (
      <DndScheduleWrapper onMoveActivity={onMoveActivity}>
        <div className="h-full overflow-auto">
          {/* Desktop (lg+): all 5 days as columns */}
          <div className="hidden lg:grid lg:grid-cols-5 gap-px bg-gray-200 min-h-full">
            {DAYS.map((day) => (
              <DailyDayColumn
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
              <DailyDayColumn
                key={day.id}
                day={day}
                activities={getActivitiesForDay(day.id)}
                masterEvents={getMasterEventsForDay(day.id)}
                personMap={personMap}
                onEditActivity={onEditActivity}
              />
            ))}
          </div>

          {/* Mobile: single active day */}
          <div className="md:hidden">
            {DAYS.filter((d) => d.id === activeDay).map((day) => (
              <DailyDayColumn
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

  const items = buildItems(activities, masterEvents);

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-3xl mx-auto px-4 py-4">
        <div className="mb-4">
          <h2 className="text-lg font-semibold font-heading text-gray-900">
            {dayLabel} &mdash; Daily Schedule
          </h2>
          <p className="text-sm text-gray-500">
            {masterEvents.length} track {masterEvents.length === 1 ? 'event' : 'events'} &middot;{' '}
            {activities.length} team {activities.length === 1 ? 'activity' : 'activities'}
          </p>
        </div>

        {items.length === 0 ? (
          <EmptyState message={`Nothing on the schedule for ${dayLabel.toLowerCase()}`} />
        ) : (
          <div className="space-y-2">
            <ItemList
              items={items}
              personMap={personMap}
              onEditActivity={onEditActivity}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Full-week column component ── */

interface DailyDayColumnProps {
  day: { id: DayOfWeek; label: string };
  activities: Activity[];
  masterEvents: MasterScheduleEvent[];
  personMap: Map<string, Person>;
  onEditActivity: (activity: Activity) => void;
}

function DailyDayColumn({
  day,
  activities,
  masterEvents,
  personMap,
  onEditActivity,
}: DailyDayColumnProps) {
  const { isOver, setNodeRef } = useDroppable({ id: day.id });
  const dragActivity = useDragActivity();
  const items = buildItems(activities, masterEvents);

  // Compute chronological insertion index
  let insertionIndex = -1;
  if (isOver && dragActivity) {
    const dragTime = dragActivity.startTime;
    insertionIndex = items.length;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const itemTime = item.type === 'master' ? item.event.startTime : item.activity.startTime;
      if (dragTime <= itemTime) {
        insertionIndex = i;
        break;
      }
    }
  }

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
        {items.map((item, idx) => {
          const itemEl = item.type === 'master' ? (() => {
            const event = item.event;
            const seriesColor =
              SERIES_COLORS[event.series] || SERIES_COLORS.GENERAL;
            return (
              <div
                className="rounded-lg px-3 py-2 border"
                style={{
                  backgroundColor: `${seriesColor}15`,
                  borderColor: `${seriesColor}40`,
                }}
              >
                <div className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">
                  {formatTimeRange(event.startTime, event.endTime)}
                </div>
                <div className="text-xs font-medium font-heading text-gray-700 mt-0.5 leading-tight">
                  {event.title}
                </div>
              </div>
            );
          })() : (
            <DraggableActivityCard
              activity={item.activity}
              personMap={personMap}
              onEdit={onEditActivity}
            />
          );

          return (
            <div key={item.type === 'master' ? item.event.id : item.activity.id}>
              {insertionIndex === idx && dragActivity && (
                <DropInsertionLine time={formatTimeRange(dragActivity.startTime, dragActivity.endTime)} />
              )}
              {itemEl}
            </div>
          );
        })}

        {insertionIndex === items.length && dragActivity && (
          <DropInsertionLine time={formatTimeRange(dragActivity.startTime, dragActivity.endTime)} />
        )}

        {items.length === 0 && !isOver && (
          <div className="text-center text-sm text-gray-300 py-8">No activities</div>
        )}

        {items.length === 0 && isOver && dragActivity && (
          <DropInsertionLine time={formatTimeRange(dragActivity.startTime, dragActivity.endTime)} />
        )}
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-16 text-gray-400">
      <p className="text-lg font-medium font-heading">No events scheduled</p>
      <p className="text-sm mt-1">{message}</p>
    </div>
  );
}

function ItemList({
  items,
  personMap,
  onEditActivity,
}: {
  items: ScheduleItem[];
  personMap: Map<string, Person>;
  onEditActivity: (activity: Activity) => void;
}) {
  return (
    <>
      {items.map((item) => {
        if (item.type === 'master') {
          const event = item.event;
          const seriesColor =
            SERIES_COLORS[event.series] || SERIES_COLORS.GENERAL;
          return (
            <div
              key={event.id}
              className="rounded-lg px-4 py-3 border-2"
              style={{
                backgroundColor: `${seriesColor}10`,
                borderColor: `${seriesColor}35`,
                borderLeftWidth: '5px',
                borderLeftColor: seriesColor,
              }}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs font-medium text-gray-500">
                  {formatTimeRange(event.startTime, event.endTime)}
                </span>
                <span
                  className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${seriesColor}20`,
                    color: seriesColor,
                  }}
                >
                  {event.series.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="text-sm font-medium font-heading text-gray-700 leading-tight">
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
            className={`w-full text-left rounded-lg px-4 py-3 transition-all hover:shadow-md cursor-pointer bg-white ${
              activity.status === 'pending'
                ? 'border-2 border-dashed'
                : 'border-2 border-solid'
            }`}
            style={{
              borderColor: primaryDept?.color || '#6B7280',
              borderLeftWidth: '5px',
            }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-500">
                {formatTimeRange(activity.startTime, activity.endTime)}
              </span>
              <StatusIndicator status={activity.status} />
            </div>
            <div className="text-sm font-semibold font-heading text-gray-900 leading-tight mb-1.5">
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
              <div className="text-xs text-gray-400">{activity.location}</div>
            )}
            {activity.personIds.length > 0 && (
              <div className="text-xs text-gray-400 mt-0.5 truncate">
                {activity.personIds
                  .slice(0, 4)
                  .map((id) => personMap.get(id)?.name || '')
                  .filter(Boolean)
                  .join(', ')}
                {activity.personIds.length > 4 &&
                  ` +${activity.personIds.length - 4}`}
              </div>
            )}
          </button>
        );
      })}
    </>
  );
}
