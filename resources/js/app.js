const serviceButtons = document.querySelectorAll('#services .btn-add'); // Get all service buttons so we can attach click handlers.
const emptyCart = document.getElementById('emptyCart'); // Get the empty-cart message element.
const cartItems = document.getElementById('cartItems'); // Get the cart table wrapper.
const cartBody = cartItems ? cartItems.querySelector('tbody') : null; // Get the table body where rows will be added.
const cartTotal = document.getElementById('cartTotal'); // Get the element that shows the total price.
const bookingForm = document.getElementById('bookingForm'); // Get the booking form element.
const bookingName = document.getElementById('name'); // Get the name input field.
const bookingEmail = document.getElementById('email'); // Get the email input field.
const bookingPhone = document.getElementById('phone'); // Get the phone input field.
const bookingMessage = document.getElementById('bookingMessage'); // Get the message area shown after booking.
const toast = document.getElementById('toast'); // Get the small popup notification element.

const newsletterName = document.getElementById('newsletterName'); // Get the newsletter name input.
const newsletterEmail = document.getElementById('newsletterEmail'); // Get the newsletter email input.
const newsletterSubscribe = document.getElementById('newsletterSubscribe'); // Get the newsletter subscribe button.

// Keep selected services in memory so the cart can update instantly.
const selectedServices = new Map(); // Store each selected service by card element.
let toastTimer; // Store the timer used to hide the toast.
let bookingMessageTimer; // Store the timer used to hide the booking message.

function getEmailJsConfig() { // Read EmailJS settings from the page or global config.
    // Read EmailJS settings from two places so the app still works if one source is missing.
    const emailConfig = window.__EMAILJS_CONFIG__ || {}; // Use the global config object if it exists.
    const serviceId = emailConfig.serviceId || bookingForm?.dataset.emailjsServiceId || ''; // Get the EmailJS service ID.
    const templateId = emailConfig.templateId || bookingForm?.dataset.emailjsTemplateId || ''; // Get the EmailJS template ID.
    const publicKey = emailConfig.publicKey || bookingForm?.dataset.emailjsPublicKey || ''; // Get the EmailJS public key.

    return { // Return the final config values.
        serviceId: serviceId.trim(), // Remove extra spaces from the service ID.
        templateId: templateId.trim(), // Remove extra spaces from the template ID.
        publicKey: publicKey.trim(), // Remove extra spaces from the public key.
    }; // End of config object.
} // End of EmailJS config function.

function initEmailJs() { // Initialize EmailJS if the library is available.
    // Initialize EmailJS once, if the library and public key are available.
    const config = getEmailJsConfig(); // Read the EmailJS configuration first.

    if (window.emailjs && config.publicKey) { // Only initialize when the library and key exist.
        emailjs.init({ publicKey: config.publicKey }); // Set the EmailJS public key.
    } // End of EmailJS availability check.

    return config; // Return the config so other functions can use it.
} // End of EmailJS initialization function.

const emailJsConfig = initEmailJs(); // Run the EmailJS setup right away.

function escapeHtml(value) { // Escape text before placing it inside HTML.
    // Replace special characters so user text does not break the HTML table.
    return value // Start with the original text.
        .replaceAll('&', '&amp;') // Replace ampersands first.
        .replaceAll('<', '&lt;') // Replace opening angle brackets.
        .replaceAll('>', '&gt;') // Replace closing angle brackets.
        .replaceAll('"', '&quot;') // Replace double quotes.
        .replaceAll("'", '&#39;'); // Replace single quotes.
} // End of HTML escaping helper.

function formatPrice(value) { // Format a number as Indian rupees.
    // Show every price in the same currency format.
    return `₹${value.toFixed(2)}`; // Convert the number to two decimal places.
} // End of price formatter.

