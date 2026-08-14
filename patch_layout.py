import re

with open('src/components/layout/ControlLayout.tsx', 'r') as f:
    content = f.read()

# Fix header
content = content.replace(
    'bg-gradient-to-br from-cyan-500 to-blue-700 shadow-md shadow-cyan-950',
    'bg-blue-600 text-white shadow-sm'
)
content = content.replace(
    '<ShieldAlert className="h-5 w-5 text-slate-950 stroke-[2.5]" />',
    '<ShieldAlert className="h-5 w-5 text-white stroke-[2.5]" />'
)
content = content.replace(
    'text-white">              AEGIS<span className="text-blue-600">.AI</span>',
    'text-slate-900">              AEGIS<span className="text-blue-600">.AI</span>'
)
content = content.replace(
    'Active Emergencies: <strong className="text-white">',
    'Active Emergencies: <strong className="text-slate-900">'
)
content = content.replace(
    'border-t border-slate-900',
    'border-t border-slate-200'
)

with open('src/components/layout/ControlLayout.tsx', 'w') as f:
    f.write(content)

