import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import CVPage from "../cv/page"; // adjust path if needed

const SocialCard = () => {
  const [isCVOpen, setIsCVOpen] = useState(false);

  // ✅ Listen for close event from CVPage
  useEffect(() => {
    const handleClose = () => setIsCVOpen(false);
    window.addEventListener("closeCVModal", handleClose);
    return () => window.removeEventListener("closeCVModal", handleClose);
  }, []);

  const socialLinks = [
    {
      href: "https://www.youtube.com/@capistor1",
      img: "https://img.favpng.com/9/20/22/youtube-logo-computer-icons-png-favpng-7BheSpb3uZ6bpSyBCzpYbGkAG.jpg",
      alt: "YouTube",
    },
    {
      href: "https://www.fb.com/shoaib.sl",
      img: "https://www.citypng.com/public/uploads/preview/round-black-facebook-fb-logo-icon-sign-701751695134781upkxjlqwck.png",
      alt: "Facebook",
    },
    {
      href: "https://github.com/manhoosbilli1",
      img: "https://icon2.cleanpng.com/20180530/ywr/kisspng-github-computer-icons-directory-5b0ec64b102792.7107546015276949230662.jpg",
      alt: "GitHub",
    },
    {
      href: "https://www.linkedin.com/in/shoaibmustafa/",
      img: "https://static.vecteezy.com/system/resources/previews/023/986/980/non_2x/linkedin-logo-linkedin-logo-transparent-linkedin-icon-transparent-free-free-png.png",
      alt: "LinkedIn",
    },
    {
      href: "https://hackaday.io/manhoosbilli1",
      img: "https://images.icon-icons.com/2389/PNG/512/hackaday_logo_icon_145209.png",
      alt: "Hackaday",
    },
  ];

  return (
    <>
      {/* ---- Card ---- */}
      <motion.div
        className="w-full max-w-xl mx-auto bg-kindofwhite shadow-xl rounded-3xl p-8 flex flex-col items-center border border-capistor-300/30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        whileHover={{
          scale: 1.02,
          boxShadow: "0 15px 25px rgba(0, 0, 0, 0.25)",
        }}
      >
        {/* Profile */}
        <motion.div
          className="mb-5 relative"
          animate={{ y: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        >
          <motion.img
            className="w-40 h-40 rounded-full object-cover border-4 border-capistor-400 shadow-lg hover:shadow-2xl transition-all duration-300"
            src="/profilepic/shoaibPic.jpeg"
            alt="Profile Picture"
            whileHover={{ scale: 1.08, borderColor: "#6C757D" }}
          />
        </motion.div>

        <h2 className="text-3xl font-futura font-bold text-black mb-2 tracking-wide">
          Connect
        </h2>
        <p className="text-sexyblue/80 text-center mb-6 text-base sm:text-lg font-fransisco max-w-md">
          Let’s collaborate, build, and innovate together. Whether it's embedded
          systems, firmware, or PCB design — I’m always open to creating
          something new.
        </p>

        {/* Info */}
        <div className="bg-kindofwhite/50 border border-capistor-300/30 rounded-xl p-4 w-full text-center shadow-inner">
          <p className="text-lg font-futura text-black font-semibold">
            Shoaib Mustafa
          </p>
          <p className="text-sexyblue/80 font-fransisco text-base">
            Embedded Systems Engineer
          </p>
          <a
            href="mailto:shoaib@capistor.com"
            className="text-sm text-sexyblue/80 mt-2 inline-block hover:underline hover:text-sexyblue font-fransisco transition-colors duration-200"
          >
            info@capistor.com
          </a>
        </div>

        {/* Social Links + CV */}
        <div className="flex flex-wrap justify-center gap-5 mb-8 mt-4">
          {socialLinks.map((link, i) => (
            <a
              key={i}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="transform hover:scale-110 transition-transform duration-200"
            >
              <img
                src={link.img}
                alt={link.alt}
                className="w-10 h-10 object-contain rounded-full"
              />
            </a>
          ))}

          {/* CV Button */}
          <button
            onClick={() => setIsCVOpen(true)}
            className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white text-sm font-futura font-semibold hover:bg-capistor-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-110"
          >
            CV
          </button>
        </div>
      </motion.div>

      {/* ---- FULL-SCREEN MODAL ---- */}
      {isCVOpen && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-lg p-2 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsCVOpen(false)}
        >
          <motion.div
            className="relative bg-kindofwhite/95 rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] sm:h-auto overflow-y-auto p-4 sm:p-6 backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 120, damping: 15 }}
          >
            {/* Close Button */}
            <button
              className="absolute top-0 right-1 text-black text-3xl font-bold hover:text-sexyblue transition-colors duration-200"
              onClick={() => setIsCVOpen(false)}
            >
              ×
            </button>

            <div className="overflow-y-auto max-h-[80vh] sm:max-h-[85vh]">
              <CVPage />
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
};

export default SocialCard;
