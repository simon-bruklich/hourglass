import React, { useState } from 'react';
import Code from '@hourglass/workflows/professor/exams/new/old-editor/components/questions/Code';
import YesNo from '@hourglass/workflows/professor/exams/new/old-editor/components/questions/YesNo';
import CodeTag from '@hourglass/workflows/professor/exams/new/old-editor/components/questions/CodeTag';
import Text from '@hourglass/workflows/professor/exams/new/old-editor/components/questions/Text';
import Matching from '@hourglass/workflows/professor/exams/new/old-editor/components/questions/Matching';
import MultipleChoice from '@hourglass/workflows/professor/exams/new/old-editor/components/questions/MultipleChoice';
import AllThatApply from '@hourglass/workflows/professor/exams/new/old-editor/components/questions/AllThatApply';
import { BodyItem } from '@student/exams/show/types';
import { ExhaustiveSwitchError } from '@hourglass/common/helpers';
import { Card } from 'react-bootstrap';
import { Field, WrappedFieldProps, FormSection } from 'redux-form';
import MoveItem from '@hourglass/workflows/professor/exams/new/old-editor/components/MoveItem';
import { EditHTMLField } from './editHTMLs';

const OneItem: React.FC<WrappedFieldProps & {
  memberName: string;
  qnum: number;
  pnum: number;
  bnum: number;
}> = (props) => {
  const {
    input,
    memberName,
    qnum,
    pnum,
    bnum,
  } = props;
  const {
    value,
  }: {
    value: BodyItem['info']['type'];
  } = input;
  if (value === 'HTML') {
    return (
      <Field
        name={memberName}
        component={EditHTMLField}
        className="text-instructions bg-white"
        placeholder="Provide instructions here..."
      />
    );
  }
  let body;
  switch (value) {
    case 'Code':
      body = <Code qnum={qnum} pnum={pnum} bnum={bnum} />;
      break;
    case 'AllThatApply':
      body = <AllThatApply qnum={qnum} pnum={pnum} bnum={bnum} />;
      break;
    case 'CodeTag':
      body = <CodeTag qnum={qnum} pnum={pnum} bnum={bnum} />;
      break;
    case 'YesNo':
      body = <YesNo qnum={qnum} pnum={pnum} bnum={bnum} />;
      break;
    case 'MultipleChoice':
      body = <MultipleChoice qnum={qnum} pnum={pnum} bnum={bnum} />;
      break;
    case 'Text':
      body = <Text qnum={qnum} pnum={pnum} bnum={bnum} />;
      break;
    case 'Matching':
      body = <Matching qnum={qnum} pnum={pnum} bnum={bnum} />;
      break;
    default:
      throw new ExhaustiveSwitchError(value);
  }
  return (
    <FormSection name={memberName}>
      {body}
    </FormSection>
  );
};

export interface BodyProps {
  memberName: string;
  qnum: number;
  pnum: number;
  bnum: number;
  enableDown: boolean;
  moveDown: () => void;
  moveUp: () => void;
  remove: () => void;
}

const Body: React.FC<BodyProps> = (props) => {
  const {
    qnum,
    pnum,
    bnum,
    memberName,
    enableDown,
    moveDown,
    moveUp,
    remove,
  } = props;
  const [moversVisible, setMoversVisible] = useState(false);
  const showMovers = (): void => setMoversVisible(true);
  const hideMovers = (): void => setMoversVisible(false);
  return (
    <Card
      className="border border-secondary alert-secondary mb-3"
      onMouseOver={showMovers}
      onFocus={showMovers}
      onBlur={hideMovers}
      onMouseOut={hideMovers}
    >
      <MoveItem
        visible={moversVisible}
        variant="secondary"
        enableUp={bnum > 0}
        enableDown={enableDown}
        enableDelete
        disabledDeleteMessage=""
        onUp={moveUp}
        onDown={moveDown}
        onDelete={remove}
      />
      <Card.Body>
        <Field
          name={`${memberName}.type`}
          component={OneItem}
          qnum={qnum}
          pnum={pnum}
          bnum={bnum}
          memberName={memberName}
        />
      </Card.Body>
    </Card>
  );
};

export default Body;