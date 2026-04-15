import { motion } from 'framer-motion'
import { Navbar } from './Navbar'
import { Footer } from './Footer'

interface PageWrapperProps {
  children: React.ReactNode
  hideFooter?: boolean
}

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
}

export const PageWrapper = ({ children, hideFooter = false }: PageWrapperProps) => {
  return (
    <>
      <Navbar />
      <motion.main
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="min-h-screen"
      >
        {children}
      </motion.main>
      {!hideFooter && <Footer />}
    </>
  )
}
