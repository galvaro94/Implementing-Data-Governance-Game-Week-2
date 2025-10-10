// Cloud Storage for Cross-Device Synchronization
// Uses JSONBin.io as a free, serverless database

export class CloudGameStorage {
  constructor() {
    this.binId = this.getBinId();
    this.apiUrl = 'https://api.jsonbin.io/v3/b';
    this.headers = {
      'Content-Type': 'application/json',
    };
  }

  // Get or create a unique bin ID for this game session
  getBinId() {
    // Try to get existing bin ID from URL or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const urlBinId = urlParams.get('gameId');

    if (urlBinId) {
      localStorage.setItem('govex_game_bin_id', urlBinId);
      return urlBinId;
    }

    const storedBinId = localStorage.getItem('govex_game_bin_id');
    if (storedBinId) {
      return storedBinId;
    }

    // Create new game session
    return null; // Will be created on first data submission
  }

  // Submit team result to cloud
  async submitTeamResult(teamResult) {
    try {
      const gameData = await this.getGameData();

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

      gameData.lastUpdated = Date.now();

      const success = await this.saveGameData(gameData);
      if (success) {
        // Update URL with game ID for sharing
        this.updateGameUrl();
      }
      return success;
    } catch (error) {
      console.error('Error submitting result to cloud:', error);
      // Fallback to localStorage
      this.fallbackToLocalStorage(teamResult);
      return false;
    }
  }

