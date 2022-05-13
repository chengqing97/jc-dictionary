import { LookupResult, Suggestion } from "./types";

export function grabResult(toSearch: string, response: string): LookupResult {
  const isTranslate = response.includes(`<div id="fanyiToggle">`);

  if (isTranslate) {
    return { keyword: toSearch, definition: grabTranslation(response) };
  }

  const isChinese = response.includes("英语怎么说");

  if (isChinese) {
    return { keyword: toSearch, definition: grabEnglishWords(response) };
  }

  const hasResult = response.includes('<h2 class="wordbook-js">');
  const hasSuggestion = response.includes("您要找的是不是");

  if (hasResult || hasSuggestion) {
    return {
      keyword: toSearch,
      ukPhonetic: grabUkPhonetic(response),
      usPhonetic: grabUsPhonetic(response),
      definition: hasResult ? grabFormalDefinition(response) : undefined,
      suggestions: hasSuggestion ? grabSuggestion(response) : undefined,
    };
  }

  return { keyword: toSearch };
}

function grabTranslation(response: string): string | undefined {
  const definitionPart = response.match(/(<div class="trans-container">)[\s\S]*?(<\/div>)/);

  if (!definitionPart) return undefined;

  const definition = definitionPart[0]
    .match(/<p>[\s\S]*?<\/p>/g)?.[1]
    .replace("<p>", "")
    .replace("</p>", "");

  return definition;
}

function grabEnglishWords(response: string): string | undefined {
  const definitionPart = response.match(/(<div class="trans-container">)[\s\S]*?(<\/div>)/)?.[0];
  const definitionsRaw = definitionPart
    ?.match(/(<p class="wordGroup">)[\s\S]*?(<\/p>)/g)
    ?.map((item) => item.replace(`<p class="wordGroup">`, "").replace("</p>", ""));

  if (!definitionsRaw) return;

  let definitionLines: string[] = [];
  for (let item of definitionsRaw) {
    const wordType = item
      .match(/(;">)[\s\S]*?(<\/span>)/)?.[0]
      .replace(`;">`, "")
      .replace("</span>", "");

    const def = item
      .match(/(E2Ctranslation">)[\s\S]*?(<\/a>)/)?.[0]
      .replace(`E2Ctranslation">`, "")
      .replace("</a>", "");

    let definitionLine = "";
    if (wordType && !wordType.includes(";")) {
      definitionLine += `${wordType} `;
    }
    definitionLine += def;
    definitionLines.push(definitionLine);
  }

  if (definitionLines.length === 0) return undefined;
  let definition = definitionLines.join("\n");
  return definition;
}

function grabFormalDefinition(response: string): string | undefined {
  const definitionPart = response.match(/(<div class="trans-container">\s*<ul>)[\s\S]*?(<\/ul>)/)?.[0];
  const definitionsRaw = definitionPart?.match(/(<li>)[\s\S]*?(<\/li>)/g);
  if (!definitionsRaw) return undefined;
  const definition = definitionsRaw.map((item) => item.replace("<li>", "").replace("</li>", "")).join("\n");
  return definition;
}

function grabUkPhonetic(response: string): string | undefined {
  const ukPhonetic = response.match(/(<span class="pronounce">英[\s\S]*<span class="phonetic">)[\s\S]*?(<\/span>)/);
  return ukPhonetic?.[0].replaceAll(/<span class="pronounce">英[\s\S]*<span class="phonetic">|<\/span>/g, "");
}

function grabUsPhonetic(response: string): string | undefined {
  const usPhonetic = response.match(/(<span class="pronounce">美[\s\S]*<span class="phonetic">)[\s\S]*?(<\/span>)/);
  return usPhonetic?.[0].replaceAll(/<span class="pronounce">美[\s\S]*<span class="phonetic">|<\/span>/g, "");
}

function grabSuggestion(response: string): Suggestion[] | undefined {
  const suggestionsRaw = response
    .match(/(<p class="typo-rel">)[\s\S]*?(<\/p>)/g)
    ?.map((item) => item.replace(`<p class="typo-rel">`, "").replace("</p>", ""));
  if (!suggestionsRaw) return undefined;
  let suggestions: Suggestion[] = [];

  for (let item of suggestionsRaw) {
    const word = item
      .match(/(class="search-js">)[\s\S]*?(<\/a><\/span>)/)?.[0]
      .replace(`class="search-js">`, "")
      .replace("</a></span>", "");

    const def = item
      .match(/(<\/span>)[\s\S]*/)?.[0]
      .replace(`</span>`, "")
      .trim();

    if (word != null) suggestions.push({ word, def });
  }
  if (suggestions.length === 0) return undefined;
  return suggestions;
}
