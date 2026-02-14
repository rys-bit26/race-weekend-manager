import { useState, useCallback, type ReactNode } from 'react';
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
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      {children}

      {/* Portal the overlay to document.body so it's not clipped by overflow containers */}
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
  );
}
