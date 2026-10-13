import os
import math
import random
from PIL import Image, ImageDraw, ImageFont, ImageFilter

POSTER_W = 1080
POSTER_H = 1920
ASSETS_DIR = 'assets'

FONT_PRESS_START = 'PressStart2P-Regular.ttf'
FONT_TITAN = 'TitanOne-Regular.ttf'
FONT_IMPACT = 'C:/Windows/Fonts/impact.ttf'
FONT_ARIAL_BD = 'C:/Windows/Fonts/arialbd.ttf'

def get_font(font_path, size):
    try:
        return ImageFont.truetype(font_path, size)
    except Exception:
        try:
            return ImageFont.truetype(FONT_ARIAL_BD, size)
        except Exception:
            return ImageFont.load_default()

def load_sprite(name):
    path = os.path.join(ASSETS_DIR, name)
    if os.path.exists(path):
        return Image.open(path).convert('RGBA')
    return None

def make_tile(tile_type, theme=1, size=32):
    im = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    
    if tile_type in ('#', 'T'):
        if theme == 1: # Grass meadow
            d.rectangle([0, 0, size-1, size-1], fill=(61, 30, 16))
            d.rectangle([2, 12, 13, 20], fill=(110, 59, 32))
            d.rectangle([16, 13, 29, 21], fill=(110, 59, 32))
            d.rectangle([3, 23, 11, 29], fill=(110, 59, 32))
            d.rectangle([14, 23, 25, 30], fill=(110, 59, 32))
            d.rectangle([0, 0, size-1, 10], fill=(15, 56, 24))
            d.rectangle([0, 0, size-1, 8], fill=(31, 110, 44))
            d.rectangle([0, 0, size-1, 5], fill=(56, 168, 69))
            d.rectangle([0, 0, size-1, 1], fill=(123, 224, 125))
        elif theme == 4: # Bicycle asphalt
            d.rectangle([0, 0, size-1, size-1], fill=(30, 41, 59))
            d.rectangle([0, 0, size-1, 11], fill=(51, 65, 85))
            d.rectangle([0, 0, size-1, 3], fill=(71, 85, 105))
            d.rectangle([0, 10, size-1, 13], fill=(34, 197, 94))
            d.rectangle([4, 5, 14, 7], fill=(250, 204, 21))
            d.rectangle([20, 5, 28, 7], fill=(250, 204, 21))
        elif theme == 8: # Castle stone
            d.rectangle([0, 0, size-1, size-1], fill=(20, 23, 32))
            d.rectangle([1, 1, 14, 14], fill=(51, 59, 82), outline=(78, 89, 120))
            d.rectangle([17, 1, 30, 14], fill=(51, 59, 82), outline=(78, 89, 120))
            d.rectangle([1, 17, 21, 30], fill=(51, 59, 82), outline=(78, 89, 120))
            d.rectangle([23, 17, 30, 30], fill=(51, 59, 82), outline=(78, 89, 120))
            
    elif tile_type == 'B': # Brick block
        d.rectangle([0, 0, size-1, size-1], fill=(31, 12, 5))
        rows = [
            (1, 7, [1, 17]),
            (9, 7, [-7, 9, 25]),
            (17, 7, [1, 17]),
            (25, 6, [-7, 9, 25])
        ]
        for y, h, offsets in rows:
            for ox in offsets:
                bx = max(0, ox)
                bw = min(32, ox + 15) - bx
                if bw > 0:
                    d.rectangle([bx, y, bx + bw - 1, y + h - 1], fill=(168, 68, 34))
                    d.rectangle([bx, y, bx + bw - 2, y + 1], fill=(222, 109, 67))
                    
    elif tile_type == '?': # Question block
        d.rectangle([0, 0, size-1, size-1], fill=(31, 16, 4))
        d.rectangle([1, 1, size-2, size-2], fill=(245, 158, 11))
        d.rectangle([2, 2, size-4, 4], fill=(254, 240, 138))
        d.rectangle([2, 2, 4, size-4], fill=(254, 240, 138))
        for cx, cy in [(3, 3), (25, 3), (3, 25), (25, 25)]:
            d.rectangle([cx, cy, cx + 2, cy + 2], fill=(71, 33, 0))
        d.rectangle([11, 7, 19, 10], fill=(255, 251, 235))
        d.rectangle([17, 11, 20, 15], fill=(255, 251, 235))
        d.rectangle([13, 14, 18, 17], fill=(255, 251, 235))
        d.rectangle([13, 21, 17, 24], fill=(255, 251, 235))
        
    elif tile_type == 'P': # Pipe top
        d.rectangle([0, 0, size-1, size-1], fill=(10, 40, 15))
        d.rectangle([1, 1, size-2, size-2], fill=(34, 197, 94))
        d.rectangle([3, 1, 7, size-2], fill=(134, 239, 172))
        d.rectangle([24, 1, 29, size-2], fill=(21, 128, 61))
        
    elif tile_type == 'p': # Pipe body
        d.rectangle([0, 0, size-1, size-1], fill=(10, 40, 15))
        d.rectangle([2, 0, 29, size-1], fill=(34, 197, 94))
        d.rectangle([4, 0, 8, size-1], fill=(134, 239, 172))
        d.rectangle([23, 0, 28, size-1], fill=(21, 128, 61))
        
    return im

