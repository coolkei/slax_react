import { takeLatest, delay } from 'redux-saga';
import { put, call, cancelled } from 'redux-saga/effects';
import { push } from 'react-router-redux';
import {
    queryParameters,
    fetchJson,
    FETCH_START,
    FETCH_END,
    FETCH_ERROR,
    FETCH_CANCEL,
} from '../util/fetch';
import {
    CRUD_GET_LIST,
    CRUD_GET_ONE,
    CRUD_CREATE,
    CRUD_UPDATE,
    CRUD_DELETE,
} from '../actions/dataActions';
import { showNotification } from '../actions/notificationActions';

const crudSaga = (apiUrl) => {
    const buildHttpRequest = (resource, type, payload) => {
        let url = '';
        const options = {};
        switch (type) {
        case CRUD_GET_LIST: {
            const { page, perPage } = payload.pagination;
            const { field, order } = payload.sort;
            const query = {
                sort: JSON.stringify([field, order]),
                range: JSON.stringify([(page - 1) * perPage, page * perPage - 1]),
            };
            url = `${apiUrl}/${resource}?${queryParameters(query)}`;
            break;
        }
        case CRUD_GET_ONE:
            url = `${apiUrl}/${resource}/${payload.id}`;
            break;
        case CRUD_UPDATE:
            url = `${apiUrl}/${resource}/${payload.id}`;
            options.method = 'PUT';
            options.body = JSON.stringify(payload.data);
            break;
        case CRUD_CREATE:
            url = `${apiUrl}/${resource}`;
            options.method = 'POST';
            options.body = JSON.stringify(payload.data);
            break;
        default:
            throw new Error(`Unsupported fetch action type ${type}`);
        }
        return { url, options };
    };

    const convertResponse = (resource, type, response, payload) => {
        const { headers, json } = response;
        switch (type) {
        case CRUD_GET_LIST:
            return {
                data: json.map(x => x),
                total: parseInt(headers['content-range'].split('/').pop(), 10),
            };
        case CRUD_CREATE:
            return {
                id: json.id,
                data: payload.data,
            };
        default:
            return {
                data: json,
            };
        }
    };

    const getFailureSideEffects = (resource, type, error, payload) => {
        switch (type) {
        case CRUD_GET_ONE:
            return [
                showNotification('Element does not exist', 'warning'),
                push(payload.basePath),
            ];
        default:
            return [];
        }
    };

    const getSuccessSideEffects = (resource, type, response, payload) => {
        switch (type) {
        case CRUD_UPDATE:
            return [
                showNotification('Element updated'),
                push(payload.basePath),
            ];
        case CRUD_CREATE:
            return [
                showNotification('Element created'),
                push(`${payload.basePath}/${response.json.id}`),
            ];
        default:
            return [];
        }
    };

    function *handleFetch(action) {
        const { type, payload, meta } = action;
        delete meta.fetch;
        yield [
            put({ type: `${type}_LOADING`, payload, meta }),
            put({ type: FETCH_START }),
        ];
        const { url, options } = buildHttpRequest(meta.resource, type, payload);
        let response;
        try {
            // simulate response delay
            yield call(delay, 1000);
            response = yield fetchJson(url, options);
        } catch (error) {
            const sideEffects = getFailureSideEffects(meta.resource, type, error, payload);
            yield [
                ...sideEffects.map(a => put(a)),
                put({ type: `${type}_FAILURE`, error, meta }),
                put({ type: FETCH_ERROR }),
            ];
            return;
        } finally {
            if (yield cancelled()) {
                yield put({ type: FETCH_CANCEL });
                return;
            }
        }
        const sideEffects = getSuccessSideEffects(meta.resource, type, response, payload);
        yield [
            ...sideEffects.map(a => put(a)),
            put({ type: `${type}_SUCCESS`, payload: convertResponse(meta.resource, type, response, payload), meta }),
            put({ type: FETCH_END }),
        ];
    }

    return function *watchCrudFetch() {
        yield* takeLatest(action => action.meta && action.meta.fetch, handleFetch);
    };
};


export default crudSaga;
