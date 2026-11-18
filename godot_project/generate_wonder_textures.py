from PIL import Image, ImageDraw, ImageFilter
import math
import os

assets_dir = r"d:\00-Desarrollo\Juego Ambar\godot_project\assets"
os.makedirs(assets_dir, exist_ok=True)

# 1. GENERATE WONDER QUESTION BLOCK TEXTURE (256x256)
def create_question_block():
    w, h = 256, 256
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Base golden-yellow gradient with bevel
    for y in range(h):
        ratio = y / h
        # Warm gold gradient
        r = int(255 - ratio * 35)
        g = int(210 - ratio * 45)
        b = int(25 - ratio * 15)
        draw.line([(0, y), (w, y)], fill=(r, g, b, 255))

    # Outer border (dark warm brown/gold)
    border_color = (180, 115, 10, 255)
    inner_highlight = (255, 245, 160, 255)
    inner_shadow = (140, 80, 5, 255)

    draw.rectangle([0, 0, w - 1, h - 1], outline=border_color, width=6)
    draw.rectangle([6, 6, w - 7, h - 7], outline=inner_highlight, width=4)
    # Bottom/Right bevel shadow
    draw.line([(8, h - 9), (w - 9, h - 9)], fill=inner_shadow, width=5)
    draw.line([(w - 9, 8), (w - 9, h - 9)], fill=inner_shadow, width=5)

    # Rivets / bolts in 4 corners
    corners = [(24, 24), (w - 24, 24), (24, h - 24), (w - 24, h - 24)]
    for cx, cy in corners:
        draw.ellipse([cx - 8, cy - 8, cx + 8, cy + 8], fill=(120, 65, 5, 255))
        draw.ellipse([cx - 6, cy - 6, cx + 6, cy + 6], fill=(240, 180, 20, 255))
        draw.ellipse([cx - 4, cy - 4, cx + 2, cy + 2], fill=(255, 245, 180, 255))

    # Draw crisp stylized Question Mark in center
    # Drop shadow
    def draw_q(offset_x, offset_y, color):
        # Top arch
        draw.arc([w // 2 - 44 + offset_x, 48 + offset_y, w // 2 + 44 + offset_x, 136 + offset_y], start=210, end=390, fill=color, width=18)
        # Vertical stem
        draw.line([w // 2 + offset_x, 126 + offset_y, w // 2 + offset_x, 162 + offset_y], fill=color, width=18)
        # Dot
        draw.ellipse([w // 2 - 10 + offset_x, 184 + offset_y, w // 2 + 10 + offset_x, 204 + offset_y], fill=color)

    # Shadow
    draw_q(4, 5, (110, 60, 0, 220))
    # Outer dark outline
    draw_q(0, 0, (60, 30, 0, 255))
    # Pure white main fill
    draw_q(-2, -2, (255, 255, 255, 255))

    img.save(os.path.join(assets_dir, "tex_question_block.png"))
    print("Saved tex_question_block.png")

# 2. GENERATE LUSH 2-TONE GRASS & EARTH PLATFORM TEXTURE (512x256)
def create_platform_texture():
    w, h = 512, 256
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    grass_h = 75

    # --- DIRT BODY (y = grass_h to h) ---
    for y in range(grass_h, h):
        ratio = (y - grass_h) / (h - grass_h)
        # Rich warm chocolate earth
        r = int(145 - ratio * 35)
        g = int(82 - ratio * 20)
        b = int(42 - ratio * 10)
        draw.line([(0, y), (w, y)], fill=(r, g, b, 255))

    # Stylized earth cobblestones / brick details
    import random
    random.seed(42)
    brick_colors = [(165, 95, 52, 255), (130, 72, 36, 255), (115, 62, 30, 255), (175, 105, 58, 255)]
    for row in range(4):
        by = grass_h + 12 + row * 40
        shift = (row % 2) * 35
        for bx in range(-40, w + 40, 70):
            x = bx + shift + random.randint(-4, 4)
            bw = random.randint(48, 62)
            bh = random.randint(24, 30)
            col = random.choice(brick_colors)
            # Rounded brick
            draw.rounded_rectangle([x, by, x + bw, by + bh], radius=7, fill=col, outline=(90, 48, 22, 255), width=2)

    # --- GRASS TURF CAP (y = 0 to grass_h) ---
    for y in range(grass_h):
        ratio = y / grass_h
        # Vibrant Mario Wonder lime green
        r = int(110 - ratio * 45)
        g = int(235 - ratio * 50)
        b = int(75 - ratio * 30)
        draw.line([(0, y), (w, y)], fill=(r, g, b, 255))

    # Top highlight line
    draw.line([(0, 2), (w, 2)], fill=(185, 255, 130, 255), width=4)

    # Scalloped cartoon grass blades hanging down into the dirt
    for x in range(0, w, 24):
        blade_h = random.randint(14, 26)
        draw.polygon([
            (x, grass_h - 2),
            (x + 12, grass_h + blade_h),
            (x + 24, grass_h - 2)
        ], fill=(70, 180, 45, 255))
        # blade highlight
        draw.polygon([
            (x + 3, grass_h - 2),
            (x + 12, grass_h + blade_h - 3),
            (x + 16, grass_h - 2)
        ], fill=(105, 225, 65, 255))

    img.save(os.path.join(assets_dir, "tex_platform_grass.png"))
    print("Saved tex_platform_grass.png")

# 3. GENERATE STYLIZED WONDER BUSH / FLOWERS (256x128)
def create_wonder_bush():
    w, h = 256, 128
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Three overlapping lush cartoon foliage spheres
    circles = [
        (64, 75, 48, (45, 175, 65, 255), (85, 225, 95, 255)),
        (192, 75, 48, (45, 175, 65, 255), (85, 225, 95, 255)),
        (128, 60, 62, (55, 195, 75, 255), (105, 245, 115, 255))
    ]
    for cx, cy, r, base_col, high_col in circles:
        # Dark shadow outline
        draw.ellipse([cx - r - 3, cy - r - 3, cx + r + 3, cy + r + 3], fill=(25, 110, 40, 255))
        # Base fill
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=base_col)
        # Highlight crescent
        draw.ellipse([cx - r + 8, cy - r + 6, cx + r - 8, cy - r + 28], fill=high_col)

    # Cute Wonder flower in center
    fx, fy = 128, 55
    petal_col = (255, 105, 180, 255)
    for ang in [0, 60, 120, 180, 240, 300]:
        rad = math.radians(ang)
        px = fx + int(math.cos(rad) * 16)
        py = fy + int(math.sin(rad) * 16)
        draw.ellipse([px - 8, py - 8, px + 8, py + 8], fill=petal_col)
    # Center gold pistil
    draw.ellipse([fx - 7, fy - 7, fx + 7, fy + 7], fill=(255, 230, 40, 255))

    img.save(os.path.join(assets_dir, "tex_wonder_bush.png"))
    print("Saved tex_wonder_bush.png")

create_question_block()
create_platform_texture()
create_wonder_bush()
