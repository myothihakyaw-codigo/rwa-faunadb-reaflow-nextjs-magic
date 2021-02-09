import { css } from '@emotion/react';
import cloneDeep from 'lodash.clonedeep';
import React, { MutableRefObject } from 'react';
import { CanvasRef } from 'reaflow';
import { useRecoilState } from 'recoil';
import { blockPickerMenuState } from '../../states/blockPickerMenuState';
import { edgesState } from '../../states/edgesState';
import { nodesState } from '../../states/nodesState';
import BaseNodeType from '../../types/BaseNodeType';
import BlockPickerMenuState from '../../types/BlockPickerMenu';
import {
  addNodeAndEdgeThroughPorts,
  createNodeFromDefaultProps,
} from '../../utils/nodes';
import BlockPickerMenu from '../blocks/BlockPickerMenu';
import InformationNode from '../nodes/InformationNode';
import QuestionNode from '../nodes/QuestionNode';
import CanvasContainer from './CanvasContainer';

type Props = {
  canvasRef: MutableRefObject<CanvasRef | null>;
}

/**
 * @see https://github.com/reaviz/reaflow
 */
const PlaygroundContainer: React.FunctionComponent<Props> = (props): JSX.Element | null => {
  const {
    canvasRef,
  } = props;
  const [blockPickerMenu, setBlockPickerMenu] = useRecoilState<BlockPickerMenuState>(blockPickerMenuState);
  const [nodes, setNodes] = useRecoilState(nodesState);
  const [edges, setEdges] = useRecoilState(edgesState);

  console.log('nodes.length', nodes.length);
  console.log('nodes', nodes);
  // Handle edge cases when there are 0 or 1 node (picker menu must always be displayed then)
  if (!blockPickerMenu.isDisplayed && nodes.length < 2) {
    setBlockPickerMenu({
      displayedFrom: nodes.length === 0 ? 'playground' : `node-${nodes[0].id}`,
      isDisplayed: true,
      onBlockClick: (nodeType: BaseNodeType) => {
        if (nodes.length === 1) {
          console.log('onBlockClick (1 node)', nodeType);
          const NodeComponent = nodeType === 'question' ? QuestionNode : InformationNode;
          const newNode = createNodeFromDefaultProps(NodeComponent.getDefaultNodeProps());
          const results = addNodeAndEdgeThroughPorts(cloneDeep(nodes), cloneDeep(edges), newNode, nodes[0]);
          console.log('results', results);

          // TODO Awaiting feedback on https://github.com/reaviz/reaflow/issues/47 to decide whether go with a custom implementation for ports binding or await an official one
          setNodes(results.nodes);
          setEdges(results.edges);

        } else if (nodes.length === 0) {
          console.log('onBlockClick (0 nodes)', nodeType);
          const NodeComponent = nodeType === 'question' ? QuestionNode : InformationNode;
          const newNode = createNodeFromDefaultProps(NodeComponent.getDefaultNodeProps());

          setNodes([newNode]);
          setEdges([]);
        }
      },
    });
  }

  console.log('Playground render', nodes, edges);

  return (
    <div
      className={'playground-container'}
      css={css`
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;

        .background {
          position: absolute;
          width: 100%;
          height: 100%;
          background-color: #f5f5f5;
          background-size: 50px 50px;
          background-image: linear-gradient(90deg, #eaeaea 1px, transparent 0), linear-gradient(180deg, #eaeaea 1px, transparent 0);
          background-position: right -109px bottom -39px;
          transform: scale(1);
          z-index: -10000;
        }
      `}
    >
      <div className={'background'} />
      <CanvasContainer
        canvasRef={canvasRef}
      />

      <BlockPickerMenu />
    </div>
  );
};

export default PlaygroundContainer;
