import os
import math
import random
from PIL import Image, ImageDraw, ImageFont, ImageFilter

# =============================================================================
# CONSTANTS & ASSET PATHS
# =============================================================================
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

# Load sprite helper
def load_sprite(name):
    path = os.path.join(ASSETS_DIR, name)
    if os.path.exists(path):
        return Image.open(path).convert('RGBA')
    return None

# =============================================================================
# TILE GENERATOR FOR IN-GAME SCREENS
# =============================================================================
def make_tile(tile_type, theme=1, size=32):
    im = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    
    if tile_type in ('#', 'T'):
        if theme == 1: # Grass meadow
            d.rectangle([0, 0, size-1, size-1], fill=(61, 30, 16))
            # Dirt details
            d.rectangle([2, 12, 13, 20], fill=(110, 59, 32))
            d.rectangle([16, 13, 29, 21], fill=(110, 59, 32))
            d.rectangle([3, 23, 11, 29], fill=(110, 59, 32))
            d.rectangle([14, 23, 25, 30], fill=(110, 59, 32))
            # Grass top
            d.rectangle([0, 0, size-1, 10], fill=(15, 56, 24))
            d.rectangle([0, 0, size-1, 8], fill=(31, 110, 44))
            d.rectangle([0, 0, size-1, 5], fill=(56, 168, 69))
            d.rectangle([0, 0, size-1, 1], fill=(123, 224, 125))
        elif theme == 4: # Bicycle asphalt
            d.rectangle([0, 0, size-1, size-1], fill=(30, 41, 59))
            d.rectangle([0, 0, size-1, 11], fill=(51, 65, 85))
            d.rectangle([0, 0, size-1, 3], fill=(71, 85, 105))
            # Curb line
            d.rectangle([0, 10, size-1, 13], fill=(34, 197, 94))
            d.rectangle([4, 5, 14, 7], fill=(250, 204, 21))
            d.rectangle([20, 5, 28, 7], fill=(250, 204, 21))
        elif theme == 8: # Castle stone
            d.rectangle([0, 0, size-1, size-1], fill=(20, 23, 32))
            d.rectangle([1, 1, 14, 14], fill=(51, 59, 82), outline=(78, 89, 120))
            d.rectangle([17, 1, 30, 14], fill=(51, 59, 82), outline=(78, 89, 120))
            d.rectangle([1, 17, 21, 30], fill=(51, 59, 82), outline=(78, 89, 120))
            d.rectangle([23, 17, 30, 30], fill=(51, 59, 82), outline=(78, 89, 120))
        elif theme == 7: # Cloud platform
            d.rectangle([0, 0, size-1, size-1], fill=(219, 234, 254))
            d.rectangle([0, 0, size-1, 8], fill=(255, 255, 255))
            d.rectangle([0, 9, size-1, 20], fill=(191, 219, 254))
            d.rectangle([0, 21, size-1, size-1], fill=(147, 197, 253))
            
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
        # Question mark
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

# Draw HUD bar
def draw_hud(draw, font, world_str, score_str, time_str, coins_str):
    text_color = (255, 255, 255)
    shadow_color = (0, 0, 0)
    
    hud_items = [
        (f"AMBAR\nx05", 14),
        (f"COINS\n*{coins_str}", 110),
        (f"WORLD\n{world_str}", 210),
        (f"TIME\n{time_str}", 310),
        (f"SCORE\n{score_str}", 390)
    ]
    
    for txt, x in hud_items:
        lines = txt.split('\n')
        draw.text((x + 1, 11), lines[0], font=font, fill=shadow_color)
        draw.text((x, 10), lines[0], font=font, fill=text_color)
        draw.text((x + 1, 21), lines[1], font=font, fill=shadow_color)
        draw.text((x, 20), lines[1], font=font, fill=(255, 215, 0) if '*' in lines[1] else text_color)

# =============================================================================
# GENERATE 4 GAMEPLAY SCREENS (480 x 270 px each)
# =============================================================================
SCREEN_W = 480
SCREEN_H = 270

