import heroSoundscape from '../assets/images/hero_soundscape_1794552051718.jpg';
import moodEnergyPulse from '../assets/images/mood_energy_pulse_1794552050797.jpg';
import moodNightChill from '../assets/images/mood_night_chill_1794552052410.jpg';
import moodHorizonTravel from '../assets/images/mood_horizon_travel_1794552053713.jpg';
import moodTranquilNature from '../assets/images/mood_tranquil_nature_1794552053833.jpg';
import {
  LanguageFilter,
  MoodCategory,
  MoodId,
  Track,
  TrackLanguage,
} from '../types/music';

export const HERO_BANNER_IMAGE = heroSoundscape;

export const MOOD_CATEGORIES: MoodCategory[] = [
  {
    id: 'workout',
    name: 'Workout',
    emoji: '💪',
    description: 'High-tempo Bollywood power anthems, Marathi beats, and driving electronic rhythms.',
    curatorNote: 'High-adrenaline tracks for heavy sets and sprints.',
    accentFrom: '#3B82F6',
    accentTo: '#6366F1',
    glowColor: 'rgba(59, 130, 246, 0.28)',
    coverImage: moodEnergyPulse,
  },
  {
    id: 'chill',
    name: 'Chill',
    emoji: '🌙',
    description: 'Hindi lo-fi flips, breezy Marathi classics, and unhurried late-night grooves.',
    curatorNote: 'Warm melodies for unwinding after midnight.',
    accentFrom: '#6366F1',
    accentTo: '#8B5CF6',
    glowColor: 'rgba(99, 102, 241, 0.28)',
    coverImage: moodNightChill,
  },
  {
    id: 'sad',
    name: 'Sad',
    emoji: '💔',
    description: 'Soul-stirring Arijit Singh ballads, emotional Marathi melodies, and solo piano.',
    curatorNote: 'Intimate vocals and acoustic minimalism when you need space to feel.',
    accentFrom: '#4F46E5',
    accentTo: '#1E3A8A',
    glowColor: 'rgba(79, 70, 229, 0.25)',
    coverImage: moodNightChill,
  },
  {
    id: 'romantic',
    name: 'Romantic',
    emoji: '❤️',
    description: 'Timeless Hindi love songs, Ajay-Atul Marathi duets, and candlelit piano.',
    curatorNote: 'Tender melodies tailored for quiet evenings together.',
    accentFrom: '#8B5CF6',
    accentTo: '#EC4899',
    glowColor: 'rgba(139, 92, 246, 0.26)',
    coverImage: moodNightChill,
  },
  {
    id: 'travel',
    name: 'Travel',
    emoji: '🚗',
    description: 'Highway Bollywood favorites, uplifting Marathi folk-fusion, and night-drive synth.',
    curatorNote: 'Built for open stretches of asphalt and shifting skylines.',
    accentFrom: '#0EA5E9',
    accentTo: '#6366F1',
    glowColor: 'rgba(14, 165, 233, 0.28)',
    coverImage: moodHorizonTravel,
  },
  {
    id: 'motivation',
    name: 'Motivation',
    emoji: '🔥',
    description: 'Triumphant Hindi & Marathi anthems and cinematic swells that sharpen resolve.',
    curatorNote: 'Momentum-building tracks to break through hesitation.',
    accentFrom: '#6366F1',
    accentTo: '#38BDF8',
    glowColor: 'rgba(99, 102, 241, 0.30)',
    coverImage: moodEnergyPulse,
  },
  {
    id: 'focus',
    name: 'Focus',
    emoji: '📚',
    description: 'Hindi lo-fi study mixes, soothing Marathi instrumentals, and deep-work beats.',
    curatorNote: 'Distraction-free flow states engineered for study and work.',
    accentFrom: '#3B82F6',
    accentTo: '#7C3AED',
    glowColor: 'rgba(59, 130, 246, 0.25)',
    coverImage: moodNightChill,
  },
  {
    id: 'party',
    name: 'Party',
    emoji: '🎉',
    description: 'Zingaat energy, Bollywood dancefloor bangers, and euphoric festival drops.',
    curatorNote: 'Peak-hour celebration rhythms to lift the entire room.',
    accentFrom: '#7C3AED',
    accentTo: '#2563EB',
    glowColor: 'rgba(124, 58, 237, 0.30)',
    coverImage: moodEnergyPulse,
  },
  {
    id: 'devotional',
    name: 'Devotional',
    emoji: '🙏',
    description: 'Sacred Marathi aartis, soulful Hindi bhajans, and serene spiritual chants.',
    curatorNote: 'Grounded harmonics for prayer, gratitude, and stillness.',
    accentFrom: '#4338CA',
    accentTo: '#60A5FA',
    glowColor: 'rgba(67, 56, 202, 0.26)',
    coverImage: moodTranquilNature,
  },
  {
    id: 'peaceful',
    name: 'Peaceful',
    emoji: '🌿',
    description: 'Sufi serenity, calm Marathi classics, and restorative acoustic ambiance.',
    curatorNote: 'Soft natural resonance to quiet a busy mind.',
    accentFrom: '#2563EB',
    accentTo: '#0D9488',
    glowColor: 'rgba(37, 99, 235, 0.25)',
    coverImage: moodTranquilNature,
  },
];

