import { TestBed } from '@angular/core/testing';
import { CartService } from './cart';
import { first } from 'rxjs/operators'; // Usaremos 'first' para obtener el valor de una vez

describe('CartService', () => {
  let service: CartService;

  // Se ejecuta antes de cada prueba (it)
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CartService] 
    });
    service = TestBed.inject(CartService);
  });

  // Prueba 1: Verificar que el servicio se inicializa correctamente
  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // Prueba 2: Verificar la inicialización del estado del carrito
  it('should initialize with an empty cart state', (done) => {
    service.cart$.pipe(first()).subscribe(state => {
      expect(state.count).toBe(0);
      expect(state.total).toBe(0);
      expect(state.items.length).toBe(0);
      done(); // Indica que la prueba asíncrona ha terminado
    });
  });

  // Prueba 3: Verificar la función addToCart para un nuevo ítem
  it('should add a new item to the cart', (done) => {
    service.addToCart({ name: 'Ticket: Electric Odyssey', price: 65 });

    service.cart$.pipe(first()).subscribe(state => {
      expect(state.count).toBe(1);
      expect(state.total).toBe(65);
      expect(state.items.length).toBe(1);
      expect(state.items[0].name).toBe('Ticket: Electric Odyssey');
      done();
    });
  });

  // Prueba 4: Verificar que incrementa la cantidad si el ítem ya existe
  it('should increase item quantity if item already exists', (done) => {
    service.addToCart({ name: 'Ticket: Latin Fusion Night', price: 45 });
    service.addToCart({ name: 'Ticket: Latin Fusion Night', price: 45 }); 

    // Omitimos la primera emisión (estado vacío) y solo verificamos el valor final
    service.cart$.subscribe(state => {
      if (state.count === 2) {
          expect(state.total).toBe(90); // 45 * 2
          expect(state.items.length).toBe(1);
          expect(state.items[0].quantity).toBe(2);
          done();
      }
    });
  });

  // Prueba 5: Verificar la función removeFromCart (CORREGIDA)
  it('should remove an item from the cart', (done) => {
    service.addToCart({ name: 'Membresía Gold', price: 299 });
    service.addToCart({ name: 'Ticket: Electric Odyssey', price: 65 });

    // Ejecutar la acción
    service.removeFromCart('Membresía Gold');

    // Suscribirse y esperar la emisión final (el estado después de la remoción)
    // Usamos 'first' y esperamos el estado con el total corregido (65)
    service.cart$.subscribe(state => {
      if (state.items.length === 1 && state.total === 65) {
          expect(state.count).toBe(1);
          expect(state.items.length).toBe(1);
          expect(state.items[0].name).toBe('Ticket: Electric Odyssey');
          done();
      }
    });
  });

  // Prueba 6: Verificar la función checkout
  it('should empty the cart and return true on successful checkout', (done) => {
    service.addToCart({ name: 'Membresía Platinum', price: 599 });
    
    const result = service.checkout();
    
    // 1. Verificación síncrona: checkout debe devolver true
    expect(result).toBeTrue();

    // 2. Verificación asíncrona: el estado final debe ser vacío
    service.cart$.subscribe(state => {
      if (state.count === 0 && state.items.length === 0) {
        expect(state.total).toBe(0);
        done();
      }
    });
  });

  // Prueba 7: Verificar que checkout devuelve false si el carrito está vacío
  it('should return false if checkout is called on an empty cart', () => {
    // La prueba ya se inicia con un carrito vacío
    const result = service.checkout();
    expect(result).toBeFalse();
  });
});