import { PenTool, Feather, FileSignature, Mic, BookOpen, FilePlus } from 'lucide-react';

export const TEMPLATES = [
  {
    id: "huzoor",
    title: "Letter to Huzoor",
    description: "Official structured template for correspondence with Hazrat Khalifatul Masih.",
    icon: FileSignature,
    color: "var(--accent-main)",
    templateText: "<p>Bismillahir Rahmanir Raheem</p><br/><p>Respected Huzoor,</p><p>Assalamu Alaikum wa Rahmatullah,</p><br/><p>[Your message here]</p><br/><br/><p>Humbly Yours,</p><p>[Your Name]</p>"
  },
  {
    id: "amir",
    title: "Letter to Amir Sb",
    description: "Standard template for communicating with the National Amir.",
    icon: Feather,
    color: "var(--accent-main)",
    templateText: "<p>Respected Amir Sahib,</p><p>Assalamu Alaikum wa Rahmatullah,</p><br/><p>[Your message here]</p><br/><br/><p>Wassalam,</p><p>[Your Name]</p>"
  },
  {
    id: "speech",
    title: "Speech Writer",
    description: "Organized format for preparing speeches and addresses.",
    icon: Mic,
    color: "#f59e0b",
    templateText: "<h1>Speech Title: </h1><p><b>Date:</b> </p><p><b>Audience:</b> </p><br/><h2>Introduction:</h2><ul><li></li><li></li></ul><h2>Main Points:</h2><ol><li></li><li></li><li></li></ol><h2>Conclusion:</h2><ul><li></li><li></li></ul>"
  },
  {
    id: "khutba",
    title: "Khutba",
    description: "Layout tailored for Friday Sermons or similar addresses.",
    icon: BookOpen,
    color: "#10b981",
    templateText: "<h1>Khutba Title: </h1><p><b>Date:</b> </p><p><b>Verses Recited:</b> </p><br/><p>[Sermon Content]</p>"
  },
  {
    id: "blank",
    title: "Blank Document",
    description: "Start fresh with a clean, empty Google Doc.",
    icon: FilePlus,
    color: "#6b7280",
    templateText: "<p></p>"
  }
];
