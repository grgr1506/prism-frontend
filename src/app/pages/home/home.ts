// src/app/pages/home/home.component.ts
import { Component } from '@angular/core';
// Importar TODAS las secciones que forman la página de inicio
import { HeroComponent } from '../../sections/hero/hero'; 
import { AboutComponent } from '../../sections/about/about';
import { EventsComponent } from '../../sections/events/events';
import { VipComponent } from '../../sections/vip/vip';
import { ContactComponent } from '../../sections/contact/contact';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HeroComponent,
    AboutComponent,
    EventsComponent,
    VipComponent,
    ContactComponent 
  ],
  templateUrl: './home.html',
})
export class HomeComponent { }