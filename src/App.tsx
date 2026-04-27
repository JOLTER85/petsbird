/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, FormEvent, MouseEvent, useRef, Component, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GoogleGenAI, Type } from "@google/genai";
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  db,
  storage,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification
} from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { User } from 'firebase/auth';
import { 
  collection, 
  collectionGroup,
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where,
  getDoc,
  getDocs,
  getDocFromServer,
  addDoc
} from 'firebase/firestore';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Bird, 
  LayoutDashboard, 
  Users, 
  Box, 
  Dna, 
  Heart, 
  Settings, 
  LogOut, 
  Egg as EggIcon, 
  TrendingUp, 
  Calendar, 
  Clock, 
  MapPin, 
  Tag, 
  ChevronDown,
  Bell,
  Plus,
  X,
  Check,
  Link as LinkIcon,
  GitBranch,
  Network,
  Edit2,
  ShoppingBag,
  Sparkles,
  BrainCircuit,
  Loader2,
  BookOpen,
  Camera,
  Upload,
  Image as ImageIcon,
  Newspaper,
  Info,
  Mail,
  Activity,
  LogIn,
  Download,
  ArrowLeft,
  ArrowRight,
  Share2,
  Facebook,
  Instagram,
  CheckCircle2,
  Moon,
  AlertTriangle,
  Shield,
  Smartphone,
  Search
} from "lucide-react";

const DEFAULT_BIRD_IMAGE = "https://images.unsplash.com/photo-1552728089-57bdde30eba3?auto=format&fit=crop&q=80&w=400";

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';

import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
  }
}

interface BirdData {
  id: string;
  name: string;
  ring: string;
  species: string;
  gender: 'Male' | 'Female' | 'Unknown';
  age: number;
  birthYear: string;
  date: string;
  cage: string;
  mutation?: string;
  fatherId?: string;
  motherId?: string;
  lineage?: string;
  status?: string;
  imageUrl?: string;
  salePrice?: string;
}

interface CoupleData {
  id: string;
  maleId: string;
  femaleId: string;
  startDate: string;
  status: 'Active' | 'Inactive';
}

interface EggData {
  id: string;
  eggNumber: string; // Sequential ID like 001
  coupleId: string;
  laidDate: string;
  hatchDate?: string;
  fertilityCheckDate?: string;
  isFertile?: boolean;
  status: 'Intact' | 'Hatched' | 'Broken' | 'Completed' | 'Failed' | 'DeadInShell';
  failureReason?: string;
}

const SPECIES_LIST = [
  { 
    name: "Canary (كناري)", 
    incubation: 14,
    mutations: ["Normal", "Yellow", "Red Factor", "Gloster", "Crested", "Mosaic", "Lizard"]
  },
  { 
    name: "Budgie (بادجي)", 
    incubation: 18,
    mutations: ["Normal", "Opaline", "Lutino", "Albino", "Spangle", "Pied", "Rainbow", "Crested"]
  },
  { 
    name: "Lovebird (روز/فيشر)", 
    incubation: 23,
    mutations: ["Normal", "Lutino", "Opaline", "Cinnamon", "Pallid", "Violet", "Blue", "Albino"]
  },
  { 
    name: "Cockatiel (كوكتيل)", 
    incubation: 19, // Average of 18-21
    mutations: ["Normal", "Lutino", "Pearl", "Pied", "Cinnamon", "Whiteface", "Albino", "Emerald"]
  },
  { 
    name: "Goldfinch (حسون)", 
    incubation: 13,
    mutations: ["Normal", "Major", "Siberian", "Eumo", "Agate", "Isabel", "Satinet"]
  },
  { 
    name: "Zebra Finch (زيبرا)", 
    incubation: 13,
    mutations: ["Normal", "Black Cheek", "Chestnut Flanked", "Fawn", "Pied", "White", "Crested"]
  },
  { 
    name: "Conure (الكونيور)", 
    incubation: 24,
    mutations: ["Normal", "Green Cheek", "Pineapple", "Cinnamon", "Yellow-sided", "Turquoise", "Sun Conure"]
  },
  { 
    name: "Quaker (كويكر)", 
    incubation: 24,
    mutations: ["Normal", "Blue", "Pallid", "Lutino", "Albino", "Cinnamon", "Violet"]
  },
  { 
    name: "African Grey (الببغاء الرمادي الأفريقي)", 
    incubation: 28,
    mutations: ["Normal", "Red Factor", "Albino"]
  },
  { 
    name: "Senegal Parrot (اليويو السنيغالي)", 
    incubation: 26,
    mutations: ["Normal", "Pied", "Dilute"]
  },
];

const TRANSLATIONS = {
  en: {
    home: "Home",
    birds: "Birds",
    eggs: "Eggs",
    profile: "Profile",
    heroTitle: "BREED",
    heroTitleAccent: "SMARTER",
    heroSubtitle: "The Future of Aviary Management",
    heroDesc: "PetsBird combines advanced AI genetics, real-time tracking, and a global marketplace to help you build the perfect aviary.",
    startManaging: "Start Managing Now",
    goDashboard: "Go to Dashboard",
    watchDemo: "Watch Demo",
    downloadApp: "Download App",
    featuresTitle: "EVERYTHING YOU NEED TO",
    featuresTitleAccent: "EXCEL",
    aiGenetics: "AI Genetics Predictor",
    aiGeneticsDesc: "Use advanced neural networks to predict offspring mutations with 99% accuracy.",
    eggTracking: "Real-time Egg Tracking",
    eggTrackingDesc: "Monitor every nest, track incubation periods, and get hatching alerts.",
    marketplace: "Global Marketplace",
    marketplaceDesc: "Connect with verified breeders worldwide to buy and sell rare mutations.",
    hatchSuccess: "Hatch Success",
    dnaAnalyzing: "Analyzing DNA...",
    predictOffspring: "Predict Offspring",
    inventory: "Inventory Management",
    breedingPairs: "Breeding Pairs",
    pairs: "Pairs",
    eggMonitoring: "Egg Monitoring",
    statistics: "Statistics",
    totalEggs: "Total Eggs",
    successHatch: "Hatched Successfully",
    failedEggs: "Failed Eggs",
    survivedChicks: "Survived Chicks",
    breedingRounds: "Breeding Rounds",
    successRate: "Success Rate",
  },
  ar: {
    home: "الرئيسية",
    birds: "الطيور",
    eggs: "البيض",
    profile: "الملف الشخصي",
    heroTitle: "تربية",
    heroTitleAccent: "أذكى",
    heroSubtitle: "مستقبل إدارة المناحل",
    heroDesc: "يجمع PetsBird بين وراثة الذكاء الاصطناعي المتقدمة والتتبع في الوقت الفعلي والسوق العالمي لمساعدتك في بناء المنحل المثالي.",
    startManaging: "ابدأ الإدارة الآن",
    goDashboard: "اذهب إلى لوحة التحكم",
    watchDemo: "شاهد العرض",
    downloadApp: "تحميل التطبيق",
    featuresTitle: "كل ما تحتاجه لـ",
    featuresTitleAccent: "التفوق",
    aiGenetics: "متنبئ الوراثة بالذكاء الاصطناعي",
    aiGeneticsDesc: "استخدم الشبكات العصبية المتقدمة للتنبؤ بطفرات النسل بدقة 99٪.",
    eggTracking: "تتبع البيض في الوقت الفعلي",
    eggTrackingDesc: "راقب كل عش، وتتبع فترات الحضانة، واحصل على تنبيهات الفقس.",
    marketplace: "السوق العالمي",
    marketplaceDesc: "تواصل مع المربين المعتمدين في جميع أنحاء العالم لشراء وبيع الطفرات النادرة.",
    hatchSuccess: "نجاح الفقس",
    dnaAnalyzing: "تحليل الحمض النووي...",
    predictOffspring: "توقع النسل",
    inventory: "إدارة المخزون",
    breedingPairs: "أزواج التربية",
    pairs: "الأزواج",
    eggMonitoring: "مراقبة البيض",
    statistics: "الإحصائيات",
    totalEggs: "إجمالي البيض",
    successHatch: "بيض فَقَسَ بنجاح",
    failedEggs: "بيض لم ينجح",
    survivedChicks: "فراخ حية",
    breedingRounds: "مرات التفريخ",
    successRate: "نسبة النجاح",
  }
};

const Logo = ({ variant = 'full', className = "", theme = 'light' }: { variant?: 'full' | 'icon', className?: string, theme?: 'light' | 'dark' }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <div className="w-12 h-12 shrink-0 relative group/logo">
      {/* Golden Glow Effect */}
      <div className="absolute -inset-1 bg-amber-400 rounded-full blur opacity-25 group-hover/logo:opacity-50 transition duration-1000 group-hover/logo:duration-200" />
      <div className="relative w-12 h-12 bg-gradient-to-br from-amber-200 via-amber-400 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg border border-amber-100/50 overflow-hidden transform group-hover/logo:scale-105 transition-transform">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.3)_50%,transparent_75%)] bg-[length:250%_250%] animate-[shimmer_3s_infinite]" />
        <Bird className="w-7 h-7 text-amber-900 drop-shadow-sm relative z-10" />
      </div>
    </div>
    {variant === 'full' && (
      <div className="flex flex-col">
        <span className="text-2xl font-black tracking-tighter leading-none mb-0.5">
          <span className="bg-gradient-to-r from-amber-600 via-amber-400 to-amber-700 bg-clip-text text-transparent drop-shadow-sm">
            PetsBird
          </span>
        </span>
        <span className="text-[9px] font-black tracking-[0.3em] text-amber-600/70 uppercase leading-none text-right mr-0.5">
          Aviary Elite
        </span>
      </div>
    )}
  </div>
);

const SidebarItem = ({ icon: Icon, label, active = false, onClick, collapsed = false }: { icon: any, label: string, active?: boolean, onClick?: () => void, collapsed?: boolean }) => (
  <motion.div
    whileHover={{ x: collapsed ? 0 : 4 }}
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${
      active ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-400 hover:text-white hover:bg-white/5"
    } ${collapsed ? 'justify-center px-0' : ''}`}
    title={collapsed ? label : ""}
  >
    <Icon className="w-5 h-5" />
    {!collapsed && <span className="font-medium text-sm">{label}</span>}
  </motion.div>
);

const BottomNav = ({ activeTab, setActiveTab, t }: { activeTab: string, setActiveTab: (tab: string) => void, t: any }) => (
    <motion.div 
    initial={{ y: 100 }}
    animate={{ y: 0 }}
    className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-2xl border-t border-slate-100 px-4 py-2 flex items-center justify-between z-[100] md:hidden shadow-[0_-8px_30px_rgb(0,0,0,0.04)]"
  >
    {[
      { id: "Dashboard", icon: LayoutDashboard, label: t.home },
      { id: "My Birds", icon: Bird, label: t.birds },
      { id: "Couples", icon: Heart, label: t.pairs || "Pairs" },
      { id: "Eggs", icon: EggIcon, label: t.eggs },
      { id: "Settings", icon: Settings, label: t.profile }
    ].map((item) => (
      <button
        key={item.id}
        onClick={() => setActiveTab(item.id)}
        className={`flex flex-col items-center gap-1 transition-all relative ${activeTab === item.id ? 'text-primary' : 'text-slate-400'}`}
      >
        <div className={`p-1.5 rounded-xl transition-all ${activeTab === item.id ? 'bg-primary/10' : ''}`}>
          <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'stroke-[2.5px]' : 'stroke-[1.5px]'}`} />
        </div>
        <span className={`text-[8px] font-black uppercase tracking-tighter transition-all ${activeTab === item.id ? 'opacity-100 translate-y-0' : 'opacity-80'}`}>
          {item.label}
        </span>
        {activeTab === item.id && (
          <motion.div 
            layoutId="nav-pill"
            className="absolute -top-1 w-1 h-1 bg-primary rounded-full"
          />
        )}
      </button>
    ))}
  </motion.div>
);

