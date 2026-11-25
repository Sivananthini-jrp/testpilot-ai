import psycopg
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Use psycopg (v3) for Windows compatibility
SQLALCHEMY_DATABASE_URL = "postgresql+psycopg://neondb_owner:npg_sdrH09aRPeyb@ep-twilight-thunder-bd6ixt3e-pooler.c-8.us-east-2.aws.neon.tech/neondb?sslmode=require"

engine = create_engine(SQLALCHEMY_DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
print("✅ CONNECTED TO NEON VIA PSYCOPG3")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()