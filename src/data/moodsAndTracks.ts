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

function createBhaktiTrack(
  id: string,
  title: string,
  artist: string,
  language: string,
  youtubeId: string,
  keywords: string[],
  album?: string
): Track {
  const devotionalMood =
    MOOD_CATEGORIES.find((m) => m.id === 'devotional') ?? MOOD_CATEGORIES[0];
  return {
    id,
    title,
    artist,
    ...(album ? { album } : {}),
    language,
    moodId: 'devotional',
    provider: 'youtube',
    providerTrackId: youtubeId,
    durationLabel: '--:--',
    durationSeconds: 0,
    isLive: false,
    artworkUrl: ytThumb(youtubeId),
    fallbackArtwork: devotionalMood.coverImage,
    keywords: ['bhakti', 'devotional', language.toLowerCase(), ...keywords],
  };
}

function createSadTrack(
  id: string,
  title: string,
  artist: string,
  language: string,
  youtubeId: string,
  keywords: string[],
  album?: string
): Track {
  const sadMood =
    MOOD_CATEGORIES.find((m) => m.id === 'sad') ?? MOOD_CATEGORIES[0];
  return {
    id,
    title,
    artist,
    ...(album ? { album } : {}),
    language,
    moodId: 'sad',
    provider: 'youtube',
    providerTrackId: youtubeId,
    durationLabel: '--:--',
    durationSeconds: 0,
    isLive: false,
    artworkUrl: ytThumb(youtubeId),
    fallbackArtwork: sadMood.coverImage,
    keywords: ['sad', 'heartbreak', language.toLowerCase(), ...keywords],
  };
}

