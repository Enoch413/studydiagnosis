"use client";

import { useMemo, useState } from "react";
import {
  ANSWER_OPTIONS,
  GRADE_ADVICE,
  GRADE_OPTIONS,
  QUESTIONS,
  SCORE_BAND_OPTIONS,
  TYPE_RESULT_CONTENT,
  calculateDiagnosis,
  getGradeLabel,
  getScoreBandLabel,
  getStudyCodeSummary,
  type AnswerMap,
  type CodeScores,
  type DeviceType,
  type DiagnosisType,
  type Grade,
  type QuestionId,
  type ScoreBand,
  type StudyCode,
  type TypeScores
} from "@/lib/diagnosis";

type Step = "start" | "grade" | "score" | "questions" | "result";
type SaveState = "idle" | "saving" | "saved" | "failed";

type ResultState = {
  typeScores: TypeScores;
  primaryType: DiagnosisType;
  codeScores: CodeScores;
  studyCode: StudyCode;
};

const googleScriptUrl = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL?.trim();

function detectDeviceType(): DeviceType {
  if (typeof window === "undefined") {
    return "desktop";
  }

  const width = window.innerWidth;

  if (width < 768) {
    return "mobile";
  }

  if (width < 1100) {
    return "tablet";
  }

  return "desktop";
}

function toCompleteAnswers(answers: Partial<Record<QuestionId, number>>): AnswerMap {
  return QUESTIONS.reduce((result, question) => {
    result[question.id] = answers[question.id] ?? 3;
    return result;
  }, {} as AnswerMap);
}

