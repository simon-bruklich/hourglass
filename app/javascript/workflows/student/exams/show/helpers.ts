import {
  RailsExamMessage,
  ExamMessage,
  RailsExamQuestion,
  ProfQuestion,
} from '@student/exams/show/types';
import { DateTime } from 'luxon';

export function getCSRFToken(): string {
  const elem: HTMLMetaElement = document.querySelector('[name=csrf-token]');
  return elem.content;
}

/**
 * Flash an element's background color for emphasis.
 */
function pulse(elem: HTMLElement): void {
  const listener = (): void => {
    elem.removeEventListener('animationend', listener);
    elem.classList.remove('bg-pulse');
  };
  elem.addEventListener('animationend', listener);
  elem.classList.add('bg-pulse');
}

function scrollToElem(id: string, smooth = true): void {
  setTimeout(() => {
    const elem = document.getElementById(id);
    const elemTop = elem.getBoundingClientRect().top + window.pageYOffset;
    window.scrollTo({
      left: 0,
      top: elemTop + 1,
      behavior: smooth ? 'smooth' : 'auto',
    });
    pulse(elem);
  });
}

export function scrollToQuestion(qnum: number, pnum?: number, smooth?: boolean): void {
  if (pnum !== undefined) {
    scrollToElem(`question-${qnum}-part-${pnum}`, smooth);
  } else {
    scrollToElem(`question-${qnum}`, smooth);
  }
}

export function convertMsgs(msgs: RailsExamMessage[]): ExamMessage[] {
  return msgs.map((m) => ({
    ...m,
    time: DateTime.fromISO(m.time),
  }));
}

export function convertQs(qs: RailsExamQuestion[]): ProfQuestion[] {
  return qs.map((m) => ({
    ...m,
    status: 'SENT',
    time: DateTime.fromISO(m.time),
  }));
}
