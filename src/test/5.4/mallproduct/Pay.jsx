import * as _ from 'underscore';
import * as React from 'react';
import * as appUtils from 'utils/appUtils';

const
	_k = (key, ...args)=>appUtils.i18n.getKey.apply(null, [$i18n.mallproduct_pay[key], ...args]),
	_num = n=>parseFloat(n).toFixed(2);

export default React.createClass({
	togglePayMethod: function(id) {
		let pm = _.findWhere(this.state.data.payMethods, {id});
		this.setState({pay_method: pm});
	},

	getInitialState: function() {
		return {
			data: this.props.data,
			pay_method: _.isUndefined(this.props.data.payMethods) ? null : this.props.data.payMethods[0]
		};
	},
	render: function() {
		let _d = this.state.data;
		return <div id="mallproduct_pay" ref="p_root">
			<ul className="mod_common_list products">{
				_d.products.map(p=><li className="noGap" id={'p_'+p.id}>
					<label>{p.name}</label>
					<em className="pull-right"
						dangerouslySetInnerHTML={{__html: _k('price_and_count', _num(p.unitPrice), p.count)}}></em>
				</li>)
			}</ul>
			{/* 运费、合计 */}
			<div className="mod_common_li_item mod_common_list_style noGap carriage_and_total">
				{
					_.isUndefined(_d.carriage) || _.isNull(_d.carriage)
						? null
						: <label className="carriage"
							dangerouslySetInnerHTML={{__html: _k('label_carriage', _d.carriage)}}></label>
				}
				<span className="pull-right total"
					dangerouslySetInnerHTML={{__html: _k('label_total', _num(_d.totalPrice))}}></span>
			</div>
			{/* 已支付、还需支付 */}
			{
				_.isUndefined(_d.paidPortion) || _.isUndefined(_d.unpaidPortion)
					? null
					: <div className="mod_common_li_item mod_common_list_style noGap pay_progress">
						<label className="paid"
							dangerouslySetInnerHTML={{__html: _k('label_paidPortion', _num(_d.paidPortion))}}></label>
						<span className="pull-right unpaid"
							dangerouslySetInnerHTML={{__html: _k('label_unpaidPortion', _num(_d.unpaidPortion))}}></span>
					</div>
			}
			{/* 实付 */}
			<div className="mod_common_li_item mod_common_list_style noGap actuallyPaid"
				dangerouslySetInnerHTML={{__html: _k('label_actuallyPaid', _num(_d.actuallyPaid))}}></div>
			{/* 支付方式 */}
			{
				!_.isUndefined(_d.payMethods)
					? <ul className="mod_common_list payMethods">{
						_d.payMethods.map(pm=><li
							className={`noGap withIcon ${pm.style} ${(this.state.pay_method.id === pm.id) ? 'current' : ''}`}
							id={`pay_method_${pm.id}`}
							onClick={e=>this.togglePayMethod(pm.id)}>
							<span className="m_icon"></span>
							{pm.name}
						</li>)
					}</ul>
					: null
			}
			<div className="notice"
				dangerouslySetInnerHTML={{__html: _d.notice}}></div>
			<footer className="numbtns single">
				<a className="mod_button1" href="javascript:void(0)"
					data-client-route={this.state.data.payUrl}
					dangerouslySetInnerHTML={{__html:
						this.state.pay_method
							? this.state.pay_method.btn.label
							: _k('label_btn_zero', _num(_d.actuallyPaid))
					}}></a>
			</footer>
		</div>;
	},
	componentDidMount: function() {
		appUtils.parseClientRoute();
		appUtils.react.fixCopyrightJump();

		if (!_.isUndefined(this.state.data.payMethods)) {
			let dftPm = _.findWhere(this.state.data.payMethods, {isDefault: 1});
			this.togglePayMethod(dftPm.id);
		}
	}
});
