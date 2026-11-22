import catBhaktiDevotion from '../assets/images/cat_bhakti_devotion_1794727318291.jpg';
import catMorningWalk from '../assets/images/cat_morning_walk_1794727316393.jpg';
import catSleepMoonlight from '../assets/images/cat_sleep_moonlight_1794727317849.jpg';
import expActivityMode from '../assets/images/exp_activity_mode_1794727317702.jpg';
import expFeelMode from '../assets/images/exp_feel_mode_1794727316131.jpg';
import heroSoundscape from '../assets/images/hero_soundscape_1794552051718.jpg';
import moodEnergyPulse from '../assets/images/mood_energy_pulse_1794552050797.jpg';
import moodHorizonTravel from '../assets/images/mood_horizon_travel_1794552053713.jpg';
import moodNightChill from '../assets/images/mood_night_chill_1794552052410.jpg';
import moodTranquilNature from '../assets/images/mood_tranquil_nature_1794552053833.jpg';
import { LanguageFilter, MoodId, Track } from '../types/music';

export type ExperienceMode = 'activity' | 'feel';

export interface ExperienceModeMeta {
  id: ExperienceMode;
  title: string;
  description: string;
  coverImage: string;
  categoryPreview: string;
}

export interface CuratedPlaylistSpec {
  id: string;
  title: string;
  subtitle: string;
  languages?: string[];
  moodIds?: MoodId[];
  trackIds?: string[];
  keywords?: string[];
}

export interface ResolvedCuratedPlaylist {
  id: string;
  title: string;
  subtitle: string;
  coverImage: string;
  tracks: Track[];
}

export interface ExperienceCategoryConfig {
  id: string;
  mode: ExperienceMode;
  title: string;
  description: string;
  curatorNote: string;
  primaryMoodId: MoodId;
  sourceMoodIds: MoodId[];
  preferredTrackIds?: string[];
  playlists: CuratedPlaylistSpec[];
  coverImage: string;
  accentFrom: string;
  accentTo: string;
  glowColor: string;
}

export const EXPERIENCE_MODES: Record<ExperienceMode, ExperienceModeMeta> = {
  activity: {
    id: 'activity',
    title: 'Activity Mode',
    description: "Music for everything you're doing.",
    coverImage: expActivityMode,
    categoryPreview: 'Workout · Morning Walk · Travel · Focus · Sleep · Bhakti',
  },
  feel: {
    id: 'feel',
    title: 'Feel Mode',
    description: "Music that matches how you're feeling.",
    coverImage: expFeelMode,
    categoryPreview: 'Happy · Sad · Romantic · Peaceful · Energetic · Nostalgic',
  },
};

