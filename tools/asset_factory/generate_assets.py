from __future__ import annotations

import argparse
import base64
import os
import sys
from dataclasses import dataclass
from io import BytesIO
from pathlib import Path
from typing import Any

import yaml
from openai import OpenAI
from PIL import Image


DEFAULT_MODEL = "gpt-image-2"
DEFAULT_OUTPUT_FORMAT = "webp"
DEFAULT_COMPRESSION = 92


@dataclass(frozen=True)
class AssetSpec:
    asset_id: str
    filename: str
    folder: str
    aspect_ratio: str
    target_width: int
    target_height: int
    quality: str
    subject: str
    composition: str


def repo_root_from_script() -> Path:
    # tools/asset_factory/generate_assets.py -> repo root
    return Path(__file__).resolve().parents[2]


def load_manifest(path: Path) -> dict[str, Any]:
    if not path.exists():
        raise FileNotFoundError(f"Manifest not found: {path}")

    with path.open("r", encoding="utf-8") as f:
        data = yaml.safe_load(f)

    if not isinstance(data, dict):
        raise ValueError("Manifest root must be a YAML object.")

    return data


def parse_asset(raw: dict[str, Any]) -> AssetSpec:
    try:
        target_size = raw["target_size"]
        return AssetSpec(
            asset_id=str(raw["id"]),
            filename=str(raw["filename"]),
            folder=str(raw["folder"]),
            aspect_ratio=str(raw["aspect_ratio"]),
            target_width=int(target_size[0]),
            target_height=int(target_size[1]),
            quality=str(raw.get("quality", "high")),
            subject=str(raw["subject"]).strip(),
            composition=str(raw["composition"]).strip(),
        )
    except Exception as exc:
        raise ValueError(f"Invalid asset spec: {raw}") from exc


def ensure_multiple_of_16(value: int) -> int:
    remainder = value % 16
    if remainder == 0:
        return value
    return value + (16 - remainder)


def api_generation_size(width: int, height: int) -> str:
    """
    GPT Image 2 allows flexible sizes with constraints.
    Both edges should be multiples of 16 according to the current API docs.
    We generate at the nearest >= target size and crop/resize afterwards.
    """
    api_width = ensure_multiple_of_16(width)
    api_height = ensure_multiple_of_16(height)
    return f"{api_width}x{api_height}"


def build_prompt(
    *,
    brand: str,
    global_style: str,
    global_negative: str,
    asset: AssetSpec,
) -> str:
    return f"""
Create a high-resolution editorial food website asset for "{brand}", a private culinary journal.

Target filename:
{asset.filename}

Asset purpose:
Placeholder image for the website content area.

Subject:
{asset.subject}

Composition:
{asset.composition}

Aspect ratio:
{asset.aspect_ratio}

Target output size after post-processing:
{asset.target_width} x {asset.target_height} px

Color palette:
Warm neutrals, wood, stone, linen, ceramic, glass and stainless steel.
Use restrained accents in BBQ red #B23A32 and petrol #2E7070.
Avoid bright saturated colors, cold clinical white, neon, and cheap diner aesthetics.

Global style:
{global_style}

Strict restrictions:
{global_negative}

Additional production rules:
The image must contain no readable text at all.
The image must contain no logos, no labels, no brand marks, no watermarks.
The image must not show identifiable people.
Keep the scene calm, premium, realistic, and not cluttered.
""".strip()


def save_base64_image_to_target(
    *,
    b64_json: str,
    output_path: Path,
    target_width: int,
    target_height: int,
) -> None:
    raw = base64.b64decode(b64_json)
    image = Image.open(BytesIO(raw)).convert("RGB")

    # Cover crop to exact target ratio, then resize to exact target size.
    src_w, src_h = image.size
    target_ratio = target_width / target_height
    src_ratio = src_w / src_h

    if src_ratio > target_ratio:
        # source too wide
        new_w = int(src_h * target_ratio)
        left = (src_w - new_w) // 2
        image = image.crop((left, 0, left + new_w, src_h))
    elif src_ratio < target_ratio:
        # source too tall
        new_h = int(src_w / target_ratio)
        top = (src_h - new_h) // 2
        image = image.crop((0, top, src_w, top + new_h))

    image = image.resize((target_width, target_height), Image.Resampling.LANCZOS)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    image.save(
        output_path,
        format="WEBP",
        quality=DEFAULT_COMPRESSION,
        method=6,
    )


