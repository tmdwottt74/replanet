import React, { useRef, useState } from 'react';
import { PlacedObject } from '../types/garden';

type PlacedObjectProps = {
  object: PlacedObject;
  onMove: (id: string, x: number, y: number) => void;
  onRemove: (id: string) => void;
};

function PlacedObjectComponent({ object, onMove, onRemove }: PlacedObjectProps) {
  const objectRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showDeleteButton, setShowDeleteButton] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const startX = e.clientX;
    const startY = e.clientY;
    const startLeft = object.x;
    const startTop = object.y;

    const handleMouseMove = (e: MouseEvent) => {
      const newX = startLeft + (e.clientX - startX);
      const newY = startTop + (e.clientY - startY);
      onMove(object.id, newX, newY);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleDoubleClick = () => {
    if (window.confirm(`${object.name}을(를) 정원에서 제거하시겠습니까?`)) {
      onRemove(object.id);
    }
  };

  return (
    <div
      ref={objectRef}
      style={{
        position: 'absolute',
        left: object.x,
        top: object.y,
        cursor: isDragging ? 'grabbing' : 'grab',
        border: isDragging ? '2px solid #059669' : '1px dashed #9ca3af',
        padding: '0.5rem',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: '0.5rem',
        boxShadow: isDragging ? '0 4px 12px rgba(0, 0, 0, 0.2)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        transition: 'all 0.2s',
        transform: isDragging ? 'scale(1.05)' : 'scale(1)',
        zIndex: isDragging ? 10 : 1
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => setShowDeleteButton(true)}
      onMouseLeave={() => setShowDeleteButton(false)}
    >
      <div style={{ fontSize: '2.5rem', position: 'relative' }}>
        {object.icon}
        
        {/* 삭제 버튼 */}
        {showDeleteButton && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDoubleClick();
            }}
            style={{
              position: 'absolute',
              top: '-0.5rem',
              right: '-0.5rem',
              width: '1.5rem',
              height: '1.5rem',
              borderRadius: '50%',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              fontSize: '0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
            }}
            title="더블클릭 또는 이 버튼으로 삭제"
          >
            ×
          </button>
        )}
      </div>
      
      {/* 아이템 이름 표시 */}
      <div style={{
        position: 'absolute',
        bottom: '-1.5rem',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '0.7rem',
        color: '#374151',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: '0.125rem 0.375rem',
        borderRadius: '0.25rem',
        whiteSpace: 'nowrap',
        opacity: showDeleteButton ? 1 : 0,
        transition: 'opacity 0.2s'
      }}>
        {object.name}
      </div>
    </div>
  );
}

export default PlacedObjectComponent;
