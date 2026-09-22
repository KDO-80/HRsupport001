import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.sender_email = os.getenv("SENDER_EMAIL", "")
        self.sender_password = os.getenv("SENDER_PASSWORD", "")

    def send_contract_expiry_alert(self, contract_no: str, contract_name: str,
                                  days_until: int, manager: str,
                                  manager_email: str, team_lead_email: str):
        """계약 만료 알람 이메일 발송"""
        try:
            recipients = []
            if manager_email:
                recipients.append(manager_email)
            if team_lead_email and team_lead_email != manager_email:
                recipients.append(team_lead_email)

            if not recipients:
                logger.warning(f"계약 {contract_no}: 받는 사람 이메일 없음")
                return False

            # 심각도 설정
            if days_until <= 7:
                severity = "🔴 [긴급]"
            elif days_until <= 30:
                severity = "🟡 [주의]"
            else:
                severity = "🟢 [정보]"

            subject = f"{severity} 계약 만료 알람 - {contract_name} ({contract_no})"

            body = f"""
안녕하세요,

다음 계약이 곧 만료될 예정입니다.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 계약 정보
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• 계약번호: {contract_no}
• 계약명: {contract_name}
• 담당자: {manager}
• 만료까지: {days_until}일
• 현재 날짜: {datetime.now().strftime('%Y-%m-%d')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
조치 사항:
- 계약 갱신/종료 결정 필요
- 해당 담당자에게 문의
- 시스템에서 계약 현황 확인

이는 자동 발송된 이메일입니다.
            """

            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = self.sender_email
            msg['To'] = ', '.join(recipients)

            # HTML 버전
            html = f"""
            <html>
              <body style="font-family: Arial, sans-serif; color: #333;">
                <h2>{severity} 계약 만료 알람</h2>
                <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                  <tr style="background-color: #f0f0f0;">
                    <td style="padding: 10px; border: 1px solid #ddd;"><b>계약번호</b></td>
                    <td style="padding: 10px; border: 1px solid #ddd;">{contract_no}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px; border: 1px solid #ddd;"><b>계약명</b></td>
                    <td style="padding: 10px; border: 1px solid #ddd;">{contract_name}</td>
                  </tr>
                  <tr style="background-color: #f0f0f0;">
                    <td style="padding: 10px; border: 1px solid #ddd;"><b>담당자</b></td>
                    <td style="padding: 10px; border: 1px solid #ddd;">{manager}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px; border: 1px solid #ddd;"><b>만료까지</b></td>
                    <td style="padding: 10px; border: 1px solid #ddd;"><strong>{days_until}일</strong></td>
                  </tr>
                </table>
                <p style="color: #666;">이는 자동 발송된 이메일입니다.</p>
              </body>
            </html>
            """

            part1 = MIMEText(body, 'plain')
            part2 = MIMEText(html, 'html')
            msg.attach(part1)
            msg.attach(part2)

            # 이메일 발송 (Gmail 사용)
            try:
                server = smtplib.SMTP(self.smtp_server, self.smtp_port)
                server.starttls()
                server.login(self.sender_email, self.sender_password)
                server.send_message(msg)
                server.quit()

                logger.info(f"계약 {contract_no} 알람 이메일 발송 성공: {recipients}")
                return True
            except Exception as e:
                logger.error(f"SMTP 연결 오류: {str(e)}")
                # SMTP 미설정 시에도 로그만 남기고 계속 진행
                logger.info(f"이메일 발송 실패하지만 계속 진행 (SMTP 미설정 상태): {contract_no}")
                return False

        except Exception as e:
            logger.error(f"이메일 준비 오류 ({contract_no}): {str(e)}")
            return False
