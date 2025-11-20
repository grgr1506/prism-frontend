// src/app/pages/admin/eventos-admin/eventos-admin.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { EventStateService, Evento } from '../../../services/event-state'; 
import { catchError, throwError } from 'rxjs'; 
import Swal from 'sweetalert2';
import { environment } from '../../../../environments/enviroments';

@Component({
  selector: 'app-eventos-admin',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule], 
  templateUrl: './eventos-admin.html',
  // ENLACE AL CSS LOCAL
  styleUrls: ['./eventos-admin.css'],
  // NECESARIO para que las clases de layout (Sidebar, Card, etc.) funcionen globalmente
})
export class EventosAdminComponent implements OnInit {
    eventos: Evento[] = []; 
    selectedEventId: number | null = null;
    
    isFormVisible: boolean = false; 
    isEditMode: boolean = false;
    eventForm!: FormGroup;
    
    selectedFile: File | null = null; 
    
 apiUrl = `${environment.serverURL}/api/admin/eventos`;

    constructor(private http: HttpClient, private fb: FormBuilder, private eventStateService: EventStateService) {} 

    ngOnInit(): void {
        this.eventStateService.eventos$.subscribe(eventos => {
            this.eventos = eventos;
            this.isFormVisible = false; 
        });
        
        this.initForm();
    }
    
    initForm() {
        this.eventForm = this.fb.group({
            id_evento: [null], 
            titulo: ['', Validators.required],
            descripcion: ['', Validators.required],
            fecha_evento: ['', Validators.required], 
            precio_entrada: [0, [Validators.required, Validators.min(0)]],
            capacidad_maxima: [1, [Validators.required, Validators.min(1)]],
            rutaImagen: [''], 
            es_vip_exclusivo: [false] 
        });
        this.selectedFile = null; 
    }

    onFileSelected(event: any) {
        if (event.target.files && event.target.files.length > 0) {
            this.selectedFile = event.target.files[0];
            this.eventForm.get('rutaImagen')?.setValue(this.selectedFile!.name); 
        } else {
            this.selectedFile = null;
            this.eventForm.get('rutaImagen')?.setValue(''); 
        }
    }

    selectEvent(eventId: number) {
        this.selectedEventId = (this.selectedEventId === eventId) ? null : eventId;
    }
    
    abrirModalInsertarEvento() {
        this.isEditMode = false;
        this.initForm(); 
        this.isFormVisible = true;
    }

    abrirModalEditarEvento() {
        if (!this.selectedEventId) {
            Swal.fire({
                icon: "warning",
                title: "Atención",
                text: "Por favor, seleccione un evento para editar.",
                timer: 2000,
                showConfirmButton: false
            });
            return;
        }
        
        const eventoToEdit = this.eventos.find(e => e.id_evento === this.selectedEventId);
        if (eventoToEdit) {
            this.isEditMode = true;
            this.isFormVisible = true;
            
            this.eventForm.patchValue({
                id_evento: eventoToEdit.id_evento,
                titulo: eventoToEdit.titulo,
                descripcion: eventoToEdit.descripcion,
                // Corta la fecha para que sea compatible con input datetime-local
                fecha_evento: eventoToEdit.fecha_evento.slice(0, 16), 
                precio_entrada: eventoToEdit.precio_entrada,
                capacidad_maxima: eventoToEdit.capacidad_maxima,
                rutaImagen: eventoToEdit.rutaImagen 
            });
            this.selectedFile = null;
        }
    }
    
