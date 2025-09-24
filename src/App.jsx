import React, { useState, useEffect } from 'react';
import { Trophy, Users, Clock, CheckCircle, XCircle, RotateCcw, Star, Wifi, WifiOff, Share2 } from 'lucide-react';
import { useGameStorage } from './useGameStorage';

const DataGovernanceMatchingGame = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [gameStarted, setGameStarted] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [showBadge, setShowBadge] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamSelectionStep, setTeamSelectionStep] = useState(true);
  const [showScoreboard, setShowScoreboard] = useState(false);
  const [completionTime, setCompletionTime] = useState(null);
  const [showGameLauncher, setShowGameLauncher] = useState(true);
  const [gameSessionCreated, setGameSessionCreated] = useState(false);
  const [creatingSession, setCreatingSession] = useState(false);

  // Use the storage hook
  const {
    scoreboard: globalScoreboard,
    activeTeams,
    submitResult,
    saveTeamSession,
    resetGame: resetGlobalGame,
    isTeamActive,
    gameUrl,
    getShareableUrl,
    createNewGameSession: createGameSession
  } = useGameStorage();

  // Check if we're joining an existing game or need to show launcher
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const gameId = urlParams.get('gameId');

    if (gameId) {
      // Joining existing game
      setShowGameLauncher(false);
      setGameSessionCreated(true);
    }
  }, []);

  const teams = [
    { id: 1, name: 'Team Alpha', color: 'from-red-500 to-pink-500', emoji: '🚀' },
    { id: 2, name: 'Team Beta', color: 'from-blue-500 to-cyan-500', emoji: '⚡' },
    { id: 3, name: 'Team Gamma', color: 'from-green-500 to-emerald-500', emoji: '🌟' },
    { id: 4, name: 'Team Delta', color: 'from-purple-500 to-violet-500', emoji: '🎯' },
    { id: 5, name: 'Team Epsilon', color: 'from-orange-500 to-amber-500', emoji: '🔥' },
    { id: 6, name: 'Team Zeta', color: 'from-indigo-500 to-blue-600', emoji: '💎' },
    { id: 7, name: 'Team Eta', color: 'from-pink-500 to-rose-500', emoji: '⭐' },
    { id: 8, name: 'Team Theta', color: 'from-teal-500 to-cyan-600', emoji: '🏆' }
  ];

  const questionsData = {
    en: [
      {
        id: 1,
        scenario: "The Mayor of the City of Neptune is concerned about private citizens' data being publicly available on the city website, as she is worried that the data could be used in harmful ways. She has asked her team to create a data governance model that focuses primarily on privacy and security around data-sharing and open-data sources with residents in mind. Which data governance model or approach best suits this priority?",
        options: [
          "Stewardship Model (Role-Centered)",
          "Lifecycle Model (Process-Centered)",
          "Equity & Trust Model (Value-Centered)"
        ],
        correctAnswer: "Equity & Trust Model (Value-Centered)",
        explanation: "The Equity & Trust Model is best suited for privacy complaints as it focuses on algorithmic fairness, community advisory boards, and ensuring data practices don't harm marginalized communities or individual privacy rights."
      },
      {
        id: 2,
        scenario: "The City of Saturn is growing quickly in population and needs to determine how to best allocate their funds to provide for the growing service demands on the city (for example, where best to build a new fire station, a new middle school, and a new hospital). Which data governance model or approach best suits this priority?",
        options: [
          "Stewardship Model (Role-Centered)",
          "Lifecycle Model (Process-Centered)",
          "Equity & Trust Model (Value-Centered)"
        ],
        correctAnswer: "Stewardship Model (Role-Centered)",
        explanation: "The Stewardship Model works best for infrastructure decisions as it creates clear accountability through designated data stewards who can coordinate across departments (fire, education, health) and ensure proper data governance for funding decisions."
      },
      {
        id: 4,
        scenario: "City staffers in Pluto, IN constantly complain about not having the right data infrastructure in place to effectively share data across departments in order to inform decisions. They want to integrate data from multiple departments (housing, health, transportation) to help streamline service requests. Which data governance model or approach best suits this priority?",
        options: [
          "Stewardship Model (Role-Centered)",
          "Lifecycle Model (Process-Centered)",
          "Equity & Trust Model (Value-Centered)"
        ],
        correctAnswer: "Lifecycle Model (Process-Centered)",
        explanation: "The Lifecycle Model is ideal for cross-departmental integration as each department maintains ownership of their data through the full lifecycle while central governance provides standards for seamless integration."
      },
      {
        id: 5,
        scenario: "A major data breach has occurred in Mercury, AZ's permitting system, exposing business owner information. When steps are taken to correct it, it became clear that the city needed to define roles for managing the response, for providing accountability, and for preventing future breaches. Which data governance model or approach best suits this priority?",
        options: [
          "Stewardship Model (Role-Centered)",
          "Lifecycle Model (Process-Centered)",
          "Equity & Trust Model (Value-Centered)"
        ],
        correctAnswer: "Stewardship Model (Role-Centered)",
        explanation: "The Stewardship Model provides clear accountability through designated data stewards who can coordinate the breach response, ensure compliance with policies, and implement preventive measures across departments."
      }
    ],
    es: [
      {
        id: 1,
        scenario: "El Alcalde de la Ciudad de Neptuno está preocupado por los datos de ciudadanos privados que están disponibles públicamente en el sitio web de la ciudad, ya que le preocupa que los datos puedan ser utilizados de manera dañina. Ha pedido a su equipo que cree un modelo de gobernanza de datos que se centre principalmente en la privacidad y seguridad en torno al intercambio de datos y fuentes de datos abiertos teniendo en cuenta a los residentes. ¿Qué modelo o enfoque de gobernanza de datos se adapta mejor a esta prioridad?",
        options: [
          "Modelo de Administración (Centrado en Roles)",
          "Modelo de Ciclo de Vida (Centrado en Procesos)",
          "Modelo de Equidad y Confianza (Centrado en Valores)"
        ],
        correctAnswer: "Modelo de Equidad y Confianza (Centrado en Valores)",
        explanation: "El Modelo de Equidad y Confianza es el más adecuado para quejas de privacidad ya que se centra en la equidad algorítmica, juntas asesoras comunitarias y asegurar que las prácticas de datos no dañen a comunidades marginalizadas o derechos de privacidad individual."
      },
      {
        id: 2,
        scenario: "La Ciudad de Saturno está creciendo rápidamente en población y necesita determinar cómo asignar mejor sus fondos para satisfacer las crecientes demandas de servicios de la ciudad (por ejemplo, dónde construir mejor una nueva estación de bomberos, una nueva escuela secundaria y un nuevo hospital). ¿Qué modelo o enfoque de gobernanza de datos se adapta mejor a esta prioridad?",
        options: [
          "Modelo de Administración (Centrado en Roles)",
          "Modelo de Ciclo de Vida (Centrado en Procesos)",
          "Modelo de Equidad y Confianza (Centrado en Valores)"
        ],
        correctAnswer: "Modelo de Administración (Centrado en Roles)",
        explanation: "El Modelo de Administración funciona mejor para decisiones de infraestructura ya que crea una responsabilidad clara a través de administradores de datos designados que pueden coordinar entre departamentos (bomberos, educación, salud) y asegurar una gobernanza de datos adecuada para decisiones de financiamiento."
      },
      {
        id: 4,
        scenario: "El personal de la ciudad en Plutón, IN se queja constantemente de no tener la infraestructura de datos adecuada para compartir efectivamente datos entre departamentos para informar decisiones. Quieren integrar datos de múltiples departamentos (vivienda, salud, transporte) para ayudar a agilizar las solicitudes de servicios. ¿Qué modelo o enfoque de gobernanza de datos se adapta mejor a esta prioridad?",
        options: [
          "Modelo de Administración (Centrado en Roles)",
          "Modelo de Ciclo de Vida (Centrado en Procesos)",
          "Modelo de Equidad y Confianza (Centrado en Valores)"
        ],
        correctAnswer: "Modelo de Ciclo de Vida (Centrado en Procesos)",
        explanation: "El Modelo de Ciclo de Vida es ideal para la integración interdepartamental ya que cada departamento mantiene la propiedad de sus datos a través de todo el ciclo de vida mientras que la gobernanza central proporciona estándares para una integración perfecta."
      },
      {
        id: 5,
        scenario: "Ha ocurrido una violación importante de datos en el sistema de permisos de Mercury, AZ, exponiendo información de propietarios de empresas. Cuando se tomaron medidas para corregirlo, quedó claro que la ciudad necesitaba definir roles para manejar la respuesta, proporcionar responsabilidad y prevenir violaciones futuras. ¿Qué modelo o enfoque de gobernanza de datos se adapta mejor a esta prioridad?",
        options: [
          "Modelo de Administración (Centrado en Roles)",
          "Modelo de Ciclo de Vida (Centrado en Procesos)",
          "Modelo de Equidad y Confianza (Centrado en Valores)"
        ],
        correctAnswer: "Modelo de Administración (Centrado en Roles)",
        explanation: "El Modelo de Administración proporciona una responsabilidad clara a través de administradores de datos designados que pueden coordinar la respuesta a la violación, asegurar el cumplimiento de políticas e implementar medidas preventivas en todos los departamentos."
      }
    ],
    pt: [
      {
        id: 1,
        scenario: "O Prefeito da Cidade de Netuno está preocupado com os dados de cidadãos privados estando disponíveis publicamente no site da cidade, pois está preocupado que os dados possam ser usados de maneiras prejudiciais. Ele pediu à sua equipe para criar um modelo de governança de dados que se concentre principalmente na privacidade e segurança em torno do compartilhamento de dados e fontes de dados abertos com os residentes em mente. Qual modelo ou abordagem de governança de dados melhor se adequa a esta prioridade?",
        options: [
          "Modelo de Administração (Centrado em Papéis)",
          "Modelo de Ciclo de Vida (Centrado em Processos)",
          "Modelo de Equidade e Confiança (Centrado em Valores)"
        ],
        correctAnswer: "Modelo de Equidade e Confiança (Centrado em Valores)",
        explanation: "O Modelo de Equidade e Confiança é o mais adequado para reclamações de privacidade, pois se concentra na equidade algorítmica, conselhos consultivos comunitários e garante que as práticas de dados não prejudiquem comunidades marginalizadas ou direitos de privacidade individual."
      },
      {
        id: 2,
        scenario: "A Cidade de Saturno está crescendo rapidamente em população e precisa determinar como alocar melhor seus fundos para atender às crescentes demandas de serviços da cidade (por exemplo, onde construir melhor uma nova estação de bombeiros, uma nova escola e um novo hospital). Qual modelo ou abordagem de governança de dados melhor se adequa a esta prioridade?",
        options: [
          "Modelo de Administração (Centrado em Papéis)",
          "Modelo de Ciclo de Vida (Centrado em Processos)",
          "Modelo de Equidade e Confiança (Centrado em Valores)"
        ],
        correctAnswer: "Modelo de Administração (Centrado em Papéis)",
        explanation: "O Modelo de Administração funciona melhor para decisões de infraestrutura, pois cria responsabilidade clara através de administradores de dados designados que podem coordenar entre departamentos (bombeiros, educação, saúde) e garantir governança de dados adequada para decisões de financiamento."
      },
      {
        id: 4,
        scenario: "Funcionários da cidade em Plutão, IN constantemente reclamam de não ter a infraestrutura de dados adequada para compartilhar efetivamente dados entre departamentos para informar decisões. Eles querem integrar dados de múltiplos departamentos (habitação, saúde, transporte) para ajudar a agilizar solicitações de serviços. Qual modelo ou abordagem de governança de dados melhor se adequa a esta prioridade?",
        options: [
          "Modelo de Administração (Centrado em Papéis)",
          "Modelo de Ciclo de Vida (Centrado em Processos)",
          "Modelo de Equidade e Confiança (Centrado em Valores)"
        ],
        correctAnswer: "Modelo de Ciclo de Vida (Centrado em Processos)",
        explanation: "O Modelo de Ciclo de Vida é ideal para integração interdepartamental, pois cada departamento mantém a propriedade de seus dados durante todo o ciclo de vida enquanto a governança central fornece padrões para integração perfeita."
      },
      {
        id: 5,
        scenario: "Uma grande violação de dados ocorreu no sistema de licenças de Mercury, AZ, expondo informações de proprietários de empresas. Quando medidas foram tomadas para corrigi-la, ficou claro que a cidade precisava definir papéis para gerenciar a resposta, fornecer responsabilidade e prevenir futuras violações. Qual modelo ou abordagem de governança de dados melhor se adequa a esta prioridade?",
        options: [
          "Modelo de Administração (Centrado em Papéis)",
          "Modelo de Ciclo de Vida (Centrado em Processos)",
          "Modelo de Equidade e Confiança (Centrado em Valores)"
        ],
        correctAnswer: "Modelo de Administração (Centrado em Papéis)",
        explanation: "O Modelo de Administração fornece responsabilidade clara através de administradores de dados designados que podem coordenar a resposta à violação, garantir conformidade com políticas e implementar medidas preventivas em todos os departamentos."
      }
    ]
  };

  const textData = {
    en: {
      title: "Implementing Data Governance",
      subtitle: "Week 2: Models of Governance",
      badgeTitle: "Breakout Exercise: Badge of the Week Competition",
      teamRegistration: "Team Registration",
      teamRegistrationDesc: "Enter your breakout room team name to begin the challenge",
      teamName: "Team Name",
      teamNamePlaceholder: "e.g., Team Alpha, Data Governance Experts, Policy Pioneers...",
      challengePurpose: "Challenge Purpose:",
      challengePurposeText: "Analyze real-world city scenarios and select the most appropriate data governance model.",
      instructions: "Instructions:",
      instruction1: "Work together as a breakout room team",
      instruction2: "Choose the best governance model for each scenario",
      instruction3: "Complete within 5 minutes",
      prize: "Prize:",
      prizeText: "The team with the most correct answers wins the Badge of the Week",
      beginChallenge: "Begin Challenge",
      challengeResults: "Challenge Results",
      questionsCorrect: "Questions Correct",
      badgeEarned: "BADGE OF THE WEEK EARNED!",
      badgeEarnedDesc: "Outstanding performance on Data Governance Models!",
      questionReview: "Question Review:",
      correctAnswer: "Correct Answer:",
      yourAnswer: "Your Answer:",
      explanation: "Explanation:",
      noAnswer: "No answer",
      resultsShared: "These results will be shared with your instructor",
      dataGovernanceChallenge: "Data Governance Challenge",
      whichModel: "Which data governance model best suits this situation?",
      selectAnswer: "Select your team's answer above",
      nextQuestion: "Next Question",
      finishChallenge: "Finish Challenge",
      teamSelection: "Team Selection",
      selectYourTeam: "Select Your Team",
      teamSelectionDesc: "Choose your breakout room team to begin the Data Governance Challenge",
      continueWithTeam: "Continue with",
      scoreboard: "Live Scoreboard",
      finalRankings: "Final Rankings",
      waitingForTeams: "Waiting for other teams to finish...",
      completionTime: "Completion Time",
      viewScoreboard: "View Live Scoreboard",
      teamRanking: "Team Ranking",
      loading: "Loading results..."
    },
    es: {
      title: "Implementando Gobernanza de Datos",
      subtitle: "Semana 2: Modelos de Gobernanza",
      badgeTitle: "Ejercicio de Grupo: Competencia de Insignia de la Semana",
      teamRegistration: "Registro de Equipo",
      teamRegistrationDesc: "Ingresa el nombre de tu equipo de sala de grupos para comenzar el desafío",
      teamName: "Nombre del Equipo",
      teamNamePlaceholder: "ej., Equipo Alpha, Expertos en Gobernanza de Datos, Pioneros de Políticas...",
      challengePurpose: "Propósito del Desafío:",
      challengePurposeText: "Analizar escenarios reales de ciudades y seleccionar el modelo de gobernanza de datos más apropiado.",
      instructions: "Instrucciones:",
      instruction1: "Trabajen juntos como equipo de sala de grupos",
      instruction2: "Elijan el mejor modelo de gobernanza para cada escenario",
      instruction3: "Completen dentro de 5 minutos",
      prize: "Premio:",
      prizeText: "El equipo con más respuestas correctas gana la Insignia de la Semana",
      beginChallenge: "Comenzar Desafío",
      challengeResults: "Resultados del Desafío",
      questionsCorrect: "Preguntas Correctas",
      badgeEarned: "¡INSIGNIA DE LA SEMANA GANADA!",
      badgeEarnedDesc: "¡Rendimiento sobresaliente en Modelos de Gobernanza de Datos!",
      questionReview: "Revisión de Preguntas:",
      correctAnswer: "Respuesta Correcta:",
      yourAnswer: "Tu Respuesta:",
      explanation: "Explicación:",
      noAnswer: "Sin respuesta",
      resultsShared: "Estos resultados serán compartidos con tu instructor",
      dataGovernanceChallenge: "Desafío de Gobernanza de Datos",
      whichModel: "¿Qué modelo de gobernanza de datos se adapta mejor a esta situación?",
      selectAnswer: "Selecciona la respuesta de tu equipo arriba",
      nextQuestion: "Siguiente Pregunta",
      finishChallenge: "Finalizar Desafío",
      teamSelection: "Selección de Equipo",
      selectYourTeam: "Selecciona Tu Equipo",
      teamSelectionDesc: "Elige tu equipo de sala de grupos para comenzar el Desafío de Gobernanza de Datos",
      continueWithTeam: "Continuar con",
      scoreboard: "Marcador en Vivo",
      finalRankings: "Clasificaciones Finales",
      waitingForTeams: "Esperando que otros equipos terminen...",
      completionTime: "Tiempo de Finalización",
      viewScoreboard: "Ver Marcador en Vivo",
      teamRanking: "Clasificación de Equipos",
      loading: "Cargando resultados..."
    },
    pt: {
      title: "Implementando Governança de Dados",
      subtitle: "Semana 2: Modelos de Governança",
      badgeTitle: "Exercício de Grupo: Competição de Distintivo da Semana",
      teamRegistration: "Registro da Equipe",
      teamRegistrationDesc: "Digite o nome da sua equipe de sala de grupos para começar o desafio",
      teamName: "Nome da Equipe",
      teamNamePlaceholder: "ex., Equipe Alpha, Especialistas em Governança de Dados, Pioneiros de Políticas...",
      challengePurpose: "Propósito do Desafio:",
      challengePurposeText: "Analisar cenários reais de cidades e selecionar o modelo de governança de dados mais apropriado.",
      instructions: "Instruções:",
      instruction1: "Trabalhem juntos como equipe de sala de grupos",
      instruction2: "Escolham o melhor modelo de governança para cada cenário",
      instruction3: "Completem dentro de 5 minutos",
      prize: "Prêmio:",
      prizeText: "A equipe com mais respostas corretas ganha o Distintivo da Semana",
      beginChallenge: "Começar Desafio",
      challengeResults: "Resultados do Desafio",
      questionsCorrect: "Perguntas Corretas",
      badgeEarned: "DISTINTIVO DA SEMANA CONQUISTADO!",
      badgeEarnedDesc: "Performance excepcional em Modelos de Governança de Dados!",
      questionReview: "Revisão das Perguntas:",
      correctAnswer: "Resposta Correta:",
      yourAnswer: "Sua Resposta:",
      explanation: "Explicação:",
      noAnswer: "Sem resposta",
      resultsShared: "Estes resultados serão compartilhados com seu instrutor",
      dataGovernanceChallenge: "Desafio de Governança de Dados",
      whichModel: "Qual modelo de governança de dados melhor se adequa a esta situação?",
      selectAnswer: "Selecione a resposta da sua equipe acima",
      nextQuestion: "Próxima Pergunta",
      finishChallenge: "Finalizar Desafio",
      teamSelection: "Seleção de Equipe",
      selectYourTeam: "Selecione Sua Equipe",
      teamSelectionDesc: "Escolha sua equipe de sala de grupos para começar o Desafio de Governança de Dados",
      continueWithTeam: "Continuar com",
      scoreboard: "Placar ao Vivo",
      finalRankings: "Classificações Finais",
      waitingForTeams: "Aguardando outras equipes terminarem...",
      completionTime: "Tempo de Conclusão",
      viewScoreboard: "Ver Placar ao Vivo",
      teamRanking: "Classificação das Equipes",
      loading: "Carregando resultados..."
    }
  };

  const questions = questionsData[selectedLanguage] || questionsData.en;
  const text = textData[selectedLanguage] || textData.en;

  useEffect(() => {
    let interval;
    if (gameStarted && !showResults && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameStarted) {
      handleFinishGame();
    }
    return () => clearInterval(interval);
  }, [timeLeft, gameStarted, showResults]);

  // Track team session when they start playing
  useEffect(() => {
    if (selectedTeam && gameStarted) {
      const sessionData = {
        teamId: selectedTeam.id,
        teamName: selectedTeam.name,
        playerName: teamName,
        gameStarted: true,
        currentQuestion,
        timeLeft,
        lastUpdated: Date.now()
      };
      saveTeamSession(selectedTeam.id, sessionData);
    }
  }, [selectedTeam, gameStarted, teamName, currentQuestion, timeLeft]);

  // Update team session periodically while playing
  useEffect(() => {
    if (selectedTeam && gameStarted && !showResults) {
      const interval = setInterval(() => {
        const sessionData = {
          teamId: selectedTeam.id,
          teamName: selectedTeam.name,
          playerName: teamName,
          gameStarted: true,
          currentQuestion,
          timeLeft,
          lastUpdated: Date.now()
        };
        saveTeamSession(selectedTeam.id, sessionData);
      }, 10000); // Update every 10 seconds

      return () => clearInterval(interval);
    }
  }, [selectedTeam, gameStarted, showResults, teamName, currentQuestion, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startGame = () => {
    if (teamName.trim()) {
      setGameStarted(true);
      // Mark team as actively playing
      if (selectedTeam) {
        saveTeamSession(selectedTeam.id, {
          teamName,
          isPlaying: true,
          gameStarted: true
        });
      }
    }
  };

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
  };

  const handleNextQuestion = () => {
    const newAnswers = { ...answers, [currentQuestion]: selectedAnswer };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      handleFinishGame(newAnswers);
    }
  };

  const handleFinishGame = (finalAnswers = answers) => {
    let correctCount = 0;
    questions.forEach((question, index) => {
      if (finalAnswers[index] === question.correctAnswer) {
        correctCount++;
      }
    });
    setScore(correctCount);

    // Calculate completion time
    const timeTaken = 300 - timeLeft;
    setCompletionTime(timeTaken);

    // Add team result to global scoreboard
    const teamResult = {
      teamId: selectedTeam.id,
      teamName: selectedTeam.name,
      teamColor: selectedTeam.color,
      teamEmoji: selectedTeam.emoji,
      playerName: teamName,
      score: correctCount,
      totalQuestions: questions.length,
      completionTime: timeTaken,
      answers: finalAnswers,
      timestamp: Date.now(),
      earnedBadge: correctCount >= 3
    };

    // Submit result to persistent storage
    submitResult(teamResult);

    // Mark team as no longer playing
    if (selectedTeam) {
      saveTeamSession(selectedTeam.id, {
        teamName,
        isPlaying: false,
        gameCompleted: true,
        completionTime: timeTaken,
        score: correctCount
      });
    }

    setShowResults(true);
    if (correctCount >= 3) {
      setShowBadge(true);
    }
  };

  const resetGame = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setAnswers({});
    setShowResults(false);
    setScore(0);
    setTimeLeft(300);
    setGameStarted(false);
    setShowBadge(false);
    setSelectedTeam(null);
    setTeamSelectionStep(true);
    setTeamName('');
    setShowScoreboard(false);
    setCompletionTime(null);
  };

  const resetAllGames = () => {
    resetGlobalGame();
    resetGame();
  };

  const selectTeam = (team) => {
    setSelectedTeam(team);
    setTeamSelectionStep(false);
  };

  const formatCompletionTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const goToScoreboard = () => {
    setShowScoreboard(true);
    setShowResults(false);
  };

  const createNewGameSession = async () => {
    console.log('Creating new game session...');
    setCreatingSession(true);

    try {
      const result = await createGameSession();
      console.log('Game session result:', result);

      if (result.success) {
        console.log('Game session created successfully');
        setGameSessionCreated(true);
        setShowGameLauncher(false);
      } else {
        console.error('Failed to create game session:', result.error);
        alert('Failed to create game session. Please try again.');
      }
    } catch (error) {
      console.error('Error creating game session:', error);
      alert('Error creating game session. Please try again.');
    } finally {
      setCreatingSession(false);
    }
  };

  const LanguageToggle = () => (
    <div className="flex bg-white/20 backdrop-blur-sm rounded-lg p-1 border border-white/10">
      {[
        { code: 'en', name: 'EN', flag: '🇺🇸' },
        { code: 'es', name: 'ES', flag: '🇪🇸' },
        { code: 'pt', name: 'PT', flag: '🇧🇷' }
      ].map((lang) => (
        <button
          key={lang.code}
          onClick={() => setSelectedLanguage(lang.code)}
          className={`px-3 py-2 rounded-md font-medium transition-all duration-300 flex items-center gap-2 text-sm ${
            selectedLanguage === lang.code
              ? 'bg-white text-purple-600 shadow-md'
              : 'text-white hover:bg-white/20'
          }`}
        >
          <span>{lang.flag}</span>
          <span>{lang.name}</span>
        </button>
      ))}
    </div>
  );

  const currentQ = questions[currentQuestion];

  // Scoreboard Screen
  if (showScoreboard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Language Toggle */}
          <div className="mb-6 flex justify-end">
            <LanguageToggle />
          </div>

          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-6 mb-8">
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-2xl">
                <div className="text-blue-900 font-bold text-lg">JHU</div>
              </div>
              <div className="text-white">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
                  {text.scoreboard}
                </h1>
                <p className="text-xl text-purple-200 mt-2">{text.teamRanking}</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white px-8 py-4 rounded-2xl inline-flex items-center gap-3 font-bold text-lg shadow-xl">
              <Trophy className="w-6 h-6" />
              {globalScoreboard.length === 8 ? text.finalRankings : text.waitingForTeams}
            </div>
          </div>

          {/* Live Scoreboard */}
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-10">
            <div className="space-y-4">
              {globalScoreboard.length === 0 ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
                  <p className="text-slate-600 text-lg">{text.loading}</p>
                </div>
              ) : (
                globalScoreboard.map((result, index) => (
                  <div
                    key={result.teamId}
                    className={`border-2 rounded-2xl p-6 transition-all duration-500 ${
                      result.teamId === selectedTeam?.id
                        ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-blue-50 shadow-lg'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      {/* Rank and Team Info */}
                      <div className="flex items-center gap-6">
                        <div className={`flex items-center justify-center w-16 h-16 rounded-2xl text-white font-bold text-2xl ${
                          index === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                          index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-600' :
                          index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                          'bg-gradient-to-r from-slate-400 to-slate-600'
                        }`}>
                          #{index + 1}
                        </div>

                        <div className={`flex items-center gap-4 px-6 py-3 rounded-xl bg-gradient-to-r ${result.teamColor} text-white shadow-md`}>
                          <span className="text-2xl">{result.teamEmoji}</span>
                          <div>
                            <div className="font-bold text-lg">{result.teamName}</div>
                            <div className="text-sm opacity-90">{result.playerName}</div>
                          </div>
                        </div>
                      </div>

                      {/* Score and Details */}
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-slate-800">
                            {result.score}/{result.totalQuestions}
                          </div>
                          <div className="text-sm text-slate-600">{text.questionsCorrect}</div>
                        </div>

                        <div className="text-center">
                          <div className="text-xl font-semibold text-slate-700">
                            {formatCompletionTime(result.completionTime)}
                          </div>
                          <div className="text-sm text-slate-600">{text.completionTime}</div>
                        </div>

                        {result.earnedBadge && (
                          <div className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg">
                            <Star className="w-5 h-5" />
                            <span className="font-semibold text-sm">Badge</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}

              {/* Waiting for more teams */}
              {globalScoreboard.length < 8 && globalScoreboard.length > 0 && (
                <div className="text-center py-6 border-2 border-dashed border-slate-300 rounded-2xl">
                  <div className="text-slate-500 text-lg">
                    {text.waitingForTeams}
                  </div>
                  <div className="text-sm text-slate-400 mt-2">
                    {globalScoreboard.length}/8 teams completed
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-10">
              <button
                onClick={resetAllGames}
                className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 text-white py-4 px-8 rounded-xl font-bold text-lg hover:from-red-700 hover:to-pink-700 transition-all duration-300 flex items-center justify-center gap-3 shadow-xl transform hover:scale-105"
              >
                <RotateCcw className="w-5 h-5" />
                Reset All Games
              </button>
              <button
                onClick={resetGame}
                className="bg-slate-600 text-white py-4 px-8 rounded-xl font-bold text-lg hover:bg-slate-700 transition-all duration-300 flex items-center justify-center gap-3 shadow-xl transform hover:scale-105"
              >
                <Users className="w-5 h-5" />
                Back to Teams
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Game Launcher Screen
  if (showGameLauncher && !gameSessionCreated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Language Toggle - Top Right */}
          <div className="mb-6 flex justify-end">
            <LanguageToggle />
          </div>

          <div className="text-center">
            {/* Header */}
            <div className="flex items-center justify-center gap-6 mb-12">
              <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-2xl">
                <div className="text-blue-900 font-bold text-2xl">JHU</div>
              </div>
              <div className="text-white">
                <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
                  {text.title}
                </h1>
                <p className="text-2xl text-purple-200 mt-3">{text.subtitle}</p>
              </div>
            </div>

            {/* Main Launch Area */}
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-12 max-w-2xl mx-auto">
              <div className="mb-8">
                <Trophy className="w-24 h-24 text-purple-600 mx-auto mb-6" />
                <h2 className="text-4xl font-bold text-slate-800 mb-4">
                  Ready to Play?
                </h2>
                <p className="text-xl text-slate-600 leading-relaxed mb-8">
                  Create a new game session that all 8 teams can join. Once created, you'll get a shareable link for everyone to use.
                </p>
              </div>

              <button
                onClick={createNewGameSession}
                disabled={creatingSession}
                className={`w-full py-6 px-12 rounded-2xl font-bold text-2xl transition-all duration-300 flex items-center justify-center gap-4 shadow-xl ${
                  creatingSession
                    ? 'bg-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 transform hover:scale-105 hover:shadow-2xl'
                }`}
              >
                {creatingSession ? (
                  <>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    Creating Game...
                  </>
                ) : (
                  <>
                    <Trophy className="w-8 h-8" />
                    Launch New Game
                  </>
                )}
              </button>

              <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-center gap-2 text-blue-700 text-sm font-medium mb-2">
                  <Users className="w-4 h-4" />
                  How it works:
                </div>
                <ul className="text-sm text-blue-600 text-left space-y-1">
                  <li>• Click "Launch New Game" to create a session</li>
                  <li>• Share the generated link with all teams</li>
                  <li>• Each team joins using the same link</li>
                  <li>• See integrated results from all teams</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Team Selection Screen
  if (teamSelectionStep && gameSessionCreated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Language Toggle - Top Right */}
          <div className="mb-6 flex justify-end">
            <LanguageToggle />
          </div>

          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-6 mb-8">
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-2xl">
                <div className="text-blue-900 font-bold text-lg">JHU</div>
              </div>
              <div className="text-white">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
                  {text.title}
                </h1>
                <p className="text-xl text-purple-200 mt-2">{text.subtitle}</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white px-8 py-4 rounded-2xl inline-flex items-center gap-3 font-bold text-lg shadow-xl">
              <Trophy className="w-6 h-6" />
              {text.badgeTitle}
            </div>
          </div>

          {/* Team Selection */}
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-10 max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <Users className="w-20 h-20 text-purple-600 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-slate-800 mb-3">{text.teamSelection}</h2>
              <p className="text-slate-600 text-lg">{text.teamSelectionDesc}</p>

              {/* Game Session Sharing */}
              {gameSessionCreated && gameUrl && (
                <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-xl shadow-lg">
                  <div className="flex items-center justify-center gap-2 text-green-700 font-bold mb-3 text-lg">
                    <Share2 className="w-5 h-5" />
                    🎯 Game Session Active - Share This Link!
                  </div>
                  <div className="flex items-center gap-3 bg-white border-2 border-green-200 rounded-lg p-3 shadow-sm">
                    <input
                      type="text"
                      readOnly
                      value={getShareableUrl()}
                      className="flex-1 text-base text-slate-700 bg-transparent outline-none font-mono"
                      onClick={(e) => e.target.select()}
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(getShareableUrl());
                        // Could add a toast notification here
                      }}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 font-medium transition-colors"
                    >
                      Copy Link
                    </button>
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <p className="text-sm text-green-700 font-medium">All teams must use this exact link to join the same game!</p>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {teams.map((team) => {
                const teamActive = isTeamActive(team.id);
                const teamCompleted = globalScoreboard.some(result => result.teamId === team.id);

                return (
                  <button
                    key={team.id}
                    onClick={() => !teamActive && !teamCompleted && selectTeam(team)}
                    disabled={teamActive || teamCompleted}
                    className={`group relative overflow-hidden rounded-2xl p-6 text-white font-bold text-lg transition-all duration-300 transform shadow-xl ${
                      teamActive || teamCompleted
                        ? `bg-gradient-to-br ${team.color} opacity-60 cursor-not-allowed`
                        : `bg-gradient-to-br ${team.color} hover:scale-105 hover:shadow-2xl`
                    }`}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <span className="text-3xl">{team.emoji}</span>
                      <span className="text-center leading-tight">{team.name}</span>
                    </div>

                    {/* Status Indicators */}
                    <div className="absolute top-2 right-2">
                      {teamCompleted && (
                        <div className="flex items-center gap-1 bg-green-500 text-white px-2 py-1 rounded-lg text-xs">
                          <CheckCircle className="w-3 h-3" />
                          Done
                        </div>
                      )}
                      {teamActive && !teamCompleted && (
                        <div className="flex items-center gap-1 bg-orange-500 text-white px-2 py-1 rounded-lg text-xs">
                          <Wifi className="w-3 h-3" />
                          Playing
                        </div>
                      )}
                    </div>

                    {!teamActive && !teamCompleted && (
                      <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-8 text-center">
              <p className="text-slate-600 text-lg">
                {text.selectYourTeam}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Language Toggle - Top Right */}
          <div className="mb-6 flex justify-end">
            <LanguageToggle />
          </div>

          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-6 mb-8">
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-2xl">
                <div className="text-blue-900 font-bold text-lg">JHU</div>
              </div>
              <div className="text-white">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
                  {text.title}
                </h1>
                <p className="text-xl text-purple-200 mt-2">{text.subtitle}</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white px-8 py-4 rounded-2xl inline-flex items-center gap-3 font-bold text-lg shadow-xl">
              <Trophy className="w-6 h-6" />
              {text.badgeTitle}
            </div>
          </div>

          {/* Game Setup */}
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-10 max-w-3xl mx-auto">
            {/* Selected Team Display */}
            <div className="text-center mb-8">
              <div className={`inline-flex items-center gap-4 px-8 py-4 rounded-2xl bg-gradient-to-r ${selectedTeam?.color} text-white shadow-lg mb-6`}>
                <span className="text-3xl">{selectedTeam?.emoji}</span>
                <span className="text-2xl font-bold">{selectedTeam?.name}</span>
              </div>
              <Users className="w-16 h-16 text-purple-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-slate-800 mb-3">{text.teamRegistration}</h2>
              <p className="text-slate-600 text-lg">{text.teamRegistrationDesc}</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-lg font-semibold text-slate-700 mb-3">
                  {text.teamName}
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder={`${selectedTeam?.name} - ${text.teamNamePlaceholder}`}
                  className="w-full px-6 py-4 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg bg-white text-slate-800"
                />
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
                <h3 className="font-bold text-purple-900 mb-4 text-lg">{text.challengePurpose}</h3>
                <p className="text-purple-800 mb-4 text-sm leading-relaxed">
                  {text.challengePurposeText}
                </p>

                <h3 className="font-bold text-purple-900 mb-3 text-lg">{text.instructions}</h3>
                <ul className="space-y-2 text-purple-800 mb-4 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    {text.instruction1}
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    {text.instruction2}
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    {text.instruction3}
                  </li>
                </ul>

                <h3 className="font-bold text-purple-900 mb-3 text-lg">{text.prize}</h3>
                <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-4 border border-purple-300">
                  <p className="text-purple-800 text-sm font-medium">
                    {text.prizeText}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setTeamSelectionStep(true)}
                  className="bg-slate-500 text-white py-5 px-8 rounded-xl font-bold text-xl hover:bg-slate-600 transition-all duration-300 shadow-xl transform hover:scale-105"
                >
                  ← Back to Teams
                </button>
                <button
                  onClick={startGame}
                  disabled={!teamName.trim()}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-5 px-8 rounded-xl font-bold text-xl hover:from-purple-700 hover:to-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-300 shadow-xl transform hover:scale-105 disabled:transform-none"
                >
                  {text.beginChallenge}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 p-6">
        <div className="max-w-5xl mx-auto">
          {/* Language Toggle */}
          <div className="mb-6 flex justify-end">
            <LanguageToggle />
          </div>

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent mb-4">
              {text.challengeResults}
            </h1>
            <div className="flex items-center justify-center gap-4">
              <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r ${selectedTeam?.color} text-white shadow-lg`}>
                <span className="text-2xl">{selectedTeam?.emoji}</span>
                <span className="text-xl font-bold">{selectedTeam?.name}</span>
              </div>
              <span className="text-purple-200 text-2xl">|</span>
              <span className="text-purple-200 text-xl font-semibold">{teamName}</span>
            </div>
          </div>

          {/* Score Display */}
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-10 mb-8">
            <div className="text-center mb-8">
              <div className="text-7xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">{score}/4</div>
              <div className="text-2xl text-slate-700 font-semibold">{text.questionsCorrect}</div>

              {showBadge && (
                <div className="mt-8 p-8 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 rounded-2xl shadow-xl">
                  <div className="flex items-center justify-center gap-4 text-white">
                    <Trophy className="w-10 h-10" />
                    <div className="text-3xl font-bold">{text.badgeEarned}</div>
                    <Star className="w-10 h-10" />
                  </div>
                  <p className="text-white mt-3 text-lg">{text.badgeEarnedDesc}</p>
                </div>
              )}
            </div>

            {/* Detailed Results */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-slate-800 mb-6">{text.questionReview}</h3>
              {questions.map((question, index) => {
                const userAnswer = answers[index];
                const isCorrect = userAnswer === question.correctAnswer;

                return (
                  <div key={question.id} className="border-2 border-slate-200 rounded-xl p-6 bg-gradient-to-r from-slate-50 to-purple-50">
                    <div className="flex items-start gap-4">
                      {isCorrect ?
                        <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" /> :
                        <XCircle className="w-6 h-6 text-red-500 mt-1 flex-shrink-0" />
                      }
                      <div className="flex-1">
                        <p className="font-semibold text-slate-800 mb-3 text-lg">Q{index + 1}: {question.scenario}</p>
                        <div className="space-y-2">
                          <div className="bg-green-100 border border-green-200 rounded-lg p-3">
                            <span className="font-bold text-green-800">{text.correctAnswer}</span>
                            <span className="text-green-700 ml-2">{question.correctAnswer}</span>
                          </div>
                          {!isCorrect && (
                            <div className="bg-red-100 border border-red-200 rounded-lg p-3">
                              <span className="font-bold text-red-800">{text.yourAnswer}</span>
                              <span className="text-red-700 ml-2">{userAnswer || text.noAnswer}</span>
                            </div>
                          )}
                          <div className="bg-purple-100 border border-purple-200 rounded-lg p-3">
                            <span className="font-bold text-purple-800">{text.explanation}</span>
                            <span className="text-purple-700 ml-2">{question.explanation}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-4 mt-10">
              <button
                onClick={goToScoreboard}
                className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white py-4 px-8 rounded-xl font-bold text-lg hover:from-green-700 hover:to-blue-700 transition-all duration-300 flex items-center justify-center gap-3 shadow-xl transform hover:scale-105"
              >
                <Trophy className="w-5 h-5" />
                {text.viewScoreboard}
              </button>
              <button
                onClick={resetGame}
                className="bg-slate-600 text-white py-4 px-8 rounded-xl font-bold text-lg hover:bg-slate-700 transition-all duration-300 flex items-center justify-center gap-3 shadow-xl transform hover:scale-105"
              >
                <RotateCcw className="w-5 h-5" />
                New Game
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Language Toggle */}
        <div className="mb-6 flex justify-end">
          <LanguageToggle />
        </div>

        {/* Header with Timer */}
        <div className="flex justify-between items-center mb-10">
          <div className="text-white">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
              {text.dataGovernanceChallenge}
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r ${selectedTeam?.color} text-white shadow-md`}>
                <span className="text-lg">{selectedTeam?.emoji}</span>
                <span className="font-semibold">{selectedTeam?.name}</span>
              </div>
              <span className="text-purple-200">|</span>
              <span className="text-purple-200 text-lg">{teamName}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3 text-white border border-white/10">
              <Clock className="w-5 h-5 inline mr-2" />
              <span className="text-xl font-bold">{formatTime(timeLeft)}</span>
            </div>
            <div className="text-purple-200 text-sm mt-2">
              Question {currentQuestion + 1} of {questions.length}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white/20 rounded-full h-3 mb-10 shadow-inner">
          <div
            className="bg-gradient-to-r from-purple-400 to-pink-400 h-3 rounded-full transition-all duration-500 shadow-lg"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* Question Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-10">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">
              Question {currentQuestion + 1}
            </h2>
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
              <p className="text-slate-700 text-lg leading-relaxed">
                {currentQ.scenario}
              </p>
            </div>
          </div>

          <div className="space-y-4 mb-10">
            <h3 className="font-bold text-slate-800 mb-6 text-xl">
              {text.whichModel}
            </h3>
            {currentQ.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-300 transform hover:scale-102 ${
                  selectedAnswer === option
                    ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-blue-50 text-purple-800 shadow-lg'
                    : 'border-slate-200 hover:border-purple-300 hover:bg-gradient-to-r hover:from-slate-50 hover:to-purple-50 hover:shadow-md text-slate-700'
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${
                    selectedAnswer === option
                      ? 'border-purple-500 bg-purple-500'
                      : 'border-slate-400 bg-white'
                  }`}>
                    {selectedAnswer === option && (
                      <div className="w-2.5 h-2.5 bg-white rounded-full" />
                    )}
                  </div>
                  <span className="text-lg">{option}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="flex justify-between items-center">
            <div className="text-slate-500">
              {text.selectAnswer}
            </div>
            <button
              onClick={handleNextQuestion}
              disabled={!selectedAnswer}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-300 shadow-xl transform hover:scale-105 disabled:transform-none"
            >
              {currentQuestion === questions.length - 1 ? text.finishChallenge : text.nextQuestion}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataGovernanceMatchingGame;