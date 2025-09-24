# GitHub Pages Setup Guide

## 🚨 **IMPORTANT: Follow These Steps Exactly**

### **Step 1: Enable GitHub Pages**

1. **Go to your repository**: https://github.com/galvaro94/Implementing-Data-Governance-Game-Week-2

2. **Click on "Settings"** (top menu bar of the repository)

3. **Scroll down to "Pages"** (left sidebar menu)

4. **Configure Pages**:
   - **Source**: Select "**GitHub Actions**" (NOT "Deploy from a branch")
   - **Branch**: Leave empty (this will be handled by Actions)
   - Click "**Save**"

### **Step 2: Enable Workflow Permissions**

**IMPORTANT**: GitHub requires additional permissions for deployment:

1. **Go to repository Settings** → **Actions** → **General**
2. **Scroll to "Workflow permissions"**
3. **Select "Read and write permissions"**
4. **Check "Allow GitHub Actions to create and approve pull requests"**
5. **Click "Save"**

### **Step 3: Run the Deployment**

After enabling permissions:

1. **Go to "Actions" tab** in your repository

2. **Try these workflows in order**:
   - ✅ **"Deploy to GitHub Pages"** - Fixed permissions version
   - 🔄 **"Deploy to GitHub Pages (Backup Method)"** - If first fails

3. **Click "Run workflow"** (if it doesn't start automatically)

4. **Wait for completion** - Should take 2-3 minutes

### **Step 4: Access Your Game**

Once successful, your game will be available at:
```
https://galvaro94.github.io/Implementing-Data-Governance-Game-Week-2/
```

---

## 🛠 **Troubleshooting**

### **If you still get "Not Found" error:**

1. **Check repository is public** (GitHub Pages requires public repos for free accounts)
2. **Verify Pages is enabled** in Settings → Pages
3. **Try the simple workflow** first

### **If build fails:**

1. Check the Actions tab for detailed error logs
2. Try running `npm run build` locally first
3. Make sure all dependencies are correctly listed in package.json

### **If deployment succeeds but site shows 404:**

1. Wait 5-10 minutes for GitHub's CDN to update
2. Check that the base path is correct in `vite.config.js`
3. Try accessing with `/index.html` at the end

---

## 🎯 **Quick Setup Checklist**

- [ ] Repository is public
- [ ] Go to Settings → Pages
- [ ] Set Source to "GitHub Actions"
- [ ] Save settings
- [ ] Go to Actions tab
- [ ] Run "Deploy to GitHub Pages (Simple)" workflow
- [ ] Wait for green checkmark
- [ ] Visit: https://galvaro94.github.io/Implementing-Data-Governance-Game-Week-2/

---

## 📱 **Alternative: Use Netlify (Instant)**

If GitHub Pages continues to have issues:

1. Go to [netlify.com](https://netlify.com)
2. "New site from Git"
3. Connect GitHub account
4. Select your repository
5. Build command: `npm run build`
6. Publish directory: `dist`
7. Deploy site

You'll get a URL like: `https://amazing-name-123456.netlify.app`

---

## 🆘 **Still Having Issues?**

1. **Make repository public** (if it's private)
2. **Try the simple workflow** instead of the advanced one
3. **Use Netlify** as backup deployment option
4. **Check Actions logs** for specific error messages