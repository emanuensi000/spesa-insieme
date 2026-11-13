"""Scoperta del solo volantino autorizzato e importazione manuale CSV. Solo stdlib."""
import argparse
import csv
import hashlib
import json
import re
from datetime import date, datetime, timezone
from decimal import Decimal, InvalidOperation
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlparse
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "public/data/offers.json"
GROUP = "Casal Bertone - Fonte Nuova - Guidonia"
SOURCE = "https://www.ipertriscount.it/volantini"
COLUMNS = ["flyer_url", "store_group", "page", "name", "brand", "size", "price", "unit_price", "category", "valid_from", "valid_until", "conditions"]


def now():
    return datetime.now(timezone.utc).isoformat()


def source_url(value):
    url = urlparse(value)
    if url.scheme != "https" or url.hostname not in {"ipertriscount.it", "www.ipertriscount.it"} or url.username or url.password or url.port not in (None, 443):
        raise ValueError("Il collegamento deve appartenere al sito HTTPS Ipertriscount.")
    return value


class Node:
    def __init__(self, tag="", attrs=(), parent=None):
        self.tag, self.attrs, self.parent, self.children = tag, dict(attrs), parent, []

    def text(self):
        return " ".join(" ".join(child.text() if isinstance(child, Node) else child for child in self.children).split())

    def walk(self):
        yield self
        for child in self.children:
            if isinstance(child, Node):
                yield from child.walk()


class Tree(HTMLParser):
    VOID = {"img", "meta", "link", "br", "hr", "input", "source", "area", "base", "embed", "param", "wbr", "col", "track"}

    def __init__(self, html):
        super().__init__(convert_charrefs=True)
        self.root = self.current = Node()
        self.feed(html)

    def handle_starttag(self, tag, attrs):
        node = Node(tag, attrs, self.current)
        self.current.children.append(node)
        if tag not in self.VOID:
            self.current = node

    def handle_startendtag(self, tag, attrs):
        node = Node(tag, attrs, self.current)
        self.current.children.append(node)

    def handle_endtag(self, tag):
        cursor = self.current
        while cursor.parent:
            if cursor.tag == tag:
                self.current = cursor.parent
                break
            cursor = cursor.parent

    def handle_data(self, data):
        self.current.children.append(data)


def flyer_links(html, base=SOURCE):
    """L'etichetta deve coincidere integralmente, non basta contenere una delle città."""
    tree = Tree(html)
    links = set()
    for node in tree.root.walk():
        if node.tag not in {"div", "p", "span"} or node.text() != GROUP:
            continue
        cursor = node
        while cursor.parent:
            candidates = {
                source_url(urljoin(base, child.attrs["href"]))
                for child in cursor.walk()
                if child.tag == "a" and re.search(r"/volantini/(?:item/)?\d+[-/]", child.attrs.get("href", ""))
            }
            if candidates:
                # Una card può avere più link allo stesso dettaglio, mai a sedi diverse.
                if len(candidates) != 1:
                    raise ValueError("Struttura delle sedi ambigua: importazione interrotta.")
                links.update(candidates)
                break
            cursor = cursor.parent
    if not links:
        raise ValueError("Nessun volantino trovato per il gruppo esatto. Nessun altro negozio verrà usato.")
    return sorted(links)


def parse_flyer(html, url, *, group_confirmed=False):
    tree = Tree(html)
    if not group_confirmed and not any(node.text() == GROUP for node in tree.root.walk() if node.tag in {"div", "p", "span"}):
        raise ValueError("La pagina del volantino non conferma il gruppo richiesto.")
    match = re.search(r"/volantini/(?:item/)?(\d+)[-/]", url)
    if not match:
        raise ValueError("Identificativo del volantino non riconosciuto.")
    identifier = match[1]
    pages, pdf = {}, None
    for node in tree.root.walk():
        if node.tag == "img":
            image = urljoin(url, node.attrs.get("src", ""))
            pattern = rf"/contents/flyers/{identifier}/[^/]*page_(\d+)\.(?:jpg|png|webp)$"
            page = re.search(pattern, urlparse(image).path, re.I)
            if page:
                # Il parametro mcb cambia a ogni visita: non identifica una nuova edizione.
                pages[int(page[1])] = source_url(image.split("?", 1)[0])
        if node.tag == "a":
            link = urljoin(url, node.attrs.get("href", ""))
            if "pdf=1" in link or urlparse(link).path.lower().endswith(".pdf"):
                pdf = source_url(link)
    if not pages or sorted(pages) != list(range(1, max(pages) + 1)):
        raise ValueError("Le pagine del volantino mancano o non sono consecutive.")
    titles = [node.text() for node in tree.root.walk() if node.tag == "h1"]
    return {"id": identifier, "title": titles[-1] if titles else "Volantino", "store_group": GROUP, "url": url, "pdf_url": pdf, "pages": [pages[n] for n in sorted(pages)]}


