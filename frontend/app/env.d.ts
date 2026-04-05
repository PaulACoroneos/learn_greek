// Allow importing CSS files as side effects
declare module '*.css' {}

// Allow importing CSS files as URLs via Vite's ?url suffix
declare module '*.css?url' {
  const url: string
  export default url
}
