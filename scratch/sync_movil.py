#!/usr/bin/env python3
"""
sync_movil.py
Synchronizes Super_Ambar_Movil.html with the latest content from:
- css/style.css
- js/audio.js
- js/sprite_assets.js
- js/sprites.js
- js/levels.js
- js/game.js
"""

import re

def sync_movil():
    print("Reading external files...")
    with open("css/style.css", "r", encoding="utf-8") as f:
        css_content = f.read()
    with open("js/audio.js", "r", encoding="utf-8") as f:
        audio_content = f.read()
    with open("js/sprite_assets.js", "r", encoding="utf-8") as f:
        sprite_assets_content = f.read()
    with open("js/sprites.js", "r", encoding="utf-8") as f:
        sprites_content = f.read()
    with open("js/levels.js", "r", encoding="utf-8") as f:
        levels_content = f.read()
    with open("js/game.js", "r", encoding="utf-8") as f:
        game_content = f.read()

    print("Reading Super_Ambar_Movil.html...")
    with open("Super_Ambar_Movil.html", "r", encoding="utf-8") as f:
        html = f.read()

    # 1. Update <style>...</style>
    style_pattern = r"(<style>)(.*?)(</style>)"
    html = re.sub(style_pattern, rf"\1\n{css_content}\n\3", html, count=1, flags=re.DOTALL)

    # 2. Update the 5 external scripts (indexes 0 to 4 among <script> blocks)
    # Match all <script>...</script>
    scripts = list(re.finditer(r"(<script>)(.*?)(</script>)", html, flags=re.DOTALL))
    if len(scripts) < 6:
        print(f"Error: expected at least 6 <script> tags, found {len(scripts)}")
        return

    # Replace from back to front to preserve string indices
    replacements = [
        (4, game_content),
        (3, levels_content),
        (2, sprites_content),
        (1, sprite_assets_content),
        (0, audio_content),
    ]

    for idx, new_code in replacements:
        m = scripts[idx]
        start = m.start()
        end = m.end()
        html = html[:start] + f"<script>\n{new_code}\n</script>" + html[end:]
        # re-scan scripts for accurate coordinates if needed, but since we go back to front:
        # idx 4 is the latest, then 3, 2, 1, 0, so earlier match start/ends remain valid!

    with open("Super_Ambar_Movil.html", "w", encoding="utf-8") as f:
        f.write(html)

    print(f"Super_Ambar_Movil.html updated successfully! (Size: {len(html)} bytes)")

if __name__ == "__main__":
    sync_movil()
