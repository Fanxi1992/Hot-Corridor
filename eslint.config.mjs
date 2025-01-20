import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: ['.next/*', 'node_modules/*']  // 添加忽略配置
  },
  ...compat.config({
    extends: ["next/core-web-vitals"]  // 修改配置方式
  })
];

export default eslintConfig;
