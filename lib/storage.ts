import { createClient } from "@supabase/supabase-js";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { DiagnosisResponse, DiagnosisType, Grade, ScoreBand } from "@/lib/diagnosis";

export type ResponseFilters = {
  startDate?: string;
  endDate?: string;
  grade?: Grade;
  scoreBand?: ScoreBand;
  primaryType?: DiagnosisType;
};

const localDataPath = path.join(process.cwd(), ".data", "diagnosisResponses.json");

function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false
    }
  });
}

async function readLocalResponses(): Promise<DiagnosisResponse[]> {
  try {
    const file = await readFile(localDataPath, "utf8");
    return JSON.parse(file) as DiagnosisResponse[];
  } catch {
    return [];
  }
}

async function writeLocalResponses(responses: DiagnosisResponse[]) {
  await mkdir(path.dirname(localDataPath), { recursive: true });
  await writeFile(localDataPath, `${JSON.stringify(responses, null, 2)}\n`, "utf8");
}

function applyFilters(responses: DiagnosisResponse[], filters: ResponseFilters) {
  return responses.filter((response) => {
    if (filters.startDate && response.createdAt < `${filters.startDate}T00:00:00.000Z`) {
      return false;
    }

    if (filters.endDate && response.createdAt > `${filters.endDate}T23:59:59.999Z`) {
      return false;
    }

    if (filters.grade && response.grade !== filters.grade) {
      return false;
    }

    if (filters.scoreBand && response.recentScoreBand !== filters.scoreBand) {
      return false;
    }

    if (filters.primaryType && response.primaryType !== filters.primaryType) {
      return false;
    }

    return true;
  });
}

export async function saveDiagnosisResponse(response: DiagnosisResponse) {
  const supabase = getSupabaseClient();

  if (supabase) {
    const { error } = await supabase.from("diagnosisResponses").insert(response);

    if (error) {
      throw new Error(error.message);
    }

    return;
  }

  const responses = await readLocalResponses();
  responses.push(response);
  await writeLocalResponses(responses);
}

export async function listDiagnosisResponses(filters: ResponseFilters) {
  const supabase = getSupabaseClient();

  if (supabase) {
    let query = supabase
      .from("diagnosisResponses")
      .select("*")
      .order("createdAt", { ascending: false });

    if (filters.startDate) {
      query = query.gte("createdAt", `${filters.startDate}T00:00:00.000Z`);
    }

    if (filters.endDate) {
      query = query.lte("createdAt", `${filters.endDate}T23:59:59.999Z`);
    }

    if (filters.grade) {
      query = query.eq("grade", filters.grade);
    }

    if (filters.scoreBand) {
      query = query.eq("recentScoreBand", filters.scoreBand);
    }

    if (filters.primaryType) {
      query = query.eq("primaryType", filters.primaryType);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []) as DiagnosisResponse[];
  }

  const responses = await readLocalResponses();
  return applyFilters(responses, filters).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
