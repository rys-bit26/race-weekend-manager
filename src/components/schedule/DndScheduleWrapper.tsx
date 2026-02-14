import { useState, type ReactNode } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
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
      distance: 8, // 8px threshold prevents accidental drag on click
    },
  });

  const keyboardSensor = useSensor(KeyboardSensor);

  const sensors = useSensors(pointerSensor, keyboardSensor);

  const handleDragStart = (event: DragStartEvent) => {
    const activity = event.active.data.current?.activity as Activity | undefined;
    setActiveActivity(activity ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveActivity(null);

    if (!over) return;

    const sourceDay = active.data.current?.day as DayOfWeek | undefined;
    const targetDay = over.id as DayOfWeek;
    const activityId = active.id as string;

    if (sourceDay && targetDay && sourceDay !== targetDay) {
      onMoveActivity(activityId, targetDay);
    }
  };

  const handleDragCancel = () => {
    setActiveActivity(null);
  };

  const overlayDept = activeActivity
    ? DEPARTMENT_MAP[activeActivity.departmentIds[0]]
    : undefined;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      {children}

      <DragOverlay dropAnimation={null}>
        {activeActivity ? (
          <div
            className="rounded-lg px-3 py-2.5 bg-white shadow-xl ring-2 ring-indigo-400 border-2 border-solid max-w-[240px] rotate-2 opacity-90"
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
      </DragOverlay>
    </DndContext>
  );
}
