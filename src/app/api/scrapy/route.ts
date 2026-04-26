import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json({ success: false, error: 'URL is required' }, { status: 400 });
    }

    // Ensure URL has a scheme
    let targetUrl = url;
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
    }

    try {
      // Timeout protection (15 seconds) using Axios config
      const response = await axios.get(targetUrl, {
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      if (response.status !== 200) {
        return NextResponse.json({ 
          success: false, 
          error: `Site returned status code ${response.status}`,
          status: response.status 
        }, { status: 500 });
      }

      const html = response.data;
      const $ = cheerio.load(html);

      // Extract data matching the Python scraper format
      const title = $('title').text() || 'N/A';
      
      const h1: string[] = [];
      $('h1').each((_, el) => {
        const text = $(el).text().trim();
        if (text) h1.push(text);
      });

      const meta_description = $('meta[name="description"]').attr('content') || null;
      
      const links_count = $('a[href]').length;
      const images_count = $('img[src]').length;
      
      let text_preview = '';
      $('p').each((_, el) => {
        text_preview += $(el).text() + ' ';
      });
      text_preview = text_preview.trim().substring(0, 500) + (text_preview.length > 500 ? '...' : '');

      const result = {
        success: true,
        title,
        h1,
        meta_description,
        links_count,
        images_count,
        text_preview
      };

      return NextResponse.json({ success: true, data: result });

    } catch (err: any) {
      console.error('Scraping error:', err.message);
      
      if (err.code === 'ECONNABORTED') {
        return NextResponse.json({ success: false, error: 'Extraction timed out after 15 seconds' }, { status: 504 });
      }
      
      return NextResponse.json({ 
        success: false, 
        error: `Scraping failed: ${err.message}` 
      }, { status: 500 });
    }

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
