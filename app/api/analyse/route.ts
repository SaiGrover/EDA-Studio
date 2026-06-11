import { NextRequest, NextResponse } from 'next/server';

// POST /api/analyse
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    return NextResponse.json({
      success: true,
      message: 'Analysis processed successfully',
      data: body,
    });
  } catch (error) {
    console.error('[POST /api/analyse]', error);

    return NextResponse.json(
      { error: 'Failed to process analysis' },
      { status: 500 }
    );
  }
}

// GET /api/analyse
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      sessions: [],
      message: 'Database persistence disabled',
    });
  } catch (error) {
    console.error('[GET /api/analyse]', error);

    return NextResponse.json(
      { error: 'Failed to fetch analysis data' },
      { status: 500 }
    );
  }
}