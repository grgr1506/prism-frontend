// src/app/sections/vip/vip.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data';
import { CartService } from '../../services/cart';
import { Notyf } from 'notyf';

@Component({
  selector: 'app-vip',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vip.html' ,
  styleUrls: ['./vip.css']
})
export class VipComponent implements OnInit {
    memberships: any[] = [];
    private notyf = new Notyf({
        position: { x: 'right', y: 'top' },
        duration: 1100,
            types: [
            {
                type: 'prism-success',
                background: 'linear-gradient( 135deg, #ff6b35, #f7931e)',
                className: 'notyf-vip'
            }
        ]
    });

    constructor(private dataService: DataService, private cartService: CartService) {}
    ngOnInit(): void {
        this.dataService.getHomeData().subscribe({
            next: data => {
                if (data.membresias) {
                    this.memberships = data.membresias; // Rellenar membresías desde la API
                }
            },
            error: err => {
                console.error('Error al cargar datos de membresías:', err);
            }
        });
    }

    addToCart(membership: any) {
        // Lógica migrada de Script.js
        this.cartService.addToCart({
            eventId: membership.id_membresia, 
            eventName: membership.nombre,
            name: `Membresía: ${membership.nombre}`,
            price: membership.precio_mensual
        });
        this.notyf.open({
            type: 'prism-success',
            message: 'Membresia Agregada al carrito!'
        });
    }
}