import React from "react";
import { motion } from "framer-motion";
import { FaRocket, FaBook, FaLightbulb, FaStar } from "react-icons/fa";

interface EmptyStateProps {
    title: string;
    description: string;
    icon?: React.ReactNode;
    action?: {
        label: string;
        onClick: () => void;
    };
}

const EmptyState: React.FC<EmptyStateProps> = ({ title, description, icon, action }) => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-gradient-to-br from-purple-50/40 via-blue-50/30 to-pink-50/40 dark:from-gray-950 dark:via-purple-950/20 dark:to-gray-950 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        y: [0, -20, 0],
                        rotate: [0, 5, 0],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute top-20 left-10 w-32 h-32 bg-purple-200/20 dark:bg-purple-500/10 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{
                        y: [0, 20, 0],
                        rotate: [0, -5, 0],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1
                    }}
                    className="absolute bottom-20 right-10 w-40 h-40 bg-blue-200/20 dark:bg-blue-500/10 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 2
                    }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-200/10 dark:bg-pink-500/5 rounded-full blur-3xl"
                />
            </div>

            {/* Floating Icons */}
            <div className="absolute inset-0 pointer-events-none">
                <motion.div
                    animate={{
                        y: [0, -15, 0],
                        x: [0, 10, 0],
                    }}
                    transition={{
                        duration: 7,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute top-1/4 left-1/4 text-purple-300/30 dark:text-purple-600/20"
                >
                    <FaStar size={24} />
                </motion.div>
                <motion.div
                    animate={{
                        y: [0, 15, 0],
                        x: [0, -10, 0],
                    }}
                    transition={{
                        duration: 9,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1
                    }}
                    className="absolute top-1/3 right-1/4 text-blue-300/30 dark:text-blue-600/20"
                >
                    <FaLightbulb size={28} />
                </motion.div>
                <motion.div
                    animate={{
                        y: [0, -12, 0],
                        rotate: [0, 15, 0],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 2
                    }}
                    className="absolute bottom-1/3 left-1/3 text-pink-300/30 dark:text-pink-600/20"
                >
                    <FaBook size={22} />
                </motion.div>
            </div>

            {/* Main Content */}
            <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{
                    duration: 0.8,
                    ease: [0.34, 1.56, 0.64, 1],
                    delay: 0.1
                }}
                className="relative z-10 max-w-lg"
            >
                {/* Icon Container with Gradient Border */}
                <motion.div
                    animate={{
                        rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="relative mb-8 inline-block"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-blue-500 to-pink-500 rounded-3xl blur-xl opacity-40"></div>
                    <div className="relative p-8 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-purple-100 dark:border-purple-900/50">
                        <motion.div
                            animate={{
                                scale: [1, 1.1, 1],
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="text-6xl bg-gradient-to-br from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent"
                        >
                            {icon || <FaRocket className="text-purple-600" />}
                        </motion.div>
                    </div>
                </motion.div>

                {/* Text Content */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                >
                    <h3 className="text-3xl font-black mb-4 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent leading-tight">
                        {title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed mb-8 max-w-md mx-auto">
                        {description}
                    </p>
                </motion.div>

                {/* Action Button */}
                {action && (
                    <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={action.onClick}
                        className="group relative px-8 py-3.5 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 text-white font-bold rounded-xl shadow-lg hover:shadow-2xl transition-all overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <span className="relative z-10 flex items-center gap-2">
                            {action.label}
                            <motion.span
                                animate={{ x: [0, 4, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            >
                                →
                            </motion.span>
                        </span>
                    </motion.button>
                )}

                {/* Decorative Elements */}
                <div className="mt-12 flex justify-center gap-2">
                    {[...Array(3)].map((_, i) => (
                        <motion.div
                            key={i}
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.3, 0.6, 0.3],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: i * 0.3,
                            }}
                            className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-blue-400"
                        />
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

export default EmptyState;
