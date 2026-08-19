import { demoAccounts, clinicDemoUsers, maskPassword, roleLabels } from "@/data/accounts";

export const runtime = "edge";

/**
 * Demo database endpoint — lists seeded users (admin panel data source).
 * Public in the demo; production would require an admin session.
 */
export function GET() {
  return Response.json({
    ok: true,
    users: demoAccounts.map(maskPassword),
    roles: roleLabels,
    clinic: clinicDemoUsers,
    meta: {
      total: demoAccounts.length,
      admins: demoAccounts.filter((a) => a.role === "admin").length,
      buyers: demoAccounts.filter((a) => a.role === "buyer").length,
      sellers: demoAccounts.filter((a) => a.role === "seller").length,
      customers: demoAccounts.filter((a) => a.role === "customer").length,
      generatedAt: new Date().toISOString(),
    },
  });
}
