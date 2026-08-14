import re

with open('src/pages/citizen/CitizenSOS.tsx', 'r') as f:
    content = f.read()

# Replace specific background elements and text colors
content = content.replace('bg-slate-50 text-white', 'bg-slate-100 text-slate-900')
content = content.replace('text-emerald-300', 'text-green-600')
content = content.replace('text-red-300', 'text-red-600')
content = content.replace('text-amber-300', 'text-amber-600')
content = content.replace('text-blue-300', 'text-blue-600')
content = content.replace('border-red-800', 'border-red-200')
content = content.replace('border-amber-800', 'border-amber-200')
content = content.replace('border-green-800', 'border-green-200')
content = content.replace('text-white', 'text-slate-900')

with open('src/pages/citizen/CitizenSOS.tsx', 'w') as f:
    f.write(content)
