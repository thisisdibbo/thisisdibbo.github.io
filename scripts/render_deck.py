"""Turn a case-competition PDF into slides for the site's deck viewer.

Usage:
    pip install pymupdf pillow
    python scripts/render_deck.py path/to/deck.pdf my-deck

Writes public/decks/my-deck/01.webp, 02.webp, ... and a recompressed
public/decks/my-deck.pdf, then prints the line to add to src/content.ts.
"""

import io
import os
import sys

import pymupdf
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def main(src: str, slug: str) -> None:
    out = os.path.join(ROOT, "public", "decks", slug)
    os.makedirs(out, exist_ok=True)
    doc = pymupdf.open(src)
    for i, page in enumerate(doc):
        landscape = page.rect.width >= page.rect.height
        zoom = (1600 if landscape else 1100) / page.rect.width
        pix = page.get_pixmap(matrix=pymupdf.Matrix(zoom, zoom), alpha=False)
        image = Image.open(io.BytesIO(pix.tobytes("png"))).convert("RGB")
        image.save(os.path.join(out, f"{i + 1:02d}.webp"), "WEBP", quality=72, method=5)

    first = doc[0].rect
    ratio = "SLIDES" if first.width >= first.height else "LETTER"
    doc.rewrite_images(dpi_threshold=160, dpi_target=150, quality=70)
    doc.save(os.path.join(ROOT, "public", "decks", f"{slug}.pdf"), garbage=4, deflate=True, clean=True)

    print(f"Rendered {doc.page_count} slides to public/decks/{slug}/")
    print(f"Add to the case in src/content.ts:  decks: [{{ slug: '{slug}', pages: {doc.page_count}, ratio: {ratio} }}],")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2])
