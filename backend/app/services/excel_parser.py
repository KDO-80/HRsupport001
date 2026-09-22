import pandas as pd
from sqlalchemy.orm import Session
from app.models.db import Contract, Vehicle, RentalItem
from datetime import datetime

def find_header_row(df, keywords):
    for idx, row in df.iterrows():
        if any(str(keyword) in str(val) for val in row for keyword in keywords):
            return idx
    return 0

def parse_contract_file(file_path, db: Session):
    try:
        df = pd.read_excel(file_path, header=None)
        header_row = find_header_row(df, ['계약번호', 'contract'])
        df = pd.read_excel(file_path, header=header_row)

        # 컬럼명 정규화
        col_map = {}
        for col in df.columns:
            col_str = str(col).strip()
            if '계약번호' in col_str or 'contract' in col_str.lower():
                col_map[col] = 'contract_no'
            elif '계약명' in col_str:
                col_map[col] = 'contract_name'
            elif '계약처' in col_str:
                col_map[col] = 'contractor'
            elif 'From' in col_str:
                col_map[col] = 'start_date'
            elif 'To' in col_str:
                col_map[col] = 'end_date'
            elif '담당' in col_str and '담당자' not in col_str and '팀장' not in col_str:
                col_map[col] = 'manager'
            elif '담당자이메일' in col_str:
                col_map[col] = 'manager_email'
            elif '팀장이메일' in col_str:
                col_map[col] = 'team_lead_email'
            elif '보내는사람' in col_str or '발송자' in col_str:
                col_map[col] = 'sender_email'
            elif '보증금' in col_str or '금액' in col_str:
                col_map[col] = 'amount'
            elif '비고' in col_str or 'remarks' in col_str.lower():
                col_map[col] = 'remarks'

        df_renamed = df.rename(columns=col_map)

        for _, row in df_renamed.dropna(subset=['contract_no']).iterrows():
            contract_no = str(row['contract_no'])
            existing = db.query(Contract).filter(Contract.contract_no == contract_no).first()

            contract_data = {
                'contract_no': contract_no,
                'contract_name': str(row.get('contract_name', '')),
                'contractor': str(row.get('contractor', '')),
                'start_date': pd.to_datetime(row['start_date']).date() if pd.notna(row.get('start_date')) else None,
                'end_date': pd.to_datetime(row['end_date']).date() if pd.notna(row.get('end_date')) else None,
                'manager': str(row.get('manager', '')),
                'manager_email': str(row.get('manager_email', '')),
                'team_lead_email': str(row.get('team_lead_email', '')),
                'sender_email': str(row.get('sender_email', '')),
                'amount': float(row['amount']) if pd.notna(row.get('amount')) else 0,
                'remarks': str(row.get('remarks', ''))
            }

            if existing:
                for key, value in contract_data.items():
                    setattr(existing, key, value)
            else:
                db.add(Contract(**contract_data))

        db.commit()
        return len(df)
    except Exception as e:
        raise Exception(f"계약 파일 파싱 오류: {str(e)}")

def parse_vehicle_file(file_path, db: Session):
    try:
        df = pd.read_excel(file_path, header=None)
        header_row = find_header_row(df, ['자동차', 'vehicle', '차량'])
        df = pd.read_excel(file_path, header=header_row)

        for _, row in df.iterrows():
            vehicle_no = row.iloc[0] if len(row) > 0 else None
            if pd.isna(vehicle_no):
                continue

            existing = db.query(Vehicle).filter(Vehicle.vehicle_no == str(vehicle_no)).first()
            vehicle_data = {
                'vehicle_no': str(vehicle_no),
                'region': str(row.iloc[1]) if len(row) > 1 else '',
                'vehicle_type': str(row.iloc[2]) if len(row) > 2 else '',
                'fuel_type': str(row.iloc[3]) if len(row) > 3 else '',
                'owner': str(row.iloc[4]) if len(row) > 4 else ''
            }

            if existing:
                for key, value in vehicle_data.items():
                    setattr(existing, key, value)
            else:
                db.add(Vehicle(**vehicle_data))

        db.commit()
        return len(df)
    except Exception as e:
        raise Exception(f"차량 파일 파싱 오류: {str(e)}")

def parse_rental_file(file_path, db: Session):
    try:
        df = pd.read_excel(file_path, header=None)
        header_row = find_header_row(df, ['순번', '권역'])
        df = pd.read_excel(file_path, header=header_row)

        db.query(RentalItem).delete()

        for _, row in df.iterrows():
            region = row.iloc[1] if len(row) > 1 else None
            if pd.isna(region):
                continue

            db.add(RentalItem(
                region=str(region),
                office=str(row.iloc[2]) if len(row) > 2 else '',
                rental_type=str(row.iloc[3]) if len(row) > 3 else '',
                quantity=int(row.iloc[4]) if len(row) > 4 and pd.notna(row.iloc[4]) else 0
            ))

        db.commit()
        return len(df)
    except Exception as e:
        raise Exception(f"렌탈 파일 파싱 오류: {str(e)}")