def draw_hud(draw, font, world_str, score_str, time_str, coins_str):
    hud_items = [
        (f"AMBAR\nx05", 14),
        (f"COINS\n*{coins_str}", 110),
        (f"WORLD\n{world_str}", 210),
        (f"TIME\n{time_str}", 310),
        (f"SCORE\n{score_str}", 390)
    ]
    for txt, x in hud_items:
        lines = txt.split('\n')
        # Dark outline for max contrast
        for ox in [-1, 0, 1]:
            for oy in [-1, 0, 1]:
                draw.text((x + ox, 9 + oy), lines[0], font=font, fill=(0, 0, 0))
                draw.text((x + ox, 21 + oy), lines[1], font=font, fill=(0, 0, 0))
        draw.text((x, 9), lines[0], font=font, fill=(255, 255, 255))
        draw.text((x, 21), lines[1], font=font, fill=(254, 240, 138) if '*' in lines[1] else (255, 255, 255))

SCREEN_W = 480
SCREEN_H = 270

def render_screen_level_1():
    im = Image.new('RGBA', (SCREEN_W, SCREEN_H), (0, 0, 0, 255))
    d = ImageDraw.Draw(im)
    for y in range(SCREEN_H):
        t = y / SCREEN_H
        r = int(74 + (178 - 74) * t)
        g = int(163 + (228 - 163) * t)
        b = int(223 + (250 - 223) * t)
        d.line([(0, y), (SCREEN_W, y)], fill=(r, g, b))
        
    # Rainbow
    rainbow_colors = [(239, 68, 68), (249, 115, 22), (234, 179, 8), (34, 197, 94), (59, 130, 246), (168, 85, 247)]
    center_x, center_y = 200, 330
    for i, col in enumerate(rainbow_colors):
        rad = 220 - i * 6
        d.arc([center_x - rad, center_y - rad, center_x + rad, center_y + rad], 180, 360, fill=col, width=5)
        
    # Hills
    d.ellipse([-40, 150, 220, 320], fill=(56, 168, 69))
    d.ellipse([160, 160, 440, 340], fill=(34, 139, 44))
    d.ellipse([340, 140, 580, 320], fill=(56, 168, 69))
    
    # Ground
    t_grass = make_tile('#', theme=1)
    for c in range(0, SCREEN_W, 32):
        im.alpha_composite(t_grass, (c, SCREEN_H - 64))
        im.alpha_composite(t_grass, (c, SCREEN_H - 32))
        
    # Pipe
    t_P = make_tile('P')
    t_p = make_tile('p')
    im.alpha_composite(t_P, (320, SCREEN_H - 64 - 48))
    im.alpha_composite(t_P, (352, SCREEN_H - 64 - 48))
    im.alpha_composite(t_p, (320, SCREEN_H - 64 - 16))
    im.alpha_composite(t_p, (352, SCREEN_H - 64 - 16))
    
    # Blocks
    t_q = make_tile('?')
    t_b = make_tile('B')
    block_y = 110
    im.alpha_composite(t_q, (80, block_y))
    im.alpha_composite(t_b, (112, block_y))
    im.alpha_composite(t_q, (144, block_y))
    im.alpha_composite(t_b, (176, block_y))
    
    sp_mush = load_sprite('item_mushroom.png')
    if sp_mush:
        im.alpha_composite(sp_mush.resize((30, 30), Image.Resampling.NEAREST), (145, block_y - 28))
        
    sp_goomba = load_sprite('enemy_goomba.png')
    if sp_goomba:
        im.alpha_composite(sp_goomba.resize((36, 42), Image.Resampling.NEAREST), (240, SCREEN_H - 64 - 42))
        
    sp_koopa = load_sprite('enemy_koopa.png')
    if sp_koopa:
        im.alpha_composite(sp_koopa.resize((32, 48), Image.Resampling.NEAREST), (400, SCREEN_H - 64 - 48))
        
    sp_ambar = load_sprite('ambar_hoodie_0.png')
    if sp_ambar:
        w = int(68 * (sp_ambar.width / sp_ambar.height))
        im.alpha_composite(sp_ambar.resize((w, 68), Image.Resampling.NEAREST), (120, block_y + 16))
        
    hud_font = get_font(FONT_PRESS_START, 8)
    draw_hud(d, hud_font, "1-1", "014200", "342", "24")
    return im

