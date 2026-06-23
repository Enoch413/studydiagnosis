# 5분 공부유형 테스트 MVP

중1-중3 전단지 QR 유입용 영어·수학 공통 공부유형 테스트 웹앱입니다.

## 추천 운영 방식

서버와 DB를 따로 만들지 않고 Google Apps Script를 통해 Google Sheets에 자동 저장합니다.

흐름:

```text
학생 QR 접속 → 12문항 완료 → Google Apps Script URL로 전송 → Google Sheets에 한 줄 저장
```

## 기능

- 개인정보 입력 없이 학년, 최근 점수대, 12문항 응답만 수집
- 영어·수학 공통 문항으로 공부 방식, 막힌 지점, 오답 처리 방식 확인
- 내부 6개 유형 점수 계산
- 4글자 공부코드 계산
- 결과 화면에서 공부코드, 공부 방향, 상담 CTA 표시
- `tel:0314872300` 전화 문의 버튼
- Google Sheets 자동 저장
- Google Sheets에서 필터, 다운로드, 통계 확인 가능

## 로컬 실행

```bash
npm install
npm run dev
```

학생용 테스트 화면은 `http://localhost:3000`에서 확인합니다.

## Google Sheets 저장 설정

1. Google Drive에서 새 스프레드시트를 만듭니다.
2. 시트 이름은 그대로 둬도 됩니다. Apps Script가 `diagnosisResponses` 시트를 자동 생성합니다.
3. 상단 메뉴에서 `확장 프로그램` → `Apps Script`를 엽니다.
4. `google-apps-script/Code.gs` 내용을 Apps Script 편집기에 그대로 붙여넣습니다.
5. 저장합니다.
6. `배포` → `새 배포`를 누릅니다.
7. 유형 선택에서 `웹 앱`을 선택합니다.
8. 실행 권한은 `나`로 둡니다.
9. 액세스 권한은 `모든 사용자`로 설정합니다.
10. 배포 후 나오는 Web App URL을 복사합니다.

복사한 URL을 배포 환경변수에 넣습니다.

```bash
NEXT_PUBLIC_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/여기에_배포_ID/exec
NEXT_PUBLIC_GOOGLE_SHEET_URL=https://docs.google.com/spreadsheets/d/시트_ID/edit
```

`NEXT_PUBLIC_GOOGLE_SCRIPT_URL`이 설정되어 있으면 테스트 결과는 Google Sheets로 전송됩니다.
설정하지 않으면 로컬 개발용 API fallback을 사용합니다.

## QR용 배포

QR에는 `localhost:3000`을 넣으면 안 됩니다. 공개 배포 URL을 넣어야 합니다.

가장 쉬운 방식:

1. GitHub에 이 프로젝트를 올립니다.
2. Vercel에서 GitHub 저장소를 연결합니다.
3. Vercel 환경변수에 `NEXT_PUBLIC_GOOGLE_SCRIPT_URL`을 넣습니다.
4. 선택으로 `NEXT_PUBLIC_GOOGLE_SHEET_URL`도 넣습니다.
5. 배포 URL을 QR로 만듭니다.

예:

```text
https://dgnosis.vercel.app
```

## Google Sheets 저장 컬럼

- `diagnosisId`
- `createdAt`
- `grade`
- `recentScoreBand`
- `Q01` ~ `Q12`
- `studyCode`
- `SScore`
- `PScore`
- `RScore`
- `CScore`
- `BScore`
- `TScore`
- `NScore`
- `FScore`
- `primaryType`
- `basicLeakScore`
- `structureWeaknessScore`
- `problemConsumerScore`
- `memorizationBiasScore`
- `routineMissingScore`
- `avoidanceDefenseScore`
- `source`
- `deviceType`

이 앱은 이름, 전화번호, 학교명 등 개인을 직접 식별할 수 있는 정보를 입력받지 않습니다.
