from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv() # Load environment variables from .env file

# 데이터베이스 URL 설정
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_USER = os.getenv("DB_USER", "root")
DB_PASS = os.getenv("DB_PASS", "password")
DB_NAME = os.getenv("DB_NAME", "ecoooo_db")

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    f"mysql+pymysql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)
# Fallback to SQLite if no MySQL env vars are set
if not DB_USER or not DB_PASS or not DB_NAME:
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./ecoooo.db")

# SQLAlchemy 엔진 생성
engine = create_engine(
    DATABASE_URL,
    echo=False,  # SQL 쿼리 로깅 (개발시에만 True)
    pool_pre_ping=True,  # 연결 상태 확인
    pool_recycle=300,    # 5분마다 연결 재생성
)

# 세션 팩토리 생성
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base 클래스 생성
Base = declarative_base()

def get_db():
    """데이터베이스 세션을 생성하고 반환합니다."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """데이터베이스 테이블을 생성하고 초기 데이터를 시딩합니다."""
    from .models import Base
    from .seed_admin_user import seed_admin_user
    from .seed_challenges import seed_challenges
    from .seed_garden_levels import seed_garden_levels
    from .crud import create_user_group # Assuming this is needed for initial groups

    Base.metadata.create_all(bind=engine)

    # Seed initial data
    db = SessionLocal()
    try:
        # Seed default user groups if needed
        # Example: create_user_group(db, schemas.UserGroupCreate(group_name="Default Group", group_type="ETC"))
        seed_admin_user(db)
        seed_challenges(db)
        seed_garden_levels(db)
    except Exception as e:
        print(f"Error during database seeding: {e}")
    finally:
        db.close()