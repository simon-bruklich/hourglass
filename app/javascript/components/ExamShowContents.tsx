import React, { useEffect } from 'react';
import {
  Exam,
} from '@hourglass/types';
import { createMap } from '@hourglass/files';
import { ExamContextProvider } from '@hourglass/context';
import Questions from '@hourglass/containers/Questions';
import useAnomalyListeners from '@hourglass/lockdown/anomaly';
import HTML from '@hourglass/components/HTML';
import { FileViewer } from './FileViewer';

interface ExamShowContentsProps {
  examState: Exam;
  save: () => void;
}

const INTERVAL = 10000;

const ExamShowContents: React.FC<ExamShowContentsProps> = (props) => {
  const {
    examState,
    save,
  } = props;
  const {
    contents,
    files,
  } = examState;
  useEffect(() => {
    const timer: number = window.setInterval(() => save(), INTERVAL);
    return (): void => {
      clearInterval(timer);
    };
  }, [save]);
  useAnomalyListeners();
  const {
    questions,
    instructions,
    reference,
  } = contents;
  const fmap = createMap(files);
  return (
    <ExamContextProvider value={{ files, fmap }}>
      <div>
        <HTML value={instructions} />
        {reference && <FileViewer references={reference} />}
        <div>
          <Questions questions={questions} />
        </div>
      </div>
    </ExamContextProvider>
  );
};

export default ExamShowContents;
