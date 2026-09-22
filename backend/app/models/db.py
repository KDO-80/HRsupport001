from sqlalchemy import Column, Integer, String, Date, Float, DateTime, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

DATABASE_URL = "sqlite:///./dashboard.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Contract(Base):
    __tablename__ = "contracts"
    id = Column(Integer, primary_key=True)
    contract_no = Column(String, unique=True)
    contract_name = Column(String)
    contractor = Column(String)
    start_date = Column(Date)
    end_date = Column(Date)
    manager = Column(String)
    manager_email = Column(String)
    team_lead_email = Column(String)  # 팀장 이메일
    sender_email = Column(String)     # 발송자 이메일 (HR지원팀)
    amount = Column(Float)
    remarks = Column(String)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Vehicle(Base):
    __tablename__ = "vehicles"
    id = Column(Integer, primary_key=True)
    vehicle_no = Column(String, unique=True)
    vehicle_type = Column(String)
    region = Column(String)
    usage_type = Column(String)
    fuel_type = Column(String)
    owner = Column(String)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class VehicleUsage(Base):
    __tablename__ = "vehicle_usage"
    id = Column(Integer, primary_key=True)
    vehicle_no = Column(String)
    region = Column(String)
    km = Column(Float)
    hours = Column(Float)
    dept = Column(String)
    month = Column(String)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class RentalItem(Base):
    __tablename__ = "rental_items"
    id = Column(Integer, primary_key=True)
    region = Column(String)
    office = Column(String)
    rental_type = Column(String)
    quantity = Column(Integer)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class AlertLog(Base):
    __tablename__ = "alert_logs"
    id = Column(Integer, primary_key=True)
    contract_no = Column(String)
    days_before = Column(Integer)  # 90, 60, 30
    manager_email = Column(String)
    sent_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="sent")

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
