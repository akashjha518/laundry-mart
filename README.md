# Laundry Service Web App

A responsive laundry service landing page built with plain HTML, CSS, and JavaScript.

The app presents a service catalog, lets users add services to a cart, calculates the total, and includes booking and newsletter forms with client-side validation.

## Features

- Responsive landing page with hero, services, features, newsletter, and footer sections
- Add/remove laundry services from a cart
- Live cart total calculation
- Booking form with validation for name, email, and phone number
- Newsletter subscription form with validation
- Mobile navigation menu
- UI icons loaded from Ionicons

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- [Ionicons](https://ionic.io/ionicons)
- [EmailJS](https://www.emailjs.com/) for booking-email integration

## Project Structure

```text
index.html
resources/
  css/
    style.css
    responsive.css
  js/
    script.js
    app.js
  img/
vendors/
  css/
    grid.css
```

## How It Works

- `index.html` is the main entry point.
- `resources/css/style.css` contains the base styles.
- `resources/css/responsive.css` handles responsive behavior.
- `resources/js/script.js` powers the cart, booking form, toast messages, and newsletter validation.
- `resources/js/app.js` is an older script file kept in the repo but not loaded by `index.html`.

## Running Locally

This is a static site, so no build step is required.

1. Open `index.html` directly in a browser, or
2. Serve the folder with a local static server if you prefer

Examples:

```bash
python -m http.server 8000
```

or use any live-server extension in editor.

## EmailJS Setup

The booking form uses EmailJS, but the active script expects configuration to be provided at runtime.

To enable booking emails, set one of these in `index.html`:

- `window.__EMAILJS_CONFIG__` with `serviceId`, `templateId`, and `publicKey`
- or `data-emailjs-service-id`, `data-emailjs-template-id`, and `data-emailjs-public-key` on the booking form

Example:

```html
<form
  id="bookingForm"
  data-emailjs-service-id="YOUR_SERVICE_ID"
  data-emailjs-template-id="YOUR_TEMPLATE_ID"
  data-emailjs-public-key="YOUR_PUBLIC_KEY"
>
```

## Notes

- The newsletter form currently shows a client-side success message.
- The cart state is managed in memory and resets on page refresh.
- Several images and text blocks are part of the frontend demo content.

## Browser Requirements

- A modern browser with JavaScript enabled
- Internet access for Google Fonts, Ionicons, and EmailJS CDN assets
