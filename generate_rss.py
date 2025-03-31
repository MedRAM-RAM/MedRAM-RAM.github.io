#!/usr/bin/env python3
import requests
import xml.etree.ElementTree as ET
from xml.dom import minidom
import argparse

def format_file_size(bytes):
    """تحويل الحجم من البايت إلى الوحدة المناسبة"""
    if bytes >= 1073741824:
        return f"{bytes / 1073741824:.2f} GB"
    elif bytes >= 1048576:
        return f"{bytes / 1048576:.2f} MB"
    elif bytes >= 1024:
        return f"{bytes / 1024:.2f} KB"
    else:
        return f"{bytes} Bytes"

def fetch_torrents(imdb_id, page=1, results_per_page=30):
    """استدعاء API لجلب التورنتات بناءً على معرف IMDb ورقم الصفحة"""
    url = f"https://eztvx.to/api/get-torrents?imdb_id={imdb_id}&limit={results_per_page}&page={page}"
    response = requests.get(url)
    response.raise_for_status()
    return response.json()

def generate_rss_feed(torrents, feed_title="Torrent RSS Feed"):
    """بناء خلاصة RSS من بيانات التورنتات"""
    rss = ET.Element("rss", version="2.0")
    channel = ET.SubElement(rss, "channel")
    ET.SubElement(channel, "title").text = feed_title
    ET.SubElement(channel, "description").text = "خلاصة RSS لنتائج تورنت البحث"
    ET.SubElement(channel, "link").text = "https://yourwebsite.com"  # عدل الرابط حسب الحاجة

    for torrent in torrents:
        item = ET.SubElement(channel, "item")
        # استخدام عنوان التورنت كنص للعنصر
        title_text = torrent.get("title", "No Title")
        ET.SubElement(item, "title").text = title_text
        # وصف يتضمن حجم التورنت
        size = torrent.get("size_bytes", 0)
        ET.SubElement(item, "description").text = f"الحجم: {format_file_size(size)}"
        # الرابط الخاص بالتحميل (magnet)
        ET.SubElement(item, "link").text = torrent.get("magnet_url", "")
        # استخدام معرف التورنت أو العنوان كـ GUID
        guid = torrent.get("id", title_text)
        ET.SubElement(item, "guid").text = str(guid)
    
    # تنسيق XML بشكل منسق (pretty-print)
    xml_str = ET.tostring(rss, encoding='utf-8')
    parsed = minidom.parseString(xml_str)
    pretty_xml_str = parsed.toprettyxml(indent="  ")
    return pretty_xml_str

def main():
    parser = argparse.ArgumentParser(description="توليد خلاصة RSS من نتائج تورنت البحث")
    parser.add_argument("--imdb", required=True, help="معرف IMDb بدون بادئة 'tt'")
    parser.add_argument("--page", type=int, default=1, help="رقم الصفحة لنتائج البحث")
    parser.add_argument("--output", default="feed.xml", help="اسم ملف الخلاصة الناتج")
    args = parser.parse_args()

    results_per_page = 30
    data = fetch_torrents(args.imdb, page=args.page, results_per_page=results_per_page)
    torrents = data.get("torrents", [])
    
    if not torrents:
        print("لم يتم العثور على نتائج للتورنت.")
        return

    rss_feed = generate_rss_feed(torrents)
    
    with open(args.output, "w", encoding="utf-8") as f:
        f.write(rss_feed)
    print(f"تم إنشاء خلاصة RSS بـ {len(torrents)} عنصر وحفظها في {args.output}")

if __name__ == "__main__":
    main()