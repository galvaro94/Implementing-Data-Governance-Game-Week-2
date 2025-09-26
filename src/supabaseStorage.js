// REAL Cross-Device Storage using Supabase
// This WILL work for true cross-device synchronization with real-time updates

import { createClient } from '@supabase/supabase-js';

export class SupabaseStorage {
  constructor() {
    // Your actual Supabase credentials
    this.supabaseUrl = 'https://nkqodxmuqbpyealbaklu.supabase.co';
    this.supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rcW9keG11cWJweWVhbGJha2x1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4OTc4MDIsImV4cCI6MjA3NDQ3MzgwMn0.cbqWqBRuRzagvZhwtqoi6Aa9JbVAnte7paYXaYZwZm0';

    // Initialize Supabase client
    this.supabase = createClient(this.supabaseUrl, this.supabaseAnonKey);

    this.gameId = this.getGameId();
    console.log('SupabaseStorage initialized with gameId:', this.gameId);
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

    // Save initial data to Supabase
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

  // Save game data to Supabase
  async saveGameData(gameData) {
    const dataToSave = {
      game_id: this.gameId,
      data: {
        ...gameData,
        lastUpdated: Date.now(),
        gameId: this.gameId
      }
    };

    console.log('=== SAVING TO SUPABASE ===');
    console.log('Game ID:', this.gameId);
    console.log('Results count:', dataToSave.data.results?.length || 0);
    if (dataToSave.data.results?.length > 0) {
      console.log('All teams being saved:', dataToSave.data.results.map(r => `${r.teamName}: ${r.score}`));
    }

    // Always save to localStorage as backup
    this.saveToLocalStorage(dataToSave.data);

    try {
      // Use upsert to handle both insert and update
      const { data, error } = await this.supabase
        .from('game_sessions')
        .upsert(dataToSave, { onConflict: 'game_id' })
        .select();

      if (error) {
        console.error('Supabase error:', error);
        return false;
      }

      console.log('✓ Successfully saved to Supabase');
      return true;
    } catch (error) {
      console.error('Network error:', error);
      return false;
    }
  }

  // Get game data from Supabase
  async getGameData() {
    if (!this.gameId) {
      console.log('No gameId, returning empty data');
      return { results: [], activeSessions: {}, lastUpdated: Date.now() };
    }

    console.log('=== LOADING FROM SUPABASE ===');
    console.log('Game ID:', this.gameId);

    try {
      const { data, error } = await this.supabase
        .from('game_sessions')
        .select('*')
        .eq('game_id', this.gameId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('Game not found in Supabase, using empty structure');
          return { results: [], activeSessions: {}, lastUpdated: Date.now() };
        }
        console.error('Supabase fetch error:', error);
      } else if (data && data.data) {
        const gameData = data.data;
        console.log('✓ Successfully loaded from Supabase:', gameData.results?.length || 0, 'results');

        // Log ALL results to debug the scoreboard issue
        if (gameData.results && gameData.results.length > 0) {
          console.log('=== ALL RESULTS FROM SUPABASE ===');
          gameData.results.forEach((result, index) => {
            console.log(`${index + 1}. ${result.teamName}: ${result.score} (Team ID: ${result.teamId})`);
          });
          console.log('=== END RESULTS ===');
        }

        // Cache in localStorage
        this.saveToLocalStorage(gameData);

        return {
          results: gameData.results || [],
          activeSessions: gameData.activeSessions || {},
          lastUpdated: gameData.lastUpdated || Date.now()
        };
      }
    } catch (error) {
      console.error('Network error loading from Supabase:', error);
    }

    // Fallback to localStorage
    const fallbackData = this.getFromLocalStorage();
    console.log('Using localStorage fallback:', fallbackData.results.length, 'results');
    return fallbackData;
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

  // Simple reliable polling with real-time backup
  startPolling(callback, interval = 2000) {
    console.log('Starting Supabase polling every', interval, 'ms');

    // Simple polling function
    const pollForUpdates = async () => {
      try {
        const gameData = await this.getGameData();
        const results = gameData.results || [];
        console.log(`Polling: Found ${results.length} results`);
        if (results.length > 0) {
          console.log('All results:', results.map(r => `${r.teamName}: ${r.score}`));
        }
        callback(results);
      } catch (error) {
        console.error('Polling error:', error);
        callback([]);
      }
    };

    // Try real-time subscription as bonus
    let subscription = null;
    try {
      subscription = this.supabase
        .channel(`game_${this.gameId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'game_sessions',
            filter: `game_id=eq.${this.gameId}`
          },
          (payload) => {
            console.log('Real-time update received');
            if (payload.new && payload.new.data) {
              const results = payload.new.data.results || [];
              console.log('Real-time results:', results.length, 'results');
              callback(results);
            }
          }
        )
        .subscribe();
    } catch (error) {
      console.log('Real-time setup failed, using polling only');
    }

    // Initial load
    pollForUpdates();

    // Regular polling
    const intervalId = setInterval(pollForUpdates, interval);

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
      clearInterval(intervalId);
    };
  }

  async resetGame() {
    if (this.gameId) {
      try {
        // Delete from Supabase
        await this.supabase
          .from('game_sessions')
          .delete()
          .eq('game_id', this.gameId);

        // Clear localStorage
        localStorage.removeItem(`game_data_${this.gameId}`);
        console.log('Reset game data for:', this.gameId);
      } catch (error) {
        console.error('Error resetting game:', error);
      }
    }
    return true;
  }

  // localStorage helper methods
  saveToLocalStorage(data) {
    try {
      localStorage.setItem(`game_data_${this.gameId}`, JSON.stringify(data));
      console.log('Saved backup to localStorage');
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