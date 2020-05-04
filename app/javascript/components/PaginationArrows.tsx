import React from 'react';
import { MdArrowForward, MdArrowBack } from 'react-icons/md';
import { Button } from 'react-bootstrap';

interface PaginationArrowsProps {
  showBack: boolean;
  showNext: boolean;
  onBack: () => void;
  onNext: () => void;
}

const PaginationArrows: React.FC<PaginationArrowsProps> = (props) => {
  const {
    showBack,
    showNext,
    onBack,
    onNext,
  } = props;
  return (
    <div>
      <Button
        disabled={!showBack}
        onClick={onBack}
      >
        <MdArrowBack /> Previous
      </Button>
      <Button
        disabled={!showNext}
        className="ml-2"
        onClick={onNext}
      >
        Next <MdArrowForward />
      </Button>
    </div>
  );
}
PaginationArrows.displayName = "PaginationArrows";

export default PaginationArrows;
