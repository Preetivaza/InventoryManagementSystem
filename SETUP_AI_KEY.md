# 🔑 How to Add OpenAI API Key - Step by Step

## Quick Guide

### Step 1: Get Your API Key

1. **Visit OpenAI Platform**: Go to [https://platform.openai.com](https://platform.openai.com)
2. **Sign up / Log in**:
   - Create account (or sign in if you have one)
   - Use Google/Microsoft account or email

3. **Navigate to API Keys**:
   - Click your profile icon (top right)
   - Select "View API keys" or go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)

4. **Create New Key**:
   - Click **"Create new secret key"** button
   - Give it a name (e.g., "InventoTrack")
   - Click "Create secret key"

5. **Copy the Key**:
   - **IMPORTANT**: Copy the key immediately! (It starts with `sk-`)
   - You won't be able to see it again
   - Example format: `sk-proj-abc123...xyz789`

### Step 2: Add to InventoTrack

1. **Open the .env file**:
   ```
   d:\Desktop\Invora\InventoTrack\backend\.env
   ```
   (You already have this open!)

2. **Paste your API key**:
   ```env
   OPENAI_API_KEY=sk-proj-your-actual-key-here
   ```

   Example:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/inventotrack
   JWT_SECRET=your_jwt_secret_key_here
   NODE_ENV=development

   # AI Features
   OPENAI_API_KEY=sk-proj-abc123def456ghi789...
   ```

3. **Save the file** (Ctrl+S)

### Step 3: Restart Backend Server

1. **Stop the current server**:
   - Go to your backend terminal
   - Press `Ctrl + C`

2. **Start it again**:
   ```bash
   npm run dev
   ```

3. **You should see**:
   ```
   Server running on port 5000
   MongoDB Connected
   ```

### Step 4: Test AI Features

1. **Open your app**: [http://localhost:5174](http://localhost:5174)

2. **Click the "AI Assistant" button** (bottom-right floating button)

3. **Ask a question**:
   - "What products are low on stock?"
   - "Give me inventory insights"

4. **If working**:
   - You'll get intelligent, contextual responses
   - Responses will be detailed and natural

5. **If not working**:
   - Check the backend terminal for errors
   - Verify API key is correct (no extra spaces)
   - Check OpenAI account has credits

---

## 💰 OpenAI Pricing (Important!)

### Free Tier
- New accounts get **$5 free credit**
- Expires after 3 months
- Perfect for testing!

### Pay-as-you-go
After free credit:
- **GPT-4**: $0.03 per 1K input tokens, $0.06 per 1K output tokens
- **GPT-3.5-Turbo**: $0.0015 per 1K tokens (much cheaper!)

### Estimated Costs
- **Light usage** (10 queries/day): ~$3-5/month
- **Medium usage** (50 queries/day): ~$15-25/month
- **Heavy usage** (200 queries/day): ~$60-100/month

### Cost Control
1. **Set spending limits** in OpenAI dashboard
2. **Use GPT-3.5-turbo** instead (change in `aiService.js`)
3. **Monitor usage** in OpenAI dashboard

---

## 🔒 Security Tips

1. ✅ **Never commit .env to Git**
   - `.env` is already in `.gitignore`
   - Never share your API key publicly

2. ✅ **Use environment variables**
   - Never hardcode keys in code
   - Always use `process.env.OPENAI_API_KEY`

3. ✅ **Rotate keys periodically**
   - Create new key every few months
   - Delete old keys from OpenAI dashboard

4. ✅ **Monitor usage**
   - Check OpenAI dashboard regularly
   - Set up usage alerts

---

## 🚫 What if I DON'T want to use OpenAI?

**No problem!** The system works perfectly without it:

1. **Leave OPENAI_API_KEY blank** or remove the line entirely:
   ```env
   # OPENAI_API_KEY=
   ```

2. **System automatically uses rule-based AI**:
   - ✅ Still get forecasts (statistical)
   - ✅ Still get recommendations (math-based)
   - ✅ Still get anomaly detection
   - ✅ 100% FREE - no external API calls
   - ⚠️ Slightly less accurate than GPT-4

3. **AI Assistant will inform users**:
   - "AI Assistant is not configured. Please add OPENAI_API_KEY to use GPT-4."

---

## 🧪 Testing Your Setup

### Test 1: Backend Console
After restarting backend, you should see:
```
✓ Server running on port 5000
✓ MongoDB Connected
```

### Test 2: AI Assistant
1. Open app → Click AI Assistant
2. Ask: "What's my inventory status?"
3. **With API key**: Detailed, natural response
4. **Without API key**: "AI Assistant is not configured" message

### Test 3: Analytics Page
1. Go to Analytics
2. Check "AI Reorder Recommendations" section
3. **With API key**: Smart, context-aware recommendations
4. **Without API key**: Mathematical recommendations

---

## 🐛 Troubleshooting

### "Error: OpenAI API key not found"
- Check `.env` file has `OPENAI_API_KEY=sk...`
- Restart backend server
- Verify no typos in key

### "Error: Incorrect API key provided"
- Copy the key again from OpenAI
- Make sure it starts with `sk-`
- No extra spaces before/after key

### "Error: You exceeded your current quota"
- Free credits expired OR
- Usage limit reached
- Add payment method to OpenAI account

### "AI responses seem generic"
- Might be using fallback mode
- Check backend console for errors
- Verify API key is set correctly

### Backend won't start after adding key
- Check `.env` syntax (no quotes needed)
- Make sure file is saved
- Try removing and re-adding the key

---

## 📝 Example .env File

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/inventotrack
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development

# AI Features (Optional)
OPENAI_API_KEY=sk-proj-abcdefghijklmnopqrstuvwxyz123456789
```

---

## ✅ Checklist

- [ ] Created OpenAI account
- [ ] Generated API key
- [ ] Copied key to `.env` file
- [ ] Saved `.env` file
- [ ] Restarted backend server
- [ ] Tested AI Assistant
- [ ] Verified it's working

---

## 🎯 Quick Links

- **OpenAI Platform**: [https://platform.openai.com](https://platform.openai.com)
- **API Keys Page**: [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- **Usage Dashboard**: [https://platform.openai.com/usage](https://platform.openai.com/usage)
- **Pricing**: [https://openai.com/pricing](https://openai.com/pricing)

---

**That's it! Your AI features are now ready to use!** 🚀🤖

If you run into any issues, check the troubleshooting section above.
