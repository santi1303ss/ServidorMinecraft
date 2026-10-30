import * as fs from "fs";
import * as path from "path";
import * as os from "os";

export function detectJavaVersions(): { name: string; path: string }[] {
  const javaPaths: { name: string; path: string }[] = [];
  const platform = os.platform();

  const candidates: string[] = [];
  if (platform === "win32") {
    const pf = process.env["PROGRAMFILES"] || "C:\\Program Files";
    const pf86 = process.env["PROGRAMFILES(X86)"] || "C:\\Program Files (x86)";
    candidates.push(
      path.join(pf, "Eclipse Adoptium"),
      path.join(pf86, "Eclipse Adoptium"),
      path.join(pf, "AdoptOpenJDK"),
      path.join(pf86, "AdoptOpenJDK"),
      path.join(pf, "Java"),
      path.join(os.homedir(), "AppData", "Local", "Programs", "Eclipse Adoptium"),
    );
  } else if (platform === "linux") {
    candidates.push(
      "/usr/lib/jvm",
      "/usr/java",
      "/usr/local/java",
      path.join(os.homedir(), ".sdkman", "candidates", "java"),
    );
  } else if (platform === "darwin") {
    candidates.push(
      "/Library/Java/JavaVirtualMachines",
      "/System/Library/Frameworks/JavaVM.framework/Versions",
    );
  }

  const javaBin = platform === "win32" ? "java.exe" : "java";

  for (const dir of candidates) {
    if (!fs.existsSync(dir)) continue;
    for (const entry of fs.readdirSync(dir)) {
      const javaExe = path.join(dir, entry, "bin", javaBin);
      if (fs.existsSync(javaExe)) {
        javaPaths.push({ name: entry, path: javaExe });
      }
    }
  }
  return javaPaths;
}