const ytThumb = (videoId: string) => `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

function createTrack(
  id: string,
  title: string,
  artist: string,
  language: TrackLanguage,
  moodId: MoodId,
  youtubeId: string,
  durationLabel: string,
  durationSeconds: number,
  keywords: string[],
  isLive = false
): Track {
  const mood = MOOD_CATEGORIES.find((m) => m.id === moodId)!;
  return {
    id,
    title,
    artist,
    language,
    moodId,
    provider: 'youtube',
    providerTrackId: youtubeId,
    durationLabel,
    durationSeconds,
    isLive,
    artworkUrl: ytThumb(youtubeId),
    fallbackArtwork: mood.coverImage,
    keywords: [...keywords, language.toLowerCase()],
  };
}

export const TRACKS: Track[] = [
  // Workout 💪
  createTrack(
    'wk-hi-1',
    'Zinda (Bhaag Milkha Bhaag)',
    'Siddharth Mahadevan · Shankar-Ehsaan-Loy',
    'Hindi',
    'workout',
    'uQF7_gAW4W0',
    '3:30',
    210,
    ['workout', 'hindi', 'bollywood', 'gym', 'running', 'zinda']
  ),
  createTrack(
    'wk-mr-1',
    'Zingaat (Sairat)',
    'Ajay-Atul',
    'Marathi',
    'workout',
    'ZZxoxrjzsjk',
    '3:46',
    226,
    ['workout', 'marathi', 'zingaat', 'sairat', 'cardio', 'high energy']
  ),
  createTrack(
    'wk-hi-2',
    'Kala Chashma (Baar Baar Dekho)',
    'Amar Arshi, Badshah & Neha Kakkar',
    'Hindi',
    'workout',
    'k4yXQ5w2Vkk',
    '2:54',
    174,
    ['workout', 'hindi', 'bollywood', 'dance', 'cardio']
  ),
  createTrack(
    'wk-en-1',
    'Heroes Tonight',
    'Janji feat. Johnning',
    'English',
    'workout',
    '3nQNiWdeH2Q',
    '3:28',
    208,
    ['workout', 'gym', 'edm', 'ncs', 'sprint']
  ),
  createTrack(
    'wk-en-2',
    'Sky High',
    'Elektronomia',
    'Instrumental',
    'workout',
    'TW9d8vYrVFQ',
    '3:58',
    238,
    ['workout', 'running', 'upbeat', 'electronic']
  ),

  // Chill 🌙
  createTrack(
    'ch-hi-1',
    'Kabira (Lofi Flip)',
    'Tochi Raina & Rekha Bhardwaj · T-Series',
    'Hindi',
    'chill',
    'p7iR4Jik9Ks',
    '3:42',
    222,
    ['chill', 'hindi', 'lofi', 'kabira', 'night', 'relax']
  ),
  createTrack(
    'ch-mr-1',
    'Man Udhan Varyache',
    'Shankar Mahadevan · Ajay-Atul',
    'Marathi',
    'chill',
    'XZogVSlBB34',
    '4:25',
    265,
    ['chill', 'marathi', 'breezy', 'classic', 'relax']
  ),
  createTrack(
    'ch-mr-2',
    'Ved Tujha (Ved)',
    'Ajay-Atul',
    'Marathi',
    'chill',
    'CUhtYYqhSzY',
    '3:40',
    220,
    ['chill', 'marathi', 'ved', 'evening', 'mellow']
  ),
  createTrack(
    'ch-hi-2',
    'Kabira (Yeh Jawaani Hai Deewani)',
    'Tochi Raina & Rekha Bhardwaj',
    'Hindi',
    'chill',
    'jHNNMj5bNQw',
    '4:11',
    251,
    ['chill', 'hindi', 'acoustic', 'yjhd', 'unplugged']
  ),
  createTrack(
    'ch-in-1',
    'Lofi Hip Hop Radio — Beats to Relax',
    'Lofi Girl',
    'Instrumental',
    'chill',
    'jfKfPfyJRdk',
    'LIVE',
    0,
    ['chill', 'lofi', 'night', 'beats', 'radio'],
    true
  ),

  // Sad 💔
  createTrack(
    'sd-hi-1',
    'Channa Mereya (Ae Dil Hai Mushkil)',
    'Arijit Singh · Pritam',
    'Hindi',
    'sad',
    '284Ov7ysmfA',
    '4:49',
    289,
    ['sad', 'hindi', 'arijit singh', 'heartbreak', 'emotional']
  ),
  createTrack(
    'sd-hi-2',
    'Agar Tum Saath Ho (Tamasha)',
    'Alka Yagnik & Arijit Singh · A.R. Rahman',
    'Hindi',
    'sad',
    'xRb8hxwJNgs',
    '5:41',
    341,
    ['sad', 'hindi', 'tamasha', 'rahman', 'emotional']
  ),
  createTrack(
    'sd-mr-1',
    'Tik Tik Vajate Dokyat (Duniyadari)',
    'Sonu Nigam & Sayali Pankaj',
    'Marathi',
    'sad',
    '4noDLscADxE',
    '4:05',
    245,
    ['sad', 'marathi', 'duniyadari', 'memories', 'nostalgia']
  ),
  createTrack(
    'sd-hi-3',
    'Tum Hi Ho (Aashiqui 2)',
    'Arijit Singh · Mithoon',
    'Hindi',
    'sad',
    '81qmmlsIE3k',
    '4:22',
    262,
    ['sad', 'hindi', 'aashiqui 2', 'arijit singh', 'pain']
  ),
  createTrack(
    'sd-in-1',
    'River Flows in You',
    'Yiruma',
    'Instrumental',
    'sad',
    '7maJOI3QMu0',
    '3:10',
    190,
    ['sad', 'piano', 'yiruma', 'solo']
  ),

  // Romantic ❤️
  createTrack(
    'rm-hi-1',
    'Kesariya (Brahmāstra)',
    'Arijit Singh · Pritam',
    'Hindi',
    'romantic',
    'BddP6PYo2gs',
    '4:28',
    268,
    ['romantic', 'hindi', 'kesariya', 'arijit singh', 'love']
  ),
  createTrack(
    'rm-mr-1',
    'Yad Lagla (Sairat)',
    'Ajay Gogavale · Ajay-Atul',
    'Marathi',
    'romantic',
    'VmU1ZsXUbG0',
    '5:14',
    314,
    ['romantic', 'marathi', 'sairat', 'yad lagla', 'love']
  ),
  createTrack(
    'rm-mr-2',
    'Sairat Zaala Ji (Sairat)',
    'Chinmayi Sripada & Ajay Gogavale',
    'Marathi',
    'romantic',
    'AQ-P5RR7r40',
    '6:09',
    369,
    ['romantic', 'marathi', 'sairat', 'duet', 'melody']
  ),
  createTrack(
    'rm-hi-2',
    'Raataan Lambiyan (Shershaah)',
    'Jubin Nautiyal & Asees Kaur',
    'Hindi',
    'romantic',
    'gpredzKrxjs',
    '3:50',
    230,
    ['romantic', 'hindi', 'shershaah', 'love', 'duet']
  ),
  createTrack(
    'rm-in-1',
    'Clair de Lune',
    'Claude Debussy',
    'Instrumental',
    'romantic',
    'CvFH_6DNRCY',
    '5:04',
    304,
    ['romantic', 'piano', 'debussy', 'moonlight']
  ),

  // Travel 🚗
  createTrack(
    'tr-hi-1',
    'Ilahi (Yeh Jawaani Hai Deewani)',
    'Arijit Singh · Pritam',
    'Hindi',
    'travel',
    'fdubeMFwuGs',
    '3:33',
    213,
    ['travel', 'hindi', 'ilahi', 'roadtrip', 'wanderlust']
  ),
  createTrack(
    'tr-hi-2',
    'Safarnama (Tamasha)',
    'Lucky Ali · A.R. Rahman',
    'Hindi',
    'travel',
    'OQ-DiP-Cuj4',
    '4:12',
    252,
    ['travel', 'hindi', 'safarnama', 'lucky ali', 'journey']
  ),
  createTrack(
    'tr-mr-1',
    'Malhar Vari',
    'Ajay-Atul · Aga Bai Arrecha',
    'Marathi',
    'travel',
    'qIUVmFAxodU',
    '4:40',
    280,
    ['travel', 'marathi', 'monsoon', 'drive', 'folk']
  ),
  createTrack(
    'tr-en-1',
    'On & On',
    'Cartoon feat. Daniel Levi',
    'English',
    'travel',
    'K4DyBUG242c',
    '3:28',
    208,
    ['travel', 'roadtrip', 'drive', 'uplifting']
  ),
  createTrack(
    'tr-in-1',
    'Synthwave Radio — Night Drive',
    'Lofi Girl Synthwave',
    'Instrumental',
    'travel',
    '4xDzrJKXOOY',
    'LIVE',
    0,
    ['travel', 'night drive', 'synthwave', 'highway'],
    true
  ),

  // Motivation 🔥
  createTrack(
    'mt-hi-1',
    'Kar Har Maidaan Fateh (Sanju)',
    'Sukhwinder Singh & Shreya Ghoshal',
    'Hindi',
    'motivation',
    '9iIX4PBplAY',
    '5:11',
    311,
    ['motivation', 'hindi', 'anthem', 'sanju', 'inspiration']
  ),
  createTrack(
    'mt-mr-1',
    'Mauli Mauli (Lai Bhaari)',
    'Ajay Gogavale · Ajay-Atul',
    'Marathi',
    'motivation',
    'XbIY_OgQIEw',
    '4:52',
    292,
    ['motivation', 'marathi', 'mauli', 'power', 'strength']
  ),
  createTrack(
    'mt-hi-2',
    'Zinda (Bhaag Milkha Bhaag)',
    'Siddharth Mahadevan',
    'Hindi',
    'motivation',
    'uQF7_gAW4W0',
    '3:30',
    210,
    ['motivation', 'hindi', 'zinda', 'milkha', 'determination']
  ),
  createTrack(
    'mt-en-1',
    'Mortals',
    'Warriyo feat. Laura Brehm',
    'English',
    'motivation',
    'yJg-Y5byMMw',
    '3:48',
    228,
    ['motivation', 'epic', 'energy', 'drive']
  ),

  // Focus 📚
  createTrack(
    'fc-hi-1',
    'Kabira (Lofi Study Flip)',
    'T-Series Lofi',
    'Hindi',
    'focus',
    'p7iR4Jik9Ks',
    '3:42',
    222,
    ['focus', 'hindi', 'lofi', 'study', 'coding']
  ),
  createTrack(
    'fc-mr-1',
    'Jeev Rangla (Jogwa)',
    'Hariharan & Shreya Ghoshal · Ajay-Atul',
    'Marathi',
    'focus',
    'CskdxG5Jwus',
    '4:38',
    278,
    ['focus', 'marathi', 'classical', 'calm', 'reading']
  ),
  createTrack(
    'fc-in-1',
    'Deep Focus Ambient Session',
    'Lofi Girl',
    'Instrumental',
    'focus',
    '4oStw0r33so',
    'LIVE',
    0,
    ['focus', 'study', 'coding', 'ambient'],
    true
  ),
  createTrack(
    'fc-in-2',
    'Chillhop Radio — Jazzy Study Beats',
    'Chillhop Music',
    'Instrumental',
    'focus',
    '5yx6BWlEVcY',
    'LIVE',
    0,
    ['focus', 'chillhop', 'instrumental', 'study'],
    true
  ),

  // Party 🎉
  createTrack(
    'pt-mr-1',
    'Zingaat (Sairat)',
    'Ajay-Atul',
    'Marathi',
    'party',
    'ZZxoxrjzsjk',
    '3:46',
    226,
    ['party', 'marathi', 'zingaat', 'dance', 'dj']
  ),
  createTrack(
    'pt-hi-1',
    'Badtameez Dil (YJHD)',
    'Benny Dayal & Shefali Alvares',
    'Hindi',
    'party',
    'II2EO3Nw4m0',
    '4:12',
    252,
    ['party', 'hindi', 'bollywood', 'dance', 'celebration']
  ),
  createTrack(
    'pt-hi-2',
    'Kala Chashma',
    'Amar Arshi, Badshah & Neha Kakkar',
    'Hindi',
    'party',
    'k4yXQ5w2Vkk',
    '2:54',
    174,
    ['party', 'hindi', 'dancefloor', 'wedding', 'club']
  ),
  createTrack(
    'pt-mr-2',
    'Chandra (Chandramukhi)',
    'Shreya Ghoshal · Ajay-Atul',
    'Marathi',
    'party',
    'r6tU3GvJ5so',
    '5:20',
    320,
    ['party', 'marathi', 'chandra', 'lavani', 'dance']
  ),
  createTrack(
    'pt-en-1',
    'Alone',
    'Marshmello',
    'English',
    'party',
    'ALZHF5UqnU4',
    '3:20',
    200,
    ['party', 'dance', 'festival', 'electronic']
  ),

  // Devotional 🙏
  createTrack(
    'dv-hi-1',
    'Deva Shree Ganesha (Agneepath)',
    'Ajay Gogavale · Ajay-Atul',
    'Hindi',
    'devotional',
    'gOt4QFTQpBU',
    '5:56',
    356,
    ['devotional', 'hindi', 'ganpati', 'aarti', 'prayer']
  ),
  createTrack(
    'dv-mr-1',
    'Sukhkarta Dukhharta (Ganpati Aarti)',
    'Lata Mangeshkar',
    'Marathi',
    'devotional',
    'dl-9SxjyUf0',
    '3:15',
    195,
    ['devotional', 'marathi', 'aarti', 'ganpati', 'lata mangeshkar']
  ),
  createTrack(
    'dv-mr-2',
    'Morya Morya (Uladhaal)',
    'Ajay-Atul',
    'Marathi',
    'devotional',
    '8iVbizk15d4',
    '5:18',
    318,
    ['devotional', 'marathi', 'morya', 'ganesha', 'utsav']
  ),
  createTrack(
    'dv-hi-2',
    'Namo Namo (Kedarnath)',
    'Amit Trivedi',
    'Hindi',
    'devotional',
    'HFX6AZ5bDDo',
    '5:22',
    322,
    ['devotional', 'hindi', 'shiva', 'namo namo', 'prayer']
  ),
  createTrack(
    'dv-mr-3',
    'Mauli Mauli (Lai Bhaari)',
    'Ajay Gogavale',
    'Marathi',
    'devotional',
    'XbIY_OgQIEw',
    '4:52',
    292,
    ['devotional', 'marathi', 'vithoba', 'mauli', 'bhakti']
  ),

  // Peaceful 🌿
  createTrack(
    'pc-hi-1',
    'Kun Faya Kun (Rockstar)',
    'A.R. Rahman, Javed Ali & Mohit Chauhan',
    'Hindi',
    'peaceful',
    'ZTggh-wKQcU',
    '7:53',
    473,
    ['peaceful', 'hindi', 'sufi', 'rahman', 'calm']
  ),
  createTrack(
    'pc-mr-1',
    'Jeev Rangla (Jogwa)',
    'Hariharan & Shreya Ghoshal',
    'Marathi',
    'peaceful',
    'CskdxG5Jwus',
    '4:38',
    278,
    ['peaceful', 'marathi', 'melody', 'serene', 'jogwa']
  ),
  createTrack(
    'pc-mr-2',
    'Apsara Aali (Natarang)',
    'Bela Shende · Ajay-Atul',
    'Marathi',
    'peaceful',
    'mW67u_hWiSo',
    '4:30',
    270,
    ['peaceful', 'marathi', 'classical', 'natarang', 'graceful']
  ),
  createTrack(
    'pc-hi-2',
    'Kabira (Acoustic)',
    'Tochi Raina & Rekha Bhardwaj',
    'Hindi',
    'peaceful',
    'jHNNMj5bNQw',
    '4:11',
    251,
    ['peaceful', 'hindi', 'acoustic', 'calm']
  ),
  createTrack(
    'pc-in-1',
    'Flying — Soft Ambient Piano',
    'Peder B. Helland',
    'Instrumental',
    'peaceful',
    '1ZYbU82GVz4',
    '180:00',
    10800,
    ['peaceful', 'ambient', 'piano', 'rest']
  ),
];

export function getMoodById(moodId: MoodId): MoodCategory {
  return MOOD_CATEGORIES.find((m) => m.id === moodId) ?? MOOD_CATEGORIES[0];
}

export function getTracksByMood(
  moodId: MoodId,
  language: LanguageFilter = 'All'
): Track[] {
  return TRACKS.filter(
    (track) =>
      track.moodId === moodId &&
      (language === 'All' || track.language === language)
  );
}
