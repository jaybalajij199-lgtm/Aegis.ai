import os
import re

for file in os.listdir('src/components/layout'):
    if not file.endswith('.tsx'): continue
    path = os.path.join('src/components/layout', file)
    with open(path, 'r') as f: content = f.read()
    
    # Gradients
    content = re.sub(r'bg-gradient-to-br from-\w+-500 to-\w+-700 shadow-md', 'bg-blue-600 text-white shadow-sm', content)
    content = re.sub(r'bg-gradient-to-br from-\w+-500 to-\w+-700', 'bg-blue-600 text-white', content)
    
    # text-slate-950 on icons inside logo
    content = content.replace('text-slate-950 stroke-[2.5]', 'text-white stroke-[2.5]')
    
    # AEGIS.AI text
    content = content.replace('text-white">              AEGIS', 'text-slate-900">              AEGIS')
    
    with open(path, 'w') as f: f.write(content)

