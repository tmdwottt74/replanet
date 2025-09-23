from datetime import datetime
import enum

from sqlalchemy import (
    Column, BigInteger, Enum, DateTime, Numeric, String, Integer, ForeignKey
)
from sqlalchemy.dialects.mysql import JSON
from sqlalchemy.orm import relationship

from .database import Base  # Declarative Base


# ---------------------------
# ENUM 정의
# ---------------------------
class UserGroupType(str, enum.Enum):
    SCHOOL = "SCHOOL"
    COMPANY = "COMPANY"
    COMMUNITY = "COMMUNITY"
    ETC = "ETC"

class UserRole(str, enum.Enum):
    USER = "USER"
    ADMIN = "ADMIN"

class TransportMode(str, enum.Enum):
    BUS = "BUS"
    SUBWAY = "SUBWAY"
    BIKE = "BIKE"
    WALK = "WALK"
    CAR = "CAR"
    ANY = "ANY"   # Challenge 기본값 문제 해결 위해 추가

class CreditType(str, enum.Enum):
    EARN = "EARN"
    SPEND = "SPEND"
    ADJUST = "ADJUST"

class ChallengeScope(str, enum.Enum):
    PERSONAL = "PERSONAL"
    GROUP = "GROUP"

class ChallengeCompletionType(str, enum.Enum):
    MANUAL = "MANUAL"
    # Add other completion types if they exist or are planned

class NotificationStatus(str, enum.Enum):
    PENDING = "PENDING"
    SENT = "SENT"
    READ = "READ"

class GardenStatus(str, enum.Enum):
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"


# ---------------------------
# USER GROUPS
# ---------------------------
class UserGroup(Base):
    __tablename__ = "user_groups"
    
    group_id = Column(BigInteger, primary_key=True, autoincrement=True)
    group_name = Column(String(80), nullable=False, unique=True)
    group_type = Column(Enum(UserGroupType), default=UserGroupType.ETC)
    region_code = Column(String(10))
    created_at = Column(DateTime, default=datetime.utcnow)


# ---------------------------
# USERS
# ---------------------------
class User(Base):
    __tablename__ = "users"
    
    user_id = Column(BigInteger, primary_key=True, autoincrement=True)
    username = Column(String(50), nullable=False, unique=True)
    email = Column(String(120), unique=True)
    password_hash = Column(String(255))
    user_group_id = Column(BigInteger, ForeignKey("user_groups.group_id"))
    role = Column(Enum(UserRole), default=UserRole.USER)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    group = relationship("UserGroup", backref="users")
    mobility_logs = relationship("MobilityLog", backref="user")
    credits = relationship("CreditsLedger", backref="user")
    garden = relationship("UserGarden", backref="user", uselist=False)


# ---------------------------
# CARBON FACTORS
# ---------------------------
class CarbonFactor(Base):
    __tablename__ = "carbon_factors"
    
    factor_id = Column(BigInteger, primary_key=True, autoincrement=True)
    mode = Column(Enum(TransportMode, name="transport_mode"), nullable=False)
    g_per_km = Column(Numeric(10, 3), nullable=False)  # gCO2/km
    valid_from = Column(DateTime, nullable=False)
    valid_to = Column(DateTime, default=lambda: datetime(9999, 12, 31))


# ---------------------------
# INGEST SOURCES
# ---------------------------
class IngestSource(Base):
    __tablename__ = "ingest_sources"
    
    source_id = Column(BigInteger, primary_key=True, autoincrement=True)
    source_name = Column(String(50), nullable=False, unique=True)
    description = Column(String(255))


# ---------------------------
# MOBILITY LOGS
# ---------------------------
class MobilityLog(Base):
    __tablename__ = "mobility_logs"
    
    log_id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id = Column(BigInteger, ForeignKey("users.user_id"), nullable=False)
    source_id = Column(BigInteger, ForeignKey("ingest_sources.source_id"))
    mode = Column(Enum(TransportMode), nullable=False)
    distance_km = Column(Numeric(8, 3), nullable=False)
    started_at = Column(DateTime, nullable=False)
    ended_at = Column(DateTime, nullable=False)
    raw_ref_id = Column(String(100))
    co2_baseline_g = Column(Numeric(12, 3))
    co2_actual_g = Column(Numeric(12, 3))
    co2_saved_g = Column(Numeric(12, 3))
    points_earned = Column(Integer, default=0)
    description = Column(String(255))
    start_point = Column(String(255))
    end_point = Column(String(255))
    used_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    source = relationship("IngestSource", backref="mobility_logs")


# ---------------------------
# CREDITS LEDGER
# ---------------------------
class CreditsLedger(Base):
    __tablename__ = "credits_ledger"
    
    entry_id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id = Column(BigInteger, ForeignKey("users.user_id"), nullable=False)
    ref_log_id = Column(BigInteger, ForeignKey("mobility_logs.log_id"))
    type = Column(Enum(CreditType), nullable=False)
    points = Column(Integer, nullable=False)
    reason = Column(String(120), nullable=False)
    meta_json = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    mobility_log = relationship("MobilityLog", backref="credit_entries")


