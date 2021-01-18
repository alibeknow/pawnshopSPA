import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { Table, Column } from '../controls/table';
import { ButtonGroup, Button, Glyphicon, InputGroup } from 'react-bootstrap';
import { connect } from 'react-redux';
import { list as listLoad, remove as removeItem, undoRemove, excel as excelLoad } from '../../actions/cashOrders';
import { clients as clientsLoad, users as usersLoad, accounts as accountsLoad } from '../../actions/dictionaries';
import CashOrdersPrint from './cashOrdersPrint';
import CashInOrderPrint from './cashInOrderPrint';
import CashOutOrderPrint from './cashOutOrderPrint';
import { downloadTemp, print } from '../../actions/common';
import Confirmation from '../controls/confirmation';

import Restrict from '../controls/restrict';
import permissions from '../../engine/permissions';
import { profile } from '../../actions/security';
import SelectInput from '../controls/form/selectInput';
import DateInput from '../controls/form/dateInput';
import moment from 'moment';

class CashOrders extends React.Component {
    constructor(props, context, queue) {
        super(props, context, queue);

        this.onLoad({});
        if (!this.props.users.length) {
            this.props.usersLoad();
        }
        if (!this.props.accounts.length) {
            this.props.accountsLoad();
        }
        this.client = {
            id: null,
            fullname: 'Клиент'
        };
    }

    static contextTypes = {
        router: PropTypes.object.isRequired,
        store: React.PropTypes.object.isRequired
    };

    filter = {
        orderType: null,
        beginDate: null,
        endDate: null,
        orderNumber: null,        
        clientId: null,
        userId: null,
        accountId: null,
        isDelete: null,
    };

    client = {
        id: null,
        fullname: 'Клиент'
    }

    componentDidMount(){
        if (this.props.auth.isAuthenticated) {
            this.props.profile();
        }
    }

    onLoad = query => {
        if (!query) {
            query = this.props.query || {};
        }

        if (query.clean) {
            this.filter = {
                orderType: null,
                beginDate: null,
                endDate: null,
                orderNumber: null,        
                clientId: null,
                userId: null,
                accountId: null,
                isDelete: null,
            };
            this.client = {
                id: null,
                fullname: 'Клиент'
            };
            query.clean = undefined;
        }
        
        query.model = {
            orderType: this.filter.orderType || null,
            beginDate: this.filter.beginDate || null,
            endDate: this.filter.endDate || null,
            orderNumber: this.filter.orderNumber || null,
            clientId: this.filter.clientId || null,
            userId: this.filter.userId || null,
            accountId: this.filter.accountId || null,
            isDelete: this.filter.isDelete || null,
        };
        this.props.listLoad(query);
    };

    onPrint = () => {
        this.props.print(<CashOrdersPrint data={this.props.list} auth={this.props.auth} />);
    };

    onPrintCard = (row) => {
        if (row.orderType == 10) {
            this.props.print(<CashInOrderPrint data={row} auth={this.props.auth} />);
        } else {
            this.props.print(<CashOutOrderPrint data={row} auth={this.props.auth} />);
        }
    };

    onExport = () => {
        this.props.excelLoad(this.props.list.list)
            .then(action => {
                if (action && action.data) {
                    this.context.store.dispatch(downloadTemp(action.data));
                }
            });
    };

    _confirmation = null;
    render = () => (
        <div>
            <Table data={this.props.list} query={this.props.query}
                   onLoad={this.onLoad} actions={this.renderActions()} filters={this.renderFilters()}>
                <Column name="orderType" title="Вид ордера" sort={true} template={
                    row =>
                    row.orderType == 10 && <span>Приход</span> ||
                    row.orderType == 20 && <span>Расход</span>
                } />
                <Column name="orderNumber" title="№" sort={true} template={
                    row => !row.clientId && <Link onlyActiveOnIndex={true} to={`/cashOrders/${row.id}`} target="_blank">{row.orderNumber}</Link> || <span>{row.orderNumber}</span>
                } />
                <Column name="orderDate" title="Дата" sort="desc" type="date" template={
                    row => !row.clientId && <Link onlyActiveOnIndex={true} to={`/cashOrders/${row.id}`} target="_blank">{moment(row.orderDate).format('L')}</Link> || <span>{moment(row.orderDate).format('L')}</span>
                } />
                <Column name="reason" title="Основание" sort={false} />
                <Column name="orderCost" title="Сумма" sort={true} />
                <Column name="debitAccount.code" title="Дебет" sort={true} template={
                    row => row.debitAccount.code
                } />
                <Column name="creditAccount.code" title="Кредит" sort={true} template={
                    row => row.creditAccount.code
                } />
                <Column name="clientName" title="Клиент" sort={true} />
                <Column name="branch.displayName" title="Филиал" sort={true} template={
                    row => row.branch.displayName
                } />
                <Column name="author.fullname" title="Автор" sort={true} template={
                    row => row.author.fullname
                } />
                <Column actions={true} template={
                    row =>
                        <ButtonGroup bsSize="xs">
                            <Link onlyActiveOnIndex={true} className="btn btn-default btn-sm" to={`/cashOrders/${row.id}`} target="_blank" disabled={row.clientId}><Glyphicon glyph="edit"/></Link>
                            <Button onClick={e => this.onPrintCard(row)}><Glyphicon glyph="print"/></Button>
                            <Restrict permissions={permissions.CashOrderManage}>
                                <Button onClick={e => this.context.router.push(`/cashOrders/${row.id}/true`)}><Glyphicon glyph="copy"/></Button>
                            </Restrict>
                            {!row.deleteDate &&
                            <Restrict permissions={permissions.CashOrderManage}>
                                <Button onClick={e => {
                                    this._confirmation.show("Вы действительно хотите удалить запись?",
                                        () => this.props.removeItem(row.id)
                                            .then(action => this.onLoad(this.props.query))
                                    );
                                }} disabled={row.clientId || (!row.createdToday && !this.props.auth.profile.user.forSupport)}><Glyphicon glyph="remove"/></Button>
                            </Restrict>
                            }
                            {row.deleteDate &&
                            <Restrict permissions={permissions.CashOrderManage}>
                                <Button onClick={e => {
                                    this._confirmation.show("Вы действительно хотите восстановить запись?",
                                        () => this.props.undoRemove(row.id)
                                            .then(action => this.onLoad(this.props.query))
                                    );
                                }} disabled={row.clientId || (!row.createdToday && !this.props.auth.profile.user.forSupport)}><Glyphicon glyph="repeat"/></Button>
                            </Restrict>
                            }
                        </ButtonGroup>
                } />
            </Table>

            <Confirmation ref={r => this._confirmation = r} />
        </div>
    );

