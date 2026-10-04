/**
 * Keyword Finder – Text Keyword Extraction
 * Text & Speech Analysis Lab – Experiment 03
 * Pure Client-Side JavaScript NLP Implementation
 */

// ==========================================================================
// Standard English Stop Words Dictionary
// ==========================================================================
const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 
  'any', 'are', 'aren\'t', 'as', 'at', 'be', 'because', 'been', 'before', 'being', 
  'below', 'between', 'both', 'but', 'by', 'can', 'can\'t', 'cannot', 'could', 
  'couldn\'t', 'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing', 'don\'t', 
  'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'hadn\'t', 
  'has', 'hasn\'t', 'have', 'haven\'t', 'having', 'he', 'he\'d', 'he\'ll', 'he\'s', 
  'her', 'here', 'here\'s', 'hers', 'herself', 'him', 'himself', 'his', 'how', 
  'how\'s', 'i', 'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if', 'in', 'into', 'is', 
  'isn\'t', 'it', 'it\'s', 'its', 'itself', 'let\'s', 'me', 'more', 'most', 
  'mustn\'t', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 
  'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 
  'own', 'same', 'shan\'t', 'she', 'she\'d', 'she\'ll', 'she\'s', 'should', 
  'shouldn\'t', 'so', 'some', 'such', 'than', 'that', 'that\'s', 'the', 'their', 
  'theirs', 'them', 'themselves', 'then', 'there', 'there\'s', 'these', 'they', 
  'they\'d', 'they\'ll', 'they\'re', 'they\'ve', 'this', 'those', 'through', 
  'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasn\'t', 'we', 'we\'d', 
  'we\'ll', 'we\'re', 'we\'ve', 'were', 'weren\'t', 'what', 'what\'s', 'when', 
  'when\'s', 'where', 'where\'s', 'which', 'while', 'who', 'who\'s', 'whom', 
  'why', 'why\'s', 'with', 'won\'t', 'would', 'wouldn\'t', 'you', 'you\'d', 
  'you\'ll', 'you\'re', 'you\'ve', 'your', 'yours', 'yourself', 'yourselves',
  'also', 'will', 'just', 'via', 'upon', 'within', 'whose'
]);

// ==========================================================================
// Pre-configured Academic Presets
// ==========================================================================
const PRESETS = {
  healthcare: "Artificial intelligence is transforming healthcare. Artificial intelligence helps doctors analyze healthcare data and improve healthcare services.",
  nlp: "Speech recognition and natural language processing empower intelligent conversational interfaces. Speech analysis extracts phonetic features, while natural language understanding interprets syntactic structure and semantic intent across spoken dialogue.",
  climate: "Renewable energy systems harness solar power and wind energy to combat global climate change. Modern solar panels and wind turbines generate clean electricity, reducing fossil fuel dependence and carbon emissions worldwide."
};

// ==========================================================================
// DOM Element References
// ==========================================================================
const inputText = document.getElementById('inputText');
const extractBtn = document.getElementById('extractBtn');
const loadExampleBtn = document.getElementById('loadExampleBtn');
const clearAllBtn = document.getElementById('clearAllBtn');
const clearTextBtn = document.getElementById('clearTextBtn');
const examplePreset = document.getElementById('examplePreset');
const topNLimit = document.getElementById('topNLimit');
const minWordLength = document.getElementById('minWordLength');
const charCountDisplay = document.getElementById('charCountDisplay');
const statusNotification = document.getElementById('statusNotification');

const resultsSection = document.getElementById('resultsSection');
const statTotalWords = document.getElementById('statTotalWords');
const statUniqueWords = document.getElementById('statUniqueWords');
const statExtractedKeywords = document.getElementById('statExtractedKeywords');
const statStopwordsCount = document.getElementById('statStopwordsCount');
const statStopwordsRatio = document.getElementById('statStopwordsRatio');

const keywordCloud = document.getElementById('keywordCloud');
const keywordCardsGrid = document.getElementById('keywordCardsGrid');
const copyKeywordsBtn = document.getElementById('copyKeywordsBtn');
const downloadCsvBtn = document.getElementById('downloadCsvBtn');

const filteredStopwordsList = document.getElementById('filteredStopwordsList');
const cleanTokensList = document.getElementById('cleanTokensList');
const filteredCountBadge = document.getElementById('filteredCountBadge');
const cleanTokensCountBadge = document.getElementById('cleanTokensCountBadge');

// Store current analysis results for export/copy
let currentAnalysis = {
  rawWords: [],
  filteredStopwords: [],
  contentTokens: [],
  frequencyList: [],
  totalWords: 0,
  uniqueWords: 0
};