function getServiceCardData(card) { // Read the service name and price from one card.
    // Read the service name and price directly from the card.
    const serviceNameEl = card ? card.querySelector('.service-name') : null; // Find the name element inside the card.
    const servicePriceEl = card ? card.querySelector('.service-price') : null; // Find the price element inside the card.

    if (!serviceNameEl || !servicePriceEl) { // Stop if one of the required elements is missing.
        return null; // Return null to show the card is not usable.
    } // End of missing-element check.

    return { // Return the service data in a simple object.
        name: serviceNameEl.textContent.trim(), // Get the visible service name.
        price: Number.parseFloat(servicePriceEl.textContent.replace(/[^\d.]/g, '')) || 0, // Convert the price text to a number.
    }; // End of service data object.
} // End of card data helper.

function setServiceButtonState(button, isSelected) { // Update the button style based on selection state.
    // Change the button style so the selected state is easy to see.
    const baseClasses = [ // Base styles used for both states.
        'inline-flex', // Make the button inline and flexible.
        'items-center', // Center text and icon vertically.
        'gap-2', // Add space between the text and icon.
        'rounded-full', // Make the button pill-shaped.
        'px-4', // Add horizontal padding.
        'py-2', // Add vertical padding.
        'text-sm', // Use a small text size.
        'font-semibold', // Make the text bold-ish.
        'text-white', // Use white text.
        'transition', // Animate color changes smoothly.
    ]; // End of shared classes.
    const activeClasses = isSelected // Choose classes based on whether the item is selected.
        ? ['bg-rose-600', 'hover:bg-rose-700'] // Use a red style when selected.
        : ['bg-slate-900', 'hover:bg-slate-800']; // Use a dark style when not selected.

    button.className = [...baseClasses, ...activeClasses].join(' '); // Apply the final class list to the button.
    button.innerHTML = isSelected // Set the button label and icon.
        ? '<strong>Remove Item</strong> <ion-icon name="remove-circle-outline"></ion-icon>' // Show remove state.
        : '<strong>Add Item</strong> <ion-icon name="add-circle-outline"></ion-icon>'; // Show add state.
} // End of button state helper.

function showToast(message, variant = 'dark') { // Show a temporary message at the bottom of the page.
    // Show a small popup message for quick feedback.
    if (!toast) return; // Stop if the toast element does not exist.

    toast.className = 'pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full px-5 py-3 text-sm font-medium shadow-lg transition-opacity duration-300'; // Set the toast base style.
    toast.classList.add(variant === 'success' ? 'bg-emerald-600' : 'bg-slate-950', 'text-white'); // Pick the background color.
    toast.textContent = message; // Put the message text in the toast.
    toast.classList.remove('hidden'); // Make the toast visible.
    toast.classList.remove('opacity-0'); // Remove the hidden opacity state.
    toast.classList.add('opacity-100'); // Fade the toast in.

    window.clearTimeout(toastTimer); // Cancel any old hide timer.
    toastTimer = window.setTimeout(() => { // Start a new timer to hide the toast.
        toast.classList.add('opacity-0'); // Fade the toast out.
        window.setTimeout(() => { // Wait a little before fully hiding it.
            toast.classList.add('hidden'); // Hide the toast completely.
        }, 200); // Delay for the fade-out animation.
    }, 2200); // Keep the toast visible for a short time.
} // End of toast helper.

function showBookingMessage(message) { // Show a success message under the form.
    // Show the success message after a booking is sent.
    if (!bookingMessage) return; // Stop if the message element is missing.

    bookingMessage.textContent = message; // Put the message text into the element.
    bookingMessage.classList.remove('hidden'); // Make the message visible.

    window.clearTimeout(bookingMessageTimer); // Clear any old hide timer first.
    bookingMessageTimer = window.setTimeout(() => { // Set a timer to hide the message later.
        bookingMessage.classList.add('hidden'); // Hide the message again.
    }, 6000); // Leave it visible for a few seconds.
} // End of booking message helper.

function getBookingFormData() { // Read the booking form fields.
    // Collect the form values in one place before validation or sending.
    return { // Return the values as a plain object.
        name: bookingName ? bookingName.value.trim() : '', // Read and trim the name.
        email: bookingEmail ? bookingEmail.value.trim() : '', // Read and trim the email.
        phone: bookingPhone ? bookingPhone.value.trim() : '', // Read and trim the phone number.
    }; // End of form data object.
} // End of form reader.

