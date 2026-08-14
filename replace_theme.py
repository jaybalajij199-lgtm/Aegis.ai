import os
import re

replacements = [
    # Background colors
    (r'bg-slate-950', r'bg-slate-50'),
    (r'bg-slate-900', r'bg-white'),
    (r'bg-slate-800', r'bg-slate-50'),
    (r'bg-slate-850', r'bg-slate-50'),
    (r'bg-slate-700', r'bg-slate-100'),
    (r'bg-\[\#080c14\]', r'bg-[#F4F7FB]'),
    (r'bg-cyan-950', r'bg-blue-50'),
    (r'bg-cyan-900', r'bg-blue-100'),
    (r'bg-cyan-600', r'bg-blue-600'),
    (r'bg-cyan-500', r'bg-blue-600'),
    (r'bg-emerald-950', r'bg-green-50'),
    (r'bg-amber-950', r'bg-amber-50'),
    (r'bg-red-950', r'bg-red-50'),
    (r'bg-rose-950', r'bg-red-50'),
    (r'from-cyan-900', r'from-blue-100'),
    (r'to-slate-900', r'to-white'),
    (r'from-slate-900', r'from-slate-50'),
    (r'to-slate-950', r'to-slate-100'),

    # Borders
    (r'border-slate-800', r'border-slate-200'),
    (r'border-slate-700', r'border-slate-200'),
    (r'border-cyan-800', r'border-blue-200'),
    (r'border-cyan-500/30', r'border-blue-200'),
    (r'border-emerald-500/30', r'border-green-200'),
    (r'border-amber-500/30', r'border-amber-200'),
    (r'border-red-500/30', r'border-red-200'),
    (r'border-cyan-500', r'border-blue-500'),
    (r'border-emerald-500', r'border-green-500'),
    (r'border-amber-500', r'border-amber-500'),
    (r'border-red-500', r'border-red-500'),
    (r'divide-slate-800', r'divide-slate-200'),
    (r'divide-slate-700', r'divide-slate-200'),

    # Text colors
    (r'text-slate-100', r'text-slate-900'),
    (r'text-slate-200', r'text-slate-800'),
    (r'text-slate-300', r'text-slate-700'),
    (r'text-slate-400', r'text-slate-600'),
    (r'text-slate-500', r'text-slate-500'),
    (r'text-cyan-200', r'text-blue-700'),
    (r'text-cyan-300', r'text-blue-700'),
    (r'text-cyan-400', r'text-blue-600'),
    (r'text-cyan-500', r'text-blue-600'),
    (r'text-emerald-400', r'text-green-600'),
    (r'text-emerald-500', r'text-green-600'),
    (r'text-amber-400', r'text-amber-600'),
    (r'text-amber-500', r'text-amber-600'),
    (r'text-red-400', r'text-red-600'),
    (r'text-red-500', r'text-red-600'),
    (r'text-white', r'text-white'),

    # Hover States
    (r'hover:bg-slate-800', r'hover:bg-slate-100'),
    (r'hover:bg-slate-700', r'hover:bg-slate-200'),
    (r'hover:bg-cyan-900', r'hover:bg-blue-100'),
    (r'hover:bg-cyan-800', r'hover:bg-blue-200'),
    (r'hover:bg-cyan-600', r'hover:bg-blue-700'),
    (r'hover:text-cyan-300', r'hover:text-blue-800'),
    
    # Drop shadows / Glows
    (r'drop-shadow-\[0_0_8px_rgba\(6,182,212,0\.5\)\]', r'drop-shadow-sm'),
    (r'drop-shadow-\[0_0_8px_rgba\(16,185,129,0\.5\)\]', r'drop-shadow-sm'),
    (r'drop-shadow-\[0_0_8px_rgba\(245,158,11,0\.5\)\]', r'drop-shadow-sm'),
    (r'drop-shadow-\[0_0_8px_rgba\(239,68,68,0\.5\)\]', r'drop-shadow-sm'),
    (r'shadow-\[0_0_15px_rgba\(6,182,212,0\.2\)\]', r'shadow-sm'),
    (r'shadow-cyan-500/20', r'shadow-sm'),
    
    # Ring
    (r'ring-cyan-500/30', r'ring-blue-200'),
    (r'ring-slate-800', r'ring-slate-200'),
    (r'focus:ring-cyan-500', r'focus:ring-blue-500'),
    (r'focus:border-cyan-500', r'focus:border-blue-500'),
]

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    for pattern, replacement in replacements:
        content = re.sub(pattern, replacement, content)
        
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith(('.tsx', '.ts')):
            process_file(os.path.join(root, file))