const StatCard = ({ icon: Icon, value, label, colorClass, onClick }: { icon: any, value: string | number, label: string, colorClass: string, onClick?: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={onClick ? { scale: 1.02, y: -4 } : {}}
    whileTap={onClick ? { scale: 0.98 } : {}}
    onClick={onClick}
    className={`bg-white p-4 md:p-6 rounded-2xl md:rounded-[32px] shadow-2xl border border-slate-100 flex items-center gap-3 md:gap-5 ${onClick ? 'cursor-pointer hover:shadow-xl transition-all' : ''}`}
  >
    <div className={`w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 ${colorClass}`}>
      <Icon className="w-5 h-5 md:w-7 md:h-7" />
    </div>
    <div>
      <div className="text-lg md:text-2xl font-black text-slate-900 leading-tight">{value}</div>
      <div className="text-slate-400 text-[9px] md:text-[11px] font-black uppercase tracking-widest">{label}</div>
    </div>
  </motion.div>
);

const calculateDetailedAge = (birthDateStr: string) => {
  if (!birthDateStr) return "N/A";
  
  const today = new Date();
  
  // Handle legacy year-only format (4 digits)
  if (birthDateStr.length === 4 && !isNaN(parseInt(birthDateStr))) {
    const years = today.getFullYear() - parseInt(birthDateStr);
    return years > 0 ? `${years} Year${years > 1 ? 's' : ''}` : "0 Years";
  }

  const birthDate = new Date(birthDateStr);
  if (isNaN(birthDate.getTime())) return birthDateStr;
  
  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  let days = today.getDate() - birthDate.getDate();
  
  if (days < 0) {
    months--;
    const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    days += prevMonth.getDate();
  }
  
  if (months < 0) {
    years--;
    months += 12;
  }
  
  // Precision Logic for Breeders
  if (years >= 1) {
    // For Adult Birds (1 Year+): Show Years and Months
    let display = `${years} Year${years > 1 ? 's' : ''}`;
    if (months > 0) {
      display += `, ${months} Month${months > 1 ? 's' : ''}`;
    }
    return display;
  } else if (months >= 1) {
    // For Young Birds (1 Month to 1 Year): Show Months and Days
    let display = `${months} Month${months > 1 ? 's' : ''}`;
    if (days > 0) {
      display += `, ${days} Day${days > 1 ? 's' : ''}`;
    }
    return display;
  } else {
    // For Chicks (Less than 1 Month): Show ONLY Days
    return `${days} Day${days !== 1 ? 's' : ''}`;
  }
};

const BirdCard = ({ id, name, ring, species, mutation, gender, age, birthYear, date, cage, status, imageUrl, salePrice, fatherId, motherId, onSelect, isSelected, onEdit, onDelete, onViewPedigree, onExportCertificate, onCageClick, onShare, allBirds = [] }: BirdData & { onSelect?: () => void, isSelected?: boolean, onEdit?: (e: MouseEvent) => void, onDelete?: (id: string) => void, onViewPedigree?: (id: string) => void, onExportCertificate?: (id: string) => void, onCageClick?: (cage: string) => void, onShare?: (e: MouseEvent) => void, allBirds?: BirdData[] }) => {
  // Debugging log to check URL validity
  useEffect(() => {
    if (imageUrl) {
      console.log(`Bird [${name}] Image URL:`, imageUrl);
    }
  }, [imageUrl, name]);

  const cleanImageUrl = imageUrl?.trim();
  const father = allBirds.find(b => b.id === fatherId);
  const mother = allBirds.find(b => b.id === motherId);

  // Refined Age Display
  const ageDisplay = calculateDetailedAge(birthYear);

  // Status Indicator Config
  const getStatusConfig = (status: string) => {
    const s = status?.toLowerCase() || '';
    switch (s) {
      case 'ready':
        return { icon: <CheckCircle2 className="w-3 h-3" />, color: 'bg-green-500', text: 'Ready', label: 'For breeding' };
      case 'resting':
        return { icon: <Moon className="w-3 h-3" />, color: 'bg-blue-500', text: 'Resting', label: 'Non-breeding' };
      case 'paired':
        return { icon: <Heart className="w-3 h-3" />, color: 'bg-orange-500', text: 'Paired', label: 'Linked' };
      case 'chick':
        return { icon: <Sparkles className="w-3 h-3" />, color: 'bg-purple-500', text: 'Chick', label: 'Young bird' };
      case 'sold':
        return { icon: <ShoppingBag className="w-3 h-3" />, color: 'bg-red-500', text: 'Sold', label: 'تم بيعه' };
      case 'deceased':
        return { icon: <X className="w-3 h-3" />, color: 'bg-slate-900', text: 'Deceased', label: 'مات' };
      default:
        return { icon: <Info className="w-3 h-3" />, color: 'bg-slate-400', text: status || 'Unknown', label: '' };
    }
  };

  const statusConfig = getStatusConfig(status || '');
  const isChick = status?.toLowerCase() === 'chick';

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      onClick={onSelect}
      className={`bg-white rounded-3xl md:rounded-[32px] shadow-sm hover:shadow-xl transition-all border group cursor-pointer relative ${
        isChick ? 'p-2 md:p-3 max-w-[280px] mx-auto' : 'p-3 md:p-5'
      } ${isSelected ? 'border-primary ring-4 ring-primary/10' : 'border-slate-100'}`}
    >
      {/* Top Actions */}
      <div className={`absolute top-2.5 left-2.5 md:top-4 md:left-4 flex gap-1.5 md:gap-2 z-10 ${isChick ? 'scale-90' : ''}`}>
        {onShare && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onShare(e);
            }}
            className="p-3 md:p-2 bg-white/90 backdrop-blur-sm text-slate-400 rounded-xl hover:text-green-500 hover:bg-white shadow-sm opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all"
            title="Share Digital ID"
          >
            <Share2 className="w-4 h-4 md:w-3.5 md:h-3.5" />
          </button>
        )}
        {onEdit && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onEdit(e);
            }}
            className="p-3 md:p-2 bg-white/90 backdrop-blur-sm text-slate-400 rounded-xl hover:text-primary hover:bg-white shadow-sm opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all"
          >
            <Edit2 className="w-4 h-4 md:w-3.5 md:h-3.5" />
          </button>
        )}
        {onExportCertificate && !isChick && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onExportCertificate(id);
            }}
            className="p-2 bg-white/80 backdrop-blur-sm text-slate-400 rounded-xl hover:text-primary hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-all"
            title="Export Pedigree PDF"
          >
            <Download className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Top Right Badges */}
      <div className={`absolute top-2.5 right-2.5 md:top-4 md:right-4 flex flex-col items-end gap-1.5 md:gap-2 z-10 ${isChick ? 'scale-90' : ''}`}>
        <div className={`px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[8px] md:text-[10px] font-bold uppercase tracking-wider shadow-sm ${
          gender === 'Female' ? 'bg-female text-female-text' : 
          gender === 'Male' ? 'bg-male text-male-text' : 
          'bg-slate-100 text-slate-500'
        }`}>
          {gender}
        </div>
        {status && (
          <div className={`px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest ${statusConfig.color} text-white shadow-lg flex items-center gap-1.5`}>
            {statusConfig.icon}
            <span className="hidden xs:inline">{statusConfig.text}</span>
          </div>
        )}
      </div>

      {/* Image Area */}
      <div className={`relative aspect-square rounded-[20px] md:rounded-[24px] bg-slate-50 flex items-center justify-center overflow-hidden transition-all ${
        isChick ? 'mb-2 md:mb-3 max-h-[160px] md:max-h-[200px]' : 'mb-3 md:mb-5'
      }`}>
        {cleanImageUrl ? (
          <img 
            src={cleanImageUrl} 
            alt={name} 
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            referrerPolicy="no-referrer"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = DEFAULT_BIRD_IMAGE;
            }}
          />
        ) : (
          <img 
            src={DEFAULT_BIRD_IMAGE} 
            alt="Default Bird" 
            className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale-[0.5]"
            referrerPolicy="no-referrer"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.(id);
          }}
          className="absolute bottom-4 right-4 p-2 bg-white/80 backdrop-blur-sm text-slate-400 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:text-red-500 hover:bg-white z-10 shadow-sm"
        >
          <X className="w-4 h-4" />
        </button>
        {isSelected && (
          <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
            <div className="bg-primary text-white p-2 rounded-full">
              <Plus className="w-6 h-6" />
            </div>
          </div>
        )}
      </div>
      
      {/* Content Area */}
      <div className={`${isChick ? 'p-1 md:p-2' : 'p-1 md:p-4 md:p-8'} space-y-2 md:space-y-4 transition-all`}>
        <div>
          <h3 className={`${isChick ? 'text-xs md:text-lg' : 'text-sm md:text-xl'} font-bold font-display text-slate-800 truncate`}>{name}</h3>
          <div className="flex flex-col">
            <p className={`${isChick ? 'text-[9px] md:text-xs' : 'text-[10px] md:text-sm'} text-slate-500 font-bold`}>{species}</p>
            {mutation && (
              <p className={`${isChick ? 'text-[7px] md:text-[9px]' : 'text-[8px] md:text-[11px]'} text-primary/60 font-medium italic truncate`}>{mutation}</p>
            )}
          </div>
        </div>

        {/* Info Grid (2 Columns) */}
        <div className={`grid grid-cols-2 gap-y-2 gap-x-2 border-t border-slate-50 ${isChick ? 'pt-2' : 'pt-4'}`}>
          {/* Left: Ring */}
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px]">🏷️</span>
              <span className={`${isChick ? 'text-[9px] md:text-[10px]' : 'text-[10px] md:text-[11px]'} font-black text-accent-gold uppercase tracking-tight`}>
                Ring: {ring || 'N/A'}
              </span>
            </div>
          </div>

          {/* Right: Status */}
          <div className="flex flex-col gap-0.5">
            <div className={`flex items-center gap-1.5 ${isChick ? 'text-[9px] md:text-[10px]' : 'text-[10px] md:text-[11px]'} font-bold ${statusConfig.color.replace('bg-', 'text-')}`}>
              {statusConfig.icon}
              <span>{statusConfig.text}</span>
            </div>
          </div>

          {/* Left: Age & DOB */}
          <div className="flex flex-col gap-0.5">
            <div className={`flex items-center gap-1.5 text-slate-500`}>
              <Calendar className="w-3 h-3 md:w-3.5 md:h-3.5" />
              <span className={`${isChick ? 'text-[9px] md:text-[10px]' : 'text-[10px] md:text-[11px]'} font-bold`}>{ageDisplay}</span>
            </div>
            {!isChick && <span className="text-[8px] md:text-[9px] text-slate-400 ml-5">DOB: {date}</span>}
          </div>

          {/* Right: Cage or Sale Price */}
          <div className="flex flex-col gap-0.5">
            {status === 'Sold' ? (
              <div className="flex items-center gap-1.5 text-green-600 min-h-[24px]">
                <span className="text-[10px]">💰</span>
                <span className={`${isChick ? 'text-[9px] md:text-[10px]' : 'text-[10px] md:text-[11px]'} font-black uppercase tracking-tight`}>Price: {salePrice || 'Sold'}</span>
              </div>
            ) : (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onCageClick?.(cage);
                }}
                className="flex items-center gap-1.5 text-slate-500 hover:text-primary transition-colors group/cage min-h-[24px]"
              >
                <MapPin className="w-3 h-3 md:w-3.5 md:h-3.5 group-hover/cage:scale-110 transition-transform" />
                <span className={`${isChick ? 'text-[9px] md:text-[10px]' : 'text-[10px] md:text-[11px]'} font-bold underline decoration-dotted underline-offset-4`}>Cage {cage}</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer Action */}
        <div className={`${isChick ? 'pt-2 mt-1' : 'pt-4 mt-2'} border-t border-slate-50`}>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onViewPedigree?.(id);
            }}
            className={`w-full ${isChick ? 'py-1.5' : 'py-3'} bg-accent-gold/10 text-accent-gold rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-accent-gold hover:text-white transition-all flex items-center justify-center gap-2 shadow-sm`}
          >
            <GitBranch className="w-3 h-3 md:w-4 md:h-4" />
            <span className={isChick ? 'text-[8px] md:text-[10px]' : ''}>View Pedigree</span>
          </button>

          {(father || mother) && !isChick && (
            <div className="mt-3 flex flex-col gap-2 p-3 bg-slate-50/50 rounded-xl border border-slate-100/50">
              <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Parent Info (معلومات الأبوين)</div>
              <div className="flex flex-col gap-1.5 text-[10px] md:text-[11px]">
                {father && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Father (الأب):</span>
                    <span className="font-bold text-slate-700">{father.name} <span className="text-blue-500/70 ml-1">#{father.ring}</span></span>
                  </div>
                )}
                {mother && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Mother (الأم):</span>
                    <span className="font-bold text-slate-700">{mother.name} <span className="text-pink-500/70 ml-1">#{mother.ring}</span></span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const PedigreeNode = ({ bird, label, gender, onClick, onEdit }: { bird?: BirdData, label: string, gender?: 'Male' | 'Female', onClick?: (id: string) => void, onEdit?: () => void }) => (
  <div className="flex flex-col items-center gap-2 w-full">
    <div className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 flex items-center justify-between w-full px-2">
      <span>{label}</span>
      {onEdit && (
        <button 
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          className="p-1 hover:bg-slate-100 rounded-md text-primary transition-colors"
        >
          <Edit2 className="w-2.5 h-2.5" />
        </button>
      )}
    </div>
    <div 
      onClick={() => bird && onClick?.(bird.id)}
      className={`relative w-full p-4 rounded-3xl border-2 transition-all group ${
        bird 
          ? 'bg-white border-slate-100 hover:border-primary hover:shadow-xl cursor-pointer' 
          : 'bg-slate-50 border-dashed border-slate-200 opacity-50'
      }`}
    >
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
          gender === 'Male' ? 'bg-male/20 text-male-text' : 
          gender === 'Female' ? 'bg-female/20 text-female-text' : 
          'bg-slate-100 text-slate-400'
        }`}>
          <Bird className="w-6 h-6" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-bold text-slate-800 truncate mb-0.5">
            {bird ? bird.name : 'Unknown Ancestor'}
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
              {bird ? (
                <>
                  <span className="font-bold">#{bird.ring}</span>
                  <span className={bird.gender === 'Male' ? 'text-blue-500' : 'text-pink-500'}>
                    {bird.gender === 'Male' ? '♂️' : bird.gender === 'Female' ? '♀️' : ''}
                  </span>
                </>
              ) : '---'}
            </div>
            {bird && (
              <div className="flex flex-col gap-0.5 mt-1 pt-1 border-t border-slate-50">
                <span className="text-[9px] font-black text-primary uppercase tracking-tight truncate">{bird.mutation || 'Normal'}</span>
                <span className="text-[8px] font-medium text-slate-400 truncate">{bird.species}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const GeneticsPredictor = ({ t }: { t: any }) => {
  const [species, setSpecies] = useState("Canary");
  const [fatherMutation, setFatherMutation] = useState("Normal");
  const [motherMutation, setMotherMutation] = useState("Normal");
  const [prediction, setPrediction] = useState<any>(null);
  const [isPredicting, setIsPredicting] = useState(false);

  const speciesOptions = ["Canary", "Cockatiel", "Lovebird", "Budgerigar", "Parrot"];
  const mutations = {
    "Canary": ["Normal", "Yellow", "White", "Red Factor", "Gloster", "Crested"],
    "Cockatiel": ["Normal Grey", "Lutino", "Pied", "Pearl", "Cinnamon", "Whiteface"],
    "Lovebird": ["Green", "Blue", "Lutino", "Albino", "Fischer's", "Masked"],
    "Budgerigar": ["Normal Green", "Normal Blue", "Lutino", "Albino", "Opaline", "Spangle"],
    "Parrot": ["Green", "Blue", "Grey", "Yellow", "Cinnamon"]
  };

  const handlePredict = () => {
    setIsPredicting(true);
    // Simulate AI prediction
    setTimeout(() => {
      const results = [
        { mutation: fatherMutation, probability: 50 },
        { mutation: motherMutation, probability: 30 },
        { mutation: "Split " + fatherMutation, probability: 15 },
        { mutation: "Rare Mutation", probability: 5 }
      ];
      setPrediction(results);
      setIsPredicting(false);
    }, 1500);
  };

  return (
    <div className="glass p-8 md:p-12 rounded-[48px] border-white/20 shadow-2xl mb-20">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
          <BrainCircuit className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-2xl md:text-3xl font-black text-slate-900">{t.aiGenetics}</h3>
          <p className="text-slate-500">{t.aiGeneticsDesc}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        <div className="space-y-3">
          <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-2">Species</label>
          <select 
            value={species}
            onChange={(e) => {
              setSpecies(e.target.value);
              setFatherMutation("Normal");
              setMotherMutation("Normal");
            }}
            className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-700 focus:ring-2 focus:ring-primary/20 transition-all"
          >
            {speciesOptions.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="space-y-3">
          <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-2">Father Mutation</label>
          <select 
            value={fatherMutation}
            onChange={(e) => setFatherMutation(e.target.value)}
            className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-700 focus:ring-2 focus:ring-primary/20 transition-all"
          >
            {mutations[species as keyof typeof mutations].map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div className="space-y-3">
          <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-2">Mother Mutation</label>
          <select 
            value={motherMutation}
            onChange={(e) => setMotherMutation(e.target.value)}
            className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-700 focus:ring-2 focus:ring-primary/20 transition-all"
          >
            {mutations[species as keyof typeof mutations].map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

      <button 
        onClick={handlePredict}
        disabled={isPredicting}
        className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black text-lg shadow-xl hover:bg-primary transition-all flex items-center justify-center gap-3 disabled:opacity-50"
      >
        {isPredicting ? (
          <>
            <Loader2 className="w-6 h-6 animate-spin" />
            Analyzing DNA...
          </>
        ) : (
          <>
            <Sparkles className="w-6 h-6" />
            Predict Offspring
          </>
        )}
      </button>

      {prediction && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 pt-12 border-t border-slate-100"
        >
          <h4 className="text-xl font-black text-slate-900 mb-6">Predicted Outcomes:</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {prediction.map((res: any, i: number) => (
              <div key={i} className="bg-slate-50 p-6 rounded-3xl flex items-center justify-between">
                <span className="font-bold text-slate-700">{res.mutation}</span>
                <span className="text-primary font-black">{res.probability}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

const PedigreeTree = ({ birdId, birds, onBirdClick, onEditParent }: { birdId: string, birds: BirdData[], onBirdClick: (id: string) => void, onEditParent?: (childId: string, type: 'father' | 'mother') => void }) => {
  const getBird = (id?: string) => birds.find(b => b.id === id);
  
  const targetBird = getBird(birdId);
  if (!targetBird) return null;

  const father = getBird(targetBird.fatherId);
  const mother = getBird(targetBird.motherId);

  const paternalGrandfather = getBird(father?.fatherId);
  const paternalGrandmother = getBird(father?.motherId);
  const maternalGrandfather = getBird(mother?.fatherId);
  const maternalGrandmother = getBird(mother?.motherId);

  return (
    <div className="p-8 space-y-12">
      {/* Level 1: Grandparents */}
      <div className="grid grid-cols-4 gap-4">
        <PedigreeNode 
          bird={paternalGrandfather} 
          label="Paternal GF" 
          gender="Male" 
          onClick={onBirdClick}
          onEdit={father ? () => onEditParent?.(father.id, 'father') : undefined}
        />
        <PedigreeNode 
          bird={paternalGrandmother} 
          label="Paternal GM" 
          gender="Female" 
          onClick={onBirdClick}
          onEdit={father ? () => onEditParent?.(father.id, 'mother') : undefined}
        />
        <PedigreeNode 
          bird={maternalGrandfather} 
          label="Maternal GF" 
          gender="Male" 
          onClick={onBirdClick}
          onEdit={mother ? () => onEditParent?.(mother.id, 'father') : undefined}
        />
        <PedigreeNode 
          bird={maternalGrandmother} 
          label="Maternal GM" 
          gender="Female" 
          onClick={onBirdClick}
          onEdit={mother ? () => onEditParent?.(mother.id, 'mother') : undefined}
        />
      </div>

      {/* Connectors L1-L2 */}
      <div className="grid grid-cols-2 gap-4 -mt-8">
        <div className="flex justify-center">
          <div className="h-8 w-1/2 border-x-2 border-b-2 border-slate-100 rounded-b-2xl" />
        </div>
        <div className="flex justify-center">
          <div className="h-8 w-1/2 border-x-2 border-b-2 border-slate-100 rounded-b-2xl" />
        </div>
      </div>

      {/* Level 2: Parents */}
      <div className="grid grid-cols-2 gap-12 px-12">
        <PedigreeNode 
          bird={father} 
          label="Father" 
          gender="Male" 
          onClick={onBirdClick}
          onEdit={() => onEditParent?.(targetBird.id, 'father')}
        />
        <PedigreeNode 
          bird={mother} 
          label="Mother" 
          gender="Female" 
          onClick={onBirdClick}
          onEdit={() => onEditParent?.(targetBird.id, 'mother')}
        />
      </div>

      {/* Connectors L2-L3 */}
      <div className="flex justify-center -mt-8">
        <div className="h-8 w-1/2 border-x-2 border-b-2 border-slate-100 rounded-b-2xl" />
      </div>

      {/* Level 3: Target Bird */}
      <div className="flex justify-center px-24">
        <div className="w-full max-w-xs">
          <PedigreeNode bird={targetBird} label="Current Bird" onClick={onBirdClick} />
        </div>
      </div>
    </div>
  );
};

const EggCard = ({ 
  egg, 
  male, 
  female, 
  onEdit, 
  onDelete, 
  onFertilityCheck, 
  onHatchSuccess,
  onHatchFailure
}: { 
  egg: EggData, 
  male?: BirdData, 
  female?: BirdData,
  onEdit: (id?: string, egg?: EggData) => void,
  onDelete: (id: string) => void | Promise<void>,
  onFertilityCheck: (id: string, isFertile: boolean) => void | Promise<void>,
  onHatchSuccess: (egg: EggData) => void | Promise<void>,
  onHatchFailure: (egg: EggData, reason: string) => void | Promise<void>,
  key?: any
}) => {
  const parseDateStr = (dStr: string) => {
    if (!dStr) return new Date();
    const separator = dStr.includes('/') ? '/' : '-';
    const parts = dStr.split(separator).map(Number);
    return parts[0] > 1000 ? new Date(parts[0], parts[1]-1, parts[2]) : new Date(parts[2], parts[1]-1, parts[0]);
  };

  const today = new Date();
  today.setHours(0,0,0,0);
  const hd = egg.hatchDate ? parseDateStr(egg.hatchDate) : null;
  if (hd) hd.setHours(0,0,0,0);
  
  const ld = parseDateStr(egg.laidDate);
  ld.setHours(0,0,0,0);
  
  const speciesInfo = female ? SPECIES_LIST.find(s => s.name === female.species) : null;
  const incubationPeriod = speciesInfo?.incubation || 21;
  const daysSinceLaid = Math.ceil((today.getTime() - ld.getTime()) / (1000 * 60 * 60 * 24));
  const progress = Math.min(100, Math.max(0, (daysSinceLaid / incubationPeriod) * 100));
  
  // Fertility check logic (Standard 7 days after laid)
  const fertCheckDays = 7;
  const fertCheckDate = new Date(ld);
  fertCheckDate.setDate(fertCheckDate.getDate() + fertCheckDays);
  const isFertCheckReady = today.getTime() >= fertCheckDate.getTime();
  const fertDateStr = `${fertCheckDate.getDate()}/${fertCheckDate.getMonth() + 1}/${fertCheckDate.getFullYear()}`;

  const diff = hd ? Math.ceil((hd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null;
  const isHatching = diff === 0 && egg.status === 'Intact';
  const isOverdue = (diff !== null && diff < 0) && egg.status === 'Intact';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      className={`relative group h-[580px] md:h-[650px] w-full max-w-[360px] mx-auto perspective-2000 ${egg.status === 'Failed' || egg.status === 'Broken' ? 'grayscale opacity-60' : ''}`}
    >
      {/* Background Laboratory Glow (Simulated) */}
      <div className="absolute inset-0 bg-slate-900 border border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.5)] rounded-[50%_50%_50%_50%_/_65%_65%_35%_35%] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(6,182,212,0.2),transparent_70%)]" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,rgba(6,182,212,0.03),transparent_120deg)] animate-[spin_15s_linear_infinite]" />
      </div>

      {/* Dynamic Ambient Glow */}
      <div className={`absolute inset-x-0 top-1/4 bottom-1/4 blur-[120px] opacity-25 transition-all duration-700 pointer-events-none ${
        isHatching ? 'bg-orange-500 shadow-[0_0_150px_rgba(249,115,22,0.6)]' :
        egg.isFertile === true ? 'bg-cyan-400 shadow-[0_0_150px_rgba(34,211,238,0.5)]' :
        egg.isFertile === false ? 'bg-red-400 shadow-[0_0_150px_rgba(239,68,68,0.5)]' :
        'bg-white/10'
      }`} />

      {/* Main Egg Structure with Winding Ribbons */}
      <div className="relative h-full flex flex-col gap-2 p-3 pointer-events-none">
        
        {/* RIBBON 1: Header (PetsBird Logo + Round) */}
        <div className="relative h-[16%] w-full pointer-events-auto">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-xl rounded-[120px_120px_30px_30px] flex flex-col items-center justify-center pt-8 pb-3 px-6 overflow-hidden">
             <div className="flex items-center gap-2 mb-1 relative z-10">
                <Bird className="w-5 h-5 text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.6)]" />
                <span className="text-[10px] font-black text-white tracking-[0.4em] uppercase">PetsBird</span>
             </div>
             <h5 className="text-lg md:text-xl font-black text-white/90 italic tracking-widest relative z-10">
               ROUND #{egg.eggNumber || egg.id.slice(-3)}
             </h5>
             
             <div className="absolute top-6 right-8 flex gap-1.5 z-20">
                <button onClick={() => onEdit(undefined as any, egg)} className="p-1.5 bg-white/5 hover:bg-cyan-500/20 text-white/40 hover:text-cyan-400 transition-all rounded-lg border border-white/10">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => onDelete(egg.id)} className="p-1.5 bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-all rounded-lg border border-white/10">
                  <X className="w-3.5 h-3.5" />
                </button>
             </div>
          </div>
        </div>

        {/* RIBBON 2: Primary KPIs (Dials) */}
        <div className="relative h-[25%] w-full pointer-events-auto">
          <div className="absolute inset-x-2 top-0 bottom-0 bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-[35px] flex flex-col items-center justify-center p-5 bg-gradient-to-b from-white/10 to-transparent">
             <div className="flex flex-col items-center justify-center w-full">
               <p className="text-[9px] font-black text-cyan-400/80 uppercase tracking-widest mb-1">Incubation Progress</p>
               <div className="text-5xl font-black text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.4)] tabular-nums">
                 {Math.round(progress)}%
               </div>
               <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase mt-3 border ${
                 progress < 100 ? 'bg-amber-500/20 text-amber-500 border-amber-500/30' : 'bg-green-500/20 text-green-400 border-green-500/30'
               }`}>
                 {progress < 100 ? `⏳ ${100 - Math.round(progress)}% Remaining` : '🥚 Ready to Hatch'}
               </div>
             </div>
             
             <div className="absolute bottom-0 inset-x-12 h-px bg-cyan-400/30" />
          </div>
        </div>

        {/* RIBBON 3: Full Date Indicators - Focus on clarity */}
        <div className="relative h-[24%] w-full pointer-events-auto">
          <div className="absolute inset-x-4 top-0 bottom-0 bg-white/5 backdrop-blur-md border border-white/15 shadow-xl rounded-[40px] px-4 flex justify-between items-center bg-gradient-to-r from-transparent via-white/5 to-transparent">
             <div className="flex flex-col items-center flex-1">
               <div className="w-9 h-9 rounded-full bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center mb-1.5">
                 <EggIcon className="w-4.5 h-4.5 text-cyan-400" />
               </div>
               <span className="text-[10px] font-black text-white tracking-widest leading-none mb-1">{egg.laidDate}</span>
               <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">Laid Date</span>
             </div>

             <div className="w-px h-10 bg-white/10 mx-1" />

             <div className="flex flex-col items-center flex-1">
               <div className="w-9 h-9 rounded-full bg-orange-950/40 border border-orange-500/30 flex items-center justify-center mb-1.5">
                 <Calendar className="w-4.5 h-4.5 text-orange-400" />
               </div>
               <span className="text-[10px] font-black text-white tracking-widest leading-none mb-1">{egg.hatchDate || 'N/A'}</span>
               <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">Est. Hatch</span>
             </div>

             <div className="w-px h-10 bg-white/10 mx-1" />

             <div className="flex flex-col items-center flex-1">
               <div className="w-9 h-9 rounded-full bg-purple-950/40 border border-purple-500/30 flex items-center justify-center mb-1.5">
                 <Clock className="w-4.5 h-4.5 text-purple-400" />
               </div>
               <span className="text-[12px] font-black text-white tracking-widest leading-none mb-1">{diff || 0}</span>
               <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">Days</span>
             </div>
          </div>
        </div>

        {/* RIBBON 4: Outcome Controls (Base) */}
        <div className="relative h-[32%] w-full pointer-events-auto">
          <div className="absolute inset-x-0 top-0 bottom-0 bg-slate-900/90 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-[40px_40px_150px_150px] p-6 flex flex-col items-center justify-center">
             
             {/* Fertility Check Group */}
             <div className="grid grid-cols-2 gap-3 w-full mb-3 relative z-10">
                <button 
                  disabled={egg.status !== 'Intact' || !isFertCheckReady}
                  onClick={() => onFertilityCheck(egg.id, true)}
                  className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${
                    egg.isFertile === true 
                      ? 'bg-cyan-500 border-cyan-300 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]' 
                      : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:border-cyan-500/40 hover:text-white'
                  } disabled:opacity-20`}
                >
                  Fertile
                </button>
                <button 
                  disabled={egg.status !== 'Intact' || !isFertCheckReady}
                  onClick={() => onFertilityCheck(egg.id, false)}
                  className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${
                    egg.isFertile === false 
                      ? 'bg-amber-600 border-amber-400 text-white shadow-[0_0_20px_rgba(217,119,6,0.3)]' 
                      : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:border-red-500/40 hover:text-white'
                  } disabled:opacity-20`}
                >
                  Clear
                </button>
             </div>

             {/* Outcome Management Group - Explicit buttons for Hatched, failed, DIS */}
             <div className="w-full space-y-2 relative z-10">
                {egg.isFertile === true && egg.status === 'Intact' && (
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => onHatchSuccess(egg)}
                      className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg hover:scale-[1.02] active:scale-95 transition-all border border-green-400/30 flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" /> فقص (HATCHED)
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => onHatchFailure(egg, "Did not hatch")}
                        className="py-2.5 bg-slate-800/80 hover:bg-red-500/20 text-white/40 hover:text-red-400 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all border border-white/5"
                      >
                        لم يفقص (FAILED)
                      </button>
                      <button 
                        onClick={() => onHatchFailure(egg, "Dead in Shell")}
                        className="py-2.5 bg-slate-800/80 hover:bg-red-500/20 text-white/40 hover:text-red-400 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all border border-white/5"
                      >
                        مات في البيضة (DIS)
                      </button>
                    </div>
                  </div>
                )}

                {egg.isFertile === false && egg.status === 'Intact' && (
                   <button 
                    onClick={() => onHatchFailure(egg, "Clear/Failed")}
                    className="w-full py-3 bg-red-600/10 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] border border-red-500/20 hover:bg-red-600 hover:text-white transition-all shadow-lg"
                  >
                    CLOSE ENTRY (فشل)
                  </button>
                )}

                {egg.status !== 'Intact' && (
                  <div className="w-full py-3 text-center text-white/30 text-[9px] uppercase font-black tracking-widest border border-white/5 rounded-2xl bg-white/5">
                    Process Complete
                  </div>
                )}
             </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const PublicBirdProfile = ({ bird, ancestors, isLoading, onBack }: { bird: BirdData | null, ancestors: BirdData[], isLoading: boolean, onBack: () => void }) => {
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center">
        <Loader2 className="w-12 h-12 text-accent-gold animate-spin mb-4" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Fetching Digital Records...</p>
      </div>
    );
  }

  if (!bird) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center">
        <Logo theme="dark" className="scale-125 mb-16" />
        <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center mb-8 border border-red-500/20">
           <X className="w-12 h-12 text-red-500" />
        </div>
        <h2 className="text-4xl font-black mb-4 tracking-tighter">ID Not Registered</h2>
        <p className="text-slate-400 max-w-sm mb-12 font-bold uppercase tracking-widest text-[10px] leading-relaxed">The digital bird ID you are searching for is not currently in the PetsBird global registry.</p>
        <button onClick={onBack} className="bg-primary text-white px-10 py-5 rounded-[32px] font-black shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest text-xs">
           Return to Home
        </button>
      </div>
    );
  }

  const profileUrl = `${window.location.origin}/bird/${bird.id}`;

  return (
    <div className="min-h-screen bg-slate-950 pb-24 overflow-x-hidden">
       {/* High-End Header */}
       <header className="p-6 md:p-10 flex items-center justify-between sticky top-0 bg-slate-950/90 backdrop-blur-2xl z-50 border-b border-white/5">
          <div onClick={onBack} className="cursor-pointer group flex items-center gap-4">
             <Logo theme="dark" variant="icon" className="w-10 h-10 group-hover:scale-110 transition-transform" />
             <div className="hidden md:block">
                <span className="block text-[10px] font-black text-accent-gold uppercase tracking-[0.3em]">PetsBird</span>
                <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-widest">Digital Registry</span>
             </div>
          </div>
          <div className="flex items-center gap-4">
             <button 
                onClick={() => {
                  const text = `Check out this bird on PetsBird: ${bird.name} (${bird.species}). View its digital profile and pedigree here: ${profileUrl}`;
                  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                }}
                className="px-6 py-3.5 bg-green-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-green-500/20 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
             >
                <Share2 className="w-4 h-4" /> Share on WhatsApp
             </button>
          </div>
       </header>

       <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start">
             
             {/* Left Column: Core Identity Card */}
             <div className="lg:col-span-4 space-y-8 sticky top-32">
                <motion.div 
                   initial={{ opacity: 0, y: 30 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="glass-dark p-3 rounded-[56px] border-white/5 shadow-2xl relative"
                >
                   <div className="aspect-[4/5] rounded-[48px] overflow-hidden bg-slate-900 border border-white/5 relative group">
                      <img 
                         src={bird.imageUrl || DEFAULT_BIRD_IMAGE} 
                         alt={bird.name} 
                         className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2000ms]"
                         referrerPolicy="no-referrer"
                      />
                      {/* Floating Status Badge */}
                      <div className="absolute top-8 left-8 flex flex-col gap-3">
                         <div className="flex items-center gap-2 px-5 py-2 bg-accent-gold text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-accent-gold/40 border border-white/20">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Verified Breeder Stock
                         </div>
                         <div className="px-5 py-2 bg-black/60 backdrop-blur-xl text-white rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 shadow-xl">
                            Ring: {bird.ring}
                         </div>
                      </div>
                   </div>
                </motion.div>

                <div className="space-y-4 px-4 text-center lg:text-left">
                   <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white leading-tight">
                      {bird.name}
                   </h1>
                   <p className="text-2xl text-slate-500 font-bold tracking-tight uppercase flex items-center justify-center lg:justify-start gap-4">
                      {bird.species}
                      <span className="w-2 h-2 bg-accent-gold rounded-full" />
                   </p>
                   <div className="flex flex-wrap justify-center lg:justify-start gap-3 pt-4">
                      <span className="px-6 py-2.5 bg-primary/20 text-primary border border-primary/20 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">{bird.mutation || 'Normal Mutation'}</span>
                      <span className={`px-6 py-2.5 border rounded-full text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 ${
                        bird.gender === 'Male' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-lg shadow-blue-500/10' : 'bg-pink-500/10 text-pink-400 border-pink-500/20 shadow-lg shadow-pink-500/10'
                      }`}>
                         <Bird className="w-3 h-3 saturate-0" />
                         {bird.gender} Sex
                      </span>
                   </div>
                </div>

                {/* Digital Passport Card */}
                <motion.div 
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   transition={{ delay: 0.4 }}
                   className="glass-dark p-8 rounded-[48px] border-white/5 flex items-center gap-8 shadow-inner"
                >
                   <div className="bg-white p-3 rounded-2xl shrink-0 shadow-2xl">
                      <QRCodeSVG value={profileUrl} size={110} level="H" />
                   </div>
                   <div className="space-y-2">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-gold">Global ID Passport</h4>
                      <p className="text-slate-500 text-[11px] font-bold leading-relaxed uppercase tracking-tight">
                         The identity of this bird is cryptographically signed and stored on the PetsBird management floor for instant verification.
                      </p>
                   </div>
                </motion.div>
             </div>

             <div className="lg:col-span-8 space-y-10">
                {/* Pedigree Section */}
                <motion.div 
                   initial={{ opacity: 0, scale: 0.98 }}
                   animate={{ opacity: 1, scale: 1 }}
                   transition={{ delay: 0.2 }}
                   className="glass-dark p-10 rounded-[64px] border-white/5 relative overflow-hidden"
                >
                   {/* Background Graphics */}
                   <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] -mr-32 -mt-32" />
                   
                   <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between mb-16 gap-6">
                      <div className="space-y-2">
                         <h3 className="text-3xl font-black text-white tracking-tighter">Digital Pedigree</h3>
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-1 bg-accent-gold rounded-full" />
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">3-Generation Verified Lineage</p>
                         </div>
                      </div>
                      <div className="p-4 rounded-3xl bg-white/5 border border-white/10 shrink-0">
                         <GitBranch className="w-8 h-8 text-accent-gold" />
                      </div>
                   </div>
                   
                   {/* Pedigree Tree Container */}
                   <div className="relative p-6 md:p-12 rounded-[56px] bg-black/30 border border-white/5 shadow-2xl overflow-x-auto no-scrollbar custom-scrollbar">
                      <div className="min-w-[800px]">
                         <PedigreeTree 
                            birdId={bird.id} 
                            birds={ancestors} 
                            onBirdClick={(id) => {
                               // Deep link to another bird if clicked
                               window.history.pushState({}, '', `/bird/${id}`);
                               window.dispatchEvent(new Event('popstate'));
                            }} 
                         />
                      </div>
                   </div>
                </motion.div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                      className="glass-dark p-10 rounded-[48px] border-white/5 flex flex-col justify-between"
                   >
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-12">Performance Summary</h4>
                      <div className="grid grid-cols-2 gap-10">
                         <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                               <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> State
                            </p>
                            <p className="text-2xl font-black text-white">{bird.status || 'Active'}</p>
                         </div>
                         <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                               <Calendar className="w-3 h-3" /> Vintage
                            </p>
                            <p className="text-2xl font-black text-white">{bird.birthYear}</p>
                         </div>
                      </div>
                      <div className="mt-12 pt-8 border-t border-white/5">
                         <div className="flex items-center gap-4">
                            <div className="w-1.5 h-8 bg-accent-gold rounded-full" />
                            <div>
                               <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Breeder Efficiency</p>
                               <p className="text-white font-black text-sm uppercase">Elite Status Level</p>
                            </div>
                         </div>
                      </div>
                   </motion.div>

                   <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 }}
                      className="glass-dark p-10 rounded-[48px] border-white/10 flex items-center gap-8 shadow-2xl relative group overflow-hidden"
                   >
                      {/* Shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-accent-gold/0 via-accent-gold/5 to-accent-gold/0 -translate-x-full group-hover:translate-x-full transition-transform duration-[1500ms]" />
                      
                      <div className="w-20 h-20 rounded-[28px] bg-accent-gold/10 flex items-center justify-center shrink-0 border border-accent-gold/20 shadow-inner">
                         <Shield className="w-10 h-10 text-accent-gold" />
                      </div>
                      <div className="space-y-2">
                         <h4 className="font-black text-white uppercase text-sm tracking-widest leading-tight">Authenticity <br /> Guaranteed</h4>
                         <p className="text-[10px] font-bold text-slate-500 uppercase tracking-normal leading-relaxed">
                            This record is cryptographically indexed in the global avicultural inventory.
                         </p>
                      </div>
                   </motion.div>
                </div>

                {/* Footer Disclaimer */}
                <div className="text-center md:text-left px-10">
                   <p className="text-slate-600 text-[9px] font-bold uppercase tracking-[0.2em] leading-relaxed">
                      Generated at {new Date().toLocaleDateString()} — Powered by PetsBird Global Aviary Intelligence <br />
                      This record serves as an official breeder's digital passport.
                   </p>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};

const uploadImageWithTimeout = async (file: File, userId: string): Promise<string> => {
  const DEFAULT_BIRD_IMAGE = "https://images.unsplash.com/photo-1522926193341-e9fed6c10841?auto=format&fit=crop&q=80&w=400";
  
  // File type check
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (!allowedTypes.includes(file.type.toLowerCase())) {
    console.warn("Unsupported file type:", file.type, "using default image");
    return DEFAULT_BIRD_IMAGE;
  }

  return new Promise((resolve) => {
    const timeoutId = setTimeout(() => {
      console.warn("Upload timed out (5s), using default image as fallback");
      resolve(DEFAULT_BIRD_IMAGE);
    }, 5000);

    const storageRef = ref(storage, `birds/${userId}/${Date.now()}_${file.name.replace(/\s+/g, '_')}`);
    
    uploadBytes(storageRef, file)
      .then(async (snapshot) => {
        const url = await getDownloadURL(snapshot.ref);
        clearTimeout(timeoutId);
        resolve(url);
      })
      .catch((error) => {
        console.error("Firebase Storage Upload failed:", error);
        clearTimeout(timeoutId);
        resolve(DEFAULT_BIRD_IMAGE);
      });
  });
};

export default function App() {
  return (
    <AppContent />
  );
}

