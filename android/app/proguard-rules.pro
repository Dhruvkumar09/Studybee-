# StudyLive ProGuard / R8 Rules

# WebRTC Native
-keep class org.webrtc.** { *; }
-dontwarn org.webrtc.**

# Firebase
-keepattributes *Annotation*,Signature,InnerClasses,EnclosingMethod
-dontwarn com.google.firebase.**
