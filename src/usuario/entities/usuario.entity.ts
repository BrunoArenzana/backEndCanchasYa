import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Reserva } from '../../reserva/entities/reserva.entity';

@Entity('usuario')
export class Usuario {
  @PrimaryGeneratedColumn({ name: 'id_usuario' })
  id_usuario!: number;

  @Column({ name: 'nombre_usuario', type: 'varchar', length: 100 })
  nombre_usuario!: string;

  @Column({ name: 'apellido_usuario', type: 'varchar', length: 100 })
  apellido_usuario!: string;

  @Column({ name: 'email_usuario', type: 'varchar', length: 150, unique: true })
  email_usuario!: string;

  @Column({ name: 'password_usuario', type: 'varchar', length: 255 })
  password_usuario!: string;

  @Column({ name: 'telefono_usuario', type: 'varchar', length: 20, nullable: true })
  telefono_usuario!: string;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  created_at!: Date;

  @OneToMany(() => Reserva, (reserva) => reserva.usuario)
  reservas!: Reserva[];
}
