from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, text
from typing import List
from datetime import datetime, timedelta

from .. import database, models
from ..dependencies import get_current_user

router = APIRouter(
    prefix="/api/stats",
    tags=["Statistics"],
)

@router.get("/trends")
async def get_trends(current_user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    user_id = current_user.user_id

    # Weekly trend
    weekly_query = text(
        """
        SELECT 
            YEARWEEK(started_at, 1) as week,
            SUM(co2_saved_g) as total_co2_saved_g
        FROM mobility_logs
        WHERE user_id = :user_id
        GROUP BY week
        ORDER BY week DESC
        LIMIT 4;
        """
    )
    weekly_result = db.execute(weekly_query, {"user_id": user_id}).fetchall()

    # Monthly trend
    monthly_query = text(
        """
        SELECT 
            DATE_FORMAT(started_at, '%Y-%m') as month,
            SUM(co2_saved_g) as total_co2_saved_g
        FROM mobility_logs
        WHERE user_id = :user_id
        GROUP BY month
        ORDER BY month DESC
        LIMIT 6;
        """
    )
    monthly_result = db.execute(monthly_query, {"user_id": user_id}).fetchall()

    return {"weekly": weekly_result, "monthly": monthly_result}
