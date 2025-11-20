import { Component, OnInit } from '@angular/core'; // Añadir OnInit
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms'; 
import { DataService } from '../../services/data'; 
import Swal from 'sweetalert2';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule], 
  templateUrl: './contact.html',
  styleUrls: ['./contact.css']
})
export class ContactComponent implements OnInit { // Implementar OnInit
    
    // 1. Declarar la propiedad sin inicializarla aquí
    contactForm!: FormGroup; 
    
    // Inyección de dependencias
    constructor(private fb: FormBuilder, private dataService: DataService) {} 
    
    // 2. Inicializar el formulario dentro del ngOnInit para asegurar que el constructor haya terminado
    ngOnInit(): void {
        this.contactForm = this.fb.group({
            nombre: ['', Validators.required],
            apellido: ['', Validators.required],
            correo_electronico: ['', [Validators.required, Validators.email]],
            numero_telefono: [''],
            tipo_consulta: ['', Validators.required],
            mensaje: ['', Validators.required]
        });
    }

    handleSubmit() {
        if (this.contactForm.invalid) {
            Swal.fire({
                title: 'Datos Incompletos',
                text: 'Por favor, complete todos los campos requeridos con información válida..',
                icon: 'question'
            });
            this.contactForm.markAllAsTouched(); 
            return;
        }

        // ... lógica de envío a la API ...
        console.log('Enviando mensaje a la API:', this.contactForm.value);
        
        this.dataService.sendContactMessage(this.contactForm.value).subscribe({
            next: (response) => {
                Swal.fire({
                    title: 'Gracias por contactarnos',
                    text: '¡Mensaje enviado correctamente! Te contactaremos pronto.',
                    icon: 'success'
                });
                this.contactForm.reset({ tipo_consulta: '' }); 
            },
            error: (err) => {
                Swal.fire({
                    title: 'Error',
                    text: '¡Error de conexión al servidor. Inténtelo más tarde.',
                    icon: 'error'
                });
                console.error('Error al enviar el mensaje:', err);
            }
        });
    }
}