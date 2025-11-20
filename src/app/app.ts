// src/app/app.component.ts

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router'; // <-- NECESITAS RouterOutlet
import { CommonModule } from '@angular/common'; 
import { HeaderComponent } from './components/header/header';
import { FooterComponent } from './components/footer/footer';
import { ShoppingCartComponent } from './components/shopping-cart/shopping-cart';

// IMPORTACIONES DE SECCIÓN ELIMINADAS O MOVIDAS (Ver nota abajo)
// ...

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet, // <-- AÑADIR RouterOutlet aquí
    HeaderComponent,
    FooterComponent,
    ShoppingCartComponent,
    // Eliminar la lista de todos los componentes de sección de aquí (Hero, About, Events, etc.)
  ],
  template: `
    <app-header></app-header>
    
    <main>
        <router-outlet></router-outlet>
    </main>

    <app-footer></app-footer>
    <app-shopping-cart></app-shopping-cart>
  `
})
export class AppComponent {}