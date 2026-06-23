const SHEET_NAME = "diagnosisResponses";

const HEADERS = [
  "diagnosisId",
  "createdAt",
  "grade",
  "recentScoreBand",
  "Q01",
  "Q02",
  "Q03",
  "Q04",
  "Q05",
  "Q06",
  "Q07",
  "Q08",
  "Q09",
  "Q10",
  "Q11",
  "Q12",
  "studyCode",
  "SScore",
  "PScore",
  "RScore",
  "CScore",
  "BScore",
  "TScore",
  "NScore",
  "FScore",
  "primaryType",
  "basicLeakScore",
  "structureWeaknessScore",
  "problemConsumerScore",
  "memorizationBiasScore",
  "routineMissingScore",
  "avoidanceDefenseScore",
  "source",
  "deviceType"
];

const TYPE_SCORE_KEYS = {
  basicLeakScore: "기초누수형",
  structureWeaknessScore: "구조약점형",
  problemConsumerScore: "문제소비형",
  memorizationBiasScore: "암기편중형",
  routineMissingScore: "루틴부재형",
  avoidanceDefenseScore: "회피방어형"
};

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const payload = JSON.parse((e.postData && e.postData.contents) || "{}");
    const sheet = getOrCreateSheet_();
    ensureHeaders_(sheet);
    sheet.appendRow(toRow_(payload));

    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: false, message: String(error) })
    ).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return ContentService.createTextOutput("5분 공부유형 테스트 저장 엔드포인트입니다.");
}

function getOrCreateSheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  return spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);
}

function ensureHeaders_(sheet) {
  const currentHeaders = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  const hasHeaders = HEADERS.every((header, index) => currentHeaders[index] === header);

  if (!hasHeaders) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
  }
}

function toRow_(payload) {
  const answers = payload.answers || {};
  const codeScores = payload.codeScores || {};
  const typeScores = payload.typeScores || {};

  return [
    payload.diagnosisId || Utilities.getUuid(),
    payload.createdAt || new Date().toISOString(),
    payload.grade || "",
    payload.recentScoreBand || "",
    answers.Q01 || "",
    answers.Q02 || "",
    answers.Q03 || "",
    answers.Q04 || "",
    answers.Q05 || "",
    answers.Q06 || "",
    answers.Q07 || "",
    answers.Q08 || "",
    answers.Q09 || "",
    answers.Q10 || "",
    answers.Q11 || "",
    answers.Q12 || "",
    payload.studyCode || "",
    codeScores.S || 0,
    codeScores.P || 0,
    codeScores.R || 0,
    codeScores.C || 0,
    codeScores.B || 0,
    codeScores.T || 0,
    codeScores.N || 0,
    codeScores.F || 0,
    payload.primaryType || "",
    typeScores[TYPE_SCORE_KEYS.basicLeakScore] || 0,
    typeScores[TYPE_SCORE_KEYS.structureWeaknessScore] || 0,
    typeScores[TYPE_SCORE_KEYS.problemConsumerScore] || 0,
    typeScores[TYPE_SCORE_KEYS.memorizationBiasScore] || 0,
    typeScores[TYPE_SCORE_KEYS.routineMissingScore] || 0,
    typeScores[TYPE_SCORE_KEYS.avoidanceDefenseScore] || 0,
    payload.source || "flyer_qr",
    payload.deviceType || ""
  ];
}
