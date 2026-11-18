from PIL import Image, ImageDraw
import os
import random

assets_dir = r"d:\00-Desarrollo\Juego Ambar\godot_project\assets"
os.makedirs(assets_dir, exist_ok=True)

# 1. CLEAN RICH EARTH BRICKS (256x256)
def create_dirt_bricks():
    w, h = 256, 256
    img = Image.new("RGBA", (w, h), (145, 82, 42, 255))
    draw = ImageDraw.Draw(img)

    random.seed(123)
    brick_colors = [
        (165, 95, 52, 255),
        (130, 72, 36, 255),
        (115, 62, 30, 255),
        (175, 105, 58, 255),
        (140, 78, 38, 255)
    ]
    
    # 4 rows of bricks
    row_h = 64
    for r in range(4):
        by = r * row_h + 4
        shift = (r % 2) * 64
        for bx in range(-64, w + 64, 128):
            x = bx + shift + random.randint(-2, 2)
            bw = 120
            bh = 54
            col = random.choice(brick_colors)
            draw.rounded_rectangle([x, by, x + bw, by + bh], radius=8, fill=col, outline=(85, 45, 20, 255), width=3)
            # Subtle top-left highlight inside brick
            draw.line([(x + 8, by + 4), (x + bw - 8, by + 4)], fill=(195, 125, 75, 160), width=2)
            draw.line([(x + 4, by + 8), (x + 4, by + bh - 8)], fill=(195, 125, 75, 160), width=2)

    img.save(os.path.join(assets_dir, "tex_dirt_bricks.png"))
    print("Saved tex_dirt_bricks.png")

# 2. LUSH GREEN GRASS TOP (256x256)
def create_grass_top():
    w, h = 256, 256
    img = Image.new("RGBA", (w, h), (72, 215, 80, 255))
    draw = ImageDraw.Draw(img)

    random.seed(456)
    # Subtle grass tufts and highlights
    for _ in range(80):
        gx = random.randint(0, w - 1)
        gy = random.randint(0, h - 1)
        # bright lime tuft
        draw.ellipse([gx, gy, gx + 6, gy + 4], fill=(130, 245, 105, 220))

    # Top edge bright rim highlight
    draw.rectangle([0, 0, w, 8], fill=(160, 255, 120, 255))
    # Bottom scalloped grass fringe
    for x in range(0, w, 16):
        draw.polygon([(x, h - 14), (x + 8, h), (x + 16, h - 14)], fill=(45, 165, 55, 255))
        draw.polygon([(x + 2, h - 14), (x + 8, h - 2), (x + 10, h - 14)], fill=(100, 235, 85, 255))

    img.save(os.path.join(assets_dir, "tex_grass_top.png"))
    print("Saved tex_grass_top.png")

create_dirt_bricks()
create_grass_top()
