!function($jsb){
    $jsb.getBattery = function(callback){
        callback(getModule().js_getBattery()/100);
    }
    $jsb.getGUID = function(callback){
        callback(getModule().js_getGUID());
    }
    var module;
    function getModule(){
        return module || (module = $jsb.getModule("@ModuleName@"));
    }
}($jsb)