import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import AssetForm from './assetForm';
import { card as cardLoad, save as cardSave } from '../../actions/assets';
import Restrict from '../controls/restrict';
import permissions from '../../engine/permissions';

class AssetCard extends React.Component {
    constructor(props, context, queue) {
        super(props, context, queue);
    }

    static contextTypes = {
        router: PropTypes.object.isRequired
    };

    componentWillMount = () => {
        this.onLoad(this.props.params.id);
    };

    onLoad = id => this.props.cardLoad(id);
    onSave = model =>
        this.props
            .cardSave(model)
            .then(action => {
                if (action && action.data) {
                    this.context.router.push(`/assets/${action.data.id}`);
                }
            });

    render = () => {
        if (!this.props.card) return <div></div>;
        return (
            <Restrict permissions={permissions.AssetManage} pass>
                <AssetForm onSubmit={this.onSave} initialValues={this.props.card} enableReinitialize />
            </Restrict>
        );
    };
}

export default connect(state => {
    const { workspace } = state;

    return {
        card: workspace.card
    }
}, { cardLoad, cardSave })(AssetCard);
