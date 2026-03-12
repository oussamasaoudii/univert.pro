import mysql from 'mysql2/promise';

async function main() {
  const config = {
    host: process.env.MYSQL_HOST,
    port: parseInt(process.env.MYSQL_PORT || '4000', 10),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: 'ovmon',
    ssl: {
      minVersion: 'TLSv1.2',
      rejectUnauthorized: true,
    },
  };

  console.log('Config:', {
    host: config.host,
    port: config.port,
    user: config.user,
    database: config.database,
    password: config.password ? '***set***' : '***NOT SET***'
  });

  try {
    console.log('\nConnecting...');
    const connection = await mysql.createConnection(config);
    console.log('Connected!');

    // Check what tables exist
    console.log('\nChecking existing tables...');
    const [tables] = await connection.query('SHOW TABLES');
    console.log('Tables:', tables);

    // Check user grants
    console.log('\nChecking user grants...');
    const [grants] = await connection.query('SHOW GRANTS');
    console.log('Grants:', grants);

    await connection.end();
    console.log('\nDone!');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
