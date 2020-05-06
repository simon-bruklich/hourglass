import { connect } from 'react-redux';
import {
  LockdownStatus,
  MSTP,
} from '@hourglass/types';
import ExamTaker from '@hourglass/components/ExamTaker';

const examTakerStateToProps: MSTP<{ ready: boolean }> = (state) => ({
  ready: state.lockdown.status === LockdownStatus.LOCKED && !!state.contents.data,
});

export default connect(examTakerStateToProps)(ExamTaker);