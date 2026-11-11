import csv
import importlib.util
import json
import tempfile
import unittest
from argparse import Namespace
from pathlib import Path

spec = importlib.util.spec_from_file_location("offers", Path(__file__).resolve().parents[1] / "scripts/offers.py")
offers = importlib.util.module_from_spec(spec)
spec.loader.exec_module(offers)
URL = "https://www.ipertriscount.it/volantini/946-offerte"


class OffersTests(unittest.TestCase):
    def test_exact_store_card(self):
        html = f'<div><a href="/volantini/1-altro">Offerte</a><div>Solo Viterbo</div></div><div><a href="/volantini/946-offerte">Offerte</a><div>{offers.GROUP}</div></div>'
        self.assertEqual(offers.flyer_links(html), [URL])
        with self.assertRaises(ValueError):
            offers.flyer_links('<div><a href="/volantini/1-altro">Offerte</a><div>Casal Bertone</div></div>')

    def test_pages_are_deduplicated_and_contiguous(self):
        html = f'<h1>Offerte</h1><div>{offers.GROUP}</div>' + ''.join(f'<img src="/media/com_myegojwt/contents/flyers/946/test-page_{p:02d}.jpg">' for p in [1,1,2])
        flyer = offers.parse_flyer(html, URL)
        self.assertEqual(len(flyer['pages']), 2)
        with self.assertRaises(ValueError):
            offers.parse_flyer(html.replace('page_02', 'page_03'), URL)

    def test_csv_validation_and_atomic_failure(self):
        flyer = {'url': URL, 'pages': ['https://www.ipertriscount.it/page1.jpg']}
        row = dict(zip(offers.COLUMNS, [URL, offers.GROUP, '1', 'Prodotto di test', '', '1 kg', '1,99', '', 'Alimentari', '2026-11-01', '2026-11-15', '']))
        self.assertEqual(offers.validate_row(row, flyer, 2)['price'], 1.99)
        for field, value in [('price','NaN'),('price','-1'),('price','1.999'),('valid_until','2026-01-01'),('page','2'),('store_group','Altra sede')]:
            with self.subTest(field=field), self.assertRaises(ValueError):
                offers.validate_row({**row, field:value}, flyer, 2)
        with tempfile.TemporaryDirectory() as directory:
            catalog=Path(directory)/'offers.json'; source=Path(directory)/'offers.csv'
            original={'flyers':[flyer], 'offers':[], 'completeness':'partial'}
            offers.write_catalog(original,catalog)
            with source.open('w',encoding='utf-8',newline='') as file:
                writer=csv.DictWriter(file,fieldnames=offers.COLUMNS);writer.writeheader();writer.writerow({**row,'price':'NaN'})
            with self.assertRaises(ValueError):
                offers.import_csv(Namespace(csv=source,output=catalog,reviewed_pages='1'))
            self.assertEqual(json.loads(catalog.read_text()),original)

    def test_review_does_not_allow_missing_or_invalid_pages(self):
        self.assertEqual(offers.parse_pages('1,3-4',4),[1,3,4])
        with self.assertRaises(ValueError): offers.parse_pages('1-5',4)
        with self.assertRaises(ValueError): offers.parse_pages('4-1',4)

    def test_discount_without_invented_price(self):
        flyer = {'url': URL, 'pages': ['https://www.ipertriscount.it/page1.jpg']}
        row = dict(zip(offers.COLUMNS, [URL, offers.GROUP, '1', 'Pollo rurale', '', '', '', '', 'Carne', '2026-11-04', '2026-11-12', 'Sconto alle casse']))
        parsed = offers.validate_row({**row,'discount_percent':'10'},flyer,2)
        self.assertIsNone(parsed['price'])
        self.assertEqual(parsed['discount_percent'],10)
        with self.assertRaises(ValueError): offers.validate_row(row,flyer,2)

    def test_same_edition_preserves_transcription_and_local_snapshot(self):
        listing = f'<div><a href="/volantini/946-offerte">Offerte</a><div>{offers.GROUP}</div></div>'
        detail = f'<h1>Offerte</h1><div>{offers.GROUP}</div><img src="/media/com_myegojwt/contents/flyers/946/test-page_01.jpg?mcb=1">'
        with tempfile.TemporaryDirectory() as directory:
            folder=Path(directory); page=folder/'listing.html'; child=folder/'detail.html'; catalog=folder/'offers.json'
            page.write_text(listing,encoding='utf-8');child.write_text(detail,encoding='utf-8')
            flyer=offers.parse_flyer(detail,URL);flyer['local_pages']=['./flyers/946/page-01.jpg']
            offers.write_catalog({'flyers':[flyer],'offers':[{'id':'preserved'}],'completeness':'reviewed'},catalog)
            offers.discover(Namespace(listing_html=page,detail_html=child,output=catalog))
            result=offers.read_catalog(catalog)
            self.assertEqual(result['offers'],[{'id':'preserved'}])
            self.assertEqual(result['flyers'][0]['local_pages'],flyer['local_pages'])


if __name__ == '__main__': unittest.main()
