// app/api/projects/[projectId]/route.js
import prisma from '@/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/authOptions';

export async function GET(request, { params }) {
  const { projectId } = params;
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project || project.userId !== userId) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    return NextResponse.json({ project });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  const { projectId } = params;
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const body = await request.json();
    const { sceneData } = body;
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        sceneData,
      },
    });
    return NextResponse.json({ project: updatedProject });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { projectId } = params;
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project || project.userId !== userId) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    await prisma.project.delete({
      where: { id: projectId },
    });
    return NextResponse.json({ message: "Project deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const { projectId } = params;
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const body = await request.json();
    const { title, description } = body;
    // Ensure the project belongs to the user before updating
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project || project.userId !== userId) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: { title, description },
    });
    return NextResponse.json({ project: updatedProject });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
