import React, { useState } from 'react';
import './InfoPopup.css';

interface InfoPopupProps {
  onClose: () => void;
}

const InfoPopup: React.FC<InfoPopupProps> = ({ onClose }) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem('hasSeenInfoPopup', 'true');
    }
    onClose();
  };

  return (
    <div className="info-popup-overlay">
      <div className="info-popup">
        <div className="popup-header">
          <h2 className="popup-title">새로운 소셜 기능 안내</h2>
          <button className="popup-close" onClick={handleClose}>×</button>
        </div>
        <div className="popup-content">
          <p>새로운 소셜 기능이 추가되었습니다! 이제 챌린지 완료 및 정원 레벨업을 다른 사용자들과 공유할 수 있습니다. 또한, 소셜 탭에서 다른 사용자들의 활동을 확인하고 탄소 절감 랭킹을 비교할 수 있습니다.</p>
          <h4>사용 방법</h4>
          <ul>
            <li><strong>공유하기:</strong> 챌린지 완료 또는 정원 레벨업 시 나타나는 "공유" 버튼을 클릭하세요.</li>
            <li><strong>소셜 피드 및 리더보드:</strong> 사이드바의 "Social" 탭을 클릭하여 확인하세요.</li>
          </ul>
          <h4>AWS 연동 안내</h4>
          <p>현재 AWS 연동은 실제 기능이 구현되지 않은 상태입니다. 실제 SNS/SQS와 연동하려면 AWS 자격 증명(Access Key ID, Secret Access Key) 및 리전 설정이 필요합니다. 자세한 내용은 개발자에게 문의하세요.</p>
        </div>
        <div className="popup-footer">
          <label className="dont-show-again">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
            />
            <span className="checkbox-text">다시 보지 않기</span>
          </label>
          <button className="close-btn" onClick={handleClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default InfoPopup;