function createDiagnosisId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `diagnosis-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function HomePage() {
  const [step, setStep] = useState<Step>("start");
  const [grade, setGrade] = useState<Grade | null>(null);
  const [scoreBand, setScoreBand] = useState<ScoreBand | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Partial<Record<QuestionId, number>>>({});
  const [result, setResult] = useState<ResultState | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const currentQuestion = QUESTIONS[questionIndex];
  const progressPercent = ((questionIndex + 1) / QUESTIONS.length) * 100;

  const selectedGradeLabel = useMemo(() => (grade ? getGradeLabel(grade) : ""), [grade]);
  const selectedScoreBandLabel = useMemo(
    () => (scoreBand ? getScoreBandLabel(scoreBand) : ""),
    [scoreBand]
  );

  async function submitDiagnosis(finalAnswers: AnswerMap, localResult: ResultState) {
    if (!grade || !scoreBand) {
      return;
    }

    setSaveState("saving");

    try {
      const diagnosisPayload = {
        diagnosisId: createDiagnosisId(),
        createdAt: new Date().toISOString(),
        grade,
        recentScoreBand: scoreBand,
        answers: finalAnswers,
        typeScores: localResult.typeScores,
        primaryType: localResult.primaryType,
        codeScores: localResult.codeScores,
        studyCode: localResult.studyCode,
        source: "flyer_qr",
        deviceType: detectDeviceType()
      };

      if (googleScriptUrl) {
        await fetch(googleScriptUrl, {
          method: "POST",
          mode: "no-cors",
          headers: {
            "Content-Type": "text/plain;charset=utf-8"
          },
          body: JSON.stringify(diagnosisPayload),
          keepalive: true
        });
        setSaveState("saved");
        return;
      }

      const response = await fetch("/api/diagnosis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(diagnosisPayload)
      });

      if (!response.ok) {
        throw new Error("Save failed");
      }

      const saved = await response.json();
      setResult({
        typeScores: saved.typeScores ?? localResult.typeScores,
        primaryType: saved.primaryType ?? localResult.primaryType,
        codeScores: saved.codeScores ?? localResult.codeScores,
        studyCode: saved.studyCode ?? localResult.studyCode
      });
      setSaveState("saved");
    } catch {
      setSaveState("failed");
    }
  }

  function handleGradeSelect(nextGrade: Grade) {
    setGrade(nextGrade);
    setStep("score");
  }

  function handleScoreBandSelect(nextScoreBand: ScoreBand) {
    setScoreBand(nextScoreBand);
    setStep("questions");
  }

  function handleAnswerSelect(value: number) {
    if (selectedAnswer !== null) {
      return;
    }

    setSelectedAnswer(value);

    const nextAnswers = {
      ...answers,
      [currentQuestion.id]: value
    };

    setAnswers(nextAnswers);

    window.setTimeout(() => {
      setSelectedAnswer(null);

      if (questionIndex < QUESTIONS.length - 1) {
        setQuestionIndex((index) => index + 1);
        return;
      }

      const completeAnswers = toCompleteAnswers(nextAnswers);
      const localResult = calculateDiagnosis(completeAnswers);
      setResult(localResult);
      setStep("result");
      void submitDiagnosis(completeAnswers, localResult);
    }, 180);
  }

  return (
    <main className="app-page">
      <div className="mobile-shell">
        {step === "start" && (
          <section className="screen-card start-screen">
            <div className="start-brand" aria-label="입시코드학원">
              <img src="/assets/code-academy-mark.png" alt="입시코드학원 CODE" />
            </div>
            <p className="eyebrow">5분 공부유형 테스트</p>
            <h1 className="hero-title">
              <span>공부했는데</span>
              <strong>왜 안 오를까?</strong>
            </h1>
            <p className="lead">
              간단한 12문항으로
              <br />
              내 공부가 어디서 막히는지 확인해보세요.
            </p>
            <div className="info-band start-note">
              <span>전단지 QR에서 바로 이어지는 5분 테스트입니다.</span>
            </div>
            <button className="primary-button" type="button" onClick={() => setStep("grade")}>
              테스트 시작하기
            </button>
          </section>
        )}

        {step === "grade" && (
          <section className="screen-card">
            <button className="text-button" type="button" onClick={() => setStep("start")}>
              처음으로
            </button>
            <h2>현재 학년을 선택해주세요</h2>
            <div className="choice-list">
              {GRADE_OPTIONS.map((option) => (
                <button
                  className={`choice-card ${grade === option.value ? "selected" : ""}`}
                  type="button"
                  key={option.value}
                  onClick={() => handleGradeSelect(option.value)}
                >
                  <strong>{option.label}</strong>
                  <span>{option.description}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {step === "score" && (
          <section className="screen-card">
            <button className="text-button" type="button" onClick={() => setStep("grade")}>
              이전
            </button>
            <h2>최근 시험 점수대는 어느 정도인가요?</h2>
            <p className="subcopy">
              영어 또는 수학 중 가장 신경 쓰이는 과목 기준으로 선택해주세요.
              <br />
              정확하지 않아도 괜찮아요.
            </p>
            <div className="choice-list compact">
              {SCORE_BAND_OPTIONS.map((option) => (
                <button
                  className={`choice-card simple ${scoreBand === option.value ? "selected" : ""}`}
                  type="button"
                  key={option.value}
                  onClick={() => handleScoreBandSelect(option.value)}
                >
                  <strong>{option.label}</strong>
                </button>
              ))}
            </div>
          </section>
        )}

        {step === "questions" && (
          <section className="screen-card question-card">
            <div className="question-topline">
              <button
                className="text-button"
                type="button"
                onClick={() => {
                  if (questionIndex === 0) {
                    setStep("score");
                    return;
                  }
                  setQuestionIndex((index) => index - 1);
                  setSelectedAnswer(null);
                }}
              >
                이전
              </button>
              <span>
                {questionIndex + 1} / {QUESTIONS.length}
              </span>
            </div>
            <div className="progress-track" aria-hidden="true">
              <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
            </div>
            <p className="question-meta">
              {selectedGradeLabel} · {selectedScoreBandLabel}
            </p>
            <h2>{currentQuestion.text}</h2>
            <div className="answer-list">
              {ANSWER_OPTIONS.map((option) => (
                <button
                  className={`answer-button ${selectedAnswer === option.value ? "selected" : ""}`}
                  type="button"
                  key={option.value}
                  disabled={selectedAnswer !== null}
                  onClick={() => handleAnswerSelect(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </section>
        )}

        {step === "result" && result && grade && scoreBand && (
          <section className="screen-card result-card">
            <div className="result-panel result-summary-card">
              <p className="eyebrow">나의 공부유형 결과</p>
              <h2>공부가 점수로 쌓이지 않는 이유를 확인했어요.</h2>
              <p>
                {getGradeLabel(grade)} · {getScoreBandLabel(scoreBand)} 기준으로 현재 공부 흐름을
                간단히 정리했습니다.
              </p>
            </div>

            <div className="result-panel code-card">
              <p className="section-kicker">당신의 공부 코드는</p>
              <div className="study-code" aria-label={`공부 코드 ${result.studyCode}`}>
                {result.studyCode}
              </div>
            </div>

            <div className="result-panel interpretation-card">
              <h3>코드 해석</h3>
              <div className="code-summary">
                {getStudyCodeSummary(result.studyCode)
                  .split("\n")
                  .map((line) => (
                    <span className="code-line" key={line}>
                      <span aria-hidden="true" />
                      {line}
                    </span>
                  ))}
              </div>
            </div>

            <div className="result-panel diagnosis-note-card">
              <h3>진단 안내</h3>
              <p>
                이 결과는 과목별 실력 점수가 아니라, 공부가 점수로 쌓이지 않는 원인을 간단히
                확인하는 진단입니다.
              </p>
              <p>정확한 막힌 지점은 실제 문제 풀이와 상담을 통해 확인할 수 있습니다.</p>
            </div>

            <div className="result-panel result-section">
              <h3>공부 방식 해석</h3>
              {TYPE_RESULT_CONTENT[result.primaryType].description.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <div className="result-panel result-section">
              <h3>지금 필요한 공부 방향</h3>
              <p>공부량을 늘리기 전에, 먼저 막히는 지점과 공부 순서를 확인해야 합니다.</p>
              <p>틀린 문제를 다시 풀고, 왜 틀렸는지 설명할 수 있는 과정이 필요합니다.</p>
            </div>

            <div className="result-panel result-section">
              <h3>학년별 조언</h3>
              <p>{GRADE_ADVICE[grade]}</p>
            </div>

            <div className="result-panel cta-card">
              <div className="cta-logo-wrap">
                <img src="/assets/code-academy-mark.png" alt="입시코드학원 CODE" />
              </div>
              <h3>이제 필요한 건 공부 방향입니다</h3>
              <p>테스트는 현재 상태를 확인하는 시작입니다.</p>
              <p>
                입시코드학원에서는 학생의 결과를 바탕으로 무엇을 먼저 고쳐야 하는지, 어떤
                공부 순서로 가야 하는지 구체적으로 안내해드립니다.
              </p>
              <p className="cta-emphasis">진단 결과만 보지 말고, 방향까지 확인해보세요.</p>
              <a className="primary-button call-button" href="tel:0314872300">
                학습 방향 상담받기
              </a>
              <p className="phone-copy">031-487-2300 / 010-5020-0003</p>
              <p className="helper-copy">
                상담 시 진단 결과를 말씀해주시면 더 빠르게 안내받을 수 있습니다.
              </p>
            </div>

            <details className="privacy-accordion">
              <summary>개인정보 미수집 안내 보기</summary>
              <div>
                <p>
                  입시코드학원의 5분 공부유형 테스트는 이름, 전화번호, 학교명 등 개인을 직접
                  식별할 수 있는 정보를 수집하지 않습니다.
                </p>
                <p>
                  진단 과정에서 선택하는 학년, 최근 점수대, 설문 응답, 진단 결과는 개인 식별이
                  불가능한 통계 및 서비스 개선 목적으로만 활용됩니다.
                </p>
                <p>
                  정확한 학습 상담을 원하실 경우 전단지 또는 결과 화면에 안내된 학원 연락처로
                  직접 문의해주세요.
                </p>
              </div>
            </details>

            <p className={`save-status ${saveState}`}>
              {saveState === "saving" && "테스트 결과를 저장하고 있습니다."}
              {saveState === "saved" && "테스트 결과 저장 요청이 개인정보 없이 전송되었습니다."}
              {saveState === "failed" && "결과 저장이 지연되고 있습니다. 상담 문의는 바로 가능합니다."}
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
