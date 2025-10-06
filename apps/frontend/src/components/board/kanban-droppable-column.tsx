'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';

export const DroppableColumn = React.memo(function DroppableColumn({
  columnValue,
  children,
}: {
  columnValue: string;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `column-${columnValue}` });

  return (
    <div
      ref={setNodeRef}
      className={`h-full flex flex-col transition-all duration-150 ${
        isOver ? 'bg-primary/5 border border-primary/20 rounded-lg shadow-inner' : ''
      }`}
    >
      {children}
    </div>
  );
});
