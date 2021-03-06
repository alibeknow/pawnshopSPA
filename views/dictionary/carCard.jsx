import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import CarForm, { submitForm } from './carForm';

import { card as cardLoad, save as cardSave } from '../../actions/cars';

import Restrict from '../controls/restrict';
import permissions from '../../engine/permissions';

class CarCard extends React.Component {
    constructor(props, context, queue) {
        super(props, context, queue);
    }

    static contextTypes = {
        router: PropTypes.object.isRequired,
        store: PropTypes.object.isRequired
    };

    componentWillMount = () => {
        this.onLoad(this.props.params.id);
    };

    onLoad = id => this.props.cardLoad(id);
    onSave = car =>
        this.props
            .cardSave(car)
            .then(action => {
                if (action && action.data) {
                    this.context.router.push(`/cars/${action.data.id}`);
                }
            });

    render = () => {
        if (!this.props.card) return <div></div>;
        const { dispatch } = this.context.store;

        return (
            <div>
                <Restrict permissions={permissions.CarManage} pass>
                    <CarForm onSubmit={this.onSave} initialValues={this.props.card} enableReinitialize />
                </Restrict>
                <div className="panel-footer">
                    <div className="btn-group btn-group-sm">
                        <button type="button" className="btn btn-warning" onClick={() => history.back()}>Назад</button>
                        <Restrict permissions={permissions.CarManage}>
                            <button type="button" className="btn btn-primary" onClick={() => dispatch(submitForm)}>Сохранить</button>
                        </Restrict>
                    </div>
                </div>
            </div>
        );
    };
}

export default connect(state => {
    const { workspace } = state;
    return {
        card: workspace.card
    }
}, { cardLoad, cardSave })(CarCard);