import { NextResponse } from "next/server";
import { getServerContentAccessLevel } from "@/lib/content-access";

export async function GET() {
  const level = await getServerContentAccessLevel();

  return NextResponse.json(
    { level, updatedAt: new Date().toISOString() },
    {
      headers: {
        "Cache-Control": "private, no-store"
      }
    }
  );
}
