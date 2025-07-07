# FourSight Lab Website

A modern, responsive website for FourSight Lab - transforming data into intelligent decisions with AI-powered solutions.

## 🚀 Quick Start

1. **Download all files** and organize them in this structure:
```
foursight-lab/
├── index.html
├── css/
│   ├── main.css
│   ├── components.css
│   ├── animations.css
│   └── responsive.css
├── js/
│   ├── main.js
│   ├── cursor.js
│   ├── navigation.js
│   └── particles.js
├── icons/
│   └── lab-icon.svg
└── README.md
```

2. **Open the website**:
   - Simply open `index.html` in a web browser
   - Or use a local server for better performance

## 📁 File Structure

### HTML
- `index.html` - Main website file with all content sections

### CSS Files
- `css/main.css` - Core styles, variables, and base typography
- `css/components.css` - All component-specific styles
- `css/animations.css` - Keyframes and animation classes
- `css/responsive.css` - Media queries for all screen sizes

### JavaScript Files
- `js/main.js` - Main initialization and scroll animations
- `js/navigation.js` - Navigation menu and smooth scrolling
- `js/cursor.js` - Custom cursor effects
- `js/particles.js` - Floating particles animation

### Assets
- `icons/lab-icon.svg` - Lab icon for the logo

## 🛠️ Features

- **Custom Cursor**: Interactive cursor that responds to hover states
- **Smooth Scrolling**: Navigation links scroll smoothly to sections
- **Animated Particles**: Floating background particles for visual interest
- **Responsive Design**: Works perfectly on all devices
- **Scroll Animations**: Elements fade in as you scroll
- **Modern Design**: Clean, professional look with your brand colors

## 🎨 Customization

### Colors
Edit the CSS variables in `css/main.css`:
```css
:root {
    --primary: #2563eb;
    --secondary: #7c3aed;
    --accent: #0891b2;
    /* ... other colors */
}
```

### Content
All content is in `index.html`. Simply edit the text between the HTML tags.

### Adding New Sections
1. Add the HTML section in `index.html`
2. Add styles in `css/components.css`
3. Add to navigation menu if needed

## 🚀 Deployment

### Option 1: GitHub Pages (Free)
1. Create a GitHub repository
2. Push all files to the repository
3. Go to Settings → Pages
4. Select source: "Deploy from a branch"
5. Select branch: main, folder: / (root)
6. Your site will be live at `https://[username].github.io/[repository-name]`

### Option 2: Vercel (Recommended)
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project directory
3. Follow the prompts
4. Your site will be deployed instantly

### Option 3: Netlify
1. Go to [netlify.com](https://netlify.com)
2. Drag and drop your project folder
3. Your site is instantly deployed

### Option 4: Traditional Hosting
1. Upload all files to your web server
2. Make sure `index.html` is in the root directory
3. Done!

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## ⚡ Performance Tips

1. **Optimize Images**: Compress any images you add
2. **Minify Code**: Use online tools to minify CSS and JS for production
3. **Enable Caching**: Configure your server to cache static assets
4. **Use CDN**: Consider using a CDN for better global performance

## 🐛 Troubleshooting

### Custom cursor not showing?
- Make sure you're not on a touch device
- Check that JavaScript is enabled

### Animations not working?
- Ensure all JS files are properly linked
- Check browser console for errors

### Mobile menu not working?
- Verify `navigation.js` is loaded
- Check for JavaScript errors

## 📄 License

© 2025 FourSight Lab. All rights reserved.

## 🤝 Support

For support, email info@foursightlab.com