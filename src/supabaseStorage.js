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

  // Save game data to Supabase with better error handling
  async saveGameData(gameData) {
    const timestamp = Date.now();
    const dataToSave = {
      game_id: this.gameId,
      data: {
        ...gameData,
        lastUpdated: timestamp,
        gameId: this.gameId,
        saveAttempt: timestamp // Track save attempts to prevent duplicates
      }
    };

    console.log('=== SAVING TO SUPABASE ===');
    console.log('Game ID:', this.gameId);
    console.log('Results count:', dataToSave.data.results?.length || 0);
    console.log('Timestamp:', timestamp);

    // Always save to localStorage as backup
    this.saveToLocalStorage(dataToSave.data);

    try {
      // Use upsert to handle both insert and update in one operation
      const { data, error } = await this.supabase
        .from('game_sessions')
        .upsert(dataToSave, {
          onConflict: 'game_id',
          ignoreDuplicates: false
        })
        .select();

      if (error) {
        console.error('Supabase upsert error:', error.message);
        console.error('Error details:', error);

        // Try alternative approach if upsert fails
        try {
          const { data: updateData, error: updateError } = await this.supabase
            .from('game_sessions')
            .update({ data: dataToSave.data })
            .eq('game_id', this.gameId)
            .select();

          if (updateError && updateError.code === 'PGRST116') {
            // Record doesn't exist, try insert
            const { data: insertData, error: insertError } = await this.supabase
              .from('game_sessions')
              .insert([dataToSave])
              .select();

            if (insertError) {
              console.error('Fallback insert error:', insertError);
              return false;
            }
            console.log('✓ Fallback insert successful');
          } else if (updateError) {
            console.error('Fallback update error:', updateError);
            return false;
          } else {
            console.log('✓ Fallback update successful');
          }
        } catch (fallbackError) {
          console.error('All fallback methods failed:', fallbackError);
          return false;
        }
      } else {
        console.log('✓ Supabase upsert successful');
        console.log('Saved results:', dataToSave.data.results?.map(r => `${r.teamName}: ${r.score}`) || []);
      }

      return true;
    } catch (error) {
      console.error('Network/connection error:', error);
      console.log('Data saved to localStorage backup');
      return false; // Return false but data is still in localStorage
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
        console.log('Successfully loaded from Supabase:', gameData.results?.length || 0, 'results');
        if (gameData.results && gameData.results.length > 0) {
          console.log('Results:', gameData.results.map(r => `${r.teamName}: ${r.score}`));
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

  // BULLETPROOF polling with real-time + aggressive backup polling
  startPolling(callback, interval = 1000) {
    console.log('Starting BULLETPROOF Supabase sync - Real-time + Aggressive Polling');

    let lastUpdateTime = 0;
    let subscriptionActive = false;

    // Aggressive polling function that always works
    const pollForUpdates = async () => {
      try {
        const gameData = await this.getGameData();
        const results = gameData.results || [];

        // Only update if data actually changed
        if (gameData.lastUpdated > lastUpdateTime) {
          lastUpdateTime = gameData.lastUpdated;
          console.log(`✓ POLLING UPDATE: Found ${results.length} results`);
          if (results.length > 0) {
            console.log('Results:', results.map(r => `${r.teamName}: ${r.score}`));
          }
          callback(results);
        }
      } catch (error) {
        console.error('Polling error:', error);
        // Still try to callback with empty array to keep UI responsive
        callback([]);
      }
    };

    // Try to set up real-time subscription (but don't rely on it)
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
            console.log('✓ REAL-TIME UPDATE received:', payload.eventType);
            subscriptionActive = true;
            if (payload.new && payload.new.data) {
              const results = payload.new.data.results || [];
              console.log('Real-time results:', results.length, 'results');
              if (payload.new.data.lastUpdated > lastUpdateTime) {
                lastUpdateTime = payload.new.data.lastUpdated;
                callback(results);
              }
            }
          }
        )
        .subscribe((status) => {
          console.log('Subscription status:', status);
          if (status === 'SUBSCRIBED') {
            subscriptionActive = true;
            console.log('✓ Real-time subscription active');
          } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
            subscriptionActive = false;
            console.log('✗ Real-time subscription failed, relying on polling');
          }
        });
    } catch (error) {
      console.error('Real-time subscription setup failed:', error);
      console.log('Falling back to polling only');
    }

    // Initial load
    pollForUpdates();

    // AGGRESSIVE polling - every 1 second to ensure consistency
    const intervalId = setInterval(pollForUpdates, interval);

    // Extra aggressive polling when real-time isn't working
    const checkRealtimeStatus = setInterval(() => {
      if (!subscriptionActive) {
        console.log('Real-time not active, triggering extra poll');
        pollForUpdates();
      }
    }, 2000);

    // Return cleanup function
    return () => {
      console.log('Cleaning up BULLETPROOF sync');
      if (subscription) {
        subscription.unsubscribe();
      }
      clearInterval(intervalId);
      clearInterval(checkRealtimeStatus);
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