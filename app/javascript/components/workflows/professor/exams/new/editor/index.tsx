import React from 'react';
import { createMap } from '@student/exams/show/files';
import { ExamContext } from '@student/exams/show/context';
import {
  Form,
  Button,
  Alert,
} from 'react-bootstrap';
import {
  ExamVersion,
  RailsExamVersion,
  AnswersState,
  Policy,
} from '@student/exams/show/types';
import {
  reduxForm,
  InjectedFormProps,
  FormSection,
  Field,
  WrappedFieldProps,
} from 'redux-form';
import { Provider } from 'react-redux';
import store from './store';
import Name from './components/Name';
import Policies from './components/Policies';
import Instructions from './components/Instructions';
import Reference from './components/Reference';
import FileUploader from './components/FileUploader';

export interface ExamEditorProps {
  exam: ExamVersion;
  railsExamVersion: RailsExamVersion;
  answers: AnswersState;
}

const Editor: React.FC<ExamEditorProps> = (props) => {
  const {
    exam,
    answers,
    railsExamVersion,
  } = props;
  return (
    <Provider store={store}>
      <ExamEditorForm
        initialValues={{
          all: {
            name: railsExamVersion.name,
            policies: railsExamVersion.policies,
            exam,
            answers,
          },
        }}
      />
    </Provider>
  );
};
export default Editor;

interface FormValues {
  all: {
    name: string;
    policies: Policy[];
    exam: ExamVersion;
    answers: AnswersState;
  };
}

type WrappedInput<T> = React.ComponentType<{ value: T; onChange: (a: T) => void; }>;

function wrapInput<T>(Wrappee : WrappedInput<T>): React.FC<WrappedFieldProps> {
  return (props) => {
    const { input } = props;
    return (
      <Wrappee value={input.value} onChange={input.onChange} />
    );
  };
}

const ExamEditor: React.FC<InjectedFormProps<FormValues>> = (props) => {
  const {
    pristine,
    reset,
  } = props;
  const files = [];
  const fmap = createMap(files);
  return (
    <form
      onSubmit={() => {
        console.log('TODO');
      }}
    >
      <ExamContext.Provider value={{ files, fmap }}>
        <FormSection name="all">
          <Field name="name" component={wrapInput(Name)} />
          <Field name="policies" component={wrapInput(Policies)} />
          <FormSection name="exam">
            <Alert variant="info">
              <h3>Exam-wide information</h3>
              <Field name="files" component={wrapInput(FileUploader)} />
              <Field name="instructions" component={wrapInput(Instructions)} />
            </Alert>
            <Field name="reference" component={wrapInput(Reference)} />
          </FormSection>
          <Form.Group>
            <Button
              variant="danger"
              className={pristine && 'd-none'}
              onClick={reset}
            >
              Reset
            </Button>
          </Form.Group>
        </FormSection>
      </ExamContext.Provider>
    </form>
  );
};

const ExamEditorForm = reduxForm({
  form: 'version-editor',
})(ExamEditor);
