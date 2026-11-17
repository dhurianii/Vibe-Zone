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
    name: 'WORKOUT',
    emoji: '🔥',
    description: 'High-tempo Bollywood power anthems, Marathi motivational tracks, and relentless workout energy.',
    curatorNote: 'Unstoppable adrenaline and motivational anthems for heavy sets, sprints, and peak focus.',
    accentFrom: '#B6FF00',
    accentTo: '#9D4EDD',
    glowColor: 'rgba(182, 255, 0, 0.22)',
    coverImage: moodEnergyPulse,
  },
  {
    id: 'chill',
    name: 'Chill',
    emoji: '🌙',
    description: 'Hindi lo-fi flips, breezy Marathi classics, and unhurried late-night grooves.',
    curatorNote: 'Warm melodies for unwinding after midnight.',
    accentFrom: '#9D4EDD',
    accentTo: '#B6FF00',
    glowColor: 'rgba(157, 78, 221, 0.24)',
    coverImage: moodNightChill,
  },
  {
    id: 'sad',
    name: 'Sad',
    emoji: '💔',
    description: 'Soul-stirring Arijit Singh ballads, emotional Marathi melodies, and solo piano.',
    curatorNote: 'Intimate vocals and acoustic minimalism when you need space to feel.',
    accentFrom: '#9D4EDD',
    accentTo: '#5B21B6',
    glowColor: 'rgba(157, 78, 221, 0.22)',
    coverImage: moodNightChill,
  },
  {
    id: 'romantic',
    name: 'Romantic',
    emoji: '❤️',
    description: 'Timeless Hindi love songs, Ajay-Atul Marathi duets, and candlelit piano.',
    curatorNote: 'Tender melodies tailored for quiet evenings together.',
    accentFrom: '#9D4EDD',
    accentTo: '#C77DFF',
    glowColor: 'rgba(157, 78, 221, 0.25)',
    coverImage: moodNightChill,
  },
  {
    id: 'travel',
    name: 'Travel',
    emoji: '🚗',
    description: 'Highway Bollywood favorites, uplifting Marathi folk-fusion, and night-drive synth.',
    curatorNote: 'Built for open stretches of asphalt and shifting skylines.',
    accentFrom: '#B6FF00',
    accentTo: '#9D4EDD',
    glowColor: 'rgba(182, 255, 0, 0.2)',
    coverImage: moodHorizonTravel,
  },
  {
    id: 'focus',
    name: 'Focus',
    emoji: '📚',
    description: 'Hindi lo-fi study mixes, soothing Marathi instrumentals, and deep-work beats.',
    curatorNote: 'Distraction-free flow states engineered for study and work.',
    accentFrom: '#9D4EDD',
    accentTo: '#B6FF00',
    glowColor: 'rgba(157, 78, 221, 0.22)',
    coverImage: moodNightChill,
  },
  {
    id: 'party',
    name: 'Party',
    emoji: '🎉',
    description: 'Zingaat energy, Bollywood dancefloor bangers, and euphoric festival drops.',
    curatorNote: 'Peak-hour celebration rhythms to lift the entire room.',
    accentFrom: '#B6FF00',
    accentTo: '#9D4EDD',
    glowColor: 'rgba(182, 255, 0, 0.24)',
    coverImage: moodEnergyPulse,
  },
  {
    id: 'devotional',
    name: 'Devotional',
    emoji: '🙏',
    description: 'Sacred Marathi aartis, soulful Hindi bhajans, and serene spiritual chants.',
    curatorNote: 'Grounded harmonics for prayer, gratitude, and stillness.',
    accentFrom: '#9D4EDD',
    accentTo: '#B6FF00',
    glowColor: 'rgba(157, 78, 221, 0.22)',
    coverImage: moodTranquilNature,
  },
  {
    id: 'peaceful',
    name: 'Peaceful',
    emoji: '🌿',
    description: 'Sufi serenity, calm Marathi classics, and restorative acoustic ambiance.',
    curatorNote: 'Soft natural resonance to quiet a busy mind.',
    accentFrom: '#9D4EDD',
    accentTo: '#B6FF00',
    glowColor: 'rgba(157, 78, 221, 0.2)',
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
  isLive = false,
  album?: string,
  description?: string
): Track {
  const mood = MOOD_CATEGORIES.find((m) => m.id === moodId) ?? MOOD_CATEGORIES[0];
  return {
    id,
    title,
    artist,
    ...(album ? { album } : {}),
    ...(description ? { description } : {}),
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

function createPendingTrack(
  id: string,
  title: string,
  artist: string,
  language: TrackLanguage,
  moodId: MoodId,
  keywords: string[],
  album?: string,
  description = 'Source Pending — verify or attach a playback link in the Admin Panel.'
): Track {
  const mood = MOOD_CATEGORIES.find((m) => m.id === moodId) ?? MOOD_CATEGORIES[0];
  return {
    id,
    title,
    artist,
    ...(album ? { album } : {}),
    description,
    language,
    moodId,
    provider: 'pending',
    providerTrackId: 'SOURCE_PENDING',
    durationLabel: '--:--',
    durationSeconds: 0,
    isLive: false,
    artworkUrl: mood.coverImage,
    fallbackArtwork: mood.coverImage,
    keywords: [...keywords, language.toLowerCase()],
  };
}

export const TRACKS: Track[] = [
  // WORKOUT 🔥 (Merged Workout + Motivation + 36 Curated Hindi & Marathi Power Anthems)
  createTrack(
    'wk-hi-1',
    'Zinda',
    'Siddharth Mahadevan · Shankar-Ehsaan-Loy',
    'Hindi',
    'workout',
    'gdqFLjWU8x8',
    '3:30',
    210,
    ['workout', 'motivation', 'hindi', 'bollywood', 'bhaag milkha bhaag', 'zinda', 'running'],
    false,
    'Bhaag Milkha Bhaag'
  ),
  createTrack(
    'wk-hi-sultan',
    'Sultan',
    'Sukhwinder Singh & Shadab Faridi · Vishal & Shekhar',
    'Hindi',
    'workout',
    'abiL84EAWSY',
    '4:40',
    280,
    ['workout', 'motivation', 'hindi', 'sultan', 'bollywood', 'gym'],
    false,
    'Sultan'
  ),
  createTrack(
    'mt-hi-1',
    'Kar Har Maidaan Fateh',
    'Sukhwinder Singh & Shreya Ghoshal',
    'Hindi',
    'workout',
    '9iIX4PBplAY',
    '5:11',
    311,
    ['workout', 'motivation', 'hindi', 'sanju', 'anthem', 'inspiration'],
    false,
    'Sanju'
  ),
  createTrack(
    'wk-hi-apna-time',
    'Apna Time Aayega',
    'Ranveer Singh · DIVINE & Dub Sharma',
    'Hindi',
    'workout',
    'jFGKJBPFdUA',
    '2:21',
    141,
    ['workout', 'motivation', 'hindi', 'gully boy', 'rap', 'hustle'],
    false,
    'Gully Boy'
  ),
  createTrack(
    'wk-hi-sher-aaya',
    'Sher Aaya Sher',
    'DIVINE · Major C',
    'Hindi',
    'workout',
    'M81wneSjQbA',
    '2:35',
    155,
    ['workout', 'motivation', 'hindi', 'gully boy', 'divine', 'rap'],
    false,
    'Gully Boy'
  ),
  createTrack(
    'wk-hi-malhari',
    'Malhari',
    'Vishal Dadlani · Sanjay Leela Bhansali',
    'Hindi',
    'workout',
    'YUH9jD__qHY',
    '4:05',
    245,
    ['workout', 'motivation', 'hindi', 'bajirao mastani', 'power', 'cardio'],
    false,
    'Bajirao Mastani'
  ),
  createTrack(
    'wk-hi-sadda-haq',
    'Sadda Haq',
    'Mohit Chauhan · A.R. Rahman',
    'Hindi',
    'workout',
    'p9DQINKZxWE',
    '6:01',
    361,
    ['workout', 'motivation', 'hindi', 'rockstar', 'rock', 'rebellion'],
    false,
    'Rockstar'
  ),
  createTrack(
    'wk-hi-dangal',
    'Dangal',
    'Daler Mehndi · Pritam',
    'Hindi',
    'workout',
    'bp-KoLN-6G0',
    '4:59',
    299,
    ['workout', 'motivation', 'hindi', 'dangal', 'training', 'strength'],
    false,
    'Dangal'
  ),
  createTrack(
    'wk-hi-chak-lein',
    'Chak Lein De',
    'Kailash Kher · Kailasa',
    'Hindi',
    'workout',
    'sJpUbYvjgyg',
    '4:23',
    263,
    ['workout', 'motivation', 'hindi', 'chandni chowk to china', 'grit'],
    false,
    'Chandni Chowk to China'
  ),
  createTrack(
    'wk-hi-brothers',
    'Brothers Anthem',
    'Vishal Dadlani · Ajay-Atul',
    'Hindi',
    'workout',
    'lcs_GXu8IA0',
    '5:53',
    353,
    ['workout', 'motivation', 'hindi', 'brothers', 'training', 'boxing'],
    false,
    'Brothers'
  ),
  createPendingTrack(
    'wk-hi-jashn-rock',
    'Jashn-E-Bahaaraa (Rock Version)',
    'Javed Ali · A.R. Rahman',
    'Hindi',
    'workout',
    ['workout', 'motivation', 'hindi', 'jashn-e-bahaaraa', 'rock version'],
    'Jodhaa Akbar',
    'Source Pending — attach a verified Rock Version YouTube ID or authorized audio URL in Admin Panel.'
  ),
  createTrack(
    'wk-hi-lakshya',
    'Lakshya',
    'Shankar Mahadevan · Shankar-Ehsaan-Loy',
    'Hindi',
    'workout',
    'sSsw7QPrUk0',
    '6:15',
    375,
    ['workout', 'motivation', 'hindi', 'lakshya', 'focus', 'anthem'],
    false,
    'Lakshya'
  ),
  createTrack(
    'wk-hi-aarambh',
    'Aarambh Hai Prachand',
    'Piyush Mishra',
    'Hindi',
    'workout',
    'x9feF5rtMAc',
    '5:10',
    310,
    ['workout', 'motivation', 'hindi', 'gulaal', 'aarambh', 'war cry'],
    false,
    'Gulaal'
  ),
  createTrack(
    'wk-hi-ghamand',
    'Ghamand Kar',
    'Sachet Tandon & Parampara Thakur · Avdhoot Gupte',
    'Hindi',
    'workout',
    'n4V6yaDGOwk',
    '4:42',
    282,
    ['workout', 'motivation', 'hindi', 'tanhaji', 'power'],
    false,
    'Tanhaji'
  ),
  createTrack(
    'wk-hi-sari-duniya',
    'Sari Duniya Jala Denge',
    'B Praak · Jaani',
    'Hindi',
    'workout',
    '6OXfgu8uKnE',
    '3:02',
    182,
    ['workout', 'motivation', 'hindi', 'animal', 'intense'],
    false,
    'Animal'
  ),
  createTrack(
    'wk-hi-tere-ishq',
    'Tere Ishq Mein – Title Track',
    'Arijit Singh · A.R. Rahman',
    'Hindi',
    'workout',
    'nmshEZ11obI',
    '4:15',
    255,
    ['workout', 'motivation', 'hindi', 'tere ishk mein', 'rahman'],
    false,
    'Tere Ishk Mein'
  ),
  createTrack(
    'wk-hi-paisa-hai',
    'Paisa Hai Toh Badi Badi Baatein',
    'Vishal Dadlani & MellowD · Sachin-Jigar',
    'Hindi',
    'workout',
    'RCvgKHadHrw',
    '3:08',
    188,
    ['workout', 'motivation', 'hindi', 'farzi', 'hustle', 'beats'],
    false,
    'Farzi'
  ),
  createTrack(
    'wk-hi-yalgaar',
    'Yalgaar',
    'CarryMinati & Wily Frenzy',
    'Hindi',
    'workout',
    'zzwRbKI2pn4',
    '3:15',
    195,
    ['workout', 'motivation', 'hindi', 'carryminati', 'rap', 'energy'],
    false,
    'Yalgaar'
  ),
  createTrack(
    'wk-hi-company',
    'Company',
    'Emiway Bantai',
    'Hindi',
    'workout',
    'ocJ3O-BbXqg',
    '3:34',
    214,
    ['workout', 'motivation', 'hindi', 'emiway bantai', 'hip hop'],
    false,
    'Company'
  ),
  createTrack(
    'wk-hi-rocky-bhai',
    'Salaam Rocky Bhai',
    'Vijay Prakash & Ensemble · Ravi Basrur',
    'Hindi',
    'workout',
    '6Hvc-xpNTME',
    '4:05',
    245,
    ['workout', 'motivation', 'hindi', 'kgf', 'rocky bhai', 'mass'],
    false,
    'KGF: Chapter 1'
  ),
  createTrack(
    'wk-hi-aaya-toofan',
    'Aaya Re Toofan',
    'A.R. Rahman & Vaishali Samant',
    'Hindi',
    'workout',
    'x2J1qbndOmU',
    '4:38',
    278,
    ['workout', 'motivation', 'hindi', 'chhaava', 'toofan', 'anthem'],
    false,
    'Chhaava'
  ),
  createTrack(
    'wk-hi-bismil',
    'Bismil',
    'Sukhwinder Singh · Vishal Bhardwaj',
    'Hindi',
    'workout',
    'gYCEaxiPl4Y',
    '5:49',
    349,
    ['workout', 'motivation', 'hindi', 'haider', 'dramatic'],
    false,
    'Haider'
  ),
  createTrack(
    'wk-hi-dhashananna',
    'Dhashananna',
    'Kailash Kher · Saurabh Mehta',
    'Hindi',
    'workout',
    'vl49qSFz83k',
    '4:12',
    252,
    ['workout', 'motivation', 'hindi', 'dashanan', 'humare ram', 'epic'],
    false,
    'Humare Ram'
  ),
  createTrack(
    'wk-hi-veezga-veera',
    'Veezga Veera',
    'Sai Abhyankkar',
    'Hindi',
    'workout',
    'u18BIx68l1E',
    '3:36',
    216,
    ['workout', 'motivation', 'veezha veera', 'om', 'power'],
    false,
    'OM Chapter 1: Udhiram'
  ),
  createTrack(
    'wk-hi-awara-anjaana',
    'Awara Anjaana',
    'Faheem Abdullah · A.R. Rahman',
    'Hindi',
    'workout',
    'Qhwafoo7Pnc',
    '4:10',
    250,
    ['workout', 'motivation', 'hindi', 'aawaara angaara', 'tere ishk mein'],
    false,
    'Tere Ishk Mein'
  ),
  createTrack(
    'wk-hi-o-shera',
    'O Shera',
    'Manmohan Waris, Kamal Heer, Sangtar & Shashwat Sachdev',
    'Hindi',
    'workout',
    'WVMSjMtPbq0',
    '3:52',
    232,
    ['workout', 'motivation', 'hindi', 'kesari chapter 2', 'o shera'],
    false,
    'Kesari Chapter 2'
  ),
  createTrack(
    'wk-hi-boom-shaka',
    'Boom Shaka',
    'KR$NA & Dhanda Nyoliwala',
    'Hindi',
    'workout',
    'KxCr-ie_v1s',
    '3:05',
    185,
    ['workout', 'motivation', 'hindi', 'krsna', 'rap', 'pump'],
    false,
    'Boom Shaka'
  ),
  createTrack(
    'wk-hi-aari-aari',
    'Aari Aari',
    'Bombay Rockers & Shashwat Sachdev',
    'Hindi',
    'workout',
    'N0LAlTOU2jc',
    '3:18',
    198,
    ['workout', 'motivation', 'hindi', 'dhurandhar', 'bhangra', 'cardio'],
    false,
    'Dhurandhar The Revenge'
  ),
  createTrack(
    'wk-hi-yeda-yung',
    'Yeda Yung',
    'Yung DSA & Year Down',
    'Hindi',
    'workout',
    'Ym4ti89tItw',
    '2:58',
    178,
    ['workout', 'motivation', 'hindi', 'yung dsa', 'gully gang', 'hip hop'],
    false,
    'Gully Gang Records'
  ),
  createTrack(
    'wk-mr-raja-aala',
    'Raja Aala',
    'Devdutta Manisha Baji & Suvarna Rathod',
    'Marathi',
    'workout',
    'LMgVnhNpcFc',
    '3:55',
    235,
    ['workout', 'motivation', 'marathi', 'pawankhind', 'raja aala', 'shivaji maharaj'],
    false,
    'Pawankhind'
  ),
  createTrack(
    'wk-mr-shivba-raja',
    'Shivba Raja',
    'Avadhoot Gandhi & Devdutta Manisha Baji',
    'Marathi',
    'workout',
    '7svhUsjZbbY',
    '4:08',
    248,
    ['workout', 'motivation', 'marathi', 'pawankhind', 'shwasat raja dhyasat raja'],
    false,
    'Pawankhind'
  ),
  createTrack(
    'wk-mr-vijetha',
    'Vijetha',
    'Avadhoot Gupte · Rohan-Rohan',
    'Marathi',
    'workout',
    'pczCV1qtXS4',
    '4:02',
    242,
    ['workout', 'motivation', 'marathi', 'vijeta', 'sports', 'victory'],
    false,
    'Vijeta'
  ),
  createTrack(
    'wk-mr-saat-daudale',
    'Saat Daudale',
    'Anand Shinde · Narendra Bhide',
    'Marathi',
    'workout',
    'p4BDdOP47Fw',
    '4:18',
    258,
    ['workout', 'motivation', 'marathi', 'sarsenapati hambirrao', 'battle'],
    false,
    'Sarsenapati Hambirrao'
  ),
  createTrack(
    'wk-mr-payee-pufata',
    'Payee Pufata',
    'Ajay Gogavale · Guru Thakur',
    'Marathi',
    'workout',
    'X5THyXnyxv4',
    '3:48',
    228,
    ['workout', 'motivation', 'marathi', 'lagan', 'ajay gogavale'],
    false,
    'Lagan'
  ),
  createTrack(
    'wk-mr-rubab-pahije',
    'Rubab Pahije',
    'Harshavardhan Wavare · G.V. Prakash Kumar',
    'Marathi',
    'workout',
    'yZmQ16EIvrU',
    '3:32',
    212,
    ['workout', 'motivation', 'marathi', 'half ticket', 'attitude'],
    false,
    'Half Ticket'
  ),
  createTrack(
    'wk-mr-hai-jammalo',
    'Hai Jammalo',
    'Sachin-Jigar feat. Nakash Aziz & Skeletron',
    'Marathi',
    'workout',
    'cncXEgZt-EI',
    '3:12',
    192,
    ['workout', 'motivation', 'marathi', 'munjya', 'hai jamalo', 'beats'],
    false,
    'Munjya'
  ),
  // Preserved existing Workout & Motivation tracks
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
  createTrack(
    'mt-mr-1',
    'Mauli Mauli (Lai Bhaari)',
    'Ajay Gogavale · Ajay-Atul',
    'Marathi',
    'workout',
    'XbIY_OgQIEw',
    '4:52',
    292,
    ['workout', 'motivation', 'marathi', 'mauli', 'power', 'strength']
  ),
  createTrack(
    'mt-en-1',
    'Mortals',
    'Warriyo feat. Laura Brehm',
    'English',
    'workout',
    'yJg-Y5byMMw',
    '3:48',
    228,
    ['workout', 'motivation', 'epic', 'energy', 'drive']
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
