# TEXT & SPEECH ANALYSIS — Experiment 03
## Keyword Finder – Text Keyword Extraction

An academic web application developed for the **Text & Speech Analysis (TSA)** laboratory curriculum. This project demonstrates natural language processing (NLP) algorithms for extracting significant, high-frequency keywords from unstructured textual data using pure client-side web technologies.

---

## 📌 Project Overview & Objective

- **Project Title:** Keyword Finder – Text Keyword Extraction
- **Coursework:** Text & Speech Analysis Laboratory — Experiment 03
- **Core Principle:**
  > *“Keyword extraction identifies the words or phrases that represent the main topics of a document.”*
- **Objective:** Automatically extract the most important and frequently occurring keywords from a paragraph or article using statistical tokenization and frequency distribution without external backends or APIs.

---

## 🛠️ Technology Stack

- **Structure:** HTML5 (Semantic elements, accessible form controls)
- **Styling:** Vanilla CSS3 (Custom design system, glassmorphism, responsive grid, dynamic font scaling)
- **Logic:** Vanilla JavaScript (ES6+ Set, Map, Regex tokenization, array sorting algorithms)
- **External Dependencies:** None (100% client-side, zero backend or API required)

---

## ⚙️ Processing Pipeline & Algorithm

When the user enters text and clicks **Extract Keywords**, the application executes a 7-stage NLP pipeline:

```
┌──────────────────────────────────────────────┐
│                  Raw Input                   │
└──────────────────────┬───────────────────────┘
                       │
                       ▼ (Stage 1)
┌──────────────────────────────────────────────┐
│            Case Normalization                │
│       Convert all characters to lowercase    │
└──────────────────────┬───────────────────────┘
                       │
                       ▼ (Stage 2 & 3)
┌──────────────────────────────────────────────┐
│     Punctuation Stripping & Tokenization     │
│   Extract alphanumeric words using regex:    │
│      \b[a-z0-9]+(?:'[a-z0-9]+)?\b            │
└──────────────────────┬───────────────────────┘
                       │
                       ▼ (Stage 4)
┌──────────────────────────────────────────────┐
│             Stop-Word Filtering              │
│    Exclude syntactic words (is, the, and)    │
│      and words below minimum length limit    │
└──────────────────────┬───────────────────────┘
                       │
                       ▼ (Stage 5)
┌──────────────────────────────────────────────┐
│          Word Frequency Calculation          │
│       Compute term frequency map TF(w)       │
└──────────────────────┬───────────────────────┘
                       │
                       ▼ (Stage 6)
┌──────────────────────────────────────────────┐
│              Frequency Ranking               │
│    Sort descending by frequency count,       │
│        then alphabetically for ties          │
└──────────────────────┬───────────────────────┘
                       │
                       ▼ (Stage 7)
┌──────────────────────────────────────────────┐
│           Visual & Tabular Display           │
│     Keyword Cloud + Ranked Cards + Metrics   │
└──────────────────────────────────────────────┘
```

---

## 🚀 Key Features

1. **Large Document Input Area:**
   - Multi-line textarea with real-time character and word count.
   - Quick "Clear text" shortcut.
2. **Action Controls:**
   - **Extract Keywords:** Triggers the extraction algorithm and renders all outputs.
   - **Load Example:** Instantly loads pre-configured academic sample text.
   - **Clear:** Clears both the input and previous analysis results.
3. **Preset Selector:**
   - *Preset 1:* Healthcare & AI (Default experiment sample)
   - *Preset 2:* Speech & Language Technology
   - *Preset 3:* Sustainable Green Energy
4. **Interactive Filters:**
   - **Display Count:** Top 6, 10, 15, 25, or All Keywords.
   - **Minimum Word Length:** 2+, 3+, or 4+ characters.
5. **Statistical Metrics Dashboard:**
   - **Total Words:** Total token count of the document.
   - **Unique Words:** Count of distinct vocabulary items.
   - **Keywords Extracted:** Total distinct topic terms isolated.
   - **Stop Words Filtered:** Count and percentage of filtered syntactic words.
6. **Visual Keyword Cloud:**
   - Proportional font-size scaling from `0.95rem` to `2.6rem` according to relative occurrence frequency.
   - Color-coded tiers: High Frequency, Medium, and Low.
   - Click-to-focus interaction: Clicking any tag in the cloud highlights its corresponding card below.
7. **Top Keywords Cards:**
   - Card format: `<Keyword> — <N> occurrences` (e.g. `Healthcare — 3 occurrences`, `Artificial — 2 occurrences`).
   - Numerical rank badges (`#1`, `#2`, `#3`, etc.).
   - Visual relative frequency progress bar and percentage of document.
8. **Pipeline Inspector (Educational Drawer):**
   - Displays all discarded stop-words with strike-through styling.
   - Displays all retained semantic content tokens.
9. **Export & Sharing:**
   - **Copy List:** Copies formatted ranking to system clipboard.
   - **Export CSV:** Downloads a `.csv` report with ranks, terms, occurrences, and percentages.

---

## 🧪 Demonstration & Example

### Input Paragraph
> *"Artificial intelligence is transforming healthcare. Artificial intelligence helps doctors analyze healthcare data and improve healthcare services."*

### Analysis Output

| Rank | Keyword | Occurrences | Percentage of Text |
| :---: | :--- | :---: | :---: |
| #1 | **Healthcare** | 3 occurrences | 18.8% |
| #2 | **Artificial** | 2 occurrences | 12.5% |
| #3 | **Intelligence** | 2 occurrences | 12.5% |
| #4 | **Analyze** | 1 occurrence | 6.3% |
| #5 | **Data** | 1 occurrence | 6.3% |
| #6 | **Doctors** | 1 occurrence | 6.3% |
| #7 | **Helps** | 1 occurrence | 6.3% |
| #8 | **Improve** | 1 occurrence | 6.3% |
| #9 | **Services** | 1 occurrence | 6.3% |
| #10 | **Transforming** | 1 occurrence | 6.3% |

- **Total words:** 16
- **Unique words:** 12
- **Stop words removed:** 2 (`is`, `and`)
- **Keywords extracted:** 10

---

## 💻 How to Run Locally

Because this project uses vanilla web standards, **no build tools or npm installation are required**:

### Option 1: Direct File Open
Double-click `index.html` or open it with your web browser (Chrome, Edge, Firefox, Safari).

### Option 2: Local HTTP Server (Python)
```bash
python -m http.server 8080
```
Open [http://localhost:8080](http://localhost:8080) in your browser.

### Option 3: Local HTTP Server (Node.js)
```bash
npx serve .
```
or
```bash
node -e "const http=require('http'),fs=require('fs'),path=require('path');http.createServer((req,res)=>{let f=req.url==='/'?'index.html':req.url.slice(1);fs.readFile(path.join(process.cwd(),f),(e,d)=>{if(e){res.writeHead(404);res.end('Not Found')}else{res.writeHead(200);res.end(d)}})}).listen(3000,()=>console.log('http://localhost:3000'));"
```

---

## 📂 File Directory

```
TSA3/
├── .gitignore          # Git ignore configuration (.env, node_modules, etc.)
├── README.md           # Comprehensive project documentation & lab report notes
├── index.html          # Semantic HTML structure & accessible UI
├── style.css           # Modern dark-mode UI, animations & responsive grid
└── app.js              # Pure JavaScript NLP algorithm & interactive controller
```

---

## 📄 License
Academic Coursework — Developed for Text & Speech Analysis Laboratory Experiments.
