import React from 'react';
import BlockComponent from '../../types/BlockComponent';
import BaseBlock from './BaseBlock';

type Props = {
  isPreview?: boolean;
}

const InformationBlock: BlockComponent<Props> = (props) => {
  const { isPreview = true } = props;

  if (isPreview) {
    return (
      <BaseBlock>
        Information
      </BaseBlock>
    );
  } else {
    return (
      <BaseBlock>
        Information
      </BaseBlock>
    );
  }
};
InformationBlock.defaultName = 'Information';

export default InformationBlock;
