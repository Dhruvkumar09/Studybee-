package com.studylive.app

import android.Manifest
import android.content.Context
import android.content.Intent
import android.media.projection.MediaProjectionManager
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import com.studylive.app.service.ScreenCaptureService
import com.studylive.app.ui.theme.StudyLiveTheme
import com.studylive.app.webrtc.WebRtcClient

class MainActivity : ComponentActivity() {

    private var webRtcClient: WebRtcClient? = null

    // MediaProjection screen capture launcher
    private val screenCaptureLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == RESULT_OK && result.data != null) {
            startMediaProjectionService(result.data!!)
        }
    }

    // Permission launcher for Mic and Notifications
    private val permissionsLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { _ -> }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        webRtcClient = WebRtcClient(this)

        requestRequiredPermissions()

        setContent {
            StudyLiveTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    ClassroomMainScreen(
                        onStartScreenShare = { requestScreenShare() },
                        onStopScreenShare = { stopMediaProjectionService() }
                    )
                }
            }
        }
    }

    private fun requestRequiredPermissions() {
        val permissions = mutableListOf(Manifest.permission.RECORD_AUDIO)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            permissions.add(Manifest.permission.POST_NOTIFICATIONS)
        }
        permissionsLauncher.launch(permissions.toTypedArray())
    }

    private fun requestScreenShare() {
        val mediaProjectionManager = getSystemService(Context.MEDIA_PROJECTION_SERVICE) as MediaProjectionManager
        screenCaptureLauncher.launch(mediaProjectionManager.createScreenCaptureIntent())
    }

    private fun startMediaProjectionService(resultData: Intent) {
        val serviceIntent = Intent(this, ScreenCaptureService::class.java).apply {
            action = ScreenCaptureService.ACTION_START
        }
        ContextCompat.startForegroundService(this, serviceIntent)
        webRtcClient?.startScreenCapture(resultData)
    }

    private fun stopMediaProjectionService() {
        val serviceIntent = Intent(this, ScreenCaptureService::class.java).apply {
            action = ScreenCaptureService.ACTION_STOP
        }
        startService(serviceIntent)
        webRtcClient?.stopScreenCapture()
    }

    override fun onDestroy() {
        super.onDestroy()
        webRtcClient?.release()
    }
}

@Composable
fun ClassroomMainScreen(
    onStartScreenShare: () -> Unit,
    onStopScreenShare: () -> Unit
) {
    var isSharing by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = "StudyLive Android Core",
            style = MaterialTheme.typography.headlineMedium,
            color = Color.White
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = "Ready for live study session & 1080p screen capture",
            style = MaterialTheme.typography.bodyMedium,
            color = Color.Gray
        )
        Spacer(modifier = Modifier.height(24.dp))

        Button(
            onClick = {
                if (isSharing) {
                    onStopScreenShare()
                    isSharing = false
                } else {
                    onStartScreenShare()
                    isSharing = true
                }
            },
            colors = ButtonDefaults.buttonColors(
                containerColor = if (isSharing) Color(0xFFEF4444) else Color(0xFF6366F1)
            )
        ) {
            Text(if (isSharing) "Stop Screen Sharing" else "Start Android Screen Share")
        }
    }
}
