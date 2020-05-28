import { connect } from 'react-redux';
// import { updateAnswer } from '@professor/exams/new/actions';
import {
  AnswerState,
  BodyItem,
} from '@student/exams/show/types';
import {
  MSTP,
  MDTP,
  UpdateBodyItemAction,
  ExamEditorState,
} from '@professor/exams/new/types';

interface OwnProps {
  info: BodyItem;
  qnum: number;
  pnum: number;
  bnum: number;
}

export function updateAnswer(
  qnum: number,
  pnum: number,
  bnum: number,
  info: BodyItem,
  answer: AnswerState,
): UpdateBodyItemAction {
  return {
    type: 'UPDATE_BODY_ITEM',
    qnum,
    pnum,
    bnum,
    info,
    answer,
  };
}

const mapStateToProps: MSTP<{
  value: AnswerState;
}, OwnProps> = (state: ExamEditorState, ownProps) => {
  const { qnum, pnum, bnum } = ownProps;
  const { contents } = state;
  return {
    value: contents.answers?.answers?.[qnum]?.[pnum]?.[bnum],
  };
};

const mapDispatchToProps: MDTP<{
  onChange: (newInfo: BodyItem, newState: AnswerState) => void;
}, OwnProps> = (dispatch, ownProps) => {
  const { qnum, pnum, bnum } = ownProps;
  return {
    onChange: (newInfo: BodyItem, newState: AnswerState): void => {
      dispatch(
        updateAnswer(
          qnum,
          pnum,
          bnum,
          newInfo,
          newState,
        ),
      );
    },
  };
};

// eslint-disable-next-line
export const connectWithPath = (Component) => connect(mapStateToProps, mapDispatchToProps)(Component);
