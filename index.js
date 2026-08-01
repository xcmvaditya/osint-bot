#!/usr/bin/env node
/**
 * 🔍 GENIUS HACKER OSINT BOT - Node.js Version
 * Developed by: GENIUS HACKER ADITYA
 * Clone Feature Added!
 */

const { Telegraf, Markup } = require('telegraf');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const archiver = require('archiver');

// ============================================================
// 🔥 CONFIG — ENV VARIABLES
// ============================================================
require('dotenv').config();

const BOT_TOKEN = process.env.BOT_TOKEN || "8702526680:AAEPRe6iMg0_sKAPtDOp6xsNbYqviCltbmU";
const API_URL = process.env.API_URL || "https://ethicaltabbo.in/api/lookup";
const API_KEY = process.env.API_KEY || "aditya";
const YOUTUBE_URL = process.env.YOUTUBE_URL || "https://www.youtube.com/@geniushacker29";
const TELEGRAM_CHANNEL_URL = process.env.TELEGRAM_CHANNEL_URL || "https://t.me/geniushackerfreetools";
const TELEGRAM_CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID || "@geniushackerfreetools";
// ============================================================

// Store verified users
let verifiedUsers = new Set();

// Load verified users from file
function loadVerified() {
    try {
        const data = fs.readFileSync('verified_users.json', 'utf8');
        const arr = JSON.parse(data);
        verifiedUsers = new Set(arr);
    } catch (error) {
        verifiedUsers = new Set();
    }
}

// Save verified users to file
function saveVerified() {
    fs.writeFileSync('verified_users.json', JSON.stringify([...verifiedUsers]), 'utf8');
}

loadVerified();

// ============================================================
// TELEGRAM CHANNEL CHECK
// ============================================================
async function isMemberOfChannel(ctx, userId) {
    try {
        const member = await ctx.telegram.getChatMember(TELEGRAM_CHANNEL_ID, userId);
        return ['member', 'administrator', 'creator'].includes(member.status);
    } catch (error) {
        console.error('Channel check error:', error.message);
        return false;
    }
}

// ============================================================
// PHONE LOOKUP ENGINE
// ============================================================
async function lookupNumber(mobile) {
    try {
        const url = `${API_URL}?key=${API_KEY}&mobile=${mobile}`;
        const response = await axios.get(url, { timeout: 15000 });
        return response.data;
    } catch (error) {
        console.error('API Error:', error.message);
        return null;
    }
}

