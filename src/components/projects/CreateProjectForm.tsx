"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
  Mic,
  GraduationCap,
  Users,
  Megaphone,
  FileText,
  Clock,
  Sparkles,
  Bookmark,
  Check,
  Search,
  ArrowLeft,
  Copy,
  Edit3,
  Flame,
  Zap,
  BookOpen,
  PartyPopper,
  AlertCircle,
  Sprout,
  CheckCircle,
  ChevronDown,
  X,
  Loader2
} from 'lucide-react';
import clsx from 'clsx';
import {
  ProjectType,
  MurabbiProject,
  createNewProject
} from '@/lib/projects-storage';
import {
  ResearchBookmarkItem,
  BookmarkCategory,
  getLocalResearchBookmarks,
  saveLocalResearchBookmarks,
  triggerDriveSync
} from '@/lib/research-storage';

interface CreateProjectFormProps {
  onCancel: () => void;
  onProjectCreated: (newProject: MurabbiProject, shouldGenerateAI: boolean) => void;
  initialSelectedBookmarks?: ResearchBookmarkItem[];
  initialType?: ProjectType;
}

export type AudienceOption =
  | 'all'
  | 'khuddam'
  | 'lajna'
  | 'atfal'
  | 'nasirat'
  | 'ansar'
  | 'secular'
  | 'interfaith';
export type SpeechToneOption =
  | 'inspirational'
  | 'direct'
  | 'scholarly'
  | 'celebratory'
  | 'urgent'
  | 'gentle';

export type SpeakingPaceOption = 'deliberate' | 'standard' | 'energetic';
export type OpeningProtocolOption = 'khutba' | 'dars' | 'direct' | 'none';
export type ArabicTreatmentOption = 'arabic_translation' | 'transliteration_translation' | 'translation_only';
export type AudienceBaselineOption = 'core' | 'youth' | 'interfaith';
export type OutputStyleOption = 'verbatim' | 'cue_cards';
export type LiteraryDeviceOption =
  | 'rhetorical_questions'
  | 'anaphora'
  | 'metaphors'
  | 'antithesis'
  | 'tricolon'
  | 'hypophora'
  | 'historical_anecdotes'
  | 'climax_dua';

