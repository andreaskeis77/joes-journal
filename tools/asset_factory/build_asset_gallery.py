from __future__ import annotations

import html
from pathlib import Path


IMAGE_EXTENSIONS = {".webp", ".png", ".jpg", ".jpeg", ".svg"}


def repo_root_from_script() -> Path:
    return Path(__file__).resolve().parents[2]


def is_asset_file(path: Path) -> bool:
    return path.suffix.lower() in IMAGE_EXTENSIONS


def rel_posix(path: Path, root: Path) -> str:
    return path.relative_to(root).as_posix()


def collect_assets(public_root: Path) -> list[Path]:
    paths: list[Path] = []

    asset_root = public_root / "assets"
    if asset_root.exists():
        paths.extend(path for path in asset_root.rglob("*") if path.is_file() and is_asset_file(path))

    for favicon_name in ["favicon-32.png", "favicon-192.png", "apple-touch-icon.png"]:
        favicon_path = public_root / favicon_name
        if favicon_path.exists():
            paths.append(favicon_path)

    return sorted(paths, key=lambda p: rel_posix(p, public_root))


def group_assets(paths: list[Path], public_root: Path) -> dict[str, list[Path]]:
    groups: dict[str, list[Path]] = {}

    for path in paths:
        rel = path.relative_to(public_root)
        parts = rel.parts

        if len(parts) >= 3 and parts[0] == "assets":
            group = parts[1]
        elif len(parts) >= 1:
            group = "root"
        else:
            group = "misc"

        groups.setdefault(group, []).append(path)

    return dict(sorted(groups.items()))


def build_card(path: Path, public_root: Path) -> str:
    rel = rel_posix(path, public_root)
    filename = path.name
    ext = path.suffix.lower().replace(".", "")
    web_src = "/" + rel

    escaped_rel = html.escape(rel)
    escaped_filename = html.escape(filename)
    escaped_ext = html.escape(ext.upper())

    return f"""
      <article class="asset-card">
        <div class="asset-preview">
          <img src="{html.escape(web_src)}" alt="{escaped_filename}" loading="lazy" />
        </div>
        <div class="asset-meta">
          <div class="asset-name" title="{escaped_filename}">{escaped_filename}</div>
          <div class="asset-path" title="{escaped_rel}">{escaped_rel}</div>
          <div class="asset-tags">
            <span>{escaped_ext}</span>
          </div>
        </div>
      </article>
"""


