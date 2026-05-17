from __future__ import annotations

import argparse
from datetime import date
from pathlib import Path
from typing import Any

import yaml


VALID_STATUSES = {
    "planned",
    "generated_pending_review",
    "accepted",
    "rejected",
}


def repo_root_from_script() -> Path:
    return Path(__file__).resolve().parents[2]


def load_manifest(path: Path) -> dict[str, Any]:
    if not path.exists():
        raise FileNotFoundError(f"Manifest not found: {path}")

    with path.open("r", encoding="utf-8") as f:
        data = yaml.safe_load(f)

    if not isinstance(data, dict):
        raise ValueError("Manifest root must be a YAML object.")

    return data


def save_manifest(path: Path, data: dict[str, Any]) -> None:
    with path.open("w", encoding="utf-8", newline="\n") as f:
        yaml.safe_dump(
            data,
            f,
            sort_keys=False,
            allow_unicode=True,
            width=100,
        )


def main() -> int:
    parser = argparse.ArgumentParser(description="Mark assets in assets.yaml with a review status.")
    parser.add_argument(
        "--manifest",
        default="tools/asset_factory/assets.yaml",
        help="Path to asset manifest YAML, relative to repo root or absolute.",
    )
    parser.add_argument(
        "--asset",
        action="append",
        default=[],
        help="Asset id to mark. Can be used multiple times.",
    )
    parser.add_argument(
        "--all-generated-pending",
        action="store_true",
        help="Mark all assets with status generated_pending_review.",
    )
    parser.add_argument(
        "--status",
        required=True,
        choices=sorted(VALID_STATUSES),
        help="New review status.",
    )
    parser.add_argument(
        "--note",
        default="",
        help="Review note to write into review_note.",
    )
    parser.add_argument(
        "--date",
        default=date.today().isoformat(),
        help="Review/generated date to write. Default: today.",
    )

    args = parser.parse_args()

    repo_root = repo_root_from_script()

    manifest_path = Path(args.manifest)
    if not manifest_path.is_absolute():
        manifest_path = repo_root / manifest_path

    data = load_manifest(manifest_path)
    assets = data.get("assets", [])

    if not isinstance(assets, list):
        raise ValueError("Manifest key 'assets' must be a list.")

    selected_ids = set(args.asset)
    changed = 0

    for asset in assets:
        if not isinstance(asset, dict):
            continue

        asset_id = str(asset.get("id", ""))

        should_update = False

        if args.all_generated_pending and asset.get("status") == "generated_pending_review":
            should_update = True

        if selected_ids and asset_id in selected_ids:
            should_update = True

        if not should_update:
            continue

        asset["status"] = args.status
        asset["generated_at"] = args.date

        if args.note:
            asset["review_note"] = args.note

        changed += 1
        print(f"[MARK] {asset_id} -> {args.status}")

    if changed == 0:
        print("[WARN] No assets changed.")
    else:
        save_manifest(manifest_path, data)
        print(f"[OK] Updated {changed} asset(s): {manifest_path}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())