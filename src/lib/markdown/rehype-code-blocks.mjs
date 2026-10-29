import { element, hasClass, raw, text, visitElements } from './hast.mjs';

// Frame each highlighted block with a header (language, copy button) and, for
// long listings, an expand control. Rendering this at build time keeps the
// layout stable; src/scripts/article.ts only wires up the buttons.

const COLLAPSE_AFTER_LINES = 40;

// Plain-text blocks (terminal output, dumps) get no label: "Text" says nothing.
const languageLabels = {
  plaintext: '',
  text: '',
  txt: '',
  c: 'C',
  cpp: 'C++',
  py: 'Python',
  python: 'Python',
  js: 'JavaScript',
  ts: 'TypeScript',
  sh: 'Shell',
  bash: 'Shell',
  diff: 'Diff',
  asm: 'Assembly',
};

const icon = paths => raw(
  `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="square" aria-hidden="true">${paths.map(d => `<path d="${d}"/>`).join('')}</svg>`,
);

function lineCount(pre) {
  const code = pre.children.find(child => child.tagName === 'code');
  return code?.children.filter(child => child.type === 'element' && hasClass(child, 'line')).length ?? 0;
}

export default function rehypeCodeBlocks() {
  return function transform(tree) {
    visitElements(tree, (node, index, parent) => {
      if (node.tagName !== 'pre' || !hasClass(node, 'astro-code')) return;

      const language = String(node.properties.dataLanguage ?? 'plaintext');
      const label = 'dataDiff' in node.properties ? 'Patch' : languageLabels[language] ?? language;
      const lines = lineCount(node);
      const collapsible = lines > COLLAPSE_AFTER_LINES;

      node.properties.tabIndex = 0;
      node.properties.ariaLabel = `${label || 'Plain text'} code, ${lines} ${lines === 1 ? 'line' : 'lines'}`;

      const header = element('div', { className: ['code-block-header'] }, [
        ...(label ? [element('span', { className: ['code-block-language'] }, [text(label)])] : []),
        element('button', { type: 'button', className: ['code-copy'], dataCopyCode: '' }, [
          icon(['M9 9h11v11H9z', 'M15 9V4H4v11h5']),
          icon(['m5 12.5 4.5 4.5L19 7']),
          element('span', { dataLabel: '' }, [text('Copy')]),
        ]),
      ]);

      const footer = collapsible
        ? [element('button', { type: 'button', className: ['code-expand'], ariaExpanded: 'false', dataExpandCode: '' }, [
            element('span', { dataLabel: '' }, [text(`Show all ${lines} lines`)]),
            icon(['m6 9 6 6 6-6']),
          ])]
        : [];

      parent.children[index] = element('div', {
        className: ['code-block'],
        dataCollapsible: collapsible ? '' : undefined,
      }, [header, node, ...footer]);
    });
  };
}
