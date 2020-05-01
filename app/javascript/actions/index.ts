import { AnswersState, StatePath, AnswerState } from '@hourglass/types';
import Routes from '@hourglass/routes';
import { getCSRFToken } from '@hourglass/helpers';

export type Action = UpdateAnswerAction | LoadSnapshotAction;
export type SnapshotAction = SnapshotDisable | SnapshotFetching | SnapshotSaving | SnapshotSuccess | SnapshotFailure;

export interface UpdateAnswerAction {
  type: 'UPDATE_ANSWER';
  path: StatePath;
  val: AnswerState;
}

export interface LoadSnapshotAction {
  type: 'LOAD_SNAPSHOT';
  answers: AnswersState;
}

function loadSnapshotAction(answers: AnswersState) {
  return {
    type: 'LOAD_SNAPSHOT',
    answers,
  };
}

interface SnapshotLoadResult {
  answers: AnswersState;
}

export function fetchSnapshot(examID) {
  return (dispatch) => {
    dispatch(snapshotFetching());
    const url = Routes.get_snapshot_exam_path(examID);
    fetch(url)
      .then((result) => result.json() as Promise<SnapshotLoadResult>)
      .then((result) => {
        const { answers } = result;
        dispatch(loadSnapshotAction(answers));
        dispatch(snapshotSuccess());
      }).catch((err) => {
        console.error('Snapshot fetch failure', err);
        const error = 'Error fetching snapshot from server.';
        dispatch(snapshotFailure(error));
      });
  };
}

interface SnapshotSaveResult {
  lockout: boolean;
}

export function saveSnapshot(examID) {
  return (dispatch, getState) => {
    const { answers } = getState();
    dispatch(snapshotSaving());
    const url = Routes.save_snapshot_exam_path(examID);
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': getCSRFToken(),
      },
      body: JSON.stringify({ answers }),
      credentials: 'same-origin',
    })
      .then((result) => result.json() as Promise<SnapshotSaveResult>)
      .then((result) => {
        const { lockout } = result;
        console.log('lockout: ', lockout);
        dispatch(snapshotSuccess());
      }).catch((err) => {
        console.error('Snapshot save failure', err);
        const error = 'Error saving snapshot to server.';
        dispatch(snapshotFailure(error));
      });
  };
}

export interface SnapshotDisable {
  type: 'SNAPSHOT_DISABLE';
}

export function snapshotDisable(): SnapshotDisable {
  return {
    type: 'SNAPSHOT_DISABLE',
  };
}

export interface SnapshotFetching {
  type: 'SNAPSHOT_FETCHING';
}

export function snapshotFetching(): SnapshotFetching {
  return {
    type: 'SNAPSHOT_FETCHING',
  };
}

export interface SnapshotSaving {
  type: 'SNAPSHOT_SAVING',
}

export function snapshotSaving(): SnapshotSaving {
  return {
    type: 'SNAPSHOT_SAVING',
  };
}

export interface SnapshotSuccess {
  type: 'SNAPSHOT_SUCCESS';
}

function snapshotSuccess() {
  return {
    type: 'SNAPSHOT_SUCCESS',
  };
}

export interface SnapshotFailure {
  type: 'SNAPSHOT_FAILURE';
  message: string;
}

function snapshotFailure(message) {
  return {
    type: 'SNAPSHOT_FAILURE',
    message,
  };
}

export function updateAnswer(path: StatePath, val: AnswerState): UpdateAnswerAction {
  return {
    type: 'UPDATE_ANSWER',
    path,
    val,
  };
}
