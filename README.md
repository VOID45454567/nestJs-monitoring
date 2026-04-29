# PM2 Monitor — Frontend

Дашборд для мониторинга PM2 процессов на нескольких машинах с уведомлениями на email.

## Установка зависимостей

```
bun i
```

## Конфигурация

Скопируйте шаблон конфигурации:

```
cp src/conf/machines.example.ts src/conf/machines.ts
```
Заполните ```src/conf/machines.ts```:
```ts
export const APP_CONFIG: AppConfig = {
    smtp: {
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: "your-email@gmail.com",
            pass: "your-app-password",       // пароль приложения
        },
        from: "PM2 Monitor <your-email@gmail.com>",
    },
    machines: [
        {
            id: 'local',
            name: 'Local Development',
            url: 'http://localhost:3000',    // REST API бэкенда
            wsUrl: 'ws://localhost:3000',    // WebSocket бэкенда
            checkIntervalMs: 15 * 60 * 1000,
        },
    ],
};
```

## Добавление новой машины

Добавьте объект в machines[] в ```src/conf/machines.ts.``` Бэкенд мониторинга должен быть запущен на этой машине. Фронт автоматически подключится к ней через WebSocket при старте.
