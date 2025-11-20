// src/app/pages/admin/dashboard-layout/dashboard-layout.component.ts

import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router'; 
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule],
  templateUrl: './dashboard-layout.html',
  // ENLACE AL CSS LOCAL
  styleUrls: ['./dashboard-layout.css'], 
  // NECESARIO para que las clases de layout (Sidebar, Card, etc.) funcionen globalmente
  encapsulation: ViewEncapsulation.None 
})
export class DashboardLayoutComponent implements OnInit {
    userName: string = 'Usuario Admin';
    
    constructor(private authService: AuthService) {
        if (this.authService.getUserRole() !== 'admin') {
            this.authService.logout(); 
        }
    }

    ngOnInit(): void {
        const userInfo = this.authService.getUserInfo();
        if (userInfo) {
            this.userName = userInfo.nombre || 'Admin';
        }
    }

    performLogout() {
        this.authService.logout();
    }

    // Lógica del toggle del sidebar (usa body classes, lo que requiere ViewEncapsulation.None)
    toggleSidebar() {
        document.body.classList.toggle('sidebar-toggled');
        document.getElementById('accordionSidebar')?.classList.toggle('toggled');
    }
}