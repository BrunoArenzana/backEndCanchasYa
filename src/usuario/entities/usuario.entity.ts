import { Cancha } from './../../cancha/entities/cancha.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, ManyToMany, JoinTable } from 'typeorm';
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

   @Column({ name: 'dni_usuario', type: 'varchar', length: 20, nullable: true })
  dni_usuario!: string;


  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  created_at!: Date;
    @Column({ name: 'ciudad_usuario', type: 'varchar', length: 100, nullable: true })
  ciudad_usuario!: string;

  @Column({ name: 'provincia_usuario', type: 'varchar', length: 100, nullable: true })
  provincia_usuario!: string;

  @Column({ name: 'cp_usuario', type: 'varchar', length: 20, nullable: true })
  cp_usuario!: string;

 

 @ManyToMany(() => Cancha, (cancha) => cancha.usuariosInteresados)
  @JoinTable({
    name: 'cancha_usuario',
    joinColumn: { name: 'id_usuario', referencedColumnName: 'id_usuario' }
  })
  canchas!: Cancha[];


  @ManyToMany(() => Reserva, (reserva) =>  reserva.usuario)
  @JoinTable({
    name: 'reserva_usuario',
    joinColumn: { name: 'id_usuario', referencedColumnName: 'id_usuario' }
  })
  reservas!: Reserva[];


}