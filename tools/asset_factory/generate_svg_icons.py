from __future__ import annotations

from pathlib import Path


STROKE = 'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"'
FILL_NONE = 'fill="none"'


def repo_root_from_script() -> Path:
    return Path(__file__).resolve().parents[2]


def wrap(body: str, *, filled: bool = False) -> str:
    fill_attr = 'fill="currentColor"' if filled else FILL_NONE
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" role="img" aria-hidden="true">
  <g {fill_attr} {STROKE}>
{body.rstrip()}
  </g>
</svg>
'''


def write(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content.strip() + "\n", encoding="utf-8")
    print(f"[OK] {path}")


def icon_home() -> str:
    return wrap("""
    <path d="M3 11.5 12 4l9 7.5"/>
    <path d="M5.5 10.5V20h13v-9.5"/>
    <path d="M9.5 20v-6h5v6"/>
""")


def icon_journal() -> str:
    return wrap("""
    <path d="M6 4h10a2 2 0 0 1 2 2v14H8a2 2 0 0 1-2-2z"/>
    <path d="M8 4v16"/>
    <path d="M11 8h4"/>
    <path d="M11 12h5"/>
""")


def icon_restaurant() -> str:
    return wrap("""
    <path d="M7 3v18"/>
    <path d="M4.5 3v6a2.5 2.5 0 0 0 5 0V3"/>
    <path d="M17 3v18"/>
    <path d="M17 3c2.2 1.8 3 4.2 2.2 7.2-.4 1.5-1.2 2.6-2.2 3.3"/>
""")


def icon_review() -> str:
    return wrap("""
    <path d="M5 4h14v12H8l-3 3z"/>
    <path d="m9 10 2 2 4-4"/>
""")


def icon_recipe() -> str:
    return wrap("""
    <path d="M6 4h10a2 2 0 0 1 2 2v14H8a2 2 0 0 1-2-2z"/>
    <path d="M9 8h6"/>
    <path d="M9 12h6"/>
    <path d="M9 16h3"/>
""")


def icon_cocktail() -> str:
    return wrap("""
    <path d="M5 4h14l-7 8z"/>
    <path d="M12 12v7"/>
    <path d="M8.5 20h7"/>
    <path d="M8 7h8"/>
""")


def icon_ingredient() -> str:
    return wrap("""
    <path d="M6 13c0-4 3-7 7-7 2 0 3.5.7 5 2-1 5-4 9-9 9-2 0-3-1-3-4z"/>
    <path d="M9 14c2.5-1.5 5-3.5 8-7"/>
""")


def icon_supplier() -> str:
    return wrap("""
    <path d="M4 10h16"/>
    <path d="M5 10l1-5h12l1 5"/>
    <path d="M6 10v9h12v-9"/>
    <path d="M9 19v-5h6v5"/>
""")


def icon_equipment() -> str:
    return wrap("""
    <path d="M4 18h16"/>
    <path d="M6 18V9a6 6 0 0 1 12 0v9"/>
    <path d="M8 9h8"/>
    <path d="M10 5.5h4"/>
""")


def icon_collection() -> str:
    return wrap("""
    <rect x="5" y="5" width="12" height="14" rx="2"/>
    <path d="M8 3h10a2 2 0 0 1 2 2v12"/>
    <path d="M8 9h6"/>
    <path d="M8 13h5"/>
""")


def icon_link() -> str:
    return wrap("""
    <path d="M9.5 14.5 14.5 9.5"/>
    <path d="M10.5 7.5 12 6a4 4 0 0 1 5.7 5.7l-1.5 1.5"/>
    <path d="M13.5 16.5 12 18a4 4 0 0 1-5.7-5.7l1.5-1.5"/>
""")


def icon_search() -> str:
    return wrap("""
    <circle cx="10.5" cy="10.5" r="6"/>
    <path d="m15 15 5 5"/>
""")


def icon_filter() -> str:
    return wrap("""
    <path d="M4 6h16"/>
    <path d="M7 12h10"/>
    <path d="M10 18h4"/>
""")


def icon_menu() -> str:
    return wrap("""
    <path d="M4 7h16"/>
    <path d="M4 12h16"/>
    <path d="M4 17h16"/>
""")


def icon_close() -> str:
    return wrap("""
    <path d="M6 6l12 12"/>
    <path d="M18 6 6 18"/>
""")


def icon_chevron_right() -> str:
    return wrap("""
    <path d="m9 6 6 6-6 6"/>
""")


def icon_chevron_down() -> str:
    return wrap("""
    <path d="m6 9 6 6 6-6"/>
""")


def icon_external_link() -> str:
    return wrap("""
    <path d="M14 5h5v5"/>
    <path d="m19 5-8 8"/>
    <path d="M19 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h4"/>
""")


def icon_map_pin() -> str:
    return wrap("""
    <path d="M12 21s7-5.5 7-11a7 7 0 0 0-14 0c0 5.5 7 11 7 11z"/>
    <circle cx="12" cy="10" r="2.5"/>
""")


def icon_calendar() -> str:
    return wrap("""
    <rect x="4" y="5" width="16" height="15" rx="2"/>
    <path d="M8 3v4"/>
    <path d="M16 3v4"/>
    <path d="M4 10h16"/>
""")


def icon_tag() -> str:
    return wrap("""
    <path d="M4 5v6l8.5 8.5a2 2 0 0 0 2.8 0l4.2-4.2a2 2 0 0 0 0-2.8L11 4H5a1 1 0 0 0-1 1z"/>
    <circle cx="8" cy="8" r="1"/>
""")


def star_path() -> str:
    return '<path d="M12 3.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8L12 16.9 6.7 19.6l1-5.8-4.2-4.1 5.9-.9z"/>'


def icon_star() -> str:
    return wrap(f"""
    {star_path()}
""")


def icon_star_filled() -> str:
    return '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" role="img" aria-hidden="true">
  <path d="M12 3.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8L12 16.9 6.7 19.6l1-5.8-4.2-4.1 5.9-.9z"
        fill="currentColor"/>
</svg>
'''