    guardarEvento() {
        if (!this.isEditMode && !this.selectedFile) {
            Swal.fire({
                title: 'Seleccione una imagen',
                text: 'Debe seleccionar una imagen para crear un nuevo evento.',
                icon: 'question'
            });
            return;
        }
        if (this.eventForm.invalid) {
            this.eventForm.markAllAsTouched();
            Swal.fire({
                title: 'Complete datos',
                text: 'Por favor, complete todos los campos requeridos y válidos.',
                icon: 'question'
            });
            return;
        }

        const formValues = this.eventForm.value;
        const eventId = formValues.id_evento;

        const formData = new FormData();
        
        if (this.selectedFile) {
            formData.append('imagen', this.selectedFile, this.selectedFile.name);
        }
        
        formData.append('titulo', formValues.titulo);
        formData.append('descripcion', formValues.descripcion);
        formData.append('fecha_evento', formValues.fecha_evento);
        formData.append('precio_entrada', formValues.precio_entrada.toString());
        formData.append('capacidad_maxima', formValues.capacidad_maxima.toString());
        formData.append('es_vip_exclusivo', formValues.es_vip_exclusivo ? '1' : '0');
        
        if (this.isEditMode && eventId) {
            formData.append('id_evento', eventId.toString());
        }
        if (this.isEditMode && !this.selectedFile && formValues.rutaImagen) {
            formData.append('rutaImagenExistente', formValues.rutaImagen);
        }

        if (this.isEditMode) {
            this.http.put(`${this.apiUrl}/${eventId}`, formData) 
                .pipe(
                    catchError(err => {
                        Swal.fire({
                            title: 'Error',
                            text: 'Error al actualizar el evento en la API. Verifique el servidor.',
                            icon: 'error'
                        });
                        console.error('Error al actualizar el evento en la API:', err);
                        return throwError(() => err);
                    })
                )
                .subscribe((response: any) => {
                    Swal.fire({
                        title: 'Evento Actualizado',
                        text: `Evento actualizado en la DB. Archivo: ${this.selectedFile ? this.selectedFile.name : 'sin cambio'}`,
                        icon: 'success'
                    });
                    
                    const updatedEvent = { ...formValues, activo: response.activo || true, rutaImagen: response.rutaImagen || formValues.rutaImagen } as Evento;
                    this.eventStateService.updateEvent(updatedEvent);
                    this.selectedFile = null;
                    this.selectedEventId = null;
                });
            
        } else {
            this.http.post(this.apiUrl, formData)
                .pipe(
                    catchError(err => {
                        console.error('Error al guardar el evento en la API:', err);
                        Swal.fire({
                            title: 'Error',
                            text: 'Error al guardar el evento en la API. Verifique el servidor.',
                            icon: 'error'
                        });
                        return throwError(() => err);
                    })
                )
                .subscribe((response: any) => {
                    Swal.fire({
                        title: 'Evento Insertado',
                        text: `Evento insertado en la DB. Archivo: ${this.selectedFile!.name}`,
                        icon: 'success'
                    });
                    
                    // 💡 FIX APLICADO: Añadir un parámetro de consulta único (cache buster)
                    const tempImagePath = response.rutaImagen || `/Assets/Img/${this.selectedFile!.name}`;
                    const cacheBusterPath = `${tempImagePath}?t=${new Date().getTime()}`;

                    const newEvent = { 
                        ...formValues, 
                        id_evento: response.id_evento || response.insertId || Math.floor(Math.random() * 1000),
                        activo: true, 
                        // Usar la ruta con el cache buster
                        rutaImagen: cacheBusterPath 
                    } as Evento;
                    
                    this.eventStateService.addEvent(newEvent);
                    this.selectedFile = null;
                });
        }
    }
    
