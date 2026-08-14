import os
import re

for root, _, files in os.walk('src/pages'):
    for file in files:
        if not file.endswith('.tsx'): continue
        path = os.path.join(root, file)
        with open(path, 'r') as f: content = f.read()
        
        # General gradients
        content = re.sub(r'bg-gradient-to-br from-cyan-500 to-blue-700\b', 'bg-blue-600 text-white', content)
        content = re.sub(r'bg-gradient-to-br from-emerald-500 to-teal-700\b', 'bg-blue-600 text-white', content)
        content = re.sub(r'bg-gradient-to-br from-red-500 to-rose-700\b', 'bg-blue-600 text-white', content)
        content = re.sub(r'bg-gradient-to-br from-amber-500 to-orange-700\b', 'bg-blue-600 text-white', content)
        content = re.sub(r'shadow-xl shadow-cyan-950/50', 'shadow-sm', content)
        content = re.sub(r'shadow-lg shadow-cyan-950', 'shadow-sm', content)
        
        # SOS Button
        content = re.sub(r'bg-gradient-to-br from-red-600 via-rose-600 to-red-800 hover:from-red-500 hover:to-rose-500 active:scale-95 transition-all text-white font-black font-heading text-xl shadow-2xl shadow-red-950 flex flex-col items-center justify-center space-y-1\.5 ring-4 ring-red-500/30', 
            r'bg-red-600 hover:bg-red-700 active:scale-95 transition-all text-white font-black font-heading text-xl shadow-sm flex flex-col items-center justify-center space-y-1.5 rounded-full ring-4 ring-red-100', content)
            
        with open(path, 'w') as f: f.write(content)

