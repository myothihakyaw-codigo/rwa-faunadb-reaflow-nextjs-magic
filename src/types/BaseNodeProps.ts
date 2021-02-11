import { NodeProps } from 'reaflow';
import BaseNodeData from './BaseNodeData';

/**
 * Props received by any node.
 */
export type BaseNodeProps = {
  /**
   * Updates the properties of the current node.
   *
   * @param nodeData
   */
  updateCurrentNode?: (nodeData: Partial<BaseNodeData>) => void;

  /**
   * The last created node.
   * Will be undefined if no node was created yet.
   */
  lastCreatedNode?: BaseNodeData | undefined;
} & Partial<NodeProps>;

export default BaseNodeProps;
