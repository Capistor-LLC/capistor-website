import { motion } from "framer-motion";

interface CapabilityCategory {
    title: string;
    items: string[];
    icon: string;
}

interface FeaturedProject {
    title: string;
    description: string;
    meta: string;
    image1: string;
    image2: string;
    repoUrl: string;
    highlights: string[];
}

const capabilities: CapabilityCategory[] = [
    {
        title: "Microcontrollers",
        icon: "⚙️",
        items: [
            "ESP32-WROVER",
            "ESP32-S3",
            "ESP32-C3",
            "STM32F1",
            "nRF52832",
            "RP2040",
            "ATmega328",
            "ATtiny3216",
            "ATtiny24A",
        ],
    },
    {
        title: "Connectivity",
        icon: "📡",
        items: [
            "USB-C (2.0)",
            "Bluetooth / BLE",
            "Wi-Fi",
            "4G Cellular (AIR780E)",
            "RS-485 / Modbus (isolated)",
            "RJ45 tethered",
            "UART / I2C / SPI",
        ],
    },
    {
        title: "Power Management",
        icon: "⚡",
        items: [
            "Buck-boost (TPS63020/63070)",
            "LiPo charging (MCP73831/73871)",
            "PowerPath (LM66200, LTC4412)",
            "Fuel gauge (MAX17048)",
            "Boost (LM5158)",
            "Voltage supervisor (LTC2960)",
            "High-current MOSFET switching (10 A+)",
        ],
    },
    {
        title: "Sensors / I/O",
        icon: "📊",
        items: [
            "3-axis accel (LIS3DH)",
            "6-axis IMU (BMI270)",
            "1-Wire temp (DS18B20)",
            "8-ch analog mux (74HC4051)",
            "Optocoupler isolation (PC817)",
            "Digital isolation (ISO7762, Si8642)",
        ],
    },
    {
        title: "User Interface",
        icon: "🎮",
        items: [
            "Addressable RGB (WS2812B, SK6812)",
            "OLED displays",
            "Haptic motor drivers (DRV2605)",
            "Tactile buttons + slide switches",
            "Multi-button matrix (HID)",
            "Joysticks / rotary encoders",
        ],
    },
    {
        title: "Mechanical / Form Factor",
        icon: "🔧",
        items: [
            "Multi-board flex assemblies",
            "Wearable (necklace, dongle)",
            "RPi HAT form factor",
            "Ceramic chip antennas",
            "FPC interconnects (0.25 mm)",
            "4-layer stackups",
        ],
    },
    {
        title: "EMC / Protection",
        icon: "🛡️",
        items: [
            "ESD diodes (ESD441, SP0503)",
            "TVS (SMBJ, SMBJ24A)",
            "Reverse-polarity (Schottky)",
            "Galvanic isolation domains",
            "EMC analysis (kicad-happy)",
        ],
    },
    {
        title: "Manufacturing",
        icon: "🏭",
        items: [
            "JLCPCB / LCSC sourcing",
            "BOM with LCSC codes",
            "Gerber / drill / pick-and-place",
            "STEP for mechanical integration",
            "kibot CI for build artifacts",
        ],
    },
];

const processSteps = [
    {
        number: "01",
        title: "Requirements & Constraints",
        description:
            "Understand your mechanical envelope, power budget, regulatory needs (CE/FCC), and unit-cost targets. No surprises, no scope creep.",
    },
    {
        number: "02",
        title: "Schematic Capture",
        description:
            "KiCad 10 or EasyEDA Pro. Component selection with multiple sources and fallbacks built in from day one.",
    },
    {
        number: "03",
        title: "Component Sourcing",
        description:
            "LCSC + JLCPCB sourcing with production-ready BOMs and verified alternatives for supply-chain resilience.",
    },
    {
        number: "04",
        title: "PCB Layout",
        description:
            "Controlled impedance, EMC-aware grounding, thermal relief, and mechanical fit-checks with 3D STEP models.",
    },
    {
        number: "05",
        title: "Pre-fab Verification",
        description:
            "DRC clean, EMC analysis, thermal simulation, and design-for-manufacture review before a single board is cut.",
    },
    {
        number: "06",
        title: "Fab & Assembly",
        description:
            "JLCPCB prototypes with full CI pipelines. Scale to qualified contract manufacturers for volume production.",
    },
    {
        number: "07",
        title: "Firmware & Integration",
        description:
            "When scope includes software: Wi-Fi, BLE, 4G connectivity, cloud back-ends (Next.js + Prisma), and mobile companion apps.",
    },
];

