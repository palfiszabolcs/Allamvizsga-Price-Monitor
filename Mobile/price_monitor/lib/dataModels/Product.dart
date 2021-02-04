import 'Check.dart';

class Product{
  String dbKey;
  List<Check> checks = List();
  String currency;
  String image;
  String name;
  String url;

  Product(this.checks, this.currency, this.image, this.name, this.url);

  Product.fromSnapshot(dynamic key, Map<dynamic, dynamic> snapshot){
      List<dynamic>tempChecks = snapshot["check"].values.toList();
      tempChecks.forEach((element) {
        checks.add(Check.foromSnapshot(element));
      });
      checks.sort((a,b) => a.date.compareTo(b.date));

      dbKey = key;
      currency = snapshot['currency'];
      image = snapshot['image'];
      name = snapshot['name'];
      url = snapshot['url'];
  }
}