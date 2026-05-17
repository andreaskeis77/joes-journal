from __future__ import annotations

from pathlib import Path


def repo_root_from_script() -> Path:
    return Path(__file__).resolve().parents[2]


def write(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content.strip() + "\n", encoding="utf-8")
    print(f"[OK] {path}")


def svg_divider_petrol() -> str:
    return """
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 24" role="img" aria-hidden="true">
  <path d="M24 12 H1176" fill="none" stroke="#2E7070" stroke-width="2" stroke-linecap="round" opacity="0.72"/>
</svg>
"""


def svg_divider_warm_dotted() -> str:
    return """
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 24" role="img" aria-hidden="true">
  <path d="M24 12 H1176" fill="none" stroke="#DDD8D2" stroke-width="2" stroke-linecap="round" stroke-dasharray="2 14"/>
</svg>
"""


def svg_divider_joe_red_brush() -> str:
    return """
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 32" role="img" aria-hidden="true">
  <path d="M28 17 C180 10, 330 22, 480 15 S760 11, 930 18 S1090 20, 1172 14"
        fill="none" stroke="#B23A32" stroke-width="4" stroke-linecap="round" opacity="0.82"/>
</svg>
"""


def svg_divider_cutlery_center() -> str:
    return """
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 40" role="img" aria-hidden="true">
  <path d="M24 20 H520" fill="none" stroke="#DDD8D2" stroke-width="2" stroke-linecap="round"/>
  <path d="M680 20 H1176" fill="none" stroke="#DDD8D2" stroke-width="2" stroke-linecap="round"/>
  <circle cx="600" cy="20" r="13" fill="none" stroke="#2E7070" stroke-width="2"/>
  <path d="M585 20 H615" fill="none" stroke="#B23A32" stroke-width="2" stroke-linecap="round"/>
  <path d="M600 8 V32" fill="none" stroke="#B23A32" stroke-width="2" stroke-linecap="round"/>
</svg>
"""


def svg_ornament_corner_card_red() -> str:
    return """
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-hidden="true">
  <path d="M8 56 V20 C8 13.373 13.373 8 20 8 H56"
        fill="none" stroke="#B23A32" stroke-width="3" stroke-linecap="round"/>
  <circle cx="20" cy="20" r="3" fill="#B23A32"/>
</svg>
"""


def svg_ornament_corner_card_petrol() -> str:
    return """
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-hidden="true">
  <path d="M8 56 V20 C8 13.373 13.373 8 20 8 H56"
        fill="none" stroke="#2E7070" stroke-width="3" stroke-linecap="round"/>
  <circle cx="20" cy="20" r="3" fill="#2E7070"/>
</svg>
"""


def svg_ornament_section_marker_dot() -> str:
    return """
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" role="img" aria-hidden="true">
  <circle cx="12" cy="12" r="4" fill="#B23A32"/>
  <circle cx="12" cy="12" r="9" fill="none" stroke="#2E7070" stroke-width="1.5" opacity="0.45"/>
</svg>
"""


def svg_ornament_journal_stamp() -> str:
    return """
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 80" role="img" aria-hidden="true">
  <rect x="10" y="10" width="140" height="60" rx="16"
        fill="none" stroke="#B23A32" stroke-width="3" opacity="0.70"/>
  <path d="M28 40 H132" fill="none" stroke="#2E7070" stroke-width="2" stroke-linecap="round" opacity="0.55"/>
  <circle cx="80" cy="40" r="10" fill="none" stroke="#B23A32" stroke-width="2" opacity="0.65"/>
</svg>
"""


def svg_pattern_joe_dots_warm() -> str:
    return """
<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160" role="img" aria-hidden="true">
  <rect width="160" height="160" fill="#F5F3F1"/>
  <circle cx="24" cy="24" r="2" fill="#B23A32" opacity="0.10"/>
  <circle cx="80" cy="40" r="2" fill="#DDD8D2" opacity="0.70"/>
  <circle cx="132" cy="28" r="2" fill="#2E7070" opacity="0.08"/>
  <circle cx="48" cy="104" r="2" fill="#DDD8D2" opacity="0.70"/>
  <circle cx="116" cy="124" r="2" fill="#B23A32" opacity="0.08"/>
</svg>
"""


