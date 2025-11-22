if (!window.hasRun) {
  window.hasRun = true;
  console.log("Hindi-to-Roman (Final Version) loaded.");

  // --- CONFIGURATION ---
  // Sort keys by length so longer matches (like 'ksha') run first
  const mapping = [
    // 1. SPECIAL CONJUNCTS (Complex letters)
    { hi: "क्ष", ro: "ksha" }, { hi: "त्र", ro: "tra" },
    { hi: "ज्ञ", ro: "gya" }, { hi: "श्र", ro: "shra" },
    { hi: "ॐ", ro: "om" },
    
    // 2. COMMON WORD OVERRIDES (Dictionary)
    { hi: "यह", ro: "yeh" }, { hi: "वह", ro: "woh" },
    { hi: "मैं", ro: "main" }, { hi: "नहीं", ro: "nahin" },
    { hi: "हाँ", ro: "haan" }, { hi: "लिए", ro: "liye" }, // Fixed 'lie' to 'liye'

    // 3. NUMERALS
    { hi: "०", ro: "0" }, { hi: "१", ro: "1" }, { hi: "२", ro: "2" },
    { hi: "३", ro: "3" }, { hi: "४", ro: "4" }, { hi: "५", ro: "5" },
    { hi: "६", ro: "6" }, { hi: "७", ro: "7" }, { hi: "८", ro: "8" }, { hi: "९", ro: "9" },

    // 4. PUNCTUATION
    { hi: "।", ro: "." }, { hi: "॥", ro: "." }
  ];

  const vowels = {
    'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee', 'उ': 'u', 'ऊ': 'oo', 
    'ऋ': 'ri', 'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au', 
    'अं': 'an', 'अः': 'ah'
  };

  const consonants = {
    'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'ng',
    'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ञ': 'ny',
    'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n',
    'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
    'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
    'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v', 'श': 'sh', 
    'ष': 'sh', 'स': 's', 'ह': 'h',
    'क़': 'q', 'ख़': 'kh', 'ग़': 'gh', 'ज़': 'z', 'ड़': 'd', 'ढ़': 'rh', 'फ़': 'f' // Urdu/Hindi extras
  };

  const matras = {
    'ा': 'aa', 'ि': 'i', 'ी': 'ee', 'ु': 'u', 'ू': 'oo', 
    'ृ': 'ri', 'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au', 
    'ं': 'n', 'ः': 'h', '्': '', 'ँ': 'n', '़': ''
  };

  // Helpers
  function isVowel(char) { return vowels[char] !== undefined; }
  function isConsonant(char) { return consonants[char] !== undefined; }
  function isMatra(char) { return matras[char] !== undefined; }

  function convertWord(word) {
    let result = "";
    let i = 0;

    while (i < word.length) {
      let foundSpecial = false;

      // STRATEGY 1: Check Mappings (e.g. 'ksha')
      for (let item of mapping) {
        if (word.substr(i, item.hi.length) === item.hi) {
          result += item.ro;
          i += item.hi.length;
          foundSpecial = true;
          break;
        }
      }
      if (foundSpecial) continue;

      // STRATEGY 2: Letter-by-Letter
      const char = word[i];
      const nextChar = word[i+1];

      if (isVowel(char)) {
        result += vowels[char];
        i++;
      }
      else if (isConsonant(char)) {
        let roman = consonants[char];
        
        // Look ahead for Matra
        if (nextChar && isMatra(nextChar)) {
          // Fix for Mantri (M + Anusvara): Add 'a' before 'n'
          if (nextChar === 'ं') {
             result += roman + 'an'; 
             i += 2;
          } 
          // Fix for Halant (Half letter)
          else if (nextChar === '्') {
             result += roman; 
             i += 2; 
          } else {
             result += roman + matras[nextChar];
             i += 2; 
          }
        } 
        // No Matra? Add inherent 'a'
        else {
          // Schwa Deletion: Don't add 'a' if it's the LAST letter
          if (i === word.length - 1) {
            result += roman; 
          } else {
            result += roman + "a";
          }
          i++;
        }
      }
      else {
        // Punctuation/Numbers/English
        if (matras[char]) result += matras[char];
        else result += char;
        i++;
      }
    }
    return result;
  }

  // --- SELECTION LOGIC ---
  function replaceSelection() {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    const range = selection.getRangeAt(0);
    const selectedText = selection.toString();
    
    if (!selectedText) return;

    // Split by regex but keep delimiters to preserve structure
    // This ensures ||Crime Patrol|| stays exactly as is.
    const parts = selectedText.split(/(\s+|[.,!?।])/);
    
    const convertedParts = parts.map(part => {
       // If the chunk has Hindi, convert it. If it's English/Symbol, leave it.
       return /[\u0900-\u097F]/.test(part) ? convertWord(part) : part;
    });

    const finalString = convertedParts.join("");

    const span = document.createElement("span");
    span.textContent = finalString;
    span.style.backgroundColor = "#e6fffa"; 
    span.style.color = "#00695c"; 
    span.style.fontWeight = "bold";
    span.style.borderBottom = "2px solid #00695c";

    range.deleteContents();
    range.insertNode(span);
    selection.removeAllRanges();
  }

  // --- WHOLE PAGE LOGIC ---
  function traverseAndConvert(node) {
    if (node.nodeType === 3) { 
      const text = node.nodeValue;
      if (/[\u0900-\u097F]/.test(text)) {
        const parts = text.split(/(\s+|[.,!?।])/);
        const convertedParts = parts.map(part => {
           return /[\u0900-\u097F]/.test(part) ? convertWord(part) : part;
        });
        node.nodeValue = convertedParts.join("");
      }
    } else {
      if (node.nodeName !== 'SCRIPT' && node.nodeName !== 'STYLE') {
          for (let i = 0; i < node.childNodes.length; i++) {
            traverseAndConvert(node.childNodes[i]);
          }
      }
    }
  }

  // --- LISTENER ---
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "convertSelection") {
      replaceSelection();
      sendResponse({status: "done"});
    } 
    else if (request.action === "convert") {
      traverseAndConvert(document.body);
      sendResponse({status: "done"});
    }
  });
}