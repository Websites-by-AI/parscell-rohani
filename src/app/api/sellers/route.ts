import { NextRequest, NextResponse } from "next/server";
import { sellers } from "@/app/data";
import { globalSellers } from "@/app/data-global";

export const runtime = "edge";

function escapeCsv(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

export function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const query = (params.get("q") ?? "").trim().toLocaleLowerCase("fa");
  const type = params.get("type") ?? "all";
  const city = params.get("city") ?? "all";
  const catalog = params.get("catalog") === "true";
  const scope = params.get("scope") ?? "iran"; // "iran" | "world"
  const country = (params.get("country") ?? "all").toLocaleLowerCase("fa");
  const format = params.get("format") ?? "json";

  const pool = scope === "world" ? [...sellers, ...globalSellers] : sellers;

  const results = pool.filter((seller) => {
    const searchable = [seller.name, seller.city, seller.zone, seller.country ?? "", ...seller.products].join(" ").toLocaleLowerCase("fa");
    return (!query || searchable.includes(query)) &&
      (type === "all" || seller.type === type || seller.type === "both") &&
      (city === "all" || seller.city === city) &&
      (!catalog || seller.catalog) &&
      (scope === "iran" || country === "all" || (seller.country ?? "").toLocaleLowerCase("fa") === country);
  });

  if (format === "csv") {
    const headers = ["ID", "Company", "Country", "City", "Zone", "Type", "Production", "Products", "Power", "Voltage", "Score", "Catalog", "Reviewed", "Lat", "Lng", "Source"];
    const rows = results.map((s) => [
      String(s.id), s.name, s.country ?? "ایران", s.city, s.zone, s.type, s.production,
      s.products.join(" | "), s.power, s.voltage, String(s.score),
      s.catalog ? "yes" : "no", s.verified ? "yes" : "no",
      String(s.lat), String(s.lng), s.source,
    ]);
    const csv = `\uFEFF${[headers, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\r\n")}`;
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="bldc-sellers-${scope}-${new Date().toISOString().slice(0, 10)}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  }

  return NextResponse.json({
    data: results,
    meta: {
      total: results.length,
      iran: scope === "world" ? pool.filter((s) => (s.country ?? "ایران") === "ایران").length : pool.length,
      global: scope === "world" ? globalSellers.length : 0,
      reviewed: results.filter((seller) => seller.verified).length,
      generatedAt: new Date().toISOString(),
    },
    disclaimer: "Public information only — verify with seller.",
  });
}