export const ACTIVITY_CATEGORIES: ExperienceCategoryConfig[] = [
  {
    id: 'workout',
    mode: 'activity',
    title: 'WORKOUT',
    description: 'Push harder. Go further.',
    curatorNote: 'High-tempo Bollywood power anthems and relentless workout energy.',
    primaryMoodId: 'workout',
    sourceMoodIds: ['workout'],
    playlists: [
      {
        id: 'wk-hindi-power',
        title: 'Hindi Power',
        subtitle: 'Adrenaline Bollywood anthems & rap',
        languages: ['Hindi'],
      },
      {
        id: 'wk-marathi-power',
        title: 'Marathi Power',
        subtitle: 'High-spirit Marathi battle & cardio hits',
        languages: ['Marathi'],
      },
      {
        id: 'wk-intl-energy',
        title: 'International Energy',
        subtitle: 'Upbeat electronic & global sprint mixes',
        languages: ['English', 'Instrumental'],
      },
      {
        id: 'wk-motivation-mix',
        title: 'Motivation Mix',
        subtitle: 'Relentless mindset & training anthems',
        keywords: ['motivation', 'inspiration', 'anthem'],
      },
    ],
    coverImage: moodEnergyPulse,
    accentFrom: '#B6FF00',
    accentTo: '#9D4EDD',
    glowColor: 'rgba(182, 255, 0, 0.22)',
  },
  {
    id: 'morning-walk',
    mode: 'activity',
    title: 'MORNING WALK',
    description: 'Start your day with the right energy.',
    curatorNote: 'Fresh acoustic rhythms and sunrise melodies for open air strides.',
    primaryMoodId: 'peaceful',
    sourceMoodIds: ['peaceful', 'travel'],
    playlists: [
      {
        id: 'mw-fresh-morning',
        title: 'Fresh Morning',
        subtitle: 'Bright vocal tracks for early strides',
        languages: ['Hindi'],
      },
      {
        id: 'mw-positive-energy',
        title: 'Positive Energy',
        subtitle: 'Uplifting rhythm to build momentum',
        moodIds: ['travel'],
      },
      {
        id: 'mw-peaceful-walk',
        title: 'Peaceful Walk',
        subtitle: 'Calm melodies for quiet morning paths',
        moodIds: ['peaceful'],
      },
    ],
    coverImage: catMorningWalk,
    accentFrom: '#B6FF00',
    accentTo: '#9D4EDD',
    glowColor: 'rgba(182, 255, 0, 0.2)',
  },
  {
    id: 'travel',
    mode: 'activity',
    title: 'TRAVEL',
    description: 'Every journey deserves a soundtrack.',
    curatorNote: 'Highway Bollywood favorites, Marathi folk-fusion, and night-drive grooves.',
    primaryMoodId: 'travel',
    sourceMoodIds: ['travel'],
    playlists: [
      {
        id: 'tr-highway-bollywood',
        title: 'Highway Bollywood',
        subtitle: 'Long-drive Hindi roadtrip staples',
        languages: ['Hindi'],
      },
      {
        id: 'tr-regional-global',
        title: 'Monsoon & Open Road',
        subtitle: 'Marathi grooves & uplifting vocal anthems',
        languages: ['Marathi', 'English'],
      },
      {
        id: 'tr-night-drive',
        title: 'Night Drive',
        subtitle: 'Late-night synthwave & highway atmosphere',
        languages: ['Instrumental', 'English'],
      },
    ],
    coverImage: moodHorizonTravel,
    accentFrom: '#9D4EDD',
    accentTo: '#B6FF00',
    glowColor: 'rgba(157, 78, 221, 0.24)',
  },
  {
    id: 'focus',
    mode: 'activity',
    title: 'FOCUS',
    description: 'Find your flow. Stay focused.',
    curatorNote: 'Minimal lo-fi study mixes and distraction-free ambient beats.',
    primaryMoodId: 'focus',
    sourceMoodIds: ['focus'],
    playlists: [
      {
        id: 'fc-deep-instrumental',
        title: 'Deep Instrumentals',
        subtitle: 'Distraction-free ambient & chillhop streams',
        languages: ['Instrumental'],
      },
      {
        id: 'fc-lofi-vocals',
        title: 'Lo-Fi & Classical Flow',
        subtitle: 'Gentle Hindi & Marathi study tracks',
        languages: ['Hindi', 'Marathi'],
      },
    ],
    coverImage: heroSoundscape,
    accentFrom: '#9D4EDD',
    accentTo: '#B6FF00',
    glowColor: 'rgba(157, 78, 221, 0.22)',
  },
  {
    id: 'sleep',
    mode: 'activity',
    title: 'SLEEP',
    description: 'Slow down. Relax. Recharge.',
    curatorNote: 'Moonlit ambient piano, gentle lo-fi, and unhurried midnight calm.',
    primaryMoodId: 'chill',
    sourceMoodIds: ['chill', 'peaceful'],
    playlists: [
      {
        id: 'sl-deep-relaxation',
        title: 'Deep Relaxation',
        subtitle: 'Restorative serenity to drift off cleanly',
        moodIds: ['peaceful'],
      },
      {
        id: 'sl-slow-instrumentals',
        title: 'Slow Instrumentals',
        subtitle: 'Soft ambient piano & quiet lo-fi loops',
        languages: ['Instrumental'],
      },
      {
        id: 'sl-night-vibes',
        title: 'Night Vibes',
        subtitle: 'Warm late-evening Hindi & Marathi chill',
        moodIds: ['chill'],
      },
    ],
    coverImage: catSleepMoonlight,
    accentFrom: '#9D4EDD',
    accentTo: '#6B21A8',
    glowColor: 'rgba(157, 78, 221, 0.24)',
  },
  {
    id: 'bhakti',
    mode: 'activity',
    title: 'BHAKTI',
    description: 'Music for peace and devotion.',
    curatorNote: 'Sacred Marathi aartis, soulful Hindi bhajans, and serene chants.',
    primaryMoodId: 'devotional',
    sourceMoodIds: ['devotional'],
    playlists: [
      {
        id: 'bk-marathi-aarti',
        title: 'Marathi Aarti & Abhang',
        subtitle: 'Sacred Ganpati aartis & Vithoba devotion',
        languages: ['Marathi'],
      },
      {
        id: 'bk-hindi-bhajan',
        title: 'Hindi Vandana & Bhajan',
        subtitle: 'Soulful prayers & spiritual anthems',
        languages: ['Hindi'],
      },
    ],
    coverImage: catBhaktiDevotion,
    accentFrom: '#9D4EDD',
    accentTo: '#B6FF00',
    glowColor: 'rgba(157, 78, 221, 0.24)',
  },
];

