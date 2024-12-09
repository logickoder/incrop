declare global {
  namespace Vike {
    interface PageContext {
      args?: any;
    }
  }
}

// If you define Vike.PageContext in a .d.ts file then
// make sure there is at least one export/import statement.
// Tell TypeScript this file isn't an ambient module:
export {};