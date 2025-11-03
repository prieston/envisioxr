import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const data = await request.json();
  console.log("[contact] submission", data);

  return Response.json({ status: "received" });
}

