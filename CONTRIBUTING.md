# Contributing to StudyLive

Thank you for your interest in contributing to StudyLive!

## Development Guidelines

1. **Role Enforcement**: Never rely solely on client-side state for role elevation. All privileged operations must validate against server endpoints or Firebase Realtime Database Security Rules.
2. **Audio & Media Quality**: WebRTC audio tracks must always apply Echo Cancellation (`AEC`), Noise Suppression (`NS`), and Automatic Gain Control (`AGC`).
3. **Android Screen Capture**: Always use official `MediaProjection` APIs backed by a foreground service of type `mediaProjection` as required by Android 14+.
4. **Distraction-Free UX**: Follow the dark-first design constitution. Maintain clean spacing, high touch targets, and avoid visual clutter during active lectures.

## Submitting Pull Requests

1. Fork the repo and create your feature branch: `git checkout -b feature/my-feature`.
2. Verify that all automated tests pass: `npm test`.
3. Verify type safety: `npm run lint`.
4. Commit your changes and open a Pull Request against `main`.
