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
import '../dataModels/Product.dart';
import 'detail.dart';
import 'login.dart';
import '../constants.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:receive_sharing_intent/receive_sharing_intent.dart';
import 'package:adaptive_theme/adaptive_theme.dart';


Timer _timer;
final FirebaseAuth _auth = FirebaseAuth.instance;
final _db = FirebaseDatabase.instance.reference();
List<Product>productsList = List();

class HomeScreen extends StatefulWidget{
  @override
  _HomeScreenState createState() => _HomeScreenState();
}

class DomainParser{
  static bool validateDomain(url){
    RegExp linkRegExp = RegExp(r"[a-zA-z]+\.ro+|[a-zA-z]+\.com+|[a-zA-z]+\.eu+");
    var domain = linkRegExp.stringMatch(url).toString();
    return supportedDomains.contains(domain);
  }
}

class _HomeScreenState extends State<HomeScreen>{

    // RegExp linkRegExp = RegExp(r"[a-zA-z]+\.ro+|[a-zA-z]+\.com+|[a-zA-z]+\.eu+");
  bool verified = _auth.currentUser.emailVerified;

  @override
  void initState() {
    super.initState();
    _verificationCheck();
    _startChangeListener();
    _urlShareListener();

    // print("initState");
  }

  @override
  void dispose() {
    super.dispose();
  }

  void _verificationCheck(){
    _timer = Timer.periodic(Duration(seconds: 2), (timer) async {
      _auth.currentUser.reload();
        if(verified){
            _timer.cancel();
            setState(() {});
        }
        verified = _auth.currentUser.emailVerified;
    });
  }

  void _startChangeListener(){
    _db.child("USERS").child(_auth.currentUser.uid).onChildChanged.listen((event) async {
        print("there was a change - child changed");
        await Future.delayed(Duration(seconds: 1));
        _refreshListView();
    });
    _db.child("USERS").child(_auth.currentUser.uid).onChildRemoved.listen((event) async {
        print("there was a change - child removed");
        // await Future.delayed(Duration(seconds: 1));
        _refreshListView();
    });
  }

  void _newProductHandler(String url) async {
      var brightness = MediaQuery.of(context).platformBrightness;
      bool darkModeOn = brightness == Brightness.dark;

      print("url = " + url);

      // TODO:
      await Future.delayed(Duration(seconds: 3));

      var validDomain = DomainParser.validateDomain(url);
      if(validDomain){
        bool alreadyFollowed = false;
        productsList.forEach((element) {
          if(element.url == url){
            alreadyFollowed = true;
          }
        });
        if(alreadyFollowed){
          Fluttertoast.showToast(msg: "Product already followed!", toastLength: Toast.LENGTH_LONG);
        }else{
          showDialog(context: context,
              builder: (BuildContext context) {
                return AlertDialog(
                  backgroundColor: darkModeOn ? Colors.black : Colors.white,
                    title: Center(
                        child: Text("Add product on this link?", style: TextStyle(color: darkModeOn ? Colors.white : Colors.black),)),
                    scrollable: true,
                    content: Column(
                        mainAxisAlignment: MainAxisAlignment.start,
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children : <Widget>[
                          Text(url.toString(), style: TextStyle(color: darkModeOn ? Colors.white : Colors.black),),
                          Row(
                            children: [
                              Expanded(
                                  flex: 5,
                                  child: Padding(
                                    padding: const EdgeInsets.all(8.0),
                                    child: RaisedButton(
                                        shape: RoundedRectangleBorder(
                                            borderRadius: BorderRadius.all(
                                                Radius.circular(10)
                                            )
                                        ),
                                        child: Text("Cancel",
                                          style: TextStyle(color: Colors.white),),
                                        color: colorSignOutButton,
                                        onPressed: (){
                                          Navigator.pop(context);
                                        }
                                    ),
                                  )
                              ),
                              Expanded(
                                  flex: 5,
                                  child: Padding(
                                    padding: const EdgeInsets.all(8.0),
                                    child: RaisedButton(
                                        shape: RoundedRectangleBorder(
                                            borderRadius: BorderRadius.all(
                                                Radius.circular(10)
                                            )
                                        ),
                                        child: Text("Add",
                                          style: TextStyle(color: Colors.white),),
                                        color: colorPrimaryBlue,
                                        onPressed: (){
                                          _db.child("NEW").child(_auth.currentUser.uid).push().set({'url': url.toString()});
                                          Navigator.pop(context);
                                        }
                                    ),
                                  )
                              ),
                            ],
                          ),
                        ]
                    )
                );
              });
          }
      }else{
        if(url != "null"){
          Fluttertoast.showToast(msg: "Store not supported", toastLength: Toast.LENGTH_LONG);
        }
      }
    }

