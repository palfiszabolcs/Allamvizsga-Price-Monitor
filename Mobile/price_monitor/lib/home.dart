import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:url_launcher/url_launcher.dart';
import 'dart:async';
import 'package:firebase_database/firebase_database.dart';
import 'package:sweetalert/sweetalert.dart';
import 'dataModels/Check.dart';
import 'dataModels/Product.dart';
import 'login.dart';
import 'constants.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:fluttertoast/fluttertoast.dart';

Timer _timer;
final FirebaseAuth _auth = FirebaseAuth.instance;
final _db = FirebaseDatabase.instance.reference().child("USERS");
Map<dynamic, dynamic> products;
List<Product>prod = List();

class HomeScreen extends StatefulWidget{
  @override
  _HomeScreenState createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen>{

    bool verified = _auth.currentUser.emailVerified;
    void verificationCheck(){
      _timer = Timer.periodic(Duration(seconds: 2), (timer) async {
        _auth.currentUser.reload();
        setState(() {
            if(verified){
                _timer.cancel();
            }
            verified =  _auth.currentUser.emailVerified;
        });
      });
    }

    @override
  void initState() {
    super.initState();
    verificationCheck();
  }
  @override
  void dispose() {
    super.dispose();
  }

  void readData(){
    _db.once().then((DataSnapshot snapshot) {
      products = snapshot.value;
      // print(products);
    });
  }

  Widget productList(){
    return ListView.builder(
        itemCount: products.length,
        itemBuilder: (context, index) {
          String key = products.keys.elementAt(index);
          var imageURL = products[key]["image"];
          var prodURL = products[key]["url"];

          List<dynamic>tempChecks = products[key]["check"].values.toList();
          List<Check>checks = List();
          var name = Text(products[key]["name"].toString());

          tempChecks.forEach((element) {
            checks.add(Check.foromSnapshot(element));
          });
          checks.sort((a,b) => a.date.compareTo(b.date));

          var price;
          var tmpPrice = checks.last.price.toString();
          if(tmpPrice == "null"){
              price = Text("UNAVAILABLE!");
          }else{
              price = Text("${checks.last.price.toString()} ${products[key]["currency"]}");
          }

          return GestureDetector(
            onTap: () {
              Fluttertoast.showToast(
                  msg: prodURL,
                  toastLength: Toast.LENGTH_SHORT,
                  gravity: ToastGravity.SNACKBAR,
                  timeInSecForIosWeb: 1,
                  backgroundColor: Colors.white,
                  textColor: Colors.black,
                  fontSize: 16.0
              );
            },
            child: Card(
              child: Column(
                children: [
                  Row(
                    children: [
                      Container(
                        width: MediaQuery.of(context).size.width * 0.30,
                        child: CachedNetworkImage(
                          imageUrl: imageURL,
                          progressIndicatorBuilder: (context, url, downloadProgress) =>
                              Center(child: CircularProgressIndicator(value: downloadProgress.progress, valueColor: AlwaysStoppedAnimation(color_primary_blue),)),
                          errorWidget: (context, url, error) => Center(child: Icon(Icons.error, color: color_primary_blue,)),
                        ),
                      ),
                      Container(
                        width: MediaQuery.of(context).size.width * 0.67,
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.start,
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            name,
                            price
                          ],
                        ),
                      )
                    ],
                  )
                ],
              ),
            ),
          );
        });
  }


    @override
  Widget build(BuildContext context) {
      SystemChrome.setSystemUIOverlayStyle(SystemUiOverlayStyle(
          statusBarColor: color_primary_blue
      ));
      return MaterialApp(
          theme: ThemeData(primaryColor: color_primary_blue),
          home: Scaffold(
              appBar: AppBar(
                title: Row(
                  children: [
                    primary_icon,
                    title
                  ],
                ),
                actions:<Widget> [
                  Row(
                    children: [
                      Builder(builder: (context) =>
                          Center(
                            child: IconButton(icon: Icon(Icons.info, color: Colors.white,),
                                onPressed: (){_showInfo(context);}),
                          ),
                      ),
                      Builder(builder: (context) =>
                          Center(
                            child: IconButton(icon: Icon(Icons.supervised_user_circle, color: Colors.white,),
                                onPressed:(){_showUser(context);} ),
                          ),
                      ),
                    ],
                  ),
                ],
              ),
              body: verified ? FutureBuilder(
                future: _db.child(_auth.currentUser.uid).once(),
                builder: (context, snapshot) {
                  if(snapshot.hasData){
                    if(snapshot.data != null){
                        products = snapshot.data.value;
                        return productList();
                    }
                    return Center(child: CircularProgressIndicator());
                  }
                  else{
                    return Center(child: CircularProgressIndicator());

                  }
                }
              ) : Center(child: notConfirmedText)
        ),
      );
  }

  var supportedStores = Column(
      children: [
        Text("Supported stores:", style: TextStyle(fontWeight: FontWeight.bold, height: 1.5),),
        RichText(
          text: TextSpan(
              text: "Emag",
              style: TextStyle(color: Colors.blue, height: 2, decoration: TextDecoration.underline),
              recognizer: new TapGestureRecognizer()..onTap = () async {if (await canLaunch(url_emag)) {
                await launch(url_emag);
              } else {
                throw 'Could not launch ${url_emag}';
              }
              }

          ),
        ),
        RichText(
          text: TextSpan(
              text: "Flanco",
              style: TextStyle(color: Colors.blue, height: 2, decoration: TextDecoration.underline),
              recognizer: new TapGestureRecognizer()..onTap = () async {if (await canLaunch(url_flanco)) {
                await launch(url_flanco);
              } else {
                throw 'Could not launch ${url_flanco}';
              }
              }

          ),
        ),
        // RichText(
        //   text: TextSpan(
        //     text: "Altex",
        //     style: TextStyle(color: Colors.blue, height: 2, decoration: TextDecoration.underline),
        //     recognizer: new TapGestureRecognizer()..onTap = () async {if (await canLaunch(_url_altex)) {
        //       await launch(_url_altex);
        //     } else {
        //         throw 'Could not launch $_url_altex';
        //       }
        //     }
        //
        //   ),
        // ),
        RichText(
          text: TextSpan(
              text: "Quickmobile",
              style: TextStyle(color: Colors.blue, height: 2, decoration: TextDecoration.underline),
              recognizer: new TapGestureRecognizer()..onTap = () async {if (await canLaunch(url_quickmobile)) {
                await launch(url_quickmobile);
              } else {
                throw 'Could not launch ${url_quickmobile}';
              }
              }

          ),
        )



      ],
    );

  void _showInfo(context){
    // SweetAlert.show(context, title: "Description");
    showDialog(context: context,
        builder: (BuildContext context){
          return AlertDialog(
            title: Center(child: Text("Description"),
            ),
            scrollable: true,
            content: Column(
              mainAxisAlignment: MainAxisAlignment.start,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                description_text,
                supportedStores
              ],
            ),
          );
        }
    );
  }

  void _showUser(context){
      showDialog(context: context,
          builder: (BuildContext context) {
            return AlertDialog(
                title: Center(child: Text(_auth.currentUser.email)),
                scrollable: true,
                content: Column(
                    mainAxisAlignment: MainAxisAlignment.start,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children : <Widget>[
                      Container(
                          width: double.infinity,
                          child: RaisedButton(
                              child: Text("Delete Account",
                                style: TextStyle(color: Colors.white),),
                              color: color_delete_account_button,
                              onPressed: (){
                                SweetAlert.show(context,
                                    title: "Delete Account",
                                    subtitle: "Are you sure?",
                                    style: SweetAlertStyle.confirm,
                                    confirmButtonText: "Delete",
                                    showCancelButton: true,
                                    onPress: (bool isConfirm) {
                                      if (isConfirm) {
                                        //TODO: delete products too if delete pressed
                                        _auth.currentUser.delete();
                                        Navigator.pushReplacement(context,MaterialPageRoute(builder: (context) => LoginScreen()),);
                                        return false;
                                      }
                                      return true;
                                    }
                                );
                              }
                          )
                      ),
                      Container(
                          width: double.infinity,
                          child: RaisedButton(
                              child: Text("SignOut",
                                style: TextStyle(color: Colors.white),),
                              color: color_signout_button,
                              onPressed: (){
                                SweetAlert.show(context,
                                    title: "Log Out",
                                    subtitle: "Do you want to log out?",
                                    style: SweetAlertStyle.confirm,
                                    confirmButtonText: "Log Out",
                                    showCancelButton: true,
                                    onPress: (bool isConfirm) {
                                      if (isConfirm) {
                                        _auth.signOut().then((value) =>
                                           Navigator.pushReplacement(context,MaterialPageRoute(builder: (context) => LoginScreen()))

                                        );
                                        return false;
                                      }
                                      return true;
                                    }
                                );
                              }
                          )
                      ),


                    ]
                )
            );
          });
    }


}