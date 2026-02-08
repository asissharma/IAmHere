import React, { useState, useEffect, useRef } from 'react';
import { FiPlay, FiPause, FiRefreshCcw } from 'react-icons/fi';
import { motion } from 'framer-motion'; // Importing Framer Motion

const PomodoroTimer: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1500); // 25 minutes in seconds
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  // Set initial position after the component mounts (only runs on the client side)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPosition({ top: window.innerHeight - 545, left: window.innerWidth - 170 });
    }
  }, []);

  // Drag functionality
  const handleDrag = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const shiftX = e.clientX - position.left;
    const shiftY = e.clientY - position.top;

    const moveAt = (pageX: number, pageY: number) => {
      setPosition({ top: pageY - shiftY, left: pageX - shiftX });
    };

    const onMouseMove = (e: MouseEvent) => {
      moveAt(e.pageX, e.pageY);
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  // Timer logic
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 0) {
            clearInterval(timerRef.current!);
            setIsActive(false); // Stop the timer when it reaches 0
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current!);
    }

    return () => clearInterval(timerRef.current!);
  }, [isActive]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleStartPause = () => {
    setIsActive(!isActive); // Toggle start/pause
  };

  const handleReset = () => {
    setIsActive(false);
    setTimeLeft(1500); // Reset to 25 minutes
  };

  return (
    <motion.div
      className="fixed pomodoroTimer p-2 bg-white border rounded-lg shadow-lg cursor-move flex items-center justify-between"
      style={{ top: `${position.top}px`, left: `${position.left}px`}} // Compact design
      onMouseDown={handleDrag}
      initial={{ opacity: 0, scale: 0.5 }} // Initial animation state
      animate={{ opacity: 1, scale: 1 }} // Animate to visible and full size
      transition={{ duration: 0.5, ease: 'easeOut' }} // Animation duration and ease
    >
      {/* Time Display */}
      <div className="text-sm font-bold mr-3">{formatTime(timeLeft)}</div>

      {/* Inline Controls */}
      <div className="flex items-center space-x-2">
        <motion.button
          onClick={handleStartPause}
          className="text-lg p-0.5 rounded-md transition bg-gray-200 hover:bg-gray-300 text-black"
          whileHover={{ scale: 1.1 }} // Scale up on hover
          whileTap={{ scale: 0.95 }} // Scale down slightly on click
        >
          {isActive ? <FiPause /> : <FiPlay />}
        </motion.button>
        <motion.button
          onClick={handleReset}
          className="text-lg p-0.5 rounded-md transition bg-gray-200 hover:bg-gray-300 text-black"
          whileHover={{ scale: 1.1 }} // Scale up on hover
          whileTap={{ scale: 0.95 }} // Scale down slightly on click
        >
          <FiRefreshCcw />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default PomodoroTimer;
