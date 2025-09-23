from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from .. import database, models, schemas
from ..dependencies import get_current_user

router = APIRouter(
    prefix="/api/groups",
    tags=["Groups"],
)

@router.post("/", response_model=schemas.UserGroup)
async def create_group(group: schemas.UserGroupCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    db_group = models.UserGroup(group_name=group.group_name, group_type=group.group_type, region_code=group.region_code)
    db.add(db_group)
    db.commit()
    db.refresh(db_group)
    return db_group

@router.post("/{group_id}/join")
async def join_group(group_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    user = db.query(models.User).filter(models.User.user_id == current_user.user_id).first()
    group = db.query(models.UserGroup).filter(models.UserGroup.group_id == group_id).first()
    if not user or not group:
        raise HTTPException(status_code=404, detail="User or Group not found")
    user.user_group_id = group_id
    db.commit()
    return {"message": "Successfully joined group"}

@router.get("/ranking/{group_id}")
async def get_group_ranking(group_id: int, db: Session = Depends(database.get_db)):
    users_in_group = db.query(models.User).filter(models.User.user_group_id == group_id).all()
    user_ids = [user.user_id for user in users_in_group]

    leaderboard = db.query(models.User.username, models.UserGarden.total_carbon_reduced).join(models.UserGarden).filter(models.User.user_id.in_(user_ids)).order_by(models.UserGarden.total_carbon_reduced.desc()).limit(10).all()
    return leaderboard
