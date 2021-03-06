import React from 'react';
import { Button, Glyphicon } from 'react-bootstrap';
import { connect } from 'react-redux';
import { accounts as accountsLoad } from '../../actions/dictionaries';
import DateInput from '../controls/form/dateInput';
import { profile } from '../../actions/security';
import { html, excel } from '../../actions/common';

class OrderRegister extends React.Component {
    static contextTypes = {
        router: React.PropTypes.object.isRequired,
        store: React.PropTypes.object.isRequired
    };

    state = {
        beginDate: new Date(),
        endDate: new Date(),
        branchId: 0,
        accountType: 10,
        accountId: null
    };

    componentDidMount(){
        if (this.props.auth.isAuthenticated) {
            this.props.profile();
        }
        if (!this.props.accounts.length) {
            this.props.accountsLoad();
        }
    }

    onPrint = () => {
        let query = {
            reportName: 'OrderRegisterReport',
            reportQuery: {
                beginDate: this.state.beginDate || new Date(),
                endDate: this.state.endDate || new Date(),
                branchId: this.state.branchId || 0,
                accountType: this.state.accountType || 10,
                accountId: this.state.accountId || 0
            }
        };

        this.props.html(query);
    }

    onExport = () => {
        let query = {
            reportName: 'OrderRegisterReport',
            reportQuery: {
                beginDate: this.state.beginDate || new Date(),
                endDate: this.state.endDate || new Date(),
                branchId: this.state.branchId || 0,
                accountType: this.state.accountType || 10,
                accountId: this.state.accountId || 0
            }
        };

        this.props.excel(query);
    }

    render = () => (
        <div style={{margin:20}}>
            <div className="row form-group">
                <div className="col-sm-2">
                    <label>Дата с</label>
                </div>
                <div className="col-sm-4">
                    <DateInput className="form-control" placeholder="Дата с" onChange={e => {
                        this.setState({
                            beginDate: e
                        });
                    }} value={this.state.beginDate} />
                </div>
                <div className="col-sm-2">
                    <label>по</label>
                </div>
                <div className="col-sm-4">
                    <DateInput className="form-control" placeholder="по" onChange={e => {
                        this.setState({
                            endDate: e
                        });
                    }} value={this.state.endDate} />
                </div>
            </div>
            <div className="row form-group">
                <div className="col-sm-2">
                    <label>Филиал</label>
                </div>
                <div className="col-sm-10">
                    <select className="form-control"
                            onChange={e => {
                                this.setState({
                                    branchId: e.target.value
                                });
                            }}>
                        <option selected={!this.state.branchId} value="0">Все</option>
                        {this.props.auth.profile.branches.map(b =>
                            <option selected={b.id == this.state.branchId} value={b.id}>{b.displayName}</option>
                        )}
                    </select>
                </div>
            </div>
            <div className="row form-group">
                <div className="col-sm-2">
                    <label>Вид счета</label>
                </div>
                <div className="col-sm-4">
                    <select className="form-control"
                            onChange={e => {
                                this.setState({
                                    accountType: e.target.value
                                });
                            }}>
                        <option selected={!this.state.accountType} value="">Вид счета</option>
                        <option selected={this.state.accountType == 10} value="10">Дебет</option>
                        <option selected={this.state.accountType == 20} value="20">Кредит</option>
                    </select>
                </div>
                <div className="col-sm-2">
                    <label>Счет</label>
                </div>
                <div className="col-sm-4">
                    <select className="form-control"
                            onChange={e => {
                                this.setState({
                                    accountId: e.target.value
                                });
                            }}>
                        <option selected={!this.state.accountId} value="">Счет</option>
                        {this.props.accounts.map(a =>
                            <option selected={a.id == this.state.accountId} value={a.id}>{a.code} - {a.name}</option>
                        )}
                    </select>
                </div>
            </div>
            <div className="row form-group">
                <div className="col-sm-12">
                    <div className="pull-right">
                        <Button onClick={e => this.onPrint()}><Glyphicon glyph="print"/> Печать</Button>
                        <Button onClick={e => this.onExport()}><Glyphicon glyph="print"/> Excel</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default connect((state) => {
    const { dictionary, auth } = state;

    return {
        accounts: dictionary.accounts,
        auth: auth
    }
}, { accountsLoad, profile, html, excel })(OrderRegister);