def fetch(url):
    request = Request(source_url(url), headers={"User-Agent": "OrganAIzer/0.1 (personal shopping list; daily flyer discovery)", "Accept": "text/html"})
    with urlopen(request, timeout=35) as response:
        source_url(response.url)
        data = response.read(5_000_001)
        if len(data) > 5_000_000:
            raise ValueError("Pagina troppo grande.")
        return data.decode("utf-8")


def read_catalog(path=CATALOG):
    if path.exists():
        return json.loads(path.read_text(encoding="utf-8"))
    return {"schema_version": 1, "store_group": GROUP, "offers": [], "flyers": [], "completeness": "partial", "reviewed_pages": [], "imported_at": None}


def write_catalog(catalog, path=CATALOG):
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(".tmp")
    temporary.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    temporary.replace(path)


def discover(args):
    listing = Path(args.listing_html).read_text(encoding="utf-8") if args.listing_html else fetch(SOURCE)
    links = flyer_links(listing)
    if args.detail_html and len(links) != 1:
        raise ValueError("Il file dettaglio locale richiede esattamente un volantino.")
    # La nuova pagina dettaglio non ripete le sedi: la card esatta nell'elenco
    # ufficiale conferma il gruppo per questo URL, senza ripieghi su altre sedi.
    flyers = [parse_flyer(Path(args.detail_html).read_text(encoding="utf-8") if args.detail_html else fetch(url), url, group_confirmed=True) for url in links]
    catalog = read_catalog(args.output)
    source_fields = ["id", "store_group", "url", "pdf_url", "pages"]
    signature = lambda values: [{key: flyer.get(key) for key in source_fields} for flyer in values]
    if signature(catalog.get("flyers", [])) != signature(flyers):
        # Conserva gli import solo quando l'intera fonte, comprese le immagini, è invariata.
        catalog.update(offers=[], completeness="partial", reviewed_pages=[], imported_at=None, promotions=[], analysis=None)
    else:
        previous = {flyer["url"]: flyer for flyer in catalog.get("flyers", [])}
        for flyer in flyers:
            for key in ["local_pages", "local_pdf", "valid_from", "valid_until"]:
                if key in previous[flyer["url"]]:
                    flyer[key] = previous[flyer["url"]][key]
    catalog.update(schema_version=1, store_group=GROUP, discovered_at=now(), flyers=flyers)
    write_catalog(catalog, args.output)
    print(f"Scoperti {len(flyers)} volantini, {sum(len(f['pages']) for f in flyers)} pagine. Sede: {GROUP}")


def parse_pages(value, total):
    if not value:
        return []
    numbers = set()
    for part in value.split(","):
        limits = part.strip().split("-")
        if len(limits) == 1:
            numbers.add(int(limits[0]))
        elif len(limits) == 2:
            start, end = map(int, limits)
            if end < start:
                raise ValueError("Intervallo di pagine non valido.")
            numbers.update(range(start, end + 1))
        else:
            raise ValueError("Intervallo di pagine non valido.")
    if not numbers.issubset(set(range(1, total + 1))):
        raise ValueError("Pagina revisionata fuori dal volantino.")
    return sorted(numbers)


