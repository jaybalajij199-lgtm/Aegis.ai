const fs = require('fs');

function replaceFile(path, regex, replacement) {
  if (fs.existsSync(path)) {
    let content = fs.readFileSync(path, 'utf8');
    content = content.replace(regex, replacement);
    fs.writeFileSync(path, content);
  }
}

replaceFile(
  'src/components/resources/ResourceDispatchPanel.tsx',
  /const handleDispatch = \(\) => \{/,
  'const handleDispatch = async () => {'
);
replaceFile(
  'src/components/resources/ResourceDispatchPanel.tsx',
  /allocateResources\(/,
  'await allocateResources('
);

replaceFile(
  'src/components/ai/ExplainableAIPanel.tsx',
  /const handleApprove = \(\) => \{/,
  'const handleApprove = async () => {'
);
replaceFile(
  'src/components/ai/ExplainableAIPanel.tsx',
  /allocateResources\(/,
  'await allocateResources('
);

replaceFile(
  'src/components/ai/ResourceAllocationSimulator.tsx',
  /const executeSimulation = \(\) => \{/,
  'const executeSimulation = async () => {'
);
replaceFile(
  'src/components/ai/ResourceAllocationSimulator.tsx',
  /allocateResources\(/,
  'await allocateResources('
);

replaceFile(
  'src/pages/control/ControlResourcePage.tsx',
  /const handleAutoResolve = \(\) => \{/,
  'const handleAutoResolve = async () => {'
);
replaceFile(
  'src/pages/control/ControlResourcePage.tsx',
  /allocateResources\(/,
  'await allocateResources('
);

console.log("Allocations patched");
