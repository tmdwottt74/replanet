import * as React from 'react';
import { GardenObject } from '../types/garden';
import { useCredits } from '../contexts/CreditsContext';

type ObjectItemProps = {
  object: GardenObject;
  onBuy: (object: GardenObject) => void;
};

function ObjectItem({ object, onBuy }: ObjectItemProps) {
  const { creditsData } = useCredits();
  const canAfford = creditsData.totalCredits >= object.price;

  const handleClick = () => {
    if (canAfford) {
      onBuy(object);
    }
  };

  return (
    <div 
      className={`relative bg-white rounded-lg border-2 transition-all duration-200 cursor-pointer hover:shadow-md ${
        canAfford 
          ? 'border-emerald-200 hover:border-emerald-300 hover:scale-105' 
          : 'border-gray-200 opacity-60 cursor-not-allowed'
      }`}
      onClick={handleClick}
    >
      <div className="p-2 text-center">
        <div className="mb-2" style={{ height: '80px' }}><img src={object.image} alt={object.name} style={{ maxHeight: '100%', maxWidth: '100%' }} /></div>
        <div className="font-medium text-gray-800 text-sm mb-1">{object.name}</div>
        <div className="flex items-center justify-center space-x-1 text-xs text-emerald-600">
          <span className="text-xs">💰</span>
          <span className="font-semibold">{object.price}</span>
        </div>
      </div>
      
      {!canAfford && (
        <div className="absolute inset-0 bg-gray-100 bg-opacity-80 rounded-lg flex items-center justify-center">
          <span className="text-xs text-gray-500 font-medium">크레딧 부족</span>
        </div>
      )}
      
      <div className="absolute top-2 right-2">
        <div className={`w-2 h-2 rounded-full ${
          canAfford ? 'bg-green-400' : 'bg-red-400'
        }`}></div>
      </div>
    </div>
  );
}

export default ObjectItem;
