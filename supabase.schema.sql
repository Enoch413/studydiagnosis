create table if not exists public."diagnosisResponses" (
  "diagnosisId" uuid primary key,
  "createdAt" timestamptz not null default now(),
  grade text not null check (grade in ('M1', 'M2', 'M3')),
  "recentScoreBand" text not null check (
    "recentScoreBand" in (
      '90_plus',
      '80s',
      '70s',
      '60s',
      '50s',
      '40_below',
      'no_exam_yet',
      'unknown'
    )
  ),
  answers jsonb not null,
  "typeScores" jsonb not null,
  "primaryType" text not null check (
    "primaryType" in (
      '기초누수형',
      '구조약점형',
      '문제소비형',
      '암기편중형',
      '루틴부재형',
      '회피방어형'
    )
  ),
  "codeScores" jsonb not null,
  "studyCode" text not null check ("studyCode" ~ '^[SP][RC][BT][NF]$'),
  source text not null default 'flyer_qr',
  "deviceType" text not null check ("deviceType" in ('mobile', 'desktop', 'tablet'))
);

create index if not exists "diagnosisResponses_createdAt_idx"
  on public."diagnosisResponses" ("createdAt" desc);

create index if not exists "diagnosisResponses_grade_idx"
  on public."diagnosisResponses" (grade);

create index if not exists "diagnosisResponses_scoreBand_idx"
  on public."diagnosisResponses" ("recentScoreBand");

create index if not exists "diagnosisResponses_primaryType_idx"
  on public."diagnosisResponses" ("primaryType");

create index if not exists "diagnosisResponses_studyCode_idx"
  on public."diagnosisResponses" ("studyCode");
