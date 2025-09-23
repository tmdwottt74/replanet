from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import database
from .. import models
from .. import aws

router = APIRouter(
    prefix="/api/social",
    tags=["social"],
)

@router.post("/share")
async def share_activity(activity: str, db: Session = Depends(database.get_db)):
    # This is a placeholder. In a real application, you would get the user from the request.
    user_id = 1
    new_post = models.SocialPost(user_id=user_id, content=activity)
    db.add(new_post)
    db.commit()
    db.refresh(new_post)
    aws.publish_message(f"User {user_id} {activity}")
    return {"message": "Activity shared successfully"}

@router.get("/feed")
async def get_social_feed(db: Session = Depends(database.get_db)):
    feed = db.query(models.SocialPost).order_by(models.SocialPost.created_at.desc()).limit(20).all()
    return feed

@router.get("/leaderboard")
async def get_leaderboard(db: Session = Depends(database.get_db)):
    leaderboard = db.query(models.User.username, models.UserGarden.total_carbon_reduced).join(models.UserGarden).order_by(models.UserGarden.total_carbon_reduced.desc()).limit(10).all()
    return leaderboard