  void _urlShareListener(){
    ReceiveSharingIntent.getInitialTextAsUri().then((url) =>
      _newProductHandler(url.toString())
    );
    ReceiveSharingIntent.getTextStream().listen((String url)  {
      _newProductHandler(url);
    }, onError: (err) {
      print("getLinkStream error: $err");
    });
  }

  Future<void> _refreshListView() async {
    setState(() {});
    return true;
  }

  Widget productListWidget(){
    var brightness = MediaQuery.of(context).platformBrightness;
    bool darkModeOn = brightness == Brightness.dark;

      return RefreshIndicator(
      onRefresh: _refreshListView,
      child: ListView.builder(
          itemCount: productsList.length,
          itemBuilder: (context, index) {
            var currentProduct = productsList.elementAt(index);
            var imageURL = productsList.elementAt(index).image;
            // var prodURL = productsList.elementAt(index).url;
            var name = Padding(
                padding: const EdgeInsets.all(10.0),
                child: Text(productsList.elementAt(index).name, style: TextStyle(fontSize: 15), overflow: TextOverflow.fade,)
            );

            var currency = productsList.elementAt(index).currency;
            var price,priceColor, icon;
            var lastPrice = productsList.elementAt(index).checks.last.price;
            // if price is null, we show UNAVAILABLE instead of the price
            if(lastPrice.toString() == "null"){
              price = Padding(
                padding: const EdgeInsets.all(10.0),
                child: Text("UNAVAILABLE !", style: TextStyle(fontSize: 16), overflow: TextOverflow.fade,),
              );
            }else{
              if(productsList.elementAt(index).checks.length > 1){
                var secondLastIndex = (productsList.elementAt(index).checks.length) - 2;
                var secondLastPrice = productsList.elementAt(index).checks.elementAt(secondLastIndex).price;

                // if second last price is null,
                // fails to compare it to current price by value
                // so we check for it too
                if(secondLastPrice.toString() == "null"){
                    icon = priceArrowForward;
                    priceColor = darkModeOn ? Colors.white : Colors.black;
                }else{
                  // if last price and/or second last price are not null
                  // we compare them to determine the price change

                  // no change in price
                  if(lastPrice == secondLastPrice){
                    icon = priceArrowForward;
                    priceColor = darkModeOn ? Colors.white : Colors.black;
                  }
                  // price went up
                  if(lastPrice > secondLastPrice){
                    icon = priceArrowUp;
                    priceColor = arrowUpColor;
                  }
                  // price went down
                  if(lastPrice < secondLastPrice){
                    icon = priceArrowDown;
                    priceColor = arrowDownColor;
                  }
                }
              }else{
                icon = priceArrowForward;
                priceColor = darkModeOn ? Colors.white : Colors.black;
              }
              price = Padding(
                  padding: const EdgeInsets.all(10.0),
                  child: RichText(
                    overflow: TextOverflow.fade,
                    text: TextSpan(
                      children: [

                        TextSpan(text: "$lastPrice $currency", style: TextStyle(fontSize: 16, color: priceColor)),
                        WidgetSpan(
                          child: Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 2.0),
                            child: icon,
                          ),
                        ),
                      ],
                    ),
                  )
              );
            }

            return GestureDetector(
              onTap: () {
                Navigator.of(context).push(MaterialPageRoute(
                    builder: (context) => DetailScreen(currentProduct)
                  )
                );
              },
              child: Card(
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.all(
                      Radius.circular(15)
                  ),
                ),
                child: Column(
                  children: [
                    Row(
                      children: [
                        Padding(
                          padding: const EdgeInsets.all(8.0),
                          child: Container(
                            width: MediaQuery.of(context).size.width * 0.28,
                            child: CachedNetworkImage(
                              imageUrl: imageURL,
                              // imageBuilder: (context, imageProvider) => Container(
                              //   decoration: BoxDecoration(
                              //     borderRadius: BorderRadius.circular(15),
                              //     image: DecorationImage(
                              //         image: imageProvider,
                              //       ),
                              //   ),
                              // ),
                              progressIndicatorBuilder: (context, url, downloadProgress) =>
                                  Center(child:
                                        CircularProgressIndicator(
                                          value: downloadProgress.progress,
                                          valueColor: AlwaysStoppedAnimation(Theme.of(context).primaryColor),
                                        )
                                  ),
                              errorWidget: (context, url, error) => Center(child: Icon(Icons.error, color: Theme.of(context).primaryColor,)),
                            ),
                          ),
                        ),
                        Expanded(
                          // width: MediaQuery.of(context).size.width * 0.66,
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
          }),
    );
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
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.vertical(
                        bottom: Radius.elliptical(MediaQuery.of(context).size.width, 25),
                      ),
                    ),
                    // title: Row(
                    //   children: [
                    //     appBarIcon,
                    //     title
                    //   ],
                    // ),
                    actions:<Widget> [
                      Row(
                        children: [
                          Container(
                            width: MediaQuery.of(context).size.width * 0.1,
                            child: Center(
                              child: IconButton(
                                  icon: Icon(Icons.info, color: Colors.white,),
                                  onPressed: (){_showInfo(context, darkModeOn);}
                              ),
                            ),
                          ),
                          Container(
                            width: MediaQuery.of(context).size.width * 0.8,
                            child: Center(
                              child: title
                            ),
                          ),
                          Container(
                            width: MediaQuery.of(context).size.width * 0.1,
                            child: Center(
                              child: IconButton(
                                  icon: Icon(Icons.supervised_user_circle, color: Colors.white,),
                                  onPressed:(){_showUser(context, darkModeOn);}
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  body: verified ? FutureBuilder(
                    future: _db.child("USERS").child(_auth.currentUser.uid).once(),
                    builder: (context, snapshot) {
                      if(snapshot.hasData){
                        if(snapshot.data != null){
                          _makeProductList(snapshot);
                          return productListWidget();
                        }
                        return Center(child: CircularProgressIndicator());
                      }
                      else{
                        return Center(child: CircularProgressIndicator());
                      }
                    }
                  ) : Center(child: notConfirmedText),
            ),
          ),
        );
  }

  void _makeProductList(AsyncSnapshot snapshot){
    productsList.clear();
    Map<dynamic,dynamic>tempProd = snapshot.data.value;
    tempProd.forEach((key, value) {
      productsList.add(Product.fromSnapshot(key, value));
    });
    productsList.sort((a,b) => a.checks.first.date.compareTo(b.checks.first.date));
  }

  Widget supportedStores(darkModeOn){
    return Column(
      children: [
        Text("Supported stores:", style: TextStyle(fontWeight: FontWeight.bold, height: 1.5,color: darkModeOn ? Colors.grey : Colors.black ,)),
        RichText(
          text: TextSpan(
              text: "Emag",
              style: TextStyle(color: Colors.blue, height: 2, decoration: TextDecoration.underline),
              recognizer: new TapGestureRecognizer()..onTap = () async {if (await canLaunch(url_emag)) {
                await launch(url_emag);
              } else {
                throw 'Could not launch $url_emag';
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
                throw 'Could not launch $url_flanco';
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
                throw 'Could not launch $url_quickmobile';
              }
              }

          ),
        )



      ],
    );
  }

  void _showInfo(context, darkModeOn){
  // SweetAlert.show(context, title: "Description");
    showDialog(context: context,
        builder: (BuildContext context){
          return AlertDialog(
            backgroundColor: darkModeOn ? Colors.black : Colors.white ,
            title: Center(child: Text("Description" ,style: TextStyle(color: darkModeOn ? Colors.grey : Colors.black),),),
            scrollable: true,
            content: Column(
              mainAxisAlignment: MainAxisAlignment.start,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Text(descriptionText, textAlign: TextAlign.center, style: TextStyle(color: darkModeOn ? Colors.white : Colors.black),),
                supportedStores(darkModeOn)
              ],
            ),
          );
        }
    );
  }

  void _showUser(context, darkModeOn){
    showDialog(context: context,
        builder: (BuildContext context) {
          return AlertDialog(
              backgroundColor: darkModeOn ? Colors.black : Colors.white ,
              title: Center(
                  child: SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Text(_auth.currentUser.email, style: TextStyle(color: darkModeOn ? Colors.white : Colors.black),))),
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
                            color: colorDeleteAccountButton,
                            onPressed: (){
                              SweetAlert.show(context,
                                  title: "Delete Account",
                                  subtitle: "Are you sure?",
                                  style: SweetAlertStyle.confirm,
                                  confirmButtonText: "Delete",
                                  showCancelButton: true,
                                  // cancelButtonColor: Colors.red,
                                  // confirmButtonColor: colorPrimaryBlue,
                                  onPress: (bool isConfirm) {
                                    if (isConfirm) {
                                      //TODO: delete products too if delete pressed
                                      _auth.currentUser.delete();
                                      Navigator.pushAndRemoveUntil(context, MaterialPageRoute(builder: (context) => LoginScreen()), (r) => false);
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
                            color: colorSignOutButton,
                            onPressed: (){
                              SweetAlert.show(context,
                                  title: "Log Out",
                                  subtitle: "Do you want to log out?",
                                  style: SweetAlertStyle.confirm,
                                  confirmButtonText: "Log Out",
                                  showCancelButton: true,
                                  // cancelButtonColor: Colors.red,
                                  // confirmButtonColor: colorPrimaryBlue,
                                  onPress: (bool isConfirm) {
                                    if (isConfirm) {
                                      _auth.signOut().then((value) =>
                                          Navigator.pushAndRemoveUntil(context, MaterialPageRoute(builder: (context) => LoginScreen()), (r) => false)
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