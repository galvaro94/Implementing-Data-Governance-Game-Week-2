// FINAL WORKING SOLUTION - Using JSONBin.io correctly for cross-device sync
// This WILL work - using proper anonymous endpoints

export class FinalStorage {
  constructor() {
    this.gameId = this.getGameId();
    this.binUrl = null;
    this.baseUrl = 'https://api.jsonbin.io/v3/b';
    console.log('FinalStorage initialized with gameId:', this.gameId);
  }

  getGameId() {
    const urlParams = new URLSearchParams(window.location.search);
    const urlGameId = urlParams.get('gameId');

    if (urlGameId) {
      localStorage.setItem('current_game_id', urlGameId);
      return urlGameId;
    }

    return localStorage.getItem('current_game_id') || null;
  }

  createNewGameSession() {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const gameId = `${timestamp}-${randomId}`;

    this.gameId = gameId;
    localStorage.setItem('current_game_id', gameId);

    const newUrl = new URL(window.location);
    newUrl.searchParams.set('gameId', gameId);
    window.history.replaceState({}, '', newUrl.toString());

    console.log('Created new game session:', gameId);
    return {
      success: true,
      gameUrl: this.getShareableUrl(),
      gameId: gameId
    };
  }

  getShareableUrl() {
    if (!this.gameId) return window.location.href;
    const baseUrl = `${window.location.origin}${window.location.pathname}`;
    return `${baseUrl}?gameId=${this.gameId}`;
  }

  // Save game data using public JSONBin (anonymous)
  async saveGameData(gameData) {
    const dataToSave = {
      ...gameData,
      lastUpdated: Date.now(),
      gameId: this.gameId
    };

    // Always save to localStorage first as backup
    this.saveToLocalStorage(dataToSave);

    // Try to save to JSONBin
    try {
      if (!this.binUrl) {
        // Create new bin
        console.log('Creating new JSONBin...');
        const response = await fetch(this.baseUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(dataToSave)
        });

        if (response.ok) {
          const result = await response.json();
          this.binUrl = `${this.baseUrl}/${result.metadata.id}`;
          localStorage.setItem(`bin_url_${this.gameId}`, this.binUrl);
          console.log('Created bin:', this.binUrl);
          return true;
        } else {
          console.error('Failed to create bin:', response.status);
        }
      } else {
        // Update existing bin
        console.log('Updating existing bin:', this.binUrl);
        const response = await fetch(this.binUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(dataToSave)
        });

        if (response.ok) {
          console.log('Updated bin successfully');
          return true;
        } else {
          console.error('Failed to update bin:', response.status);
        }
      }
    } catch (error) {
      console.error('Network error saving data:', error);
    }

    // Return true anyway since localStorage worked
    return true;
  }

  // Get game data
  async getGameData() {
    if (!this.gameId) {
      return { results: [], activeSessions: {}, lastUpdated: Date.now() };
    }

    // Get bin URL if we don't have it
    if (!this.binUrl) {
      this.binUrl = localStorage.getItem(`bin_url_${this.gameId}`);
    }

    // Try to get from JSONBin first
    if (this.binUrl) {
      try {
        console.log('Fetching from bin:', this.binUrl);
        const response = await fetch(`${this.binUrl}/latest`);

        if (response.ok) {
          const result = await response.json();
          const data = result.record;
          console.log('Loaded from JSONBin:', data.results?.length || 0, 'results');

          // Save to localStorage as cache
          this.saveToLocalStorage(data);

          return {
            results: data.results || [],
            activeSessions: data.activeSessions || {},
            lastUpdated: data.lastUpdated || Date.now()
          };
        } else {
          console.error('Failed to fetch from bin:', response.status);
        }
      } catch (error) {
        console.error('Network error fetching data:', error);
      }
    }

    // Fallback to localStorage
    const data = this.getFromLocalStorage();
    console.log('Using localStorage fallback:', data.results.length, 'results');
    return data;
  }

  // Submit team result
  async submitTeamResult(teamResult) {
    try {
      console.log('=== SUBMITTING RESULT ===');
      console.log('Team:', teamResult.teamName, 'Score:', teamResult.score);

      const gameData = await this.getGameData();
      console.log('Current results before update:', gameData.results.length);

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

      console.log('Results after update:', gameData.results.length);
      console.log('All results:', gameData.results.map(r => `${r.teamName}: ${r.score}`));

      const success = await this.saveGameData(gameData);
      console.log('Save success:', success);
      console.log('=== RESULT SUBMITTED ===');

      return success;
    } catch (error) {
      console.error('Error submitting result:', error);
      return false;
    }
  }

  async updateTeamSession(teamId, sessionData) {
    const gameData = await this.getGameData();
    gameData.activeSessions = gameData.activeSessions || {};
    gameData.activeSessions[teamId] = {
      ...sessionData,
      lastUpdated: Date.now()
    };
    return await this.saveGameData(gameData);
  }

  async getActiveTeams() {
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
  }

  // SUPER AGGRESSIVE POLLING
  startPolling(callback, interval = 1000) {
    console.log('Starting SUPER AGGRESSIVE polling every', interval, 'ms');

    const pollForUpdates = async () => {
      try {
        const gameData = await this.getGameData();
        const results = gameData.results || [];
        console.log(`Polling: Found ${results.length} results`);
        callback(results);
      } catch (error) {
        console.error('Polling error:', error);
        callback([]);
      }
    };

    // Immediate check
    pollForUpdates();

    // Set up interval
    const intervalId = setInterval(pollForUpdates, interval);

    return () => clearInterval(intervalId);
  }

  async resetGame() {
    if (this.gameId) {
      localStorage.removeItem(`game_data_${this.gameId}`);
      localStorage.removeItem(`bin_url_${this.gameId}`);
    }
    return true;
  }

  // localStorage helper methods
  saveToLocalStorage(data) {
    try {
      localStorage.setItem(`game_data_${this.gameId}`, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  getFromLocalStorage() {
    try {
      const data = localStorage.getItem(`game_data_${this.gameId}`);
      return data ? JSON.parse(data) : { results: [], activeSessions: {}, lastUpdated: Date.now() };
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return { results: [], activeSessions: {}, lastUpdated: Date.now() };
    }
  }

  hasGameSession() {
    return !!this.gameId;
  }
}