export const FEEL_CATEGORIES: ExperienceCategoryConfig[] = [
  {
    id: 'happy',
    mode: 'feel',
    title: 'HAPPY',
    description: 'Bright grooves and feel-good anthems to lift your day.',
    curatorNote: 'Sunlit rhythms, upbeat Bollywood hits, and joyful momentum.',
    primaryMoodId: 'party',
    sourceMoodIds: ['party', 'travel'],
    playlists: [
      {
        id: 'hp-feel-good',
        title: 'Feel-Good Bollywood',
        subtitle: 'Bright Hindi hits for instant energy',
        languages: ['Hindi'],
      },
      {
        id: 'hp-marathi-joy',
        title: 'Marathi Celebration',
        subtitle: 'Vibrant Marathi beats & folk fusion',
        languages: ['Marathi'],
      },
      {
        id: 'hp-global-lift',
        title: 'Bright Electronic & Road',
        subtitle: 'Uplifting English & synth melodies',
        languages: ['English', 'Instrumental'],
      },
    ],
    coverImage: expActivityMode,
    accentFrom: '#B6FF00',
    accentTo: '#9D4EDD',
    glowColor: 'rgba(182, 255, 0, 0.22)',
  },
  {
    id: 'sad',
    mode: 'feel',
    title: 'SAD',
    description: 'Intimate vocals and quiet melodies when you need space to feel.',
    curatorNote: 'Soul-stirring Hindi ballads, Marathi classics, and solo piano.',
    primaryMoodId: 'sad',
    sourceMoodIds: ['sad'],
    playlists: [
      {
        id: 'sd-hindi-ballads',
        title: 'Hindi Heartbreak',
        subtitle: 'Deeply expressive ballads to unwind to',
        languages: ['Hindi'],
      },
      {
        id: 'sd-marathi-piano',
        title: 'Quiet Reflections & Piano',
        subtitle: 'Emotional Marathi gems & solo piano',
        languages: ['Marathi', 'Instrumental'],
      },
    ],
    coverImage: moodNightChill,
    accentFrom: '#9D4EDD',
    accentTo: '#5B21B6',
    glowColor: 'rgba(157, 78, 221, 0.24)',
  },
  {
    id: 'romantic',
    mode: 'feel',
    title: 'ROMANTIC',
    description: 'Tender duets and warm melodies made for close moments.',
    curatorNote: 'Timeless Hindi love songs, soulful Marathi duets, and candlelit piano.',
    primaryMoodId: 'romantic',
    sourceMoodIds: ['romantic'],
    playlists: [
      {
        id: 'rm-hindi-love',
        title: 'Hindi Love Stories',
        subtitle: 'Modern & timeless Bollywood romance',
        languages: ['Hindi'],
      },
      {
        id: 'rm-marathi-duets',
        title: 'Marathi Duets',
        subtitle: 'Timeless & soulful Marathi melodies',
        languages: ['Marathi'],
      },
      {
        id: 'rm-piano',
        title: 'Candlelit Piano',
        subtitle: 'Soft classical & acoustic warmth',
        languages: ['Instrumental'],
      },
    ],
    coverImage: expFeelMode,
    accentFrom: '#9D4EDD',
    accentTo: '#B6FF00',
    glowColor: 'rgba(157, 78, 221, 0.26)',
  },
  {
    id: 'peaceful',
    mode: 'feel',
    title: 'PEACEFUL',
    description: 'Soft acoustic stillness to quiet a busy mind.',
    curatorNote: 'Sufi serenity, restorative Marathi classics, and ambient calm.',
    primaryMoodId: 'peaceful',
    sourceMoodIds: ['peaceful'],
    playlists: [
      {
        id: 'pc-sufi-acoustic',
        title: 'Sufi & Acoustic Serenity',
        subtitle: 'Calm Hindi vocals & unplugged peace',
        languages: ['Hindi'],
      },
      {
        id: 'pc-marathi-calm',
        title: 'Marathi Serenity',
        subtitle: 'Graceful classical & soothing melodies',
        languages: ['Marathi'],
      },
      {
        id: 'pc-ambient-rest',
        title: 'Ambient Stillness',
        subtitle: 'Gentle instrumental piano to breathe to',
        languages: ['Instrumental'],
      },
    ],
    coverImage: moodTranquilNature,
    accentFrom: '#9D4EDD',
    accentTo: '#B6FF00',
    glowColor: 'rgba(157, 78, 221, 0.2)',
  },
  {
    id: 'energetic',
    mode: 'feel',
    title: 'ENERGETIC',
    description: 'High-voltage beats and unstoppable momentum.',
    curatorNote: 'Peak celebration bangers and surging anthems to move the room.',
    primaryMoodId: 'party',
    sourceMoodIds: ['party', 'workout'],
    playlists: [
      {
        id: 'en-dancefloor',
        title: 'Dancefloor Bangers',
        subtitle: 'Club, wedding & festival favorites',
        moodIds: ['party'],
      },
      {
        id: 'en-power-surge',
        title: 'Power Anthems',
        subtitle: 'High-tempo Bollywood & Marathi drive',
        moodIds: ['workout'],
      },
    ],
    coverImage: moodEnergyPulse,
    accentFrom: '#B6FF00',
    accentTo: '#9D4EDD',
    glowColor: 'rgba(182, 255, 0, 0.24)',
  },
  {
    id: 'nostalgic',
    mode: 'feel',
    title: 'NOSTALGIC',
    description: 'Timeless echoes and soulful tracks that bring back memories.',
    curatorNote: 'Classic acoustic favorites, reflective melodies, and golden moments.',
    primaryMoodId: 'chill',
    sourceMoodIds: ['chill', 'sad', 'romantic'],
    playlists: [
      {
        id: 'ns-hindi-echoes',
        title: 'Golden Hindi Acoustic',
        subtitle: 'Familiar lyrics & evening nostalgia',
        languages: ['Hindi'],
      },
      {
        id: 'ns-marathi-memories',
        title: 'Timeless Marathi',
        subtitle: 'Beloved classics & warm memories',
        languages: ['Marathi'],
      },
      {
        id: 'ns-chill-instrumentals',
        title: 'Midnight Echoes',
        subtitle: 'Gentle piano & lo-fi reflection',
        languages: ['Instrumental'],
      },
    ],
    coverImage: catSleepMoonlight,
    accentFrom: '#9D4EDD',
    accentTo: '#B6FF00',
    glowColor: 'rgba(157, 78, 221, 0.24)',
  },
];

