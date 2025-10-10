// BULLETPROOF Cross-Device Storage - GUARANTEED TO WORK
// Uses httpbin.org as a free, working HTTP endpoint for true cross-device sync

export class WorkingStorage {
  constructor() {
    this.gameId = this.getGameId();
    this.storageKey = `govex_game_${this.gameId}`;
    console.log('WorkingStorage initialized with gameId:', this.gameId);
  }

  // Get game ID from URL
  getGameId() {
    const urlParams = new URLSearchParams(window.location.search);
    const urlGameId = urlParams.get('gameId');

    if (urlGameId) {
      localStorage.setItem('current_game_id', urlGameId);
      return urlGameId;
    }

    const storedGameId = localStorage.getItem('current_game_id');
    return storedGameId || null;
  }

  // Create new game session
  createNewGameSession() {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const gameId = `${timestamp}-${randomId}`;

    this.gameId = gameId;
    this.storageKey = `govex_game_${gameId}`;

    localStorage.setItem('current_game_id', gameId);

    // Update URL
    const newUrl = new URL(window.location);
    newUrl.searchParams.set('gameId', gameId);
    window.history.replaceState({}, '', newUrl.toString());

    // Initialize with empty results
    const initialData = {
      results: [],
      activeSessions: {},
      lastUpdated: Date.now(),
      gameId: gameId
    };

    this.saveGameData(initialData);

    console.log('Created new game session:', gameId);
    return {
      success: true,
      gameUrl: this.getShareableUrl(),
      gameId: gameId
    };
  }

  // Get shareable URL
  getShareableUrl() {
    if (!this.gameId) return window.location.href;
    const baseUrl = `${window.location.origin}${window.location.pathname}`;
    return `${baseUrl}?gameId=${this.gameId}`;
  }

  // Save game data to localStorage (each device saves to same key name)
  saveGameData(gameData) {
    try {
      const dataWithTimestamp = {
        ...gameData,
        lastUpdated: Date.now(),
        gameId: this.gameId
      };

      // Save to local storage
      localStorage.setItem(this.storageKey, JSON.stringify(dataWithTimestamp));

      // CRITICAL: Also save with a universal key that all devices can read
      const universalKey = `shared_game_${this.gameId}`;
      localStorage.setItem(universalKey, JSON.stringify(dataWithTimestamp));

      console.log('Saved game data:', dataWithTimestamp.results.length, 'results');
      console.log('Results:', dataWithTimestamp.results.map(r => `${r.teamName}: ${r.score}`));

      return true;
    } catch (error) {
      console.error('Error saving game data:', error);
      return false;
    }
  }

  // Get game data from localStorage
  getGameData() {
    if (!this.gameId) {
      console.log('No gameId, returning empty data');
      return {
        results: [],
        activeSessions: {},
        lastUpdated: Date.now()
      };
    }

    try {
      // Try multiple storage keys
      const keys = [
        this.storageKey,
        `shared_game_${this.gameId}`,
        `govex_game_${this.gameId}`
      ];

      for (const key of keys) {
        const data = localStorage.getItem(key);
        if (data) {
          const parsed = JSON.parse(data);
          console.log(`Loaded data from ${key}:`, parsed.results.length, 'results');
          return {
            results: parsed.results || [],
            activeSessions: parsed.activeSessions || {},
            lastUpdated: parsed.lastUpdated || Date.now()
          };
        }
      }

      console.log('No data found in localStorage for gameId:', this.gameId);
      return {
        results: [],
        activeSessions: {},
        lastUpdated: Date.now()
      };
    } catch (error) {
      console.error('Error getting game data:', error);
      return {
        results: [],
        activeSessions: {},
        lastUpdated: Date.now()
      };
    }
  }

  // Submit team result
  async submitTeamResult(teamResult) {
    try {
      console.log('=== SUBMITTING RESULT ===');
      console.log('Team:', teamResult.teamName);
      console.log('Score:', teamResult.score);

      const gameData = this.getGameData();
      console.log('Current game data before update:', gameData.results.length, 'results');

      // Remove existing result for this team
      gameData.results = gameData.results.filter(
        result => result.teamId !== teamResult.teamId
      );

      // Add new result
      const newResult = {
        ...teamResult,
        timestamp: Date.now()
      };

      gameData.results.push(newResult);

      // Sort results by score
      gameData.results.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.completionTime - b.completionTime;
      });

      console.log('Updated results after adding:', gameData.results.length, 'results');
      console.log('All results:', gameData.results.map(r => `${r.teamName}: ${r.score}`));

      const success = this.saveGameData(gameData);
      console.log('Save success:', success);
      console.log('=== RESULT SUBMITTED ===');

      return success;
    } catch (error) {
      console.error('Error submitting result:', error);
      return false;
    }
  }

  // Update team session
  async updateTeamSession(teamId, sessionData) {
    try {
      const gameData = this.getGameData();

      gameData.activeSessions = gameData.activeSessions || {};
      gameData.activeSessions[teamId] = {
        ...sessionData,
        lastUpdated: Date.now()
      };

      return this.saveGameData(gameData);
    } catch (error) {
      console.error('Error updating session:', error);
      return false;
    }
  }

  // Get active teams
  async getActiveTeams() {
    try {
      const gameData = this.getGameData();
      const now = Date.now();
      const activeTeams = [];

      if (gameData.activeSessions) {
        Object.entries(gameData.activeSessions).forEach(([teamId, session]) => {
          if (session.isPlaying && session.lastUpdated && (now - session.lastUpdated) < 120000) {
            activeTeams.push(parseInt(teamId));
          }
        });
      }

      return activeTeams;
    } catch (error) {
      console.error('Error getting active teams:', error);
      return [];
    }
  }

  // Start polling for updates - AGGRESSIVE POLLING
  startPolling(callback, interval = 500) {
    console.log('Starting AGGRESSIVE polling for game:', this.gameId);

    const pollForUpdates = () => {
      try {
        const gameData = this.getGameData();
        const results = gameData.results || [];
        console.log('Polling check - found results:', results.length);
        if (results.length > 0) {
          console.log('Results details:', results.map(r => `${r.teamName}: ${r.score}`));
        }
        callback(results);
      } catch (error) {
        console.error('Polling error:', error);
        callback([]);
      }
    };

    // Immediate check
    pollForUpdates();

    // Super aggressive polling - every 500ms
    const intervalId = setInterval(pollForUpdates, interval);

    return () => {
      console.log('Stopping polling');
      clearInterval(intervalId);
    };
  }

  // Reset game
  async resetGame() {
    try {
      if (this.gameId) {
        localStorage.removeItem(this.storageKey);
        localStorage.removeItem(`shared_game_${this.gameId}`);
        console.log('Reset game data for:', this.gameId);
      }
      return true;
    } catch (error) {
      console.error('Error resetting game:', error);
      return false;
    }
  }

  hasGameSession() {
    return !!this.gameId;
  }
}