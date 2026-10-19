import { Text } from '@chakra-ui/react';

export const GraphLegend = () => (
  <Text fontSize="xs" color="gray.500" mt={2}>
    Arrows take the colour of what they point to. A warning icon means Ready or Synced is False, or Ready is Unknown. Scrolling moves the page; hold Ctrl and scroll, or pinch, to zoom the graph.
  </Text>
);
