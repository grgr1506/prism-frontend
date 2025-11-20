// src/app/components/shopping-cart/shopping-cart.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common'; // CurrencyPipe para el formato de moneda
import { CartService } from '../../services/cart';
import { PaymentModal } from "../payment-modal/payment-modal";

@Component({
  selector: 'app-shopping-cart',
  standalone: true,
  // CurrencyPipe se añade para dar formato al monto total
  imports: [CommonModule, CurrencyPipe, PaymentModal], 
  templateUrl: './shopping-cart.html',
  styleUrls: ['./shopping-cart.css']
})
export class ShoppingCartComponent implements OnInit {
    cartItems: any[] = [];
    totalAmount: number = 0;
    showPaymentModal = false;
    
    constructor(private cartService: CartService) {}

    ngOnInit(): void {
        // Suscribirse al Observable del carrito para actualizar la vista inmediatamente
        this.cartService.cart$.subscribe(state => {
            this.cartItems = state.items;
            this.totalAmount = state.total;
        });
    }

    // Lógica para cerrar/abrir el carrito (llamada desde el Header y el carrito mismo)
    toggleCart() {
        const cartElement = document.getElementById('cart');
        if (cartElement) {
            cartElement.classList.toggle('active');
        }
    }

    // Llama al servicio para eliminar un ítem
    removeFromCart(itemName: string) {
        this.cartService.removeFromCart(itemName);
    }
    openPaymentModal() {
        this.showPaymentModal = true;
    }

    closePaymentModal() {
        this.showPaymentModal = false;
    }
}