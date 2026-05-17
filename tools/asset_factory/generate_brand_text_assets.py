from __future__ import annotations

from pathlib import Path


JOE_RED = "#B23A32"
UMAMI_PETROL = "#2E7070"
TEXT = "#222222"
MUTED = "#5F5A56"


def repo_root_from_script() -> Path:
    return Path(__file__).resolve().parents[2]


def write(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content.strip() + "\n", encoding="utf-8")
    print(f"[OK] {path}")


def wordmark_svg() -> str:
    return f"""
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 140" role="img" aria-label="Zum Fettigen Joe">
  <title>Zum Fettigen Joe</title>
  <text x="8" y="84"
        fill="{TEXT}"
        font-family="Poppins, Inter, system-ui, sans-serif"
        font-size="68"
        font-weight="700"
        letter-spacing="-2">
    Zum Fettigen Joe
  </text>
  <path d="M12 112 H292"
        fill="none"
        stroke="{JOE_RED}"
        stroke-width="8"
        stroke-linecap="round"/>
  <path d="M316 112 H426"
        fill="none"
        stroke="{UMAMI_PETROL}"
        stroke-width="8"
        stroke-linecap="round"/>
</svg>
"""


def signature_svg() -> str:
    return f"""
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 64" role="img" aria-label="powered by umami">
  <title>powered by umami</title>
  <text x="8" y="38"
        fill="{MUTED}"
        font-family="Inter, system-ui, sans-serif"
        font-size="22"
        font-weight="500"
        letter-spacing="0.2">
    powered by
  </text>
  <text x="132" y="38"
        fill="{UMAMI_PETROL}"
        font-family="Poppins, Inter, system-ui, sans-serif"
        font-size="28"
        font-weight="700"
        letter-spacing="-0.8">
    umami
  </text>
  <circle cx="328" cy="31" r="6" fill="{JOE_RED}"/>
</svg>
"""


def lockup_svg() -> str:
    return f"""
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 820 210" role="img" aria-label="Zum Fettigen Joe powered by umami">
  <title>Zum Fettigen Joe powered by umami</title>
  <rect width="820" height="210" rx="28" fill="none"/>
  <text x="8" y="88"
        fill="{TEXT}"
        font-family="Poppins, Inter, system-ui, sans-serif"
        font-size="72"
        font-weight="700"
        letter-spacing="-2.2">
    Zum Fettigen Joe
  </text>
  <path d="M12 118 H302"
        fill="none"
        stroke="{JOE_RED}"
        stroke-width="8"
        stroke-linecap="round"/>
  <path d="M326 118 H444"
        fill="none"
        stroke="{UMAMI_PETROL}"
        stroke-width="8"
        stroke-linecap="round"/>
  <text x="10" y="166"
        fill="{MUTED}"
        font-family="Inter, system-ui, sans-serif"
        font-size="24"
        font-weight="500">
    Ein persönliches Journal über Restaurants, Küche, Cocktails und guten Geschmack.
  </text>
  <text x="10" y="198"
        fill="{UMAMI_PETROL}"
        font-family="Inter, system-ui, sans-serif"
        font-size="20"
        font-weight="700">
    powered by umami
  </text>
</svg>
"""


def main() -> int:
    root = repo_root_from_script()
    brand_dir = root / "public" / "assets" / "brand"

    write(brand_dir / "brand-wordmark-zum-fettigen-joe-primary.svg", wordmark_svg())
    write(brand_dir / "brand-signature-powered-by-umami.svg", signature_svg())
    write(brand_dir / "brand-wordmark-lockup-primary.svg", lockup_svg())

    print("[DONE] Brand text SVG assets generated.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())