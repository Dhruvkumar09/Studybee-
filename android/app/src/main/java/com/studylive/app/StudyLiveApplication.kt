package com.studylive.app

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.media.AudioAttributes
import android.net.Uri
import android.os.Build

class StudyLiveApplication : Application() {

    override fun onCreate() {
        super.onCreate()
        createNotificationChannels()
    }

    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val notificationManager = getSystemService(NotificationManager::class.java)

            // 1. Jaagte Raho Attention Alerts Channel (High Priority Heads-Up + Vibration)
            val attentionChannel = NotificationChannel(
                CHANNEL_ATTENTION_ALERTS,
                "StudyLive Attention Alerts (Jaagte Raho)",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Urgent classroom alerts from Teacher requiring immediate focus"
                enableVibration(true)
                vibrationPattern = longArrayOf(0, 200, 100, 250, 100, 400)
                lockscreenVisibility = NotificationChannel.USER_SECRET
            }

            // 2. MediaProjection Screen Sharing Foreground Service Channel
            val screenShareChannel = NotificationChannel(
                CHANNEL_SCREEN_SHARE,
                "Screen Sharing Active",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Persistent notification while broadcasting screen to students"
                setShowBadge(false)
            }

            // 3. Classroom Announcements & Chat Channel
            val announcementsChannel = NotificationChannel(
                CHANNEL_ANNOUNCEMENTS,
                "Classroom Announcements",
                NotificationManager.IMPORTANCE_DEFAULT
            ).apply {
                description = "Lectures, polls, and teacher updates"
            }

            notificationManager.createNotificationChannel(attentionChannel)
            notificationManager.createNotificationChannel(screenShareChannel)
            notificationManager.createNotificationChannel(announcementsChannel)
        }
    }

    companion object {
        const val CHANNEL_ATTENTION_ALERTS = "studylive_attention_channel"
        const val CHANNEL_SCREEN_SHARE = "studylive_screen_share_channel"
        const val CHANNEL_ANNOUNCEMENTS = "studylive_announcements_channel"
    }
}
