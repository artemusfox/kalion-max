// Open Food Facts Barcode-Lookup
// Quelle: https://world.openfoodfacts.org — ODbL Lizenz, kein API-Key nötig
// Wir cachen 24h auf Server-Side via Next.js fetch revalidate.

import { NextResponse } from "next/server";

type OFFProduct = {
  product_name?: string;
  product_name_de?: string;
  product_name_en?: string;
  brands?: string;
  image_front_small_url?: string;
  image_front_url?: string;
  serving_size?: string;
  serving_quantity?: string | number;
  nutriments?: {
    "energy-kcal_100g"?: number;
    "energy-kcal_serving"?: number;
    proteins_100g?: number;
    proteins_serving?: number;
    carbohydrates_100g?: number;
    carbohydrates_serving?: number;
    fat_100g?: number;
    fat_serving?: number;
    fiber_100g?: number;
    sugars_100g?: number;
    salt_100g?: number;
  };
  nutriscore_grade?: string;
  ecoscore_grade?: string;
  nova_group?: number;
  ingredients_text?: string;
  ingredients_text_de?: string;
  ingredients_text_en?: string;
  allergens_tags?: string[];
};

type OFFResponse = {
  status: 0 | 1;
  status_verbose: string;
  product?: OFFProduct;
  code: string;
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const barcode = searchParams.get("barcode")?.replace(/\D/g, "").trim();

  if (!barcode || barcode.length < 8) {
    return NextResponse.json({ error: "Invalid barcode" }, { status: 400 });
  }

  try {
    const r = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${barcode}.json?fields=product_name,product_name_de,product_name_en,brands,image_front_small_url,image_front_url,serving_size,serving_quantity,nutriments,nutriscore_grade,ecoscore_grade,nova_group,ingredients_text,ingredients_text_de,ingredients_text_en,allergens_tags`,
      {
        headers: {
          "User-Agent": "KalionMax/1.0 (https://kalion-max.vercel.app)",
        },
        next: { revalidate: 86400 }, // 24h Cache
      }
    );

    if (!r.ok) {
      return NextResponse.json({ error: "OFF API error", status: r.status }, { status: 502 });
    }

    const data = (await r.json()) as OFFResponse;

    if (data.status !== 1 || !data.product) {
      return NextResponse.json({ found: false, barcode }, { status: 404 });
    }

    const p = data.product;
    const n = p.nutriments || {};

    // Wir geben sowohl /100g als auch /portion zurück — UI entscheidet
    const result = {
      found: true,
      barcode,
      name: p.product_name_de || p.product_name || p.product_name_en || "Unbekanntes Produkt",
      brand: p.brands || null,
      image: p.image_front_small_url || p.image_front_url || null,
      serving_size: parseServingSize(p.serving_size, p.serving_quantity),
      // Pro 100g
      per_100g: {
        calories: n["energy-kcal_100g"] ?? null,
        protein: n.proteins_100g ?? null,
        carbs: n.carbohydrates_100g ?? null,
        fat: n.fat_100g ?? null,
        fiber: n.fiber_100g ?? null,
        sugar: n.sugars_100g ?? null,
        salt: n.salt_100g ?? null,
      },
      // Pro Portion (falls vorhanden)
      per_serving: n["energy-kcal_serving"]
        ? {
            calories: n["energy-kcal_serving"] ?? null,
            protein: n.proteins_serving ?? null,
            carbs: n.carbohydrates_serving ?? null,
            fat: n.fat_serving ?? null,
          }
        : null,
      nutriscore: p.nutriscore_grade?.toUpperCase() || null,
      ecoscore: p.ecoscore_grade?.toUpperCase() || null,
      nova: p.nova_group || null,
      ingredients: p.ingredients_text_de || p.ingredients_text || p.ingredients_text_en || null,
      allergens: (p.allergens_tags || []).map((a) => a.replace(/^en:/, "")),
    };

    return NextResponse.json(result, {
      headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Lookup failed" }, { status: 500 });
  }
}

function parseServingSize(raw: string | undefined, qty: string | number | undefined): number | null {
  if (typeof qty === "number") return qty;
  if (typeof qty === "string") {
    const n = parseFloat(qty);
    if (!Number.isNaN(n)) return n;
  }
  if (raw) {
    const m = raw.match(/(\d+(?:[.,]\d+)?)/);
    if (m) return parseFloat(m[1].replace(",", "."));
  }
  return null;
}
