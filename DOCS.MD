<!-- FIXME: add normal docs! -->

# Документация для Неной

## Общее

Сайт сделан на NextJS (как клиент, так и сервер). Используется vercel.com для хостинга + github  
База данных хранится в Облаке на [cloud.mongodb.com](https://cloud.mongodb.com)  
Версия: 1.1.0

## Стек технологий

JavaScript, React, NextJS

- react-modal - для Модалок :)
- react-yandex-maps - Яндекс карты
- date-diff-js
- jodit-react - редактор записей/комментариев
- next-geocoder - геокодинг
- mongodb - база данных
- nodemailer - отправка писем (восстановление пароля, регистрация)

## Комментарий

Стабилизация апи уже прошла, но документация пока устаревшая.
В будущем документация будет активно улучшаться.

## Описание страниц

Сайт одностраничный. Есть страница index.tsx (/) и \_app.tsx  
Есть также "страницы" для api, в папке api.  
На них отправляет запросы пользователь, они отправляют в БД (middleware).
api:

- addComment.js
- changePassword.js
- geocoder.js
- getPlacemarks.js
- getPosts.js
- getPostsByCoords.js
- getUserInfo.js
- isCorrect.js
- isLoginExists.js
- sendInformation.js
- sigin.js
- signup.js
- updateUserInfo.js
- voteForComment.js

## Коды ошибок

См. файл errors.ts

| Name          | Code | Комментарий                   |
| ------------- | ---- | ----------------------------- |
| BUSY_LOGIN    | 0    | Логин уже занят (регистрация) |
| INVALID_LOGIN | 1    | Неправильный логин(вход)      |
| INVALID_TOKEN | 2    | Неправильный токен            |
| VOTE          | 3    | Повторное голосование         |

## Описание методов

### Утилиты

Расположены в файле src/ui/utils.ts  

### Работа с БД

Все, что связано с базой данных - в файле src/db.ts

