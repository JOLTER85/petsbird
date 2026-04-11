import React, { useState, useEffect } from 'react';
import { 
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate
} from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { WhatsAppBot } from './components/AIChatBot';
import { PublicBirdProfile } from './components/PublicBirdProfile';
import { Marketplace } from './components/Marketplace';
import { AdvicePage } from './components/AdvicePage';
import { LandingPage } from './components/LandingPage';
import { AuthPage } from './components/AuthPage';
import { StaticPage } from './components/StaticPage';
import { Dashboard } from './components/dashboard/Dashboard';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { supabase, isSupabaseConfigured } from './lib/supabaseClient';
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  sendEmailVerification,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  collection,
  query,
  where,
  onSnapshot
} from './firebase';
import { 
  DashboardTab,
  UserProfile,
  Bird,
  Nest,
  ProductionRecord,
  MedicalRecord,
  SupplyItem
} from './types';
import { OperationType, handleFirestoreError } from './lib/firestoreUtils';

function AppContent() {
  const { t } = useLanguage();
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [birds, setBirds] = useState<Bird[]>([]);
  const [nests, setNests] = useState<Nest[]>([]);
  const [productionRecords, setProductionRecords] = useState<ProductionRecord[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [supplies, setSupplies] = useState<SupplyItem[]>([]);
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [selectedBirdId, setSelectedBirdId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleUpdateBird = async (birdId: string, data: Partial<Bird>) => {
    try {
      if (isSupabaseConfigured && supabase && user) {
        const supabaseData: any = {};
        if (data.name !== undefined) supabaseData.name = data.name;
        if (data.ringNumber !== undefined) supabaseData.ring_number = data.ringNumber;
        if (data.species !== undefined) supabaseData.species = data.species;
        if (data.sex !== undefined) supabaseData.gender = data.sex;
        if (data.birthDate !== undefined) supabaseData.birth_date = data.birthDate;
        if (data.photoURL !== undefined) supabaseData.image_url = data.photoURL;
        if (data.mutation !== undefined) supabaseData.mutation = data.mutation;
        if (data.origin !== undefined) supabaseData.origin = data.origin;
        if (data.healthStatus !== undefined) supabaseData.health_status = data.healthStatus;
        if (data.availability !== undefined) supabaseData.availability = data.availability;
        if (data.isForSale !== undefined) supabaseData.is_for_sale = data.isForSale;
        if (data.salePrice !== undefined) supabaseData.sale_price = data.salePrice;
        if (data.publicProfileEnabled !== undefined) supabaseData.public_profile_enabled = data.publicProfileEnabled;
        if (data.notes !== undefined) supabaseData.notes = data.notes;
        if (data.fatherId !== undefined) supabaseData.father_id = isNaN(parseInt(data.fatherId)) ? null : parseInt(data.fatherId);
        if (data.motherId !== undefined) supabaseData.mother_id = isNaN(parseInt(data.motherId)) ? null : parseInt(data.motherId);

        const { error } = await supabase
          .from('birds')
          .update(supabaseData)
          .eq('id', isNaN(parseInt(birdId)) ? birdId : parseInt(birdId))
          .eq('user_id', user.uid);
        
        if (error) throw error;
      }

      setBirds(prev => prev.map(b => b.id === birdId ? { ...b, ...data } : b));
      
      try {
        await updateDoc(doc(db, 'birds', birdId), data);
      } catch (e) {
        console.warn('Firestore update failed (optional):', e);
      }
    } catch (error) {
      console.error('Error in handleUpdateBird:', error);
      alert(t('failedToUpdateBird') || 'Failed to update bird');
    }
  };

  const handleDeleteBird = async (birdId: string) => {
    try {
      if (isSupabaseConfigured && supabase && user) {
        const { error } = await supabase
          .from('birds')
          .delete()
          .eq('id', birdId)
          .eq('user_id', user.uid);
        
        if (error) throw error;
      }

      setBirds(prev => prev.filter(b => b.id !== birdId));
      setSelectedBirdId(null);
      setActiveTab('your-birds');
      
      setTimeout(async () => {
        await fetchBirds();
      }, 1000);
    } catch (error) {
      console.error('Error in handleDeleteBird:', error);
      alert(t('failedToDeleteBird') || 'Failed to delete bird');
    }
  };

  const fetchBirds = async () => {
    if (!user || !isSupabaseConfigured || !supabase) return;
    const { data, error } = await supabase.from('birds').select('*').eq('user_id', user.uid);
    if (error) {
      console.error('Supabase Error fetching birds:', error);
      return;
    }
    if (data) {
      setBirds(data.map(b => ({
        id: b.id.toString(),
        name: b.name,
        ringNumber: b.ring_number || b.name,
        species: b.species,
        sex: b.gender || 'Unknown',
        birthDate: b.birth_date,
        photoURL: b.image_url,
        ownerId: b.user_id,
        createdAt: b.created_at,
        mutation: b.mutation || '',
        origin: b.origin || 'Bred by me',
        healthStatus: b.health_status || 'Healthy',
        availability: b.availability || 'Bred',
        isForSale: b.is_for_sale || false,
        salePrice: b.sale_price || 0,
        publicProfileEnabled: b.public_profile_enabled || false,
        notes: b.notes || '',
        fatherId: b.father_id?.toString(),
        motherId: b.mother_id?.toString()
      })) as Bird[]);
    }
  };

  const fetchNests = async () => {
    if (!user || !isSupabaseConfigured || !supabase) return;
    const { data, error } = await supabase.from('pairs').select('*').eq('user_id', user.uid);
    if (error) {
      console.error('Supabase Error fetching pairs:', error);
      return;
    }
    if (data) {
      setNests(data.map(p => ({
        id: p.id.toString(),
        maleId: p.male_id?.toString(),
        femaleId: p.female_id?.toString(),
        pairName: p.pair_name,
        firstEggDate: p.start_date,
        status: p.status === 'active' ? 'Laying' : (p.status || 'Laying'),
        eggsCount: p.eggs_count || 0,
        chicksCount: p.chicks_count || 0,
        ownerId: p.user_id,
        eggs: p.eggs || []
      })) as Nest[]);
    }
  };

  const fetchProductionRecords = async () => {
    if (!user || !isSupabaseConfigured || !supabase) return;
    const { data, error } = await supabase.from('production').select('*').eq('user_id', user.uid);
    if (error) {
      console.error('Supabase Error fetching production records:', error);
      return;
    }
    if (data) {
      setProductionRecords(data.map(r => ({
        id: r.id.toString(),
        birdId: r.bird_id.toString(),
        year: r.year,
        clutchNumber: r.clutch_number,
        eggsCount: r.eggs_count,
        hatchedCount: r.hatched_count,
        weanedCount: r.weaned_count,
        notes: r.notes || '',
        ownerId: r.user_id
      })) as ProductionRecord[]);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsAuthReady(true);
      if (user && location.pathname === '/auth') {
        navigate('/dashboard');
      } else if (!user && location.pathname.startsWith('/dashboard')) {
        navigate('/');
      }
    });
    return () => unsubscribe();
  }, [navigate, location.pathname]);

  useEffect(() => {
    if (user && isSupabaseConfigured && supabase) {
      fetchBirds();
      fetchNests();
      fetchProductionRecords();
      
      const birdsChannel = supabase.channel('birds_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'birds', filter: `user_id=eq.${user.uid}` }, () => fetchBirds()).subscribe();
      const pairsChannel = supabase.channel('pairs_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'pairs', filter: `user_id=eq.${user.uid}` }, () => fetchNests()).subscribe();
      const productionChannel = supabase.channel('production_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'production', filter: `user_id=eq.${user.uid}` }, () => fetchProductionRecords()).subscribe();
      
      return () => {
        supabase.removeChannel(birdsChannel);
        supabase.removeChannel(pairsChannel);
        supabase.removeChannel(productionChannel);
      };
    } else if (user) {
      const qBirds = query(collection(db, 'birds'), where('ownerId', '==', user.uid));
      const unsubscribeBirds = onSnapshot(qBirds, (snapshot) => {
        setBirds(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Bird[]);
      }, (error) => handleFirestoreError(error, OperationType.GET, 'birds'));

      const qNests = query(collection(db, 'nests'), where('ownerId', '==', user.uid));
      const unsubscribeNests = onSnapshot(qNests, (snapshot) => {
        setNests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Nest[]);
      }, (error) => handleFirestoreError(error, OperationType.GET, 'nests'));

      const qProduction = query(collection(db, 'production'), where('ownerId', '==', user.uid));
      const unsubscribeProduction = onSnapshot(qProduction, (snapshot) => {
        setProductionRecords(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ProductionRecord[]);
      }, (error) => handleFirestoreError(error, OperationType.GET, 'production'));

      return () => {
        unsubscribeBirds();
        unsubscribeNests();
        unsubscribeProduction();
      };
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setMedicalRecords([]);
      setSupplies([]);
      return;
    }

    const qMedical = query(collection(db, 'medical'), where('ownerId', '==', user.uid));
    const unsubscribeMedical = onSnapshot(qMedical, (snapshot) => {
      setMedicalRecords(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as MedicalRecord[]);
    }, (error) => handleFirestoreError(error, OperationType.GET, 'medical'));

    const qSupplies = query(collection(db, 'supplies'), where('ownerId', '==', user.uid));
    const unsubscribeSupplies = onSnapshot(qSupplies, (snapshot) => {
      setSupplies(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as SupplyItem[]);
    }, (error) => handleFirestoreError(error, OperationType.GET, 'supplies'));

    return () => {
      unsubscribeMedical();
      unsubscribeSupplies();
    };
  }, [user]);

  useEffect(() => {
    if (!user) {
      setUserProfile(null);
      return;
    }

    if (isSupabaseConfigured && supabase) {
      const fetchProfile = async () => {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', user.uid).single();
        if (error && error.code !== 'PGRST116') return;
        if (data) {
          setUserProfile({
            uid: user.uid,
            displayName: data.full_name || data.name,
            name: data.full_name || data.name,
            phone: data.phone,
            address: data.city || data.address,
            aviaryName: data.aviary_name || `${data.full_name || data.name}'s Aviary`
          } as UserProfile);
        }
      };
      fetchProfile();
    } else {
      const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
        if (doc.exists()) {
          setUserProfile({ uid: user.uid, ...doc.data() } as UserProfile);
        }
      });
      return () => unsubscribe();
    }
  }, [user]);

  const handleAuthSuccess = async (email: string, pass: string, name?: string, aviary?: string) => {
    if (name && aviary) {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      await sendEmailVerification(userCredential.user);
      if (isSupabaseConfigured && supabase) {
        await supabase.from('profiles').insert([{ id: userCredential.user.uid, full_name: name, aviary_name: aviary, phone: '', city: '' }]);
      }
      await setDoc(doc(db, 'users', userCredential.user.uid), { name, aviaryName: aviary, email, createdAt: new Date().toISOString() });
    } else {
      await signInWithEmailAndPassword(auth, email, pass);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      if (!userDoc.exists()) {
        if (isSupabaseConfigured && supabase) {
          await supabase.from('profiles').insert([{ id: result.user.uid, full_name: result.user.displayName, aviary_name: `${result.user.displayName}'s Aviary`, phone: '', city: '' }]);
        }
        await setDoc(doc(db, 'users', result.user.uid), { name: result.user.displayName, aviaryName: `${result.user.displayName}'s Aviary`, email: result.user.email, createdAt: new Date().toISOString() });
      }
    } catch (error) {
      console.error("Google Login Error:", error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage user={user} userProfile={userProfile} />} />
        <Route path="/auth" element={<AuthPage onAuthSuccess={handleAuthSuccess} onGoogleLogin={handleGoogleLogin} />} />
        <Route path="/dashboard/*" element={user ? <Dashboard user={user} userProfile={userProfile} birds={birds} setBirds={setBirds} nests={nests} setNests={setNests} productionRecords={productionRecords} medicalRecords={medicalRecords} supplies={supplies} activeTab={activeTab} setActiveTab={setActiveTab} selectedBirdId={selectedBirdId} setSelectedBirdId={setSelectedBirdId} isAddModalOpen={isAddModalOpen} setIsAddModalOpen={setIsAddModalOpen} onLogout={handleLogout} fetchBirds={fetchBirds} fetchNests={fetchNests} handleDeleteBird={handleDeleteBird} handleUpdateBird={handleUpdateBird} /> : <Navigate to="/auth" />} />
        <Route path="/bird/:id" element={<PublicBirdProfile />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/advice" element={<AdvicePage />} />
        <Route path="/advice/:id" element={<AdvicePage />} />
        <Route path="/news" element={<StaticPage type="news" user={user} userProfile={userProfile} />} />
        <Route path="/about" element={<StaticPage type="about" user={user} userProfile={userProfile} />} />
        <Route path="/contact" element={<StaticPage type="contact" user={user} userProfile={userProfile} />} />
        <Route path="/terms" element={<StaticPage type="terms" user={user} userProfile={userProfile} />} />
        <Route path="/privacy" element={<StaticPage type="privacy" user={user} userProfile={userProfile} />} />
        <Route path="/complaints" element={<StaticPage type="complaints" user={user} userProfile={userProfile} />} />
        <Route path="/disclaimer" element={<StaticPage type="disclaimer" user={user} userProfile={userProfile} />} />
        <Route path="/accessibility" element={<StaticPage type="accessibility" user={user} userProfile={userProfile} />} />
        <Route path="/sitemap" element={<StaticPage type="sitemap" user={user} userProfile={userProfile} />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <WhatsAppBot />
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </LanguageProvider>
    </ErrorBoundary>
  );
}
