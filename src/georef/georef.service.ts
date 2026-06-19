import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class GeorefService {
  constructor(private readonly http: HttpService) {}

  private readonly baseUrl = 'https://apis.datos.gob.ar/georef/api';

  async getProvincias() {
    try {
      const { data } = await firstValueFrom(
        this.http.get(`${this.baseUrl}/provincias`, {
          params: {
            campos: 'id,nombre',
            max: 24,
          },
          timeout: 10000,
        }),
      );

      return {
        provincias: data.provincias || [],
      };
    } catch (error: any) {
      console.error('Error al obtener provincias:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        data: error.response?.data,
      });

      throw new InternalServerErrorException(
        'No se pudieron obtener las provincias.',
      );
    }
  }

  async getMunicipios(provincia: string) {
    if (!provincia) {
      throw new BadRequestException('La provincia es obligatoria.');
    }

    try {
      const { data } = await firstValueFrom(
        this.http.get(`${this.baseUrl}/municipios`, {
          params: {
            provincia,
            campos: 'id,nombre',
            max: 500,
          },
          timeout: 10000,
        }),
      );

      return {
        municipios: data.municipios || [],
      };
    } catch (error: any) {
      console.error('Error al obtener municipios:', {
        provincia,
        message: error.message,
        code: error.code,
        status: error.response?.status,
        data: error.response?.data,
      });

      throw new InternalServerErrorException(
        'No se pudieron obtener los municipios.',
      );
    }
  }

  async getLocalidades(provincia: string) {
    if (!provincia) {
      throw new BadRequestException('La provincia es obligatoria.');
    }

    try {
      const { data } = await firstValueFrom(
        this.http.get(`${this.baseUrl}/localidades`, {
          params: {
            provincia,
            campos: 'id,nombre',
            max: 5000,
          },
          timeout: 10000,
        }),
      );

      return {
        localidades: data.localidades || [],
      };
    } catch (error: any) {
      console.error('Error al obtener localidades:', {
        provincia,
        message: error.message,
        code: error.code,
        status: error.response?.status,
        data: error.response?.data,
      });

      throw new InternalServerErrorException(
        'No se pudieron obtener las localidades.',
      );
    }
  }
}