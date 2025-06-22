// Type definitions for modules without type definitions
declare module 'react' {
  export = React;
  export as namespace React;
}

declare module 'react/jsx-runtime' {
  const content: string;
  export default content;
}

// Add any other missing module declarations here
