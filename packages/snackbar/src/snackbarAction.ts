import { ThunkAction } from 'redux-thunk';
import { Snackbar } from './Snackbar';
import {
  getNextSnackbar,
  getSnackbar,
  isSnackbarOpened,
  isSnackbarUnique
} from './snackbarSelector';

/**
 * Internal function to compute UUIDv4
 */
function uuid() {
  let unique = '';

  for (let i = 0; i < 32; i++) {
    // tslint:disable-next-line
    const random = (Math.random() * 16) | 0;

    if (i === 8 || i === 12 || i === 16 || i === 20) {
      unique += '-';
    }

    // tslint:disable-next-line
    unique += (i === 12 ? 4 : i === 16 ? (random & 3) | 8 : random).toString(
      16
    );
  }

  return unique;
}

/**
 * Creates action that adds new snackbar to the queue (we should display only one snackbar at once).
 */
export const SNACKBAR_QUEUED = '@@redux-snackbar/SNACKBAR_QUEUED';
export type SnackbarQueuedAction = {
  type: typeof SNACKBAR_QUEUED;
  payload?: Snackbar;
};
export const snackbarQueued = (snackbar: Snackbar): SnackbarQueuedAction => ({
  type: SNACKBAR_QUEUED,
  payload: snackbar
});

/**
 * Creates action that opens queued snackbar.
 */
export const SNACKBAR_OPENED = '@@redux-snackbar/SNACKBAR_OPENED';
export type SnackbarOpenedAction = {
  type: typeof SNACKBAR_OPENED;
  payload?: { id: Snackbar['id']; timeoutId?: any };
};
export const snackbarOpened = (
  id: Snackbar['id'],
  timeoutId?: any
): SnackbarOpenedAction => ({
  type: SNACKBAR_OPENED,
  payload: { id, timeoutId }
});

/**
 * Creates action that closes opened snackbar.
 */
export const SNACKBAR_CLOSED = '@@redux-snackbar/SNACKBAR_CLOSED';
export type SnackbarClosedAction = {
  type: typeof SNACKBAR_CLOSED;
  payload?: Snackbar['id'];
};
export const snackbarClosed = (id: Snackbar['id']): SnackbarClosedAction => ({
  type: SNACKBAR_CLOSED,
  payload: id
});

/**
 * Creates action that removes closed snackbar.
 */
export const SNACKBAR_REMOVED = '@@redux-snackbar/SNACKBAR_REMOVED';
export type SnackbarRemovedAction = {
  type: typeof SNACKBAR_REMOVED;
  payload?: Snackbar['id'];
};
export const snackbarRemoved = (id: Snackbar['id']): SnackbarRemovedAction => ({
  type: SNACKBAR_REMOVED,
  payload: id
});

/**
 * Creates thunk action that opens snackbar (this action handles queueing and opening snackbar).
 */
export const openSnackbar = (
  message: string,
  timeout = 5000,
  unique = true
): ThunkAction<Snackbar['id'] | undefined, any, any, SnackbarActions> => (
  dispatch,
  getState
) => {
  if (unique && !isSnackbarUnique(message)(getState())) {
    // don't display snackbar if the current one is the same
    return undefined;
  }

  const id = uuid();

  dispatch(snackbarQueued({ id, message, timeout }));

  // schedule snackbar opened and closed action
  // to animate snackbar enter we have to open in next tick
  setTimeout(() => {
    if (!isSnackbarOpened(getState())) {
      dispatch(scheduleSnackbar(id));
    }
  }, 0);

  return id;
};

/**
 * Creates thunk action that closes snackbar
 * (this action handles closing, removing and taking next snackbar from the queue).
 */
export const closeSnackbar = (
  id: Snackbar['id']
): ThunkAction<void, any, any, SnackbarActions> => (dispatch, getState) => {
  const snackbar = getSnackbar(id)(getState());

  if (snackbar) {
    if (snackbar.timeoutId) {
      clearTimeout(snackbar.timeoutId);
    }

    dispatch(snackbarClosed(id));

    // schedule next snackbar
    const nextSnackbar = getNextSnackbar(getState());
    if (nextSnackbar) {
      dispatch(scheduleSnackbar(nextSnackbar.id));
    }

    // to animate snackbar leave
    setTimeout(() => dispatch(snackbarRemoved(id)), 1000);
  }
};

/**
 * Create thunk action that schedules snackbar lifecycle (opening and closing).
 */
const scheduleSnackbar = (
  id: Snackbar['id']
): ThunkAction<any, any, any, SnackbarActions> => (dispatch, getState) => {
  const snackbar = getSnackbar(id)(getState());
  let timeoutId: any;

  if (snackbar) {
    if (snackbar.timeout) {
      timeoutId = setTimeout(
        () => dispatch(closeSnackbar(id)),
        snackbar.timeout
      );
    }

    dispatch(snackbarOpened(id, timeoutId));
  }

  return timeoutId;
};

export type SnackbarActions =
  | SnackbarQueuedAction
  | SnackbarOpenedAction
  | SnackbarClosedAction
  | SnackbarRemovedAction;
