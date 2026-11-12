"""Compila la trascrizione locale verificata del volantino 946 (4-12 novembre 2026)."""
import csv
import hashlib
import json
from argparse import Namespace
from pathlib import Path
import offers

ROOT = Path(__file__).resolve().parents[1]
FOLDER = "./flyers/946-20261102"


def main():
    catalog = offers.read_catalog()
    flyer = catalog["flyers"][0]
    if flyer["id"] != "946" or "20261102090207" not in flyer["pages"][0]:
        raise ValueError("Questa trascrizione appartiene esclusivamente all'edizione 946 del 4-12 novembre 2026.")
    rows = []
    for line, text in enumerate((ROOT / "data/catalogo-946.txt").read_text(encoding="utf-8").splitlines(), 1):
        if not text or text.startswith("#"):
            continue
        fields = text.split("|")
        if len(fields) not in (6, 7):
            raise ValueError(f"Riga {line}: numero di campi inatteso.")
        page, brand, name, size, price, category = fields[:6]
        conditions = fields[6] if len(fields) == 7 else ""
        only12 = conditions.startswith("SOLO12;")
        if only12:
            conditions = "Solo giovedì 12 novembre 2026; " + conditions.removeprefix("SOLO12; ")
        discount = ""
        if price.startswith("SCONTO"):
            discount, price = price.removeprefix("SCONTO"), ""
        rows.append(dict(zip(offers.COLUMNS + ["discount_percent"], [flyer["url"], offers.GROUP, page, name, brand, size, price,
            f"{price.replace('.', ',')} €/kg" if size == "al kg" else "", category, "2026-11-12" if only12 else "2026-11-04", "2026-11-12", conditions, discount])))
    target = ROOT / "data/catalogo-946.csv"
    with target.open("w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=offers.COLUMNS + ["discount_percent"])
        writer.writeheader()
        writer.writerows(rows)
    offers.import_csv(Namespace(csv=target, output=offers.CATALOG, reviewed_pages="1-20"))
    catalog = offers.read_catalog()
    flyer = catalog["flyers"][0]
    flyer.update(local_pages=[f"{FOLDER}/page-{page:02d}.jpg" for page in range(1,21)], local_pdf=f"{FOLDER}/volantino.pdf", valid_from="2026-11-04", valid_until="2026-11-12")
    regions = json.loads((ROOT / "data/flyer-regions-946.json").read_text(encoding="utf-8"))
    for offer in catalog["offers"]:
        offer["local_page"] = flyer["local_pages"][offer["page"] - 1]
        if offer["id"] not in regions:
            raise ValueError(f"Ritaglio mancante per {offer['brand']} {offer['name']}; verificare la mappa del volantino.")
        offer["region"] = regions[offer["id"]]
    catalog["analysis"] = {"method": "Trascrizione visiva pagina per pagina con supporto OCR Tesseract italiano locale, senza API a pagamento", "pages_reviewed": 20,
        "product_pages": list(range(1,20)), "initiative_pages": [20], "note": "Le varianti elencate nella stessa offerta sono raggruppate; le ripetizioni in copertina e all'interno conservano la propria pagina di origine."}
    catalog["promotions"] = [
        {"title": "Buoni spesa da 5 € ogni 40 € di spesa", "text": "Dal 5 al 12 novembre 2026, esclusi i mercoledì. Riservato ai possessori Fidelity Card; scontrino unico o multipli. I buoni si spendono solo nel punto vendita che li ha emessi. Regolamento nel punto vendita.", "page":20},
        {"title": "Mercoledì: sconto 10% sulla spesa, comprese le offerte", "text": "Riservato ai possessori Fidelity Card. Il mercoledì non si accettano buoni pasto. Lo sconto non viene applicato automaticamente ai prezzi della lista.", "page":20},
        {"title": "Acquista 2 prodotti petfood e ricevi un omaggio", "text": "Iniziativa a pagina 19: acquista 2 prodotti petfood e ricevi in cassa un omaggio per il tuo animale. Verifica disponibilità e condizioni nel punto vendita.", "page":19}
    ]
    manifest = {"source_url":flyer["url"],"pdf_source_url":flyer["pdf_url"],"store_group":offers.GROUP,"valid_from":flyer["valid_from"],"valid_until":flyer["valid_until"],"files":[]}
    for path in sorted((ROOT/"public/flyers/946-20261102").iterdir()):
        if path.suffix not in (".jpg", ".pdf"):
            continue
        manifest["files"].append({"name":path.name,"bytes":path.stat().st_size,"sha256":hashlib.sha256(path.read_bytes()).hexdigest()})
    (ROOT/"public/flyers/946-20261102/source.json").write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    offers.write_catalog(catalog)
    print(f"Catalogo compilato: {len(catalog['offers'])} offerte, 20 pagine archiviate, PDF e provenienza con checksum.")


if __name__ == "__main__":
    main()