// ==========================================================================
// Initialization & Event Listeners
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  // Setup input live counter
  inputText.addEventListener('input', updateInputMetrics);

  // Button actions
  extractBtn.addEventListener('click', handleKeywordExtraction);
  loadExampleBtn.addEventListener('click', handleLoadExample);
  clearAllBtn.addEventListener('click', handleClearAll);
  clearTextBtn.addEventListener('click', () => {
    inputText.value = '';
    updateInputMetrics();
    inputText.focus();
  });

  // Settings change triggers re-render if results already computed
  topNLimit.addEventListener('change', () => {
    if (!resultsSection.classList.contains('hidden') && currentAnalysis.frequencyList.length > 0) {
      renderVisualResults(currentAnalysis.frequencyList);
    }
  });

  minWordLength.addEventListener('change', () => {
    if (inputText.value.trim().length > 0) {
      handleKeywordExtraction();
    }
  });

  // Copy & Export
  copyKeywordsBtn.addEventListener('click', handleCopyKeywords);
  downloadCsvBtn.addEventListener('click', handleExportCsv);

  // Preset selector
  examplePreset.addEventListener('change', () => {
    inputText.value = PRESETS[examplePreset.value] || '';
    updateInputMetrics();
    handleKeywordExtraction();
  });

  // Automatically load the prompt's default example on first visit
  inputText.value = PRESETS.healthcare;
  updateInputMetrics();
  handleKeywordExtraction();
});

// ==========================================================================
// Real-time Text Counter
// ==========================================================================
function updateInputMetrics() {
  const text = inputText.value;
  const chars = text.length;
  const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  charCountDisplay.textContent = `${chars.toLocaleString()} character${chars !== 1 ? 's' : ''} | ${words.toLocaleString()} word${words !== 1 ? 's' : ''}`;
}

// ==========================================================================
// Status Notification Helper
// ==========================================================================
function showNotification(message, type = 'info', duration = 3500) {
  statusNotification.textContent = message;
  statusNotification.className = `status-banner ${type}`;
  statusNotification.classList.remove('hidden');

  if (window.statusTimeout) clearTimeout(window.statusTimeout);
  if (duration > 0) {
    window.statusTimeout = setTimeout(() => {
      statusNotification.classList.add('hidden');
    }, duration);
  }
}

// ==========================================================================
// Core Algorithm: Tokenization, Stop-word Filtering, Frequency Ranking
// ==========================================================================
function extractKeywordsAlgorithm(rawText, minLen = 3) {
  // Step 1: Convert text to lowercase
  const lowercased = rawText.toLowerCase();

  // Step 2 & 3: Tokenize words and remove punctuation
  // Matches sequences of alphanumeric characters or hyphens inside words
  const rawTokens = lowercased.match(/\b[a-z0-9]+(?:'[a-z0-9]+)?\b/gi) || [];

  const totalWords = rawTokens.length;
  const uniqueAllWords = new Set(rawTokens).size;

  const filteredStopwords = [];
  const contentTokens = [];
  const freqMap = new Map();

  // Step 4 & 5: Filter common stop words and count frequencies
  for (const token of rawTokens) {
    // Clean token by trimming single quotes if any
    const cleanWord = token.replace(/^'+|'+$/g, '');

    // Check stop word list
    if (STOP_WORDS.has(cleanWord)) {
      filteredStopwords.push(cleanWord);
      continue;
    }

    // Apply minimum word length filter
    if (cleanWord.length < minLen) {
      filteredStopwords.push(cleanWord);
      continue;
    }

    // Discard pure numbers if desired or keep if alphanumeric
    if (/^\d+$/.test(cleanWord)) {
      continue;
    }

    contentTokens.push(cleanWord);
    freqMap.set(cleanWord, (freqMap.get(cleanWord) || 0) + 1);
  }

  // Step 6: Sort words by frequency descending, then alphabetically
  const frequencyList = Array.from(freqMap.entries())
    .map(([word, count]) => ({
      word,
      count,
      percentage: totalWords > 0 ? ((count / totalWords) * 100).toFixed(1) : 0
    }))
    .sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count;
      }
      return a.word.localeCompare(b.word);
    });

  return {
    rawWords: rawTokens,
    filteredStopwords,
    contentTokens,
    frequencyList,
    totalWords,
    uniqueWords: uniqueAllWords
  };
}

