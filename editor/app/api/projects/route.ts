import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { NextRequest } from "next/server";
import { Session } from "next-auth";

interface UserSession extends Session {
  user: {
    id: string;
    name?: string;
    email?: string;
    image?: string;
  };
}

export async function POST(request: NextRequest) {
  const session = (await getServerSession(authOptions)) as UserSession;
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const body = await request.json();
    const { title, description } = body;

    const project = await prisma.project.create({
      data: {
        title: title || "Untitled Project",
        description: description || "",
        userId,
        sceneData: {},
        isPublished: false,
      },
    });

    return NextResponse.json({ project });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const session = (await getServerSession(authOptions)) as UserSession;
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const projects = await prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ projects });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
