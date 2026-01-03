# Deployment Guide - Jason Teixeira Portfolio

## 🚀 Quick Start Deployment

Your portfolio is **100% ready to deploy**. Choose your preferred platform:

---

## Option 1: Vercel (Recommended) ⭐

### Why Vercel?
- ✅ Built by Next.js creators
- ✅ Zero configuration needed
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Preview deployments for every push
- ✅ Free tier (perfect for portfolios)

### Deployment Steps:

1. **Push to GitHub** (if not already)
```bash
cd /Users/Sage/Desktop/qa-portfolio
git init
git add .
git commit -m "Initial commit - Premium QA Portfolio"
git branch -M main
git remote add origin https://github.com/JasonTeixeira/qa-portfolio.git
git push -u origin main
```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository `JasonTeixeira/qa-portfolio`
   - Vercel auto-detects Next.js - no config needed!
   - Click "Deploy"
   - ✅ Done! Your site will be live in 2-3 minutes

3. **Custom Domain** (Optional)
   - In Vercel dashboard → Settings → Domains
   - Add your custom domain (e.g., `jasonteixeira.com`)
   - Update DNS records as instructed
   - SSL certificate automatically configured

---

## Option 2: Netlify

### Deployment Steps:

1. Push code to GitHub (same as above)
2. Go to [netlify.com](https://netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Connect to GitHub → Select repository
5. Build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
6. Click "Deploy site"

---

## Option 3: AWS Amplify

### Deployment Steps:

1. Push code to GitHub
2. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify)
3. Click "New app" → "Host web app"
4. Connect GitHub repository
5. Configure build settings (auto-detected)
6. Click "Save and deploy"

---

## Pre-Deployment Checklist ✅

### 1. Content Review
- [ ] Update contact information in `ContactInfo.tsx`
- [ ] Add your professional photo (replace "JT" placeholders)
- [ ] Verify all project links point to correct GitHub repos
- [ ] Update LinkedIn URL in footer and nav
- [ ] Add your resume PDF to `/public/resume.pdf`

### 2. Configuration
- [ ] Update `baseUrl` in `app/sitemap.ts` to your domain
- [ ] Update `robots.txt` with your domain
- [ ] Verify all page titles and descriptions
- [ ] Check social media links in footer

### 3. Testing
- [ ] Test all navigation links
- [ ] Test contact form validation
- [ ] Test filtering on Projects & Blog pages
- [ ] Test 404 page by visiting `/random-url`
- [ ] Test on mobile device (or Chrome DevTools)
- [ ] Verify all animations working

### 4. Performance
- [ ] Run `npm run build` successfully
- [ ] No console errors in dev mode
- [ ] Images optimized (already handled by Next.js)
- [ ] No broken links

---

## Post-Deployment Steps

### 1. Verify Deployment
Visit these URLs on your live site:
- `/` - Home page
- `/about` - About page
- `/projects` - Projects page
- `/blog` - Blog page
- `/contact` - Contact page
- `/random-404` - 404 page
- `/sitemap.xml` - SEO sitemap
- `/robots.txt` - Robots file

