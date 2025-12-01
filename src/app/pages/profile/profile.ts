import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/enviroments';
import { QRCodeModule } from 'angularx-qrcode';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-profile',
  standalone: true,
  // 2. AGREGAR QRCodeModule A LOS IMPORTS
  imports: [CommonModule, ReactiveFormsModule, QRCodeModule], 
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfileComponent implements OnInit {
  
  activeTab: string = 'tickets'; // 'tickets' o 'settings'
  userEntradas: any[] = [];
  profileForm: FormGroup;
  passwordForm: FormGroup;
  userId: number | null = null;
  userName: string | null = '';
  userApellido: string | null='';

  constructor(
    private auth: AuthService,
    private http: HttpClient,
    private fb: FormBuilder
  ) {
    this.profileForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.userId = this.auth.getUserId();
    const userInfo = this.auth.getUserInfo(); // Asegúrate de tener este método en AuthService

    if (this.userId) {
      this.loadEntradas();
      if (userInfo) {
        this.profileForm.patchValue({
            nombre: userInfo.nombre,
            apellido: userInfo.apellido || ''
        });
        this.userName = userInfo.nombre;
        this.userApellido = userInfo.apellido;
      }
    }
  }

  switchTab(tab: string) {
    this.activeTab = tab;
  }

  loadEntradas() {
    this.http.get(`${environment.serverURL}/api/user/${this.userId}/entradas`)
      .subscribe({
        next: (data: any) => this.userEntradas = data,
        error: (err) => console.error(err)
      });
  }

  updateProfile() {
    if (this.profileForm.invalid) return;
    
    this.http.put(`${environment.serverURL}/api/user/${this.userId}/profile`, this.profileForm.value)
      .subscribe({
        next: () => {
          Swal.fire('Éxito', 'Datos actualizados. Por favor vuelve a iniciar sesión para ver los cambios.', 'success');
          // Opcional: Actualizar localStorage aquí o forzar logout
        },
        error: () => Swal.fire('Error', 'No se pudo actualizar', 'error')
      });
  }

  changePassword() {
    const { currentPassword, newPassword, confirmPassword } = this.passwordForm.value;
    
    if (newPassword.length < 6){
      Swal.fire('Contraseña no Valida', 'La contraseña debe tener mas de 6 caracteres', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      Swal.fire('Contraseñas Incorrectas', 'Las nuevas contraseñas no coinciden', 'error');
      return;
    }
    if (this.passwordForm.invalid) {
      Swal.fire('Error', 'Formulario Invalido', 'error');
      return;
    }
    this.http.put(`${environment.serverURL}/api/user/${this.userId}/password`, { currentPassword, newPassword })
      .subscribe({
        next: () => {
          Swal.fire('Éxito', 'Contraseña cambiada', 'success');
          this.passwordForm.reset();
        },
        error: (err) => Swal.fire('Error', err.error.error || 'Error del servidor', 'error')
      });
  }
}