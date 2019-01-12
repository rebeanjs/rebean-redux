import {
  DefaultSnackbarAwareState,
  Snackbar,
  SNACKBAR_OPENED,
  SNACKBAR_QUEUED,
  snackbarOpened,
  snackbarQueued,
  snackbarReducer,
} from '@rebean/redux-snackbar';

describe('SnackbarReducer', () => {
  let initialState: DefaultSnackbarAwareState;
  let snackbar: Snackbar;

  beforeEach(() => {
    initialState = {
      snackbar: {
        queued: [],
        opened: undefined,
        closed: [],
      },
    };
    snackbar = {
      id: '1',
      message: 'Test',
      timeout: 1000,
    };
  });

  it('should add snackbar to the queued on SNACKBAR_QUEUED action from undefined state', () => {
    const prevState = undefined;
    const action = snackbarQueued(snackbar);
    const nextState = snackbarReducer(prevState, action);

    expect(nextState).toEqual({
      snackbar: {
        queued: [snackbar],
        opened: undefined,
        closed: [],
      },
    });
  });

  it('should ignore SNACKBAR_QUEUED action if payload is empty', () => {
    const prevState = initialState;
    const action = { type: SNACKBAR_QUEUED };
    const nextState = snackbarReducer(prevState, action);

    expect(nextState).toBe(prevState);
  });

  it('should set snackbar id as opened on SNACKBR_OPENED action', () => {
    const prevState = {
      snackbar: {
        queued: [snackbar],
        opened: undefined,
        closed: [],
      },
    };
    const action = snackbarOpened(snackbar.id);
    const nextState = snackbarReducer(prevState, action);

    expect(nextState).toEqual({
      snackbar: {
        queued: [snackbar],
        opened: snackbar.id,
        closed: [],
      },
    });
    expect(nextState.snackbar!.queued).toBe(prevState.snackbar.queued);
    expect(nextState.snackbar!.closed).toBe(prevState.snackbar.closed);
  });

  it('should set snackbar id as opened and update timeoutId on snackbar on SNACKBR_OPENED action', () => {
    const prevState = {
      snackbar: {
        queued: [snackbar],
        opened: undefined,
        closed: [],
      },
    };
    const action = snackbarOpened(snackbar.id, 123);
    const nextState = snackbarReducer(prevState, action);

    expect(nextState).toEqual({
      snackbar: {
        queued: [
          {
            ...snackbar,
            timeoutId: 123,
          },
        ],
        opened: snackbar.id,
        closed: [],
      },
    });
    expect(nextState.snackbar!.closed).toBe(prevState.snackbar.closed);
  });

  it('should ignore SNACKBAR_OPENED if payload is empty', () => {
    const prevState = initialState;
    const action = { type: SNACKBAR_OPENED };
    const nextState = snackbarReducer(prevState, action);

    expect(nextState).toBe(prevState);
  });

  it('should unset snackbar id as opened and ');
});