function AppContent() {
  const [showApp, setShowApp] = useState(false);
  const [landingTab, setLandingTab] = useState("Home");
  const [language, setLanguage] = useState<'en' | 'ar'>('en');

  const NEWS_ARTICLES = [
    { 
      id: "new-mutation-canary",
      title: "New Mutation Discovered in Canary Species", 
      date: "April 5, 2026", 
      desc: "Researchers have identified a rare color mutation in the Gloster Canary, opening new possibilities for breeders.",
      img: "https://images.unsplash.com/photo-1522926126624-397114120a77?auto=format&fit=crop&q=80&w=600",
      content: `A groundbreaking discovery has been made in the world of aviculture. A previously undocumented color mutation has been identified in a population of Gloster Canaries in Western Europe.

Experts describe the mutation as a unique 'iridescent frost' effect on the feathers, which appears to be inherited as a recessive trait. This discovery is expected to spark significant interest among high-end exhibitors.

Breeding trials are currently underway to stabilize the mutation and understand its full genetic potential. PetsBird users will be the first to receive the updated genetic mapping for this new trait.`
    },
    { 
      id: "global-bird-expo-2026",
      title: "Global Bird Expo 2026 Announced", 
      date: "March 28, 2026", 
      desc: "The world's largest aviculture event will take place in Madrid this October, featuring over 500 exhibitors.",
      img: "https://images.unsplash.com/photo-1444464666168-49d633b86797?auto=format&fit=crop&q=80&w=600",
      content: `The International Avian Federation has officially announced the dates for the Global Bird Expo 2026. This year's event promises to be the largest in history, with Madrid serving as the host city.

The expo will feature specialized pavilions for different bird families, workshops led by world-renowned geneticists, and a massive marketplace for rare species.

PetsBird will have a dedicated booth at the event, showcasing our latest AI-driven management tools. We invite all our users to join us for exclusive live demonstrations and networking opportunities.`
    },
    { 
      id: "ai-genetic-mapping-advances",
      title: "Advances in AI Genetic Mapping", 
      date: "March 15, 2026", 
      desc: "PetsBird's latest update improves mutation prediction accuracy for rare parrot species by 15%.",
      img: "https://images.unsplash.com/photo-1555008889-51830030f4ba?auto=format&fit=crop&q=80&w=600",
      content: `Our engineering team has achieved a major milestone in AI-driven genetics. The latest update to the PetsBird engine incorporates a new neural network architecture specifically optimized for complex parrot mutations.

By analyzing over 500,000 successful breeding records, the AI can now predict offspring outcomes with 15% higher accuracy for species like the African Grey and various Macaw mutations.

This update is now live for all Premium users. We continue to push the boundaries of what's possible in digital aviary management to help you breed with absolute confidence.`
    }
  ];

  const ADVICE_ARTICLES = [
    { 
      id: "cockatiel-breeding-guide",
      title: "Cockatiel Breeding Secrets: How I Successfully Raised 10 Chicks in One Month", 
      category: "Breeding Guide", 
      desc: "How I successfully raised 10 chicks in one month in my Morocco bird room.",
      icon: "🦜",
      img: "https://images.unsplash.com/photo-1552728089-57bdde30eba3?auto=format&fit=crop&q=80&w=600",
      content: `### Introduction
In March 2026, my 70m² bird room in Morocco witnessed an extraordinary success. This guide shares the secrets behind raising 10 healthy cockatiel chicks in a single month.

### The Breeding Environment
Preparation is key. Ensure your bird room is optimized:
- **Temperature:** Maintain a stable 22-25°C.
- **Lighting:** 12-14 hours of full-spectrum light to simulate spring.
- **Humidity:** 50-60% to prevent egg dehydration.

### Nutrition Strategy
Before laying, focus on high-quality fuel:
- **Calcium:** Cuttlebone and mineral blocks are mandatory.
- **Protein:** Egg food and sprouted seeds provide the building blocks for strong shells and healthy embryos.

### Step-by-Step Success
From the first egg to the 10th chick, monitoring is vital. Check nests daily but minimize disturbance. Ensure parents are feeding all chicks equally.

### Conclusion
Maintaining high productivity in large bird rooms requires discipline, hygiene, and a deep understanding of your birds' needs.`
    },
    { 
      id: "feeding-15-day-old-chicks",
      title: "The Ultimate Feeding Chart for 15-Day-Old Bird Chicks: Faster Growth & Stronger Immunity", 
      category: "Nutrition", 
      desc: "The ultimate feeding chart for faster growth and stronger immunity.",
      icon: "🥣",
      img: "https://images.unsplash.com/photo-1551085254-e96b210db58a?auto=format&fit=crop&q=80&w=600",
      content: `### Why 15 Days is Critical
At 15 days, chicks enter a massive growth spurt. Their nutritional demands peak as feathers begin to emerge and their immune systems develop.

### The Nutrition Mix
Use a high-quality hand-rearing formula. Consider supplements like **Muta-Vit** to support feather development and overall vitality.

### Feeding Frequency
- **Frequency:** 4-5 times per day.
- **Temperature:** The formula MUST be between 38°C and 40°C. Cold formula can cause crop stasis.

### Monitoring Crops
A healthy crop should empty almost completely between feedings. If it remains full, the chick may be having digestive issues.

### Common Mistakes
- **Overfeeding:** Can stretch the crop and cause permanent damage.
- **Cold Formula:** Leads to slow digestion and potential bacterial growth.`
    },
    { 
      id: "preventing-spring-chick-mortality",
      title: "Troubleshooting Spring Breeding: How to Prevent Chick Mortality in the Nest", 
      category: "Health", 
      desc: "Troubleshooting spring breeding and keeping your nest healthy.",
      icon: "🛡️",
      img: "https://images.unsplash.com/photo-1452570053594-1b985d6ea890?auto=format&fit=crop&q=80&w=600",
      content: `### The Spring Challenge
Spring brings fluctuating temperatures and increased bacterial activity. These factors can be deadly for vulnerable chicks.

### Hygiene & Prevention
Cleanliness is your first line of defense. Use products like **Teccox** to prevent Coccidiosis and other common parasites that thrive in nesting material.

### The "Sweating Sickness" & Humidity
Excessive humidity in the nest box can lead to "sweating sickness." Ensure proper ventilation to keep the nesting material dry but not brittle.

### Parental Care Issues
Watch for parents plucking feathers or stopping feeding. This often indicates stress or underlying health issues in the parents themselves.

### Daily Checklist
- Check all chicks for full crops.
- Inspect nesting material for dampness.
- Monitor parent behavior for signs of aggression or neglect.`
    },
    { 
      id: "ultimate-breeding-guide",
      title: "The Ultimate Breeding Guide", 
      category: "Education", 
      desc: "Ensure your birds get the right balance of seeds, greens, and calcium.",
      icon: "🍎",
      img: "https://images.unsplash.com/photo-1551085254-e96b210db58a?auto=format&fit=crop&q=80&w=600",
      content: `Successful breeding starts with preparation. This guide covers everything from selecting the right pairs based on genetic compatibility to preparing the ideal nesting environment.

Key factors include maintaining a stable temperature, providing high-quality nesting materials, and ensuring your birds are in peak physical condition before the season begins.

We also explore the importance of light cycles and how they trigger breeding instincts in different species like Canaries and Cockatiels.`
    },
    { 
      id: "nutrition-peak-performance",
      title: "Nutrition for Peak Performance", 
      category: "Care", 
      desc: "Diet is the foundation of a healthy aviary.",
      icon: "🥗",
      img: "https://images.unsplash.com/photo-1452570053594-1b985d6ea890?auto=format&fit=crop&q=80&w=600",
      content: `Diet is the foundation of a healthy aviary. During the breeding season, birds require increased protein, calcium, and essential vitamins to produce healthy eggs and strong chicks.

Learn about the benefits of sprouted seeds, egg food, and fresh vegetables. We provide a seasonal feeding schedule that adapts to the specific needs of your birds throughout the year.

Proper hydration and mineral supplements are also discussed to prevent common issues like egg binding.`
    },
    { 
      id: "mastering-market-trends",
      title: "Mastering Market Trends", 
      category: "Business", 
      desc: "The world of rare bird mutations is constantly evolving.",
      icon: "📈",
      img: "https://images.unsplash.com/photo-1520808663317-647b476a81b9?auto=format&fit=crop&q=80&w=600",
      content: `The world of rare bird mutations is constantly evolving. To succeed as a professional breeder, you must understand which mutations are currently in high demand and how to price your birds competitively.

This article analyzes global market data to identify emerging trends in the Cockatiel and Lovebird markets. We also provide tips on how to build a reputable brand as a breeder.

Networking with other professionals and maintaining detailed lineage records are key to increasing the value of your aviary.`
    }
  ];

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
    const errInfo: FirestoreErrorInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: user?.uid,
        email: user?.email,
        emailVerified: user?.emailVerified,
      },
      operationType,
      path
    };
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    setConfirmModal({
      isOpen: true,
      title: "Database Error",
      message: `خطأ في قاعدة البيانات: ${errInfo.error}\nيرجى التأكد من إعدادات Firebase وقواعد الحماية.`,
      variant: 'danger',
      confirmText: "حسناً",
      onConfirm: () => setConfirmModal(prev => ({ ...prev, isOpen: false }))
    });
  };

  useEffect(() => {
    const handleNavigation = () => {
      const path = window.location.pathname.replace('/', '');
      const validTabs = ["Home", "Features", "Genetics", "Advice", "About", "News", "Terms", "Privacy", "Contact", "Marketplace"];
      
      if (path.startsWith('bird/')) {
        const id = path.split('/')[1];
        if (id) {
          loadPublicBird(id);
          setShowPublicProfile(true);
          setShowApp(false);
          setShowAuthPage(false);
          return;
        }
      }

      setShowPublicProfile(false);
      
      if (validTabs.includes(path)) {
        setLandingTab(path);
        window.scrollTo(0, 0);
      } else if (path.startsWith('News/') || path.startsWith('Advice/') || path.startsWith('Features/') || path.startsWith('Genetics/')) {
        // Handle article, feature, and genetics deep links
        const [type, id] = path.split('/');
        let article = null;
        
        if (type === 'News') {
          article = NEWS_ARTICLES.find(a => a.id === id);
        } else if (type === 'Advice') {
          article = ADVICE_ARTICLES.find(a => a.id === id);
        } else if (type === 'Features') {
          const features = [
            {
              id: "inventory-management",
              title: "Inventory Management",
              category: "Core Feature",
              img: "https://images.unsplash.com/photo-1552728089-57bdde30eba3?auto=format&fit=crop&q=80&w=1000",
              content: `Our Inventory Management system is designed to handle thousands of birds with ease. Every bird is assigned a unique digital profile where you can store its ring number, species, mutation, and birth date.

Lineage tracking is automated, allowing you to view an interactive pedigree tree for any bird in your collection. This is essential for maintaining genetic diversity and proving the value of your stock to potential buyers.

The system also includes a comprehensive health log. You can record vaccinations, treatments, and general health observations, ensuring that every bird in your aviary receives the care it needs.`
            },
            {
              id: "breeding-pairs",
              title: "Breeding Pairs",
              category: "Breeding",
              img: "https://images.unsplash.com/photo-1555008889-51830030f4ba?auto=format&fit=crop&q=80&w=1000",
              content: `Managing breeding pairs has never been simpler. PetsBird allows you to create digital 'couples' and track their performance over multiple seasons.

You can monitor success rates, average clutch sizes, and the quality of offspring produced by each pair. This data-driven approach helps you make informed decisions about which pairs to maintain and which to retire.

The system also alerts you to potential genetic risks, such as inbreeding or incompatible mutations, before you even set the pair up.`
            },
            {
              id: "egg-monitoring",
              title: "Egg Monitoring",
              category: "Automation",
              img: "https://images.unsplash.com/photo-1516233501032-2475d32c3741?auto=format&fit=crop&q=80&w=1000",
              content: `The Egg Monitoring system is the heart of our automation tools. Once an egg is laid, simply log it in the app, and PetsBird will calculate the expected hatch date based on the species' specific incubation period.

You'll receive automated notifications for fertility checks and hatching alerts, so you never miss a critical moment in the nest.

The system also tracks failure reasons (e.g., infertile, broken, dead in shell), providing you with valuable insights into your aviary's overall productivity and identifying areas for improvement.`
            },
            {
              id: "financial-tracking",
              title: "Financial Tracking",
              category: "Business",
              img: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=1000",
              content: `Turn your passion into a professional business with our Financial Tracking tools. Log every expense, from seed and supplements to vet bills and equipment.

Track your sales and revenue to get a clear picture of your aviary's profitability. The system generates detailed reports, helping you understand your return on investment for different species or mutations.

With PetsBird, you can manage your aviary's budget with the same precision as a professional enterprise.`
            },
            {
              id: "health-records",
              title: "Health Records",
              category: "Care",
              img: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1000",
              content: `Maintaining a healthy aviary is paramount. Our Health Records system allows you to maintain a digital medical history for every bird.

Schedule recurring treatments like deworming or vitamin supplements, and receive reminders when they are due. You can also upload vet certificates and lab results directly to a bird's profile.

In the event of an outbreak, the system helps you quickly identify which birds have been treated and which are at risk, allowing for rapid and effective quarantine measures.`
            },
            {
              id: "cage-mapping",
              title: "Cage Mapping",
              category: "Organization",
              img: "https://images.unsplash.com/photo-1551085254-e96b210db58a?auto=format&fit=crop&q=80&w=1000",
              content: `Visualize your entire aviary with our interactive Cage Mapping tool. Define your rooms, blocks, and individual cages to create a digital twin of your physical setup.

Easily move birds between cages with a simple drag-and-drop interface. The system tracks the history of every cage, showing you which birds have occupied it and its current status (e.g., occupied, empty, needs cleaning).

This spatial organization is particularly useful for large-scale breeders managing multiple rooms or species.`
            }
          ];
          article = features.find(a => a.id === id);
        } else if (type === 'Genetics') {
          const genetics = [
            { 
              id: "mutation-prediction",
              title: "Mutation Prediction", 
              category: "AI Engine", 
              img: "https://images.unsplash.com/photo-1522926126624-397114120a77?auto=format&fit=crop&q=80&w=600",
              content: `Our AI Mutation Predictor is the most advanced tool in the aviculture industry. By analyzing the genetic profiles of both parents, the system calculates the exact probability of every possible offspring mutation.

Whether you are working with simple recessive traits or complex multi-mutation combinations, our engine provides a clear percentage breakdown of the results.

This allows you to plan your breeding season with scientific precision, ensuring you focus on the pairs that have the highest potential for producing rare and valuable mutations.`
            },
            { 
              id: "inheritance-patterns",
              title: "Inheritance Patterns", 
              category: "Education", 
              img: "https://images.unsplash.com/photo-1555008889-51830030f4ba?auto=format&fit=crop&q=80&w=600",
              content: `Understanding inheritance patterns is key to successful breeding. This guide breaks down the fundamental principles of avian genetics, including dominant, recessive, and sex-linked traits.

We explain how different mutations interact with each other and how to identify 'split' birds that carry hidden genetic information.

Mastering these patterns will help you predict not just the color of your birds, but also their physical characteristics and overall quality.`
            },
            { 
              id: "genetic-diversity",
              title: "Genetic Diversity", 
              category: "Breeding Guide", 
              img: "https://images.unsplash.com/photo-1444464666168-49d633b86797?auto=format&fit=crop&q=80&w=600",
              content: `Maintaining genetic diversity is essential for the long-term health and sustainability of your aviary. Inbreeding can lead to weakened immune systems, reduced fertility, and physical deformities.

PetsBird's lineage tracking system automatically calculates the Coefficient of Inbreeding (COI) for every potential pairing, alerting you to high-risk combinations.

Learn how to introduce new bloodlines effectively and how to maintain a diverse genetic pool while still focusing on specific mutation goals.`
            }
          ];
          article = genetics.find(a => a.id === id);
        }
        
        if (article) {
          setSelectedArticle(article);
          setIsArticleModalOpen(true);
          setLandingTab(type);
        }
      } else if (!path || path === "") {
        setLandingTab("Home");
      }
    };

    window.addEventListener('popstate', handleNavigation);
    handleNavigation(); // Initial check

    return () => {
      window.removeEventListener('popstate', handleNavigation);
    };
  }, []);

  const navigateToTab = (tab: string, newTab = false) => {
    const path = tab === "Home" ? "/" : `/${tab}`;
    if (newTab) {
      window.open(window.location.origin + path, '_blank');
    } else {
      window.history.pushState({}, '', path);
      // Trigger handleNavigation manually since pushState doesn't trigger popstate
      const navEvent = new Event('popstate');
      window.dispatchEvent(navEvent);
    }
  };

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("Dashboard");


  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showAuthPage, setShowAuthPage] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authSuccessMessage, setAuthSuccessMessage] = useState("");
  const [isAuthProcessing, setIsAuthProcessing] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Handle initial routing based on pathname
    const path = window.location.pathname.toLowerCase().replace(/\/$/, "");
    if (path === '/auth' || path === '/app') {
      if (!user) {
        setShowAuthPage(true);
      } else {
        setShowApp(true);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [user]);

  const handleLaunchApp = () => {
    const appPath = window.location.origin + (user ? '/app' : '/auth');
    window.open(appPath, '_blank');
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      setIsInstallModalOpen(true);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log("Auth state changed:", currentUser?.email);
      if (currentUser) {
        const isGoogleUser = currentUser.providerData.some(p => p.providerId === 'google.com');
        if (currentUser.emailVerified || isGoogleUser) {
          // Check if user profile exists, if not create it
          const userDocRef = doc(db, "users", currentUser.uid);
          try {
            const userDoc = await getDoc(userDocRef);
            if (!userDoc.exists()) {
              const newProfile = {
                userId: currentUser.uid,
                name: currentUser.displayName || "مربي جديد",
                email: currentUser.email || "",
                location: "",
                avatar: currentUser.photoURL || (currentUser.displayName ? currentUser.displayName.substring(0, 2).toUpperCase() : "??"),
                welcomeEmailSent: true,
                createdAt: new Date().toISOString()
              };
              await setDoc(userDocRef, newProfile);
              setUserProfile(newProfile);
              
              // Simulate sending welcome email
              console.log("%c📧 Welcome Email Sent to " + currentUser.email, "color: #1A73E8; font-weight: bold; font-size: 14px;");
              console.log("%c--------------------------------------------------", "color: #ccc;");
              console.log("%cSubject: Welcome to the PetsBird Global Community! 🐦", "font-weight: bold;");
              console.log("Hello " + (currentUser.displayName || "Breeder") + ",\n\nWelcome to PetsBird! We're thrilled to have you as part of our global community of passionate breeders.\n\nYour aviary management just got a whole lot smarter. Start tracking your birds, calculating hatch dates, and exploring genetic mutations today.\n\nHappy Breeding!\nThe PetsBird Team");
              console.log("%c--------------------------------------------------", "color: #ccc;");
            } else {
              const data = userDoc.data();
              setUserProfile({
                name: data.name || "مربي جديد",
                location: data.location || "",
                email: data.email || currentUser.email || "",
                avatar: data.avatar || (data.name ? data.name.substring(0, 2).toUpperCase() : "??")
              });
            }
          } catch (error) {
            console.error("Error checking/creating user profile:", error);
          }
        }
      }
      setUser(currentUser);
      setAuthLoading(false);
      setIsAuthProcessing(false); // Ensure processing is cleared on state change
    });
    return () => unsubscribe();
  }, []);

  // Safety timeout for auth loading
  useEffect(() => {
    if (authLoading) {
      const timer = setTimeout(() => {
        console.warn("Auth loading timeout reached");
        setAuthLoading(false);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [authLoading]);

  // Safety timeout for auth processing
  useEffect(() => {
    if (isAuthProcessing) {
      const timer = setTimeout(() => {
        console.warn("Auth processing timeout reached");
        setIsAuthProcessing(false);
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, [isAuthProcessing]);

  useEffect(() => {
    if (authLoading || isAuthProcessing) return;

    const path = window.location.pathname.toLowerCase().replace(/\/$/, "");
    
    if (user) {
      const isGoogleUser = user.providerData.some(p => p.providerId === 'google.com');
      if (user.emailVerified || isGoogleUser) {
        // If logged in and on auth or home, go to app
        if (path === '/auth' || path === '' || showAuthPage) {
          setShowApp(true);
          setShowAuthPage(false);
          if (path !== '/app') {
            window.history.pushState({}, '', '/app');
          }
        } else if (path === '/app') {
          setShowApp(true);
          setShowAuthPage(false);
        }
      } else {
        setShowApp(false);
        setShowAuthPage(true);
        setAuthError("يرجى تأكيد بريدك الإلكتروني لتتمكن من الدخول.");
      }
    } else {
      if (path === '/app' || path === '/auth') {
        setShowAuthPage(true);
        setShowApp(false);
      } else {
        // On home page, ensure app is hidden unless explicitly shown
        if (!showAuthPage) {
          setShowApp(false);
        }
      }
    }
  }, [user, authLoading, isAuthProcessing, showAuthPage]);

  const handleGoogleSignIn = async (e?: MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log("Initiating Google Sign-In with Popup...");
    setAuthError("");
    setIsAuthProcessing(true);
    
    try {
      // Ensure select_account to avoid silent failures or unintended account usage
      googleProvider.setCustomParameters({ prompt: 'select_account' });
      
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      console.log("Google Sign-In successful for:", user.email);
      
      // Explicit Firestore check/creation
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        console.log("Creating new user profile in Firestore...");
        await setDoc(userDocRef, {
          userId: user.uid,
          name: user.displayName || "مربي جديد",
          email: user.email || "",
          location: "",
          avatar: user.photoURL || (user.displayName ? user.displayName.substring(0, 2).toUpperCase() : "??"),
          welcomeEmailSent: true,
          createdAt: new Date().toISOString()
        });
        
        console.log("%c📧 Welcome Email Sent to " + user.email, "color: #1A73E8; font-weight: bold; font-size: 14px;");
      }
      
      // Explicit navigation to app AFTER successful auth and profile check
      console.log("Navigating to Dashboard...");
      setShowApp(true);
      setShowAuthPage(false);
      
      // Update URL without reload
      if (window.location.pathname !== '/app') {
        window.history.pushState({}, '', '/app');
      }
      
    } catch (error: any) {
      console.error("Error signing in with Google:", error);
      // Don't show error if user just closed the popup
      if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
        let message = "فشل تسجيل الدخول. يرجى المحاولة مرة أخرى.";
        if (error.code === 'auth/unauthorized-domain') {
          message = "هذا النطاق غير مصرح به في إعدادات Firebase. يرجى إضافة النطاق الحالي إلى Authorized Domains.";
        } else if (error.code === 'auth/operation-not-allowed') {
          message = "تسجيل الدخول عبر جوجل غير مفعل في Firebase Console.";
        } else if (error.code === 'auth/configuration-not-found') {
          message = "خطأ في إعدادات Firebase. يرجى التحقق من apiKey و authDomain.";
        }
        setAuthError(`${message} (${error.code})`);
      }
    } finally {
      setIsAuthProcessing(false);
    }
  };

  const handleEmailAuth = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccessMessage("");
    setIsAuthProcessing(true);
    try {
      if (authMode === "register") {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(userCredential.user);
        setAuthSuccessMessage("تم إرسال رابط التأكيد إلى بريدك الإلكتروني. يرجى التحقق من صندوق الوارد.");
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        if (!userCredential.user.emailVerified) {
          setAuthError("يرجى تأكيد بريدك الإلكتروني أولاً.");
          await signOut(auth);
        } else {
          // Explicit navigation on success
          setShowApp(true);
          setShowAuthPage(false);
          if (window.location.pathname !== '/app') {
            window.history.pushState({}, '', '/app');
          }
        }
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      let message = "فشلت عملية المصادقة";
      if (error.code === 'auth/email-already-in-use') message = "هذا البريد الإلكتروني مستخدم بالفعل";
      if (error.code === 'auth/invalid-email') message = "بريد إلكتروني غير صالح";
      if (error.code === 'auth/weak-password') message = "كلمة المرور ضعيفة جداً";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') message = "البريد الإلكتروني أو كلمة المرور غير صحيحة";
      setAuthError(message);
    } finally {
      setIsAuthProcessing(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setAuthError("يرجى إدخال بريدك الإلكتروني أولاً");
      return;
    }
    setAuthError("");
    setAuthSuccessMessage("");
    try {
      await sendPasswordResetEmail(auth, email);
      setAuthSuccessMessage("تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.");
    } catch (error: any) {
      console.error("Reset error:", error);
      setAuthError("فشل إرسال رابط إعادة التعيين. تأكد من صحة البريد الإلكتروني.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setShowApp(false);
      setShowAuthPage(false);
      setLandingTab("Home");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCoupleModalOpen, setIsCoupleModalOpen] = useState(false);
  const [isEggModalOpen, setIsEggModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    variant?: 'danger' | 'success' | 'info';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "تأكيد",
    variant: 'info',
    onConfirm: () => {}
  });

  const DEFAULT_BIRD_IMAGE = "https://images.unsplash.com/photo-1552728089-57bdde30ebd3?auto=format&fit=crop&q=80&w=400";

  const addNotification = (title: string, message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    const id = Date.now();
    setNotifications(prev => [
      { 
        id, 
        title, 
        message, 
        time: "Just now", 
        read: false,
        // @ts-ignore
        type 
      },
      ...prev.slice(0, 19)
    ]);

    // Auto-remove toast after 3 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };
  const [hatchFailureEgg, setHatchFailureEgg] = useState<EggData | null>(null);
  const [failureReason, setFailureReason] = useState("");
  const [pedigreeBirdId, setPedigreeBirdId] = useState<string | null>(null);
  const [isPedigreeModalOpen, setIsPedigreeModalOpen] = useState(false);
  const [parentEditContext, setParentEditContext] = useState<{
    childId: string;
    type: 'father' | 'mother';
  } | null>(null);
  const [isParentModalOpen, setIsParentModalOpen] = useState(false);
  const [manualParentName, setManualParentName] = useState("");
  const [isAddingParentManual, setIsAddingParentManual] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [selectedCoupleForStats, setSelectedCoupleForStats] = useState<CoupleData | null>(null);
  const [aiBreedingReport, setAiBreedingReport] = useState<any | null>(null);
  const [isGeneratingAIReport, setIsGeneratingAIReport] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const dashboardRef = useRef<HTMLDivElement>(null);

  const loadPublicBird = async (id: string) => {
    setIsPublicLoading(true);
    try {
      // Find bird across all users using collectionGroup
      // Note: This requires a Firestore index
      const q = query(collectionGroup(db, 'birds'), where('id', '==', id));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const birdDoc = querySnapshot.docs[0];
        const birdData = birdDoc.data() as BirdData;
        setPublicBird(birdData);
        
        // Fetch ancestors for the pedigree tree
        const ancestors: BirdData[] = [birdData];
        const loadedIds = new Set([birdData.id]);

        const fetchAncestors = async (b: BirdData, depth: number) => {
          if (depth >= 3) return;
          
          const parentsToFetch = [];
          if (b.fatherId && !loadedIds.has(b.fatherId)) parentsToFetch.push(b.fatherId);
          if (b.motherId && !loadedIds.has(b.motherId)) parentsToFetch.push(b.motherId);

          for (const pId of parentsToFetch) {
            const pQ = query(collectionGroup(db, 'birds'), where('id', '==', pId));
            const pSnap = await getDocs(pQ);
            if (!pSnap.empty) {
              const pData = pSnap.docs[0].data() as BirdData;
              ancestors.push(pData);
              loadedIds.add(pId);
              await fetchAncestors(pData, depth + 1);
            }
          }
        };

        await fetchAncestors(birdData, 1);
        setPublicAncestors(ancestors);
      } else {
        setPublicBird(null);
      }
    } catch (error) {
      console.error("Error loading public bird profile:", error);
      addNotification("Error", "Could not load the bird profile. It might be private or deleted.", 'warning');
    } finally {
      setIsPublicLoading(false);
    }
  };

  const handleShareWhatsApp = (bird: BirdData) => {
    const url = `${window.location.origin}/bird/${bird.id}`;
    const text = `Check out this bird on PetsBird: ${bird.name} (${bird.species}). View its digital profile and pedigree here: ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const downloadUserData = () => {
    const data = {
      birds,
      couples,
      eggs,
      exportDate: new Date().toISOString(),
      user: user?.email
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PetsBird_Backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    addNotification("Backup Complete", "Your data has been successfully exported as a JSON file.", 'success');
  };

  const handleFeedbackSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !feedbackText.trim()) return;
    
    try {
      await addDoc(collection(db, "feedback"), {
        userId: user.uid,
        userEmail: user.email,
        text: feedbackText,
        timestamp: new Date().toISOString()
      });
      setIsFeedbackModalOpen(false);
      setFeedbackText("");
      setConfirmModal({
        isOpen: true,
        title: "Feedback Received",
        message: "Thank you for your feedback! We'll review it and get back to you if needed.",
        variant: 'success',
        confirmText: "Close",
        onConfirm: () => setConfirmModal(prev => ({ ...prev, isOpen: false }))
      });
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }
  };

  const handleHatchSuccess = async (egg: EggData) => {
    if (!user) return;
    const couple = couples.find(c => c.id === egg.coupleId);
    if (!couple) return;

    const female = birds.find(b => b.id === couple.femaleId);
    
    // 1. Create new bird
    const birdId = Math.floor(10000 + Math.random() * 90000).toString();
    const newBirdData: BirdData & { userId: string } = {
      id: birdId,
      name: `Chick #${egg.eggNumber || egg.id.slice(-3)}`,
      ring: "Pending",
      species: female?.species || "Unknown",
      mutation: "Normal", // User can edit this manually
      gender: "Unknown",
      age: 0,
      birthYear: new Date().toISOString().split('T')[0],
      date: new Date().toISOString().split('T')[0],
      cage: female?.cage || "1",
      status: "Chick",
      fatherId: couple.maleId,
      motherId: couple.femaleId,
      lineage: couple.id,
      userId: user.uid
    };

    // 2. Update egg status
    const updatedEgg: EggData = {
      ...egg,
      status: 'Completed'
    };

    try {
      await setDoc(doc(db, "users_data", user.uid, "birds", birdId), newBirdData);
      await setDoc(doc(db, "users_data", user.uid, "eggs", egg.id), updatedEgg);
      
      addNotification("New Chick!", `Egg #${egg.id} hatched successfully! A new chick has been added to your birds.`, 'success');

      setConfirmModal({
        isOpen: true,
        title: "Success",
        message: "تمت إضافة الفرخ الجديد بنجاح إلى قائمة طيورك!",
        variant: 'success',
        confirmText: "حسناً",
        onConfirm: () => setConfirmModal(prev => ({ ...prev, isOpen: false }))
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "hatch_success");
    }
  };

  const handleHatchFailure = async (egg: EggData, reason: string) => {
    if (!user) return;
    try {
      const status = reason === 'Dead in Shell' ? 'DeadInShell' : 'Failed';
      // Archive instead of delete to keep in statistics
      const updatedEgg: EggData = {
        ...egg,
        status,
        failureReason: reason
      };
      
      await setDoc(doc(db, "users_data", user.uid, "eggs", egg.id), updatedEgg);
      setHatchFailureEgg(null);
      setFailureReason("");
      
      addNotification(reason, `Egg #${egg.eggNumber || egg.id.slice(-3)} marked as ${reason}.`, 'warning');
      
      setConfirmModal({
        isOpen: true,
        title: "Egg Archived",
        message: `تم أرشفة البيضة بنجاح كبيضة فاشلة (السبب: ${reason}). ستبقى في إحصائيات الزوج.`,
        variant: 'info',
        confirmText: "حسناً",
        onConfirm: () => setConfirmModal(prev => ({ ...prev, isOpen: false }))
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users_data/${user.uid}/eggs/${egg.id}`);
    }
  };
  const [editingBirdId, setEditingBirdId] = useState<string | null>(null);
  const [editingCoupleId, setEditingCoupleId] = useState<string | null>(null);
  const [editingEggId, setEditingEggId] = useState<string | null>(null);
  const [selectedBirds, setSelectedBirds] = useState<string[]>([]);
  const [selectedMaleId, setSelectedMaleId] = useState("");
  const [selectedFemaleId, setSelectedFemaleId] = useState("");
  const [selectedCoupleId, setSelectedCoupleId] = useState("");
  
  const [userProfile, setUserProfile] = useState({
    name: "JOLI",
    location: "JOJJ58, UK",
    email: "flairstore2@gmail.com",
    avatar: "JT"
  });

  const handleGenerateAIReport = async (couple: CoupleData, totalEggs: number, hatchedEggs: number, failedEggs: number, survivedChicks: number, rounds: number) => {
    if (!user) return;
    setIsGeneratingAIReport(true);
    setAiBreedingReport(null);

    const male = birds.find(b => b.id === couple.maleId);
    const female = birds.find(b => b.id === couple.femaleId);

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        await new Promise(resolve => setTimeout(resolve, 2000));
        setAiBreedingReport({
          kpis: {
            hatching_rate: Math.round((hatchedEggs / (totalEggs || 1)) * 100),
            survival_rate: Math.round((survivedChicks / (hatchedEggs || 1)) * 100),
            success_rate: Math.round((survivedChicks / (totalEggs || 1)) * 100),
            productivity_score: 7.5
          },
          expert_insight: "Simulation Mode: This analysis is based on typical breeding patterns. For real-time expert insights, configure your Gemini API key.",
          recommendations: [
            "Check humidity levels during the final incubation stage.",
            "Supplement the hen with calcium and Vitamin D3.",
            "Minimize nest disturbances."
          ]
        });
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `
        You are a Senior Avian Data Analyst and Breeding Specialist.
        Analyze the following breeding data for a specific bird pair:
        
        Pair: ${male?.name || 'Male'} (${male?.mutation || 'Unknown'}) x ${female?.name || 'Female'} (${female?.mutation || 'Unknown'})
        Breeding Rounds: ${rounds}
        Total Eggs Laid: ${totalEggs}
        Hatched Successfully: ${hatchedEggs}
        Failed Eggs: ${failedEggs}
        Survived Chicks (Fledged): ${survivedChicks}
        
        Provide a comprehensive statistical report in a structured JSON format with:
        - kpis: { hatching_rate: number, survival_rate: number, success_rate: number, productivity_score: number (1-10) }
        - expert_insight: string (detailed analysis of fertility vs incubation efficiency)
        - recommendations: string[] (technical improvements for next round)
        
        Respond ONLY with the JSON.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              kpis: {
                type: Type.OBJECT,
                properties: {
                  hatching_rate: { type: Type.NUMBER },
                  survival_rate: { type: Type.NUMBER },
                  success_rate: { type: Type.NUMBER },
                  productivity_score: { type: Type.NUMBER }
                },
                required: ["hatching_rate", "survival_rate", "success_rate", "productivity_score"]
              },
              expert_insight: { type: Type.STRING },
              recommendations: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["kpis", "expert_insight", "recommendations"]
          }
        }
      });

      const result = JSON.parse(response.text.trim());
      setAiBreedingReport(result);
    } catch (error) {
      console.error("AI Analysis Error:", error);
      addNotification("AI Error", "Could not generate analysis. Please try again.", 'warning');
    } finally {
      setIsGeneratingAIReport(false);
    }
  };

  const [notifications, setNotifications] = useState<any[]>([]);
  
  const [birds, setBirds] = useState<BirdData[]>([]);
  const [cageFilter, setCageFilter] = useState<string | null>(null);
  const [speciesFilter, setSpeciesFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [coupleFilter, setCoupleFilter] = useState<string>("All");
  const [couples, setCouples] = useState<CoupleData[]>([]);
  const [eggs, setEggs] = useState<EggData[]>([]);
  const [searchEgg, setSearchEgg] = useState("");
  const [filterEggStatus, setFilterEggStatus] = useState<string>("All");
  const [filterEggCouple, setFilterEggCouple] = useState<string>("All");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Public Profile State
  const [publicBird, setPublicBird] = useState<BirdData | null>(null);
  const [publicAncestors, setPublicAncestors] = useState<BirdData[]>([]);
  const [isPublicLoading, setIsPublicLoading] = useState(false);
  const [showPublicProfile, setShowPublicProfile] = useState(false);

  const exportPedigreePDF = async (birdId: string) => {
    const bird = birds.find(b => b.id === birdId);
    if (!bird) return;

    const doc = new jsPDF();
    const primaryColor = "#1A73E8";
    const accentColor = "#FBBC05";

    // Header
    doc.setFillColor(primaryColor);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text("PetsBird Pedigree Certificate", 20, 25);
    
    doc.setFontSize(10);
    doc.text("GLOBAL AVIARY MANAGEMENT SYSTEM", 20, 32);

    // Bird Info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.text(`Bird: ${bird.name}`, 20, 60);
    
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Ring ID: ${bird.ring}`, 20, 70);
    doc.text(`Species: ${bird.species}`, 20, 78);
    doc.text(`Mutation: ${bird.mutation}`, 20, 86);
    doc.text(`Gender: ${bird.gender}`, 20, 94);
    doc.text(`Birth Date: ${bird.birthYear}`, 20, 102);

    // Family Tree Section
    doc.setDrawColor(primaryColor);
    doc.setLineWidth(0.5);
    doc.line(20, 115, 190, 115);
    
    doc.setTextColor(primaryColor);
    doc.setFontSize(14);
    doc.text("Lineage / Family Tree", 20, 125);

    const father = birds.find(b => b.id === bird.fatherId);
    const mother = birds.find(b => b.id === bird.motherId);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(`Father: ${father?.name || 'Unknown'} (${father?.ring || 'N/A'})`, 30, 140);
    doc.text(`Mother: ${mother?.name || 'Unknown'} (${mother?.ring || 'N/A'})`, 30, 150);

    // Footer
    doc.setFillColor(248, 250, 252);
    doc.rect(0, 270, 210, 27, 'F');
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.text("Generated by PetsBird.com - Your Professional Breeding Partner", 105, 285, { align: 'center' });

    doc.save(`${bird.name}_Pedigree.pdf`);
  };

  const shareDashboardStats = async () => {
    if (!dashboardRef.current) return;
    
    try {
      const canvas = await html2canvas(dashboardRef.current, {
        scale: 2,
        backgroundColor: "#F8FAFC",
        logging: false,
        useCORS: true
      });
      
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = "PetsBird_Stats.png";
      link.click();
      
      addNotification("Stats Exported!", "Your dashboard stats have been saved as an image. Share it on your social media!", 'success');
    } catch (error) {
      console.error("Error sharing stats:", error);
    }
  };

  useEffect(() => {
    if (!user || eggs.length === 0) return;

    const checkHatchingSoon = () => {
      const today = new Date();
      
      setNotifications(prev => {
        let newNotifications = [...prev];
        let hasChanges = false;

        eggs.forEach(egg => {
          if (egg.status === 'Intact' && egg.hatchDate) {
            const hatchDate = new Date(egg.hatchDate);
            const diffTime = hatchDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            // 1. Hatching Soon Alert
            if (diffDays <= 2 && diffDays >= 0) {
              const notificationId = `hatch-soon-${egg.id}`;
              if (!newNotifications.some(n => n.id === notificationId)) {
                const couple = couples.find(c => c.id === egg.coupleId);
                const male = birds.find(b => b.id === couple?.maleId);
                const female = birds.find(b => b.id === couple?.femaleId);
                
                const title = "Hatching Soon!";
                const message = `Egg #${egg.eggNumber || egg.id.slice(-3)} from ${male?.name || 'Pair'} & ${female?.name || ''} is hatching soon!`;
                
                newNotifications.unshift({
                  id: notificationId,
                  title,
                  message,
                  time: "Alert",
                  read: false
                });
                
                addNotification(title, message, 'info');
                hasChanges = true;
              }
            }

            // 2. Overdue Eggs Alert
            if (diffDays < 0) {
              const notificationId = `overdue-${egg.id}`;
              if (!newNotifications.some(n => n.id === notificationId)) {
                const title = "Overdue Egg!";
                const message = `Egg #${egg.eggNumber || egg.id.slice(-3)} is past its hatch date. Please check the nest!`;
                
                newNotifications.unshift({
                  id: notificationId,
                  title,
                  message,
                  time: "Warning",
                  read: false
                });
                
                addNotification(title, message, 'warning');
                hasChanges = true;
              }
            }
          }
        });

        return hasChanges ? newNotifications : prev;
      });
    };

    checkHatchingSoon();
    // Check every hour
    const interval = setInterval(checkHatchingSoon, 3600000);
    return () => clearInterval(interval);
  }, [user, eggs, couples, birds]);

  const [newBird, setNewBird] = useState({
    name: "",
    ring: "",
    species: SPECIES_LIST[0].name,
    gender: "Male" as "Male" | "Female",
    age: 0,
    birthYear: new Date().toISOString().split('T')[0],
    date: new Date().toISOString().split('T')[0],
    cage: "1",
    mutation: "",
    status: "Ready",
    imageUrl: "",
    salePrice: ""
  });

  // Auto-save Recovery for Bird Form
  useEffect(() => {
    const savedBird = localStorage.getItem('petsbird_draft_bird');
    if (savedBird && !editingBirdId) {
      try {
        const draft = JSON.parse(savedBird);
        setNewBird(prev => ({ ...prev, ...draft }));
      } catch (e) {
        console.error("Error loading bird draft:", e);
      }
    }
  }, [isModalOpen]);

  useEffect(() => {
    if (isModalOpen && !editingBirdId) {
      localStorage.setItem('petsbird_draft_bird', JSON.stringify(newBird));
    }
  }, [newBird, isModalOpen]);

  // Firestore Real-time Sync
  useEffect(() => {
    if (!user) {
      setBirds([]);
      setCouples([]);
      setEggs([]);
      return;
    }

    const birdsRef = collection(db, "users_data", user.uid, "birds");
    const unsubscribeBirds = onSnapshot(birdsRef, (snapshot) => {
      const birdsList = snapshot.docs.map(doc => doc.data() as BirdData);
      setBirds(birdsList);
    }, (error) => handleFirestoreError(error, OperationType.LIST, `users_data/${user.uid}/birds`));

    const couplesRef = collection(db, "users_data", user.uid, "couples");
    const unsubscribeCouples = onSnapshot(couplesRef, (snapshot) => {
      const couplesList = snapshot.docs.map(doc => doc.data() as CoupleData);
      setCouples(couplesList);
    }, (error) => handleFirestoreError(error, OperationType.LIST, `users_data/${user.uid}/couples`));

    const eggsRef = collection(db, "users_data", user.uid, "eggs");
    const unsubscribeEggs = onSnapshot(eggsRef, (snapshot) => {
      const eggsList = snapshot.docs.map(doc => doc.data() as EggData);
      setEggs(eggsList);
    }, (error) => handleFirestoreError(error, OperationType.LIST, `users_data/${user.uid}/eggs`));

    const userDocRef = doc(db, "users", user.uid);
    
    // Test connection
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    };
    testConnection();

    const unsubscribeUser = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserProfile({
          name: data.name || "",
          location: data.location || "",
          email: data.email || "",
          avatar: data.avatar || (data.name ? data.name.substring(0, 2).toUpperCase() : "??")
        });
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, `users/${user.uid}`));

    return () => {
      unsubscribeBirds();
      unsubscribeCouples();
      unsubscribeEggs();
      unsubscribeUser();
    };
  }, [user]);

  const handleAddBird = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
      setIsModalOpen(false);
      setIsUploading(true);
      try {
        let imageUrl = newBird.imageUrl;
        if (selectedFile) {
          imageUrl = await uploadImageWithTimeout(selectedFile, user.uid);
        }

        const id = Date.now().toString();
        const birdData = { ...newBird, id, imageUrl, userId: user.uid };
        await setDoc(doc(db, "users_data", user.uid, "birds", id), birdData);
        
        setSelectedFile(null);
        localStorage.removeItem('petsbird_draft_bird');
        setNewBird({ name: "", ring: "", species: SPECIES_LIST[0].name, gender: "Male", age: 0, birthYear: new Date().toISOString().split('T')[0], date: new Date().toISOString().split('T')[0], cage: "1", mutation: "", status: "Ready", imageUrl: "", salePrice: "" });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `users_data/${user.uid}/birds`);
      } finally {
        setIsUploading(false);
      }
  };

  const handleUpdateBird = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingBirdId || !user) return;
    setIsModalOpen(false);
    setIsUploading(true);
    try {
      let imageUrl = newBird.imageUrl;
      if (selectedFile) {
        imageUrl = await uploadImageWithTimeout(selectedFile, user.uid);
      }

      await updateDoc(doc(db, "users_data", user.uid, "birds", editingBirdId), { ...newBird, imageUrl });
      
      setEditingBirdId(null);
      setSelectedFile(null);
      setNewBird({ name: "", ring: "", species: SPECIES_LIST[0].name, gender: "Male", age: 0, birthYear: new Date().toISOString().split('T')[0], date: new Date().toISOString().split('T')[0], cage: "1", mutation: "", imageUrl: "", salePrice: "" });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users_data/${user.uid}/birds/${editingBirdId}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSetParent = async (parentId: string | null) => {
    if (!user || !parentEditContext) return;
    
    let targetParentId = parentId;
    
    if (isAddingParentManual && manualParentName.trim()) {
      try {
        const id = Date.now().toString();
        const child = birds.find(b => b.id === parentEditContext.childId);
        const manualBird = {
          id,
          name: manualParentName,
          gender: parentEditContext.type === 'father' ? 'Male' : 'Female',
          species: child?.species || SPECIES_LIST[0].name,
          ring: "Manual",
          age: 1,
          birthYear: (new Date().getFullYear() - 1).toString(),
          date: new Date().toLocaleDateString('en-GB'),
          cage: "Ancestors",
          status: "External",
          userId: user.uid
        };
        await setDoc(doc(db, "users_data", user.uid, "birds", id), manualBird);
        targetParentId = id;
      } catch (error) {
        console.error("Error creating manual bird:", error);
        return;
      }
    }
    
    try {
      const field = parentEditContext.type === 'father' ? 'fatherId' : 'motherId';
      await updateDoc(doc(db, "users_data", user.uid, "birds", parentEditContext.childId), {
        [field]: targetParentId
      });
      setIsParentModalOpen(false);
      setParentEditContext(null);
      setManualParentName("");
      setIsAddingParentManual(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users_data/${user.uid}/birds/${parentEditContext.childId}`);
    }
  };

  const handleDeleteBird = async (id: string) => {
    if (!user) return;
    const path = `users_data/${user.uid}/birds/${id}`;
    setConfirmModal({
      isOpen: true,
      title: "حذف طائر",
      message: "هل أنت متأكد من حذف هذا الطائر؟ سيتم حذف جميع البيانات المرتبطة به.",
      variant: 'danger',
      confirmText: "تأكيد الحذف",
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, "users_data", user.uid, "birds", id));
          // Also delete related couples and eggs
          const relatedCouples = couples.filter(c => c.maleId === id || c.femaleId === id);
          for (const couple of relatedCouples) {
            await handleDeleteCouple(couple.id, true);
          }
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
          handleFirestoreError(error, OperationType.DELETE, path);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const openBirdModal = (bird?: BirdData) => {
    if (bird) {
      setEditingBirdId(bird.id);
      setNewBird({
        name: bird.name || "",
        ring: bird.ring || "",
        species: bird.species || SPECIES_LIST[0].name,
        gender: bird.gender || "Male",
        age: bird.age || 0,
        birthYear: bird.birthYear || new Date().toISOString().split('T')[0],
        date: bird.date || new Date().toISOString().split('T')[0],
        cage: bird.cage || "1",
        mutation: bird.mutation || "",
        status: bird.status || "Ready",
        imageUrl: bird.imageUrl || ""
      });
    } else {
      setEditingBirdId(null);
      setNewBird({
        name: "",
        ring: "",
        species: SPECIES_LIST[0].name,
        gender: "Male",
        age: 0,
        birthYear: new Date().toISOString().split('T')[0],
        date: new Date().toISOString().split('T')[0],
        cage: "1",
        mutation: "",
        status: "Ready",
        imageUrl: ""
      });
    }
    setIsModalOpen(true);
  };

  const handleToggleBirdSelection = (id: string) => {
    if (selectedBirds.includes(id)) {
      setSelectedBirds(selectedBirds.filter(bid => bid !== id));
    } else {
      if (selectedBirds.length < 2) {
        setSelectedBirds([...selectedBirds, id]);
      }
    }
  };

  const handleCreateCouple = async () => {
    if (selectedBirds.length !== 2 || !user) return;
    const bird1 = birds.find(b => b.id === selectedBirds[0]);
    const bird2 = birds.find(b => b.id === selectedBirds[1]);
    
    if (!bird1 || !bird2) return;
    if (bird1.gender === bird2.gender) {
      setConfirmModal({
        isOpen: true,
        title: "Invalid Selection",
        message: "Please select one Male and one Female bird.",
        onConfirm: () => setConfirmModal(prev => ({ ...prev, isOpen: false }))
      });
      return;
    }

    if (bird1.species !== bird2.species) {
      setConfirmModal({
        isOpen: true,
        title: "Species Mismatch",
        message: "لا يمكن لأن النوع مختلف",
        onConfirm: () => setConfirmModal(prev => ({ ...prev, isOpen: false }))
      });
      return;
    }

    const isBird1InCouple = couples.some(c => c.status === 'Active' && (c.maleId === bird1.id || c.femaleId === bird1.id));
    const isBird2InCouple = couples.some(c => c.status === 'Active' && (c.maleId === bird2.id || c.femaleId === bird2.id));

    if (isBird1InCouple || isBird2InCouple) {
      setConfirmModal({
        isOpen: true,
        title: "Already Coupled",
        message: "أحد الطيور أو كلاهما مضاف مسبقاً في كوبل آخر",
        onConfirm: () => setConfirmModal(prev => ({ ...prev, isOpen: false }))
      });
      return;
    }

    const male = bird1.gender === 'Male' ? bird1 : bird2;
    const female = bird1.gender === 'Female' ? bird1 : bird2;

    const id = Date.now().toString();
    const newCouple: CoupleData & { userId: string } = {
      id,
      maleId: male.id,
      femaleId: female.id,
      startDate: new Date().toISOString().split('T')[0],
      status: 'Active',
      userId: user.uid
    };

    const path = `users_data/${user.uid}/couples/${id}`;
    try {
      await setDoc(doc(db, "users_data", user.uid, "couples", id), newCouple);
      setIsCoupleModalOpen(false);
      setSelectedBirds([]);
      setActiveTab("Couples");
      setSelectedMaleId("");
      setSelectedFemaleId("");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const handleCreateCoupleFromModal = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedMaleId || !selectedFemaleId || !user) return;

    const male = birds.find(b => b.id === selectedMaleId);
    const female = birds.find(b => b.id === selectedFemaleId);

    if (!male || !female) return;

    if (male.species !== female.species) {
      setConfirmModal({
        isOpen: true,
        title: "Species Mismatch",
        message: "لا يمكن لأن النوع مختلف",
        onConfirm: () => setConfirmModal(prev => ({ ...prev, isOpen: false }))
      });
      return;
    }

    const isMaleInCouple = couples.some(c => c.status === 'Active' && (c.maleId === male.id || c.femaleId === male.id));
    const isFemaleInCouple = couples.some(c => c.status === 'Active' && (c.maleId === female.id || c.femaleId === female.id));

    if (isMaleInCouple || isFemaleInCouple) {
      setConfirmModal({
        isOpen: true,
        title: "Already Coupled",
        message: "أحد الطيور أو كلاهما مضاف مسبقاً في كوبل آخر",
        onConfirm: () => setConfirmModal(prev => ({ ...prev, isOpen: false }))
      });
      return;
    }
    
    const id = Date.now().toString();
    const newCouple: CoupleData & { userId: string } = {
      id,
      maleId: selectedMaleId,
      femaleId: selectedFemaleId,
      startDate: new Date().toISOString().split('T')[0],
      status: 'Active',
      userId: user.uid
    };

    const path = `users_data/${user.uid}/couples/${id}`;
    try {
      await setDoc(doc(db, "users_data", user.uid, "couples", id), newCouple);
      setIsCoupleModalOpen(false);
      setSelectedMaleId("");
      setSelectedFemaleId("");
      setActiveTab("Couples");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const handleUpdateCouple = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingCoupleId || !selectedMaleId || !selectedFemaleId || !user) return;

    const path = `users_data/${user.uid}/couples/${editingCoupleId}`;
    try {
      await updateDoc(doc(db, "users_data", user.uid, "couples", editingCoupleId), {
        maleId: selectedMaleId,
        femaleId: selectedFemaleId
      });
      setIsCoupleModalOpen(false);
      setEditingCoupleId(null);
      setSelectedMaleId("");
      setSelectedFemaleId("");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const handleDeleteCouple = async (id: string, skipConfirm = false) => {
    if (!user) return;
    
    const path = `users_data/${user.uid}/couples/${id}`;
    const performDelete = async () => {
      try {
        await deleteDoc(doc(db, "users_data", user.uid, "couples", id));
        // Delete related eggs
        const relatedEggs = eggs.filter(e => e.coupleId === id);
        for (const egg of relatedEggs) {
          await deleteDoc(doc(db, "users_data", user.uid, "eggs", egg.id));
        }
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    };

    if (skipConfirm) {
      await performDelete();
    } else {
      setConfirmModal({
        isOpen: true,
        title: "حذف كوبل",
        message: "هل أنت متأكد من حذف هذا الكوبل؟",
        variant: 'danger',
        confirmText: "تأكيد الحذف",
        onConfirm: performDelete
      });
    }
  };

  const openCoupleModal = (couple?: CoupleData) => {
    if (couple) {
      setEditingCoupleId(couple.id);
      setSelectedMaleId(couple.maleId);
      setSelectedFemaleId(couple.femaleId);
    } else {
      setEditingCoupleId(null);
      setSelectedMaleId("");
      setSelectedFemaleId("");
    }
    setIsCoupleModalOpen(true);
  };

  const [geneticsMaleId, setGeneticsMaleId] = useState("");
  const [geneticsFemaleId, setGeneticsFemaleId] = useState("");
  const [geneticsResult, setGeneticsResult] = useState<any>(null);
  const [isGeneticsLoading, setIsGeneticsLoading] = useState(false);

  const handlePredictGenetics = async () => {
    if (!geneticsMaleId || !geneticsFemaleId) {
      setConfirmModal({
        isOpen: true,
        title: "Selection Required",
        message: "Please select both a male and a female bird to predict genetics.",
        onConfirm: () => setConfirmModal(prev => ({ ...prev, isOpen: false }))
      });
      return;
    }

    const male = birds.find(b => b.id === geneticsMaleId);
    const female = birds.find(b => b.id === geneticsFemaleId);

    if (!male || !female) return;

    if (male.species !== female.species) {
      setConfirmModal({
        isOpen: true,
        title: "Species Mismatch",
        message: "Male and female must be of the same species for genetic prediction.",
        onConfirm: () => setConfirmModal(prev => ({ ...prev, isOpen: false }))
      });
      return;
    }

    setIsGeneticsLoading(true);
    setGeneticsResult(null);

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      
      // Simulation Fallback if API Key is missing
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        console.warn("API Key missing, running in Simulation Mode");
        
        // Simulate a delay for realism
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const simulationResult = {
          possibleMutations: [
            { 
              name: `${male.mutation || "Normal"} (Visual)`, 
              probability: "50%", 
              description: "Offspring inheriting the visual characteristics of the father.",
              thumbnailKeyword: male.mutation || "Normal bird"
            },
            { 
              name: `${female.mutation || "Normal"} (Visual)`, 
              probability: "25%", 
              description: "Offspring inheriting the visual characteristics of the mother.",
              thumbnailKeyword: female.mutation || "Normal bird"
            },
            { 
              name: `Split ${male.mutation || "Mutation"}`, 
              probability: "25%", 
              description: "Offspring carrying the gene but not showing it visually.",
              thumbnailKeyword: "Bird DNA"
            }
          ],
          advice: "This is a simulated result because the Gemini API key is not configured. For accurate genetic predictions based on real avian science, please add your Gemini API key in the app settings.",
          difficulty: 2
        };
        
        setGeneticsResult(simulationResult);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const prompt = `
        You are an expert avian genetics consultant. 
        Predict the possible offspring (chicks) mutations for a pair of birds with the following details:
        Species: ${male.species}
        Male Mutation: ${male.mutation || "Normal/Classic"}
        Female Mutation: ${female.mutation || "Normal/Classic"}

        Please provide the results in a structured JSON format with the following fields:
        - possibleMutations: An array of objects, each with 'name' (mutation name), 'probability' (percentage), 'description' (brief explanation), and 'thumbnailKeyword' (a simple keyword for image search e.g. 'green budgie' or 'albino lovebird').
        - advice: A short expert advice for breeding this specific pair.
        - difficulty: A rating from 1 to 5 (1 easy, 5 expert).

        Respond ONLY with the JSON.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              possibleMutations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    probability: { type: Type.STRING },
                    description: { type: Type.STRING },
                    thumbnailKeyword: { type: Type.STRING }
                  },
                  required: ["name", "probability", "description", "thumbnailKeyword"]
                }
              },
              advice: { type: Type.STRING },
              difficulty: { type: Type.INTEGER }
            },
            required: ["possibleMutations", "advice", "difficulty"]
          }
        }
      });

      const text = response.text || "{}";
      const parsedResult = JSON.parse(text);
      setGeneticsResult(parsedResult);
    } catch (error: any) {
      console.error("Genetics Prediction Error:", error);
      setConfirmModal({
        isOpen: true,
        title: "Prediction Error",
        message: "حدث خطأ أثناء التنبؤ بالوراثة. يرجى المحاولة مرة أخرى.",
        onConfirm: () => setConfirmModal(prev => ({ ...prev, isOpen: false }))
      });
    } finally {
      setIsGeneticsLoading(false);
    }
  };

  const [newEgg, setNewEgg] = useState({
    laidDate: new Date().toISOString().split('T')[0],
    hatchDate: "",
    status: "Intact" as "Intact" | "Hatched" | "Broken" | "Completed" | "Failed"
  });

  // Auto-save Recovery for Egg Form
  useEffect(() => {
    const savedEgg = localStorage.getItem('petsbird_draft_egg');
    if (savedEgg && !editingEggId) {
      try {
        const draft = JSON.parse(savedEgg);
        setNewEgg(prev => ({ ...prev, ...draft }));
      } catch (e) {
        console.error("Error loading egg draft:", e);
      }
    }
  }, [isEggModalOpen]);

  useEffect(() => {
    if (isEggModalOpen && !editingEggId) {
      localStorage.setItem('petsbird_draft_egg', JSON.stringify(newEgg));
    }
  }, [newEgg, isEggModalOpen]);

  const calculateHatchDate = (laidDate: string, coupleId: string) => {
    const couple = couples.find(c => c.id === coupleId);
    if (!couple) return { hatch: "", fertility: "" };
    const female = birds.find(b => b.id === couple.femaleId);
    if (!female) return { hatch: "", fertility: "" };
    
    const speciesInfo = SPECIES_LIST.find(s => s.name === female.species);
    const incubation = speciesInfo ? speciesInfo.incubation : 18;
    
    try {
      let date: Date;
      if (laidDate.includes('-')) {
        date = new Date(laidDate);
      } else if (laidDate.includes('/')) {
        const [d, m, y] = laidDate.split('/').map(Number);
        date = new Date(y, m - 1, d);
      } else {
        date = new Date(laidDate);
      }

      if (isNaN(date.getTime())) return { hatch: "", fertility: "" };

      // Calculate Fertility Check (7 days)
      const fertilityDate = new Date(date);
      fertilityDate.setDate(fertilityDate.getDate() + 7);
      
      // Calculate Hatch Date
      const hatchDate = new Date(date);
      hatchDate.setDate(hatchDate.getDate() + incubation);
      
      const formatDate = (d: Date) => {
        return d.toISOString().split('T')[0];
      };

      return {
        hatch: formatDate(hatchDate),
        fertility: formatDate(fertilityDate)
      };
    } catch (e) {
      return { hatch: "", fertility: "" };
    }
  };

  const handleUpdateEgg = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingEggId || !selectedCoupleId || !user) return;

    const hatchDate = newEgg.hatchDate || calculateHatchDate(newEgg.laidDate, selectedCoupleId);

    try {
      await updateDoc(doc(db, "users_data", user.uid, "eggs", editingEggId), {
        ...newEgg,
        hatchDate,
        coupleId: selectedCoupleId
      });
      setIsEggModalOpen(false);
      setEditingEggId(null);
      setSelectedCoupleId("");
      setNewEgg({ laidDate: new Date().toISOString().split('T')[0], hatchDate: "", status: "Intact" });
    } catch (error) {
      console.error("Error updating egg:", error);
    }
  };

  const handleDeleteEgg = async (id: string) => {
    if (!user) return;
    const path = `users_data/${user.uid}/eggs/${id}`;
    setConfirmModal({
      isOpen: true,
      title: "حذف بيضة",
      message: "هل أنت متأكد من حذف هذه البيضة؟",
      variant: 'danger',
      confirmText: "تأكيد الحذف",
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, "users_data", user.uid, "eggs", id));
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
          handleFirestoreError(error, OperationType.DELETE, path);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const openEggModal = (coupleId?: string, egg?: EggData) => {
    if (egg) {
      setEditingEggId(egg.id);
      setSelectedCoupleId(egg.coupleId);
      setNewEgg({
        laidDate: egg.laidDate || new Date().toISOString().split('T')[0],
        hatchDate: egg.hatchDate || "",
        status: egg.status || "Intact"
      });
    } else {
      setEditingEggId(null);
      setSelectedCoupleId(coupleId || "");
      setNewEgg({
        laidDate: new Date().toISOString().split('T')[0],
        hatchDate: "",
        status: "Intact"
      });
    }
    setIsEggModalOpen(true);
  };

  const handleAddEgg = async (coupleId: string) => {
    if (!coupleId || !user) return;
    const { hatch, fertility } = calculateHatchDate(newEgg.laidDate, coupleId);
    const hatchDate = newEgg.hatchDate || hatch;
    const id = Math.floor(1000 + Math.random() * 9000).toString();
    
    // Calculate sequential egg number
    const nextNumber = (eggs.length + 1).toString().padStart(3, '0');
    
    const newEggData: EggData & { userId: string } = {
      id,
      eggNumber: nextNumber,
      coupleId,
      ...newEgg,
      hatchDate,
      fertilityCheckDate: fertility,
      userId: user.uid
    };
    
    const path = `users_data/${user.uid}/eggs/${id}`;
    try {
      await setDoc(doc(db, "users_data", user.uid, "eggs", id), newEggData);
      setIsEggModalOpen(false);
      localStorage.removeItem('petsbird_draft_egg');
      setSelectedCoupleId("");
      setNewEgg({ laidDate: new Date().toISOString().split('T')[0], hatchDate: "", status: "Intact" });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const handleFertilityCheck = async (eggId: string, isFertile: boolean) => {
    if (!user) return;
    
    const path = `users_data/${user.uid}/eggs/${eggId}`;
    try {
      if (!isFertile) {
        await updateDoc(doc(db, "users_data", user.uid, "eggs", eggId), {
          isFertile: false,
          status: 'Failed'
        });
        setConfirmModal({
          isOpen: true,
          title: "Clear Egg",
          message: "تم تسجيل البيضة كغير مخصبة. سيتم الاحتفاظ بها في السجلات كبيضة فاشلة.",
          variant: 'info',
          confirmText: "حسناً",
          onConfirm: () => setConfirmModal(prev => ({ ...prev, isOpen: false }))
        });
        return;
      }

      await updateDoc(doc(db, "users_data", user.uid, "eggs", eggId), {
        isFertile: true
      });
      setConfirmModal({
        isOpen: true,
        title: "Fertility Confirmed",
        message: "تم تأكيد خصوبة البيضة بنجاح!",
        variant: 'success',
        confirmText: "حسناً",
        onConfirm: () => setConfirmModal(prev => ({ ...prev, isOpen: false }))
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await setDoc(doc(db, "users", user.uid), { ...userProfile, userId: user.uid });
      setIsProfileModalOpen(false);
      addNotification("Profile Updated", "Your profile information has been updated.", 'success');
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const renderHeaderButton = () => {
    switch (activeTab) {
      case "My Birds":
        return (
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => openBirdModal()}
            className="bg-primary text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add New Bird
          </motion.button>
        );
      case "Couples":
        return (
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsCoupleModalOpen(true)}
            className="bg-accent-gold text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-accent-gold/20 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Create Couple
          </motion.button>
        );
      case "Eggs":
        return (
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => openEggModal()}
            className="bg-accent-orange text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-accent-orange/20 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Egg
          </motion.button>
        );
      default:
        return null;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#fcfcf9] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-2xl animate-pulse" />
            <Logo variant="icon" className="w-20 h-20 relative animate-[pulse_2s_ease-in-out_infinite]" />
          </div>
          <div className="flex flex-col items-center gap-2">
            <h3 className="text-xl font-black font-display text-slate-900">PetsBird</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] animate-pulse">Global Aviary Management</p>
          </div>
        </div>
      </div>
    );
  }

  if (showPublicProfile) {
    return (
      <PublicBirdProfile 
        bird={publicBird} 
        ancestors={publicAncestors} 
        isLoading={isPublicLoading} 
        onBack={() => {
          setShowPublicProfile(false);
          window.history.pushState({}, '', '/');
          window.dispatchEvent(new Event('popstate'));
        }} 
      />
    );
  }

  if (showAuthPage && !user) {
    return (
      <div className="min-h-screen bg-[#fcfcf9] flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <div 
              onClick={() => {
                setShowAuthPage(false);
                if (window.location.pathname !== '/') {
                  window.history.pushState({}, '', '/');
                }
              }}
              className="w-20 h-20 bg-white rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary/10 cursor-pointer hover:scale-110 transition-all border border-slate-100"
            >
              <Logo variant="icon" className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-black font-display text-slate-900 mb-2">
              {authMode === "login" ? "مرحباً بعودتك" : "إنشاء حساب جديد"}
            </h2>
            <p className="text-slate-500 font-medium">
              {authMode === "login" ? "سجل دخولك لإدارة طيورك" : "انضم إلى مجتمع المربين العالمي"}
            </p>
          </div>

          <div className="glass p-10 rounded-[40px] border-white/20 shadow-2xl">
            <button 
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isAuthProcessing}
              className="w-full py-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 flex items-center justify-center gap-3 hover:bg-slate-50 transition-all shadow-sm mb-6 disabled:opacity-50"
            >
              {isAuthProcessing ? (
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
              )}
              {isAuthProcessing ? "جاري التحميل..." : "المتابعة باستخدام جوجل"}
            </button>

            <div className="relative flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-slate-100" />
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">أو استخدم البريد الإلكتروني</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>

            {authError && (
              <div className="mb-6 p-4 bg-red-50 text-red-500 text-xs font-bold rounded-2xl border border-red-100">
                {authError}
              </div>
            )}

            {authSuccessMessage && (
              <div className="mb-6 p-4 bg-green-50 text-green-600 text-xs font-bold rounded-2xl border border-green-100">
                {authSuccessMessage}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleEmailAuth}>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">البريد الإلكتروني</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-medium focus:border-primary transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">كلمة المرور</label>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-medium focus:border-primary transition-all"
                />
              </div>
              {authMode === "login" && (
                <div className="text-right">
                  <button 
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline"
                  >
                    نسيت كلمة المرور؟
                  </button>
                </div>
              )}
              <button 
                type="submit"
                disabled={isAuthProcessing}
                className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50"
              >
                {isAuthProcessing ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  authMode === "login" ? "تسجيل الدخول" : "إنشاء حساب"
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button 
                onClick={() => setAuthMode(authMode === "login" ? "register" : "login")}
                className="text-xs font-bold text-primary uppercase tracking-widest hover:underline"
              >
                {authMode === "login" ? "ليس لديك حساب؟ سجل الآن" : "لديك حساب بالفعل؟ سجل دخول"}
              </button>
            </div>

            <p className="mt-8 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
              By continuing, you agree to PetsBird's <br />
              <span className="text-primary cursor-pointer">Terms of Service</span> and <span className="text-primary cursor-pointer">Privacy Policy</span>
            </p>
          </div>

          <button 
            onClick={() => setShowAuthPage(false)}
            className="w-full mt-8 text-sm font-bold text-slate-400 hover:text-primary transition-colors uppercase tracking-widest"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!showApp) {
    return (
      <div className="min-h-screen bg-[#fcfcf9] selection:bg-primary/10 overflow-x-hidden">
        {/* Article Detail Modal */}
        <AnimatePresence>
          {isArticleModalOpen && selectedArticle && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsArticleModalOpen(false)}
                className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-4xl bg-white rounded-[48px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
              >
                <div className="relative h-80 shrink-0">
                  <img src={selectedArticle.img} alt={selectedArticle.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <button 
                    onClick={() => setIsArticleModalOpen(false)}
                    className="absolute top-6 right-6 w-12 h-12 bg-white/20 hover:bg-white/40 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-all"
                  >
                    <X className="w-6 h-6" />
                  </button>
                  <div className="absolute bottom-8 left-8 right-8">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="px-4 py-1.5 bg-primary text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                        {selectedArticle.category || selectedArticle.date}
                      </span>
                    </div>
                    <h2 className="text-4xl font-black text-white font-display leading-tight">{selectedArticle.title}</h2>
                  </div>
                </div>
                <div className="p-12 overflow-y-auto custom-scrollbar">
                  <div className="prose prose-slate max-w-none">
                    {selectedArticle.content.split('\n\n').map((paragraph: string, i: number) => (
                      <p key={i} className="text-lg text-slate-600 leading-relaxed mb-6">{paragraph}</p>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <nav className="fixed top-0 w-full z-[100] px-8 py-6 flex items-center justify-between backdrop-blur-md bg-white/30">
          <div 
            onClick={() => navigateToTab("Home")}
            className="cursor-pointer group"
          >
            <Logo className="group-hover:scale-105 transition-transform" />
          </div>
          <div className="hidden md:flex items-center gap-8">
            {["Features", "Genetics", "Advice", "News", "About"].map((item) => (
              <button 
                key={item} 
                onClick={() => navigateToTab(item, false)}
                className={`text-sm font-bold transition-colors uppercase tracking-widest ${landingTab === item ? 'text-primary' : 'text-slate-500 hover:text-primary'}`}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
            >
              {language === 'en' ? 'العربية' : 'English'}
            </button>
            <button 
              onClick={handleInstallClick}
              className="hidden lg:flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-bold text-sm uppercase tracking-widest"
            >
              <Download className="w-4 h-4" />
              Install
            </button>
            <button 
              onClick={handleLaunchApp}
              className="bg-primary text-white px-8 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-primary/20 hover:scale-105 transition-all"
            >
              {user ? "Dashboard" : "Launch App"}
            </button>
          </div>
        </nav>

        {landingTab === "Home" && (
          <div className={language === 'ar' ? 'font-arabic' : ''} dir={language === 'ar' ? 'rtl' : 'ltr'}>
            {/* Hero Section */}
            <section className="relative pt-40 pb-20 px-8 min-h-screen flex flex-col items-center justify-center text-center overflow-hidden">
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10"
              >
                <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-6">
                  {t.heroSubtitle}
                </span>
                <h1 className="text-[12vw] md:text-[8vw] font-black font-display leading-[0.85] text-slate-900 mb-8 tracking-tighter">
                  {t.heroTitle} <br /> <span className="text-primary italic">{t.heroTitleAccent}</span>
                </h1>
                <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-500 font-medium mb-12 leading-relaxed">
                  {t.heroDesc}
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                  <button 
                    onClick={handleLaunchApp}
                    className="w-full sm:w-auto px-10 py-5 bg-slate-900 text-white rounded-[24px] font-bold text-lg shadow-2xl hover:bg-primary transition-all flex items-center justify-center gap-3 group"
                  >
                    {user ? t.goDashboard : t.startManaging}
                    <TrendingUp className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button 
                    onClick={handleInstallClick}
                    className="w-full sm:w-auto px-10 py-5 bg-primary text-white rounded-[24px] font-bold text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-all flex items-center justify-center gap-3"
                  >
                    <Download className="w-5 h-5" />
                    {t.downloadApp}
                  </button>
                </div>
              </motion.div>

              {/* Floating Elements */}
              <motion.div 
                animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/4 -left-20 w-64 h-64 bg-accent-gold/5 rounded-full blur-3xl"
              />
              <motion.div 
                animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-1/4 -right-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl"
              />

              {/* Hero Image Mockup */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 100 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-20 relative max-w-6xl mx-auto"
              >
                <div className="relative rounded-[48px] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.2)] border-8 border-white">
                  <img 
                    src="https://images.unsplash.com/photo-1444464666168-49d633b86797?auto=format&fit=crop&q=80&w=1920" 
                    alt="PetsBird Aviary" 
                    className="w-full h-auto"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
                </div>
                
                <div className="absolute -top-10 -right-10 hidden lg:block">
                  <div className="glass p-6 rounded-[32px] shadow-2xl border-white/40 backdrop-blur-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-2xl flex items-center justify-center">
                        <TrendingUp className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-2xl font-black text-slate-800">98%</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hatch Success</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </section>

            {/* Features Preview */}
            <section className="py-32 px-8 bg-white">
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-20">
                  <h2 className="text-5xl md:text-6xl font-black font-display text-slate-900 leading-[0.9] mb-6">
                    {t.featuresTitle} <br /> <span className="text-accent-gold">{t.featuresTitleAccent}</span>
                  </h2>
                  <p className="text-xl text-slate-500 max-w-2xl mx-auto">{t.heroDesc}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    { title: t.aiGenetics, desc: t.aiGeneticsDesc, icon: BrainCircuit, color: "text-primary bg-primary/10", tab: "Genetics" },
                    { title: t.eggTracking, desc: t.eggTrackingDesc, icon: EggIcon, color: "text-accent-orange bg-accent-orange/10", tab: "Features" },
                    { title: t.marketplace, desc: t.marketplaceDesc, icon: ShoppingBag, color: "text-accent-gold bg-accent-gold/10", tab: "Advice" }
                  ].map((feature, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-slate-50 p-8 rounded-[40px] border border-slate-100 hover:bg-white hover:shadow-2xl hover:-translate-y-2 transition-all group cursor-pointer"
                      onClick={() => navigateToTab(feature.tab, false)}
                    >
                      <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-8 ${feature.color} group-hover:scale-110 transition-transform`}>
                        <feature.icon className="w-10 h-10" />
                      </div>
                      <h4 className="text-2xl font-bold text-slate-800 mb-4 group-hover:text-primary transition-colors">{feature.title}</h4>
                      <p className="text-slate-500 leading-relaxed mb-8">{feature.desc}</p>
                      <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest">
                        Learn More <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            {/* Global Marketplace Section */}
            <section className="py-32 px-8 bg-slate-900 text-white overflow-hidden relative">
              <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                >
                  <h2 className="text-5xl md:text-6xl font-black font-display leading-[0.9] mb-8">
                    {t.marketplace}
                  </h2>
                  <p className="text-xl text-slate-400 leading-relaxed mb-12">
                    {t.marketplaceDesc}
                  </p>
                  <button className="px-10 py-5 bg-primary text-white rounded-[24px] font-bold text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                    Explore Marketplace
                  </button>
                </motion.div>
                <div className="relative">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.05, 1],
                      rotate: [0, -2, 0]
                    }}
                    transition={{ 
                      duration: 8,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="relative z-10 rounded-[64px] overflow-hidden shadow-2xl border-8 border-white/10"
                  >
                    <img 
                      src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1000" 
                      alt="Marketplace" 
                      loading="lazy"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </motion.div>
                  <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                  <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-accent-gold/20 rounded-full blur-3xl animate-pulse" />
                </div>
              </div>
            </section>
          </div>
        )}

        {landingTab === "Features" && (
          <section className="pt-40 pb-20 px-8 max-w-7xl mx-auto min-h-screen">
            <div className="text-center mb-20">
              <h2 className="text-6xl font-black font-display text-slate-900 mb-6">Powerful Features</h2>
              <p className="text-xl text-slate-500 max-w-2xl mx-auto">Discover the tools that make PetsBird the choice of professional breeders.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { 
                  id: "inventory-management",
                  title: "Inventory Management", 
                  desc: "Keep track of every bird, its lineage, and health history.", 
                  icon: Box,
                  content: `Our Inventory Management system is designed to handle thousands of birds with ease. Every bird is assigned a unique digital profile where you can store its ring number, species, mutation, and birth date.

Lineage tracking is automated, allowing you to view an interactive pedigree tree for any bird in your collection. This is essential for maintaining genetic diversity and proving the value of your stock to potential buyers.

The system also includes a comprehensive health log. You can record vaccinations, treatments, and general health observations, ensuring that every bird in your aviary receives the care it needs.`
                },
                { 
                  id: "breeding-pairs",
                  title: "Breeding Pairs", 
                  desc: "Manage couples and track their breeding success over time.", 
                  icon: Heart,
                  content: `Managing breeding pairs has never been simpler. PetsBird allows you to create digital 'couples' and track their performance over multiple seasons.

You can monitor success rates, average clutch sizes, and the quality of offspring produced by each pair. This data-driven approach helps you make informed decisions about which pairs to maintain and which to retire.

The system also alerts you to potential genetic risks, such as inbreeding or incompatible mutations, before you even set the pair up.`
                },
                { 
                  id: "egg-monitoring",
                  title: "Egg Monitoring", 
                  desc: "Never miss a hatch date with our automated notification system.", 
                  icon: EggIcon,
                  content: `The Egg Monitoring system is the heart of our automation tools. Once an egg is laid, simply log it in the app, and PetsBird will calculate the expected hatch date based on the species' specific incubation period.

You'll receive automated notifications for fertility checks and hatching alerts, so you never miss a critical moment in the nest.

The system also tracks failure reasons (e.g., infertile, broken, dead in shell), providing you with valuable insights into your aviary's overall productivity and identifying areas for improvement.`
                },
                { 
                  id: "financial-tracking",
                  title: "Financial Tracking", 
                  desc: "Monitor your aviary's expenses and sales in one place.", 
                  icon: TrendingUp,
                  content: `Turn your passion into a professional business with our Financial Tracking tools. Log every expense, from seed and supplements to vet bills and equipment.

Track your sales and revenue to get a clear picture of your aviary's profitability. The system generates detailed reports, helping you understand your return on investment for different species or mutations.

With PetsBird, you can manage your aviary's budget with the same precision as a professional enterprise.`
                },
                { 
                  id: "health-records",
                  title: "Health Records", 
                  desc: "Log vaccinations, treatments, and vet visits for every bird.", 
                  icon: Activity,
                  content: `Maintaining a healthy aviary is paramount. Our Health Records system allows you to maintain a digital medical history for every bird.

Schedule recurring treatments like deworming or vitamin supplements, and receive reminders when they are due. You can also upload vet certificates and lab results directly to a bird's profile.

In the event of an outbreak, the system helps you quickly identify which birds have been treated and which are at risk, allowing for rapid and effective quarantine measures.`
                },
                { 
                  id: "cage-mapping",
                  title: "Cage Mapping", 
                  desc: "Visualize your aviary layout and bird distribution.", 
                  icon: MapPin,
                  content: `Visualize your entire aviary with our interactive Cage Mapping tool. Define your rooms, blocks, and individual cages to create a digital twin of your physical setup.

Easily move birds between cages with a simple drag-and-drop interface. The system tracks the history of every cage, showing you which birds have occupied it and its current status (e.g., occupied, empty, needs cleaning).

This spatial organization is particularly useful for large-scale breeders managing multiple rooms or species.`
                }
              ].map((f, i) => (
                <div 
                  key={i} 
                  className="glass p-10 rounded-[40px] border-white/20 hover:shadow-2xl transition-all group cursor-pointer"
                  onClick={() => {
                    const featurePath = `/Features/${f.id}`;
                    window.history.pushState({}, '', featurePath);
                    setSelectedArticle({
                      ...f,
                      img: "https://images.unsplash.com/photo-1552728089-57bdde30eba3?auto=format&fit=crop&q=80&w=1000", // Default feature image
                      category: "Core Feature"
                    });
                    setIsArticleModalOpen(true);
                  }}
                >
                  <div className="w-16 h-16 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <f.icon className="w-8 h-8" />
                  </div>
                  <h4 className="text-2xl font-bold text-slate-800 mb-4 group-hover:text-primary transition-colors">{f.title}</h4>
                  <p className="text-slate-500 leading-relaxed mb-6">{f.desc}</p>
                  <button className="text-xs font-black text-primary uppercase tracking-widest">Learn More →</button>
                </div>
              ))}
            </div>

            <div className="mt-32">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                <div>
                  <span className="inline-block px-4 py-1.5 bg-accent-gold/10 text-accent-gold rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
                    Lineage Tracking
                  </span>
                  <h3 className="text-5xl font-black font-display text-slate-900 mb-8">Interactive <br /> <span className="text-accent-gold">Pedigree Trees</span></h3>
                  <p className="text-xl text-slate-500 mb-8 leading-relaxed">
                    Visualize generations of breeding with our interactive family trees. Track mutations, health history, and performance across ancestors with a single click.
                  </p>
                  <div className="space-y-4">
                    {[
                      "Automatic Ancestry Mapping",
                      "Mutation Inheritance Visualization",
                      "Health History Integration",
                      "Exportable Pedigree Certificates"
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-5 h-5 bg-accent-gold/10 text-accent-gold rounded-full flex items-center justify-center">
                          <GitBranch className="w-3 h-3" />
                        </div>
                        <span className="font-bold text-slate-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <div className="glass p-8 rounded-[48px] border-white/40 shadow-2xl relative z-10">
                    <div className="flex flex-col items-center gap-8">
                      {/* Grandparents */}
                      <div className="grid grid-cols-4 gap-4 w-full">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex flex-col items-center">
                            <Bird className="w-4 h-4 text-slate-300 mb-1" />
                            <div className="w-full h-1 bg-slate-200 rounded-full" />
                          </div>
                        ))}
                      </div>
                      {/* Parents */}
                      <div className="grid grid-cols-2 gap-12 w-full max-w-sm">
                        <div className="bg-blue-50 p-4 rounded-3xl border border-blue-100 flex flex-col items-center shadow-sm">
                          <Bird className="w-8 h-8 text-blue-400 mb-2" />
                          <span className="text-[10px] font-black text-blue-500 uppercase">Father</span>
                        </div>
                        <div className="bg-pink-50 p-4 rounded-3xl border border-pink-100 flex flex-col items-center shadow-sm">
                          <Bird className="w-8 h-8 text-pink-400 mb-2" />
                          <span className="text-[10px] font-black text-pink-500 uppercase">Mother</span>
                        </div>
                      </div>
                      {/* Current Bird */}
                      <div className="bg-primary/10 p-6 rounded-[32px] border-2 border-primary/20 flex flex-col items-center shadow-xl scale-110">
                        <Bird className="w-12 h-12 text-primary mb-2" />
                        <span className="text-xs font-black text-primary uppercase">Current Bird</span>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent-gold/20 blur-[80px] rounded-full" />
                  <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/20 blur-[80px] rounded-full" />
                </div>
              </div>
            </div>

            <div className="mt-20 text-center">
              <button 
                onClick={() => navigateToTab("Home")}
                className="inline-flex items-center gap-2 text-primary font-bold uppercase tracking-widest hover:gap-4 transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Home
              </button>
            </div>
          </section>
        )}

        {landingTab === "Genetics" && (
          <section className="pt-40 pb-20 px-8 max-w-7xl mx-auto min-h-screen">
            <div className="text-center mb-20">
              <h2 className="text-6xl font-black font-display text-slate-900 mb-6">Advanced Genetics</h2>
              <p className="text-xl text-slate-500 max-w-2xl mx-auto">Master the science of mutation breeding with our AI-driven genetic tools.</p>
            </div>

            <GeneticsPredictor t={t} />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { 
                  id: "mutation-prediction",
                  title: "Mutation Prediction", 
                  category: "AI Engine", 
                  img: "https://images.unsplash.com/photo-1522926126624-397114120a77?auto=format&fit=crop&q=80&w=600",
                  content: `Our AI Mutation Predictor is the most advanced tool in the aviculture industry. By analyzing the genetic profiles of both parents, the system calculates the exact probability of every possible offspring mutation.

Whether you are working with simple recessive traits or complex multi-mutation combinations, our engine provides a clear percentage breakdown of the results.

This allows you to plan your breeding season with scientific precision, ensuring you focus on the pairs that have the highest potential for producing rare and valuable mutations.`
                },
                { 
                  id: "inheritance-patterns",
                  title: "Inheritance Patterns", 
                  category: "Education", 
                  img: "https://images.unsplash.com/photo-1555008889-51830030f4ba?auto=format&fit=crop&q=80&w=600",
                  content: `Understanding inheritance patterns is key to successful breeding. This guide breaks down the fundamental principles of avian genetics, including dominant, recessive, and sex-linked traits.

We explain how different mutations interact with each other and how to identify 'split' birds that carry hidden genetic information.

Mastering these patterns will help you predict not just the color of your birds, but also their physical characteristics and overall quality.`
                },
                { 
                  id: "genetic-diversity",
                  title: "Genetic Diversity", 
                  category: "Aviary Science", 
                  img: "https://images.unsplash.com/photo-1444464666168-49d633b86797?auto=format&fit=crop&q=80&w=600",
                  content: `Maintaining genetic diversity is essential for the long-term health and sustainability of your aviary. Inbreeding can lead to weakened immune systems, reduced fertility, and physical deformities.

PetsBird's lineage tracking system automatically calculates the Coefficient of Inbreeding (COI) for every potential pairing, alerting you to high-risk combinations.

Learn how to introduce new bloodlines effectively and how to maintain a diverse genetic pool while still focusing on specific mutation goals.`
                }
              ].map((g, i) => (
                <div 
                  key={i} 
                  className="group cursor-pointer"
                  onClick={() => {
                    const geneticsPath = `/Genetics/${g.id}`;
                    window.history.pushState({}, '', geneticsPath);
                    setSelectedArticle(g);
                    setIsArticleModalOpen(true);
                  }}
                >
                  <div className="aspect-[4/3] rounded-[40px] overflow-hidden mb-6 relative">
                    <img 
                      src={g.img} 
                      alt={g.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-6 left-6 px-4 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-slate-800">
                      {g.category}
                    </div>
                  </div>
                  <h4 className="text-2xl font-bold text-slate-800 group-hover:text-primary transition-colors">{g.title}</h4>
                  <button className="mt-4 text-xs font-black text-primary uppercase tracking-widest">Read Article →</button>
                </div>
              ))}
            </div>
            <div className="mt-20 text-center">
              <button 
                onClick={() => navigateToTab("Home")}
                className="inline-flex items-center gap-2 text-primary font-bold uppercase tracking-widest hover:gap-4 transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Home
              </button>
            </div>
          </section>
        )}

        {landingTab === "Advice" && (
          <section className="pt-40 pb-20 px-8 max-w-7xl mx-auto min-h-screen">
            <div className="text-center mb-20">
              <h2 className="text-6xl font-black font-display text-slate-900 mb-6">Breeder Advice</h2>
              <p className="text-xl text-slate-500 max-w-2xl mx-auto">Expert tips and professional advice to help you succeed in your breeding journey.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {ADVICE_ARTICLES.map((r, i) => (
                <div 
                  key={i} 
                  className="group cursor-pointer"
                  onClick={() => navigateToTab(`Advice/${r.id}`, false)}
                >
                  <div className="aspect-[4/3] rounded-[40px] overflow-hidden mb-6 relative">
                    <img 
                      src={r.img} 
                      alt={r.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-6 left-6 px-4 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-slate-800">
                      {r.category}
                    </div>
                  </div>
                  <h4 className="text-2xl font-bold text-slate-800 group-hover:text-primary transition-colors">{r.title}</h4>
                  <button className="mt-4 text-xs font-black text-primary uppercase tracking-widest">Read Article →</button>
                </div>
              ))}
            </div>
            <div className="mt-20 text-center">
              <button 
                onClick={() => navigateToTab("Home")}
                className="inline-flex items-center gap-2 text-primary font-bold uppercase tracking-widest hover:gap-4 transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Home
              </button>
            </div>
          </section>
        )}

        {landingTab === "News" && (
          <section className="pt-40 pb-20 px-8 max-w-7xl mx-auto min-h-screen">
            <div className="text-center mb-20">
              <h2 className="text-6xl font-black font-display text-slate-900 mb-6">Latest News</h2>
              <p className="text-xl text-slate-500 max-w-2xl mx-auto">Stay updated with the latest trends and discoveries in the world of birds.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {NEWS_ARTICLES.map((n, i) => (
                <div 
                  key={i} 
                  className="glass p-8 rounded-[40px] border-white/20 hover:shadow-2xl transition-all group cursor-pointer"
                  onClick={() => navigateToTab(`News/${n.id}`, false)}
                >
                  <div className="aspect-video rounded-3xl overflow-hidden mb-6">
                    <img src={n.img} alt={n.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                  </div>
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest">{n.date}</span>
                  <h4 className="text-xl font-bold text-slate-800 mt-2 mb-4 group-hover:text-primary transition-colors">{n.title}</h4>
                  <p className="text-sm text-slate-500 leading-relaxed mb-6">{n.desc}</p>
                  <button className="text-xs font-black text-slate-900 uppercase tracking-widest hover:text-primary transition-colors">Read More →</button>
                </div>
              ))}
            </div>
            <div className="mt-20 text-center">
              <button 
                onClick={() => navigateToTab("Home")}
                className="inline-flex items-center gap-2 text-primary font-bold uppercase tracking-widest hover:gap-4 transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Home
              </button>
            </div>
          </section>
        )}

        {landingTab === "Terms" && (
          <section className="pt-40 pb-20 px-8 max-w-4xl mx-auto min-h-screen">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-black font-display text-slate-900 mb-6">Terms & Conditions</h2>
              <p className="text-slate-500">Last updated: April 9, 2026</p>
            </div>
            <div className="prose prose-slate max-w-none glass p-12 rounded-[40px] border-white/20">
              <h3 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h3>
              <p className="text-slate-600 mb-8">By accessing and using PetsBird.com, you agree to be bound by these Terms and Conditions and all applicable laws and regulations.</p>
              
              <h3 className="text-2xl font-bold mb-4">2. Use License</h3>
              <p className="text-slate-600 mb-8">Permission is granted to temporarily download one copy of the materials on PetsBird's website for personal, non-commercial transitory viewing only.</p>
              
              <h3 className="text-2xl font-bold mb-4">3. Disclaimer</h3>
              <p className="text-slate-600 mb-8">The materials on PetsBird's website are provided on an 'as is' basis. PetsBird makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability.</p>
              
              <h3 className="text-2xl font-bold mb-4">4. Limitations</h3>
              <p className="text-slate-600 mb-8">In no event shall PetsBird or its suppliers be liable for any damages arising out of the use or inability to use the materials on PetsBird's website.</p>
            </div>
            <div className="mt-20 text-center">
              <button 
                onClick={() => navigateToTab("Home")}
                className="inline-flex items-center gap-2 text-primary font-bold uppercase tracking-widest hover:gap-4 transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Home
              </button>
            </div>
          </section>
        )}

        {landingTab === "About" && (
          <section className="pt-40 pb-20 px-8 max-w-5xl mx-auto min-h-screen">
            <div className="text-center mb-16">
              <div className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-primary/10 border border-slate-100">
                <Logo variant="icon" className="w-12 h-12" />
              </div>
              <h2 className="text-5xl font-black font-display text-slate-900 mb-4 tracking-tight">About <span className="text-primary italic">PetsBird</span></h2>
              <p className="text-xs font-black text-primary uppercase tracking-[0.3em]">A passion for aviculture, powered by technology</p>
            </div>

            <div className="space-y-20">
              <div className="glass p-12 rounded-[48px] border-white/20">
                <p className="text-xl text-slate-600 leading-relaxed font-medium">
                  Founded in 2024, PetsBird was born from a simple idea: that technology should empower breeders, not complicate their lives. We bridge the gap between traditional bird breeding and modern digital management, providing tools and insights that make a real difference in the aviary.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Why PetsBird is Different? <br /><span className="text-primary text-xl">(Our Expertise)</span></h3>
                  <p className="text-slate-500 leading-relaxed text-lg">
                    Unlike generic advice websites, PetsBird is built on real-world experience. We operate a professional 70-square-meter breeding facility where we test every technique, diet, and supplement we recommend.
                  </p>
                  <p className="text-slate-500 leading-relaxed text-lg">
                    Our content is rooted in practical success—from managing complex genetic mutations to achieving high-productivity cycles, such as our recent milestone of successfully raising 10 healthy chicks in a single month.
                  </p>
                </div>
                <div className="aspect-square rounded-[48px] overflow-hidden shadow-2xl">
                  <img 
                    src="https://images.unsplash.com/photo-1552728089-57bdde30eba3?auto=format&fit=crop&q=80&w=1000" 
                    alt="Breeding Facility" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>

              <div className="bg-slate-900 rounded-[64px] p-16 text-white text-center">
                <h3 className="text-xs font-black text-primary uppercase tracking-[0.4em] mb-6">Our Vision</h3>
                <p className="text-3xl font-bold leading-tight max-w-3xl mx-auto">
                  To create a world where every breeder, from hobbyists to professionals, has access to professional-grade management tools and scientifically backed avian knowledge.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { title: "Integrity", desc: "We only share advice that has been tried and tested in our own breeding rooms." },
                  { title: "Innovation", desc: "We continuously develop digital solutions to simplify tracking, breeding cycles, and genetic mapping." },
                  { title: "Bird Welfare", desc: "We place the health and well-being of every bird at the core of everything we do." }
                ].map((v, i) => (
                  <div key={i} className="glass p-10 rounded-[40px] border-white/10 hover:bg-white/10 transition-colors">
                    <h5 className="text-xl font-black text-slate-900 mb-4 uppercase tracking-widest">{v.title}</h5>
                    <p className="text-slate-500 leading-relaxed">{v.desc}</p>
                  </div>
                ))}
              </div>

              <div className="text-center space-y-6 pb-20">
                <h3 className="text-4xl font-black text-slate-900">A Global Community</h3>
                <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
                  Today, PetsBird serves a dedicated community of breeders across 40 countries. We are more than just a platform; we are a global network of experts sharing vital knowledge to ensure the future of aviculture worldwide.
                </p>
                <div className="pt-10">
                  <button 
                    onClick={() => navigateToTab("Home")}
                    className="inline-flex items-center gap-2 text-primary font-bold uppercase tracking-widest hover:gap-4 transition-all"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Home
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {landingTab === "Marketplace" && (
          <section className="pt-40 pb-20 px-8 max-w-7xl mx-auto min-h-screen">
            <div className="text-center mb-20">
              <h2 className="text-6xl font-black font-display text-slate-900 mb-6">Marketplace</h2>
              <p className="text-xl text-slate-500 max-w-2xl mx-auto">Connect with verified breeders and find the perfect addition to your aviary.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { title: "Rare Mutation Canaries", price: "$150", img: "https://images.unsplash.com/photo-1522926126624-397114120a77?auto=format&fit=crop&q=80&w=600" },
                { title: "Show Quality Budgies", price: "$80", img: "https://images.unsplash.com/photo-1444464666168-49d633b86797?auto=format&fit=crop&q=80&w=600" },
                { title: "Breeding Pairs", price: "$250", img: "https://images.unsplash.com/photo-1555008889-51830030f4ba?auto=format&fit=crop&q=80&w=600" }
              ].map((item, i) => (
                <div key={i} className="glass p-6 rounded-[40px] border-white/20 group cursor-pointer">
                  <div className="aspect-square rounded-3xl overflow-hidden mb-6">
                    <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-800 mb-2">{item.title}</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-primary font-black">{item.price}</span>
                    <button className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-colors">View Details</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-20 text-center">
              <button 
                onClick={() => navigateToTab("Home")}
                className="inline-flex items-center gap-2 text-primary font-bold uppercase tracking-widest hover:gap-4 transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Home
              </button>
            </div>
          </section>
        )}

        {landingTab === "Privacy" && (
          <section className="pt-40 pb-20 px-8 max-w-4xl mx-auto min-h-screen">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-black font-display text-slate-900 mb-6">Privacy Policy</h2>
              <p className="text-slate-500">Last updated: April 9, 2026</p>
            </div>
            <div className="prose prose-slate max-w-none glass p-12 rounded-[40px] border-white/20">
              <h3 className="text-2xl font-bold mb-4">1. Information We Collect</h3>
              <p className="text-slate-600 mb-8">We collect information you provide directly to us, such as when you create an account, update your profile, or use our breeding tools.</p>
              
              <h3 className="text-2xl font-bold mb-4">2. How We Use Your Information</h3>
              <p className="text-slate-600 mb-8">We use the information we collect to provide, maintain, and improve our services, and to develop new features for our breeders.</p>
              
              <h3 className="text-2xl font-bold mb-4">3. Data Security</h3>
              <p className="text-slate-600 mb-8">We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access.</p>
            </div>
            <div className="mt-20 text-center">
              <button 
                onClick={() => navigateToTab("Home")}
                className="inline-flex items-center gap-2 text-primary font-bold uppercase tracking-widest hover:gap-4 transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Home
              </button>
            </div>
          </section>
        )}

        {landingTab === "Contact" && (
          <section className="pt-40 pb-20 px-8 max-w-4xl mx-auto min-h-screen">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-black font-display text-slate-900 mb-6">Contact Us</h2>
              <p className="text-slate-500">We're here to help you with any questions or feedback.</p>
            </div>
            <div className="glass p-12 rounded-[40px] border-white/20">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
                <div>
                  <h4 className="text-xl font-bold text-slate-800 mb-4">Email Us</h4>
                  <p className="text-slate-500 mb-2">Support: support@petsbird.com</p>
                  <p className="text-slate-500">Partnerships: hello@petsbird.com</p>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-800 mb-4">Follow Us</h4>
                  <p className="text-slate-500 mb-2">Twitter: @PetsBirdApp</p>
                  <p className="text-slate-500">Instagram: @petsbird_official</p>
                </div>
              </div>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input type="text" placeholder="Name" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:border-primary transition-all" />
                  <input type="email" placeholder="Email" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:border-primary transition-all" />
                </div>
                <textarea placeholder="Your Message" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:border-primary transition-all h-40"></textarea>
                <button className="w-full py-5 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">Send Message</button>
              </form>
            </div>
            <div className="mt-20 text-center">
              <button 
                onClick={() => navigateToTab("Home")}
                className="inline-flex items-center gap-2 text-primary font-bold uppercase tracking-widest hover:gap-4 transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Home
              </button>
            </div>
          </section>
        )}

        {/* Stats Section */}
        <section className="py-32 px-8 bg-slate-900 text-white overflow-hidden relative">
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
              {[
                { label: "Breeders", value: "12,400+" },
                { label: "Birds Managed", value: "85,000+" },
                { label: "Eggs Tracked", value: "240k+" },
                { label: "Countries", value: "42" }
              ].map((stat, i) => (
                <div key={i}>
                  <div className="text-4xl md:text-6xl font-black font-display text-primary mb-2">{stat.value}</div>
                  <div className="text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-[0.3em]">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white rounded-full" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white rounded-full" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-white rounded-full" />
          </div>
        </section>

        {/* Footer */}
        <footer className="py-20 px-8 bg-white border-t border-slate-100">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center gap-12">
              <div 
                onClick={() => navigateToTab("Home")}
                className="cursor-pointer group"
              >
                <Logo className="group-hover:scale-105 transition-transform" />
              </div>
              <div className="flex gap-12">
                <div className="space-y-4">
                  <h5 className="text-xs font-black uppercase tracking-widest text-slate-400">Product</h5>
                  <ul className="space-y-2 text-sm font-bold text-slate-600">
                    <li onClick={() => navigateToTab("Features", false)} className="hover:text-primary cursor-pointer">Features</li>
                    <li onClick={() => navigateToTab("Genetics", false)} className="hover:text-primary cursor-pointer">AI Genetics</li>
                    <li onClick={() => navigateToTab("Advice", false)} className="hover:text-primary cursor-pointer">Advice</li>
                    <li onClick={() => navigateToTab("Marketplace", false)} className="hover:text-primary cursor-pointer">Marketplace</li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h5 className="text-xs font-black uppercase tracking-widest text-slate-400">Company</h5>
                  <ul className="space-y-2 text-sm font-bold text-slate-600">
                    <li onClick={() => navigateToTab("About", false)} className="hover:text-primary cursor-pointer">About Us</li>
                    <li onClick={() => navigateToTab("Terms", false)} className="hover:text-primary cursor-pointer">Terms & Conditions</li>
                    <li onClick={() => navigateToTab("Contact", false)} className="hover:text-primary cursor-pointer">Contact</li>
                    <li onClick={() => navigateToTab("Privacy", false)} className="hover:text-primary cursor-pointer">Privacy</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="mt-20 pt-8 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
              <p className="text-xs font-bold text-slate-400">© 2026 PetsBird. All rights reserved.</p>
              <div className="flex gap-6">
                <a 
                  href="https://web.facebook.com/PetsBirdOfficial/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-primary/10 hover:text-primary transition-all cursor-pointer"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a 
                  href="https://www.instagram.com/petsbirdofficial/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-primary/10 hover:text-primary transition-all cursor-pointer"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-primary/10 hover:text-primary transition-all cursor-pointer">
                  <Mail className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  const aviarySpecies = ["All", ...Array.from(new Set(birds.map(b => b.species)))];

  return (
    <div className="flex min-h-screen bg-background font-sans selection:bg-primary/10 overflow-x-hidden">
      {/* Sidebar - Desktop/Tablet */}
      <aside className={`hidden md:flex flex-col bg-sidebar text-white fixed h-screen z-50 transition-all duration-300 overflow-y-auto custom-scrollbar ${isSidebarCollapsed ? 'w-20 p-4' : 'w-72 p-6'}`}>
        <div className="flex items-center justify-between mb-10 px-2">
          {!isSidebarCollapsed && (
            <div onClick={() => setShowApp(false)} className="cursor-pointer group">
              <Logo theme="dark" className="group-hover:scale-105 transition-transform" />
            </div>
          )}
          {isSidebarCollapsed && (
            <div onClick={() => setShowApp(false)} className="cursor-pointer mx-auto">
              <Logo variant="icon" className="w-8 h-8" />
            </div>
          )}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="hidden lg:flex p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400"
          >
            {isSidebarCollapsed ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          </button>
        </div>

        {!isSidebarCollapsed && (
          <div 
            onClick={() => setIsProfileModalOpen(true)}
            className="glass-dark p-4 rounded-2xl mb-8 flex items-center gap-3 border-white/5 cursor-pointer hover:bg-white/10 transition-all"
          >
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10">
              <img 
                src={user?.photoURL || "https://picsum.photos/seed/user/200/200"} 
                alt="Profile" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold truncate">{userProfile?.name || user?.displayName || "Breeder"}</span>
                <span className="text-[9px] bg-accent-gold/20 text-accent-gold px-1.5 py-0.5 rounded-md font-bold uppercase">Admin</span>
              </div>
              <div className="flex items-center gap-1 text-slate-500 text-[10px] mt-0.5">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{userProfile.location}</span>
                <ChevronDown className="w-3 h-3" />
              </div>
            </div>
          </div>
        )}

        <nav className="flex-1 space-y-2">
          {!isSidebarCollapsed && (
            <div className="flex items-center gap-2 px-4 mb-4">
              <div className="w-1 h-4 bg-primary rounded-full" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Main Menu</span>
            </div>
          )}
          <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeTab === "Dashboard"} onClick={() => setActiveTab("Dashboard")} collapsed={isSidebarCollapsed} />
          <SidebarItem icon={Users} label="My Birds" active={activeTab === "My Birds"} onClick={() => setActiveTab("My Birds")} collapsed={isSidebarCollapsed} />
          <SidebarItem icon={Heart} label="Couples" active={activeTab === "Couples"} onClick={() => setActiveTab("Couples")} collapsed={isSidebarCollapsed} />
          <SidebarItem icon={GitBranch} label="Pedigree Tree" active={activeTab === "Pedigree Tree"} onClick={() => setActiveTab("Pedigree Tree")} collapsed={isSidebarCollapsed} />
          <SidebarItem icon={EggIcon} label="Eggs" active={activeTab === "Eggs"} onClick={() => setActiveTab("Eggs")} collapsed={isSidebarCollapsed} />
          <SidebarItem icon={Sparkles} label="AI Genetics" active={activeTab === "AI Genetics"} onClick={() => setActiveTab("AI Genetics")} collapsed={isSidebarCollapsed} />
          <SidebarItem icon={ShoppingBag} label="Marketplace" active={activeTab === "Marketplace"} onClick={() => setActiveTab("Marketplace")} collapsed={isSidebarCollapsed} />
          
          <div className={`pt-8 pb-4 ${isSidebarCollapsed ? 'px-0 text-center' : 'px-4'}`}>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{isSidebarCollapsed ? "..." : "Resources"}</span>
          </div>
          <SidebarItem icon={BookOpen} label="Advice" active={activeTab === "Advice"} onClick={() => setActiveTab("Advice")} collapsed={isSidebarCollapsed} />
          <SidebarItem icon={Newspaper} label="News" active={activeTab === "News"} onClick={() => setActiveTab("News")} collapsed={isSidebarCollapsed} />
          <SidebarItem icon={Info} label="About Us" active={activeTab === "About Us"} onClick={() => setActiveTab("About Us")} collapsed={isSidebarCollapsed} />
          <SidebarItem icon={Mail} label="Contact Us" active={activeTab === "Contact Us"} onClick={() => setActiveTab("Contact Us")} collapsed={isSidebarCollapsed} />

          <div className={`pt-8 pb-4 ${isSidebarCollapsed ? 'px-0 text-center' : 'px-4'}`}>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{isSidebarCollapsed ? "..." : "System"}</span>
          </div>
          <SidebarItem icon={Download} label="Download App" onClick={handleInstallClick} collapsed={isSidebarCollapsed} />
          <SidebarItem icon={LayoutDashboard} label="Back to Home" onClick={() => setShowApp(false)} collapsed={isSidebarCollapsed} />
          <SidebarItem icon={Settings} label="Settings" active={activeTab === "Settings"} onClick={() => setActiveTab("Settings")} collapsed={isSidebarCollapsed} />
          <SidebarItem icon={LogOut} label="Logout" onClick={handleLogout} collapsed={isSidebarCollapsed} />
        </nav>

        {!isSidebarCollapsed && (
          <div className="mt-auto pt-6 border-t border-white/5 flex flex-col items-center gap-4">
            <div className="flex gap-4">
              <a 
                href="https://web.facebook.com/PetsBirdOfficial/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:bg-primary/20 hover:text-primary transition-all cursor-pointer"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a 
                href="https://www.instagram.com/petsbirdofficial/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:bg-primary/20 hover:text-primary transition-all cursor-pointer"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
            <span className="text-[10px] text-slate-600 font-medium">v2.1.0</span>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 p-4 md:p-10 pb-24 md:pb-10 ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-72'} bg-slate-900 min-h-screen`}>
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 md:mb-12">
          <div className="flex items-center gap-4">
            <div className="md:hidden">
              <Logo variant="icon" className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-2xl md:text-5xl font-black font-display text-white tracking-tighter">{activeTab}</h2>
            </div>
          </div>
          <div className="flex items-center gap-3 md:gap-4 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleInstallClick}
              className="hidden lg:flex items-center gap-2 bg-slate-100 text-slate-600 px-4 py-3 rounded-2xl font-bold text-sm hover:bg-primary hover:text-white transition-all shrink-0"
            >
              <Download className="w-4 h-4" /> Download App
            </motion.button>
            {selectedBirds.length === 2 && activeTab === "My Birds" && (
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={handleCreateCouple}
                className="bg-accent-gold text-white px-4 md:px-6 py-2.5 md:py-3 rounded-2xl font-bold text-xs md:text-sm shadow-lg shadow-accent-gold/20 flex items-center gap-2 shrink-0"
              >
                <LinkIcon className="w-4 h-4" /> Create Couple
              </motion.button>
            )}
            <div className="relative shrink-0">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="w-10 h-10 md:w-12 md:h-12 glass rounded-2xl flex items-center justify-center text-slate-600 relative"
              >
                <Bell className="w-5 h-5" />
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-2.5 right-2.5 md:top-3 md:right-3 w-2 h-2 bg-accent-orange rounded-full border-2 border-white" />
                )}
              </motion.button>

              <AnimatePresence>
                {isNotificationsOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsNotificationsOpen(false)} 
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-4 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 z-50 overflow-hidden"
                    >
                      <div className="p-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                        <h4 className="font-bold text-sm">Notifications</h4>
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => setNotifications(notifications.map(n => ({ ...n, read: true })))}
                            className="text-[10px] font-bold text-primary uppercase tracking-wider"
                          >
                            Read All
                          </button>
                          <div className="w-px h-3 bg-slate-200" />
                          <button 
                            onClick={() => setNotifications([])}
                            className="text-[10px] font-bold text-red-500 uppercase tracking-wider"
                          >
                            Clear All
                          </button>
                        </div>
                      </div>
                      <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map((n) => (
                            <div 
                              key={n.id} 
                              className={`p-5 border-b border-slate-50 hover:bg-slate-50 transition-colors group relative ${!n.read ? 'bg-primary/5' : ''}`}
                            >
                              <div className="flex justify-between items-start mb-1">
                                <h5 className="font-bold text-xs text-slate-800">{n.title}</h5>
                                <div className="flex items-center gap-2">
                                  <span className="text-[9px] text-slate-400">{n.time}</span>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setNotifications(prev => prev.filter(item => item.id !== n.id));
                                    }}
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 rounded text-slate-400 transition-all"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                              <p className="text-[11px] text-slate-500 leading-relaxed">{n.message}</p>
                            </div>
                          ))
                        ) : (
                          <div className="p-10 text-center">
                            <Bell className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                            <p className="text-xs text-slate-400">No notifications yet</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
            {renderHeaderButton()}
          </div>
        </header>

        {activeTab === "Dashboard" && (
          <div className="space-y-10" ref={dashboardRef}>
            {/* Quick Stats Grid - More visual like the image */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {/* Featured Bird Stats - Health Tracking Style */}
              {birds.slice(0, 2).map((bird, idx) => (
                <motion.div 
                  key={bird.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-3xl md:rounded-[32px] overflow-hidden shadow-2xl relative group h-full flex flex-col min-h-[220px] md:min-h-[280px]"
                >
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Health Tracking</span>
                    <Activity className="w-4 h-4 text-primary animate-pulse" />
                  </div>
                  <div className="relative flex-1">
                    <img 
                      src={bird.imageUrl || DEFAULT_BIRD_IMAGE} 
                      alt={bird.name}
                      className="absolute inset-0 w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <div className="text-xl font-black leading-tight truncate">{bird.name}</div>
                      <div className="text-[10px] font-bold opacity-80 uppercase tracking-widest truncate">{bird.species}</div>
                    </div>
                  </div>
                  <div className="p-5 space-y-4 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vital Score</div>
                      <div className="text-base font-black text-primary">80%</div>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "80%" }}
                        className="h-full bg-primary"
                      />
                    </div>
                  </div>
                </motion.div>
              ))}

              <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 md:gap-6 lg:contents">
                <StatCard 
                  icon={TrendingUp} 
                  value={`${eggs.filter(e => e.isFertile).length > 0 ? Math.round((eggs.filter(e => e.status === 'Completed').length / eggs.filter(e => e.isFertile).length) * 100) : 0}%`} 
                  label="Hatch rate" 
                  colorClass="bg-green-50 text-green-600" 
                  onClick={() => setActiveTab("Eggs")}
                />
                <StatCard 
                  icon={Activity} 
                  value={Math.round((eggs.filter(e => e.status === 'Completed').length / (eggs.length || 1)) * 100)} 
                  label="Performance" 
                  colorClass="bg-blue-50 text-blue-600" 
                  onClick={() => setActiveTab("Statistics")}
                />
              </div>
            </div>

            {/* Charts Section - White cards on dark BG */}
            <div id="charts-section" className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              <div className="lg:col-span-2 bg-white p-6 md:p-10 rounded-3xl md:rounded-[40px] shadow-2xl">
                <div className="flex items-center justify-between mb-6 md:mb-10">
                  <div>
                    <h3 className="text-xl md:text-2xl font-black text-slate-900">Health Monitoring Chart</h3>
                    <p className="text-[10px] md:text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">Real-time Data Stream</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-primary rounded-full" />
                    <span className="text-xs font-black uppercase text-slate-400">Activity Level</span>
                  </div>
                </div>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={(() => {
                      const monthlyData: { [key: string]: number } = {};
                      eggs.forEach(egg => {
                        if (!egg.laidDate) return;
                        const date = new Date(egg.laidDate);
                        if (isNaN(date.getTime())) return;
                        const month = date.toLocaleString('default', { month: 'short' });
                        monthlyData[month] = (monthlyData[month] || 0) + 1;
                      });
                      return Object.entries(monthlyData).map(([name, count]) => ({ name, count }));
                    })()}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)' }}
                        cursor={{ fill: '#f8fafc' }}
                      />
                      <Bar dataKey="count" fill="#1A73E8" radius={[12, 12, 12, 12]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-10 rounded-[40px] shadow-2xl space-y-10">
                <div>
                   <h3 className="text-2xl font-black text-slate-900">Aviary Status</h3>
                   <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Detailed Metrics Distribution</p>
                </div>
                <div className="h-[300px] relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Fertile', value: eggs.filter(e => e.isFertile && e.status !== 'Completed' && e.status !== 'Failed' && e.status !== 'Broken' && e.status !== 'DeadInShell').length, color: '#ffb800' },
                          { name: 'Hatched', value: eggs.filter(e => e.status === 'Completed').length, color: '#1A73E8' },
                          { name: 'Failed', value: eggs.filter(e => e.status === 'Failed' || e.isFertile === false || e.status === 'DeadInShell').length, color: '#EF4444' },
                          { name: 'Broken', value: eggs.filter(e => e.status === 'Broken').length, color: '#FF6B6B' },
                          { name: 'Pending', value: eggs.filter(e => e.status === 'Intact' && e.isFertile === undefined).length, color: '#94A3B8' }
                        ]}
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={8}
                        dataKey="value"
                      >
                        {[0, 1, 2, 3, 4].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#ffb800', '#1A73E8', '#EF4444', '#FF6B6B', '#94A3B8'][index]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                    <div className="text-4xl font-black text-slate-900">{eggs.length}</div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Eggs</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl flex flex-col gap-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fertile</span>
                    <span className="text-xl font-black text-amber-500">{eggs.filter(e => e.isFertile).length}</span>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl flex flex-col gap-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hatched</span>
                    <span className="text-xl font-black text-primary">{eggs.filter(e => e.status === 'Completed').length}</span>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl flex flex-col gap-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Clear (غير مخصب)</span>
                    <span className="text-xl font-black text-red-500">{eggs.filter(e => e.isFertile === false).length}</span>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl flex flex-col gap-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Broken/Failed</span>
                    <span className="text-xl font-black text-slate-900">{eggs.filter(e => e.status === 'Broken' || e.status === 'Failed' || e.status === 'DeadInShell').length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Tracker Style */}
            <div className="bg-white p-5 md:p-10 rounded-3xl md:rounded-[40px] shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                <TrendingUp className="w-48 h-48 md:w-64 md:h-64 text-primary" />
              </div>
              <div className="relative z-10">
                <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-6 md:mb-8">Performance Tracking Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                    {[
                      { label: "Pair Activity", val: couples.length, target: "Optimal", icon: Heart, color: "text-red-500" },
                      { label: "Chick Survival", val: "92%", target: "95%", icon: Sparkles, color: "text-amber-500" },
                      { label: "Inventory Level", val: "Stable", target: "Healthy", icon: Box, color: "text-blue-500" },
                      { label: "Aviary Status", val: "Optimal", target: "Ready", icon: Shield, color: "text-green-500" }
                    ].map((item, i) => (
                     <div key={i} className="space-y-4">
                        <div className="flex items-center gap-3">
                           <div className={`p-2 rounded-xl bg-slate-50 ${item.color}`}>
                              <item.icon className="w-5 h-5" />
                           </div>
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                        </div>
                        <div className="text-3xl font-black text-slate-900">{item.val}</div>
                        <div className="flex items-center justify-between text-[10px] font-bold">
                           <span className="text-slate-400 italic">Target: {item.target}</span>
                           <span className="text-green-500">+2.5%</span>
                        </div>
                     </div>
                   ))}
                </div>
              </div>
            </div>
            {/* Top Performing Couples */}
            <div className="bg-white p-5 md:p-10 rounded-3xl md:rounded-[40px] shadow-2xl">
              <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-6 md:mb-8">Top Performing Couples</h3>
              <div className="space-y-3 md:space-y-4">
                {couples
                  .map(couple => {
                    const coupleEggs = eggs.filter(e => e.coupleId === couple.id);
                    const hatchedCount = coupleEggs.filter(e => e.status === 'Completed').length;
                    const fertilityRate = coupleEggs.length > 0 
                      ? (coupleEggs.filter(e => e.isFertile).length / coupleEggs.length) * 100 
                      : 0;
                    const male = birds.find(b => b.id === couple.maleId);
                    const female = birds.find(b => b.id === couple.femaleId);
                    return { ...couple, hatchedCount, fertilityRate, male, female };
                  })
                  .sort((a, b) => b.hatchedCount - a.hatchedCount)
                  .slice(0, 5)
                  .map((couple, i) => (
                    <div key={couple.id} className="bg-slate-50 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-4 md:gap-6 w-full sm:w-auto">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black shrink-0">
                          #{i + 1}
                        </div>
                        <div className="min-w-0">
                          <div className="font-black text-base md:text-lg text-slate-900 truncate">
                            {couple.male?.name || 'Pair'} × {couple.female?.name || ''}
                          </div>
                          <div className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest truncate">
                            {couple.hatchedCount} Successful Hatches
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 self-end sm:self-center">
                        <div className="text-right">
                           <div className="text-lg md:text-xl font-black text-slate-900">{Math.round(couple.fertilityRate)}%</div>
                           <div className="text-[9px] md:text-[10px] text-slate-400 uppercase font-black tracking-widest">Fertility</div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* PWA Download Banner */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-primary to-blue-700 p-6 md:p-10 rounded-3xl md:rounded-[40px] shadow-2xl shadow-primary/20 text-white flex flex-col md:flex-row items-center justify-between group overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                <Download className="w-48 h-48 md:w-64 md:h-64" />
              </div>
              <div className="relative z-10 max-w-2xl text-center md:text-left">
                <h3 className="text-2xl md:text-3xl font-black mb-3">PetsBird Mobile Experience</h3>
                <p className="text-blue-100 font-bold leading-relaxed mb-6 md:mb-8 text-sm md:text-base">احصل على تجربة أفضل واسرع من خلال تثبيت التطبيق على هاتفك. تتبع طيورك وانتاجك في أي وقت وفي أي مكان.</p>
                <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
                  <button 
                    onClick={handleInstallClick}
                    className="w-full sm:w-auto px-8 md:px-10 py-3.5 md:py-4 bg-white text-primary rounded-2xl font-black text-sm shadow-xl hover:bg-slate-50 hover:scale-105 transition-all flex items-center justify-center gap-3"
                  >
                    <Download className="w-5 h-5" />
                    تثبيت التطبيق الآن
                  </button>
                  <div className="w-full sm:w-auto px-6 py-3.5 md:py-4 bg-primary-dark/30 backdrop-blur-md rounded-2xl text-[10px] font-black uppercase tracking-widest text-blue-100 border border-white/10 flex items-center justify-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    Works on iOS & Android
                  </div>
                </div>
              </div>
            </motion.div>

            <section>
              <div className="flex items-center justify-between mb-6 md:mb-8">
                <h3 className="text-xl md:text-2xl font-bold font-display text-white">Recent Birds</h3>
              </div>
            <div className={`grid gap-4 md:gap-8 ${
              statusFilter === "Chick" ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            }`}>
                {birds.slice(-3).map((bird) => (
                  <BirdCard 
                    key={bird.id} 
                    {...bird} 
                    allBirds={birds}
                    onExportCertificate={exportPedigreePDF}
                    onCageClick={(cage) => {
                      setCageFilter(cage);
                      setActiveTab("My Birds");
                    }}
                  />
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === "My Birds" && (
          <section>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <h3 className="text-3xl font-black font-display text-white">All Birds</h3>
                  <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar no-scrollbar">
                    {aviarySpecies.map(species => (
                      <button
                        key={species}
                        onClick={() => setSpeciesFilter(species)}
                        className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                          speciesFilter === species 
                            ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                            : 'bg-white/10 text-white/60 hover:bg-white/20'
                        }`}
                      >
                        {species}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {["All", "Ready", "Resting", "Paired", "Chick", "Sold", "Deceased"].map(status => (
                      <button
                        key={status}
                        onClick={() => {
                          setStatusFilter(status);
                          if (status !== "Chick" && coupleFilter !== "All") setCoupleFilter("All");
                        }}
                        className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                          statusFilter === status 
                            ? 'bg-accent-gold text-white shadow-lg shadow-accent-gold/20' 
                            : 'bg-white/5 text-white/40 hover:bg-white/10'
                        }`}
                      >
                        {status === "All" ? "All Status (الكل)" : status === "Deceased" ? "Deceased (مات)" : status}
                      </button>
                    ))}
                  </div>

                  {statusFilter === "Chick" && couples.length > 0 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                      <button
                        onClick={() => setCoupleFilter("All")}
                        className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                          coupleFilter === "All" 
                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' 
                            : 'bg-white/5 text-white/40 hover:bg-white/10'
                        }`}
                      >
                        All Offspring (كل الفراخ)
                      </button>
                      {couples.map(couple => {
                        const male = birds.find(b => b.id === couple.maleId);
                        const female = birds.find(b => b.id === couple.femaleId);
                        const label = `${male?.name || 'Pair'} × ${female?.name || ''}`;
                        return (
                          <button
                            key={couple.id}
                            onClick={() => setCoupleFilter(couple.id)}
                            className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                              coupleFilter === couple.id 
                                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' 
                                : 'bg-white/5 text-white/40 hover:bg-white/10'
                            }`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                {cageFilter && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-2xl text-xs font-bold border border-primary/20 shadow-sm">
                    <MapPin className="w-3.5 h-3.5" />
                    Cage: {cageFilter}
                    <button 
                      onClick={() => setCageFilter(null)} 
                      className="ml-2 p-1 hover:bg-primary/20 rounded-lg transition-colors"
                      title="Clear Filter"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                {coupleFilter !== "All" && (
                   <div className="flex items-center gap-2 px-4 py-2 bg-purple-600/10 text-purple-600 rounded-2xl text-xs font-bold border border-purple-600/20 shadow-sm">
                    <Heart className="w-3.5 h-3.5" />
                    Couple Offspring
                    <button 
                      onClick={() => setCoupleFilter("All")} 
                      className="ml-2 p-1 hover:bg-purple-600/20 rounded-lg transition-colors"
                      title="Clear Filter"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                {selectedBirds.length > 0 && (
                  <span className="text-sm font-bold text-primary bg-primary/5 px-4 py-2 rounded-2xl border border-primary/10">
                    {selectedBirds.length}/2 birds selected for coupling
                  </span>
                )}
              </div>
            </div>
            
            <div className={`grid gap-4 md:gap-8 ${
              statusFilter === "Chick" ? "grid-cols-2 lg:grid-cols-4 shadow-inner bg-slate-50/50 p-4 rounded-[40px]" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            }`}>
              {birds
                .filter(b => {
                  const matchesCage = !cageFilter || b.cage === cageFilter;
                  const matchesSpecies = speciesFilter === "All" || b.species === speciesFilter;
                  const matchesStatus = statusFilter === "All" || b.status === statusFilter;
                  const matchesCouple = coupleFilter === "All" || (
                    couples.find(c => c.id === coupleFilter && (
                      (b.fatherId === c.maleId && b.motherId === c.femaleId)
                    ))
                  );
                  return matchesCage && matchesSpecies && matchesStatus && matchesCouple;
                })
                .map((bird) => (
                <BirdCard 
                  key={bird.id} 
                  {...bird} 
                  allBirds={birds}
                  onSelect={() => handleToggleBirdSelection(bird.id)}
                  isSelected={selectedBirds.includes(bird.id)}
                  onEdit={() => openBirdModal(bird)}
                  onDelete={handleDeleteBird}
                  onViewPedigree={(id) => {
                    setPedigreeBirdId(id);
                    setIsPedigreeModalOpen(true);
                  }}
                  onExportCertificate={exportPedigreePDF}
                  onCageClick={(cage) => setCageFilter(cage)}
                  onShare={() => handleShareWhatsApp(bird)}
                />
              ))}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setIsModalOpen(true)}
                className="border-2 border-dashed border-slate-200 rounded-[32px] flex flex-col items-center justify-center p-8 text-slate-400 hover:border-primary/40 hover:text-primary/40 transition-colors cursor-pointer group"
              >
                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4 group-hover:bg-primary/5 transition-colors">
                  <Bird className="w-8 h-8" />
                </div>
                <span className="font-bold text-sm">Add New Bird</span>
              </motion.div>
            </div>
          </section>
        )}

        {activeTab === "Couples" && (
          <section>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black font-display text-white">Breeding Couples</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
              {couples.map((couple) => {
                const male = birds.find(b => b.id === couple.maleId);
                const female = birds.find(b => b.id === couple.femaleId);
                const coupleEggs = eggs.filter(e => e.coupleId === couple.id && e.status !== 'Completed' && e.status !== 'Failed' && e.status !== 'Broken' && e.status !== 'DeadInShell');
                
                return (
                  <motion.div
                    key={couple.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 relative group"
                  >
                    <button 
                      onClick={() => openCoupleModal(couple)}
                      className="absolute top-8 right-24 p-2 bg-slate-50 text-slate-400 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:text-primary hover:bg-primary/5"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteCouple(couple.id)}
                      className="absolute top-8 right-8 p-2 bg-slate-50 text-slate-400 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:text-red-500 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                      <div className="flex items-center gap-4">
                        <div className="flex -space-x-4 shrink-0">
                          <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-male flex items-center justify-center border-4 border-white shadow-md rotate-[-6deg] hover:rotate-0 transition-transform overflow-hidden">
                            {male?.imageUrl ? (
                              <img src={male.imageUrl} alt={male.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <img src={DEFAULT_BIRD_IMAGE} alt="Default Male" className="w-full h-full object-cover opacity-60 grayscale-[0.5]" referrerPolicy="no-referrer" />
                            )}
                          </div>
                          <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-female flex items-center justify-center border-4 border-white shadow-md rotate-[6deg] hover:rotate-0 transition-transform overflow-hidden">
                            {female?.imageUrl ? (
                              <img src={female.imageUrl} alt={female.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <img src={DEFAULT_BIRD_IMAGE} alt="Default Female" className="w-full h-full object-cover opacity-60 grayscale-[0.5]" referrerPolicy="no-referrer" />
                            )}
                          </div>
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold font-display text-lg md:text-xl text-slate-800 truncate">
                            {male ? `${male.name}` : 'N/A'} 
                            <span className="text-slate-300 mx-1 md:mx-2">×</span> 
                            {female ? `${female.name}` : 'N/A'}
                          </h4>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <p className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest">Started {couple.startDate}</p>
                          </div>
                        </div>
                      </div>
                      <div className={`self-start md:self-center px-3 md:px-4 py-1.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest ${
                        couple.status === 'Active' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-slate-50 text-slate-500 border border-slate-100'
                      }`}>
                        {couple.status}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                      <div className="p-4 md:p-5 rounded-[24px] md:rounded-[32px] bg-slate-50 border border-slate-100/50 hover:bg-white hover:border-primary/20 transition-all group/male flex gap-3 md:gap-4">
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-male/20 shrink-0 overflow-hidden border-2 border-white shadow-sm">
                          {male?.imageUrl ? (
                            <img src={male.imageUrl} alt={male.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <img src={DEFAULT_BIRD_IMAGE} alt="Default Male" className="w-full h-full object-cover opacity-60 grayscale-[0.5]" referrerPolicy="no-referrer" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">Male (الذكر)</span>
                          </div>
                          <div className="space-y-1 md:space-y-2">
                            <span className="font-bold text-slate-800 block text-xs md:text-sm truncate">{male?.name} <span className="text-slate-400 font-medium">#{male?.ring}</span></span>
                            <div className="flex flex-wrap gap-1">
                              <span className="text-[7px] bg-white px-1.5 py-0.5 rounded-lg text-slate-500 font-bold border border-slate-100">{calculateDetailedAge(male?.birthYear || '')}</span>
                              <span className="text-[7px] bg-white px-1.5 py-0.5 rounded-lg text-slate-500 font-bold border border-slate-100 truncate max-w-[60px]">{male?.mutation || 'Normal'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 md:p-5 rounded-[24px] md:rounded-[32px] bg-slate-50 border border-slate-100/50 hover:bg-white hover:border-primary/20 transition-all group/female flex gap-3 md:gap-4">
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-female/20 shrink-0 overflow-hidden border-2 border-white shadow-sm">
                          {female?.imageUrl ? (
                            <img src={female.imageUrl} alt={female.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Bird className="w-6 h-6 md:w-8 md:h-8 text-female-text opacity-40" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">Female (الأنثى)</span>
                          </div>
                          <div className="space-y-1 md:space-y-2">
                            <span className="font-bold text-slate-800 block text-xs md:text-sm truncate">{female?.name} <span className="text-slate-400 font-medium">#{female?.ring}</span></span>
                            <div className="flex flex-wrap gap-1">
                              <span className="text-[7px] bg-white px-1.5 py-0.5 rounded-lg text-slate-500 font-bold border border-slate-100">{calculateDetailedAge(female?.birthYear || '')}</span>
                              <span className="text-[7px] bg-white px-1.5 py-0.5 rounded-lg text-slate-500 font-bold border border-slate-100 truncate max-w-[60px]">{female?.mutation || 'Normal'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <EggIcon className="w-5 h-5 text-accent-orange" />
                          <span className="font-bold text-slate-800">{coupleEggs.length} Eggs</span>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              setSelectedCoupleForStats(couple);
                              setAiBreedingReport(null);
                              setIsStatsModalOpen(true);
                            }}
                            className="flex items-center gap-2 px-3 py-2 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-100 transition-colors group/stat"
                            title="Statistique (الإحصائيات)"
                          >
                            <TrendingUp className="w-4 h-4 group-hover/stat:scale-110 transition-transform" />
                            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Statistique</span>
                          </button>
                          {male && (
                            <button 
                              onClick={() => {
                                setPedigreeBirdId(male.id);
                                setIsPedigreeModalOpen(true);
                              }}
                              className="p-2 bg-blue-50 text-blue-500 rounded-xl hover:bg-blue-100 transition-colors"
                              title="Male Pedigree"
                            >
                              <GitBranch className="w-4 h-4" />
                            </button>
                          )}
                          {female && (
                            <button 
                              onClick={() => {
                                setPedigreeBirdId(female.id);
                                setIsPedigreeModalOpen(true);
                              }}
                              className="p-2 bg-pink-50 text-pink-500 rounded-xl hover:bg-pink-100 transition-colors"
                              title="Female Pedigree"
                            >
                              <GitBranch className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button 
                          onClick={() => {
                            const coupleEggs = eggs.filter(e => e.coupleId === couple.id);
                            const hatchCount = coupleEggs.filter(e => e.status === 'Completed' || e.status === 'Hatched').length;
                            const rate = coupleEggs.length > 0 ? Math.round((hatchCount / coupleEggs.length) * 100) : 0;
                            addNotification(`Stats: ${male?.name} × ${female?.name}`, `Eggs: ${coupleEggs.length} | Hatched: ${hatchCount} | Success Rate: ${rate}%`, 'info');
                            setIsNotificationsOpen(true);
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl font-bold text-xs hover:bg-primary/20 transition-colors"
                        >
                          <BarChart className="w-4 h-4" /> Statistique
                        </button>
                        <button 
                          onClick={() => openEggModal(couple.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-accent-orange/10 text-accent-orange rounded-xl font-bold text-xs hover:bg-accent-orange/20 transition-colors"
                        >
                          <Plus className="w-4 h-4" /> Add Egg
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              {couples.length === 0 && (
                <div className="col-span-2 glass p-20 rounded-[40px] text-center border-white/20">
                  <Heart className="w-12 h-12 text-accent-gold/40 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium mb-6">No couples yet. Go to "My Birds" to create one.</p>
                  <button 
                    onClick={() => setIsCoupleModalOpen(true)}
                    className="bg-accent-gold text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-accent-gold/20 flex items-center gap-2 mx-auto"
                  >
                    <Plus className="w-4 h-4" /> Create Your First Couple
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {activeTab === "Eggs" && (
          <section>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-2xl md:text-3xl font-black font-display text-white">Egg Tracking</h3>
                <p className="text-slate-400 text-[10px] md:text-sm font-bold uppercase tracking-widest mt-1">Monitor your aviary's productivity in real-time</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Search Egg ID or Couple..." 
                    value={searchEgg}
                    onChange={(e) => setSearchEgg(e.target.value)}
                    className="w-full sm:w-80 bg-slate-800/30 border border-white/5 rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-4 text-white text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-slate-500 font-bold"
                  />
                  <Search className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 w-3.5 h-3.5 md:w-4 md:h-4 text-slate-500" />
                </div>
                <select 
                  value={filterEggStatus}
                  onChange={(e) => setFilterEggStatus(e.target.value as any)}
                  className="bg-slate-800/30 border border-white/5 rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-4 text-white text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold"
                >
                  <option value="All">All Status (الكل)</option>
                  <option value="Unchecked">Unchecked (غير محدد)</option>
                  <option value="Fertile">Fertile (مخصب)</option>
                  <option value="Clear">Clear (غير مخصب)</option>
                  <option value="Hatched">Hatched (تم فقصه)</option>
                  <option value="Failed">Failed (لم يتم فقصه)</option>
                  <option value="Broken">Broken (مكسور)</option>
                </select>
                <select 
                  value={filterEggCouple}
                  onChange={(e) => setFilterEggCouple(e.target.value)}
                  className="bg-slate-800/30 border border-white/5 rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-4 text-white text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold"
                >
                  <option value="All">All Couples (كل الكوبل)</option>
                  {couples.map(c => {
                    const male = birds.find(b => b.id === c.maleId);
                    const female = birds.find(b => b.id === c.femaleId);
                    return (
                      <option key={c.id} value={c.id}>
                        {male?.name || 'Male'} × {female?.name || 'Female'}
                      </option>
                    );
                  })}
                </select>
                <button 
                  onClick={() => openEggModal()}
                  className="bg-primary text-white px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-xs md:text-sm shadow-xl shadow-primary/20 flex items-center justify-center gap-2 hover:scale-105 transition-all"
                >
                  <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" /> Add Egg
                </button>
              </div>
            </div>

            <div className="space-y-12">
              {couples
                .filter(c => filterEggCouple === "All" || c.id === filterEggCouple)
                .map((couple) => {
                const male = birds.find(b => b.id === couple.maleId);
                const female = birds.find(b => b.id === couple.femaleId);
                const coupleEggs = eggs.filter(e => e.coupleId === couple.id && e.status !== 'Completed' && e.status !== 'Failed' && e.status !== 'Broken' && e.status !== 'DeadInShell')
                  .filter(e => {
                    let statusMatch = true;
                    if (filterEggStatus === "All") {
                      statusMatch = true;
                    } else if (filterEggStatus === "Unchecked") {
                      statusMatch = e.isFertile === undefined && e.status === 'Intact';
                    } else if (filterEggStatus === "Fertile") {
                      statusMatch = e.isFertile === true;
                    } else if (filterEggStatus === "Clear") {
                      statusMatch = e.isFertile === false;
                    } else if (filterEggStatus === "Hatched") {
                      statusMatch = e.status === 'Hatched' || e.status === 'Completed';
                    } else {
                      statusMatch = e.status === filterEggStatus;
                    }

                    const searchLower = searchEgg.toLowerCase();
                    const searchMatch = 
                      e.eggNumber?.toLowerCase().includes(searchLower) || 
                      e.id.toLowerCase().includes(searchLower) ||
                      male?.name.toLowerCase().includes(searchLower) ||
                      female?.name.toLowerCase().includes(searchLower);
                    return statusMatch && searchMatch;
                  });

                // Sorting: Pending eggs first (isFertile undefined and Intact status)
                const sortedEggs = [...coupleEggs].sort((a, b) => {
                  const aPending = a.isFertile === undefined && a.status === 'Intact';
                  const bPending = b.isFertile === undefined && b.status === 'Intact';
                  if (aPending && !bPending) return -1;
                  if (!aPending && bPending) return 1;
                  return 0;
                });

                if (coupleEggs.length === 0 && (searchEgg !== "" || filterEggStatus !== "All")) return null;
                if (coupleEggs.length === 0) return null;

                return (
                  <div key={couple.id} className="bg-slate-900/40 p-4 md:p-10 rounded-3xl md:rounded-[48px] border border-white/5 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 transition-colors group-hover:bg-primary/10" />
                     
                     <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6 relative z-10">
                        <div className="flex items-center gap-4 md:gap-6">
                           <div className="flex -space-x-3 md:-space-x-4">
                              <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-male overflow-hidden border-4 border-slate-900 shadow-xl rotate-[-8deg] group-hover:rotate-0 transition-transform">
                                 <img src={male?.imageUrl || DEFAULT_BIRD_IMAGE} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              </div>
                              <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-female overflow-hidden border-4 border-slate-900 shadow-xl rotate-[8deg] group-hover:rotate-0 transition-transform">
                                 <img src={female?.imageUrl || DEFAULT_BIRD_IMAGE} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              </div>
                           </div>
                           <div className="min-w-0">
                              <h4 className="text-xl md:text-2xl font-black text-white truncate">{male?.name || 'Pair'} × {female?.name || ''}</h4>
                              <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{coupleEggs.length} Eggs Total • {coupleEggs.filter(e => e.isFertile).length} Fertile</p>
                           </div>
                        </div>
                        <button 
                           onClick={() => openEggModal(couple.id)} 
                           className="w-full md:w-auto px-6 py-4 md:py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-white/5"
                        >
                           <Plus className="w-4 h-4" /> New Egg
                        </button>
                     </div>

                     <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-8">
                        {sortedEggs.map(egg => (
                           <EggCard 
                              key={egg.id}
                              egg={egg}
                              male={male}
                              female={female}
                              onEdit={openEggModal}
                              onDelete={handleDeleteEgg}
                              onFertilityCheck={handleFertilityCheck}
                              onHatchSuccess={handleHatchSuccess}
                              onHatchFailure={handleHatchFailure}
                           />
                        ))}
                     </div>
                  </div>
                )
              })}
              {(eggs.length === 0 || couples.length === 0) && (
                <div className="text-center py-20 bg-slate-800/20 rounded-[48px] border border-white/5">
                  <EggIcon className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                  <p className="text-slate-500 font-bold">No eggs tracking for your couples yet.</p>
                </div>
              )}
            </div>
          </section>
        )}

        {activeTab === "AI Genetics" && (
          <section className="max-w-5xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-black font-display text-white italic tracking-tighter">AI Genetics Predictor</h3>
                <p className="text-xs text-slate-400 font-black uppercase tracking-widest">Predict offspring mutations using advanced AI</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Selection Panel */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white p-8 rounded-[40px] shadow-2xl space-y-6">
                  <div className="space-y-4">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Select Male Bird</label>
                    <select 
                      value={geneticsMaleId}
                      onChange={(e) => setGeneticsMaleId(e.target.value)}
                      className="w-full px-5 py-4 rounded-2xl bg-white border border-slate-100 focus:border-primary outline-none transition-all font-medium appearance-none"
                    >
                      <option value="">Choose a male...</option>
                      {birds.filter(b => b.gender === 'Male').map(b => (
                        <option key={b.id} value={b.id}>{b.ring} - {b.mutation || 'Normal'} ({b.species})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Select Female Bird</label>
                    <select 
                      value={geneticsFemaleId}
                      onChange={(e) => setGeneticsFemaleId(e.target.value)}
                      className="w-full px-5 py-4 rounded-2xl bg-white border border-slate-100 focus:border-primary outline-none transition-all font-medium appearance-none"
                    >
                      <option value="">Choose a female...</option>
                      {birds.filter(b => b.gender === 'Female').map(b => (
                        <option key={b.id} value={b.id}>{b.ring} - {b.mutation || 'Normal'} ({b.species})</option>
                      ))}
                    </select>
                  </div>

                  <button 
                    onClick={handlePredictGenetics}
                    disabled={isGeneticsLoading}
                    className="w-full py-5 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isGeneticsLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Predicting...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Predict Offspring
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Results Panel */}
              <div className="lg:col-span-2">
                <AnimatePresence mode="wait">
                  {isGeneticsLoading ? (
                    <motion.div 
                      key="loading"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="glass p-20 rounded-[40px] border-white/20 text-center"
                    >
                      <div className="relative w-20 h-20 mx-auto mb-8">
                        <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                        <div className="relative w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                          <BrainCircuit className="w-10 h-10 animate-pulse" />
                        </div>
                      </div>
                      <h4 className="text-xl font-bold mb-2 text-slate-900">Analyzing Genetics...</h4>
                      <p className="text-slate-500">Our AI is calculating possible mutation combinations based on Mendelian inheritance and species-specific traits.</p>
                    </motion.div>
                  ) : geneticsResult ? (
                    <motion.div 
                      key="result"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      <div className="bg-white p-8 rounded-[40px] shadow-2xl">
                        <div className="flex items-center justify-between mb-8">
                          <h4 className="text-xl font-black font-display text-slate-900">Possible Offspring</h4>
                          <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Difficulty</span>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map(star => (
                                <div key={star} className={`w-2 h-2 rounded-full ${star <= geneticsResult.difficulty ? 'bg-accent-gold' : 'bg-slate-200'}`} />
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {geneticsResult.possibleMutations.map((mut: any, idx: number) => (
                            <motion.div 
                              key={idx}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.1 }}
                              className="p-6 bg-white rounded-3xl border border-slate-100 hover:border-primary/20 transition-all group overflow-hidden relative"
                            >
                              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
                              <div className="flex items-center gap-4 relative z-10">
                                <div className="w-16 h-16 rounded-2xl bg-slate-100 shrink-0 overflow-hidden border-2 border-white shadow-sm">
                                  <img 
                                    src={`https://picsum.photos/seed/${mut.thumbnailKeyword || mut.name}/200/200`} 
                                    alt={mut.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-[8px] font-black uppercase tracking-widest rounded-md">
                                      {mut.probability}
                                    </span>
                                  </div>
                                  <h5 className="font-bold text-slate-800 text-sm truncate">{mut.name}</h5>
                                  <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">{mut.description}</p>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>

                        <div className="mt-8 p-6 bg-accent-gold/5 rounded-3xl border border-accent-gold/10">
                          <div className="flex items-center gap-3 mb-3">
                            <Sparkles className="w-5 h-5 text-accent-gold" />
                            <span className="text-xs font-black text-accent-gold uppercase tracking-[0.2em]">Expert Advice</span>
                          </div>
                          <p className="text-sm text-slate-700 font-medium leading-relaxed italic">
                            "{geneticsResult.advice}"
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="glass p-20 rounded-[40px] border-white/20 text-center"
                    >
                      <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Dna className="w-10 h-10" />
                      </div>
                      <h4 className="text-xl font-bold text-slate-800 mb-2">Ready to Predict</h4>
                      <p className="text-slate-500 max-w-md mx-auto">Select a male and female bird from your aviary to see the potential genetic outcomes of their offspring.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </section>
        )}

        {activeTab === "Pedigree Tree" && (
          <section className="max-w-6xl mx-auto">
            <div className="flex items-center gap-4 mb-12">
              <div className="w-16 h-16 rounded-[24px] bg-accent-gold/10 text-accent-gold flex items-center justify-center shadow-xl shadow-accent-gold/5">
                <GitBranch className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-3xl font-black font-display text-white">Pedigree Explorer</h3>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Visualize and trace the lineage of your birds</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {birds.map(bird => (
                <motion.div 
                  key={bird.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => {
                    setPedigreeBirdId(bird.id);
                    setIsPedigreeModalOpen(true);
                  }}
                  className="bg-white p-6 rounded-[32px] shadow-2xl hover:border-accent-gold/30 transition-all cursor-pointer group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-accent-gold/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
                  <div className="flex items-center gap-4 relative z-10">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${bird.gender === 'Male' ? 'bg-male/20 text-male-text' : 'bg-female/20 text-female-text'}`}>
                      <Bird className="w-7 h-7" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-800 truncate">{bird.name}</h4>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">#{bird.ring}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-accent-gold/10 text-accent-gold flex items-center justify-center group-hover:bg-accent-gold group-hover:text-white transition-all">
                      <GitBranch className="w-5 h-5" />
                    </div>
                  </div>
                </motion.div>
              ))}
              {birds.length === 0 && (
                <div className="col-span-full glass p-20 rounded-[40px] text-center border-white/20">
                  <GitBranch className="w-12 h-12 text-accent-gold/40 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">No birds found to display pedigree.</p>
                </div>
              )}
            </div>
          </section>
        )}

        {activeTab === "Advice" && (
          <section className="max-w-5xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-black font-display text-white">Breeding Advice</h3>
                <p className="text-xs text-slate-400 font-black uppercase tracking-widest">Expert tips for a successful aviary</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {ADVICE_ARTICLES.map((item, i) => (
                <div 
                  key={i} 
                  onClick={() => navigateToTab(`Advice/${item.id}`)}
                  className="bg-white p-8 rounded-[32px] shadow-2xl hover:shadow-xl transition-all cursor-pointer group"
                >
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{item.icon}</div>
                  <h4 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{item.title}</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === "News" && (
          <section className="max-w-5xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <Newspaper className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-black font-display text-white">Aviary News</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Latest updates from the bird breeding world</p>
              </div>
            </div>
            <div className="space-y-6">
              {[
                { date: "April 5, 2026", title: "New Mutation Discovered", desc: "A rare blue-winged mutation has been reported in the local canary community." },
                { date: "March 28, 2026", title: "Spring Breeding Expo", desc: "Join us next month for the annual expo showcasing the best breeding pairs." },
                { date: "March 15, 2026", title: "App Update v2.1", desc: "We've launched the AI Genetics predictor to help you plan your nests better." }
              ].map((news, i) => (
                <div key={i} className="bg-white p-8 rounded-[32px] shadow-2xl flex gap-6 items-start">
                  <div className="bg-primary/10 text-primary px-4 py-2 rounded-xl font-bold text-xs whitespace-nowrap">{news.date}</div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">{news.title}</h4>
                    <p className="text-slate-500 text-sm">{news.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === "About Us" && (
          <section className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <div className="w-24 h-24 bg-primary/10 text-primary rounded-[32px] flex items-center justify-center mx-auto mb-8">
                <Info className="w-12 h-12" />
              </div>
              <h3 className="text-4xl font-black font-display text-slate-800 mb-4">About PetsBird</h3>
              <p className="text-xs font-black text-primary uppercase tracking-[0.3em]">A passion for aviculture, powered by technology</p>
            </div>

            <div className="space-y-12">
              <div className="glass p-10 rounded-[40px] border-white/20">
                <p className="text-lg text-slate-600 leading-relaxed font-medium">
                  Founded in 2024, PetsBird was born from a simple idea: that technology should empower breeders, not complicate their lives. We bridge the gap between traditional bird breeding and modern digital management, providing tools and insights that make a real difference in the aviary.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass p-8 rounded-[40px] border-white/20 space-y-4">
                  <h4 className="text-xl font-bold text-slate-800 uppercase tracking-tight">Why PetsBird is Different?</h4>
                  <p className="text-slate-500 leading-relaxed text-sm">
                    Unlike generic advice websites, PetsBird is built on real-world experience. We operate a professional 70-square-meter breeding facility where we test every technique, diet, and supplement we recommend.
                  </p>
                  <p className="text-slate-500 leading-relaxed text-sm">
                    Our content is rooted in practical success—from managing complex genetic mutations to achieving high-productivity cycles, such as our recent milestone of successfully raising 10 healthy chicks in a single month.
                  </p>
                </div>
                <div className="glass p-8 rounded-[40px] border-white/20 space-y-4">
                  <h4 className="text-xl font-bold text-slate-800 uppercase tracking-tight">Our Vision</h4>
                  <p className="text-slate-500 leading-relaxed text-sm">
                    To create a world where every breeder, from hobbyists to professionals, has access to professional-grade management tools and scientifically backed avian knowledge.
                  </p>
                  <div className="pt-4 grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-xl font-bold text-primary">10k+</div>
                      <div className="text-[8px] font-bold text-slate-400 uppercase">Breeders</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-primary">50k+</div>
                      <div className="text-[8px] font-bold text-slate-400 uppercase">Birds</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-primary">100k+</div>
                      <div className="text-[8px] font-bold text-slate-400 uppercase">Eggs</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { title: "Integrity", desc: "We only share advice that has been tried and tested in our own breeding rooms." },
                  { title: "Innovation", desc: "We continuously develop digital solutions to simplify tracking and breeding." },
                  { title: "Bird Welfare", desc: "We place the health and well-being of every bird at the core of everything we do." }
                ].map((v, i) => (
                  <div key={i} className="glass p-6 rounded-3xl border-white/10 hover:bg-white/5 transition-colors">
                    <h5 className="text-sm font-black text-slate-900 mb-2 uppercase tracking-widest">{v.title}</h5>
                    <p className="text-xs text-slate-500 leading-relaxed">{v.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {activeTab === "Contact Us" && (
          <section className="max-w-lg mx-auto">
            <div className="glass p-10 rounded-[40px] border-white/20">
              <div className="text-center mb-10">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Mail className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold font-display text-slate-800">Get in Touch</h3>
                <p className="text-sm text-slate-500">We'd love to hear from you</p>
              </div>
              <form className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Message</label>
                  <textarea 
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-primary outline-none transition-all font-medium h-32"
                    placeholder="How can we help you?"
                  ></textarea>
                </div>
                <button className="w-full py-5 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
                  Send Message
                </button>
              </form>
            </div>
          </section>
        )}

        {activeTab === "Settings" && (
          <section className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-12">
              <div className="w-16 h-16 rounded-[24px] bg-slate-100 text-slate-600 flex items-center justify-center">
                <Settings className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-3xl font-black font-display text-slate-900">Settings</h3>
                <p className="text-slate-500 font-medium">Manage your account and data</p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="glass p-10 rounded-[40px] border-white/20">
                <h4 className="text-xl font-bold mb-6">Data & Privacy</h4>
                <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <div>
                    <h5 className="font-bold text-slate-800">Export All Data</h5>
                    <p className="text-sm text-slate-500">Download a backup of all your birds, couples, and eggs in JSON format.</p>
                  </div>
                  <button 
                    onClick={downloadUserData}
                    className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:border-primary hover:text-primary transition-all shadow-sm flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download JSON
                  </button>
                </div>
              </div>

              <div className="glass p-10 rounded-[40px] border-white/20">
                <h4 className="text-xl font-bold mb-6">Account Information</h4>
                <div className="space-y-4">
                  <div className="flex justify-between py-4 border-b border-slate-100">
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Email</span>
                    <span className="font-medium text-slate-700">{user?.email}</span>
                  </div>
                  <div className="flex justify-between py-4 border-b border-slate-100">
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">User ID</span>
                    <span className="font-mono text-xs text-slate-400">{user?.uid}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === "Marketplace" && (
          <div className="glass p-20 rounded-[40px] text-center border-white/20">
            <div className="w-20 h-20 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold font-display mb-2">Marketplace Page</h3>
            <p className="text-slate-500">This section is currently under development.</p>
          </div>
        )}
      </main>

      {/* Add Bird Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-sidebar/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between shrink-0">
                <h3 className="text-2xl font-bold font-display">{editingBirdId ? 'Edit Bird' : 'Add New Bird'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>
              <div className="overflow-y-auto flex-1 p-8 pt-4">
                <form onSubmit={editingBirdId ? handleUpdateBird : handleAddBird} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Bird Name (اسم الطائر)</label>
                    <input 
                      required
                      type="text" 
                      value={newBird.name}
                      onChange={(e) => setNewBird({...newBird, name: e.target.value})}
                      placeholder="e.g. Sky"
                      className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-primary outline-none transition-all font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ring Number (رقم الخاتم)</label>
                    <input 
                      required
                      type="text" 
                      value={newBird.ring}
                      onChange={(e) => setNewBird({...newBird, ring: e.target.value})}
                      placeholder="e.g. 656"
                      className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Species (النوع)</label>
                    <select 
                      required
                      value={newBird.species}
                      onChange={(e) => setNewBird({...newBird, species: e.target.value})}
                      className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-primary outline-none transition-all font-medium appearance-none"
                    >
                      {SPECIES_LIST.map(s => (
                        <option key={s.name} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Gender (الجنس)</label>
                    <select 
                      value={newBird.gender}
                      onChange={(e) => setNewBird({...newBird, gender: e.target.value as any})}
                      className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-primary outline-none transition-all font-medium appearance-none"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Unknown">Unknown (لا أعلم)</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Birth Date (تاريخ الميلاد)</label>
                    <input 
                      type="date" 
                      value={newBird.birthYear}
                      onChange={(e) => setNewBird({...newBird, birthYear: e.target.value})}
                      className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-primary outline-none transition-all font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cage Number (رقم القفص)</label>
                    <input 
                      type="text" 
                      value={newBird.cage}
                      onChange={(e) => setNewBird({...newBird, cage: e.target.value})}
                      className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-primary outline-none transition-all font-medium"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Mutation (الطفرة)</label>
                    <select 
                      value={newBird.mutation}
                      onChange={(e) => setNewBird({...newBird, mutation: e.target.value})}
                      className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-primary outline-none transition-all font-medium appearance-none"
                    >
                      <option value="">Normal (عادي)</option>
                      {SPECIES_LIST.find(s => s.name === newBird.species)?.mutations?.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                      <option value="Other">Other (أخرى)</option>
                    </select>
                  </div>
                  {newBird.mutation === "Other" && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Specify Mutation (حدد الطفرة)</label>
                      <input 
                        type="text" 
                        onChange={(e) => setNewBird({...newBird, mutation: e.target.value})}
                        placeholder="e.g. Rare Mutation"
                        className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-primary outline-none transition-all font-medium"
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Status (الحالة)</label>
                    <select 
                      value={newBird.status}
                      onChange={(e) => setNewBird({...newBird, status: e.target.value})}
                      className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-primary outline-none transition-all font-medium appearance-none"
                    >
                      <option value="Ready">🟢 Ready (For breeding)</option>
                      <option value="Resting">🔵 Resting (Non-breeding)</option>
                      <option value="Paired">🟠 Paired (Linked)</option>
                      <option value="Chick">🐣 Chick</option>
                      <option value="Sold">🔴 Sold (تم بيعه)</option>
                      <option value="Deceased">💀 Deceased (مات)</option>
                    </select>
                  </div>
                  {newBird.status === 'Sold' && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sale Price (سعر البيع)</label>
                      <input 
                        type="text" 
                        value={newBird.salePrice}
                        onChange={(e) => setNewBird({...newBird, salePrice: e.target.value})}
                        placeholder="e.g. 100$"
                        className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-primary outline-none transition-all font-medium"
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Date Added</label>
                    <input 
                      type="text" 
                      value={newBird.date}
                      onChange={(e) => setNewBird({...newBird, date: e.target.value})}
                      className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-primary outline-none transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Bird Image (صورة الطائر)</label>
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden relative group">
                      {selectedFile ? (
                        <img src={URL.createObjectURL(selectedFile)} alt="Preview" className="w-full h-full object-cover" />
                      ) : newBird.imageUrl ? (
                        <img 
                          src={newBird.imageUrl} 
                          alt="Current" 
                          className="w-full h-full object-cover" 
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src = "https://images.unsplash.com/photo-1522926193341-e9fed6c10841?auto=format&fit=crop&q=80&w=400";
                          }}
                        />
                      ) : (
                        <Camera className="w-8 h-8 text-slate-300" />
                      )}
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Upload className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-slate-500 mb-2">Upload a photo of your bird from your phone or computer.</p>
                      <button 
                        type="button"
                        onClick={() => document.getElementById('bird-image-input')?.click()}
                        className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all"
                      >
                        Choose Photo
                      </button>
                      <input 
                        id="bird-image-input"
                        type="file" 
                        accept="image/*"
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>

                <div className="sticky bottom-0 pt-6 pb-2 bg-white mt-4">
                  <button 
                    type="submit"
                    className="w-full py-5 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-3"
                  >
                    {isUploading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        <span>{editingBirdId ? 'Update Bird Profile' : 'Create Bird Profile'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Couple Modal */}
      <AnimatePresence>
        {isCoupleModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCoupleModalOpen(false)}
              className="absolute inset-0 bg-sidebar/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-2xl font-bold font-display">{editingCoupleId ? 'Edit Couple' : 'Create New Couple'}</h3>
                <button onClick={() => setIsCoupleModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>
              <form onSubmit={editingCoupleId ? handleUpdateCouple : handleCreateCoupleFromModal} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Male Bird</label>
                    <select 
                      required
                      value={selectedMaleId}
                      onChange={(e) => setSelectedMaleId(e.target.value)}
                      className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-primary outline-none transition-all font-medium appearance-none"
                    >
                      <option value="">Choose a male...</option>
                      {birds
                        .filter(b => b.gender === 'Male' && b.status !== 'Sold' && b.status !== 'Deceased')
                        .filter(b => !couples.some(c => c.status === 'Active' && (c.maleId === b.id || c.femaleId === b.id)))
                        .map(b => (
                          <option key={b.id} value={b.id}>{b.ring} ({b.species})</option>
                        ))}
                    </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Female Bird</label>
                    <select 
                      required
                      value={selectedFemaleId}
                      onChange={(e) => setSelectedFemaleId(e.target.value)}
                      className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-primary outline-none transition-all font-medium appearance-none"
                    >
                      <option value="">Choose a female...</option>
                      {birds
                        .filter(b => b.gender === 'Female' && b.status !== 'Sold' && b.status !== 'Deceased')
                        .filter(b => !couples.some(c => c.status === 'Active' && (c.maleId === b.id || c.femaleId === b.id)))
                        .map(b => (
                          <option key={b.id} value={b.id}>{b.ring} ({b.species})</option>
                        ))}
                    </select>
                </div>
                <button 
                  type="submit"
                  className="w-full py-5 bg-accent-gold text-white rounded-2xl font-bold shadow-lg shadow-accent-gold/20 hover:bg-accent-gold/90 transition-all mt-4"
                >
                  {editingCoupleId ? 'Update Couple Info' : 'Confirm Coupling'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Egg Modal */}
      <AnimatePresence>
        {isEggModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEggModalOpen(false)}
              className="absolute inset-0 bg-sidebar/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-2xl font-bold font-display">{editingEggId ? 'Edit Egg' : 'Add New Egg'}</h3>
                <button onClick={() => setIsEggModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>
              <form onSubmit={editingEggId ? handleUpdateEgg : (e) => { e.preventDefault(); handleAddEgg(selectedCoupleId); }} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Couple</label>
                  <select 
                    required
                    value={selectedCoupleId}
                    onChange={(e) => setSelectedCoupleId(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-primary outline-none transition-all font-medium appearance-none"
                  >
                    <option value="">Choose a couple...</option>
                    {couples.map(c => (
                      <option key={c.id} value={c.id}>Couple #{c.id} ({birds.find(b => b.id === c.maleId)?.ring} x {birds.find(b => b.id === c.femaleId)?.ring})</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Laid Date (تاريخ البيضة)</label>
                    <input 
                      type="date" 
                      value={newEgg.laidDate}
                      onChange={(e) => setNewEgg({...newEgg, laidDate: e.target.value})}
                      className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-primary outline-none transition-all font-medium"
                    />
                    <p className="text-[10px] text-slate-400 font-medium">Hatch date will be calculated automatically based on species.</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Status</label>
                  <select 
                    value={newEgg.status}
                    onChange={(e) => setNewEgg({...newEgg, status: e.target.value as any})}
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-primary outline-none transition-all font-medium appearance-none"
                  >
                    <option value="Intact">Intact</option>
                    <option value="Hatched">Hatched</option>
                    <option value="Broken">Broken</option>
                    <option value="Completed">Completed (Hatched)</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>
                <button 
                  type="submit"
                  disabled={!selectedCoupleId}
                  className="w-full py-5 bg-accent-orange text-white rounded-2xl font-bold shadow-lg shadow-accent-orange/20 hover:bg-accent-orange/90 transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingEggId ? 'Update Egg Info' : 'Confirm Egg Laying'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Statistics Modal */}
      <AnimatePresence>
        {isStatsModalOpen && selectedCoupleForStats && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsStatsModalOpen(false)}
              className="absolute inset-0 bg-sidebar/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-primary/5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold font-display">{t.statistics}</h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {birds.find(b => b.id === selectedCoupleForStats.maleId)?.name} x {birds.find(b => b.id === selectedCoupleForStats.femaleId)?.name}
                    </p>
                  </div>
                </div>
                <button onClick={() => setIsStatsModalOpen(false)} className="p-2 hover:bg-white rounded-xl transition-colors shadow-sm">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>
              
              <div className="p-8 overflow-y-auto max-h-[70vh]">
                {(() => {
                  const coupleEggs = eggs.filter(e => e.coupleId === selectedCoupleForStats.id);
                  const totalEggs = coupleEggs.length;
                  const hatchedEggs = eggs.filter(e => e.coupleId === selectedCoupleForStats.id && (e.status === 'Hatched' || e.status === 'Completed')).length;
                  const failedEggs = eggs.filter(e => e.coupleId === selectedCoupleForStats.id && (e.status === 'Failed' || e.status === 'Broken')).length;
                  const survivedChicks = birds.filter(b => b.fatherId === selectedCoupleForStats.maleId && b.motherId === selectedCoupleForStats.femaleId).length;
                  
                  // Calculate rounds
                  const sortedEggs = [...coupleEggs].sort((a, b) => new Date(a.laidDate).getTime() - new Date(b.laidDate).getTime());
                  let rounds = 0;
                  if (sortedEggs.length > 0) {
                    rounds = 1;
                    for (let i = 1; i < sortedEggs.length; i++) {
                      const diff = (new Date(sortedEggs[i].laidDate).getTime() - new Date(sortedEggs[i - 1].laidDate).getTime()) / (1000 * 3600 * 24);
                      if (diff > 45) rounds++;
                    }
                  }

                  const successRate = totalEggs > 0 ? Math.round((survivedChicks / totalEggs) * 100) : 0;
                  const hatchRate = totalEggs > 0 ? Math.round((hatchedEggs / totalEggs) * 100) : 0;

                  const chartData = [
                    { name: 'Hatched', value: hatchedEggs, color: '#10B981' },
                    { name: 'Failed', value: failedEggs, color: '#EF4444' },
                    { name: 'Intact', value: totalEggs - hatchedEggs - failedEggs, color: '#F59E0B' }
                  ].filter(d => d.value > 0);

                  return (
                    <div className="space-y-8">
                      {/* Key Stats Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100 flex flex-col gap-1 text-center">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.breedingRounds}</span>
                          <span className="text-2xl font-black text-slate-900">{rounds}</span>
                        </div>
                        <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100 flex flex-col gap-1 text-center">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.totalEggs}</span>
                          <span className="text-2xl font-black text-slate-900">{totalEggs}</span>
                        </div>
                        <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100 flex flex-col gap-1 text-center">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.successRate}</span>
                          <span className="text-2xl font-black text-primary">{successRate}%</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        {/* Circular Success Indicator */}
                        <div className="flex flex-col items-center justify-center p-8 bg-slate-900 rounded-[40px] text-white">
                          <div className="relative w-32 h-32 mb-4">
                            <svg className="w-full h-full transform -rotate-90">
                              <circle
                                cx="64"
                                cy="64"
                                r="58"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="transparent"
                                className="text-slate-800"
                              />
                              <motion.circle
                                initial={{ strokeDashoffset: 364 }}
                                animate={{ strokeDashoffset: 364 - (364 * successRate) / 100 }}
                                cx="64"
                                cy="64"
                                r="58"
                                stroke="currentColor"
                                strokeWidth="8"
                                strokeDasharray="364"
                                fill="transparent"
                                className="text-primary"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-3xl font-black">{successRate}%</span>
                            </div>
                          </div>
                          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Survival Success</span>
                        </div>

                        {/* List Detail */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 rounded-2xl bg-green-50/50 border border-green-100">
                             <div className="flex items-center gap-3">
                               <div className="w-8 h-8 bg-green-500 text-white rounded-lg flex items-center justify-center">
                                 <Check className="w-4 h-4" />
                               </div>
                               <span className="font-bold text-slate-800">{t.successHatch}</span>
                             </div>
                             <span className="text-lg font-black text-green-600">{hatchedEggs}</span>
                          </div>
                          <div className="flex items-center justify-between p-4 rounded-2xl bg-red-50/50 border border-red-100">
                             <div className="flex items-center gap-3">
                               <div className="w-8 h-8 bg-red-500 text-white rounded-lg flex items-center justify-center">
                                 <X className="w-4 h-4" />
                               </div>
                               <span className="font-bold text-slate-800">{t.failedEggs}</span>
                             </div>
                             <span className="text-lg font-black text-red-600">{failedEggs}</span>
                          </div>
                          <div className="flex items-center justify-between p-4 rounded-2xl bg-blue-50/50 border border-blue-100">
                             <div className="flex items-center gap-3">
                               <div className="w-8 h-8 bg-blue-500 text-white rounded-lg flex items-center justify-center">
                                 <Bird className="w-4 h-4" />
                               </div>
                               <span className="font-bold text-slate-800">{t.survivedChicks}</span>
                             </div>
                             <span className="text-lg font-black text-blue-600">{survivedChicks}</span>
                          </div>

                          {/* AI Breeding Analysis Button */}
                          <div className="pt-4 border-t border-slate-100">
                            <button 
                              onClick={() => handleGenerateAIReport(selectedCoupleForStats, totalEggs, hatchedEggs, failedEggs, survivedChicks, rounds)}
                              disabled={isGeneratingAIReport}
                              className="w-full py-4 bg-gradient-to-r from-primary to-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                            >
                              {isGeneratingAIReport ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <BrainCircuit className="w-4 h-4" />
                              )}
                              Generate AI Expert Analysis
                            </button>
                          </div>

                          {/* AI Report Result */}
                          <AnimatePresence>
                            {aiBreedingReport && (
                              <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-6 p-6 rounded-3xl bg-slate-900 text-white space-y-6"
                              >
                                <div className="flex items-center gap-2 text-primary">
                                  <Sparkles className="w-5 h-5" />
                                  <h4 className="text-xs font-black uppercase tracking-widest">Expert Report</h4>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                    <p className="text-[10px] text-slate-400 capitalize mb-1">Productivity</p>
                                    <p className="text-2xl font-black">{aiBreedingReport.kpis.productivity_score}/10</p>
                                  </div>
                                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                    <p className="text-[10px] text-slate-400 capitalize mb-1">Hatch Rate</p>
                                    <p className="text-2xl font-black">{aiBreedingReport.kpis.hatching_rate}%</p>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <p className="text-[10px] font-black text-primary uppercase tracking-widest">Expert Insight</p>
                                  <p className="text-sm text-slate-300 leading-relaxed italic">
                                    "{aiBreedingReport.expert_insight}"
                                  </p>
                                </div>

                                <div className="space-y-3">
                                  <p className="text-[10px] font-black text-primary uppercase tracking-widest">Recommendations</p>
                                  <ul className="space-y-2">
                                    {aiBreedingReport.recommendations.map((rec: string, i: number) => (
                                      <li key={i} className="flex items-start gap-3 text-xs text-slate-400">
                                        <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 shrink-0" />
                                        {rec}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      {chartData.length > 0 && (
                        <div className="h-64 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                              >
                                {chartData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Profile Modal */}
      <AnimatePresence>
        {isProfileModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProfileModalOpen(false)}
              className="absolute inset-0 bg-sidebar/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white font-bold text-lg">
                    {userProfile.avatar}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold font-display">User Profile</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Manage your account</p>
                  </div>
                </div>
                <button onClick={() => setIsProfileModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>
              <form onSubmit={handleUpdateProfile} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
                  <input 
                    required
                    type="text" 
                    value={userProfile.name}
                    onChange={(e) => setUserProfile({...userProfile, name: e.target.value})}
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-primary outline-none transition-all font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
                  <input 
                    required
                    type="email" 
                    value={userProfile.email}
                    onChange={(e) => setUserProfile({...userProfile, email: e.target.value})}
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-primary outline-none transition-all font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Location</label>
                  <input 
                    required
                    type="text" 
                    value={userProfile.location}
                    onChange={(e) => setUserProfile({...userProfile, location: e.target.value})}
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-primary outline-none transition-all font-medium"
                  />
                </div>
                
                <div className="pt-4 flex gap-4">
                  <button 
                    type="submit"
                    className="flex-1 py-5 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                  >
                    Save Changes
                  </button>
                  <button 
                    type="button"
                    onClick={handleLogout}
                    className="px-8 py-5 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-red-50 hover:text-red-500 transition-all flex items-center gap-2"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {isInstallModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsInstallModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[32px] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <Download className="text-primary w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">Install PetsBird</h3>
                    <p className="text-sm text-slate-500 font-medium">Get the best experience on your device</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsInstallModalOpen(false)}
                  className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-8 space-y-8">
                <div className="space-y-4">
                  <h4 className="text-sm font-black uppercase tracking-widest text-slate-400">On Android / Chrome</h4>
                  <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl">
                    <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-xs font-bold text-slate-600">1</div>
                    <p className="text-sm text-slate-600 font-medium leading-relaxed">
                      Click the <span className="font-bold text-slate-900">three dots (⋮)</span> in the top right corner of your browser.
                    </p>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl">
                    <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-xs font-bold text-slate-600">2</div>
                    <p className="text-sm text-slate-600 font-medium leading-relaxed">
                      Select <span className="font-bold text-slate-900">"Install App"</span> or <span className="font-bold text-slate-900">"Add to Home Screen"</span>.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-black uppercase tracking-widest text-slate-400">On iOS (iPhone/iPad)</h4>
                  <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl">
                    <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-xs font-bold text-slate-600">1</div>
                    <p className="text-sm text-slate-600 font-medium leading-relaxed">
                      Tap the <span className="font-bold text-slate-900">Share button (⎙)</span> at the bottom of the screen.
                    </p>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl">
                    <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-xs font-bold text-slate-600">2</div>
                    <p className="text-sm text-slate-600 font-medium leading-relaxed">
                      Scroll down and tap <span className="font-bold text-slate-900">"Add to Home Screen"</span>.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-slate-50 text-center">
                <button 
                  onClick={() => setIsInstallModalOpen(false)}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-primary transition-all"
                >
                  Got it!
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Feedback Widget */}
      <div className="fixed bottom-24 right-8 z-[90]">
        <motion.button
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsFeedbackModalOpen(true)}
          className="w-14 h-14 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-2xl shadow-slate-900/40 group"
        >
          <Mail className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </motion.button>
      </div>

      {/* Feedback Modal */}
      <AnimatePresence>
        {isFeedbackModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFeedbackModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xl font-bold font-display">Send Feedback</h3>
                <button onClick={() => setIsFeedbackModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <form onSubmit={handleFeedbackSubmit} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Your Message</label>
                  <textarea 
                    required
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Report a bug or suggest a feature..."
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-primary outline-none transition-all font-medium h-40"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold shadow-lg hover:bg-primary transition-all"
                >
                  Submit Feedback
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Pedigree Modal */}
      <AnimatePresence>
        {isPedigreeModalOpen && pedigreeBirdId && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPedigreeModalOpen(false)}
              className="absolute inset-0 bg-sidebar/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-[#fcfcf9] rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white">
                <div>
                  <h3 className="text-2xl font-black font-display text-slate-900">Pedigree Tree</h3>
                  <p className="text-slate-400 text-sm font-medium">Lineage for {birds.find(b => b.id === pedigreeBirdId)?.name} ({birds.find(b => b.id === pedigreeBirdId)?.ring})</p>
                </div>
                <button onClick={() => setIsPedigreeModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>
              <div className="overflow-x-auto max-h-[70vh]">
                <PedigreeTree 
                  birdId={pedigreeBirdId} 
                  birds={birds} 
                  onBirdClick={(id) => setPedigreeBirdId(id)} 
                  onEditParent={(childId, type) => {
                    setParentEditContext({ childId, type });
                    setIsParentModalOpen(true);
                  }}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Set Parent Modal */}
      <AnimatePresence>
        {isParentModalOpen && parentEditContext && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsParentModalOpen(false)}
              className="absolute inset-0 bg-sidebar/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-sidebar/5 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black font-display text-slate-900">
                    Set {parentEditContext.type === 'father' ? 'Father' : 'Mother'}
                  </h3>
                  <p className="text-slate-400 text-xs font-medium">For bird: {birds.find(b => b.id === parentEditContext.childId)?.name}</p>
                </div>
                <button onClick={() => setIsParentModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="flex bg-slate-50 p-1 rounded-2xl">
                  <button 
                    onClick={() => setIsAddingParentManual(false)}
                    className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all ${!isAddingParentManual ? 'bg-white shadow-sm text-primary' : 'text-slate-400'}`}
                  >
                    EXISTING (موجود)
                  </button>
                  <button 
                    onClick={() => setIsAddingParentManual(true)}
                    className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all ${isAddingParentManual ? 'bg-white shadow-sm text-primary' : 'text-slate-400'}`}
                  >
                    MANUAL (غير موجود)
                  </button>
                </div>

                {!isAddingParentManual ? (
                  <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                    <button 
                      onClick={() => handleSetParent(null)}
                      className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:text-red-500 hover:border-red-200 transition-all text-xs font-bold"
                    >
                      <X className="w-4 h-4" /> Clear Parent Reference
                    </button>
                    {birds
                      .filter(b => b.id !== parentEditContext.childId && b.gender === (parentEditContext.type === 'father' ? 'Male' : 'Female'))
                      .map(b => (
                        <button 
                          key={b.id}
                          onClick={() => handleSetParent(b.id)}
                          className="w-full flex items-center gap-4 p-4 bg-slate-50 hover:bg-primary/5 border border-transparent hover:border-primary/20 rounded-2xl transition-all text-left"
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${b.gender === 'Male' ? 'bg-male/20 text-male-text' : 'bg-female/20 text-female-text'}`}>
                            <Bird className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 text-sm truncate">{b.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">#{b.ring} • {b.mutation || 'Normal'}</p>
                          </div>
                        </button>
                      ))
                    }
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2">Ancestor Name (اسم الطائر)</label>
                      <input 
                        type="text"
                        value={manualParentName}
                        onChange={(e) => setManualParentName(e.target.value)}
                        placeholder="e.g. Blue King"
                        className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-primary outline-none transition-all font-medium"
                      />
                    </div>
                    <button 
                      onClick={() => handleSetParent(null)}
                      disabled={!manualParentName.trim()}
                      className="w-full py-4 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 disabled:opacity-50 disabled:shadow-none hover:scale-[1.02] active:scale-95 transition-all"
                    >
                      Confirm Ancestor
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {hatchFailureEgg && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setHatchFailureEgg(null)}
              className="absolute inset-0 bg-sidebar/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xl font-bold font-display">Hatch Failure</h3>
                <button onClick={() => setHatchFailureEgg(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div className="space-y-4">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Reason for failure</label>
                  <div className="grid grid-cols-1 gap-3">
                    {['Infertile', 'Dead in shell', 'Broken', 'Abandoned', 'Other'].map((reason) => (
                      <button
                        key={reason}
                        onClick={() => handleHatchFailure(hatchFailureEgg, reason)}
                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-left font-bold text-slate-700 hover:border-primary hover:bg-primary/5 transition-all"
                      >
                        {reason}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation for Mobile */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} t={t} />

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmModal.isOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
              className="absolute inset-0 bg-sidebar/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="p-8 text-center">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
                  confirmModal.variant === 'success' ? 'bg-green-50 text-green-500' :
                  confirmModal.variant === 'info' ? 'bg-blue-50 text-blue-500' :
                  'bg-red-50 text-red-500'
                }`}>
                  {confirmModal.variant === 'success' ? <Check className="w-10 h-10" /> :
                   confirmModal.variant === 'info' ? <Info className="w-10 h-10" /> :
                   <X className="w-10 h-10" />}
                </div>
                <h3 className="text-2xl font-bold font-display text-slate-800 mb-2">{confirmModal.title}</h3>
                <p className="text-slate-500 font-medium mb-8">{confirmModal.message}</p>
                <div className="flex gap-4">
                  {confirmModal.variant === 'danger' && (
                    <button 
                      onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                      className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                    >
                      إلغاء
                    </button>
                  )}
                  <button 
                    onClick={confirmModal.onConfirm}
                    className={`flex-1 py-4 text-white rounded-2xl font-bold shadow-lg transition-all ${
                      confirmModal.variant === 'success' ? 'bg-green-500 shadow-green-500/20 hover:bg-green-600' :
                      confirmModal.variant === 'info' ? 'bg-blue-500 shadow-blue-500/20 hover:bg-blue-600' :
                      'bg-red-500 shadow-red-500/20 hover:bg-red-600'
                    }`}
                  >
                    {confirmModal.confirmText || (confirmModal.variant === 'danger' ? "تأكيد الحذف" : "حسناً")}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Toast Notifications */}
      <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none w-full max-w-xs px-4">
        <AnimatePresence>
          {notifications.map(n => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              className={`pointer-events-auto w-full p-4 rounded-2xl shadow-xl backdrop-blur-xl border ${
                n.type === 'success' ? 'bg-green-500/90 border-green-400 text-white' :
                n.type === 'error' ? 'bg-red-500/90 border-red-400 text-white' :
                'bg-blue-500/90 border-blue-400 text-white'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-white/20 rounded-lg shrink-0">
                    {n.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : 
                     n.type === 'error' ? <AlertTriangle className="w-4 h-4" /> : 
                     <Bell className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs uppercase tracking-wider truncate">{n.title}</h4>
                    <p className="text-xs font-medium opacity-90 truncate">{n.message}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setNotifications(prev => prev.filter(item => item.id !== n.id))}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors shrink-0"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