  // Get all results from cloud
  async getGameData() {
    if (!this.binId) {
      // Check if there's a recent active game we can join
      const fallbackData = this.getFallbackData();
      if (fallbackData.results.length > 0) {
        return fallbackData;
      }
      return {
        results: [],
        activeSessions: {},
        lastUpdated: Date.now()
      };
    }

    try {
      const response = await fetch(`${this.apiUrl}/${this.binId}/latest`, {
        headers: this.headers
      });

      if (response.ok) {
        const data = await response.json();
        return data.record || {
          results: [],
          activeSessions: {},
          lastUpdated: Date.now()
        };
      } else {
        console.warn(`Failed to fetch from cloud: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching cloud data:', error);
    }

    // Fallback to localStorage
    return this.getFallbackData();
  }

  // Save game data to cloud
  async saveGameData(gameData) {
    try {
      const url = this.binId ?
        `${this.apiUrl}/${this.binId}` :
        this.apiUrl;

      console.log('Saving to URL:', url, 'Method:', this.binId ? 'PUT' : 'POST');

      const response = await fetch(url, {
        method: this.binId ? 'PUT' : 'POST',
        headers: this.headers,
        body: JSON.stringify(gameData)
      });

      console.log('Response status:', response.status, 'OK:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('Response data:', data);

        if (!this.binId && data.metadata && data.metadata.id) {
          // Store new bin ID
          this.binId = data.metadata.id;
          localStorage.setItem('govex_game_bin_id', this.binId);
          console.log('Stored new bin ID:', this.binId);
        }
        return true;
      } else {
        const errorText = await response.text();
        console.error('Failed to save:', response.status, errorText);
      }
    } catch (error) {
      console.error('Error saving to cloud:', error);
    }

    // Fallback to localStorage
    this.saveFallbackData(gameData);
    return false;
  }

  // Update team session
  async updateTeamSession(teamId, sessionData) {
    try {
      const gameData = await this.getGameData();

      gameData.activeSessions = gameData.activeSessions || {};
      gameData.activeSessions[teamId] = {
        ...sessionData,
        isPlaying: sessionData.isPlaying || false,
        lastUpdated: Date.now()
      };

      return await this.saveGameData(gameData);
    } catch (error) {
      console.error('Error updating session:', error);
      return false;
    }
  }

  // Get active teams
  async getActiveTeams() {
    try {
      const gameData = await this.getGameData();
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

  // Reset game
  async resetGame() {
    try {
      const emptyData = {
        results: [],
        activeSessions: {},
        lastUpdated: Date.now()
      };

      await this.saveGameData(emptyData);
      localStorage.removeItem('govex_data_governance_game_fallback');
      return true;
    } catch (error) {
      console.error('Error resetting game:', error);
      return false;
    }
  }

  // Get shareable game URL
  getGameUrl() {
    if (this.binId) {
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set('gameId', this.binId);
      return currentUrl.toString();
    }
    return window.location.href;
  }

  // Update browser URL with game ID
  updateGameUrl() {
    if (this.binId) {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('gameId', this.binId);
      window.history.replaceState({}, '', newUrl.toString());
    }
  }

  // Real-time polling for updates (since we don't have websockets)
  startPolling(callback, interval = 3000) {
    const pollForUpdates = async () => {
      try {
        const gameData = await this.getGameData();
        callback(gameData.results || []);
      } catch (error) {
        console.error('Polling error:', error);
        // Fallback to localStorage data
        callback(this.getFallbackResults());
      }
    };

    // Initial load
    pollForUpdates();

    // Set up polling
    const intervalId = setInterval(pollForUpdates, interval);

    // Return cleanup function
    return () => clearInterval(intervalId);
  }

  // Fallback methods for offline functionality
  fallbackToLocalStorage(teamResult) {
    const STORAGE_KEY = 'govex_data_governance_game_fallback';
    try {
      let data = localStorage.getItem(STORAGE_KEY);
      data = data ? JSON.parse(data) : { results: [] };

      // Remove existing result for this team
      data.results = data.results.filter(
        result => result.teamId !== teamResult.teamId
      );

      // Add new result
      data.results.push(teamResult);

      // Sort results
      data.results.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.completionTime - b.completionTime;
      });

      data.lastUpdated = Date.now();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Fallback storage failed:', error);
    }
  }

  getFallbackData() {
    const STORAGE_KEY = 'govex_data_governance_game_fallback';
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : { results: [], activeSessions: {}, lastUpdated: Date.now() };
    } catch (error) {
      console.error('Error reading fallback data:', error);
      return { results: [], activeSessions: {}, lastUpdated: Date.now() };
    }
  }

  getFallbackResults() {
    return this.getFallbackData().results || [];
  }

  saveFallbackData(gameData) {
    const STORAGE_KEY = 'govex_data_governance_game_fallback';
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gameData));
    } catch (error) {
      console.error('Error saving fallback data:', error);
    }
  }

  // Get a shareable game URL that others can use to join
  getShareableGameUrl() {
    if (this.binId) {
      const baseUrl = window.location.origin + window.location.pathname;
      return `${baseUrl}?gameId=${this.binId}`;
    }
    return window.location.href;
  }

  // Check if we're in a shared game session
  isSharedSession() {
    return !!this.binId;
  }

  // Force join an existing game session by ID
  joinGameSession(gameId) {
    this.binId = gameId;
    localStorage.setItem('govex_game_bin_id', gameId);
    this.updateGameUrl();
  }

  // Create a new game session
  async createNewGameSession() {
    try {
      // Generate a unique session ID locally
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 8);
      const gameId = `${timestamp}${randomId}`;

      console.log('Creating local game session with ID:', gameId);

      // Set the game ID locally and create shareable URL immediately
      this.binId = gameId;
      localStorage.setItem('govex_game_bin_id', gameId);
      this.updateGameUrl();

      // Create shareable URL
      const shareableUrl = this.getShareableGameUrl();
      console.log('Created game session successfully:', shareableUrl);

      // Initialize local storage with empty game data
      const initialData = {
        results: [],
        activeSessions: {},
        lastUpdated: Date.now(),
        sessionName: `game-${Date.now()}`,
        createdAt: Date.now()
      };

      // Save to localStorage as backup
      this.saveFallbackData(initialData);

      return {
        success: true,
        gameUrl: shareableUrl,
        sessionId: this.binId
      };
    } catch (error) {
      console.error('Error creating new game session:', error);
      return { success: false, error: error.message };
    }
  }
}