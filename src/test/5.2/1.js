{data.couponNum
	?
		<div className="couponstyle">
			<a href="javascript:void(0);"
				 onClick={this._onCoupon.bind(this,data.id)} >
				<p>优惠券</p>
				<b>{data.couponMoney 
	                  ? 
	                  <div>
	                    <i>{data.couponMoney}代金券</i>
	                    <i>已抵扣{data.totalPrice-data.couponMoney>0 ?data.couponMoney : data.totalPrice }元</i>
	                  </div>
	                  : data.couponNum + '张'+'可用优惠券'
	                }</b>
			</a>
		</div>		
	: null
}


<div>{data.couponMoney 
						                  ? 
						                  <p>
						                    <i>{data.couponMoney}代金券</i>
						                    <i>已抵扣{data.totalPrice-data.couponMoney>0 ?data.couponMoney : data.totalPrice }元</i>
						                  </p>
						                  : data.couponNum + '张'+'可用优惠券'
						               }</div>