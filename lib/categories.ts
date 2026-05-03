export const CATEGORIES = [
  { id: 'health', label: 'Saúde', emoji: '💪', color: '#5BE584' },
  { id: 'mind', label: 'Mente', emoji: '🧠', color: '#9B7BFF' },
  { id: 'work', label: 'Trabalho', emoji: '⚡', color: '#FFB347' },
  { id: 'money', label: 'Dinheiro', emoji: '💸', color: '#FFD75A' },
  { id: 'social', label: 'Pessoas', emoji: '🫂', color: '#FF6B9D' },
  { id: 'home', label: 'Casa', emoji: '🏠', color: '#7AE1BF' },
  { id: 'other', label: 'Outro', emoji: '✨', color: '#8A93A0' },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]['id'];

export function categoryById(id: string | null | undefined) {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1];
}

export const COLORS = [
  '#FFB347', '#5BE584', '#9B7BFF', '#FFD75A', '#FF6B9D',
  '#7AE1BF', '#6FA8FF', '#FF6B6B', '#FFC857',
];
