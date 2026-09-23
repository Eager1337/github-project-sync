import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Item = z.object({
  product_id: z.string().nullish(),
  name: z.string().max(200).optional(),
  price: z.number().optional(),
  quantity: z.number().optional(),
  image_url: z.string().max(1000).nullish(),
});

export const createOrder = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        guest_token: z.string().min(8).max(100),
        customer_name: z.string().trim().min(2, "Please enter your name").max(120),
        phone: z.string().trim().max(40).refine((v) => v.replace(/\D/g, "").length >= 6, "Please enter a valid phone number"),
        address: z.string().max(400).optional(),
        note: z.string().max(500).optional(),
        items: z.array(Item).min(1, "Your order is empty").max(100),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const uuid = /^[0-9a-f-]{36}$/i;
    const ids = data.items.map((i) => i.product_id).filter((id): id is string => !!id && uuid.test(id));
    const { data: prods } = ids.length
      ? await supabaseAdmin.from("products").select("id,name,price,images").in("id", ids)
      : { data: [] as { id: string; name: string; price: number; images: string[] | null }[] };
    const byId = new Map((prods ?? []).map((p) => [p.id, p]));

    const items = data.items.map((i) => {
      const p = i.product_id ? byId.get(i.product_id) : undefined;
      return {
        product_id: p?.id ?? null,
        name: p?.name ?? (i.name?.trim() || "Product"),
        price: p ? Number(p.price) : Math.max(0, Number(i.price) || 0),
        quantity: Math.min(999, Math.max(1, Math.round(Number(i.quantity) || 1))),
        image_url: i.image_url || p?.images?.[0] || null,
      };
    });
    const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const orderNumber = `HK-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`;

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .insert({
        order_number: orderNumber, guest_token: data.guest_token, customer_name: data.customer_name,
        phone: data.phone, address: data.address?.trim() || null, note: data.note?.trim() || null, total, status: "pending",
      } as never)
      .select()
      .single();
    if (error || !order) throw new Error("Could not save your order. Please try again.");
    const orderRow = order as { id: string };
    const { error: itemsErr } = await supabaseAdmin.from("order_items").insert(items.map((i) => ({ ...i, order_id: orderRow.id })) as never);
    if (itemsErr) throw new Error("Could not save your order items. Please try again.");
    await supabaseAdmin.from("notifications").insert({
      type: "order", title: `New order ${orderNumber}`,
      body: `${data.customer_name} ordered ${items.length} item(s) — Le ${Math.round(total).toLocaleString()}`,
    } as never);
    return { ...(order as Record<string, unknown>), order_items: items };
  });

export const listOrders = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ guest_token: z.string().min(8).max(100) }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: orders } = await supabaseAdmin
      .from("orders")
      .select("*, order_items(*)")
      .eq("guest_token", data.guest_token)
      .order("created_at", { ascending: false })
      .limit(100);
    return orders ?? [];
  });
