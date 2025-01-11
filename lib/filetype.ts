export function getLanguageFromFilename(filename: string) {
  const split = filename.split(".");
  const filetype = split.length > 1 && split.pop();
  return (
    Object.entries(filetypes).find(
      ([language, fFiletype]) => filetype === fFiletype,
    )?.[1] ||
    filetype ||
    "plaintext"
  );
}

export function getFiletypeFromLanguage(language: string) {
  return filetypes[language] || language;
}

export const filetypes = {
  typescript: "ts",
  javascript: "ts",
  csharp: "cs",
  plaintext: "txt",
};
