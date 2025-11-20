import { ApplicationConfig } from '@angular/core';
import { 
    provideRouter, 
    withInMemoryScrolling // <-- Importar la función correcta
} from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      // Usar withInMemoryScrolling para habilitar el scroll a fragmentos
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled', // Mantener la posición de scroll al volver
        anchorScrolling: 'enabled',          // Habilitar el scroll a elementos con IDs (#home, #events)
      })
      // Si usaste withViewTransitions(), puedes añadirlo aquí también:
      // withViewTransitions()
    ),
    
    // Proveedor necesario para la comunicación con la API (Login, Contacto)
    provideHttpClient(), 
  ]
};