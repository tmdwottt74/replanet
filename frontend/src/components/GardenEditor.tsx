import * as React from 'react';
import { useGarden } from '../hooks/useGarden';
import { useCredits } from '../contexts/CreditsContext';
import { OBJECTS } from '../data/objects';
import PlacedObjectComponent from './PlacedObject';
import { GardenObject, PlacedObject } from '../types/garden';

function GardenEditor() {
  const { placedObjects, purchasedItems, moveObject, removeObject, addObject, canPlaceItem } = useGarden();
  const { creditsData, addCredits } = useCredits();

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, itemId: string) => {
    e.dataTransfer.setData("itemId", itemId);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData("itemId");
    if (!itemId) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const object = OBJECTS.find(obj => obj.id === itemId);
    if (object && canPlaceItem(itemId)) {
      addObject(object, x, y);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '1rem', height: '600px' }}>
      {/* 구매한 아이템 목록 */}
      <div style={{ 
        width: '200px', 
        background: 'white', 
        borderRadius: '0.5rem', 
        padding: '1rem',
        border: '1px solid #dcfce7',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1f2937' }}>
          보유 아이템
        </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {Object.entries(purchasedItems).map(([itemId, count]) => {
              const object = OBJECTS.find(obj => obj.id === itemId);
              if (!object || count === 0) return null;
              
              return (
                <div
                  key={itemId}
                  draggable
                  onDragStart={(e) => handleDragStart(e, itemId)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem',
                    borderRadius: '0.25rem',
                    border: '1px solid #d1d5db',
                    background: 'white',
                    cursor: 'grab',
                    fontSize: '0.8rem'
                  }}
                >
                  <span style={{ fontSize: '1.2rem' }}>{object.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '500' }}>{object.name}</div>
                    <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>보유: {count}개</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      {/* 정원 공간 */}
      <div style={{ flex: 1 }}>
        {/* 정원 헤더 */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '1rem' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🌳</span>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937' }}>나의 정원</h2>
            <div style={{ 
              backgroundColor: '#d1fae5', 
              color: '#059669', 
              padding: '0.25rem 0.5rem', 
              borderRadius: '9999px', 
              fontSize: '0.75rem', 
              fontWeight: '600' 
            }}>
              {placedObjects.length}개 배치됨
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button 
              onClick={() => {
                if (window.confirm('정원을 초기화하시겠습니까?')) {
                  placedObjects.forEach(obj => removeObject(obj.id));
                }
              }}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                padding: '0.5rem 0.75rem', 
                backgroundColor: '#f3f4f6', 
                color: '#374151', 
                borderRadius: '0.5rem', 
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              <span style={{ fontSize: '1rem' }}>🔄</span>
              <span>초기화</span>
            </button>
          </div>
        </div>

        {/* 정원 영역 */}
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          style={{
            position: 'relative',
            background: 'linear-gradient(135deg, #dcfce7 0%, #ecfdf5 100%)',
            borderRadius: '1rem',
            border: '2px dashed #10b981',
            height: '500px',
            overflow: 'hidden'
          }}
        >
          {/* 격자 패턴 */}
          <div style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.2,
            backgroundImage: `
              linear-gradient(to right, #10b981 1px, transparent 1px),
              linear-gradient(to bottom, #10b981 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}></div>
          
          {/* 배치된 오브젝트들 */}
          {placedObjects.map(obj => (
            <PlacedObjectComponent 
              key={obj.id} 
              object={obj} 
              onMove={moveObject}
              onRemove={removeObject}
            />
          ))}
          
          {/* 빈 상태 */}
          {placedObjects.length === 0 && (
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '4rem', color: '#a7f3d0', display: 'block', marginBottom: '1rem' }}>🌳</span>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#4b5563', marginBottom: '0.5rem' }}>
                  정원이 비어있습니다
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  상점에서 아이템을 구매하고 배치해보세요!
                </p>
              </div>
            </div>
          )}
          
          {/* 정원 정보 */}
          <div style={{
            position: 'absolute',
            top: '1rem',
            left: '1rem',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(4px)',
            borderRadius: '0.5rem',
            padding: '0.75rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ fontSize: '0.875rem', color: '#4b5563' }}>
              <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>정원 정보</div>
              <div style={{ fontSize: '0.75rem' }}>크기: 10m × 10m</div>
              <div style={{ fontSize: '0.75rem' }}>
                식물: {placedObjects.filter(obj => obj.id.includes('tree') || obj.id.includes('flower')).length}개
              </div>
              <div style={{ fontSize: '0.75rem' }}>
                장식품: {placedObjects.filter(obj => !obj.id.includes('tree') && !obj.id.includes('flower')).length}개
              </div>
            </div>
          </div>
        </div>
        
        {/* 정원 꾸미기 팁 */}
        <div style={{
          backgroundColor: 'linear-gradient(90deg, #ecfdf5 0%, #d1fae5 100%)',
          borderRadius: '0.5rem',
          padding: '1rem',
          border: '1px solid #a7f3d0',
          marginTop: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.25rem', color: '#10b981', marginTop: '0.125rem' }}>✨</span>
            <div>
              <h4 style={{ fontWeight: '500', color: '#065f46', marginBottom: '0.25rem' }}>정원 꾸미기 팁</h4>
              <p style={{ fontSize: '0.875rem', color: '#047857' }}>
                1. 상점에서 아이템을 구매하세요<br/>
                2. 보유 아이템을 클릭하여 선택하세요<br/>
                3. 정원을 클릭하여 아이템을 배치하세요<br/>
                4. 배치된 아이템을 드래그하여 이동할 수 있습니다
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GardenEditor;