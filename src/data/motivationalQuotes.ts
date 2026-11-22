export interface MotivationalQuote {
  text: string;
  author: string;
}

export const MOTIVATIONAL_QUOTES: MotivationalQuote[] = [
  {
    text: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.',
    author: 'Will Durant',
  },
  {
    text: 'Small daily improvements over time lead to stunning results.',
    author: 'Robin Sharma',
  },
  {
    text: 'Success is the sum of small efforts, repeated day in and day out.',
    author: 'Robert Collier',
  },
  {
    text: 'You do not rise to the level of your goals. You fall to the level of your systems.',
    author: 'James Clear',
  },
  {
    text: 'Motivation is what gets you started. Habit is what keeps you going.',
    author: 'Jim Ryun',
  },
  {
    text: 'It is easier to prevent bad habits than to break them.',
    author: 'Benjamin Franklin',
  },
  {
    text: 'Discipline is choosing between what you want now and what you want most.',
    author: 'Abraham Lincoln',
  },
  {
    text: 'A river cuts through rock not because of its power, but because of its persistence.',
    author: 'Jim Watkins',
  },
  {
    text: 'Do not wait for extraordinary circumstances to do good action; try to use ordinary situations.',
    author: 'Jean Paul Richter',
  },
  {
    text: 'The secret of your future is hidden in your daily routine.',
    author: 'Mike Murdock',
  },
  {
    text: 'Consistency is the true foundation of trust—especially trust in yourself.',
    author: 'Roy T. Bennett',
  },
  {
    text: 'Never miss twice. One missed day is an accident; two is the start of a new habit.',
    author: 'James Clear',
  },
  {
    text: 'First forget inspiration. Habit is more dependable. Habit will sustain you whether you are inspired or not.',
    author: 'Octavia E. Butler',
  },
  {
    text: 'How we spend our days is, of course, how we spend our lives.',
    author: 'Annie Dillard',
  },
  {
    text: 'Start where you are. Use what you have. Do what you can.',
    author: 'Arthur Ashe',
  },
  {
    text: 'Great things are done by a series of small things brought together.',
    author: 'Vincent van Gogh',
  },
  {
    text: 'The chains of habit are too weak to be felt until they are too strong to be broken.',
    author: 'Samuel Johnson',
  },
  {
    text: 'Action is the foundational key to all success.',
    author: 'Pablo Picasso',
  },
  {
    text: 'Fall seven times, stand up eight.',
    author: 'Japanese Proverb',
  },
  {
    text: 'Continuous effort—not strength or intelligence—is the key to unlocking our potential.',
    author: 'Winston Churchill',
  },
  {
    text: 'One day or day one. You decide.',
    author: 'Paulo Coelho',
  },
  {
    text: 'Drop by drop is the water pot filled.',
    author: 'Dhammapada',
  },
  {
    text: 'Little by little, one travels far.',
    author: 'J.R.R. Tolkien',
  },
  {
    text: 'Long-term consistency trumps short-term intensity.',
    author: 'Bruce Lee',
  },
  {
    text: 'Your net worth to the world is usually determined by what remains after your bad habits are subtracted from your good ones.',
    author: 'Benjamin Franklin',
  },
  {
    text: 'Energy and persistence conquer all things.',
    author: 'Benjamin Franklin',
  },
  {
    text: 'What you do every day matters more than what you do once in a while.',
    author: 'Gretchen Rubin',
  },
  {
    text: 'The best time to plant a tree was twenty years ago. The second best time is today.',
    author: 'Chinese Proverb',
  },
];

export function getQuoteIndexForDate(dateKey: string): number {
  let hash = 0;
  for (let i = 0; i < dateKey.length; i++) {
    hash = (hash * 31 + dateKey.charCodeAt(i)) >>> 0;
  }
  return hash % MOTIVATIONAL_QUOTES.length;
}