def render_screen_level_1():
    # Nivel 1-1: Pradera Arcoiris
    im = Image.new('RGBA', (SCREEN_W, SCREEN_H), (0, 0, 0, 255))
    d = ImageDraw.Draw(im)
    
    # Sky gradient
    for y in range(SCREEN_H):
        t = y / SCREEN_H
        r = int(74 + (178 - 74) * t)
        g = int(163 + (228 - 163) * t)
        b = int(223 + (250 - 223) * t)
        d.line([(0, y), (SCREEN_W, y)], fill=(r, g, b))
        
    # Rainbow in background
    rainbow_colors = [
        (239, 68, 68, 140),
        (249, 115, 22, 140),
        (234, 179, 8, 140),
        (34, 197, 94, 140),
        (59, 130, 246, 140),
        (168, 85, 247, 140)
    ]
    center_x, center_y = 200, 330
    for i, col in enumerate(rainbow_colors):
        rad = 220 - i * 6
        d.arc([center_x - rad, center_y - rad, center_x + rad, center_y + rad], 180, 360, fill=col[:3], width=5)
        
    # Fluffy SNES pixel clouds
    def draw_cloud(cx, cy, scale=1.0):
        c_im = Image.new('RGBA', (120, 50), (0, 0, 0, 0))
        cd = ImageDraw.Draw(c_im)
        cd.ellipse([10, 15, 60, 45], fill=(255, 255, 255, 220))
        cd.ellipse([40, 5, 95, 45], fill=(255, 255, 255, 240))
        cd.ellipse([70, 15, 115, 45], fill=(255, 255, 255, 220))
        cd.rectangle([25, 30, 100, 45], fill=(255, 255, 255, 230))
        c_im = c_im.resize((int(120 * scale), int(50 * scale)), Image.Resampling.NEAREST)
        im.alpha_composite(c_im, (cx, cy))
        
    draw_cloud(40, 50, 0.8)
    draw_cloud(280, 35, 1.1)
    draw_cloud(410, 80, 0.7)
    
    # Rolling green hills
    d.ellipse([-40, 150, 220, 320], fill=(56, 168, 69))
    d.ellipse([160, 160, 440, 340], fill=(34, 139, 44))
    d.ellipse([340, 140, 580, 320], fill=(56, 168, 69))
    
    # Ground tiles (bottom 2 rows = 64px)
    t_grass = make_tile('#', theme=1)
    for c in range(0, SCREEN_W, 32):
        im.alpha_composite(t_grass, (c, SCREEN_H - 64))
        im.alpha_composite(t_grass, (c, SCREEN_H - 32))
        
    # Green pipe at x = 320
    t_P = make_tile('P')
    t_p = make_tile('p')
    im.alpha_composite(t_P, (320, SCREEN_H - 64 - 48))
    im.alpha_composite(t_P, (320 + 32, SCREEN_H - 64 - 48))
    im.alpha_composite(t_p, (320, SCREEN_H - 64 - 16))
    im.alpha_composite(t_p, (320 + 32, SCREEN_H - 64 - 16))
    
    # Blocks in mid-air
    t_q = make_tile('?')
    t_b = make_tile('B')
    block_y = 110
    im.alpha_composite(t_q, (80, block_y))
    im.alpha_composite(t_b, (112, block_y))
    im.alpha_composite(t_q, (144, block_y))
    im.alpha_composite(t_b, (176, block_y))
    
    # Mushroom popping out of question block
    sp_mush = load_sprite('item_mushroom.png')
    if sp_mush:
        sp_mush = sp_mush.resize((30, 30), Image.Resampling.NEAREST)
        im.alpha_composite(sp_mush, (145, block_y - 28))
        
    # Floating gold coins
    sp_star = load_sprite('item_star.png')
    if sp_star:
        sp_star = sp_star.resize((26, 26), Image.Resampling.NEAREST)
        im.alpha_composite(sp_star, (220, block_y - 10))
        
    # Goomba enemy on the ground
    sp_goomba = load_sprite('enemy_goomba.png')
    if sp_goomba:
        sp_goomba = sp_goomba.resize((36, 42), Image.Resampling.NEAREST)
        im.alpha_composite(sp_goomba, (240, SCREEN_H - 64 - 42))
        
    # Koopa enemy near pipe
    sp_koopa = load_sprite('enemy_koopa.png')
    if sp_koopa:
        sp_koopa = sp_koopa.resize((32, 48), Image.Resampling.NEAREST)
        im.alpha_composite(sp_koopa, (400, SCREEN_H - 64 - 48))
        
    # Player: Ámbar jumping mid-air hitting the question block!
    sp_ambar = load_sprite('ambar_hoodie_0.png')
    if sp_ambar:
        # Scale to 68px tall
        aspect = sp_ambar.width / sp_ambar.height
        w = int(68 * aspect)
        sp_ambar = sp_ambar.resize((w, 68), Image.Resampling.NEAREST)
        im.alpha_composite(sp_ambar, (120, block_y + 16))
        
    # Retro HUD
    hud_font = get_font(FONT_PRESS_START, 7)
    draw_hud(d, hud_font, "1-1", "014200", "342", "24")
    
    return im

