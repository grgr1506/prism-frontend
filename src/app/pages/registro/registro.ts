// src/app/pages/registro/registro.component.ts
import { Component, OnInit } from '@angular/core';
// Importaciones separadas y correctas
import { CommonModule } from '@angular/common'; 
import { HttpClient } from '@angular/common/http'; 
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms'; 
import { Router, RouterModule } from '@angular/router'; 
import { environment } from '../../../environments/enviroments';

@Component({
  selector: 'app-registro',
  standalone: true,
  // Módulos necesarios para el Standalone Component
  imports: [CommonModule, ReactiveFormsModule, RouterModule], 
  templateUrl: './registro.html',
  styleUrls: ['./registro.css']
})
export class RegistroComponent implements OnInit {
  
  registroForm!: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
apiUrl = `${environment.serverURL}/api/auth/register`;

  // Inyección de dependencias
  constructor(
    private fb: FormBuilder, 
    private http: HttpClient, 
    private router: Router
  ) {}

  ngOnInit(): void {
    // Inicialización del formulario dentro de ngOnInit
    this.registroForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      correo_electronico: ['', [Validators.required, Validators.email]],
      // Usamos hash_contrasena para mapear con el nombre de la columna en la BD
      hash_contrasena: ['', [Validators.required, Validators.minLength(6)]], 
      // El teléfono es opcional en la BD
      numero_telefono: [''] 
    });
  }

  // En src/app/pages/registro/registro.ts

onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';
    
    if (this.registroForm.invalid) {
        this.registroForm.markAllAsTouched();
        return;
    }

    this.http.post(this.apiUrl, this.registroForm.value).subscribe({
      next: (response: any) => {
        console.log('Registro exitoso:', response);
        this.successMessage = '¡Registro exitoso! Serás redirigido para iniciar sesión.';
        
        // 1. BORRAR SESIÓN ANTIGUA (IMPORTANTE)
        localStorage.removeItem('user_session'); 

        setTimeout(() => {
            // 2. USAR NAVEGACIÓN COMPLETA PARA LIMPIAR LA MEMORIA
            // En lugar de this.router.navigate(['/login']);
            window.location.href = '/login';
        }, 2000);
      },
      error: (err) => {
        console.error('Error de registro:', err);
        if (err.status === 409) {
            this.errorMessage = 'El correo electrónico ya está en uso.';
        } else {
            this.errorMessage = 'Error al intentar registrarse. Verifique el servidor.';
        }
      }
    });
}
}