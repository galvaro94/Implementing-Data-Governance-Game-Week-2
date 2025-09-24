// Firebase configuration for cross-device synchronization
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, onValue, push, serverTimestamp } from 'firebase/database';

// Public Firebase config - safe for client-side use
const firebaseConfig = {
  apiKey: "AIzaSyBvOyisuFiQiSqJvDxKhLKObU6TFVeMhHQ",
  authDomain: "govex-data-governance-game.firebaseapp.com",
  databaseURL: "https://govex-data-governance-game-default-rtdb.firebaseio.com",
  projectId: "govex-data-governance-game",
  storageBucket: "govex-data-governance-game.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Game session management
export class FirebaseGameStorage {
  constructor() {
    this.sessionId = this.generateSessionId();
  }

  generateSessionId() {
    // Generate a unique session ID for this game session
    // In production, you might get this from URL params or user input
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    return `game-${date}-${Math.random().toString(36).substring(2, 8)}`;
  }

  // Submit team result to Firebase
  async submitTeamResult(teamResult) {
    try {
      const resultRef = ref(database, `sessions/${this.sessionId}/results/${teamResult.teamId}`);
      await set(resultRef, {
        ...teamResult,
        timestamp: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error submitting result:', error);
      // Fallback to localStorage if Firebase fails
      this.fallbackToLocalStorage(teamResult);
      return false;
    }
  }

  // Get all team results
  async getTeamResults() {
    try {
      const resultsRef = ref(database, `sessions/${this.sessionId}/results`);
      const snapshot = await get(resultsRef);
      if (snapshot.exists()) {
        const results = Object.values(snapshot.val());
        // Sort by score (desc) then by completion time (asc)
        return results.sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          return a.completionTime - b.completionTime;
        });
      }
      return [];
    } catch (error) {
      console.error('Error fetching results:', error);
      return this.getFallbackResults();
    }
  }

  // Listen for real-time updates
  onResultsUpdate(callback) {
    try {
      const resultsRef = ref(database, `sessions/${this.sessionId}/results`);
      return onValue(resultsRef, (snapshot) => {
        if (snapshot.exists()) {
          const results = Object.values(snapshot.val());
          const sortedResults = results.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return a.completionTime - b.completionTime;
          });
          callback(sortedResults);
        } else {
          callback([]);
        }
      });
    } catch (error) {
      console.error('Error setting up listener:', error);
      // Fallback to polling localStorage
      const interval = setInterval(() => {
        callback(this.getFallbackResults());
      }, 2000);
      return () => clearInterval(interval);
    }
  }

  // Track active team sessions
  async updateTeamSession(teamId, sessionData) {
    try {
      const sessionRef = ref(database, `sessions/${this.sessionId}/activeSessions/${teamId}`);
      await set(sessionRef, {
        ...sessionData,
        lastUpdated: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error updating session:', error);
      return false;
    }
  }

  // Get active teams
  async getActiveTeams() {
    try {
      const sessionsRef = ref(database, `sessions/${this.sessionId}/activeSessions`);
      const snapshot = await get(sessionsRef);
      if (snapshot.exists()) {
        const sessions = snapshot.val();
        const now = Date.now();
        const activeTeams = [];

        Object.entries(sessions).forEach(([teamId, session]) => {
          // Consider active if updated within last 5 minutes
          if (session.lastUpdated && (now - session.lastUpdated) < 300000) {
            activeTeams.push(parseInt(teamId));
          }
        });

        return activeTeams;
      }
      return [];
    } catch (error) {
      console.error('Error fetching active teams:', error);
      return [];
    }
  }

  // Reset all game data
  async resetGame() {
    try {
      const sessionRef = ref(database, `sessions/${this.sessionId}`);
      await set(sessionRef, null);
      // Also clear localStorage fallback
      localStorage.removeItem('govex_data_governance_game');
      return true;
    } catch (error) {
      console.error('Error resetting game:', error);
      return false;
    }
  }

  // Fallback methods for when Firebase is unavailable
  fallbackToLocalStorage(teamResult) {
    const STORAGE_KEY = 'govex_data_governance_game';
    try {
      let data = localStorage.getItem(STORAGE_KEY);
      data = data ? JSON.parse(data) : { globalScoreboard: [] };

      // Remove existing result for this team
      data.globalScoreboard = data.globalScoreboard.filter(
        result => result.teamId !== teamResult.teamId
      );

      // Add new result
      data.globalScoreboard.push(teamResult);

      // Sort results
      data.globalScoreboard.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.completionTime - b.completionTime;
      });

      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Fallback storage failed:', error);
    }
  }

  getFallbackResults() {
    const STORAGE_KEY = 'govex_data_governance_game';
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data).globalScoreboard || [] : [];
    } catch (error) {
      console.error('Error reading fallback data:', error);
      return [];
    }
  }

  // Get current session ID for sharing with others
  getSessionId() {
    return this.sessionId;
  }

  // Join specific session (for when multiple sessions are running)
  setSessionId(sessionId) {
    this.sessionId = sessionId;
  }
}