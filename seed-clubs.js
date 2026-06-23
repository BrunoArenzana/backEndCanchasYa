/**
 * Script de seed para generar datos de ejemplo
 * Uso: npm run seed
 * 
 * Genera:
 * - 5 dueños de club: Club1@gmail.com - Club5@gmail.com
 * - 5 clubes con canchas y deportes
 * - 3 usuarios comunes: User1@gmail.com - User3@gmail.com
 * - 2 administradores: Admin1@gmail.com, Admin2@gmail.com
 * - Contraseña para todos: "asd"
 */

require('dotenv').config();
const { Client } = require('pg');

// Datos de ejemplo para los clubes y sus dueños (con todos los datos de registro)
const clubesData = [
  {
    nombreOwner: 'Juan',
    apellidoOwner: 'Pérez',
    email: 'Club1@gmail.com',
    password: 'asd',
    telefono: '1134567890',
    dni: '30123451',
    cuit: '20-30123451-9',
    direccion: 'Av. Corrientes 1234',
    ciudad: 'Balvanera',
    provincia: 'Ciudad Autónoma de Buenos Aires',
    cp: '1043',
    nombre: 'Club Deportivo 1',
    deportes: ['Fútbol 5', 'Básquet', 'Tenis'],
    canchas: [
      { nombre: 'Cancha 1 - Fútbol 5', deporte: 'Fútbol 5', precio: 20000 },
      { nombre: 'Cancha 2 - Fútbol 5', deporte: 'Fútbol 5', precio: 20000 },
      { nombre: 'Cancha de Básquet', deporte: 'Básquet', precio: 15000 },
      { nombre: 'Cancha de Tenis', deporte: 'Tenis', precio: 12000 },
    ]
  },
  {
    nombreOwner: 'María',
    apellidoOwner: 'Gómez',
    email: 'Club2@gmail.com',
    password: 'asd',
    telefono: '2234567890',
    dni: '30123452',
    cuit: '27-30123452-9',
    direccion: 'Calle 12 Nro 456',
    ciudad: 'La Plata',
    provincia: 'Buenos Aires',
    cp: '1900',
    nombre: 'Club Deportivo 2',
    deportes: ['Fútbol 7', 'Vóley', 'Pádel'],
    canchas: [
      { nombre: 'Cancha de Fútbol 7', deporte: 'Fútbol 7', precio: 20000 },
      { nombre: 'Cancha de Vóley', deporte: 'Vóley', precio: 15000 },
      { nombre: 'Cancha de Pádel 1', deporte: 'Pádel', precio: 12000 },
      { nombre: 'Cancha de Pádel 2', deporte: 'Pádel', precio: 12000 },
    ]
  },
  {
    nombreOwner: 'Carlos',
    apellidoOwner: 'Rodríguez',
    email: 'Club3@gmail.com',
    password: 'asd',
    telefono: '3414567890',
    dni: '30123453',
    cuit: '20-30123453-9',
    direccion: 'Bv. Oroño 789',
    ciudad: 'Rosario',
    provincia: 'Santa Fe',
    cp: '2000',
    nombre: 'Club Deportivo 3',
    deportes: ['Natación', 'Tenis', 'Fútbol 11'],
    canchas: [
      { nombre: 'Piscina Olímpica', deporte: 'Natación', precio: 5000 },
      { nombre: 'Cancha de Tenis 1', deporte: 'Tenis', precio: 12000 },
      { nombre: 'Cancha de Tenis 2', deporte: 'Tenis', precio: 12000 },
      { nombre: 'Cancha de Fútbol 11', deporte: 'Fútbol 11', precio: 20000 },
    ]
  },
  {
    nombreOwner: 'Ana',
    apellidoOwner: 'Martínez',
    email: 'Club4@gmail.com',
    password: 'asd',
    telefono: '3514567890',
    dni: '30123454',
    cuit: '27-30123454-9',
    direccion: 'Av. Colón 456',
    ciudad: 'Córdoba',
    provincia: 'Córdoba',
    cp: '5000',
    nombre: 'Club Deportivo 4',
    deportes: ['Golf', 'Pádel', 'Básquet'],
    canchas: [
      { nombre: 'Campo de Golf 18 hoyos', deporte: 'Golf', precio: 12000 },
      { nombre: 'Cancha de Pádel A', deporte: 'Pádel', precio: 12000 },
      { nombre: 'Cancha de Básquet', deporte: 'Básquet', precio: 15000 },
    ]
  },
  {
    nombreOwner: 'Diego',
    apellidoOwner: 'Fernández',
    email: 'Club5@gmail.com',
    password: 'asd',
    telefono: '2614567890',
    dni: '30123455',
    cuit: '20-30123455-9',
    direccion: 'Av. San Martín 1011',
    ciudad: 'Mendoza',
    provincia: 'Mendoza',
    cp: '5500',
    nombre: 'Club Deportivo 5',
    deportes: ['Fútbol 5', 'Vóley', 'Natación'],
    canchas: [
      { nombre: 'Cancha de Fútbol 5 Premium', deporte: 'Fútbol 5', precio: 20000 },
      { nombre: 'Cancha de Vóley de Arena', deporte: 'Vóley', precio: 15000 },
      { nombre: 'Cancha de Vóley Techada', deporte: 'Vóley', precio: 15000 },
      { nombre: 'Piscina Semi-Olímpica', deporte: 'Natación', precio: 5000 },
    ]
  }
];

