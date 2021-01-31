import 'dart:math';

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/painting.dart';
import 'package:price_monitor/dataModels/ChartData.dart';
import 'package:price_monitor/dataModels/Check.dart';
import 'package:price_monitor/dataModels/Product.dart';
import 'package:price_monitor/constants.dart';
import 'package:charts_flutter/flutter.dart';
// import 'package:fl_chart/fl_chart.dart';
import 'package:radio_grouped_buttons/radio_grouped_buttons.dart';

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

  @override
  void initState() {
    super.initState();
    _generateChartData();
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
        theme: ThemeData(primaryColor: colorPrimaryBlue),
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
          ),
          body: Padding(
            padding: const EdgeInsets.all(7.0),
            child: Column(
              children: [
                Container(
                  height: MediaQuery.of(context).size.height * 0.35,
                  child: TimeSeriesChart(
                        seriesList,
                        animate: true,
                        dateTimeFactory: const LocalDateTimeFactory(),
                        primaryMeasureAxis: NumericAxisSpec(
                            tickProviderSpec: BasicNumericTickProviderSpec(zeroBound: false, desiredTickCount: 10),
                        ),
                        domainAxis: DateTimeAxisSpec(
                          viewport: DateTimeExtents(start: chartStartDate, end: DateTime.now()),
                          tickFormatterSpec: AutoDateTimeTickFormatterSpec(
                            day: TimeFormatterSpec(
                              format: 'dd MMM',
                              transitionFormat: 'dd MMM',
                            ),
                          ),
                        ),
                      )
                    ),
                Container(
                  width: MediaQuery.of(context).size.width,
                  height: 50,
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
                      buttonColor: colorBackGroundGrey,
                      selectedColor: colorPrimaryBlue,
                      buttonWidth: MediaQuery.of(context).size.width * 0.25,
                      buttonHeight: 25,
                      fontSize: 12,
                    ),
                  ),
                ),
              ],
            ),
          )
        ),



    );
  }
}