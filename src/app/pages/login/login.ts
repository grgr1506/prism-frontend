// src/app/pages/login/login.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { HttpClient } from '@angular/common/http'; 
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms'; 
import { Router, RouterModule } from '@angular/router'; 
import { AuthService } from '../../services/auth'; // <-- Importar
import Swal from 'sweetalert2';
import { environment } from '../../../environments/enviroments';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule], 
  templateUrl: './login.html' ,
  styleUrls: ['./login.css']
})
export class LoginComponent implements OnInit {

  // Agrega este método dentro de la clase LoginComponent
recuperarContrasena() {
  Swal.fire({
    title: 'Recuperar Contraseña',
    input: 'email',
    inputLabel: 'Ingresa tu correo registrado',
    inputPlaceholder: 'tu@correo.com',
    showCancelButton: true,
    confirmButtonText: 'Enviar',
    cancelButtonText: 'Cancelar',
    background: '#1a1a1a',
    color: '#fff',
    confirmButtonColor: '#ff6b35'
  }).then((result) => {
    if (result.isConfirmed && result.value) {
      this.http.post(`${environment.serverURL}/api/auth/recovery`, { correo_electronico: result.value })
        .subscribe({
          next: () => Swal.fire('Enviado', 'Revisa tu correo con la nueva contraseña', 'success'),
          error: (err) => Swal.fire('Error', err.error.error || 'No se pudo enviar', 'error')
        });
    }
  });
}
  
  loginForm!: FormGroup; 
  errorMessage: string = '';
  apiUrl = `${environment.serverURL}/api/auth/login`;

  constructor(
    private fb: FormBuilder, 
    private http: HttpClient, 
    private router: Router,
    private authService: AuthService // <-- Inyección
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      correo_electronico: ['', [Validators.required, Validators.email]],
      hash_contrasena: ['', Validators.required],
    });
  }

  onSubmit() {
    this.errorMessage = '';
    
    if (this.loginForm.invalid) {
        this.loginForm.markAllAsTouched();
        return;
    }

    this.http.post(this.apiUrl, this.loginForm.value).subscribe({
      next: (response: any) => {
        // 1. Guardar la sesión y NOTIFICAR al HeaderComponent
        this.authService.login(response); 
        
        // 2. Redirección basada en el rol
        const role = this.authService.getUserRole();
        if (role === 'admin') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        Swal.fire({
          title: 'Error',
          text: 'Credenciales inválidas o error de conexión. Inténtelo de nuevo.',
          icon: 'error'
        });
      }
    });
  }
}