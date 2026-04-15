import { Link } from 'react-router-dom'
import { Linkedin, Sparkles, ArrowUpRight } from 'lucide-react'

// WhatsApp SVG icon (not in lucide-react)
const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)

const SOCIAL_LINKS = [
  { icon: Linkedin, href: 'https://www.linkedin.com/in/rohitvishwakarmaarv/', label: 'LinkedIn', color: '#0A66C2' },
  { icon: WhatsAppIcon, href: 'https://wa.me/917987252289', label: 'WhatsApp', color: '#25D366' },
]

const FOOTER_LINKS = [
  { label: 'Portfolio', href: '/portfolio' },
  { label: 'About', href: '/#about' },
  { label: 'Services', href: '/#services' },
  { label: 'Contact', href: '/#contact' },
]

export const Footer = () => {
  return (
    <footer className="bg-brand-dark text-white">
      {/* Top CTA band */}
      <div
        className="py-16 md:py-20 border-b border-white/10"
        style={{ background: 'linear-gradient(135deg, #0A0A0F 0%, #1a0a2e 100%)' }}
      >
        <div className="container-xl text-center">
          <p className="section-label justify-center text-brand-yellow mb-4">Let's Work Together</p>
          <h2 className="font-display font-bold text-4xl md:text-6xl text-white mb-6 text-balance">
            Ready to create something{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, #FFD166, #F77F00)' }}
            >
              extraordinary?
            </span>
          </h2>
          <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
            Let's build AI-powered ads and stories that captivate and convert.
          </p>
          <a
            href="mailto:rohit@example.com"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-brand-dark transition-all duration-300 hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #FFD166, #F77F00)' }}
          >
            Get in Touch <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Main footer */}
      <div className="container-xl py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #F77F00, #FF4D6D)' }}
              >
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-xl text-white">Rohit Vishwakarma</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              AI Ad Creator & Storytelling Expert. Transforming brands through
              cinematic AI-powered content.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-5">Navigation</h4>
            <ul className="space-y-3">
              {FOOTER_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    to={l.href}
                    className="text-gray-400 text-sm hover:text-brand-yellow transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-white font-semibold mb-5">Follow Along</h4>
            <div className="flex gap-3">
              {SOCIAL_LINKS.map(({ icon: Icon, href, label, color }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 transition-all duration-200"
                  style={{ ['--hover-color' as string]: color }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.color = color
                    ;(e.currentTarget as HTMLAnchorElement).style.borderColor = color + '66'
                    ;(e.currentTarget as HTMLAnchorElement).style.backgroundColor = color + '1A'
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.color = ''
                    ;(e.currentTarget as HTMLAnchorElement).style.borderColor = ''
                    ;(e.currentTarget as HTMLAnchorElement).style.backgroundColor = ''
                  }}
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Rohit Vishwakarma. All rights reserved.
          </p>
          <p className="text-gray-600 text-xs">Built with AI × Passion</p>
        </div>
      </div>
    </footer>
  )
}