def render_screen_level_4():
    # Nivel 1-4: Paseo en Bicicleta (Costero / Sunset)
    im = Image.new('RGBA', (SCREEN_W, SCREEN_H), (0, 0, 0, 255))
    d = ImageDraw.Draw(im)
    
    # Sunset gradient
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
        
    # Big glowing sunset sun
    d.ellipse([340, 40, 420, 120], fill=(255, 240, 150))
    d.ellipse([345, 45, 415, 115], fill=(255, 255, 200))
    
    # Ocean water at horizon
    d.rectangle([0, 120, SCREEN_W, 190], fill=(24, 76, 120))
    for wy in range(125, 190, 8):
        d.line([(0, wy), (SCREEN_W, wy)], fill=(56, 189, 248, 180), width=2)
        
    # Palm tree silhouettes on coast
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
    
    # Asphalt bicycle track
    t_bike_road = make_tile('#', theme=4)
    for c in range(0, SCREEN_W, 32):
        im.alpha_composite(t_bike_road, (c, SCREEN_H - 64))
        im.alpha_composite(t_bike_road, (c, SCREEN_H - 32))
        
    # Turbo chevrons on ground
    for cx in [160, 180, 200]:
        d.polygon([(cx, SCREEN_H - 60), (cx + 8, SCREEN_H - 55), (cx, SCREEN_H - 50)], fill=(250, 204, 21))
        
    # Flying cloud enemy dropping items
    sp_cloud = load_sprite('enemy_cloud.png')
    if sp_cloud:
        sp_cloud = sp_cloud.resize((48, 56), Image.Resampling.NEAREST)
        im.alpha_composite(sp_cloud, (300, 35))
        
    # Speed lines behind Ámbar
    for sl_y in [SCREEN_H - 120, SCREEN_H - 105, SCREEN_H - 90]:
        d.line([(60, sl_y), (140, sl_y)], fill=(255, 255, 255, 180), width=2)
        d.line([(30, sl_y + 4), (90, sl_y + 4)], fill=(254, 240, 138, 180), width=2)
        
    # Player: Ámbar riding bicycle!
    sp_bike = load_sprite('ambar_bike_0.png')
    if sp_bike:
        aspect = sp_bike.width / sp_bike.height
        h = 76
        w = int(h * aspect)
        sp_bike = sp_bike.resize((w, h), Image.Resampling.NEAREST)
        im.alpha_composite(sp_bike, (140, SCREEN_H - 64 - h + 10))
        
    # Floating coin arc above bike track
    sp_oneup = load_sprite('item_oneup.png')
    if sp_oneup:
        sp_oneup = sp_oneup.resize((28, 28), Image.Resampling.NEAREST)
        im.alpha_composite(sp_oneup, (380, SCREEN_H - 64 - 50))
        
    # Retro HUD
    hud_font = get_font(FONT_PRESS_START, 7)
    draw_hud(d, hud_font, "1-4", "048200", "288", "45")
    
    return im

def render_screen_level_7():
    # Nivel 1-7: Vuelo Supersonico (Cielo Celeste / Super Heroina)
    im = Image.new('RGBA', (SCREEN_W, SCREEN_H), (0, 0, 0, 255))
    d = ImageDraw.Draw(im)
    
    # Celestial sky gradient
    for y in range(SCREEN_H):
        t = y / SCREEN_H
        r = int(30 + (125 - 30) * t)
        g = int(58 + (195 - 58) * t)
        b = int(138 + (255 - 138) * t)
        d.line([(0, y), (SCREEN_W, y)], fill=(r, g, b))
        
    # Fluffy cloud platforms
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
    
    # Floating coin rows spelling "AMBAR"
    for cx in range(80, 240, 24):
        d.ellipse([cx, 50, cx + 14, 64], fill=(250, 204, 21), outline=(180, 83, 9), width=2)
        d.text((cx + 4, 51), "$", fill=(255, 255, 255), font=get_font(FONT_PRESS_START, 7))
        
    # Flying Robot enemy
    sp_robot = load_sprite('enemy_robot.png')
    if sp_robot:
        sp_robot = sp_robot.resize((48, 48), Image.Resampling.NEAREST)
        im.alpha_composite(sp_robot, (380, 130))
        
    # Super Star item
    sp_star = load_sprite('item_star.png')
    if sp_star:
        sp_star = sp_star.resize((32, 32), Image.Resampling.NEAREST)
        im.alpha_composite(sp_star, (290, 135))
        
    # Air stream / sonic boost lines
    for ly in [130, 142, 154]:
        d.line([(40, ly), (150, ly)], fill=(255, 255, 255, 220), width=3)
        d.line([(20, ly + 2), (110, ly + 2)], fill=(147, 197, 253, 200), width=2)
        
    # Player: Ámbar flying like Superman!
    sp_fly = load_sprite('ambar_fly_0.png')
    if sp_fly:
        aspect = sp_fly.width / sp_fly.height
        h = 52
        w = int(h * aspect)
        sp_fly = sp_fly.resize((w, h), Image.Resampling.NEAREST)
        im.alpha_composite(sp_fly, (150, 125))
        
    # Retro HUD
    hud_font = get_font(FONT_PRESS_START, 7)
    draw_hud(d, hud_font, "1-7", "086500", "240", "78")
    
    return im

