# ОГЭ — общая доска Егора и Даниила

## Что уже есть
- Вход по email и паролю для двух учеников.
- Общая канбан-доска: «К выполнению», «В процессе», «Готово».
- Добавление, редактирование и удаление заданий.
- Ежедневные задания.
- XP, личный прогресс, рейтинг и график за 7 дней.
- Синхронизация через Firebase Firestore в реальном времени.

## 1. Настрой Firebase
1. Открой https://console.firebase.google.com/ и создай проект.
2. В Project settings → Your apps добавь Web app и скопируй firebaseConfig.
3. В Firebase Authentication → Sign-in method включи Email/Password.
4. В Authentication → Users вручную создай два аккаунта: Егора и Даниила.
5. В Firestore Database создай базу в Production mode.

## 2. Заполни config.js
Вставь реальные значения из Firebase в firebaseConfig.
В members замени egor@example.com и danila@example.com на настоящие email учеников (строчными буквами). Пароли сюда не записывай.

## 3. Защити Firestore
В Firebase Console → Firestore Database → Rules вставь содержимое файла firestore.rules.
Замени оба примера email на те же адреса, что стоят в config.js, затем нажми Publish.
Не используй открытые правила allow read, write: if true.

## 4. Опубликуй GitHub Pages
1. В репозитории открой Settings → Pages.
2. В Build and deployment выбери Deploy from a branch.
3. Branch: main; Folder: /(root); нажми Save.
4. Сайт будет доступен по адресу https://egorfateew-ops.github.io/oge-board-2027/

## 5. Разреши домен в Firebase Auth
В Firebase Console → Authentication → Settings → Authorized domains добавь:
egorfateew-ops.github.io

## 6. Проверка
Открой опубликованный сайт, войди под аккаунтом Егора. Затем открой сайт на другом устройстве и войди под аккаунтом Даниила. Изменения должны появляться у обоих автоматически.

## Начальные задания
При первом входе приложение автоматически создаёт стартовые задания в общей базе. Повторный вход не дублирует их.
