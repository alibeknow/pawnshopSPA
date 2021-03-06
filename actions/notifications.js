import { CALL_API } from '../middleware/api';
import * as ActionTypes from './actionTypes';

export const list = query => dispatch => {
    return dispatch({
        data: query,
        [CALL_API]: {
            endpoint: 'notification/list',
            actionType: ActionTypes.WORKSPACE_LIST
        }
    });
};

export const card = query => dispatch => {
    if (query == 0) {
        return dispatch({
            data: {
                messageType: 10,
                status: 0,
                createDate: new Date(),
                receivers: []
            },
            type: ActionTypes.WORKSPACE_CARD
        });
    }
    return dispatch({
        data: query,
        [CALL_API]: {
            endpoint: 'notification/card',
            actionType: ActionTypes.WORKSPACE_CARD
        }
    });
};

export const save = query => dispatch => {
    return dispatch({
        data: query,
        [CALL_API]: {
            endpoint: 'notification/save',
            actionType: ActionTypes.WORKSPACE_CARD
        }
    });
};

export const remove = query => dispatch => {
    return dispatch({
        data: query,
        [CALL_API]: {
            endpoint: 'notification/delete',
            actionType: ActionTypes.WORKSPACE_CARD
        }
    });
};

export const send = query => dispatch => {
    return dispatch({
        data: query,
        [CALL_API]: {
            endpoint: 'notification/send',
            actionType: ActionTypes.WORKSPACE_CARD
        }
    });
};

export const resend = query => dispatch => {
    return dispatch({
        data: query,
        [CALL_API]: {
            endpoint: 'notification/resend'
        }
    });
};