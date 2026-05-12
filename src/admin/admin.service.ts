import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from './entities/admin.entity';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';

@Injectable()
export class AdminService {
  
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
  ) {}

  create(createAdminDto: CreateAdminDto) {
    const admin = this.adminRepository.create(createAdminDto);
    return this.adminRepository.save(admin);
  }

  findAll() {
    return this.adminRepository.find();
  }

  findOne(id: number) {
    return this.adminRepository.findOneBy({ id_admin: id });
  }

  update(id: number, updateAdminDto: UpdateAdminDto) {
    return this.adminRepository.update(id, updateAdminDto);
  }

  remove(id: number) {
    return this.adminRepository.delete(id);
  }


// ... resto de imports igual

async login(email: string, password: string) {
  const admin = await this.adminRepository.findOne({
    where: { email_admin: email },
  });

  if (!admin || admin.password_hash !== password) {
    throw new UnauthorizedException('Usuario o contraseña incorrectos');
  }

  return {
    message: 'Login exitoso',
    user: {
      id_admin: admin.id_admin,
      nombre: admin.nombre_admin,
      email: admin.email_admin,
      tipo: 'admin',
    },
  };
}
}