from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List

from .. import database

router = APIRouter(
    prefix="/api/ranking",
    tags=["Ranking"],
)

@router.get("/")
async def get_ranking(db: Session = Depends(database.get_db)):
    query = text(
        """
        SELECT 
            u.username,
            v.total_co2_saved_g
        FROM v_daily_saving v
        JOIN users u ON u.user_id = v.user_id
        ORDER BY v.total_co2_saved_g DESC
        LIMIT 10;
        """
    )
    result = db.execute(query).fetchall()
    return result
