# ⚡ Quick Vercel Deployment

## 🎯 You Have Vercel CLI Installed!

Deploy in 3 simple commands:

### **Step 1: Login (if not logged in)**
```bash
vercel login
```

### **Step 2: Deploy**
```bash
vercel
```

Follow prompts:
- Set up and deploy? **Yes**
- Which scope? (Your account)
- Link to existing project? **No** (first time)
- Project name: `chouieur-express-frontend`
- Directory: `.` (current directory)
- Override settings? **No**

### **Step 3: Set Environment Variables**
After first deploy, set environment variables:

```bash
vercel env add NEXT_PUBLIC_API_URL production
# Enter: https://chouieur-express-backend.onrender.com

vercel env add NODE_ENV production
# Enter: production
```

### **Step 4: Deploy to Production**
```bash
vercel --prod
```

## ✅ That's It!

Your site will be live at: `https://your-project.vercel.app`

## 🔗 Or Use Dashboard

If you prefer GUI:
1. Go to: https://vercel.com/new
2. Import: `scriptkid-py/chouieur-food`
3. Vercel auto-detects Next.js
4. Add environment variables
5. Deploy!

---

**Vercel handles Next.js perfectly - should work immediately!** 🚀

