module.exports = {
  /* Servers */
  dbUser: 'csadmin',
  dbPass: 'csp455',
  //dbIp: '192.168.246.151',
  dbIp: '192.168.0.150',
  dbPort: '27017',

  auditCollectionName: 'entradaAuditoria',

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
    'interobjedistrib',
    'reinterobjedistrib',
    'bad2',
    'curvas-telemedida',
    '15curvas-telemedida',
  ]
};