import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Admin } from '../../admin/entities/admin.entity';
import { Club } from '../../club/entities/club.entity';

@Entity('dueno_cancha')
export class DuenoCancha {
  @PrimaryGeneratedColumn({ name: 'id_dueno' })
  id_dueno!: number;

  @Column({ name: 'nombre_dueno', type: 'varchar', length: 100 })
  nombre_dueno!: string;

  @Column({ name: 'apellido_dueno', type: 'varchar', length: 100 })
  apellido_dueno!: string;

  @Column({ name: 'email_dueno', type: 'varchar', length: 150, unique: true })
  email_dueno!: string;

  @Column({ name: 'password_dueno', type: 'varchar', length: 255 })
  password_dueno!: string;

  @Column({ name: 'telefono_dueno', type: 'varchar', length: 20, nullable: true })
  telefono_dueno!: string;

  @Column({ 
    name: 'estado_dueno', 
    type: 'enum',
    enum: ['activo', 'inactivo', 'pendiente_aprobacion'],
    default: 'pendiente_aprobacion'
  })
  estado_dueno!: string;

  @ManyToOne(() => Admin, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_admin_aprobado' })
  admin_aprobado!: Admin;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  created_at!: Date;

  @OneToMany(() => Club, (club) => club.dueno)
  clubs!: Club[];

  
}
