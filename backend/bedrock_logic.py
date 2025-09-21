import boto3
import json
import os
import requests
import re
from bs4 import BeautifulSoup
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from backend.routes.ai_challenge_router import AICallengeCreateRequest, create_and_join_ai_challenge
from backend.database import get_db
from backend.dependencies import get_current_user
from sqlalchemy.orm import Session
from backend.models import User # User 모델 임포트

# --- 설정 ---
AWS_DEFAULT_REGION = "us-east-1"
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "AIzaSyBgs37kJYWB7zsTfIrDTqe1hpOxBhNkH44") # 환경 변수에서 가져오도록 변경
GOOGLE_CSE_ID = os.getenv("GOOGLE_CSE_ID", "01354cc88406341ec") # 환경 변수에서 가져오도록 변경
BEDROCK_MODEL_ARN = os.getenv("BEDROCK_MODEL_ARN", "arn:aws:bedrock:us-east-1:327784329358:inference-profile/us.anthropic.claude-opus-4-20250514-v1:0")
BEDROCK_KNOWLEDGE_BASE_ID = os.getenv("BEDROCK_KNOWLEDGE_BASE_ID", "PUGB1AL6L1")

# --- Boto3 클라이언트 초기화 ---
try:
    bedrock_runtime_client = boto3.client('bedrock-runtime', region_name=AWS_DEFAULT_REGION)
    bedrock_agent_runtime_client = boto3.client('bedrock-agent-runtime', region_name=AWS_DEFAULT_REGION)
    print("[알림] AWS Bedrock 클라이언트가 성공적으로 초기화되었습니다.")
except Exception as e:
    print(f"[오류] AWS 클라이언트 생성 중 오류가 발생했습니다: {e}")
    # 클라이언트 초기화 실패 시, 관련 함수들이 ConnectionError를 발생시키도록 함

# FastAPI 라우터 생성
router = APIRouter(
    prefix="/chat",
    tags=["Chatbot"]
)

class ChatRequest(BaseModel):
    user_id: int
    message: str

def invoke_llm(system_prompt, user_prompt):
    """
    범용 Bedrock LLM 호출 함수
    """
    if not bedrock_runtime_client:
        raise ConnectionError("Bedrock runtime client is not initialized.")
    try:
        messages = [{"role": "user", "content": user_prompt}]
        request_body = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 4096,
            "system": system_prompt,
            "messages": messages
        }
        response = bedrock_runtime_client.invoke_model(
            modelId=BEDROCK_MODEL_ARN,
            body=json.dumps(request_body)
        )
        response_body = json.loads(response.get('body').read())
        return response_body['content'][0]['text']
    except Exception as e:
        print(f"Bedrock 모델 호출 중 오류가 발생했습니다: {e}")
        return None

def query_knowledge_base(query):
    """
    Bedrock 지식 기반에 질문하고 답변과 출처를 받아오는 함수
    """
    if not bedrock_agent_runtime_client:
        raise ConnectionError("Bedrock agent runtime client is not initialized.")
    print(f"\n[알림] Bedrock 지식 기반에서 '{query}'에 대한 정보를 검색합니다...")
    try:
        response = bedrock_agent_runtime_client.retrieve_and_generate(
            input={'text': query},
            retrieveAndGenerateConfiguration={
                'type': 'KNOWLEDGE_BASE',
                'knowledgeBaseConfiguration': {
                    'knowledgeBaseId': BEDROCK_KNOWLEDGE_BASE_ID,
                    'modelArn': BEDROCK_MODEL_ARN
                }
            }
        )
        
        if response and response.get('output') and response.get('citations'):
            answer = response['output']['text']
            citations = response['citations']
            
            source_details = []
            for citation in citations:
                if citation.get('retrievedReferences'):
                    retrieved_ref = citation['retrievedReferences'][0]
                    location = retrieved_ref.get('location', {}).get('s3Location', {}).get('uri')
                    if location:
                        source_details.append(f"- {location}")

            if source_details:
                formatted_answer = f"{answer}\n\n--- 출처 ---\n" + "\n".join(source_details)
            else:
                formatted_answer = answer

            print("[알림] 지식 기반에서 답변을 성공적으로 찾았습니다.")
            return formatted_answer
        else:
            print("[알림] 지식 기반에서 관련 정보를 찾지 못했습니다.")
            return None
            
    except Exception as e:
        print(f"Bedrock 지식 기반 검색 중 오류가 발생했습니다: {e}")
        return None

