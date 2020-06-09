import ExamShowContents from '@student/exams/show/components/ExamShowContents';
import { connect } from 'react-redux';
import { saveSnapshot } from '@student/exams/show/actions';
import {
  Exam,
  MSTP,
  MDTP,
  RailsExam,
  RailsCourse,
} from '@student/exams/show/types';

interface OwnProps {
  railsCourse: RailsCourse;
  railsExam: RailsExam;
}

const mapStateToProps: MSTP<{exam: Exam}, OwnProps> = (state) => ({
  exam: state.contents.exam,
});

const mapDispatchToProps: MDTP<{
  save: () => void;
}, OwnProps> = (dispatch, ownProps) => ({
  save: (): void => {
    dispatch(saveSnapshot(ownProps.railsCourse.id, ownProps.railsExam.id));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(ExamShowContents);