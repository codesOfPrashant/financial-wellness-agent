const DEFAULT_BASE_URL =
  "https://llm-wrapper-741152993481.asia-south1.run.app";

export interface LlmQueryOptions {
  prompt: string;
  pdfBase64?: string;
  imageBase64?: string;
  imageMediaType?: "image/jpeg" | "image/png" | "image/gif" | "image/webp";
  metadata?: Record<string, string>;
}

export interface LlmQueryResult {
  text: string;
  raw: unknown;
}

export function getLlmWrapperConfig(): {
  baseUrl: string;
  token: string;
} | null {
  const token = process.env.LLM_WRAPPER_API_TOKEN?.trim();
  if (!token) return null;
  return {
    baseUrl: process.env.LLM_WRAPPER_URL?.trim() || DEFAULT_BASE_URL,
    token,
  };
}

export function extractTextFromLlmResponse(body: unknown): string {
  if (typeof body === "string") return body.trim();
  if (!body || typeof body !== "object") return "";

  const o = body as Record<string, unknown>;

  const candidates = [
    o.response,
    o.text,
    o.answer,
    o.content,
    o.output,
    o.result,
    (o.data as Record<string, unknown> | undefined)?.response,
    (o.data as Record<string, unknown> | undefined)?.text,
    (o.choices as Array<{ message?: { content?: string } }> | undefined)?.[0]
      ?.message?.content,
  ];

  for (const c of candidates) {
    if (typeof c === "string" && c.trim()) return c.trim();
  }

  return JSON.stringify(body);
}

export async function queryLlmWrapper(
  options: LlmQueryOptions
): Promise<LlmQueryResult> {
  const config = getLlmWrapperConfig();
  if (!config) {
    throw new Error("LLM_WRAPPER_API_TOKEN is not configured");
  }

  const body: Record<string, unknown> = {
    prompt: options.prompt,
    metadata: {
      client: "financial-wellness-agent",
      ...options.metadata,
    },
  };

  if (options.pdfBase64) body.pdfBase64 = options.pdfBase64;
  if (options.imageBase64) {
    body.imageBase64 = options.imageBase64;
    body.imageMediaType = options.imageMediaType ?? "image/png";
  }

  const res = await fetch(`${config.baseUrl}/llm/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.token}`,
    },
    body: JSON.stringify(body),
  });

  const raw = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg =
      (raw as { message?: string }).message ??
      (raw as { error?: string }).error ??
      `LLM wrapper error (${res.status})`;
    throw new Error(msg);
  }

  const text = extractTextFromLlmResponse(raw);
  if (!text) {
    throw new Error("LLM wrapper returned an empty response");
  }

  return { text, raw };
}
