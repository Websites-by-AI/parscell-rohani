export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({ ok: true, healthy: true, timestamp: new Date().toISOString() });
}
