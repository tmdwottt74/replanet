# Ecooo 통합 프로젝트 (서울시 AI 해커톤)

이 프로젝트는 두 개의 기존 Ecooo 프로젝트를 병합하여 챌린지, 챗봇, 대시보드, 크레딧 등 모든 기능을 포함하는 하나의 일관된 애플리케이션을 제공합니다.

## 프로젝트 구조

최종 프로젝트는 `ecoooo_front_ver/ecoooo` 폴더를 기반으로 합니다.

```
C:/Users/coron/OneDrive/바탕 화면/2025.2-2/seoul25_AI_ht/gitHub/ecoooo_front_ver/ecoooo/
├───backend/
│   ├───__pycache__/
│   ├───routes/
│   ├───... (기존 파일 및 병합된 파일)
│   ├───bedrock_logic.py (새로 추가됨)
│   ├───seed_admin_user.py (새로 추가됨)
│   └───seed_challenges.py (새로 추가됨)
├───frontend/
│   ├───node_modules/
│   ├───public/
│   ├───src/
│   │   ├───components/
│   │   │   └───GeneratedPlant.tsx (새로 추가됨)
│   │   ├───contexts/
│   │   ├───pages/
│   │   │   ├───Achievements.tsx (새로 추가됨)
│   │   │   ├───AdminPage.tsx (새로 추가됨)
│   │   │   ├───CreditPoints.tsx (새로 추가됨)
│   │   │   ├───CreditRecent.tsx (새로 추가됨)
│   │   │   └───Register.tsx (새로 추가됨)
│   │   └───ServicePage.tsx (새로 추가됨)
│   └───...
├───.env (새로 생성 필요)
├───.gitignore
├───ecoooo.db (SQLite 사용 시 생성됨)
└───README.md (현재 파일)
```

## 프로젝트 설정 및 실행 방법

프로젝트를 로컬에서 실행하려면 다음 단계를 따르십시오.

### 1. 가상 환경 설정 (Python Backend)

Python 백엔드의 의존성을 격리하고 관리하기 위해 가상 환경을 사용하는 것이 강력히 권장됩니다.

1.  **백엔드 폴더로 이동:**
    ```bash
cd backend
    ```
2.  **가상 환경 생성:** 
    ```bash
python -m venv venv
    ```
3.  **가상 환경 활성화:**
    *   **Windows:**
        ```bash
.\venv\Scripts\activate
        ```
    *   **macOS/Linux:**
        ```bash
        source venv/bin/activate
        ```
    가상 환경이 활성화되면 터미널 프롬프트 앞에 `(venv)`가 표시됩니다.

### 2. 의존성 설치

#### 백엔드 의존성 설치 (가상 환경 활성화 후)

가상 환경이 활성화된 상태에서 백엔드 의존성을 설치합니다.
```bash
pip install -r requirements.txt
```

#### 프론트엔드 의존성 설치

프론트엔드 폴더로 이동하여 의존성을 설치합니다.
```bash
cd frontend
npm install
# 또는
# yarn install
```

### 3. 환경 변수 설정 (.env 파일)

프로젝트 루트 (`C:\Users\coron\OneDrive\바탕 화면\2025.2-2\seoul25_AI_ht\gitHub\ecoooo_front_ver\ecoooo`)에 `.env` 파일을 생성하고 다음 환경 변수를 설정해야 합니다.

**기존 프로젝트 폴더 (`ecoooo` 및 `ecoooo_front_ver`)를 확인하여 기존에 사용하던 환경 변수 값들을 찾아 이 `.env` 파일에 넣어주세요.**

데이터베이스 설정 (MySQL 사용 권장, 없으면 SQLite로 대체됨)
  DB_HOST=localhost
  DB_PORT=3306
  DB_USER=admin
  DB_PASS=!donggukCAI1234
  DB_NAME=뭐엿지

  Google Custom Search API 설정 (챗봇 기능에 필요)
  GOOGLE_API_KEY="GOOGLE_API_KEY", "AIzaSyBgs37kJYWB7zsTfIrDTqe1hpOxBhNkH44"
  GOOGLE_CSE_ID="GOOGLE_CSE_ID", "01354cc88406341ec"


  AWS Bedrock 설정 (챗봇 기능에 필요)
  BEDROCK_MODEL_ARN="BEDROCK_MODEL_ARN", "arn:aws:bedrock:us-east-1:327784329358:inference-profile/us.anthropic.claude-opus-4-20250514-v1:0"
  BEDROCK_KNOWLEDGE_BASE_ID="BEDROCK_KNOWLEDGE_BASE_ID", "PUGB1AL6L1"


  (선택 사항) SQLite 사용 시 DATABASE_URL을 명시적으로 설정할 수 있습니다.
  DATABASE_URL=sqlite:///./backend/ecoooo.db