def perform_web_search(query):
    """
    Google 검색으로 URL을 찾고, 중요도 순으로(제목->본문) 실제 본문 내용을 추출하는 함수
    """
    print(f"\n[알림] 웹에서 '{query}'에 대한 최신 정보를 검색합니다...")
    try:
        search_url = "https://www.googleapis.com/customsearch/v1"
        search_params = {'key': GOOGLE_API_KEY, 'cx': GOOGLE_CSE_ID, 'q': query, 'num': 3}
        search_response = requests.get(search_url, params=search_params)
        search_response.raise_for_status()
        search_results = search_response.json()
        items = search_results.get('items', [])

        if not items:
            return "웹 검색 결과가 없습니다."

        full_context = ""
        urls = [item.get('link') for item in items]
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/555.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/555.36'} # User-Agent 수정

        print("[알림] 검색된 웹페이지의 본문을 중요도 순으로 추출합니다...")
        for url in urls:
            if not url: continue
            try:
                page_response = requests.get(url, headers=headers, timeout=5)
                page_response.raise_for_status()
                soup = BeautifulSoup(page_response.text, 'lxml')
                text_parts = []
                tags_to_extract = ['h1', 'h2', 'h3', 'p']
                for tag in tags_to_extract:
                    elements = soup.find_all(tag)
                    for element in elements:
                        text_parts.append(element.get_text(strip=True))
                page_text = '\n'.join(text_parts)
                full_context += f"--- URL: {url}의 내용 ---\n{page_text}\n\n"
            except requests.exceptions.RequestException as e:
                print(f"  - URL {url} 방문 실패: {e}")
                continue

        if not full_context:
            return "웹페이지 내용을 가져오는 데 실패했습니다."

        print(f"[추출 완료] 총 {len(full_context)}자리의 정보를 바탕으로 답변을 생성합니다.")
        return full_context

    except Exception as e:
        print(f"웹 검색 과정에서 오류가 발생했습니다: {e}")
        return "정보 검색 과정에서 오류가 발생했습니다."