    // FUNCIÓN DE OCULTAR/REACTIVAR
    toggleActiveState() {
        if (!this.selectedEventId) {
            Swal.fire({
                icon: "warning",
                title: "Atención",
                text: "Debe seleccionar un evento antes de ocultarlo o reactivarlo.",
                timer: 2000,
                showConfirmButton: false
            });
            return;
        }
        const eventToToggle = this.eventos.find(e => e.id_evento === this.selectedEventId);
        if (eventToToggle) {
            const newState = !eventToToggle.activo;
            
           Swal.fire({
                title: `${newState ? '¿Reactivar evento?' : '¿Ocultar evento?'}`,
                text: `¿Está seguro de que desea ${newState ? 'REACTIVAR' : 'OCULTAR'} el evento: "${eventToToggle.titulo}"?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: `Sí, ${newState ? 'reactivar' : 'ocultar'}`,
                cancelButtonText: 'Cancelar',
                reverseButtons: true
            }).then((result) => {
                if (result.isConfirmed) {
                    this.http.patch(`${this.apiUrl}/${this.selectedEventId}`, { activo: newState ? true : false })
                        .pipe(
                            catchError((err: HttpErrorResponse) => {
                                console.error('Error al cambiar el estado del evento:', err);
                                Swal.fire({
                                    icon: 'error',
                                    title: 'Error',
                                    text: 'Error de API al cambiar el estado. Verifique que el servidor esté activo.',
                                    confirmButtonText: 'Aceptar'
                                });
                                return throwError(() => err);
                            })
                        )
                        .subscribe(() => {
                            Swal.fire({
                                icon: 'success',
                                title: `Evento ${newState ? 'reactivado' : 'ocultado'}`,
                                text: `El evento "${eventToToggle.titulo}" ha sido ${newState ? 'reactivado' : 'ocultado'} correctamente.`,
                                confirmButtonText: 'Aceptar'
                            });
                            this.eventStateService.toggleEventActivation(this.selectedEventId!, newState);
                            this.selectedEventId = null;
                        });
                }
            });
        }
    }
    
    // FUNCIÓN DE ELIMINAR PERMANENTEMENTE
    eliminarEventoPermanentemente() {
        if (!this.selectedEventId) {
            Swal.fire({
                icon: "warning",
                title: "Atención",
                text: "Por favor, seleccione un evento para eliminar permanentemente.",
                timer: 2000,
                showConfirmButton: false
            });
            return;
        }

        const eventToDelete = this.eventos.find(e => e.id_evento === this.selectedEventId);

        if (eventToDelete) {
            Swal.fire({
                title: '¿Eliminar permanentemente el evento?',
                text: `ADVERTENCIA: ¿Está seguro de que desea ELIMINAR PERMANENTEMENTE el evento: "${eventToDelete.titulo}"? Esta acción no se puede deshacer.`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar',
                reverseButtons: true
            }).then((result) => {
                if (result.isConfirmed) {
                    this.http.delete(`${this.apiUrl}/${this.selectedEventId}`)
                        .pipe(
                            catchError((err: HttpErrorResponse) => {
                                console.error('Error al eliminar el evento de la API:', err);

                                if (err.status === 409) {
                                    Swal.fire({
                                        icon: 'error',
                                        title: 'No se puede eliminar',
                                        text: 'El evento aún tiene ENTRADAS VENDIDAS asociadas. Use la opción "Ocultar Evento".',
                                        confirmButtonText: 'Aceptar'
                                    });
                                } else {
                                    Swal.fire({
                                        icon: 'error',
                                        title: 'Error de API',
                                        text: 'Ocurrió un error al eliminar el evento.',
                                        confirmButtonText: 'Aceptar'
                                    });
                                }

                                return throwError(() => err);
                            })
                        )
                        .subscribe(() => {
                            Swal.fire({
                                icon: 'success',
                                title: 'Evento eliminado',
                                text: `El evento "${eventToDelete.titulo}" ha sido eliminado permanentemente de la base de datos.`,
                                confirmButtonText: 'Aceptar'
                            });
                            this.eventStateService.deleteEventPermanently(this.selectedEventId!);
                            this.selectedEventId = null;
                        });
                }
            });
        }
    }
    
    isSelectedEventActive(): boolean {
        if (this.selectedEventId) {
            const event = this.eventos.find(e => e.id_evento === this.selectedEventId);
            return event ? event.activo : false;
        }
        return false;
    }
}