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