import React from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void; // Function type for the onClose prop
  content: string | null; // Content can be a string or null
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, content }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-4 w-1/2">
        <button className="text-red-500 float-right" onClick={onClose}>
          Close
        </button>
        <div className="overflow-auto max-h-96">
          <h2 className="text-xl mb-4">Content</h2>
          <pre>{content}</pre>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
