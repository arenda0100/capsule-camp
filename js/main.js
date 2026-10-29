/* CAPSULA CAMP — интерактивность сайта */

(() => {

  // МОБИЛЬНОЕ МЕНЮ

  const menuButton = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav");

  if (menuButton && nav) {

    menuButton.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("is-open");

      menuButton.setAttribute(
        "aria-expanded",
        String(isOpen)
      );

      menuButton.textContent = isOpen ? "×" : "☰";
    });

    // Закрываем меню после выбора раздела.
    nav.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        nav.classList.remove("is-open");

        menuButton.setAttribute(
          "aria-expanded",
          "false"
        );

        menuButton.textContent = "☰";
      });
    });
  }


  // ГАЛЕРЕЯ С УВЕЛИЧЕНИЕМ ФОТО

  const dialog = document.querySelector("#lightbox");
  const lightboxImage = document.querySelector("#lightbox-image");

  document.querySelectorAll(".gallery-item").forEach(item => {

    item.addEventListener("click", () => {
      const image = item.querySelector("img");

      lightboxImage.src =
        item.dataset.full || image.src;

      lightboxImage.alt = image.alt;

      dialog.showModal();
    });

  });

  // Закрытие по кнопке.
  dialog?.querySelector(".lightbox-close")
    ?.addEventListener("click", () => {
      dialog.close();
    });

  // Закрытие при клике за пределами фотографии.
  dialog?.addEventListener("click", event => {
    if (event.target === dialog) {
      dialog.close();
    }
  });


  // ФОРМА ОБРАТНОЙ СВЯЗИ

  const contactForm = document.querySelector("#contact-form");
  const status = document.querySelector("#contact-status");

  contactForm?.addEventListener("submit", event => {
    event.preventDefault();

    const data = new FormData(contactForm);

    const message = [
      "Заявка Capsula Camp",
      `Имя: ${data.get("name")}`,
      `Контакт: ${data.get("contact")}`,
      `Комментарий: ${data.get("message") || "не указан"}`
    ].join("\n");

    // Пока сервер не подключён, предлагаем скопировать заявку.
    // Отправка владельцу на этом этапе не выполняется.

    if (navigator.clipboard && window.isSecureContext) {

      navigator.clipboard.writeText(message)
        .then(() => {
          status.textContent =
            "Текст заявки скопирован. " +
            "Отправку владельцу подключим позже.";
        })
        .catch(() => {
          status.textContent =
            "Форма пока демонстрационная. " +
            "Отправку заявок подключим позже.";
        });

    } else {

      status.textContent =
        "Форма пока демонстрационная. " +
        "Отправку заявок подключим позже.";

    }
  });


  // АВТОМАТИЧЕСКИЙ ГОД В ПОДВАЛЕ

  const year = document.querySelector("#year");

  if (year) {
    year.textContent = new Date().getFullYear();
  }

})();