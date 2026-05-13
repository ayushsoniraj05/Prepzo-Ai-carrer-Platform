import urllib.request
from bs4 import BeautifulSoup
import json
import re

url = "https://t.me/s/TechUprise_Updates"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
response = urllib.request.urlopen(req)
html = response.read().decode('utf-8')

soup = BeautifulSoup(html, 'html.parser')
messages = soup.find_all('div', class_='tgme_widget_message_wrap')

jobs = []
for msg in messages:
    text_div = msg.find('div', class_='tgme_widget_message_text')
    date_time = msg.find('time')
    
    if text_div and date_time:
        text = text_div.get_text(separator=' ', strip=True)
        date = date_time.get('datetime', '')
        
        # We want to extract company, role etc., but for now let's just grab the whole text and date
        jobs.append({'date': date, 'text': text})

# Since we only want the last week, let's just dump them to a file to analyze
with open('c:/ai-career-platform-development/backend/scratch_jobs.json', 'w', encoding='utf-8') as f:
    json.dump(jobs, f, indent=2)

print(f"Scraped {len(jobs)} messages")
