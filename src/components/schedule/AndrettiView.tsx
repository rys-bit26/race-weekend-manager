import { DEPARTMENT_MAP } from '../../utils/constants';
import { formatTimeRange } from '../../utils/time';
import { Badge } from '../common/Badge';
import { StatusIndicator } from '../common/StatusIndicator';
import type { Activity, Person } from '../../types/activity';

interface AndrettiViewProps {
  activities: Activity[];
  people: Person[];
  onEditActivity: (activity: Activity) => void;
  dayLabel: string;
}

export function AndrettiView({
  activities,
  people,
  onEditActivity,
  dayLabel,
}: AndrettiViewProps) {
  const personMap = new Map(people.map((p) => [p.id, p]));

  const sorted = [...activities].sort((a, b) =>
    a.startTime.localeCompare(b.startTime)
  );

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-3xl mx-auto px-4 py-4">
        {/* Day header */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {dayLabel} &mdash; Andretti Schedule
          </h2>
          <p className="text-sm text-gray-500">
            {sorted.length} {sorted.length === 1 ? 'activity' : 'activities'}
          </p>
        </div>

        {sorted.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg font-medium">No team activities</p>
            <p className="text-sm mt-1">
              No Andretti activities scheduled for {dayLabel.toLowerCase()}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {sorted.map((activity) => {
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
          </div>
        )}
      </div>
    </div>
  );
}
