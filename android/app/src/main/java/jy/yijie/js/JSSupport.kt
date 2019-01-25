package jy.yijie.js

import android.annotation.SuppressLint
import android.app.Activity
import android.content.Context
import android.os.BatteryManager
import android.os.Build
import android.provider.Settings
import android.support.annotation.RequiresApi
import android.webkit.JavascriptInterface
import android.webkit.WebView


/**
 * Created by junyou on 2017/6/27.
 */
class JSSupport(private var c: Activity, v: WebView) {
    companion object {
        var BridgeName = "Extra"
    }

    init {
        v.addJavascriptInterface(this, JSBridge.getModuleName(BridgeName))
        JSBridge.injectJSFileOnPageFinished("js/JSSupport.js", BridgeName)
    }

    /**
     * 获取电量🔋的API
     */
    @TargetApi(Build.VERSION_CODES.LOLLIPOP)
    @JavascriptInterface
    fun js_getBattery(): Int {
        val ba = c.getSystemService(Context.BATTERY_SERVICE) as BatteryManager
        return ba.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY)
    }

    /**
     * 获取设备唯一标示的API
     */
    @SuppressLint("HardwareIds")
    @JavascriptInterface
    fun js_getGUID(): String {
        return Settings.Secure.getString(c.contentResolver, Settings.Secure.ANDROID_ID)
    }
}