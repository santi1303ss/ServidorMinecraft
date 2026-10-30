export interface CreateServerDto {
  name: string;
  engine?: string;
  version?: string;
  gameDir?: string;
  maxRam?: string;
  javaExec?: string;
  jvmArgs?: string;
}

export interface UpdateServerDto {
  name?: string;
  engine?: string;
  version?: string;
  gameDir?: string;
  maxRam?: string;
  javaExec?: string;
  jvmArgs?: string;
}
