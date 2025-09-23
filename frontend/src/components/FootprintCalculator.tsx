import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getAuthHeaders } from '../contexts/CreditsContext';

const FootprintCalculator: React.FC = () => {
  const [mobilityLogs, setMobilityLogs] = useState<any[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchMobilityLogs = async () => {
      if (!user) return;
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/credits/mobility/${user.id}`, {
          headers: getAuthHeaders(),
        });
        const data = await response.json();
        setMobilityLogs(data);
      } catch (error) {
        console.error('Error fetching mobility logs:', error);
      }
    };
    fetchMobilityLogs();
  }, [user]);

  return (
    <div className="footprint-calculator">
      <h4>나의 탄소 발자국 상세 내역</h4>
      <div className="log-list">
        <table>
          <thead>
            <tr>
              <th>활동</th>
              <th>거리</th>
              <th>절감량</th>
              <th>날짜</th>
            </tr>
          </thead>
          <tbody>
            {mobilityLogs.map((log, index) => (
              <tr key={index}>
                <td>{log.mode}</td>
                <td>{log.distance_km.toFixed(2)}km</td>
                <td>{log.co2_saved_g.toFixed(2)}g</td>
                <td>{new Date(log.started_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FootprintCalculator;
