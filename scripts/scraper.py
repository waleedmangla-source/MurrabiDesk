import scrapy
from scrapy.crawler import CrawlerProcess
from scrapy import signals
from pydispatch import dispatcher
import json
import sys

class BetaSpider(scrapy.Spider):
    name = 'beta_spider'
    
    def __init__(self, url=None, *args, **kwargs):
        super(BetaSpider, self).__init__(*args, **kwargs)
        # Ensure URL has a scheme
        if url and not url.startswith(('http://', 'https://')):
            url = 'https://' + url
        self.start_urls = [url]
        self.results = {'success': False, 'error': 'No data extracted'}

    def parse(self, response):
        if response.status != 200:
            self.results = {
                'success': False, 
                'error': f'Site returned status code {response.status}',
                'status': response.status
            }
            return

        self.results = {
            'success': True,
            'title': response.css('title::text').get() or 'N/A',
            'h1': [h.strip() for h in response.css('h1::text').getall() if h.strip()],
            'meta_description': response.xpath("//meta[@name='description']/@content").get(),
            'links_count': len(response.css('a::attr(href)').getall()),
            'images_count': len(response.css('img::attr(src)').getall()),
            'text_preview': ' '.join(response.css('p::text').getall())[:500] + '...'
        }

def run_spider(url):
    results = {'success': False, 'error': 'Unknown error occurred'}
    
    # This collector will capture the results from the spider
    def crawler_results(signal, sender, item, response, spider):
        pass # We use spider.results instead

    process = CrawlerProcess({
        'USER_AGENT': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'LOG_LEVEL': 'ERROR',
        'TELNETCONSOLE_ENABLED': False,
        'ROBOTSTXT_OBEY': False, # Ignore robots.txt for beta testing
        'RETRY_ENABLED': True,
        'RETRY_TIMES': 2,
    })

    spider_instance = None
    
    # We'll use a signal to get the spider instance after it's finished
    def spider_closed(spider):
        nonlocal results
        results = spider.results

    dispatcher.connect(spider_closed, signal=signals.spider_closed)
    
    process.crawl(BetaSpider, url=url)
    process.start() # This blocks until finished
    
    return results

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({'success': False, 'error': 'No URL provided'}))
        sys.exit(1)
    
    target_url = sys.argv[1]
    
    try:
        final_results = run_spider(target_url)
        print(json.dumps(final_results))
    except Exception as e:
        print(json.dumps({'success': False, 'error': str(e)}))