def icon_price() -> str:
    return wrap("""
    <path d="M12 3v18"/>
    <path d="M16.5 7.5c-.8-1.2-2.2-2-4.1-2-2.1 0-3.7 1.1-3.7 2.8 0 1.9 1.9 2.5 3.8 3.1 2 .6 4 1.2 4 3.4 0 1.8-1.7 3.2-4.1 3.2-2 0-3.7-.8-4.8-2.2"/>
""")


def icon_camera() -> str:
    return wrap("""
    <path d="M5 7h3l1.5-2h5L16 7h3a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z"/>
    <circle cx="12" cy="13" r="3.5"/>
""")


def icon_gallery() -> str:
    return wrap("""
    <rect x="4" y="5" width="14" height="14" rx="2"/>
    <path d="M8 3h10a2 2 0 0 1 2 2v10"/>
    <path d="m7 16 3.5-4 2.5 3 2-2 3 3"/>
""")


def icon_stats() -> str:
    return wrap("""
    <path d="M5 19V9"/>
    <path d="M12 19V5"/>
    <path d="M19 19v-7"/>
    <path d="M3 19h18"/>
""")


def icon_lock() -> str:
    return wrap("""
    <rect x="5" y="10" width="14" height="10" rx="2"/>
    <path d="M8 10V7a4 4 0 0 1 8 0v3"/>
""")


def icon_admin() -> str:
    return wrap("""
    <circle cx="12" cy="8" r="4"/>
    <path d="M5 21a7 7 0 0 1 14 0"/>
    <path d="M18 4l2-2"/>
""")


def icon_draft() -> str:
    return wrap("""
    <path d="M5 4h10l4 4v12H5z"/>
    <path d="M15 4v4h4"/>
    <path d="M8 16h5"/>
""")


def icon_published() -> str:
    return wrap("""
    <circle cx="12" cy="12" r="9"/>
    <path d="m8 12 2.5 2.5L16 9"/>
""")


def icon_wishlist() -> str:
    return wrap("""
    <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>
""")


def icon_visited() -> str:
    return wrap("""
    <path d="M20 6 9 17l-5-5"/>
""")


def icon_reservation() -> str:
    return wrap("""
    <rect x="4" y="5" width="16" height="15" rx="2"/>
    <path d="M8 3v4"/>
    <path d="M16 3v4"/>
    <path d="M4 10h16"/>
    <path d="M8 15h5"/>
""")


def icon_globe() -> str:
    return wrap("""
    <circle cx="12" cy="12" r="9"/>
    <path d="M3 12h18"/>
    <path d="M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9"/>
    <path d="M12 3c-2.5 2.5-3.5 5.5-3.5 9s1 6.5 3.5 9"/>
""")


def icon_clock() -> str:
    return wrap("""
    <circle cx="12" cy="12" r="9"/>
    <path d="M12 7v5l3 2"/>
""")


def icon_difficulty() -> str:
    return wrap("""
    <path d="M4 18h16"/>
    <path d="M6 18v-4"/>
    <path d="M12 18v-8"/>
    <path d="M18 18V6"/>
""")


def icon_serving() -> str:
    return wrap("""
    <circle cx="8" cy="8" r="3"/>
    <circle cx="16" cy="8" r="3"/>
    <path d="M4 21a4 4 0 0 1 8 0"/>
    <path d="M12 21a4 4 0 0 1 8 0"/>
""")


def icon_glass() -> str:
    return icon_cocktail()


