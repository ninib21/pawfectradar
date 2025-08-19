import React, { createContext, useContext, useReducer, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

// State interfaces
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'owner' | 'sitter';
  trustScore: number;
  isVerified: boolean;
  profileImage?: string;
  phoneNumber?: string;
  address?: Address;
}

interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

interface Pet {
  id: string;
  name: string;
  type: 'dog' | 'cat' | 'bird' | 'fish' | 'other';
  breed: string;
  age: number;
  weight: number;
  healthInfo: string;
  specialNeeds: string[];
  images: string[];
  ownerId: string;
}

interface Booking {
  id: string;
  petId: string;
  sitterId: string;
  ownerId: string;
  startTime: Date;
  endTime: Date;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  totalPrice: number;
  services: string[];
  specialInstructions: string;
  location: Address;
  quantumToken: string;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  quantumEncrypted: boolean;
}

interface AppState {
  user: User | null;
  pets: Pet[];
  bookings: Booking[];
  messages: Message[];
  notifications: Notification[];
  isLoading: boolean;
  error: string | null;
  quantumToken: string | null;
  isOffline: boolean;
  lastSync: Date | null;
}

// Action types
type Action =
  | { type: 'SET_USER'; payload: User }
  | { type: 'CLEAR_USER' }
  | { type: 'SET_PETS'; payload: Pet[] }
  | { type: 'ADD_PET'; payload: Pet }
  | { type: 'UPDATE_PET'; payload: Pet }
  | { type: 'DELETE_PET'; payload: string }
  | { type: 'SET_BOOKINGS'; payload: Booking[] }
  | { type: 'ADD_BOOKING'; payload: Booking }
  | { type: 'UPDATE_BOOKING'; payload: Booking }
  | { type: 'SET_MESSAGES'; payload: Message[] }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_QUANTUM_TOKEN'; payload: string }
  | { type: 'SET_OFFLINE'; payload: boolean }
  | { type: 'SET_LAST_SYNC'; payload: Date }
  | { type: 'CLEAR_STATE' };

// Initial state
const initialState: AppState = {
  user: null,
  pets: [],
  bookings: [],
  messages: [],
  notifications: [],
  isLoading: false,
  error: null,
  quantumToken: null,
  isOffline: false,
  lastSync: null,
};

// Reducer
const quantumReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'CLEAR_USER':
      return { ...state, user: null };
    case 'SET_PETS':
      return { ...state, pets: action.payload };
    case 'ADD_PET':
      return { ...state, pets: [...state.pets, action.payload] };
    case 'UPDATE_PET':
      return {
        ...state,
        pets: state.pets.map(pet => 
          pet.id === action.payload.id ? action.payload : pet
        ),
      };
    case 'DELETE_PET':
      return {
        ...state,
        pets: state.pets.filter(pet => pet.id !== action.payload),
      };
    case 'SET_BOOKINGS':
      return { ...state, bookings: action.payload };
    case 'ADD_BOOKING':
      return { ...state, bookings: [...state.bookings, action.payload] };
    case 'UPDATE_BOOKING':
      return {
        ...state,
        bookings: state.bookings.map(booking => 
          booking.id === action.payload.id ? action.payload : booking
        ),
      };
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_QUANTUM_TOKEN':
      return { ...state, quantumToken: action.payload };
    case 'SET_OFFLINE':
      return { ...state, isOffline: action.payload };
    case 'SET_LAST_SYNC':
      return { ...state, lastSync: action.payload };
    case 'CLEAR_STATE':
      return initialState;
    default:
      return state;
  }
};

// Context
interface QuantumStateContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  // Convenience methods
  setUser: (user: User) => void;
  clearUser: () => void;
  addPet: (pet: Pet) => void;
  updatePet: (pet: Pet) => void;
  deletePet: (petId: string) => void;
  addBooking: (booking: Booking) => void;
  updateBooking: (booking: Booking) => void;
  addMessage: (message: Message) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setQuantumToken: (token: string) => void;
  clearState: () => void;
  // Persistence methods
  saveToStorage: () => Promise<void>;
  loadFromStorage: () => Promise<void>;
  clearStorage: () => Promise<void>;
}

const QuantumStateContext = createContext<QuantumStateContextType | undefined>(undefined);

export const useQuantumState = () => {
  const context = useContext(QuantumStateContext);
  if (!context) {
    throw new Error('useQuantumState must be used within a QuantumStateProvider');
  }
  return context;
};

export const QuantumStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(quantumReducer, initialState);

  useEffect(() => {
    loadFromStorage();
  }, []);

  // Convenience methods
  const setUser = (user: User) => {
    dispatch({ type: 'SET_USER', payload: user });
  };

  const clearUser = () => {
    dispatch({ type: 'CLEAR_USER' });
  };

  const addPet = (pet: Pet) => {
    dispatch({ type: 'ADD_PET', payload: pet });
  };

  const updatePet = (pet: Pet) => {
    dispatch({ type: 'UPDATE_PET', payload: pet });
  };

  const deletePet = (petId: string) => {
    dispatch({ type: 'DELETE_PET', payload: petId });
  };

  const addBooking = (booking: Booking) => {
    dispatch({ type: 'ADD_BOOKING', payload: booking });
  };

  const updateBooking = (booking: Booking) => {
    dispatch({ type: 'UPDATE_BOOKING', payload: booking });
  };

  const addMessage = (message: Message) => {
    dispatch({ type: 'ADD_MESSAGE', payload: message });
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const setError = (error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const setQuantumToken = (token: string) => {
    dispatch({ type: 'SET_QUANTUM_TOKEN', payload: token });
  };

  const clearState = () => {
    dispatch({ type: 'CLEAR_STATE' });
  };

  // Persistence methods
  const saveToStorage = async () => {
    try {
      const dataToSave = {
        user: state.user,
        pets: state.pets,
        bookings: state.bookings,
        messages: state.messages,
        quantumToken: state.quantumToken,
        lastSync: state.lastSync,
      };
      await SecureStore.setItemAsync('quantum_state', JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Error saving state to storage:', error);
    }
  };

  const loadFromStorage = async () => {
    try {
      const stored = await SecureStore.getItemAsync('quantum_state');
      if (stored) {
        const data = JSON.parse(stored);
        if (data.user) dispatch({ type: 'SET_USER', payload: data.user });
        if (data.pets) dispatch({ type: 'SET_PETS', payload: data.pets });
        if (data.bookings) dispatch({ type: 'SET_BOOKINGS', payload: data.bookings });
        if (data.messages) dispatch({ type: 'SET_MESSAGES', payload: data.messages });
        if (data.quantumToken) dispatch({ type: 'SET_QUANTUM_TOKEN', payload: data.quantumToken });
        if (data.lastSync) dispatch({ type: 'SET_LAST_SYNC', payload: new Date(data.lastSync) });
      }
    } catch (error) {
      console.error('Error loading state from storage:', error);
    }
  };

  const clearStorage = async () => {
    try {
      await SecureStore.deleteItemAsync('quantum_state');
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  };

  // Auto-save state changes
  useEffect(() => {
    saveToStorage();
  }, [state.user, state.pets, state.bookings, state.messages, state.quantumToken]);

  const value: QuantumStateContextType = {
    state,
    dispatch,
    setUser,
    clearUser,
    addPet,
    updatePet,
    deletePet,
    addBooking,
    updateBooking,
    addMessage,
    setLoading,
    setError,
    setQuantumToken,
    clearState,
    saveToStorage,
    loadFromStorage,
    clearStorage,
  };

  return (
    <QuantumStateContext.Provider value={value}>
      {children}
    </QuantumStateContext.Provider>
  );
};
