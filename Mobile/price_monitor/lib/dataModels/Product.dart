import 'package:firebase_database/firebase_database.dart';

import 'Check.dart';

class Product{
  List<Check> checks = List();
  String currency;
  String image;
  String name;
  String url;

  Product(this.checks, this.currency, this.image, this.name, this.url);

  Product.fromSnapshot(Map<dynamic, dynamic> snapshot){
      List<dynamic>tempChecks = snapshot["check"].values.toList();
      tempChecks.forEach((element) {
        checks.add(Check.foromSnapshot(element));
      });
      checks.sort((a,b) => a.date.compareTo(b.date));

      currency = snapshot['currency'];
      image = snapshot['image'];
      name = snapshot['name'];
      url = snapshot['url'];
  }
}