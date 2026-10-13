#!/usr/bin/env python3
"""
generate_complete_sprites.py
Generates full, studio-grade 16-bit pixel-art sprite files for:
1. Ámbar Sirena (assets/ambar_mermaid_0.png, assets/ambar_mermaid_1.png)
2. Ámbar en Patines (assets/ambar_skate_0.png .. assets/ambar_skate_3.png)

No canvas attachments, no procedural clippings - 100% complete stand-alone PNG sprites.
"""

import os
import math
import base64
from PIL import Image, ImageDraw

ASSETS_DIR = "assets"
JS_SPRITE_ASSETS_FILE = "js/sprite_assets.js"

def create_roller_skates_sprites():
    print("Generating Ámbar en Patines sprites...")
    skate_frames = []

    # Frame 0: Idle / Standing / Gliding
    # Frame 1: Right foot push / stride forward
    # Frame 2: Mid-glide / crossover
    # Frame 3: Left foot push / stride forward
    
    # Quad roller skate palette (16-bit SNES style)
    # Boot: Retro classic white leather with hot pink side swoosh, pink collar trim, laces
    # Chassis: Heavy-duty aluminum truck plate with steel bolts
    # Toe stop: Pink rubber stopper at front
    # Wheels: Vibrant cyan & teal urethane wheels with golden 5-point star hub & ruby axle cap
    
    COL_BOOT_OUTLINE = (20, 10, 25, 255)
    COL_BOOT_MAIN = (250, 245, 248, 255)
    COL_BOOT_SHADE = (210, 200, 215, 255)
    COL_BOOT_HIGHLIGHT = (255, 255, 255, 255)
    
    COL_TRIM_PINK = (244, 63, 94, 255)
    COL_TRIM_HOTPINK = (225, 29, 72, 255)
    COL_LACE_GOLD = (253, 224, 71, 255)
    
    COL_PLATE_DARK = (51, 65, 85, 255)
    COL_PLATE_ALUM = (148, 163, 184, 255)
    COL_PLATE_LIGHT = (226, 232, 240, 255)
    
    COL_STOPPER = (244, 63, 94, 255)
    COL_STOPPER_DARK = (159, 18, 57, 255)
    
    COL_WHEEL_DARK = (8, 51, 68, 255)
    COL_WHEEL_CYAN = (6, 182, 212, 255)
    COL_WHEEL_LIGHT = (103, 232, 249, 255)
    COL_STAR_HUB = (253, 224, 71, 255)
    COL_AXLE_RUBY = (225, 29, 72, 255)

    def draw_skate_assembly(draw, foot_x_min, foot_x_max, foot_y_min, foot_y_max, facing_right=True, is_lead=True):
        """
        Replaces the foot bounding area with an authentic quad roller skate.
        Skate spans from foot_y_min (ankle/collar) to foot_y_max (bottom of wheels = 151).
        """
        w_foot = foot_x_max - foot_x_min + 1
        
        # 1. Boot body (covering y: foot_y_min to foot_y_max - 10)
        # Boot collar (pink trim)
        collar_y = foot_y_min
        draw.rectangle([foot_x_min + 1, collar_y, foot_x_max - 1, collar_y + 2], fill=COL_TRIM_PINK)
        draw.rectangle([foot_x_min + 2, collar_y, foot_x_max - 2, collar_y + 1], fill=COL_TRIM_HOTPINK)
        
        # White leather boot body
        boot_top = collar_y + 3
        boot_bottom = foot_y_max - 10
        for by in range(boot_top, boot_bottom + 1):
            t = (by - boot_top) / max(1, (boot_bottom - boot_top))
            # Shape curves outward slightly at heel and toe
            bx0 = foot_x_min
            bx1 = foot_x_max
            # Boot shading
            draw.line([(bx0, by), (bx1, by)], fill=COL_BOOT_MAIN)
            # Outline
            draw.point((bx0, by), fill=COL_BOOT_OUTLINE)
            draw.point((bx1, by), fill=COL_BOOT_OUTLINE)
            # Under-shade
            if by > boot_bottom - 2:
                draw.line([(bx0 + 1, by), (bx1 - 1, by)], fill=COL_BOOT_SHADE)
            # Highlight at top curve
            if by < boot_top + 3:
                draw.line([(bx0 + 2, by), (bx1 - 2, by)], fill=COL_BOOT_HIGHLIGHT)
                
        # Pink retro speed swoosh on side of boot
        swoosh_y = boot_top + 3
        for sy in range(swoosh_y, swoosh_y + 4):
            sx0 = foot_x_min + 3 + (sy - swoosh_y)
            sx1 = foot_x_max - 4 + (sy - swoosh_y)
            if sx1 > sx0:
                draw.line([(sx0, sy), (sx1, sy)], fill=COL_TRIM_HOTPINK)
                
        # Golden laces across instep
        lace_x = (foot_x_min + foot_x_max) // 2
        for ly in range(boot_top + 2, boot_bottom - 2, 2):
            draw.line([(lace_x - 3, ly), (lace_x + 3, ly)], fill=COL_LACE_GOLD)
            draw.point((lace_x - 3, ly), fill=COL_BOOT_OUTLINE)
            draw.point((lace_x + 3, ly), fill=COL_BOOT_OUTLINE)

        # Sole / welt of the boot (solid black/dark rubber)
        sole_y = boot_bottom
        draw.rectangle([foot_x_min, sole_y, foot_x_max, sole_y + 1], fill=COL_BOOT_OUTLINE)
        
        # 2. Aluminum truck plate chassis (sole_y + 2 to sole_y + 4)
        plate_y = sole_y + 2
        plate_x0 = foot_x_min + 2
        plate_x1 = foot_x_max - 2
        draw.rectangle([plate_x0, plate_y, plate_x1, plate_y + 2], fill=COL_PLATE_ALUM)
        draw.line([(plate_x0 + 1, plate_y), (plate_x1 - 1, plate_y)], fill=COL_PLATE_LIGHT)
        draw.line([(plate_x0, plate_y + 2), (plate_x1, plate_y + 2)], fill=COL_PLATE_DARK)
        
        # Front rubber toe stopper
        if facing_right:
            stop_x = foot_x_max
            stop_y = plate_y + 1
            draw.rectangle([stop_x - 1, stop_y, stop_x + 2, stop_y + 3], fill=COL_STOPPER)
            draw.rectangle([stop_x, stop_y + 1, stop_x + 2, stop_y + 3], fill=COL_STOPPER_DARK)
            draw.point((stop_x - 1, stop_y), fill=COL_BOOT_OUTLINE)
        else:
            stop_x = foot_x_min
            stop_y = plate_y + 1
            draw.rectangle([stop_x - 2, stop_y, stop_x + 1, stop_y + 3], fill=COL_STOPPER)
            draw.rectangle([stop_x - 2, stop_y + 1, stop_x, stop_y + 3], fill=COL_STOPPER_DARK)
            draw.point((stop_x + 1, stop_y), fill=COL_BOOT_OUTLINE)

        # 3. Two Quad Urethane Wheels (rear wheel & front wheel)
        # Wheel radius ~ 4-5px, bottom at y: 151
        wheel_r = 4
        wheel_y_center = foot_y_max - wheel_r
        
        w_front_x = foot_x_max - 4
        w_rear_x = foot_x_min + 4
        
        for wx in [w_rear_x, w_front_x]:
            # Outer dark ring
            for dy in range(-wheel_r, wheel_r + 1):
                dx_max = int(math.sqrt(max(0, wheel_r*wheel_r - dy*dy)))
                draw.line([(wx - dx_max, wheel_y_center + dy), (wx + dx_max, wheel_y_center + dy)], fill=COL_WHEEL_DARK)
                
            # Cyan urethane tire body
            inner_r = wheel_r - 1
            for dy in range(-inner_r, inner_r + 1):
                dx_max = int(math.sqrt(max(0, inner_r*inner_r - dy*dy)))
                draw.line([(wx - dx_max, wheel_y_center + dy), (wx + dx_max, wheel_y_center + dy)], fill=COL_WHEEL_CYAN)
                
            # Rim highlight
            draw.point((wx - 1, wheel_y_center - inner_r + 1), fill=COL_WHEEL_LIGHT)
            draw.point((wx, wheel_y_center - inner_r + 1), fill=COL_WHEEL_LIGHT)
            draw.point((wx + 1, wheel_y_center - inner_r + 1), fill=COL_WHEEL_LIGHT)
            
            # Star axle hub (Gold)
            draw.line([(wx - 2, wheel_y_center), (wx + 2, wheel_y_center)], fill=COL_STAR_HUB)
            draw.line([(wx, wheel_y_center - 2), (wx, wheel_y_center + 2)], fill=COL_STAR_HUB)
            # Center ruby cap
            draw.point((wx, wheel_y_center), fill=COL_AXLE_RUBY)

    for i in range(4):
        src_path = f"assets/ambar_hoodie_{i}.png"
        img = Image.open(src_path).convert("RGBA")
        w, h = img.size
        
        # Make a copy
        skate_img = img.copy()
        
        # Clear foot zone (y >= 134)
        pix = skate_img.load()
        
        # Collect foot pixel columns to know where each foot is
        feet_xs = []
        for y in range(134, h):
            for x in range(w):
                if pix[x, y][3] > 30:
                    feet_xs.append(x)
                    # Clear original sneaker pixels
                    pix[x, y] = (0, 0, 0, 0)
                    
        draw = ImageDraw.Draw(skate_img)
        
        if i == 0:
            # Idle / Standing: Two feet side by side
            # Foot 1: x in 20..38, Foot 2: x in 39..59
            draw_skate_assembly(draw, 20, 37, 134, 151, facing_right=True, is_lead=False)
            draw_skate_assembly(draw, 39, 58, 134, 151, facing_right=True, is_lead=True)
        elif i == 1:
            # Push stride 1: Back foot pushing off, front foot extended
            # Foot area in Frame 1 is around x: 60..87 (front foot), back foot at 2..30
            draw_skate_assembly(draw, 4, 32, 134, 148, facing_right=True, is_lead=False)
            draw_skate_assembly(draw, 60, 86, 134, 151, facing_right=True, is_lead=True)
        elif i == 2:
            # Stride cross 2: Wide stride
            # Foot 1: x in 6..34, Foot 2: x in 60..86
            draw_skate_assembly(draw, 7, 35, 134, 151, facing_right=True, is_lead=False)
            draw_skate_assembly(draw, 60, 86, 134, 151, facing_right=True, is_lead=True)
        elif i == 3:
            # Stride push 3: Left foot leading
            # Foot 1: x in 23..40, Foot 2: x in 45..68
            draw_skate_assembly(draw, 22, 40, 134, 151, facing_right=True, is_lead=True)
            draw_skate_assembly(draw, 44, 66, 134, 149, facing_right=True, is_lead=False)
            
        out_path = f"assets/ambar_skate_{i}.png"
        skate_img.save(out_path, "PNG")
        print(f"Saved {out_path} ({w}x{h})")
        skate_frames.append(out_path)

    return skate_frames


