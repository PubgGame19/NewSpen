#!/usr/bin/env python3
"""
Build every SPENANCE web asset from the two source artworks:

  assets/brand/spenance-logo-source.jpg      flat white JPEG — logo lockup
  assets/brand/spenance-app-icon-source.png  transparent PNG — app icon mark

Outputs
  public/brand/mark-on-light.png       logo mark, original black/red/gold ink
  public/brand/mark-on-dark.png        logo mark, neutral ink turned white
  public/brand/lockup-on-light.png     lockup + wordmark + tagline (light)
  public/brand/lockup-on-dark.png      lockup + wordmark + tagline (dark)
  public/favicon.ico                   16/32/48 multi-size tab icon, light ink
  public/favicon-dark.ico              16/32/48 multi-size tab icon, white ink
  public/favicon.png                   transparent tab icon, light ink
  public/favicon-dark.png              transparent tab icon, white ink
  public/apple-touch-icon.png          180px tile (iOS home screen)
  public/icon-192.png, icon-512.png    PWA icons (also maskable: full bleed)
  public/icon-monochrome.png           512px alpha-only mask (manifest, dark/themed)
  public/og-image.jpg                  1200x630 social/metadata card

Only ``numpy`` and ``Pillow`` are required:

    python scripts/build-brand-assets.py
"""

from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
LOGO_SOURCE = ROOT / "assets" / "brand" / "spenance-logo-source.jpg"
APP_SOURCE = ROOT / "assets" / "brand" / "spenance-app-icon-source.png"
BRAND_DIR = ROOT / "public" / "brand"

# A pixel counts as ink when its darkest channel is below this value.
INK_THRESHOLD = 240
# Ink whose channels differ by less than this is treated as black/grey.
NEUTRAL_SPREAD = 34
# Ink recoloured to white in the *-on-dark variants may be no brighter than this.
NEUTRAL_MAX_LUMA = 210
# Faint pixels below this alpha are rendered artwork shadow noise, not ink.
ALPHA_FLOOR = 6

# Bounding boxes measured from the source artwork (left, top, right, bottom).
LOCKUP_BOX = (56, 234, 1472, 801)
APP_MARK_BOX = (107, 60, 1196, 1188)

# Web export widths (the artwork is only ever displayed much smaller).
MARK_WIDTH = 320
LOCKUP_WIDTH = 800
# Tab icons ship at 2x the 32px the largest browser tab raster uses.
FAVICON_SIZE = 96

BRAND_RED = (186, 12, 16)
BRAND_GOLD = (226, 170, 33)
BRAND_GREEN = (4, 120, 87)
# Matches --color-ink-950, the app's dark surface / theme color.
BRAND_INK = (11, 18, 32)


# --------------------------------------------------------------------------- #
# colour handling
# --------------------------------------------------------------------------- #


def unmultiply_white(rgb: np.ndarray) -> np.ndarray:
    """Split flat-white artwork into straight RGBA (GIMP's colour-to-alpha).

    Every pixel is assumed to be ``colour * alpha + white * (1 - alpha)``; the
    alpha is derived from the darkest channel and the colour is divided back
    out, so the artwork composites identically over white while keeping usable
    colours over any other background.
    """
    ink = 255.0 - rgb.min(axis=2)
    alpha = np.clip(ink, 0.0, 255.0)
    scale = np.maximum(alpha, 1.0) / 255.0
    colour = (rgb - 255.0 * (1.0 - scale[..., None])) / scale[..., None]

    rgba = np.dstack([np.clip(colour, 0.0, 255.0), alpha]).astype(np.uint8)
    rgba[alpha < 1.0] = 0
    return rgba


def neutral_ink_to_white(rgba: np.ndarray) -> np.ndarray:
    """Recolour black / grey artwork to white, leaving red and gold intact."""
    colour = rgba[..., :3].astype(np.int16)
    spread = colour.max(axis=2) - colour.min(axis=2)
    luma = colour.mean(axis=2)
    neutral = (spread <= NEUTRAL_SPREAD) & (luma <= NEUTRAL_MAX_LUMA)

    out = rgba.copy()
    out[..., :3][neutral] = 255
    return out


