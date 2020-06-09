import React from 'react';
import { Provider } from 'react-redux';
import store from '@student/exams/show/store';
import {
  RailsExam,
  RailsUser,
  RailsRegistration,
  RailsCourse,
} from '@student/exams/show/types';
import ExamTaker from '@student/exams/show/containers/ExamTaker';
import ExamSubmitted from '@student/exams/show/components/ExamSubmitted';
import { RailsContext } from '@student/exams/show/context';
import { DateTime } from 'luxon';

interface ShowExamProps {
  // The current logged-in user.
  railsUser: RailsUser;

  // Information about the exam.
  railsExam: RailsExam;

  // Information about the registration.
  railsRegistration: RailsRegistration;

  // Information about the course.
  railsCourse: RailsCourse;

  // Whether the exam is complete.
  final: boolean;

  lastSnapshot?: DateTime;
}

const ShowExam: React.FC<ShowExamProps> = (props) => {
  const {
    railsUser,
    railsExam,
    railsRegistration,
    railsCourse,
    final,
    lastSnapshot,
  } = props;
  return (
    <RailsContext.Provider
      value={{
        railsExam,
        railsRegistration,
        railsUser,
        railsCourse,
      }}
    >
      <Provider store={store}>
        {final ? <ExamSubmitted lastSnapshot={lastSnapshot} /> : <ExamTaker />}
      </Provider>
    </RailsContext.Provider>
  );
};

export default ShowExam;