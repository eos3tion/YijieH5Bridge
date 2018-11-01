!function(win,$jsb){
    win._1SDK = {
        pay:function(opt){
            var callback = opt.callback;
            var amount = +opt.amount||0;
            var itemName = getStr(opt.itemName);
            var extra = getStr(opt.extra);
            var count = +opt.count||1;
            getModule().pay($jsb.getCallbackID(callback),amount,itemName,count,extra)
        },
        login:function(){
            getModule().login()
        },
        exit:function(){
            getModule().exit()
        },
        setRole:function(opt){
            var rid = getStr(opt.rid);
            var name = getStr(opt.name);
            var level = getStr(opt.level);
            var sid = getStr(opt.sid);
            getModule().setRole(rid,name,level,sid);
        },
        setData:function(key,value){
            getModule().setData(key,value);
        }
    }
    var module;
    function getModule(){
        return module || (module = $jsb.getModule("@ModuleName@"));
    }
    function getStr(dat){
        return dat==undefined? "": dat + "";
    }
}(window,$jsb)