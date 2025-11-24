import { Routes } from '@angular/router';

// --- Guards ---
// Asumo que tienes un guard para proteger la ruta de administración (ej. adminGuard)
// import { adminGuard } from './guards/admin.guard'; 

// --- Componentes del Cliente ---
import { HomeComponent } from './pages/home/home';
import { LoginComponent } from './pages/login/login';
import { RegistroComponent } from './pages/registro/registro';

// --- Componentes del Dashboard (Admin) ---
import { DashboardLayoutComponent } from './pages/admin/dashboard-layout/dashboard-layout';
import { DashboardHomeComponent } from './pages/admin/dashboard-home/dashboard-home';
import { EventosAdminComponent } from './pages/admin/eventos-admin/eventos-admin';
// 💡 NUEVA IMPORTACIÓN
import { MensajesAdminComponent } from './pages/admin/mensajes-admin/mensaje-admin'; 

import { FormsModule } from '@angular/forms'; 
import { PaymentResultComponent } from './components/payment-result/payment-result';
import { ProfileComponent } from './pages/profile/profile';

export const routes: Routes = [
    // --- RUTAS PÚBLICAS/CLIENTE ---
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', component: HomeComponent, title: 'Prism Club - Inicio' },
    { path: 'login', component: LoginComponent, title: 'Prism Club - Login' },
    { path: 'registro', component: RegistroComponent, title: 'Prism Club - Registro' },
    { path: "payment-result", component: PaymentResultComponent },
    { path: 'perfil', component: ProfileComponent, title: 'Prism Club - Mi Perfil' },
    // --- RUTAS DE ADMINISTRACIÓN ---
    { 
        path: 'admin', 
        component: DashboardLayoutComponent,
        // Si tienes un guard de autenticación para admin, descomenta la siguiente línea:
        // canActivate: [adminGuard],
        children: [
            // Dashboard principal
            { 
                path: '', 
                component: DashboardHomeComponent,
                title: 'Admin - Dashboard'
            },
            // Gestión de Eventos
            { 
                path: 'eventos', 
                component: EventosAdminComponent,
                title: 'Admin - Gestión de Eventos'
            },
            // 💡 GESTIÓN DE MENSAJES DE CONTACTO
            { 
                path: 'mensajes', 
                component: MensajesAdminComponent,
                title: 'Admin - Mensajes de Contacto'
            },
            
            // Ruta de redirección para admin (opcional)
            { path: '**', redirectTo: '' }
        ]
    },
    
    // --- RUTA CATCH-ALL ---
    // Cualquier otra ruta no encontrada redirige a home
    { path: '**', redirectTo: 'home' }
];