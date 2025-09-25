import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./dialog"

interface BaseModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

const BaseModal: React.FC<BaseModalProps> = ({ isOpen, onClose, title, children }) => {
  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent>
        {title && (
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
        )}
        {children}
      </DialogContent>
    </Dialog>
  )
}

export { BaseModal }
