export interface ProductImage {
  url: string;
  alt: string;
  thought: string;
  detail: string;
}

export interface Product {
  products: any;

  id: number;
  name: string;
  images: ProductImage[];
}

export const loadProducts = async (): Promise<Product[]> => {
  return getFallbackProducts();
};

export const getFallbackProducts = (): Product[] => [
  {
    id: 1,
    name: "Smart Watch",
    images: [
      {
        url: "/product_images/smartWatch.jpg",
        alt: "Smart Watch",
        thought: "Wearable tech companion",
        detail:
          "An ESP32-based smart watch for health monitoring and notifications. Features OLED display, heart rate sensor, accelerometer, and Bluetooth connectivity. Custom firmware in C++ handles real-time data processing and mobile app integration for a seamless wearable experience.",
      },
    ],

    products: undefined,
  },
  {
    id: 2,
    name: "Industrial Board",
    images: [
      {
        url: "/product_images/IndustrialioT.png",
        alt: "Industrial Control Board",
        thought: "Reliable power and signal backbone",
        detail:
          "Industrial-grade PCB built for reliability and safety. With noise resistance, EMI/EMC shielding, and CE compliance, it delivers stable performance in harsh environments. Simulation-tested for precision, it powers prototypes and production systems via USB-C for automation and IoT use.",
      },
    ],

    products: undefined,
  },
];