def render_screen_level_4():
    im = Image.new('RGBA', (SCREEN_W, SCREEN_H), (0, 0, 0, 255))
    d = ImageDraw.Draw(im)
    for y in range(SCREEN_H):
        t = y / SCREEN_H
        if t < 0.5:
            st = t / 0.5
            r = int(147 + (249 - 147) * st)
            g = int(51 + (115 - 51) * st)
            b = int(234 + (22 - 234) * st)
        else:
            st = (t - 0.5) / 0.5
            r = int(249 + (254 - 249) * st)
            g = int(115 + (240 - 115) * st)
            b = int(22 + (138 - 22) * st)
        d.line([(0, y), (SCREEN_W, y)], fill=(r, g, b))
        
    d.ellipse([340, 40, 420, 120], fill=(255, 240, 150))
    d.rectangle([0, 120, SCREEN_W, 190], fill=(24, 76, 120))
    for wy in range(125, 190, 8):
        d.line([(0, wy), (SCREEN_W, wy)], fill=(56, 189, 248), width=2)
        
    def draw_palm(px, py):
        d.line([(px, py + 50), (px - 6, py)], fill=(15, 23, 42), width=4)
        for ang in [-60, -30, 0, 30, 60]:
            rad = math.radians(ang)
            ex = px - 6 + math.cos(rad) * 22
            ey = py - math.sin(rad) * 16
            d.line([(px - 6, py), (int(ex), int(ey))], fill=(15, 23, 42), width=3)
            
    draw_palm(80, 110)
    draw_palm(120, 115)
    draw_palm(420, 112)
    
    t_bike_road = make_tile('#', theme=4)
    for c in range(0, SCREEN_W, 32):
        im.alpha_composite(t_bike_road, (c, SCREEN_H - 64))
        im.alpha_composite(t_bike_road, (c, SCREEN_H - 32))
        
    for cx in [160, 180, 200]:
        d.polygon([(cx, SCREEN_H - 60), (cx + 8, SCREEN_H - 55), (cx, SCREEN_H - 50)], fill=(250, 204, 21))
        
    sp_cloud = load_sprite('enemy_cloud.png')
    if sp_cloud:
        im.alpha_composite(sp_cloud.resize((48, 56), Image.Resampling.NEAREST), (300, 35))
        
    for sl_y in [SCREEN_H - 120, SCREEN_H - 105, SCREEN_H - 90]:
        d.line([(60, sl_y), (140, sl_y)], fill=(255, 255, 255), width=2)
        
    sp_bike = load_sprite('ambar_bike_0.png')
    if sp_bike:
        h = 76
        w = int(h * (sp_bike.width / sp_bike.height))
        im.alpha_composite(sp_bike.resize((w, h), Image.Resampling.NEAREST), (140, SCREEN_H - 64 - h + 10))
        
    hud_font = get_font(FONT_PRESS_START, 8)
    draw_hud(d, hud_font, "1-4", "048200", "288", "45")
    return im

def render_screen_level_7():
    im = Image.new('RGBA', (SCREEN_W, SCREEN_H), (0, 0, 0, 255))
    d = ImageDraw.Draw(im)
    for y in range(SCREEN_H):
        t = y / SCREEN_H
        r = int(30 + (125 - 30) * t)
        g = int(58 + (195 - 58) * t)
        b = int(138 + (255 - 138) * t)
        d.line([(0, y), (SCREEN_W, y)], fill=(r, g, b))
        
    def draw_cloud_platform(cx, cy, w):
        d.rectangle([cx + 10, cy + 10, cx + w - 10, cy + 28], fill=(255, 255, 255))
        d.ellipse([cx, cy, cx + 40, cy + 30], fill=(255, 255, 255))
        d.ellipse([cx + w - 40, cy, cx + w, cy + 30], fill=(255, 255, 255))
        for mx in range(cx + 20, cx + w - 30, 25):
            d.ellipse([mx, cy - 8, mx + 35, cy + 26], fill=(255, 255, 255))
            
    draw_cloud_platform(40, 210, 140)
    draw_cloud_platform(260, 180, 180)
    draw_cloud_platform(120, 90, 120)
    draw_cloud_platform(340, 80, 110)
    
    for cx in range(80, 240, 24):
        d.ellipse([cx, 50, cx + 14, 64], fill=(250, 204, 21), outline=(180, 83, 9), width=2)
        
    sp_robot = load_sprite('enemy_robot.png')
    if sp_robot:
        im.alpha_composite(sp_robot.resize((48, 48), Image.Resampling.NEAREST), (380, 130))
        
    sp_star = load_sprite('item_star.png')
    if sp_star:
        im.alpha_composite(sp_star.resize((32, 32), Image.Resampling.NEAREST), (290, 135))
        
    for ly in [130, 142, 154]:
        d.line([(40, ly), (150, ly)], fill=(255, 255, 255), width=3)
        
    sp_fly = load_sprite('ambar_fly_0.png')
    if sp_fly:
        h = 52
        w = int(h * (sp_fly.width / sp_fly.height))
        im.alpha_composite(sp_fly.resize((w, h), Image.Resampling.NEAREST), (150, 125))
        
    hud_font = get_font(FONT_PRESS_START, 8)
    draw_hud(d, hud_font, "1-7", "086500", "240", "78")
    return im

