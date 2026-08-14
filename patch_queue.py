import re

with open('src/components/emergency/EmergencyQueue.tsx', 'r') as f:
    content = f.read()

content = content.replace('bg-slate-900', 'bg-white')
content = content.replace('border-slate-800', 'border-slate-200')
content = content.replace('bg-slate-800', 'bg-slate-50')
content = content.replace('text-slate-100', 'text-slate-900')
content = content.replace('text-white', 'text-slate-900')
content = content.replace('text-slate-200', 'text-slate-700')
content = content.replace('text-slate-300', 'text-slate-700')
content = content.replace('text-slate-400', 'text-slate-600')

with open('src/components/emergency/EmergencyQueue.tsx', 'w') as f:
    f.write(content)

