// Open Food Facts Text-Search
// Schnelle Suche über die OFF-API (zusätzlich zu Barcode-Lookup).

import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const lang = (searchParams.get("lang") || "de").toLowerCase();

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    // OFF "search_simple" liefert leichte JSON-Liste — page_size klein halten für Speed
    const url =
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}` +
      `&search_simple=1&action=process&json=1&page_size=20` +
      `&fields=code,product_name,product_name_${lang},brands,image_front_small_url,nutriments,nutriscore_grade`;

    const r = await fetch(url, {
      headers: { "User-Agent": "KalionMax/1.0 (https://kalion-max.vercel.app)" },
      next: { revalidate: 3600 }, // 1h Cache pro Search-Term
    });

    if (!r.ok) {
      return NextResponse.json({ results: [], error: "Search failed" }, { status: 502 });
    }

    const data = await r.json();
    const products = (data.products || []) as any[];

    const results = products
      .filter((p) => p.product_name || p[`product_name_${lang}`])
      .map((p) => ({
        barcode: p.code,
        name: p[`product_name_${lang}`] || p.product_name,
        brand: p.brands || null,
        image: p.image_front_small_url || null,
        calories_100g: p.nutriments?.["energy-kcal_100g"] ?? null,
        protein_100g: p.nutriments?.proteins_100g ?? null,
        carbs_100g: p.nutriments?.carbohydrates_100g ?? null,
        fat_100g: p.nutriments?.fat_100g ?? null,
        nutriscore: p.nutriscore_grade?.toUpperCase() || null,
      }));

    return NextResponse.json({ results, count: results.length });
  } catch (e: any) {
    return NextResponse.json({ results: [], error: e?.message }, { status: 500 });
  }
}
