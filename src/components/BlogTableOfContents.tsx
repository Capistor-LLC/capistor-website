import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";

interface Heading {
    id: string;
    level: number;
    text: string;
}

interface BlogTableOfContentsProps {
    headings: Heading[];
}

export default function BlogTableOfContents({ headings }: BlogTableOfContentsProps) {
    const [activeId, setActiveId] = useState<string>("");
    const [maxHeight, setMaxHeight] = useState<number>(300);
    const [topPosition, setTopPosition] = useState<number>(150);
    const navRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Set initial active heading
        if (headings.length > 0) {
            setActiveId(headings[0].id);
        }
    }, [headings]);

    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY;
            const heroHeight = 500; // approximate hero image height

            // Calculate top position - TOC stays at 150px until hero is scrolled past
            // Then it moves up towards 120px minimum, but never overlaps the hero
            const calculatedTop = Math.max(120, 150 - Math.max(0, scrollPosition - heroHeight) * 0.5);
            setTopPosition(calculatedTop);

            // Scroll for active heading tracking
            const activeScrollPosition = scrollPosition + 200;
            for (let i = headings.length - 1; i >= 0; i--) {
                const heading = document.getElementById(headings[i].id);
                if (heading) {
                    const elementOffset = heading.offsetTop;
                    if (activeScrollPosition >= elementOffset) {
                        setActiveId(headings[i].id);
                        break;
                    }
                }
            }

            // Calculate available height for TOC
            const footer = document.querySelector("footer");
            if (footer && navRef.current) {
                const navRect = navRef.current.getBoundingClientRect();
                const footerRect = footer.getBoundingClientRect();
                const availableHeight = footerRect.top - navRect.top - 40;
                const minHeight = 200;
                const maxAllowedHeight = 600;

                setMaxHeight(Math.min(maxAllowedHeight, Math.max(minHeight, availableHeight)));
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, [headings]);

    const handleClick = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            const yOffset = -100;
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: "smooth" });
            setActiveId(id);
        }
    };

    if (headings.length === 0) return null;

    return (
        <motion.aside
            ref={navRef}
            className="hidden 2xl:block fixed left-8 w-56"
            style={{ top: `${topPosition}px` }}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
        >
            <nav
                className="bg-kindofwhite/50 backdrop-blur-md border border-sexyblue/8 rounded-xl p-6 space-y-4 overflow-hidden transition-all duration-300"
                style={{ maxHeight: `${maxHeight}px` }}
            >
                <h3 className="text-xs font-futura font-bold text-sexyblue/70 uppercase tracking-widest sticky top-0 bg-kindofwhite/50">
                    Contents
                </h3>

                <ul className="space-y-1 text-xs">
                    {headings.map((heading) => (
                        <motion.li
                            key={heading.id}
                            className="flex"
                            whileHover={{ x: 2 }}
                            transition={{ duration: 0.2 }}
                        >
                            <button
                                onClick={() => handleClick(heading.id)}
                                className={`text-left font-fransisco transition-all duration-300 py-2 px-3 rounded-md w-full truncate ${activeId === heading.id
                                    ? "bg-sexyblue/12 border-l-2 border-sexyblue text-sexyblue font-semibold"
                                    : "text-sexyblue/50 hover:text-sexyblue/70 border-l-2 border-transparent hover:bg-sexyblue/5"
                                    } ${heading.level === 3 ? "ml-3" : ""}`}
                                title={heading.text}
                            >
                                {heading.text}
                            </button>
                        </motion.li>
                    ))}
                </ul>
            </nav>
        </motion.aside>
    );
}
