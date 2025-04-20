// DOM Elements
const cartToggle = document.getElementById('cart-toggle');
const closeCart = document.getElementById('close-cart');
const cartContainer = document.getElementById('cart-container');
const overlay = document.getElementById('overlay');
const cartItems = document.getElementById('cart-items');
const cartCountElement = document.querySelector('.cart-count');
const cartSubtotalElement = document.getElementById('cart-subtotal');
const cartShippingElement = document.getElementById('cart-shipping');
const cartTotalElement = document.getElementById('cart-total');
const clearCartBtn = document.getElementById('clear-cart');
const checkoutBtn = document.getElementById('checkout-btn');
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const nav = document.querySelector('nav');
const paymentSection = document.getElementById('payment-section');
const paymentItems = document.getElementById('payment-items');
const paymentSubtotal = document.getElementById('payment-subtotal');
const paymentShipping = document.getElementById('payment-shipping');
const paymentTotal = document.getElementById('payment-total');

// Size dropdown for product 1
const sizeDropdown = document.getElementById('size-dropdown-1');

// Cart Data
let cart = [];
let cartCount = 0;
let cartSubtotal = 0;
let cartShipping = 0;
let cartTotal = 0;

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Load cart from localStorage if available
    loadCart();
    
    // Add to cart buttons
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', addToCart);
    });

    // Cart toggle
    cartToggle.addEventListener('click', toggleCart);
    closeCart.addEventListener('click', toggleCart);
    overlay.addEventListener('click', toggleCart);

    // Clear cart
    clearCartBtn.addEventListener('click', clearCart);

    // Checkout
    checkoutBtn.addEventListener('click', checkout);

    // Mobile menu
    mobileMenuToggle.addEventListener('click', toggleMobileMenu);
    
    // Size dropdown change event for product 1
    if (sizeDropdown) {
        sizeDropdown.addEventListener('change', updateProductPricing);
        // Initialize with default values
        updateProductPricing();
    }
    
    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Close mobile menu if open
            if (nav.classList.contains('active')) {
                toggleMobileMenu();
            }
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Initialize PayPal button
    initPayPalButton();
});

// Functions
function toggleCart() {
    cartContainer.classList.toggle('active');
    overlay.style.display = overlay.style.display === 'block' ? 'none' : 'block';
    document.body.style.overflow = overlay.style.display === 'block' ? 'hidden' : '';
}

function toggleMobileMenu() {
    nav.classList.toggle('active');
    mobileMenuToggle.querySelector('i').classList.toggle('fa-bars');
    mobileMenuToggle.querySelector('i').classList.toggle('fa-times');
}

function updateProductPricing() {
    if (!sizeDropdown) return;
    
    const selectedOption = sizeDropdown.options[sizeDropdown.selectedIndex];
    const price = parseFloat(selectedOption.dataset.price);
    const shipping = parseFloat(selectedOption.dataset.shipping);
    const total = price + shipping;
    
    // Update product price, shipping, and total
    const productCard = sizeDropdown.closest('.product-card');
    const productPriceElement = productCard.querySelector('.product-price');
    const shippingPriceElement = productCard.querySelector('.shipping-price');
    const totalPriceElement = productCard.querySelector('.total-price');
    const addToCartButton = productCard.querySelector('.add-to-cart-btn');
    
    productPriceElement.textContent = `$${price.toFixed(2)}`;
    shippingPriceElement.textContent = `+ $${shipping.toFixed(2)} shipping`;
    totalPriceElement.textContent = `Total: $${total.toFixed(2)}`;
    
    // Update add to cart button data attributes
    const selectedSize = selectedOption.value;
    addToCartButton.dataset.name = `Bamboo Parol Kit (${selectedSize})`;
    addToCartButton.dataset.price = price.toFixed(2);
    addToCartButton.dataset.shipping = shipping.toFixed(2);
}

