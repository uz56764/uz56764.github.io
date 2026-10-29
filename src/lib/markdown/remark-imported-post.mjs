// Imported posts (those with `importedFrom`) were written as standalone pages:
// they use `#` for chapters, underline each chapter with `---`, and often open
// with a hand-written contents list. Here the page already renders the title
// and a generated table of contents, so demote headings by one level and drop
// the duplicated pieces. The Markdown source stays untouched.

const contentsLine = /^\s*\d+(?:-\d+)*\.\s+\S/;

/** True for a code listing made only of numbered section titles. */
export function isContentsList(code) {
  const lines = code.split('\n').filter(line => line.trim());
  return lines.length >= 3 && lines.every(line => contentsLine.test(line));
}

const isContentsBlock = node =>
  node?.type === 'code' && (!node.lang || node.lang === 'text') && isContentsList(node.value);

function demoteHeadings(node) {
  if (node.type === 'heading') node.depth = Math.min(6, node.depth + 1);
  node.children?.forEach(demoteHeadings);
}

export default function remarkImportedPost() {
  return function transform(tree, file) {
    if (!file.data.astro?.frontmatter?.importedFrom) return;
    if (isContentsBlock(tree.children[0])) tree.children.shift();
    tree.children = tree.children.filter(
      (node, i, nodes) => !(node.type === 'thematicBreak' && nodes[i - 1]?.type === 'heading'),
    );
    demoteHeadings(tree);
  };
}
