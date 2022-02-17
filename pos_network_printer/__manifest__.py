# -*- coding: utf-8 -*-
{
    'name': "POS NETWORK PRINTER",
    'summary': """
        Print from Point of sale to ESC/POS Network Printer without POS Box. The module is used for POS Retail and Restaurant with 
        with local or online server
        """,
    'description': """
        Print from Point of sale to ESC/POS Network Printer without POS Box. The module is used for POS Retail and Restaurant with 
        with local or online server.
    """,
    'author': "Aimé Jules Andrinirina",
    'website': 'https://www.aimejules.com',
    'license': 'OPL-1',
    'category': 'Point Of Sale',
    'version': '2.3',
    'images': ['static/description/banner.jpg'],
    'depends': [
        'base',
        'point_of_sale',
        'pos_restaurant',
    ],
    'qweb': ['static/src/xml/pos.xml'],
    'data': [
        # security
        'security/security.xml',
        'security/ir.model.access.csv',
        # views
        'views/assets.xml',
        'views/pos_config_view.xml',
        'views/network_printer_view.xml',
        'views/restaurant_printer_view.xml',
        'views/printer_connector_view.xml',
        'views/queue_print_view.xml',
    ],
    'price': '350',
    'currency': 'EUR',

}
