(function (win, $jsb) {
 $jsb.getBattery=function(success){
    $jsb.postMessage("getBattery",null,success);
 }
 $jsb.getLocation=function(success,fail){
    $jsb.postMessage("getLocation",null,success,fail);
 }
 $jsb.getGUID=function(success){
    $jsb.postMessage("getGUID",null,success);
 }
})(window, $jsb)
