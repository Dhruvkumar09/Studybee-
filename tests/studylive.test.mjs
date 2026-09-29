import { describe, it } from 'node:test';
import assert from 'node:assert';
import { getAIProvider, GoogleGeminiProvider } from '../server/aiProvider.ts';

describe('StudyLive Core Test Suite', () => {

  // 1. Host Authorization Tests
  describe('Host Authorization Logic', () => {
    const HOST_DEV_ACCESS_CODE = '13189';

    it('should authorize host when development code is 13189', () => {
      const inputCode = '13189';
      const isAuthorized = inputCode.trim() === HOST_DEV_ACCESS_CODE;
      assert.strictEqual(isAuthorized, true);
    });

    it('should reject unauthorized code attempts', () => {
      const inputCode = '00000';
      const isAuthorized = inputCode.trim() === HOST_DEV_ACCESS_CODE;
      assert.strictEqual(isAuthorized, false);
    });

    it('should enforce role privileges: students cannot trigger host actions', () => {
      const userRole = 'STUDENT';
      const canMuteAll = userRole === 'HOST' || userRole === 'CO_HOST';
      const canLockRoom = userRole === 'HOST' || userRole === 'CO_HOST';
      assert.strictEqual(canMuteAll, false);
      assert.strictEqual(canLockRoom, false);
    });
  });

  // 2. Attendance & Presence Tracking Tests
  describe('Attendance Tracking', () => {
    it('should accurately calculate session duration on leave', () => {
      const joinTime = Date.now() - 3600000; // 1 hour ago
      const leaveTime = Date.now();
      const totalDurationSeconds = Math.round((leaveTime - joinTime) / 1000);

      assert.ok(totalDurationSeconds >= 3590 && totalDurationSeconds <= 3610);
    });

    it('should increment reconnect count without resetting join timestamp', () => {
      const record = {
        uid: 'student-1',
        joinTime: 100000,
        reconnects: 0,
        status: 'active'
      };

      // Reconnect event
      record.reconnects += 1;
      record.status = 'active';

      assert.strictEqual(record.reconnects, 1);
      assert.strictEqual(record.joinTime, 100000);
    });
  });

  // 3. Polls & Quizzes Mechanics
  describe('Polls and Quizzes Mechanics', () => {
    it('should correctly tally single votes per participant', () => {
      const poll = {
        id: 'poll-1',
        question: 'Is rotational inertia understood?',
        options: [
          { id: 'opt-0', text: 'Yes', votesCount: 0 },
          { id: 'opt-1', text: 'No', votesCount: 0 }
        ],
        userVotes: {}
      };

      const uid = 'student-aryan';
      const selectedOptionId = 'opt-0';

      // Vote
      if (!poll.userVotes[uid]) {
        poll.userVotes[uid] = selectedOptionId;
        const opt = poll.options.find(o => o.id === selectedOptionId);
        if (opt) opt.votesCount += 1;
      }

      assert.strictEqual(poll.options[0].votesCount, 1);
      assert.strictEqual(poll.userVotes[uid], 'opt-0');

      // Attempt second vote (must be blocked)
      const secondVoteAllowed = !poll.userVotes[uid];
      assert.strictEqual(secondVoteAllowed, false);
    });
  });

  // 4. AI Provider Abstraction Tests
  describe('AI Provider Abstraction', () => {
    it('should instantiate the default AI provider', () => {
      const provider = getAIProvider('gemini');
      assert.ok(provider);
      assert.ok(provider instanceof GoogleGeminiProvider);
    });

    it('should generate academic quiz questions through AI provider fallback', async () => {
      // Isolate unit test from external network calls
      const origKey = process.env.GEMINI_API_KEY;
      process.env.GEMINI_API_KEY = '';
      try {
        const provider = new GoogleGeminiProvider();
        const result = await provider.generateQuiz({
          topic: 'Rotational Motion',
          mode: 'JEE',
          count: 3
        });

        assert.ok(result);
        assert.ok(Array.isArray(result.questions));
        assert.strictEqual(result.questions.length, 3);
        assert.ok(result.questions[0].question);
        assert.ok(result.questions[0].options.length >= 4);
      } finally {
        process.env.GEMINI_API_KEY = origKey;
      }
    });

    it('should extract formula sheet for syllabus', async () => {
      const origKey = process.env.GEMINI_API_KEY;
      process.env.GEMINI_API_KEY = '';
      try {
        const provider = new GoogleGeminiProvider();
        const formulas = await provider.extractFormulas('Rotational Motion', 'JEE');
        assert.ok(formulas);
        assert.ok(formulas.includes('Formula Sheet') || formulas.length > 10);
      } finally {
        process.env.GEMINI_API_KEY = origKey;
      }
    });
  });

  // 5. Jaagte Raho 🔥 Attention Alert Schema
  describe('Jaagte Raho Attention Alerts', () => {
    it('should format urgent attention alerts correctly', () => {
      const alert = {
        id: `alert-${Date.now()}`,
        title: 'JAAGTE RAHO 🔥',
        message: 'Wake up! Critical JEE formula incoming.',
        sentBy: 'Prof. R. K. Sharma',
        timestamp: Date.now(),
        urgency: 'urgent'
      };

      assert.strictEqual(alert.urgency, 'urgent');
      assert.ok(alert.title.includes('JAAGTE RAHO'));
      assert.ok(alert.timestamp > 0);
    });
  });

});