def clean_alpha(rgba: np.ndarray, floor: int = ALPHA_FLOOR) -> np.ndarray:
    out = rgba.copy()
    out[..., 3][out[..., 3] < floor] = 0
    return out


# --------------------------------------------------------------------------- #
# geometry helpers
# --------------------------------------------------------------------------- #


def square_canvas(rgba: np.ndarray, side: int) -> np.ndarray:
    """Centre `rgba` on a transparent square canvas."""
    canvas = np.zeros((side, side, 4), dtype=np.uint8)
    patch = rgba
    y = (side - patch.shape[0]) // 2
    x = (side - patch.shape[1]) // 2
    canvas[y : y + patch.shape[0], x : x + patch.shape[1]] = patch
    return canvas


def crop(rgba: np.ndarray, box: tuple[int, int, int, int], width: int, height: int) -> np.ndarray:
    left, top, right, bottom = box
    patch = rgba[top:bottom, left:right]
    canvas = np.zeros((height, width, 4), dtype=np.uint8)
    y = (height - patch.shape[0]) // 2
    x = (width - patch.shape[1]) // 2
    canvas[y : y + patch.shape[0], x : x + patch.shape[1]] = patch
    return canvas


def art_from(path: Path, box: tuple[int, int, int, int]) -> np.ndarray:
    """Load a source, crop its ink box and return straight RGBA."""
    image = Image.open(path)
    if image.mode == "RGBA":
        # Already transparent art with straight alpha — no unmultiply needed.
        art = np.asarray(image).astype(np.uint8)
    else:
        art = unmultiply_white(
            np.asarray(image.convert("RGB")).astype(np.float32)
        )
    left, top, right, bottom = box
    return clean_alpha(art[top:bottom, left:right])


# --------------------------------------------------------------------------- #
# writers
# --------------------------------------------------------------------------- #


def save(rgba: np.ndarray, path: Path, width: int) -> None:
    """Downsample to `width` and palette-quantise the alpha artwork."""
    image = Image.fromarray(rgba, "RGBA")
    height = round(image.height * width / image.width)
    image = image.resize((width, height), Image.LANCZOS).quantize(
        colors=256, method=Image.FASTOCTREE, dither=Image.FLOYDSTEINBERG
    )
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path, optimize=True)


def save_tile(tile: Image.Image, path: Path) -> None:
    """Icons are flat artwork — a 256 colour palette keeps them tiny."""
    tile.convert("RGBA").quantize(
        colors=256, method=Image.FASTOCTREE, dither=Image.FLOYDSTEINBERG
    ).save(path, optimize=True)


