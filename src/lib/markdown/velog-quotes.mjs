// Velog accepts a quoted fence whose following lines omit `>`. CommonMark
// treats its unquoted closing fence as a new block, swallowing later prose.
// Normalize only those quote markers at render time; keep the source intact.
export function normalizeVelogQuotes(markdown) {
  return markdown.replace(
    /^>\s*(`{3,})([^\n]*)\n([\s\S]*?)^\1[ \t]*(?=\n|$)/gm,
    (_match, fence, language, code) => {
      const quoted = code
        .split('\n')
        .map((line, i, lines) => (i === lines.length - 1 && !line ? '' : `> ${line}`))
        .join('\n');
      return `> ${fence}${language}\n${quoted}> ${fence}`;
    },
  );
}

const isVelogImport = frontmatter => frontmatter?.importedFrom === 'velog';

export function withVelogQuotes(processor) {
  const createRenderer = processor.createRenderer.bind(processor);
  return {
    ...processor,
    async createRenderer(shared) {
      const renderer = await createRenderer(shared);
      return {
        render(content, settings) {
          const source = isVelogImport(settings?.frontmatter) ? normalizeVelogQuotes(content) : content;
          return renderer.render(source, settings);
        },
      };
    },
  };
}