// ============================================================
// 📌 CLONE FUNCTION
// ============================================================
async function cloneBot(ctx) {
    const user = ctx.from;
    const userId = user.id;
    const args = ctx.message.text.split(' ');
    
    if (args.length < 2) {
        const keyboard = Markup.inlineKeyboard([
            [Markup.button.url('📝 Get Bot Token from @BotFather', 'https://t.me/BotFather')],
            [Markup.button.callback('📥 Download Clone Script', 'download_clone')]
        ]);
        await ctx.replyWithMarkdown(
            `🤖 **Clone OSINT Bot**\n\n` +
            `To clone this bot with your own token:\n\n` +
            `1️⃣ Go to @BotFather on Telegram\n` +
            `2️⃣ Send \`/newbot\` and create a bot\n` +
            `3️⃣ Copy your bot token\n` +
            `4️⃣ Type: \`/clone YOUR_BOT_TOKEN\`\n\n` +
            `📌 **Example:** \`/clone 1234567890:ABCdefGHIjklMNOpqrsTUVwxyz\``,
            keyboard
        );
        return;
    }
    
    const newToken = args[1].trim();
    
    // Validate token format
    if (!newToken.includes(':')) {
        await ctx.replyWithMarkdown('❌ Invalid token format! Token should look like: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`');
        return;
    }
    
    // Create clone directory
    const cloneDir = `clones/${userId}`;
    if (!fs.existsSync(cloneDir)) {
        fs.mkdirSync(cloneDir, { recursive: true });
    }
    
    // Read current file content
    const currentFile = fs.readFileSync(__filename, 'utf8');
    
    // Replace token
    const newContent = currentFile.replace(
        /BOT_TOKEN = process\.env\.BOT_TOKEN \|\| "[^"]*"/,
        `BOT_TOKEN = process.env.BOT_TOKEN || "${newToken}"`
    );
    
    // Save new bot file
    const cloneFile = `${cloneDir}/index.js`;
    fs.writeFileSync(cloneFile, newContent);
    
    // Create package.json
    const pkgJson = {
        name: "osint-bot-clone",
        version: "1.0.0",
        description: "🔍 OSINT Bot - Cloned from GENIUS HACKER",
        main: "index.js",
        scripts: {
            start: "node index.js"
        },
        dependencies: {
            telegraf: "^4.15.3",
            axios: "^1.6.2",
            dotenv: "^16.3.1",
            archiver: "^6.0.1"
        },
        author: user.first_name || "Anonymous",
        license: "MIT"
    };
    fs.writeFileSync(`${cloneDir}/package.json`, JSON.stringify(pkgJson, null, 2));
    
    // Create README.md
    const readme = `# 🤖 OSINT Bot (Cloned)

> **Cloned by:** ${user.first_name || 'Anonymous'}  
> **Original Developer:** GENIUS HACKER ADITYA

---

## 🚀 Installation

\`\`\`bash
# 1. Install dependencies
npm install

# 2. Run the bot
npm start
\`\`\`

---

## 📌 Bot Commands

| Command | Action |
|---------|--------|
| \`/start\` | Welcome & Join Buttons |
| \`/verify\` | Verify Channel Membership |
| \`/lookup <number>\` | Phone Lookup (10 digits) |
| \`/clone <token>\` | Clone This Bot |
| \`/help\` | Show Help |
| \`/about\` | Bot Info |

---

## ⚠️ Disclaimer
> This bot is for **educational & ethical security research only**.

---

**Enjoy! 🚀**
`;
    fs.writeFileSync(`${cloneDir}/README.md`, readme);
    
    // Create .env file
    const envContent = `BOT_TOKEN=${newToken}
API_URL=https://ethicaltabbo.in/api/lookup
API_KEY=aditya
YOUTUBE_URL=https://www.youtube.com/@geniushacker29
TELEGRAM_CHANNEL_URL=https://t.me/geniushackerfreetools
TELEGRAM_CHANNEL_ID=@geniushackerfreetools
`;
    fs.writeFileSync(`${cloneDir}/.env`, envContent);
    
    // Create ZIP file
    const zipPath = `${cloneDir}/osint_bot_clone.zip`;
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    await new Promise((resolve, reject) => {
        output.on('close', resolve);
        archive.on('error', reject);
        archive.pipe(output);
        archive.file(`${cloneDir}/index.js`, { name: 'index.js' });
        archive.file(`${cloneDir}/package.json`, { name: 'package.json' });
        archive.file(`${cloneDir}/.env`, { name: '.env' });
        archive.file(`${cloneDir}/README.md`, { name: 'README.md' });
        archive.finalize();
    });
    
    // Send ZIP to user
    await ctx.replyWithDocument(
        { source: zipPath, filename: 'osint_bot_clone.zip' },
        {
            caption: `✅ **Bot Cloned Successfully!**\n\n` +
                    `📌 **Your Token:** \`${newToken.substring(0, 15)}...\`\n` +
                    `📥 **Download the ZIP file above**\n\n` +
                    `📋 **How to deploy:**\n` +
                    `1️⃣ Extract the ZIP\n` +
                    `2️⃣ Run: \`npm install\`\n` +
                    `3️⃣ Run: \`npm start\`\n\n` +
                    `⚡ **Developed by GENIUS HACKER ADITYA**`,
            parse_mode: 'Markdown'
        }
    );
}

// ============================================================
// BOT INSTANCE
// ============================================================
const bot = new Telegraf(BOT_TOKEN);

// ============================================================
// 📌 COMMANDS
// ============================================================

