// src/app/sections/events/events.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart';
import { EventStateService, Evento } from '../../services/event-state'; 
import { Notyf } from 'notyf';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './events.html' ,
  styleUrls: ['./events.css']
})
export class EventsComponent implements OnInit {
    // FIX: Usamos un array simple para evitar errores de compilación en el template
    events: Evento[] = [];
    private notyf = new Notyf({
        position: { x: 'right', y: 'top' },
        duration: 1100,
         types: [
            {
                type: 'prism-success',
                background: 'linear-gradient(135deg, #ee3e96ff, #8a2be2)',
                className: 'notyf-prism'
            }
        ]
    });
    constructor(private eventStateService: EventStateService, private cartService: CartService) {}

    ngOnInit(): void {
        // FIX: Suscribirse y filtrar los eventos activos en TypeScript
        this.eventStateService.eventos$.subscribe(data => {
            this.events = data.filter(e => e.activo); 
            console.log(data)
        });
    }

    // --- Método buyTicket ---
    buyTicket(event: any) {
        this.cartService.addToCart({
            eventId: event.id_evento,
            eventName: event.titulo, 
            name: `Ticket: ${event.titulo}`,
            price: event.precio_entrada
        });
        this.notyf.open({
            type: 'prism-success',
            message: 'Evento Agregado al carrito!'
        });
    }
}