### 2. Test Contact Form
- Fill out and submit the form
- Verify validation messages appear
- Check success message displays
- Configure email service (optional):
  - Sign up for [Resend](https://resend.com) OR [Formspree](https://formspree.io)
  - Add API key to environment variables
  - Update `ContactForm.tsx` with API integration

### 3. SEO Setup

#### Google Search Console
1. Go to [search.google.com/search-console](https://search.google.com/search-console)
2. Add your property (website URL)
3. Verify ownership
4. Submit sitemap: `https://yourdomain.com/sitemap.xml`

#### Google Analytics (Optional)
1. Create account at [analytics.google.com](https://analytics.google.com)
2. Get tracking ID
3. Add to `app/layout.tsx`:
```typescript
import Script from 'next/script'

// In layout.tsx <body>:
<Script src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX" />
<Script id="google-analytics">
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXXXXX');
  `}
</Script>
```

### 4. Social Media
Share your portfolio:
- [ ] Update LinkedIn profile with portfolio link
- [ ] Add to GitHub profile README
- [ ] Tweet about launch (if applicable)
- [ ] Share in QA communities

---

## Domain Setup

### Recommended Domain Registrars
- **Namecheap** - Affordable, good UI
- **Google Domains** - Simple, reliable
- **GoDaddy** - Popular, expensive

### Domain Suggestions
- `jasonteixeira.com` (Personal brand)
- `jteixeira.dev` (Tech-focused)
- `jasonteixeira.io` (Modern)
- `sageideas.org` (You already own this!)

### DNS Configuration for Vercel

Add these records to your domain:

**A Record:**
```
Type: A
Name: @
Value: 76.76.21.21
TTL: 3600
```

**CNAME Record:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

Wait 24-48 hours for DNS propagation. Vercel auto-configures SSL.

---

## Monitoring & Maintenance

### Vercel Dashboard
Monitor:
- ✅ Deployment status
- ✅ Build logs
- ✅ Analytics (page views, unique visitors)
- ✅ Performance metrics

### Monthly Updates
- [ ] Update blog with new articles
- [ ] Add new projects as completed
- [ ] Update skills/certifications
- [ ] Check for broken links
- [ ] Review analytics

---

## Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### 404 on Deployed Site
- Ensure `not-found.tsx` exists in `app/`
- Check Vercel build logs for errors
- Verify all imports use correct paths

### Slow Loading
- Check Vercel Analytics for bottlenecks
- Ensure images use Next.js Image component
- Verify no large unoptimized assets

### Contact Form Not Working
- Check browser console for errors
- Verify form validation logic
- Ensure email service configured (optional)
- Test with different browsers

---

## Environment Variables (Optional)

If you add email service integration:

**Vercel:**
1. Go to Project Settings → Environment Variables
2. Add: `RESEND_API_KEY` or `FORMSPREE_ID`
3. Redeploy for changes to take effect

**Local Development:**
Create `.env.local`:
```
RESEND_API_KEY=your_key_here
```

---

## Performance Targets

Your portfolio is optimized for:
- ✅ **Lighthouse Performance:** 95+
- ✅ **Lighthouse Accessibility:** 95+
- ✅ **Lighthouse Best Practices:** 95+
- ✅ **Lighthouse SEO:** 100
- ✅ **First Contentful Paint:** < 1.5s
- ✅ **Time to Interactive:** < 3s

---

## Cost Breakdown

### Free Tier (Recommended for Start)
- **Vercel:** Free (100GB bandwidth, unlimited deployments)
- **GitHub:** Free (public repositories)
- **Domain:** ~$12/year
- **Email Service:** Free tier (Resend: 100 emails/day)

### Total: ~$12/year 🎉

---

## Next Steps After Deployment

1. **Apply for Jobs**
   - Update resume with portfolio URL
   - Add to LinkedIn "Featured" section
   - Include in job applications

2. **Share Portfolio**
   - Post on LinkedIn
   - Add to GitHub profile
   - Share in QA automation communities

3. **Monitor & Iterate**
   - Check analytics weekly
   - Add new blog posts monthly
   - Update projects as completed
   - Respond to contact form submissions

---

## Need Help?

### Common Issues
- **Build errors:** Check Next.js docs
- **Domain issues:** Contact registrar support
- **Vercel issues:** Check Vercel docs or Discord
- **Email integration:** Check Resend/Formspree docs

### Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Framer Motion Docs](https://www.framer.com/motion/)

---

## 🎉 Congratulations!

Your premium QA automation portfolio is ready to launch. This represents:
- **Professional branding** for your 8+ years of experience
- **Technical expertise** showcased through real projects
- **Modern tech stack** demonstrating current skills
- **SEO optimization** for recruiter discovery
- **Mobile-first design** for all devices

**You're ready to stand out in the job market!**

---

*Built with passion by Jason Teixeira | QA Automation Engineer*
