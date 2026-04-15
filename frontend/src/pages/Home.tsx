import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowRight, Play, Sparkles, Zap, Mic, Film, Video, CheckCircle, AlertCircle } from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { VideoCard } from '@/components/video/VideoCard'
import { portfolioService } from '@/services/portfolioService'
import { contactService } from '@/services/contactService'
import type { Video as VideoType } from '@/types'

gsap.registerPlugin(ScrollTrigger)

// ─── Services data ────────────────────────────────────────────────────────────
const SERVICES = [
  {
    icon: Film,
    title: 'AI Ad Creation',
    description: 'Data-driven, visually stunning ads built end-to-end with AI — from concept to final cut.',
    color: 'from-orange-400 to-pink-500',
    bg: '#FFF3E0',
    iconColor: '#F77F00',
  },
  {
    icon: Video,
    title: 'AI Video Editing',
    description: 'Smart cuts, color grading, transitions, and effects powered by AI precision.',
    color: 'from-purple-500 to-pink-500',
    bg: '#F3E5F5',
    iconColor: '#7B2CBF',
  },
  {
    icon: Mic,
    title: 'AI Voiceovers',
    description: 'Natural, expressive AI voices in multiple languages, perfectly synced to your content.',
    color: 'from-pink-400 to-rose-500',
    bg: '#FCE4EC',
    iconColor: '#FF4D6D',
  },
  {
    icon: Sparkles,
    title: 'AI Storytelling',
    description: 'From script to screen — emotionally driven narratives crafted with AI storytelling.',
    color: 'from-yellow-400 to-orange-500',
    bg: '#FFFDE7',
    iconColor: '#FFD166',
  },
  {
    icon: Zap,
    title: 'Animation Projects',
    description: 'Motion graphics and animated explainers that make complex ideas feel effortless.',
    color: 'from-blue-400 to-purple-500',
    bg: '#E8EAF6',
    iconColor: '#5C6BC0',
  },
]

// ─── Testimonials ─────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    name: 'Mukul Vishwakarma',
    role: 'SEO Expert',
    quote: "I’ve tried different ad approaches before, but the AI-generated ads actually performed better than expected. The targeting felt more precise, and I started getting more relevant leads. Definitely worth trying if you're serious about growth.",
    avatar: 'MV',
    color: '#F77F00',
  },
  {
    name: 'ISKCON Rau',
    role: 'Client',
    quote: 'We wanted something simple but impactful, and the AI ads delivered that. The message was clear, and we noticed better engagement from the right audience. It helped us reach more people without overcomplicating things.',
    avatar: 'IR',
    color: '#7B2CBF',
  },
  {
    name: 'Sarthak Choudhary',
    role: 'Travel Agency',
    quote: 'The AI ads were honestly value for money. We saw an increase in inquiries within a short time, and the creatives looked professional too. It saved a lot of time compared to doing everything manually.',
    avatar: 'SC',
    color: '#FF4D6D',
  },
]

// const featuredVideos = MOCK_VIDEOS.filter((v) => v.is_featured).slice(0, 3)

