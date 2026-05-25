# How to Add Products Manually

## Quick Overview
The website currently uses a manual product configuration system. Products are defined in the `getFallbackProducts()` function in `/src/utils/productLoader.ts`.

## Step-by-Step Guide

### 1. Add Your Product Images
1. Place your product images in `/public/product_images/` folder
2. Supported formats: `.jpg`, `.png`, `.webp`
3. Recommended size: 1200x800px for best quality

### 2. Add Product Data
Edit the file `/src/utils/productLoader.ts` and modify the `getFallbackProducts()` function:

```typescript
export const getFallbackProducts = (): Product[] => [
    // Existing products...
    
    // Add your new product here:
    {
        id: 4, // Increment the ID number
        name: "Your Product Name",
        category: "Your Category", // e.g., "Hardware", "Software", "IoT Solutions"
        images: [
            {
                url: "/product_images/your-image1.jpg", // Path to your image
                alt: "Descriptive alt text for accessibility",
                thought: "Short catchy phrase that appears in thought bubble",
                detail: "Detailed description that explains the features and benefits of this aspect of your product."
            },
            {
                url: "/product_images/your-image2.jpg",
                alt: "Another descriptive alt text",
                thought: "Another catchy phrase",
                detail: "Another detailed description for the second image."
            }
            // Add more images as needed
        ]
    }
];
```

### 3. Product Structure Explained

#### Required Fields:
- **id**: Unique number for each product
- **name**: Product name (displayed as heading)
- **category**: Product category (displayed as subheading)
- **images**: Array of ProductImage objects

#### ProductImage Structure:
- **url**: Path to the image file (relative to /public/)
- **alt**: Alternative text for screen readers and accessibility
- **thought**: Short phrase that appears in the animated thought bubble
- **detail**: Longer description that provides context and details

### 4. Example: Adding a New Product

Let's say you want to add a "Smart Thermostat" product:

1. **Add images**: Place `thermostat-main.jpg` and `thermostat-app.jpg` in `/public/product_images/`

2. **Add product data**:
```typescript
{
    id: 4,
    name: "Smart Thermostat",
    category: "Climate Control",
    images: [
        {
            url: "/product_images/thermostat-main.jpg",
            alt: "Smart Thermostat Wall Unit",
            thought: "Perfect temperature, always",
            detail: "AI-powered thermostat that learns your schedule and preferences to maintain optimal comfort while reducing energy costs by up to 30%."
        },
        {
            url: "/product_images/thermostat-app.jpg",
            alt: "Thermostat Mobile App Interface",
            thought: "Control from anywhere",
            detail: "Intuitive mobile app allows remote temperature control, scheduling, and energy usage tracking with detailed analytics."
        }
    ]
}
```

### 5. Tips for Best Results

#### Image Guidelines:
- Use high-quality images (minimum 1000px wide)
- Consistent aspect ratios work best
- Consider using product mockups or professional photography
- Optimize images for web (compress without losing quality)

#### Content Guidelines:
- **Thought bubbles**: Keep them short and impactful (2-6 words)
- **Details**: Be specific about benefits and features
- **Categories**: Use consistent naming for related products
- **Alt text**: Describe what's visible in the image for accessibility

#### Navigation:
- Users can scroll through products vertically
- Within each product, users can cycle through images using mouse wheel
- Each image shows its own thought bubble and detail text

### 6. Testing Your Changes

After adding products:
1. Save the file
2. The development server will automatically reload
3. Navigate to your website
4. Scroll down to see your new products
5. Use mouse wheel over product images to cycle through them

### 7. Future Improvements

The current system is manual but functional. Future enhancements could include:
- Automatic folder scanning for dynamic product loading
- CMS integration for easier content management
- Admin interface for non-technical users
- Database integration for larger product catalogs

## Current Product Examples

Check the existing products in `getFallbackProducts()` for reference:
- Smart IoT Controller (2 images)
- Automation Dashboard (1 image)  
- Smart Hardware (3 images)

Each demonstrates different aspects of the product structure and content approach.
