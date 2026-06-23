"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DIAGNOSIS_TYPES,
  GRADE_OPTIONS,
  SCORE_BAND_OPTIONS,
  getGradeLabel,
  getScoreBandLabel,
  type DiagnosisResponse,
  type DiagnosisType,
  type Grade,
  type ScoreBand
} from "@/lib/diagnosis";

type Filters = {
  startDate: string;
  endDate: string;
  grade: "" | Grade;
  scoreBand: "" | ScoreBand;
  primaryType: "" | DiagnosisType;
};

const emptyFilters: Filters = {
  startDate: "",
  endDate: "",
  grade: "",
  scoreBand: "",
  primaryType: ""
};

const scoreColumns = [
  ["기초누수형 점수", "기초누수형"],
  ["구조약점형 점수", "구조약점형"],
  ["문제소비형 점수", "문제소비형"],
  ["암기편중형 점수", "암기편중형"],
  ["루틴부재형 점수", "루틴부재형"],
  ["회피방어형 점수", "회피방어형"]
] as const;

const googleSheetUrl = process.env.NEXT_PUBLIC_GOOGLE_SHEET_URL?.trim();

function buildQuery(filters: Filters, format?: "csv") {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      if (key === "scoreBand") {
        params.set("scoreBand", value);
        return;
      }
      params.set(key, value);
    }
  });

  if (format) {
    params.set("format", format);
  }

  return params.toString();
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [responses, setResponses] = useState<DiagnosisResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const query = useMemo(() => buildQuery(filters), [filters]);

  async function fetchResponses(currentPassword = password) {
    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch(`/api/admin/responses?${query}`, {
        headers: {
          "x-admin-password": currentPassword
        }
      });

      if (!response.ok) {
        throw new Error("Unauthorized");
      }

      const data = await response.json();
      setResponses(data.responses ?? []);
      setIsUnlocked(true);
      sessionStorage.setItem("diagnosisAdminPassword", currentPassword);
    } catch {
      setResponses([]);
      setIsUnlocked(false);
      setMessage("관리자 비밀번호를 확인해주세요.");
    } finally {
      setIsLoading(false);
    }
  }

  async function downloadCsv() {
    setMessage("");

    try {
      const response = await fetch(`/api/admin/responses?${buildQuery(filters, "csv")}`, {
        headers: {
          "x-admin-password": password
        }
      });

      if (!response.ok) {
        throw new Error("Download failed");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "diagnosisResponses.csv";
      anchor.click();
      URL.revokeObjectURL(url);
    } catch {
      setMessage("CSV 다운로드에 실패했습니다.");
    }
  }

  useEffect(() => {
    const savedPassword = sessionStorage.getItem("diagnosisAdminPassword");

    if (savedPassword) {
      setPassword(savedPassword);
      void fetchResponses(savedPassword);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isUnlocked) {
      void fetchResponses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <main className="admin-page">
      <section className="admin-shell">
        <div className="admin-header">
          <div>
            <p className="eyebrow">5분 공부유형 테스트</p>
            <h1>테스트 응답 관리자</h1>
          </div>
          <div className="admin-actions">
            {googleSheetUrl && (
              <a
                className="secondary-button"
                href={googleSheetUrl}
                target="_blank"
                rel="noreferrer"
              >
                구글시트 열기
              </a>
            )}
            {isUnlocked && (
              <button className="secondary-button" type="button" onClick={downloadCsv}>
                CSV 다운로드
              </button>
            )}
          </div>
        </div>

        {!isUnlocked && (
          <form
            className="admin-login"
            onSubmit={(event) => {
              event.preventDefault();
              void fetchResponses();
            }}
          >
            <label htmlFor="admin-password">관리자 비밀번호</label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="비밀번호 입력"
            />
            <button className="primary-button" type="submit">
              관리자 화면 열기
            </button>
          </form>
        )}

        {isUnlocked && (
          <>
            <div className="filter-grid">
              <label>
                시작일
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(event) =>
                    setFilters((current) => ({ ...current, startDate: event.target.value }))
                  }
                />
              </label>
              <label>
                종료일
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(event) =>
                    setFilters((current) => ({ ...current, endDate: event.target.value }))
                  }
                />
              </label>
              <label>
                학년
                <select
                  value={filters.grade}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      grade: event.target.value as Filters["grade"]
                    }))
                  }
                >
                  <option value="">전체</option>
                  {GRADE_OPTIONS.map((option) => (
                    <option value={option.value} key={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                최근 점수대
                <select
                  value={filters.scoreBand}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      scoreBand: event.target.value as Filters["scoreBand"]
                    }))
                  }
                >
                  <option value="">전체</option>
                  {SCORE_BAND_OPTIONS.map((option) => (
                    <option value={option.value} key={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                대표 내부유형
                <select
                  value={filters.primaryType}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      primaryType: event.target.value as Filters["primaryType"]
                    }))
                  }
                >
                  <option value="">전체</option>
                  {DIAGNOSIS_TYPES.map((type) => (
                    <option value={type} key={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>
              <button className="secondary-button" type="button" onClick={() => setFilters(emptyFilters)}>
                필터 초기화
              </button>
            </div>

            <div className="table-summary">
              <span>총 {responses.length}건</span>
              {isLoading && <span>불러오는 중</span>}
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>제출일시</th>
                    <th>학년</th>
                    <th>최근 점수대</th>
                    <th>공부코드</th>
                    <th>대표 내부유형</th>
                    {scoreColumns.map(([label]) => (
                      <th key={label}>{label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {responses.length === 0 && (
                    <tr>
                      <td colSpan={11}>조회된 응답이 없습니다.</td>
                    </tr>
                  )}
                  {responses.map((response) => (
                    <tr key={response.diagnosisId}>
                      <td>{formatDateTime(response.createdAt)}</td>
                      <td>{getGradeLabel(response.grade)}</td>
                      <td>{getScoreBandLabel(response.recentScoreBand)}</td>
                      <td>{response.studyCode}</td>
                      <td>{response.primaryType}</td>
                      {scoreColumns.map(([, type]) => (
                        <td key={type}>{response.typeScores[type]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {message && <p className="admin-message">{message}</p>}
      </section>
    </main>
  );
}
