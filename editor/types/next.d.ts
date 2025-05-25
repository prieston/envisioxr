declare module "next/dynamic" {
  export default function dynamic<T>(
    dynamicOptions: () => Promise<{ default: T }>,
    options?: {
      loading?: React.ComponentType;
      ssr?: boolean;
      suspense?: boolean;
    }
  ): T;
}
