// Simple Cloud-like Storage using URL sharing and localStorage
// This creates a working multi-device sync without external services

export class SimpleCloudStorage {
  constructor() {
    this.gameId = this.getGameId();
    this.storageKey = `govex_game_${this.gameId}`;
    this.pollInterval = null;
    this.listeners = [];
  }

  // Get or create a unique game ID for this session
  getGameId() {
    // Check URL for gameId parameter
    const urlParams = new URLSearchParams(window.location.search);
    const urlGameId = urlParams.get('gameId');

    if (urlGameId) {
      localStorage.setItem('current_game_id', urlGameId);
      return urlGameId;
    }

    // Check localStorage
    const storedGameId = localStorage.getItem('current_game_id');
    if (storedGameId) {
      return storedGameId;
    }

    // Create new game ID
    return null;
  }

  // Create a new game session
  createNewGameSession() {
    // Generate unique game ID
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const gameId = `${timestamp}-${randomId}`;

    this.gameId = gameId;
    this.storageKey = `govex_game_${gameId}`;

    // Store in localStorage
    localStorage.setItem('current_game_id', gameId);

    // Initialize game data
    const initialData = {
      results: [],
      activeSessions: {},
      lastUpdated: Date.now(),
      gameId: gameId
    };

    this.saveGameData(initialData);

    // Update URL
    const newUrl = new URL(window.location);
    newUrl.searchParams.set('gameId', gameId);
    window.history.replaceState({}, '', newUrl.toString());

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

  // Save game data (to localStorage and attempt cross-browser sync)
  saveGameData(gameData) {
    try {
      const dataWithTimestamp = {
        ...gameData,
        lastUpdated: Date.now(),
        savedAt: Date.now()
      };

      // Save to localStorage
      localStorage.setItem(this.storageKey, JSON.stringify(dataWithTimestamp));

      // Try to sync across tabs/windows using BroadcastChannel
      if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel(this.storageKey);
        channel.postMessage({
          type: 'gameUpdate',
          data: dataWithTimestamp
        });
        channel.close();
      }

      console.log('Game data saved successfully:', this.gameId);
      return true;
    } catch (error) {
      console.error('Error saving game data:', error);
      return false;
    }
  }

  // Get game data
  getGameData() {
    try {
      if (!this.gameId) {
        return {
          results: [],
          activeSessions: {},
          lastUpdated: Date.now()
        };
      }

      const data = localStorage.getItem(this.storageKey);
      if (data) {
        const parsed = JSON.parse(data);
        return {
          results: parsed.results || [],
          activeSessions: parsed.activeSessions || {},
          lastUpdated: parsed.lastUpdated || Date.now()
        };
      }

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
      const gameData = this.getGameData();

      // Remove existing result for this team
      gameData.results = gameData.results.filter(
        result => result.teamId !== teamResult.teamId
      );

      // Add new result
      gameData.results.push({
        ...teamResult,
        timestamp: Date.now()
      });

      // Sort results
      gameData.results.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.completionTime - b.completionTime;
      });

      const success = this.saveGameData(gameData);
      console.log('Result submitted:', teamResult.teamName, 'Success:', success);

      // Notify listeners immediately
      this.notifyListeners(gameData.results);

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
          // Consider active if playing AND updated within last 2 minutes
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

  // Start polling for updates (real-time sync simulation)
  startPolling(callback, interval = 2000) {
    console.log('Starting polling for game:', this.gameId);

    // Store callback
    this.listeners.push(callback);

    // Listen for BroadcastChannel updates (same-browser cross-tab sync)
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel(this.storageKey);
      channel.onmessage = (event) => {
        if (event.data.type === 'gameUpdate') {
          console.log('Received broadcast update');
          callback(event.data.data.results || []);
        }
      };
    }

    // Poll localStorage for updates
    const pollForUpdates = () => {
      try {
        const gameData = this.getGameData();
        callback(gameData.results || []);
      } catch (error) {
        console.error('Polling error:', error);
        callback([]);
      }
    };

    // Initial load
    pollForUpdates();

    // Set up polling
    this.pollInterval = setInterval(pollForUpdates, interval);

    // Return cleanup function
    return () => {
      if (this.pollInterval) {
        clearInterval(this.pollInterval);
        this.pollInterval = null;
      }
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  // Notify all listeners
  notifyListeners(results) {
    this.listeners.forEach(callback => {
      try {
        callback(results);
      } catch (error) {
        console.error('Error notifying listener:', error);
      }
    });
  }

  // Reset game
  async resetGame() {
    try {
      if (this.gameId) {
        localStorage.removeItem(this.storageKey);
      }
      return true;
    } catch (error) {
      console.error('Error resetting game:', error);
      return false;
    }
  }

  // Check if we have a game session
  hasGameSession() {
    return !!this.gameId;
  }
}