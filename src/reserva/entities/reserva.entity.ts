import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Usuario } from '../../usuario/entities/usuario.entity';
import { Cancha } from '../../cancha/entities/cancha.entity';
import { Pago } from '../../pago/entities/pago.entity';

@Entity('reserva')
export class Reserva {
  @PrimaryGeneratedColumn({ name: 'id_reserva' })
  id_reserva!: number;

  @Column({ name: 'fecha', type: 'date' })
  fecha!: Date;

  @Column({ name: 'hora_inicio', type: 'time' })
  hora_inicio!: string;

  @Column({ name: 'hora_fin', type: 'time' })
  hora_fin!: string;

  @Column({ name: 'monto_total', type: 'decimal', precision: 10, scale: 2 })
  monto_total!: number;

  @Column({ 
    name: 'estado', 
    type: 'enum',
    enum: ['pendiente', 'confirmada', 'cancelada', 'completada'],
    default: 'pendiente'
  })
  estado!: string;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_usuario' })
  usuario!: Usuario;

  @ManyToOne(() => Cancha, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_cancha' })
  cancha!: Cancha;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  created_at!: Date;

  @OneToMany(() => Pago, (pago) => pago.reserva)
  pagos!: Pago[];
}
