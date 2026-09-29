package com.studylive.app.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val DarkColorScheme = darkColorScheme(
    primary = Color(0xFF6366F1), // Indigo
    secondary = Color(0xFF06B6D4), // Cyan
    tertiary = Color(0xFFF59E0B), // Amber (Jaagte Raho)
    background = Color(0xFF09090B), // Zinc 950
    surface = Color(0xFF18181B), // Zinc 900
    onPrimary = Color.White,
    onSecondary = Color.White,
    onBackground = Color(0xFFF4F4F5),
    onSurface = Color(0xFFF4F4F5),
    error = Color(0xFFEF4444)
)

@Composable
fun StudyLiveTheme(
    darkTheme: Boolean = true, // Dark-first priority
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = DarkColorScheme,
        content = content
    )
}
