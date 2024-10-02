import React, { useState } from 'react';
import { FaExpand, FaCompress, FaUndoAlt, FaExternalLinkAlt } from 'react-icons/fa';

interface ResizableCardProps {
    children: React.ReactNode; // Content inside the card
}

const ResizableCard: React.FC<ResizableCardProps> = ({ children }) => {
    const [isScaled, setIsScaled] = useState(false);
    const [isFullSize, setIsFullSize] = useState(false);

    const handleScale = () => {
        setIsScaled(!isScaled);
        if (isFullSize) setIsFullSize(false); // Reset full size if card is scaled
    };

    const handleFullSize = () => {
        setIsFullSize(!isFullSize);
        if (isScaled) setIsScaled(false); // Reset scale if card is full size
    };

    return (
        <div 
            className={`resizable-card transition-transform duration-500 ease-in-out 
                ${isScaled ? 'resizable-card--scaled' : ''} 
                ${isFullSize ? 'resizable-card--fullsize' : ''}`}
        >
            <div className="resizable-card__content">
                {children}
            </div>
            <div className="resizable-card__buttons flex space-x-2 justify-end">
                <button 
                    className="resizable-card__button bg-blue-500 text-white py-1 px-3 rounded-md hover:bg-blue-600 transition-colors duration-300 flex items-center"
                    onClick={handleScale}
                >
                    {isScaled ? <FaUndoAlt /> : <FaExternalLinkAlt />}
                </button>
                <button 
                    className="resizable-card__button bg-green-500 text-white py-1 px-3 rounded-md hover:bg-green-600 transition-colors duration-300 flex items-center"
                    onClick={handleFullSize}
                >
                    {isFullSize ? <FaCompress /> : <FaExpand />}
                </button>
            </div>
        </div>
    );
};

export default ResizableCard;
