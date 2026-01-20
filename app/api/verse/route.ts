// =============================================
// Bible Verse API Route
// =============================================
// Fetches daily Bible verses from an external API
// GET /api/verse

import { NextResponse } from 'next/server';

// List of curated verse references for encouragement
// These are specifically chosen to be uplifting for studying
const VERSE_REFERENCES = [
  'Jeremiah 29:11',
  'Philippians 4:13',
  'Psalm 23:1',
  'Proverbs 3:5-6',
  'Joshua 1:9',
  '1 Peter 5:7',
  'Psalm 27:1',
  'Romans 8:28',
  'Philippians 4:6-7',
  'Matthew 11:28',
  'Isaiah 40:31',
  'Psalm 34:18',
  'Psalm 46:1',
  'Proverbs 16:3',
  '2 Timothy 1:7',
  'Deuteronomy 31:8',
  'John 14:27',
  'Psalm 37:4',
  'Proverbs 18:10',
  'Isaiah 40:29',
  'Hebrews 11:1',
  'Psalm 118:24',
  'Romans 12:12',
  'Lamentations 3:22-23',
  'Philippians 4:19',
  'Colossians 3:23',
  'Romans 15:13',
  'Psalm 91:1-2',
  'Isaiah 41:10',
  'Matthew 6:33',
];

// Cache to avoid hitting the API too often
let cachedVerse: { text: string; reference: string; fetchedAt: number } | null = null;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour cache

/**
 * Get the verse reference for today
 * Uses day of year to cycle through verses
 */
function getTodayVerseReference(): string {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  
  const index = dayOfYear % VERSE_REFERENCES.length;
  return VERSE_REFERENCES[index];
}

/**
 * Fetch verse from Bible API
 */
async function fetchVerseFromAPI(reference: string): Promise<{ text: string; reference: string } | null> {
  try {
    // Using bible-api.com - free, no API key needed
    const encodedRef = encodeURIComponent(reference);
    const response = await fetch(`https://bible-api.com/${encodedRef}?translation=kjv`);
    
    if (!response.ok) {
      console.error('Bible API error:', response.status);
      return null;
    }
    
    const data = await response.json();
    
    if (data.text) {
      // Clean up the text (remove extra whitespace and verse numbers)
      const cleanText = data.text
        .replace(/\d+\s*/g, '') // Remove verse numbers
        .replace(/\n/g, ' ')    // Replace newlines with spaces
        .replace(/\s+/g, ' ')   // Normalize whitespace
        .trim();
      
      return {
        text: cleanText,
        reference: data.reference || reference,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching verse:', error);
    return null;
  }
}


export async function GET() {
  try {
    // Check cache first
    if (cachedVerse && Date.now() - cachedVerse.fetchedAt < CACHE_DURATION) {
      return NextResponse.json({
        success: true,
        verse: {
          text: cachedVerse.text,
          reference: cachedVerse.reference,
        },
        cached: true,
      });
    }
    
    // Get today's verse reference
    const reference = getTodayVerseReference();
    
    // Fetch from API
    const verse = await fetchVerseFromAPI(reference);
    
    if (verse) {
      // Update cache
      cachedVerse = {
        text: verse.text,
        reference: verse.reference,
        fetchedAt: Date.now(),
      };
      
      return NextResponse.json({
        success: true,
        verse,
        cached: false,
      });
    }
    
    // API failed to return verse
    return NextResponse.json(
      { success: false, error: 'Failed to fetch verse from API' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Verse API error:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to fetch verse' },
      { status: 500 }
    );
  }
}