    renderActions = () =>
        <ButtonGroup bsSize="sm">
            <Restrict permissions={permissions.CashOrderManage}>
                <Button onClick={e => this.context.router.push('/cashOrders/0')}><Glyphicon glyph="plus"/> Создать</Button>
            </Restrict>
            <Button onClick={e => this.onPrint()}><Glyphicon glyph="print"/> Печать</Button>
            <Button onClick={e => this.onExport()}><Glyphicon glyph="print"/> Excel</Button>
        </ButtonGroup>;

    renderFilters = () => [ 
        <div className="row">
            <div className="col-sm-3">
                <InputGroup bsSize="sm" style={{width:'100%', paddingLeft:5}}>
                    <select className="form-control" aria-describedby="orderType-addon" onChange={e => {
                                this.filter.orderType = e.target.value;
                                this.onLoad();
                            }}>
                        <option selected={!this.filter.orderType} value="">Вид кассового ордера</option>
                        <option selected={this.filter.orderType == 10} value="10">Приход</option>
                        <option selected={this.filter.orderType == 20} value="20">Расход</option>
                    </select>
                </InputGroup>
            </div>
            <div className="col-sm-3">
                <DateInput className="form-control input-sm" placeholder="Дата с..." onChange={e => {
                    this.filter.beginDate = e;
                    this.onLoad();
                }} value={this.filter.beginDate} />                
            </div>
            <div className="col-sm-3">
                <DateInput className="form-control input-sm" placeholder="Дата по..." onChange={e => {
                    this.filter.endDate = e;
                    this.onLoad();
                }} value={this.filter.endDate} />
            </div>
            <div className="col-sm-3">
                <InputGroup bsSize="sm" style={{width:'100%'}}>
                    <span className="input-group-addon" id="orderNumber-addon">№</span>
                    <input type="int" min="1" className="form-control" name="orderNumber" aria-describedby="orderNumber-addon"
                        onChange={e => {
                            this.filter.orderNumber = e.target.value;
                            this.onLoad();
                        }} value={this.filter.orderNumber} />
                </InputGroup>
            </div>
        </div>,
        <div className="row" style={{marginTop:5}}>
            <div className="col-sm-6">
                <InputGroup bsSize="sm" style={{width:'100%', paddingLeft:5}}>
                    <SelectInput title="Выбор клиента" className="form-control input-sm"
                        input={{ value: this.client, onChange: e => { 
                            this.filter.clientId = (e && e.id) || null;
                            this.client = e;
                            this.onLoad(); 
                        } }}
                        onLoad={clientsLoad} display={e => e.fullname} />
                </InputGroup>
            </div>
            <div className="col-sm-6">
                <InputGroup bsSize="sm" style={{width:'100%'}}>
                    <select className="form-control" aria-describedby="userId-addon"
                            onChange={e => {
                                this.filter.userId = e.target.value;
                                this.onLoad();
                            }}>
                        <option selected={!this.filter.userId} value="">Сотрудник</option>
                        {this.props.users.map((item, i) => {
                            return <option selected={this.filter.userId == item.id} value={item.id}>{item.fullname}</option>
                        })}
                    </select>
                </InputGroup>
            </div>
        </div>,
        <div className="row" style={{marginTop:5}}>
            <div className="col-sm-6">
                <InputGroup bsSize="sm" style={{width:'100%', paddingLeft:5}}>
                    <select className="form-control" aria-describedby="accountId-addon"
                            onChange={e => {
                                this.filter.accountId = e.target.value;
                                this.onLoad();
                            }}>
                        <option selected={!this.filter.accountId} value="">Счет</option>
                        {this.props.accounts.map((item, i) => {
                            return <option selected={this.filter.accountId == item.id} value={item.id}>{item.code} - {item.name}</option>
                        })}
                    </select>
                </InputGroup>
            </div>
            <div className="col-sm-3">
                <InputGroup bsSize="sm" style={{width:'100%', paddingLeft:5}}>
                    <span className="input-group-addon">
                        <input type="checkbox" onChange={e => {
                            this.filter.isDelete = e.target.checked;
                            this.onLoad();
                        }} checked={this.filter.isDelete} />
                    </span>
                    <input type="text" className="form-control" value="удаленные" disabled />
                </InputGroup>
            </div>
        </div>
    ];
}

export default connect((state) => {
    const { workspace, dictionary, auth } = state;

    return { 
        list: workspace.list, 
        query: workspace.query,
        users: dictionary.users,
        accounts: dictionary.accounts,
        auth: auth
    }
}, { listLoad, removeItem, undoRemove, excelLoad, clientsLoad, usersLoad, accountsLoad, print, profile })(CashOrders);