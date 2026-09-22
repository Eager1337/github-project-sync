import { supabase } from '@/integrations/supabase/client';

/**
 * Calls an Edge Function and always hands back a message an admin can act on.
 *
 * Why this exists: supabase-js throws away the response body of any non-2xx call and
 * replaces it with `Error('Edge Function returned a non-2xx status code')`, so every
 * specific message our AI functions return — "AI is not configured yet — add a
 * GEMINI_API_KEY secret", "Admin access required", "Gemini rate limit reached" — was
 * invisible in the admin pages. The real payload is only reachable through
 * `error.context` (the raw Response), and only until the client is done with it, so it
 * has to be read here.
 */
export async function invokeAi<T = Record<string, unknown>>(
  fnName: string,
  body?: Record<string, unknown>,
): Promise<{ data: T | null; error: string | null }> {
  // Fail locally first: without a session every AI call comes back 401, which reads like an
  // AI outage rather than "you are not signed in".
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { data: null, error: 'Please sign in as an admin to use the AI tools.' };

  const { data, error } = await supabase.functions.invoke(fnName, { body });

  if (error) return { data: null, error: await describeFailure(fnName, error) };

  // Functions answer 200 with `{ error }` for per-image failures; keep those visible too.
  const payloadError = (data as { error?: unknown } | null)?.error;
  if (typeof payloadError === 'string' && payloadError.trim()) return { data: null, error: payloadError.trim() };
  return { data: (data as T) ?? null, error: null };
}

type MaybeError = { message?: unknown; context?: unknown } & Record<string, unknown>;

/** supabase-js's own placeholder text for every failure shape. */
const GENERIC_MESSAGES = /returned a non-2xx status code|failed to send a request to the edge function|relay error invoking the edge function/i;
const UNREACHABLE = /failed to send a request to the edge function|relay error|failed to fetch|networkerror|load failed/i;

async function describeFailure(fnName: string, err: unknown): Promise<string> {
  const error = (err ?? {}) as MaybeError;
  const context = error.context as Response | undefined;
  const detail = await readErrorBody(error.context);
  if (detail) return detail;

  // No usable body: fall back to what the status itself tells us.
  if (context?.status === 404) return `The "${fnName}" AI function is not deployed to this Supabase project yet.`;
  if (context?.status === 401) return 'Admin access required — please sign in again.';

  const message = typeof error.message === 'string' ? error.message.trim() : '';
  if (UNREACHABLE.test(message)) {
    return `${fnName} could not be reached. Check that it is deployed to this Supabase project and try again.`;
  }
  if (message && !GENERIC_MESSAGES.test(message)) return safeAiMessage(message);

  return context?.status
    ? `The AI service returned an error (${context.status}). Please try again.`
    : `${fnName} failed without a message.`;
}

/** Pulls `{ error: "…" }` (or a plain-text reason) out of the parked Response. */
async function readErrorBody(context: unknown): Promise<string | null> {
  if (!context) return null;
  if (typeof (context as Response).text === 'function') {
    const raw = await (context as Response).text().catch(() => '');
    return parseErrorBody(raw);
  }
  // Older/newer clients hand back a plain object instead of a Response.
  const record = context as { error?: unknown; message?: unknown };
  if (typeof record.error === 'string' && record.error.trim()) return safeAiMessage(record.error);
  if (typeof record.message === 'string' && !GENERIC_MESSAGES.test(record.message) && record.message.trim()) {
    return safeAiMessage(record.message);
  }
  return null;
}

const RETIRED_GEMINI_MODEL = /models?\/gemini-2\.5-flash|gemini-2\.5-flash/i;
const RAW_GEMINI_ERROR = /(?:\"?code\"?\s*:\s*404|status\s*:\s*NOT_FOUND|model .* no longer available)/i;

function safeAiMessage(message: string): string | null {
  const trimmed = message.trim();
  if (!trimmed) return null;
  // Older Supabase deployments can still return Google's raw retired-model payload while
  // the function rollout propagates. Never expose that provider detail in an admin page.
  if (RETIRED_GEMINI_MODEL.test(trimmed) || RAW_GEMINI_ERROR.test(trimmed)) {
    return 'The AI service is updating its model configuration. Please try again shortly.';
  }
  return trimmed;
}

function parseErrorBody(raw: string): string | null {
  if (!raw?.trim()) return null;
  try {
    const json: unknown = JSON.parse(raw);
    if (typeof json === 'string') return safeAiMessage(json);
    if (json && typeof json === 'object') {
      const record = json as { error?: unknown; message?: unknown };
      const value = record.error ?? record.message;
      if (typeof value === 'string') return safeAiMessage(value);
      if (value && typeof value === 'object') {
        const nested = value as { message?: unknown };
        if (typeof nested.message === 'string') return safeAiMessage(nested.message);
      }
    }
  } catch {
    // Not JSON — usually an HTML error page from the edge proxy, which no admin can use.
  }
  return null;
}
