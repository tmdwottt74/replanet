import React, { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../contexts/AuthContext';
import { getAuthHeaders } from '../contexts/CreditsContext';

const GroupsPage: React.FC = () => {
  const [groups, setGroups] = useState<any[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/groups/', {
          headers: getAuthHeaders(),
        });
        const data = await response.json();
        setGroups(data);
      } catch (error) {
        console.error('Error fetching groups:', error);
      }
    };
    fetchGroups();
  }, []);

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    try {
      const response = await fetch('http://127.0.0.1:8000/api/groups/', {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ group_name: newGroupName, group_type: 'COMMUNITY' }),
      });
      const data = await response.json();
      setGroups(prev => [...prev, data]);
      setNewGroupName('');
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  const handleJoinGroup = async (groupId: number) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/groups/${groupId}/join`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      alert(data.message);
    } catch (error) {
      console.error('Error joining group:', error);
    }
  };

  return (
    <div className="groups-page">
      <PageHeader 
        title="그룹"
        subtitle="친구/가족과 함께 탄소 절감 목표를 달성해보세요"
        icon="👥"
      />
      <div className="create-group">
        <h3>새 그룹 생성</h3>
        <input 
          type="text" 
          value={newGroupName} 
          onChange={(e) => setNewGroupName(e.target.value)} 
          placeholder="그룹 이름"
        />
        <button onClick={handleCreateGroup}>생성</button>
      </div>
      <div className="group-list">
        <h3>참여 가능한 그룹</h3>
        <ul>
          {groups.map(group => (
            <li key={group.group_id}>
              {group.group_name} ({group.group_type})
              <button onClick={() => handleJoinGroup(group.group_id)}>참여</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default GroupsPage;
