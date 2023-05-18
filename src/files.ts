import * as path from "path";
import * as fs from "fs";
import { TranslationFile } from "./translate.interface";

export interface IFiles {
  sourceLocale: string;
  targetLocales: Array<string>;
  loadJsonFromLocale(locale: string): Promise<TranslationFile>;
  saveJsonToLocale(locale: string, file: TranslationFile): void;
}

export const readFileAsync: (filename: string) => Promise<string> = (
  filename: string,
) =>
  new Promise((resolve, reject) => {
    fs.readFile(filename, (error, data) => {
      error ? reject(error) : resolve(data.toString());
    });
  });

export const loadJsonFromLocale: (
  fileName: string,
) => Promise<TranslationFile> = async (fileName: string) => {
  let data = await readFileAsync(fileName);
  // handle empty files
  if (!data) {
    data = "{}";
  }

  return JSON.parse(data);
};

export const saveJsonToLocale = (filename: string, file: TranslationFile) => {
  const data = JSON.stringify(file, null, "  ");

  fs.writeFileSync(filename, data, "utf8");
};

export class Files implements IFiles {
  folderPath: string;
  sourceLocale: string;
  targetLocales: Array<string>;

  constructor(filePath: string) {
    this.folderPath = path.dirname(filePath);
    const fileName = path.basename(filePath);
    this.sourceLocale = this.getLocaleFromFilename(fileName);
    this.targetLocales = this.getTargetLocales();
  }

  private getLocaleFromFilename(fileName: string): string {
    return fileName.replace(".json", "");
  }

  private getTargetLocales(): string[] {
    const locales = new Array();

    const files = fs.readdirSync(this.folderPath);

    files.forEach((file) => {
      const locale = this.getLocaleFromFilename(file);
      if (locale !== this.sourceLocale) {
        locales.push(locale);
      }
    });

    return locales;
  }

  loadJsonFromLocale(locale: string): Promise<TranslationFile> {
    const filename = `${this.folderPath}/${locale}.json`;
    return loadJsonFromLocale(filename);
  }

  saveJsonToLocale(locale: string, file: TranslationFile) {
    const filename = `${this.folderPath}/${locale}.json`;

    saveJsonToLocale(filename, file);
  }
}
