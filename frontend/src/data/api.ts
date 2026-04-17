import { fallbackData } from "./fallback";
import type { ApiPayload } from "./types";

const API_BASE_URL = import.meta.env.VITE_CRTI_API_URL ?? "http://localhost:8000";

export async function loadCompassData(): Promise<ApiPayload> {
  try {
    const endpoints = [
      "overview",
      "campaigns",
      "processing",
      "benchmark",
      "position",
      "explainable-summary"
    ];

    const responses = await Promise.all(
      endpoints.map((endpoint) => fetch(`${API_BASE_URL}/${endpoint}`)),
    );

    if (responses.some((response) => !response.ok)) {
      throw new Error("Mock API unavailable");
    }

    const [overview, campaigns, processing, benchmark, position, explainableSummary] =
      await Promise.all(responses.map((response) => response.json()));

    return {
      overview,
      campaigns,
      processing,
      benchmark,
      position,
      explainableSummary
    } satisfies ApiPayload;
  } catch (_error) {
    return fallbackData;
  }
}

