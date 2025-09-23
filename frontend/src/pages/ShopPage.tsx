import React from 'react';
import ObjectShop from '../components/ObjectShop';
import { useGarden } from '../hooks/useGarden';
import { GardenObject } from '../types/garden';
import PageHeader from '../components/PageHeader';
import './ShopPage.css';

function ShopPage() {
  const { purchaseItem } = useGarden();

  const handleObjectBuy = (object: GardenObject) => {
    purchaseItem(object);
  };

  return (
    <div className="shop-page">
      <PageHeader 
        title="상점"
        subtitle="크레딧으로 아이템을 구매하여 정원을 꾸며보세요"
        icon="🛒"
      />
      <div className="shop-grid">
        <ObjectShop onObjectBuy={handleObjectBuy} />
      </div>
    </div>
  );
}

export default ShopPage;
