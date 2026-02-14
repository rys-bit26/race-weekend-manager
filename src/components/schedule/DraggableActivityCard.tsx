import { CSS } from '@dnd-kit/utilities';
import { useDraggable } from '@dnd-kit/core';
import { DEPARTMENT_MAP } from '../../utils/constants';
import { formatTimeRange } from '../../utils/time';
import { Badge } from '../common/Badge';
import { StatusIndicator } from '../common/StatusIndicator';
import type { Activity, Person } from '../../types/activity';
import type { DayOfWeek } from '../../types/schedule';

interface DraggableActivityCardProps {
  activity: Activity;
  personMap: Map<string, Person>;
  onEdit: (activity: Activity) => void;
}

export function DraggableActivityCard({
  activity,
  personMap,
  onEdit,
}: DraggableActivityCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: activity.id,
    data: {
      day: activity.day as DayOfWeek,
      activity,
    },
  });

  const primaryDept = DEPARTMENT_MAP[activity.departmentIds[0]];

  return (
    <button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={() => {
        // Don't open edit modal if we just finished a drag
        if (!isDragging) onEdit(activity);
      }}
      className={`w-full text-left rounded-lg px-3 py-2.5 transition-shadow hover:shadow-md cursor-grab active:cursor-grabbing ${
        activity.status === 'pending'
          ? 'border-2 border-dashed'
          : 'border-2 border-solid'
      } ${isDragging ? 'opacity-30 z-50' : ''}`}
      style={{
        borderColor: primaryDept?.color || '#6B7280',
        borderLeftWidth: '4px',
        transform: CSS.Translate.toString(transform),
      }}
    >
      <ActivityCardContent
        activity={activity}
        personMap={personMap}
        primaryDept={primaryDept}
      />
    </button>
  );
}

/** Shared card content used by both the in-place card and the drag overlay */
export function ActivityCardContent({
  activity,
  personMap,
  primaryDept,
}: {
  activity: Activity;
  personMap?: Map<string, Person>;
  primaryDept: { color: string; shortName: string; bgColor: string } | undefined;
}) {
  return (
    <>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-medium text-gray-500">
          {formatTimeRange(activity.startTime, activity.endTime)}
        </span>
        <StatusIndicator status={activity.status} />
      </div>
      <div className="text-sm font-medium font-heading text-gray-900 leading-tight mb-1.5">
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
      {activity.personIds.length > 0 && personMap && (
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
    </>
  );
}
