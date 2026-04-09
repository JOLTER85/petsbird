/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent, MouseEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { GoogleGenAI, Type } from "@google/genai";
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  db,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification
} from './firebase';
import { User } from 'firebase/auth';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where,
  getDoc,
  getDocFromServer
} from 'firebase/firestore';
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
  Link as LinkIcon,
  Edit2,
  ShoppingBag,
  Sparkles,
  BrainCircuit,
  Loader2,
  BookOpen,
  Newspaper,
  Info,
  Mail,
  Activity,
  LogIn,
  Download,
  ArrowLeft,
  ArrowRight
} from "lucide-react";

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
  coupleId: string;
  laidDate: string;
  hatchDate?: string;
  fertilityCheckDate?: string;
  status: 'Intact' | 'Hatched' | 'Broken';
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
    name: "Diamond Dove (يمام ماسي)", 
    incubation: 13,
    mutations: ["Normal", "Silver", "White-tailed", "Brilliant", "Cinnamon", "Pied"]
  },
  { 
    name: "Java Sparrow (جاوا)", 
    incubation: 15,
    mutations: ["Normal", "White", "Silver", "Fawn", "Pied", "Opal"]
  },
];

const SidebarItem = ({ icon: Icon, label, active = false, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) => (
  <motion.div
    whileHover={{ x: 4 }}
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${
      active ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-400 hover:text-white hover:bg-white/5"
    }`}
  >
    <Icon className="w-5 h-5" />
    <span className="font-medium text-sm">{label}</span>
  </motion.div>
);

const StatCard = ({ icon: Icon, value, label, colorClass, onClick }: { icon: any, value: string | number, label: string, colorClass: string, onClick?: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={onClick ? { scale: 1.02, y: -4 } : {}}
    whileTap={onClick ? { scale: 0.98 } : {}}
    onClick={onClick}
    className={`glass p-6 rounded-3xl shadow-sm border border-white/20 flex items-center gap-5 ${onClick ? 'cursor-pointer hover:shadow-lg transition-all' : ''}`}
  >
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${colorClass}`}>
      <Icon className="w-7 h-7" />
    </div>
    <div>
      <div className="text-2xl font-bold font-display">{value}</div>
      <div className="text-slate-500 text-sm font-medium">{label}</div>
    </div>
  </motion.div>
);

