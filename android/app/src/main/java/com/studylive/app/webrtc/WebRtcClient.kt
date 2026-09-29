package com.studylive.app.webrtc

import android.content.Context
import android.content.Intent
import android.media.projection.MediaProjection
import org.webrtc.*
import java.util.concurrent.Executors

class WebRtcClient(
    private val context: Context,
    private val eglBase: EglBase = EglBase.create()
) {
    private val executor = Executors.newSingleThreadExecutor()
    private var peerConnectionFactory: PeerConnectionFactory? = null
    private var localAudioTrack: AudioTrack? = null
    private var localVideoTrack: VideoTrack? = null
    private var videoCapturer: VideoCapturer? = null
    private var surfaceTextureHelper: SurfaceTextureHelper? = null

    init {
        initializePeerConnectionFactory()
    }

    private fun initializePeerConnectionFactory() {
        val options = PeerConnectionFactory.InitializationOptions.builder(context)
            .setEnableInternalTracer(true)
            .createInitializationOptions()
        PeerConnectionFactory.initialize(options)

        // Native Hardware Audio Engine with Echo Cancellation, Noise Suppression, AGC
        val audioDeviceModule = JavaAudioDeviceModule.builder(context)
            .setUseHardwareAcousticEchoCanceler(true)
            .setUseHardwareNoiseSuppressor(true)
            .createAudioDeviceModule()

        peerConnectionFactory = PeerConnectionFactory.builder()
            .setAudioDeviceModule(audioDeviceModule)
            .setVideoDecoderFactory(DefaultVideoDecoderFactory(eglBase.eglBaseContext))
            .setVideoEncoderFactory(DefaultVideoEncoderFactory(eglBase.eglBaseContext, true, true))
            .createPeerConnectionFactory()
    }

    // Capture Local Microphone Audio
    fun startMicrophone(): AudioTrack? {
        val audioConstraints = MediaConstraints().apply {
            mandatory.add(MediaConstraints.KeyValuePair("googEchoCancellation", "true"))
            mandatory.add(MediaConstraints.KeyValuePair("googNoiseSuppression", "true"))
            mandatory.add(MediaConstraints.KeyValuePair("googAutoGainControl", "true"))
            mandatory.add(MediaConstraints.KeyValuePair("googHighpassFilter", "true"))
        }

        val audioSource = peerConnectionFactory?.createAudioSource(audioConstraints) ?: return null
        localAudioTrack = peerConnectionFactory?.createAudioTrack("ARDAMSa0", audioSource)
        localAudioTrack?.setEnabled(true)
        return localAudioTrack
    }

    // Android Screen Sharing via MediaProjection
    fun startScreenCapture(
        permissionResultData: Intent,
        targetWidth: Int = 1920,
        targetHeight: Int = 1080,
        targetFps: Int = 30
    ): VideoTrack? {
        val capturer = ScreenCapturerAndroid(
            permissionResultData,
            object : MediaProjection.Callback() {
                override fun onStop() {
                    stopScreenCapture()
                }
            }
        )
        videoCapturer = capturer

        surfaceTextureHelper = SurfaceTextureHelper.create("CaptureThread", eglBase.eglBaseContext)
        val videoSource = peerConnectionFactory?.createVideoSource(capturer.isScreencast) ?: return null

        capturer.initialize(surfaceTextureHelper, context, videoSource.adaptFps(targetFps))
        capturer.startCapture(targetWidth, targetHeight, targetFps)

        localVideoTrack = peerConnectionFactory?.createVideoTrack("ARDAMSv0", videoSource)
        localVideoTrack?.setEnabled(true)
        return localVideoTrack
    }

    fun stopScreenCapture() {
        try {
            videoCapturer?.stopCapture()
            videoCapturer?.dispose()
            videoCapturer = null
            surfaceTextureHelper?.dispose()
            surfaceTextureHelper = null
            localVideoTrack?.setEnabled(false)
            localVideoTrack = null
        } catch (e: Exception) {
            // Logged
        }
    }

    fun stopMicrophone() {
        localAudioTrack?.setEnabled(false)
        localAudioTrack = null
    }

    fun release() {
        stopMicrophone()
        stopScreenCapture()
        peerConnectionFactory?.dispose()
        peerConnectionFactory = null
        eglBase.release()
    }
}
