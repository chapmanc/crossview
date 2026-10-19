import { Box, Text, HStack, Badge } from '@chakra-ui/react';
import { Handle, Position } from '@xyflow/react';
import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MdWarning } from 'react-icons/md';
import PropTypes from 'prop-types';
import { getBackgroundColor, getTextColor } from '../../utils/theme.js';
import { getHealthColor } from '../common/ResourceRelations/utils.js';
import { NODE_TYPE_COLORS } from './graphEdgeStyles.js';
import { graphNodeShape } from './graphPropTypes.js';
import { formatCount, noun, kindTitle } from '../../utils/graph/graphModel.js';
import { useIsInLineage, useIsSelected } from './GraphHighlightContext.js';

const UNRESOLVED_COLOR = getHealthColor('warning');

// Empty when the node is healthy.
const describeProblem = (node) =>
  [
    node.ready === 'False' && 'Failed: Ready is False',
    node.synced === 'False' && 'Failed: Synced is False',
    node.ready === 'Unknown' && 'Unknown: Ready is Unknown',
  ]
    .filter(Boolean)
    .join(' · ');

// The tooltip is drawn on the page body so the nodes around this one cannot cover it.
const ProblemIcon = ({ description }) => {
  const iconRef = useRef(null);
  const [anchor, setAnchor] = useState(null);
  const show = () => {
    const { left, bottom } = iconRef.current.getBoundingClientRect();
    setAnchor({ left, top: bottom + 4 });
  };
  return (
    <Box as="span" ref={iconRef} display="inline-flex" onMouseEnter={show} onMouseLeave={() => setAnchor(null)}>
      <MdWarning size={18} color={getHealthColor('warning')} aria-label={description} style={{ flexShrink: 0 }} />
      {anchor &&
        createPortal(
          <Box position="fixed" left={`${anchor.left}px`} top={`${anchor.top}px`} zIndex={10000} px={2} py={1} borderRadius="md" bg="gray.800" color="white" fontSize="xs" whiteSpace="nowrap">
            {description}
          </Box>,
          document.body
        )}
    </Box>
  );
};

ProblemIcon.propTypes = { description: PropTypes.string.isRequired };

const UnknownStatusBadge = () => (
  <Badge fontSize="2xs" colorPalette="orange" variant="subtle" textTransform="none" title="Something references this resource, but Crossview has no status for it. It may be missing or not managed by Crossplane.">
    Unknown
  </Badge>
);

const NoCompositionBadge = () => (
  <Badge
    fontSize="2xs"
    colorPalette="red"
    variant="solid"
    textTransform="none"
    title="Crossplane has not selected a Composition for this resource. Check its Synced condition."
  >
    No Composition
  </Badge>
);

export const GraphNode = ({ data }) => {
  const { node, colorMode, noComposition, partial } = data;
  const inLineage = useIsInLineage(node.id);
  const selected = useIsSelected(node.id);
  const problem = describeProblem(node);
  const typeColor = NODE_TYPE_COLORS[node.type];

  return (
    <Box
      className={`graph-node${inLineage ? ' in-lineage' : ''}`}
      w="240px"
      px={3}
      py={2}
      borderRadius="md"
      bg={getBackgroundColor(colorMode, 'primary')}
      border={selected ? '3px' : '2px'}
      borderStyle={node.unresolved ? 'dashed' : 'solid'}
      borderColor={node.unresolved ? UNRESOLVED_COLOR : typeColor}
      borderLeftWidth="6px"
      borderLeftStyle="solid"
      borderLeftColor={typeColor}
      boxShadow={selected ? 'md' : 'none'}
    >
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
      <HStack justify="space-between" gap={2}>
        <HStack gap={1} minW={0}>
          {problem && <ProblemIcon description={problem} />}
          <Text fontSize="xs" color={getTextColor(colorMode, 'muted')} noOfLines={1} title={node.wraps ? `${node.kind} wrapping a ${node.wraps}` : node.apiVersion}>
            {kindTitle(node)}
          </Text>
        </HStack>
        {noComposition && <NoCompositionBadge />}
        {node.unresolved && <UnknownStatusBadge />}
        {node.namespace && (
          <Badge fontSize="2xs" variant="outline" textTransform="none" maxW="110px" truncate>
            {node.namespace}
          </Badge>
        )}
      </HStack>
      <Text fontSize="sm" fontWeight="bold" color={getTextColor(colorMode, 'primary')} noOfLines={1} title={node.name}>
        {node.name}
      </Text>
      {partial && (
        <Text fontSize="xs" color={getTextColor(colorMode, 'muted')} noOfLines={1}>
          {formatCount(partial.shown)} of {formatCount(partial.total)} {noun(partial.total, partial.label)}
        </Text>
      )}
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
    </Box>
  );
};

GraphNode.propTypes = {
  data: PropTypes.shape({
    node: graphNodeShape.isRequired,
    colorMode: PropTypes.string,
    noComposition: PropTypes.bool,
    partial: PropTypes.shape({ shown: PropTypes.number.isRequired, total: PropTypes.number.isRequired, label: PropTypes.string.isRequired }),
  }).isRequired,
};