// ==========================================================================
// Controller: Extract Action
// ==========================================================================
function handleKeywordExtraction() {
  const text = inputText.value.trim();

  if (!text) {
    showNotification('Please enter or paste a paragraph to extract keywords.', 'error');
    resultsSection.classList.add('hidden');
    inputText.focus();
    return;
  }

  const minLen = parseInt(minWordLength.value, 10) || 3;
  const analysis = extractKeywordsAlgorithm(text, minLen);
  currentAnalysis = analysis;

  if (analysis.frequencyList.length === 0) {
    showNotification('No significant keywords found. Try entering more descriptive text or lowering minimum word length.', 'info');
    resultsSection.classList.add('hidden');
    return;
  }

  // Update Summary Metrics
  statTotalWords.textContent = analysis.totalWords.toLocaleString();
  statUniqueWords.textContent = analysis.uniqueWords.toLocaleString();
  statExtractedKeywords.textContent = analysis.frequencyList.length.toLocaleString();
  statStopwordsCount.textContent = analysis.filteredStopwords.length.toLocaleString();
  
  const stopRatio = analysis.totalWords > 0 
    ? ((analysis.filteredStopwords.length / analysis.totalWords) * 100).toFixed(0) 
    : 0;
  statStopwordsRatio.textContent = `${stopRatio}% of document filtered`;

  // Render Visual Keyword Cloud and Cards
  renderVisualResults(analysis.frequencyList);

  // Render Pipeline Step Inspector
  renderPipelineInspector(analysis);

  // Unhide results
  resultsSection.classList.remove('hidden');

  showNotification(`Successfully extracted ${analysis.frequencyList.length} distinct keywords from ${analysis.totalWords} words.`, 'success', 2500);
}

// ==========================================================================
// Rendering: Keyword Cloud & Keyword Cards
// ==========================================================================
function renderVisualResults(frequencyList) {
  // Determine slice based on user display limit
  const limitVal = topNLimit.value;
  const displayItems = limitVal === 'all' 
    ? frequencyList 
    : frequencyList.slice(0, parseInt(limitVal, 10));

  renderKeywordCloud(displayItems);
  renderKeywordCards(displayItems);
}

function renderKeywordCloud(items) {
  keywordCloud.innerHTML = '';

  if (items.length === 0) {
    keywordCloud.innerHTML = '<p class="text-muted">No keywords available for cloud display.</p>';
    return;
  }

  // Compute min and max frequency for scaling
  const maxFreq = items[0].count;
  const minFreq = items[items.length - 1].count;
  const freqSpread = maxFreq - minFreq || 1;

  // Font size scale: min 0.95rem to max 2.6rem
  const minFont = 0.95;
  const maxFont = 2.6;

  // Shuffle display items slightly for a visually organic cloud, keeping top word prominent
  const cloudItems = [...items].sort(() => Math.random() - 0.5);

  cloudItems.forEach((item) => {
    // Normalization ratio [0, 1]
    const weight = (item.count - minFreq) / freqSpread;
    const fontSize = (minFont + weight * (maxFont - minFont)).toFixed(2);

    let tierClass = 'tier-low';
    if (item.count === maxFreq && item.count > 1) {
      tierClass = 'tier-max';
    } else if (weight >= 0.6) {
      tierClass = 'tier-high';
    } else if (weight >= 0.3) {
      tierClass = 'tier-med';
    }

    const tag = document.createElement('span');
    tag.className = `cloud-tag ${tierClass}`;
    tag.style.fontSize = `${fontSize}rem`;
    tag.title = `"${item.word}": ${item.count} occurrence${item.count > 1 ? 's' : ''} (${item.percentage}%)`;
    
    // Capitalize first letter for presentation
    const capitalizedWord = item.word.charAt(0).toUpperCase() + item.word.slice(1);
    
    tag.innerHTML = `
      <span>${escapeHtml(capitalizedWord)}</span>
      <span class="tag-count">${item.count}</span>
    `;

    // Click to scroll and highlight the card
    tag.addEventListener('click', () => {
      highlightKeywordCard(item.word);
    });

    keywordCloud.appendChild(tag);
  });
}

function renderKeywordCards(items) {
  keywordCardsGrid.innerHTML = '';

  if (items.length === 0) {
    keywordCardsGrid.innerHTML = '<p class="text-muted">No keywords to display in list.</p>';
    return;
  }

  const maxFreq = items[0].count;

  items.forEach((item, index) => {
    const rank = index + 1;
    const capitalizedWord = item.word.charAt(0).toUpperCase() + item.word.slice(1);
    const barWidthPercent = Math.max(10, Math.round((item.count / maxFreq) * 100));

    const card = document.createElement('article');
    card.className = `keyword-card ${rank <= 3 ? `rank-${rank}` : ''}`;
    card.id = `card-keyword-${item.word}`;

    card.innerHTML = `
      <div class="card-top-row">
        <div class="keyword-name-group">
          <span class="rank-badge">#${rank}</span>
          <h4 class="keyword-term">${escapeHtml(capitalizedWord)}</h4>
        </div>
        <span class="card-count-pill">${item.count} ${item.count === 1 ? 'time' : 'times'}</span>
      </div>

      <div class="card-occurrences-text">
        ${escapeHtml(capitalizedWord)} — <strong>${item.count} occurrence${item.count !== 1 ? 's' : ''}</strong>
      </div>

      <div class="freq-bar-wrapper">
        <div class="freq-bar-track">
          <div class="freq-bar-fill" style="width: ${barWidthPercent}%;"></div>
        </div>
        <div class="freq-meta">
          <span>Relative Frequency</span>
          <span>${item.percentage}% of text</span>
        </div>
      </div>
    `;

    keywordCardsGrid.appendChild(card);
  });
}

