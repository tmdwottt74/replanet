from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from .database import SessionLocal, engine
from . import crud, schemas, models

# Ensure tables are created
models.Base.metadata.create_all(bind=engine)

def seed_challenges(db: Session):
    challenges_to_create = [
        schemas.ChallengeCreate(
            title="9월 대중교통 챌린지",
            description="이번 달 대중교통으로 10kg CO₂ 절감하기",
            scope=schemas.ChallengeScope.PERSONAL,
            target_mode=schemas.TransportMode.ANY,
            target_saved_g=10000, # 10kg
            start_at=datetime(2025, 9, 1),
            end_at=datetime(2025, 9, 30),
            reward="에코 크레딧 200P + 뱃지",
            created_by=1 # Assuming user_id 1 exists
        ),
        schemas.ChallengeCreate(
            title="자전거 출퇴근 챌린지",
            description="한 달간 자전거로 출퇴근하여 5kg CO₂ 절감",
            scope=schemas.ChallengeScope.PERSONAL,
            target_mode=schemas.TransportMode.BIKE,
            target_saved_g=5000, # 5kg
            start_at=datetime(2025, 9, 1),
            end_at=datetime(2025, 9, 30),
            reward="에코 크레딧 150P + 뱃지",
            created_by=1
        ),
        schemas.ChallengeCreate(
            title="도보 생활 챌린지",
            description="일주일간 1km 이내는 도보로 이동하기",
            scope=schemas.ChallengeScope.PERSONAL,
            target_mode=schemas.TransportMode.WALK,
            target_saved_g=1000, # 1kg (assuming 1km walk saves some CO2)
            start_at=datetime.utcnow() - timedelta(days=7),
            end_at=datetime.utcnow() + timedelta(days=7),
            reward="에코 크레딧 100P",
            created_by=1
        ),
        schemas.ChallengeCreate(
            title="친환경 이동 30일",
            description="30일 연속 친환경 교통수단 이용하기",
            scope=schemas.ChallengeScope.PERSONAL,
            target_mode=schemas.TransportMode.ANY,
            target_saved_g=15000, # 15kg
            start_at=datetime.utcnow() - timedelta(days=15),
            end_at=datetime.utcnow() + timedelta(days=15),
            reward="에코 크레딧 300P + 특별 뱃지",
            created_by=1
        )
    ]

    for challenge_data in challenges_to_create:
        # Check if challenge already exists to prevent duplicates
        existing_challenge = db.query(models.Challenge).filter_by(title=challenge_data.title).first()
        if not existing_challenge:
            crud.create_challenge(db=db, challenge=challenge_data)
            print(f"Created challenge: {challenge_data.title}")
        else:
            print(f"Challenge already exists: {challenge_data.title}")

if __name__ == "__main__":
    db = SessionLocal()
    try:
        seed_challenges(db)
        print("Default challenges seeded successfully!")
    except Exception as e:
        print(f"Error seeding challenges: {e}")
    finally:
        db.close()