# Challenges
class Challenge(Base):
    __tablename__ = "challenges"
    
    challenge_id = Column(BigInteger, primary_key=True, autoincrement=True)
    title = Column(String(100), nullable=False)
    description = Column(String(255))
    scope = Column(Enum(ChallengeScope), default=ChallengeScope.PERSONAL)
    target_mode = Column(Enum(TransportMode), default=TransportMode.ANY)
    target_saved_g = Column(Integer, nullable=False)
    start_at = Column(DateTime, nullable=False)
    end_at = Column(DateTime, nullable=False)
    reward = Column(String(255), nullable=True) # Add reward field
    created_by = Column(BigInteger, ForeignKey("users.user_id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    creator = relationship("User", backref="created_challenges")
    members = relationship("User", secondary="challenge_members", backref="challenges")

# Challenge Members (Many-to-Many)
class ChallengeMember(Base):
    __tablename__ = "challenge_members"
    
    challenge_id = Column(BigInteger, ForeignKey("challenges.challenge_id"), primary_key=True)
    user_id = Column(BigInteger, ForeignKey("users.user_id"), primary_key=True)
    joined_at = Column(DateTime, default=datetime.utcnow)

# Achievements
class Achievement(Base):
    __tablename__ = "achievements"
    
    achievement_id = Column(BigInteger, primary_key=True, autoincrement=True)
    code = Column(String(50), unique=True)
    title = Column(String(100), nullable=False)
    description = Column(String(255))
    
    # Relationships
    users = relationship("User", secondary="user_achievements", backref="achievements")

# User Achievements (Many-to-Many)
class UserAchievement(Base):
    __tablename__ = "user_achievements"
    
    user_id = Column(BigInteger, ForeignKey("users.user_id"), primary_key=True)
    achievement_id = Column(BigInteger, ForeignKey("achievements.achievement_id"), primary_key=True)
    granted_at = Column(DateTime, default=datetime.utcnow)

# Notifications
class Notification(Base):
    __tablename__ = "notifications"
    
    notification_id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id = Column(BigInteger, ForeignKey("users.user_id"), nullable=False)
    title = Column(String(120), nullable=False)
    body = Column(String(500))
    status = Column(Enum(NotificationStatus), default=NotificationStatus.PENDING)
    created_at = Column(DateTime, default=datetime.utcnow)
    read_at = Column(DateTime)

# Ingest Raw
class IngestRaw(Base):
    __tablename__ = "ingest_raw"
    
    raw_id = Column(BigInteger, primary_key=True, autoincrement=True)
    source_id = Column(BigInteger, ForeignKey("ingest_sources.source_id"), nullable=False)
    user_id = Column(BigInteger, ForeignKey("users.user_id"))
    captured_at = Column(DateTime, nullable=False)
    payload = Column(JSON, nullable=False)
    
    # Relationships
    source = relationship("IngestSource", backref="raw_data")

# Subway Distances
class SubwayDistance(Base):
    __tablename__ = "subway_distances"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    station_start = Column(String(255))
    station_end = Column(String(255))
    distance_km = Column(Numeric(6, 2))   # ✅ 수정됨

# Bus Distances
class BusDistance(Base):
    __tablename__ = "bus_distances"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    route_id = Column(String(50))
    stop_start = Column(String(255))
    stop_end = Column(String(255))
    distance_km = Column(Numeric(6, 2))   # ✅ 수정됨

# Garden System
class GardenLevel(Base):
    __tablename__ = "garden_levels"
    
    level_id = Column(BigInteger, primary_key=True, autoincrement=True)
    level_number = Column(Integer, nullable=False, unique=True)
    level_name = Column(String(50), nullable=False)
    image_path = Column(String(255), nullable=False)
    required_waters = Column(Integer, nullable=False, default=10)
    description = Column(String(255))
    
    # Relationships
    gardens = relationship("UserGarden", back_populates="level")

class UserGarden(Base):
    __tablename__ = "user_gardens"
    
    garden_id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id = Column(BigInteger, ForeignKey("users.user_id"), nullable=False)
    current_level_id = Column(BigInteger, ForeignKey("garden_levels.level_id"), nullable=False)
    waters_count = Column(Integer, default=0)
    total_waters = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    watering_logs = relationship("GardenWateringLog", backref="garden")
    level = relationship("GardenLevel", back_populates="gardens")

class GardenWateringLog(Base):
    __tablename__ = "garden_watering_logs"
    
    log_id = Column(BigInteger, primary_key=True, autoincrement=True)
    garden_id = Column(BigInteger, ForeignKey("user_gardens.garden_id"), nullable=False)
    user_id = Column(BigInteger, ForeignKey("users.user_id"), nullable=False)
    points_spent = Column(Integer, default=10)
    watered_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", backref="watering_logs")

class SocialPost(Base):
    __tablename__ = "social_posts"

    post_id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id = Column(BigInteger, ForeignKey("users.user_id"), nullable=False)
    content = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", backref="social_posts")