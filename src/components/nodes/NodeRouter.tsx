import classnames from 'classnames';
import cloneDeep from 'lodash.clonedeep';
import React from 'react';
import {
  NodeProps,
  Remove,
} from 'reaflow';
import { NodeData } from 'reaflow/dist/types';
import { useRecoilState } from 'recoil';
import { blockPickerMenuState } from '../../states/blockPickerMenuState';
import { edgesState } from '../../states/edgesState';
import { nodesState } from '../../states/nodesState';
import { selectedNodesState } from '../../states/selectedNodesState';
import BaseNodeData from '../../types/BaseNodeData';
import BaseNodeProps, { UpdateCurrentNode } from '../../types/BaseNodeProps';
import NodeType from '../../types/NodeType';
import {
  filterNodeInArray,
  removeAndUpsertNodesThroughPorts,
} from '../../utils/nodes';
import BasePort from '../ports/BasePort';
import InformationNode from './InformationNode';
import QuestionNode from './QuestionNode';

type Props = {
  nodeProps: NodeProps;
  lastCreatedNode: BaseNodeData | undefined;
}

/**
 * Node router.
 *
 * Acts as a router between node layouts, by rendering a different node layout, depending on the node "type".
 */
const NodeRouter: React.FunctionComponent<Props> = (props) => {
  const {
    nodeProps,
    lastCreatedNode,
  } = props;
  const [blockPickerMenu, setBlockPickerMenu] = useRecoilState(blockPickerMenuState);
  const [nodes, setNodes] = useRecoilState(nodesState);
  const [edges, setEdges] = useRecoilState(edgesState);
  const [selectedNodes, setSelectedNodes] = useRecoilState(selectedNodesState);
  const node: BaseNodeData = nodes.find((node: BaseNodeData) => node.id === nodeProps.id) as BaseNodeData;

  // console.log('router nodes', props);
  // console.log('node', node);

  const { properties } = nodeProps || {};
  const { data } = properties || {};
  const { type }: { type: NodeType } = data || {};

  if (!type) {
    try {
      console.error(`Node with type="${type}" couldn't be rendered. Properties: ${JSON.stringify(properties, null, 2)}`);
    } catch (e) {
      console.error(`Node with type="${type}" couldn't be rendered. Properties cannot be stringified.`);
    }

    return null;
  }

  /**
   * Updates the properties of the current node.
   *
   * TODO rename patchCurrentNode
   *
   * @param nodeData
   */
  const updateCurrentNode: UpdateCurrentNode = (nodeData: Partial<BaseNodeData>): void => {
    console.log('Updating current node with', nodeData);
    const nodeToUpdateIndex = nodes.findIndex((node: BaseNodeData) => node.id === nodeProps.id);
    console.log('updateCurrentNode nodeToUpdateIndex', nodeToUpdateIndex);
    const nodeToUpdate = {
      ...nodes[nodeToUpdateIndex],
      ...nodeData,
      id: nodeProps.id, // Force keep same id to avoid edge cases
    };
    console.log('updateCurrentNode updated node', nodeToUpdate);

    const newNodes = cloneDeep(nodes);
    newNodes[nodeToUpdateIndex] = nodeToUpdate;
    console.log('updateCurrentNode new nodes', newNodes);

    setNodes(newNodes);
  };

  /**
   * Removes a node.
   *
   * Upsert its descendant if there were any. (auto-link all descendants to all its ascendants)
   *
   * Triggered when clicking on the "x" remove button that appears when a node is selected.
   *
   * @param event
   * @param node
   */
  const onNodeRemove = (event: React.MouseEvent<SVGGElement, MouseEvent>, node: NodeData) => {
    console.log('onNodeRemove', event, node);
    const result = removeAndUpsertNodesThroughPorts(nodes, edges, node);

    setNodes(result.nodes);
    setEdges(result.edges);

    // Updates selected nodes to make sure we don't keep selected nodes that have been deleted
    setSelectedNodes(filterNodeInArray(selectedNodes, node));

    // Hide the block picker menu.
    // Forces to reset the function bound to onBlockClick. Necessary when there is one or none node left.
    setBlockPickerMenu({
      isDisplayed: false,
    });
  };

  /**
   * Selects the node when clicking on it.
   *
   * XXX We're resolving the "node" ourselves, instead of relying on the 2nd argument (nodeData),
   *  which might return null depending on where in the node the click was performed.
   *
   * @param event
   * @param data
   */
  const onNodeClick = (event: React.MouseEvent<SVGGElement, MouseEvent>, data: BaseNodeData) => {
    console.log('onNodeClick data', data);
    const node: BaseNodeData = nodes.find((node: BaseNodeData) => node.id === nodeProps?.id) as BaseNodeData;
    console.log(`node clicked (${nodeProps?.properties?.text || nodeProps?.id})`, nodeProps);
    console.log(`node selected`, node);
    if (node?.id) {
      setSelectedNodes([node]);
    }
  };

  /**
   * When the mouse enters a node (on hover).
   *
   * XXX Does not work well because `foreignObject` is displayed on top of the Node. See https://github.com/reaviz/reaflow/issues/45
   *
   * @param event
   * @param node
   */
  const onNodeEnter = (event: React.MouseEvent<SVGGElement, MouseEvent>, node: BaseNodeData) => {

  };

  /**
   * When the mouse leaves a node (leaves hover area).
   *
   * XXX Does not work well because `foreignObject` is displayed on top of the Node. See https://github.com/reaviz/reaflow/issues/45
   *
   * @param event
   * @param node
   */
  const onNodeLeave = (event: React.MouseEvent<SVGGElement, MouseEvent>, node: BaseNodeData) => {

  };

  /**
   * Node props applied to all nodes, no matter what type they are.
   */
  const baseNodeProps: BaseNodeProps = {
    ...nodeProps,
    node,
    updateCurrentNode,
    lastCreatedNode,
    isSelected: false, // TODO implement
    className: classnames(
      `node-svg-rect node-${type}-svg-rect`,
    ),
    style: {
      strokeWidth: 0,
      fill: 'white',
      color: 'black',
    },
    port: (
      <BasePort fromNodeId={nodeProps.id} />
    ),
    onClick: onNodeClick,
    onEnter: onNodeEnter,
    onLeave: onNodeLeave,
    onRemove: onNodeRemove,
    remove: (<Remove hidden={true} />),
  };

  // console.log('rendering node of type: ', type, commonBlockProps)

  switch (type) {
    case 'information':
      return (
        <InformationNode
          {...baseNodeProps}
        />
      );
    case 'question':
      return (
        <QuestionNode
          {...baseNodeProps}
        />
      );
  }

  return null;
};

export default NodeRouter;
