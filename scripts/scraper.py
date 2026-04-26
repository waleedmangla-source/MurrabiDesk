import scrapy
from scrapy.crawler import CrawlerProcess
import json
import sys

class BetaSpider(scrapy.Spider):
    name = 'beta_spider'
    
    def __init__(self, url=None, *args, **kwargs):
        super(BetaSpider, self).__init__(*args, **kwargs)
        self.start_urls = [url]
        self.results = {}

    def parse(self, response):
        self.results = {
            'title': response.css('title::text').get(),
            'h1': response.css('h1::text').getall(),
            'meta_description': response.xpath("//meta[@name='description']/@content").get(),
            'links_count': len(response.css('a::attr(href)').getall()),
            'images_count': len(response.css('img::attr(src)').getall()),
            'text_preview': ' '.join(response.css('p::text').getall())[:500] + '...'
        }
        # Print results as JSON so the parent process can read it
        print(json.dumps(self.results))

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'No URL provided'}))
        sys.exit(1)
    
    target_url = sys.argv[1]
    
    process = CrawlerProcess({
        'USER_AGENT': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'LOG_LEVEL': 'ERROR'
    })
    
    process.crawl(BetaSpider, url=target_url)
    process.start()
