# 📧 계약 만료 이메일 알람 설정 가이드

## 🚀 이메일 발송 기능 활성화

### 1️⃣ **Gmail 앱 비밀번호 생성**

Gmail에서 앱 비밀번호를 발급받아야 합니다.

**단계:**
1. https://myaccount.google.com/security 접속
2. **보안 > 앱 비밀번호** 클릭
3. 디바이스: Windows 컴퓨터, 앱: 메일 선택
4. **생성** 클릭 → 16자 비밀번호 복사

### 2️⃣ **.env 파일 설정**

`backend/.env` 파일을 생성하고 다음 내용을 입력:

```env
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SENDER_EMAIL=your-email@gmail.com
SENDER_PASSWORD=xxxx-xxxx-xxxx-xxxx
```

### 3️⃣ **Outlook 사용 시** (선택사항)

```env
SMTP_SERVER=smtp-mail.outlook.com
SMTP_PORT=587
SENDER_EMAIL=your-email@outlook.com
SENDER_PASSWORD=your-password
```

---

## 📊 데이터베이스 마이그레이션

새로운 컬럼이 추가되었습니다. DB를 초기화하거나 다음 SQL을 실행:

```sql
ALTER TABLE contracts ADD COLUMN team_lead_email VARCHAR;
ALTER TABLE contracts ADD COLUMN sender_email VARCHAR;
ALTER TABLE alert_logs ADD COLUMN status VARCHAR DEFAULT 'sent';
```

또는 간단하게 기존 DB 삭제:
```bash
rm backend/dashboard.db
```

---

## 🔔 알람 발송 시간

- ⏰ **매일 08:00** 자동 확인
- 🔴 **D-90, D-60, D-30** 일에 자동 발송
- 📧 **발송 대상**: 담당자 + 팀장 (중복 시 1회만)

---

## ✅ 테스트 방법

```bash
# 백엔드 실행 후
curl -X POST http://localhost:8000/api/alerts/check

# 또는 이메일 로그 확인
# backend/logs/ 디렉토리 확인
```

---

## ⚠️ 주의사항

1. **Gmail 2단계 인증 필수**: 앱 비밀번호는 2단계 인증 설정 후에만 생성 가능
2. **.env 파일은 절대 Git에 커밋하지 마세요** (.gitignore에 추가됨)
3. **테스트**: 먼저 테스트 이메일로 작동 확인 후 실운영 시작

---

## 🛠️ 문제 해결

### "SMTP 연결 실패"
- ✅ 비밀번호 확인 (공백 있는지 확인)
- ✅ 2단계 인증 활성화 확인
- ✅ 방화벽 587 포트 개방 확인

### "이메일이 도착하지 않음"
- ✅ 스팸 폴더 확인
- ✅ 로그에서 "이메일 발송 성공" 메시지 확인
- ✅ 받는 사람 이메일 정확성 확인

---

## 📝 Excel 파일 형식

HR지원팀 계약 List 파일에 다음 컬럼이 있어야 합니다:

| 컬럼명 | 설명 |
|-------|------|
| 계약번호 | 계약 ID |
| 계약명 | 계약 이름 |
| 계약처 | 계약사 |
| 계약기간 From | 시작 날짜 |
| 계약기간 To | 종료 날짜 |
| 담당 | 담당자 이름 |
| 담당자이메일 | 담당자 이메일 |
| 팀장이메일 | 팀장 이메일 (선택사항) |
| 보내는사람 이메일 | 발송자 이메일 (선택사항) |

---

**이제 준비 완료!** 🎉
