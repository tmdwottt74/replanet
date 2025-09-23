import React from 'react';
import CreditManager from '../components/CreditManager';
import GardenEditor from '../components/GardenEditor';
import { GardenObject } from '../types/garden';

function GardenPage() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, minmax(0, 1fr))', gap: '2rem' }}>
      <div style={{ gridColumn: 'span 1 / span 1' }}>
        <div style={{ background: 'white', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', padding: '1.5rem', border: '1px solid #dcfce7', marginBottom: '1.5rem' }}>
          <CreditManager />
        </div>
      </div>
      <div style={{ gridColumn: 'span 3 / span 3' }}>
        <div style={{ background: 'white', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', padding: '1.5rem', border: '1px solid #dcfce7' }}>
          <GardenEditor />
        </div>
      </div>
    </div>
  );
}

export default GardenPage;
