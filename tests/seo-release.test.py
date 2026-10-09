"""Exercise release checks against accidental SEO regressions in built output."""
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]


class SEOReleaseTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        subprocess.run(['python3', 'scripts/build-site.py'], cwd=ROOT, check=True)

    def check_mutation(self, filename, mutate, expected):
        with tempfile.TemporaryDirectory() as directory:
            site = Path(directory) / 'site'
            shutil.copytree(ROOT / '_site', site)
            file = site / filename
            file.write_text(mutate(file.read_text()))
            result = subprocess.run(['python3', str(ROOT / 'scripts/check-site.py'), str(site)],
                                    capture_output=True, text=True)
            self.assertEqual(result.returncode, 1, result.stdout + result.stderr)
            self.assertIn(expected, result.stdout)

    def test_social_url_drift(self):
        self.check_mutation('index.html', lambda text: text.replace(
            'property="og:url" content="https://lchaimlyrics.com/"',
            'property="og:url" content="https://lchaimlyrics.com/wrong.html"'),
            'og:url must match canonical')

    def test_missing_social_image(self):
        self.check_mutation('index.html', lambda text: text.replace(
            'property="og:image"', 'property="removed:image"'), 'missing og:image')

    def test_missing_structured_data(self):
        self.check_mutation('index.html', lambda text: text.replace(
            'type="application/ld+json"', 'type="application/json"'), 'missing JSON-LD')

    def test_blocked_indexable_pages(self):
        self.check_mutation('robots.txt', lambda text: text.replace('Allow: /', 'Disallow: /'),
                            'Googlebot blocked indexable URL')

    def test_googlebot_specific_block(self):
        self.check_mutation('robots.txt', lambda text: text + '\nUser-agent: Googlebot\nDisallow: /blog/\n',
                            'Googlebot blocked indexable URL https://lchaimlyrics.com/blog/')

    def test_missing_sitemap_declaration(self):
        self.check_mutation('robots.txt', lambda text: text.replace('Sitemap:', '# Sitemap:'),
                            'missing canonical sitemap declaration')


if __name__ == '__main__':
    unittest.main()
