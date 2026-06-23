export const GRADE_OPTIONS = [
  {
    value: "M1",
    label: "중1",
    description: "공부 습관과 첫 내신 준비 점검"
  },
  {
    value: "M2",
    label: "중2",
    description: "개념 적용력과 문제풀이 습관 점검"
  },
  {
    value: "M3",
    label: "중3",
    description: "고등 공부로 넘어가기 전 막힌 지점 점검"
  }
] as const;

export const SCORE_BAND_OPTIONS = [
  { value: "90_plus", label: "90점 이상" },
  { value: "80s", label: "80점대" },
  { value: "70s", label: "70점대" },
  { value: "60s", label: "60점대" },
  { value: "50s", label: "50점대" },
  { value: "40_below", label: "40점 이하" },
  { value: "no_exam_yet", label: "아직 시험을 안 봤어요" },
  { value: "unknown", label: "잘 모르겠어요" }
] as const;

export const DIAGNOSIS_TYPES = [
  "기초누수형",
  "구조약점형",
  "문제소비형",
  "암기편중형",
  "루틴부재형",
  "회피방어형"
] as const;

export const TYPE_PRIORITY = [
  "구조약점형",
  "기초누수형",
  "문제소비형",
  "암기편중형",
  "루틴부재형",
  "회피방어형"
] as const;

export const CODE_SCORE_KEYS = ["S", "P", "R", "C", "B", "T", "N", "F"] as const;

export const CODE_THRESHOLDS = {
  P: 20,
  C: 20,
  F: 23
} as const;

export const QUESTIONS = [
  {
    id: "Q01",
    text: "공부했는데 점수가 그대로라고 느낀 적이 있다.",
    reverse: false,
    typeWeights: {
      문제소비형: 1,
      루틴부재형: 1
    },
    codeAxisWeights: {
      C: 1,
      F: 1
    }
  },
  {
    id: "Q02",
    text: "외운 내용이 문제에서 바로 떠오르지 않는다.",
    reverse: false,
    typeWeights: {
      기초누수형: 2
    },
    codeAxisWeights: {
      B: 2
    }
  },
  {
    id: "Q03",
    text: "문제가 길어지면 어디서부터 풀어야 할지 막힌다.",
    reverse: false,
    typeWeights: {
      구조약점형: 2
    },
    codeAxisWeights: {
      T: 2
    }
  },
  {
    id: "Q04",
    text: "개념은 아는데 문제로 나오면 자주 틀린다.",
    reverse: false,
    typeWeights: {
      구조약점형: 1,
      암기편중형: 1
    },
    codeAxisWeights: {
      T: 2
    }
  },
  {
    id: "Q05",
    text: "수업 때 배운 것과 조금 다르게 나오면 헷갈린다.",
    reverse: false,
    typeWeights: {
      암기편중형: 2
    },
    codeAxisWeights: {
      T: 2
    }
  },
  {
    id: "Q06",
    text: "문제를 풀고 채점한 뒤, 틀린 문제를 다시 풀어보는 편이다.",
    reverse: true,
    typeWeights: {
      문제소비형: 2,
      루틴부재형: 1
    },
    codeAxisWeights: {
      F: 2,
      C: 1
    }
  },
  {
    id: "Q07",
    text: "답지를 보면 이해되지만 혼자 다시 풀면 또 틀린다.",
    reverse: false,
    typeWeights: {
      문제소비형: 2
    },
    codeAxisWeights: {
      F: 2
    }
  },
  {
    id: "Q08",
    text: "시험 2주 전부터 무엇을 해야 할지 스스로 정하기 어렵다.",
    reverse: false,
    typeWeights: {
      루틴부재형: 2
    },
    codeAxisWeights: {
      P: 2,
      C: 2
    }
  },
  {
    id: "Q09",
    text: "어려운 문제가 나오면 일단 넘기거나 포기하고 싶어진다.",
    reverse: false,
    typeWeights: {
      회피방어형: 2
    },
    codeAxisWeights: {
      P: 1,
      F: 1
    }
  },
  {
    id: "Q10",
    text: "숙제를 못 했을 때, 사실은 어려워서 시작을 못 한 경우가 있다.",
    reverse: false,
    typeWeights: {
      회피방어형: 1,
      루틴부재형: 1
    },
    codeAxisWeights: {
      P: 2,
      C: 1
    }
  },
  {
    id: "Q11",
    text: "시험에서 아는 내용도 실수로 틀리는 편이다.",
    reverse: false,
    typeWeights: {
      암기편중형: 1,
      문제소비형: 1
    },
    codeAxisWeights: {
      F: 1,
      T: 1
    }
  },
  {
    id: "Q12",
    text: "나는 지금 내 점수가 안 오르는 가장 큰 이유를 잘 모르겠다.",
    reverse: false,
    typeWeights: {
      루틴부재형: 1,
      구조약점형: 1,
      회피방어형: 1
    },
    codeAxisWeights: {
      P: 1,
      C: 1
    }
  }
] as const;

