package com.studylive.app.data.repository

import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.ValueEventListener
import com.studylive.app.data.model.AttentionAlert
import com.studylive.app.data.model.ChatMessage
import com.studylive.app.data.model.Classroom
import com.studylive.app.data.model.Participant
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow

class ClassroomRepository(
    private val db: FirebaseDatabase = FirebaseDatabase.getInstance()
) {

    // Setup Presence System with Firebase Realtime Database onDisconnect()
    fun registerPresence(classroomId: String, uid: String, participant: Participant) {
        val presenceRef = db.getReference("classrooms/$classroomId/presence/$uid")
        val participantRef = db.getReference("classrooms/$classroomId/participants/$uid")
        val connectedRef = db.getReference(".info/connected")

        connectedRef.addValueEventListener(object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                val connected = snapshot.getValue(Boolean::class.java) ?: false
                if (connected) {
                    presenceRef.setValue(true)
                    participantRef.setValue(participant)
                    presenceRef.onDisconnect().removeValue()
                    participantRef.child("isAudioMuted").onDisconnect().setValue(true)
                }
            }

            override fun onCancelled(error: DatabaseError) {}
        })
    }

    // Real-time Flow of Classroom State
    fun observeClassroom(classroomId: String): Flow<Classroom?> = callbackFlow {
        val ref = db.getReference("classrooms/$classroomId")
        val listener = object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                trySend(snapshot.getValue(Classroom::class.java))
            }

            override fun onCancelled(error: DatabaseError) {
                close(error.toException())
            }
        }
        ref.addValueEventListener(listener)
        awaitClose { ref.removeEventListener(listener) }
    }

    // Real-time Flow of Chat Messages
    fun observeChat(classroomId: String): Flow<List<ChatMessage>> = callbackFlow {
        val ref = db.getReference("classrooms/$classroomId/chat").limitToLast(100)
        val listener = object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                val list = snapshot.children.mapNotNull { it.getValue(ChatMessage::class.java) }
                trySend(list)
            }

            override fun onCancelled(error: DatabaseError) {
                close(error.toException())
            }
        }
        ref.addValueEventListener(listener)
        awaitClose { ref.removeEventListener(listener) }
    }

    // Send Chat Message
    fun sendChatMessage(classroomId: String, message: ChatMessage) {
        val ref = db.getReference("classrooms/$classroomId/chat").push()
        ref.setValue(message.copy(id = ref.key ?: message.id))
    }

    // Send Jaagte Raho Attention Alert (Host only)
    fun sendAttentionAlert(classroomId: String, alert: AttentionAlert) {
        val ref = db.getReference("classrooms/$classroomId/alerts").push()
        ref.setValue(alert.copy(id = ref.key ?: alert.id))
    }
}
