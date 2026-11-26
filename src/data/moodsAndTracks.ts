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
    description: 'Soul-stirring Hindi ballads, emotional Marathi melodies, and solo piano.',
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
    description: 'Timeless Hindi love songs, soulful Marathi duets, and candlelit piano.',
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
    description: 'High-energy Marathi beats, Bollywood dancefloor bangers, and euphoric festival drops.',
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

const ytThumb = (videoId: string) =>
  `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

function createLoveTrack(
  id: string,
  title: string,
  artist: string,
  language: string,
  youtubeId: string,
  keywords: string[],
  album?: string
): Track {
  const romanticMood =
    MOOD_CATEGORIES.find((m) => m.id === 'romantic') ?? MOOD_CATEGORIES[0];
  return {
    id,
    title,
    artist,
    ...(album ? { album } : {}),
    language,
    moodId: 'romantic',
    provider: 'youtube',
    providerTrackId: youtubeId,
    durationLabel: '--:--',
    durationSeconds: 0,
    isLive: false,
    artworkUrl: ytThumb(youtubeId),
    fallbackArtwork: romanticMood.coverImage,
    keywords: ['love', 'romantic', language.toLowerCase(), ...keywords],
  };
}

export const TRACKS: Track[] = [
  createLoveTrack(
    'love-01',
    'Tera Deedar Hua',
    'Javed Ali · Pritam',
    'Hindi',
    'i_HFdi1xxFM',
    ['tera deedar hua', 'javed ali', 'pritam']
  ),
  createLoveTrack(
    'love-02',
    'Chashni',
    'Abhijeet Srivastava · Vishal & Shekhar',
    'Hindi',
    'yFZvQ1Uv358',
    ['chashni', 'bharat', 'abhijeet srivastava', 'vishal shekhar'],
    'Bharat'
  ),
  createLoveTrack(
    'love-03',
    'Sweetheart (8K Video)',
    'Dev Negi',
    'Hindi',
    'HSduMaIJIlY',
    ['sweetheart', 'kedarnath', 'dev negi'],
    'Kedarnath'
  ),
  createLoveTrack(
    'love-04',
    'Dhichkyaaon Doom Doom',
    'Ali Zafar & Shreya Ghoshal · Sajid-Wajid',
    'Hindi',
    'dXIo8ZMnCSI',
    ['dhichkyaaon doom doom', 'chashme baddoor', 'ali zafar', 'shreya ghoshal'],
    'Chashme Baddoor'
  ),
  createLoveTrack(
    'love-05',
    'Raanjhanaa',
    'Jaswinder Singh & Shiraz Uppal · A. R. Rahman',
    'Hindi',
    '75o1iC1OSrE',
    ['raanjhanaa', 'a r rahman', 'jaswinder singh', 'shiraz uppal'],
    'Raanjhanaa'
  ),
  createLoveTrack(
    'love-06',
    'Sweetheart',
    'Dev Negi · Amit Trivedi',
    'Hindi',
    '58r8MDf5sxQ',
    ['sweetheart', 'kedarnath', 'dev negi', 'amit trivedi'],
    'Kedarnath'
  ),
  createLoveTrack(
    'love-07',
    'Dagabaaz Re',
    'Rahat Fateh Ali Khan & Shreya Ghoshal',
    'Hindi',
    '0KozfDYK1EU',
    ['dagabaaz re', 'dabangg 2', 'rahat fateh ali khan', 'shreya ghoshal'],
    'Dabangg 2'
  ),
  createLoveTrack(
    'love-08',
    'Navasachi Gauri Mazi',
    'Abhay J, Sanket Sane',
    'Marathi',
    'lP6Uw4F3VHg',
    ['navasachi gauri mazi', 'gharat ganpati', 'abhay j', 'sanket sane'],
    'घरत गणपती'
  ),
  createLoveTrack(
    'love-09',
    'O Meri Laila',
    'Jyotica Tangri · Joi, Irshad',
    'Hindi',
    '49x8GA2axfc',
    ['o meri laila', 'laila majnu', 'jyotica tangri'],
    'Laila Majnu'
  ),
  createLoveTrack(
    'love-10',
    'Aashiq Tera',
    'Altamash Faridi · Sohail Sen',
    'Hindi',
    'l7fK-yMkN-o',
    ['aashiq tera', 'happy bhag jayegi', 'altamash faridi', 'sohail sen'],
    'Happy Bhag Jayegi'
  ),
  createLoveTrack(
    'love-11',
    'Tere Mast Mast Do Nain',
    'Rahat Fateh Ali Khan & Shreya Ghoshal',
    'Hindi',
    'qTxpIeyo-_g',
    ['tere mast mast do nain', 'dabangg', 'rahat fateh ali khan', 'shreya ghoshal'],
    'Dabangg'
  ),
  createLoveTrack(
    'love-12',
    'Zaalima (ज़ालिमा)',
    'Arijit Singh & Harshdeep Kaur · JAM8-Pritam',
    'Hindi',
    '53dBXLd6ImA',
    ['zaalima', 'raees', 'arijit singh', 'harshdeep kaur', 'pritam'],
    'Raees'
  ),
  createLoveTrack(
    'love-13',
    'Aankhon Mein Teri Ajab Si',
    'K.K.',
    'Hindi',
    '7KKVb0_IdD4',
    ['aankhon mein teri', 'ajab si', 'om shanti om', 'kk'],
    'Om Shanti Om'
  ),
  createLoveTrack(
    'love-14',
    'Main Rang Sharbaton Ka',
    'Arijit Singh',
    'Hindi',
    'RBCk1SyC1PA',
    ['main rang sharbaton ka', 'arijit singh', 'phata poster nikhla hero'],
    'Phata Poster Nikhla Hero'
  ),
  createLoveTrack(
    'love-15',
    'Rishte Naate',
    'Rahat Fateh Ali Khan · Pritam',
    'Hindi',
    '4IdgrshIpU4',
    ['rishte naate', 'de dana dan', 'rahat fateh ali khan', 'pritam'],
    'De Dana Dan'
  ),
  createLoveTrack(
    'love-16',
    'Tum Tak',
    'Javed Ali, Kirti S · A. R. Rahman',
    'Hindi',
    '_vFaCY9XaIQ',
    ['tum tak', 'raanjhanaa', 'javed ali', 'a r rahman'],
    'Raanjhanaa'
  ),
  createLoveTrack(
    'love-17',
    'Manwa Laage',
    'Arijit Singh',
    'Hindi',
    'd8IT-16kA8M',
    ['manwa laage', 'happy new year', 'arijit singh'],
    'Happy New Year'
  ),
  createLoveTrack(
    'love-18',
    'Rabba',
    'Mohit Chauhan',
    'Hindi',
    'o4mHtJLgMLs',
    ['rabba', 'heropanti', 'mohit chauhan'],
    'Heropanti'
  ),
  createLoveTrack(
    'love-19',
    'Vatevari Mogara',
    'Vaishali Samant & Swapnil Bandodkar · Nilesh Moharir',
    'Marathi',
    'twMWmXp9mu4',
    ['vatevari mogara', 'vaishali samant', 'swapnil bandodkar', 'nilesh moharir']
  ),
  createLoveTrack(
    'love-20',
    'Sajdaa',
    'Rahat Fateh Ali Khan',
    'Hindi',
    'Vl2zhN_CfW0',
    ['sajdaa', 'my name is khan', 'rahat fateh ali khan'],
    'My Name Is Khan'
  ),
  createLoveTrack(
    'love-21',
    'Mera Yaar',
    'Javed Bashir',
    'Hindi',
    'ycS5PagXvhQ',
    ['mera yaar', 'bhaag milkha bhaag', 'javed bashir'],
    'Bhaag Milkha Bhaag'
  ),
  createLoveTrack(
    'love-22',
    'Dhaga Dhaga',
    'Harshavardhan Wavare & Anandi Joshi · Amitraj',
    'Marathi',
    '6zoKKPTzWUE',
    ['dhaga dhaga', 'daagdi chaawl', 'amitraj', 'harshavardhan wavare', 'anandi joshi'],
    'Daagdi Chaawl'
  ),
  createLoveTrack(
    'love-23',
    'Pyaar Karshil Kaay',
    'Preet Bandre & Neha Pathan',
    'Marathi',
    'TGsrv267u_E',
    ['pyaar karshil kaay', 'preet bandre', 'neha pathan']
  ),
  createLoveTrack(
    'love-24',
    'Ishq Pirman Ranglay',
    'Keval Walanj · Pravin Koli & Yogita Koli',
    'Marathi',
    'SDBXG6p36qE',
    ['ishq pirman ranglay', 'keval walanj', 'pravin koli', 'yogita koli', 'koli']
  ),
  createLoveTrack(
    'love-25',
    'Mi Naadkhula',
    'Adarsh Shinde & Sonali Sonawane',
    'Marathi',
    'MZlgZmu-q1Q',
    ['mi naadkhula', 'adarsh shinde', 'sonali sonawane']
  ),
  createLoveTrack(
    'love-26',
    'Bedhund Me',
    'Bela Shende & Hrishikesh Ranade · Avinash-Vishwajeet',
    'Marathi',
    'k8pNaXnMiwA',
    ['bedhund me', 'luckdown be positive', 'bela shende', 'hrishikesh ranade'],
    'Luckdown Be Positive'
  ),
  createLoveTrack(
    'love-27',
    'Chand Tu Nabhatla',
    'Swapnil Bandodkar · Ajit-Sameer',
    'Marathi',
    'ERWoyZ-rmHY',
    ['chand tu nabhatla', 'sandook', 'swapnil bandodkar'],
    'Sandook'
  ),
  createLoveTrack(
    'love-28',
    'Daatale Reshami',
    'Mahalaxmi Iyer & Chinar Kharkar',
    'Marathi',
    'TxpRk_8bDSw',
    ['daatale reshami', 'time pass', 'mahalaxmi iyer', 'chinar kharkar'],
    'Time Pass'
  ),
  createLoveTrack(
    'love-29',
    'सदाबहार Marathi Romantic Love Mashup',
    'Rush Melodies',
    'Marathi',
    'Of4-L1woO6o',
    ['marathi romantic love mashup', 'makhmali', 'navasachi gauri mazi', 'rush melodies']
  ),
  createLoveTrack(
    'love-30',
    'Manaat Shirali',
    'Sonu Nigam · Avadhoot Gupte',
    'Marathi',
    'WNzi94wj3Uc',
    ['manaat shirali', 'boyz 3', 'sonu nigam', 'avadhoot gupte'],
    'Boyz 3'
  ),
  createLoveTrack(
    'love-31',
    'Tu Mila',
    "Shalmali Kholgade & Nikhil D'souza",
    'Marathi',
    'WOiRc7yY5r4',
    ['tu mila', 'timepass 2', 'tp2', 'shalmali kholgade'],
    'Timepass 2'
  ),
  createLoveTrack(
    'love-32',
    'Dilachi Rani',
    'Sunny Phadke & Supriya Talkar · Prashant Nakti',
    'Marathi',
    'A0XprLOzeBg',
    ['dilachi rani', 'sunny phadke', 'supriya talkar', 'prashant nakti']
  ),
  createLoveTrack(
    'love-33',
    'Phool Parijaat',
    'Shreya Ghoshal · Ajay-Atul',
    'Marathi',
    'vqM3sYzDgcQ',
    ['phool parijaat', 'raja shivaji', 'shreya ghoshal', 'ajay atul'],
    'Raja Shivaji'
  ),
  createLoveTrack(
    'love-34',
    'Rupach Chandana (रूपाचं चांदणं)',
    'Keval Walanj & Sadhana Kakatkar',
    'Marathi',
    '-TfQkqAJL0A',
    ['rupach chandana', 'keval walanj', 'sadhana kakatkar']
  ),
  createLoveTrack(
    'love-35',
    'Raat Chandana (रात चांदणं)',
    'Keval Walanj',
    'Marathi',
    '8ImoofUWY9A',
    ['raat chandana', 'keval walanj']
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
