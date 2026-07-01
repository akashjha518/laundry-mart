const cart = [];

const emptyCart = document.getElementById("emptyCart");
// const emptyContent = document.getElementById("emptyContent")
const cartItems = document.getElementById("cartItems");
const tbody = document.querySelector(".cart-table tbody");
const totalElement = document.querySelector(".total-section strong");

document.querySelectorAll(".service-item .btn-add").forEach(button => {

    button.addEventListener("click", function () {

        const serviceItem = this.closest(".service-item");

        const id = serviceItem.dataset.id;
        const name = serviceItem.dataset.name;
        const price = parseFloat(serviceItem.dataset.price);

        const index = cart.findIndex(item => item.id === id);

        // ADD ITEM
        if (index === -1) {

            cart.push({
                id,
                name,
                price
            });

            this.innerHTML = `
                <strong>Remove Item</strong>
                <ion-icon name="remove-circle-outline"></ion-icon>
            `;

            this.classList.add("btn-remove");

        }
        // REMOVE ITEM
        else {

            cart.splice(index, 1);

            this.innerHTML = `
                <strong>Add Item</strong>
                <ion-icon name="add-circle-outline"></ion-icon>
            `;

            this.classList.remove("btn-remove");
        }

        renderCart();

    });

});

function renderCart() {

    tbody.innerHTML = "";

    let total = 0;

    if (cart.length === 0) {
        // emptyContent.style.display = "block"

        emptyCart.style.display = "block";
        cartItems.style.display = "none";
        totalElement.textContent = "₹0";

        return;
    }

    // emptyContent.style.display = "none";
    emptyCart.style.display = "none";
    cartItems.style.display = "block";

    cart.forEach((item, index) => {

        total += item.price;

        tbody.innerHTML += `
            <tr>
                <td>${index + 1}</td>
                <td>${item.name}</td>
                <td>₹${item.price.toFixed(2)}</td>
            </tr>
        `;

    });

    totalElement.textContent = `₹${total.toFixed(2)}`;

}

// Email JS implementation

const bookingForm = document.getElementById("bookingForm");

bookingForm.addEventListener("submit", function (e) {

    e.preventDefault();

    if (cart.length === 0) {
        alert("Please add at least one service.");
        return;
    }

    // Create service list
    const services = cart
        .map((item, index) =>
            `${index + 1}. ${item.name} - ₹${item.price.toFixed(2)}`
        )
        .join("\n");

    // Calculate total
    const total = cart.reduce((sum, item) => sum + item.price, 0);

    const templateParams = {
        user_name: document.getElementById("name").value,
        user_email: document.getElementById("email").value,
        user_phone: document.getElementById("phone").value,
        services: services,
        service_count: cart.length,
        total_amount: `₹${total.toFixed(2)}`
    };
    const bookingMessage = document.getElementById("bookingMessage");

    emailjs.send(
        "service_vjq7pfg",
        "template_w9g8g08",
        templateParams
    )
        .then(() => {

            bookingMessage.style.display = "block";
            bookingMessage.textContent =
                "Thank you for booking the service. We will get back to you soon!";
            alert("Check Spam if email not received")

            bookingForm.reset();

            cart.length = 0;

            // Reset buttons
            document.querySelectorAll(".service-item .btn-add").forEach(btn => {
                btn.innerHTML = `
                <strong>Add Item</strong>
                <ion-icon name="add-circle-outline"></ion-icon>
            `;
                btn.classList.remove("btn-remove");
            });

            renderCart();

        })
        .catch((error) => {
            console.error(error);
            alert("Failed to send booking.");
        });
});


// For newsletter - implementing Email-Js

const newsletterForm = document.getElementById("newsletterForm");
const newsletterMessage = document.getElementById("newsletterMessage");

newsletterForm.addEventListener("submit", function (e) {

    e.preventDefault();

    const templateParams = {

        subscriber_name: document.getElementById("subscriberName").value,

        subscriber_email: document.getElementById("subscriberEmail").value

    };

    emailjs.send(
        "service_vjq7pfg",
        "template_2ufgngj",
        templateParams
    )
    .then(() => {

        newsletterMessage.style.display = "block";
        newsletterMessage.style.color = "green";
        newsletterMessage.textContent =
            "Thank you for subscribing to our newsletter!";

        newsletterForm.reset();

    })
    .catch((error) => {

        console.error(error);

        newsletterMessage.style.display = "block";
        newsletterMessage.style.color = "red";
        newsletterMessage.textContent =
            "Subscription failed. Please try again.";

    });

});



