!function(win,$jsb){
    win._1SDK = {
        pay:function(opt){
            var param = {
                unitPrice:+opt.amount||0,
                itemName:getStr(opt.itemName),
                count:+opt.count||1,
                callBackInfo:getStr(opt.extra)
            }
            $jsb.postMessage("pay",param,opt.callback);
        },
        login:function(){
            $jsb.postMessage("login")
        },
        exit:function(){
            $jsb.postMessage("exit")
        },
        setRole:function(opt){
            var sid = getStr(opt.sid);
            var param = {
                roleId:getStr(opt.rid),
                roleName:getStr(opt.name),
                roleLevel:getStr(opt.level),
                zoneId:sid,
                zoneName:sid
            }
            $jsb.postMessage("setRole", {data:JSON.stringify(param)});
        },
        setData:function(key,value){
            $jsb.postMessage("setData", {key:key,value:value});
        }
    }
    function getStr(dat){
        return dat==undefined? "": dat + "";
    }
}(window,$jsb)
