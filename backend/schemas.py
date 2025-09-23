from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

# --------------------------
# ENUM 정의 (모든 Enum을 여기에 모음)
# --------------------------
class CreditType(str, Enum):
    EARN = "EARN"
    SPEND = "SPEND"
    ADJUST = "ADJUST"

class TransportMode(str, Enum):
    BUS = "BUS"
    SUBWAY = "SUBWAY"
    BIKE = "BIKE"
    WALK = "WALK"
    CAR = "CAR"
    ANY = "ANY" # Added for challenge target mode

class ChallengeScope(str, Enum):
    PERSONAL = "PERSONAL"
    GROUP = "GROUP"

class GardenStatusEnum(str, Enum):
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"

# --------------------------
# 스키마 정의 (BaseModel 클래스)
# --------------------------

# 크레딧 관련 스키마
class CreditBalance(BaseModel):
    user_id: int
    total_points: int
    recent_earned: int
    last_updated: datetime
    class Config:
        from_attributes = True

class CreditTransaction(BaseModel):
    entry_id: int
    type: CreditType
    points: int
    reason: str
    created_at: datetime
    meta: Optional[Dict[str, Any]] = None
    class Config:
        from_attributes = True

class CreditHistory(BaseModel):
    user_id: int
    transactions: List[CreditTransaction]
    total_count: int
    class Config:
        from_attributes = True

# 정원 관련 스키마
class GardenStatus(BaseModel):
    user_id: int
    level_number: int
    level_name: str
    image_path: str
    waters_count: int
    total_waters: int
    required_waters: int
    status: GardenStatusEnum
    class Config:
        from_attributes = True

class WateringRequest(BaseModel):
    user_id: int
    points_spent: int = 10

class WateringResponse(BaseModel):
    success: bool
    garden_id: int
    waters_count: int
    total_waters: int
    level_up: bool
    new_level: Optional[str] = None
    points_spent: int
    remaining_points: int
    class Config:
        from_attributes = True

# 대시보드 관련 스키마
class DailySaving(BaseModel):
    date: str
    saved_g: float

class ModeStat(BaseModel):
    mode: str
    saved_g: float

class ChallengeStat(BaseModel):
    goal: float
    progress: float

class DashboardStats(BaseModel):
    user_id: int
    co2_saved_today: float
    eco_credits_earned: int
    garden_level: int
    total_saved: float
    total_points: int
    last7days: List[DailySaving]
    modeStats: List[ModeStat]
    challenge: ChallengeStat
    class Config:
        from_attributes = True

class MobilityLog(BaseModel):
    log_id: int
    mode: TransportMode
    distance_km: float
    started_at: datetime
    ended_at: datetime
    co2_saved_g: float
    points_earned: int
    description: Optional[str] = None
    start_point: Optional[str] = None
    end_point: Optional[str] = None

class MobilityLogCreate(BaseModel):
    user_id: int
    mode: TransportMode
    distance_km: float
    started_at: datetime
    ended_at: datetime
    description: Optional[str] = None
    start_point: Optional[str] = None
    end_point: Optional[str] = None

# 챌린지 관련 스키마
class Challenge(BaseModel):
    challenge_id: int
    title: str
    description: Optional[str] = None
    scope: str
    target_mode: str
    target_saved_g: int
    start_at: datetime
    end_at: datetime
    reward: Optional[str] = None # Added reward field
    created_by: Optional[int] = None
    created_at: datetime

class ChallengeMember(BaseModel):
    challenge_id: int
    user_id: int
    joined_at: datetime

class ChallengeBase(BaseModel):
    title: str
    description: Optional[str] = None
    scope: ChallengeScope
    target_mode: TransportMode
    target_saved_g: int
    start_at: datetime
    end_at: datetime
    reward: Optional[str] = None

class ChallengeCreate(ChallengeBase):
    created_by: Optional[int] = None

class FrontendChallenge(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    progress: int # Percentage
    reward: Optional[str] = None
    is_joined: bool # New field

class ChallengeRecommendationRequest(BaseModel):
    user_id: int
    title: str
    description: Optional[str] = None
    scope: ChallengeScope
    target_mode: TransportMode
    target_saved_g: int
    start_at: datetime
    end_at: datetime
    reward: Optional[str] = None

# 업적 관련 스키마
class Achievement(BaseModel):
    achievement_id: int
    code: str
    title: str
    description: Optional[str] = None

class UserAchievement(BaseModel):
    user_id: int
    achievement_id: int
    granted_at: datetime

# 알림 관련 스키마
class Notification(BaseModel):
    notification_id: int
    user_id: int
    title: str
    body: Optional[str] = None
    status: str
    created_at: datetime
    read_at: Optional[datetime] = None

# 사용자 관련 스키마
class User(BaseModel):
    user_id: int
    username: str
    email: Optional[str] = None
    user_group_id: Optional[int] = None
    role: str
    created_at: datetime

class UserRead(User):
    class Config:
        from_attributes = True
        exclude = {"password_hash"}

class UserCreate(BaseModel):
    username: str
    email: Optional[str] = None
    password_hash: str
    role: Optional[str] = None
    user_group_id: Optional[int] = None

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    username: str
    role: str

class TokenData(BaseModel):
    user_id: Optional[int] = None

class UserGroup(BaseModel):
    group_id: int
    group_name: str
    group_type: str
    region_code: Optional[str] = None
    created_at: datetime

class UserGroupCreate(BaseModel):
    group_name: str
    group_type: Optional[str] = None
    region_code: Optional[str] = None

class UserContext(BaseModel):
    username: str
    group_name: Optional[str] = None
    group_type: Optional[str] = None

# 탄소 배출 계수 스키마
class CarbonFactor(BaseModel):
    factor_id: int
    mode: TransportMode
    g_per_km: float
    valid_from: datetime
    valid_to: Optional[datetime] = None

# 통계 관련 스키마
class DailyStats(BaseModel):
    date: str
    co2_saved: float
    points_earned: int
    activities_count: int

class WeeklyStats(BaseModel):
    week_start: str
    week_end: str
    total_co2_saved: float
    total_points_earned: int
    total_activities: int
    daily_breakdown: List[DailyStats]

class MonthlyStats(BaseModel):
    month: str
    total_co2_saved: float
    total_points_earned: int
    total_activities: int
    weekly_breakdown: List[WeeklyStats]

# API 응답 스키마
class APIResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None

class ErrorResponse(BaseModel):
    success: bool = False
    error: str
    detail: Optional[str] = None

class AddPointsRequest(BaseModel):
    user_id: int
    points: int
    reason: str

class MobilityLogResponse(BaseModel):
    log_id: int
    user_id: int
    mode: TransportMode
    distance_km: float
    started_at: datetime
    ended_at: datetime
    co2_saved_g: float
    eco_credits_earned: int # Renamed from points_earned for clarity with frontend
    description: Optional[str] = None
    start_point: Optional[str] = None
    end_point: Optional[str] = None
    class Config:
        from_attributes = True