export const ANSWER_OPTIONS = [
  { label: "매우 그렇다", value: 5 },
  { label: "그렇다", value: 4 },
  { label: "보통", value: 3 },
  { label: "아니다", value: 2 },
  { label: "전혀 아니다", value: 1 }
] as const;

export type Grade = (typeof GRADE_OPTIONS)[number]["value"];
export type ScoreBand = (typeof SCORE_BAND_OPTIONS)[number]["value"];
export type DiagnosisType = (typeof DIAGNOSIS_TYPES)[number];
export type CodeScoreKey = (typeof CODE_SCORE_KEYS)[number];
export type QuestionId = (typeof QUESTIONS)[number]["id"];
export type DeviceType = "mobile" | "desktop" | "tablet";
export type StudyCode = `${"S" | "P"}${"R" | "C"}${"B" | "T"}${"N" | "F"}`;
export type AnswerMap = Record<QuestionId, number>;
export type TypeScores = Record<DiagnosisType, number>;
export type CodeScores = Record<CodeScoreKey, number>;

export type DiagnosisResponse = {
  diagnosisId: string;
  createdAt: string;
  grade: Grade;
  recentScoreBand: ScoreBand;
  answers: AnswerMap;
  typeScores: TypeScores;
  primaryType: DiagnosisType;
  codeScores: CodeScores;
  studyCode: StudyCode;
  source: "flyer_qr";
  deviceType: DeviceType;
};

export const TYPE_RESULT_CONTENT: Record<
  DiagnosisType,
  {
    description: string[];
    direction: string;
  }
> = {
  기초누수형: {
    description: [
      "현재 학생은 기초가 부분적으로 비어 있을 가능성이 있습니다.",
      "외운 내용이 문제에서 바로 떠오르지 않거나, 기본 개념을 문제에 연결하는 과정에서 막힐 수 있습니다."
    ],
    direction:
      "지금은 문제를 많이 푸는 것보다 기초 개념과 기본 문제풀이 과정을 먼저 점검해야 합니다."
  },
  구조약점형: {
    description: [
      "현재 학생은 문제의 구조를 잡는 과정에서 막히고 있을 가능성이 있습니다.",
      "문제가 길어지거나 조건이 많아지면 무엇을 먼저 봐야 할지 놓치고, 배운 내용을 알고 있어도 실제 문제에서 흔들릴 수 있습니다."
    ],
    direction: "문제를 읽는 순서와 조건을 정리하는 방식을 먼저 잡아야 합니다."
  },
  문제소비형: {
    description: [
      "현재 학생은 문제를 풀고 있지만 오답이 실력으로 쌓이지 않는 유형일 수 있습니다.",
      "문제를 많이 푸는 것과 공부가 되는 것은 다릅니다."
    ],
    direction:
      "틀린 이유를 다시 설명하고, 같은 문제를 혼자 다시 풀 수 있어야 점수로 연결됩니다."
  },
  암기편중형: {
    description: [
      "현재 학생은 외운 내용에 의존하고 있을 가능성이 있습니다.",
      "시험 문제는 배운 내용이 그대로 나오기보다 조금 바뀐 형태로 출제되는 경우가 많습니다."
    ],
    direction: "외운 내용을 문제에 적용하는 훈련이 필요합니다."
  },
  루틴부재형: {
    description: [
      "현재 학생은 실력보다 먼저 공부 루틴이 잡히지 않았을 가능성이 있습니다.",
      "무엇을 언제, 어떻게 복습해야 하는지 정해져 있지 않으면 수업을 들어도 시험 전까지 실력이 누적되지 않습니다."
    ],
    direction: "공부량보다 먼저 공부 순서와 루틴을 잡아야 합니다."
  },
  회피방어형: {
    description: [
      "현재 학생은 어려운 공부를 만났을 때 시작하거나 버티는 힘이 약해져 있을 가능성이 있습니다."
    ],
    direction:
      "이 경우 무조건 많은 숙제를 주기보다 해낼 수 있는 단위로 쪼개고, 작은 성공 경험을 만드는 것이 먼저입니다."
  }
};

export const GRADE_ADVICE: Record<Grade, string> = {
  M1: "중1은 공부 습관이 처음 만들어지는 시기입니다. 첫 내신 전 기본 개념, 복습 루틴, 오답 습관을 잡는 것이 중요합니다.",
  M2: "중2부터는 개념을 아는 것과 실제 문제에 적용하는 것의 차이가 커집니다. 이 시기에 막힌 지점을 잡지 않으면 점수 흔들림이 커질 수 있습니다.",
  M3: "중3은 고등 공부로 넘어가기 전 마지막 점검 시기입니다. 지금 약점을 방치하면 고1 내신과 모의고사에서 체감 난도가 크게 올라갈 수 있습니다."
};

