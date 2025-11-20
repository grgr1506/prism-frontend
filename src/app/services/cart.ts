// src/app/services/cart.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

interface CartItem {
    eventId: number; 
    name: string;
    eventName: string;
    price: number;
    quantity: number;
}

interface CartState {
    count: number;
    total: number;
    items: CartItem[];
}

@Injectable({ providedIn: 'root' })
export class CartService {
    // Inicializamos el estado del carrito
    private initialState: CartState = { count: 0, total: 0, items: [] };
    
    // BehaviorSubject para almacenar y emitir el estado actual del carrito
    private cartSubject = new BehaviorSubject<CartState>(this.initialState);
    
    // Observable que los componentes consumirán para reaccionar a los cambios
    public cart$: Observable<CartState> = this.cartSubject.asObservable();
    
    constructor() {
        // Opcional: Cargar estado del carrito desde localStorage al iniciar
    }

    private updateCartState() {
        // Lógica migrada de la función updateCart() de Script.js
        const currentItems = this.cartSubject.value.items;
        
        const count = currentItems.reduce((total, item) => total + item.quantity, 0);
        const total = currentItems.reduce((total, item) => total + (item.price * item.quantity), 0);
        
        // Emitir el nuevo estado
        this.cartSubject.next({ count, total, items: currentItems });
    }

    addToCart(item: { eventId: number, eventName: string, name: string, price: number }) {
        const currentItems = this.cartSubject.value.items;
        const existingItem = currentItems.find(i => i.eventId === item.eventId);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            currentItems.push({
                eventId: item.eventId,
                eventName: item.eventName, 
                name: item.name,
                price: item.price,
                quantity: 1
            });
        }

        this.updateCartState();
    }


    removeFromCart(itemName: string) {
        // Lógica migrada de la función removeFromCart() de Script.js
        let currentItems = this.cartSubject.value.items;
        currentItems = currentItems.filter(item => item.name !== itemName);

        // Actualizar el subject directamente con la lista filtrada
        this.cartSubject.next({ ...this.cartSubject.value, items: currentItems });
        
        // Simular la notificación
        console.log(`${itemName} eliminado del carrito`);

        this.updateCartState();
    }
    getItems() {
        return this.cartSubject.value.items;
    }
}