import { catalogRows } from "@/app/data";

const escapeCsv = (value: string) => `"${value.replaceAll('"', '""')}"`;

export function GET() {
  const headers = ["Model", "Power", "Voltage", "RPM range", "Torque", "Application", "Typical use", "Public source", "Notes"];
  const rows = catalogRows.map((row) => [row.model, row.power, row.voltage, row.rpm, row.torque, row.app, row.use, row.source, row.notes]);
  const csv = `\uFEFF${[headers, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\r\n")}`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="bldc-public-catalog-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
