import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { streamText, Output } from "ai";
import { z } from "zod";
import { AiError, editImage, friendlyAiError, reasoningOptions, responsesModel } from "./ai-gateway.server";

type Ctx = { supabase: { rpc: (fn: string, args: Record<string, unknown>) => PromiseLike<{ data: unknown; error: unknown }> }; userId: string };

async function assertAdmin(context: unknown) {
  const { supabase, userId } = context as Ctx;
  const { data, error } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (error || data !== true) throw new AiError("Admin access required", 403);
}

type Result<T> = { data: T | null; error: string | null };
async function wrap<T>(fn: () => Promise<T>): Promise<Result<T>> {
  try {
    return { data: await fn(), error: null };
  } catch (err) {
    return { data: null, error: friendlyAiError(err).message };
  }
}

async function saveImage(dataUrl: string, prefix: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const match = /^data:([^;]+);base64,(.+)$/.exec(dataUrl);
  if (!match) throw new AiError("The AI returned an unreadable image.", 502);
  const mime = match[1];
  const bytes = Uint8Array.from(atob(match[2]), (c) => c.charCodeAt(0));
  const path = `images/${prefix}-${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${mime.includes("png") ? "png" : "jpg"}`;
  const { error } = await supabaseAdmin.storage.from("product-media").upload(path, bytes, { contentType: mime });
  if (error) throw new AiError("Could not save the new image.", 500);
  const { data: signed } = await supabaseAdmin.storage.from("product-media").createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
  const url = signed?.signedUrl;
  if (!url) throw new AiError("Could not create a link for the new image.", 500);
  await supabaseAdmin.from("media_assets").insert({
    url, path, file_name: path.split("/").pop()!, media_type: "image", size_bytes: bytes.length,
  } as never);
  return url;
}

const imageUrl = z.string().refine((v) => /^https?:\/\//i.test(v) || v.startsWith("data:image/"), "A valid image is required");

// ---------- Product drafting ----------
const DraftSchema = z.object({
  name: z.string(),
  category: z.string(),
  price: z.number(),
  description: z.string(),
  stock: z.number(),
  sizes: z.array(z.string()),
  colors: z.array(z.string()),
  tags: z.array(z.string()),
  confidence: z.number(),
});

export const aiProductDraft = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ images: z.array(imageUrl).min(1).max(20), categories: z.array(z.string()).max(100) }).parse(d))
  .handler(async ({ data, context }) =>
    wrap(async () => {
      await assertAdmin(context);
      const results = await Promise.all(
        data.images.map(async (image) => {
          try {
            const result = streamText({
              model: responsesModel(),
              system:
                "You are a product listing assistant for Haamkay Enterprises, a luxury retail store in Freetown, Sierra Leone. Prices are in Sierra Leonean Leones (Le). Look at the product photo and produce a complete, ready-to-publish listing. Be concrete: no placeholders. Estimate a realistic retail price in Leones. Include visible or typical sizes and colours. Up to 8 tags. Confidence is 0-1.",
              messages: [
                {
                  role: "user",
                  content: [
                    { type: "text", text: `Create a listing for this product.${data.categories.length ? ` Pick the best category from: ${data.categories.join(", ")}. If none fit, suggest a short new one.` : ""}` },
                    { type: "image", image: new URL(image) },
                  ],
                },
              ],
              output: Output.object({ schema: DraftSchema }),
              providerOptions: reasoningOptions,
            });
            const d = await result.output;
            return {
              image,
              draft: {
                ...d,
                name: d.name.slice(0, 200),
                description: d.description.slice(0, 4000),
                price: Math.max(0, d.price),
                stock: Math.max(0, Math.round(d.stock || 1)),
                sizes: d.sizes.slice(0, 12), colors: d.colors.slice(0, 12), tags: d.tags.slice(0, 8),
              },
            };
          } catch (err) {
            return { image, error: friendlyAiError(err).message };
          }
        }),
      );
      const successCount = results.filter((r) => "draft" in r).length;
      return { results, count: results.length, successCount, failedCount: results.length - successCount };
    }),
  );

// ---------- Image studio / upscale ----------
const ENHANCE =
  "Upscale and enhance this product photo to ultra sharp, high resolution studio quality. Keep the product identical — same shape, colour, branding and details. Remove noise and blur, fix lighting, boost clarity. Perfect for luxury e-commerce.";

