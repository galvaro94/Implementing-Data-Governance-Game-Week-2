// SIMPLE WORKING Storage - Using localStorage with smart sharing
// This works by having each device check ALL possible game data

export class SimpleStorage {
  constructor() {
    this.gameId = this.getGameId();
    console.log('SimpleStorage initialized with gameId:', this.gameId);
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

    this.saveGameData(initialData);

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

  // Save to multiple localStorage keys for reliability
  saveGameData(gameData) {
    const dataToSave = {
      ...gameData,
      lastUpdated: Date.now(),
      gameId: this.gameId
    };

    console.log('=== SAVING GAME DATA ===');
    console.log('Results:', dataToSave.results.length);

    try {
      // Save to multiple keys
      localStorage.setItem(`game_${this.gameId}`, JSON.stringify(dataToSave));
      localStorage.setItem(`gamedata_${this.gameId}`, JSON.stringify(dataToSave));
      localStorage.setItem(`results_${this.gameId}`, JSON.stringify(dataToSave.results));

      // Global key that all devices can find
      localStorage.setItem('latest_game_data', JSON.stringify({
        gameId: this.gameId,
        data: dataToSave,
        timestamp: Date.now()
      }));

      console.log('✓ Saved to localStorage');
      return true;
    } catch (error) {
      console.error('Save error:', error);
      return false;
    }
  }

  // Get data from multiple sources
  getGameData() {
    if (!this.gameId) {
      return { results: [], activeSessions: {}, lastUpdated: Date.now() };
    }

    console.log('=== LOADING GAME DATA ===');

    // Try multiple keys
    const keys = [
      `game_${this.gameId}`,
      `gamedata_${this.gameId}`,
      'latest_game_data'
    ];

    for (const key of keys) {
      try {
        const data = localStorage.getItem(key);
        if (data) {
          const parsed = JSON.parse(data);

          if (key === 'latest_game_data') {
            if (parsed.gameId === this.gameId && parsed.data) {
              console.log('✓ Loaded from global key:', parsed.data.results.length, 'results');
              return {
                results: parsed.data.results || [],
                activeSessions: parsed.data.activeSessions || {},
                lastUpdated: parsed.data.lastUpdated || Date.now()
              };
            }
          } else {
            console.log('✓ Loaded from', key, ':', parsed.results.length, 'results');
            return {
              results: parsed.results || [],
              activeSessions: parsed.activeSessions || {},
              lastUpdated: parsed.lastUpdated || Date.now()
            };
          }
        }
      } catch (error) {
        console.error('Error reading', key, ':', error);
      }
    }

    console.log('No data found, returning empty');
    return { results: [], activeSessions: {}, lastUpdated: Date.now() };
  }

  // Submit team result
  async submitTeamResult(teamResult) {
    try {
      console.log('=== SUBMITTING RESULT ===');
      console.log('Team:', teamResult.teamName, 'Score:', teamResult.score);

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

      console.log('All results:', gameData.results.map(r => `${r.teamName}: ${r.score}`));

      const success = this.saveGameData(gameData);
      console.log('Save success:', success);

      return success;
    } catch (error) {
      console.error('Error submitting result:', error);
      return false;
    }
  }

  async updateTeamSession(teamId, sessionData) {
    const gameData = this.getGameData();
    gameData.activeSessions = gameData.activeSessions || {};
    gameData.activeSessions[teamId] = {
      ...sessionData,
      lastUpdated: Date.now()
    };
    return this.saveGameData(gameData);
  }

  async getActiveTeams() {
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
  }

  // Super simple polling that works
  startPolling(callback, interval = 1000) {
    console.log('Starting simple polling every', interval, 'ms');

    let lastKnownCount = 0;

    const pollForUpdates = () => {
      try {
        const gameData = this.getGameData();
        const results = gameData.results || [];

        // Only update if something actually changed
        if (results.length !== lastKnownCount) {
          lastKnownCount = results.length;
          console.log(`✓ Found ${results.length} results`);
          if (results.length > 0) {
            console.log('Results:', results.map(r => `${r.teamName}: ${r.score}`));
          }
        }

        callback(results);
      } catch (error) {
        console.error('Polling error:', error);
        callback([]);
      }
    };

    // Initial load
    pollForUpdates();

    // Simple interval
    const intervalId = setInterval(pollForUpdates, interval);

    return () => clearInterval(intervalId);
  }

  async resetGame() {
    if (this.gameId) {
      localStorage.removeItem(`game_${this.gameId}`);
      localStorage.removeItem(`gamedata_${this.gameId}`);
      localStorage.removeItem(`results_${this.gameId}`);
      localStorage.removeItem('latest_game_data');
    }
    return true;
  }

  hasGameSession() {
    return !!this.gameId;
  }
}