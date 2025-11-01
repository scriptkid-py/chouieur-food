# 🔧 Setup Google Sheets on Render

Follow these steps to connect your menu to Google Sheets on Render:

## 1️⃣ Go to Render Dashboard
Visit: https://dashboard.render.com

## 2️⃣ Select Your Backend Service
Click on: **chouieur-express-backend** (or **chouieur-express-backend-h74v**)

## 3️⃣ Go to Environment Variables
- Click **"Environment"** tab (in the left sidebar)
- Or click **"Environment Variables"** button

## 4️⃣ Add These 3 Environment Variables

Click **"Add Environment Variable"** and add each one:

### Variable 1: GOOGLE_SHEETS_ID
- **Key:** `GOOGLE_SHEETS_ID`
- **Value:** `1af4gEzHbpQfqt8HLHDdfXVGwZBsiy4lvN-JeWLtj4mI`
- Click **Save**

### Variable 2: GOOGLE_SERVICE_ACCOUNT_EMAIL
- **Key:** `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- **Value:** `chouieur-menu@iconic-medley-476514-j3.iam.gserviceaccount.com`
- Click **Save**

### Variable 3: GOOGLE_PRIVATE_KEY
- **Key:** `GOOGLE_PRIVATE_KEY`
- **Value:** Copy the ENTIRE key below (including the quotes and \n):
```
"-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC6NXoAqVI+nmkH\nZghlGgHCDBjOoSS9r8t9SODEX7qneFJqBVMD++kPN65STaE1593jhGU7YrHbO6aQ\nfNycWsftSEHwaorr0lKTC5En/zx4obkAmfLmehTWgQkt+9WXGw0M7sqGVx32hA57\n/CxF/SqzqXUJiKaON65dAKlYE2rhd52GGT+Rj9bOfVqHL7X0hbstOmHtqtbT+S0X\njsxT8vH/B/KH9pYgCUL/fmPccy0ix7T0bq8vCYJhhE0EJzQVNs5Cd8OhRPCcbU0v\nm9khw1i+8v6O1G2ILCEWH6Gw8eHs++dSYgIyes/givubmoI2XyDp1VeDIp2ZMlPW\nT1qnQKCvAgMBAAECggEALlb/mSmKH65Begdg4HQz6swi4k1E/PXCQNgBo60lIOc3\nL05K5gtraQ+U0MOj8mvVEvlQThKWK3ZxUbTZHAoVhg38501EzIInrZNr2NXSgTzR\n8v3c7pGEHQu4spphAb0IJqdIfF0yxjX/+sf7ZqGF3nc1+pzowizGNjvjaNlQOHKk\n7N9d9fynrKS4Y4joyu/ThV4X/HdEHTxbb8i0Nv31WRcF9Yde+NBXpJOtBRJQYsO7\ndEo7uFdjP9CA4vBNIvA/BFR+4u+eJn2iXSu8r5q1L8Z8HQN00ur5Ei67AktEZE2d\n3+GHyIWsIrmehDqKAOKGzRbPaLTrxPA2FgEwJ/jklQKBgQDfT3Sz7vxH+PqTrEV4\nKGp7HNmSfDJ2e4IshsSu4bCqLJus5N9qymtrSApOQSq1kmku4OmH32bAFWo+xTa5\nQJ5T7ieg4/dKT5zW36z9v+v9jHuquOKBgyCBiQSQp21GoBykWdbH7YqzTOLfr/m0\nCQ6+sqYCv5ApTDwo8Ub3gAiYTQKBgQDVd6UK4UgWVgzTbIaMcEPdguGj/qe3IXsc\nqO2m0WJRwctuNhz+HDvJv4Qx+VCXMN7inyjz8YrMCqLWqnjnVfGEJ3HbIDbBTcx4\nPvazFZD+IDFe2MTuTDNDvZxSu+Uk7s252O7PiHrphKGZYEZd+QFff48iSsB9/Mzu\nzDZmEfka6wKBgH/oIO5XOsV2xQAEsp3KeIMf2TdgT/8xazRZ1RpeRzSR7HExfw7J\n9pEyaES+atopjHm/dcPPoCjxmzNs/pVJf+aPCL/NE33K8AjbgViur1tBNixpTcPk\n+Z94fdblL2A+oWk51B4b31An/+MkBqCqd3mfFhuI4efltKe223E0MrgZAoGBAKbA\nptmf8Esafzxta5GrZShVxGPyWxtweRaDU9pbeF17cKmwded/MKlCBUdwhacFkyce\nw8QELLOFn3zngDjeZyMgGQ3e1Ucduhs4vEhbEX+isE5yMSwhtG43YTUz+CVosqZ6\nMttFtxZR+Fay4WUpTgxGvg5ArKv/XiwwtFH5uklvAoGAUKMki0xhqzQd4Jcucj25\nrzvXfUI0PTaNLt80jptPDksOgvV8vplzLNz/493iGYuBBa8pT3aIV5SxJqQjlfKd\nelNvNUHpSDutT/NPRlt1+4AXIpfAxfIQo/dB3NJ8YgtzlPlVAN6yamt1yXk1l45S\nlwr20+75ACQF4WnvyzHG1rM=\n-----END PRIVATE KEY-----\n"
```
- Click **Save**

## 5️⃣ Save All Changes
- Render should show "Changes saved" or similar
- Service will automatically **restart** with new environment variables

## 6️⃣ Wait for Restart
- Go to **"Events"** tab to see the restart progress
- Wait about 1-2 minutes for the restart to complete

## 7️⃣ Verify Connection
After restart, check the **"Logs"** tab. You should see:
```
✅ Google Sheets client initialized
```

If you see:
```
⚠️  Google Sheets credentials not configured, will use MongoDB only
```
Then one or more environment variables are missing.

## 8️⃣ Test the Connection
1. Go to your frontend: https://chouieur-express-frontend-mr8j4sfx3-scriptkid-pys-projects.vercel.app/admin/menu
2. Try to create a menu item with an image
3. Check the Google Sheet: https://docs.google.com/spreadsheets/d/1af4gEzHbpQfqt8HLHDdfXVGwZBsiy4lvN-JeWLtj4mI/edit
4. You should see the new menu item appear in the sheet!

---

## ✅ That's It!

Your menu items will now be saved to Google Sheets instead of MongoDB!

