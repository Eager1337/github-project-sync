import { createOpenAI } from "@ai-sdk/openai";

const RUN_ID = "X-Lovable-AIG-Run-ID";
export const GATEWAY = "https://ai.gateway.lovable.dev/v1";
export const TEXT_MODEL = "openai/gpt-6-astra";
const IMAGE_MODEL = "google/gemini-3.1-flash-image";

export class AiError extends Error {
  constructor(message: string, public status = 500) {
    super(message);
  }
}

export function getKey() {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new AiError("AI is not configured on the server.", 500);
  return key;
}

/** Run-id aware fetch: resends the id the gateway mints on follow-up calls. */
export function createLovableAiGatewayRunIdFetch(initialRunId?: string) {
  let runId = initialRunId?.trim() || undefined;
  return {
    fetch: (async (input: RequestInfo | URL, init?: RequestInit) => {
      const headers = new Headers(init?.headers);
      if (runId && !headers.has(RUN_ID)) headers.set(RUN_ID, runId);
      const res = await fetch(input, { ...init, headers });
      runId = runId || res.headers.get(RUN_ID) || undefined;
      return res;
    }) as typeof fetch,
    getRunId: () => runId,
  };
}

export function responsesModel() {
  const key = getKey();
  const runIdFetch = createLovableAiGatewayRunIdFetch();
  const lovable = createOpenAI({
    baseURL: GATEWAY,
    apiKey: key,
    headers: { "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });
  return lovable.responses(TEXT_MODEL);
}

export const reasoningOptions = {
  openai: {
    forceReasoning: true,
    reasoningEffort: "low",
    reasoningSummary: "auto",
    store: false,
    include: ["reasoning.encrypted_content"],
  },
} as const;

/** Translate gateway/SDK failures into messages an admin or shopper can act on. */
export function friendlyAiError(err: unknown): AiError {
  if (err instanceof AiError) return err;
  const e = err as { statusCode?: number; status?: number; message?: string };
  const status = e?.statusCode ?? e?.status;
  if (status === 429) return new AiError("The AI is busy right now. Please wait a moment and try again.", 429);
  if (status === 402) return new AiError("AI credits have run out. Add credits in your workspace to keep using the AI tools.", 402);
  if (status === 403) return new AiError("AI access is blocked for this workspace. A workspace admin needs to check AI settings.", 403);
  console.error("AI call failed:", err);
  return new AiError("The AI could not finish that request. Please try again.", 502);
}

/** Generate or edit an image from a source image + instruction. Returns a data URL. */
export async function editImage(sourceUrl: string, prompt: string): Promise<string> {
  const key = getKey();
  const res = await fetch(`${GATEWAY}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "fetch" },
    body: JSON.stringify({
      model: IMAGE_MODEL,
      modalities: ["image", "text"],
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: sourceUrl } },
          ],
        },
      ],
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("Image AI error", res.status, text.slice(0, 500));
    throw friendlyAiError({ status: res.status });
  }
  const json = (await res.json()) as {
    choices?: { message?: { images?: { image_url?: { url?: string } }[] } }[];
  };
  const url = json.choices?.[0]?.message?.images?.[0]?.image_url?.url;
  if (!url) throw new AiError("The AI did not return an image. Try a clearer photo or a different instruction.", 502);
  return url;
}
