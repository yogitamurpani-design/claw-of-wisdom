export type Category = "motivation" | "life" | "funny";

export const CATEGORIES: { id: Category; label: string; emoji: string; color: string; bg: string }[] = [
  { id: "motivation", label: "Motivation", emoji: "🚀", color: "#bde0c6", bg: "bg-mint" },
  { id: "life", label: "Life", emoji: "🌱", color: "#d6c8f0", bg: "bg-lilac" },
  { id: "funny", label: "Funny", emoji: "😂", color: "#ffd3b4", bg: "bg-peach" },
];

export const QUOTES: Record<Category, string[]> = {
  motivation: [
    "Small steps still move you forward. Keep stepping.",
    "You don't need to see the whole staircase. Just the next stair.",
    "Done is a superpower. Perfect is a hobby.",
    "The best time to start was yesterday. The second best is right after this snack.",
    "Progress loves company. Show up today, even if it's quietly.",
    "Your future self is cheering. Give them something to cheer about.",
    "Discipline is choosing what you want most over what you want now.",
    "Doubt kills more dreams than failure ever will.",
    "Make it exist first. Make it good later.",
    "Every expert was once a beginner who refused to quit.",
    "You've survived 100% of your hardest days so far.",
    "Bet on yourself. The odds are better than you think.",
  ],
  life: [
    "Slow down. The good parts don't rush.",
    "Collect moments, not things. Moments don't need dusting.",
    "Be the reason someone smiles at their phone today.",
    "Rest is not quitting. It's refuelling.",
    "Some chapters end so better ones can begin.",
    "You are allowed to outgrow people, places and plans.",
    "Happiness is often hiding in the most ordinary Tuesday.",
    "Water your own garden before checking the neighbour's grass.",
    "The people who make you laugh till you snort are treasure.",
    "Not everything needs an answer today.",
    "Kindness is free. Sprinkle it everywhere.",
    "Home is wherever your favourite people are.",
  ],
  funny: [
    "I'm not lazy. I'm in energy-saving mode.",
    "My bed and I have a special relationship. It's called gravity.",
    "Adulting is just googling how to do things.",
    "I followed my heart. It led me to the fridge.",
    "Life is short. Smile while you still have teeth.",
    "I put the 'pro' in procrastination. Eventually.",
    "My wallet is like an onion. Opening it makes me cry.",
    "I'm on a seafood diet. I see food and I eat it.",
    "Running late is my cardio.",
    "If at first you don't succeed, skydiving is not for you.",
    "Coffee: because adulting is hard.",
    "I need a six-month vacation. Twice a year.",
  ],
};

export function randomQuote(category: Category | "any", avoid?: string) {
  const cat: Category =
    category === "any"
      ? CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)].id
      : category;
  const pool = QUOTES[cat].filter((q) => q !== avoid);
  return { category: cat, text: pool[Math.floor(Math.random() * pool.length)] };
}