const featuredProjects: FeaturedProject[] = [
    {
        title: "Dynaboard — Button Controller",
        meta: "STM32F103 · USB-C power + data · 102 components · 4-layer board",
        description:
            "Professional-grade input interface for live performance, production control, and industrial systems. Dynaboard delivers rock-solid multi-button matrix scanning, seamless USB integration, and support for external button arrays.",
        image1: "https://raw.githubusercontent.com/manhoosbilli1/dynaboard-button-controller/main/reports/board-3d.png",
        image2: "https://raw.githubusercontent.com/manhoosbilli1/dynaboard-button-controller/main/reports/board-3d-back.png",
        repoUrl: "https://github.com/manhoosbilli1/dynaboard-button-controller",
        highlights: [
            "STM32F103C8T6 — main MCU (ARM Cortex-M3, 72 MHz)",
            "74LVC2G241 — dual buffer for clean digital output signaling",
            "LD1117 5 V + AMS1117 3.3 V — dual LDO rails",
            "BSS138 ×3 — small-signal level shifters (3.3 V ↔ 5 V)",
        ],
    },
    {
        title: "Stereo Audio Amplifier + Router",
        meta: "Analog signal path · Low-noise design · 4-layer board",
        description:
            "Studio-quality audio routing for embedded devices. This board handles multiple line inputs, switches between sources transparently, and delivers clean 150 mW stereo headphone output.",
        image1: "https://raw.githubusercontent.com/manhoosbilli1/tpa6110-stereo-amp-input-router/main/reports/board-3d.png",
        image2: "https://raw.githubusercontent.com/manhoosbilli1/tpa6110-stereo-amp-input-router/main/reports/board-3d-back.png",
        repoUrl: "https://github.com/manhoosbilli1/tpa6110-stereo-amp-input-router",
        highlights: [
            "TPA6110A2DGN — 150 mW stereo audio amp",
            "74AHC1G66 — automotive-grade analog switch (source select)",
            "TLV9001 + dual op-amp — rail-to-rail signal conditioning",
            "BAV99 — input clamping diodes",
        ],
    },
    {
        title: "High-Power LED Dimmer (Analog)",
        meta: "No MCU required · 5× parallel MOSFETs · Instant-on · Fully analog",
        description:
            "Zero-delay, rock-solid LED dimming with zero firmware risk. This 100% analog design ensures your LEDs fire instantly with no boot time and no software failure modes.",
        image1: "https://raw.githubusercontent.com/manhoosbilli1/led-dimmer-pot-controller/main/reports/board-3d.png",
        image2: "https://raw.githubusercontent.com/manhoosbilli1/led-dimmer-pot-controller/main/reports/board-3d-back.png",
        repoUrl: "https://github.com/manhoosbilli1/led-dimmer-pot-controller",
        highlights: [
            "TLC555CDR — PWM oscillator",
            "LM358 ×3 — op-amps for pot-to-duty conversion + gate drive shaping",
            "IRF540N ×5 — N-channel power MOSFETs in parallel",
            "L7805 — 5 V control rail",
        ],
    },
    {
        title: "QX RP2040 Controller Carrier",
        meta: "Raspberry Pi Pico · 12 V input · Dual solenoid drivers · Full control stack",
        description:
            "Turn your Pico into a complete control system. Pre-built power regulation, industrial-grade driver outputs, and everything you need for LCD displays, temperature sensing, and solenoid control.",
        image1: "https://raw.githubusercontent.com/manhoosbilli1/qx-rp2040-carrier/main/reports/board-3d.png",
        image2: "https://raw.githubusercontent.com/manhoosbilli1/qx-rp2040-carrier/main/reports/board-3d-back.png",
        repoUrl: "https://github.com/manhoosbilli1/qx-rp2040-carrier",
        highlights: [
            "MP1584EN-LF-Z — 3 A step-down buck converter",
            "L7805 — 5 V linear rail for clean analog I/O",
            "SMBJ18A — 18 V TVS on the supply input",
            "LCD / rotary switch / button / DS18B20 / dual solenoid connectors",
        ],
    },
    {
        title: "Smart Cube — Multi-Board Flex Assembly",
        meta: "nRF52832 BLE · BMI270 IMU · Complex interconnects · 3D form factor",
        description:
            "A showcase in hardware complexity: a 3D sensor cube where every face independently measures acceleration and orientation. Demonstrates advanced multi-board integration and flexible PCB routing.",
        image1: "https://raw.githubusercontent.com/manhoosbilli1/smart-cube-multi-pcb-flex-assembly/main/reports/board-3d.png",
        image2: "https://raw.githubusercontent.com/manhoosbilli1/smart-cube-multi-pcb-flex-assembly/main/reports/board-3d-back.png",
        repoUrl: "https://github.com/manhoosbilli1/smart-cube-multi-pcb-flex-assembly",
        highlights: [
            "nRF52832 — Nordic BLE MCU (ARM Cortex-M4F)",
            "BMI270 — Bosch 6-axis IMU (accel + gyro)",
            "74HC4051 ×3 — 8-channel analog muxes (24 sensor inputs)",
            "2450AT18A100E — ceramic chip antenna",
        ],
    },
    {
        title: "AC Enclosure Tamper Alarm",
        meta: "ATmega328 · Automatic AC/battery switchover · Precision monitoring",
        description:
            "Military-grade security monitoring for industrial enclosures. When AC fails, this board instantly switches to backup battery without dropping power. The watchdog that never sleeps.",
        image1: "https://raw.githubusercontent.com/manhoosbilli1/atmega328-enclosure-tamper-alarm/main/reports/board-3d.png",
        image2: "https://raw.githubusercontent.com/manhoosbilli1/atmega328-enclosure-tamper-alarm/main/reports/board-3d-back.png",
        repoUrl: "https://github.com/manhoosbilli1/atmega328-enclosure-tamper-alarm",
        highlights: [
            "ATmega328-A — main MCU",
            "LTC4412 — ideal-diode PowerPath (AC ↔ battery)",
            "LTC2960 — precision voltage supervisor",
            "LM5158-Q1 — automotive boost converter (backup rail)",
        ],
    },
    {
        title: "Battery-Powered Heater Controller",
        meta: "ATtiny · 10 A high-current switching · Flexible battery configs",
        description:
            "Portable heating on demand. This compact controller handles demanding heater loads on battery power, supports parallel/series cell configurations, and gives users visual feedback with RGB status.",
        image1: "https://raw.githubusercontent.com/manhoosbilli1/heater-controller-rev-a/main/reports/board-3d.png",
        image2: "https://raw.githubusercontent.com/manhoosbilli1/heater-controller-rev-a/main/reports/board-3d-back.png",
        repoUrl: "https://github.com/manhoosbilli1/heater-controller-rev-a",
        highlights: [
            "ATtiny — main MCU (in hierarchical sub-sheet)",
            "CSD17578Q3A — 30 V, 100 A, 1.8 mΩ N-MOSFET (10 A heater switching)",
            "WS2812B — RGB status LED",
            "USB-C charging (power-only, 6-pin)",
        ],
    },
];

