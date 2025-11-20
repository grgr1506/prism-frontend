// src/app/components/footer/footer.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; 
import { FormsModule } from '@angular/forms'; 
import { HttpClient } from '@angular/common/http'; // 1. Importar HttpClient
import Swal from 'sweetalert2';
import { environment } from '../../../environments/enviroments';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule], 
  templateUrl: './footer.html',
  styleUrls: ['./footer.css']
})
export class FooterComponent {
    
    newsletterEmail: string = '';

    // 2. Inyectar HttpClient en el constructor
    constructor(private http: HttpClient) {}

    subscribeToNewsletter() {
        // Validación simple
        if (!this.newsletterEmail || !this.newsletterEmail.includes('@')) {
            Swal.fire({
                title: 'Email Inválido',
                text: 'Por favor, ingrese un correo electrónico válido.',
                icon: 'warning',
                confirmButtonColor: '#333'
            });
            return;
        }

        const url = `${environment.serverURL}/api/newsletter`;

        this.http.post(url, { email: this.newsletterEmail })
            .subscribe({
                next: (response: any) => {
                    Swal.fire({
                        title: '¡Suscripción Exitosa!',
                        text: 'Revisa tu correo, te hemos enviado una sorpresa.',
                        icon: 'success',
                        confirmButtonColor: '#ff0080'
                    });
                    this.newsletterEmail = '';
                },
                error: (err) => {
                    console.error('Error suscripción:', err);
                    Swal.fire({
                        title: 'Error',
                        text: 'No pudimos suscribirte en este momento.',
                        icon: 'error'
                    });
                }
            });
    }
}