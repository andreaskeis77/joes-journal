from __future__ import annotations

import argparse
from pathlib import Path
from typing import Any

import yaml
from PIL import Image


def repo_root_from_script() -> Path:
    # tools/asset_factory/inventory_assets.py -> repo root
    return Path(__file__).resolve().parents[2]


def load_manifest(path: Path) -> dict[str, Any]:
    if not path.exists():
        raise FileNotFoundError(f"Manifest not found: {path}")

    with path.open("r", encoding="utf-8") as f:
        data = yaml.safe_load(f)

    if not isinstance(data, dict):
        raise ValueError("Manifest root must be a YAML object.")

    return data


def image_dimensions(path: Path) -> tuple[int | None, int | None]:
    if not path.exists():
        return None, None

    try:
        with Image.open(path) as img:
            return img.size
    except Exception:
        return None, None


def md_escape(value: Any) -> str:
    if value is None:
        return ""
    return str(value).replace("|", "\\|").replace("\n", " ").strip()


def build_inventory_markdown(
    *,
    manifest: dict[str, Any],
    output_root: Path,
) -> str:
    project = manifest.get("project", "unknown")
    brand = manifest.get("brand", "unknown")
    assets = manifest.get("assets", [])

    if not isinstance(assets, list):
        raise ValueError("'assets' must be a list.")

    lines: list[str] = []

    lines.append(f"# Asset Inventory – {project}")
    lines.append("")
    lines.append(f"**Brand:** {brand}")
    lines.append("")
    lines.append("Diese Datei wird aus `tools/asset_factory/assets.yaml` erzeugt.")
    lines.append("Sie dient als schnelle Übersicht, was geplant, generiert, akzeptiert oder offen ist.")
    lines.append("")
    lines.append("## Status-Legende")
    lines.append("")
    lines.append("| Status | Bedeutung |")
    lines.append("|---|---|")
    lines.append("| `planned` | geplant, noch nicht generiert |")
    lines.append("| `generated_pending_review` | Datei existiert, visuelle Prüfung offen |")
    lines.append("| `accepted` | visuell geprüft und freigegeben |")
    lines.append("| `rejected` | verworfen, neu generieren oder ersetzen |")
    lines.append("")
    lines.append("## Übersicht")
    lines.append("")
    lines.append(
        "| ID | Status | Exists | File | Folder | Ratio | Target | Actual | Review Note |"
    )
    lines.append("|---|---|---:|---|---|---:|---:|---:|---|")

    status_counts: dict[str, int] = {}
    existing_count = 0

    for asset in assets:
        if not isinstance(asset, dict):
            continue

        asset_id = asset.get("id", "")
        filename = asset.get("filename", "")
        folder = asset.get("folder", "")
        status = asset.get("status", "planned")
        ratio = asset.get("aspect_ratio", "")
        target_size = asset.get("target_size", ["", ""])
        review_note = asset.get("review_note", "")

        status_counts[status] = status_counts.get(status, 0) + 1

        file_path = output_root / str(folder) / str(filename)
        exists = file_path.exists()
        if exists:
            existing_count += 1

        actual_w, actual_h = image_dimensions(file_path)
        actual = f"{actual_w}x{actual_h}" if actual_w and actual_h else ""

        if isinstance(target_size, list) and len(target_size) >= 2:
            target = f"{target_size[0]}x{target_size[1]}"
        else:
            target = ""

        lines.append(
            "| "
            + " | ".join(
                [
                    md_escape(asset_id),
                    md_escape(status),
                    "yes" if exists else "no",
                    md_escape(filename),
                    md_escape(folder),
                    md_escape(ratio),
                    md_escape(target),
                    md_escape(actual),
                    md_escape(review_note),
                ]
            )
            + " |"
        )

    lines.append("")
    lines.append("## Zusammenfassung")
    lines.append("")
    lines.append(f"- Assets im Manifest: **{len(assets)}**")
    lines.append(f"- Dateien vorhanden: **{existing_count}**")
    lines.append("")

    for status, count in sorted(status_counts.items()):
        lines.append(f"- `{status}`: **{count}**")

    lines.append("")
    lines.append("## Nächster Review-Schritt")
    lines.append("")
    lines.append("Alle Assets mit `generated_pending_review` visuell prüfen.")
    lines.append("Danach in `assets.yaml` auf `accepted` oder `rejected` setzen.")
    lines.append("")

    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(description="Create asset inventory markdown from assets.yaml.")
    parser.add_argument(
        "--manifest",
        default="tools/asset_factory/assets.yaml",
        help="Path to asset manifest YAML, relative to repo root or absolute.",
    )
    parser.add_argument(
        "--output",
        default="docs/design/ASSET_INVENTORY.md",
        help="Output markdown path, relative to repo root or absolute.",
    )
    args = parser.parse_args()

    repo_root = repo_root_from_script()

    manifest_path = Path(args.manifest)
    if not manifest_path.is_absolute():
        manifest_path = repo_root / manifest_path

    output_path = Path(args.output)
    if not output_path.is_absolute():
        output_path = repo_root / output_path

    manifest = load_manifest(manifest_path)

    output_root_raw = str(manifest.get("output_root", "public/assets"))
    output_root = Path(output_root_raw)
    if not output_root.is_absolute():
        output_root = repo_root / output_root

    markdown = build_inventory_markdown(
        manifest=manifest,
        output_root=output_root,
    )

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(markdown, encoding="utf-8")

    print(f"[OK] Wrote inventory: {output_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())