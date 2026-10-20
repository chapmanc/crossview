import { NODE_TYPE } from './graphModel.js';

// Set by the API when the managed resource list was left out on purpose.
const MANAGED_SKIPPED = 'managed-skipped';

// Without that list every Composed Resource is a stub flagged unresolved, though none is missing.
// So the flag goes, and so does the warning, since the page says on its own that health is not loaded.
export const withoutSkippedStubs = (graph) => ({
  ...graph,
  nodes: graph.nodes.map((node) => (node.type === NODE_TYPE.COMPOSED && node.unresolved ? { ...node, unresolved: false } : node)),
  warnings: graph.warnings.filter((warning) => warning.code !== MANAGED_SKIPPED),
});
