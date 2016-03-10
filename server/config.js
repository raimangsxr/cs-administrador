module.exports = {
  /* Servers */
  dbUser: 'dbadmin',
  dbPass: 'S1l3nu5',
  dbIp: '192.168.246.151',
  dbPort: '27017',
  
  csAdministratorDatabase: 'cs-administrador-database',

  /* Directories */
  csInputFilesRoot: '/opt/CS/var/tmp/CS/',
  csOutputFilesRoot: '/tmp/',
  
  relativeInputDirectories: {
    cierres: '/CS-entrada/cierres/',
    curvas: '/CS-entrada/curvas/',
    'cambios-inv': '/CS-entrada/inventario/',
    inv: '/CS-entrada/inventario/',
    interobjedistrib: '/CS-entrada/respuestas-REE-objeciones/',
    aobjeagcl: '/CS-entrada/',
    bad2: '/CS-entrada/'
  },
  
  /* Compression Files */
  filesWithoutCompression: ['interobjedistrib', 'bad2']
};