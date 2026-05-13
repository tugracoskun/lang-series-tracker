import { motion } from 'framer-motion';

const pageVariants = {
    initial: {
        opacity: 0,
        y: 12,
        filter: 'blur(6px)',
    },
    animate: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        transition: {
            duration: 0.35,
            ease: [0.25, 0.1, 0.25, 1],
            staggerChildren: 0.06,
        },
    },
    exit: {
        opacity: 0,
        y: -8,
        filter: 'blur(4px)',
        transition: {
            duration: 0.2,
            ease: [0.25, 0.1, 0.25, 1],
        },
    },
};

const PageTransition = ({ children, className = '' }) => {
    return (
        <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={className}
        >
            {children}
        </motion.div>
    );
};

export default PageTransition;
