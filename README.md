# Jason Teixeira - QA Automation Portfolio

A premium Next.js 14 portfolio showcasing 8+ years of test automation expertise, ISTQB certifications, and real-world projects from Fortune 50 companies and fintech startups.

## 🚀 Built With

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Fonts:** Inter + JetBrains Mono

## ✨ Features

- **Home Page:** Animated typing effect, stats bar, featured projects, testing philosophy
- **About Page:** Professional journey, skills visualization, ISTQB certifications, career timeline
- **Projects Page:** 6 detailed project showcases with metrics, filtering, and search
- **Blog Page:** 10 technical articles with category filtering and newsletter CTA
- **Contact Page:** Functional contact form with validation and availability status
- **404 Page:** Custom error page with helpful navigation
- **SEO Optimized:** Meta tags, sitemap, robots.txt
- **Dark Theme:** Professional dark design with teal (#06b6d4) accents
- **Fully Responsive:** Mobile-first design, works perfectly on all devices
- **Performance:** Optimized for 95+ Lighthouse score

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/JasonTeixeira/qa-portfolio.git
cd qa-portfolio

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Configure environment variables (if any)
6. Click "Deploy"

Vercel will automatically:
- Build your project
- Provide HTTPS
- Set up global CDN
- Enable preview deployments
- Configure custom domain

### Environment Variables

No environment variables required for basic deployment. Optional:
- Email service integration (Resend, Formspree, etc.) for contact form

## 🎯 Portfolio Structure

```
qa-portfolio/
├── app/                      # Next.js App Router pages
│   ├── page.tsx             # Home page
│   ├── about/               # About page
│   ├── projects/            # Projects page
│   ├── blog/                # Blog page
│   ├── contact/             # Contact page
│   ├── not-found.tsx        # 404 page
│   ├── layout.tsx           # Root layout
│   ├── globals.css          # Global styles
│   ├── sitemap.ts           # SEO sitemap
│   └── robots.txt           # SEO robots file
├── components/
│   ├── ui/                  # Reusable UI components
│   │   ├── Navigation.tsx
│   │   └── Footer.tsx
│   └── sections/            # Page sections
│       ├── Hero.tsx
│       ├── about/           # About page sections
│       ├── projects/        # Projects page sections
│       ├── blog/            # Blog page sections
│       └── contact/         # Contact page sections
├── public/                  # Static assets
└── tailwind.config.ts       # Tailwind configuration
```

## 🎨 Customization

### Colors
Edit `tailwind.config.ts`:
```typescript
colors: {
  primary: "#06b6d4",        // Teal accent
  dark: "#0a0a0a",           // Background
  "dark-card": "#1a1a1a",    // Card background
  "dark-lighter": "#2a2a2a"  // Lighter dark
}
```

### Content
- **Projects:** Edit `components/sections/projects/ProjectsGrid.tsx`
- **Blog Posts:** Edit `components/sections/blog/BlogGrid.tsx`
- **About Info:** Edit `components/sections/about/*`
- **Contact Info:** Edit `components/sections/contact/ContactInfo.tsx`

### Add Your Photo
Replace the "JT" placeholder in:
- `components/sections/AboutPreview.tsx`
- `components/sections/about/AboutHero.tsx`

## 📊 Performance Optimization

Built-in optimizations:
- ✅ Next.js Image component for automatic image optimization
- ✅ Font optimization with `next/font`
- ✅ Code splitting by route
- ✅ Lazy loading with Framer Motion viewport detection
- ✅ Semantic HTML for accessibility
- ✅ SEO meta tags on all pages

## 🔧 Development Tips

```bash
# Run development server
npm run dev

# Type checking
npm run type-check

# Lint code
npm run lint

# Build for production
npm run build

# Test production build locally
npm run build && npm start
```

## 📱 Mobile Responsive

Tested on:
- iOS (iPhone 12, 13, 14, 15)
- Android (Pixel, Samsung)
- Tablets (iPad, Surface)
- Desktop (Chrome, Firefox, Safari, Edge)

## 🌟 Key Metrics Displayed

- **8+ years** of QA automation experience
- **500+ automated tests** in production
- **3 ISTQB certifications** (CTFL, TAE, CT-AI)
- **Fortune 50 experience** (The Home Depot)
- **Fintech expertise** (HighStrike)
- **6 AWS certifications**

## 📧 Contact Form Integration

The contact form is set up with client-side validation. To enable email sending:

### Option 1: Resend (Recommended)
```bash
npm install resend
# Add RESEND_API_KEY to .env.local
```

### Option 2: Formspree
- Sign up at formspree.io
- Update form action in `ContactForm.tsx`

### Option 3: EmailJS
- Sign up at emailjs.com
- Install EmailJS SDK
- Configure in `ContactForm.tsx`

## 🔐 Security

- No sensitive data exposed
- Client-side form validation
- Environment variables for API keys
- HTTPS enforced (via Vercel)
- No inline scripts (CSP friendly)

## 📈 Analytics (Optional)

Add Vercel Analytics or Google Analytics 4:

```bash
# Vercel Analytics
npm install @vercel/analytics
# Add to app/layout.tsx
```

## 📄 License

MIT License - feel free to use for your own portfolio

## 👤 Author

**Jason Teixeira**
- Email: sage@sageideas.org
- Phone: (908) 937-6568
- Location: Orlando, FL (Remote-First)
- LinkedIn: [linkedin.com/in/jasonteixeira](https://www.linkedin.com/in/jasonteixeira)
- GitHub: [github.com/JasonTeixeira](https://github.com/JasonTeixeira)

---

Built with ❤️ using Next.js, TypeScript, and Tailwind CSS