export function getCategoriesForMode(
  mode: ExperienceMode
): ExperienceCategoryConfig[] {
  return mode === 'activity' ? ACTIVITY_CATEGORIES : FEEL_CATEGORIES;
}

export function getExperienceTracks(
  category: ExperienceCategoryConfig,
  allTracks: Track[],
  language: LanguageFilter = 'All'
): Track[] {
  const sourceMoodSet = new Set<MoodId>(category.sourceMoodIds);
  const preferredOrder = new Map<string, number>(
    (category.preferredTrackIds ?? []).map((id, idx) => [id, idx])
  );

  const matching = allTracks.filter((track) => {
    const matchesMood =
      sourceMoodSet.has(track.moodId) || preferredOrder.has(track.id);
    if (!matchesMood) return false;
    if (language !== 'All' && track.language !== language) return false;
    return true;
  });

  // Deduplicate by ID while prioritizing preferred track curation order
  const uniqueMap = new Map<string, Track>();
  for (const track of matching) {
    if (!uniqueMap.has(track.id)) {
      uniqueMap.set(track.id, track);
    }
  }

  return Array.from(uniqueMap.values()).sort((a, b) => {
    const rankA = preferredOrder.has(a.id) ? preferredOrder.get(a.id)! : 9999;
    const rankB = preferredOrder.has(b.id) ? preferredOrder.get(b.id)! : 9999;
    if (rankA !== rankB) return rankA - rankB;
    return 0;
  });
}

export function getCuratedPlaylistsForCategory(
  category: ExperienceCategoryConfig,
  categoryTracks: Track[]
): ResolvedCuratedPlaylist[] {
  const resolved: ResolvedCuratedPlaylist[] = [];

  for (const spec of category.playlists) {
    const idSet = spec.trackIds ? new Set(spec.trackIds) : null;
    const langSet = spec.languages ? new Set(spec.languages) : null;
    const moodSet = spec.moodIds ? new Set(spec.moodIds) : null;
    const kwList = spec.keywords?.map((k) => k.toLowerCase()) ?? null;

    const matched = categoryTracks.filter((track) => {
      if (idSet && idSet.has(track.id)) return true;
      if (langSet && langSet.has(track.language)) return true;
      if (moodSet && moodSet.has(track.moodId)) return true;
      if (
        kwList &&
        track.keywords.some((kw) => kwList.includes(kw.toLowerCase()))
      ) {
        return true;
      }
      return false;
    });

    // Sort preferred trackIds first if provided
    const orderMap = spec.trackIds
      ? new Map(spec.trackIds.map((id, idx) => [id, idx]))
      : null;

    const ordered = orderMap
      ? [...matched].sort((a, b) => {
          const ra = orderMap.has(a.id) ? orderMap.get(a.id)! : 9999;
          const rb = orderMap.has(b.id) ? orderMap.get(b.id)! : 9999;
          return ra - rb;
        })
      : matched;

    resolved.push({
      id: spec.id,
      title: spec.title,
      subtitle: spec.subtitle,
      coverImage: ordered[0]?.artworkUrl || category.coverImage,
      tracks: ordered,
    });
  }

  return resolved;
}
