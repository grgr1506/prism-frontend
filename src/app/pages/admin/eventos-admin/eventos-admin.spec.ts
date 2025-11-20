import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventosAdminComponent } from './eventos-admin';

describe('EventosAdmin', () => {
  let component:EventosAdminComponent;
  let fixture: ComponentFixture<EventosAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventosAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventosAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
