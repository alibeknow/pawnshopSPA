import { CALL_API } from '../middleware/api';
import * as ActionTypes from './actionTypes';

export const list = query => dispatch => {
    return dispatch({
        data: query,
        [CALL_API]: {
            endpoint: 'account/list',
            actionType: ActionTypes.WORKSPACE_LIST
        }
    });
};

export const card = query => dispatch => {
    if (query == 0) {
        return dispatch({
            data: {},
            type: ActionTypes.WORKSPACE_CARD
        });
    }
    return dispatch({
        data: query,
        [CALL_API]: {
            endpoint: 'account/card',
            actionType: ActionTypes.WORKSPACE_CARD
        }
    });
};

export const save = query => dispatch => {
    return dispatch({
        data: query,
        [CALL_API]: {
            endpoint: 'account/save',
            actionType: ActionTypes.WORKSPACE_CARD
        }
    });
};

export const remove = query => dispatch => {
    return dispatch({
        data: query,
        [CALL_API]: {
            endpoint: 'account/delete',
            actionType: ActionTypes.WORKSPACE_CARD
        }
    });
};