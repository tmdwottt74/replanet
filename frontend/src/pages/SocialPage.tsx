import React, { useState, useEffect } from 'react';
import SocialFeed from '../components/SocialFeed';
import Leaderboard from '../components/Leaderboard';
import InfoPopup from '../components/InfoPopup';

const SocialPage: React.FC = () => {
  const [showInfoPopup, setShowInfoPopup] = useState(false);

  useEffect(() => {
    const hasSeenInfoPopup = localStorage.getItem('hasSeenInfoPopup');
    if (!hasSeenInfoPopup) {
      setShowInfoPopup(true);
    }
  }, []);

  const handleClosePopup = () => {
    setShowInfoPopup(false);
    localStorage.setItem('hasSeenInfoPopup', 'true');
  };

  return (
    <div className="social-page">
      {showInfoPopup && <InfoPopup onClose={handleClosePopup} />}
      <h2>소셜</h2>
      <Link to="/groups">그룹 관리</Link>
      <SocialFeed />
      <Leaderboard />
    </div>
  );
};

export default SocialPage;
