import { NextRequest, NextResponse } from "next/server";
import {
  DIAGNOSIS_TYPES,
  QUESTIONS,
  getGradeLabel,
  getScoreBandLabel,
  isGrade,
  isScoreBand,
  type CodeScoreKey,
  type DiagnosisResponse,
  type DiagnosisType
} from "@/lib/diagnosis";
import { listDiagnosisResponses, type ResponseFilters } from "@/lib/storage";

export const runtime = "nodejs";

const CODE_SCORE_COLUMN_MAP: Array<[string, CodeScoreKey]> = [
  ["SScore", "S"],
  ["PScore", "P"],
  ["RScore", "R"],
  ["CScore", "C"],
  ["BScore", "B"],
  ["TScore", "T"],
  ["NScore", "N"],
  ["FScore", "F"]
];

const TYPE_SCORE_COLUMN_MAP: Array<[string, DiagnosisType]> = [
  ["basicLeakScore", "기초누수형"],
  ["structureWeaknessScore", "구조약점형"],
  ["problemConsumerScore", "문제소비형"],
  ["memorizationBiasScore", "암기편중형"],
  ["routineMissingScore", "루틴부재형"],
  ["avoidanceDefenseScore", "회피방어형"]
];

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD ?? "admin1234";
}

function isAuthorized(request: NextRequest) {
  return request.headers.get("x-admin-password") === getAdminPassword();
}

function isDiagnosisType(value: unknown): value is DiagnosisType {
  return DIAGNOSIS_TYPES.some((type) => type === value);
}

function getFilters(request: NextRequest): ResponseFilters {
  const params = request.nextUrl.searchParams;
  const grade = params.get("grade");
  const scoreBand = params.get("scoreBand");
  const primaryType = params.get("primaryType");

  return {
    startDate: params.get("startDate") || undefined,
    endDate: params.get("endDate") || undefined,
    grade: isGrade(grade) ? grade : undefined,
    scoreBand: isScoreBand(scoreBand) ? scoreBand : undefined,
    primaryType: isDiagnosisType(primaryType) ? primaryType : undefined
  };
}

function csvEscape(value: unknown) {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

function toCsv(responses: DiagnosisResponse[]) {
  const columns = [
    "diagnosisId",
    "createdAt",
    "grade",
    "recentScoreBand",
    ...QUESTIONS.map((question) => question.id),
    "studyCode",
    ...CODE_SCORE_COLUMN_MAP.map(([column]) => column),
    "primaryType",
    ...TYPE_SCORE_COLUMN_MAP.map(([column]) => column),
    "source",
    "deviceType"
  ];

  const rows = responses.map((response) => [
    response.diagnosisId,
    response.createdAt,
    response.grade,
    response.recentScoreBand,
    ...QUESTIONS.map((question) => response.answers[question.id]),
    response.studyCode,
    ...CODE_SCORE_COLUMN_MAP.map(([, key]) => response.codeScores[key]),
    response.primaryType,
    ...TYPE_SCORE_COLUMN_MAP.map(([, type]) => response.typeScores[type]),
    response.source,
    response.deviceType
  ]);

  return [columns, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ message: "관리자 비밀번호를 확인해주세요." }, { status: 401 });
  }

  try {
    const responses = await listDiagnosisResponses(getFilters(request));

    if (request.nextUrl.searchParams.get("format") === "csv") {
      const csv = toCsv(responses);
      return new Response(`\uFEFF${csv}`, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": "attachment; filename=diagnosisResponses.csv"
        }
      });
    }

    return NextResponse.json({
      responses,
      labels: {
        grades: Object.fromEntries(
          responses.map((response) => [response.grade, getGradeLabel(response.grade)])
        ),
        scoreBands: Object.fromEntries(
          responses.map((response) => [
            response.recentScoreBand,
            getScoreBandLabel(response.recentScoreBand)
          ])
        )
      }
    });
  } catch {
    return NextResponse.json(
      { message: "관리자 데이터를 불러오지 못했습니다." },
      { status: 500 }
    );
  }
}
