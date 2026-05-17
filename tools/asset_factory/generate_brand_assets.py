from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw


JOE_RED = "#B23A32"
UMAMI_PETROL = "#2E7070"
BG_WARM = "#F5F3F1"
SURFACE = "#FFFFFF"
BORDER = "#DDD8D2"
TEXT = "#222222"


def repo_root_from_script() -> Path:
    return Path(__file__).resolve().parents[2]


def write_text(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content.strip() + "\n", encoding="utf-8")
    print(f"[OK] {path}")


def save_png(path: Path, image: Image.Image) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path, format="PNG", optimize=True)
    print(f"[OK] {path}")


def rounded_rect(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], radius: int, fill: str) -> None:
    draw.rounded_rectangle(box, radius=radius, fill=fill)


def resize_png(source: Path, target: Path, size: int) -> None:
    with Image.open(source) as img:
        img = img.convert("RGBA")
        img = img.resize((size, size), Image.Resampling.LANCZOS)
        save_png(target, img)


def brand_badge_joe_round_svg() -> str:
    return """
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-hidden="true">
  <rect width="512" height="512" rx="112" fill="#F5F3F1"/>
  <circle cx="256" cy="256" r="184" fill="#FFFFFF" stroke="#DDD8D2" stroke-width="10"/>
  <circle cx="256" cy="256" r="152" fill="none" stroke="#2E7070" stroke-width="8" opacity="0.78"/>
  <circle cx="256" cy="256" r="112" fill="#B23A32" opacity="0.10"/>
  <path d="M160 284 C194 236, 222 332, 256 284 S318 236, 352 284"
        fill="none" stroke="#B23A32" stroke-width="20" stroke-linecap="round"/>
  <path d="M176 212 H336" fill="none" stroke="#222222" stroke-width="18" stroke-linecap="round"/>
  <path d="M206 212 V174" fill="none" stroke="#222222" stroke-width="18" stroke-linecap="round"/>
  <path d="M306 212 V174" fill="none" stroke="#222222" stroke-width="18" stroke-linecap="round"/>
  <circle cx="214" cy="316" r="10" fill="#2E7070"/>
  <circle cx="298" cy="316" r="10" fill="#2E7070"/>
</svg>
"""


def brand_monogram_jj_svg() -> str:
    return """
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-hidden="true">
  <rect width="512" height="512" rx="112" fill="#B23A32"/>
  <circle cx="256" cy="256" r="178" fill="none" stroke="#F5F3F1" stroke-width="14" opacity="0.90"/>
  <path d="M198 156 V292 C198 346, 158 360, 128 336"
        fill="none" stroke="#FFFFFF" stroke-width="34" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M314 156 V292 C314 346, 274 360, 244 336"
        fill="none" stroke="#FFFFFF" stroke-width="34" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M176 156 H220" fill="none" stroke="#FFFFFF" stroke-width="34" stroke-linecap="round"/>
  <path d="M292 156 H336" fill="none" stroke="#FFFFFF" stroke-width="34" stroke-linecap="round"/>
  <path d="M158 390 H354" fill="none" stroke="#2E7070" stroke-width="16" stroke-linecap="round"/>
</svg>
"""


def social_avatar_joe_badge_svg() -> str:
    return """
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-hidden="true">
  <rect width="512" height="512" rx="96" fill="#F5F3F1"/>
  <circle cx="256" cy="256" r="188" fill="#FFFFFF" stroke="#DDD8D2" stroke-width="10"/>
  <circle cx="256" cy="256" r="150" fill="#2E7070" opacity="0.10"/>
  <path d="M160 304 C190 256, 220 344, 256 304 S322 256, 352 304"
        fill="none" stroke="#B23A32" stroke-width="22" stroke-linecap="round"/>
  <path d="M164 214 H348" fill="none" stroke="#222222" stroke-width="20" stroke-linecap="round"/>
  <path d="M206 214 V166" fill="none" stroke="#222222" stroke-width="20" stroke-linecap="round"/>
  <path d="M306 214 V166" fill="none" stroke="#222222" stroke-width="20" stroke-linecap="round"/>
  <circle cx="216" cy="320" r="11" fill="#2E7070"/>
  <circle cx="296" cy="320" r="11" fill="#2E7070"/>
  <path d="M198 386 H314" fill="none" stroke="#DDD8D2" stroke-width="12" stroke-linecap="round"/>
</svg>
"""


