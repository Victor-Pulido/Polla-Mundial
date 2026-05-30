// Equipos Oficiales para la Polla (32 Selecciones)
export const TEAMS = [
  // Grupo A
  { id: "usa", name: "Estados Unidos", countryCode: "US", groupLetter: "A", flag: "🇺🇸" },
  { id: "mex", name: "México", countryCode: "MX", groupLetter: "A", flag: "🇲🇽" },
  { id: "can", name: "Canadá", countryCode: "CA", groupLetter: "A", flag: "🇨🇦" },
  { id: "pan", name: "Panamá", countryCode: "PA", groupLetter: "A", flag: "🇵🇦" },

  // Grupo B
  { id: "arg", name: "Argentina", countryCode: "AR", groupLetter: "B", flag: "🇦🇷" },
  { id: "uru", name: "Uruguay", countryCode: "UY", groupLetter: "B", flag: "🇺🇾" },
  { id: "chi", name: "Chile", countryCode: "CL", groupLetter: "B", flag: "🇨🇱" },
  { id: "per", name: "Perú", countryCode: "PE", groupLetter: "B", flag: "🇵🇪" },

  // Grupo C
  { id: "bra", name: "Brasil", countryCode: "BR", groupLetter: "C", flag: "🇧🇷" },
  { id: "col", name: "Colombia", countryCode: "CO", groupLetter: "C", flag: "🇨🇴" },
  { id: "ecu", name: "Ecuador", countryCode: "EC", groupLetter: "C", flag: "🇪🇨" },
  { id: "ven", name: "Venezuela", countryCode: "VE", groupLetter: "C", flag: "🇻🇪" },

  // Grupo D
  { id: "fra", name: "Francia", countryCode: "FR", groupLetter: "D", flag: "🇫🇷" },
  { id: "ned", name: "Países Bajos", countryCode: "NL", groupLetter: "D", flag: "🇳🇱" },
  { id: "aut", name: "Austria", countryCode: "AT", groupLetter: "D", flag: "🇦🇹" },
  { id: "pol", name: "Polonia", countryCode: "PL", groupLetter: "D", flag: "🇵🇱" },

  // Grupo E
  { id: "esp", name: "España", countryCode: "ES", groupLetter: "E", flag: "🇪🇸" },
  { id: "ger", name: "Alemania", countryCode: "DE", groupLetter: "E", flag: "🇩🇪" },
  { id: "jpn", name: "Japón", countryCode: "JP", groupLetter: "E", flag: "🇯🇵" },
  { id: "crc", name: "Costa Rica", countryCode: "CR", groupLetter: "E", flag: "🇨🇷" },

  // Grupo F
  { id: "eng", name: "Inglaterra", countryCode: "GB", groupLetter: "F", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { id: "ita", name: "Italia", countryCode: "IT", groupLetter: "F", flag: "🇮🇹" },
  { id: "cro", name: "Croacia", countryCode: "HR", groupLetter: "F", flag: "🇭🇷" },
  { id: "sui", name: "Suiza", countryCode: "CH", groupLetter: "F", flag: "🇨🇭" },

  // Grupo G
  { id: "bel", name: "Bélgica", countryCode: "BE", groupLetter: "G", flag: "🇧🇪" },
  { id: "por", name: "Portugal", countryCode: "PT", groupLetter: "G", flag: "🇵🇹" },
  { id: "mar", name: "Marruecos", countryCode: "MA", groupLetter: "G", flag: "🇲🇦" },
  { id: "tur", name: "Turquía", countryCode: "TR", groupLetter: "G", flag: "🇹🇷" },

  // Grupo H
  { id: "sen", name: "Senegal", countryCode: "SN", groupLetter: "H", flag: "🇸🇳" },
  { id: "cmr", name: "Camerún", countryCode: "CM", groupLetter: "H", flag: "🇨🇲" },
  { id: "kor", name: "Corea del Sur", countryCode: "KR", groupLetter: "H", flag: "🇰🇷" },
  { id: "aus", name: "Australia", countryCode: "AU", groupLetter: "H", flag: "🇦🇺" }
];

// Estadios Icónicos del Mundial 2026
export const STADIUMS = [
  "Estadio Azteca (CDMX)",
  "MetLife Stadium (New York/New Jersey)",
  "SoFi Stadium (Los Angeles)",
  "AT&T Stadium (Dallas)",
  "Mercedes-Benz Stadium (Atlanta)",
  "Hard Rock Stadium (Miami)",
  "BC Place (Vancouver)",
  "Lumen Field (Seattle)"
];

// Generar partidos programáticamente
export const generateMatches = () => {
  const matches = [];
  let matchId = 1;
  
  // Fecha de inicio: 11 de Junio de 2026
  const baseDate = new Date("2026-06-11T14:00:00Z");

  const groups = ["A", "B", "C", "D", "E", "F", "G", "H"];
  
  groups.forEach((groupLetter, groupIdx) => {
    const groupTeams = TEAMS.filter(t => t.groupLetter === groupLetter);
    
    // Rondas estándar todos contra todos (Round Robin)
    // Ronda 1: T0 vs T1, T2 vs T3
    // Ronda 2: T0 vs T2, T1 vs T3
    // Ronda 3: T0 vs T3, T1 vs T2
    const pairings = [
      [0, 1], [2, 3], // Ronda 1
      [0, 2], [1, 3], // Ronda 2
      [0, 3], [1, 2]  // Ronda 3
    ];

    pairings.forEach((pair, pairIdx) => {
      const teamA = groupTeams[pair[0]];
      const teamB = groupTeams[pair[1]];
      
      // Incrementar fecha: 4 partidos por día
      // Cada grupo juega sus partidos espaciados por unos días
      const daysOffset = groupIdx * 1.5 + Math.floor(pairIdx / 2) * 4;
      const hoursOffset = (pairIdx % 2 === 0) ? 14 : 18; // 14:00 o 18:00
      
      const matchDate = new Date(baseDate);
      matchDate.setDate(baseDate.getDate() + daysOffset);
      matchDate.setHours(hoursOffset, 0, 0, 0);

      matches.push({
        id: `m-${matchId++}`,
        matchDate: matchDate.toISOString(),
        stage: "groups",
        groupLetter,
        teamAId: teamA.id,
        teamBId: teamB.id,
        stadium: STADIUMS[matchId % STADIUMS.length],
        status: "pending", // pending | live | finished
        finalScoreA: null,
        finalScoreB: null,
        hasExtraTime: false,
        wentToPenalties: false
      });
    });
  });

  // --- ELIMINATORIAS (Octavos, Cuartos, Semis, Tercer Lugar, Final) ---
  // Fecha inicio eliminatorias: 28 de Junio de 2026
  const elimBaseDate = new Date("2026-06-28T14:00:00Z");

  // OCTAVOS DE FINAL (8 partidos)
  // Estructura: 1A vs 2B, 1B vs 2A, etc.
  const octavosConfig = [
    { label: "1A vs 2B", key: "oct-1", teamAPlaceholder: "1° Grupo A", teamBPlaceholder: "2° Grupo B", dateAdd: 0, hour: 14 },
    { label: "1C vs 2D", key: "oct-2", teamAPlaceholder: "1° Grupo C", teamBPlaceholder: "2° Grupo D", dateAdd: 0, hour: 18 },
    { label: "1D vs 2C", key: "oct-3", teamAPlaceholder: "1° Grupo D", teamBPlaceholder: "2° Grupo C", dateAdd: 1, hour: 14 },
    { label: "1B vs 2A", key: "oct-4", teamAPlaceholder: "1° Grupo B", teamBPlaceholder: "2° Grupo A", dateAdd: 1, hour: 18 },
    { label: "1E vs 2F", key: "oct-5", teamAPlaceholder: "1° Grupo E", teamBPlaceholder: "2° Grupo F", dateAdd: 2, hour: 14 },
    { label: "1G vs 2H", key: "oct-6", teamAPlaceholder: "1° Grupo G", teamBPlaceholder: "2° Grupo H", dateAdd: 2, hour: 18 },
    { label: "1H vs 2G", key: "oct-7", teamAPlaceholder: "1° Grupo H", teamBPlaceholder: "2° Grupo G", dateAdd: 3, hour: 14 },
    { label: "1F vs 2E", key: "oct-8", teamAPlaceholder: "1° Grupo F", teamBPlaceholder: "2° Grupo E", dateAdd: 3, hour: 18 },
  ];

  octavosConfig.forEach((config) => {
    const matchDate = new Date(elimBaseDate);
    matchDate.setDate(elimBaseDate.getDate() + config.dateAdd);
    matchDate.setHours(config.hour, 0, 0, 0);

    matches.push({
      id: config.key,
      matchDate: matchDate.toISOString(),
      stage: "octavos",
      teamAId: null, // Asignado dinámicamente cuando termine fase de grupos
      teamBId: null,
      teamAPlaceholder: config.teamAPlaceholder,
      teamBPlaceholder: config.teamBPlaceholder,
      stadium: STADIUMS[matchId++ % STADIUMS.length],
      status: "pending",
      finalScoreA: null,
      finalScoreB: null,
      hasExtraTime: true,
      wentToPenalties: false
    });
  });

  // CUARTOS DE FINAL (4 partidos)
  const quartersConfig = [
    { label: "W.Oct-1 vs W.Oct-2", key: "qtr-1", teamAPlaceholder: "Ganador Oct-1", teamBPlaceholder: "Ganador Oct-2", dateAdd: 5, hour: 14 },
    { label: "W.Oct-3 vs W.Oct-4", key: "qtr-2", teamAPlaceholder: "Ganador Oct-3", teamBPlaceholder: "Ganador Oct-4", dateAdd: 5, hour: 18 },
    { label: "W.Oct-5 vs W.Oct-6", key: "qtr-3", teamAPlaceholder: "Ganador Oct-5", teamBPlaceholder: "Ganador Oct-6", dateAdd: 6, hour: 14 },
    { label: "W.Oct-7 vs W.Oct-8", key: "qtr-4", teamAPlaceholder: "Ganador Oct-7", teamBPlaceholder: "Ganador Oct-8", dateAdd: 6, hour: 18 },
  ];

  quartersConfig.forEach((config) => {
    const matchDate = new Date(elimBaseDate);
    matchDate.setDate(elimBaseDate.getDate() + config.dateAdd);
    matchDate.setHours(config.hour, 0, 0, 0);

    matches.push({
      id: config.key,
      matchDate: matchDate.toISOString(),
      stage: "quarters",
      teamAId: null,
      teamBId: null,
      teamAPlaceholder: config.teamAPlaceholder,
      teamBPlaceholder: config.teamBPlaceholder,
      stadium: STADIUMS[matchId++ % STADIUMS.length],
      status: "pending",
      finalScoreA: null,
      finalScoreB: null,
      hasExtraTime: true,
      wentToPenalties: false
    });
  });

  // SEMIFINALES (2 partidos)
  const semisConfig = [
    { label: "W.Qtr-1 vs W.Qtr-2", key: "semi-1", teamAPlaceholder: "Ganador Cuartos 1", teamBPlaceholder: "Ganador Cuartos 2", dateAdd: 10, hour: 18 },
    { label: "W.Qtr-3 vs W.Qtr-4", key: "semi-2", teamAPlaceholder: "Ganador Cuartos 3", teamBPlaceholder: "Ganador Cuartos 4", dateAdd: 11, hour: 18 },
  ];

  semisConfig.forEach((config) => {
    const matchDate = new Date(elimBaseDate);
    matchDate.setDate(elimBaseDate.getDate() + config.dateAdd);
    matchDate.setHours(config.hour, 0, 0, 0);

    matches.push({
      id: config.key,
      matchDate: matchDate.toISOString(),
      stage: "semis",
      teamAId: null,
      teamBId: null,
      teamAPlaceholder: config.teamAPlaceholder,
      teamBPlaceholder: config.teamBPlaceholder,
      stadium: STADIUMS[matchId++ % STADIUMS.length],
      status: "pending",
      finalScoreA: null,
      finalScoreB: null,
      hasExtraTime: true,
      wentToPenalties: false
    });
  });

  // TERCER LUGAR (1 partido)
  const thirdPlaceDate = new Date(elimBaseDate);
  thirdPlaceDate.setDate(elimBaseDate.getDate() + 15);
  thirdPlaceDate.setHours(14, 0, 0, 0);
  matches.push({
    id: "third_place",
    matchDate: thirdPlaceDate.toISOString(),
    stage: "third_place",
    teamAId: null,
    teamBId: null,
    teamAPlaceholder: "Perdedor Semi 1",
    teamBPlaceholder: "Perdedor Semi 2",
    stadium: STADIUMS[matchId++ % STADIUMS.length],
    status: "pending",
    finalScoreA: null,
    finalScoreB: null,
    hasExtraTime: true,
    wentToPenalties: false
  });

  // FINAL (1 partido)
  const finalDate = new Date(elimBaseDate);
  finalDate.setDate(elimBaseDate.getDate() + 16);
  finalDate.setHours(18, 0, 0, 0);
  matches.push({
    id: "final",
    matchDate: finalDate.toISOString(),
    stage: "final",
    teamAId: null,
    teamBId: null,
    teamAPlaceholder: "Ganador Semi 1",
    teamBPlaceholder: "Ganador Semi 2",
    stadium: STADIUMS[1], // MetLife Stadium para la final oficial
    status: "pending",
    finalScoreA: null,
    finalScoreB: null,
    hasExtraTime: true,
    wentToPenalties: false
  });

  return matches;
};
