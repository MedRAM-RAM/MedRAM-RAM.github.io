import requests
import json
import xml.etree.ElementTree as ET
from datetime import datetime

# مفتاح API من OMDb (استبدله بمفتاحك الخاص)
OMDB_API_KEY = '9b8d2c00'
CONFIG_FILE = 'config.json'

# جلب معرف IMDb بناءً على اسم المسلسل
def get_imdb_id(title):
    try:
        response = requests.get(f'https://www.omdbapi.com/?t={title}&apikey={OMDB_API_KEY}')
        data = response.json()
        if data.get('Response') == 'True' and data.get('Type') == 'series':
            return data['imdbID'].replace('tt', '')
        return None
    except Exception as e:
        print(f'خطأ في جلب معرف IMDb: {e}')
        return None

# جلب التورنتات من EZTV
def fetch_torrents(imdb_id):
    try:
        response = requests.get(f'https://eztvx.to/api/get-torrents?imdb_id={imdb_id}&limit=30&page=1')
        data = response.json()
        return data.get('torrents', [])
    except Exception as e:
        print(f'خطأ في جلب التورنتات: {e}')
        return []

# إنشاء ملف RSS
def generate_rss(torrents):
    rss = ET.Element('rss', version='2.0')
    channel = ET.SubElement(rss, 'channel')
    ET.SubElement(channel, 'title').text = 'تورنتات EZTV للمسلسل'
    ET.SubElement(channel, 'link').text = 'https://medram-ram.github.io'
    ET.SubElement(channel, 'description').text = 'خلاصة RSS لتورنتات المسلسل المحدد'
    ET.SubElement(channel, 'lastBuildDate').text = datetime.utcnow().strftime('%a, %d %b %Y %H:%M:%S GMT')

    for torrent in torrents:
        item = ET.SubElement(channel, 'item')
        ET.SubElement(item, 'title').text = torrent['title']
        ET.SubElement(item, 'link').text = torrent['magnet_url']
        size_mb = round(torrent['size_bytes'] / 1048576, 2)
        ET.SubElement(item, 'description').text = f'الحجم: {size_mb} MB'
        pub_date = datetime.fromtimestamp(torrent['date_released_unix']).strftime('%a, %d %b %Y %H:%M:%S GMT')
        ET.SubElement(item, 'pubDate').text = pub_date

    tree = ET.ElementTree(rss)
    tree.write('rss.xml', encoding='utf-8', xml_declaration=True)

# الدالة الرئيسية
def main():
    with open(CONFIG_FILE, 'r') as f:
        config = json.load(f)
    imdb_id = config.get('imdbId')
    if not imdb_id and config.get('title'):
        imdb_id = get_imdb_id(config['title'])
    if imdb_id:
        torrents = fetch_torrents(imdb_id)
        if torrents:
            generate_rss(torrents)
            print('تم إنشاء ملف rss.xml بنجاح')
        else:
            print('لم يتم العثور على تورنتات')
    else:
        print('لم يتم العثور على معرف IMDb صالح')

if __name__ == '__main__':
    main()