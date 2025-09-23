/**
 * Custom hook for managing multiple modal states in admin interfaces
 * Consolidates duplicate useState patterns for cleaner component code
 * 
 * Replaces 8+ individual useState calls with a single hook
 */

import { useState, useCallback, useMemo } from 'react'

export interface ModalStates {
  showForm: boolean           // Generic form modal (was showQuizForm)
  showQuizForm: boolean       // Backward compatibility - deprecated
  showDeleteModal: boolean  
  showViewModal: boolean
  showAddModal: boolean       // New: for Add operations
  showCategoryManagement: boolean
  showAnalytics: boolean
  showBulkOperations: boolean
  showCategoryDropdown: boolean
}

export interface ModalData<T = any> {
  // Generic field names
  editingItem: T | null       // Generic editing item
  deletingItem: T | null      // Generic deleting item  
  viewingItem: T | null       // Generic viewing item
  addingItem: boolean         // Tracks if in adding mode
  
  // Backward compatibility - deprecated
  editingQuiz: T | null
  deletingQuiz: T | null
  viewingQuiz: T | null
}

export interface ModalActions {
  openModal: (modalName: keyof ModalStates, data?: any) => void
  closeModal: (modalName: keyof ModalStates) => void
  closeAllModals: () => void
  toggleModal: (modalName: keyof ModalStates) => void
  setBulkOperations: (show: boolean) => void // Special handler for bulk operations
}

const initialModalStates: ModalStates = {
  showForm: false,
  showQuizForm: false,        // Backward compatibility - deprecated
  showDeleteModal: false,
  showViewModal: false, 
  showAddModal: false,        // New: for Add operations
  showCategoryManagement: false,
  showAnalytics: false,
  showBulkOperations: false,
  showCategoryDropdown: false
}

const initialModalData: ModalData = {
  // Generic field names
  editingItem: null,
  deletingItem: null,
  viewingItem: null,
  addingItem: false,
  
  // Backward compatibility - deprecated
  editingQuiz: null,
  deletingQuiz: null,
  viewingQuiz: null
}

export const useAdminModals = <T = any>() => {
  const [modalStates, setModalStates] = useState<ModalStates>(initialModalStates)
  const [modalData, setModalData] = useState<ModalData<T>>(initialModalData)

  const openModal = useCallback((modalName: keyof ModalStates, data?: T) => {
    setModalStates(prev => ({ ...prev, [modalName]: true }))
    
    // Handle backward compatibility for showQuizForm
    if (modalName === 'showQuizForm') {
      setModalStates(prev => ({ ...prev, showForm: true }))
    }
    if (modalName === 'showForm') {
      setModalStates(prev => ({ ...prev, showQuizForm: true }))
    }
    
    // Set associated data based on modal type
    if (data) {
      if (modalName === 'showQuizForm' || modalName === 'showForm') {
        setModalData(prev => ({ 
          ...prev, 
          editingItem: data,
          editingQuiz: data  // Backward compatibility
        }))
      } else if (modalName === 'showDeleteModal') {
        setModalData(prev => ({ 
          ...prev, 
          deletingItem: data,
          deletingQuiz: data  // Backward compatibility
        }))
      } else if (modalName === 'showViewModal') {
        setModalData(prev => ({ 
          ...prev, 
          viewingItem: data,
          viewingQuiz: data  // Backward compatibility
        }))
      }
    }
    
    // Handle add modal (no data, just set adding flag)
    if (modalName === 'showAddModal') {
      setModalData(prev => ({ ...prev, addingItem: true }))
    }
  }, [])

  const closeModal = useCallback((modalName: keyof ModalStates) => {
    setModalStates(prev => ({ ...prev, [modalName]: false }))
    
    // Handle backward compatibility for showQuizForm
    if (modalName === 'showQuizForm') {
      setModalStates(prev => ({ ...prev, showForm: false }))
    }
    if (modalName === 'showForm') {
      setModalStates(prev => ({ ...prev, showQuizForm: false }))
    }
    
    // Clear associated data when closing
    if (modalName === 'showQuizForm' || modalName === 'showForm') {
      setModalData(prev => ({ 
        ...prev, 
        editingItem: null,
        editingQuiz: null  // Backward compatibility
      }))
    } else if (modalName === 'showDeleteModal') {
      setModalData(prev => ({ 
        ...prev, 
        deletingItem: null,
        deletingQuiz: null  // Backward compatibility
      }))
    } else if (modalName === 'showViewModal') {
      setModalData(prev => ({ 
        ...prev, 
        viewingItem: null,
        viewingQuiz: null  // Backward compatibility
      }))
    } else if (modalName === 'showAddModal') {
      setModalData(prev => ({ ...prev, addingItem: false }))
    }
  }, [])

  const closeAllModals = useCallback(() => {
    setModalStates(initialModalStates)
    setModalData(initialModalData)
  }, [])

  const toggleModal = useCallback((modalName: keyof ModalStates) => {
    setModalStates(prev => ({ ...prev, [modalName]: !prev[modalName] }))
  }, [])

  const setBulkOperations = useCallback((show: boolean) => {
    setModalStates(prev => ({ ...prev, showBulkOperations: show }))
  }, [])

  const actions: ModalActions = useMemo(() => ({
    openModal,
    closeModal, 
    closeAllModals,
    toggleModal,
    setBulkOperations
  }), [openModal, closeModal, closeAllModals, toggleModal, setBulkOperations])

  return {
    modalStates,
    modalData,
    actions,
    // Convenience getters
    isAnyModalOpen: Object.values(modalStates).some(Boolean),
    openModalCount: Object.values(modalStates).filter(Boolean).length
  }
}

export default useAdminModals