import React, { useEffect, useState } from 'react';
import { FileRef, CodeTagInfo, CodeTagState } from '@hourglass/types';
import {
  Row, Col, Modal, Button,
} from 'react-bootstrap';
import { ControlledFileViewer } from '@hourglass/components/FileViewer';
import HTML from '@hourglass/components/HTML';
import { CodeTagVal } from '@hourglass/components/questions/CodeTag';


interface FileModalProps {
  references: FileRef[];
  startValue: CodeTagState;
  show: boolean;
  onClose: () => void;
}

const FileModal: React.FC<FileModalProps> = (props) => {
  const {
    show,
    references,
    startValue,
    onClose,
  } = props;
  // Modal has its own state so the user can manipulate it before saving.
  const [selected, setSelected] = useState(startValue);
  const [refresher, setRefresher] = useState(false);
  const refreshCodeMirror = (): void => setRefresher((b) => !b);
  useEffect(() => {
    // Reset my starting state when outer state changes.
    setSelected(startValue);
  }, [startValue]);
  return (
    <Modal
      show={show}
      onEscapeKeyDown={onClose}
      onHide={onClose}
      onEntering={refreshCodeMirror}
      dialogClassName="w-100 mw-100 m-2"
      centered
      keyboard
    >
      <Modal.Body>
        <ControlledFileViewer
          refreshProps={[refresher]}
          references={references}
          selection={selected}
          onChangeFile={(_newFile): void => {
            // do nothing
          }}
          onChangeLine={(_newLine): void => {
            // do nothing
          }}
        />
      </Modal.Body>
      <Modal.Footer>
        <div className="mr-auto">
          <CodeTagVal value={selected} />
        </div>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

interface CodeTagProps {
  info: CodeTagInfo;
  value: CodeTagState;
}

const DisplayCodeTag: React.FC<CodeTagProps> = (props) => {
  const {
    info,
    value,
  } = props;
  const { choices, prompt } = info;
  const [showModal, setShowModal] = useState(false);
  let theRest;
  if (value) {
    theRest = (
      <>
        <Row className="mt-2">
          <Col>
            <CodeTagVal value={value} />
          </Col>
          <Col>
            <Button size="sm" onClick={(): void => setShowModal(true)} variant="outline-info">
              Show line
            </Button>
            <FileModal
              references={choices}
              show={showModal}
              onClose={(): void => setShowModal(false)}
              startValue={value}
            />
          </Col>
        </Row>
      </>
    );
  } else {
    theRest = (
      <Row className="mt-2">
        <Col>
          <b>File: </b>
          <i>No file selected</i>
        </Col>
      </Row>
    );
  }
  return (
    <Row>
      <Col>
        {prompt
         && (
         <Row>
           <Col sm={12}>
             {prompt.map((p, i) => (
               <HTML
                 // Prompt indices are STATIC.
                 // eslint-disable-next-line react/no-array-index-key
                 key={i}
                 value={p}
               />
             ))}
           </Col>
         </Row>
         )}
        {theRest}
      </Col>
    </Row>
  );
};

export default DisplayCodeTag;
