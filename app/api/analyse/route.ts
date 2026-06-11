import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/analyse — save an analysis session
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      fileName,
      rowCount,
      colCount,
      numericCols,
      catCols,
      missingRate,
      patternCount,
      colInfoJson,
      patternsJson,
      corrMatrixJson,
    } = body;

    const session = await prisma.analysisSession.create({
      data: {
        fileName: fileName ?? 'unknown',
        rowCount: rowCount ?? 0,
        colCount: colCount ?? 0,
        numericCols: numericCols ?? 0,
        catCols: catCols ?? 0,
        missingRate: missingRate ?? 0,
        patternCount: patternCount ?? 0,
        colInfoJson: colInfoJson ?? undefined,
        patternsJson: patternsJson ?? undefined,
        corrMatrixJson: corrMatrixJson ?? undefined,
      },
    });

    return NextResponse.json({ success: true, id: session.id });
  } catch (error) {
    console.error('[POST /api/analyse]', error);
    return NextResponse.json({ error: 'Failed to save session' }, { status: 500 });
  }
}

// GET /api/analyse?id=xxx — retrieve a session
export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id');

    if (!id) {
      // Return recent sessions
      const sessions = await prisma.analysisSession.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: {
          id: true,
          fileName: true,
          rowCount: true,
          colCount: true,
          numericCols: true,
          catCols: true,
          missingRate: true,
          patternCount: true,
          createdAt: true,
        },
      });
      return NextResponse.json({ sessions });
    }

    const session = await prisma.analysisSession.findUnique({ where: { id } });
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    return NextResponse.json({ session });
  } catch (error) {
    console.error('[GET /api/analyse]', error);
    return NextResponse.json({ error: 'Failed to fetch session' }, { status: 500 });
  }
}
