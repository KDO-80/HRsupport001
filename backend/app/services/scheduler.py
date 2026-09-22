from apscheduler.schedulers.asyncio import AsyncIOScheduler
from datetime import datetime, timedelta
from app.models.db import SessionLocal, Contract, AlertLog
from app.services.email_service import EmailService
import logging

logger = logging.getLogger(__name__)
scheduler = AsyncIOScheduler()
email_service = EmailService()

async def check_contract_expiry():
    """계약 만료 90/60/30일 전 알람 확인 및 이메일 발송"""
    db = SessionLocal()
    today = datetime.now().date()

    try:
        contracts = db.query(Contract).all()

        for contract in contracts:
            if not contract.end_date:
                continue

            days_until_expiry = (contract.end_date - today).days

            # 90, 60, 30일 전 확인
            for threshold in [90, 60, 30]:
                if days_until_expiry == threshold:
                    # 이미 발송했는지 확인
                    existing = db.query(AlertLog).filter(
                        AlertLog.contract_no == contract.contract_no,
                        AlertLog.days_before == threshold
                    ).first()

                    if not existing:
                        # 이메일 발송
                        email_sent = email_service.send_contract_expiry_alert(
                            contract_no=contract.contract_no,
                            contract_name=contract.contract_name,
                            days_until=days_until_expiry,
                            manager=contract.manager,
                            manager_email=contract.manager_email,
                            team_lead_email=contract.team_lead_email
                        )

                        # 알람 기록 저장
                        alert = AlertLog(
                            contract_no=contract.contract_no,
                            days_before=threshold,
                            manager_email=contract.manager_email,
                            status="sent" if email_sent else "pending"
                        )
                        db.add(alert)
                        logger.info(f"계약 {contract.contract_no} - {threshold}일 전 알람 생성")

        db.commit()
    except Exception as e:
        logger.error(f"계약 만료 확인 오류: {str(e)}")
        db.rollback()
    finally:
        db.close()

async def get_pending_alerts(db):
    """미발송 알람 조회"""
    return db.query(AlertLog).filter(AlertLog.status == "sent").all()

def start_scheduler():
    """스케줄러 시작"""
    if not scheduler.running:
        # 매일 08:00에 실행
        scheduler.add_job(check_contract_expiry, 'cron', hour=8, minute=0)
        scheduler.start()
        logger.info("계약 만료 스케줄러 시작")
