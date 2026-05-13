import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useForm, ValidationError } from "@formspree/react";

function NewsletterInline() {
  const [state, handleSubmit] = useForm("xbljdwvk");
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (state.succeeded) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [state.succeeded]);

  if (showSuccess) {
    return (
      <p className="text-kindofwhite/70 font-fransisco text-sm">
        ✓ Subscribed! We'll keep you updated.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mt-3">
      <input
        type="email"
        name="email"
        required
        placeholder="your@email.com"
        className="flex-1 px-3 py-2 rounded-lg bg-kindofwhite/10 border border-kindofwhite/20 text-kindofwhite font-fransisco text-sm placeholder-kindofwhite/40 focus:outline-none focus:border-kindofwhite/40 min-w-0"
      />
      <input type="hidden" name="_source" value="footer-newsletter" />
      <button
        type="submit"
        disabled={state.submitting}
        className="px-4 py-2 rounded-lg bg-kindofwhite text-sexyblue font-futura font-bold text-sm whitespace-nowrap hover:bg-capistor-100 transition-colors disabled:opacity-60"
      >
        {state.submitting ? "..." : "Subscribe"}
      </button>
      <ValidationError prefix="Email" field="email" errors={state.errors} />
    </form>
  );
}

export default function Footer() {
  return (
    <footer className="bg-sexyblue text-kindofwhite py-12 md:py-16 px-4 sm:px-6 md:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          {/* Company Info */}
          <div className="md:col-span-1">
            <h3 className="text-xl font-futura font-bold text-kindofwhite mb-3">Capistor</h3>
            <p className="text-kindofwhite/60 font-fransisco text-sm leading-relaxed">
              Engineering innovative embedded systems and industrial technology solutions.
            </p>
            {/* Social Links */}
            <div className="flex gap-3 mt-5">
              <a
                href="https://www.linkedin.com/company/capistor"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-8 h-8 rounded-full bg-kindofwhite/10 hover:bg-kindofwhite/20 flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4 fill-kindofwhite" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a
                href="mailto:shoaib@capistor.com"
                aria-label="Email"
                className="w-8 h-8 rounded-full bg-kindofwhite/10 hover:bg-kindofwhite/20 flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4 stroke-kindofwhite" fill="none" viewBox="0 0 24 24" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-base font-futura font-bold text-kindofwhite mb-4">Contact</h3>
            <div className="space-y-2">
              <p className="text-kindofwhite/60 font-fransisco text-sm">
                <a href="mailto:shoaib@capistor.com" className="hover:text-kindofwhite transition-colors">
                  shoaib@capistor.com
                </a>
              </p>
              <p className="text-kindofwhite/60 font-fransisco text-sm">
                <a href="tel:+971508726178" className="hover:text-kindofwhite transition-colors">
                  +971 508 726 178
                </a>
              </p>
            </div>
          </div>

          {/* Location */}
          <div>
            <h3 className="text-base font-futura font-bold text-kindofwhite mb-4">Address</h3>
            <p className="text-kindofwhite/60 font-fransisco text-sm leading-relaxed">
              Silicon Oasis, IFZA Business Park
              <br />
              Dubai, UAE
            </p>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-base font-futura font-bold text-kindofwhite mb-1">Stay Updated</h3>
            <p className="text-kindofwhite/50 font-fransisco text-xs">
              New products and engineering insights.
            </p>
            <NewsletterInline />
          </div>
        </motion.div>

        <div className="my-8 border-t border-kindofwhite/10" />

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-between gap-3"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <p className="text-kindofwhite/40 font-fransisco text-xs">
            © {new Date().getFullYear()} Capistor. All rights reserved.
          </p>
          <p className="text-kindofwhite/30 font-fransisco text-xs">
            Silicon Oasis · Dubai · UAE
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
