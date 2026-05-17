from __future__ import annotations

from pathlib import Path


def repo_root_from_script() -> Path:
    return Path(__file__).resolve().parents[2]


def write(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content.strip() + "\n", encoding="utf-8")
    print(f"[OK] {path}")


def badge_svg(*, stroke: str, fill: str, accent: str) -> str:
    return f"""
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 48" role="img" aria-hidden="true">
  <rect x="4" y="6" width="152" height="36" rx="18"
        fill="{fill}" stroke="{stroke}" stroke-width="2"/>
  <circle cx="28" cy="24" r="6" fill="{accent}"/>
  <path d="M46 24 H132" fill="none" stroke="{accent}" stroke-width="2" stroke-linecap="round" opacity="0.72"/>
</svg>
"""


def stat_icon_restaurants_total() -> str:
    return """
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-hidden="true">
  <rect x="12" y="18" width="40" height="34" rx="6" fill="none" stroke="#222222" stroke-width="3"/>
  <path d="M18 18V12h28v6" fill="none" stroke="#222222" stroke-width="3" stroke-linecap="round"/>
  <path d="M22 30h20M22 40h14" fill="none" stroke="#2E7070" stroke-width="3" stroke-linecap="round"/>
  <circle cx="46" cy="40" r="4" fill="#B23A32"/>
</svg>
"""


def stat_icon_restaurants_visited() -> str:
    return """
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-hidden="true">
  <circle cx="32" cy="32" r="22" fill="none" stroke="#2E7070" stroke-width="3"/>
  <path d="M21 33l7 7 16-17" fill="none" stroke="#B23A32" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
"""


def stat_icon_restaurants_watchlist() -> str:
    return """
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-hidden="true">
  <path d="M20 12h24a4 4 0 0 1 4 4v38L32 44 16 54V16a4 4 0 0 1 4-4z"
        fill="none" stroke="#222222" stroke-width="3" stroke-linejoin="round"/>
  <circle cx="32" cy="28" r="7" fill="none" stroke="#2E7070" stroke-width="3"/>
  <path d="M32 21v7l5 3" fill="none" stroke="#B23A32" stroke-width="3" stroke-linecap="round"/>
</svg>
"""


def stat_icon_top_cities() -> str:
    return """
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-hidden="true">
  <path d="M12 50h40" fill="none" stroke="#222222" stroke-width="3" stroke-linecap="round"/>
  <path d="M18 50V28l10-8 10 8v22" fill="none" stroke="#222222" stroke-width="3" stroke-linejoin="round"/>
  <path d="M38 50V22l8-6 8 6v28" fill="none" stroke="#2E7070" stroke-width="3" stroke-linejoin="round"/>
  <circle cx="28" cy="34" r="3" fill="#B23A32"/>
</svg>
"""


def stat_icon_reviews_total() -> str:
    return """
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-hidden="true">
  <path d="M14 14h36v28H24L14 52z" fill="none" stroke="#222222" stroke-width="3" stroke-linejoin="round"/>
  <path d="M24 28h20M24 36h12" fill="none" stroke="#2E7070" stroke-width="3" stroke-linecap="round"/>
  <path d="M23 22l3 3 6-7" fill="none" stroke="#B23A32" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
"""


def stat_icon_recipes_total() -> str:
    return """
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-hidden="true">
  <rect x="16" y="10" width="32" height="44" rx="5" fill="none" stroke="#222222" stroke-width="3"/>
  <path d="M24 22h16M24 32h16M24 42h9" fill="none" stroke="#2E7070" stroke-width="3" stroke-linecap="round"/>
  <circle cx="42" cy="43" r="4" fill="#B23A32"/>
</svg>
"""


def stat_icon_cocktails_total() -> str:
    return """
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-hidden="true">
  <path d="M17 12h30L32 30z" fill="none" stroke="#222222" stroke-width="3" stroke-linejoin="round"/>
  <path d="M32 30v17M24 52h16" fill="none" stroke="#222222" stroke-width="3" stroke-linecap="round"/>
  <path d="M22 20h20" fill="none" stroke="#2E7070" stroke-width="3" stroke-linecap="round"/>
  <circle cx="43" cy="14" r="4" fill="#B23A32"/>
</svg>
"""


def stat_icon_equipment_owned() -> str:
    return """
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-hidden="true">
  <path d="M16 50h32" fill="none" stroke="#222222" stroke-width="3" stroke-linecap="round"/>
  <path d="M20 50V28a12 12 0 0 1 24 0v22" fill="none" stroke="#222222" stroke-width="3"/>
  <path d="M24 28h16" fill="none" stroke="#2E7070" stroke-width="3" stroke-linecap="round"/>
  <path d="M32 16v8" fill="none" stroke="#B23A32" stroke-width="3" stroke-linecap="round"/>
</svg>
"""


def mini_bars_warm() -> str:
    return """
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 80" role="img" aria-hidden="true">
  <rect x="8" y="8" width="204" height="64" rx="18" fill="#F5F3F1"/>
  <rect x="34" y="42" width="18" height="18" rx="4" fill="#DDD8D2"/>
  <rect x="68" y="32" width="18" height="28" rx="4" fill="#2E7070" opacity="0.55"/>
  <rect x="102" y="22" width="18" height="38" rx="4" fill="#B23A32" opacity="0.55"/>
  <rect x="136" y="36" width="18" height="24" rx="4" fill="#DDD8D2"/>
  <rect x="170" y="28" width="18" height="32" rx="4" fill="#2E7070" opacity="0.38"/>
</svg>
"""


