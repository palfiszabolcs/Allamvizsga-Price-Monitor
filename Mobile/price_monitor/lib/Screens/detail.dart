import 'package:adaptive_theme/adaptive_theme.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_database/firebase_database.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/painting.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:price_monitor/dataModels/ChartData.dart';
import 'package:price_monitor/dataModels/Product.dart';
import 'package:price_monitor/constants.dart';
import 'package:charts_flutter/flutter.dart';
import 'package:radio_grouped_buttons/radio_grouped_buttons.dart';
import 'package:sweetalert/sweetalert.dart';
import 'package:url_launcher/url_launcher.dart';

final FirebaseAuth _auth = FirebaseAuth.instance;
final _db = FirebaseDatabase.instance.reference().child("USERS");


class DetailScreen extends StatefulWidget{
  Product product;
  DetailScreen(Product prod){this.product = prod;}

  @override
  _DetailScreenState createState() => _DetailScreenState();
}

class _DetailScreenState extends State<DetailScreen>{
  List<ChartData> chartData = List();
  List<Series<ChartData, DateTime>> seriesList = List();
  var chartStartDate = DateTime.now().subtract(Duration(days:7));


  _generateChartData(){
      widget.product.checks.forEach((element) {
          if(element.price is !double){
            chartData.add(ChartData(element.date, null));
          }else{
              chartData.add(ChartData(element.date, element.price));
          }
      });
      
      seriesList.add(Series(
          data: chartData,
          domainFn: (ChartData chartData, _) => chartData.date,
          measureFn: (ChartData chartData, _) => chartData.price,
          id: 'chartData',
          fillPatternFn: (ChartData chartData, __) => FillPatternType.solid,
          fillColorFn: (_, __) => ColorUtil.fromDartColor(colorPrimaryBlue),
          colorFn: (_, __) => MaterialPalette.blue.makeShades(2)[0],
          ),
      );
  }

  _goToProductPage(String url) async{
    if (await canLaunch(url)){
      await launch(url);
    }
    else{
      return Fluttertoast.showToast(
          msg: "Error opening link",
          toastLength: Toast.LENGTH_SHORT,
          gravity: ToastGravity.SNACKBAR,
          timeInSecForIosWeb: 1,
          backgroundColor: Colors.grey,
          textColor: Colors.black,
          fontSize: 16.0
      );
    }
  }

  _deleteProduct(){
    try{
      _db.child(_auth.currentUser.uid).child(widget.product.dbKey).remove();
    }catch (error){
      print("error deleting product");
      return Fluttertoast.showToast(
          msg: error.toString(),
          toastLength: Toast.LENGTH_SHORT,
          gravity: ToastGravity.SNACKBAR,
          timeInSecForIosWeb: 1,
          backgroundColor: Colors.grey,
          textColor: Colors.black,
          fontSize: 16.0
      );
    }
  }

  @override
  void initState() {
    super.initState();
    _generateChartData();
  }

