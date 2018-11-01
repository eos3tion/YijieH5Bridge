package jy.yijie.js

import android.annotation.SuppressLint
import android.webkit.JavascriptInterface
import android.webkit.WebView
import com.snowfish.cn.ganga.helper.SFOnlineHelper
import com.snowfish.cn.ganga.helper.SFOnlinePayResultListener
import jy.yijie.YiJieActivity

class YiJieJSAPI @SuppressLint("JavascriptInterface") constructor(private var c: YiJieActivity, var v: WebView) {

    companion object {
        const val BridgeName = "YiJieAndroid"
    }

    init {
        v.addJavascriptInterface(this, JSBridge.getModuleName(BridgeName))
        JSBridge.injectJSFileOnPageFinished("js/1sdkAPI.js", BridgeName)
    }

    @JavascriptInterface
    fun exit() {
        c.exit()
    }

    @JavascriptInterface
    fun pay(callbackID: String, unitPrice: Int, itemName: String, count: Int, extra: String?) {
        SFOnlineHelper.pay(c, unitPrice, itemName, count, extra, "", object : SFOnlinePayResultListener {
            override fun onOderNo(p0: String?) {
                JSBridge.solveCallback(v, callbackID, "{state:1,msg:'$p0'}")
            }

            override fun onSuccess(p0: String?) {
                JSBridge.solveCallback(v, callbackID, "{state:0,msg:'$p0'}")
            }

            override fun onFailed(p0: String?) {
                JSBridge.solveCallback(v, callbackID, "{state:2,msg:'$p0'}")
            }
        })
    }

    @JavascriptInterface
    fun login() {
        c.login()
    }

    @JavascriptInterface
    fun logout(callBackID: String) {
        SFOnlineHelper.logout(c, callBackID)
    }

    @JavascriptInterface
    fun setRole(rid: String, name: String, level: String, sid: String) {
        SFOnlineHelper.setRoleData(c, rid, name, level, sid, "1")
    }

    @JavascriptInterface
    fun setData(key: String, value: String) {
        SFOnlineHelper.setData(c, key, value)
    }

}