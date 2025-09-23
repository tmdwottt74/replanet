import React, { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';

const RankingPage: React.FC = () => {
  const [ranking, setRanking] = useState<any[]>([]);

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/ranking/');
        const data = await response.json();
        setRanking(data);
      } catch (error) {
        console.error('Error fetching ranking:', error);
      }
    };
    fetchRanking();
  }, []);

  return (
    <div className="ranking-page">
      <PageHeader 
        title="랭킹"
        subtitle="다른 사용자들과 탄소 절감량을 비교해보세요"
        icon="🏆"
      />
      <div className="ranking-list">
        <ol>
          {ranking.map((item, index) => (
            <li key={index}>
              <span className="rank">{index + 1}</span>
              <span className="username">{item.username}</span>
              <span className="carbon-reduced">{item.total_co2_saved_g.toFixed(2)}g</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default RankingPage;
