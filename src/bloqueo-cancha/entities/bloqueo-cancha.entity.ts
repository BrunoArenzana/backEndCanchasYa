import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Cancha } from '../../cancha/entities/cancha.entity';

export enum TipoBloqueoCancha {
  TORNEO = 'torneo',
  MANTENIMIENTO = 'mantenimiento',
  EVENTO = 'evento',
  CIERRE = 'cierre',
  OTRO = 'otro',
}

@Entity('bloqueo_cancha')
export class BloqueoCancha {
  @PrimaryGeneratedColumn({ name: 'id_bloqueo' })
  id_bloqueo!: number;

  @ManyToOne(() => Cancha, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'id_cancha' })
  cancha!: Cancha;

  @Column({ name: 'fecha', type: 'date' })
  fecha!: string;

  @Column({ name: 'hora_inicio', type: 'time' })
  hora_inicio!: string;

  @Column({ name: 'hora_fin', type: 'time' })
  hora_fin!: string;

  @Column({
    name: 'tipo',
    type: 'enum',
    enum: TipoBloqueoCancha,
    default: TipoBloqueoCancha.OTRO,
  })
  tipo!: TipoBloqueoCancha;

  @Column({
    name: 'motivo',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  motivo!: string | null;

  @Column({
    name: 'activo',
    type: 'tinyint',
    default: 1,
  })
  activo!: number;

  @CreateDateColumn({
    name: 'created_at',
    type: 'datetime',
  })
  created_at!: Date;
}