def icon_ice() -> str:
    return wrap("""
    <path d="M8 4h8l4 6-8 10-8-10z"/>
    <path d="M8 4l4 16"/>
    <path d="M16 4l-4 16"/>
    <path d="M4 10h16"/>
""")


def icon_shaker() -> str:
    return wrap("""
    <path d="M9 3h6"/>
    <path d="M8 6h8l1 14H7z"/>
    <path d="M8.5 10h7"/>
""")


def icon_knife() -> str:
    return wrap("""
    <path d="M14 3c3 3 4 6 2 8l-8 8-3-3 8-8c1-1 1-3 1-5z"/>
    <path d="M5 16l3 3"/>
""")


def icon_pan() -> str:
    return wrap("""
    <path d="M4 14a6 4 0 0 0 12 0H4z"/>
    <path d="M16 14h5"/>
    <path d="M7 10h6"/>
""")


def icon_grill() -> str:
    return wrap("""
    <path d="M5 10h14"/>
    <path d="M7 10a5 5 0 0 0 10 0"/>
    <path d="M9 15l-2 5"/>
    <path d="M15 15l2 5"/>
    <path d="M12 15v5"/>
""")


def icon_market() -> str:
    return icon_supplier()


def icon_box() -> str:
    return wrap("""
    <path d="M4 8 12 4l8 4-8 4z"/>
    <path d="M4 8v8l8 4 8-4V8"/>
    <path d="M12 12v8"/>
""")


def icon_note() -> str:
    return wrap("""
    <path d="M6 4h9l3 3v13H6z"/>
    <path d="M15 4v4h3"/>
    <path d="M9 12h6"/>
    <path d="M9 16h4"/>
""")


def icon_source() -> str:
    return wrap("""
    <path d="M6 5h12v14H6z"/>
    <path d="M9 8h6"/>
    <path d="M9 12h6"/>
    <path d="M9 16h3"/>
""")


ICONS = {
    "icon-home-line-24.svg": icon_home,
    "icon-journal-line-24.svg": icon_journal,
    "icon-restaurant-line-24.svg": icon_restaurant,
    "icon-review-line-24.svg": icon_review,
    "icon-recipe-line-24.svg": icon_recipe,
    "icon-cocktail-line-24.svg": icon_cocktail,
    "icon-ingredient-line-24.svg": icon_ingredient,
    "icon-supplier-line-24.svg": icon_supplier,
    "icon-equipment-line-24.svg": icon_equipment,
    "icon-collection-line-24.svg": icon_collection,
    "icon-link-line-24.svg": icon_link,
    "icon-search-line-24.svg": icon_search,
    "icon-filter-line-24.svg": icon_filter,
    "icon-menu-line-24.svg": icon_menu,
    "icon-close-line-24.svg": icon_close,
    "icon-chevron-right-line-24.svg": icon_chevron_right,
    "icon-chevron-down-line-24.svg": icon_chevron_down,
    "icon-external-link-line-24.svg": icon_external_link,
    "icon-map-pin-line-24.svg": icon_map_pin,
    "icon-calendar-line-24.svg": icon_calendar,
    "icon-tag-line-24.svg": icon_tag,
    "icon-star-line-24.svg": icon_star,
    "icon-star-filled-24.svg": icon_star_filled,
    "icon-price-line-24.svg": icon_price,
    "icon-camera-line-24.svg": icon_camera,
    "icon-gallery-line-24.svg": icon_gallery,
    "icon-stats-line-24.svg": icon_stats,
    "icon-lock-line-24.svg": icon_lock,
    "icon-admin-line-24.svg": icon_admin,
    "icon-draft-line-24.svg": icon_draft,
    "icon-published-line-24.svg": icon_published,
    "icon-wishlist-line-24.svg": icon_wishlist,
    "icon-visited-line-24.svg": icon_visited,
    "icon-reservation-line-24.svg": icon_reservation,
    "icon-globe-line-24.svg": icon_globe,
    "icon-clock-line-24.svg": icon_clock,
    "icon-difficulty-line-24.svg": icon_difficulty,
    "icon-serving-line-24.svg": icon_serving,
    "icon-glass-line-24.svg": icon_glass,
    "icon-ice-line-24.svg": icon_ice,
    "icon-shaker-line-24.svg": icon_shaker,
    "icon-knife-line-24.svg": icon_knife,
    "icon-pan-line-24.svg": icon_pan,
    "icon-grill-line-24.svg": icon_grill,
    "icon-market-line-24.svg": icon_market,
    "icon-box-line-24.svg": icon_box,
    "icon-note-line-24.svg": icon_note,
    "icon-source-line-24.svg": icon_source,
}


def main() -> int:
    root = repo_root_from_script()
    icon_dir = root / "public" / "assets" / "icons"

    for filename, factory in ICONS.items():
        write(icon_dir / filename, factory())

    print(f"[DONE] Wrote {len(ICONS)} icons.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())