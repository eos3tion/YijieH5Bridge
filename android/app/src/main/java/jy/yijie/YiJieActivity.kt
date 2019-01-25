package com.yijie

import android.app.Activity
import android.app.AlertDialog
import android.app.ProgressDialog
import android.content.DialogInterface
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.view.View
import android.webkit.WebView
import com.alibaba.fastjson.JSON
import com.github.kittinunf.fuel.httpGet
import com.snowfish.cn.ganga.helper.SFOnlineExitListener
import com.snowfish.cn.ganga.helper.SFOnlineHelper
import com.snowfish.cn.ganga.helper.SFOnlineLoginListener
import com.snowfish.cn.ganga.helper.SFOnlineUser
import jy.yijie.js.JSBridge
import jy.yijie.js.JSSupport
import jy.yijie.js.YiJieJSAPI
import java.net.URLEncoder


open class YiJieActivity(gateUrl: String,id:Int,layout:Int) : Activity(), SFOnlineLoginListener {
    private val gateUrl = gateUrl
    private val webViewID = id
    private val layoutID = layout

    override fun onCreate(savedInstanceState: Bundle?) {
        Log.v("step", "MainActivity 准备调用 `super.onCreate`")
        super.onCreate(savedInstanceState)
        setContentView(layoutID)
        val v = findViewById<WebView>(webViewID)
        Log.v("step", "MainActivity onCreate 准备设置 webView")

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            WebView.setWebContentsDebuggingEnabled(true)
        }
        val webSettings = v.settings
        webSettings.javaScriptEnabled = true//允许运行JavaScript
        webSettings.javaScriptCanOpenWindowsAutomatically = true//允许js弹窗，alert也包括在内
        webSettings.domStorageEnabled = true
        webSettings.databaseEnabled = true
        webSettings.loadWithOverviewMode = true
        Log.v("step", "MainActivity onCreate  webView 设置完成")

