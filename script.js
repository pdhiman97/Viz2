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

  /* ═══════════════════════════════════════════════════════════════════════════
     DATA DOCUMENTARY — Guided Story Tour Engine
     Skill: data-documentary (Deep Exhibition Tour — 5 chapters, ~10s each)
     Universal: chapter manifest drives all focus states and mode switches.
     ═══════════════════════════════════════════════════════════════════════════ */

  // ── Chapter Manifest (generated from IMDB Top 1000 dataset analytics) ──────
  const DOC_CHAPTERS = [
    {
      id: 'ch0',
      badge: 'PROLOGUE \u00b7 THE FULL CENTURY',
      title: '1,000 Films. 100 Years.',
      body: 'Every dot is a film. Every ring a rating. The closer to the center, the higher the acclaim. This is what 100 years of cinema looks like.',
      stat: '1,000 FILMS \u00b7 \u2605 7.6 TO \u2605 9.3 \u00b7 1920 TO 2020',
      mode: 'record',
      decadeFilter: null,
      duration: 6000
    },
    {
      id: 'ch1',
      badge: 'CHAPTER 1 OF 6 \u00b7 ORIGINS',
      title: 'The Silent Pioneers',
      body: 'Only 17 films from the 1920s-30s survive in the Top 1000 — yet they invented every narrative technique still used today.',
      stat: '\u2605 AVG 8.1 \u00b7 1920s-30s \u00b7 17 FILMS',
      mode: 'record',
      decadeFilter: '1920',
      duration: 7000
    },
    {
      id: 'ch2',
      badge: 'CHAPTER 2 OF 6 \u00b7 THE GOLDEN AGE',
      title: "Hollywood's Unbroken Streak",
      body: 'The 1940s-50s delivered 112 enduring masterworks — the most per-decade concentration of critically sustained films in the dataset.',
      stat: '\u2605 AVG 8.2 \u00b7 1940s-50s \u00b7 112 FILMS',
      mode: 'record',
      decadeFilter: '1940',
      duration: 7000
    },
    {
      id: 'ch3',
      badge: 'CHAPTER 3 OF 6 \u00b7 THE REVOLUTION',
      title: 'New Hollywood: Cinema at Its Peak',
      body: "Coppola, Kubrick, Spielberg, Scorsese. The 60s-70s produced the dataset's highest average rating — a creative apex never quite equalled.",
      stat: '\u2605 AVG 8.3 \u00b7 1960s-70s \u00b7 184 FILMS \u00b7 HIGHEST AVG',
      mode: 'record',
      decadeFilter: '1960',
      duration: 7000
    },
    {
      id: 'ch4',
      badge: 'CHAPTER 4 OF 6 \u00b7 THE 1994 MIRACLE',
      title: 'One Year. Three Timeless Films.',
      body: 'The 1980s-90s dominate in sheer volume: 404 films. But 1994 stands apart — Shawshank, Pulp Fiction, Forrest Gump, all in a single year.',
      stat: '\u2605 AVG 8.1 \u00b7 1980s-90s \u00b7 404 FILMS \u00b7 LARGEST ERA',
      mode: 'timeline',
      decadeFilter: '1980',
      duration: 7000
    },
    {
      id: 'ch5',
      badge: 'CHAPTER 5 OF 6 \u00b7 THE GLOBAL WAVE',
      title: 'Cinema Goes Worldwide',
      body: 'The 2000s-10s brought the largest diversity shift: South Korea, Japan, Spain, and Mexico broke into the Top 1000 alongside Hollywood blockbusters.',
      stat: '283 FILMS \u00b7 2000s-10s \u00b7 MOST INTERNATIONAL ERA',
      mode: 'timeline',
      decadeFilter: '2000',
      duration: 7000
    },
    {
      id: 'ch6',
      badge: 'EPILOGUE \u00b7 TWO VERDICTS',
      title: 'Critics vs. Audiences: A Permanent Split',
      body: 'High Metascore rarely guarantees a high IMDb rating. The two systems reward fundamentally different qualities in a film.',
      stat: 'METASCORE 90+ does NOT equal IMDb 9.0+',
      mode: 'galaxy',
      decadeFilter: null,
      duration: 8000
    }
  ];

  // ── State ────────────────────────────────────────────────────────────────
  let docPlaying       = false;
  let docCurrentChIdx  = -1;
  let docTimer         = null;
  let docProgressTimer = null;

  // ── DOM References ────────────────────────────────────────────────────────
  const docPlayBtn     = document.getElementById('doc-play-btn');
  const docPlayIcon    = document.getElementById('doc-play-icon');
  const docPlayLabel   = document.getElementById('doc-play-label');
  const docScrubber    = document.getElementById('doc-scrubber');
  const docProgressFill = document.getElementById('doc-progress-fill');
  const docChaptersRow = document.getElementById('doc-chapters-row');
  const docCallout     = document.getElementById('doc-callout');
  const docBadge       = document.getElementById('doc-chapter-badge');
  const docCallTitle   = document.getElementById('doc-callout-title');
  const docCallBody    = document.getElementById('doc-callout-body');
  const docCallStat    = document.getElementById('doc-callout-stat');

  // ── Build Scrubber Chapter Dots ─────────────────────────────────────────
  DOC_CHAPTERS.forEach((ch, i) => {
    const dot = document.createElement('div');
    dot.className = 'doc-chapter-dot';
    dot.id = `doc-dot-${i}`;
    dot.innerHTML = `<span class="doc-chapter-pip"></span><span class="doc-dot-label">${ch.title}</span>`;
    dot.addEventListener('click', () => {
      if (!docPlaying) docStartPlaying();
      docGoToChapter(i);
    });
    docChaptersRow.appendChild(dot);
  });

  // ── Play / Pause Button ──────────────────────────────────────────────────
  docPlayBtn.addEventListener('click', () => {
    if (docPlaying) { docStopPlaying(); } else { docStartPlaying(); }
  });

  // ── Start Playing ──────────────────────────────────────────────────────
  function docStartPlaying() {
    docPlaying = true;
    docPlayIcon.textContent = '⏸';
    docPlayLabel.textContent = 'PAUSE';
    docPlayBtn.classList.add('playing');
    docScrubber.classList.add('visible');
    document.body.classList.add('doc-playing');
    // Suppress any open overlay / tooltip
    tooltipEl.style.display = 'none';
    overlay.classList.remove('visible');
    const startIdx = (docCurrentChIdx < 0 || docCurrentChIdx >= DOC_CHAPTERS.length - 1) ? 0 : docCurrentChIdx;
    docGoToChapter(startIdx);
  }

  // ── Stop Playing ──────────────────────────────────────────────────────
  function docStopPlaying() {
    docPlaying = false;
    docPlayIcon.textContent = '▶';
    docPlayLabel.textContent = 'PLAY STORY';
    docPlayBtn.classList.remove('playing');
    docScrubber.classList.remove('visible');
    document.body.classList.remove('doc-playing');
    clearTimeout(docTimer);
    clearInterval(docProgressTimer);
    docHideCallout();
    // Remove all doc focus classes
    dots.classed('doc-focus', false);
    // Reset filters silently
    activeDecades.clear();
    activeGenres.clear();
    document.querySelectorAll('.flt-btn').forEach(b => b.classList.remove('active'));
    applyFilters();
    // Restore progress fill
    docProgressFill.style.transition = 'none';
    docProgressFill.style.transform  = 'scaleX(0)';
    // Deactivate all chapter dots
    document.querySelectorAll('.doc-chapter-dot').forEach(d => d.classList.remove('active'));
  }

  // ── Go To Chapter ────────────────────────────────────────────────────────
  function docGoToChapter(idx) {
    if (idx < 0 || idx >= DOC_CHAPTERS.length) { docStopPlaying(); return; }
    clearTimeout(docTimer);
    clearInterval(docProgressTimer);

    docCurrentChIdx = idx;
    const ch = DOC_CHAPTERS[idx];

    // Mark chapter dots
    document.querySelectorAll('.doc-chapter-dot').forEach((d, i) => {
      d.classList.toggle('active', i === idx);
    });

    // Step 1: hide callout, switch mode, then animate in
    docHideCallout();

    // Apply decade filter for this chapter
    activeDecades.clear();
    activeGenres.clear();
    document.querySelectorAll('.flt-btn').forEach(b => b.classList.remove('active'));

    // Switch visualization mode (bypass same-mode guard for doc chapters)
    if (ch.mode !== currentMode) {
      switchMode(ch.mode);
    } else {
      // Same mode — still need to clear constellations and fire applyFilters properly
      clearConstellations();
    }

    // Small delay to let mode transition settle, then apply focus
    setTimeout(() => {
      if (!docPlaying) return;

      // Apply decade filter if specified
      if (ch.decadeFilter) {
        activeDecades.add(ch.decadeFilter);
        const decBtn = document.querySelector(`[data-decade="${ch.decadeFilter}"]`);
        if (decBtn) decBtn.classList.add('active');
      }
      applyFilters();

      // Tag focused dots with doc-focus class
      dots.classed('doc-focus', d =>
        ch.decadeFilter ? d.decadeGroup === ch.decadeFilter : true
      );

      // Position and show callout card
      docPositionCallout(idx);
      docBadge.textContent = ch.badge;
      docCallTitle.textContent = ch.title;
      docCallBody.textContent = ch.body;
      docCallStat.textContent = ch.stat;

      // Slight delay before fade-in for clean separation
      setTimeout(() => {
        if (!docPlaying) return;
        docCallout.setAttribute('aria-hidden', 'false');
        docCallout.classList.add('visible');
      }, 100);

      // Animate progress fill via scaleX — synced to space-between dot positions
      // Dot i sits at position i/(N-1), so fill goes from scaleX(i/(N-1)) to scaleX((i+1)/(N-1))
      const N = DOC_CHAPTERS.length;
      const scaleStart = idx / (N - 1);
      const scaleEnd   = Math.min(1, (idx + 1) / (N - 1));
      docProgressFill.style.transition = 'none';
      docProgressFill.style.transform  = `scaleX(${scaleStart})`;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          docProgressFill.style.transition = `transform ${ch.duration}ms linear`;
          docProgressFill.style.transform  = `scaleX(${scaleEnd})`;
        });
      });

      // Auto-advance timer
      docTimer = setTimeout(() => {
        if (!docPlaying) return;
        if (idx < DOC_CHAPTERS.length - 1) {
          docGoToChapter(idx + 1);
        } else {
          // End of tour — stop cleanly
          docStopPlaying();
        }
      }, ch.duration);

    }, 700);
  }

  // ── Position Callout in the least-data-dense quadrant ───────────────────
  function docPositionCallout(idx) {
    const margin = 36;
    const scrubH = 44;
    const cardW  = 300;
    const cardH  = 160; // estimated

    const vW = window.innerWidth;
    const vH = window.innerHeight;

    // Quadrant safe zones: [left, top]
    const quadrants = [
      { l: margin,            t: 68 },                          // top-left
      { l: vW - cardW - margin - 230, t: 68 },                 // top-right (avoid filter panel)
      { l: margin,            t: vH - cardH - scrubH - margin }, // bottom-left
      { l: vW - cardW - margin - 230, t: vH - cardH - scrubH - margin } // bottom-right
    ];

    // Rotate quadrant by chapter so cards move around naturally
    const q = quadrants[idx % quadrants.length];
    docCallout.style.left = Math.max(margin, q.l) + 'px';
    docCallout.style.top  = Math.max(68, q.t) + 'px';
  }

  // ── Hide Callout ─────────────────────────────────────────────────────────
  function docHideCallout() {
    docCallout.classList.remove('visible');
    docCallout.setAttribute('aria-hidden', 'true');
  }

  // ── Escape key exits documentary mode ───────────────────────────────────
  // (appended to existing keydown handler)
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && docPlaying) {
      docStopPlaying();
    }
  });

})();
