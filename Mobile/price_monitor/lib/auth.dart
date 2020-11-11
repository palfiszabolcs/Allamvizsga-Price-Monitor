import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_auth/firebase_auth.dart';



class AuthService{
    var userEmail;
//    sign-in
    Future signIn() async {
      future : Firebase.initializeApp();
      final FirebaseAuth _auth = FirebaseAuth.instance;

      try{
        var result = await _auth.signInWithEmailAndPassword(email: "palfi.szabolcs.8@gmail.com", password: "terminator");
        userEmail = result.user.email;
        print("insideAuth email= $userEmail");
      }catch(e){
        print("ERROR AUTH" + e.toString());
        return null;
      }
    }
}