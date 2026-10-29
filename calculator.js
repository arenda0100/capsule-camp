/* CAPSULA CAMP — калькулятор стоимости */

(() => {
  const config = window.CAPSULA_CONFIG || {};

  const form = document.querySelector("#booking-form");
  const checkin = document.querySelector("#checkin");
  const checkout = document.querySelector("#checkout");
  const result = document.querySelector("#price-result");

  if (!form || !checkin || !checkout || !result) {
    return;
  }

  // Получаем сегодняшнюю дату без проблем с часовым поясом.
  const today = new Date();

  const localDate = new Date(
    today.getTime() - today.getTimezoneOffset() * 60000
  ).toISOString().slice(0, 10);

  // Нельзя выбрать дату заезда в прошлом.
  checkin.min = localDate;
  checkout.min = localDate;

  // Форматируем сумму в нужной валюте.
  function formatMoney(value) {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: config.currency || "BYN",
      maximumFractionDigits: 0
    }).format(value);
  }

  // Правильное склонение слова "ночь".
  function nightsWord(nights) {
    const lastTwo = nights % 100;
    const last = nights % 10;

    if (lastTwo >= 11 && lastTwo <= 14) {
      return "ночей";
    }

    if (last === 1) {
      return "ночь";
    }

    if (last >= 2 && last <= 4) {
      return "ночи";
    }

    return "ночей";
  }

  // Рассчитываем стоимость проживания.
  function calculate() {
    if (!checkin.value || !checkout.value) {
      result.textContent =
        "Выберите даты — рассчитаем предварительную стоимость.";

      return null;
    }

    const start = new Date(`${checkin.value}T12:00:00`);
    const end = new Date(`${checkout.value}T12:00:00`);

    const nights = Math.round(
      (end - start) / 86400000
    );

    // Дата выезда должна быть позже даты заезда.
    if (nights < 1) {
      result.textContent =
        "Дата выезда должна быть позже даты заезда.";

      return null;
    }

    let total = 0;

    // Считаем стоимость каждой ночи отдельно.
    for (let i = 0; i < nights; i++) {
      const night = new Date(start);

      night.setDate(start.getDate() + i);

      const day = night.getDay();

      // Пятница и суббота — тариф выходного дня.
      const isWeekend = day === 5 || day === 6;

      const rate = isWeekend
        ? Number(config.weekendRate || 0)
        : Number(config.weekdayRate || 0);

      total += rate;
    }

    // Если тарифы пока не указаны, не показываем ложную цену.
    if (
      !Number(config.weekdayRate) ||
      !Number(config.weekendRate)
    ) {
      result.textContent =
        `${nights} ${nightsWord(nights)}. ` +
        "Укажите реальные тарифы в js/config.js — " +
        "сейчас стоимость не задана.";

      return {
        nights,
        total,
        isPlaceholder: true
      };
    }

    result.textContent =
      `Предварительно: ${formatMoney(total)} ` +
      `за ${nights} ${nightsWord(nights)}. ` +
      "Итог подтвердит администратор.";

    return {
      nights,
      total,
      isPlaceholder: false
    };
  }

  // При изменении даты заезда обновляем минимальную дату выезда.
  checkin.addEventListener("change", () => {
    checkout.min = checkin.value || localDate;

    if (
      checkout.value &&
      checkout.value <= checkin.value
    ) {
      checkout.value = "";
    }

    calculate();
  });

  // Пересчитываем стоимость при изменении даты выезда.
  checkout.addEventListener("change", calculate);

  // Обработка нажатия кнопки "Рассчитать".
  form.addEventListener("submit", event => {
    event.preventDefault();

    const estimate = calculate();

    if (!estimate) {
      return;
    }

    if (estimate.isPlaceholder) {
      result.textContent +=
        " Это макет, не подтверждение бронирования.";

      return;
    }

    const guests = document.querySelector("#guests").value;

    const message =
      `Здравствуйте! Хочу уточнить бронирование Capsula Camp.\n` +
      `Заезд: ${checkin.value}\n` +
      `Выезд: ${checkout.value}\n` +
      `Гостей: ${guests}\n` +
      `Предварительная стоимость: ${formatMoney(estimate.total)}.`;

    // Если контакт задан, открываем WhatsApp с готовым сообщением.
    if (config.bookingContact) {
      const phone = String(config.bookingContact)
        .replace(/\D/g, "");

      window.location.href =
        `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    } else {
      result.textContent +=
        " Для отправки заявки добавьте контакт в js/config.js.";
    }
  });
})();