// ─── STATS ────────────────────────────────────────────────────────────────────
const STATS = [
  { value: '50+', label: 'Projects Delivered' },
  { value: '2M+', label: 'Total Views Generated' },
  { value: '30+', label: 'Brands Served' },
  { value: '98%', label: 'Client Satisfaction' },
]

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null)
  const headlineRef = useRef<HTMLHeadingElement>(null)
  
  // Featured videos state
  const [featuredVideos, setFeaturedVideos] = useState<VideoType[]>([])
  const [isLoadingVideos, setIsLoadingVideos] = useState(true)

  // Contact form state
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  useEffect(() => {
    const init = async () => {
      try {
        const res = await portfolioService.getPortfolio({}, 1, 3)
        setFeaturedVideos(res.data)
      } catch (err) {
        console.error('Failed to fetch videos:', err)
      } finally {
        setIsLoadingVideos(false)
      }
    }
    init()

    const ctx = gsap.context(() => {
      // Animated headline words
      if (headlineRef.current) {
        const words = headlineRef.current.querySelectorAll('.word')
        gsap.fromTo(
          words,
          { opacity: 0, y: 60, rotateX: -20 },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 0.9,
            stagger: 0.08,
            ease: 'power4.out',
            delay: 0.3,
          }
        )
      }

      // Parallax on hero bg
      if (heroRef.current) {
        gsap.to(heroRef.current.querySelector('.hero-bg'), {
          yPercent: 30,
          ease: 'none',
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        })
      }
    })

    return () => ctx.revert()
  }, [])

  return (
    <PageWrapper>
      {/* ─── HERO ─────────────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden bg-brand-dark"
      >
        {/* Background layers */}
        <div className="hero-bg absolute inset-0 will-change-transform">
          {/* Gradient mesh */}
          <div className="absolute inset-0 opacity-60"
            style={{
              background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(123,44,191,0.4) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 80%, rgba(247,127,0,0.3) 0%, transparent 55%), radial-gradient(ellipse 50% 40% at 20% 70%, rgba(255,77,109,0.25) 0%, transparent 55%)',
            }}
          />
          {/* Noise texture */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")'}}
          />
          {/* Animated particles */}
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="particle absolute rounded-full opacity-30"
              style={{
                width: `${[80, 120, 60, 200, 100, 150][i]}px`,
                height: `${[80, 120, 60, 200, 100, 150][i]}px`,
                top: `${[10, 60, 30, 70, 20, 50][i]}%`,
                left: `${[10, 75, 50, 30, 85, 60][i]}%`,
                '--duration': `${[7, 9, 6, 11, 8, 10][i]}s`,
                '--delay': `${[0, 1, 2, 0.5, 1.5, 3][i]}s`,
                background: [
                  'radial-gradient(circle, rgba(247,127,0,0.5), transparent)',
                  'radial-gradient(circle, rgba(123,44,191,0.4), transparent)',
                  'radial-gradient(circle, rgba(255,77,109,0.4), transparent)',
                  'radial-gradient(circle, rgba(255,209,102,0.3), transparent)',
                  'radial-gradient(circle, rgba(123,44,191,0.3), transparent)',
                  'radial-gradient(circle, rgba(247,127,0,0.3), transparent)',
                ][i],
              } as React.CSSProperties}
            />
          ))}
        </div>

        {/* Hero content */}
        <div className="container-xl relative z-10 text-center py-32">
          {/* Label pill */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 bg-white/5 backdrop-blur-sm text-white/80 text-sm font-medium mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-brand-yellow animate-pulse-slow" />
            Available for new projects
          </motion.div>

          {/* Main headline */}
          <h1
            ref={headlineRef}
            className="font-display font-black text-white leading-[1.05] mb-6"
            style={{ fontSize: 'clamp(2.8rem, 8vw, 7rem)', perspective: '600px' }}
          >
            {['Rohit', 'Vishwakarma'].map((word, i) => (
              <span key={i} className="word inline-block mr-5 opacity-0">{word}</span>
            ))}
            <br />
            {['AI', 'Ad', 'Creator'].map((word, i) => (
              <span
                key={i}
                className="word inline-block mr-5 opacity-0 bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(135deg, #FFD166 0%, #F77F00 40%, #FF4D6D 80%, #7B2CBF 100%)' }}
              >
                {word}
              </span>
            ))}
          </h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1 }}
            className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Crafting cinematic AI-powered ads, stories, and brand films that captivate
            audiences and drive real results.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/portfolio" className="btn-primary group text-base px-8 py-4">
              Explore Portfolio
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button
              className="inline-flex items-center gap-3 text-white/80 hover:text-white transition-colors group"
              onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <span className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:border-white/50 transition-colors">
                <Play className="w-4 h-4 fill-current ml-0.5" />
              </span>
              Watch Showreel
            </button>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 max-w-3xl mx-auto"
          >
            {STATS.map(({ value, label }) => (
              <div key={label} className="text-center">
                <p
                  className="font-display font-black text-3xl md:text-4xl bg-clip-text text-transparent mb-1"
                  style={{ backgroundImage: 'linear-gradient(135deg, #FFD166, #F77F00)' }}
                >
                  {value}
                </p>
                <p className="text-white/50 text-xs tracking-wide">{label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-white/30 text-xs tracking-widest uppercase">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-white/30 to-transparent animate-pulse" />
        </motion.div>
      </section>

      {/* ─── SERVICES ──────────────────────────────────────────────────────────── */}
      <section id="services" className="section-padding bg-white">
        <div className="container-xl">
          <div className="text-center mb-16">
            <span className="section-label justify-center mb-4">What I Do</span>
            <h2 className="font-display font-bold text-4xl md:text-5xl text-gray-900 mt-3 mb-4 text-balance">
              AI-Powered Creative{' '}
              <span className="gradient-text">Services</span>
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              From concept to conversion — every service designed to make your brand unforgettable.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((service, i) => {
              const Icon = service.icon
              return (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                  className="p-7 rounded-2xl border border-gray-100 bg-white shadow-card hover:shadow-card-hover transition-all duration-300 group cursor-default"
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110 duration-300"
                    style={{ background: service.bg }}
                  >
                    <Icon className="w-6 h-6" style={{ color: service.iconColor }} />
                  </div>
                  <h3 className="font-display font-bold text-gray-900 text-lg mb-3">
                    {service.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{service.description}</p>
                  <div
                    className="mt-5 h-0.5 w-0 group-hover:w-full transition-all duration-500 rounded-full"
                    style={{ background: `linear-gradient(90deg, ${service.iconColor}, transparent)` }}
                  />
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── FEATURED WORK ────────────────────────────────────────────────────── */}
      <section className="section-padding bg-gray-50">
        <div className="container-xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="section-label mb-4">Portfolio</span>
              <h2 className="font-display font-bold text-4xl md:text-5xl text-gray-900 mt-3 text-balance">
                Featured <span className="gradient-text">Work</span>
              </h2>
            </div>
            <Link
              to="/portfolio"
              className="flex items-center gap-2 text-brand-orange font-semibold hover:gap-3 transition-all group"
            >
              View All Projects
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoadingVideos ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="aspect-video rounded-2xl bg-gray-200 animate-pulse" />
              ))
            ) : featuredVideos.length > 0 ? (
              featuredVideos.map((video, i) => (
                <VideoCard key={video.id} video={video} index={i} />
              ))
            ) : (
              <div className="col-span-full py-20 text-center">
                <p className="text-gray-400">No projects available yet.</p>
              </div>
            )}
          </div>

          <div className="mt-12 text-center">
             <Link
                to="/portfolio"
                className="btn-primary inline-flex items-center gap-2 px-8 py-4"
              >
                See More Projects
                <ArrowRight className="w-4 h-4" />
              </Link>
          </div>
        </div>
      </section>

      {/* ─── ABOUT ────────────────────────────────────────────────────────────── */}
      <section id="about" className="section-padding bg-white">
        <div className="container-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: Visual */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div
                className="aspect-square max-w-lg mx-auto rounded-3xl overflow-hidden relative"
                style={{ background: 'linear-gradient(135deg, #0A0A0F 0%, #1a0a2e 100%)' }}
              >
                {/* Decorative elements */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div
                      className="w-32 h-32 rounded-3xl mx-auto mb-6 flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, #F77F00, #FF4D6D)', boxShadow: '0 0 60px rgba(247,127,0,0.5)' }}
                    >
                      <Sparkles className="w-16 h-16 text-white" />
                    </div>
                    <p className="text-white/40 text-sm tracking-widest uppercase">AI × Creativity</p>
                  </div>
                </div>
                {/* Corner gradients */}
                <div className="absolute top-0 right-0 w-48 h-48 rounded-bl-full opacity-30"
                  style={{ background: 'radial-gradient(circle, #7B2CBF, transparent)' }} />
                <div className="absolute bottom-0 left-0 w-48 h-48 rounded-tr-full opacity-20"
                  style={{ background: 'radial-gradient(circle, #F77F00, transparent)' }} />
              </div>

              {/* Floating stat cards */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -bottom-6 -right-6 glass-card p-4 hidden lg:block"
              >
                <p className="font-display font-black text-3xl gradient-text">50+</p>
                <p className="text-gray-500 text-xs">Projects Delivered</p>
              </motion.div>
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-6 -left-6 glass-card p-4 hidden lg:block"
              >
                <p className="font-display font-black text-3xl" style={{ color: '#7B2CBF' }}>2M+</p>
                <p className="text-gray-500 text-xs">Views Generated</p>
              </motion.div>
            </motion.div>

            {/* Right: Text */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <span className="section-label mb-4">About Me</span>
              <h2 className="font-display font-bold text-4xl md:text-5xl text-gray-900 mt-4 mb-6 text-balance">
                Where AI meets{' '}
                <span className="gradient-text">Human Creativity</span>
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-5">
                I'm Rohit Vishwakarma — an AI Ad Creator and Storytelling Expert with a passion for
                building cinematic brand experiences that drive real business outcomes.
              </p>
              <p className="text-gray-500 leading-relaxed mb-8">
                Using cutting-edge AI tools, I transform brand briefs into stunning visual stories —
                from 30-second performance ads to long-form brand documentaries. Every project is
                crafted with cinematic intent and data-driven strategy.
              </p>
              <div className="flex flex-wrap gap-3 mb-8">
                {['AI Ads', 'Video Editing', 'Storytelling', 'Voiceovers', 'Animation'].map((tag) => (
                  <span
                    key={tag}
                    className="px-4 py-2 rounded-full text-sm font-semibold text-brand-orange border border-brand-orange/20 bg-brand-orange/5"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <Link to="/portfolio" className="btn-primary inline-flex">
                See My Work <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─────────────────────────────────────────────────────── */}
      <section className="section-padding bg-gray-50">
        <div className="container-xl">
          <div className="text-center mb-14">
            <span className="section-label justify-center mb-4">Client Love</span>
            <h2 className="font-display font-bold text-4xl md:text-5xl text-gray-900 mt-3 text-balance">
              What Clients <span className="gradient-text">Say</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.12 }}
                className="p-7 rounded-2xl bg-white border border-gray-100 shadow-card hover:shadow-card-hover transition-all duration-300"
              >
                <div className="text-3xl mb-4 opacity-70" style={{ color: t.color }}>"</div>
                <p className="text-gray-700 leading-relaxed mb-6 text-sm">{t.quote}</p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm"
                    style={{ background: t.color }}
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-gray-400 text-xs">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CONTACT ──────────────────────────────────────────────────────────── */}
      <section id="contact" className="section-padding bg-white">
        <div className="container-xl max-w-3xl text-center">
          <span className="section-label justify-center mb-4">Get In Touch</span>
          <h2 className="font-display font-bold text-4xl md:text-5xl text-gray-900 mt-3 mb-5 text-balance">
            Let's Create Something{' '}
            <span className="gradient-text">Incredible</span>
          </h2>
          <p className="text-gray-500 text-lg mb-10">
            Have a project in mind? I'd love to hear about it and explore how AI can elevate your brand.
          </p>
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              setIsSubmitting(true)
              setSubmitStatus('idle')
              try {
                await contactService.sendMessage(contactForm)
                setSubmitStatus('success')
                setContactForm({ name: '', email: '', message: '' })
              } catch (err) {
                setSubmitStatus('error')
              } finally {
                setIsSubmitting(false)
              }
            }}
            className="bg-gray-50 rounded-3xl p-8 md:p-10 border border-gray-100 space-y-5 text-left"
          >
            {submitStatus === 'success' && (
              <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl mb-4">
                <CheckCircle className="w-5 h-5" />
                <p className="text-sm font-medium">Message sent successfully! I will get back to you soon.</p>
              </div>
            )}
            {submitStatus === 'error' && (
              <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-4">
                <AlertCircle className="w-5 h-5" />
                <p className="text-sm font-medium">Something went wrong. Please try again later.</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  required
                  placeholder="Your name"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:border-brand-orange transition-colors text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  required
                  placeholder="your@email.com"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:border-brand-orange transition-colors text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Project Brief</label>
              <textarea
                rows={4}
                required
                placeholder="Tell me about your project..."
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:border-brand-orange transition-colors text-sm resize-none"
              />
            </div>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="btn-primary w-full justify-center py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Sending...' : 'Send Message'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </section>
    </PageWrapper>
  )
}
