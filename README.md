# Screwdriver Kubernetes Executor
[![Version][npm-image]][npm-url] ![Downloads][downloads-image] [![Build Status][wercker-image]][wercker-url] [![Open Issues][issues-image]][issues-url] [![Dependency Status][daviddm-image]][daviddm-url] ![License][license-image]

> Kubernetes Executor plugin for Screwdriver

## Usage

```bash
npm install screwdriver-executor-k8s
```

```javascript
let Executor = require('screwdriver-executor-k8s');
let execute = new Executor({
    host: '10.0.0.50', // Defaults to kubernetes
    token: 'token',
    strictSSL: false // Defaults to true
});

// Start a build
execute.start({
    pipelineId: '992b5d666718483c9676361ebc685d122089e3eb',
    jobId: '10fe0e40a62253967148ba17752d76d5912bf6b7',
    buildId: 'd4391eea7f0a67fe788a05bb07de33e793134296',
    scmUrl: 'git@github.com:screwdriver-cd/executor-k8s',
    container: 'node:4'
}, (err) => {
    console.error(err);
});

// Stream the logs
execute.logStream({
    buildId: 'd4391eea7f0a67fe788a05bb07de33e793134296'
}, (err, stream) => {
    console.error(err);
    resp.pipe(stream);
});
```

## Testing

```bash
npm test
```

## License

Code licensed under the BSD 3-Clause license. See LICENSE file for terms.

[npm-image]: https://img.shields.io/npm/v/screwdriver-executor-k8s.svg
[npm-url]: https://npmjs.org/package/screwdriver-executor-k8s
[downloads-image]: https://img.shields.io/npm/dt/screwdriver-executor-k8s.svg
[license-image]: https://img.shields.io/npm/l/screwdriver-executor-k8s.svg
[issues-image]: https://img.shields.io/github/issues/screwdriver-cd/executor-k8s.svg
[issues-url]: https://github.com/screwdriver-cd/executor-k8s/issues
[wercker-image]: https://app.wercker.com/status/6eee5facca93cb34510bf36d814460e8
[wercker-url]: https://app.wercker.com/project/bykey/6eee5facca93cb34510bf36d814460e8
[daviddm-image]: https://david-dm.org/screwdriver-cd/executor-k8s.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/screwdriver-cd/executor-k8s
