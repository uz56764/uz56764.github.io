// Patches are often fenced as the language they modify (```c), which loses
// the added/removed signal. When a block contains a unified diff, tag its
// `+`/`-` lines so CSS can tint them, whatever the declared language.

const isUnifiedDiff = source => /^@@ [^\n]* @@/m.test(source) && /^(?:---|\+\+\+) \S/m.test(source);

export function transformerDiffLines() {
  return {
    name: 'diff-lines',
    pre(node) {
      if (isUnifiedDiff(this.source)) node.properties.dataDiff = '';
    },
    code(node) {
      if (!isUnifiedDiff(this.source)) return;
      const lines = node.children.filter(child => child.type === 'element');
      this.source.split('\n').forEach((value, i) => {
        if (!lines[i]) return;
        if (/^\+(?!\+\+)/.test(value)) this.addClassToHast(lines[i], 'diff-add');
        else if (/^-(?!--)/.test(value)) this.addClassToHast(lines[i], 'diff-remove');
      });
    },
  };
}
