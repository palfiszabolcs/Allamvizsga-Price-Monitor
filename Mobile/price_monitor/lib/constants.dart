import 'dart:ui';
import 'package:flutter/material.dart';

final appBarIcon = Image.asset('assets/ico/icon-128-white.png',width: 24,height: 24);
const title = Text(" Price-Monitor (v_0.9)", style: TextStyle(fontSize: 20,), overflow: TextOverflow.fade);
const url_emag = "https://www.emag.ro/";
const url_flanco = "https://www.flanco.ro/";
// const _url_altex = "https://www.altex.ro/";
const url_quickmobile = "https://www.quickmobile.ro/";
const descriptionText = '''You can use this app to follow your desired product's price changes over time.

Once you are on one of the supported shops website, just press the Share icon and tap on the "Price-Monitor" app, after that, your product will be added shortly to your list.

The arrow and color coding on each product’s price make it easier to quickly see changes, compared to previous data. 

Tapping on a list item will show you a chart of price changes.''';
const notConfirmedText = Text("You need to confirm your email address before you use the app!", textAlign: TextAlign.center );
const confirmedText = Text("Confirmed!", textAlign: TextAlign.center );
// Colors
const colorPrimaryBlue =  Color(0xff007bff);
const colorPrimaryDarkBlue =  Color(0xff0056b3);
final colorBackgroundGrey = Colors.grey.shade200;
const colorResetPwButton = Color(0xffd39e00);
const colorDeleteAccountButton = Color(0xff545b62);
const colorSignOutButton = Color(0xffbd2130);

const priceArrowForward = Icon(Icons.arrow_forward_rounded);
const arrowUpColor = Color(0xffdc3545);
const arrowDownColor = Color(0xff28a745);
const priceArrowUp = Icon(Icons.arrow_upward_rounded, color: arrowUpColor);
const priceArrowDown = Icon(Icons.arrow_downward_rounded, color: arrowDownColor);

const filterButtonListLabels = ["All Time","Month","Week"];
const filterButtonListValues = [60,30,7];

const List supportedDomains = ["emag.ro", "flanco.ro", "quickmobile.ro"];

final lightThemeData = ThemeData(
  brightness: Brightness.light,
  primaryColor: colorPrimaryBlue,
);

final darkThemeData = ThemeData(
  brightness: Brightness.dark,
  primaryColor: colorPrimaryDarkBlue,
  accentColor: colorPrimaryDarkBlue,

);