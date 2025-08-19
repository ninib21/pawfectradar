import React, { useState, useEffect } from "react";
import { Pet, User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import AddPetForm from "../components/pets/AddPetForm";
import PetCard from "../components/pets/PetCard";
import EmptyState from "../components/pets/EmptyState";

export default function Pets() {
  const [pets, setPets] = useState([]);
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPet, setEditingPet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserAndPets();
  }, []);

  const loadUserAndPets = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      const userPets = await Pet.filter({ owner_id: currentUser.id });
      setPets(userPets);
    } catch (error) {
      console.error("Error loading pets:", error);
    }
    setLoading(false);
  };

  const handleSubmit = async (petData) => {
    try {
      if (editingPet) {
        await Pet.update(editingPet.id, petData);
      } else {
        await Pet.create({
          ...petData,
          owner_id: user.id
        });
      }
      
      setShowForm(false);
      setEditingPet(null);
      loadUserAndPets();
    } catch (error) {
      console.error("Error saving pet:", error);
    }
  };

  const handleEdit = (pet) => {
    setEditingPet(pet);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingPet(null);
  };

  const handleAddPet = () => {
    setEditingPet(null);
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A2D4F5]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Pets</h1>
          <p className="text-gray-600 mt-2">
            Manage your furry family members and their care information
          </p>
        </div>
        <Button
          onClick={handleAddPet}
          className="bg-gradient-to-r from-[#A2D4F5] to-[#FBC3D2] hover:from-[#7DB9E8] to-[#F8A7C0] text-white border-0 shadow-lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add New Pet
        </Button>
      </div>

      {/* Add/Edit Pet Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <AddPetForm
              pet={editingPet}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isEditing={!!editingPet}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pets Grid */}
      {pets.length === 0 && !showForm ? (
        <EmptyState onAddPet={handleAddPet} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {pets.map((pet) => (
              <motion.div
                key={pet.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <PetCard pet={pet} onEdit={handleEdit} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}