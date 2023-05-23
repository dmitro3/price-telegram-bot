import dotenv from 'dotenv';
dotenv.config();

import fetch from 'node-fetch';
import TelegramBot from 'node-telegram-bot-api';

import { aveta } from 'aveta';

const token = process.env.BOT_TOKEN!;

const bot = new TelegramBot(token, {
    polling: true
});

bot.onText(/\/start/, (msg) => {

    const chatId = msg.chat.id;
    bot.sendMessage(chatId, '👾 Welcome to the MOTO price Telegram bot! 👾\n\nWhat would you like to do? Use /price to get real time statistics about the MOTO token, or /scan to get complete analysis about any other token', {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: '📈 Price',
                        callback_data: 'price'
                    },
                    {
                        text: '🔍 Scan',
                        callback_data: 'scan'
                    }
                ]
            ]
        }
    });

});

const fetchMarketData = (token: string) => {
    return fetch(`https://dapp.herokuapp.com/token-market-data?contract=${token}`)
        .then((data) => data.json());
}

const getMOTOMessage = async () => {

    const data = await fetchMarketData(process.env.MOTO_TOKEN_ADDRESS!) as {
        price_eth: number;
        price_usd: number;
        liquidity: number;
        liquidity_usd: number;
        holder_count: number;
        circSupply: number;
        volume_24h_usd: number;
    };

    const marketCap = aveta(data.circSupply * data.price_usd, {
        digits: 5
    });

    const usdPrice = aveta(data.price_usd, {
        digits: 5
    });

    const ethPrice = aveta(data.price_eth, {
        digits: 5
    });

    const holderCount = aveta(data.holder_count, {
        digits: 2
    });

    const liquidity = aveta(data.liquidity_usd, {
        digits: 4
    });

    const lastDayVolume = aveta(data.volume_24h_usd, {
        digits: 5
    });
    
    const circSupply = aveta(data.circSupply, {
        digits: 5
    });

    const message = `  
$MOTO Token Stats

🛒 *Total Supply:* $10bn
🏦 *Circ. Supply:* $${circSupply}
💰 *Marketcap:* $${marketCap}
💸 *Price:* $${usdPrice}
📊 *Volume:* $${lastDayVolume}
🔐 *Liquidity:* $${liquidity}
👥 *Holders:* ${holderCount}

app.miyamotoproject.org
`.trim();

    return message;

}

bot.on('callback_query', async (query) => {
    const chatId = query.message!.chat.id;
    const data = query.data;
    
    if (data === 'price') {
        const message = await bot.sendMessage(chatId, 'Loading...');

        const content = await getMOTOMessage();
        
        await bot.editMessageText(content, {
            parse_mode: 'Markdown',
            message_id: message.message_id,
            chat_id: chatId
        });
    }

    if (data === 'scan') {
        bot.sendMessage(chatId, '🔍 This feature is not available yet!');
    }
});

bot.onText(/\/price/, async (msg, match) => {

    const chatId = msg.chat.id;
    const message = await bot.sendMessage(chatId, 'Loading...');

    const content = await getMOTOMessage();
    
    await bot.editMessageText(content, {
        parse_mode: 'Markdown',
        message_id: message.message_id,
        chat_id: chatId
    });
});

bot.onText(/\/scan/, async (msg, match) => {

    const chatId = msg.chat.id;
    await bot.sendMessage(chatId, '🔍 This feature is not available yet!');

});

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
});


console.log(`🤖 Miyamoto Price bot is started!`);
