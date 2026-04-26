import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json({ success: false, error: 'URL is required' }, { status: 400 });
    }

    const scriptPath = path.join(process.cwd(), 'scripts', 'scraper.py');
    
    return new Promise((resolve) => {
      const pythonProcess = spawn('python3', [scriptPath, url]);
      
      let stdoutData = '';
      let stderrData = '';

      pythonProcess.stdout.on('data', (data) => {
        stdoutData += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        stderrData += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          console.error(`Scrapy process exited with code ${code}`);
          console.error(`Stderr: ${stderrData}`);
          resolve(NextResponse.json({ 
            success: false, 
            error: 'Scraper failed. Make sure scrapy is installed via pip3 install scrapy' 
          }, { status: 500 }));
          return;
        }

        try {
          // Find the last line which should be our JSON
          const lines = stdoutData.trim().split('\n');
          const lastLine = lines[lines.length - 1];
          const result = JSON.parse(lastLine);
          
          resolve(NextResponse.json({ success: true, data: result }));
        } catch (e) {
          console.error('Failed to parse Scrapy output:', stdoutData);
          resolve(NextResponse.json({ 
            success: false, 
            error: 'Failed to parse scraper output.' 
          }, { status: 500 }));
        }
      });
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
