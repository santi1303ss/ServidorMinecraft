import { Injectable, NotFoundException } from "@nestjs/common";

const SUPPORTED_VERSIONS: Record<string, string[]> = {
  vanilla: ["1.21.1", "1.20.4", "1.20.1"],
  fabric: ["1.21.1", "1.20.4", "1.20.1"],
  forge: ["1.21.1", "1.20.4", "1.20.1"],
  neoforge: ["1.21.1", "1.20.4", "1.20.1"],
};

@Injectable()
export class VersionsService {
  findByEngine(engine: string) {
    const versions = SUPPORTED_VERSIONS[engine];
    if (!versions) throw new NotFoundException(`Engine "${engine}" not found`);
    return versions.map((v) => ({ version: v, type: engine, stable: true }));
  }
}
