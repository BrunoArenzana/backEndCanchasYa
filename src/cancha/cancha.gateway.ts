import { WebSocketGateway, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { CanchaService } from './cancha.service';
import { CreateCanchaDto } from './dto/create-cancha.dto';
import { UpdateCanchaDto } from './dto/update-cancha.dto';

@WebSocketGateway()
export class CanchaGateway {
  constructor(private readonly canchaService: CanchaService) {}

  @SubscribeMessage('createCancha')
  create(@MessageBody() createCanchaDto: CreateCanchaDto) {
    return this.canchaService.create(createCanchaDto);
  }

  @SubscribeMessage('findAllCancha')
  findAll() {
    return this.canchaService.findAll();
  }

  @SubscribeMessage('findOneCancha')
  findOne(@MessageBody() id: number) {
    return this.canchaService.findOne(id);
  }

  @SubscribeMessage('updateCancha')
  update(@MessageBody() updateCanchaDto: UpdateCanchaDto) {
    return this.canchaService.update(updateCanchaDto.id, updateCanchaDto);
  }

  @SubscribeMessage('removeCancha')
  remove(@MessageBody() id: number) {
    return this.canchaService.remove(id);
  }
}
