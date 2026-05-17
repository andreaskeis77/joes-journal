from __future__ import annotations

import json
import subprocess
from pathlib import Path
from typing import Any

import yaml
from PIL import Image


IMAGE_EXTENSIONS = {".webp", ".png", ".jpg", ".jpeg", ".svg"}


def repo_root_from_script() -> Path:
    return Path(__file__).resolve().parents[2]


def rel_posix(path: Path, root: Path) -> str:
    return path.relative_to(root).as_posix()


def git_tracked_files(root: Path) -> set[str]:
    try:
        result = subprocess.run(
            ["git", "ls-files"],
            cwd=root,
            check=True,
            capture_output=True,
            text=True,
            encoding="utf-8",
        )
        return set(line.strip() for line in result.stdout.splitlines() if line.strip())
    except Exception:
        return set()


def load_manifest(root: Path) -> dict[str, dict[str, Any]]:
    path = root / "tools" / "asset_factory" / "assets.yaml"
    if not path.exists():
        return {}

    data = yaml.safe_load(path.read_text(encoding="utf-8"))
    if not isinstance(data, dict):
        return {}

    out: dict[str, dict[str, Any]] = {}

    for asset in data.get("assets", []):
        if not isinstance(asset, dict):
            continue
        folder = str(asset.get("folder", "")).strip()
        filename = str(asset.get("filename", "")).strip()
        if not folder or not filename:
            continue
        rel = f"public/assets/{folder}/{filename}"
        out[rel] = asset

    return out


def image_dimensions(path: Path) -> tuple[int | None, int | None]:
    if path.suffix.lower() == ".svg":
        return None, None

    try:
        with Image.open(path) as img:
            return img.size
    except Exception:
        return None, None


def collect_asset_files(root: Path) -> list[Path]:
    public = root / "public"
    paths: list[Path] = []

    asset_root = public / "assets"
    if asset_root.exists():
        paths.extend(path for path in asset_root.rglob("*") if path.is_file() and path.suffix.lower() in IMAGE_EXTENSIONS)

    for name in ["favicon-32.png", "favicon-192.png", "apple-touch-icon.png", "asset-gallery.html"]:
        path = public / name
        if path.exists():
            paths.append(path)

    return sorted(paths, key=lambda p: rel_posix(p, root))


def classify(path: Path, root: Path) -> str:
    rel = path.relative_to(root).parts

    if len(rel) >= 3 and rel[0] == "public" and rel[1] == "assets":
        return rel[2]

    if len(rel) >= 2 and rel[0] == "public":
        return "root"

    return "misc"


def build_index(root: Path) -> list[dict[str, Any]]:
    tracked = git_tracked_files(root)
    manifest = load_manifest(root)
    files = collect_asset_files(root)

    rows: list[dict[str, Any]] = []

    for path in files:
        rel = rel_posix(path, root)
        size_bytes = path.stat().st_size
        w, h = image_dimensions(path)
        manifest_entry = manifest.get(rel)

        rows.append(
            {
                "path": rel,
                "filename": path.name,
                "extension": path.suffix.lower().replace(".", ""),
                "group": classify(path, root),
                "size_bytes": size_bytes,
                "dimensions": f"{w}x{h}" if w and h else "",
                "git_tracked": rel in tracked,
                "manifested": manifest_entry is not None,
                "manifest_id": manifest_entry.get("id", "") if manifest_entry else "",
                "manifest_status": manifest_entry.get("status", "") if manifest_entry else "",
            }
        )

    return rows


def markdown_table(rows: list[dict[str, Any]]) -> str:
    lines: list[str] = []

    lines.append("# Asset File Index")
    lines.append("")
    lines.append("Diese Datei wird aus `public/assets`, `public/favicon-*` und `tools/asset_factory/assets.yaml` erzeugt.")
    lines.append("")
    lines.append("## Summary")
    lines.append("")
    lines.append(f"- Files indexed: **{len(rows)}**")
    lines.append(f"- Git tracked: **{sum(1 for row in rows if row['git_tracked'])}**")
    lines.append(f"- Manifested: **{sum(1 for row in rows if row['manifested'])}**")
    lines.append(f"- Unmanifested: **{sum(1 for row in rows if not row['manifested'])}**")
    lines.append("")

    groups: dict[str, int] = {}
    for row in rows:
        groups[row["group"]] = groups.get(row["group"], 0) + 1

    lines.append("## Groups")
    lines.append("")
    lines.append("| Group | Count |")
    lines.append("|---|---:|")
    for group, count in sorted(groups.items()):
        lines.append(f"| {group} | {count} |")

    lines.append("")
    lines.append("## Files")
    lines.append("")
    lines.append("| Path | Group | Ext | Size KB | Dimensions | Git | Manifest | Status |")
    lines.append("|---|---|---:|---:|---:|---:|---:|---|")

    for row in rows:
        size_kb = round(row["size_bytes"] / 1024, 1)
        lines.append(
            "| "
            + " | ".join(
                [
                    row["path"],
                    row["group"],
                    row["extension"],
                    str(size_kb),
                    row["dimensions"],
                    "yes" if row["git_tracked"] else "no",
                    "yes" if row["manifested"] else "no",
                    row["manifest_status"],
                ]
            )
            + " |"
        )

    lines.append("")
    return "\n".join(lines)


def main() -> int:
    root = repo_root_from_script()
    rows = build_index(root)

    md_path = root / "docs" / "design" / "ASSET_FILE_INDEX.md"
    json_path = root / "docs" / "design" / "ASSET_FILE_INDEX.json"

    md_path.parent.mkdir(parents=True, exist_ok=True)
    md_path.write_text(markdown_table(rows), encoding="utf-8")
    json_path.write_text(json.dumps(rows, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"[OK] Wrote {md_path}")
    print(f"[OK] Wrote {json_path}")
    print(f"[DONE] Indexed {len(rows)} files.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())