function getSelectedServiceNames() { // Build a list of selected service names.
    // Build a simple list of service names for the email template.
    const names = []; // Create an empty list to store names.

    selectedServices.forEach((item) => { // Loop through every selected service.
        names.push(item.name); // Add the service name to the list.
    }); // End of loop.

    return names; // Return the full list.
} // End of service-name helper.

function buildOrderSummary() { // Create a readable list of selected services and prices.
    // Build a simple plain-text summary so the email template can show each item clearly.
    const lines = []; // Start with an empty list of lines.

    selectedServices.forEach((item) => { // Loop through each selected service.
        lines.push(`${item.name} - ${formatPrice(item.price)}`); // Add one line per service with its price.
    }); // End of selected service loop.

    return lines.join('\n'); // Put each item on a new line.
} // End of order summary helper.

function buildOrderRows() { // Create a structured list for the email table.
    // Build an array of objects so the template can render a clean table.
    const rows = []; // Start with an empty list of rows.

    selectedServices.forEach((item) => { // Loop through every selected service.
        rows.push({ // Add one table row object.
            name: item.name, // Store the service name.
            price: formatPrice(item.price), // Store the formatted price.
        }); // End of row object.
    }); // End of selected service loop.

    return rows; // Return the full list of table rows.
} // End of order rows helper.

function validateBookingFormData(data) { // Check if the booking form is valid.
    // Check each requirement one by one so errors are easy to understand.
    if (selectedServices.size === 0) { // If nothing is in the cart...
        return 'Add at least one service to the cart first'; // Tell the user what is missing.
    } // End of empty-cart check.

    if (!data.name || !data.email || !data.phone) { // If any required field is blank...
        return 'Fill in your name, email, and phone number'; // Ask the user to fill everything in.
    } // End of required-field check.

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) { // If the email does not match the pattern...
        return 'Enter a valid email address'; // Tell the user the email is invalid.
    } // End of email validation.

    if (!/^[0-9]{10}$/.test(data.phone)) { // If the phone number is not 10 digits...
        return 'Enter a valid 10 digit phone number'; // Tell the user the phone is invalid.
    } // End of phone validation.

    return ''; // Return an empty string when everything is valid.
} // End of form validation function.

function canSendBookingEmail() { // Check whether EmailJS is ready to use.
    // Do not try to send email unless all EmailJS settings exist.
    return Boolean(window.emailjs && emailJsConfig.serviceId && emailJsConfig.templateId && emailJsConfig.publicKey); // Return true only if the required EmailJS values exist.
} // End of EmailJS readiness check.

function buildBookingEmailData(data) { // Build the EmailJS template data.
    // Prepare the data object that EmailJS will insert into the template.
    const serviceNames = getSelectedServiceNames(); // Get the list of selected service names.
    const logoUrl = 'https://fresh-fold.netlify.app/resources/img/logo.png'; // Use the live site URL so the email can load the logo.

    return { // Return an object with the values the template expects.
        user_name: data.name, // Send the user's name.
        user_email: data.email, // Send the user's email.
        user_phone: data.phone, // Send the user's phone number.
        service_count: selectedServices.size, // Send how many services were selected.
        service_list: serviceNames.join(', '), // Turn the list into a readable string.
        order_summary: buildOrderSummary(), // Send a line-by-line summary with item names and prices.
        orders: buildOrderRows(), // Send table rows for the email template.
        total_amount: cartTotal ? cartTotal.textContent : '₹0', // Send the cart total text.
        to_email: data.email, // Send the user's email as the recipient.
        reply_to: data.email, // Let the receiver reply to the user's email.
        logo_url: logoUrl, // Send the logo image URL so the email can display the brand.
    }; // End of EmailJS template data object.
} // End of template data helper.

async function sendBookingEmail(data) { // Send the booking email through EmailJS.
    // Keep the EmailJS request separate so the submit handler stays clean.
    return emailjs.send(emailJsConfig.serviceId, emailJsConfig.templateId, buildBookingEmailData(data)); // Send the email with the prepared data.
} // End of email sending helper.

