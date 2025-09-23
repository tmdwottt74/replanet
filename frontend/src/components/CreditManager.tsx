import * as React from 'react';
import { useCredits } from '../contexts/CreditsContext';

function CreditManager() {
  const { creditsData } = useCredits();

  return (
    <div className="bg-gradient-to-br from-emerald-500 to-green-600 text-white rounded-xl p-6 shadow-lg">
      <div className="flex items-center space-x-3 mb-4">
        <span className="text-2xl">💰</span>
        <h2 className="text-xl font-bold">크레딧 관리</h2>
      </div>
      
      <div className="space-y-4">
        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm opacity-90">현재 크레딧</span>
            <div className="flex items-center space-x-2">
              <span className="text-lg">⚡</span>
              <span className="text-2xl font-bold">{creditsData.totalCredits}</span>
            </div>
          </div>
        </div>
        
        <div className="text-xs opacity-75 text-center">
          환경 친화적 활동을 통해 더 많은 크레딧을 획득하세요!
        </div>
      </div>
    </div>
  );
}

export default CreditManager;
