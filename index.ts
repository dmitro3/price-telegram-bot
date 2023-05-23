import dotenv from 'dotenv';
dotenv.config();

import fetch from 'node-fetch';
import TelegramBot from 'node-telegram-bot-api';

import { aveta } from 'aveta';

// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.BOT_TOKEN!;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {
    polling: true
});

// Matches "/echo [whatever]"
bot.onText(/\/start/, (msg, match) => {

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
        holder_count: number;
        circSupply: number;
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

    const message = `👾 MOTO Token Price 👾\n\n→ USD Price: ${usdPrice}\n→ Eth Price: ${ethPrice}\n\n→ Market Cap : ${marketCap}\n→ Holder count : ${holderCount}`;

    return message;

}

bot.on('callback_query', query => {
    const chatId = query.message!.chat.id;
    const data = query.data;
    
    if (data === 'price') {
        bot.sendMessage(chatId, '📈 Priced')
    }

    if (data === 'scan') {
        bot.sendMessage(chatId, '🔍 Scanned')
    }
});

bot.onText(/\/price/, async (msg, match) => {

    const chatId = msg.chat.id;
    const content = await getMOTOMessage();
    const message = await bot.sendMessage(chatId, 'Loading...');
    
    await bot.editMessageText(content, {
        message_id: message.message_id,
        chat_id: chatId
    });
});

bot.on('message', (msg) => {
  const chatId = msg.chat.id;

  // send a message to the chat acknowledging receipt of their message
  //bot.sendMessage(chatId, 'Received your message');
});