// 1️⃣ /start
bot.start(async (ctx) => {
    const keyboard = Markup.inlineKeyboard([
        [
            Markup.button.url('📢 Join Telegram Channel', TELEGRAM_CHANNEL_URL),
            Markup.button.url('▶️ Subscribe YouTube', YOUTUBE_URL)
        ],
        [Markup.button.callback('✅ I have Joined', 'check_verify')],
        [Markup.button.callback('🤖 Clone This Bot', 'clone_bot')],
        [Markup.button.callback('📥 Download Clone Script', 'download_clone')]
    ]);
    
    await ctx.replyWithMarkdown(
        `👋 **Hello ${ctx.from.first_name}!**\n\n` +
        `🔍 Welcome to **GENIUS HACKER OSINT BOT**\n\n` +
        `⚠️ **Verification Required** to use this bot!\n\n` +
        `✅ **Step 1:** Join our Telegram Channel\n` +
        `✅ **Step 2:** Click 'I have Joined'\n` +
        `✅ **Step 3:** Use /lookup\n\n` +
        `🔹 **Want to clone this bot?** Click the button below!`,
        keyboard
    );
});

// 2️⃣ /verify
bot.command('verify', async (ctx) => {
    const userId = ctx.from.id;

    if (verifiedUsers.has(userId)) {
        await ctx.replyWithMarkdown('✅ **You are already verified!** Use /lookup');
        return;
    }

    if (!await isMemberOfChannel(ctx, userId)) {
        const keyboard = Markup.inlineKeyboard([
            [Markup.button.url('📢 Join Telegram Channel', TELEGRAM_CHANNEL_URL)]
        ]);
        await ctx.replyWithMarkdown(
            `❌ **You are not a member!**\n\n` +
            `👉 Please join first, then click /verify again.`,
            keyboard
        );
        return;
    }

    verifiedUsers.add(userId);
    saveVerified();
    await ctx.replyWithMarkdown(
        `🎉 **Verification Successful!**\n\n` +
        `✅ You can now use the bot.\n\n` +
        `📞 Type: /lookup 9876543210`
    );
});

// 3️⃣ /lookup
bot.command('lookup', async (ctx) => {
    const userId = ctx.from.id;
    const args = ctx.message.text.split(' ');

    if (!verifiedUsers.has(userId)) {
        const keyboard = Markup.inlineKeyboard([
            [Markup.button.callback('🔑 Verify Now', 'check_verify')]
        ]);
        await ctx.replyWithMarkdown(
            `⚠️ **You are not verified!**\n\n` +
            `Please verify first using /verify.`,
            keyboard
        );
        return;
    }

    if (args.length < 2) {
        await ctx.replyWithMarkdown('❌ Please provide a 10-digit number. Example: `/lookup 9876543210`');
        return;
    }

    const mobile = args[1].trim();

    if (!/^\d{10}$/.test(mobile)) {
        await ctx.replyWithMarkdown('❌ Invalid number! Must be exactly 10 digits.');
        return;
    }

    await ctx.replyWithMarkdown('⏳ Searching... Please wait.');

    const data = await lookupNumber(mobile);

    if (data && data.status) {
        const filename = `phone_${mobile}.json`;
        fs.writeFileSync(filename, JSON.stringify(data, null, 2), 'utf8');

        const jsonStr = JSON.stringify(data, null, 2);

        if (jsonStr.length > 4000) {
            await ctx.replyWithDocument(
                { source: filename },
                { caption: `✅ Data found for ${mobile}! (File attached)` }
            );
        } else {
            await ctx.replyWithMarkdown(
                `✅ **Data Found for ${mobile}:**\n\n` +
                `\`\`\`json\n${jsonStr}\n\`\`\`\n` +
                `💾 Saved to: \`${filename}\``
            );
        }
    } else {
        await ctx.replyWithMarkdown('❌ No data found or API is unreachable.');
    }
});

// 4️⃣ /clone
bot.command('clone', async (ctx) => {
    await cloneBot(ctx);
});

