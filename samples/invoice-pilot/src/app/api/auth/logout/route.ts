export async function POST() {
  return Response.json({
    ok: true,
    message: "You have been signed out.",
  });
}
