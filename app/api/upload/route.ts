import { NextRequest, NextResponse } from 'next/server';

// POST /api/upload — parse uploaded CSV/JSON on the server
// (Alternative to client-side parsing for large files)
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const maxSize = 50 * 1024 * 1024; // 50 MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large (max 50 MB)' }, { status: 413 });
    }

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['csv', 'tsv', 'json'].includes(ext ?? '')) {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 415 });
    }

    const text = await file.text();

    if (ext === 'json') {
      const json = JSON.parse(text);
      const rows = Array.isArray(json)
        ? json
        : json.data || Object.values(json)[0] || [];
      if (!rows.length) {
        return NextResponse.json({ error: 'No rows found in JSON' }, { status: 422 });
      }
      return NextResponse.json({
        rows: rows.slice(0, 50000), // safety cap
        fileName: file.name.replace(/\.[^.]+$/, ''),
      });
    }

    // CSV / TSV: lightweight server-side parse (no PapaParse on server)
    const delim = ext === 'tsv' ? '\t' : ',';
    const lines = text.split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) {
      return NextResponse.json({ error: 'File has no data rows' }, { status: 422 });
    }

    const headers = lines[0].split(delim).map(h => h.replace(/^"|"$/g, '').trim());
    const rows = lines
      .slice(1, 50001) // cap at 50k rows
      .map(line => {
        const vals = line.split(delim);
        return Object.fromEntries(
          headers.map((h, i) => {
            const raw = (vals[i] ?? '').replace(/^"|"$/g, '').trim();
            const num = Number(raw);
            return [h, raw === '' ? null : isNaN(num) ? raw : num];
          })
        );
      });

    return NextResponse.json({
      rows,
      fileName: file.name.replace(/\.[^.]+$/, ''),
    });
  } catch (error) {
    console.error('[POST /api/upload]', error);
    return NextResponse.json({ error: 'Failed to parse file' }, { status: 500 });
  }
}