// Usuarios comunes enriquecidos
const usuariosComunes = [
  { email: 'User1@gmail.com', nombre: 'Usuario', apellido: 'Uno', dni: '40123451', cuit: '20-40123451-9', telefono: '1198765432', direccion: 'Pueyrredón 456', ciudad: 'Balvanera', provincia: 'Ciudad Autónoma de Buenos Aires', cp: '1032' },
  { email: 'User2@gmail.com', nombre: 'Usuario', apellido: 'Dos', dni: '40123452', cuit: '20-40123452-9', telefono: '1198765433', direccion: 'Las Heras 789', ciudad: 'La Plata', provincia: 'Buenos Aires', cp: '1900' },
  { email: 'User3@gmail.com', nombre: 'Usuario', apellido: 'Tres', dni: '40123453', cuit: '20-40123453-9', telefono: '1198765434', direccion: 'San Martín 123', ciudad: 'Mendoza', provincia: 'Mendoza', cp: '5500' },
];

// Administradores enriquecidos
const administradores = [
  { email: 'Admin1@gmail.com', nombre: 'Administrador', apellido: 'Uno', dni: '10123451', cuit: '20-10123451-9', telefono: '1188888888', direccion: 'Florida 100', ciudad: 'San Nicolás', provincia: 'Ciudad Autónoma de Buenos Aires', cp: '1005' },
  { email: 'Admin2@gmail.com', nombre: 'Administrador', apellido: 'Dos', dni: '10123452', cuit: '20-10123452-9', telefono: '1199999999', direccion: 'Av. de Mayo 200', ciudad: 'San Nicolás', provincia: 'Ciudad Autónoma de Buenos Aires', cp: '1084' },
];

const deportesDisponibles = [
  { nombre: 'Fútbol 5', descripcion: 'Fútbol 5 vs 5' },
  { nombre: 'Fútbol 7', descripcion: 'Fútbol 7 vs 7' },
  { nombre: 'Fútbol 11', descripcion: 'Fútbol 11 vs 11' },
  { nombre: 'Básquet', descripcion: 'Básquetbol' },
  { nombre: 'Tenis', descripcion: 'Tenis individual' },
  { nombre: 'Vóley', descripcion: 'Voleibol' },
  { nombre: 'Pádel', descripcion: 'Pádel tenis' },
  { nombre: 'Natación', descripcion: 'Natación' },
  { nombre: 'Golf', descripcion: 'Golf' },
];

