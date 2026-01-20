// =============================================
// Bible Verses Configuration
// =============================================
// Type definitions and fallback verses
// The app now uses /api/verse to fetch daily verses from Bible API
// These serve as fallbacks when the API is unavailable

export interface Verse {
  text: string;
  reference: string;
}

export const BIBLE_VERSES: Verse[] = [
  {
    text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.",
    reference: "Jeremiah 29:11",
  },
  {
    text: "I can do all things through Christ who strengthens me.",
    reference: "Philippians 4:13",
  },
  {
    text: "The Lord is my shepherd; I shall not want.",
    reference: "Psalm 23:1",
  },
  {
    text: "Trust in the Lord with all your heart and lean not on your own understanding.",
    reference: "Proverbs 3:5",
  },
  {
    text: "Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.",
    reference: "Joshua 1:9",
  },
  {
    text: "Cast all your anxiety on him because he cares for you.",
    reference: "1 Peter 5:7",
  },
  {
    text: "The Lord is my light and my salvation—whom shall I fear?",
    reference: "Psalm 27:1",
  },
  {
    text: "And we know that in all things God works for the good of those who love him.",
    reference: "Romans 8:28",
  },
  {
    text: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.",
    reference: "Philippians 4:6",
  },
  {
    text: "Come to me, all you who are weary and burdened, and I will give you rest.",
    reference: "Matthew 11:28",
  },
  {
    text: "The Lord your God is with you, the Mighty Warrior who saves. He will take great delight in you.",
    reference: "Zephaniah 3:17",
  },
  {
    text: "But those who hope in the Lord will renew their strength. They will soar on wings like eagles.",
    reference: "Isaiah 40:31",
  },
  {
    text: "Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged.",
    reference: "Joshua 1:9",
  },
  {
    text: "The Lord is close to the brokenhearted and saves those who are crushed in spirit.",
    reference: "Psalm 34:18",
  },
  {
    text: "God is our refuge and strength, an ever-present help in trouble.",
    reference: "Psalm 46:1",
  },
  {
    text: "Commit to the Lord whatever you do, and he will establish your plans.",
    reference: "Proverbs 16:3",
  },
  {
    text: "For God has not given us a spirit of fear, but of power and of love and of a sound mind.",
    reference: "2 Timothy 1:7",
  },
  {
    text: "The Lord himself goes before you and will be with you; he will never leave you nor forsake you.",
    reference: "Deuteronomy 31:8",
  },
  {
    text: "Peace I leave with you; my peace I give you. Do not let your hearts be troubled and do not be afraid.",
    reference: "John 14:27",
  },
  {
    text: "Delight yourself in the Lord, and he will give you the desires of your heart.",
    reference: "Psalm 37:4",
  },
  {
    text: "In their hearts humans plan their course, but the Lord establishes their steps.",
    reference: "Proverbs 16:9",
  },
  {
    text: "The name of the Lord is a fortified tower; the righteous run to it and are safe.",
    reference: "Proverbs 18:10",
  },
  {
    text: "He gives strength to the weary and increases the power of the weak.",
    reference: "Isaiah 40:29",
  },
  {
    text: "Now faith is confidence in what we hope for and assurance about what we do not see.",
    reference: "Hebrews 11:1",
  },
  {
    text: "This is the day the Lord has made; let us rejoice and be glad in it.",
    reference: "Psalm 118:24",
  },
  {
    text: "Be joyful in hope, patient in affliction, faithful in prayer.",
    reference: "Romans 12:12",
  },
  {
    text: "The steadfast love of the Lord never ceases; his mercies never come to an end.",
    reference: "Lamentations 3:22",
  },
  {
    text: "And my God will meet all your needs according to the riches of his glory in Christ Jesus.",
    reference: "Philippians 4:19",
  },
  {
    text: "Whatever you do, work at it with all your heart, as working for the Lord.",
    reference: "Colossians 3:23",
  },
  {
    text: "May the God of hope fill you with all joy and peace as you trust in him.",
    reference: "Romans 15:13",
  },
];

// Function to get today's verse (changes daily)
export function getDailyVerse(): Verse {
  // Use the day of the year to select a verse
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  
  // Get verse based on day (cycles through all verses)
  const index = dayOfYear % BIBLE_VERSES.length;
  return BIBLE_VERSES[index];
}

// Function to get a random verse
export function getRandomVerse(): Verse {
  const index = Math.floor(Math.random() * BIBLE_VERSES.length);
  return BIBLE_VERSES[index];
}
