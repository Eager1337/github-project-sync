import { aiImageStudio, aiImageUpscale, aiProductDraft, aiTeamBio } from './ai.functions';

const handlers: Record<string, (args: { data: never }) => Promise<{ data: unknown; error: string | null }>> = {
  'ai-product-draft': aiProductDraft as never,
  'ai-image-studio': aiImageStudio as never,
  'ai-image-upscale': aiImageUpscale as never,
  'ai-team-bio': aiTeamBio as never,
};

/** Runs one of the admin AI tools on the built-in AI service and returns a readable error. */
export async function invokeAi<T = Record<string, unknown>>(
  fnName: string,
  body?: Record<string, unknown>,
): Promise<{ data: T | null; error: string | null }> {
  const handler = handlers[fnName];
  if (!handler) return { data: null, error: `Unknown AI tool: ${fnName}` };
  try {
    const res = await handler({ data: (body ?? {}) as never });
    return { data: (res.data as T) ?? null, error: res.error };
  } catch (err) {
    const msg = err instanceof Error ? err.message : '';
    if (/unauthori[sz]ed|401/i.test(msg)) return { data: null, error: 'Please sign in as an admin to use the AI tools.' };
    if (/invalid|required|expected/i.test(msg)) return { data: null, error: 'Some of the details sent to the AI were not valid. Please check and try again.' };
    return { data: null, error: 'The AI tool could not be reached. Please try again.' };
  }
}
