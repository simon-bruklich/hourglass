import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useResponse as examsShow, Version } from '@hourglass/common/api/professor/exams/show';
import { ExhaustiveSwitchError } from '@hourglass/common/helpers';
import {
  Collapse,
  Button,
  InputGroup,
  ButtonGroup,
  Form,
} from 'react-bootstrap';
import { FaChevronUp, FaChevronDown } from 'react-icons/fa';
import Icon from '@student/exams/show/components/Icon';
import ExamViewer from '@proctor/registrations/show';
import { RailsExam, ContentsState } from '@student/exams/show/types';
import { Editor as CodeMirrorEditor } from 'codemirror';
import LinkButton from '@hourglass/common/linkbutton';
import { DateTime } from 'luxon';

const ExamAdmin: React.FC<{}> = () => {
  const { examId } = useParams();
  const res = examsShow(examId);
  switch (res.type) {
    case 'ERROR':
      return (
        <span
          className="text-danger"
        >
          {res.text}
        </span>
      );
    case 'LOADING':
      return <p>Loading...</p>;
    case 'RESULT':
      return (
        <>
          <h1>{res.response.name}</h1>
          <p>{`Start: ${res.response.start.toLocaleString(DateTime.DATETIME_FULL)}`}</p>
          <p>{`End: ${res.response.end.toLocaleString(DateTime.DATETIME_FULL)}`}</p>
          <p>{`Duration: ${res.response.duration} minutes`}</p>
          <h2>Versions</h2>
          <ul>
            {res.response.versions.map((v) => (
              <li key={v.id}>
                <ShowVersion
                  version={v}
                  examName={res.response.name}
                />
              </li>
            ))}
          </ul>
          <h2>Proctoring Arrangements</h2>
          <Form.Group>
            <Link to={`/exams/${examId}/seating`}>
              <Button
                variant="info"
              >
                Assign seating
              </Button>
            </Link>
            <Link to={`/exams/${examId}/allocate-versions`}>
              <Button
                variant="info"
                className="ml-2"
              >
                Allocate versions
              </Button>
            </Link>
          </Form.Group>
        </>
      );
    default:
      throw new ExhaustiveSwitchError(res);
  }
};

const ShowVersion: React.FC<{
  version: Version;
  examName: string;
}> = (props) => {
  const {
    version,
    examName,
  } = props;
  const { examId } = useParams();
  const [preview, setPreview] = useState(false);
  return (
    <>
      <InputGroup>
        <h3 className="flex-grow-1">{version.name}</h3>
        <InputGroup.Append>
          <ButtonGroup>
            <Button
              variant="info"
            >
              Grade
            </Button>
            <LinkButton
              variant="info"
              to={`/exams/${examId}/versions/${version.id}/edit`}
            >
              Edit
            </LinkButton>
            <Button
              variant="primary"
              onClick={(): void => setPreview((o) => !o)}
            >
              Preview Version
              {preview ? <Icon I={FaChevronUp} /> : <Icon I={FaChevronDown} />}
            </Button>
          </ButtonGroup>
        </InputGroup.Append>
      </InputGroup>
      <PreviewVersion
        open={preview}
        railsExam={{
          id: examId,
          name: examName,
          policies: version.policies,
        }}
        contents={version.contents}
      />
    </>
  );
};

export default ExamAdmin;

interface CodeMirroredElement extends Element {
  CodeMirror: CodeMirrorEditor;
}

const PreviewVersion: React.FC<{
  open: boolean;
  contents: ContentsState;
  railsExam: RailsExam;
}> = (props) => {
  const {
    open,
    contents,
    railsExam,
  } = props;
  useEffect(() => {
    if (!open) return;
    document.querySelectorAll('.CodeMirror').forEach((cm) => {
      setTimeout(() => (cm as CodeMirroredElement).CodeMirror.refresh());
    });
  }, [open]);
  return (
    <Collapse in={open}>
      <div className="border p-2">
        <ExamViewer
          railsExam={railsExam}
          contents={contents}
        />
      </div>
    </Collapse>
  );
};
