export const categories = {
  'Research report': { slug: 'research', label: 'Research' },
  'Write-up': { slug: 'write-ups', label: 'Write-ups' },
} as const;

export type Category = keyof typeof categories;

export const categoryNames = Object.keys(categories) as [Category, ...Category[]];