def render_screen_level_8():
    # Nivel 1-8: Fortaleza del Rey Tormenta (Castillo & Lava)
    im = Image.new('RGBA', (SCREEN_W, SCREEN_H), (0, 0, 0, 255))
    d = ImageDraw.Draw(im)
    
    # Dark castle background
    d.rectangle([0, 0, SCREEN_W, SCREEN_H], fill=(24, 24, 36))
    
    # Castle background bricks & gothic arches
    for cy in range(0, SCREEN_H - 64, 40):
        d.line([(0, cy), (SCREEN_W, cy)], fill=(38, 38, 56), width=2)
    for cx in range(0, SCREEN_W, 60):
        d.line([(cx, 0), (cx, SCREEN_H - 64)], fill=(38, 38, 56), width=2)
        
    # Gothic arch glowing red/orange window
    d.rounded_rectangle([200, 40, 280, 130], radius=40, fill=(79, 18, 18), outline=(185, 28, 28), width=3)
    d.ellipse([215, 60, 265, 110], fill=(220, 38, 38, 150))
    
    # Castle stone platform
    t_stone = make_tile('#', theme=8)
    for c in range(0, 180, 32):
        im.alpha_composite(t_stone, (c, SCREEN_H - 64))
        im.alpha_composite(t_stone, (c, SCREEN_H - 32))
    for c in range(290, SCREEN_W, 32):
        im.alpha_composite(t_stone, (c, SCREEN_H - 64))
        im.alpha_composite(t_stone, (c, SCREEN_H - 32))
        
    # Bubbling Lava Pit in between (x = 180 to 290)
    d.rectangle([180, SCREEN_H - 50, 290, SCREEN_H], fill=(220, 38, 38))
    d.rectangle([180, SCREEN_H - 45, 290, SCREEN_H], fill=(249, 115, 22))
    d.rectangle([180, SCREEN_H - 38, 290, SCREEN_H], fill=(250, 204, 21))
    # Lava bubbles
    for bx, by in [(200, SCREEN_H - 52), (235, SCREEN_H - 56), (270, SCREEN_H - 50)]:
        d.ellipse([bx, by, bx + 12, by + 12], fill=(254, 240, 138))
        
    # Boss: Rey Tormenta!
    sp_boss = load_sprite('enemy_boss.png')
    if sp_boss:
        aspect = sp_boss.width / sp_boss.height
        h = 92
        w = int(h * aspect)
        sp_boss = sp_boss.resize((w, h), Image.Resampling.NEAREST)
        im.alpha_composite(sp_boss, (330, SCREEN_H - 64 - h + 10))
        
    # Boss Lightning spark attack
    d.line([(340, SCREEN_H - 110), (300, SCREEN_H - 95)], fill=(254, 240, 138), width=4)
    d.line([(300, SCREEN_H - 95), (320, SCREEN_H - 85)], fill=(254, 240, 138), width=4)
    d.line([(320, SCREEN_H - 85), (280, SCREEN_H - 70)], fill=(255, 255, 255), width=3)
    
    # Player: Ámbar facing the boss with Rainbow Star Aura!
    sp_ambar = load_sprite('ambar_hoodie_2.png') or load_sprite('ambar_hoodie_0.png')
    if sp_ambar:
        aspect = sp_ambar.width / sp_ambar.height
        h = 74
        w = int(h * aspect)
        sp_ambar = sp_ambar.resize((w, h), Image.Resampling.NEAREST)
        # Draw rainbow aura glow behind her
        aura = Image.new('RGBA', im.size, (0, 0, 0, 0))
        ad = ImageDraw.Draw(aura)
        ad.ellipse([90, SCREEN_H - 64 - h - 5, 90 + w + 20, SCREEN_H - 64 + 10], fill=(250, 204, 21, 100))
        ad.ellipse([95, SCREEN_H - 64 - h, 95 + w + 10, SCREEN_H - 64 + 5], fill=(236, 72, 153, 100))
        im.alpha_composite(aura)
        im.alpha_composite(sp_ambar, (100, SCREEN_H - 64 - h + 8))
        
    # Retro HUD
    hud_font = get_font(FONT_PRESS_START, 7)
    draw_hud(d, hud_font, "1-8", "138900", "172", "99")
    
    return im

print('Screen renderers defined successfully')

