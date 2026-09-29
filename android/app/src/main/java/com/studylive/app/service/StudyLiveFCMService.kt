package com.studylive.app.service

import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import com.studylive.app.MainActivity
import com.studylive.app.StudyLiveApplication

class StudyLiveFCMService : FirebaseMessagingService() {

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        // Token update: send to server or register in Firebase Realtime Database
    }

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)

        val data = remoteMessage.data
        val alertType = data["type"] ?: "ANNOUNCEMENT"
        val title = data["title"] ?: remoteMessage.notification?.title ?: "StudyLive Notification"
        val message = data["message"] ?: remoteMessage.notification?.body ?: "New classroom update"

        if (alertType == "JAAGTE_RAHO" || alertType == "ATTENTION") {
            showAttentionNotification(title, message)
            triggerHapticAlert()
        } else {
            showStandardNotification(title, message)
        }
    }

    private fun showAttentionNotification(title: String, message: String) {
        val intent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            putExtra("EXTRA_ALERT_TITLE", title)
            putExtra("EXTRA_ALERT_MESSAGE", message)
        }

        val pendingIntent = PendingIntent.getActivity(
            this, 0, intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(this, StudyLiveApplication.CHANNEL_ATTENTION_ALERTS)
            .setContentTitle("🔥 $title")
            .setContentText(message)
            .setStyle(NotificationCompat.BigTextStyle().bigText(message))
            .setSmallIcon(android.R.drawable.ic_dialog_alert)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .setVibrate(longArrayOf(0, 200, 100, 250, 100, 400))
            .build()

        try {
            NotificationManagerCompat.from(this).notify(NOTIFICATION_ATTENTION_ID, notification)
        } catch (e: SecurityException) {
            // Android 13+ POST_NOTIFICATIONS permission handled gracefully
        }
    }

    private fun showStandardNotification(title: String, message: String) {
        val intent = Intent(this, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            this, 0, intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(this, StudyLiveApplication.CHANNEL_ANNOUNCEMENTS)
            .setContentTitle(title)
            .setContentText(message)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .build()

        try {
            NotificationManagerCompat.from(this).notify(System.currentTimeMillis().toInt(), notification)
        } catch (e: SecurityException) {
            // Handled
        }
    }

    private fun triggerHapticAlert() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val vibratorManager = getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? VibratorManager
            vibratorManager?.defaultVibrator?.vibrate(
                VibrationEffect.createWaveform(longArrayOf(0, 200, 100, 250, 100, 400), -1)
            )
        } else {
            @Suppress("DEPRECATION")
            val vibrator = getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
            vibrator?.vibrate(longArrayOf(0, 200, 100, 250, 100, 400), -1)
        }
    }

    companion object {
        const val NOTIFICATION_ATTENTION_ID = 9001
    }
}
