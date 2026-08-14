const fs = require('fs');
let store = fs.readFileSync('src/store/useAegisStore.ts', 'utf8');

// 1. Fix reStockResource
store = store.replace(
  /const reStockResource = \([\s\S]*?notify\(\);\n  \};/,
  `const reStockResource = async (resourceId: string, additionalStock: number) => {
    const res = globalState.resources.find(r => r.id === resourceId);
    if (!res) return;
    
    const newTotal = res.totalStock + additionalStock;
    const newRemaining = res.remainingStock + additionalStock;
    const percent = Math.round((newRemaining / newTotal) * 100);
    const status = percent < 25 ? 'CRITICAL' : percent < 50 ? 'MODERATE' : 'OPTIMAL';
    
    const updatedRes = {
      ...res,
      totalStock: newTotal,
      remainingStock: newRemaining,
      status,
      lastUpdated: new Date().toISOString()
    };
    
    try {
      await fetch(\`/api/inventory/\${resourceId}\`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedRes)
      });
      await fetchAllDatabaseState();
    } catch (e) { console.error(e); }
  };`
);

// 2. Fix transferResourceDepot
store = store.replace(
  /const transferResourceDepot = \([\s\S]*?notify\(\);\n  \};/,
  `const transferResourceDepot = async (resourceId: string, targetWarehouse: string, amount: number) => {
    const res = globalState.resources.find(r => r.id === resourceId);
    if (!res) return;
    
    const transferred = Math.min(res.remainingStock, amount);
    const newRemaining = res.remainingStock - transferred;
    const newTotal = Math.max(res.allocatedStock, res.totalStock - transferred);
    const percent = Math.round((newRemaining / newTotal) * 100);
    const status = percent < 20 ? 'CRITICAL' : percent < 50 ? 'MODERATE' : 'OPTIMAL';
    
    const updatedRes = {
      ...res,
      totalStock: newTotal,
      remainingStock: newRemaining,
      status,
      lastUpdated: new Date().toISOString()
    };
    
    try {
      await fetch(\`/api/inventory/\${resourceId}\`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedRes)
      });
      await fetchAllDatabaseState();
    } catch (e) { console.error(e); }
  };`
);

fs.writeFileSync('src/store/useAegisStore.ts', store);
console.log("Inventory fixed");