function clearBookingForm() { // Reset the booking form after success.
    // Reset the form after a successful send.
    if (bookingForm) { // Check whether the form exists first.
        bookingForm.reset(); // Clear all form fields.
    } // End of form existence check.

    if (bookingName) bookingName.value = ''; // Clear the name field if it exists.
    if (bookingEmail) bookingEmail.value = ''; // Clear the email field if it exists.
    if (bookingPhone) bookingPhone.value = ''; // Clear the phone field if it exists.
} // End of form reset helper.

function getCartItems() { // Convert the selected services map into an array.
    // Convert the Map into an array so it can be rendered as table rows.
    return [...selectedServices.values()]; // Return all selected service objects.
} // End of cart item helper.

function renderEmptyCartState() { // Show the cart when nothing has been selected.
    // Show the empty state when no services have been selected.
    if (!emptyCart || !cartItems || !cartBody || !cartTotal) return; // Stop if required elements are missing.

    emptyCart.classList.remove('hidden'); // Show the empty-cart message.
    cartItems.classList.add('hidden'); // Hide the table when there are no items.
    cartBody.innerHTML = ''; // Remove any existing rows.
    cartTotal.textContent = formatPrice(0); // Show zero as the total.
} // End of empty-cart renderer.

function renderFilledCartState(items) { // Show the cart table when items exist.
    // Build the cart table row by row from the selected services.
    if (!emptyCart || !cartItems || !cartBody || !cartTotal) return; // Stop if required elements are missing.

    emptyCart.classList.add('hidden'); // Hide the empty-cart message.
    cartItems.classList.remove('hidden'); // Show the table.

    const total = items.reduce((sum, item) => sum + item.price, 0); // Add up all service prices.

    cartBody.innerHTML = items // Put all rows into the table body.
        .map((item, index) => `
            <tr class="border-t border-slate-100">
                <td class="px-4 py-3 text-slate-500">${index + 1}</td>
                <td class="px-4 py-3 font-medium text-slate-900">${escapeHtml(item.name)}</td>
                <td class="px-4 py-3 text-right font-semibold text-slate-900">${formatPrice(item.price)}</td>
            </tr> 
        `) // Finish the row template for each item.
        .join(''); // Join all rows into one string.

    cartTotal.textContent = formatPrice(total); // Show the new total price.
} // End of filled-cart renderer.

function updateCart() { // Decide which cart view should be visible.
    // Choose the empty or filled cart view based on the current items.
    const items = getCartItems(); // Read the current selected services.

    if (items.length === 0) { // If there are no selected items...
        renderEmptyCartState(); // Show the empty cart view.
        return; // Stop here because there is nothing else to render.
    } // End of empty-cart branch.

    renderFilledCartState(items); // Otherwise show the filled cart view.
} // End of cart updater.

function addServiceToCart(card, button, serviceData) { // Add a selected service to memory.
    // Save the selected service and refresh the cart display.
    selectedServices.set(card, { ...serviceData, button }); // Store the service data along with its button.
    setServiceButtonState(button, true); // Change the button to the selected state.
    updateCart(); // Refresh the cart UI.
} // End of add-to-cart helper.

function removeServiceFromCart(card) { // Remove a selected service from memory.
    // Remove the service from memory and restore the button state.
    const service = selectedServices.get(card); // Get the saved service information.

    if (!service) return; // Stop if the card is not in the selected list.

    selectedServices.delete(card); // Remove the service from the map.
    setServiceButtonState(service.button, false); // Change the button back to the unselected state.
    updateCart(); // Refresh the cart UI.
} // End of remove-from-cart helper.

function toggleServiceInCart(button) { // Add or remove a service depending on current state.
    // One click adds the service, and a second click removes it.
    const card = button.closest('article'); // Find the service card that contains the clicked button.
    const serviceData = getServiceCardData(card); // Read the service name and price from the card.

    if (!card || !serviceData) return; // Stop if the card is missing or invalid.

    if (selectedServices.has(card)) { // If the service is already selected...
        removeServiceFromCart(card); // Remove it from the cart.
        showToast(`${serviceData.name} removed from cart`); // Tell the user it was removed.
        return; // Stop after removing the item.
    } // End of remove branch.

    addServiceToCart(card, button, serviceData); // Add the service to the cart.
    showToast(`${serviceData.name} added to cart`, 'success'); // Tell the user it was added.
} // End of toggle helper.

