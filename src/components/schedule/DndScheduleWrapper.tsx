import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { createPortal } from 'react-dom';
import { DEPARTMENT_MAP } from '../../utils/constants';
import { ActivityCardContent } from './DraggableActivityCard';
import type { Activity } from '../../types/activity';
import type { DayOfWeek } from '../../types/schedule';

/* ── Context to expose the dragged activity to child columns ── */

const DragActivityContext = createContext<Activity | null>(null);

export function useDragActivity() {
  return useContext(DragActivityContext);
}

/* ── Insertion line component ── */

export function DropInsertionLine({ time }: { time: string }) {
  return (
    <div className="flex items-center gap-1.5 -my-0.5 py-0.5">
      <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 flex-shrink-0" />
      <div className="flex-1 h-0.5 bg-indigo-500 rounded-full" />
      <span className="text-[9px] font-bold text-indigo-600 whitespace-nowrap flex-shrink-0">
        {time}
      </span>
      <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 flex-shrink-0" />
    </div>
  );
}

/* ── Wrapper ── */

interface DndScheduleWrapperProps {
  children: ReactNode;
  onMoveActivity: (activityId: string, newDay: DayOfWeek) => void;
}

export function DndScheduleWrapper({
  children,
  onMoveActivity,
}: DndScheduleWrapperProps) {
  const [activeActivity, setActiveActivity] = useState<Activity | null>(null);

  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8,
    },
  });

  const sensors = useSensors(pointerSensor);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const activity = event.active.data.current?.activity as Activity | undefined;
    setActiveActivity(activity ?? null);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveActivity(null);

    if (!over) return;

    const sourceDay = active.data.current?.day as DayOfWeek | undefined;
    const targetDay = over.id as DayOfWeek;
    const activityId = active.id as string;

    if (sourceDay && targetDay && sourceDay !== targetDay) {
      onMoveActivity(activityId, targetDay);
    }
  }, [onMoveActivity]);

  const handleDragCancel = useCallback(() => {
    setActiveActivity(null);
  }, []);

  const overlayDept = activeActivity
    ? DEPARTMENT_MAP[activeActivity.departmentIds[0]]
    : undefined;

  return (
    <DragActivityContext.Provider value={activeActivity}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        {children}

        {createPortal(
          <DragOverlay dropAnimation={null}>
            {activeActivity ? (
              <div
                className="rounded-lg px-3 py-2.5 bg-white shadow-2xl ring-2 ring-indigo-500 border-2 border-solid max-w-[220px] rotate-1"
                style={{
                  borderColor: overlayDept?.color || '#6B7280',
                  borderLeftWidth: '4px',
                }}
              >
                <ActivityCardContent
                  activity={activeActivity}
                  primaryDept={overlayDept}
                />
              </div>
            ) : null}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    </DragActivityContext.Provider>
  );
}
