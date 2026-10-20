export interface Template {
  id: string
  title: string
  template: string
}

//backup
export interface BackupFile {
  app: "my-templater"
  schemaVersion: number
  exportedAt: string
  templates: Template[]
}