        Log.v("step", "MainActivity onCreate  增加JS支持")
        JSBridge(this, v)
        YiJieJSAPI(this, v)
        JSSupport(this, v)
        runOnUiThread {
            initSDK()
        }
    }

    private fun initSDK() {
        Log.v("step", "准备初始化调用 SFOnlineHelper.setLoginListener")
        SFOnlineHelper.setLoginListener(this, this)
        Log.v("step", "准备初始化调用 SFOnlineHelper.onCreate")
        SFOnlineHelper.onCreate(this) { tag, value ->
            if (tag == "success") {//初始化成功
                Log.v("init", "success")
                login()
            } else if (tag == "fail") {//初始化失败
                Log.v("init", "fail,$value")
                runOnUiThread {
                    hideProgress()
                    val dialog = AlertDialog.Builder(this@YiJieActivity)
                            .setMessage("登陆失败")
                            .setTitle("提示")
                            .setNegativeButton("退出游戏") { _: DialogInterface, _: Int ->
                                exit()
                            }
                            .create()
                    dialog.show()
                }
            }
        }
        Log.v("step", "initSDK end")
    }

    override fun onStop() {
        super.onStop()
        SFOnlineHelper.onStop(this)
    }

    override fun onDestroy() {
        super.onDestroy()
        SFOnlineHelper.onDestroy(this)
    }

    override fun onResume() {
        super.onResume()
        SFOnlineHelper.onResume(this)
        doFullScreen()
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (hasFocus) {
            doFullScreen()
        }
    }

    private fun doFullScreen() {
        window.decorView.apply {
            systemUiVisibility = View.SYSTEM_UI_FLAG_LAYOUT_STABLE or
                    View.SYSTEM_UI_FLAG_FULLSCREEN or
                    View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION or
                    View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY or
                    View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN or
                    View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
        }
    }

    override fun onPause() {
        super.onPause()
        SFOnlineHelper.onPause(this)
    }

    override fun onRestart() {
        super.onRestart()
        SFOnlineHelper.onRestart(this)
    }

    override fun onBackPressed() {
        onExit()
    }

    fun exit() {
        android.os.Process.killProcess(android.os.Process.myPid())
    }

    fun login() {
        Log.v("step", "login start")
        showProgress("登陆中请稍后")
        SFOnlineHelper.login(this, null)
        Log.v("step", "login end")
    }

    private var accountInfo: SFOnlineUser? = null

    override fun onLoginSuccess(user: SFOnlineUser, p1: Any?) {
        Log.v("step", "onLoginSuccess")
        accountInfo = user
        onLogin()
    }

    private fun onLogin() {
        //使用平台用户id进行登陆
        val ac = accountInfo!!
        var gateUrl = "$gateUrl?uid=${ac.channelUserId}&sess=${ac.token}&sdk=${ac.channelId}&app=${ac.productCode}"
        Log.v("gateUrl", gateUrl)
        gateUrl.httpGet().responseString { _, _, result ->
            hideProgress()
            val (jsonString, error) = result
            Log.v("step", "gateCallBack:$jsonString")
            if (error == null) {
                try {
                    val map= JSON.parse(jsonString!!) as Map<String, Map<String,*>>
                    val code = map["code"]
                    val data = map["data"]
                    if (code == null) {
                        if (data != null) {
                            //登陆游戏
                            val v = findViewById<WebView>(webViewID)
                            val url = "${data["loginurl"]}${URLEncoder.encode(JSON.toJSONString(data), "utf-8")}"
                            Log.v("url", url)
                            runOnUiThread {
                                v.loadUrl(url)
                            }
                            return@responseString
                        }
                    } else {
                        Log.v("step", "gateCallBack has code ${code["code"]}")
                    }
                } catch (e: Exception) {
                    Log.v("httpResult", "gateCallBack has exception:${e.message}")
                }
            } else {
                Log.e("httpResult", "error${error.message}")
            }
            runOnUiThread {
                val dialog = AlertDialog.Builder(this)
                        .setMessage("登陆服务器连接失败，请稍后重试")
                        .setTitle("提示")
                        .setPositiveButton("重新连接") { _: DialogInterface, _: Int ->
                            onLogin()
                        }
                        .setNegativeButton("退出游戏") { _: DialogInterface, _: Int ->
                            exit()
                        }
                        .create()
                dialog.show()
            }
        }
    }

    override fun onLogout(p0: Any?) {
        runOnUiThread {
            val dialog = AlertDialog.Builder(this)
                    .setMessage("登出成功")
                    .setTitle("提示")
                    .setPositiveButton("重新登陆") { _: DialogInterface, _: Int ->
                        login()
                    }
                    .setNegativeButton("退出游戏") { _: DialogInterface, _: Int ->
                        exit()
                    }
                    .create()
            dialog.show()
        }
    }

    override fun onLoginFailed(p0: String?, p1: Any?) {
        Log.v("step", "onLoginFailed")
        runOnUiThread {
            hideProgress()
            val dialog = AlertDialog.Builder(this)
                    .setMessage("登陆失败")
                    .setTitle("提示")
                    .setPositiveButton("重新登陆") { _: DialogInterface, _: Int ->
                        login()
                    }
                    .setNegativeButton("退出游戏") { _: DialogInterface, _: Int ->
                        exit()
                    }
                    .create()
            dialog.show()
        }
    }

    private var pro: ProgressDialog? = null

    private fun hideProgress() {
        runOnUiThread {
            if (pro != null) {
                pro!!.hide()
            }
        }
    }

    private fun showProgress(msg: String) {
        runOnUiThread {
            hideProgress()
            pro = ProgressDialog.show(this, "", msg)
        }

    }

    private fun onExit() {
        // exit方法用于系统全局退出
        /*public static void exit(Activity context, SFOnlineExitListener listener)
         *  @param context   上下文Activity
         *  @param listener  退出回调函数
         */
        SFOnlineHelper.exit(this, object : SFOnlineExitListener {
            /*  onSDKExit
             *  @description　当SDK有退出方法及界面，回调该函数
             *  @param bool   是否退出标志位
             */
            override fun onSDKExit(bool: Boolean) {
                if (bool) {
                    //apk退出函数，demo中也有使用System.exit()方法；但请注意360SDK的退出使用exit（）会导致游戏退出异常
                    finish()
                }
            }

            /*  onNoExiterProvide
             *  @description　SDK没有退出方法及界面，回调该函数，可在此使用游戏退出界面
             */
            override fun onNoExiterProvide() {
                val builder = AlertDialog.Builder(this@YiJieActivity).setTitle("退出游戏").setPositiveButton("退出"
                ) { _, _ ->
                    this@YiJieActivity.exit()
                }
                    .setNegativeButton("继续游戏") { dialogInterface: DialogInterface, i: Int -> }
                builder.show()
            }
        })
    }
}