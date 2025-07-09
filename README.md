<h1 align="center">LatticeJS</h1>

<div align="center">
    <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-blue">
    <img alt="npm" src="https://img.shields.io/badge/npm-v10.2.3-orange">
    <img alt="Node.js" src="https://img.shields.io/badge/Node.js-v18.19.0-green">
    <img alt="Coverage" src="https://wylu1037.github.io/lattice-js/badges/coverage.svg">
</div>

## Overview

LatticeJS is a comprehensive SDK implemented in TypeScript for blockchain interactions with the Lattice network. This library provides a set of tools for cryptographic operations, wallet management, and blockchain communication.

## Features

- **Dual Module Support**: Full support for both CommonJS and ES Modules (CJS + ESM)
- **Cryptographic Suite**: Full implementation of SM2, SM3, and SM4 cryptographic algorithms
- **Ethereum Compatibility**: Built with ethers.js components for seamless Ethereum integration
- **Wallet Management**: Secure key generation and management
- **Provider System**: Flexible connection to various blockchain nodes
- **Robust Logging**: Built-in logging system with rotation capabilities
- **TypeScript First**: Complete type definitions for enhanced development experience

## Installation

```bash
npm install @zlattice/lattice-js

# or with pnpm
pnpm add @zlattice/lattice-js
```

## Module Support

This library supports both module systems:

- **ES Modules (ESM)**: Modern `import` syntax with tree-shaking support
- **CommonJS (CJS)**: Traditional `require()` syntax for Node.js compatibility

Node.js will automatically choose the appropriate format based on your project configuration.

### Quick Start

```typescript
// ESM
import { LatticeClient, Address, Curves } from '@zlattice/lattice-js';

// CJS
const { LatticeClient, Address, Curves } = require('@zlattice/lattice-js');

const client = new LatticeClient({ rpcUrl: 'http://localhost:8000' });
const address = new Address('zltc_QLbz7JHiBTspS962RLKV8GndWFwjA5K66');
```

For detailed usage examples, see [examples/README.md](examples/README.md).

## Core Dependencies

- [Ethers Components](https://docs.ethers.org/v5/) - Ethereum utilities and cryptography
- [Noble Curves](https://github.com/paulmillr/noble-curves) - High-security, easily auditable elliptic curve cryptography
- [Noble Hashes](https://github.com/paulmillr/noble-hashes) - Secure, auditable hashing implementations
- [Axios](https://github.com/axios/axios) - Promise-based HTTP client for browser and Node.js
- [Pino](https://github.com/pinojs/pino) - Super fast, all-natural JSON logger
- [Zod](https://github.com/colinhacks/zod) - TypeScript-first schema validation

## Testing

This project uses [Vitest](https://vitest.dev/) for testing with coverage reporting:

```bash
# Run tests
npm test

# Run tests with coverage
npm run coverage

# Watch mode for development
npm run test:watch
```

If you encounter module-related issues, try cleaning your dependencies:

```bash
rm -rf node_modules
npm cache clean --force
npm install
```

## Documentation

Comprehensive documentation is being built with [VitePress](https://vitepress.dev/).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the Apache-2.0 License - see the [LICENSE](LICENSE) file for details.
