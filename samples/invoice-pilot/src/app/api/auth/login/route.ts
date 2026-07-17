const DEMO_EMAIL = "maya@northstar.test";
const DEMO_PASSWORD = "invoicepilot-demo";
const DEMO_SESSION = "demo_session_maya_valid_until_2026_07_31";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    email?: string;
    password?: string;
  };

  if (body.email !== DEMO_EMAIL || body.password !== DEMO_PASSWORD) {
    return Response.json(
      { message: "Email or password is incorrect." },
      { status: 401 },
    );
  }

  return Response.json(
    {
      ok: true,
      user: { email: DEMO_EMAIL },
    },
    {
      headers: {
        "Set-Cookie": `invoicepilot_session=${DEMO_SESSION}; Path=/; HttpOnly; SameSite=Lax`,
      },
    },
  );
}
