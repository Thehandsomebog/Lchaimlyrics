#!/usr/bin/env python3
"""Read-only release checks for the generated static site."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urljoin, urlparse, unquote
from collections import Counter
import json
import re
import sys
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
SITE = Path(sys.argv[1] if len(sys.argv) > 1 else '_site').resolve()
ORIGIN = 'https://lchaimlyrics.com/'


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags, self.ids, self.links, self.jsons = [], [], [], []
        self.title, self.json_text = '', ''
        self.in_title = self.in_json = False

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        self.tags.append((tag, a))
        if a.get('id'):
            self.ids.append(a['id'])
        for key in ('href', 'src', 'data-audio'):
            if a.get(key):
                self.links.append((key, a[key]))
        if tag == 'title':
            self.in_title = True
        if tag == 'script' and a.get('type') == 'application/ld+json':
            self.in_json, self.json_text = True, ''

    def handle_data(self, data):
        if self.in_title:
            self.title += data
        if self.in_json:
            self.json_text += data

    def handle_endtag(self, tag):
        if tag == 'title':
            self.in_title = False
        if tag == 'script' and self.in_json:
            self.jsons.append(self.json_text)
            self.in_json = False


errors = []
def require(condition, message):
    if not condition:
        errors.append(message)


paths = json.loads((ROOT / 'config/public-pages.json').read_text())
pricing = json.loads((ROOT / 'config/packages.json').read_text())
pages, titles, descriptions, indexable = {}, [], [], set()
for path in paths:
    file = SITE / path
    require(file.is_file(), f'Missing public page: {path}')
    if not file.is_file():
        continue
    html = file.read_text()
    p = Page()
    p.feed(html)
    pages[path] = p
    meta = {a.get('name'): a.get('content', '') for t, a in p.tags if t == 'meta'}
    require(10 <= len(p.title.strip()) <= 60, f'{path}: title length {len(p.title)}')
    require(70 <= len(meta.get('description', '')) <= 160, f'{path}: description length {len(meta.get("description", ""))}')
    require(sum(t == 'h1' for t, a in p.tags) == 1, f'{path}: requires exactly one h1')
    require(sum(t == 'main' for t, a in p.tags) == 1, f'{path}: requires exactly one main')
    require('main-content' in p.ids and 'class="skip-link"' in html, f'{path}: missing skip navigation')
    require(len(p.ids) == len(set(p.ids)), f'{path}: duplicate IDs')
    canonical = [a.get('href') for t, a in p.tags if t == 'link' and a.get('rel') == 'canonical']
    expected_url = ORIGIN + path.removesuffix('index.html')
    require(canonical == [expected_url], f'{path}: canonical {canonical} != {expected_url}')
    for t, a in p.tags:
        if t == 'img':
            require('alt' in a, f'{path}: image missing alt')
        if t == 'html':
            require(a.get('lang') == 'en', f'{path}: source language must match English copy')
    for data in p.jsons:
        try:
            json.loads(data)
        except json.JSONDecodeError as error:
            errors.append(f'{path}: invalid JSON-LD: {error}')
    if 'noindex' not in meta.get('robots', ''):
        titles.append(p.title)
        descriptions.append(meta.get('description'))
        indexable.add(expected_url)
    for key, body in re.findall(r'<!-- package-price:([a-z-]+) -->(.*?)<!-- /package-price -->', html, re.S):
        price = pricing['packages'][key]['price']
        require(f'${price}' in body and pricing['currency'] in body, f'{path}: wrong price for {key}')
    if path != 'index.html':
        require('js/languages.js' not in html, f'{path}: homepage-only translations loaded')
    if path == 'thank-you.html':
        require('googletagmanager' not in html and 'gtag(' not in html, 'Unverified return page must not trigger page-load conversions')
        require('Your order is confirmed' not in html, 'Unverified payment confirmation copy')

for path, p in pages.items():
    for kind, url in p.links:
        u = urlparse(urljoin(ORIGIN + path, url))
        if u.scheme not in ('http', 'https') or u.netloc != 'lchaimlyrics.com':
            continue
        target = unquote(u.path).lstrip('/')
        if not target or target.endswith('/'):
            target += 'index.html'
        require((SITE / target).is_file(), f'{path}: missing {url}')
        if kind == 'href' and u.fragment and target in pages:
            require(unquote(u.fragment) in pages[target].ids, f'{path}: broken fragment {url}')
for label, values in [('title', titles), ('description', descriptions)]:
    require(len(values) == len(set(values)), f'Duplicate indexable {label}')
sitemap = [node.text for node in ET.parse(SITE / 'sitemap.xml').findall('.//{*}loc')]
require(len(sitemap) == len(set(sitemap)), 'Duplicate sitemap URLs')
require(set(sitemap) == indexable, f'Sitemap mismatch: {set(sitemap) ^ indexable}')
for file in SITE.rglob('*'):
    if file.is_file():
        rel = file.relative_to(SITE).as_posix()
        require(not rel.endswith(('.md', '.py', '.json', '.yml', '.cjs')), f'Non-public file in artifact: {rel}')

if errors:
    print('\n'.join(errors))
    sys.exit(1)
print(f'PASS: {len(pages)} pages; {len(indexable)} indexable URLs; metadata, landmarks, links, assets, JSON-LD, prices and public-only artifact.')
