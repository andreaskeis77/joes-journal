from __future__ import annotations

import subprocess
from pathlib import Path


REQUIRED_PUBLIC_FILES = [
    "public/assets/heroes/hero-home-editorial-restaurant-table-16x9-v01.webp",
    "public/assets/heroes/hero-home-mobile-restaurant-table-4x5-v01.webp",
    "public/assets/placeholders/placeholder-restaurant-4x3-v01.webp",
    "public/assets/placeholders/placeholder-review-4x3-v01.webp",
    "public/assets/placeholders/placeholder-recipe-4x3-v01.webp",
    "public/assets/placeholders/placeholder-cocktail-4x5-v01.webp",
    "public/assets/placeholders/placeholder-equipment-4x3-v01.webp",
    "public/assets/patterns/texture-warm-paper-grain-1x1-v01.webp",
    "public/assets/dividers/divider-petrol-thin-line-wide.svg",
    "public/assets/stats/rating-stars-five-base.svg",
    "public/assets/social/social-og-default-1200x630-v01.webp",
    "public/assets/brand/brand-badge-joe-round.svg",
    "public/assets/brand/brand-monogram-jj.svg",
    "public/assets/brand/brand-wordmark-zum-fettigen-joe-primary.svg",
    "public/assets/brand/brand-signature-powered-by-umami.svg",
    "public/favicon-32.png",
    "public/favicon-192.png",
    "public/apple-touch-icon.png",
    "public/asset-gallery.html",
]


def repo_root_from_script() -> Path:
    return Path(__file__).resolve().parents[2]


def run_git(root: Path, args: list[str]) -> str:
    result = subprocess.run(
        ["git", *args],
        cwd=root,
        check=True,
        capture_output=True,
        text=True,
        encoding="utf-8",
    )
    return result.stdout.strip()


def main() -> int:
    root = repo_root_from_script()
    errors: list[str] = []
    warnings: list[str] = []

    print("[AUDIT] Required files")
    for rel in REQUIRED_PUBLIC_FILES:
        path = root / rel
        if path.exists():
            print(f"[OK] {rel}")
        else:
            print(f"[MISSING] {rel}")
            errors.append(f"Missing required file: {rel}")

    print("")
    print("[AUDIT] Git status")
    status = run_git(root, ["status", "--porcelain"])

    if status:
        print(status)
        warnings.append("Working tree is not clean.")
    else:
        print("[OK] Working tree clean.")

    print("")
    print("[AUDIT] .venv ignored")
    gitignore = root / ".gitignore"
    if not gitignore.exists():
        warnings.append(".gitignore missing.")
        print("[WARN] .gitignore missing.")
    else:
        content = gitignore.read_text(encoding="utf-8", errors="ignore")
        if ".venv/" in content:
            print("[OK] .venv/ ignored.")
        else:
            warnings.append(".venv/ not found in .gitignore.")
            print("[WARN] .venv/ not found in .gitignore.")

    print("")
    print("[AUDIT] Summary")
    print(f"Errors: {len(errors)}")
    print(f"Warnings: {len(warnings)}")

    if errors:
        print("")
        for error in errors:
            print(f"[ERROR] {error}")
        return 2

    if warnings:
        print("")
        for warning in warnings:
            print(f"[WARN] {warning}")
        return 1

    print("[DONE] Asset library audit passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())