import { useRef } from 'react';
import { useAppStore } from '../../store/appStore';
import { DEPARTMENTS, DEPARTMENT_MAP, SERIES_COLORS } from '../../utils/constants';
import { formatTime, timeToMinutes } from '../../utils/time';
import { StatusIndicator } from '../common/StatusIndicator';
import type { Activity, Person } from '../../types/activity';
import type { MasterScheduleEvent } from '../../types/schedule';
import { Users, Building2, ZoomIn, ZoomOut } from 'lucide-react';

interface DetailedViewProps {
  activities: Activity[];
  masterEvents: MasterScheduleEvent[];
  people: Person[];
  onEditActivity: (activity: Activity) => void;
}

const DAY_START = 6; // 6 AM
const DAY_END = 23; // 11 PM
const TOTAL_MINUTES = (DAY_END - DAY_START) * 60;
const LANE_HEIGHT = 64;
const MASTER_LANE_HEIGHT = 48;

export function DetailedView({
  activities,
  masterEvents,
  people,
  onEditActivity,
}: DetailedViewProps) {
  const { laneMode, setLaneMode, pixelsPerMinute, setPixelsPerMinute } =
    useAppStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  const totalWidth = TOTAL_MINUTES * pixelsPerMinute;
  const hours = Array.from({ length: DAY_END - DAY_START }, (_, i) => DAY_START + i);

  const getLeft = (time: string) => {
    const mins = timeToMinutes(time) - DAY_START * 60;
    return Math.max(0, mins * pixelsPerMinute);
  };

  const getWidth = (start: string, end: string) => {
    const startMins = timeToMinutes(start) - DAY_START * 60;
    const endMins = timeToMinutes(end) - DAY_START * 60;
    return Math.max(20, (endMins - startMins) * pixelsPerMinute);
  };

  // Build lanes
  const lanes: {
    id: string;
    label: string;
    sublabel?: string;
    color: string;
    activities: Activity[];
  }[] = [];

  if (laneMode === 'department') {
    DEPARTMENTS.forEach((dept) => {
      lanes.push({
        id: dept.id,
        label: dept.name,
        color: dept.color,
        activities: activities.filter((a) => a.departmentIds.includes(dept.id)),
      });
    });
  } else {
    // Group by department, then person within each
    DEPARTMENTS.forEach((dept) => {
      const deptPeople = people.filter((p) => p.departmentId === dept.id);
      deptPeople.forEach((person) => {
        lanes.push({
          id: person.id,
          label: person.name,
          sublabel: dept.shortName,
          color: dept.color,
          activities: activities.filter((a) => a.personIds.includes(person.id)),
        });
      });
    });
  }

  const labelWidth = 160;

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Toolbar */}
      <div className="flex items-center gap-4 px-4 py-2 border-b border-gray-200 bg-gray-50 flex-shrink-0">
        {/* Lane mode toggle */}
        <div className="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setLaneMode('department')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
              laneMode === 'department'
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Building2 size={14} />
            Departments
          </button>
          <button
            onClick={() => setLaneMode('person')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
              laneMode === 'person'
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users size={14} />
            People
          </button>
        </div>

        {/* Zoom */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPixelsPerMinute(Math.max(1, pixelsPerMinute - 0.5))}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <ZoomOut size={16} />
          </button>
          <input
            type="range"
            min="1"
            max="6"
            step="0.5"
            value={pixelsPerMinute}
            onChange={(e) => setPixelsPerMinute(parseFloat(e.target.value))}
            className="w-20 accent-indigo-600"
          />
          <button
            onClick={() => setPixelsPerMinute(Math.min(6, pixelsPerMinute + 0.5))}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <ZoomIn size={16} />
          </button>
          <span className="text-[10px] text-gray-400 w-8">{pixelsPerMinute}x</span>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-auto" ref={scrollRef}>
        <div className="flex">
          {/* Lane labels (fixed) */}
          <div
            className="flex-shrink-0 bg-white border-r border-gray-200 sticky left-0 z-20"
            style={{ width: labelWidth }}
          >
            {/* Time header spacer */}
            <div className="h-8 border-b border-gray-200 bg-gray-50" />

            {/* Master schedule lane label */}
            <div
              className="flex items-center px-3 border-b border-gray-100 bg-gray-50"
              style={{ height: MASTER_LANE_HEIGHT }}
            >
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide truncate">
                Track Schedule
              </span>
            </div>

            {/* Lane labels */}
            {lanes.map((lane) => (
              <div
                key={lane.id}
                className="flex items-center px-3 border-b border-gray-100"
                style={{ height: LANE_HEIGHT }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: lane.color }}
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-gray-700 truncate">
                      {lane.label}
                    </div>
                    {lane.sublabel && (
                      <div className="text-[10px] text-gray-400">{lane.sublabel}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Timeline grid */}
          <div className="flex-1 relative" style={{ minWidth: totalWidth }}>
            {/* Hour headers */}
            <div className="h-8 flex border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="border-l border-gray-200 flex-shrink-0 flex items-end pb-1 px-1"
                  style={{ width: 60 * pixelsPerMinute }}
                >
                  <span className="text-[10px] text-gray-400 font-medium">
                    {formatTime(`${hour.toString().padStart(2, '0')}:00`)}
                  </span>
                </div>
              ))}
            </div>

            {/* Master schedule lane */}
            <div
              className="relative border-b border-gray-200 bg-gray-50/30"
              style={{ height: MASTER_LANE_HEIGHT }}
            >
              {/* Grid lines */}
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="absolute top-0 bottom-0 border-l border-gray-100"
                  style={{ left: (hour - DAY_START) * 60 * pixelsPerMinute }}
                />
              ))}
              {masterEvents.map((event) => (
                <div
                  key={event.id}
                  className="absolute top-1 rounded overflow-hidden flex items-center px-2 cursor-default"
                  style={{
                    left: getLeft(event.startTime),
                    width: getWidth(event.startTime, event.endTime),
                    height: MASTER_LANE_HEIGHT - 8,
                    backgroundColor: `${SERIES_COLORS[event.series] || SERIES_COLORS.GENERAL}25`,
                    borderLeft: `3px solid ${SERIES_COLORS[event.series] || SERIES_COLORS.GENERAL}`,
                  }}
                  title={`${formatTime(event.startTime)} - ${formatTime(event.endTime)}: ${event.title}`}
                >
                  <span
                    className="text-[10px] font-medium truncate"
                    style={{ color: SERIES_COLORS[event.series] || SERIES_COLORS.GENERAL }}
                  >
                    {event.title}
                  </span>
                </div>
              ))}
            </div>

            {/* Activity lanes */}
            {lanes.map((lane) => (
              <div
                key={lane.id}
                className="relative border-b border-gray-100"
                style={{ height: LANE_HEIGHT }}
              >
                {/* Grid lines */}
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="absolute top-0 bottom-0 border-l border-gray-50"
                    style={{ left: (hour - DAY_START) * 60 * pixelsPerMinute }}
                  />
                ))}
                {/* Events */}
                {lane.activities.map((activity) => {
                  const dept = DEPARTMENT_MAP[activity.departmentIds[0]];
                  return (
                    <button
                      key={activity.id}
                      onClick={() => onEditActivity(activity)}
                      className={`absolute top-2 rounded-md overflow-hidden flex items-center gap-1 px-2 transition-shadow hover:shadow-lg cursor-pointer ${
                        activity.status === 'pending'
                          ? 'border border-dashed'
                          : 'border border-solid'
                      }`}
                      style={{
                        left: getLeft(activity.startTime),
                        width: getWidth(activity.startTime, activity.endTime),
                        height: LANE_HEIGHT - 16,
                        backgroundColor: `${dept?.color || '#6B7280'}18`,
                        borderColor: `${dept?.color || '#6B7280'}60`,
                      }}
                      title={`${formatTime(activity.startTime)} - ${formatTime(activity.endTime)}: ${activity.name}`}
                    >
                      <StatusIndicator status={activity.status} />
                      <span className="text-[11px] font-medium text-gray-800 truncate">
                        {activity.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
