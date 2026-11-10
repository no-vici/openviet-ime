(() => {
  // src/engine/key-codes.js
  var IME_METHOD = {
    OFF: 0,
    TELEX: 1,
    VNI: 2,
    AUTO: 3
  };
  var TONE_STYLE = {
    MODERN: "modern",
    // hoà, hoá, thuỷ, khoẻ (quy chuẩn mới / BGDĐT: dấu trên âm chính a, e, y)
    CLASSIC: "classic"
    // hòa, hóa, thủy, khỏe (phong cách cũ: dấu trên âm đệm o, u)
  };
  var DELIMITERS = /* @__PURE__ */ new Set([
    " ",
    "	",
    "\n",
    "\r",
    ".",
    ",",
    ";",
    ":",
    "!",
    "?",
    "-",
    "\u2014",
    "_",
    "/",
    "\\",
    "|",
    "(",
    ")",
    "[",
    "]",
    "{",
    "}",
    "<",
    ">",
    '"',
    "'",
    "`",
    "\u201C",
    "\u201D",
    "\u2018",
    "\u2019"
  ]);
  function isDelimiter(char) {
    if (!char || char.length !== 1) return false;
    return DELIMITERS.has(char);
  }
  function isUrlOrEmailOrCode(textBeforeCaret = "", currentWord = "", nextKey = "") {
    const token = (currentWord || "").trim();
    const fullContext = textBeforeCaret || "";
    const lastChunkMatch = fullContext.match(/[^\s]+$/);
    const currentChunk = lastChunkMatch ? lastChunkMatch[0] : token;
    if (!currentChunk && !token) return false;
    if (/^(https?|ftp|file):\/\//i.test(currentChunk)) {
      return true;
    }
    if (/^(www\.|localhost[\/:]|127\.0\.0\.1)/i.test(currentChunk)) {
      return true;
    }
    if (/\.(com|vn|net|org|io|dev|app|edu|gov|co|me|info|xyz|ai|tech|store|site)(\/|\?|#|$)/i.test(currentChunk)) {
      return true;
    }
    if (/^(\/|~\/|\.\/|\.\.\/)[a-zA-Z0-9_.-]/i.test(currentChunk)) {
      return true;
    }
    if (/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+/i.test(currentChunk)) {
      return true;
    }
    if (currentChunk.includes("@") || token.includes("@")) {
      return true;
    }
    if (/^\$\{?[a-zA-Z0-9_]+/i.test(currentChunk) || /^\$\{?[a-zA-Z0-9_]+/i.test(token)) {
      return true;
    }
    if (token.includes("_") || currentChunk.includes("_")) {
      return true;
    }
    if (/[a-zA-Z0-9]-[a-zA-Z0-9]/.test(currentChunk)) {
      return true;
    }
    if (/[a-zA-Z0-9]\.[a-zA-Z0-9]/.test(currentChunk)) {
      return true;
    }
    if (/^(\$|#|--)[a-zA-Z0-9_-]/i.test(currentChunk) || /^(\$|#|--)[a-zA-Z0-9_-]/i.test(token)) {
      return true;
    }
    if (/\.(js|ts|tsx|jsx|json|html|css|scss|py|go|rs|cpp|c|h|java|md|sql|sh|yml|yaml|xml)$/i.test(currentChunk)) {
      return true;
    }
    if (/(\->|=>|::|!=|===?|<=|>=|<\/|\/>)/.test(currentChunk)) {
      return true;
    }
    if (/<[a-zA-Z][a-zA-Z0-9_-]*/.test(currentChunk)) {
      return true;
    }
    const hasAccents = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/iu;
    if (hasAccents.test(currentChunk) && /[A-Z]$/.test(currentChunk) || hasAccents.test(token) && /[A-Z]$/.test(token)) {
      return false;
    }
    if (isCamelOrPascalCase(token) || isCamelOrPascalCase(currentChunk)) {
      return true;
    }
    return false;
  }
  function isCamelOrPascalCase(token = "") {
    if (!token || typeof token !== "string" || token.length < 2) return false;
    const clean = token.replace(/^[^a-zA-Z\p{L}]+/u, "");
    if (clean.length < 2) return false;
    if (/^[\p{Ll}\p{M}]+[A-Z]/u.test(clean)) {
      return true;
    }
    if (/^[\p{Lu}][\p{Ll}\p{M}]+[A-Z]/u.test(clean)) {
      return true;
    }
    return false;
  }

  // src/engine/vietnamese-words.js
  var VIETNAMESE_WORDS_STRING = "a abc ai am an ang anh ao ascii au ba bai ban bang banh bao basoi bay be bem ben beng beo bi bia bin binh bi\xEAn bi\xEAng bi\u1EBFc bi\u1EBFm bi\u1EBFn bi\u1EBFng bi\u1EBFt bi\u1EBFu bi\u1EC1n bi\u1EC3n bi\u1EC3u bi\u1EC7n bi\u1EC7t bo bom bon bong boong bo\xF3ng bu bua bung bu\xF4n bu\xF4ng bu\xFDt bu\u1ED1t bu\u1ED3i bu\u1ED3m bu\u1ED3n bu\u1ED3ng bu\u1ED5i bu\u1ED9c bu\u1ED9t b\xE0 b\xE0i b\xE0m b\xE0n b\xE0ng b\xE0nh b\xE0o b\xE0u b\xE0y b\xE1 b\xE1c b\xE1ch b\xE1i b\xE1m b\xE1n b\xE1ng b\xE1nh b\xE1o b\xE1t b\xE1u b\xE2n b\xE2ng b\xE2u b\xE2y b\xE3 b\xE3i b\xE3o b\xE8 b\xE8m b\xE8n b\xE8o b\xE9 b\xE9c b\xE9n b\xE9ng b\xE9o b\xE9p b\xE9t b\xEA b\xEAn b\xEAnh b\xEAu b\xEC b\xECa b\xECm b\xECnh b\xECu b\xED b\xEDa b\xEDch b\xEDm b\xEDnh b\xEDt b\xEDu b\xF2 b\xF2i b\xF2m b\xF2n b\xF2ng b\xF3 b\xF3c b\xF3i b\xF3n b\xF3ng b\xF3p b\xF3t b\xF4 b\xF4i b\xF4m b\xF4n b\xF4ng b\xF5 b\xF5m b\xF5ng b\xF9 b\xF9a b\xF9i b\xF9m b\xF9n b\xF9ng b\xFA b\xFAa b\xFAi b\xFAn b\xFAng b\xFAp b\xFAt b\u0103m b\u0103n b\u0103ng b\u0129 b\u0129nh b\u0129u b\u0169m b\u01A1 b\u01A1i b\u01A1m b\u01A1n b\u01B0 b\u01B0a b\u01B0ng b\u01B0u b\u01B0\u01A1i b\u01B0\u01A1m b\u01B0\u01A1n b\u01B0\u01A1ng b\u01B0\u01A1u b\u01B0\u1EDBc b\u01B0\u1EDBm b\u01B0\u1EDBng b\u01B0\u1EDBp b\u01B0\u1EDBu b\u01B0\u1EDFi b\u01B0\u1EE3t b\u1EA1 b\u1EA1c b\u1EA1ch b\u1EA1i b\u1EA1n b\u1EA1nh b\u1EA1o b\u1EA1p b\u1EA1t b\u1EA1u b\u1EA3 b\u1EA3i b\u1EA3n b\u1EA3ng b\u1EA3nh b\u1EA3o b\u1EA3u b\u1EA3y b\u1EA5c b\u1EA5m b\u1EA5n b\u1EA5p b\u1EA5t b\u1EA5u b\u1EA5y b\u1EA7m b\u1EA7n b\u1EA7ng b\u1EA7u b\u1EA7y b\u1EA9m b\u1EA9n b\u1EA9y b\u1EABm b\u1EABy b\u1EADc b\u1EADm b\u1EADn b\u1EADp b\u1EADt b\u1EADu b\u1EADy b\u1EAFc b\u1EAFn b\u1EAFng b\u1EAFp b\u1EAFt b\u1EB1m b\u1EB1n b\u1EB1ng b\u1EB1ng b\u1EB3n b\u1EB5ng b\u1EB7m b\u1EB7n b\u1EB7ng b\u1EB7p b\u1EB7t b\u1EB9 b\u1EB9n b\u1EB9o b\u1EB9p b\u1EB9t b\u1EBB b\u1EBBm b\u1EBBo b\u1EBD b\u1EBDn b\u1EBDo b\u1EBF b\u1EBFn b\u1EBFp b\u1EBFt b\u1EC1 b\u1EC1n b\u1EC1nh b\u1EC1u b\u1EC3 b\u1EC5 b\u1EC7 b\u1EC7ch b\u1EC7n b\u1EC7nh b\u1EC7t b\u1EC7u b\u1EC9 b\u1EC9m b\u1EC9nh b\u1EC9u b\u1ECB b\u1ECBa b\u1ECBch b\u1ECBn b\u1ECBnh b\u1ECBp b\u1ECBt b\u1ECBu b\u1ECD b\u1ECDc b\u1ECDn b\u1ECDng b\u1ECDp b\u1ECDt b\u1ECF b\u1ECFi b\u1ECFm b\u1ECFng b\u1ED1 b\u1ED1c b\u1ED1i b\u1ED1n b\u1ED1ng b\u1ED1p b\u1ED1t b\u1ED3 b\u1ED3i b\u1ED3m b\u1ED3n b\u1ED3ng b\u1ED5 b\u1ED5i b\u1ED5n b\u1ED5ng b\u1ED7 b\u1ED7ng b\u1ED9 b\u1ED9c b\u1ED9i b\u1ED9n b\u1ED9ng b\u1ED9p b\u1ED9t b\u1EDB b\u1EDBi b\u1EDBp b\u1EDBt b\u1EDD b\u1EDDi b\u1EDDm b\u1EDDn b\u1EDF b\u1EDFi b\u1EE1 b\u1EE1n b\u1EE3 b\u1EE3m b\u1EE3n b\u1EE3p b\u1EE3t b\u1EE5 b\u1EE5a b\u1EE5c b\u1EE5i b\u1EE5m b\u1EE5ng b\u1EE5p b\u1EE5t b\u1EE7 b\u1EE7a b\u1EE7m b\u1EE7n b\u1EE7ng b\u1EE9 b\u1EE9c b\u1EE9ng b\u1EE9t b\u1EEBa b\u1EEBng b\u1EEDa b\u1EEDng b\u1EEDu b\u1EEFa b\u1EF1 b\u1EF1a b\u1EF1c b\u1EF1t ca cai cam can canh cao cau cay cha chai chan chang chanh chao chau chay che chem chen cheng cheo chi chia chim chinh chiu chi\xEAm chi\xEAn chi\xEAng chi\xEAu chi\u1EBFc chi\u1EBFm chi\u1EBFn chi\u1EBFng chi\u1EBFp chi\u1EBFt chi\u1EBFu chi\u1EC1n chi\u1EC1ng chi\u1EC1u chi\u1EC3u chi\u1EC7n cho choang choi chong cho\xE0i cho\xE0ng cho\xE1 cho\xE1i cho\xE1n cho\xE1ng cho\xE3i cho\xE8n cho\xE9 cho\xF2ng cho\u0103n cho\u1EA1c cho\u1EA1ng cho\u1EA1p cho\u1EA3ng cho\u1EAFt cho\u1EB9 cho\u1EB9t chu chua chui chum chun chung chuy\xEAn chuy\u1EBFn chuy\u1EC1n chuy\u1EC3n chuy\u1EC7n chu\xF4i chu\xF4m chu\xF4ng chu\u1EA9n chu\u1EBFch chu\u1EC7ch chu\u1ED1c chu\u1ED1i chu\u1ED1t chu\u1ED3i chu\u1ED3n chu\u1ED3ng chu\u1ED7i chu\u1ED9c chu\u1ED9i chu\u1ED9ng chu\u1ED9t chu\u1EF3 ch\xE0 ch\xE0i ch\xE0m ch\xE0ng ch\xE0nh ch\xE0o ch\xE0y ch\xE1 ch\xE1c ch\xE1i ch\xE1n ch\xE1ng ch\xE1nh ch\xE1o ch\xE1t ch\xE1u ch\xE1y ch\xE2m ch\xE2n ch\xE2u ch\xE2y ch\xE3 ch\xE3i ch\xE3o ch\xE8 ch\xE8n ch\xE8o ch\xE9 ch\xE9m ch\xE9n ch\xE9o ch\xE9p ch\xE9t ch\xEA ch\xEAm ch\xEAnh ch\xEC ch\xECa ch\xECm ch\xECnh ch\xECu ch\xED ch\xEDch ch\xEDm ch\xEDn ch\xEDnh ch\xEDp ch\xEDt ch\xEDu ch\xF2 ch\xF2i ch\xF2m ch\xF2ng ch\xF3 ch\xF3a ch\xF3c ch\xF3e ch\xF3i ch\xF3ng ch\xF3p ch\xF3t ch\xF4m ch\xF4n ch\xF4ng ch\xF5 ch\xF5m ch\xF5ng ch\xF9 ch\xF9a ch\xF9i ch\xF9m ch\xF9n ch\xF9ng ch\xF9y ch\xFA ch\xFAa ch\xFAc ch\xFAi ch\xFAm ch\xFAng ch\xFAt ch\u0103m ch\u0103n ch\u0103ng ch\u0129a ch\u0129n ch\u0129nh ch\u0169i ch\u0169m ch\u0169n ch\u01A1 ch\u01A1i ch\u01A1m ch\u01A1n ch\u01B0 ch\u01B0a ch\u01B0n ch\u01B0ng ch\u01B0\u01A1ng ch\u01B0\u1EDBc ch\u01B0\u1EDBng ch\u01B0\u1EDDm ch\u01B0\u1EDDng ch\u01B0\u1EDFi ch\u01B0\u1EDFng ch\u01B0\u1EE1ng ch\u01B0\u1EE3c ch\u01B0\u1EE3p ch\u1EA1 ch\u1EA1c ch\u1EA1ch ch\u1EA1m ch\u1EA1n ch\u1EA1ng ch\u1EA1nh ch\u1EA1o ch\u1EA1p ch\u1EA1t ch\u1EA1y ch\u1EA3 ch\u1EA3i ch\u1EA3nh ch\u1EA3o ch\u1EA3u ch\u1EA3y ch\u1EA5m ch\u1EA5n ch\u1EA5p ch\u1EA5t ch\u1EA5u ch\u1EA5y ch\u1EA7m ch\u1EA7n ch\u1EA7u ch\u1EA7y ch\u1EA9m ch\u1EA9n ch\u1EABu ch\u1EADc ch\u1EADm ch\u1EADn ch\u1EADp ch\u1EADt ch\u1EADu ch\u1EAFc ch\u1EAFm ch\u1EAFn ch\u1EAFp ch\u1EAFt ch\u1EB1m ch\u1EB1n ch\u1EB1ng ch\u1EB3ng ch\u1EB5n ch\u1EB7c ch\u1EB7m ch\u1EB7n ch\u1EB7ng ch\u1EB7p ch\u1EB7t ch\u1EB9n ch\u1EB9o ch\u1EB9p ch\u1EB9t ch\u1EBB ch\u1EBBm ch\u1EBBn ch\u1EBBo ch\u1EBD ch\u1EBDn ch\u1EBF ch\u1EBFch ch\u1EBFnh ch\u1EBFt ch\u1EC1 ch\u1EC1m ch\u1EC1nh ch\u1EC3nh ch\u1EC5m ch\u1EC5nh ch\u1EC7 ch\u1EC7ch ch\u1EC7n ch\u1EC7nh ch\u1EC9 ch\u1EC9n ch\u1EC9nh ch\u1ECB ch\u1ECBa ch\u1ECBt ch\u1ECBu ch\u1ECD ch\u1ECDc ch\u1ECDe ch\u1ECDi ch\u1ECDn ch\u1ECDt ch\u1ECF ch\u1ECFm ch\u1ECFn ch\u1ECFng ch\u1ED1c ch\u1ED1i ch\u1ED1n ch\u1ED1ng ch\u1ED1p ch\u1ED1t ch\u1ED3 ch\u1ED3i ch\u1ED3m ch\u1ED3n ch\u1ED3ng ch\u1ED5i ch\u1ED5ng ch\u1ED7 ch\u1ED7m ch\u1ED9 ch\u1ED9i ch\u1ED9n ch\u1ED9p ch\u1ED9t ch\u1EDB ch\u1EDBi ch\u1EDBm ch\u1EDBp ch\u1EDBt ch\u1EDD ch\u1EDDm ch\u1EDDn ch\u1EDF ch\u1EDFm ch\u1EE3 ch\u1EE3n ch\u1EE3p ch\u1EE3t ch\u1EE5c ch\u1EE5m ch\u1EE5p ch\u1EE5t ch\u1EE7 ch\u1EE7n ch\u1EE7ng ch\u1EE9 ch\u1EE9a ch\u1EE9c ch\u1EE9ng ch\u1EEB ch\u1EEBa ch\u1EEBng ch\u1EEDa ch\u1EEDi ch\u1EEDi ch\u1EEDng ch\u1EEF ch\u1EEFa ch\u1EEFng ch\u1EF1c co coi com con cong coong co\xF3c cu cua cui cum cun cung cu\u1ED1c cu\u1ED1i cu\u1ED1n cu\u1ED1ng cu\u1ED3n cu\u1ED3ng cu\u1ED7m cu\u1ED9c cu\u1ED9i cu\u1ED9n cu\u1ED9ng c\xE0 c\xE0i c\xE0n c\xE0ng c\xE0nh c\xE0o c\xE0u c\xE0y c\xE1 c\xE1c c\xE1ch c\xE1i c\xE1m c\xE1n c\xE1ng c\xE1nh c\xE1o c\xE1p c\xE1t c\xE1u c\xE1y c\xE2m c\xE2n c\xE2ng c\xE2u c\xE2y c\xE3i c\xF2 c\xF2i c\xF2m c\xF2n c\xF2ng c\xF3 c\xF3c c\xF3i c\xF3ng c\xF3p c\xF3t c\xF4 c\xF4i c\xF4m c\xF4n c\xF4ng c\xF5i c\xF5ng c\xF9 c\xF9i c\xF9m c\xF9n c\xF9ng c\xFA c\xFAa c\xFAc c\xFAi c\xFAm c\xFAng c\xFAp c\xFAt c\u0103m c\u0103n c\u0103ng c\u0169 c\u0169i c\u0169n c\u0169ng c\u01A1 c\u01A1i c\u01A1m c\u01A1n c\u01B0 c\u01B0a c\u01B0ng c\u01B0u c\u01B0\u01A1ng c\u01B0\u1EDBc c\u01B0\u1EDBi c\u01B0\u1EDBp c\u01B0\u1EDDi c\u01B0\u1EDDm c\u01B0\u1EDDng c\u01B0\u1EE1i c\u01B0\u1EE1ng c\u1EA1 c\u1EA1c c\u1EA1ch c\u1EA1m c\u1EA1n c\u1EA1nh c\u1EA1o c\u1EA1p c\u1EA1u c\u1EA1y c\u1EA3 c\u1EA3i c\u1EA3m c\u1EA3n c\u1EA3ng c\u1EA3nh c\u1EA3o c\u1EA3u c\u1EA3y c\u1EA5c c\u1EA5m c\u1EA5n c\u1EA5p c\u1EA5t c\u1EA5u c\u1EA5y c\u1EA7m c\u1EA7n c\u1EA7u c\u1EA7y c\u1EA9m c\u1EA9n c\u1EA9u c\u1EA9y c\u1EABm c\u1EABn c\u1EABng c\u1EADn c\u1EADp c\u1EADt c\u1EADu c\u1EADy c\u1EAFc c\u1EAFm c\u1EAFn c\u1EAFp c\u1EAFt c\u1EB1m c\u1EB1n c\u1EB3n c\u1EB3ng c\u1EB5ng c\u1EB7c c\u1EB7m c\u1EB7n c\u1EB7p c\u1EB7t c\u1ECD c\u1ECDc c\u1ECDm c\u1ECDn c\u1ECDng c\u1ECDp c\u1ECDt c\u1ECF c\u1ECFi c\u1ECFm c\u1ECFn c\u1ECFng c\u1ED1 c\u1ED1c c\u1ED1i c\u1ED1m c\u1ED1n c\u1ED1ng c\u1ED1p c\u1ED1t c\u1ED3 c\u1ED3m c\u1ED3n c\u1ED3ng c\u1ED5 c\u1ED5i c\u1ED5n c\u1ED5ng c\u1ED7 c\u1ED7i c\u1ED9 c\u1ED9c c\u1ED9i c\u1ED9m c\u1ED9n c\u1ED9ng c\u1ED9p c\u1ED9t c\u1EDB c\u1EDBm c\u1EDBn c\u1EDBt c\u1EDD c\u1EDDi c\u1EDDn c\u1EDFi c\u1EE1 c\u1EE1i c\u1EE1m c\u1EE1n c\u1EE3n c\u1EE3t c\u1EE5 c\u1EE5c c\u1EE5i c\u1EE5m c\u1EE5ng c\u1EE5p c\u1EE5t c\u1EE7 c\u1EE7a c\u1EE7i c\u1EE7n c\u1EE7ng c\u1EE9 c\u1EE9a c\u1EE9c c\u1EE9ng c\u1EE9t c\u1EE9u c\u1EEB c\u1EEBu c\u1EED c\u1EEDa c\u1EEDi c\u1EEDng c\u1EEDu c\u1EEF c\u1EEFu c\u1EF1 c\u1EF1a c\u1EF1c c\u1EF1u da dai dam dan dang danh dao day de deo di dim dinh di\xEAm di\xEAn di\xEAu di\u1EBFc di\u1EBFp di\u1EBFt di\u1EBFu di\u1EC1m di\u1EC1u di\u1EC5m di\u1EC5n di\u1EC5u di\u1EC7c di\u1EC7n di\u1EC7p di\u1EC7t di\u1EC7u do doa doan doanh doi dom don dong do\xE0nh do\xE1 do\xE3i do\xE3n do\xE3ng do\u1EA1 du dua dun dung duy duy\xEAn duy\u1EC7t du\u1EC1nh du\u1EC7 du\u1ED1c du\u1ED7i d\xE0 d\xE0i d\xE0n d\xE0ng d\xE0nh d\xE0o d\xE0u d\xE0y d\xE1 d\xE1c d\xE1i d\xE1m d\xE1n d\xE1ng d\xE1t d\xE1y d\xE2m d\xE2n d\xE2ng d\xE2u d\xE2y d\xE3 d\xE3i d\xE3y d\xE8 d\xE8n d\xE9 d\xE9p d\xEA d\xEAnh d\xEC d\xECa d\xECm d\xECu d\xED d\xEDch d\xEDm d\xEDnh d\xEDp d\xEDu d\xF2 d\xF2i d\xF2m d\xF2ng d\xF3 d\xF3a d\xF3c d\xF3m d\xF3n d\xF3t d\xF4 d\xF4i d\xF4ng d\xF5i d\xF5ng d\xF9 d\xF9a d\xF9i d\xF9n d\xF9ng d\xFAa d\xFAi d\xFAm d\xFAn d\xFAng d\xFAt d\u0103m d\u0103n d\u0103ng d\u0129 d\u0129a d\u0129nh d\u0169 d\u0169i d\u0169ng d\u01A1 d\u01A1i d\u01B0 d\u01B0a d\u01B0ng d\u01B0\u01A1ng d\u01B0\u1EDBi d\u01B0\u1EDBng d\u01B0\u1EDDng d\u01B0\u1EE1ng d\u01B0\u1EE3c d\u01B0\u1EE3ng d\u01B0\u1EE3t d\u1EA1 d\u1EA1c d\u1EA1i d\u1EA1m d\u1EA1n d\u1EA1ng d\u1EA1o d\u1EA1t d\u1EA1y d\u1EA3 d\u1EA3i d\u1EA3y d\u1EA5m d\u1EA5n d\u1EA5p d\u1EA5u d\u1EA5y d\u1EA7m d\u1EA7n d\u1EA7u d\u1EA9n d\u1EABm d\u1EABn d\u1EABu d\u1EABy d\u1EADm d\u1EADn d\u1EADp d\u1EADt d\u1EADu d\u1EADy d\u1EAFng d\u1EAFt d\u1EB1m d\u1EB1n d\u1EB1ng d\u1EB3ng d\u1EB7c d\u1EB7m d\u1EB7n d\u1EB7ng d\u1EB7t d\u1EB9p d\u1EB9t d\u1EBB d\u1EBBo d\u1EBD d\u1EBF d\u1EC1 d\u1EC1nh d\u1EC3 d\u1EC5 d\u1EC7n d\u1EC7t d\u1ECB d\u1ECBch d\u1ECBp d\u1ECBt d\u1ECBu d\u1ECDa d\u1ECDc d\u1ECDi d\u1ECDn d\u1ECDng d\u1ECDp d\u1ECF d\u1ECFm d\u1ECFng d\u1ED1c d\u1ED1i d\u1ED1t d\u1ED3i d\u1ED3n d\u1ED7 d\u1ED7i d\u1ED9i d\u1ED9ng d\u1ED9t d\u1EDB d\u1EDBp d\u1EDD d\u1EDDi d\u1EDF d\u1EDFm d\u1EE1 d\u1EE3 d\u1EE5 d\u1EE5c d\u1EE5m d\u1EE5ng d\u1EE9 d\u1EE9a d\u1EE9c d\u1EE9t d\u1EEB d\u1EEBa d\u1EEBng d\u1EED d\u1EEDng d\u1EEF d\u1EF1 d\u1EF1 d\u1EF1a d\u1EF1c d\u1EF1ng e em email en eng eo ga gai gam gan gang ganh gao gau gay gen ghe ghen ghi ghim ghi\u1EBFc ghi\u1EC1n gh\xE8 gh\xE8n gh\xE9 gh\xE9m gh\xE9p gh\xE9t gh\xEA gh\xEC gh\xECm gh\u1EB9 gh\u1EB9n gh\u1EB9o gh\u1EBB gh\u1EBD gh\u1EBF gh\u1EBFch gh\u1EC1 gh\u1EC1nh gh\u1EC3nh gh\u1EC7t gi gia giai giam gian giang gianh giao gieo gif gio gioi gion giong gip giu giua giun giu\u1ED9c gi\xE0 gi\xE0n gi\xE0ng gi\xE0nh gi\xE0o gi\xE0u gi\xE0y gi\xE1 gi\xE1c gi\xE1m gi\xE1n gi\xE1ng gi\xE1o gi\xE1p gi\xE1t gi\xE2m gi\xE2u gi\xE2y gi\xE3 gi\xE3i gi\xE3n gi\xE3y gi\xE8m gi\xE9 gi\xE9o gi\xEA gi\xEAng gi\xF2 gi\xF2i gi\xF2n gi\xF3 gi\xF3c gi\xF3i gi\xF3n gi\xF3ng gi\xF4 gi\xF4n gi\xF4ng gi\xF9i gi\xF9m gi\xFA gi\xFAi gi\xFAp gi\u0103m gi\u0103ng gi\u0169 gi\u0169a gi\u01A1 gi\u01B0\u01A1ng gi\u01B0\u1EDBng gi\u01B0\u1EDDng gi\u01B0\u1EE3ng gi\u1EA1 gi\u1EA1i gi\u1EA1ng gi\u1EA1t gi\u1EA3 gi\u1EA3i gi\u1EA3m gi\u1EA3n gi\u1EA3ng gi\u1EA3nh gi\u1EA3o gi\u1EA3u gi\u1EA5c gi\u1EA5m gi\u1EA5p gi\u1EA5u gi\u1EA5y gi\u1EA7m gi\u1EA7n gi\u1EA7u gi\u1EA7y gi\u1EABm gi\u1EABy gi\u1EADm gi\u1EADn gi\u1EADp gi\u1EADt gi\u1EADu gi\u1EAFn gi\u1EAFt gi\u1EB1m gi\u1EB1n gi\u1EB1ng gi\u1EB7c gi\u1EB7m gi\u1EB7n gi\u1EB7t gi\u1EB9o gi\u1EB9p gi\u1EBB gi\u1EBFc gi\u1EBFm gi\u1EBFng gi\u1EBFt gi\u1EC1 gi\u1EC1n gi\u1EC1ng gi\u1EC5u gi\u1ECD gi\u1ECDc gi\u1ECDi gi\u1ECDng gi\u1ECDt gi\u1ECF gi\u1ECFi gi\u1ECFi gi\u1ECFn gi\u1ECFng gi\u1ED1i gi\u1ED1ng gi\u1ED1t gi\u1ED3 gi\u1ED3i gi\u1ED3ng gi\u1ED5i gi\u1ED7 gi\u1ED9 gi\u1ED9i gi\u1ED9p gi\u1EDBi gi\u1EDD gi\u1EDDi gi\u1EDDn gi\u1EDF gi\u1EE1n gi\u1EE5a gi\u1EE5c gi\u1EE5i gi\u1EE7i gi\u1EEB gi\u1EEF gi\u1EEFa gi\u1EEFa gi\u1EF1t go gom gon go\xE1 go\xF2ng gram gu gu\u1ED1c gu\u1ED3i gu\u1ED3ng gu\u1ED9c g\xE0 g\xE0i g\xE0n g\xE0ng g\xE0nh g\xE0o g\xE0u g\xE1 g\xE1c g\xE1i g\xE1n g\xE1nh g\xE1o g\xE1p g\xE1u g\xE1y g\xE2m g\xE2n g\xE2u g\xE2y g\xE3 g\xE3i g\xE3y g\xEC g\xECm g\xECn g\xED g\xEDch g\xEDp g\xF2 g\xF2n g\xF3a g\xF3c g\xF3i g\xF3p g\xF3t g\xF4 g\xF4m g\xF4n g\xF4ng g\xF5 g\xF9 g\xF9i g\xF9n g\xF9ng g\xFAt g\u0103m g\u0103n g\u0103ng g\u0169i g\u01A1 g\u01B0\u01A1m g\u01B0\u01A1ng g\u01B0\u1EDDm g\u01B0\u1EDDng g\u01B0\u1EE1ng g\u01B0\u1EE3m g\u01B0\u1EE3ng g\u1EA1 g\u1EA1c g\u1EA1ch g\u1EA1n g\u1EA1nh g\u1EA1o g\u1EA1t g\u1EA3 g\u1EA3y g\u1EA5c g\u1EA5m g\u1EA5p g\u1EA5u g\u1EA5y g\u1EA7m g\u1EA7n g\u1EA7u g\u1EA7y g\u1EA9m g\u1EABm g\u1EABu g\u1EADm g\u1EADp g\u1EADt g\u1EADy g\u1EAFm g\u1EAFn g\u1EAFng g\u1EAFp g\u1EAFt g\u1EB1m g\u1EB1n g\u1EB7c g\u1EB7m g\u1EB7n g\u1EB7ng g\u1EB7p g\u1EB7t g\u1EC9 g\u1ECDi g\u1ECDn g\u1ECDng g\u1ECDt g\u1ECFi g\u1ECFng g\u1ED1c g\u1ED1i g\u1ED1m g\u1ED3 g\u1ED3i g\u1ED3m g\u1ED3ng g\u1ED5 g\u1ED7 g\u1ED9 g\u1ED9c g\u1ED9i g\u1ED9p g\u1ED9t g\u1EDBm g\u1EDD g\u1EDDm g\u1EDDn g\u1EDF g\u1EDFi g\u1EE1 g\u1EE3i g\u1EE3n g\u1EE3t g\u1EE5 g\u1EE5c g\u1EE5i g\u1EE5t g\u1EEB g\u1EEBng g\u1EEDi g\u1EF5a ha hai ham han hang hanh hao hau hay hcm he hem hen heo hi hia him hiu hi\xEAn hi\xEAng hi\u1EBFm hi\u1EBFn hi\u1EBFng hi\u1EBFp hi\u1EBFu hi\u1EC1m hi\u1EC1n hi\u1EC3m hi\u1EC3n hi\u1EC3u hi\u1EC7n hi\u1EC7p hi\u1EC7u hk ho hoa hoan hoang hoay hoe hoen hoi hom hon hong ho\xE0 ho\xE0i ho\xE0m ho\xE0n ho\xE0ng ho\xE0nh ho\xE1 ho\xE1c ho\xE1n ho\xE1y ho\xE3n ho\xE8 ho\xE9t ho\u0103m ho\u0103ng ho\u1EA1 ho\u1EA1ch ho\u1EA1i ho\u1EA1n ho\u1EA1nh ho\u1EA1t ho\u1EA3 ho\u1EA3i ho\u1EA3ng ho\u1EA3nh ho\u1EAFc ho\u1EAFm ho\u1EAFt ho\u1EB3n ho\u1EB5ng ho\u1EB7c ho\u1EB7c ho\u1EB9 ho\u1EB9t ho\u1EBBn html hu hua hum hun hung huy huynh huy\xEAn huy\u1EBFt huy\u1EC1n huy\u1EC5n huy\u1EC7n huy\u1EC7t hu\xE2n hu\xEA hu\xEAnh hu\xFD hu\xFDch hu\xFDt hu\u01A1 hu\u1EA5n hu\u1EBF hu\u1EBFch hu\u1EC1 hu\u1EC7 hu\u1ED1ng hu\u1EF3nh hu\u1EF5ch hu\u1EF7 hy h\xE0 h\xE0i h\xE0m h\xE0n h\xE0ng h\xE0nh h\xE0o h\xE0u h\xE1 h\xE1c h\xE1ch h\xE1i h\xE1m h\xE1n h\xE1ng h\xE1nh h\xE1o h\xE1t h\xE1u h\xE1y h\xE2m h\xE2n h\xE2u h\xE2y h\xE3i h\xE3m h\xE3n h\xE3ng h\xE3nh h\xE3o h\xE3y h\xE8 h\xE8m h\xE8n h\xE8o h\xE9 h\xE9c h\xE9o h\xE9t h\xEA h\xEAn h\xEAnh h\xEC h\xECnh h\xED h\xEDch h\xEDp h\xEDt h\xF2 h\xF2a h\xF2e h\xF2i h\xF2m h\xF2n h\xF2ng h\xF3a h\xF3c h\xF3i h\xF3m h\xF3ng h\xF3p h\xF3t h\xF4 h\xF4i h\xF4m h\xF4n h\xF4ng h\xF5m h\xF9 h\xF9a h\xF9m h\xF9n h\xF9ng h\xFA h\xFAc h\xFAi h\xFAng h\xFAp h\xFAt h\xFAy h\u0103m h\u0103ng h\u0111nd h\u0129m h\u0129nh h\u0169 h\u0169m h\u01A1 h\u01A1i h\u01A1n h\u01B0 h\u01B0ng h\u01B0u h\u01B0\u01A1ng h\u01B0\u01A1u h\u01B0\u1EDBc h\u01B0\u1EDBm h\u01B0\u1EDBng h\u01B0\u1EDDng h\u01B0\u1EDFng h\u01B0\u1EE3m h\u1EA1 h\u1EA1c h\u1EA1ch h\u1EA1i h\u1EA1m h\u1EA1n h\u1EA1ng h\u1EA1nh h\u1EA1o h\u1EA1p h\u1EA1t h\u1EA3 h\u1EA3i h\u1EA3m h\u1EA3ng h\u1EA3o h\u1EA5n h\u1EA5ng h\u1EA5p h\u1EA5t h\u1EA5u h\u1EA5y h\u1EA7m h\u1EA7u h\u1EA7y h\u1EA9m h\u1EA9ng h\u1EA9u h\u1EA9y h\u1EABng h\u1EABu h\u1EADm h\u1EADn h\u1EADp h\u1EADu h\u1EAFc h\u1EAFn h\u1EAFng h\u1EAFt h\u1EB1m h\u1EB1n h\u1EB1ng h\u1EB3n h\u1EB5ng h\u1EB7c h\u1EB9 h\u1EB9m h\u1EB9n h\u1EB9p h\u1EBBm h\u1EBBo h\u1EBFch h\u1EBFn h\u1EBFt h\u1EBFu h\u1EC1 h\u1EC1nh h\u1EC3 h\u1EC3n h\u1EC3nh h\u1EC7 h\u1EC7ch h\u1EC7t h\u1EC9 h\u1EC9nh h\u1ECBch h\u1ECD h\u1ECDa h\u1ECDc h\u1ECDe h\u1ECDng h\u1ECDp h\u1ECFa h\u1ECFi h\u1ECFm h\u1ECFn h\u1ECFng h\u1ED1 h\u1ED1c h\u1ED1i h\u1ED1ng h\u1ED1t h\u1ED3 h\u1ED3i h\u1ED3n h\u1ED3ng h\u1ED5 h\u1ED5i h\u1ED5m h\u1ED5n h\u1ED5ng h\u1ED7 h\u1ED7n h\u1ED7ng h\u1ED9 h\u1ED9c h\u1ED9i h\u1ED9n h\u1ED9p h\u1ED9t h\u1EDB h\u1EDBm h\u1EDBn h\u1EDBp h\u1EDBt h\u1EDD h\u1EDDi h\u1EDDn h\u1EDF h\u1EDFi h\u1EE1i h\u1EE1i h\u1EE3i h\u1EE3m h\u1EE3p h\u1EE3t h\u1EE5c h\u1EE5i h\u1EE5m h\u1EE5p h\u1EE5t h\u1EE7 h\u1EE7i h\u1EE7n h\u1EE7y h\u1EE9a h\u1EE9c h\u1EE9ng h\u1EEB h\u1EEBm h\u1EEBng h\u1EED h\u1EEDng h\u1EEF h\u1EEFng h\u1EEFu h\u1EF1 h\u1EF1c h\u1EF1u i im in inh internet intranet iu jpeg ka ke kem ken keng keo kha khai kham khan khang khanh khao khau khay khe khem khen kheo khi khin khinh khiu khi\xEAm khi\xEAn khi\xEAng khi\xEAu khi\u1EBFm khi\u1EBFn khi\u1EBFp khi\u1EBFt khi\u1EBFu khi\u1EC1n khi\u1EC3n khi\u1EC5ng kho khoa khoai khoan khoang khoanh khoe khoeo khom kho\xE0o kho\xE1 kho\xE1c kho\xE1i kho\xE1n kho\xE1ng kho\xE1t kho\xE1y kho\xE8o kho\xE9 kho\xE9t kho\u0103m kho\u0103n kho\u1EA3 kho\u1EA3i kho\u1EA3n kho\u1EA3ng kho\u1EA3nh kho\u1EAFm kho\u1EAFn kho\u1EAFng kho\u1EAFt kho\u1EB1m kho\u1EBB khu khua khui khum khung khuy khuya khuynh khuy\xEAn khuy\u1EBFn khuy\u1EBFt khuy\u1EC3n khu\xE2n khu\xE2ng khu\xE2y khu\xEA khu\xF4n khu\xF4ng khu\u01A1 khu\u1EA5t khu\u1EA5y khu\u1EA9n khu\u1EBFch khu\u1EF3nh khu\u1EF5u khu\u1EF7u kh\xE0 kh\xE0n kh\xE0ng kh\xE1 kh\xE1c kh\xE1ch kh\xE1i kh\xE1m kh\xE1n kh\xE1ng kh\xE1nh kh\xE1o kh\xE1p kh\xE1t kh\xE1u kh\xE1y kh\xE2m kh\xE2n kh\xE2u kh\xE8 kh\xE8n kh\xE8o kh\xE9 kh\xE9n kh\xE9o kh\xE9p kh\xE9t kh\xEA kh\xEAnh kh\xEAu kh\xEC kh\xECn kh\xED kh\xEDa kh\xEDch kh\xEDt kh\xEDu kh\xF2 kh\xF2m kh\xF2ng kh\xF3 kh\xF3a kh\xF3c kh\xF3e kh\xF3i kh\xF3m kh\xF4 kh\xF4i kh\xF4n kh\xF4ng kh\xF9 kh\xF9ng kh\xFA kh\xFAc kh\xFAm kh\u0103m kh\u0103n kh\u0103ng kh\u0129nh kh\u01A1 kh\u01A1i kh\u01B0 kh\u01B0\u01A1i kh\u01B0\u01A1m kh\u01B0\u01A1n kh\u01B0\u01A1ng kh\u01B0\u1EDBc kh\u01B0\u1EDBt kh\u01B0\u1EDBu kh\u1EA1c kh\u1EA1ng kh\u1EA1o kh\u1EA3 kh\u1EA3i kh\u1EA3m kh\u1EA3n kh\u1EA3ng kh\u1EA3nh kh\u1EA3o kh\u1EA3y kh\u1EA5c kh\u1EA5m kh\u1EA5n kh\u1EA5p kh\u1EA5t kh\u1EA5u kh\u1EA9n kh\u1EA9u kh\u1EA9y kh\u1EADp kh\u1EADt kh\u1EAFc kh\u1EAFm kh\u1EAFng kh\u1EAFp kh\u1EAFt kh\u1EB1ng kh\u1EB3m kh\u1EB3n kh\u1EB3ng kh\u1EB7c kh\u1EB9c kh\u1EBB kh\u1EBBo kh\u1EBD kh\u1EBF kh\u1EC1 kh\u1EC1u kh\u1EC3nh kh\u1EC7 kh\u1EC7nh kh\u1EC9 kh\u1EC9nh kh\u1ECBa kh\u1ECBt kh\u1ECDm kh\u1ECFa kh\u1ECFe kh\u1ECFi kh\u1ECFng kh\u1ED1 kh\u1ED1c kh\u1ED1i kh\u1ED1n kh\u1ED1ng kh\u1ED5 kh\u1ED5n kh\u1ED5ng kh\u1EDB kh\u1EDBp kh\u1EDD kh\u1EDFi kh\u1EE5 kh\u1EE5c kh\u1EE5t kh\u1EE7 kh\u1EE7ng kh\u1EE9 kh\u1EE9a kh\u1EE9ng kh\u1EE9u kh\u1EEB kh\u1EEBng kh\u1EED kh\u1EF1ng ki kia kim kinh ki\xEAm ki\xEAn ki\xEAng ki\xEAu ki\u1EBFm ki\u1EBFn ki\u1EBFp ki\u1EBFt ki\u1EBFu ki\u1EC1m ki\u1EC1n ki\u1EC1ng ki\u1EC1u ki\u1EC3m ki\u1EC3ng ki\u1EC3u ki\u1EC5ng ki\u1EC7m ki\u1EC7n ki\u1EC7t ki\u1EC7u k\xE8 k\xE8m k\xE8n k\xE8o k\xE9 k\xE9c k\xE9m k\xE9n k\xE9o k\xE9p k\xE9t k\xEA k\xEAnh k\xEAu k\xEC k\xECa k\xECm k\xECnh k\xED k\xEDch k\xEDn k\xEDnh k\xEDp k\xEDt k\xFD k\u0129 k\u1EB9 k\u1EB9n k\u1EB9o k\u1EB9p k\u1EB9t k\u1EBB k\u1EBBng k\u1EBBo k\u1EBD k\u1EBDm k\u1EBDo k\u1EBF k\u1EBFch k\u1EBFp k\u1EBFt k\u1EC1 k\u1EC1m k\u1EC1n k\u1EC1nh k\u1EC1u k\u1EC3 k\u1EC7 k\u1EC7ch k\u1EC7nh k\u1EC9 k\u1EC9nh k\u1ECB k\u1ECBch k\u1ECBp k\u1ECBt k\u1EF3 k\u1EF5 k\u1EF7 k\u1EF9 la lai lam lan lang lanh lao lau lay le lem len leng leo lhq li lia lim lin linh liu li\xEAm li\xEAn li\xEAng li\xEAu li\u1EBFc li\u1EBFm li\u1EBFn li\u1EBFng li\u1EBFp li\u1EC1m li\u1EC1n li\u1EC1u li\u1EC3ng li\u1EC5m li\u1EC5n li\u1EC5u li\u1EC7m li\u1EC7ng li\u1EC7p li\u1EC7t li\u1EC7u lo loa loan loang loanh loay loe loen loi lom lon long loong lo\xE0 lo\xE0i lo\xE0n lo\xE0ng lo\xE1ng lo\xE1t lo\xE3ng lo\xE8 lo\xE9 lo\xE9t lo\u0103ng lo\u1EA1c lo\u1EA1i lo\u1EA1n lo\u1EA1ng lo\u1EA1t lo\u1EA3ng lo\u1EAFt lo\u1EB1ng lo\u1EB9t lu lua lui lum lung luya luy\u1EBFn luy\u1EC7n lu\xE2n lu\xF4m lu\xF4n lu\xF4ng lu\xFDnh lu\u1EA5n lu\u1EA9n lu\u1EADn lu\u1EADn lu\u1EADt lu\u1ED1c lu\u1ED1ng lu\u1ED1t lu\u1ED3n lu\u1ED3ng lu\u1ED7ng lu\u1ED9c lu\u1ED9m lu\u1EF5 lu\u1EF9 ly l\xE0 l\xE0i l\xE0m l\xE0n l\xE0ng l\xE0nh l\xE0o l\xE0u l\xE1 l\xE1c l\xE1ch l\xE1i l\xE1n l\xE1ng l\xE1nh l\xE1o l\xE1p l\xE1t l\xE1u l\xE1y l\xE2m l\xE2n l\xE2ng l\xE2u l\xE2y l\xE3 l\xE3i l\xE3m l\xE3n l\xE3ng l\xE3nh l\xE3o l\xE8 l\xE8m l\xE8n l\xE8o l\xE9 l\xE9c l\xE9m l\xE9n l\xE9ng l\xE9o l\xE9p l\xE9t l\xEA l\xEAn l\xEAnh l\xEAu l\xEC l\xECa l\xECm l\xECnh l\xECu l\xED l\xEDnh l\xEDp l\xEDt l\xEDu l\xF2 l\xF2a l\xF2e l\xF2i l\xF2m l\xF2n l\xF2ng l\xF3 l\xF3c l\xF3e l\xF3i l\xF3m l\xF3ng l\xF3p l\xF3t l\xF4 l\xF4i l\xF4m l\xF4ng l\xF5 l\xF5i l\xF5m l\xF5ng l\xF9 l\xF9a l\xF9i l\xF9m l\xF9n l\xF9ng l\xFA l\xFAa l\xFAc l\xFAi l\xFAm l\xFAn l\xFAng l\xFAp l\xFAt l\xFD l\u0103m l\u0103n l\u0103ng l\u0129nh l\u0169 l\u0169i l\u0169m l\u0169n l\u0169ng l\u0169y l\u01A1 l\u01A1i l\u01A1n l\u01B0 l\u01B0ng l\u01B0u l\u01B0\u01A1m l\u01B0\u01A1n l\u01B0\u01A1ng l\u01B0\u1EDBi l\u01B0\u1EDBng l\u01B0\u1EDBt l\u01B0\u1EDDi l\u01B0\u1EDDm l\u01B0\u1EDDn l\u01B0\u1EDDng l\u01B0\u1EE1i l\u01B0\u1EE1ng l\u01B0\u1EE3c l\u01B0\u1EE3m l\u01B0\u1EE3n l\u01B0\u1EE3ng l\u01B0\u1EE3t l\u1EA1 l\u1EA1c l\u1EA1ch l\u1EA1i l\u1EA1m l\u1EA1n l\u1EA1ng l\u1EA1nh l\u1EA1o l\u1EA1p l\u1EA1t l\u1EA1u l\u1EA1y l\u1EA3 l\u1EA3i l\u1EA3m l\u1EA3ng l\u1EA3nh l\u1EA3o l\u1EA3u l\u1EA3y l\u1EA5c l\u1EA5m l\u1EA5n l\u1EA5p l\u1EA5t l\u1EA5y l\u1EA7m l\u1EA7n l\u1EA7u l\u1EA7y l\u1EA9m l\u1EA9n l\u1EA9u l\u1EA9y l\u1EABm l\u1EABn l\u1EABy l\u1EADm l\u1EADn l\u1EADp l\u1EADt l\u1EADu l\u1EAFc l\u1EAFk l\u1EAFm l\u1EAFng l\u1EAFp l\u1EAFt l\u1EB1m l\u1EB1n l\u1EB1ng l\u1EB3m l\u1EB3n l\u1EB3ng l\u1EB5ng l\u1EB7c l\u1EB7m l\u1EB7n l\u1EB7ng l\u1EB7p l\u1EB7t l\u1EB9 l\u1EB9m l\u1EB9n l\u1EB9o l\u1EB9p l\u1EB9t l\u1EBB l\u1EBBm l\u1EBBn l\u1EBBng l\u1EBBo l\u1EBD l\u1EBDn l\u1EBDo l\u1EBFch l\u1EBFt l\u1EBFu l\u1EC1 l\u1EC1nh l\u1EC1u l\u1EC3 l\u1EC3u l\u1EC5 l\u1EC5u l\u1EC7 l\u1EC7ch l\u1EC7nh l\u1EC9m l\u1EC9nh l\u1ECB l\u1ECBa l\u1ECBch l\u1ECBm l\u1ECBnh l\u1ECBu l\u1ECD l\u1ECDc l\u1ECDi l\u1ECDm l\u1ECDn l\u1ECDng l\u1ECDt l\u1ECFi l\u1ECFm l\u1ECFn l\u1ECFng l\u1ED1 l\u1ED1c l\u1ED1i l\u1ED1m l\u1ED1n l\u1ED1p l\u1ED1t l\u1ED3 l\u1ED3i l\u1ED3m l\u1ED3n l\u1ED3ng l\u1ED5 l\u1ED5m l\u1ED5n l\u1ED5ng l\u1ED7 l\u1ED7i l\u1ED9 l\u1ED9c l\u1ED9i l\u1ED9m l\u1ED9n l\u1ED9ng l\u1ED9p l\u1ED9t l\u1EDB l\u1EDBi l\u1EDBn l\u1EDBp l\u1EDBt l\u1EDD l\u1EDDi l\u1EDDm l\u1EDDn l\u1EDF l\u1EDFi l\u1EDFm l\u1EDFn l\u1EE1 l\u1EE1m l\u1EE3 l\u1EE3i l\u1EE3m l\u1EE3n l\u1EE3p l\u1EE3t l\u1EE5 l\u1EE5a l\u1EE5c l\u1EE5i l\u1EE5n l\u1EE5ng l\u1EE5p l\u1EE5t l\u1EE5y l\u1EE7 l\u1EE7i l\u1EE7m l\u1EE7n l\u1EE7ng l\u1EE9a l\u1EE9c l\u1EE9t l\u1EEB l\u1EEBa l\u1EEBng l\u1EED l\u1EEDa l\u1EEDng l\u1EEF l\u1EEFa l\u1EEFng l\u1EF1 l\u1EF1a l\u1EF1c l\u1EF1ng l\u1EF1u l\u1EF5 ma mai man mang manh mao mau may me mem men meo mi mia mim min minh mi\xEAn mi\xEAu mi\u1EBFn mi\u1EBFng mi\u1EBFt mi\u1EBFu mi\u1EC1n mi\u1EC1u mi\u1EC5n mi\u1EC5u mi\u1EC7n mi\u1EC7ng mi\u1EC7t mo moay moi mom mon mong mo\xF3c mu mua mui mum mun mung mu\xF4i mu\xF4n mu\xF4ng mu\u1ED1i mu\u1ED1n mu\u1ED1ng mu\u1ED1t mu\u1ED3i mu\u1ED7i mu\u1ED7m mu\u1ED7ng mu\u1ED9i mu\u1ED9n m\xE0 m\xE0i m\xE0n m\xE0ng m\xE0nh m\xE0o m\xE0u m\xE0y m\xE1 m\xE1c m\xE1ch m\xE1i m\xE1n m\xE1ng m\xE1nh m\xE1o m\xE1t m\xE1u m\xE1y m\xE2m m\xE2n m\xE2ng m\xE2u m\xE2y m\xE3 m\xE3i m\xE3n m\xE3ng m\xE3nh m\xE3o m\xE8 m\xE8m m\xE8n m\xE8ng m\xE8o m\xE9 m\xE9m m\xE9n m\xE9o m\xE9p m\xE9t m\xEA m\xEAn m\xEAnh m\xEC m\xECn m\xECnh m\xED m\xEDa m\xEDch m\xEDm m\xEDp m\xEDt m\xEDu m\xF2 m\xF2i m\xF2m m\xF2n m\xF2ng m\xF3 m\xF3c m\xF3i m\xF3m m\xF3n m\xF3ng m\xF3p m\xF3t m\xF4 m\xF4i m\xF4m m\xF4n m\xF4ng m\xF5 m\xF5m m\xF9 m\xF9a m\xF9i m\xF9n m\xF9ng m\xFA m\xFAa m\xFAc m\xFAi m\xFAm m\xFAn m\xFAp m\xFAt m\u0103m m\u0103n m\u0103ng m\u0129 m\u0129m m\u0169 m\u0169i m\u0169m m\u01A1 m\u01A1i m\u01A1n m\u01B0a m\u01B0u m\u01B0\u01A1i m\u01B0\u01A1ng m\u01B0\u1EDBn m\u01B0\u1EDBp m\u01B0\u1EDBt m\u01B0\u1EDDi m\u01B0\u1EDDng m\u01B0\u1EE3n m\u01B0\u1EE3t m\u1EA1 m\u1EA1c m\u1EA1ch m\u1EA1i m\u1EA1n m\u1EA1ng m\u1EA1nh m\u1EA1o m\u1EA1p m\u1EA1t m\u1EA1y m\u1EA3 m\u1EA3i m\u1EA3ng m\u1EA3nh m\u1EA3y m\u1EA5n m\u1EA5p m\u1EA5t m\u1EA5u m\u1EA5y m\u1EA7m m\u1EA7n m\u1EA7ng m\u1EA7u m\u1EA9m m\u1EA9n m\u1EA9y m\u1EABm m\u1EABn m\u1EABu m\u1EADn m\u1EADp m\u1EADt m\u1EADu m\u1EAFc m\u1EAFm m\u1EAFn m\u1EAFng m\u1EAFt m\u1EB1n m\u1EB3n m\u1EB7c m\u1EB7n m\u1EB7t m\u1EB7t m\u1EB9 m\u1EB9o m\u1EB9p m\u1EB9t m\u1EBB m\u1EBBo m\u1EBD m\u1EBF m\u1EBFch m\u1EBFn m\u1EBFu m\u1EC1 m\u1EC1m m\u1EC1n m\u1EC5 m\u1EC7 m\u1EC7nh m\u1EC7t m\u1EC9 m\u1EC9a m\u1EC9m m\u1ECB m\u1ECBch m\u1ECBn m\u1ECBnh m\u1ECBt m\u1ECDc m\u1ECDi m\u1ECDn m\u1ECDng m\u1ECDt m\u1ECF m\u1ECFi m\u1ECFm m\u1ECFng m\u1ED1 m\u1ED1c m\u1ED1i m\u1ED1ng m\u1ED1t m\u1ED3 m\u1ED3i m\u1ED3m m\u1ED3n m\u1ED3ng m\u1ED5 m\u1ED5ng m\u1ED7 m\u1ED7i m\u1ED9 m\u1ED9c m\u1ED9ng m\u1ED9t m\u1EDB m\u1EDBi m\u1EDBm m\u1EDBp m\u1EDD m\u1EDDi m\u1EDDm m\u1EDF m\u1EDFn m\u1EE1 m\u1EE3 m\u1EE5 m\u1EE5c m\u1EE5i m\u1EE5n m\u1EE5p m\u1EE7 m\u1EE7i m\u1EE7m m\u1EE7n m\u1EE7ng m\u1EE9a m\u1EE9c m\u1EE9t m\u1EE9u m\u1EEBng m\u1EEDa m\u1EF1 m\u1EF1a m\u1EF1c m\u1EF9 na nai nam nan nang nanh nao nau nay ne nem nen neo nga ngai ngam ngan ngang ngao ngau ngay nghe nghi nghinh nghiu nghi\xEAm nghi\xEAn nghi\xEAng nghi\xEAu nghi\u1EBFn nghi\u1EC1n nghi\u1EC5m nghi\u1EC7m nghi\u1EC7n nghi\u1EC7p nghi\u1EC7t ngh\xE8 ngh\xE8n ngh\xE8o ngh\xE9 ngh\xE9n ngh\xE9t ngh\xEA ngh\xEAnh ngh\xEAu ngh\xEC ngh\xECn ngh\xED ngh\xEDt ngh\u0129 ngh\u0129a ngh\u1EB9n ngh\u1EB9o ngh\u1EB9t ngh\u1EBB ngh\u1EBBo ngh\u1EBDn ngh\u1EBDo ngh\u1EBFch ngh\u1EC1 ngh\u1EC1u ngh\u1EC3n ngh\u1EC3nh ngh\u1EC5 ngh\u1EC5nh ngh\u1EC5u ngh\u1EC7 ngh\u1EC7ch ngh\u1EC7n ngh\u1EC9 ngh\u1EC9m ngh\u1EC9n ngh\u1EC9nh ngh\u1EC9u ngh\u1ECB ngh\u1ECBch ngh\u1ECBt ngh\u1ECBu ngoa ngoan ngoang ngoao ngoay ngoe ngoi ngon ngong ngo\xE0i ngo\xE0m ngo\xE1c ngo\xE1ch ngo\xE1i ngo\xE1o ngo\xE1y ngo\xE3 ngo\xE3n ngo\xE8o ngo\xE9 ngo\xE9o ngo\xE9t ngo\u1EA1i ngo\u1EA1m ngo\u1EA1n ngo\u1EA3i ngo\u1EA3ng ngo\u1EA3nh ngo\u1EA3y ngo\u1EAFc ngo\u1EAFt ngo\u1EB1n ngo\u1EB1ng ngo\u1EB5ng ngo\u1EB7c ngo\u1EB7t ngo\u1EBBn ngu nguy nguy\xEAn nguy\u1EC1n nguy\u1EC5n nguy\u1EC7n nguy\u1EC7t ngu\xFDt ngu\u01A1n ngu\u1EA9y ngu\u1ED3i ngu\u1ED3n ngu\u1ED9i ngu\u1EF5 ngu\u1EF7u ng\xE0 ng\xE0i ng\xE0m ng\xE0n ng\xE0ng ng\xE0nh ng\xE0o ng\xE0u ng\xE0y ng\xE1c ng\xE1ch ng\xE1i ng\xE1m ng\xE1n ng\xE1ng ng\xE1o ng\xE1p ng\xE1t ng\xE1u ng\xE1y ng\xE2m ng\xE2n ng\xE2u ng\xE2y ng\xE3 ng\xE3i ng\xE3ng ng\xE3o ng\xF2 ng\xF2i ng\xF2m ng\xF2n ng\xF2ng ng\xF3 ng\xF3c ng\xF3e ng\xF3i ng\xF3m ng\xF3n ng\xF3ng ng\xF3p ng\xF3t ng\xF4 ng\xF4i ng\xF4n ng\xF4ng ng\xF5 ng\xF5a ng\xF5i ng\xF5ng ng\xF9i ng\xF9ng ng\xFA ng\xFAc ng\xFAng ng\xFAt ng\u0103m ng\u0103n ng\u0169 ng\u01A1 ng\u01A1i ng\u01A1m ng\u01A1n ng\u01B0 ng\u01B0a ng\u01B0ng ng\u01B0u ng\u01B0\u01A1i ng\u01B0\u1EDBc ng\u01B0\u1EDDi ng\u01B0\u1EDDng ng\u01B0\u1EDFng ng\u01B0\u1EE1ng ng\u01B0\u1EE3c ng\u01B0\u1EE3ng ng\u1EA1c ng\u1EA1ch ng\u1EA1i ng\u1EA1n ng\u1EA1nh ng\u1EA1o ng\u1EA1t ng\u1EA3 ng\u1EA3i ng\u1EA3nh ng\u1EA5c ng\u1EA5m ng\u1EA5n ng\u1EA5p ng\u1EA5t ng\u1EA5u ng\u1EA5y ng\u1EA7m ng\u1EA7n ng\u1EA7u ng\u1EA7y ng\u1EA9m ng\u1EA9n ng\u1EA9ng ng\u1EABm ng\u1EABn ng\u1EABu ng\u1EADm ng\u1EADn ng\u1EADp ng\u1EADt ng\u1EADu ng\u1EADy ng\u1EAFc ng\u1EAFm ng\u1EAFn ng\u1EAFt ng\u1EB1n ng\u1EB3ng ng\u1EB5ng ng\u1EB7t ng\u1ECD ng\u1ECDc ng\u1ECDn ng\u1ECDng ng\u1ECDt ng\u1ECF ng\u1ECFm ng\u1ECFn ng\u1ECFng ng\u1ED1 ng\u1ED1c ng\u1ED1n ng\u1ED1t ng\u1ED3i ng\u1ED3m ng\u1ED3n ng\u1ED3ng ng\u1ED5 ng\u1ED5m ng\u1ED5n ng\u1ED7 ng\u1ED7ng ng\u1ED9 ng\u1ED9c ng\u1ED9n ng\u1ED9t ng\u1EDB ng\u1EDBn ng\u1EDBp ng\u1EDBt ng\u1EDD ng\u1EDDi ng\u1EDDm ng\u1EE1 ng\u1EE3 ng\u1EE3i ng\u1EE3m ng\u1EE3p ng\u1EE5 ng\u1EE5a ng\u1EE5c ng\u1EE5m ng\u1EE5p ng\u1EE5y ng\u1EE7 ng\u1EE7i ng\u1EE7n ng\u1EE9 ng\u1EE9a ng\u1EE9t ng\u1EEB ng\u1EEBa ng\u1EEBng ng\u1EEDa ng\u1EEDi ng\u1EEDng ng\u1EEF ng\u1EEF ng\u1EF1 ng\u1EF1a ng\u1EF1c nha nhai nham nhan nhang nhanh nhao nhau nhay nhe nhem nhen nheo nhi nhinh nhiu nhi\xEAn nhi\xEAu nhi\u1EBFc nhi\u1EBFp nhi\u1EC1u nhi\u1EC5m nhi\u1EC5n nhi\u1EC5u nhi\u1EC7m nhi\u1EC7t nho nhoai nhoang nhoay nhoe nhoen nhoi nhom nhong nho\xE0 nho\xE0i nho\xE0m nho\xE1 nho\xE1ng nho\xE1y nho\xE8 nho\xE8n nho\xE9 nho\xE9t nho\u1EA1ng nho\u1EB9t nho\u1EBBn nhu nhui nhung nhuy\u1EC5n nhu\xF4m nhu\u1EA7n nhu\u1EADn nhu\u1EBF nhu\u1EC7 nhu\u1ED1c nhu\u1ED1m nhu\u1ED9m nhu\u1EF5 nh\xE0 nh\xE0i nh\xE0m nh\xE0n nh\xE0ng nh\xE0nh nh\xE0o nh\xE0u nh\xE0y nh\xE1 nh\xE1c nh\xE1ch nh\xE1i nh\xE1m nh\xE1ng nh\xE1nh nh\xE1o nh\xE1p nh\xE1t nh\xE1y nh\xE2m nh\xE2n nh\xE2ng nh\xE2u nh\xE2y nh\xE3 nh\xE3i nh\xE3n nh\xE3ng nh\xE3o nh\xE8 nh\xE8m nh\xE8o nh\xE9 nh\xE9n nh\xE9o nh\xE9p nh\xE9t nh\xEAnh nh\xEC nh\xECn nh\xED nh\xEDa nh\xEDch nh\xEDm nh\xEDn nh\xEDp nh\xEDt nh\xEDu nh\xF2 nh\xF2a nh\xF2e nh\xF2m nh\xF3 nh\xF3a nh\xF3c nh\xF3e nh\xF3i nh\xF3m nh\xF3n nh\xF3ng nh\xF3p nh\xF3t nh\xF4 nh\xF4i nh\xF4m nh\xF4n nh\xF4ng nh\xF5 nh\xF5m nh\xF5n nh\xF9 nh\xF9i nh\xF9n nh\xF9ng nh\xFA nh\xFAa nh\xFAc nh\xFAm nh\xFAn nh\xFAng nh\xFAt nh\u0103m nh\u0103n nh\u0103ng nh\u0129 nh\u0169 nh\u0169n nh\u0169ng nh\u01A1 nh\u01A1i nh\u01A1m nh\u01A1n nh\u01B0 nh\u01B0ng nh\u01B0\u01A1ng nh\u01B0\u1EDBng nh\u01B0\u1EDDng nh\u01B0\u1EE1ng nh\u01B0\u1EE3c nh\u01B0\u1EE3ng nh\u1EA1c nh\u1EA1n nh\u1EA1nh nh\u1EA1o nh\u1EA1p nh\u1EA1t nh\u1EA1y nh\u1EA3 nh\u1EA3i nh\u1EA3m nh\u1EA3n nh\u1EA3nh nh\u1EA3u nh\u1EA3y nh\u1EA5c nh\u1EA5m nh\u1EA5n nh\u1EA5p nh\u1EA5t nh\u1EA7m nh\u1EA7n nh\u1EA7y nh\u1EA9m nh\u1EABn nh\u1EABy nh\u1EADm nh\u1EADm nh\u1EADn nh\u1EADp nh\u1EADt nh\u1EADu nh\u1EADy nh\u1EAFc nh\u1EAFm nh\u1EAFn nh\u1EAFng nh\u1EAFp nh\u1EAFt nh\u1EB1m nh\u1EB1n nh\u1EB1ng nh\u1EB3n nh\u1EB3ng nh\u1EB5n nh\u1EB5ng nh\u1EB7m nh\u1EB7n nh\u1EB7ng nh\u1EB7t nh\u1EB9 nh\u1EB9m nh\u1EB9n nh\u1EB9o nh\u1EB9p nh\u1EB9t nh\u1EBB nh\u1EBBm nh\u1EBD nh\u1EBDo nh\u1EC7n nh\u1EC7u nh\u1EC9 nh\u1EC9nh nh\u1ECB nh\u1ECBn nh\u1ECBp nh\u1ECBt nh\u1ECBu nh\u1ECD nh\u1ECDc nh\u1ECDn nh\u1ECDt nh\u1ECF nh\u1ECFm nh\u1ECFng nh\u1ED1 nh\u1ED1c nh\u1ED1i nh\u1ED1n nh\u1ED1t nh\u1ED3i nh\u1ED3m nh\u1ED3n nh\u1ED3ng nh\u1ED5 nh\u1ED5m nh\u1ED5n nh\u1ED9n nh\u1ED9ng nh\u1ED9t nh\u1EDB nh\u1EDBm nh\u1EDBn nh\u1EDBp nh\u1EDBt nh\u1EDD nh\u1EDDi nh\u1EDDn nh\u1EDF nh\u1EDFn nh\u1EE1 nh\u1EE3 nh\u1EE3t nh\u1EE5 nh\u1EE5a nh\u1EE5c nh\u1EE5i nh\u1EE5ng nh\u1EE5t nh\u1EE5y nh\u1EE7 nh\u1EE7i nh\u1EE7n nh\u1EE9 nh\u1EE9c nh\u1EE9t nh\u1EEB nh\u1EED nh\u1EEDng nh\u1EEFng nh\u1EF1 nh\u1EF1a nh\u1EF1t ni nia nin ninh niu ni\xEAm ni\xEAn ni\xEAu ni\u1EBFt ni\u1EC1m ni\u1EC1n ni\u1EC1ng ni\u1EC5ng ni\u1EC7m ni\u1EC7t ni\u1EC7u no noa noi nom non nong no\xE3n nua nung nu\xF4i nu\xF4ng nu\u1ED1c nu\u1ED1i nu\u1ED1m nu\u1ED1t nu\u1ED9c nu\u1ED9t n\xE0 n\xE0i n\xE0n n\xE0ng n\xE0nh n\xE0o n\xE0y n\xE1 n\xE1c n\xE1ch n\xE1i n\xE1m n\xE1n n\xE1ng n\xE1nh n\xE1o n\xE1t n\xE1u n\xE1y n\xE2n n\xE2ng n\xE2u n\xE2y n\xE3 n\xE3o n\xE3y n\xE8 n\xE8o n\xE9 n\xE9m n\xE9n n\xE9o n\xE9p n\xE9t n\xEA n\xEAm n\xEAn n\xEAu n\xEC n\xECnh n\xEDch n\xEDn n\xEDnh n\xEDp n\xEDt n\xEDu n\xF2 n\xF2i n\xF2ng n\xF3 n\xF3c n\xF3i n\xF3n n\xF3ng n\xF3t n\xF4 n\xF4i n\xF4m n\xF4n n\xF4ng n\xF5 n\xF5n n\xF9i n\xF9n n\xF9ng n\xFAc n\xFAi n\xFAm n\xFAng n\xFAp n\xFAt n\u0103m n\u0103n n\u0103ng n\u0129a n\u0169ng n\u01A1 n\u01A1i n\u01A1m n\u01B0 n\u01B0a n\u01B0ng n\u01B0\u01A1ng n\u01B0\u1EDBc n\u01B0\u1EDBng n\u01B0\u1EDDm n\u01B0\u1EDDng n\u01B0\u1EE3c n\u01B0\u1EE3p n\u1EA1 n\u1EA1c n\u1EA1i n\u1EA1m n\u1EA1n n\u1EA1ng n\u1EA1nh n\u1EA1o n\u1EA1p n\u1EA1t n\u1EA1y n\u1EA3 n\u1EA3i n\u1EA3n n\u1EA3y n\u1EA5c n\u1EA5m n\u1EA5ng n\u1EA5p n\u1EA5u n\u1EA5y n\u1EA7m n\u1EA7n n\u1EA7y n\u1EA9y n\u1EABng n\u1EABu n\u1EADm n\u1EADng n\u1EADp n\u1EADu n\u1EADy n\u1EAFc n\u1EAFm n\u1EAFn n\u1EAFng n\u1EAFp n\u1EB1m n\u1EB1n n\u1EB1ng n\u1EB5ng n\u1EB7c n\u1EB7n n\u1EB7ng n\u1EB9p n\u1EB9t n\u1EBB n\u1EBBo n\u1EBFm n\u1EBFn n\u1EBFp n\u1EBFt n\u1EBFu n\u1EC1 n\u1EC1n n\u1EC3 n\u1EC7 n\u1EC7m n\u1EC7n n\u1EC9 n\u1ECBch n\u1ECBnh n\u1ECBt n\u1ECBu n\u1ECD n\u1ECDc n\u1ECDn n\u1ECDng n\u1ECDt n\u1ECF n\u1ECFi n\u1ED1 n\u1ED1c n\u1ED1i n\u1ED1ng n\u1ED1t n\u1ED3 n\u1ED3i n\u1ED3m n\u1ED3ng n\u1ED5 n\u1ED5i n\u1ED7 n\u1ED7i n\u1ED7ng n\u1ED9 n\u1ED9i n\u1ED9m n\u1ED9n n\u1ED9p n\u1ED9t n\u1EDB n\u1EDBi n\u1EDBp n\u1EDBt n\u1EDD n\u1EDDm n\u1EDF n\u1EE1 n\u1EE1m n\u1EE3 n\u1EE3p n\u1EE5 n\u1EE5c n\u1EE7a n\u1EE9a n\u1EE9c n\u1EE9t n\u1EEBng n\u1EEDa n\u1EEF n\u1EEFa n\u1EF1 n\u1EF1c n\u1EF1ng o oa oai oan oang oanh oe oi om ong o\xE0 o\xE0m o\xE0ng o\xE0nh o\xE1c o\xE1ch o\xE1i o\xE1n o\xE1t o\xE9 o\u0103m o\u0103ng o\u1EA1ch o\u1EA1i o\u1EA1p o\u1EA3i o\u1EA3n o\u1EAFt o\u1EB1n o\u1EB3n o\u1EB3ng o\u1EB7t o\u1EB9 o\u1EBB pa pal\u0103ng pan pao pdf pe pha phai phan phang phanh phao phau phay phe phen pheo phi phim phin phinh phiu phi\xEAn phi\xEAu phi\u1EBFm phi\u1EBFn phi\u1EBFt phi\u1EBFu phi\u1EC1n phi\u1EC7n phi\u1EC7t pho phoi phom phong phu phui phun phung phuy ph\xE0 ph\xE0m ph\xE0n ph\xE0ng ph\xE0nh ph\xE0o ph\xE1 ph\xE1c ph\xE1ch ph\xE1i ph\xE1n ph\xE1o ph\xE1p ph\xE1t ph\xE2n ph\xE2y ph\xE8 ph\xE8n ph\xE8ng ph\xE8o ph\xE9ng ph\xE9p ph\xE9t ph\xEA ph\xEAn ph\xEC ph\xECa ph\xECnh ph\xED ph\xEDa ph\xEDch ph\xEDm ph\xEDnh ph\xF2 ph\xF2i ph\xF2ng ph\xF3 ph\xF3c ph\xF3ng ph\xF3t ph\xF4 ph\xF4i ph\xF4m ph\xF4ng ph\xF9 ph\xF9n ph\xF9ng ph\xFA ph\xFAc ph\xFAn ph\xFAng ph\xFAt ph\u0103m ph\u0103n ph\u0103ng ph\u0129nh ph\u0169 ph\u01A1 ph\u01A1i ph\u01A1n ph\u01B0ng ph\u01B0\u01A1ng ph\u01B0\u1EDBc ph\u01B0\u1EDBn ph\u01B0\u1EDBng ph\u01B0\u1EDDng ph\u01B0\u1EE1n ph\u01B0\u1EE3ng ph\u01B0\u1EE3u ph\u1EA1ch ph\u1EA1m ph\u1EA1n ph\u1EA1ng ph\u1EA1t ph\u1EA3 ph\u1EA3i ph\u1EA3n ph\u1EA3ng ph\u1EA3y ph\u1EA5n ph\u1EA5p ph\u1EA5t ph\u1EA7m ph\u1EA7n ph\u1EA9m ph\u1EA9n ph\u1EA9y ph\u1EABn ph\u1EABu ph\u1EADn ph\u1EADp ph\u1EADt ph\u1EAFc ph\u1EAFn ph\u1EAFp ph\u1EAFt ph\u1EB3ng ph\u1EB9t ph\u1EBF ph\u1EBFch ph\u1EBFt ph\u1EC1 ph\u1EC1nh ph\u1EC1u ph\u1EC5n ph\u1EC5u ph\u1EC7 ph\u1EC7nh ph\u1EC7t ph\u1EC9 ph\u1EC9nh ph\u1ECB ph\u1ECBa ph\u1ECBch ph\u1ECBt ph\u1ECBu ph\u1ECDng ph\u1ECDt ph\u1ECFng ph\u1ED1 ph\u1ED1c ph\u1ED1i ph\u1ED1p ph\u1ED3 ph\u1ED3m ph\u1ED3n ph\u1ED3ng ph\u1ED5 ph\u1ED5i ph\u1ED5ng ph\u1ED7ng ph\u1ED9ng ph\u1EDBi ph\u1EDBt ph\u1EDD ph\u1EDF ph\u1EE1n ph\u1EE5 ph\u1EE5c ph\u1EE5ng ph\u1EE5t ph\u1EE7 ph\u1EE7i ph\u1EE9a ph\u1EE9c ph\u1EE9t ph\u1EEBng ph\u1EF1a ph\u1EF1t pi pin ping png pom pu p\xE1c p\xE1p p\xEA p\xEDa p\xF4 p\xF4ng p\u01A1 qua quai quan quang quanh quao quau quay que quen queo quo\xE0ng quo\u1EA1ng quo\u1EAFt quy quy\xEAn quy\u1EBFn quy\u1EBFt quy\u1EC1n quy\u1EC3n quy\u1EC7n quy\u1EC7t qu\xE0 qu\xE0i qu\xE0n qu\xE0ng qu\xE0nh qu\xE0o qu\xE0u qu\xE0y qu\xE1 qu\xE1c qu\xE1ch qu\xE1i qu\xE1n qu\xE1ng qu\xE1nh qu\xE1o qu\xE1t qu\xE1u qu\xE2n qu\xE2y qu\xE3ng qu\xE8 qu\xE8n qu\xE8o qu\xE9 qu\xE9n qu\xE9o qu\xE9t qu\xEA qu\xEAn qu\xEDt qu\xFD qu\xFDnh qu\xFDt qu\u0103m qu\u0103n qu\u0103ng qu\u01A1 qu\u1EA1 qu\u1EA1c qu\u1EA1ch qu\u1EA1i qu\u1EA1ng qu\u1EA1nh qu\u1EA1t qu\u1EA1u qu\u1EA1y qu\u1EA3 qu\u1EA3i qu\u1EA3n qu\u1EA3ng qu\u1EA3y qu\u1EA5c qu\u1EA5n qu\u1EA5t qu\u1EA5y qu\u1EA7n qu\u1EA7ng qu\u1EA7y qu\u1EA9n qu\u1EA9ng qu\u1EA9y qu\u1EABn qu\u1EABy qu\u1EADn qu\u1EADt qu\u1EADy qu\u1EAFc qu\u1EAFm qu\u1EAFn qu\u1EAFp qu\u1EAFt qu\u1EB1n qu\u1EB3m qu\u1EB3ng qu\u1EB7c qu\u1EB7m qu\u1EB7n qu\u1EB7ng qu\u1EB7p qu\u1EB7t qu\u1EB9o qu\u1EB9t qu\u1EBB qu\u1EBD qu\u1EBF qu\u1EBFt qu\u1EBFu qu\u1EC1nh qu\u1EC1u qu\u1EC7 qu\u1EC7ch qu\u1EC7n qu\u1EC7nh qu\u1EC7t qu\u1ECBt qu\u1ED1c qu\u1EDB qu\u1EDD qu\u1EDF qu\u1EDFn qu\u1EF3 qu\u1EF3nh qu\u1EF3nh qu\u1EF5 qu\u1EF5t qu\u1EF7 qu\u1EF7nh qu\u1EF9 ra rai ram ran rang ranh rao rau ray re ren reng reo ri ria rim rin rinh riu ri\xEAng ri\xEAu ri\u1EBFt ri\u1EBFu ri\u1EC1m ri\u1EC1ng ri\u1EC7t ro roa roi rom rong ru rua rum run rung ru\u1ED1c ru\u1ED1i ru\u1ED3i ru\u1ED3ng ru\u1ED5i ru\u1ED7ng ru\u1ED9m ru\u1ED9ng ru\u1ED9t r\xE0 r\xE0i r\xE0n r\xE0ng r\xE0nh r\xE0o r\xE0y r\xE1 r\xE1c r\xE1ch r\xE1i r\xE1m r\xE1n r\xE1ng r\xE1o r\xE1p r\xE1t r\xE1y r\xE2m r\xE2n r\xE2u r\xE2y r\xE3 r\xE3i r\xE3nh r\xE3o r\xE3y r\xE8 r\xE8m r\xE8n r\xE8o r\xE9 r\xE9n r\xE9o r\xE9t r\xEA r\xEAn r\xEAu r\xEC r\xECa r\xECnh r\xECu r\xED r\xEDch r\xEDt r\xEDu r\xF2 r\xF2i r\xF2m r\xF2ng r\xF3 r\xF3c r\xF3i r\xF3m r\xF3n r\xF3ng r\xF3t r\xF4 r\xF4m r\xF4ng r\xF5 r\xF5i r\xF9 r\xF9a r\xF9m r\xF9n r\xF9ng r\xFA r\xFAc r\xFAi r\xFAm r\xFAn r\xFAng r\xFAp r\xFAt r\u0103m r\u0103n r\u0103ng r\u0129 r\u0169 r\u0169a r\u01A1 r\u01A1i r\u01A1m r\u01A1n r\u01B0 r\u01B0a r\u01B0ng r\u01B0\u01A1i r\u01B0\u01A1m r\u01B0\u01A1ng r\u01B0\u1EDBc r\u01B0\u1EDBi r\u01B0\u1EDBm r\u01B0\u1EDBn r\u01B0\u1EDDi r\u01B0\u1EDDm r\u01B0\u1EDDn r\u01B0\u1EDDng r\u01B0\u1EDFi r\u01B0\u1EE1i r\u01B0\u1EE3i r\u01B0\u1EE3n r\u01B0\u1EE3t r\u01B0\u1EE3u r\u1EA1 r\u1EA1c r\u1EA1ch r\u1EA1n r\u1EA1ng r\u1EA1o r\u1EA1p r\u1EA1t r\u1EA1y r\u1EA3 r\u1EA3i r\u1EA3nh r\u1EA3o r\u1EA3y r\u1EA5m r\u1EA5n r\u1EA5p r\u1EA5t r\u1EA7m r\u1EA7n r\u1EA7u r\u1EA7y r\u1EA9m r\u1EA9y r\u1EABm r\u1EABy r\u1EADm r\u1EADn r\u1EADp r\u1EADt r\u1EAFc r\u1EAFm r\u1EAFn r\u1EAFp r\u1EAFt r\u1EB1m r\u1EB1n r\u1EB1ng r\u1EB7ng r\u1EB7t r\u1EB9o r\u1EB9t r\u1EBB r\u1EBBng r\u1EBBo r\u1EBD r\u1EBF r\u1EBFch r\u1EBFn r\u1EBFp r\u1EBFt r\u1EC1 r\u1EC1n r\u1EC1u r\u1EC3 r\u1EC3nh r\u1EC5 r\u1EC7 r\u1EC7ch r\u1EC7n r\u1EC7p r\u1EC7t r\u1EC7u r\u1EC9 r\u1EC9a r\u1EC9nh r\u1ECBa r\u1ECBch r\u1ECBn r\u1ECBt r\u1ECD r\u1ECDc r\u1ECDi r\u1ECDm r\u1ECDt r\u1ECF r\u1ECFm r\u1ECFn r\u1ED1c r\u1ED1i r\u1ED1n r\u1ED1ng r\u1ED1p r\u1ED1t r\u1ED3 r\u1ED3i r\u1ED3m r\u1ED3ng r\u1ED5 r\u1ED5i r\u1ED5ng r\u1ED7 r\u1ED7i r\u1ED7ng r\u1ED9 r\u1ED9c r\u1ED9m r\u1ED9n r\u1ED9ng r\u1ED9p r\u1EDB r\u1EDBm r\u1EDBt r\u1EDD r\u1EDDi r\u1EDDm r\u1EDDn r\u1EDF r\u1EDFm r\u1EDFn r\u1EE1 r\u1EE1n r\u1EE3 r\u1EE3i r\u1EE3m r\u1EE3n r\u1EE3p r\u1EE3t r\u1EE5c r\u1EE5i r\u1EE5ng r\u1EE5t r\u1EE7 r\u1EE7a r\u1EE7i r\u1EE7n r\u1EE7ng r\u1EE9a r\u1EE9c r\u1EE9t r\u1EEBng r\u1EEDa r\u1EEDng r\u1EEFa r\u1EF1a r\u1EF1c sa sai sam san sang sanh sao sau say se sen seo si sim sin sinh siu si\xEAng si\xEAu si\u1EBFt si\u1EC3m si\u1EC3ng si\u1EC5n so soa soi son song soong so\xE0 so\xE0i so\xE1i so\xE1n so\xE1t so\xF3c so\u1EA1n so\u1EA1ng so\u1EA1t su sui sum sun sung suy suy\u1EC3n suy\u1EC5n su\xEA su\xF4n su\xF4ng su\xFD su\xFDt su\u1EA5t su\u1ED1i su\u1ED1t su\u1ED3ng su\u1EF5t s\xE0 s\xE0i s\xE0m s\xE0n s\xE0ng s\xE0nh s\xE0o s\xE1 s\xE1c s\xE1ch s\xE1i s\xE1m s\xE1n s\xE1ng s\xE1nh s\xE1o s\xE1p s\xE1t s\xE1u s\xE2m s\xE2n s\xE2u s\xE2y s\xE3 s\xE3i s\xE8 s\xE8o s\xE9c s\xE9m s\xE9t s\xEA s\xEAn s\xEAnh s\xEAu s\xEC s\xECnh s\xEDnh s\xEDt s\xF2 s\xF2a s\xF2i s\xF2m s\xF2ng s\xF3c s\xF3i s\xF3m s\xF3n s\xF3ng s\xF3t s\xF4 s\xF4i s\xF4ng s\xF5i s\xF5ng s\xF9 s\xF9i s\xF9m s\xF9ng s\xFA s\xFAc s\xFAn s\xFAng s\xFAp s\xFAt s\xFAy s\u0103m s\u0103n s\u0103ng s\u0129 s\u0169ng s\u01A1 s\u01A1m s\u01A1n s\u01B0 s\u01B0a s\u01B0ng s\u01B0u s\u01B0\u01A1ng s\u01B0\u1EDBng s\u01B0\u1EDBt s\u01B0\u1EDDn s\u01B0\u1EDDng s\u01B0\u1EDFi s\u01B0\u1EE3ng s\u01B0\u1EE3t s\u1EA1 s\u1EA1ch s\u1EA1m s\u1EA1n s\u1EA1o s\u1EA1p s\u1EA1t s\u1EA3 s\u1EA3i s\u1EA3n s\u1EA3ng s\u1EA3nh s\u1EA3o s\u1EA3y s\u1EA5m s\u1EA5n s\u1EA5p s\u1EA5t s\u1EA5u s\u1EA5y s\u1EA7m s\u1EA7n s\u1EA7u s\u1EA7y s\u1EA9m s\u1EA9n s\u1EA9y s\u1EABm s\u1EADm s\u1EADp s\u1EADt s\u1EADu s\u1EADy s\u1EAFc s\u1EAFm s\u1EAFn s\u1EAFng s\u1EAFp s\u1EAFt s\u1EB1ng s\u1EB5n s\u1EB7c s\u1EB7m s\u1EB7t s\u1EB9 s\u1EB9m s\u1EB9o s\u1EBB s\u1EBBn s\u1EBD s\u1EBFn s\u1EBFp s\u1EBFu s\u1EC1 s\u1EC1n s\u1EC3 s\u1EC3nh s\u1EC5 s\u1EC7 s\u1EC7t s\u1EC9 s\u1EC9a s\u1EC9nh s\u1ECB s\u1ECBa s\u1ECBch s\u1ECBt s\u1ECD s\u1ECDc s\u1ECDm s\u1ECDt s\u1ECF s\u1ECFi s\u1ED1 s\u1ED1c s\u1ED1ng s\u1ED1p s\u1ED1t s\u1ED3 s\u1ED3i s\u1ED3n s\u1ED3ng s\u1ED5 s\u1ED5i s\u1ED5ng s\u1ED7 s\u1ED9 s\u1ED9p s\u1ED9t s\u1EDB s\u1EDBi s\u1EDBm s\u1EDBn s\u1EDBt s\u1EDD s\u1EDDm s\u1EDDn s\u1EDF s\u1EDFi s\u1EDFn s\u1EE1 s\u1EE3 s\u1EE3i s\u1EE5 s\u1EE5a s\u1EE5c s\u1EE5m s\u1EE5n s\u1EE5p s\u1EE5t s\u1EE7a s\u1EE7i s\u1EE7ng s\u1EE9 s\u1EE9a s\u1EE9c s\u1EE9t s\u1EEBn s\u1EEBng s\u1EED s\u1EEDa s\u1EEDng s\u1EEDu s\u1EEFa s\u1EEFng s\u1EF1 s\u1EF1c s\u1EF1ng s\u1EF1t ta tai tam tan tang tanh tao tay tcvn te telex tem ten teng teo tha thai tham than thang thanh thao thau thay the then theo thi thia thin thinh thiu thi\xEAm thi\xEAn thi\xEAng thi\xEAu thi\u1EBFc thi\u1EBFn thi\u1EBFp thi\u1EBFt thi\u1EBFu thi\u1EC1m thi\u1EC1n thi\u1EC1ng thi\u1EC1u thi\u1EC3m thi\u1EC3n thi\u1EC3u thi\u1EC7n thi\u1EC7p thi\u1EC7t thi\u1EC7u tho thoa thoai thoang thoi thom thon thong tho\xE0 tho\xE0n tho\xE1 tho\xE1i tho\xE1n tho\xE1ng tho\xE1t tho\u0103n tho\u1EA1i tho\u1EA1t tho\u1EA3 tho\u1EA3i tho\u1EA3ng tho\u1EAFng tho\u1EAFt thu thua thui thum thun thung thuy\xEAn thuy\u1EBFt thuy\u1EC1n thu\xEA thu\xF4n thu\xFD thu\u1EA7n thu\u1EABn thu\u1EADn thu\u1EADt thu\u1EBF thu\u1EC3 thu\u1ED1c thu\u1ED1n thu\u1ED3n thu\u1ED3ng thu\u1ED5ng thu\u1ED7n thu\u1ED9c thu\u1ED9m thu\u1EDF thu\u1EF3 thu\u1EF5 thu\u1EF7 th\xE0 th\xE0i th\xE0m th\xE0nh th\xE0o th\xE0y th\xE1 th\xE1c th\xE1ch th\xE1i th\xE1m th\xE1n th\xE1ng th\xE1nh th\xE1o th\xE1p th\xE1u th\xE1y th\xE2m th\xE2n th\xE2u th\xE2y th\xE3i th\xE8 th\xE8m th\xE8n th\xE8o th\xE9 th\xE9p th\xE9t th\xEA th\xEAm th\xEAnh th\xEAu th\xEC th\xECa th\xECn th\xECnh th\xECu th\xED th\xEDa th\xEDch th\xEDm th\xEDn th\xEDnh th\xEDp th\xEDt th\xF2 th\xF2a th\xF2i th\xF2m th\xF2ng th\xF3 th\xF3a th\xF3c th\xF3i th\xF3p th\xF3t th\xF4 th\xF4i th\xF4n th\xF4ng th\xF5ng th\xF9 th\xF9a th\xF9i th\xF9m th\xF9ng th\xF9y th\xFA th\xFAc th\xFAi th\xFAng th\xFAt th\xFAy th\u0103m th\u0103n th\u0103ng th\u0169ng th\u01A1 th\u01A1i th\u01A1m th\u01A1n th\u01B0 th\u01B0a th\u01B0ng th\u01B0\u01A1ng th\u01B0\u1EDBc th\u01B0\u1EDBt th\u01B0\u1EDDn th\u01B0\u1EDDng th\u01B0\u1EDFng th\u01B0\u1EE1i th\u01B0\u1EE1n th\u01B0\u1EE3c th\u01B0\u1EE3ng th\u01B0\u1EE3t th\u1EA1c th\u1EA1ch th\u1EA1nh th\u1EA1o th\u1EA1p th\u1EA3 th\u1EA3i th\u1EA3m th\u1EA3n th\u1EA3ng th\u1EA3nh th\u1EA3o th\u1EA3y th\u1EA5m th\u1EA5p th\u1EA5t th\u1EA5u th\u1EA5y th\u1EA7m th\u1EA7n th\u1EA7u th\u1EA7y th\u1EA9m th\u1EA9n th\u1EA9u th\u1EABm th\u1EABn th\u1EADm th\u1EADn th\u1EADp th\u1EADt th\u1EAFc th\u1EAFm th\u1EAFn th\u1EAFng th\u1EAFp th\u1EAFt th\u1EB1n th\u1EB1ng th\u1EB3m th\u1EB3ng th\u1EB7ng th\u1EB9n th\u1EB9o th\u1EB9p th\u1EBB th\u1EBBo th\u1EBD th\u1EBF th\u1EBFch th\u1EBFp th\u1EBFt th\u1EC1 th\u1EC1m th\u1EC1u th\u1EC3 th\u1EC3u th\u1EC7 th\u1EC7n th\u1EC9 th\u1EC9nh th\u1EC9u th\u1ECB th\u1ECBch th\u1ECBnh th\u1ECBt th\u1ECBu th\u1ECD th\u1ECDc th\u1ECDt th\u1ECF th\u1ECFa th\u1ECFi th\u1ECFm th\u1ED1 th\u1ED1c th\u1ED1i th\u1ED1n th\u1ED1ng th\u1ED1t th\u1ED3 th\u1ED3i th\u1ED3m th\u1ED3n th\u1ED5 th\u1ED5i th\u1ED5n th\u1ED9c th\u1ED9n th\u1ED9p th\u1EDB th\u1EDBt th\u1EDD th\u1EDDi th\u1EDDn th\u1EDF th\u1EE3 th\u1EE3t th\u1EE5 th\u1EE5c th\u1EE5i th\u1EE5ng th\u1EE5p th\u1EE5t th\u1EE5y th\u1EE7 th\u1EE7a th\u1EE7i th\u1EE7m th\u1EE7ng th\u1EE7y th\u1EE9 th\u1EE9c th\u1EEB th\u1EEBa th\u1EEBng th\u1EED th\u1EEDa th\u1EEFng th\u1EF1 th\u1EF1c ti tia tim tin tinh tiu tivi ti\xEAm ti\xEAn ti\xEAng ti\xEAu ti\u1EBFc ti\u1EBFm ti\u1EBFn ti\u1EBFng ti\u1EBFp ti\u1EBFt ti\u1EBFu ti\u1EC1m ti\u1EC1n ti\u1EC1u ti\u1EC3u ti\u1EC5n ti\u1EC5u ti\u1EC7c ti\u1EC7m ti\u1EC7n ti\u1EC7p ti\u1EC7t to toa toan toang toanh toe toen toi tom ton tong toong tout to\xE0 to\xE0i to\xE0n to\xE0ng to\xE1c to\xE1i to\xE1n to\xE1ng to\xE1t to\xE1y to\xE8 to\xE8n to\xE9 to\xE9t to\xF2ng to\u1EA1 to\u1EA1c to\u1EA1i to\u1EA3 to\u1EA3n to\u1EB9 to\u1EB9t to\u1EBB to\u1EBD tp tra trai tram tran trang tranh trao trau tre treo tri trinh tri\xEAng tri\xEAu tri\u1EBFn tri\u1EBFt tri\u1EC1n tri\u1EC1ng tri\u1EC1u tri\u1EC3n tri\u1EC7n tri\u1EC7ng tri\u1EC7t tri\u1EC7u tro troi tron trong tru trui trun trung truy truy\u1EC1n truy\u1EC7n tru\xE2n tru\xF4ng tru\u1EA5t tru\u1EADt tru\u1ED3ng tru\u1ED9t tru\u1EF5 tr\xE0 tr\xE0i tr\xE0m tr\xE0n tr\xE0ng tr\xE0nh tr\xE0o tr\xE0u tr\xE0y tr\xE1 tr\xE1c tr\xE1ch tr\xE1i tr\xE1m tr\xE1n tr\xE1ng tr\xE1nh tr\xE1o tr\xE1p tr\xE1t tr\xE2m tr\xE2n tr\xE2ng tr\xE2u tr\xE2y tr\xE3 tr\xE3i tr\xE8 tr\xE8m tr\xE8n tr\xE8o tr\xE9m tr\xE9o tr\xE9t tr\xEA tr\xEAn tr\xEAu tr\xEC tr\xECnh tr\xECu tr\xED tr\xEDch tr\xEDt tr\xF2 tr\xF2i tr\xF2m tr\xF2n tr\xF2ng tr\xF3c tr\xF3i tr\xF3m tr\xF3ng tr\xF3t tr\xF4 tr\xF4i tr\xF4m tr\xF4n tr\xF4ng tr\xF5m tr\xF5n tr\xF9 tr\xF9i tr\xF9m tr\xF9n tr\xF9ng tr\xFA tr\xFAc tr\xFAm tr\xFAng tr\xFAt tr\u0103m tr\u0103n tr\u0103ng tr\u0129 tr\u0129nh tr\u0129u tr\u0169i tr\u0169ng tr\u01A1 tr\u01A1i tr\u01A1n tr\u01B0a tr\u01B0ng tr\u01B0\u01A1ng tr\u01B0\u1EDBc tr\u01B0\u1EDBng tr\u01B0\u1EDDn tr\u01B0\u1EDDng tr\u01B0\u1EDFng tr\u01B0\u1EE1ng tr\u01B0\u1EE3ng tr\u01B0\u1EE3t tr\u1EA1c tr\u1EA1ch tr\u1EA1i tr\u1EA1m tr\u1EA1ng tr\u1EA1o tr\u1EA1y tr\u1EA3 tr\u1EA3i tr\u1EA3m tr\u1EA3ng tr\u1EA3o tr\u1EA3u tr\u1EA3y tr\u1EA5n tr\u1EA5p tr\u1EA5u tr\u1EA7m tr\u1EA7n tr\u1EA7u tr\u1EA7y tr\u1EA9n tr\u1EA9u tr\u1EA9y tr\u1EABm tr\u1EADm tr\u1EADn tr\u1EADp tr\u1EADt tr\u1EAFc tr\u1EAFm tr\u1EAFng tr\u1EAFt tr\u1EB1m tr\u1EB1n tr\u1EB7c tr\u1EB7n tr\u1EB9 tr\u1EB9o tr\u1EB9t tr\u1EBB tr\u1EBBo tr\u1EBD tr\u1EBDn tr\u1EBFch tr\u1EBFt tr\u1EC1 tr\u1EC5 tr\u1EC7 tr\u1EC7ch tr\u1EC7t tr\u1EC7u tr\u1EC9a tr\u1ECB tr\u1ECBa tr\u1ECBch tr\u1ECBnh tr\u1ECBt tr\u1ECD tr\u1ECDc tr\u1ECDi tr\u1ECDn tr\u1ECDng tr\u1ECDt tr\u1ECF tr\u1ECFi tr\u1ECFng tr\u1ED1 tr\u1ED1c tr\u1ED1i tr\u1ED1n tr\u1ED1ng tr\u1ED3 tr\u1ED3i tr\u1ED3ng tr\u1ED5 tr\u1ED5i tr\u1ED5ng tr\u1ED7 tr\u1ED9 tr\u1ED9c tr\u1ED9i tr\u1ED9m tr\u1ED9n tr\u1EDB tr\u1EDBn tr\u1EDBp tr\u1EDBt tr\u1EDD tr\u1EDDi tr\u1EDDn tr\u1EDF tr\u1EE3 tr\u1EE3n tr\u1EE3t tr\u1EE5 tr\u1EE5a tr\u1EE5c tr\u1EE5i tr\u1EE5m tr\u1EE5n tr\u1EE5ng tr\u1EE5p tr\u1EE5t tr\u1EE5y tr\u1EE7 tr\u1EE9 tr\u1EE9ng tr\u1EEB tr\u1EEBa tr\u1EEBng tr\u1EEDng tr\u1EEF tr\u1EF1 tr\u1EF1c tu tua tui tum tun tung tuy tuyn tuy\xEAn tuy\u1EBFn tuy\u1EBFt tuy\u1EC1n tuy\u1EC3n tuy\u1EC7t tu\xE2n tu\xF4n tu\xF4ng tu\xFD tu\u1EA5n tu\u1EA5t tu\u1EA7n tu\u1EBF tu\u1EBFch tu\u1EC7 tu\u1EC7ch tu\u1ED1t tu\u1ED3n tu\u1ED3ng tu\u1ED5i tu\u1ED9c tu\u1ED9t tu\u1EF3 tu\u1EF5 tu\u1EF7 tv tw ty t\xE0 t\xE0i t\xE0n t\xE0ng t\xE0nh t\xE0o t\xE0u t\xE0y t\xE1 t\xE1c t\xE1ch t\xE1i t\xE1m t\xE1n t\xE1ng t\xE1nh t\xE1o t\xE1p t\xE1t t\xE1u t\xE1y t\xE2m t\xE2n t\xE2ng t\xE2u t\xE2y t\xE3 t\xE3i t\xE8 t\xE8m t\xE8n t\xE8o t\xE9 t\xE9c t\xE9m t\xE9p t\xE9t t\xEA t\xEAm t\xEAn t\xEAnh t\xEAt t\xEAu t\xEC t\xECm t\xECnh t\xECu t\xED t\xEDa t\xEDch t\xEDm t\xEDn t\xEDnh t\xEDp t\xEDt t\xEDu t\xF2 t\xF2a t\xF2e t\xF2i t\xF2m t\xF2n t\xF2ng t\xF3 t\xF3c t\xF3e t\xF3i t\xF3m t\xF3p t\xF3t t\xF4 t\xF4i t\xF4m t\xF4n t\xF4ng t\xF5e t\xF5m t\xF9 t\xF9m t\xF9ng t\xF9y t\xFA t\xFAc t\xFAi t\xFAm t\xFAng t\xFAp t\xFAt t\xFAy t\u0103m t\u0103n t\u0103ng t\u0129 t\u0129nh t\u0129u t\u0169m t\u01A1 t\u01A1i t\u01B0 t\u01B0a t\u01B0ng t\u01B0\u01A1i t\u01B0\u01A1m t\u01B0\u01A1ng t\u01B0\u1EDBc t\u01B0\u1EDBi t\u01B0\u1EDBn t\u01B0\u1EDBng t\u01B0\u1EDBp t\u01B0\u1EDBt t\u01B0\u1EDDm t\u01B0\u1EDDng t\u01B0\u1EDDu t\u01B0\u1EDFi t\u01B0\u1EDFng t\u01B0\u1EE3c t\u01B0\u1EE3ng t\u01B0\u1EE3p t\u01B0\u1EE3t t\u1EA1 t\u1EA1c t\u1EA1ch t\u1EA1i t\u1EA1m t\u1EA1ng t\u1EA1nh t\u1EA1o t\u1EA1p t\u1EA1t t\u1EA3 t\u1EA3i t\u1EA3n t\u1EA3ng t\u1EA3o t\u1EA5c t\u1EA5m t\u1EA5n t\u1EA5p t\u1EA5t t\u1EA5u t\u1EA5y t\u1EA7m t\u1EA7n t\u1EA7ng t\u1EA7y t\u1EA9m t\u1EA9n t\u1EA9u t\u1EA9u t\u1EA9y t\u1EADn t\u1EADp t\u1EADt t\u1EADu t\u1EAFc t\u1EAFm t\u1EAFn t\u1EAFp t\u1EAFt t\u1EB1m t\u1EB1n t\u1EB1ng t\u1EB3n t\u1EB7c t\u1EB7n t\u1EB7ng t\u1EB9o t\u1EB9p t\u1EB9t t\u1EBB t\u1EBBm t\u1EBBo t\u1EBD t\u1EBDn t\u1EBF t\u1EBFch t\u1EBFt t\u1EBFu t\u1EC1 t\u1EC1nh t\u1EC3 t\u1EC3nh t\u1EC5 t\u1EC5nh t\u1EC7 t\u1EC7p t\u1EC9 t\u1EC9a t\u1EC9m t\u1EC9nh t\u1ECB t\u1ECBch t\u1ECBnh t\u1ECBt t\u1ECBu t\u1ECDa t\u1ECDc t\u1ECDe t\u1ECDng t\u1ECDp t\u1ECDt t\u1ECF t\u1ECFa t\u1ECFe t\u1ECFi t\u1ECFm t\u1ECFng t\u1ED1 t\u1ED1c t\u1ED1i t\u1ED1n t\u1ED1ng t\u1ED1p t\u1ED1t t\u1ED3 t\u1ED3i t\u1ED3n t\u1ED3ng t\u1ED5 t\u1ED5n t\u1ED5ng t\u1ED9 t\u1ED9c t\u1ED9i t\u1ED9t t\u1EDB t\u1EDBi t\u1EDBn t\u1EDBp t\u1EDBt t\u1EDD t\u1EDDi t\u1EDFm t\u1EE3 t\u1EE3n t\u1EE3p t\u1EE5 t\u1EE5c t\u1EE5i t\u1EE5m t\u1EE5ng t\u1EE5t t\u1EE5y t\u1EE7 t\u1EE7a t\u1EE7i t\u1EE7m t\u1EE7n t\u1EE7y t\u1EE9 t\u1EE9a t\u1EE9c t\u1EEB t\u1EEBng t\u1EED t\u1EEDa t\u1EEDng t\u1EEDu t\u1EF1 t\u1EF1a t\u1EF1u t\u1EF5 t\u1EF7 u ubnd um un ung unicode url uy uy\xEAn uy\u1EC3n u\xF4m u\xFD u\u1EA5t u\u1EA9n u\u1EA9y u\u1EBF u\u1EC3 u\u1ED1n u\u1ED1ng u\u1ED5ng u\u1ED9t u\u1EDF u\u1EF3nh u\u1EF5ch u\u1EF7 v va vai van vang vanh vao vay ve ven veo vi vinh viqr viscii vi\xEAm vi\xEAn vi\u1EBFng vi\u1EBFt vi\u1EC1n vi\u1EC3n vi\u1EC5n vi\u1EC7c vi\u1EC7n vi\u1EC7t vn vni vo voan voi von vong vu vua vui vun vung vu\xF4ng vu\u1ED1t vu\u1ED9t v\xE0 v\xE0i v\xE0m v\xE0n v\xE0ng v\xE0nh v\xE0o v\xE0y v\xE1 v\xE1c v\xE1ch v\xE1i v\xE1n v\xE1ng v\xE1nh v\xE1o v\xE1p v\xE1t v\xE1y v\xE2m v\xE2n v\xE2ng v\xE2y v\xE3 v\xE3i v\xE3n v\xE3ng v\xE3nh v\xE8 v\xE8o v\xE9 v\xE9c v\xE9n v\xE9o v\xE9t v\xEA v\xEAn v\xEAnh v\xEAu v\xEC v\xED v\xEDa v\xEDch v\xEDt v\xEDu v\xF2 v\xF2i v\xF2m v\xF2n v\xF2ng v\xF3 v\xF3c v\xF3i v\xF3n v\xF3ng v\xF3t v\xF4 v\xF4i v\xF4n v\xF4ng v\xF5 v\xF5ng v\xF9 v\xF9a v\xF9i v\xF9n v\xF9ng v\xFA v\xFAc v\xFAt v\u0103n v\u0103ng v\u0129 v\u0129nh v\u0169 v\u0169m v\u0169ng v\u01A1 v\u01A1i v\u01B0ng v\u01B0u v\u01B0\u01A1n v\u01B0\u01A1ng v\u01B0\u1EDBng v\u01B0\u1EDDn v\u01B0\u1EDFng v\u01B0\u1EE3c v\u01B0\u1EE3n v\u01B0\u1EE3ng v\u01B0\u1EE3t v\u1EA1 v\u1EA1c v\u1EA1ch v\u1EA1i v\u1EA1m v\u1EA1n v\u1EA1ng v\u1EA1nh v\u1EA1p v\u1EA1t v\u1EA1y v\u1EA3 v\u1EA3i v\u1EA3ng v\u1EA3y v\u1EA5n v\u1EA5p v\u1EA5t v\u1EA5u v\u1EA5y v\u1EA7n v\u1EA7ng v\u1EA7u v\u1EA7y v\u1EA9n v\u1EA9u v\u1EA9y v\u1EABn v\u1EABy v\u1EADm v\u1EADn v\u1EADp v\u1EADt v\u1EADy v\u1EAFc v\u1EAFn v\u1EAFng v\u1EAFt v\u1EB1m v\u1EB1n v\u1EB1ng v\u1EB3ng v\u1EB7c v\u1EB7n v\u1EB7t v\u1EB9m v\u1EB9n v\u1EB9o v\u1EB9t v\u1EBB v\u1EBBn v\u1EBBo v\u1EBD v\u1EBF v\u1EBFch v\u1EBFt v\u1EBFu v\u1EC1 v\u1EC1n v\u1EC1u v\u1EC3nh v\u1EC7 v\u1EC7n v\u1EC7t v\u1EC9 v\u1EC9a v\u1ECB v\u1ECBm v\u1ECBn v\u1ECBnh v\u1ECBt v\u1ECD v\u1ECDc v\u1ECDi v\u1ECDng v\u1ECDp v\u1ECDt v\u1ECF v\u1ECFn v\u1ECFng v\u1ED1 v\u1ED1c v\u1ED1i v\u1ED1n v\u1ED1ng v\u1ED3 v\u1ED3i v\u1ED3n v\u1ED3ng v\u1ED5 v\u1ED5ng v\u1ED7 v\u1ED9i v\u1EDB v\u1EDBi v\u1EDBt v\u1EDD v\u1EDDi v\u1EDDn v\u1EDF v\u1EDFn v\u1EE1 v\u1EE3 v\u1EE3i v\u1EE3t v\u1EE5 v\u1EE5c v\u1EE5n v\u1EE5ng v\u1EE5t v\u1EE9c v\u1EE9t v\u1EEBa v\u1EEBng v\u1EEDng v\u1EEFa v\u1EEFng v\u1EF1a v\u1EF1c v\u1EF1c v\u1EF1ng web xa xam xan xang xanh xao xay xe xem xen xeo xi xia xim xin xinh xit xi\xEAm xi\xEAn xi\xEAu xi\u1EBFc xi\u1EBFt xi\u1EC1ng xi\u1EC3m xi\u1EC3n xi\u1EC3ng xo xoa xoan xoang xoay xoe xoen xoi xom xon xong xoong xo\xE0 xo\xE0i xo\xE0m xo\xE0n xo\xE0ng xo\xE0nh xo\xE1 xo\xE1c xo\xE1t xo\xE1y xo\xE3 xo\xE8 xo\xE8n xo\xE9t xo\u0103n xo\u1EA1c xo\u1EA1ch xo\u1EA1ng xo\u1EA3 xo\u1EA3i xo\u1EA3ng xo\u1EAFn xo\u1EB9 xo\u1EB9t xu xua xui xum xung xuy xuya xuynh xuy\xEAn xuy\u1EBFn xuy\u1EBFt xu\xE2n xu\xE2y xu\xEA xu\xF4i xu\xFD xu\xFDt xu\u1EA5t xu\u1EA9n xu\u1EC1 xu\u1EC1nh xu\u1EC3 xu\u1EC7ch xu\u1ED1ng xu\u1ED3ng xu\u1ED5ng xu\u1EF3 xu\u1EF5t x\xE0 x\xE0i x\xE0m x\xE0ng x\xE0nh x\xE0o x\xE0u x\xE1 x\xE1c x\xE1ch x\xE1i x\xE1m x\xE1n x\xE1o x\xE1p x\xE1t x\xE1y x\xE2m x\xE2u x\xE2y x\xE3 x\xE8 x\xE8n x\xE8ng x\xE8o x\xE9 x\xE9c x\xE9n x\xE9o x\xE9p x\xE9t x\xEA x\xEAn x\xEAnh x\xEAu x\xEC x\xECnh x\xECu x\xED x\xEDa x\xEDch x\xEDnh x\xEDt x\xEDu x\xF2a x\xF2e x\xF2m x\xF2ng x\xF3 x\xF3a x\xF3c x\xF3i x\xF3m x\xF3n x\xF3p x\xF3t x\xF4 x\xF4i x\xF4m x\xF4n x\xF4ng x\xF5a x\xF5m x\xF5ng x\xF9 x\xF9i x\xF9m x\xF9ng x\xF9y x\xFA x\xFAc x\xFAi x\xFAm x\xFAng x\xFAp x\xFAt x\xFAy x\u0103m x\u0103n x\u0103ng x\u0129nh x\u0169 x\u01A1 x\u01A1i x\u01A1m x\u01A1n x\u01B0a x\u01B0ng x\u01B0\u01A1ng x\u01B0\u1EDBc x\u01B0\u1EDBng x\u01B0\u1EDDi x\u01B0\u1EDFng x\u01B0\u1EE3c x\u1EA1 x\u1EA1c x\u1EA1ch x\u1EA1o x\u1EA1p x\u1EA1u x\u1EA3 x\u1EA3m x\u1EA3nh x\u1EA3o x\u1EA3u x\u1EA3y x\u1EA5c x\u1EA5p x\u1EA5u x\u1EA7m x\u1EA9m x\u1EA9n x\u1EA9u x\u1EA9y x\u1EADp x\u1EAFc x\u1EAFm x\u1EAFn x\u1EAFp x\u1EB1ng x\u1EB5ng x\u1EB9c x\u1EB9o x\u1EB9p x\u1EB9t x\u1EBB x\u1EBBn x\u1EBBng x\u1EBBo x\u1EBDo x\u1EBF x\u1EBFch x\u1EBFp x\u1EC1m x\u1EC1nh x\u1EC1u x\u1EC3 x\u1EC7 x\u1EC7ch x\u1EC7p x\u1EC7u x\u1EC9 x\u1EC9a x\u1EC9n x\u1EC9nh x\u1EC9u x\u1ECB x\u1ECBch x\u1ECBn x\u1ECBt x\u1ECBu x\u1ECD x\u1ECDc x\u1ECDe x\u1ECDp x\u1ECF x\u1ECFa x\u1ECFng x\u1ED1 x\u1ED1c x\u1ED1i x\u1ED1n x\u1ED1ng x\u1ED1p x\u1ED1t x\u1ED3 x\u1ED3m x\u1ED3n x\u1ED3ng x\u1ED5 x\u1ED5i x\u1ED5m x\u1ED5ng x\u1ED9c x\u1ED9n x\u1ED9p x\u1EDB x\u1EDBi x\u1EDBp x\u1EDBt x\u1EDD x\u1EDDm x\u1EDF x\u1EDFi x\u1EDFn x\u1EE1 x\u1EE3p x\u1EE3t x\u1EE5 x\u1EE5c x\u1EE5i x\u1EE5p x\u1EE7ng x\u1EE9 x\u1EE9c x\u1EE9ng x\u1EEB x\u1EED x\u1EED x\u1EEDa x\u1EEDng x\u1EF1c y y\xEAn y\xEAng y\xEAu y\u1EBFm y\u1EBFn y\u1EBFt y\u1EBFu y\u1EC3m y\u1EC3ng y\u1EC3u \xE0 \xE0o \xE1 \xE1c \xE1ch \xE1i \xE1m \xE1n \xE1ng \xE1nh \xE1o \xE1p \xE1t \xE1y \xE2m \xE2n \xE2u \xE3 \xE8 \xE8o \xE9 \xE9c \xE9m \xE9n \xE9o \xE9p \xE9t \xEA \xEAm \xEAu \xEC \xECn \xECnh \xED \xEDch \xEDn \xEDt \xF2 \xF2a \xF2i \xF2m \xF2ng \xF3 \xF3c \xF3e \xF3i \xF3ng \xF3p \xF3t \xF4 \xF4i \xF4m \xF4n \xF4ng \xF9 \xF9a \xF9m \xF9n \xF9ng \xFA \xFAa \xFAi \xFAm \xFAng \xFAp \xFAt \xFAy \xFD \u0103m \u0103n \u0103ng \u0111a \u0111ai \u0111am \u0111an \u0111ang \u0111anh \u0111ao \u0111au \u0111ay \u0111e \u0111em \u0111en \u0111eo \u0111i \u0111in \u0111inh \u0111i\xEAn \u0111i\xEAu \u0111i\u1EBFc \u0111i\u1EBFm \u0111i\u1EBFng \u0111i\u1EBFu \u0111i\u1EC1n \u0111i\u1EC1u \u0111i\u1EC3m \u0111i\u1EC3n \u0111i\u1EC3u \u0111i\u1EC7m \u0111i\u1EC7n \u0111i\u1EC7p \u0111i\u1EC7u \u0111o \u0111oan \u0111oi \u0111om \u0111on \u0111ong \u0111o\xE0i \u0111o\xE0n \u0111o\xE0ng \u0111o\xE0nh \u0111o\xE1 \u0111o\xE1i \u0111o\xE1n \u0111o\xE3ng \u0111o\u1EA1 \u0111o\u1EA1n \u0111o\u1EA1t \u0111o\u1EA3n \u0111o\u1EA3ng \u0111u \u0111ua \u0111ui \u0111um \u0111un \u0111ung \u0111u\xF4i \u0111u\u1ED1c \u0111u\u1ED1i \u0111u\u1ED5i \u0111u\u1ED7n \u0111u\u1ED9t \u0111\xE0 \u0111\xE0i \u0111\xE0m \u0111\xE0n \u0111\xE0ng \u0111\xE0nh \u0111\xE0o \u0111\xE0y \u0111\xE1 \u0111\xE1c \u0111\xE1ch \u0111\xE1i \u0111\xE1m \u0111\xE1n \u0111\xE1ng \u0111\xE1nh \u0111\xE1o \u0111\xE1p \u0111\xE1t \u0111\xE1y \u0111\xE2m \u0111\xE2u \u0111\xE2y \u0111\xE3 \u0111\xE3i \u0111\xE3ng \u0111\xE3y \u0111\xE8 \u0111\xE8m \u0111\xE8n \u0111\xE8o \u0111\xE9c \u0111\xE9o \u0111\xE9t \u0111\xEA \u0111\xEAm \u0111\xEAn \u0111\xEAnh \u0111\xEAu \u0111\xEC \u0111\xECa \u0111\xECnh \u0111\xECu \u0111\xEDa \u0111\xEDch \u0111\xEDnh \u0111\xEDt \u0111\xF2 \u0111\xF2i \u0111\xF2m \u0111\xF2n \u0111\xF2ng \u0111\xF3 \u0111\xF3a \u0111\xF3c \u0111\xF3i \u0111\xF3m \u0111\xF3n \u0111\xF3ng \u0111\xF3t \u0111\xF4 \u0111\xF4i \u0111\xF4m \u0111\xF4n \u0111\xF4ng \u0111\xF5 \u0111\xF9 \u0111\xF9a \u0111\xF9i \u0111\xF9m \u0111\xF9n \u0111\xF9ng \u0111\xFA \u0111\xFAc \u0111\xFAm \u0111\xFAn \u0111\xFAng \u0111\xFAp \u0111\xFAt \u0111\u0103m \u0111\u0103ng \u0111\u0129 \u0111\u0129a \u0111\u0129nh \u0111\u0169a \u0111\u0169ng \u0111\u01A1 \u0111\u01A1m \u0111\u01A1n \u0111\u01B0a \u0111\u01B0ng \u0111\u01B0\u01A1ng \u0111\u01B0\u1EDBc \u0111\u01B0\u1EDDi \u0111\u01B0\u1EDDn \u0111\u01B0\u1EDDng \u0111\u01B0\u1EE1n \u0111\u01B0\u1EE3c \u0111\u01B0\u1EE3m \u0111\u1EA1c \u0111\u1EA1ch \u0111\u1EA1i \u0111\u1EA1m \u0111\u1EA1n \u0111\u1EA1o \u0111\u1EA1p \u0111\u1EA1t \u0111\u1EA3 \u0111\u1EA3m \u0111\u1EA3n \u0111\u1EA3ng \u0111\u1EA3o \u0111\u1EA3y \u0111\u1EA5m \u0111\u1EA5ng \u0111\u1EA5t \u0111\u1EA5u \u0111\u1EA5y \u0111\u1EA7m \u0111\u1EA7n \u0111\u1EA7u \u0111\u1EA7y \u0111\u1EA9u \u0111\u1EA9y \u0111\u1EABm \u0111\u1EABn \u0111\u1EABy \u0111\u1EADm \u0111\u1EADn \u0111\u1EADp \u0111\u1EADt \u0111\u1EADu \u0111\u1EADy \u0111\u1EAFc \u0111\u1EAFk \u0111\u1EAFm \u0111\u1EAFn \u0111\u1EAFng \u0111\u1EAFp \u0111\u1EAFt \u0111\u1EB1m \u0111\u1EB1n \u0111\u1EB1ng \u0111\u1EB3ng \u0111\u1EB5m \u0111\u1EB5n \u0111\u1EB5ng \u0111\u1EB7c \u0111\u1EB7n \u0111\u1EB7ng \u0111\u1EB7t \u0111\u1EB9n \u0111\u1EB9p \u0111\u1EB9t \u0111\u1EBB \u0111\u1EBD \u0111\u1EBDo \u0111\u1EBF \u0111\u1EBFch \u0111\u1EBFm \u0111\u1EBFn \u0111\u1EC1 \u0111\u1EC1m \u0111\u1EC1n \u0111\u1EC1nh \u0111\u1EC1u \u0111\u1EC3 \u0111\u1EC3nh \u0111\u1EC3u \u0111\u1EC5 \u0111\u1EC5nh \u0111\u1EC7 \u0111\u1EC7m \u0111\u1EC7p \u0111\u1EC9a \u0111\u1EC9nh \u0111\u1ECBa \u0111\u1ECBch \u0111\u1ECBnh \u0111\u1ECBt \u0111\u1ECBu \u0111\u1ECD \u0111\u1ECDa \u0111\u1ECDc \u0111\u1ECDi \u0111\u1ECDn \u0111\u1ECDng \u0111\u1ECDp \u0111\u1ECDt \u0111\u1ECF \u0111\u1ECFi \u0111\u1ECFm \u0111\u1ED1 \u0111\u1ED1c \u0111\u1ED1i \u0111\u1ED1m \u0111\u1ED1n \u0111\u1ED1ng \u0111\u1ED1p \u0111\u1ED1t \u0111\u1ED3 \u0111\u1ED3i \u0111\u1ED3m \u0111\u1ED3n \u0111\u1ED3ng \u0111\u1ED5 \u0111\u1ED5i \u0111\u1ED5ng \u0111\u1ED7 \u0111\u1ED7i \u0111\u1ED9 \u0111\u1ED9c \u0111\u1ED9i \u0111\u1ED9n \u0111\u1ED9ng \u0111\u1ED9p \u0111\u1ED9t \u0111\u1EDB \u0111\u1EDBi \u0111\u1EDBn \u0111\u1EDBp \u0111\u1EDBt \u0111\u1EDD \u0111\u1EDDi \u0111\u1EDDm \u0111\u1EDDn \u0111\u1EDFm \u0111\u1EDFn \u0111\u1EE1 \u0111\u1EE3 \u0111\u1EE3i \u0111\u1EE3p \u0111\u1EE3t \u0111\u1EE5 \u0111\u1EE5c \u0111\u1EE5n \u0111\u1EE5ng \u0111\u1EE5p \u0111\u1EE5t \u0111\u1EE7 \u0111\u1EE7i \u0111\u1EE7ng \u0111\u1EE9 \u0111\u1EE9a \u0111\u1EE9c \u0111\u1EE9ng \u0111\u1EE9t \u0111\u1EEB \u0111\u1EEBa \u0111\u1EEBng \u0111\u1EED \u0111\u1EF1c \u0111\u1EF1ng \u0129 \u0129nh \u01A1 \u01A1i \u01A1n \u01B0 \u01B0a \u01B0ng \u01B0u \u01B0\u01A1i \u01B0\u01A1m \u01B0\u01A1n \u01B0\u01A1ng \u01B0\u1EDBc \u01B0\u1EDBm \u01B0\u1EDBp \u01B0\u1EDBt \u01B0\u1EDDn \u01B0\u1EE1n \u1EA1 \u1EA1ch \u1EA1nh \u1EA1o \u1EA1t \u1EA3 \u1EA3i \u1EA3m \u1EA3ng \u1EA3nh \u1EA3o \u1EA5m \u1EA5n \u1EA5p \u1EA5t \u1EA5u \u1EA5y \u1EA7m \u1EA7y \u1EA9m \u1EA9n \u1EA9u \u1EA9y \u1EADc \u1EADm \u1EADp \u1EAFc \u1EAFng \u1EAFp \u1EAFt \u1EB1ng \u1EB3ng \u1EB5m \u1EB7c \u1EB7p \u1EB9 \u1EB9o \u1EB9p \u1EB9t \u1EBBn \u1EBBo \u1EBDo \u1EBF \u1EBFch \u1EBFm \u1EC1 \u1EC1nh \u1EC5nh \u1EC7 \u1EC7ch \u1EC7n \u1EC7nh \u1EC9 \u1EC9a \u1EC9m \u1EC9n \u1EC9u \u1ECB \u1ECBch \u1ECBt \u1ECD \u1ECDc \u1ECDe \u1ECDi \u1ECDp \u1ECDt \u1ECFe \u1ECFi \u1ECFm \u1ECFn \u1ECFng \u1ED1 \u1ED1c \u1ED1i \u1ED1m \u1ED1m \u1ED1ng \u1ED1p \u1ED1t \u1ED3 \u1ED3m \u1ED3n \u1ED3ng \u1ED5 \u1ED5i \u1ED5n \u1ED5ng \u1ED9 \u1ED9c \u1ED9n \u1ED9p \u1EDB \u1EDBi \u1EDBm \u1EDBn \u1EDBt \u1EDD \u1EDDn \u1EDF \u1EE1m \u1EE3 \u1EE3t \u1EE5 \u1EE5a \u1EE5c \u1EE5p \u1EE5t \u1EE7 \u1EE7a \u1EE7i \u1EE7n \u1EE7ng \u1EE7y \u1EE9 \u1EE9a \u1EE9c \u1EE9ng \u1EEB \u1EEBng \u1EEDng \u1EF1a \u1EF1c \u1EF7";
  var ALL_VIETNAMESE_SINGLE_VOWELS = [
    "a",
    "\xE1",
    "\xE0",
    "\u1EA3",
    "\xE3",
    "\u1EA1",
    "\u0103",
    "\u1EAF",
    "\u1EB1",
    "\u1EB3",
    "\u1EB5",
    "\u1EB7",
    "\xE2",
    "\u1EA5",
    "\u1EA7",
    "\u1EA9",
    "\u1EAB",
    "\u1EAD",
    "e",
    "\xE9",
    "\xE8",
    "\u1EBB",
    "\u1EBD",
    "\u1EB9",
    "\xEA",
    "\u1EBF",
    "\u1EC1",
    "\u1EC3",
    "\u1EC5",
    "\u1EC7",
    "i",
    "\xED",
    "\xEC",
    "\u1EC9",
    "\u0129",
    "\u1ECB",
    "o",
    "\xF3",
    "\xF2",
    "\u1ECF",
    "\xF5",
    "\u1ECD",
    "\xF4",
    "\u1ED1",
    "\u1ED3",
    "\u1ED5",
    "\u1ED7",
    "\u1ED9",
    "\u01A1",
    "\u1EDB",
    "\u1EDD",
    "\u1EDF",
    "\u1EE1",
    "\u1EE3",
    "u",
    "\xFA",
    "\xF9",
    "\u1EE7",
    "\u0169",
    "\u1EE5",
    "\u01B0",
    "\u1EE9",
    "\u1EEB",
    "\u1EED",
    "\u1EEF",
    "\u1EF1",
    "y",
    "\xFD",
    "\u1EF3",
    "\u1EF7",
    "\u1EF9",
    "\u1EF5",
    "\u0111"
  ];
  var RARE_AND_PLACE_SYLLABLES = [
    // Tây Nguyên & Ethnic Toponyms — âm tiết không có trong từ điển chuẩn
    "\u0111\u1EAFk",
    "\u0111\u0103k",
    "l\u1EAFk",
    "n\xF4ng",
    "kr\xF4ng",
    "p\u1EAFk",
    "b\xFAk",
    "p\u0103h",
    "pr\xF4ng",
    "ana",
    "ea",
    "h'leo",
    "hleo",
    "kar",
    "s\xFAp",
    "m'\u0111r\u1EAFk",
    "mdr\u1EAFk",
    "\u0111r\u1EAFk",
    "mil",
    "glong",
    "\u0111oa",
    "grai",
    "h'drai",
    "hdrai",
    "m'gar",
    "mgar",
    "kuin",
    "r'l\u1EA5p",
    "r\u2019l\u1EA5p",
    "rl\u1EA5p",
    "pleiku",
    "ch\u01B0",
    "c\u01B0",
    "s\xEA",
    "b\xF4ng",
    "n\u0103ng",
    "\u0111\u1EE9c",
    "c\u01A1",
    // Rare, Classical & Dialect Vietnamese Syllables
    "pa",
    "p\xE1",
    "p\xE0",
    "p\u1EA3",
    "p\xE3",
    "p\u1EA1",
    "ngu\u1EA7y",
    "ngu\u1EADy",
    "dz\xECa",
    "dz\xED",
    "dz\u1ECB",
    "dz\xF4",
    "dz\u1EADy",
    "dz\xE1ch",
    "d\xE1ch",
    "z\u1ECB",
    "zi",
    "zia",
    "h\xE9n",
    "nghen",
    "h\u1ED5ng",
    "h\u1EA1p",
    "qu\u1EDBt",
    "n\u01B0",
    "qu\u1EC9",
    "l\xE9t",
    "m\u1EE5i",
    "b\u1EB9o",
    "b\u1EADu",
    "t\u1ECFn",
    "hum",
    "ch\xE1c",
    "ch\xE1o",
    "qu\u1EE1n",
    "hu\u1EE1",
    "goong",
    "go\xF2ng",
    "go\xF3ng",
    "xoong",
    "xo\xF2ng",
    "xo\xF3ng",
    "xo\u1ECDng",
    "boong",
    "bo\xF2ng",
    "bo\xF3ng",
    "moong",
    "toong"
  ];
  function canon(str) {
    if (!str) return "";
    return str.normalize("NFC").replace(/[\u2018\u2019\u201B\u02BC\u02B9]/g, "'").toLowerCase();
  }
  var _vietnameseWordSet = null;
  function getVietnameseWordSet() {
    if (!_vietnameseWordSet) {
      _vietnameseWordSet = /* @__PURE__ */ new Set();
      const rawTokens = VIETNAMESE_WORDS_STRING.split(" ");
      for (let i = 0; i < rawTokens.length; i++) {
        const c = canon(rawTokens[i]);
        if (c) _vietnameseWordSet.add(c);
      }
      ALL_VIETNAMESE_SINGLE_VOWELS.forEach((v) => _vietnameseWordSet.add(canon(v)));
      RARE_AND_PLACE_SYLLABLES.forEach((s) => _vietnameseWordSet.add(canon(s)));
    }
    return _vietnameseWordSet;
  }

  // src/engine/syllable-parser.js
  var TONE_MARK = {
    NONE: 0,
    // Thanh ngang
    ACUTE: 1,
    // Sắc (s / 1)
    GRAVE: 2,
    // Huyền (f / 2)
    HOOK_ABOVE: 3,
    // Hỏi (r / 3)
    TILDE: 4,
    // Ngã (x / 4)
    DOT_BELOW: 5
    // Nặng (j / 5)
  };
  var VOWEL_DECOMPOSE_MAP = {
    // a
    "a": { base: "a", tone: 0 },
    "\xE1": { base: "a", tone: 1 },
    "\xE0": { base: "a", tone: 2 },
    "\u1EA3": { base: "a", tone: 3 },
    "\xE3": { base: "a", tone: 4 },
    "\u1EA1": { base: "a", tone: 5 },
    "A": { base: "A", tone: 0 },
    "\xC1": { base: "A", tone: 1 },
    "\xC0": { base: "A", tone: 2 },
    "\u1EA2": { base: "A", tone: 3 },
    "\xC3": { base: "A", tone: 4 },
    "\u1EA0": { base: "A", tone: 5 },
    // ă
    "\u0103": { base: "\u0103", tone: 0 },
    "\u1EAF": { base: "\u0103", tone: 1 },
    "\u1EB1": { base: "\u0103", tone: 2 },
    "\u1EB3": { base: "\u0103", tone: 3 },
    "\u1EB5": { base: "\u0103", tone: 4 },
    "\u1EB7": { base: "\u0103", tone: 5 },
    "\u0102": { base: "\u0102", tone: 0 },
    "\u1EAE": { base: "\u0102", tone: 1 },
    "\u1EB0": { base: "\u0102", tone: 2 },
    "\u1EB2": { base: "\u0102", tone: 3 },
    "\u1EB4": { base: "\u0102", tone: 4 },
    "\u1EB6": { base: "\u0102", tone: 5 },
    // â
    "\xE2": { base: "\xE2", tone: 0 },
    "\u1EA5": { base: "\xE2", tone: 1 },
    "\u1EA7": { base: "\xE2", tone: 2 },
    "\u1EA9": { base: "\xE2", tone: 3 },
    "\u1EAB": { base: "\xE2", tone: 4 },
    "\u1EAD": { base: "\xE2", tone: 5 },
    "\xC2": { base: "\xC2", tone: 0 },
    "\u1EA4": { base: "\xC2", tone: 1 },
    "\u1EA6": { base: "\xC2", tone: 2 },
    "\u1EA8": { base: "\xC2", tone: 3 },
    "\u1EAA": { base: "\xC2", tone: 4 },
    "\u1EAC": { base: "\xC2", tone: 5 },
    // e
    "e": { base: "e", tone: 0 },
    "\xE9": { base: "e", tone: 1 },
    "\xE8": { base: "e", tone: 2 },
    "\u1EBB": { base: "e", tone: 3 },
    "\u1EBD": { base: "e", tone: 4 },
    "\u1EB9": { base: "e", tone: 5 },
    "E": { base: "E", tone: 0 },
    "\xC9": { base: "E", tone: 1 },
    "\xC8": { base: "E", tone: 2 },
    "\u1EBA": { base: "E", tone: 3 },
    "\u1EBC": { base: "E", tone: 4 },
    "\u1EB8": { base: "E", tone: 5 },
    // ê
    "\xEA": { base: "\xEA", tone: 0 },
    "\u1EBF": { base: "\xEA", tone: 1 },
    "\u1EC1": { base: "\xEA", tone: 2 },
    "\u1EC3": { base: "\xEA", tone: 3 },
    "\u1EC5": { base: "\xEA", tone: 4 },
    "\u1EC7": { base: "\xEA", tone: 5 },
    "\xCA": { base: "\xCA", tone: 0 },
    "\u1EBE": { base: "\xCA", tone: 1 },
    "\u1EC0": { base: "\xCA", tone: 2 },
    "\u1EC2": { base: "\xCA", tone: 3 },
    "\u1EC4": { base: "\xCA", tone: 4 },
    "\u1EC6": { base: "\xCA", tone: 5 },
    // i
    "i": { base: "i", tone: 0 },
    "\xED": { base: "i", tone: 1 },
    "\xEC": { base: "i", tone: 2 },
    "\u1EC9": { base: "i", tone: 3 },
    "\u0129": { base: "i", tone: 4 },
    "\u1ECB": { base: "i", tone: 5 },
    "I": { base: "I", tone: 0 },
    "\xCD": { base: "I", tone: 1 },
    "\xCC": { base: "I", tone: 2 },
    "\u1EC8": { base: "I", tone: 3 },
    "\u0128": { base: "I", tone: 4 },
    "\u1ECA": { base: "I", tone: 5 },
    // o
    "o": { base: "o", tone: 0 },
    "\xF3": { base: "o", tone: 1 },
    "\xF2": { base: "o", tone: 2 },
    "\u1ECF": { base: "o", tone: 3 },
    "\xF5": { base: "o", tone: 4 },
    "\u1ECD": { base: "o", tone: 5 },
    "O": { base: "O", tone: 0 },
    "\xD3": { base: "O", tone: 1 },
    "\xD2": { base: "O", tone: 2 },
    "\u1ECE": { base: "O", tone: 3 },
    "\xD5": { base: "O", tone: 4 },
    "\u1ECC": { base: "O", tone: 5 },
    // ô
    "\xF4": { base: "\xF4", tone: 0 },
    "\u1ED1": { base: "\xF4", tone: 1 },
    "\u1ED3": { base: "\xF4", tone: 2 },
    "\u1ED5": { base: "\xF4", tone: 3 },
    "\u1ED7": { base: "\xF4", tone: 4 },
    "\u1ED9": { base: "\xF4", tone: 5 },
    "\xD4": { base: "\xD4", tone: 0 },
    "\u1ED0": { base: "\xD4", tone: 1 },
    "\u1ED2": { base: "\xD4", tone: 2 },
    "\u1ED4": { base: "\xD4", tone: 3 },
    "\u1ED6": { base: "\xD4", tone: 4 },
    "\u1ED8": { base: "\xD4", tone: 5 },
    // ơ
    "\u01A1": { base: "\u01A1", tone: 0 },
    "\u1EDB": { base: "\u01A1", tone: 1 },
    "\u1EDD": { base: "\u01A1", tone: 2 },
    "\u1EDF": { base: "\u01A1", tone: 3 },
    "\u1EE1": { base: "\u01A1", tone: 4 },
    "\u1EE3": { base: "\u01A1", tone: 5 },
    "\u01A0": { base: "\u01A0", tone: 0 },
    "\u1EDA": { base: "\u01A0", tone: 1 },
    "\u1EDC": { base: "\u01A0", tone: 2 },
    "\u1EDE": { base: "\u01A0", tone: 3 },
    "\u1EE0": { base: "\u01A0", tone: 4 },
    "\u1EE2": { base: "\u01A0", tone: 5 },
    // u
    "u": { base: "u", tone: 0 },
    "\xFA": { base: "u", tone: 1 },
    "\xF9": { base: "u", tone: 2 },
    "\u1EE7": { base: "u", tone: 3 },
    "\u0169": { base: "u", tone: 4 },
    "\u1EE5": { base: "u", tone: 5 },
    "U": { base: "U", tone: 0 },
    "\xDA": { base: "U", tone: 1 },
    "\xD9": { base: "U", tone: 2 },
    "\u1EE6": { base: "U", tone: 3 },
    "\u0168": { base: "U", tone: 4 },
    "\u1EE4": { base: "U", tone: 5 },
    // ư
    "\u01B0": { base: "\u01B0", tone: 0 },
    "\u1EE9": { base: "\u01B0", tone: 1 },
    "\u1EEB": { base: "\u01B0", tone: 2 },
    "\u1EED": { base: "\u01B0", tone: 3 },
    "\u1EEF": { base: "\u01B0", tone: 4 },
    "\u1EF1": { base: "\u01B0", tone: 5 },
    "\u01AF": { base: "\u01AF", tone: 0 },
    "\u1EE8": { base: "\u01AF", tone: 1 },
    "\u1EEA": { base: "\u01AF", tone: 2 },
    "\u1EEC": { base: "\u01AF", tone: 3 },
    "\u1EEE": { base: "\u01AF", tone: 4 },
    "\u1EF0": { base: "\u01AF", tone: 5 },
    // y
    "y": { base: "y", tone: 0 },
    "\xFD": { base: "y", tone: 1 },
    "\u1EF3": { base: "y", tone: 2 },
    "\u1EF7": { base: "y", tone: 3 },
    "\u1EF9": { base: "y", tone: 4 },
    "\u1EF5": { base: "y", tone: 5 },
    "Y": { base: "Y", tone: 0 },
    "\xDD": { base: "Y", tone: 1 },
    "\u1EF2": { base: "Y", tone: 2 },
    "\u1EF6": { base: "Y", tone: 3 },
    "\u1EF8": { base: "Y", tone: 4 },
    "\u1EF4": { base: "Y", tone: 5 }
  };
  var VOWEL_COMPOSE_TABLE = {
    "a": ["a", "\xE1", "\xE0", "\u1EA3", "\xE3", "\u1EA1"],
    "A": ["A", "\xC1", "\xC0", "\u1EA2", "\xC3", "\u1EA0"],
    "\u0103": ["\u0103", "\u1EAF", "\u1EB1", "\u1EB3", "\u1EB5", "\u1EB7"],
    "\u0102": ["\u0102", "\u1EAE", "\u1EB0", "\u1EB2", "\u1EB4", "\u1EB6"],
    "\xE2": ["\xE2", "\u1EA5", "\u1EA7", "\u1EA9", "\u1EAB", "\u1EAD"],
    "\xC2": ["\xC2", "\u1EA4", "\u1EA6", "\u1EA8", "\u1EAA", "\u1EAC"],
    "e": ["e", "\xE9", "\xE8", "\u1EBB", "\u1EBD", "\u1EB9"],
    "E": ["E", "\xC9", "\xC8", "\u1EBA", "\u1EBC", "\u1EB8"],
    "\xEA": ["\xEA", "\u1EBF", "\u1EC1", "\u1EC3", "\u1EC5", "\u1EC7"],
    "\xCA": ["\xCA", "\u1EBE", "\u1EC0", "\u1EC2", "\u1EC4", "\u1EC6"],
    "i": ["i", "\xED", "\xEC", "\u1EC9", "\u0129", "\u1ECB"],
    "I": ["I", "\xCD", "\xCC", "\u1EC8", "\u0128", "\u1ECA"],
    "o": ["o", "\xF3", "\xF2", "\u1ECF", "\xF5", "\u1ECD"],
    "O": ["O", "\xD3", "\xD2", "\u1ECE", "\xD5", "\u1ECC"],
    "\xF4": ["\xF4", "\u1ED1", "\u1ED3", "\u1ED5", "\u1ED7", "\u1ED9"],
    "\xD4": ["\xD4", "\u1ED0", "\u1ED2", "\u1ED4", "\u1ED6", "\u1ED8"],
    "\u01A1": ["\u01A1", "\u1EDB", "\u1EDD", "\u1EDF", "\u1EE1", "\u1EE3"],
    "\u01A0": ["\u01A0", "\u1EDA", "\u1EDC", "\u1EDE", "\u1EE0", "\u1EE2"],
    "u": ["u", "\xFA", "\xF9", "\u1EE7", "\u0169", "\u1EE5"],
    "U": ["U", "\xDA", "\xD9", "\u1EE6", "\u0168", "\u1EE4"],
    "\u01B0": ["\u01B0", "\u1EE9", "\u1EEB", "\u1EED", "\u1EEF", "\u1EF1"],
    "\u01AF": ["\u01AF", "\u1EE8", "\u1EEA", "\u1EEC", "\u1EEE", "\u1EF0"],
    "y": ["y", "\xFD", "\u1EF3", "\u1EF7", "\u1EF9", "\u1EF5"],
    "Y": ["Y", "\xDD", "\u1EF2", "\u1EF6", "\u1EF8", "\u1EF4"]
  };
  var VALID_ONSETS = [
    // 3-char onsets
    "ngh",
    // 2-char onsets (traditional + ethnic / Central Highlands)
    "ch",
    "gh",
    "gi",
    "kh",
    "nh",
    "ng",
    "ph",
    "th",
    "tr",
    "qu",
    "kr",
    "pr",
    "dr",
    "\u0111r",
    "br",
    "kl",
    "pl",
    "bl",
    "dz",
    // 1-char onsets
    "b",
    "c",
    "d",
    "\u0111",
    "g",
    "h",
    "k",
    "l",
    "m",
    "n",
    "p",
    "r",
    "s",
    "t",
    "v",
    "x"
  ];
  var ParsedSyllable = class _ParsedSyllable {
    constructor(opts = {}) {
      this.onset = opts.onset || "";
      this.glide = opts.glide || "";
      this.nucleus = opts.nucleus || "";
      this.coda = opts.coda || "";
      this.tone = opts.tone || TONE_MARK.NONE;
      this.hasApostrophe = opts.hasApostrophe || false;
      this.apostrophePrefix = opts.apostrophePrefix || "";
    }
    /**
     * Reconstruct final syllable string according to toneStyle
     * @param {string} toneStyle TONE_STYLE.CLASSIC ('classic') or TONE_STYLE.MODERN ('modern')
     * @returns {string} Reconstructed Vietnamese syllable
     */
    reconstruct(toneStyle = TONE_STYLE.CLASSIC) {
      if (!this.nucleus) {
        return (this.apostrophePrefix || "") + this.onset + this.glide + this.coda;
      }
      const n = this.nucleus;
      const nLen = n.length;
      const hasCoda = this.coda.length > 0;
      const hasGlide = this.glide.length > 0;
      let targetIdx = 0;
      const isQu = this.onset.toLowerCase() === "q" && this.glide.toLowerCase() === "u";
      if (hasGlide && !hasCoda && nLen === 1 && !isQu) {
        if (toneStyle === TONE_STYLE.CLASSIC) {
          const glideChar = this.glide;
          const row = VOWEL_COMPOSE_TABLE[glideChar];
          const accentedGlide = this.tone > 0 && row ? row[this.tone] : glideChar;
          return (this.apostrophePrefix || "") + this.onset + accentedGlide + this.nucleus + this.coda;
        } else {
          targetIdx = 0;
        }
      } else if (nLen === 1) {
        targetIdx = 0;
      } else if (nLen === 2) {
        const lowerN = n.toLowerCase();
        if (lowerN === "\u01B0\u01A1" || lowerN === "i\xEA" || lowerN === "u\xF4" || lowerN === "y\xEA") {
          targetIdx = 1;
        } else if (lowerN === "\u01B0a" || lowerN === "ia" || lowerN === "ua") {
          targetIdx = hasCoda ? 1 : 0;
        } else if (["ai", "ao", "au", "ay", "\xE2u", "\xE2y", "eo", "\xEAu", "oi", "\xF4i", "\u01A1i", "ui", "yu"].includes(lowerN)) {
          targetIdx = 0;
        } else {
          if (hasCoda) {
            targetIdx = 1;
          } else {
            targetIdx = toneStyle === TONE_STYLE.CLASSIC ? 0 : 1;
          }
        }
      } else if (nLen >= 3) {
        targetIdx = 1;
      }
      let reconstructedNucleus = "";
      for (let i = 0; i < n.length; i++) {
        const ch = n[i];
        if (i === targetIdx && this.tone > 0) {
          const row = VOWEL_COMPOSE_TABLE[ch];
          reconstructedNucleus += row ? row[this.tone] : ch;
        } else {
          reconstructedNucleus += ch;
        }
      }
      return (this.apostrophePrefix || "") + this.onset + this.glide + reconstructedNucleus + this.coda;
    }
    /**
     * Clone with modified tone mark
     * @param {number} tone 
     * @returns {ParsedSyllable}
     */
    withTone(tone) {
      return new _ParsedSyllable({
        onset: this.onset,
        glide: this.glide,
        nucleus: this.nucleus,
        coda: this.coda,
        tone,
        hasApostrophe: this.hasApostrophe,
        apostrophePrefix: this.apostrophePrefix
      });
    }
    /**
     * Check if syllable conforms to Vietnamese orthography / phonology:
     * 1. Must have a valid vowel nucleus (cannot be consonant-only like 'fcitx', 'tmux').
     * 2. If word has letters before nucleus but no valid onset, it's a foreign cluster (e.g. 'fcitx').
     * 3. Coda must be a legitimate Vietnamese consonant coda (c, ch, m, n, ng, nh, p, t, k, l, r).
     * 4. Stop finals (-c, -ch, -p, -t, -k) can only take Tone 0, Tone 1 (sắc) or Tone 5 (nặng).
     * 5. Short vowels (ă, â) require a coda consonant.
     */
    isValid() {
      if (!this.nucleus) {
        return false;
      }
      const lowerVowels = (this.glide + this.nucleus).toLowerCase();
      if (/ơ[eaouêăâ]/i.test(lowerVowels)) {
        return false;
      }
      if (/ă[aeiouyăâêôơư]/i.test(lowerVowels)) {
        return false;
      }
      const lowerCoda = this.coda.toLowerCase();
      const VALID_CODAS = /* @__PURE__ */ new Set(["", "c", "ch", "m", "n", "ng", "nh", "p", "t", "k", "l", "r"]);
      if (!VALID_CODAS.has(lowerCoda)) {
        return false;
      }
      if (["c", "ch", "p", "t", "k"].includes(lowerCoda)) {
        if (this.tone !== TONE_MARK.NONE && this.tone !== TONE_MARK.ACUTE && this.tone !== TONE_MARK.DOT_BELOW) {
          return false;
        }
      }
      const lowerN = this.nucleus.toLowerCase();
      if ((lowerN === "\u0103" || lowerN === "\xE2") && this.coda.length === 0) {
        return false;
      }
      return true;
    }
  };
  function parseSyllable(rawWord) {
    if (!rawWord || typeof rawWord !== "string") return null;
    let word = rawWord.normalize("NFC");
    let apostrophePrefix = "";
    const apoMatch = word.match(/^([A-Za-z]['’])/);
    if (apoMatch) {
      apostrophePrefix = apoMatch[1];
      word = word.slice(apoMatch[1].length);
    }
    let foundTone = TONE_MARK.NONE;
    let baseWord = "";
    for (let i = 0; i < word.length; i++) {
      const ch = word[i];
      const dec = VOWEL_DECOMPOSE_MAP[ch];
      if (dec) {
        baseWord += dec.base;
        if (dec.tone > 0 && foundTone === TONE_MARK.NONE) {
          foundTone = dec.tone;
        }
      } else {
        baseWord += ch;
      }
    }
    const lowerBase = baseWord.toLowerCase();
    let onset = "";
    let rest = baseWord;
    let lowerRest = lowerBase;
    if (lowerRest.startsWith("qu")) {
      onset = baseWord.slice(0, 1);
      rest = baseWord.slice(1);
      lowerRest = lowerBase.slice(1);
    } else if (lowerRest.startsWith("gi")) {
      if (lowerRest.length > 2 && VOWEL_DECOMPOSE_MAP[lowerRest[2]]) {
        onset = baseWord.slice(0, 2);
        rest = baseWord.slice(2);
        lowerRest = lowerBase.slice(2);
      } else {
        onset = baseWord.slice(0, 1);
        rest = baseWord.slice(1);
        lowerRest = lowerBase.slice(1);
      }
    } else {
      for (const testOnset of VALID_ONSETS) {
        if (lowerRest.startsWith(testOnset)) {
          onset = baseWord.slice(0, testOnset.length);
          rest = baseWord.slice(testOnset.length);
          lowerRest = lowerBase.slice(testOnset.length);
          break;
        }
      }
    }
    let vowelCluster = "";
    let coda = "";
    let foundVowel = false;
    for (let i = 0; i < rest.length; i++) {
      const ch = rest[i];
      const isV = Boolean(VOWEL_DECOMPOSE_MAP[ch]);
      if (isV && coda.length === 0) {
        vowelCluster += ch;
        foundVowel = true;
      } else {
        coda += ch;
      }
    }
    let glide = "";
    let nucleus = vowelCluster;
    const lowerVowels = vowelCluster.toLowerCase();
    if (vowelCluster.length >= 2) {
      const firstV = lowerVowels[0];
      const secondV = lowerVowels[1];
      if (firstV === "o" && (secondV === "a" || secondV === "e" || secondV === "\u0103")) {
        glide = vowelCluster[0];
        nucleus = vowelCluster.slice(1);
      } else if (firstV === "u") {
        if (secondV === "\xE2" || secondV === "\xEA" || secondV === "\u01A1" || secondV === "y") {
          glide = vowelCluster[0];
          nucleus = vowelCluster.slice(1);
        } else if (secondV === "a" && coda.length > 0) {
          glide = vowelCluster[0];
          nucleus = vowelCluster.slice(1);
        }
      }
    }
    return new ParsedSyllable({
      onset,
      glide,
      nucleus,
      coda,
      tone: foundTone,
      hasApostrophe: Boolean(apostrophePrefix),
      apostrophePrefix
    });
  }

  // src/engine/dictionary.js
  var FOREIGN_INITIAL_CLUSTERS = /* @__PURE__ */ new Set([
    "pl",
    "fl",
    "cl",
    "gl",
    "bl",
    "sl",
    "pr",
    "dr",
    "cr",
    "br",
    "gr",
    "fr",
    "wr",
    "sp",
    "st",
    "sk",
    "sm",
    "sn",
    "sw",
    "tw",
    "dw",
    "spl",
    "spr",
    "str",
    "scr",
    "shr",
    "squ",
    "kn",
    "ps",
    "rh",
    "phl",
    "chr",
    "sch"
  ]);
  var COMMON_ENGLISH_WORDS = /* @__PURE__ */ new Set([
    // Telex trap: words ending with 's' (sắc)
    "as",
    "is",
    "us",
    "this",
    "yes",
    "bus",
    "plus",
    "has",
    "was",
    "its",
    "his",
    "less",
    "miss",
    "pass",
    "boss",
    "loss",
    "mass",
    "class",
    "glass",
    "press",
    "cross",
    "dress",
    "guess",
    "basis",
    "status",
    "focus",
    "virus",
    "bonus",
    "canvas",
    "chaos",
    "oasis",
    "crisis",
    "texas",
    "paris",
    "series",
    "species",
    "famous",
    "fcitx",
    "fcitx5",
    "versus",
    "alias",
    "radius",
    "minus",
    "genius",
    "census",
    "campus",
    "circus",
    "lotus",
    "chorus",
    "walrus",
    "corpus",
    "hiatus",
    "nexus",
    "news",
    "always",
    "sometimes",
    "perhaps",
    "business",
    "process",
    "access",
    "success",
    "address",
    "docs",
    "doc",
    // Telex trap: words with 'x' (ngã)
    "text",
    "next",
    "context",
    "exit",
    "taxi",
    "linux",
    "unix",
    "ajax",
    "max",
    "mix",
    "box",
    "fix",
    "tax",
    "six",
    "fax",
    "sex",
    "complex",
    "index",
    "matrix",
    "syntax",
    "luxury",
    "reflex",
    "prefix",
    "suffix",
    "annex",
    "latex",
    "duplex",
    "vertex",
    "convex",
    "cortex",
    "pixel",
    "toxic",
    "oxide",
    "oxygen",
    "galaxy",
    "maximum",
    "expert",
    "expect",
    "express",
    "explain",
    "explore",
    "export",
    "extent",
    "extra",
    "extreme",
    "exact",
    "exam",
    "example",
    "exist",
    "execute",
    "exercise",
    "exceed",
    "except",
    "excess",
    "exchange",
    "excite",
    "exclude",
    "excuse",
    "expand",
    "expend",
    "expense",
    "expire",
    // Telex trap: words with 'r' (hỏi)
    "for",
    "or",
    "our",
    "your",
    "her",
    "their",
    "other",
    "after",
    "under",
    "over",
    "never",
    "ever",
    "water",
    "paper",
    "order",
    "power",
    "user",
    "super",
    "server",
    "number",
    "member",
    "driver",
    "render",
    "router",
    "player",
    "master",
    "worker",
    "filter",
    "center",
    "letter",
    "matter",
    "better",
    "doctor",
    "factor",
    "sector",
    "vector",
    "senior",
    "junior",
    "error",
    "horror",
    "mirror",
    "sensor",
    "cursor",
    "armor",
    "harbor",
    "color",
    "flavor",
    "labor",
    "mayor",
    "prior",
    "vigor",
    "vapor",
    "favor",
    "clear",
    "near",
    "dear",
    "fear",
    "hear",
    "bear",
    "wear",
    "tear",
    "year",
    "gear",
    "rear",
    "pear",
    // Telex trap: words with 'w' (horn/breve: ơ, ư, ă)
    "we",
    "with",
    "work",
    "word",
    "world",
    "week",
    "write",
    "wrong",
    "window",
    "windows",
    "white",
    "what",
    "when",
    "where",
    "which",
    "while",
    "who",
    "why",
    "web",
    "way",
    "wait",
    "want",
    "well",
    "will",
    "would",
    "without",
    "within",
    "website",
    "wifi",
    "watch",
    "warm",
    "wall",
    "wave",
    "wide",
    "wife",
    "wild",
    "wind",
    "wine",
    "wing",
    "wire",
    "wise",
    "wish",
    "wood",
    "wool",
    "wrap",
    "warn",
    "wash",
    "waste",
    "west",
    "worth",
    "worthy",
    "wheel",
    "whale",
    "wheat",
    "whip",
    "whisper",
    // Telex trap: words with 'f' (huyền)
    "of",
    "if",
    "off",
    "life",
    "safe",
    "file",
    "find",
    "first",
    "from",
    "form",
    "fast",
    "fact",
    "face",
    "fail",
    "fair",
    "fall",
    "false",
    "farm",
    "feat",
    "feed",
    "feel",
    "feet",
    "fell",
    "felt",
    "few",
    "fill",
    "film",
    "fine",
    "fire",
    "firm",
    "fish",
    "fit",
    "five",
    "flat",
    "flight",
    "floor",
    "flow",
    "fly",
    "folk",
    "food",
    "foot",
    "force",
    "fork",
    "free",
    "friend",
    "front",
    "fruit",
    "full",
    "fund",
    "funny",
    "future",
    // Telex trap: words with 'j' (nặng)
    "job",
    "join",
    "joy",
    "jump",
    "just",
    "judge",
    "juice",
    "jury",
    "jail",
    "jar",
    "jaw",
    "jean",
    "jeep",
    "jelly",
    "jest",
    "jet",
    "jewel",
    "jig",
    "jinx",
    "jockey",
    "jog",
    "joke",
    "jolly",
    "jolt",
    "journal",
    "journey",
    "judo",
    "jug",
    "juggler",
    "juggle",
    "jumbo",
    "jumper",
    "junction",
    "jungle",
    "junior",
    "junk",
    "junkie",
    "jupiter",
    "juror",
    "justice",
    "justify",
    // Tech, Developer & Common Modern Words
    "api",
    "app",
    "blog",
    "browser",
    "bug",
    "build",
    "chat",
    "chrome",
    "click",
    "client",
    "cloud",
    "code",
    "commit",
    "component",
    "config",
    "console",
    "css",
    "data",
    "dev",
    "developer",
    "div",
    "docker",
    "dom",
    "download",
    "edge",
    "email",
    "export",
    "extension",
    "facebook",
    "figma",
    "firefox",
    "font",
    "form",
    "frontend",
    "git",
    "github",
    "gmail",
    "google",
    "host",
    "html",
    "http",
    "https",
    "icon",
    "id",
    "iframe",
    "image",
    "import",
    "input",
    "install",
    "internet",
    "issue",
    "javascript",
    "json",
    "key",
    "link",
    "linux",
    "load",
    "log",
    "macos",
    "meta",
    "modal",
    "module",
    "net",
    "network",
    "node",
    "npm",
    "offline",
    "online",
    "open",
    "package",
    "page",
    "password",
    "patch",
    "ping",
    "plugin",
    "post",
    "pull",
    "push",
    "python",
    "react",
    "repo",
    "request",
    "response",
    "router",
    "run",
    "safari",
    "save",
    "script",
    "server",
    "service",
    "setup",
    "site",
    "span",
    "sql",
    "ssh",
    "status",
    "style",
    "sync",
    "tab",
    "tag",
    "task",
    "test",
    "time",
    "token",
    "tool",
    "true",
    "false",
    "null",
    "undefined",
    "ui",
    "update",
    "upload",
    "url",
    "user",
    "version",
    "video",
    "view",
    "vite",
    "vscode",
    "webpack",
    "website",
    "zip",
    "tesla",
    "saas",
    "sax",
    "core",
    "care",
    "case",
    "cost",
    "hard",
    "screen",
    "system",
    "branch",
    "merge",
    "rebase",
    "clone",
    "fetch",
    "diff",
    "stash",
    "release",
    "deploy",
    "debug",
    "lint",
    "bundle",
    "minify",
    "source",
    "assets",
    "public",
    "dist",
    "node_modules",
    "license",
    "readme",
    "env",
    "yaml",
    "toml",
    "xml",
    "scss",
    "less",
    "ts",
    "jsx",
    "tsx",
    "sh",
    "kubernetes",
    "k8s",
    "tailwind",
    "typescript",
    "postgres",
    "postgresql",
    "redis",
    "graphql",
    "webhook",
    "endpoint",
    "devops",
    "staging",
    "production",
    "frontend",
    "backend",
    "microservice",
    "payload",
    "auth",
    "oauth",
    "middleware",
    "handler",
    "schema",
    "query",
    "mutation",
    "resolver",
    "prisma",
    "supabase",
    "nextjs",
    "nuxt",
    "vue",
    "angular",
    "svelte",
    "electron",
    "tauri",
    "rust",
    "cargo",
    "golang",
    "pnpm",
    "yarn",
    "bun",
    "deno",
    "eslint",
    "prettier",
    "vitest",
    "jest",
    "modern",
    "variable",
    "mixed",
    "lowercase",
    "uppercase",
    "lower",
    "upper",
    "power",
    "tower",
    "shower",
    "slower",
    "flower",
    "low",
    "flow",
    "show",
    "slow",
    "blow",
    "grow",
    "draw",
    "raw",
    "law",
    "saw",
    "few",
    "view",
    "tick",
    "backtick",
    "reset",
    "restore",
    "refactor",
    "list",
    "host",
    "suggest",
    "axis",
    "regex",
    "music",
    "amazon",
    "cause",
    "profile",
    "upstream",
    "settings",
    // General high frequency English words
    "the",
    "be",
    "to",
    "and",
    "a",
    "in",
    "that",
    "have",
    "i",
    "it",
    "not",
    "on",
    "he",
    "you",
    "do",
    "at",
    "but",
    "by",
    "they",
    "say",
    "she",
    "an",
    "my",
    "one",
    "all",
    "there",
    "so",
    "up",
    "out",
    "about",
    "get",
    "which",
    "go",
    "me",
    "when",
    "make",
    "can",
    "like",
    "no",
    "him",
    "know",
    "take",
    "people",
    "into",
    "good",
    "some",
    "could",
    "them",
    "see",
    "than",
    "then",
    "now",
    "look",
    "only",
    "come",
    "think",
    "also",
    "back",
    "use",
    "two",
    "how",
    "even",
    "new",
    "because",
    "any",
    "these",
    "give",
    "day",
    "most",
    "city",
    "center",
    "cell",
    "circle",
    "gift",
    "game",
    "great",
    "going",
    "gone",
    "group",
    "guide",
    "guest",
    "guard",
    "guy"
  ]);
  var DEFAULT_USER_WORDS = Array.from(COMMON_ENGLISH_WORDS).sort();
  function hasCkPhonologyViolation(word) {
    if (!word || word.length < 2) return false;
    const clean = word.toLowerCase();
    if (/^c[eèéẻẽẹêếềểễệiíìỉĩịyýỳỷỹỵ]/i.test(clean)) {
      return true;
    }
    return false;
  }
  function hasGghPhonologyViolation(word) {
    if (!word || word.length < 2) return false;
    const clean = word.toLowerCase();
    if (/(^|[^a-z0-9])g[eèéẻẽẹêếềểễệ]/i.test(clean)) {
      return true;
    }
    return false;
  }
  function hasNgPhonologyViolation(word) {
    if (!word || word.length < 3) return false;
    const clean = word.toLowerCase();
    if (/(^|[^a-z0-9])ng[eèéẻẽẹêếềểễệiíìỉĩị]/i.test(clean)) {
      return true;
    }
    return false;
  }
  function isCheckedToneViolation(word, targetTone) {
    if (!word || targetTone === void 0 || targetTone === null) return false;
    if (targetTone === 1 || targetTone === 5 || targetTone === 0) {
      return false;
    }
    const clean = word.toLowerCase();
    if (/(c|ch|p|t)$/i.test(clean)) {
      return true;
    }
    return false;
  }
  function hasPhonologyViolation(word) {
    if (!word) return false;
    return hasCkPhonologyViolation(word) || hasGghPhonologyViolation(word) || hasNgPhonologyViolation(word);
  }
  var ACCENT_TO_RAW_TELEX = {
    // Sắc (s)
    "\xE1": "as",
    "\u1EAF": "aws",
    "\u1EA5": "aas",
    "\xE9": "es",
    "\u1EBF": "ees",
    "\xED": "is",
    "\xF3": "os",
    "\u1ED1": "oos",
    "\u1EDB": "ows",
    "\xFA": "us",
    "\u1EE9": "uws",
    "\xFD": "ys",
    "\xC1": "As",
    "\u1EAE": "Aws",
    "\u1EA4": "Aas",
    "\xC9": "Es",
    "\u1EBE": "Ees",
    "\xCD": "Is",
    "\xD3": "Os",
    "\u1ED0": "Oos",
    "\u1EDA": "Ows",
    "\xDA": "Us",
    "\u1EE8": "Uws",
    "\xDD": "Ys",
    // Huyền (f)
    "\xE0": "af",
    "\u1EB1": "awf",
    "\u1EA7": "aaf",
    "\xE8": "ef",
    "\u1EC1": "eef",
    "\xEC": "if",
    "\xF2": "of",
    "\u1ED3": "oof",
    "\u1EDD": "owf",
    "\xF9": "uf",
    "\u1EEB": "uwf",
    "\u1EF3": "yf",
    "\xC0": "Af",
    "\u1EB0": "Awf",
    "\u1EA6": "Aaf",
    "\xC8": "Ef",
    "\u1EC0": "Eef",
    "\xCC": "If",
    "\xD2": "Of",
    "\u1ED2": "Oof",
    "\u1EDC": "Owf",
    "\xD9": "Uf",
    "\u1EEA": "Uwf",
    "\u1EF2": "Yf",
    // Hỏi (r)
    "\u1EA3": "ar",
    "\u1EB3": "awr",
    "\u1EA9": "aar",
    "\u1EBB": "er",
    "\u1EC3": "eer",
    "\u1EC9": "ir",
    "\u1ECF": "or",
    "\u1ED5": "oor",
    "\u1EDF": "owr",
    "\u1EE7": "ur",
    "\u1EED": "uwr",
    "\u1EF7": "yr",
    "\u1EA2": "Ar",
    "\u1EB2": "Awr",
    "\u1EA8": "Aar",
    "\u1EBA": "Er",
    "\u1EC2": "Eer",
    "\u1EC8": "Ir",
    "\u1ECE": "Or",
    "\u1ED4": "Oor",
    "\u1EDE": "Owr",
    "\u1EE6": "Ur",
    "\u1EEC": "Uwr",
    "\u1EF6": "Yr",
    // Ngã (x)
    "\xE3": "ax",
    "\u1EB5": "awx",
    "\u1EAB": "aax",
    "\u1EBD": "ex",
    "\u1EC5": "eex",
    "\u0129": "ix",
    "\xF5": "ox",
    "\u1ED7": "oox",
    "\u1EE1": "owx",
    "\u0169": "ux",
    "\u1EEF": "uwx",
    "\u1EF9": "yx",
    "\xC3": "Ax",
    "\u1EB4": "Awx",
    "\u1EAA": "Aax",
    "\u1EBC": "Ex",
    "\u1EC4": "Eex",
    "\u0128": "Ix",
    "\xD5": "Ox",
    "\u1ED6": "Oox",
    "\u1EE0": "Owx",
    "\u0168": "Ux",
    "\u1EEE": "Uwx",
    "\u1EF8": "Yx",
    // Nặng (j)
    "\u1EA1": "aj",
    "\u1EB7": "awj",
    "\u1EAD": "aaj",
    "\u1EB9": "ej",
    "\u1EC7": "eej",
    "\u1ECB": "ij",
    "\u1ECD": "oj",
    "\u1ED9": "ooj",
    "\u1EE3": "owj",
    "\u1EE5": "uj",
    "\u1EF1": "uwj",
    "\u1EF5": "yj",
    "\u1EA0": "Aj",
    "\u1EB6": "Awj",
    "\u1EAC": "Aaj",
    "\u1EB8": "Ej",
    "\u1EC6": "Eej",
    "\u1ECA": "Ij",
    "\u1ECC": "Oj",
    "\u1ED8": "Ooj",
    "\u1EE2": "Owj",
    "\u1EE4": "Uj",
    "\u1EF0": "Uwj",
    "\u1EF4": "Yj",
    // Shapes without tone
    "\xE2": "aa",
    "\xC2": "Aa",
    "\u0103": "aw",
    "\u0102": "Aw",
    "\xEA": "ee",
    "\xCA": "Ee",
    "\xF4": "oo",
    "\xD4": "Oo",
    "\u01A1": "ow",
    "\u01A0": "Ow",
    "\u01B0": "uw",
    "\u01AF": "Uw",
    "\u0111": "dd",
    "\u0110": "Dd"
  };
  function matchCasing(source, target) {
    if (!source || !target) return target || "";
    const isAllUpper = source.length > 1 && source === source.toUpperCase() && source !== source.toLowerCase();
    if (isAllUpper) {
      return target.toUpperCase();
    }
    if (source.length === target.length && /[a-z]/.test(source) && /[A-Z]/.test(source.slice(1))) {
      return target.split("").map((ch, i) => {
        const s = source.charAt(i);
        return s === s.toUpperCase() && s !== s.toLowerCase() ? ch.toUpperCase() : ch.toLowerCase();
      }).join("");
    }
    const firstChar = source.charAt(0);
    const isFirstUpper = firstChar === firstChar.toUpperCase() && firstChar !== firstChar.toLowerCase();
    if (isFirstUpper) {
      return target.charAt(0).toUpperCase() + target.slice(1);
    }
    if (/[a-z][A-Z]/.test(target) || /[a-z][A-Z]/.test(source)) {
      return target;
    }
    return target.toLowerCase();
  }
  function reverseVietnameseWord(word) {
    if (!word) return "";
    const clean = word.toLowerCase();
    const DIRECT_REVERSE_TRAPS = {
      "aets": "assets",
      "amo": "armor",
      "a\u0111ress": "address",
      "bl\u01A1": "blow",
      "br\u01A1ser": "browser",
      "buines": "business",
      "ca\xFAe": "cause",
      "ch\xE1o": "chaos",
      "ch\u1ECFus": "chorus",
      "c\xE0e": "care",
      "c\xE1e": "case",
      "c\xF2e": "core",
      "c\xF2nig": "config",
      "c\xFAor": "cursor",
      "c\u1EA3e": "care",
      "c\u1EA3go": "cargo",
      "c\u1ECFe": "core",
      "c\u1ECFpus": "corpus",
      "c\u1ECFtex": "cortex",
      "d\xEDt": "dist",
      "d\xF3c": "docs",
      "d\xF4nlad": "download",
      "\u0111r\u0103": "draw",
      "e\xE3m": "exam",
      "e\xE3mple": "example",
      "faceb\xF4k": "facebook",
      "fl\xF4r": "floor",
      "fl\u01A1": "flow",
      "fl\u1EDFe": "flower",
      "fr\xEA": "free",
      "f\xEA": "few",
      "f\xEAd": "feed",
      "f\xEAl": "feel",
      "f\xEAt": "feet",
      "f\xF4d": "food",
      "f\xF4t": "foot",
      "g\xECt": "gift",
      "g\xF4d": "good",
      "g\xF4gle": "google",
      "gr\u01A1": "grow",
      "habo": "harbor",
      "h\u1EA3d": "hard",
      "h\u01A1": "how",
      "iue": "issue",
      "i\u1EA3me": "iframe",
      "j\xEAp": "jeep",
      "j\u0103": "jaw",
      "kn\u01A1": "know",
      "l\xECe": "life",
      "l\xEDt": "list",
      "l\xF4k": "look",
      "l\u01A1": "low",
      "l\u1EDFe": "lower",
      "l\u01A1er": "lower",
      "l\u1EDFecase": "lowercase",
      "l\u01A1ercase": "lowercase",
      "l\u0103": "law",
      "l\u0169ury": "luxury",
      "l\u1EE7uy": "luxury",
      "mior": "mirror",
      "mi\u0111leware": "middleware",
      "mod\u1EBBn": "modern",
      "m\xE1ter": "master",
      "m\xE3imum": "maximum",
      "m\xFAic": "music",
      "m\u1EBBge": "merge",
      "m\u0129ed": "mixed",
      "n\xEA": "new",
      "n\u01A1": "now",
      "ode": "order",
      "oline": "offline",
      "\u1ECF": "or",
      "p\xFAh": "push",
      "p\u0103ssord": "password",
      "p\u01A1er": "power",
      "p\u1EDFe": "power",
      "p\u1EDFer": "power",
      "p\u1EDFeful": "powerful",
      "p\u1EBBpct": "perfect",
      "qu\u1EBBy": "query",
      "repone": "response",
      "r\xE8actor": "refactor",
      "r\xE8lex": "reflex",
      "r\xE9olver": "resolver",
      "r\xE9tore": "restore",
      // 'rết': 'reset',
      "r\u0103": "raw",
      "scr\xEAn": "screen",
      "seve": "server",
      "se\u1EC9es": "series",
      "sh\u01A1": "show",
      "sh\u1EDFe": "shower",
      "sl\u01A1": "slow",
      "sl\u1EDFe": "slower",
      "suix": "suffix",
      "s\xE0": "saas",
      "s\xE0e": "safe",
      "s\xE2s": "saas",
      "s\xE3": "sax",
      "s\u0103": "saw",
      "s\u1EA7ri": "safari",
      "s\u1EBBach": "search",
      "s\u1EBBvice": "service",
      "t\xE1k": "task",
      "t\xE9la": "tesla",
      // 'tét': 'test',
      "t\xEAt": "text",
      "t\xF4l": "tool",
      "t\u0103ilind": "tailwind",
      "t\u01A1er": "tower",
      "t\u1EDFe": "tower",
      "t\u01B0o": "two",
      "t\u1EBBla": "tesla",
      "t\u1EBDas": "texas",
      "t\u1EBDt": "text",
      "u\xE9r": "user",
      "u\xE9tate": "usestate",
      "upp\u1EBB": "upper",
      "upp\u1EBBcase": "uppercase",
      "va\u1EC9able": "variable",
      "v\u1EA3iable": "variable",
      "veu": "versus",
      "ve\xEDon": "version",
      "v\u1EBBtex": "vertex",
      "vi\xEA": "view",
      "webh\xF4k": "webhook",
      "wh\xEAl": "wheel",
      "wind\u01A1": "window",
      "wind\u01A1s": "windows",
      "w\xEAk": "week",
      "w\xF4d": "wood",
      "w\xF4l": "wool",
      "\xE0ter": "after",
      "\xE1i": "axis",
      "\xE2lys": "always",
      "\xE2mzon": "amazon",
      "\xE9lint": "eslint",
      "\xEApct": "expect",
      "\xEDntall": "install",
      "\xF5ide": "oxide",
      "\xF5ygen": "oxygen",
      "\xFAe": "use",
      "\xFAer": "user",
      "u\u1EBB": "user",
      "\xFAptream": "upstream",
      "\xFA\u1EBB": "user",
      "\u01B0indo\u01B0": "window",
      "\u01B0ork": "work",
      "\u1EADx": "ajax",
      "\u1EBDact": "exact",
      "\u1EBDcept": "except",
      "\u1EBDcess": "excess",
      "\u1EBDchange": "exchange",
      "\u1EBDcite": "excite",
      "\u1EBDclude": "exclude",
      "\u1EBDcuse": "excuse",
      "\u1EBDc\xEAd": "exceed",
      "\u1EBDist": "exist",
      "\u1EBDit": "exit",
      "\u1EBDpand": "expand",
      "\u1EBDpect": "expect",
      "\u1EBDpend": "expend",
      "\u1EBDpense": "expense",
      "\u1EBDpert": "expert",
      "\u1EBDpire": "expire",
      "\u1EBDplain": "explain",
      "\u1EBDplore": "explore",
      "\u1EBDport": "export",
      "\u1EBDpress": "express",
      "\u1EBDtension": "extension",
      "\u1EBDtnsion": "extension",
      "\u1EC5tension": "extension",
      "\u1EC5tnsion": "extension",
      "\u1EBDtend": "extend",
      "\u1EBDtnd": "extend",
      "\u1EC5tend": "extend",
      "\u1EC5tnd": "extend",
      "\u1EBDternal": "external",
      "\u1EBDtrnal": "external",
      "\u1EC5ternal": "external",
      "\u1EC5trnal": "external",
      "\u1EBDtent": "extent",
      "\u1EBDtra": "extra",
      "\u1EBDtreme": "extreme",
      "\u1EC3cise": "exercise",
      "\u1EC5cute": "execute",
      "\u1EE7l": "url"
    };
    if (DIRECT_REVERSE_TRAPS[clean]) {
      const mapped = DIRECT_REVERSE_TRAPS[clean];
      return matchCasing(word, mapped);
    }
    let workingWord = word;
    if (/[ơởớờỡợ]e/i.test(workingWord)) {
      workingWord = workingWord.replace(/ởe/g, "ower").replace(/ớe/g, "owes").replace(/ờe/g, "owef").replace(/ỡe/g, "owex").replace(/ợe/g, "owej").replace(/ơe/g, "owe").replace(/Ởe/g, "Ower").replace(/Ớe/g, "Owes").replace(/Ờe/g, "Owef").replace(/Ỡe/g, "Owex").replace(/Ợe/g, "Owej").replace(/Ơe/g, "Owe");
    }
    if (!/[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i.test(workingWord)) {
      return matchCasing(word, workingWord);
    }
    let result = "";
    for (let i = 0; i < workingWord.length; i++) {
      const ch = workingWord[i];
      if (ACCENT_TO_RAW_TELEX[ch]) {
        result += ACCENT_TO_RAW_TELEX[ch];
      } else {
        result += ch;
      }
    }
    return result;
  }
  var ENGLISH_TELEX_TRAPS = /* @__PURE__ */ new Set([
    "text",
    "next",
    "context",
    "exit",
    "user",
    "super",
    "server",
    "router",
    "player",
    "master",
    "worker",
    "filter",
    "center",
    "letter",
    "matter",
    "better",
    "doctor",
    "factor",
    "sector",
    "vector",
    "error",
    "horror",
    "mirror",
    "sensor",
    "cursor",
    "push",
    "expect",
    "luxury",
    "window",
    "windows",
    "work",
    "word",
    "world",
    "tesla",
    "screen",
    "saas",
    "ajax",
    "duplex",
    "complex",
    "index",
    "matrix",
    "syntax",
    "prefix",
    "suffix",
    "annex",
    "latex",
    "reflex",
    "pixel",
    "toxic",
    "oxide",
    "oxygen",
    "galaxy",
    "expert",
    "express",
    "explain",
    "explore",
    "export",
    "extra",
    "extreme",
    "exact",
    "exam",
    "example",
    "exist",
    "execute",
    "exercise",
    "except",
    "excess",
    "exchange",
    "expand",
    "expense",
    "perfect",
    "docs",
    "modern",
    "variable",
    "backtick",
    "restore",
    "refactor",
    "query",
    "mixed",
    "lowercase",
    "uppercase",
    "lower",
    "upper",
    "power",
    "tower",
    "flower",
    "shower",
    "slower",
    "flow",
    "show",
    "slow",
    "blow",
    "grow",
    "draw",
    "raw",
    "law",
    "saw",
    "few",
    "view"
  ]);
  function shouldAutoRestoreEnglish(rawWord, currentWord) {
    if (!rawWord && !currentWord) return false;
    const curClean = (currentWord || "").trim().toLowerCase();
    let rawClean = (rawWord || "").trim().toLowerCase();
    if ((!rawClean || rawClean.length < curClean.length) && currentWord) {
      const reversed2 = reverseVietnameseWord(currentWord);
      if (reversed2) {
        rawClean = reversed2.toLowerCase();
      }
    }
    if (rawClean === curClean && /^[a-z0-9]+$/i.test(curClean)) {
      return false;
    }
    if (/^[a-zA-Z]+$/.test(curClean) && (COMMON_ENGLISH_WORDS.has(curClean) || userDictionary.has(curClean))) {
      return false;
    }
    if (/\d/.test(rawClean)) {
      return false;
    }
    if (curClean.length <= 1 || rawClean.length < 3) {
      return false;
    }
    const vnSet = getVietnameseWordSet();
    if (vnSet.has(curClean)) {
      if (rawClean && ENGLISH_TELEX_TRAPS.has(rawClean)) {
        return true;
      }
      return false;
    }
    if (rawClean && (COMMON_ENGLISH_WORDS.has(rawClean) || userDictionary.has(rawClean))) {
      return true;
    }
    const reversed = reverseVietnameseWord(currentWord).toLowerCase();
    if (reversed && reversed.length >= 3 && (COMMON_ENGLISH_WORDS.has(reversed) || userDictionary.has(reversed)) && !/\d/.test(reversed)) {
      return true;
    }
    return false;
  }
  function hasForeignOnset(word) {
    if (!word || word.length < 2) return false;
    const clean = word.toLowerCase();
    if (clean.length >= 3) {
      const c3 = clean.slice(0, 3);
      if (FOREIGN_INITIAL_CLUSTERS.has(c3)) return true;
    }
    const c2 = clean.slice(0, 2);
    if (FOREIGN_INITIAL_CLUSTERS.has(c2)) return true;
    return false;
  }
  var UserDictionary = class {
    constructor(initialWords = DEFAULT_USER_WORDS) {
      this.words = /* @__PURE__ */ new Set();
      this.loadWords(initialWords);
    }
    loadWords(wordsList) {
      if (Array.isArray(wordsList)) {
        wordsList.forEach((w) => {
          const clean = canon(w);
          if (clean) this.words.add(clean);
        });
      }
    }
    has(word) {
      if (!word) return false;
      return this.words.has(canon(word));
    }
    add(word) {
      const clean = canon(word);
      if (!clean) return false;
      this.words.add(clean);
      this.saveToStorage();
      return true;
    }
    remove(word) {
      const clean = canon(word);
      if (!clean) return false;
      const deleted = this.words.delete(clean);
      if (deleted) this.saveToStorage();
      return deleted;
    }
    clear() {
      this.words.clear();
      this.saveToStorage();
    }
    getWords() {
      return Array.from(this.words).sort();
    }
    count() {
      return this.words.size;
    }
    /**
     * Import from text (line by line or comma-separated or JSON)
     */
    importText(text) {
      if (!text || typeof text !== "string") return 0;
      let addedCount = 0;
      const raw = text.trim();
      if (raw.startsWith("[") || raw.startsWith("{")) {
        try {
          const parsed = JSON.parse(raw);
          const list = Array.isArray(parsed) ? parsed : Object.keys(parsed);
          list.forEach((w) => {
            if (this.add(String(w))) addedCount++;
          });
          return addedCount;
        } catch {
        }
      }
      const lines = raw.split(/[\r\n,;]+/);
      lines.forEach((l) => {
        const w = l.trim().toLowerCase();
        if (w && !this.words.has(w)) {
          this.words.add(w);
          addedCount++;
        }
      });
      if (addedCount > 0) {
        this.saveToStorage();
      }
      return addedCount;
    }
    /**
     * Export to plain text or JSON
     */
    exportText(format = "txt") {
      const list = this.getWords();
      if (format === "json") {
        return JSON.stringify(list, null, 2);
      }
      return list.join("\n");
    }
    /**
     * Persistence with chrome.storage.sync or localStorage
     */
    async saveToStorage() {
      const list = this.getWords();
      try {
        if (typeof localStorage !== "undefined") {
          localStorage.setItem("avim_user_dictionary", JSON.stringify(list));
        }
        const storageSync = typeof browser !== "undefined" && browser.storage && browser.storage.sync ? browser.storage.sync : typeof chrome !== "undefined" && chrome.storage && chrome.storage.sync ? chrome.storage.sync : null;
        if (storageSync) {
          await new Promise((resolve) => {
            try {
              const p = storageSync.set({ avim_user_dictionary: list }, () => resolve());
              if (p && typeof p.then === "function") p.then(resolve).catch(resolve);
            } catch {
              resolve();
            }
          });
        }
      } catch (err) {
        console.warn("Could not save user dictionary:", err);
      }
    }
    async loadFromStorage() {
      try {
        const storageSync = typeof browser !== "undefined" && browser.storage && browser.storage.sync ? browser.storage.sync : typeof chrome !== "undefined" && chrome.storage && chrome.storage.sync ? chrome.storage.sync : null;
        if (storageSync) {
          const res = await new Promise((resolve) => {
            try {
              const p = storageSync.get(["avim_user_dictionary"], (r) => resolve(r || {}));
              if (p && typeof p.then === "function") p.then(resolve).catch(() => resolve({}));
            } catch {
              resolve({});
            }
          });
          if (Array.isArray(res.avim_user_dictionary) && res.avim_user_dictionary.length > 0) {
            this.loadWords(res.avim_user_dictionary);
            return;
          }
        }
        if (typeof localStorage !== "undefined") {
          const saved = localStorage.getItem("avim_user_dictionary");
          if (saved) {
            const list = JSON.parse(saved);
            if (Array.isArray(list)) {
              this.loadWords(list);
            }
          }
        }
      } catch (err) {
        console.warn("Could not load user dictionary:", err);
      }
    }
  };
  var userDictionary = new UserDictionary();
  function checkWordSpelling(word) {
    if (!word) return true;
    const clean = canon(word.trim());
    if (userDictionary.has(clean)) {
      return true;
    }
    if (word.length >= 2 && word === word.toUpperCase() && /[Đđ]/.test(word)) {
      return true;
    }
    const vnSet = getVietnameseWordSet();
    if (vnSet.has(clean)) {
      return true;
    }
    if (/^[a-z0-9']+$/i.test(clean)) {
      return true;
    }
    return false;
  }

  // src/engine/avim.js
  var VOWEL_TABLE = {
    // Plain
    "a": ["a", "\xE1", "\xE0", "\u1EA3", "\xE3", "\u1EA1"],
    "\u0103": ["\u0103", "\u1EAF", "\u1EB1", "\u1EB3", "\u1EB5", "\u1EB7"],
    "\xE2": ["\xE2", "\u1EA5", "\u1EA7", "\u1EA9", "\u1EAB", "\u1EAD"],
    "e": ["e", "\xE9", "\xE8", "\u1EBB", "\u1EBD", "\u1EB9"],
    "\xEA": ["\xEA", "\u1EBF", "\u1EC1", "\u1EC3", "\u1EC5", "\u1EC7"],
    "i": ["i", "\xED", "\xEC", "\u1EC9", "\u0129", "\u1ECB"],
    "o": ["o", "\xF3", "\xF2", "\u1ECF", "\xF5", "\u1ECD"],
    "\xF4": ["\xF4", "\u1ED1", "\u1ED3", "\u1ED5", "\u1ED7", "\u1ED9"],
    "\u01A1": ["\u01A1", "\u1EDB", "\u1EDD", "\u1EDF", "\u1EE1", "\u1EE3"],
    "u": ["u", "\xFA", "\xF9", "\u1EE7", "\u0169", "\u1EE5"],
    "\u01B0": ["\u01B0", "\u1EE9", "\u1EEB", "\u1EED", "\u1EEF", "\u1EF1"],
    "y": ["y", "\xFD", "\u1EF3", "\u1EF7", "\u1EF9", "\u1EF5"],
    // Uppercase
    "A": ["A", "\xC1", "\xC0", "\u1EA2", "\xC3", "\u1EA0"],
    "\u0102": ["\u0102", "\u1EAE", "\u1EB0", "\u1EB2", "\u1EB4", "\u1EB6"],
    "\xC2": ["\xC2", "\u1EA4", "\u1EA6", "\u1EA8", "\u1EAA", "\u1EAC"],
    "E": ["E", "\xC9", "\xC8", "\u1EBA", "\u1EBC", "\u1EB8"],
    "\xCA": ["\xCA", "\u1EBE", "\u1EC0", "\u1EC2", "\u1EC4", "\u1EC6"],
    "I": ["I", "\xCD", "\xCC", "\u1EC8", "\u0128", "\u1ECA"],
    "O": ["O", "\xD3", "\xD2", "\u1ECE", "\xD5", "\u1ECC"],
    "\xD4": ["\xD4", "\u1ED0", "\u1ED2", "\u1ED4", "\u1ED6", "\u1ED8"],
    "\u01A0": ["\u01A0", "\u1EDA", "\u1EDC", "\u1EDE", "\u1EE0", "\u1EE2"],
    "U": ["U", "\xDA", "\xD9", "\u1EE6", "\u0168", "\u1EE4"],
    "\u01AF": ["\u01AF", "\u1EE8", "\u1EEA", "\u1EEC", "\u1EEE", "\u1EF0"],
    "Y": ["Y", "\xDD", "\u1EF2", "\u1EF6", "\u1EF8", "\u1EF4"]
  };
  var CHAR_TO_BASE_AND_TONE = {};
  Object.entries(VOWEL_TABLE).forEach(([base, tones]) => {
    tones.forEach((char, toneIdx) => {
      CHAR_TO_BASE_AND_TONE[char] = { base, tone: toneIdx };
    });
  });
  var SHAPE_MAP = {
    // Base -> [circumflex, horn/breve]
    "a": { circumflex: "\xE2", breve: "\u0103" },
    "A": { circumflex: "\xC2", breve: "\u0102" },
    "\xE2": { circumflex: "a", breve: "\u0103" },
    "\xC2": { circumflex: "A", breve: "\u0102" },
    "\u0103": { circumflex: "\xE2", breve: "a" },
    "\u0102": { circumflex: "\xC2", breve: "a" },
    "e": { circumflex: "\xEA" },
    "E": { circumflex: "\xCA" },
    "\xEA": { circumflex: "e" },
    "\xCA": { circumflex: "E" },
    "o": { circumflex: "\xF4", horn: "\u01A1" },
    "O": { circumflex: "\xD4", horn: "\u01A0" },
    "\xF4": { circumflex: "o", horn: "\u01A1" },
    "\xD4": { circumflex: "O", horn: "\u01A0" },
    "\u01A1": { circumflex: "\xF4", horn: "o" },
    "\u01A0": { circumflex: "\xD4", horn: "O" },
    "u": { horn: "\u01B0" },
    "U": { horn: "\u01AF" },
    "\u01B0": { horn: "u" },
    "\u01AF": { horn: "U" }
  };
  var AvimEngine = class {
    constructor(options = {}) {
      this.method = options.method ?? IME_METHOD.VNI;
      this.toneStyle = options.toneStyle ?? TONE_STYLE.CLASSIC;
      this.spellCheck = options.spellCheck ?? true;
      this.autoRestore = options.autoRestore ?? true;
      this.quickConsonants = options.quickConsonants ?? false;
      this.quickTelex = options.quickTelex ?? true;
      this.autoRestoreEnglish = options.autoRestoreEnglish ?? true;
      this.escRevert = options.escRevert ?? true;
      this.phonologyRules = options.phonologyRules ?? true;
      this.currentWordRaw = "";
      this.lastTransformed = "";
      this.lastToneToggledWord = null;
    }
    setMethod(method) {
      this.method = method;
    }
    setToneStyle(toneStyle) {
      this.toneStyle = toneStyle;
    }
    setSpellCheck(enabled) {
      this.spellCheck = enabled;
    }
    setQuickConsonants(enabled) {
      this.quickConsonants = Boolean(enabled);
    }
    setQuickTelex(enabled) {
      this.quickTelex = Boolean(enabled);
    }
    setAutoRestoreEnglish(enabled) {
      this.autoRestoreEnglish = Boolean(enabled);
    }
    setEscRevert(enabled) {
      this.escRevert = Boolean(enabled);
    }
    setPhonologyRules(enabled) {
      this.phonologyRules = Boolean(enabled);
    }
    trackRawKey(key) {
      if (key && key.length === 1) {
        this.currentWordRaw += key;
      }
    }
    resetWordSession() {
      this.currentWordRaw = "";
      this.lastTransformed = "";
      this.lastToneToggledWord = null;
    }
    /**
     * Revert current word buffer back to raw keystrokes (Instant ESC Revert - GoNhanh)
     * @param {string} currentWord
     * @returns {{ reverted: boolean, result: string }}
     */
    revertCurrentWord(currentWord) {
      if (!this.escRevert) {
        return { reverted: false, result: currentWord || "" };
      }
      if (!currentWord && !this.currentWordRaw) {
        return { reverted: false, result: currentWord || "" };
      }
      const raw = this.currentWordRaw || reverseVietnameseWord(currentWord);
      if (raw && raw !== currentWord) {
        this.resetWordSession();
        return { reverted: true, result: matchCasing(currentWord, raw) };
      }
      const reversed = reverseVietnameseWord(currentWord);
      if (reversed && reversed !== currentWord) {
        this.resetWordSession();
        return { reverted: true, result: matchCasing(currentWord, reversed) };
      }
      return { reverted: false, result: currentWord };
    }
    /**
     * Check if current word should be auto-restored to English (GoNhanh Auto-Restore)
     * on Space, Enter, or word delimiter
     * @param {string} currentWord
     * @returns {{ restore: boolean, result: string }}
     */
    checkAutoRestore(currentWord) {
      if (!this.autoRestoreEnglish) {
        return { restore: false, result: currentWord };
      }
      if (this.method === IME_METHOD.VNI) {
        this.resetWordSession();
        return { restore: false, result: currentWord };
      }
      if (!currentWord || currentWord.length <= 1) {
        this.resetWordSession();
        return { restore: false, result: currentWord };
      }
      const curLower = currentWord.toLowerCase();
      if (/^[a-zA-Z]+$/.test(currentWord) && (COMMON_ENGLISH_WORDS.has(curLower) || userDictionary.has(curLower))) {
        this.resetWordSession();
        return { restore: false, result: currentWord };
      }
      const raw = this.currentWordRaw;
      if (raw && /\d/.test(raw)) {
        this.resetWordSession();
        return { restore: false, result: currentWord };
      }
      if (shouldAutoRestoreEnglish(raw, currentWord)) {
        const rawLower = (raw || "").toLowerCase();
        let restored = "";
        if (raw && !/\d/.test(raw) && (COMMON_ENGLISH_WORDS.has(rawLower) || userDictionary.has(rawLower))) {
          restored = raw;
        } else {
          restored = reverseVietnameseWord(currentWord) || raw || currentWord;
        }
        restored = matchCasing(currentWord, restored);
        this.resetWordSession();
        return { restore: true, result: restored };
      }
      if (currentWord.length >= 2 && !getVietnameseWordSet().has(currentWord.toLowerCase())) {
        let reversed = reverseVietnameseWord(currentWord);
        if (reversed && reversed.length >= 3 && !/\d/.test(reversed) && reversed.toLowerCase() !== currentWord.toLowerCase() && (COMMON_ENGLISH_WORDS.has(reversed.toLowerCase()) || userDictionary.has(reversed.toLowerCase()))) {
          reversed = matchCasing(currentWord, reversed);
          this.resetWordSession();
          return { restore: true, result: reversed };
        }
      }
      return { restore: false, result: currentWord };
    }
    /**
     * Adaptive input method (from XKey vAdaptiveEnabled):
     * When AUTO is selected, digits route to VNI, and letter keys route to Telex.
     */
    getEffectiveMethod(key) {
      if (this.method === IME_METHOD.AUTO) {
        return /^[0-9]$/.test(key) ? IME_METHOD.VNI : IME_METHOD.TELEX;
      }
      return this.method;
    }
    /**
     * Process a key event in the context of the current word
     * @param {string} word Current word buffer before the key
     * @param {string} key Incoming key pressed (e.g. 's', 'w', '1')
     * @returns {{ transformed: boolean, result: string, originalWord?: string }}
     */
    processKey(word, key) {
      if (this.method === IME_METHOD.OFF) {
        return { transformed: false, result: word + key };
      }
      if (!key || key.length !== 1) {
        return { transformed: false, result: word + key };
      }
      if (word && !/^[A-Za-z][\x27\u2019]/.test(word)) {
        const pMatch = word.match(/^([\x22\x27\u2018\u2019\u201C\u201D\u00AB\u00BB\u2039\u203A\u201E\u201A]+)/);
        const sMatch = word.match(/([\x22\x27\u2018\u2019\u201C\u201D\u00AB\u00BB\u2039\u203A\u201E\u201A]+)$/);
        if (pMatch || sMatch) {
          let quotePrefix = pMatch ? pMatch[1] : "";
          let cleanWord = quotePrefix ? word.slice(quotePrefix.length) : word;
          let quoteSuffix = "";
          if (sMatch && cleanWord.length > 0) {
            const sMatch2 = cleanWord.match(/([\x22\x27\u2018\u2019\u201C\u201D\u00AB\u00BB\u2039\u203A\u201E\u201A]+)$/);
            if (sMatch2) {
              quoteSuffix = sMatch2[1];
              cleanWord = cleanWord.slice(0, -quoteSuffix.length);
            }
          }
          const innerRes = this.processKey(cleanWord, key);
          const wrappedResult = quotePrefix + innerRes.result + quoteSuffix;
          this.lastTransformed = wrappedResult;
          return {
            transformed: innerRes.transformed,
            result: wrappedResult
          };
        }
      }
      if (/\d/.test(word) || word.includes("_") || word.includes("@") || word.includes("/")) {
        const newWord2 = word + key;
        this.lastTransformed = newWord2;
        return { transformed: false, result: newWord2 };
      }
      const isUpperKey = key === key.toUpperCase() && key !== key.toLowerCase();
      if (word.length >= 1 && isUpperKey) {
        if (isCamelOrPascalCase(word + key)) {
          const cleanPrefix = reverseVietnameseWord(word) || word;
          if (/^[a-zA-Z]+$/.test(cleanPrefix)) {
            const newWord2 = cleanPrefix + key;
            this.lastTransformed = newWord2;
            this.currentWordRaw = newWord2;
            return { transformed: true, result: newWord2 };
          }
        }
      }
      if (isCamelOrPascalCase(word) || isCamelOrPascalCase(word + key)) {
        const newWord2 = word + key;
        this.lastTransformed = newWord2;
        this.currentWordRaw = (this.currentWordRaw || word) + key;
        return { transformed: false, result: newWord2 };
      }
      if (this.phonologyRules && hasPhonologyViolation(word)) {
        return { transformed: false, result: word + key };
      }
      if (this.phonologyRules && hasForeignOnset(word)) {
        const vnSet = getVietnameseWordSet();
        if (!vnSet.has(canon(word))) {
          return { transformed: false, result: word + key };
        }
      }
      if (word && word.endsWith("\\")) {
        const res = { transformed: true, result: word.slice(0, -1) + key };
        this.lastTransformed = res.result;
        return res;
      }
      if (this.quickConsonants) {
        const qcResult = this.checkQuickConsonants(word, key);
        if (qcResult.transformed) {
          this.lastTransformed = qcResult.result;
          return qcResult;
        }
      }
      if (this.quickTelex && this.getEffectiveMethod(key) === IME_METHOD.TELEX) {
        const qtResult = this.checkQuickTelex(word, key);
        if (qtResult.transformed) {
          this.lastTransformed = qtResult.result;
          return qtResult;
        }
      }
      const consResult = this.checkConsonant(word, key);
      if (consResult.transformed) {
        this.lastTransformed = consResult.result;
        return consResult;
      }
      const shapeResult = this.checkVowelShape(word, key);
      if (shapeResult.transformed) {
        this.lastTransformed = shapeResult.result;
        return shapeResult;
      }
      const swapResult = this.checkShapeModifierSwapping(word, key);
      if (swapResult.transformed) {
        this.lastTransformed = swapResult.result;
        return swapResult;
      }
      const toneResult = this.checkTone(word, key);
      if (toneResult.transformed) {
        this.lastTransformed = toneResult.result;
        return toneResult;
      }
      const dynamicResult = this.checkDynamicToneShift(word, key);
      if (dynamicResult.transformed) {
        this.lastTransformed = dynamicResult.result;
        return dynamicResult;
      }
      const newWord = word + key;
      this.lastTransformed = newWord;
      return { transformed: false, result: newWord };
    }
    /**
     * Dynamic Tone Shifting:
     * Relocates tone when appending vowels or coda consonants to a syllable that already carries a tone mark.
     * e.g.:
     *   'tó' + 'a' -> 'tóa' (or 'toá' if modern)
     *   'tóa' + 'n' -> 'toán' (relocating tone from glide 'o' to nucleus 'a')
     *   'hó' + 'a' -> 'hóa' / 'hoá'
     *   'hoá' + 'n' -> 'hoán'
     */
    checkDynamicToneShift(word, key) {
      if (!word || !key || key.length !== 1) {
        return { transformed: false, result: word + key };
      }
      let hasAccentedVowel = false;
      for (let i = 0; i < word.length; i++) {
        const tone = CHAR_TO_BASE_AND_TONE[word[i]]?.tone;
        if (tone && tone > 0) {
          hasAccentedVowel = true;
          break;
        }
      }
      if (!hasAccentedVowel) {
        return { transformed: false, result: word + key };
      }
      const lowerKey = key.toLowerCase();
      const isVowelKey = ["a", "e", "i", "o", "u", "y"].includes(lowerKey);
      const isCodaKey = ["c", "h", "m", "n", "p", "t", "g"].includes(lowerKey);
      if (!isVowelKey && !isCodaKey) {
        return { transformed: false, result: word + key };
      }
      const candidate = word + key;
      const parsed = parseSyllable(candidate);
      if (!parsed || parsed.tone === TONE_MARK.NONE || !parsed.nucleus) {
        return { transformed: false, result: candidate };
      }
      if (!parsed.isValid()) {
        return { transformed: false, result: candidate };
      }
      const reconstructed = parsed.reconstruct(this.toneStyle);
      if (reconstructed && reconstructed !== candidate) {
        return { transformed: true, result: reconstructed };
      }
      return { transformed: false, result: candidate };
    }
    /**
     * Shape Modifier Swapping (VietC / Bamboo innovation):
     * Allows users to swap between circumflex, horn, and breve while preserving existing tone marks:
     * Telex:
     *   â + w -> ă (ấm + w -> ắm, cân + w -> căn, tập + w -> tặp)
     *   ă + a -> â (ắm + a -> ấm, căn + a -> cân, tặp + a -> tập)
     *   ô + w -> ơ (bốn + w -> bớn, hộp + w -> hợp, cột + w -> cợt)
     *   ơ + o -> ô (bớn + o -> bốn, hợp + o -> hộp, cợt + o -> cột)
     * VNI:
     *   '8' (breve) on 'â' -> 'ă' (tấ + 8 -> tắ)
     *   '6' (circumflex) on 'ă' -> 'â' (tắ + 6 -> tấ)
     *   '7' (horn) on 'ô' -> 'ơ' (bốn + 7 -> bớn, giồ + 7 -> giờ)
     *   '6' (circumflex) on 'ơ' -> 'ô' (bớn + 6 -> bốn, giờ + 6 -> giồ)
     */
    checkShapeModifierSwapping(word, key) {
      if (!word || !key || key.length !== 1) {
        return { transformed: false, result: word + key };
      }
      const method = this.getEffectiveMethod(key);
      const lowerKey = key.toLowerCase();
      const parsed = parseSyllable(word);
      if (!parsed || !parsed.nucleus) {
        return { transformed: false, result: word + key };
      }
      const lowerNucleus = parsed.nucleus.toLowerCase();
      const isUpper = parsed.nucleus === parsed.nucleus.toUpperCase();
      let newNucleusBase = null;
      if (method === IME_METHOD.TELEX) {
        if (lowerKey === "w" && lowerNucleus === "\xE2") {
          newNucleusBase = isUpper ? "\u0102" : "\u0103";
        } else if (lowerKey === "a" && lowerNucleus === "\u0103") {
          newNucleusBase = isUpper ? "\xC2" : "\xE2";
        } else if (lowerKey === "w" && lowerNucleus === "\xF4") {
          newNucleusBase = isUpper ? "\u01A0" : "\u01A1";
        } else if (lowerKey === "o" && lowerNucleus === "\u01A1") {
          newNucleusBase = isUpper ? "\xD4" : "\xF4";
        }
      } else if (method === IME_METHOD.VNI) {
        if (key === "8" && lowerNucleus === "\xE2") {
          newNucleusBase = isUpper ? "\u0102" : "\u0103";
        } else if (key === "6" && lowerNucleus === "\u0103") {
          newNucleusBase = isUpper ? "\xC2" : "\xE2";
        } else if (key === "7" && lowerNucleus === "\xF4") {
          newNucleusBase = isUpper ? "\u01A0" : "\u01A1";
        } else if (key === "6" && lowerNucleus === "\u01A1") {
          newNucleusBase = isUpper ? "\xD4" : "\xF4";
        }
      }
      if (newNucleusBase) {
        parsed.nucleus = newNucleusBase;
        const reconstructed = parsed.reconstruct(this.toneStyle);
        return { transformed: true, result: reconstructed };
      }
      return { transformed: false, result: word + key };
    }
    /**
     * Quick Consonant transformations (XKey engine feature):
     * - Start: f -> ph, j -> gi, w -> qu (when at word start)
     * - End: vowel + g -> ng, vowel + h -> nh, vowel + k -> ch
     */
    checkQuickConsonants(word, key) {
      if (!this.quickConsonants) return { transformed: false, result: word + key };
      const lowerKey = key.toLowerCase();
      if (word.length === 0) {
        if (lowerKey === "f") {
          const rep = key === "F" ? "PH" : "ph";
          return { transformed: true, result: rep };
        }
        if (lowerKey === "j") {
          const rep = key === "J" ? "GI" : "gi";
          return { transformed: true, result: rep };
        }
        if (lowerKey === "w") {
          const rep = key === "W" ? "QU" : "qu";
          return { transformed: true, result: rep };
        }
      }
      if (word.length > 0) {
        if (hasForeignOnset(word) || userDictionary.has(word) || userDictionary.has(word + key)) {
          return { transformed: false, result: word + key };
        }
        const lastChar = word.slice(-1);
        const isVowel = Boolean(CHAR_TO_BASE_AND_TONE[lastChar]);
        if (isVowel) {
          if (lowerKey === "g") {
            const rep = key === "G" ? "NG" : "ng";
            return { transformed: true, result: word + rep };
          }
          if (lowerKey === "h") {
            const rep = key === "H" ? "NH" : "nh";
            return { transformed: true, result: word + rep };
          }
          if (lowerKey === "k") {
            const rep = key === "K" ? "CH" : "ch";
            return { transformed: true, result: word + rep };
          }
        }
      }
      return { transformed: false, result: word + key };
    }
    /**
     * Quick Telex transformations (OpenKey feature):
     * - cc -> ch, gg -> gi, kk -> kh, nn -> ng, pp -> ph, tt -> th
     * - Case preservation: cc -> ch, Cc -> Ch, CC -> CH
     * - Typing key a 3rd time reverts to triple consonant (e.g. 'ch' + 'c' -> 'ccc')
     */
    checkQuickTelex(word, key) {
      if (!word) return { transformed: false, result: word + key };
      const lowerKey = key.toLowerCase();
      if (word.length === 2) {
        const lowerWord = word.toLowerCase();
        const isQuickPair = lowerWord === "ch" && lowerKey === "c" || lowerWord === "gi" && lowerKey === "g" || lowerWord === "kh" && lowerKey === "k" || lowerWord === "ng" && lowerKey === "n" || lowerWord === "ph" && lowerKey === "p" || lowerWord === "th" && lowerKey === "t";
        if (isQuickPair) {
          const isUpper = word[0] === word[0].toUpperCase() && word[0] !== word[0].toLowerCase();
          const base = isUpper ? key.toUpperCase() : lowerKey;
          return { transformed: true, result: base + base + base };
        }
      }
      if (word.length !== 1) return { transformed: false, result: word + key };
      const firstChar = word[0];
      const lowerFirst = firstChar.toLowerCase();
      if (lowerFirst !== lowerKey) return { transformed: false, result: word + key };
      const quickMap = {
        "c": "h",
        "g": "i",
        "k": "h",
        "n": "g",
        "p": "h",
        "t": "h"
      };
      const mappedSecond = quickMap[lowerFirst];
      if (!mappedSecond) return { transformed: false, result: word + key };
      if (userDictionary.has(word + key)) {
        return { transformed: false, result: word + key };
      }
      const isFirstUpper = firstChar === firstChar.toUpperCase() && firstChar !== firstChar.toLowerCase();
      const isKeyUpper = key === key.toUpperCase() && key !== key.toLowerCase();
      let result = "";
      if (isFirstUpper && isKeyUpper) {
        result = firstChar + mappedSecond.toUpperCase();
      } else if (isFirstUpper) {
        result = firstChar + mappedSecond.toLowerCase();
      } else {
        result = firstChar + mappedSecond.toLowerCase();
      }
      return { transformed: true, result };
    }
    /**
     * Consonant modifications (Telex dd -> đ, VNI d + 9 -> đ, etc.)
     */
    checkConsonant(word, key) {
      if (!word) return { transformed: false, result: word + key };
      const method = this.getEffectiveMethod(key);
      const lowerKey = key.toLowerCase();
      const lastChar = word.slice(-1);
      const lowerLast = lastChar.toLowerCase();
      if (method === IME_METHOD.TELEX && lowerKey === "d") {
        if (lowerLast === "d") {
          const isUpper = lastChar === "D";
          const replacement = isUpper ? key === "D" ? "\u0110" : "\u0110" : "\u0111";
          return { transformed: true, result: word.slice(0, -1) + replacement };
        }
        if (lowerLast === "\u0111") {
          const isUpper = lastChar === "\u0110";
          const replacement = isUpper ? "DD" : "dd";
          return { transformed: true, result: word.slice(0, -1) + replacement };
        }
      }
      if (method === IME_METHOD.VNI && key === "9") {
        const dIndex = word.toLowerCase().lastIndexOf("d");
        const dbarIndex = word.toLowerCase().lastIndexOf("\u0111");
        if (dbarIndex !== -1) {
          const char = word[dbarIndex];
          const rep = char === "\u0110" ? "D" : "d";
          return {
            transformed: true,
            result: word.slice(0, dbarIndex) + rep + word.slice(dbarIndex + 1) + "9"
          };
        } else if (dIndex !== -1) {
          const char = word[dIndex];
          const rep = char === "D" ? "\u0110" : "\u0111";
          return {
            transformed: true,
            result: word.slice(0, dIndex) + rep + word.slice(dIndex + 1)
          };
        }
      }
      return { transformed: false, result: word + key };
    }
    /**
     * Vowel shape modification:
     * Telex:
     *   aa -> â, ee -> ê, oo -> ô
     *   ow -> ơ, uw -> ư, aw -> ă
     *   w at start or after u/o:
     *     uo + w -> ươ
     *     u + w -> ư
     *     w alone -> w (or ư)
     * VNI:
     *   6 -> â, ê, ô
     *   7 -> ơ, ư
     *   8 -> ă
     */
    checkVowelShape(word, key) {
      if (!word) return { transformed: false, result: word + key };
      const method = this.getEffectiveMethod(key);
      const lowerKey = key.toLowerCase();
      if (method === IME_METHOD.TELEX) {
        if (["a", "e", "o"].includes(lowerKey)) {
          const circumflexTarget = lowerKey === "a" ? "\xE2" : lowerKey === "e" ? "\xEA" : "\xF4";
          const lastChar = word.slice(-1);
          const lastBaseInfo = CHAR_TO_BASE_AND_TONE[lastChar];
          if (lastBaseInfo) {
            const lastBase = lastBaseInfo.base.toLowerCase();
            if (lastBase === lowerKey) {
              const target = SHAPE_MAP[lastBaseInfo.base]?.circumflex;
              if (target) {
                const isUpper = lastChar === lastChar.toUpperCase() && lastChar !== lastChar.toLowerCase();
                const tone = lastBaseInfo.tone;
                const newBase = isUpper ? target.toUpperCase() : target.toLowerCase();
                const newChar = VOWEL_TABLE[newBase][tone];
                return { transformed: true, result: word.slice(0, -1) + newChar };
              }
            } else if (lastBase === circumflexTarget) {
              const target = SHAPE_MAP[lastBaseInfo.base]?.circumflex;
              if (target) {
                const isUpper = lastChar === lastChar.toUpperCase() && lastChar !== lastChar.toLowerCase();
                const tone = lastBaseInfo.tone;
                const newBase = isUpper ? target.toUpperCase() : target.toLowerCase();
                const newChar = VOWEL_TABLE[newBase][tone];
                return { transformed: true, result: word.slice(0, -1) + newChar + key };
              }
            }
          }
          const vowelIndices = [];
          for (let i = 0; i < word.length; i++) {
            if (CHAR_TO_BASE_AND_TONE[word[i]]) {
              vowelIndices.push(i);
            }
          }
          if (vowelIndices.length > 0) {
            let isContiguous = true;
            for (let k = 0; k < vowelIndices.length - 1; k++) {
              if (vowelIndices[k + 1] - vowelIndices[k] !== 1) {
                isContiguous = false;
                break;
              }
            }
            if (isContiguous) {
              for (let idx = vowelIndices.length - 1; idx >= 0; idx--) {
                const charIndex = vowelIndices[idx];
                const char = word[charIndex];
                const baseInfo = CHAR_TO_BASE_AND_TONE[char];
                if (!baseInfo) continue;
                const charBase = baseInfo.base.toLowerCase();
                if (charBase === lowerKey) {
                  const target = SHAPE_MAP[baseInfo.base]?.circumflex;
                  if (target) {
                    const isUpper = char === char.toUpperCase() && char !== char.toLowerCase();
                    const targetBase = isUpper ? target.toUpperCase() : target.toLowerCase();
                    const newChar = VOWEL_TABLE[targetBase][baseInfo.tone];
                    const newWord = word.slice(0, charIndex) + newChar + word.slice(charIndex + 1);
                    if (this.phonologyRules) {
                      if (isCheckedToneViolation(newWord, baseInfo.tone)) {
                        continue;
                      }
                      const parsed = parseSyllable(newWord);
                      if (parsed && !parsed.isValid()) {
                        continue;
                      }
                    }
                    if (!this.spellCheck || this.isValidVietnameseWord(newWord)) {
                      return { transformed: true, result: newWord };
                    }
                  }
                }
                if (charBase === circumflexTarget) {
                  if (lowerKey === "o" && word.toLowerCase().endsWith("ng")) {
                    const endsWithNg = word.toLowerCase().endsWith("ng");
                    const target2 = SHAPE_MAP[baseInfo.base]?.circumflex;
                    if (target2 && endsWithNg) {
                      const isUpper = char === char.toUpperCase() && char !== char.toLowerCase();
                      const tone = baseInfo.tone;
                      const o1 = isUpper ? "O" : "o";
                      const o2Base = isUpper ? "O" : "o";
                      const o2Accented = VOWEL_TABLE[o2Base][tone];
                      const doubleO = o1 + o2Accented;
                      const newWord = word.slice(0, charIndex) + doubleO + word.slice(charIndex + 1);
                      return { transformed: true, result: newWord };
                    }
                  }
                  const target = SHAPE_MAP[baseInfo.base]?.circumflex;
                  if (target) {
                    const isUpper = char === char.toUpperCase() && char !== char.toLowerCase();
                    const targetBase = isUpper ? target.toUpperCase() : target.toLowerCase();
                    const newChar = VOWEL_TABLE[targetBase][baseInfo.tone];
                    const newWord = word.slice(0, charIndex) + newChar + word.slice(charIndex + 1) + key;
                    return { transformed: true, result: newWord };
                  }
                }
              }
            }
          }
        }
        if (lowerKey === "w") {
          return this.applyTelexW(word);
        }
      }
      if (method === IME_METHOD.VNI) {
        if (key === "6") {
          return this.applyVniModifier(word, "circumflex");
        }
        if (key === "7") {
          return this.applyVniModifier(word, "horn");
        }
        if (key === "8") {
          return this.applyVniModifier(word, "breve");
        }
      }
      return { transformed: false, result: word + key };
    }
    /**
     * Helper to locate an adjacent 'uo' pair (or already horned 'ươ' / 'uơ' / 'ưo')
     * in the word buffer.
     * Returns { index, c1, c2, info1, info2, b1, b2, isHorned } or null.
     */
    findUoPair(word) {
      if (!word || word.length < 2) return null;
      for (let i = 0; i < word.length - 1; i++) {
        const c1 = word[i];
        const c2 = word[i + 1];
        const info1 = CHAR_TO_BASE_AND_TONE[c1];
        const info2 = CHAR_TO_BASE_AND_TONE[c2];
        if (info1 && info2) {
          const b1 = info1.base.toLowerCase();
          const b2 = info2.base.toLowerCase();
          if ((b1 === "u" || b1 === "\u01B0") && (b2 === "o" || b2 === "\u01A1" || b2 === "\xF4")) {
            const isHorned = b1 === "\u01B0" && b2 === "\u01A1";
            return {
              index: i,
              c1,
              c2,
              info1,
              info2,
              b1,
              b2,
              isHorned
            };
          }
        }
      }
      return null;
    }
    /**
     * Transform 'uo' / 'ươ' pair with horn modifier (VNI 7 or Telex w)
     * - If already 'ươ', toggles back to 'uo' (preserving tone on second vowel)
     * - Otherwise transforms both to 'ươ' (placing any existing tone on 'ơ')
     */
    applyUoHorn(word, pair) {
      const { index, c1, c2, info1, info2, isHorned } = pair;
      const isUpper1 = c1 === c1.toUpperCase() && c1 !== c1.toLowerCase();
      const isUpper2 = c2 === c2.toUpperCase() && c2 !== c2.toLowerCase();
      const tone = Math.max(info1.tone, info2.tone);
      const endsWord = index + 2 === word.length;
      const hasCodaN = index + 3 === word.length && word[index + 2].toLowerCase() === "n";
      let isTrioException = false;
      if (index >= 1) {
        const charBefore = word[index - 1].toLowerCase();
        if (charBefore === "q" && (endsWord || hasCodaN)) {
          isTrioException = true;
        } else if (charBefore === "h" && endsWord) {
          isTrioException = true;
        } else if (index >= 2 && word.slice(index - 2, index).toLowerCase() === "th" && endsWord) {
          isTrioException = true;
        }
      }
      if (isTrioException) {
        if (info2.base.toLowerCase() === "\u01A1" || isHorned) {
          const base1 = isUpper1 ? "U" : "u";
          const base2 = isUpper2 ? "O" : "o";
          const char1 = VOWEL_TABLE[base1][0];
          const char2 = VOWEL_TABLE[base2][tone];
          return {
            transformed: true,
            result: word.slice(0, index) + char1 + char2 + word.slice(index + 2)
          };
        } else {
          const base1 = isUpper1 ? "U" : "u";
          const base2 = isUpper2 ? "\u01A0" : "\u01A1";
          const char1 = VOWEL_TABLE[base1][0];
          const char2 = VOWEL_TABLE[base2][tone];
          return {
            transformed: true,
            result: word.slice(0, index) + char1 + char2 + word.slice(index + 2)
          };
        }
      }
      if (isHorned) {
        const base1 = isUpper1 ? "U" : "u";
        const base2 = isUpper2 ? "O" : "o";
        const char1 = VOWEL_TABLE[base1][0];
        const char2 = VOWEL_TABLE[base2][tone];
        return {
          transformed: true,
          result: word.slice(0, index) + char1 + char2 + word.slice(index + 2) + "w"
        };
      } else {
        const base1 = isUpper1 ? "\u01AF" : "\u01B0";
        const base2 = isUpper2 ? "\u01A0" : "\u01A1";
        const char1 = VOWEL_TABLE[base1][0];
        const char2 = VOWEL_TABLE[base2][tone];
        return {
          transformed: true,
          result: word.slice(0, index) + char1 + char2 + word.slice(index + 2)
        };
      }
    }
    /**
     * Helper to locate an adjacent 'uu' pair (or already horned 'ưu' / 'uư')
     * in the word buffer (e.g. 'cuu', 'cưu', 'luu', 'muu', 'huu', 'tuu').
     * In Vietnamese orthography, 'uu' + horn MUST horn the FIRST 'u' to form 'ưu' (never 'uư').
     * Returns { index, c1, c2, info1, info2, b1, b2, isHorned } or null.
     */
    findUuPair(word) {
      if (!word || word.length < 2) return null;
      for (let i = 0; i < word.length - 1; i++) {
        const c1 = word[i];
        const c2 = word[i + 1];
        const info1 = CHAR_TO_BASE_AND_TONE[c1];
        const info2 = CHAR_TO_BASE_AND_TONE[c2];
        if (info1 && info2) {
          const b1 = info1.base.toLowerCase();
          const b2 = info2.base.toLowerCase();
          if ((b1 === "u" || b1 === "\u01B0") && (b2 === "u" || b2 === "\u01B0")) {
            const isHorned = b1 === "\u01B0" && b2 === "u";
            return {
              index: i,
              c1,
              c2,
              info1,
              info2,
              b1,
              b2,
              isHorned
            };
          }
        }
      }
      return null;
    }
    /**
     * Transform 'uu' / 'ưu' pair with horn modifier (VNI 7 or Telex w)
     * - If already 'ưu', toggles back to plain 'uu'
     * - Otherwise transforms to 'ưu' (horn placed on the first 'u')
     * - Preserves any existing tone, placing it on the 'ư' (the nucleus)
     */
    applyUuHorn(word, pair) {
      const { index, c1, c2, info1, info2, isHorned } = pair;
      const isUpper1 = c1 === c1.toUpperCase() && c1 !== c1.toLowerCase();
      const isUpper2 = c2 === c2.toUpperCase() && c2 !== c2.toLowerCase();
      const tone = Math.max(info1.tone, info2.tone);
      if (isHorned) {
        const base1 = isUpper1 ? "U" : "u";
        const base2 = isUpper2 ? "U" : "u";
        const char1 = VOWEL_TABLE[base1][tone];
        const char2 = VOWEL_TABLE[base2][0];
        return {
          transformed: true,
          result: word.slice(0, index) + char1 + char2 + word.slice(index + 2) + "w"
        };
      } else {
        const base1 = isUpper1 ? "\u01AF" : "\u01B0";
        const base2 = isUpper2 ? isUpper1 && isUpper2 ? "U" : "u" : "u";
        const char1 = VOWEL_TABLE[base1][tone];
        const char2 = VOWEL_TABLE[base2][0];
        return {
          transformed: true,
          result: word.slice(0, index) + char1 + char2 + word.slice(index + 2)
        };
      }
    }
    /**
     * Apply Telex 'w' transformation
     * Handles:
     * - uo + w / uow / duoc + w -> ươ (both vowels horned: được, nước, ước)
     * - ươ + w -> toggles back to uo
     * - uu + w / cuu + w -> ưu (first vowel horned: cưu, cứu, cừu)
     * - ưu + w -> toggles back to uu
     * - ow -> ơ, uw -> ư, aw -> ă
     * - Toggle: ơ + w -> o, ư + w -> u, ă + w -> a
     * - w at beginning or after consonant: produces ư
     * - ư + w -> toggles back to w
     */
    applyTelexW(word) {
      if (word.endsWith("w") || word.endsWith("W")) {
        return { transformed: false, result: word + "w" };
      }
      const uoPair = this.findUoPair(word);
      if (uoPair) {
        return this.applyUoHorn(word, uoPair);
      }
      const uuPair = this.findUuPair(word);
      if (uuPair) {
        return this.applyUuHorn(word, uuPair);
      }
      if (word === "\u01B0") return { transformed: true, result: "w" };
      if (word === "\u01AF") return { transformed: true, result: "W" };
      for (let i = word.length - 1; i >= 0; i--) {
        const char = word[i];
        const baseInfo = CHAR_TO_BASE_AND_TONE[char];
        if (baseInfo) {
          const lowerBase = baseInfo.base.toLowerCase();
          if (["a", "o", "u", "\u0103", "\u01A1", "\u01B0"].includes(lowerBase)) {
            let target = SHAPE_MAP[baseInfo.base]?.horn;
            if (!target && ["a", "\u0103"].includes(lowerBase)) {
              target = SHAPE_MAP[baseInfo.base]?.breve;
            }
            if (target) {
              const isUpper = char === char.toUpperCase() && char !== char.toLowerCase();
              const targetBase = isUpper ? target.toUpperCase() : target.toLowerCase();
              const newChar = VOWEL_TABLE[targetBase][baseInfo.tone];
              const appendLetter = ["\u0103", "\u01A1", "\u01B0"].includes(lowerBase) ? "w" : "";
              const newWord = word.slice(0, i) + newChar + word.slice(i + 1) + appendLetter;
              if (this.phonologyRules && !appendLetter) {
                const parsedNew = parseSyllable(newWord);
                if (parsedNew && !parsedNew.isValid()) {
                  return { transformed: false, result: word + "w" };
                }
              }
              return {
                transformed: true,
                result: newWord
              };
            }
          }
        }
      }
      if (word.length === 0) {
        return { transformed: true, result: "\u01B0" };
      }
      const lastChar = word.slice(-1);
      const parsedWord = parseSyllable(word);
      const hasVowelNucleus = Boolean(parsedWord && parsedWord.nucleus);
      if (!hasVowelNucleus && /^[a-zA-Z]$/.test(lastChar) && !CHAR_TO_BASE_AND_TONE[lastChar] && lastChar.toLowerCase() !== "w") {
        const isUpper = lastChar === lastChar.toUpperCase();
        return {
          transformed: true,
          result: word + (isUpper ? "\u01AF" : "\u01B0")
        };
      }
      return { transformed: false, result: word + "w" };
    }
    /**
     * Apply VNI shape modifier (6 = circumflex, 7 = horn, 8 = breve)
     */
    applyVniModifier(word, modifierType) {
      if (modifierType === "horn") {
        const uoPair = this.findUoPair(word);
        if (uoPair) {
          return this.applyUoHorn(word, uoPair);
        }
        const uuPair = this.findUuPair(word);
        if (uuPair) {
          return this.applyUuHorn(word, uuPair);
        }
        for (let i = word.length - 1; i >= 0; i--) {
          const char = word[i];
          const baseInfo = CHAR_TO_BASE_AND_TONE[char];
          if (baseInfo) {
            const lowerBase = baseInfo.base.toLowerCase();
            if (["u", "\u01B0", "o", "\u01A1"].includes(lowerBase)) {
              const target = SHAPE_MAP[baseInfo.base]?.horn;
              if (target) {
                const isUpper = char === char.toUpperCase() && char !== char.toLowerCase();
                const targetBase = isUpper ? target.toUpperCase() : target.toLowerCase();
                const newChar = VOWEL_TABLE[targetBase][baseInfo.tone];
                if (["\u01B0", "\u01A1"].includes(lowerBase)) {
                  return {
                    transformed: true,
                    result: word.slice(0, i) + newChar + word.slice(i + 1) + "7"
                  };
                }
                return {
                  transformed: true,
                  result: word.slice(0, i) + newChar + word.slice(i + 1)
                };
              }
            }
          }
        }
        return { transformed: false, result: word };
      }
      if (modifierType === "breve") {
        for (let i = word.length - 1; i >= 0; i--) {
          const char = word[i];
          const baseInfo = CHAR_TO_BASE_AND_TONE[char];
          if (baseInfo) {
            const lowerBase = baseInfo.base.toLowerCase();
            if (["a", "\u0103"].includes(lowerBase)) {
              const target = SHAPE_MAP[baseInfo.base]?.breve;
              if (target) {
                const isUpper = char === char.toUpperCase() && char !== char.toLowerCase();
                const targetBase = isUpper ? target.toUpperCase() : target.toLowerCase();
                const newChar = VOWEL_TABLE[targetBase][baseInfo.tone];
                if (lowerBase === "\u0103") {
                  return {
                    transformed: true,
                    result: word.slice(0, i) + newChar + word.slice(i + 1) + "8"
                  };
                }
                return {
                  transformed: true,
                  result: word.slice(0, i) + newChar + word.slice(i + 1)
                };
              }
            }
          }
        }
        return { transformed: false, result: word };
      }
      if (modifierType === "circumflex") {
        for (let i = word.length - 1; i >= 0; i--) {
          const char = word[i];
          const baseInfo = CHAR_TO_BASE_AND_TONE[char];
          if (baseInfo) {
            const lowerBase = baseInfo.base.toLowerCase();
            const target = SHAPE_MAP[baseInfo.base]?.circumflex;
            if (target) {
              const isUpper = char === char.toUpperCase() && char !== char.toLowerCase();
              const targetBase = isUpper ? target.toUpperCase() : target.toLowerCase();
              const newChar = VOWEL_TABLE[targetBase][baseInfo.tone];
              if (["\xE2", "\xEA", "\xF4"].includes(lowerBase)) {
                return {
                  transformed: true,
                  result: word.slice(0, i) + newChar + word.slice(i + 1) + "6"
                };
              }
              return {
                transformed: true,
                result: word.slice(0, i) + newChar + word.slice(i + 1)
              };
            }
          }
        }
        return { transformed: false, result: word };
      }
      return { transformed: false, result: word };
    }
    /**
     * Tone transformation (Acute, Grave, Hook, Tilde, Dot, Remove)
     */
    checkTone(word, key) {
      if (!word) return { transformed: false, result: word + key };
      const lowerKey = key.toLowerCase();
      const toneMap = this.getToneForKey(key);
      if (toneMap === null) {
        return { transformed: false, result: word + key };
      }
      const vowelIndices = [];
      for (let i = 0; i < word.length; i++) {
        if (CHAR_TO_BASE_AND_TONE[word[i]]) {
          vowelIndices.push(i);
        }
      }
      if (vowelIndices.length === 0) {
        return { transformed: false, result: word + key };
      }
      let currentTone = 0;
      let currentToneIdx = -1;
      vowelIndices.forEach((idx) => {
        const tone = CHAR_TO_BASE_AND_TONE[word[idx]].tone;
        if (tone > 0) {
          currentTone = tone;
          currentToneIdx = idx;
        }
      });
      if (toneMap === 0) {
        if (currentTone > 0) {
          const cleaned = this.stripToneFromWord(word, vowelIndices);
          return { transformed: true, result: cleaned };
        }
        return { transformed: false, result: word + key };
      }
      if (this.phonologyRules && isCheckedToneViolation(word, toneMap)) {
        return { transformed: false, result: word + key };
      }
      if (this.phonologyRules && hasPhonologyViolation(word)) {
        return { transformed: false, result: word + key };
      }
      const targetVowelIdx = this.getTargetVowelIndex(word, vowelIndices);
      if (currentTone === toneMap) {
        const cleaned = this.stripToneFromWord(word, vowelIndices);
        const appendKey = key;
        const result = cleaned + appendKey;
        this.lastToneToggledWord = { base: result, key: lowerKey };
        return { transformed: true, result };
      }
      if (this.lastToneToggledWord && this.lastToneToggledWord.base === word && this.lastToneToggledWord.key === lowerKey) {
        this.lastToneToggledWord = null;
        return { transformed: false, result: word + key };
      }
      this.lastToneToggledWord = null;
      const baseWord = this.stripToneFromWord(word, vowelIndices);
      const targetChar = baseWord[targetVowelIdx];
      const baseInfo = CHAR_TO_BASE_AND_TONE[targetChar];
      if (!baseInfo) return { transformed: false, result: word + key };
      let targetBase = baseInfo.base;
      const lastVowelIdx = vowelIndices[vowelIndices.length - 1];
      const hasFinalConsonant = lastVowelIdx < word.length - 1;
      if (targetBase.toLowerCase() === "e" && hasFinalConsonant && targetVowelIdx >= 2) {
        const preceding = baseWord.slice(targetVowelIdx - 2, targetVowelIdx).toLowerCase();
        if (preceding === "uy") {
          const isUpper = targetChar === targetChar.toUpperCase() && targetChar !== targetChar.toLowerCase();
          targetBase = isUpper ? "\xCA" : "\xEA";
        }
      }
      const newChar = VOWEL_TABLE[targetBase][toneMap];
      const newWord = baseWord.slice(0, targetVowelIdx) + newChar + baseWord.slice(targetVowelIdx + 1);
      if (this.phonologyRules) {
        const parsedNew = parseSyllable(newWord);
        if (parsedNew && !parsedNew.isValid()) {
          return { transformed: false, result: word + key };
        }
      }
      if (this.spellCheck && !this.isValidVietnameseWord(newWord)) {
        return { transformed: false, result: word + key };
      }
      return { transformed: true, result: newWord };
    }
    getToneForKey(key) {
      const method = this.getEffectiveMethod(key);
      const lowerKey = key.toLowerCase();
      if (method === IME_METHOD.TELEX) {
        switch (lowerKey) {
          case "s":
            return 1;
          // sắc
          case "f":
            return 2;
          // huyền
          case "r":
            return 3;
          // hỏi
          case "x":
            return 4;
          // ngã
          case "j":
            return 5;
          // nặng
          case "z":
            return 0;
          // xóa dấu
          default:
            return null;
        }
      }
      if (method === IME_METHOD.VNI) {
        switch (key) {
          case "1":
            return 1;
          case "2":
            return 2;
          case "3":
            return 3;
          case "4":
            return 4;
          case "5":
            return 5;
          case "0":
            return 0;
          default:
            return null;
        }
      }
      return null;
    }
    /**
     * Determine exact vowel index to receive tone
     * Modern vs Classic tone rules:
     * - Modern: hòa, thủy, khỏe, thỏa
     * - Classic: hoà, thuỷ, khoẻ, thoả
     */
    getTargetVowelIndex(word, vowelIndices) {
      if (vowelIndices.length === 1) {
        return vowelIndices[0];
      }
      let effectiveIndices = [...vowelIndices];
      const firstIdx = effectiveIndices[0];
      if (firstIdx > 0 && word.slice(firstIdx - 1, firstIdx + 1).toLowerCase() === "qu") {
        if (effectiveIndices.length > 1) {
          effectiveIndices = effectiveIndices.slice(1);
        }
      } else if (firstIdx > 0 && word.slice(firstIdx - 1, firstIdx + 1).toLowerCase() === "gi") {
        if (effectiveIndices.length > 1) {
          effectiveIndices = effectiveIndices.slice(1);
        }
      }
      if (effectiveIndices.length === 1) {
        return effectiveIndices[0];
      }
      const lastVowelIdx = effectiveIndices[effectiveIndices.length - 1];
      const hasFinalConsonant = lastVowelIdx < word.length - 1;
      if (hasFinalConsonant) {
        for (const idx of effectiveIndices) {
          const char = word[idx];
          const base = CHAR_TO_BASE_AND_TONE[char]?.base.toLowerCase();
          if (["\u01A1", "\xEA", "\xF4", "\xE2", "\u0103"].includes(base)) {
            return idx;
          }
        }
        return effectiveIndices[effectiveIndices.length - 1];
      }
      if (effectiveIndices.length >= 3) {
        return effectiveIndices[1];
      }
      const v1 = CHAR_TO_BASE_AND_TONE[word[effectiveIndices[0]]]?.base.toLowerCase();
      const v2 = CHAR_TO_BASE_AND_TONE[word[effectiveIndices[1]]]?.base.toLowerCase();
      const cluster = v1 + v2;
      if (["u\xEA", "u\u01A1", "ue", "\u01B0\u01A1"].includes(cluster)) {
        return effectiveIndices[1];
      }
      if (["\u01B0a", "\u01B0u", "ia", "ya", "ua"].includes(cluster)) {
        return effectiveIndices[0];
      }
      if (["oa", "oe", "uy"].includes(cluster)) {
        return this.toneStyle === TONE_STYLE.MODERN ? effectiveIndices[1] : effectiveIndices[0];
      }
      return effectiveIndices[0];
    }
    stripToneFromWord(word, vowelIndices) {
      const chars = word.split("");
      vowelIndices.forEach((idx) => {
        const baseInfo = CHAR_TO_BASE_AND_TONE[chars[idx]];
        if (baseInfo) {
          chars[idx] = VOWEL_TABLE[baseInfo.base][0];
        }
      });
      return chars.join("");
    }
    extractWordTone(vowelStr) {
      for (const char of vowelStr) {
        const tone = CHAR_TO_BASE_AND_TONE[char]?.tone;
        if (tone > 0) return tone;
      }
      return 0;
    }
    replaceWordVowels(vowelStr, newVowels, tone) {
      if (tone === 0) return newVowels;
      const baseFirst = newVowels[0];
      const rep = VOWEL_TABLE[baseFirst][tone] + newVowels.slice(1);
      return rep;
    }
    /**
     * Syllable spell check validator
     * Validates against built-in Hunspell Vietnamese dictionary (~6,700 words)
     * and user custom dictionary.
     */
    isValidVietnameseWord(word) {
      if (!word) return true;
      return checkWordSpelling(word);
    }
    /**
     * Word Rescue: Retroactively converts a raw keystroke word into its accented Vietnamese equivalent
     * (Ngó Sen / vnchKey innovation).
     * E.g. "tieengs" -> "tiếng", "vieetj" -> "việt", "nef" -> "nè", "Chaof" -> "Chào"
     * Preserves English words and user dictionary entries (linux, server, browser...).
     * @param {string} rawWord
     * @returns {string} Rescued Vietnamese word or original word if unchanged/foreign
     */
    rescueWord(rawWord) {
      if (!rawWord || typeof rawWord !== "string") return rawWord;
      const lower = rawWord.toLowerCase();
      if (COMMON_ENGLISH_WORDS.has(lower) || userDictionary.has(lower)) {
        return rawWord;
      }
      let acc = "";
      for (const ch of rawWord) {
        const res = this.processKey(acc, ch);
        acc = res.transformed ? res.result : acc + ch;
      }
      if (acc === rawWord) return rawWord;
      const hasVnDiacritics = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i.test(acc);
      if (hasVnDiacritics || getVietnameseWordSet().has(acc.toLowerCase())) {
        return acc;
      }
      return rawWord;
    }
    /**
     * Text Rescue: Converts a sentence or phrase of raw words into accented Vietnamese
     * while preserving whitespace, punctuation, and English words.
     * E.g. "Chaof banj, tieengs vieetj nef" -> "Chào bạn, tiếng việt nè"
     * @param {string} text
     * @returns {string} Rescued text
     */
    rescueText(text) {
      if (!text || typeof text !== "string") return text;
      const tokens = text.split(/([\s\p{P}]+)/u);
      return tokens.map((tok) => {
        if (!tok || /^[\s\p{P}]+$/u.test(tok)) return tok;
        return this.rescueWord(tok);
      }).join("");
    }
    /**
     * Selection Accent Rescue:
     * Modifies, adds, or removes tone accents on an existing word or selected syllable.
     * (Ngó Sen / vnchKey innovation).
     * E.g.:
     *   "nhanh" + "s" -> "nhánh"
     *   "nhánh" + "f" -> "nhành"
     *   "nhánh" + "z" -> "nhanh" (remove tone)
     *   "hoa" + "r" -> "hoả" (or "hỏa" classic)
     *   "tieng" + "s" -> "tiếng"
     *   "nhanh" + "1" -> "nhánh"
     *   "nước" + "0" -> "nươc"
     * @param {string} word Current selected word
     * @param {string} key Incoming tone key ('s','f','r','x','j','z' in Telex, '1'-'5','0' in VNI)
     * @returns {string|null} Rescued word with updated tone, or null if key is not a tone modifier
     */
    applyAccentToSelection(word, key) {
      if (!word || !key || key.length !== 1) return null;
      const TONE_KEYS = {
        "s": TONE_MARK.ACUTE,
        "1": TONE_MARK.ACUTE,
        "f": TONE_MARK.GRAVE,
        "2": TONE_MARK.GRAVE,
        "r": TONE_MARK.HOOK_ABOVE,
        "3": TONE_MARK.HOOK_ABOVE,
        "x": TONE_MARK.TILDE,
        "4": TONE_MARK.TILDE,
        "j": TONE_MARK.DOT_BELOW,
        "5": TONE_MARK.DOT_BELOW,
        "z": TONE_MARK.NONE,
        "0": TONE_MARK.NONE
      };
      const lowerKey = key.toLowerCase();
      if (!(lowerKey in TONE_KEYS)) return null;
      const targetTone = TONE_KEYS[lowerKey];
      const parsed = parseSyllable(word);
      if (!parsed || !parsed.nucleus && !parsed.glide) return null;
      const lowerOnset = parsed.onset.toLowerCase();
      const lowerN = parsed.nucleus.toLowerCase();
      if (lowerOnset === "th" && lowerN === "uo" && !parsed.coda) {
        parsed.glide = "u";
        parsed.nucleus = "\u01A1";
      } else if (lowerOnset === "q" && lowerN === "uo" && parsed.coda.toLowerCase() === "n") {
        parsed.glide = "u";
        parsed.nucleus = "\u01A1";
      } else if (lowerOnset === "q" && (lowerN === "o" || lowerN === "uo") && !parsed.coda) {
        parsed.glide = "u";
        parsed.nucleus = "\u01A1";
      } else if (lowerOnset === "h" && lowerN === "uo" && !parsed.coda) {
        parsed.glide = "u";
        parsed.nucleus = "\u01A1";
      } else if (lowerN === "ie" && parsed.coda) {
        const isUpper = parsed.nucleus[1] === parsed.nucleus[1].toUpperCase();
        parsed.nucleus = parsed.nucleus[0] + (isUpper ? "\xCA" : "\xEA");
      } else if (lowerN === "uo" && parsed.coda) {
        const isUpper0 = parsed.nucleus[0] === parsed.nucleus[0].toUpperCase();
        const isUpper1 = parsed.nucleus[1] === parsed.nucleus[1].toUpperCase();
        parsed.nucleus = (isUpper0 ? "\u01AF" : "\u01B0") + (isUpper1 ? "\u01A0" : "\u01A1");
      }
      return parsed.withTone(targetTone).reconstruct(this.toneStyle);
    }
  };

  // src/engine/macro.js
  var DEFAULT_MACROS = [
    { trigger: "tv", value: "Ti\u1EBFng Vi\u1EC7t", enabled: true },
    { trigger: "vn", value: "Vi\u1EC7t Nam", enabled: true },
    { trigger: "hn", value: "H\xE0 N\u1ED9i", enabled: true },
    { trigger: "sg", value: "S\xE0i G\xF2n", enabled: true },
    { trigger: "dc", value: "\u0111\u01B0\u1EE3c", enabled: true },
    { trigger: "ko", value: "kh\xF4ng", enabled: true },
    { trigger: "k", value: "kh\xF4ng", enabled: true },
    { trigger: "ntn", value: "nh\u01B0 th\u1EBF n\xE0o", enabled: true },
    { trigger: "vs", value: "v\u1EDBi", enabled: true },
    { trigger: "bt", value: "bi\u1EBFt", enabled: true },
    { trigger: "cb", value: "chu\u1EA9n b\u1ECB", enabled: true },
    { trigger: "dy", value: "\u0111\u1ED3ng \xFD", enabled: true },
    { trigger: "tks", value: "c\u1EA3m \u01A1n", enabled: true },
    { trigger: "mst", value: "m\xE3 s\u1ED1 thu\u1EBF", enabled: true },
    { trigger: "sdt", value: "s\u1ED1 \u0111i\u1EC7n tho\u1EA1i", enabled: true },
    { trigger: "zia", value: "dz\xECa", enabled: true },
    { trigger: "zi", value: "dz\xED", enabled: true },
    { trigger: "zo", value: "dz\xF4", enabled: true },
    { trigger: "dm", value: "\u0111\u1EE5 m\xE1", enabled: true },
    { trigger: "dmm", value: "\u0111\u1EE5 m\xE1 m\xE0y", enabled: true },
    { trigger: "ck", value: "ch\u1ED3ng", enabled: true },
    { trigger: "cx", value: "c\u0169ng", enabled: true },
    { trigger: "idk", value: "tao h\xF4ng bi\u1EBFt", enabled: true },
    { trigger: "+today", value: "$DATE", enabled: true },
    { trigger: "+now", value: "$DATETIME", enabled: true }
  ];
  var MacroEngine = class {
    constructor(macros = DEFAULT_MACROS, options = {}) {
      this.macros = /* @__PURE__ */ new Map();
      this.enabled = options.enabled ?? true;
      this.autoUndo = options.autoUndo ?? true;
      this.lastExpansion = null;
      this.suppressedTrigger = null;
      this.loadMacros(macros);
    }
    loadMacros(list) {
      this.macros.clear();
      if (Array.isArray(list)) {
        list.forEach((item) => {
          if (item && item.trigger) {
            this.macros.set(item.trigger.toLowerCase(), {
              trigger: item.trigger,
              value: item.value || "",
              enabled: item.enabled !== false
            });
          }
        });
      }
    }
    getMacros() {
      return Array.from(this.macros.values());
    }
    setMacro(trigger, value, enabled = true) {
      if (!trigger) return;
      this.macros.set(trigger.toLowerCase(), {
        trigger,
        value,
        enabled
      });
    }
    removeMacro(trigger) {
      if (!trigger) return;
      this.macros.delete(trigger.toLowerCase());
    }
    toggleMacro(trigger) {
      const existing = this.macros.get(trigger.toLowerCase());
      if (existing) {
        existing.enabled = !existing.enabled;
      }
    }
    /**
     * Check if a trigger word can expand upon encountering delimiter
     * @param {string} rawWord The typed word before delimiter (e.g. 'vn', 'VN', 'Vn')
     * @param {string} delimiter The character triggering expansion (e.g. ' ', '\n', '.')
     * @returns {{ match: boolean, expandedText?: string, rawTrigger?: string, delimiter?: string }}
     */
    checkExpansion(rawWord, delimiter) {
      if (!this.enabled || !rawWord || !isDelimiter(delimiter)) {
        return { match: false };
      }
      const key = rawWord.toLowerCase();
      if (this.suppressedTrigger && this.suppressedTrigger.toLowerCase() === key) {
        this.suppressedTrigger = null;
        return { match: false, suppressed: true };
      }
      this.suppressedTrigger = null;
      const entry = this.macros.get(key);
      if (!entry || !entry.enabled) {
        return { match: false };
      }
      const expandedText = this.preserveCase(rawWord, this.resolveDynamicVariables(entry.value));
      this.lastExpansion = {
        rawTrigger: rawWord,
        expandedText,
        delimiter,
        step: 1,
        // Step 1: Trailing delimiter attached; Step 2: Trailing delimiter removed
        timestamp: Date.now()
      };
      return {
        match: true,
        expandedText,
        rawTrigger: rawWord,
        delimiter
      };
    }
    /**
     * Backtracking / 2-Step Undo:
     * When user presses Backspace following an expansion:
     * - Step 1 (first Backspace): Only delete the trailing space/delimiter, leaving caret at the end
     *   of expandedText (e.g. "Việt Nam " -> "Việt Nam|") so user can type punctuation or continue sentence.
     * - Step 2 (second consecutive Backspace): Revert the expanded word completely back to rawTrigger
     *   (e.g. "Việt Nam" -> "vn|"), and activate suppression so typing space next will keep rawTrigger intact!
     */
    checkUndo(recentText) {
      if (!this.autoUndo || !this.lastExpansion) {
        return { undo: false };
      }
      const { rawTrigger, expandedText, delimiter, step, timestamp } = this.lastExpansion;
      if (Date.now() - timestamp > 1e4) {
        this.lastExpansion = null;
        return { undo: false };
      }
      if (step === 1) {
        const expectedSuffix = expandedText + delimiter;
        if (recentText && recentText.endsWith(expectedSuffix)) {
          this.lastExpansion = {
            rawTrigger,
            expandedText,
            delimiter,
            step: 2,
            timestamp: Date.now()
          };
          return {
            undo: true,
            step: 1,
            rawTrigger,
            revertText: expandedText,
            removeLength: delimiter.length
            // Remove only the trailing delimiter
          };
        }
      }
      if (step === 2) {
        if (recentText && recentText.endsWith(expandedText)) {
          this.lastExpansion = null;
          this.suppressedTrigger = rawTrigger;
          return {
            undo: true,
            step: 2,
            rawTrigger,
            revertText: rawTrigger,
            removeLength: expandedText.length
          };
        }
      }
      return { undo: false };
    }
    /**
     * Smart Punctuation Snapping:
     * When macro just expanded with space (e.g. "Việt Nam "), if next key is a punctuation mark
     * (such as , . ; : ! ? ) ] } >), snap the punctuation directly to the end of expandedText
     * eliminating the unnatural trailing space (e.g. "Việt Nam, " or "Việt Nam.").
     * @param {string} nextKey Next key pressed by user
     * @param {string} recentText Text immediately before caret
     * @returns {{ snap: boolean, snappedText?: string, deleteLength?: number }}
     */
    checkPunctuationSnap(nextKey, recentText) {
      if (!this.lastExpansion || this.lastExpansion.step !== 1) {
        return { snap: false };
      }
      const { expandedText, delimiter, timestamp } = this.lastExpansion;
      if (Date.now() - timestamp > 8e3) {
        this.lastExpansion = null;
        return { snap: false };
      }
      if (delimiter !== " ") {
        return { snap: false };
      }
      const SNAPPABLE_PUNCTUATION = /* @__PURE__ */ new Set([",", ".", ";", ":", "!", "?", ")", "]", "}", ">"]);
      if (!SNAPPABLE_PUNCTUATION.has(nextKey)) {
        return { snap: false };
      }
      const expectedSuffix = expandedText + " ";
      if (recentText && recentText.endsWith(expectedSuffix)) {
        this.lastExpansion = null;
        return {
          snap: true,
          deleteLength: 1,
          // Remove the single trailing space
          snappedChar: nextKey
        };
      }
      return { snap: false };
    }
    /**
     * Resolve Dynamic Date & Time variables in macro expansion
     * $DATE -> DD/MM/YYYY (e.g. 08/11/2026)
     * $TIME -> HH:mm (e.g. 08:45)
     * $DATETIME -> DD/MM/YYYY HH:mm
     * $YEAR -> YYYY
     */
    resolveDynamicVariables(value) {
      if (!value || typeof value !== "string" || !value.includes("$")) {
        return value;
      }
      const now = /* @__PURE__ */ new Date();
      const pad = (n) => String(n).padStart(2, "0");
      const day = pad(now.getDate());
      const month = pad(now.getMonth() + 1);
      const year = String(now.getFullYear());
      const hours = pad(now.getHours());
      const minutes = pad(now.getMinutes());
      const dateStr = `${day}/${month}/${year}`;
      const timeStr = `${hours}:${minutes}`;
      const dateTimeStr = `${dateStr} ${timeStr}`;
      return value.replace(/\$DATETIME\b/g, dateTimeStr).replace(/\$DATE\b/g, dateStr).replace(/\$TIME\b/g, timeStr).replace(/\$YEAR\b/g, year);
    }
    clearUndo() {
      this.lastExpansion = null;
      this.suppressedTrigger = null;
    }
    /**
     * Case preservation rules:
     * 1. all lowercase (vn) -> use value (Việt Nam or lowercase)
     * 2. ALL UPPERCASE (VN) -> transform value to UPPERCASE (VIỆT NAM)
     * 3. Capitalized first letter (Vn) -> capitalize first letter of value (Việt Nam)
     */
    preserveCase(rawWord, value) {
      if (!value || !rawWord) return value;
      const isAllUpper = rawWord === rawWord.toUpperCase() && rawWord !== rawWord.toLowerCase();
      if (isAllUpper) {
        return value.toUpperCase();
      }
      const isCapitalized = rawWord[0] === rawWord[0].toUpperCase() && rawWord[0] !== rawWord[0].toLowerCase();
      if (isCapitalized) {
        return value.charAt(0).toUpperCase() + value.slice(1);
      }
      return value;
    }
    /**
     * Export macros as JSON string
     */
    exportJSON() {
      return JSON.stringify(this.getMacros(), null, 2);
    }
    /**
     * Import macros from JSON string
     */
    importJSON(jsonString) {
      try {
        const data = JSON.parse(jsonString);
        if (Array.isArray(data)) {
          this.loadMacros(data);
          return { success: true, count: data.length };
        }
        return { success: false, error: "JSON root must be an array of macro objects." };
      } catch (err) {
        return { success: false, error: err.message };
      }
    }
    /**
     * Export macros as CSV string
     */
    exportCSV() {
      const rows = ["trigger,value,enabled"];
      for (const macro of this.getMacros()) {
        const escValue = `"${macro.value.replace(/"/g, '""')}"`;
        rows.push(`${macro.trigger},${escValue},${macro.enabled ? 1 : 0}`);
      }
      return rows.join("\n");
    }
    /**
     * Import macros from CSV string
     */
    importCSV(csvString) {
      try {
        const lines = csvString.trim().split(/\r?\n/);
        if (lines.length === 0) return { success: false, error: "Empty CSV file" };
        const newMacros = [];
        const startIndex = lines[0].toLowerCase().includes("trigger") ? 1 : 0;
        for (let i = startIndex; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          const parts = [];
          let inQuotes = false;
          let current = "";
          for (let c = 0; c < line.length; c++) {
            const char = line[c];
            if (char === '"') {
              if (inQuotes && line[c + 1] === '"') {
                current += '"';
                c++;
              } else {
                inQuotes = !inQuotes;
              }
            } else if (char === "," && !inQuotes) {
              parts.push(current.trim());
              current = "";
            } else {
              current += char;
            }
          }
          parts.push(current.trim());
          if (parts.length >= 2) {
            const trigger = parts[0];
            const value = parts[1];
            const enabled = parts.length > 2 ? parts[2] !== "0" && parts[2].toLowerCase() !== "false" : true;
            if (trigger) {
              newMacros.push({ trigger, value, enabled });
            }
          }
        }
        this.loadMacros(newMacros);
        return { success: true, count: newMacros.length };
      } catch (err) {
        return { success: false, error: err.message };
      }
    }
  };

  // src/content/dom-observer.js
  var DomObserver = class {
    constructor(options = {}) {
      this.blacklistedDomains = new Set(options.blacklistedDomains || []);
      this.disabledOnPassword = options.disabledOnPassword ?? true;
      this.disabledOnDataNoIme = options.disabledOnDataNoIme ?? true;
    }
    setBlacklistedDomains(domains) {
      this.blacklistedDomains = new Set(domains);
    }
    isCurrentDomainBlacklisted() {
      if (typeof window === "undefined" || !window.location) return false;
      const hostname = window.location.hostname.toLowerCase();
      if (hostname === "docs.google.com") {
        return true;
      }
      for (const domain of this.blacklistedDomains) {
        if (domain && (hostname === domain || hostname.endsWith("." + domain))) {
          return true;
        }
      }
      return false;
    }
    /**
     * Deeply resolve active focused element through Shadow DOM roots
     */
    getActiveElement(root = document) {
      let active = root.activeElement;
      while (active && active.shadowRoot && active.shadowRoot.activeElement) {
        active = active.shadowRoot.activeElement;
      }
      return active;
    }
    /**
     * Determine if the element is an editable target for Vietnamese IME & Macro
     */
    isEligibleTarget(element) {
      if (!element || !(element instanceof HTMLElement)) {
        return false;
      }
      if (this.isCurrentDomainBlacklisted()) {
        return false;
      }
      if (this.disabledOnDataNoIme && element.closest("[data-no-ime], [data-no-avim], .no-ime, .no-avim")) {
        return false;
      }
      if (element.hasAttribute("disabled") || element.hasAttribute("readonly")) {
        return false;
      }
      if (element instanceof HTMLInputElement) {
        const type = (element.type || "text").toLowerCase();
        const excludedTypes = ["password", "number", "email", "tel", "checkbox", "radio", "file", "button", "submit", "reset", "color", "date", "range"];
        if (excludedTypes.includes(type)) {
          return false;
        }
        return true;
      }
      if (element instanceof HTMLTextAreaElement) {
        return true;
      }
      if (element.isContentEditable || element.getAttribute("contenteditable") === "true" || element.getAttribute("role") === "textbox") {
        return true;
      }
      return false;
    }
  };

  // src/content/text-replacer.js
  var TextReplacer = class {
    /**
     * Replace text in a native HTMLInputElement or HTMLTextAreaElement
     * @param {HTMLInputElement|HTMLTextAreaElement} el
     * @param {number} startIndex Start index of text to replace
     * @param {number} endIndex End index of text to replace
     * @param {string} replacement New replacement text
     */
    replaceInNativeInput(el, startIndex, endIndex, replacement) {
      const nfcReplacement = (replacement || "").normalize("NFC");
      const originalValue = el.value;
      const before = originalValue.slice(0, startIndex);
      const after = originalValue.slice(endIndex);
      const newValue = before + nfcReplacement + after;
      const newCaretPos = startIndex + nfcReplacement.length;
      if (typeof el.setRangeText === "function") {
        el.setRangeText(nfcReplacement, startIndex, endIndex, "end");
      } else {
        el.value = newValue;
        el.setSelectionRange(newCaretPos, newCaretPos);
      }
      el.selectionStart = newCaretPos;
      el.selectionEnd = newCaretPos;
      this.dispatchSyntheticInput(el, nfcReplacement);
    }
    /**
     * Replace text in a ContentEditable container (handles regular editors and ProseMirror/TipTap)
     * @param {HTMLElement} root ContentEditable root
     * @param {string} oldText String to replace
     * @param {string} newText Replacement string
     */
    replaceInContentEditable(root, oldText, newText) {
      const sel = window.getSelection();
      if (!sel || !sel.rangeCount) return;
      const nfcNewText = (newText || "").normalize("NFC");
      const nfcOldText = (oldText || "").normalize("NFC");
      if (!nfcOldText) {
        try {
          if (document.execCommand("insertText", false, nfcNewText)) {
            this.dispatchSyntheticInput(root, nfcNewText);
            return;
          }
        } catch {
        }
      }
      const range = sel.getRangeAt(0);
      let node = range.startContainer;
      let offset = range.startOffset;
      if (node.nodeType === Node.ELEMENT_NODE && node.childNodes.length > 0) {
        if (offset > 0 && node.childNodes[offset - 1]) {
          const prev = node.childNodes[offset - 1];
          if (prev.nodeType === Node.TEXT_NODE) {
            node = prev;
            offset = prev.textContent.length;
          } else if (prev.lastChild && prev.lastChild.nodeType === Node.TEXT_NODE) {
            node = prev.lastChild;
            offset = node.textContent.length;
          }
        } else if (node.childNodes[offset] && node.childNodes[offset].nodeType === Node.TEXT_NODE) {
          node = node.childNodes[offset];
          offset = 0;
        }
      }
      if (node && node.nodeType === Node.TEXT_NODE) {
        const rawText = node.textContent || "";
        const text = rawText.normalize("NFC");
        const textBeforeCursor = text.slice(0, offset);
        if (textBeforeCursor.endsWith(nfcOldText)) {
          const replaceStart = offset - nfcOldText.length;
          const newContent = text.slice(0, replaceStart) + nfcNewText + text.slice(offset);
          try {
            const replaceRange = document.createRange();
            replaceRange.setStart(node, replaceStart);
            replaceRange.setEnd(node, offset);
            sel.removeAllRanges();
            sel.addRange(replaceRange);
            this.dispatchBeforeInput(root, nfcNewText, replaceRange);
            if (document.execCommand("insertText", false, nfcNewText)) {
              this.dispatchSyntheticInput(root, nfcNewText);
              return;
            }
          } catch {
          }
          node.textContent = newContent;
          const newOffset = replaceStart + nfcNewText.length;
          const newRange2 = document.createRange();
          newRange2.setStart(node, Math.min(newOffset, newContent.length));
          newRange2.collapse(true);
          sel.removeAllRanges();
          sel.addRange(newRange2);
          this.dispatchSyntheticInput(root, nfcNewText);
          return;
        }
      }
      const textNode = document.createTextNode(nfcNewText);
      range.deleteContents();
      range.insertNode(textNode);
      const newRange = document.createRange();
      newRange.setStart(textNode, textNode.length);
      newRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(newRange);
      this.dispatchSyntheticInput(root, nfcNewText);
    }
    /**
     * Dispatch synthetic beforeinput event for modern rich editors (TipTap / ProseMirror)
     */
    dispatchBeforeInput(element, insertedText, targetRange) {
      if (typeof InputEvent !== "function") return;
      try {
        const init = {
          bubbles: true,
          cancelable: true,
          inputType: "insertReplacementText",
          data: insertedText
        };
        if (targetRange && typeof InputEvent.prototype.getTargetRanges === "function") {
          init.targetRanges = [targetRange];
        }
        const beforeInputEvent = new InputEvent("beforeinput", init);
        element.dispatchEvent(beforeInputEvent);
      } catch {
      }
    }
    /**
     * Dispatch synthetic InputEvent and Event('change')
     */
    dispatchSyntheticInput(element, insertedText) {
      let inputEvent;
      try {
        inputEvent = new InputEvent("input", {
          bubbles: true,
          cancelable: true,
          inputType: "insertText",
          data: insertedText
        });
      } catch {
        inputEvent = document.createEvent("Event");
        inputEvent.initEvent("input", true, true);
      }
      element.dispatchEvent(inputEvent);
    }
    /**
     * Extract recent word buffer before caret from native input
     */
    extractNativeWordBuffer(el) {
      const pos = el.selectionStart ?? el.value.length;
      const value = el.value || "";
      const textBefore = value.slice(0, pos);
      const match = textBefore.match(/([\p{L}\p{N}'’]+)$/u);
      if (match) {
        let word = match[1];
        let startIndex = pos - word.length;
        if (/^['’]/.test(word) && !/^[A-Za-z]['’]/.test(word)) {
          word = word.slice(1);
          startIndex += 1;
        }
        return {
          word,
          startIndex,
          endIndex: pos
        };
      }
      return { word: "", startIndex: pos, endIndex: pos };
    }
    /**
     * Extract recent word buffer before caret from ContentEditable
     * Supports TEXT_NODE as well as ELEMENT_NODE containers (ProseMirror / TipTap)
     */
    extractContentEditableWordBuffer() {
      const sel = window.getSelection();
      if (!sel || !sel.rangeCount) return { word: "" };
      const range = sel.getRangeAt(0);
      let node = range.startContainer;
      let offset = range.startOffset;
      if (node.nodeType === Node.ELEMENT_NODE && node.childNodes.length > 0) {
        if (offset > 0 && node.childNodes[offset - 1]) {
          const prev = node.childNodes[offset - 1];
          if (prev.nodeType === Node.TEXT_NODE) {
            node = prev;
            offset = prev.textContent.length;
          } else if (prev.lastChild && prev.lastChild.nodeType === Node.TEXT_NODE) {
            node = prev.lastChild;
            offset = node.textContent.length;
          }
        } else if (node.childNodes[offset] && node.childNodes[offset].nodeType === Node.TEXT_NODE) {
          node = node.childNodes[offset];
          offset = 0;
        }
      }
      if (node && node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || "";
        const textBefore = text.slice(0, offset);
        const match = textBefore.match(/([\p{L}\p{N}'’]+)$/u);
        if (match) {
          let word = match[1];
          let startIndex = offset - word.length;
          if (/^['’]/.test(word) && !/^[A-Za-z]['’]/.test(word)) {
            word = word.slice(1);
            startIndex += 1;
          }
          return {
            word,
            textNode: node,
            startIndex,
            endIndex: offset
          };
        }
      }
      return { word: "" };
    }
  };

  // src/engine/emoji.js
  var EMOJI_MAP = {
    // Biểu cảm khuôn mặt / Feelings
    "tim": "\u2764\uFE0F",
    "heart": "\u2764\uFE0F",
    "traitim": "\u2764\uFE0F",
    "yeu": "\u2764\uFE0F",
    "cuoi": "\u{1F604}",
    "smile": "\u{1F604}",
    "happy": "\u{1F60A}",
    "matcuoi": "\u{1F60A}",
    "haha": "\u{1F606}",
    "lol": "\u{1F602}",
    "roinuocmat": "\u{1F602}",
    "kaka": "\u{1F923}",
    "buon": "\u{1F622}",
    "sad": "\u{1F622}",
    "khoc": "\u{1F62D}",
    "cry": "\u{1F62D}",
    "ngau": "\u{1F60E}",
    "cool": "\u{1F60E}",
    "kinhram": "\u{1F60E}",
    "hon": "\u{1F618}",
    "kiss": "\u{1F618}",
    "yeuthuong": "\u{1F970}",
    "suynghi": "\u{1F914}",
    "think": "\u{1F914}",
    "ngaunhien": "\u{1F92F}",
    "wow": "\u{1F62E}",
    "tucgian": "\u{1F621}",
    "angry": "\u{1F621}",
    "ngu": "\u{1F634}",
    "sleep": "\u{1F634}",
    "nhaymat": "\u{1F609}",
    "wink": "\u{1F609}",
    // Cử chỉ tay / Gestures
    "like": "\u{1F44D}",
    "1": "\u{1F44D}",
    "thich": "\u{1F44D}",
    "up": "\u{1F44D}",
    "dislike": "\u{1F44E}",
    "che": "\u{1F44E}",
    "down": "\u{1F44E}",
    "ok": "\u{1F44C}",
    "tot": "\u{1F44C}",
    "votay": "\u{1F44F}",
    "clap": "\u{1F44F}",
    "cau": "\u{1F64F}",
    "pray": "\u{1F64F}",
    "xin": "\u{1F64F}",
    "camon": "\u{1F64F}",
    "vui": "\u270C\uFE0F",
    "peace": "\u270C\uFE0F",
    "namdam": "\u{1F44A}",
    "fist": "\u{1F44A}",
    "chao": "\u{1F44B}",
    "wave": "\u{1F44B}",
    "co": "\u{1F4AA}",
    "strong": "\u{1F4AA}",
    "chiton": "\u{1F449}",
    "point": "\u{1F449}",
    // Biểu tượng & Đồ vật / Symbols & Objects
    "lua": "\u{1F525}",
    "fire": "\u{1F525}",
    "hot": "\u{1F525}",
    "sao": "\u2B50",
    "star": "\u2B50",
    "100": "\u{1F4AF}",
    "diem100": "\u{1F4AF}",
    "check": "\u2705",
    "tich": "\u2705",
    "done": "\u2705",
    "x": "\u274C",
    "cross": "\u274C",
    "sai": "\u274C",
    "party": "\u{1F389}",
    "tiec": "\u{1F389}",
    "chucmung": "\u{1F389}",
    "mattrang": "\u{1F319}",
    "moon": "\u{1F319}",
    "mattroi": "\u2600\uFE0F",
    "sun": "\u2600\uFE0F",
    "set": "\u26A1",
    "flash": "\u26A1",
    "quatang": "\u{1F381}",
    "gift": "\u{1F381}",
    "tien": "\u{1F4B5}",
    "money": "\u{1F4B5}",
    "bongda": "\u26BD",
    "football": "\u26BD",
    "caidat": "\u2699\uFE0F",
    "gear": "\u2699\uFE0F",
    "khoa": "\u{1F512}",
    "lock": "\u{1F512}",
    "chuong": "\u{1F514}",
    "bell": "\u{1F514}",
    "canhbao": "\u26A0\uFE0F",
    "warning": "\u26A0\uFE0F",
    "coffee": "\u2615",
    "cafe": "\u2615",
    "bia": "\u{1F37A}",
    "beer": "\u{1F37A}",
    "vietnam": "\u{1F1FB}\u{1F1F3}",
    "vn": "\u{1F1FB}\u{1F1F3}",
    "covietnam": "\u{1F1FB}\u{1F1F3}"
  };
  function checkEmojiShortcut(token) {
    if (!token || typeof token !== "string") return { match: false };
    const clean = token.trim();
    if (clean.length >= 3 && clean.startsWith(":") && clean.endsWith(":")) {
      const code = clean.slice(1, -1).toLowerCase();
      if (EMOJI_MAP[code]) {
        return { match: true, emoji: EMOJI_MAP[code], code };
      }
    }
    return { match: false };
  }
  function getEmojiSuggestions(query, limit = 4) {
    if (!query || !query.startsWith(":")) return [];
    const prefix = query.slice(1).toLowerCase();
    const results = [];
    const seenEmojis = /* @__PURE__ */ new Set();
    for (const [code, emoji] of Object.entries(EMOJI_MAP)) {
      if (seenEmojis.has(emoji)) continue;
      if (code.startsWith(prefix) || prefix.length === 0) {
        results.push({
          word: emoji,
          code: `:${code}:`,
          displayType: `:${code}:`,
          type: "emoji",
          emoji
        });
        seenEmojis.add(emoji);
        if (results.length >= limit) break;
      }
    }
    return results;
  }

  // src/engine/autocomplete.js
  function stripVietnameseAccents(str) {
    if (!str) return "";
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();
  }
  var COMMON_VIETNAMESE_COMPOUNDS = [
    // Công nghệ, máy tính, tin học
    "nghi\xEAn c\u1EE9u",
    "c\xF4ng ngh\u1EC7",
    "th\xF4ng tin",
    "tr\xED tu\u1EC7 nh\xE2n t\u1EA1o",
    "l\u1EADp tr\xECnh",
    "ph\u1EA7n m\u1EC1m",
    "ph\u1EA7n c\u1EE9ng",
    "\u1EE9ng d\u1EE5ng",
    "tr\xECnh duy\u1EC7t",
    "ti\u1EC7n \xEDch",
    "m\u1EDF r\u1ED9ng",
    "d\u1EEF li\u1EC7u",
    "m\u1EA1ng m\xE1y t\xEDnh",
    "h\u1EC7 \u0111i\u1EC1u h\xE0nh",
    "b\u1EA3o m\u1EADt",
    "an to\xE0n",
    "m\u1EADt kh\u1EA9u",
    "t\xE0i kho\u1EA3n",
    "\u0111\u0103ng nh\u1EADp",
    "\u0111\u0103ng k\xFD",
    "giao di\u1EC7n",
    "tr\u1EF1c tuy\u1EBFn",
    "t\u1EA3i xu\u1ED1ng",
    "c\xE0i \u0111\u1EB7t",
    "k\u1EBFt n\u1ED1i",
    "m\xE1y ch\u1EE7",
    "trang web",
    "c\u01A1 s\u1EDF d\u1EEF li\u1EC7u",
    "thi\u1EBFt b\u1ECB",
    "\u0111i\u1EC7n t\u1EED",
    "tr\u1EF1c quan",
    "t\u1ED1i \u01B0u h\xF3a",
    "t\u1EF1 \u0111\u1ED9ng",
    "thu\u1EADt to\xE1n",
    "h\u1EC7 th\u1ED1ng",
    "phi\xEAn b\u1EA3n",
    "c\u1EADp nh\u1EADt",
    "n\xE2ng c\u1EA5p",
    "b\u1ED9 nh\u1EDB",
    "t\u1ED1c \u0111\u1ED9",
    "dung l\u01B0\u1EE3ng",
    "x\u1EED l\xFD",
    "th\u1EF1c thi",
    "ki\u1EC3m th\u1EED",
    "kh\u1EDFi \u0111\u1ED9ng",
    "chuy\u1EC3n \u0111\u1ED5i",
    // Y tế, sức khỏe & cấp cứu
    "c\u1EA5p c\u1EE9u",
    "b\xE1c s\u0129",
    "b\u1EC7nh vi\u1EC7n",
    "y t\u1EBF",
    "s\u1EE9c kh\u1ECFe",
    "kh\xE1m b\u1EC7nh",
    "ch\u1EEFa b\u1EC7nh",
    "thu\u1ED1c t\xE2y",
    "d\u01B0\u1EE3c ph\u1EA9m",
    "\u0111i\u1EC1u tr\u1ECB",
    "ch\u0103m s\xF3c",
    "b\u1EA3o hi\u1EC3m",
    "ph\xF2ng kh\xE1m",
    "y t\xE1",
    "d\u01B0\u1EE3c s\u0129",
    "h\u1ED3i s\u1EE9c",
    "c\u1EE9u h\u1ED9",
    "c\u1EE9u n\u1EA1n",
    "c\u1EE9u th\u01B0\u01A1ng",
    "kh\u1EA9n c\u1EA5p",
    "s\u01A1 c\u1EE9u",
    "ch\u1EA9n \u0111o\xE1n",
    "x\xE9t nghi\u1EC7m",
    "ph\u1EE5c h\u1ED3i",
    // Đời sống, gia đình, xã hội
    "gia \u0111\xECnh",
    "b\u1EA1n b\xE8",
    "cha m\u1EB9",
    "anh em",
    "\u0111\u1ED3ng nghi\u1EC7p",
    "h\u1EA1nh ph\xFAc",
    "vui v\u1EBB",
    "may m\u1EAFn",
    "b\xECnh an",
    "th\xE0nh c\xF4ng",
    "y\xEAu th\u01B0\u01A1ng",
    "cu\u1ED9c s\u1ED1ng",
    "con ng\u01B0\u1EDDi",
    "x\xE3 h\u1ED9i",
    "v\u0103n h\xF3a",
    "truy\u1EC1n th\u1ED1ng",
    "hi\u1EC7n \u0111\u1EA1i",
    "l\u1ECBch s\u1EED",
    "\u0111\u1EA5t n\u01B0\u1EDBc",
    "th\xE0nh ph\u1ED1",
    "vi\u1EC7t nam",
    "qu\u1ED1c t\u1EBF",
    "th\u1EBF gi\u1EDBi",
    "m\xF4i tr\u01B0\u1EDDng",
    "thi\xEAn nhi\xEAn",
    "th\u1EDDi ti\u1EBFt",
    "kh\xED h\u1EADu",
    "bu\u1ED5i s\xE1ng",
    "bu\u1ED5i tr\u01B0a",
    "bu\u1ED5i chi\u1EC1u",
    "bu\u1ED5i t\u1ED1i",
    "h\xF4m nay",
    "ng\xE0y mai",
    "h\xF4m qua",
    "tu\u1EA7n n\xE0y",
    "th\xE1ng n\xE0y",
    "n\u0103m nay",
    "t\u01B0\u01A1ng lai",
    "qu\xE1 kh\u1EE9",
    // Công việc, kinh tế, quản lý
    "ph\xE1t tri\u1EC3n",
    "qu\u1EA3n l\xFD",
    "kinh doanh",
    "doanh nghi\u1EC7p",
    "c\xF4ng ty",
    "kh\xE1ch h\xE0ng",
    "h\u1EE3p \u0111\u1ED3ng",
    "kinh t\u1EBF",
    "th\u01B0\u01A1ng m\u1EA1i",
    "d\u1ECBch v\u1EE5",
    "s\u1EA3n ph\u1EA9m",
    "th\u1ECB tr\u01B0\u1EDDng",
    "ti\xEAu d\xF9ng",
    "th\u01B0\u01A1ng hi\u1EC7u",
    "uy t\xEDn",
    "ch\u1EA5t l\u01B0\u1EE3ng",
    "hi\u1EC7u qu\u1EA3",
    "ti\u1EBFn \u0111\u1ED9",
    "k\u1EBF ho\u1EA1ch",
    "d\u1EF1 \xE1n",
    "b\xE1o c\xE1o",
    "\u0111\xE1nh gi\xE1",
    "th\u1EA3o lu\u1EADn",
    "h\u1ED9i ngh\u1ECB",
    "cu\u1ED9c h\u1ECDp",
    "\u0111\u1EC1 xu\u1EA5t",
    "gi\u1EA3i ph\xE1p",
    "\xFD t\u01B0\u1EDFng",
    "s\xE1ng t\u1EA1o",
    "\u0111\u1ED5i m\u1EDBi",
    "th\xE0nh l\u1EADp",
    "h\u1EE3p t\xE1c",
    "\u0111\u1EA7u t\u01B0",
    "t\xE0i ch\xEDnh",
    "ng\xE2n h\xE0ng",
    "chi ph\xED",
    "doanh thu",
    "l\u1EE3i nhu\u1EADn",
    "nhi\u1EC7m v\u1EE5",
    "tr\xE1ch nhi\u1EC7m",
    "m\u1EE5c ti\xEAu",
    "k\u1EBFt qu\u1EA3",
    "th\xE0nh t\u1EF1u",
    "kinh nghi\u1EC7m",
    "chuy\xEAn m\xF4n",
    // Giáo dục, học tập, khoa học
    "gi\xE1o d\u1EE5c",
    "h\u1ECDc t\u1EADp",
    "h\u1ECDc sinh",
    "sinh vi\xEAn",
    "gi\xE1o vi\xEAn",
    "th\u1EA7y c\xF4",
    "tr\u01B0\u1EDDng h\u1ECDc",
    "\u0111\u1EA1i h\u1ECDc",
    "ki\u1EBFn th\u1EE9c",
    "k\u1EF9 n\u0103ng",
    "b\xE0i t\u1EADp",
    "ki\u1EC3m tra",
    "k\u1EF3 thi",
    "t\u1ED1t nghi\u1EC7p",
    "b\u1EB1ng c\u1EA5p",
    "khoa h\u1ECDc",
    "to\xE1n h\u1ECDc",
    "v\u1EADt l\xFD",
    "h\xF3a h\u1ECDc",
    "sinh h\u1ECDc",
    "\u0111\u1ECBa l\xFD",
    "ng\xF4n ng\u1EEF",
    "ti\u1EBFng vi\u1EC7t",
    "ti\u1EBFng anh",
    "ngo\u1EA1i ng\u1EEF",
    "s\xE1ch b\xE1o",
    "t\xE0i li\u1EC7u",
    "th\u01B0 vi\u1EC7n",
    "h\u1ED9i th\u1EA3o",
    "nghi\xEAn c\u1EE9u sinh",
    // Giao tiếp & Hành động thường ngày
    "xin ch\xE0o",
    "c\u1EA3m \u01A1n",
    "xin l\u1ED7i",
    "t\u1EA1m bi\u1EC7t",
    "h\u1EB9n g\u1EB7p l\u1EA1i",
    "ch\xFAc m\u1EEBng",
    "l\xE0m phi\u1EC1n",
    "gi\xFAp \u0111\u1EE1",
    "h\u1ED7 tr\u1EE3",
    "li\xEAn h\u1EC7",
    "th\xF4ng b\xE1o",
    "y\xEAu c\u1EA7u",
    "h\u01B0\u1EDBng d\u1EABn",
    "s\u1EED d\u1EE5ng",
    "th\u1EF1c hi\u1EC7n",
    "ho\xE0n th\xE0nh",
    "b\u1EAFt \u0111\u1EA7u",
    "k\u1EBFt th\xFAc",
    "ti\u1EBFp t\u1EE5c",
    "d\u1EEBng l\u1EA1i",
    "quan tr\u1ECDng",
    "c\u1EA7n thi\u1EBFt",
    "\u0111\u1EB7c bi\u1EC7t",
    "ph\u1ED5 bi\u1EBFn",
    "tuy\u1EC7t v\u1EDDi",
    "xu\u1EA5t s\u1EAFc",
    "h\xE0i l\xF2ng",
    "y\xEAn t\xE2m",
    "tin t\u01B0\u1EDFng",
    "hy v\u1ECDng",
    "quy\u1EBFt \u0111\u1ECBnh",
    "l\u1EF1a ch\u1ECDn",
    "thay \u0111\u1ED5i",
    "c\u1EA3i ti\u1EBFn",
    "kh\u1EAFc ph\u1EE5c",
    "gi\u1EA3i quy\u1EBFt",
    // Địa danh Tây Nguyên & Dân tộc thiểu số
    "\u0110\u1EAFk L\u1EAFk",
    "\u0110\u1EAFk N\xF4ng",
    "Kon Tum",
    "Gia Lai",
    "L\xE2m \u0110\u1ED3ng",
    "Bu\xF4n Ma Thu\u1ED9t",
    "Pleiku",
    "B\u1EA3o L\u1ED9c",
    "\u0110\xE0 L\u1EA1t",
    "A Yun Pa",
    "Kr\xF4ng N\xF4",
    "Kr\xF4ng B\xFAk",
    "Kr\xF4ng P\u1EAFk",
    "Kr\xF4ng Ana",
    "Kr\xF4ng B\xF4ng",
    "Kr\xF4ng N\u0103ng",
    "Kr\xF4ng A",
    "C\u01B0 M'gar",
    "C\u01B0 Kuin",
    "Ea H'leo",
    "Ea Kar",
    "Ea S\xFAp",
    "M'\u0110r\u1EAFk",
    "\u0110\u1EAFk Mil",
    "\u0110\u1EAFk Song",
    "\u0110\u1EAFk Glong",
    "\u0110\u1EAFk T\xF4",
    "\u0110\u1EAFk H\xE0",
    "\u0110\u1EAFk \u0110oa",
    "Ch\u01B0 S\xEA",
    "Ch\u01B0 Pr\xF4ng",
    "Ch\u01B0 P\u0103h",
    "\u0110\u1EE9c C\u01A1",
    "Ia Grai",
    "Ia H'Drai",
    "Sa Th\u1EA7y",
    "Ng\u1ECDc H\u1ED3i",
    "Tu M\u01A1 R\xF4ng",
    "\u0110\u01A1n D\u01B0\u01A1ng",
    "\u0110am R\xF4ng",
    "L\u1EA1c D\u01B0\u01A1ng",
    "Di Linh",
    "B\u1EA3o L\xE2m",
    "C\xE1t Ti\xEAn",
    "\u0110\u1EAFk R'l\u1EA5p",
    "T\xE0 Nung",
    "\xD4 Loan",
    // Địa danh Bắc - Trung - Nam phổ biến
    "H\xE0 N\u1ED9i",
    "H\u1EA3i Ph\xF2ng",
    "Qu\u1EA3ng Ninh",
    "H\u1EA1 Long",
    "Sa Pa",
    "M\u1ED9c Ch\xE2u",
    "Hu\u1EBF",
    "\u0110\xE0 N\u1EB5ng",
    "H\u1ED9i An",
    "Quy Nh\u01A1n",
    "Nha Trang",
    "Phan Thi\u1EBFt",
    "Qu\u1EA3ng Ng\xE3i",
    "Tam K\u1EF3",
    "\u0110\xF4ng H\xE0",
    "Vinh",
    "S\xE0i G\xF2n",
    "Ch\u1EE3 L\u1EDBn",
    "Gia \u0110\u1ECBnh",
    "\u0110a Kao",
    "T\xE2n \u0110\u1ECBnh",
    "B\u1EBFn Th\xE0nh",
    "B\xECnh Th\u1EA1nh",
    "Ph\xFA Nhu\u1EADn",
    "G\xF2 V\u1EA5p",
    "Th\u1EE7 \u0110\u1EE9c",
    "Th\u1EE7 Thi\xEAm",
    "C\u1EA7n Th\u01A1",
    "V\u0169ng T\xE0u",
    "Bi\xEAn H\xF2a",
    "M\u1EF9 Tho",
    "T\xE2n An",
    "G\xF2 C\xF4ng",
    "B\u1EBFn Tre",
    "V\u0129nh Long",
    "Sa \u0110\xE9c",
    "Long Xuy\xEAn",
    "Ch\xE2u \u0110\u1ED1c",
    "R\u1EA1ch Gi\xE1",
    "H\xE0 Ti\xEAn",
    "C\xE0 Mau",
    "B\u1EA1c Li\xEAu",
    "S\xF3c Tr\u0103ng",
    "Tr\xE0 Vinh",
    "V\u1ECB Thanh",
    // Cụm từ Hán-Việt & từ hiếm
    "khu\u1EBFch t\xE1n",
    "khuynh h\u01B0\u1EDBng",
    "ngo\u1EAFt ngo\xE9o",
    "khu\u1EA5y \u0111\u1ED9ng",
    // ── Thành ngữ, tiếng lóng & từ ngữ Sài Gòn xưa / Nam Bộ (Nguyễn Cao Trường) ──
    "b\xE1 ch\xE1y b\xF9 ch\xE9t",
    "b\xE1 l\xE1p b\xE1 x\xE0m",
    "ba la ba x\u1EA1o",
    "ba x\u1EA1o ba k\xE9p",
    "b\xE0 ch\u1EB1n l\u1EEDa",
    "b\u1EA3nh t\u1ECFn",
    "b\u1EADt ng\u1EEDa",
    "b\xECnh th\u1EE7y",
    "b\xF9ng binh",
    "bu\u1ED3n xo",
    "c\xE0 ch\u1EDBn",
    "c\xE0 ch\xE1o",
    "c\xE0 ch\xE1c",
    "c\xE0 ch\u1EDBn c\xE0 ch\xE1o",
    "c\xE0 ch\u1EDBn c\xE0 ch\xE1c",
    "c\xE0 r\u1ECBch c\xE0 tang",
    "c\xE0 nh\u1ECFng c\xE0 nh\u1ECFng",
    "c\xE0 t\xE0ng",
    "c\xE0 gi\u1EF1t",
    "c\xE0 kheo",
    "ch\xF9m hum",
    "c\xF9 l\u1EA7n",
    "c\xF9 l\u1EA7n l\u1EEFa",
    "c\u1EE9ng \u0111\u1EA7u c\u1EE9ng c\u1ED5",
    "d\u1EB1n m\u1EB7t",
    "d\u1EC5 ng\u01B0\u01A1i",
    "\u0111\xF2 Th\u1EE7 Thi\xEAm",
    "h\u1EA1p gu",
    "h\u1EBFt b\xE0i",
    "h\u1EBFt bi\u1EBFt",
    "h\u1EBFt s\u1EA9y",
    "h\u1EBFt x\u1EA9y",
    "h\u1EBFt x\xED qu\xE1ch",
    "h\u1EBFt ga h\u1EBFt s\u1ED1",
    "h\u1ED5ng ch\u1EEBng",
    "h\u1ED5ng c\xF3 chi",
    "h\u1ED5ng d\xE1m \u0111\xE2u",
    "h\xFAt gi\xF3",
    "l\xE0m n\u01B0",
    "l\xE1ng ch\xE1ng",
    "l\u1EBFt b\xE1nh",
    "m\xE8n \u01A1i",
    "m\xE8n \u0111\xE9c \u01A1i",
    "m\u01B0a th\xFAi \u0111\u1EA5t",
    "ngon l\xE0nh c\xE0nh \u0111\xE0o",
    "qu\xE1 m\u1EA1ng",
    "qu\xE1 x\xE1",
    "qu\u1EC9 tha ma b\u1EAFt",
    "r\u1EC1 r\xE0",
    "r\u1EA7n r\u1EA7n",
    "sang c\u1EA3",
    "say x\u1EC9n",
    "s\u1ED1 dz\xE1ch",
    "s\u01B0\u01A1ng s\u01B0\u01A1ng",
    "s\u1EE9c m\u1EA5y",
    "t\xE1ng m\u1EA1ng",
    "t\xE0o lao m\xEDa lao",
    "t\xE0o lao chi \u0111\u1ECBa",
    "t\xE9 re",
    "t\xE9m t\xE9m",
    "th\u1EA7y Hai",
    "th\u1EA7y th\u1EE3",
    "th\u1ECDc c\xF9 l\xE9t",
    "th\u1ECDc l\xE9t",
    "th\u1EC1m ba",
    "t\xEDa m\xE1",
    "t\xEDa lia",
    "tr\u1EAFng x\xE1c",
    "tr\u1EDDi \u0111\xE1nh th\xE1nh \u0111\xE2m",
    "tr\u1EDDi th\u1EA7n \u01A1i",
    "tr\u1EDBt qu\u1EDBt",
    "tr\xF9m s\xF2",
    "tr\xFAng m\xE1nh",
    "tr\xFAng m\u1ED1i",
    "tr\xFAng t\u1EE7",
    "v\u1EAFt gi\xF2 l\xEAn c\u1ED5",
    "v\xF4 ph\u01B0\u01A1ng",
    "x\xE1 x\u1ECB",
    "xe lam",
    "xe th\u1ED5 m\u1ED9",
    "xe \u0111\xF2",
    "xe l\xF4i",
    "x\u1EADp x\xE1m",
    "x\u1EC1 x\xF2a",
    "x\xEC d\u1EA7u",
    "x\xED g\u1EA1t",
    "x\xED m\u1EE5i",
    // ── Từ vựng đời sống & phương ngữ Nam Bộ thân thương ──
    "b\u1EEFa nay",
    "h\u1ED5m r\xE0y",
    "h\u1ED3i n\xE3y",
    "ch\xFAt x\xEDu",
    "bao \u0111\u1ED3ng",
    "ch\xE1nh tr\u1EF1c",
    "thi\u1EC7t t\xECnh",
    "b\u1EA3nh bao",
    "ng\u1ED9 ngh\u0129nh",
    "t\xE0i lanh",
    "lanh chanh",
    "x\u1EDFi l\u1EDFi",
    "\u0111i\u1EC7u \u0111\xE0ng",
    "coi b\u1ED9",
    "ng\u1ED9 \xE1 nghen",
    "ngon \u01A1",
    "ng\u1ECDt x\u1EDBt",
    "b\u1EA1c m\u1EA1ng",
    "b\u1EA3nh ch\u1ECDe",
    "b\u1EA1c \u0111\xE3i",
    "ch\u01A1n ch\u1EA5t",
    "ch\u1EAFc m\u1EBBm",
    "c\u01B0ng x\u1EC9u",
    "d\u1EC5 th\u01B0\u01A1ng",
    "\u0111\xE0ng ho\xE0ng",
    "\u0111\u1EE9ng b\xF3ng",
    "h\u1EBFt tr\u01A1n",
    "h\u1EBFt tr\u1ECDi",
    "l\u1EB9 l\xE0ng",
    "l\u1EB9 l\u1EB9",
    "l\xF3ng r\xE0y",
    "mau l\u1EB9",
    "m\u1EA7n \u0103n",
    "mi\u1EC7t v\u01B0\u1EDDn",
    "n\u1EAFng n\xF4i",
    "ng\u1ED9 ngh\xEA",
    "nh\u1EE9t x\u1EE9",
    "nh\xE0n t\u1EA3n",
    "ph\u1EBB re",
    "r\u1EA3nh rang",
    "r\xF4m r\u1EA3",
    "s\u1ED1t s\u1EAFng",
    "thong th\u1EA3",
    "th\u1EA3nh th\u01A1i",
    "th\u01A1m tho",
    "t\u1EC1 ch\u1EC9nh",
    "t\u01B0\u01A1i r\xF3i",
    "vui v\u1EBB",
    "x\u1EDFi l\u1EDFi",
    "x\xF4m t\u1EE5",
    // ── Từ vựng giao tiếp công việc & nghề nghiệp lịch thiệp ──
    "k\xEDnh g\u1EDFi",
    "k\xEDnh g\u1EEDi",
    "tr\xE2n tr\u1ECDng",
    "c\u1EA3m phi\u1EC1n",
    "nh\u1EDD b\u1EA1n",
    "g\u1EEDi b\u1EA1n",
    "g\u1EDFi b\u1EA1n",
    "bi\xEAn b\u1EA3n",
    "th\u1ED1ng nh\u1EA5t",
    "ti\u1EBFn \u0111\u1ED9",
    "th\u1EDDi h\u1EA1n",
    "\u0111\xEDnh k\xE8m",
    "h\u1EE3p t\xE1c",
    "trao \u0111\u1ED5i",
    "b\xE1o c\xE1o",
    "ph\u1EA3n h\u1ED3i"
  ];
  var RAW_VIETNAMESE_BIGRAMS = {
    // ── Quốc gia / dân tộc / địa danh ──
    "vi\u1EC7t": ["nam", "c\u1ED9ng", "ki\u1EC1u", "tr\xEC", "d\xE3", "v\u1ECB", "h\xF3a"],
    "c\u1ED9ng": ["h\xF2a", "s\u1EA3n", "\u0111\u1ED3ng", "t\xE1c", "s\u1EF1", "h\u01B0\u1EDFng"],
    "qu\u1ED1c": ["t\u1EBF", "gia", "t\u1ECBch", "ph\xF2ng", "h\u1ED9i"],
    "th\u1EBF": ["gi\u1EDBi", "k\u1EF7", "h\u1EC7", "l\u1EF1c", "n\xE0o"],
    "\u0111\u1EA5t": ["n\u01B0\u1EDBc", "\u0111ai", "s\xE9t", "v\xE0ng"],
    "\u0111\u1EAFk": ["l\u1EAFk", "n\xF4ng", "mil", "song", "glong", "t\xF4", "h\xE0", "\u0111oa", "r'l\u1EA5p"],
    "bu\xF4n": ["ma thu\u1ED9t", "m\xEA thu\u1ED9t", "l\xE0ng", "b\xE1n"],
    "kr\xF4ng": ["n\xF4", "b\xFAk", "p\u1EAFk", "ana", "b\xF4ng", "n\u0103ng", "a"],
    "kon": ["tum", "pl\xF4ng"],
    "gia": ["lai", "\u0111\xECnh", "nh\u1EADp", "t\u0103ng", "c\xF4ng", "d\u1EE5ng"],
    "l\xE2m": ["\u0111\u1ED3ng", "nghi\u1EC7p", "thao", "chung"],
    "\u0111\xE0": ["l\u1EA1t", "n\u1EB5ng"],
    "b\u1EA3o": ["l\u1ED9c", "l\xE2m", "m\u1EADt", "hi\u1EC3m", "v\u1EC7", "qu\u1EA3n", "tr\xEC", "h\u1ED9", "an"],
    "h\xE0": ["n\u1ED9i", "t\u0129nh", "nam", "giang", "ti\xEAn"],
    "h\u1EA3i": ["ph\xF2ng", "d\u01B0\u01A1ng", "s\u1EA3n", "qu\xE2n", "ngo\u1EA1i"],
    "s\xE0i": ["g\xF2n"],
    "h\u1EA1": ["long", "t\u1EA7ng", "c\xE1nh", "b\u1EC7"],
    "nha": ["trang", "khoa", "h\u1ECDc"],
    "phan": ["thi\u1EBFt", "rang"],
    "b\u1EBFn": ["tre", "xe", "t\xE0u", "\u0111\u1ED7", "ninh ki\u1EC1u", "ngh\xE9"],
    "r\u1EA1ch": ["gi\xE1"],
    "c\xE0": ["mau", "ph\xEA", "chua", "ph\xE1o", "ch\u1EDBn", "r\u1ECBch", "nh\u1ED5ng", "t\xE0ng", "gi\u1EF1t", "kheo", "ch\xE1o", "ch\xE1c"],
    "b\u1EA1c": ["li\xEAu", "tr\u1EAFng", "b\u1EBDo", "\u0111\u1EA7u"],
    "s\xF3c": ["tr\u0103ng", "s\u01A1n"],
    "ch\u01B0": ["s\xEA", "pr\xF4ng", "p\u0103h"],
    "ea": ["h'leo", "kar", "s\xFAp"],
    "c\u01B0": ["m'gar", "kuin", "tr\xFA", "d\xE2n", "x\u1EED"],
    "ia": ["grai", "h'drai"],
    "khu\u1EBFch": ["t\xE1n", "\u0111\u1EA1i"],
    "khuynh": ["h\u01B0\u1EDBng", "\u0111\u1EA3o"],
    // ── Công nghệ / công việc / kinh doanh ──
    "c\xF4ng": ["ngh\u1EC7", "ty", "vi\u1EC7c", "nh\xE2n", "tr\xECnh", "an", "c\u1ED9ng", "d\xE2n"],
    "th\xF4ng": ["tin", "b\xE1o", "minh", "qua", "d\u1ECBch", "th\u01B0\u1EDDng", "tho\xE1ng"],
    "tr\xED": ["tu\u1EC7", "nh\u1EDB", "th\u1EE9c", "n\xE3o", "t\u01B0\u1EDFng"],
    "ph\xE1t": ["tri\u1EC3n", "hi\u1EC7n", "h\xE0nh", "huy", "sinh", "\u0111\u1ED9ng"],
    "kinh": ["t\u1EBF", "doanh", "nghi\u1EC7m", "ph\xED", "kh\u1EE7ng"],
    "doanh": ["nghi\u1EC7p", "thu", "tr\u1EA1i"],
    "s\u1EA3n": ["ph\u1EA9m", "xu\u1EA5t", "sinh", "khoa"],
    "th\u1ECB": ["tr\u01B0\u1EDDng", "x\xE3", "hi\u1EBFu", "th\u1EF1c"],
    "chi": ["ph\xED", "nh\xE1nh", "ti\u1EBFt", "ti\xEAu", "vi\u1EC7n"],
    "l\u1EE3i": ["nhu\u1EADn", "\xEDch", "th\u1EBF", "d\u1EE5ng"],
    "nhi\u1EC7m": ["v\u1EE5", "k\u1EF3"],
    "tr\xE1ch": ["nhi\u1EC7m", "m\u1EAFng", "c\u1EE9"],
    "h\u1EE3p": ["\u0111\u1ED3ng", "t\xE1c", "nh\u1EA5t", "ph\xE1p", "l\xFD", "th\u1EDDi"],
    "m\xE1y": ["t\xEDnh", "ch\u1EE7", "bay", "m\xF3c", "in", "gi\u1EB7t"],
    "h\u1EC7": ["th\u1ED1ng", "\u0111i\u1EC1u h\xE0nh", "sinh th\xE1i", "s\u1ED1", "t\u01B0 t\u01B0\u1EDFng"],
    "trang": ["web", "b\u1ECB", "ch\u1EE7", "tr\xED", "\u0111i\u1EC3m"],
    "d\u1EEF": ["li\u1EC7u", "d\u1ED9i", "ki\u1EC7n"],
    "ki\u1EC3m": ["tra", "th\u1EED", "so\xE1t", "to\xE1n", "\u0111\u1ECBnh"],
    "kh\xE1ch": ["h\xE0ng", "s\u1EA1n", "quan", "th\u1EC3"],
    "m\u1EADt": ["kh\u1EA9u", "m\xE3", "thi\u1EBFt", "\u0111\u1ED9", "v\u1EE5"],
    "t\xE0i": ["kho\u1EA3n", "ch\xEDnh", "n\u0103ng", "lanh", "li\u1EC7u", "s\u1EA3n", "x\u1EBF"],
    "\u0111\u0103ng": ["nh\u1EADp", "k\xFD", "t\u1EA3i", "quang", "cai", "xu\u1EA5t"],
    "giao": ["di\u1EC7n", "ti\u1EBFp", "d\u1ECBch", "th\xF4ng", "h\xE0ng", "k\u1EBFt"],
    "tr\u1EF1c": ["tuy\u1EBFn", "quan", "ti\u1EBFp", "thu\u1ED9c"],
    "t\u1EA3i": ["xu\u1ED1ng", "l\xEAn", "tr\u1ECDng", "b\u1EA3n"],
    "c\xE0i": ["\u0111\u1EB7t", "then", "c\u1EAFm", "b\u1EABy"],
    "kh\u1EDFi": ["\u0111\u1ED9ng", "s\u1EF1", "nghi\u1EC7p", "\u0111\u1EA7u"],
    "k\u1EBFt": ["qu\u1EA3", "n\u1ED1i", "h\u1EE3p", "th\xFAc", "lu\u1EADn", "c\u1EA5u", "tinh"],
    "th\u1EF1c": ["hi\u1EC7n", "t\u1EBF", "thi", "h\xE0nh", "t\u1EADp", "ph\u1EA9m", "ch\u1EA5t"],
    "gi\u1EA3i": ["ph\xE1p", "quy\u1EBFt", "th\xEDch", "tr\xED", "th\u01B0\u1EDFng", "t\u1ECFa"],
    "quan": ["tr\u1ECDng", "t\xE2m", "h\u1EC7", "\u0111i\u1EC3m", "s\xE1t", "ch\u1EE9c"],
    "t\u1ED1i": ["\u01B0u", "nay", "qua", "\u0111a", "thi\u1EC3u", "m\u1EADt"],
    // ── Thời gian ──
    "th\u1EDDi": ["gian", "ti\u1EBFt", "kh\u1EAFc", "\u0111\u1EA1i", "k\u1EF3", "v\u1EE5"],
    "h\xF4m": ["nay", "qua", "kia", "tr\u01B0\u1EDBc"],
    "ng\xE0y": ["mai", "kia", "th\xE1ng", "\u0111\xEAm", "sinh", "c\xF4ng", "h\xF4m", "nay"],
    "tu\u1EA7n": ["n\xE0y", "sau", "tr\u01B0\u1EDBc", "t\u1EDBi"],
    "th\xE1ng": ["n\xE0y", "sau", "tr\u01B0\u1EDBc", "t\u1EDBi", "m\u01B0\u1EDDi"],
    "n\u0103m": ["nay", "sau", "ngo\xE1i", "tr\u01B0\u1EDBc"],
    "gi\u1EDD": ["n\xE0y", "\u0111\xE2y", "r\u1ED3i", "ch\u01B0a"],
    "ph\xFAt": ["tr\u01B0\u1EDBc", "sau", "n\u1EEFa"],
    "gi\xE2y": ["n\u1EEFa", "tr\u01B0\u1EDBc"],
    // ── Gia đình / quan hệ xã hội ──
    "b\u1EA1n": ["b\xE8", "th\xE2n", "\u0111\u1ECDc", "g\xE1i", "trai", "h\xE0ng"],
    "t\xF4i": ["ngh\u0129", "th\u1EA5y", "mu\u1ED1n", "l\xE0", "\u0111ang", "\u0111\xE3", "s\u1EBD", "bi\u1EBFt"],
    "anh": ["em", "\u1EA5y", "ch\u1ECB", "ta", "trai", "y\xEAu", "hai", "ba", "t\u01B0"],
    "ch\u1ECB": ["em", "\u1EA5y", "g\xE1i"],
    "em": ["g\xE1i", "trai", "\xFAt", "y\xEAu"],
    "ch\xFAng": ["t\xF4i", "ta", "n\xF3", "m\xECnh"],
    "m\u1ECDi": ["ng\u01B0\u1EDDi", "th\u1EE9", "l\xFAc", "n\u01A1i"],
    // ── Y tế / sức khỏe ──
    "b\u1EC7nh": ["vi\u1EC7n", "nh\xE2n", "t\u1EADt", "\xE1n"],
    "b\xE1c": ["s\u0129", "h\u1ECDc", "\xE1i"],
    "y": ["t\u1EBF", "t\xE1", "khoa", "h\u1ECDc"],
    "h\u1ED3i": ["s\u1EE9c", "ph\u1EE5c", "n\xE3y", "\u0111\xF3", "x\u01B0a", "chu\xF4ng", "\xE2m", "\u0111\xE1p", "h\u01B0\u01A1ng"],
    "c\u1EE9u": ["h\u1ED9", "n\u1EA1n", "th\u01B0\u01A1ng", "t\u1EBF", "gi\xFAp", "ch\u1EEFa"],
    "s\u01A1": ["c\u1EE9u", "khai", "\u0111\u1ED3", "\u0111\u1EB3ng", "tuy\u1EC3n"],
    "ch\u1EA9n": ["\u0111o\xE1n", "tr\u1ECB"],
    "x\xE9t": ["nghi\u1EC7m", "duy\u1EC7t", "x\u1EED", "l\u1EA1i"],
    "ph\xF2ng": ["kh\xE1m", "ng\u1EEBa", "ch\u1ED1ng", "ng\u1EE7", "b\u1EC7nh", "ban"],
    "s\u1EE9c": ["m\u1EA5y", "kh\u1ECFe", "m\u1EA1nh", "l\u1EF1c", "h\xFAt", "s\u1ED1ng", "\xE9p"],
    // ── Giáo dục / trường học ──
    "h\u1ECDc": ["t\u1EADp", "sinh", "h\u1ECFi", "h\xE0nh", "vi\u1EC7n", "ph\xED", "b\u1ED5ng"],
    "sinh": ["vi\xEAn", "ho\u1EA1t", "s\u1ED1ng", "s\u1EA3n", "h\u1ECDc", "nh\u1EADt"],
    "nghi\xEAn": ["c\u1EE9u"],
    "c\u1EA5p": ["c\u1EE9u", "b\u1EADc", "cao", "nh\u1EADt", "ph\xE9p", "tr\xEAn"],
    "gi\xE1o": ["vi\xEAn", "d\u1EE5c", "tr\xECnh", "\xE1n", "s\u01B0"],
    "tr\u01B0\u1EDDng": ["h\u1ECDc", "\u0111\u1EA1i h\u1ECDc", "h\u1EE3p", "ca", "k\u1EF3"],
    "\u0111\u1EA1i": ["h\u1ECDc", "bi\u1EC3u", "di\u1EC7n", "gia", "\u0111\u1ED3ng"],
    "k\u1EF9": ["n\u0103ng", "thu\u1EADt", "x\u1EA3o", "s\u01B0"],
    "ngo\u1EA1i": ["ng\u1EEF", "giao", "\xF4", "t\u1EC7", "th\u01B0\u01A1ng"],
    "v\u0103n": ["h\xF3a", "b\u1EA3n", "h\u1ECDc", "ph\xF2ng", "minh"],
    "l\u1ECBch": ["s\u1EED", "tr\xECnh", "thi\u1EC7p", "s\u1EF1"],
    "b\u1EAFt": ["\u0111\u1EA7u", "bu\u1ED9c", "tay", "ch\u01B0\u1EDBc", "k\u1ECBp"],
    "ti\u1EBFp": ["t\u1EE5c", "theo", "c\u1EADn", "nh\u1EADn", "th\u1ECB", "x\xFAc"],
    "ho\xE0n": ["th\xE0nh", "to\xE0n", "h\u1EA3o", "tr\u1EA3", "v\u1ED1n", "l\u01B0\u01A1ng"],
    "an": ["to\xE0n", "ninh", "t\xE2m", "c\u01B0", "d\u01B0\u1EE1ng"],
    // ── Giao tiếp / chat / xã giao ──
    "xin": ["ch\xE0o", "l\u1ED7i", "ph\xE9p", "m\u1EDDi", "h\u1ECFi", "c\u1EA3m \u01A1n"],
    "c\u1EA3m": ["\u01A1n", "phi\u1EC1n", "th\u1EA5y", "gi\xE1c", "ngh\u0129", "nh\u1EADn", "x\xFAc", "k\xEDch"],
    "ch\xFAc": ["m\u1EEBng", "ng\u1EE7 ngon", "th\xE0nh c\xF4ng", "b\u1EA1n", "anh", "ch\u1ECB", "em"],
    "h\u1EB9n": ["g\u1EB7p l\u1EA1i", "\u01B0\u1EDBc", "ng\xE0y", "gi\u1EDD", "g\u1EB7p"],
    "t\u1EA1m": ["bi\u1EC7t", "th\u1EDDi", "ng\u01B0ng"],
    "l\xE0m": ["vi\u1EC7c", "phi\u1EC1n", "n\u01B0", "\u01A1n", "quen", "sao", "l\u1EA1i", "g\xEC", "xong", "b\xE0i", "h\u01B0"],
    "tuy\u1EC7t": ["v\u1EDDi", "\u0111\u1ED1i", "m\u1EADt", "ch\u1EE7ng", "v\u1ECDng"],
    "th\xE0nh": ["ph\u1ED1", "c\xF4ng", "vi\xEAn", "l\u1EADp", "t\u1EF1u", "ph\u1EA7n"],
    "\xFD": ["t\u01B0\u1EDFng", "ngh\u0129a", "ki\u1EBFn", "th\u1EE9c", "ch\xED"],
    "\u0111\u1ED5i": ["m\u1EDBi", "thay", "tr\u1EA3", "g\xE1c"],
    // ── Động từ / hành động thường dùng ──
    "\u0111i": ["l\xE0m", "h\u1ECDc", "ch\u01A1i", "v\u1EC1", "ng\u1EE7", "\u0111\xE2u"],
    "v\u1EC1": ["nh\xE0", "\u0111\xE2u", "vi\u1EC7c", "v\u1EA5n \u0111\u1EC1"],
    "\u0111\u1EBFn": ["n\u01A1i", "l\xFAc", "\u0111\xE2y", "g\u1EB7p"],
    "\u1EDF": ["\u0111\xE2u", "\u0111\xE2y", "\u0111\xF3", "nh\xE0", "tr\u01B0\u1EDDng", "ch\u1ED7 l\xE0m"],
    "c\xF3": ["th\u1EC3", "ph\u1EA3i", "kh\xF4ng", "\u0111\u01B0\u1EE3c", "nhi\u1EC1u"],
    "kh\xF4ng": ["c\xF3", "th\u1EC3", "ph\u1EA3i", "\u0111\u01B0\u1EE3c", "sao", "bi\u1EBFt"],
    "\u0111\u01B0\u1EE3c": ["bi\u1EBFt", "ch\u1ECDn", "xem", "h\u01B0\u1EDFng", "r\u1ED3i", "kh\xF4ng", "l\u1EAFm", "ch\u1EE9"],
    "ph\u1EA3i": ["ch\u0103ng", "l\xE0m", "\u0111i", "n\xF3i"],
    "mu\u1ED1n": ["n\xF3i", "l\xE0m", "bi\u1EBFt", "\u0111i", "xem"],
    "bi\u1EBFt": ["\u01A1n", "tr\u01B0\u1EDBc", "\u0111i\u1EC1u", "g\xEC"],
    "n\xF3i": ["chuy\u1EC7n", "r\u1EB1ng", "l\u1EDDi", "th\u1EADt"],
    "nghe": ["n\xF3i", "th\u1EA5y", "nh\u1EA1c", "l\u1EDDi"],
    "nh\xECn": ["th\u1EA5y", "l\u1EA1i", "nh\u1EADn", "ng\u1EAFm"],
    "y\xEAu": ["th\u01B0\u01A1ng", "qu\xFD", "th\xEDch", "c\u1EA7u"],
    "tin": ["t\u01B0\u1EDFng", "t\u1EE9c", "nh\u1EAFn", "h\u1ECDc", "ng\u01B0\u1EDDi", "ai"],
    "hy": ["v\u1ECDng"],
    "quy\u1EBFt": ["\u0111\u1ECBnh", "\u0111o\xE1n", "t\xE2m", "li\u1EC7t"],
    "l\u1EF1a": ["ch\u1ECDn", "l\u1ECDc"],
    "h\xE0i": ["l\xF2ng", "h\xF2a", "h\u01B0\u1EDBc", "thi\u1EC7t"],
    "y\xEAn": ["t\xE2m", "t\u0129nh", "l\u1EB7ng", "\u1ED5n"],
    "ph\xFAc": ["h\u1EADu", "ph\u1EA7n", "\u0111\u1EE9c", "\u0111\xE1p"],
    "\u0103n": ["u\u1ED1ng", "nh\u1EADu", "s\xE1ng", "tr\u01B0a", "chi\u1EC1u", "t\u1ED1i", "khuya", "sang", "d\u01A1", "t\u1EA1p", "d\xE0y", "b\u1EA9n"],
    // ── Văn phòng / Email / Giao tiếp công sở ──
    "k\xEDnh": ["g\u1EEDi", "g\u1EDFi", "ch\xE0o", "mong", "b\xE1o"],
    "tr\xE2n": ["tr\u1ECDng", "qu\xFD"],
    "\u0111\xEDnh": ["k\xE8m", "ch\xEDnh", "v\xE0o"],
    "th\xE2n": ["g\u1EEDi", "m\u1EBFn", "thi\u1EC7n", "\xE1i"],
    "ph\u1EA3n": ["h\u1ED3i", "\xE1nh", "chi\u1EBFu", "t\xE1c d\u1EE5ng"],
    "ti\u1EBFn": ["\u0111\u1ED9", "h\xE0nh", "b\u1ED9", "tri\u1EC3n"],
    "b\xE1o": ["c\xE1o", "ch\xED", "\u0111\u1ED9ng", "th\u1EE9c"],
    "bi\xEAn": ["b\u1EA3n", "t\u1EADp", "so\u1EA1n", "ch\u1EBF"],
    "th\u1ED1ng": ["nh\u1EA5t", "k\xEA", "tr\u1ECB", "so\xE1i"],
    "trao": ["\u0111\u1ED5i", "tay", "t\u1EB7ng", "gi\u1EA3i"],
    // ── Từ nối / đại từ / trợ động từ (bổ sung mới) ──
    "c\u1EE7a": ["t\xF4i", "b\u1EA1n", "ch\xFAng", "n\xF3", "nh\u1EEFng", "c\xE1c"],
    "l\xE0": ["g\xEC", "m\u1ED9t", "ng\u01B0\u1EDDi", "c\xE1i", "s\u1EF1"],
    "cho": ["t\xF4i", "b\u1EA1n", "ph\xE9p", "n\xEAn", "v\u1EDBi"],
    "v\u1EDBi": ["t\xF4i", "b\u1EA1n", "nhau", "c\xE1c", "h\u1ECD"],
    "nh\u01B0": ["th\u1EBF", "v\u1EADy", "l\xE0"],
    "\u0111\u1EC3": ["l\xE0m", "xem", "bi\u1EBFt", "h\u1ECDc"],
    "\u0111ang": ["l\xE0m", "h\u1ECDc", "\u1EDF", "xem"],
    "\u0111\xE3": ["xong", "l\xE0m", "bi\u1EBFt", "c\xF3"],
    "s\u1EBD": ["l\xE0m", "\u0111\u01B0\u1EE3c", "x\u1EA3y ra", "ph\u1EA3i"],
    // ── Cảm xúc / đánh giá (bổ sung mới) ──
    "r\u1EA5t": ["vui", "t\u1ED1t", "nhi\u1EC1u", "hay", "\u0111\u1EB9p", "nhanh"],
    "nhi\u1EC1u": ["h\u01A1n", "ng\u01B0\u1EDDi", "l\u1EA7n", "n\u0103m", "th\u1EE9"],
    "\xEDt": ["nh\u1EA5t", "h\u01A1n", "khi"],
    "vui": ["v\u1EBB", "l\xF2ng", "nh\u1ED9n"],
    "t\u1ED1t": ["\u0111\u1EB9p", "h\u01A1n", "nh\u1EA5t"],
    "\u0111\u1EB9p": ["trai", "l\xF2ng", "\u0111\xF4i"],
    "th\u1EADt": ["s\u1EF1", "l\xF2ng", "ra", "\u0111\u1EA5y"],
    "ch\u1EAFc": ["ch\u1EAFn", "l\xE0", "r\u1ED3i"],
    // ── Học tập / đọc viết (bổ sung mới) ──
    "vi\u1EBFt": ["b\xE0i", "th\u01B0", "code", "b\xE1o c\xE1o"],
    "\u0111\u1ECDc": ["s\xE1ch", "b\xE1o", "tin", "hi\u1EC3u"],
    "xem": ["phim", "b\xE1o", "tin", "l\u1EA1i", "x\xE9t", "b\xF3i", "t\u1EED vi"],
    "coi": ["phim", "b\xE1o", "tin", "b\u1ED9", "ch\u1EEBng", "h\xE1t", "s\xE1ch", "l\u1EA1i", "th\u01B0\u1EDDng", "b\xF3i", "t\u1EED vi"],
    // ── Từ ngữ & tiếng lóng Sài Gòn xưa / Nam Bộ (Nguyễn Cao Trường) ──
    "b\xE1": ["ch\xE1y", "l\xE1p", "ch\u1EA5y"],
    "b\xE0": ["ch\u1EB1n", "n\u1ED9i", "ngo\u1EA1i", "b\xE0"],
    "b\u1EA3nh": ["t\u1ECFn", "bao", "trai"],
    "b\xECnh": ["th\u1EE7y", "\u0111\u1ECBnh", "d\u01B0\u01A1ng", "y\xEAn", "t\u0129nh"],
    "b\xF9ng": ["binh", "n\u1ED5", "ph\xE1t"],
    "bu\u1ED3n": ["xo", "ng\u1EE7", "b\xE3", "c\u01B0\u1EDDi"],
    "ch\xF9m": ["hum", "ng\xE2y", "ru\u1ED9t"],
    "c\xF9": ["l\u1EA7n", "l\xE9t"],
    "c\u1EE9ng": ["\u0111\u1EA7u", "c\xE1p", "r\u1EAFn"],
    "d\u1EB1n": ["m\u1EB7t", "v\u1EB7t", "x\xE9"],
    "d\u1EC5": ["ng\u01B0\u01A1i", "th\u01B0\u01A1ng", "d\xE0ng", "ch\u1ECBu"],
    "\u0111\xF2": ["th\u1EE7 thi\xEAm", "d\u1ECDc", "ngang"],
    "h\u1EA1p": ["gu", "tu\u1ED5i", "\xFD"],
    "h\u1EBFt": ["s\u1EA9y", "x\u1EA9y", "bi\u1EBFt", "x\xED qu\xE1ch", "b\xE0i", "ga", "ti\u1EC1n", "c\u1EE1"],
    "h\u1ED5ng": ["ch\u1EEBng", "c\xF3 chi", "d\xE1m \u0111\xE2u", "bi\u1EBFt", "ch\u1ECBu", "th\u1EA5y"],
    "h\xFAt": ["gi\xF3", "thu\u1ED1c", "b\u1EE5i", "h\u1ED3n"],
    "l\xE1ng": ["ch\xE1ng", "m\u1ECBn", "gi\u1EC1ng"],
    "l\u1EBFt": ["b\xE1nh"],
    "m\xE8n": ["\u01A1i", "\u0111\xE9c \u01A1i"],
    "m\u01B0a": ["th\xFAi \u0111\u1EA5t", "r\xE0o", "ph\xF9n", "d\u1EA7m"],
    "ngon": ["l\xE0nh", "\u01A1", "mi\u1EC7ng", "ng\u1ECDt", "c\u01A1m"],
    "qu\xE1": ["m\u1EA1ng", "x\xE1", "nhi\u1EC1u", "tr\xECnh", "kh\u1EE9", "tuy\u1EC7t", "nhanh"],
    "qu\u1EC9": ["tha ma b\u1EAFt", "qu\xE1i", "s\u1EE9"],
    "r\u1EC1": ["r\xE0"],
    "r\u1EA7n": ["r\u1EA7n"],
    "sang": ["c\u1EA3", "tr\u1ECDng", "gi\xE0u"],
    "say": ["x\u1EC9n", "m\xEA", "\u0111\u1EAFm", "s\u01B0a"],
    "s\u1ED1": ["dz\xE1ch", "d\xE1ch", "m\u1ED9t", "m\u1EC7nh", "h\u1ECDc"],
    "s\u01B0\u01A1ng": ["s\u01B0\u01A1ng", "m\xF9", "kh\xF3i"],
    "t\xE1ng": ["m\u1EA1ng", "t\u1EADn"],
    "t\xE0o": ["lao", "th\xE1o"],
    "t\xE9": ["re", "ng\u1EEDa", "nh\xE0o", "gi\u1EBFng"],
    "t\xE9m": ["t\xE9m"],
    "th\u1EA7y": ["hai", "th\u1EE3", "c\xF4", "gi\xE1o", "thu\u1ED1c", "u"],
    "th\u1ECDc": ["c\xF9 l\xE9t", "l\xE9t", "m\u1EA1ch", "g\u1EADy"],
    "th\u1EC1m": ["ba", "nh\xE0"],
    "t\xEDa": ["m\xE1", "lia"],
    "tr\u1EAFng": ["x\xE1c", "tinh", "tay", "b\u1EA1ch"],
    "tr\u1EDDi": ["th\u1EA7n \u01A1i", "\u0111\xE1nh", "\u01A1i", "\u0111\u1EA5t", "sanh"],
    "tr\u1EDBt": ["qu\u1EDBt"],
    "tr\xF9m": ["s\xF2", "m\u1EC1n", "kh\u0103n"],
    "tr\xFAng": ["m\xE1nh", "m\u1ED1i", "t\u1EE7", "qu\u1EA3", "th\u01B0\u1EDFng", "\u0111\u1ED9c \u0111\u1EAFc"],
    "v\u1EAFt": ["gi\xF2 l\xEAn c\u1ED5", "chanh", "s\u1EEFa"],
    "v\xF4": ["ph\u01B0\u01A1ng", "\xEDch", "duy\xEAn", "t\u01B0", "l\xFD"],
    "x\xE1": ["x\u1ECB", "t\u1ED9i", "l\u1EE3i"],
    "xe": ["lam", "th\u1ED5 m\u1ED9", "\u0111\xF2", "l\xF4i", "c\u1EA5p c\u1EE9u", "m\xE1y", "\u0111\u1EA1p", "h\u01A1i"],
    "x\u1EADp": ["x\xE1m"],
    "x\u1EC1": ["x\xF2a"],
    "x\xEC": ["d\u1EA7u", "tr\xE9t", "l\u1ED1p"],
    "x\xED": ["g\u1EA1t", "m\u1EE5i", "mu\u1ED9i", "x\xF3a"],
    // ── Từ vựng đời sống & phương ngữ Nam Bộ thân thương bổ sung ──
    "b\u1EEFa": ["nay", "k\u1ECBp", "c\u01A1m", "ti\u1EC7c"],
    "h\u1ED5m": ["r\xE0y", "nay"],
    "ch\xFAt": ["x\xEDu", "n\u1EEFa", "th\xF4i", "\u0111\u1EC9nh"],
    "thi\u1EC7t": ["t\xECnh", "th\xF2i", "s\u1EF1", "h\u1EA1i", "l\xF2ng"],
    "ch\xE1nh": ["tr\u1EF1c", "ki\u1EBFn", "ngh\u0129a", "ph\u1EE7", "t\xF4ng"],
    "lanh": ["chanh", "l\u1EE3i", "l\u1EB9"],
    "ng\u1ECDt": ["x\u1EDBt", "ng\xE0o", "b\xF9i"],
    "ch\u01A1n": ["ch\u1EA5t", "th\u1EADt"],
    "c\u01B0ng": ["x\u1EC9u", "chi\u1EC1u"],
    "\u0111\xE0ng": ["ho\xE0ng", "trong", "ngo\xE0i"],
    "l\u1EB9": ["l\xE0ng", "l\u1EB9", "tay", "ch\xE2n"],
    "l\xF3ng": ["r\xE0y", "ng\xF3ng"],
    "m\u1EA7n": ["\u0103n", "r\u0103ng"],
    "mi\u1EC7t": ["v\u01B0\u1EDDn", "th\u1EE9", "d\u01B0\u1EDBi"],
    "nh\u1EE9t": ["x\u1EE9", "\u0111\u1ECBnh", "h\u1EA1ng", "qu\xE1n"],
    "ph\u1EBB": ["re"],
    "r\u1EA3nh": ["rang", "r\u1ED7i", "tay"],
    "thong": ["th\u1EA3", "dong"],
    "th\u1EA3nh": ["th\u01A1i"],
    // ── Mở rộng từ ngữ thông dụng (Ngữ liệu Quốc gia & NLP Corpus) ──
    "ba": ["ba", "b\u1EA3y", "b\u1ECB"],
    "ban": ["b\u1ED1", "c\u1EA5p", "chi\u1EC1u"],
    "bao": ["b\xEC", "bi\u1EBFm", "bi\u1EC7n"],
    "bi": ["ai", "b\xF4", "ca"],
    "binh": ["b\u1ECB", "bi\u1EBFn", "b\u1ED9"],
    "bi\u1EBFn": ["\xE1p", "\xE2m", "b\xE1o"],
    "bi\u1EC3u": ["b\xEC", "c\u1EA3m", "ch\u01B0\u01A1ng"],
    "bi\u1EC7t": ["c\u01B0", "danh", "d\u01B0\u1EE3c"],
    "b\xE0i": ["b\xE1c", "b\u1EA1c", "b\u1EA3n"],
    "b\xE0n": ["\u0103n", "b\u1EA1c", "c\xE3i"],
    "b\xE0o": ["\u1EA3nh", "ch\u1EBF", "ch\u1EEFa"],
    "b\xE1ch": ["b\u1ED5", "b\u1ED9", "chi\u1EBFn"],
    "b\xE1n": ["\u1EA3nh", "bu\xF4n", "c\u1EA5p"],
    "b\xE1nh": ["b\xE0ng", "bao", "b\u1EBB"],
    "b\xE1t": ["\xE2m", "b\u1ED9i", "b\u1EEDu"],
    "b\xE3i": ["bi\u1EC3n", "binh", "b\u1ECF"],
    "b\xED": ["\u1EA9n", "beng", "b\xE9t"],
    "b\xF3ng": ["b\xE0n", "bay", "b\u1EA9y"],
    "b\xF3p": ["b\u1EB9p", "b\u1EE5ng", "ch\u1EAFt"],
    "b\xFAt": ["bi", "ch\xEC", "chi\u1EBFn"],
    "b\u0103ng": ["\xE2m", "b\u0103ng", "b\xF3"],
    "b\u1EA1ch": ["b\xEC", "bi\u1EBFn", "c\u1EA7u"],
    "b\u1EA1o": ["b\u1EC7nh", "ch\xEDnh", "ch\xFAa"],
    "b\u1EA3n": ["\xE1n", "b\u1ED9", "ch\u1EA5t"],
    "b\u1EA5t": ["an", "b\u1EB1ng", "bi\u1EBFn"],
    "b\u1EA7n": ["b\u1EA1c", "b\xE1ch", "b\u1EA1ch"],
    "b\u1EB1ng": ["an", "b\u1EB7n", "c\u1EA5p"],
    "b\u1EC1": ["b\u1EC1", "b\u1ED9n", "cao"],
    "b\u1ECD": ["b\u1EA1c", "c\u1EA1p", "ch\xE9t"],
    "b\u1ECF": ["\u0103n", "b\xE0", "b\u1EA3"],
    "b\u1ED1": ["c\xE1i", "c\xE1o", "ch\xE1nh"],
    "b\u1ED3": ["b\u1ECBch", "c\xE1c", "c\xE0o"],
    "b\u1ED3i": ["b\u1EBFp", "b\u1ED5", "b\xFAt"],
    "b\u1ED5": ["b\xE1n", "ch\xEDnh", "ch\u1EEDng"],
    "b\u1ED9": ["ba", "b\u1EA3y", "binh"],
    "b\u1ED9i": ["b\u1EA1c", "chi", "ch\u1EC9nh"],
    "ca": ["c\u1EA9m", "dao", "h\xE1t"],
    "canh": ["c\xE1ch", "c\u1EA3i", "c\xE1nh"],
    "cao": ["\xE1p", "c\u1EA3", "c\u1EA5p"],
    "chia": ["b\xE0i", "bu\u1ED3n", "c\u1EAFt"],
    "chim": ["b\u1EB1ng", "c\u1EAFt", "ch\xEDch"],
    "chi\u1EBFn": ["b\u1EA1i", "b\xE0o", "binh"],
    "chi\u1EBFu": ["\xE1n", "bi\u1EC3u", "b\xF3ng"],
    "chung": ["ch\u1EA1", "chung", "c\u1EE5c"],
    "chuy\xEAn": ["bi\u1EC7t", "c\u1EA7n", "ch\u1EBF"],
    "chuy\u1EC3n": ["b\xE1nh", "bi\xEAn", "bi\u1EBFn"],
    "ch\xE2n": ["b\xEC", "b\u1EE5ng", "ch\u1EA1y"],
    "ch\xED": ["\xE1c", "cao", "ch\xE1t"],
    "ch\xF3": ["bi\u1EC3n", "b\xF4ng", "ch\u1EBFt"],
    "ch\xFA": ["b\xE9", "ch\xEDch", "d\u1EABn"],
    "ch\u01A1i": ["\xE1c", "b\u1EDDi", "ch\xF2i"],
    "ch\u1EA1y": ["\u0103n", "b\u1EEFa", "ch\u1ECDt"],
    "ch\u1EA5m": ["c\xE2u", "ch\u1EA5m", "c\xF4ng"],
    "ch\u1EA5p": ["b\xFAt", "chi\u1EBFm", "ch\xEDnh"],
    "ch\u1EA5t": ["b\xE9o", "b\u1ED9t", "ch\xE1y"],
    "ch\u1EB3ng": ["ai", "b\u1EB1ng", "b\xF5"],
    "ch\u1EBF": ["bi\u1EBFn", "d\u1EE5c", "\u0111\u1ECBnh"],
    "ch\u1EBFt": ["ch\xE9m", "ch\u1EB9t", "ch\xECm"],
    "ch\u1EC9": ["b\u1EA3o", "b\xE1o", "c\u1EA7n"],
    "ch\u1ECBu": ["ch\u1EBFt", "chuy\u1EC7n", "c\u1EF1c"],
    "ch\u1ED1ng": ["c\xE0n", "ch\u1EBF", "ch\u1ECDi"],
    "ch\u1EE7": ["\xE2m", "b\xE0i", "bi\xEAn"],
    "ch\u1EE9ng": ["b\u1EC7nh", "ch\u1EC9", "c\u1EDB"],
    "ch\u1EEF": ["b\xE1t", "c\xE1i", "ch\xE2n"],
    "co": ["b\xF3p", "c\u1ECFm", "c\u1EE5m"],
    "con": ["b\u1EA1c", "b\xE0i", "b\xE9"],
    "cung": ["b\u1EADc", "c\xE1ch", "c\u1EA5m"],
    "cu\u1ED3ng": ["\u1EA9m", "b\u1EA1o", "c\u1EB3ng"],
    "c\xE1": ["bi\u1EC7t", "b\u1ED1ng", "b\u1ED9t"],
    "c\xE1ch": ["bi\u1EC7t", "b\u1EE9c", "ch\u1EE9c"],
    "c\xE1nh": ["b\xE8o", "bu\u1ED3m", "cam"],
    "c\xE1o": ["b\u1EA1ch", "bi\u1EC7t", "c\u1EA5p"],
    "c\xE2n": ["b\xE0n", "b\u1EB1ng", "c\u1EA5n"],
    "c\xE2u": ["ch\u1EAFp", "ch\u1EA5p", "chuy\u1EC7n"],
    "c\xE2y": ["b\xE0i", "b\xF4ng", "b\u1EE5i"],
    "c\xF4": ["\u1EA3", "b\xE9", "chi\xEAu"],
    "c\xF9ng": ["b\xEAn", "chung", "c\u1EF1c"],
    "c\u0103n": ["b\u1EA3n", "b\u1EC7nh", "c\u1EAFt"],
    "c\u01A1": ["b\u1EA3n", "b\u1EA7n", "bi\u1EBFn"],
    "c\u01A1m": ["\xE1o", "b\u1EEFa", "ch\xE1o"],
    "c\u01B0\u01A1ng": ["c\u01B0\u1EDDng", "d\u0169ng", "gi\u1EDBi"],
    "c\u01B0\u1EDDi": ["b\xF2", "ch\xEA", "c\u1EE3t"],
    "c\u01B0\u1EDDng": ["b\u1EA1o", "d\u01B0\u01A1ng", "\u0111\u1EA1o"],
    "c\u1EA3i": ["b\u1EAFp", "b\u1EB9", "bi\xEAn"],
    "c\u1EA3nh": ["b\xE1o", "b\u1ECB", "binh"],
    "c\u1EA5t": ["binh", "b\xFAt", "b\u01B0\u1EDBc"],
    "c\u1EA7m": ["b\u1EB1ng", "b\xFAt", "ca"],
    "c\u1EA7n": ["c\u1EA5p", "c\xE2u", "c\u1EA9u"],
    "c\u1EA7u": ["an", "ao", "b\u1EBFn"],
    "c\u1EAFt": ["b\u0103ng", "b\u1ECF", "bom"],
    "c\u1ECF": ["ban", "c\xE2y", "ch\xE9t"],
    "c\u1ED1": ["ch\u1EA5p", "ch\u1EBFt", "ch\xED"],
    "c\u1ED5": ["b\u1EBB", "b\u1ED3ng", "c\xE1nh"],
    "c\u1ED9t": ["bu\u1ED3m", "c\xE1i", "ch\u1ED1ng"],
    "c\u1EE7": ["\u1EA5u", "c\u1EA3i", "c\xE1i"],
    "c\u1EEDa": ["\u1EA3i", "b\u1EC3", "b\xEAn"],
    "c\u1EF1c": ["b\u1EAFc", "c\u1EA7u", "d\u01B0\u01A1ng"],
    "da": ["b\xE1t", "b\xEA", "cam"],
    "danh": ["b\u1EA1", "ca", "c\xE1ch"],
    "dao": ["\u0103n", "b\xE0i", "b\xE0o"],
    "di": ["b\xFAt", "c\u1EA3o", "c\u0103n"],
    "di\u1EC5n": ["\xE2m", "bi\u1EBFn", "binh"],
    "du": ["canh", "c\xF4n", "c\u01B0"],
    "dung": ["b\xE0o", "d\u0103ng", "d\u1ECB"],
    "duy": ["c\u1EA3m", "danh", "k\u1EC9"],
    "d\xE2n": ["b\u1EB9p", "bi\u1EC3u", "binh"],
    "d\xE2y": ["b\u1ECDc", "bu\u1ED9c", "c\xE1p"],
    "d\u01B0\u1EE1ng": ["b\u1EC7nh", "ch\xED", "d\u1EE5c"],
    "d\u1EA5u": ["\u1EA5n", "ch\u1EA5m", "gi\xE1ng"],
    "d\u1EA7u": ["\u0103n", "c\xE1", "cao"],
    "d\u1EABn": ["b\u1EA3o", "chuy\u1EC7n", "ch\u1EE9ng"],
    "d\u1ECB": ["b\u1EA3n", "b\xE0o", "b\u1ED9i"],
    "d\u1ECBch": ["\xE2m", "b\u1EA3n", "gi\u1EA3"],
    "d\u1EF1": ["\xE1n", "b\xE1o", "b\u1ECB"],
    "gian": ["\xE1c", "b\xE0o", "b\u0103ng"],
    "giun": ["c\xE1t", "ch\u1EC9", "\u0111\u1EA5t"],
    "gi\xE0": ["c\u1EA3", "c\u1EA5c", "c\xE2ng"],
    "gi\xE1": ["\xE1o", "b\xE1n", "bi\u1EC3n"],
    "gi\xE1m": ["bi\xEAn", "binh", "\u0111\u1ECBnh"],
    "gi\xF3": ["b\xE3o", "b\u1EA5c", "b\u1EE5i"],
    "gi\u1EA3": ["b\u1ED9", "b\u1EEFa", "c\xE1ch"],
    "gi\u1EA3m": ["\xE1n", "\xE1p", "b\u1EDBt"],
    "gi\u1EA5y": ["\u1EA3nh", "b\u1EA1c", "b\xE1o"],
    "gi\u1EEF": ["gi\xE1", "gi\xE0ng", "g\xECn"],
    "g\xE0": ["\xE1c", "c\xE1t", "ch\u1ECDi"],
    "g\xE2y": ["b\u1EC7nh", "chi\u1EBFn", "chuy\u1EC7n"],
    "hi\u1EBFu": ["chi\u1EBFn", "ch\u1EE7", "danh"],
    "hi\u1EC1n": ["\u0111\u1EC7", "\u0111\u1EE9c", "h\u1EADu"],
    "hi\u1EC7n": ["b\u1ED9", "d\u1ECBch", "di\u1EC7n"],
    "hi\u1EC7u": ["bu\xF4n", "ch\u1EC9nh", "ch\xEDnh"],
    "huy\u1EBFt": ["\xE1p", "b\u1EA1ch", "b\xE0o"],
    "h\xE0n": ["\u0111i\u1EC7n", "\u0111\u1EDBi", "g\u1EAFn"],
    "h\xE0ng": ["\u0103n", "binh", "\u0111\u1EA7u"],
    "h\xE0nh": ["binh", "b\xFAi", "c\xE1ch"],
    "h\xE0o": ["ch\u1EC9", "hi\u1EC7p", "hoa"],
    "h\xECnh": ["bao", "d\xE1ng", "d\u1EA1ng"],
    "h\u01B0": ["\u1EA3o", "b\xE1o", "c\u1EA5u"],
    "h\u01B0\u01A1ng": ["\xE1n", "\u1EA9m", "b\u1EA1"],
    "h\u01B0\u1EDBng": ["c\xE1ch", "d\u1EABn", "d\u01B0\u01A1ng"],
    "h\u1EADu": ["b\xE1o", "b\u1ECB", "binh"],
    "h\u1ED3": ["c\u1EA7m", "chi", "d\u1EC5"],
    "h\u1ED3ng": ["b\u1EA1ch", "b\xEC", "c\u1EA7u"],
    "h\u1ED5": ["bi\u1EBFn", "c\u1ED1t", "c\u1EE9"],
    "h\u1ED7n": ["\u1EA9u", "chi\u1EBFn", "d\u1ECBch"],
    "h\u1ED9": ["b\u1ED9", "chi\u1EBFu", "\u0111\xEA"],
    "h\u1ED9i": ["\u1EA9m", "b\xE1o", "bu\xF4n"],
    "h\u1EEFu": ["\xE1i", "bi\xEAn", "ch\xED"],
    "khai": ["\u1EA5n", "b\xE1o", "b\xFAt"],
    "khinh": ["b\u1EA1c", "b\u1EC9", "binh"],
    "kh\xE1c": ["\xE2m", "bi\u1EC7t", "chi"],
    "kh\xE1ng": ["\xE1n", "\xE2m", "c\xE1o"],
    "kh\xED": ["\xE1p", "b\u1EA9m", "c\u1EA7u"],
    "kh\xF3": ["b\u1EA3o", "ch\u1ECBu", "ch\u01A1i"],
    "kh\u1ED5": ["\u1EA3i", "chi\u1EBFn", "ch\u1EE7"],
    "kim": ["anh", "b\u0103ng", "c\u1EA3i"],
    "ki\u1EBFn": ["c\xE1nh", "\u0111en", "\u0111\u1ECF"],
    "k\xEC": ["an", "bo", "b\u1ED9"],
    "k\u1EBF": ["c\u1EADn", "ch\xE2n", "ch\xED"],
    "lai": ["c\u1EA3o", "c\u0103ng", "gi\u1ED1ng"],
    "lao": ["c\u1EA3i", "c\xF4ng", "d\u1ECBch"],
    "li\xEAn": ["\xE1", "bang", "b\u1ED9"],
    "long": ["\xE1n", "b\xE0o", "c\u1ED5n"],
    "lo\u1EA1n": ["d\xE2m", "kh\u1EE9u", "l\u1EA1c"],
    "l\xE1": ["\xE1o", "b\xE0i", "b\u1EAFc"],
    "l\xE3o": ["b\xE0", "b\u1ED9c", "d\xEA"],
    "l\xEAn": ["\xE1n", "b\u1EADc", "b\u1ED9"],
    "l\xF2ng": ["ch\u1EA3o", "d\u1EA1", "d\xE2n"],
    "l\xF4ng": ["b\xF4ng", "bu\u1ED3n", "c\xE1nh"],
    "l\u01B0u": ["ban", "c\u1EA7u", "chi\u1EC3u"],
    "l\u01B0\u1EE1ng": ["b\u1ED9i", "ch\u1EA5t", "chi\u1EBFt"],
    "l\u1EA1c": ["b\u01B0\u1EDBc", "ch\u1ED7", "\u0111\xE0"],
    "l\u1EA5y": ["c\u1EAFp", "ch\u1ED3ng", "c\xF4ng"],
    "l\u1EADp": ["\u1EA5p", "c\u1EADp", "ch\xED"],
    "l\u1EC5": ["b\xE1i", "b\u1ED9", "ca"],
    "l\u1ED7": ["bi", "b\xEC", "ch\u1EA9m"],
    "l\u1EE5c": ["b\u1EA3o", "b\xE1t", "b\xEC"],
    "ma": ["chay", "da", "\u0111\u1EA1o"],
    "mai": ["danh", "\u0111\xE2y", "g\u1EA7m"],
    "minh": ["b\u1EA1ch", "ch\xE2u", "ch\u1EE7"],
    "mi\u1EC5n": ["ch\u1EA5p", "ch\u1EE9c", "c\u01B0\u1EE1ng"],
    "m\xE0ng": ["b\xE0o", "b\u1EE5ng", "c\u1EE9ng"],
    "m\xE1i": ["\u1EA5p", "b\u1EB1ng", "che"],
    "m\xEA": ["\xE1m", "cung", "cu\u1ED3ng"],
    "m\u01B0u": ["c\u1EA7u", "ch\u01B0\u1EDBc", "c\u01A1"],
    "m\u1EA5t": ["\u0103n", "c\u1EAFp", "c\xF4ng"],
    "m\u1EAFc": ["\xE1o", "b\u1EADn", "b\u1EABy"],
    "m\u1EB7t": ["b\u1EB1ng", "c\u1EAFt", "c\xE2n"],
    "m\u1ED9t": ["ch\u1EA1p", "chi\u1EC1u", "ch\u1ED1c"],
    "m\u1EDF": ["c\u1EDD", "c\u1EEDa", "\u0111\u1EA7u"],
    "nam": ["ai", "b\u1EB1ng", "b\u1ED9"],
    "ngang": ["b\u01B0\u1EDBng", "ch\u01B0\u1EDBng", "d\u1EA1"],
    "nghi": ["\xE1n", "binh", "d\u1EE5"],
    "nghi\xEAm": ["c\xE1ch", "c\u1EA5m", "c\u1EA9n"],
    "nguy\xEAn": ["\xE2m", "b\u1EA3n", "canh"],
    "ng\u0169": ["\xE2m", "b\u1ED9i", "c\u1ED1c"],
    "ng\u01B0\u1EDDi": ["b\u1EC7nh", "ch\u1EE9ng", "d\u01B0ng"],
    "ng\u1ECDc": ["am", "b\xEDch", "b\u1ED9i"],
    "nhi\u1EC7t": ["bi\u1EC3u", "c\u01A1", "dung"],
    "nh\xE0": ["\u0103n", "b\xE1o", "b\u1EA1t"],
    "nh\xE2n": ["nh\u01B0\u1EE3ng", "\xE1i", "b\u1EA3n"],
    "nh\u1EA3y": ["b\u1ED5", "c\xE1i", "cao"],
    "nh\u1EA5t": ["\u0111\xE1n", "\u0111\u1EB3ng", "\u0111\u1ECBnh"],
    "nh\u1EADn": ["bi\u1EBFt", "c\u1EA3m", "ch\xE2n"],
    "nh\u1EADp": ["b\u1ECDn", "c\u1EA3ng", "c\u1EA3nh"],
    "nh\u1EADt": ["\u1EA5n", "b\xE1o", "d\u1EA1"],
    "nh\u1ECF": ["b\xE9", "con", "d\xE3i"],
    "n\xF3ng": ["b\u1ECFng", "b\u1EE9c", "ch\u1EA3y"],
    "n\xF4ng": ["c\u1EA1n", "ch\xEDnh", "cho\xE8n"],
    "n\u01B0\u1EDBc": ["\u0103n", "b\xE0i", "b\xED"],
    "n\u1EB1m": ["b\u1EB9p", "b\u1EBFp", "co"],
    "n\u1EB7ng": ["b\u1EE5ng", "c\u0103n", "c\xE2n"],
    "n\u1ED5i": ["b\u1EADt", "b\u1ECDt", "c\xE1u"],
    "n\u1ED9i": ["ban", "b\xE0o", "bi\u1EBFn"],
    "n\u1EEF": ["binh", "cao", "ch\xFAa"],
    "phi": ["b\xE1o", "c\u1EA3ng", "c\xF4ng"],
    "phong": ["\u1EA5n", "\u1EA5p", "ba"],
    "ph\xE1": ["\xE1n", "b\u0129nh", "b\u1ECF"],
    "ph\xE1o": ["binh", "b\xF4ng", "c\u1ED1i"],
    "ph\xE1p": ["b\u1EA3o", "ch\u1EBF", "danh"],
    "ph\xE2n": ["ban", "b\u1EAFc", "b\u1EADc"],
    "ph\xE9p": ["chia", "c\u1ED9ng", "c\u01B0\u1EDBi"],
    "ph\xF3ng": ["b\xFAt", "\u0111\u1EA1i", "\u0111\xE3ng"],
    "ph\xF9": ["d\xE2u", "du", "dung"],
    "ph\u01B0\u01A1ng": ["\xE1n", "c\xE1ch", "ch\xE2m"],
    "ph\u1EA7n": ["c\u1EA3m", "\u0111\xF4ng", "g\xF3p"],
    "ph\u1EBF": ["binh", "b\u1ECF", "\u0111\u1EBF"],
    "ph\u1EE5": ["\xE2m", "b\u1EA1c", "b\u1EA3n"],
    "ph\u1EE5c": ["binh", "ch\u1EBF", "ch\u1EE9c"],
    "quang": ["\xE2m", "c\u1EA3nh", "c\u1EA7u"],
    "quay": ["chuy\u1EC3n", "c\xF3p", "cu\u1ED3ng"],
    "qu\xE2n": ["b\xE1o", "b\u1ECB", "b\xECnh"],
    "qu\u1EA3": ["b\xE0ng", "b\xE1o", "b\u1EBF"],
    "qu\u1EA3n": ["bao", "b\xE0o", "b\xFAt"],
    "qu\u1EA7n": ["\xE1o", "b\xF2", "ch\xFAng"],
    "ra": ["b\u1ED9", "chi\u1EC1u", "c\xF4ng"],
    "ru\u1ED9t": ["chay", "g\xE0", "gan"],
    "sa": ["b\xE0n", "b\u1ED3i", "ch\xE2n"],
    "sai": ["\xE1p", "b\u1EA3o", "bi\u1EC7t"],
    "sao": ["b\u1EA3n", "b\u0103ng", "b\u1EB1ng"],
    "si\xEAu": ["\xE2m", "b\u1ED9i", "c\u01B0\u1EDDng"],
    "song": ["\u1EA9m", "bi\u1EBFn", "ca"],
    "suy": ["b\u1EA1i", "b\xEC", "bi\u1EBFn"],
    "s\xE1ng": ["b\u1EA1ch", "b\xF3ng", "ch\u1EBF"],
    "s\xE2u": ["b\u1EC7nh", "b\u1ECD", "b\u1ED9t"],
    "s\u01A1n": ["ca", "c\u1EA9u", "c\u01B0\u1EDBc"],
    "s\u01B0": ["b\xE0", "b\xE1c", "c\xF4"],
    "s\u1EAFc": ["b\xE9n", "c\u1EA1nh", "ch\u1EC9"],
    "s\u1ED1ng": ["ch\u1EBFt", "c\xF2n", "dai"],
    "s\u1ED5": ["c\xE1i", "chi", "\u0111en"],
    "s\u1EDF": ["c\u1EA7u", "c\u1EADy", "c\u1EE9"],
    "s\u1EF1": ["bi\u1EBFn", "ch\u1EE7", "c\u1ED1"],
    "tai": ["\xE1c", "\xE1ch", "b\xE8o"],
    "tam": ["b\u1EA3n", "b\xE0nh", "b\u1EA3o"],
    "tha": ["b\u1ED5ng", "ch\u1EBFt", "gi\xE1c"],
    "tham": ["b\xE1c", "b\u1EA1o", "bi\u1EBFn"],
    "than": ["b\xE1nh", "b\xE9o", "b\u1EE5i"],
    "thanh": ["\xE2m", "b\u1EA1ch", "b\u1EA7n"],
    "thi": ["\xE2n", "b\xE1", "ca"],
    "thi\xEAn": ["b\u1EA9m", "binh", "c\u1EA3m"],
    "thi\u1EBFt": ["b\xEC", "b\u1ECB", "ch\u1EBF"],
    "thi\u1EBFu": ["\u0111i\u1EC1u", "g\xEC", "h\u1EE5t"],
    "thu": ["ba", "binh", "chi"],
    "thuy\u1EC1n": ["b\xE8", "b\u1ED3ng", "bu\u1ED3m"],
    "thu\u1ED1c": ["b\u1EAFc", "b\u1ECFng", "b\u1ED5"],
    "th\xE1i": ["\xE2m", "\u1EA5p", "\u1EA5t"],
    "th\xE1nh": ["ca", "ch\u1EC9", "ch\xFAa"],
    "th\xE2m": ["\u1EA3o", "canh", "cung"],
    "th\xF9": ["\xE2n", "du", "\u0111\xE1p"],
    "th\u01B0": ["\xE1n", "c\u1EE5c", "du\u1ED7i"],
    "th\u01B0\u01A1ng": ["binh", "c\u1EA3m", "c\u1EA3ng"],
    "th\u01B0\u1EDDng": ["bi\u1EBFn", "d\xE2n", "d\xF9ng"],
    "th\u01B0\u1EE3ng": ["c\u1EA5p", "c\u1ED5", "c\xF4ng"],
    "th\u1EA5t": ["b\u1EA1i", "b\u1EA3o", "b\xE1t"],
    "th\u1EA7n": ["b\xED", "ch\u1EBFt", "ch\u1EE7"],
    "th\u1EADp": ["\xE1c", "can", "c\u1EA9m"],
    "th\u1EC3": ["c\xE1ch", "ch\u1EA5t", "ch\u1EBF"],
    "th\u1ED5": ["\xE2m", "canh", "c\u1EA9m"],
    "th\u1EE3": ["b\u1EA1c", "b\u1EA1n", "c\u1EA3"],
    "th\u1EE5": ["\xE2n", "b\u1EC7nh", "b\xEC"],
    "th\u1EE7": ["b\u1EA1", "b\u1EA3n", "b\xFAt"],
    "th\u1EE9": ["ba", "b\u1EA3y", "b\u1EADc"],
    "th\u1EEBa": ["\xE2n", "c\u01A1", "d\u1ECBp"],
    "tinh": ["anh", "b\xE0o", "binh"],
    "ti\xEAn": ["c\u1EA3nh", "ch\u1EC9", "c\xF4"],
    "ti\xEAu": ["\xE2m", "b\u1EA3n", "bi\u1EBFn"],
    "ti\u1EBFng": ["d\u1ED9i", "d\u1EEF", "\u0111\u1ECBch"],
    "ti\u1EBFt": ["canh", "ch\u1EBF", "d\xEA"],
    "ti\u1EC1n": ["\xE1n", "b\u1EA1c", "b\u1ED1i"],
    "ti\u1EC3u": ["b\xE0i", "ban", "bang"],
    "to\xE0n": ["b\u1ECB", "b\xEDch", "b\u1ED9"],
    "tranh": ["\u1EA3nh", "\u0103n", "bi\u1EC7n"],
    "tri": ["\xE2m", "\xE2n", "ch\xE2u"],
    "trung": ["b\xEC", "b\xECnh", "b\u1ED9"],
    "truy": ["b\u1EE9c", "c\u1EE9u", "\u0111i\u1EC7u"],
    "truy\u1EC1n": ["b\xE1", "b\u1EA3o", "c\u1EA3m"],
    "tr\xE1i": ["c\xE2n", "ch\u1EE7", "ch\u1EE9ng"],
    "tr\xF9ng": ["chu\xF4ng", "c\u1ECF", "c\u1EEDu"],
    "tr\u01B0\u1EDFng": ["ban", "\u0111o\xE0n", "\u0111\u1ED3n"],
    "tr\u1EA3": ["\xE2n", "b\u1EEFa", "c\xF4ng"],
    "tr\u1EA7m": ["b\u1ED5ng", "c\u1EA3m", "h\xE0"],
    "tr\u1EA7n": ["ai", "b\xEC", "c\u1EA7u"],
    "tr\u1ECDng": ["\xE1n", "\xE2m", "b\u1EC7nh"],
    "tr\u1ED1ng": ["b\u1ECFi", "c\xE1i", "canh"],
    "tr\u1EDF": ["chua", "ch\u1EE9ng", "d\u1EA1"],
    "tr\u1EE3": ["b\xE0o", "b\xFAt", "c\u1EA5p"],
    "tr\u1EEB": ["b\xEC", "b\u1ECB", "b\u1ECF"],
    "tu": ["b\u1ED5", "ch\xED", "ch\u1EC9nh"],
    "t\xE0": ["d\xE2m", "d\u01B0\u01A1ng", "\u0111\u1EA1o"],
    "t\xE0n": ["\xE1c", "b\u1EA1o", "binh"],
    "t\xE1c": ["chi\u1EBFn", "d\u1EE5ng", "\u0111\u1ED9ng"],
    "t\xE1i": ["b\u1EA3n", "b\xFAt", "c\u1EED"],
    "t\xE2m": ["b\u1EC7nh", "b\xEC", "can"],
    "t\xE2n": ["b\u1EB1ng", "binh", "ch\u1EE7"],
    "t\xEAn": ["b\u1ECBp", "ch\u1EEF", "\u0111\u1EA1n"],
    "t\xECnh": ["\xE1i", "b\u1EA1n", "b\xE1o"],
    "t\xEDnh": ["c\xE1ch", "ch\u1EA5t", "chuy\u1EC7n"],
    "t\xF4n": ["ch\u1EC9", "ch\u1EE7", "gi\xE1o"],
    "t\xF9": ["binh", "c\u1EB3ng", "\u0111\xE0y"],
    "t\u0103ng": ["b\u1ED9i", "ch\xFAng", "c\u01B0\u1EDDng"],
    "t\u01A1": ["c\u1EA3m", "duy\xEAn", "\u0111\xE0o"],
    "t\u01B0": ["b\u1EA3n", "b\u1EA9m", "bi\u1EC7n"],
    "t\u01B0\u01A1ng": ["\xE1i", "b\xE0o", "c\xE1ch"],
    "t\u1EA5t": ["b\u1EADt", "c\u1EA3", "d\xE0i"],
    "t\u1EA7m": ["\xE2m", "b\u1EADy", "b\xF3p"],
    "t\u1EADn": ["c\xF9ng", "d\u1EE5ng", "hi\u1EBFu"],
    "t\u1EADp": ["\u1EA5m", "con", "c\xF4ng"],
    "t\u1EC9": ["d\u1EE5", "\u0111\u1ED1i", "gi\xE1"],
    "t\u1EC9nh": ["b\u1ED9", "b\u01A1", "d\u1EADy"],
    "t\u1ED5": ["\u1EA5m", "b\u1ED1", "ch\u1EA5y"],
    "t\u1ED5ng": ["bao", "binh", "b\u1ED9"],
    "t\u1EE9": ["b\xE0ng", "b\u1EA3o", "b\u1EC1"],
    "t\u1EE9c": ["b\u1EF1c", "c\u1EA3nh", "c\u01B0\u1EDDi"],
    "t\u1EEB": ["\xE1i", "bi", "bi\u1EC7t"],
    "t\u1EED": ["bi\u1EC7t", "chi\u1EBFn", "cung"],
    "t\u1EF1": ["\u1EA3i", "\xE1i", "bi\xEAn"],
    "u": ["\xE1m", "\u1EA9n", "bu\u1ED3n"],
    "vi": ["\u1EA3nh", "ba", "ch\u1EA5n"],
    "vi\u1EC5n": ["\u1EA3nh", "c\u1EA3nh", "ch\xED"],
    "v\xE0ng": ["anh", "\u1EA1nh", "b\u1EA1c"],
    "v\xF2ng": ["bi", "c\u1ED5", "\u0111ai"],
    "v\xF5": ["b\u1ECB", "bi\u1EC1n", "c\xF4ng"],
    "v\u0169": ["b\xE3o", "b\u1ECB", "c\xF4ng"],
    "v\u1EA1n": ["an", "b\u1EA3o", "b\u1ED9i"],
    "v\u1EADn": ["chuy\u1EC3n", "d\u1EE5ng", "\u0111\u1ED9ng"],
    "v\u1EADt": ["ch\u1EA5t", "ch\u1EE7", "d\u1EE5c"],
    "v\u1ECB": ["chi", "danh", "d\u1ECBch"],
    "v\u1EE1": ["b\u1EE5ng", "ch\u1EE3", "chum"],
    "v\u1EEBa": ["\u0111\xF4i", "kh\xE9o", "khi"],
    "xa": ["c\xE1ch", "c\u1EA3ng", "g\u1EA7n"],
    "xu\u1EA5t": ["b\u1EA3n", "bi\xEAn", "binh"],
    "x\u01B0\u01A1ng": ["b\xF2", "b\xFAa", "b\u01B0\u1EDBm"],
    "x\u1EA5u": ["b\u1EE5ng", "ch\u01A1i", "d\u1EA1"],
    "x\u1EED": ["\xE1n", "b\u1EAFn", "\u0111o\xE1n"],
    "\xE1c": ["b\xE1", "c\u1EA3m", "chi\u1EBFn"],
    "\xE1o": ["b\xE0o", "b\xF4ng", "c\xE1nh"],
    "\xE1p": ["b\xE1ch", "b\u1EE9c", "ch\u1EA3o"],
    "\xE2m": ["\u1EA9m", "\u1EA5m", "b\u1EA3n"],
    "\xE2n": ["\xE1i", "c\u1EA7n", "\u0111i\u1EC3n"],
    "\xF4": ["danh", "\u0111\u1EA7u", "hay"],
    "\xF4ng": ["anh", "b\xE0", "b\u1EA7u"],
    "\u0111a": ["b\xE0o", "b\u1EC7nh", "b\u1ED9i"],
    "\u0111au": ["b\xE3o", "b\u1EE5ng", "bu\u1ED3n"],
    "\u0111\xE0n": ["anh", "\xE1p", "b\xE0"],
    "\u0111\xE0o": ["binh", "b\u1EDBi", "h\xE1t"],
    "\u0111\xE1": ["b\u1EA3ng", "b\u1ECDt", "c\u1ED1i"],
    "\u0111\xE1ng": ["b\u1EADc", "bu\u1ED3n", "ch\u1EBFt"],
    "\u0111\xE1nh": ["b\u1EA3", "b\u1EA1c", "b\xE0i"],
    "\u0111\xE8n": ["b\xE3o", "b\xE1o", "b\u1EA5m"],
    "\u0111\xF3ng": ["bao", "b\u0103ng", "b\u1ED9"],
    "\u0111\u01A1n": ["\xE2m", "b\u1EA1c", "b\xE0o"],
    "\u0111\u01B0a": ["cay", "ch\xE2n", "d\xE2u"],
    "\u0111\u01B0\u01A1ng": ["cai", "ch\u1EE9c", "c\u1EE5c"],
    "\u0111\u01B0\u1EDDng": ["b\xE1nh", "bao", "bay"],
    "\u0111\u1EA1o": ["binh", "ch\xEDch", "c\xF4"],
    "\u0111\u1EA5u": ["\u1EA9u", "b\xF2", "b\xF3ng"],
    "\u0111\u1EA7u": ["b\xE0i", "b\u1EBFp", "b\xF2"],
    "\u0111\u1EA7y": ["\u1EAFp", "\u1EB7p", "b\u1EE5ng"],
    "\u0111\u1EADu": ["chi\u1EC1u", "\u0111\u0169a", "h\u0169"],
    "\u0111\u1EB3ng": ["\xE1p", "b\u1ED9i", "cao"],
    "\u0111\u1EB7c": ["\xE2n", "bi\u1EC7t", "c\xE1ch"],
    "\u0111\u1EC1": ["\xE1n", "b\xE0i", "b\u1EA1t"],
    "\u0111\u1ECBa": ["b\u1EA1", "b\xE0n", "b\u1ED9"],
    "\u0111\u1ECBnh": ["\xE2m", "bi\xEAn", "b\u1EE5ng"],
    "\u0111\u1ECF": ["au", "b\u1EEBng", "ch\xF3e"],
    "\u0111\u1ED1i": ["b\xE0o", "c\xE1ch", "c\u1EA3m"],
    "\u0111\u1ED3": ["\xE1n", "\u0103n", "b\u1EA1c"],
    "\u0111\u1ED3ng": ["\xE2m", "b\u1EA1c", "b\u1EA1ch"],
    "\u0111\u1ED5": ["b\xE1c", "b\u1EC3", "b\u1EC7nh"],
    "\u0111\u1ED9": ["cao", "chu\u1EA9n", "ch\u1EEBng"],
    "\u0111\u1ED9c": ["\xE2m", "b\u1EA1ch", "b\u1EA3n"],
    "\u0111\u1ED9ng": ["bi\u1EC3n", "binh", "c\u1EA5n"],
    "\u01B0u": ["\xE1i", "binh", "\u0111\xE3i"],
    "\u01B0\u1EDBc": ["ao", "chung", "ch\u1EEBng"],
    "\u1EA9n": ["c\u01B0", "danh", "d\u1EADt"],
    "\u1ED1ng": ["b\u01A1m", "d\u1EABn", "d\xF2m"],
    "\u1EE9ng": ["bi\u1EBFn", "chi\u1EBFn", "c\u1EED"]
  };
  var DEVELOPER_WHITELIST_BIGRAMS = {
    // Version Control & Containerization
    "git": ["push", "commit", "pull", "status", "checkout", "branch", "merge", "rebase", "clone", "fetch", "stash"],
    "docker": ["run", "compose", "build", "images", "ps", "exec", "logs", "stop", "volume", "network"],
    // Package Managers
    "npm": ["install", "run", "start", "test", "publish", "update", "uninstall", "ci", "init"],
    "yarn": ["install", "add", "remove", "run", "start", "build", "why"],
    "pnpm": ["add", "install", "run", "store", "update", "remove"],
    "cargo": ["build", "run", "test", "check", "clippy", "fmt", "update", "publish", "doc"],
    "pip": ["install", "uninstall", "freeze", "list", "show"],
    "bun": ["run", "install", "add", "test", "build"],
    // Programming Languages & Tooling Scripts
    "python": ["run", "manage.py", "main.py", "-m", "venv"],
    "node": ["index.js", "server.js", "dist/main.js", "--watch", "--version"],
    "go": ["run", "build", "test", "mod", "fmt", "vet"],
    "rustc": ["--version", "-O"],
    "deno": ["run", "task", "test", "compile", "fmt", "lint"],
    "npx": ["playwright", "esbuild", "prettier", "eslint", "tsc", "web-ext"],
    // Cloud Infrastructure & Web Engines
    "kubectl": ["get", "apply", "delete", "describe", "logs", "exec", "rollout"],
    "aws": ["configure", "s3", "ec2", "lambda", "iam"],
    "supabase": ["init", "start", "stop", "db", "functions", "login"],
    "firebase": ["login", "init", "deploy", "serve", "emulators"],
    "pull": ["request", "origin"],
    "merge": ["request", "conflict", "branch"]
  };
  function injectDeveloperBigrams(baseBigrams) {
    if (!baseBigrams || typeof baseBigrams !== "object") return baseBigrams;
    const merged = { ...baseBigrams };
    for (const [key, candidates] of Object.entries(DEVELOPER_WHITELIST_BIGRAMS)) {
      if (!merged[key]) {
        merged[key] = candidates;
      } else {
        merged[key] = Array.from(/* @__PURE__ */ new Set([...candidates, ...merged[key]])).slice(0, 4);
      }
    }
    return merged;
  }
  var DEFAULT_VIETNAMESE_BIGRAMS = injectDeveloperBigrams(RAW_VIETNAMESE_BIGRAMS);
  var DEFAULT_VIETNAMESE_TRIGRAMS = {
    // Phương ngữ Sài Gòn xưa & Nam Bộ dân gian
    "s\xE0i g\xF2n": ["x\u01B0a", "\u0111\u1EB9p l\u1EAFm", "hoa l\u1EC7"],
    "b\xE1 ch\xE1y": ["b\xF9 ch\xE9t"],
    "b\xE1 ch\u1EA5y": ["b\xF9 ch\xE9t"],
    "b\xE1 l\xE1p": ["b\xE1 x\xE0m"],
    "ba la": ["ba x\u1EA1o"],
    "ba x\u1EA1o": ["ba k\xE9p"],
    "b\xE0 ch\u1EB1n": ["l\u1EEDa"],
    "c\xE0 r\u1ECBch": ["c\xE0 tang"],
    "c\xE0 ch\u1EDBn": ["c\xE0 ch\xE1c", "c\xE0 ch\xE1o"],
    "c\xE0 nh\u1ECFng": ["c\xE0 nh\u1ECFng"],
    "c\xF9 l\u1EA7n": ["l\u1EEFa"],
    "c\u1EE9ng \u0111\u1EA7u": ["c\u1EE9ng c\u1ED5"],
    "\u0111\xF2 th\u1EE7": ["thi\xEAm"],
    "h\u1EBFt ga": ["h\u1EBFt s\u1ED1"],
    "h\u1EBFt x\xED": ["qu\xE1ch"],
    "h\u1ED5ng d\xE1m": ["\u0111\xE2u"],
    "h\u1ED5ng c\xF3": ["chi"],
    "m\xE8n \u0111\xE9c": ["\u01A1i"],
    "m\xE8n \u01A1i": ["tr\u1EDDi \u0111\u1EA5t", "nghen"],
    "h\u1EBFt n\u01B0\u1EDBc": ["ch\u1EA5m", "mi\u1EBFng"],
    "ngon l\xE0nh": ["c\xE0nh \u0111\xE0o"],
    "\u0103n ngay": ["n\xF3i th\u1EADt"],
    "\u0103n coi": ["n\u1ED3i"],
    "ng\u1ED3i coi": ["h\u01B0\u1EDBng"],
    "m\u01B0a th\xFAi": ["\u0111\u1EA5t"],
    "qu\u1EC9 tha": ["ma b\u1EAFt"],
    "t\xE0o lao": ["m\xEDa lao", "chi \u0111\u1ECBa"],
    "th\u1ECDc c\xF9": ["l\xE9t"],
    "th\u1EC1m ba": ["nh\xE0"],
    "tr\u1EDDi \u0111\xE1nh": ["th\xE1nh \u0111\xE2m"],
    "tr\u1EDDi th\u1EA7n": ["\u01A1i"],
    "v\u1EAFt gi\xF2": ["l\xEAn c\u1ED5"],
    "h\u1EBFt s\u1EA9y": ["con b\xE0 b\u1EA3y"],
    "ng\u1ED9 \xE1": ["nghen"],
    "coi b\u1ED9": ["\u0111\u01B0\u1EE3c nghen", "ngon"],
    "thi\u1EC7t t\xECnh": ["\xE1", "h\u1EBFt s\u1EE9c"],
    // Y tế / Bệnh viện
    "xe c\u1EA5p": ["c\u1EE9u"],
    "ph\xF2ng c\u1EA5p": ["c\u1EE9u"],
    "b\u1EC7nh vi\u1EC7n": ["ch\u1EE3 r\u1EABy", "nhi \u0111\u1ED3ng", "t\u1EEB d\u0169", "b\xECnh d\xE2n"],
    "b\xE1c s\u0129": ["gia \u0111\xECnh", "tr\u01B0\u1EDFng khoa", "chuy\xEAn khoa"],
    // Đời sống, thương mại, tài chính
    "ti\u1EC1n ph\u1EE5": ["c\u1EA5p"],
    "chuy\u1EC3n kho\u1EA3n": ["ng\xE2n h\xE0ng", "th\xE0nh c\xF4ng", "ngay"],
    "t\xE0i kho\u1EA3n": ["ng\xE2n h\xE0ng", "ti\u1EBFt ki\u1EC7m"],
    "h\xE3ng xe": ["\u0111\xF2", "l\xF4i", "lam"],
    // Địa danh miền Nam & Sài Gòn
    "th\xE0nh ph\u1ED1": ["s\xE0i g\xF2n", "\u0111\xE0 l\u1EA1t", "c\u1EA7n th\u01A1", "m\u1EF9 tho", "v\u0169ng t\xE0u", "nha trang", "hu\u1EBF", "\u0111\xE0 n\u1EB5ng"],
    "ch\u1EE3 b\u1EBFn": ["th\xE0nh"],
    "b\u1EBFn ninh": ["ki\u1EC1u"],
    "s\xF4ng b\u1EBFn": ["ngh\xE9"],
    "c\u1EA7u s\xE0i": ["g\xF2n"],
    "vi\u1EC7t nam": ["c\u1ED9ng h\xF2a"],
    // Công nghệ / Lập trình
    "tr\xED tu\u1EC7": ["nh\xE2n t\u1EA1o"],
    "m\u1EA1ng m\xE1y": ["t\xEDnh"],
    "c\u01A1 s\u1EDF": ["d\u1EEF li\u1EC7u"],
    "h\u1EC7 \u0111i\u1EC1u": ["h\xE0nh"],
    "m\xE3 ngu\u1ED3n": ["m\u1EDF"],
    "ph\u1EA7n m\u1EC1m": ["m\xE3 ngu\u1ED3n m\u1EDF", "ti\u1EC7n \xEDch"],
    // Giao tiếp / Xã giao
    "ch\xFAc m\u1EEBng": ["sinh nh\u1EADt", "n\u0103m m\u1EDBi", "th\xE0nh c\xF4ng", "b\u1EA1n"],
    "c\u1EA3m \u01A1n": ["b\u1EA1n", "r\u1EA5t nhi\u1EC1u", "anh", "ch\u1ECB", "em"],
    "h\u1EB9n g\u1EB7p": ["l\u1EA1i", "nhau"],
    "r\u1EA5t vui": ["\u0111\u01B0\u1EE3c g\u1EB7p b\u1EA1n", "\u0111\u01B0\u1EE3c l\xE0m quen"],
    "ch\xFAc ng\u1EE7": ["ngon"],
    "xin ch\xE2n": ["th\xE0nh"],
    "ch\xE2n th\xE0nh": ["c\u1EA3m \u01A1n"]
  };
  var GboardLearnedModel = class {
    constructor() {
      this.storageKey = "avim_gboard_habit_model";
      this.learningEnabled = true;
      this.userTrigrams = {};
      this.userBigrams = {};
      this.userUnigrams = {};
      this.loadFromStorage();
    }
    /**
     * Calculate score incorporating Recency and Frequency with Domain-Isolation Weight Lock:
     * Score = count * exp(-lambda * delta_hours)
     * Half-life ~ 14 days (lambda = 0.002 per hour for general words)
     * If isDevDomain is true:
     *   - Freezes decay (lambda = 0.0001, effectively zero decay)
     *   - Grants a robust base anchor bonus (+5.0) so technical tokens and commands
     *     are never eclipsed by fast conversational chat volume.
     */
    calculateRecencyFrequencyScore(entry, now = Date.now(), isDevDomain = false) {
      if (!entry) return 0;
      if (typeof entry === "number") {
        return isDevDomain ? entry + 5 : entry;
      }
      const count = entry.count || 1;
      const lastUsed = entry.lastUsed || now;
      const hoursElapsed = Math.max(0, (now - lastUsed) / (1e3 * 60 * 60));
      const lambda = isDevDomain ? 1e-4 : 2e-3;
      const decay = Math.exp(-lambda * hoursElapsed);
      const score = count * decay;
      return isDevDomain ? score + 5 : score;
    }
    async loadFromStorage() {
      try {
        if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
          const stored = await chrome.storage.local.get([this.storageKey]);
          if (stored && stored[this.storageKey]) {
            const parsed = stored[this.storageKey];
            this.userTrigrams = parsed.trigrams || {};
            this.userBigrams = parsed.bigrams || {};
            this.userUnigrams = parsed.unigrams || {};
            if (typeof parsed.learningEnabled === "boolean") {
              this.learningEnabled = parsed.learningEnabled;
            }
            return;
          }
        }
      } catch (e) {
        console.warn("GboardLearnedModel chrome.storage.local load error:", e);
      }
      try {
        if (typeof localStorage === "undefined") return;
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          this.userTrigrams = parsed.trigrams || {};
          this.userBigrams = parsed.bigrams || {};
          this.userUnigrams = parsed.unigrams || {};
          if (typeof parsed.learningEnabled === "boolean") {
            this.learningEnabled = parsed.learningEnabled;
          }
        }
      } catch (e) {
        console.warn("GboardLearnedModel localStorage load error:", e);
      }
    }
    saveToStorage() {
      if (this._saveTimer) {
        clearTimeout(this._saveTimer);
      }
      this._saveTimer = setTimeout(() => {
        this._saveTimer = null;
        this.flushSaveToStorage();
      }, 1200);
    }
    flushSaveToStorage() {
      if (this._saveTimer) {
        clearTimeout(this._saveTimer);
        this._saveTimer = null;
      }
      const payload = {
        learningEnabled: this.learningEnabled,
        trigrams: this.userTrigrams,
        bigrams: this.userBigrams,
        unigrams: this.userUnigrams,
        updatedAt: Date.now()
      };
      try {
        if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
          chrome.storage.local.set({ [this.storageKey]: payload }).catch(() => {
          });
        }
      } catch (e) {
      }
      try {
        if (typeof localStorage !== "undefined") {
          localStorage.setItem(this.storageKey, JSON.stringify(payload));
        }
      } catch (e) {
        console.warn("GboardLearnedModel localStorage save error:", e);
      }
    }
    /**
     * Record a trigram transition (word1 + word2 -> word3)
     */
    recordTrigramTransition(w1, w2, w3) {
      if (!this.learningEnabled) return;
      const word1 = (w1 || "").trim().toLowerCase();
      const word2 = (w2 || "").trim().toLowerCase();
      const word3 = (w3 || "").trim().toLowerCase();
      if (!word1 || !word2 || !word3) return;
      if (word1.length > 30 || word2.length > 30 || word3.length > 30) return;
      const trigramKey = `${word1} ${word2}`;
      if (!this.userTrigrams[trigramKey]) {
        this.userTrigrams[trigramKey] = {};
      }
      const current = this.userTrigrams[trigramKey][word3];
      const prevCount = typeof current === "number" ? current : current?.count || 0;
      this.userTrigrams[trigramKey][word3] = {
        count: prevCount + 1,
        lastUsed: Date.now()
      };
      this.saveToStorage();
    }
    /**
     * Record a bigram transition (word1 -> word2)
     */
    recordTransition(prevWord, nextWord) {
      if (!this.learningEnabled) return;
      const prev = (prevWord || "").trim().toLowerCase();
      const next = (nextWord || "").trim().toLowerCase();
      if (!prev || !next || prev === next) return;
      if (prev.length > 30 || next.length > 30) return;
      if (!this.userBigrams[prev]) {
        this.userBigrams[prev] = {};
      }
      const current = this.userBigrams[prev][next];
      const prevCount = typeof current === "number" ? current : current?.count || 0;
      this.userBigrams[prev][next] = {
        count: prevCount + 1,
        lastUsed: Date.now()
      };
      const curUnigram = this.userUnigrams[next];
      const unigramCount = typeof curUnigram === "number" ? curUnigram : curUnigram?.count || 0;
      this.userUnigrams[next] = {
        count: unigramCount + 1,
        lastUsed: Date.now()
      };
      this.saveToStorage();
    }
    /**
     * Record word acceptance or completion frequency
     */
    recordWordUsage(word) {
      if (!this.learningEnabled) return;
      const w = (word || "").trim().toLowerCase();
      if (!w) return;
      const curUnigram = this.userUnigrams[w];
      const unigramCount = typeof curUnigram === "number" ? curUnigram : curUnigram?.count || 0;
      this.userUnigrams[w] = {
        count: unigramCount + 1,
        lastUsed: Date.now()
      };
      this.saveToStorage();
    }
    /**
     * Reset all learned habits
     */
    clear() {
      this.userTrigrams = {};
      this.userBigrams = {};
      this.userUnigrams = {};
      this.flushSaveToStorage();
      try {
        if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
          chrome.storage.local.remove([this.storageKey]).catch(() => {
          });
        }
      } catch (e) {
      }
    }
    /**
     * Seed sample collocations and user habits for demonstration
     */
    seedSampleHabits() {
      const samples = [
        ["nghi\xEAn", "c\u1EE9u", 6],
        ["c\xF4ng", "ngh\u1EC7", 5],
        ["th\xF4ng", "tin", 5],
        ["tr\xED", "tu\u1EC7", 4],
        ["h\u1ECDc", "t\u1EADp", 4],
        ["sinh", "vi\xEAn", 4],
        ["ph\xE1t", "tri\u1EC3n", 4],
        ["c\u1EA5p", "c\u1EE9u", 4],
        ["vi\u1EC7t", "nam", 4]
      ];
      const now = Date.now();
      for (const [w1, w2, times] of samples) {
        if (!this.userBigrams[w1]) {
          this.userBigrams[w1] = {};
        }
        this.userBigrams[w1][w2] = { count: times, lastUsed: now };
        this.userUnigrams[w2] = { count: times, lastUsed: now };
      }
      const sampleTrigrams = [
        ["xe", "c\u1EA5p", "c\u1EE9u", 5],
        ["h\u1ED3", "ch\xED", "minh", 5],
        ["b\u1ED9", "giao", "th\xF4ng", 4],
        ["tr\xED", "tu\u1EC7", "nh\xE2n t\u1EA1o", 4]
      ];
      for (const [w1, w2, w3, times] of sampleTrigrams) {
        const k = `${w1} ${w2}`;
        if (!this.userTrigrams[k]) this.userTrigrams[k] = {};
        this.userTrigrams[k][w3] = { count: times, lastUsed: now };
      }
      this.flushSaveToStorage();
      return samples.length;
    }
    /**
     * Retrieve statistical summary of learned habits
     */
    getStats() {
      let totalTransitions = 0;
      const topPairs = [];
      for (const [from, toMap] of Object.entries(this.userBigrams)) {
        for (const [to, entry] of Object.entries(toMap)) {
          const count = typeof entry === "number" ? entry : entry?.count || 0;
          totalTransitions += count;
          topPairs.push({ from, to, count });
        }
      }
      topPairs.sort((a, b) => b.count - a.count);
      return {
        totalPairs: Object.keys(this.userBigrams).length,
        totalTrigrams: Object.keys(this.userTrigrams).length,
        totalTransitions,
        topPairs: topPairs.slice(0, 30),
        totalWordsLearned: Object.keys(this.userUnigrams).length
      };
    }
    /**
     * Export all learned habits data as JSON string
     * @returns {string} Formatted JSON
     */
    exportJSON() {
      const payload = {
        version: "2.0",
        exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
        trigrams: this.userTrigrams,
        bigrams: this.userBigrams,
        unigrams: this.userUnigrams
      };
      return JSON.stringify(payload, null, 2);
    }
    /**
     * Export bigram habits as CSV string
     * Format: "word1,word2,count"
     * @returns {string} CSV text
     */
    exportCSV() {
      const rows = ["Tu_bat_dau,Tu_ke_tiep,So_lan_go"];
      for (const [w1, toMap] of Object.entries(this.userBigrams)) {
        for (const [w2, entry] of Object.entries(toMap)) {
          const count = typeof entry === "number" ? entry : entry?.count || 0;
          rows.push(`"${w1.replace(/"/g, '""')}","${w2.replace(/"/g, '""')}",${count}`);
        }
      }
      return rows.join("\n");
    }
    /**
     * Import learned habits from JSON or CSV string
     * @param {string} rawText Input string
     * @param {boolean} merge If true, increment/combine counts; if false, overwrite
     * @returns {{ success: boolean, count: number, error?: string }}
     */
    importData(rawText, merge = true) {
      if (!rawText || typeof rawText !== "string") {
        return { success: false, count: 0, error: "D\u1EEF li\u1EC7u nh\u1EADp r\u1ED7ng ho\u1EB7c kh\xF4ng h\u1EE3p l\u1EC7." };
      }
      const trimmed = rawText.trim();
      if (!trimmed) {
        return { success: false, count: 0, error: "N\u1ED9i dung nh\u1EADp r\u1ED7ng." };
      }
      let importedBigrams = {};
      let importedUnigrams = {};
      let pairCount = 0;
      if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
        try {
          const parsed = JSON.parse(trimmed);
          const bigramsSrc = parsed.bigrams || parsed.userBigrams || (typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null);
          const trigramsSrc = parsed.trigrams || parsed.userTrigrams || {};
          const unigramsSrc = parsed.unigrams || parsed.userUnigrams || {};
          if (!bigramsSrc || typeof bigramsSrc !== "object") {
            return { success: false, count: 0, error: "C\u1EA5u tr\xFAc JSON kh\xF4ng ch\u1EE9a thu\u1ED9c t\xEDnh bigrams h\u1EE3p l\u1EC7." };
          }
          const now = Date.now();
          for (const [w1, toMap] of Object.entries(bigramsSrc)) {
            if (toMap && typeof toMap === "object") {
              for (const [w2, entry] of Object.entries(toMap)) {
                const num = typeof entry === "number" ? entry : parseInt(entry?.count, 10);
                const lastUsed = typeof entry === "object" && entry?.lastUsed ? entry.lastUsed : now;
                if (!isNaN(num) && num > 0) {
                  const k1 = w1.trim().toLowerCase();
                  const k2 = w2.trim().toLowerCase();
                  if (k1 && k2) {
                    if (!importedBigrams[k1]) importedBigrams[k1] = {};
                    importedBigrams[k1][k2] = { count: num, lastUsed };
                    importedUnigrams[k2] = { count: (importedUnigrams[k2]?.count || 0) + num, lastUsed };
                    pairCount++;
                  }
                }
              }
            }
          }
          if (trigramsSrc && typeof trigramsSrc === "object") {
            if (!this.userTrigrams) this.userTrigrams = {};
            for (const [tKey, toMap] of Object.entries(trigramsSrc)) {
              if (toMap && typeof toMap === "object") {
                if (!this.userTrigrams[tKey]) this.userTrigrams[tKey] = {};
                for (const [w3, entry] of Object.entries(toMap)) {
                  const num = typeof entry === "number" ? entry : parseInt(entry?.count, 10);
                  const lastUsed = typeof entry === "object" && entry?.lastUsed ? entry.lastUsed : now;
                  if (!isNaN(num) && num > 0) {
                    this.userTrigrams[tKey][w3.trim().toLowerCase()] = { count: num, lastUsed };
                  }
                }
              }
            }
          }
        } catch (err) {
          return { success: false, count: 0, error: `L\u1ED7i \u0111\u1ECDc JSON: ${err.message}` };
        }
      } else {
        const lines = trimmed.split(/\r?\n/);
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          if (i === 0 && (line.toLowerCase().includes("tu_bat_dau") || line.toLowerCase().includes("word1"))) {
            continue;
          }
          let parts = [];
          if (line.includes(",")) {
            parts = line.split(",");
          } else if (line.includes("	")) {
            parts = line.split("	");
          } else if (line.includes(";")) {
            parts = line.split(";");
          }
          if (parts.length >= 2) {
            const w1 = parts[0].replace(/^["']|["']$/g, "").trim().toLowerCase();
            const w2 = parts[1].replace(/^["']|["']$/g, "").trim().toLowerCase();
            const count = parts[2] ? parseInt(parts[2].replace(/^["']|["']$/g, "").trim(), 10) : 1;
            const validCount = isNaN(count) || count <= 0 ? 1 : count;
            if (w1 && w2) {
              const now = Date.now();
              if (!importedBigrams[w1]) importedBigrams[w1] = {};
              importedBigrams[w1][w2] = { count: validCount, lastUsed: now };
              importedUnigrams[w2] = { count: validCount, lastUsed: now };
              pairCount++;
            }
          }
        }
      }
      if (pairCount === 0) {
        return { success: false, count: 0, error: "Kh\xF4ng t\xECm th\u1EA5y c\u1EB7p t\u1EEB h\u1EE3p l\u1EC7 trong d\u1EEF li\u1EC7u." };
      }
      if (!merge) {
        this.userBigrams = importedBigrams;
        this.userUnigrams = importedUnigrams;
      } else {
        const now = Date.now();
        for (const [w1, toMap] of Object.entries(importedBigrams)) {
          if (!this.userBigrams[w1]) this.userBigrams[w1] = {};
          for (const [w2, entry] of Object.entries(toMap)) {
            const addCount = typeof entry === "number" ? entry : entry?.count || 1;
            const cur = this.userBigrams[w1][w2];
            const curCount = typeof cur === "number" ? cur : cur?.count || 0;
            this.userBigrams[w1][w2] = { count: curCount + addCount, lastUsed: now };
          }
        }
        for (const [w, entry] of Object.entries(importedUnigrams)) {
          const addCount = typeof entry === "number" ? entry : entry?.count || 1;
          const cur = this.userUnigrams[w];
          const curCount = typeof cur === "number" ? cur : cur?.count || 0;
          this.userUnigrams[w] = { count: curCount + addCount, lastUsed: now };
        }
      }
      this.flushSaveToStorage();
      return { success: true, count: pairCount };
    }
  };
  var AutoCompleteEngine = class {
    constructor() {
      this.compounds = [...COMMON_VIETNAMESE_COMPOUNDS];
      this.compoundIndex = this.buildCompoundIndex();
      this.bigrams = { ...DEFAULT_VIETNAMESE_BIGRAMS };
      this.trigrams = { ...DEFAULT_VIETNAMESE_TRIGRAMS };
      this.learnedModel = new GboardLearnedModel();
      this.enabled = true;
      this.nextWordEnabled = true;
    }
    setEnabled(enabled) {
      this.enabled = !!enabled;
    }
    setNextWordEnabled(enabled) {
      this.nextWordEnabled = !!enabled;
    }
    setLearningEnabled(enabled) {
      if (this.learnedModel) {
        this.learnedModel.learningEnabled = !!enabled;
      }
    }
    loadFromStorage() {
      if (this.learnedModel && typeof this.learnedModel.loadFromStorage === "function") {
        this.learnedModel.loadFromStorage();
      }
    }
    saveToStorage() {
      if (this.learnedModel && typeof this.learnedModel.saveToStorage === "function") {
        this.learnedModel.saveToStorage();
      }
    }
    buildCompoundIndex() {
      return this.compounds.map((word) => ({
        word,
        lower: word.toLowerCase(),
        stripped: stripVietnameseAccents(word),
        type: "compound",
        displayType: "C\u1EE5m t\u1EEB"
      }));
    }
    /**
     * Add new compound words or phrases dynamically
     */
    addCustomPhrase(phrase) {
      const clean = (phrase || "").trim();
      if (!clean || this.compounds.includes(clean)) return;
      this.compounds.push(clean);
      this.compoundIndex.push({
        word: clean,
        lower: clean.toLowerCase(),
        stripped: stripVietnameseAccents(clean),
        type: "compound",
        displayType: "C\u1EE5m t\u1EEB"
      });
    }
    /**
     * Record word transition when user types or chooses word sequence
     * Supports both bigram (w1 -> w2) and trigram (w0 -> w1 -> w2) learning
     */
    recordWordTransition(prevWord, nextWord, priorWord = "") {
      this.learnedModel.recordTransition(prevWord, nextWord);
      if (priorWord) {
        this.learnedModel.recordTrigramTransition(priorWord, prevWord, nextWord);
      }
    }
    /**
     * Record word usage
     */
    recordWordUsage(word) {
      this.learnedModel.recordWordUsage(word);
    }
    /**
     * Retrieve statistics about learned habits
     */
    getLearnedStats() {
      return this.learnedModel.getStats();
    }
    /**
     * Clear learned habits
     */
    clearLearnedHabits() {
      this.learnedModel.clear();
    }
    /**
     * Seed sample collocations and user habits for demonstration
     */
    seedLearnedHabits() {
      return this.learnedModel.seedSampleHabits();
    }
    /**
     * Export learned habits to JSON
     */
    exportLearnedJSON() {
      return this.learnedModel.exportJSON();
    }
    /**
     * Export learned habits to CSV
     */
    exportLearnedCSV() {
      return this.learnedModel.exportCSV();
    }
    /**
     * Import learned habits from text
     */
    importLearnedData(rawText, merge = true) {
      return this.learnedModel.importData(rawText, merge);
    }
    /**
     * Predict Next Word(s) based on 2-word prior context (Trigram), 1-word prior context (Bigram),
     * exponential recency-frequency decay, and Vietnamese compound collocations (Gboard style).
     *
     * @param {string} previousWord The immediate word preceding the cursor (W_n-1)
     * @param {number} limit Maximum number of candidates to return (default: 5)
     * @param {string} priorWord Optional 2nd word preceding the cursor (W_n-2) for Trigram inference
     * @returns {Array<{ word: string, displayType: string, type: 'learned' | 'trigram' | 'bigram' | 'compound', count?: number, score?: number }>}
     */
    getNextWordSuggestions(previousWord, limit = 5, priorWord = "") {
      if (!this.enabled || !this.nextWordEnabled || !previousWord) return [];
      const raw = previousWord.trim();
      if (!raw) return [];
      const prevLower = raw.toLowerCase();
      const priorLower = (priorWord || "").trim().toLowerCase();
      const isFirstUpper = raw[0] === raw[0].toUpperCase() && raw[0] !== raw[0].toLowerCase();
      const isAllUpper = raw.length > 1 && raw === raw.toUpperCase();
      const candidates = [];
      const seen = /* @__PURE__ */ new Set();
      const now = Date.now();
      const isDevDomain = Boolean(DEVELOPER_WHITELIST_BIGRAMS[prevLower]);
      if (priorLower) {
        const trigramKey = `${priorLower} ${prevLower}`;
        const userTrigramFollowers = this.learnedModel.userTrigrams[trigramKey];
        if (userTrigramFollowers) {
          const sortedTrigrams = Object.entries(userTrigramFollowers).map(([w, entry]) => ({
            w,
            score: this.learnedModel.calculateRecencyFrequencyScore(entry, now, isDevDomain),
            rawCount: typeof entry === "number" ? entry : entry?.count || 1
          })).sort((a, b) => b.score - a.score);
          for (const { w, rawCount, score } of sortedTrigrams) {
            if (!seen.has(w)) {
              candidates.push({
                word: this.formatWordCase(w, isFirstUpper, isAllUpper),
                displayType: "Th\xF3i quen s\xE2u",
                type: "learned",
                count: rawCount,
                score
              });
              seen.add(w);
            }
            if (candidates.length >= limit) break;
          }
        }
        const baseTrigramFollowers = this.trigrams[trigramKey];
        if (baseTrigramFollowers && candidates.length < limit) {
          for (const w of baseTrigramFollowers) {
            const wLower = w.toLowerCase();
            if (!seen.has(wLower)) {
              candidates.push({
                word: this.formatWordCase(w, isFirstUpper, isAllUpper),
                displayType: "Ng\u1EEF c\u1EA3nh s\xE2u",
                type: "trigram"
              });
              seen.add(wLower);
            }
            if (candidates.length >= limit) break;
          }
        }
      }
      const userFollowers = this.learnedModel.userBigrams[prevLower];
      if (userFollowers && candidates.length < limit) {
        const sortedUserFollowers = Object.entries(userFollowers).map(([w, entry]) => ({
          w,
          score: this.learnedModel.calculateRecencyFrequencyScore(entry, now, isDevDomain),
          rawCount: typeof entry === "number" ? entry : entry?.count || 1
        })).sort((a, b) => b.score - a.score);
        for (const { w, rawCount, score } of sortedUserFollowers) {
          if (!seen.has(w)) {
            candidates.push({
              word: this.formatWordCase(w, isFirstUpper, isAllUpper),
              displayType: "Th\xF3i quen",
              type: "learned",
              count: rawCount,
              score
            });
            seen.add(w);
          }
          if (candidates.length >= limit) break;
        }
      }
      const baseFollowers = this.bigrams[prevLower];
      if (baseFollowers && candidates.length < limit) {
        for (const w of baseFollowers) {
          const wLower = w.toLowerCase();
          if (!seen.has(wLower)) {
            candidates.push({
              word: this.formatWordCase(w, isFirstUpper, isAllUpper),
              displayType: "G\u1EE3i \xFD chu\u1EA9n",
              type: "bigram"
            });
            seen.add(wLower);
          }
          if (candidates.length >= limit) break;
        }
      }
      if (candidates.length < limit) {
        for (const item of this.compoundIndex) {
          if (item.lower.startsWith(prevLower + " ")) {
            const remainder = item.word.slice(prevLower.length + 1).trim();
            const remainderLower = remainder.toLowerCase();
            if (remainder && !seen.has(remainderLower)) {
              candidates.push({
                word: this.formatWordCase(remainder, isFirstUpper, isAllUpper),
                displayType: "C\u1EE5m t\u1EEB",
                type: "compound"
              });
              seen.add(remainderLower);
            }
          }
          if (candidates.length >= limit) break;
        }
      }
      return candidates.slice(0, limit);
    }
    /**
     * Find suggestions matching the current query prefix
     * @param {string} rawPrefix The word or prefix currently typed by user
     * @param {number} limit Maximum number of suggestions to return (default: 7)
     * @returns {Array<{ word: string, displayType: string, type: string, matchScore: number }>}
     */
    getSuggestions(rawPrefix, limit = 7) {
      if (!this.enabled || !rawPrefix) return [];
      const prefix = rawPrefix.trim();
      if (prefix.length < 1) return [];
      if (prefix.startsWith(":")) {
        const emojiList = getEmojiSuggestions(prefix, limit);
        if (emojiList.length > 0) {
          return emojiList;
        }
      }
      const prefixLower = prefix.toLowerCase();
      const prefixStripped = stripVietnameseAccents(prefix);
      const isFirstUpper = prefix[0] === prefix[0].toUpperCase() && prefix[0] !== prefix[0].toLowerCase();
      const isAllUpper = prefix.length > 1 && prefix === prefix.toUpperCase();
      const results = [];
      const seenWords = /* @__PURE__ */ new Set();
      const userWords = userDictionary.getWords();
      const now = Date.now();
      for (const uWord of userWords) {
        const uLower = uWord.toLowerCase();
        const uStripped = stripVietnameseAccents(uWord);
        const learnedEntry = this.learnedModel.userUnigrams[uLower];
        const learnedScore = this.learnedModel.calculateRecencyFrequencyScore(learnedEntry, now);
        const learnedBoost = Math.min(learnedScore * 4, 30);
        if (uLower.startsWith(prefixLower)) {
          results.push({
            word: this.formatWordCase(uWord, isFirstUpper, isAllUpper),
            type: "user",
            displayType: "T\u1EEB ri\xEAng",
            matchScore: 100 - (uWord.length - prefix.length) + learnedBoost
          });
          seenWords.add(uLower);
        } else if (uStripped.startsWith(prefixStripped)) {
          results.push({
            word: this.formatWordCase(uWord, isFirstUpper, isAllUpper),
            type: "user",
            displayType: "T\u1EEB ri\xEAng",
            matchScore: 80 - (uWord.length - prefix.length) + learnedBoost
          });
          seenWords.add(uLower);
        }
        if (results.length >= limit * 2) break;
      }
      for (const item of this.compoundIndex) {
        if (seenWords.has(item.lower)) continue;
        const learnedEntry = this.learnedModel.userUnigrams[item.lower];
        const learnedScore = this.learnedModel.calculateRecencyFrequencyScore(learnedEntry, now);
        const learnedBoost = Math.min(learnedScore * 4, 30);
        if (item.lower.startsWith(prefixLower)) {
          results.push({
            word: this.formatWordCase(item.word, isFirstUpper, isAllUpper),
            type: item.type,
            displayType: item.displayType,
            matchScore: 90 - (item.word.length - prefix.length) * 0.5 + learnedBoost
          });
          seenWords.add(item.lower);
        } else if (item.stripped.startsWith(prefixStripped)) {
          results.push({
            word: this.formatWordCase(item.word, isFirstUpper, isAllUpper),
            type: item.type,
            displayType: item.displayType,
            matchScore: 70 - (item.word.length - prefix.length) * 0.5 + learnedBoost
          });
          seenWords.add(item.lower);
        }
        if (results.length >= limit * 3) break;
      }
      if (results.length < limit) {
        const vnSet = getVietnameseWordSet();
        for (const sWord of vnSet) {
          if (sWord.length <= prefix.length && sWord.toLowerCase() === prefixLower) continue;
          const sLower = sWord.toLowerCase();
          if (seenWords.has(sLower)) continue;
          const learnedEntry = this.learnedModel.userUnigrams[sLower];
          const learnedScore = this.learnedModel.calculateRecencyFrequencyScore(learnedEntry, now);
          const learnedBoost = Math.min(learnedScore * 4, 30);
          const sStripped = stripVietnameseAccents(sWord);
          if (sLower.startsWith(prefixLower)) {
            results.push({
              word: this.formatWordCase(sWord, isFirstUpper, isAllUpper),
              type: "syllable",
              displayType: "T\u1EEB \u0111\u01A1n",
              matchScore: 60 - (sWord.length - prefix.length) + learnedBoost
            });
            seenWords.add(sLower);
          } else if (sStripped.startsWith(prefixStripped)) {
            results.push({
              word: this.formatWordCase(sWord, isFirstUpper, isAllUpper),
              type: "syllable",
              displayType: "T\u1EEB \u0111\u01A1n",
              matchScore: 40 - (sWord.length - prefix.length) + learnedBoost
            });
            seenWords.add(sLower);
          }
          if (results.length >= limit * 2) break;
        }
      }
      if (results.length < limit && /^[a-zA-Z]+$/.test(prefix)) {
        for (const eWord of COMMON_ENGLISH_WORDS) {
          const eLower = eWord.toLowerCase();
          if (seenWords.has(eLower)) continue;
          const learnedEntry = this.learnedModel.userUnigrams[eLower];
          const learnedScore = this.learnedModel.calculateRecencyFrequencyScore(learnedEntry, now);
          const learnedBoost = Math.min(learnedScore * 4, 30);
          if (eLower.startsWith(prefixLower)) {
            results.push({
              word: this.formatWordCase(eWord, isFirstUpper, isAllUpper),
              type: "tech",
              displayType: "Ti\u1EBFng Anh",
              matchScore: 50 - (eWord.length - prefix.length) + learnedBoost
            });
            seenWords.add(eLower);
          }
          if (results.length >= limit * 2) break;
        }
      }
      results.sort((a, b) => {
        if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
        return a.word.length - b.word.length;
      });
      return results.slice(0, limit);
    }
    /**
     * Format suggestion capitalization to match user input case
     */
    formatWordCase(word, isFirstUpper, isAllUpper) {
      if (!word) return "";
      if (isAllUpper) {
        return word.toUpperCase();
      }
      if (isFirstUpper) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      return word;
    }
  };
  var autoCompleteEngine = new AutoCompleteEngine();

  // src/content/content.js
  var AvimContentScript = class {
    constructor() {
      this.domObserver = new DomObserver();
      this.textReplacer = new TextReplacer();
      this.settings = {
        method: IME_METHOD.AUTO,
        toneStyle: TONE_STYLE.CLASSIC,
        macroEnabled: true,
        spellCheck: true,
        autoUndo: true,
        ctrlToggleEnabled: true,
        quickConsonants: false,
        quickTelex: true,
        emojiShortcuts: true,
        autoCapitalize: true,
        perDomainMemory: true,
        domainMethods: {},
        autoRestoreEnglish: true,
        escRevert: true,
        phonologyRules: true,
        wordRescue: true,
        autoCompleteEnabled: true,
        nextWordEnabled: true,
        gboardLearningEnabled: true,
        debugTypingLog: false,
        macros: DEFAULT_MACROS,
        blacklistedDomains: []
      };
      this.lastCtrlTime = 0;
      this.previousMethod = IME_METHOD.AUTO;
      this.activeSuggestions = [];
      this.selectedSuggestionIndex = 0;
      this.activeSuggestionType = "autocomplete";
      this.activeWordPrefix = "";
      this.lastWordBeforeDelimiter = "";
      this.secondLastWordBeforeDelimiter = "";
      this.currentTarget = null;
      this.suggestionHost = null;
      this.suggestionShadow = null;
      this.suggestionBar = null;
      this.suggestionInactivityTimeout = null;
      this.suggestionInactivityMs = 2800;
      this.avimEngine = new AvimEngine({
        method: this.settings.method,
        toneStyle: this.settings.toneStyle,
        spellCheck: this.settings.spellCheck,
        quickConsonants: this.settings.quickConsonants,
        autoRestoreEnglish: this.settings.autoRestoreEnglish,
        escRevert: this.settings.escRevert,
        phonologyRules: this.settings.phonologyRules
      });
      this.macroEngine = new MacroEngine(this.settings.macros, {
        enabled: this.settings.macroEnabled,
        autoUndo: this.settings.autoUndo
      });
      this.init();
    }
    init() {
      this.bindEvents();
      this.listenMessages();
      this.loadSettings();
      if (typeof document !== "undefined") {
        if (document.readyState === "loading") {
          document.addEventListener("DOMContentLoaded", () => this.initSuggestionHost(), { once: true });
        } else {
          this.initSuggestionHost();
        }
      }
    }
    async loadSettings() {
      if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.sync) {
        try {
          const stored = await chrome.storage.sync.get(["avim_settings", "avim_macros", "avim_domain_methods"]);
          if (stored.avim_settings) {
            Object.assign(this.settings, stored.avim_settings);
          }
          if (stored.avim_domain_methods) {
            this.settings.domainMethods = stored.avim_domain_methods;
          }
          if (stored.avim_macros) {
            this.settings.macros = stored.avim_macros;
          }
        } catch {
        }
      }
      if (this.settings.perDomainMemory !== false && typeof window !== "undefined" && window.location) {
        const hostname = window.location.hostname.toLowerCase();
        if (this.settings.domainMethods && typeof this.settings.domainMethods[hostname] === "number") {
          this.settings.method = this.settings.domainMethods[hostname];
        }
      }
      try {
        await Promise.all([
          autoCompleteEngine.loadFromStorage(),
          userDictionary.loadFromStorage()
        ]);
      } catch {
      }
      this.applySettings();
    }
    applySettings() {
      this.avimEngine.setMethod(this.settings.method);
      this.avimEngine.setToneStyle(this.settings.toneStyle);
      this.avimEngine.setSpellCheck(this.settings.spellCheck);
      this.avimEngine.setQuickConsonants(this.settings.quickConsonants);
      this.avimEngine.setQuickTelex(this.settings.quickTelex !== false);
      this.avimEngine.setAutoRestoreEnglish(this.settings.autoRestoreEnglish !== false);
      this.avimEngine.setEscRevert(this.settings.escRevert !== false);
      this.avimEngine.setPhonologyRules(this.settings.phonologyRules !== false);
      this.macroEngine.enabled = this.settings.macroEnabled;
      this.macroEngine.autoUndo = this.settings.autoUndo;
      if (this.settings.macros) {
        this.macroEngine.loadMacros(this.settings.macros);
      }
      if (typeof autoCompleteEngine.setEnabled === "function") {
        autoCompleteEngine.setEnabled(this.settings.autoCompleteEnabled !== false);
      } else {
        autoCompleteEngine.enabled = this.settings.autoCompleteEnabled !== false;
      }
      if (typeof autoCompleteEngine.setNextWordEnabled === "function") {
        autoCompleteEngine.setNextWordEnabled(this.settings.nextWordEnabled !== false);
      } else {
        autoCompleteEngine.nextWordEnabled = this.settings.nextWordEnabled !== false;
      }
      if (typeof autoCompleteEngine.setLearningEnabled === "function") {
        autoCompleteEngine.setLearningEnabled(this.settings.gboardLearningEnabled !== false);
      } else if (autoCompleteEngine.learnedModel) {
        autoCompleteEngine.learnedModel.learningEnabled = this.settings.gboardLearningEnabled !== false;
      }
      this.domObserver.setBlacklistedDomains(this.settings.blacklistedDomains || []);
    }
    listenMessages() {
      const runtime = typeof browser !== "undefined" && browser.runtime ? browser.runtime : typeof chrome !== "undefined" && chrome.runtime ? chrome.runtime : null;
      if (runtime && runtime.onMessage) {
        runtime.onMessage.addListener((message, sender, sendResponse) => {
          if (message.type === "SETTINGS_UPDATED") {
            const oldMethod = this.settings.method;
            if (message.settings) Object.assign(this.settings, message.settings);
            if (message.macros) this.settings.macros = message.macros;
            if (message.userDictionary && Array.isArray(message.userDictionary)) {
              userDictionary.loadWords(message.userDictionary);
            }
            if (message.settings || message.macros || message.userDictionary) {
              this.applySettings();
            }
            if (oldMethod === IME_METHOD.OFF && this.settings.method !== IME_METHOD.OFF) {
              this.performOnActivationWordRescue();
            }
            sendResponse({ success: true });
          }
          if (message.type === "USER_DICT_UPDATED") {
            if (Array.isArray(message.words)) {
              userDictionary.loadWords(message.words);
            } else {
              userDictionary.loadFromStorage();
            }
            sendResponse({ success: true });
          }
          if (message.type === "GET_STATUS") {
            sendResponse({
              method: this.settings.method,
              macroEnabled: this.settings.macroEnabled
            });
          }
        });
      }
      const storageApi = typeof browser !== "undefined" && browser.storage ? browser.storage : typeof chrome !== "undefined" && chrome.storage ? chrome.storage : null;
      if (storageApi && storageApi.onChanged) {
        storageApi.onChanged.addListener((changes, areaName) => {
          if (changes.avim_user_dictionary) {
            const newWords = changes.avim_user_dictionary.newValue;
            if (Array.isArray(newWords)) {
              userDictionary.loadWords(newWords);
            }
          }
        });
      }
    }
    bindEvents() {
      document.addEventListener("keydown", this.handleKeyDown.bind(this), true);
      document.addEventListener("click", (e) => {
        if (this.suggestionHost && !this.suggestionHost.contains(e.target)) {
          this.hideSuggestions();
        }
      }, true);
      document.addEventListener("focusout", (e) => {
        const target = e.target;
        if (!target || !this.domObserver.isEligibleTarget(target)) return;
        const isNative = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;
        const wordInfo = isNative ? this.textReplacer.extractNativeWordBuffer(target) : this.textReplacer.extractContentEditableWordBuffer();
        if (wordInfo && wordInfo.word) {
          if (this.lastWordBeforeDelimiter && this.lastWordBeforeDelimiter !== wordInfo.word) {
            autoCompleteEngine.recordWordTransition(this.lastWordBeforeDelimiter, wordInfo.word);
          }
          autoCompleteEngine.recordWordUsage(wordInfo.word);
        }
      }, true);
      if (typeof window !== "undefined" && typeof window.addEventListener === "function") {
        window.addEventListener("blur", () => this.hideSuggestions());
      }
    }
    /* ========================================================================
     * Gboard Floating Suggestion Bar (Shadow DOM Encapsulated)
     * ======================================================================== */
    initSuggestionHost() {
      const mount = document.body || document.documentElement;
      if (this.suggestionHost) {
        if (!this.suggestionHost.isConnected && mount) {
          mount.appendChild(this.suggestionHost);
        }
        return;
      }
      if (!mount) {
        if (typeof document !== "undefined" && document.readyState === "loading") {
          document.addEventListener("DOMContentLoaded", () => this.initSuggestionHost(), { once: true });
        }
        return;
      }
      this.suggestionHost = document.createElement("div");
      this.suggestionHost.id = "__avim_gboard_host__";
      Object.assign(this.suggestionHost.style, {
        position: "absolute",
        top: "0",
        left: "0",
        width: "100%",
        height: "0",
        overflow: "visible",
        zIndex: "2147483647",
        pointerEvents: "none"
      });
      this.suggestionShadow = this.suggestionHost.attachShadow({ mode: "open" });
      const style = document.createElement("style");
      style.textContent = `
      .gboard-bar {
        position: absolute;
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 5px 8px;
        border-radius: 20px;
        background: rgba(15, 23, 42, 0.95);
        border: 1px solid rgba(56, 189, 248, 0.4);
        backdrop-filter: blur(10px);
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.08);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 12px;
        pointer-events: auto;
        user-select: none;
        transition: opacity 0.15s ease, transform 0.15s ease;
        max-width: 90vw;
        overflow-x: auto;
      }
      .gboard-bar.hidden {
        display: none;
      }
      .gboard-title {
        color: #94a3b8;
        font-size: 11px;
        display: flex;
        align-items: center;
        gap: 4px;
        padding-left: 4px;
        padding-right: 2px;
        font-weight: 500;
        white-space: nowrap;
      }
      .gboard-chip {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 10px;
        border-radius: 12px;
        background: rgba(30, 41, 59, 0.85);
        border: 1px solid rgba(71, 85, 105, 0.5);
        color: #f8fafc;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.12s ease;
        white-space: nowrap;
      }
      .gboard-chip:hover, .gboard-chip.selected {
        background: #0284c7;
        border-color: #38bdf8;
        color: #ffffff;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(2, 132, 199, 0.4);
      }
      .gboard-chip.is-learned {
        border-color: rgba(16, 185, 129, 0.5);
        background: rgba(6, 78, 59, 0.4);
        color: #6ee7b7;
      }
      .gboard-chip.is-learned:hover {
        background: #059669;
        border-color: #10b981;
        color: #ffffff;
      }
      .gboard-badge {
        font-size: 9px;
        padding: 1px 4px;
        border-radius: 4px;
        background: rgba(255, 255, 255, 0.12);
        color: #cbd5e1;
        font-weight: 600;
      }
      .gboard-hint {
        font-size: 9px;
        font-family: monospace;
        font-weight: bold;
        background: rgba(56, 189, 248, 0.2);
        color: #38bdf8;
        padding: 1px 4px;
        border-radius: 3px;
        border: 1px solid rgba(56, 189, 248, 0.35);
      }
      .gboard-chip:hover .gboard-hint {
        background: rgba(255, 255, 255, 0.3);
        color: #ffffff;
        border-color: #ffffff;
      }
    `;
      this.suggestionBar = document.createElement("div");
      this.suggestionBar.className = "gboard-bar hidden";
      this.suggestionBar.addEventListener("mouseenter", () => {
        if (this.suggestionInactivityTimeout) {
          clearTimeout(this.suggestionInactivityTimeout);
          this.suggestionInactivityTimeout = null;
        }
      });
      this.suggestionBar.addEventListener("mouseleave", () => {
        this.resetSuggestionInactivityTimer();
      });
      this.suggestionShadow.appendChild(style);
      this.suggestionShadow.appendChild(this.suggestionBar);
      mount.appendChild(this.suggestionHost);
    }
    resetSuggestionInactivityTimer() {
      if (this.suggestionInactivityTimeout) {
        clearTimeout(this.suggestionInactivityTimeout);
        this.suggestionInactivityTimeout = null;
      }
      if (this.isSuggestionsVisible()) {
        this.suggestionInactivityTimeout = setTimeout(() => {
          this.hideSuggestions();
        }, this.suggestionInactivityMs);
      }
    }
    showSuggestions(target, items, type, query = "") {
      if (!items || items.length === 0) {
        this.hideSuggestions();
        return;
      }
      const visibleItems = items.slice(0, 5);
      this.activeSuggestions = visibleItems;
      this.selectedSuggestionIndex = 0;
      this.activeSuggestionType = type;
      this.activeWordPrefix = query;
      this.currentTarget = target;
      if (!this.suggestionBar) this.initSuggestionHost();
      if (!this.suggestionBar) return;
      this.suggestionBar.textContent = "";
      const titleEl = document.createElement("div");
      titleEl.className = "gboard-title";
      const mainSpan = document.createElement("span");
      mainSpan.textContent = type === "nextword" ? "\u2728 K\u1EBF ti\u1EBFp:" : "\u2726 G\u1EE3i \xFD:";
      const hintSpan = document.createElement("span");
      hintSpan.className = "gboard-nav-hint";
      hintSpan.style.color = "#94a3b8";
      hintSpan.style.fontSize = "10px";
      hintSpan.style.fontWeight = "normal";
      hintSpan.style.marginLeft = "4px";
      hintSpan.textContent = " [Tab/Shift+Tab: duy\u1EC7t \u2022 Enter: ch\u1ECDn \u2022 Esc: \u1EA9n]";
      titleEl.appendChild(mainSpan);
      titleEl.appendChild(hintSpan);
      this.suggestionBar.appendChild(titleEl);
      visibleItems.forEach((item, idx) => {
        const chip = document.createElement("div");
        chip.className = `gboard-chip ${item.type === "learned" ? "is-learned" : ""} ${idx === this.selectedSuggestionIndex ? "selected" : ""}`;
        chip.setAttribute("role", "button");
        chip.setAttribute("aria-selected", idx === this.selectedSuggestionIndex ? "true" : "false");
        const text = document.createElement("span");
        text.textContent = item.word;
        chip.appendChild(text);
        if (item.displayType && item.displayType !== "T\u1EEB \u0111\u01A1n") {
          const badge = document.createElement("span");
          badge.className = "gboard-badge";
          badge.textContent = item.displayType;
          chip.appendChild(badge);
        }
        if (idx === this.selectedSuggestionIndex) {
          const hint = document.createElement("span");
          hint.className = "gboard-hint";
          hint.textContent = "Enter \u21B5";
          chip.appendChild(hint);
        }
        chip.addEventListener("mousedown", (e) => e.preventDefault());
        chip.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.applySuggestion(item.word);
        });
        this.suggestionBar.appendChild(chip);
      });
      try {
        const rect = target.getBoundingClientRect();
        const scrollX = window.scrollX || window.pageXOffset;
        const scrollY = window.scrollY || window.pageYOffset;
        const ribbonWidth = this.suggestionBar.offsetWidth || 340;
        const ribbonHeight = this.suggestionBar.offsetHeight || 38;
        let top = rect.bottom + scrollY + 4;
        let left = rect.left + scrollX;
        if (rect.bottom + ribbonHeight + 8 > window.innerHeight && rect.top > ribbonHeight + 8) {
          top = rect.top + scrollY - ribbonHeight - 4;
        }
        const maxLeft = (window.scrollX || 0) + window.innerWidth - ribbonWidth - 12;
        const minLeft = (window.scrollX || 0) + 12;
        left = Math.max(minLeft, Math.min(left, maxLeft));
        this.suggestionBar.style.top = `${top}px`;
        this.suggestionBar.style.left = `${left}px`;
        this.suggestionBar.classList.remove("hidden");
      } catch {
        this.suggestionBar.classList.remove("hidden");
      }
      this.resetSuggestionInactivityTimer();
    }
    updateSuggestionHighlight() {
      if (!this.suggestionBar) return;
      const chips = this.suggestionBar.querySelectorAll(".gboard-chip");
      chips.forEach((chip, idx) => {
        const isSelected = idx === this.selectedSuggestionIndex;
        if (isSelected) {
          chip.classList.add("selected");
          chip.setAttribute("aria-selected", "true");
          let hint = chip.querySelector(".gboard-hint");
          if (!hint) {
            hint = document.createElement("span");
            hint.className = "gboard-hint";
            chip.appendChild(hint);
          }
          hint.textContent = "Enter \u21B5";
        } else {
          chip.classList.remove("selected");
          chip.setAttribute("aria-selected", "false");
          const hint = chip.querySelector(".gboard-hint");
          if (hint) {
            hint.remove();
          }
        }
      });
      const selectedChip = chips[this.selectedSuggestionIndex];
      if (selectedChip && typeof selectedChip.scrollIntoView === "function") {
        selectedChip.scrollIntoView({ block: "nearest", inline: "nearest" });
      }
      this.resetSuggestionInactivityTimer();
    }
    hideSuggestions() {
      if (this.suggestionInactivityTimeout) {
        clearTimeout(this.suggestionInactivityTimeout);
        this.suggestionInactivityTimeout = null;
      }
      if (this.suggestionBar) {
        this.suggestionBar.classList.add("hidden");
      }
      this.activeSuggestions = [];
      this.selectedSuggestionIndex = 0;
    }
    isSuggestionsVisible() {
      return this.suggestionBar && !this.suggestionBar.classList.contains("hidden") && this.activeSuggestions.length > 0;
    }
    applySuggestion(chosenWord) {
      if (!this.currentTarget || !chosenWord) return;
      const target = this.currentTarget;
      const isNative = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;
      if (this.activeSuggestionType === "autocomplete") {
        const wordInfo = isNative ? this.textReplacer.extractNativeWordBuffer(target) : this.textReplacer.extractContentEditableWordBuffer();
        const textToInsert = chosenWord + " ";
        if (isNative && wordInfo) {
          this.textReplacer.replaceInNativeInput(
            target,
            wordInfo.startIndex,
            wordInfo.endIndex,
            textToInsert
          );
        } else if (wordInfo) {
          this.textReplacer.replaceInContentEditable(
            target,
            wordInfo.word,
            textToInsert
          );
        }
        autoCompleteEngine.recordWordUsage(chosenWord);
        this.secondLastWordBeforeDelimiter = this.lastWordBeforeDelimiter;
        this.lastWordBeforeDelimiter = chosenWord;
        if (this.settings.nextWordEnabled !== false) {
          const nextWords = autoCompleteEngine.getNextWordSuggestions(chosenWord, 4, this.secondLastWordBeforeDelimiter);
          if (nextWords.length > 0) {
            this.showSuggestions(target, nextWords, "nextword");
            return;
          }
        }
        this.hideSuggestions();
      } else {
        let needsLeadingSpace = false;
        if (isNative) {
          const pos = target.selectionStart ?? target.value.length;
          const before = target.value.slice(0, pos);
          needsLeadingSpace = before.length > 0 && !before.endsWith(" ") && !before.endsWith("\n");
        } else {
          const sel = window.getSelection();
          if (sel && sel.rangeCount) {
            const range = sel.getRangeAt(0);
            const node = range.startContainer;
            if (node.nodeType === Node.TEXT_NODE) {
              const before = (node.textContent || "").slice(0, range.startOffset);
              needsLeadingSpace = before.length > 0 && !before.endsWith(" ") && !before.endsWith("\n");
            }
          }
        }
        const textToInsert = (needsLeadingSpace ? " " : "") + chosenWord + " ";
        if (isNative) {
          const pos = target.selectionStart ?? target.value.length;
          this.textReplacer.replaceInNativeInput(target, pos, pos, textToInsert);
        } else {
          this.textReplacer.replaceInContentEditable(target, "", textToInsert);
        }
        if (this.lastWordBeforeDelimiter) {
          autoCompleteEngine.recordWordTransition(this.lastWordBeforeDelimiter, chosenWord, this.secondLastWordBeforeDelimiter);
        }
        autoCompleteEngine.recordWordUsage(chosenWord);
        this.secondLastWordBeforeDelimiter = this.lastWordBeforeDelimiter;
        this.lastWordBeforeDelimiter = chosenWord;
        if (this.settings.nextWordEnabled !== false) {
          const nextWords = autoCompleteEngine.getNextWordSuggestions(chosenWord, 4, this.secondLastWordBeforeDelimiter);
          if (nextWords.length > 0) {
            this.showSuggestions(target, nextWords, "nextword");
            return;
          }
        }
        this.hideSuggestions();
      }
    }
    /* ========================================================================
     * Key Event Dispatcher
     * ======================================================================== */
    handleKeyDown(event) {
      if (event.key === "Control") {
        if (event.repeat) return;
        if (this.settings.ctrlToggleEnabled !== false) {
          const now = Date.now();
          if (now - this.lastCtrlTime < 400) {
            this.toggleMethod();
            this.lastCtrlTime = 0;
          } else {
            this.lastCtrlTime = now;
          }
        }
        return;
      } else {
        this.lastCtrlTime = 0;
      }
      if (event.key === "Tab" && this.isSuggestionsVisible()) {
        event.preventDefault();
        event.stopPropagation();
        const count = this.activeSuggestions.length;
        if (count > 0) {
          if (event.shiftKey) {
            this.selectedSuggestionIndex = (this.selectedSuggestionIndex - 1 + count) % count;
          } else {
            this.selectedSuggestionIndex = (this.selectedSuggestionIndex + 1) % count;
          }
          this.updateSuggestionHighlight();
        }
        return;
      }
      if (event.key === "Enter" && !event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey && this.isSuggestionsVisible()) {
        if (this.activeSuggestionType === "nextword") {
          this.hideSuggestions();
          this.lastWordBeforeDelimiter = "";
          this.secondLastWordBeforeDelimiter = "";
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        const candidate = this.activeSuggestions[this.selectedSuggestionIndex]?.word;
        if (candidate) {
          this.applySuggestion(candidate);
        }
        return;
      }
      if (event.key === "Enter") {
        this.hideSuggestions();
        this.lastWordBeforeDelimiter = "";
        this.secondLastWordBeforeDelimiter = "";
        const activeTarget = this.domObserver.getActiveElement();
        if (this.domObserver.isEligibleTarget(activeTarget)) {
          const isNative = activeTarget instanceof HTMLInputElement || activeTarget instanceof HTMLTextAreaElement;
          const wordInfo = isNative ? this.textReplacer.extractNativeWordBuffer(activeTarget) : this.textReplacer.extractContentEditableWordBuffer();
          if (wordInfo && wordInfo.word) {
            const currentWord = wordInfo.word;
            autoCompleteEngine.recordWordUsage(currentWord);
          }
        }
      }
      if (event.key === "Escape" && this.isSuggestionsVisible()) {
        event.preventDefault();
        event.stopPropagation();
        this.hideSuggestions();
        return;
      }
      if (event.ctrlKey && event.key === "Backspace" && !event.shiftKey && !event.altKey && !event.metaKey) {
        const target2 = this.domObserver.getActiveElement();
        if (this.domObserver.isEligibleTarget(target2)) {
          if (this.handleWholeWordErase(target2, event)) {
            return;
          }
        }
      }
      if (this.settings.wordRescue !== false && (event.ctrlKey && event.shiftKey && (event.key === "r" || event.key === "R") || event.altKey && !event.ctrlKey && !event.metaKey && (event.key === "r" || event.key === "R"))) {
        const target2 = this.domObserver.getActiveElement();
        if (this.domObserver.isEligibleTarget(target2)) {
          if (this.handleInstantRetroRescue(target2, event)) {
            return;
          }
        }
      }
      if (event.ctrlKey || event.altKey || event.metaKey) {
        return;
      }
      const target = this.domObserver.getActiveElement();
      if (!this.domObserver.isEligibleTarget(target)) {
        return;
      }
      const key = event.key;
      if (key === "Escape") {
        if (this.handleEscapeRevert(target, event)) {
          return;
        }
      }
      if (this.settings.wordRescue !== false && this.settings.method !== IME_METHOD.OFF && key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey) {
        if (this.handleSelectionAccentRescue(target, key, event)) {
          return;
        }
      }
      if (key === "Backspace") {
        this.hideSuggestions();
        this._consecutiveBackspaces = (this._consecutiveBackspaces || 0) + 1;
        if (this.settings.debugTypingLog && this._consecutiveBackspaces >= 2) {
          if (this.avimEngine.lastTransformed && this.avimEngine.currentWordRaw) {
            this.recordTypingLog("backspace_delete", this.avimEngine.currentWordRaw, this.avimEngine.lastTransformed);
          }
        }
        if (this.handleBackspaceUndo(target, event)) {
          return;
        }
        if (this.avimEngine.currentWordRaw) {
          this.avimEngine.currentWordRaw = this.avimEngine.currentWordRaw.slice(0, -1);
        }
        this.adoptWordBeforeBackspace(target, event);
      }
      if (key.length === 1) {
        this._consecutiveBackspaces = 0;
        this.handleCharacterInput(target, key, event);
      }
    }
    handleWholeWordErase(target, event) {
      const isNative = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;
      if (isNative) {
        const pos = target.selectionStart ?? target.value.length;
        const textBefore = target.value.slice(0, pos);
        if (!textBefore) return false;
        const match = textBefore.match(/(\s*[\p{L}\p{N}_.:-]+|\s+|[^\s\p{L}\p{N}]+)$/u);
        if (match) {
          event.preventDefault();
          const deleteLen = match[0].length;
          const startReplace = pos - deleteLen;
          this.textReplacer.replaceInNativeInput(target, startReplace, pos, "");
          this.avimEngine.resetWordSession();
          this.lastWordBeforeDelimiter = "";
          this.secondLastWordBeforeDelimiter = "";
          this.hideSuggestions();
          return true;
        }
      } else if (target.isContentEditable) {
        const sel = window.getSelection();
        if (sel && sel.rangeCount) {
          const range = sel.getRangeAt(0);
          const node = range.startContainer;
          if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent || "";
            const pos = range.startOffset;
            const textBefore = text.slice(0, pos);
            const match = textBefore.match(/(\s*[\p{L}\p{N}_.:-]+|\s+|[^\s\p{L}\p{N}]+)$/u);
            if (match) {
              event.preventDefault();
              const deleteLen = match[0].length;
              const startReplace = pos - deleteLen;
              const newText = text.slice(0, startReplace) + text.slice(pos);
              node.textContent = newText;
              const newRange = document.createRange();
              newRange.setStart(node, startReplace);
              newRange.collapse(true);
              sel.removeAllRanges();
              sel.addRange(newRange);
              this.textReplacer.dispatchSyntheticInput(target, "");
              this.avimEngine.resetWordSession();
              this.lastWordBeforeDelimiter = "";
              this.secondLastWordBeforeDelimiter = "";
              this.hideSuggestions();
              return true;
            }
          }
        }
      }
      return false;
    }
    shouldAutoCapitalize(target) {
      const isNative = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;
      let textBefore = "";
      if (isNative) {
        const pos = target.selectionStart ?? 0;
        textBefore = target.value.slice(0, pos);
      } else if (target.isContentEditable) {
        const sel = window.getSelection();
        if (sel && sel.rangeCount) {
          const range = sel.getRangeAt(0);
          let node = range.startContainer;
          let offset = range.startOffset;
          if (node.nodeType === Node.TEXT_NODE) {
            textBefore = (node.textContent || "").slice(0, offset);
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            let text = "";
            for (let i = 0; i < offset && i < node.childNodes.length; i++) {
              text += node.childNodes[i].textContent || "";
            }
            textBefore = text;
          }
        }
      }
      if (/`/.test(textBefore)) {
        if (/`\s*$/.test(textBefore)) return false;
        const strippedClosed = textBefore.replace(/`[^`\n\r]*`/g, "");
        if (strippedClosed.includes("`")) return false;
        if (/`[^`\n\r]*`\s*$/.test(textBefore)) return false;
      }
      if (/([\/\\#@\$~]|\-\-)$/.test(textBefore)) {
        return false;
      }
      let context = textBefore;
      const quoteMatch = context.match(/([\x22\x27\u2018\u201C\u00AB\u2039\u201E\u201A]+)$/);
      if (quoteMatch) {
        context = context.slice(0, -quoteMatch[1].length);
        if (/:(\s*)$/.test(context)) return true;
      }
      if (!context || context.trim().length === 0) return true;
      if (/[\n\r]\s*$/.test(context)) return true;
      const match = context.match(/([.!?])(\s+)$/);
      if (match) {
        const trimmed = context.slice(0, -match[0].length).trim().toLowerCase();
        const lastWordMatch = trimmed.match(/([\p{L}\p{N}_.]+)$/iu);
        if (lastWordMatch) {
          const lastWord = lastWordMatch[1];
          const ABBRS = /* @__PURE__ */ new Set([
            "v.v",
            "tp",
            "ts",
            "ths",
            "gs",
            "mr",
            "mrs",
            "ms",
            "dr",
            "e.g",
            "i.e",
            "etc",
            "bs",
            "th",
            "vs",
            "co",
            "ltd",
            "inc",
            "corp",
            "no",
            "op",
            "cit"
          ]);
          if (ABBRS.has(lastWord)) return false;
        }
        return true;
      }
      return false;
    }
    handleEscapeRevert(target, event) {
      if (this._lastRescueState && this._lastRescueState.target === target) {
        const state = this._lastRescueState;
        this._lastRescueState = null;
        event.preventDefault();
        const isNative2 = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;
        if (isNative2) {
          this.textReplacer.replaceInNativeInput(target, state.start, state.end, state.rawText);
        } else if (target.isContentEditable) {
          this.textReplacer.replaceInContentEditable(target, state.rescuedText, state.rawText);
        }
        this.hideSuggestions();
        this.showHudToast(`Ho\xE0n t\xE1c: ${state.rawText}`, true);
        return true;
      }
      if (this.settings.escRevert === false) return false;
      const isNative = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;
      const wordInfo = isNative ? this.textReplacer.extractNativeWordBuffer(target) : this.textReplacer.extractContentEditableWordBuffer();
      if (wordInfo && wordInfo.word) {
        const revert = this.avimEngine.revertCurrentWord(wordInfo.word);
        if (revert.reverted) {
          event.preventDefault();
          if (isNative) {
            this.textReplacer.replaceInNativeInput(
              target,
              wordInfo.startIndex,
              wordInfo.endIndex,
              revert.result
            );
          } else {
            this.textReplacer.replaceInContentEditable(
              target,
              wordInfo.word,
              revert.result
            );
          }
          this.hideSuggestions();
          this.showHudToast(`Ho\xE0n t\xE1c: ${revert.result}`, true);
          if (this.settings.debugTypingLog) {
            this.recordTypingLog("escape_revert", this.avimEngine.currentWordRaw || wordInfo.word, wordInfo.word, revert.result);
          }
          return true;
        }
      }
      return false;
    }
    /**
     * Anonymous Debug Typing Log: records typing sessions where user Backspaced or Escaped
     * suspected diacritic mismatches to identify edge cases without intruding on privacy.
     */
    async recordTypingLog(action, raw, transformed, reverted = "") {
      if (!this.settings?.debugTypingLog) return;
      if (!raw && !transformed) return;
      try {
        const entry = {
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          action,
          raw: String(raw || ""),
          transformed: String(transformed || ""),
          reverted: String(reverted || ""),
          host: typeof window !== "undefined" ? window.location?.hostname || "unknown" : "unknown"
        };
        const storage = typeof chrome !== "undefined" && chrome.storage && chrome.storage.local ? chrome.storage.local : typeof browser !== "undefined" && browser.storage && browser.storage.local ? browser.storage.local : null;
        if (storage) {
          const data = await storage.get(["openviet_typing_logs"]);
          const logs = Array.isArray(data.openviet_typing_logs) ? data.openviet_typing_logs : [];
          logs.push(entry);
          if (logs.length > 100) {
            logs.splice(0, logs.length - 100);
          }
          await storage.set({ openviet_typing_logs: logs });
        }
      } catch {
      }
    }
    /**
     * Instant Retro-Rescue Hotkey Handler (Ctrl+Shift+R or Alt+R):
     * When user is typing and realizes they typed in raw Latin (or want to revert a word),
     * instantly converts the word immediately before the caret (or selected text) to accented Vietnamese,
     * or reverts an accented word back to raw keystrokes.
     */
    handleInstantRetroRescue(target, event) {
      event.preventDefault();
      event.stopPropagation();
      if (typeof event.stopImmediatePropagation === "function") {
        event.stopImmediatePropagation();
      }
      const isNative = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;
      let selectedText = "";
      let selStart = 0;
      let selEnd = 0;
      if (isNative) {
        selStart = target.selectionStart ?? 0;
        selEnd = target.selectionEnd ?? 0;
        if (selStart < selEnd) {
          selectedText = target.value.slice(selStart, selEnd);
        }
      } else if (target.isContentEditable) {
        const sel = window.getSelection();
        if (sel && sel.rangeCount && !sel.isCollapsed) {
          selectedText = sel.toString();
        }
      }
      if (selectedText && selectedText.trim().length > 0) {
        const trimmed = selectedText.trim();
        const hasVnDiacritics = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i.test(trimmed);
        let transformed = "";
        if (hasVnDiacritics) {
          const revert = this.avimEngine.revertCurrentWord(trimmed);
          transformed = revert.reverted ? revert.result : trimmed;
        } else {
          transformed = this.avimEngine.rescueWord(trimmed);
        }
        if (transformed && transformed !== trimmed) {
          const leadingSpace = selectedText.match(/^\s*/)[0];
          const trailingSpace = selectedText.match(/\s*$/)[0];
          const replacement = leadingSpace + transformed + trailingSpace;
          if (isNative) {
            this.textReplacer.replaceInNativeInput(target, selStart, selEnd, replacement);
            target.setSelectionRange(selStart + leadingSpace.length, selStart + leadingSpace.length + transformed.length);
          } else if (target.isContentEditable) {
            this.textReplacer.replaceInContentEditable(target, selectedText, replacement);
          }
          this.showHudToast(`C\u1EE9u ch\u1EEF: ${transformed}`, true);
          return true;
        }
        return false;
      }
      const wordInfo = isNative ? this.textReplacer.extractNativeWordBuffer(target) : this.textReplacer.extractContentEditableWordBuffer();
      if (wordInfo && wordInfo.word) {
        const currentWord = wordInfo.word;
        const hasVnDiacritics = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i.test(currentWord);
        let replacement = "";
        if (hasVnDiacritics) {
          const revert = this.avimEngine.revertCurrentWord(currentWord);
          replacement = revert.reverted ? revert.result : currentWord;
        } else {
          replacement = this.avimEngine.rescueWord(currentWord);
        }
        if (replacement && replacement !== currentWord) {
          if (isNative) {
            this.textReplacer.replaceInNativeInput(
              target,
              wordInfo.startIndex,
              wordInfo.endIndex,
              replacement
            );
          } else {
            this.textReplacer.replaceInContentEditable(
              target,
              currentWord,
              replacement
            );
          }
          this.hideSuggestions();
          this.showHudToast(`C\u1EE9u ch\u1EEF: ${replacement}`, true);
          return true;
        }
      }
      return false;
    }
    /**
     * Selection Accent Rescue (Ngó Sen / vnchKey innovation):
     * When user selects a word (e.g. 'nhanh', 'hoa', 'tieng') and presses a tone key
     * (e.g. 's', 'f', 'r', 'x', 'j', 'z' or '1'-'5', '0'), modifies the diacritic tone
     * directly on the selection instead of replacing it with raw letter.
     */
    handleSelectionAccentRescue(target, key, event) {
      const isNative = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;
      let selectedText = "";
      let start = 0;
      let end = 0;
      if (isNative) {
        start = target.selectionStart ?? 0;
        end = target.selectionEnd ?? 0;
        if (start < end) {
          selectedText = target.value.slice(start, end);
        }
      } else if (target.isContentEditable) {
        const sel = window.getSelection();
        if (sel && sel.rangeCount && !sel.isCollapsed) {
          selectedText = sel.toString();
        }
      }
      if (!selectedText || !/^[\p{L}\p{M}]+$/u.test(selectedText.trim())) {
        return false;
      }
      const trimmed = selectedText.trim();
      const rescued = this.avimEngine.applyAccentToSelection(trimmed, key);
      if (rescued && rescued !== trimmed) {
        event.preventDefault();
        event.stopPropagation();
        if (typeof event.stopImmediatePropagation === "function") {
          event.stopImmediatePropagation();
        }
        const leadingSpace = selectedText.match(/^\s*/)[0];
        const trailingSpace = selectedText.match(/\s*$/)[0];
        const replacement = leadingSpace + rescued + trailingSpace;
        if (isNative) {
          this.textReplacer.replaceInNativeInput(target, start, end, replacement);
          target.setSelectionRange(start + leadingSpace.length, start + leadingSpace.length + rescued.length);
        } else if (target.isContentEditable) {
          this.textReplacer.replaceInContentEditable(target, selectedText, replacement);
        }
        this.showHudToast(`C\u1EE9u d\u1EA5u: ${rescued}`, true);
        return true;
      }
      return false;
    }
    /**
     * On-Activation Retroactive Word Rescue (Ngó Sen / vnchKey innovation):
     * When IME is switched from OFF to an active Vietnamese mode (Auto/Telex/VNI),
     * reads the surrounding unaccented text typed immediately before the caret
     * (e.g. 'Chaof banj, tieengs vieetj nef'), converts into accented Vietnamese
     * ('Chào bạn, tiếng việt nè'), and saves undo state for instant ESC revert.
     */
    performOnActivationWordRescue() {
      if (this.settings.wordRescue === false || this.settings.method === IME_METHOD.OFF) {
        return;
      }
      const target = this.domObserver.getActiveElement();
      if (!target || !this.domObserver.isEligibleTarget(target)) {
        return;
      }
      const isNative = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;
      let textBeforeCaret = "";
      let startIdx = 0;
      let endIdx = 0;
      if (isNative) {
        endIdx = target.selectionStart ?? target.value.length;
        const val = target.value || "";
        textBeforeCaret = val.slice(0, endIdx);
        const match = textBeforeCaret.match(/([^\n\r]{1,150})$/);
        if (match) {
          textBeforeCaret = match[1];
          startIdx = endIdx - match[1].length;
        }
      } else if (target.isContentEditable) {
        const sel = window.getSelection();
        if (sel && sel.rangeCount) {
          const range = sel.getRangeAt(0);
          let node = range.startContainer;
          let offset = range.startOffset;
          if (node.nodeType === Node.TEXT_NODE) {
            const val = node.textContent || "";
            textBeforeCaret = val.slice(0, offset);
            const match = textBeforeCaret.match(/([^\n\r]{1,150})$/);
            if (match) {
              textBeforeCaret = match[1];
              startIdx = offset - match[1].length;
              endIdx = offset;
            }
          }
        }
      }
      if (!textBeforeCaret || !textBeforeCaret.trim()) {
        return;
      }
      const rescued = this.avimEngine.rescueText(textBeforeCaret);
      if (rescued && rescued !== textBeforeCaret) {
        if (isNative) {
          this.textReplacer.replaceInNativeInput(target, startIdx, endIdx, rescued);
        } else if (target.isContentEditable) {
          this.textReplacer.replaceInContentEditable(target, textBeforeCaret, rescued);
        }
        this._lastRescueState = {
          target,
          start: startIdx,
          end: startIdx + rescued.length,
          rawText: textBeforeCaret,
          rescuedText: rescued
        };
        this.showHudToast(`\u0110\xE3 c\u1EE9u ch\u1EEF: ${rescued}`, true);
      }
    }
    handleBackspaceUndo(target, event) {
      if (!this.macroEngine.enabled || !this.macroEngine.autoUndo) return false;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
        const pos = target.selectionStart ?? 0;
        const textBefore = target.value.slice(0, pos);
        const undoInfo = this.macroEngine.checkUndo(textBefore);
        if (undoInfo.undo) {
          event.preventDefault();
          const startReplace = pos - undoInfo.removeLength;
          const replacement = undoInfo.step === 1 ? "" : undoInfo.rawTrigger;
          this.textReplacer.replaceInNativeInput(target, startReplace, pos, replacement);
          return true;
        }
      } else if (target.isContentEditable) {
        const sel = window.getSelection();
        if (sel && sel.rangeCount) {
          const range = sel.getRangeAt(0);
          const node = range.startContainer;
          if (node.nodeType === Node.TEXT_NODE) {
            const textBefore = (node.textContent || "").slice(0, range.startOffset);
            const undoInfo = this.macroEngine.checkUndo(textBefore);
            if (undoInfo.undo) {
              event.preventDefault();
              const targetSlice = textBefore.slice(-undoInfo.removeLength);
              const replacement = undoInfo.step === 1 ? "" : undoInfo.rawTrigger;
              this.textReplacer.replaceInContentEditable(target, targetSlice, replacement);
              return true;
            }
          }
        }
      }
      return false;
    }
    /**
     * Adopt preceding word when Backspace erases a space delimiter.
     * e.g.: user types 'toan ' then hits Backspace -> caret is now right after 'toan'.
     * Re-adopting 'toan' allows the very next keystroke (like 's') to immediately modify
     * the word into 'toán' without needing to re-type the whole word.
     */
    adoptWordBeforeBackspace(target, event) {
      let textBefore = "";
      const isNative = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;
      if (isNative) {
        const pos = target.selectionStart ?? 0;
        textBefore = target.value.slice(0, pos);
      } else if (target.isContentEditable) {
        const sel = window.getSelection();
        if (sel && sel.rangeCount) {
          const range = sel.getRangeAt(0);
          const node = range.startContainer;
          if (node.nodeType === Node.TEXT_NODE) {
            textBefore = (node.textContent || "").slice(0, range.startOffset);
          }
        }
      }
      if (textBefore && textBefore.endsWith(" ")) {
        const trimmed = textBefore.slice(0, -1);
        const match = trimmed.match(/([\p{L}\p{M}]+)$/u);
        if (match) {
          const adopted = match[1];
          this.avimEngine.currentWordRaw = adopted;
          this.avimEngine.lastTransformed = adopted;
          this.lastWordBeforeDelimiter = "";
          this.secondLastWordBeforeDelimiter = "";
        }
      }
    }
    handleCharacterInput(target, key, event) {
      const isNative = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;
      let textBeforeCaret = "";
      if (isNative) {
        const pos = target.selectionStart ?? target.value.length;
        textBeforeCaret = target.value.slice(0, pos);
      } else if (target.isContentEditable) {
        const sel = window.getSelection();
        if (sel && sel.rangeCount) {
          const range = sel.getRangeAt(0);
          let node = range.startContainer;
          let offset = range.startOffset;
          if (node.nodeType === Node.TEXT_NODE) {
            textBeforeCaret = (node.textContent || "").slice(0, offset);
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            let text = "";
            for (let i = 0; i < offset && i < node.childNodes.length; i++) {
              text += node.childNodes[i].textContent || "";
            }
            textBeforeCaret = text;
          }
        }
      }
      const wordInfo = isNative ? this.textReplacer.extractNativeWordBuffer(target) : this.textReplacer.extractContentEditableWordBuffer();
      const currentWord = wordInfo?.word || "";
      if (isUrlOrEmailOrCode(textBeforeCaret, currentWord, key)) {
        this.hideSuggestions();
        this.avimEngine.resetWordSession();
        return;
      }
      if (this.macroEngine.enabled) {
        const snap = this.macroEngine.checkPunctuationSnap(key, textBeforeCaret);
        if (snap.snap) {
          event.preventDefault();
          if (isNative) {
            const pos = target.selectionStart ?? target.value.length;
            const startReplace = pos - snap.deleteLength;
            this.textReplacer.replaceInNativeInput(target, startReplace, pos, snap.snappedChar + " ");
          } else if (target.isContentEditable) {
            const sel = window.getSelection();
            if (sel && sel.rangeCount) {
              const range = sel.getRangeAt(0);
              const node = range.startContainer;
              if (node.nodeType === Node.TEXT_NODE) {
                this.textReplacer.replaceInContentEditable(target, " ", snap.snappedChar + " ");
              }
            }
          }
          this.avimEngine.resetWordSession();
          return;
        }
      }
      if (isDelimiter(key)) {
        if (wordInfo && wordInfo.word) {
          if (this.settings.emojiShortcuts !== false && currentWord.startsWith(":")) {
            const emoji = checkEmojiShortcut(currentWord);
            if (emoji) {
              event.preventDefault();
              const fullReplacement = emoji + (key === " " ? " " : key);
              if (isNative) {
                this.textReplacer.replaceInNativeInput(
                  target,
                  wordInfo.startIndex,
                  wordInfo.endIndex,
                  fullReplacement
                );
              } else {
                this.textReplacer.replaceInContentEditable(
                  target,
                  currentWord,
                  fullReplacement
                );
              }
              this.hideSuggestions();
              this.avimEngine.resetWordSession();
              return;
            }
          }
          if (this.lastWordBeforeDelimiter) {
            autoCompleteEngine.recordWordTransition(this.lastWordBeforeDelimiter, currentWord, this.secondLastWordBeforeDelimiter);
          }
          autoCompleteEngine.recordWordUsage(currentWord);
          this.secondLastWordBeforeDelimiter = this.lastWordBeforeDelimiter;
          this.lastWordBeforeDelimiter = currentWord;
          const isSentenceTerminator = [".", "?", "!", "\n", "\r"].includes(key);
          const isAfterSentenceEnd = isSentenceTerminator || textBeforeCaret && /[.!?]\s*$/.test(textBeforeCaret);
          if (isAfterSentenceEnd) {
            this.hideSuggestions();
            this.lastWordBeforeDelimiter = "";
            this.secondLastWordBeforeDelimiter = "";
          } else if (this.settings.nextWordEnabled !== false) {
            setTimeout(() => {
              const nextList = autoCompleteEngine.getNextWordSuggestions(currentWord, 4, this.secondLastWordBeforeDelimiter);
              if (nextList && nextList.length > 0) {
                this.showSuggestions(target, nextList, "nextword");
              } else {
                this.hideSuggestions();
              }
            }, 10);
          }
          if (this.settings.autoRestoreEnglish !== false) {
            const restore = this.avimEngine.checkAutoRestore(currentWord);
            if (restore.restore) {
              event.preventDefault();
              const fullReplacement = restore.result + key;
              if (isNative) {
                this.textReplacer.replaceInNativeInput(
                  target,
                  wordInfo.startIndex,
                  wordInfo.endIndex,
                  fullReplacement
                );
              } else {
                this.textReplacer.replaceInContentEditable(
                  target,
                  currentWord,
                  fullReplacement
                );
              }
              this.avimEngine.resetWordSession();
              return;
            }
          }
          if (this.macroEngine.enabled) {
            const expansion = this.macroEngine.checkExpansion(currentWord, key);
            if (expansion.match) {
              event.preventDefault();
              const fullReplacement = expansion.expandedText + key;
              if (isNative) {
                this.textReplacer.replaceInNativeInput(
                  target,
                  wordInfo.startIndex,
                  wordInfo.endIndex,
                  fullReplacement
                );
              } else {
                this.textReplacer.replaceInContentEditable(
                  target,
                  currentWord,
                  fullReplacement
                );
              }
              this.avimEngine.resetWordSession();
              return;
            } else if (expansion.suppressed) {
              this.avimEngine.resetWordSession();
              return;
            }
          }
        }
        this.macroEngine.clearUndo();
        this.avimEngine.resetWordSession();
        return;
      }
      if (this.settings.emojiShortcuts !== false && key === ":") {
        let textBefore = "";
        if (isNative) {
          const pos = target.selectionStart ?? target.value.length;
          textBefore = target.value.slice(0, pos);
        } else if (target.isContentEditable) {
          const sel = window.getSelection();
          if (sel && sel.rangeCount) {
            const range = sel.getRangeAt(0);
            const node = range.startContainer;
            if (node.nodeType === Node.TEXT_NODE) {
              textBefore = (node.textContent || "").slice(0, range.startOffset);
            }
          }
        }
        const match = textBefore.match(/(:[a-zA-Z0-9_+-]+)$/);
        if (match) {
          const queryWithColon = match[1] + ":";
          const emoji = checkEmojiShortcut(queryWithColon);
          if (emoji) {
            event.preventDefault();
            const matchStart = isNative ? (target.selectionStart ?? target.value.length) - match[1].length : 0;
            if (isNative) {
              this.textReplacer.replaceInNativeInput(
                target,
                matchStart,
                target.selectionStart ?? target.value.length,
                emoji + " "
              );
            } else {
              this.textReplacer.replaceInContentEditable(
                target,
                match[1],
                emoji + " "
              );
            }
            this.hideSuggestions();
            this.avimEngine.resetWordSession();
            return;
          }
        }
      }
      if (this.settings.autoCapitalize !== false && key.length === 1 && key >= "a" && key <= "z") {
        if (this.shouldAutoCapitalize(target)) {
          const upperChar = key.toUpperCase();
          event.preventDefault();
          if (isNative) {
            const pos = target.selectionStart ?? target.value.length;
            this.textReplacer.replaceInNativeInput(target, pos, pos, upperChar);
          } else {
            this.textReplacer.replaceInContentEditable(target, "", upperChar);
          }
          this.avimEngine.trackRawKey(upperChar);
          if (this.settings.autoCompleteEnabled !== false) {
            setTimeout(() => {
              const wInfo = isNative ? this.textReplacer.extractNativeWordBuffer(target) : this.textReplacer.extractContentEditableWordBuffer();
              if (wInfo && wInfo.word && wInfo.word.length >= 1) {
                const list = autoCompleteEngine.getSuggestions(wInfo.word, 4);
                if (list && list.length > 0) {
                  this.showSuggestions(target, list, "autocomplete", wInfo.word);
                } else {
                  this.hideSuggestions();
                }
              }
            }, 10);
          }
          return;
        }
      }
      if (this.settings.method !== IME_METHOD.OFF) {
        const wordInfo2 = isNative ? this.textReplacer.extractNativeWordBuffer(target) : this.textReplacer.extractContentEditableWordBuffer();
        if (wordInfo2) {
          const currentWord2 = wordInfo2.word || "";
          this.avimEngine.trackRawKey(key);
          const result = this.avimEngine.processKey(currentWord2, key);
          if (result.transformed) {
            event.preventDefault();
            event.stopPropagation();
            if (typeof event.stopImmediatePropagation === "function") {
              event.stopImmediatePropagation();
            }
            if (isNative) {
              this.textReplacer.replaceInNativeInput(
                target,
                wordInfo2.startIndex,
                wordInfo2.endIndex,
                result.result
              );
            } else {
              this.textReplacer.replaceInContentEditable(
                target,
                currentWord2,
                result.result
              );
            }
          }
        }
      }
      if (this.settings.autoCompleteEnabled !== false) {
        setTimeout(() => {
          const wInfo = isNative ? this.textReplacer.extractNativeWordBuffer(target) : this.textReplacer.extractContentEditableWordBuffer();
          if (wInfo && wInfo.word && wInfo.word.length >= 1) {
            const list = autoCompleteEngine.getSuggestions(wInfo.word, 4);
            if (list && list.length > 0) {
              this.showSuggestions(target, list, "autocomplete", wInfo.word);
            } else {
              this.hideSuggestions();
            }
          } else {
            this.hideSuggestions();
          }
        }, 10);
      }
    }
    toggleMethod() {
      const isCurrentlyOff = this.settings.method === IME_METHOD.OFF;
      if (isCurrentlyOff) {
        this.settings.method = this.previousMethod || IME_METHOD.AUTO;
      } else {
        this.previousMethod = this.settings.method;
        this.settings.method = IME_METHOD.OFF;
      }
      if (this.settings.perDomainMemory !== false && typeof window !== "undefined" && window.location) {
        const hostname = window.location.hostname.toLowerCase();
        if (hostname) {
          if (!this.settings.domainMethods) {
            this.settings.domainMethods = {};
          }
          this.settings.domainMethods[hostname] = this.settings.method;
          if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.sync) {
            chrome.storage.sync.set({ avim_domain_methods: this.settings.domainMethods }).catch(() => {
            });
          }
        }
      }
      this.applySettings();
      if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.sync) {
        chrome.storage.sync.set({ avim_settings: this.settings }).catch(() => {
        });
      }
      const methodName = this.settings.method === IME_METHOD.VNI ? "VNI" : this.settings.method === IME_METHOD.TELEX ? "Telex" : this.settings.method === IME_METHOD.AUTO ? "T\u1EF1 \u0111\u1ED9ng" : "T\u1EAET";
      const text = this.settings.method !== IME_METHOD.OFF ? `AVIM: B\u1EACT (${methodName})` : "AVIM: T\u1EAET (Ti\u1EBFng Anh)";
      this.showHudToast(text, this.settings.method !== IME_METHOD.OFF);
      if (isCurrentlyOff && this.settings.method !== IME_METHOD.OFF) {
        this.performOnActivationWordRescue();
      }
    }
    showHudToast(text, isOn) {
      let toast = document.getElementById("__avim_hud_toast__");
      if (!toast) {
        toast = document.createElement("div");
        toast.id = "__avim_hud_toast__";
        Object.assign(toast.style, {
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: "2147483647",
          padding: "8px 14px",
          borderRadius: "8px",
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontSize: "13px",
          fontWeight: "600",
          lineHeight: "1.4",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)",
          transition: "opacity 0.2s ease, transform 0.2s ease",
          pointerEvents: "none",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          color: "#ffffff"
        });
        document.documentElement.appendChild(toast);
      }
      if (isOn) {
        toast.style.backgroundColor = "#047857";
        toast.style.border = "1px solid #10b981";
      } else {
        toast.style.backgroundColor = "#1e293b";
        toast.style.border = "1px solid #475569";
      }
      toast.textContent = "";
      const dot = document.createElement("span");
      Object.assign(dot.style, {
        display: "inline-block",
        width: "8px",
        height: "8px",
        borderRadius: "50%",
        backgroundColor: isOn ? "#34d399" : "#94a3b8",
        boxShadow: isOn ? "0 0 6px #34d399" : "none"
      });
      const label = document.createElement("span");
      label.textContent = text;
      toast.appendChild(dot);
      toast.appendChild(label);
      toast.style.opacity = "1";
      toast.style.transform = "translateY(0)";
      clearTimeout(this._hudTimeout);
      this._hudTimeout = setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(6px)";
      }, 1500);
    }
  };
  if (typeof window !== "undefined") {
    window.__AVIM_XKEY__ = new AvimContentScript();
  }
})();
/**
 * Vietnamese Syllable Parser & Phonological Reconstructor
 * Ported and adapted from the Bamboo / vnchKey 5-component linguistic model:
 * Syllable = Onset + Glide + Nucleus + Coda + Tone
 *
 * @license Apache-2.0
 */
/**
 * Vietnamese Dictionary & User Custom Dictionary Manager
 * Integrated from Hunspell Vietnamese (OpenOffice / Hồ Ngọc Đức / xKey)
 * Supports ~6,700 standard Vietnamese syllables, personal user dictionary,
 * English onset detection, and spell checking auto-restore.
 *
 * @license GPL / MIT
 */
/**
 * AVIM Engine Modernized (AVIM xKey Core)
 * Pure, zero-dependency Vietnamese diacritic state machine & vowel transformation.
 * Adapted from chung1905/avim-firefox and modernized for MV3 & WebExtensions.
 *
 * @license LGPL / Apache-2.0
 */
/**
 * Macro / Text Expansion Engine (Inspired by xmannv/xkey)
 * Handles macro lookup, casing preservation, word-boundary triggers, and Backspace undo.
 *
 * @license Apache-2.0
 */
/**
 * DOM Observer and Input Target Validator
 * Tracks focused elements, traverses open Shadow DOM roots, and filters out excluded inputs.
 *
 * @license Apache-2.0
 */
/**
 * Text Replacer and Caret / Selection Manager
 * Intercepts and replaces text in native inputs and contenteditable editors with synthetic InputEvents.
 *
 * @license Apache-2.0
 */
/**
 * Smart Emoji Shorthand Engine
 * Supports Vietnamese and English slack-style emoji triggers (:tim: -> ❤️, :cuoi: -> 😄)
 *
 * @license Apache-2.0
 */
/**
 * Vietnamese Auto-Complete, Next-Word Prediction & Gboard-Style Habit Learning Engine
 * Provides intelligent word auto-completion, next-word suggestions (bigram language model),
 * and personalized on-device habit learning similar to Google Gboard.
 *
 * @license Apache-2.0
 */
/**
 * AVIM xKey Content Script Entry Point
 * Listens for key events, coordinates IME diacritic transformation, macro expansion,
 * and on-page floating Gboard-style Next-Word Prediction & Auto-Complete suggestions.
 *
 * @license Apache-2.0
 */
