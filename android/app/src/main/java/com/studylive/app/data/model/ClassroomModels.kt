package com.studylive.app.data.model

enum class UserRole {
    OWNER,
    HOST,
    CO_HOST,
    MODERATOR,
    STUDENT
}

data class Participant(
    val uid: String = "",
    val displayName: String = "",
    val role: UserRole = UserRole.STUDENT,
    val joinedAt: Long = 0L,
    val isAudioMuted: Boolean = true,
    val isHandRaised: Boolean = false,
    val canSpeak: Boolean = false,
    val isSharingScreen: Boolean = false,
    val connectionQuality: String = "excellent",
    val pingMs: Int = 15
)

data class ClassroomSettings(
    val isLocked: Boolean = false,
    val chatEnabled: Boolean = true,
    val studentMicAllowed: Boolean = false,
    val maxParticipants: Int = 100,
    val requireApprovalToSpeak: Boolean = true
)

data class Classroom(
    val id: String = "",
    val title: String = "",
    val subject: String = "",
    val hostUid: String = "",
    val hostName: String = "",
    val hostCodeRequired: Boolean = true,
    val createdAt: Long = 0L,
    val isActive: Boolean = true,
    val settings: ClassroomSettings = ClassroomSettings(),
    val activeScreenShareUid: String? = null,
    val activeSpeakerUid: String? = null
)

data class ChatMessage(
    val id: String = "",
    val senderUid: String = "",
    val senderName: String = "",
    val senderRole: UserRole = UserRole.STUDENT,
    val text: String = "",
    val timestamp: Long = 0L,
    val isAnnouncement: Boolean = false,
    val isSystem: Boolean = false
)

data class AttentionAlert(
    val id: String = "",
    val title: String = "",
    val message: String = "",
    val sentBy: String = "",
    val timestamp: Long = 0L,
    val urgency: String = "urgent"
)

data class PollOption(
    val id: String = "",
    val text: String = "",
    val votesCount: Int = 0
)

data class Poll(
    val id: String = "",
    val question: String = "",
    val options: List<PollOption> = emptyList(),
    val createdBy: String = "",
    val createdAt: Long = 0L,
    val durationSeconds: Int = 60,
    val endsAt: Long = 0L,
    val isActive: Boolean = true,
    val userVotes: Map<String, String> = emptyMap()
)

data class AttendanceRecord(
    val uid: String = "",
    val displayName: String = "",
    val joinTime: Long = 0L,
    val leaveTime: Long? = null,
    val totalDurationSeconds: Long = 0L,
    val reconnects: Int = 0,
    val status: String = "active"
)
