import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'dart:async';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_database/firebase_database.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:sweetalert/sweetalert.dart';
import 'login.dart';

final FirebaseAuth _auth = FirebaseAuth.instance;

class HomeScreen extends StatelessWidget{

  @override
  Widget build(BuildContext context) {
    final _db = FirebaseDatabase.instance.reference();

    const _color_primary_blue = Color(0xff007bff);
    const _color_reset_pw_button = Color(0xffd39e00);
    const _color_delete_account_button = Color(0xff545b62);
    const _color_signout_button = Color(0xffbd2130);
    const _primary_icon = Icon(Icons.shopping_cart_outlined);
    const _title = Text(" Price-Monitor (v_0.5)", style: TextStyle(fontSize: 16,));
    const _url_emag = "https://www.emag.ro/";
    const _url_flanco = "https://www.flanco.ro/";
    // const _url_altex = "https://www.altex.ro/";
    const _url_quickmobile = "https://www.quickmobile.ro/";
    const _description_text = Text('''You can use this extension to follow your desired product's price changes over time.
Once you are on one of the supported webshops, just press the “Track product on this page” button and your product will be added shortly to your list.
The arrow and color coding on each product’s price makes it easier to quickly see changes, compared to yesterday’s data. Clicking the button will show you a chart of price changes.'''
      ,textAlign: TextAlign.center,);


    var uid = _auth.currentUser.uid;
    var _email = _auth.currentUser.email;
    // print("email = $_email");

    void testAuth(){
      // var result = auth.signInWithEmailAndPassword(email: "palfi.szabolcs.8@gmail.com", password: "terminator");
      // print(result);
    }

    // void readData(){
    //   _db.once().then((DataSnapshot snapshot) {
    //     print('Data : ${snapshot.value}');
    //   });
    // }
    // readData();

    var supported_stores = Column(
      children: [
        Text("Supported stores:", style: TextStyle(fontWeight: FontWeight.bold, height: 1.5),),
        RichText(
          text: TextSpan(
              text: "Emag",
              style: TextStyle(color: Colors.blue, height: 2, decoration: TextDecoration.underline),
              recognizer: new TapGestureRecognizer()..onTap = () async {if (await canLaunch(_url_emag)) {
                await launch(_url_emag);
              } else {
                throw 'Could not launch $_url_emag';
              }
              }

          ),
        ),
        RichText(
          text: TextSpan(
              text: "Flanco",
              style: TextStyle(color: Colors.blue, height: 2, decoration: TextDecoration.underline),
              recognizer: new TapGestureRecognizer()..onTap = () async {if (await canLaunch(_url_flanco)) {
                await launch(_url_flanco);
              } else {
                throw 'Could not launch $_url_flanco';
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
              recognizer: new TapGestureRecognizer()..onTap = () async {if (await canLaunch(_url_quickmobile)) {
                await launch(_url_quickmobile);
              } else {
                throw 'Could not launch $_url_quickmobile';
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
                  _description_text,
                  supported_stores
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
                title: Center(child: Text(_email)),
                scrollable: true,
                content: Column(
                    mainAxisAlignment: MainAxisAlignment.start,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children : <Widget>[
                      //TODO: reset pw function - needed or not?
                      // Container(
                      //     width: double.infinity,
                      //     child: RaisedButton(
                      //         child: Text("Reset Password",
                      //           style: TextStyle(color: Colors.white),),
                      //         color: _color_reset_pw_button,
                      //         onPressed: (){
                      //           SweetAlert.show(context,
                      //               title: "Reset",
                      //               subtitle: "Reset email will be sent to this address:\n${_auth.currentUser.email}",
                      //               style: SweetAlertStyle.confirm,
                      //               confirmButtonText: "Send",
                      //
                      //               // cancelButtonColor: Colors.grey,
                      //               // confirmButtonColor: _color_primary_blue,
                      //               showCancelButton: true,
                      //               onPress: (bool isConfirm) {
                      //                 if (isConfirm) {
                      //                   var result = _auth.sendPasswordResetEmail(email: _auth.currentUser.email);
                      //                   SweetAlert.show(context,
                      //                     style: SweetAlertStyle.success,
                      //                     title: "Done!",
                      //                     subtitle: "Password reset email sent!",);
                      //                   _auth.signOut();
                      //                   return false;
                      //                 }
                      //                 return true;
                      //               });
                      //         }
                      //     )
                      // ),
                      Container(
                          width: double.infinity,
                          child: RaisedButton(
                              child: Text("Delete Account",
                                style: TextStyle(color: Colors.white),),
                              color: _color_delete_account_button,
                              onPressed: (){}
                          )
                      ),
                      Container(
                          width: double.infinity,
                          child: RaisedButton(
                              child: Text("SignOut",
                                style: TextStyle(color: Colors.white),),
                              color: _color_signout_button,
                              onPressed: (){
                                SweetAlert.show(context,
                                      title: "Log Out",
                                      subtitle: "Do you want to log out?",
                                      style: SweetAlertStyle.confirm,
                                      confirmButtonText: "Log Out",
                                      showCancelButton: true,
                                      onPress: (bool isConfirm) {
                                        if (isConfirm) {
                                          _auth.signOut();
                                          Navigator.pushReplacement(context,MaterialPageRoute(builder: (context) => LoginScreen()),);
                                          return false;
                                        }
                                        return true;
                                  });
                              }
                          )
                      ),


                    ]
                )
            );
          });
    }
    void _readData(){

    }

    return MaterialApp(
      theme: ThemeData(primaryColor: _color_primary_blue),
      home: Scaffold(
        appBar: AppBar(
          title: Row(
            children: [
              _primary_icon,
              _title
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
      ),
    );

  }
}