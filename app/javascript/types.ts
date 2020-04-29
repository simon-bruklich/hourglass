import CM from 'codemirror';

export interface ExamState {
  answers: AnswersState;
  snapshot: SnapshotState;
}

export interface SnapshotState {
  isLoading: boolean;
  success: boolean;
  message: string;
}

export interface AnswersState {
  [qnum: number]: {
    [pnum: number]: {
      [bnum: number]: AnswerState;
    }
  }
}

export type StatePath = Array<number | string>;

export interface Code {
  type: 'Code';
  prompt: Array<string>;
  lang: string;
}

interface MarkDescription {
  from: CodeMirror.Position;
  to: CodeMirror.Position;
  options: CodeMirror.TextMarkerOptions
}

export type CodeState = {
  text: string;
  marks: MarkDescription[];
};

export interface AllThatApply {
  type: 'AllThatApply';
  options: Array<string>;
  prompt: Array<string>;
}

export interface AllThatApplyState {
  [index: number]: boolean;
}

export interface YesNo {
  type: 'YesNo' | 'TrueFalse';
  prompt: Array<string>;
}

export type YesNoState = boolean;

export interface CodeTag {
  type: 'CodeTag';
  prompt: Array<string>;
  choices: Array<FileRef>;
}

export interface CodeTagState {
  selectedFile?: string;
  lineNumber: number;
}

export interface MultipleChoice {
  type: 'MultipleChoice';
  prompt: Array<string>; // (html)
  options: Array<string>; // (html)
}

export type MultipleChoiceState = number;

export interface Text {
  type: 'Text';
  prompt: Array<string>; // (html)
}

export type TextState = string;

export interface Matching {
  type: 'Matching';
  promptLabel?: string; // (html)
  prompts: Array<string>; // (html)
  valuesLabel?: string;
  values: Array<string>;
}

export interface MatchingState {
  [index: number]: number;
}

export type BodyItem = HTML | AllThatApply | Code | YesNo | CodeTag | MultipleChoice | Text | Matching;

export type AnswerState = AllThatApplyState | CodeState | YesNoState | CodeTagState | MultipleChoiceState | TextState | MatchingState;

type HTML = {
  type: 'HTML';
  value: string;
};

export interface Part {
  name?: string;
  description: string;
  points: number;
  reference?: Array<FileRef>;
  body: Array<BodyItem>;
}

export interface Question {
  name?: string;
  description: string;
  separateSubparts: boolean;
  parts: Array<Part>;
  reference?: Array<FileRef>;
}

export interface Exam {
  questions: Array<Question>;
  reference?: Array<FileRef>;
  instructions: string;
}

export type FileRef = SingleFileRef | DirRef;

export interface SingleFileRef {
  type: 'file';

  // The full path of the file.
  path: string;
}

export interface DirRef {
  type: 'dir';

  // The full path of the directory.
  path: string;
}

// A tree of files, used in displaying treeview references.
export interface ExamSingleFile {
  filedir: 'file';

  // Label for the file.
  text: string;

  // Path name of this file (no trailing slash)
  path: string;

  rel_path: string;

  // Sequential ID of this file.
  id: number;

  // The contents of the file.
  contents: string;

  // The CodeMirror type for this file.
  type: string;
}

export interface ExamDir {
  filedir: 'dir';

  // Label for the directory (with trailing slash)
  text: string;

  // Path name of this directory (no trailing slash)
  path: string;

  rel_path: string;

  // Sequential ID of this directory.
  id: number;

  // Files within this directory.
  nodes: Array<ExamFile>;
}

// Exam files can be single files or directories.
export type ExamFile = ExamSingleFile | ExamDir;

export type Files = Array<ExamFile>;

// Map from file path to file.
export interface FileMap {
  [path: string]: ExamFile;
}

// An exam object.
export interface ExamInfo {
  // File tree.
  files: Files;

  // Questions and their references.
  info: Exam;
}
