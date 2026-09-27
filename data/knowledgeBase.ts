import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

export type RetrievedArticle = {
  title: string;
  fileName: string;
  content: string;
  sourceUrl?: string;
};

export type KnowledgeRetrieval = {
  articles: RetrievedArticle[];
  guidance: string;
};

const ignoredWords = new Set([
  "about", "after", "also", "and", "are", "can", "does", "explain", "from", "have", "help", "how",
  "into", "is", "its", "know", "more", "please", "should", "tell", "that", "the", "their", "them",
  "there", "these", "this", "those", "what", "when", "where", "which", "who", "why", "with", "would",
]);

function words(value: string) {
  return (value.toLowerCase().match(/[a-z0-9]+/g) ?? [])
    .filter((word) => word.length > 2 && !ignoredWords.has(word));
}

function titleFromMarkdown(markdown: string, fallback: string) {
  return markdown.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? fallback;
}

function sourceUrlFromMarkdown(markdown: string) {
  return markdown.match(/https?:\/\/[^\s)]+/)?.[0]?.replace(/[.,;]+$/, "");
}

export async function retrieveKnowledge(question: string): Promise<KnowledgeRetrieval> {
  const directory = path.join(process.cwd(), "knowledge");
  let names: string[];
  try {
    names = (await readdir(directory)).filter((name) => name.toLowerCase().endsWith(".md")).sort();
  } catch {
    return { articles: [], guidance: "" };
  }

  const loaded = await Promise.all(names.map(async (fileName) => {
    const markdown = await readFile(path.join(directory, fileName), "utf8");
    return {
      fileName,
      markdown,
      title: titleFromMarkdown(markdown, fileName.replace(/\.md$/i, "").replace(/[_-]+/g, " ")),
      sourceUrl: sourceUrlFromMarkdown(markdown),
    };
  }));

  const ruleDoc = loaded.find(({ fileName }) => fileName === "12_exoscope_ai_rules.md");
  const guidance = ruleDoc?.markdown
    .replace(/^#.*(?:\r?\n|$)/, "")
    .replace(/^## Primary sources[\s\S]*$/m, "")
    .trim() ?? "";

  const queryTerms = new Set(words(question));
  const ranked = loaded
    .filter(({ fileName }) => fileName !== "12_exoscope_ai_rules.md")
    .map((article) => {
      const articleTerms = new Set(words(`${article.title} ${article.fileName} ${article.markdown}`));
      const score = Array.from(queryTerms).reduce((sum, term) => {
        if (articleTerms.has(term)) return sum + 1;
        if (term.endsWith("s") && articleTerms.has(term.slice(0, -1))) return sum + 0.8;
        if (articleTerms.has(`${term}s`)) return sum + 0.7;
        return sum;
      }, 0);
      return { ...article, score };
    })
    .filter((article) => article.score > 0)
    .sort((a, b) => b.score - a.score || a.fileName.localeCompare(b.fileName))
    .slice(0, 4)
    .map(({ fileName, title, markdown, sourceUrl }) => ({
      fileName,
      title,
      sourceUrl,
      content: markdown.replace(/^#.*(?:\r?\n|$)/, "").trim(),
    }));

  return { articles: ranked, guidance };
}
