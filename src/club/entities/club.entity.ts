import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { DuenoCancha } from '../../dueno_cancha/entities/dueno_cancha.entity';
import { Admin } from '../../admin/entities/admin.entity';
import { Cancha } from '../../cancha/entities/cancha.entity';

@Entity('club')
export class Club {
  @PrimaryGeneratedColumn({ name: 'id_club' })
  id_club!: number;

  @Column({ name: 'nombre_club', type: 'varchar', length: 150 })
  nombre_club!: string;

  @Column({ name: 'deportes_club', type: 'simple-json', nullable: true })
deportes_club!: string[];

  @Column({ name: 'direccion_club', type: 'varchar', length: 255 })
  direccion_club!: string;

  @Column({ name: 'ciudad_club', type: 'varchar', length: 100 })
  ciudad_club!: string;

  @Column({ name: 'telefono_club', type: 'varchar', length: 20, nullable: true })
  telefono_club!: string;

  @Column({ name: 'descripcion_club', type: 'text', nullable: true })
  descripcion_club!: string;

  @Column({ 
    name: 'estado', 
    type: 'enum',
    enum: ['activo', 'inactivo', 'pendiente_aprobacion'],
    default: 'pendiente_aprobacion'
  })
  estado!: string;

  @ManyToOne(() => DuenoCancha, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_dueno' })
  dueno!: DuenoCancha;

  @ManyToOne(() => Admin, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_admin_aprobado' })
  admin_aprobado!: Admin;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  created_at!: Date;

  @OneToMany(() => Cancha, (cancha) => cancha.club)
  canchas!: Cancha[];
  
}
