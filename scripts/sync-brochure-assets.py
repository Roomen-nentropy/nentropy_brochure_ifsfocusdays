"""
Copy brochure PNGs from Desktop — no image processing (preserves remove.bg quality).
Run: python scripts/sync-brochure-assets.py
"""
from pathlib import Path
import shutil

SOURCE = Path(r"D:\User\Desktop\Brochure graphics")
TARGET = Path(__file__).resolve().parent.parent / "public" / "brochure-assets"

MAPPING = {
    "image-removebg-preview.png": "simply-works-man.png",
    "image-removebg-preview (1).png": "transparency-handshake.png",
    "image-removebg-preview (2).png": "growth-charts.png",
    "image-removebg-preview (3).png": "doc-certificates.png",
    "image-removebg-preview (4).png": "doc-transport.png",
    "image-removebg-preview (5).png": "doc-coa.png",
    "image-removebg-preview (6).png": "doc-batch.png",
    "image-removebg-preview (7).png": "doc-supplier-approval.png",
    "image-removebg-preview (8).png": "doc-nonconformity.png",
    "image-removebg-preview (9).png": "doc-training.png",
    "image-removebg-preview (10).png": "chaos-overwhelmed.png",
    "image-removebg-preview (11).png": "scanning-scene.png",
    "image-removebg-preview (12).png": "scanning-pdf-confused.png",
    "image-removebg-preview (13).png": "supply-farm.png",
    "image-removebg-preview (14).png": "supply-supplier.png",
    "image-removebg-preview (15).png": "supply-production.png",
    "image-removebg-preview (16).png": "supply-logistics.png",
    "image-removebg-preview (17).png": "supply-retail.png",
    "image-removebg-preview (18).png": "dpp-menu.png",
    "image-removebg-preview (19).png": "dpp-scan-flow.png",
    "image-removebg-preview (20).png": "dpp-qr-shopper.png",
    "image-removebg-preview (21).png": "layer-origin-data.png",
    "image-removebg-preview (22).png": "layer-certificates.png",
    "image-removebg-preview (23).png": "layer-quality.png",
    "image-removebg-preview (24).png": "layer-monitoring.png",
    "image-removebg-preview (25).png": "layer-traceability.png",
    "image-removebg-preview (26).png": "feedback-cycle.png",
    "image-removebg-preview (27).png": "feedback-thanks.png",
    "image-removebg-preview (28).png": "hidden-gold-scattered.png",
    "image-removebg-preview (29).png": "transformation-machine.png",
    "image-removebg-preview (30).png": "data-value-visuals.png",
    "image-removebg-preview (31).png": "forecasts-trends.png",
    "image-removebg-preview (32).png": "automated-compliance.png",
    "image-removebg-preview (33).png": "business-impact.png",
    "image-removebg-preview (34).png": "outcome-advantage.png",
    "image-removebg-preview (35).png": "dpp-phone-origin.png",
    "image-removebg-preview (36).png": "outcome-future.png",
}


def main() -> None:
    TARGET.mkdir(parents=True, exist_ok=True)
    for src_name, dest_name in MAPPING.items():
        src = SOURCE / src_name
        dest = TARGET / dest_name
        if not src.exists():
            print(f"MISSING {src_name}")
            continue
        shutil.copy2(src, dest)
        print(f"copied {dest_name}")
    print("done — no processing applied")


if __name__ == "__main__":
    main()