def svg_pattern_umami_soft_waves() -> str:
    return """
<svg xmlns="http://www.w3.org/2000/svg" width="240" height="120" viewBox="0 0 240 120" role="img" aria-hidden="true">
  <rect width="240" height="120" fill="#F5F3F1"/>
  <path d="M0 36 C40 14, 80 58, 120 36 S200 14, 240 36"
        fill="none" stroke="#2E7070" stroke-width="2" opacity="0.08"/>
  <path d="M0 78 C40 56, 80 100, 120 78 S200 56, 240 78"
        fill="none" stroke="#2E7070" stroke-width="2" opacity="0.06"/>
</svg>
"""


def svg_pattern_cutlery_minimal() -> str:
    return """
<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180" role="img" aria-hidden="true">
  <rect width="180" height="180" fill="#F5F3F1"/>
  <g fill="none" stroke="#222222" stroke-width="1.5" stroke-linecap="round" opacity="0.045">
    <path d="M42 30 V86"/>
    <path d="M36 30 V48"/>
    <path d="M42 30 V48"/>
    <path d="M48 30 V48"/>
    <path d="M132 30 V86"/>
    <path d="M126 30 C126 54,138 54,138 30"/>
    <path d="M42 120 V156"/>
    <path d="M132 120 V156"/>
  </g>
</svg>
"""


def svg_pattern_menu_grid() -> str:
    return """
<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160" role="img" aria-hidden="true">
  <rect width="160" height="160" fill="#F5F3F1"/>
  <path d="M0 40 H160 M0 80 H160 M0 120 H160 M40 0 V160 M80 0 V160 M120 0 V160"
        fill="none" stroke="#DDD8D2" stroke-width="1" opacity="0.32"/>
</svg>
"""


def rating_stars_five_base() -> str:
    return """
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 32" role="img" aria-hidden="true">
  <defs>
    <path id="star" d="M16 3.5l3.7 7.5 8.3 1.2-6 5.9 1.4 8.2L16 22.4 8.6 26.3 10 18.1 4 12.2 12.3 11z"/>
  </defs>
  <g fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round">
    <use href="#star" x="0"/>
    <use href="#star" x="32"/>
    <use href="#star" x="64"/>
    <use href="#star" x="96"/>
    <use href="#star" x="128"/>
  </g>
</svg>
"""


def main() -> int:
    root = repo_root_from_script()
    base = root / "public" / "assets"

    graphics = {
        base / "dividers" / "divider-petrol-thin-line-wide.svg": svg_divider_petrol(),
        base / "dividers" / "divider-warm-dotted-line-wide.svg": svg_divider_warm_dotted(),
        base / "dividers" / "divider-joe-red-brush-line-wide.svg": svg_divider_joe_red_brush(),
        base / "dividers" / "divider-cutlery-center.svg": svg_divider_cutlery_center(),

        base / "dividers" / "ornament-corner-card-red.svg": svg_ornament_corner_card_red(),
        base / "dividers" / "ornament-corner-card-petrol.svg": svg_ornament_corner_card_petrol(),
        base / "dividers" / "ornament-section-marker-dot.svg": svg_ornament_section_marker_dot(),
        base / "dividers" / "ornament-journal-stamp.svg": svg_ornament_journal_stamp(),

        base / "patterns" / "pattern-joe-dots-warm.svg": svg_pattern_joe_dots_warm(),
        base / "patterns" / "pattern-umami-soft-waves.svg": svg_pattern_umami_soft_waves(),
        base / "patterns" / "pattern-cutlery-minimal.svg": svg_pattern_cutlery_minimal(),
        base / "patterns" / "pattern-menu-grid.svg": svg_pattern_menu_grid(),

        base / "stats" / "rating-stars-five-base.svg": rating_stars_five_base(),
    }

    for path, content in graphics.items():
        write(path, content)

    print("[DONE]")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())