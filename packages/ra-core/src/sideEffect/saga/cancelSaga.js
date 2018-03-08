import { all, call, take, takeEvery, put, race } from 'redux-saga/effects';
import { delay } from 'redux-saga';
import { push } from 'react-router-redux';

import {
    CRUD_UPDATE,
    CRUD_UPDATE_MANY,
    CRUD_DELETE,
    CRUD_DELETE_MANY,
} from '../../actions/dataActions';
import {
    showNotification,
    hideNotification,
} from '../../actions/notificationActions';
import {
    CANCELLABLE,
    CANCEL,
    startOptimisticMode,
    stopOptimisticMode,
} from '../../actions/cancelActions';
import { refreshView } from '../../actions/uiActions';
import resolveRedirectTo from '../../util/resolveRedirectTo';

function* handleCancelRace(cancellableAction) {
    const { payload: { action, delay: cancelDelay } } = cancellableAction;
    // display cancellable notification
    switch (action.type) {
        case CRUD_UPDATE: {
            yield put(
                showNotification('ra.notification.updated', 'info', {
                    messageArgs: {
                        smart_count: 1,
                    },
                    cancellable: true,
                })
            );
            break;
        }
        case CRUD_UPDATE_MANY: {
            yield put(
                showNotification('ra.notification.updated', 'info', {
                    messageArgs: {
                        smart_count: action.payload.ids.length,
                    },
                    cancellable: true,
                })
            );
            break;
        }
        case CRUD_DELETE: {
            yield put(
                showNotification('ra.notification.deleted', 'info', {
                    messageArgs: {
                        smart_count: 1,
                    },
                    cancellable: true,
                })
            );
            break;
        }
        case CRUD_DELETE_MANY: {
            yield put(
                showNotification('ra.notification.deleted', 'info', {
                    messageArgs: {
                        smart_count: action.payload.ids.length,
                    },
                    cancellable: true,
                })
            );
        }
    }
    yield put(startOptimisticMode());
    // dispatch action in optimistic mode (no fetch)
    yield put({
        ...action,
        type: `${action.type}_OPTIMISTIC`,
    });
    if (action.payload.redirectTo) {
        yield put(
            push(
                resolveRedirectTo(
                    action.payload.redirectTo,
                    action.payload.basePath,
                    action.payload.id
                )
            )
        );
    }
    yield put(refreshView());
    // launch cancellable race
    const { timeout } = yield race({
        cancel: take(CANCEL),
        timeout: call(delay, cancelDelay),
    });
    // whether the notification times out or is canceled, hide it
    yield put(stopOptimisticMode());
    yield put(hideNotification());
    // if not cancelled, redispatch the action, this time immediate
    if (timeout) {
        yield put(action);
    } else {
        yield put(refreshView());
    }
}

export default function* watchCancellable() {
    yield takeEvery(CANCELLABLE, handleCancelRace);
}