def validate_row(row, flyer, line):
    if row["store_group"] != GROUP or row["flyer_url"] != flyer["url"]:
        raise ValueError(f"Riga {line}: sede o volantino non corrispondenti.")
    page = int(row["page"])
    if not 1 <= page <= len(flyer["pages"]):
        raise ValueError(f"Riga {line}: pagina inesistente.")
    if not row["name"] or len(row["name"]) > 160 or not row["category"]:
        raise ValueError(f"Riga {line}: nome/reparto mancanti o troppo lunghi.")
    if any(len(value) > 500 for value in row.values()):
        raise ValueError(f"Riga {line}: campo troppo lungo.")
    discount = row.get("discount_percent", "")
    if discount and (not discount.isdigit() or not 1 <= int(discount) <= 100):
        raise ValueError(f"Riga {line}: sconto percentuale non valido.")
    try:
        price = Decimal(row["price"].replace(",", ".")) if row["price"] else None
    except InvalidOperation as error:
        raise ValueError(f"Riga {line}: prezzo non valido.") from error
    if price is None and not discount:
        raise ValueError(f"Riga {line}: indicare prezzo o sconto percentuale.")
    if price is not None and (not price.is_finite() or not Decimal("0") < price <= Decimal("10000") or price.as_tuple().exponent < -2):
        raise ValueError(f"Riga {line}: prezzo fuori intervallo o con più di due decimali.")
    start, end = date.fromisoformat(row["valid_from"]), date.fromisoformat(row["valid_until"])
    if start > end or (end - start).days > 366:
        raise ValueError(f"Riga {line}: intervallo di validità non coerente.")
    identity = "|".join(row[key] for key in ["flyer_url", "page", "name", "brand", "size", "valid_from", "valid_until", "conditions", "price"])
    return {"id": hashlib.sha256(identity.encode()).hexdigest()[:24], "source_url": flyer["pages"][page - 1], "flyer_url": flyer["url"], "store_group": GROUP, "page": page,
            **{key: row[key] for key in ["name", "brand", "size", "unit_price", "category", "valid_from", "valid_until", "conditions"]}, "price": float(price) if price is not None else None,
            "discount_percent": int(discount) if discount else None}


def import_csv(args):
    catalog = read_catalog(args.output)
    flyers = catalog.get("flyers", [])
    if len(flyers) != 1:
        raise ValueError("Importazione CSV: prima scopri un singolo volantino del gruppo richiesto.")
    flyer = flyers[0]
    offers, seen = [], set()
    with args.csv.open(encoding="utf-8-sig", newline="") as file:
        reader = csv.DictReader(file)
        if reader.fieldnames not in [COLUMNS, COLUMNS + ["discount_percent"]]:
            raise ValueError("Intestazioni CSV non valide: usa data/offers.template.csv (separatore virgola).")
        for line, raw in enumerate(reader, 2):
            if None in raw or any(value is None for value in raw.values()):
                raise ValueError(f"Riga {line}: numero di colonne errato.")
            row = {key: value.strip() for key, value in raw.items()}
            offer = validate_row(row, flyer, line)
            if offer["id"] in seen:
                raise ValueError(f"Riga {line}: offerta duplicata.")
            seen.add(offer["id"])
            offers.append(offer)
    reviewed = parse_pages(args.reviewed_pages, len(flyer["pages"]))
    complete = reviewed == list(range(1, len(flyer["pages"]) + 1))
    if complete and not offers:
        raise ValueError("Un catalogo senza prodotti non può essere dichiarato completo.")
    catalog.update(offers=offers, reviewed_pages=reviewed, completeness="reviewed" if complete else "partial", imported_at=now())
    write_catalog(catalog, args.output)
    print(f"Importati {len(offers)} prodotti. Pagine dichiarate revisionate: {len(reviewed)}/{len(flyer['pages'])}.")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="command", required=True)
    discovery = sub.add_parser("discover")
    discovery.add_argument("--listing-html", help="HTML locale per verifica offline")
    discovery.add_argument("--detail-html", help="HTML dettaglio locale per verifica offline")
    discovery.add_argument("--output", type=Path, default=CATALOG)
    discovery.set_defaults(run=discover)
    importer = sub.add_parser("import")
    importer.add_argument("csv", type=Path)
    importer.add_argument("--reviewed-pages", default="", help="Pagine trascritte e controllate, es. 1-20 oppure 1,2,5-8")
    importer.add_argument("--output", type=Path, default=CATALOG)
    importer.set_defaults(run=import_csv)
    args = parser.parse_args()
    try:
        args.run(args)
    except (ValueError, OSError, KeyError) as error:
        parser.exit(1, f"Importazione interrotta: {error}\nIl catalogo precedente non è stato sovrascritto.\n")


if __name__ == "__main__":
    main()
