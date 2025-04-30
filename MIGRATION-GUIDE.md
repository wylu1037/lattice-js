# 从 Mocha/Chai 迁移到 Vitest 指南

这个指南将帮助你将项目从 Mocha 和 Chai 测试框架迁移到 Vitest。Vitest 提供了与 Jest 兼容的 API，同时也兼容 Mocha 风格的测试编写方式，因此迁移过程相对简单。

## 迁移步骤

### 1. 安装 Vitest

首先，安装 Vitest 作为开发依赖：

```bash
npm install -D vitest
```

或使用 yarn:

```bash
yarn add -D vitest
```

### 2. 创建 Vitest 配置文件

在项目根目录创建 `vitest.config.ts`（或 `.js`）文件：

```typescript
/// <reference types="vitest/config" />
import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'url';

export default defineConfig({
  test: {
    // 支持全局API，不需要导入describe, it, expect等
    globals: true,
    
    // 指定测试文件路径模式
    include: ['tests/**/*.test.ts'],
    
    // 使用Node环境，与Mocha类似
    environment: 'node',
    
    // 启用Chai断言库支持
    deps: {
      inline: [/chai/],
    },
  },
  
  // 配置别名，与tsconfig.json中的paths保持一致
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
```

### 3. 更新 TypeScript 配置

在 `tsconfig.json` 中添加 Vitest 全局类型支持：

```json
{
  "compilerOptions": {
    // ... 其他配置 ...
    "types": ["vitest/globals", "node"],
  }
}
```

### 4. 更新 NPM 脚本

在 `package.json` 中更新测试相关脚本：

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "coverage": "vitest run --coverage"
  }
}
```

### 5. 测试是否正常工作

运行测试命令验证迁移是否成功：

```bash
npm test
```

### 6. 移除旧依赖（可选）

迁移成功后，可以移除原有的 Mocha 和相关工具：

```bash
npm uninstall mocha chai c8 ts-mocha @types/mocha @types/chai
```

## 测试代码无需修改

由于 Vitest 完全兼容 Mocha 风格的 API，你的测试文件通常不需要修改。Vitest 会自动识别并支持以下模式：

- `describe()` 和 `it()`/`test()` 函数
- `beforeEach()`、`afterEach()`、`beforeAll()`、`afterAll()` 钩子
- Chai 的 `expect` 断言

如果你的测试中使用了 Mocha 或 Chai 的特定功能，可能需要小幅调整。

## 使用 Vitest 的额外好处

迁移后，你将获得 Vitest 提供的额外好处：

1. 更快的执行速度
2. 内置的监视模式和热重载
3. 内置的覆盖率报告
4. 更好的 ESM 和 TypeScript 支持
5. 与 Vite 生态系统的兼容性

## 排查问题

如果遇到问题，请参考 [Vitest 官方文档](https://cn.vitest.dev/guide/)。 