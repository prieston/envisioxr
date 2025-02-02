// app/api/projects/route.js
import prisma from '@/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@//authOptions';

export async function GET(request) {
  // No dynamic parameter here—this is the collection route.
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const projects = await prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ projects });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  // This endpoint creates a new project.
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const body = await request.json();
    const { title, description } = body;
    const newProject = await prisma.project.create({
      data: {
        title,
        description,
        sceneData: {}, // default empty JSON object
        userId,
      },
    });
    return NextResponse.json({ project: newProject });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
