interface ImportMetaEnv {
  readonly SITE_MODE: 'production' | 'preview';
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
