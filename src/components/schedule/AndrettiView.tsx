import { DAYS, DEPARTMENT_MAP } from '../../utils/constants';
import { formatTimeRange } from '../../utils/time';
import { Badge } from '../common/Badge';
import { StatusIndicator } from '../common/StatusIndicator';
import type { Activity, Person } from '../../types/activity';
import type { DayOfWeek } from '../../types/schedule';

interface AndrettiViewProps {
  activities: Activity[];
  people: Person[];
  onEditActivity: (activity: Activity) => void;
  dayLabel: string;
  fullWeek: boolean;
}

export function AndrettiView({
  activities,
  people,
  onEditActivity,
  dayLabel,
  fullWeek,
}: AndrettiViewProps) {
  const personMap = new Map(people.map((p) => [p.id, p]));

  if (fullWeek) {
    return (
      <div className="h-full overflow-auto">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Full Week &mdash; Andretti Schedule
            </h2>
            <p className="text-sm text-gray-500">
              {activities.length} {activities.length === 1 ? 'activity' : 'activities'}
            </p>
          </div>

          {activities.length === 0 ? (
            <EmptyState message="No Andretti activities scheduled this week" />
          ) : (
            <div className="space-y-6">
              {DAYS.map((day) => {
                const dayActivities = activities
                  .filter((a) => a.day === day.id)
                  .sort((a, b) => a.startTime.localeCompare(b.startTime));
                if (dayActivities.length === 0) return null;
                return (
                  <div key={day.id}>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 border-b border-gray-200 pb-1">
                      {day.label}
                    </h3>
                    <div className="space-y-2">
                      {dayActivities.map((activity) => (
                        <ActivityCard
                          key={activity.id}
                          activity={activity}
                          personMap={personMap}
                          onEdit={onEditActivity}
                        />
                      ))}
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

  const sorted = [...activities].sort((a, b) =>
    a.startTime.localeCompare(b.startTime)
  );

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-3xl mx-auto px-4 py-4">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {dayLabel} &mdash; Andretti Schedule
          </h2>
          <p className="text-sm text-gray-500">
            {sorted.length} {sorted.length === 1 ? 'activity' : 'activities'}
          </p>
        </div>

        {sorted.length === 0 ? (
          <EmptyState message={`No Andretti activities scheduled for ${dayLabel.toLowerCase()}`} />
        ) : (
          <div className="space-y-2">
            {sorted.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                personMap={personMap}
                onEdit={onEditActivity}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-16 text-gray-400">
      <p className="text-lg font-medium">No team activities</p>
      <p className="text-sm mt-1">{message}</p>
    </div>
  );
}

function ActivityCard({
  activity,
  personMap,
  onEdit,
}: {
  activity: Activity;
  personMap: Map<string, Person>;
  onEdit: (activity: Activity) => void;
}) {
  const primaryDept = DEPARTMENT_MAP[activity.departmentIds[0]];
  return (
    <button
      key={activity.id}
      onClick={() => onEdit(activity)}
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
}
