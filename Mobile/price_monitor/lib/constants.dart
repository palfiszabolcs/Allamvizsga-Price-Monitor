import 'dart:ui';
import 'package:flutter/material.dart';

const color_primary_blue =  Color(0xff007bff);
const color_reset_pw_button = Color(0xffd39e00);
const color_delete_account_button = Color(0xff545b62);
const color_signout_button = Color(0xffbd2130);
const primary_icon = Icon(Icons.shopping_cart_outlined);
const title = Expanded(child:Text(" Price-Monitor (v_0.5)", style: TextStyle(fontSize: 16,), overflow: TextOverflow.fade));
const url_emag = "https://www.emag.ro/";
const url_flanco = "https://www.flanco.ro/";
// const _url_altex = "https://www.altex.ro/";
const url_quickmobile = "https://www.quickmobile.ro/";
const description_text = Text('''You can use this app to follow your desired product's price changes over time.

Once you are on one of the supported webshops, just press the Share icon and tap on the "Price-Monitor" app, after that, your product will be added shortly to your list.

The arrow and color coding on each product’s price makes it easier to quickly see changes, compared to previous data. 

Taping on a list item will show you a chart of price changes.'''
  ,textAlign: TextAlign.center,);
const notConfirmedText = Text("You need to confirm your email address before you use the app!", textAlign: TextAlign.center );
const confirmedText = Text("Confirmed!", textAlign: TextAlign.center );

const priceArrowForward = Icon(Icons.arrow_forward_rounded);
const arrowUpColor = Color(0xffdc3545);
const arrowDownColor = Color(0xff28a745);
const priceArrowUp = Icon(Icons.arrow_upward_rounded, color: arrowUpColor);
const priceArrowDown = Icon(Icons.arrow_downward_rounded, color: arrowDownColor);