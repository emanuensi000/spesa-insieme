"""Compila l'edizione 20001 (13–23 novembre 2026) dalle fonti locali verificate."""
import csv
import hashlib
import json
import struct
from pathlib import Path

import offers
from flyer_regions_20001 import page_regions

ROOT = Path(__file__).resolve().parents[1]
FOLDER = "./flyers/20001-20261112"


def image_pdf(pages):
    """PDF locale con le immagini originali, senza ricompressione né dipendenze."""
    objects = [b"<< /Type /Catalog /Pages 2 0 R >>", b""]
    kids = []
    for path in pages:
        data = path.read_bytes()
        if data[:2] != b'\xff\xd8':
            raise ValueError(f"Immagine JPEG non valida: {path}")
        offset = 2
        while offset < len(data):
            marker = data[offset:offset + 2]
            length = struct.unpack('>H', data[offset + 2:offset + 4])[0]
            if marker in [b'\xff\xc0', b'\xff\xc1', b'\xff\xc2']:
                height, width = struct.unpack('>HH', data[offset + 5:offset + 9])
                break
            offset += 2 + length
        else:
            raise ValueError("Dimensioni JPEG mancanti")
        index = len(objects) + 1
        kids.append(f"{index} 0 R")
        objects.append(f"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 {width} {height}] /Resources << /XObject << /Im {index+1} 0 R >> >> /Contents {index+2} 0 R >>".encode())
        objects.append(f"<< /Type /XObject /Subtype /Image /Width {width} /Height {height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length {len(data)} >>\nstream\n".encode() + data + b"\nendstream")
        content = f"q {width} 0 0 {height} 0 0 cm /Im Do Q".encode()
        objects.append(f"<< /Length {len(content)} >>\nstream\n".encode() + content + b"\nendstream")
    objects[1] = f"<< /Type /Pages /Kids [{' '.join(kids)}] /Count {len(kids)} >>".encode()
    pdf = bytearray(b'%PDF-1.4\n%\xe2\xe3\xcf\xd3\n')
    offsets = [0]
    for index, obj in enumerate(objects, 1):
        offsets.append(len(pdf))
        pdf.extend(f"{index} 0 obj\n".encode() + obj + b"\nendobj\n")
    xref = len(pdf)
    pdf.extend(f"xref\n0 {len(offsets)}\n0000000000 65535 f \n".encode())
    for offset in offsets[1:]:
        pdf.extend(f"{offset:010d} 00000 n \n".encode())
    pdf.extend(f"trailer\n<< /Size {len(offsets)} /Root 1 0 R >>\nstartxref\n{xref}\n%%EOF\n".encode())
    return pdf


