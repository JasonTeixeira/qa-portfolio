# 📄 Resume Compilation Instructions

Your professional LaTeX resume is ready! Follow these steps to generate the PDF.

---

## ✅ What You Have

- **File Location:** `/Users/Sage/Desktop/qa-portfolio/resume.tex`
- **Format:** LaTeX (ATS-optimized, professional)
- **Content:** 8+ years experience, NO "senior" titles, all metrics included
- **Style:** One-page, modern, recruiter-friendly

---

## 🚀 Option 1: Overleaf (EASIEST - Recommended)

**Perfect if you don't have LaTeX installed**

### Steps:
1. Go to [https://www.overleaf.com](https://www.overleaf.com)
2. Create free account (or login)
3. Click "New Project" → "Upload Project"
4. Upload `resume.tex` file
5. Click "Recompile" button (or it auto-compiles)
6. Click "Download PDF"
7. Save as: `resume.pdf`

**Time:** 2 minutes  
**Cost:** FREE  
**Pros:** No installation needed, online editor, instant preview

---

## 🖥️ Option 2: Local Compilation (Mac)

**For developers who want local control**

### Install LaTeX (One-time setup):
```bash
# Using Homebrew (takes 5-10 minutes)
brew install mactex

# Or download from: https://tug.org/mactex/
```

### Compile Resume:
```bash
cd /Users/Sage/Desktop/qa-portfolio
pdflatex resume.tex
```

**Output:** Creates `resume.pdf` in same directory

### Clean up auxiliary files:
```bash
rm resume.aux resume.log resume.out
```

---

## 📝 What to Update Before Compiling

**IMPORTANT:** Update these placeholders in `resume.tex`:

1. **Line 85:** Replace `(Your Phone)` with your actual phone number
2. **Line 85:** Replace `your.email@example.com` with your actual email

### Quick Update:
```bash
# Open file and edit:
nano /Users/Sage/Desktop/qa-portfolio/resume.tex

# Find and replace:
# (Your Phone) → Your actual phone
# your.email@example.com → Your actual email

# Save: Ctrl+O, Enter, Ctrl+X
```

---

## ✅ After Compiling

### Move PDF to Portfolio:
```bash
# After you have resume.pdf, copy it:
cp /Users/Sage/Desktop/qa-portfolio/resume.pdf /Users/Sage/Desktop/qa-portfolio/public/resume.pdf
```

Now the "Download Resume" button on your website will work!

---

## 📋 Resume Highlights

Your resume includes:

✅ **Professional Summary:** 8+ years, quantified achievements  
✅ **Technical Skills:** Python, Selenium, API Testing, CI/CD  
✅ **Experience:**
- QA Automation Engineer at HighStrike Capital (2022-Present)
- Systems QA Engineer at The Home Depot (2021-2022)
- Systems QA Engineer at The Home Depot (2019-2021)

✅ **Projects:**
- Performance Testing Suite (JMeter, Locust)
- Mobile Test Automation (Appium, Python)
- BDD Test Framework (Behave, Gherkin)

✅ **Certifications:** ISTQB Certified Tester

✅ **Metrics Included:**
- 70% reduction in regression time
- 93% faster mobile testing
- $2M+ prevented trading errors
- 500+ automated tests
- 99.5% test stability

---

## 🎯 ATS Optimization

Your resume is optimized for Applicant Tracking Systems:

✅ Simple LaTeX formatting (no complex tables)  
✅ Standard section headers  
✅ Keywords front-loaded  
✅ Quantified achievements  
✅ One-page format  
✅ No graphics/photos (ATS-friendly)  

**Will parse correctly through:** Greenhouse, Lever, Workday, iCIMS, etc.

---

## 📞 Need Help?

**LaTeX not compiling?**
- Try Overleaf (Option 1) - it's foolproof
- Check you have `fontawesome5` package installed

**Want to customize?**
- Edit `resume.tex` with any text editor
- Recompile after changes
- See LaTeX guide: https://www.overleaf.com/learn

---

## ⚡ Quick Reference

```bash
# Compile (if LaTeX installed):
cd /Users/Sage/Desktop/qa-portfolio
pdflatex resume.tex

# Copy to website:
cp resume.pdf public/resume.pdf

# Or use Overleaf:
https://www.overleaf.com → Upload resume.tex → Download PDF
```

---

**Your resume is professional, ATS-optimized, and ready to impress recruiters! 🚀**
