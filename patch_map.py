import re

with open('src/components/map/DisasterMap.tsx', 'r') as f:
    content = f.read()

# Update Dark CartoDB to Light CartoDB map tiles
content = content.replace(
    'url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"',
    'url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"'
)

# Update getEmergencyColor
content = content.replace(
    '''  const getEmergencyColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return '#ef4444'; // Red-500
      case 'HIGH': return '#f59e0b'; // Amber-500
      default: return '#06b6d4'; // Cyan-500
    }
  };''',
    '''  const getEmergencyColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return '#DC2626'; // Red-600
      case 'HIGH': return '#D97706'; // Amber-600
      default: return '#2563EB'; // Blue-600
    }
  };'''
)

# Update getGaugeColor
content = content.replace(
    '''  const getGaugeColor = (status: string) => {
    switch (status) {
      case 'CRITICAL': return '#e11d48'; // Rose-600
      case 'WARNING': return '#f59e0b'; // Amber-500
      default: return '#10b981'; // Emerald-500
    }
  };''',
    '''  const getGaugeColor = (status: string) => {
    switch (status) {
      case 'CRITICAL': return '#DC2626'; // Red-600
      case 'WARNING': return '#D97706'; // Amber-600
      default: return '#2563EB'; // Blue-600
    }
  };'''
)

# Text inside popups (remove text-white / fix dark mode remnants)
content = content.replace('text-white', 'text-slate-900')
content = content.replace('text-slate-700', 'text-slate-600')
content = content.replace('text-slate-200', 'text-slate-200') # Borders can remain
content = content.replace('bg-slate-950', 'bg-white')
content = content.replace('border-slate-800', 'border-slate-200')
content = content.replace('text-rose-400', 'text-red-600')
content = content.replace('bg-slate-900', 'bg-slate-50')
content = content.replace('bg-blue-600', 'bg-blue-600 text-white')
content = content.replace('text-emerald-300', 'text-green-700')

with open('src/components/map/DisasterMap.tsx', 'w') as f:
    f.write(content)
