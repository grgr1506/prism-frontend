// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
    
    private hasToken(): boolean {
        return !!localStorage.getItem('user_session');
    }

    // Observable que el HeaderComponent usa para saber si está logeado
    private loggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
    public isLoggedIn$: Observable<boolean> = this.loggedInSubject.asObservable(); 
    private userData: any = null;
    constructor(private router: Router) {}

    // Implementación de getUserInfo() para resolver el error
    getUserInfo(): any { // <--- FUNCIÓN AÑADIDA
        const session = localStorage.getItem('user_session');
        if (session) {
            const data = JSON.parse(session);
            // Devuelve el objeto de usuario completo
            return data.user;
        }
        return null;
    }

    // Llamado después de un login exitoso
    login(userData: any) {
        localStorage.setItem('user_session', JSON.stringify(userData));
        this.loggedInSubject.next(true); // NOTIFICACIÓN REACTIVA
    }
    isLogged(): boolean {
        if (this.userData) return true;

        // extra: cargar del localStorage
        const stored = localStorage.getItem('user_session');
        if (stored) {
        this.userData = JSON.parse(stored);
        console.log(this.userData);
        return true;
        }
        return false;
    }

    getUserId(): number | null {
        const stored = localStorage.getItem('user_session');
        if (!stored) return null;

        const session = JSON.parse(stored);
        return session?.user?.id || null;
    }
    getNombreUser(): string | null {
        const stored = localStorage.getItem('user_session');
        if (!stored) return null;
        const session = JSON.parse(stored);
        return session?.user?.nombre || null
    }
    getApellidoUser(): string | null {
        const stored = localStorage.getItem('user_session');
        if (!stored) return null;
        const session = JSON.parse(stored);
        return session?.user?.apellido || null
    }
    // Cierra la sesión y notifica
    logout() {
        localStorage.removeItem('user_session');
        this.loggedInSubject.next(false); // NOTIFICACIÓN REACTIVA
        this.router.navigate(['/']); 
    }
    
    // Obtiene el rol del usuario para la visibilidad del botón ADMIN
    getUserRole(): string | null {
        const session = localStorage.getItem('user_session');
        if (session) {
            const data = JSON.parse(session);
            // Intenta obtener el rol de diferentes posibles estructuras de la sesión
            return data.user?.tipo_usuario || data.user?.rol || null;
        }
        return null;
    }
}