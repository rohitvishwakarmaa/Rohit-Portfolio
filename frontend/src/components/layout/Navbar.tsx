import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Sparkles } from 'lucide-react'

const NAV_LINKS = [
  { label: 'Home', href: '/', hash: false },
  { label: 'Portfolio', href: '/portfolio', hash: false },
  { label: 'About', href: '/#about', hash: true },
  { label: 'Contact', href: '/#contact', hash: true },
]

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location])

  const isActive = (href: string, hash: boolean) => {
    if (hash) return false // hash-only links are never 'active'
    return href === '/' ? location.pathname === '/' : location.pathname.startsWith(href)
  }

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'py-3 bg-white/90 backdrop-blur-xl shadow-[0_2px_30px_rgba(0,0,0,0.08)] border-b border-gray-100'
            : 'py-5 bg-transparent'
        }`}
      >
        <div className="container-xl flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #F77F00, #FF4D6D)' }}>
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-lg text-gray-900 group-hover:text-brand-orange transition-colors">
              Rohit<span className="gradient-text">.</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => {
            const active = isActive(link.href, link.hash)
            const cls = `text-sm font-medium transition-all duration-200 relative group ${
              active ? 'text-brand-orange' : 'text-gray-600 hover:text-gray-900'
            }`
            const underline = `absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-brand-orange to-brand-pink transition-all duration-300 ${
              active ? 'w-full' : 'w-0 group-hover:w-full'
            }`
            return link.hash ? (
              <a key={link.href} href={link.href} className={cls}>
                {link.label}
                <span className={underline} />
              </a>
            ) : (
              <Link key={link.href} to={link.href} className={cls}>
                {link.label}
                <span className={underline} />
              </Link>
            )
          })}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/portfolio"
              className="btn-primary text-sm py-2.5 px-5"
            >
              View Work
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed inset-0 z-40 bg-white flex flex-col pt-24 px-6 gap-8 md:hidden"
          >
            {NAV_LINKS.map((link, i) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
              >
                {link.hash ? (
                  <a
                    href={link.href}
                    className="text-3xl font-display font-bold text-gray-900"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    to={link.href}
                    className={`text-3xl font-display font-bold ${
                      isActive(link.href, false) ? 'gradient-text' : 'text-gray-900'
                    }`}
                  >
                    {link.label}
                  </Link>
                )}
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
            >
              <Link to="/portfolio" className="btn-primary w-fit">
                View Work
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