def draw_monogram_png(size: int = 512) -> Image.Image:
    scale = size / 512
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    def s(v: int) -> int:
        return int(v * scale)

    rounded_rect(draw, (0, 0, size, size), s(112), JOE_RED)

    draw.ellipse((s(78), s(78), s(434), s(434)), outline=BG_WARM, width=s(14))

    # Left J
    draw.line((s(198), s(156), s(198), s(292)), fill=SURFACE, width=s(34))
    draw.arc((s(128), s(292), s(198), s(362)), 0, 140, fill=SURFACE, width=s(34))
    draw.line((s(176), s(156), s(220), s(156)), fill=SURFACE, width=s(34))

    # Right J
    draw.line((s(314), s(156), s(314), s(292)), fill=SURFACE, width=s(34))
    draw.arc((s(244), s(292), s(314), s(362)), 0, 140, fill=SURFACE, width=s(34))
    draw.line((s(292), s(156), s(336), s(156)), fill=SURFACE, width=s(34))

    draw.line((s(158), s(390), s(354), s(390)), fill=UMAMI_PETROL, width=s(16))

    return img


def draw_social_badge_png(size: int = 512) -> Image.Image:
    scale = size / 512
    img = Image.new("RGBA", (size, size), BG_WARM)
    draw = ImageDraw.Draw(img)

    def s(v: int) -> int:
        return int(v * scale)

    rounded_rect(draw, (0, 0, size, size), s(96), BG_WARM)
    draw.ellipse((s(68), s(68), s(444), s(444)), fill=SURFACE, outline=BORDER, width=s(10))
    draw.ellipse((s(106), s(106), s(406), s(406)), fill="#EAF1F1")

    # abstract plate / smile / table line motif
    draw.arc((s(150), s(240), s(362), s(370)), 15, 165, fill=JOE_RED, width=s(22))
    draw.line((s(164), s(214), s(348), s(214)), fill=TEXT, width=s(20))
    draw.line((s(206), s(166), s(206), s(214)), fill=TEXT, width=s(20))
    draw.line((s(306), s(166), s(306), s(214)), fill=TEXT, width=s(20))
    draw.ellipse((s(205), s(309), s(227), s(331)), fill=UMAMI_PETROL)
    draw.ellipse((s(285), s(309), s(307), s(331)), fill=UMAMI_PETROL)
    draw.line((s(198), s(386), s(314), s(386)), fill=BORDER, width=s(12))

    return img


def main() -> int:
    root = repo_root_from_script()
    brand_dir = root / "public" / "assets" / "brand"
    social_dir = root / "public" / "assets" / "social"
    public_root = root / "public"

    badge_svg = brand_dir / "brand-badge-joe-round.svg"
    monogram_svg = brand_dir / "brand-monogram-jj.svg"
    social_svg = social_dir / "social-avatar-joe-badge-512-v01.svg"

    write_text(badge_svg, brand_badge_joe_round_svg())
    write_text(monogram_svg, brand_monogram_jj_svg())
    write_text(social_svg, social_avatar_joe_badge_svg())

    app_icon = brand_dir / "brand-app-icon-512.png"
    social_avatar = social_dir / "social-avatar-joe-badge-512-v01.png"

    save_png(app_icon, draw_monogram_png(512))
    save_png(social_avatar, draw_social_badge_png(512))

    resize_png(app_icon, public_root / "favicon-32.png", 32)
    resize_png(app_icon, public_root / "favicon-192.png", 192)
    resize_png(app_icon, public_root / "apple-touch-icon.png", 180)

    print("[DONE] Brand and app assets generated without CairoSVG.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())