export default function CreateProjectForm({
  onCancel,
  onProjectCreated,
  initialSelectedBookmarks = [],
  initialType = 'speech'
}: CreateProjectFormProps) {
  // Form State
  const [workType, setWorkType] = useState<ProjectType>(initialType);
  const [topic, setTopic] = useState('');
  const [selectedAudiences, setSelectedAudiences] = useState<AudienceOption[]>(['all']);
  const [language, setLanguage] = useState<'english' | 'urdu' | 'both'>('english');
  const [speechTone, setSpeechTone] = useState<SpeechToneOption>('inspirational');
  const [durationMinutes, setDurationMinutes] = useState<number>(5);
  const [speakingPace, setSpeakingPace] = useState<SpeakingPaceOption>('standard');
  const [openingProtocol, setOpeningProtocol] = useState<OpeningProtocolOption>('khutba');
  const [arabicTreatment, setArabicTreatment] = useState<ArabicTreatmentOption>('arabic_translation');
  const [audienceBaseline, setAudienceBaseline] = useState<AudienceBaselineOption>('core');
  const [outputStyle, setOutputStyle] = useState<OutputStyleOption>('verbatim');
  const [selectedLiteraryDevices, setSelectedLiteraryDevices] = useState<LiteraryDeviceOption[]>([
    'rhetorical_questions',
    'metaphors'
  ]);
  const [occasion, setOccasion] = useState('');
  const [occasionChoice, setOccasionChoice] = useState('');
  const [customOccasion, setCustomOccasion] = useState('');
  const [callToAction, setCallToAction] = useState('');
  const [autoGenerateAI, setAutoGenerateAI] = useState(true);

  // Bookmarks State
  const [allBookmarks, setAllBookmarks] = useState<ResearchBookmarkItem[]>([]);
  const [selectedBookmarkIds, setSelectedBookmarkIds] = useState<Set<string>>(new Set());
  const [bookmarkSearch, setBookmarkSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | BookmarkCategory>('all');
  const [isFindingSources, setIsFindingSources] = useState(false);
  const [sourcesFeedback, setSourcesFeedback] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  // Prompt customization state
  const [customPrompt, setCustomPrompt] = useState('');
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // Sync initial type if provided
  useEffect(() => {
    if (initialType) setWorkType(initialType);
  }, [initialType]);

  // Load bookmarks from local storage
  useEffect(() => {
    const bks = getLocalResearchBookmarks();
    setAllBookmarks(bks);

    if (initialSelectedBookmarks && initialSelectedBookmarks.length > 0) {
      setSelectedBookmarkIds(new Set(initialSelectedBookmarks.map(b => b.id)));
    }
  }, [initialSelectedBookmarks]);

  // Delivery Formats Definition
  const WORK_TYPES: {
    id: ProjectType;
    label: string;
    sublabel: string;
    icon: React.ElementType;
    badgeColor: string;
  }[] = [
    {
      id: 'speech',
      label: 'Speech / Taqreer',
      sublabel: 'Hamd-o-Sana, rhetorical arcs & time pacing',
      icon: Mic,
      badgeColor: 'text-red-400'
    },
    {
      id: 'dars',
      label: 'Dars / Class',
      sublabel: 'Verse recitation, tafseer & discussion points',
      icon: GraduationCap,
      badgeColor: 'text-emerald-400'
    },
    {
      id: 'ijlas',
      label: 'Ijlas / Meeting',
      sublabel: 'Presidential remarks, agenda & tarbiyat',
      icon: Users,
      badgeColor: 'text-purple-400'
    },
    {
      id: 'announcement',
      label: "Announcement / I'laan",
      sublabel: 'Urgent directives, event logistics & appeals',
      icon: Megaphone,
      badgeColor: 'text-amber-400'
    },
    {
      id: 'article',
      label: 'Theological Article',
      sublabel: 'Scholarly proofs, counter-arguments & citations',
      icon: FileText,
      badgeColor: 'text-blue-400'
    }
  ];

  const selectedFormat = WORK_TYPES.find(t => t.id === workType) || WORK_TYPES[0];
  const FormatIcon = selectedFormat.icon;

  // Audiences
  const AUDIENCES: { id: AudienceOption; label: string; desc: string }[] = [
    { id: 'all', label: 'All / General Jama’at', desc: 'Combined congregation' },
    { id: 'khuddam', label: 'Majlis Khuddamul Ahmadiyya', desc: 'Youth & young men (15-40)' },
    { id: 'lajna', label: 'Lajna Ima’illah', desc: 'Ahmadi Muslim women' },
    { id: 'atfal', label: 'Majlis Atfalul Ahmadiyya', desc: 'Boys under 15' },
    { id: 'nasirat', label: 'Nasirat-ul-Ahmadiyya', desc: 'Girls under 15' },
    { id: 'ansar', label: 'Majlis Ansarullah', desc: 'Men over 40' },
    { id: 'secular', label: 'Secular Audience', desc: 'General public & secular context' },
    { id: 'interfaith', label: 'Interfaith Guests', desc: 'Non-Muslim & interfaith attendees' }
  ];

  // Occasion / Setting Options
  const OCCASION_OPTIONS: { id: string; label: string }[] = [
    { id: '', label: 'Select Occasion / Setting (Optional)...' },
    { id: 'Friday Sermon / Khutba Jumu‘ah', label: 'Friday Sermon / Khutba Jumu‘ah' },
    { id: 'Jalsa Salana (Annual Convention)', label: 'Jalsa Salana (Annual Convention)' },
    { id: 'National / Regional Ijtema', label: 'National / Regional Ijtema' },
    { id: 'Local Halqa Dars / Study Circle', label: 'Local Halqa Dars / Study Circle' },
    { id: 'Monthly General Jama’at Meeting', label: 'Monthly General Jama’at Meeting' },
    { id: 'Peace Symposium / Interfaith Forum', label: 'Peace Symposium / Interfaith Forum' },
    { id: 'Tabligh Seminar / Campus Lecture', label: 'Tabligh Seminar / Campus Lecture' },
    { id: 'Seerat-un-Nabi (sa) Jalsa', label: 'Seerat-un-Nabi (sa) Jalsa' },
    { id: 'Yaum-e-Musleh Maud Jalsa', label: 'Yaum-e-Musleh Maud Jalsa' },
    { id: 'Yaum-e-Masih Maud Jalsa', label: 'Yaum-e-Masih Maud Jalsa' },
    { id: 'Yaum-e-Khilafat (Khilafat Day)', label: 'Yaum-e-Khilafat (Khilafat Day)' },
    { id: 'Tahrik-e-Jadid / Waqf-e-Jadid Appeal', label: 'Tahrik-e-Jadid / Waqf-e-Jadid Appeal' },
    { id: 'other', label: 'Other (Custom Occasion...)' }
  ];

  // Delivery Tones
  const TONES: {
    id: SpeechToneOption;
    label: string;
    description: string;
    icon: React.ElementType;
    color: string;
  }[] = [
    {
      id: 'inspirational',
      label: 'Inspirational & Uplifting',
      description: 'Ignites spiritual energy, love for Khilafat, and dedication to God.',
      icon: Flame,
      color: 'text-amber-400'
    },
    {
      id: 'direct',
      label: 'Direct & Admonishing / Tarbiyati',
      description: 'Clear moral exhortation, spiritual accountability, and urgent reform.',
      icon: Zap,
      color: 'text-rose-400'
    },
    {
      id: 'scholarly',
      label: 'Scholarly & Analytical',
      description: 'Evidence-based theological argumentation, classical Arabic & texts.',
      icon: BookOpen,
      color: 'text-blue-400'
    },
    {
      id: 'celebratory',
      label: 'Celebratory & Joyful',
      description: 'Jalsa, Eid, or Amin celebrations with gratitude and spiritual joy.',
      icon: PartyPopper,
      color: 'text-emerald-400'
    },
    {
      id: 'urgent',
      label: 'Urgent & Action-Oriented',
      description: 'High-energy rallying call for events, chanda appeals, or deadlines.',
      icon: AlertCircle,
      color: 'text-orange-400'
    },
    {
      id: 'gentle',
      label: 'Gentle & Pedagogical',
      description: 'Warm, nurturing instruction suited for Atfal, youth, and new converts.',
      icon: Sprout,
      color: 'text-teal-400'
    }
  ];

  // Speaking Pace Profiles
  const SPEAKING_PACES: {
    id: SpeakingPaceOption;
    label: string;
    wpm: number;
    sublabel: string;
  }[] = [
    {
      id: 'deliberate',
      label: 'Deliberate & Measured',
      wpm: 105,
      sublabel: 'Solemn cadence with reflective pause markers (Sermons & Tarbiyat)'
    },
    {
      id: 'standard',
      label: 'Standard Oratorical',
      wpm: 130,
      sublabel: 'Balanced, natural delivery pacing (Dars & General Jama’at)'
    },
    {
      id: 'energetic',
      label: 'Dynamic & Persuasive',
      wpm: 155,
      sublabel: 'High-momentum, punchy delivery (Youth & Urgent Appeals)'
    }
  ];

  // Audience Spiritual & Knowledge Baseline
  const AUDIENCE_BASELINES: {
    id: AudienceBaselineOption;
    label: string;
    sublabel: string;
  }[] = [
    {
      id: 'core',
      label: 'Core Jamā‘at / Traditional',
      sublabel: 'Authentic terminology (Tarbiyat, Wasiyyat, Khilafat)'
    },
    {
      id: 'youth',
      label: 'Youth & Contemporary',
      sublabel: 'Rational proofs, addressing modern secular skepticism & screen-time'
    },
    {
      id: 'interfaith',
      label: 'Interfaith & Beginners',
      sublabel: 'Universal framing, clear definitions without internal acronyms'
    }
  ];

  // Opening Liturgical Protocols
  const OPENING_PROTOCOLS: {
    id: OpeningProtocolOption;
    label: string;
    sublabel: string;
  }[] = [
    {
      id: 'khutba',
      label: 'Full Khutba Opening',
      sublabel: 'Tashahhud, Ta‘awwuz, Surah Al-Fatihah & primary verse'
    },
    {
      id: 'dars',
      label: 'Dars / Study Circle',
      sublabel: 'Bismillah, Nahmaduhu wa Nusalli & direct verse recitation'
    },
    {
      id: 'direct',
      label: 'Direct Remarks / Assembly',
      sublabel: 'Tilawat already recited; opening salam and immediate hook'
    },
    {
      id: 'none',
      label: 'Written Article / None',
      sublabel: 'Direct thematic exposition with no vocal liturgy'
    }
  ];

  // Arabic Citations Handling
  const ARABIC_TREATMENTS: {
    id: ArabicTreatmentOption;
    label: string;
    sublabel: string;
  }[] = [
    {
      id: 'arabic_translation',
      label: 'Arabic Script + Translation',
      sublabel: 'Full Quranic/Hadith Arabic text with vocal recitation guidance'
    },
    {
      id: 'transliteration_translation',
      label: 'Transliteration + Translation',
      sublabel: 'Phonetic Roman Arabic alongside translation for pronunciation support'
    },
    {
      id: 'translation_only',
      label: 'Translation Only with Reference',
      sublabel: 'Flowing English/Urdu with exact theological citation tags'
    }
  ];

  // Manuscript Output Style
  const OUTPUT_STYLES: {
    id: OutputStyleOption;
    label: string;
    sublabel: string;
  }[] = [
    {
      id: 'verbatim',
      label: 'Full Verbatim Manuscript',
      sublabel: 'Complete word-for-word text ready to be delivered verbatim'
    },
    {
      id: 'cue_cards',
      label: 'Speaker Podium Cue Cards',
      sublabel: 'Timestamped talking points, oratorical milestones & full quotes'
    }
  ];

  // Literary & Rhetorical Devices for Speeches
  const LITERARY_DEVICES: {
    id: LiteraryDeviceOption;
    label: string;
    sublabel: string;
    promptDirective: string;
  }[] = [
    {
      id: 'rhetorical_questions',
      label: 'Rhetorical Questions',
      sublabel: 'Provokes audience reflection & awakens the conscience before delivering answers',
      promptDirective: 'Weave provocative rhetorical questions at crucial thematic transitions to stimulate deep internal reflection before presenting scriptural resolutions.'
    },
    {
      id: 'anaphora',
      label: 'Anaphora / Repetition',
      sublabel: 'Repeats opening phrases across consecutive sentences for rhythm & emotional crescendo',
      promptDirective: 'Use anaphora (repeating key opening phrases across successive lines) during pivotal emotional peaks to create resonant oratorical rhythm.'
    },
    {
      id: 'metaphors',
      label: 'Parables & Metaphors',
      sublabel: 'Vivid earthly analogies making abstract spiritual truths tangible (Promised Messiah’s style)',
      promptDirective: 'Employ striking spiritual parables and vivid natural metaphors in the tradition of Hazrat Masih-e-Maud (as) to illuminate abstract theological truths.'
    },
    {
      id: 'antithesis',
      label: 'Antithesis & Contrast',
      sublabel: 'Juxtaposes light vs. darkness, temporal illusion vs. divine reality for moral clarity',
      promptDirective: 'Construct sharp antitheses contrasting worldly illusions with spiritual reality, darkness with light, and arrogance with humility to clarify moral choices.'
    },
    {
      id: 'tricolon',
      label: 'Rule of Three (Tricolon)',
      sublabel: 'Groups assertions, virtues, or warnings in threes for harmonious rhythm & retention',
      promptDirective: 'Structure core oratorical assertions, virtues, and calls-to-action in triplets (tricolon) for maximum oratorical cadence and listener retention.'
    },
    {
      id: 'hypophora',
      label: 'Hypophora (Counter-Arguments)',
      sublabel: 'Voices unsaid doubts or modern skepticism aloud and systematically dismantles them',
      promptDirective: 'Incorporate hypophora: voice silent doubts or contemporary secular objections explicitly, then immediately dismantle them with airtight Quranic logic.'
    },
    {
      id: 'historical_anecdotes',
      label: 'Historical Anecdotes',
      sublabel: 'Weaves real incidents from the Sirah of the Prophet (sa) and the Sahaba into the thesis',
      promptDirective: 'Anchor the thesis in vivid historical narratives and personal sacrifices from the life of the Holy Prophet (sa), the Companions, or early Ahmadis.'
    },
    {
      id: 'climax_dua',
      label: 'Climactic Crescendo & Du‘a',
      sublabel: 'Progressively builds emotional intensity from logical exposition to an impassioned prayer',
      promptDirective: 'Build an oratorical crescendo: elevate the delivery from rational exposition to an impassioned spiritual peak, culminating in a fervent concluding Du‘a.'
    }
  ];

  const handleToggleLiteraryDevice = (id: LiteraryDeviceOption) => {
    setSelectedLiteraryDevices(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Dynamic Lookups
  const selectedPace = SPEAKING_PACES.find(p => p.id === speakingPace) || SPEAKING_PACES[1];
  const estWords = Math.round(durationMinutes * selectedPace.wpm);
  const selectedBaseline = AUDIENCE_BASELINES.find(b => b.id === audienceBaseline) || AUDIENCE_BASELINES[0];

  // Sync default opening protocol with format
  useEffect(() => {
    if (workType === 'dars') setOpeningProtocol('dars');
    else if (workType === 'article') setOpeningProtocol('none');
    else if (workType === 'announcement' || workType === 'ijlas') setOpeningProtocol('direct');
    else setOpeningProtocol('khutba');
  }, [workType]);

  // Audience toggle logic
  const handleAudienceToggle = (id: AudienceOption) => {
    if (id === 'all') {
      if (selectedAudiences.includes('all')) {
        setSelectedAudiences(['khuddam']);
      } else {
        setSelectedAudiences(['all']);
      }
      return;
    }

    const withoutAll = selectedAudiences.filter(a => a !== 'all');
    let next: AudienceOption[];
    if (withoutAll.includes(id)) {
      next = withoutAll.filter(a => a !== id);
      if (next.length === 0) next = ['all'];
    } else {
      next = [...withoutAll, id];
    }
    setSelectedAudiences(next);
  };

  // Live Auto-Generated Prompt Brief
  const generatedPrompt = useMemo(() => {
    const audNames = selectedAudiences.includes('all')
      ? 'General Jama’at (All members)'
      : selectedAudiences.map(a => {
          const match = AUDIENCES.find(aud => aud.id === a);
          return match ? match.label : a.toUpperCase();
        }).join(', ');

    const toneDesc = TONES.find(t => t.id === speechTone)?.label || speechTone;
    const langDesc = language === 'both' ? 'Bilingual (English with Urdu/Arabic terms)' : language.toUpperCase();
    const paceConfig = SPEAKING_PACES.find(p => p.id === speakingPace) || SPEAKING_PACES[1];
    const calcWords = Math.round(durationMinutes * paceConfig.wpm);
    const baselineDesc = AUDIENCE_BASELINES.find(b => b.id === audienceBaseline)?.label || 'Core Jamā‘at';
    const openingDesc = OPENING_PROTOCOLS.find(o => o.id === openingProtocol)?.label || 'Full Khutba Opening';
    const arabicDesc = ARABIC_TREATMENTS.find(a => a.id === arabicTreatment)?.label || 'Arabic Script + Translation';
    const outputDesc = OUTPUT_STYLES.find(s => s.id === outputStyle)?.label || 'Full Verbatim Manuscript';
    const selectedDevicesConfig = LITERARY_DEVICES.filter(d => selectedLiteraryDevices.includes(d.id));
    const deviceLabels = selectedDevicesConfig.length > 0
      ? selectedDevicesConfig.map(d => d.label).join(', ')
      : 'None specified';

    let brief = `DELIVERABLE FORMAT: ${workType.toUpperCase()}
TOPIC / CENTRAL THESIS: "${topic || 'Untitled Theological Theme'}"
TARGET AUDIENCE: ${audNames} [Baseline: ${baselineDesc}]
LANGUAGE: ${langDesc}
DELIVERY TONE & FEEL: ${toneDesc}
SPEAKING CADENCE: ${paceConfig.label} (~${paceConfig.wpm} WPM)
TARGET DURATION: Exactly ${durationMinutes} minute(s) (~${calcWords} words target budget)
OPENING LITURGICAL PROTOCOL: ${openingDesc}
SACRED TEXT / CITATION HANDLING: ${arabicDesc}
DESIRED OUTPUT STRUCTURE: ${outputDesc}
${workType === 'speech' && selectedDevicesConfig.length > 0 ? `RHETORICAL & LITERARY DEVICES: ${deviceLabels}\n` : ''}`;

    if (occasion.trim()) {
      brief += `OCCASION / SETTING: ${occasion.trim()}\n`;
    }
    if (callToAction.trim()) {
      brief += `DESIRED OUTCOME / CALL-TO-ACTION: ${callToAction.trim()}\n`;
    }

    brief += `\nINSTRUCTIONS FOR MURABBIAI:
1. THEOLOGICAL SUBSTANCE: Ground the composition firmly in primary Holy Quranic verses and authentic Hadith, incorporating philosophical elucidations from Hazrat Masih-e-Maud (as) and Khulafa-e-Ahmadiyyat.
2. CADENCE & WORD BUDGET: Strictly calibrate the text for ~${calcWords} spoken words matching a ${durationMinutes}-minute delivery at ${paceConfig.wpm} words per minute.`;

    if (speakingPace === 'deliberate') {
      brief += `\n   - Insert explicit '[Waqfah / Pause]' directives after pivotal rhetorical questions and Quranic verses to allow congregation reflection.`;
    } else if (speakingPace === 'energetic') {
      brief += `\n   - Employ dynamic oratorical momentum, shorter punchy sentences, and energetic transitions suited for an urgent rally or appeal.`;
    }

    if (openingProtocol === 'khutba') {
      brief += `\n3. OPENING LITURGY: Begin with classical Tashahhud, Ta'awwuz, Surah Al-Fatihah, followed by the foundational Arabic ayah before entering the topic.`;
    } else if (openingProtocol === 'dars') {
      brief += `\n3. OPENING LITURGY: Begin with Bismillah-ir-Rahman-ir-Rahim and Nahmaduhu wa Nusalli, then immediately present the selected verse with translation.`;
    } else if (openingProtocol === 'direct') {
      brief += `\n3. OPENING LITURGY: Presume formal Tilawat has already taken place; begin directly with warm Islamic greeting (As-Salamu 'Alaikum wa Rahmatullah) and an engaging introductory hook.`;
    }

    if (arabicTreatment === 'arabic_translation') {
      brief += `\n4. ARABIC CITATIONS: Present full Arabic text with vowelization for Quran and Hadith quotations, followed immediately by flowing translation and source attribution.`;
    } else if (arabicTreatment === 'transliteration_translation') {
      brief += `\n4. ARABIC CITATIONS: Include accurate Roman transliteration alongside Arabic quotes to ensure flawless phonetic pronunciation during vocal delivery.`;
    } else if (arabicTreatment === 'translation_only') {
      brief += `\n4. CITATIONS: Focus on seamless English/Urdu translation with precise bibliographic source tags (e.g. Surah:Ayah, Bukhari, Ruhani Khazain Vol & Page).`;
    }

    if (audienceBaseline === 'youth') {
      brief += `\n5. AUDIENCE FOCUS: Tailor arguments to young minds by addressing modern intellectual doubts, rational proofs, and contemporary digital/social realities.`;
    } else if (audienceBaseline === 'interfaith') {
      brief += `\n5. AUDIENCE FOCUS: Use universally accessible language, explaining Islamic/Ahmadi concepts clearly without assuming prior familiarity with community acronyms.`;
    }

    if (selectedAudiences.includes('secular')) {
      brief += `\n   - SECULAR AUDIENCE ADAPTATION: Frame concepts with objective moral reasoning, rational philosophical principles, and relatable human examples rather than presupposing theological dogma.`;
    }
    if (selectedAudiences.includes('interfaith')) {
      brief += `\n   - INTERFAITH DIALOGUE ADAPTATION: Highlight common spiritual values, use respectful comparative theological framing, and clearly define Arabic or Islamic terms with accessible explanations.`;
    }

    if (outputStyle === 'cue_cards') {
      brief += `\n6. MANUSCRIPT FORMAT: Structure output as Speaker's Podium Cue Cards with explicit timestamp markers (e.g. [00:00 - 01:30]), bulleted talking points, and full verbatim text only for central scriptural quotations.`;
    } else {
      brief += `\n6. MANUSCRIPT FORMAT: Provide a comprehensive, full-length verbatim prose manuscript ready for immediate podium reading.`;
    }

    if (workType === 'speech' && selectedDevicesConfig.length > 0) {
      brief += `\n7. ORATORICAL & LITERARY DEVICES (MANDATORY INTEGRATION):\n`;
      selectedDevicesConfig.forEach((dev) => {
        brief += `   - [${dev.label}]: ${dev.promptDirective}\n`;
      });
    }

    return brief;
  }, [
    workType,
    topic,
    selectedAudiences,
    language,
    speechTone,
    durationMinutes,
    speakingPace,
    openingProtocol,
    arabicTreatment,
    audienceBaseline,
    outputStyle,
    selectedLiteraryDevices,
    occasion,
    callToAction
  ]);

  // Sync customPrompt with generatedPrompt if not manually edited
  useEffect(() => {
    if (!isEditingPrompt) {
      setCustomPrompt(generatedPrompt);
    }
  }, [generatedPrompt, isEditingPrompt]);

  const copyPromptToClipboard = () => {
    navigator.clipboard.writeText(customPrompt || generatedPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  // Bookmarks helper handlers
  const toggleSelectBookmark = (id: string) => {
    setSelectedBookmarkIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredBookmarks = useMemo(() => {
    return allBookmarks.filter(b => {
      const matchesCategory = selectedCategory === 'all' || b.category === selectedCategory;
      const matchesSearch =
        !bookmarkSearch.trim() ||
        b.title.toLowerCase().includes(bookmarkSearch.toLowerCase()) ||
        (b.subtitle && b.subtitle.toLowerCase().includes(bookmarkSearch.toLowerCase())) ||
        (b.snippet && b.snippet.toLowerCase().includes(bookmarkSearch.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [allBookmarks, selectedCategory, bookmarkSearch]);

  const selectAllFiltered = () => {
    setSelectedBookmarkIds(prev => {
      const next = new Set(prev);
      filteredBookmarks.forEach(b => next.add(b.id));
      return next;
    });
  };

  const deselectAllFiltered = () => {
    setSelectedBookmarkIds(prev => {
      const next = new Set(prev);
      filteredBookmarks.forEach(b => next.delete(b.id));
      return next;
    });
  };

  const handleAutoFindSources = async () => {
    if (!topic.trim()) {
      setSourcesFeedback({
        message: 'Please enter a Topic / Central Thesis first.',
        type: 'info'
      });
      const topicInput = document.getElementById('project-topic-input');
      if (topicInput) topicInput.focus();
      return;
    }

    setIsFindingSources(true);
    setSourcesFeedback(null);

    try {
      const res = await fetch('/api/projects/auto-sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          workType,
          occasion: occasion.trim(),
          audiences: selectedAudiences
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to search Research Tab library');
      }

      const newSources: ResearchBookmarkItem[] = data.sources || [];
      if (newSources.length === 0) {
        setSourcesFeedback({
          message: 'No direct scriptural sources matched this query in the Research library.',
          type: 'info'
        });
        return;
      }

      // Merge newly discovered sources into allBookmarks (avoiding duplicate IDs)
      const existingIds = new Set(allBookmarks.map(b => b.id));
      const newlyAdded = newSources.filter(s => !existingIds.has(s.id));
      const updatedBookmarks = [...newlyAdded, ...allBookmarks];

      setAllBookmarks(updatedBookmarks);
      saveLocalResearchBookmarks(updatedBookmarks);
      triggerDriveSync({ bookmarks: updatedBookmarks });

      // Automatically select all discovered sources for this project
      setSelectedBookmarkIds(prev => {
        const next = new Set(prev);
        newSources.forEach(s => next.add(s.id));
        return next;
      });

      setSourcesFeedback({
        message: `Found ${newSources.length} authentic sources from Research Tab & added to dossier!`,
        type: 'success'
      });

      // Smooth scroll to citations card
      setTimeout(() => {
        const citationsCard = document.getElementById('citations-card');
        if (citationsCard) {
          citationsCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 100);
    } catch (err: any) {
      console.error('Error auto-finding sources:', err);
      setSourcesFeedback({
        message: err.message || 'Error communicating with Research Tab library.',
        type: 'error'
      });
    } finally {
      setIsFindingSources(false);
    }
  };

  const getCategoryBadge = (cat: BookmarkCategory) => {
    switch (cat) {
      case 'quran':
        return { label: 'Quran', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
      case 'ahadith':
        return { label: 'Hadith', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
      case 'khazain':
        return { label: 'Ruhani Khazain', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' };
      case 'malfuzat':
        return { label: 'Malfuzat', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' };
      case 'tazkirah':
        return { label: 'Tazkirah', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' };
      case 'essence':
        return { label: 'Essence of Islam', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' };
      default:
        return { label: cat.toUpperCase(), color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
    }
  };

  const handleCreate = () => {
    if (!topic.trim()) return;

    const chosenBookmarks = allBookmarks.filter(b => selectedBookmarkIds.has(b.id));
    const finalPrompt = customPrompt.trim() || generatedPrompt;

    const newProj = createNewProject({
      title: topic.trim(),
      type: workType,
      description: `Tone: ${speechTone} • Length: ${durationMinutes}m (${speakingPace}) • Occasion: ${occasion || 'N/A'}`,
      targetAudience: selectedAudiences.join(', '),
      audiences: selectedAudiences,
      language,
      speechTone,
      durationMinutes,
      speakingPace,
      openingProtocol,
      arabicTreatment,
      audienceBaseline,
      outputStyle,
      literaryDevices: workType === 'speech' ? selectedLiteraryDevices : [],
      occasion: occasion.trim(),
      callToAction: callToAction.trim(),
      generatedPrompt: finalPrompt,
      customPrompt: isEditingPrompt ? finalPrompt : undefined,
      bookmarks: chosenBookmarks
    });

    onProjectCreated(newProj, autoGenerateAI);
  };

  return (
    <div className="flex flex-col gap-6 pb-16 animate-in fade-in slide-in-from-bottom-8 duration-500 w-full px-4 sm:px-6 md:px-10 pt-6 max-w-7xl mx-auto">
      
      {/* ──────── FORM-V4 CONTAINER (Authentic Murabbi Desk Expense Card Form) ──────── */}
      <div className="w-full space-y-6 form-v4 no-drag">
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">

          {/* ════════ CARD 1: GENERAL SPECIFICATIONS & TOPIC ════════ */}
          <div className="card" id="general-info-card">
            <div className="card-hdr">
              <div className="dot"></div>
              <span>GENERAL SPECIFICATIONS & TOPIC</span>
            </div>

            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                
                {/* Left Column: Format Dropdown & Occasion */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-2">
                    <label className="lbl flex items-center justify-between">
                      <span>Deliverable Format / Type</span>
                      <span className="text-[10px] text-[var(--accent-main)] font-mono font-bold uppercase tracking-wider">
                        {selectedFormat.label.split('/')[0].trim()}
                      </span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--accent-main)] flex items-center">
                        <FormatIcon size={16} />
                      </div>
                      <select
                        value={workType}
                        onChange={e => setWorkType(e.target.value as ProjectType)}
                        className="cursor-pointer appearance-none !pl-10 !pr-10"
                      >
                        {WORK_TYPES.map(type => (
                          <option
                            key={type.id}
                            value={type.id}
                            className="bg-neutral-900 text-neutral-100"
                          >
                            {type.label} — {type.sublabel}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={16}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-dim)]"
                      />
                    </div>
                    <p className="text-[10px] text-[var(--text-dim)] italic">
                      {selectedFormat.sublabel}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    <label className="lbl flex items-center justify-between">
                      <span>Occasion / Setting (Optional)</span>
                      {occasionChoice === 'other' && (
                        <span className="text-[10px] text-[var(--accent-main)] font-mono font-bold uppercase tracking-wider">
                          Custom
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <select
                        value={occasionChoice}
                        onChange={e => {
                          const val = e.target.value;
                          setOccasionChoice(val);
                          if (val === 'other') {
                            setOccasion(customOccasion);
                          } else {
                            setOccasion(val);
                          }
                        }}
                        className="cursor-pointer appearance-none !pl-4 !pr-10"
                      >
                        {OCCASION_OPTIONS.map(opt => (
                          <option
                            key={opt.id}
                            value={opt.id}
                            className="bg-neutral-900 text-neutral-100"
                          >
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={16}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-dim)]"
                      />
                    </div>

                    {/* Custom input when "other" is selected */}
                    {occasionChoice === 'other' && (
                      <div className="animate-in fade-in duration-200 mt-1">
                        <input
                          type="text"
                          value={customOccasion}
                          onChange={e => {
                            setCustomOccasion(e.target.value);
                            setOccasion(e.target.value);
                          }}
                          placeholder="Enter custom occasion or setting (e.g. Tarbiyyati Camp, Youth Q&A...)"
                          autoFocus
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Topic with 150-char limit */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-2">
                    <label className="lbl flex items-center justify-between">
                      <span>Topic / Central Thesis</span>
                      <span className={clsx(
                        "font-mono font-bold normal-case tracking-normal text-[10px]",
                        topic.length >= 150 ? "text-amber-500" : "text-[var(--text-dim)]"
                      )}>
                        {topic.length} / 150 letters
                      </span>
                    </label>
                    <input
                      id="project-topic-input"
                      type="text"
                      value={topic}
                      maxLength={150}
                      onChange={e => setTopic(e.target.value)}
                      placeholder="e.g. The Philosophy of Divine Decree & Free Will according to the Promised Messiah (as)"
                      className="font-medium"
                    />

                    {/* Auto-Find Sources Action Bar */}
                    <div className="flex items-center justify-between gap-3 pt-1 flex-wrap">
                      <p className="text-[10px] text-[var(--text-dim)] italic">
                        Strict 150-character limit to ensure crisp, focused doctrinal alignment.
                      </p>

                      <button
                        type="button"
                        onClick={handleAutoFindSources}
                        disabled={isFindingSources}
                        className={clsx(
                          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all shadow-sm select-none",
                          isFindingSources
                            ? "bg-[var(--accent-main)]/20 text-[var(--accent-main)] border-[var(--accent-main)]/40 cursor-wait animate-pulse"
                            : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:border-emerald-500/50 active:scale-[0.98]"
                        )}
                        title="Automatically search Holy Qur'an, Ahadith, Ruhani Khazain & classical literature from the Research tab"
                      >
                        {isFindingSources ? (
                          <>
                            <Loader2 size={13} className="animate-spin text-emerald-400" />
                            <span>Scanning Research Library...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles size={13} className="text-emerald-400" />
                            <span>Auto-Find Sources via Research Tab</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Sources Feedback Notification */}
                    {sourcesFeedback && (
                      <div className={clsx(
                        "text-[11px] font-medium animate-in fade-in flex items-center gap-1.5 px-3 py-2 rounded-lg border",
                        sourcesFeedback.type === 'success' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                        sourcesFeedback.type === 'error' ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                        "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      )}>
                        {sourcesFeedback.type === 'success' ? <Check size={13} /> : <AlertCircle size={13} />}
                        <span>{sourcesFeedback.message}</span>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* ════════ CARD 2: AUDIENCE, LANGUAGE & DURATION PACING ════════ */}
          <div className="card" id="audience-metrics-card">
            <div className="card-hdr">
              <div className="dot"></div>
              <span>TARGET AUDIENCE, LANGUAGE & DURATION PACING</span>
            </div>

            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                
                {/* Left: Audience Multi-select & Language */}
                <div className="space-y-5">
                  <div className="grid grid-cols-1 gap-2">
                    <label className="lbl flex items-center justify-between">
                      <span>Target Audience</span>
                      <span className="text-[10px] text-[var(--text-dim)] font-mono normal-case">
                        Multi-select allowed
                      </span>
                    </label>

                    <div className="grid grid-cols-2 gap-2">
                      {AUDIENCES.map(aud => {
                        const isSelected = selectedAudiences.includes(aud.id);
                        return (
                          <div
                            key={aud.id}
                            onClick={() => handleAudienceToggle(aud.id)}
                            className={clsx(
                              "px-3 py-2 rounded-xl border text-xs cursor-pointer transition-all flex items-center gap-2 select-none",
                              isSelected
                                ? "bg-[var(--accent-soft)] border-[var(--accent-main)] text-[var(--accent-main)] font-bold"
                                : "bg-[var(--glass-bg)] border-[var(--glass-border)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--accent-main)]/30"
                            )}
                          >
                            <div className={clsx(
                              "w-4 h-4 rounded-md border flex items-center justify-center shrink-0 text-[10px]",
                              isSelected ? "bg-[var(--accent-main)] border-[var(--accent-main)] text-white" : "border-[var(--glass-border)]"
                            )}>
                              {isSelected && <Check size={10} />}
                            </div>
                            <span className="truncate">{aud.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Language */}
                  <div className="grid grid-cols-1 gap-2">
                    <label className="lbl">Delivery Language</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'english', label: 'English', desc: 'Standard english speech' },
                        { id: 'urdu', label: 'Urdu', desc: 'اردو فصیح تقریر' },
                        { id: 'both', label: 'Both (Bilingual)', desc: 'English with Arabic/Urdu' }
                      ].map(lang => (
                        <div
                          key={lang.id}
                          onClick={() => setLanguage(lang.id as any)}
                          className={clsx(
                            "p-2.5 rounded-xl border text-center cursor-pointer transition-all select-none",
                            language === lang.id
                              ? "bg-[var(--accent-soft)] border-[var(--accent-main)] text-[var(--accent-main)] font-bold"
                              : "bg-[var(--glass-bg)] border-[var(--glass-border)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--accent-main)]/30"
                          )}
                        >
                          <div className="text-xs font-bold">{lang.label}</div>
                          <div className="text-[9px] text-[var(--text-dim)] mt-0.5">{lang.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Audience Spiritual & Knowledge Baseline */}
                  <div className="grid grid-cols-1 gap-2">
                    <label className="lbl flex items-center justify-between">
                      <span>Audience Spiritual & Knowledge Baseline</span>
                      <span className="text-[10px] text-[var(--accent-main)] font-mono font-bold uppercase">
                        {selectedBaseline.label.split('/')[0].trim()}
                      </span>
                    </label>
                    <div className="relative">
                      <select
                        value={audienceBaseline}
                        onChange={e => setAudienceBaseline(e.target.value as AudienceBaselineOption)}
                        className="cursor-pointer appearance-none !pl-4 !pr-10"
                      >
                        {AUDIENCE_BASELINES.map(b => (
                          <option key={b.id} value={b.id} className="bg-neutral-900 text-neutral-100">
                            {b.label} — {b.sublabel}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={16}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-dim)]"
                      />
                    </div>
                    <p className="text-[10px] text-[var(--text-dim)] italic">
                      {selectedBaseline.sublabel}
                    </p>
                  </div>
                </div>

                {/* Right: Duration Slider, Speaking Pace & Call-To-Action */}
                <div className="space-y-5">
                  <div className="grid grid-cols-1 gap-2">
                    <label className="lbl flex items-center justify-between">
                      <span>Target Delivery Length</span>
                      <span className="font-mono text-xs text-[var(--accent-main)] font-black">
                        {durationMinutes} min (~{estWords} words @ {selectedPace.wpm} WPM)
                      </span>
                    </label>

                    {/* Range Slider */}
                    <div className="p-3 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] space-y-2">
                      <input
                        type="range"
                        min="1"
                        max="30"
                        step="1"
                        value={durationMinutes}
                        onChange={e => setDurationMinutes(parseInt(e.target.value, 10))}
                        className="w-full accent-[var(--accent-main)] cursor-pointer"
                      />
                      <div className="flex justify-between text-[9px] font-mono text-[var(--text-dim)]">
                        <span>1 min (Brief)</span>
                        <span>15 min (Speech)</span>
                        <span>30 min (Keynote)</span>
                      </div>
                    </div>
                  </div>

                  {/* Speaking Pace Segmented Control */}
                  <div className="grid grid-cols-1 gap-2">
                    <label className="lbl flex items-center justify-between">
                      <span>Speaking Cadence / Pace</span>
                      <span className="text-[10px] text-[var(--accent-main)] font-mono font-bold">
                        {selectedPace.wpm} words/min
                      </span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {SPEAKING_PACES.map(p => {
                        const isSelected = speakingPace === p.id;
                        return (
                          <div
                            key={p.id}
                            onClick={() => setSpeakingPace(p.id)}
                            className={clsx(
                              "p-2.5 rounded-xl border text-center cursor-pointer transition-all select-none flex flex-col justify-between",
                              isSelected
                                ? "bg-[var(--accent-soft)] border-[var(--accent-main)] text-[var(--accent-main)] font-bold shadow-sm"
                                : "bg-[var(--glass-bg)] border-[var(--glass-border)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--accent-main)]/30"
                            )}
                          >
                            <div className="text-xs font-bold leading-tight">{p.label.split('&')[0].trim()}</div>
                            <div className="text-[9px] text-[var(--text-dim)] font-mono mt-1">{p.wpm} WPM</div>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-[10px] text-[var(--text-dim)] italic">
                      {selectedPace.sublabel}
                    </p>
                  </div>

                  {/* Call to action */}
                  <div className="grid grid-cols-1 gap-2">
                    <label className="lbl">Desired Call-to-Action / Outcome (Optional)</label>
                    <input
                      type="text"
                      value={callToAction}
                      onChange={e => setCallToAction(e.target.value)}
                      placeholder="e.g. Inspire youth to commit to daily Tahajjud prayer and submit Tahrik-e-Jadid pledges"
                    />
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* ════════ CARD 3: DELIVERY TONE & ORATORICAL ARCHITECTURE ════════ */}
          <div className="card" id="tone-card">
            <div className="card-hdr">
              <div className="dot"></div>
              <span>DELIVERY TONE & ORATORICAL ARCHITECTURE</span>
            </div>

            <div className="card-body space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {TONES.map(tone => {
                  const Icon = tone.icon;
                  const isSelected = speechTone === tone.id;
                  return (
                    <div
                      key={tone.id}
                      onClick={() => setSpeechTone(tone.id)}
                      className={clsx(
                        "p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2 select-none",
                        isSelected
                          ? "bg-[var(--accent-soft)] border-[var(--accent-main)] shadow-md shadow-[var(--accent-glow)]/20"
                          : "bg-[var(--glass-bg)] border-[var(--glass-border)] hover:border-[var(--accent-main)]/30 hover:bg-[var(--accent-soft)]/20"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className={clsx("p-2 rounded-lg bg-[var(--accent-soft)]", tone.color)}>
                          <Icon size={16} />
                        </span>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-[var(--accent-main)]" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-[var(--text-main)]">
                          {tone.label}
                        </div>
                        <div className="text-[10px] text-[var(--text-muted)] leading-relaxed mt-1">
                          {tone.description}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Oratorical Nuances & Liturgical Protocols */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-[var(--glass-border)]">
                {/* 1. Opening Protocol */}
                <div className="grid grid-cols-1 gap-2">
                  <label className="lbl flex items-center justify-between">
                    <span>Opening Liturgy (Hamd-o-Sana)</span>
                  </label>
                  <div className="relative">
                    <select
                      value={openingProtocol}
                      onChange={e => setOpeningProtocol(e.target.value as OpeningProtocolOption)}
                      className="cursor-pointer appearance-none !pl-3.5 !pr-10 text-xs"
                    >
                      {OPENING_PROTOCOLS.map(op => (
                        <option key={op.id} value={op.id} className="bg-neutral-900 text-neutral-100">
                          {op.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-dim)]"
                    />
                  </div>
                  <p className="text-[10px] text-[var(--text-dim)] italic line-clamp-1">
                    {OPENING_PROTOCOLS.find(o => o.id === openingProtocol)?.sublabel}
                  </p>
                </div>

                {/* 2. Arabic Text & Citation Handling */}
                <div className="grid grid-cols-1 gap-2">
                  <label className="lbl flex items-center justify-between">
                    <span>Sacred Script & Citations</span>
                  </label>
                  <div className="relative">
                    <select
                      value={arabicTreatment}
                      onChange={e => setArabicTreatment(e.target.value as ArabicTreatmentOption)}
                      className="cursor-pointer appearance-none !pl-3.5 !pr-10 text-xs"
                    >
                      {ARABIC_TREATMENTS.map(ar => (
                        <option key={ar.id} value={ar.id} className="bg-neutral-900 text-neutral-100">
                          {ar.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-dim)]"
                    />
                  </div>
                  <p className="text-[10px] text-[var(--text-dim)] italic line-clamp-1">
                    {ARABIC_TREATMENTS.find(a => a.id === arabicTreatment)?.sublabel}
                  </p>
                </div>

                {/* 3. Output Structure Style */}
                <div className="grid grid-cols-1 gap-2">
                  <label className="lbl flex items-center justify-between">
                    <span>Manuscript Output Style</span>
                  </label>
                  <div className="relative">
                    <select
                      value={outputStyle}
                      onChange={e => setOutputStyle(e.target.value as OutputStyleOption)}
                      className="cursor-pointer appearance-none !pl-3.5 !pr-10 text-xs"
                    >
                      {OUTPUT_STYLES.map(s => (
                        <option key={s.id} value={s.id} className="bg-neutral-900 text-neutral-100">
                          {s.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-dim)]"
                    />
                  </div>
                  <p className="text-[10px] text-[var(--text-dim)] italic line-clamp-1">
                    {OUTPUT_STYLES.find(s => s.id === outputStyle)?.sublabel}
                  </p>
                </div>
              </div>

              {/* 4. Literary & Rhetorical Devices (Speeches Specific) */}
              {workType === 'speech' && (
                <div className="pt-6 border-t border-[var(--glass-border)] space-y-3 animate-in fade-in duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <Sparkles size={14} className="text-[var(--accent-main)]" />
                        <label className="lbl !mb-0 font-bold">
                          Literary & Rhetorical Devices (Speech Enrichment)
                        </label>
                      </div>
                      <p className="text-[10px] text-[var(--text-dim)] mt-0.5">
                        Select oratorical figures to infuse classical resonance, rhythmic cadence, and emotional crescendo into the draft.
                      </p>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                      <span className="text-[10px] font-mono text-[var(--accent-main)] font-black">
                        {selectedLiteraryDevices.length} / {LITERARY_DEVICES.length} Active
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (selectedLiteraryDevices.length === LITERARY_DEVICES.length) {
                            setSelectedLiteraryDevices([]);
                          } else {
                            setSelectedLiteraryDevices(LITERARY_DEVICES.map(d => d.id));
                          }
                        }}
                        className="text-[10px] font-bold text-[var(--text-muted)] hover:text-[var(--accent-main)] transition-colors underline cursor-pointer"
                      >
                        {selectedLiteraryDevices.length === LITERARY_DEVICES.length ? 'Clear All' : 'Select All'}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                    {LITERARY_DEVICES.map(device => {
                      const isSelected = selectedLiteraryDevices.includes(device.id);
                      return (
                        <div
                          key={device.id}
                          onClick={() => handleToggleLiteraryDevice(device.id)}
                          className={clsx(
                            "p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between gap-1.5 select-none",
                            isSelected
                              ? "bg-[var(--accent-soft)] border-[var(--accent-main)] shadow-sm"
                              : "bg-[var(--glass-bg)] border-[var(--glass-border)] hover:border-[var(--accent-main)]/30 hover:bg-[var(--accent-soft)]/20"
                          )}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className={clsx(
                              "text-xs font-bold leading-tight",
                              isSelected ? "text-[var(--accent-main)]" : "text-[var(--text-main)]"
                            )}>
                              {device.label}
                            </span>
                            <div className={clsx(
                              "w-4 h-4 rounded-md border flex items-center justify-center shrink-0 text-[10px]",
                              isSelected ? "bg-[var(--accent-main)] border-[var(--accent-main)] text-white" : "border-[var(--glass-border)]"
                            )}>
                              {isSelected && <Check size={10} />}
                            </div>
                          </div>
                          <p className="text-[10px] text-[var(--text-muted)] line-clamp-2 leading-relaxed">
                            {device.sublabel}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ════════ CARD 4: RESEARCH DOSSIER & CITATIONS ════════ */}
          <div className="card" id="citations-card">
            <div className="card-hdr flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="dot"></div>
                <span>RESEARCH DOSSIER & CITATIONS ({selectedBookmarkIds.size} SELECTED)</span>
              </div>
              <span className="text-[9px] font-mono lowercase tracking-normal text-[var(--text-dim)]">
                from Research Library
              </span>
            </div>

            <div className="card-body space-y-4">
              
              {/* Category Filter & Search Row */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-[var(--glass-border)]">
                
                {/* Search in bookmarks */}
                <div className="relative flex-1 max-w-md">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-dim)]" />
                  <input
                    type="text"
                    value={bookmarkSearch}
                    onChange={e => setBookmarkSearch(e.target.value)}
                    placeholder="Search bookmarks by topic, book or verse..."
                    className="!pl-9 !py-2 text-xs"
                  />
                  {bookmarkSearch && (
                    <button
                      type="button"
                      onClick={() => setBookmarkSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)] hover:text-[var(--text-main)]"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>

                {/* Selection helper buttons */}
                <div className="flex items-center gap-2 text-xs flex-wrap">
                  <button
                    type="button"
                    onClick={handleAutoFindSources}
                    disabled={isFindingSources}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-[11px] font-bold text-emerald-400 border border-emerald-500/30 hover:border-emerald-500/50 transition-colors inline-flex items-center gap-1.5 active:scale-[0.98]"
                    title="Automatically find and attach sources from the Research Tab"
                  >
                    {isFindingSources ? (
                      <>
                        <Loader2 size={12} className="animate-spin" />
                        <span>Finding Sources...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={12} />
                        <span>Auto-Find Sources</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={selectAllFiltered}
                    className="px-3 py-1.5 rounded-lg bg-[var(--glass-bg)] hover:bg-[var(--accent-soft)] text-[11px] font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--glass-border)] transition-colors"
                  >
                    Select All ({filteredBookmarks.length})
                  </button>
                  <button
                    type="button"
                    onClick={deselectAllFiltered}
                    className="px-3 py-1.5 rounded-lg bg-[var(--glass-bg)] hover:bg-[var(--accent-soft)] text-[11px] font-bold text-[var(--text-dim)] hover:text-[var(--text-main)] border border-[var(--glass-border)] transition-colors"
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              {/* Bookmarks Grid / Empty State */}
              {allBookmarks.length === 0 ? (
                <div className="text-center py-10 px-4 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] space-y-3">
                  <Bookmark size={28} className="mx-auto text-[var(--text-dim)]" />
                  <div className="font-bold text-xs text-[var(--text-main)]">No Bookmarks Saved in Research Tab Yet</div>
                  <p className="text-[11px] text-[var(--text-muted)] max-w-md mx-auto">
                    You can automatically search and pull authoritative verses, hadith, and writings directly from the Research tab based on your topic.
                  </p>
                  <div>
                    <button
                      type="button"
                      onClick={handleAutoFindSources}
                      disabled={isFindingSources}
                      className="mt-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs inline-flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {isFindingSources ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          <span>Scanning Holy Qur'an, Hadith & Ruhani Khazain...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={14} />
                          <span>Automatically Find Sources for This Topic</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : filteredBookmarks.length === 0 ? (
                <div className="text-center py-8 text-[var(--text-dim)] text-xs">
                  No bookmarks match your search filter.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
                  {filteredBookmarks.map(b => {
                    const isSelected = selectedBookmarkIds.has(b.id);
                    const badge = getCategoryBadge(b.category);

                    return (
                      <div
                        key={b.id}
                        onClick={() => toggleSelectBookmark(b.id)}
                        className={clsx(
                          "p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none",
                          isSelected
                            ? "bg-[var(--accent-soft)] border-[var(--accent-main)]/70 shadow-sm"
                            : "bg-[var(--glass-bg)] border-[var(--glass-border)] hover:border-[var(--accent-main)]/30 hover:bg-[var(--accent-soft)]/20"
                        )}
                      >
                        <div className={clsx(
                          "w-5 h-5 rounded-md border mt-0.5 shrink-0 flex items-center justify-center transition-colors text-xs",
                          isSelected
                            ? "bg-[var(--accent-main)] border-[var(--accent-main)] text-white"
                            : "border-[var(--glass-border)]"
                        )}>
                          {isSelected && <Check size={12} />}
                        </div>

                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={clsx("px-1.5 py-0.5 rounded text-[9px] font-bold border", badge.color)}>
                              {badge.label}
                            </span>
                            <span className="font-bold text-xs text-[var(--text-main)] truncate">
                              {b.title}
                            </span>
                          </div>

                          {b.subtitle && (
                            <p className="text-[11px] text-[var(--text-muted)] line-clamp-1 font-mono">
                              {b.subtitle}
                            </p>
                          )}

                          {b.snippet && (
                            <p className="text-[10px] text-[var(--text-dim)] line-clamp-2 italic leading-relaxed">
                              "{b.snippet}"
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ════════ CARD 5: MURABBIAI PROMPT BRIEF & GENERATION PROTOCOL ════════ */}
          <div className="card" id="prompt-card">
            <div className="card-hdr flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="dot"></div>
                <span>MURABBIAI PROMPT BRIEF & SYNTHESIS</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingPrompt(prev => !prev)}
                  className="px-2.5 py-1 rounded-lg bg-[var(--glass-bg)] hover:bg-[var(--accent-soft)] text-[10px] font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--glass-border)] flex items-center gap-1 transition-colors"
                >
                  <Edit3 size={11} />
                  <span>{isEditingPrompt ? 'Auto-Sync' : 'Customize'}</span>
                </button>
                <button
                  type="button"
                  onClick={copyPromptToClipboard}
                  className="px-2.5 py-1 rounded-lg bg-[var(--glass-bg)] hover:bg-[var(--accent-soft)] text-[10px] font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--glass-border)] flex items-center gap-1 transition-colors"
                >
                  {copiedPrompt ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                  <span>{copiedPrompt ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="card-body space-y-4">
              {isEditingPrompt ? (
                <textarea
                  rows={7}
                  value={customPrompt}
                  onChange={e => setCustomPrompt(e.target.value)}
                  className="w-full !p-3.5 !rounded-xl !bg-[var(--glass-bg)] !border-[var(--accent-main)]/50 text-[var(--text-main)] font-mono text-xs leading-relaxed"
                />
              ) : (
                <div className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] font-mono text-xs text-[var(--text-main)] whitespace-pre-wrap leading-relaxed max-h-52 overflow-y-auto">
                  {generatedPrompt}
                </div>
              )}

              {/* Auto Generate Checkbox */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[var(--accent-soft)] text-[var(--accent-main)] flex items-center justify-center shrink-0">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-[var(--text-main)]">Generate Mock Draft & Action Plan with MurabbiAI</h5>
                    <p className="text-[10px] text-[var(--text-muted)]">
                      MurabbiAI will synthesize your selected bookmarks into a structured delivery roadmap and full draft.
                    </p>
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={autoGenerateAI}
                  onChange={e => setAutoGenerateAI(e.target.checked)}
                  className="w-5 h-5 rounded border-[var(--glass-border)] accent-[var(--accent-main)] cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* ════════ BOTTOM SUBMIT ACTIONS BAR ════════ */}
          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3.5 glass rounded-[18px] border border-[var(--glass-border)] hover:border-[var(--accent-main)]/30 hover:bg-[var(--accent-soft)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-all text-xs font-bold flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft size={16} />
              <span>Back to Works</span>
            </button>

            <button
              type="button"
              onClick={handleCreate}
              disabled={!topic.trim()}
              className="btn-ruby px-8 py-3.5 rounded-[18px] text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-[var(--accent-glow)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <Sparkles size={16} />
              <span>{autoGenerateAI ? "Initialize & Generate Draft" : "Save Taleef Work"}</span>
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}
