!function (win) {
    var callbacks = [];
    var seed = 0;
    win.$jsb = {
        base64ToData: function (string) {
            var binaryString = window.atob(string)
            var len = binaryString.length
            var bytes = new Uint8Array(len)

            for (var i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i)
            }

            return bytes.buffer
        },
        callback: function (id, params) {
            var fun = callbacks[id];
            if(typeof fun==="function"){
                fun(params);
            }
        },
        getCallbackID:function(callback){
            var tmp = {};
            tmp.id = registerCallback(function(obj){
                deregisterCallback(tmp.id);
                callback(obj);
            })
            return tmp.id;
        },
        getModule:function(name){
            return window["@ModuleName@" + name];
        },
        app:"android"
    }

    function registerCallback(cb) {
        var id = seed++;
        callbacks[id] = cb
        return id
    }

    function deregisterCallback(id) {
        delete callbacks[id]
    }
}(window)