export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const invoice = searchParams.get("invoice") ?? "unknown";
    const format = searchParams.get("format");

    if (format === "broken") {
      throw new Error(
        `Renderer failed for invoice ${invoice}: template missing at /app/templates/invoice.hbs`,
      );
    }

    return Response.json({
      ok: true,
      invoice,
      download: `/synthetic-exports/invoice-${invoice}.pdf`,
    });
  } catch (error) {
    const internalError = error as Error;

    return Response.json(
      {
        message: internalError.message,
        stack: internalError.stack,
        environment: process.env.NODE_ENV,
      },
      { status: 500 },
    );
  }
}
