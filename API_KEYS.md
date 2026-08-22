# Подключение интеграций

Все внешние сервисы работают по одному правилу: **есть ключ в окружении —
идёт реальный запрос, нет ключа — возвращается реалистичная заглушка.**
Переключение не требует изменений в коде: добавили переменную, передеплоили.

Заглушки пишут в лог префикс `[SERVICE STUB]` — видно в терминале
`npm run dev` и в Runtime Logs на Vercel.

| Сервис | Переменные | Что делает без ключа |
|---|---|---|
| CDEK | `CDEK_CLIENT_ID`, `CDEK_CLIENT_SECRET` | 4 тарифа и 2 ПВЗ по Алматы |
| Kaspi Доставка | `KASPI_API_KEY`, `KASPI_MERCHANT_ID` | 3 тарифа и 2 магазина Kaspi |
| Казпочта | `KAZPOST_API_KEY` | 2 тарифа: стандарт и экспресс |
| Freedom Pay | `FREEDOM_PAY_MERCHANT_ID`, `FREEDOM_PAY_SECRET_KEY` | заказ фиксируется, оплата не списывается |
| Kaspi Pay | `KASPI_PAY_PRIVATE_KEY` | то же |
| Яндекс Карты | `NEXT_PUBLIC_YANDEX_MAPS_KEY` | вместо карты — рабочий список ПВЗ |

Проверить, что подключено: `serviceStatus()` из `src/lib/services`.

## Порядок получения

### 1. CDEK — быстрее всех
1. Регистрация: [cdek.kz/ru/registraciya-klienta](https://cdek.kz/ru/registraciya-klienta)
2. Договор подписывается онлайн через ЭЦП
3. Ключи: личный кабинет → Интеграция
4. В `.env.local`: `CDEK_CLIENT_ID`, `CDEK_CLIENT_SECRET`

### 2. Kaspi — нужна верификация продавца
1. [kaspi.kz/business/registration](https://kaspi.kz/business/registration)
2. Загрузить документы ИП или ТОО
3. Проверка занимает 3–7 дней
4. Ключ в кабинете продавца → `KASPI_API_KEY`, `KASPI_MERCHANT_ID`

### 3. Freedom Pay — нужно юрлицо
1. Заявка: [freedompay.kz/connect](https://freedompay.kz/connect)
2. Документы компании, подписание договора
3. Из кабинета → `FREEDOM_PAY_MERCHANT_ID`, `FREEDOM_PAY_SECRET_KEY`

### 4. Казпочта
1. Письмо на `manager@kazpost.kz` с запросом доступа к API
2. Договор → `KAZPOST_API_KEY`

## Куда добавлять

Локально — в `.env.local` (он в `.gitignore`, в репозиторий не попадёт).
На проде:

```bash
vercel env add CDEK_CLIENT_ID production
vercel env add CDEK_CLIENT_SECRET production
# и так далее, затем передеплоить
```

Шаблон со всеми переменными — `.env.example`.

## Что проверить после подключения

- Эндпоинты Kaspi и Казпочты в `src/lib/services/kaspi.ts` и `kazpost.ts`
  выставлены по общедоступному описанию. Обе компании выдают точную
  спецификацию только после подписания договора — сверьте URL и формат
  ответа, когда получите документацию.
- Freedom Pay подписывает запрос HMAC-SHA256 по значениям полей в порядке
  объявления (`src/lib/services/freedomPay.ts`). Порядок полей в их актуальной
  документации нужно сверить: если он отличается, подпись не сойдётся.
