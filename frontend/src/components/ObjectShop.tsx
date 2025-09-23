import * as React from 'react';
import { OBJECTS } from '../data/objects';
import { useCredits } from '../contexts/CreditsContext';
import { GardenObject } from '../types/garden';
import ObjectItem from './ObjectItem';

type ObjectShopProps = {
  onObjectBuy: (object: GardenObject) => void;
};

function ObjectShop({ onObjectBuy }: ObjectShopProps) {
  const { addCredits } = useCredits();

  const handleBuy = async (object: GardenObject) => {
    try {
      await addCredits(-object.price, `Purchased ${object.name}`);
      alert(`${object.name}을(를) 구매했습니다!`);
      onObjectBuy(object);
    } catch (error) {
      alert((error as Error).message);
    }
  };

  return (
    <>
      {OBJECTS.map(obj => (
        <ObjectItem key={obj.id} object={obj} onBuy={handleBuy} />
      ))}
    </>
  );
}

export default ObjectShop;
