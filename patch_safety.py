import re

with open('src/components/citizen/SafetyStatusWidget.tsx', 'r') as f:
    content = f.read()

content = content.replace('bg-emerald-900/60', 'bg-green-100')
content = content.replace('bg-amber-900/60', 'bg-amber-100')
content = content.replace('bg-red-900/60', 'bg-red-100')

content = content.replace('text-emerald-300', 'text-green-700')
content = content.replace('text-amber-300', 'text-amber-700')
content = content.replace('text-red-300', 'text-red-700')
content = content.replace('text-white', 'text-slate-900')
content = content.replace('bg-green-50/10', 'bg-white')
content = content.replace('border-emerald-800', 'border-green-200')

with open('src/components/citizen/SafetyStatusWidget.tsx', 'w') as f:
    f.write(content)

