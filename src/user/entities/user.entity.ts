import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, ManyToMany, JoinColumn, JoinTable } from 'typeorm';
//import { Admin } from '../../admin/entities/admin.entity'; 1
import { Club } from '../../club/entities/club.entity';
import { Cancha } from '../../cancha/entities/cancha.entity';
import { Reserva } from '../../reserva/entities/reserva.entity';
@Entity('user')
export class User {
    @PrimaryGeneratedColumn({ name: 'id_usuario' })
    id_usuario!: number;
    @Column({ name: 'nombre_usuario', type: 'varchar', length: 100 })
    nombre_usuario!: string;
    @Column({ name: 'apellido_usuario', type: 'varchar', length: 100 })
    apellido_usuario!: string;
    @Column({ name: 'email_usuario', type: 'varchar', length: 150, unique: true })
    email_usuario!: string;
    @Column({ name: 'dni_usuario', type: 'varchar', length: 20, unique: true, nullable: true })
    dni_usuario!: string | null;
    @Column({ name: 'CUIT_usuario', type: 'varchar', length: 20, nullable: true })
    CUIT_usuario!: string;
    @Column({ name: 'password_usuario', type: 'varchar', length: 255 })
    password_usuario!: string;
    @Column({ name: 'telefono_usuario', type: 'varchar', length: 20, nullable: true })
    telefono_usuario!: string;
    @Column({ name: 'direccion_usuario', type: 'varchar', length: 255, nullable: true })
    direccion_usuario!: string;
    @Column({ name: 'ciudad_usuario', type: 'varchar', length: 100, nullable: true })
    ciudad_usuario!: string;
    @Column({ name: 'provincia_usuario', type: 'varchar', length: 100, nullable: true })
    provincia_usuario!: string;
    @Column({ name: 'cp_usuario', type: 'varchar', length: 20, nullable: true })
    cp_usuario!: string;
    @Column({ 
        name: 'estado_usuario', 
        type: 'enum',
        enum: ['activo', 'inactivo', 'pendiente_aprobacion'],
        default: 'pendiente_aprobacion'
    })
    estado_usuario!: string;

    @Column({ 
        name: 'tipo_usuario', 
        type: 'enum',
        enum: ['usuario', 'dueno', 'admin'],
        default: 'usuario'
    })
    tipo_usuario!: string;
    
    // @ManyToOne(() => Admin, { nullable: true, onDelete: 'SET NULL' }) 1 
    // @JoinColumn({ name: 'id_admin_aprobado' }) 1 
    // admin_aprobado!: Admin; 1
    @CreateDateColumn({ name: 'created_at', type: 'datetime' })
    created_at!: Date;

  @ManyToMany(() => Cancha, (cancha) => cancha.Interes)
  @JoinTable({
    name: 'cancha_usuario',
    joinColumn: { name: 'id_usuario', referencedColumnName: 'id_usuario' },
    inverseJoinColumn: { name: 'id_cancha', referencedColumnName: 'id_cancha' },
  })
  canchas!: Cancha[];

  @OneToMany(() => Reserva, (reserva) => reserva.usuario)
  reservas!: Reserva[];

    @OneToMany(() => Club, (club) => club.dueno)
    clubs!: Club[];

}

