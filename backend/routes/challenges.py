# routes/challenges.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List

from .. import database, models, schemas
from ..dependencies import get_current_user

# /api/challenges 경로로 설정
router = APIRouter(
    prefix="/api/challenges",
    tags=["Challenges"]
)

# 챌린지 참여 요청을 위한 Pydantic 모델
class ChallengeJoinRequest(schemas.BaseModel):
    # user_id는 JWT에서 추출하므로 더 이상 요청 본문에 필요 없음
    pass

@router.post("/{challenge_id}/join")
def join_challenge(
    challenge_id: int, 
    request: ChallengeJoinRequest, 
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    """
    사용자를 챌린지에 참여시킵니다.
    이미 참여한 경우 오류를 반환합니다.
    """
    user_id = current_user.user_id
    # 1. 챌린지 존재 여부 확인
    challenge = db.query(models.Challenge).filter(models.Challenge.challenge_id == challenge_id).first()
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")

    # 2. 사용자 존재 여부 확인 (current_user로 이미 확인됨)
    user = db.query(models.User).filter(models.User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # 3. 이미 참여했는지 확인 (핵심 버그 수정)
    existing_member = db.query(models.ChallengeMember).filter(
        models.ChallengeMember.challenge_id == challenge_id,
        models.ChallengeMember.user_id == user_id
    ).first()

    if existing_member:
        raise HTTPException(status_code=400, detail="Already joined this challenge")

    # 4. 새 참여자로 등록
    new_member = models.ChallengeMember(
        challenge_id=challenge_id,
        user_id=user_id
    )
    db.add(new_member)
    db.commit()

    return {"message": f"Successfully joined challenge '{challenge.title}'"}


@router.get("/", response_model=List[schemas.FrontendChallenge])
def get_challenges(current_user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    """
    사용자의 챌린지 목록과 참여 상태를 반환합니다.
    """
    user_id = current_user.user_id
    # 모든 챌린지 목록을 가져옴
    all_challenges = db.query(models.Challenge).order_by(models.Challenge.challenge_id).all()
    
    # 사용자가 참여한 챌린지 ID 목록을 가져옴
    joined_challenge_ids = {
        member.challenge_id for member in 
        db.query(models.ChallengeMember).filter(models.ChallengeMember.user_id == user_id).all()
    }

    result = []
    for c in all_challenges:
        # TODO: 실제 진행률 계산 로직 필요
        progress = 0 
        if c.challenge_id in joined_challenge_ids:
            # 참여한 챌린지의 경우 임시로 25% 진행률 부여
            progress = 25 

        result.append({
            "id": c.challenge_id,
            "title": c.title,
            "description": c.description,
            "progress": progress,
            "reward": c.reward,
            "is_joined": c.challenge_id in joined_challenge_ids
        })

    return result


@router.get("/achievements", response_model=List[dict])
def get_achievements(current_user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    user_id = current_user.user_id
    query = text(
        """
        SELECT a.achievement_id, a.title, a.description, ua.granted_at
        FROM achievements a
        LEFT JOIN user_achievements ua
          ON ua.achievement_id = a.achievement_id AND ua.user_id = :uid
        ORDER BY a.achievement_id
        """
    )
    rows = db.execute(query, {"uid": user_id}).fetchall()
    result = []
    for r in rows:
        result.append({
            "id": int(r[0]),
            "name": r[1],
            "desc": r[2],
            "date": str(r[3]) if r[3] else None,
            "unlocked": bool(r[3]),
            "progress": 100 if r[3] else 50,  # 임시 진행률
        })
    if not result:
        result = [
            {"id": 1, "name": "첫 친환경 이동", "desc": "첫 이동기록을 등록했습니다", "unlocked": True, "date": "2025-09-10", "progress": 100}
        ]
    return result