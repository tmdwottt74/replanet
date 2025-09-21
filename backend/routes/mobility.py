from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional, List

from .. import schemas, models, database # Import database module
from ..database import get_db # Import get_db function
from ..dependencies import get_current_user # Assuming authentication is required

router = APIRouter(
    prefix="/api/mobility", # Changed prefix to include /api
    tags=["mobility"],
)

# Carbon emission factors in gCO2/km for different modes
# Assuming car travel is the baseline for CO2 reduction when using sustainable modes.
# These values are illustrative and can be refined.
CARBON_EMISSION_FACTORS_G_PER_KM = {
    schemas.TransportMode.WALK: 0, # Actual emission for walking
    schemas.TransportMode.BIKE: 0, # Actual emission for biking
    schemas.TransportMode.BUS: 100, # Average bus emission
    schemas.TransportMode.SUBWAY: 50, # Average subway emission
    schemas.TransportMode.CAR: 170, # Average car emission (baseline for savings)
}

# Credit conversion: 1 point per X grams of CO2 saved
CREDIT_PER_G_CO2 = 0.1 # Example: 1 point for every 10g of CO2 saved

@router.post("/log", response_model=schemas.MobilityLogResponse)
async def log_mobility_data(
    log_data: schemas.MobilityLogCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Ensure the user_id in the log_data matches the authenticated user
    if log_data.user_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot log data for another user"
        )

    # Calculate CO2 saved and points earned
    mode_emission = CARBON_EMISSION_FACTORS_G_PER_KM.get(log_data.mode, 0)
    car_emission_baseline = CARBON_EMISSION_FACTORS_G_PER_KM.get(schemas.TransportMode.CAR, 170)

    # If the mode is a sustainable one (WALK, BIKE), calculate savings against car baseline
    if log_data.mode in [schemas.TransportMode.WALK, schemas.TransportMode.BIKE, schemas.TransportMode.BUS, schemas.TransportMode.SUBWAY]:
        co2_saved_g = (car_emission_baseline - mode_emission) * log_data.distance_km
        if co2_saved_g < 0: # Ensure savings are not negative
            co2_saved_g = 0
    else: # For other modes, no CO2 saving is assumed for now
        co2_saved_g = 0

    points_earned = int(co2_saved_g * CREDIT_PER_G_CO2)

    # Create a new MobilityLog entry
    db_mobility_log = models.MobilityLog(
        user_id=current_user.user_id,
        mode=log_data.mode,
        distance_km=log_data.distance_km,
        started_at=log_data.started_at,
        ended_at=log_data.ended_at,
        co2_baseline_g=car_emission_baseline * log_data.distance_km, # Baseline if car was used
        co2_actual_g=mode_emission * log_data.distance_km, # Actual emission for the chosen mode
        co2_saved_g=co2_saved_g,
        points_earned=points_earned,
        description=log_data.description,
        start_point=log_data.start_point,
        end_point=log_data.end_point,
        created_at=datetime.utcnow(),
        # source_id needs to be handled. For now, let's assume a default or add it later.
        # For simplicity, we'll omit source_id for now or use a hardcoded default if necessary.
        # A better approach would be to have a default 'MobilityTracker' source in the DB.
    )
    db.add(db_mobility_log)
    db.commit()
    db.refresh(db_mobility_log)

    # Update user's total credits
    # Assuming user has a 'total_points' field or similar in the User model
    # If not, we need to add it or use a CreditsLedger entry
    user = db.query(models.User).filter(models.User.user_id == current_user.user_id).first()
    if user:
        # This part needs to be carefully considered.
        # The User model does not currently have a 'total_points' field.
        # We should either add it to the User model or rely solely on the CreditsLedger.
        # For now, let's add an entry to the CreditsLedger.
        db_credit_entry = models.CreditsLedger(
            user_id=current_user.user_id,
            ref_log_id=db_mobility_log.log_id,
            type=schemas.CreditType.EARN,
            points=points_earned,
            reason=f"Mobility: {log_data.mode.value} for {log_data.distance_km:.2f} km",
            created_at=datetime.utcnow()
        )
        db.add(db_credit_entry)
        db.commit()
        db.refresh(db_credit_entry)
    
    # The frontend expects eco_credits_earned, which maps to points_earned
    return schemas.MobilityLogResponse(
        log_id=db_mobility_log.log_id,
        user_id=db_mobility_log.user_id,
        mode=db_mobility_log.mode,
        distance_km=db_mobility_log.distance_km,
        started_at=db_mobility_log.started_at,
        ended_at=db_mobility_log.ended_at,
        co2_saved_g=db_mobility_log.co2_saved_g,
        eco_credits_earned=db_mobility_log.points_earned,
        description=db_mobility_log.description,
        start_point=db_mobility_log.start_point,
        end_point=db_mobility_log.end_point,
    )

@router.get("/history/{user_id}") # Removed response_model for simplicity
def get_mobility_history(user_id: int):
    print(f"DEBUG: get_mobility_history hit for user_id: {user_id}")
    return {"message": f"Mobility history for user {user_id} (test response)"}
