exports.dbConnStr = 'postgres://odd_admin:Bko9tu39@localhost:5432/odd';

exports.port = {
  production: 8080,
  development: 8086
};

exports.vtRequestUrl = {
  internal: 'http://localhost:%d/%s/%d/%d/%d.mvt',
  external: {
    development: 'http://localhost:8086/vt/%s/{z}/{x}/{y}.mvt',
    production: 'http://www.opendatadiscovery.org/vt/%s/{z}/{x}/{y}.mvt'
  }
};
