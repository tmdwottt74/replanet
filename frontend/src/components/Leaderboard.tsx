import React, { useState, useEffect } from 'react';

const Leaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/social/leaderboard');
        const data = await response.json();
        setLeaderboard(data);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className="leaderboard">
      <h3>탄소 절감 리더보드</h3>
      <ol>
        {leaderboard.map((item, index) => (
          <li key={index}>
            <span className="rank">{index + 1}</span>
            <span className="username">{item.username}</span>
            <span className="carbon-reduced">{item.total_carbon_reduced}kg</span>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default Leaderboard;