function createWorkoutTrack(
  id: string,
  title: string,
  artist: string,
  language: string,
  youtubeId: string,
  keywords: string[],
  album?: string
): Track {
  const workoutMood =
    MOOD_CATEGORIES.find((m) => m.id === 'workout') ?? MOOD_CATEGORIES[0];
  return {
    id,
    title,
    artist,
    ...(album ? { album } : {}),
    language,
    moodId: 'workout',
    provider: 'youtube',
    providerTrackId: youtubeId,
    durationLabel: '--:--',
    durationSeconds: 0,
    isLive: false,
    artworkUrl: ytThumb(youtubeId),
    fallbackArtwork: workoutMood.coverImage,
    keywords: ['workout', 'energetic', language.toLowerCase(), ...keywords],
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
  createBhaktiTrack(
    'bhakti-01',
    'Bhakt Chalalaa Shirdi Warila (भक्त चालला शिर्डी वारीला)',
    'Sagar Chavan',
    'Marathi',
    'cAZkhzgvPMs',
    ['bhakt chalalaa shirdi warila', 'sai palkhi bhajan', 'shirdi', 'sagar chavan']
  ),
  createBhaktiTrack(
    'bhakti-02',
    'Deva Sobat Chalalo Devachya Bhetila',
    'Omkar Mahadik · Shravan (Bala) Ingle',
    'Marathi',
    '5SNn-NLvUfA',
    ['deva sobat chalalo', 'sai', 'omkar mahadik', 'shravan ingle'],
    'Zale Tuze Darshan Sai'
  ),
  createBhaktiTrack(
    'bhakti-03',
    'Bhandupchi Saibhajan Ahe Majhya Sobtila',
    'Shree Saibhajan',
    'Marathi',
    'woz07Y5Vp6U',
    ['bhandupchi saibhajan', 'sai bhajan', 'shree saibhajan']
  ),
  createBhaktiTrack(
    'bhakti-04',
    'Tula Khandyavar Ghein (Reprise Version)',
    'Suyog Gosavi',
    'Marathi',
    'vCKirDrIXEo',
    ['tula khandyavar ghein', 'suyog gosavi']
  ),
  createBhaktiTrack(
    'bhakti-05',
    'Shirdichi Vari Baghavi (Sai Palkhi Bhajan)',
    'Adisai Mankar',
    'Marathi',
    '6CZtU7YWVIA',
    ['shirdichi vari baghavi', 'sai palkhi', 'sai bhajan', 'adisai mankar']
  ),
  createBhaktiTrack(
    'bhakti-06',
    'Magey Rahila Kasara Ghat Dharli Shirdichi Vaat',
    'Sai Bhakti',
    'Marathi',
    'Zh_thF3Kr68',
    ['magey rahila kasara ghat', 'shirdichi vaat', 'sai bhakti']
  ),
  createBhaktiTrack(
    'bhakti-07',
    'Payi Chalat Shirdila Yein',
    'Omkar Mahadik, Alpesh Mekde · Sai Swar Music',
    'Marathi',
    'IoFId0_UFuU',
    ['payi chalat shirdila yein', 'omkar mahadik', 'alpesh mekde', 'shirdi']
  ),
  createBhaktiTrack(
    'bhakti-08',
    'Nela Shirdila',
    'Raj Khambe · Vaibhav Ghanekar',
    'Marathi',
    'pKqXwVefJ8I',
    ['nela shirdila', 'sai baba', 'raj khambe', 'vaibhav ghanekar']
  ),
  createBhaktiTrack(
    'bhakti-09',
    'Jauya Payi Shirdichya Thai',
    'Swapnil Tambe · Saichha Bhajan Mandal',
    'Marathi',
    'Zzm2O2d2nyY',
    ['jauya payi shirdichya thai', 'sai baba', 'swapnil tambe']
  ),
  createBhaktiTrack(
    'bhakti-10',
    'Soduni Aalo Maze Me Ghar Daar',
    'Shreenath Chavan',
    'Marathi',
    'lUkHHT0hw3Q',
    ['soduni aalo maze me ghar daar', 'shreenath chavan']
  ),
  createBhaktiTrack(
    'bhakti-11',
    'Swapnat Aale Mazya Gurudev Datta',
    'DJ Shubham K Official',
    'Marathi',
    'XUZEwsQVi8U',
    ['swapnat aale mazya gurudev datta', 'gurudev datta', 'dj shubham k']
  ),
  createBhaktiTrack(
    'bhakti-12',
    'Swami Samarth - Majhya Hruday Mandirat',
    'Adarsh Shinde · Yogesh Anil Tawar',
    'Marathi',
    'lVMdrGas-zk',
    ['swami samarth', 'majhya hruday mandirat', 'adarsh shinde']
  ),
  createBhaktiTrack(
    'bhakti-13',
    'Swamimay Zalo (स्वामीमय झालो)',
    'Rohit Raut · Gajar Devacha',
    'Marathi',
    'Xbo8YHo3wCA',
    ['swamimay zalo', 'rohit raut', 'swami samarth', 'gajar devacha']
  ),
  createBhaktiTrack(
    'bhakti-14',
    'Jagnyache Deva (जगण्याचे देवा)',
    'Swapnil Bandodkar',
    'Marathi',
    'xaUvx0IILW4',
    ['jagnyache deva', 'dashakriya', 'swapnil bandodkar'],
    'Dashakriya'
  ),
  createBhaktiTrack(
    'bhakti-15',
    'Yei Ho Vitthale (Vitthal Aarti)',
    'Nihar Shembekar · Folk.Us',
    'Marathi',
    'oHM4zm8OdGU',
    ['yei ho vitthale', 'vitthal aarti', 'nihar shembekar', 'folk us']
  ),
  createBhaktiTrack(
    'bhakti-16',
    'Deh Vitthal (देह विठ्ठल)',
    'Avadhoot Gandhi & Prasad Prabhakar Shinde',
    'Marathi',
    'sHVUlXAvCd0',
    ['deh vitthal', 'wari', 'avadhoot gandhi', 'prasad prabhakar shinde'],
    'Wari 2024'
  ),
  createBhaktiTrack(
    'bhakti-17',
    'Rakhumai Rakhumai',
    'Amitraj · Everest Marathi',
    'Marathi',
    'RVj23ZyTcMY',
    ['rakhumai rakhumai', 'poshter girl', 'vitthal rukmini', 'amitraj'],
    'Poshter Girl'
  ),
  createBhaktiTrack(
    'bhakti-18',
    'Aamhi Pahila Vitthal',
    'Yogesh Anil Tawar, Saurabha Salunke & Prasad Shinde',
    'Marathi',
    'fjgM0DXLIOw',
    ['aamhi pahila vitthal', 'vari song', 'yogesh anil tawar', 'saurabha salunke', 'prasad shinde']
  ),
  createBhaktiTrack(
    'bhakti-19',
    'Vithu Rayachi Nagari',
    'Dravesh Patil · Pankaj Harad',
    'Marathi',
    'BelCkZxsdRI',
    ['vithu rayachi nagari', 'dravesh patil', 'pankaj harad', 'vitthal']
  ),
  createBhaktiTrack(
    'bhakti-20',
    'Ringan (रिंगण · रंगी तुझ्या सोहळ्याच्या रिंगणी)',
    'Adarsh Shinde',
    'Marathi',
    'WUCSBZ23z90',
    ['ringan', 'rangi tuzya sohalyachya ringani', 'adarsh shinde', 'wari'],
    'Wari 2020'
  ),
  createBhaktiTrack(
    'bhakti-21',
    'Majha Vitthal (माझा विठ्ठल)',
    'Ajay Gogavale · Abhinay Jagtap',
    'Marathi',
    'JBAyL9eu0C4',
    ['majha vitthal', 'danka hari namacha', 'ajay gogavale', 'abhinay jagtap'],
    'Danka Hari Namacha'
  ),
  createBhaktiTrack(
    'bhakti-22',
    'Nazar Kadh Deva',
    'Bhakti chhand (भक्ती छंद)',
    'Marathi',
    'schSLWVM_gA',
    ['nazar kadh deva', 'bhakti chhand']
  ),
  createBhaktiTrack(
    'bhakti-23',
    'Swami (स्वामी)',
    'Avdhoot Gandhi · Brahmaa & Narhar',
    'Marathi',
    'WY7mogD-o3I',
    ['swami', 'swami samarth', 'avdhoot gandhi', 'brahmaa']
  ),
  createBhaktiTrack(
    'bhakti-24',
    'Sai Digambara',
    'Ajay Gogavale · Aditya Satpute & Nitin Ugalmugle',
    'Marathi',
    'YnOhMpOZ0Pw',
    ['sai digambara', 'sai baba', 'ajay gogavale']
  ),
  createBhaktiTrack(
    'bhakti-25',
    'Mauli Swami Samartha',
    'Adarsh Shinde',
    'Marathi',
    '6B5I7r3iFxs',
    ['mauli swami samartha', 'swami samarth', 'adarsh shinde']
  ),
  createBhaktiTrack(
    'bhakti-26',
    'Vithu (विठू)',
    'Reyan Wavre · Pravin Koli & Yogita Koli',
    'Marathi',
    'usFJYr7DUXw',
    ['vithu', 'vaari', 'reyan wavre', 'pravin koli', 'yogita koli']
  ),
  createBhaktiTrack(
    'bhakti-27',
    'Ba Vitthala Dhav Pav Re (बा विठ्ठल धाव पाव रे)',
    'Suresh Wadkar (सुरेश वाडकर)',
    'Marathi',
    '5VVZaKnfkaI',
    ['ba vitthala dhav pav re', 'hari om vithala', 'suresh wadkar'],
    'Hari Om Vithala'
  ),
  createBhaktiTrack(
    'bhakti-28',
    'Mauli Mauli (माऊली माऊली)',
    'Ajay-Atul',
    'Marathi',
    '3fgxIrJ_VXo',
    ['mauli mauli', 'ajay atul', 'vitthal']
  ),
  createBhaktiTrack(
    'bhakti-29',
    'Malvat',
    'Ajay Gogavale · Vijay Gavande',
    'Marathi',
    'fbv1dyRiav0',
    ['malvat', 'soyrik', 'ajay gogavale', 'vijay gavande', 'navratri'],
    'Soyrik (सोयरीक)'
  ),
  createBhaktiTrack(
    'bhakti-30',
    'Lallati Bhandar',
    'Ajay-Atul',
    'Marathi',
    '6qwOQe2BiYY',
    ['lallati bhandar', 'jogwa', 'ajay atul'],
    'Jogwa'
  ),
  createBhaktiTrack(
    'bhakti-31',
    'Majhi Mauli',
    'Tejas Padave · Kiran Ghanekar',
    'Marathi',
    'td5JgDcfsoA',
    ['majhi mauli', 'tejas padave', 'kiran ghanekar']
  ),
  createBhaktiTrack(
    'bhakti-32',
    'Aai Tuza Dongar (आई तुझा डोंगर)',
    'Amol Jadhav · Sai Swar Music',
    'Marathi',
    'hCCKT7Bub_Y',
    ['aai tuza dongar', 'ekveera aai', 'amol jadhav', 'sai swar music']
  ),
  createBhaktiTrack(
    'bhakti-33',
    'Ambabai Gondhalala Ye',
    'Ajay Gogavale',
    'Marathi',
    'sx2W-g3bhvI',
    ['ambabai gondhalala ye', 'ambabai', 'ajay gogavale']
  ),
  createBhaktiTrack(
    'bhakti-34',
    'Aaicha Udo Udo',
    'Adarsh Shinde',
    'Marathi',
    'L98WGIPkUQ0',
    ['aaicha udo udo', 'kho kho', 'adarsh shinde'],
    'Kho Kho'
  ),
  createBhaktiTrack(
    'bhakti-35',
    'Aaicha Sohala',
    'Mukesh Upadhye & Shakambhari · Pravin Koli & Yogita Koli',
    'Marathi',
    '4_MHICgXgVs',
    ['aaicha sohala', 'ekveera aai', 'mukesh upadhye', 'pravin koli', 'yogita koli']
  ),
  createBhaktiTrack(
    'bhakti-36',
    'Jaise Jayache Karma (जैसे ज्याचे कर्म)',
    'Prahlad Shinde',
    'Marathi',
    'FLlAlD4Q7aA',
    ['jaise jayache karma', 'prahlad shinde']
  ),
  createSadTrack(
    'sad-01',
    'Vo Nahin',
    'A. R. Rahman · Adithya RK, Armaan, Sameer',
    'Hindi',
    'X_v1PTg9jEc',
    ['vo nahin', 'main vaapas aaunga', 'ar rahman', 'imtiaz ali', 'irshad kamil'],
    'Main Vaapas Aaunga'
  ),
  createSadTrack(
    'sad-02',
    'Bulleya x Yeh Tune Kya Kiya (Mashup)',
    'Swaroop Pandey',
    'Hindi',
    'Iw8NxpQMVzs',
    ['bulleya', 'yeh tune kya kiya', 'mashup', 'swaroop pandey']
  ),
  createSadTrack(
    'sad-03',
    'Tum Nazar Mein Raho',
    'Niladri K · Zee Music Company',
    'Hindi',
    'PZtFYkMYyJA',
    ['tum nazar mein raho', 'laila majnu', 'niladri k'],
    'Laila Majnu'
  ),
  createSadTrack(
    'sad-04',
    'Darmiyaan',
    'Shafqat Amanat Ali Khan · Clinton Cerejo',
    'Hindi',
    '4oPHBP4E4sk',
    ['darmiyaan', 'shafqat amanat ali khan', 'clinton cerejo']
  ),
  createSadTrack(
    'sad-05',
    'Kyun Main Jaagoon',
    'T-Series',
    'Hindi',
    'lN1m7zLBbSU',
    ['kyun main jaagoon', 'patiala house'],
    'Patiala House'
  ),
  createSadTrack(
    'sad-06',
    'Jiyein Kyun',
    'Aditya Yadav',
    'Hindi',
    '1aQTCPxZre8',
    ['jiyein kyun', 'dum maaro dum', 'raat baaki hai'],
    'Dum Maaro Dum'
  ),
  createSadTrack(
    'sad-07',
    'Agar Tum Saath Ho',
    'Alka Yagnik & Arijit Singh',
    'Hindi',
    'dhY8jRNELUc',
    ['agar tum saath ho', 'tamasha', 'alka yagnik', 'arijit singh'],
    'Tamasha'
  ),
  createSadTrack(
    'sad-08',
    'Kabira',
    'Pritam · T-Series',
    'Hindi',
    'jHNNMj5bNQw',
    ['kabira', 'yeh jawaani hai deewani', 'pritam'],
    'Yeh Jawaani Hai Deewani'
  ),
  createSadTrack(
    'sad-09',
    'Aasman Rootha',
    'Swanand Kirkire, Anurag Saikia, JUNO',
    'Hindi',
    '57ATmXx-uUk',
    ['aasman rootha', 'panchayat season 3', 'swanand kirkire', 'anurag saikia'],
    'Panchayat Season 3'
  ),
  createSadTrack(
    'sad-10',
    'Kaakan',
    'Shankar Mahadevan',
    'Marathi',
    '9HNx1NIwdAc',
    ['kaakan', 'shankar mahadevan', 'marathi'],
    'Kaakan'
  ),
  createSadTrack(
    'sad-11',
    'Long Time No See',
    'Taimour Baig ft. AUR · Raffey Anwar',
    'Hindi',
    'ko7YMs9Q3KU',
    ['long time no see', 'taimour baig', 'aur', 'raffey anwar']
  ),
  createSadTrack(
    'sad-12',
    'Sunya Sunya',
    'Ketaki Mategaonkar & Adarsh Shinde',
    'Marathi',
    'RXjaD4667h0',
    ['sunya sunya', 'timepass 2', 'ketaki mategaonkar', 'adarsh shinde'],
    'TimePass 2'
  ),
  createSadTrack(
    'sad-13',
    'Samay Samjhayega (Tum Prem Ho Sad LoFi)',
    'Mohit Lalwani · Bharat Kamal',
    'Hindi',
    '6ZwwapPikyQ',
    ['samay samjhayega', 'tum prem ho', 'radha krishn', 'mohit lalwani', 'lofi'],
    'Radha Krishn'
  ),
  createSadTrack(
    'sad-14',
    'Tu Hai Kahan',
    'AUR',
    'Hindi',
    'AX6OrbgS8lI',
    ['tu hai kahan', 'aur']
  ),
  createSadTrack(
    'sad-15',
    'Har Kisi Ko',
    'Arijit Singh',
    'Hindi',
    'PhkFADLMe_M',
    ['har kisi ko', 'arijit singh']
  ),
  createSadTrack(
    'sad-16',
    'Channa Mereya',
    'Arijit Singh · Pritam',
    'Hindi',
    '284Ov7ysmfA',
    ['channa mereya', 'ae dil hai mushkil', 'adhm', 'arijit singh', 'pritam'],
    'Ae Dil Hai Mushkil'
  ),
  createSadTrack(
    'sad-17',
    'Kun Faya Kun',
    'A. R. Rahman, Javed Ali, Mohit Chauhan',
    'Hindi',
    'T94PHkuydcw',
    ['kun faya kun', 'rockstar', 'ar rahman', 'javed ali', 'mohit chauhan'],
    'Rockstar'
  ),
  createSadTrack(
    'sad-18',
    'Channa Mereya (Lyric Video)',
    'Arijit Singh · Pritam',
    'Hindi',
    'MEGD2IXbqYo',
    ['channa mereya', 'ae dil hai mushkil', 'arijit singh', 'pritam'],
    'Ae Dil Hai Mushkil'
  ),
  createSadTrack(
    'sad-19',
    'Ye Fitoor Mera',
    'Arijit Singh',
    'Hindi',
    'OsLlPMQ9Uds',
    ['ye fitoor mera', 'arijit singh']
  ),
  createSadTrack(
    'sad-20',
    'Maine Royaan',
    'Tanveer Evan',
    'Hindi',
    'xAOoAg8YBdk',
    ['maine royaan', 'tanveer evan']
  ),
  createSadTrack(
    'sad-21',
    'Nazar Lagi',
    'Goldie Sohel & Asees Kaur',
    'Hindi',
    'fVrlp1r2lmE',
    ['nazar lagi', 'goldie sohel', 'asees kaur']
  ),
  createSadTrack(
    'sad-22',
    'Chaap Tilak',
    'Nakash Aziz',
    'Hindi',
    'xtJcd3xPJn4',
    ['chaap tilak', 'nakash aziz']
  ),
  createSadTrack(
    'sad-23',
    'Khat',
    'Navjot Ahuja',
    'Hindi',
    'MSYLJSfhUzk',
    ['khat', 'navjot ahuja']
  ),
  createSadTrack(
    'sad-24',
    'Jo Tum Mere Ho',
    'Anuv Jain',
    'Hindi',
    'JKuJypYI12Q',
    ['jo tum mere ho', 'anuv jain']
  ),
  createSadTrack(
    'sad-25',
    'Aaoge Tum Kabhi',
    'The Local Train',
    'Hindi',
    'ti_ZsBpxnSw',
    ['aaoge tum kabhi', 'the local train']
  ),
  createSadTrack(
    'sad-26',
    'Choo Lo',
    'The Local Train',
    'Hindi',
    'P3_1QzZqEYg',
    ['choo lo', 'the local train']
  ),
  createSadTrack(
    'sad-27',
    'Dhoonde Ankhiyaan',
    'Yasser Desai & Altamash Faridi',
    'Hindi',
    'JVzq67IBBbw',
    ['dhoonde ankhiyaan', 'yasser desai', 'altamash faridi']
  ),
  createSadTrack(
    'sad-28',
    'Bin Tere',
    'Shafqat Amanat Ali & Sunidhi Chauhan',
    'Hindi',
    'FeH3hpQE6LU',
    ['bin tere', 'shafqat amanat ali', 'sunidhi chauhan']
  ),
  createSadTrack(
    'sad-29',
    'Mere Dholna 3.0',
    'Sonu Nigam',
    'Hindi',
    'e9sBhzRKzGk',
    ['mere dholna 3.0', 'sonu nigam']
  ),
  createWorkoutTrack(
    'workout-01',
    'Zinda',
    'Siddharth Mahadevan',
    'Hindi',
    'Ax0G_P2dSBw',
    ['zinda', 'bhaag milkha bhaag', 'siddharth mahadevan', 'motivation', 'anthem'],
    'Bhaag Milkha Bhaag'
  ),
  createWorkoutTrack(
    'workout-02',
    'Dangal (Title Track)',
    'Daler Mehndi · Pritam',
    'Hindi',
    '91ZI3IrojMU',
    ['dangal', 'daler mehndi', 'pritam', 'motivation', 'anthem'],
    'Dangal'
  ),
  createWorkoutTrack(
    'workout-03',
    'Chak Lein De',
    'Kailash Kher',
    'Hindi',
    'kd-6aw99DpA',
    ['chak lein de', 'chandni chowk to china', 'kailash kher', 'motivation', 'anthem'],
    'Chandni Chowk To China'
  ),
  createWorkoutTrack(
    'workout-04',
    'The Warli Revolt',
    'Swadesi ft. Prakash Bhoir',
    'Marathi',
    'sYADNgIkelY',
    ['the warli revolt', 'swadesi', 'prakash bhoir', 'motivation', 'anthem']
  ),
  createWorkoutTrack(
    'workout-05',
    'Naad Karaycha Naay',
    'Avdhoot Gupte',
    'Marathi',
    'x_RnH399VjQ',
    ['naad karaycha naay', 'avdhoot gupte', 'motivation', 'anthem']
  ),
  createWorkoutTrack(
    'workout-06',
    'Aale Marathe (आले मराठे)',
    'Devdutta Baji · Digpal Lanjekar',
    'Marathi',
    'fPYy20TkvYI',
    ['aale marathe', 'subhedar', 'devdutta baji', 'motivation', 'anthem'],
    'Subhedar'
  ),
  createWorkoutTrack(
    'workout-07',
    'Fire Song (Hindi)',
    'B Praak · Devi Sri Prasad',
    'Hindi',
    'QxqAnkt4uwY',
    ['fire song', 'kanguva', 'b praak', 'devi sri prasad', 'motivation', 'anthem'],
    'Kanguva'
  ),
  createWorkoutTrack(
    'workout-08',
    'The Chhatrapati’s AURA (Shivaji Maharaj Workout Mashup)',
    'Electrolesh',
    'Marathi',
    'bD4kyNfzbgo',
    ['chhatrapati aura', 'shivaji maharaj', 'workout mashup', 'electrolesh', 'motivation', 'anthem']
  ),
  createWorkoutTrack(
    'workout-09',
    'Ghamand Kar',
    'Sachet - Parampara',
    'Hindi',
    '3qKi29UR2g4',
    ['ghamand kar', 'tanhaji', 'sachet parampara', 'motivation', 'anthem'],
    'Tanhaji: The Unsung Warrior'
  ),
  createWorkoutTrack(
    'workout-10',
    'Tuzya Priticha Vinchu Chawla',
    'Ajay Gogavale',
    'Marathi',
    'ET7JalQFxlM',
    ['tuzya priticha vinchu chawla', 'ajay gogavale', 'anthem']
  ),
  createWorkoutTrack(
    'workout-11',
    'Aaya Re Toofan',
    'A. R. Rahman & Vaishali S.',
    'Hindi',
    'pxZTbeobtW0',
    ['aaya re toofan', 'chhaava', 'ar rahman', 'vaishali', 'motivation', 'anthem'],
    'Chhaava'
  ),
  createWorkoutTrack(
    'workout-12',
    'Mann Mein Shiva',
    'Ajay - Atul',
    'Hindi',
    'fuP_AFxPxuw',
    ['mann mein shiva', 'panipat', 'ajay atul', 'motivation', 'anthem'],
    'Panipat'
  ),
  createWorkoutTrack(
    'workout-13',
    'Bring It On',
    'Ajay-Atul',
    'Marathi',
    'zkt7DfOUlyM',
    ['bring it on', 'jaundya na balasaheb', 'ajay atul', 'anthem'],
    'Jaundya Na Balasaheb'
  ),
  createWorkoutTrack(
    'workout-14',
    'Ararara',
    'Adarsh Shinde · Narendra Bhide',
    'Marathi',
    'F4_La1CbFv0',
    ['ararara', 'mulshi pattern', 'adarsh shinde', 'motivation', 'anthem'],
    'Mulshi Pattern'
  ),
  createWorkoutTrack(
    'workout-15',
    'Zingaat',
    'Ajay-Atul',
    'Marathi',
    '2gcsgfzqN8k',
    ['zingaat', 'sairat', 'ajay atul', 'anthem'],
    'Sairat'
  ),
  createWorkoutTrack(
    'workout-16',
    'Kelewali',
    'Avadhoot Gupte & Sampada Mane',
    'Marathi',
    'zduldqWGq6c',
    ['kelewali', 'pandu', 'avadhoot gupte', 'sampada mane'],
    'Pandu'
  ),
  createWorkoutTrack(
    'workout-17',
    'Bhurum Bhurum',
    'Avadhoot Gupte & Vaishali Samant',
    'Marathi',
    '3NPWTO7TYaY',
    ['bhurum bhurum', 'pandu', 'avadhoot gupte', 'vaishali samant'],
    'Pandu'
  ),
  createWorkoutTrack(
    'workout-18',
    'Dolby Walya',
    'Ajay-Atul',
    'Marathi',
    'Z6U3tVjHcUI',
    ['dolby walya', 'jaundya na balasaheb', 'ajay atul', 'anthem'],
    'Jaundya Na Balasaheb'
  ),
  createWorkoutTrack(
    'workout-19',
    'Hi Poli Saajuk',
    'Reshma Sonawane & Manohar Kolambre · Chinar-Mahesh',
    'Marathi',
    '6j50621G_CI',
    ['hi poli saajuk', 'time pass', 'reshma sonawane', 'chinar mahesh'],
    'Time Pass'
  ),
  createWorkoutTrack(
    'workout-20',
    'Lagnalu 2.0',
    'Mugdha Karhade & Avadhoot Gupte',
    'Marathi',
    'ju2kyGHDpS0',
    ['lagnalu 2.0', 'boyz 3', 'mugdha karhade', 'avadhoot gupte'],
    'Boyz 3'
  ),
  createWorkoutTrack(
    'workout-21',
    '9XM SMASHUP Of Zingaat',
    'DJ Aqeel Ali',
    'Marathi',
    '2FHa3AY14ss',
    ['zingaat', 'smashup', 'dj aqeel ali', 'anthem']
  ),
  createWorkoutTrack(
    'workout-22',
    'Waju De Dj Dankyat',
    'Anand Shinde',
    'Marathi',
    'sq8Hr16vD5k',
    ['waju de dj dankyat', 'ka r deva', 'anand shinde'],
    'Ka R Deva'
  ),
  createWorkoutTrack(
    'workout-23',
    'Dj Walaya',
    'Adarsh Shinde',
    'Marathi',
    'g6OU2awTkIM',
    ['dj walaya', 'hari om', 'adarsh shinde'],
    'Hari Om'
  ),
  createWorkoutTrack(
    'workout-24',
    'U R Crazy Boy',
    'Vaishali Samant & Vijay G',
    'Marathi',
    'BktQhfrHeSk',
    ['u r crazy boy', 'urmi', 'vaishali samant'],
    'Urmi'
  ),
  createWorkoutTrack(
    'workout-25',
    'Naad Khula',
    'Adarsh Shinde & Anand Shinde',
    'Marathi',
    '0t-ESoprjJk',
    ['naad khula', 'naad', 'adarsh shinde', 'anand shinde', 'anthem'],
    'Naad'
  ),
  createWorkoutTrack(
    'workout-26',
    'Udu Udu Zalaya (DJ Remix Loud Version)',
    'DJ Shreyas',
    'Marathi',
    'tIKC7Q2cST4',
    ['udu udu zalaya', 'dj remix', 'dj shreyas']
  ),
  createWorkoutTrack(
    'workout-27',
    'Ye Go Ye Ye Maina',
    'Pending',
    'Marathi',
    'izLFp_mMJQ4',
    ['ye go ye ye maina', 'marathi']
  ),
  createWorkoutTrack(
    'workout-28',
    'Aika Dajiba',
    'Vaishali Samant',
    'Marathi',
    'K10As3Zvpis',
    ['aika dajiba', 'vaishali samant']
  ),
  createWorkoutTrack(
    'workout-29',
    'Mala Jau De',
    'Pritam',
    'Marathi',
    'uS3_pNo7n4w',
    ['mala jau de', 'pritam']
  ),
  createWorkoutTrack(
    'workout-30',
    'Mera Naam Mary',
    'Ajay Gogavale',
    'Hindi',
    '5GZTbSxhpJU',
    ['mera naam mary', 'ajay gogavale']
  ),
  createWorkoutTrack(
    'workout-31',
    'Baaygo Baaygo',
    'Kunal Ganjawala',
    'Marathi',
    '3E3tiAd0Ksk',
    ['baaygo baaygo', 'kunal ganjawala']
  ),
  createWorkoutTrack(
    'workout-32',
    'Mera Dadla',
    'Vaishali Samant',
    'Marathi',
    'ecPqPXXcCBs',
    ['mera dadla', 'vaishali samant']
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
