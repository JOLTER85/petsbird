import React from 'react';
import { AnimatePresence } from 'motion/react';
import { AddBirdModal } from '../AddBird';
import { AddNestModal } from '../AddNestModal';
import { AddMedicalModal } from '../AddMedicalModal';
import { AddSupplyModal } from '../AddSupplyModal';
import { NestDetailsModal } from '../NestDetailsModal';
import { Bird, Nest } from '../../types';

interface DashboardModalsProps {
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
  location: any;
  navigate: any;
  handleAddBird: (bird: any) => void;
  birds: Bird[];
  nests: Nest[];
  isAddNestModalOpen: boolean;
  setIsAddNestModalOpen: (open: boolean) => void;
  handleAddNest: (nest: any) => void;
  isAddMedicalModalOpen: boolean;
  setIsAddMedicalModalOpen: (open: boolean) => void;
  handleAddMedicalRecord: (record: any) => void;
  isAddSupplyModalOpen: boolean;
  setIsAddSupplyModalOpen: (open: boolean) => void;
  handleAddSupply: (supply: any) => void;
  selectedNestId: string | null;
  setSelectedNestId: (id: string | null) => void;
  handleUpdateNest: (nest: any) => void;
}

export const DashboardModals: React.FC<DashboardModalsProps> = ({
  isAddModalOpen,
  setIsAddModalOpen,
  location,
  navigate,
  handleAddBird,
  birds,
  nests,
  isAddNestModalOpen,
  setIsAddNestModalOpen,
  handleAddNest,
  isAddMedicalModalOpen,
  setIsAddMedicalModalOpen,
  handleAddMedicalRecord,
  isAddSupplyModalOpen,
  setIsAddSupplyModalOpen,
  handleAddSupply,
  selectedNestId,
  setSelectedNestId,
  handleUpdateNest,
}) => {
  return (
    <>
      <AnimatePresence>
        {isAddModalOpen && (
          <AddBirdModal 
            isOpen={isAddModalOpen} 
            onClose={() => {
              setIsAddModalOpen(false);
              if (location.pathname === '/dashboard/add-bird') {
                navigate(-1);
              }
            }} 
            onAdd={handleAddBird}
            birds={birds}
            nests={nests}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAddNestModalOpen && (
          <AddNestModal 
            isOpen={isAddNestModalOpen} 
            onClose={() => setIsAddNestModalOpen(false)} 
            onAdd={handleAddNest}
            birds={birds}
            nests={nests}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAddMedicalModalOpen && (
          <AddMedicalModal 
            isOpen={isAddMedicalModalOpen} 
            onClose={() => setIsAddMedicalModalOpen(false)} 
            onAdd={handleAddMedicalRecord}
            birds={birds}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAddSupplyModalOpen && (
          <AddSupplyModal 
            isOpen={isAddSupplyModalOpen} 
            onClose={() => setIsAddSupplyModalOpen(false)} 
            onAdd={handleAddSupply}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedNestId && nests.find(n => n.id === selectedNestId) && (
          <NestDetailsModal 
            isOpen={!!selectedNestId} 
            onClose={() => setSelectedNestId(null)} 
            nest={nests.find(n => n.id === selectedNestId)!}
            birds={birds}
            onUpdate={handleUpdateNest}
          />
        )}
      </AnimatePresence>
    </>
  );
};
