/* ═══════════════════════════════════════════════════════════════════════════
   ONE RECORD — script.js
   1,000 films · 100 years · IMDb Top 1000
   Features: Multi-Mode Layouts (Vinyl / Timeline Wave / Critic vs Audience),
             Omni-Search (Title, Director, Actor),
             Runtime Evolution Filter,
             Director Constellations,
             Poster Tooltip & Detail Modal
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── 1. THEME POLARITY HARMONIZER (DARK / LIGHT) ───────────────────────── */

  const THEMES = {
    dark: {
      id: 'dark',
      name: 'Dark Mode',
      decades: {
        '1920': '#C8A96A', '1930': '#C8A96A',
        '1940': '#7AAF8E', '1950': '#7AAF8E',
        '1960': '#D4734A', '1970': '#D4734A',
        '1980': '#9B72CF', '1990': '#9B72CF',
        '2000': '#89C4DC', '2010': '#89C4DC',
        '2020': '#E2E2E2', 'unknown': '#4A4A4A'
      },
      genres: {
        'Drama':     '#D4A853',
        'Action':    '#E07030',
        'Comedy':    '#7DC060',
        'Crime':     '#C05050',
        'Biography': '#60A0C0',
        'Animation': '#E0C840',
        'Adventure': '#50C090',
        'Mystery':   '#9880C0',
        'Horror':    '#A03030',
        'Western':   '#C08040',
        'Film-Noir': '#B0A07A',
        'Fantasy':   '#A060D0',
        'Family':    '#80D090',
        'Thriller':  '#8060B0',
        'Sci-Fi':    '#40B0D0',
        'Romance':   '#D06080',
        'History':   '#C09050',
        'War':       '#708060',
        'Music':     '#E050A0',
        'Musical':   '#E060D0',
        'Sport':     '#60C050'
      },
      vinylStops: ['#1B1B1B', '#111111', '#080808'],
      labelStops: ['#272727', '#181818'],
      grooveStroke: 'rgba(255, 255, 255, 0.035)',
      grooveOuter: 'rgba(255, 255, 255, 0.07)',
      centerRing: 'rgba(255, 255, 255, 0.04)',
      centerBorder: '#2E2E2E',
      centerTitle: '#F0F0F0',
      centerSub: '#999999',
      centerCount: '#AAAAAA',
      centerHint: '#777777'
    },
    light: {
      id: 'light',
      name: 'Light Mode',
      decades: {
        '1920': '#EA580C', '1930': '#EA580C',
        '1940': '#0D9488', '1950': '#0D9488',
        '1960': '#E11D48', '1970': '#E11D48',
        '1980': '#7C3AED', '1990': '#7C3AED',
        '2000': '#0284C7', '2010': '#0284C7',
        '2020': '#059669', 'unknown': '#475569'
      },
      genres: {
        'Drama':     '#D97706',
        'Action':    '#EA580C',
        'Comedy':    '#16A34A',
        'Crime':     '#DC2626',
        'Biography': '#0284C7',
        'Animation': '#CA8A04',
        'Adventure': '#0D9488',
        'Mystery':   '#9333EA',
        'Horror':    '#B91C1C',
        'Western':   '#C2410C',
        'Film-Noir': '#334155',
        'Fantasy':   '#C026D3',
        'Family':    '#10B981',
        'Thriller':  '#7E22CE',
        'Sci-Fi':    '#0891B2',
        'Romance':   '#E11D48',
        'History':   '#B45309',
        'War':       '#4D7C0F',
        'Music':     '#DB2777',
        'Musical':   '#A21CAF',
        'Sport':     '#65A30D'
      },
      vinylStops: ['#FFFFFF', '#F8FAFC', '#F1F5F9'],
      labelStops: ['#FFFFFF', '#F8FAFC'],
      grooveStroke: 'rgba(15, 23, 42, 0.06)',
      grooveOuter: 'rgba(15, 23, 42, 0.12)',
      centerRing: 'rgba(15, 23, 42, 0.06)',
      centerBorder: '#E2E8F0',
      centerTitle: '#2D3748',
      centerSub: '#718096',
      centerCount: '#4A5568',
      centerHint: '#A0AEC0'
    }
  };

  let currentTheme = (function() {
    try { return localStorage.getItem('viz_theme') || 'dark'; } catch (e) { return 'dark'; }
  })();

  const DECADE_COLOR = THEMES[currentTheme]?.decades || THEMES.dark.decades;
  const GENRE_COLOR  = THEMES[currentTheme]?.genres  || THEMES.dark.genres;

  const DECADE_GROUP = {
    '1920': '1920', '1930': '1920',
    '1940': '1940', '1950': '1940',
    '1960': '1960', '1970': '1960',
    '1980': '1980', '1990': '1980',
    '2000': '2000', '2010': '2000',
    '2020': '2020', 'unknown': 'unknown'
  };

  /* ── 2. VIEWPORT & GEOMETRY ─────────────────────────────────────────────── */

  const W = window.innerWidth;
  const H = window.innerHeight;

  const rightPanelW = W > 1000 ? 240 : 0;
  const topBarH     = 54;
  const canvasW     = W - rightPanelW;
  const canvasH     = H - topBarH;
  const cx          = canvasW / 2;
  const cy          = topBarH + canvasH / 2;

  // Record geometry
  const SHORT      = Math.min(canvasW, canvasH);
  const outerR     = SHORT * 0.44;
  const innerR     = outerR * 0.30;
  const ringStart  = innerR + 18;
  const ringEnd    = outerR - 8;

  /* ── 3. DATA PROCESSING ─────────────────────────────────────────────────── */

  function getDecade(y) {
    if (!y || isNaN(y)) return 'unknown';
    return String(Math.floor(y / 10) * 10);
  }

  function getRuntimeCategory(rt) {
    if (!rt) return 'standard';
    if (rt < 90) return 'short';
    if (rt <= 120) return 'standard';
    if (rt <= 150) return 'long';
    return 'epic';
  }

  function tokenize(str) {
    if (!str) return [];
    return str.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
  }

  function wordMatches(w, tok) {
    if (!w || !tok) return false;
    if (tok.length <= 2) {
      return w === tok || w.startsWith(tok);
    }
    if (tok.length <= 4) {
      return w.startsWith(tok);
    }
    return w.startsWith(tok) || w.includes(tok);
  }

  function phraseMatches(targetNorm, query) {
    if (!targetNorm || !query) return false;
    if (query.length <= 3) {
      const regex = new RegExp('(^|\\s)' + query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      return regex.test(targetNorm);
    }
    return targetNorm.includes(query);
  }

  const rawFilms = (window.FILM_DATA || []).filter(d => d.r != null);

  const films = rawFilms.map(d => {
    const decade       = getDecade(d.y);
    const primaryGenre = (d.g || '').split(',')[0].trim() || 'Unknown';
    const actors       = [d.s1, d.s2, d.s3, d.s4].filter(Boolean);
    const titleWords   = tokenize(d.t);
    const titleNorm    = (d.t || '').toLowerCase();
    const dirWords     = tokenize(d.dir);
    const dirNorm      = (d.dir || '').toLowerCase();
    const actorEntries = actors.map(a => ({
      nameNorm: a.toLowerCase(),
      words: tokenize(a)
    }));
    const yearStr      = String(d.y || '');
    const genres       = tokenize(d.g);
    const allWords     = [
      ...titleWords,
      ...dirWords,
      ...actorEntries.flatMap(a => a.words),
      ...genres,
      yearStr
    ];

    return {
      ...d,
      rating:       Math.round(d.r * 10) / 10,
      decade,
      decadeGroup:  DECADE_GROUP[decade] || 'unknown',
      decadeColor:  DECADE_COLOR[decade] || '#4A4A4A',
      primaryGenre,
      genreColor:   GENRE_COLOR[primaryGenre] || '#777777',
      rtCat:        getRuntimeCategory(d.rt),
      actors,
      titleWords,
      titleNorm,
      dirWords,
      dirNorm,
      actorEntries,
      yearStr,
      allWords
    };
  });

  const filmsById = Object.fromEntries(films.map(f => [f.id, f]));

  // Rating domain
  const byRating = d3.group(films, d => d.rating);
  const ratings  = Array.from(byRating.keys()).sort((a, b) => b - a);
  const rMin     = d3.min(ratings); // 7.6
  const rMax     = d3.max(ratings); // 9.3

  // Unified size scale: strictly and consistently determined by IMDb Rating across all modes
  const dotSizeRating = d3.scalePow().exponent(1.4)
    .domain([rMin, rMax]).range([1.8, 10.2]).clamp(true);

  function getDotRadius(d) {
    return dotSizeRating(d.rating);
  }

  // Group films by director for constellation lines
  const byDirector = d3.group(films, d => d.dir);

  // Top genres for filter panel
  const genreCountMap = new Map();
  films.forEach(f => {
    genreCountMap.set(f.primaryGenre, (genreCountMap.get(f.primaryGenre) || 0) + 1);
  });
  const topGenres = [...genreCountMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .filter(([g]) => g && g !== 'Unknown')
    .slice(0, 10)
    .map(([g]) => g);

  /* ── 4. MULTI-MODE COORDINATE SYSTEMS ───────────────────────────────────── */

  // ── Mode 1: Vinyl Record Coordinates ──
  const rScale = d3.scaleLinear()
    .domain([rMax, rMin]).range([ringStart, ringEnd]).clamp(true);

  const posRecord = new Map();
  ratings.forEach(rating => {
    const r    = rScale(rating);
    const ring = (byRating.get(rating) || []).slice()
      .sort((a, b) => (a.y || 9999) - (b.y || 9999));
    const n    = ring.length;
    ring.forEach((film, i) => {
      const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
      posRecord.set(film.id, {
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle)
      });
    });
  });

  // ── Mode 2: Timeline Wave Coordinates ──
  const timePadX = 72;
  const timePadYTop = 85;
  const timePadYBottom = 88;
  const timeX = d3.scaleLinear()
    .domain([1920, 2020])
    .range([timePadX, canvasW - timePadX]);

  const timeY = d3.scaleLinear()
    .domain([7.6, 9.3])
    .range([topBarH + canvasH - timePadYBottom, topBarH + timePadYTop]);

  // Jitter for timeline clusters
  const byYearRating = d3.group(films, d => `${d.y || 1995}_${d.rating}`);
  const posTimeline = new Map();
  byYearRating.forEach(group => {
    const m = group.length;
    group.forEach((film, k) => {
      const baseX = timeX(film.y || 1995);
      const baseY = timeY(film.rating);
      const offsetX = m > 1 ? (k - (m - 1) / 2) * 5.5 : 0;
      const offsetY = m > 1 ? (k % 2 === 0 ? -1 : 1) * Math.floor((k + 1) / 2) * 4.5 : 0;
      posTimeline.set(film.id, {
        x: baseX + offsetX,
        y: baseY + offsetY
      });
    });
  });

  // ── Mode 3: Critic vs Audience Galaxy Coordinates ──
  const galPadX = 75;
  const galPadYTop = 85;
  const galPadYBottom = 88;
  const galX = d3.scaleLinear()
    .domain([40, 100])
    .range([galPadX, canvasW - galPadX]);

  const galY = d3.scaleLinear()
    .domain([7.6, 9.3])
    .range([topBarH + canvasH - galPadYBottom, topBarH + galPadYTop]);

  const byScorePair = d3.group(films, d => `${d.ms || 70}_${d.rating}`);
  const posGalaxy = new Map();
  byScorePair.forEach(group => {
    const m = group.length;
    group.forEach((film, k) => {
      const ms = film.ms != null ? film.ms : 70; // fallback median
      const baseX = galX(ms);
      const baseY = galY(film.rating);
      const offsetX = m > 1 ? (k - (m - 1) / 2) * 5.0 : 0;
      const offsetY = m > 1 ? (k % 2 === 0 ? -1 : 1) * Math.floor((k + 1) / 2) * 4.0 : 0;
      posGalaxy.set(film.id, {
        x: baseX + offsetX,
        y: baseY + offsetY
      });
    });
  });

  // Initial active mode
  let currentMode = 'record'; // 'record' | 'timeline' | 'galaxy'

  /* ── 5. SVG CANVAS & SCENERY SETUP ──────────────────────────────────────── */

  const svg  = d3.select('#record-svg').attr('width', W).attr('height', H);
  const defs = svg.append('defs');

  // Vinyl body gradient
  const vg = defs.append('radialGradient').attr('id', 'vinyl-grad')
    .attr('cx', '50%').attr('cy', '50%').attr('r', '50%');
  const vgStop0 = vg.append('stop').attr('offset', '0%').attr('stop-color', '#1B1B1B');
  const vgStop1 = vg.append('stop').attr('offset', '55%').attr('stop-color', '#111111');
  const vgStop2 = vg.append('stop').attr('offset', '100%').attr('stop-color', '#080808');

  // Label radial gradient
  const lg = defs.append('radialGradient').attr('id', 'label-grad')
    .attr('cx', '50%').attr('cy', '50%').attr('r', '50%');
  const lgStop0 = lg.append('stop').attr('offset', '0%').attr('stop-color', '#272727');
  const lgStop1 = lg.append('stop').attr('offset', '100%').attr('stop-color', '#181818');

  // Glow filter for hovered dot
  const gf = defs.append('filter').attr('id', 'dot-glow')
    .attr('x', '-60%').attr('y', '-60%').attr('width', '220%').attr('height', '220%');
  gf.append('feGaussianBlur').attr('in', 'SourceGraphic').attr('stdDeviation', '3').attr('result', 'blur');
  const fm = gf.append('feMerge');
  fm.append('feMergeNode').attr('in', 'blur');
  fm.append('feMergeNode').attr('in', 'SourceGraphic');

  // ── Scenery Layers ──
  const recordScenery   = svg.append('g').attr('class', 'record-scenery');
  const timelineScenery = svg.append('g').attr('class', 'timeline-scenery').style('display', 'none');
  const galaxyScenery   = svg.append('g').attr('class', 'galaxy-scenery').style('display', 'none');
  const constellationG  = svg.append('g').attr('class', 'constellation-layer');
  const dotsGroup       = svg.append('g').attr('class', 'dots-group');
  const spotlightG      = svg.append('g').attr('class', 'spotlight-layer');
  const labelG          = svg.append('g').attr('class', 'label-group');

  /* ── 6. DRAW SCENERY PER MODE ───────────────────────────────────────────── */

  // ── Vinyl Record Scenery ──
  const vinylDiscCircle = recordScenery.append('circle').attr('cx', cx).attr('cy', cy).attr('r', outerR)
    .attr('fill', 'url(#vinyl-grad)');

  for (let i = 0; i <= 30; i++) {
    recordScenery.append('circle')
      .attr('class', 'vinyl-groove-line')
      .attr('cx', cx).attr('cy', cy)
      .attr('r', ringStart + i * ((ringEnd - ringStart) / 30))
      .attr('fill', 'none')
      .attr('stroke', 'rgba(255,255,255,0.035)')
      .attr('stroke-width', 0.6);
  }

  const grooveOuterCircle = recordScenery.append('circle').attr('cx', cx).attr('cy', cy).attr('r', outerR - 1)
    .attr('fill', 'none').attr('stroke', 'rgba(255,255,255,0.07)').attr('stroke-width', 1.5);

  // Center Label
  const centerLabelDisc = labelG.append('circle').attr('cx', cx).attr('cy', cy).attr('r', innerR)
    .attr('fill', 'url(#label-grad)').attr('stroke', '#2E2E2E').attr('stroke-width', 1.2);

  const centerLabelRing = labelG.append('circle').attr('cx', cx).attr('cy', cy).attr('r', innerR * 0.78)
    .attr('fill', 'none').attr('stroke', 'rgba(255,255,255,0.04)').attr('stroke-width', 0.8);

  labelG.append('circle').attr('cx', cx).attr('cy', cy).attr('r', 4.5)
    .attr('fill', '#000').attr('stroke', '#222').attr('stroke-width', 0.8);

  const CF = "'Barlow Condensed', monospace";
  const fU = innerR * 0.095;

  const centerTitleText = labelG.append('text').attr('x', cx).attr('y', cy - innerR * 0.28)
    .attr('text-anchor', 'middle').attr('font-size', `${Math.max(18, fU * 1.85)}px`)
    .attr('font-weight', '700').attr('font-family', CF).attr('fill', '#F0F0F0').attr('letter-spacing', '0.14em')
    .text('ONE RECORD');

  const centerSubText = labelG.append('text').attr('x', cx).attr('y', cy - innerR * 0.08)
    .attr('text-anchor', 'middle').attr('font-size', `${Math.max(8, fU * 0.76)}px`)
    .attr('font-family', CF).attr('fill', '#999999').attr('letter-spacing', '0.24em')
    .text('A CENTURY OF CINEMA');

  const countEl = labelG.append('text').attr('x', cx).attr('y', cy + innerR * 0.24)
    .attr('text-anchor', 'middle').attr('font-size', `${Math.max(10, fU * 1.0)}px`)
    .attr('font-weight', '600').attr('font-family', CF).attr('fill', '#AAAAAA').attr('letter-spacing', '0.18em')
    .text('1000 FILMS');

  const centerHintText = labelG.append('text').attr('x', cx).attr('y', cy + innerR * 0.44)
    .attr('text-anchor', 'middle').attr('font-size', `${Math.max(7, fU * 0.62)}px`)
    .attr('font-family', CF).attr('fill', '#777777').attr('letter-spacing', '0.18em')
    .text('HOVER OR CLICK A DOT');

  // ── Timeline Wave Scenery ──
  const decades = [1920, 1930, 1940, 1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020];
  decades.forEach(yr => {
    const xPos = timeX(yr);
    timelineScenery.append('line')
      .attr('x1', xPos).attr('y1', topBarH + timePadYTop - 8)
      .attr('x2', xPos).attr('y2', topBarH + canvasH - timePadYBottom + 8)
      .attr('class', 'axis-guide');

    timelineScenery.append('text')
      .attr('x', xPos).attr('y', topBarH + canvasH - timePadYBottom + 22)
      .attr('text-anchor', 'middle').attr('class', 'axis-label')
      .text(yr);
  });

  const ratingTicks = [7.6, 8.0, 8.5, 9.0, 9.3];
  ratingTicks.forEach(rtg => {
    const yPos = timeY(rtg);
    timelineScenery.append('line')
      .attr('x1', timePadX - 10).attr('y1', yPos)
      .attr('x2', canvasW - timePadX + 10).attr('y2', yPos)
      .attr('class', 'axis-guide');

    timelineScenery.append('text')
      .attr('x', timePadX - 18).attr('y', yPos + 3)
      .attr('text-anchor', 'end').attr('class', 'axis-label')
      .text(`★ ${rtg.toFixed(1)}`);
  });

  // ── Critic vs Audience Galaxy Scenery ──
  const metaTicks = [40, 50, 60, 70, 80, 90, 100];
  metaTicks.forEach(ms => {
    const xPos = galX(ms);
    galaxyScenery.append('line')
      .attr('x1', xPos).attr('y1', topBarH + galPadYTop - 8)
      .attr('x2', xPos).attr('y2', topBarH + canvasH - galPadYBottom + 8)
      .attr('class', 'axis-guide');

    galaxyScenery.append('text')
      .attr('x', xPos).attr('y', topBarH + canvasH - galPadYBottom + 22)
      .attr('text-anchor', 'middle').attr('class', 'axis-label')
      .text(`M ${ms}`);
  });

  ratingTicks.forEach(rtg => {
    const yPos = galY(rtg);
    galaxyScenery.append('line')
      .attr('x1', galPadX - 10).attr('y1', yPos)
      .attr('x2', canvasW - galPadX + 10).attr('y2', yPos)
      .attr('class', 'axis-guide');

    galaxyScenery.append('text')
      .attr('x', galPadX - 18).attr('y', yPos + 3)
      .attr('text-anchor', 'end').attr('class', 'axis-label')
      .text(`★ ${rtg.toFixed(1)}`);
  });

  // Quadrant Labels - positioned cleanly on the right side margins
  galaxyScenery.append('text')
    .attr('x', canvasW - galPadX).attr('y', topBarH + galPadYTop - 18)
    .attr('text-anchor', 'end').attr('class', 'quadrant-label')
    .text('UNIVERSAL MASTERPIECES (CRITIC 100 · AUDIENCE 9.0+)');

  galaxyScenery.append('text')
    .attr('x', canvasW - galPadX).attr('y', topBarH + canvasH - galPadYBottom + 44)
    .attr('text-anchor', 'end').attr('class', 'quadrant-label')
    .text('CRITICAL DARLINGS (HIGH METASCORE · MODEST RATING)');

  /* ── 7. RENDER FILM DOTS ────────────────────────────────────────────────── */

  const filmDots = films.map(f => {
    const pos = posRecord.get(f.id) || { x: cx, y: cy };
    return {
      ...f,
      releaseYear: f.y,
      x: pos.x,
      y: pos.y,
      dotR: getDotRadius(f, 'record')
    };
  });

  const dots = dotsGroup.selectAll('.film-dot')
    .data(filmDots, d => d.id)
    .enter()
    .append('circle')
    .attr('class', d => `film-dot dg-${d.decadeGroup} genre-${cssClass(d.primaryGenre)} rt-${d.rtCat}`)
    .attr('cx', d => d.x)
    .attr('cy', d => d.y)
    .attr('r',  d => getDotRadius(d))
    .attr('fill', d => d.decadeColor)
    .attr('stroke', 'none')
    .attr('stroke-width', 0)
    .attr('opacity', 0.85)
    .on('mouseover', onDotOver)
    .on('mousemove', onDotMove)
    .on('mouseout',  onDotOut)
    .on('click',     onDotClick);

  /* ── 8. COLOPHON & DECODE KEY ───────────────────────────────────────────── */

  const CF2 = "'Barlow Condensed', monospace";

  const colophonText = svg.append('text').attr('x', 24).attr('y', H - 16)
    .attr('class', 'viz-colophon')
    .attr('font-size', '10px').attr('font-family', CF2)
    .attr('letter-spacing', '0.14em')
    .text('ONE RECORD · 1000 FILMS · 1920–2020 · IMDb TOP 1000');

  const decodeKeyText = svg.append('text').attr('x', 24).attr('y', H - 30)
    .attr('id', 'decode-key-text')
    .attr('class', 'viz-decode-key')
    .attr('font-size', '9px').attr('font-family', CF2)
    .attr('letter-spacing', '0.12em')
    .text('SIZE = IMDb RATING (★ 7.6 → ★ 9.3) · COLOUR = DECADE · DISTANCE FROM CENTRE = RATING');

  /* ── 8c. CHART NARRATIVE CRAFTER: DYNAMIC EDITORIAL HUD ──────────────────── */
  function updateNarrativeHUD(mode = currentMode) {
    const hud = document.getElementById('narrative-hud');
    const tagEl = document.getElementById('narrative-tag');
    const titleEl = document.getElementById('narrative-headline');
    const subEl = document.getElementById('narrative-subdeck');
    if (!hud || !tagEl || !titleEl || !subEl) return;

    const activeFilmsList = films.filter(isFilmActive);
    const totalCount = activeFilmsList.length;
    const avgRating = totalCount > 0 ? (activeFilmsList.reduce((acc, f) => acc + f.rating, 0) / totalCount).toFixed(2) : '0';

    // 1. If searching
    if (searchQuery) {
      tagEl.textContent = `OMNI SEARCH · "${searchQuery.toUpperCase()}"`;
      titleEl.textContent = `${totalCount} FILM${totalCount === 1 ? '' : 'S'} MATCHING "${searchQuery.toUpperCase()}"`;
      subEl.textContent = `Average rating: ★${avgRating} · Filtered across titles, directors, actors, and genres.`;
      return;
    }

    // 2. If genre filtered
    if (activeGenres.size === 1) {
      const g = [...activeGenres][0];
      tagEl.textContent = `GENRE ESSENCE · ${g.toUpperCase()}`;
      titleEl.textContent = `${g.toUpperCase()}: ${totalCount} MASTERPIECES (★${avgRating} AVG)`;
      subEl.textContent = `Representing ${((totalCount / 1000) * 100).toFixed(1)}% of all-time cinema classics in the IMDb Top 1000.`;
      return;
    } else if (activeGenres.size > 1) {
      const gNames = [...activeGenres].slice(0, 2).join(' + ').toUpperCase();
      tagEl.textContent = `COMBINED GENRES · ${activeGenres.size} SELECTED`;
      titleEl.textContent = `${gNames} & MORE: ${totalCount} FILMS (★${avgRating} AVG)`;
      subEl.textContent = `Co-occurrence across multiple cinematic genres and eras.`;
      return;
    }

    // 3. If decade filtered
    if (activeDecades.size === 1) {
      const d = [...activeDecades][0];
      const eraNames = {
        '1920': 'Silent Pioneers & Early Talkies (1920s)',
        '1930': 'Golden Age of Hollywood (1930s)',
        '1940': 'Post-War Realism & Film-Noir (1940s)',
        '1950': 'Widescreen Spectacle & Auteur Era (1950s)',
        '1960': 'New Wave & Cinematic Rebellion (1960s)',
        '1970': 'New Hollywood Masterpiece Wave (1970s)',
        '1980': 'Blockbuster Awakening & Indie Rise (1980s)',
        '1990': 'The Modern Renaissance (1990s)',
        '2000': 'Digital Frontiers & Modern Epics (2000s)',
        '2010': 'Streaming Era & Global Expansion (2010s)',
        '2020': 'Contemporary Masterworks (2020s)'
      };
      tagEl.textContent = `DECADE DOSSIER · ${d}s`;
      titleEl.textContent = `${eraNames[d] || d + 's'}: ${totalCount} FILMS (★${avgRating} AVG)`;
      subEl.textContent = `Historical density, aesthetic evolution, and landmark director achievements.`;
      return;
    }

    // 4. Default Mode Narratives
    if (mode === 'record') {
      tagEl.textContent = 'CONCENTRIC RADIAL GROOVES';
      titleEl.textContent = 'A CENTURY IN GROOVES: 1,000 MASTERPIECES (★7.6 → ★9.3)';
      subEl.textContent = 'Distance from centre encodes IMDb rating gravity · 74% of all-time classics cluster in the outer orbital band.';
    } else if (mode === 'timeline') {
      tagEl.textContent = 'CHRONOLOGICAL SOUNDWAVE';
      titleEl.textContent = 'THE GOLDEN RHYTHMS: 1920 → 2020 CHRONOLOGY';
      subEl.textContent = 'Historical volume surged in 1994 & 2014, while 1970s retained highest average critical Metascore density.';
    } else if (mode === 'galaxy') {
      tagEl.textContent = 'CRITIC VS AUDIENCE CONSENSUS';
      titleEl.textContent = 'THE DIVERGENCE GALAXY: METASCORE (X) VS IMDb RATING (Y)';
      subEl.textContent = 'Only 12 masterpieces achieve the elusive dual crown (Metascore 95+ and Audience 9.0+).';
    }
  }

  /* ── 9. MODE SWITCHER LOGIC ─────────────────────────────────────────────── */

  function switchMode(newMode) {
    if (newMode === currentMode) return;
    currentMode = newMode;

    // Update active tab button
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-mode') === newMode);
    });

    // Clear constellation lines during switch
    clearConstellations();

    // Toggle scenery layers with smooth fade
    if (newMode === 'record') {
      recordScenery.style('display', null).transition('scenery').duration(400).attr('opacity', 1);
      labelG.style('display', null).transition('scenery').duration(400).attr('opacity', 1);
      timelineScenery.transition('scenery').duration(300).attr('opacity', 0).on('end', () => timelineScenery.style('display', 'none'));
      galaxyScenery.transition('scenery').duration(300).attr('opacity', 0).on('end', () => galaxyScenery.style('display', 'none'));
    } else if (newMode === 'timeline') {
      recordScenery.transition('scenery').duration(300).attr('opacity', 0).on('end', () => recordScenery.style('display', 'none'));
      labelG.transition('scenery').duration(300).attr('opacity', 0).on('end', () => labelG.style('display', 'none'));
      timelineScenery.style('display', null).attr('opacity', 0).transition('scenery').duration(400).attr('opacity', 1);
      galaxyScenery.transition('scenery').duration(300).attr('opacity', 0).on('end', () => galaxyScenery.style('display', 'none'));
    } else if (newMode === 'galaxy') {
      recordScenery.transition('scenery').duration(300).attr('opacity', 0).on('end', () => recordScenery.style('display', 'none'));
      labelG.transition('scenery').duration(300).attr('opacity', 0).on('end', () => labelG.style('display', 'none'));
      timelineScenery.transition('scenery').duration(300).attr('opacity', 0).on('end', () => timelineScenery.style('display', 'none'));
      galaxyScenery.style('display', null).attr('opacity', 0).transition('scenery').duration(400).attr('opacity', 1);
    }

    // If in documentary mode, light up all dots during flight so travel path is visible
    if (document.body.classList.contains('doc-playing')) {
      document.body.classList.add('doc-moving');
      setTimeout(() => {
        document.body.classList.remove('doc-moving');
      }, 1400);
    }

    // Animate all dots to new target coordinates with organic ripple delays (Motion Choreographer)
    dots.transition('move')
      .duration(1100)
      .delay(d => {
        if (newMode === 'record') {
          const pt = posRecord.get(d.id) || { x: cx, y: cy };
          return Math.min(520, Math.max(0, Math.hypot(pt.x - cx, pt.y - cy) * 0.8));
        } else if (newMode === 'timeline') {
          const yr = d.releaseYear || d.y || 1995;
          return Math.min(550, Math.max(0, (yr - 1920) * 5.2));
        } else if (newMode === 'galaxy') {
          const ms = d.ms != null ? d.ms : 70;
          return Math.min(550, Math.max(0, (ms - 40) * 7.2));
        }
        return 0;
      })
      .ease(d3.easeCubicInOut)
      .attr('cx', d => {
        if (newMode === 'record')   return (posRecord.get(d.id)   || { x: cx }).x;
        if (newMode === 'timeline') return (posTimeline.get(d.id) || { x: cx }).x;
        if (newMode === 'galaxy')   return (posGalaxy.get(d.id)   || { x: cx }).x;
        return d.x;
      })
      .attr('cy', d => {
        if (newMode === 'record')   return (posRecord.get(d.id)   || { y: cy }).y;
        if (newMode === 'timeline') return (posTimeline.get(d.id) || { y: cy }).y;
        if (newMode === 'galaxy')   return (posGalaxy.get(d.id)   || { y: cy }).y;
        return d.y;
      })
      .attr('r', d => getDotRadius(d, newMode));

    // Refresh decode key text per mode
    if (newMode === 'record') {
      decodeKeyText.text('SIZE = IMDb RATING (★ 7.6 → ★ 9.3) · COLOUR = DECADE · DISTANCE FROM CENTRE = RATING');
    } else if (newMode === 'timeline') {
      decodeKeyText.text('X = RELEASE YEAR (1920 → 2020) · Y = IMDb RATING (★ 7.6 → ★ 9.3) · SIZE = IMDb RATING');
    } else if (newMode === 'galaxy') {
      decodeKeyText.text('X = METASCORE (CRITIC 40 → 100) · Y = IMDb (AUDIENCE 7.6 → 9.3) · SIZE = IMDb RATING');
    }

    // Update dynamic Narrative Sub-deck (Chart Narrative Crafter)
    updateNarrativeHUD(newMode);
  }

  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      switchMode(btn.getAttribute('data-mode'));
    });
  });

  /* ── 10. DIRECTOR CONSTELLATION THREADS ──────────────────────────────────── */

  function drawConstellations(film) {
    clearConstellations();
    if (!film.dir) return;

    const directorFilms = byDirector.get(film.dir) || [];
    if (directorFilms.length <= 1) return;

    // Highlight sibling film dots (no raise — DOM reordering causes false mouseout events)
    const dirIds = new Set(directorFilms.map(f => f.id));
    dots.filter(d => dirIds.has(d.id)).classed('director-highlight', true);

    // Coordinates getter based on current mode
    function getCoords(id) {
      if (currentMode === 'timeline') return posTimeline.get(id);
      if (currentMode === 'galaxy')   return posGalaxy.get(id);
      return posRecord.get(id);
    }

    // Draw connecting threads
    const pts = directorFilms.map(f => getCoords(f.id)).filter(Boolean);
    for (let i = 0; i < pts.length - 1; i++) {
      const p1 = pts[i];
      const p2 = pts[i + 1];

      // Subtle curved bezier arc
      const mx = (p1.x + p2.x) / 2 + (p1.y - p2.y) * 0.15;
      const my = (p1.y + p2.y) / 2 + (p2.x - p1.x) * 0.15;

      const pathData = `M ${p1.x} ${p1.y} Q ${mx} ${my} ${p2.x} ${p2.y}`;

      const strokeColor = (currentTheme === 'light') ? (film.genreColor || '#0F172A') : (film.genreColor || '#89C4DC');

      const pathEl = constellationG.append('path')
        .attr('d', pathData)
        .attr('class', 'constellation-line')
        .attr('stroke', strokeColor)
        .style('stroke', strokeColor);

      // Animate draw-in
      const totalLen = pathEl.node().getTotalLength();
      pathEl
        .attr('stroke-dasharray', `${totalLen} ${totalLen}`)
        .attr('stroke-dashoffset', totalLen)
        .transition().duration(400).ease(d3.easeQuadOut)
        .attr('stroke-dashoffset', 0);
    }
  }

  function clearConstellations() {
    constellationG.selectAll('*').remove();
    dots.classed('director-highlight', false);
  }

  /* ── 11. TOOLTIP WITH POSTER ─────────────────────────────────────────────── */

  const tooltipEl = document.getElementById('tooltip');
  let hoveredDotEl = null;
  let hoveredFilm  = null;

  function onDotOver(event, d) {
    if (!isFilmActive(d)) return;
    hoveredDotEl = this;
    hoveredFilm  = d;

    // No raise(), no radius change, no stroke — just glow
    d3.select(this)
      .attr('filter', 'url(#dot-glow)')
      .attr('opacity', 1);

    drawConstellations(d);

    const genre    = d.g ? d.g.split(',')[0].trim() : '';
    const meta     = [d.y, d.rt ? d.rt + ' min' : null].filter(Boolean).join(' · ');
    const dirCount = (byDirector.get(d.dir) || []).length;
    const color    = getDotFill(d);
    const poster   = d.p
      ? `<div class="tt-poster-wrap"><img class="tt-poster" src="${esc(d.p)}" alt="${esc(d.t)}" onerror="this.parentElement.style.display='none'"></div>`
      : '';

    tooltipEl.innerHTML = `
      <div class="tt-card">
        ${poster}
        <div class="tt-content">
          <div class="tt-title">${esc(d.t)}</div>
          <div class="tt-director">dir. ${esc(d.dir)}${dirCount > 1 ? ` (${dirCount} in Top 1000)` : ''}</div>
          <div class="tt-meta">${esc(meta)}</div>
          <div class="tt-rating-row">
            <span class="tt-rating" style="color:${color}">★ ${Number(d.r).toFixed(1)}</span>
            ${d.ms ? `<span class="tt-meta-score">METASCORE ${d.ms}</span>` : ''}
          </div>
          ${genre ? `<div class="tt-genre">${esc(genre.toUpperCase())}</div>` : ''}
        </div>
      </div>`;
    tooltipEl.style.display = 'block';
    positionTooltip(event);
  }

  function onDotMove(event, d) {
    positionTooltip(event);
  }

  function onDotOut(event, d) {
    // Always hide tooltip and remove glow, regardless of filter state
    hoveredDotEl = null;
    hoveredFilm  = null;
    d3.select(this)
      .attr('filter', null)
      .attr('opacity', getDotOpacity(d));
    tooltipEl.style.display = 'none';
    if (!selectedDot) clearConstellations();
  }

  function positionTooltip(event) {
    if (tooltipEl.style.display !== 'block') return;
    const r   = tooltipEl.getBoundingClientRect();
    let tx    = event.clientX + 18;
    let ty    = event.clientY - 30;
    const max = (W > 1000 ? W - 260 : W) - 10;
    if (tx + r.width > max) tx = event.clientX - r.width - 18;
    if (ty + r.height > H - 12) ty = H - r.height - 12;
    if (ty < 56) ty = 56;
    tooltipEl.style.left = tx + 'px';
    tooltipEl.style.top  = ty + 'px';
  }

  /* ── 12. FILM DETAIL OVERLAY ────────────────────────────────────────────── */

  const overlay   = document.getElementById('film-overlay');
  const closeBtn  = document.getElementById('close-overlay');
  let   selectedDot = null;

  function onDotClick(event, d) {
    if (!isFilmActive(d)) return;
    event.stopPropagation();
    if (selectedDot) d3.select(selectedDot).classed('selected', false);
    selectedDot = this;
    d3.select(this).classed('selected', true);
    drawConstellations(d);
    openOverlay(d);
  }

  function openOverlay(d) {
    if (!d) return;
    tooltipEl.style.display = 'none';

    document.getElementById('card-title').textContent    = d.t || '';
    document.getElementById('card-director').textContent = d.dir ? 'dir. ' + d.dir : '';
    document.getElementById('card-cast').textContent     = (d.actors || []).join(' · ');
    document.getElementById('card-genre').textContent    = (d.g || '').toUpperCase();
    document.getElementById('card-overview').textContent = d.ov || '';

    const rEl = document.getElementById('card-rating');
    rEl.textContent = '★ ' + Number(d.r).toFixed(1);
    rEl.style.color = getDotFill(d);

    document.getElementById('card-year').textContent    = d.y ? String(d.y) : '';
    document.getElementById('card-runtime').textContent = d.rt ? d.rt + ' min' : '';
    document.getElementById('card-meta').textContent    = d.ms ? 'METASCORE ' + d.ms : '';

    const posterEl = document.getElementById('card-poster');
    if (d.p) {
      posterEl.src           = d.p;
      posterEl.alt           = d.t || '';
      posterEl.style.display = 'block';
      posterEl.onerror       = () => { posterEl.style.display = 'none'; };
    } else {
      posterEl.style.display = 'none';
    }

    overlay.classList.add('visible');
  }

  function closeOverlay() {
    overlay.classList.remove('visible');
    if (selectedDot) {
      d3.select(selectedDot).classed('selected', false);
      selectedDot = null;
    }
    clearConstellations();
  }

  closeBtn.addEventListener('click', (e) => { e.stopPropagation(); closeOverlay(); });

  // Close when clicking the dark backdrop (not the card)
  overlay.addEventListener('click', (e) => {
    if (!e.target.closest('.film-card')) closeOverlay();
  });


  /* ── 13. OMNI SEARCH & FILTERS ENGINE ───────────────────────────────────── */

  const activeDecades  = new Set();
  const activeGenres   = new Set();
  const activeRuntimes = new Set();
  let searchQuery      = '';

  function isFilmSearchMatch(film, query) {
    if (!query) return true;
    const cleanQ = query.trim().toLowerCase();
    if (!cleanQ) return true;
    const qTokens = cleanQ.split(/\s+/).filter(Boolean);
    if (qTokens.length === 0) return true;

    // 1. Direct whole-query phrase match at word boundary in Title, Director, or Actor name
    if (phraseMatches(film.titleNorm, cleanQ)) return true;
    if (phraseMatches(film.dirNorm, cleanQ)) return true;
    if (film.actorEntries.some(a => phraseMatches(a.nameNorm, cleanQ))) return true;

    // 2. Token-based single-actor match (all tokens match words in a single actor name)
    const singleActorMatch = film.actorEntries.some(a => {
      return qTokens.every(tok => a.words.some(w => wordMatches(w, tok)));
    });
    if (singleActorMatch) return true;

    // 3. Token-based director match
    const directorMatch = qTokens.every(tok => film.dirWords.some(w => wordMatches(w, tok)));
    if (directorMatch) return true;

    // 4. Token-based title match
    const titleMatch = qTokens.every(tok => film.titleWords.some(w => wordMatches(w, tok)));
    if (titleMatch) return true;

    // 5. Cross-field match (each query token matches at least one entity word in the film)
    const crossMatch = qTokens.every(tok => film.allWords.some(w => wordMatches(w, tok)));
    if (crossMatch) return true;

    return false;
  }

  function isFilmActive(d) {
    const dm = activeDecades.size === 0  || activeDecades.has(d.decadeGroup);
    const gm = activeGenres.size === 0   || activeGenres.has(d.primaryGenre);
    const rm = activeRuntimes.size === 0 || activeRuntimes.has(d.rtCat);
    const sm = !searchQuery || isFilmSearchMatch(d, searchQuery);

    return dm && gm && rm && sm;
  }

  function getDotOpacity(d) {
    return isFilmActive(d) ? 0.88 : 0.02;
  }

  function getDotFill(d) {
    const gm = activeGenres.size > 0 && activeGenres.has(d.primaryGenre);
    return gm ? d.genreColor : d.decadeColor;
  }

  function applyFilters() {
    const isGenreActive = activeGenres.size > 0;
    const filtersContainer = document.getElementById('filters');
    if (filtersContainer) {
      filtersContainer.classList.toggle('genre-active', isGenreActive);
    }

    // Set pointer-events immediately (not inside transition) so clicks are never blocked
    dots
      .style('pointer-events', d => isFilmActive(d) ? 'auto' : 'none')
      .classed('dimmed',        d => !isFilmActive(d))
      .classed('search-match',  d => searchQuery && isFilmSearchMatch(d, searchQuery));

    // Motion Choreographer: Staggered ripple wave cascade across active/dimmed dots
    dots.transition('filter').duration(420)
      .delay(d => {
        const pt = (currentMode === 'timeline' ? posTimeline.get(d.id) : (currentMode === 'galaxy' ? posGalaxy.get(d.id) : posRecord.get(d.id))) || { x: cx, y: cy };
        return Math.min(220, Math.max(0, Math.hypot(pt.x - cx, pt.y - cy) * 0.32));
      })
      .ease(d3.easeCubicOut)
      .attr('opacity', d => getDotOpacity(d))
      .attr('fill',    d => getDotFill(d));

    // Live count
    const count = films.filter(isFilmActive).length;
    countEl.text(`${count} FILMS`);

    // Search count indicator
    const searchCountEl = document.getElementById('search-count');
    if (searchQuery) {
      searchCountEl.textContent = `${count} found`;
    } else {
      searchCountEl.textContent = '';
    }

    // Chart Narrative Crafter: Dynamic headline update on filter change
    updateNarrativeHUD(currentMode);
  }

  /* ── 14. OMNI SEARCH INPUT EVENT ────────────────────────────────────────── */

  const searchInput = document.getElementById('omni-search');
  const searchClear = document.getElementById('search-clear');

  searchInput.addEventListener('input', e => {
    searchQuery = e.target.value.trim().toLowerCase();
    searchClear.classList.toggle('visible', searchQuery.length > 0);
    applyFilters();
  });

  searchClear.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    searchClear.classList.remove('visible');
    searchInput.focus();
    applyFilters();
  });

  /* ── 15. DECADE FILTER LISTENERS ────────────────────────────────────────── */

  document.querySelectorAll('#decade-filter .flt-btn[data-decade]').forEach(btn => {
    btn.addEventListener('click', () => {
      const dec = btn.getAttribute('data-decade');
      if (activeDecades.has(dec)) { activeDecades.delete(dec); btn.classList.remove('active'); }
      else                        { activeDecades.add(dec);    btn.classList.add('active'); }
      applyFilters();
    });
  });

  document.getElementById('clear-decade').addEventListener('click', () => {
    activeDecades.clear();
    document.querySelectorAll('#decade-filter .flt-btn').forEach(b => b.classList.remove('active'));
    applyFilters();
  });

  /* ── 16. GENRE FILTER LISTENERS ─────────────────────────────────────────── */

  const genreFilterEl = document.getElementById('genre-filter');

  topGenres.forEach(genre => {
    const color = GENRE_COLOR[genre] || '#888';
    const btn   = document.createElement('button');
    btn.className = 'flt-btn genre-flt-btn';
    btn.setAttribute('data-genre', genre);
    btn.style.setProperty('--dc', color);
    btn.textContent = genre;
    genreFilterEl.appendChild(btn);

    btn.addEventListener('click', () => {
      if (activeGenres.has(genre)) { activeGenres.delete(genre); btn.classList.remove('active'); }
      else                         { activeGenres.add(genre);    btn.classList.add('active'); }
      applyFilters();
    });
  });

  document.getElementById('clear-genre').addEventListener('click', () => {
    activeGenres.clear();
    document.querySelectorAll('.genre-flt-btn').forEach(b => b.classList.remove('active'));
    applyFilters();
  });

  /* ── 17. RUNTIME FILTER LISTENERS ───────────────────────────────────────── */

  document.querySelectorAll('#runtime-filter .rt-flt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const rtCat = btn.getAttribute('data-runtime');
      if (activeRuntimes.has(rtCat)) { activeRuntimes.delete(rtCat); btn.classList.remove('active'); }
      else                           { activeRuntimes.add(rtCat);    btn.classList.add('active'); }
      applyFilters();
    });
  });

  document.getElementById('clear-runtime').addEventListener('click', () => {
    activeRuntimes.clear();
    document.querySelectorAll('#runtime-filter .rt-flt-btn').forEach(b => b.classList.remove('active'));
    applyFilters();
  });

  /* ── 17b. THEME POLARITY HARMONIZER (LIGHT / DARK) ───────────────────────── */

  function setTheme(themeId, animate = true) {
    const theme = THEMES[themeId] || THEMES.dark;
    currentTheme = theme.id;

    // 1. Update document root attribute
    document.documentElement.setAttribute('data-theme', theme.id);

    // 2. Update decade filter swatches (--dc)
    document.querySelectorAll('#decade-filter .flt-btn[data-decade]').forEach(btn => {
      const dec = btn.getAttribute('data-decade');
      const c = theme.decades[dec] || '#888';
      btn.style.setProperty('--dc', c);
    });

    // 3. Update genre filter swatches (--dc)
    document.querySelectorAll('#genre-filter .genre-flt-btn[data-genre]').forEach(btn => {
      const g = btn.getAttribute('data-genre');
      const c = theme.genres[g] || '#888';
      btn.style.setProperty('--dc', c);
    });

    // 4. Update data models
    films.forEach(f => {
      f.decadeColor = theme.decades[f.decade] || '#4A4A4A';
      f.genreColor  = theme.genres[f.primaryGenre] || '#777777';
    });

    // 5. Update SVG Vinyl & Center Label Scenery
    if (vgStop0) {
      vgStop0.attr('stop-color', theme.vinylStops[0]);
      vgStop1.attr('stop-color', theme.vinylStops[1]);
      vgStop2.attr('stop-color', theme.vinylStops[2]);
    }
    if (lgStop0) {
      lgStop0.attr('stop-color', theme.labelStops[0]);
      lgStop1.attr('stop-color', theme.labelStops[1]);
    }
    if (centerLabelDisc)   centerLabelDisc.attr('stroke', theme.centerBorder);
    if (centerLabelRing)   centerLabelRing.attr('stroke', theme.centerRing);
    if (grooveOuterCircle) grooveOuterCircle.attr('stroke', theme.grooveOuter);
    svg.selectAll('.vinyl-groove-line').attr('stroke', theme.grooveStroke);

    if (centerTitleText) centerTitleText.attr('fill', theme.centerTitle);
    if (centerSubText)   centerSubText.attr('fill', theme.centerSub);
    if (countEl)         countEl.attr('fill', theme.centerCount);
    if (centerHintText)  centerHintText.attr('fill', theme.centerHint);

    // 6. Update dots colors on canvas
    if (dots) {
      if (animate) {
        dots.transition('theme-color').duration(400)
          .attr('fill', d => getDotFill(d));
      } else {
        dots.attr('fill', d => getDotFill(d));
      }
    }

    // 7. Update Theme Toggle Button UI
    const themeToggleBtn   = document.getElementById('theme-toggle-btn');
    const themeToggleIcon  = document.getElementById('theme-toggle-icon');
    const themeToggleLabel = document.getElementById('theme-toggle-label');

    if (themeToggleBtn && themeToggleIcon && themeToggleLabel) {
      if (theme.id === 'light') {
        themeToggleIcon.textContent = '🌙';
        themeToggleLabel.textContent = 'DARK';
        themeToggleBtn.setAttribute('title', 'Switch to Dark Mode');
      } else {
        themeToggleIcon.textContent = '☀️';
        themeToggleLabel.textContent = 'LIGHT';
        themeToggleBtn.setAttribute('title', 'Switch to Light Mode');
      }
    }

    try {
      localStorage.setItem('viz_theme', theme.id);
    } catch (e) {}
  }

  // Theme Toggle Button Event Listener
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const nextTheme = (currentTheme === 'light') ? 'dark' : 'light';
      setTheme(nextTheme, true);
    });
  }

  // Initialize theme and narrative HUD on start
  setTheme(currentTheme, false);
  updateNarrativeHUD(currentMode);

  /* ── 18. KEYBOARD SHORTCUTS ─────────────────────────────────────────────── */

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (overlay.classList.contains('visible')) {
        closeOverlay();
      } else if (searchQuery) {
        searchInput.value = '';
        searchQuery = '';
        searchClear.classList.remove('visible');
        applyFilters();
      }
    }
    // Press '/' to focus search
    if (e.key === '/' && document.activeElement !== searchInput) {
      e.preventDefault();
      searchInput.focus();
    }
  });

  /* ── HELPERS ─────────────────────────────────────────────────────────────── */

  function cssClass(str) {
    return (str || '').toLowerCase().replace(/[^a-z0-9]/g, '-');
  }

  function esc(str) {
    return (str || '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     DATA DOCUMENTARY — Guided Story Tour Engine
     Features: Segmented Timeline Scrubber, True Pause/Resume & Dedicated Stop,
               Generative Soothing Ambient Music (Eno/Satie Felt Piano),
               Visible Particle Cascade Flight on Mode Transitions,
               Pulsing Focal Halos & Stacked Movie Spotlight Cards.
     ═══════════════════════════════════════════════════════════════════════════ */

  // ── Chapter Manifest with Landmark Spotlight Films ────────────────────────
  const DOC_CHAPTERS = [
    {
      id: 'ch0',
      badge: 'PROLOGUE \u00b7 THE FULL CENTURY',
      title: '1,000 Films. 100 Years.',
      body: 'Every dot is an acclaimed masterpiece. The closer to the center, the higher the rating. Here is the architecture of modern cinema.',
      stat: '1,000 FILMS \u00b7 \u2605 7.6 TO \u2605 9.3 \u00b7 1920 TO 2020',
      mode: 'record',
      decadeFilter: null,
      spotlightFilms: ['imdb-0001', 'imdb-0002', 'imdb-0003'],
      duration: 6500
    },
    {
      id: 'ch1',
      badge: 'CHAPTER 1 OF 6 \u00b7 ORIGINS',
      title: 'The Silent Pioneers',
      body: 'Only 17 films from the 1920s\u201330s survive in the Top 1000 \u2014 yet they invented the visual grammar of science fiction, comedy, and drama.',
      stat: '\u2605 AVG 8.1 \u00b7 1920s\u201330s \u00b7 17 FILMS',
      mode: 'record',
      decadeFilter: '1920',
      spotlightFilms: ['imdb-0127', 'imdb-0053', 'imdb-0052'],
      duration: 7000
    },
    {
      id: 'ch2',
      badge: 'CHAPTER 2 OF 6 \u00b7 THE GOLDEN AGE',
      title: "Hollywood's Unbroken Streak",
      body: 'The 1940s\u201350s delivered 112 enduring masterworks \u2014 the highest concentration of critically sustained films per decade in history.',
      stat: '\u2605 AVG 8.2 \u00b7 1940s\u201350s \u00b7 112 FILMS',
      mode: 'record',
      decadeFilter: '1940',
      spotlightFilms: ['imdb-0051', 'imdb-0125', 'imdb-0005'],
      duration: 7000
    },
    {
      id: 'ch3',
      badge: 'CHAPTER 3 OF 6 \u00b7 THE REVOLUTION',
      title: 'New Hollywood: Cinema at Its Peak',
      body: "Coppola, Kubrick, Spielberg, and Scorsese forged cinema's creative zenith \u2014 the 60s\u201370s hold the highest average score in the dataset.",
      stat: '\u2605 AVG 8.3 \u00b7 1960s\u201370s \u00b7 184 FILMS \u00b7 HIGHEST AVG',
      mode: 'record',
      decadeFilter: '1960',
      spotlightFilms: ['imdb-0002', 'imdb-0075', 'imdb-0115'],
      duration: 7500
    },
    {
      id: 'ch4',
      badge: 'CHAPTER 4 OF 6 \u00b7 THE 1994 MIRACLE',
      title: 'One Year. Three Timeless Giants.',
      body: 'The 1980s\u201390s dominate in volume (404 films). But 1994 alone gave birth to Shawshank, Pulp Fiction, and Forrest Gump simultaneously.',
      stat: '\u2605 AVG 8.1 \u00b7 1980s\u201390s \u00b7 404 FILMS \u00b7 LARGEST ERA',
      mode: 'timeline',
      decadeFilter: '1980',
      spotlightFilms: ['imdb-0001', 'imdb-0007', 'imdb-0012'],
      duration: 7500
    },
    {
      id: 'ch5',
      badge: 'CHAPTER 5 OF 6 \u00b7 THE GLOBAL WAVE',
      title: 'Cinema Goes Worldwide',
      body: 'The 2000s\u201310s expanded global representation: South Korea, Japan, and international auteurs stood shoulder-to-shoulder with modern epics.',
      stat: '283 FILMS \u00b7 2000s\u201310s \u00b7 HIGHEST DIVERSITY',
      mode: 'timeline',
      decadeFilter: '2000',
      spotlightFilms: ['imdb-0003', 'imdb-0020', 'imdb-0006'],
      duration: 7500
    },
    {
      id: 'ch6',
      badge: 'EPILOGUE \u00b7 TWO VERDICTS',
      title: 'Critics vs. Audiences: A Permanent Split',
      body: 'A Metascore above 90 rarely guarantees universal audience reverence. The two systems reward fundamentally different cinematic values.',
      stat: 'METASCORE 90+ \u2260 IMDb 9.0+ \u00b7 GALAXY VIEW',
      mode: 'galaxy',
      decadeFilter: null,
      spotlightFilms: ['imdb-0010', 'imdb-0022', 'imdb-0009'],
      duration: 8000
    }
  ];

  // ── Generative Soothing Ambient Music (Eno / Satie Style Ambient Soundscape) ──
  class DocGenerativeAudio {
    constructor() {
      this.ctx = null;
      this.muted = false;
      this.isPlaying = false;
      this.timerChime = null;
      this.timerPad = null;
      this.masterGain = null;
      this.delayNode = null;
      this.delayFeedback = null;
      this.currentChordIdx = 0;
      this.activePadNodes = [];

      // Soothing pentatonic scale for felt piano notes (C4..G5)
      this.chimeScale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99];

      // Lush ambient chord beds (frequencies in Hz)
      this.chordProgression = [
        [130.81, 196.00, 246.94, 329.63],         // Cmaj9
        [110.00, 164.81, 196.00, 261.63, 493.88], // Am9
        [87.31,  130.81, 220.00, 329.63, 392.00], // Fmaj9
        [98.00,  146.83, 196.00, 261.63, 293.66]  // Gsus4
      ];
    }

    init() {
      if (this.ctx) return;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();

      // Master Gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.28, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Delay effect for spacious cinematic acoustic warmth
      try {
        this.delayNode = this.ctx.createDelay();
        this.delayNode.delayTime.setValueAtTime(0.38, this.ctx.currentTime);
        this.delayFeedback = this.ctx.createGain();
        this.delayFeedback.gain.setValueAtTime(0.28, this.ctx.currentTime);

        this.delayNode.connect(this.delayFeedback);
        this.delayFeedback.connect(this.delayNode);
        this.delayNode.connect(this.masterGain);
      } catch (e) {}
    }

    start() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;

      const run = () => {
        this.isPlaying = true;
        this.stopPad();
        clearTimeout(this.timerChime);
        clearTimeout(this.timerPad);

        if (this.masterGain) {
          const now = this.ctx.currentTime;
          this.masterGain.gain.cancelScheduledValues(now);
          this.masterGain.gain.setValueAtTime(0.001, now);
          this.masterGain.gain.exponentialRampToValueAtTime(0.28, now + 1.2);
        }

        // Start ambient chord pads and gentle felt-piano droplets
        this.playPadChord();
        this.playGentleChime();
        this.scheduleNextChime();
      };

      if (this.ctx.state === 'suspended') {
        this.ctx.resume().then(run).catch(() => {});
      } else {
        run();
      }
    }

    playPadChord() {
      if (!this.isPlaying || this.muted || !this.ctx) return;
      const now = this.ctx.currentTime;
      const chord = this.chordProgression[this.currentChordIdx];
      this.currentChordIdx = (this.currentChordIdx + 1) % this.chordProgression.length;

      // Filter for warm soft acoustic tone
      const padFilter = this.ctx.createBiquadFilter();
      padFilter.type = 'lowpass';
      padFilter.frequency.setValueAtTime(550, now);

      const padGain = this.ctx.createGain();
      padGain.gain.setValueAtTime(0.0001, now);
      padGain.gain.exponentialRampToValueAtTime(0.065, now + 2.0); // 2s smooth swell
      padGain.gain.setValueAtTime(0.065, now + 5.0);
      padGain.gain.exponentialRampToValueAtTime(0.0001, now + 7.8); // gentle fade

      padGain.connect(padFilter);
      padFilter.connect(this.masterGain);

      const chordOscs = chord.map(freq => {
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        // Gentle warm detune for chorused cinematic feel
        const detune = (Math.random() - 0.5) * 8;
        osc.frequency.setValueAtTime(freq, now);
        osc.detune.setValueAtTime(detune, now);
        osc.connect(padGain);
        osc.start(now);
        osc.stop(now + 8.0);
        return osc;
      });

      this.activePadNodes.push({ oscs: chordOscs, gain: padGain, filter: padFilter });
      if (this.activePadNodes.length > 3) {
        this.activePadNodes.shift();
      }

      // Schedule next crossfading pad chord
      this.timerPad = setTimeout(() => {
        if (this.isPlaying && !this.muted) {
          this.playPadChord();
        }
      }, 6200);
    }

    scheduleNextChime() {
      if (!this.isPlaying || this.muted) return;
      const delayMs = 1800 + Math.random() * 1600; // note every 1.8s - 3.4s
      this.timerChime = setTimeout(() => {
        if (!this.isPlaying || this.muted) return;
        this.playGentleChime();
        this.scheduleNextChime();
      }, delayMs);
    }

    playGentleChime() {
      if (!this.ctx || this.muted || !this.isPlaying) return;
      const now = this.ctx.currentTime;
      const freq = this.chimeScale[Math.floor(Math.random() * this.chimeScale.length)];

      // Primary sine oscillator for pure felt-piano fundamental
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      oscGain.gain.setValueAtTime(0.0001, now);
      oscGain.gain.exponentialRampToValueAtTime(0.14, now + 0.02); // crisp attack
      oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8); // warm ring

      osc.connect(oscGain);
      oscGain.connect(this.masterGain);
      if (this.delayNode) {
        oscGain.connect(this.delayNode);
      }

      osc.start(now);
      osc.stop(now + 3.0);

      // Soft harmonic overtone for felt warmth
      if (Math.random() > 0.5) {
        const overtone = this.ctx.createOscillator();
        const overGain = this.ctx.createGain();
        overtone.type = 'triangle';
        overtone.frequency.setValueAtTime(freq * 2, now + 0.01);

        overGain.gain.setValueAtTime(0.0001, now + 0.01);
        overGain.gain.exponentialRampToValueAtTime(0.035, now + 0.04);
        overGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

        overtone.connect(overGain);
        overGain.connect(this.masterGain);
        overtone.start(now + 0.01);
        overtone.stop(now + 2.0);
      }
    }

    stopPad() {
      this.activePadNodes.forEach(item => {
        try {
          item.oscs.forEach(o => o.stop());
        } catch (e) {}
      });
      this.activePadNodes = [];
    }

    duck() {
      if (this.masterGain && this.ctx) {
        try {
          const now = this.ctx.currentTime;
          this.masterGain.gain.cancelScheduledValues(now);
          this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
          this.masterGain.gain.exponentialRampToValueAtTime(0.06, now + 0.3);
        } catch (e) {}
      }
    }

    unduck() {
      if (this.masterGain && this.ctx && !this.muted && this.isPlaying) {
        try {
          const now = this.ctx.currentTime;
          this.masterGain.gain.cancelScheduledValues(now);
          this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
          this.masterGain.gain.exponentialRampToValueAtTime(0.28, now + 0.5);
        } catch (e) {}
      }
    }

    stop() {
      this.isPlaying = false;
      clearTimeout(this.timerChime);
      clearTimeout(this.timerPad);
      if (this.masterGain && this.ctx) {
        try {
          const now = this.ctx.currentTime;
          this.masterGain.gain.cancelScheduledValues(now);
          this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
          this.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
        } catch (e) {}
      }
      setTimeout(() => {
        this.stopPad();
      }, 500);
    }

    toggleMute() {
      this.muted = !this.muted;
      if (this.muted) {
        this.stop();
      } else {
        if (docTourState === 'playing') {
          this.start();
        }
      }
      return this.muted;
    }
  }

  const docAudio = new DocGenerativeAudio();

  // ── State Management ──────────────────────────────────────────────────────
  let docTourState        = 'idle'; // 'idle' | 'playing' | 'paused'
  let docCurrentChIdx     = -1;
  let docTimer            = null;
  let docChapterStartTime = 0;
  let docRemainingMs      = 0;

  // ── DOM References ────────────────────────────────────────────────────────
  const docPlayBtn      = document.getElementById('doc-play-btn');
  const docPlayIcon     = document.getElementById('doc-play-icon');
  const docPlayLabel    = document.getElementById('doc-play-label');
  const docStopBtn      = document.getElementById('doc-stop-btn');
  const docSoundBtn     = document.getElementById('doc-sound-btn');
  const docSoundIcon    = document.getElementById('doc-sound-icon');
  const docScrubber     = document.getElementById('doc-scrubber');
  const docSegmentsWrap = document.getElementById('doc-segments-container');
  const docCallout      = document.getElementById('doc-callout');
  const docBadge        = document.getElementById('doc-chapter-badge');
  const docCallTitle    = document.getElementById('doc-callout-title');
  const docCallBody     = document.getElementById('doc-callout-body');
  const docCallStat     = document.getElementById('doc-callout-stat');
  const docSpotlights   = document.getElementById('doc-spotlights');

  // ── Build Segmented Scrubber Bar ──────────────────────────────────────────
  function buildDocSegments() {
    if (!docSegmentsWrap) return;
    docSegmentsWrap.innerHTML = '';
    DOC_CHAPTERS.forEach((ch, i) => {
      const seg = document.createElement('div');
      seg.className = 'doc-segment';
      seg.id = `doc-seg-${i}`;
      seg.innerHTML = `
        <div class="doc-segment-track">
          <div class="doc-segment-fill" id="doc-seg-fill-${i}"></div>
        </div>
        <div class="doc-segment-label">
          <span class="doc-segment-num">0${i + 1}</span>
          <span class="doc-segment-text">${esc(ch.title)}</span>
        </div>
      `;
      seg.addEventListener('click', () => {
        docJumpToChapter(i);
      });
      docSegmentsWrap.appendChild(seg);
    });
  }
  buildDocSegments();

  // ── Play / Pause Button Listener ─────────────────────────────────────────
  docPlayBtn.addEventListener('click', () => {
    if (docTourState === 'playing') {
      docPauseTour();
    } else if (docTourState === 'paused') {
      docResumeTour();
    } else {
      docStartTour(0);
    }
  });

  // ── Dedicated Stop Button Listener ───────────────────────────────────────
  if (docStopBtn) {
    docStopBtn.addEventListener('click', () => {
      docStopTour();
    });
  }

  // ── Sound Toggle Button Listener ─────────────────────────────────────────
  if (docSoundBtn) {
    docSoundBtn.addEventListener('click', () => {
      const isMuted = docAudio.toggleMute();
      docSoundBtn.classList.toggle('muted', isMuted);
      docSoundIcon.textContent = isMuted ? '🔇' : '🔊';
    });
  }

  // ── Coordinates Getter Helper ────────────────────────────────────────────
  function getFilmCoords(id) {
    if (currentMode === 'timeline') return posTimeline.get(id) || { x: cx, y: cy };
    if (currentMode === 'galaxy')   return posGalaxy.get(id)   || { x: cx, y: cy };
    return posRecord.get(id) || { x: cx, y: cy };
  }

  // ── Render Spotlight Halos on SVG Canvas ─────────────────────────────────
  function renderSpotlightHalos(filmIds) {
    spotlightG.selectAll('*').remove();
    dots.classed('doc-spotlight-dot', false);

    if (!filmIds || !filmIds.length) return;

    filmIds.forEach(fid => {
      const f = filmsById[fid];
      if (!f) return;

      dots.filter(d => d.id === fid).classed('doc-spotlight-dot', true);

      const pos = getFilmCoords(fid);
      if (!pos) return;

      spotlightG.append('circle')
        .attr('class', 'spotlight-pulse')
        .attr('cx', pos.x)
        .attr('cy', pos.y)
        .attr('r', 8);
    });
  }

  // ── Start Tour ───────────────────────────────────────────────────────────
  function docStartTour(startIdx = 0) {
    docTourState = 'playing';

    // Update Buttons
    docPlayIcon.textContent = '\u23f8';
    docPlayLabel.textContent = 'PAUSE';
    docPlayBtn.className = 'playing';
    if (docStopBtn) docStopBtn.style.display = 'flex';

    docScrubber.classList.add('visible');
    document.body.classList.add('doc-playing');

    tooltipEl.style.display = 'none';
    overlay.classList.remove('visible');

    docAudio.start();
    docGoToChapter(startIdx);
  }

  // ── Pause Tour (True Pause) ──────────────────────────────────────────────
  function docPauseTour() {
    if (docTourState !== 'playing') return;
    docTourState = 'paused';

    clearTimeout(docTimer);

    // Calculate elapsed and remaining time
    const currentCh = DOC_CHAPTERS[docCurrentChIdx];
    const elapsed = Date.now() - docChapterStartTime;
    docRemainingMs = Math.max(400, (currentCh ? currentCh.duration : 6000) - elapsed);

    // Freeze current segment fill at exact elapsed fraction
    if (currentCh) {
      const currentProgress = Math.min(0.98, Math.max(0.02, elapsed / currentCh.duration));
      const fill = document.getElementById(`doc-seg-fill-${docCurrentChIdx}`);
      if (fill) {
        fill.style.transition = 'none';
        fill.style.transform = `scaleX(${currentProgress})`;
      }
    }

    // Update UI
    docPlayIcon.textContent = '\u25b6';
    docPlayLabel.textContent = 'RESUME';
    docPlayBtn.className = 'paused';

    docAudio.duck();
  }

  // ── Resume Tour (True Resume) ────────────────────────────────────────────
  function docResumeTour() {
    if (docTourState !== 'paused') return;
    docTourState = 'playing';

    // Update UI
    docPlayIcon.textContent = '\u23f8';
    docPlayLabel.textContent = 'PAUSE';
    docPlayBtn.className = 'playing';

    docAudio.unduck();

    const currentCh = DOC_CHAPTERS[docCurrentChIdx];
    if (!currentCh) {
      docStartTour(0);
      return;
    }

    // Resume segment fill for the remaining duration
    const fill = document.getElementById(`doc-seg-fill-${docCurrentChIdx}`);
    if (fill) {
      requestAnimationFrame(() => {
        fill.style.transition = `transform ${docRemainingMs}ms linear`;
        fill.style.transform = 'scaleX(1)';
      });
    }

    docChapterStartTime = Date.now() - (currentCh.duration - docRemainingMs);

    // Schedule next chapter after remaining duration
    docTimer = setTimeout(() => {
      if (docTourState !== 'playing') return;
      if (docCurrentChIdx < DOC_CHAPTERS.length - 1) {
        docGoToChapter(docCurrentChIdx + 1);
      } else {
        docStopTour();
      }
    }, docRemainingMs);
  }

  // ── Jump To Chapter (User clicks segment) ────────────────────────────────
  function docJumpToChapter(idx) {
    if (docTourState === 'idle') {
      docStartTour(idx);
    } else {
      docTourState = 'playing';
      docPlayIcon.textContent = '\u23f8';
      docPlayLabel.textContent = 'PAUSE';
      docPlayBtn.className = 'playing';
      if (docStopBtn) docStopBtn.style.display = 'flex';
      docAudio.unduck();
      docGoToChapter(idx);
    }
  }

  // ── Stop Tour (Full Reset) ───────────────────────────────────────────────
  function docStopTour() {
    docTourState = 'idle';
    docCurrentChIdx = -1;
    clearTimeout(docTimer);

    // Update Buttons
    docPlayIcon.textContent = '\u25b6';
    docPlayLabel.textContent = 'PLAY STORY';
    docPlayBtn.className = '';
    if (docStopBtn) docStopBtn.style.display = 'none';

    docScrubber.classList.remove('visible');
    document.body.classList.remove('doc-playing');
    document.body.classList.remove('doc-moving');

    docHideCallout();
    docAudio.stop();

    spotlightG.selectAll('*').remove();
    dots.classed('doc-focus', false).classed('doc-spotlight-dot', false);

    // Reset filters and views
    activeDecades.clear();
    activeGenres.clear();
    document.querySelectorAll('.flt-btn').forEach(b => b.classList.remove('active'));
    applyFilters();

    // Reset all segment bars
    DOC_CHAPTERS.forEach((_, i) => {
      const seg = document.getElementById(`doc-seg-${i}`);
      const fill = document.getElementById(`doc-seg-fill-${i}`);
      if (seg) seg.className = 'doc-segment';
      if (fill) {
        fill.style.transition = 'none';
        fill.style.transform = 'scaleX(0)';
      }
    });
  }

  // ── Go To Chapter ────────────────────────────────────────────────────────
  function docGoToChapter(idx) {
    if (idx < 0 || idx >= DOC_CHAPTERS.length) { docStopTour(); return; }
    clearTimeout(docTimer);

    docCurrentChIdx = idx;
    const ch = DOC_CHAPTERS[idx];
    docChapterStartTime = Date.now();
    docRemainingMs = ch.duration;

    // Update segmented scrubber states
    DOC_CHAPTERS.forEach((_, i) => {
      const seg = document.getElementById(`doc-seg-${i}`);
      const fill = document.getElementById(`doc-seg-fill-${i}`);
      if (!seg || !fill) return;

      fill.style.transition = 'none';
      if (i < idx) {
        seg.className = 'doc-segment completed';
        fill.style.transform = 'scaleX(1)';
      } else if (i === idx) {
        seg.className = 'doc-segment active';
        fill.style.transform = 'scaleX(0)';
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (docTourState === 'playing') {
              fill.style.transition = `transform ${ch.duration}ms linear`;
              fill.style.transform = 'scaleX(1)';
            }
          });
        });
      } else {
        seg.className = 'doc-segment';
        fill.style.transform = 'scaleX(0)';
      }
    });

    // Step 1: Hide callout, clear spotlights, switch mode
    docHideCallout();
    spotlightG.selectAll('*').remove();

    activeDecades.clear();
    activeGenres.clear();
    document.querySelectorAll('.flt-btn').forEach(b => b.classList.remove('active'));

    // Switch visualization mode (runs 1100ms transition with glowing particles)
    const isModeChange = (ch.mode !== currentMode);
    if (isModeChange) {
      switchMode(ch.mode);
    } else {
      clearConstellations();
    }

    // Step 2: After mode transition flight settles: apply focus and show landmark cards
    const settleDelay = isModeChange ? 1150 : 250;

    setTimeout(() => {
      if (docTourState === 'idle') return;

      // Apply decade filter if specified
      if (ch.decadeFilter) {
        activeDecades.add(ch.decadeFilter);
        const decBtn = document.querySelector(`[data-decade="${ch.decadeFilter}"]`);
        if (decBtn) decBtn.classList.add('active');
      }
      applyFilters();

      // Highlight focused dots
      dots.classed('doc-focus', d =>
        ch.decadeFilter ? d.decadeGroup === ch.decadeFilter : true
      );

      // Render pulsing halo rings on SVG for spotlighted films
      renderSpotlightHalos(ch.spotlightFilms || []);

      // Populate Landmark Mini-Cards (Stacked for full readability)
      if (ch.spotlightFilms && ch.spotlightFilms.length) {
        docSpotlights.innerHTML = `
          <div class="doc-spotlight-heading">LANDMARK TITLES</div>
          <div class="doc-spotlight-cards">
            ${ch.spotlightFilms.map(fid => {
              const f = filmsById[fid];
              if (!f) return '';
              return `
                <div class="doc-spotlight-card" data-filmid="${f.id}" title="Inspect ${esc(f.t)}">
                  <img class="doc-spotlight-poster" src="${esc(f.p || '')}" alt="${esc(f.t)}" onerror="this.style.display='none'">
                  <div class="doc-spotlight-info">
                    <div class="doc-spotlight-text-col">
                      <div class="doc-spotlight-title">${esc(f.t)}</div>
                      <div class="doc-spotlight-meta">${f.y || ''} \u00b7 ${esc(f.dir || '')}</div>
                    </div>
                    <div class="doc-spotlight-rating">\u2605 ${Number(f.r).toFixed(1)}</div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `;

        // Attach click handlers to mini cards to open full detail modal
        docSpotlights.querySelectorAll('.doc-spotlight-card').forEach(card => {
          card.addEventListener('click', e => {
            e.stopPropagation();
            const fid = card.getAttribute('data-filmid');
            const f = filmsById[fid];
            if (f) {
              docPauseTour();
              openOverlay(f);
            }
          });
        });
      } else {
        docSpotlights.innerHTML = '';
      }

      // Position callout card in guaranteed non-overlapping left safe zone
      docPositionCallout(idx);
      docBadge.textContent = ch.badge;
      docCallTitle.textContent = ch.title;
      docCallBody.textContent = ch.body;
      docCallStat.textContent = ch.stat;

      setTimeout(() => {
        if (docTourState === 'idle') return;
        docCallout.setAttribute('aria-hidden', 'false');
        docCallout.classList.add('visible');
      }, 80);

      // Auto-advance timer: fires exactly when the segment fill hits 100%
      docTimer = setTimeout(() => {
        if (docTourState !== 'playing') return;
        if (idx < DOC_CHAPTERS.length - 1) {
          docGoToChapter(idx + 1);
        } else {
          docStopTour();
        }
      }, ch.duration);

    }, settleDelay);
  }

  // ── Position Callout in guaranteed non-overlapping safe zone ──────────────
  function docPositionCallout(idx) {
    const margin = 28;
    docCallout.style.left = margin + 'px';
    docCallout.style.top  = '68px';
  }

  // ── Hide Callout ───────────────────────────────────────────────────────────
  function docHideCallout() {
    docCallout.classList.remove('visible');
    docCallout.setAttribute('aria-hidden', 'true');
  }

  // ── Escape key stops documentary mode ─────────────────────────────────────
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && docTourState !== 'idle') {
      docStopTour();
    }
  });

})();
