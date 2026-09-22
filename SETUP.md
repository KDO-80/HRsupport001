# 총무팀 통합 대시보드 - 설치 및 실행 가이드

## 🚀 빠른 시작

### 1️⃣ 백엔드 (FastAPI) 시작

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

✅ http://localhost:8000/docs (Swagger 문서 확인)

### 2️⃣ 프론트엔드 (Next.js) 시작

```bash
npm install
npm run dev
```

✅ http://localhost:3000 (대시보드 접속)

---

## 📁 프로젝트 구조

```
hrsupport001/
├── backend/
│   ├── app/
│   │   ├── models/db.py          # SQLite 데이터베이스 모델
│   │   ├── services/excel_parser.py  # 엑셀 파싱 로직
│   │   └── main.py               # FastAPI 앱
│   └── requirements.txt
├── app/
│   └── page.tsx                  # 프론트엔드 대시보드
└── .env.local
```

---

## 🔌 API 엔드포인트

| 엔드포인트 | 메서드 | 설명 |
|-----------|--------|------|
| `/api/contracts` | GET | 계약 목록 조회 |
| `/api/vehicles` | GET | 차량 목록 조회 |
| `/api/rentals` | GET | 렌탈 비품 목록 조회 |
| `/api/upload/contracts` | POST | 계약 파일 업로드 |
| `/api/upload/vehicles` | POST | 차량 파일 업로드 |
| `/api/upload/rentals` | POST | 렌탈 파일 업로드 |
| `/api/stats` | GET | 통계 조회 |

---

## 📝 다음 개발 단계

- [ ] 파일 업로드 UI 완성
- [ ] 계약 만료 알림 기능
- [ ] 차량 이용 내역 차트
- [ ] AI Q&A 기능
- [ ] PDF 다운로드
- [ ] 메일 알림 스케줄러
