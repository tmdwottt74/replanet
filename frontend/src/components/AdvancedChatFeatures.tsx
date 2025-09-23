import React from 'react';

interface AdvancedChatFeaturesProps {
  onFeatureClick: (prompt: string) => void;
}

const AdvancedChatFeatures: React.FC<AdvancedChatFeaturesProps> = ({ onFeatureClick }) => {
  const handleChallengeRecommendations = () => {
    onFeatureClick('개인화된 챌린지를 추천해줘');
  };

  const handleCarbonReductionTips = () => {
    onFeatureClick('실시간 탄소 절감 팁을 알려줘');
  };

  const handleGoalAchievementStrategy = () => {
    onFeatureClick('목표 달성 전략을 제안해줘');
  };

  return (
    <div className="advanced-chat-features">
      <h4>AI 추천 기능</h4>
      <div className="feature-buttons">
        <button onClick={handleChallengeRecommendations}>개인화된 챌린지 추천</button>
        <button onClick={handleCarbonReductionTips}>실시간 탄소 절감 팁</button>
        <button onClick={handleGoalAchievementStrategy}>목표 달성 전략</button>
      </div>
    </div>
  );
};

export default AdvancedChatFeatures;