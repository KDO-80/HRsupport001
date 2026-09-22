from anthropic import Anthropic
import os
from sqlalchemy.orm import Session
from app.models.db import Contract, Vehicle, RentalItem
import json

client = Anthropic()

class AIAnalyzer:
    def __init__(self):
        self.api_key = os.getenv("ANTHROPIC_API_KEY")
        self.conversation_history = []

    def prepare_contract_data(self, db: Session) -> str:
        """계약 데이터 준비"""
        contracts = db.query(Contract).all()
        data = []

        for c in contracts:
            data.append({
                "contract_no": c.contract_no,
                "contract_name": c.contract_name,
                "contractor": c.contractor,
                "start_date": c.start_date.isoformat() if c.start_date else None,
                "end_date": c.end_date.isoformat() if c.end_date else None,
                "manager": c.manager,
                "amount": c.amount
            })

        return json.dumps(data, ensure_ascii=False, indent=2)

    def prepare_vehicle_data(self, db: Session) -> str:
        """차량 데이터 준비"""
        vehicles = db.query(Vehicle).all()
        data = []

        for v in vehicles:
            data.append({
                "vehicle_no": v.vehicle_no,
                "vehicle_type": v.vehicle_type,
                "region": v.region,
                "fuel_type": v.fuel_type,
                "owner": v.owner
            })

        return json.dumps(data, ensure_ascii=False, indent=2)

    def prepare_rental_data(self, db: Session) -> str:
        """렌탈 데이터 준비"""
        rentals = db.query(RentalItem).all()
        data = []

        for r in rentals:
            data.append({
                "region": r.region,
                "office": r.office,
                "rental_type": r.rental_type,
                "quantity": r.quantity
            })

        return json.dumps(data, ensure_ascii=False, indent=2)

    def ask_question(self, question: str, data_type: str, db: Session) -> str:
        """Claude API에 질문"""
        try:
            # 데이터 타입별 데이터 준비
            if data_type == "contracts":
                data = self.prepare_contract_data(db)
                context = "다음은 계약 데이터입니다. 이 데이터를 분석하여 질문에 답변하세요."
            elif data_type == "vehicles":
                data = self.prepare_vehicle_data(db)
                context = "다음은 차량 데이터입니다. 이 데이터를 분석하여 질문에 답변하세요."
            elif data_type == "rentals":
                data = self.prepare_rental_data(db)
                context = "다음은 렌탈 비품 데이터입니다. 이 데이터를 분석하여 질문에 답변하세요."
            else:
                return "지원하지 않는 데이터 타입입니다"

            # 대화 기록에 시스템 메시지 추가
            system_message = f"{context}\n\n데이터:\n{data}"

            # 사용자 질문 추가
            self.conversation_history.append({
                "role": "user",
                "content": question
            })

            # Claude API 호출
            response = client.messages.create(
                model="claude-opus-5",
                max_tokens=1024,
                system=system_message,
                messages=self.conversation_history
            )

            # 응답 처리
            answer = response.content[0].text

            # 대화 기록에 응답 추가
            self.conversation_history.append({
                "role": "assistant",
                "content": answer
            })

            # 대화 기록 크기 제한 (최근 10개만 유지)
            if len(self.conversation_history) > 20:
                self.conversation_history = self.conversation_history[-20:]

            return answer

        except Exception as e:
            return f"분석 중 오류 발생: {str(e)}"

    def reset_conversation(self):
        """대화 기록 초기화"""
        self.conversation_history = []
