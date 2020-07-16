console.log("preload");

const database = firebase.database();

function load_data(){
    chrome.storage.sync.get('firebase_uid', function (result) {
        var uid = result.firebase_uid;
        database.ref('/USERS/' + uid).on("value", function(item){
           let items = item.val();
           chrome.storage.sync.set({"products": items});
    
        },function (errorObject) {
           console.log("The read failed: " + errorObject.code);
        });
    });
}

load_data();
