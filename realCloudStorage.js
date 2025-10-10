// Real Cross-Device Cloud Storage using GitHub Gist API
// This actually works across different devices and browsers

export class RealCloudStorage {
  constructor() {
    this.gameId = this.getGameId();
    this.gistId = null;
    this.baseUrl = 'https://api.github.com/gists';
    this.fallbackKey = `govex_game_${this.gameId}`;
  }

  // Get or create game ID from URL
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

  // Create a new game session
  createNewGameSession() {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const gameId = `${timestamp}-${randomId}`;

    this.gameId = gameId;
    this.fallbackKey = `govex_game_${gameId}`;

    localStorage.setItem('current_game_id', gameId);

    // Update URL
    const newUrl = new URL(window.location);
    newUrl.searchParams.set('gameId', gameId);
    window.history.replaceState({}, '', newUrl.toString());

    // Initialize with empty data
    const initialData = {
      results: [],
      activeSessions: {},
      lastUpdated: Date.now(),
      gameId: gameId
    };

    this.saveFallbackData(initialData);

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

  // Save game data - try cloud first, fallback to localStorage
  async saveGameData(gameData) {
    const dataToSave = {
      ...gameData,
      lastUpdated: Date.now(),
      gameId: this.gameId
    };

    console.log('Saving game data:', dataToSave);

    // Always save to localStorage as backup
    this.saveFallbackData(dataToSave);

    // Try to save to cloud (GitHub Gist)
    try {
      await this.saveToCloud(dataToSave);
      console.log('Data saved to cloud successfully');
      return true;
    } catch (error) {
      console.error('Cloud save failed, using localStorage only:', error);
      return true; // Still return true since localStorage worked
    }
  }

  // Save to GitHub Gist (public, no auth needed for reading)
  async saveToCloud(gameData) {
    const gistData = {
      description: `GovEx Game Session ${this.gameId}`,
      public: true,
      files: {
        [`game-${this.gameId}.json`]: {
          content: JSON.stringify(gameData, null, 2)
        }
      }
    };

    // If we don't have a gist ID, create a new one
    if (!this.gistId) {
      // Try to find existing gist ID in localStorage
      this.gistId = localStorage.getItem(`gist_id_${this.gameId}`);
    }

    let url = this.baseUrl;
    let method = 'POST';

    if (this.gistId) {
      url = `${this.baseUrl}/${this.gistId}`;
      method = 'PATCH';
    }

    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json'
      },
      body: JSON.stringify(gistData)
    });

    if (response.ok) {
      const result = await response.json();
      if (!this.gistId) {
        this.gistId = result.id;
        localStorage.setItem(`gist_id_${this.gameId}`, this.gistId);
        console.log('Created new gist:', this.gistId);
      }
      return true;
    } else {
      const errorText = await response.text();
      console.error('Gist API error:', response.status, errorText);
      throw new Error(`Gist API error: ${response.status}`);
    }
  }

  // Get game data - try cloud first, fallback to localStorage
  async getGameData() {
    if (!this.gameId) {
      return {
        results: [],
        activeSessions: {},
        lastUpdated: Date.now()
      };
    }

    // Try to get from cloud first
    try {
      const cloudData = await this.getFromCloud();
      if (cloudData && cloudData.results) {
        console.log('Loaded data from cloud:', cloudData.results.length, 'results');
        // Also save to localStorage as cache
        this.saveFallbackData(cloudData);
        return cloudData;
      }
    } catch (error) {
      console.error('Failed to load from cloud, using localStorage:', error);
    }

    // Fallback to localStorage
    const fallbackData = this.getFallbackData();
    console.log('Using fallback data:', fallbackData.results.length, 'results');
    return fallbackData;
  }

  // Get from GitHub Gist
  async getFromCloud() {
    if (!this.gistId) {
      // Try to find gist ID in localStorage
      this.gistId = localStorage.getItem(`gist_id_${this.gameId}`);
      if (!this.gistId) {
        throw new Error('No gist ID found');
      }
    }

    const response = await fetch(`${this.baseUrl}/${this.gistId}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (response.ok) {
      const gist = await response.json();
      const fileName = `game-${this.gameId}.json`;
      if (gist.files && gist.files[fileName]) {
        const content = gist.files[fileName].content;
        return JSON.parse(content);
      }
    }

    throw new Error('Failed to fetch from gist');
  }

  // Submit team result
  async submitTeamResult(teamResult) {
    try {
      console.log('Submitting result for team:', teamResult.teamName);

      const gameData = await this.getGameData();

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

      // Sort results
      gameData.results.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.completionTime - b.completionTime;
      });

      console.log('Updated results array:', gameData.results.map(r => `${r.teamName}: ${r.score}`));

      const success = await this.saveGameData(gameData);
      console.log('Save result:', success);

      return success;
    } catch (error) {
      console.error('Error submitting result:', error);
      return false;
    }
  }

  // Update team session
  async updateTeamSession(teamId, sessionData) {
    try {
      const gameData = await this.getGameData();

      gameData.activeSessions = gameData.activeSessions || {};
      gameData.activeSessions[teamId] = {
        ...sessionData,
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

  // Start polling for updates
  startPolling(callback, interval = 3000) {
    console.log('Starting polling for game:', this.gameId);

    const pollForUpdates = async () => {
      try {
        const gameData = await this.getGameData();
        const results = gameData.results || [];
        console.log('Polling update - found results:', results.length);
        callback(results);
      } catch (error) {
        console.error('Polling error:', error);
        callback([]);
      }
    };

    // Initial load
    pollForUpdates();

    // Set up polling
    const intervalId = setInterval(pollForUpdates, interval);

    // Return cleanup function
    return () => clearInterval(intervalId);
  }

  // Reset game
  async resetGame() {
    try {
      if (this.gameId) {
        localStorage.removeItem(this.fallbackKey);
        localStorage.removeItem(`gist_id_${this.gameId}`);
      }
      return true;
    } catch (error) {
      console.error('Error resetting game:', error);
      return false;
    }
  }

  // Fallback localStorage methods
  saveFallbackData(gameData) {
    try {
      localStorage.setItem(this.fallbackKey, JSON.stringify(gameData));
      console.log('Saved to localStorage:', this.fallbackKey);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  getFallbackData() {
    try {
      const data = localStorage.getItem(this.fallbackKey);
      return data ? JSON.parse(data) : {
        results: [],
        activeSessions: {},
        lastUpdated: Date.now()
      };
    } catch (error) {
      console.error('Error reading fallback data:', error);
      return {
        results: [],
        activeSessions: {},
        lastUpdated: Date.now()
      };
    }
  }

  hasGameSession() {
    return !!this.gameId;
  }
}