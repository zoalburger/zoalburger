     odoo.define('pos_kitchen_screen.kitchen_screen', function (require) {
    "use strict";

    var core = require('web.core');
    var ajax = require('web.ajax');
    var Session = require('web.Session');
    var QWeb = core.qweb;
    var _t = core._t;
    var orders_on_grid = 3;
    var src = window.location.pathname;
    var config_id = src.split('kitchen/') && src.split('kitchen/')[1][0];
    var showordeta=false

    $(document).ready(function () {



        function renderGridScreen() {
            ajax.jsonRpc("/pos/kitchen/" + config_id + "/data", 'call', {})
                .then(function (vals) {
                  console.log('valss',vals.order_data,vals.order_data.length)
                  var validate=false

                 for(var i=0;i<vals.order_data.length;i++)
                  {
                    //  console.log(vals.order_data[i])
                    var validate=false
                    for (var j=0;j<vals.order_data[i].lines.length;j++)
                    {

                      if (vals.order_data[i].lines[j].state =='in_process')
                      {
                        validate=true
                      }
                    }

                    var dropdownItem = $('.new-order .dropdown-item[id=' + vals.order_data[i].id + ']');
                    if(dropdownItem.length){
                    dropdownItem.remove();

                    var dropdown_new = $('.new-order .dropdown-item').length;
                    if (!dropdown_new)
                        $('.new-order .dropdown-menu').append(`
                        <div class="blank-new-order" style="height:auto;padding:5px;font-family: Montserrat;font-style: normal;font-weight: normal;font-size: 14px;line-height: 17px;color: #7F4167;">
                            No new orders found...
                        </div>`)
                    $('#newOrders').modal('hide');
                  }
                  if (!validate)
                  {
                  vals.order_data.splice(i,1)
                  }
                  }



                  //console.log('valss',vals && vals.order_data)
                  //  if (vals && vals.order_data)

                    //console.log('valss',vals.order_data)
                        ajax.loadXML('/pos_kitchen_screen/static/src/xml/pos_kitchen_templates.xml', QWeb).then(function () {
                            var data_html = QWeb.render('KitchenDataTemplate', {
                                order_data: vals.order_data,
                                pending_state: false,
                                screen_config : config_id
                            });
                            var order_html = QWeb.render('NewOrderTemplate', {
                                order_data: vals.order_data,
                                type_of_order: 'process'
                            })
                            $(".process-order .dropdown-menu").empty()
                            $(".process-order .dropdown-menu").append(order_html);
                            $('.blank-process-order').remove();

                            if (vals.order_data && vals.order_data[0] && vals.order_data[0].orders_on_grid)
                                orders_on_grid = vals.order_data[0].orders_on_grid;
                              $("#kitchen-order-data").empty()
                            $("#kitchen-order-data").append(data_html);
                            if (orders_on_grid == 4 || orders_on_grid == 6)
                                $('#kitchen-order-data').css('height', 'auto');
                            $('.order-content').each(function (index, el) {

                                var last_element = $(el);
                                if (orders_on_grid == 4 || orders_on_grid == 6) {

                                    last_element.addClass('main');
                                    last_element.find('.grid-template-auto').addClass('categ-body');
                                    last_element.find('.inner-element').addClass('categs');
                                    last_element.find('.order-footer').addClass('foot');
                                    last_element.find('.order-progress').addClass('temp-progress');
                                    last_element.find('.order-header').addClass('head');
                                }
                            })
                            time_calculator_grid();
                            for (var i = 0; i < orders_on_grid; i++) {
                                var element = $('.order-content').eq(i).parent();
                                element.css('display', 'flex');
                            }
                        });
                });
        }


        $(".data-body").on('click', '.wk-next,.wk-remove-next-list,.wk-remove-list', function (event) {
            var order = $(event.currentTarget).closest('.list-order');
            order.css('border','none');
            var order_id = order.attr('id');
            var progress = order.find('.list-progress').text().trim();
            var next_element = $('.process-order .dropdown-item[id=' + order_id + ']').next();
            var new_order_id = next_element.attr('id');
            var order_type = next_element.find('.order-type').text();
            var next_order_id = '';
            var next_order_type = '';
            if (new_order_id && order_type){

                next_order_id = new_order_id;
                next_order_type = order_type;
            }
            else {
                var previous_index = $('.process-order .dropdown-item[id=' + order_id + ']').index();
                if (previous_index && $('.process-order .dropdown-item').length >= 2){
                    next_order_id = $('.process-order .dropdown-item:first').attr('id');
                    next_order_type = $('.process-order .dropdown-item:first').find('.order-type').text();
                }
                else {
                    var html = `<div class="no-order"><img class="no-order-img" src="/pos_kitchen_screen/static/src/img/no-order.png"/>
                                    </div>`
                                    setTimeout(function () {
                                        $('.list-order').html(html);
                                        $('.no-order').css('margin-top',($('.list-order').height()-330)/2);
                                        $('.token-detail').text('');
                                    }, 500);
                                }
                            }
            if(progress == 'Cancel'){
                order.removeClass('list-cancel');
                order.removeClass('list-update');
                $('.process-order .dropdown-item[id='+order_id+']').remove();
            }
            console.log(next_order_type)
            if (next_order_id && next_order_type)
                clearInterval(showordeta);
                showOrderDetails(next_order_id,next_order_type);
                showordeta =  setInterval(showOrderDetails,15000,next_order_id,next_order_type);
        });

        setInterval(renderGridScreen,7000)

        $("#newOrders").on('click', '.wk-cancel-order', function (event) {
            $('.modal-confirm').css('display', 'none');
            $('.modal-cancel').show();
            $('input#ofs').prop('checked', true);

        });


        $("#newOrders").on('click', '.wk-confirm, .wk-cancel', function (event) {
            var $element = $(event.currentTarget);
            var order_id = $('.modal-order').attr('id');
            var type_order = $('.modal-order').attr('order-type');
            var dropdownItem = $('.new-order .dropdown-item[id=' + order_id + ']');
            dropdownItem.remove();
            var dropdown_new = $('.new-order .dropdown-item').length;
            if (!dropdown_new)
                $('.new-order .dropdown-menu').append(`
                <div class="blank-new-order" style="height:auto;padding:5px;font-family: Montserrat;font-style: normal;font-weight: normal;font-size: 14px;line-height: 17px;color: #7F4167;">
                    No new orders found...
                </div>`)
            $('#newOrders').modal('hide');

            if ($element.hasClass('wk-confirm')) {
                ajax.jsonRpc("/pos/" + config_id + "/process/orders/", 'call', {
                        'order_id': parseInt(order_id),
                        'order_type':type_order
                    })
                    .then(function (vals) {
                        if (vals && vals.order_data)
                            ajax.loadXML('/pos_kitchen_screen/static/src/xml/pos_kitchen_templates.xml', QWeb).then(function () {
                                var order_html = QWeb.render('NewOrderTemplate', {
                                    order_data: vals.order_data,
                                    type_of_order: 'process',
                                })
                                var data_html = QWeb.render('KitchenDataTemplate', {
                                    order_data: vals.order_data,
                                    pending_state: true,
                                });
                                $(".process-order .dropdown-menu").append(order_html);
                                $('.blank-process-order').remove();
                                $('#kitchen-order-data').append(data_html);
                                var last_element = $('.order-content:last');
                                if (orders_on_grid == 4 || orders_on_grid == 6) {
                                    last_element.addClass('main');
                                    last_element.find('.grid-template-auto').addClass('categ-body');
                                    last_element.find('.inner-element').addClass('categs');
                                    last_element.find('.order-footer').addClass('foot');
                                    last_element.find('.order-header').addClass('head');
                                    last_element.find('.order-progress').addClass('temp-progress');
                                }
                                time_calculator_grid();
                                var rightOffset = parseInt($('#list-right').attr('offset'));
                                var element_added = $(".order-new:last");
                                if (element_added.index() <= (rightOffset * orders_on_grid) - 1)
                                    $(".order-new:last").css('display', 'flex')
                            });
                    });
            }
        });

        $('body').on('click', '#list-left', function () {
            var offset = $('#list-left').attr('offset');
            var rightOffset = $('#list-right').attr('offset');
            var newOffset = parseInt(offset) * orders_on_grid;
            if (newOffset >= 0) {
                for (var i = 0; i < orders_on_grid; i++) {
                    var element = $('.order-content').eq(newOffset + i).parent();
                    $('.order-content').eq(newOffset + orders_on_grid + i).parent().css('display', 'none')
                    element.css('display', 'flex');
                }
                $("#list-right").attr('offset', parseInt(rightOffset) - 1);
                $("#list-left").attr('offset', parseInt(offset) - 1);
            }
        });

        $('body').on('click', '#list-right', function () {
            var offset = $('#list-right').attr('offset');
            var leftOffset = $('#list-left').attr('offset');
            var newOffset = parseInt(offset) * orders_on_grid;
            var e_length = $('.order-content').length;
            if (e_length > newOffset) {
                for (var i = 0; i < orders_on_grid; i++) {
                    var element = $('.order-content').eq(newOffset + i).parent();
                    $('.order-content').eq(newOffset - i - 1).parent().css('display', 'none')
                    element.css('display', 'flex');
                }
                $("#list-right").attr('offset', parseInt(offset) + 1);
                $("#list-left").attr('offset', parseInt(leftOffset) + 1);
            }
        });


        $('.new-order .dropdown-menu').on('click', '.dropdown-item', function (event) {
            var order_id = $(event.currentTarget).attr('id');
            ajax.jsonRpc("/pos/" + config_id + "/order/show/", 'call', {
                    'order_id': parseInt(order_id),
                    'order_type': $(event.currentTarget).find('.order-type').text()
                })
                .then(function (vals) {
                    if (vals && vals.order_data && vals.order_data[0])
                        ajax.loadXML('/pos_kitchen_screen/static/src/xml/pos_kitchen_templates.xml', QWeb).then(function () {
                            var order_html = QWeb.render('ModalBodyData', {
                                order: vals.order_data[0],
                                config:config_id
                            });
                            $(".modal-replace").html(order_html);
                            $(".modal-title").html(vals.order_data[0].kitchen_order_name);;
                            $("#newOrders").modal('show');
                        });
                });
        });
        $('body').on('click', '.grid-view', function (event) {
          clearInterval(showordeta);
            ajax.jsonRpc("/pos/kitchen/" + config_id + "/data", 'call', {})
                .then(function (vals) {
                    if (vals && vals.order_data && vals.order_data)
                    console.log(vals.order_data,'valls')
                        ajax.loadXML('/pos_kitchen_screen/static/src/xml/pos_kitchen_templates.xml', QWeb).then(function () {
                            var grid_html = QWeb.render('GridViewTemplate', {
                                order: vals.order_data
                            });
                            var data_html = QWeb.render('KitchenDataTemplate', {
                                order_data: vals.order_data
                            });
                            var element = $(grid_html);
                            element.find('#kitchen-order-data').append(data_html);
                            $('.data-body').html(element);
                            if (orders_on_grid == 4 || orders_on_grid == 6)
                                $('#kitchen-order-data').css('height', 'auto');
                            $('.order-content').each(function (index, el) {

                                var last_element = $(el);
                                if (orders_on_grid == 4 || orders_on_grid == 6) {

                                    last_element.addClass('main');
                                    last_element.find('.grid-template-auto').addClass('categ-body');
                                    last_element.find('.inner-element').addClass('categs');
                                    last_element.find('.order-footer').addClass('foot');
                                    last_element.find('.order-progress').addClass('temp-progress');
                                    last_element.find('.order-header').addClass('head');
                                }
                            })
                            $("#list-right").attr('offset', 1);
                            $("#list-left").attr('offset', -1);
                            $('.direction_keys').css('display', 'inline-block');
                            var html = ` <div class="row" style="font-family: Montserrat;
                            font-style: normal;
                            font-weight: normal;
                            font-size: 20px;
                            margin-top:4px;
                            line-height: 24px;color: #FFFFFF;">
                            Order Listing
                            </div>
                            <div class="row" style="ont-family: Montserrat;
                            font-style: normal;
                            font-weight: normal;
                            font-size: 14px;
                            line-height: 17px;
                            margin-top:7px;
                            color: #FFFFFF;">
                            Kitchen Orders Listing
                            </div>`
                            $('.token-detail').html(html);
                            time_calculator_grid();
                            for (var i = 0; i < orders_on_grid; i++) {
                                var element = $('.order-new').eq(i);
                                element.css('display', 'flex');
                            }
                        });
                });

        });

        $('.filter-view').on('click', function (event) {
            var product_elements = $('.process-order .product_id');
            var product_data = {};
            var product_name_by_id = {};
            product_elements.each(function (index, el) {
                var element = $(el);
                var product_name = element.find('.product_name').text().trim();
                var quantity = element.find('.product_qty').text().trim();
                var token_no = element.closest('.dropdown-item').find('.token_no').text().trim();
                var order_id = element.closest('.dropdown-item').attr('id');
                var order_type = element.closest('.dropdown-item').find('.order-type').text();
                var product_id = element.attr('product_id');
                if (product_id in product_data) {
                    product_data[product_id]['lines'].push({
                        'token_no': token_no,
                        'quantity': quantity,
                        'order_id':order_id,
                        'order_type':order_type
                    })
                    product_data[product_id]['total'] += parseInt(quantity)
                } else {
                    product_data[product_id] = {
                        'total': parseInt(quantity),
                        'lines': [{
                            'token_no': token_no,
                            'quantity': quantity,
                            'order_id':order_id,
                            'order_type':order_type
                    }]
                    };
                }
                if (!(product_id in product_name_by_id))
                    product_name_by_id[product_id] = product_name;
            });
            if (product_data && product_name_by_id)
                ajax.loadXML('/pos_kitchen_screen/static/src/xml/pos_kitchen_templates.xml', QWeb).then(function () {
                    var filter_html = QWeb.render('FilterViewTemplate', {
                        product_data: product_data,
                        product_name_by_id: product_name_by_id
                    });
                    $('.data-body').html(filter_html);
                    $('.direction_keys').css('display', 'none');
                    var html = `
                    <div class="row" style="margin-top:7px;font-family: Montserrat;font-style: normal;font-weight: normal;font-size: 20px;line-height: 24px;color: #FFFFFF;">
                    Order Filter
                    </div>`
                    $('.token-detail').html(html);
                })
        });

        $('.data-body').on('click','.filter-order',function(event){
            var element = $(event.currentTarget).closest('.filter-order-queue');
            var order_id = element.attr('order-id');
            var order_type = element.attr('order-type');
            showOrderDetails(order_id,order_type)


        });

        $('.data-body').on('click', '.card-header', function (event) {
            var product_id = $(event.currentTarget).attr('id');
            $(this).next(".data-content").slideToggle("slow");
            $('.data-content').each(function (index, el) {
                if (product_id != $(el).attr('content'))
                    $(el).css('display', 'none');
            });
        });


        $('.process-order .dropdown-menu').on('click', ' .dropdown-item', function (event) {
            var order_id = $(event.currentTarget).attr('id');
            var order_type = $(event.currentTarget).find('.order-type').text()
            showOrderDetails(order_id,order_type);
        });

        $('.bell-notification').on('click', function (event) {
            $('.bell').css('display', 'block');
            $('.bell-notification').css('display', 'none');
        });

        $('.data-body').on('click', '#kitchen-order-data .wk-details', function (event) {
            var order = $(event.currentTarget).closest('.order-content');
            var order_id = order.attr('id');
            var order_type = order.attr('order-type');
            showOrderDetails(order_id,order_type)
           showordeta =   setInterval(showOrderDetails,15000,order_id,order_type);
        })

        $('.data-body').on('click', '#kitchen-order-data .wk-remove-grid', function (event) {
            var order = $(event.currentTarget).closest('.order-new');
            order.remove();
        })

        $(".data-body").on('click', '.wk-done-list', function (event) {
            var order = $(event.currentTarget).closest('.list-order');
            var order_id = order.attr('id');
            $('.wk-next').click();
            $('.process-order .dropdown-item[id=' + order_id + ']').remove();
            var dropdown_new = $('.process-order .dropdown-item').length;
            if (!dropdown_new)
                $('.process-order .dropdown-menu').append(`
                <div class="blank-process-order" style="height:auto;padding:5px;font-family: Montserrat;font-style: normal;font-weight: normal;font-size: 14px;line-height: 17px;color: #7F4167;">
                    No orders found...
                </div>`)
        });


        $(".data-body").on('click', '.wk-cook', function (event) {
            $('.action_cook').parent().css('display', 'none');
            $('.action_done').parent().css('display', 'block');
            $('.list-process-state').show();
            $('.list-queue-state').css('display', 'none');
            var order = $(event.currentTarget).closest('.list-order');
            var order_id = order.attr('id');
            $('.process-order .dropdown-item[id=' + order_id + ']').find('.process-order-process').css('display', 'block');
            $('.process-order .dropdown-item[id=' + order_id + ']').find('.process-order-queue').css('display', 'none');
        });



        $(".data-body").on('click', '.wk-done-orderline', function (event) {
            $('.list-process-state').show();
            $('.list-queue-state').css('display', 'none');
            var order = $(event.currentTarget).closest('.list-order');
            var order_id = order.attr('id');
            var line_id = $(event.currentTarget).attr('line_id');
            $('.process-order .dropdown-item[id=' + order_id + ']').find('.process-order-process').css('display', 'block');
            $('.process-order .dropdown-item[id=' + order_id + ']').find('.process-order-queue').css('display', 'none');
            setTimeout(function(){
                $(event.currentTarget).closest('.action_done_orderline').replaceWith('<i class="fa fa-check" style="color:green;font-size:24px;"/>');
                var elements = $('.list-order-line');
                var count = 0;
                elements.each(function (index, el) {
                    var tick = $(el).find('.fa-check');
                    if(tick.length)
                        count++;
                })
                if(count == elements.length){

                $('.list-done-state').show();
                $('.list-process-state').css('display', 'none');

                    $('.process-order .dropdown-item[id=' + order_id + ']').remove()

                }
            },3000);
        });

        function render_grid_order_on_done() {
            var rightOffset = parseInt($("#list-right").attr('offset'));
            var is_last_order = orders_on_grid - (rightOffset * orders_on_grid - $('.order-new').length - 1)
            var iter = 0;
            if (is_last_order == 1) {
                iter = ((rightOffset - 2) * orders_on_grid) - 1;
                var leftOffset = parseInt($("#list-left").attr('offset'));
                if (leftOffset >= 0) {
                    $("#list-right").attr('offset', rightOffset - 1);
                    $("#list-left").attr('offset', leftOffset - 1);
                }
            } else
                iter = ((rightOffset - 1) * orders_on_grid) - 1;
            for (var i = iter; i < (rightOffset - 1) * orders_on_grid; i++) {
                $('.order-new').eq(i).css('display', 'flex');
            }

        }

        function order_done(event) {
            var element = $(event.currentTarget).closest('.order-new');
            var index = element.index();
            var rightOffset = parseInt($("#list-right").attr('offset'));
            var order = $(event.currentTarget).closest('.order-content');
            var order_id = order.attr('id');
            $('.process-order .dropdown-item[id=' + order_id + ']').remove();
            element.remove();
            var dropdown_new = $('.process-order .dropdown-item').length;
            if (!dropdown_new)
                $('.process-order .dropdown-menu').append(`
                <div class="blank-process-order" style="height:auto;padding:5px;font-family: Montserrat;font-style: normal;font-weight: normal;font-size: 14px;line-height: 17px;color: #7F4167;">
                    No orders found...
                </div>`)
            var next_element = $('.order-new').eq(rightOffset * orders_on_grid - 1)
            next_element.css('display', 'flex');
            if (!next_element.length) {
                setTimeout(render_grid_order_on_done, 200);
            }
        }

        $(".data-body").on('click', '.wk-done-grid,.wk-remove-grid', function (event) {
            setTimeout(order_done, 500, event);
        });

        $(".data-body").on('click', '.wk-done-grid', function (event) {
            console.log('actiodone')
            event.preventDefault();
            var element = $(event.currentTarget).closest('.action_done');
	    var atr = element.attr('action')
            var $inputs = $('.action_done :input');

            // not sure if you wanted this, but I thought I'd add it.
            // get an associative array of just the values.
            var values = {};
            $inputs.each(function() {
                values[this.name] = $(this).val();
            });
            console.log('actiodone',atr,values)
            ajax.jsonRpc(atr, 'call', {
                    'screen_config': values['screen_config'],
                    'order_type':values['order_type']
                })
                .then(function (vals) {
                  console.log('done',vals)

                });
        });

        $(".data-body").on('click', '.wk-done-orderline', function (event) {
            console.log('actiodone')
            event.preventDefault();
           var element = $(event.currentTarget).closest('.action_done_orderline');
	    var atr = element.attr('action')
            var $inputs = $('.action_done_orderline :input');

            // not sure if you wanted this, but I thought I'd add it.
            // get an associative array of just the values.
            var values = {};
            $inputs.each(function() {
                values[this.name] = $(this).val();
            });
            console.log('actiodone',atr,values)
            ajax.jsonRpc(atr, 'call', {
                    'screen_config': values['screen_config'],
                    'order_type':values['order_type']
                })
                .then(function (vals) {
                  console.log('doneorderrrrline',vals)

                });
        });

        $("#newOrders").on('click', '.wk-confirm', function (event) {
            console.log('actiodone')
            event.preventDefault();
            var atr = $('.action_confirm').attr('action')
            var $inputs = $('.action_confirm :input');

            // not sure if you wanted this, but I thought I'd add it.
            // get an associative array of just the values.
            var values = {};
            $inputs.each(function() {
                values[this.name] = $(this).val();
            });
            console.log('actiodone',atr,values)
            ajax.jsonRpc(atr, 'call', {
                    'config_id': values['config_id'],
                    'order_type':values['order_type']
                })
                .then(function (vals) {
                  console.log('confirm',vals)

                });
        });


        function showOrderDetails(order_id,order_type) {
            ajax.jsonRpc("/pos/" + config_id + "/order/list/", 'call', {
                    'order_id': parseInt(order_id),
                    'order_type':order_type
                })
                .then(function (vals) {
                    if (vals && vals.order_data && vals.order_data[0])
                        ajax.loadXML('/pos_kitchen_screen/static/src/xml/pos_kitchen_templates.xml', QWeb).then(function () {
                            var order = vals.order_data[0];
                            console.log('----ordeeeeeeeer---',order)
                            var order_html = QWeb.render('ListViewTemplate', {
                                order: order
                            });
                            $(".data-body").html(order_html);
                            if($('.list-progress').text().trim() == 'Cancel')
                                $('.list-order').addClass('list-cancel');
                            time_calculator_list();
                            var html = `
                            <div class="row" style="margin-top:7px;font-family: Montserrat;font-style: normal;font-weight: normal;font-size: 20px;line-height: 24px;color: #FFFFFF;">
                            Order Token No. ` + order.kitchen_order_name + `
                            </div>`
                            $('.token-detail').html(html);
                            $('.direction_keys').css('display', 'none');

                        });
                });
        }

        function time_calculator_grid() {
            if ($('.datetime').length)
                $('.datetime').each(function (index, el) {
                    let date = $(el).find('.order_time').text();
                    let currentDate = new Date().toLocaleTimeString();
                    var date_list = date.split(":");
                    var currentDate_list = currentDate.split(":");
                    var hours = parseInt(currentDate_list[0]) - parseInt(date_list[0]);
                    var minutes = parseInt(currentDate_list[1]) - parseInt(date_list[1]);
                    if (minutes < 0) {
                        hours -= 1;
                        minutes = 60 + minutes;
                    }
                    var seconds = parseInt(currentDate_list[2]) - parseInt(date_list[2]);
                    if (seconds < 0) {
                        minutes -= 1;
                        seconds = 60 + seconds;
                    }
                    var final_string = '';
                    if (hours > 0)
                        final_string = hours + ' Hour' + ' ' + minutes + ' Minutes';
                    else
                        final_string = minutes + ' Minutes';
                    $(el).closest('.order-content').find('.time-elapsed').text(final_string);


                    var ctx = $(el).find('.timeChart');
                    var chart = new Chart(ctx, {
                        type: 'pie',
                        data: {
                            datasets: [{
                                fill: true,
                                backgroundColor: [
                                    '#3C84E2', 'white'
                                ],
                                data: [(minutes / 60) * 100, ((60 - minutes) / 60) * 100, ],
                                borderColor: ['#3C84E2', '#3C84E2'],
                                borderWidth: [2, 2]
                            }]
                        },
                        options: {
                            tooltips: {
                                enabled: false
                            },
                            hover: {
                                mode: null
                            },
                            animation: false
                        }
                    });
                    $(el).find('.timeChart').css({
                        'width': '50px',
                        'height': 'auto'
                    })
                });
            if (('.list-datetime').length)
                time_calculator_list();
        }



        function time_calculator_list() {
            $('.list-datetime').each(function (index, el) {
                let date = $(el).find('.list-order-time').text();
                let currentDate = new Date().toLocaleTimeString();
                var date_list = date.split(":");
                var currentDate_list = currentDate.split(":");
                var hours = parseInt(currentDate_list[0]) - parseInt(date_list[0]);
                var minutes = parseInt(currentDate_list[1]) - parseInt(date_list[1]);
                if (minutes < 0) {
                    hours -= 1;
                    minutes = 60 + minutes;
                }
                var seconds = parseInt(currentDate_list[2]) - parseInt(date_list[2]);
                if (seconds < 0) {
                    minutes -= 1;
                    seconds = 60 + seconds;
                }
                var final_string = '';
                if (hours > 0)
                    final_string = hours + ' Hour' + ' ' + minutes + ' Minutes';
                else
                    final_string = minutes + ' Minutes';
                $(el).find('.list-elapsed-time').text(final_string);


                var ctx = $(el).find('.timeListChart');
                var chart = new Chart(ctx, {
                    type: 'pie',
                    data: {
                        datasets: [{
                            fill: true,
                            backgroundColor: [
                                '#3C84E2', 'white'
                            ],
                            data: [(minutes / 60) * 100, ((60 - minutes) / 60) * 100, ],
                            borderColor: ['#3C84E2', '#3C84E2'],
                            borderWidth: [2, 2]
                        }]
                    },
                    options: {
                        tooltips: {
                            enabled: false
                        },
                        hover: {
                            mode: null
                        },
                        animation: false
                    }
                });
                $(el).find('.timeListChart').css({
                    'width': '50px',
                    'height': 'auto'
                })
            });
        }




        function update_order_onchange(vals){
            _.each(vals.change_order_data,function(order){
                var order_element = $('.order-content[id='+order.id+']');
                var list_order = $('.list-order-progress');
                if(order.state == "cancel"){
                    order_element.css('border','6px solid red');
                    order_element.find('.order-progress').html(`
                    <span class="grid-deleted-background-queue">
                        <span>
                            <span class="grid-deleted-font-queue">
                                    Cancel
                                </span>
                        </span>
                    </span>`);
                    order_element.find('.grid-line-updated').remove();

                    order_element.find('.wk-details, .wk-done-grid').css('display','none');
                    order_element.find('.wk-remove-grid').css('display','block');


                    if(list_order.length){
                        list_order.html(`
                        <span class="list-cancel-state"  style="background: rgba(255,0,0,0.2);mix-blend-mode: normal;border-radius: 2px;height:fit-content;width:fit-content;padding:6px;">
                            <span>
                                <span class="list-progress" style="font-family: Montserrat;font-style: normal;font-weight: bold;font-size: 14px;line-height: 17px;color: red;">Cancel</span>
                            </span>
                        </span>`);

                        var list_order_element =list_order.closest('.list-order');
                        list_order_element.find('.wk-done-list').css('display','none');
                        list_order_element.find('.wk-cook').css('display','none');
                        list_order_element.find('.wk-next').hide();
                        list_order_element.find('.wk-remove-next-list').show();
                        list_order_element.css('border','6px solid red');
                    // .css()
                    }

                    $('.process-order .dropdown-item[id=' + order.id + ']').find('.process-order-process').css('display', 'none');
                    $('.process-order .dropdown-item[id=' + order.id + ']').find('.process-order-queue').css('display', 'none');
                    $('.process-order .dropdown-item[id=' + order.id + ']').find('.process-order-cancel').css('display', 'block');


                }
                else{
                    if(order_element.length)
                        ajax.loadXML('/pos_kitchen_screen/static/src/xml/pos_kitchen_templates.xml', QWeb).then(function () {
                            var orders = vals.change_order_data;
                            //
                            var order_html = QWeb.render('UpdateLinesTemplate', {
                                order: order
                            });
                            order_element.find('.grid-template-auto').html(order_html);
                            order_element.css('border','6px solid rgba(26, 202, 26, 0.7)');
                            if (!order_element.find('.grid-line-updated').length)
                                order_element.find('.grid-token').append('<div class="grid-line-updated" style="margin-left:8px;display:block;float:right;font-weight:bold;color:rgba(26, 202, 26, 1)">UPDATED</div>');
                        });
                    if($('.list-order').length){
                        ajax.loadXML('/pos_kitchen_screen/static/src/xml/pos_kitchen_templates.xml', QWeb).then(function () {
                            var orders = vals.change_order_data;
                            var order_html = QWeb.render('UpdateListData', {
                                order: order
                            });
                            $('.list-auto').html(order_html);
                            $('.list-order').addClass('list-update');
                            if(!$('.update_added').length)
                                $('.list-order-progress').append(`<span class="update_added"
                                style="font-family: Montserrat;margin-left:8px;color:green;font-style: normal;font-weight: bold;font-size: 14px;line-height: 17px;">UPDATED</span>`);
                        });
                    }
                }
            })


        }


        var myVar;

                            function newAddedOrders() {
                                var updateTime = $('#newOrders').attr('updateTime');
                                var $orderContent = $('.order-content');
                                var new_order_ids = Array.prototype.map.call($orderContent, function (item) {
                                    return parseInt(item.id);
                                })
                                var added_order_ids = Array.prototype.map.call($(".new-order .dropdown-item"), function (item) {
                                    return parseInt(item.id);
                                })
                                var order_ids = new_order_ids.concat(added_order_ids)
                                ajax.jsonRpc("/pos/" + config_id + "/new/orders/", 'call', {
                                        'updateTime': updateTime,
                                        'existing_orders': order_ids,
                                    })
                                    .then(function (vals) {

                                        if (vals && vals.order_data && vals.order_data.length){

                                            ajax.loadXML('/pos_kitchen_screen/static/src/xml/pos_kitchen_templates.xml', QWeb).then(function (res) {
                                                var order_html = QWeb.render('NewOrderTemplate', {
                                                    order_data: vals.order_data,
                                                    type_of_order: 'new'
                                                });
                                                $(".new-order .dropdown-menu").append(order_html);
                                                //$('.blank-new-order').click()
                                                $('.blank-new-order').remove();
                                                //confirm('hello world')

                                                $('.bell').css('display', 'none');
                                                $('.notification').css('display', 'block');




                                            });
                                        }
                                        if (vals && vals.change_order_data && vals.change_order_data.length){
                                            update_order_onchange(vals);
                                        }

                                    });
                                time_calculator_grid();

                            }
        myVar = setInterval(newAddedOrders, 7000);


        function requestFullScreen(element) {
            var requestMethod = element.requestFullScreen || element.webkitRequestFullScreen ||
                element.mozRequestFullScreen || element.msRequestFullScreen;
            var isInFullScreen = (document.fullscreenElement && document.fullscreenElement !== null) ||
                (document.webkitFullscreenElement && document.webkitFullscreenElement !== null) ||
                (document.mozFullScreenElement && document.mozFullScreenElement !== null) ||
                (document.msFullscreenElement && document.msFullscreenElement !== null);

            var docElm = document.documentElement;
            if (!isInFullScreen) {
                if (docElm.requestFullscreen) {
                    docElm.requestFullscreen();
                } else if (docElm.mozRequestFullScreen) {
                    docElm.mozRequestFullScreen();
                } else if (docElm.webkitRequestFullScreen) {
                    docElm.webkitRequestFullScreen();
                } else if (docElm.msRequestFullscreen) {
                    docElm.msRequestFullscreen();
                }
                var enter = document.getElementById('qms_enter');
                enter.style.display = 'none';
                var leave = document.getElementById('qms_leave');
                leave.style.display = 'initial';
                var close = document.getElementById('qms_close');
                if (close && close.style)
                    close.style.display = 'none';
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                }
                var enter = document.getElementById('qms_enter');
                enter.style.display = 'initial';
                var leave = document.getElementById('qms_leave');
                leave.style.display = 'none';
                var close = document.getElementById('qms_close');
                if (close && close.style)
                    close.style.display = 'initial';
            }
        }
        $('.qms_fs').on('click', function () {
            var elem = document.body; // Make the body go full screen.
            requestFullScreen(elem);
        });

    })



});
