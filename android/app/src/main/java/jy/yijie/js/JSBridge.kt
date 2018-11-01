package jy.yijie.js

import android.annotation.SuppressLint
import android.content.Context
import android.util.Log
import android.webkit.WebView
import android.webkit.WebViewClient
import java.io.IOException
import java.nio.charset.Charset

/**
 * Created by junyou on 2017/6/9.
 */
class JSBridge(private var c: Context, private var v: WebView) {

    companion object {
        const val JSBridgeName = "mi_"
        @SuppressLint("StaticFieldLeak")
        private var instance: JSBridge? = null

        fun injectJSFileOnPageFinished(path: String, name: String = "") {
            if (null != instance) {
                instance!!.injectJSFileOnPageFinished(path, name)
            }
        }

        fun getModuleName(name: String) = JSBridgeName + name

        fun solveCallback(v: WebView, callbackID: String, vararg params: String) {
            v.evaluateJavascript("${'$'}jsb.callback($callbackID,${params.joinToString(",")})") { value ->
                print(value)
            }
        }

    }

    var scripts = ArrayList<String>()

    var isFinished = false

    fun injectJSFileOnPageFinished(path: String, name: String = "") {
        val script: String?
        try {
            script = getScript(path, name)
        } catch (e: IOException) {
            Log.e("", e.message + "\n" + e.stackTrace.toString())
            return
        }
        if (isFinished) {
            injectJSFile(script)
        } else {
            scripts.add(script)
        }
    }

    private fun getScript(path: String, name: String = ""): String {
        val assets = c.assets
        val ims = assets.open(path)
        val r = ims.reader(Charset.forName("utf8"))
        var content = r.readText()
        content = content.replace("@ModuleName@".toRegex(), name)
        Log.v("js", content)
        return content
    }

    private fun injectJSFile(script: String) {
        v.evaluateJavascript(script) { value ->
            Log.v("jsCallback", value)
        }
    }


    init {
        instance = this
        v.webViewClient = object : WebViewClient() {
            override fun onPageFinished(view: WebView?, url: String?) {
                scripts.forEach { path ->
                    injectJSFile(path) //加载js文件
                }
                isFinished = true
            }
        }
        injectJSFileOnPageFinished("js/JSBridge.js", JSBridgeName)
    }

}