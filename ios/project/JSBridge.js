var $jsb = (function (window) {
    var callbacks = [];
    var seed = 0;
    return {
        postMessage: function (name, params, onsuccess, onerror) {
            if (params == undefined) {
                params = {};
            }
            if (onsuccess) {
                params.$$onsuccess = registerCallback(function (obj) {
                    deregisterCallback(params.$$onsuccess)
                    deregisterCallback(params.$$onerror)
                    onsuccess(obj)
                })
            }
            if (onerror) {
                params.$$onerror = registerCallback(function (err) {
                    deregisterCallback(params.$$onsuccess)
                    deregisterCallback(params.$$onerror)
                    onerror(err)
                })
            }

            window.webkit.messageHandlers[name].postMessage(params)
        }
        ,
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
            var func = callbacks[id];
            if(typeof func ==="function"){
                func(params);
            }
        },
        app:"ios"
    }

    function registerCallback(cb) {
        var id = seed++;
        callbacks[id] = cb
        return id
    }

    function deregisterCallback(id) {
        delete callbacks[id]
    }
})(window)