// Highlight card when clicked from cloud
function highlightKeywordCard(word) {
  const card = document.getElementById(`card-keyword-${word}`);
  if (card) {
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    card.style.outline = '2px solid var(--accent-cyan)';
    card.style.transform = 'scale(1.03)';
    setTimeout(() => {
      card.style.outline = '';
      card.style.transform = '';
    }, 1500);
  }
}

// ==========================================================================
// Pipeline Step Inspector (Educational Visualization)
// ==========================================================================
function renderPipelineInspector(analysis) {
  // Discarded stop words (limit to unique display or sample)
  const uniqueStopwords = Array.from(new Set(analysis.filteredStopwords)).sort();
  filteredCountBadge.textContent = `${uniqueStopwords.length} distinct (${analysis.filteredStopwords.length} total)`;
  filteredStopwordsList.innerHTML = '';

  if (uniqueStopwords.length === 0) {
    filteredStopwordsList.innerHTML = '<span class="text-dim">No stop words removed</span>';
  } else {
    uniqueStopwords.forEach(word => {
      const chip = document.createElement('span');
      chip.className = 'token-chip discarded';
      chip.textContent = word;
      filteredStopwordsList.appendChild(chip);
    });
  }

  // Content tokens (distinct kept words)
  const keptWords = analysis.frequencyList.map(item => item.word);
  cleanTokensCountBadge.textContent = `${keptWords.length} distinct (${analysis.contentTokens.length} total)`;
  cleanTokensList.innerHTML = '';

  keptWords.forEach(word => {
    const chip = document.createElement('span');
    chip.className = 'token-chip retained';
    chip.textContent = word;
    cleanTokensList.appendChild(chip);
  });
}

// ==========================================================================
// Presets and Button Handlers
// ==========================================================================
function handleLoadExample() {
  const selectedKey = examplePreset.value;
  inputText.value = PRESETS[selectedKey] || PRESETS.healthcare;
  updateInputMetrics();
  handleKeywordExtraction();
  showNotification('Loaded laboratory example paragraph.', 'info');
}

function handleClearAll() {
  inputText.value = '';
  updateInputMetrics();
  resultsSection.classList.add('hidden');
  currentAnalysis = {
    rawWords: [],
    filteredStopwords: [],
    contentTokens: [],
    frequencyList: [],
    totalWords: 0,
    uniqueWords: 0
  };
  showNotification('Input and analysis results cleared.', 'info');
  inputText.focus();
}

// ==========================================================================
// Export & Clipboard
// ==========================================================================
function handleCopyKeywords() {
  if (currentAnalysis.frequencyList.length === 0) return;

  const lines = currentAnalysis.frequencyList.map((item, idx) => {
    const capitalized = item.word.charAt(0).toUpperCase() + item.word.slice(1);
    return `${idx + 1}. ${capitalized} — ${item.count} occurrence${item.count !== 1 ? 's' : ''} (${item.percentage}%)`;
  });

  const textToCopy = `Text & Speech Analysis - Experiment 03: Top Keywords\n` +
                     `Total Words: ${currentAnalysis.totalWords} | Unique Words: ${currentAnalysis.uniqueWords}\n\n` +
                     lines.join('\n');

  navigator.clipboard.writeText(textToCopy).then(() => {
    showNotification('Keywords copied to clipboard!', 'success');
  }).catch(() => {
    showNotification('Failed to copy to clipboard.', 'error');
  });
}

function handleExportCsv() {
  if (currentAnalysis.frequencyList.length === 0) return;

  const headers = ['Rank', 'Keyword', 'Occurrences', 'Percentage_of_Total'];
  const rows = currentAnalysis.frequencyList.map((item, idx) => [
    idx + 1,
    `"${item.word}"`,
    item.count,
    `${item.percentage}%`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + 
    [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', 'keyword_extraction_experiment03.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showNotification('Keyword CSV report exported.', 'success');
}

// Utility: HTML escaping
function escapeHtml(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}