def build_html(groups: dict[str, list[Path]], public_root: Path) -> str:
    total = sum(len(paths) for paths in groups.values())

    nav = "\n".join(
        f'<a href="#group-{html.escape(group)}">{html.escape(group)} <span>{len(paths)}</span></a>'
        for group, paths in groups.items()
    )

    sections: list[str] = []

    for group, paths in groups.items():
        cards = "\n".join(build_card(path, public_root) for path in paths)
        sections.append(
            f"""
    <section class="asset-section" id="group-{html.escape(group)}">
      <header class="section-header">
        <h2>{html.escape(group)}</h2>
        <p>{len(paths)} assets</p>
      </header>
      <div class="asset-grid">
{cards}
      </div>
    </section>
"""
        )

    sections_html = "\n".join(sections)

    return f"""<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Joe Asset Gallery</title>
  <style>
    :root {{
      --joe-red: #B23A32;
      --umami-petrol: #2E7070;
      --bg-warm: #F5F3F1;
      --surface: #FFFFFF;
      --footer: #EDEBE9;
      --text: #222222;
      --text-muted: #5F5A56;
      --border: #DDD8D2;
      --shadow-card: 0 8px 24px rgba(34, 34, 34, 0.08);
      --shadow-panel: 0 18px 48px rgba(34, 34, 34, 0.12);
      --radius-lg: 14px;
      --radius-xl: 22px;
    }}

    * {{
      box-sizing: border-box;
    }}

    body {{
      margin: 0;
      font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: var(--text);
      background: var(--bg-warm);
      line-height: 1.5;
    }}

    .page {{
      max-width: 1440px;
      margin: 0 auto;
      padding: 32px;
    }}

    .hero {{
      background: linear-gradient(135deg, #ffffff 0%, #edeae6 100%);
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-panel);
      padding: 32px;
      margin-bottom: 24px;
    }}

    .eyebrow {{
      color: var(--umami-petrol);
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      font-size: 12px;
      margin-bottom: 8px;
    }}

    h1 {{
      margin: 0 0 8px;
      font-size: clamp(32px, 5vw, 56px);
      line-height: 1.1;
      letter-spacing: -0.03em;
    }}

    .summary {{
      color: var(--text-muted);
      font-size: 18px;
      max-width: 780px;
      margin: 0;
    }}

    .nav {{
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin: 24px 0 32px;
    }}

    .nav a {{
      display: inline-flex;
      gap: 8px;
      align-items: center;
      text-decoration: none;
      color: var(--text);
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 999px;
      padding: 8px 12px;
      font-size: 14px;
    }}

    .nav a span {{
      color: #fff;
      background: var(--joe-red);
      border-radius: 999px;
      padding: 1px 7px;
      font-size: 12px;
      font-weight: 700;
    }}

    .asset-section {{
      margin: 40px 0;
    }}

    .section-header {{
      display: flex;
      align-items: end;
      justify-content: space-between;
      gap: 16px;
      border-bottom: 1px solid var(--border);
      padding-bottom: 10px;
      margin-bottom: 18px;
    }}

    .section-header h2 {{
      margin: 0;
      font-size: 28px;
      letter-spacing: -0.02em;
    }}

    .section-header p {{
      margin: 0;
      color: var(--text-muted);
    }}

    .asset-grid {{
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 18px;
    }}

    .asset-card {{
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-card);
      overflow: hidden;
      min-width: 0;
    }}

    .asset-preview {{
      background:
        linear-gradient(45deg, #eee 25%, transparent 25%),
        linear-gradient(-45deg, #eee 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, #eee 75%),
        linear-gradient(-45deg, transparent 75%, #eee 75%);
      background-size: 20px 20px;
      background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
      min-height: 170px;
      display: grid;
      place-items: center;
      padding: 14px;
    }}

    .asset-preview img {{
      display: block;
      width: 100%;
      height: 170px;
      object-fit: contain;
      border-radius: 10px;
    }}

    .asset-meta {{
      padding: 12px;
      border-top: 1px solid var(--border);
    }}

    .asset-name {{
      font-weight: 700;
      font-size: 14px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-bottom: 4px;
    }}

    .asset-path {{
      color: var(--text-muted);
      font-size: 12px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-bottom: 8px;
    }}

    .asset-tags {{
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }}

    .asset-tags span {{
      font-size: 11px;
      font-weight: 700;
      color: var(--umami-petrol);
      background: rgba(46, 112, 112, 0.10);
      border-radius: 999px;
      padding: 2px 8px;
    }}

    @media (max-width: 700px) {{
      .page {{
        padding: 16px;
      }}

      .hero {{
        padding: 22px;
      }}

      .asset-grid {{
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      }}
    }}
  </style>
</head>
<body>
  <main class="page">
    <section class="hero">
      <div class="eyebrow">Zum Fettigen Joe · Asset Library</div>
      <h1>Asset Gallery</h1>
      <p class="summary">
        Lokale Übersicht über {total} generierte Bilder, SVG-Grafiken, Icons, Brand-Assets und Favicons.
        Quelle: <code>public/assets</code> und <code>public</code>.
      </p>
    </section>

    <nav class="nav">
{nav}
    </nav>

{sections_html}
  </main>
</body>
</html>
"""


def main() -> int:
    root = repo_root_from_script()
    public_root = root / "public"
    output_path = public_root / "asset-gallery.html"

    assets = collect_assets(public_root)
    groups = group_assets(assets, public_root)
    html_content = build_html(groups, public_root)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(html_content, encoding="utf-8")

    print(f"[OK] Wrote gallery: {output_path}")
    print(f"[DONE] Assets indexed: {len(assets)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())