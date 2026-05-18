"""
DEPRECATED — do not run unless you know you need edge matte removal.
This damaged line art when run on all pixels. Use sync-brochure-assets.py only.

Optional edge-only matte (borders only):
  python scripts/process-brochure-assets.py
"""
from collections import deque
from pathlib import Path
from PIL import Image

ASSETS = Path(__file__).resolve().parent.parent / "public" / "brochure-assets"
THRESHOLD = 25


def is_matte(r: int, g: int, b: int) -> bool:
    return r <= THRESHOLD and g <= THRESHOLD and b <= THRESHOLD


def knock_out_edge_matte(img: Image.Image) -> Image.Image:
    """Flood-fill from image borders — keeps interior dark strokes intact."""
    img = img.convert("RGBA")
    w, h = img.size
    px = img.load()
    q: deque[tuple[int, int]] = deque()
    seen: set[tuple[int, int]] = set()

    for x in range(w):
        for y in (0, h - 1):
            if is_matte(*px[x, y][:3]):
                q.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            if is_matte(*px[x, y][:3]):
                q.append((x, y))

    while q:
        x, y = q.popleft()
        if (x, y) in seen or x < 0 or x >= w or y < 0 or y >= h:
            continue
        r, g, b, a = px[x, y]
        if not is_matte(r, g, b):
            continue
        seen.add((x, y))
        px[x, y] = (r, g, b, 0)
        q.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))

    return img


def main() -> None:
    for path in sorted(ASSETS.glob("*.png")):
        img = knock_out_edge_matte(Image.open(path))
        img.save(path, optimize=True)
        print(f"ok {path.name}")
    print("done (edge matte only)")


if __name__ == "__main__":
    main()