export default function Capabilities() {
    return (
        <section className="min-h-screen bg-kindofwhite font-domine pt-16 pb-8">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl w-full">
                {/* Hero Section */}
                <motion.div
                    className="mb-16"
                    initial={{ opacity: 0, y: -40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-futura font-bold text-black mb-4">
                        Our Capabilities
                    </h1>
                    <p className="text-sexyblue/60 text-lg sm:text-xl font-fransisco max-w-2xl">
                        From concept to production: custom electronics, schematic design, PCB layout, and
                        manufacturing-ready hardware. We build everything from single-board prototypes to complex
                        multi-PCB flex assemblies.
                    </p>
                </motion.div>

                {/* Capabilities Matrix */}
                <div className="mb-20">
                    <motion.h2
                        className="text-3xl sm:text-4xl font-futura font-bold text-black mb-10"
                        initial={{ opacity: 0, y: -20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        Capabilities at a Glance
                    </motion.h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {capabilities.map((category, index) => (
                            <motion.div
                                key={index}
                                className="group relative overflow-hidden rounded-2xl bg-white border border-capistor-300/40 p-8 transition-all duration-300 hover:shadow-lg hover:border-capistor-400/60"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.05 }}
                                whileHover={{
                                    y: -4,
                                    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
                                }}
                            >
                                {/* Background accent */}
                                <div className="absolute -right-8 -top-8 w-24 h-24 bg-capistor-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                {/* Icon */}
                                <div className="text-5xl mb-4 relative z-10">{category.icon}</div>

                                {/* Title */}
                                <h3 className="text-xl font-futura font-bold text-black mb-5 relative z-10">
                                    {category.title}
                                </h3>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-2 relative z-10">
                                    {category.items.map((item, itemIndex) => (
                                        <motion.span
                                            key={itemIndex}
                                            className="inline-block bg-capistor-100 text-sexyblue text-xs sm:text-sm px-3 py-1.5 rounded-full font-fransisco transition-all duration-200 group-hover:bg-black group-hover:text-white cursor-default"
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            whileInView={{ opacity: 1, scale: 1 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.3, delay: itemIndex * 0.02 }}
                                        >
                                            {item}
                                        </motion.span>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Process Section */}
                <div>
                    <motion.h2
                        className="text-3xl sm:text-4xl font-futura font-bold text-black mb-10"
                        initial={{ opacity: 0, y: -20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        Our Process
                    </motion.h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {processSteps.map((step, index) => (
                            <motion.div
                                key={index}
                                className="group relative overflow-hidden rounded-2xl bg-white border border-capistor-300/40 p-8 transition-all duration-300"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.05 }}
                                whileHover={{
                                    y: -4,
                                    borderColor: "rgba(52, 58, 64, 0.6)",
                                    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
                                }}
                            >
                                {/* Step number background */}
                                <div className="absolute -right-6 -top-6 text-7xl font-futura font-bold text-capistor-100 opacity-50 group-hover:opacity-70 transition-opacity duration-300 select-none">
                                    {step.number}
                                </div>

                                {/* Step badge */}
                                <div className="inline-block bg-black text-white text-sm font-futura font-bold px-4 py-2 rounded-full mb-4 relative z-10">
                                    Step {step.number}
                                </div>

                                {/* Title */}
                                <h3 className="text-xl font-futura font-bold text-black mb-3 relative z-10">
                                    {step.title}
                                </h3>

                                {/* Description */}
                                <p className="text-sexyblue/75 text-sm sm:text-base font-fransisco leading-relaxed relative z-10">
                                    {step.description}
                                </p>

                                {/* Accent line */}
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-black via-sexyblue to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Featured Projects Section */}
                <div className="mt-20">
                    <motion.h2
                        className="text-3xl sm:text-4xl font-futura font-bold text-black mb-10"
                        initial={{ opacity: 0, y: -20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        Featured Projects
                    </motion.h2>

                    <div className="space-y-8">
                        {featuredProjects.map((project, index) => (
                            <motion.div
                                key={index}
                                className="group bg-white rounded-2xl overflow-hidden border border-capistor-300/40 transition-all duration-300 hover:shadow-xl"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.08 }}
                            >
                                <div className="grid grid-cols-1 gap-6">
                                    {/* Full-width images row (primary visual) */}
                                    <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6 p-4 lg:p-6">
                                        <div className="overflow-hidden rounded-lg border border-capistor-200/60 h-72 lg:h-[520px]">
                                            <img
                                                src={project.image1}
                                                alt={`${project.title} top view`}
                                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                        </div>

                                        <div className="overflow-hidden rounded-lg border border-capistor-200/60 h-72 lg:h-[520px]">
                                            <img
                                                src={project.image2}
                                                alt={`${project.title} bottom view`}
                                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                        </div>
                                    </div>

                                    {/* Content below images */}
                                    <div className="p-8 sm:p-10 flex flex-col justify-between">
                                        <div>
                                            <h3 className="text-2xl sm:text-3xl font-futura font-bold text-black mb-2">
                                                {project.title}
                                            </h3>
                                            <p className="text-sexyblue/60 text-sm sm:text-base font-fransisco mb-4">
                                                {project.meta}
                                            </p>
                                            <p className="text-sexyblue/80 text-base sm:text-lg font-fransisco mb-6 leading-relaxed">
                                                {project.description}
                                            </p>

                                            {/* Highlights */}
                                            <ul className="space-y-2 mb-6">
                                                {project.highlights.map((highlight, hIndex) => (
                                                    <motion.li
                                                        key={hIndex}
                                                        className="text-sexyblue text-sm sm:text-base font-fransisco flex items-start"
                                                        initial={{ opacity: 0, x: -10 }}
                                                        whileInView={{ opacity: 1, x: 0 }}
                                                        viewport={{ once: true }}
                                                        transition={{ duration: 0.3, delay: hIndex * 0.05 }}
                                                    >
                                                        <span className="text-black font-bold mr-3">•</span>
                                                        <span><strong>{highlight.split(" — ")[0]}</strong> — {highlight.split(" — ")[1]}</span>
                                                    </motion.li>
                                                ))}
                                            </ul>
                                        </div>

                                        <motion.a
                                            href={project.repoUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-block bg-black text-white px-6 py-3 rounded-lg font-futura font-bold transition-all duration-200 hover:bg-sexyblue w-fit"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            View Repository →
                                        </motion.a>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* CTA Section */}
                <motion.div
                    className="mt-16 sm:mt-20 rounded-2xl bg-black text-white p-12 text-center"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h3 className="text-2xl sm:text-3xl font-futura font-bold mb-4">
                        Ready to Build Something Amazing?
                    </h3>
                    <p className="text-white/80 font-fransisco mb-6 max-w-2xl mx-auto">
                        Let's discuss your hardware requirements and bring your vision to life with precision
                        engineering and proven expertise.
                    </p>
                    <motion.a
                        href="mailto:shoaib.mustafa7@hotmail.com"
                        className="inline-block bg-white text-black px-8 py-3 rounded-lg font-futura font-bold transition-all duration-200 hover:bg-capistor-100"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Get in Touch
                    </motion.a>
                </motion.div>
            </div>
        </section>
    );
}