def create_mermaid_sprites():
    print("Generating Ámbar Sirena sprites...")
    # Two animation frames:
    # Frame 0: Swimming stroke kick (powerful tail kick curving downwards/backwards)
    # Frame 1: Gliding stroke recovery (tail undulating smoothly upwards)
    
    # Base Upper Body: taken from ambar_hoodie_0.png (idle, perfect front-facing 3/4 look)
    # We take Ámbar's authentic head, glasses, wavy hair, smile, neck, and upper torso (y: 0 to 92).
    # Then we give her a mermaid halter top/seashell bodice, glowing underwater pearl necklace,
    # flowing hair streaming with bubbles, and a seamlessly fused 16-bit aquatic mermaid tail!
    
    base_img = Image.open("assets/ambar_hoodie_0.png").convert("RGBA")
    bw, bh = base_img.size
    
    # We want a canvas that comfortably fits Ámbar and her majestic mermaid tail:
    # Dimensions: 120 x 152
    W = 120
    H = 152
    
    # Palette for Ámbar Sirena:
    # Scaled tail: Deep emerald, turquoise, iridescent aquamarine, mint highlight
    # Scales: Golden & pink shimmer highlights
    # Fins: Translucent sea-glass cyan with iridescent magenta fringes & white ray ribs
    # Halter top: Coral pink with golden shell clasp
    COL_TAIL_OUTLINE = (4, 47, 46, 255)
    COL_TAIL_DARK = (13, 148, 136, 255)
    COL_TAIL_MID = (20, 184, 166, 255)
    COL_TAIL_LIGHT = (45, 212, 191, 255)
    COL_TAIL_SHINE = (94, 234, 212, 255)
    
    COL_SCALE_GOLD = (253, 224, 71, 255)
    COL_SCALE_PINK = (244, 114, 182, 255)
    COL_PEARL = (255, 255, 255, 255)
    
    COL_FIN_BASE = (13, 148, 136, 240)
    COL_FIN_MID = (45, 212, 191, 240)
    COL_FIN_PINK = (236, 72, 153, 230)
    COL_FIN_GOLD = (254, 240, 138, 230)
    COL_FIN_RAY = (255, 255, 255, 255)

    COL_BODICE_PINK = (244, 63, 94, 255)
    COL_BODICE_DARK = (190, 18, 60, 255)
    COL_BODICE_LIGHT = (251, 113, 133, 255)

    mermaid_paths = []

    for frame_idx in [0, 1]:
        m_img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        
        # 1. Place Ámbar's upper body at top center
        # Center horizontally: x_offset = (W - bw) // 2 = (120 - 62) // 2 = 29
        x_off = 28
        y_off = 2
        
        # Paste Ámbar upper body from y=0 to y=88 (neck and upper bodice)
        upper_crop = base_img.crop((0, 0, bw, 88))
        m_img.paste(upper_crop, (x_off, y_off), upper_crop)
        
        draw = ImageDraw.Draw(m_img)
        
        # Re-color her hoodie into a cute mermaid halter top / shell bodice (y: 68 to 88)
        # Center of torso is around x = x_off + 35 = 63
        cx = x_off + 35
        for y in range(y_off + 68, y_off + 88):
            for x in range(x_off + 16, x_off + 54):
                p = m_img.getpixel((x, y))
                if p[3] > 50:
                    # Apply coral pink halter / mermaid swimsuit
                    dist = abs(x - cx)
                    if dist > 14:
                        m_img.putpixel((x, y), COL_BODICE_DARK)
                    elif dist > 7:
                        m_img.putpixel((x, y), COL_BODICE_PINK)
                    else:
                        m_img.putpixel((x, y), COL_BODICE_LIGHT)

        # Golden star / shell brooch at center of bodice
        brooch_y = y_off + 76
        draw.line([(cx - 3, brooch_y), (cx + 3, brooch_y)], fill=COL_SCALE_GOLD)
        draw.line([(cx, brooch_y - 3), (cx, brooch_y + 3)], fill=COL_SCALE_GOLD)
        draw.point((cx, brooch_y), fill=COL_PEARL)
        
        # Flowing underwater hair waving behind her head
        hair_y_start = y_off + 32
        hair_wave = -6 if frame_idx == 0 else 4
        # Draw flowing brunette strands with sea shine
        draw.ellipse([x_off - 8, hair_y_start + hair_wave, x_off + 6, hair_y_start + 26 + hair_wave], fill=(69, 26, 3, 255))
        draw.ellipse([x_off - 14, hair_y_start + 8 + hair_wave, x_off - 2, hair_y_start + 24 + hair_wave], fill=(88, 28, 12, 255))
        draw.point((x_off - 6, hair_y_start + 12 + hair_wave), fill=(244, 63, 94, 255)) # hair flower/pearl
        
        # Floating underwater bubbles around hair
        draw.ellipse([x_off - 12, y_off + 18, x_off - 8, y_off + 22], fill=(255, 255, 255, 180))
        draw.ellipse([x_off + bw + 4, y_off + 24, x_off + bw + 7, y_off + 27], fill=(255, 255, 255, 180))

        # 2. Golden Waist Girdle (Seam between torso and mermaid tail at y: y_off + 86)
        waist_y = y_off + 86
        waist_w = 42
        draw.ellipse([cx - waist_w//2, waist_y - 2, cx + waist_w//2, waist_y + 4], fill=COL_SCALE_GOLD)
        draw.ellipse([cx - waist_w//2 + 2, waist_y - 1, cx + waist_w//2 - 2, waist_y + 2], fill=(254, 240, 138, 255))
        for px in range(cx - waist_w//2 + 3, cx + waist_w//2 - 2, 5):
            draw.point((px, waist_y), fill=COL_PEARL)

        # Side hip fins (delicate sea-fans spreading from hips)
        # Left hip fin
        draw.polygon([(cx - waist_w//2, waist_y), (cx - waist_w//2 - 10, waist_y - 3), (cx - waist_w//2 - 12, waist_y + 8), (cx - waist_w//2, waist_y + 5)], fill=COL_TAIL_LIGHT)
        draw.line([(cx - waist_w//2, waist_y), (cx - waist_w//2 - 11, waist_y + 6)], fill=COL_FIN_RAY)
        # Right hip fin
        draw.polygon([(cx + waist_w//2, waist_y), (cx + waist_w//2 + 10, waist_y - 3), (cx + waist_w//2 + 12, waist_y + 8), (cx + waist_w//2, waist_y + 5)], fill=COL_TAIL_LIGHT)
        draw.line([(cx + waist_w//2, waist_y), (cx + waist_w//2 + 11, waist_y + 6)], fill=COL_FIN_RAY)

        # 3. Organic Serpentine Mermaid Tail Spine
        # We define a 7-joint curved spine down to the caudal fluke
        spine = []
        num_joints = 7
        curr_x = float(cx)
        curr_y = float(waist_y + 3)
        
        for j in range(num_joints):
            ratio = j / float(num_joints - 1)
            # Frame 0: Downward swimming kick (tail bends right and curves forward)
            # Frame 1: Upward recovery glide (tail bends left and curls upward)
            if frame_idx == 0:
                dx = math.sin(ratio * math.pi * 0.9) * 16.0
                dy = 6.8 - ratio * 1.0
            else:
                dx = -math.sin(ratio * math.pi * 0.9) * 14.0
                dy = 6.6 - ratio * 0.8
                
            curr_x = cx + dx
            curr_y += dy
            seg_w = max(6.0, 38.0 * (1.0 - ratio * 0.74))
            spine.append((curr_x, curr_y, seg_w))

        # Render tail segments
        for s in range(len(spine) - 1):
            p1_x, p1_y, p1_w = spine[s]
            p2_x, p2_y, p2_w = spine[s + 1]
            
            # Poly segment
            poly = [
                (p1_x - p1_w/2, p1_y),
                (p2_x - p2_w/2, p2_y),
                (p2_x + p2_w/2, p2_y),
                (p1_x + p1_w/2, p1_y)
            ]
            draw.polygon(poly, fill=COL_TAIL_MID)
            
            # Shading: Darker on left, bright shine on center-right
            draw.line([(p1_x - p1_w/2, p1_y), (p2_x - p2_w/2, p2_y)], fill=COL_TAIL_DARK, width=2)
            draw.line([(p1_x + p1_w/4, p1_y), (p2_x + p2_w/4, p2_y)], fill=COL_TAIL_SHINE, width=1)
            draw.line([(p1_x + p1_w/2, p1_y), (p2_x + p2_w/2, p2_y)], fill=COL_TAIL_OUTLINE, width=1)
            
            # 16-Bit Fish scales on each segment
            num_scales = max(2, int(p1_w / 6))
            for sc in range(num_scales):
                sc_x = (p1_x - p1_w/2 + 2) + sc * (p1_w / num_scales)
                sc_y = p1_y + 1
                col = COL_SCALE_GOLD if (s + sc) % 3 == 0 else (COL_SCALE_PINK if (s + sc) % 3 == 1 else COL_TAIL_LIGHT)
                draw.arc([sc_x - 2, sc_y - 2, sc_x + 2, sc_y + 2], start=0, end=180, fill=col)

        # 4. Majestic Dual-Lobed Caudal Fluke (Aleta Caudal)
        tip_x, tip_y, _ = spine[-1]
        prev_x, prev_y, _ = spine[-2]
        
        # Calculate fin angle
        fin_angle = math.atan2(tip_y - prev_y, tip_x - prev_x)
        fin_len = 24.0
        
        # Left fluke lobe
        # Spreads outward perpendicular to fin_angle
        perp_angle = fin_angle + math.pi / 2
        lobe_spread = 22.0
        
        left_tip = (
            tip_x - math.cos(perp_angle) * lobe_spread + math.cos(fin_angle) * fin_len,
            tip_y - math.sin(perp_angle) * lobe_spread + math.sin(fin_angle) * fin_len
        )
        right_tip = (
            tip_x + math.cos(perp_angle) * lobe_spread + math.cos(fin_angle) * fin_len,
            tip_y + math.sin(perp_angle) * lobe_spread + math.sin(fin_angle) * fin_len
        )
        fluke_notch = (
            tip_x + math.cos(fin_angle) * (fin_len * 0.45),
            tip_y + math.sin(fin_angle) * (fin_len * 0.45)
        )
        
        # Draw Left Fluke Lobe
        draw.polygon([(tip_x, tip_y), left_tip, fluke_notch], fill=COL_FIN_MID)
        # Draw Right Fluke Lobe
        draw.polygon([(tip_x, tip_y), right_tip, fluke_notch], fill=COL_FIN_MID)
        
        # Magenta iridescent trailing edges
        draw.line([left_tip, fluke_notch], fill=COL_FIN_PINK, width=2)
        draw.line([right_tip, fluke_notch], fill=COL_FIN_PINK, width=2)
        draw.line([left_tip, (left_tip[0] + 1, left_tip[1] + 1)], fill=COL_FIN_GOLD, width=1)
        draw.line([right_tip, (right_tip[0] - 1, right_tip[1] + 1)], fill=COL_FIN_GOLD, width=1)
        
        # Fin rays radiating from tip_x, tip_y
        for t in [0.25, 0.5, 0.75]:
            rx_l = tip_x + (left_tip[0] - tip_x) * t
            ry_l = tip_y + (left_tip[1] - tip_y) * t
            draw.line([(tip_x, tip_y), (rx_l, ry_l)], fill=COL_FIN_RAY, width=1)
            
            rx_r = tip_x + (right_tip[0] - tip_x) * t
            ry_r = tip_y + (right_tip[1] - tip_y) * t
            draw.line([(tip_x, tip_y), (rx_r, ry_r)], fill=COL_FIN_RAY, width=1)

        out_path = f"assets/ambar_mermaid_{frame_idx}.png"
        m_img.save(out_path, "PNG")
        print(f"Saved {out_path} ({W}x{H})")
        mermaid_paths.append(out_path)

    return mermaid_paths

if __name__ == "__main__":
    skate_files = create_roller_skates_sprites()
    mermaid_files = create_mermaid_sprites()
    print("All sprites created successfully!")