```

프론트엔드 폴더 (`C:\Users\coron\OneDrive\바탕 화면\2025.2-2\seoul25_AI_ht\gitHub\ecoooo_front_ver\ecoooo\frontend`)에도 `.env` 파일을 생성하고 다음을 추가하십시오:

```dotenv
REACT_APP_API_URL=http://127.0.0.1:8000
```
(백엔드가 다른 주소에서 실행되는 경우 `REACT_APP_API_URL` 값을 조정하십시오.)

### 5. 프로젝트 실행

#### 백엔드 실행

루트 폴더로 이동하여 (가상 환경이 활성화된 상태에서) 다음 명령을 실행합니다.
```bash
uvicorn backend.main:app --reload
```
백엔드 서버가 시작되면 데이터베이스 테이블이 생성되고 초기 데이터(관리자 사용자, 챌린지 등)가 자동으로 시딩됩니다.

#### 프론트엔드 실행

새로운 터미널을 열고 프론트엔드 폴더로 이동하여 다음 명령을 실행합니다.
```bash
cd frontend
npm start
# 또는
# yarn start
```
프론트엔드 개발 서버가 시작되고 웹 브라우저에서 애플리케이션에 접근할 수 있습니다.

### 6. 기능 테스트 및 검토

모든 기능(챌린지, 챗봇, 대시보드, 크레딧, 사용자 인증, 정원 등)이 예상대로 작동하는지 철저히 테스트하십시오. 특히 통합된 부분에서 문제가 없는지 확인하는 것이 중요합니다.


백엔드 서버 실행
py -3.11 -m venv .venv
.\.venv\Scripts\activate
cd backend
pip install -r requirements.txt
cd ..
uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload



프론트엔드 서버 실행
cd frontend
npm install
npm start

### 7. 추가 서비스 연동 (선택 사항)

#### Cloudinary (정원 이미지 저장)

정원 스크린샷 기능을 사용하려면 Cloudinary 계정이 필요합니다. `backend/.env` 파일에 다음 정보를 추가하세요.

```
# Cloudinary - for garden image storage
CLOUDINARY_CLOUD_NAME=YOUR_CLOUD_NAME
CLOUDINARY_API_KEY=YOUR_API_KEY
CLOUDINARY_API_SECRET=YOUR_API_SECRET
```

#### AWS (소셜 기능 알림)

소셜 기능의 SNS 알림을 사용하려면 AWS 계정이 필요합니다. `backend/.env` 파일에 다음 정보를 추가하세요.

```
# AWS - for social notifications (SNS)
AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_ACCESS_KEY
AWS_REGION=YOUR_AWS_REGION
SNS_TOPIC_ARN=YOUR_SNS_TOPIC_ARN
```


/// 김규리 수정본 진행상황
---

  사용자 경험 개선 - 반응형 웹:
     상태:* 시작 안 함.
     세부 사항:* 모바일 등 다양한 화면 크기에 대응하는 반응형 웹 개발이 필요합니다.

  ---


  1. AI 챗봇 고도화:
     개인화된 챌린지 추천:*
         상태:* 부분 구현.
         세부 사항:* 프론트엔드 컴포넌트와 백엔드 플레이스홀더 엔드포인트는
  구현되었으나, AI 응답은 하드코딩되어 있습니다. 사용자 데이터 분석 및 정교한 AI 모델
  연동이 필요합니다.
     실시간 탄소 절감 팁:*
         상태:* 부분 구현.
         세부 사항:* 프론트엔드 컴포넌트는 있으나 팁이 하드코딩되어 있습니다. 사용자
  활동 분석 기반의 실시간 맞춤형 팁 제공을 위한 백엔드 로직이 필요합니다.
     목표 달성 전략:*
         상태:* 부분 구현.
         세부 사항:* 프론트엔드 컴포넌트는 있으나 전략이 하드코딩되어 있습니다. 사용자
  진행 상황 분석 기반의 최적 경로 제안을 위한 백엔드 로직이 필요합니다.
     감정 기반 상호작용:*
         상태:* 시작 안 함.
         세부 사항:* 사용자 감정 감지 및 맞춤형 응답을 위한 자연어 처리(NLP) 기술이
  필요합니다.

  ---


  2. 데이터 분석 및 인사이트:
     탄소 절감 트렌드 분석 (주간/월간 패턴):*
         상태:* 구현 완료.
         세부 사항:* 주간 및 월간 탄소 절감 데이터를 반환하는 백엔드 엔드포인트를
  구현했으며, 프론트엔드에서 간단한 막대 차트로 시각화합니다.
     개인 탄소 발자국 계산 (정확한 CO2 절감량):*
         상태:* 구현 완료.
         세부 사항:* 대시보드 페이지에 FootprintCalculator 컴포넌트를 추가하여
  사용자의 이동 기록 및 CO2 절감량 상세 내역을 표시합니다.
     친구/가족과 비교 (소셜 요소):*
         상태:* 부분 구현.
         세부 사항:* 그룹 관리 및 그룹 기반 랭킹을 위한 백엔드 엔드포인트를
  구현했으며, 프론트엔드에 그룹 생성 및 참여 페이지를 추가했습니다. 그룹 내 비교
  로직은 백엔드에 구현되어 있습니다.
     지역별 환경 지수 (지역 커뮤니티 기능):*
         상태:* 구현 완료 (간소화 버전).
         세부 사항:* 특정 지역의 환경 지수 더미 데이터를 반환하는 백엔드 엔드포인트를
  구현했으며, 대시보드에 표시합니다.

  ---


  3. 게임화 기능:
     리더보드 (친구들과의 경쟁):*
         상태:* 구현 완료.
         세부 사항:* 탄소 절감량 기반의 전체 사용자 랭킹을 반환하는 백엔드
  엔드포인트를 구현했으며, 프론트엔드에서 리더보드를 표시합니다.
     시즌별 이벤트 (특별한 챌린지와 보상):*
         상태:* 시작 안 함.
         세부 사항:* 시즌별 이벤트 정의 및 관리를 위한 백엔드 로직과 이를 표시하고
  참여하는 프론트엔드 UI가 필요합니다.

  ---


  소셜 기능:
     친구 시스템 (함께 챌린지 참여):*
         상태:* 부분 구현 (그룹 기능을 통해).
         세부 사항:* 그룹 기능이 친구 시스템의 기반을 제공하지만, 친구 요청 등 전용
  친구 시스템은 구현되지 않았습니다.
     팀 챌린지 (그룹 단위 목표 달성):*
         상태:* 부분 구현 (그룹 기능을 통해).
         세부 사항:* 그룹 기능이 팀 챌린지의 기반을 제공하며, 그룹 목표를 지원하도록
  챌린지 로직 확장이 필요합니다.
     공유 기능 (성과를 SNS에 공유):*
         상태:* 구현 완료.
         세부 사항:* 챌린지 완료 및 정원 레벨업 공유 기능을 구현했으며, 백엔드에서
  SNS를 사용합니다 (AWS 자격 증명 설정 필요).
     커뮤니티 포럼 (환경 관련 정보 공유):*
         상태:* 시작 안 함.
         세부 사항:* 포럼 게시물 및 댓글 관리를 위한 새로운 백엔드 모듈과 포럼 UI가
  필요합니다.

  ---


  챌린지/랭킹: `challenges`, `challenge_members` 테이블/엔드포인트 추가, 일별 집계
  뷰(`v_daily_saving`) 기반 랭킹 API.
     상태:* 구현 완료.
     세부 사항:* challenges 및 challenge_members 테이블과 엔드포인트를 복원했으며,
  v_daily_saving 뷰를 생성하고 이를 기반으로 랭킹 API를 구현했습니다.

  ---


  파트너십: 환경 친화적 브랜드와 협력
     상태:* 시작 안 함.
     세부 사항:* 파트너십 및 보상 관리를 위한 백엔드 로직과 파트너 제안을 표시하는
  프론트엔드 UI가 필요합니다.

  ---


  실제 보상: 크레딧으로 실제 상품 구매
     상태:* 시작 안 함.
     세부 사항:* 전자상거래 플랫폼 또는 보상 이행 서비스와의 통합이 필요합니다.

  ---


  기부 시스템: 크레딧을 환경 단체에 기부
     상태:* 시작 안 함.
     세부 사항:* 기부 관리 및 결제 게이트웨이 또는 기부 플랫폼과의 통합이 필요합니다.

  ---


  프리미엄 서비스: 고급 분석 및 개인화 기능. 데이터 시각화 강화 (ex. 인터랙티브 차트
  및 그래프) - 대시보드 / 개인별로 pdf json 파일 다운받을 수 있게끔
     상태:* 부분 구현 (기본 차트).
     세부 사항:* 대시보드에 기본 차트가 구현되어 있습니다. 인터랙티브 차트에는 고급
  차트 라이브러리가 필요합니다. PDF/JSON 파일 다운로드는 백엔드에서 파일 생성 로직과
  프론트엔드에서 다운로드 트리거 로직이 필요합니다