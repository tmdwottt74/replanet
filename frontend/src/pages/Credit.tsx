import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useCredits } from '../contexts/CreditsContext';
import { useAuth } from '../contexts/AuthContext'; // Add this line
import PageHeader from '../components/PageHeader';
import "./Credit.css";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface UserCredit {
  totalPoints: number;
  recentEarned: number;
  recentActivity: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const fetchPoints = async () => {
  const res = await fetch("http://127.0.0.1:8000/credits/total/prototype_user");
  const data = await res.json();
  alert(`총 포인트: ${data.total_points} P`);
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const fetchRecentActivity = async () => {
  const res = await fetch("http://127.0.0.1:8000/mobility/recent/prototype_user");
  const data = await res.json();
  alert(`최근 활동: ${data.mode} ${data.distance_km}km`);
};

const Credit: React.FC = () => {
  const location = useLocation();
  const isPreview = new URLSearchParams(location.search).get("preview") === "1";
  const tabParam = new URLSearchParams(location.search).get("tab");
  const { creditsData, getCreditsHistory } = useCredits();
  const username = "김에코"; // 추후 백엔드에서 props로 가져오기

  const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000"; // API URL 정의

  const { user } = useAuth(); // Get user from context
  const currentUserId = user?.id; // Get current user ID

  // 탭 상태 관리
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [creditsHistory, setCreditsHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [transportHistory, setTransportHistory] = useState<any[]>([]);
  const [transportLoading, setTransportLoading] = useState(false);
  
  // URL 파라미터에 따라 탭 설정
  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // 크레딧 데이터 변경 시 내역 실시간 업데이트
  useEffect(() => {
    if (activeTab === 'history' || activeTab === 'recent') {
      // localStorage에서 최신 내역 확인
      const storedHistory = loadCreditsHistoryFromStorage();
      if (storedHistory) {
        setCreditsHistory(storedHistory);
      } else {
        loadCreditsHistory();
      }
    }
  }, [creditsData.totalCredits, creditsData.lastUpdated, activeTab]);

  // localStorage 변경 감지 (다른 탭에서 크레딧 변경 시)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'credits_history' && e.newValue) {
        try {
          const newHistory = JSON.parse(e.newValue);
          setCreditsHistory(newHistory);
        } catch (error) {
          console.error('Error parsing updated credits history:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // 크레딧 내역 가져오기
  const loadCreditsHistory = async () => {
    setHistoryLoading(true);
    try {
      const history = await getCreditsHistory();
      setCreditsHistory(history);
      saveCreditsHistoryToStorage(history); // localStorage에 저장
    } catch (error) {
      console.error('Failed to load credits history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  // localStorage에서 크레딧 내역 복원
  const loadCreditsHistoryFromStorage = () => {
    const stored = localStorage.getItem('credits_history');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error('Error parsing stored credits history:', error);
      }
    }
    return null;
  };

  // 크레딧 내역을 localStorage에 저장
  const saveCreditsHistoryToStorage = (history: any[]) => {
    localStorage.setItem('credits_history', JSON.stringify(history));
  };

  // 교통수단 이용내역 가져오기
  const loadTransportHistory = async (userId: number | undefined) => { // Add userId parameter
    setTransportLoading(true);
    // userId가 없으면 요청하지 않음
    if (!userId) { // Use userId parameter
      console.warn("User ID is not available. Cannot load transport history.");
      setTransportLoading(false);
      return;
    }
    try {
      console.log(`Fetching transport history for user ID: ${userId}`); // Add this line
      const response = await fetch(`${API_URL}/api/mobility/history/${userId}`); // Use userId parameter
      if (response.ok) {
        const history = await response.json();
        setTransportHistory(history);
      } else {
        console.error(`Failed to load transport history: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error loading transport history:', error);
    } finally {
      setTransportLoading(false);
    }
  };

  // recent 탭이 활성화될 때 내역 로드
  useEffect(() => {
    if (activeTab === 'recent') {
      loadCreditsHistory();
    }
  }, [activeTab]);

  // 크레딧 데이터가 변경될 때마다 내역 새로고침
  useEffect(() => {
    if (activeTab === 'recent') {
      loadCreditsHistory();
    }
  }, [creditsData.totalCredits, creditsData.lastUpdated]);

  // transport 탭이 활성화될 때 교통수단 내역 로드
  useEffect(() => {
    if (activeTab === 'transport') {
      loadTransportHistory(user?.id ? Number(user.id) : undefined); // Convert to number
    }
  }, [activeTab, user?.id]); // Add user?.id to dependency array

  // history 탭이 활성화될 때 크레딧 내역 로드
  useEffect(() => {
    if (activeTab === 'history') {
      loadCreditsHistory();
    }
  }, [activeTab]);

  // overview 탭이 활성화될 때 교통수단 내역 로드 (요약용)
  useEffect(() => {
    if (activeTab === 'overview') {
      loadTransportHistory(user?.id ? Number(user.id) : undefined); // Convert to number
    }
  }, [activeTab, user?.id]); // Add user?.id to dependency array

  // 통합된 사용자 데이터 (Context에서 가져오기)
  const userInfo = {
    name: "김에코",
    group: "동국대학교",
    totalCredits: creditsData.totalCredits,
    totalSaving: `${creditsData.totalCarbonReduced}kg CO₂`,
  };



  // 미리보기 모드
  if (isPreview) {
    return (
      <div className="credit-preview">
        <div className="preview-header">
          <h3>💰 크레딧 현황</h3>
        </div>
        <div className="preview-user-info">
          <div className="preview-user-avatar">🌱</div>
          <div className="preview-user-details">
            <div className="preview-user-name">{userInfo.name} 님</div>
            <div className="preview-user-group">{userInfo.group}</div>
          </div>
        </div>
        <div className="preview-stats">
          <div className="preview-stat">
            <span className="stat-label">누적 크레딧</span>
            <span className="stat-value">{userInfo.totalCredits}P</span>
          </div>
          <div className="preview-stat">
            <span className="stat-label">누적 절감량</span>
            <span className="stat-value">{userInfo.totalSaving}</span>
          </div>
        </div>
        <div className="preview-recent">
          <div className="recent-item">
            <span className="recent-icon">🚌</span>
            <span className="recent-text">지하철 이용 +150C</span>
          </div>
          <div className="recent-item">
            <span className="recent-icon">🚲</span>
            <span className="recent-text">자전거 이용 +80C</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="credit-container">
      <PageHeader 
        title="Credit" 
        subtitle="나의 크레딧 현황과 탄소 절감 활동을 확인하세요"
        icon="💰"
      />

      {/* 탭 네비게이션 */}
      <div className="credit-tabs">
        <button 
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 전체 현황
        </button>
        <button 
          className={`tab-button ${activeTab === 'recent' ? 'active' : ''}`}
          onClick={() => setActiveTab('recent')}
        >
          📅 오늘 절약한 탄소
        </button>
        <button 
          className={`tab-button ${activeTab === 'points' ? 'active' : ''}`}
          onClick={() => setActiveTab('points')}
        >
          📈 누적 절약량
        </button>
        <button 
          className={`tab-button ${activeTab === 'transport' ? 'active' : ''}`}
          onClick={() => setActiveTab('transport')}
        >
          🚌 교통수단 이용내역
        </button>
        <button 
          className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          📋 최근 크레딧 내역
        </button>
        </div>

      {/* 간소화된 사용자 정보 카드 */}
      <div className="user-summary-card">
        <div className="user-info-simple">
          <div className="user-avatar-simple">🌱</div>
          <div className="user-details">
            <h2 className="user-name-simple">{userInfo.name} 님</h2>
            <p className="user-group-simple">{userInfo.group}</p>
          </div>
        </div>
        <div className="summary-stats">
          <div className="summary-stat">
            <span className="stat-label-simple">누적 크레딧</span>
            <span className="stat-value-simple">{userInfo.totalCredits}C</span>
          </div>
          <div className="summary-stat">
            <span className="stat-label-simple">누적 절감량</span>
            <span className="stat-value-simple">{userInfo.totalSaving}</span>
          </div>
        </div>
      </div>

      {/* 탭별 콘텐츠 */}
      {activeTab === 'overview' && (
        <>
          {/* 액션 버튼들 */}
          <div className="simple-actions">
            <button 
              className="simple-action-btn"
              onClick={() => setActiveTab('history')}
            >
              📋 크레딧 내역보기
            </button>
            <button 
              className="simple-action-btn"
              onClick={() => setActiveTab('transport')}
            >
              🚌 이동 기록보기
            </button>
            <button 
              className="simple-action-btn"
              onClick={() => setActiveTab('points')}
            >
              📊 절약량 상세보기
            </button>
          </div>

          {/* AI 챗봇 안내 */}
          <div 
            className="simple-chat-notice"
            onClick={() => window.location.href = '/chat'}
          >
            <div className="chat-icon">🤖</div>
            <div className="chat-content">
              <h4>AI 챗봇과 친환경 활동하기</h4>
              <p>대화하며 크레딧을 획득하세요 →</p>
            </div>
          </div>

          {/* 최근 활동 요약 */}
          <div className="recent-summary">
            <h3>📈 최근 활동 요약</h3>
            <div className="summary-cards">
              <div className="summary-card">
                <div className="card-icon">💰</div>
                <div className="card-content">
                  <div className="card-value">{creditsData.totalCredits}C</div>
                  <div className="card-label">총 크레딧</div>
                </div>
      </div>
              <div className="summary-card">
                <div className="card-icon">🌱</div>
                <div className="card-content">
                  <div className="card-value">{creditsData.totalCarbonReduced.toFixed(1)}kg</div>
                  <div className="card-label">총 절약량</div>
        </div>
              </div>
              <div className="summary-card">
                <div className="card-icon">🚌</div>
                <div className="card-content">
                  <div className="card-value">{transportHistory.length}회</div>
                  <div className="card-label">이동 기록</div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'recent' && (
        <div className="tab-content">
          <h3>📅 오늘 절약한 탄소</h3>
          <div className="carbon-savings">
            <div className="savings-card">
              <div className="savings-icon">🌱</div>
              <div className="savings-content">
                <div className="savings-amount">{Math.round(creditsData.totalCarbonReduced * 1000)}g</div>
                <div className="savings-label">오늘 절약한 탄소량</div>
              </div>
            </div>
            <div className="savings-breakdown">
              <h4>활동별 절약량</h4>
              <div className="breakdown-list">
                {transportHistory.length > 0 ? (
                  transportHistory.slice(0, 5).map((trip, index) => (
                    <div key={index} className="breakdown-item">
                      <span className="breakdown-icon">
                        {trip.transport_mode === "지하철" ? "🚇" : 
                         trip.transport_mode === "버스" ? "🚌" : 
                         trip.transport_mode === "자전거" ? "🚴" : 
                         trip.transport_mode === "도보" ? "🚶" : "🚗"}
                      </span>
                      <span className="breakdown-text">{trip.transport_mode} 이용</span>
                      <span className="breakdown-amount">{Math.round(trip.carbon_saved_kg * 1000)}g</span>
                    </div>
                  ))
                ) : (
                  <div className="empty-message">오늘의 교통수단 이용내역이 없습니다.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'points' && (
        <div className="tab-content">
          <h3>📈 누적 절약량</h3>
          <div className="total-savings">
            <div className="savings-card">
              <div className="savings-icon">🌍</div>
              <div className="savings-content">
                <div className="savings-amount">{creditsData.totalCarbonReduced.toFixed(1)}kg</div>
                <div className="savings-label">총 절약한 탄소량</div>
              </div>
            </div>
            <div className="savings-timeline">
              <h4>교통수단별 절약량</h4>
              <div className="timeline-chart">
                {transportHistory.length > 0 ? (
                  (() => {
                    // 교통수단별 데이터 집계
                    const modeData: Record<string, { total: number; count: number }> = transportHistory.reduce((acc, trip) => {
                      const mode = trip.transport_mode;
                      if (!acc[mode]) {
                        acc[mode] = { total: 0, count: 0 };
                      }
                      acc[mode].total += trip.carbon_saved_kg;
                      acc[mode].count += 1;
                      return acc;
                    }, {} as Record<string, { total: number; count: number }>);

                    // 최대값 계산
                    const values = Object.values(modeData).map((item: { total: number; count: number }) => item.total);
                    const maxValue = values.length > 0 ? Math.max(...values) : 0;

                    // 차트 바 생성
                    return Object.entries(modeData).map(([mode, data]: [string, { total: number; count: number }], index) => {
                      const height = maxValue > 0 ? (data.total / maxValue) * 100 : 0;
                      
                      return (
                        <div key={index} className="timeline-bar" style={{ height: `${height}%` }}>
                          <span className="timeline-label">{mode}</span>
                          <span className="timeline-value">{data.total.toFixed(1)}kg</span>
                        </div>
                      );
                    });
                  })()
                ) : (
                  <div className="empty-message">교통수단 이용내역이 없습니다.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'transport' && (
        <div className="tab-content">
          <h3>🚌 교통수단 이용내역</h3>
          <div className="transport-history">
            {transportLoading ? (
              <div className="loading-message">교통수단 이용내역을 불러오는 중...</div>
            ) : transportHistory.length > 0 ? (
              <div className="transport-list">
                {transportHistory.map((trip) => (
                  <div key={trip.id} className="transport-item">
                    <div className="transport-icon">
                      {trip.transport_mode === "지하철" ? "🚇" : 
                       trip.transport_mode === "버스" ? "🚌" : 
                       trip.transport_mode === "자전거" ? "🚴" : 
                       trip.transport_mode === "도보" ? "🚶" : "🚗"}
                    </div>
                    <div className="transport-content">
                      <div className="transport-mode">{trip.transport_mode}</div>
                      <div className="transport-route">{trip.route}</div>
                      <div className="transport-meta">
                        <span className="transport-date">{trip.date}</span>
                        <span className="transport-distance">{trip.distance_km}km</span>
                      </div>
                    </div>
                    <div className="transport-stats">
                      <div className="carbon-saved">-{trip.carbon_saved_kg}kg</div>
                      <div className="points-earned">+{trip.points_earned}C</div>
              </div>
            </div>
          ))}
              </div>
            ) : (
              <div className="empty-message">교통수단 이용내역이 없습니다.</div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="tab-content">
          <h3>📋 최근 크레딧 내역</h3>
          <div className="credit-history">
            <div className="history-header">
              <div className="history-stats">
                <div className="stat-item">
                  <span className="stat-label">총 크레딧</span>
                  <span className="stat-value">{creditsData.totalCredits}C</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">총 내역</span>
                  <span className="stat-value">{creditsHistory.length}건</span>
                </div>
              </div>
              <button 
                className="refresh-btn"
                onClick={loadCreditsHistory}
                disabled={historyLoading}
              >
                {historyLoading ? "새로고침 중..." : "🔄 새로고침"}
              </button>
            </div>
            <div className="history-list">
              {historyLoading ? (
                <div className="loading-message">크레딧 내역을 불러오는 중...</div>
              ) : creditsHistory.length > 0 ? (
                creditsHistory.map((item) => (
                  <div key={item.entry_id} className={`credit-item ${item.points > 0 ? "positive" : "negative"}`}>
                    <div className="item-icon">
                      {item.reason.includes("지하철") ? "🚇" : 
                       item.reason.includes("버스") ? "🚌" : 
                       item.reason.includes("자전거") ? "🚴" : 
                       item.reason.includes("도보") ? "🚶" : 
                       item.reason.includes("보너스") ? "🎁" : 
                       item.reason.includes("물주기") ? "💧" : 
                       item.reason.includes("GARDEN") ? "💧" : 
                       item.reason.includes("챌린지") ? "🏆" : "📝"}
                    </div>
                    <div className="item-content">
                      <div className="item-desc">{item.reason}</div>
                      <div className="item-meta">
                        <span className="item-date">{new Date(item.created_at).toLocaleDateString()}</span>
                        <span className="item-time">{new Date(item.created_at).toLocaleTimeString()}</span>
                      </div>
                    </div>
                    <div className={`item-credits ${item.points > 0 ? "positive" : "negative"}`}>
                      {item.points > 0 ? `+${item.points}` : `${item.points}`}C
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-message">크레딧 내역이 없습니다.</div>
              )}
            </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default Credit;
