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

  onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';
    
    if (this.registroForm.invalid) {
        this.registroForm.markAllAsTouched();
        return;
    }

    // Llama al endpoint de registro
    this.http.post(this.apiUrl, this.registroForm.value).subscribe({
      next: (response: any) => {
        console.log('Registro exitoso:', response);
        this.successMessage = '¡Registro exitoso! Serás redirigido para iniciar sesión.';
        
        // Redirigir al login después del éxito
        setTimeout(() => {
            this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        console.error('Error de registro:', err);
        // Manejo específico del conflicto 409 (Correo ya existe)
        if (err.status === 409) {
            this.errorMessage = 'El correo electrónico ya está en uso.';
        } else {
            this.errorMessage = 'Error al intentar registrarse. Verifique el servidor.';
        }
      }
    });
  }
}