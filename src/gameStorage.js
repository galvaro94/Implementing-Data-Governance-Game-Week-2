// Game Storage Management for Team Collaboration
const STORAGE_KEY = 'govex_data_governance_game';

export class GameStorage {
  constructor() {
    this.initializeStorage();
    this.setupStorageListener();
  }

  initializeStorage() {
    const existingData = localStorage.getItem(STORAGE_KEY);
    if (!existingData) {
      const initialData = {
        globalScoreboard: [],
        teamSessions: {},
        gameSettings: {
          maxTeams: 8,
          questionsPerGame: 4,
          timeLimit: 300
        },
        lastUpdated: Date.now()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
    }
  }

  setupStorageListener() {
    // Listen for storage changes from other tabs/windows
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY) {
        // Dispatch custom event for React components to listen to
        window.dispatchEvent(new CustomEvent('gameDataUpdated', {
          detail: JSON.parse(e.newValue)
        }));
      }
    });
  }

  getData() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error reading game data:', error);
      return null;
    }
  }

  saveData(data) {
    try {
      const updatedData = {
        ...data,
        lastUpdated: Date.now()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));

      // Trigger storage event manually for same-window updates
      window.dispatchEvent(new CustomEvent('gameDataUpdated', {
        detail: updatedData
      }));

      return true;
    } catch (error) {
      console.error('Error saving game data:', error);
      return false;
    }
  }

  submitTeamResult(teamResult) {
    const data = this.getData();
    if (!data) return false;

    // Remove existing result for this team if any
    data.globalScoreboard = data.globalScoreboard.filter(
      result => result.teamId !== teamResult.teamId
    );

    // Add new result
    data.globalScoreboard.push(teamResult);

    // Sort by score (descending) then by completion time (ascending)
    data.globalScoreboard.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.completionTime - b.completionTime;
    });

    return this.saveData(data);
  }

  getScoreboard() {
    const data = this.getData();
    return data ? data.globalScoreboard : [];
  }

  resetGame() {
    const data = this.getData();
    if (data) {
      data.globalScoreboard = [];
      data.teamSessions = {};
      return this.saveData(data);
    }
    return false;
  }

  saveTeamSession(teamId, sessionData) {
    const data = this.getData();
    if (!data) return false;

    data.teamSessions[teamId] = {
      ...sessionData,
      lastUpdated: Date.now()
    };

    return this.saveData(data);
  }

  getTeamSession(teamId) {
    const data = this.getData();
    return data && data.teamSessions[teamId] ? data.teamSessions[teamId] : null;
  }

  isTeamActive(teamId) {
    const session = this.getTeamSession(teamId);
    if (!session) return false;

    // Consider team active if last updated within 10 minutes
    const tenMinutes = 10 * 60 * 1000;
    return (Date.now() - session.lastUpdated) < tenMinutes;
  }

  getActiveTeams() {
    const data = this.getData();
    if (!data) return [];

    return Object.keys(data.teamSessions).filter(teamId =>
      this.isTeamActive(parseInt(teamId))
    ).map(teamId => parseInt(teamId));
  }
}