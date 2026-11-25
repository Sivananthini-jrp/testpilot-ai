from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from datetime import datetime
from app.database import Base

class Repository(Base):
    __tablename__ = "repositories"
    id = Column(String, primary_key=True, index=True)
    project_types = Column(String)
    languages = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class TestReport(Base):
    __tablename__ = "test_reports"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    repo_id = Column(String, index=True)
    function_name = Column(String)
    passed = Column(Boolean)
    stdout = Column(Text)
    stderr = Column(Text)
    duration = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)