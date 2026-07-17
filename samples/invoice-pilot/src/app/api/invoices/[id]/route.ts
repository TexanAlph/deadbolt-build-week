import { getInvoiceById } from "@/lib/data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const invoice = getInvoiceById(Number(id));

  if (!invoice) {
    return Response.json({ message: "Invoice not found" }, { status: 404 });
  }

  return Response.json({ invoice });
}