def tight_resize(mark: np.ndarray, size: int) -> Image.Image:
    """Scale the (already tight) mark so the logo fills the whole icon."""
    artwork = Image.fromarray(mark, "RGBA")
    scale = size / max(artwork.width, artwork.height)
    artwork = artwork.resize(
        (max(1, round(artwork.width * scale)), max(1, round(artwork.height * scale))),
        Image.LANCZOS,
    )
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    canvas.alpha_composite(
        artwork, ((size - artwork.width) // 2, (size - artwork.height) // 2)
    )
    return canvas


def icon_tile(
    mark: np.ndarray,
    size: int,
    inset: float,
    rounded: bool,
    background: tuple[int, int, int] = (255, 255, 255),
) -> Image.Image:
    """Emblem on an opaque tile — app icons need a solid background."""
    artwork = Image.fromarray(mark, "RGBA")
    inner_size = max(1, int(size * (1 - inset)))
    scale = min(inner_size / artwork.width, inner_size / artwork.height)
    artwork = artwork.resize(
        (max(1, round(artwork.width * scale)), max(1, round(artwork.height * scale))),
        Image.LANCZOS,
    )

    tile = Image.new("RGBA", (size, size), tuple(background) + (255,))
    if rounded:
        mask = Image.new("L", (size * 4, size * 4), 0)
        ImageDraw.Draw(mask).rounded_rectangle(
            (0, 0, size * 4 - 1, size * 4 - 1), radius=int(size * 1.1), fill=255
        )
        tile.putalpha(mask.resize((size, size), Image.LANCZOS))

    offset = ((size - artwork.width) // 2, (size - artwork.height) // 2)
    tile.alpha_composite(artwork, offset)
    return tile


def monochrome_icon(mark: np.ndarray, size: int) -> Image.Image:
    """Alpha-only mask: browsers mask a solid fill with the alpha channel, so
    the shape must survive while every colour is discarded."""
    artwork = Image.fromarray(mark, "RGBA")
    scale = size / max(artwork.width, artwork.height)
    artwork = artwork.resize(
        (round(artwork.width * scale), round(artwork.height * scale)),
        Image.LANCZOS,
    )
    canvas = Image.new("RGBA", (size, size), (255, 255, 255, 0))
    canvas.alpha_composite(artwork, ((size - artwork.width) // 2, (size - artwork.height) // 2))
    white = Image.new("RGBA", (size, size), (255, 255, 255, 255))
    white.putalpha(canvas.getchannel("A"))
    return white


def build_og_image(lockup: np.ndarray) -> Image.Image:
    """1200x630 metadata card: brand bar + soft glows + centred lockup."""
    width, height = 1200, 630
    canvas = Image.new("RGBA", (width, height), (255, 255, 255, 255))
    draw = ImageDraw.Draw(canvas)

    # thin red → gold brand bar along the top edge
    for x in range(width):
        t = x / (width - 1)
        colour = tuple(
            round(a + (b - a) * t) for a, b in zip(BRAND_RED, BRAND_GOLD)
        )
        draw.line([(x, 0), (x, 5)], fill=colour + (255,))

    # soft brand glows, blurred so they read as light rather than shapes
    glow = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    glow_draw.ellipse((-260, -320, 640, 540), fill=BRAND_RED + (34,))
    glow_draw.ellipse((740, 240, 1520, 960), fill=BRAND_GREEN + (30,))
    glow = glow.filter(ImageFilter.GaussianBlur(90))
    canvas = Image.alpha_composite(canvas, glow)

    artwork = Image.fromarray(lockup, "RGBA")
    scale = 940 / artwork.width
    artwork = artwork.resize(
        (940, round(artwork.height * scale)), Image.LANCZOS
    )
    canvas.alpha_composite(
        artwork, ((width - artwork.width) // 2, (height - artwork.height) // 2)
    )
    return canvas


# --------------------------------------------------------------------------- #


def main() -> None:
    for source in (LOGO_SOURCE, APP_SOURCE):
        if not source.exists():
            raise SystemExit(f"missing source artwork: {source}")

    # ---- lockup from the flat JPEG (icon + wordmark + tagline) ------------
    lockup_rgb = np.asarray(Image.open(LOGO_SOURCE).convert("RGB")).astype(np.float32)
    lockup_rgba = unmultiply_white(lockup_rgb)
    lock_w = LOCKUP_BOX[2] - LOCKUP_BOX[0]
    lock_h = LOCKUP_BOX[3] - LOCKUP_BOX[1]
    lockup = crop(lockup_rgba, LOCKUP_BOX, lock_w, lock_h)
    lockup_on_dark = neutral_ink_to_white(lockup)

    # ---- mark from the transparent app-icon PNG ---------------------------
    mark_src = art_from(APP_SOURCE, APP_MARK_BOX)
    side = max(mark_src.shape[0], mark_src.shape[1])
    mark = square_canvas(mark_src, side)
    mark_on_dark = neutral_ink_to_white(mark)

    save(mark, BRAND_DIR / "mark-on-light.png", MARK_WIDTH)
    save(mark_on_dark, BRAND_DIR / "mark-on-dark.png", MARK_WIDTH)
    save(lockup, BRAND_DIR / "lockup-on-light.png", LOCKUP_WIDTH)
    save(lockup_on_dark, BRAND_DIR / "lockup-on-dark.png", LOCKUP_WIDTH)

    # Tab bar: the logo itself, transparent and edge to edge, so it reads as the
    # brand at 16px instead of a small mark inside a white tile.
    tab_icon = tight_resize(mark, FAVICON_SIZE)
    # no dithering: at 16px a speckled icon reads as noise
    tab_icon.quantize(colors=128, method=Image.FASTOCTREE, dither=Image.NONE).save(
        ROOT / "public" / "favicon.png", optimize=True
    )
    tight_resize(mark_on_dark, FAVICON_SIZE).quantize(
        colors=128, method=Image.FASTOCTREE, dither=Image.NONE
    ).save(ROOT / "public" / "favicon-dark.png", optimize=True)
    # both schemes ship their own .ico so no scheme can pick the wrong artwork
    tab_icon.save(
        ROOT / "public" / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)]
    )
    tight_resize(mark_on_dark, FAVICON_SIZE).save(
        ROOT / "public" / "favicon-dark.ico", sizes=[(16, 16), (32, 32), (48, 48)]
    )
    # grayscale + alpha keeps the mask under 20 KB with all 256 alpha levels
    monochrome_icon(mark, 512).convert("LA").save(
        ROOT / "public" / "icon-monochrome.png", optimize=True
    )
    for size in (180, 192, 512):
        name = "apple-touch-icon.png" if size == 180 else f"icon-{size}.png"
        save_tile(
            icon_tile(mark, size, inset=0.12, rounded=False), ROOT / "public" / name
        )
    build_og_image(lockup).convert("RGB").save(
        ROOT / "public" / "og-image.jpg", quality=90, optimize=True, progressive=True
    )

    # ---- verification -----------------------------------------------------
    def composite(asset: np.ndarray, background: tuple[int, int, int]) -> np.ndarray:
        a = asset[..., 3:4].astype(np.float32) / 255.0
        return asset[..., :3].astype(np.float32) * a + np.array(background) * (1 - a)

    round_trip = np.abs(
        composite(lockup, (255, 255, 255))
        - lockup_rgb[LOCKUP_BOX[1] : LOCKUP_BOX[3], LOCKUP_BOX[0] : LOCKUP_BOX[2]]
    ).mean()
    ink = mark[..., 3] > 200
    dark_ink = mark_on_dark[..., 3] > 200
    print(f"mark   source {mark_src.shape[1]}x{mark_src.shape[0]} -> square {side}, export {MARK_WIDTH}px")
    print(f"lockup source {lockup.shape[1]}x{lockup.shape[0]} -> export {LOCKUP_WIDTH}px")
    print(f"white round-trip mean abs diff: {round_trip:.2f} / 255")
    print(
        f"mark on-light ink mean RGB {mark[ink][:, :3].mean(axis=0).round(0)} | "
        f"on-dark ink mean RGB {mark_on_dark[dark_ink][:, :3].mean(axis=0).round(0)}"
    )
    # the tab icon must be dominated by the logo, not by empty padding
    icon_alpha = np.asarray(Image.open(ROOT / "public" / "favicon.png").convert("RGBA"))[..., 3]
    icon_ink = icon_alpha > 8
    ys, xs = np.where(icon_ink)
    print(
        f"favicon {FAVICON_SIZE}px: ink covers {icon_ink.mean():.1%} of the tile, "
        f"bbox {xs.max() - xs.min() + 1}x{ys.max() - ys.min() + 1}"
    )

    for name in (
        "brand/mark-on-light.png",
        "brand/mark-on-dark.png",
        "brand/lockup-on-light.png",
        "brand/lockup-on-dark.png",
        "favicon.ico",
        "favicon-dark.ico",
        "favicon.png",
        "favicon-dark.png",
        "apple-touch-icon.png",
        "icon-192.png",
        "icon-512.png",
        "icon-monochrome.png",
        "og-image.jpg",
    ):
        path = ROOT / "public" / name
        image = Image.open(path)
        print(f"  {name:<28} {image.width}x{image.height}  {path.stat().st_size / 1024:.1f} KB")


if __name__ == "__main__":
    main()
