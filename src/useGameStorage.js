import { useState, useEffect, useRef } from 'react';
import { GameStorage } from './gameStorage';

export const useGameStorage = () => {
  const [scoreboard, setScoreboard] = useState([]);
  const [activeTeams, setActiveTeams] = useState([]);
  const storageRef = useRef(null);

  useEffect(() => {
    // Initialize storage
    storageRef.current = new GameStorage();

    // Load initial data
    const initialScoreboard = storageRef.current.getScoreboard();
    const initialActiveTeams = storageRef.current.getActiveTeams();

    setScoreboard(initialScoreboard);
    setActiveTeams(initialActiveTeams);

    // Listen for storage updates
    const handleStorageUpdate = (event) => {
      const data = event.detail;
      setScoreboard(data.globalScoreboard || []);
      setActiveTeams(storageRef.current.getActiveTeams());
    };

    window.addEventListener('gameDataUpdated', handleStorageUpdate);

    // Update active teams periodically
    const activeTeamsInterval = setInterval(() => {
      const currentActiveTeams = storageRef.current.getActiveTeams();
      setActiveTeams(currentActiveTeams);
    }, 5000); // Check every 5 seconds

    return () => {
      window.removeEventListener('gameDataUpdated', handleStorageUpdate);
      clearInterval(activeTeamsInterval);
    };
  }, []);

  const submitResult = (teamResult) => {
    if (storageRef.current) {
      const success = storageRef.current.submitTeamResult(teamResult);
      if (success) {
        setScoreboard(storageRef.current.getScoreboard());
      }
      return success;
    }
    return false;
  };

  const saveTeamSession = (teamId, sessionData) => {
    if (storageRef.current) {
      return storageRef.current.saveTeamSession(teamId, sessionData);
    }
    return false;
  };

  const resetGame = () => {
    if (storageRef.current) {
      const success = storageRef.current.resetGame();
      if (success) {
        setScoreboard([]);
        setActiveTeams([]);
      }
      return success;
    }
    return false;
  };

  const isTeamActive = (teamId) => {
    return storageRef.current ? storageRef.current.isTeamActive(teamId) : false;
  };

  return {
    scoreboard,
    activeTeams,
    submitResult,
    saveTeamSession,
    resetGame,
    isTeamActive
  };
};