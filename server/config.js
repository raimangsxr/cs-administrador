module.exports = {
  /* Servers */
  dbUser: 'csadmin',
  dbPass: 'csp455',
  // dbIp: '192.168.246.51',
  dbIp: '192.168.5.151',
  dbPort: '27017',

  auditCollectionName: 'entradaAuditoria',
  inputFsCollectionName: 'inputFs.files',
  objeCollectionName: 'objecionIntercambioDistribuidor',

  ftpRootDir: '/home',
  REINTEROBJEDISTRIB_DIR: 'CS-entrada/respuestas-REE-objeciones',

  csAdministratorDatabase: 'cs-administrador-database',

  /* Directories */
  /*
  csInputFilesRoot: '/opt/CS/var/tmp/CS/',
  csOutputFilesRoot: '/tmp/',
  
  relativeInputDirectories: {
    reinterobjedistrib: '/CS-entrada/respuestas-REE-objeciones/',
    inv: '/CS-entrada/inventario/',
    'cambios-inv': '/CS-entrada/inventario/',
    curvas: '/CS-entrada/curvas/',
    cierres: '/CS-entrada/cierres/'
  },

  REEInputDir: 'REE/CS-entrada/',
  REEInputFileTypes: [
    'autobjeinme',
    'autobjeagcl',
    'aobjeinme',
    'aobjeagcl',
    'arevac',
    'bad2'
  ],
  */
  /* Compression Files */
  filesWithoutCompression: [
//    'interobjedistrib',
    'reinterobjedistrib',
    'bad2',
    'curvas-telemedida',
    '15curvas-telemedida',
  ]
};
