import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, ArrowLeft, Mail, Info } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { db, doc, setDoc, addDoc, collection, updateDoc } from '../../firebase';
import { 
  DashboardTab, 
  UserProfile, 
  Bird, 
  Nest, 
  ProductionRecord, 
  MedicalRecord, 
  SupplyItem 
} from '../../types';
import { Button } from '../ui/Button';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { Header } from './Header';
import { OverviewTab } from './OverviewTab';
import { BirdList } from '../BirdList';
import { NestsTab } from './NestsTab';
import { MarketplaceTab } from './MarketplaceTab';
import { MedicalTab } from './MedicalTab';
import { HatchingTab } from './HatchingTab';
import { SuppliesTab } from './SuppliesTab';
import { GeneticsTab } from './GeneticsTab';
import { PedigreeTab } from './PedigreeTab';
import { SettingsTab } from './SettingsTab';
import { DashboardModals } from './DashboardModals';
import { BirdProfile } from '../BirdProfile';
import { handleFirestoreError, OperationType } from '../../lib/firestoreUtils';
import { sendEmailVerification, auth } from '../../firebase';

export const Dashboard = ({ 
  user, 
  userProfile,
  birds, 
  setBirds, 
  nests,
  setNests,
  productionRecords,
  medicalRecords,
  supplies,
  activeTab, 
  setActiveTab, 
  selectedBirdId, 
  setSelectedBirdId, 
  isAddModalOpen, 
  setIsAddModalOpen, 
  onLogout,
  fetchBirds,
  fetchNests,
  handleDeleteBird,
  handleUpdateBird
}: { 
  user: any, 
  userProfile: UserProfile | null,
  birds: Bird[], 
  setBirds: React.Dispatch<React.SetStateAction<Bird[]>>, 
  nests: Nest[],
  setNests: React.Dispatch<React.SetStateAction<Nest[]>>,
  productionRecords: ProductionRecord[],
  medicalRecords: MedicalRecord[],
  supplies: SupplyItem[],
  activeTab: DashboardTab, 
  setActiveTab: (tab: DashboardTab) => void, 
  selectedBirdId: string | null, 
  setSelectedBirdId: (id: string | null) => void, 
  isAddModalOpen: boolean, 
  setIsAddModalOpen: (open: boolean) => void, 
  onLogout: () => void,
  fetchBirds: () => Promise<void>,
  fetchNests: () => Promise<void>,
  handleDeleteBird: (birdId: string) => Promise<void>,
  handleUpdateBird: (birdId: string, data: Partial<Bird>) => Promise<void>
}) => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecies, setFilterSpecies] = useState('All');
  const [pedigreeTargetId, setPedigreeTargetId] = useState<string | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAddNestModalOpen, setIsAddNestModalOpen] = useState(false);
  const [isAddMedicalModalOpen, setIsAddMedicalModalOpen] = useState(false);
  const [isAddSupplyModalOpen, setIsAddSupplyModalOpen] = useState(false);
  const [selectedNestId, setSelectedNestId] = useState<string | null>(null);
  const [settingsData, setSettingsData] = useState({
    displayName: userProfile?.displayName || '',
    firstName: userProfile?.firstName || '',
    lastName: userProfile?.lastName || '',
    phone: userProfile?.phone || '',
    address: userProfile?.address || '',
    aviaryName: userProfile?.aviaryName || '',
  });

  useEffect(() => {
    if (userProfile) {
      setSettingsData({
        displayName: userProfile.displayName || '',
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        phone: userProfile.phone || '',
        address: userProfile.address || '',
        aviaryName: userProfile.aviaryName || '',
      });
    }
  }, [userProfile]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isSupabaseConfigured && supabase && user) {
        const { error } = await supabase
          .from('profiles')
          .upsert({
            id: user.uid,
            full_name: settingsData.displayName,
            phone: settingsData.phone,
            city: settingsData.address,
            aviary_name: settingsData.aviaryName
          });
        if (error) throw error;
      }
      await setDoc(doc(db, 'users', user.uid), settingsData, { merge: true });
      console.log('Profile updated successfully');
    } catch (error: any) {
      console.error("Error saving settings:", error);
    }
  };

  const navigate = useNavigate();
  const location = useLocation();

  // Sync activeTab with URL
  useEffect(() => {
    const path = location.pathname;
    if (path === '/dashboard' || path === '/dashboard/') {
      setActiveTab('Dashboard');
    } else if (path === '/dashboard/birds') {
      setActiveTab('My Birds');
    } else if (path === '/dashboard/nests') {
      setActiveTab('Couples');
    } else if (path === '/dashboard/marketplace') {
      setActiveTab('Marketplace');
    } else if (path === '/dashboard/medical') {
      setActiveTab('medical');
    } else if (path === '/dashboard/hatching') {
      setActiveTab('Eggs');
    } else if (path === '/dashboard/supplies') {
      setActiveTab('supplies');
    } else if (path === '/dashboard/genetics') {
      setActiveTab('AI Genetics');
    } else if (path === '/dashboard/pedigree') {
      setActiveTab('pedigree');
    } else if (path === '/dashboard/settings') {
      setActiveTab('Settings');
    } else if (path === '/dashboard/add-bird') {
      setIsAddModalOpen(true);
    }
  }, [location.pathname, setActiveTab, setIsAddModalOpen]);

  const filteredBirds = birds.filter(bird => {
    const matchesSearch = bird.ringNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          bird.mutation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterSpecies === 'All' || bird.species === filterSpecies;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: birds.length,
    males: birds.filter(b => b.sex === 'Male').length,
    females: birds.filter(b => b.sex === 'Female').length,
    activePairs: nests.length,
  };

  function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => setTimeout(() => reject(new Error(message)), timeoutMs))
    ]);
  }

  const uploadBirdImage = async (file: File, birdId: string): Promise<string | null> => {
    if (!isSupabaseConfigured || !supabase || !user) return null;
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.uid}/${birdId}-${Date.now()}.${fileExt}`;
      const bucketName = 'bird-photos';

      console.log(`Uploading image to Supabase Storage bucket: ${bucketName}, path: ${fileName}`);
      
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Supabase Storage upload error details:', uploadError);
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      console.log('Image uploaded successfully. Public URL:', publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('Unexpected error in uploadBirdImage:', error);
      return null;
    }
  };

  const handleAddBird = async (newBird: any) => {
    const userId = user?.uid || user?.id;
    
    try {
      const { createCouple, partnerRingNumber, partnerId, photoFile, photoPreview, ...birdDataOnly } = newBird;
      let imageUrl = birdDataOnly.photoURL || null;

      let birdId = '';
      let supabaseSuccess = false;

      if (isSupabaseConfigured && supabase && userId) {
        try {
          const { data, error } = await withTimeout<any>(
            Promise.resolve(supabase
              .from('birds')
              .insert([{
                user_id: userId,
                species: birdDataOnly.species,
                name: birdDataOnly.name || birdDataOnly.ringNumber,
                gender: birdDataOnly.sex,
                birth_date: birdDataOnly.birthDate,
                ring_number: birdDataOnly.ringNumber,
                image_url: imageUrl,
                mutation: birdDataOnly.mutation,
                health_status: birdDataOnly.healthStatus,
                notes: birdDataOnly.notes || '',
                father_id: birdDataOnly.fatherId,
                mother_id: birdDataOnly.motherId,
                availability: birdDataOnly.availability,
                origin: birdDataOnly.origin,
                is_for_sale: birdDataOnly.isForSale,
                sale_price: birdDataOnly.salePrice,
                public_profile_enabled: birdDataOnly.publicProfileEnabled
              }])
              .select()
              .single()),
            10000,
            'Supabase bird insert timed out'
          );
          
          if (error) {
            const { data: fallbackData, error: fallbackError } = await withTimeout<any>(
              Promise.resolve(supabase
                .from('birds')
                .insert([{
                  user_id: userId,
                  species: birdDataOnly.species,
                  name: birdDataOnly.name || birdDataOnly.ringNumber,
                  gender: birdDataOnly.sex,
                  birth_date: birdDataOnly.birthDate,
                  ring_number: birdDataOnly.ringNumber,
                  image_url: imageUrl,
                  mutation: birdDataOnly.mutation,
                  health_status: birdDataOnly.healthStatus,
                  notes: birdDataOnly.notes || ''
                }])
                .select()
                .single()),
              10000,
              'Supabase fallback bird insert timed out'
            );

            if (fallbackError) throw fallbackError;
            if (fallbackData) {
              birdId = fallbackData.id.toString();
              supabaseSuccess = true;
            }
          } else if (data) {
            birdId = data.id.toString();
            supabaseSuccess = true;
          }
          
          if (photoFile && birdId) {
            const uploadedUrl = await uploadBirdImage(photoFile, birdId);
            if (uploadedUrl) {
              imageUrl = uploadedUrl;
              await supabase
                .from('birds')
                .update({ image_url: imageUrl })
                .eq('id', isNaN(parseInt(birdId)) ? birdId : parseInt(birdId));
            }
          }
        } catch (err) {
          console.error('Supabase bird insert failed completely:', err);
        }
      }

      if (!birdId && !supabaseSuccess) {
        throw new Error('Failed to save bird to Supabase');
      }

      if (createCouple && (partnerRingNumber || partnerId)) {
        try {
          const ensureInt = (val: any) => {
            if (val === undefined || val === null || (Array.isArray(val) && val.length === 0)) return null;
            if (Array.isArray(val)) val = val[0];
            const num = parseInt(val);
            return isNaN(num) ? null : num;
          };

          const maleId = birdDataOnly.sex === 'Male' ? birdId : partnerId;
          const femaleId = birdDataOnly.sex === 'Female' ? birdId : partnerId;

          if (isSupabaseConfigured && supabase && userId) {
            const pairData = {
              user_id: userId,
              male_id: ensureInt(maleId),
              female_id: ensureInt(femaleId),
              pair_name: `${birdDataOnly.ringNumber} x ${partnerRingNumber}`,
              start_date: new Date().toISOString().split('T')[0],
              status: 'active',
              eggs: [],
              eggs_count: 0,
              chicks_count: 0
            };

            let { data: pData, error: pairError } = await withTimeout<any>(
              Promise.resolve(supabase
                .from('pairs')
                .insert([pairData])
                .select()),
              10000,
              'Supabase pair insert timed out'
            );
            
            if (pairError) {
              const fallbackPairData = {
                user_id: userId,
                male_id: pairData.male_id,
                female_id: pairData.female_id,
                pair_name: pairData.pair_name,
                start_date: pairData.start_date,
                status: pairData.status
              };
              const { data: fallbackData, error: fallbackError } = await withTimeout<any>(
                Promise.resolve(supabase
                  .from('pairs')
                  .insert([fallbackPairData])
                  .select()),
                10000,
                'Supabase fallback pair insert timed out'
              );
              
              if (!fallbackError) {
                pData = fallbackData;
                pairError = null;
              }
            }
            
            if (!pairError && pData && pData[0]) {
              const savedPair = pData[0];
              const newLocalNest: Nest = {
                id: savedPair.id.toString(),
                maleId: savedPair.male_id?.toString(),
                femaleId: savedPair.female_id?.toString(),
                pairName: savedPair.pair_name,
                firstEggDate: savedPair.start_date,
                status: 'Laying',
                eggsCount: 0,
                chicksCount: 0,
                ownerId: savedPair.user_id,
                eggs: []
              };
              setNests(prev => [newLocalNest, ...prev]);
              fetchNests();
            }
          }

          await addDoc(collection(db, 'nests'), {
            ownerId: userId || 'local',
            maleId: maleId || undefined,
            femaleId: femaleId || undefined,
            pairName: `${birdDataOnly.ringNumber} x ${partnerRingNumber}`,
            status: 'Laying',
            eggsCount: 0,
            chicksCount: 0,
            eggs: [],
            firstEggDate: new Date().toISOString().split('T')[0]
          });
        } catch (e) {
          console.error('Error creating pair:', e);
        }
      }
      
      setIsAddModalOpen(false);
      navigate('/dashboard/birds');
      fetchBirds();
    } catch (error) {
      console.error('Critical error in handleAddBird:', error);
      alert('Error: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const handleAddNest = async (newNest: Omit<Nest, 'id' | 'ownerId'>) => {
    const userId = user?.id || user?.uid;
    if (!userId) return;

    try {
      const ensureInt = (val: any) => {
        if (val === undefined || val === null || (Array.isArray(val) && val.length === 0)) return null;
        if (Array.isArray(val)) val = val[0];
        const num = parseInt(val);
        return isNaN(num) ? null : num;
      };

      if (isSupabaseConfigured && supabase) {
        const pairData = {
          user_id: userId,
          male_id: ensureInt(newNest.maleId),
          female_id: ensureInt(newNest.femaleId),
          pair_name: newNest.pairName,
          start_date: newNest.firstEggDate,
          status: 'active',
          eggs: [],
          eggs_count: 0,
          chicks_count: 0
        };

        let { data, error } = await withTimeout<any>(
          Promise.resolve(supabase
            .from('pairs')
            .insert([pairData])
            .select()),
          10000,
          'Supabase pair insert timed out'
        );
        
        if (error) {
          const fallbackPairData = {
            user_id: userId,
            male_id: pairData.male_id,
            female_id: pairData.female_id,
            pair_name: pairData.pair_name,
            start_date: pairData.start_date,
            status: pairData.status
          };
          const { data: fallbackData, error: fallbackError } = await withTimeout<any>(
            Promise.resolve(supabase
              .from('pairs')
              .insert([fallbackPairData])
              .select()),
            10000,
            'Supabase fallback pair insert timed out'
          );
          
          if (fallbackError) throw fallbackError;
          data = fallbackData;
        }
        
        if (data && data[0]) {
          const savedPair = data[0];
          const newLocalNest: Nest = {
            id: savedPair.id.toString(),
            maleId: savedPair.male_id?.toString(),
            femaleId: savedPair.female_id?.toString(),
            pairName: savedPair.pair_name,
            firstEggDate: savedPair.start_date,
            status: 'Laying',
            eggsCount: 0,
            chicksCount: 0,
            ownerId: savedPair.user_id,
            eggs: []
          };
          setNests(prev => [newLocalNest, ...prev]);
        }
        
        setIsAddNestModalOpen(false);
        fetchNests();
      } else {
        await addDoc(collection(db, 'nests'), {
          ...newNest,
          ownerId: userId,
          eggs: []
        });
        setIsAddNestModalOpen(false);
      }
    } catch (error) {
      console.error('Error in handleAddNest:', error);
    }
  };

  const handleUpdateNest = async (nestId: string, data: Partial<Nest>) => {
    try {
      const ensureInt = (val: any) => {
        if (val === undefined || val === null || (Array.isArray(val) && val.length === 0)) return null;
        if (Array.isArray(val)) val = val[0];
        const num = parseInt(val);
        return isNaN(num) ? null : num;
      };

      if (isSupabaseConfigured && supabase && user) {
        const supabaseData: any = {};
        if (data.maleId !== undefined) supabaseData.male_id = ensureInt(data.maleId);
        if (data.femaleId !== undefined) supabaseData.female_id = ensureInt(data.femaleId);
        if (data.pairName !== undefined) supabaseData.pair_name = data.pairName;
        if (data.status !== undefined) supabaseData.status = data.status;
        if (data.eggsCount !== undefined) supabaseData.eggs_count = data.eggsCount;
        if (data.chicksCount !== undefined) supabaseData.chicks_count = data.chicksCount;
        if (data.eggs !== undefined) supabaseData.eggs = data.eggs;
        if (data.firstEggDate !== undefined) supabaseData.start_date = data.firstEggDate;
        if (data.notes !== undefined) supabaseData.notes = data.notes;

        const { error } = await supabase
          .from('pairs')
          .update(supabaseData)
          .eq('id', isNaN(parseInt(nestId)) ? nestId : parseInt(nestId))
          .eq('user_id', user.uid);
        
        if (error) {
          console.error('Supabase pair update failed:', error);
          return;
        } else {
          fetchNests();
        }
      }

      setNests(prev => prev.map(n => n.id === nestId ? { ...n, ...data } : n));
      try {
        await updateDoc(doc(db, 'nests', nestId), data);
      } catch (e) {
        console.warn('Firestore update failed (optional):', e);
      }
    } catch (error) {
      console.error('Error in handleUpdateNest:', error);
    }
  };

  const handleAddMedicalRecord = async (newRecord: Omit<MedicalRecord, 'id' | 'ownerId'>) => {
    try {
      await addDoc(collection(db, 'medical'), {
        ...newRecord,
        ownerId: user.uid
      });
      setIsAddMedicalModalOpen(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'medical');
    }
  };

  const handleAddSupply = async (newItem: Omit<SupplyItem, 'id' | 'ownerId'>) => {
    try {
      await addDoc(collection(db, 'supplies'), {
        ...newItem,
        ownerId: user.uid
      });
      setIsAddSupplyModalOpen(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'supplies');
    }
  };

  const handleStatClick = (filter: string) => {
    if (filter === 'total' || filter === 'Male' || filter === 'Female') {
      navigate('/dashboard/birds');
    } else if (filter === 'pairs') {
      setActiveTab('nests');
      navigate('/dashboard/nests');
    }
  };

  const handleBirdClick = (id: string) => {
    setSelectedBirdId(id);
    setActiveTab('bird-profile');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <Sidebar 
        t={t}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        navigate={navigate}
        onLogout={onLogout}
        userProfile={userProfile}
      />

      <MobileNav 
        t={t}
        activeTab={activeTab}
        navigate={navigate}
      />

      <main className="flex-1 flex flex-col min-w-0 pb-24 lg:pb-0">
        <Header 
          t={t}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          isNotificationsOpen={isNotificationsOpen}
          setIsNotificationsOpen={setIsNotificationsOpen}
          user={user}
          userProfile={userProfile}
          setActiveTab={setActiveTab}
        />

        <div className="p-4 sm:p-10 max-w-7xl mx-auto w-full">
          {user?.email && !user?.emailVerified && !user?.uid?.startsWith('local-') && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-4 shadow-sm shadow-amber-100"
            >
              <div className="flex items-center gap-3 text-amber-800">
                <AlertCircle size={20} />
                <p className="text-sm font-semibold">{t('emailNotVerified') || 'Your email is not verified. Please check your inbox for a verification link.'}</p>
              </div>
              <Button 
                variant="ghost" 
                className="text-xs py-1.5 px-4 bg-white border border-amber-200 text-amber-700 hover:bg-amber-100"
                onClick={async () => {
                  try {
                    if (auth.currentUser) {
                      await sendEmailVerification(auth.currentUser);
                      alert(t('resetEmailSent'));
                    }
                  } catch (error) {
                    alert(t('authFailed'));
                  }
                }}
              >
                {t('resendEmail') || 'Resend Email'}
              </Button>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {activeTab === 'bird-profile' && selectedBirdId && (
              <BirdProfile 
                bird={birds.find(b => b.id === selectedBirdId)!} 
                onClose={() => setActiveTab('My Birds')}
                birds={birds}
                productionRecords={productionRecords.filter(r => r.birdId === selectedBirdId)}
                onUpdate={handleUpdateBird}
                onDelete={handleDeleteBird}
              />
            )}

            {activeTab === 'Dashboard' && (
              <OverviewTab 
                t={t}
                user={user}
                birds={birds}
                nests={nests}
                navigate={navigate}
                setActiveTab={setActiveTab}
                handleBirdClick={handleBirdClick}
              />
            )}

            {activeTab === 'My Birds' && (
              <BirdList 
                birds={birds}
                onBirdClick={handleBirdClick}
                onAddClick={() => setIsAddModalOpen(true)}
                searchQuery={searchTerm}
                setSearchQuery={setSearchTerm}
              />
            )}

            {activeTab === 'Couples' && (
              <NestsTab 
                t={t}
                nests={nests}
                birds={birds}
                setIsAddNestModalOpen={setIsAddNestModalOpen}
                setSelectedNestId={setSelectedNestId}
                isSupabaseConfigured={isSupabaseConfigured}
                supabase={supabase}
                fetchNests={fetchNests}
              />
            )}

            {activeTab === 'Marketplace' && (
              <MarketplaceTab 
                t={t}
                birds={birds}
                navigate={navigate}
              />
            )}

            {activeTab === 'medical' && (
              <MedicalTab 
                t={t}
                medicalRecords={medicalRecords}
                birds={birds}
                setIsAddMedicalModalOpen={setIsAddMedicalModalOpen}
              />
            )}

            {activeTab === 'Eggs' && (
              <HatchingTab 
                t={t}
                nests={nests}
                birds={birds}
              />
            )}

            {activeTab === 'supplies' && (
              <SuppliesTab 
                t={t}
                supplies={supplies}
                setIsAddSupplyModalOpen={setIsAddSupplyModalOpen}
              />
            )}

            {activeTab === 'AI Genetics' && (
              <GeneticsTab t={t} />
            )}

            {activeTab === 'pedigree' && (
              <PedigreeTab 
                t={t}
                birds={birds}
                pedigreeTargetId={pedigreeTargetId}
                setPedigreeTargetId={setPedigreeTargetId}
              />
            )}

            {activeTab === 'Settings' && (
              <SettingsTab 
                t={t}
                settingsData={settingsData}
                setSettingsData={setSettingsData}
                handleSaveSettings={handleSaveSettings}
                setActiveTab={setActiveTab}
                user={user}
              />
            )}

            {activeTab === 'Advice' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[2.5rem] p-8 sm:p-12 shadow-sm border border-slate-100"
              >
                <h2 className="text-3xl font-bold font-display mb-6">Breeding Advice</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-primary">Getting Started</h3>
                    <p className="text-slate-600 leading-relaxed">
                      Successful breeding starts with healthy, mature birds. Ensure your pairs are at least 12 months old and have been on a high-quality conditioning diet for at least 4 weeks before introducing nesting boxes.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-accent-gold">Nutrition</h3>
                    <p className="text-slate-600 leading-relaxed">
                      During the breeding season, increase calcium intake and provide soft foods daily. Fresh greens and sprouted seeds are essential for providing the vitamins needed for healthy egg development.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'About Us' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[2.5rem] p-8 sm:p-12 shadow-sm border border-slate-100"
              >
                <h2 className="text-3xl font-bold font-display mb-6">About PetsBird</h2>
                <p className="text-lg text-slate-600 leading-relaxed mb-8">
                  PetsBird is the world's leading aviary management platform, designed by breeders for breeders. Our mission is to simplify the complex task of tracking genetics, lineage, and production.
                </p>
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-slate-50 rounded-3xl">
                    <div className="text-2xl font-black text-primary mb-1">10k+</div>
                    <div className="text-xs font-bold text-slate-400 uppercase">Active Breeders</div>
                  </div>
                  <div className="text-center p-6 bg-slate-50 rounded-3xl">
                    <div className="text-2xl font-black text-primary mb-1">50k+</div>
                    <div className="text-xs font-bold text-slate-400 uppercase">Birds Tracked</div>
                  </div>
                  <div className="text-center p-6 bg-slate-50 rounded-3xl">
                    <div className="text-2xl font-black text-primary mb-1">100+</div>
                    <div className="text-xs font-bold text-slate-400 uppercase">Countries</div>
                  </div>
                </div>
              </motion.div>
            )}
            {activeTab === 'News' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[2.5rem] p-8 sm:p-12 shadow-sm border border-slate-100"
              >
                <h2 className="text-3xl font-bold font-display mb-6">Latest News</h2>
                <div className="space-y-6">
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <span className="text-xs font-bold text-primary uppercase tracking-widest">Update • April 2026</span>
                    <h3 className="text-xl font-bold mt-2 mb-3">New AI Genetics Engine v2.0</h3>
                    <p className="text-slate-600">We've updated our genetics engine to support more complex mutations and multi-generational predictions.</p>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <span className="text-xs font-bold text-primary uppercase tracking-widest">Community • March 2026</span>
                    <h3 className="text-xl font-bold mt-2 mb-3">Marketplace Expansion</h3>
                    <p className="text-slate-600">The PetsBird marketplace is now available in 15 new countries across Europe and Asia.</p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'Contact Us' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[2.5rem] p-8 sm:p-12 shadow-sm border border-slate-100"
              >
                <h2 className="text-3xl font-bold font-display mb-6">Contact Us</h2>
                <div className="max-w-xl">
                  <p className="text-lg text-slate-600 mb-8">Have questions or need support? Our team is here to help you manage your aviary better.</p>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                        <Mail className="text-primary" />
                      </div>
                      <div>
                        <div className="text-sm font-bold">Email Support</div>
                        <div className="text-slate-500">support@petsbird.com</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                        <Info className="text-primary" />
                      </div>
                      <div>
                        <div className="text-sm font-bold">Help Center</div>
                        <div className="text-slate-500">help.petsbird.com</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <DashboardModals 
            isAddModalOpen={isAddModalOpen}
            setIsAddModalOpen={setIsAddModalOpen}
            location={location}
            navigate={navigate}
            handleAddBird={handleAddBird}
            birds={birds}
            nests={nests}
            isAddNestModalOpen={isAddNestModalOpen}
            setIsAddNestModalOpen={setIsAddNestModalOpen}
            handleAddNest={handleAddNest}
            isAddMedicalModalOpen={isAddMedicalModalOpen}
            setIsAddMedicalModalOpen={setIsAddMedicalModalOpen}
            handleAddMedicalRecord={handleAddMedicalRecord}
            isAddSupplyModalOpen={isAddSupplyModalOpen}
            setIsAddSupplyModalOpen={setIsAddSupplyModalOpen}
            handleAddSupply={handleAddSupply}
            selectedNestId={selectedNestId}
            setSelectedNestId={setSelectedNestId}
            handleUpdateNest={handleUpdateNest}
          />
        </div>
      </main>
    </div>
  );
};
