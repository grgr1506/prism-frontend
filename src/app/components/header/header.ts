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
    userName: string | null = null; // <--- Nueva variable para el nombre
    
    // VARIABLE PARA EL MENÚ MÓVIL
    isMenuOpen: boolean = false;

    constructor(
        private cartService: CartService,
        private authService: AuthService 
    ) {}

    ngOnInit(): void {
        this.authService.isLoggedIn$.subscribe(state => {
            this.isUserLoggedIn = state;
            if (state) {
                this.userRole = this.authService.getUserRole();
                this.userName = this.authService.getNombreUser(); // <--- Obtener el nombre del servicio
            } else {
                this.userRole = null;
                this.userName = null;
            }
        });

        this.cartService.cart$.subscribe(state => {
            this.cartCount = state.count;
        });
    }

    // FUNCIÓN PARA ABRIR/CERRAR MENÚ
    toggleMenu() {
        this.isMenuOpen = !this.isMenuOpen;
    }

    toggleCart() {
        const cartElement = document.getElementById('cart');
        if (cartElement) {
            cartElement.classList.toggle('active');
        }
        // Cerrar menú si se abre el carrito
        this.isMenuOpen = false;
    }
    
    performLogout() {
        this.authService.logout();
        this.isMenuOpen = false; // Cerrar menú al salir
    }
}