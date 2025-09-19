/**
 * Custom hook for managing multiple modal states in admin interfaces
 * Consolidates duplicate useState patterns for cleaner component code
 * 
 * Replaces 8+ individual useState calls with a single hook
 */

import { useState, useCallback, useMemo } from 'react'

export interface ModalStates {
  showQuizForm: boolean
  showDeleteModal: boolean  
  showViewModal: boolean
  showCategoryManagement: boolean
  showAnalytics: boolean
  showBulkOperations: boolean
  showCategoryDropdown: boolean
}

export interface ModalData<T = any> {
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
  showQuizForm: false,
  showDeleteModal: false,
  showViewModal: false, 
  showCategoryManagement: false,
  showAnalytics: false,
  showBulkOperations: false,
  showCategoryDropdown: false
}

const initialModalData: ModalData = {
  editingQuiz: null,
  deletingQuiz: null,
  viewingQuiz: null
}

export const useAdminModals = <T = any>() => {
  const [modalStates, setModalStates] = useState<ModalStates>(initialModalStates)
  const [modalData, setModalData] = useState<ModalData<T>>(initialModalData)

  const openModal = useCallback((modalName: keyof ModalStates, data?: T) => {
    setModalStates(prev => ({ ...prev, [modalName]: true }))
    
    // Set associated data based on modal type
    if (data) {
      if (modalName === 'showQuizForm') {
        setModalData(prev => ({ ...prev, editingQuiz: data }))
      } else if (modalName === 'showDeleteModal') {
        setModalData(prev => ({ ...prev, deletingQuiz: data }))
      } else if (modalName === 'showViewModal') {
        setModalData(prev => ({ ...prev, viewingQuiz: data }))
      }
    }
  }, [])

  const closeModal = useCallback((modalName: keyof ModalStates) => {
    setModalStates(prev => ({ ...prev, [modalName]: false }))
    
    // Clear associated data when closing
    if (modalName === 'showQuizForm') {
      setModalData(prev => ({ ...prev, editingQuiz: null }))
    } else if (modalName === 'showDeleteModal') {
      setModalData(prev => ({ ...prev, deletingQuiz: null }))
    } else if (modalName === 'showViewModal') {
      setModalData(prev => ({ ...prev, viewingQuiz: null }))
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