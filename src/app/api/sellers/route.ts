import { NextRequest, NextResponse } from "next/server";
import { sellers } from "@/app/data";

export function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const query = (params.get("q") ?? "").trim().toLocaleLowerCase("fa");
  const type = params.get("type") ?? "all";
  const city = params.get("city") ?? "all";
  const catalog = params.get("catalog") === "true";

  const results = sellers.filter((seller) => {
    const searchable = [seller.name, seller.city, seller.zone, ...seller.products].join(" ").toLocaleLowerCase("fa");
    return (!query || searchable.includes(query)) &&
      (type === "all" || seller.type === type || seller.type === "both") &&
      (city === "all" || seller.city === city) &&
      (!catalog || seller.catalog);
  });

  return NextResponse.json({
    data: results,
    meta: { total: results.length, reviewed: results.filter((seller) => seller.verified).length, generatedAt: new Date().toISOString() },
    disclaimer: "Public information only — verify with seller.",
  });
}
