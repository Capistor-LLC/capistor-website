import { motion, AnimatePresence } from "framer-motion";
import { cvData } from "../../../data/cvData";
import { useState, useEffect } from "react";

export default function CVPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const {
    personalInfo,
    summary,
    experience,
    projects,
    awards,
    education,
    skills,
  } = cvData;

  const SkillBadge = ({ skill, index }: { skill: string; index: number }) => {
    const colors = [
      "bg-sexyblue/20 text-sexyblue font-medium border border-sexyblue/30",
      "bg-sexyblue/15 text-sexyblue/90 border border-sexyblue/25",
      "bg-sexyblue/25 text-sexyblue font-semibold border border-sexyblue/35",
      "bg-sexyblue/10 text-sexyblue/80 border border-sexyblue/20",
    ];
    return (
      <span
        className={`px-4 py-2 rounded-full text-sm font-fransisco transition-all hover:shadow-md ${colors[index % colors.length]
          }`}>
        {skill}
      </span>
    );
  };

  const SectionWrapper = ({
    title,
    delay = 0,
    children,
  }: {
    title: string;
    delay?: number;
    children: React.ReactNode;
  }) => (
    <motion.section
      className="mb-16"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
      transition={{ duration: 0.6, delay }}>
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-futura font-bold text-black mb-8 text-center">
        {title}
      </h2>
      <div className="space-y-6">{children}</div>
    </motion.section>
  );

  const getYouTubeEmbedUrl = (url: string | null) => {
    if (!url) return null;
    const videoId = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/
    );
    return videoId ? `https://www.youtube.com/embed/${videoId[1]}` : null;
  };

  const MediaGallery = ({
    images,
    videoUrl,
    title,
  }: {
    images?: string[];
    videoUrl?: string;
    title: string;
  }) => {
    if (!images?.length && !videoUrl) return null;
    return (
      <div className="lg:col-span-1 space-y-6">
        {videoUrl && (
          <div>
            <h4 className="font-futura font-bold text-black mb-3 text-lg">
              Project Demo
            </h4>
            <motion.div
              className="aspect-video rounded-lg overflow-hidden shadow-md border border-capistor-300/30 cursor-pointer hover:shadow-lg transition-all"
              onClick={() => setSelectedVideo(videoUrl)}
              whileHover={{ scale: 1.02 }}>
              <div className="w-full h-full bg-gradient-to-br from-sexyblue/20 to-sexyblue/5 flex items-center justify-center">
                <div className="text-4xl">▶️</div>
              </div>
            </motion.div>
          </div>
        )}
        {images && images.length > 0 && (
          <div>
            <h4 className="font-futura font-bold text-black mb-3 text-lg">
              Images
            </h4>
            <div className="grid grid-cols-1 gap-4">
              {images.map((img, i) => (
                <motion.img
                  key={i}
                  src={img}
                  alt={`${title} - Image ${i + 1}`}
                  className="w-full rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer border border-capistor-300/30"
                  onClick={() => setSelectedImage(img)}
                  whileHover={{ scale: 1.02 }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const ExperienceCard = ({ data }: { data: any }) => (
    <motion.div
      className="bg-kindofwhite rounded-2xl p-6 md:p-8 shadow-md border border-capistor-300/30 transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      whileHover={{
        scale: 1.02,
        borderColor: "rgba(52, 58, 64, 0.5)",
        boxShadow: "0 15px 25px rgba(0, 0, 0, 0.15)",
      }}>
      <div
        className={`grid gap-8 ${data.images?.length || data.videoUrl
            ? "lg:grid-cols-3"
            : "grid-cols-1"
          }`}>
        <div
          className={`space-y-4 ${data.images?.length || data.videoUrl
              ? "lg:col-span-2"
              : "col-span-1"
            }`}>
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-4">
            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl font-futura font-bold text-black">
                {data.title || data.degree}
              </h3>
              {data.company && (
                <div className="text-lg text-sexyblue font-fransisco font-semibold">
                  {data.company} • {data.location}
                </div>
              )}
              {data.institution && (
                <div className="text-lg text-sexyblue font-fransisco font-semibold">
                  {data.institution}
                </div>
              )}
              {data.duration && (
                <div className="text-sexyblue/70 text-sm font-fransisco">
                  {data.duration}
                </div>
              )}
            </div>
            {data.type && (
              <span className="bg-sexyblue/20 text-sexyblue border border-sexyblue/30 px-4 py-1.5 rounded-full text-sm font-fransisco font-semibold mt-3 lg:mt-0">
                {data.type}
              </span>
            )}
          </div>
          {data.description && (
            <p className="font-fransisco text-sexyblue/80 text-base leading-relaxed">
              {data.description}
            </p>
          )}
          {data.achievements && data.achievements.length > 0 && (
            <ul className="space-y-3 pt-2">
              {data.achievements.map((a: string, i: number) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-sexyblue font-bold text-lg mt-0.5">→</span>
                  <span className="leading-relaxed text-sexyblue/80 font-fransisco">{a}</span>
                </li>
              ))}
            </ul>
          )}
          {data.skills && data.skills.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {data.skills.map((s: string, i: number) => (
                <SkillBadge key={i} skill={s} index={i} />
              ))}
            </div>
          )}
        </div>
        <MediaGallery
          images={data.images}
          videoUrl={data.videoUrl}
          title={data.title || data.degree}
        />
      </div>
    </motion.div>
  );

  const AwardCard = ({ award }: { award: any }) => (
    <motion.div
      className="bg-kindofwhite rounded-2xl p-6 md:p-8 shadow-md border border-capistor-300/30 transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      whileHover={{
        scale: 1.02,
        borderColor: "rgba(52, 58, 64, 0.5)",
        boxShadow: "0 15px 25px rgba(0, 0, 0, 0.15)",
      }}>
      <div className="space-y-3">
        <h3 className="text-lg sm:text-xl font-futura font-bold text-black">
          🏆 {award.title}
        </h3>
        <div className="text-sexyblue font-fransisco font-semibold">
          {award.issuer}
        </div>
        <div className="text-sexyblue/70 text-sm font-fransisco">{award.date}</div>
        <p className="text-base leading-relaxed text-sexyblue/80 font-fransisco">{award.description}</p>
      </div>
    </motion.div>
  );

  const contactIcons = {
    email: "📧",
    phone: "📱",
    location: "📍",
    website: "🌐",
    linkedin: "💼",
    github: "👨‍💻",
  };

  return (
    <div className="bg-kindofwhite min-h-screen relative font-domine pt-16">
      {/* Image Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}>
            <motion.div
              className="relative max-w-4xl w-full"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-10 right-0 text-white text-3xl font-bold hover:text-sexyblue transition-colors z-10">
                ✕
              </button>
              <img
                src={selectedImage}
                alt="Enlarged"
                className="w-full rounded-lg shadow-2xl"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedVideo(null)}>
            <motion.div
              className="relative w-full max-w-4xl"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setSelectedVideo(null)}
                className="absolute -top-10 right-0 text-white text-3xl font-bold hover:text-sexyblue transition-colors z-10">
                ✕
              </button>
              <div className="aspect-video rounded-lg overflow-hidden shadow-2xl">
                <iframe
                  src={getYouTubeEmbedUrl(selectedVideo) || ""}
                  title="Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl w-full py-12">
          {/* Header */}
          <motion.header
            className="text-center space-y-8 mb-16"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 50 }}
            transition={{ duration: 0.8 }}>
            <div className="relative w-fit mx-auto">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-sexyblue/20 to-sexyblue/10 rounded-full blur-2xl"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <img
                src="/cv_assets/my_picture.png"
                alt={personalInfo.name}
                className="w-32 h-32 rounded-full mx-auto shadow-xl border-4 border-sexyblue/30 relative z-10"
              />
            </div>
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-futura font-bold text-black">
                {personalInfo.name}
              </h1>
              <h2 className="text-xl sm:text-2xl lg:text-3xl text-sexyblue font-fransisco font-semibold">
                {personalInfo.title}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {Object.entries(contactIcons).map(([key, icon]) => {
                const value = (personalInfo as any)[key];
                if (!value) return null;
                return (
                  <motion.div
                    key={key}
                    className="flex items-center justify-center gap-2 p-3 rounded-lg bg-kindofwhite border border-capistor-300/30 hover:border-sexyblue/50 transition-all"
                    whileHover={{ scale: 1.05 }}>
                    <span className="text-xl">{icon}</span>
                    <span className="text-sexyblue font-fransisco text-sm font-semibold">
                      {key === "email" ? (
                        <a
                          href={`mailto:${value}`}
                          className="hover:text-sexyblue/80 transition-colors">
                          {value}
                        </a>
                      ) : key === "website" ? (
                        <a
                          href={`http://${value}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-sexyblue/80 transition-colors">
                          {value}
                        </a>
                      ) : key === "linkedin" || key === "github" ? (
                        <a
                          href={value}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-sexyblue/80 transition-colors">
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </a>
                      ) : (
                        <span>{value}</span>
                      )}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </motion.header>

          {/* Professional Summary */}
          <SectionWrapper title="Professional Summary" delay={0.2}>
            <motion.div
              className="bg-kindofwhite rounded-2xl p-6 md:p-8 shadow-md border border-capistor-300/30"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}>
              <p className="text-base sm:text-lg leading-relaxed text-sexyblue/85 font-fransisco">
                {summary}
              </p>
            </motion.div>
          </SectionWrapper>

          {/* Technical Skills */}
          <SectionWrapper title="Technical Skills" delay={0.3}>
            <motion.div
              className="bg-kindofwhite rounded-2xl p-6 md:p-8 shadow-md border border-capistor-300/30"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}>
              <div className="flex flex-wrap gap-3">
                {Object.values(skills)
                  .flat()
                  .map((s, i) => (
                    <SkillBadge key={i} skill={s as string} index={i} />
                  ))}
              </div>
            </motion.div>
          </SectionWrapper>

          {/* Professional Experience */}
          <SectionWrapper title="Professional Experience" delay={0.4}>
            {experience.map((exp) => (
              <ExperienceCard key={exp.id} data={exp} />
            ))}
          </SectionWrapper>

          {/* Key Projects */}
          <SectionWrapper title="Key Projects" delay={0.5}>
            {projects.map((proj) => (
              <ExperienceCard key={proj.id} data={proj} />
            ))}
          </SectionWrapper>

          {/* Awards & Recognition */}
          <SectionWrapper title="Awards & Recognition" delay={0.6}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {awards.map((a, i) => (
                <AwardCard key={i} award={a} />
              ))}
            </div>
          </SectionWrapper>

          {/* Education */}
          <SectionWrapper title="Education" delay={0.7}>
            {education.map((edu) => (
              <ExperienceCard key={edu.id} data={edu} />
            ))}
          </SectionWrapper>
        </div>
      </div>
    </div>
  );
}