serviceButtons.forEach((button) => { // Go through every service button on the page.
    setServiceButtonState(button, false); // Set each button to its default "Add Item" state.

    button.addEventListener('click', () => { // Listen for clicks on this button.
        toggleServiceInCart(button); // Add or remove the matching service.
    }); // End of click listener.
}); // End of service button loop.

function resetCartSelections() { // Clear all selected services after success.
    // Clear the selection and reset every button back to its default state.
    selectedServices.forEach((item) => { // Loop through every selected service.
        setServiceButtonState(item.button, false); // Put the button back to the default state.
    }); // End of loop.
    selectedServices.clear(); // Remove everything from memory.
    updateCart(); // Re-render the cart as empty.
} // End of cart reset helper.

if (bookingForm) { // Only attach the submit handler if the form exists.
    bookingForm.addEventListener('submit', async (event) => { // Run this when the form is submitted.
        event.preventDefault(); // Stop the browser from refreshing the page.

        // Read the form values and validate them before sending the email.
        const bookingData = getBookingFormData(); // Collect the user input.
        const validationError = validateBookingFormData(bookingData); // Check if the input is valid.

        if (validationError) { // If something is wrong...
            showToast(validationError); // Show the error message to the user.

            if (validationError === 'Enter a valid email address' && bookingEmail) { // If the email is invalid...
                bookingEmail.focus(); // Put the cursor back in the email field.
            } // End of email focus check.

            if (validationError === 'Enter a valid 10 digit phone number' && bookingPhone) { // If the phone is invalid...
                bookingPhone.focus(); // Put the cursor back in the phone field.
            } // End of phone focus check.

            return; // Stop because the form is not ready yet.
        } // End of validation failure branch.

        if (!canSendBookingEmail()) { // If EmailJS is not configured...
            showToast('EmailJS is not configured yet. Add your service, template, and public key.', 'dark'); // Tell the user what is missing.
            return; // Stop because sending would fail.
        } // End of EmailJS config check.

        try { // Start the send process.
            // Send the booking email after all checks pass.
            await sendBookingEmail(bookingData); // Wait for EmailJS to finish sending.

            showToast('Booking email sent successfully.', 'success'); // Tell the user the send worked.
            showBookingMessage(`Thanks ${bookingData.name}! Your booking request has been sent.`); // Show a friendly success message.
            clearBookingForm(); // Clear the form fields.
            resetCartSelections(); // Empty the cart and reset the buttons.
        } catch (error) { // If sending fails...
            console.error('EmailJS booking error:', error); // Print the error to the console for debugging.
            showToast('Booking email could not be sent. Check your EmailJS settings.'); // Show an error message to the user.
        } // End of send failure handling.
    }); // End of submit listener.
} // End of booking form check.

if (newsletterSubscribe) { // Only attach the click handler if the subscribe button exists.
    newsletterSubscribe.addEventListener('click', () => { // Run this when the newsletter button is clicked.
        // Validate the newsletter fields before showing the success message.
        const name = newsletterName ? newsletterName.value.trim() : ''; // Read the newsletter name.
        const email = newsletterEmail ? newsletterEmail.value.trim() : ''; // Read the newsletter email.

        if (!name || !email) { // If either field is empty...
            showToast('Enter your name and email', 'dark'); // Ask the user to fill both fields.
            return; // Stop because the form is incomplete.
        } // End of empty-field check.

        const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); // Test whether the email looks valid.
        if (!emailValid) { // If the email is not valid...
            showToast('Enter a valid email address', 'dark'); // Show an error message.
            newsletterEmail?.focus(); // Put the cursor back in the email field.
            return; // Stop because the email is invalid.
        } // End of email validation.

        showToast(`Thanks ${name}, you subscribed.`, 'success'); // Show the success message.

        if (newsletterName) newsletterName.value = ''; // Clear the newsletter name field.
        if (newsletterEmail) newsletterEmail.value = ''; // Clear the newsletter email field.
    }); // End of newsletter click listener.
} // End of newsletter button check.

updateCart(); // Render the cart once when the page loads.
