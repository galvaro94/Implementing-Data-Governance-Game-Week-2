import React, { useState, useEffect, useMemo } from 'react';
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
  const [showWeek4Scoreboard, setShowWeek4Scoreboard] = useState(false);
  const [completionTime, setCompletionTime] = useState(null);
  const [showGameLauncher, setShowGameLauncher] = useState(false);
  const [gameSessionCreated, setGameSessionCreated] = useState(false);
  const [creatingSession, setCreatingSession] = useState(false);
  const [showMainMenu, setShowMainMenu] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState(null);

  // Week 4 specific states
  const [week4GameStarted, setWeek4GameStarted] = useState(false);
  const [week4CurrentScenario, setWeek4CurrentScenario] = useState(0);
  const [week4TimeLeft, setWeek4TimeLeft] = useState(480); // 8 minutes total
  const [week4ScenarioTimeLeft, setWeek4ScenarioTimeLeft] = useState(210); // 3.5 minutes per scenario
  const [week4EquityScore, setWeek4EquityScore] = useState(0);
  const [week4ScenarioComplete, setWeek4ScenarioComplete] = useState([false, false]);
  const [week4ShowInstructions, setWeek4ShowInstructions] = useState(true);
  const [week4ShowDashboard, setWeek4ShowDashboard] = useState(false);
  const [week4ShowReflection, setWeek4ShowReflection] = useState(false);

  // Week 4 Scoring System (4 categories)
  const [week4Scores, setWeek4Scores] = useState({
    completeness: 0,    // 25% - Identifying multiple factors
    equityFocus: 0,     // 35% - Considering marginalized groups
    systemsThinking: 0, // 25% - Seeing connections
    dataAwareness: 0    // 15% - Asking right questions
  });

  // Reflection state
  const [week4ReflectionInput, setWeek4ReflectionInput] = useState('');
  const [week4ComprehensiveAnalysis, setWeek4ComprehensiveAnalysis] = useState(null);
  const [week4PersonalizedInsight, setWeek4PersonalizedInsight] = useState(null);

  // Saturn scenario specific states
  const [saturnCurrentQuestion, setSaturnCurrentQuestion] = useState(1);
  const [saturnQuestionTimeLeft, setSaturnQuestionTimeLeft] = useState(90); // 1.5 minutes for Q1
  const [saturnQ1Response, setSaturnQ1Response] = useState('');
  const [saturnQ2Response, setSaturnQ2Response] = useState('');
  const [saturnQ1Feedback, setSaturnQ1Feedback] = useState(null);
  const [saturnQ2Feedback, setSaturnQ2Feedback] = useState(null);
  const [saturnQ1Submitted, setSaturnQ1Submitted] = useState(false);
  const [saturnQ2Submitted, setSaturnQ2Submitted] = useState(false);
  const [saturnScenarioComplete, setSaturnScenarioComplete] = useState(false);

  // Mercury scenario specific states
  const [mercuryCurrentQuestion, setMercuryCurrentQuestion] = useState(1);
  const [mercuryQuestionTimeLeft, setMercuryQuestionTimeLeft] = useState(90); // 1.5 minutes for Q1
  const [mercuryQ1Response, setMercuryQ1Response] = useState('');
  const [mercuryQ2Ranking, setMercuryQ2Ranking] = useState(['Playgrounds', 'Senior center', 'Fire station', 'School', 'Hospital']);
  const [mercuryQ2Explanation, setMercuryQ2Explanation] = useState('');
  const [mercuryQ1Feedback, setMercuryQ1Feedback] = useState(null);
  const [mercuryQ2Feedback, setMercuryQ2Feedback] = useState(null);
  const [mercuryQ1Submitted, setMercuryQ1Submitted] = useState(false);
  const [mercuryQ2Submitted, setMercuryQ2Submitted] = useState(false);
  const [mercuryScenarioComplete, setMercuryScenarioComplete] = useState(false);

  // Claude API function with 4-category scoring
  const getClaudeFeedback = async (userInput, questionContext, scenarioNumber) => {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `As a data governance expert evaluating equity-focused responses, analyze this user input and provide structured feedback:

Context: ${questionContext} (Scenario ${scenarioNumber})
User Response: "${userInput}"

Please provide:
1. Constructive feedback (2-3 sentences)
2. Category scores (0-100 scale for each):
   - Completeness: How thoroughly they addressed the question
   - Equity Focus: How well they considered marginalized communities and fairness
   - Systems Thinking: How well they saw connections and broader implications
   - Data Awareness: How well they understood data governance principles
3. 1-2 specific suggestions for improvement

Respond in this exact JSON format:
{
  "feedback": "Your detailed feedback here",
  "categoryScores": {
    "completeness": 75,
    "equityFocus": 80,
    "systemsThinking": 70,
    "dataAwareness": 65
  },
  "suggestions": ["Suggestion 1", "Suggestion 2"]
}`
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.content[0].text;

      // Parse the JSON response from Claude
      const result = JSON.parse(content);

      // Calculate total score with proper weighting
      const totalScore = Math.round(
        (result.categoryScores.completeness * 0.25) +
        (result.categoryScores.equityFocus * 0.35) +
        (result.categoryScores.systemsThinking * 0.25) +
        (result.categoryScores.dataAwareness * 0.15)
      );

      return {
        feedback: result.feedback,
        totalScore: totalScore,
        categoryScores: {
          completeness: Math.round(result.categoryScores.completeness * 0.25),
          equityFocus: Math.round(result.categoryScores.equityFocus * 0.35),
          systemsThinking: Math.round(result.categoryScores.systemsThinking * 0.25),
          dataAwareness: Math.round(result.categoryScores.dataAwareness * 0.15)
        },
        suggestions: result.suggestions || []
      };
    } catch (error) {
      console.error('Claude API error:', error);
      // Error handling - return default scores
      return {
        feedback: "Thank you for your thoughtful response. Our AI analysis is temporarily unavailable, but your input demonstrates consideration of data governance principles.",
        totalScore: 60,
        categoryScores: {
          completeness: 15,
          equityFocus: 21,
          systemsThinking: 15,
          dataAwareness: 9
        },
        suggestions: ["Continue exploring equity implications of data decisions", "Consider how different stakeholders might be affected"]
      };
    }
  };

  // Function to update Week 4 scores with category tracking
  const updateWeek4Scores = (categoryScores) => {
    setWeek4Scores(prev => ({
      completeness: prev.completeness + categoryScores.completeness,
      equityFocus: prev.equityFocus + categoryScores.equityFocus,
      systemsThinking: prev.systemsThinking + categoryScores.systemsThinking,
      dataAwareness: prev.dataAwareness + categoryScores.dataAwareness
    }));

    // Update total equity score
    const totalIncrease = Object.values(categoryScores).reduce((sum, score) => sum + score, 0);
    setWeek4EquityScore(prev => Math.min(100, prev + totalIncrease));
  };

  // Comprehensive analysis function for reflection
  const getComprehensiveAnalysis = async () => {
    try {
      const getAllResponses = {
        saturn: {
          q1: saturnQ1Response,
          q2: saturnQ2Response
        },
        mercury: {
          q1: mercuryQ1Response,
          q2: mercuryQ2Explanation,
          ranking: mercuryQ2Ranking
        }
      };

      // Direct Claude API call for comprehensive analysis
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 1500,
          messages: [{
            role: 'user',
            content: `As a data governance expert, provide a comprehensive analysis of this participant's journey through two equity-focused scenarios:

SATURN SCENARIO (Beach Tourism vs Climate Resilience):
Q1 Response: "${saturnQ1Response}"
Q2 Response: "${saturnQ2Response}"

MERCURY SCENARIO (Suburban Infrastructure with Demographics):
Q1 Response: "${mercuryQ1Response}"
Explanation: "${mercuryQ2Explanation}"
Infrastructure Ranking: ${JSON.stringify(mercuryQ2Ranking)}

Current Scores: ${JSON.stringify(week4Scores)}

Please provide:
1. A comprehensive analysis of their equity-focused approach (3-4 sentences)
2. Key strengths demonstrated across both scenarios
3. Areas for continued growth in data governance equity
4. A personalized insight about their decision-making patterns

Write this as a reflective, encouraging assessment that helps them understand their data governance equity journey.`
          }]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const analysis = data.content[0].text;
        setWeek4ComprehensiveAnalysis(analysis);
        setWeek4PersonalizedInsight("Your responses show a developing understanding of how data governance decisions can promote equity across different community contexts.");
      } else {
        throw new Error('API call failed');
      }

    } catch (error) {
      console.error('Error getting comprehensive analysis:', error);
      setWeek4ComprehensiveAnalysis("Your responses demonstrate thoughtful consideration of equity principles in data governance decisions. You've shown awareness of how different communities might be affected by policy choices and the importance of inclusive data collection practices.");
      setWeek4PersonalizedInsight("Continue exploring how data governance can promote equity across different community contexts. Your responses suggest a growing understanding of the connections between data decisions and community outcomes.");
    }
  };

  // Timer effects for Week 4
  useEffect(() => {
    if (week4GameStarted && week4TimeLeft > 0) {
      const interval = setInterval(() => {
        setWeek4TimeLeft(prev => {
          if (prev <= 1) {
            // Time's up - force completion
            setWeek4ShowDashboard(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [week4GameStarted, week4TimeLeft]);

  // Saturn question timer
  useEffect(() => {
    if (week4GameStarted && week4CurrentScenario === 0 && saturnQuestionTimeLeft > 0) {
      const interval = setInterval(() => {
        setSaturnQuestionTimeLeft(prev => {
          if (prev <= 1) {
            // Time's up for current question - auto submit if possible
            if (saturnCurrentQuestion === 1 && !saturnQ1Submitted && saturnQ1Response.trim()) {
              // Auto submit Q1
              setSaturnQ1Submitted(true);
              getClaudeFeedback(saturnQ1Response, "equity data collection for resource allocation", 1)
                .then(feedback => {
                  setSaturnQ1Feedback(feedback);
                  updateWeek4Scores(feedback.categoryScores);
                });
            } else if (saturnCurrentQuestion === 2 && !saturnQ2Submitted && saturnQ2Response.trim()) {
              // Auto submit Q2
              setSaturnQ2Submitted(true);
              getClaudeFeedback(saturnQ2Response, "balancing stakeholder needs with equity focus", 1)
                .then(feedback => {
                  setSaturnQ2Feedback(feedback);
                  updateWeek4Scores(feedback.categoryScores);
                  setSaturnScenarioComplete(true);
                });
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [week4GameStarted, week4CurrentScenario, saturnQuestionTimeLeft, saturnCurrentQuestion, saturnQ1Submitted, saturnQ2Submitted, saturnQ1Response, saturnQ2Response]);

  // Mercury question timer
  useEffect(() => {
    if (week4GameStarted && week4CurrentScenario === 1 && mercuryQuestionTimeLeft > 0) {
      const interval = setInterval(() => {
        setMercuryQuestionTimeLeft(prev => {
          if (prev <= 1) {
            // Time's up for current question - auto submit if possible
            if (mercuryCurrentQuestion === 1 && !mercuryQ1Submitted && mercuryQ1Response.trim()) {
              // Auto submit Q1
              setMercuryQ1Submitted(true);
              getClaudeFeedback(mercuryQ1Response, "pre-decision data governance questions", 2)
                .then(feedback => {
                  setMercuryQ1Feedback(feedback);
                  updateWeek4Scores(feedback.categoryScores);
                });
            } else if (mercuryCurrentQuestion === 2 && !mercuryQ2Submitted && (mercuryQ2Explanation.trim() || mercuryQ2Ranking.length > 0)) {
              // Auto submit Q2
              setMercuryQ2Submitted(true);
              const rankingData = {
                ranking: mercuryQ2Ranking,
                explanation: mercuryQ2Explanation
              };
              getClaudeFeedback(JSON.stringify(rankingData), "infrastructure prioritization with equity lens", 2)
                .then(feedback => {
                  setMercuryQ2Feedback(feedback);
                  updateWeek4Scores(feedback.categoryScores);
                  setMercuryScenarioComplete(true);
                });
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [week4GameStarted, week4CurrentScenario, mercuryQuestionTimeLeft, mercuryCurrentQuestion, mercuryQ1Submitted, mercuryQ2Submitted, mercuryQ1Response, mercuryQ2Explanation, mercuryQ2Ranking]);

  // Check for Week 4 completion and trigger reflection
  useEffect(() => {
    if (saturnScenarioComplete && mercuryScenarioComplete && !week4ShowReflection && !week4ShowDashboard) {
      // Both scenarios complete, generate comprehensive analysis and show reflection screen
      setTimeout(async () => {
        await getComprehensiveAnalysis();
        setWeek4ShowReflection(true);
      }, 1000); // Brief delay for completion feedback
    }
  }, [saturnScenarioComplete, mercuryScenarioComplete, week4ShowReflection, week4ShowDashboard]);

  // Use the storage hook
  const {
    scoreboard: globalScoreboard,
    activeTeams,
    submitResult,
    submitWeek4Result,
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
      setShowMainMenu(false);
      setShowGameLauncher(false);
      setGameSessionCreated(true);
    }
  }, []);

  const teams = [
    { id: 1, name: 'Calgary', color: 'from-red-500 to-pink-500' },
    { id: 2, name: 'Vancouver', color: 'from-blue-500 to-cyan-500' },
    { id: 3, name: 'Winnipeg', color: 'from-green-500 to-emerald-500' },
    { id: 4, name: 'Ottawa', color: 'from-purple-500 to-violet-500' },
    { id: 5, name: 'Miami', color: 'from-orange-500 to-amber-500' },
    { id: 6, name: 'Largo', color: 'from-indigo-500 to-blue-600' },
    { id: 7, name: 'Buckeye', color: 'from-pink-500 to-rose-500' },
    { id: 8, name: 'Oklahoma City', color: 'from-teal-500 to-cyan-600' },
    { id: 9, name: 'Dallas', color: 'from-yellow-500 to-orange-500' },
    { id: 10, name: 'Sandy Springs', color: 'from-emerald-500 to-teal-500' },
    { id: 11, name: 'Evanston', color: 'from-violet-500 to-purple-500' },
    { id: 12, name: 'Columbia', color: 'from-cyan-500 to-blue-500' },
    { id: 13, name: 'Providence', color: 'from-rose-500 to-pink-500' },
    { id: 14, name: 'Long Beach', color: 'from-amber-500 to-yellow-500' },
    { id: 15, name: 'Wauwatosa', color: 'from-lime-500 to-green-500' },
    { id: 16, name: 'Los Angeles', color: 'from-fuchsia-500 to-pink-500' },
    { id: 17, name: 'Anchorage', color: 'from-blue-600 to-indigo-600' },
    { id: 18, name: 'Normal', color: 'from-green-600 to-emerald-600' },
    { id: 19, name: 'Durham', color: 'from-purple-600 to-violet-600' },
    { id: 20, name: 'San Diego', color: 'from-orange-600 to-red-500' },
    { id: 21, name: 'Fairfield', color: 'from-teal-600 to-cyan-600' },
    { id: 22, name: 'North Port', color: 'from-slate-500 to-gray-600' },
    { id: 23, name: 'San Jose', color: 'from-red-600 to-pink-600' },
    { id: 24, name: 'Corona', color: 'from-yellow-600 to-orange-600' },
    { id: 25, name: 'Westerville', color: 'from-emerald-600 to-teal-600' },
    { id: 26, name: 'Seattle', color: 'from-violet-600 to-purple-600' },
    { id: 27, name: 'Mesa', color: 'from-cyan-600 to-blue-600' },
    { id: 28, name: 'Montego Bay', color: 'from-rose-600 to-pink-600' },
    { id: 29, name: 'Mogi das Cruzes', color: 'from-amber-600 to-yellow-600' },
    { id: 30, name: 'Belo Horizonte', color: 'from-lime-600 to-green-600' },
    { id: 31, name: 'San Fernando', color: 'from-fuchsia-600 to-pink-600' },
    { id: 32, name: 'Providencia', color: 'from-blue-700 to-indigo-700' },
    { id: 33, name: 'Rancagua', color: 'from-green-700 to-emerald-700' },
    { id: 34, name: 'Mercedes', color: 'from-purple-700 to-violet-700' },
    { id: 35, name: 'Reconquista', color: 'from-orange-700 to-red-600' },
    { id: 36, name: 'Comodoro Rivadavia', color: 'from-teal-700 to-cyan-700' },
    { id: 37, name: 'San Juan', color: 'from-slate-600 to-gray-700' },
    { id: 38, name: 'Mexico City', color: 'from-red-700 to-pink-700' }
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
      loading: "Loading results...",
      backToTeams: "Back to Teams",
      submitScore: "Submit Score",
      timeLeft: "Time Left",
      scoreSubmittedSuccess: "Score successfully submitted, please click OK to see the live score dashboard",
      scoreSubmissionFailed: "Failed to submit score. Please try again.",
      teamsCompleted: "teams completed",
      questionXOfY: "Question",
      readyToPlay: "Ready to Play?",
      gameSessionDescription: "Create a new game session that all 38 teams can join. Once created, you'll get a shareable link for everyone to use.",
      creatingGame: "Creating Game...",
      launchNewGame: "Launch New Game",
      howItWorks: "How it works:",
      step1: "Click \"Launch New Game\" to create a session",
      step2: "Share the generated link with all teams",
      step3: "Each team joins using the same link",
      step4: "See integrated results from all teams",
      mainTitle: "Implementing Data Governance (DM1)",
      selectWeek: "Select a Week",
      week2Title: "Week 2 Game",
      week2Description: "Models of Governance - Analyze real-world city scenarios",
      week4Title: "Week 4 Game",
      week4Description: "Equity in Action: Data Decisions - Navigate complex data equity scenarios",
      enterWeek: "Enter Week",
      // Week 4 specific texts
      week4GameTitle: "Equity in Action: Data Decisions",
      week4Subtitle: "Week 4: Advanced Data Equity Scenarios",
      week4Instructions: "Welcome to Equity in Action: Data Decisions",
      week4InstructionDesc: "Navigate complex scenarios involving data equity decisions in two different planetary cities.",
      week4Purpose: "Game Purpose:",
      week4PurposeText: "Develop critical thinking skills around data equity, bias recognition, and inclusive decision-making in data governance.",
      week4GameInstructions: "Instructions:",
      week4Instruction1: "Complete 2 scenarios: Saturn City and Mercury Station",
      week4Instruction2: "Each scenario presents data equity challenges",
      week4Instruction3: "Provide thoughtful responses to ethical dilemmas",
      week4Instruction4: "Build your Equity Score through fair and inclusive decisions",
      week4TimeLimit: "Time Limit: 8 minutes total (3.5 min per scenario + reflection time)",
      week4StartGame: "Start Equity Challenge",
      week4ScenarioProgress: "Scenario Progress",
      week4EquityMeter: "Equity Score",
      week4NextScenario: "Next Scenario",
      week4Finish: "Finish Challenge",
      week4SaturnScenario: "Saturn City Data Privacy",
      week4MercuryScenario: "Mercury Station Resource Allocation",
      week4ScenarioPlaceholder: "Scenario content will be loaded here...",
      week4Dashboard: "Equity Challenge Results",
      // Saturn scenario specific texts
      saturnScenarioTitle: "City of Saturn",
      saturnScenarioDesc: "Saturn is a beach city. The mayor wants to expand beachfront tourism (stores + carnival) but only has budget for EITHER that OR climate resilience (trees, shaded parks) for residents. College students visit for spring break, but residents suffer in hot summers.",
      saturnQ1Label: "What data would you collect to make an equitable decision? Type 3-5 data points:",
      saturnQ2Label: "How would you balance tourist economy vs. resident climate needs? Explain your approach:",
      submitAnswer: "Submit Answer",
      questionProgress: "Question {current} of {total}",
      scenarioComplete: "Scenario Complete!",
      claudeFeedback: "Claude AI Feedback:",
      loadingFeedback: "Getting AI feedback...",
      // Mercury scenario specific texts
      mercuryScenarioTitle: "City of Mercury",
      mercuryScenarioDesc: "Mercury is a young suburban city. 60% are families with children, 40% are retired snowbirds (gone 6 months). Need: green spaces, playgrounds, community centers, AND future infrastructure (school, hospital, fire station). Limited budget.",
      mercuryQ1Label: "What questions would you ask BEFORE deciding priorities? List your top 3:",
      mercuryQ2Label: "Rank these needs (1-5) and explain WHY using equity principles:",
      mercuryQ2ExplanationLabel: "Explain your ranking:",
      mercuryDemographics: "City Demographics:",
      familiesWithChildren: "Families with children",
      retiredSnowbirds: "Retired snowbirds (seasonal)",
      rankingInstructions: "Drag items to reorder from highest (1) to lowest (5) priority:",
      allScenariosComplete: "All Scenarios Complete!",
      totalEquityScore: "Total Equity Score:",
      scenarioScores: "Scenario Breakdown:",
      saturnScore: "Saturn City",
      mercuryScore: "Mercury City",
      finalReflection: "Final Reflection"
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
      loading: "Cargando resultados...",
      backToTeams: "Volver a Equipos",
      submitScore: "Enviar Puntuación",
      timeLeft: "Tiempo Restante",
      scoreSubmittedSuccess: "Puntuación enviada exitosamente, por favor haga clic en OK para ver el tablero de puntuaciones en vivo",
      scoreSubmissionFailed: "Error al enviar puntuación. Por favor intente de nuevo.",
      teamsCompleted: "equipos completados",
      questionXOfY: "Pregunta",
      readyToPlay: "¿Listo para Jugar?",
      gameSessionDescription: "Crea una nueva sesión de juego a la que pueden unirse los 38 equipos. Una vez creada, obtendrás un enlace compartible para que todos lo usen.",
      creatingGame: "Creando Juego...",
      launchNewGame: "Lanzar Nuevo Juego",
      howItWorks: "Cómo funciona:",
      step1: "Haz clic en \"Lanzar Nuevo Juego\" para crear una sesión",
      step2: "Comparte el enlace generado con todos los equipos",
      step3: "Cada equipo se une usando el mismo enlace",
      step4: "Ve los resultados integrados de todos los equipos",
      mainTitle: "Implementación de Gobernanza de Datos (DM1)",
      selectWeek: "Seleccionar una Semana",
      week2Title: "Juego Semana 2",
      week2Description: "Modelos de Gobernanza - Analiza escenarios reales de ciudades",
      week4Title: "Juego Semana 4",
      week4Description: "Equidad en Acción: Decisiones de Datos - Navega escenarios complejos de equidad de datos",
      enterWeek: "Ingresar a la Semana",
      // Week 4 specific texts
      week4GameTitle: "Equidad en Acción: Decisiones de Datos",
      week4Subtitle: "Semana 4: Escenarios Avanzados de Equidad de Datos",
      week4Instructions: "Bienvenido a Equidad en Acción: Decisiones de Datos",
      week4InstructionDesc: "Navega escenarios complejos que involucran decisiones de equidad de datos en dos ciudades planetarias diferentes.",
      week4Purpose: "Propósito del Juego:",
      week4PurposeText: "Desarrollar habilidades de pensamiento crítico sobre equidad de datos, reconocimiento de sesgos y toma de decisiones inclusiva.",
      week4GameInstructions: "Instrucciones:",
      week4Instruction1: "Completa 2 escenarios: Ciudad Saturno y Estación Mercurio",
      week4Instruction2: "Cada escenario presenta desafíos de equidad de datos",
      week4Instruction3: "Proporciona respuestas reflexivas a dilemas éticos",
      week4Instruction4: "Construye tu Puntuación de Equidad a través de decisiones justas e inclusivas",
      week4TimeLimit: "Límite de Tiempo: 8 minutos total (3.5 min por escenario + tiempo de reflexión)",
      week4StartGame: "Comenzar Desafío de Equidad",
      week4ScenarioProgress: "Progreso del Escenario",
      week4EquityMeter: "Puntuación de Equidad",
      week4NextScenario: "Siguiente Escenario",
      week4Finish: "Finalizar Desafío",
      week4SaturnScenario: "Privacidad de Datos de Ciudad Saturno",
      week4MercuryScenario: "Asignación de Recursos de Estación Mercurio",
      week4ScenarioPlaceholder: "El contenido del escenario se cargará aquí...",
      week4Dashboard: "Resultados del Desafío de Equidad",
      // Saturn scenario specific texts
      saturnScenarioTitle: "Ciudad de Saturno",
      saturnScenarioDesc: "Saturno es una ciudad costera. El alcalde quiere expandir el turismo de playa (tiendas + carnaval) pero solo tiene presupuesto para ESO O para resistencia climática (árboles, parques con sombra) para los residentes. Los estudiantes universitarios visitan durante las vacaciones de primavera, pero los residentes sufren en los veranos calurosos.",
      saturnQ1Label: "¿Qué datos recopilarías para tomar una decisión equitativa? Escribe 3-5 puntos de datos:",
      saturnQ2Label: "¿Cómo equilibrarías la economía turística vs. las necesidades climáticas de los residentes? Explica tu enfoque:",
      submitAnswer: "Enviar Respuesta",
      questionProgress: "Pregunta {current} de {total}",
      scenarioComplete: "¡Escenario Completo!",
      claudeFeedback: "Retroalimentación de Claude AI:",
      loadingFeedback: "Obteniendo retroalimentación de IA...",
      // Mercury scenario specific texts
      mercuryScenarioTitle: "Ciudad de Mercurio",
      mercuryScenarioDesc: "Mercurio es una ciudad suburbana joven. 60% son familias con niños, 40% son jubilados migratorios (ausentes 6 meses). Necesidades: espacios verdes, parques infantiles, centros comunitarios, Y infraestructura futura (escuela, hospital, estación de bomberos). Presupuesto limitado.",
      mercuryQ1Label: "¿Qué preguntas harías ANTES de decidir prioridades? Lista tus 3 principales:",
      mercuryQ2Label: "Clasifica estas necesidades (1-5) y explica POR QUÉ usando principios de equidad:",
      mercuryQ2ExplanationLabel: "Explica tu clasificación:",
      mercuryDemographics: "Demografía de la Ciudad:",
      familiesWithChildren: "Familias con niños",
      retiredSnowbirds: "Jubilados migratorios (estacionales)",
      rankingInstructions: "Arrastra los elementos para reordenar de mayor (1) a menor (5) prioridad:",
      allScenariosComplete: "¡Todos los Escenarios Completos!",
      totalEquityScore: "Puntuación Total de Equidad:",
      scenarioScores: "Desglose por Escenario:",
      saturnScore: "Ciudad Saturno",
      mercuryScore: "Ciudad Mercurio",
      finalReflection: "Reflexión Final"
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
      loading: "Carregando resultados...",
      backToTeams: "Voltar às Equipes",
      submitScore: "Enviar Pontuação",
      timeLeft: "Tempo Restante",
      scoreSubmittedSuccess: "Pontuação enviada com sucesso, por favor clique em OK para ver o painel de pontuações ao vivo",
      scoreSubmissionFailed: "Falha ao enviar pontuação. Por favor tente novamente.",
      teamsCompleted: "equipes concluídas",
      questionXOfY: "Pergunta",
      readyToPlay: "Pronto para Jogar?",
      gameSessionDescription: "Crie uma nova sessão de jogo à qual todas as 38 equipes podem se juntar. Uma vez criada, você obterá um link compartilhável para todos usarem.",
      creatingGame: "Criando Jogo...",
      launchNewGame: "Lançar Novo Jogo",
      howItWorks: "Como funciona:",
      step1: "Clique em \"Lançar Novo Jogo\" para criar uma sessão",
      step2: "Compartilhe o link gerado com todas as equipes",
      step3: "Cada equipe se junta usando o mesmo link",
      step4: "Veja os resultados integrados de todas as equipes",
      mainTitle: "Implementação de Governança de Dados (DM1)",
      selectWeek: "Selecionar uma Semana",
      week2Title: "Jogo Semana 2",
      week2Description: "Modelos de Governança - Analise cenários reais de cidades",
      week4Title: "Jogo Semana 4",
      week4Description: "Equidade em Ação: Decisões de Dados - Navegue cenários complexos de equidade de dados",
      enterWeek: "Entrar na Semana",
      // Week 4 specific texts
      week4GameTitle: "Equidade em Ação: Decisões de Dados",
      week4Subtitle: "Semana 4: Cenários Avançados de Equidade de Dados",
      week4Instructions: "Bem-vindo à Equidade em Ação: Decisões de Dados",
      week4InstructionDesc: "Navegue cenários complexos envolvendo decisões de equidade de dados em duas cidades planetárias diferentes.",
      week4Purpose: "Propósito do Jogo:",
      week4PurposeText: "Desenvolver habilidades de pensamento crítico sobre equidade de dados, reconhecimento de viés e tomada de decisões inclusiva.",
      week4GameInstructions: "Instruções:",
      week4Instruction1: "Complete 2 cenários: Cidade Saturno e Estação Mercúrio",
      week4Instruction2: "Cada cenário apresenta desafios de equidade de dados",
      week4Instruction3: "Forneça respostas reflexivas para dilemas éticos",
      week4Instruction4: "Construa sua Pontuação de Equidade através de decisões justas e inclusivas",
      week4TimeLimit: "Limite de Tempo: 8 minutos total (3.5 min por cenário + tempo de reflexão)",
      week4StartGame: "Iniciar Desafio de Equidade",
      week4ScenarioProgress: "Progresso do Cenário",
      week4EquityMeter: "Pontuação de Equidade",
      week4NextScenario: "Próximo Cenário",
      week4Finish: "Finalizar Desafio",
      week4SaturnScenario: "Privacidade de Dados da Cidade Saturno",
      week4MercuryScenario: "Alocação de Recursos da Estação Mercúrio",
      week4ScenarioPlaceholder: "O conteúdo do cenário será carregado aqui...",
      week4Dashboard: "Resultados do Desafio de Equidade",
      // Saturn scenario specific texts
      saturnScenarioTitle: "Cidade de Saturno",
      saturnScenarioDesc: "Saturno é uma cidade costeira. O prefeito quer expandir o turismo da praia (lojas + carnaval) mas só tem orçamento para ISSO OU para resistência climática (árvores, parques sombreados) para os residentes. Estudantes universitários visitam durante as férias de primavera, mas os residentes sofrem nos verões quentes.",
      saturnQ1Label: "Que dados você coletaria para tomar uma decisão equitativa? Digite 3-5 pontos de dados:",
      saturnQ2Label: "Como você equilibraria a economia turística vs. necessidades climáticas dos residentes? Explique sua abordagem:",
      submitAnswer: "Enviar Resposta",
      questionProgress: "Pergunta {current} de {total}",
      scenarioComplete: "Cenário Completo!",
      claudeFeedback: "Feedback do Claude AI:",
      loadingFeedback: "Obtendo feedback da IA...",
      // Mercury scenario specific texts
      mercuryScenarioTitle: "Cidade de Mercúrio",
      mercuryScenarioDesc: "Mercúrio é uma cidade suburbana jovem. 60% são famílias com filhos, 40% são aposentados migratórios (ausentes 6 meses). Necessidades: espaços verdes, playgrounds, centros comunitários, E infraestrutura futura (escola, hospital, estação de bombeiros). Orçamento limitado.",
      mercuryQ1Label: "Que perguntas você faria ANTES de decidir prioridades? Liste suas 3 principais:",
      mercuryQ2Label: "Classifique essas necessidades (1-5) e explique POR QUE usando princípios de equidade:",
      mercuryQ2ExplanationLabel: "Explique sua classificação:",
      mercuryDemographics: "Demografia da Cidade:",
      familiesWithChildren: "Famílias com filhos",
      retiredSnowbirds: "Aposentados migratórios (sazonais)",
      rankingInstructions: "Arraste os itens para reordenar da maior (1) para menor (5) prioridade:",
      allScenariosComplete: "Todos os Cenários Completos!",
      totalEquityScore: "Pontuação Total de Equidade:",
      scenarioScores: "Detalhamento por Cenário:",
      saturnScore: "Cidade Saturno",
      mercuryScore: "Cidade Mercúrio",
      finalReflection: "Reflexão Final"
    }
  };

  const questions = useMemo(() => questionsData[selectedLanguage] || questionsData.en, [selectedLanguage]);
  const text = useMemo(() => textData[selectedLanguage] || textData.en, [selectedLanguage]);

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
              {globalScoreboard.length === 38 ? text.finalRankings : text.waitingForTeams}
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
              {globalScoreboard.length < 38 && globalScoreboard.length > 0 && (
                <div className="text-center py-6 border-2 border-dashed border-slate-300 rounded-2xl">
                  <div className="text-slate-500 text-lg">
                    {text.waitingForTeams}
                  </div>
                  <div className="text-sm text-slate-400 mt-2">
{globalScoreboard.length}/38 {text.teamsCompleted}
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
{text.backToTeams}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Week 4 Scoreboard Screen
  if (showWeek4Scoreboard) {
    const week4Results = globalScoreboard.filter(result => result.week === 4);

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-teal-900 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Language Toggle */}
          <div className="mb-6 flex justify-end">
            <LanguageToggle />
          </div>

          <div className="text-center mb-10">
            {/* Header */}
            <div className="flex items-center justify-center gap-6 mb-8">
              <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-2xl">
                <div className="text-emerald-900 font-bold text-2xl">W4</div>
              </div>
              <div className="text-white">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-emerald-200 to-teal-200 bg-clip-text text-transparent">
                  Week 4 Equity Scoreboard
                </h1>
                <p className="text-xl text-emerald-200 mt-2">Team Equity Scores</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-400 text-white px-8 py-4 rounded-2xl inline-flex items-center gap-3 font-bold text-lg shadow-xl">
              <Trophy className="w-6 h-6" />
              {week4Results.length === 38 ? 'Final Equity Rankings' : 'Waiting for teams to complete...'}
            </div>
          </div>

          {/* Week 4 Scoreboard */}
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-10">
            <div className="space-y-4">
              {week4Results.length === 0 ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                  <p className="text-slate-600 text-lg">Loading equity results...</p>
                </div>
              ) : (
                week4Results.map((result, index) => (
                  <div
                    key={result.teamId}
                    className={`border-2 rounded-2xl p-6 transition-all duration-500 ${
                      result.teamId === selectedTeam?.id
                        ? 'border-emerald-500 bg-gradient-to-r from-emerald-50 to-teal-50 shadow-lg'
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

                        <div className={`flex items-center gap-4 px-6 py-3 rounded-xl bg-gradient-to-r ${result.teamColor || 'from-emerald-500 to-teal-500'} text-white shadow-md`}>
                          <span className="text-2xl">{result.teamEmoji || '🏘️'}</span>
                          <div>
                            <div className="font-bold text-lg">{result.teamName}</div>
                            <div className="text-sm opacity-90">{result.playerName}</div>
                          </div>
                        </div>
                      </div>

                      {/* Equity Score and Details */}
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-slate-800">
                            {result.equityScore || result.score}/100
                          </div>
                          <div className="text-sm text-slate-600">Equity Score</div>
                        </div>

                        <div className="text-center">
                          <div className="text-xl font-semibold text-slate-700">
                            {result.saturnScore || 0}/50
                          </div>
                          <div className="text-sm text-slate-600">Saturn (Beach)</div>
                        </div>

                        <div className="text-center">
                          <div className="text-xl font-semibold text-slate-700">
                            {result.mercuryScore || 0}/50
                          </div>
                          <div className="text-sm text-slate-600">Mercury (Suburban)</div>
                        </div>

                        <div className="text-center">
                          <div className="text-lg font-semibold text-slate-700">
                            {result.questionsCompleted || 0}/4
                          </div>
                          <div className="text-sm text-slate-600">Questions</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}

              {/* Waiting for more teams */}
              {week4Results.length < 38 && week4Results.length > 0 && (
                <div className="text-center py-6 border-2 border-dashed border-slate-300 rounded-2xl">
                  <div className="text-slate-500 text-lg">
                    Waiting for more teams to complete equity scenarios...
                  </div>
                  <div className="text-sm text-slate-400 mt-2">
                    {week4Results.length}/38 teams completed
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-10">
              <button
                onClick={() => {
                  setShowWeek4Scoreboard(false);
                  setShowMainMenu(true);
                }}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 px-8 rounded-xl font-bold text-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 flex items-center justify-center gap-3 shadow-xl transform hover:scale-105"
              >
                Back to Main Menu
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Menu Screen
  if (showMainMenu) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Language Toggle - Top Right */}
          <div className="mb-6 flex justify-end">
            <LanguageToggle />
          </div>

          <div className="text-center">
            {/* Main Title */}
            <div className="mb-12">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent mb-4">
                {text.mainTitle}
              </h1>
              <p className="text-xl text-purple-200">
                {text.selectWeek}
              </p>
            </div>

            {/* Week Selection Cards */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Week 2 */}
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:scale-105">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {text.week2Title}
                  </h2>
                  <p className="text-purple-200 text-lg">
                    {text.week2Description}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowMainMenu(false);
                    setShowGameLauncher(true);
                  }}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 flex items-center justify-center gap-3 shadow-xl"
                >
                  {text.enterWeek} 2
                </button>
              </div>

              {/* Week 4 */}
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:scale-105">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {text.week4GameTitle}
                  </h2>
                  <p className="text-purple-200 text-lg">
                    {text.week4Description}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedWeek('4');
                    setShowMainMenu(false);
                    setShowGameLauncher(true);
                  }}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 flex items-center justify-center gap-3 shadow-xl"
                >
                  {text.enterWeek} 4
                </button>
              </div>
            </div>

            {/* Scoreboard Navigation */}
            <div className="mt-12">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">View Results</h3>
              <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                <button
                  onClick={() => {
                    setShowMainMenu(false);
                    setShowScoreboard(true);
                  }}
                  className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-400/30 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-purple-600/30 hover:to-blue-600/30 transition-all duration-300 flex items-center justify-center gap-3 backdrop-blur-sm"
                >
                  <Trophy className="w-5 h-5" />
                  Week 2 Scoreboard
                </button>
                <button
                  onClick={() => {
                    setShowMainMenu(false);
                    setShowWeek4Scoreboard(true);
                  }}
                  className="bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border border-emerald-400/30 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-emerald-600/30 hover:to-teal-600/30 transition-all duration-300 flex items-center justify-center gap-3 backdrop-blur-sm"
                >
                  <Trophy className="w-5 h-5" />
                  Week 4 Equity Results
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Week 4 Game Flow
  if (selectedWeek === '4' && showGameLauncher && !gameSessionCreated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-teal-900 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Language Toggle - Top Right */}
          <div className="mb-6 flex justify-end">
            <LanguageToggle />
          </div>

          <div className="text-center">
            {/* Header */}
            <div className="flex items-center justify-center gap-6 mb-12">
              <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-2xl">
                <div className="text-emerald-900 font-bold text-2xl">W4</div>
              </div>
              <div className="text-white">
                <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-emerald-200 to-teal-200 bg-clip-text text-transparent">
                  {text.week4GameTitle}
                </h1>
                <p className="text-2xl text-emerald-200 mt-3">{text.week4Subtitle}</p>
              </div>
            </div>

            {/* Main Launch Area */}
            <div key={selectedLanguage} className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-12 max-w-2xl mx-auto">
              <div className="mb-8">
                <div className="w-24 h-24 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <div className="text-white font-bold text-2xl">⚖️</div>
                </div>
                <h2 className="text-4xl font-bold text-slate-800 mb-4">
                  {text.readyToPlay}
                </h2>
                <p className="text-xl text-slate-600 leading-relaxed mb-8">
                  {text.gameSessionDescription}
                </p>
              </div>

              <button
                onClick={createNewGameSession}
                disabled={creatingSession}
                className={`w-full py-6 px-12 rounded-2xl font-bold text-2xl transition-all duration-300 flex items-center justify-center gap-4 shadow-xl ${
                  creatingSession
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white transform hover:scale-105'
                }`}
              >
                {creatingSession ? text.creatingGame : text.launchNewGame}
              </button>

              <div className="mt-8 text-left">
                <h3 className="text-xl font-bold text-slate-700 mb-4">{text.howItWorks}</h3>
                <ul className="space-y-3 text-slate-600">
                  <li className="flex items-start gap-3">
                    <span className="bg-emerald-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-0.5">1</span>
                    {text.step1}
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="bg-emerald-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-0.5">2</span>
                    {text.step2}
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="bg-emerald-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-0.5">3</span>
                    {text.step3}
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="bg-emerald-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-0.5">4</span>
                    {text.step4}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Game Launcher Screen (Week 2)
  if (selectedWeek === '2' && showGameLauncher && !gameSessionCreated) {
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
            <div key={selectedLanguage} className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-12 max-w-2xl mx-auto">
              <div className="mb-8">
                <Trophy className="w-24 h-24 text-purple-600 mx-auto mb-6" />
                <h2 className="text-4xl font-bold text-slate-800 mb-4">
                  {text.readyToPlay}
                </h2>
                <p className="text-xl text-slate-600 leading-relaxed mb-8">
                  {text.gameSessionDescription}
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
                    {text.creatingGame}
                  </>
                ) : (
                  <>
                    <Trophy className="w-8 h-8" />
                    {text.launchNewGame}
                  </>
                )}
              </button>

              <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-center gap-2 text-blue-700 text-sm font-medium mb-2">
                  <Users className="w-4 h-4" />
                  {text.howItWorks}
                </div>
                <ul className="text-sm text-blue-600 text-left space-y-1">
                  <li>• {text.step1}</li>
                  <li>• {text.step2}</li>
                  <li>• {text.step3}</li>
                  <li>• {text.step4}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Team Selection Screen
  // Week 4 Team Selection
  if (selectedWeek === '4' && teamSelectionStep && gameSessionCreated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-teal-900 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Language Toggle - Top Right */}
          <div className="mb-6 flex justify-end">
            <LanguageToggle />
          </div>

          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-6 mb-8">
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-2xl">
                <div className="text-emerald-900 font-bold text-lg">W4</div>
              </div>
              <div className="text-white">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-emerald-200 to-teal-200 bg-clip-text text-transparent">
                  {text.week4GameTitle}
                </h1>
                <p className="text-xl text-emerald-200 mt-2">{text.week4Subtitle}</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 text-white px-8 py-4 rounded-2xl inline-flex items-center gap-3 font-bold text-lg shadow-xl">
              <div className="text-2xl">⚖️</div>
              {text.week4Instructions}
            </div>
          </div>

          {/* Team Selection */}
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-10 max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <Users className="w-20 h-20 text-emerald-600 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-slate-800 mb-3">{text.teamSelection}</h2>
              <p className="text-slate-600 text-lg">{text.teamSelectionDesc}</p>

              {/* Game Session Sharing */}
              {gameSessionCreated && gameUrl && (
                <div className="mt-6 p-6 bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl shadow-lg">
                  <div className="flex items-center justify-center gap-2 text-emerald-700 font-bold mb-3 text-lg">
                    <Share2 className="w-5 h-5" />
                    ⚖️ Week 4 Game Session Active - Share This Link!
                  </div>
                  <div className="flex items-center gap-3 bg-white border-2 border-emerald-200 rounded-lg p-3 shadow-sm">
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
                      }}
                      className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm hover:bg-emerald-600 font-medium transition-colors"
                    >
                      Copy Link
                    </button>
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <p className="text-sm text-emerald-700 font-medium">All teams must use this exact link to join the same game!</p>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 max-h-96 overflow-y-auto">
              {teams.map((team) => {
                const teamActive = isTeamActive(team.id);
                const teamCompleted = globalScoreboard.some(result => result.teamId === team.id);

                return (
                  <button
                    key={team.id}
                    onClick={() => !teamActive && !teamCompleted && selectTeam(team)}
                    disabled={teamActive || teamCompleted}
                    className={`group relative overflow-hidden rounded-xl p-3 text-white font-bold text-sm transition-all duration-300 transform shadow-lg ${
                      teamActive || teamCompleted
                        ? 'opacity-50 cursor-not-allowed bg-gray-400'
                        : `bg-gradient-to-r ${team.color} hover:scale-105 hover:shadow-xl`
                    }`}
                  >
                    <div className="relative z-10">
                      <div className="text-center">
                        <div className="text-lg font-bold">{team.name}</div>
                      </div>
                    </div>

                    {teamActive && (
                      <div className="absolute inset-0 bg-yellow-500 bg-opacity-75 flex items-center justify-center z-20">
                        <div className="text-yellow-900 font-bold text-xs">PLAYING</div>
                      </div>
                    )}

                    {teamCompleted && (
                      <div className="absolute inset-0 bg-green-500 bg-opacity-75 flex items-center justify-center z-20">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between items-center mt-8">
              <button
                onClick={resetGame}
                className="bg-slate-600 text-white py-3 px-6 rounded-xl font-bold hover:bg-slate-700 transition-colors flex items-center gap-2"
              >
                <Users className="w-5 h-5" />
                {text.backToTeams}
              </button>

              {selectedTeam && (
                <button
                  onClick={() => {
                    setTeamSelectionStep(false);
                    setWeek4ShowInstructions(true);
                  }}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 px-8 rounded-xl font-bold hover:from-emerald-700 hover:to-teal-700 transition-all flex items-center gap-2 shadow-xl"
                >
                  {text.continueWithTeam} {selectedTeam.name}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Week 2 Team Selection
  if (selectedWeek === '2' && teamSelectionStep && gameSessionCreated) {
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

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 max-h-96 overflow-y-auto">
              {teams.map((team) => {
                const teamActive = isTeamActive(team.id);
                const teamCompleted = globalScoreboard.some(result => result.teamId === team.id);

                return (
                  <button
                    key={team.id}
                    onClick={() => !teamActive && !teamCompleted && selectTeam(team)}
                    disabled={teamActive || teamCompleted}
                    className={`group relative overflow-hidden rounded-xl p-3 text-white font-bold text-sm transition-all duration-300 transform shadow-lg ${
                      teamActive || teamCompleted
                        ? `bg-gradient-to-br ${team.color} opacity-60 cursor-not-allowed`
                        : `bg-gradient-to-br ${team.color} hover:scale-105 hover:shadow-xl`
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center h-full">
                      <span className="text-center leading-tight text-sm font-bold">{team.name}</span>
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
← {text.backToTeams}
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
                onClick={async () => {
                  console.log('=== SUBMITTING SCORE ===');
                  const teamResult = {
                    teamId: selectedTeam.id,
                    teamName: selectedTeam.name,
                    teamColor: selectedTeam.color,
                    teamEmoji: selectedTeam.emoji,
                    playerName: teamName,
                    score: score,
                    totalQuestions: questions.length,
                    completionTime: completionTime,
                    answers: answers,
                    timestamp: Date.now(),
                    earnedBadge: score >= 3
                  };

                  console.log('Submitting score:', teamResult);
                  const success = await submitResult(teamResult);
                  console.log('Submit result:', success);

                  if (success) {
                    // Show success message and wait for user to click OK
                    const userConfirmed = confirm(`✅ ${text.scoreSubmittedSuccess}`);
                    if (userConfirmed) {
                      // Redirect to scoreboard after user clicks OK
                      setShowScoreboard(true);
                    }
                  } else {
                    alert(`❌ ${text.scoreSubmissionFailed}`);
                  }
                }}
                className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white py-4 px-8 rounded-xl font-bold text-lg hover:from-green-700 hover:to-blue-700 transition-all duration-300 flex items-center justify-center gap-3 shadow-xl transform hover:scale-105"
              >
                <Trophy className="w-5 h-5" />
{text.submitScore}
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

  // Week 4 Instructions Screen
  if (selectedWeek === '4' && week4ShowInstructions && !teamSelectionStep) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-teal-900 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Language Toggle */}
          <div className="mb-6 flex justify-end">
            <LanguageToggle />
          </div>

          {/* Header */}
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-6 mb-8">
              <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-2xl">
                <div className="text-emerald-900 font-bold text-2xl">⚖️</div>
              </div>
              <div className="text-white">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-emerald-200 to-teal-200 bg-clip-text text-transparent">
                  {text.week4GameTitle}
                </h1>
                <p className="text-xl text-emerald-200 mt-2">{text.week4Subtitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-2">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r ${selectedTeam?.color} text-white shadow-md`}>
                <span className="font-semibold">{selectedTeam?.name}</span>
              </div>
              <span className="text-emerald-200">|</span>
              <span className="text-emerald-200 text-lg">{teamName}</span>
            </div>
          </div>

          {/* Instructions Card */}
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-10 mb-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                <div className="text-white font-bold text-2xl">⚖️</div>
              </div>
              <h2 className="text-3xl font-bold text-slate-800 mb-4">{text.week4Instructions}</h2>
              <p className="text-slate-600 text-lg leading-relaxed">{text.week4InstructionDesc}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-emerald-800 mb-4">{text.week4Purpose}</h3>
                <p className="text-emerald-700">{text.week4PurposeText}</p>
              </div>

              <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-teal-800 mb-4">{text.week4GameInstructions}</h3>
                <ul className="space-y-2 text-teal-700">
                  <li className="flex items-start gap-2">
                    <span className="text-teal-500 font-bold">•</span>
                    {text.week4Instruction1}
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-500 font-bold">•</span>
                    {text.week4Instruction2}
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-500 font-bold">•</span>
                    {text.week4Instruction3}
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-500 font-bold">•</span>
                    {text.week4Instruction4}
                  </li>
                </ul>
              </div>
            </div>

            <div className="text-center mt-8">
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 mb-8">
                <Clock className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                <p className="text-amber-800 font-semibold">{text.week4TimeLimit}</p>
              </div>

              <button
                onClick={() => {
                  setWeek4ShowInstructions(false);
                  setWeek4GameStarted(true);
                }}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 px-8 rounded-xl font-bold text-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 flex items-center justify-center gap-3 shadow-xl transform hover:scale-105"
              >
                <div className="text-2xl">⚖️</div>
                {text.week4StartGame}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Week 4 Game Screen
  if (selectedWeek === '4' && week4GameStarted && !week4ShowDashboard) {
    const scenarios = [
      { name: text.week4SaturnScenario, planet: 'Saturn' },
      { name: text.week4MercuryScenario, planet: 'Mercury' }
    ];

    const currentScenarioData = scenarios[week4CurrentScenario];

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-teal-900 p-6">
        <div className="max-w-5xl mx-auto">
          {/* Header with Timer and Progress */}
          <div className="flex justify-between items-center mb-8">
            <div className="text-white">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-emerald-200 to-teal-200 bg-clip-text text-transparent">
                {text.week4GameTitle}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r ${selectedTeam?.color} text-white shadow-md`}>
                  <span className="font-semibold">{selectedTeam?.name}</span>
                </div>
                <span className="text-emerald-200">|</span>
                <span className="text-emerald-200 text-lg">{teamName}</span>
              </div>
            </div>

            <div className="text-right">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3 text-white border border-white/10 mb-2">
                <Clock className="w-5 h-5 inline mr-2" />
                <span className="text-xl font-bold">{Math.floor(week4TimeLeft / 60)}:{(week4TimeLeft % 60).toString().padStart(2, '0')}</span>
              </div>
              <div className="text-emerald-200 text-sm">
                {text.week4ScenarioProgress}: {week4CurrentScenario + 1}/2
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-white/20 rounded-full h-3 mb-8 shadow-inner">
            <div
              className="bg-gradient-to-r from-emerald-400 to-teal-400 h-3 rounded-full transition-all duration-500 shadow-lg"
              style={{ width: `${((week4CurrentScenario + 1) / 2) * 100}%` }}
            />
          </div>

          {/* Equity Meter */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8 border border-white/20">
            <h3 className="text-emerald-200 font-bold text-lg mb-3 text-center">{text.week4EquityMeter}</h3>
            <div className="bg-white/20 rounded-full h-4 mb-2">
              <div
                className="bg-gradient-to-r from-emerald-400 to-teal-400 h-4 rounded-full transition-all duration-500"
                style={{ width: `${week4EquityScore}%` }}
              />
            </div>
            <div className="text-center text-emerald-200 text-sm">{week4EquityScore}/100</div>
          </div>

          {/* Scenario Content */}
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-10">
            {week4CurrentScenario === 0 && (
              <div>
                {/* Saturn Scenario Header */}
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <div className="text-4xl">🏖️</div>
                    <h2 className="text-3xl font-bold text-slate-800">{text.saturnScenarioTitle}</h2>
                    <div className="text-4xl">☀️</div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-amber-50 rounded-xl p-6 border border-blue-200 mb-6">
                    <p className="text-slate-700 text-lg leading-relaxed">
                      {text.saturnScenarioDesc}
                    </p>
                  </div>

                  <div className="bg-emerald-50 rounded-lg p-4 mb-6">
                    <p className="text-emerald-800 font-semibold">
                      {text.questionProgress.replace('{current}', saturnCurrentQuestion).replace('{total}', '2')}
                    </p>
                  </div>
                </div>

                {/* Question 1 */}
                {saturnCurrentQuestion === 1 && (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200">
                      <h3 className="text-xl font-bold text-slate-800 mb-4">{text.saturnQ1Label}</h3>
                      <textarea
                        value={saturnQ1Response}
                        onChange={(e) => setSaturnQ1Response(e.target.value)}
                        className="w-full h-32 p-4 border border-emerald-300 rounded-lg resize-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="Enter 3-5 data points you would collect..."
                        disabled={saturnQ1Submitted}
                      />

                      <div className="flex justify-between items-center mt-4">
                        <div className="text-sm text-slate-600">
                          Time remaining: {Math.floor(saturnQuestionTimeLeft / 60)}:{(saturnQuestionTimeLeft % 60).toString().padStart(2, '0')}
                        </div>

                        <button
                          onClick={async () => {
                            setSaturnQ1Submitted(true);
                            const feedback = await getClaudeFeedback(saturnQ1Response, "equity data collection for resource allocation", 1);
                            setSaturnQ1Feedback(feedback);
                            updateWeek4Scores(feedback.categoryScores);
                          }}
                          disabled={saturnQ1Submitted || !saturnQ1Response.trim()}
                          className={`px-6 py-3 rounded-lg font-bold transition-all ${
                            saturnQ1Submitted || !saturnQ1Response.trim()
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700'
                          }`}
                        >
                          {saturnQ1Submitted ? '✓ Submitted' : text.submitAnswer}
                        </button>
                      </div>
                    </div>

                    {/* Q1 Feedback */}
                    {saturnQ1Feedback && (
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                        <h4 className="text-lg font-bold text-blue-800 mb-3">{text.claudeFeedback}</h4>
                        <p className="text-blue-700 mb-4">{saturnQ1Feedback.feedback}</p>
                        <div className="text-sm text-blue-600">
                          <strong>Score contribution:</strong> +{Math.round(saturnQ1Feedback.score / 4)} equity points
                        </div>

                        <button
                          onClick={() => {
                            setSaturnCurrentQuestion(2);
                            setSaturnQuestionTimeLeft(120); // 2 minutes for Q2
                          }}
                          className="mt-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-lg font-bold hover:from-emerald-700 hover:to-teal-700 transition-all"
                        >
                          Next Question →
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Question 2 */}
                {saturnCurrentQuestion === 2 && (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200">
                      <h3 className="text-xl font-bold text-slate-800 mb-4">{text.saturnQ2Label}</h3>
                      <textarea
                        value={saturnQ2Response}
                        onChange={(e) => setSaturnQ2Response(e.target.value)}
                        className="w-full h-32 p-4 border border-emerald-300 rounded-lg resize-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="Explain your approach to balancing stakeholder needs..."
                        disabled={saturnQ2Submitted}
                      />

                      <div className="flex justify-between items-center mt-4">
                        <div className="text-sm text-slate-600">
                          Time remaining: {Math.floor(saturnQuestionTimeLeft / 60)}:{(saturnQuestionTimeLeft % 60).toString().padStart(2, '0')}
                        </div>

                        <button
                          onClick={async () => {
                            setSaturnQ2Submitted(true);
                            const feedback = await getClaudeFeedback(saturnQ2Response, "balancing stakeholder needs with equity focus", 1);
                            setSaturnQ2Feedback(feedback);
                            updateWeek4Scores(feedback.categoryScores);
                            setSaturnScenarioComplete(true);
                          }}
                          disabled={saturnQ2Submitted || !saturnQ2Response.trim()}
                          className={`px-6 py-3 rounded-lg font-bold transition-all ${
                            saturnQ2Submitted || !saturnQ2Response.trim()
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700'
                          }`}
                        >
                          {saturnQ2Submitted ? '✓ Submitted' : text.submitAnswer}
                        </button>
                      </div>
                    </div>

                    {/* Q2 Feedback */}
                    {saturnQ2Feedback && (
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                        <h4 className="text-lg font-bold text-blue-800 mb-3">{text.claudeFeedback}</h4>
                        <p className="text-blue-700 mb-4">{saturnQ2Feedback.feedback}</p>
                        <div className="text-sm text-blue-600 mb-4">
                          <strong>Score contribution:</strong> +{Math.round(saturnQ2Feedback.score / 4)} equity points
                        </div>

                        <div className="bg-green-100 border border-green-300 rounded-lg p-4">
                          <div className="flex items-center gap-2 text-green-800 font-bold mb-2">
                            <span className="text-2xl">🎉</span>
                            {text.scenarioComplete}
                          </div>
                          <p className="text-green-700">You have completed the Saturn City scenario. Ready to move to Mercury Station?</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Mercury Scenario */}
            {week4CurrentScenario === 1 && (
              <div>
                {/* Mercury Scenario Header */}
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <div className="text-4xl">🏘️</div>
                    <h2 className="text-3xl font-bold text-slate-800">{text.mercuryScenarioTitle}</h2>
                    <div className="text-4xl">👥</div>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200 mb-6">
                    <p className="text-slate-700 text-lg leading-relaxed mb-4">
                      {text.mercuryScenarioDesc}
                    </p>

                    {/* Demographics Visualization */}
                    <div className="bg-white rounded-lg p-4 border border-green-200">
                      <h4 className="text-lg font-bold text-slate-800 mb-3">{text.mercuryDemographics}</h4>
                      <div className="flex items-center gap-4">
                        <div className="flex-1 bg-blue-100 rounded-lg p-3 text-center">
                          <div className="text-2xl font-bold text-blue-800">60%</div>
                          <div className="text-sm text-blue-600">{text.familiesWithChildren}</div>
                        </div>
                        <div className="flex-1 bg-orange-100 rounded-lg p-3 text-center">
                          <div className="text-2xl font-bold text-orange-800">40%</div>
                          <div className="text-sm text-orange-600">{text.retiredSnowbirds}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-emerald-50 rounded-lg p-4 mb-6">
                    <p className="text-emerald-800 font-semibold">
                      {text.questionProgress.replace('{current}', mercuryCurrentQuestion).replace('{total}', '2')}
                    </p>
                  </div>
                </div>

                {/* Question 1 */}
                {mercuryCurrentQuestion === 1 && (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200">
                      <h3 className="text-xl font-bold text-slate-800 mb-4">{text.mercuryQ1Label}</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <span className="text-emerald-600 font-bold">1.</span>
                          <input
                            type="text"
                            value={mercuryQ1Response.split('\n')[0] || ''}
                            onChange={(e) => {
                              const lines = mercuryQ1Response.split('\n');
                              lines[0] = e.target.value;
                              setMercuryQ1Response(lines.join('\n'));
                            }}
                            className="flex-1 p-3 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            placeholder="First question you would ask..."
                            disabled={mercuryQ1Submitted}
                          />
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-emerald-600 font-bold">2.</span>
                          <input
                            type="text"
                            value={mercuryQ1Response.split('\n')[1] || ''}
                            onChange={(e) => {
                              const lines = mercuryQ1Response.split('\n');
                              lines[1] = e.target.value;
                              setMercuryQ1Response(lines.join('\n'));
                            }}
                            className="flex-1 p-3 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            placeholder="Second question you would ask..."
                            disabled={mercuryQ1Submitted}
                          />
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-emerald-600 font-bold">3.</span>
                          <input
                            type="text"
                            value={mercuryQ1Response.split('\n')[2] || ''}
                            onChange={(e) => {
                              const lines = mercuryQ1Response.split('\n');
                              lines[2] = e.target.value;
                              setMercuryQ1Response(lines.join('\n'));
                            }}
                            className="flex-1 p-3 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            placeholder="Third question you would ask..."
                            disabled={mercuryQ1Submitted}
                          />
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-4">
                        <div className="text-sm text-slate-600">
                          Time remaining: {Math.floor(mercuryQuestionTimeLeft / 60)}:{(mercuryQuestionTimeLeft % 60).toString().padStart(2, '0')}
                        </div>

                        <button
                          onClick={async () => {
                            setMercuryQ1Submitted(true);
                            const feedback = await getClaudeFeedback(mercuryQ1Response, "pre-decision data governance questions", 2);
                            setMercuryQ1Feedback(feedback);
                            updateWeek4Scores(feedback.categoryScores);
                          }}
                          disabled={mercuryQ1Submitted || !mercuryQ1Response.trim()}
                          className={`px-6 py-3 rounded-lg font-bold transition-all ${
                            mercuryQ1Submitted || !mercuryQ1Response.trim()
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700'
                          }`}
                        >
                          {mercuryQ1Submitted ? '✓ Submitted' : text.submitAnswer}
                        </button>
                      </div>
                    </div>

                    {/* Q1 Feedback */}
                    {mercuryQ1Feedback && (
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                        <h4 className="text-lg font-bold text-blue-800 mb-3">{text.claudeFeedback}</h4>
                        <p className="text-blue-700 mb-4">{mercuryQ1Feedback.feedback}</p>
                        <div className="text-sm text-blue-600">
                          <strong>Score contribution:</strong> +{Math.round(mercuryQ1Feedback.score / 4)} equity points
                        </div>

                        <button
                          onClick={() => {
                            setMercuryCurrentQuestion(2);
                            setMercuryQuestionTimeLeft(120); // 2 minutes for Q2
                          }}
                          className="mt-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-lg font-bold hover:from-emerald-700 hover:to-teal-700 transition-all"
                        >
                          Next Question →
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Question 2 - Ranking */}
                {mercuryCurrentQuestion === 2 && (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200">
                      <h3 className="text-xl font-bold text-slate-800 mb-4">{text.mercuryQ2Label}</h3>

                      <div className="mb-4">
                        <p className="text-sm text-slate-600 mb-3">{text.rankingInstructions}</p>
                        <div className="space-y-2">
                          {mercuryQ2Ranking.map((item, index) => (
                            <div
                              key={item}
                              className="flex items-center gap-3 p-3 bg-white border border-emerald-300 rounded-lg cursor-move hover:bg-emerald-50 transition-colors"
                              draggable={!mercuryQ2Submitted}
                              onDragStart={(e) => {
                                e.dataTransfer.setData('text/plain', index.toString());
                              }}
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={(e) => {
                                e.preventDefault();
                                const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
                                const dropIndex = index;

                                if (dragIndex !== dropIndex) {
                                  const newRanking = [...mercuryQ2Ranking];
                                  const draggedItem = newRanking[dragIndex];
                                  newRanking.splice(dragIndex, 1);
                                  newRanking.splice(dropIndex, 0, draggedItem);
                                  setMercuryQ2Ranking(newRanking);
                                }
                              }}
                            >
                              <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold">
                                {index + 1}
                              </div>
                              <span className="flex-1 font-medium">{item}</span>
                              <div className="text-slate-400">☰</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="block text-lg font-bold text-slate-800 mb-2">
                          {text.mercuryQ2ExplanationLabel}
                        </label>
                        <textarea
                          value={mercuryQ2Explanation}
                          onChange={(e) => setMercuryQ2Explanation(e.target.value)}
                          className="w-full h-32 p-4 border border-emerald-300 rounded-lg resize-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          placeholder="Explain your ranking decisions based on equity principles..."
                          disabled={mercuryQ2Submitted}
                        />
                      </div>

                      <div className="flex justify-between items-center mt-4">
                        <div className="text-sm text-slate-600">
                          Time remaining: {Math.floor(mercuryQuestionTimeLeft / 60)}:{(mercuryQuestionTimeLeft % 60).toString().padStart(2, '0')}
                        </div>

                        <button
                          onClick={async () => {
                            setMercuryQ2Submitted(true);
                            const rankingData = {
                              ranking: mercuryQ2Ranking,
                              explanation: mercuryQ2Explanation
                            };
                            const feedback = await getClaudeFeedback(JSON.stringify(rankingData), "infrastructure prioritization with equity lens", 2);
                            setMercuryQ2Feedback(feedback);
                            updateWeek4Scores(feedback.categoryScores);
                            setMercuryScenarioComplete(true);
                          }}
                          disabled={mercuryQ2Submitted || !mercuryQ2Explanation.trim()}
                          className={`px-6 py-3 rounded-lg font-bold transition-all ${
                            mercuryQ2Submitted || !mercuryQ2Explanation.trim()
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700'
                          }`}
                        >
                          {mercuryQ2Submitted ? '✓ Submitted' : text.submitAnswer}
                        </button>
                      </div>
                    </div>

                    {/* Q2 Feedback */}
                    {mercuryQ2Feedback && (
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                        <h4 className="text-lg font-bold text-blue-800 mb-3">{text.claudeFeedback}</h4>
                        <p className="text-blue-700 mb-4">{mercuryQ2Feedback.feedback}</p>
                        <div className="text-sm text-blue-600 mb-4">
                          <strong>Score contribution:</strong> +{Math.round(mercuryQ2Feedback.score / 4)} equity points
                        </div>

                        <div className="bg-green-100 border border-green-300 rounded-lg p-4">
                          <div className="flex items-center gap-2 text-green-800 font-bold mb-2">
                            <span className="text-2xl">🎉</span>
                            {text.allScenariosComplete}
                          </div>
                          <p className="text-green-700">You have completed both scenarios! View your final results.</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

            {/* Navigation */}
            <div className="flex justify-between items-center mt-8">
              <button
                onClick={() => {
                  setWeek4ShowInstructions(true);
                  setWeek4GameStarted(false);
                }}
                className="bg-slate-600 text-white py-3 px-6 rounded-xl font-bold hover:bg-slate-700 transition-colors"
              >
                ← Instructions
              </button>

              <div className="flex gap-4">
                {week4CurrentScenario < 1 ? (
                  <button
                    onClick={() => {
                      setWeek4CurrentScenario(1);
                      setWeek4ScenarioComplete([true, false]);
                    }}
                    disabled={!saturnScenarioComplete}
                    className={`py-3 px-8 rounded-xl font-bold transition-all ${
                      saturnScenarioComplete
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {text.week4NextScenario}
                  </button>
                ) : (
                  <button
                    onClick={() => setWeek4ShowDashboard(true)}
                    disabled={!mercuryScenarioComplete}
                    className={`py-3 px-8 rounded-xl font-bold transition-all ${
                      mercuryScenarioComplete
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {text.week4Finish}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Submit Week 4 result when dashboard is shown
  useEffect(() => {
    if (selectedWeek === '4' && week4ShowDashboard && selectedTeam && teamName) {
      const saturnScore = saturnQ1Feedback && saturnQ2Feedback
        ? Math.round((saturnQ1Feedback.score + saturnQ2Feedback.score) / 4)
        : 0;

      const mercuryScore = mercuryQ1Feedback && mercuryQ2Feedback
        ? Math.round((mercuryQ1Feedback.score + mercuryQ2Feedback.score) / 4)
        : 0;

      const totalEquityScore = saturnScore + mercuryScore;

      const week4Result = {
        teamId: selectedTeam.id,
        teamName: selectedTeam.name,
        playerName: teamName,
        week: 4,
        gameType: 'equity-scenarios',
        score: totalEquityScore,
        maxScore: 100,
        equityScore: totalEquityScore,
        saturnScore: saturnScore,
        mercuryScore: mercuryScore,
        completionTime: Date.now(),
        scenariosCompleted: week4ScenarioComplete.filter(Boolean).length,
        questionsCompleted: [saturnQ1Submitted, saturnQ2Submitted, mercuryQ1Submitted, mercuryQ2Submitted].filter(Boolean).length,
        details: {
          saturn: {
            q1Response: saturnQ1Response,
            q2Response: saturnQ2Response,
            q1Feedback: saturnQ1Feedback,
            q2Feedback: saturnQ2Feedback
          },
          mercury: {
            q1Response: mercuryQ1Response,
            q2Ranking: mercuryQ2Ranking,
            q2Explanation: mercuryQ2Explanation,
            q1Feedback: mercuryQ1Feedback,
            q2Feedback: mercuryQ2Feedback
          }
        }
      };

      console.log('Submitting Week 4 result:', week4Result);
      submitWeek4Result(week4Result);
    }
  }, [selectedWeek, week4ShowDashboard, selectedTeam, teamName, week4EquityScore, saturnQ1Feedback, saturnQ2Feedback, mercuryQ1Feedback, mercuryQ2Feedback]);

  // Week 4 Reflection Screen
  if (selectedWeek === '4' && week4ShowReflection) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Language Toggle */}
          <div className="mb-6 flex justify-end">
            <LanguageToggle />
          </div>

          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent mb-4">
              Final Reflection
            </h1>
            <p className="text-xl text-purple-200">Analyzing your equity approach (1 minute)</p>
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-10">
            {/* API Analysis Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">AI</span>
                </div>
                Claude's Analysis of Your Equity Principles
              </h2>
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
                {week4ComprehensiveAnalysis ? (
                  <p className="text-slate-700 text-lg leading-relaxed">{week4ComprehensiveAnalysis}</p>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                    <p className="text-slate-600">Generating comprehensive equity analysis...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Key Takeaway */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                <div className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></div>
                Key Takeaway
              </h3>
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200">
                {week4PersonalizedInsight ? (
                  <p className="text-slate-700 text-lg leading-relaxed font-medium">{week4PersonalizedInsight}</p>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600"></div>
                    <p className="text-slate-600">Generating personalized insight...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Reflection Input */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                <div className="w-6 h-6 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"></div>
                Your Reflection
              </h3>
              <p className="text-slate-600 mb-4">Type one thing you'll do differently in real data governance work:</p>
              <textarea
                value={week4ReflectionInput}
                onChange={(e) => setWeek4ReflectionInput(e.target.value)}
                placeholder="I will..."
                className="w-full h-32 p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-slate-700"
              />
            </div>

            {/* Continue Button */}
            <div className="text-center">
              <button
                onClick={() => {
                  setWeek4ShowReflection(false);
                  setWeek4ShowDashboard(true);
                }}
                disabled={!week4ReflectionInput.trim()}
                className={`px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                  week4ReflectionInput.trim()
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 transform hover:scale-105'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Continue to Final Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Week 4 Enhanced Dashboard
  if (selectedWeek === '4' && week4ShowDashboard) {
    // Calculate badge level
    const getBadgeInfo = (score) => {
      if (score >= 80) return { level: "Equity Champion", color: "from-yellow-400 to-orange-500", emoji: "🏆" };
      if (score >= 60) return { level: "Equity Aware", color: "from-gray-400 to-gray-600", emoji: "🥈" };
      return { level: "Equity Learner", color: "from-orange-400 to-red-500", emoji: "🥉" };
    };

    const badgeInfo = getBadgeInfo(week4EquityScore);

    // Generate completion certificate timestamp
    const certificateTimestamp = new Date().toLocaleString();

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-teal-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-emerald-200 to-teal-200 bg-clip-text text-transparent mb-8">
              Final Equity Dashboard
            </h1>
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-10">
              {/* Badge and Overall Score */}
              <div className="text-center mb-8">
                <div className="mb-6">
                  <div className={`w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-r ${badgeInfo.color} flex items-center justify-center text-6xl shadow-2xl`}>
                    {badgeInfo.emoji}
                  </div>
                  <h2 className="text-3xl font-bold text-slate-800 mb-2">{badgeInfo.level}</h2>
                  <div className="text-6xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
                    {week4EquityScore}/100
                  </div>
                  <p className="text-lg text-slate-600">Overall Equity Score</p>
                </div>

                {/* 4-Category Skill Breakdown (Spider Chart Alternative) */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                    <h4 className="text-sm font-bold text-blue-800 mb-2">Completeness</h4>
                    <div className="text-2xl font-bold text-blue-700">{week4Scores.completeness}/25</div>
                    <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{width: `${(week4Scores.completeness/25)*100}%`}}></div>
                    </div>
                    <p className="text-xs text-blue-600 mt-1">Identifying factors</p>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                    <h4 className="text-sm font-bold text-purple-800 mb-2">Equity Focus</h4>
                    <div className="text-2xl font-bold text-purple-700">{week4Scores.equityFocus}/35</div>
                    <div className="w-full bg-purple-200 rounded-full h-2 mt-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{width: `${(week4Scores.equityFocus/35)*100}%`}}></div>
                    </div>
                    <p className="text-xs text-purple-600 mt-1">Marginalized groups</p>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                    <h4 className="text-sm font-bold text-green-800 mb-2">Systems Thinking</h4>
                    <div className="text-2xl font-bold text-green-700">{week4Scores.systemsThinking}/25</div>
                    <div className="w-full bg-green-200 rounded-full h-2 mt-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{width: `${(week4Scores.systemsThinking/25)*100}%`}}></div>
                    </div>
                    <p className="text-xs text-green-600 mt-1">Seeing connections</p>
                  </div>

                  <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
                    <h4 className="text-sm font-bold text-orange-800 mb-2">Data Awareness</h4>
                    <div className="text-2xl font-bold text-orange-700">{week4Scores.dataAwareness}/15</div>
                    <div className="w-full bg-orange-200 rounded-full h-2 mt-2">
                      <div className="bg-orange-600 h-2 rounded-full" style={{width: `${(week4Scores.dataAwareness/15)*100}%`}}></div>
                    </div>
                    <p className="text-xs text-orange-600 mt-1">Right questions</p>
                  </div>
                </div>

                {/* Scenario Comparison Bars */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-2xl">🏖️</div>
                      <h3 className="text-xl font-bold text-blue-800">Saturn (Beach City)</h3>
                    </div>
                    <div className="text-3xl font-bold text-blue-700 mb-2">
                      {saturnQ1Feedback && saturnQ2Feedback
                        ? Math.round((saturnQ1Feedback.totalScore + saturnQ2Feedback.totalScore) / 2)
                        : 0}/100
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-3 mb-2">
                      <div
                        className="bg-blue-600 h-3 rounded-full transition-all duration-1000"
                        style={{width: `${saturnQ1Feedback && saturnQ2Feedback ? (saturnQ1Feedback.totalScore + saturnQ2Feedback.totalScore) / 2 : 0}%`}}
                      ></div>
                    </div>
                    <p className="text-blue-600 text-sm">Tourism vs climate adaptation</p>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-2xl">🏘️</div>
                      <h3 className="text-xl font-bold text-green-800">Mercury (Suburban)</h3>
                    </div>
                    <div className="text-3xl font-bold text-green-700 mb-2">
                      {mercuryQ1Feedback && mercuryQ2Feedback
                        ? Math.round((mercuryQ1Feedback.totalScore + mercuryQ2Feedback.totalScore) / 2)
                        : 0}/100
                    </div>
                    <div className="w-full bg-green-200 rounded-full h-3 mb-2">
                      <div
                        className="bg-green-600 h-3 rounded-full transition-all duration-1000"
                        style={{width: `${mercuryQ1Feedback && mercuryQ2Feedback ? (mercuryQ1Feedback.totalScore + mercuryQ2Feedback.totalScore) / 2 : 0}%`}}
                      ></div>
                    </div>
                    <p className="text-green-600 text-sm">Infrastructure prioritization</p>
                  </div>
                </div>

                {/* Strengths and Areas for Improvement */}
                <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl p-6 border border-slate-200 mb-8">
                  <h3 className="text-xl font-bold text-slate-800 mb-4">Summary of Performance</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-bold text-emerald-700 mb-3 flex items-center gap-2">
                        <div className="w-4 h-4 bg-emerald-500 rounded-full"></div>
                        Strengths
                      </h4>
                      <ul className="text-sm text-slate-600 space-y-2">
                        {week4Scores.equityFocus >= 25 && <li>• Strong focus on equity and marginalized communities</li>}
                        {week4Scores.completeness >= 18 && <li>• Comprehensive consideration of multiple factors</li>}
                        {week4Scores.systemsThinking >= 18 && <li>• Good systems thinking and connection recognition</li>}
                        {week4Scores.dataAwareness >= 10 && <li>• Asking relevant data governance questions</li>}
                        {week4ReflectionInput && <li>• Thoughtful reflection on practical applications</li>}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold text-amber-700 mb-3 flex items-center gap-2">
                        <div className="w-4 h-4 bg-amber-500 rounded-full"></div>
                        Growth Areas
                      </h4>
                      <ul className="text-sm text-slate-600 space-y-2">
                        {week4Scores.equityFocus < 25 && <li>• Consider more marginalized community perspectives</li>}
                        {week4Scores.completeness < 18 && <li>• Explore additional factors in decision-making</li>}
                        {week4Scores.systemsThinking < 18 && <li>• Look for broader systemic connections</li>}
                        {week4Scores.dataAwareness < 10 && <li>• Ask more specific data governance questions</li>}
                        <li>• Continue applying equity principles in real data work</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Personal Reflection */}
                {week4ReflectionInput && (
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200 mb-8">
                    <h3 className="text-xl font-bold text-purple-800 mb-4">Your Commitment</h3>
                    <div className="bg-white p-4 rounded-lg border border-purple-200">
                      <p className="text-slate-700 italic">"{week4ReflectionInput}"</p>
                    </div>
                  </div>
                )}

                {/* Completion Certificate */}
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-6 border border-amber-200 mb-8 text-center">
                  <h3 className="text-xl font-bold text-amber-800 mb-2">🎓 Certificate of Completion</h3>
                  <p className="text-amber-700 mb-2">
                    <strong>{teamName}</strong> from <strong>{selectedTeam?.name}</strong>
                  </p>
                  <p className="text-sm text-amber-600">
                    Successfully completed Week 4: Equity in Data Governance
                  </p>
                  <p className="text-xs text-amber-500 mt-2">
                    Completed on: {certificateTimestamp}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => {
                    setWeek4ShowDashboard(false);
                    setShowWeek4Scoreboard(true);
                  }}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2"
                >
                  <Trophy className="w-5 h-5" />
                  Team Rankings
                </button>

                <button
                  onClick={() => {
                    // Reset all Week 4 states for replay
                    setWeek4GameStarted(false);
                    setWeek4ShowDashboard(false);
                    setWeek4ShowReflection(false);
                    setWeek4ShowInstructions(true);
                    setWeek4CurrentScenario(0);
                    setWeek4EquityScore(0);
                    setWeek4Scores({completeness: 0, equityFocus: 0, systemsThinking: 0, dataAwareness: 0});
                    setWeek4ReflectionInput('');
                    setSaturnQ1Response('');
                    setSaturnQ2Response('');
                    setSaturnQ1Feedback(null);
                    setSaturnQ2Feedback(null);
                    setSaturnQ1Submitted(false);
                    setSaturnQ2Submitted(false);
                    setSaturnScenarioComplete(false);
                    setMercuryQ1Response('');
                    setMercuryQ2Explanation('');
                    setMercuryQ2Ranking(['Playgrounds', 'Senior center', 'Fire station', 'School', 'Hospital']);
                    setMercuryQ1Feedback(null);
                    setMercuryQ2Feedback(null);
                    setMercuryQ1Submitted(false);
                    setMercuryQ2Submitted(false);
                    setMercuryScenarioComplete(false);
                  }}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-green-700 hover:to-emerald-700 transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  Play Again
                </button>

                <button
                  onClick={() => {
                    const shareUrl = window.location.href;
                    const shareText = `I just completed Week 4: Equity in Data Governance and earned ${badgeInfo.level} with a score of ${week4EquityScore}/100! 🎓`;

                    if (navigator.share) {
                      navigator.share({
                        title: 'Data Governance Game Results',
                        text: shareText,
                        url: shareUrl
                      });
                    } else {
                      navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
                      alert('Results copied to clipboard!');
                    }
                  }}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-cyan-700 transition-all flex items-center justify-center gap-2"
                >
                  <Share2 className="w-5 h-5" />
                  Share Results
                </button>

                <button
                  onClick={() => {
                    setShowMainMenu(true);
                    setSelectedWeek(null);
                    setWeek4GameStarted(false);
                    setWeek4ShowDashboard(false);
                    setWeek4ShowInstructions(true);
                    setTeamSelectionStep(true);
                  }}
                  className="bg-gradient-to-r from-slate-600 to-gray-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-slate-700 hover:to-gray-700 transition-all"
                >
                  Main Menu
                </button>
              </div>
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
{text.questionXOfY} {currentQuestion + 1} of {questions.length}
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