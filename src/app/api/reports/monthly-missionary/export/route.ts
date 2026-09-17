import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { data = {}, format = 'download' } = body;

    const templatePath = path.join(process.cwd(), 'src', 'templates', 'Monthly_Missionary_Report_Template.docx');
    if (!fs.existsSync(templatePath)) {
      return NextResponse.json({ error: 'Monthly Missionary Report template not found' }, { status: 404 });
    }

    const tempDir = path.join(process.cwd(), 'scratch', 'temp_reports');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const timestamp = Date.now();
    const safeMonth = (data.month || 'Month').replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeName = (data.name || 'Missionary').replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `Monthly_Missionary_Report_${safeName}_${safeMonth}.docx`;
    const outputPath = path.join(tempDir, `${timestamp}_${filename}`);

    const scriptPath = path.join(process.cwd(), 'scripts', 'fill_monthly_report.py');

    const pythonProcess = spawn('python3', [scriptPath]);

    const payload = JSON.stringify({
      template_path: templatePath,
      output_path: outputPath,
      data: data
    });

    const runScript = new Promise<void>((resolve, reject) => {
      let stderr = '';
      pythonProcess.stderr.on('data', (d) => {
        stderr += d.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code === 0 && fs.existsSync(outputPath)) {
          resolve();
        } else {
          reject(new Error(`Failed to generate docx (code ${code}): ${stderr}`));
        }
      });

      pythonProcess.stdin.write(payload);
      pythonProcess.stdin.end();
    });

    await runScript;

    const fileBuffer = fs.readFileSync(outputPath);

    // Clean up temporary file
    try {
      fs.unlinkSync(outputPath);
    } catch {}

    if (format === 'base64') {
      return NextResponse.json({
        success: true,
        filename,
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        base64: fileBuffer.toString('base64')
      });
    }

    // Return binary file for direct download
    return new Response(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': fileBuffer.length.toString()
      }
    });

  } catch (error: any) {
    console.error('[REPORT EXPORT ERROR]:', error);
    return NextResponse.json({ error: error.message || 'Failed to export report' }, { status: 500 });
  }
}
