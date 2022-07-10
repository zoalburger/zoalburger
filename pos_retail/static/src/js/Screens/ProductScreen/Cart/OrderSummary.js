odoo.define('pos_retail.OrderSummary', function (require) {
    'use strict';

    const OrderSummary = require('point_of_sale.OrderSummary');
    const Registries = require('point_of_sale.Registries');

    const RetailOrderSummary = (OrderSummary) =>
        class extends OrderSummary {
            constructor() {
                super(...arguments);
                this._currentOrder = this.env.pos.get_order()
                if (this._currentOrder) {
                    this.env.pos.on('change:selectedOrder', this._updateCurrentOrder, this);
                }
            }

            _updateCurrentOrder(pos, newSelectedOrder) {
                if (newSelectedOrder) {
                    this._currentOrder = newSelectedOrder;
                }
            }

            get itemsInCart() {
                if (this._currentOrder.orderlines.length > 0) {
                    return true
                } else {
                    return false
                }
            }
        }
    Registries.Component.extend(OrderSummary, RetailOrderSummary);

    return RetailOrderSummary;
});