function addToCart(e) {
    const button = e.currentTarget;
    const id = button.dataset.id;
    const name = button.dataset.name;
    const price = parseFloat(button.dataset.price);
    const shipping = parseFloat(button.dataset.shipping);
    
    // Add animation to button
    button.classList.add('add-to-cart-animation');
    setTimeout(() => {
        button.classList.remove('add-to-cart-animation');
    }, 800);
    
    // Check if product already exists in cart
    const existingItemIndex = cart.findIndex(item => 
        item.id === id && item.name === name
    );
    
    if (existingItemIndex > -1) {
        // Increase quantity
        cart[existingItemIndex].quantity += 1;
    } else {
        // Add new item
        cart.push({
            id,
            name,
            price,
            shipping,
            quantity: 1,
            image: `images/product${id}.jpg`
        });
    }
    
    // Update cart count and total
    updateCartSummary();
    
    // Update cart UI
    renderCart();
    
    // Save cart to localStorage
    saveCart();
    
    // Show notification
    showNotification(`${name} added to cart!`);
}

function updateCartSummary() {
    // Update cart count
    cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    cartCountElement.textContent = cartCount;
    
    // Update cart subtotal, shipping, and total
    cartSubtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    cartShipping = cart.reduce((total, item) => total + (item.shipping * item.quantity), 0);
    cartTotal = cartSubtotal + cartShipping;
    
    cartSubtotalElement.textContent = `$${cartSubtotal.toFixed(2)}`;
    cartShippingElement.textContent = `$${cartShipping.toFixed(2)}`;
    cartTotalElement.textContent = `$${cartTotal.toFixed(2)}`;
}

