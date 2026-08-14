const fs = require('fs');

function replaceFile(path, regex, replacement) {
  if (fs.existsSync(path)) {
    let content = fs.readFileSync(path, 'utf8');
    content = content.replace(regex, replacement);
    fs.writeFileSync(path, content);
  }
}

replaceFile('src/components/resources/ResourceDispatchPanel.tsx', /await allocateResources\(/, 'allocateResources(');
replaceFile('src/components/ai/ExplainableAIPanel.tsx', /await allocateResources\(/, 'allocateResources(');
replaceFile('src/components/ai/ResourceAllocationSimulator.tsx', /await allocateResources\(/, 'allocateResources(');
replaceFile('src/pages/control/ControlResourcePage.tsx', /await allocateResources\(/, 'allocateResources(');

console.log("Reverted awaits");
