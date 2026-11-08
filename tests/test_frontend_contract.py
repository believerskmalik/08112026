import hashlib
import json
import unittest
from pathlib import Path
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
BASELINE = json.loads((ROOT / 'tests/fixtures/preservation-baseline.json').read_text(encoding='utf-8'))


class FrontendContractTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.html = (ROOT / 'index.html').read_text(encoding='utf-8')
        cls.soup = BeautifulSoup(cls.html, 'html.parser')

    def test_visible_copy_is_preserved(self):
        for selector, expected in BASELINE['copy'].items():
            node = self.soup.select_one(selector)
            actual = node.get_text(' ', strip=True) if node else None
            self.assertEqual(actual, expected, f'Visible copy changed in {selector}')

    def test_original_media_bytes_are_preserved(self):
        for relative_path, expected_hash in BASELINE['media_sha256'].items():
            actual_hash = hashlib.sha256((ROOT / relative_path).read_bytes()).hexdigest()
            self.assertEqual(actual_hash, expected_hash, f'Media asset changed: {relative_path}')

    def test_tree_uses_intrinsic_canvas_coordinates_for_responsive_hit_testing(self):
        self.assertIn('var width = canvas[0].width;', self.html)
        self.assertIn('var height = canvas[0].height;', self.html)
        self.assertIn('getBoundingClientRect()', self.html)
        self.assertIn('width / rect.width', self.html)
        self.assertIn('height / rect.height', self.html)


    def test_media_loaders_wait_for_actual_asset_events(self):
        loader_script = self.html.split('<!-- Rose Background Generator & Gallery Image Loader -->', 1)[1]
        self.assertIn('Promise.all(', loader_script)
        self.assertIn('testImg.onload', loader_script)
        self.assertIn('testVideo.onloadedmetadata', loader_script)
        self.assertIn("testVideo.preload = 'metadata'", loader_script)
        self.assertNotIn('}, 2000);', loader_script)

    def test_media_loaders_preserve_numeric_order_and_prefer_one_extension(self):
        loader_script = self.html.split('<!-- Rose Background Generator & Gallery Image Loader -->', 1)[1]
        self.assertIn('function selectPreferredMedia(results)', loader_script)
        self.assertIn('extensionIndex', loader_script)
        self.assertIn('sort(function(a, b)', loader_script)


    def test_modal_state_keeps_scroll_locked_until_last_overlay_closes(self):
        gallery = (ROOT / 'file/gallery.js').read_text(encoding='utf-8')
        self.assertIn('function syncScrollLock()', gallery)
        self.assertIn("document.body.style.overflow = hasOpenModal ? 'hidden' : '';", gallery)
        self.assertNotIn("document.body.style.overflow = 'auto'", gallery)

    def test_video_modal_restores_only_previously_playing_background_audio(self):
        gallery = (ROOT / 'file/gallery.js').read_text(encoding='utf-8')
        self.assertIn('audioWasPlayingBeforeVideo', gallery)
        self.assertIn('!backgroundAudio.paused', gallery)
        self.assertIn('if (audioWasPlayingBeforeVideo)', gallery)

    def test_modals_have_accessible_dialog_metadata_and_keyboard_focus(self):
        for modal_id in ('gallery-modal', 'video-modal', 'letter-modal', 'closing-modal'):
            node = self.soup.select_one('#' + modal_id)
            self.assertIsNotNone(node)
            self.assertEqual(node.get('role'), 'dialog')
            self.assertEqual(node.get('aria-modal'), 'true')
            self.assertEqual(node.get('aria-hidden'), 'true')
        gallery = (ROOT / 'file/gallery.js').read_text(encoding='utf-8')
        self.assertIn("event.key !== 'Tab'", gallery)
        self.assertIn('returnFocusByModal', gallery)

    def test_gallery_supports_touch_swipe_and_empty_asset_fallback(self):
        gallery = (ROOT / 'file/gallery.js').read_text(encoding='utf-8')
        self.assertIn("addEventListener('touchstart'", gallery)
        self.assertIn("addEventListener('touchend'", gallery)
        self.assertIn('if (galleryModal)', gallery)
        self.assertIn('if (videoModal)', gallery)


    def test_icon_only_controls_have_accessible_names(self):
        expected = {
            'prev-btn': 'Previous photo',
            'next-btn': 'Next photo',
            'prev-video-btn': 'Previous video',
            'next-video-btn': 'Next video',
            'close-letter-btn': 'Close letter',
        }
        for element_id, label in expected.items():
            node = self.soup.select_one('#' + element_id)
            self.assertIsNotNone(node)
            self.assertEqual(node.get('aria-label'), label)

    def test_tree_seed_is_keyboard_accessible(self):
        canvas = self.soup.select_one('#canvas')
        self.assertEqual(canvas.get('role'), 'button')
        self.assertEqual(canvas.get('tabindex'), '0')
        self.assertTrue(canvas.get('aria-label'))
        self.assertIn("event.key === 'Enter'", self.html)
        self.assertIn("event.key === ' '", self.html)

    def test_media_discovery_updates_a_gallery_opened_before_assets_finish_loading(self):
        gallery = (ROOT / 'file/gallery.js').read_text(encoding='utf-8')
        self.assertRegex(gallery, r"(?s)setAllImages = function\(images\).*?galleryModal\.classList\.contains\('show'\).*?showSlide\(0\)")
        self.assertRegex(gallery, r"(?s)setAllVideos = function\(videos\).*?videoModal\.classList\.contains\('show'\).*?playVideo\(0\)")

    def test_page_uses_html5_language_and_safe_audio_playback(self):
        self.assertTrue(self.html.lstrip().lower().startswith('<!doctype html>'))
        self.assertIn('<html lang="en">', self.html)
        self.assertIn('<meta charset="UTF-8">', self.html)
        self.assertIn('playback.catch', self.html)

    def test_video_time_reset_is_guarded_until_metadata_exists(self):
        gallery = (ROOT / 'file/gallery.js').read_text(encoding='utf-8')
        self.assertIn('if (videoElement.readyState > 0)', gallery)

    def test_modified_frontend_assets_use_cache_busting_versions(self):
        self.assertIn('file/function.js?v=2', self.html)
        self.assertIn('file/gallery.js?v=2', self.html)
        self.assertIn('file/polish.css?v=2', self.html)

    def test_primary_actions_do_not_keep_the_legacy_attention_grabbing_pulse(self):
        css = (ROOT / 'file/polish.css').read_text(encoding='utf-8')
        self.assertRegex(css, r"(?s)\.gift-button\s*\{[^}]*animation:\s*none")

    def test_polish_stylesheet_is_loaded_after_legacy_styles(self):
        hrefs = [node.get('href', '') for node in self.soup.select('link[rel="stylesheet"]')]
        self.assertTrue(hrefs and hrefs[-1].split('?')[0].endswith('file/polish.css'))
        css = (ROOT / 'file/polish.css').read_text(encoding='utf-8')
        for token in ('--color-bg', '--color-rose', '--color-champagne', '--color-ivory'):
            self.assertIn(token, css)
        self.assertIn('@media (prefers-reduced-motion: reduce)', css)
        self.assertIn('@media (max-width: 767px)', css)


if __name__ == '__main__':
    unittest.main()
