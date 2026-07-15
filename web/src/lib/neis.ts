const NEIS_BASE = "https://open.neis.go.kr/hub";

type NeisRow = Record<string, string>;

type NeisResponse = {
  schoolInfo?: Array<{
    head?: Array<Record<string, unknown>>;
    row?: NeisRow[];
  }>;
  mealServiceDietInfo?: Array<{
    head?: Array<Record<string, unknown>>;
    row?: NeisRow[];
  }>;
  RESULT?: { CODE: string; MESSAGE: string };
};

export type SchoolResult = {
  officeCode: string;
  schoolCode: string;
  schoolName: string;
  region: string;
  address: string;
};

export type MealResult = {
  date: string;
  mealType: string;
  dishes: string[];
  calories?: string;
};

function getApiKey() {
  const key = process.env.NEIS_API_KEY;
  if (!key) {
    throw new Error("NEIS_API_KEY가 설정되지 않았습니다.");
  }
  return key;
}

async function fetchNeis(endpoint: string, params: Record<string, string>) {
  const url = new URL(`${NEIS_BASE}/${endpoint}`);
  url.searchParams.set("KEY", getApiKey());
  url.searchParams.set("Type", "json");
  url.searchParams.set("pIndex", "1");
  url.searchParams.set("pSize", params.pSize ?? "20");
  for (const [k, v] of Object.entries(params)) {
    if (k !== "pSize") url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) {
    throw new Error(`NEIS API 요청 실패 (${res.status})`);
  }
  return (await res.json()) as NeisResponse;
}

function hasNoData(data: NeisResponse) {
  const code = data.RESULT?.CODE;
  return code === "INFO-200";
}

export async function searchSchools(query: string): Promise<SchoolResult[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const data = await fetchNeis("schoolInfo", {
    SCHUL_NM: q,
    pSize: "30",
  });

  if (hasNoData(data) || !data.schoolInfo?.[1]?.row) {
    return [];
  }

  return data.schoolInfo[1].row.map((row) => ({
    officeCode: row.ATPT_OFCDC_SC_CODE,
    schoolCode: row.SD_SCHUL_CODE,
    schoolName: row.SCHUL_NM,
    region: row.LCTN_SC_NM ?? "",
    address: row.ORG_RDNMA ?? row.ORG_RDNMA_ADDR ?? "",
  }));
}

function parseDishes(raw: string): string[] {
  return raw
    .split(/<br\s*\/?>/i)
    .map((item) =>
      item
        .replace(/\([^)]*\)/g, "")
        .replace(/\d+\./g, "")
        .trim(),
    )
    .filter(Boolean);
}

export async function fetchMeals(options: {
  officeCode: string;
  schoolCode: string;
  date: string; // yyyy-MM-dd or yyyyMMdd
}): Promise<MealResult[]> {
  const ymd = options.date.replaceAll("-", "");

  const data = await fetchNeis("mealServiceDietInfo", {
    ATPT_OFCDC_SC_CODE: options.officeCode,
    SD_SCHUL_CODE: options.schoolCode,
    MLSV_YMD: ymd,
    pSize: "10",
  });

  if (hasNoData(data) || !data.mealServiceDietInfo?.[1]?.row) {
    return [];
  }

  return data.mealServiceDietInfo[1].row.map((row) => ({
    date: row.MLSV_YMD,
    mealType: row.MMEAL_SC_NM,
    dishes: parseDishes(row.DDISH_NM ?? ""),
    calories: row.CAL_INFO,
  }));
}
