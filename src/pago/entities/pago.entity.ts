import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Reserva } from '../../reserva/entities/reserva.entity';

@Entity('pago')
export class Pago {
  @PrimaryGeneratedColumn({ name: 'id_pago' })
  id_pago!: number;

  @Column({ name: 'monto', type: 'decimal', precision: 10, scale: 2 })
  monto!: number;

  @Column({ 
    name: 'metodo', 
    type: 'enum',
    enum: ['efectivo', 'tarjeta', 'transferencia']
  })
  metodo!: string;

  @Column({ 
    name: 'estado', 
    type: 'enum',
    enum: ['pendiente', 'completado', 'rechazado'],
    default: 'pendiente'
  })
  estado!: string;

  @Column({ name: 'referencia_externa', type: 'varchar', length: 100, nullable: true })
  referencia_externa!: string;

  @Column({ name: 'fecha_pago', type: 'datetime', nullable: true })
  fecha_pago!: Date;

  @ManyToOne(() => Reserva, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_reserva' })
  reserva!: Reserva;
}
