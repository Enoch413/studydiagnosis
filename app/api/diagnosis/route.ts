import { NextRequest, NextResponse } from "next/server";
import {
  calculateDiagnosis,
  isCompleteAnswerMap,
  isDeviceType,
  isGrade,
  isScoreBand
} from "@/lib/diagnosis";
import { saveDiagnosisResponse } from "@/lib/storage";

export const runtime = "nodejs";

function inferDeviceType(userAgent: string) {
  const normalized = userAgent.toLowerCase();

  if (normalized.includes("ipad") || normalized.includes("tablet")) {
    return "tablet";
  }

  if (normalized.includes("mobile") || normalized.includes("android") || normalized.includes("iphone")) {
    return "mobile";
  }

  return "desktop";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!isGrade(body.grade)) {
      return NextResponse.json({ message: "학년 값이 올바르지 않습니다." }, { status: 400 });
    }

    if (!isScoreBand(body.recentScoreBand)) {
      return NextResponse.json({ message: "점수대 값이 올바르지 않습니다." }, { status: 400 });
    }

    if (!isCompleteAnswerMap(body.answers)) {
      return NextResponse.json({ message: "설문 응답이 올바르지 않습니다." }, { status: 400 });
    }

    const { typeScores, primaryType, codeScores, studyCode } = calculateDiagnosis(body.answers);
    const clientDeviceType = body.deviceType;
    const deviceType = isDeviceType(clientDeviceType)
      ? clientDeviceType
      : inferDeviceType(request.headers.get("user-agent") ?? "");

    const response = {
      diagnosisId: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      grade: body.grade,
      recentScoreBand: body.recentScoreBand,
      answers: body.answers,
      typeScores,
      primaryType,
      codeScores,
      studyCode,
      source: "flyer_qr" as const,
      deviceType
    };

    await saveDiagnosisResponse(response);

    return NextResponse.json({
      diagnosisId: response.diagnosisId,
      createdAt: response.createdAt,
      typeScores,
      primaryType,
      codeScores,
      studyCode
    });
  } catch {
    return NextResponse.json(
      { message: "테스트 결과 저장 중 문제가 발생했습니다." },
      { status: 500 }
    );
  }
}