function renderCart() {
    // Clear cart items
    cartItems.innerHTML = '';
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
        return;
    }
    
    // Render each cart item
    cart.forEach(item => {
        const cartItemElement = document.createElement('div');
        cartItemElement.classList.add('cart-item');
        
        cartItemElement.innerHTML = `
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="cart-item-details">
                <div class="cart-item-title">${item.name}</div>
                <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                <div class="cart-item-shipping">+ $${item.shipping.toFixed(2)} shipping</div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn decrease" data-id="${item.id}" data-name="${item.name}">-</button>
                    <span class="quantity-value">${item.quantity}</span>
                    <button class="quantity-btn increase" data-id="${item.id}" data-name="${item.name}">+</button>
                    <button class="remove-item" data-id="${item.id}" data-name="${item.name}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        
        cartItems.appendChild(cartItemElement);
    });
    
    // Add event listeners to quantity buttons and remove buttons
    const decreaseButtons = document.querySelectorAll('.quantity-btn.decrease');
    const increaseButtons = document.querySelectorAll('.quantity-btn.increase');
    const removeButtons = document.querySelectorAll('.remove-item');
    
    decreaseButtons.forEach(button => {
        button.addEventListener('click', decreaseQuantity);
    });
    
    increaseButtons.forEach(button => {
        button.addEventListener('click', increaseQuantity);
    });
    
    removeButtons.forEach(button => {
        button.addEventListener('click', removeItem);
    });
}

function decreaseQuantity(e) {
    const id = e.currentTarget.dataset.id;
    const name = e.currentTarget.dataset.name;
    const itemIndex = cart.findIndex(item => 
        item.id === id && item.name === name
    );
    
    if (itemIndex > -1) {
        if (cart[itemIndex].quantity > 1) {
            cart[itemIndex].quantity -= 1;
        } else {
            cart.splice(itemIndex, 1);
        }
        
        updateCartSummary();
        renderCart();
        saveCart();
    }
}

function increaseQuantity(e) {
    const id = e.currentTarget.dataset.id;
    const name = e.currentTarget.dataset.name;
    const itemIndex = cart.findIndex(item => 
        item.id === id && item.name === name
    );
    
    if (itemIndex > -1) {
        cart[itemIndex].quantity += 1;
        
        updateCartSummary();
        renderCart();
        saveCart();
    }
}

function removeItem(e) {
    const id = e.currentTarget.dataset.id;
    const name = e.currentTarget.dataset.name;
    const itemIndex = cart.findIndex(item => 
        item.id === id && item.name === name
    );
    
    if (itemIndex > -1) {
        const itemName = cart[itemIndex].name;
        cart.splice(itemIndex, 1);
        
        updateCartSummary();
        renderCart();
        saveCart();
        
        showNotification(`${itemName} removed from cart!`);
    }
}

function clearCart() {
    cart = [];
    updateCartSummary();
    renderCart();
    saveCart();
    
    showNotification('Cart cleared!');
}

function saveCart() {
    localStorage.setItem('myparol_cart', JSON.stringify(cart));
}

function loadCart() {
    const savedCart = localStorage.getItem('myparol_cart');
    
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartSummary();
        renderCart();
    }
}

function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.classList.add('notification');
    notification.innerHTML = message;
    
    // Append to body
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function checkout() {
    if (cart.length === 0) {
        showNotification('Your cart is empty!');
        return;
    }
    
    // Toggle cart
    toggleCart();
    
    // Update payment summary
    renderPaymentSummary();
    
    // Show payment section
    paymentSection.style.display = 'block';
    
    // Scroll to payment section
    window.scrollTo({
        top: paymentSection.offsetTop - 80,
        behavior: 'smooth'
    });
}

function renderPaymentSummary() {
    // Clear payment items
    paymentItems.innerHTML = '';
    
    // Render each payment item
    cart.forEach(item => {
        const paymentItemElement = document.createElement('div');
        paymentItemElement.classList.add('payment-item');
        
        paymentItemElement.innerHTML = `
            <div class="payment-item-name">${item.name} (x${item.quantity})</div>
            <div class="payment-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
        `;
        
        paymentItems.appendChild(paymentItemElement);
    });
    
    // Update payment subtotal, shipping, and total
    paymentSubtotal.textContent = `$${cartSubtotal.toFixed(2)}`;
    paymentShipping.textContent = `$${cartShipping.toFixed(2)}`;
    paymentTotal.textContent = `$${cartTotal.toFixed(2)}`;
}

function initPayPalButton() {
    // This is a sandbox implementation for demonstration purposes
    // In a real implementation, you would use the PayPal SDK
    
    const paypalButtonContainer = document.getElementById('paypal-button-container');
    if (!paypalButtonContainer) return;
    
    const paypalButton = document.createElement('div');
    paypalButton.classList.add('paypal-mock-button');
    paypalButton.innerHTML = `
        <button class="btn" style="background-color: #0070ba; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 10px;">
            <i class="fab fa-paypal"></i> Pay with PayPal
        </button>
        <div style="margin-top: 15px;">
            <button class="btn" style="background-color: var(--yellow-green); color: var(--dark-gray); width: 100%;">
                Pay with Credit Card
            </button>
        </div>
        <p style="margin-top: 20px; font-size: 14px; text-align: center; color: #666;">
            This is a demonstration of PayPal integration.<br>
            No actual payment will be processed.
        </p>
    `;
    
    paypalButtonContainer.appendChild(paypalButton);
    
    // Add click event to PayPal button
    paypalButton.querySelector('.btn').addEventListener('click', completeOrder);
    paypalButton.querySelectorAll('.btn')[1].addEventListener('click', completeOrder);
}

function completeOrder() {
    // Show success message
    const paymentOptions = document.querySelector('.payment-options');
    paymentOptions.innerHTML = `
        <div style="text-align: center; padding: 30px 0;">
            <i class="fas fa-check-circle" style="font-size: 60px; color: #4CAF50; margin-bottom: 20px;"></i>
            <h3 style="margin-bottom: 15px;">Payment Successful!</h3>
            <p>Your order has been placed successfully.</p>
            <p>Order #: MYPAROL-${Math.floor(Math.random() * 10000)}</p>
            <p style="margin-top: 20px;">Thank you for shopping with MyParol.com!</p>
            <button class="btn" style="margin-top: 30px;" id="continue-shopping">Continue Shopping</button>
        </div>
    `;
    
    // Add event listener to continue shopping button
    document.getElementById('continue-shopping').addEventListener('click', () => {
        // Clear cart
        clearCart();
        
        // Hide payment section
        paymentSection.style.display = 'none';
        
        // Scroll to top
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}