export const aiImageStudio = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ imageUrl, mode: z.enum(["enhance", "edit"]).catch("enhance"), prompt: z.string().max(2000).optional() }).parse(d),
  )
  .handler(async ({ data, context }) =>
    wrap(async () => {
      await assertAdmin(context);
      if (data.mode === "edit" && !data.prompt?.trim()) throw new AiError("Tell the AI what to change", 400);
      const prompt = data.mode === "enhance" ? ENHANCE : `${data.prompt}\n\nKeep the product itself accurate and realistic. Return a clean, high resolution e-commerce ready image.`;
      const out = await editImage(data.imageUrl, prompt);
      return { url: await saveImage(out, "ai") };
    }),
  );

export const aiImageUpscale = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ imageUrl }).parse(d))
  .handler(async ({ data, context }) =>
    wrap(async () => {
      await assertAdmin(context);
      const out = await editImage(data.imageUrl, ENHANCE + " Output at the highest resolution possible.");
      return { url: await saveImage(out, "upscaled") };
    }),
  );

// ---------- Team bio ----------
export const aiTeamBio = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ name: z.string().min(1).max(120), role: z.string().max(120).optional(), notes: z.string().max(1000).optional() }).parse(d))
  .handler(async ({ data, context }) =>
    wrap(async () => {
      await assertAdmin(context);
      const result = streamText({
        model: responsesModel(),
        system:
          "You write short, warm, professional team bios for Haamkay Enterprises, a luxury retail store in Freetown, Sierra Leone. 2-3 sentences, third person, no placeholders.",
        prompt: `Name: ${data.name}\nRole: ${data.role || "Team member"}\nNotes: ${data.notes || "none"}\n\nWrite the bio only.`,
        providerOptions: reasoningOptions,
      });
      const bio = (await result.text).trim();
      if (!bio) throw new AiError("The AI could not write a bio right now — please try again.", 502);
      return { bio };
    }),
  );

// ---------- Shopper product finder (public) ----------
const RecSchema = z.object({
  summary: z.string(),
  picks: z.array(z.object({ id: z.string(), reason: z.string() })),
});

export const recommendProducts = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ query: z.string().trim().min(3).max(500) }).parse(d))
  .handler(async ({ data }) =>
    wrap(async () => {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: products, error } = await supabaseAdmin
        .from("products")
        .select("id,name,category,price,description,sizes,colors,stock,images")
        .eq("published", true)
        .gt("stock", 0)
        .order("created_at", { ascending: false })
        .limit(150);
      if (error) throw new AiError("Could not load the catalogue.", 500);
      if (!products?.length) return { summary: "Our shelves are being restocked right now — please check back soon.", picks: [] };

      const catalog = products
        .map((p) => `${p.id} | ${p.name} | ${p.category} | Le ${p.price} | sizes: ${p.sizes.join("/") || "-"} | colours: ${p.colors.join("/") || "-"} | ${(p.description ?? "").slice(0, 160)}`)
        .join("\n");

      const result = streamText({
        model: responsesModel(),
        system:
          "You are a friendly personal shopper for Haamkay Enterprises in Freetown, Sierra Leone. Recommend only products from the catalogue provided, using their exact ids. Pick up to 6 of the most relevant items, best first. Each reason is one or two sentences explaining why it fits the shopper's need (mention size, colour, price or occasion when useful). The summary is one short friendly sentence. If nothing fits, return no picks and say so kindly in the summary. Prices are in Leones.",
        prompt: `Shopper request: ${data.query}\n\nCatalogue (id | name | category | price | sizes | colours | description):\n${catalog}`,
        output: Output.object({ schema: RecSchema }),
        providerOptions: reasoningOptions,
      });
      const out = await result.output;
      const byId = new Map(products.map((p) => [p.id, p]));
      const picks = out.picks
        .filter((p) => byId.has(p.id))
        .slice(0, 6)
        .map((p) => {
          const prod = byId.get(p.id)!;
          return { reason: p.reason, product: { id: prod.id, name: prod.name, price: prod.price, category: prod.category, image: prod.images?.[0] ?? null } };
        });
      return { summary: out.summary, picks };
    }),
  );
