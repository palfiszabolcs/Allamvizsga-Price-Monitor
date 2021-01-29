import 'dart:math';

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:price_monitor/dataModels/ChartData.dart';
import 'package:price_monitor/dataModels/Check.dart';
import 'package:price_monitor/dataModels/Product.dart';
import 'package:price_monitor/constants.dart';
import 'package:charts_flutter/flutter.dart';
// import 'package:fl_chart/fl_chart.dart';

class DetailScreen extends StatefulWidget{
  Product product;
  DetailScreen(Product prod){this.product = prod;}

  @override
  _DetailScreenState createState() => _DetailScreenState();
}

class _DetailScreenState extends State<DetailScreen>{
  List<ChartData> chartData = List();
  List<Series<ChartData, DateTime>> seriesList = List();

  _generateChartData(){
      widget.product.checks.forEach((element) {
          if(element.price is !double){
            chartData.add(ChartData(element.date, null));
          }else{
              chartData.add(ChartData(element.date, element.price));
          }
          // print(element.date);
          // chartData.add(ChartData(element.date, element.price));
      });
      
      seriesList.add(Series(
          data: chartData,
          domainFn: (ChartData chartData, _) => chartData.date,
          measureFn: (ChartData chartData, _) => chartData.price,
          id: 'data',
          fillPatternFn: (_, __) => FillPatternType.solid,
          fillColorFn: (ChartData chartData, _) =>
              ColorUtil.fromDartColor(color_primary_blue),
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
        theme: ThemeData(primaryColor: color_primary_blue),
        home: Scaffold(
          appBar: AppBar(
            leading: IconButton(
              icon: Icon(Icons.arrow_back, color: Colors.white),
              onPressed: () => Navigator.of(context).pop(),
            ),
            title: Text(widget.product.name),
          ),
          body: Container(
            height: MediaQuery.of(context).size.height * 0.35,
            child: Padding(
                padding: EdgeInsets.all(8.0),
                child: TimeSeriesChart(
                  seriesList,
                  animate: true,
                  dateTimeFactory: const LocalDateTimeFactory(),
                  primaryMeasureAxis: NumericAxisSpec(
                      tickProviderSpec: BasicNumericTickProviderSpec(zeroBound: false),
                  ),
                  domainAxis: DateTimeAxisSpec(
                    tickFormatterSpec: AutoDateTimeTickFormatterSpec(
                      day: TimeFormatterSpec(
                        format: 'dd',
                        transitionFormat: 'dd MMM',
                      ),
                    ),
                  ),
                  behaviors: [
                    RangeAnnotation([
                      RangeAnnotationSegment(DateTime(2021, 01, 20),
                          DateTime(2021, 01, 20), RangeAnnotationAxisType.domain),
                    ]),
                  ],
                )
              ),
          )
        ),



    );
  }
}