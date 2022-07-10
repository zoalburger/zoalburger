odoo.define('pos_retail.OrderSummaryExtend', function (require) {
    'use strict';

    const PosComponent = require('point_of_sale.PosComponent');
    const Registries = require('point_of_sale.Registries');
    const {useState} = owl.hooks;

    class OrderSummaryExtend extends PosComponent {
        constructor() {
            super(...arguments);
            this.state = useState({
                showSummaryExtend: true,
            });
            this._currentOrder = this.env.pos.get_order();
            this._currentOrder.orderlines.on('change', this.render, this);
            this.env.pos.on('change:selectedOrder', this._updateCurrentOrder, this);
        }

        _updateCurrentOrder(pos, newSelectedOrder) {
            this._currentOrder.orderlines.off('change', null, this);
            if (newSelectedOrder) {
                this._currentOrder = newSelectedOrder;
                this._currentOrder.orderlines.on('change', this.render, this);
            }
        }

        get order() {
            return this.env.pos.get_order();
        }

        get client() {
            return this.env.pos.get_order().get_client();
        }

        get getPromotionsActive() {
            const promotionsActive = this._currentOrder.get_promotions_active()
            return promotionsActive['promotions_active']
        }

        clickShowSummaryExtend() {
            this.state.showSummaryExtend = !this.state.showSummaryExtend
            this.render()
        }

        get isShowSummaryExtend() {
            return this.state.showSummaryExtend
        }

        async applyPromotions(promotion) {
            const order = this.env.pos.get_order();
            if (order.is_return) {
                this.env.pos.alert_message({
                    title: this.env._t('Warning'),
                    body: this.env._t('Order return not allow Apply Promotions')
                })
                return false;
            }
            order.remove_all_promotion_line();
            let promotions = order.get_promotions_active()['promotions_active'];
            if (promotion) {
                promotions = [promotion]
            }
            if (promotions) {
                let {confirmed, payload: result} = await this.showPopup('ConfirmPopup', {
                    title: this.env._t('Apply Promotions !!!'),
                    body: this.env._t('Promotions added before just removed. Are you want add back Promotions to this Order ?'),
                    cancelText: this.env._t('Close'),
                    confirmText: this.env._t('Apply'),
                    cancelIcon: 'fa fa-trash',
                    confirmIcon: 'fa fa-check',
                })
                if (confirmed) {
                    order.apply_promotion(promotions)
                    const linesAppliedPromotion = order.orderlines.models.find(l => l.promotion)
                    if (!linesAppliedPromotion) {
                        return true
                    }
                } else {
                    order.remove_all_promotion_line();
                }
            }
        }

    }

    OrderSummaryExtend.template = 'OrderSummaryExtend';

    Registries.Component.add(OrderSummaryExtend);

    return OrderSummaryExtend;
});
