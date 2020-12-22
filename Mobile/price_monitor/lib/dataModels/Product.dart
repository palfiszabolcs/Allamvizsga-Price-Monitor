import 'package:firebase_database/firebase_database.dart';

import 'Check.dart';

class Product{
  List<Check> checks;
  String currency;
  String image;
  String name;
  String url;

  Product(this.checks, this.currency, this.image, this.name, this.url);

  Product.fromSnapshot(Map<dynamic, dynamic> snapshot){
      checks = List<Check>.from((snapshot['check'].values));
      currency = snapshot['currency'];
      image = snapshot['image'];
      name = snapshot['name'];
      url = snapshot['url'];
  }
}