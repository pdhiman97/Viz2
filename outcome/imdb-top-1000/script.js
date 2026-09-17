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

  /* ── 1. COLOUR PALETTES ─────────────────────────────────────────────────── */

  const DECADE_COLOR = {
    '1920': '#C8A96A', '1930': '#C8A96A',
    '1940': '#7AAF8E', '1950': '#7AAF8E',
    '1960': '#D4734A', '1970': '#D4734A',
    '1980': '#9B72CF', '1990': '#9B72CF',
    '2000': '#89C4DC', '2010': '#89C4DC',
    '2020': '#E2E2E2',
    'unknown': '#4A4A4A'
  };

  const DECADE_GROUP = {
    '1920': '1920', '1930': '1920',
    '1940': '1940', '1950': '1940',
    '1960': '1960', '1970': '1960',
    '1980': '1980', '1990': '1980',
    '2000': '2000', '2010': '2000',
    '2020': '2020', 'unknown': 'unknown'
  };

  const GENRE_COLOR = {
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
  const timePadX = 64;
  const timePadY = 60;
  const timeX = d3.scaleLinear()
    .domain([1920, 2020])
    .range([timePadX, canvasW - timePadX]);

  const timeY = d3.scaleLinear()
    .domain([7.6, 9.3])
    .range([topBarH + canvasH - timePadY, topBarH + timePadY]);

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
  const galPadX = 70;
  const galPadY = 65;
  const galX = d3.scaleLinear()
    .domain([40, 100])
    .range([galPadX, canvasW - galPadX]);

  const galY = d3.scaleLinear()
    .domain([7.6, 9.3])
    .range([topBarH + canvasH - galPadY, topBarH + galPadY]);

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
  vg.append('stop').attr('offset', '0%').attr('stop-color', '#1B1B1B');
  vg.append('stop').attr('offset', '55%').attr('stop-color', '#111111');
  vg.append('stop').attr('offset', '100%').attr('stop-color', '#080808');

  // Label radial gradient
  const lg = defs.append('radialGradient').attr('id', 'label-grad')
    .attr('cx', '50%').attr('cy', '50%').attr('r', '50%');
  lg.append('stop').attr('offset', '0%').attr('stop-color', '#272727');
  lg.append('stop').attr('offset', '100%').attr('stop-color', '#181818');

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
  const labelG          = svg.append('g').attr('class', 'label-group');

  /* ── 6. DRAW SCENERY PER MODE ───────────────────────────────────────────── */

  // ── Vinyl Record Scenery ──
  recordScenery.append('circle').attr('cx', cx).attr('cy', cy).attr('r', outerR)
    .attr('fill', 'url(#vinyl-grad)');

  for (let i = 0; i <= 30; i++) {
    recordScenery.append('circle').attr('cx', cx).attr('cy', cy)
      .attr('r', ringStart + i * ((ringEnd - ringStart) / 30))
      .attr('fill', 'none')
      .attr('stroke', 'rgba(255,255,255,0.035)')
      .attr('stroke-width', 0.6);
  }

  recordScenery.append('circle').attr('cx', cx).attr('cy', cy).attr('r', outerR - 1)
    .attr('fill', 'none').attr('stroke', 'rgba(255,255,255,0.07)').attr('stroke-width', 1.5);

  // Center Label
  labelG.append('circle').attr('cx', cx).attr('cy', cy).attr('r', innerR)
    .attr('fill', 'url(#label-grad)').attr('stroke', '#2E2E2E').attr('stroke-width', 1.2);

  labelG.append('circle').attr('cx', cx).attr('cy', cy).attr('r', innerR * 0.78)
    .attr('fill', 'none').attr('stroke', 'rgba(255,255,255,0.04)').attr('stroke-width', 0.8);

  labelG.append('circle').attr('cx', cx).attr('cy', cy).attr('r', 4.5)
    .attr('fill', '#000').attr('stroke', '#222').attr('stroke-width', 0.8);

  const CF = "'Barlow Condensed', monospace";
  const fU = innerR * 0.095;

  labelG.append('text').attr('x', cx).attr('y', cy - innerR * 0.28)
    .attr('text-anchor', 'middle').attr('font-size', `${Math.max(18, fU * 1.85)}px`)
    .attr('font-weight', '700').attr('font-family', CF).attr('fill', '#F0F0F0').attr('letter-spacing', '0.14em')
    .text('ONE RECORD');

  labelG.append('text').attr('x', cx).attr('y', cy - innerR * 0.08)
    .attr('text-anchor', 'middle').attr('font-size', `${Math.max(8, fU * 0.76)}px`)
    .attr('font-family', CF).attr('fill', '#999999').attr('letter-spacing', '0.24em')
    .text('A CENTURY OF CINEMA');

  const countEl = labelG.append('text').attr('x', cx).attr('y', cy + innerR * 0.24)
    .attr('text-anchor', 'middle').attr('font-size', `${Math.max(10, fU * 1.0)}px`)
    .attr('font-weight', '600').attr('font-family', CF).attr('fill', '#AAAAAA').attr('letter-spacing', '0.18em')
    .text('1000 FILMS');

  labelG.append('text').attr('x', cx).attr('y', cy + innerR * 0.44)
    .attr('text-anchor', 'middle').attr('font-size', `${Math.max(7, fU * 0.62)}px`)
    .attr('font-family', CF).attr('fill', '#777777').attr('letter-spacing', '0.18em')
    .text('HOVER OR CLICK A DOT');

  // ── Timeline Wave Scenery ──
  const decades = [1920, 1930, 1940, 1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020];
  decades.forEach(yr => {
    const xPos = timeX(yr);
    timelineScenery.append('line')
      .attr('x1', xPos).attr('y1', topBarH + timePadY - 10)
      .attr('x2', xPos).attr('y2', topBarH + canvasH - timePadY + 10)
      .attr('class', 'axis-guide');

    timelineScenery.append('text')
      .attr('x', xPos).attr('y', topBarH + canvasH - timePadY + 26)
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

  timelineScenery.append('text')
    .attr('x', timePadX).attr('y', topBarH + timePadY - 24)
    .attr('font-family', CF).attr('font-size', '11px').attr('font-weight', '700')
    .attr('fill', '#999').attr('letter-spacing', '0.14em')
    .text('CHRONOLOGICAL WAVE · 1920 → 2020 (RATING ON Y-AXIS)');

  // ── Critic vs Audience Galaxy Scenery ──
  const metaTicks = [40, 50, 60, 70, 80, 90, 100];
  metaTicks.forEach(ms => {
    const xPos = galX(ms);
    galaxyScenery.append('line')
      .attr('x1', xPos).attr('y1', topBarH + galPadY - 10)
      .attr('x2', xPos).attr('y2', topBarH + canvasH - galPadY + 10)
      .attr('class', 'axis-guide');

    galaxyScenery.append('text')
      .attr('x', xPos).attr('y', topBarH + canvasH - galPadY + 26)
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

  // Quadrant Labels
  galaxyScenery.append('text')
    .attr('x', canvasW - galPadX - 10).attr('y', topBarH + galPadY + 16)
    .attr('text-anchor', 'end').attr('class', 'quadrant-label')
    .text('UNIVERSAL MASTERPIECES (CRITIC 100 + AUDIENCE 9.0+)');

  galaxyScenery.append('text')
    .attr('x', galPadX + 10).attr('y', topBarH + galPadY + 16)
    .attr('text-anchor', 'start').attr('class', 'quadrant-label')
    .text('AUDIENCE CULT FAVORITES (HIGH RATING / MODEST CRITIC)');

  galaxyScenery.append('text')
    .attr('x', canvasW - galPadX - 10).attr('y', topBarH + canvasH - galPadY - 14)
    .attr('text-anchor', 'end').attr('class', 'quadrant-label')
    .text('CRITICAL DARLINGS (HIGH METASCORE)');

  /* ── 7. RENDER FILM DOTS ────────────────────────────────────────────────── */

  const filmDots = films.map(f => {
    const pos = posRecord.get(f.id) || { x: cx, y: cy };
    return {
      ...f,
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

  svg.append('text').attr('x', 24).attr('y', H - 18)
    .attr('font-size', '10px').attr('font-family', CF2)
    .attr('fill', '#777777').attr('letter-spacing', '0.14em')
    .text('ONE RECORD · 1000 FILMS · 1920–2020 · IMDb TOP 1000');

  const decodeKeyText = svg.append('text').attr('x', 24).attr('y', H - 32)
    .attr('id', 'decode-key-text')
    .attr('font-size', '9px').attr('font-family', CF2)
    .attr('fill', '#777777').attr('letter-spacing', '0.12em')
    .text('SIZE = IMDb RATING (★ 7.6 → ★ 9.3) · COLOUR = DECADE · DISTANCE FROM CENTRE = RATING');

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
      recordScenery.style('display', null).transition().duration(400).attr('opacity', 1);
      labelG.style('display', null).transition().duration(400).attr('opacity', 1);
      timelineScenery.transition().duration(250).attr('opacity', 0).on('end', () => timelineScenery.style('display', 'none'));
      galaxyScenery.transition().duration(250).attr('opacity', 0).on('end', () => galaxyScenery.style('display', 'none'));
    } else if (newMode === 'timeline') {
      recordScenery.transition().duration(250).attr('opacity', 0).on('end', () => recordScenery.style('display', 'none'));
      labelG.transition().duration(250).attr('opacity', 0).on('end', () => labelG.style('display', 'none'));
      timelineScenery.style('display', null).attr('opacity', 0).transition().duration(400).attr('opacity', 1);
      galaxyScenery.transition().duration(250).attr('opacity', 0).on('end', () => galaxyScenery.style('display', 'none'));
    } else if (newMode === 'galaxy') {
      recordScenery.transition().duration(250).attr('opacity', 0).on('end', () => recordScenery.style('display', 'none'));
      labelG.transition().duration(250).attr('opacity', 0).on('end', () => labelG.style('display', 'none'));
      timelineScenery.transition().duration(250).attr('opacity', 0).on('end', () => timelineScenery.style('display', 'none'));
      galaxyScenery.style('display', null).attr('opacity', 0).transition().duration(400).attr('opacity', 1);
    }

    // Animate all dots to new target coordinates AND refresh circle sizes
    dots.transition().duration(850).ease(d3.easeCubicOut)
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

      const pathEl = constellationG.append('path')
        .attr('d', pathData)
        .attr('class', 'constellation-line')
        .attr('stroke', film.genreColor || '#89C4DC');

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

    dots.transition().duration(240)
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

})();
