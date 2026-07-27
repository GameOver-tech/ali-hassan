import { useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiGithub, FiExternalLink, FiX, FiArrowRight, FiImage, FiClock, FiUser, FiLayers } from 'react-icons/fi'
import { Link } from 'react-router-dom'

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

const modalVariants = {
  hidden: { opacity: 0, scale: 0.92, y: 40 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 28 },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
}

export default function ProjectModal({ project, onClose }) {
  const handleKeyDown = useCallback(
    e => {
      if (e.key === 'Escape') onClose()
    },
    [onClose],
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [handleKeyDown])

  const tags = project.software?.split(',').map(s => s.trim()) || []
  const detailLink = project.pdf_url
    ? `/portfolio/${project.slug}`
    : `/projects/${project.slug}`

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

        {/* Modal */}
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={e => e.stopPropagation()}
          className="relative mx-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-accent/20 bg-gradient-to-b from-[#0d1117] via-[#111827] to-[#0d1117] shadow-[0_0_60px_rgba(0,240,255,0.12)]"
        >
          {/* Ambient glow */}
          <div className="pointer-events-none absolute -left-32 -top-32 h-64 w-64 rounded-full bg-accent/5 blur-[100px]" />
          <div className="pointer-events-none absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-accent-neural/5 blur-[100px]" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-text-muted transition-colors hover:bg-white/10 hover:text-text-primary"
            aria-label="Close modal"
          >
            <FiX size={16} />
          </button>

          {/* Thumbnail */}
          <div className="relative aspect-[16/9] overflow-hidden bg-bg-surface">
            <div className="absolute inset-0 flex items-center justify-center text-text-muted">
              <div className="flex flex-col items-center space-y-2">
                <FiImage size={36} />
                <span className="text-xs">No image</span>
              </div>
            </div>
            {project.thumbnail_url && (
              <img
                src={project.thumbnail_url}
                alt={project.title}
                className="absolute inset-0 z-10 h-full w-full object-cover"
                onError={e => {
                  e.target.style.display = 'none'
                }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117] via-transparent to-transparent z-20" />
          </div>

          {/* Content */}
          <div className="relative z-10 -mt-1 px-6 pb-6 pt-5 sm:px-8 sm:pb-8 sm:pt-6">
            {/* Category badge */}
            <span className="inline-flex rounded-full bg-accent/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-accent shadow-[0_0_10px_rgba(0,240,255,0.1)]">
              {project.category || 'Project'}
            </span>

            {/* Title & description */}
            <h2 className="mt-3 text-xl font-heading font-bold text-text-primary sm:text-2xl">
              {project.title}
            </h2>
            <p className="mt-3 line-clamp-3 text-sm leading-7 text-text-muted">
              {project.description}
            </p>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {tags.map((tag, i) => (
                  <span
                    key={i}
                    className="rounded-md border border-border-subtle bg-white/5 px-2.5 py-1 text-xs text-text-muted"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Metadata row (if available) */}
            {(project.client || project.duration) && (
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-text-muted">
                {project.client && (
                  <span className="flex items-center gap-1.5">
                    <FiUser size={12} className="text-accent" />
                    {project.client}
                  </span>
                )}
                {project.duration && (
                  <span className="flex items-center gap-1.5">
                    <FiClock size={12} className="text-accent" />
                    {project.duration}
                  </span>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              {project.github_url && (
                <motion.a
                  href={project.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="group flex flex-1 items-center justify-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-5 py-3 text-sm font-semibold text-accent transition-all duration-300 hover:bg-accent/20 hover:shadow-[0_0_20px_rgba(0,240,255,0.15)]"
                >
                  <FiGithub size={16} />
                  <span>View on GitHub</span>
                  <FiExternalLink
                    size={13}
                    className="opacity-0 -translate-x-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0"
                  />
                </motion.a>
              )}
              {project.project_url && (
                <motion.a
                  href={project.project_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="group flex flex-1 items-center justify-center gap-2 rounded-xl border border-border-subtle bg-white/5 px-5 py-3 text-sm font-semibold text-text-primary transition-all duration-300 hover:bg-white/10"
                >
                  <FiExternalLink size={15} />
                  <span>Live Demo</span>
                </motion.a>
              )}
            </div>

            {/* View Full Details link */}
            <div className="mt-4 text-center">
              <Link
                to={detailLink}
                onClick={onClose}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-text-muted transition-colors hover:text-accent"
              >
                <span>View Full Details</span>
                <FiArrowRight size={12} />
              </Link>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