const BirdCard = ({ id, name, ring, species, gender, age, birthYear, date, cage, onSelect, isSelected, onEdit, onDelete }: BirdData & { onSelect?: () => void, isSelected?: boolean, onEdit?: (e: MouseEvent) => void, onDelete?: (id: string) => void }) => (
  <motion.div
    whileHover={{ y: -8, scale: 1.02 }}
    onClick={onSelect}
    className={`bg-white p-5 rounded-[32px] shadow-sm hover:shadow-xl transition-all border group cursor-pointer relative ${isSelected ? 'border-primary ring-4 ring-primary/10' : 'border-slate-100'}`}
  >
    {onEdit && (
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onEdit(e);
        }}
        className="absolute top-4 left-4 p-2 bg-white/80 backdrop-blur-sm text-slate-400 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:text-primary hover:bg-white z-10 shadow-sm"
      >
        <Edit2 className="w-4 h-4" />
      </button>
    )}
    <div className="relative aspect-square rounded-[24px] bg-slate-50 flex items-center justify-center mb-5 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50" />
      <Bird className="w-16 h-16 text-primary/20 group-hover:scale-110 transition-transform duration-500" />
      <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
        gender === 'Female' ? 'bg-female text-female-text' : 
        gender === 'Male' ? 'bg-male text-male-text' : 
        'bg-slate-100 text-slate-500'
      }`}>
        {gender}
      </div>
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
    
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-xl font-bold font-display text-slate-800">{name}</h3>
          <span className="text-xs font-bold text-primary/40 font-display">({ring})</span>
        </div>
        <p className="text-sm text-slate-500 font-medium">{species}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-50">
        <div className="flex items-center gap-2 text-slate-400">
          <Tag className="w-3.5 h-3.5" />
          <span className="text-[11px] font-medium">No Tag</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <Clock className="w-3.5 h-3.5" />
          <span className="text-[11px] font-medium">{age} days</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <Calendar className="w-3.5 h-3.5" />
          <span className="text-[11px] font-medium">Age: {new Date().getFullYear() - parseInt(birthYear)} years</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <MapPin className="w-3.5 h-3.5" />
          <span className="text-[11px] font-medium">Cage {cage}</span>
        </div>
      </div>
    </div>
  </motion.div>
);

export default function App() {
  const [showApp, setShowApp] = useState(false);
  const [landingTab, setLandingTab] = useState("Home");

  useEffect(() => {
    const handleNavigation = () => {
      const path = window.location.pathname.replace('/', '');
      const validTabs = ["Home", "Features", "Genetics", "Advice", "About", "News", "Terms", "Privacy", "Contact", "Marketplace"];
      
      if (validTabs.includes(path)) {
        setLandingTab(path);
        window.scrollTo(0, 0);
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
      const validTabs = ["Home", "Features", "Genetics", "Advice", "About", "News", "Terms", "Privacy", "Contact", "Marketplace"];
      setLandingTab(validTabs.includes(tab) ? tab : "Home");
      window.scrollTo(0, 0);
    }
  };

  const [isDemoOpen, setIsDemoOpen] = useState(false);
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
      setUser(currentUser);
      setAuthLoading(false);
      if (currentUser) {
        const isGoogleUser = currentUser.providerData.some(p => p.providerId === 'google.com');
        if (currentUser.emailVerified || isGoogleUser) {
          // Check if user profile exists, if not create it
          const userDocRef = doc(db, "users", currentUser.uid);
          try {
            const userDoc = await getDoc(userDocRef);
            if (!userDoc.exists()) {
              await setDoc(userDocRef, {
                userId: currentUser.uid,
                name: currentUser.displayName || "مربي جديد",
                email: currentUser.email || "",
                location: "",
                avatar: currentUser.photoURL || (currentUser.displayName ? currentUser.displayName.substring(0, 2).toUpperCase() : "??")
              });
            }
          } catch (error) {
            console.error("Error checking/creating user profile:", error);
          }
          
          setShowApp(true);
          setShowAuthPage(false);
        } else {
          setShowApp(false);
          setShowAuthPage(true);
          setAuthError("يرجى تأكيد بريدك الإلكتروني لتتمكن من الدخول.");
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    setAuthError("");
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Error signing in with Google:", error);
      setAuthError(error.message || "Failed to sign in with Google");
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
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {}
  });
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

  const [notifications, setNotifications] = useState([
    { id: 1, title: "Welcome!", message: "Welcome to PetsBird.com", time: "Just now", read: false },
    { id: 2, title: "Egg Update", message: "Couple #001 laid a new egg!", time: "2 hours ago", read: false }
  ]);
  
  const [birds, setBirds] = useState<BirdData[]>([]);
  const [couples, setCouples] = useState<CoupleData[]>([]);
  const [eggs, setEggs] = useState<EggData[]>([]);

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
    alert(`خطأ في قاعدة البيانات: ${errInfo.error}\nيرجى التأكد من إعدادات Firebase وقواعد الحماية.`);
  };

  const [newBird, setNewBird] = useState({
    name: "",
    ring: "",
    species: SPECIES_LIST[0].name,
    gender: "Male" as "Male" | "Female",
    age: 0,
    birthYear: new Date().getFullYear().toString(),
    date: new Date().toLocaleDateString(),
    cage: "1",
    mutation: ""
  });

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
    const id = Date.now().toString();
    const birdData = { ...newBird, id, userId: user.uid };
    const path = `users_data/${user.uid}/birds/${id}`;
    try {
      await setDoc(doc(db, "users_data", user.uid, "birds", id), birdData);
      setIsModalOpen(false);
      setNewBird({ name: "", ring: "", species: SPECIES_LIST[0].name, gender: "Male", age: 0, birthYear: new Date().getFullYear().toString(), date: new Date().toLocaleDateString(), cage: "1", mutation: "" });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const handleUpdateBird = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingBirdId || !user) return;
    const path = `users_data/${user.uid}/birds/${editingBirdId}`;
    try {
      await updateDoc(doc(db, "users_data", user.uid, "birds", editingBirdId), { ...newBird });
      setIsModalOpen(false);
      setEditingBirdId(null);
      setNewBird({ name: "", ring: "", species: SPECIES_LIST[0].name, gender: "Male", age: 0, birthYear: new Date().getFullYear().toString(), date: new Date().toLocaleDateString(), cage: "1", mutation: "" });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const handleDeleteBird = async (id: string) => {
    if (!user) return;
    const path = `users_data/${user.uid}/birds/${id}`;
    setConfirmModal({
      isOpen: true,
      title: "حذف طائر",
      message: "هل أنت متأكد من حذف هذا الطائر؟ سيتم حذف جميع البيانات المرتبطة به.",
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
        birthYear: bird.birthYear || new Date().getFullYear().toString(),
        date: bird.date || new Date().toLocaleDateString(),
        cage: bird.cage || "1",
        mutation: bird.mutation || ""
      });
    } else {
      setEditingBirdId(null);
      setNewBird({
        name: "",
        ring: "",
        species: SPECIES_LIST[0].name,
        gender: "Male",
        age: 0,
        birthYear: new Date().getFullYear().toString(),
        date: new Date().toLocaleDateString(),
        cage: "1",
        mutation: ""
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
      alert("Please select one Male and one Female bird.");
      return;
    }

    if (bird1.species !== bird2.species) {
      alert("لا يمكن لأن النوع مختلف");
      return;
    }

    const isBird1InCouple = couples.some(c => c.status === 'Active' && (c.maleId === bird1.id || c.femaleId === bird1.id));
    const isBird2InCouple = couples.some(c => c.status === 'Active' && (c.maleId === bird2.id || c.femaleId === bird2.id));

    if (isBird1InCouple || isBird2InCouple) {
      alert("أحد الطيور أو كلاهما مضاف مسبقاً في كوبل آخر");
      return;
    }

    const male = bird1.gender === 'Male' ? bird1 : bird2;
    const female = bird1.gender === 'Female' ? bird1 : bird2;

    const id = Date.now().toString();
    const newCouple: CoupleData & { userId: string } = {
      id,
      maleId: male.id,
      femaleId: female.id,
      startDate: new Date().toLocaleDateString(),
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
      alert("لا يمكن لأن النوع مختلف");
      return;
    }

    const isMaleInCouple = couples.some(c => c.status === 'Active' && (c.maleId === male.id || c.femaleId === male.id));
    const isFemaleInCouple = couples.some(c => c.status === 'Active' && (c.maleId === female.id || c.femaleId === female.id));

    if (isMaleInCouple || isFemaleInCouple) {
      alert("أحد الطيور أو كلاهما مضاف مسبقاً في كوبل آخر");
      return;
    }
    
    const id = Date.now().toString();
    const newCouple: CoupleData & { userId: string } = {
      id,
      maleId: selectedMaleId,
      femaleId: selectedFemaleId,
      startDate: new Date().toLocaleDateString(),
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
      alert("يرجى اختيار الذكر والأنثى أولاً");
      return;
    }

    const male = birds.find(b => b.id === geneticsMaleId);
    const female = birds.find(b => b.id === geneticsFemaleId);

    if (!male || !female) return;

    if (male.species !== female.species) {
      alert("يجب أن يكون الذكر والأنثى من نفس النوع للتنبؤ بالوراثة");
      return;
    }

    setIsGeneticsLoading(true);
    setGeneticsResult(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `
        You are an expert avian genetics consultant. 
        Predict the possible offspring (chicks) mutations for a pair of birds with the following details:
        Species: ${male.species}
        Male Mutation: ${male.mutation || "Normal/Classic"}
        Female Mutation: ${female.mutation || "Normal/Classic"}

        Please provide the results in a structured JSON format with the following fields:
        - possibleMutations: An array of objects, each with 'name' (mutation name), 'probability' (percentage), and 'description' (brief explanation).
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
                    description: { type: Type.STRING }
                  },
                  required: ["name", "probability", "description"]
                }
              },
              advice: { type: Type.STRING },
              difficulty: { type: Type.INTEGER }
            },
            required: ["possibleMutations", "advice", "difficulty"]
          }
        }
      });

      const result = JSON.parse(response.text);
      setGeneticsResult(result);
    } catch (error) {
      console.error("Genetics Prediction Error:", error);
      alert("حدث خطأ أثناء التنبؤ بالوراثة. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsGeneticsLoading(false);
    }
  };

  const [newEgg, setNewEgg] = useState({
    laidDate: new Date().toLocaleDateString(),
    hatchDate: "",
    status: "Intact" as "Intact" | "Hatched" | "Broken"
  });

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
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
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
      setNewEgg({ laidDate: new Date().toLocaleDateString(), hatchDate: "", status: "Intact" });
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
        laidDate: egg.laidDate || new Date().toLocaleDateString(),
        hatchDate: egg.hatchDate || "",
        status: egg.status || "Intact"
      });
    } else {
      setEditingEggId(null);
      setSelectedCoupleId(coupleId || "");
      setNewEgg({
        laidDate: new Date().toLocaleDateString(),
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
    const newEggData: EggData & { userId: string } = {
      id,
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
      setSelectedCoupleId("");
      setNewEgg({ laidDate: new Date().toLocaleDateString(), hatchDate: "", status: "Intact" });
      
      setNotifications([
        { 
          id: Date.now(), 
          title: "New Egg!", 
          message: `A new egg was added for Couple #${coupleId}. Est. hatch: ${hatchDate}`, 
          time: "Just now", 
          read: false 
        },
        ...notifications
      ]);
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
      setNotifications([
        { id: Date.now(), title: "Profile Updated", message: "Your profile information has been updated.", time: "Just now", read: false },
        ...notifications
      ]);
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
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-3xl flex items-center justify-center animate-bounce">
            <Bird className="w-8 h-8" />
          </div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse">Loading PetsBird...</p>
        </div>
      </div>
    );
  }

  if (showAuthPage && !user) {
    return (
      <div className="min-h-screen bg-[#fcfcf9] flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <div 
              onClick={() => setShowAuthPage(false)}
              className="w-16 h-16 bg-primary rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/20 cursor-pointer hover:scale-110 transition-all"
            >
              <Bird className="text-white w-8 h-8" />
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
              onClick={handleGoogleSignIn}
              className="w-full py-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 flex items-center justify-center gap-3 hover:bg-slate-50 transition-all shadow-sm mb-6"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
              المتابعة باستخدام جوجل
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
        {/* Demo Modal */}
        <AnimatePresence>
          {isDemoOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-xl"
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative w-full max-w-5xl aspect-video bg-black rounded-[40px] overflow-hidden shadow-2xl border border-white/10"
              >
                <button 
                  onClick={() => setIsDemoOpen(false)}
                  className="absolute top-6 right-6 z-10 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12">
                  <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center mb-8 animate-pulse">
                    <Bird className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-4xl font-black text-white mb-4 font-display">Experience PetsBird</h2>
                  <p className="text-slate-400 max-w-lg mb-8">Watch how our AI Genetics and real-time tracking transform your aviary management.</p>
                  <div className="w-full max-w-3xl aspect-video bg-slate-800 rounded-3xl relative overflow-hidden group cursor-pointer">
                    <img 
                      src="https://images.unsplash.com/photo-1552728089-57bdde30eba3?auto=format&fit=crop&q=80&w=1920" 
                      alt="Demo Preview" 
                      className="w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-20 h-20 bg-primary text-white rounded-full flex items-center justify-center shadow-2xl shadow-primary/40 group-hover:scale-110 transition-all">
                        <TrendingUp className="w-8 h-8" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <nav className="fixed top-0 w-full z-[100] px-8 py-6 flex items-center justify-between backdrop-blur-md bg-white/30">
          <div 
            onClick={() => navigateToTab("Home")}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:rotate-12 transition-transform">
              <Bird className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold font-display text-slate-800">PetsBird<span className="text-primary">.com</span></h1>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {["Features", "Genetics", "Advice", "News", "About"].map((item) => (
              <button 
                key={item} 
                onClick={() => navigateToTab(item, true)}
                className={`text-sm font-bold transition-colors uppercase tracking-widest ${landingTab === item ? 'text-primary' : 'text-slate-500 hover:text-primary'}`}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4">
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
          <>
            {/* Hero Section */}
            <section className="relative pt-40 pb-20 px-8 min-h-screen flex flex-col items-center justify-center text-center overflow-hidden">
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10"
              >
                <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-6">
                  The Future of Aviary Management
                </span>
                <h1 className="text-[12vw] md:text-[8vw] font-black font-display leading-[0.85] text-slate-900 mb-8 tracking-tighter">
                  BREED <br /> <span className="text-primary italic">SMARTER</span>
                </h1>
                <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-500 font-medium mb-12 leading-relaxed">
                  PetsBird combines advanced AI genetics, real-time tracking, and a global marketplace to help you build the perfect aviary.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                  <button 
                    onClick={handleLaunchApp}
                    className="w-full sm:w-auto px-10 py-5 bg-slate-900 text-white rounded-[24px] font-bold text-lg shadow-2xl hover:bg-primary transition-all flex items-center justify-center gap-3 group"
                  >
                    {user ? "Go to Dashboard" : "Start Managing Now"}
                    <TrendingUp className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button 
                    onClick={() => setIsDemoOpen(true)}
                    className="w-full sm:w-auto px-10 py-5 bg-white text-slate-900 border border-slate-200 rounded-[24px] font-bold text-lg hover:bg-slate-50 transition-all"
                  >
                    Watch Demo
                  </button>
                  <button 
                    onClick={handleInstallClick}
                    className="w-full sm:w-auto px-10 py-5 bg-primary text-white rounded-[24px] font-bold text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-all flex items-center justify-center gap-3"
                  >
                    <Download className="w-5 h-5" />
                    Download App
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                  <div>
                    <h2 className="text-5xl md:text-6xl font-black font-display text-slate-900 leading-[0.9] mb-8">
                      EVERYTHING <br /> YOU NEED TO <br /> <span className="text-accent-gold">EXCEL</span>
                    </h2>
                    <div className="space-y-8">
                      {[
                        { title: "AI Genetics Predictor", desc: "Use advanced neural networks to predict offspring mutations with 99% accuracy.", icon: BrainCircuit, color: "text-primary bg-primary/10", tab: "Genetics" },
                        { title: "Real-time Egg Tracking", desc: "Monitor every nest, track incubation periods, and get hatching alerts.", icon: EggIcon, color: "text-accent-orange bg-accent-orange/10", tab: "Features" },
                        { title: "Global Marketplace", desc: "Connect with verified breeders worldwide to buy and sell rare mutations.", icon: ShoppingBag, color: "text-accent-gold bg-accent-gold/10", tab: "Advice" }
                      ].map((feature, i) => (
                        <div 
                          key={i} 
                          className="flex gap-6 group cursor-pointer"
                          onClick={() => navigateToTab(feature.tab, true)}
                        >
                          <div className={`w-16 h-16 shrink-0 rounded-3xl flex items-center justify-center ${feature.color} group-hover:scale-110 transition-transform`}>
                            <feature.icon className="w-8 h-8" />
                          </div>
                          <div>
                            <h4 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-primary transition-colors">{feature.title}</h4>
                            <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="relative">
                    <div className="aspect-square rounded-[64px] bg-slate-50 overflow-hidden relative group">
                      <img 
                        src="https://images.unsplash.com/photo-1555008889-51830030f4ba?auto=format&fit=crop&q=80&w=1000" 
                        alt="Bird Genetics" 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-primary/20 mix-blend-overlay" />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {landingTab === "Features" && (
          <section className="pt-40 pb-20 px-8 max-w-7xl mx-auto min-h-screen">
            <div className="text-center mb-20">
              <h2 className="text-6xl font-black font-display text-slate-900 mb-6">Powerful Features</h2>
              <p className="text-xl text-slate-500 max-w-2xl mx-auto">Discover the tools that make PetsBird the choice of professional breeders.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: "Inventory Management", desc: "Keep track of every bird, its lineage, and health history.", icon: Box },
                { title: "Breeding Pairs", desc: "Manage couples and track their breeding success over time.", icon: Heart },
                { title: "Egg Monitoring", desc: "Never miss a hatch date with our automated notification system.", icon: EggIcon },
                { title: "Financial Tracking", desc: "Monitor your aviary's expenses and sales in one place.", icon: TrendingUp },
                { title: "Health Records", desc: "Log vaccinations, treatments, and vet visits for every bird.", icon: Activity },
                { title: "Cage Mapping", desc: "Visualize your aviary layout and bird distribution.", icon: MapPin }
              ].map((f, i) => (
                <div key={i} className="glass p-10 rounded-[40px] border-white/20 hover:shadow-2xl transition-all">
                  <div className="w-16 h-16 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mb-6">
                    <f.icon className="w-8 h-8" />
                  </div>
                  <h4 className="text-2xl font-bold text-slate-800 mb-4">{f.title}</h4>
                  <p className="text-slate-500 leading-relaxed">{f.desc}</p>
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

        {landingTab === "Genetics" && (
          <section className="pt-40 pb-20 px-8 max-w-7xl mx-auto min-h-screen">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div className="relative">
                <div className="aspect-[4/5] rounded-[64px] overflow-hidden shadow-2xl">
                  <img 
                    src="https://images.unsplash.com/photo-1522926126624-397114120a77?auto=format&fit=crop&q=80&w=1000" 
                    alt="Genetics Lab" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="absolute -bottom-10 -right-10 glass p-8 rounded-[40px] shadow-2xl border-white/40 max-w-xs">
                  <div className="flex items-center gap-3 mb-4">
                    <Dna className="w-6 h-6 text-primary" />
                    <span className="text-sm font-black uppercase tracking-widest text-slate-800">DNA Analysis</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">Our AI analyzes thousands of genetic markers to predict offspring with unmatched precision.</p>
                </div>
              </div>
              <div>
                <h2 className="text-6xl font-black font-display text-slate-900 leading-[0.9] mb-8">AI GENETICS <br /> <span className="text-primary">REDEFINED</span></h2>
                <p className="text-xl text-slate-500 mb-12 leading-relaxed">Stop guessing. Our advanced genetic engine uses deep learning to calculate probabilities for even the most complex mutations.</p>
                <div className="space-y-6">
                  {[
                    "99.8% Prediction Accuracy",
                    "Support for 200+ Bird Species",
                    "Complex Mutation Combinations",
                    "Lineage Probability Mapping"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-6 h-6 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <span className="text-lg font-bold text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-12">
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

        {landingTab === "Advice" && (
          <section className="pt-40 pb-20 px-8 max-w-7xl mx-auto min-h-screen">
            <div className="text-center mb-20">
              <h2 className="text-6xl font-black font-display text-slate-900 mb-6">Breeder Advice</h2>
              <p className="text-xl text-slate-500 max-w-2xl mx-auto">Expert tips and professional advice to help you succeed in your breeding journey.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { title: "Breeding Guides", category: "Education", img: "https://images.unsplash.com/photo-1551085254-e96b210db58a?auto=format&fit=crop&q=80&w=600" },
                { title: "Health & Nutrition", category: "Care", img: "https://images.unsplash.com/photo-1452570053594-1b985d6ea890?auto=format&fit=crop&q=80&w=600" },
                { title: "Market Trends", category: "Business", img: "https://images.unsplash.com/photo-1520808663317-647b476a81b9?auto=format&fit=crop&q=80&w=600" }
              ].map((r, i) => (
                <div key={i} className="group cursor-pointer">
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
              {[
                { 
                  title: "New Mutation Discovered in Canary Species", 
                  date: "April 5, 2026", 
                  desc: "Researchers have identified a rare color mutation in the Gloster Canary, opening new possibilities for breeders.",
                  img: "https://images.unsplash.com/photo-1522926126624-397114120a77?auto=format&fit=crop&q=80&w=600"
                },
                { 
                  title: "Global Bird Expo 2026 Announced", 
                  date: "March 28, 2026", 
                  desc: "The world's largest aviculture event will take place in Madrid this October, featuring over 500 exhibitors.",
                  img: "https://images.unsplash.com/photo-1444464666168-49d633b86797?auto=format&fit=crop&q=80&w=600"
                },
                { 
                  title: "Advances in AI Genetic Mapping", 
                  date: "March 15, 2026", 
                  desc: "PetsBird's latest update improves mutation prediction accuracy for rare parrot species by 15%.",
                  img: "https://images.unsplash.com/photo-1555008889-51830030f4ba?auto=format&fit=crop&q=80&w=600"
                }
              ].map((n, i) => (
                <div key={i} className="glass p-8 rounded-[40px] border-white/20 hover:shadow-2xl transition-all group">
                  <div className="aspect-video rounded-3xl overflow-hidden mb-6">
                    <img src={n.img} alt={n.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                  </div>
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest">{n.date}</span>
                  <h4 className="text-xl font-bold text-slate-800 mt-2 mb-4">{n.title}</h4>
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
          <section className="pt-40 pb-20 px-8 max-w-5xl mx-auto min-h-screen text-center">
            <div className="w-24 h-24 bg-primary/10 text-primary rounded-[40px] flex items-center justify-center mx-auto mb-10">
              <Bird className="w-12 h-12" />
            </div>
            <h2 className="text-6xl font-black font-display text-slate-900 mb-8 tracking-tight">PASSION FOR <br /> <span className="text-primary italic">AVICULTURE</span></h2>
            <p className="text-2xl text-slate-500 leading-relaxed mb-16 font-medium">
              Founded in 2024, PetsBird was born from a simple idea: that technology should empower breeders, not complicate their lives. Today, we serve thousands of breeders across 40 countries, helping them preserve rare species and advance genetic research.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                { label: "Our Vision", desc: "To create a world where every breeder has access to professional-grade tools." },
                { label: "Our Values", desc: "Integrity, innovation, and a deep respect for the welfare of every bird." },
                { label: "Our Community", desc: "A global network of experts sharing knowledge and rare mutations." }
              ].map((v, i) => (
                <div key={i} className="text-left">
                  <h5 className="text-xl font-black text-slate-800 mb-4 uppercase tracking-widest">{v.label}</h5>
                  <p className="text-slate-500 leading-relaxed">{v.desc}</p>
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
                className="flex items-center gap-3 cursor-pointer"
              >
                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                  <Bird className="text-white w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold font-display text-slate-800 leading-none">PetsBird</h1>
                  <span className="text-[10px] text-primary font-bold uppercase tracking-widest">Premium Aviary Management</span>
                </div>
              </div>
              <div className="flex gap-12">
                <div className="space-y-4">
                  <h5 className="text-xs font-black uppercase tracking-widest text-slate-400">Product</h5>
                  <ul className="space-y-2 text-sm font-bold text-slate-600">
                    <li onClick={() => navigateToTab("Features", true)} className="hover:text-primary cursor-pointer">Features</li>
                    <li onClick={() => navigateToTab("Genetics", true)} className="hover:text-primary cursor-pointer">AI Genetics</li>
                    <li onClick={() => navigateToTab("Advice", true)} className="hover:text-primary cursor-pointer">Advice</li>
                    <li onClick={() => navigateToTab("Marketplace", true)} className="hover:text-primary cursor-pointer">Marketplace</li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h5 className="text-xs font-black uppercase tracking-widest text-slate-400">Company</h5>
                  <ul className="space-y-2 text-sm font-bold text-slate-600">
                    <li onClick={() => navigateToTab("About", true)} className="hover:text-primary cursor-pointer">About Us</li>
                    <li onClick={() => navigateToTab("Terms", true)} className="hover:text-primary cursor-pointer">Terms & Conditions</li>
                    <li onClick={() => navigateToTab("Contact", true)} className="hover:text-primary cursor-pointer">Contact</li>
                    <li onClick={() => navigateToTab("Privacy", true)} className="hover:text-primary cursor-pointer">Privacy</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="mt-20 pt-8 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
              <p className="text-xs font-bold text-slate-400">© 2026 PetsBird. All rights reserved.</p>
              <div className="flex gap-6">
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

  return (
    <div className="flex min-h-screen bg-background font-sans selection:bg-primary/10">
      {/* Sidebar */}
      <aside className="w-72 bg-sidebar text-white flex flex-col p-6 fixed h-screen z-50 overflow-y-auto custom-scrollbar">
        <div 
          onClick={() => setShowApp(false)}
          className="flex items-center gap-3 mb-10 px-2 cursor-pointer group"
        >
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
            <Bird className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold font-display leading-none">PetsBird</h1>
            <span className="text-[10px] text-primary font-bold uppercase tracking-widest">.com</span>
          </div>
        </div>

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
              <span className="text-sm font-bold truncate">{user?.displayName || "Breeder"}</span>
              <span className="text-[9px] bg-accent-gold/20 text-accent-gold px-1.5 py-0.5 rounded-md font-bold uppercase">Admin</span>
            </div>
            <div className="flex items-center gap-1 text-slate-500 text-[10px] mt-0.5">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{userProfile.location}</span>
              <ChevronDown className="w-3 h-3" />
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <div className="flex items-center gap-2 px-4 mb-4">
            <div className="w-1 h-4 bg-primary rounded-full" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Main Menu</span>
          </div>
          <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeTab === "Dashboard"} onClick={() => setActiveTab("Dashboard")} />
          <SidebarItem icon={Users} label="My Birds" active={activeTab === "My Birds"} onClick={() => setActiveTab("My Birds")} />
          <SidebarItem icon={Heart} label="Couples" active={activeTab === "Couples"} onClick={() => setActiveTab("Couples")} />
          <SidebarItem icon={EggIcon} label="Eggs" active={activeTab === "Eggs"} onClick={() => setActiveTab("Eggs")} />
          <SidebarItem icon={Sparkles} label="AI Genetics" active={activeTab === "AI Genetics"} onClick={() => setActiveTab("AI Genetics")} />
          <SidebarItem icon={ShoppingBag} label="Marketplace" active={activeTab === "Marketplace"} onClick={() => setActiveTab("Marketplace")} />
          
          <div className="pt-8 pb-4 px-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Resources</span>
          </div>
          <SidebarItem icon={BookOpen} label="Advice" active={activeTab === "Advice"} onClick={() => setActiveTab("Advice")} />
          <SidebarItem icon={Newspaper} label="News" active={activeTab === "News"} onClick={() => setActiveTab("News")} />
          <SidebarItem icon={Info} label="About Us" active={activeTab === "About Us"} onClick={() => setActiveTab("About Us")} />
          <SidebarItem icon={Mail} label="Contact Us" active={activeTab === "Contact Us"} onClick={() => setActiveTab("Contact Us")} />

          <div className="pt-8 pb-4 px-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">System</span>
          </div>
          <SidebarItem icon={Download} label="Download App" onClick={handleInstallClick} />
          <SidebarItem icon={LayoutDashboard} label="Back to Home" onClick={() => setShowApp(false)} />
          <SidebarItem icon={Settings} label="Settings" active={activeTab === "Settings"} onClick={() => setActiveTab("Settings")} />
          <SidebarItem icon={LogOut} label="Logout" onClick={handleLogout} />
        </nav>

        <div className="mt-auto pt-6 border-t border-white/5 text-center">
          <span className="text-[10px] text-slate-600 font-medium">v2.1.0</span>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-72 p-10">
        <header className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-4xl font-bold font-display text-slate-800 mb-2">{activeTab}</h2>
            <p className="text-slate-500 font-medium">Welcome back <span className="text-primary font-bold">JOLI</span>! Here's an overview of your aviary.</p>
          </div>
          <div className="flex items-center gap-4">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleInstallClick}
              className="hidden lg:flex items-center gap-2 bg-slate-100 text-slate-600 px-4 py-3 rounded-2xl font-bold text-sm hover:bg-primary hover:text-white transition-all"
            >
              <Download className="w-4 h-4" /> Download App
            </motion.button>
            {selectedBirds.length === 2 && activeTab === "My Birds" && (
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={handleCreateCouple}
                className="bg-accent-gold text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-accent-gold/20 flex items-center gap-2"
              >
                <LinkIcon className="w-4 h-4" /> Create Couple
              </motion.button>
            )}
            <div className="relative">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-slate-600 relative"
              >
                <Bell className="w-5 h-5" />
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-3 right-3 w-2 h-2 bg-accent-orange rounded-full border-2 border-white" />
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
                        <button 
                          onClick={() => setNotifications(notifications.map(n => ({ ...n, read: true })))}
                          className="text-[10px] font-bold text-primary uppercase tracking-wider"
                        >
                          Mark all as read
                        </button>
                      </div>
                      <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map((n) => (
                            <div 
                              key={n.id} 
                              className={`p-5 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer ${!n.read ? 'bg-primary/5' : ''}`}
                            >
                              <div className="flex justify-between items-start mb-1">
                                <h5 className="font-bold text-xs text-slate-800">{n.title}</h5>
                                <span className="text-[9px] text-slate-400">{n.time}</span>
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
          <>
            <div className="grid grid-cols-4 gap-6 mb-12">
              <StatCard 
                icon={Bird} 
                value={birds.length} 
                label="Bird count" 
                colorClass="bg-primary/10 text-primary" 
                onClick={() => setActiveTab("My Birds")}
              />
              <StatCard 
                icon={Heart} 
                value={couples.filter(c => c.status === 'Active').length} 
                label="Active nests" 
                colorClass="bg-accent-gold/10 text-accent-gold" 
                onClick={() => setActiveTab("Couples")}
              />
              <StatCard 
                icon={EggIcon} 
                value={eggs.length} 
                label="Total Eggs" 
                colorClass="bg-accent-orange/10 text-accent-orange" 
                onClick={() => setActiveTab("Eggs")}
              />
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass p-6 rounded-3xl shadow-sm border border-white/20 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div className="text-2xl font-bold font-display">
                    {eggs.length > 0 ? Math.round((eggs.filter(e => e.status === 'Hatched').length / eggs.length) * 100) : 0}%
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Hatch rate</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: eggs.length > 0 ? `${(eggs.filter(e => e.status === 'Hatched').length / eggs.length) * 100}%` : "0%" }}
                      className="h-full bg-gradient-to-r from-primary to-blue-500"
                    />
                  </div>
                </div>
              </motion.div>
            </div>

            <section>
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold font-display text-slate-800">Recent Birds</h3>
              </div>
              <div className="grid grid-cols-3 gap-8">
                {birds.slice(-3).map((bird) => (
                  <BirdCard key={bird.id} {...bird} />
                ))}
              </div>
            </section>
          </>
        )}

        {activeTab === "My Birds" && (
          <section>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold font-display text-slate-800">All Birds</h3>
              {selectedBirds.length > 0 && (
                <span className="text-sm font-bold text-primary">{selectedBirds.length}/2 birds selected for coupling</span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-8">
              {birds.map((bird) => (
                <BirdCard 
                  key={bird.id} 
                  {...bird} 
                  onSelect={() => handleToggleBirdSelection(bird.id)}
                  isSelected={selectedBirds.includes(bird.id)}
                  onEdit={() => openBirdModal(bird)}
                  onDelete={handleDeleteBird}
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
              <h3 className="text-2xl font-bold font-display text-slate-800">Breeding Couples</h3>
            </div>
            <div className="grid grid-cols-2 gap-8">
              {couples.map((couple) => {
                const male = birds.find(b => b.id === couple.maleId);
                const female = birds.find(b => b.id === couple.femaleId);
                const coupleEggs = eggs.filter(e => e.coupleId === couple.id);
                
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
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-4">
                        <div className="flex -space-x-4">
                          <div className="w-14 h-14 rounded-2xl bg-male flex items-center justify-center border-4 border-white shadow-md rotate-[-6deg] hover:rotate-0 transition-transform">
                            <Bird className="w-7 h-7 text-male-text" />
                          </div>
                          <div className="w-14 h-14 rounded-2xl bg-female flex items-center justify-center border-4 border-white shadow-md rotate-[6deg] hover:rotate-0 transition-transform">
                            <Bird className="w-7 h-7 text-female-text" />
                          </div>
                        </div>
                        <div>
                          <h4 className="font-bold font-display text-xl text-slate-800">
                            {male ? `${male.name}` : 'N/A'} 
                            <span className="text-slate-300 mx-2">×</span> 
                            {female ? `${female.name}` : 'N/A'}
                          </h4>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Started {couple.startDate}</p>
                          </div>
                        </div>
                      </div>
                      <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                        couple.status === 'Active' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-slate-50 text-slate-500 border border-slate-100'
                      }`}>
                        {couple.status}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="p-5 rounded-[32px] bg-slate-50 border border-slate-100/50 hover:bg-white hover:border-primary/20 transition-all group/male">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Male (الذكر)</span>
                          <Bird className="w-3 h-3 text-male-text opacity-30" />
                        </div>
                        <div className="space-y-2">
                          <span className="font-bold text-slate-800 block text-sm">{male?.name} <span className="text-slate-400 font-medium">#{male?.ring}</span></span>
                          <div className="flex flex-wrap gap-1.5">
                            <span className="text-[8px] bg-white px-2 py-1 rounded-lg text-slate-500 font-bold border border-slate-100">{male?.birthYear}</span>
                            <span className="text-[8px] bg-white px-2 py-1 rounded-lg text-slate-500 font-bold border border-slate-100">{male?.mutation || 'Normal'}</span>
                            <span className="text-[8px] bg-white px-2 py-1 rounded-lg text-slate-500 font-bold border border-slate-100">{male?.species}</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-5 rounded-[32px] bg-slate-50 border border-slate-100/50 hover:bg-white hover:border-primary/20 transition-all group/female">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Female (الأنثى)</span>
                          <Bird className="w-3 h-3 text-female-text opacity-30" />
                        </div>
                        <div className="space-y-2">
                          <span className="font-bold text-slate-800 block text-sm">{female?.name} <span className="text-slate-400 font-medium">#{female?.ring}</span></span>
                          <div className="flex flex-wrap gap-1.5">
                            <span className="text-[8px] bg-white px-2 py-1 rounded-lg text-slate-500 font-bold border border-slate-100">{female?.birthYear}</span>
                            <span className="text-[8px] bg-white px-2 py-1 rounded-lg text-slate-500 font-bold border border-slate-100">{female?.mutation || 'Normal'}</span>
                            <span className="text-[8px] bg-white px-2 py-1 rounded-lg text-slate-500 font-bold border border-slate-100">{female?.species}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                      <div className="flex items-center gap-2">
                        <EggIcon className="w-5 h-5 text-accent-orange" />
                        <span className="font-bold text-slate-800">{coupleEggs.length} Eggs</span>
                      </div>
                      <button 
                        onClick={() => openEggModal(couple.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-accent-orange/10 text-accent-orange rounded-xl font-bold text-xs hover:bg-accent-orange/20 transition-colors"
                      >
                        <Plus className="w-4 h-4" /> Add Egg
                      </button>
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
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold font-display text-slate-800">Egg Tracking</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {eggs.map((egg) => {
                const couple = couples.find(c => c.id === egg.coupleId);
                const male = birds.find(b => b.id === couple?.maleId);
                const female = birds.find(b => b.id === couple?.femaleId);
                
                const daysToHatch = (() => {
                  if (!egg.hatchDate || egg.status !== 'Intact') return null;
                  try {
                    const [day, month, year] = egg.hatchDate.split('/').map(Number);
                    const hatch = new Date(year, month - 1, day).getTime();
                    const now = new Date();
                    now.setHours(0, 0, 0, 0);
                    const diffTime = hatch - now.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    return diffDays;
                  } catch (e) { return null; }
                })();

                const progress = (() => {
                  if (!egg.laidDate || !egg.hatchDate || egg.status !== 'Intact') return 0;
                  try {
                    const parseDate = (dStr: string) => {
                      if (dStr.includes('-')) return new Date(dStr);
                      const [d, m, y] = dStr.split('/').map(Number);
                      return new Date(y, m - 1, d);
                    };
                    const laid = parseDate(egg.laidDate).getTime();
                    const hatch = parseDate(egg.hatchDate).getTime();
                    const now = new Date().getTime();
                    const total = hatch - laid;
                    const elapsed = now - laid;
                    return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
                  } catch (e) { return 0; }
                })();

                const isHatchingToday = daysToHatch === 0;
                const isNearHatching = daysToHatch !== null && daysToHatch <= 2 && daysToHatch > 0;

                return (
                  <motion.div
                    key={egg.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    className="relative flex flex-col items-center group"
                  >
                    {/* Edit/Delete Buttons */}
                    <div className="absolute -top-2 -right-2 flex flex-col gap-2 z-40">
                      <button 
                        onClick={(e) => { e.stopPropagation(); openEggModal(undefined, egg); }}
                        className="p-2.5 bg-white shadow-xl text-slate-400 rounded-xl hover:text-primary hover:scale-110 transition-all border border-slate-100"
                        title="تعديل"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteEgg(egg.id); }}
                        className="p-2.5 bg-white shadow-xl text-slate-400 rounded-xl hover:text-red-500 hover:scale-110 transition-all border border-slate-100"
                        title="حذف"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Egg Shape Container */}
                    <div className={`relative w-full aspect-[4/5] rounded-[50%_50%_50%_50%_/_70%_70%_45%_45%] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-t border-white/40 transition-all duration-700 flex flex-col items-center justify-center p-8 text-center overflow-hidden
                      ${isHatchingToday ? 'bg-gradient-to-b from-orange-100 to-amber-100 border-orange-300 ring-4 ring-orange-400/20' : 
                        isNearHatching ? 'bg-gradient-to-b from-amber-50 to-orange-50 border-amber-200 animate-pulse' : 
                        'bg-gradient-to-b from-white to-slate-50 border-slate-100'}
                      ${egg.status === 'Broken' ? 'opacity-60 grayscale' : ''}
                    `}>
                      {/* Depth Shadow */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-black/5 to-transparent pointer-events-none" />
                      
                      {/* Cracking Effect */}
                      {(isNearHatching || isHatchingToday) && (
                        <div className="absolute inset-0 pointer-events-none opacity-30">
                          <svg viewBox="0 0 100 120" className="w-full h-full fill-none stroke-amber-900/20 stroke-[0.5]">
                            <path d="M30,40 L45,55 L35,70" />
                            <path d="M70,30 L60,50 L75,65" />
                            <path d="M50,80 L40,95 L60,110" />
                          </svg>
                        </div>
                      )}

                      {/* Status Badge */}
                      <div className={`absolute top-6 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm z-20 ${
                        egg.status === 'Hatched' ? 'bg-green-500 text-white' :
                        egg.status === 'Broken' ? 'bg-red-500 text-white' :
                        isHatchingToday ? 'bg-orange-500 text-white animate-bounce' :
                        'bg-primary text-white'
                      }`}>
                        {isHatchingToday ? 'Hatching Today! 🥚🐣' : egg.status}
                      </div>

                      {/* Egg Content */}
                      <div className="space-y-4 relative z-10 w-full">
                        <div className="relative w-16 h-16 mx-auto mb-4">
                          <div className={`w-16 h-16 rounded-2xl bg-white shadow-inner flex items-center justify-center border ${isHatchingToday ? 'border-orange-200' : 'border-slate-50'}`}>
                            <EggIcon className={`w-8 h-8 ${isHatchingToday ? 'text-orange-500' : 'text-accent-orange'}`} />
                          </div>
                          {daysToHatch !== null && daysToHatch > 0 && (
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent-orange text-white rounded-full flex items-center justify-center text-[10px] font-black border-4 border-white shadow-lg animate-bounce">
                              {daysToHatch}
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">Couple</p>
                          <p className="text-sm font-bold text-slate-800 truncate px-2">
                            {male ? `${male.name} (${male.ring})` : 'N/A'} 
                            <span className="text-slate-300 mx-1">×</span> 
                            {female ? `${female.name} (${female.ring})` : 'N/A'}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">Egg ID</p>
                          <p className="text-2xl font-black font-display text-primary">#{egg.id}</p>
                        </div>

                        {/* Progress Bar */}
                        {egg.status === 'Intact' && (
                          <div className="space-y-2 pt-2">
                            <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-slate-400">
                              <span>Incubation</span>
                              <span>{progress}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                className={`h-full ${isHatchingToday ? 'bg-orange-500' : 'bg-primary'}`}
                              />
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100/50">
                          <div className="flex flex-col items-center">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Laid</span>
                            <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">{egg.laidDate}</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-[8px] font-black text-accent-orange uppercase tracking-widest mb-1">Hatch</span>
                            <span className="text-[10px] font-bold text-white bg-accent-orange px-2 py-1 rounded-lg shadow-sm shadow-accent-orange/20">{egg.hatchDate || "TBD"}</span>
                          </div>
                        </div>

                        {/* Fertility Check Date */}
                        {egg.fertilityCheckDate && egg.status === 'Intact' && (
                          <div className="pt-2">
                            <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest block mb-1">Fertility Check</span>
                            <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100">{egg.fertilityCheckDate}</span>
                          </div>
                        )}
                      </div>

                      {/* Near Hatching Indicator */}
                      {isNearHatching && (
                        <div className="absolute bottom-6 flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-amber-100 animate-bounce z-20">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          <span className="text-[10px] font-black text-amber-600 tracking-wider">HATCHING SOON</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
              {eggs.length === 0 && (
                <div className="col-span-4 glass p-20 rounded-[40px] text-center border-white/20">
                  <EggIcon className="w-12 h-12 text-accent-orange/40 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium mb-6">No eggs tracked yet.</p>
                  <button 
                    onClick={() => openEggModal()}
                    className="bg-accent-orange text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-accent-orange/20 flex items-center gap-2 mx-auto"
                  >
                    <Plus className="w-4 h-4" /> Add Your First Egg
                  </button>
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
                <h3 className="text-2xl font-bold font-display text-slate-800">AI Genetics Predictor</h3>
                <p className="text-sm text-slate-500">Predict offspring mutations using advanced AI</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Selection Panel */}
              <div className="lg:col-span-1 space-y-6">
                <div className="glass p-8 rounded-[40px] border-white/20 space-y-6">
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
                      <h4 className="text-xl font-bold mb-2">Analyzing Genetics...</h4>
                      <p className="text-slate-500">Our AI is calculating possible mutation combinations based on Mendelian inheritance and species-specific traits.</p>
                    </motion.div>
                  ) : geneticsResult ? (
                    <motion.div 
                      key="result"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      <div className="glass p-8 rounded-[40px] border-white/20">
                        <div className="flex items-center justify-between mb-8">
                          <h4 className="text-xl font-bold font-display">Possible Offspring</h4>
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
                              className="p-6 bg-white rounded-3xl border border-slate-100 hover:border-primary/20 transition-all group"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-lg">
                                  {mut.probability}
                                </span>
                                <Dna className="w-4 h-4 text-slate-200 group-hover:text-primary transition-colors" />
                              </div>
                              <h5 className="font-bold text-slate-800 mb-1">{mut.name}</h5>
                              <p className="text-xs text-slate-500 leading-relaxed">{mut.description}</p>
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

        {activeTab === "Advice" && (
          <section className="max-w-5xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-bold font-display text-slate-800">Breeding Advice</h3>
                <p className="text-sm text-slate-500">Expert tips for a successful aviary</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: "Nutrition Guide", desc: "Ensure your birds get the right balance of seeds, greens, and calcium.", icon: "🍎" },
                { title: "Hygiene Protocol", desc: "Clean cages weekly to prevent respiratory infections and mites.", icon: "🧼" },
                { title: "Breeding Season", desc: "How to prepare your couples for the best breeding results.", icon: "🥚" },
                { title: "Stress Management", desc: "Keep noise levels low and provide a stable environment.", icon: "🧘" }
              ].map((item, i) => (
                <div key={i} className="glass p-8 rounded-[32px] border-white/20 hover:shadow-xl transition-all">
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h4 className="text-xl font-bold mb-2">{item.title}</h4>
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
                <h3 className="text-2xl font-bold font-display text-slate-800">Aviary News</h3>
                <p className="text-sm text-slate-500">Latest updates from the bird breeding world</p>
              </div>
            </div>
            <div className="space-y-6">
              {[
                { date: "April 5, 2026", title: "New Mutation Discovered", desc: "A rare blue-winged mutation has been reported in the local canary community." },
                { date: "March 28, 2026", title: "Spring Breeding Expo", desc: "Join us next month for the annual expo showcasing the best breeding pairs." },
                { date: "March 15, 2026", title: "App Update v2.1", desc: "We've launched the AI Genetics predictor to help you plan your nests better." }
              ].map((news, i) => (
                <div key={i} className="glass p-8 rounded-[32px] border-white/20 flex gap-6 items-start">
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
          <section className="max-w-3xl mx-auto text-center">
            <div className="w-20 h-20 bg-primary/10 text-primary rounded-[32px] flex items-center justify-center mx-auto mb-8">
              <Info className="w-10 h-10" />
            </div>
            <h3 className="text-3xl font-bold font-display text-slate-800 mb-4">About PetsBird</h3>
            <p className="text-slate-600 leading-relaxed mb-8">
              PetsBird is the world's leading platform for professional aviary management. 
              Our mission is to empower breeders with advanced tools like AI Genetics and real-time egg tracking 
              to ensure the health and success of every bird.
            </p>
            <div className="grid grid-cols-3 gap-8">
              <div>
                <div className="text-3xl font-bold text-primary mb-1">10k+</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Breeders</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-1">50k+</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Birds Tracked</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-1">100k+</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Eggs Hatched</div>
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

        {["Marketplace", "Settings"].includes(activeTab) && (
          <div className="glass p-20 rounded-[40px] text-center border-white/20">
            <div className="w-20 h-20 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mx-auto mb-6">
              {activeTab === "Marketplace" && <ShoppingBag className="w-10 h-10" />}
              {activeTab === "Settings" && <Settings className="w-10 h-10" />}
            </div>
            <h3 className="text-2xl font-bold font-display mb-2">{activeTab} Page</h3>
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
              className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-2xl font-bold font-display">{editingBirdId ? 'Edit Bird' : 'Add New Bird'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>
              <form onSubmit={editingBirdId ? handleUpdateBird : handleAddBird} className="p-8 space-y-6">
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
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Birth Year (سنة الميلاد)</label>
                    <input 
                      type="text" 
                      value={newBird.birthYear}
                      onChange={(e) => setNewBird({...newBird, birthYear: e.target.value})}
                      placeholder="e.g. 2024"
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
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Date Added</label>
                    <input 
                      type="text" 
                      value={newBird.date}
                      onChange={(e) => setNewBird({...newBird, date: e.target.value})}
                      className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-primary outline-none transition-all font-medium"
                    />
                  </div>
                </div>
                <button 
                  type="submit"
                  className="w-full py-5 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all mt-4"
                >
                  {editingBirdId ? 'Update Bird Profile' : 'Create Bird Profile'}
                </button>
              </form>
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
                      .filter(b => b.gender === 'Male')
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
                      .filter(b => b.gender === 'Female')
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
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Laid Date</label>
                    <input 
                      type="text" 
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
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <X className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold font-display text-slate-800 mb-2">{confirmModal.title}</h3>
                <p className="text-slate-500 font-medium mb-8">{confirmModal.message}</p>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                    className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                  >
                    إلغاء
                  </button>
                  <button 
                    onClick={confirmModal.onConfirm}
                    className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-bold shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all"
                  >
                    تأكيد الحذف
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
