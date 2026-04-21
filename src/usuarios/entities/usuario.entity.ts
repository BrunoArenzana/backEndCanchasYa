import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("usuarios")
export class Usuario {
    @PrimaryGeneratedColumn()
    id!: number;
    @Column()
    nombre!: string;
    @Column()
    apellido!: string;
    @Column({unique:true})
    dni!: string;
    @Column({nullable:true})
    telefono!: string;
    @Column({unique:true})
    email!: string;
    @Column()
    ciudad!: string;
    @Column()
    provincia!: string;
    @Column()
    cp!:number;
    @Column({select:false})
    password!: string;

}