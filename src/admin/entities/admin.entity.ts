// import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
// import { Club } from '../../club/entities/club.entity';
// import { User } from '../../user/entities/user.entity';

// @Entity('admin')
// export class Admin {
//   @PrimaryGeneratedColumn({ name: 'id_admin' })
//   id_admin!: number;

//   @Column({ name: 'nombre_admin', type: 'varchar', length: 100 })
//   nombre_admin!: string;

//   @Column({ name: 'email_admin', type: 'varchar', length: 150, unique: true })
//   email_admin!: string;

//   @Column({ name: 'password_hash', type: 'varchar', length: 255 })
//   password_hash!: string;

//   @CreateDateColumn({ name: 'created_at', type: 'datetime' })
//   created_at!: Date;

//   @OneToMany(() => Club, (club) => club.admin_aprobado)
//   clubs_aprobados!: Club[];
  
//   @OneToMany(() => User, (user) => user.admin_aprobado)
//   usuarios_aprobados!: User[];
// }
