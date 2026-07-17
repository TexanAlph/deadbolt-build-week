import { invoices } from "@/lib/data";

export async function GET() {
  return Response.json({
    invoices,
    total: invoices.length,
  });
}
