import { element, hasClass, visitElements } from './hast.mjs';

// Wide tables scroll inside a focusable region instead of widening the page.
export default function rehypeTables() {
  return function transform(tree) {
    visitElements(tree, (node, index, parent) => {
      if (node.tagName !== 'table' || hasClass(parent, 'table-scroll')) return;
      parent.children[index] = element('div', {
        className: ['table-scroll'],
        role: 'region',
        ariaLabel: 'Table',
        tabIndex: 0,
      }, [node]);
    });
  };
}
