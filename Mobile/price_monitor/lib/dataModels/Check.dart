import 'package:firebase_database/firebase_database.dart';

class Check{
  DateTime date;
  dynamic price;

  Check(this.date, this.price);

  Check.foromSnapshot(Map<dynamic, dynamic> snapshot){
    date = DateTime.parse(snapshot["date"]);
    if(snapshot["price"] == "error"){
        price = null;
    }else{
      price = snapshot["price"];
    }
  }

}