import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class GeorefService {
  constructor(private readonly http: HttpService) {}

  private readonly baseUrl =
    'https://apis.datos.gob.ar/georef/api';

  async getProvincias() {
    const { data } = await firstValueFrom(
      this.http.get(`${this.baseUrl}/provincias`)
    );

    return { provincias: data.provincias || [] };
  }

  async getMunicipios(provincia: string) {
    const { data } = await firstValueFrom(
      this.http.get(`${this.baseUrl}/municipios`, {
        params: {
          provincia,
          max: 500,
        },
      })
    );

    return { municipios: data.municipios || [] };
  }

  async getLocalidades(provincia: string) {
    const { data } = await firstValueFrom(
      this.http.get(`${this.baseUrl}/localidades`, {
        params: {
          provincia,
          max: 1000,
        },
      })
    );

    return { localidades: data.localidades || [] };
  }
}