import React from 'react';
import {
  Button,
} from 'react-bootstrap';

interface SubmitButtonProps {
  submit: () => void;
}

const SubmitButton: React.FC<SubmitButtonProps> = (props) => {
  const { submit } = props;
  return (
    <div className="my-2">
      <Button
        variant="success"
        onClick={(): void => {
          // TODO check if student is sure
          submit();
        }}
      >
        Submit Exam
      </Button>
    </div>
  );
};

export default SubmitButton;