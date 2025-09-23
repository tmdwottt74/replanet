import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useCredits } from '../contexts/CreditsContext'; // Add this line
import { useAuth } from '../contexts/AuthContext'; // Add this line
import { getAuthHeaders } from '../contexts/CreditsContext'; // Add this line
import AdvancedChatFeatures from '../components/AdvancedChatFeatures';
import "./Chat.css";
/// <reference lib="dom" />

// 메시지 타입
interface Message {
  sender: "user" | "bot";
  text: string;
}

// 대시보드 데이터 인터페이스 정의
interface DashboardData {
  co2_saved_today: number; // g
  total_carbon_reduced: number; // kg
  total_credits: number;
  garden_level: number;
  challenge_goal: number;
  challenge_progress: number;
}

const Chat: React.FC = () => {
  const location = useLocation();
  const isPreview = new URLSearchParams(location.search).get("preview") === "1";
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false); // 음성 인식 상태
  const [isTtsEnabled, setIsTtsEnabled] = useState<boolean>(false); // TTS 상태
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null); // SpeechRecognition 인스턴스 참조
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null); // Timer for silence detection

  const { creditsData } = useCredits(); // Get creditsData from context
  const { user } = useAuth(); // Get user from context
  const currentUserId = user?.id; // Get current user ID

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // 음성 인식 핸들러
  const handleVoiceInput = () => {
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      alert("죄송합니다. 이 브라우저는 음성 인식을 지원하지 않습니다. Chrome 브라우저를 사용해 주세요.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = recognitionRef.current || new SpeechRecognition();
    recognition.interimResults = true; // 중간 결과 반환
    recognition.lang = 'ko-KR'; // 한국어 설정
    recognition.continuous = true; // 연속 인식 활성화

    recognition.onstart = () => {
      setIsListening(true);
      setStatusMessage("말씀해주세요...");
      // Clear any previous timeout
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      setInputValue(finalTranscript || interimTranscript); // 최종 결과 또는 중간 결과 표시

      // Reset silence timeout on new speech
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
      timeoutIdRef.current = setTimeout(() => {
        recognition.stop(); // Stop recognition after 3 seconds of silence
      }, 3000); // 3 seconds of silence
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("음성 인식 오류:", event.error);
      setIsListening(false);
      setStatusMessage(`음성 인식 오류: ${event.error}`);
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      setStatusMessage("");
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }
      if (inputValue.trim()) {
        handleSendMessage(); // 인식이 끝나면 메시지 자동 전송
      }
    };

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      recognitionRef.current = recognition; // 인스턴스 저장
    }
  };

  const speak = (text: string) => {
    if (!isTtsEnabled || !window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    window.speechSynthesis.speak(utterance);
  };

  // 상태 메시지 (음성 인식용)
  const [statusMessage, setStatusMessage] = useState<string>("");

  const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";
  // const userId = 1; // 예시 사용자 ID - currentUserId로 대체

  const userInfo = {
    name: user?.name || "김에코", // 실제 로그인 사용자명으로 교체
  };

  // ✅ 실제 데이터 기반 응답 핸들러
  const handleDashboardReply = async (
    intent: "절약량" | "포인트" | "정원" | "챌린지"
  ) => {
    if (!currentUserId) {
      setMessages((prev) => [...prev, { sender: "bot", text: "사용자 정보를 불러올 수 없습니다." }]);
      setIsLoading(false); // Add this line to ensure loading state is reset
      return;
    }

    setIsLoading(true);
  console.log("Fetching dashboard data for userId:", currentUserId); // Add this line
  console.log("API URL:", API_URL); // Add this line

    try {
      const headers = getAuthHeaders();
      console.log("Request headers:", headers); // 디버깅용
      
      const response = await fetch(`${API_URL}/api/dashboard/`, {
        method: 'GET',
        headers: headers,
        credentials: 'include', // 쿠키 포함
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Dashboard API error: ${response.status}`, errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const actualData: DashboardData = await response.json();

      let botText = "";

      if (intent === "절약량") {
        botText = `오늘은 ${actualData.co2_saved_today} g CO₂ 절약했고, 누적 절약량은 ${actualData.total_carbon_reduced} kg이에요 🌱\n\n💡 탄소 절감 팁:\n• 대중교통 이용하기\n• 자전거 타기\n• 에너지 절약하기\n• 친환경 제품 사용하기`;
      } else if (intent === "포인트") {
        botText = `지금까지 총 ${actualData.total_credits} 포인트를 모았어요 💰\n\n🎯 포인트 적립 방법:\n• 지하철 이용: +150P\n• 자전거 이용: +80P\n• 친환경 활동: +100P\n• 에너지 절약: +50P`;
      } else if (intent === "정원") {
        botText = `현재 정원 레벨은 Lv.${actualData.garden_level} 입니다 🌳\n\n🌱 정원 관리 팁:\n• 매일 물주기로 포인트 적립\n• 10번 물주기마다 레벨업\n• 다양한 식물로 정원 꾸미기\n• 친구들과 정원 공유하기`;
      } else if (intent === "챌린지") {
        const percent = Math.round((actualData.challenge_progress / actualData.challenge_goal) * 100);
        botText = `🔥 현재 챌린지 진행 상황: 목표 ${actualData.challenge_goal} kg 중 ${actualData.challenge_progress} kg 달성 (${percent}%)\n\n🎉 목표까지 ${(actualData.challenge_goal - actualData.challenge_progress).toFixed(1)} kg 남았어요!\n\n💪 챌린지 완주를 위한 활동:\n• 대중교통 이용하기\n• 자전거 타기\n• 도보로 이동하기`;
      }

      const botMessage: Message = { sender: "bot", text: botText };
      setMessages((prev) => [...prev, botMessage]);
      speak(botText);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      setMessages((prev) => [...prev, { sender: "bot", text: "데이터를 불러오는 데 실패했어요. 다시 시도해주세요." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendChatMessage = async (messageText: string) => {
    if (!currentUserId) {
      setMessages((prev) => [...prev, { sender: "bot", text: "사용자 정보를 불러올 수 없습니다." }]);
      setIsLoading(false);
      return;
    }

    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_URL}/chat/`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: currentUserId, message: messageText }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Chat API error: ${response.status}`, errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setMessages((prev) => [...prev, { sender: "bot", text: data.response }]);
      speak(data.response);
    } catch (error) {
      console.error("Failed to send chat message:", error);
      setMessages((prev) => [...prev, { sender: "bot", text: "메시지 전송에 실패했어요. 다시 시도해주세요." }]);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ 추천 질문 버튼 클릭
  const handleQuickSend = async (text: string) => { // Make it async
    const userMessage: Message = { sender: "user", text };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true); // Set loading state

    if (text === "AI 챌린지 추천해줘") { // Specific check for AI challenge
      await sendChatMessage(text); // Send to chatbot endpoint
    } else if (text.includes("챌린지")) {
      await handleDashboardReply("챌린지");
    } else if (text.includes("탄소") || text.includes("절약")) {
      await handleDashboardReply("절약량");
    } else if (text.includes("포인트")) {
      await handleDashboardReply("포인트");
    } else if (text.includes("정원")) {
      await handleDashboardReply("정원");
    } else {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "챗봇이 아직 학습 중이에요 🤖" },
      ]);
      setIsLoading(false); // Reset loading state if no specific action
    }
  };

  // ✅ 추천 질문 리스트
  const recommendedQuestions = [
    "내가 절약한 탄소량은?",
    "내가 모은 포인트는?",
    "내 정원 레벨은?",
    "챌린지 진행 상황 알려줘",
    "탄소 절감 방법 알려줘",
    "포인트 적립 방법은?",
    "환경 친화적인 생활 방법은?",
  ];

  // ✅ 메시지 전송
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = { sender: "user", text: inputValue };
    setMessages((prev) => [...prev, userMessage]);
    const messageToSend = inputValue; // Capture inputValue before clearing
    setInputValue("");
    setIsLoading(true);

    // Use sendChatMessage for all interactions with the backend chatbot
    await sendChatMessage(messageToSend);
  };

  const handleFeatureClick = async (prompt: string) => {
    const userMessage: Message = { sender: "user", text: prompt };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    await sendChatMessage(prompt);
  };

  // 미리보기 모드
  if (isPreview) {
    return (
      <div className="chat-preview">
        <div className="preview-header">
          <h3>🤖 에코 AI 챗봇</h3>
        </div>
        <div className="preview-status">
          <div className="status-indicator">
            <div className="status-dot"></div>
            <span>온라인</span>
          </div>
        </div>
        <div className="preview-conversation">
          <div className="preview-message bot">
            <div className="preview-avatar">🤖</div>
            <div className="preview-bubble">
              안녕하세요! 환경 친화적인 생활에 대해 무엇이든 물어보세요.
            </div>
          </div>
          <div className="preview-message user">
            <div className="preview-bubble">
              탄소 절감 방법을 알려주세요
            </div>
            <div className="preview-avatar">👤</div>
          </div>
          <div className="preview-message bot">
            <div className="preview-avatar">🤖</div>
            <div className="preview-bubble">
              대중교통 이용, 자전거 타기, 에너지 절약 등 다양한 방법이 있어요!
            </div>
          </div>
        </div>
        <div className="preview-features">
          <div className="feature-item">
            <span className="feature-icon">🌱</span>
            <span className="feature-text">탄소 절감 상담</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">💰</span>
            <span className="feature-text">에코 크레딧 안내</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🌿</span>
            <span className="feature-text">정원 관리 팁</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`chat-container ${isPreview ? "is-preview" : ""}`}>
      <div className="chat-header">
        <div className="chat-title">
          <div className="chat-icon">🤖</div>
          <div className="chat-title-text">
            <h3>에코 AI 챗봇</h3>
            <p>환경 친화적인 생활을 위한 AI 어시스턴트</p>
          </div>
        </div>
        <div className="chat-status">
          <div className="status-dot"></div>
          <span>온라인</span>
        </div>
        <button onClick={() => setIsTtsEnabled(!isTtsEnabled)} className={`tts-button ${isTtsEnabled ? 'active' : ''}`}>
          {isTtsEnabled ? '🔊' : '🔇'}
        </button>
      </div>

      <div className="welcome-section">
        <div className="welcome-avatar">🌱</div>
        <div className="welcome-content">
          <h4>안녕하세요, {userInfo.name}님!</h4>
          <p>환경 친화적인 생활에 대해 무엇이든 물어보세요. 탄소 절감, 에코 크레딧, 정원 관리 등 다양한 주제로 도움을 드릴게요.</p>
        </div>
      </div>

      <div className="message-window">
        {messages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💬</div>
            <h4>대화를 시작해보세요!</h4>
            <p>아래 추천 질문을 클릭하거나 직접 메시지를 입력해보세요.</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender}`}>
              <div className="message-avatar">
                {msg.sender === "user" ? "👤" : "🤖"}
              </div>
              <div className="message-content">
                <div className="message-bubble">
                  <p style={{ whiteSpace: 'pre-line' }}>{msg.text}</p>
                </div>
                <div className="message-time">
                  {new Date().toLocaleTimeString('ko-KR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="message bot">
            <div className="message-avatar">🤖</div>
            <div className="message-content">
              <div className="message-bubble loading">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {!isPreview && (
        <div className="quick-questions-section">
          <h4>💡 추천 질문</h4>
          <div className="quick-questions">
            {recommendedQuestions.map((q, idx) => (
              <button key={idx} onClick={() => handleQuickSend(q)} className="quick-question-btn">
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

            {!isPreview && <AdvancedChatFeatures onFeatureClick={handleFeatureClick} />}


      <div className="input-area">
  <div className="input-container wide">
    <input
      type="text"
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
      placeholder={isListening ? "말씀해주세요..." : "메시지를 입력하세요..."}
      className="message-input"
      disabled={isListening} // Disable input while listening
    />
    <button
      onClick={handleVoiceInput}
      className={`voice-button ${isListening ? 'listening' : ''}`}
      disabled={isLoading}
      title="음성 입력"
    >
      {isListening ? '🔴' : '🎤'}
    </button>
    <button
      onClick={handleSendMessage}
      disabled={isLoading || !inputValue.trim()}
      className="send-button"
    >
      <span>전송</span>
      <div className="send-icon">📤</div>
    </button>
  </div>
</div>



    </div>
  );
};

export default Chat;
