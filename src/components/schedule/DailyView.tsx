import { DAYS, DEPARTMENT_MAP, SERIES_COLORS } from '../../utils/constants';
import { formatTimeRange } from '../../utils/time';
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
  dayLabel,
  fullWeek,
}: DailyViewProps) {
  const personMap = new Map(people.map((p) => [p.id, p]));

  if (fullWeek) {
    const totalTrack = masterEvents.length;
    const totalTeam = activities.length;

    return (
      <div className="h-full overflow-auto">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Full Week &mdash; Daily Schedule
            </h2>
            <p className="text-sm text-gray-500">
              {totalTrack} track {totalTrack === 1 ? 'event' : 'events'} &middot;{' '}
              {totalTeam} team {totalTeam === 1 ? 'activity' : 'activities'}
            </p>
          </div>

          {totalTrack === 0 && totalTeam === 0 ? (
            <EmptyState message="Nothing on the schedule this week" />
          ) : (
            <div className="space-y-6">
              {DAYS.map((day) => {
                const dayActivities = activities.filter((a) => a.day === day.id);
                const dayMasterEvents = masterEvents.filter((e) => e.day === day.id);
                const items = buildItems(dayActivities, dayMasterEvents);
                if (items.length === 0) return null;
                return (
                  <div key={day.id}>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 border-b border-gray-200 pb-1">
                      {day.label}
                    </h3>
                    <div className="space-y-2">
                      <ItemList
                        items={items}
                        personMap={personMap}
                        onEditActivity={onEditActivity}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  const items = buildItems(activities, masterEvents);

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-3xl mx-auto px-4 py-4">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
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

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-16 text-gray-400">
      <p className="text-lg font-medium">No events scheduled</p>
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
              <div className="text-sm font-medium text-gray-700 leading-tight">
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
            <div className="text-sm font-semibold text-gray-900 leading-tight mb-1.5">
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
