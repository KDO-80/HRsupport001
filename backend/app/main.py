from fastapi import FastAPI, UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.models.db import get_db, Contract, Vehicle, RentalItem, AlertLog
from app.services.excel_parser import parse_contract_file, parse_vehicle_file, parse_rental_file
from app.services.scheduler import start_scheduler
from app.services.ai_analyzer import AIAnalyzer
import tempfile
import os
from datetime import datetime, timedelta

class QuestionRequest(BaseModel):
    question: str
    data_type: str  # contracts, vehicles, rentals

ai_analyzer = AIAnalyzer()

app = FastAPI()

@app.on_event("startup")
async def startup():
    start_scheduler()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/contracts", tags=["Contracts"])
def get_contracts(db: Session = Depends(get_db)):
    return db.query(Contract).all()

@app.get("/api/vehicles", tags=["Vehicles"])
def get_vehicles(db: Session = Depends(get_db)):
    return db.query(Vehicle).all()

@app.get("/api/rentals", tags=["Rentals"])
def get_rentals(db: Session = Depends(get_db)):
    return db.query(RentalItem).all()

@app.post("/api/upload/contracts", tags=["Upload"])
def upload_contracts(file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".xlsx") as tmp:
            tmp.write(file.file.read())
            tmp_path = tmp.name

        count = parse_contract_file(tmp_path, db)
        os.remove(tmp_path)
        return {"status": "success", "rows": count}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/api/upload/vehicles", tags=["Upload"])
def upload_vehicles(file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".xlsx") as tmp:
            tmp.write(file.file.read())
            tmp_path = tmp.name

        count = parse_vehicle_file(tmp_path, db)
        os.remove(tmp_path)
        return {"status": "success", "rows": count}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/api/upload/rentals", tags=["Upload"])
def upload_rentals(file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".xlsx") as tmp:
            tmp.write(file.file.read())
            tmp_path = tmp.name

        count = parse_rental_file(tmp_path, db)
        os.remove(tmp_path)
        return {"status": "success", "rows": count}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/api/stats", tags=["Stats"])
def get_stats(db: Session = Depends(get_db)):
    return {
        "contracts_count": db.query(Contract).count(),
        "vehicles_count": db.query(Vehicle).count(),
        "rentals_count": db.query(RentalItem).count()
    }

@app.get("/api/contract-stats", tags=["Stats"])
def get_contract_stats(db: Session = Depends(get_db)):
    from datetime import datetime, timedelta
    today = datetime.now().date()
    contracts = db.query(Contract).all()

    status_count = {"진행중": 0, "만료임박": 0, "완료": 0}
    for c in contracts:
        if not c.end_date:
            status_count["진행중"] += 1
        elif c.end_date < today:
            status_count["완료"] += 1
        elif (c.end_date - today).days <= 90:
            status_count["만료임박"] += 1
        else:
            status_count["진행중"] += 1

    return status_count

@app.get("/api/vehicle-stats", tags=["Stats"])
def get_vehicle_stats(db: Session = Depends(get_db)):
    vehicles = db.query(Vehicle).all()
    fuel_count = {}
    type_count = {}

    for v in vehicles:
        fuel_count[v.fuel_type] = fuel_count.get(v.fuel_type, 0) + 1
        type_count[v.vehicle_type] = type_count.get(v.vehicle_type, 0) + 1

    return {
        "by_fuel": [{"name": k, "value": v} for k, v in fuel_count.items()],
        "by_type": [{"name": k, "value": v} for k, v in type_count.items()]
    }

@app.get("/api/rental-stats", tags=["Stats"])
def get_rental_stats(db: Session = Depends(get_db)):
    rentals = db.query(RentalItem).all()
    region_count = {}
    rental_count = {}

    for r in rentals:
        region_count[r.region] = region_count.get(r.region, 0) + r.quantity
        rental_count[r.rental_type] = rental_count.get(r.rental_type, 0) + r.quantity

    return {
        "by_region": [{"name": k, "value": v} for k, v in region_count.items()],
        "by_type": [{"name": k, "value": v} for k, v in rental_count.items()]
    }

@app.get("/api/alerts", tags=["Alerts"])
def get_alerts(db: Session = Depends(get_db)):
    today = datetime.now().date()
    alerts = []

    contracts = db.query(Contract).all()
    for contract in contracts:
        if not contract.end_date:
            continue

        days_until = (contract.end_date - today).days
        if 0 <= days_until <= 90:
            severity = "🔴 긴급" if days_until <= 7 else "🟡 주의" if days_until <= 30 else "🟢 정상"

            alert_record = db.query(AlertLog).filter(
                AlertLog.contract_no == contract.contract_no,
                AlertLog.days_before >= days_until
            ).first()

            alerts.append({
                "contract_no": contract.contract_no,
                "contract_name": contract.contract_name,
                "manager": contract.manager,
                "days_until": days_until,
                "end_date": contract.end_date.isoformat(),
                "severity": severity,
                "notified": bool(alert_record)
            })

    return sorted(alerts, key=lambda x: x['days_until'])

@app.post("/api/ai-question", tags=["AI"])
def ask_ai_question(request: QuestionRequest, db: Session = Depends(get_db)):
    answer = ai_analyzer.ask_question(request.question, request.data_type, db)
    return {"answer": answer}

@app.post("/api/ai-reset", tags=["AI"])
def reset_ai_conversation():
    ai_analyzer.reset_conversation()
    return {"status": "대화 기록이 초기화되었습니다"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
