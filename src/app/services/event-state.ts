// src/app/services/event-state.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http'; 
import { environment } from '../../environments/enviroments';

// Definición de la estructura de datos del Evento (completa)
export interface Evento {
    id_evento: number;
    titulo: string;
    descripcion: string;
    fecha_evento: string; 
    precio_entrada: number;
    capacidad_maxima: number;
    rutaImagen: string; 
    es_vip_exclusivo: number; 
    icono_imagen: string | null;
    activo: boolean; // Propiedad para Soft Delete
}

@Injectable({ providedIn: 'root' })
export class EventStateService {
    
    private EVENT_STORAGE_KEY = 'prism_events_data';

    // Lista inicial de eventos (se usa solo si localStorage está vacío o para inicializar)
    private initialEvents: Evento[] = [
        // FIX: RUTA ESTANDARIZADA /Assets/Img/
        {
            id_evento: 1,
            titulo: 'Electric Odyssey',
            descripcion: 'La fiesta de electrónica más grande del año con DJs internacionales.',
            fecha_evento: '2025-12-31T21:00',
            precio_entrada: 65,
            capacidad_maxima: 500,
            rutaImagen: 'Assets/Img/1761341848516-evento1.jpg', 
            es_vip_exclusivo: 0,
            icono_imagen: null,
            activo: true,
        },
        {
            id_evento: 2,
            titulo: 'Diamond Exclusive',
            descripcion: 'Noche de gala VIP para año nuevo, solo con pre-venta y código de vestimenta estricto.',
            fecha_evento: '2025-01-01T22:00',
            precio_entrada: 120,
            capacidad_maxima: 200,
            rutaImagen: 'Assets/Img/1761330856016-evento2.jpg', 
            es_vip_exclusivo: 1,
            icono_imagen: null,
            activo: true,
        },
    ];

    private eventosSubject: BehaviorSubject<Evento[]>;
    public eventos$: Observable<Evento[]>;

    constructor(private http: HttpClient) {
        this.eventosSubject = new BehaviorSubject<Evento[]>([]);
        this.eventos$ = this.eventosSubject.asObservable();

        this.loadEventsFromApi();
    }
    loadEventsFromApi(): void {
       this.http.get<Evento[]>(`${environment.serverURL}/api/eventosLista`).subscribe({
            next: (data) => {
            const activos = data.filter(e => e.activo);
            // Procesamiento de datos para asegurar el path correcto
            const processedData = activos.map(event => ({
                ...event,
                // Garantiza que la ruta siempre inicie con el path correcto si no lo trae la API
                rutaImagen: event.rutaImagen.startsWith('http') || event.rutaImagen.startsWith('/') ? event.rutaImagen : `/Assets/Img/${event.rutaImagen}`
            }));
            this.eventosSubject.next(processedData);
            this.saveEventsToLocalStorage(processedData);
            },
            error: (err) => {
            console.error('Error al cargar eventos:', err);
            const stored = localStorage.getItem(this.EVENT_STORAGE_KEY);
            if (stored) {
                this.eventosSubject.next(JSON.parse(stored));
            } else {
                // Usar lista inicial de respaldo si no hay conexión ni local storage
                this.eventosSubject.next(this.initialEvents); 
            }
            }
        });
    }
    private saveEventsToLocalStorage(events: Evento[]): void {
        localStorage.setItem(this.EVENT_STORAGE_KEY, JSON.stringify(events));
    }
// ... (resto del código sin cambios)

    private getCurrentEvents(): Evento[] {
        return this.eventosSubject.value;
    }

    // Método para agregar un evento (usado por el Administrador después de la llamada a la API)
    addEvent(newEvent: Omit<Evento, 'id_evento'>): void {
        const currentEvents = this.getCurrentEvents();
        // Genera un nuevo ID incremental
        const maxId = currentEvents.length > 0 ? Math.max(...currentEvents.map(e => e.id_evento)) : 3;
        const newId = maxId + 1;
        
        const eventToAdd: Evento = {
            ...newEvent as Evento,
            id_evento: newId,
            icono_imagen: null,
            activo: true // Nuevo evento es activo por defecto
        };
        
        const updatedEvents = [...currentEvents, eventToAdd];
        this.eventosSubject.next(updatedEvents);
        this.saveEventsToLocalStorage(updatedEvents); // Guarda el cambio
    }

    // Método para actualizar un evento (usado por el Administrador después de la llamada a la API)
    updateEvent(updatedEvent: Evento): void {
        const currentEvents = this.getCurrentEvents();
        const index = currentEvents.findIndex(e => e.id_evento === updatedEvent.id_evento);

        if (index !== -1) {
            const updatedEvents = [...currentEvents];
            updatedEvents[index] = updatedEvent;
            this.eventosSubject.next(updatedEvents);
            this.saveEventsToLocalStorage(updatedEvents); // Guarda el cambio
        }
    }
    
    // Cambia el estado de visibilidad del evento (Soft Delete)
    toggleEventActivation(eventId: number, newState: boolean): void {
        const currentEvents = this.getCurrentEvents();
        const index = currentEvents.findIndex(e => e.id_evento === eventId);
        
        if (index !== -1) {
            const updatedEvents = [...currentEvents];
            updatedEvents[index] = {
                ...updatedEvents[index],
                activo: newState
            };
            this.eventosSubject.next(updatedEvents);
            this.saveEventsToLocalStorage(updatedEvents); // Guarda el cambio
        }
    }
    
    // Eliminación permanente del registro (Hard Delete)
    deleteEventPermanently(eventId: number): void {
        const currentEvents = this.getCurrentEvents();
        const updatedEvents = currentEvents.filter(e => e.id_evento !== eventId);
        
        this.eventosSubject.next(updatedEvents);
        this.saveEventsToLocalStorage(updatedEvents); // Guarda el cambio
    }
}