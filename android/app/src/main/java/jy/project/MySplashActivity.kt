package jy.project

import android.content.Intent
import android.graphics.Color
import android.util.Log
import android.view.View
import com.snowfish.cn.ganga.helper.SFOnlineSplashActivity

class MySplashActivity : SFOnlineSplashActivity() {
    override fun getBackgroundColor(): Int {
        return Color.WHITE
    }

    override fun onResume() {
        Log.v("step","MySplashActivity onResume start")
        super.onResume()
        window.decorView.apply {
            systemUiVisibility = View.SYSTEM_UI_FLAG_LAYOUT_STABLE or
                    View.SYSTEM_UI_FLAG_FULLSCREEN or
                    View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION or
                    View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY or
                    View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN or
                    View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
        }
        Log.v("step","MySplashActivity onResume end")
    }


    override fun onSplashStop() {
        Log.v("step","MySplashActivity onSplashStop start")
        val intent = Intent(this, MainActivity::class.java)
        startActivity(intent)
        this.finish()
        Log.v("step","MySplashActivity onSplashStop end1")
    }
}