import { type ReactNode } from 'react';
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import type { DayOfWeek } from '../../types/schedule';

interface DndScheduleWrapperProps {
  children: ReactNode;
  onMoveActivity: (activityId: string, newDay: DayOfWeek) => void;
}

export function DndScheduleWrapper({
  children,
  onMoveActivity,
}: DndScheduleWrapperProps) {
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8, // 8px threshold prevents accidental drag on click
    },
  });

  const keyboardSensor = useSensor(KeyboardSensor);

  const sensors = useSensors(pointerSensor, keyboardSensor);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const sourceDay = active.data.current?.day as DayOfWeek | undefined;
    const targetDay = over.id as DayOfWeek;
    const activityId = active.id as string;

    if (sourceDay && targetDay && sourceDay !== targetDay) {
      onMoveActivity(activityId, targetDay);
    }
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      {children}
    </DndContext>
  );
}
