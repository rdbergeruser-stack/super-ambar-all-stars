import base64

def get_b64(path):
    with open(path, 'rb') as f:
        return 'data:image/png;base64,' + base64.b64encode(f.read()).decode('ascii')

with open('js/sprite_assets.js', 'r', encoding='utf-8') as f:
    content = f.read()

idx = content.rfind('};')
if idx != -1:
    before = content[:idx].rstrip()
    if before.endswith(','):
        before = before[:-1]
    
    skate_b64s = [get_b64(f'assets/ambar_skate_{i}.png') for i in range(4)]
    mermaid_b64s = [get_b64(f'assets/ambar_mermaid_{i}.png') for i in range(2)]
    
    skate_js = ',\n  skate: [\n' + ',\n'.join(f'    "{s}"' for s in skate_b64s) + '\n  ]'
    mermaid_js = ',\n  mermaid: [\n' + ',\n'.join(f'    "{s}"' for s in mermaid_b64s) + '\n  ]'
    
    new_content = before + skate_js + mermaid_js + '\n};\n'
    
    with open('js/sprite_assets.js', 'w', encoding='utf-8') as f_out:
        f_out.write(new_content)
    print('Updated js/sprite_assets.js with skate and mermaid arrays!')
else:
    print('Could not find }; in js/sprite_assets.js')

