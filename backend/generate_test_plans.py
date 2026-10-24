import os
from PIL import Image, ImageDraw, ImageFont

def create_test_plans():
    output_dir = os.path.join(os.path.dirname(__file__), "test_plans")
    os.makedirs(output_dir, exist_ok=True)

    # 1. Plan 1: Compliant
    img1 = Image.new("RGB", (1000, 700), color=(255, 255, 255))
    draw1 = ImageDraw.Draw(img1)
    
    # Outer site boundary
    draw1.rectangle([50, 50, 950, 650], outline=(40, 40, 40), width=4)
    # Proposed building footprint (rectangle)
    draw1.rectangle([150, 150, 650, 500], outline=(20, 80, 160), fill=(220, 235, 250), width=3)
    
    # Plan Title & Architectural Dimensions Annotation
    title1 = "ARCHITECTURAL SITE PLAN - PROPOSAL A"
    dims1 = "Ground Coverage: 45%, Rear Setback: 4m, Building Height: 10m"
    subtext1 = "Zone: Residential R-2 | Plot Area: 300 sq.m"
    
    # Draw text annotations
    draw1.text((70, 70), title1, fill=(0, 0, 0))
    draw1.text((70, 100), subtext1, fill=(100, 100, 100))
    draw1.text((180, 300), "PROPOSED BUILDING FOOTPRINT", fill=(20, 80, 160))
    
    # Key compliance text box (high visibility for OCR / Multimodal Vision)
    draw1.rectangle([70, 530, 930, 630], fill=(245, 247, 250), outline=(0, 100, 200), width=2)
    draw1.text((90, 550), "SCHEDULE OF ARCHITECTURAL PARAMETERS:", fill=(0, 51, 102))
    draw1.text((90, 580), dims1, fill=(0, 0, 0))

    plan1_path = os.path.join(output_dir, "plan1_compliant.jpg")
    img1.save(plan1_path, quality=95)
    print(f"Created: {plan1_path}")

    # 2. Plan 2: Violation
    img2 = Image.new("RGB", (1000, 700), color=(255, 255, 255))
    draw2 = ImageDraw.Draw(img2)
    
    # Outer site boundary
    draw2.rectangle([50, 50, 950, 650], outline=(40, 40, 40), width=4)
    # Proposed building footprint (rectangle - larger coverage, smaller setback)
    draw2.rectangle([100, 100, 850, 550], outline=(180, 40, 40), fill=(250, 230, 230), width=3)
    
    # Plan Title & Architectural Dimensions Annotation
    title2 = "ARCHITECTURAL SITE PLAN - PROPOSAL B"
    dims2 = "Ground Coverage: 65%, Rear Setback: 2m, Building Height: 14m"
    subtext2 = "Zone: Residential R-2 | Plot Area: 300 sq.m"
    
    # Draw text annotations
    draw2.text((70, 70), title2, fill=(0, 0, 0))
    draw2.text((70, 100), subtext2, fill=(100, 100, 100))
    draw2.text((180, 300), "PROPOSED BUILDING FOOTPRINT (EXCEEDS LIMITS)", fill=(180, 40, 40))
    
    # Key compliance text box
    draw2.rectangle([70, 570, 930, 630], fill=(255, 245, 245), outline=(200, 50, 50), width=2)
    draw2.text((90, 580), "SCHEDULE OF ARCHITECTURAL PARAMETERS:", fill=(150, 0, 0))
    draw2.text((90, 600), dims2, fill=(0, 0, 0))

    plan2_path = os.path.join(output_dir, "plan2_violation.jpg")
    img2.save(plan2_path, quality=95)
    print(f"Created: {plan2_path}")

if __name__ == "__main__":
    create_test_plans()
