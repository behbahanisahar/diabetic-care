import { NextResponse } from "next/server";

const DIVAR_CITIES_API = "https://api.divar.ir/v8/places/cities";

export async function GET() {
  try {
    const res = await fetch(DIVAR_CITIES_API, {
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 86400 }, // Cache for 24 hours
    });

    if (!res.ok) {
      throw new Error("Failed to fetch cities");
    }

    const data = await res.json();
    const cities = (data.cities || []).map(
      (c: { id: number; name: string; slug: string }) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
      })
    );

    // Sort by name (Persian alphabetical)
    cities.sort((a: { name: string }, b: { name: string }) =>
      a.name.localeCompare(b.name, "fa")
    );

    return NextResponse.json(cities);
  } catch (error) {
    console.error("Cities API error:", error);
    return NextResponse.json(
      { error: "خطا در دریافت لیست شهرها" },
      { status: 500 }
    );
  }
}