def mini_map_dots() -> str:
    return """
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 120" role="img" aria-hidden="true">
  <rect x="8" y="8" width="204" height="104" rx="22" fill="#F5F3F1"/>
  <path d="M54 30 C88 16, 134 18, 166 42 C190 60, 170 92, 126 94 C86 96, 42 78, 44 52 C45 42, 48 35, 54 30z"
        fill="none" stroke="#DDD8D2" stroke-width="3"/>
  <circle cx="72" cy="50" r="5" fill="#B23A32"/>
  <circle cx="116" cy="42" r="5" fill="#2E7070"/>
  <circle cx="146" cy="72" r="5" fill="#B87514"/>
  <circle cx="98" cy="78" r="4" fill="#5F5A56" opacity="0.55"/>
</svg>
"""


def mini_trend_line() -> str:
    return """
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 80" role="img" aria-hidden="true">
  <rect x="8" y="8" width="204" height="64" rx="18" fill="#F5F3F1"/>
  <path d="M30 54 C58 44, 70 52, 92 36 S132 28, 150 34 S174 50, 194 24"
        fill="none" stroke="#2E7070" stroke-width="4" stroke-linecap="round"/>
  <circle cx="92" cy="36" r="4" fill="#B23A32"/>
  <circle cx="194" cy="24" r="5" fill="#B23A32"/>
</svg>
"""


def admin_empty_restaurant() -> str:
    return """
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 220" role="img" aria-hidden="true">
  <rect width="320" height="220" rx="28" fill="#F5F3F1"/>
  <rect x="64" y="78" width="192" height="84" rx="18" fill="#FFFFFF" stroke="#DDD8D2" stroke-width="3"/>
  <path d="M96 122h128" stroke="#2E7070" stroke-width="4" stroke-linecap="round"/>
  <path d="M116 104v36M204 104v36" stroke="#222222" stroke-width="4" stroke-linecap="round"/>
  <circle cx="160" cy="122" r="20" fill="none" stroke="#B23A32" stroke-width="4"/>
</svg>
"""


def admin_empty_review() -> str:
    return """
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 220" role="img" aria-hidden="true">
  <rect width="320" height="220" rx="28" fill="#F5F3F1"/>
  <path d="M78 60h164v98H116l-38 32z" fill="#FFFFFF" stroke="#DDD8D2" stroke-width="3" stroke-linejoin="round"/>
  <path d="M118 98h86M118 126h54" stroke="#2E7070" stroke-width="5" stroke-linecap="round"/>
  <path d="M114 76l8 8 18-20" stroke="#B23A32" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
"""


def admin_empty_link() -> str:
    return """
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 220" role="img" aria-hidden="true">
  <rect width="320" height="220" rx="28" fill="#F5F3F1"/>
  <rect x="74" y="64" width="172" height="98" rx="18" fill="#FFFFFF" stroke="#DDD8D2" stroke-width="3"/>
  <path d="M138 122l44-44M132 84l10-10a32 32 0 0 1 45 45l-10 10M188 136l-10 10a32 32 0 0 1-45-45l10-10"
        fill="none" stroke="#2E7070" stroke-width="5" stroke-linecap="round"/>
  <circle cx="220" cy="76" r="8" fill="#B23A32"/>
</svg>
"""


def main() -> int:
    root = repo_root_from_script()
    base = root / "public" / "assets"

    graphics = {
        base / "badges" / "badge-status-discovered.svg": badge_svg(stroke="#DDD8D2", fill="#F5F3F1", accent="#5F5A56"),
        base / "badges" / "badge-status-wishlist.svg": badge_svg(stroke="#2E7070", fill="#F5F3F1", accent="#2E7070"),
        base / "badges" / "badge-status-planned.svg": badge_svg(stroke="#B87514", fill="#F5F3F1", accent="#B87514"),
        base / "badges" / "badge-status-visited.svg": badge_svg(stroke="#2F6F4E", fill="#F5F3F1", accent="#2F6F4E"),
        base / "badges" / "badge-status-reviewed.svg": badge_svg(stroke="#B23A32", fill="#F5F3F1", accent="#B23A32"),
        base / "badges" / "badge-status-revisit.svg": badge_svg(stroke="#2E7070", fill="#FFFFFF", accent="#2E7070"),
        base / "badges" / "badge-status-closed.svg": badge_svg(stroke="#5F5A56", fill="#EDEBE9", accent="#5F5A56"),
        base / "badges" / "badge-status-archived.svg": badge_svg(stroke="#DDD8D2", fill="#EDEBE9", accent="#5F5A56"),

        base / "stats" / "stat-icon-restaurants-total.svg": stat_icon_restaurants_total(),
        base / "stats" / "stat-icon-restaurants-visited.svg": stat_icon_restaurants_visited(),
        base / "stats" / "stat-icon-restaurants-watchlist.svg": stat_icon_restaurants_watchlist(),
        base / "stats" / "stat-icon-top-cities.svg": stat_icon_top_cities(),
        base / "stats" / "stat-icon-reviews-total.svg": stat_icon_reviews_total(),
        base / "stats" / "stat-icon-recipes-total.svg": stat_icon_recipes_total(),
        base / "stats" / "stat-icon-cocktails-total.svg": stat_icon_cocktails_total(),
        base / "stats" / "stat-icon-equipment-owned.svg": stat_icon_equipment_owned(),

        base / "stats" / "stat-mini-bars-warm.svg": mini_bars_warm(),
        base / "stats" / "stat-mini-map-dots.svg": mini_map_dots(),
        base / "stats" / "stat-mini-trend-line.svg": mini_trend_line(),

        base / "admin" / "admin-empty-restaurant.svg": admin_empty_restaurant(),
        base / "admin" / "admin-empty-review.svg": admin_empty_review(),
        base / "admin" / "admin-empty-link.svg": admin_empty_link(),
    }

    for path, content in graphics.items():
        write(path, content)

    print(f"[DONE] Wrote {len(graphics)} SVG status/stat/admin assets.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())