  @override
  Widget build(BuildContext context) {
    var brightness = MediaQuery.of(context).platformBrightness;
    bool darkModeOn = brightness == Brightness.dark;

    return AdaptiveTheme(
        light: lightThemeData,
        dark: darkThemeData,
        initial: AdaptiveThemeMode.system,
        builder: (theme, darkTheme) => MaterialApp(
          theme: theme,
          darkTheme: darkTheme,
          home: Scaffold(
            appBar: AppBar(
              leading: IconButton(
                icon: Icon(Icons.arrow_back, color: Colors.white),
                onPressed: () => Navigator.of(context).pop(),
              ),
              title: Text(widget.product.name),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.vertical(
                  // bottom: Radius.circular(10),
                  bottom: Radius.elliptical(MediaQuery.of(context).size.width, 25),
                ),
              ),
              actions:<Widget> [
                IconButton(
                  icon: Icon(Icons.delete_rounded),
                  onPressed: () => {
                    SweetAlert.show(context,
                    title: "Delete product",
                    subtitle: "Are you sure?",
                    style: SweetAlertStyle.confirm,
                    confirmButtonText: "Delete",
                    showCancelButton: true,
                    onPress: (bool isConfirm) {
                        if (isConfirm) {
                          _deleteProduct();
                          Navigator.of(context).pop();
                          return true;
                        }
                        return true;
                      }
                    )
                  },
                )
              ],
            ),

            body: Padding(
              padding: const EdgeInsets.all(0.0),
              child: SingleChildScrollView(
                child: Column(
                  children: [
                    Card(
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.all(
                            Radius.circular(15)
                        ),
                      ),
                      child: Padding(
                        padding: const EdgeInsets.all(6.0),
                        child: Column(
                          children: [
                            Container(
                              height: MediaQuery.of(context).size.height * 0.5,
                              child: TimeSeriesChart(
                                    seriesList,
                                    animate: true,
                                    dateTimeFactory: const LocalDateTimeFactory(),
                                    primaryMeasureAxis: NumericAxisSpec(
                                      renderSpec: GridlineRendererSpec(
                                        labelStyle: TextStyleSpec(
                                            fontSize: 15,
                                            color: darkModeOn ? Color.white : Color.black
                                        )
                                      ),
                                      tickProviderSpec: BasicNumericTickProviderSpec(zeroBound: false, desiredTickCount: 10),
                                    ),
                                    domainAxis: DateTimeAxisSpec(
                                      viewport: DateTimeExtents(start: chartStartDate, end: DateTime.now()),
                                      renderSpec: GridlineRendererSpec(
                                        labelStyle: TextStyleSpec(
                                        fontSize: 13,
                                        color: darkModeOn ? Color.white : Color.black
                                        )
                                      ),
                                      tickFormatterSpec: AutoDateTimeTickFormatterSpec(
                                        day: TimeFormatterSpec(
                                          format: 'dd MMM',
                                          transitionFormat: 'dd MMM',
                                        ),
                                      ),
                                    ),
                                  )
                                ),
                            Padding(
                              padding: const EdgeInsets.only(top: 8.0),
                              child: Center(
                                child: CustomRadioButton(
                                  buttonLables: filterButtonListLabels,
                                  buttonValues: filterButtonListValues,
                                  initialSelection: 2,
                                  radioButtonValue: (value,index){
                                    if(index == 0){
                                      chartStartDate = widget.product.checks.first.date;
                                    }
                                    else{
                                      if((DateTime.now().subtract(Duration(days:value)).isBefore(widget.product.checks.first.date))){
                                        chartStartDate = widget.product.checks.first.date;
                                      }else{
                                        chartStartDate = DateTime.now().subtract(Duration(days:value));
                                      }
                                    }
                                    setState(() {});
                                  },
                                  horizontal: true,
                                  enableShape: true,
                                  buttonSpace: 0,
                                  elevation: 0,
                                  buttonColor: darkModeOn ? Colors.black26 :  colorBackgroundGrey,
                                  selectedColor: darkModeOn ? colorPrimaryDarkBlue : colorPrimaryBlue,
                                  textColor: darkModeOn ? Colors.white : Colors.black,
                                  buttonWidth: MediaQuery.of(context).size.width * 0.25,
                                  buttonHeight: 25,
                                  fontSize: 12,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),

                    // Card(
                    //   shape: RoundedRectangleBorder(
                    //     borderRadius: BorderRadius.all(
                    //         Radius.circular(15)
                    //     ),
                    //   ),
                    //   child: Container(
                    //     child: Row(
                    //       mainAxisAlignment: MainAxisAlignment.center,
                    //       crossAxisAlignment: CrossAxisAlignment.center,
                    //       children: [
                    //         Expanded(
                    //           flex: 10,
                    //           child: Padding(
                    //             padding: const EdgeInsets.all(8.0),
                    //             child: RaisedButton(
                    //               shape: RoundedRectangleBorder(
                    //                 borderRadius: BorderRadius.all(
                    //                     Radius.circular(15)
                    //                 ),
                    //               ),
                    //               color: Colors.cyan,
                    //               textColor: Colors.white,
                    //               child: Row(
                    //                 mainAxisAlignment: MainAxisAlignment.center,
                    //                 crossAxisAlignment: CrossAxisAlignment.center,
                    //                 children: [
                    //                   primaryIcon,
                    //                   Text("See product page")
                    //                 ],
                    //               ),
                    //               onPressed: () => _goToProductPage(widget.product.url),
                    //             ),
                    //           ),
                    //         ),
                    //       ],
                    //     ),
                    //   ),
                    // )
                  ],
                ),
              ),
            ),
            floatingActionButton: FloatingActionButton(
              onPressed: () => _goToProductPage(widget.product.url),
              child: Icon(Icons.shopping_cart),
              backgroundColor: colorSignOutButton,
              // foregroundColor: ,
            ),
          ),
      ),
    );
  }
}