import { useState, useEffect, useRef } from 'react';
import { CloudGameStorage } from './cloudStorage';

export const useGameStorage = () => {
  const [scoreboard, setScoreboard] = useState([]);
  const [activeTeams, setActiveTeams] = useState([]);
  const [isConnected, setIsConnected] = useState(true);
  const [gameUrl, setGameUrl] = useState('');
  const storageRef = useRef(null);
  const cleanupRef = useRef(null);

  useEffect(() => {
    // Initialize cloud storage
    storageRef.current = new CloudGameStorage();
    setGameUrl(storageRef.current.getGameUrl());

    // Load initial data
    const loadInitialData = async () => {
      try {
        const gameData = await storageRef.current.getGameData();
        setScoreboard(gameData.results || []);

        const activeTeamIds = await storageRef.current.getActiveTeams();
        setActiveTeams(activeTeamIds);

        setIsConnected(true);
      } catch (error) {
        console.error('Failed to load initial data:', error);
        setIsConnected(false);
      }
    };

    loadInitialData();

    // Start polling for real-time updates
    cleanupRef.current = storageRef.current.startPolling(
      (results) => {
        setScoreboard(results);
        setIsConnected(true);
      },
      2000 // Poll every 2 seconds for near real-time updates
    );

    // Update active teams periodically
    const activeTeamsInterval = setInterval(async () => {
      try {
        const currentActiveTeams = await storageRef.current.getActiveTeams();
        setActiveTeams(currentActiveTeams);
      } catch (error) {
        console.error('Error updating active teams:', error);
      }
    }, 5000); // Check every 5 seconds

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
      clearInterval(activeTeamsInterval);
    };
  }, []);

  const submitResult = async (teamResult) => {
    if (storageRef.current) {
      try {
        const success = await storageRef.current.submitTeamResult(teamResult);
        if (success) {
          setGameUrl(storageRef.current.getGameUrl());
          setIsConnected(true);
        }
        return success;
      } catch (error) {
        console.error('Error submitting result:', error);
        setIsConnected(false);
        return false;
      }
    }
    return false;
  };

  const saveTeamSession = async (teamId, sessionData) => {
    if (storageRef.current) {
      try {
        return await storageRef.current.updateTeamSession(teamId, sessionData);
      } catch (error) {
        console.error('Error saving session:', error);
        return false;
      }
    }
    return false;
  };

  const resetGame = async () => {
    if (storageRef.current) {
      try {
        const success = await storageRef.current.resetGame();
        if (success) {
          setScoreboard([]);
          setActiveTeams([]);
          setIsConnected(true);
        }
        return success;
      } catch (error) {
        console.error('Error resetting game:', error);
        setIsConnected(false);
        return false;
      }
    }
    return false;
  };

  const isTeamActive = (teamId) => {
    return activeTeams.includes(teamId);
  };

  const getShareableUrl = () => {
    return storageRef.current ? storageRef.current.getShareableGameUrl() : window.location.href;
  };

  const createNewGameSession = async () => {
    if (storageRef.current) {
      return await storageRef.current.createNewGameSession();
    }
    return { success: false, error: 'Storage not initialized' };
  };

  return {
    scoreboard,
    activeTeams,
    isConnected,
    gameUrl,
    submitResult,
    saveTeamSession,
    resetGame,
    isTeamActive,
    getShareableUrl,
    createNewGameSession
  };
};