def render_screen_level_8():
    im = Image.new('RGBA', (SCREEN_W, SCREEN_H), (0, 0, 0, 255))
    d = ImageDraw.Draw(im)
    d.rectangle([0, 0, SCREEN_W, SCREEN_H], fill=(24, 24, 36))
    
    for cy in range(0, SCREEN_H - 64, 40):
        d.line([(0, cy), (SCREEN_W, cy)], fill=(38, 38, 56), width=2)
    for cx in range(0, SCREEN_W, 60):
        d.line([(cx, 0), (cx, SCREEN_H - 64)], fill=(38, 38, 56), width=2)
        
    d.rounded_rectangle([200, 40, 280, 130], radius=40, fill=(79, 18, 18), outline=(185, 28, 28), width=3)
    d.ellipse([215, 60, 265, 110], fill=(220, 38, 38, 150))
    
    t_stone = make_tile('#', theme=8)
    for c in range(0, 180, 32):
        im.alpha_composite(t_stone, (c, SCREEN_H - 64))
        im.alpha_composite(t_stone, (c, SCREEN_H - 32))
    for c in range(290, SCREEN_W, 32):
        im.alpha_composite(t_stone, (c, SCREEN_H - 64))
        im.alpha_composite(t_stone, (c, SCREEN_H - 32))
        
    d.rectangle([180, SCREEN_H - 50, 290, SCREEN_H], fill=(220, 38, 38))
    d.rectangle([180, SCREEN_H - 45, 290, SCREEN_H], fill=(249, 115, 22))
    d.rectangle([180, SCREEN_H - 38, 290, SCREEN_H], fill=(250, 204, 21))
    
    sp_boss = load_sprite('enemy_boss.png')
    if sp_boss:
        h = 92
        w = int(h * (sp_boss.width / sp_boss.height))
        im.alpha_composite(sp_boss.resize((w, h), Image.Resampling.NEAREST), (330, SCREEN_H - 64 - h + 10))
        
    d.line([(340, SCREEN_H - 110), (300, SCREEN_H - 95)], fill=(254, 240, 138), width=4)
    d.line([(300, SCREEN_H - 95), (320, SCREEN_H - 85)], fill=(254, 240, 138), width=4)
    d.line([(320, SCREEN_H - 85), (280, SCREEN_H - 70)], fill=(255, 255, 255), width=3)
    
    sp_ambar = load_sprite('ambar_hoodie_2.png') or load_sprite('ambar_hoodie_0.png')
    if sp_ambar:
        h = 74
        w = int(h * (sp_ambar.width / sp_ambar.height))
        aura = Image.new('RGBA', im.size, (0, 0, 0, 0))
        ad = ImageDraw.Draw(aura)
        ad.ellipse([90, SCREEN_H - 64 - h - 5, 90 + w + 20, SCREEN_H - 64 + 10], fill=(250, 204, 21, 120))
        ad.ellipse([95, SCREEN_H - 64 - h, 95 + w + 10, SCREEN_H - 64 + 5], fill=(236, 72, 153, 120))
        im.alpha_composite(aura)
        im.alpha_composite(sp_ambar.resize((w, h), Image.Resampling.NEAREST), (100, SCREEN_H - 64 - h + 8))
        
    hud_font = get_font(FONT_PRESS_START, 8)
    draw_hud(d, hud_font, "1-8", "138900", "172", "99")
    return im