def generate_one(
    *,
    client: OpenAI,
    model: str,
    output_root: Path,
    brand: str,
    global_style: str,
    global_negative: str,
    asset: AssetSpec,
    overwrite: bool,
    dry_run: bool,
) -> Path:
    output_path = output_root / asset.folder / asset.filename

    if output_path.exists() and not overwrite:
        print(f"[SKIP] Exists: {output_path}")
        return output_path

    prompt = build_prompt(
        brand=brand,
        global_style=global_style,
        global_negative=global_negative,
        asset=asset,
    )

    size = api_generation_size(asset.target_width, asset.target_height)

    print("")
    print(f"[GENERATE] {asset.asset_id}")
    print(f"  file:   {output_path}")
    print(f"  size:   API {size} -> final {asset.target_width}x{asset.target_height}")
    print(f"  model:  {model}")
    print(f"  format: {DEFAULT_OUTPUT_FORMAT}")

    if dry_run:
        print("  dry-run: no API call")
        print("")
        print(prompt)
        return output_path

    result = client.images.generate(
        model=model,
        prompt=prompt,
        size=size,
        quality=asset.quality,
        output_format=DEFAULT_OUTPUT_FORMAT,
        output_compression=DEFAULT_COMPRESSION,
        n=1,
    )

    if not result.data or not result.data[0].b64_json:
        raise RuntimeError(f"No image returned for asset: {asset.asset_id}")

    save_base64_image_to_target(
        b64_json=result.data[0].b64_json,
        output_path=output_path,
        target_width=asset.target_width,
        target_height=asset.target_height,
    )

    print(f"[OK] {output_path}")
    return output_path


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate joes-journal visual assets via OpenAI Images API.")
    parser.add_argument(
        "--manifest",
        default="tools/asset_factory/assets.yaml",
        help="Path to asset manifest YAML, relative to repo root or absolute.",
    )
    parser.add_argument(
        "--asset",
        action="append",
        default=[],
        help="Asset id to generate. Can be used multiple times. If omitted, all assets are generated.",
    )
    parser.add_argument(
        "--model",
        default=os.getenv("OPENAI_IMAGE_MODEL", DEFAULT_MODEL),
        help=f"Image model. Default: {DEFAULT_MODEL}. Can also be set via OPENAI_IMAGE_MODEL.",
    )
    parser.add_argument(
        "--overwrite",
        action="store_true",
        help="Overwrite existing files.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print prompts and output paths without calling the API.",
    )

    args = parser.parse_args()

    repo_root = repo_root_from_script()
    manifest_path = Path(args.manifest)
    if not manifest_path.is_absolute():
        manifest_path = repo_root / manifest_path

    data = load_manifest(manifest_path)

    brand = str(data.get("brand", "Zum Fettigen Joe"))
    output_root_raw = str(data.get("output_root", "public/assets"))
    output_root = Path(output_root_raw)
    if not output_root.is_absolute():
        output_root = repo_root / output_root

    global_style = str(data.get("global_style", "")).strip()
    global_negative = str(data.get("global_negative", "")).strip()

    assets_raw = data.get("assets", [])
    if not isinstance(assets_raw, list) or not assets_raw:
        raise ValueError("Manifest must contain a non-empty 'assets' list.")

    assets = [parse_asset(raw) for raw in assets_raw]

    requested = set(args.asset)
    if requested:
        assets = [asset for asset in assets if asset.asset_id in requested]

    if not assets:
        print("[ERROR] No matching assets selected.", file=sys.stderr)
        return 2

    if not args.dry_run and not os.getenv("OPENAI_API_KEY"):
        print("[ERROR] OPENAI_API_KEY is not set.", file=sys.stderr)
        print('Set it in PowerShell: $env:OPENAI_API_KEY = "sk-..."', file=sys.stderr)
        return 2

    client = OpenAI() if not args.dry_run else None

    for asset in assets:
        generate_one(
            client=client,  # type: ignore[arg-type]
            model=args.model,
            output_root=output_root,
            brand=brand,
            global_style=global_style,
            global_negative=global_negative,
            asset=asset,
            overwrite=args.overwrite,
            dry_run=args.dry_run,
        )

    print("")
    print("[DONE]")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())