import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/enviroments';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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
    if (this.passwordForm.invalid) return;
    const { currentPassword, newPassword, confirmPassword } = this.passwordForm.value;

    if (newPassword !== confirmPassword) {
      Swal.fire('Error', 'Las nuevas contraseñas no coinciden', 'error');
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