// 5️⃣ /help
bot.command('help', async (ctx) => {
    await ctx.replyWithMarkdown(
        `📖 **Available Commands:**\n\n` +
        `/start - Welcome & Join Buttons\n` +
        `/verify - Verify Channel Membership\n` +
        `/lookup <number> - Phone Lookup (10 digits)\n` +
        `/clone <token> - Clone this bot with your token\n` +
        `/help - Show this menu\n` +
        `/about - Bot Info\n\n` +
        `🔑 **Verification Process:**\n` +
        `1️⃣ Join Telegram Channel\n` +
        `2️⃣ Type /verify\n` +
        `3️⃣ Start using /lookup`
    );
});

// 6️⃣ /about
bot.command('about', async (ctx) => {
    await ctx.replyWithMarkdown(
        `🤖 **GENIUS HACKER OSINT BOT**\n` +
        `Version: 3.0 (Node.js Edition)\n` +
        `📞 Phone Lookup Engine\n\n` +
        `📺 YouTube: ${YOUTUBE_URL}\n` +
        `📢 Telegram: ${TELEGRAM_CHANNEL_URL}\n\n` +
        `⚠️ Use for ethical purposes only!`
    );
});

// 7️⃣ Callback Query Handler
bot.action('check_verify', async (ctx) => {
    await ctx.answerCbQuery();
    const userId = ctx.from.id;

    if (verifiedUsers.has(userId)) {
        await ctx.editMessageText('✅ **You are already verified!** Use /lookup', { parse_mode: 'Markdown' });
        return;
    }

    if (!await isMemberOfChannel(ctx, userId)) {
        const keyboard = Markup.inlineKeyboard([
            [Markup.button.url('📢 Join Telegram Channel', TELEGRAM_CHANNEL_URL)]
        ]);
        await ctx.editMessageText(
            `❌ **Not a member!**\n\n` +
            `Please join our Telegram Channel first.`,
            { parse_mode: 'Markdown', ...keyboard }
        );
        return;
    }

    verifiedUsers.add(userId);
    saveVerified();
    await ctx.editMessageText(
        `🎉 **Verification Successful!**\n\n` +
        `✅ You can now use the bot.\n` +
        `📞 Type: /lookup 9876543210`,
        { parse_mode: 'Markdown' }
    );
});

bot.action('clone_bot', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.replyWithMarkdown(
        `🤖 **Clone OSINT Bot**\n\n` +
        `To clone this bot with your own token:\n\n` +
        `1️⃣ Go to @BotFather on Telegram\n` +
        `2️⃣ Send \`/newbot\` and create a bot\n` +
        `3️⃣ Copy your bot token\n` +
        `4️⃣ Type: \`/clone YOUR_BOT_TOKEN\`\n\n` +
        `📌 **Example:** \`/clone 1234567890:ABCdefGHIjklMNOpqrsTUVwxyz\``
    );
});

bot.action('download_clone', async (ctx) => {
    await ctx.answerCbQuery();
    // Simpler approach: send clone script info
    await ctx.replyWithMarkdown(
        `📥 **Clone Generator**\n\n` +
        `Type: \`/clone YOUR_BOT_TOKEN\`\n\n` +
        `The bot will automatically generate a complete ZIP file with all necessary files!`
    );
});

// ============================================================
// LAUNCH BOT
// ============================================================
console.log(`
╔═══════════════════════════════════════╗
║  🔍 GENIUS HACKER OSINT BOT v3.0     ║
║  🤖 Node.js Version                  ║
║  🔹 Clone Feature Added!             ║
║  Press Ctrl+C to Stop.               ║
╚═══════════════════════════════════════╝
`);

bot.launch()
    .then(() => {
        console.log('✅ OSINT Bot is running!');
        console.log(`📢 Channel: ${TELEGRAM_CHANNEL_URL}`);
        console.log(`📺 YouTube: ${YOUTUBE_URL}`);
        console.log(`🤖 Clone: /clone YOUR_TOKEN`);
    })
    .catch((err) => {
        console.error('❌ Error starting bot:', err);
    });

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