def frame_crt_screen(screen_im, title_text, badge_color):
    sw, sh = screen_im.size
    pad_h = 16
    pad_top = 34
    pad_bot = 18
    fw = sw + pad_h * 2
    fh = sh + pad_top + pad_bot
    
    frame = Image.new('RGBA', (fw, fh), (0, 0, 0, 0))
    fd = ImageDraw.Draw(frame)
    
    fd.rounded_rectangle([0, 0, fw-1, fh-1], radius=16, fill=(15, 23, 42), outline=(51, 65, 85), width=3)
    fd.rounded_rectangle([pad_h - 4, pad_top - 4, pad_h + sw + 3, pad_top + sh + 3], 
                         radius=8, fill=(2, 6, 23), outline=(30, 41, 59), width=2)
                         
    for sx, sy in [(10, 10), (fw - 10, 10), (10, fh - 10), (fw - 10, fh - 10)]:
        fd.ellipse([sx - 4, sy - 4, sx + 4, sy + 4], fill=(71, 85, 105), outline=(15, 23, 42))
        fd.line([(sx - 3, sy), (sx + 3, sy)], fill=(148, 163, 184))
        
    # Title badge
    badge_w = len(title_text) * 11 + 28
    bx = (fw - badge_w) // 2
    fd.rounded_rectangle([bx, 6, bx + badge_w, 28], radius=6, fill=badge_color, outline=(255, 255, 255), width=2)
    font_badge = get_font(FONT_PRESS_START, 9)
    fd.text((fw // 2, 17), title_text, font=font_badge, fill=(255, 255, 255), anchor="mm")
    
    # Power LED
    fd.ellipse([fw - 30, fh - 14, fw - 22, fh - 6], fill=(34, 197, 94), outline=(22, 101, 52))
    fd.ellipse([fw - 28, fh - 12, fw - 24, fh - 8], fill=(134, 239, 172))
    
    # Screen copy with very soft retro scanlines
    screen_copy = screen_im.copy()
    sd = ImageDraw.Draw(screen_copy)
    for y in range(0, sh, 3):
        sd.line([(0, y), (sw, y)], fill=(0, 0, 0, 8), width=1)
    gloss = Image.new('RGBA', (sw, sh), (0, 0, 0, 0))
    gd = ImageDraw.Draw(gloss)
    gd.polygon([(0, 0), (int(sw * 0.65), 0), (0, int(sh * 0.65))], fill=(255, 255, 255, 18))
    screen_copy.alpha_composite(gloss)
    
    frame.alpha_composite(screen_copy, (pad_h, pad_top))
    return frame

def draw_3d_text_centered(draw, cy, text, font, fill_color, shadow_color, depth=8, outline_color=(0,0,0)):
    cx = POSTER_W // 2
    for d in range(depth, 0, -1):
        sx, sy = cx + d, cy + d
        for ox in [-2, -1, 0, 1, 2]:
            for oy in [-2, -1, 0, 1, 2]:
                draw.text((sx + ox, sy + oy), text, font=font, fill=outline_color, anchor="mm")
        draw.text((sx, sy), text, font=font, fill=shadow_color, anchor="mm")
        
    for ox in [-3, -2, -1, 0, 1, 2, 3]:
        for oy in [-3, -2, -1, 0, 1, 2, 3]:
            if ox != 0 or oy != 0:
                draw.text((cx + ox, cy + oy), text, font=font, fill=outline_color, anchor="mm")
                
    draw.text((cx, cy), text, font=font, fill=fill_color, anchor="mm")

def draw_starburst_seal(draw, center, radius, num_points=24):
    cx, cy = center
    points = []
    r_outer = radius
    r_inner = radius * 0.84
    for i in range(num_points * 2):
        angle = math.pi * i / num_points
        r = r_outer if i % 2 == 0 else r_inner
        px = cx + math.cos(angle) * r
        py = cy + math.sin(angle) * r
        points.append((px, py))
        
    draw.polygon(points, fill=(245, 158, 11), outline=(180, 83, 9))
    draw.ellipse([cx - radius*0.8, cy - radius*0.8, cx + radius*0.8, cy + radius*0.8], 
                 fill=(251, 191, 36), outline=(146, 64, 14), width=3)
    draw.ellipse([cx - radius*0.74, cy - radius*0.74, cx + radius*0.74, cy + radius*0.74], 
                 fill=(254, 240, 138), outline=(217, 119, 6), width=2)

def generate_poster():
    poster = Image.new('RGBA', (POSTER_W, POSTER_H), (15, 12, 34, 255))
    draw = ImageDraw.Draw(poster)
    
    # 1. Background Gradient
    bg = Image.new('RGBA', (POSTER_W, POSTER_H))
    bg_draw = ImageDraw.Draw(bg)
    for y in range(POSTER_H):
        t = y / POSTER_H
        if t < 0.35:
            st = t / 0.35
            r = int(18 + (50 - 18) * st)
            g = int(14 + (24 - 14) * st)
            b = int(50 + (95 - 50) * st)
        elif t < 0.75:
            st = (t - 0.35) / 0.40
            r = int(50 + (98 - 50) * st)
            g = int(24 + (32 - 24) * st)
            b = int(95 + (145 - 95) * st)
        else:
            st = (t - 0.75) / 0.25
            r = int(98 + (12 - 98) * st)
            g = int(32 + (10 - 32) * st)
            b = int(145 + (28 - 145) * st)
        bg_draw.line([(0, y), (POSTER_W, y)], fill=(r, g, b))
        
    # Sunburst rays
    burst = Image.new('RGBA', (POSTER_W, POSTER_H), (0, 0, 0, 0))
    burst_draw = ImageDraw.Draw(burst)
    cx, cy = POSTER_W // 2, 450
    for deg in range(0, 360, 10):
        rad1 = math.radians(deg)
        rad2 = math.radians(deg + 5)
        length = 1400
        p1 = (cx, cy)
        p2 = (cx + math.cos(rad1) * length, cy + math.sin(rad1) * length)
        p3 = (cx + math.cos(rad2) * length, cy + math.sin(rad2) * length)
        burst_draw.polygon([p1, p2, p3], fill=(255, 255, 255, 10 if (deg // 10) % 2 == 0 else 0))
        
    random.seed(42)
    for _ in range(130):
        sx = random.randint(10, POSTER_W - 10)
        sy = random.randint(10, POSTER_H - 10)
        srad = random.randint(1, 3)
        brightness = random.randint(80, 220)
        burst_draw.ellipse([sx - srad, sy - srad, sx + srad, sy + srad], fill=(255, 255, 255, brightness))
        
    poster.alpha_composite(bg)
    poster.alpha_composite(burst)
    
    # 2. Top Ticker Banner (ASCII clean in PressStart)
    banner_w = 980
    banner_h = 44
    bx = (POSTER_W - banner_w) // 2
    by = 35
    draw.rounded_rectangle([bx, by, bx + banner_w, by + banner_h], radius=12, fill=(190, 18, 60), outline=(251, 191, 36), width=3)
    font_ticker = get_font(FONT_PRESS_START, 13)
    draw.text((POSTER_W // 2 + 1, by + 23), "* * *  EDICION 16-BIT RETRO SNES!  * * *", font=font_ticker, fill=(0, 0, 0), anchor="mm")
    draw.text((POSTER_W // 2, by + 22), "* * *  EDICION 16-BIT RETRO SNES!  * * *", font=font_ticker, fill=(254, 240, 138), anchor="mm")
    
    # 3. Main Title Logo
    font_super = get_font(FONT_TITAN, 72)
    draw_3d_text_centered(draw, 115, "SUPER", font_super, fill_color=(254, 240, 138), shadow_color=(217, 119, 6), depth=6)
    
    font_ambar = get_font(FONT_TITAN, 132)
    draw_3d_text_centered(draw, 218, "ÁMBAR", font_ambar, fill_color=(255, 71, 150), shadow_color=(159, 18, 57), depth=10)
    # Highlight
    draw.text((POSTER_W // 2, 216), "ÁMBAR", font=font_ambar, fill=(255, 180, 220, 90), anchor="mm")
    
    # Ribbon "ALL-STARS"
    rib_w = 520
    rib_h = 56
    rx = (POSTER_W - rib_w) // 2
    ry = 295
    draw.rounded_rectangle([rx + 4, ry + 4, rx + rib_w + 4, ry + rib_h + 4], radius=10, fill=(15, 23, 42))
    draw.rounded_rectangle([rx, ry, rx + rib_w, ry + rib_h], radius=10, fill=(225, 29, 72), outline=(250, 204, 21), width=4)
    draw.rounded_rectangle([rx + 4, ry + 4, rx + rib_w - 4, ry + rib_h - 4], radius=7, outline=(254, 240, 138), width=2)
    font_allstars = get_font(FONT_TITAN, 34)
    draw.text((POSTER_W // 2 + 2, ry + 29), "★ ALL-STARS ★", font=font_allstars, fill=(0, 0, 0), anchor="mm")
    draw.text((POSTER_W // 2, ry + 27), "★ ALL-STARS ★", font=font_allstars, fill=(255, 255, 255), anchor="mm")
    
    # Tagline
    font_tag = get_font(FONT_PRESS_START, 13)
    draw.text((POSTER_W // 2 + 1, 376), "EL JUEGO DE PLATAFORMAS DEFINITIVO!", font=font_tag, fill=(0, 0, 0), anchor="mm")
    draw.text((POSTER_W // 2, 375), "EL JUEGO DE PLATAFORMAS DEFINITIVO!", font=font_tag, fill=(56, 189, 248), anchor="mm")
    
    # Screens Callout
    sub_w = 780
    sub_h = 38
    sx = (POSTER_W - sub_w) // 2
    sy = 412
    draw.rounded_rectangle([sx, sy, sx + sub_w, sy + sub_h], radius=10, fill=(30, 41, 59, 240), outline=(250, 204, 21), width=2)
    font_screens_title = get_font(FONT_PRESS_START, 12)
    draw.text((POSTER_W // 2, sy + 19), "v  PANTALLAS EN VIVO DEL JUEGO!  v", font=font_screens_title, fill=(254, 240, 138), anchor="mm")
    
    # 4. Render and Frame Screens
    scr_1 = render_screen_level_1()
    scr_4 = render_screen_level_4()
    scr_7 = render_screen_level_7()
    scr_8 = render_screen_level_8()
    
    TARGET_SW = 460
    TARGET_SH = 258
    f_1 = frame_crt_screen(scr_1.resize((TARGET_SW, TARGET_SH), Image.Resampling.LANCZOS), "NIVEL 1-1: PRADERA ARCOIRIS", (16, 185, 129))
    f_4 = frame_crt_screen(scr_4.resize((TARGET_SW, TARGET_SH), Image.Resampling.LANCZOS), "NIVEL 1-4: EN BICICLETA", (249, 115, 22))
    f_7 = frame_crt_screen(scr_7.resize((TARGET_SW, TARGET_SH), Image.Resampling.LANCZOS), "NIVEL 1-7: SUPER VUELO", (14, 165, 233))
    f_8 = frame_crt_screen(scr_8.resize((TARGET_SW, TARGET_SH), Image.Resampling.LANCZOS), "NIVEL 1-8: CASTILLO JEFE", (220, 38, 38))
    
    FRAME_X1 = 36
    FRAME_X2 = 552
    FRAME_Y1 = 470
    FRAME_Y2 = 820
    
    poster.alpha_composite(f_1, (FRAME_X1, FRAME_Y1))
    poster.alpha_composite(f_4, (FRAME_X2, FRAME_Y1))
    poster.alpha_composite(f_7, (FRAME_X1, FRAME_Y2))
    poster.alpha_composite(f_8, (FRAME_X2, FRAME_Y2))
    
    # 5. Starburst Seal (Top Right corner)
    seal_x, seal_y = POSTER_W - 85, 130
    draw_starburst_seal(draw, (seal_x, seal_y), radius=56, num_points=26)
    font_seal_sm = get_font(FONT_PRESS_START, 7)
    font_seal_md = get_font(FONT_PRESS_START, 8)
    draw.text((seal_x, seal_y - 14), "SELLO", font=font_seal_sm, fill=(120, 53, 15), anchor="mm")
    draw.text((seal_x, seal_y - 3), "OFICIAL", font=font_seal_md, fill=(180, 83, 9), anchor="mm")
    draw.text((seal_x, seal_y + 8), "16-BIT", font=font_seal_md, fill=(180, 83, 9), anchor="mm")
    draw.text((seal_x, seal_y + 20), "CALIDAD", font=font_seal_sm, fill=(120, 53, 15), anchor="mm")
    
    # 6. Foreground Sprites (Big Hero Ámbar + Items + Enemies)
    sp_hero = load_sprite('ambar_hoodie_0.png')
    if sp_hero:
        hero_h = 200
        hero_w = int(hero_h * (sp_hero.width / sp_hero.height))
        sp_hero_scaled = sp_hero.resize((hero_w, hero_h), Image.Resampling.NEAREST)
        shadow = Image.new('RGBA', poster.size, (0, 0, 0, 0))
        sd = ImageDraw.Draw(shadow)
        sd.ellipse([POSTER_W // 2 - 55, 820, POSTER_W // 2 + 55, 845], fill=(0, 0, 0, 180))
        poster.alpha_composite(shadow)
        poster.alpha_composite(sp_hero_scaled, (POSTER_W // 2 - hero_w // 2, 690))
        
    t_q_big = make_tile('?').resize((58, 58), Image.Resampling.NEAREST)
    poster.alpha_composite(t_q_big, (POSTER_W // 2 - 130, 725))
    
    sp_mush_big = load_sprite('item_mushroom.png')
    if sp_mush_big:
        poster.alpha_composite(sp_mush_big.resize((52, 52), Image.Resampling.NEAREST), (POSTER_W // 2 - 127, 665))
        
    sp_star_big = load_sprite('item_star.png')
    if sp_star_big:
        poster.alpha_composite(sp_star_big.resize((54, 54), Image.Resampling.NEAREST), (POSTER_W // 2 + 75, 725))
        
    def draw_sparkle(px, py, col=(254, 240, 138)):
        draw.line([(px - 10, py), (px + 10, py)], fill=col, width=3)
        draw.line([(px, py - 10), (px, py + 10)], fill=col, width=3)
        draw.line([(px - 6, py - 6), (px + 6, py + 6)], fill=col, width=2)
        draw.line([(px + 6, py - 6), (px - 6, py + 6)], fill=col, width=2)
        draw.ellipse([px - 3, py - 3, px + 3, py + 3], fill=(255, 255, 255))
        
    draw_sparkle(POSTER_W // 2 - 150, 670)
    draw_sparkle(POSTER_W // 2 + 140, 710)
    draw_sparkle(POSTER_W // 2 + 110, 840)
    
    sp_goomba = load_sprite('enemy_goomba.png')
    if sp_goomba:
        poster.alpha_composite(sp_goomba.resize((58, 68), Image.Resampling.NEAREST), (18, 1135))
        
    sp_koopa = load_sprite('enemy_koopa.png')
    if sp_koopa:
        poster.alpha_composite(sp_koopa.resize((56, 84), Image.Resampling.NEAREST), (POSTER_W - 78, 1120))
        
    # 7. Retro Feature Box
    feat_w = 980
    feat_h = 270
    fx = (POSTER_W - feat_w) // 2
    fy = 1195
    draw.rounded_rectangle([fx + 6, fy + 6, fx + feat_w + 6, fy + feat_h + 6], radius=16, fill=(10, 10, 20))
    draw.rounded_rectangle([fx, fy, fx + feat_w, fy + feat_h], radius=16, fill=(15, 23, 42, 248), outline=(245, 158, 11), width=4)
    draw.rounded_rectangle([fx + 4, fy + 4, fx + feat_w - 4, fy + feat_h - 4], radius=12, outline=(96, 165, 250), width=2)
    
    f_badge_w = 460
    f_bx = (POSTER_W - f_badge_w) // 2
    draw.rounded_rectangle([f_bx, fy - 18, f_bx + f_badge_w, fy + 18], radius=8, fill=(234, 88, 12), outline=(254, 240, 138), width=3)
    font_fb = get_font(FONT_PRESS_START, 13)
    draw.text((POSTER_W // 2, fy), "★ CARACTERISTICAS ★", font=font_fb, fill=(255, 255, 255), anchor="mm")
    
    bullets = [
        ("* 8 MUNDOS ALUCINANTES", "Praderas, Trenes, Costas, Cuevas y Castillo"),
        ("* MODO BICICLETA TURBO", "Pedalea a toda velocidad en el Mundo 1-4!"),
        ("* SUPER AMBAR VOLADORA", "Vuela como superheroina entre las nubes en 1-7!"),
        ("* SECRETOS Y POWER-UPS", "Hongos Magicos, Estrellas y Doble Salto"),
        ("* 100% RETRO CHIPTUNE", "Graficos 16-bit SNES y banda sonora de consola")
    ]
    
    font_btitle = get_font(FONT_PRESS_START, 10)
    font_bdesc = get_font(FONT_ARIAL_BD, 16)
    font_num8 = get_font(FONT_TITAN, 13)
    
    start_by = fy + 38
    for i, (btitle, bdesc) in enumerate(bullets):
        cury = start_by + i * 45
        if "8 MUNDOS" in btitle:
            draw.text((fx + 26, cury), "* ", font=font_btitle, fill=(250, 204, 21))
            draw.text((fx + 42, cury - 2), "8", font=font_num8, fill=(250, 204, 21))
            draw.text((fx + 54, cury), " MUNDOS ALUCINANTES", font=font_btitle, fill=(250, 204, 21))
        else:
            draw.text((fx + 26, cury), btitle, font=font_btitle, fill=(250, 204, 21))
        draw.text((fx + 310, cury - 2), bdesc, font=font_bdesc, fill=(241, 245, 249))
        if i < len(bullets) - 1:
            draw.line([(fx + 25, cury + 26), (fx + feat_w - 25, cury + 26)], fill=(51, 65, 85, 140), width=1)
            
    # Add Rainbow and Shell items near footer/features
    sp_rainbow = load_sprite('item_rainbow.png')
    if sp_rainbow:
        poster.alpha_composite(sp_rainbow.resize((68, 44), Image.Resampling.NEAREST), (fx + feat_w - 80, fy - 14))
        
    sp_shell = load_sprite('item_shell.png')
    if sp_shell:
        poster.alpha_composite(sp_shell.resize((48, 44), Image.Resampling.NEAREST), (POSTER_W - 130, 1165))
        
    # 8. Instagram Call-To-Action (CTA)
    arrow_y = 1505
    font_arrow = get_font(FONT_PRESS_START, 14)
    draw.text((POSTER_W // 2 + 1, arrow_y + 1), "v  DISPONIBLE PARA JUGAR GRATIS!  v", font=font_arrow, fill=(0, 0, 0), anchor="mm")
    draw.text((POSTER_W // 2, arrow_y), "v  DISPONIBLE PARA JUGAR GRATIS!  v", font=font_arrow, fill=(254, 240, 138), anchor="mm")
    
    btn_w = 940
    btn_h = 160
    btn_x = (POSTER_W - btn_w) // 2
    btn_y = 1545
    
    for g_rad in [12, 8, 4]:
        draw.rounded_rectangle([btn_x - g_rad, btn_y - g_rad, btn_x + btn_w + g_rad, btn_y + btn_h + g_rad], 
                               radius=28, fill=None, outline=(236, 72, 153, 45), width=4)
                               
    draw.rounded_rectangle([btn_x + 6, btn_y + 8, btn_x + btn_w + 6, btn_y + btn_h + 8], radius=24, fill=(10, 10, 20))
    draw.rounded_rectangle([btn_x, btn_y, btn_x + btn_w, btn_y + btn_h], radius=24, fill=(225, 29, 72), outline=(250, 204, 21), width=5)
    draw.rounded_rectangle([btn_x + 5, btn_y + 5, btn_x + btn_w - 5, btn_y + btn_h // 2], radius=20, fill=(244, 63, 94))
    draw.rounded_rectangle([btn_x + 6, btn_y + 6, btn_x + btn_w - 6, btn_y + btn_h - 6], radius=20, outline=(254, 240, 138), width=2)
    
    font_btn_big = get_font(FONT_TITAN, 44)
    draw.text((POSTER_W // 2 + 2, btn_y + 52), "👉  ¡TOCÁ EL LINK EN LA BIO!  👈", font=font_btn_big, fill=(0, 0, 0), anchor="mm")
    draw.text((POSTER_W // 2, btn_y + 50), "👉  ¡TOCÁ EL LINK EN LA BIO!  👈", font=font_btn_big, fill=(255, 255, 255), anchor="mm")
    
    font_btn_sub = get_font(FONT_PRESS_START, 15)
    draw.text((POSTER_W // 2 + 1, btn_y + 115), "* JUGA EN CELULAR O PC DIRECTO *", font=font_btn_sub, fill=(159, 18, 57), anchor="mm")
    draw.text((POSTER_W // 2, btn_y + 114), "* JUGA EN CELULAR O PC DIRECTO *", font=font_btn_sub, fill=(254, 240, 138), anchor="mm")
    
    # Tap prompt
    tap_y = 1740
    font_tap = get_font(FONT_PRESS_START, 13)
    draw.text((POSTER_W // 2, tap_y), "^ DESLIZA HACIA ARRIBA O ENTRA AL LINK ^", font=font_tap, fill=(56, 189, 248), anchor="mm")
    
    # Platform badge
    badges_y = 1790
    badge_plat_w = 440
    bpx = (POSTER_W - badge_plat_w) // 2
    draw.rounded_rectangle([bpx, badges_y, bpx + badge_plat_w, badges_y + 36], radius=8, fill=(30, 41, 59), outline=(71, 85, 105), width=2)
    font_plat = get_font(FONT_PRESS_START, 10)
    draw.text((POSTER_W // 2, badges_y + 18), "CELULAR  *  TABLET  *  PC", font=font_plat, fill=(255, 255, 255), anchor="mm")
    
    # Footer
    font_credit = get_font(FONT_PRESS_START, 9)
    draw.text((POSTER_W // 2, 1865), "SUPER AMBAR ALL-STARS (C) 2026 * 16-BIT RETRO EDITION", font=font_credit, fill=(148, 163, 184), anchor="mm")
    
    out_path = 'historia_instagram_super_ambar.png'
    poster.save(out_path, format='PNG', quality=95)
    print(f"Generated clean poster: {out_path}")
    return out_path

if __name__ == '__main__':
    generate_poster()
