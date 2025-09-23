import { useState, useCallback } from 'react';
import { PlacedObject, GardenObject } from '../types/garden';

interface UseGarden {
  placedObjects: PlacedObject[];
  purchasedItems: { [key: string]: number }; // 구매한 아이템과 개수
  addObject: (object: GardenObject, x: number, y: number) => void;
  moveObject: (id: string, x: number, y: number) => void;
  removeObject: (id: string) => void;
  purchaseItem: (object: GardenObject) => void;
  canPlaceItem: (objectId: string) => boolean;
}

export const useGarden = (): UseGarden => {
  const [placedObjects, setPlacedObjects] = useState<PlacedObject[]>([]);
  const [purchasedItems, setPurchasedItems] = useState<{ [key: string]: number }>({});

  const addObject = useCallback((object: GardenObject, x: number, y: number) => {
    const newObject = { ...object, x, y, id: `${object.id}_${Date.now()}` };
    setPlacedObjects(prev => [...prev, newObject]);
    
    // 구매한 아이템 개수 감소
    setPurchasedItems(prev => ({
      ...prev,
      [object.id]: (prev[object.id] || 0) - 1
    }));
  }, []);

  const moveObject = useCallback((id: string, x: number, y: number) => {
    setPlacedObjects(prev =>
      prev.map(obj => (obj.id === id ? { ...obj, x, y } : obj))
    );
  }, []);

  const removeObject = useCallback((id: string) => {
    setPlacedObjects(prev => {
      const object = prev.find(obj => obj.id === id);
      if (object) {
        // 원본 객체 ID로 구매한 아이템 개수 복구
        const originalId = object.id.split('_')[0];
        setPurchasedItems(prevItems => ({
          ...prevItems,
          [originalId]: (prevItems[originalId] || 0) + 1
        }));
      }
      return prev.filter(obj => obj.id !== id);
    });
  }, []);

  const purchaseItem = useCallback((object: GardenObject) => {
    setPurchasedItems(prev => ({
      ...prev,
      [object.id]: (prev[object.id] || 0) + 1
    }));
  }, []);

  const canPlaceItem = useCallback((objectId: string) => {
    return (purchasedItems[objectId] || 0) > 0;
  }, [purchasedItems]);

  return { 
    placedObjects, 
    purchasedItems,
    addObject, 
    moveObject, 
    removeObject, 
    purchaseItem,
    canPlaceItem
  };
};
