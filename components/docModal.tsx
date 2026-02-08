import React from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string | null;
  isUrl: boolean; // Indicate if content is a URL
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, content, isUrl }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-4 w-11/12 md:w-2/3 lg:w-1/2 relative overflow-hidden">
        <button className="text-red-500 absolute top-2 right-2" onClick={onClose}>
          ✖
        </button>
        
        <div className="overflow-auto ">
          <h2 className="text-xl mb-4">Content</h2>
          {isUrl && content ? ( // Check if content is a URL
            <iframe
              src={content}
              title="Webview"
              className="w-full h-96 border-0 rounded"
              sandbox="allow-same-origin allow-scripts allow-popups"
            />
          ) : (
            <pre>{content}</pre> // Render the content directly if it's not a URL
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