@router.post("/")
async def chatbot_endpoint(request: ChatRequest):
    user_query = request.message
    user_id = request.user_id # user_id는 현재 사용되지 않지만, 추후 확장성을 위해 유지

    print(f"사용자 질문: {user_query}\n")

    print("[1단계] 사용자의 질문 의도를 파악합니다...")
    router_system_prompt = f"""
    You are a smart orchestrator that analyzes the user's question and decides which action to take.
    You must choose one of the following four actions and respond only in JSON format. Do not add any other explanations.

    1. "knowledge_base_search": Choose this when the user's question is likely to be answered by a private knowledge base, containing specific information about people, projects, or internal documents. Specific topics like 'carbon reduction' or 'recycling' can also belong here.
       - Example: {{\"action\": \"knowledge_base_search\", \"query\": \"information about ecomileage-seoul\"}}
       - Example: {{\"action\": \"knowledge_base_search\", \"query\": \"how to recycle plastic\"}}

    2. "general_search": Choose this when the user's question requires up-to-date information or general knowledge that is unlikely to be in a private knowledge base, such as 'today's weather' or 'news about celebrities'.
       - Example: {{\"action\": \"general_search\", \"query\": \"today's weather in Seoul\"}}

    3. "recommend_challenge": Choose this when the user explicitly asks for a challenge recommendation or expresses a desire to start a new eco-friendly challenge.
       - Example: {{\"action\": \"recommend_challenge\", \"user_intent\": \"recommend an eco-friendly challenge\"}}
       - Example: {{\"action\": \"recommend_challenge\", \"user_intent\": \"I want to start a new challenge\"}}

    4. "direct_answer": Choose this for simple greetings or small talk, like "Hello", "Thank you", or "Who are you?".
       - Example: {{\"action\": \"direct_answer\", \"answer\": \"Hello! I am an AI chatbot here to answer your questions. Ask me anything!\"}}

    User question: "{user_query}"
    Your JSON response:
    """
    
    router_output_str = invoke_llm(router_system_prompt, user_query)
    
    action = None
    router_decision = {}
    if router_output_str is None:
        print("[오류] Bedrock 모델 호출 실패: router_output_str이 None입니다. 일반 검색을 시도합니다.")
        action = "general_search"
        router_decision = {"query": user_query}
    else:
        try:
            json_match = re.search(r'\{.*\}', router_output_str, re.DOTALL)
            if json_match:
                json_str = json_match.group()
                router_decision = json.loads(json_str)
                action = router_decision.get("action")
            else:
                raise ValueError("No JSON object found in the router output")
        except (json.JSONDecodeError, ValueError, AttributeError, ConnectionError) as e:
            print(f"[오류] 조율자(Router)의 결정을 이해할 수 없습니다 또는 Bedrock 연결 오류: {e}. 일반 검색을 시도합니다.")
            action = "general_search"
            router_decision = {"query": user_query}

    final_answer = ""
    query = router_decision.get("query", user_query)
    original_action = action

    if action == "knowledge_base_search":
        print(f"[알림] 조율자 판단: '{action}'. 지식 기반 검색을 시작합니다.")
        final_answer = query_knowledge_base(query)
        
        if not final_answer:
            print("[알림] 지식 기반에서 답변을 찾지 못했습니다. 웹 검색으로 전환합니다.")
            action = "general_search"

    if action == "general_search":
        if original_action == 'knowledge_base_search':
            pass
        else:
            print(f"[알림] 조율자 판단: '{action}'. 웹 검색을 시작합니다.")

        search_results = perform_web_search(query)

        if "오류가 발생했습니다" in search_results or "결과가 없습니다" in search_results:
            final_answer = search_results
        else:
            max_context_length = 20000
            if len(search_results) > max_context_length:
                print(f"\n[알림] 추출된 정보가 너무 길어({len(search_results)}자), 핵심 내용만 요약하도록 {max_context_length}자로 축소합니다.")
                search_results = search_results[:max_context_length]
            
            print("\n[3단계] 검색 결과를 바탕으로 최종 답변을 생성합니다...")
            final_answer_system_prompt = """
            당신은 주어진 검색 결과를 바탕으로 사용자의 질문에 대해 종합적이고 친절한 답변을 생성하는 AI 어시스턴트입니다.
            답변은 반드시 주어진 검색 결과(<search_results>) 안의 정보에만 근거해야 합니다.
            절대로 당신의 기존 지식을 사용하거나 정보를 추측해서는 안 됩니다.
            만약 검색 결과에서 답변을 찾을 수 없다면, "검색된 정보로는 답변을 찾을 수 없습니다." 라고만 대답해주세요.
            """
            
            if original_action == "general_search":
                final_answer_system_prompt += "\n\n답변을 마친 후, 마지막에는 **주어진 검색 결과와 사용자의 질문 내용을 모두 고려하여** 자연스럽게 연결되는 환경 보호나 탄소 절감 관련 제안을 한 문장 덧붙여주세요. \n    예를 들어, 날씨가 좋다는 내용이 있으면 자전거 타기를 추천하고, 미세먼지가 많다는 내용이 있으면 대중교통 이용을 추천하고, 탄소 절감 관련 내용이 있으면 일상생활에서 실천할 수 있는 팁을 제공할 수 있습니다."

            final_answer = invoke_llm(final_answer_system_prompt, f"<search_results>\n{search_results}\n</search_results>\n\n사용자 질문: {user_query}")

    elif action == "recommend_challenge":
        print("[알림] 조율자 판단: 'recommend_challenge'. AI 챌린지를 추천하고 생성합니다.")
        
        # LLM에게 챌린지 아이디어를 요청하는 프롬프트
        challenge_prompt = f"""
        You are an AI assistant that generates eco-friendly challenge ideas.
        Based on the user's intent, generate a single challenge idea in JSON format.
        The challenge should be simple, actionable, and encourage carbon reduction.
        Provide a title, a short description, a reward (integer, e.g., 100), and optionally a target_mode (ANY, WALK, BIKE, PUBLIC_TRANSPORT), target_saved_g (float), or target_distance_km (float).
        If no specific mode or target is implied, use default values.
        
        Example JSON format:
        {{
            "title": "하루 1시간 걷기 챌린지",
            "description": "매일 1시간씩 걸어서 탄소 발자국을 줄여보세요!",
            "reward": 50,
            "target_mode": "WALK",
            "target_distance_km": 3.0
        }}
        
        User intent: "{router_decision.get("user_intent", user_query)}"
        Your JSON response:
        """
        
        challenge_idea_str = invoke_llm(challenge_prompt, "")
        
        try:
            challenge_idea = json.loads(challenge_idea_str)
            
            # AICallengeCreateRequest 모델에 맞게 데이터 준비
            challenge_request = AICallengeCreateRequest(
                title=challenge_idea.get("title", "AI 추천 챌린지"),
                description=challenge_idea.get("description", "AI가 추천하는 친환경 챌린지입니다."),
                reward=challenge_idea.get("reward", 30),
                target_mode=TransportMode[challenge_idea.get("target_mode", "ANY").upper()] if challenge_idea.get("target_mode") else TransportMode.ANY,
                target_saved_g=challenge_idea.get("target_saved_g"),
                target_distance_km=challenge_idea.get("target_distance_km")
            )
            
            # 의존성 주입을 위한 임시 세션 및 사용자 객체
            db_session = next(get_db()) # get_db는 제너레이터이므로 next()로 세션 얻기
            
            # 실제 User 객체를 데이터베이스에서 조회
            actual_current_user = db_session.query(User).filter(User.user_id == user_id).first()
            
            if not actual_current_user:
                raise HTTPException(status_code=404, detail="User not found for challenge creation.")

            challenge_response = await create_and_join_ai_challenge(
                request=challenge_request,
                db=db_session,
                current_user=actual_current_user # 실제 User 객체 전달
            )
            
            final_answer = challenge_response.get("message", "AI 챌린지 생성 및 참여에 실패했습니다.")
            if challenge_response.get("challenge"):
                final_answer += f" 챌린지 제목: {challenge_response['challenge'].title}"
            
        except json.JSONDecodeError as e:
            print(f"[오류] AI 챌린지 아이디어 파싱 중 오류 발생: {e}")
            final_answer = "AI 챌린지 아이디어를 이해하는 데 문제가 발생했습니다."
        except Exception as e:
            print(f"[오류] AI 챌린지 생성 및 참여 중 오류 발생: {e}")
            final_answer = f"AI 챌린지 생성 및 참여 중 오류가 발생했습니다: {e}"

    elif action == "direct_answer":
        print("[알림] 조율자 판단: 'direct_answer'. 즉시 답변합니다.")
        final_answer = router_decision.get("answer", "죄송합니다. 답변을 생성할 수 없습니다.")
    
    if not final_answer:
        final_answer = "죄송합니다. 요청을 처리하는 데 문제가 발생했습니다."

    print("\n--- 최종 답변 ---")
    print(final_answer)
    return {"response": final_answer}