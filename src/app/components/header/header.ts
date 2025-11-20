// src/app/components/header/header.component.ts
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart'; 
import { AuthService } from '../../services/auth'; 

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class HeaderComponent implements OnInit {
    cartCount: number = 0;
    isUserLoggedIn: boolean = false; 
    userRole: string | null = null; 

    constructor(
        private cartService: CartService,
        private authService: AuthService 
    ) {}

    ngOnInit(): void {
        // Suscripción clave: se ejecuta inmediatamente al inicio y cada vez que el estado cambia
        this.authService.isLoggedIn$.subscribe(state => {
            this.isUserLoggedIn = state;
            
            // Actualizar el rol para la visibilidad de ADMIN
            if (state) {
                this.userRole = this.authService.getUserRole();
            } else {
                this.userRole = null;
            }
        });

        this.cartService.cart$.subscribe(state => {
            this.cartCount = state.count;
        });
    }

    toggleCart() {
        const cartElement = document.getElementById('cart');
        if (cartElement) {
            cartElement.classList.toggle('active');
        }
    }
    
    performLogout() {
        this.authService.logout();
    }
}