async function seedDatabase() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL || process.env.DB_SSL === 'true'
      ? { rejectUnauthorized: false }
      : false,
    ...(!process.env.DATABASE_URL && {
      host: process.env.DB_HOST || 'API_URL',
      port: parseInt(process.env.DB_PORT || '5432'),
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'canchasya'
    })
  });

  try {
    await client.connect();
    console.log('🌱 Iniciando seed de datos compatible con PostgreSQL...\n');

    // Paso 1: Crear deportes si no existen
    console.log('📚 Creando deportes...');
    const deportesMap = {};
    
    for (const deporte of deportesDisponibles) {
      const querySafe = `
        INSERT INTO deporte (nombre_deporte, descripcion_deporte)
        SELECT $1, $2
        WHERE NOT EXISTS (SELECT 1 FROM deporte WHERE nombre_deporte = $1)
      `;
      await client.query(querySafe, [deporte.nombre, deporte.descripcion]);
      
      // Obtener el ID del deporte
      const res = await client.query('SELECT id_deporte FROM deporte WHERE nombre_deporte = $1', [deporte.nombre]);
      deportesMap[deporte.nombre] = res.rows[0].id_deporte;
    }
    console.log(`✅ Deportes creados/verificados: ${Object.keys(deportesMap).length}\n`);

    let usuariosCreados = 0;
    let clubesCreados = 0;
    let chanchasCreadas = 0;
    let usuariosComId = 0;
    let administradoresCreados = 0;

    // Paso 2: Crear administradores
    console.log('👨‍💼 Creando administradores...');
    for (const admin of administradores) {
      const userQuery = `
        INSERT INTO "user" 
        (nombre_usuario, apellido_usuario, email_usuario, password_usuario, telefono_usuario, dni_usuario, "CUIT_usuario", direccion_usuario, ciudad_usuario, provincia_usuario, cp_usuario, tipo_usuario, estado_usuario)
        SELECT $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'admin', 'activo'
        WHERE NOT EXISTS (SELECT 1 FROM "user" WHERE email_usuario = $3)
      `;
      
      try {
        const res = await client.query(userQuery, [
          admin.nombre,
          admin.apellido,
          admin.email,
          'asd',
          admin.telefono,
          admin.dni,
          admin.cuit,
          admin.direccion,
          admin.ciudad,
          admin.provincia,
          admin.cp
        ]);
        
        if (res.rowCount > 0) {
          administradoresCreados++;
          console.log(`  ✓ Admin: ${admin.email}`);
        } else {
          console.log(`  ⚠️  Admin ${admin.email} ya existe`);
        }
      } catch (error) {
        throw error;
      }
    }
    console.log(`✅ Administradores procesados.\n`);

    // Paso 3: Crear usuarios comunes
    console.log('👥 Creando usuarios comunes...');
    for (const usuario of usuariosComunes) {
      const userQuery = `
        INSERT INTO "user" 
        (nombre_usuario, apellido_usuario, email_usuario, password_usuario, telefono_usuario, dni_usuario, "CUIT_usuario", direccion_usuario, ciudad_usuario, provincia_usuario, cp_usuario, tipo_usuario, estado_usuario)
        SELECT $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'usuario', 'activo'
        WHERE NOT EXISTS (SELECT 1 FROM "user" WHERE email_usuario = $3)
      `;
      
      try {
        const res = await client.query(userQuery, [
          usuario.nombre,
          usuario.apellido,
          usuario.email,
          'asd',
          usuario.telefono,
          usuario.dni,
          usuario.cuit,
          usuario.direccion,
          usuario.ciudad,
          usuario.provincia,
          usuario.cp
        ]);
        
        if (res.rowCount > 0) {
          usuariosComId++;
          console.log(`  ✓ Usuario: ${usuario.email}`);
        } else {
          console.log(`  ⚠️  Usuario ${usuario.email} ya existe`);
        }
      } catch (error) {
        throw error;
      }
    }
    console.log(`✅ Usuarios comunes procesados.\n`);

    // Paso 4: Crear dueños de club y clubes
    console.log('🏟️  Creando clubes...');
    for (const club of clubesData) {
      // Crear usuario (dueño) - intentar insertar
      const userQuery = `
        INSERT INTO "user" 
        (nombre_usuario, apellido_usuario, email_usuario, password_usuario, telefono_usuario, dni_usuario, "CUIT_usuario", direccion_usuario, ciudad_usuario, provincia_usuario, cp_usuario, tipo_usuario, estado_usuario)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'dueno', 'activo')
        ON CONFLICT (email_usuario) DO NOTHING
        RETURNING id_usuario
      `;
      
      try {
        const res = await client.query(userQuery, [
          club.nombreOwner,
          club.apellidoOwner,
          club.email,
          club.password,
          club.telefono,
          club.dni,
          club.cuit,
          club.direccion,
          club.ciudad,
          club.provincia,
          club.cp
        ]);
        
        let userId;
        if (res.rows.length > 0) {
          userId = res.rows[0].id_usuario;
          usuariosCreados++;
          console.log(`  ✓ Dueño: ${club.email} (ID: ${userId})`);
        } else {
          const existingUser = await client.query(
            'SELECT id_usuario FROM "user" WHERE email_usuario = $1',
            [club.email]
          );
          if (existingUser.rows.length > 0) {
            userId = existingUser.rows[0].id_usuario;
            console.log(`  ⚠️  Dueño ${club.email} ya existe (ID: ${userId})`);
          } else {
            console.log(`  ❌ No se pudo obtener el ID del dueño ${club.email}, saltando...\n`);
            continue;
          }
        }

        // Verificar si el club ya existe para este dueño
        const existingClub = await client.query(
          'SELECT id_club FROM club WHERE id_dueno = $1',
          [userId]
        );

        let clubId;
        if (existingClub.rows.length > 0) {
          clubId = existingClub.rows[0].id_club;
          console.log(`    ⚠️  Club para dueño ${club.email} ya existe (ID: ${clubId}), saltando club y canchas...\n`);
          continue;
        }

        // Crear club
        const deportesJson = JSON.stringify(club.deportes);
        const clubQuery = `
          INSERT INTO club 
          (nombre_club, deportes_club, direccion_club, ciudad_club, provincia_club, cp_club, telefono_club, id_dueno, estado)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'activo')
          RETURNING id_club
        `;
        
        const clubResult = await client.query(clubQuery, [
          club.nombre,
          deportesJson,
          club.direccion,
          club.ciudad,
          club.provincia,
          club.cp,
          club.telefono,
          userId
        ]);
        
        clubId = clubResult.rows[0].id_club;
        clubesCreados++;
        console.log(`    └─ Club: ${club.nombre} (ID: ${clubId})`);

        // Crear canchas para cada deporte del club
        for (const cancha of club.canchas) {
          const canchaQuery = `
            INSERT INTO cancha 
            (nombre_cancha, descripcion_cancha, precio_por_hora, id_club, id_deporte, activa, direccion_cancha, ciudad_cancha, provincia_cancha, cp_cancha)
            VALUES ($1, $2, $3, $4, $5, 1, $6, $7, $8, $9)
          `;
          
          const deporteId = deportesMap[cancha.deporte];
          if (!deporteId) {
            console.log(`      ⚠️  Deporte "${cancha.deporte}" no encontrado, saltando cancha "${cancha.nombre}"`);
            continue;
          }
          await client.query(canchaQuery, [
            cancha.nombre,
            `Cancha de ${cancha.deporte}`,
            cancha.precio,
            clubId,
            deporteId,
            club.direccion,
            club.ciudad,
            club.provincia,
            club.cp
          ]);
          
          chanchasCreadas++;
        }
        
        console.log(`      └─ ${club.canchas.length} canchas creadas\n`);

      } catch (error) {
        console.log(`  ❌ Error con club ${club.email}: ${error.message}\n`);
      }
    }

    console.log('\n✅ Seed completado exitosamente!\n');
    console.log(`📊 Resumen:`);
    console.log(`  ✓ Administradores: ${administradoresCreados}`);
    console.log(`  ✓ Usuarios comunes: ${usuariosComId}`);
    console.log(`  ✓ Dueños de club: ${usuariosCreados}`);
    console.log(`  ✓ Clubes: ${clubesCreados}`);
    console.log(`  ✓ Canchas: ${chanchasCreadas}`);
    console.log(`  ✓ Deportes: ${Object.keys(deportesMap).length}`);
    console.log(`\n🔐 Contraseña para todos: "asd"\n`);
    console.log(`📝 Credenciales:\n`);
    console.log(`  Administradores:`);
    administradores.forEach(a => console.log(`    - ${a.email}`));
    console.log(`\n  Usuarios comunes:`);
    usuariosComunes.forEach(u => console.log(`    - ${u.email}`));
    console.log(`\n  Clubes (dueños):`);
    clubesData.forEach(c => console.log(`    - ${c.email}`));
    console.log();

  } catch (error) {
    console.error('❌ Error durante el seed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Ejecutar seed
seedDatabase();
