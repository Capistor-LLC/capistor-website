import { motion } from "framer-motion";

interface CapabilityCategory {
    title: string;
    items: string[];
    icon: string;
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

export default function Capabilities() {
    return (
        <section className="min-h-screen flex items-center bg-kindofwhite py-14 sm:py-20">
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