export const SCORE_BAND_COMMENT: Record<ScoreBand, string> = {
  "90_plus":
    "상위권이지만 점수 정체를 느낀다면 고난도 문제, 서술형, 실수 관리에서 막히고 있을 수 있습니다.",
  "80s":
    "기본기는 있지만 반복되는 약점 유형 때문에 점수가 안정되지 않을 수 있습니다. 오답이 실력으로 쌓이고 있는지 확인이 필요합니다.",
  "70s":
    "공부는 하고 있지만 개념 적용, 문제 접근 순서, 오답 처리 중 일부가 흔들릴 가능성이 있습니다.",
  "60s": "문제풀이보다 먼저 기본 개념과 기본 문제풀이 과정의 누수 확인이 필요합니다.",
  "50s": "공부 루틴과 기본 개념을 다시 점검해야 하는 단계일 수 있습니다.",
  "40_below":
    "지금은 많은 문제를 풀기보다 쉬운 문제부터 다시 풀고, 기본 개념과 풀이 과정을 안정시키는 것이 우선입니다.",
  no_exam_yet:
    "첫 내신 전이라면 점수보다 공부 루틴과 기본 문제풀이 습관을 먼저 확인하는 것이 중요합니다.",
  unknown:
    "점수를 정확히 몰라도 괜찮습니다. 현재 공부 습관과 막히는 지점을 먼저 확인하는 것이 중요합니다."
};

const STUDY_CODE_LINES: Record<CodeScoreKey, string> = {
  S: "스스로 시작하고,",
  P: "밀어줘야 시작하고,",
  R: "차곡차곡 공부하는 편이며,",
  C: "시험 전에 몰아서 하며,",
  B: "기초에서 막히고,",
  T: "적용·응용에서 막히지만,",
  N: "오답을 분석하려는 힘이 있는 타입입니다.",
  F: "문제는 풀고 끝내는 타입입니다."
};

export function getStudyCodeSummary(studyCode: StudyCode) {
  return studyCode
    .split("")
    .map((letter) => STUDY_CODE_LINES[letter as CodeScoreKey])
    .join("\n");
}

export function getGradeLabel(grade: Grade) {
  return GRADE_OPTIONS.find((option) => option.value === grade)?.label ?? grade;
}

export function getScoreBandLabel(scoreBand: ScoreBand) {
  return SCORE_BAND_OPTIONS.find((option) => option.value === scoreBand)?.label ?? scoreBand;
}

export function getInitialTypeScores(): TypeScores {
  return DIAGNOSIS_TYPES.reduce((scores, type) => {
    scores[type] = 0;
    return scores;
  }, {} as TypeScores);
}

export function getInitialCodeScores(): CodeScores {
  return CODE_SCORE_KEYS.reduce((scores, key) => {
    scores[key] = 0;
    return scores;
  }, {} as CodeScores);
}

export function calculateEffectiveScore(rawScore: number, reverse: boolean) {
  return reverse ? 6 - rawScore : rawScore;
}

export function calculateDiagnosis(answers: AnswerMap) {
  const typeScores = getInitialTypeScores();
  const codeScores = getInitialCodeScores();

  QUESTIONS.forEach((question) => {
    const rawScore = answers[question.id];
    const effectiveScore = calculateEffectiveScore(rawScore, question.reverse);

    Object.entries(question.typeWeights).forEach(([type, weight]) => {
      typeScores[type as DiagnosisType] += effectiveScore * weight;
    });

    Object.entries(question.codeAxisWeights).forEach(([codeKey, weight]) => {
      codeScores[codeKey as CodeScoreKey] += effectiveScore * weight;
    });
  });

  const highestScore = Math.max(...Object.values(typeScores));
  const primaryType =
    TYPE_PRIORITY.find((type) => typeScores[type] === highestScore) ?? TYPE_PRIORITY[0];

  const studyCode = [
    codeScores.P >= CODE_THRESHOLDS.P ? "P" : "S",
    codeScores.C >= CODE_THRESHOLDS.C ? "C" : "R",
    codeScores.B > codeScores.T ? "B" : "T",
    codeScores.F >= CODE_THRESHOLDS.F ? "F" : "N"
  ].join("") as StudyCode;

  return {
    typeScores,
    primaryType,
    codeScores,
    studyCode
  };
}

export function isGrade(value: unknown): value is Grade {
  return GRADE_OPTIONS.some((option) => option.value === value);
}

export function isScoreBand(value: unknown): value is ScoreBand {
  return SCORE_BAND_OPTIONS.some((option) => option.value === value);
}

export function isDeviceType(value: unknown): value is DeviceType {
  return value === "mobile" || value === "desktop" || value === "tablet";
}

export function isCompleteAnswerMap(value: unknown): value is AnswerMap {
  if (!value || typeof value !== "object") {
    return false;
  }

  return QUESTIONS.every((question) => {
    const answer = (value as Record<string, unknown>)[question.id];
    return Number.isInteger(answer) && Number(answer) >= 1 && Number(answer) <= 5;
  });
}
