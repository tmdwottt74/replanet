from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from .. import database, schemas, models

router = APIRouter(
    prefix="/api/admin",
    tags=["Admin"]
)

@router.get("/users", response_model=List[schemas.User])
def get_all_users(db: Session = Depends(database.get_db)):
    users = db.query(models.User).all()
    return users

@router.post("/grant-points")
def grant_points(
    request: schemas.AddPointsRequest,
    db: Session = Depends(database.get_db)
):
    # 기존 credits.py의 add_points 로직을 재활용
    # user_id는 request.user_id (string)로 넘어옴
    try:
        user_id_int = int(request.user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user_id format")

    user = db.query(models.User).filter(models.User.user_id == user_id_int).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # 포인트 추가/차감
    transaction_type = "EARN" if request.points > 0 else "SPEND"
    credit_entry = models.CreditsLedger(
        user_id=user_id_int,
        type=transaction_type,
        points=request.points,
        reason=request.reason,
        meta_json={"admin_action": True}
    )
    db.add(credit_entry)
    db.commit()
    db.refresh(credit_entry)

    return {"message": f"{request.points} points {transaction_type.lower()}ed for user {user_id_int}"}

@router.delete("/users/{user_id}")
def delete_user_by_admin(user_id: int, db: Session = Depends(database.get_db)):
    deleted_user = crud.delete_user(db=db, user_id=user_id)
    if not deleted_user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": f"User {user_id} deleted successfully"}

@router.post("/add-mobility-log")
def add_mobility_log(
    log_create: schemas.MobilityLogCreate,
    db: Session = Depends(database.get_db)
):
    # 기존 mobility_logs.py의 로직을 재활용하거나 직접 구현
    # 여기서는 직접 구현
    user = db.query(models.User).filter(models.User.user_id == log_create.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # CO2 절감량 및 포인트 계산 (임시 로직, 실제는 더 복잡할 수 있음)
    # 예시: 1km 당 100g CO2 절감, 100g 당 10포인트
    co2_saved_g = log_create.distance_km * 100 # 1km 당 100g 절감 가정
    points_earned = int(co2_saved_g / 10) # 10g 당 1포인트 가정

    new_log = models.MobilityLog(
        user_id=log_create.user_id,
        mode=log_create.mode,
        distance_km=log_create.distance_km,
        started_at=log_create.started_at,
        ended_at=log_create.ended_at,
        co2_saved_g=co2_saved_g,
        points_earned=points_earned,
        description=log_create.description,
        start_point=log_create.start_point,
        end_point=log_create.end_point
    )
    db.add(new_log)

    # 크레딧 장부에 포인트 추가
    credit_entry = models.CreditsLedger(
        user_id=log_create.user_id,
        ref_log_id=new_log.log_id, # MobilityLog의 ID를 참조
        type="EARN",
        points=points_earned,
        reason=f"Mobility: {log_create.mode.value}",
        meta_json={"mobility_log_id": new_log.log_id}
    )
    db.add(credit_entry)

    db.commit()
    db.refresh(new_log)
    db.refresh(credit_entry)

    return {"message": f"Mobility log added and {points_earned} points earned for user {log_create.user_id}"}