def main():
    flyer = json.loads((ROOT / 'data/flyer-20001.json').read_text(encoding='utf-8'))
    if (flyer['id'] != '20001' or flyer['store_group'] != offers.GROUP
            or len(flyer['pages']) != 20
            or any(f'/20001/20261112080058-page_{n:02d}.jpg' not in url
                   for n, url in enumerate(flyer['pages'], 1))):
        raise ValueError("La trascrizione richiede esclusivamente l'edizione 20001 verificata.")
    boxes, positions, rows, products = page_regions(), {}, [], []
    for line, text in enumerate((ROOT / 'data/catalogo-20001.txt').read_text(encoding='utf-8').splitlines(), 1):
        if not text or text.startswith('#'):
            continue
        fields = text.split('|')
        if len(fields) not in (6, 7):
            raise ValueError(f'Riga {line}: numero di campi inatteso')
        page, brand, name, size, price, category = fields[:6]
        conditions = fields[6] if len(fields) == 7 else ''
        special = conditions.startswith('SOLO23;')
        if special:
            conditions = 'Solo lunedì 23 novembre 2026; ' + conditions.removeprefix('SOLO23; ')
        unit = f"{price.replace('.', ',')} €/kg" if size == 'al kg' else f"{price.replace('.', ',')} €/100 g" if size == '100 g' else ''
        row = dict(zip(offers.COLUMNS, [flyer['url'], offers.GROUP, page, name, brand, size, price, unit, category,
                                       '2026-11-23' if special else '2026-11-13', '2026-11-23', conditions]))
        product = offers.validate_row(row, flyer, line)
        page = int(page)
        position = positions.get(page, 0)
        product.update(region=boxes[page][position], local_page=f'{FOLDER}/page-{page:02d}.jpg')
        positions[page] = position + 1
        rows.append(row)
        products.append(product)
    if len({p['id'] for p in products}) != len(products):
        raise ValueError('Offerte duplicate')
    if positions != {page: len(regions) for page, regions in boxes.items()}:
        raise ValueError(f'Ritagli e trascrizione non corrispondono: {positions}')
    flyer.update(local_pages=[f'{FOLDER}/page-{n:02d}.jpg' for n in range(1,21)], local_pdf=f'{FOLDER}/volantino.pdf')
    folder = ROOT / 'public' / FOLDER.removeprefix('./')
    (folder / 'volantino.pdf').write_bytes(image_pdf([ROOT / 'public' / p.removeprefix('./') for p in flyer['local_pages']]))
    manifest = {key: flyer[key] for key in ['url', 'pdf_url', 'listing_url', 'store_group', 'valid_from', 'valid_until']}
    manifest['pdf_note'] = 'PDF assemblato localmente dalle 20 immagini JPEG ufficiali senza ricompressione; il download PDF del sito ha restituito una pagina HTML di verifica.'
    manifest['files'] = [{'name': p.name, 'bytes': p.stat().st_size, 'sha256': hashlib.sha256(p.read_bytes()).hexdigest()}
                         for p in sorted(folder.iterdir()) if p.suffix in ['.jpg', '.pdf']]
    (folder / 'source.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    with (ROOT / 'data/catalogo-20001.csv').open('w', encoding='utf-8', newline='') as file:
        writer = csv.DictWriter(file, fieldnames=offers.COLUMNS)
        writer.writeheader()
        writer.writerows(rows)
    (ROOT / 'data/flyer-regions-20001.json').write_text(json.dumps({p['id']: p['region'] for p in products}, indent=2) + '\n', encoding='utf-8')
    catalog = dict(schema_version=1, store_group=offers.GROUP, discovered_at=offers.now(), imported_at=offers.now(),
                   completeness='reviewed', reviewed_pages=list(range(1,21)), flyers=[flyer], offers=products,
                   analysis={'method': 'Trascrizione visiva delle 20 pagine ufficiali con controllo di prezzi, formati e condizioni',
                             'pages_reviewed': 20, 'product_pages': list(range(1,21)), 'initiative_pages': [7,18,19,20],
                             'note': 'Varianti della stessa offerta raggruppate; ripetizioni in copertina e sul retro conservate con la propria pagina di origine.'},
                   promotions=[
                       {'title': 'Mercoledì: sconto 10% sulla spesa, comprese le offerte', 'text': 'Riservato ai possessori Fidelity Card nei tre punti vendita indicati. Il mercoledì non si accettano buoni pasto. Lo sconto non è applicato automaticamente ai prezzi della lista.', 'page': 1},
                       {'title': 'Acquista 2 prodotti petfood e ricevi un omaggio', 'text': 'Omaggio in cassa per il tuo animale; verificare disponibilità e condizioni nel punto vendita.', 'page': 19},
                       {'title': 'Raccolta punti Aeternum', 'text': 'Dal 13 novembre 2026 al 31 gennaio 2027 per i possessori Fidelity Card; lunedì punti doppi. Regolamento nel punto vendita.', 'page': 20},
                       {'title': 'Carta Dedicata a Te: coupon del 15%', 'text': 'Coupon pari al 15% della spesa pagata con Carta Dedicata a Te, da spendere sulla spesa successiva. Verificare condizioni nel punto vendita.', 'page': 20},
                   ])
    offers.write_catalog(catalog)
    print(f'Catalogo 20001: {len(products)} offerte, 20 pagine e PDF offline.')


if __name__ == '__main__':
    main()
