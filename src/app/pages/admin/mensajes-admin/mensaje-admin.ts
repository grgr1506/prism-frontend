// src/app/pages/admin/mensajes-admin/mensajes-admin.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; 
import { HttpClient } from '@angular/common/http';
import { catchError, throwError } from 'rxjs'; 
import { environment } from '../../../../environments/enviroments';

interface Mensaje {
    id_mensaje: number;
    nombre: string;
    apellido: string;
    correo_electronico: string;
    numero_telefono: string | null;
    tipo_consulta: string;
    mensaje: string;
    enviado_en: string;
    leido: boolean;
}

@Component({
  selector: 'app-mensajes-admin',
  standalone: true,
  imports: [CommonModule, DatePipe], 
  templateUrl: './mensajes-admin.html',
  styleUrls: ['./mensajes-admin.css'],
})
export class MensajesAdminComponent implements OnInit {
    mensajes: Mensaje[] = []; 
    selectedMensaje: Mensaje | null = null;
 apiUrl = `${environment.serverURL}/api/admin/mensajes`;
    constructor(private http: HttpClient) {} 

    ngOnInit(): void {
        this.loadMensajes();
    }
    
    loadMensajes() {
        this.http.get<Mensaje[]>(this.apiUrl)
            .pipe(
                catchError(err => {
                    console.error('Error al cargar mensajes:', err);
                    alert('Error al cargar mensajes. Verifique el servidor API.');
                    return throwError(() => err);
                })
            )
            .subscribe(data => {
                this.mensajes = data;
            });
    }

    selectMensaje(mensaje: Mensaje) {
        this.selectedMensaje = mensaje;
        
        // Si el mensaje no está leído, marcarlo como leído inmediatamente
        if (!mensaje.leido) {
            this.toggleLeido(mensaje, true);
        }
    }
    
    toggleLeido(mensaje: Mensaje, newState: boolean) {
        this.http.patch(`${this.apiUrl}/${mensaje.id_mensaje}`, { leido: newState })
            .pipe(
                catchError(err => {
                    console.error('Error al cambiar estado leído:', err);
                    alert('Error al actualizar estado en la API.');
                    return throwError(() => err);
                })
            )
            .subscribe(() => {
                // Actualizar el estado localmente
                mensaje.leido = newState;
                // Reordenar para que los mensajes leídos vayan al final (opcional)
                this.mensajes.sort((a, b) => (a.leido === b.leido) ? 0 : a.leido ? 1 : -1);
            });
    }
}