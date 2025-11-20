import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MensajesAdminComponent } from './mensaje-admin'; 
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

// Definición de la interfaz Mensaje (para mocking)
interface Mensaje {
    id_mensaje: number;
    nombre: string;
    apellido: string;
    correo_electronico: string;
    numero_telefono: string | null;
    tipo_consulta: string;
    mensaje: string;
    enviado_en: string;
    leido: boolean;
}

// Datos de prueba
const MOCK_MESSAGES: Mensaje[] = [
  { id_mensaje: 1, nombre: 'Juan', apellido: 'Perez', correo_electronico: 'juan@test.com', numero_telefono: '123456', tipo_consulta: 'general', mensaje: 'Consulta 1 de prueba', enviado_en: '2025-10-24T10:00:00.000Z', leido: false },
  { id_mensaje: 2, nombre: 'Ana', apellido: 'Gomez', correo_electronico: 'ana@test.com', numero_telefono: null, tipo_consulta: 'vip', mensaje: 'Consulta 2 de prueba (VIP)', enviado_en: '2025-10-23T11:00:00.000Z', leido: true },
];

describe('MensajesAdminComponent', () => {
  let component: MensajesAdminComponent;
  let fixture: ComponentFixture<MensajesAdminComponent>;
  let httpTestingController: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // Importamos el componente Standalone y el módulo de pruebas HTTP
      imports: [MensajesAdminComponent, HttpClientTestingModule],
    })
    .compileComponents();

    fixture = TestBed.createComponent(MensajesAdminComponent);
    component = fixture.componentInstance;
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Verificamos que no haya solicitudes HTTP pendientes
    httpTestingController.verify();
  });

  it('should create', () => {
    // Activar ngOnInit y simular la respuesta de carga
    fixture.detectChanges(); 
    httpTestingController.expectOne(component.apiUrl).flush(MOCK_MESSAGES);

    expect(component).toBeTruthy();
  });

  it('should load messages on initialization', () => {
    fixture.detectChanges();

    const req = httpTestingController.expectOne(component.apiUrl);
    expect(req.request.method).toEqual('GET');
    req.flush(MOCK_MESSAGES);

    expect(component.mensajes.length).toBe(2);
    expect(component.mensajes[0].nombre).toBe('Juan');
  });

  it('should select an unread message and mark it as read', () => {
    fixture.detectChanges();
    httpTestingController.expectOne(component.apiUrl).flush(MOCK_MESSAGES);
    
    const unreadMessage = component.mensajes.find(m => m.id_mensaje === 1)!;
    
    // Simular selección
    component.selectMensaje(unreadMessage);

    // 1. Verificar la solicitud PATCH para marcar como leído (true)
    const patchReq = httpTestingController.expectOne(`${component.apiUrl}/1`);
    expect(patchReq.request.method).toEqual('PATCH');
    expect(patchReq.request.body.leido).toBe(true);
    patchReq.flush({}); 

    // 2. Verificar el estado local
    expect(component.selectedMensaje).toEqual(unreadMessage);
    expect(unreadMessage.leido).toBe(true);
  });
  
  it('should select an already read message and NOT send a PATCH request', () => {
    fixture.detectChanges();
    httpTestingController.expectOne(component.apiUrl).flush(MOCK_MESSAGES);
    
    const readMessage = component.mensajes.find(m => m.id_mensaje === 2)!;
    
    // Simular selección
    component.selectMensaje(readMessage);

    // 1. Verificar que NO se hizo ninguna solicitud PATCH
    httpTestingController.expectNone(`${component.apiUrl}/2`);
    
    // 2. Verificar el estado local
    expect(component.selectedMensaje).toEqual(readMessage);
    expect(readMessage.leido).toBe(true); 
  });

  it('should toggle a message state to UNREAD via toggleLeido', () => {
    fixture.detectChanges();
    httpTestingController.expectOne(component.apiUrl).flush(MOCK_MESSAGES);
    
    const readMessage = component.mensajes.find(m => m.id_mensaje === 2)!;
    
    // Llamar la función para marcar como NO leído (false)
    component.toggleLeido(readMessage, false);

    const patchReq = httpTestingController.expectOne(`${component.apiUrl}/2`);
    expect(patchReq.request.method).toEqual('PATCH');
    expect(patchReq.request.body.leido).toBe(false);
    patchReq.flush({}); 

    // Verificación de estado local
    expect(readMessage.leido).toBe(false);
  });
});